---
description: Operational workflow for the Figma MCP server — tool selection, fallback chain, token extraction, rate limits, and per-project rule templates
---

# Figma MCP Workflow

## Tool Selection and Fallback Chain

Always follow this sequence when implementing a Figma design:

1. **`get_design_context`** — primary tool. Returns a structured React + Tailwind representation of the selected node. Treat this as the design/behaviour reference, not final code.
2. **`get_metadata`** — fallback if `get_design_context` response is too large. Returns an XML node map with layer IDs, names, types, positions, and sizes. Use it to identify which sub-nodes to re-fetch with `get_design_context`.
3. **`get_screenshot`** — visual reference for layout fidelity. Run alongside `get_design_context`. Disable if managing token budget tightly.
4. **`get_variable_defs`** — extract tokens (color, spacing, typography) from the selection. Run this if the model is emitting hardcoded hex values or pixel values instead of project tokens. Prompt: "Get the variable names and values used in this frame."
5. **`search_design_system`** — search connected design libraries for existing components before generating new ones. Run before `get_design_context` when the element is likely a design system component. If found, reuse rather than recreate.

## Implementation Standards

After obtaining design context and screenshot:

- Replace Tailwind utility classes with project-preferred utilities and design system tokens.
- Reuse existing components — check the codebase before generating new ones.
- Use the project's color system, typography scale, and spacing tokens consistently.
- Respect existing routing, state management, and data-fetch patterns.
- Strive for 1:1 visual parity with designs. When conflicts arise, prefer design-system tokens with minimal spacing/size adjustments.
- Validate final UI against the Figma screenshot for look and behaviour.

## Generating Code Connect Mappings

Code Connect links Figma components to codebase components, improving `get_design_context` output quality.

1. Run `get_code_connect_suggestions` — detects candidate mappings between Figma nodes and code components.
2. Review suggestions.
3. Run `send_code_connect_mappings` to confirm.
4. Alternatively use `add_code_connect_map` to add individual mappings manually.
5. Use `get_code_connect_map` to inspect existing mappings (returns `codeConnectSrc` and `codeConnectName` per node).

## Generating Design System Rules

`create_design_system_rules` generates a rules file that gives agents context for consistent code generation — layout primitives, file organisation, naming patterns, token usage.

Run this once per project and save the output to a `rules/` or `instructions/` directory. Agents will load it during code generation sessions.

The file should cover:
- Preferred layout primitives (e.g. `Stack`, `Grid`, not raw flex)
- File organisation and naming conventions
- What not to hardcode (colors, spacing, border-radius — use tokens)
- Framework and styling system in use

**Example rule file template:**

```
Figma MCP integration workflow:
1. Run get_design_context first for a structured representation of the exact nodes
2. If response too large, run get_metadata for a high-level node map, then re-fetch needed nodes
3. Run get_screenshot for visual reference
4. After obtaining context and screenshot, download assets and start implementation
5. Translate output (usually React + Tailwind) into project conventions and frameworks, reusing color tokens and typography
6. Validate against Figma for 1:1 look and behaviour

Implementation standards:
- Treat Figma MCP output as design/behaviour representation, not final code style
- Replace Tailwind utility classes with project-preferred utilities/design-system tokens
- Reuse existing components instead of duplicating functionality
- Use project color system, typography scale, and spacing tokens consistently
- Respect existing routing, state management, and data-fetch patterns
- Strive for 1:1 visual parity with designs; when conflicts arise, prefer design-system tokens
- Validate final UI against Figma screenshot for look and behaviour
```

## Writing Design Back to Figma

`use_figma` (remote server only) is a general-purpose write tool. Invoke it with the `figma-use` skill for best results.

Capabilities:
- Create/modify designs: frames, text, components, variants, images
- Set up tokens/variables/styles: color variable collections, spacing tokens, typography styles
- Build/update component systems
- Fix layout and visual issues

The agent checks the design system for existing components before creating from scratch.

`generate_figma_design` captures live web pages and imports them as Figma design layers. Useful for design-to-code in reverse (existing UI → Figma).

## Rate Limits

| Seat type | Limit |
|-----------|-------|
| Starter plan or View/Collab seat | 6 tool calls per month |
| Dev or Full seat on Professional/Organization/Enterprise | Tier 1 Figma REST API rate limits (per-minute) |

Plan for rate limits when building agentic workflows that call Figma tools repeatedly. Batch operations where possible. Avoid calling `get_screenshot` on every iteration if managing call budget.

## Other Tools

| Tool | When to use |
|------|-------------|
| `generate_diagram` | Create FigJam diagrams from natural language or Mermaid syntax — flowcharts, Gantt, state, sequence |
| `get_figjam` | Read FigJam metadata (XML with layer properties and screenshots) |
| `create_new_file` | Create a blank Figma Design or FigJam file in drafts |
| `whoami` | Check authenticated user identity and plan/seat type — useful for diagnosing rate limit issues |
