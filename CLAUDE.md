# CRP Tool – Claude Instructions

Read [AGENTS.md](./AGENTS.md) before your first response to any task. It contains the skills table, conventions, and information architecture rules that must inform your approach.

## Claude-specific tooling

When looking up how a component should behave (interactions, states, keyboard, ARIA), use context7:
1. Call `mcp__context7__resolve-library-id` to find the library (e.g. `@carbon/react`)
2. Call `mcp__context7__query-docs` to fetch the relevant component behaviour docs
3. Apply the behaviour to the project's own visual design — do not copy Carbon's tokens or styles
