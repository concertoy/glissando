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

Each method creates one slide. Most are chainable (return `this`).

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
| `await deck.equation({ title, equations })` | LaTeX equations |
| `deck.blank({ bg? })` | Custom slide for freeform layout |

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
