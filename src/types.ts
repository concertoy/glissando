/**
 * Core types for glissando.
 *
 * Theme = Config + Components + Layouts
 *   - Config:     colors, fonts, sizes, spacing
 *   - Components: pre-designed visual elements (code block, bullet list, etc.)
 *   - Layouts:    pre-designed slide arrangements that compose components
 */

import type PptxGenJS from "pptxgenjs";

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
}

export interface NumberedListProps {
  items: string[];
  x: number;
  y: number;
  w: number;
  h?: number;
  fontSize?: number;
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
  accentBar: (slide: PptxGenJS.Slide, props: AccentBarProps) => void;
  heading: (slide: PptxGenJS.Slide, props: HeadingProps) => void;
  bodyText: (slide: PptxGenJS.Slide, props: BodyTextProps) => void;
  bulletList: (slide: PptxGenJS.Slide, props: BulletListProps) => void;
  numberedList: (slide: PptxGenJS.Slide, props: NumberedListProps) => void;
  codeBlock: (slide: PptxGenJS.Slide, props: CodeBlockProps) => void;
  quoteBox: (slide: PptxGenJS.Slide, props: QuoteBoxProps) => void;
  table: (slide: PptxGenJS.Slide, props: TableProps) => void;
  caption: (slide: PptxGenJS.Slide, props: CaptionProps) => void;
  calloutBlock: (slide: PptxGenJS.Slide, props: CalloutBlockProps) => Promise<void>;
  diagramBox: (slide: PptxGenJS.Slide, props: DiagramBoxProps) => ShapeRef;
  arrow: (slide: PptxGenJS.Slide, props: ArrowProps) => void;
  hookArrow: (slide: PptxGenJS.Slide, props: HookArrowProps) => void;
  container: (slide: PptxGenJS.Slide, props: ContainerProps) => ShapeRef;
  equation: (slide: PptxGenJS.Slide, props: EquationProps) => Promise<void>;
  emoji?: (slide: PptxGenJS.Slide, props: EmojiProps) => Promise<void>;
}

// ---------------------------------------------------------------------------
// Layout props — what the user passes to each slide type
// ---------------------------------------------------------------------------

export interface TitleLayoutProps {
  title: string;
  subtitle?: string;
}

export interface SectionLayoutProps {
  title: string;
  subtitle?: string;
}

export interface ContentLayoutProps {
  title: string;
  subtitle?: string;
  bullets: string[];
}

export interface TwoColumnLayoutProps {
  title: string;
  leftTitle?: string;
  rightTitle?: string;
  left: string[];
  right: string[];
}

export interface CodeLayoutProps {
  title: string;
  code: string;
  language?: string;
}

export interface QuoteLayoutProps {
  quote: string;
  attribution?: string;
}

export interface ImageLayoutProps {
  title: string;
  imagePath: string;
  caption?: string;
}

export interface TableLayoutProps {
  title: string;
  headers: string[];
  rows: string[][];
}

export interface EquationLayoutProps {
  title: string;
  equations: Array<{ latex: string; label?: string }>;
}

export interface BlankLayoutProps {
  bg?: "primary" | "dark" | "accent";
}

// ---------------------------------------------------------------------------
// Layouts — functions that create a full slide using components
// ---------------------------------------------------------------------------

export interface ThemeLayouts {
  title: (pres: PptxGenJS, config: ThemeConfig, components: ThemeComponents, props: TitleLayoutProps) => void;
  section: (pres: PptxGenJS, config: ThemeConfig, components: ThemeComponents, props: SectionLayoutProps) => void;
  content: (pres: PptxGenJS, config: ThemeConfig, components: ThemeComponents, props: ContentLayoutProps) => void;
  twoColumn: (pres: PptxGenJS, config: ThemeConfig, components: ThemeComponents, props: TwoColumnLayoutProps) => void;
  code: (pres: PptxGenJS, config: ThemeConfig, components: ThemeComponents, props: CodeLayoutProps) => void;
  quote: (pres: PptxGenJS, config: ThemeConfig, components: ThemeComponents, props: QuoteLayoutProps) => void;
  image: (pres: PptxGenJS, config: ThemeConfig, components: ThemeComponents, props: ImageLayoutProps) => void;
  table: (pres: PptxGenJS, config: ThemeConfig, components: ThemeComponents, props: TableLayoutProps) => void;
  equation: (pres: PptxGenJS, config: ThemeConfig, components: ThemeComponents, props: EquationLayoutProps) => Promise<void>;
  blank: (pres: PptxGenJS, config: ThemeConfig, components: ThemeComponents, props: BlankLayoutProps) => void;
}

// ---------------------------------------------------------------------------
// Theme — the full package
// ---------------------------------------------------------------------------

/** Collects pending async work from sync components (e.g. emoji renders in bodyText). */
export interface PendingWork {
  promises: Promise<void>[];
}

/** Factory that creates components bound to a specific config. */
export type ComponentFactory = (config: ThemeConfig, emojiDefs?: EmojiDef[], pending?: PendingWork) => ThemeComponents;

export interface Theme {
  config: ThemeConfig;
  createComponents: ComponentFactory;
  layouts: ThemeLayouts;
}
