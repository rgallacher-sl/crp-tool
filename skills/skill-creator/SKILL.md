---
name: skill-creator
description: Use when creating a new skill or updating an existing skill in this boilerplate. Covers skill structure, description writing, progressive disclosure, bundled resources, and quality checklist.
license: MIT
metadata:
  author: microsoft
  source: adapted from https://github.com/microsoft/skills/tree/main/.github/skills/skill-creator
---

# Skill Creator

Guide for creating skills that extend AI agent capabilities. Skills are modular knowledge packages that transform general-purpose agents into specialized experts.

Source: Adapted from [microsoft/skills](https://github.com/microsoft/skills/tree/main/.github/skills/skill-creator)

## About Skills

Skills provide:

1. **Procedural knowledge** — Multi-step workflows for specific domains
2. **Domain context** — Schemas, conventions, project-specific patterns
3. **Bundled resources** — Scripts, references, templates for complex tasks

---

## Core Principles

### 1. Concise is Key

The context window is a shared resource. Challenge each piece: "Does this justify its token cost?"

**Default assumption: Agents are already capable.** Only add what they don't already know. Ask about each piece: "Would the agent get this wrong without this instruction?" If no, cut it.

### 2. Fresh Documentation First

For skills covering external tools or APIs that change frequently, instruct agents to verify current docs before implementing — don't bake in potentially stale details.

### 3. Degrees of Freedom

Match specificity to task fragility:

| Freedom | When | Example |
|---------|------|---------|
| **High** | Multiple valid approaches | Text guidelines + explain *why* so agent decides contextually |
| **Medium** | Preferred pattern with variation | Pseudocode |
| **Low** | Must be exact | Specific scripts, exact command flags |

### 4. Progressive Disclosure

Skills load in three levels:

1. **Metadata** (~100 words) — Always in context via description field
2. **SKILL.md body** (<5k words) — Loaded when skill triggers
3. **References** (unlimited) — Loaded as needed

**Keep SKILL.md under 500 lines.** Move detailed content to `references/` files. When referencing a file, tell the agent *when* to load it — "Read `references/api-errors.md` if the API returns a non-200 status" is more useful than "see references/ for details."

### 5. Provide Defaults, Not Menus

When multiple tools or approaches could work, pick a default and mention alternatives briefly:

```markdown
<!-- ❌ Too many options -->
You can use pypdf, pdfplumber, PyMuPDF, or pdf2image...

<!-- ✅ Clear default with escape hatch -->
Use pdfplumber for text extraction. For scanned PDFs requiring OCR, use pdf2image with pytesseract instead.
```

### 6. Favor Procedures Over Declarations

Teach the agent *how to approach* a class of problems, not *what to produce* for a specific instance. Reusable method > specific answer. Include output format templates, constraints, and tool-specific instructions — the *approach* should generalize even when individual details are specific.

### 7. Design Coherent Units

Scope each skill like a well-scoped function. Too narrow: multiple skills load for a single task, risking overhead and conflicting instructions. Too broad: hard to activate precisely. A skill for querying a database and formatting results is one coherent unit; adding database administration makes it too broad.

---

## Skill Structure

```
skills/skill-name/
├── SKILL.md              (required)
│   ├── YAML frontmatter  (name, description)
│   └── Markdown body
└── Bundled Resources     (optional)
    ├── scripts/          — Executable scripts
    ├── references/       — Detailed docs loaded on demand
    └── assets/           — Templates, images, boilerplate
```

### SKILL.md Frontmatter

```yaml
---
name: skill-name          # 1–64 chars, lowercase + hyphens only, no consecutive hyphens
description: Use when...  # 1–1024 chars — the trigger mechanism
license: MIT              # Optional
compatibility: Requires Node.js 18+ and git  # Optional — only if env requirements exist
allowed-tools: Bash(git:*) Read  # Optional, experimental — pre-approved tools
metadata:
  author: your-name
  version: "1.0"
---
```

**The description is the trigger.** Write it as "Use when [scenario]..." — not as a keyword list. The agent decides whether to load the skill based on this text. Hard limit: **1024 characters**.

**`name` constraints:** lowercase letters, numbers, hyphens only — no consecutive hyphens (`--`), no leading/trailing hyphens. Must match the parent directory name exactly.

**`compatibility`:** Only include if the skill has specific environment requirements (OS packages, Python version, network access). Most skills don't need it.

### Bundled Resources

| Type | Purpose | When to Include |
|------|---------|-----------------|
| `scripts/` | Deterministic operations | Same code rewritten repeatedly |
| `references/` | Detailed patterns | API docs, schemas, detailed guides |
| `assets/` | Output resources | Templates, boilerplate |

**Don't include**: README.md, changelogs, installation guides.

**One-off commands:** When an existing package already does what you need, reference it directly in `SKILL.md` without a script file. Pin versions for reproducibility:
- Python: `uvx ruff@0.8.0 check .`
- Node: `npx eslint@9.0.0 --fix .`
- Go: `go run golang.org/x/tools/cmd/goimports@v0.28.0 .`

**Script design for agents — key constraints:**
- **No interactive prompts.** Agents run in non-interactive shells. A script that blocks on a TTY prompt will hang. Accept all input via flags, env vars, or stdin.
- **Include `--help` output.** This is the primary way an agent learns your script's interface.
- **Write helpful error messages.** Include what went wrong, what was expected, and what to try.
- **Structured output.** Prefer JSON/CSV over free-form text. Send data to stdout, diagnostics to stderr.
- **Idempotency.** Agents may retry. "Create if not exists" is safer than "fail on duplicate."
- **Dry-run flag.** For destructive operations, a `--dry-run` flag lets the agent preview without executing.
- **Predictable output size.** Agent harnesses truncate tool output (often 10–30K chars). For large outputs, default to a summary and support `--output FILE` or pagination flags.

---

## Description Best Practices

The description field is the most important part of a skill. It must:

- Start with "Use when..." (imperative, intent-based)
- Describe the situation, not keywords
- Be specific enough to avoid false triggers
- Cover edge cases and alternative phrasings

```yaml
# ✅ Good
description: Use when auditing or improving web accessibility following WCAG 2.1 guidelines. Triggers on "a11y audit", "screen reader support", "keyboard navigation", or "make accessible".

# ❌ Bad — keyword list, not intent
description: accessibility, WCAG, a11y, screen readers, aria

# ❌ Bad — too vague
description: Use for frontend work.
```

---

## Building from Real Expertise

Generating a skill from an LLM's general knowledge produces vague, generic procedures. Effective skills are grounded in real expertise.

### Extract from a hands-on task

Complete a real task in conversation with an agent. Then extract the reusable pattern. Pay attention to:
- **Steps that worked** — the sequence that led to success
- **Corrections you made** — places where you steered the agent's approach
- **Context you provided** — project-specific facts the agent didn't already know
- **Input/output formats** — what the data looked like going in and coming out

### Synthesize from project artifacts

Feed existing project knowledge into the skill. A skill synthesized from your team's actual incident reports will outperform one built from a generic article. Good sources: internal runbooks, API specs, code review comments, git history (especially patches and fixes), and real failure cases.

---

## Creation Process

1. **Understand the task** — What recurring problem does this solve?
2. **Identify reusable resources** — Scripts, references, templates?
3. **Write the description** — What trigger phrase activates this skill?
4. **Write SKILL.md body** — Keep under 500 lines
5. **Extract to references** — Move anything detailed into `references/`
6. **Test the trigger** — Would an agent load this at the right moment?
7. **Refine with real execution** — Run the skill against real tasks; read execution traces (not just final outputs) to find: instructions that are too vague (agent tries several approaches), instructions that don't apply (agent follows them anyway), and too many options without a clear default. Feed findings back into the skill.

---

## Progressive Disclosure Patterns

### Pattern 1: Overview + References

```markdown
# Skill Name

## Quick Start
[Minimal example]

## Advanced Features
- See [references/advanced.md](references/advanced.md)
- See [references/edge-cases.md](references/edge-cases.md)
```

### Pattern 2: Feature Organization

```
skill-name/
├── SKILL.md              (core workflow)
└── references/
    ├── patterns.md
    ├── troubleshooting.md
    └── examples.md
```

---

## Instruction Patterns

Reusable techniques for structuring skill content. Use the ones that fit your task.

### Gotchas sections

The highest-value content in many skills is a list of environment-specific facts that defy reasonable assumptions — not general advice, but concrete corrections to mistakes the agent will make without being told:

```markdown
## Gotchas

- The `users` table uses soft deletes — always include `WHERE deleted_at IS NULL`.
- The `/health` endpoint returns 200 even if the database is down. Use `/ready` for full health.
- `user_id` in the DB, `uid` in the auth service, `accountId` in billing — all the same value.
```

Keep gotchas in `SKILL.md` so the agent reads them before encountering the situation. When the agent makes a mistake you have to correct, add it to the gotchas section.

### Templates for output format

When output must follow a specific format, provide a template. Agents pattern-match against concrete structures more reliably than against prose descriptions. Short templates inline in `SKILL.md`; long or conditional templates in `assets/`.

### Checklists for multi-step workflows

An explicit checklist helps the agent track progress and avoid skipping steps, especially when steps have dependencies or validation gates:

```markdown
- [ ] Step 1: Analyze the form (run `scripts/analyze_form.py`)
- [ ] Step 2: Create field mapping (edit `fields.json`)
- [ ] Step 3: Validate mapping (run `scripts/validate_fields.py`)
```

### Validation loops

Instruct the agent to validate its own work before moving on: do the work → run a validator → fix issues → repeat until passing. A reference document can also serve as the validator — instruct the agent to check its work against it before finalizing.

### Plan-validate-execute

For batch or destructive operations: have the agent create an intermediate plan in a structured format, validate it against a source of truth, then execute. The key ingredient is a validation script that checks the plan against the source of truth before any destructive action runs — errors should give the agent enough information to self-correct.

---

## Anti-Patterns

| Don't | Why |
|-------|-----|
| Put "when to use" guidance in the body | Body loads AFTER triggering — put it in the description |
| Write descriptions as keyword lists | Agents match intent, not keywords |
| Let SKILL.md exceed 500 lines | Wastes context window; move detail to references/ |
| Duplicate knowledge that's already in the codebase | Only add what agents can't derive themselves |
| Create a skill for a one-off task | Skills should cover recurring, reusable workflows |
| Nest references more than one level deep | Keep structure flat and navigable |

---

## Quality Criteria

### System Prompt and Skill Instruction Quality

Common instruction mistakes and their fixes:

| Mistake | Problem | Fix |
|---------|---------|-----|
| Too vague ("be helpful", "be careful") | The model has no specific guidance — behaviour is unpredictable | Define the role explicitly: scope, permitted actions, prohibited actions |
| Too long (2000+ words) | Key instructions are lost in noise; the model attends to early and late text, missing the middle | Keep focused; use headers and bullet structure; move detail to L3 references |
| No tool guidance | The model guesses when to call each tool — wrong tool selection, missed calls | State which tool to use for each category of task |
| No error handling | The agent has no instruction for failure cases — it either retries blindly or stops | Add fallback instructions: what to do when a tool fails, when confidence is low, when the user is frustrated |
| No boundaries | The agent attempts to handle everything, including out-of-scope requests | Explicitly list what is out of scope; provide a redirect (e.g., "For billing questions, direct to billing@example.com") |

### Skill Writing Principles (from the Agent Skills specification)

- **Focus on one domain.** A skill should do one thing well. Separate code review, deployment, and documentation into distinct skills rather than combining them.
- **Write for the LLM, not a human.** Be explicit about when to use the skill, the ordered steps to follow, how to handle edge cases (decision points), and what good output looks like.
- **Include decision points.** Real expertise includes knowing when to deviate from the standard process. State the condition and the alternative action explicitly.
- **Show expected output.** Include an example of the skill's output format or a template reference. The model uses this to calibrate its response structure.
- **Keep L2 instructions under 5,000 tokens.** If instructions are growing beyond this, move detailed reference material to `references/` files at L3 and link to them from the main body.
- **The description is the trigger.** Write it as "Use when [scenario]..." — not as a keyword list. It is the primary mechanism by which an agent decides whether to load the skill. False triggers (too broad) and missed triggers (too narrow) are the two failure modes to avoid.

---

## Cross-Client Compatibility

Skills are an open format supported by Claude Code, Cursor, GitHub Copilot, Gemini CLI, Roo Code, and others.

**Standard install paths** (cross-client convention):
- Project-level: `<project>/.agents/skills/<skill-name>/SKILL.md`
- User-level: `~/.agents/skills/<skill-name>/SKILL.md`

Client-specific paths (e.g., `.claude/skills/`) also work but are less portable. Project-level skills override user-level when names collide.

**Frontmatter may be stripped.** Some agents strip YAML frontmatter before passing content to the model. Don't put critical runtime instructions in frontmatter metadata fields — put them in the body.

**Context compaction risk.** If a session grows long enough to require compaction, skill instructions may be pruned from context. Write skills to be standalone and re-readable — don't assume the agent retains earlier conversation state.

---

## Testing and Iteration

Two reference guides for systematic skill improvement — load when ready to evaluate and refine:

- **[references/evaluating-skills.md](references/evaluating-skills.md)** — Set up evals (`evals/evals.json`), run with/without-skill baselines, write assertions, grade outputs, and iterate. Load when you have a working skill and want to validate it systematically.
- **[references/optimizing-descriptions.md](references/optimizing-descriptions.md)** — Test trigger reliability with train/validation query splits, compute trigger rates, and optimize the description field. Load when the skill isn't triggering reliably.

---

## Checklist

- [ ] `name` field matches the directory name exactly (lowercase, hyphens only, no `--`)
- [ ] Description starts with "Use when..." and describes intent, not keywords
- [ ] Description is under 1024 characters
- [ ] SKILL.md body is under 500 lines
- [ ] Detailed content moved to `references/` files
- [ ] Scripts in `scripts/` are deterministic, non-interactive, and have `--help`
- [ ] No README.md, changelog, or meta-docs included
- [ ] Trigger phrases cover common synonyms and edge cases
- [ ] `compatibility` field included only if env requirements exist
