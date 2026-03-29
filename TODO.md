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

- [ ] **Unit test suite** — currently only smoke tests (`npm test` builds example decks). Add vitest with tests for layout helpers, component Rect returns, inline math parsing, equation rendering, emoji resolution.
- [ ] **Enrich API docs with examples** — Mintlify docs have reference tables but sparse code samples. Each component and layout should have a copy-pasteable example.
- [ ] **Accessibility** — alt text helpers for images and equations, semantic slide structure metadata.
