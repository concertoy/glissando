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
- [x] **Unit test suite** — vitest with 83 tests covering layout, math, OOXML API, hyperlinks, transitions, accessibility, gradients, and more.
- [x] **Clean up `as any` casts** — zero `as any` in `src/`.
- [x] **Typed Slide API** — `AddTextOpts`, `AddShapeOpts`, `AddImageOpts`, `AddTableOpts` + helper types.
- [x] **Hyperlinks** — `href` on TextRunOpts → `<a:hlinkClick>`. Also added `underline`.
- [x] **Slide transitions** — fade, push, wipe, cover, split, cut via `<p:transition>`.
- [x] **Accessibility** — `altText` on AddTextOpts, AddImageOpts → `descr` attribute on `<p:cNvPr>`.
- [x] **Gradient fills** — linear/radial gradients on shapes and text via `<a:gradFill>`.
- [x] **Gradient backgrounds** — `slide.background` accepts `gradient` field for linear/radial gradient fills.
- [x] **Text highlighting** — `highlight` on TextRunOpts → `<a:highlight>` for background color on text runs.

- [x] **Strikethrough text** — `strike` on TextRunOpts → `strike="sngStrike"` attribute on `<a:rPr>`.
- [x] **Shape/text rotation** — `rotate` on AddTextOpts (already on AddShapeOpts) → `rot` attribute on `<a:xfrm>`.
- [x] **Text columns** — `columns` + `columnSpacing` on AddTextOpts → `numCol` + `spcCol` on `<a:bodyPr>`.
- [x] **Shape opacity** — `opacity` on AddTextOpts → `<a:alpha>` on solid fill color.
- [x] **Custom bullet characters** — `bulletChar` on BulletListProps + `char` on BulletOpts for direct Unicode bullets.

- [x] **Image cropping** — `crop` on AddImageOpts → `<a:srcRect>` for percentage-based edge cropping.
- [x] **Text shadow** — `textShadow` on TextRunOpts → `<a:outerShdw>` with configurable color, blur, offset, angle.
- [x] **Vertical text** — `vertical` on AddTextOpts → `vert` attribute on `<a:bodyPr>` for top-to-bottom text.

- [x] **Image border/shadow/rotation** — `line`, `shadow`, `rotate` on AddImageOpts. Shared `buildShadowXml` helper with `angle` support.

- [x] **Table cell merge** — `colspan`/`rowspan` on TableCell → `gridSpan`/`rowSpan` + `hMerge`/`vMerge` on `<a:tc>`.

- [x] **Shape flipping** — `flipH`/`flipV` on AddTextOpts → flip attributes on `<a:xfrm>`.
- [x] **Slide background image** — `image` field on `slide.background` → `<a:blipFill>` in `<p:bg>`.
- [x] **Table row height** — `rowH` accepts number[] for per-row heights on AddTableOpts.
- [x] **Rich text in tables** — `TableCell.text` accepts `TextRun[]` for mixed formatting within cells.
- [x] **Dashed lines** — `dashType` on LineOpts with 8 OOXML dash presets, applied to shapes, text, and images.

- [x] **Arrow shape presets** — all OOXML preset shapes now pass through (chevron, rightArrow, ellipse, triangle, diamond, pentagon, etc.).
- [x] **Multi-paragraph table cells** — `breakLine` in rich text runs splits table cells into multiple `<a:p>` elements.
- [x] **Superscript/subscript in tables** — already supported via rich text `TextRun[]` + `buildRunProps`.

- [x] **Shape adjust values** — `adjustments` on AddShapeOpts for custom geometry tuning via `<a:gd>` in `<a:avLst>`.
- [x] **Table border styles** — typed `TableBorderOpts` replacing `any[]` for cell borders.

- [x] **Gradient on text runs** — `gradient` on TextRunOpts replaces solid color with `<a:gradFill>` in `<a:rPr>`.
- [x] **Pattern fills** — `patternFill` on AddShapeOpts/AddTextOpts → `<a:pattFill>` with OOXML pattern presets.

- [x] **Slide notes formatting** — `addNotes` accepts `TextRun[]` for rich text (bold, italic, multi-paragraph) in speaker notes.
- [x] **Slide duplication** — `deck.duplicate(slideIndex)` / `pres.duplicateSlide(index)` clones slides with all elements and media.

## Open

- [ ] **Enrich API docs with examples** — Mintlify docs have reference tables but sparse code samples.
- [ ] **Chart component** — bar/line/pie charts via OOXML chart parts, or fallback to rendered SVG images.
- [ ] **Video/audio embedding** — embed media files in slides via OOXML media parts.
- [ ] **Master slide customization** — allow themes to define custom slide masters with placeholder layouts.
- [ ] **Placeholder-based text** — use OOXML placeholder types (`title`, `body`) for better theme compatibility.
- [ ] **SmartArt** — basic SmartArt generation for org charts and process flows.
- [ ] **Font embedding** — embed custom fonts in the PPTX for portability.
- [ ] **Slide reordering** — `deck.moveSlide(from, to)` for rearranging slide order.
- [ ] **Slide deletion** — `deck.removeSlide(index)` for removing slides after creation.
