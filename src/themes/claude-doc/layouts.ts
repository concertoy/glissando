/**
 * Pre-designed slide layouts for the Claude doc theme.
 *
 * Each layout creates a full slide by composing components.
 * All positioning is pre-configured — the user only provides content.
 */

import type PptxGenJS from "pptxgenjs";
import type {
  ThemeConfig,
  ThemeComponents,
  ThemeLayouts,
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
} from "../../types.js";

// ---------------------------------------------------------------------------
// Title slide — dark background, accent bar, large heading
// ---------------------------------------------------------------------------

function title(
  pres: PptxGenJS, cfg: ThemeConfig, comp: ThemeComponents,
  props: TitleLayoutProps,
): PptxGenJS.Slide {
  const slide = pres.addSlide();
  const { colors: c, fonts: f, sizes: s, spacing: sp } = cfg;
  slide.background = { color: c.bgDark };

  // Accent bar
  comp.accentBar(slide, { x: sp.marginLeft, y: 2.6, w: 3 });

  // Title
  slide.addText(props.title, {
    x: sp.marginLeft,
    y: 2.8,
    w: sp.slideWidth - sp.marginLeft - sp.marginRight,
    h: 1.4,
    fontSize: s.title,
    fontFace: f.heading,
    color: c.textOnDark,
    bold: true,
    valign: "top",
  });

  // Subtitle
  if (props.subtitle) {
    slide.addText(props.subtitle, {
      x: sp.marginLeft,
      y: 4.3,
      w: sp.slideWidth - sp.marginLeft - sp.marginRight,
      h: 0.7,
      fontSize: s.subtitle,
      fontFace: f.sans,
      color: c.textOnDarkMuted,
    });
  }
  return slide;
}

// ---------------------------------------------------------------------------
// Section slide — warm accent background, centered heading
// ---------------------------------------------------------------------------

function section(
  pres: PptxGenJS, cfg: ThemeConfig, comp: ThemeComponents,
  props: SectionLayoutProps,
): PptxGenJS.Slide {
  const slide = pres.addSlide();
  const { colors: c, fonts: f, sizes: s, spacing: sp } = cfg;
  slide.background = { color: c.bgAccent };

  comp.accentBar(slide, { x: sp.marginLeft, y: 2.9, w: 2.5 });

  slide.addText(props.title, {
    x: sp.marginLeft,
    y: 3.1,
    w: sp.slideWidth - sp.marginLeft - sp.marginRight,
    h: 1.3,
    fontSize: s.sectionTitle,
    fontFace: f.heading,
    color: c.text,
    bold: true,
    valign: "top",
  });

  if (props.subtitle) {
    slide.addText(props.subtitle, {
      x: sp.marginLeft,
      y: 4.5,
      w: sp.slideWidth - sp.marginLeft - sp.marginRight,
      h: 0.6,
      fontSize: s.body,
      fontFace: f.sans,
      color: c.textMuted,
    });
  }
  return slide;
}

// ---------------------------------------------------------------------------
// Content slide — heading + accent bar + bullet list
// ---------------------------------------------------------------------------

function content(
  pres: PptxGenJS, cfg: ThemeConfig, comp: ThemeComponents,
  props: ContentLayoutProps,
): PptxGenJS.Slide {
  const slide = pres.addSlide();
  const { colors: c, spacing: sp } = cfg;
  const contentW = sp.slideWidth - sp.marginLeft - sp.marginRight;
  slide.background = { color: c.bgPrimary };

  // Heading
  comp.heading(slide, {
    text: props.title,
    x: sp.marginLeft,
    y: sp.marginTop,
    w: contentW,
  });

  // Accent bar under heading
  comp.accentBar(slide, { x: sp.marginLeft, y: sp.marginTop + 0.8, w: 1.5 });

  // Optional subtitle
  let bulletTop = sp.marginTop + 1.15;
  if (props.subtitle) {
    comp.bodyText(slide, {
      text: props.subtitle,
      x: sp.marginLeft,
      y: bulletTop,
      w: contentW,
      h: 0.4,
      color: c.textMuted,
      fontSize: cfg.sizes.small,
    });
    bulletTop += 0.5;
  }

  // Bullets
  comp.bulletList(slide, {
    items: props.bullets,
    x: sp.marginLeft + 0.15,
    y: bulletTop,
    w: contentW - 0.15,
    h: sp.slideHeight - bulletTop - sp.marginBottom,
  });
  return slide;
}

// ---------------------------------------------------------------------------
// Two-column slide — heading + two bullet columns
// ---------------------------------------------------------------------------

function twoColumn(
  pres: PptxGenJS, cfg: ThemeConfig, comp: ThemeComponents,
  props: TwoColumnLayoutProps,
): PptxGenJS.Slide {
  const slide = pres.addSlide();
  const { colors: c, fonts: f, sizes: s, spacing: sp } = cfg;
  const contentW = sp.slideWidth - sp.marginLeft - sp.marginRight;
  slide.background = { color: c.bgPrimary };

  comp.heading(slide, {
    text: props.title,
    x: sp.marginLeft,
    y: sp.marginTop,
    w: contentW,
  });

  comp.accentBar(slide, { x: sp.marginLeft, y: sp.marginTop + 0.8, w: 1.5 });

  const colTop = sp.marginTop + 1.15;
  const gap = 0.5;
  const colW = (contentW - gap) / 2;
  const colH = sp.slideHeight - colTop - sp.marginBottom;
  const rightX = sp.marginLeft + colW + gap;

  // Column titles
  if (props.leftTitle) {
    comp.bodyText(slide, {
      text: props.leftTitle,
      x: sp.marginLeft,
      y: colTop,
      w: colW,
      h: 0.4,
      color: c.accent,
      bold: true,
      fontSize: s.body,
    });
  }
  if (props.rightTitle) {
    comp.bodyText(slide, {
      text: props.rightTitle,
      x: rightX,
      y: colTop,
      w: colW,
      h: 0.4,
      color: c.accent,
      bold: true,
      fontSize: s.body,
    });
  }

  const listTop = (props.leftTitle || props.rightTitle) ? colTop + 0.5 : colTop;
  const listH = colH - (props.leftTitle ? 0.5 : 0);

  comp.bulletList(slide, {
    items: props.left,
    x: sp.marginLeft + 0.1,
    y: listTop,
    w: colW - 0.1,
    h: listH,
  });

  comp.bulletList(slide, {
    items: props.right,
    x: rightX + 0.1,
    y: listTop,
    w: colW - 0.1,
    h: listH,
  });
  return slide;
}

// ---------------------------------------------------------------------------
// Code slide — heading + code block
// ---------------------------------------------------------------------------

function code(
  pres: PptxGenJS, cfg: ThemeConfig, comp: ThemeComponents,
  props: CodeLayoutProps,
): PptxGenJS.Slide {
  const slide = pres.addSlide();
  const { colors: c, spacing: sp } = cfg;
  const contentW = sp.slideWidth - sp.marginLeft - sp.marginRight;
  slide.background = { color: c.bgPrimary };

  comp.heading(slide, {
    text: props.title,
    x: sp.marginLeft,
    y: sp.marginTop,
    w: contentW,
  });

  comp.accentBar(slide, { x: sp.marginLeft, y: sp.marginTop + 0.8, w: 1.5 });

  const codeTop = sp.marginTop + 1.15;
  comp.codeBlock(slide, {
    code: props.code,
    language: props.language,
    x: sp.marginLeft,
    y: codeTop,
    w: contentW,
    h: sp.slideHeight - codeTop - sp.marginBottom,
  });
  return slide;
}

// ---------------------------------------------------------------------------
// Quote slide — accent background, large quote
// ---------------------------------------------------------------------------

function quote(
  pres: PptxGenJS, cfg: ThemeConfig, comp: ThemeComponents,
  props: QuoteLayoutProps,
): PptxGenJS.Slide {
  const slide = pres.addSlide();
  const { colors: c, spacing: sp } = cfg;
  slide.background = { color: c.bgAccent };

  comp.quoteBox(slide, {
    quote: props.quote,
    attribution: props.attribution,
    x: sp.marginLeft + 0.5,
    y: 1.2,
    w: sp.slideWidth - sp.marginLeft - sp.marginRight - 1,
    h: 5,
  });
  return slide;
}

// ---------------------------------------------------------------------------
// Image slide — heading + image + optional caption
// ---------------------------------------------------------------------------

function image(
  pres: PptxGenJS, cfg: ThemeConfig, comp: ThemeComponents,
  props: ImageLayoutProps,
): PptxGenJS.Slide {
  const slide = pres.addSlide();
  const { colors: c, spacing: sp } = cfg;
  const contentW = sp.slideWidth - sp.marginLeft - sp.marginRight;
  slide.background = { color: c.bgPrimary };

  comp.heading(slide, {
    text: props.title,
    x: sp.marginLeft,
    y: sp.marginTop,
    w: contentW,
  });

  comp.accentBar(slide, { x: sp.marginLeft, y: sp.marginTop + 0.8, w: 1.5 });

  const imgTop = sp.marginTop + 1.2;
  const captionSpace = props.caption ? 0.5 : 0;
  const imgH = sp.slideHeight - imgTop - sp.marginBottom - captionSpace;

  slide.addImage({
    path: props.imagePath,
    x: sp.marginLeft + 0.5,
    y: imgTop,
    w: contentW - 1,
    h: imgH,
    sizing: { type: "contain", w: contentW - 1, h: imgH },
  });

  if (props.caption) {
    comp.caption(slide, {
      text: props.caption,
      x: sp.marginLeft,
      y: sp.slideHeight - sp.marginBottom - 0.35,
      w: contentW,
    });
  }
  return slide;
}

// ---------------------------------------------------------------------------
// Table slide — heading + themed table
// ---------------------------------------------------------------------------

function tableLayout(
  pres: PptxGenJS, cfg: ThemeConfig, comp: ThemeComponents,
  props: TableLayoutProps,
): PptxGenJS.Slide {
  const slide = pres.addSlide();
  const { colors: c, spacing: sp } = cfg;
  const contentW = sp.slideWidth - sp.marginLeft - sp.marginRight;
  slide.background = { color: c.bgPrimary };

  comp.heading(slide, {
    text: props.title,
    x: sp.marginLeft,
    y: sp.marginTop,
    w: contentW,
  });

  comp.accentBar(slide, { x: sp.marginLeft, y: sp.marginTop + 0.8, w: 1.5 });

  comp.table(slide, {
    headers: props.headers,
    rows: props.rows,
    x: sp.marginLeft,
    y: sp.marginTop + 1.15,
    w: contentW,
  });
  return slide;
}

// ---------------------------------------------------------------------------
// Blank slide — empty with chosen background
// ---------------------------------------------------------------------------

function blank(
  pres: PptxGenJS, cfg: ThemeConfig, _comp: ThemeComponents,
  props: BlankLayoutProps,
): PptxGenJS.Slide {
  const slide = pres.addSlide();
  const bgMap = {
    primary: cfg.colors.bgPrimary,
    dark: cfg.colors.bgDark,
    accent: cfg.colors.bgAccent,
  };
  slide.background = { color: bgMap[props.bg ?? "primary"] };
  return slide;
}

// ---------------------------------------------------------------------------
// Equation slide — heading + rendered LaTeX equations
// ---------------------------------------------------------------------------

async function equationLayout(
  pres: PptxGenJS, cfg: ThemeConfig, comp: ThemeComponents,
  props: EquationLayoutProps,
): Promise<PptxGenJS.Slide> {
  const slide = pres.addSlide();
  const { colors: c, spacing: sp } = cfg;
  const contentW = sp.slideWidth - sp.marginLeft - sp.marginRight;
  slide.background = { color: c.bgPrimary };

  comp.heading(slide, {
    text: props.title,
    x: sp.marginLeft,
    y: sp.marginTop,
    w: contentW,
  });

  comp.accentBar(slide, { x: sp.marginLeft, y: sp.marginTop + 0.8, w: 1.5 });

  // Stack equations vertically with auto-spacing
  let curY = sp.marginTop + 1.3;
  const eqW = contentW * 0.6;  // equations centered at 60% width
  const eqX = sp.marginLeft + (contentW - eqW) / 2;

  for (const eq of props.equations) {
    const rect = await comp.equation(slide, {
      latex: eq.latex,
      x: eqX,
      y: curY,
      w: eqW,
      label: eq.label,
    });

    curY += rect.h + 0.2;
  }
  return slide;
}

// ---------------------------------------------------------------------------
// Export all layouts
// ---------------------------------------------------------------------------

export const layouts: ThemeLayouts = {
  title,
  section,
  content,
  twoColumn,
  code,
  quote,
  image,
  table: tableLayout,
  equation: equationLayout,
  blank,
};
