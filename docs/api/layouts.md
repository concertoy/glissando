---
title: "Layouts"
summary: "All available deck layout methods and their props."
---

# Layouts

Layouts are methods on the `Deck` class. Each call creates one slide. All methods accept an optional `notes` parameter for speaker notes.

## Reference

| Method | Description |
|---|---|
| `deck.title({ title, subtitle?, notes? })` | Dark bg opening/closing slide |
| `deck.section({ title, subtitle?, notes? })` | Warm bg section divider |
| `deck.content({ title, subtitle?, bullets, build?, notes? })` | Heading + bullet list |
| `deck.twoColumn({ title, leftTitle?, rightTitle?, left, right, notes? })` | Two-column comparison |
| `deck.code({ title, code, language?, notes? })` | Heading + syntax-highlighted code panel |
| `deck.quote({ quote, attribution?, notes? })` | Large quote on accent bg |
| `deck.image({ title, imagePath, caption?, notes? })` | Heading + image |
| `deck.table({ title, headers, rows, notes? })` | Heading + themed table |
| `await deck.equation({ title, equations, notes? })` | Heading + rendered LaTeX equations |
| `deck.blank({ bg?, notes? })` | Empty slide for custom content |

## Props

### title

```ts
deck.title({ title: "My Presentation", subtitle: "By Author" });
```

| Prop | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | Yes | Slide heading |
| `subtitle` | `string` | No | Subtitle text |
| `notes` | `string` | No | Speaker notes |

### section

```ts
deck.section({ title: "Part One", subtitle: "Introduction" });
```

| Prop | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | Yes | Section heading |
| `subtitle` | `string` | No | Subtitle text |
| `notes` | `string` | No | Speaker notes |

### content

```ts
deck.content({
  title: "Key Points",
  subtitle: "Overview",
  bullets: [":rocket: Fast", ":shield: Secure", "Simple"],
  build: true,
});
```

| Prop | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | Yes | Slide heading |
| `subtitle` | `string` | No | Subtitle text |
| `bullets` | `string[]` | Yes | Bullet items (supports `:emoji:` and `$math$` syntax) |
| `build` | `boolean` | No | Reveal bullets one-by-one on click |
| `notes` | `string` | No | Speaker notes |

### twoColumn

```ts
deck.twoColumn({
  title: "Comparison",
  leftTitle: "Before",
  rightTitle: "After",
  left: ["Manual process", "Slow feedback"],
  right: ["Automated pipeline", "Instant results"],
});
```

| Prop | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | Yes | Slide heading |
| `leftTitle` | `string` | No | Left column heading |
| `rightTitle` | `string` | No | Right column heading |
| `left` | `string[]` | Yes | Left column bullets |
| `right` | `string[]` | Yes | Right column bullets |
| `notes` | `string` | No | Speaker notes |

### code

```ts
deck.code({
  title: "Example",
  code: `const x = 42;\nconsole.log(x);`,
  language: "typescript",
});
```

| Prop | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | Yes | Slide heading |
| `code` | `string` | Yes | Code content |
| `language` | `string` | No | Language for syntax highlighting |
| `notes` | `string` | No | Speaker notes |

### quote

```ts
deck.quote({ quote: "Design is how it works.", attribution: "Steve Jobs" });
```

| Prop | Type | Required | Description |
|---|---|---|---|
| `quote` | `string` | Yes | Quote text |
| `attribution` | `string` | No | Attribution / source |
| `notes` | `string` | No | Speaker notes |

### image

```ts
deck.image({ title: "Architecture", imagePath: "./diagram.png", caption: "System overview" });
```

| Prop | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | Yes | Slide heading |
| `imagePath` | `string` | Yes | Path to image file |
| `caption` | `string` | No | Caption below image |
| `notes` | `string` | No | Speaker notes |

### table

```ts
deck.table({
  title: "Results",
  headers: ["Metric", "Value"],
  rows: [["Latency", "12ms"], ["Throughput", "1.2k rps"]],
});
```

| Prop | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | Yes | Slide heading |
| `headers` | `string[]` | Yes | Column headers |
| `rows` | `string[][]` | Yes | Table rows |
| `notes` | `string` | No | Speaker notes |

### equation

<Warning>
This method is async — you must `await` it.
</Warning>

```ts
await deck.equation({
  title: "Euler's Identity",
  equations: [
    { latex: "e^{i\\pi} + 1 = 0", label: "Euler's formula" },
  ],
});
```

| Prop | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | Yes | Slide heading |
| `equations` | `Array<{ latex, label? }>` | Yes | LaTeX expressions with optional labels |
| `notes` | `string` | No | Speaker notes |

### blank

```ts
const slide = deck.blank({ bg: "dark" });
```

| Prop | Type | Required | Description |
|---|---|---|---|
| `bg` | `"primary" \| "dark" \| "accent"` | No | Background color (default: `"primary"`) |
| `notes` | `string` | No | Speaker notes |

Returns a raw pptxgenjs `Slide` for use with `deck.components`. See [Custom Slides](/guide/custom-slides).
