#!/usr/bin/env python3
"""
PreToolUse hook (Write|Edit matcher)
Blocks writes to sensitive files before they execute.
Exit 2 = block + feed reason to Claude so it can self-correct.
"""
import json
import re
import sys

data = json.load(sys.stdin)
tool_input = data.get("tool_input", {})
file_path = tool_input.get("file_path") or tool_input.get("path") or ""

BLOCKED = [
    (r"(^|[/\\])\.env(\.|$)", ".env files are protected. Edit them manually outside of Claude."),
    (r"\.(pem|key|p12|pfx|crt|cer|pub)$", "Certificate and key files are protected."),
    (r"[/\\]migrations?[/\\].*\.(sql|py|js|ts)$", "Existing migration files are protected. Create a new migration instead."),
    (r"(^|[/\\])secrets?\.(json|yaml|yml|toml)$", "Secrets files are protected. Edit them manually."),
]

for pattern, reason in BLOCKED:
    if re.search(pattern, file_path, re.IGNORECASE):
        print(f"BLOCKED: {reason}\nFile: {file_path}", file=sys.stderr)
        sys.exit(2)

sys.exit(0)
