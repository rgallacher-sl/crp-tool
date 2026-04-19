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

**Before making any design recommendation or UI change**, proactively consult the relevant design system(s) — do not wait to be asked. This applies at the recommendation stage, not just implementation: new components, new pages, form patterns, navigation, error states, account flows, and any interaction design decision. It also applies to conversational design opinions — if you are answering a design question inline, the same citation requirement applies. Consultation must happen before an opinion is formed, not after. Use whatever tooling your agent supports to look up the pattern; Claude-specific tooling is documented in `CLAUDE.md`.

**Every design recommendation must cite a specific source:** a named component or pattern from a design system (Carbon, GOV.UK, Material, etc.), a specific article or guideline, or a WCAG criterion by number. "General principles" is not an acceptable citation. If no named pattern exists for a given case, say so explicitly before recommending. Synthesis from real sources is valuable; patterns presented as established practice without a foundation are not.

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
| [component-states](skills/component-states/SKILL.md) | Design | About to commit a component design to Figma, a spec, or code — not for exploratory design conversation |
| [security-and-hardening](skills/security-and-hardening/SKILL.md) | Implementation | About to write or edit code that handles form submission, authentication, session storage, localStorage, or API calls |
| [accessibility](skills/accessibility/SKILL.md) | Implementation | Just finished writing or editing a component's HTML template |
| [security-auditor](skills/security-auditor/SKILL.md) | Audit | Asked to audit security, or a feature is being marked ready for review or release |
| [context-eval](skills/context-eval/SKILL.md) | — | Evaluating whether a proposed context document (knowledge file, skill, or reference) is worth writing — run before creating any new context document |

## Hooks

| Hook | Event | Purpose |
|------|-------|---------|
| `structure-check.py` | `PostToolUse` (Write) | Checks written files for depth violations, invalid .md locations, and generic names — prompts agent to correct per `skills/repo-structure/SKILL.md` |

## Agentic patterns

**When to use plan mode**
Use plan mode (`/plan` or Shift+Tab to toggle) before any task that touches multiple files, changes an API boundary, or could be hard to reverse. Plan mode lets you review and correct the approach before anything executes. Switch back to normal mode once the plan is agreed.

**When to spawn subagents**
Subagents are separate agents with their own context window, spawned via the Agent tool. Use them when:
- Two searches or research tasks can run in parallel and don't depend on each other
- A task would produce so much output (large file reads, broad searches) it would flood the main context
- You need a specialised agent — `Explore` for codebase search, `Plan` for architecture design

Do not spawn a subagent for simple sequential tasks. A subagent returns one message — there is no back-and-forth. If the task needs iteration, keep it in the main context.

**Sub-agent summary size:** When a sub-agent reports back to the lead agent, condense its findings to signal only — conclusions, key decisions, and blockers. Discard intermediate reasoning, redundant tool outputs, and full file contents. The lead agent should receive a summary, not a transcript. A simple lookup needs a sentence; a deep architectural investigation might need several paragraphs — calibrate to what the lead agent actually needs to proceed, not to a fixed token count.

**Subagent types available**
- `Explore` — fast codebase search and exploration
- `Plan` — architecture and implementation planning
- `general-purpose` — research, multi-step tasks, web search

**Context window discipline**
Not all context loads the same way:
- **Structural/procedural context** (AGENTS.md, CLAUDE.md, skills) — preloaded at session start. Governs all behaviour; must be present before any action.
- **Domain knowledge** (knowledge/) — retrieve just-in-time, only when the current step needs it. Do not load upfront.
- **File contents and tool results** — retrieve just-in-time. Hold a reference (path or identifier); read only when required.

Prefer targeted reads (specific file + line range) over broad ones. When a task is complete, summarise what was done before context grows too large — this gives the compaction hook better material to work with and keeps re-injected context clean.

**What to preserve when compacting:** architectural decisions, unresolved bugs, implementation details still in flight, critical dependencies between steps. **What to discard:** redundant tool outputs, intermediate reasoning that led to a decision already recorded, full file contents that can be re-read if needed.

**MCP servers**
Model Context Protocol servers extend what the agent can connect to — databases, APIs, internal tools — without shell commands. Add project-specific MCP servers to `.claude/settings.json` under `mcpServers` when you need the agent to query live data directly.

## Thinking lenses

Only apply when the task matches a trigger below — skip entirely for routine execution, simple questions, and tasks with a clear standard response.

When triggered, load `references/thinking-lenses.md` and apply every relevant lens — there will often be more than one. Integrate into your response; only surface a lens explicitly when it changes the answer or reveals something Ryan needs to see. Missing a relevant lens is the failure mode.

Triggers (what/whether phase only — before direction is set):
- Decision / should I / choose between → honest trade-offs lens
- Strategy / planning / roadmap → pre-mortem lens
- Architecture / novel system → unknown unknowns lens
- Brainstorm / generate options → divergence lens (5 genuinely different approaches)
- Strong stated preference → disconfirmation lens
- Build / create / add / design with no prior context establishing goal → divergence lens

---

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

- **Source hierarchy:** Curated sources surface trusted material the model might otherwise miss — check them first so the right material is in play, then use whichever combination of curated and training knowledge gives the best answer. Be honest about citations. See [source-weighting](references/source-weighting.md).
- **Citations:** Cite sources read in this session specifically. If training knowledge comes from a named source you're confident about, name it. If vague, flag it ("I believe this comes from X but haven't verified"). If unknown, label it as training knowledge without citing. A wrong citation is worse than none.
- **Unanchored opinions:** If a question asks for an opinion or recommendation and no skill directly applies, scan the skills and references tables for adjacent guidance before answering from training knowledge alone. Open-ended or conversational framing doesn't exempt an opinion from this check.
- **Security by default:** When writing code that handles user input, authentication, authorization, APIs, or data storage, apply OWASP Top 10 considerations proactively — don't wait to be asked.
- **Evaluate before creating context:** Before writing any new knowledge file, skill, or reference, run the [context-eval](skills/context-eval/SKILL.md) skill and state the verdict. Do not create the file until the verdict is WRITE.

- **Agent agnostic by default:** Any tooling, config, docs, or conventions should work across agents (Claude, Cursor, Copilot, etc.) unless there's a specific reason to go agent-specific. Prefer `AGENTS.md` over `CLAUDE.md`, repo-local files over agent memory, and open formats over proprietary ones.
- **Keep AGENTS.md lean:** Rules only — no rationale or elaboration. If a rule needs context, put it in `references/` and link from here.

## Change Hygiene
1. Preserve existing behavior unless the task requests behavior changes.
2. Prefer incremental refactors over large rewrites.
3. Keep naming explicit and consistent with existing file naming.
