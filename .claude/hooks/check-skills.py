#!/usr/bin/env python3
"""
UserPromptSubmit hook
Injects a short reminder to check the AGENTS.md skills table before responding.
Prevents the agent from skipping skill loading when the task domain shifts.
"""
import json
import sys

json.load(sys.stdin)  # consume required stdin

print(json.dumps({
    "systemMessage": "Check the AGENTS.md skills table — load any skill relevant to this task before responding."
}))

sys.exit(0)
