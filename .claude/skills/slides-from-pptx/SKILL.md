---
name: slides-from-pptx
description: "Reverse-engineer a PPTX back into glissando slides.ts. Use when the user says '/slides-from-pptx', 'reverse a pptx', 'extract slides from pptx', or 'pptx to ts'."
allowed-tools: Read, Write, Bash, Glob
argument-hint: "<path to .pptx file>"
---

Reverse-engineer a glissando PPTX into slides.ts: $ARGUMENTS

Run: `npx tsx scripts/pptx-to-ts.ts <pptx-path>`

Write the output to a `slides.ts` file next to the PPTX (or in a new folder under `examples/`). Show the user the generated code.
