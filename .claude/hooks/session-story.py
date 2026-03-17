#!/usr/bin/env python3
"""
Stop hook
Appends a session entry to project-story/YYYY-MM-DD.md after each
Claude session. Over time this builds a narrative journal of the project
— raw material for case studies, post-mortems, and portfolio write-ups.

Each entry captures:
  - What the user asked Claude to do (the "why")
  - Key decisions and tradeoffs Claude reasoned through (the "thinking")
  - Which files changed (the "what")
  - Complications or pivots (surprises, corrections, direction changes)

The journal lives in project-story/ (gitignored by default — remove that
line from .gitignore if you want to commit it alongside the code).
"""
import json
import os
import re
import sys
from datetime import datetime

# Keywords that flag a sentence as a decision or tradeoff worth preserving
DECISION_SIGNALS = re.compile(
    r"\b(because|instead|tradeoff|trade-off|approach|decided|rather than|"
    r"chose|choosing|option|alternative|avoid|avoids|the reason|this means|"
    r"downside|upside|simpler|safer|faster|cleaner|more|less|better|worse)\b",
    re.IGNORECASE,
)

# Keywords that flag a pivot or complication
PIVOT_SIGNALS = re.compile(
    r"\b(actually|wait|however|but|problem|issue|wrong|mistake|fix|broken|"
    r"doesn't work|won't work|instead let|let me reconsider|scratch that|"
    r"correction|adjust|rethink)\b",
    re.IGNORECASE,
)

# Patterns that indicate a measured result (before/after numbers, scores, percentages)
METRIC_SIGNALS = re.compile(
    r"(\d+\s*(?:ms|s|kb|mb|gb|%|x|fps|req/s|rps)|\b(?:lcp|fid|cls|inp|ttfb|p\d{2,3})\b"
    r"|\bscore[d]?\b|\b(?:from|down|up)\s+\d|\bimproved?\b|\breduced?\b|\bfaster\b|\bslower\b"
    r"|\bbefore[:\s]|\bafter[:\s]|\bbaseline\b|\bbenchmark\b)",
    re.IGNORECASE,
)


def load_transcript(path):
    messages = []
    try:
        with open(path, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line:
                    try:
                        messages.append(json.loads(line))
                    except json.JSONDecodeError:
                        continue
    except (FileNotFoundError, TypeError):
        pass
    return messages


def extract_text_blocks(content):
    """Return list of plain text strings from a content field."""
    if isinstance(content, str):
        return [content.strip()] if content.strip() else []
    if isinstance(content, list):
        blocks = []
        for block in content:
            if isinstance(block, dict) and block.get("type") == "text":
                t = block.get("text", "").strip()
                if t:
                    blocks.append(t)
        return blocks
    return []


def extract_decision_sentences(text):
    """Pull sentences that contain decision/tradeoff language."""
    sentences = re.split(r"(?<=[.!?])\s+", text)
    return [s.strip() for s in sentences if len(s) > 30 and DECISION_SIGNALS.search(s)]


def extract_pivot_sentences(text):
    """Pull sentences that signal a complication or change of direction."""
    sentences = re.split(r"(?<=[.!?])\s+", text)
    return [s.strip() for s in sentences if len(s) > 30 and PIVOT_SIGNALS.search(s)]


def extract_metric_sentences(text):
    """Pull sentences that contain measurable results (numbers with units, before/after)."""
    sentences = re.split(r"(?<=[.!?])\s+", text)
    return [s.strip() for s in sentences if len(s) > 20 and METRIC_SIGNALS.search(s)]


def parse_transcript(messages):
    user_prompts = []
    decisions = []
    pivots = []
    metrics = []
    files_changed = set()
    commands_run = []

    for msg in messages:
        role = msg.get("role") or msg.get("type")
        content = msg.get("content", "")

        if role == "user":
            for text in extract_text_blocks(content):
                if len(text) > 10 and not text.startswith("[Context was compacted"):
                    user_prompts.append(text)
                    metrics.extend(extract_metric_sentences(text))

        elif role == "assistant":
            if isinstance(content, list):
                for block in content:
                    if not isinstance(block, dict):
                        continue

                    if block.get("type") == "text":
                        text = block.get("text", "").strip()
                        if text:
                            decisions.extend(extract_decision_sentences(text))
                            pivots.extend(extract_pivot_sentences(text))
                            metrics.extend(extract_metric_sentences(text))

                    elif block.get("type") == "tool_use":
                        tool = block.get("name", "")
                        inp = block.get("input", {})
                        if tool in ("Write", "Edit", "MultiEdit") and "file_path" in inp:
                            files_changed.add(inp["file_path"])
                        elif tool == "Bash":
                            cmd = inp.get("command", "").strip()
                            if cmd and not re.match(
                                r"^(cat|ls|echo|pwd|which|type|git status|git log|git diff)\b",
                                cmd,
                            ):
                                commands_run.append(cmd[:120])

    def dedup(items):
        seen = set()
        result = []
        for item in items:
            key = item[:60]
            if key not in seen:
                seen.add(key)
                result.append(item)
        return result

    return (
        user_prompts,
        dedup(decisions),
        dedup(pivots),
        dedup(metrics),
        sorted(files_changed),
        commands_run,
    )


def truncate(text, length=220):
    text = text.replace("\n", " ")
    return text[:length] + "…" if len(text) > length else text


def build_entry(session_id, user_prompts, decisions, pivots, metrics, files_changed, commands_run):
    now = datetime.now()
    lines = [
        f"## {now.strftime('%H:%M')} — session `{session_id[:8]}`",
        "",
    ]

    if user_prompts:
        lines.append("**Problem / task:**")
        for prompt in user_prompts[:5]:
            lines.append(f"- {truncate(prompt)}")
        lines.append("")

    if decisions:
        lines.append("**Key decisions & reasoning:**")
        for d in decisions[:6]:
            lines.append(f"- {truncate(d)}")
        lines.append("")

    if metrics:
        lines.append("**Measured results:**")
        for m in metrics[:6]:
            lines.append(f"- {truncate(m)}")
        lines.append("")

    if pivots:
        lines.append("**Complications / pivots:**")
        for p in pivots[:4]:
            lines.append(f"- {truncate(p)}")
        lines.append("")

    if files_changed:
        lines.append("**Files changed:**")
        for f in files_changed:
            lines.append(f"- `{f}`")
        lines.append("")

    if commands_run:
        lines.append("**Key commands:**")
        for cmd in commands_run[:6]:
            lines.append(f"- `{cmd}`")
        lines.append("")

    lines.append("---")
    lines.append("")
    return "\n".join(lines)


def main():
    data = json.load(sys.stdin)
    transcript_path = data.get("transcript_path", "")
    cwd = data.get("cwd", ".")
    session_id = data.get("session_id", "unknown")

    messages = load_transcript(transcript_path)
    user_prompts, decisions, pivots, metrics, files_changed, commands_run = parse_transcript(messages)

    # Only log sessions where something was actually built
    if not files_changed:
        sys.exit(0)

    story_dir = os.path.join(cwd, "project-story")
    os.makedirs(story_dir, exist_ok=True)

    today = datetime.now().strftime("%Y-%m-%d")
    journal_path = os.path.join(story_dir, f"{today}.md")

    if not os.path.exists(journal_path):
        with open(journal_path, "w", encoding="utf-8") as f:
            f.write(f"# {today}\n\n")

    entry = build_entry(session_id, user_prompts, decisions, pivots, metrics, files_changed, commands_run)

    with open(journal_path, "a", encoding="utf-8") as f:
        f.write(entry)

    sys.exit(0)


if __name__ == "__main__":
    main()
