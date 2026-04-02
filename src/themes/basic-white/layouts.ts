/**
 * Pre-designed slide layouts for the Basic White theme.
 *
 * Forked from claude-doc layouts with these changes:
 * - No accent bars on any slide
 * - Title and section slides have centered text
 * - Content positioned higher to fill removed accent bar space
 */

import type { Presentation, Slide } from "../../ooxml/index.js";
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
// Title slide — centered text on white
// ---------------------------------------------------------------------------

function title(
  pres: Presentation, cfg: ThemeConfig, _comp: ThemeComponents,
  props: TitleLayoutProps,
): Slide {
  const slide = pres.addSlide();
  const { colors: c, fonts: f, sizes: s, spacing: sp } = cfg;
  slide.background = { color: c.bgDark };

  slide.addText(props.title, {
    x: sp.marginLeft,
    y: 2.2,
    w: sp.slideWidth - sp.marginLeft - sp.marginRight,
    h: 1.6,
    fontSize: s.title,
    fontFace: f.heading,
    color: c.textOnDark,
    bold: true,
    align: "center",
    valign: "middle",
  });

  if (props.subtitle) {
    slide.addText(props.subtitle, {
      x: sp.marginLeft,
      y: 3.8,
      w: sp.slideWidth - sp.marginLeft - sp.marginRight,
      h: 0.8,
      fontSize: s.subtitle,
      fontFace: f.sans,
      color: c.textOnDarkMuted,
      align: "center",
    });
  }
  return slide;
}

// ---------------------------------------------------------------------------
// Section slide — centered heading on white
// ---------------------------------------------------------------------------

function section(
  pres: Presentation, cfg: ThemeConfig, _comp: ThemeComponents,
  props: SectionLayoutProps,
): Slide {
  const slide = pres.addSlide();
  const { colors: c, fonts: f, sizes: s, spacing: sp } = cfg;
  slide.background = { color: c.bgAccent };

  slide.addText(props.title, {
    x: sp.marginLeft,
    y: 2.5,
    w: sp.slideWidth - sp.marginLeft - sp.marginRight,
    h: 1.5,
    fontSize: s.sectionTitle,
    fontFace: f.heading,
    color: c.text,
    bold: true,
    align: "center",
    valign: "middle",
  });

  if (props.subtitle) {
    slide.addText(props.subtitle, {
      x: sp.marginLeft,
      y: 4.0,
      w: sp.slideWidth - sp.marginLeft - sp.marginRight,
      h: 0.6,
      fontSize: s.body,
      fontFace: f.sans,
      color: c.textMuted,
      align: "center",
    });
  }
  return slide;
}

// ---------------------------------------------------------------------------
// Content slide — heading + bullet list (no accent bar)
// ---------------------------------------------------------------------------

function content(
  pres: Presentation, cfg: ThemeConfig, comp: ThemeComponents,
  props: ContentLayoutProps,
): Slide {
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

  let bulletTop = sp.marginTop + 0.85;
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

  comp.bulletList(slide, {
    items: props.bullets,
    x: sp.marginLeft + 0.15,
    y: bulletTop,
    w: contentW - 0.15,
    h: sp.slideHeight - bulletTop - sp.marginBottom,
    build: props.build,
  });
  return slide;
}

// ---------------------------------------------------------------------------
// Two-column slide — heading + two bullet columns (no accent bar)
// ---------------------------------------------------------------------------

function twoColumn(
  pres: Presentation, cfg: ThemeConfig, comp: ThemeComponents,
  props: TwoColumnLayoutProps,
): Slide {
  const slide = pres.addSlide();
  const { colors: c, fonts: _f, sizes: s, spacing: sp } = cfg;
  const contentW = sp.slideWidth - sp.marginLeft - sp.marginRight;
  slide.background = { color: c.bgPrimary };

  comp.heading(slide, {
    text: props.title,
    x: sp.marginLeft,
    y: sp.marginTop,
    w: contentW,
  });

  const colTop = sp.marginTop + 0.85;
  const gap = 0.5;
  const colW = (contentW - gap) / 2;
  const colH = sp.slideHeight - colTop - sp.marginBottom;
  const rightX = sp.marginLeft + colW + gap;

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
// Code slide — heading + code block (no accent bar)
// ---------------------------------------------------------------------------

function code(
  pres: Presentation, cfg: ThemeConfig, comp: ThemeComponents,
  props: CodeLayoutProps,
): Slide {
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

  const codeTop = sp.marginTop + 0.85;
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
// Quote slide — large quote on white
// ---------------------------------------------------------------------------

function quote(
  pres: Presentation, cfg: ThemeConfig, comp: ThemeComponents,
  props: QuoteLayoutProps,
): Slide {
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
// Image slide — heading + image + optional caption (no accent bar)
// ---------------------------------------------------------------------------

function image(
  pres: Presentation, cfg: ThemeConfig, comp: ThemeComponents,
  props: ImageLayoutProps,
): Slide {
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

  const imgTop = sp.marginTop + 0.9;
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
// Table slide — heading + themed table (no accent bar)
// ---------------------------------------------------------------------------

function tableLayout(
  pres: Presentation, cfg: ThemeConfig, comp: ThemeComponents,
  props: TableLayoutProps,
): Slide {
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

  comp.table(slide, {
    headers: props.headers,
    rows: props.rows,
    x: sp.marginLeft,
    y: sp.marginTop + 0.85,
    w: contentW,
  });
  return slide;
}

// ---------------------------------------------------------------------------
// Blank slide — empty with chosen background
// ---------------------------------------------------------------------------

function blank(
  pres: Presentation, cfg: ThemeConfig, _comp: ThemeComponents,
  props: BlankLayoutProps,
): Slide {
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
// Equation slide — heading + rendered LaTeX equations (no accent bar)
// ---------------------------------------------------------------------------

async function equationLayout(
  pres: Presentation, cfg: ThemeConfig, comp: ThemeComponents,
  props: EquationLayoutProps,
): Promise<Slide> {
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

  let curY = sp.marginTop + 1.0;
  const eqW = contentW * 0.6;
  const eqX = sp.marginLeft + (contentW - eqW) / 2;

  for (const eq of props.equations) {
    await comp.equation(slide, {
      latex: eq.latex,
      x: eqX,
      y: curY,
      w: eqW,
      label: eq.label,
    });

    const { renderEquation } = await import("../../equation.js");
    const result = await renderEquation(eq.latex, c.text);
    const eqH = Math.min(eqW / result.aspectRatio, 0.6);
    curY += eqH + (eq.label ? 0.55 : 0.35);
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
