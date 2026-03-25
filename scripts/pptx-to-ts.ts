#!/usr/bin/env npx tsx
/**
 * Reverse-engineer a glissando-generated PPTX back into slides.ts.
 *
 * Usage:
 *   npx tsx scripts/pptx-to-ts.ts examples/on-device-ai/output.pptx
 *   npx tsx scripts/pptx-to-ts.ts output.pptx > slides.ts
 */

import { readFileSync } from "fs";
import JSZip from "jszip";

// ---------------------------------------------------------------------------
// XML helpers
// ---------------------------------------------------------------------------

/** Extract top-level <p:sp>...</p:sp> shapes from the spTree. */
function extractShapes(xml: string): string[] {
  const results: string[] = [];
  let idx = 0;
  while (true) {
    const start = xml.indexOf("<p:sp>", idx);
    if (start === -1) break;
    // Find matching close tag, counting nesting
    let depth = 1;
    let pos = start + 6;
    while (depth > 0 && pos < xml.length) {
      const nextOpen = xml.indexOf("<p:sp>", pos);
      const nextClose = xml.indexOf("</p:sp>", pos);
      if (nextClose === -1) break;
      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth++;
        pos = nextOpen + 6;
      } else {
        depth--;
        if (depth === 0) {
          results.push(xml.substring(start, nextClose + 7));
        }
        pos = nextClose + 7;
      }
    }
    idx = pos;
  }
  return results;
}

/** Extract top-level <p:grpSp>...</p:grpSp> groups. */
function extractGroups(xml: string): string[] {
  const results: string[] = [];
  let idx = 0;
  while (true) {
    const start = xml.indexOf("<p:grpSp>", idx);
    if (start === -1) break;
    let depth = 1;
    let pos = start + 9;
    while (depth > 0 && pos < xml.length) {
      const nextOpen = xml.indexOf("<p:grpSp>", pos);
      const nextClose = xml.indexOf("</p:grpSp>", pos);
      if (nextClose === -1) break;
      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth++;
        pos = nextOpen + 9;
      } else {
        depth--;
        if (depth === 0) {
          results.push(xml.substring(start, nextClose + 10));
        }
        pos = nextClose + 10;
      }
    }
    idx = pos;
  }
  return results;
}

/** Decode XML entities. */
function decodeXml(s: string): string {
  return s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'");
}

/** Extract all text from <a:t> elements. */
function extractText(xml: string): string {
  return decodeXml([...xml.matchAll(/<a:t>([^<]*)<\/a:t>/g)].map((m) => m[1]).join(""));
}

/** Extract paragraphs as separate strings (splits on <a:p> or <a:p ...>). */
function extractParagraphs(xml: string): string[] {
  const paras: string[] = [];
  // Match both <a:p> and <a:p ...> opening tags
  const paraRegex = /<a:p[\s>]/g;
  let match;
  while ((match = paraRegex.exec(xml)) !== null) {
    const start = match.index;
    const end = xml.indexOf("</a:p>", start);
    if (end === -1) continue;
    const text = extractText(xml.substring(start, end + 6));
    if (text.trim()) paras.push(text);
  }
  return paras;
}

/** Get first font size in 100ths of a point → points. */
function getFontSize(xml: string): number | undefined {
  const m = xml.match(/<a:rPr[^>]*\ssz="(\d+)"/);
  return m ? parseInt(m[1]) / 100 : undefined;
}

/** Check if shape text is bold. */
function isBold(xml: string): boolean {
  return /<a:rPr[^>]*\sb="1"/.test(xml);
}

/** Get background color of a slide. */
function getSlideBg(xml: string): string {
  const m = xml.match(/<p:bg>[\s\S]*?<a:srgbClr val="([A-Fa-f0-9]+)"/);
  return m?.[1] ?? "FFFFFF";
}

/** Get shape fill color. */
function getShapeFill(xml: string): string | undefined {
  const m = xml.match(/<a:solidFill>\s*<a:srgbClr val="([A-Fa-f0-9]+)"/);
  return m?.[1];
}

/** Get shape name from cNvPr. */
function getShapeName(xml: string): string {
  const m = xml.match(/<p:cNvPr[^>]*\sname="([^"]*)"/);
  return m?.[1] ?? "";
}

/** Get shape x position in EMU. */
function getShapeX(xml: string): number {
  const m = xml.match(/<a:off x="(\d+)"/);
  return m ? parseInt(m[1]) : 0;
}

/** Get shape width in EMU. */
function getShapeW(xml: string): number {
  const m = xml.match(/<a:ext cx="(\d+)"/);
  return m ? parseInt(m[1]) : 0;
}

// ---------------------------------------------------------------------------
// Theme detection
// ---------------------------------------------------------------------------

interface DetectedTheme {
  name: string;
  preset?: string;          // "macosNative" | "googleFonts" | undefined
  imports: string;          // full import line
  constructor: string;      // Deck constructor expression
}

function detectTheme(slides: string[], _themeXml: string): DetectedTheme {
  // Extract actual heading font from first slide's text runs
  const headingFont = slides[0]?.match(/<a:latin typeface="([^"]+)"/)?.[1] ?? "";
  const allXml = slides.join(" ");

  // Match font → theme + preset
  if (headingFont === "Helvetica Neue") {
    return {
      name: "basic-white",
      imports: `import { basicWhite } from "../../src/themes/basic-white/index.js";`,
      constructor: "basicWhite",
    };
  }
  if (headingFont === "Playfair Display") {
    return {
      name: "elegant-bw",
      imports: `import { elegantBw } from "../../src/themes/elegant-bw/index.js";`,
      constructor: "elegantBw",
    };
  }
  if (headingFont === "Iowan Old Style") {
    return {
      name: "claude-doc", preset: "macosNative",
      imports: `import { claudeDoc, applyPreset } from "../../src/themes/claude-doc/index.js";\nimport { macosNative } from "../../src/themes/claude-doc/presets.js";`,
      constructor: "applyPreset(claudeDoc, macosNative)",
    };
  }
  if (headingFont === "Libre Baskerville") {
    return {
      name: "claude-doc", preset: "googleFonts",
      imports: `import { claudeDoc, applyPreset } from "../../src/themes/claude-doc/index.js";\nimport { googleFonts } from "../../src/themes/claude-doc/presets.js";`,
      constructor: "applyPreset(claudeDoc, googleFonts)",
    };
  }
  // Default: check accent colors as fallback
  if (allXml.includes("007AFF") && !allXml.includes("DA7756")) {
    return {
      name: "basic-white",
      imports: `import { basicWhite } from "../../src/themes/basic-white/index.js";`,
      constructor: "basicWhite",
    };
  }
  return {
    name: "claude-doc",
    imports: `import { claudeDoc } from "../../src/themes/claude-doc/index.js";`,
    constructor: "claudeDoc",
  };
}

// ---------------------------------------------------------------------------
// Slide classification and parsing
// ---------------------------------------------------------------------------

interface SlideData {
  layout: string;
  props: Record<string, any>;
}

function parseSlide(xml: string): SlideData {
  const bg = getSlideBg(xml);
  const shapes = extractShapes(xml);
  const groups = extractGroups(xml);

  // Detect callout groups (co-N-bg + co-N-icon)
  const calloutVariantMap: Record<string, string> = {
    FFFFFF: "card", F5F3EF: "code", EEF1FA: "info",
    FDF5EB: "warning", FAF0EB: "accent", ECFAF0: "success",
  };
  const callouts: Array<{ variant: string; text: string }> = [];
  const hasCallouts = groups.some((g) => g.includes('name="co-'));
  if (hasCallouts) {
    for (const g of groups) {
      if (!g.includes('name="co-')) continue;
      const fill = getShapeFill(g);
      const variant = (fill && calloutVariantMap[fill]) ?? "card";
      const text = extractText(g).trim();
      if (text) callouts.push({ variant, text });
    }
  }

  // Detect diagram shapes (diag-box-N, diag-ctr-N)
  const hasDiagram = shapes.some((s) => getShapeName(s).startsWith("diag-"))
    || groups.some((g) => g.includes('name="diag-'));

  // Separate shapes into categories
  const textShapes: Array<{ xml: string; text: string; fontSize: number; bold: boolean; x: number; w: number; fill?: string }> = [];
  const accentBars: string[] = [];
  const hasBullets: Array<{ xml: string; items: string[]; x: number }> = [];

  for (const s of shapes) {
    const name = getShapeName(s);

    // Skip diagram shapes — they'll be handled as blank slide
    if (name.startsWith("diag-")) continue;

    const text = extractText(s);
    const fontSize = getFontSize(s) ?? 0;
    const fill = getShapeFill(s);
    const w = getShapeW(s);
    const x = getShapeX(s);

    // Skip decorative curly-quote character (Fix #4)
    if (text === "\u201C" || text === "\u201D") continue;

    // Accent bar: colored fill, very thin height, no text
    if (fill && !text && s.match(/<a:ext[^>]*cy="(\d+)"/) ) {
      const h = parseInt(s.match(/<a:ext[^>]*cy="(\d+)"/)?.[1] ?? "0");
      if (h < 100000) { // less than ~1 inch
        accentBars.push(s);
        continue;
      }
    }

    // Bullet list: has bullet markers OR multiple paragraphs at body size with spacing
    const paragraphs = extractParagraphs(s);
    const isBulletList = s.includes("<a:buChar") || s.includes("<a:buBlip") || s.includes("<a:buAutoNum")
      || (paragraphs.length >= 2 && fontSize <= 20 && s.includes("<a:spcAft>"));
    if (isBulletList && paragraphs.length >= 2) {
      hasBullets.push({ xml: s, items: paragraphs, x });
      continue;
    }

    if (text) {
      textShapes.push({ xml: s, text, fontSize, bold: isBold(s), x, w, fill });
    }
  }

  // Sort text shapes by font size descending
  textShapes.sort((a, b) => b.fontSize - a.fontSize);

  // Check for code blocks
  const hasCodeBlock = groups.some((g) => g.includes("CodeBlock")) ||
    shapes.some((s) => getShapeName(s).startsWith("cb-"));

  // Check for table
  const hasTable = xml.includes("<a:tbl>");

  // Check for images (not callout icons)
  const hasImage = xml.includes("<p:pic") && !xml.includes('name="co-');

  // ---- Classify ----

  // DIAGRAM slide → blank with comment
  if (hasDiagram) {
    const heading = textShapes.find((s) => s.fontSize >= 24);
    const boxLabels = shapes
      .filter((s) => getShapeName(s).startsWith("diag-box-"))
      .map((s) => extractText(s).replace(/\n/g, " "))
      .filter(Boolean);
    return {
      layout: "blank",
      props: { _comment: `Diagram: ${heading?.text ?? ""}`, _boxes: boxLabels },
    };
  }

  // CALLOUT slide → blank with callout comments
  if (hasCallouts && callouts.length > 0) {
    const heading = textShapes.find((s) => s.fontSize >= 24);
    return {
      layout: "blank",
      props: { _comment: heading?.text ?? "Callout slide", _callouts: callouts },
    };
  }

  // CODE slide
  if (hasCodeBlock) {
    return parseCodeSlide(textShapes, shapes, groups);
  }

  // TABLE slide
  if (hasTable) {
    return parseTableSlide(xml, textShapes);
  }

  // TITLE or SECTION: large font, no bullets
  if (textShapes.length > 0 && hasBullets.length === 0 && !hasTable && !hasCodeBlock) {
    const maxFont = textShapes[0].fontSize;
    if (maxFont >= 36) {
      // Dark bg → title
      if (bg === "000000" || bg === "0D0D0D" || bg === "1A1A1A") {
        return parseTitleSection(textShapes, "title");
      }
      // Light bg with large font ≥ 40 → title (claude-doc uses same bg for title)
      if (maxFont >= 40) {
        return parseTitleSection(textShapes, "title");
      }
      return parseTitleSection(textShapes, "section");
    }
  }

  // QUOTE: italic text ≥ 20pt
  const quoteShape = textShapes.find((s) => s.xml.includes('i="1"') && s.fontSize >= 20);
  if (quoteShape && hasBullets.length === 0) {
    return parseQuoteSlide(textShapes);
  }

  // TWO-COLUMN: two separate bullet shapes
  if (hasBullets.length >= 2) {
    return parseTwoColumnSlide(textShapes, hasBullets);
  }

  // CONTENT: heading + bullets
  if (hasBullets.length === 1) {
    return parseContentSlide(textShapes, hasBullets[0]);
  }

  // BLANK with diagram boxes or other custom content
  if (textShapes.length > 0 && hasBullets.length === 0) {
    // Could be a diagram slide (blank + components) — treat as blank
    // But if it has a heading-sized text + multiple smaller texts, might still be content
    const heading = textShapes[0];
    const body = textShapes.slice(1).filter((s) => s.fontSize < heading.fontSize);
    if (body.length > 0 && heading.fontSize >= 24) {
      return {
        layout: "content",
        props: {
          title: heading.text,
          bullets: body.map((s) => s.text),
        },
      };
    }
  }

  return { layout: "blank", props: {} };
}

function parseTitleSection(textShapes: Array<{ text: string; fontSize: number; xml: string }>, type: "title" | "section"): SlideData {
  // Use paragraph-aware extraction to preserve newlines in multi-line titles
  const titleParas = textShapes[0] ? extractParagraphs(textShapes[0].xml) : [];
  const title = titleParas.length > 1 ? titleParas.join("\n") : (textShapes[0]?.text ?? "");
  const subtitle = textShapes.length > 1 && textShapes[1].fontSize < textShapes[0].fontSize
    ? textShapes[1].text : undefined;
  return { layout: type, props: { title, ...(subtitle ? { subtitle } : {}) } };
}

function parseContentSlide(
  textShapes: Array<{ text: string; fontSize: number; bold: boolean }>,
  bulletData: { items: string[] },
): SlideData {
  const heading = textShapes.find((s) => s.fontSize >= 24) ?? textShapes[0];
  const subtitle = textShapes.find(
    (s) => s !== heading && s.fontSize < (heading?.fontSize ?? 99) && !s.bold,
  );
  return {
    layout: "content",
    props: {
      title: heading?.text ?? "",
      ...(subtitle ? { subtitle: subtitle.text } : {}),
      bullets: bulletData.items,
    },
  };
}

function parseTwoColumnSlide(
  textShapes: Array<{ text: string; fontSize: number; bold: boolean; x: number }>,
  bulletData: Array<{ items: string[]; x: number }>,
): SlideData {
  const heading = textShapes.find((s) => s.fontSize >= 24) ?? textShapes[0];
  const colTitles = textShapes
    .filter((s) => s !== heading && s.bold && s.fontSize < (heading?.fontSize ?? 99))
    .sort((a, b) => a.x - b.x);
  const sortedBullets = bulletData.sort((a, b) => a.x - b.x);

  return {
    layout: "twoColumn",
    props: {
      title: heading?.text ?? "",
      ...(colTitles[0] ? { leftTitle: colTitles[0].text } : {}),
      ...(colTitles[1] ? { rightTitle: colTitles[1].text } : {}),
      left: sortedBullets[0]?.items ?? [],
      right: sortedBullets[1]?.items ?? [],
    },
  };
}

function parseCodeSlide(
  textShapes: Array<{ text: string; fontSize: number }>,
  shapes: string[],
  groups: string[],
): SlideData {
  const heading = textShapes.find((s) => s.fontSize >= 24);
  let code = "";
  let language: string | undefined;

  // Try grouped code block first
  const codeGroup = groups.find((g) => g.includes("CodeBlock"));
  if (codeGroup) {
    const innerShapes = extractShapes(codeGroup);
    for (const s of innerShapes) {
      const name = getShapeName(s);
      if (name.endsWith("-label")) language = extractText(s) || undefined;
      if (name.endsWith("-code")) code = extractParagraphs(s).join("\n");
    }
  }

  // Fallback: find cb-* shapes directly
  if (!code) {
    for (const s of shapes) {
      const name = getShapeName(s);
      if (name.includes("cb-") && name.endsWith("-label")) language = extractText(s) || undefined;
      if (name.includes("cb-") && name.endsWith("-code")) code = extractParagraphs(s).join("\n");
    }
  }

  // Fallback: find monospace text shape
  if (!code) {
    const monoShape = shapes.find(
      (s) => s.includes("JetBrains Mono") || s.includes("Menlo") || s.includes("Consolas"),
    );
    if (monoShape) code = extractParagraphs(monoShape).join("\n");
  }

  return {
    layout: "code",
    props: {
      title: heading?.text ?? "",
      code: code || "// code not extracted",
      ...(language ? { language } : {}),
    },
  };
}

function parseQuoteSlide(
  textShapes: Array<{ text: string; fontSize: number; xml: string }>,
): SlideData {
  const quoteShape = textShapes.find((s) => s.xml.includes('i="1"') && s.fontSize >= 20);
  const quote = quoteShape?.text ?? "";
  const attrShape = textShapes.find(
    (s) => s.text.startsWith("—") || s.text.startsWith("\u2014"),
  );
  const attribution = attrShape?.text.replace(/^[\u2014—]\s*/, "") || undefined;

  return {
    layout: "quote",
    props: { quote, ...(attribution ? { attribution } : {}) },
  };
}

function parseTableSlide(xml: string, textShapes: Array<{ text: string; fontSize: number }>): SlideData {
  const heading = textShapes.find((s) => s.fontSize >= 24);
  const headers: string[] = [];
  const rows: string[][] = [];

  const tblMatch = xml.match(/<a:tbl>[\s\S]*?<\/a:tbl>/);
  if (tblMatch) {
    // Split by <a:tr> rows
    const trMatches = [...tblMatch[0].matchAll(/<a:tr[\s>][\s\S]*?<\/a:tr>/g)];
    for (let i = 0; i < trMatches.length; i++) {
      const tr = trMatches[i][0];
      const cells = [...tr.matchAll(/<a:tc[\s>][\s\S]*?<\/a:tc>/g)].map((m) => extractText(m[0]));
      if (i === 0) headers.push(...cells);
      else rows.push(cells);
    }
  }

  return {
    layout: "table",
    props: { title: heading?.text ?? "", headers, rows },
  };
}

// ---------------------------------------------------------------------------
// Code generation
// ---------------------------------------------------------------------------

function escapeBacktick(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$");
}

function generateTs(slides: SlideData[], theme: DetectedTheme): string {
  const lines: string[] = [];
  lines.push(`import { Deck } from "../../src/index.js";`);
  lines.push(theme.imports);
  lines.push(``);
  lines.push(`export default function build() {`);
  lines.push(`  const deck = new Deck(${theme.constructor});`);

  for (const slide of slides) {
    lines.push(``);
    const p = slide.props;
    switch (slide.layout) {
      case "title":
      case "section":
        lines.push(`  deck.${slide.layout}({`);
        lines.push(`    title: ${JSON.stringify(p.title)},`);
        if (p.subtitle) lines.push(`    subtitle: ${JSON.stringify(p.subtitle)},`);
        lines.push(`  });`);
        break;
      case "content":
        lines.push(`  deck.content({`);
        lines.push(`    title: ${JSON.stringify(p.title)},`);
        if (p.subtitle) lines.push(`    subtitle: ${JSON.stringify(p.subtitle)},`);
        lines.push(`    bullets: ${JSON.stringify(p.bullets)},`);
        lines.push(`  });`);
        break;
      case "twoColumn":
        lines.push(`  deck.twoColumn({`);
        lines.push(`    title: ${JSON.stringify(p.title)},`);
        if (p.leftTitle) lines.push(`    leftTitle: ${JSON.stringify(p.leftTitle)},`);
        if (p.rightTitle) lines.push(`    rightTitle: ${JSON.stringify(p.rightTitle)},`);
        lines.push(`    left: ${JSON.stringify(p.left)},`);
        lines.push(`    right: ${JSON.stringify(p.right)},`);
        lines.push(`  });`);
        break;
      case "code":
        lines.push(`  deck.code({`);
        lines.push(`    title: ${JSON.stringify(p.title)},`);
        if (p.language) lines.push(`    language: ${JSON.stringify(p.language)},`);
        lines.push(`    code: \`${escapeBacktick(p.code)}\`,`);
        lines.push(`  });`);
        break;
      case "quote":
        lines.push(`  deck.quote({`);
        lines.push(`    quote: ${JSON.stringify(p.quote)},`);
        if (p.attribution) lines.push(`    attribution: ${JSON.stringify(p.attribution)},`);
        lines.push(`  });`);
        break;
      case "table":
        lines.push(`  deck.table({`);
        lines.push(`    title: ${JSON.stringify(p.title)},`);
        lines.push(`    headers: ${JSON.stringify(p.headers)},`);
        lines.push(`    rows: ${JSON.stringify(p.rows)},`);
        lines.push(`  });`);
        break;
      case "image":
        lines.push(`  deck.image({`);
        lines.push(`    title: ${JSON.stringify(p.title)},`);
        lines.push(`    imagePath: ${JSON.stringify(p.imagePath)},`);
        if (p.caption) lines.push(`    caption: ${JSON.stringify(p.caption)},`);
        lines.push(`  });`);
        break;
      case "blank":
        if (p._comment) lines.push(`  // ${p._comment}`);
        if (p._boxes) {
          lines.push(`  // Boxes: ${(p._boxes as string[]).join(" → ")}`);
        }
        if (p._callouts) {
          for (const c of p._callouts as Array<{ variant: string; text: string }>) {
            lines.push(`  // calloutBlock({ variant: "${c.variant}", body: "${c.text.substring(0, 60)}${c.text.length > 60 ? "..." : ""}" })`);
          }
        }
        lines.push(`  deck.blank();`);
        break;
    }
  }

  lines.push(``);
  lines.push(`  return deck;`);
  lines.push(`}`);
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const pptxPath = process.argv[2];
  if (!pptxPath) {
    console.error("Usage: npx tsx scripts/pptx-to-ts.ts <path-to-pptx>");
    process.exit(1);
  }

  const buf = readFileSync(pptxPath);
  const zip = await JSZip.loadAsync(buf);

  const themeXml = await (zip.file("ppt/theme/theme1.xml")?.async("string") ?? "");
  const presRels = await zip.file("ppt/_rels/presentation.xml.rels")!.async("string");
  const slideRefs = [...presRels.matchAll(/Target="(slides\/slide(\d+)\.xml)"/g)]
    .sort((a, b) => parseInt(a[2]) - parseInt(b[2]))
    .map((m) => m[1]);

  const slideXmls: string[] = [];
  for (const ref of slideRefs) {
    const file = zip.file(`ppt/${ref}`);
    if (file) slideXmls.push(await file.async("string"));
  }

  const theme = detectTheme(slideXmls, themeXml);
  const slides = slideXmls.map((xml) => parseSlide(xml));
  console.log(generateTs(slides, theme));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
