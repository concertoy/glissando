/**
 * Core types for glissando.
 *
 * Theme = Config + Components + Layouts
 *   - Config:     colors, fonts, sizes, spacing
 *   - Components: pre-designed visual elements (code block, bullet list, etc.)
 *   - Layouts:    pre-designed slide arrangements that compose components
 */

import type { Presentation, Slide } from "./ooxml/index.js";

// ---------------------------------------------------------------------------
// Layout geometry
// ---------------------------------------------------------------------------

/** A rectangle region on a slide (inches). Spreadable into component props. */
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

// ---------------------------------------------------------------------------
// Theme config
// ---------------------------------------------------------------------------

export interface ThemeColors {
  bgPrimary: string;      // Main slide background (white)
  bgDark: string;         // Dark slide background (near-black)
  bgAccent: string;       // Warm accent background (off-white)
  bgCard: string;         // Card/panel background

  text: string;           // Primary text
  textSecondary: string;  // Secondary text
  textMuted: string;      // Muted/caption text
  textOnDark: string;     // Text on dark backgrounds
  textOnDarkMuted: string;// Muted text on dark backgrounds

  accent: string;         // Brand accent color
  accentBlue: string;     // Secondary accent

  codeBg: string;         // Code block background
  codeText: string;       // Code block text
}

export interface ThemeFonts {
  heading: string;  // Tiempos Headline — slide titles, section headings
  sans: string;     // Styrene A — body text, bullets, UI elements
  serif: string;    // Tiempos Text — quotes, emphasis
  mono: string;     // JetBrains Mono — code blocks
}

export interface ThemeSizes {
  title: number;          // Title slide heading (pt)
  subtitle: number;       // Title slide subtitle (pt)
  sectionTitle: number;   // Section divider heading (pt)
  heading: number;        // Content slide heading (pt)
  body: number;           // Body text / bullets (pt)
  small: number;          // Small annotations (pt)
  code: number;           // Code text (pt)
  caption: number;        // Image captions (pt)
}

export interface ThemeSpacing {
  marginLeft: number;     // inches from left edge
  marginRight: number;    // inches from right edge
  marginTop: number;      // inches from top edge
  marginBottom: number;   // inches from bottom edge
  slideWidth: number;     // inches
  slideHeight: number;    // inches
}

export interface CodeStyle {
  bg: string;           // Code block background
  text: string;         // Default text color
  border?: string;      // Border color (if set, draws a border)
  borderRadius?: number;// Corner radius in inches
  keyword: string;      // Language keywords (def, return, import, const, etc.)
  string: string;       // String literals
  comment: string;      // Comments
  number: string;       // Numeric literals
  function: string;     // Function/method names
  operator: string;     // Operators and punctuation
  label: string;        // Language label color
}

export type EmojiStyle = "openmoji" | "twemoji" | "openmoji-outline";

export interface EmojiSet {
  style: EmojiStyle;
  color?: string;                     // hex WITHOUT #, e.g. "DA7756" — colorizes monochrome SVGs
  size?: number;                      // render size in px (default 128)
  custom?: Record<string, string>;    // name → SVG string overrides
}

export interface EmojiProps {
  name: string;
  x: number;
  y: number;
  w?: number;   // default 0.4"
  h?: number;
}

/** Stored internally for post-processing emoji bullets into OOXML <a:buBlip>. */
export interface EmojiDef {
  slideIndex: number;
  objectName: string;         // text shape objectName to find in XML
  bulletIndices: number[];    // which bullet paragraphs get emoji images
  emojiPngs: string[];        // base64 PNG data (parallel with bulletIndices)
}

export interface ThemeConfig {
  name: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
  sizes: ThemeSizes;
  spacing: ThemeSpacing;
  codeStyle: CodeStyle;
  emojiSet?: EmojiSet;
}

// ---------------------------------------------------------------------------
// Footer / citation types
// ---------------------------------------------------------------------------

export interface FooterConfig {
  slideNumber?: boolean;
  slideNumberFormat?: "n" | "n / N";  // "3" or "3 / 22" (default "n / N")
  text?: string;                       // static footer text (bottom-left)
  citationStyle?: "author-year" | "compact";
  skip?: number[];                     // 1-based slide indices to skip
}

export interface BibEntry {
  authors: string[];
  year: number;
}

/** Internal: per-slide footer data passed to OOXML writer. */
export interface FooterDef {
  slideIndex: number;   // 0-based (matches pptx slide numbering)
  slideNumber?: string;
  text?: string;
  citations?: string;
}

/** Internal: per-shape animation data passed to OOXML writer. */
export interface AnimationDef {
  slideIndex: number;      // -1 = resolve by objectName search (like emoji defs)
  objectName: string;      // shape objectName for spid lookup
  paragraphCount: number;  // number of paragraphs to animate one-by-one
}

// ---------------------------------------------------------------------------
// Component props — what you pass to each pre-designed component
// ---------------------------------------------------------------------------

export interface AccentBarProps {
  x: number;
  y: number;
  w?: number;     // default ~2 inches
  h?: number;     // default thin (0.04)
}

export interface HeadingProps {
  text: string;
  x: number;
  y: number;
  w: number;
  color?: string;
  fontSize?: number;
  bold?: boolean;
}

export interface BodyTextProps {
  text: string;
  x: number;
  y: number;
  w: number;
  h?: number;
  color?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  fontFace?: string;
}

export interface BulletListProps {
  items: string[];
  x: number;
  y: number;
  w: number;
  h?: number;
  fontSize?: number;
  build?: boolean;  // reveal bullets one-by-one on click
}

export interface NumberedListProps {
  items: string[];
  x: number;
  y: number;
  w: number;
  h?: number;
  fontSize?: number;
  build?: boolean;  // reveal bullets one-by-one on click
}

export interface CodeBlockProps {
  code: string;
  x: number;
  y: number;
  w: number;
  h?: number;
  language?: string;
}

export interface QuoteBoxProps {
  quote: string;
  attribution?: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TableProps {
  headers: string[];
  rows: string[][];
  x: number;
  y: number;
  w: number;
}

export interface CaptionProps {
  text: string;
  x: number;
  y: number;
  w: number;
}

export type CalloutVariant = "card" | "code" | "info" | "warning" | "accent" | "success";

export interface CalloutBlockProps {
  variant: CalloutVariant;
  x: number;
  y: number;
  w: number;
  h?: number;           // auto-sizes to content if omitted
  title?: string;
  body?: string;
  bullets?: string[];
  icon?: string;        // optional leading icon/emoji
}

export interface TextBlockProps {
  x: number;
  y: number;
  w: number;
  h?: number;           // auto-sizes to content if omitted
  title?: string;       // bold heading inside the block
  subtitle?: string;    // smaller muted text below title
  body?: string;        // paragraph text
  bullets?: string[];   // bullet list
  fill?: string;        // background hex (default: theme bgCard)
  border?: string;      // border hex (default: theme textMuted)
  textColor?: string;   // override body text color (default: theme text)
}

// ---------------------------------------------------------------------------
// Diagram props — boxes, arrows, connectors, containers
// ---------------------------------------------------------------------------

/** A connection point on a shape (top/right/bottom/left). */
export interface ConnectionPoint {
  x: number;
  y: number;
  idx: number;          // OOXML connection point: 0=top, 1=right, 2=bottom, 3=left
  _shapeName: string;   // internal: objectName for XML lookup
}

/** Returned by diagramBox — provides connection points for connectors. */
export interface ShapeRef {
  top: ConnectionPoint;
  right: ConnectionPoint;
  bottom: ConnectionPoint;
  left: ConnectionPoint;
  rect: Rect;
}

export interface DiagramBoxProps {
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fill?: string;
  border?: string;
  borderWidth?: number;
  textColor?: string;
  fontSize?: number;
  bold?: boolean;
}

/** Connector between two shapes (creates native OOXML connectors that move with shapes). */
export interface ConnectorProps {
  from: ConnectionPoint;
  to: ConnectionPoint;
  type?: "straight" | "elbow" | "curved";
  color?: string;
  width?: number;       // line width in pt (default 1)
  head?: "arrow" | "stealth" | "triangle" | "none";
  tail?: "arrow" | "stealth" | "triangle" | "none";
  label?: string;        // text label positioned near the midpoint
  labelItalic?: boolean;  // italic label (default true)
}

/** Stored internally for post-processing into OOXML <p:cxnSp>. */
export interface ConnectorDef {
  slideIndex: number;
  from: ConnectionPoint;
  to: ConnectionPoint;
  type: "straight" | "elbow" | "curved";
  color: string;
  width: number;
  head: string;
  tail: string;
  label?: string;
  labelItalic?: boolean;
}

export interface ArrowProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  color?: string;
  width?: number;
  head?: "arrow" | "stealth" | "triangle" | "none";
  tail?: "arrow" | "stealth" | "triangle" | "none";
  dashed?: boolean;
}

export interface HookArrowProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  hookDirection: "right-down" | "right-up" | "down-right" | "down-left" | "up-right" | "left-down";
  color?: string;
  width?: number;
  head?: "arrow" | "stealth" | "triangle" | "none";
  tail?: "arrow" | "stealth" | "triangle" | "none";
  dashed?: boolean;
}

export interface ContainerProps {
  label?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  border?: string;
  fill?: string;
  labelColor?: string;
  fontSize?: number;
}

// ---------------------------------------------------------------------------
// Equation props
// ---------------------------------------------------------------------------

export interface ImageComponentProps {
  x: number;
  y: number;
  w: number;
  h: number;
  path?: string;                        // file path or URL
  data?: string;                        // base64 data URI (alternative to path)
  caption?: string;                     // optional text below image
  border?: boolean | string;            // true = theme accent, string = hex color
  rounding?: boolean;                   // rounded corners
  sizing?: "contain" | "cover" | "crop"; // default: "contain"
}

export interface EquationProps {
  latex: string;
  x: number;
  y: number;
  w: number;            // max width — height is auto-calculated from aspect ratio
  h?: number;           // explicit height override
  color?: string;       // hex WITHOUT #, defaults to theme text color
  label?: string;       // optional label/caption below the equation
}

// ---------------------------------------------------------------------------
// Components — functions that render elements onto a slide
// ---------------------------------------------------------------------------

export interface ThemeComponents {
  accentBar: (slide: Slide, props: AccentBarProps) => Rect;
  heading: (slide: Slide, props: HeadingProps) => Rect;
  bodyText: (slide: Slide, props: BodyTextProps) => Rect;
  bulletList: (slide: Slide, props: BulletListProps) => Rect;
  numberedList: (slide: Slide, props: NumberedListProps) => Rect;
  codeBlock: (slide: Slide, props: CodeBlockProps) => Rect;
  quoteBox: (slide: Slide, props: QuoteBoxProps) => Rect;
  table: (slide: Slide, props: TableProps) => Rect;
  caption: (slide: Slide, props: CaptionProps) => Rect;
  calloutBlock: (slide: Slide, props: CalloutBlockProps) => Promise<Rect>;
  textBlock: (slide: Slide, props: TextBlockProps) => Rect;
  diagramBox: (slide: Slide, props: DiagramBoxProps) => ShapeRef;
  arrow: (slide: Slide, props: ArrowProps) => void;
  hookArrow: (slide: Slide, props: HookArrowProps) => void;
  container: (slide: Slide, props: ContainerProps) => ShapeRef;
  image: (slide: Slide, props: ImageComponentProps) => Rect;
  equation: (slide: Slide, props: EquationProps) => Promise<Rect>;
  emoji?: (slide: Slide, props: EmojiProps) => Promise<Rect>;
}

// ---------------------------------------------------------------------------
// Layout props — what the user passes to each slide type
// ---------------------------------------------------------------------------

/** Shared optional fields available on every layout method. */
export interface BaseLayoutProps {
  /** Speaker notes shown in presenter view (not visible on the slide). */
  notes?: string;
}

export interface TitleLayoutProps extends BaseLayoutProps {
  title: string;
  subtitle?: string;
}

export interface SectionLayoutProps extends BaseLayoutProps {
  title: string;
  subtitle?: string;
}

export interface ContentLayoutProps extends BaseLayoutProps {
  title: string;
  subtitle?: string;
  bullets: string[];
  build?: boolean;  // reveal bullets one-by-one on click
}

export interface TwoColumnLayoutProps extends BaseLayoutProps {
  title: string;
  leftTitle?: string;
  rightTitle?: string;
  left: string[];
  right: string[];
}

export interface CodeLayoutProps extends BaseLayoutProps {
  title: string;
  code: string;
  language?: string;
}

export interface QuoteLayoutProps extends BaseLayoutProps {
  quote: string;
  attribution?: string;
}

export interface ImageLayoutProps extends BaseLayoutProps {
  title: string;
  imagePath: string;
  caption?: string;
}

export interface TableLayoutProps extends BaseLayoutProps {
  title: string;
  headers: string[];
  rows: string[][];
}

export interface EquationLayoutProps extends BaseLayoutProps {
  title: string;
  equations: Array<{ latex: string; label?: string }>;
}

export interface BlankLayoutProps extends BaseLayoutProps {
  bg?: "primary" | "dark" | "accent";
}

// ---------------------------------------------------------------------------
// Layouts — functions that create a full slide using components
// ---------------------------------------------------------------------------

export interface ThemeLayouts {
  title: (pres: Presentation, config: ThemeConfig, components: ThemeComponents, props: TitleLayoutProps) => Slide;
  section: (pres: Presentation, config: ThemeConfig, components: ThemeComponents, props: SectionLayoutProps) => Slide;
  content: (pres: Presentation, config: ThemeConfig, components: ThemeComponents, props: ContentLayoutProps) => Slide;
  twoColumn: (pres: Presentation, config: ThemeConfig, components: ThemeComponents, props: TwoColumnLayoutProps) => Slide;
  code: (pres: Presentation, config: ThemeConfig, components: ThemeComponents, props: CodeLayoutProps) => Slide;
  quote: (pres: Presentation, config: ThemeConfig, components: ThemeComponents, props: QuoteLayoutProps) => Slide;
  image: (pres: Presentation, config: ThemeConfig, components: ThemeComponents, props: ImageLayoutProps) => Slide;
  table: (pres: Presentation, config: ThemeConfig, components: ThemeComponents, props: TableLayoutProps) => Slide;
  equation: (pres: Presentation, config: ThemeConfig, components: ThemeComponents, props: EquationLayoutProps) => Promise<Slide>;
  blank: (pres: Presentation, config: ThemeConfig, components: ThemeComponents, props: BlankLayoutProps) => Slide;
}

// ---------------------------------------------------------------------------
// Font presets — swappable typography for a theme
// ---------------------------------------------------------------------------

export interface FontPreset {
  name: string;
  description: string;
  installNote: string;
  fonts: ThemeFonts;
  sizes: ThemeSizes;
  codeStyle?: CodeStyle;
}

// ---------------------------------------------------------------------------
// Theme — the full package
// ---------------------------------------------------------------------------

/** Collects pending async work from sync components (e.g. emoji renders in bodyText). */
export interface PendingWork {
  promises: Promise<void>[];
}

/** Factory that creates components bound to a specific config. */
export type ComponentFactory = (config: ThemeConfig, emojiDefs?: EmojiDef[], pending?: PendingWork, animationDefs?: AnimationDef[]) => ThemeComponents;

export interface Theme {
  config: ThemeConfig;
  createComponents: ComponentFactory;
  layouts: ThemeLayouts;
}
