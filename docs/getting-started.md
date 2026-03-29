---
title: "Getting Started"
summary: "Install glissando and build your first slide deck."
---

# Getting Started

## Prerequisites

- **Node.js** 18+
- **npm** (comes with Node)

## 1. Clone and install

```bash
git clone https://github.com/concertoy/glissando.git
cd glissando
npm install
```

## 2. Install fonts (optional)

The default `claudeDoc` theme uses DM Serif Display, Inter, and JetBrains Mono. You have three options:

```bash
# Option A: install the default fonts
./scripts/install-fonts.sh claude-doc default
```

```ts
// Option B: use macOS native fonts (no install needed)
import { claudeDoc, applyPreset } from "../../src/themes/claude-doc/index.js";
import { macosNative } from "../../src/themes/claude-doc/presets.js";
const deck = new Deck(applyPreset(claudeDoc, macosNative));
```

```ts
// Option C: use basicWhite theme (no install needed)
import { basicWhite } from "../../src/themes/basic-white/index.js";
const deck = new Deck(basicWhite);
```

## 3. Create your deck

Create a folder under `examples/` and add a `slides.ts` file:

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
  deck.quote({
    quote: "The best tool disappears into your workflow.",
    attribution: "Anonymous",
  });
  deck.title({ title: "Thank You" });

  return deck;
}
```

## 4. Build

```bash
./build.sh examples/my-deck
```

This produces `examples/my-deck/output.pptx`. Open it in PowerPoint or Keynote.

## Development commands

| Command | Purpose |
|---|---|
| `./build.sh examples/<deck>` | Build a deck to `output.pptx` |
| `npx tsx scripts/runner.ts <path>` | Run the builder directly |
| `npx tsc --noEmit` | Type-check the library |
| `npm test` | Smoke-test all example decks |

## Next steps

- [Creating Decks](/guide/creating-decks) — Learn all the layout methods and how to structure slides.
- [Themes](/guide/themes) — Choose a theme and customize fonts.
- [Custom Slides](/guide/custom-slides) — Build freeform layouts with components and diagrams.
