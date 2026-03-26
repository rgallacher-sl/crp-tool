---
name: evaluating-skills
description: How to test whether a skill produces good outputs using eval-driven iteration — test cases, assertions, grading, benchmarking, and the iteration loop
type: reference
---

# Evaluating Skill Output Quality

Source: https://agentskills.io/skill-creation/evaluating-skills

## Test case structure

Store test cases in `evals/evals.json` inside the skill directory:

```json
{
  "skill_name": "my-skill",
  "evals": [
    {
      "id": 1,
      "prompt": "realistic user message — casual or precise, with file paths and context",
      "expected_output": "human-readable description of what success looks like",
      "files": ["evals/files/input.csv"],
      "assertions": [
        "The output includes a bar chart image file",
        "Both axes are labeled",
        "The chart title mentions revenue"
      ]
    }
  ]
}
```

**Tips for test prompts:**
- Start with 2–3 cases; expand after the first round of results
- Vary phrasing (formal, casual, terse, context-heavy)
- Cover at least one edge case (malformed input, ambiguous request)
- Use realistic context: file paths, column names, personal context — not "process this data"

---

## Workspace structure

Each iteration gets its own directory. Each test case has `with_skill/` and `without_skill/` subdirectories:

```
my-skill/
├── SKILL.md
└── evals/
    └── evals.json
my-skill-workspace/
└── iteration-1/
    ├── eval-test-case-name/
    │   ├── with_skill/
    │   │   ├── outputs/
    │   │   ├── timing.json
    │   │   └── grading.json
    │   └── without_skill/
    │       ├── outputs/
    │       ├── timing.json
    │       └── grading.json
    ├── benchmark.json
    └── feedback.json
```

---

## Running evals

- Each run must start with a **clean context** — no leftover state from previous runs.
- Run each test case **with the skill** and **without it** (or against a previous version snapshot).
- When improving an existing skill, snapshot it first (`cp -r <skill-path> <workspace>/skill-snapshot/`) and use the snapshot as the baseline.

**Capture timing data** after each run:

```json
{ "total_tokens": 84852, "duration_ms": 23332 }
```

In Claude Code, the task completion notification includes `total_tokens` and `duration_ms` — save them immediately.

---

## Writing assertions

Good assertions are verifiable and specific:
- `"The output file is valid JSON"` — programmatically checkable
- `"The bar chart has labeled axes"` — specific and observable
- `"The report includes at least 3 recommendations"` — countable

Weak assertions:
- `"The output is good"` — too vague
- `"Uses exactly the phrase 'Total Revenue: $X'"` — too brittle

Not everything needs an assertion. Writing style, visual design, and "feels right" qualities are better caught during human review.

---

## Grading outputs

Grade each assertion as **PASS** or **FAIL** with concrete evidence quoting or referencing the output. Save to `grading.json`:

```json
{
  "assertion_results": [
    { "text": "Both axes are labeled", "passed": false, "evidence": "Y-axis labeled but X-axis has no label" }
  ],
  "summary": { "passed": 3, "failed": 1, "total": 4, "pass_rate": 0.75 }
}
```

**Grading principles:**
- Require concrete evidence for a PASS — don't give the benefit of the doubt
- Review the assertions themselves: fix any that are too easy, too hard, or unverifiable
- **Blind comparison:** for holistic quality (formatting, polish, usability), present both outputs to an LLM judge without revealing which version is which

---

## Aggregating results

Compute summary stats per configuration and save to `benchmark.json`:

```json
{
  "run_summary": {
    "with_skill": { "pass_rate": { "mean": 0.83 }, "time_seconds": { "mean": 45.0 }, "tokens": { "mean": 3800 } },
    "without_skill": { "pass_rate": { "mean": 0.33 }, "time_seconds": { "mean": 32.0 }, "tokens": { "mean": 2100 } },
    "delta": { "pass_rate": 0.50, "time_seconds": 13.0, "tokens": 1700 }
  }
}
```

The delta tells you what the skill costs (time, tokens) vs. what it buys (pass rate improvement).

---

## Pattern analysis

After aggregating:
- **Always-pass in both configs** — remove; these don't reflect skill value
- **Always-fail in both configs** — fix the assertion or the test case
- **Pass with skill, fail without** — this is where the skill adds value; understand why
- **Inconsistent across runs** (high stddev) — instructions may be ambiguous; add examples or specificity
- **Time/token outliers** — read the execution transcript for that eval to find the bottleneck

---

## Human review

Record specific, actionable feedback per test case in `feedback.json`:

```json
{
  "eval-top-months-chart": "Chart is missing axis labels; months in alphabetical not chronological order.",
  "eval-clean-missing-emails": ""
}
```

Empty feedback = output looked fine. Focus iteration on cases with specific complaints.

---

## Iteration loop

1. Give failed assertions + human feedback + execution transcripts + current `SKILL.md` to an LLM; ask it to propose improvements
2. Apply changes
3. Rerun all test cases in `iteration-<N+1>/`
4. Grade, aggregate, human review
5. Repeat

**Stop when:** feedback is consistently empty, or no meaningful improvement between iterations.

**Guidelines for LLM-proposed changes:**
- Generalize from feedback — fixes should address underlying issues broadly, not patch specific examples
- Keep the skill lean — if transcripts show wasted work, remove those instructions; plateau pass rates despite more rules = over-constrained, try removing some
- Explain the why — reasoning-based instructions work better than rigid directives
- Bundle repeated work — if every run independently writes a similar helper script, bundle it in `scripts/`
