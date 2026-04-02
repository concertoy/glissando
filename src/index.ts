/**
 * glissando — component-based slide decks for coding agents.
 *
 * Usage:
 *   import { Deck } from "../../src/index.js";
 *   import { claudeDoc } from "../../src/themes/claude-doc/index.js";
 *
 *   const deck = new Deck(claudeDoc);
 *   deck.title({ title: "Hello", subtitle: "World" });
 *   deck.content({ title: "Points", bullets: ["A", "B", "C"] });
 *   await deck.save("output.pptx");
 */

import { Presentation, Slide } from "./ooxml/index.js";
import type {
  Theme,
  FontPreset,
  TitleLayoutProps,
  SectionLayoutProps,
  ContentLayoutProps,
  TwoColumnLayoutProps,
  CodeLayoutProps,
  QuoteLayoutProps,
  ImageLayoutProps,
  TableLayoutProps,
  EquationLayoutProps,
  BlankLayoutProps,
  ConnectorProps,
  ConnectionPoint,
  ConnectorDef,
  EmojiDef,
  PendingWork,
  FooterConfig,
  FooterDef,
  BibEntry,
  AnimationDef,
} from "./types.js";
import { renderEmoji } from "./emoji.js";
import { formatCitations } from "./citation.js";
import {
  contentArea as _contentArea,
  contentAreaBelow as _contentAreaBelow,
} from "./layout.js";

export type { Theme, ShapeRef, ConnectionPoint, Rect, FontPreset } from "./types.js";
export { Presentation, Slide, GroupShape, shapePresets } from "./ooxml/index.js";
export type { TextRun, TextRunOpts, BulletOpts, AddTextOpts, AddShapeOpts, AddImageOpts, AddFreeformOpts, PathSegment, AddTableOpts, TableCell, TableBorderOpts, TransitionOpts, TransitionType, GradientFill, GradientStop, PatternFill, FillOpts, LineOpts, LineEndType, ShadowOpts, PresentationDefaults, ShapeAnimationOpts } from "./ooxml/index.js";
export { contentArea, contentAreaBelow, columns, rows, below, inset } from "./layout.js";
export { expandTextWithMath } from "./inline-math.js";

/** Create a new theme with a font preset applied (immutable — does not modify original). */
export function applyPreset(theme: Theme, preset: FontPreset): Theme {
  return {
    ...theme,
    config: {
      ...theme.config,
      fonts: { ...preset.fonts },
      sizes: { ...preset.sizes },
      ...(preset.codeStyle ? { codeStyle: { ...preset.codeStyle } } : {}),
    },
  };
}

/** Add speaker notes to a slide. String for plain text, TextRun[] for rich formatting. */
export function speakerNote(slide: Slide, text: string | import("./ooxml/index.js").TextRun[]): void {
  slide.addNotes(text);
}

export class Deck {
  private pres: Presentation;
  private theme: Theme;
  private boundComponents: ReturnType<Theme["createComponents"]>;
  private _connectorDefs: ConnectorDef[] = [];
  private _emojiDefs: EmojiDef[] = [];
  private _animationDefs: AnimationDef[] = [];
  private _pending: PendingWork = { promises: [] };
  private _slideCount = 0;
  private _footerConfig: FooterConfig | null = null;
  private _bibEntries: Map<string, BibEntry> = new Map();
  private _slideCitations: Map<number, string[]> = new Map();

  constructor(theme: Theme) {
    this.theme = theme;
    this.pres = new Presentation();

    // Create components bound to this theme's config (respects presets)
    // Pass emoji defs accumulator and pending work tracker so components can queue async work
    this.boundComponents = theme.createComponents(theme.config, this._emojiDefs, this._pending, this._animationDefs);

    const { slideWidth, slideHeight } = theme.config.spacing;
    this.pres.defineLayout({ name: "CUSTOM", width: slideWidth, height: slideHeight });
    this.pres.layout = "CUSTOM";

    // Set theme fonts for OOXML theme1.xml
    this.pres.theme = {
      headFontFace: theme.config.fonts.heading,
      bodyFontFace: theme.config.fonts.sans,
    };
  }

  /** Dark-background opening or closing slide. */
  title(props: TitleLayoutProps): this {
    const slide = this.theme.layouts.title(this.pres, this.theme.config, this.boundComponents, props);
    if (props.notes) slide.addNotes(props.notes);
    this._slideCount++;
    return this;
  }

  /** Section divider with warm accent background. */
  section(props: SectionLayoutProps): this {
    const slide = this.theme.layouts.section(this.pres, this.theme.config, this.boundComponents, props);
    if (props.notes) slide.addNotes(props.notes);
    this._slideCount++;
    return this;
  }

  /** Standard content slide with heading + bullet list. */
  content(props: ContentLayoutProps): this {
    const slide = this.theme.layouts.content(this.pres, this.theme.config, this.boundComponents, props);
    if (props.notes) slide.addNotes(props.notes);
    this._slideCount++;
    return this;
  }

  /** Two-column comparison slide. */
  twoColumn(props: TwoColumnLayoutProps): this {
    const slide = this.theme.layouts.twoColumn(this.pres, this.theme.config, this.boundComponents, props);
    if (props.notes) slide.addNotes(props.notes);
    this._slideCount++;
    return this;
  }

  /** Code slide with dark code panel. */
  code(props: CodeLayoutProps): this {
    const slide = this.theme.layouts.code(this.pres, this.theme.config, this.boundComponents, props);
    if (props.notes) slide.addNotes(props.notes);
    this._slideCount++;
    return this;
  }

  /** Large quote with attribution. */
  quote(props: QuoteLayoutProps): this {
    const slide = this.theme.layouts.quote(this.pres, this.theme.config, this.boundComponents, props);
    if (props.notes) slide.addNotes(props.notes);
    this._slideCount++;
    return this;
  }

  /** Image slide with title and caption. */
  image(props: ImageLayoutProps): this {
    const slide = this.theme.layouts.image(this.pres, this.theme.config, this.boundComponents, props);
    if (props.notes) slide.addNotes(props.notes);
    this._slideCount++;
    return this;
  }

  /** Table slide with themed headers. */
  table(props: TableLayoutProps): this {
    const slide = this.theme.layouts.table(this.pres, this.theme.config, this.boundComponents, props);
    if (props.notes) slide.addNotes(props.notes);
    this._slideCount++;
    return this;
  }

  /** Equation slide with rendered LaTeX. */
  async equation(props: EquationLayoutProps): Promise<this> {
    const slide = await this.theme.layouts.equation(this.pres, this.theme.config, this.boundComponents, props);
    if (props.notes) slide.addNotes(props.notes);
    this._slideCount++;
    return this;
  }

  /** Empty slide for custom content. Returns the raw Slide. */
  blank(props?: BlankLayoutProps): Slide {
    const slide = this.pres.addSlide();
    const bgMap = {
      primary: this.theme.config.colors.bgPrimary,
      dark: this.theme.config.colors.bgDark,
      accent: this.theme.config.colors.bgAccent,
    };
    slide.background = { color: bgMap[(props?.bg) ?? "primary"] };
    if (props?.notes) slide.addNotes(props.notes);
    this._slideCount++;
    return slide;
  }

  /** Connect two shapes with a native OOXML connector (moves with shapes on drag). */
  connector(props: ConnectorProps): this {
    this._connectorDefs.push({
      slideIndex: this._slideCount, // current slide (1-indexed)
      from: props.from,
      to: props.to,
      type: props.type ?? "straight",
      color: props.color ?? this.theme.config.colors.textMuted,
      width: props.width ?? 1,
      head: props.head ?? "arrow",
      tail: props.tail ?? "none",
      label: props.label,
      labelItalic: props.labelItalic ?? true,
    });
    return this;
  }

  /**
   * Connect two shapes by objectName. Auto-picks connection points
   * (right side of source → left side of target by default).
   */
  connect(fromName: string, toName: string, opts?: {
    type?: "straight" | "elbow" | "curved";
    fromSide?: "top" | "right" | "bottom" | "left";
    toSide?: "top" | "right" | "bottom" | "left";
    color?: string;
    width?: number;
    head?: "arrow" | "stealth" | "triangle" | "none";
    tail?: "arrow" | "stealth" | "triangle" | "none";
    label?: string;
    labelItalic?: boolean;
  }): this {
    const sideIdx: Record<string, number> = { top: 0, right: 1, bottom: 2, left: 3 };
    const fromIdx = sideIdx[opts?.fromSide ?? "right"];
    const toIdx = sideIdx[opts?.toSide ?? "left"];
    // ConnectionPoints with x/y=0; the OOXML writer resolves real positions from _shapeName + idx
    const from: ConnectionPoint = { x: 0, y: 0, idx: fromIdx, _shapeName: fromName };
    const to: ConnectionPoint = { x: 0, y: 0, idx: toIdx, _shapeName: toName };
    return this.connector({
      from, to,
      type: opts?.type,
      color: opts?.color,
      width: opts?.width,
      head: opts?.head,
      tail: opts?.tail,
      label: opts?.label,
      labelItalic: opts?.labelItalic,
    });
  }

  /** Duplicate an existing slide (1-based index). Returns this for chaining. */
  duplicate(slideIndex: number): this {
    this.pres.duplicateSlide(slideIndex - 1);
    this._slideCount++;
    return this;
  }

  /** Move a slide from one position to another (1-based indices). */
  moveSlide(from: number, to: number): this {
    this.pres.moveSlide(from - 1, to - 1);
    return this;
  }

  /** Remove a slide at the given position (1-based index). */
  removeSlide(slideIndex: number): this {
    this.pres.removeSlide(slideIndex - 1);
    this._slideCount--;
    return this;
  }

  /** Set presentation metadata (title, author, subject, keywords). */
  metadata(meta: { title?: string; author?: string; subject?: string; keywords?: string }): this {
    this.pres.setMetadata(meta);
    return this;
  }

  /** Add a named section. All slides added after this call belong to this section. */
  addSection(name: string): this {
    this.pres.addSection(name);
    return this;
  }

  /** Get the current number of slides. */
  get slideCount(): number {
    return this._slideCount;
  }

  /** Access the underlying Presentation instance for advanced use. */
  get raw(): Presentation {
    return this.pres;
  }

  /** Access the theme's components for custom slide building. */
  get components() {
    return this.boundComponents;
  }

  /** Access the theme config (colors, fonts, sizes). */
  get config() {
    return this.theme.config;
  }

  /** Full usable area inside slide margins. */
  area() {
    return _contentArea(this.theme.config.spacing);
  }

  /** Content area below a standard heading + accent bar. */
  contentArea() {
    return _contentAreaBelow(this.theme.config.spacing);
  }

  /** Render an emoji to a base64 PNG data URI (for use with addImage). */
  async emoji(name: string, size?: number): Promise<string> {
    return renderEmoji(name, this.theme.config.emojiSet, size);
  }

  /** Export all speaker notes as markdown (one section per slide). */
  exportNotes(): string {
    const lines: string[] = [];
    for (let i = 0; i < this.pres._slides.length; i++) {
      const slide = this.pres._slides[i];
      const notes = slide._notes;
      if (!notes) continue;
      lines.push(`## Slide ${i + 1}`);
      if (typeof notes === "string") {
        lines.push(notes);
      } else {
        lines.push(notes.map(r => r.text).join(""));
      }
      lines.push("");
    }
    return lines.join("\n");
  }

  /** Configure slide numbering, static footer text, and citation style. */
  footer(config: FooterConfig): this {
    this._footerConfig = config;
    return this;
  }

  /** Register a bibliography entry for citation formatting. */
  bib(key: string, entry: BibEntry): this {
    this._bibEntries.set(key, entry);
    return this;
  }

  /** Cite references on the most recently created slide. */
  cite(...keys: string[]): this {
    const idx = this._slideCount; // current slide (1-based)
    const existing = this._slideCitations.get(idx) ?? [];
    this._slideCitations.set(idx, [...existing, ...keys]);
    return this;
  }

  /** Write the deck to a .pptx file. */
  async save(path: string): Promise<void> {
    // Wait for any pending async work from sync components (e.g. emoji renders)
    if (this._pending.promises.length > 0) {
      await Promise.all(this._pending.promises);
      this._pending.promises = [];
    }

    // Build footer defs from config + bibliography + per-slide citations
    const footerDefs: FooterDef[] = [];
    if (this._footerConfig) {
      const skip = new Set(this._footerConfig.skip ?? []);
      for (let i = 1; i <= this._slideCount; i++) {
        if (skip.has(i)) continue;
        const def: FooterDef = { slideIndex: i - 1 };
        if (this._footerConfig.slideNumber) {
          def.slideNumber = this._footerConfig.slideNumberFormat === "n"
            ? `${i}` : `${i} / ${this._slideCount}`;
        }
        if (this._footerConfig.text) def.text = this._footerConfig.text;
        const citeKeys = this._slideCitations.get(i);
        if (citeKeys?.length) {
          def.citations = formatCitations(
            citeKeys, this._bibEntries,
            this._footerConfig.citationStyle ?? "author-year",
          );
        }
        footerDefs.push(def);
      }
    }

    // Apply all deferred processing (connectors, emojis, animations, footers, grouping)
    this.pres.applyExtras({
      connectorDefs: this._connectorDefs,
      emojiDefs: this._emojiDefs,
      animationDefs: this._animationDefs,
      footerDefs,
      footerStyle: {
        spacing: this.theme.config.spacing,
        font: this.theme.config.fonts.sans,
        size: this.theme.config.sizes.caption,
        color: this.theme.config.colors.textMuted,
      },
    });

    await this.pres.writeFile({ fileName: path });
  }
}
