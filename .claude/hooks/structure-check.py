#!/usr/bin/env python3
"""
PostToolUse hook (Write matcher)
Fires after any file write. Checks for structural violations:
- .md files written outside valid locations
- Files nested deeper than allowed
Injects a systemMessage pointing to skills/repo-structure/SKILL.md if something looks wrong.
"""
import json
import os
import re
import sys

data = json.load(sys.stdin)
cwd = data.get("cwd", ".")
tool_input = data.get("tool_input", {})
file_path = tool_input.get("file_path", "")

if not file_path:
    sys.exit(0)

try:
    rel_path = os.path.relpath(file_path, cwd).replace("\\\\", "/")
except ValueError:
    sys.exit(0)

issues = []

# --- Depth check (max 4 levels) ---
depth = len([p for p in rel_path.split("/") if p and p != "."])
if depth > 4:
    issues.append(f"depth is {depth} levels (max 4) — restructure the grouping")

# --- .md files in unexpected locations ---
if rel_path.endswith(".md"):
    VALID_MD_LOCATIONS = [
        r"^[^/]+\.md$",                        # root level
        r"^references/[^/]+\.md$",              # references/ flat
        r"^skills/[^/]+/SKILL\.md$",            # skills/name/SKILL.md
        r"^docs/",                              # docs/ subtree
        r"^project-story/",                    # auto-generated journals
        r"^specs?/",                            # specs/
        r"^knowledge/",                         # knowledge base
        r"^playbooks/",                         # playbooks
        r"^src/",                               # source code
        r"^\.claude/",                          # .claude internals
    ]
    if not any(re.match(p, rel_path) for p in VALID_MD_LOCATIONS):
        issues.append(f"'{rel_path}' is a .md file outside a valid location")

# --- Filename convention check ---
filename = os.path.basename(rel_path)
name_no_ext = os.path.splitext(filename)[0]
is_component = bool(re.match(r"^[A-Z][a-zA-Z]+$", name_no_ext))
is_special = filename in {"AGENTS.md", "CLAUDE.md", "README.md", "LICENSE", "SKILL.md", "MEMORY.md"}
is_config = re.match(r"^[A-Z_]+\.(json|yaml|yml|toml|py|js|ts)$", filename)

if not is_component and not is_special and not is_config:
    generic_names = {"utils", "misc", "helpers", "stuff", "temp", "test", "data", "config"}
    if name_no_ext.lower() in generic_names:
        issues.append(f"'{filename}' — name is too generic, describe the concept instead")

if not issues:
    sys.exit(0)

issue_list = "\n".join(f"  - {i}" for i in issues)
print(json.dumps({
    "systemMessage": (
        f"[structure-check] Structural issue(s) detected with '{rel_path}':\n{issue_list}\n"
        f"  Read skills/repo-structure/SKILL.md before continuing and correct if needed."
    )
}))

sys.exit(0)
