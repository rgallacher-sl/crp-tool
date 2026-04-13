---
name: component-states
description: Identify all required states for a UI component before designing or implementing it — covers interaction, validation, accessibility, and page-level states.
---

# Component States

Load this before designing or implementing any UI component. Use it to produce a complete state inventory so nothing is missed in Figma or code.

---

## When to load

- Before building a new component
- Before designing a component in Figma
- When the user asks "what states do we need for X"

---

## Process

1. **Query the design systems** via whatever tooling your agent supports (Claude: use context7 then web search as fallback):
   - GOV.UK Design System — `/alphagov/govuk-design-system`
   - IBM Carbon Design System — `/carbon-design-system/carbon`
   - If neither covers the component, search other reputable systems (Material, SAP Fiori)
   - For keyboard interaction patterns and ARIA roles, use the W3C ARIA Authoring Practices Guide (APG) — this is a web standard, not a design system
   - Always state which source informed each state

1a. **For auth components** (sign-up, sign-in, password reset, email change) — load [references/auth-security.md](../../references/auth-security.md) and apply its constraints as design inputs before defining states

2. **Cross-reference WCAG 2.2 AA** — the following states are required for all interactive components:
   - Visible focus state (2.4.11 — focus appearance)
   - Error identification (3.3.1)
   - Error suggestion (3.3.3)

3. **Output a structured state inventory** using the tables below

---

## State categories

### Input / field states

| State | Required | Notes |
|---|---|---|
| Default (empty) | Always | |
| Focus | Always | Must be visually distinct — WCAG 2.4.11 |
| Filled | Always | User has entered a value |
| Error | Always | Border + message above input, below label (GOV.UK pattern) |
| Disabled | If applicable | Only when a preceding action is required first |
| Read-only | If applicable | |

### Password field (additional)

| State | Required | Notes |
|---|---|---|
| Hidden (dots) | Always | Default — GOV.UK: hide by default |
| Visible (plain text) | Always | Toggled by "Show password" button |
| Error + hidden | Always | Error and dots simultaneously |
| Error + visible | Always | Error and plain text simultaneously |
| Toggle label: show | Always | "Show password" — not just "Show" (screen reader) |
| Toggle label: hide | Always | "Hide password" — not just "Hide" (screen reader) |

### Page / form states

| State | Required | Notes |
|---|---|---|
| Default | Always | Clean, no errors |
| Validation failed | Always | Inline errors per field + error summary at top of page (GOV.UK) |
| Submitting | Always | Button disabled/loading to prevent double-submit |
| Server error | If applicable | e.g. email already exists, network failure |
| Success | Always | Confirmation or redirect after successful submission |

---

## Error message rules (GOV.UK)

- Empty field: "Enter [thing]" — e.g. "Enter your email address"
- Invalid format: "Enter a valid [thing]" — e.g. "Enter a valid email address"
- Too short/long: "[Thing] must be [n] characters or more/less"
- Error summary: list all errors at the top of the page with anchor links to each field — critical for screen reader users

---

## Output format

Return a table per component grouping states by category. Note the source (GOV.UK / Carbon / WCAG / other) for each non-obvious state.

---

## Next step

Once states are defined and built, load [accessibility](../accessibility/SKILL.md) to audit the implementation.
