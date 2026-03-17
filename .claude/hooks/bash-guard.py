#!/usr/bin/env python3
"""
PreToolUse hook (Bash matcher)
Blocks dangerous shell commands before they execute.
Exit 2 = block + feed reason to Claude so it can self-correct.
"""
import json
import re
import sys

data = json.load(sys.stdin)
command = data.get("tool_input", {}).get("command", "")

BLOCKED = [
    (r"\brm\s+-rf\b", "rm -rf is blocked. Use targeted file removal instead."),
    (r"git\s+push\s+.*--force(?!-with-lease)\b", "git push --force is blocked. Use --force-with-lease or coordinate with your team."),
    (r"git\s+push\b.*\s(origin\s+)?(main|master)\b", "git push to main/master is blocked. Create a branch and open a PR instead."),
    (r"\bDROP\s+TABLE\b", "DROP TABLE is blocked. Create a migration file instead."),
    (r"\bDROP\s+DATABASE\b", "DROP DATABASE is blocked."),
    (r"git\s+reset\s+--hard\b", "git reset --hard is blocked. Stash your changes or use a safer alternative."),
    (r"\btruncate\s+table\b", "TRUNCATE TABLE is blocked. Create a migration file instead."),
]

for pattern, reason in BLOCKED:
    if re.search(pattern, command, re.IGNORECASE):
        print(reason, file=sys.stderr)
        sys.exit(2)

sys.exit(0)
