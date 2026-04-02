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
- [x] **OOXML writer** — replaced pptxgenjs with direct OOXML generation (`src/ooxml/index.ts` + `src/ooxml/writer.ts`). Connectors, animations, grouping, emoji bullets, and footers are first-class instead of post-hoc XML patching.
- [x] **Remove pptx-patch.ts and pptxgenjs** — deleted 942-line post-processor, replaced `pptxgenjs` with `jszip` in dependencies. Zero external PPTX generation dependencies.
- [x] **Unit test suite** — vitest with 40 tests covering layout helpers, inline math parsing, OOXML Presentation/Slide API, paragraph splitting, XML escaping, hyperlinks, transitions, and ZIP output validation.
- [x] **Clean up `as any` casts** — removed all `as any` casts from components.ts and elegant-bw layouts. Zero `as any` in `src/`.
- [x] **Typed Slide API** — defined `AddTextOpts`, `AddShapeOpts`, `AddImageOpts`, `AddTableOpts`, `FillOpts`, `LineOpts`, `ShadowOpts` interfaces. Full IDE autocomplete for all Slide methods.
- [x] **Hyperlinks** — `href` property on `TextRunOpts` generates `<a:hlinkClick>` with proper relationship entries. Also added `underline` support.
- [x] **Slide transitions** — `slide.transition = { type, duration?, advanceAfter? }` generates `<p:transition>` element. Supports fade, push, wipe, cover, split, cut.

## Open

- [ ] **Enrich API docs with examples** — Mintlify docs have reference tables but sparse code samples. Each component and layout should have a copy-pasteable example.
- [ ] **Accessibility** — alt text helpers for images and equations, semantic slide structure metadata.
- [ ] **Chart component** — bar/line/pie charts via OOXML chart parts, or fallback to rendered SVG images.
- [ ] **Gradient fills** — support linear/radial gradients on shapes and backgrounds via `<a:gradFill>`.
- [ ] **Video/audio embedding** — embed media files in slides via OOXML media parts.
- [ ] **Master slide customization** — allow themes to define custom slide masters with placeholder layouts.
