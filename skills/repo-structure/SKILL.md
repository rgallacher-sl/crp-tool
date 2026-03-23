---
name: repo-structure
description: Structural rules for this repo — file naming, format, grouping, depth, and maintenance. Load before creating, naming, or deleting any file or directory.
type: skill
---

# Repo Structure

Load this before creating, naming, moving, or deleting any file or directory. These rules make the repo navigable by both agents and humans.

---

## File naming

- **kebab-case** for all files: `accessibility-checklist.md`, `color-tokens.css`, `registry-sync.py`
- **PascalCase** only for React components and their associated files: `Button.tsx`, `Button.module.css`, `Button.stories.tsx`
- Names must describe content, not context — `accessibility-checklist.md` not `a11y-stuff.md`
- No abbreviations unless universally understood (`mcp`, `css`, `api` are fine — `chk`, `cfg`, `mgmt` are not)
- No generic names: `utils.md`, `misc.ts`, `helpers.css` are not acceptable — name the concept
- Prefix with domain only if the name would be ambiguous without it: `color-tokens.css` vs `tokens.css`

---

## File format (agent-readable docs)

- Open with a H1 that states the document's exact purpose — this is what agents use to decide whether to load it
- Write declaratively: state rules, not rationale. Save rationale for ADRs in `docs/decisions/`
- Prefer tables over bullet lists, bullet lists over paragraphs
- One topic per file — do not mix concerns in a single document
- Include a "When to load" or trigger signal near the top so agents know when it applies
- Use frontmatter for metadata on any file in `references/` or `skills/`:
  ```
  ---
  name: file-name-without-extension
  description: one-line description used by agents to decide relevance
  type: reference | skill | playbook
  ---
  ```

---

## Grouping

- One concept per file — if a file covers two distinct topics, split it
- Add a subdirectory only when there are **3 or more** related files that share a clear parent concept
- `references/` stays flat — no subdirectories unless there are 3+ files for a single sub-topic
- `skills/` uses one directory per skill: `skills/skill-name/SKILL.md`
- Do not create a new top-level directory without asking first — check the Information Architecture table in `AGENTS.md`

---

## Depth

- Maximum **3 levels** for most content: `repo/ → category/ → file`
- Maximum **4 levels** for components or deeply nested source: `src/components/ComponentName/file`
- Never go deeper — agents lose reliable path prediction beyond 4 levels
- If you find yourself needing a 5th level, the grouping is wrong — restructure

---

## Maintenance

**Split a file when:** it covers 2+ distinct topics or has grown past ~150 lines without a clear single purpose.

**Create a subdirectory when:** 3+ files share a concept prefix and grouping would reduce cognitive load without adding depth.

**Delete a file when:** the content is superseded, the feature it documented no longer exists, or it duplicates another file.

**Rename a file when:** the name no longer describes the content accurately — stale names produce wrong agent decisions.

**Review `references/` and `skills/` when:** a new major feature, component, or workflow is added — check for outdated or now-redundant entries.

---

## Quick reference: valid locations

| Content type | Location | Notes |
|---|---|---|
| Agent-readable references | `references/` | Flat, one topic per file |
| Engineering workflow skills | `skills/skill-name/SKILL.md` | One directory per skill |
| Architectural decisions | `docs/decisions/` | ADR format |
| Specs | `spec.md` or `specs/` | Before implementation begins |
| Hooks | `.claude/hooks/` | Register in AGENTS.md hooks table |
| Session journals | `project-story/` | Auto-generated — do not edit |
