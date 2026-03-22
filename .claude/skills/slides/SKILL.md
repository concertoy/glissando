---
name: slides
description: "Create a new Glissando slide deck from a natural language description. Use when the user says '/slides', 'create a deck', 'build a presentation', 'make slides about', or asks for a new talk/pitch deck."
allowed-tools: Read, Write, Bash, Glob
argument-hint: "<description of the deck>"
---

Create a Glissando slide deck based on the user's request: $ARGUMENTS

## Workflow

1. Create a new folder under `examples/` (e.g. `examples/my-deck/`)
2. Write `slides.ts` in that folder using the API below
3. Build with `./build.sh examples/my-deck`
4. Confirm the build succeeds

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
