---
title: "Getting Started"
summary: "Install glissando and build your first slide deck."
---

# Getting Started

Install glissando, create a `slides.ts` file, and build a `.pptx` in under 2 minutes.

## Prerequisites

- **Node.js** 18+
- **npm** (comes with Node)

## Setup

<Steps>
  <Step title="Clone and install">
    ```bash
    git clone https://github.com/concertoy/glissando.git
    cd glissando
    npm install
    ```
  </Step>
  <Step title="Install fonts (optional)">
    The default `claudeDoc` theme uses DM Serif Display, Inter, and JetBrains Mono. Install them or use `basicWhite` which needs no font installation.

    <Tabs>
      <Tab title="Install theme fonts">
        ```bash
        ./scripts/install-fonts.sh
        ```
      </Tab>
      <Tab title="Use macOS native fonts">
        ```ts
        import { claudeDoc, applyPreset } from "../../src/themes/claude-doc/index.js";
        import { macosNative } from "../../src/themes/claude-doc/presets.js";

        const deck = new Deck(applyPreset(claudeDoc, macosNative));
        ```
      </Tab>
      <Tab title="Use basicWhite (no install)">
        ```ts
        import { basicWhite } from "../../src/themes/basic-white/index.js";

        const deck = new Deck(basicWhite);
        ```
      </Tab>
    </Tabs>
  </Step>
  <Step title="Create your deck">
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
  </Step>
  <Step title="Build">
    ```bash
    ./build.sh examples/my-deck
    ```

    This produces `examples/my-deck/output.pptx`. Open it in PowerPoint or Keynote.
  </Step>
</Steps>

## Development commands

| Command | Purpose |
|---|---|
| `./build.sh examples/<deck>` | Build a deck to `output.pptx` |
| `npx tsx scripts/runner.ts <path>` | Run the builder directly |
| `npx tsc --noEmit` | Type-check the library |
| `npm test` | Smoke-test all example decks |

## Next steps

<Columns>
  <Card title="Creating Decks" href="/guide/creating-decks" icon="file-text">
    Learn all the layout methods and how to structure slides.
  </Card>
  <Card title="Themes" href="/guide/themes" icon="palette">
    Choose a theme and customize fonts.
  </Card>
  <Card title="Custom Slides" href="/guide/custom-slides" icon="layout">
    Build freeform layouts with components and diagrams.
  </Card>
</Columns>
