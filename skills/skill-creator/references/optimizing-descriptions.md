---
name: optimizing-descriptions
description: How to test and improve a skill's description field so it triggers reliably — eval query design, trigger rate testing, train/validation splits, and the optimization loop
type: reference
---

# Optimizing Skill Descriptions

Source: https://agentskills.io/skill-creation/optimizing-descriptions

## How triggering works

At startup, agents load only the `name` and `description` of each skill — just enough to decide when it might be relevant. When a task matches, the agent reads the full `SKILL.md`.

**Important nuance:** Agents typically only consult skills for tasks that require knowledge or capabilities beyond what they can handle alone. A simple one-step request ("read this PDF") may not trigger a PDF skill even with a perfect description. Tasks involving specialized knowledge, unfamiliar APIs, or domain-specific workflows are where description wording makes the real difference.

---

## Writing effective descriptions

- **Imperative phrasing:** "Use this skill when..." not "This skill does..."
- **User intent, not implementation:** Describe what the user is trying to achieve
- **Err on the side of being pushy:** Explicitly list contexts where the skill applies, including cases where the user doesn't name the domain directly
- **Keep it concise:** A few sentences to a short paragraph — hard limit is **1024 characters**

---

## Designing eval queries

Build a set of ~20 labeled queries: 8–10 should trigger, 8–10 should not.

```json
[
  { "query": "I've got a spreadsheet in ~/data/q4_results.xlsx — can you add a profit margin column?", "should_trigger": true },
  { "query": "what's the quickest way to convert this json file to yaml", "should_trigger": false }
]
```

### Should-trigger queries

Vary along these axes:
- **Phrasing:** formal, casual, typos, abbreviations
- **Explicitness:** some name the domain directly ("analyze this CSV"), others describe the need without naming it ("my boss wants a chart from this data file")
- **Detail:** mix terse with context-heavy (file paths, column names, backstory)
- **Complexity:** single-step tasks and multi-step workflows

The most useful should-trigger queries are ones where the skill would help but the connection isn't obvious — these are where description wording makes the difference.

### Should-not-trigger queries (near-misses)

The most valuable negatives share keywords with your skill but need something different. Weak negatives ("write a fibonacci function") test nothing. Strong negatives:

- For a CSV analysis skill: `"write a python script that reads a csv and uploads each row to postgres"` — involves CSV but the task is ETL, not analysis
- For a CSV analysis skill: `"update the formulas in my Excel budget spreadsheet"` — shares "spreadsheet" concept but needs editing, not analysis

### Realistic prompts include

- File paths (`~/Downloads/report_final_v2.xlsx`)
- Personal context (`"my manager asked me to..."`)
- Specific details (column names, company names, data values)
- Casual language, abbreviations, occasional typos

---

## Testing trigger rates

A skill triggered if the agent loaded its `SKILL.md`. Model behavior is nondeterministic — run each query **3 times** and compute a trigger rate (fraction of runs where the skill was invoked).

- Should-trigger query passes if trigger rate ≥ 0.5
- Should-not-trigger query passes if trigger rate < 0.5

Script the runs; manual testing at 20 × 3 = 60 invocations is tedious.

---

## Train/validation split

Optimize against the full query set and you risk overfitting — the description works for these phrasings but fails on new ones.

Split your queries:
- **Train (~60%):** used to identify failures and guide improvements
- **Validation (~40%):** set aside; only used to check whether improvements generalize

Keep both sets balanced (proportional mix of should/should-not). Fix the split across iterations so you're comparing apples to apples.

---

## Optimization loop

1. **Evaluate** on both train and validation sets
2. **Identify failures in train set only** — which should-trigger queries didn't trigger? Which should-not-trigger queries false-triggered?
3. **Revise the description** (generalize, don't patch specific keywords):
   - Too many missed triggers → description too narrow; broaden scope or add context
   - Too many false triggers → description too broad; add specificity about what the skill does *not* do
   - Avoid adding specific keywords from failed queries — that's overfitting; find the general category those queries represent
   - If stuck after several iterations, try a structurally different description framing rather than incremental tweaks
   - Check the 1024-character limit — descriptions grow during optimization
4. **Repeat** until train set passes or no meaningful improvement
5. **Select the best iteration** by validation pass rate — may not be the last one

Five iterations is usually enough. If performance isn't improving, the issue may be with the queries, not the description.

---

## Applying the result

1. Update `description` in `SKILL.md` frontmatter
2. Verify under 1024 characters
3. Manual sanity check: try a few prompts
4. Write 5–10 fresh queries (never seen during optimization) and run through eval — these give an honest generalization check

**Before/after example:**

```yaml
# Before
description: Process CSV files.

# After
description: >
  Analyze CSV and tabular data files — compute summary statistics,
  add derived columns, generate charts, and clean messy data. Use this
  skill when the user has a CSV, TSV, or Excel file and wants to
  explore, transform, or visualize the data, even if they don't
  explicitly mention "CSV" or "analysis."
```
