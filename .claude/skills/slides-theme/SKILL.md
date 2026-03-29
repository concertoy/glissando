---
name: slides-theme
description: "Create a new glissando slide theme from a visual description. Use when the user says '/slides-theme', 'create a theme', 'design a new theme', 'make a theme with these colors', or wants to customize the visual style of their decks."
allowed-tools: Read, Write, Bash, Glob, WebFetch
argument-hint: "<description of desired theme style>"
---

Create a new glissando theme based on the user's request: $ARGUMENTS

## Workflow

### 0. Visual extraction (when user provides a URL or screenshot)

If the user references a website, screenshot, or visual: fetch/render it, then extract the color palette (hex values) and font names. Use WebFetch for URLs; use Read for local images. Identify: primary/secondary/accent colors, heading font, body font, code font.

### 1. Create theme

1. Gather: theme name, color palette, font choices, overall vibe
2. Create `src/themes/<name>/` with 4 files (see structure below)
3. Create a test deck at `examples/<name>-demo/slides.ts`

### 2. Install fonts

1. Add a `<theme>` case to `scripts/install-fonts.sh` for the new theme's fonts
2. Run: `./scripts/install-fonts.sh <theme>`
3. Fonts are installed with a `vs-` prefix (e.g. `vs-PlayfairDisplay-400.ttf`) to avoid colliding with system fonts

### 3. Build and verify

1. Build: `./build.sh examples/<name>-demo`
2. Render:
   ```bash
   npx tsx scripts/render-slide.ts examples/<name>-demo/output.pptx --all --output /tmp/glissando-render
   ```
3. Read each PNG to check colors, fonts, spacing, contrast
4. **Font debug**: if a font renders as fallback (wrong typeface in PNG), check the PostScript name in the installed `.ttf` matches the name in `config.ts`. Use `fc-list | grep vs-` (Linux) or `ls ~/Library/Fonts/vs-*` (macOS) to verify installation.

### 4. Iterate

Show the user what the slides look like. Adjust `config.ts` based on feedback, rebuild, re-render. Repeat until approved.

### Font uninstall

All glissando fonts use the `vs-` prefix. To remove all: `rm ~/Library/Fonts/vs-*` (macOS) or `rm ~/.local/share/fonts/vs-*` (Linux).

## Theme file structure

Create 4 files in `src/themes/<name>/`:

### `config.ts` — colors, fonts, sizes

```ts
import type { ThemeConfig } from "../../types.js";

export const config: ThemeConfig = {
  name: "<name>",

  colors: {
    bgPrimary:      "FFFFFF",    // Main slide background
    bgDark:         "FFFFFF",    // Title/closing slide background
    bgAccent:       "FFFFFF",    // Section divider background
    bgCard:         "F2F2F7",    // Card/panel background
    text:           "000000",    // Primary text
    textSecondary:  "333333",    // Body text
    textMuted:      "8E8E93",    // Captions
    textOnDark:     "000000",    // Text on title slides
    textOnDarkMuted:"8E8E93",    // Subtitle on title slides
    accent:         "007AFF",    // Brand accent color
    accentBlue:     "007AFF",    // Secondary accent
    codeBg:         "F5F5F7",    // Code block background
    codeText:       "1D1D1F",    // Code block text
  },

  fonts: {
    heading: "Helvetica Neue",   // Titles, headings
    sans:    "Helvetica Neue",   // Body text, bullets
    serif:   "Helvetica Neue",   // Quotes
    mono:    "Menlo",            // Code blocks
  },

  sizes: {
    title: 44, subtitle: 24, sectionTitle: 36, heading: 28,
    body: 18, small: 14, code: 13, caption: 12,
  },

  spacing: {
    slideWidth: 13.33, slideHeight: 7.5,
    marginLeft: 1.0, marginRight: 1.0, marginTop: 0.6, marginBottom: 0.5,
  },

  codeStyle: {
    bg: "F5F5F7", text: "1D1D1F", border: "D1D1D6", borderRadius: 0.08,
    keyword: "9B2393", string: "0B4F30", comment: "8E8E93",
    number: "1C00CF", function: "326D74", operator: "1D1D1F", label: "8E8E93",
  },
};
```

### `components.ts` — reuse existing factory

```ts
export { createComponents } from "../claude-doc/components.js";
```

Only write custom components if the theme needs fundamentally different shapes or layout patterns.

### `layouts.ts` — reuse or customize

For most themes, reuse claude-doc layouts (they read colors/fonts from config):

```ts
export { layouts } from "../claude-doc/layouts.js";
```

Or customize if the theme needs different positioning (e.g. centered titles, no accent bars).

### `index.ts` — export the theme

```ts
import type { Theme } from "../../types.js";
import { config } from "./config.js";
import { createComponents } from "./components.js";
import { layouts } from "./layouts.js";

export const <themeName>: Theme = { config, createComponents, layouts };
```

## Test deck template

Generate `examples/<name>-demo/slides.ts` that exercises every layout:

```ts
import { Deck } from "../../src/index.js";
import { <themeName> } from "../../src/themes/<name>/index.js";

export default async function build() {
  const deck = new Deck(<themeName>);
  deck.title({ title: "Theme Preview", subtitle: "<name>" });
  deck.section({ title: "Section Divider" });
  deck.content({ title: "Bullet Points", bullets: ["First point", "Second point", "Third point"] });
  deck.twoColumn({ title: "Comparison", leftTitle: "Left", left: ["A", "B"], rightTitle: "Right", right: ["C", "D"] });
  deck.code({ title: "Code Block", code: "function hello() {\n  console.log('Hello!');\n}", language: "typescript" });
  deck.table({ title: "Data Table", headers: ["Name", "Value"], rows: [["Alpha", "100"], ["Beta", "200"]] });
  deck.quote({ quote: "Design is not just what it looks like. Design is how it works.", attribution: "Steve Jobs" });
  await deck.equation({ title: "Equation", equations: [{ latex: "E = mc^2" }] });
  deck.title({ title: "End" });
  return deck;
}
```

## Reference

Read `src/themes/basic-white/config.ts` for a minimal complete example. Read `src/themes/claude-doc/config.ts` for a full-featured example with code style and emoji support.
