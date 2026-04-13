---
name: source-weighting
description: Decision rules for how agents should weight curated repo sources vs. training knowledge when forming opinions or recommendations
type: reference
---

# Source Weighting

## The principle

Curated sources exist to surface trusted material that training knowledge might not reach on its own — niche frameworks, cross-domain methods, repo-specific context. Check them first so the right material is in play. Training knowledge is always available alongside — use whichever combination gives the best answer for the task. Be honest: cite real sources when you have them, or give a confidence level when you're drawing on training knowledge.

---

## What to check in this repo

1. **Skills and references** — load on trigger per the AGENTS.md tables before stating a view in that domain
2. **knowledge/** — if this repo has a knowledge corpus, search it before forming any opinion (see AGENTS.md for how)
3. **External named authorities** — if AGENTS.md designates specific external sources (design systems, standards bodies), consult them for decisions in that domain before drawing on training knowledge
4. **Training knowledge** — always in scope; fills gaps, extends reasoning, enables cross-domain connections; never blocked by the layers above

---

## Honesty and citations

- If you've read a source in this session, cite it specifically — file, section, or named pattern
- If you're confident where training knowledge comes from (e.g. a named framework or author), say so
- If you're vague on the source, flag it: "I believe this comes from X but haven't verified"
- If you have no idea, don't guess — label it as training knowledge and leave it uncited
- A wrong citation is worse than none
