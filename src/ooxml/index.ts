/**
 * OOXML PPTX generator — direct replacement for pptxgenjs.
 *
 * Generates Office Open XML directly with jszip for packaging.
 * All features that were previously patched post-hoc (connectors, animations,
 * grouping, emoji bullets, footers) are first-class.
 */

import { readFileSync } from "fs";
import type {
  ConnectorDef,
  EmojiDef,
  AnimationDef,
  FooterDef,
  ThemeSpacing,
} from "../types.js";
import { assemblePptx } from "./writer.js";

// ─── Constants ──────────────────────────────────────────────────────

const EMU = 914400;
const PT_EMU = 12700;

function emu(inches: number): number { return Math.round(inches * EMU); }
function ptEmu(pt: number): number { return Math.round(pt * PT_EMU); }
function sz100(pt: number): number { return Math.round(pt * 100); }

function escXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─── Public types ───────────────────────────────────────────────────

export interface TextRun {
  text: string;
  options?: TextRunOpts;
}

export interface TextRunOpts {
  fontSize?: number;
  fontFace?: string;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  subscript?: boolean;
  superscript?: boolean;
  bullet?: BulletOpts | boolean;
  paraSpaceAfter?: number;
  paraSpaceBefore?: number;
  indentLevel?: number;
  lineSpacingMultiple?: number;
  breakLine?: boolean;
  valign?: string;
  align?: string;
  href?: string;
  /** Background highlight color on this text run (hex, no #). */
  highlight?: string;
  /** Strikethrough text. */
  strike?: boolean;
  charSpacing?: number;
  /** Drop shadow on text run. True for default, or { color, blur, offset, angle }. */
  textShadow?: boolean | { color?: string; blur?: number; offset?: number; angle?: number };
  /** Gradient fill on text characters (replaces solid color). */
  gradient?: GradientFill;
  /** Text opacity 0–1 (1 = fully opaque). */
  opacity?: number;
  /** Internal hyperlink to a slide (1-based index). Navigates to that slide on click. */
  slideLink?: number;
}

export interface BulletOpts {
  type?: "bullet" | "number";
  /** Hex code point for bullet character (e.g. "2013" for en-dash). */
  code?: string;
  /** Direct bullet character (e.g. "–", "›", "★"). Takes precedence over code. */
  char?: string;
  color?: string;
}

// ─── Slide method option types ──────────────────────────────────────

export interface FillOpts {
  color: string;
}

export interface GradientStop {
  position: number; // 0–100
  color: string;
}

export interface GradientFill {
  type?: "linear" | "radial";
  /** Angle in degrees (0 = left→right, 90 = top→bottom). Only for linear. */
  angle?: number;
  stops: GradientStop[];
}

export interface PatternFill {
  /** OOXML pattern preset (e.g. "ltDnDiag", "dkUpDiag", "horzBrick", "cross", "pct10"). */
  pattern: string;
  /** Foreground color (hex). */
  fgColor: string;
  /** Background color (hex). */
  bgColor: string;
}

export type LineEndType = "none" | "arrow" | "stealth" | "diamond" | "oval" | "triangle";

export interface LineOpts {
  color: string;
  width?: number;
  dashType?: "solid" | "dash" | "dot" | "dashDot" | "lgDash" | "lgDashDot" | "sysDash" | "sysDot";
  /** Arrow head at the start of the line. */
  headEnd?: LineEndType;
  /** Arrow head at the end of the line. */
  tailEnd?: LineEndType;
}

export interface ShadowOpts {
  color?: string;
  blur?: number;
  offset?: number;
  opacity?: number;
  /** Shadow direction angle in degrees (default 45). */
  angle?: number;
}

export interface AddTextOpts {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  fontSize?: number;
  fontFace?: string;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  valign?: "top" | "middle" | "bottom" | "t" | "ctr" | "b";
  align?: "left" | "center" | "right" | "l" | "ctr" | "r";
  lineSpacingMultiple?: number;
  lineSpacing?: number;
  charSpacing?: number;
  margin?: number | number[];
  shape?: string;
  fill?: FillOpts;
  gradient?: GradientFill;
  patternFill?: PatternFill;
  line?: LineOpts;
  shadow?: ShadowOpts;
  rectRadius?: number;
  objectName?: string;
  autoFit?: boolean;
  fit?: "shrink";
  paraSpaceAfter?: number;
  paraSpaceBefore?: number;
  bullet?: BulletOpts | boolean;
  indentLevel?: number;
  /** Alt text for accessibility (screen readers). */
  altText?: string;
  /** Rotation in degrees (clockwise). */
  rotate?: number;
  /** Number of text columns within the text box. */
  columns?: number;
  /** Column spacing in inches (default 0.3). */
  columnSpacing?: number;
  /** Shape opacity 0–1 (affects fill, not text). */
  opacity?: number;
  /** Vertical text direction. "vert" = top-to-bottom, "vert270" = bottom-to-top. */
  vertical?: "vert" | "vert270";
  /** Horizontal flip. */
  flipH?: boolean;
  /** Vertical flip. */
  flipV?: boolean;
  /** WordArt text transform preset (e.g. "textArchUp", "textWave1", "textDeflate"). */
  textTransform?: string;
}

export interface AddShapeOpts {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  fill?: FillOpts;
  gradient?: GradientFill;
  patternFill?: PatternFill;
  line?: LineOpts;
  shadow?: ShadowOpts;
  rectRadius?: number;
  lineHead?: string;
  lineTail?: string;
  objectName?: string;
  rotate?: number;
  flipH?: boolean;
  flipV?: boolean;
  opacity?: number;
  /** Custom adjust values for shape geometry (e.g. { adj: 25000 } for arrow head size). */
  adjustments?: Record<string, number>;
  /** Text inside the shape. */
  text?: string | TextRun[];
  /** Font size for shape text (points). */
  fontSize?: number;
  /** Font face for shape text. */
  fontFace?: string;
  /** Text color for shape text (hex). */
  color?: string;
  /** Text alignment inside shape. */
  align?: "left" | "center" | "right" | "l" | "ctr" | "r";
  /** Vertical alignment inside shape. */
  valign?: "top" | "middle" | "bottom" | "t" | "ctr" | "b";
  /** Bold text. */
  bold?: boolean;
}

export interface AddImageOpts {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  path?: string;
  data?: string;
  objectName?: string;
  rounding?: boolean;
  sizing?: { type: string; w: number; h: number };
  /** Alt text for accessibility (screen readers). */
  altText?: string;
  /** Crop percentages (0–100) from each edge. */
  crop?: { top?: number; right?: number; bottom?: number; left?: number };
  /** Rotation in degrees (clockwise). */
  rotate?: number;
  /** Border line around image. */
  line?: LineOpts;
  /** Drop shadow on image. */
  shadow?: ShadowOpts;
}

export interface AddTableOpts {
  x?: number;
  y?: number;
  w?: number;
  /** Row height — single number for uniform, or array for per-row heights (inches). */
  rowH?: number | number[];
  colW?: number[];
  /** Auto-calculate column widths based on content length (ignored if colW is set). */
  autoColW?: boolean;
  margin?: number | number[];
}

export type TransitionType = "fade" | "push" | "wipe" | "cover" | "split" | "cut";

export interface TransitionOpts {
  type: TransitionType;
  /** Duration in milliseconds (default: 700). */
  duration?: number;
  /** Advance automatically after this many milliseconds. */
  advanceAfter?: number;
}

export interface TableBorderOpts {
  /** Border width in points (default 1). */
  pt?: number;
  /** Border color hex (default "000000"). */
  color?: string;
  /** Set to "none" to hide border. */
  type?: "none" | "solid";
}

export interface TableCell {
  text: string | TextRun[];
  options?: {
    fontSize?: number;
    fontFace?: string;
    color?: string;
    bold?: boolean;
    italic?: boolean;
    align?: string;
    valign?: string;
    fill?: FillOpts;
    gradient?: GradientFill;
    /** Cell borders: [top, right, bottom, left]. */
    border?: TableBorderOpts[];
    paraSpaceBefore?: number;
    paraSpaceAfter?: number;
    /** Number of columns this cell spans (default 1). */
    colspan?: number;
    /** Number of rows this cell spans (default 1). */
    rowspan?: number;
  };
}

// ─── Extras passed at write time ────────────────────────────────────

export interface WriteExtras {
  connectorDefs?: ConnectorDef[];
  emojiDefs?: EmojiDef[];
  animationDefs?: AnimationDef[];
  footerDefs?: FooterDef[];
  footerStyle?: {
    spacing: ThemeSpacing;
    font: string;
    size: number;
    color: string;
  };
}

// ─── Presentation ───────────────────────────────────────────────────

export class Presentation {
  /** @internal */ _slides: Slide[] = [];
  /** @internal */ _width = 10;
  /** @internal */ _height = 5.625;
  /** @internal */ _headFont = "Calibri";
  /** @internal */ _bodyFont = "Calibri";
  /** @internal */ _extras: WriteExtras = {};
  /** @internal */ _metadata: { title?: string; author?: string; subject?: string; keywords?: string } = {};

  defineLayout(opts: { name: string; width: number; height: number }): void {
    this._width = opts.width;
    this._height = opts.height;
  }

  set layout(_name: string) { /* used with defineLayout, no-op here */ }
  get layout(): string { return "CUSTOM"; }

  set theme(t: { headFontFace?: string; bodyFontFace?: string }) {
    if (t.headFontFace) this._headFont = t.headFontFace;
    if (t.bodyFontFace) this._bodyFont = t.bodyFontFace;
  }

  get theme(): { headFontFace?: string; bodyFontFace?: string } {
    return { headFontFace: this._headFont, bodyFontFace: this._bodyFont };
  }

  /** Set presentation metadata (title, author, subject, keywords). */
  setMetadata(meta: { title?: string; author?: string; subject?: string; keywords?: string }): void {
    Object.assign(this._metadata, meta);
  }

  addSlide(): Slide {
    const slide = new Slide(this._slides.length);
    this._slides.push(slide);
    return slide;
  }

  /** Duplicate an existing slide (0-based index). Returns the new slide. */
  duplicateSlide(index: number): Slide {
    const source = this._slides[index];
    if (!source) throw new Error(`No slide at index ${index}`);
    const clone = source._clone(this._slides.length);
    this._slides.push(clone);
    return clone;
  }

  /** Move a slide from one position to another (0-based indices). */
  moveSlide(from: number, to: number): void {
    if (from < 0 || from >= this._slides.length) throw new Error(`Invalid from index ${from}`);
    if (to < 0 || to >= this._slides.length) throw new Error(`Invalid to index ${to}`);
    const [slide] = this._slides.splice(from, 1);
    this._slides.splice(to, 0, slide);
    // Re-index
    this._slides.forEach((s, i) => { s._slideIndex = i; });
  }

  /** Remove a slide at the given position (0-based index). */
  removeSlide(index: number): void {
    if (index < 0 || index >= this._slides.length) throw new Error(`Invalid index ${index}`);
    this._slides.splice(index, 1);
    // Re-index
    this._slides.forEach((s, i) => { s._slideIndex = i; });
  }

  /**
   * Apply deferred extras (connectors, emojis, animations, footers).
   * Must be called before writeFile.
   */
  applyExtras(extras: WriteExtras): void {
    this._extras = extras;
  }

  async writeFile(opts: { fileName: string }): Promise<void> {
    // Apply deferred processing to slides
    this._applyConnectors();
    this._applyEmojiBullets();
    this._applyAnimations();
    this._applyFooters();
    this._applyGrouping();

    const buf = await assemblePptx(this);
    const { writeFileSync } = await import("fs");
    writeFileSync(opts.fileName, buf);
  }

  // -- Deferred processing --

  private _applyConnectors(): void {
    const defs = this._extras.connectorDefs;
    if (!defs?.length) return;
    const bySlide = new Map<number, ConnectorDef[]>();
    for (const d of defs) {
      const list = bySlide.get(d.slideIndex) ?? [];
      list.push(d);
      bySlide.set(d.slideIndex, list);
    }
    for (const [idx, conns] of bySlide) {
      const slide = this._slides[idx - 1]; // slideIndex is 1-based
      if (!slide) continue;
      for (const conn of conns) {
        const fromId = slide._nameToId.get(conn.from._shapeName);
        const toId = slide._nameToId.get(conn.to._shapeName);
        if (!fromId || !toId) continue;
        slide._elements.push(buildConnectorXml(conn, fromId, toId, slide._allocId()));
        if (conn.label) {
          slide._elements.push(buildConnectorLabelXml(conn, slide._allocId(), this._bodyFont));
        }
      }
    }
  }

  private _applyEmojiBullets(): void {
    const defs = this._extras.emojiDefs;
    if (!defs?.length) return;
    for (const def of defs) {
      // Find the slide containing this objectName
      for (const slide of this._slides) {
        if (!slide._nameToId.has(def.objectName)) continue;
        // Find the element XML and patch emoji bullets
        for (let i = 0; i < slide._elements.length; i++) {
          const elXml = slide._elements[i].toString();
          if (!elXml.includes(`name="${def.objectName}"`)) continue;
          slide._elements[i] = patchEmojiBulletsInXml(
            elXml, def, slide,
          );
        }
        break;
      }
    }
  }

  private _applyAnimations(): void {
    const defs = this._extras.animationDefs;
    if (!defs?.length) return;
    for (const def of defs) {
      for (const slide of this._slides) {
        const spid = slide._nameToId.get(def.objectName);
        if (spid === undefined) continue;
        slide._timing = buildTimingXml(String(spid), def.paragraphCount);
        break;
      }
    }
  }

  private _applyFooters(): void {
    const defs = this._extras.footerDefs;
    const style = this._extras.footerStyle;
    if (!defs?.length || !style) return;

    const sp = style.spacing;
    const footerY = sp.slideHeight - 0.35;
    const footerH = 0.25;
    const leftX = sp.marginLeft;
    const leftW = sp.slideWidth - sp.marginLeft - sp.marginRight - 1.5;
    const rightW = 1.2;
    const rightX = sp.slideWidth - sp.marginRight - rightW;

    for (const def of defs) {
      const slide = this._slides[def.slideIndex];
      if (!slide) continue;

      if (def.slideNumber) {
        const id = slide._allocId();
        slide._elements.push(buildFooterTextBox(
          id, "SlideNum", rightX, footerY, rightW, footerH, "r", def.slideNumber, style,
        ));
      }
      const leftParts: string[] = [];
      if (def.text) leftParts.push(def.text);
      if (def.citations) leftParts.push(def.citations);
      if (leftParts.length > 0) {
        const id = slide._allocId();
        slide._elements.push(buildFooterTextBox(
          id, "FooterText", leftX, footerY, leftW, footerH, "l", leftParts.join("  \u00B7  "), style,
        ));
      }
    }
  }

  private _applyGrouping(): void {
    for (const slide of this._slides) {
      applyCodeBlockGrouping(slide);
      applyCalloutGrouping(slide);
    }
  }
}

// ─── Group shape ───────────────────────────────────────────────────

/**
 * A group shape that can contain text, shapes, images, and nested groups.
 * Acts like a mini-Slide for collecting elements, then serializes to `<p:grpSp>`.
 */
export class GroupShape {
  /** @internal */ _grpId: number;
  private _x: number;
  private _y: number;
  private _w: number;
  private _h: number;
  private _children: Array<string | GroupShape> = [];
  private _slide: Slide;
  private _name: string;

  constructor(x: number, y: number, w: number, h: number, slide: Slide) {
    this._x = x;
    this._y = y;
    this._w = w;
    this._h = h;
    this._slide = slide;
    this._grpId = slide._allocId();
    this._name = `Group_${this._grpId}`;
  }

  addText(content: string | TextRun[], opts?: AddTextOpts): void {
    const o: Record<string, any> = opts ?? {};
    const id = this._slide._allocId(o.objectName);
    const name = o.objectName ?? `TextBox_${id}`;
    this._children.push(buildTextShapeXml(id, name, content, o, this._slide));
  }

  addShape(type: string, opts: AddShapeOpts): void {
    const o: Record<string, any> = opts;
    const id = this._slide._allocId(o.objectName);
    const name = o.objectName ?? `Shape_${id}`;
    this._children.push(buildShapeXml(id, name, type, o));
  }

  addImage(opts: AddImageOpts): void {
    const o: Record<string, any> = opts;
    const id = this._slide._allocId(o.objectName);
    const name = o.objectName ?? `Image_${id}`;
    this._slide._mediaCounter++;
    const resolved = resolveImageData(o);
    const fileName = `img_s${this._slide._slideIndex + 1}_${this._slide._mediaCounter}.${resolved.ext}`;
    const rId = `rImg${this._slide._mediaCounter}`;
    this._slide._images.push({ rId, fileName, data: resolved.data, contentType: resolved.contentType });
    this._children.push(buildPictureXml(id, name, rId, o));
  }

  /** Create a nested group shape. */
  addGroup(opts: { x: number; y: number; w: number; h: number; objectName?: string }): GroupShape {
    const nested = new GroupShape(opts.x, opts.y, opts.w, opts.h, this._slide);
    if (opts.objectName) this._slide._nameToId.set(opts.objectName, nested._grpId);
    this._children.push(nested);
    return nested;
  }

  toString(): string {
    const gx = emu(this._x), gy = emu(this._y);
    const gcx = emu(this._w), gcy = emu(this._h);
    return (
      `<p:grpSp>` +
      `<p:nvGrpSpPr>` +
      `<p:cNvPr id="${this._grpId}" name="${this._name}"/>` +
      `<p:cNvGrpSpPr><a:grpSpLocks noChangeAspect="0"/></p:cNvGrpSpPr>` +
      `<p:nvPr/>` +
      `</p:nvGrpSpPr>` +
      `<p:grpSpPr><a:xfrm>` +
      `<a:off x="${gx}" y="${gy}"/><a:ext cx="${gcx}" cy="${gcy}"/>` +
      `<a:chOff x="${gx}" y="${gy}"/><a:chExt cx="${gcx}" cy="${gcy}"/>` +
      `</a:xfrm></p:grpSpPr>` +
      this._children.map(c => c.toString()).join("") +
      `</p:grpSp>`
    );
  }
}

// ─── Slide ──────────────────────────────────────────────────────────

export class Slide {
  /** @internal */ _slideIndex: number;
  /** @internal */ _bg: string = "FFFFFF";
  /** @internal */ _bgGradient?: GradientFill;
  /** @internal */ _bgPattern?: PatternFill;
  /** @internal */ _bgImageRId?: string;
  /** @internal */ _elements: Array<string | { toString(): string }> = [];
  /** @internal */ _nextId: number = 2;
  /** @internal */ _nameToId = new Map<string, number>();
  /** @internal */ _images: Array<{ rId: string; fileName: string; data: Buffer; contentType: string }> = [];
  /** @internal */ _notes?: string | TextRun[];
  /** @internal */ _timing?: string;
  /** @internal */ _mediaCounter = 0;
  /** @internal */ _hyperlinks: Array<{ rId: string; url: string }> = [];
  /** @internal */ _hyperlinkCounter = 0;
  /** @internal */ _transition?: TransitionOpts;

  constructor(index: number) {
    this._slideIndex = index;
  }

  /** @internal Clone this slide into a new slide at the given index. */
  _clone(newIndex: number): Slide {
    const s = new Slide(newIndex);
    s._bg = this._bg;
    s._bgGradient = this._bgGradient ? { ...this._bgGradient, stops: this._bgGradient.stops.map(st => ({ ...st })) } : undefined;
    s._bgPattern = this._bgPattern ? { ...this._bgPattern } : undefined;
    s._bgImageRId = this._bgImageRId;
    s._elements = this._elements.map(e => typeof e === "string" ? e : e.toString());
    s._nextId = this._nextId;
    s._nameToId = new Map(this._nameToId);
    s._images = this._images.map(img => ({ ...img }));
    s._notes = this._notes;
    s._timing = this._timing;
    s._mediaCounter = this._mediaCounter;
    s._hyperlinks = this._hyperlinks.map(h => ({ ...h }));
    s._slideLinks = this._slideLinks.map(l => ({ ...l }));
    s._hyperlinkCounter = this._hyperlinkCounter;
    s._transition = this._transition ? { ...this._transition } : undefined;
    return s;
  }

  set background(bg: { color: string; gradient?: GradientFill; patternFill?: PatternFill; image?: string }) {
    this._bg = bg.color;
    this._bgGradient = bg.gradient;
    this._bgPattern = bg.patternFill;
    if (bg.image) {
      const resolved = resolveImageData({ data: bg.image });
      this._mediaCounter++;
      const fileName = `img_bg_s${this._slideIndex + 1}.${resolved.ext}`;
      const rId = `rBgImg1`;
      this._images.push({ rId, fileName, data: resolved.data, contentType: resolved.contentType });
      this._bgImageRId = rId;
    }
  }
  get background(): { color: string; gradient?: GradientFill } {
    return { color: this._bg, gradient: this._bgGradient };
  }

  /** Set a transition effect for this slide. */
  set transition(opts: TransitionOpts) { this._transition = opts; }
  get transition(): TransitionOpts | undefined { return this._transition; }

  /** @internal */
  _allocId(name?: string): number {
    const id = this._nextId++;
    if (name) this._nameToId.set(name, id);
    return id;
  }

  /** @internal */ _slideLinks: Array<{ rId: string; slideIndex: number }> = [];

  /** @internal Register a hyperlink and return its relationship ID. */
  _addHyperlink(url: string): string {
    this._hyperlinkCounter++;
    const rId = `rIdHlink${this._hyperlinkCounter}`;
    this._hyperlinks.push({ rId, url });
    return rId;
  }

  /** @internal Register an internal slide link and return its relationship ID. */
  _addSlideLink(slideIndex: number): string {
    this._hyperlinkCounter++;
    const rId = `rIdHlink${this._hyperlinkCounter}`;
    this._slideLinks.push({ rId, slideIndex });
    return rId;
  }

  addText(content: string | TextRun[], opts?: AddTextOpts): void {
    const o: Record<string, any> = opts ?? {};
    const id = this._allocId(o.objectName);
    const name = o.objectName ?? `TextBox_${id}`;
    this._elements.push(buildTextShapeXml(id, name, content, o, this));
  }

  addShape(type: string, opts: AddShapeOpts): void {
    const o: Record<string, any> = opts;
    const id = this._allocId(o.objectName);
    const name = o.objectName ?? `Shape_${id}`;
    this._elements.push(buildShapeXml(id, name, type, o));
  }

  addImage(opts: AddImageOpts): void {
    const o: Record<string, any> = opts;
    const id = this._allocId(o.objectName);
    const name = o.objectName ?? `Image_${id}`;
    this._mediaCounter++;
    const resolved = resolveImageData(o);
    const fileName = `img_s${this._slideIndex + 1}_${this._mediaCounter}.${resolved.ext}`;
    const rId = `rImg${this._mediaCounter}`;
    this._images.push({ rId, fileName, data: resolved.data, contentType: resolved.contentType });
    this._elements.push(buildPictureXml(id, name, rId, o));
  }

  addTable(rows: TableCell[][], opts: AddTableOpts): void {
    const o: Record<string, any> = opts;
    const id = this._allocId();
    this._elements.push(buildTableXml(id, rows, o));
  }

  /** Add a semi-transparent watermark text across the slide center. */
  addWatermark(text: string, opts?: { color?: string; fontSize?: number; opacity?: number; rotate?: number }): void {
    this.addText([{
      text,
      options: {
        fontSize: opts?.fontSize ?? 48,
        color: opts?.color ?? "000000",
        bold: true,
        opacity: opts?.opacity ?? 0.08,
      },
    }], {
      x: 0, y: 0,
      w: 10, h: 5.625,
      align: "center",
      valign: "middle",
      rotate: opts?.rotate ?? -30,
    });
  }

  addNotes(text: string | TextRun[]): void {
    this._notes = text;
  }

  /**
   * Create a group shape. Returns a GroupShape that supports the same
   * addText/addShape/addImage/addGroup methods. Nested groups are supported.
   */
  addGroup(opts: { x: number; y: number; w: number; h: number; objectName?: string }): GroupShape {
    const grp = new GroupShape(opts.x, opts.y, opts.w, opts.h, this);
    if (opts.objectName) this._nameToId.set(opts.objectName, grp._grpId);
    this._elements.push(grp);
    return grp;
  }

  /** Build the full <p:sld> XML. @internal */
  _toXml(): string {
    let bgFill: string;
    if (this._bgImageRId) {
      bgFill = `<a:blipFill><a:blip r:embed="${this._bgImageRId}"/><a:stretch><a:fillRect/></a:stretch></a:blipFill>`;
    } else if (this._bgGradient) {
      bgFill = buildGradientFillXml(this._bgGradient);
    } else if (this._bgPattern) {
      bgFill = buildPatternFillXml(this._bgPattern);
    } else {
      bgFill = `<a:solidFill><a:srgbClr val="${this._bg}"/></a:solidFill>`;
    }
    const bgXml =
      `<p:bg><p:bgPr>` +
      bgFill +
      `<a:effectLst/>` +
      `</p:bgPr></p:bg>`;

    const spTree =
      `<p:spTree>` +
      `<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>` +
      `<p:grpSpPr><a:xfrm>` +
      `<a:off x="0" y="0"/><a:ext cx="0" cy="0"/>` +
      `<a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/>` +
      `</a:xfrm></p:grpSpPr>` +
      this._elements.join("") +
      `</p:spTree>`;

    const timing = this._timing ?? "";
    const transition = this._transition ? buildTransitionXml(this._transition) : "";

    return (
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
      `<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"` +
      ` xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"` +
      ` xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">` +
      `<p:cSld>${bgXml}${spTree}</p:cSld>` +
      `<p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>` +
      transition +
      timing +
      `</p:sld>`
    );
  }

  /** Build relationships XML for this slide. @internal */
  _toRelsXml(hasNotes: boolean): string {
    const rels: string[] = [
      `<Relationship Id="rIdLayout" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>`,
    ];
    for (const img of this._images) {
      rels.push(
        `<Relationship Id="${img.rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/${img.fileName}"/>`,
      );
    }
    for (const hlink of this._hyperlinks) {
      rels.push(
        `<Relationship Id="${hlink.rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${escXml(hlink.url)}" TargetMode="External"/>`,
      );
    }
    for (const slink of this._slideLinks) {
      rels.push(
        `<Relationship Id="${slink.rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slide${slink.slideIndex}.xml"/>`,
      );
    }
    if (hasNotes) {
      rels.push(
        `<Relationship Id="rIdNotes" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesSlide" Target="../noteSlides/notesSlide${this._slideIndex + 1}.xml"/>`,
      );
    }
    return (
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
      `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
      rels.join("") +
      `</Relationships>`
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// XML BUILDERS
// ═══════════════════════════════════════════════════════════════════

// ─── Text shape ─────────────────────────────────────────────────────

function buildTextShapeXml(
  id: number,
  name: string,
  content: string | TextRun[],
  opts: Record<string, any>,
  slide?: Slide,
): string {
  const x = emu(opts.x ?? 0);
  const y = emu(opts.y ?? 0);
  const cx = emu(opts.w ?? 1);
  const cy = emu(opts.h ?? 0.5);

  // Determine if this is a text box or a shaped text element
  const shapeType: string = opts.shape ?? "rect";
  const isTextBox = !opts.shape && !opts.fill;

  // Transform
  const rot = opts.rotate ? ` rot="${Math.round(opts.rotate * 60000)}"` : "";
  const flipH = opts.flipH ? ` flipH="1"` : "";
  const flipV = opts.flipV ? ` flipV="1"` : "";
  const xfrmXml =
    `<a:xfrm${flipH}${flipV}${rot}>` +
    `<a:off x="${x}" y="${y}"/>` +
    `<a:ext cx="${cx}" cy="${cy}"/>` +
    `</a:xfrm>`;

  // Geometry
  let geomXml: string;
  if (shapeType === "roundRect") {
    const radius = opts.rectRadius ?? 0.1;
    const shorter = Math.min(opts.w ?? 1, opts.h ?? 0.5);
    const adj = Math.round((radius / shorter) * 100000);
    geomXml = `<a:prstGeom prst="roundRect"><a:avLst><a:gd name="adj" fmla="val ${adj}"/></a:avLst></a:prstGeom>`;
  } else {
    geomXml = `<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>`;
  }

  // Fill
  let fillXml: string;
  if (isTextBox) {
    fillXml = `<a:noFill/>`;
  } else if (opts.patternFill) {
    fillXml = buildPatternFillXml(opts.patternFill);
  } else if (opts.gradient) {
    fillXml = buildGradientFillXml(opts.gradient);
  } else if (opts.fill) {
    const opacXml = opts.opacity != null ? `<a:alpha val="${Math.round(opts.opacity * 100000)}"/>` : "";
    fillXml = `<a:solidFill><a:srgbClr val="${opts.fill.color}">${opacXml}</a:srgbClr></a:solidFill>`;
  } else {
    fillXml = `<a:noFill/>`;
  }

  // Line
  let lineXml = "";
  if (opts.line) {
    lineXml = buildLineXml(opts.line);
  }

  // Shadow
  let shadowXml = "";
  if (opts.shadow) {
    shadowXml = buildShadowXml(opts.shadow);
  }

  // Non-visual properties
  const txBoxAttr = isTextBox ? ' txBox="1"' : "";
  const descrAttr = opts.altText ? ` descr="${escXml(opts.altText)}"` : "";
  const nvSpPr =
    `<p:nvSpPr>` +
    `<p:cNvPr id="${id}" name="${escXml(name)}"${descrAttr}/>` +
    `<p:cNvSpPr${txBoxAttr}/>` +
    `<p:nvPr/>` +
    `</p:nvSpPr>`;

  // Shape properties
  const spPr = `<p:spPr>${xfrmXml}${geomXml}${fillXml}${lineXml}${shadowXml}</p:spPr>`;

  // Text body
  const txBody = buildTextBodyXml(content, opts, slide);

  return `<p:sp>${nvSpPr}${spPr}${txBody}</p:sp>`;
}

// ─── Text body XML (<p:txBody>) ─────────────────────────────────────

function buildTextBodyXml(content: string | TextRun[], opts: Record<string, any>, slide?: Slide): string {
  // Body properties
  const valignMap: Record<string, string> = { top: "t", middle: "ctr", bottom: "b", b: "b", t: "t", ctr: "ctr" };
  const anchor = valignMap[opts.valign ?? "top"] ?? "t";

  // Margins (in EMU). pptxgenjs margin is [top, right, bottom, left] in POINTS
  let lIns = 91440, tIns = 45720, rIns = 91440, bIns = 45720; // defaults
  if (opts.margin != null) {
    if (typeof opts.margin === "number") {
      const m = ptEmu(opts.margin);
      lIns = tIns = rIns = bIns = m;
    } else if (Array.isArray(opts.margin)) {
      // Order: [left, right, bottom, top]
      lIns = ptEmu(opts.margin[0]);
      rIns = ptEmu(opts.margin[1]);
      bIns = ptEmu(opts.margin[2]);
      tIns = ptEmu(opts.margin[3]);
    }
  }

  let fitXml = "";
  if (opts.fit === "shrink") {
    fitXml = `<a:normAutofit/>`;
  } else if (opts.autoFit) {
    fitXml = `<a:spAutoFit/>`;
  }

  const colAttr = opts.columns && opts.columns > 1
    ? ` numCol="${opts.columns}" spcCol="${emu(opts.columnSpacing ?? 0.3)}"`
    : "";
  const vertAttr = opts.vertical ? ` vert="${opts.vertical}"` : "";
  const bodyPr =
    `<a:bodyPr wrap="square" lIns="${lIns}" tIns="${tIns}" rIns="${rIns}" bIns="${bIns}" rtlCol="0" anchor="${anchor}"` +
    colAttr +
    vertAttr +
    (opts.charSpacing != null ? ` spcFirstLastPara="0"` : "") +
    `>${fitXml}${opts.textTransform ? `<a:prstTxWarp prst="${opts.textTransform}"><a:avLst/></a:prstTxWarp>` : ""}</a:bodyPr>`;

  // Build paragraphs
  const paragraphs = buildParagraphsXml(content, opts, slide);

  return `<p:txBody>${bodyPr}<a:lstStyle/>${paragraphs}</p:txBody>`;
}

function buildParagraphsXml(content: string | TextRun[], opts: Record<string, any>, slide?: Slide): string {
  if (typeof content === "string") {
    // Simple single-paragraph text
    return buildSingleParagraph(content, opts);
  }

  // Array of text runs — group into paragraphs by breakLine or bullet
  // A run with `bullet` starts a new paragraph (matches pptxgenjs behavior)
  const paragraphs: TextRun[][] = [[]];
  for (const run of content) {
    if (run.options?.bullet && paragraphs[paragraphs.length - 1].length > 0) {
      paragraphs.push([]);
    }
    paragraphs[paragraphs.length - 1].push(run);
    if (run.options?.breakLine) {
      paragraphs.push([]);
    }
  }
  // Remove trailing empty paragraph
  if (paragraphs[paragraphs.length - 1].length === 0) {
    paragraphs.pop();
  }

  return paragraphs.map((runs) => buildParagraphFromRuns(runs, opts, slide)).join("");
}

function buildSingleParagraph(text: string, opts: Record<string, any>): string {
  const pPr = buildParagraphProps(opts);
  const rPr = buildRunProps(opts);
  return `<a:p>${pPr}<a:r>${rPr}<a:t>${escXml(text)}</a:t></a:r></a:p>`;
}

function buildParagraphFromRuns(runs: TextRun[], parentOpts: Record<string, any>, slide?: Slide): string {
  if (runs.length === 0) return `<a:p><a:endParaRPr lang="en-US"/></a:p>`;

  // Paragraph props come from the first run
  const firstRun = runs[0];
  const pOpts = { ...parentOpts, ...firstRun.options };
  const pPr = buildParagraphProps(pOpts);

  const runXmls = runs.map((run) => {
    const o = { ...parentOpts, ...run.options };
    const rPr = buildRunProps(o, slide);
    return `<a:r>${rPr}<a:t>${escXml(run.text)}</a:t></a:r>`;
  });

  return `<a:p>${pPr}${runXmls.join("")}</a:p>`;
}

function buildParagraphProps(opts: Record<string, any>): string {
  const parts: string[] = [];

  // Alignment
  const alignMap: Record<string, string> = { left: "l", center: "ctr", right: "r", l: "l", r: "r", ctr: "ctr" };
  if (opts.align) parts.push(`algn="${alignMap[opts.align] ?? "l"}"`);

  // Indent level
  if (opts.indentLevel != null) {
    parts.push(`lvl="${opts.indentLevel}"`);
    parts.push(`indent="0"`);
    parts.push(`marL="${opts.indentLevel * 457200}"`);
  }

  const children: string[] = [];

  // Line spacing
  if (opts.lineSpacingMultiple) {
    const val = Math.round(opts.lineSpacingMultiple * 100000);
    children.push(`<a:lnSpc><a:spcPct val="${val}"/></a:lnSpc>`);
  }
  if (opts.lineSpacing) {
    const val = Math.round(opts.lineSpacing * 100);
    children.push(`<a:lnSpc><a:spcPts val="${val}"/></a:lnSpc>`);
  }

  // Space after/before
  if (opts.paraSpaceAfter != null) {
    children.push(`<a:spcAft><a:spcPts val="${Math.round(opts.paraSpaceAfter * 100)}"/></a:spcAft>`);
  }
  if (opts.paraSpaceBefore != null) {
    children.push(`<a:spcBef><a:spcPts val="${Math.round(opts.paraSpaceBefore * 100)}"/></a:spcBef>`);
  }

  // Bullet
  const bullet = opts.bullet;
  if (bullet && bullet !== false) {
    const bOpts = typeof bullet === "object" ? bullet : {};
    if (bOpts.color) {
      children.push(`<a:buClr><a:srgbClr val="${bOpts.color}"/></a:buClr>`);
    }
    children.push(`<a:buSzPct val="100000"/>`);

    if (bOpts.type === "number") {
      children.push(`<a:buFont typeface="Arial"/>`);
      children.push(`<a:buAutoNum type="arabicPeriod"/>`);
    } else {
      // Default: bullet character
      const char = bOpts.char ?? (bOpts.code ? String.fromCodePoint(parseInt(bOpts.code, 16)) : "\u2022");
      children.push(`<a:buFont typeface="Arial" pitchFamily="34" charset="0"/>`);
      children.push(`<a:buChar char="${escXml(char)}"/>`);
    }
  }

  if (parts.length === 0 && children.length === 0) return "";

  return `<a:pPr${parts.length ? " " + parts.join(" ") : ""}>${children.join("")}</a:pPr>`;
}

function buildRunProps(opts: Record<string, any>, slide?: Slide): string {
  const attrs: string[] = ['lang="en-US"'];

  if (opts.fontSize) attrs.push(`sz="${sz100(opts.fontSize)}"`);
  if (opts.bold) attrs.push(`b="1"`);
  if (opts.italic) attrs.push(`i="1"`);
  if (opts.underline) attrs.push(`u="sng"`);
  if (opts.strike) attrs.push(`strike="sngStrike"`);
  if (opts.subscript) attrs.push(`baseline="-40000"`);
  if (opts.superscript) attrs.push(`baseline="30000"`);
  if (opts.charSpacing != null) attrs.push(`spc="${Math.round(opts.charSpacing * 100)}"`);
  attrs.push(`dirty="0"`);

  const children: string[] = [];
  if (opts.gradient) {
    children.push(buildGradientFillXml(opts.gradient));
  } else if (opts.color) {
    const alphaXml = opts.opacity != null ? `<a:alpha val="${Math.round(opts.opacity * 100000)}"/>` : "";
    children.push(`<a:solidFill><a:srgbClr val="${opts.color}">${alphaXml}</a:srgbClr></a:solidFill>`);
  }
  if (opts.fontFace) {
    children.push(`<a:latin typeface="${escXml(opts.fontFace)}"/>`);
  }
  if (opts.highlight) {
    children.push(`<a:highlight><a:srgbClr val="${opts.highlight}"/></a:highlight>`);
  }
  if (opts.textShadow) {
    const sh = typeof opts.textShadow === "object" ? opts.textShadow : {};
    const color = sh.color ?? "000000";
    const blur = Math.round((sh.blur ?? 3) * 12700); // pt to EMU
    const dist = Math.round((sh.offset ?? 2) * 12700);
    const dir = Math.round((sh.angle ?? 315) * 60000);
    children.push(
      `<a:effectLst><a:outerShdw blurRad="${blur}" dist="${dist}" dir="${dir}" algn="bl" rotWithShape="0">` +
      `<a:srgbClr val="${color}"><a:alpha val="40000"/></a:srgbClr>` +
      `</a:outerShdw></a:effectLst>`
    );
  }
  if (opts.href && slide) {
    const rId = slide._addHyperlink(opts.href);
    children.push(`<a:hlinkClick r:id="${rId}"/>`);
  } else if (opts.slideLink != null && slide) {
    const rId = slide._addSlideLink(opts.slideLink);
    children.push(`<a:hlinkClick r:id="${rId}" action="ppaction://hlinksldjump"/>`);
  }

  if (children.length > 0) {
    return `<a:rPr ${attrs.join(" ")}>${children.join("")}</a:rPr>`;
  }
  return `<a:rPr ${attrs.join(" ")}/>`;
}

// ─── Pattern fill helper ────────────────────────────────────────────

function buildPatternFillXml(pf: PatternFill): string {
  return (
    `<a:pattFill prst="${pf.pattern}">` +
    `<a:fgClr><a:srgbClr val="${pf.fgColor}"/></a:fgClr>` +
    `<a:bgClr><a:srgbClr val="${pf.bgColor}"/></a:bgClr>` +
    `</a:pattFill>`
  );
}

// ─── Line helper ────────────────────────────────────────────────────

function buildLineXml(line: LineOpts): string {
  const lw = ptEmu(line.width ?? 1);
  const dashXml = line.dashType && line.dashType !== "solid"
    ? `<a:prstDash val="${line.dashType}"/>`
    : "";
  const headXml = line.headEnd && line.headEnd !== "none"
    ? `<a:headEnd type="${line.headEnd}"/>`
    : "";
  const tailXml = line.tailEnd && line.tailEnd !== "none"
    ? `<a:tailEnd type="${line.tailEnd}"/>`
    : "";
  return (
    `<a:ln w="${lw}">` +
    `<a:solidFill><a:srgbClr val="${line.color}"/></a:solidFill>` +
    dashXml + headXml + tailXml +
    `</a:ln>`
  );
}

// ─── Shadow helper ──────────────────────────────────────────────────

function buildShadowXml(sh: ShadowOpts): string {
  const blur = ptEmu(sh.blur ?? 3);
  const dist = ptEmu(sh.offset ?? 1);
  const dir = Math.round((sh.angle ?? 45) * 60000);
  const opacPct = Math.round((sh.opacity ?? 0.1) * 100000);
  return (
    `<a:effectLst><a:outerShdw blurRad="${blur}" dist="${dist}" dir="${dir}" algn="bl" rotWithShape="0">` +
    `<a:srgbClr val="${sh.color ?? "000000"}"><a:alpha val="${opacPct}"/></a:srgbClr>` +
    `</a:outerShdw></a:effectLst>`
  );
}

// ─── Gradient fill helper ───────────────────────────────────────────

function buildGradientFillXml(grad: GradientFill): string {
  const stops = grad.stops
    .map((s) => `<a:gs pos="${Math.round(s.position * 1000)}"><a:srgbClr val="${s.color}"/></a:gs>`)
    .join("");

  let dirXml: string;
  if (grad.type === "radial") {
    dirXml = `<a:path path="circle"><a:fillToRect l="50000" t="50000" r="50000" b="50000"/></a:path>`;
  } else {
    // Linear: convert degrees to OOXML 60,000ths of a degree
    const angle = Math.round((grad.angle ?? 0) * 60000);
    dirXml = `<a:lin ang="${angle}" scaled="1"/>`;
  }

  return `<a:gradFill><a:gsLst>${stops}</a:gsLst>${dirXml}</a:gradFill>`;
}

// ─── Shape XML ──────────────────────────────────────────────────────

function buildShapeXml(
  id: number,
  name: string,
  type: string,
  opts: Record<string, any>,
): string {
  const x = emu(opts.x ?? 0);
  const y = emu(opts.y ?? 0);
  const cx = emu(opts.w ?? 1);
  const cy = emu(opts.h ?? 0);

  // Transform with optional flip
  const flipH = opts.flipH ? ' flipH="1"' : "";
  const flipV = opts.flipV ? ' flipV="1"' : "";
  const rot = opts.rotate ? ` rot="${Math.round(opts.rotate * 60000)}"` : "";
  const xfrm = `<a:xfrm${flipH}${flipV}${rot}><a:off x="${x}" y="${y}"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm>`;

  // Geometry — roundRect gets special adjustment, everything else passes through as OOXML preset
  let geom: string;
  if (type === "roundRect") {
    const radius = opts.rectRadius ?? 0.1;
    const shorter = Math.min(opts.w ?? 1, Math.max(opts.h ?? 0.001, 0.001));
    const adj = Math.round((radius / shorter) * 100000);
    geom = `<a:prstGeom prst="roundRect"><a:avLst><a:gd name="adj" fmla="val ${adj}"/></a:avLst></a:prstGeom>`;
  } else if (opts.adjustments) {
    const avLst = Object.entries(opts.adjustments)
      .map(([name, val]) => `<a:gd name="${name}" fmla="val ${val}"/>`)
      .join("");
    geom = `<a:prstGeom prst="${type}"><a:avLst>${avLst}</a:avLst></a:prstGeom>`;
  } else {
    geom = `<a:prstGeom prst="${type}"><a:avLst/></a:prstGeom>`;
  }

  // Fill
  let fill: string;
  if (type === "line") {
    fill = `<a:noFill/>`;
  } else if (opts.patternFill) {
    fill = buildPatternFillXml(opts.patternFill);
  } else if (opts.gradient) {
    fill = buildGradientFillXml(opts.gradient);
  } else if (opts.fill) {
    const opacAttr = opts.opacity != null
      ? `<a:alpha val="${Math.round(opts.opacity * 100000)}"/>`
      : "";
    fill = `<a:solidFill><a:srgbClr val="${opts.fill.color}">${opacAttr}</a:srgbClr></a:solidFill>`;
  } else {
    fill = `<a:noFill/>`;
  }

  // Line / stroke — merge shape-level lineHead/lineTail with LineOpts headEnd/tailEnd
  let line = "";
  if (opts.line) {
    const mergedLine: LineOpts = { ...opts.line };
    if (opts.lineHead && !mergedLine.headEnd) mergedLine.headEnd = opts.lineHead;
    if (opts.lineTail && !mergedLine.tailEnd) mergedLine.tailEnd = opts.lineTail;
    line = buildLineXml(mergedLine);
  }

  // Shadow
  const shadow = opts.shadow ? buildShadowXml(opts.shadow) : "";

  // Text body (optional text inside shape)
  let txBody = "";
  if (opts.text) {
    const alignMap: Record<string, string> = { left: "l", center: "ctr", right: "r", l: "l", r: "r", ctr: "ctr" };
    const vAlignMap: Record<string, string> = { top: "t", middle: "ctr", bottom: "b", t: "t", b: "b", ctr: "ctr" };
    const anchor = vAlignMap[opts.valign ?? "middle"] ?? "ctr";
    const algn = alignMap[opts.align ?? "center"] ?? "ctr";

    if (typeof opts.text === "string") {
      const rprAttrs = ['lang="en-US"', 'dirty="0"'];
      if (opts.fontSize) rprAttrs.push(`sz="${Math.round(opts.fontSize * 100)}"`);
      if (opts.bold) rprAttrs.push('b="1"');
      const children: string[] = [];
      if (opts.color) children.push(`<a:solidFill><a:srgbClr val="${opts.color}"/></a:solidFill>`);
      if (opts.fontFace) children.push(`<a:latin typeface="${escXml(opts.fontFace)}"/>`);
      const rpr = children.length > 0
        ? `<a:rPr ${rprAttrs.join(" ")}>${children.join("")}</a:rPr>`
        : `<a:rPr ${rprAttrs.join(" ")}/>`;
      txBody = `<p:txBody><a:bodyPr wrap="square" anchor="${anchor}"/><a:lstStyle/><a:p><a:pPr algn="${algn}"/><a:r>${rpr}<a:t>${escXml(opts.text)}</a:t></a:r></a:p></p:txBody>`;
    } else {
      const runsXml = opts.text.map((run: TextRun) => {
        const ro = run.options ?? {};
        const rProps = buildRunProps({ fontSize: opts.fontSize, fontFace: opts.fontFace, color: opts.color, ...ro });
        return `<a:r>${rProps}<a:t>${escXml(run.text)}</a:t></a:r>`;
      }).join("");
      txBody = `<p:txBody><a:bodyPr wrap="square" anchor="${anchor}"/><a:lstStyle/><a:p><a:pPr algn="${algn}"/>${runsXml}</a:p></p:txBody>`;
    }
  }

  return (
    `<p:sp>` +
    `<p:nvSpPr>` +
    `<p:cNvPr id="${id}" name="${escXml(name)}"/>` +
    `<p:cNvSpPr/><p:nvPr/>` +
    `</p:nvSpPr>` +
    `<p:spPr>${xfrm}${geom}${fill}${line}${shadow}</p:spPr>` +
    txBody +
    `</p:sp>`
  );
}

// ─── Picture XML ────────────────────────────────────────────────────

function buildPictureXml(
  id: number,
  name: string,
  rId: string,
  opts: Record<string, any>,
): string {
  const x = emu(opts.x ?? 0);
  const y = emu(opts.y ?? 0);
  const cx = emu(opts.w ?? 1);
  const cy = emu(opts.h ?? 1);

  // Geometry — roundRect for rounding, rect otherwise
  let geom: string;
  if (opts.rounding) {
    geom = `<a:prstGeom prst="roundRect"><a:avLst><a:gd name="adj" fmla="val 5000"/></a:avLst></a:prstGeom>`;
  } else {
    geom = `<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>`;
  }

  const descrAttr = opts.altText ? ` descr="${escXml(opts.altText)}"` : "";

  return (
    `<p:pic>` +
    `<p:nvPicPr>` +
    `<p:cNvPr id="${id}" name="${escXml(name)}"${descrAttr}/>` +
    `<p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr>` +
    `<p:nvPr/>` +
    `</p:nvPicPr>` +
    `<p:blipFill>` +
    `<a:blip r:embed="${rId}"/>` +
    (opts.crop
      ? `<a:srcRect t="${Math.round((opts.crop.top ?? 0) * 1000)}" r="${Math.round((opts.crop.right ?? 0) * 1000)}" b="${Math.round((opts.crop.bottom ?? 0) * 1000)}" l="${Math.round((opts.crop.left ?? 0) * 1000)}"/>`
      : "") +
    `<a:stretch><a:fillRect/></a:stretch>` +
    `</p:blipFill>` +
    `<p:spPr>` +
    `<a:xfrm${opts.rotate ? ` rot="${Math.round(opts.rotate * 60000)}"` : ""}>` +
    `<a:off x="${x}" y="${y}"/><a:ext cx="${cx}" cy="${cy}"/>` +
    `</a:xfrm>` +
    geom +
    (opts.line ? buildLineXml(opts.line) : "") +
    (opts.shadow ? buildShadowXml(opts.shadow) : "") +
    `</p:spPr>` +
    `</p:pic>`
  );
}

function resolveImageData(opts: Record<string, any>): { data: Buffer; ext: string; contentType: string } {
  if (opts.data) {
    // Data URI: "image/png;base64,..." or "data:image/png;base64,..."
    let raw = opts.data as string;
    let mime = "image/png";
    if (raw.startsWith("data:")) raw = raw.slice(5);
    const semiIdx = raw.indexOf(";base64,");
    if (semiIdx >= 0) {
      mime = raw.slice(0, semiIdx);
      raw = raw.slice(semiIdx + 8);
    }
    const ext = mime.includes("jpeg") || mime.includes("jpg") ? "jpg" : "png";
    return { data: Buffer.from(raw, "base64"), ext, contentType: mime };
  }
  if (opts.path) {
    const path: string = opts.path;
    const ext = path.endsWith(".jpg") || path.endsWith(".jpeg") ? "jpg" : "png";
    const contentType = ext === "jpg" ? "image/jpeg" : "image/png";
    return { data: readFileSync(path), ext, contentType };
  }
  throw new Error("addImage requires either `path` or `data`");
}

// ─── Table XML ──────────────────────────────────────────────────────

function buildTableXml(
  id: number,
  rows: any[][],
  opts: Record<string, any>,
): string {
  const x = emu(opts.x ?? 0);
  const y = emu(opts.y ?? 0);
  const cx = emu(opts.w ?? 8);
  const defaultRowH = emu(typeof opts.rowH === "number" ? opts.rowH : 0.4);
  const rowHeights: number[] = Array.isArray(opts.rowH)
    ? (opts.rowH as number[]).map((h: number) => emu(h))
    : Array(rows.length).fill(defaultRowH);

  const numCols = rows[0]?.length ?? 1;
  let colWidths: number[];
  if (opts.colW) {
    colWidths = (opts.colW as number[]).map((w: number) => emu(w));
  } else if (opts.autoColW && rows.length > 0) {
    // Calculate column widths proportional to max text length in each column
    const maxLens = Array(numCols).fill(0);
    for (const row of rows) {
      for (let col = 0; col < numCols && col < row.length; col++) {
        const cell = row[col];
        const text = typeof cell === "string" ? cell : (typeof cell.text === "string" ? cell.text : "");
        maxLens[col] = Math.max(maxLens[col], text.length);
      }
    }
    // Minimum 1 char width to avoid zero-width columns
    const totalLen = maxLens.reduce((s, l) => s + Math.max(l, 1), 0);
    colWidths = maxLens.map((l) => Math.round(cx * Math.max(l, 1) / totalLen));
  } else {
    colWidths = Array(numCols).fill(Math.round(cx / numCols));
  }

  // Table margin (cell inset) in EMU
  let cellMargin = ptEmu(4); // default
  if (opts.margin != null) {
    if (typeof opts.margin === "number") {
      cellMargin = ptEmu(opts.margin);
    } else if (Array.isArray(opts.margin)) {
      cellMargin = ptEmu(opts.margin[0]); // use first value as uniform
    }
  }

  const totalH = rowHeights.reduce((sum, h) => sum + h, 0);

  const gridCols = colWidths.map((w) => `<a:gridCol w="${w}"/>`).join("");

  const rowXmls = rows.map((row, rowIdx) => {
    const cells = row.map((cell: any) => {
      const cellObj = typeof cell === "string" ? { text: cell } : cell;
      const co = cellObj.options ?? {};

      // Cell text
      const textXml = buildCellTextXml(cellObj.text, co);

      // Cell properties
      const tcPrParts: string[] = [];
      tcPrParts.push(`marL="${cellMargin}" marR="${cellMargin}" marT="${cellMargin}" marB="${cellMargin}"`);
      if (co.valign) {
        const va: Record<string, string> = { top: "t", middle: "ctr", bottom: "b" };
        tcPrParts.push(`anchor="${va[co.valign] ?? "ctr"}"`);
      }

      const tcPrChildren: string[] = [];

      // Borders
      if (co.border) {
        tcPrChildren.push(buildCellBordersXml(co.border));
      }

      // Fill
      if (co.gradient) {
        tcPrChildren.push(buildGradientFillXml(co.gradient));
      } else if (co.fill) {
        tcPrChildren.push(`<a:solidFill><a:srgbClr val="${co.fill.color}"/></a:solidFill>`);
      }

      // Merge attributes
      const mergeAttrs: string[] = [];
      if (co.colspan && co.colspan > 1) mergeAttrs.push(`gridSpan="${co.colspan}"`);
      if (co.rowspan && co.rowspan > 1) mergeAttrs.push(`rowSpan="${co.rowspan}"`);
      if (co._hMerge) mergeAttrs.push(`hMerge="1"`);
      if (co._vMerge) mergeAttrs.push(`vMerge="1"`);

      return (
        `<a:tc${mergeAttrs.length ? " " + mergeAttrs.join(" ") : ""}>` +
        textXml +
        `<a:tcPr ${tcPrParts.join(" ")}>${tcPrChildren.join("")}</a:tcPr>` +
        `</a:tc>`
      );
    }).join("");

    return `<a:tr h="${rowHeights[rowIdx] ?? defaultRowH}">${cells}</a:tr>`;
  }).join("");

  return (
    `<p:graphicFrame>` +
    `<p:nvGraphicFramePr>` +
    `<p:cNvPr id="${id}" name="Table_${id}"/>` +
    `<p:cNvGraphicFramePr><a:graphicFrameLocks noGrp="1"/></p:cNvGraphicFramePr>` +
    `<p:nvPr/>` +
    `</p:nvGraphicFramePr>` +
    `<p:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${cx}" cy="${totalH}"/></p:xfrm>` +
    `<a:graphic>` +
    `<a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/table">` +
    `<a:tbl>` +
    `<a:tblPr firstRow="1" bandRow="1"><a:noFill/></a:tblPr>` +
    `<a:tblGrid>${gridCols}</a:tblGrid>` +
    rowXmls +
    `</a:tbl>` +
    `</a:graphicData>` +
    `</a:graphic>` +
    `</p:graphicFrame>`
  );
}

function buildCellTextXml(text: string | TextRun[], opts: Record<string, any>): string {
  const fontSize = opts.fontSize ?? 12;
  const fontFace = opts.fontFace ?? "Helvetica Neue";
  const color = opts.color ?? "333333";
  const bold = opts.bold ? ' b="1"' : "";
  const italic = opts.italic ? ' i="1"' : "";
  const align = opts.align ?? "l";
  const alignMap: Record<string, string> = { left: "l", center: "ctr", right: "r", l: "l", r: "r", ctr: "ctr" };

  const pPrChildren: string[] = [];
  if (opts.paraSpaceBefore != null) {
    pPrChildren.push(`<a:spcBef><a:spcPts val="${Math.round(opts.paraSpaceBefore * 100)}"/></a:spcBef>`);
  }
  if (opts.paraSpaceAfter != null) {
    pPrChildren.push(`<a:spcAft><a:spcPts val="${Math.round(opts.paraSpaceAfter * 100)}"/></a:spcAft>`);
  }

  // Rich text: multiple runs with individual formatting
  if (Array.isArray(text)) {
    // Split into paragraphs on breakLine
    const paragraphs: TextRun[][] = [[]];
    for (const run of text) {
      paragraphs[paragraphs.length - 1].push(run);
      if (run.options?.breakLine) paragraphs.push([]);
    }
    // Remove trailing empty paragraph
    if (paragraphs[paragraphs.length - 1].length === 0) paragraphs.pop();

    const parasXml = paragraphs.map((para) => {
      const runsXml = para.map((run) => {
        const ro = run.options ?? {};
        const rProps = buildRunProps({ fontSize, fontFace, color, ...ro });
        return `<a:r>${rProps}<a:t>${escXml(run.text)}</a:t></a:r>`;
      }).join("");
      return `<a:p><a:pPr algn="${alignMap[align] ?? "l"}">${pPrChildren.join("")}</a:pPr>${runsXml}</a:p>`;
    }).join("");

    return `<a:txBody><a:bodyPr/><a:lstStyle/>${parasXml}</a:txBody>`;
  }

  return (
    `<a:txBody>` +
    `<a:bodyPr/>` +
    `<a:lstStyle/>` +
    `<a:p>` +
    `<a:pPr algn="${alignMap[align] ?? "l"}">${pPrChildren.join("")}</a:pPr>` +
    `<a:r>` +
    `<a:rPr lang="en-US" sz="${sz100(fontSize)}"${bold}${italic} dirty="0">` +
    `<a:solidFill><a:srgbClr val="${color}"/></a:solidFill>` +
    `<a:latin typeface="${escXml(fontFace)}"/>` +
    `</a:rPr>` +
    `<a:t>${escXml(text)}</a:t>` +
    `</a:r>` +
    `</a:p>` +
    `</a:txBody>`
  );
}

function buildCellBordersXml(borders: TableBorderOpts[]): string {
  // borders: [top, right, bottom, left]
  const names = ["Top", "Right", "Bottom", "Left"];
  return names.map((side, i) => {
    const b = borders[i];
    if (!b || b.type === "none") {
      return `<a:ln${side === "Top" ? "T" : side === "Right" ? "R" : side === "Bottom" ? "B" : "L"}><a:noFill/></a:ln${side === "Top" ? "T" : side === "Right" ? "R" : side === "Bottom" ? "B" : "L"}>`;
    }
    const w = ptEmu(b.pt ?? 1);
    const tag = side === "Top" ? "T" : side === "Right" ? "R" : side === "Bottom" ? "B" : "L";
    return (
      `<a:ln${tag} w="${w}">` +
      `<a:solidFill><a:srgbClr val="${b.color ?? "000000"}"/></a:solidFill>` +
      `</a:ln${tag}>`
    );
  }).join("");
}

// ─── Connector XML ──────────────────────────────────────────────────

function buildConnectorXml(
  conn: ConnectorDef,
  fromId: number,
  toId: number,
  id: number,
): string {
  const fromX = emu(conn.from.x);
  const fromY = emu(conn.from.y);
  const toX = emu(conn.to.x);
  const toY = emu(conn.to.y);

  const lineW = ptEmu(conn.width);
  const headMap: Record<string, string> = { arrow: "triangle", stealth: "stealth", triangle: "triangle", none: "none" };
  const headType = headMap[conn.head] ?? "triangle";
  const tailType = headMap[conn.tail] ?? "none";

  if (conn.type === "curved") {
    return buildCurvedArcXml(conn, fromX, fromY, toX, toY, id, lineW, headType);
  }

  // Straight or elbow connector
  const x = Math.min(fromX, toX);
  const y = Math.min(fromY, toY);
  const cx = Math.abs(toX - fromX);
  const cy = Math.abs(toY - fromY);
  const flipH = toX < fromX ? ' flipH="1"' : "";
  const flipV = toY < fromY ? ' flipV="1"' : "";

  const presetMap: Record<string, string> = { straight: "straightConnector1", elbow: "bentConnector3" };
  const preset = presetMap[conn.type] ?? "straightConnector1";
  const avLst = conn.type === "elbow"
    ? `<a:avLst><a:gd name="adj1" fmla="val 50000"/></a:avLst>`
    : `<a:avLst/>`;

  return (
    `<p:cxnSp>` +
    `<p:nvCxnSpPr>` +
    `<p:cNvPr id="${id}" name="Connector ${id}"/>` +
    `<p:cNvCxnSpPr>` +
    `<a:cxnSpLocks noChangeShapeType="1"/>` +
    `<a:stCxn id="${fromId}" idx="${conn.from.idx}"/>` +
    `<a:endCxn id="${toId}" idx="${conn.to.idx}"/>` +
    `</p:cNvCxnSpPr>` +
    `<p:nvPr/>` +
    `</p:nvCxnSpPr>` +
    `<p:spPr>` +
    `<a:xfrm${flipH}${flipV}>` +
    `<a:off x="${Math.round(x)}" y="${Math.round(y)}"/>` +
    `<a:ext cx="${Math.round(cx)}" cy="${Math.round(cy)}"/>` +
    `</a:xfrm>` +
    `<a:prstGeom prst="${preset}">${avLst}</a:prstGeom>` +
    `<a:ln w="${lineW}">` +
    `<a:solidFill><a:srgbClr val="${conn.color}"/></a:solidFill>` +
    `<a:headEnd type="${tailType}"/>` +
    `<a:tailEnd type="${headType}"/>` +
    `</a:ln>` +
    `</p:spPr>` +
    `</p:cxnSp>`
  );
}

function buildCurvedArcXml(
  conn: ConnectorDef,
  fromX: number, fromY: number, toX: number, toY: number,
  id: number, lineW: number, headType: string,
): string {
  const arcBow = Math.round(0.7 * EMU);
  const arcOffX = Math.round(Math.max(fromX, toX));
  const arcOffY = Math.round(Math.min(fromY, toY));
  const arcCx = arcBow;
  const arcCy = Math.round(Math.abs(toY - fromY));
  const cpBow = arcBow;
  const cp1y = Math.round(arcCy * 0.75);
  const cp2y = Math.round(arcCy * 0.25);
  const goingUp = fromY > toY;
  const pathStartY = goingUp ? arcCy : 0;
  const pathEndY = goingUp ? 0 : arcCy;
  const cpA_y = goingUp ? cp1y : cp2y;
  const cpB_y = goingUp ? cp2y : cp1y;

  return (
    `<p:sp>` +
    `<p:nvSpPr>` +
    `<p:cNvPr id="${id}" name="Arc ${id}"/>` +
    `<p:cNvSpPr/><p:nvPr/>` +
    `</p:nvSpPr>` +
    `<p:spPr>` +
    `<a:xfrm><a:off x="${arcOffX}" y="${arcOffY}"/><a:ext cx="${arcCx}" cy="${arcCy}"/></a:xfrm>` +
    `<a:custGeom><a:avLst/><a:gdLst/><a:ahLst/><a:cxnLst/>` +
    `<a:rect l="0" t="0" r="${arcCx}" b="${arcCy}"/>` +
    `<a:pathLst><a:path w="${arcCx}" h="${arcCy}">` +
    `<a:moveTo><a:pt x="0" y="${pathStartY}"/></a:moveTo>` +
    `<a:cubicBezTo>` +
    `<a:pt x="${cpBow}" y="${cpA_y}"/>` +
    `<a:pt x="${cpBow}" y="${cpB_y}"/>` +
    `<a:pt x="0" y="${pathEndY}"/>` +
    `</a:cubicBezTo>` +
    `</a:path></a:pathLst></a:custGeom>` +
    `<a:noFill/>` +
    `<a:ln w="${lineW}">` +
    `<a:solidFill><a:srgbClr val="${conn.color}"/></a:solidFill>` +
    `<a:tailEnd type="${headType}"/>` +
    `</a:ln>` +
    `</p:spPr>` +
    `</p:sp>`
  );
}

function buildConnectorLabelXml(
  conn: ConnectorDef,
  id: number,
  sansFont: string,
): string {
  const fromX = emu(conn.from.x);
  const fromY = emu(conn.from.y);
  const toX = emu(conn.to.x);
  const toY = emu(conn.to.y);

  let labelX: number, labelY: number;
  if (conn.type === "curved") {
    labelX = Math.max(fromX, toX) + emu(0.6);
    labelY = (fromY + toY) / 2 - emu(0.15);
  } else {
    labelX = (fromX + toX) / 2;
    labelY = (fromY + toY) / 2 - emu(0.25);
  }
  const labelW = emu(1.0);
  const labelH = emu(0.35);
  const italic = conn.labelItalic !== false ? ' i="1"' : "";

  return (
    `<p:sp>` +
    `<p:nvSpPr>` +
    `<p:cNvPr id="${id}" name="Label ${id}"/>` +
    `<p:cNvSpPr txBox="1"/><p:nvPr/>` +
    `</p:nvSpPr>` +
    `<p:spPr>` +
    `<a:xfrm><a:off x="${Math.round(labelX)}" y="${Math.round(labelY)}"/><a:ext cx="${labelW}" cy="${labelH}"/></a:xfrm>` +
    `<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>` +
    `<a:noFill/>` +
    `</p:spPr>` +
    `<p:txBody>` +
    `<a:bodyPr wrap="square" rtlCol="0"/>` +
    `<a:lstStyle/>` +
    `<a:p><a:r>` +
    `<a:rPr lang="en-US" sz="1400"${italic} dirty="0">` +
    `<a:solidFill><a:srgbClr val="${conn.color}"/></a:solidFill>` +
    `<a:latin typeface="${escXml(sansFont)}"/>` +
    `</a:rPr>` +
    `<a:t>${escXml(conn.label ?? "")}</a:t>` +
    `</a:r></a:p>` +
    `</p:txBody>` +
    `</p:sp>`
  );
}

// ─── Footer text box ────────────────────────────────────────────────

function buildFooterTextBox(
  id: number,
  name: string,
  x: number, y: number, w: number, h: number,
  align: "l" | "r" | "ctr",
  text: string,
  style: { font: string; size: number; color: string },
): string {
  return (
    `<p:sp>` +
    `<p:nvSpPr>` +
    `<p:cNvPr id="${id}" name="${name}"/>` +
    `<p:cNvSpPr txBox="1"/><p:nvPr/>` +
    `</p:nvSpPr>` +
    `<p:spPr>` +
    `<a:xfrm><a:off x="${emu(x)}" y="${emu(y)}"/><a:ext cx="${emu(w)}" cy="${emu(h)}"/></a:xfrm>` +
    `<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>` +
    `<a:noFill/>` +
    `</p:spPr>` +
    `<p:txBody>` +
    `<a:bodyPr wrap="square" lIns="0" tIns="0" rIns="0" bIns="0" anchor="b"/>` +
    `<a:lstStyle/>` +
    `<a:p><a:pPr algn="${align}"/>` +
    `<a:r>` +
    `<a:rPr lang="en-US" sz="${sz100(style.size)}" dirty="0">` +
    `<a:solidFill><a:srgbClr val="${style.color}"/></a:solidFill>` +
    `<a:latin typeface="${escXml(style.font)}"/>` +
    `</a:rPr>` +
    `<a:t>${escXml(text)}</a:t>` +
    `</a:r></a:p>` +
    `</p:txBody>` +
    `</p:sp>`
  );
}

// ─── Slide transitions ─────────────────────────────────────────────

function buildTransitionXml(opts: TransitionOpts): string {
  const dur = opts.duration ?? 700;
  const advAttr = opts.advanceAfter != null ? ` advTm="${opts.advanceAfter}"` : "";

  // Map transition types to OOXML elements
  const typeMap: Record<TransitionType, string> = {
    fade: `<p:fade/>`,
    push: `<p:push/>`,
    wipe: `<p:wipe/>`,
    cover: `<p:cover/>`,
    split: `<p:split/>`,
    cut: `<p:cut/>`,
  };

  const inner = typeMap[opts.type] ?? `<p:fade/>`;
  return `<p:transition spd="${dur <= 500 ? "fast" : dur <= 1000 ? "med" : "slow"}"${advAttr}>${inner}</p:transition>`;
}

// ─── Timing / build animations ──────────────────────────────────────

function buildTimingXml(spid: string, paragraphCount: number): string {
  let nextId = 1;
  const id = () => nextId++;

  const bulletPars: string[] = [];
  for (let p = 0; p < paragraphCount; p++) {
    const parId = id(), innerParId = id(), bhvrId = id();
    bulletPars.push(
      `<p:par><p:cTn id="${parId}" fill="hold">` +
      `<p:stCondLst><p:cond delay="0"/></p:stCondLst>` +
      `<p:childTnLst><p:par><p:cTn id="${innerParId}" fill="hold">` +
      `<p:stCondLst><p:cond delay="0"/></p:stCondLst>` +
      `<p:childTnLst><p:set><p:cBhvr>` +
      `<p:cTn id="${bhvrId}" dur="1" fill="hold">` +
      `<p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn>` +
      `<p:tgtEl><p:spTgt spid="${spid}">` +
      `<p:txEl><p:pRg st="${p}" end="${p}"/></p:txEl>` +
      `</p:spTgt></p:tgtEl>` +
      `<p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst>` +
      `</p:cBhvr><p:to><p:strVal val="visible"/></p:to></p:set>` +
      `</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>`,
    );
  }

  const rootId = id(), seqId = id();
  return (
    `<p:timing><p:tnLst><p:par>` +
    `<p:cTn id="${rootId}" dur="indefinite" restart="never" nodeType="tmRoot">` +
    `<p:childTnLst><p:seq concurrent="1" nextAc="seek">` +
    `<p:cTn id="${seqId}" dur="indefinite" nodeType="mainSeq">` +
    `<p:childTnLst>${bulletPars.join("")}</p:childTnLst></p:cTn>` +
    `<p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>` +
    `<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst>` +
    `</p:seq></p:childTnLst></p:cTn>` +
    `</p:par></p:tnLst></p:timing>`
  );
}

// ─── Emoji bullet patching ──────────────────────────────────────────

function patchEmojiBulletsInXml(
  shapeXml: string,
  def: EmojiDef,
  slide: Slide,
): string {
  const paragraphs = [...shapeXml.matchAll(/<a:p>[\s\S]*?<\/a:p>/g)];

  let result = shapeXml;
  for (let bi = 0; bi < def.bulletIndices.length; bi++) {
    const paraIdx = def.bulletIndices[bi];
    if (paraIdx >= paragraphs.length) continue;

    const paraXml = paragraphs[paraIdx][0];

    // Embed PNG as media file
    slide._mediaCounter++;
    const fileName = `emoji_s${slide._slideIndex + 1}_${slide._mediaCounter}.png`;
    const rId = `rIdEmoji${slide._mediaCounter}`;

    const pngData = def.emojiPngs[bi];
    const base64 = pngData.replace(/^image\/png;base64,/, "").replace(/^data:image\/png;base64,/, "");
    slide._images.push({
      rId,
      fileName,
      data: Buffer.from(base64, "base64"),
      contentType: "image/png",
    });

    // Replace bullet char/font/autonum with buBlip
    let newParaXml = paraXml;
    newParaXml = newParaXml.replace(/<a:buFont[^/]*\/>/g, "");
    newParaXml = newParaXml.replace(/<a:buChar[^/]*\/>/g, "");
    newParaXml = newParaXml.replace(/<a:buAutoNum[^/]*\/>/g, "");

    const buBlipXml =
      `<a:buSzPct val="100000"/>` +
      `<a:buBlip>` +
      `<a:blip xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:embed="${rId}"/>` +
      `</a:buBlip>`;

    if (newParaXml.includes("</a:pPr>")) {
      newParaXml = newParaXml.replace("</a:pPr>", buBlipXml + "</a:pPr>");
    }

    result = result.replace(paraXml, newParaXml);
  }
  return result;
}

// ─── Shape grouping ─────────────────────────────────────────────────

function extractElement(xml: string, objectName: string, tag: string): string | null {
  const nameStr = `name="${objectName}"`;
  const nameIdx = xml.indexOf(nameStr);
  if (nameIdx === -1) return null;

  const openTag = `<${tag}`;
  const closeTag = `</${tag}>`;

  let start = nameIdx;
  while (start > 0) {
    if (xml.startsWith(openTag, start)) {
      const ch = xml[start + openTag.length];
      if (ch === ">" || ch === " ") break;
    }
    start--;
  }

  let end = nameIdx;
  while (end < xml.length) {
    if (xml.startsWith(closeTag, end)) { end += closeTag.length; break; }
    end++;
  }

  if (start === 0 && !xml.startsWith(openTag + ">") && !xml.startsWith(openTag + " ")) return null;
  return xml.substring(start, end);
}

function applyCodeBlockGrouping(slide: Slide): void {
  // Combine all elements into a single string for grouping
  let allXml = slide._elements.join("\n<!SPLIT!>\n");

  const groupIds = new Set<string>();
  const namePattern = /name="cb-(\d+)-bg"/g;
  let m;
  while ((m = namePattern.exec(allXml)) !== null) groupIds.add(m[1]);
  if (groupIds.size === 0) return;

  for (const gid of groupIds) {
    const parts = ["bg", "label", "rule", "code"];
    const shapes: string[] = [];

    for (const part of parts) {
      const shapeXml = extractElement(allXml, `cb-${gid}-${part}`, "p:sp");
      if (shapeXml) {
        allXml = allXml.replace(shapeXml, "");
        shapes.push(shapeXml);
      }
    }
    if (shapes.length === 0) continue;

    const offMatch = shapes[0].match(/<a:off x="(\d+)" y="(\d+)"/);
    const extMatch = shapes[0].match(/<a:ext cx="(\d+)" cy="(\d+)"/);
    if (!offMatch || !extMatch) continue;

    const gx = offMatch[1], gy = offMatch[2], gcx = extMatch[1], gcy = extMatch[2];
    const grpId = slide._allocId();

    const grpXml =
      `<p:grpSp>` +
      `<p:nvGrpSpPr>` +
      `<p:cNvPr id="${grpId}" name="CodeBlock ${gid}"/>` +
      `<p:cNvGrpSpPr><a:grpSpLocks noChangeAspect="0"/></p:cNvGrpSpPr>` +
      `<p:nvPr/>` +
      `</p:nvGrpSpPr>` +
      `<p:grpSpPr><a:xfrm>` +
      `<a:off x="${gx}" y="${gy}"/><a:ext cx="${gcx}" cy="${gcy}"/>` +
      `<a:chOff x="${gx}" y="${gy}"/><a:chExt cx="${gcx}" cy="${gcy}"/>` +
      `</a:xfrm></p:grpSpPr>` +
      shapes.join("") +
      `</p:grpSp>`;

    allXml += "\n<!SPLIT!>\n" + grpXml;
  }

  slide._elements = allXml.split("\n<!SPLIT!>\n").filter(Boolean);
}

function applyCalloutGrouping(slide: Slide): void {
  let allXml = slide._elements.join("\n<!SPLIT!>\n");

  const groupIds = new Set<string>();
  const namePattern = /name="co-(\d+)-bg"/g;
  let m;
  while ((m = namePattern.exec(allXml)) !== null) groupIds.add(m[1]);
  if (groupIds.size === 0) return;

  for (const gid of groupIds) {
    const shapes: string[] = [];

    const bgXml = extractElement(allXml, `co-${gid}-bg`, "p:sp");
    if (bgXml) { allXml = allXml.replace(bgXml, ""); shapes.push(bgXml); }

    const iconXml = extractElement(allXml, `co-${gid}-icon`, "p:pic");
    if (iconXml) { allXml = allXml.replace(iconXml, ""); shapes.push(iconXml); }

    if (shapes.length < 2) {
      for (const s of shapes) allXml += "\n<!SPLIT!>\n" + s;
      continue;
    }

    const offMatch = shapes[0].match(/<a:off x="(\d+)" y="(\d+)"/);
    const extMatch = shapes[0].match(/<a:ext cx="(\d+)" cy="(\d+)"/);
    if (!offMatch || !extMatch) continue;

    const gx = offMatch[1], gy = offMatch[2], gcx = extMatch[1], gcy = extMatch[2];
    const grpId = slide._allocId();

    const grpXml =
      `<p:grpSp>` +
      `<p:nvGrpSpPr>` +
      `<p:cNvPr id="${grpId}" name="Callout ${gid}"/>` +
      `<p:cNvGrpSpPr><a:grpSpLocks noChangeAspect="0"/></p:cNvGrpSpPr>` +
      `<p:nvPr/>` +
      `</p:nvGrpSpPr>` +
      `<p:grpSpPr><a:xfrm>` +
      `<a:off x="${gx}" y="${gy}"/><a:ext cx="${gcx}" cy="${gcy}"/>` +
      `<a:chOff x="${gx}" y="${gy}"/><a:chExt cx="${gcx}" cy="${gcy}"/>` +
      `</a:xfrm></p:grpSpPr>` +
      shapes.join("") +
      `</p:grpSp>`;

    allXml += "\n<!SPLIT!>\n" + grpXml;
  }

  slide._elements = allXml.split("\n<!SPLIT!>\n").filter(Boolean);
}
