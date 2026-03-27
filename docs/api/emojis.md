---
title: "Emojis"
summary: "Themed emoji rendering with inline :name: syntax and standalone placement."
---

# Emojis

Each theme provides a curated emoji set that matches its visual identity. Emojis are **monochrome outlines colored with the theme's palette** — not full-color stickers. They integrate elegantly with the slide design, like typographic ornaments.

## Emoji styles

| Style | Description | Use case |
|---|---|---|
| `openmoji-outline` | Monochrome outlines, colored with theme palette | Elegant/professional themes (default for `claudeDoc`) |
| `openmoji` | Full-color OpenMoji | Playful/colorful themes |
| `twemoji` | Full-color Twemoji | Familiar Twitter-style emojis |

## Inline syntax

Use `:emoji_name:` tokens in `bulletList` and `bodyText` — no manual positioning needed:

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

When an emoji token starts a bullet, it replaces the bullet marker with the emoji image.

```ts
const { bodyText } = deck.components;
bodyText(slide, {
  text: ":lightbulb: Pro tip: use emoji for emphasis",
  x: 0.8, y: 1.5, w: 8,
});
```

## Standalone component

Place an emoji at specific coordinates:

```ts
await deck.components.emoji(slide, { name: "rocket", x: 1, y: 2, w: 0.5, h: 0.5 });
```

## Data URI

Get a base64 PNG for custom use:

```ts
const img = await deck.emoji("rocket");
slide.addImage({ data: img, x: 1, y: 2, w: 0.5, h: 0.5 });
```

## Configuration

Configure emoji style and color in the theme config:

```ts
// Default: terracotta outlines
emojiSet: { style: "openmoji-outline", color: "DA7756" }

// Full-color emojis
emojiSet: { style: "twemoji" }

// Custom outline color (e.g. Apple blue for basicWhite)
emojiSet: { style: "openmoji-outline", color: "007AFF" }
```

## Available emojis

### Outline set (~29, curated for professional use)

`rocket`, `star`, `checkmark`, `crossmark`, `lightbulb`, `gear`, `chart-up`, `target`, `clock`, `calendar`, `lock`, `unlock`, `globe`, `link`, `magnifying-glass`, `pencil`, `book`, `folder`, `document`, `terminal`, `sparkles`, `diamond`, `key`, `shield`, `palette`, `eye`, `pin`, `flag`, `tag`

### Full-color sets (~47 each, broader set)

All outline emojis plus: `fire`, `brain`, `bug`, `warning`, `thumbs-up`, `thumbs-down`, `heart`, `zap`, `party`, `trophy`, `medal`, `handshake`, `people`, `bell`, `gift`, `money`, `hammer`, `robot`

### Common aliases

| Alias | Resolves to |
|---|---|
| `check` | `checkmark` |
| `x` | `crossmark` |
| `settings` | `gear` |
| `search` | `magnifying-glass` |
| `edit` | `pencil` |
| `file` | `document` |
| `world` | `globe` |
| `cmd` | `terminal` |

See `src/emoji-data/aliases.ts` for the full alias list.
