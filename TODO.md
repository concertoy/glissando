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
- [x] **Unit test suite** — vitest with 91 tests covering layout, math, OOXML API, hyperlinks, transitions, accessibility, gradients, and more.
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

- [x] **Slide reordering** — `deck.moveSlide(from, to)` / `pres.moveSlide()` for rearranging slide order.
- [x] **Slide deletion** — `deck.removeSlide(index)` / `pres.removeSlide()` for removing slides.

- [x] **Slide count accessor** — `deck.slideCount` getter for querying total slides.
- [x] **Presentation metadata** — `deck.metadata({ title, author, subject, keywords })` → OOXML `docProps/core.xml`.

- [x] **Table cell gradient fills** — `gradient` on TableCell options → `<a:gradFill>` in `<a:tcPr>`.

- [x] **Line end types** — `headEnd`/`tailEnd` on LineOpts + shared `buildLineXml` helper for all line rendering.

- [x] **Shape text** — `text` on AddShapeOpts with `fontSize`, `fontFace`, `color`, `align`, `valign`, `bold`. Supports `string | TextRun[]`.

- [x] **Progress bar component** — `progressBar(slide, { steps, current, ... })` horizontal step indicator with dots, connecting lines, labels, and active/completed states.
- [x] **QR code component** — `qrCode(slide, { url, ... })` generates QR codes as PNG via `qrcode` + `sharp`, with optional caption and custom colors.
- [x] **Shape group nesting** — `slide.addGroup()` and `GroupShape.addGroup()` for nested `<p:grpSp>` hierarchies. Groups support `addText`, `addShape`, `addImage`, and nested `addGroup`.

- [x] **Slide background patterns** — `patternFill` on `slide.background` → `<a:pattFill>` in `<p:bg>`.
- [x] **Text transform / WordArt** — `textTransform` on AddTextOpts → `<a:prstTxWarp>` for arch, wave, deflate, etc.
- [x] **Watermark** — `slide.addWatermark(text, { opacity?, color?, rotate? })` for semi-transparent overlays.
- [x] **Text run opacity** — `opacity` on TextRunOpts → `<a:alpha>` on text color for per-run transparency.
- [x] **Timeline component** — `timeline(slide, { events, direction?, ... })` horizontal/vertical event timeline with dots, dates, titles.

- [x] **Linked slides (hyperlink to slide)** — `slideLink` on TextRunOpts → `<a:hlinkClick action="ppaction://hlinksldjump">` for internal slide navigation.
- [x] **Table auto-column widths** — `autoColW` on AddTableOpts calculates proportional column widths from cell content length.
- [x] **Text subscript/superscript in bodyText** — `^{super}` and `_{sub}` syntax in plain text (outside `$...$`) via `expandTextWithMath`.

- [x] **Numbered list start index** — `startAt` on BulletOpts and NumberedListProps → `startAt` attribute on `<a:buAutoNum>`.
- [x] **Table cell vertical text** — `vertical` on TableCell options → `vert` attribute on `<a:tcPr>`.
- [x] **Text fit with minFontScale** — `fit: { minFontScale: 50 }` on AddTextOpts → `<a:normAutofit fontScale="50000"/>`.
- [x] **Slide hide** — `slide.hidden = true` → `show="0"` on `<p:sld>` to skip during playback.
- [x] **Table cell padding per-side** — `margin: [top, right, bottom, left]` on TableCell options for per-side cell padding.
- [x] **Paragraph indent/hanging** — `indent` and `marginLeft` on TextRunOpts → `indent` and `marL` attributes on `<a:pPr>`.
- [x] **Text outline** — `outline` on TextRunOpts → `<a:ln>` in `<a:rPr>` for outlined/stroked text characters.
- [x] **Shape glow effect** — `glow` on AddTextOpts/AddShapeOpts → `<a:glow>` in `<a:effectLst>`. Combines with shadow.
- [x] **Soft edge effect** — `softEdge` on AddTextOpts/AddShapeOpts → `<a:softEdge>` for feathered edges.
- [x] **Reflection effect** — `reflection` on AddTextOpts/AddShapeOpts → `<a:reflection>` for mirror effects.
- [x] **Text caps** — `caps` on TextRunOpts → `cap` attribute on `<a:rPr>` for all-caps or small-caps.
- [x] **Shape 3D bevel** — `bevel` on AddTextOpts/AddShapeOpts → `<a:sp3d>` with `<a:bevelT>` for depth effects.

- [x] **Inner shadow** — `innerShadow` on AddTextOpts/AddShapeOpts → `<a:innerShdw>` for inset shadows.
- [x] **Text columns in shapes** — `columns`/`columnSpacing` on AddShapeOpts → `numCol`/`spcCol` on shape text `<a:bodyPr>`.

- [x] **Image tiling** — `tile` on AddImageOpts → `<a:tile>` for repeating image patterns.
- [x] **Custom geometry shapes** — `addFreeform()` on Slide and GroupShape → `<a:custGeom>` with moveTo, lineTo, cubicBezTo, arcTo, close segments.
- [x] **Shape 3D extrusion** — `extrusion` on AddTextOpts/AddShapeOpts → `extrusionH` + `<a:extrusionClr>` on `<a:sp3d>`. Combines with bevel.
- [x] **Shape connectors by name** — `deck.connect("boxA", "boxB", { type: "elbow" })` convenience method on Deck with `fromSide`/`toSide` options.
- [x] **Shape preset effects** — `shapePresets.glossy()`, `.matte()`, `.card()`, `.embossed()`, `.floating()` combining bevel, shadow, gradient, inner shadow.

- [x] **Shape hyperlinks** — `href` on AddShapeOpts → `<a:hlinkClick>` on `<p:cNvPr>` makes entire shape clickable.
- [x] **Table striping** — `stripe: [evenColor, oddColor]` on AddTableOpts for alternating row background colors (skips header row).
- [x] **Image filters** — `grayscale`, `brightness`, `contrast` on AddImageOpts → `<a:grayscl>` and `<a:lum>` on blip.
- [x] **Presentation-level defaults** — `pres.setDefaults({ fontFace, fontSize, color })` applied as fallback in text runs.

## Open

### High impact
- [ ] **Chart component** — bar/line/pie charts via OOXML chart parts, or fallback to rendered SVG images.
- [ ] **Video/audio embedding** — embed media files in slides via OOXML media parts.
- [ ] **Master slide customization** — allow themes to define custom slide masters with placeholder layouts.
- [ ] **Enrich API docs with examples** — Mintlify docs have reference tables but sparse code samples.

### Medium impact
- [ ] **Placeholder-based text** — use OOXML placeholder types (`title`, `body`) for better theme compatibility.
- [ ] **SmartArt** — basic SmartArt generation for org charts and process flows.
- [ ] **Font embedding** — embed custom fonts in the PPTX for portability.
- [ ] **Slide master backgrounds** — allow themes to define reusable slide masters with custom backgrounds/logos.
- [ ] **Ink annotations** — `slide.addInk()` for freehand drawing paths via `<p:inkPen>`.
- [ ] **OLE embedding** — `slide.addOleObject()` for embedding Excel/PDF objects as icons or inline frames.
- [ ] **Slide layout templates** — `pres.addLayout(name, { placeholders })` for custom slide layouts in slideMasters.
- [ ] **Text run hyperlink to slide** — combine `href` and `slideLink` in a single run for tooltip + navigation.
- [ ] **Shape animation presets** — `appear`, `fadeIn`, `flyIn` on shapes via `<p:timing>` (extend build animations beyond bullets).

### New proposals
- [ ] **Treemap / heatmap component** — `treemap(slide, { data, ... })` for data visualization using nested colored rects.
- [ ] **Icon library component** — `icon(slide, { name, ... })` expand beyond Lucide to Material Symbols / Phosphor icons.
- [ ] **Table header freeze** — `freezeHeader: true` on AddTableOpts to lock first row in PowerPoint table view.
- [ ] **Shape click actions** — `action` on AddShapeOpts for built-in PowerPoint actions (next slide, previous slide, first/last, end show).
- [ ] **Image placeholder** — lazy image loading with `placeholder: true` for decks where images are resolved later.
- [ ] **Text auto-size** — `autoSize: true` on AddTextOpts to auto-shrink text to fit bounding box.
- [ ] **Slide comments** — `slide.addComment({ text, author })` for review annotations.
- [ ] **Color theme variables** — `pres.defineColor("accent1", "3366CC")` for reusable named colors across elements.
- [ ] **Gradient text on shapes** — extend shape text to support gradient fills on text runs within shapes.
- [ ] **Table sorting indicator** — visual sort arrows on header cells for data table presentations.
