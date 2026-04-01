/**
 * Academic slide layouts — Beamer-inspired structural design.
 *
 * Key structural differences from other themes:
 * - Title slides: white bg with navy band containing the title (split design)
 * - Section slides: full navy bg, centered title with gold underline
 * - Content slides: full-width navy HEADER BAND at top with title inside,
 *   gold rule separator, content below on white — the signature element
 * - Two-column: header band + thin vertical rule between columns
 * - Quote: gold left border on ivory (not navy vertical bar)
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
// Helper: draw the signature header band (navy bar + gold rule)
// Returns the Y position where content should start below the band.
// ---------------------------------------------------------------------------

function headerBand(
  slide: PptxGenJS.Slide, cfg: ThemeConfig, title: string,
): number {
  const { colors: c, fonts: f, sizes: s, spacing: sp } = cfg;
  const bandH = 1.0;

  // Navy band — edge to edge
  slide.addShape("rect", {
    x: 0, y: 0, w: sp.slideWidth, h: bandH,
    fill: { color: c.bgDark },
  });

  // Title inside band
  slide.addText(title, {
    x: sp.marginLeft,
    y: 0.1,
    w: sp.slideWidth - sp.marginLeft - sp.marginRight,
    h: bandH - 0.2,
    fontSize: s.heading,
    fontFace: f.heading,
    color: c.textOnDark,
    bold: true,
    valign: "middle",
  });

  // Gold rule at bottom of band
  slide.addShape("rect", {
    x: 0, y: bandH, w: sp.slideWidth, h: 0.04,
    fill: { color: c.accentBlue },
  });

  return bandH + 0.25;  // content starts here
}

// ---------------------------------------------------------------------------
// Title slide — white bg, navy band in center, gold rule, subtitle below
// ---------------------------------------------------------------------------

function title(
  pres: PptxGenJS, cfg: ThemeConfig, _comp: ThemeComponents,
  props: TitleLayoutProps,
): PptxGenJS.Slide {
  const slide = pres.addSlide();
  const { colors: c, fonts: f, sizes: s, spacing: sp } = cfg;
  const contentW = sp.slideWidth - sp.marginLeft - sp.marginRight;
  slide.background = { color: c.bgPrimary };

  // Navy band — centered vertically
  const bandH = 2.2;
  const bandY = 1.6;
  slide.addShape("rect", {
    x: 0, y: bandY, w: sp.slideWidth, h: bandH,
    fill: { color: c.bgDark },
  });

  // Title inside band — centered
  slide.addText(props.title, {
    x: sp.marginLeft + 0.5,
    y: bandY + 0.2,
    w: contentW - 1,
    h: bandH - 0.4,
    fontSize: s.title,
    fontFace: f.heading,
    color: c.textOnDark,
    bold: true,
    align: "center",
    valign: "middle",
  });

  // Gold rule below band
  slide.addShape("rect", {
    x: sp.marginLeft, y: bandY + bandH + 0.15,
    w: contentW, h: 0.04,
    fill: { color: c.accentBlue },
  });

  // Subtitle below rule — on white
  if (props.subtitle) {
    slide.addText(props.subtitle, {
      x: sp.marginLeft + 0.5,
      y: bandY + bandH + 0.4,
      w: contentW - 1,
      h: 0.8,
      fontSize: s.subtitle,
      fontFace: f.sans,
      color: c.textSecondary,
      align: "center",
    });
  }

  // Affiliation logos — arranged horizontally at bottom
  if (props.logos && props.logos.length > 0) {
    const logoH = props.logoHeight ?? 0.5;
    const logoY = sp.slideHeight - sp.marginBottom - logoH;
    const gap = 0.4;
    const totalW = props.logos.length * logoH + (props.logos.length - 1) * gap;
    const startX = (sp.slideWidth - totalW) / 2;
    for (let i = 0; i < props.logos.length; i++) {
      slide.addImage({
        path: props.logos[i],
        x: startX + i * (logoH + gap),
        y: logoY,
        w: logoH,
        h: logoH,
        sizing: { type: "contain" as any, w: logoH, h: logoH },
      });
    }
  }

  return slide;
}

// ---------------------------------------------------------------------------
// Section slide — navy bg, centered title, gold underline
// ---------------------------------------------------------------------------

function section(
  pres: PptxGenJS, cfg: ThemeConfig, _comp: ThemeComponents,
  props: SectionLayoutProps,
): PptxGenJS.Slide {
  const slide = pres.addSlide();
  const { colors: c, fonts: f, sizes: s, spacing: sp } = cfg;
  const contentW = sp.slideWidth - sp.marginLeft - sp.marginRight;
  slide.background = { color: c.bgDark };

  // Centered title
  slide.addText(props.title, {
    x: sp.marginLeft,
    y: 2.2,
    w: contentW,
    h: 1.5,
    fontSize: s.sectionTitle,
    fontFace: f.heading,
    color: c.textOnDark,
    bold: true,
    align: "center",
    valign: "middle",
  });

  // Gold underline — centered, proportional to title
  const ruleW = Math.min(contentW * 0.3, 4);
  slide.addShape("rect", {
    x: (sp.slideWidth - ruleW) / 2,
    y: 3.75,
    w: ruleW,
    h: 0.05,
    fill: { color: c.accentBlue },
  });

  if (props.subtitle) {
    slide.addText(props.subtitle, {
      x: sp.marginLeft,
      y: 4.1,
      w: contentW,
      h: 0.6,
      fontSize: s.body,
      fontFace: f.sans,
      color: c.textOnDarkMuted,
      align: "center",
    });
  }
  return slide;
}

// ---------------------------------------------------------------------------
// Content slide — header band + bullets on white
// ---------------------------------------------------------------------------

function content(
  pres: PptxGenJS, cfg: ThemeConfig, comp: ThemeComponents,
  props: ContentLayoutProps,
): PptxGenJS.Slide {
  const slide = pres.addSlide();
  const { colors: c, spacing: sp } = cfg;
  const contentW = sp.slideWidth - sp.marginLeft - sp.marginRight;
  slide.background = { color: c.bgPrimary };

  const contentY = headerBand(slide, cfg, props.title);

  let bulletTop = contentY;
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
// Two-column slide — header band + vertical rule between columns
// ---------------------------------------------------------------------------

function twoColumn(
  pres: PptxGenJS, cfg: ThemeConfig, comp: ThemeComponents,
  props: TwoColumnLayoutProps,
): PptxGenJS.Slide {
  const slide = pres.addSlide();
  const { colors: c, sizes: s, spacing: sp } = cfg;
  const contentW = sp.slideWidth - sp.marginLeft - sp.marginRight;
  slide.background = { color: c.bgPrimary };

  const contentY = headerBand(slide, cfg, props.title);

  const gap = 0.6;
  const colW = (contentW - gap) / 2;
  const colH = sp.slideHeight - contentY - sp.marginBottom;
  const rightX = sp.marginLeft + colW + gap;

  // Thin vertical rule between columns
  const ruleX = sp.marginLeft + colW + gap / 2;
  slide.addShape("line", {
    x: ruleX, y: contentY + 0.1, w: 0, h: colH - 0.2,
    line: { color: c.accentBlue, width: 0.75 },
  } as any);

  if (props.leftTitle) {
    comp.bodyText(slide, {
      text: props.leftTitle,
      x: sp.marginLeft,
      y: contentY,
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
      y: contentY,
      w: colW,
      h: 0.4,
      color: c.accent,
      bold: true,
      fontSize: s.body,
    });
  }

  const listTop = (props.leftTitle || props.rightTitle) ? contentY + 0.5 : contentY;
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
// Code slide — header band + code block
// ---------------------------------------------------------------------------

function code(
  pres: PptxGenJS, cfg: ThemeConfig, comp: ThemeComponents,
  props: CodeLayoutProps,
): PptxGenJS.Slide {
  const slide = pres.addSlide();
  const { colors: c, spacing: sp } = cfg;
  const contentW = sp.slideWidth - sp.marginLeft - sp.marginRight;
  slide.background = { color: c.bgPrimary };

  const contentY = headerBand(slide, cfg, props.title);

  comp.codeBlock(slide, {
    code: props.code,
    language: props.language,
    x: sp.marginLeft,
    y: contentY,
    w: contentW,
    h: sp.slideHeight - contentY - sp.marginBottom,
  });
  return slide;
}

// ---------------------------------------------------------------------------
// Quote slide — ivory bg, gold left border, serif italic
// ---------------------------------------------------------------------------

function quote(
  pres: PptxGenJS, cfg: ThemeConfig, _comp: ThemeComponents,
  props: QuoteLayoutProps,
): PptxGenJS.Slide {
  const slide = pres.addSlide();
  const { colors: c, fonts: f, sizes: s, spacing: sp } = cfg;
  const contentW = sp.slideWidth - sp.marginLeft - sp.marginRight;
  slide.background = { color: c.bgPrimary };

  // Gold left border (thick vertical bar)
  const quoteX = sp.marginLeft + 1.5;
  slide.addShape("rect", {
    x: quoteX - 0.15, y: 1.5, w: 0.08, h: 4.0,
    fill: { color: c.accentBlue },
  });

  // Opening quote mark
  slide.addText("\u201C", {
    x: quoteX + 0.1, y: 1.2, w: 1, h: 1,
    fontSize: 60, fontFace: f.heading, color: c.accentBlue, bold: true,
  });

  // Quote text
  slide.addText(props.quote, {
    x: quoteX + 0.2, y: 2.0,
    w: contentW - 2.2, h: 2.8,
    fontSize: s.subtitle, fontFace: f.serif,
    color: c.text, italic: true, valign: "top",
    lineSpacingMultiple: 1.4,
  });

  // Attribution
  if (props.attribution) {
    slide.addText(`\u2014 ${props.attribution}`, {
      x: quoteX + 0.2, y: 4.8,
      w: contentW - 2.2, h: 0.5,
      fontSize: s.body, fontFace: f.sans,
      color: c.textMuted, italic: false,
    });
  }
  return slide;
}

// ---------------------------------------------------------------------------
// Image slide — header band + image
// ---------------------------------------------------------------------------

function image(
  pres: PptxGenJS, cfg: ThemeConfig, comp: ThemeComponents,
  props: ImageLayoutProps,
): PptxGenJS.Slide {
  const slide = pres.addSlide();
  const { colors: c, spacing: sp } = cfg;
  const contentW = sp.slideWidth - sp.marginLeft - sp.marginRight;
  slide.background = { color: c.bgPrimary };

  const contentY = headerBand(slide, cfg, props.title);

  const captionSpace = props.caption ? 0.5 : 0;
  const imgH = sp.slideHeight - contentY - sp.marginBottom - captionSpace;

  slide.addImage({
    path: props.imagePath,
    x: sp.marginLeft + 0.5,
    y: contentY,
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
// Table slide — header band + table
// ---------------------------------------------------------------------------

function tableLayout(
  pres: PptxGenJS, cfg: ThemeConfig, comp: ThemeComponents,
  props: TableLayoutProps,
): PptxGenJS.Slide {
  const slide = pres.addSlide();
  const { colors: c, spacing: sp } = cfg;
  const contentW = sp.slideWidth - sp.marginLeft - sp.marginRight;
  slide.background = { color: c.bgPrimary };

  const contentY = headerBand(slide, cfg, props.title);

  comp.table(slide, {
    headers: props.headers,
    rows: props.rows,
    x: sp.marginLeft,
    y: contentY,
    w: contentW,
  });
  return slide;
}

// ---------------------------------------------------------------------------
// Blank slide
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
// Equation slide — header band + equations
// ---------------------------------------------------------------------------

async function equationLayout(
  pres: PptxGenJS, cfg: ThemeConfig, comp: ThemeComponents,
  props: EquationLayoutProps,
): Promise<PptxGenJS.Slide> {
  const slide = pres.addSlide();
  const { colors: c, spacing: sp } = cfg;
  const contentW = sp.slideWidth - sp.marginLeft - sp.marginRight;
  slide.background = { color: c.bgPrimary };

  const contentY = headerBand(slide, cfg, props.title);

  let curY = contentY + 0.1;
  const eqW = contentW * 0.6;
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
// Export
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
