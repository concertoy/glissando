---
name: slides
description: "Create a new glissando slide deck from a natural language description. Use when the user says '/slides', 'create a deck', 'build a presentation', 'make slides about', or asks for a new talk/pitch deck."
allowed-tools: Read, Write, Bash, Glob
argument-hint: "<description of the deck>"
---

Create a glissando slide deck based on the user's request: $ARGUMENTS

## Workflow

1. Pick a theme: `claudeDoc` (warm cream, default) or `basicWhite` (clean white)
2. Create a new folder under `examples/`
3. Write `slides.ts` using the layout API
4. Build: `./build.sh examples/<folder>`
5. Visually verify:
   ```bash
   npx tsx scripts/render-slide.ts examples/<folder>/output.pptx --all --output /tmp/glissando-render
   ```
   Read each PNG in `/tmp/glissando-render/` to check every slide.
6. If issues found, fix `slides.ts`, rebuild, re-verify. Repeat until clean.

## Themes

```ts
// Warm cream with terra cotta accent (default)
import { claudeDoc } from "../../src/themes/claude-doc/index.js";
const deck = new Deck(claudeDoc);

// Clean white with blue accent (Keynote-inspired)
import { basicWhite } from "../../src/themes/basic-white/index.js";
const deck = new Deck(basicWhite);

// macOS native fonts (no install needed)
import { applyPreset } from "../../src/themes/claude-doc/index.js";
import { macosNative } from "../../src/themes/claude-doc/presets.js";
const deck = new Deck(applyPreset(claudeDoc, macosNative));
```

## Layout API

| Method | Use for |
|---|---|
| `deck.title({ title, subtitle? })` | Opening and closing slides |
| `deck.section({ title, subtitle? })` | Section dividers |
| `deck.content({ title, subtitle?, bullets })` | Heading + bullet list |
| `deck.twoColumn({ title, leftTitle?, rightTitle?, left, right })` | Side-by-side comparison |
| `deck.code({ title, code, language? })` | Syntax-highlighted code |
| `deck.quote({ quote, attribution? })` | Featured quote |
| `deck.image({ title, imagePath, caption? })` | Image with heading |
| `deck.table({ title, headers, rows })` | Data table |
| `await deck.equation({ title, equations: [{ latex, label? }] })` | LaTeX equations |
| `deck.blank({ bg? })` | Custom slide (use `deck.components` for placement) |

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
    bullets: ["Code generation", "Automated testing", "Documentation"],
  });
  deck.code({
    title: "Quick Example",
    code: `def greet(name):\n    return f"Hello, {name}!"`,
    language: "python",
  });
  deck.quote({ quote: "The best tool disappears into your workflow.", attribution: "Anonymous" });
  deck.title({ title: "Thank You" });
  return deck;
}
```

## Layout selection guide

- **Open** with `title`, **close** with `title`
- Use `section` to divide into 2-3 parts
- Default to `content` — keep to 3-5 bullets per slide
- Use `twoColumn` for comparisons, `code` for code, `quote` sparingly
- One idea per slide. 8-12 slides total.
- For diagrams: prefer built-in `diagramBox` + `arrow` components on `blank()` slides. See `CLAUDE.md` for the full component API.
