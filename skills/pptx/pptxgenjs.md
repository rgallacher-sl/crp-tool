# Creating Presentations with PptxGenJS

Use when building a deck from scratch (no template).

```bash
npm install -g pptxgenjs react react-dom react-icons sharp
```

---

## Basic Structure

```javascript
const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9"; // 10" × 5.625"
pres.title = "Presentation Title";

const slide = pres.addSlide();
slide.addText("Hello", { x: 0.5, y: 0.5, fontSize: 36, color: "111111" });

pres.writeFile({ fileName: "output.pptx" });
```

**Layouts:**
- `LAYOUT_16x9` — 10" × 5.625" (default, most common)
- `LAYOUT_16x10` — 10" × 6.25"
- `LAYOUT_4x3` — 10" × 7.5"
- `LAYOUT_WIDE` — 13.3" × 7.5"

All coordinates and sizes are in **inches**.

---

## Text

```javascript
// Basic
slide.addText("Title", {
  x: 0.5, y: 0.3, w: 9, h: 0.8,
  fontSize: 40, bold: true, color: "111111", align: "left"
});

// Rich text (mixed formatting)
slide.addText([
  { text: "Bold label: ", options: { bold: true } },
  { text: "regular text" }
], { x: 0.5, y: 1.5, w: 9, h: 0.5, fontSize: 16, color: "333333" });

// Multi-line
slide.addText([
  { text: "Line one", options: { breakLine: true } },
  { text: "Line two", options: { breakLine: true } },
  { text: "Line three" }
], { x: 0.5, y: 1, w: 8, h: 2, fontSize: 16 });

// Letter spacing
slide.addText("HEADING", { x: 0.5, y: 0.5, w: 9, h: 0.7, charSpacing: 4 });

// Precise alignment with shapes — set margin: 0
slide.addText("Label", { x: 1, y: 1, w: 4, h: 0.5, margin: 0 });
```

---

## Bullets

```javascript
// ✅ Correct
slide.addText([
  { text: "First item", options: { bullet: true, breakLine: true } },
  { text: "Second item", options: { bullet: true, breakLine: true } },
  { text: "Third item", options: { bullet: true } }
], { x: 0.5, y: 1, w: 9, h: 3, fontSize: 16 });

// Numbered list
slide.addText([
  { text: "Step one", options: { bullet: { type: "number" }, breakLine: true } },
  { text: "Step two", options: { bullet: { type: "number" } } }
], { x: 0.5, y: 1, w: 9, h: 2, fontSize: 16 });

// ❌ Never use unicode bullets — creates double bullets
slide.addText("• Item"); // wrong
```

---

## Shapes

```javascript
// Rectangle
slide.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: 0, w: 10, h: 5.625,
  fill: { color: "1A1A2E" }
});

// Accent bar
slide.addShape(pres.shapes.RECTANGLE, {
  x: 0.5, y: 1.0, w: 0.06, h: 1.2,
  fill: { color: "E94560" }
});

// Line
slide.addShape(pres.shapes.LINE, {
  x: 0.5, y: 5.2, w: 9, h: 0,
  line: { color: "CCCCCC", width: 1 }
});

// Shadow (use factory function — pptxgenjs mutates option objects)
const makeShadow = () => ({
  type: "outer", color: "000000", opacity: 0.15,
  blur: 6, offset: 3, angle: 135
});
slide.addShape(pres.shapes.RECTANGLE, {
  x: 1, y: 1, w: 4, h: 2,
  fill: { color: "FFFFFF" },
  shadow: makeShadow()
});
```

---

## Images

```javascript
// From file
slide.addImage({ path: "images/photo.jpg", x: 5, y: 0.5, w: 4.5, h: 3 });

// Fill area (cover crop)
slide.addImage({
  path: "images/bg.jpg",
  x: 0, y: 0, w: 10, h: 5.625,
  sizing: { type: "cover", w: 10, h: 5.625 }
});

// Circular crop
slide.addImage({ path: "headshot.jpg", x: 1, y: 1, w: 2, h: 2, rounding: true });

// Preserve aspect ratio
const origW = 1920, origH = 1080, targetH = 3.0;
const calcW = targetH * (origW / origH);
slide.addImage({ path: "img.jpg", x: (10 - calcW) / 2, y: 1, w: calcW, h: targetH });
```

---

## Icons

```javascript
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const { FiCheckCircle, FiArrowRight } = require("react-icons/fi");

async function iconPng(Icon, color = "#111111", size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(Icon, { color, size: String(size) })
  );
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

// Usage
const icon = await iconPng(FiCheckCircle, "#E94560", 256);
slide.addImage({ data: icon, x: 0.5, y: 1, w: 0.4, h: 0.4 });
```

Use size 256+ for crisp rendering. `w`/`h` on addImage controls display size, not resolution.

---

## Backgrounds

```javascript
slide.background = { color: "1A1A2E" };          // solid
slide.background = { path: "bg.jpg" };           // image
slide.background = { data: "image/png;base64,..." }; // base64
```

---

## Charts

```javascript
slide.addChart(pres.charts.BAR, [{
  name: "Revenue",
  labels: ["Q1", "Q2", "Q3", "Q4"],
  values: [42000, 55000, 61000, 78000]
}], {
  x: 0.5, y: 0.8, w: 9, h: 4,
  barDir: "col",
  chartColors: ["E94560"],
  chartArea: { fill: { color: "FFFFFF" } },
  catAxisLabelColor: "666666",
  valAxisLabelColor: "666666",
  valGridLine: { color: "EEEEEE", size: 0.5 },
  catGridLine: { style: "none" },
  showValue: true,
  dataLabelColor: "111111",
  showLegend: false,
});
```

---

## Common Pitfalls

| Pitfall | Fix |
|---------|-----|
| `color: "#FF0000"` — corrupts file | Use `color: "FF0000"` (no `#`) |
| 8-char hex for opacity (`"00000020"`) — corrupts file | Use `opacity: 0.12` property instead |
| Reusing shadow/option objects across calls | Use a factory function: `const makeShadow = () => ({...})` |
| `lineSpacing` with bullets | Use `paraSpaceAfter` instead |
| `ROUNDED_RECTANGLE` with rectangular accent overlay | Use `RECTANGLE` — rounded corners won't align |
| Shadow `offset` negative value | Always positive — use `angle` to control direction |
| Shadow upward (footer) | `angle: 270` with positive `offset` |
