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

import PptxGenJS from "pptxgenjs";
import { patchPptx } from "./pptx-patch.js";
import type {
  Theme,
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
  ConnectorDef,
  EmojiDef,
  PendingWork,
} from "./types.js";
import { renderEmoji } from "./emoji.js";

export type { Theme, ShapeRef, ConnectionPoint } from "./types.js";

export class Deck {
  private pres: PptxGenJS;
  private theme: Theme;
  private boundComponents: ReturnType<Theme["createComponents"]>;
  private _connectorDefs: ConnectorDef[] = [];
  private _emojiDefs: EmojiDef[] = [];
  private _pending: PendingWork = { promises: [] };
  private _slideCount = 0;

  constructor(theme: Theme) {
    this.theme = theme;
    this.pres = new PptxGenJS();

    // Create components bound to this theme's config (respects presets)
    // Pass emoji defs accumulator and pending work tracker so components can queue async work
    this.boundComponents = theme.createComponents(theme.config, this._emojiDefs, this._pending);

    const { slideWidth, slideHeight } = theme.config.spacing;
    this.pres.defineLayout({ name: "CUSTOM", width: slideWidth, height: slideHeight });
    this.pres.layout = "CUSTOM";

    // Override pptxgenjs default theme fonts (Calibri/Calibri Light)
    this.pres.theme = {
      headFontFace: theme.config.fonts.heading,
      bodyFontFace: theme.config.fonts.sans,
    };
  }

  /** Dark-background opening or closing slide. */
  title(props: TitleLayoutProps): this {
    this.theme.layouts.title(this.pres, this.theme.config, this.boundComponents, props);
    this._slideCount++;
    return this;
  }

  /** Section divider with warm accent background. */
  section(props: SectionLayoutProps): this {
    this.theme.layouts.section(this.pres, this.theme.config, this.boundComponents, props);
    this._slideCount++;
    return this;
  }

  /** Standard content slide with heading + bullet list. */
  content(props: ContentLayoutProps): this {
    this.theme.layouts.content(this.pres, this.theme.config, this.boundComponents, props);
    this._slideCount++;
    return this;
  }

  /** Two-column comparison slide. */
  twoColumn(props: TwoColumnLayoutProps): this {
    this.theme.layouts.twoColumn(this.pres, this.theme.config, this.boundComponents, props);
    this._slideCount++;
    return this;
  }

  /** Code slide with dark code panel. */
  code(props: CodeLayoutProps): this {
    this.theme.layouts.code(this.pres, this.theme.config, this.boundComponents, props);
    this._slideCount++;
    return this;
  }

  /** Large quote with attribution. */
  quote(props: QuoteLayoutProps): this {
    this.theme.layouts.quote(this.pres, this.theme.config, this.boundComponents, props);
    this._slideCount++;
    return this;
  }

  /** Image slide with title and caption. */
  image(props: ImageLayoutProps): this {
    this.theme.layouts.image(this.pres, this.theme.config, this.boundComponents, props);
    this._slideCount++;
    return this;
  }

  /** Table slide with themed headers. */
  table(props: TableLayoutProps): this {
    this.theme.layouts.table(this.pres, this.theme.config, this.boundComponents, props);
    this._slideCount++;
    return this;
  }

  /** Equation slide with rendered LaTeX. */
  async equation(props: EquationLayoutProps): Promise<this> {
    await this.theme.layouts.equation(this.pres, this.theme.config, this.boundComponents, props);
    this._slideCount++;
    return this;
  }

  /** Empty slide for custom content. Returns the raw pptxgenjs slide. */
  blank(props?: BlankLayoutProps): PptxGenJS.Slide {
    const slide = this.pres.addSlide();
    const bgMap = {
      primary: this.theme.config.colors.bgPrimary,
      dark: this.theme.config.colors.bgDark,
      accent: this.theme.config.colors.bgAccent,
    };
    slide.background = { color: bgMap[(props?.bg) ?? "primary"] };
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

  /** Access the underlying pptxgenjs instance for advanced use. */
  get raw(): PptxGenJS {
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

  /** Render an emoji to a base64 PNG data URI (for use with addImage). */
  async emoji(name: string, size?: number): Promise<string> {
    return renderEmoji(name, this.theme.config.emojiSet, size);
  }

  /** Write the deck to a .pptx file. */
  async save(path: string): Promise<void> {
    // Wait for any pending async work from sync components (e.g. emoji renders)
    if (this._pending.promises.length > 0) {
      await Promise.all(this._pending.promises);
      this._pending.promises = [];
    }

    await this.pres.writeFile({ fileName: path });
    await patchPptx(path, {
      fonts: this.theme.config.fonts,
      connectorDefs: this._connectorDefs,
      emojiDefs: this._emojiDefs,
    });
  }
}
