---
name: slides
description: "Create a new Glissando slide deck from a natural language description. Use when the user says '/slides', 'create a deck', 'build a presentation', 'make slides about', or asks for a new talk/pitch deck."
allowed-tools: Read, Write, Bash, Glob
argument-hint: "<description of the deck>"
---

Create a Glissando slide deck based on the user's request: $ARGUMENTS

## Workflow

1. Plan the slide structure based on the user's request
2. Create a new folder under `examples/` (e.g. `examples/my-deck/`)
3. For diagram slides, decide: **built-in components or image generation?** (see decision guide below)
4. Write `slides.ts` in that folder
5. Build with `./build.sh examples/my-deck`
6. Confirm the build succeeds

## Diagrams: components first, images last

**Always prefer built-in diagram components.** They produce vector, editable, themed shapes that move together. Image generation is a last resort.

### Decision guide

Can the diagram be expressed as **labeled boxes + arrows**? → Use built-in components on a `deck.blank()` slide.

- Flowcharts, pipelines, process steps → **components**
- Architecture diagrams (boxes + connections) → **components**
- Tokenization steps, data flow → **components**
- Tree/hierarchy structures → **components**
- State machines → **components**
- Photos, illustrations, charts with curves, complex visuals → **image generation** (only if `~/.glissando/config.json` exists)

### Diagram component API (for `deck.blank()` slides)

```ts
const { diagramBox: box, arrow, container } = deck.components;
const sp = deck.config.spacing;

// Boxes return ShapeRef with connection points (.top, .right, .bottom, .left)
const a = box(slide, { text: "Input", x: 1, y: 3, w: 2.5, h: 1, fill: "E8DFC4", border: "D4C9A0" });
const b = box(slide, { text: "Process", x: 5, y: 3, w: 2.5, h: 1, fill: "D4956C", border: "C07A50", textColor: "FFFFFF" });
const c = box(slide, { text: "Output", x: 9, y: 3, w: 2.5, h: 1, fill: "B8613D", border: "9A4E30", textColor: "FFFFFF" });

// Arrows between boxes
arrow(slide, { from: { x: 3.5, y: 3.5 }, to: { x: 5, y: 3.5 } });
arrow(slide, { from: { x: 7.5, y: 3.5 }, to: { x: 9, y: 3.5 } });

// Native connectors (move with shapes when dragged)
deck.connector({ from: a.right, to: b.left, type: "straight" });

// Grouping container
container(slide, { label: "System", x: 0.5, y: 2, w: 12, h: 3.5, fill: "F9F9F7", border: "B8B8B8" });
```

### Image generation (fallback only)

Only if the diagram cannot be built with shapes, and `~/.glissando/config.json` exists:

```bash
npx tsx scripts/generate-figure.ts "<description>" examples/my-deck/figure.png
```

Then reference with `deck.image({ title, imagePath: img("figure.png") })`.

## Layout API

Every method is called on `deck` and returns `this` (chainable).

| Method | Use for |
|---|---|
| `deck.title({ title, subtitle? })` | Opening and closing slides (dark bg) |
| `deck.section({ title, subtitle? })` | Section dividers between topics (warm bg) |
| `deck.content({ title, subtitle?, bullets })` | Main content with bullet points |
| `deck.twoColumn({ title, leftTitle?, rightTitle?, left, right })` | Side-by-side comparison |
| `deck.code({ title, code, language? })` | Code example with syntax highlighting |
| `deck.quote({ quote, attribution? })` | Featured quote |
| `deck.image({ title, imagePath, caption? })` | Image with heading |
| `deck.table({ title, headers, rows })` | Data table |
| `await deck.equation({ title, equations: [{ latex, label? }] })` | LaTeX equations (async) |
| `deck.blank({ bg? })` | Empty slide for custom component placement |

## Example

```ts
import { Deck } from "../../src/index.js";
import { claudeDoc } from "../../src/themes/claude-doc/index.js";

export default function build() {
  const deck = new Deck(claudeDoc);

  deck.title({ title: "AI-Powered Dev Tools", subtitle: "A Practical Guide" });

  deck.section({ title: "The Landscape" });

  deck.content({
    title: "Key Categories",
    bullets: [
      "Code completion and generation",
      "Automated testing and review",
      "Documentation and refactoring",
    ],
  });

  deck.twoColumn({
    title: "Copilot vs Claude",
    leftTitle: "Copilot",
    left: ["Inline completions", "IDE-native"],
    rightTitle: "Claude",
    right: ["Multi-file edits", "Agentic workflows"],
  });

  deck.code({
    title: "Quick Example",
    code: `def greet(name: str) -> str:\n    return f"Hello, {name}!"`,
    language: "python",
  });

  // Diagram slide using built-in components (preferred over image generation)
  {
    const slide = deck.blank({ bg: "primary" });
    const { heading: hd, diagramBox: box, arrow: ar } = deck.components;
    hd(slide, { text: "How It Works", x: 0.8, y: 0.5, w: 11 });
    const a = box(slide, { text: "Prompt", x: 1, y: 3, w: 2.5, h: 1, fill: "EEF1FA", border: "9BADD4" });
    const b = box(slide, { text: "Agent", x: 5, y: 3, w: 2.5, h: 1, fill: "FAF0EB", border: "DA7756" });
    const c = box(slide, { text: "Code", x: 9, y: 3, w: 2.5, h: 1, fill: "ECFAF0", border: "7BBF96" });
    ar(slide, { from: { x: 3.5, y: 3.5 }, to: { x: 5, y: 3.5 } });
    ar(slide, { from: { x: 7.5, y: 3.5 }, to: { x: 9, y: 3.5 } });
  }

  deck.quote({
    quote: "The best tool is the one that disappears into your workflow.",
    attribution: "Anonymous",
  });

  deck.title({ title: "Thank You" });

  return deck;
}
```

## Layout selection guide

- **Open** with `title`, **close** with `title`
- Use `section` to divide the deck into 2-3 major parts
- Default to `content` for most slides — keep to 3-5 bullets
- Use `twoColumn` for comparisons, pros/cons, before/after
- Use `code` when showing real code — set `language` for syntax highlighting
- Use `quote` sparingly — 1 per deck is usually enough
- One idea per slide. 8-12 slides total is a good range.

## Font presets

Default theme (no extra import needed):
```ts
const deck = new Deck(claudeDoc);
```

macOS native fonts (no install needed on Mac):
```ts
import { applyPreset } from "../../src/themes/claude-doc/index.js";
import { macosNative } from "../../src/themes/claude-doc/presets.js";
const deck = new Deck(applyPreset(claudeDoc, macosNative));
```

Google Fonts:
```ts
import { googleFonts } from "../../src/themes/claude-doc/presets.js";
const deck = new Deck(applyPreset(claudeDoc, googleFonts));
```

## Build

```bash
./build.sh examples/<folder-name>
```

This produces `output.pptx` in the deck folder. If the build fails, fix the TypeScript error and rebuild.

For custom slides with components (callout blocks, diagrams, equations), see `CLAUDE.md`.
