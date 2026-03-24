# CRP Tool – Claude Instructions

Before responding to any task:
1. Read [AGENTS.md](./AGENTS.md)
2. State which section(s) are relevant (skills, information architecture, agentic patterns, etc.)
3. If a skill applies, read it before taking any action

Do not write code, edit files, or run commands until you have completed steps 1–3.

## Capturing new rules

When the user states a new rule, convention, or standing instruction:
1. Write it into `AGENTS.md` (or the appropriate repo-local file per the Information Architecture table) immediately — not into agent memory.
2. Only use agent memory for information that is genuinely not expressible in a repo file (e.g. personal preferences with no project impact).
3. Never ask the user to confirm this — just do it.

## Claude-specific tooling

AGENTS.md requires proactive design system consultation before any UI change. This is how to action that rule in Claude:
1. Use context7 first — call `mcp__context7__resolve-library-id` then `mcp__context7__query-docs` for GOV.UK (`/alphagov/govuk-design-system`) and/or Carbon (`/carbon-design-system/carbon`)
2. If neither covers the pattern adequately, use web search to find guidance from other reputable sources (Material, SAP Fiori, etc.); for keyboard and ARIA behaviour use the W3C ARIA Authoring Practices Guide (APG)
3. Apply the behaviour guidance to the project's own visual design — do not copy their tokens or styles
4. Always state which source informed the decision
