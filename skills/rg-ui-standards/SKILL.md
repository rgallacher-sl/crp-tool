---
name: rg-ui-standards
description: Use when building or modifying any UI. Defines personal design standards for spacing, layout, typography, and visual decisions — these take precedence over defaults suggested by other skills. Always load alongside frontend-ui-engineering for any UI work.
metadata:
  source: original
---

# UI Standards

These are personal design standards that apply to all projects. They take precedence over any defaults suggested by other skills.

## Grid & Spacing

All spacing must be a multiple of **4px**. No exceptions.

- Use `4, 8, 12, 16, 24, 32, 48, 64, 96, 128` as your spacing values
- Never use arbitrary values like `13px`, `22px`, `7rem`
- If the project has a token file, read it first — tokens must also follow the 4px grid
- When in doubt, check that `value % 4 === 0`

## Performance Budgets

Where skills conflict on performance numbers, use these values:

- **JavaScript**: < 200KB gzipped (initial load)
- **CSS**: < 50KB gzipped
- **Images (above fold)**: < 200KB per image

## Fonts

Use `font-display: swap`. Do not use `font-display: optional`.

## Source of Truth

Always read the project's token/variables file before writing any styles. Never hardcode spacing, colour, or typography values that aren't defined there. If no token file exists, ask before inventing values.
