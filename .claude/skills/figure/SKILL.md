---
name: figure
description: "Generate a figure or diagram for slides using the configured AI provider. Use when the user says '/figure', 'generate a diagram', 'create a figure', 'draw a flowchart', or needs a visual for their deck."
allowed-tools: Bash, Read, Write
argument-hint: "<description of the figure>"
---

Generate a figure based on the user's request: $ARGUMENTS

## Prerequisites

The user must have run `npm run init` to configure their AI provider. If not configured, tell them to run it first.

## Workflow

1. Determine the output path — save to the user's deck folder (e.g. `examples/my-deck/figure.png`)
2. Run the generation script:

```bash
npx tsx scripts/generate-figure.ts "<description>" <output-path.png>
```

3. If the generation succeeds, show the user how to use it in their slides:

```ts
deck.image({
  title: "Architecture Overview",
  imagePath: "./figure.png",  // relative to the deck folder
  caption: "Generated diagram",
});
```

4. If the user wants changes, re-run with an updated prompt.

## Examples

```bash
# Flowchart
npx tsx scripts/generate-figure.ts "A flowchart showing user signup: form → validate → create account → send email" examples/my-deck/signup-flow.png

# Architecture diagram
npx tsx scripts/generate-figure.ts "Microservices architecture with API gateway, 3 services, and a database" examples/my-deck/architecture.png

# Comparison diagram
npx tsx scripts/generate-figure.ts "Venn diagram comparing supervised learning and reinforcement learning" examples/my-deck/venn.png
```

## How it works

The script calls the configured LLM (set via `npm run init`) to generate an SVG, then converts it to a high-resolution PNG via sharp. The PNG can be embedded in slides via `deck.image()`.
