"""Remove orphaned files from an unpacked PPTX directory.

Removes:
- Slides not referenced in <p:sldIdLst>
- Unreferenced media, charts, diagrams, drawings
- Orphaned .rels files
- Updates [Content_Types].xml to match

Usage:
    python clean.py <unpacked_dir>

Example:
    python clean.py unpacked/
"""

import re
import sys
from pathlib import Path

import defusedxml.minidom


def get_referenced_slide_names(unpacked_dir: Path) -> set[str]:
    """Return slide filenames referenced in presentation.xml sldIdLst."""
    pres_rels = unpacked_dir / "ppt" / "_rels" / "presentation.xml.rels"
    pres_xml = unpacked_dir / "ppt" / "presentation.xml"

    if not pres_rels.exists() or not pres_xml.exists():
        return set()

    rels_dom = defusedxml.minidom.parse(str(pres_rels))
    rid_to_name = {}
    for rel in rels_dom.getElementsByTagName("Relationship"):
        rid = rel.getAttribute("Id")
        target = rel.getAttribute("Target")
        rel_type = rel.getAttribute("Type")
        if "slide" in rel_type and target.startswith("slides/"):
            rid_to_name[rid] = target.replace("slides/", "")

    pres_content = pres_xml.read_text(encoding="utf-8")
    referenced_rids = set(re.findall(r'<p:sldId[^>]+r:id="([^"]+)"', pres_content))
    return {rid_to_name[rid] for rid in referenced_rids if rid in rid_to_name}


def get_all_referenced_files(unpacked_dir: Path) -> set[Path]:
    """Return all files referenced in any .rels file."""
    referenced = set()
    for rels_file in unpacked_dir.rglob("*.rels"):
        try:
            dom = defusedxml.minidom.parse(str(rels_file))
            for rel in dom.getElementsByTagName("Relationship"):
                target = rel.getAttribute("Target")
                if not target:
                    continue
                resolved = (rels_file.parent.parent / target).resolve()
                try:
                    referenced.add(resolved.relative_to(unpacked_dir.resolve()))
                except ValueError:
                    pass
        except Exception:
            pass
    return referenced


def remove_orphaned_slides(unpacked_dir: Path) -> list[str]:
    slides_dir = unpacked_dir / "ppt" / "slides"
    rels_dir = slides_dir / "_rels"
    pres_rels = unpacked_dir / "ppt" / "_rels" / "presentation.xml.rels"

    if not slides_dir.exists():
        return []

    referenced = get_referenced_slide_names(unpacked_dir)
    removed = []

    for slide in slides_dir.glob("slide*.xml"):
        if slide.name not in referenced:
            slide.unlink()
            removed.append(str(slide.relative_to(unpacked_dir)))
            rels = rels_dir / f"{slide.name}.rels"
            if rels.exists():
                rels.unlink()
                removed.append(str(rels.relative_to(unpacked_dir)))

    # Prune presentation.xml.rels of removed slides
    if removed and pres_rels.exists():
        content = pres_rels.read_text(encoding="utf-8")
        for name in [r.replace("ppt/slides/", "") for r in removed if "slides/slide" in r]:
            content = re.sub(
                rf'\s*<Relationship[^>]*Target="slides/{re.escape(name)}"[^/]*/>\s*',
                "\n",
                content,
            )
        pres_rels.write_text(content, encoding="utf-8")

    return removed


def remove_orphaned_resources(unpacked_dir: Path) -> list[str]:
    referenced = get_all_referenced_files(unpacked_dir)
    resource_dirs = ["media", "embeddings", "charts", "diagrams", "drawings"]
    removed = []

    for dir_name in resource_dirs:
        d = unpacked_dir / "ppt" / dir_name
        if not d.exists():
            continue
        for f in d.glob("*"):
            if not f.is_file():
                continue
            rel = f.relative_to(unpacked_dir)
            if rel not in referenced:
                f.unlink()
                removed.append(str(rel))

    return removed


def update_content_types(unpacked_dir: Path, removed: list[str]) -> None:
    ct = unpacked_dir / "[Content_Types].xml"
    if not ct.exists() or not removed:
        return

    dom = defusedxml.minidom.parse(str(ct))
    changed = False
    for override in list(dom.getElementsByTagName("Override")):
        part = override.getAttribute("PartName").lstrip("/")
        if part in removed:
            override.parentNode.removeChild(override)
            changed = True

    if changed:
        ct.write_bytes(dom.toxml(encoding="utf-8"))


def clean(unpacked_dir: Path) -> list[str]:
    all_removed = []
    all_removed.extend(remove_orphaned_slides(unpacked_dir))

    # Iterate until stable — removing a file may orphan others
    while True:
        removed = remove_orphaned_resources(unpacked_dir)
        if not removed:
            break
        all_removed.extend(removed)

    if all_removed:
        update_content_types(unpacked_dir, all_removed)

    return all_removed


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python clean.py <unpacked_dir>", file=sys.stderr)
        sys.exit(1)

    d = Path(sys.argv[1])
    if not d.exists():
        print(f"Error: {d} not found", file=sys.stderr)
        sys.exit(1)

    removed = clean(d)

    if removed:
        print(f"Removed {len(removed)} orphaned files:")
        for f in removed:
            print(f"  {f}")
    else:
        print("No orphaned files found")
