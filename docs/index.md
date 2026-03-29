---
title: "glissando"
summary: "Component-based slide decks for coding agents. Write TypeScript, get native editable PPTX."
---

# glissando

<p align="center">
  <img src="/docs/assets/light.png" alt="glissando" width="500" class="dark:hidden" />
  <img src="/docs/assets/badge.png" alt="glissando" width="500" class="hidden dark:block" />
</p>

<p align="center">
  <strong>Slide decks as code, built for AI agents.</strong><br />
  Write TypeScript, get native editable PPTX.
</p>

<Columns>
  <Card title="Getting Started" href="/getting-started" icon="rocket">
    Install and build your first deck in 2 minutes.
  </Card>
  <Card title="Themes" href="/guide/themes" icon="palette">
    Three themes with font presets for every platform.
  </Card>
  <Card title="API Reference" href="/api/layouts" icon="book-open">
    Layouts, components, emojis, and connectors.
  </Card>
</Columns>

## What is glissando?

glissando is a TypeScript library that turns code into native, editable PowerPoint files. It's designed for AI coding agents: the agent provides content, and the theme handles all positioning, colors, and fonts.

**Theme = Config + Components + Layouts.** You pick a theme, call layout methods like `deck.content()` or `deck.code()`, and glissando produces a `.pptx` you can open in PowerPoint or Keynote.

## Features

| | |
|---|---|
| **10 layout methods** | title, section, content, twoColumn, code, quote, image, table, equation, blank |
| **18+ components** | heading, bulletList, codeBlock, calloutBlock, diagramBox, equation, image, and more |
| **3 themes** | claudeDoc (warm cream), basicWhite (clean white), elegantBw (monochromatic) |
| **Font presets** | Multiple presets per theme — macOS native, Google Fonts, system fonts |
| **Inline math** | `$\alpha_t$`, `$c_i$`, `$X_{t-1}^2$` — subscripts, superscripts, Greek letters in text |
| **LaTeX equations** | Full MathJax rendering to crisp PNG images |
| **Citations & footers** | Slide numbering, footer text, author-year and compact citation styles |
| **Build animations** | Bullet-by-bullet reveal on click in PowerPoint and Keynote |
| **Diagram connectors** | Native OOXML connectors that move with shapes when dragged |
| **Speaker notes** | Optional notes on every slide via `notes` parameter |
| **Themed emojis** | Monochrome outline or full-color emoji in bullets and body text |
| **Syntax highlighting** | Per-language keyword coloring in code blocks |

## Available themes

| Theme | Style | Install |
|---|---|---|
| `claudeDoc` | Warm cream, terracotta accent, serif headings | `./scripts/install-fonts.sh claude-doc default` |
| `basicWhite` | Pure white, Apple blue accent, Helvetica Neue | No install needed |
| `elegantBw` | Monochromatic black/white, Playfair Display + Inter | `./scripts/install-fonts.sh elegant-bw default` |

Each theme has multiple [font presets](/guide/themes#font-presets) for different environments (macOS native, Google Fonts, etc.).
