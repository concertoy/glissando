# Roadmap: Agent-Native Improvements

Principle: **easy to use, simple, useful.**

## Priority Table

| Idea | Impact | Effort | Status |
|---|---|---|---|
| `.claude/` skills + hooks | Very high | Low | Next |
| Markdown auto-layout API | High | Low-medium | Planned |
| Beamer → Glissando converter | Medium | Medium | Planned |
| Sketch-to-slides (text prompt) | Medium | Low | Planned |
| Sketch-to-slides (image) | Medium | Low (prompt only) | Planned |
| Visual feedback MCP tool | High | Medium | Planned |
| More themes | Medium | Medium | Planned |
| PPTX reverse engineering | Medium | Hard | Deferred |

## 1. `.claude/` Skills + Hooks (Do First)

The highest-leverage improvement. Agents currently must read CLAUDE.md to understand the API — skills bake that knowledge in directly, and hooks automate the build-test loop.

### Required skills

#### `/slides` — scaffold a full deck from a natural language prompt

The agent says `/slides "10-slide pitch deck about X"` and gets a complete `slides.ts` file. The skill prompt should contain:

- The full layout API reference (method signatures, prop types, descriptions)
- The full component API reference (for custom `blank()` slides)
- The font preset options and how to apply them
- A complete working example (`slides.ts`) so the agent has a concrete pattern
- Layout selection guidance: when to use `content` vs `twoColumn` vs `code` vs `quote`, how to open with `title`, divide with `section`, close with `title`
- Slide count and pacing rules (e.g. 1 idea per slide, ~5 bullets max)
- The build command (`./build.sh <folder>`) so the agent knows how to verify

Trigger: user says `/slides`, "create a deck", "build a presentation", "make slides about".

#### `/slides-edit` — modify an existing deck

Takes a path to an existing `slides.ts` and a natural language edit instruction. The skill reads the file, understands the current structure, and applies the change.

Examples: "add a slide about X after slide 3", "change the code example to use Python", "replace the quote on the last slide".

#### `/slides-from-tex` — convert Beamer `.tex` to Glissando

Reads a `.tex` file, extracts frames/itemize/code/equations, and emits a `slides.ts`. Includes mapping rules for the common Beamer → Glissando subset (frames → layouts, itemize → bullets, lstlisting → code, equations → equation).

#### `/slides-from-sketch` — interpret a layout description or image

Two modes:
- **Text mode**: user describes layout ("two columns, code on left, bullet points on right"). The skill maps natural language positions to `(x, y, w, h)` coordinates and component calls.
- **Image mode**: user provides a photo/sketch. The skill prompts the vision model with the slide coordinate system (13.33" × 7.5") and component API, asking it to map sketch regions to component placements.

### Required hooks

#### Auto-build on save

When any `slides.ts` file is saved, automatically run `./build.sh` on its parent folder. This gives the agent immediate build success/failure feedback without needing to remember to build.

```json
{
  "hooks": {
    "afterWrite": [
      {
        "pattern": "**/slides.ts",
        "command": "./build.sh $(dirname $FILE)"
      }
    ]
  }
}
```

#### Visual feedback (stretch goal — requires MCP tool)

After a successful build, render the output PPTX to PNGs so the agent can "see" the slides. This closes the feedback loop — the agent writes code, builds, and visually verifies without the human needing to open Keynote.

Implementation options:
- `sips` (macOS built-in) — can convert PDF pages to PNG, but PPTX→PDF needs LibreOffice
- `LibreOffice --headless --convert-to pdf` — cross-platform but requires LibreOffice installed
- `sharp` + JSZip — extract slide XML, render text/shapes to canvas (heavy, probably not worth it)

The pragmatic path: an MCP tool that shells out to LibreOffice headless (if available) or falls back to extracting slide text/structure for text-based feedback.

## 2. Markdown Auto-Layout API

A `deck.fromMarkdown(md)` method that parses `---`-separated sections and auto-selects layouts. Simplest possible agent interface — the agent writes markdown, not TypeScript.

## 3. Beamer → Glissando Converter

A `scripts/from-beamer.ts` script. Handle the 80% case: frames, itemize, code listings, equations, sections. Best-effort, not a full LaTeX parser.

## 4. Sketch-to-Slides

Embed in skill prompts rather than building a separate tool. The coordinate system (13.33" × 7.5") and component API are the key context the agent needs.

## 5. Visual Feedback MCP Tool

An MCP server that converts PPTX → PNG slides for in-context visual verification. High value for closing the agent feedback loop.

## 6. More Themes

Add 2-3 themes (dark, academic, startup pitch). Each theme is ~4 files following the `claude-doc/` pattern.

## 7. PPTX Reverse Engineering

Parse existing PPTX and emit equivalent `slides.ts`. Defer until the API stabilizes.
