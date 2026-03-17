"""Add a slide to an unpacked PPTX directory.

Can duplicate an existing slide or create a blank slide from a layout.
Handles all bookkeeping: Content_Types.xml, presentation.xml.rels, relationship files.
Prints the <p:sldId> line to add to presentation.xml manually.

Usage:
    python add_slide.py <unpacked_dir> <source>

Source options:
    slide2.xml          — duplicate an existing slide
    slideLayout2.xml    — create a blank slide using this layout

Example:
    python add_slide.py unpacked/ slide3.xml
    python add_slide.py unpacked/ slideLayout1.xml

To see available layouts:
    ls unpacked/ppt/slideLayouts/
"""

import re
import shutil
import sys
from pathlib import Path


def next_slide_number(slides_dir: Path) -> int:
    nums = [
        int(m.group(1))
        for f in slides_dir.glob("slide*.xml")
        if (m := re.match(r"slide(\d+)\.xml", f.name))
    ]
    return max(nums) + 1 if nums else 1


def next_slide_id(unpacked_dir: Path) -> int:
    pres = (unpacked_dir / "ppt" / "presentation.xml").read_text(encoding="utf-8")
    ids = [int(m) for m in re.findall(r'<p:sldId[^>]+id="(\d+)"', pres)]
    return max(ids) + 1 if ids else 256


def next_rel_id(pres_rels_path: Path) -> str:
    content = pres_rels_path.read_text(encoding="utf-8")
    nums = [int(m) for m in re.findall(r'Id="rId(\d+)"', content)]
    return f"rId{max(nums) + 1}" if nums else "rId1"


def register_in_content_types(unpacked_dir: Path, slide_name: str) -> None:
    ct_path = unpacked_dir / "[Content_Types].xml"
    content = ct_path.read_text(encoding="utf-8")
    part = f"/ppt/slides/{slide_name}"
    content_type = "application/vnd.openxmlformats-officedocument.presentationml.slide+xml"
    if part not in content:
        entry = f'<Override PartName="{part}" ContentType="{content_type}"/>'
        content = content.replace("</Types>", f"  {entry}\n</Types>")
        ct_path.write_text(content, encoding="utf-8")


def register_in_pres_rels(unpacked_dir: Path, slide_name: str) -> str:
    rels_path = unpacked_dir / "ppt" / "_rels" / "presentation.xml.rels"
    rid = next_rel_id(rels_path)
    content = rels_path.read_text(encoding="utf-8")
    ns = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide"
    entry = f'<Relationship Id="{rid}" Type="{ns}" Target="slides/{slide_name}"/>'
    if f"slides/{slide_name}" not in content:
        content = content.replace("</Relationships>", f"  {entry}\n</Relationships>")
        rels_path.write_text(content, encoding="utf-8")
    return rid


def duplicate_slide(unpacked_dir: Path, source: str) -> None:
    slides_dir = unpacked_dir / "ppt" / "slides"
    rels_dir = slides_dir / "_rels"
    source_slide = slides_dir / source

    if not source_slide.exists():
        print(f"Error: {source_slide} not found", file=sys.stderr)
        sys.exit(1)

    n = next_slide_number(slides_dir)
    dest_name = f"slide{n}.xml"
    dest_slide = slides_dir / dest_name
    dest_rels = rels_dir / f"{dest_name}.rels"

    shutil.copy2(source_slide, dest_slide)

    source_rels = rels_dir / f"{source}.rels"
    if source_rels.exists():
        shutil.copy2(source_rels, dest_rels)
        # Remove notes slide references — they'd be orphaned copies
        rels_content = dest_rels.read_text(encoding="utf-8")
        rels_content = re.sub(r'\s*<Relationship[^>]*notesSlide[^>]*/>\s*', "\n", rels_content)
        dest_rels.write_text(rels_content, encoding="utf-8")

    register_in_content_types(unpacked_dir, dest_name)
    rid = register_in_pres_rels(unpacked_dir, dest_name)
    slide_id = next_slide_id(unpacked_dir)

    print(f"Created {dest_name} from {source}")
    print(f'Add to <p:sldIdLst> in presentation.xml: <p:sldId id="{slide_id}" r:id="{rid}"/>')


def create_from_layout(unpacked_dir: Path, layout_file: str) -> None:
    slides_dir = unpacked_dir / "ppt" / "slides"
    rels_dir = slides_dir / "_rels"
    layout_path = unpacked_dir / "ppt" / "slideLayouts" / layout_file

    if not layout_path.exists():
        print(f"Error: {layout_path} not found", file=sys.stderr)
        print(f"Available layouts: {sorted(p.name for p in (unpacked_dir / 'ppt' / 'slideLayouts').glob('*.xml'))}")
        sys.exit(1)

    n = next_slide_number(slides_dir)
    dest_name = f"slide{n}.xml"
    dest_slide = slides_dir / dest_name
    dest_rels = rels_dir / f"{dest_name}.rels"

    slide_xml = """\
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
       xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
       xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sld>"""

    layout_ns = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout"
    rels_xml = f"""\
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="{layout_ns}" Target="../slideLayouts/{layout_file}"/>
</Relationships>"""

    rels_dir.mkdir(exist_ok=True)
    dest_slide.write_text(slide_xml, encoding="utf-8")
    dest_rels.write_text(rels_xml, encoding="utf-8")

    register_in_content_types(unpacked_dir, dest_name)
    rid = register_in_pres_rels(unpacked_dir, dest_name)
    slide_id = next_slide_id(unpacked_dir)

    print(f"Created {dest_name} from layout {layout_file}")
    print(f'Add to <p:sldIdLst> in presentation.xml: <p:sldId id="{slide_id}" r:id="{rid}"/>')


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python add_slide.py <unpacked_dir> <source>", file=sys.stderr)
        print("  source: slide2.xml | slideLayout2.xml", file=sys.stderr)
        sys.exit(1)

    unpacked = Path(sys.argv[1])
    source = sys.argv[2]

    if not unpacked.exists():
        print(f"Error: {unpacked} not found", file=sys.stderr)
        sys.exit(1)

    if source.startswith("slideLayout") and source.endswith(".xml"):
        create_from_layout(unpacked, source)
    else:
        duplicate_slide(unpacked, source)
