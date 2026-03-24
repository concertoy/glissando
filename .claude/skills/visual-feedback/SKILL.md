---
name: visual-feedback
description: "Render PPTX slides to PNG and diagnose visual errors. Use after building a deck, when the user says '/visual-feedback', 'check the slides', 'how do the slides look', 'verify visually', or after /slides completes."
allowed-tools: Bash, Read
argument-hint: "<path-to-deck-folder-or-pptx> [--page N]"
---

Visually inspect a glissando deck: $ARGUMENTS

## Workflow

1. **Resolve the PPTX path.** If a folder is given (e.g. `examples/my-deck`), use `examples/my-deck/output.pptx`. If a `.pptx` file is given, use it directly.

2. **Render to PNG:**
   ```bash
   npx tsx scripts/render-slide.ts <pptx-path> --all --output /tmp/glissando-render
   ```
   This produces `/tmp/glissando-render/slide.001.png`, `slide.002.png`, etc.

3. **Read each PNG** using the Read tool. Claude can see images natively — this is how you "look at" each slide.

4. **For decks > 10 slides**, check a representative sample: first slide, last slide, middle slide, and any custom/diagram slides. Check all slides only if the user requests it.

5. **Diagnose issues.** For each slide, check:
   - Text overflow or truncation (text cut off at box edges)
   - Overlapping elements (text through shapes, stacked content)
   - Low color contrast (light text on light background)
   - Layout imbalance (too crowded or too empty)
   - Alignment inconsistency across slides
   - Code block formatting (line breaks, syntax highlighting)
   - Missing content (blank areas, missing bullets)

6. **Report findings** in structured format:

   ```
   ## Visual Feedback Report

   ### Slide 1: [title]
   - PASS / issues found
   - [CRITICAL] Text overflows code block boundary
   - [WARNING] Low contrast on subtitle text

   ### Summary
   1. Fix X in slides.ts line Y
   ```

7. **Suggest fixes** — reference specific layout methods, component props, or `(x, y, w, h)` values in `slides.ts`.
