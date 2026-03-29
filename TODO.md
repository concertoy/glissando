# TODO

## Near-term (cleanup)

- [x] Add `npm run check` — wire up `tsc --noEmit` in package.json scripts for CI readiness.
- [x] Move `runner.ts` to `scripts/` — currently at project root, inconsistent with other scripts.

## Medium-term (features)

- [x] **Speaker notes** — add optional `notes?: string` to every layout method and a `speakerNote(slide, text)` component. pptxgenjs supports `slide.addNotes()`.
- [x] **Slide numbering / footers / citations** — `deck.footer()`, `deck.bib()`, `deck.cite()` with author-year and compact citation styles.
- [x] **Themed image component** — `image(slide, { path|data, x, y, w, h, caption?, border?, rounding?, sizing? })` component for `blank()` slides.
- [x] **Font presets for other themes** — `basic-white` and `elegant-bw` have no presets system. Add `presets.ts` for each (e.g., serif/sans variants).
- [x] **Animation / build reveals** — `build: true` on `bulletList`, `numberedList`, and `deck.content()` for bullet-by-bullet reveal on click.

## Longer-term (quality & ecosystem)

- [ ] **Unit test suite** — currently only smoke tests. Add vitest with tests for component Rect returns, layout helpers, equation rendering, connector geometry.
- [ ] **Enrich API docs with examples** — Mintlify docs have reference tables but sparse code samples. Each component and layout should have a copy-pasteable example.
- [ ] **Theme development guide** — document how to create a custom theme from scratch (config -> components -> layouts -> index.ts).
- [ ] **Complete `pptx-to-ts.ts`** — the reverse-engineering script (`/slides-from-pptx`) has 21KB of XML parsing utilities but no clean exported main. Finish and document it.
- [ ] **Accessibility** — add alt text helpers for images and equations, semantic slide structure metadata.
