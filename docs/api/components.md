---
title: "Components"
summary: "Pre-designed visual elements for custom slides."
---

# Components

Components are themed visual elements used on custom slides via `deck.components`. Each takes a pptxgenjs `Slide` and a props object.

```ts
const slide = deck.blank();
const { heading, bulletList, codeBlock } = deck.components;

heading(slide, { text: "Title", x: 0.8, y: 0.5, w: 11 });
bulletList(slide, { items: ["Point A", "Point B"], x: 0.8, y: 1.5, w: 10 });
```

All components return a `Rect` (`{ x, y, w, h }`) representing their bounding box, enabling vertical stacking and layout chaining.

## Reference

### Text

| Component | Signature | Description |
|---|---|---|
| `heading` | `(slide, { text, x, y, w, color?, fontSize?, bold?, autoFit? })` | Bold heading text |
| `bodyText` | `(slide, { text, x, y, w, h?, color?, fontSize?, bold?, italic?, fontFace?, autoFit? })` | Paragraph text (supports `$math$` syntax) |
| `caption` | `(slide, { text, x, y, w })` | Small muted text |

### Lists

| Component | Signature | Description |
|---|---|---|
| `bulletList` | `(slide, { items, x, y, w, h?, fontSize?, build? })` | Accent-colored bullets (supports `:emoji:` and `$math$` syntax) |
| `numberedList` | `(slide, { items, x, y, w, h?, fontSize?, build? })` | Accent-colored numbered list (supports `$math$` syntax) |

### Content blocks

| Component | Signature | Description |
|---|---|---|
| `codeBlock` | `(slide, { code, x, y, w, h?, language? })` | Syntax-highlighted code panel, auto-height |
| `quoteBox` | `(slide, { quote, x, y, w, h, attribution? })` | Serif quote with accent bar |
| `table` | `(slide, { headers, rows, x, y, w })` | Themed table |
| `calloutBlock` | `(slide, { variant, x, y, w, h?, title?, body?, bullets?, icon? })` | Round-cornered callout panel (async, supports `$math$`) |
| `textBlock` | `(slide, { x, y, w, h?, title?, subtitle?, body?, bullets?, fill?, border?, textColor? })` | Icon-free rounded panel (supports `$math$`) |

### Media

| Component | Signature | Description |
|---|---|---|
| `image` | `(slide, { path\|data, x, y, w, h, caption?, border?, rounding?, sizing? })` | Themed image with optional caption and border frame |
| `emoji` | `(slide, { name, x, y, w?, h? })` | Themed SVG emoji image (async) |

### Decoration

| Component | Signature | Description |
|---|---|---|
| `accentBar` | `(slide, { x, y, w?, h? })` | Thin brand-colored bar |

### Diagrams

| Component | Signature | Description |
|---|---|---|
| `diagramBox` | `(slide, { text, x, y, w, h, fill?, border?, borderWidth?, textColor?, fontSize?, bold? })` | Rounded box, returns `ShapeRef` with connection points |
| `arrow` | `(slide, { from, to, color?, width?, head?, tail?, dashed? })` | Straight arrow between coordinates |
| `hookArrow` | `(slide, { from, to, hookDirection, color?, width?, head?, tail?, dashed? })` | L-shaped elbow arrow |
| `container` | `(slide, { label?, x, y, w, h, border?, fill?, labelColor?, fontSize? })` | Dashed-border grouping box, returns `ShapeRef` |

### Math

| Component | Signature | Description |
|---|---|---|
| `equation` | `(slide, { latex, x, y, w, h?, color?, label? })` | Rendered LaTeX equation (async) |

<Note>
Async components (`calloutBlock`, `equation`, `emoji`) must be awaited.
</Note>

## Callout variants

| Variant | Background | Icon | Use for |
|---|---|---|---|
| `card` | White `#FFFFFF` | Pencil | General content, summaries |
| `code` | Warm grey `#F5F3EF` | Lightbulb | Code refs, CLI instructions |
| `info` | Blue tint `#EEF1FA` | Info circle | Tips, notes, helpful info |
| `warning` | Amber `#FDF5EB` | Triangle alert | Cautions, deprecation notices |
| `accent` | Terra cotta `#FAF0EB` | Circle check | Key takeaways, featured items |
| `success` | Green tint `#ECFAF0` | Circle check | Success states, completed items |

## ShapeRef

`diagramBox` and `container` return a `ShapeRef` with four connection points:

```ts
interface ShapeRef {
  top: ConnectionPoint;
  right: ConnectionPoint;
  bottom: ConnectionPoint;
  left: ConnectionPoint;
}
```

Use these with `deck.connector()` for native OOXML connectors:

```ts
const boxA = diagramBox(slide, { text: "A", x: 1, y: 2, w: 2, h: 1 });
const boxB = diagramBox(slide, { text: "B", x: 6, y: 2, w: 2, h: 1 });
deck.connector({ from: boxA.right, to: boxB.left, type: "elbow" });
```

Connector types: `straight`, `elbow`, `curved`. Head/tail: `arrow`, `stealth`, `triangle`, `none`.
