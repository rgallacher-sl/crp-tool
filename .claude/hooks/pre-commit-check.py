#!/usr/bin/env python3
"""
PreToolUse hook (Bash matcher)
Runs your test suite before any git commit. Blocks the commit if tests fail,
giving Claude the output so it can fix the issue before retrying.

SETUP: Create .claude/test-command with your test command on a single line.
Examples:
  npm test
  pytest
  cargo test
  go test ./...
Leave the file empty or omit it to disable this hook.
"""
import json
import os
import re
import subprocess
import sys

data = json.load(sys.stdin)
command = data.get("tool_input", {}).get("command", "")

# Only intercept git commit commands
if not re.match(r"git\s+commit\b", command.strip()):
    sys.exit(0)

cwd = data.get("cwd", ".")
config_path = os.path.join(cwd, ".claude", "test-command")

try:
    with open(config_path) as f:
        TEST_COMMAND = f.read().strip()
except FileNotFoundError:
    sys.exit(0)

if not TEST_COMMAND:
    sys.exit(0)

result = subprocess.run(
    TEST_COMMAND,
    shell=True,
    cwd=cwd,
    capture_output=True,
    text=True,
)

if result.returncode != 0:
    output = (result.stdout + result.stderr).strip()
    print(f"Tests failed — commit blocked.\n\n{output}", file=sys.stderr)
    sys.exit(2)

sys.exit(0)
