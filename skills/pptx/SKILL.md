---
name: pptx
description: Use when creating, editing, or reading a PowerPoint presentation or .pptx file. Use when the user asks for a deck, slides, a pitch, a presentation, or a visual report. Use when a .pptx file is the input or the desired output, regardless of content type.
compatibility: Requires Node.js (pptxgenjs), LibreOffice (soffice), poppler (pdftoppm), Python 3 with defusedxml and Pillow
metadata:
  source: original
---

# PPTX Skill

## Quick Reference

| Task | Approach |
|------|----------|
| Create from scratch | Read [pptxgenjs.md](pptxgenjs.md) |
| Edit an existing deck | Read [editing.md](editing.md) |
| Extract text from a deck | `python -m markitdown presentation.pptx` |
| Inspect slide layouts | `python scripts/thumbnail.py presentation.pptx` |

---

## Design Brief (Always Do This First)

Before creating or editing any deck, ask or confirm:

1. **Purpose** — pitch, internal update, client report, walkthrough?
2. **Aesthetic** — minimal/clean, bold/editorial, warm/friendly, corporate? Or does the user have a reference to point at?
3. **Light or dark** — light background, dark background, or deck-dependent?
4. **Brand** — any colours, fonts, or logo to apply?
5. **Slide count and key sections** — what needs to be covered?

If the user says "just make it look good" or doesn't specify — default to clean, minimal, good typography, and ask one question: light or dark?

**Never start generating slides before completing the brief.** A wrong aesthetic wastes the whole run.

---

## Creating from Scratch

Read [pptxgenjs.md](pptxgenjs.md) for the full API reference.

```bash
npm install -g pptxgenjs react react-dom react-icons sharp
```

Key rules:
- Never use `#` with hex colours — causes file corruption
- Never reuse option objects across calls — pptxgenjs mutates them
- Use `breakLine: true` between text array items
- Never use unicode bullets (•) — use `bullet: true`

---

## Editing an Existing Deck

Read [editing.md](editing.md) for the full workflow.

Seven steps: **Analyze → Plan → Unpack → Build structure → Edit content → Clean → Pack**

Complete all structural changes (delete, duplicate, reorder slides) before editing any content. Use subagents to edit individual slides in parallel if available.

---

## QA (Always Required)

Assume the first render has problems. Find them before declaring success.

### Content check
```bash
python -m markitdown output.pptx
```
Check for missing content, wrong order, leftover placeholder text.

### Visual check

Convert to images, then inspect with fresh eyes (use a subagent if available):

```bash
# Convert to individual slide images
soffice --headless --convert-to pdf output.pptx
pdftoppm -jpeg -r 150 output.pdf slide
# Creates slide-01.jpg, slide-02.jpg, etc.
```

Inspect prompt for subagent:
```
Visually inspect these slides. Assume there are issues — find them.

Look for:
- Overlapping or clipped text
- Elements too close to edges (< 0.5" margin)
- Low contrast text or icons
- Uneven spacing between sections
- Leftover placeholder content
- Layout inconsistencies across slides

List every issue found, including minor ones.
```

### Fix loop

1. Generate → convert to images → inspect
2. List issues (if none found, look harder)
3. Fix → re-inspect affected slides
4. Repeat until a full pass finds nothing new

---

## Dependencies

```bash
# Python
pip install defusedxml Pillow markitdown[pptx]

# Node
npm install -g pptxgenjs react react-dom react-icons sharp

# System (install via package manager)
# LibreOffice (soffice) — PDF conversion
# poppler-utils (pdftoppm) — PDF to images
```
