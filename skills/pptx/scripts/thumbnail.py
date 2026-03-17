"""Create a thumbnail grid from a PPTX file for visual layout review.

Converts slides to images via LibreOffice + pdftoppm, then builds a grid.
Use this to inspect template layouts before editing.

Requires: LibreOffice (soffice), poppler-utils (pdftoppm), Pillow

Usage:
    python thumbnail.py <input.pptx> [output_prefix] [--cols N]

Examples:
    python thumbnail.py template.pptx
    python thumbnail.py template.pptx grid --cols 4
"""

import argparse
import os
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

THUMB_W = 300
DEFAULT_COLS = 3
JPEG_QUALITY = 90
PADDING = 16
LABEL_H = 18


def convert_to_images(pptx_path: Path, tmp: Path) -> list[Path]:
    """Convert PPTX to individual slide JPEGs via LibreOffice + pdftoppm."""
    env = {**os.environ, "SAL_USE_VCLPLUGIN": "svp"}
    pdf_path = tmp / f"{pptx_path.stem}.pdf"

    result = subprocess.run(
        ["soffice", "--headless", "--convert-to", "pdf", "--outdir", str(tmp), str(pptx_path)],
        capture_output=True, text=True, env=env
    )
    if result.returncode != 0 or not pdf_path.exists():
        raise RuntimeError(f"LibreOffice conversion failed:\n{result.stderr}")

    result = subprocess.run(
        ["pdftoppm", "-jpeg", "-r", "100", str(pdf_path), str(tmp / "slide")],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        raise RuntimeError(f"pdftoppm failed:\n{result.stderr}")

    return sorted(tmp.glob("slide-*.jpg"))


def make_grid(images: list[Path], cols: int, output: Path) -> None:
    if not images:
        print("Error: no slides converted", file=sys.stderr)
        sys.exit(1)

    with Image.open(images[0]) as img:
        thumb_h = int(THUMB_W * img.height / img.width)

    rows = (len(images) + cols - 1) // cols
    grid_w = cols * THUMB_W + (cols + 1) * PADDING
    grid_h = rows * (LABEL_H + thumb_h + PADDING) + PADDING

    grid = Image.new("RGB", (grid_w, grid_h), "white")
    draw = ImageDraw.Draw(grid)

    try:
        font = ImageFont.load_default(size=12)
    except Exception:
        font = ImageFont.load_default()

    for i, img_path in enumerate(images):
        row, col = i // cols, i % cols
        x = col * THUMB_W + (col + 1) * PADDING
        y = row * (LABEL_H + thumb_h + PADDING) + PADDING

        draw.text((x, y), f"slide{i + 1}", fill="#888888", font=font)

        with Image.open(img_path) as img:
            img.thumbnail((THUMB_W, thumb_h), Image.Resampling.LANCZOS)
            grid.paste(img, (x, y + LABEL_H))

    grid.save(str(output), quality=JPEG_QUALITY)
    print(f"Created {output} ({len(images)} slides, {cols} columns)")


def main() -> None:
    parser = argparse.ArgumentParser(description="Create a thumbnail grid from a PPTX file")
    parser.add_argument("input", help="Input .pptx file")
    parser.add_argument("output_prefix", nargs="?", default="thumbnails")
    parser.add_argument("--cols", type=int, default=DEFAULT_COLS, help=f"Columns (default: {DEFAULT_COLS})")
    args = parser.parse_args()

    input_path = Path(args.input)
    if not input_path.exists():
        print(f"Error: {args.input} not found", file=sys.stderr)
        sys.exit(1)

    with tempfile.TemporaryDirectory() as tmp:
        images = convert_to_images(input_path, Path(tmp))
        make_grid(images, args.cols, Path(f"{args.output_prefix}.jpg"))


if __name__ == "__main__":
    main()
