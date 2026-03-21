# CRP Tool – Claude Instructions

Before responding to any task:
1. Read [AGENTS.md](./AGENTS.md)
2. State which section(s) are relevant (skills, information architecture, agentic patterns, etc.)
3. If a skill applies, read it before taking any action

Do not write code, edit files, or run commands until you have completed steps 1–3.

## Claude-specific tooling

When looking up how a component should behave (interactions, states, keyboard, ARIA), use context7:
1. Call `mcp__context7__resolve-library-id` to find the library (e.g. `@carbon/react`)
2. Call `mcp__context7__query-docs` to fetch the relevant component behaviour docs
3. Apply the behaviour to the project's own visual design — do not copy Carbon's tokens or styles
