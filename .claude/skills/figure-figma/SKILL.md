---
name: figure-figma
description: "**Experimental.** Generate a diagram or figure in Figma using the Figma MCP plugin. Use when the user says '/figure-figma', 'create a diagram in Figma', 'make a Figma figure', or needs a professional-quality diagram that goes beyond boxes+arrows. Requires the Figma MCP server to be configured."
allowed-tools: Bash, Read, Write
argument-hint: "<description of the figure>"
---

Generate a figure in Figma: $ARGUMENTS

## Prerequisites

The Figma MCP tools must be available: `generate_diagram`, `use_figma`, `create_new_file`, `get_screenshot`. If not available, fall back to `/figure-diagram` (built-in components) or `/figure` (AI generation).

## When to use this skill

- Diagrams that need professional polish beyond what boxes+arrows provide
- Mermaid-expressible diagrams (flowcharts, sequence, state, Gantt)
- Custom compositions with precise visual design
- Figures that the user wants to **edit later in Figma**

For simple boxes+arrows diagrams, prefer `/figure-diagram` — it produces native PPTX shapes.

## Path A: Mermaid diagrams

For flowcharts, sequence diagrams, state diagrams, and Gantt charts.

1. **Get the user's plan key** via `whoami` (needed for `create_new_file`)

2. **Generate with Mermaid syntax** via `generate_diagram`:
   ```
   generate_diagram:
     name: "<diagram title>"
     mermaidSyntax: |
       flowchart LR
         A["Input"] --> B["Process"]
         B --> C["Output"]
         style A fill:#DA7756,color:#fff
   ```

3. **Get theme colors** from the deck's config to apply via Mermaid `style` directives:
   - `accent` → key nodes, highlights
   - `bgPrimary` → background
   - `text` → labels
   - `textMuted` → connectors, secondary elements

4. **Capture** via `get_screenshot` and save to the deck folder

## Path B: Custom Figma diagrams

For complex compositions Mermaid can't express.

1. **Create a design file** via `create_new_file` (type: design)

2. **Build incrementally** with `use_figma`:
   - Create a slide-sized frame (1280×720)
   - Add shapes, text, connectors step by step
   - Validate with `get_screenshot` after each major step

3. **Apply theme colors** — convert hex to 0-1 range for Figma:
   ```js
   // claudeDoc accent #DA7756
   { r: 0.855, g: 0.467, b: 0.337 }
   ```

4. **Export** via `get_screenshot` or `exportAsync` in plugin code

## Embedding in slides

Save the image to the deck folder and reference it:

```ts
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const img = (name: string) => resolve(__dirname, name);

deck.image({ title: "Architecture", imagePath: img("diagram.png") });
// or on a blank slide:
deck.components.image(slide, { path: img("diagram.png"), x: 1, y: 1.5, w: 10, h: 5 });
```

## Limitations

- Figma MCP has rate limits on the Starter plan
- FigJam files (from `generate_diagram`) don't support `get_metadata`
- PNG export from plugin code may be truncated for large images — use `get_screenshot` instead
- The generated Figma file is kept in the user's drafts for later editing
