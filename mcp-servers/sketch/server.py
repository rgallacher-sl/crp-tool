#!/usr/bin/env python3
"""MCP server: serves Excalidraw sketch files and behaviour briefs.

Exposes three tools:
  list_sketches()         — lists available .excalidraw files
  get_current_sketch()    — returns most recently modified sketch + briefs
  get_sketch(name)        — returns named sketch + briefs

Brief hierarchy:
  sketches/brief.md          — project-wide context, always loaded
  sketches/sketch-name.md    — sketch-specific notes, wins on conflicts

Configure: SKETCHES_DIR env var (default: ./sketches)
Run: python mcp-servers/sketch/server.py
"""

import json
import os
from pathlib import Path

from mcp.server.fastmcp import FastMCP

mcp = FastMCP("sketch")
SKETCHES_DIR = Path(os.environ.get("SKETCHES_DIR", "./sketches")).resolve()


def _sketches_dir() -> Path:
    if not SKETCHES_DIR.exists():
        raise FileNotFoundError(f"Sketches directory not found: {SKETCHES_DIR}")
    return SKETCHES_DIR


def _load_briefs(sketches_dir: Path, sketch_path: Path) -> dict:
    briefs = {}
    project_brief = sketches_dir / "brief.md"
    if project_brief.exists():
        briefs["project_brief"] = project_brief.read_text(encoding="utf-8")
    sketch_brief = sketch_path.with_suffix(".md")
    if sketch_brief.exists():
        briefs["sketch_brief"] = sketch_brief.read_text(encoding="utf-8")
    return briefs


def _sketch_response(sketch_path: Path, sketches_dir: Path) -> str:
    sketch_json = json.loads(sketch_path.read_text(encoding="utf-8"))
    briefs = _load_briefs(sketches_dir, sketch_path)
    result = {"sketch": sketch_path.name, "content": sketch_json}
    result.update(briefs)
    return json.dumps(result, indent=2)


@mcp.tool()
def list_sketches() -> str:
    """List all available Excalidraw sketch files, newest first.

    Returns file names and stems. Use this to discover what sketches exist
    before calling get_sketch or get_current_sketch.
    """
    sketches_dir = _sketches_dir()
    files = sorted(
        sketches_dir.glob("*.excalidraw"),
        key=lambda f: f.stat().st_mtime,
        reverse=True,
    )
    if not files:
        return f"No .excalidraw files found in {sketches_dir}"
    return json.dumps(
        [{"name": f.name, "stem": f.stem} for f in files],
        indent=2,
    )


@mcp.tool()
def get_current_sketch() -> str:
    """Return the most recently modified Excalidraw sketch and its briefs.

    Response includes:
      sketch       — file name
      content      — raw Excalidraw JSON (elements, connections, labels)
      project_brief — contents of sketches/brief.md if it exists
      sketch_brief  — contents of sketches/<sketch-name>.md if it exists

    The sketch-specific brief takes precedence over the project brief on
    any conflicts. Claude interprets the raw JSON directly — no pre-processing.
    """
    sketches_dir = _sketches_dir()
    files = sorted(
        sketches_dir.glob("*.excalidraw"),
        key=lambda f: f.stat().st_mtime,
        reverse=True,
    )
    if not files:
        return f"No .excalidraw files found in {sketches_dir}"
    return _sketch_response(files[0], sketches_dir)


@mcp.tool()
def get_sketch(name: str) -> str:
    """Return a named Excalidraw sketch and its briefs.

    Pass the file name with or without the .excalidraw extension.
    Response format is identical to get_current_sketch.
    Returns an error with available file names if not found.
    """
    sketches_dir = _sketches_dir()
    stem = name.removesuffix(".excalidraw")
    sketch_path = sketches_dir / f"{stem}.excalidraw"
    if not sketch_path.exists():
        available = [f.name for f in sketches_dir.glob("*.excalidraw")]
        return json.dumps(
            {
                "error": "SKETCH_NOT_FOUND",
                "message": f'"{name}" not found in {sketches_dir}',
                "available": available,
            },
            indent=2,
        )
    return _sketch_response(sketch_path, sketches_dir)


if __name__ == "__main__":
    mcp.run()
