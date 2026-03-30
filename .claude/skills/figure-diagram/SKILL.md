---
name: figure-diagram
description: "Build a diagram slide using glissando's built-in diagramBox, arrow, hookArrow, container, and native connector components. Use when the user says '/figure-diagram', 'draw a diagram', 'architecture diagram', 'flowchart', 'pipeline diagram', or needs a boxes-and-arrows style figure. Prefer this over /figure-figma and /figure for any diagram that can be expressed as labeled boxes with connections."
allowed-tools: Read, Write, Bash, Glob
argument-hint: "<description of the diagram>"
---

Build a diagram on a blank slide using glissando components: $ARGUMENTS

## When to use this skill

Use this for **any diagram expressible as boxes + arrows + containers**:
- Architecture diagrams, system overviews
- Flowcharts, pipelines, data flows
- Component relationships, dependency graphs
- Process diagrams, state machines
- Comparison layouts (side-by-side boxes)

If the diagram requires organic shapes, illustrations, photos, or complex curves that boxes+arrows can't express, use `/figure-figma` (Figma MCP) or `/figure` (AI generation) instead.

## Components available

All accessed via `deck.components`:

| Component | Returns | Use for |
|---|---|---|
| `diagramBox(slide, { text, x, y, w, h, fill?, border?, textColor?, fontSize? })` | `ShapeRef` | Labeled box with 4 connection points |
| `arrow(slide, { from, to, color?, width?, head?, tail?, dashed? })` | void | Straight arrow between coordinates |
| `hookArrow(slide, { from, to, hookDirection, color?, width? })` | void | L-shaped elbow arrow |
| `container(slide, { label?, x, y, w, h, border?, fill? })` | `ShapeRef` | Dashed grouping box |
| `deck.connector({ from, to, type?, color?, label? })` | Deck | **Native OOXML connector** — moves with shapes when dragged |

### ShapeRef connection points

`diagramBox` and `container` return a `ShapeRef` with 4 named connection points:

```ts
const box = diagramBox(slide, { text: "Node", x: 1, y: 2, w: 2, h: 1 });
// box.top    → { x: 2, y: 2 }     (center top)
// box.right  → { x: 3, y: 2.5 }   (center right)
// box.bottom → { x: 2, y: 3 }     (center bottom)
// box.left   → { x: 1, y: 2.5 }   (center left)
// box.rect   → { x: 1, y: 2, w: 2, h: 1 }
```

### Native connectors vs visual arrows

- **`deck.connector()`** — creates OOXML connectors that **bind to shapes** and move with them when dragged in PowerPoint. Always prefer this.
- **`arrow()`** / **`hookArrow()`** — visual-only lines at fixed coordinates. Use only when connector routing doesn't work (e.g., arrows between arbitrary points not on shapes).

Connector types: `"straight"`, `"elbow"`, `"curved"`. Head/tail: `"arrow"`, `"stealth"`, `"triangle"`, `"none"`.

## Workflow

1. **Analyze the diagram.** Identify nodes (boxes), edges (connections), and groups (containers). Decide layout direction (left-to-right or top-to-bottom).

2. **Create a blank slide** with heading:
   ```ts
   const slide = deck.blank({ bg: "primary" });
   const { heading, accentBar, diagramBox, container } = deck.components;
   const sp = deck.config.spacing;
   const cw = sp.slideWidth - sp.marginLeft - sp.marginRight;

   heading(slide, { text: "Diagram Title", x: sp.marginLeft, y: sp.marginTop, w: cw });
   accentBar(slide, { x: sp.marginLeft, y: sp.marginTop + 0.8, w: 1.5 });
   ```

3. **Place containers first** (they render behind nodes):
   ```ts
   container(slide, { label: "Backend", x: 5, y: 1.5, w: 7, h: 5 });
   ```

4. **Place diagram boxes** — use theme-aware fill/border colors from `deck.config.colors`:
   ```ts
   const { colors: clr } = deck.config;
   const input = diagramBox(slide, {
     text: "Input", x: 1, y: 3, w: 2, h: 1,
     fill: clr.bgCard, border: clr.textMuted,
   });
   const process = diagramBox(slide, {
     text: "Process", x: 5, y: 3, w: 2.5, h: 1,
     fill: clr.accent, border: clr.accent, textColor: "FFFFFF",
   });
   ```

5. **Connect with native connectors:**
   ```ts
   deck.connector({ from: input.right, to: process.left, type: "straight" });
   deck.connector({ from: process.right, to: output.left, type: "elbow", label: "result" });
   deck.connector({ from: output.bottom, to: input.bottom, type: "curved", label: "retry" });
   ```

6. **Build and verify:**
   ```bash
   ./build.sh examples/<deck>
   npx tsx scripts/render-slide.ts examples/<deck>/output.pptx --all --output /tmp/glissando-render
   ```
   Read the rendered PNG to check connections and layout.

## Style guide

Use semantic node styles from the theme config:

| Style | Fill | Border | Text | Use for |
|---|---|---|---|---|
| Default | `bgCard` | `textMuted` | `text` | Most nodes |
| Primary | `"FFFFFF"` | `accent` (2px) | `text` | Key/central nodes |
| Accent | `accent` | `accent` | `"FFFFFF"` | Active/highlighted nodes |
| Dark | dark variant | dark variant | `"FFFFFF"` | Terminal/action nodes |
| Muted | `"FFFFFF"` | light border | `text` | Input/peripheral nodes |

## Layout tips

- **Slide area**: 13.33" × 7.5" with ~1" margins → usable area ~11.3" × 5.5"
- **Content area** (below heading + accent bar): starts at y ≈ 1.3"
- **Node sizing**: 2-3" wide × 0.8-1.2" tall for most nodes
- **Spacing**: 0.5-1" between nodes, 1-2" between columns/ranks
- **Max nodes**: 6-8 per slide for readability; split complex diagrams across slides
- Use `deck.area()` and `deck.contentArea()` for computed bounds
- Use `columns(area, n)` and `rows(area, n)` helpers for grid-based placement
