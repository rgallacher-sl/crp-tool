---
description: Temperature ranges by task type and system prompt ordering rules — load when configuring model calls or writing system prompts
---

# Model Configuration Heuristics

## Temperature by task type

| Task type | Temperature range | Rationale |
|-----------|------------------|-----------|
| Tool selection | 0–0.2 | Deterministic, correct tool calls required |
| Data extraction | 0 | Exact output, no creativity needed |
| Code generation | 0–0.3 | Correctness over variety |
| Classification | 0 | Same input must produce same output |
| Planning | 0.2–0.5 | Flexibility aids option exploration |
| Summarization | 0.2–0.5 | Fidelity to source matters |
| Agentic tool use | 0–0.3 | Tool selection and result interpretation need consistency |
| Creative writing | 0.7–1.0 | Variety and originality valued |
| Brainstorming | 0.8–1.0 | Diverse outputs required |

**Default for production agents: 0–0.3.** High temperature causes inconsistent tool selection and unpredictable control flow.

## System prompt ordering rule

Order system prompt content as follows:

1. **Most critical rules** — identity, safety constraints, hard limits (placed at the start)
2. **Tool usage guidelines** — which tools to use and when
3. **Output format** — structure, length, response shape
4. **Examples** — concrete demonstrations
5. **Edge case handling** — fallbacks and error behavior
6. **Restatement of most critical rules** — repeat at the end

**Why:** Models attend more strongly to the beginning and end of the context (primacy and recency effects). Critical instructions placed only in the middle are less reliably followed.

## Additional configuration notes

- Top-P and Top-K rarely need manual tuning — model defaults are acceptable for most agent tasks
- Temperature is the primary parameter to adjust per task type
- Use lower temperature when the same input must reliably produce the same output
- Use model routing (different models per step) to match capability to task complexity without raising temperature
