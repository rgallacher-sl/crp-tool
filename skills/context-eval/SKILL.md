---
name: context-eval
description: Evaluate whether a proposed context document (knowledge file, skill, or reference) is worth writing — or whether the model handles it well enough already. Run before creating any new context document.
type: skill
---

# Knowledge Value Evaluation

Run this before writing any new knowledge file, skill, or reference. Prevents adding content that costs context with no behaviour change, or actively degrades model performance.

## Step 0: Simulate the default

Before any evaluation, simulate what the model would output for a representative question in this domain with no knowledge files loaded. Is that output sufficient for the intended use case?

- If yes → **SKIP**. The file adds token cost with no behaviour change.
- If no → proceed through the steps below.

## Evaluation steps

### 1. Default adequacy

| Result | Action |
|--------|--------|
| Sufficient — correct format, depth, and lens | Skip |
| Wrong lens (e.g. consumer product framing when public sector is needed) | Lens correction in AGENTS.md — not a knowledge file |
| Correct direction but missing operational specifics (timings, counts, named gotchas) | Write |
| Wrong answer — model would actively mislead in this context | Write |

### 2. Cross-domain bridge test

Ask: would a question framed in domain A vocabulary naturally surface this domain B material? If no → strong signal to write. This is the highest-value case: the model knows the content but won't retrieve it from the expected question.

### 3. Operational specificity check

Does the content contain specifics the model wouldn't reliably include? Named participant counts, timings, specific gotchas, curated shortlists, private decisions? If yes → Write.

### 4. Prior conflict risk

| Relationship to model priors | Risk | Action |
|------------------------------|------|--------|
| Clearly divergent — different domain or conclusion | Low | Write |
| Near-consensus with slight modifications | High | Skip or harmful |
| Thin version of something model knows deeply | Harmful | Skip |

### 5. Skills-specific check

Does it proceduralize something the model handles well through contextual judgment? If yes → Skip or harmful. If the workflow is genuinely non-obvious or requires routing logic → Write.

### 6. Staleness check

Cannot verify it's current? Skip until verified.

### 7. Corpus impact

Would adding this file dilute the existing corpus? Skip.

## Decision output

**WRITE** — state which step(s) justify it.
**SKIP** — model handles this adequately.
**HARMFUL** — name the mechanism: prior conflict, thin coverage, procedural rigidity, or stale content.

## Quick reference

| Signal | Decision |
|--------|----------|
| Default output is sufficient | Skip |
| Wrong default lens | Lens correction in AGENTS.md |
| Domain B methodology improves domain A answers | Write — cross-domain bridge |
| Operational specifics not reliably in default output | Write |
| Near-consensus with slight modifications | Harmful — prior conflict |
| Thin version of something model knows deeply | Harmful |
| Skill proceduralizing adaptive judgment | Harmful |
| Stale or unverified content | Skip |
| Would dilute existing corpus | Skip |
