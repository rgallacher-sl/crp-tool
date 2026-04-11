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
2. **External design system authorities** — for any design decision, consult these systems before drawing on training knowledge; always state which source informed a decision:
   - GOV.UK Design System — public sector, accessible government services
   - IBM Carbon — enterprise product, data-dense UI
   - SAP Fiori — enterprise workflow, form-heavy applications
   - Material Design — consumer product, mobile-first patterns
   - W3C ARIA Authoring Practices Guide — keyboard patterns and ARIA roles when design systems don't cover it
3. **Training knowledge** — always in scope; fills gaps, extends reasoning, enables cross-domain connections; never blocked by the layers above

---

## Honesty and citations

- If you've read a source in this session, cite it specifically — named component, pattern, or WCAG criterion
- If you're confident where training knowledge comes from (e.g. a named framework or author), say so
- If you're vague on the source, flag it: "I believe this comes from X but haven't verified"
- If you have no idea, don't guess — label it as training knowledge and leave it uncited
- A wrong citation is worse than none
