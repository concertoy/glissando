/**
 * Pre-designed components for the Claude doc theme.
 *
 * Components are created via a factory that receives the runtime ThemeConfig,
 * so they respect font presets and config overrides.
 */

import type { Slide, TextRun } from "../../ooxml/index.js";
import type {
  ThemeConfig,
  ThemeComponents,
  ComponentFactory,
  Rect,
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
  ImageComponentProps,
  EquationProps,
  EmojiProps,
  ProgressBarProps,
  TimelineProps,
  QRCodeProps,
  EmojiDef,
  AnimationDef,
  PendingWork,
} from "../../types.js";
import { highlightCode } from "../../highlight.js";
import { lucideIcon } from "../../icons.js";
import { renderEquation } from "../../equation.js";
import { renderQRCode } from "../../qrcode.js";
import { renderEmoji, extractLeadingEmoji } from "../../emoji.js";
import { expandTextWithMath } from "../../inline-math.js";

export const createComponents: ComponentFactory = (cfg: ThemeConfig, emojiDefs?: EmojiDef[], pending?: PendingWork, animationDefs?: AnimationDef[]): ThemeComponents => {
  const { colors: c, fonts: f, sizes: s } = cfg;

  // --- Accent bar ---
  function accentBar(slide: Slide, props: AccentBarProps): Rect {
    const w = props.w ?? 2, h = props.h ?? 0.04;
    slide.addShape("rect", {
      x: props.x, y: props.y, w, h,
      fill: { color: c.accent },
      line: { color: c.accent, width: 0.5 },
    });
    return { x: props.x, y: props.y, w, h };
  }

  // --- Heading ---
  function heading(slide: Slide, props: HeadingProps): Rect {
    const h = 0.7;
    slide.addText(props.text, {
      x: props.x, y: props.y, w: props.w, h,
      fontSize: props.fontSize ?? s.heading,
      fontFace: f.heading,
      color: props.color ?? c.text,
      bold: props.bold ?? true,
      valign: "bottom",
    });
    return { x: props.x, y: props.y, w: props.w, h };
  }

  // --- Body text ---
  // Supports leading :emoji: — e.g. ":rocket: Launch the product"
  // Emoji is placed as an image before the text, text is shifted right.
  function bodyText(slide: Slide, props: BodyTextProps): Rect {
    const h = props.h ?? 0.5;
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
        h,
        fontSize,
        fontFace: props.fontFace ?? f.sans,
        color: props.color ?? c.textSecondary,
        bold: props.bold ?? false,
        italic: props.italic ?? false,
        valign: "top",
      });
    } else {
      const fontSize = props.fontSize ?? s.body;
      const mathRuns = expandTextWithMath(props.text, {
        fontSize,
        fontFace: props.fontFace ?? f.sans,
        color: props.color ?? c.textSecondary,
      });
      if (mathRuns) {
        slide.addText(mathRuns, {
          x: props.x, y: props.y, w: props.w, h,
          valign: "top",
        });
      } else {
        slide.addText(props.text, {
          x: props.x, y: props.y, w: props.w, h,
          fontSize,
          fontFace: props.fontFace ?? f.sans,
          color: props.color ?? c.textSecondary,
          bold: props.bold ?? false,
          italic: props.italic ?? false,
          valign: "top",
        });
      }
    }
    return { x: props.x, y: props.y, w: props.w, h };
  }

  // --- Bullet list ---
  // Supports :emoji: prefix on items — e.g. ":rocket: Launch the product"
  // Emoji prefixes replace the standard bullet marker via OOXML post-processing.

  let bulletListCounter = 0;

  function bulletList(slide: Slide, props: BulletListProps): Rect {
    const fontSize = props.fontSize ?? s.body;
    const h = props.h ?? 4.5;

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
    const needsName = hasEmojiBullets || props.build;
    const objName = needsName ? `bl-${bulletListCounter++}` : undefined;

    const baseOpts = { fontSize, fontFace: f.sans, color: c.textSecondary };
    const bulletOpt: { type: "bullet"; color: string; char?: string } = { type: "bullet", color: c.accent };
    if (props.bulletChar) bulletOpt.char = props.bulletChar;
    const textRows: TextRun[] = processedItems.flatMap((item): TextRun[] => {
      const mathRuns = expandTextWithMath(item, baseOpts);
      if (mathRuns) {
        return mathRuns.map((run, j) => ({
          ...run,
          options: {
            ...run.options,
            bullet: j === 0 ? bulletOpt : undefined,
            paraSpaceAfter: j === mathRuns.length - 1 ? 8 : undefined,
            indentLevel: j === 0 ? 0 : undefined,
            breakLine: j === mathRuns.length - 1 ? true : undefined,
          },
        }));
      }
      return [{
        text: item,
        options: {
          fontSize,
          fontFace: f.sans,
          color: c.textSecondary,
          bullet: bulletOpt,
          paraSpaceAfter: 8,
          indentLevel: 0,
        },
      }];
    });
    slide.addText(textRows, {
      x: props.x, y: props.y, w: props.w, h,
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

    // Queue build animation def
    if (props.build && animationDefs && objName) {
      animationDefs.push({
        slideIndex: -1,
        objectName: objName,
        paragraphCount: props.items.length,
      });
    }

    return { x: props.x, y: props.y, w: props.w, h };
  }

  // --- Numbered list ---
  function numberedList(slide: Slide, props: NumberedListProps): Rect {
    const fontSize = props.fontSize ?? s.body;
    const h = props.h ?? 4.5;
    const nlObjName = props.build ? `nl-${bulletListCounter++}` : undefined;
    const numBaseOpts = { fontSize, fontFace: f.sans, color: c.textSecondary };
    const textRows: TextRun[] = props.items.flatMap((item): TextRun[] => {
      const mathRuns = expandTextWithMath(item, numBaseOpts);
      if (mathRuns) {
        return mathRuns.map((run, j) => ({
          ...run,
          options: {
            ...run.options,
            bullet: j === 0 ? { type: "number", color: c.accent } : undefined,
            paraSpaceAfter: j === mathRuns.length - 1 ? 8 : undefined,
            breakLine: j === mathRuns.length - 1 ? true : undefined,
          },
        }));
      }
      return [{
        text: item,
        options: {
          fontSize,
          fontFace: f.sans,
          color: c.textSecondary,
          bullet: { type: "number", color: c.accent },
          paraSpaceAfter: 8,
        },
      }];
    });
    slide.addText(textRows, {
      x: props.x, y: props.y, w: props.w, h,
      valign: "top",
      lineSpacingMultiple: 1.2,
      objectName: nlObjName,
    });

    if (props.build && animationDefs && nlObjName) {
      animationDefs.push({
        slideIndex: -1,
        objectName: nlObjName,
        paragraphCount: props.items.length,
      });
    }

    return { x: props.x, y: props.y, w: props.w, h };
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

  function codeBlock(slide: Slide, props: CodeBlockProps): Rect {
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
    });

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
      });

      // Shape 4: syntax-highlighted code text (below rule)
      const hlLines = highlightCode(truncated, lang, cs);
      const textRows: TextRun[] = [];
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
        shape: "roundRect",
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
    return { x: props.x, y: props.y, w: props.w, h };
  }

  // --- Quote box ---
  function quoteBox(slide: Slide, props: QuoteBoxProps): Rect {
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
    return { x: props.x, y: props.y, w: props.w, h: props.h };
  }

  // --- Table ---
  function table(slide: Slide, props: TableProps): Rect {
    const headerRow: any[] = props.headers.map((h) => ({
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
    const dataRows: any[][] = props.rows.map((row) =>
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
    // Estimate table height: ~0.35" per row (header + data)
    const rowH = 0.35;
    const h = (1 + props.rows.length) * rowH;
    return { x: props.x, y: props.y, w: props.w, h };
  }

  // --- Caption ---
  // --- Image — themed image with optional caption and border ---

  function image(slide: Slide, props: ImageComponentProps): Rect {
    const borderPad = props.border ? 0.06 : 0;
    const imgX = props.x + borderPad;
    const imgY = props.y + borderPad;
    const imgW = props.w - borderPad * 2;
    const imgH = props.h - borderPad * 2;

    // Border: rect frame behind the image
    if (props.border) {
      const borderColor = typeof props.border === "string" ? props.border : c.accent;
      slide.addShape("rect", {
        x: props.x, y: props.y, w: props.w, h: props.h,
        fill: { color: "FFFFFF" },
        line: { color: borderColor, width: 1.5 },
        rectRadius: props.rounding ? 0.08 : 0,
      });
    }

    const imgOpts: Record<string, any> = {
      x: imgX, y: imgY, w: imgW, h: imgH,
      sizing: { type: props.sizing ?? "contain", w: imgW, h: imgH },
    };
    if (props.path) imgOpts.path = props.path;
    if (props.data) imgOpts.data = props.data;
    if (props.rounding && !props.border) imgOpts.rounding = true;
    slide.addImage(imgOpts);

    let totalH = props.h;
    if (props.caption) {
      caption(slide, {
        text: props.caption,
        x: props.x,
        y: props.y + props.h + 0.05,
        w: props.w,
      });
      totalH += 0.05 + 0.35;
    }
    return { x: props.x, y: props.y, w: props.w, h: totalH };
  }

  // --- Caption ---

  function caption(slide: Slide, props: CaptionProps): Rect {
    const h = 0.35;
    slide.addText(props.text, {
      x: props.x, y: props.y, w: props.w, h,
      fontSize: s.caption, fontFace: f.sans, color: c.textMuted,
      italic: true, align: "center",
    });
    return { x: props.x, y: props.y, w: props.w, h };
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

  async function calloutBlock(slide: Slide, props: CalloutBlockProps): Promise<Rect> {
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
      const coBodyBase = { fontSize: s.small, fontFace: f.sans, color: style.textColor };
      const coBodyRuns = expandTextWithMath(props.body, coBodyBase);
      slide.addText(coBodyRuns ?? props.body, {
        x: props.x, y: props.y, w: props.w, h,
        shape: "roundRect",
        fill: { color: style.bg },
        rectRadius: 0.08,
        line: { color: style.border, width: 1 },
        ...(coBodyRuns ? {} : { fontSize: s.small, fontFace: f.sans, color: style.textColor }),
        valign: "top",
        lineSpacingMultiple: 1.4,
        margin,
        objectName: `co-${gid}-bg`,
      });
    } else if (props.bullets) {
      const coBulletBase = { fontSize: s.small, fontFace: f.sans, color: style.textColor };
      const rows: TextRun[] = props.bullets.flatMap((item): TextRun[] => {
        const mathRuns = expandTextWithMath(item, coBulletBase);
        if (mathRuns) {
          return mathRuns.map((run, j) => ({
            ...run,
            options: {
              ...run.options,
              bullet: j === 0 ? { type: "bullet", color: style.border } : undefined,
              paraSpaceAfter: j === mathRuns.length - 1 ? 4 : undefined,
              breakLine: j === mathRuns.length - 1 ? true : undefined,
            },
          }));
        }
        return [{
          text: item,
          options: {
            fontSize: s.small, fontFace: f.sans,
            color: style.textColor,
            bullet: { type: "bullet", color: style.border },
            paraSpaceAfter: 4,
          },
        }];
      });
      slide.addText(rows, {
        x: props.x, y: props.y, w: props.w, h,
        shape: "roundRect",
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
    });
    return { x: props.x, y: props.y, w: props.w, h };
  }

  // --- Text block — icon-free rounded panel with optional title/subtitle ---

  function textBlock(slide: Slide, props: TextBlockProps): Rect {
    const fillColor = props.fill ?? c.bgCard;
    const borderColor = props.border ?? c.textMuted;
    const bodyColor = props.textColor ?? c.text;
    const pad = 14; // points, uniform on all sides
    const margin: [number, number, number, number] = [pad, pad, pad, pad];

    // Build text rows top-to-bottom: title, subtitle, then body/bullets
    const rows: TextRun[] = [];

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
      const tbBodyBase = { fontSize: s.small, fontFace: f.sans, color: bodyColor };
      const tbBodyRuns = expandTextWithMath(props.body, tbBodyBase);
      if (tbBodyRuns) {
        rows.push(...tbBodyRuns.map((run, j) => ({
          ...run,
          options: {
            ...run.options,
            lineSpacingMultiple: 1.4,
            breakLine: j === tbBodyRuns.length - 1 ? true : undefined,
          },
        })));
      } else {
        rows.push({
          text: props.body,
          options: {
            fontSize: s.small, fontFace: f.sans, color: bodyColor,
            lineSpacingMultiple: 1.4,
          },
        });
      }
    }

    if (props.bullets) {
      const tbBulletBase = { fontSize: s.small, fontFace: f.sans, color: bodyColor };
      for (const item of props.bullets) {
        const mathRuns = expandTextWithMath(item, tbBulletBase);
        if (mathRuns) {
          rows.push(...mathRuns.map((run, j) => ({
            ...run,
            options: {
              ...run.options,
              bullet: j === 0 ? { type: "bullet" as const, color: borderColor } : undefined,
              paraSpaceAfter: j === mathRuns.length - 1 ? 4 : undefined,
              breakLine: j === mathRuns.length - 1 ? true : undefined,
            },
          })));
        } else {
          rows.push({
            text: item,
            options: {
              fontSize: s.small, fontFace: f.sans, color: bodyColor,
              bullet: { type: "bullet", color: borderColor },
              paraSpaceAfter: 4,
            },
          });
        }
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
      shape: "roundRect",
      fill: { color: fillColor },
      rectRadius: 0.08,
      line: { color: borderColor, width: 1 },
      valign: "top",
      margin,
    });
    return { x: props.x, y: props.y, w: props.w, h };
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
      rect:   { x, y, w, h },
    };
  }

  // --- Diagram box — round-cornered labeled rectangle (single object, text built-in) ---
  function diagramBox(slide: Slide, props: DiagramBoxProps): ShapeRef {
    const name = `diag-box-${shapeCounter++}`;
    slide.addText(props.text, {
      x: props.x, y: props.y, w: props.w, h: props.h,
      shape: "roundRect",
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
  function arrow(slide: Slide, props: ArrowProps): void {
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
  function hookArrow(slide: Slide, props: HookArrowProps): void {
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
  function container(slide: Slide, props: ContainerProps): ShapeRef {
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
        blur: 3, offset: 1,
        color: "000000", opacity: 0.08,
      },
      objectName: name,
    });
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
  async function equation(slide: Slide, props: EquationProps): Promise<Rect> {
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

    const totalH = h + (props.label ? 0.35 : 0);

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
    return { x: props.x, y: props.y, w: props.w, h: totalH };
  }

  // --- Standalone emoji image ---
  async function emoji(slide: Slide, props: EmojiProps): Promise<Rect> {
    const w = props.w ?? 0.4, h = props.h ?? 0.4;
    const data = await renderEmoji(props.name, cfg.emojiSet);
    slide.addImage({
      data,
      x: props.x,
      y: props.y,
      w, h,
    });
    return { x: props.x, y: props.y, w, h };
  }

  // --- Progress bar — horizontal step indicator ---
  function progressBar(slide: Slide, props: ProgressBarProps): Rect {
    const h = props.h ?? 0.5;
    const n = props.steps.length;
    if (n === 0) return { x: props.x, y: props.y, w: props.w, h };

    const activeColor = props.activeColor ?? c.accent;
    const inactiveColor = props.inactiveColor ?? c.textMuted;
    const completedColor = props.completedColor ?? activeColor;
    const labelSize = props.fontSize ?? s.caption;
    const dotR = 0.12; // dot radius in inches
    const dotD = dotR * 2;

    // Distribute step centers evenly across width
    const padX = dotR + 0.05;
    const innerW = props.w - padX * 2;
    const stepSpacing = n > 1 ? innerW / (n - 1) : 0;

    for (let i = 0; i < n; i++) {
      const cx = props.x + padX + i * stepSpacing;
      const cy = props.y + h * 0.35;

      // Connecting line to next step
      if (i < n - 1) {
        const nx = props.x + padX + (i + 1) * stepSpacing;
        const lineColor = i < props.current ? completedColor : inactiveColor;
        slide.addShape("rect", {
          x: cx + dotR, y: cy - 0.015, w: nx - cx - dotD, h: 0.03,
          fill: { color: lineColor },
          line: { color: lineColor, width: 0.1 },
        });
      }

      // Step dot
      const isActive = i === props.current;
      const isCompleted = i < props.current;
      const dotColor = isActive ? activeColor : isCompleted ? completedColor : inactiveColor;
      slide.addShape("ellipse", {
        x: cx - dotR, y: cy - dotR, w: dotD, h: dotD,
        fill: { color: dotColor },
        line: { color: dotColor, width: 0.5 },
      });

      // Checkmark for completed steps
      if (isCompleted) {
        slide.addText("\u2713", {
          x: cx - dotR, y: cy - dotR, w: dotD, h: dotD,
          fontSize: 8, fontFace: f.sans, color: "FFFFFF",
          bold: true, align: "center", valign: "middle",
        });
      }

      // Active step: white inner number or dot
      if (isActive) {
        slide.addText(`${i + 1}`, {
          x: cx - dotR, y: cy - dotR, w: dotD, h: dotD,
          fontSize: 8, fontFace: f.sans, color: "FFFFFF",
          bold: true, align: "center", valign: "middle",
        });
      }

      // Label below dot
      slide.addText(props.steps[i], {
        x: cx - stepSpacing * 0.45,
        y: cy + dotR + 0.04,
        w: n > 1 ? stepSpacing * 0.9 : props.w,
        h: 0.25,
        fontSize: labelSize, fontFace: f.sans,
        color: isActive ? activeColor : isCompleted ? completedColor : inactiveColor,
        bold: isActive,
        align: "center", valign: "top",
      });
    }

    return { x: props.x, y: props.y, w: props.w, h };
  }

  // --- Timeline — horizontal or vertical event timeline ---
  function timeline(slide: Slide, props: TimelineProps): Rect {
    const h = props.h ?? 3;
    const n = props.events.length;
    if (n === 0) return { x: props.x, y: props.y, w: props.w, h };

    const accentColor = props.activeColor ?? c.accent;
    const lineColor = props.lineColor ?? c.textMuted;
    const isVertical = props.direction === "vertical";

    if (isVertical) {
      const dotR = 0.08;
      const dotD = dotR * 2;
      const lineX = props.x + 0.15;
      const padY = dotR + 0.1;
      const innerH = h - padY * 2;
      const stepSpacing = n > 1 ? innerH / (n - 1) : 0;

      // Vertical line
      if (n > 1) {
        slide.addShape("rect", {
          x: lineX - 0.01, y: props.y + padY,
          w: 0.02, h: innerH,
          fill: { color: lineColor },
          line: { color: lineColor, width: 0.1 },
        });
      }

      for (let i = 0; i < n; i++) {
        const cy = props.y + padY + i * stepSpacing;
        // Dot
        slide.addShape("ellipse", {
          x: lineX - dotR, y: cy - dotR, w: dotD, h: dotD,
          fill: { color: accentColor },
          line: { color: accentColor, width: 0.5 },
        });
        // Date label
        slide.addText(props.events[i].date, {
          x: lineX + dotR + 0.15, y: cy - 0.12,
          w: props.w - 0.5, h: 0.22,
          fontSize: s.small, fontFace: f.sans, color: accentColor,
          bold: true, valign: "middle",
        });
        // Title + description
        slide.addText(props.events[i].title, {
          x: lineX + dotR + 0.15, y: cy + 0.1,
          w: props.w - 0.5, h: 0.22,
          fontSize: s.caption, fontFace: f.sans, color: c.text,
          bold: true, valign: "top",
        });
        if (props.events[i].description) {
          slide.addText(props.events[i].description!, {
            x: lineX + dotR + 0.15, y: cy + 0.3,
            w: props.w - 0.5, h: 0.2,
            fontSize: s.caption, fontFace: f.sans, color: c.textSecondary,
            valign: "top",
          });
        }
      }
    } else {
      // Horizontal timeline
      const dotR = 0.08;
      const dotD = dotR * 2;
      const lineY = props.y + h * 0.35;
      const padX = dotR + 0.2;
      const innerW = props.w - padX * 2;
      const stepSpacing = n > 1 ? innerW / (n - 1) : 0;

      // Horizontal line
      if (n > 1) {
        slide.addShape("rect", {
          x: props.x + padX, y: lineY - 0.01,
          w: innerW, h: 0.02,
          fill: { color: lineColor },
          line: { color: lineColor, width: 0.1 },
        });
      }

      for (let i = 0; i < n; i++) {
        const cx = props.x + padX + i * stepSpacing;
        // Dot
        slide.addShape("ellipse", {
          x: cx - dotR, y: lineY - dotR, w: dotD, h: dotD,
          fill: { color: accentColor },
          line: { color: accentColor, width: 0.5 },
        });
        // Date above
        slide.addText(props.events[i].date, {
          x: cx - stepSpacing * 0.45,
          y: lineY - dotR - 0.3,
          w: n > 1 ? stepSpacing * 0.9 : props.w,
          h: 0.25,
          fontSize: s.caption, fontFace: f.sans, color: accentColor,
          bold: true, align: "center", valign: "bottom",
        });
        // Title below
        slide.addText(props.events[i].title, {
          x: cx - stepSpacing * 0.45,
          y: lineY + dotR + 0.05,
          w: n > 1 ? stepSpacing * 0.9 : props.w,
          h: 0.22,
          fontSize: s.caption, fontFace: f.sans, color: c.text,
          bold: true, align: "center", valign: "top",
        });
        if (props.events[i].description) {
          slide.addText(props.events[i].description!, {
            x: cx - stepSpacing * 0.45,
            y: lineY + dotR + 0.25,
            w: n > 1 ? stepSpacing * 0.9 : props.w,
            h: 0.3,
            fontSize: s.caption - 1, fontFace: f.sans, color: c.textSecondary,
            align: "center", valign: "top",
          });
        }
      }
    }

    return { x: props.x, y: props.y, w: props.w, h };
  }

  // --- QR code — renders a QR code image with optional caption ---
  async function qrCode(slide: Slide, props: QRCodeProps): Promise<Rect> {
    const qrH = props.h ?? props.w;
    const qrColor = props.color ?? c.text;
    const data = await renderQRCode(props.url, 512, qrColor, props.bgColor ?? "FFFFFF");
    slide.addImage({
      data,
      x: props.x, y: props.y, w: props.w, h: qrH,
    });
    let totalH = qrH;
    if (props.caption) {
      const capH = 0.3;
      slide.addText(props.caption, {
        x: props.x, y: props.y + qrH + 0.05,
        w: props.w, h: capH,
        fontSize: s.caption, fontFace: f.sans, color: c.textMuted,
        align: "center", valign: "top",
      });
      totalH += 0.05 + capH;
    }
    return { x: props.x, y: props.y, w: props.w, h: totalH };
  }

  return { accentBar, heading, bodyText, bulletList, numberedList, codeBlock, quoteBox, table, image, caption, calloutBlock, textBlock, diagramBox, arrow, hookArrow, container, equation, emoji, progressBar, timeline, qrCode };
};
