"""Pack an unpacked PPTX directory back into a .pptx file.

Condenses XML whitespace before repacking.

Usage:
    python pack.py <input_dir> <output.pptx>

Example:
    python pack.py unpacked/ output.pptx
"""

import sys
import zipfile
from pathlib import Path

import defusedxml.minidom


def condense_xml(xml_file: Path) -> bytes:
    """Remove pretty-print whitespace from XML, preserving text content."""
    try:
        dom = defusedxml.minidom.parse(str(xml_file))
        # Remove whitespace-only text nodes outside of actual text elements
        _strip_whitespace(dom.documentElement)
        return dom.toxml(encoding="UTF-8")
    except Exception:
        return xml_file.read_bytes()


def _strip_whitespace(node) -> None:
    for child in list(node.childNodes):
        if child.nodeType == child.TEXT_NODE:
            # Preserve text inside actual content elements (a:t, p:ph, etc.)
            tag = (node.localName or node.tagName).split(":")[-1]
            if tag not in ("t", "ph", "title", "body") and not child.data.strip():
                node.removeChild(child)
        elif child.nodeType == child.ELEMENT_NODE:
            _strip_whitespace(child)


def pack(input_dir: str, output_file: str) -> None:
    input_path = Path(input_dir)
    output_path = Path(output_file)

    if not input_path.is_dir():
        print(f"Error: {input_dir} is not a directory", file=sys.stderr)
        sys.exit(1)

    if output_path.suffix.lower() != ".pptx":
        print(f"Error: {output_file} must be a .pptx file", file=sys.stderr)
        sys.exit(1)

    output_path.parent.mkdir(parents=True, exist_ok=True)

    with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for f in sorted(input_path.rglob("*")):
            if not f.is_file():
                continue
            rel = f.relative_to(input_path)
            if f.suffix in (".xml", ".rels"):
                zf.writestr(str(rel).replace("\\", "/"), condense_xml(f))
            else:
                zf.write(f, str(rel).replace("\\", "/"))

    print(f"Packed {input_dir} → {output_file}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python pack.py <input_dir> <output.pptx>", file=sys.stderr)
        sys.exit(1)
    pack(sys.argv[1], sys.argv[2])
