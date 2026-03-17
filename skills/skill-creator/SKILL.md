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

**Default assumption: Agents are already capable.** Only add what they don't already know.

### 2. Fresh Documentation First

For skills covering external tools or APIs that change frequently, instruct agents to verify current docs before implementing — don't bake in potentially stale details.

### 3. Degrees of Freedom

Match specificity to task fragility:

| Freedom | When | Example |
|---------|------|---------|
| **High** | Multiple valid approaches | Text guidelines |
| **Medium** | Preferred pattern with variation | Pseudocode |
| **Low** | Must be exact | Specific scripts |

### 4. Progressive Disclosure

Skills load in three levels:

1. **Metadata** (~100 words) — Always in context via description field
2. **SKILL.md body** (<5k words) — Loaded when skill triggers
3. **References** (unlimited) — Loaded as needed

**Keep SKILL.md under 500 lines.** Move detailed content to `references/` files.

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
name: skill-name          # Must match parent directory name exactly
description: Use when...  # The trigger mechanism — imperative phrasing
license: MIT              # Optional
metadata:
  author: your-name
  version: "1.0"
---
```

**The description is the trigger.** Write it as "Use when [scenario]..." — not as a keyword list. The agent decides whether to load the skill based on this text.

### Bundled Resources

| Type | Purpose | When to Include |
|------|---------|-----------------|
| `scripts/` | Deterministic operations | Same code rewritten repeatedly |
| `references/` | Detailed patterns | API docs, schemas, detailed guides |
| `assets/` | Output resources | Templates, boilerplate |

**Don't include**: README.md, changelogs, installation guides.

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

## Creation Process

1. **Understand the task** — What recurring problem does this solve?
2. **Identify reusable resources** — Scripts, references, templates?
3. **Write the description** — What trigger phrase activates this skill?
4. **Write SKILL.md body** — Keep under 500 lines
5. **Extract to references** — Move anything detailed into `references/`
6. **Test the trigger** — Would an agent load this at the right moment?

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

## Checklist

- [ ] `name` field matches the directory name exactly
- [ ] Description starts with "Use when..." and describes intent, not keywords
- [ ] SKILL.md body is under 500 lines
- [ ] Detailed content moved to `references/` files
- [ ] Scripts in `scripts/` are deterministic and reusable
- [ ] No README.md, changelog, or meta-docs included
- [ ] Trigger phrases cover common synonyms and edge cases
