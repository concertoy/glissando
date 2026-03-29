# glissando

Component-based slide decks for coding agents. Write TypeScript, get native editable PPTX.

## Quick Start

```bash
npm install
./build.sh examples/mimic-claude-macos           # → output.pptx
./build.sh examples/elegant-bw-demo              # → output.pptx
```

## Build, Test, and Development Commands

- `npm install` — install runtime (pptxgenjs, sharp, mathjax-full) and tooling dependencies.
- `./build.sh examples/<deck>` — compile `slides.ts` into `output.pptx` inside that example folder.
- `npx tsx scripts/runner.ts <path-to-deck>` — run the builder directly when debugging runner changes.
- `npx tsx scripts/render-slide.ts <path>.pptx --all --output /tmp/render` — render PPTX slides to PNG for visual verification.
- `npx tsc --noEmit` — type-check the library; keep the tree free of TypeScript errors before opening a PR.
- `npm test` — smoke-test all example decks (builds each, asserts output.pptx is produced).

## Skills

| Skill | Trigger | Description |
|---|---|---|
| `/slides` | "create a deck", "make slides about" | Create a deck from natural language. Delegates content planning to an Opus sub-agent. |
| `/slides-from-latex` | "convert this paper", "arXiv to slides" | Convert LaTeX paper to deck. Handles macros, TikZ, theorems, display math. |
| `/slides-theme` | "create a theme", "design a theme" | Create a new visual theme from a description. |
| `/slides-from-pptx` | "reverse a pptx", "pptx to ts" | Reverse-engineer PPTX back into `slides.ts`. |
| `/slides-check` | "check the slides", "verify visually" | Render slides to PNG and diagnose layout/styling issues. |
| `/figure` | "generate a figure", "architecture diagram" | AI-generated raster figure (fallback when diagram components can't express it). |

### Planning Agents

Both `/slides` and `/slides-from-latex` use a two-pass planning protocol with two Opus sub-agents:

1. **Outline pass** — `slides-outline-planner` reads source material and produces a numbered outline — one line per slide with type tags (e.g., `[content,equation]`), title, and purpose. This preserves narrative coherence.
2. **Detail pass** — `slides-detail-planner` is called once per slide (or small batch) with the full outline for context. It reads source material directly and produces rich markdown content for each assigned slide. Complex slides (`[equation]`, `[code]`, `[diagram]`, mixed tags) are detailed alone; simple slides (`[title]`, `[section]`) are batched.

Both agents operate in isolated context (no access to `examples/` or `src/`). The skill assembles all detail outputs into a single markdown plan. The implementer faithfully translates it into themed TypeScript without thinning or rewriting content.

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
  config.ts                 CLI config loader (~/.glissando/config.json)
  equation.ts               LaTeX renderer (MathJax → SVG → PNG via sharp)
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
  elegant-bw-demo/          Elegant BW theme — rich real-world deck
  mimic-claude-macos/       Claude Doc + macOS native fonts — component catalog
build.sh                    Universal build: ./build.sh <path>
scripts/
  runner.ts                 Build runner (called by build.sh)
  install-fonts.sh          Font installer (macOS/Linux)
  install-fonts.ps1         Font installer (Windows)
  render-slide.ts           Render PPTX slides to PNG for visual verification
  generate-figure.ts        AI figure generation (used by /figure skill)
  pptx-to-ts.ts             Reverse-engineer PPTX to slides.ts (used by /slides-from-pptx)
  init.ts                   CLI init wizard
  test-examples.ts          Smoke-test all example decks
.claude/
  skills/
    slides/                 /slides — create deck from description
    slides-from-latex/      /slides-from-latex — LaTeX paper to deck
    slides-theme/           /slides-theme — create new themes
    slides-from-pptx/       /slides-from-pptx — reverse-engineer PPTX
    slides-check/           /slides-check — render and diagnose slides
    figure/                 /figure — AI figure generation
  agents/
    slides-outline-planner.md  Opus sub-agent for deck outline planning
    slides-detail-planner.md   Opus sub-agent for per-slide content detail
    slides-visual-debugger.md  Visual verification agent
    slides-component-designer.md Component design agent
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

Every theme supports font presets via `applyPreset(theme, preset)`. Import `applyPreset` from any theme's `index.js` or from `src/index.js`.

### claude-doc presets

| Preset | Headings | Body | Code | Install |
|---|---|---|---|---|
| `default` | DM Serif Display | Inter | JetBrains Mono | `./scripts/install-fonts.sh claude-doc default` |
| `macosNative` | Iowan Old Style | Avenir Next | Menlo | No install needed |
| `googleFonts` | Libre Baskerville | Space Grotesk | JetBrains Mono | `./scripts/install-fonts.sh claude-doc google-fonts` |

### basic-white presets

| Preset | Headings | Body | Code | Install |
|---|---|---|---|---|
| `default` | Helvetica Neue | Helvetica Neue | Menlo | No install needed |
| `serifClean` | Georgia | Helvetica Neue | Menlo | No install needed |
| `googleFonts` | Lato | Lato | Source Code Pro | `./scripts/install-fonts.sh basic-white google-fonts` |

### elegant-bw presets

| Preset | Headings | Body | Code | Install |
|---|---|---|---|---|
| `default` | Playfair Display | Inter | JetBrains Mono | `./scripts/install-fonts.sh elegant-bw default` |
| `macosNative` | Didot | Avenir Next | Menlo | No install needed |
| `allSans` | Space Grotesk | Inter | JetBrains Mono | `./scripts/install-fonts.sh elegant-bw all-sans` |

## Available Themes

| Theme | Style | Default Headings | Default Body | Default Code | Install |
|---|---|---|---|---|---|
| `claudeDoc` | Warm cream, terracotta accent | DM Serif Display | Inter | JetBrains Mono | `./scripts/install-fonts.sh claude-doc default` |
| `basicWhite` | Pure white, Apple blue accent | Helvetica Neue | Helvetica Neue | Menlo | No install needed |
| `elegantBw` | Monochromatic black/white | Playfair Display | Inter | JetBrains Mono | `./scripts/install-fonts.sh elegant-bw default` |

## Slide Numbering, Footers, and Citations

```ts
// Enable slide numbering + static footer text
deck.footer({
  slideNumber: true,                              // "3 / 22" bottom-right
  slideNumberFormat: "n / N",                     // or "n" for just "3"
  text: "Buchanan et al. — NeurIPS 2025",         // static text, bottom-left
  citationStyle: "author-year",                    // or "compact" for [BPMDB25]
  skip: [1, 22],                                   // 1-based slide indices to skip
});

// Register bibliography entries
deck.bib("buchanan2025", { authors: ["Buchanan", "Pai", "Ma", "De Bortoli"], year: 2025 });

// After creating a slide, cite references on it
deck.content({ title: "Prior Work", bullets: [...] });
deck.cite("buchanan2025", "carlini2023");
// → footer: [Buchanan et al., 2025; Carlini et al., 2023]
```

Citation styles: `"author-year"` (1 → `[Smith, 2023]`, 2 → `[Smith & Jones, 2023]`, 3+ → `[Smith et al., 2023]`) or `"compact"` (first letter of each surname + year → `[BPMDB25]`).

## Build Animations

Add `build: true` to reveal bullets one-by-one on click (works in PowerPoint and Keynote):

```ts
// Layout-level
deck.content({ title: "Key Points", bullets: ["A", "B", "C"], build: true });

// Component-level (on blank slides)
bulletList(slide, { items: ["A", "B", "C"], build: true, ...area });
numberedList(slide, { items: ["1st", "2nd", "3rd"], build: true, ...area });
```

## Available Layouts

| Method | Description |
|---|---|
| `deck.title({ title, subtitle?, notes? })` | Dark bg opening/closing slide |
| `deck.section({ title, subtitle?, notes? })` | Warm bg section divider |
| `deck.content({ title, subtitle?, bullets, notes? })` | Heading + bullet list |
| `deck.twoColumn({ title, leftTitle?, rightTitle?, left, right, notes? })` | Two-column comparison |
| `deck.code({ title, code, language?, notes? })` | Heading + code panel (syntax highlighted) |
| `deck.quote({ quote, attribution?, notes? })` | Large quote on accent bg |
| `deck.image({ title, imagePath, caption?, notes? })` | Heading + image |
| `deck.table({ title, headers, rows, notes? })` | Heading + themed table |
| `await deck.equation({ title, equations, notes? })` | Heading + rendered LaTeX equations |
| `deck.blank({ bg?, notes? })` | Empty slide (returns raw pptxgenjs slide) |

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
- `image(slide, { path|data, x, y, w, h, caption?, border?, rounding?, sizing? })` — themed image with optional caption and border frame
- `caption(slide, { text, x, y, w })` — small muted text
- `calloutBlock(slide, { variant, x, y, w, h?, body?, bullets? })` — round-cornered callout panel (async)
- `textBlock(slide, { x, y, w, h?, title?, subtitle?, body?, bullets?, fill?, border?, textColor? })` — icon-free rounded panel with optional title/subtitle
- `diagramBox(slide, { text, x, y, w, h, fill?, border?, textColor? })` — rounded box returning `ShapeRef` with connection points
- `arrow(slide, { from, to, color?, width?, head?, tail?, dashed? })` — straight arrow between coordinates
- `hookArrow(slide, { from, to, hookDirection, ... })` — L-shaped elbow arrow
- `container(slide, { label?, x, y, w, h, border?, fill? })` — dashed-border grouping box returning `ShapeRef`
- `equation(slide, { latex, x, y, w, h?, color?, label? })` — rendered LaTeX equation (async)
- `emoji(slide, { name, x, y, w?, h? })` — themed SVG emoji image (async)

All components return a `Rect` (`{ x, y, w, h }`) representing their actual bounding box, enabling vertical stacking and layout chaining.

### Inline Math (`$...$` syntax)

Text components (`bulletList`, `bodyText`, `numberedList`, `calloutBlock`, `textBlock`) support `$...$` delimited inline math:

```ts
bulletList(slide, {
  items: [
    "$c_i$ — per-Gaussian color",           // subscript
    "$\\alpha_t$ — noise schedule",          // Greek + subscript
    "$X_{t-1}^2$ — squared previous state",  // compound sub+superscript
    "Regular bullet without math",
  ],
  ...
});
```

| Expression | Renders as |
|---|---|
| `$c_i$` | c with subscript i |
| `$x^2$` | x with superscript 2 |
| `$\\alpha$` | Greek alpha (α) |
| `$\\beta_k$` | Greek beta with subscript k |
| `$X_{t-1}^2$` | X with subscript t-1 and superscript 2 |
| `$\\hat{x}$` | x with combining hat accent |

Complex expressions (`\frac`, `\sqrt`, `\mathbb`) are not supported inline — use the `equation()` component instead.

## Layout Helpers

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

`Rect` has `{ x, y, w, h }` — same shape as component props. Use spread syntax:

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

## Speaker Notes

All layout methods accept an optional `notes` string for presenter-view speaker notes:

```ts
deck.content({
  title: "Key Points",
  bullets: ["First point", "Second point"],
  notes: "Remind audience about the demo here",
});
```

For `blank()` slides, pass `notes` in props or use the `speakerNote` helper:

```ts
import { Deck, speakerNote } from "../../src/index.js";

const slide = deck.blank();
speakerNote(slide, "Transition: move to Q&A");
```

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
