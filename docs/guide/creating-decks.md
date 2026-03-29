---
title: "Creating Decks"
summary: "Write slides.ts files that import a theme and call layout methods."
---

# Creating Decks

Every deck is a TypeScript file that exports a default function returning a `Deck` instance.

## Deck file structure

```ts
import { Deck } from "../../src/index.js";
import { claudeDoc } from "../../src/themes/claude-doc/index.js";

export default function build() {
  const deck = new Deck(claudeDoc);

  // Call layout methods to add slides
  deck.title({ title: "My Talk", subtitle: "Author" });
  deck.content({ title: "Points", bullets: ["A", "B", "C"] });
  deck.title({ title: "Thank You" });

  return deck;
}
```

Place this in a folder (e.g. `examples/my-deck/slides.ts`) and build with `./build.sh examples/my-deck`.

## Layout methods

Each method creates one slide. All methods accept an optional `notes` parameter for speaker notes.

| Method | Use for |
|---|---|
| `deck.title({ title, subtitle?, notes? })` | Opening and closing slides |
| `deck.section({ title, subtitle?, notes? })` | Section dividers |
| `deck.content({ title, subtitle?, bullets, build?, notes? })` | Heading + bullet list |
| `deck.twoColumn({ title, leftTitle?, rightTitle?, left, right, notes? })` | Side-by-side comparison |
| `deck.code({ title, code, language?, notes? })` | Syntax-highlighted code |
| `deck.quote({ quote, attribution?, notes? })` | Featured quote |
| `deck.image({ title, imagePath, caption?, notes? })` | Image with heading |
| `deck.table({ title, headers, rows, notes? })` | Data table |
| `await deck.equation({ title, equations, notes? })` | LaTeX equations |
| `deck.blank({ bg?, notes? })` | Custom slide for freeform layout |

<Warning>
`deck.equation()` is async and must be awaited: `await deck.equation({ ... })`.
</Warning>

## Layout selection guide

- **Open** with `title`, **close** with `title`
- Use `section` to divide into 2-3 parts
- Default to `content` — keep to 3-5 bullets per slide
- Use `twoColumn` for comparisons, `code` for code, `quote` sparingly
- One idea per slide. 8-12 slides total.

## Full example

```ts
import { Deck } from "../../src/index.js";
import { claudeDoc } from "../../src/themes/claude-doc/index.js";

export default async function build() {
  const deck = new Deck(claudeDoc);

  deck.title({ title: "Building with AI", subtitle: "A Developer's Guide" });

  deck.section({ title: "Why AI?" });

  deck.content({
    title: "Key Benefits",
    bullets: [
      ":rocket: Faster iteration cycles",
      ":shield: Automated security checks",
      ":sparkles: Consistent code quality",
    ],
    notes: "Emphasize the 10x productivity gain from automated testing.",
  });

  deck.twoColumn({
    title: "Before vs After",
    leftTitle: "Manual",
    rightTitle: "AI-Assisted",
    left: ["Write tests by hand", "Manual code review", "Copy-paste patterns"],
    right: ["Auto-generated tests", "Instant PR feedback", "Smart scaffolding"],
  });

  deck.code({
    title: "Quick Example",
    code: `import { Deck } from "glissando";

const deck = new Deck(theme);
deck.title({ title: "Hello" });
await deck.save("output.pptx");`,
    language: "typescript",
  });

  deck.table({
    title: "Framework Comparison",
    headers: ["Feature", "glissando", "Others"],
    rows: [
      ["Native PPTX", "Yes", "PDF only"],
      ["Editable output", "Yes", "No"],
      ["Theme system", "Built-in", "Manual"],
    ],
  });

  deck.quote({
    quote: "The best tool disappears into your workflow.",
    attribution: "Anonymous",
  });

  deck.title({ title: "Thank You" });

  return deck;
}
```

## Speaker notes

Every layout method accepts an optional `notes` parameter. Notes appear in PowerPoint's presenter view:

```ts
deck.content({
  title: "Key Points",
  bullets: ["First", "Second", "Third"],
  notes: "Remember to pause after the second point for questions.",
});
```

## Inline emojis

Use `:emoji_name:` tokens in `bullets` and `bodyText` for themed emoji icons:

```ts
deck.content({
  title: "Features",
  bullets: [
    ":rocket: Fast builds",
    ":shield: Enterprise security",
    ":sparkles: Beautiful defaults",
    "Regular bullet without emoji",
  ],
});
```

See the [Emojis reference](/api/emojis) for the full list.

## Inline math

Use `$...$` delimiters in text for subscripts, superscripts, and Greek letters:

```ts
deck.content({
  title: "Variable Definitions",
  bullets: [
    "$c_i$ — per-Gaussian color coefficient",
    "$\\alpha_t$ — noise schedule at time $t$",
    "$X_{t-1}^2$ — squared previous state",
    "$\\hat{x}$ — estimated value",
  ],
});
```

| Expression | Renders as |
|---|---|
| `$c_i$` | c with subscript i |
| `$x^2$` | x with superscript 2 |
| `$\\alpha$` | Greek alpha (α) |
| `$\\beta_k$` | Greek beta with subscript k |
| `$X_{t-1}^2$` | X with subscript t-1 and superscript 2 |
| `$\\hat{x}$` | x with hat accent |

Works in `bulletList`, `bodyText`, `numberedList`, `calloutBlock`, and `textBlock`. Complex expressions (`\frac`, `\sqrt`, `\mathbb`) should use the standalone `equation()` component instead.

## Build animations

Add `build: true` to reveal bullets one-by-one on click (works in PowerPoint and Keynote):

```ts
// Layout-level
deck.content({
  title: "Key Points",
  bullets: ["First point", "Second point", "Third point"],
  build: true,
});

// Component-level (on blank slides)
bulletList(slide, { items: ["A", "B", "C"], build: true, ...area });
numberedList(slide, { items: ["1st", "2nd", "3rd"], build: true, ...area });
```

## Citations and footers

Add slide numbering, footer text, and academic citations:

```ts
// Enable slide numbering + footer text
deck.footer({
  slideNumber: true,
  slideNumberFormat: "n / N",  // "3 / 22" (or "n" for just "3")
  text: "Company Confidential",
});

// Add bibliography entries
deck.bib("smith2023", {
  authors: ["Alice Smith", "Bob Jones"],
  year: 2023,
  title: "Example Paper",
});

// Cite on the most recently created slide
deck.content({ title: "Prior Work", bullets: ["..."] });
deck.cite("smith2023");
// → footer: [Smith & Jones, 2023]
```

Citation styles: `"author-year"` (default) or `"compact"` (first letter of each surname + year, e.g., `[SJ23]`).

## Native connectors

For diagram slides, use `diagramBox` + `deck.connector()` to create OOXML connectors that move with shapes in PowerPoint:

```ts
const slide = deck.blank();
const { diagramBox } = deck.components;

const boxA = diagramBox(slide, { text: "Input", x: 1, y: 2, w: 2, h: 1 });
const boxB = diagramBox(slide, { text: "Output", x: 6, y: 2, w: 2, h: 1 });
deck.connector({ from: boxA.right, to: boxB.left, type: "straight", label: "process" });
```

See [Custom Slides](/guide/custom-slides) for the full component API.
