# glissando

Component-based slide decks for coding agents. Write TypeScript, get native editable PPTX.

## Quick Start

```bash
npm install
./build.sh examples/mimic-claude-macos           # → output.pptx
./build.sh examples/ai-tooling-tutorial           # → output.pptx
```

## Build, Test, and Development Commands

- `npm install` — install runtime (pptxgenjs, sharp) and tooling dependencies.
- `./build.sh examples/<deck>` — compile `slides.ts` into `output.pptx` inside that example folder.
- `npx tsx runner.ts <path-to-deck>` — run the builder directly when debugging runner changes.
- `npx tsc --noEmit` — type-check the library; keep the tree free of TypeScript errors before opening a PR.
- `npm test` — smoke-test all example decks (builds each, asserts output.pptx is produced).

## Architecture

**Theme = Config + Components + Layouts**

- **Config** (`config.ts`): colors, fonts, sizes, spacing, code style
- **Components** (`components.ts`): pre-designed visual elements (code block, bullet list, callout block, accent bar, quote box, table, etc.) — all themed
- **Layouts** (`layouts.ts`): pre-designed slide arrangements that compose components at fixed positions

The agent only provides **content**. All positioning, colors, and fonts are handled by the theme.

## File Structure

```
src/
  index.ts                  Deck class (public API)
  pptx-patch.ts             PPTX post-processing (font patching, connectors, grouping)
  types.ts                  TypeScript types for Theme, Components, Layouts
  highlight.ts              Syntax highlighter (per-language keyword coloring)
  icons.ts                  Lucide icon renderer (SVG → PNG via sharp)
  emoji.ts                  Themed emoji renderer (SVG → PNG via sharp)
  emoji-data/
    openmoji-outline.ts     Monochrome outline SVGs (~29 elegant emojis, default)
    openmoji.ts             Full-color OpenMoji SVGs (~47 emojis)
    twemoji.ts              Full-color Twemoji SVGs (~47 emojis)
    aliases.ts              Common emoji name aliases
  themes/
    claude-doc/
      index.ts              Theme object + applyPreset helper
      config.ts             Colors, fonts, sizes, spacing, code style
      components.ts         Pre-designed components (factory)
      layouts.ts            Pre-designed slide layouts
      presets.ts            Font presets (default, macosNative, googleFonts)
    basic-white/
      index.ts              Theme object (exports basicWhite)
      config.ts             White/black/blue colors, Helvetica Neue + Menlo
      components.ts         Re-exports claude-doc component factory
      layouts.ts            Clean layouts — no accent bars, centered titles
    elegant-bw/
      index.ts              Theme object (exports elegantBw)
      config.ts             Monochromatic black/white, Space Grotesk + Inter
      components.ts         Re-exports claude-doc component factory
      layouts.ts            Generous whitespace, centered layouts
examples/
  ai-tooling-tutorial/      Real-world deck (default preset)
  basic-white-demo/         Basic White theme demo (Keynote-inspired)
  elegant-bw-demo/          Elegant BW theme demo (monochromatic minimalism)
  mimic-claude-macos/       macOS native fonts (Iowan Old Style + Avenir Next)
  mimic-claude-google-fonts/  Google Fonts (Libre Baskerville + Space Grotesk)
build.sh                    Universal build: ./build.sh <path>
runner.ts                   Build runner (called by build.sh)
scripts/
  install-fonts.sh          Font installer (macOS/Linux)
  install-fonts.ps1         Font installer (Windows)
```

## Creating a New Deck

1. Create a folder under `examples/` (or anywhere)
2. Add `slides.ts` — import Deck and a theme, call layout methods, return the deck
3. Run `./build.sh <your-folder>`

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

### Using Basic White Theme

```ts
import { Deck } from "../../src/index.js";
import { basicWhite } from "../../src/themes/basic-white/index.js";

export default function build() {
  const deck = new Deck(basicWhite);
  // ... same layout API, Keynote-inspired clean white look
  return deck;
}
```

### Using a Font Preset

```ts
import { claudeDoc, applyPreset } from "../../src/themes/claude-doc/index.js";
import { macosNative } from "../../src/themes/claude-doc/presets.js";
// or: import { googleFonts } from "../../src/themes/claude-doc/presets.js";

export default function build() {
  const deck = new Deck(applyPreset(claudeDoc, macosNative));
  // ...
}
```

## Font Presets

| Preset | Headings | Body | Code | Install |
|---|---|---|---|---|
| `default` | DM Serif Display | Inter | JetBrains Mono | `./scripts/install-fonts.sh` |
| `macosNative` | Iowan Old Style | Avenir Next | Menlo | No install needed |
| `googleFonts` | Libre Baskerville | Space Grotesk | JetBrains Mono | `./scripts/install-fonts.sh claude-doc google-fonts` |

## Available Themes

| Theme | Style | Headings | Body | Code | Install |
|---|---|---|---|---|---|
| `claudeDoc` | Warm cream, terracotta accent | DM Serif Display | Inter | JetBrains Mono | `./scripts/install-fonts.sh` |
| `basicWhite` | Pure white, Apple blue accent | Helvetica Neue | Helvetica Neue | Menlo | No install needed |
| `elegantBw` | Monochromatic black/white | Space Grotesk | Inter | JetBrains Mono | `./scripts/install-fonts.sh elegant-bw` |

## Available Layouts

| Method | Description |
|---|---|
| `deck.title({ title, subtitle? })` | Dark bg opening/closing slide |
| `deck.section({ title, subtitle? })` | Warm bg section divider |
| `deck.content({ title, subtitle?, bullets })` | Heading + bullet list |
| `deck.twoColumn({ title, leftTitle?, rightTitle?, left, right })` | Two-column comparison |
| `deck.code({ title, code, language? })` | Heading + code panel (syntax highlighted) |
| `deck.quote({ quote, attribution? })` | Large quote on accent bg |
| `deck.image({ title, imagePath, caption? })` | Heading + image |
| `deck.table({ title, headers, rows })` | Heading + themed table |
| `await deck.equation({ title, equations })` | Heading + rendered LaTeX equations |
| `deck.blank({ bg? })` | Empty slide (returns raw pptxgenjs slide) |

## Available Components

Components can be used directly for custom slides via `deck.components`:

- `accentBar(slide, { x, y, w?, h? })` — thin brand-colored bar
- `heading(slide, { text, x, y, w })` — bold heading text
- `bodyText(slide, { text, x, y, w, h? })` — paragraph text
- `bulletList(slide, { items, x, y, w, h? })` — accent-colored bullets
- `numberedList(slide, { items, x, y, w, h? })` — accent-colored numbers
- `codeBlock(slide, { code, x, y, w, h?, language? })` — code panel with syntax highlighting, auto-height
- `quoteBox(slide, { quote, x, y, w, h, attribution? })` — serif quote with accent bar
- `table(slide, { headers, rows, x, y, w })` — themed table
- `caption(slide, { text, x, y, w })` — small muted text
- `calloutBlock(slide, { variant, x, y, w, h?, body?, bullets? })` — round-cornered callout panel (async)
- `textBlock(slide, { x, y, w, h?, title?, subtitle?, body?, bullets?, fill?, border?, textColor? })` — icon-free rounded panel with optional title/subtitle
- `diagramBox(slide, { text, x, y, w, h, fill?, border?, textColor? })` — rounded box returning `ShapeRef` with connection points
- `arrow(slide, { from, to, color?, width?, head?, tail?, dashed? })` — straight arrow between coordinates
- `hookArrow(slide, { from, to, hookDirection, ... })` — L-shaped elbow arrow
- `container(slide, { label?, x, y, w, h, border?, fill? })` — dashed-border grouping box returning `ShapeRef`
- `equation(slide, { latex, x, y, w, h?, color?, label? })` — rendered LaTeX equation (async)
- `emoji(slide, { name, x, y, w?, h? })` — themed SVG emoji image (async)

## Themed Emojis

Each theme provides a curated emoji set that matches its visual identity. Emojis are **monochrome outlines colored with the theme's palette** — not full-color stickers. This ensures they integrate elegantly with the slide design, like typographic ornaments rather than distractions.

### Emoji styles

| Style | Description | Use case |
|---|---|---|
| `openmoji-outline` | Monochrome outlines, colored with `emojiSet.color` | Elegant/professional themes (default for `claudeDoc`) |
| `openmoji` | Full-color OpenMoji | Playful/colorful themes |
| `twemoji` | Full-color Twemoji | Familiar Twitter-style emojis |

### Inline `:emoji:` syntax

Use `:emoji_name:` tokens in `bulletList` and `bodyText` — no manual positioning needed:

```ts
// Emoji-prefixed bullets (replaces bullet marker with emoji image)
deck.content({
  title: "Features",
  bullets: [
    ":rocket: Fast builds",
    ":shield: Enterprise security",
    ":sparkles: Beautiful defaults",
    "Regular bullet without emoji",
  ],
});

// Leading emoji in body text
bodyText(slide, { text: ":lightbulb: Pro tip: use emoji for emphasis", x: 0.8, y: 1.5, w: 8 });
```

### Standalone emoji component

```ts
await deck.components.emoji(slide, { name: "rocket", x: 1, y: 2, w: 0.5, h: 0.5 });
```

### Data URI for custom use

```ts
const img = await deck.emoji("rocket");
slide.addImage({ data: img, x: 1, y: 2, w: 0.5, h: 0.5 });
```

### Configuring emoji style and color

```ts
// claude-doc default: terracotta outlines
emojiSet: { style: "openmoji-outline", color: "DA7756" }

// Switch to full-color emojis
emojiSet: { style: "twemoji" }

// Custom color for outlines (e.g. Apple blue for basic-white)
emojiSet: { style: "openmoji-outline", color: "007AFF" }
```

### Available emojis

**Outline set** (~29, curated for professional/documentation use):
`rocket`, `star`, `checkmark`, `crossmark`, `lightbulb`, `gear`, `chart-up`, `target`, `clock`, `calendar`, `lock`, `unlock`, `globe`, `link`, `magnifying-glass`, `pencil`, `book`, `folder`, `document`, `terminal`, `sparkles`, `diamond`, `key`, `shield`, `palette`, `eye`, `pin`, `flag`, `tag`

**Full-color sets** (~47 each, broader set including casual emojis):
Adds `fire`, `brain`, `bug`, `warning`, `thumbs-up`, `thumbs-down`, `heart`, `zap`, `party`, `trophy`, `medal`, `handshake`, `people`, `bell`, `gift`, `money`, `hammer`, `robot`

Common aliases are supported (e.g. `check` → `checkmark`, `settings` → `gear`, `search` → `magnifying-glass`). See `src/emoji-data/aliases.ts` for the full list.

## Callout Block Variants

| Variant | Background | Icon | Use for |
|---|---|---|---|
| `card` | White `#FFFFFF` | Pencil | General content, summaries |
| `code` | Warm grey `#F5F3EF` | Lightbulb | Code refs, CLI instructions |
| `info` | Blue tint `#EEF1FA` | Info circle | Tips, notes, helpful info |
| `warning` | Amber `#FDF5EB` | Triangle alert | Cautions, deprecation notices |
| `accent` | Terra cotta `#FAF0EB` | Circle check | Key takeaways, featured items |
| `success` | Green tint `#ECFAF0` | Circle check | Success states, completed items |

## Native Connectors

`deck.connector()` creates OOXML connectors that bind to shape connection points and move with shapes when dragged:

```ts
const boxA = deck.components.diagramBox(slide, { text: "A", x: 1, y: 2, w: 2, h: 1 });
const boxB = deck.components.diagramBox(slide, { text: "B", x: 6, y: 2, w: 2, h: 1 });
deck.connector({ from: boxA.right, to: boxB.left, type: "straight", label: "flow" });
```

Types: `straight`, `elbow`, `curved`. Head/tail: `arrow`, `stealth`, `triangle`, `none`.

## Adding a New Theme

Create a folder in `src/themes/` with `config.ts`, `components.ts`, `layouts.ts`, and `index.ts`. See `claude-doc/` for the full pattern.

## Advanced: Custom Slides

Use `deck.blank()` + `deck.components` for freeform placement:

```ts
const slide = deck.blank({ bg: "primary" });
const { heading, codeBlock, calloutBlock } = deck.components;
heading(slide, { text: "Custom Layout", x: 0.8, y: 0.5, w: 11 });
codeBlock(slide, { code: "print('hi')", x: 0.8, y: 1.5, w: 5, language: "python" });
await calloutBlock(slide, { variant: "info", x: 6.5, y: 1.5, w: 5, body: "Note here" });
```

## Coding Style & Conventions

- Modern TypeScript/ES modules, 2-space indentation, trailing commas.
- Descriptive domain nouns for exports (`claudeDoc`), verbs for layout methods (`deck.title`, `deck.content`).
- New themes go in `src/themes/<name>/`; shared utilities stay in `src/` root.
- Match surrounding style — no repo-wide formatter is enforced.

## Commit & PR Guidelines

- Short imperative commit summaries ("Add diagram components").
- PRs should describe motivation, list impacted slides/themes, and include deck paths used for validation.
- Attach screenshots of key slides when visuals change.

## Security Notes

- Don't commit generated PPTX or OS-specific font files; keep artifacts in `.gitignore`d folders.
- No secrets needed — `sharp` processes local files only. Keep build paths relative.
