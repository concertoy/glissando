# TODO

## Completed

- [x] `npm run check` — `tsc --noEmit` wired up in package.json.
- [x] Move `runner.ts` to `scripts/`.
- [x] Speaker notes — `notes` param on all layouts + `speakerNote()` helper.
- [x] Slide numbering / footers / citations — `deck.footer()`, `deck.bib()`, `deck.cite()`.
- [x] Themed image component — `image(slide, { ... })` with caption, border, rounding.
- [x] Font presets for all themes — `claude-doc`, `basic-white`, `elegant-bw` each have presets.
- [x] Animation / build reveals — `build: true` on `bulletList`, `numberedList`, `deck.content()`.
- [x] Inline math — `$...$` syntax in `bulletList`, `bodyText`, `numberedList`, `calloutBlock`, `textBlock`.
- [x] Themed emojis — `:emoji:` syntax + standalone component, three styles (openmoji-outline, openmoji, twemoji).
- [x] Layout helpers — `columns()`, `rows()`, `below()`, `inset()`, `deck.area()`, `deck.contentArea()`.
- [x] Diagram components — `diagramBox`, `arrow`, `hookArrow`, `container`, native `deck.connector()`.
- [x] `pptx-to-ts.ts` — 641-line reverse-engineering script with `main()` entry point. `/slides-from-pptx` skill operational.
- [x] Docs site — Mintlify setup at `docs/` with getting-started guide and API reference.

## Open

- [ ] **Table of contents layout** — `deck.toc()` that auto-generates a slide from slide titles. Inspired by Slidev's `<Toc>` component.
- [x] **Auto-fit text** — `autoFit?: boolean` on `heading` and `bodyText` exposes pptxgenjs `fit: "shrink"` to scale text down to fit.
- [ ] **Slide transitions** — expose PPTX native transitions (fade, push, wipe) via `transition?` on layout methods. pptxgenjs supports `slide.addSlideTransition()`.
- [x] **Figma diagram integration** — `/figure` skill prefers Figma MCP when available: Mermaid → `generate_diagram`, custom → `use_figma`, capture via `get_screenshot`. Falls back to LLM→SVG→PNG.
- [ ] **Code diff component** — `codeDiff(slide, { before, after })` showing side-by-side code changes. Inspired by Slidev's Shiki Magic Move.
- [ ] **Slide composition** — `deck.import("./module.ts")` for reusable slide modules across decks.
