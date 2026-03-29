# TODO

## Near-term (cleanup)

- [ ] Add `npm run check` — wire up `tsc --noEmit` in package.json scripts for CI readiness.
- [ ] Move `runner.ts` to `scripts/` — currently at project root, inconsistent with other scripts.

## Medium-term (features)

- [ ] **Speaker notes** — add optional `notes?: string` to every layout method and a `speakerNote(slide, text)` component. pptxgenjs supports `slide.addNotes()`.
- [ ] **Slide numbering / footers** — a `Deck`-level option that auto-adds page numbers and optional footer text to every slide.
- [ ] **Themed image component** — currently only `deck.image()` layout exists. Add an `image(slide, { path, x, y, w, h, caption?, border? })` component for use on `blank()` slides.
- [ ] **Font presets for other themes** — `basic-white` and `elegant-bw` have no presets system. Add `presets.ts` for each (e.g., serif/sans variants).
- [ ] **Animation / build reveals** — pptxgenjs supports basic animations. Add `appear: "fadeIn"` or `build: true` to bullet lists for step-by-step reveals.

## Longer-term (quality & ecosystem)

- [ ] **Unit test suite** — currently only smoke tests. Add vitest with tests for component Rect returns, layout helpers, equation rendering, connector geometry.
- [ ] **Enrich API docs with examples** — Mintlify docs have reference tables but sparse code samples. Each component and layout should have a copy-pasteable example.
- [ ] **Theme development guide** — document how to create a custom theme from scratch (config -> components -> layouts -> index.ts).
- [ ] **Complete `pptx-to-ts.ts`** — the reverse-engineering script (`/slides-from-pptx`) has 21KB of XML parsing utilities but no clean exported main. Finish and document it.
- [ ] **Accessibility** — add alt text helpers for images and equations, semantic slide structure metadata.
