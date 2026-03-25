# AGENTS.md

## Purpose
This file defines guardrails for AI-assisted changes in this repository.

## Tech Context
- Framework: Angular (standalone components)
- Styling: SCSS
- Design tokens and utilities: `src/styles.scss`

## Core Rules
1. Reuse existing patterns before creating new ones.
2. Keep changes minimal and consistent with current architecture.
3. Do not rewrite unrelated code.

## Design System

**IBM Carbon Design System — behaviour and UX reference only**
**GOV.UK Design System — behaviour and UX reference only**
Use both as starting points for how components should behave: interactions, states, keyboard patterns, ARIA roles, and UX patterns. The user's provided designs and descriptions take precedence — these systems are references, not rules. Do not use their tokens or visual styles. All visual styling comes from the project's own design tokens in `src/styles.scss` and designs provided by the user.

**Before making any design recommendation or UI change**, proactively consult the relevant design system(s) — do not wait to be asked. This applies at the recommendation stage, not just implementation: new components, new pages, form patterns, navigation, error states, account flows, and any interaction design decision. Consultation must happen before an opinion is formed, not after. Use whatever tooling your agent supports to look up the pattern; Claude-specific tooling is documented in `CLAUDE.md`.

**Do not limit research to these two systems.** If neither covers a pattern adequately, search more broadly — other reputable design systems (Material, SAP Fiori, etc.) or the W3C ARIA Authoring Practices Guide (APG) for keyboard and ARIA behaviour. Always state which source informed a decision.

**Visual implementation**
Styling is driven by designs and image references provided by the user. Implement those exactly using the existing tokens in `src/styles.scss`. Do not invent visual decisions not covered by the provided design.

**Security**
- Never confirm whether an email address is registered in error messages — this enables account enumeration. Apply to sign-up, sign-in, and password reset flows.
- Do not surface internal failure reasons to users; use generic messages for all server/auth errors.

**Accessibility**
This is a government tool. WCAG 2.2 AA compliance is required:
- Sufficient colour contrast on all text and interactive elements
- Full keyboard accessibility with visible focus states
- Semantic HTML and ARIA where needed
- Colour must never be the sole way to convey information

## Styling Rules
1. Use design tokens from `src/styles.scss` for color, spacing, radius, and motion.
2. Use Primer-like spacing scale for new layout spacing:
- `--sx-0` to `--sx-12`
- Backing primitives `--base-size-*`
3. Prefer shared utility classes before adding one-off page styles:
- `stack`, `stack-inline`
- `gap-*`
- `p-*`, `px-*`, `py-*`, `pt-*`, `pr-*`, `pb-*`, `pl-*`
4. Reuse shared button classes for standard actions:
- `btn-primary`
- `btn-secondary`
5. Do not introduce raw hex/rgb color values in page-level SCSS when an equivalent token exists.
6. Do not hardcode spacing values in new styles when an `--sx-*` token or spacing utility can be used.

## Component Rules
1. Page-level routed components belong under `src/app/pages/*`.
2. Reusable non-routed UI/domain components belong under `src/app/components/*`.
3. If markup + style pattern appears in multiple pages, extract a reusable component or shared class.

## Angular Rules
1. Keep components standalone unless there is a clear reason not to.
2. Keep UI primitives presentational:
- Inputs for data
- Outputs for events
- No service calls in low-level UI primitives

## Validation Rules
1. After code changes, run relevant checks when feasible:
- `npm run build`
2. If checks cannot run, state that clearly in the final summary.

## Skills

Security runs through three stages — design, implementation, audit. Load the right skill at the right stage; do not defer security to the audit.

**Before acting, scan this table and load every skill whose trigger matches the current task. Do not skip this step.**

| Skill | Stage | Load when |
|-------|-------|-----------|
| [repo-structure](skills/repo-structure/SKILL.md) | — | About to create, rename, move, or delete any file or directory |
| [component-states](skills/component-states/SKILL.md) | Design | Asked what states a component needs, or starting to design or build a component for the first time |
| [security-and-hardening](skills/security-and-hardening/SKILL.md) | Implementation | About to write or edit code that handles form submission, authentication, session storage, localStorage, or API calls |
| [accessibility](skills/accessibility/SKILL.md) | Implementation | Just finished writing or editing a component's HTML template |
| [security-auditor](skills/security-auditor/SKILL.md) | Audit | Asked to audit security, or a feature is being marked ready for review or release |

## Hooks

| Hook | Event | Purpose |
|------|-------|---------|
| `structure-check.py` | `PostToolUse` (Write) | Checks written files for depth violations, invalid .md locations, and generic names — prompts agent to correct per `skills/repo-structure/SKILL.md` |

## Information Architecture

When new information, documentation, or research arrives — use this table to decide where it goes. Prefer repo-local, agent-agnostic locations over agent-specific memory.

| Type of content | Where it goes | Notes |
|----------------|---------------|-------|
| Architectural or strategic decisions | `references/` (create if needed) | Agent-readable, load when relevant |
| Specs for new features | `spec.md` or `specs/` | Written before implementation begins |
| ADRs | `docs/decisions/` | When a decision needs permanent record with context |
| Research or external articles | `references/` | Summarise key points and relevance — don't just link |
| Sensitive config, secrets, env vars | `.env` (never committed) | Never write secrets to the repo |
| Reusable AI workflow playbooks | `sense-check/playbooks/` | Always write here regardless of which repo you're working in |

**Rules:**
- Repo-local always beats agent-specific memory. If it's worth keeping, it belongs in the repo.
- Do not create a `docs/` file when a `references/` entry would do.
- If content doesn't fit any category above, ask before creating a new top-level directory.

## Principles

- **Agent agnostic by default:** Any tooling, config, docs, or conventions should work across agents (Claude, Cursor, Copilot, etc.) unless there's a specific reason to go agent-specific. Prefer `AGENTS.md` over `CLAUDE.md`, repo-local files over agent memory, and open formats over proprietary ones.
- **Keep AGENTS.md lean:** Rules only — no rationale or elaboration. If a rule needs context, put it in `references/` and link from here.

## Change Hygiene
1. Preserve existing behavior unless the task requests behavior changes.
2. Prefer incremental refactors over large rewrites.
3. Keep naming explicit and consistent with existing file naming.
