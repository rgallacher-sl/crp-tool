#!/usr/bin/env python3
"""
SessionStart hook (compact matcher)
Re-injects AGENTS.md after context compaction so Claude doesn't drift
from project conventions mid-session.
"""
import json
import os
import sys

data = json.load(sys.stdin)
cwd = data.get("cwd", ".")
agents_path = os.path.join(cwd, "AGENTS.md")

try:
    with open(agents_path) as f:
        content = f.read()
    result = {
        "systemMessage": (
            "[Context was compacted. Re-injecting project conventions from AGENTS.md:]\n\n"
            + content
        )
    }
    print(json.dumps(result))
except FileNotFoundError:
    pass  # No AGENTS.md — no-op

sys.exit(0)
