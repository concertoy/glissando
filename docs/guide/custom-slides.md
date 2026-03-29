---
title: "Custom Slides"
summary: "Use blank slides, components, and layout helpers for freeform layouts."
---

# Custom Slides

Use `deck.blank()` and `deck.components` to build freeform slide layouts when the built-in layout methods don't fit your needs.

## Blank slides

`deck.blank()` returns a raw pptxgenjs `Slide`. Pass a background option:

```ts
const slide = deck.blank();                    // primary (white/cream)
const dark = deck.blank({ bg: "dark" });       // dark background
const warm = deck.blank({ bg: "accent" });     // accent background
```

## Using components

Access themed components via `deck.components`:

```ts
const slide = deck.blank({ bg: "primary" });
const { heading, codeBlock, calloutBlock } = deck.components;

heading(slide, { text: "Custom Layout", x: 0.8, y: 0.5, w: 11 });
codeBlock(slide, { code: "print('hello')", x: 0.8, y: 1.5, w: 5, language: "python" });
await calloutBlock(slide, { variant: "info", x: 6.5, y: 1.5, w: 5, body: "A helpful note" });
```

See the [Components reference](/api/components) for all available components and their props.

## Layout helpers

Pure functions for computing component positions. Import from `src/index.js`:

```ts
import { Deck, columns, rows, below, inset } from "../../src/index.js";
```

| Function | Description |
|---|---|
| `deck.area()` | Full usable area inside slide margins |
| `deck.contentArea()` | Area below heading + accent bar |
| `columns(area, n, gap?)` | Split rect into N equal columns |
| `rows(area, n, gap?)` | Split rect into N equal rows |
| `below(area, usedH, gap?)` | Sub-rect below a placed component |
| `inset(area, top, right?, bottom?, left?)` | Inset a rect (CSS-style) |

All helpers work with `Rect` objects (`{ x, y, w, h }`) — the same shape as component props. Use spread syntax:

```ts
const area = deck.contentArea();
const [left, right] = columns(area, 2, 0.4);
codeBlock(slide, { code: "...", language: "python", ...left });
await calloutBlock(slide, { variant: "info", ...right, body: "Note" });

// Vertical stacking with auto-height
const eqRect = await equation(slide, { latex: "E = mc^2", ...area });
const rest = below(area, eqRect.h, 0.3);
bulletList(slide, { items: ["E — energy", "m — mass"], ...rest });
```

## Image component

Place themed images on custom slides with optional caption and border:

```ts
const { image } = deck.components;

// Basic image
image(slide, { path: "./diagram.png", x: 1, y: 1.5, w: 5, h: 3.5 });

// With caption and accent border
image(slide, {
  path: "./results.png",
  x: 1, y: 1.5, w: 5, h: 3.5,
  caption: "Figure 1: Experimental results",
  border: true,        // accent-colored border (or pass a hex string)
  rounding: true,      // rounded corners
  sizing: "contain",   // "contain" (default), "cover", or "crop"
});
```

## Callout blocks

Callout blocks are round-cornered panels with themed backgrounds and icons:

| Variant | Background | Icon | Use for |
|---|---|---|---|
| `card` | White | Pencil | General content, summaries |
| `code` | Warm grey | Lightbulb | Code refs, CLI instructions |
| `info` | Blue tint | Info circle | Tips, notes, helpful info |
| `warning` | Amber | Triangle alert | Cautions, deprecation notices |
| `accent` | Terra cotta | Circle check | Key takeaways, featured items |
| `success` | Green tint | Circle check | Success states, completed items |

```ts
await calloutBlock(slide, {
  variant: "warning",
  x: 1, y: 2, w: 10,
  title: "Breaking Change",
  body: "The API has changed in v2.",
  bullets: ["Update your imports", "Run the migration script"],
});
```

## Diagrams

Build diagrams with `diagramBox`, `arrow`, `hookArrow`, and `container`:

```ts
const slide = deck.blank();
const { diagramBox, arrow, container } = deck.components;

// Grouping container
container(slide, { label: "Pipeline", x: 0.5, y: 1, w: 11, h: 4 });

// Boxes with connection points
const input = diagramBox(slide, { text: "Input", x: 1, y: 2.5, w: 2, h: 1 });
const process = diagramBox(slide, { text: "Process", x: 4.5, y: 2.5, w: 2, h: 1 });
const output = diagramBox(slide, { text: "Output", x: 8, y: 2.5, w: 2, h: 1 });

// Visual arrows (positioned manually)
arrow(slide, { from: { x: 3, y: 3 }, to: { x: 4.5, y: 3 } });
arrow(slide, { from: { x: 6.5, y: 3 }, to: { x: 8, y: 3 } });
```

## Native connectors

For connectors that **move with shapes** when dragged in PowerPoint, use `deck.connector()` with `ShapeRef` connection points:

```ts
const slide = deck.blank();
const { diagramBox } = deck.components;

const boxA = diagramBox(slide, { text: "Source", x: 1, y: 2, w: 2, h: 1 });
const boxB = diagramBox(slide, { text: "Target", x: 6, y: 2, w: 2, h: 1 });

// Native OOXML connector — binds to shapes
deck.connector({ from: boxA.right, to: boxB.left, type: "straight", label: "flow" });
```

Connector types: `straight`, `elbow`, `curved`. Head/tail options: `arrow`, `stealth`, `triangle`, `none`.

## Speaker notes on blank slides

Use `deck.speakerNote()` to add notes to blank slides:

```ts
const slide = deck.blank();
deck.speakerNote(slide, "Explain the architecture before moving on.");
```

For layout methods, use the `notes` parameter directly: `deck.content({ ..., notes: "..." })`.

## Raw pptxgenjs access

For anything not covered by the component API, access the underlying pptxgenjs instance:

```ts
deck.raw  // PptxGenJS instance
```

<Note>
The `deck.config` getter provides access to the theme's colors, fonts, and sizes for consistent styling in custom elements.
</Note>
