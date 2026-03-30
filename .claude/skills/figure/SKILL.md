---
name: figure
description: "**Experimental.** Generate a raster figure via AI image generation (LLM → SVG → PNG). Use when the user says '/figure', 'generate an image', 'create an illustration', or needs a visual that can't be built with boxes+arrows (/figure-diagram) or Figma (/figure-figma). Best for: illustrations, charts with curves, organic shapes, conceptual visuals."
allowed-tools: Bash, Read, Write
argument-hint: "<description of the figure>"
---

Generate a raster figure via AI: $ARGUMENTS

## When to use this skill

Use `/figure` only for visuals that **neither** of the other figure skills can handle:

| Need | Skill |
|---|---|
| Boxes + arrows diagram (architecture, flowchart, pipeline) | `/figure-diagram` |
| Professional diagram in Figma (editable, Mermaid, custom shapes) | `/figure-figma` |
| Illustration, photo, chart with curves, organic/conceptual visual | **`/figure`** (this skill) |

## Prerequisites

The user must have run `npm run init` to configure their AI provider. If not configured, tell them to run it first.

## Workflow

1. **Determine the output path** — save to the user's deck folder:
   ```
   examples/<deck-name>/figure-name.png
   ```

2. **Run the generation script:**
   ```bash
   npx tsx scripts/generate-figure.ts "<detailed description>" <output-path.png>
   ```

   Write a detailed, specific description. Include:
   - What the image should depict
   - Style (minimal, technical, hand-drawn, photorealistic)
   - Color scheme (mention theme colors if for a specific deck)
   - Composition (layout, focal point, negative space)

3. **Reference in slides:**
   ```ts
   import { resolve, dirname } from "path";
   import { fileURLToPath } from "url";
   const __dirname = dirname(fileURLToPath(import.meta.url));
   const img = (name: string) => resolve(__dirname, name);

   // As a full slide
   deck.image({ title: "Overview", imagePath: img("figure.png") });

   // On a blank slide
   deck.components.image(slide, { path: img("figure.png"), x: 1, y: 1.5, w: 10, h: 5 });
   ```

4. **Verify** — render the slide to PNG and check the result. If the generation looks bad, re-run with a refined prompt.

## How it works

Calls the configured LLM (set via `npm run init`) to generate an SVG, then converts to high-res PNG (1600x1200) via sharp. The SVG approach produces crisp, scalable graphics but is limited by the LLM's SVG generation ability.
