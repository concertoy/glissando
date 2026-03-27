---
title: "Layouts"
summary: "All available deck layout methods and their props."
---

# Layouts

Layouts are methods on the `Deck` class. Each call creates one slide.

## Reference

| Method | Description |
|---|---|
| `deck.title({ title, subtitle? })` | Dark bg opening/closing slide |
| `deck.section({ title, subtitle? })` | Warm bg section divider |
| `deck.content({ title, subtitle?, bullets })` | Heading + bullet list |
| `deck.twoColumn({ title, leftTitle?, rightTitle?, left, right })` | Two-column comparison |
| `deck.code({ title, code, language? })` | Heading + syntax-highlighted code panel |
| `deck.quote({ quote, attribution? })` | Large quote on accent bg |
| `deck.image({ title, imagePath, caption? })` | Heading + image |
| `deck.table({ title, headers, rows })` | Heading + themed table |
| `await deck.equation({ title, equations })` | Heading + rendered LaTeX equations |
| `deck.blank({ bg? })` | Empty slide for custom content |

## Props

### title

```ts
deck.title({ title: "My Presentation", subtitle: "By Author" });
```

| Prop | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | Yes | Slide heading |
| `subtitle` | `string` | No | Subtitle text |

### section

```ts
deck.section({ title: "Part One", subtitle: "Introduction" });
```

| Prop | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | Yes | Section heading |
| `subtitle` | `string` | No | Subtitle text |

### content

```ts
deck.content({
  title: "Key Points",
  subtitle: "Overview",
  bullets: [":rocket: Fast", ":shield: Secure", "Simple"],
});
```

| Prop | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | Yes | Slide heading |
| `subtitle` | `string` | No | Subtitle text |
| `bullets` | `string[]` | Yes | Bullet items (supports `:emoji:` syntax) |

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

### quote

```ts
deck.quote({ quote: "Design is how it works.", attribution: "Steve Jobs" });
```

| Prop | Type | Required | Description |
|---|---|---|---|
| `quote` | `string` | Yes | Quote text |
| `attribution` | `string` | No | Attribution / source |

### image

```ts
deck.image({ title: "Architecture", imagePath: "./diagram.png", caption: "System overview" });
```

| Prop | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | Yes | Slide heading |
| `imagePath` | `string` | Yes | Path to image file |
| `caption` | `string` | No | Caption below image |

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

### blank

```ts
const slide = deck.blank({ bg: "dark" });
```

| Prop | Type | Required | Description |
|---|---|---|---|
| `bg` | `"primary" \| "dark" \| "accent"` | No | Background color (default: `"primary"`) |

Returns a raw pptxgenjs `Slide` for use with `deck.components`. See [Custom Slides](/guide/custom-slides).
