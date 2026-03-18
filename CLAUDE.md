# CRP Tool – Claude Instructions

See [AGENTS.md](./AGENTS.md) for shared rules that apply to all agents.

## Claude-specific tooling

When looking up how a component should behave (interactions, states, keyboard, ARIA), use context7:
1. Call `mcp__context7__resolve-library-id` to find the library (e.g. `@carbon/react`)
2. Call `mcp__context7__query-docs` to fetch the relevant component behaviour docs
3. Apply the behaviour to the project's own visual design — do not copy Carbon's tokens or styles
