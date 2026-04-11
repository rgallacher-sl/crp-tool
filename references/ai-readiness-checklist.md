# AI Readiness Checklist

Checks for making design system work machine-readable and agent-friendly. Two sections: one for authoring components in a design system, one for consuming a design system in a downstream project.

---

## Authoring components (design system)

### Tokens
- [ ] Token name communicates purpose, not colour (`color-border-critical` not `cherry-500`)
- [ ] Token has a description explaining when to use it and when not to
- [ ] No hardcoded colour, spacing, or typography values — all tokens
- [ ] Dark mode works without touching component code (CSS variable swap only — if not, the token layer is incomplete)

### Naming and props
- [ ] Component named by function, not appearance (`StatusBadge` not `GreenPill`)
- [ ] All props have JSDoc: type, allowed values, default, what it *signals*, constraints
- [ ] Props that communicate semantic meaning are documented at that level (`appearance="danger"` = "high-stakes or destructive action", not just "renders red")
- [ ] No undocumented `...rest` spreads — if props are passed through, document what the root element accepts

### Composition
- [ ] Composition rules explicit: required / optional / forbidden child components
- [ ] No barrel file (`index.ts` re-exporting everything) hiding component relationships — prefer explicit imports or shallow barrels

### Accessibility
- [ ] ARIA role(s) and required attributes documented in the component contract
- [ ] Keyboard interactions documented (what keys do what)
- [ ] Focus behaviour documented (where focus goes on open / close / select)

### Variants
- [ ] Variants defined in a structured config (CVA or equivalent) — not scattered across prose docs
- [ ] All valid variant combinations enumerable from the config

---

## Consuming components (downstream UI projects)

### Token discipline
- [ ] No hardcoded colour, spacing, or typography values anywhere — always semantic tokens
- [ ] Not referencing raw/primitive token values directly (e.g. `--color-red-500`) — always the semantic layer

### Component usage
- [ ] Using system components by their intended function — not copying and diverging
- [ ] Not reaching for raw HTML elements when a system component exists for that purpose
- [ ] Composition rules followed — not nesting components in forbidden combinations

### Avoiding drift
- [ ] Not adding one-off styles that duplicate patterns already in the system
- [ ] Not overriding ARIA attributes unless there is a documented reason
- [ ] New UI patterns not handled by the system flagged for addition to the system, not solved inline and forgotten
