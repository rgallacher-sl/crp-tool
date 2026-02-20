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

## Change Hygiene
1. Preserve existing behavior unless the task requests behavior changes.
2. Prefer incremental refactors over large rewrites.
3. Keep naming explicit and consistent with existing file naming.
