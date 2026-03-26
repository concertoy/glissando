/**
 * Pre-designed components for the Claude doc theme.
 *
 * Components are created via a factory that receives the runtime ThemeConfig,
 * so they respect font presets and config overrides.
 */

import type PptxGenJS from "pptxgenjs";
import type {
  ThemeConfig,
  ThemeComponents,
  ComponentFactory,
  AccentBarProps,
  HeadingProps,
  BodyTextProps,
  BulletListProps,
  NumberedListProps,
  CodeBlockProps,
  QuoteBoxProps,
  TableProps,
  CaptionProps,
  CalloutBlockProps,
  CalloutVariant,
  TextBlockProps,
  DiagramBoxProps,
  ShapeRef,
  ArrowProps,
  HookArrowProps,
  ContainerProps,
  EquationProps,
  EmojiProps,
  EmojiDef,
  PendingWork,
} from "../../types.js";
import { highlightCode } from "../../highlight.js";
import { lucideIcon } from "../../icons.js";
import { renderEquation } from "../../equation.js";
import { renderEmoji, extractLeadingEmoji } from "../../emoji.js";

export const createComponents: ComponentFactory = (cfg: ThemeConfig, emojiDefs?: EmojiDef[], pending?: PendingWork): ThemeComponents => {
  const { colors: c, fonts: f, sizes: s } = cfg;

  // --- Accent bar ---
  function accentBar(slide: PptxGenJS.Slide, props: AccentBarProps): void {
    slide.addShape("rect", {
      x: props.x, y: props.y,
      w: props.w ?? 2, h: props.h ?? 0.04,
      fill: { color: c.accent },
      line: { color: c.accent, width: 0.5 },
    });
  }

  // --- Heading ---
  function heading(slide: PptxGenJS.Slide, props: HeadingProps): void {
    slide.addText(props.text, {
      x: props.x, y: props.y, w: props.w, h: 0.7,
      fontSize: props.fontSize ?? s.heading,
      fontFace: f.heading,
      color: props.color ?? c.text,
      bold: props.bold ?? true,
      valign: "bottom",
    });
  }

  // --- Body text ---
  // Supports leading :emoji: — e.g. ":rocket: Launch the product"
  // Emoji is placed as an image before the text, text is shifted right.
  function bodyText(slide: PptxGenJS.Slide, props: BodyTextProps): void {
    const leading = cfg.emojiSet ? extractLeadingEmoji(props.text) : null;

    if (leading) {
      const fontSize = props.fontSize ?? s.body;
      const emojiSize = (fontSize / 72) * 1.4;  // emoji at ~1.4x cap height
      const gap = 0.08;  // gap between emoji and text

      // Render emoji image at original x position
      const emojiPromise = renderEmoji(leading.emoji, cfg.emojiSet).then((data) => {
        slide.addImage({
          data,
          x: props.x,
          y: props.y,
          w: emojiSize,
          h: emojiSize,
        });
      });
      if (pending) pending.promises.push(emojiPromise);

      // Shift text to the right
      slide.addText(leading.rest, {
        x: props.x + emojiSize + gap,
        y: props.y,
        w: props.w - emojiSize - gap,
        h: props.h ?? 0.5,
        fontSize,
        fontFace: props.fontFace ?? f.sans,
        color: props.color ?? c.textSecondary,
        bold: props.bold ?? false,
        italic: props.italic ?? false,
        valign: "top",
      });
    } else {
      slide.addText(props.text, {
        x: props.x, y: props.y, w: props.w, h: props.h ?? 0.5,
        fontSize: props.fontSize ?? s.body,
        fontFace: props.fontFace ?? f.sans,
        color: props.color ?? c.textSecondary,
        bold: props.bold ?? false,
        italic: props.italic ?? false,
        valign: "top",
      });
    }
  }

  // --- Bullet list ---
  // Supports :emoji: prefix on items — e.g. ":rocket: Launch the product"
  // Emoji prefixes replace the standard bullet marker via OOXML post-processing.

  let bulletListCounter = 0;

  function bulletList(slide: PptxGenJS.Slide, props: BulletListProps): void {
    const fontSize = props.fontSize ?? s.body;

    // Check for emoji-prefixed items
    const emojiIndices: number[] = [];
    const emojiPngs: Promise<string>[] = [];
    const processedItems = props.items.map((item, i) => {
      const leading = extractLeadingEmoji(item);
      if (leading && cfg.emojiSet) {
        emojiIndices.push(i);
        emojiPngs.push(renderEmoji(leading.emoji, cfg.emojiSet));
        return leading.rest;
      }
      return item;
    });

    const hasEmojiBullets = emojiIndices.length > 0;
    const objName = hasEmojiBullets ? `bl-${bulletListCounter++}` : undefined;

    const textRows: PptxGenJS.TextProps[] = processedItems.map((item) => ({
      text: item,
      options: {
        fontSize,
        fontFace: f.sans,
        color: c.textSecondary,
        bullet: { type: "bullet", color: c.accent },
        paraSpaceAfter: 8,
        indentLevel: 0,
      },
    }));
    slide.addText(textRows, {
      x: props.x, y: props.y, w: props.w, h: props.h ?? 4.5,
      valign: "top",
      lineSpacingMultiple: 1.2,
      objectName: objName,
    });

    // Queue emoji bullet defs for OOXML post-processing
    if (hasEmojiBullets && emojiDefs && objName) {
      const emojiPromise = Promise.all(emojiPngs).then((pngs) => {
        emojiDefs.push({
          slideIndex: -1,  // resolved per-slide in post-processing (searches all slides)
          objectName: objName,
          bulletIndices: emojiIndices,
          emojiPngs: pngs,
        });
      });
      if (pending) pending.promises.push(emojiPromise);
    }
  }

  // --- Numbered list ---
  function numberedList(slide: PptxGenJS.Slide, props: NumberedListProps): void {
    const fontSize = props.fontSize ?? s.body;
    const textRows: PptxGenJS.TextProps[] = props.items.map((item) => ({
      text: item,
      options: {
        fontSize,
        fontFace: f.sans,
        color: c.textSecondary,
        bullet: { type: "number", color: c.accent },
        paraSpaceAfter: 8,
      },
    }));
    slide.addText(textRows, {
      x: props.x, y: props.y, w: props.w, h: props.h ?? 4.5,
      valign: "top",
      lineSpacingMultiple: 1.2,
    });
  }

  // --- Code block (with syntax highlighting) ---
  //
  // 4 separate shapes, grouped in post-processing:
  //   1. bg:    rounded rect background (no text)
  //   2. label: "python" text box (top-right, above rule)
  //   3. rule:  horizontal line at fixed RULE_Y from top
  //   4. code:  text box with syntax-highlighted code (below rule)
  //
  //  ┌──────────────────────────── python ─┐  bg shape
  //  ├─────────────────────────────────────┤  rule at RULE_Y = 0.32"
  //  │  def greet(name: str) -> str:       │  code text box
  //  │      return f"Hello, {name}!"       │
  //  │  print(greet("world"))              │
  //  └─────────────────────────────────────┘

  let codeBlockCounter = 0;

  function codeBlock(slide: PptxGenJS.Slide, props: CodeBlockProps): void {
    const cs = cfg.codeStyle;
    const lang = props.language ?? "";
    const gid = lang ? codeBlockCounter++ : -1;

    // Fixed geometry
    const RULE_Y = 0.32;    // inches from top edge to midrule (fixed)
    const CODE_Y = 0.40;    // inches from top edge to code text start
    const LABEL_Y = 0.06;   // inches from top edge to label
    const SIDE_PAD = 0.25;  // inches
    const BOT_PAD = 0.35;   // inches below last code line

    // Auto-height: font line height = (pt / 72) * font_internal_ratio * lineSpacingMultiple
    // Monospace fonts (JetBrains Mono, Menlo) have an internal line ratio of ~1.2
    const FONT_LINE_RATIO = 1.2;
    const LINE_SPACING = 1.4; // must match lineSpacingMultiple on the code text box
    const lineHeightIn = (s.code / 72) * FONT_LINE_RATIO * LINE_SPACING;

    // Calculate max lines that fit in available space
    const HARD_MAX = 15;
    const fitMax = props.h
      ? Math.floor((props.h - CODE_Y - BOT_PAD) / lineHeightIn)
      : HARD_MAX;
    const maxLines = Math.max(1, Math.min(HARD_MAX, fitMax));

    const allLines = props.code.split("\n");
    const truncated = allLines.length > maxLines
      ? [...allLines.slice(0, maxLines), "// ..."].join("\n")
      : props.code;
    const lineCount = Math.min(allLines.length, maxLines + 1);
    const autoH = CODE_Y + lineCount * lineHeightIn + BOT_PAD;
    const h = props.h ? Math.min(props.h, autoH) : autoH;

    // Shape 1: background rounded rect (no text)
    slide.addShape("roundRect", {
      x: props.x, y: props.y, w: props.w, h,
      fill: { color: cs.bg },
      rectRadius: cs.borderRadius ?? 0.15,
      line: cs.border
        ? { color: cs.border, width: 1 }
        : { color: cs.bg, width: 0.5 },
      objectName: lang ? `cb-${gid}-bg` : undefined,
    } as any);

    if (lang) {
      // Shape 2: language label (top-right, above rule)
      slide.addText(lang, {
        x: props.x + props.w - 1.5,
        y: props.y + LABEL_Y,
        w: 1.3,
        h: RULE_Y - LABEL_Y,
        fontSize: s.small - 2,
        fontFace: f.mono,
        color: cs.label,
        align: "right",
        valign: "middle",
        objectName: `cb-${gid}-label`,
      });

      // Shape 3: midrule (fixed distance from top)
      slide.addShape("line", {
        x: props.x,
        y: props.y + RULE_Y,
        w: props.w,
        h: 0,
        line: { color: cs.border ?? cs.text, width: 0.75 },
        objectName: `cb-${gid}-rule`,
      } as any);

      // Shape 4: syntax-highlighted code text (below rule)
      const hlLines = highlightCode(truncated, lang, cs);
      const textRows: PptxGenJS.TextProps[] = [];
      for (let li = 0; li < hlLines.length; li++) {
        const tokens = hlLines[li];
        for (let ti = 0; ti < tokens.length; ti++) {
          const isLastToken = ti === tokens.length - 1;
          textRows.push({
            text: tokens[ti].text,
            options: {
              fontSize: s.code,
              fontFace: f.mono,
              color: tokens[ti].color,
              breakLine: isLastToken ? true : undefined,
            },
          });
        }
      }
      slide.addText(textRows, {
        x: props.x + SIDE_PAD,
        y: props.y + CODE_Y,
        w: props.w - SIDE_PAD * 2,
        h: h - CODE_Y - 0.1,
        valign: "top",
        lineSpacingMultiple: 1.4,
        objectName: `cb-${gid}-code`,
      });
    } else {
      // No language — code text built into the rounded rect
      slide.addText(truncated, {
        x: props.x, y: props.y, w: props.w, h,
        shape: "roundRect" as any,
        fill: { color: cs.bg },
        rectRadius: cs.borderRadius ?? 0.15,
        line: cs.border
          ? { color: cs.border, width: 1 }
          : { color: cs.bg, width: 0.5 },
        fontSize: s.code,
        fontFace: f.mono,
        color: cs.text,
        valign: "top",
        lineSpacingMultiple: 1.4,
        margin: [18, 22, 10, 22],
      });
    }
  }

  // --- Quote box ---
  function quoteBox(slide: PptxGenJS.Slide, props: QuoteBoxProps): void {
    slide.addShape("rect", {
      x: props.x, y: props.y, w: 0.06, h: props.h,
      fill: { color: c.accent },
      line: { color: c.accent, width: 0.5 },
    });
    slide.addText("\u201C", {
      x: props.x + 0.25, y: props.y - 0.2, w: 0.6, h: 0.8,
      fontSize: 60, fontFace: f.serif, color: c.accent, bold: true,
    });
    slide.addText(props.quote, {
      x: props.x + 0.3, y: props.y + 0.5,
      w: props.w - 0.5, h: props.h - 1.2,
      fontSize: 22, fontFace: f.serif, color: c.text,
      italic: true, valign: "top", lineSpacingMultiple: 1.5,
    });
    if (props.attribution) {
      slide.addText(`— ${props.attribution}`, {
        x: props.x + 0.3, y: props.y + props.h - 0.6,
        w: props.w - 0.5, h: 0.4,
        fontSize: s.body, fontFace: f.sans, color: c.textMuted,
        valign: "bottom",
      });
    }
  }

  // --- Table ---
  function table(slide: PptxGenJS.Slide, props: TableProps): void {
    const headerRow: PptxGenJS.TableCell[] = props.headers.map((h) => ({
      text: h,
      options: {
        fontSize: s.small, fontFace: f.sans, color: c.text, bold: true,
        fill: { color: c.bgAccent },
        border: [
          { type: "none" }, { type: "none" },
          { pt: 1.5, color: c.accent }, { type: "none" },
        ],
        valign: "middle" as const, paraSpaceBefore: 4, paraSpaceAfter: 4,
      },
    }));
    const dataRows: PptxGenJS.TableCell[][] = props.rows.map((row) =>
      row.map((cell) => ({
        text: cell,
        options: {
          fontSize: s.small, fontFace: f.sans, color: c.textSecondary,
          border: [
            { type: "none" }, { type: "none" },
            { pt: 0.5, color: "E5E3DB" }, { type: "none" },
          ],
          valign: "middle" as const, paraSpaceBefore: 3, paraSpaceAfter: 3,
        },
      }))
    );
    slide.addTable([headerRow, ...dataRows], {
      x: props.x, y: props.y, w: props.w,
      colW: Array(props.headers.length).fill(props.w / props.headers.length),
    });
  }

  // --- Caption ---
  function caption(slide: PptxGenJS.Slide, props: CaptionProps): void {
    slide.addText(props.text, {
      x: props.x, y: props.y, w: props.w, h: 0.35,
      fontSize: s.caption, fontFace: f.sans, color: c.textMuted,
      italic: true, align: "center",
    });
  }

  // --- Callout block — round-cornered panels (card, info, warning, accent, code) ---

  const calloutStyles: Record<CalloutVariant, {
    bg: string; border: string; textColor: string; iconName: string;
  }> = {
    card:    { bg: "FFFFFF",  border: "B8B8B8", textColor: c.textSecondary, iconName: "pencil" },
    code:    { bg: "F5F3EF",  border: "C9C4B8", textColor: c.textSecondary, iconName: "lightbulb" },
    info:    { bg: "EEF1FA",  border: "9BADD4", textColor: "9BADD4",       iconName: "info" },
    warning: { bg: "FDF5EB",  border: "D4B57A", textColor: "D4B57A",       iconName: "triangleAlert" },
    accent:  { bg: "FAF0EB",  border: "C9A08E", textColor: c.textSecondary, iconName: "circleCheck" },
    success: { bg: "ECFAF0",  border: "7BBF96", textColor: "7BBF96",       iconName: "circleCheck" },
  };

  let calloutCounter = 0;

  async function calloutBlock(slide: PptxGenJS.Slide, props: CalloutBlockProps): Promise<void> {
    const style = calloutStyles[props.variant];
    const gid = calloutCounter++;

    // Calculate auto-height from content
    const bodyLineH = (s.small / 72) * 1.5;
    let contentLines = 0;
    if (props.body) contentLines += Math.ceil(props.body.length / 50);
    if (props.bullets) contentLines += props.bullets.length;
    const padding = 0.5;
    const autoH = contentLines * bodyLineH + padding;
    const h = props.h ?? Math.max(autoH, 0.7);

    // Icon geometry (inches)
    const iconPadLeft = 0.2;
    const iconSize = 0.28;
    const iconTextGap = 0.12;
    // Left margin in points to clear the icon
    const iconInset = Math.round((iconPadLeft + iconSize + iconTextGap) * 72); // ~43pt
    const topPad = 14; // points

    // NOTE: pptxgenjs addText margin array order is [left, right, bottom, top]
    // (despite docs claiming CSS order). See pptxgen.cjs.js lines 5386-5389.
    const margin: [number, number, number, number] = [iconInset, 14, 14, topPad];

    // Shape: rounded rect with text built-in
    if (props.body) {
      slide.addText(props.body, {
        x: props.x, y: props.y, w: props.w, h,
        shape: "roundRect" as any,
        fill: { color: style.bg },
        rectRadius: 0.08,
        line: { color: style.border, width: 1 },
        fontSize: s.small, fontFace: f.sans,
        color: style.textColor,
        valign: "top",
        lineSpacingMultiple: 1.4,
        margin,
        objectName: `co-${gid}-bg`,
      });
    } else if (props.bullets) {
      const rows: PptxGenJS.TextProps[] = props.bullets.map((item) => ({
        text: item,
        options: {
          fontSize: s.small, fontFace: f.sans,
          color: style.textColor,
          bullet: { type: "bullet", color: style.border },
          paraSpaceAfter: 4,
        },
      }));
      slide.addText(rows, {
        x: props.x, y: props.y, w: props.w, h,
        shape: "roundRect" as any,
        fill: { color: style.bg },
        rectRadius: 0.08,
        line: { color: style.border, width: 1 },
        valign: "top",
        lineSpacingMultiple: 1.2,
        margin,
        objectName: `co-${gid}-bg`,
      });
    }

    // Lucide PNG icon — vertically centered on the first text line
    const textTopInches = topPad / 72;
    const lineH = (s.small / 72) * 1.4; // matches lineSpacingMultiple
    const iconY = props.y + textTopInches + (lineH - iconSize) / 2;
    const iconData = await lucideIcon(style.iconName, style.border, 96);
    slide.addImage({
      data: iconData,
      x: props.x + iconPadLeft, y: iconY,
      w: iconSize, h: iconSize,
      objectName: `co-${gid}-icon`,
    } as any);
  }

  // --- Text block — icon-free rounded panel with optional title/subtitle ---

  function textBlock(slide: PptxGenJS.Slide, props: TextBlockProps): void {
    const fillColor = props.fill ?? c.bgCard;
    const borderColor = props.border ?? c.textMuted;
    const bodyColor = props.textColor ?? c.text;
    const pad = 14; // points, uniform on all sides
    const margin: [number, number, number, number] = [pad, pad, pad, pad];

    // Build text rows top-to-bottom: title, subtitle, then body/bullets
    const rows: PptxGenJS.TextProps[] = [];

    if (props.title) {
      rows.push({
        text: props.title,
        options: {
          fontSize: s.body, fontFace: f.sans, color: c.text,
          bold: true, paraSpaceAfter: props.subtitle ? 2 : 6,
        },
      });
    }

    if (props.subtitle) {
      rows.push({
        text: props.subtitle,
        options: {
          fontSize: s.small, fontFace: f.sans, color: c.textMuted,
          paraSpaceAfter: 6,
        },
      });
    }

    if (props.body) {
      rows.push({
        text: props.body,
        options: {
          fontSize: s.small, fontFace: f.sans, color: bodyColor,
          lineSpacingMultiple: 1.4,
        },
      });
    }

    if (props.bullets) {
      for (const item of props.bullets) {
        rows.push({
          text: item,
          options: {
            fontSize: s.small, fontFace: f.sans, color: bodyColor,
            bullet: { type: "bullet", color: borderColor } as any,
            paraSpaceAfter: 4,
          },
        });
      }
    }

    // Auto-height: estimate from content
    const titleH = props.title ? (s.body / 72) * 1.4 : 0;
    const subtitleH = props.subtitle ? (s.small / 72) * 1.4 : 0;
    const bodyLineH = (s.small / 72) * 1.5;
    let contentLines = 0;
    if (props.body) contentLines += Math.ceil(props.body.length / 55);
    if (props.bullets) contentLines += props.bullets.length;
    const autoH = titleH + subtitleH + contentLines * bodyLineH + 0.45;
    const h = props.h ?? Math.max(autoH, 0.6);

    slide.addText(rows, {
      x: props.x, y: props.y, w: props.w, h,
      shape: "roundRect" as any,
      fill: { color: fillColor },
      rectRadius: 0.08,
      line: { color: borderColor, width: 1 },
      valign: "top",
      margin,
    });
  }

  // =========================================================================
  // DIAGRAM COMPONENTS
  // =========================================================================

  const defaultArrowColor = c.textMuted;
  let shapeCounter = 0;

  function makeShapeRef(name: string, x: number, y: number, w: number, h: number): ShapeRef {
    return {
      top:    { x: x + w / 2, y,         idx: 0, _shapeName: name },
      right:  { x: x + w,     y: y + h / 2, idx: 1, _shapeName: name },
      bottom: { x: x + w / 2, y: y + h,     idx: 2, _shapeName: name },
      left:   { x,            y: y + h / 2, idx: 3, _shapeName: name },
    };
  }

  // --- Diagram box — round-cornered labeled rectangle (single object, text built-in) ---
  function diagramBox(slide: PptxGenJS.Slide, props: DiagramBoxProps): ShapeRef {
    const name = `diag-box-${shapeCounter++}`;
    slide.addText(props.text, {
      x: props.x, y: props.y, w: props.w, h: props.h,
      shape: "roundRect" as any,
      fill: { color: props.fill ?? c.bgCard },
      rectRadius: 0.06,
      line: {
        color: props.border ?? c.textMuted,
        width: props.borderWidth ?? 1,
      },
      fontSize: props.fontSize ?? s.body,
      fontFace: f.heading,
      color: props.textColor ?? c.text,
      bold: props.bold ?? true,
      align: "center",
      valign: "middle",
      margin: 0,
      objectName: name,
    });
    return makeShapeRef(name, props.x, props.y, props.w, props.h);
  }

  // --- Straight arrow with optional arrowheads ---
  function arrow(slide: PptxGenJS.Slide, props: ArrowProps): void {
    const color = props.color ?? defaultArrowColor;
    const w = props.to.x - props.from.x;
    const h = props.to.y - props.from.y;

    slide.addShape("line", {
      x: props.from.x,
      y: props.from.y,
      w: w,
      h: h,
      line: {
        color,
        width: props.width ?? 1,
        dashType: props.dashed ? "dash" : "solid",
      },
      // pptxgenjs: lineHead = start point, lineTail = end point
      // our API: head = arrowhead at destination, tail = arrowhead at source
      lineHead: props.tail ?? "none",
      lineTail: props.head ?? "arrow",
    });
  }

  // --- Hook arrow (L-shaped connector with right-angle bend) ---
  function hookArrow(slide: PptxGenJS.Slide, props: HookArrowProps): void {
    const color = props.color ?? defaultArrowColor;
    const lineWidth = props.width ?? 1;
    const dashType = props.dashed ? "dash" : "solid";
    const head = props.head ?? "arrow";
    const tail = props.tail ?? "none";

    // Calculate the midpoint where the bend occurs.
    // For directions like "right-up" where from.x == to.x, add a 0.4" offset
    // so the hook visually clears the boxes before turning.
    const offset = 0.4;
    let midX: number, midY: number;
    switch (props.hookDirection) {
      case "right-down":
        midX = props.to.x; midY = props.from.y;
        break;
      case "right-up":
        // Extend right from source, then turn up to target
        midX = Math.max(props.from.x, props.to.x) + offset;
        midY = props.from.y;
        break;
      case "down-right":
        midX = props.from.x; midY = props.to.y;
        break;
      case "down-left":
        midX = props.from.x; midY = props.to.y;
        break;
      case "up-right":
        midX = props.from.x; midY = props.to.y;
        break;
      case "left-down":
        midX = props.to.x; midY = props.from.y;
        break;
    }

    // pptxgenjs: lineHead = start point, lineTail = end point
    // our API: head = arrowhead at destination (end), tail = arrowhead at source (start)
    if (props.hookDirection === "right-up") {
      // 3-segment U-shaped connector: right → up → left into target
      slide.addShape("line", {
        x: props.from.x, y: props.from.y,
        w: midX - props.from.x, h: 0,
        line: { color, width: lineWidth, dashType },
        lineHead: tail, lineTail: "none",
      });
      slide.addShape("line", {
        x: midX, y: props.to.y,
        w: 0, h: props.from.y - props.to.y,
        line: { color, width: lineWidth, dashType },
        lineHead: "none", lineTail: "none",
      });
      slide.addShape("line", {
        x: props.to.x, y: props.to.y,
        w: midX - props.to.x, h: 0,
        line: { color, width: lineWidth, dashType },
        lineHead: head, lineTail: "none",
      });
    } else {
      // Standard 2-segment L-shaped connector
      slide.addShape("line", {
        x: props.from.x, y: props.from.y,
        w: midX - props.from.x, h: midY - props.from.y,
        line: { color, width: lineWidth, dashType },
        lineHead: tail, lineTail: "none",
      });
      slide.addShape("line", {
        x: midX, y: midY,
        w: props.to.x - midX, h: props.to.y - midY,
        line: { color, width: lineWidth, dashType },
        lineHead: "none", lineTail: head,
      });
    }
  }

  // --- Container — large grouping rectangle with label ---
  function container(slide: PptxGenJS.Slide, props: ContainerProps): ShapeRef {
    const name = `diag-ctr-${shapeCounter++}`;
    slide.addShape("roundRect", {
      x: props.x, y: props.y, w: props.w, h: props.h,
      fill: { color: props.fill ?? "FFFFFF" },
      rectRadius: 0.1,
      line: {
        color: props.border ?? c.textMuted,
        width: 1,
      },
      shadow: {
        type: "outer", blur: 3, offset: 1,
        color: "000000", opacity: 0.08,
      },
      objectName: name,
    } as any);
    if (props.label) {
      slide.addText(props.label, {
        x: props.x, y: props.y - 0.35,
        w: props.w, h: 0.35,
        fontSize: props.fontSize ?? s.body,
        fontFace: f.sans,
        color: props.labelColor ?? c.textSecondary,
        align: "center",
        valign: "bottom",
        italic: true,
      });
    }
    return makeShapeRef(name, props.x, props.y, props.w, props.h);
  }

  // --- Equation — LaTeX rendered to PNG via MathJax + sharp ---
  async function equation(slide: PptxGenJS.Slide, props: EquationProps): Promise<void> {
    const color = props.color ?? c.text;
    const result = await renderEquation(props.latex, color);

    // Size: cap height at 0.6" by default, scale width to match aspect ratio
    const maxH = props.h ?? 0.6;
    const naturalH = props.w / result.aspectRatio;
    const h = Math.min(naturalH, maxH);
    const w = h * result.aspectRatio;

    // Center horizontally within the provided width
    const xOff = props.x + (props.w - w) / 2;

    slide.addImage({
      data: result.data,
      x: xOff, y: props.y, w, h,
      sizing: { type: "contain", w, h },
    });

    if (props.label) {
      slide.addText(props.label, {
        x: props.x,
        y: props.y + h + 0.05,
        w: props.w,
        h: 0.3,
        fontSize: s.caption,
        fontFace: f.sans,
        color: c.textMuted,
        italic: true,
        align: "center",
      });
    }
  }

  // --- Standalone emoji image ---
  async function emoji(slide: PptxGenJS.Slide, props: EmojiProps): Promise<void> {
    const data = await renderEmoji(props.name, cfg.emojiSet);
    slide.addImage({
      data,
      x: props.x,
      y: props.y,
      w: props.w ?? 0.4,
      h: props.h ?? 0.4,
    });
  }

  return { accentBar, heading, bodyText, bulletList, numberedList, codeBlock, quoteBox, table, caption, calloutBlock, textBlock, diagramBox, arrow, hookArrow, container, equation, emoji };
};
