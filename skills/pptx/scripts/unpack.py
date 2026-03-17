"""Unpack a PPTX file into editable XML.

Extracts the ZIP archive and pretty-prints all XML files for editing.

Usage:
    python unpack.py <input.pptx> <output_dir>

Example:
    python unpack.py template.pptx unpacked/
"""

import sys
import zipfile
from pathlib import Path

import defusedxml.minidom


def unpack(input_file: str, output_dir: str) -> None:
    input_path = Path(input_file)
    output_path = Path(output_dir)

    if not input_path.exists():
        print(f"Error: {input_file} not found", file=sys.stderr)
        sys.exit(1)

    if input_path.suffix.lower() != ".pptx":
        print(f"Error: {input_file} must be a .pptx file", file=sys.stderr)
        sys.exit(1)

    output_path.mkdir(parents=True, exist_ok=True)

    with zipfile.ZipFile(input_path, "r") as zf:
        zf.extractall(output_path)

    xml_files = list(output_path.rglob("*.xml")) + list(output_path.rglob("*.rels"))
    formatted = 0

    for xml_file in xml_files:
        try:
            content = xml_file.read_bytes()
            dom = defusedxml.minidom.parseString(content)
            xml_file.write_bytes(dom.toprettyxml(indent="  ", encoding="utf-8"))
            formatted += 1
        except Exception:
            pass  # leave malformed files as-is

    print(f"Unpacked {input_file} → {output_dir} ({formatted} XML files formatted)")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python unpack.py <input.pptx> <output_dir>", file=sys.stderr)
        sys.exit(1)
    unpack(sys.argv[1], sys.argv[2])
