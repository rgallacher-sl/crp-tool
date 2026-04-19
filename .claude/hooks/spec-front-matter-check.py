#!/usr/bin/env python3
"""
PostToolUse hook (Write matcher)
Fires after any file write. If the written file is spec.md, checks whether it
contains the rg-design-system front-matter block. Injects a systemMessage
prompting the agent to add it if missing.

Only fires when the project uses rg-design-system — detected by the presence
of allow-purposes in the written content or by checking package.json for the
dependency. Skips silently if neither condition applies.
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

# Only care about spec.md files
filename = os.path.basename(file_path)
if filename != "spec.md":
    sys.exit(0)

# Read the written content
content = tool_input.get("content", "")

# If already has allow-purposes, front-matter is present — nothing to do
if "allow-purposes" in content:
    sys.exit(0)

# Check whether this project uses rg-design-system
# Look for it in package.json at the cwd level
package_json_path = os.path.join(cwd, "package.json")
uses_design_system = False

if os.path.exists(package_json_path):
    try:
        with open(package_json_path) as f:
            pkg = json.load(f)
        all_deps = {}
        all_deps.update(pkg.get("dependencies", {}))
        all_deps.update(pkg.get("devDependencies", {}))
        all_deps.update(pkg.get("peerDependencies", {}))
        if "@ryangallacher/design-system" in all_deps:
            uses_design_system = True
    except Exception:
        pass

# Also check for tokens/ directory as a signal (design system repo itself)
if not uses_design_system and os.path.isdir(os.path.join(cwd, "tokens")):
    uses_design_system = True

if not uses_design_system:
    sys.exit(0)

# spec.md written, project uses the design system, front-matter missing
print(json.dumps({
    "systemMessage": (
        "[spec-front-matter-check] spec.md was written without the rg-design-system front-matter block.\n"
        "Add the following block at the top of the file before any other content:\n\n"
        "---\n"
        "project-type: portfolio          # portfolio | case-study | enterprise-tool | prototype | marketing\n"
        "domain: [free text]              # informs component purpose filtering\n"
        "audience: [free text]            # informs tone and component selection\n"
        "register: branded                # branded | functional\n"
        "brand: personal                  # matches a file in tokens/brands/\n"
        "theme: light                     # light | dark | high-contrast\n"
        "allow-purposes: [editorial, marketing, layout, feedback, navigation]\n"
        "---\n\n"
        "See skills/spec-driven-development/SKILL.md for field guidance and allow-purposes defaults per project type."
    )
}))

sys.exit(0)
