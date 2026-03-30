---
name: figure
description: "**Experimental.** Generate a raster figure for slides via AI image generation. This is a FALLBACK — first check if the diagram can be built with glissando's built-in diagramBox, arrow, and container components (see /slides skill). Use this only for visuals that require organic shapes, illustrations, charts, or complex graphics that boxes+arrows cannot express."
allowed-tools: Bash, Read, Write
argument-hint: "<description of the figure>"
---

Generate a figure based on the user's request: $ARGUMENTS

## Before using this skill

**Ask yourself: can this be built with boxes and arrows?**

If YES → use `deck.blank()` + `deck.components.diagramBox/arrow/container` instead. Built-in components produce vector, editable, themed shapes. See the `/slides` skill for the diagram component API.

If NO (photos, illustrations, charts with curves, complex organic visuals) → proceed below.

## Path Selection

Check if the Figma MCP tools (`generate_diagram`, `use_figma`) are available:

- **Figma available** → use Path A (Figma MCP) — professional quality, themed diagrams
- **Figma not available** → use Path B (LLM → SVG → PNG) — no external deps

---

## Path A: Figma MCP (preferred)

Use this when Figma MCP tools are available. Produces professionally rendered diagrams that match the slide theme.

### Step 1: Determine diagram type

| Type | Figma tool | Format |
|---|---|---|
| Flowchart, sequence, state, Gantt, org chart | `generate_diagram` | Mermaid syntax |
| Custom layout, branded diagram, complex composition | `use_figma` | Direct shape creation |

### Step 2: Get theme colors

If generating for an existing deck, read the theme config to extract colors:
- `accent` — primary accent color (use for key nodes, highlights)
- `bgPrimary` — background color
- `text` — main text color
- `textMuted` — secondary text, connectors

### Step 3a: Mermaid diagrams (flowcharts, sequences, etc.)

1. Create a new file:
   ```
   create_new_file — type: FigJam, name: "VibeSlides: <diagram title>"
   ```

2. Generate the diagram with theme colors via Mermaid theming:
   ```
   generate_diagram — with Mermaid syntax
   ```

   **Mermaid syntax reference:**

   Flowchart:
   ```mermaid
   flowchart LR
     A[Input] --> B{Process}
     B -->|Yes| C[Output]
     B -->|No| D[Error]
     style A fill:#DA7756,color:#fff
     style C fill:#4A7B6F,color:#fff
   ```

   Sequence diagram:
   ```mermaid
   sequenceDiagram
     participant C as Client
     participant S as Server
     C->>S: Request
     S-->>C: Response
   ```

   State diagram:
   ```mermaid
   stateDiagram-v2
     [*] --> Idle
     Idle --> Processing : submit
     Processing --> Done : complete
     Done --> [*]
   ```

   Apply theme colors using Mermaid `style` directives with the deck's accent/text hex values.

3. Capture the result:
   ```
   get_screenshot — of the generated diagram
   ```

4. Save the screenshot image to the deck folder as `<name>.png`.

### Step 3b: Custom Figma diagrams

For diagrams that Mermaid can't express:

1. Create a new file:
   ```
   create_new_file — type: Design, name: "VibeSlides: <diagram title>"
   ```

2. Use `use_figma` to create shapes, text, and connectors. Apply the deck's theme colors to fills, strokes, and text.

3. Capture and save as above.

### Step 4: Reference in slides

```ts
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const img = (name: string) => resolve(__dirname, name);

deck.image({ title: "Overview", imagePath: img("figure.png") });
```

### Step 5: Report

Tell the user:
- The Figma file has been kept in their drafts for future editing
- Provide the file name so they can find it in Figma
- If the screenshot resolution is insufficient, suggest re-exporting from Figma at higher resolution

---

## Path B: LLM → SVG → PNG (fallback)

Use this when Figma MCP is not available.

### Prerequisites

The user must have run `npm run init` to configure their AI provider. If not configured, tell them to run it first.

### Workflow

1. Determine the output path — save to the user's deck folder (e.g. `examples/my-deck/figure.png`)
2. Run the generation script:

```bash
npx tsx scripts/generate-figure.ts "<description>" <output-path.png>
```

3. Reference in slides (same as Path A Step 4 above).
4. If the generation fails or looks bad, re-run with a refined prompt.

### How it works

Calls the configured LLM (set via `npm run init`) to generate an SVG, converts to high-res PNG (1600×1200) via sharp.
