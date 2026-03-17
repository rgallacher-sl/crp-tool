# Editing Presentations

Use when modifying an existing .pptx file as a template.

## Workflow

1. **Analyze** — inspect the template visually and extract its text
2. **Plan** — map content sections to slide layouts, plan layout variety
3. **Unpack** — extract the PPTX to editable XML
4. **Build structure** — delete, duplicate, and reorder slides
5. **Edit content** — update text and visuals in each slide XML
6. **Clean** — remove orphaned files
7. **Pack** — repack to PPTX

**Rule:** Complete steps 3–4 (all structural changes) before any content editing in step 5.

---

## Step 1 — Analyze

```bash
python scripts/thumbnail.py template.pptx          # visual grid
python -m markitdown template.pptx                 # text content
```

Review `thumbnails.jpg` to understand what layouts are available.

---

## Step 2 — Plan Layout Variety

**Monotonous presentations are the most common failure.** Don't repeat title + bullets on every slide. Actively mix:

- Multi-column layouts (2 or 3 columns)
- Image + text
- Full-bleed image with text overlay
- Quote or callout slide
- Section divider
- Large number / stat callout
- Icon grid

Match content type to layout — testimonials → quote slide, stats → number callout, team → multi-column.

---

## Step 3 — Unpack

```bash
python scripts/unpack.py template.pptx unpacked/
```

---

## Step 4 — Build Structure

Slide order is controlled by `<p:sldIdLst>` in `ppt/presentation.xml`.

**Delete a slide:** Remove its `<p:sldId>` entry, then run `clean.py`.

**Duplicate a slide:**
```bash
python scripts/add_slide.py unpacked/ slide2.xml
```
Then add the printed `<p:sldId .../>` line to `<p:sldIdLst>` at the position you want.

**Reorder:** Rearrange `<p:sldId>` elements within `<p:sldIdLst>`.

---

## Step 5 — Edit Content

Use the **Edit tool** for all changes — not sed, not Python scripts. The Edit tool forces precision about what's being changed.

If subagents are available, dispatch one per slide — they are independent XML files.

### Formatting rules

- **Bold headers and inline labels** — set `b="1"` on `<a:rPr>` for titles, section headers, and inline labels like "Status:"
- **No unicode bullets** — use `<a:buChar>` or `<a:buAutoNum>`, never `•`
- **Separate items into separate paragraphs** — never concatenate list items into one `<a:t>` string

**❌ Wrong:**
```xml
<a:t>Step 1: Do thing. Step 2: Do other thing.</a:t>
```

**✅ Correct:**
```xml
<a:p>
  <a:r><a:rPr b="1"/><a:t>Step 1</a:t></a:r>
</a:p>
<a:p>
  <a:r><a:rPr/><a:t>Do thing.</a:t></a:r>
</a:p>
```

### Smart quotes

Use XML entities when adding quoted text:

| Character | Entity |
|-----------|--------|
| `"` left  | `&#x201C;` |
| `"` right | `&#x201D;` |
| `'` left  | `&#x2018;` |
| `'` right | `&#x2019;` |

### Template adaptation

When source content has fewer items than the template, **delete the excess elements entirely** — don't just clear their text. Orphaned images and shapes create visual noise.

---

## Step 6 — Clean

```bash
python scripts/clean.py unpacked/
```

Removes slides not referenced in `<p:sldIdLst>`, orphaned media, and broken relationship files.

---

## Step 7 — Pack

```bash
python scripts/pack.py unpacked/ output.pptx
```

---

## Common Pitfalls

- **Text overflow** — longer replacements may wrap or clip. Check visually after editing.
- **Leftover placeholders** — search for `XXXX`, `Lorem`, `[placeholder]` in markitdown output after packing.
- **One fix breaks another** — always re-inspect affected slides after each fix cycle.
- **XML namespace corruption** — always use `defusedxml.minidom`, not `xml.etree.ElementTree`, when writing scripts that touch PPTX XML.
