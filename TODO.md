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
- [x] `pptx-to-ts.ts` — reverse-engineering script. `/slides-from-pptx` skill operational.
- [x] Docs site — Mintlify setup at `docs/` with getting-started guide and API reference.
- [x] **OOXML writer** — replaced pptxgenjs with direct OOXML generation. Connectors, animations, grouping, emoji bullets, and footers are first-class.
- [x] **Remove pptx-patch.ts and pptxgenjs** — deleted 942-line post-processor, replaced with `jszip`.
- [x] **Unit test suite** — vitest with 45 tests covering layout, math, OOXML API, hyperlinks, transitions, accessibility, gradients.
- [x] **Clean up `as any` casts** — zero `as any` in `src/`.
- [x] **Typed Slide API** — `AddTextOpts`, `AddShapeOpts`, `AddImageOpts`, `AddTableOpts` + helper types.
- [x] **Hyperlinks** — `href` on TextRunOpts → `<a:hlinkClick>`. Also added `underline`.
- [x] **Slide transitions** — fade, push, wipe, cover, split, cut via `<p:transition>`.
- [x] **Accessibility** — `altText` on AddTextOpts, AddImageOpts → `descr` attribute on `<p:cNvPr>`.
- [x] **Gradient fills** — linear/radial gradients on shapes and text via `<a:gradFill>`.

## Open

- [ ] **Enrich API docs with examples** — Mintlify docs have reference tables but sparse code samples.
- [ ] **Chart component** — bar/line/pie charts via OOXML chart parts, or fallback to rendered SVG images.
- [ ] **Video/audio embedding** — embed media files in slides via OOXML media parts.
- [ ] **Master slide customization** — allow themes to define custom slide masters with placeholder layouts.
- [ ] **Gradient backgrounds** — extend `slide.background` to accept gradient fills, not just solid colors.
- [ ] **Text highlighting** — background color on individual text runs via `<a:highlight>`.
