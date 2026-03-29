---
name: slides
description: "Create a new glissando slide deck from a natural language description. Use when the user says '/slides', 'create a deck', 'build a presentation', 'make slides about', or asks for a new talk/pitch deck."
allowed-tools: Read, Write, Bash, Glob
argument-hint: "<description of the deck>"
---

Create a glissando slide deck based on the user's request: $ARGUMENTS

## Workflow

### Phase 1: Plan content

1. **Pick a theme with font check.** Run `fc-list` or check `~/Library/Fonts/` to verify required fonts are installed. Choose accordingly:
   - `claudeDoc` (warm cream) — needs DM Serif Display + Inter + JetBrains Mono (`./scripts/install-fonts.sh`)
   - `elegantBw` (monochromatic) — needs Playfair Display + Space Grotesk + Inter (`./scripts/install-fonts.sh elegant-bw`)
   - `basicWhite` (clean white) — Helvetica Neue + Menlo, **no install needed**
   - `claudeDoc` + `macosNative` preset — Iowan Old Style + Avenir Next + Menlo, **no install needed**
   If the needed fonts are missing, either run the installer or fall back to a no-install theme.
2. **Outline pass.** Delegate to the `slides-outline-planner` agent (subagent_type: `slides-outline-planner`). Pass it:
   - The user's deck description / topic
   - Target slide count (8–12 for general decks)
   - If the user provided a GitHub repo or codebase path, pass that path so the agent can read the source directly
   The agent returns a numbered outline — one line per slide with type tags, title, and purpose.
3. **Review the outline.** Check narrative arc, pacing, and slide count. Adjust if needed (re-call the planner with feedback).
4. **Detail pass.** For each slide, call the `slides-detail-planner` agent (subagent_type: `slides-detail-planner`). Pass it:
   - The full outline from step 2
   - The specific slide number(s) to detail
   - Source material path/description so the agent can read it directly

   **Batching rules:**
   - `[title]`, `[section]` slides: batch up to 5 together
   - `[content]`, `[image]` slides: batch 2-3 together
   - Any slide tagged `[equation]`, `[code]`, or `[diagram]`: detail alone (batch of 1)
   - Mixed-tag slides (e.g., `[content,equation]`): detail alone

   Each call returns detailed content in `## Slide N: Title` markdown format.
5. **Assemble the plan.** Concatenate all detail outputs in slide order into a single markdown document.
6. Review the assembled plan. Flag any slide that needs `/figure`.

### Phase 2: Implement

4. Create a new folder under `examples/`
5. **Faithfully translate** the plan into `slides.ts`. Preserve the planner's content density — do not thin, split, or rewrite slides. Map markdown elements to the appropriate layout/component API:
   - Slides with only bullets → `deck.content()`
   - Slides with mixed content (text + equations + callouts) → `deck.blank()` with components
   - Slides with figures → `deck.image()` or manual placement on `blank()`
   - `$$...$$` blocks → `equation` component; `> blockquote` → `calloutBlock`; `**bold heading**` → section within a slide
6. For slides flagged for `/figure`, generate the figure before writing that slide's code.
7. Build: `./build.sh examples/<folder>`
8. **If the deck contains equations**, write `equations.md` in the deck folder — a manifest listing every equation's LaTeX source grouped by slide number and title. This lets the user re-create any equation in Keynote (Insert → Equation accepts LaTeX). Use clean LaTeX without code-level wrappers (no `String.raw`, no macro preamble concatenation).

### Phase 3: Verify

8. Visually verify:
   ```bash
   npx tsx scripts/render-slide.ts examples/<folder>/output.pptx --all --output /tmp/glissando-render
   ```
   Read each PNG in `/tmp/glissando-render/` to check every slide.
9. If issues found, fix `slides.ts`, rebuild, re-verify. Repeat until clean.

## Themes

```ts
// Warm cream with terra cotta accent (default)
import { claudeDoc } from "../../src/themes/claude-doc/index.js";
const deck = new Deck(claudeDoc);

// Clean white with blue accent (Keynote-inspired)
import { basicWhite } from "../../src/themes/basic-white/index.js";
const deck = new Deck(basicWhite);

// macOS native fonts (no install needed)
import { applyPreset } from "../../src/themes/claude-doc/index.js";
import { macosNative } from "../../src/themes/claude-doc/presets.js";
const deck = new Deck(applyPreset(claudeDoc, macosNative));
```

## Layout API

| Method | Use for |
|---|---|
| `deck.title({ title, subtitle? })` | Opening and closing slides |
| `deck.section({ title, subtitle? })` | Section dividers |
| `deck.content({ title, subtitle?, bullets })` | Heading + bullet list |
| `deck.twoColumn({ title, leftTitle?, rightTitle?, left, right })` | Side-by-side comparison |
| `deck.code({ title, code, language? })` | Syntax-highlighted code |
| `deck.quote({ quote, attribution? })` | Featured quote |
| `deck.image({ title, imagePath, caption? })` | Image with heading |
| `deck.table({ title, headers, rows })` | Data table |
| `await deck.equation({ title, equations: [{ latex, label? }] })` | LaTeX equations |
| `deck.blank({ bg? })` | Custom slide (use `deck.components` for placement) |

## Example

```ts
import { Deck } from "../../src/index.js";
import { claudeDoc } from "../../src/themes/claude-doc/index.js";

export default function build() {
  const deck = new Deck(claudeDoc);
  deck.title({ title: "AI-Powered Dev Tools", subtitle: "A Practical Guide" });
  deck.section({ title: "The Landscape" });
  deck.content({
    title: "Key Categories",
    bullets: ["Code generation", "Automated testing", "Documentation"],
  });
  deck.code({
    title: "Quick Example",
    code: `def greet(name):\n    return f"Hello, {name}!"`,
    language: "python",
  });
  deck.quote({ quote: "The best tool disappears into your workflow.", attribution: "Anonymous" });
  deck.title({ title: "Thank You" });
  return deck;
}
```

## Layout selection guide

- **Open** with `title`, **close** with `title`
- Use `section` to divide into 2-3 parts
- Default to `content` — keep to 3-5 bullets per slide
- Use `twoColumn` for comparisons, `code` for code, `quote` sparingly
- One idea per slide. 8-12 slides total.
- For diagrams: prefer built-in `diagramBox` + `arrow` components on `blank()` slides. See `CLAUDE.md` for the full component API.
