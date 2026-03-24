---
name: figure
description: "Generate a raster figure for slides via AI image generation. This is a FALLBACK — first check if the diagram can be built with glissando's built-in diagramBox, arrow, and container components (see /slides skill). Use this only for visuals that require organic shapes, illustrations, charts, or complex graphics that boxes+arrows cannot express."
allowed-tools: Bash, Read, Write
argument-hint: "<description of the figure>"
---

Generate a figure based on the user's request: $ARGUMENTS

## Before using this skill

**Ask yourself: can this be built with boxes and arrows?**

If YES → use `deck.blank()` + `deck.components.diagramBox/arrow/container` instead. Built-in components produce vector, editable, themed shapes. See the `/slides` skill for the diagram component API.

If NO (photos, illustrations, charts with curves, complex organic visuals) → proceed below.

## Prerequisites

The user must have run `npm run init` to configure their AI provider. If not configured, tell them to run it first.

## Workflow

1. Determine the output path — save to the user's deck folder (e.g. `examples/my-deck/figure.png`)
2. Run the generation script:

```bash
npx tsx scripts/generate-figure.ts "<description>" <output-path.png>
```

3. Reference in slides with absolute path:

```ts
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const img = (name: string) => resolve(__dirname, name);

deck.image({ title: "Overview", imagePath: img("figure.png") });
```

4. If the generation fails or looks bad, re-run with a refined prompt.

## How it works

Calls the configured LLM (set via `npm run init`) to generate an SVG, converts to high-res PNG via sharp.
