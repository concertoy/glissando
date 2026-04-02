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

- [x] **Shape click actions** — `action` on AddShapeOpts (`nextSlide`, `prevSlide`, `firstSlide`, `lastSlide`, `endShow`) via `ppaction://hlinkshowjump`.
- [x] **Slide comments** — `slide.addComment({ text, author, x, y })` → OOXML `ppt/comments/commentN.xml` parts.
- [x] **Color theme variables** — `pres.defineColor(name, hex)` and `pres.resolveColor(name)` for reusable named colors.
- [x] **Gradient text on shapes** — already supported via `TextRun[]` with `gradient` option in shape text.
- [x] **Text auto-size** — already supported via `autoFit: true` on AddTextOpts → `<a:spAutoFit/>`.

- [x] **Shape tooltip** — `tooltip` on AddShapeOpts → `<a:hlinkHover>` for hover text.
- [x] **Image hyperlink** — `href` on AddImageOpts → `<a:hlinkClick>` on image `<p:cNvPr>`.
- [x] **Table cell hyperlinks** — `href` on TableCell options → `<a:hlinkClick>` in cell run properties.
- [x] **Text kerning** — `kerning` on TextRunOpts → `kern` attribute on `<a:rPr>`.
- [x] **Shape line join** — `lineJoin: "round" | "bevel" | "miter"` on LineOpts → join elements in `<a:ln>`.
- [x] **Shape text wrapping** — `wrap: "none" | "square"` on AddShapeOpts → `wrap` attribute on `<a:bodyPr>`.
- [x] **Presentation custom properties** — `pres.setCustomProperty(name, value)` → `docProps/custom.xml` with string/number/boolean types.

- [x] **Text run hyperlink to slide** — combine `href` and `slideLink` in a single run for tooltip + navigation.
- [x] **Slide timing** — `advanceAfter` on slide for auto-advance timing (kiosk mode).
- [x] **Table cell text rotation** — `textRotation` on TableCell options → `rot` on `<a:bodyPr>` for angled header text.
- [x] **Image blur effect** — `blur` on AddImageOpts → `<a:blur>` on blip for Gaussian blur.
- [x] **Group shape hyperlinks** — `href` on GroupShape → `<a:hlinkClick>` on `<p:cNvPr>` for clickable grouped elements.
- [x] **Slide section markers** — `pres.addSection(name)` → `<p14:sectionLst>` in presentation.xml for named slide sections.
- [x] **Multi-level numbered lists** — `numberType` on BulletOpts (`alphaLcPeriod`, `romanLcPeriod`, etc.) + `indentLevel` for nested outline-style lists.
- [x] **Shape compound lines** — `compound: "dbl" | "thickThin" | "thinThick" | "tri"` on LineOpts → `cmpd` attribute on `<a:ln>`.
- [x] **Table cell diagonal borders** — `diagonalDown`/`diagonalUp` on TableCell → `<a:lnTlToBr>`/`<a:lnBlToTr>` in `<a:tcPr>`.
- [x] **Image recolor** — `recolor: [shadow, highlight]` on AddImageOpts → `<a:duotone>` on blip.
- [x] **Presentation-wide slide transitions** — `pres.setTransition(opts)` applies default transition to all slides without one.
- [x] **Shape animation presets** — `animation: { type, trigger, duration, delay, direction }` on AddTextOpts/AddShapeOpts → `<p:timing>` with appear, fade, fly, wipe, zoom effects.
- [x] **Table header row styling** — `headerStyle` on AddTableOpts for separate header font/color/fill without manual cell options.
- [x] **Shape preset shadows** — `shapePresets.shadows.subtle()`, `.soft()`, `.medium()`, `.dramatic()`, `.contact()` named ShadowOpts presets.
- [x] **Image animation** — `animation` on AddImageOpts for entrance animations (appear, fade, fly, wipe, zoom).
- [x] **Shape tooltip on text** — `tooltip` on AddTextOpts → `<a:hlinkHover>` on `<p:cNvPr>` for hover text on text boxes.
- [x] **Slide notes export** — `deck.exportNotes()` extracts all speaker notes as markdown.
- [x] **Image tooltip** — `tooltip` on AddImageOpts → `<a:hlinkHover>` on image `<p:cNvPr>`.
- [x] **Freeform animation** — `animation` on AddFreeformOpts for entrance animations on custom paths.
- [x] **Shape text auto-fit** — `autoFit: true` on AddShapeOpts → `<a:spAutoFit/>` for auto-shrinking shape text.
- [x] **Text box hyperlink** — `href` on AddTextOpts → `<a:hlinkClick>` on text shape `<p:cNvPr>`.
- [x] **Shape text margin** — `textMargin` on AddShapeOpts → `lIns/tIns/rIns/bIns` on shape text `<a:bodyPr>`.
- [x] **Group animation** — `animation` setter on GroupShape for entrance animations on entire groups.
- [x] **Shape line gradient** — `gradient` on LineOpts → `<a:gradFill>` inside `<a:ln>` replaces solid fill.
- [x] **Shape text character spacing** — `charSpacing` on AddShapeOpts → `spc` on `<a:rPr>` in shape text.
- [x] **Table cell click action** — `action` on TableCell options → `ppaction://hlinkshowjump` for navigation.
- [x] **Animation sequencing** — `trigger: "afterPrevious" | "withPrevious"` on ShapeAnimationOpts merges into previous click step.
- [x] **Shape exit animations** — `exit: true` on ShapeAnimationOpts → `transition="out"` and `visibility: hidden`.
- [x] **Table minimum row height** — `minRowH` on AddTableOpts clamps row heights to a minimum bound.
- [x] **Shape text italic** — `italic` on AddShapeOpts → `i="1"` on shape text `<a:rPr>`.
- [x] **Shape text underline** — `underline` on AddShapeOpts → `u="sng"` on shape text `<a:rPr>`.
- [x] **Table cell text direction** — `textDirection` on TableCell options → `vert` attribute on `<a:tcPr>` with "btLr", "eaVert", "wordArtVert" flows.
- [x] **Image aspect ratio lock** — `lockAspectRatio` on AddImageOpts → controls `noChangeAspect` on `<a:picLocks>` (default true).
- [x] **Connector label background** — `labelFill` on ConnectorDef/ConnectorProps → `<a:solidFill>` on label text box.
- [x] **Table auto-height** — `addTable()` now returns `{ h: number }` with computed total height in inches.
- [x] **Shape text line spacing** — `lineSpacing` on AddShapeOpts → `<a:lnSpc><a:spcPct>` in shape text paragraph.
- [x] **Image opacity** — `opacity` on AddImageOpts → `<a:alphaModFix>` on blip for transparent images.
- [x] **Connector dash style** — `dashType` on ConnectorDef/ConnectorProps → `<a:prstDash>` on connector `<a:ln>`.
- [x] **Animation delay chaining** — `stagger` on ShapeAnimationOpts auto-calculates delays (delay = stagger * animIndex).
- [x] **Table cell background image** — `bgImage` on TableCell options → `<a:blipFill>` in `<a:tcPr>` for image fills.
- [x] **Shape text strikethrough** — `strike` on AddShapeOpts → `strike="sngStrike"` on shape text `<a:rPr>`.
- [x] **Shape text highlight** — `highlight` on AddShapeOpts → `<a:highlight>` on shape text `<a:rPr>`.
- [x] **Shape text paragraph spacing** — `paraSpaceBefore`/`paraSpaceAfter` on AddShapeOpts → `<a:spcBef>`/`<a:spcAft>` in shape text `<a:pPr>`.
- [x] **Table cell underline/strike** — `underline` and `strike` on TableCell options → `u="sng"` / `strike="sngStrike"` on cell text `<a:rPr>`.
- [x] **Connector label font size** — `labelSize` on ConnectorDef/ConnectorProps → custom `sz` on label `<a:rPr>` (default 14pt).
- [x] **Shape click to URL** — `href` + `tooltip` on AddShapeOpts already combines `<a:hlinkClick>` + `<a:hlinkHover>`.
- [x] **Connector label color** — `labelColor` on ConnectorDef/ConnectorProps → custom color on label `<a:rPr>` (defaults to line color).
- [x] **Shape text subscript/superscript** — `subscript`/`superscript` on AddShapeOpts → `baseline` attribute on `<a:rPr>`.
- [x] **Shape text kerning** — `kerning` on AddShapeOpts → `kern` attribute on `<a:rPr>`.
- [x] **Table column widths by ratio** — `colRatio` on AddTableOpts for proportional column sizing.
- [x] **Slide background tiled image** — `tile: true` on slide.background → `<a:tile>` instead of `<a:stretch>`.
- [x] **Table header background gradient** — `gradient` on AddTableOpts.headerStyle → `<a:gradFill>` on header row cells.
- [x] **Shape text caps** — `caps: "all" | "small"` on AddShapeOpts → `cap` attribute on shape text `<a:rPr>`.
- [x] **Shape text opacity** — `textOpacity` on AddShapeOpts → `<a:alpha>` on shape text color.
- [x] **Shape text gradient** — `textGradient` on AddShapeOpts → `<a:gradFill>` in shape text `<a:rPr>`.
- [x] **Table cell tooltip** — `tooltip` on TableCell options → `<a:hlinkHover>` on cell text `<a:rPr>`.
- [x] **Connector label alignment** — `labelAlign` on ConnectorDef/ConnectorProps → `algn` on label `<a:pPr>`.
- [x] **Slide background opacity** — `opacity` on slide.background → `<a:alpha>` on solid fill color.
- [x] **Shape text outline** — `textOutline` on AddShapeOpts → `<a:ln>` in shape text `<a:rPr>` for stroked text.
- [x] **Shape text shadow** — `textShadow` on AddShapeOpts → `<a:outerShdw>` for drop shadow on shape text.
- [x] **Shape text rotation** — `textRotation` on AddShapeOpts → `rot` on shape text `<a:bodyPr>`.
- [x] **Table border color theme** — `borderColor` on AddTableOpts → uniform borders on all cells.
- [x] **Table cell gradient text** — `textGradient` on TableCell → `<a:gradFill>` in cell text `<a:rPr>`.
- [x] **Image rounded corners** — `roundingRadius` on AddImageOpts → custom `adj` value on roundRect geometry.
- [x] **Connector weight presets** — `weight: "thin" | "medium" | "thick"` on ConnectorProps → resolves to 0.5/1.5/3pt.
- [x] **Shape text bullet lists** — `bullets: true` on AddShapeOpts → `<a:buChar>` or `<a:buAutoNum>` with newline-split paragraphs.
- [x] **Shape text word wrap** — `wordWrap: false` on AddShapeOpts → `wrap="none"` on `<a:bodyPr>`.
- [x] **Shape text vertical align override** — `textValign` on AddShapeOpts → separate anchor from shape valign.
- [x] **Connector curved control point** — `curvature` on ConnectorDef/ConnectorProps → adjustable arc bow amount in inches.
- [x] **Connector curved direction** — `curveDir: "left" | "right"` on ConnectorDef/ConnectorProps → controls which side the arc bows toward.
- [x] **Slide background blur** — `bgBlur` on slide.background → `<a:blur>` on background image blip.
- [x] **Shape rotation animation** — `spin` animation type with `spinAngle` → `<p:animRot>` for shape rotation.
- [x] **Animation path** — `path` animation type with `motionPath` → `<p:animMotion>` for motion along SVG paths.
- [x] **Table cell vertical align** — verified `valign` on TableCell works with textDirection, textGradient, and all new features.
- [x] **Font embedding** — `pres.embedFont(name, path)` / `pres.embedFontData(name, data)` → `ppt/fonts/*.fntdata` with OOXML relationships.
- [x] **Slide thumbnail** — `pres.setThumbnail(data)` → `docProps/thumbnail.jpeg` in the PPTX package.
- [x] **Table column span auto-width** — `autoColW` now distributes colspan text evenly across spanned columns.
- [x] **Animation repeat** — `repeat` on ShapeAnimationOpts (number or "indefinite") → `repeatCount` on `<p:cTn>`.
- [x] **Animation auto-reverse** — `autoReverse: true` on ShapeAnimationOpts → `autoRev="1"` on `<p:cTn>`.
- [x] **Table cell text shadow** — `textShadow` on TableCell → `<a:outerShdw>` on cell text `<a:rPr>`.
- [x] **Table cell text outline** — `textOutline` on TableCell → `<a:ln>` on cell text `<a:rPr>`.
- [x] **Shape text tab stops** — `tabStops` on AddShapeOpts → `<a:tabLst>` in paragraph properties.
- [x] **Animation scale** — `scale` animation type with `scalePercent` → `<p:animScale>` for grow/shrink effects.
- [x] **Animation color change** — `colorChange` animation type with `fromColor`/`toColor` → `<p:animClr>` for color transitions.
- [x] **Table cell caps** — `caps: "all" | "small"` on TableCell → `cap` attribute on cell text `<a:rPr>`.
- [x] **Shape text indent** — `indent` on AddShapeOpts → `indent` attribute on `<a:pPr>` for first-line indent.
- [x] **Shape text margin left** — `marginLeft` on AddShapeOpts → `marL` attribute on `<a:pPr>` for paragraph left margin.
- [x] **Image flip** — `flipH`/`flipV` on AddImageOpts → flip attributes on `<a:xfrm>` for mirrored images.
- [x] **Table cell line spacing** — `lineSpacing` on TableCell → `<a:lnSpc><a:spcPct>` in cell paragraph properties.
- [x] **Table cell char spacing** — `charSpacing` on TableCell → `spc` attribute on cell text `<a:rPr>`.
- [x] **Presentation show properties** — `pres.setShowProperties({ loop, useTimings })` → `<p:showPr>` for kiosk/looping mode.
- [x] **Table cell indent** — `indent`/`marginLeft` on TableCell → `indent`/`marL` attributes on cell `<a:pPr>`.
- [x] **Image hue/saturation** — `hue`/`saturation` on AddImageOpts → `<a:hsl>` on blip for color adjustment.
- [x] **Shape text vertical direction** — `vertical` on AddShapeOpts → `vert` attribute on shape text `<a:bodyPr>`.
- [x] **Table cell kerning** — `kerning` on TableCell → `kern` attribute on cell text `<a:rPr>`.
- [x] **Shape text transform** — `textTransform` on AddShapeOpts → `<a:prstTxWarp>` in shape text `<a:bodyPr>`.
- [x] **Shape text fit shrink** — `fit: "shrink" | { minFontScale }` on AddShapeOpts → `<a:normAutofit>` for auto-shrinking shape text.
- [x] **Table cell superscript/subscript** — `superscript`/`subscript` on TableCell → `baseline` attribute on cell text `<a:rPr>`.
- [x] **Image tint** — `tint` on AddImageOpts → `<a:tint>` on blip for tint adjustment.
- [x] **Group shape rotation** — `rotate` setter on GroupShape → `rot` attribute on group `<a:xfrm>`.
- [x] **Table cell nowrap** — `nowrap: true` on TableCell → `wrap="none"` on cell text `<a:bodyPr>`.
- [x] **Table cell pattern fill** — `patternFill` on TableCell → `<a:pattFill>` in `<a:tcPr>`.
- [x] **Table cell fill opacity** — `fillOpacity` on TableCell → `<a:alpha>` on solid fill color.
- [x] **Shape text glow** — `textGlow` on AddShapeOpts → `<a:glow>` in shape text `<a:effectLst>`.
- [x] **Image color replace** — `colorReplace` on AddImageOpts → `<a:clrRepl>` on blip for monochrome recoloring.
- [x] **Image biLevel** — `biLevel` on AddImageOpts → `<a:biLevel>` on blip for black/white threshold conversion.
- [x] **Table cell text glow** — `textGlow` on TableCell → `<a:glow>` in cell text `<a:effectLst>`.
- [x] **Shape text reflection** — `textReflection` on AddShapeOpts → `<a:reflection>` in shape text `<a:effectLst>`.
- [x] **Table cell text reflection** — `textReflection` on TableCell → `<a:reflection>` in cell text `<a:effectLst>`.
- [x] **Shape text inner shadow** — `textInnerShadow` on AddShapeOpts → `<a:innerShdw>` in shape text `<a:effectLst>`.
- [x] **Table cell inner shadow** — `textInnerShadow` on TableCell → `<a:innerShdw>` in cell text `<a:effectLst>`.
- [x] **Shape text soft edge** — `textSoftEdge` on AddShapeOpts → `<a:softEdge>` in shape text `<a:effectLst>`.
- [x] **Image alpha ceiling** — `alphaCeiling` on AddImageOpts → `<a:alphaCeiling/>` on blip.

## Open

### High impact
- [ ] **Chart component** — bar/line/pie charts via OOXML chart parts, or fallback to rendered SVG images.
- [ ] **Video/audio embedding** — embed media files in slides via OOXML media parts.
- [ ] **Master slide customization** — allow themes to define custom slide masters with placeholder layouts.
- [ ] **Enrich API docs with examples** — Mintlify docs have reference tables but sparse code samples.

### Medium impact
- [ ] **Placeholder-based text** — use OOXML placeholder types (`title`, `body`) for better theme compatibility.
- [ ] **SmartArt** — basic SmartArt generation for org charts and process flows.
- [x] **Font embedding** — embed custom fonts in the PPTX for portability.
- [ ] **Slide master backgrounds** — allow themes to define reusable slide masters with custom backgrounds/logos.
- [ ] **Ink annotations** — `slide.addInk()` for freehand drawing paths via `<p:inkPen>`.
- [ ] **OLE embedding** — `slide.addOleObject()` for embedding Excel/PDF objects as icons or inline frames.
- [ ] **Slide layout templates** — `pres.addLayout(name, { placeholders })` for custom slide layouts in slideMasters.

### New proposals
- [ ] **Treemap / heatmap component** — `treemap(slide, { data, ... })` for data visualization using nested colored rects.
- [ ] **Icon library component** — `icon(slide, { name, ... })` expand beyond Lucide to Material Symbols / Phosphor icons.
- [ ] **Table header freeze** — `freezeHeader: true` on AddTableOpts to lock first row in PowerPoint table view.
- [ ] **Image placeholder** — lazy image loading with `placeholder: true` for decks where images are resolved later.
- [ ] **Table sorting indicator** — visual sort arrows on header cells for data table presentations.
- [ ] **Slide background audio** — `bgAudio` on slide for looping background sound.
- [ ] **Shape connection points** — custom `cxnPts` on shapes for additional connector attachment positions.
- [ ] **Text fit with line count** — `maxLines` on AddTextOpts to limit text to N lines with overflow ellipsis.
- [ ] **Shape arrow keys navigation** — `tabOrder` on shapes for keyboard navigation order.
- [ ] **Slide master footer placeholders** — wire `<p:ph type="ftr"/>`, `<p:ph type="sldNum"/>`, `<p:ph type="dt"/>` on slide masters for native footer rendering.
- [x] **Table minimum row height** — `minRowH` on AddTableOpts for dynamic row heights with a minimum bound.
- [ ] **Slide background gradient mesh** — multi-point gradient fills on slide backgrounds.
- [x] **Shape rotation animation** — `spin` animation preset for shape rotation via `<p:animRot>`.
- [x] **Image animation** — `animation` on AddImageOpts for entrance animations on images.
- [x] **Shape exit animations** — `exit: true` on ShapeAnimationOpts for disappear/fadeOut effects.
- [x] **Animation sequencing** — `trigger: "afterPrevious"/"withPrevious"` on ShapeAnimationOpts.
- [x] **Table cell background image** — `bgImage` on TableCell options for image fills in cells.
- [ ] **Presentation password protection** — `pres.protect({ password })` for basic file encryption.
- [x] **Slide notes export** — `deck.exportNotes()` to extract all speaker notes as markdown.
- [x] **Shape tooltip on text** — `tooltip` on AddTextOpts for hover text on text boxes.
- [x] **Image tooltip** — `tooltip` on AddImageOpts for hover text on images.
- [x] **Freeform animation** — `animation` on AddFreeformOpts for entrance animations on custom paths.
- [x] **Table cell click action** — `action` on TableCell options for built-in PowerPoint navigation actions.
- [x] **Shape text auto-fit** — `autoFit: true` on AddShapeOpts to auto-size text within shapes.
- [x] **Group animation** — `animation` on GroupShape for entrance animations on entire groups.
- [x] **Text box hyperlink** — `href` on AddTextOpts to make the entire text box clickable.
- [x] **Shape text margin** — `textMargin` on AddShapeOpts for custom padding around text inside shapes.
- [x] **Image aspect ratio lock** — `lockAspectRatio` on AddImageOpts controls `noChangeAspect` (default true).
- [x] **Shape line gradient** — gradient fills on shape lines via `<a:gradFill>` inside `<a:ln>`.
- [x] **Text character spacing** — `charSpacing` on AddShapeOpts for letter-spacing in shape text.
- [x] **Table cell rotation with direction** — `textDirection: "btLr" | "vert"` on TableCell for complex text flows.
- [x] **Shape text italic** — `italic` on AddShapeOpts for italic text in shapes.
- [x] **Shape text underline** — `underline` on AddShapeOpts for underlined text in shapes.
- [x] **Table auto-height** — `addTable()` returns `{ h: number }` with computed total height.
- [x] **Connector labels with background** — `labelFill` on ConnectorProps for label background box.
- [x] **Shape click to URL** — `href` on AddShapeOpts combined with `tooltip` for URL + hover text.
- [ ] **Slide background video** — `bgVideo` on slide for looping background video.
- [x] **Animation delay chaining** — `stagger` on ShapeAnimationOpts auto-calculates delays.
- [x] **Shape text vertical align override** — `textValign` on AddShapeOpts separate from shape valign for fine control.
- [x] **Table cell background image** — `bgImage` on TableCell options for image fills via `<a:blipFill>` in `<a:tcPr>`.
- [x] **Shape text line spacing** — `lineSpacing` on AddShapeOpts for controlling line height in shape text.
- [x] **Image opacity** — `opacity` on AddImageOpts → `<a:alphaModFix>` on blip fill for transparent images.
- [x] **Table column span auto-width** — auto-adjust column widths when cells have colspan > 1.
- [x] **Shape text bullet lists** — `bullets: true` on AddShapeOpts to turn shape text into bulleted list.
- [x] **Connector dash style** — `dashType` on ConnectorDef for dashed/dotted connector lines.
- [x] **Slide background opacity** — `opacity` on slide.background for semi-transparent fills over master.
- [x] **Shape text paragraph spacing** — `paraSpaceBefore`/`paraSpaceAfter` on AddShapeOpts for paragraph-level spacing in shape text.
- [ ] ~~**Image SVG support**~~ — removed; sync addImage API incompatible with async sharp conversion.
- [x] **Table cell underline text** — `underline` on TableCell options for underlined cell text.
- [x] **Shape text highlight** — `highlight` on AddShapeOpts for background highlight color on shape text runs.
- [x] **Connector label font size** — `labelSize` on ConnectorDef for custom label font size.
- [x] **Slide background tiled image** — `tile` on slide.background for repeating background patterns.
- [x] **Shape text strikethrough** — `strike` on AddShapeOpts for strikethrough text in shapes.
- [x] **Animation path** — custom motion path animations via `<p:animMotion>` for shape movement along SVG paths.
- [x] **Shape text gradient** — `textGradient` on AddShapeOpts for gradient-filled shape text via `<a:gradFill>` in rPr.
- [x] **Table column widths by ratio** — `colRatio: [1, 2, 1]` on AddTableOpts for proportional column sizing.
- [x] **Connector label color** — `labelColor` on ConnectorDef for custom label text color (separate from line color).
- [x] **Shape text subscript/superscript** — `subscript`/`superscript` on AddShapeOpts for baseline shifts in shape text.
- [ ] **Image caption component** — `imageWithCaption(slide, { ... })` combining image + styled caption as a group.
- [x] **Slide thumbnail** — `pres.setThumbnail(data)` to set a custom thumbnail image for the presentation.
- [x] **Shape text kerning** — `kerning` on AddShapeOpts for kerning threshold in shape text.
- [x] **Table header background gradient** — `gradient` on AddTableOpts.headerStyle for gradient fills on header row.
- [x] **Shape text caps** — `caps: "all" | "small"` on AddShapeOpts for all-caps or small-caps in shape text.
- [x] **Table cell gradient text** — `textGradient` on TableCell options for gradient-filled text in cells.
- [x] **Connector curved control point** — `curvature` on ConnectorDef for adjustable bezier curve tightness.
- [x] **Shape text opacity** — `textOpacity` on AddShapeOpts for transparent text in shapes.
- [x] **Table cell tooltip** — `tooltip` on TableCell for hover text on table cells.
- [x] **Slide background blur** — `bgBlur` on slide.background for blurred background images.
- [x] **Shape text word wrap** — `wordWrap: false` on AddShapeOpts to disable word wrapping in shape text.
- [x] **Connector label alignment** — `labelAlign` on ConnectorDef for left/center/right label positioning.
- [x] **Shape text outline** — `textOutline` on AddShapeOpts for stroked text in shapes via `<a:ln>` in rPr.
- [x] **Table cell vertical align** — verified `valign` on TableCell works with all new features.
- [x] **Connector curved direction** — `curveDir: "left" | "right"` on ConnectorDef for controlling curve direction.
- [x] **Shape text shadow** — `textShadow` on AddShapeOpts for drop shadow on shape text.
- [x] **Table cell superscript/subscript** — `superscript`/`subscript` on TableCell for baseline shifts in cell text.
- [x] **Image colorize tint** — `tint` on AddImageOpts for image tint adjustment via `<a:tint>`.
- [x] **Group shape rotation** — `rotate` on GroupShape for rotating entire groups.
- [ ] **Shape text font size auto** — `fontSizeAuto: true` on AddShapeOpts to auto-calculate font size from shape height.
- [ ] **Slide master logo** — `pres.setLogo(data, position)` to overlay a logo on all slides.
- [x] **Table cell nowrap** — `nowrap: true` on TableCell to prevent word wrap in narrow cells.
- [ ] **Shape text URL auto-detect** — auto-hyperlink `http://...` in shape text.
- [ ] **Connector elbow routing** — `elbowRoute: "auto"` on ConnectorDef for intelligent elbow connector routing around obstacles.
- [x] **Table border color theme** — `borderColor` on AddTableOpts for uniform border color on entire table.
- [x] **Image rounded corners** — `roundingRadius` on AddImageOpts for custom corner rounding amount.
- [x] **Shape text rotation** — `textRotation` on AddShapeOpts for rotated text inside shapes.
- [x] **Connector weight presets** — `weight: "thin" | "medium" | "thick"` on ConnectorProps for common line weights.
