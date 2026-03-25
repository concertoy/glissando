---
title: "Themes"
summary: "Choose and customize themes: claudeDoc, basicWhite, elegantBw."
---

# Themes

Every deck uses a theme that controls all visual styling. The agent provides content; the theme handles colors, fonts, spacing, and component design.

**Theme = Config + Components + Layouts**

- **Config**: colors, fonts, sizes, spacing, code style
- **Components**: pre-designed visual elements (code block, bullet list, callout, etc.)
- **Layouts**: pre-designed slide arrangements that compose components

## Available themes

| Theme | Style | Headings | Body | Code | Install |
|---|---|---|---|---|---|
| `claudeDoc` | Warm cream, terracotta accent | DM Serif Display | Inter | JetBrains Mono | `./scripts/install-fonts.sh` |
| `basicWhite` | Pure white, Apple blue accent | Helvetica Neue | Helvetica Neue | Menlo | No install needed |
| `elegantBw` | Monochromatic black/white | Space Grotesk | Inter | JetBrains Mono | `./scripts/install-fonts.sh elegant-bw` |

## Usage

<Tabs>
  <Tab title="claudeDoc (default)">
    ```ts
    import { Deck } from "../../src/index.js";
    import { claudeDoc } from "../../src/themes/claude-doc/index.js";

    const deck = new Deck(claudeDoc);
    ```
  </Tab>
  <Tab title="basicWhite">
    ```ts
    import { Deck } from "../../src/index.js";
    import { basicWhite } from "../../src/themes/basic-white/index.js";

    const deck = new Deck(basicWhite);
    ```
  </Tab>
  <Tab title="elegantBw">
    ```ts
    import { Deck } from "../../src/index.js";
    import { elegantBw } from "../../src/themes/elegant-bw/index.js";

    const deck = new Deck(elegantBw);
    ```
  </Tab>
</Tabs>

## Font presets

The `claudeDoc` theme supports font presets for different environments:

| Preset | Headings | Body | Code | Install |
|---|---|---|---|---|
| `default` | DM Serif Display | Inter | JetBrains Mono | `./scripts/install-fonts.sh` |
| `macosNative` | Iowan Old Style | Avenir Next | Menlo | No install needed |
| `googleFonts` | Libre Baskerville | Space Grotesk | JetBrains Mono | `./scripts/install-fonts.sh claude-doc google-fonts` |

Apply a preset with `applyPreset`:

```ts
import { claudeDoc, applyPreset } from "../../src/themes/claude-doc/index.js";
import { macosNative } from "../../src/themes/claude-doc/presets.js";

const deck = new Deck(applyPreset(claudeDoc, macosNative));
```

## Font installation

<Tabs>
  <Tab title="macOS / Linux">
    ```bash
    # claudeDoc default fonts
    ./scripts/install-fonts.sh

    # elegantBw fonts
    ./scripts/install-fonts.sh elegant-bw

    # Google Fonts preset
    ./scripts/install-fonts.sh claude-doc google-fonts
    ```
  </Tab>
  <Tab title="Windows">
    ```powershell
    .\scripts\install-fonts.ps1
    ```
  </Tab>
</Tabs>

<Accordion title="Creating a new theme">
  Create a folder in `src/themes/<name>/` with four files:

  - **`config.ts`** — colors, fonts, sizes, spacing, code style, emoji set
  - **`components.ts`** — component factory (can re-export from `claude-doc` or customize)
  - **`layouts.ts`** — slide layout functions
  - **`index.ts`** — export the assembled `Theme` object

  See `src/themes/claude-doc/` for the full reference implementation. The `basicWhite` and `elegantBw` themes are minimal variants that override config and layouts while re-exporting the claude-doc component factory.
</Accordion>
