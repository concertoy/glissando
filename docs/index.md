---
title: "glissando"
summary: "Component-based slide decks with coding agents. Write TypeScript, get native editable PPTX."
---

# glissando

<p align="center">
  <img src="/assets/light.png" alt="glissando" width="500" class="dark:hidden" />
  <img src="/assets/badge.png" alt="glissando" width="500" class="hidden dark:block" />
</p>

<p align="center">
  <strong>Slide decks as code, built for AI agents.</strong><br />
  Write TypeScript, get native editable PPTX.
</p>

<Columns>
  <Card title="Getting Started" href="/getting-started" icon="rocket">
    Install and build your first deck in 2 minutes.
  </Card>
  <Card title="Themes" href="/guide/themes" icon="palette">
    Three built-in themes with font presets.
  </Card>
  <Card title="API Reference" href="/api/layouts" icon="book-open">
    Layouts, components, emojis, and connectors.
  </Card>
</Columns>

## What is glissando?

glissando is a TypeScript library that turns code into native, editable PowerPoint files. It's designed for AI coding agents: the agent provides content, and the theme handles all positioning, colors, and fonts.

**Theme = Config + Components + Layouts.** You pick a theme, call layout methods like `deck.content()` or `deck.code()`, and glissando produces a `.pptx` you can open in PowerPoint or Keynote.

## Quick start

<Steps>
  <Step title="Install">
    ```bash
    npm install
    ```
  </Step>
  <Step title="Create slides.ts">
    ```ts
    import { Deck } from "../../src/index.js";
    import { claudeDoc } from "../../src/themes/claude-doc/index.js";

    export default function build() {
      const deck = new Deck(claudeDoc);
      deck.title({ title: "My Talk", subtitle: "Author" });
      deck.content({ title: "Agenda", bullets: ["One", "Two", "Three"] });
      deck.title({ title: "Thank You" });
      return deck;
    }
    ```
  </Step>
  <Step title="Build">
    ```bash
    ./build.sh examples/my-deck
    ```
    Open `examples/my-deck/output.pptx` in PowerPoint or Keynote.
  </Step>
</Steps>

## Available themes

| Theme | Style | Install |
|---|---|---|
| `claudeDoc` | Warm cream, terracotta accent, serif headings | `./scripts/install-fonts.sh` |
| `basicWhite` | Pure white, Apple blue accent, Helvetica Neue | No install needed |
| `elegantBw` | Monochromatic black/white, Space Grotesk + Inter | `./scripts/install-fonts.sh elegant-bw` |

See the [Themes guide](/guide/themes) for details and font presets.
