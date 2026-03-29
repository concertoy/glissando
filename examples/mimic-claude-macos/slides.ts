/**
 * Example: Preset Demo
 *
 * Demonstrates switching font presets.
 * Change the import below to try different typography.
 *
 * Build:  ./build.sh examples/mimic-claude-macos
 */

import { Deck, columns, rows, below, inset } from "../../src/index.js";
import { claudeDoc, applyPreset } from "../../src/themes/claude-doc/index.js";
import { macosNative } from "../../src/themes/claude-doc/presets.js";

export default async function build() {
  const deck = new Deck(applyPreset(claudeDoc, macosNative));

  deck.title({
    title: "macOS Native Fonts",
    subtitle: "Iowan Old Style (headings) + Avenir Next (body) + Menlo",
  });

  deck.content({
    title: "Typography Check",
    bullets: [
      "Headings use Iowan Old Style Bold (32/26/22pt)",
      "Body text uses Avenir Next Regular (16pt, line-height 1.6)",
      "Table content uses Iowan Old Style (14pt)",
      "Captions use Avenir Next Medium (13pt)",
      "Code uses Menlo (pre-installed on macOS)",
    ],
  });

  deck.code({
    title: "Code in Menlo",
    language: "python",
    code: [
      "def greet(name: str) -> str:",
      '    return f"Hello, {name}!"',
      "",
      'print(greet("world"))',
    ].join("\n"),
  });

  deck.code({
    title: "Longer Example",
    language: "python",
    code: [
      "import requests",
      "import time",
      "",
      "def fetch_with_retry(url, retries=3):",
      "    for i in range(retries):",
      "        resp = requests.get(url)",
      "        if resp.ok:",
      "            return resp.json()",
      "        time.sleep(2 ** i)",
      '    raise RuntimeError("all retries failed")',
    ].join("\n"),
  });

  // Narrow code block
  {
    const slide = deck.blank({ bg: "primary" });
    const { heading: hd, accentBar: bar, codeBlock: cb } = deck.components;
    const sp = deck.config.spacing;
    const contentW = sp.slideWidth - sp.marginLeft - sp.marginRight;

    hd(slide, { text: "Narrow Code Block", x: sp.marginLeft, y: sp.marginTop, w: contentW });
    bar(slide, { x: sp.marginLeft, y: sp.marginTop + 0.8, w: 1.5 });

    cb(slide, {
      code: [
        "x = 42",
        "y = x ** 2",
        'print(f"{x}² = {y}")',
      ].join("\n"),
      language: "python",
      x: sp.marginLeft,
      y: sp.marginTop + 1.3,
      w: 5,
    });
  }

  // --- Callout blocks showcase ---
  {
    const slide = deck.blank({ bg: "primary" });
    const { heading: h, accentBar: bar, calloutBlock: cb } = deck.components;
    const sp = deck.config.spacing;
    const contentW = sp.slideWidth - sp.marginLeft - sp.marginRight;

    h(slide, { text: "Callout Blocks", x: sp.marginLeft, y: sp.marginTop, w: contentW });
    bar(slide, { x: sp.marginLeft, y: sp.marginTop + 0.8, w: 1.5 });

    const colW = (contentW - 0.4) / 2;
    const rightX = sp.marginLeft + colW + 0.4;
    const row1Y = sp.marginTop + 1.2;
    const row2Y = row1Y + 2.2;

    // Row 1: Card (pencil) + Info (info circle)
    await cb(slide, {
      variant: "card", x: sp.marginLeft, y: row1Y, w: colW, h: 1.9,
      body: "Clean white panel with subtle border. Use for general content, summaries, or feature highlights.",
    });

    await cb(slide, {
      variant: "info", x: rightX, y: row1Y, w: colW, h: 1.9,
      body: "Blue-tinted callout for tips, notes, and helpful information that supplements the main content.",
    });

    // Row 2: Warning (triangle-alert) + Accent (circle-check)
    await cb(slide, {
      variant: "warning", x: sp.marginLeft, y: row2Y, w: colW, h: 1.9,
      body: "Amber callout for cautions, deprecation notices, or important caveats the reader should know.",
    });

    await cb(slide, {
      variant: "accent", x: rightX, y: row2Y, w: colW, h: 1.9,
      bullets: [
        "Terra cotta tinted panel",
        "Ties back to the brand accent #DA7756",
        "Use for key takeaways or featured items",
      ],
    });

    // Row 3: Code (lightbulb) — full width
    await cb(slide, {
      variant: "code", x: sp.marginLeft, y: row2Y + 2.2, w: contentW, h: 1.0,
      body: "Warm grey panel for inline code references, CLI instructions, or config snippets.",
    });
  }

  // --- Text blocks showcase ---
  {
    const slide = deck.blank({ bg: "primary" });
    const { heading: h, accentBar: bar, textBlock: tb } = deck.components;
    const sp = deck.config.spacing;
    const contentW = sp.slideWidth - sp.marginLeft - sp.marginRight;

    h(slide, { text: "Text Blocks", x: sp.marginLeft, y: sp.marginTop, w: contentW });
    bar(slide, { x: sp.marginLeft, y: sp.marginTop + 0.8, w: 1.5 });

    const colW = (contentW - 0.4) / 2;
    const rightX = sp.marginLeft + colW + 0.4;

    // Title + subtitle + body
    tb(slide, {
      x: sp.marginLeft, y: sp.marginTop + 1.2, w: colW,
      title: "What is glissando?",
      subtitle: "A TypeScript library for slide decks",
      body: "Write code, get native editable PPTX. Designed for AI coding agents — the agent provides content, the theme handles all visual design.",
    });

    // Title + bullets
    tb(slide, {
      x: rightX, y: sp.marginTop + 1.2, w: colW,
      title: "Key Features",
      subtitle: "Why choose glissando",
      bullets: [
        "Native PPTX output — editable in PowerPoint",
        "Theme system with font presets",
        "Built-in syntax highlighting",
        "Diagram components with OOXML connectors",
      ],
    });

    // Full-width with custom colors
    tb(slide, {
      x: sp.marginLeft, y: sp.marginTop + 4.4, w: contentW,
      title: "Custom Styling",
      body: "Text blocks accept custom fill, border, and text colors. This block uses a warm accent background with a terra cotta border.",
      fill: "FAF0EB", border: "C9A08E",
    });
  }

  // --- Diagram: Coding Assistant Architecture ---
  {
    const slide = deck.blank({ bg: "primary" });
    const { heading: hd, accentBar: bar, diagramBox: box, container: ctr, bodyText: bt } = deck.components;
    const sp = deck.config.spacing;
    const contentW = sp.slideWidth - sp.marginLeft - sp.marginRight;

    hd(slide, { text: "How a Coding Assistant Works", x: sp.marginLeft, y: sp.marginTop, w: contentW });
    bar(slide, { x: sp.marginLeft, y: sp.marginTop + 0.8, w: 1.5 });

    // ---- Create shapes (all return ShapeRef with connection points) ----

    bt(slide, { text: "Task", x: 0.5, y: 2.15, w: 2.8, italic: true, color: "3B3B39" });
    const task = box(slide, {
      text: "Got an error.\nFind and fix the issue.",
      x: 0.5, y: 2.5, w: 2.8, h: 2.4,
      fill: "FFFFFF", border: "B8B8B8", fontSize: 14, bold: false,
    });

    ctr(slide, { label: "Assistant", x: 4.2, y: 1.8, w: 8.5, h: 5.0, fill: "F9F9F7", border: "B8B8B8" });

    const lm = box(slide, {
      text: "Language\nModel",
      x: 4.7, y: 3.0, w: 2.2, h: 1.6,
      fill: "FFFFFF", border: "DA7756", borderWidth: 2, fontSize: 20,
    });

    const tools = box(slide, {
      text: "Set of\ntools",
      x: 4.7, y: 5.2, w: 2.2, h: 1.2,
      fill: "FFFFFF", border: "D4C9A0", borderWidth: 1.5, fontSize: 18,
    });

    const gc = box(slide, {
      text: "Gather context",
      x: 7.8, y: 2.3, w: 3.2, h: 0.9,
      fill: "E8DFC4", border: "D4C9A0", fontSize: 18, textColor: "0D0D0D",
    });

    const fp = box(slide, {
      text: "Formulate a plan",
      x: 7.8, y: 3.7, w: 3.2, h: 0.9,
      fill: "D4956C", border: "C07A50", fontSize: 18, textColor: "FFFFFF",
    });

    const ta = box(slide, {
      text: "Take an action",
      x: 7.8, y: 5.1, w: 3.2, h: 0.9,
      fill: "B8613D", border: "9A4E30", fontSize: 18, textColor: "FFFFFF",
    });

    // ---- Connectors (all native OOXML — move with shapes) ----
    const ac = "999999";

    // Task → LM
    deck.connector({ from: task.right, to: lm.left, color: ac });

    // LM → GC / FP / TA (3 elbow connectors — all bend at the same X, forming a trident)
    deck.connector({ from: lm.right, to: gc.left,  color: ac, type: "elbow" });
    deck.connector({ from: lm.right, to: fp.left,  color: ac, type: "elbow" });
    deck.connector({ from: lm.right, to: ta.left,  color: ac, type: "elbow" });

    // GC → FP → TA vertical chain
    deck.connector({ from: gc.bottom, to: fp.top, color: ac });
    deck.connector({ from: fp.bottom, to: ta.top, color: ac });

    // LM ↔ Tools (bidirectional)
    deck.connector({ from: lm.bottom, to: tools.top, color: ac, head: "arrow", tail: "arrow" });

    // Iterate arc: TA → GC (curved connector with label)
    deck.connector({
      from: ta.right, to: gc.right,
      type: "curved", color: ac,
      label: "Iterate",
    });
  }

  // --- Equation slide (layout) ---
  await deck.equation({
    title: "Key Equations",
    equations: [
      { latex: "E = mc^2", label: "Mass–energy equivalence" },
      { latex: "\\nabla \\times \\mathbf{E} = -\\frac{\\partial \\mathbf{B}}{\\partial t}", label: "Faraday's law" },
      { latex: "\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}", label: "Gaussian integral" },
    ],
  });

  // --- Equation component (custom slide) ---
  {
    const slide = deck.blank({ bg: "primary" });
    const { heading: hd, accentBar: bar, equation: eq } = deck.components;
    const sp = deck.config.spacing;
    const contentW = sp.slideWidth - sp.marginLeft - sp.marginRight;

    hd(slide, { text: "Bayes' Theorem", x: sp.marginLeft, y: sp.marginTop, w: contentW });
    bar(slide, { x: sp.marginLeft, y: sp.marginTop + 0.8, w: 1.5 });

    await eq(slide, {
      latex: "P(A \\mid B) = \\frac{P(B \\mid A)\\, P(A)}{P(B)}",
      x: sp.marginLeft + 1,
      y: sp.marginTop + 1.5,
      w: contentW - 2,
    });
  }

  deck.quote({
    quote: "Typography is the craft of endowing human language with a durable visual form.",
    attribution: "Robert Bringhurst",
  });

  // === MULTI-COMPONENT LAYOUT DEMOS ===

  deck.section({ title: "Layout Helpers", subtitle: "Arranging multiple components on a single slide" });

  // --- Two-column: code + callout ---
  {
    const slide = deck.blank({ bg: "primary" });
    const { heading: hd, accentBar: bar, codeBlock: cb, calloutBlock: co } = deck.components;
    const area = deck.contentArea();

    hd(slide, { text: "Two-Column Layout", x: area.x, y: area.y - 1.15, w: area.w });
    bar(slide, { x: area.x, y: area.y - 0.35, w: 1.5 });

    const [left, right] = columns(area, 2, 0.4);
    cb(slide, { code: "const area = deck.contentArea();\nconst [left, right] = columns(area, 2);\ncodeBlock(slide, { ...left });\ncalloutBlock(slide, { ...right });", language: "typescript", ...left });
    await co(slide, { variant: "info", ...right, body: "Layout helpers split the content area into columns. Spread the Rect into component props — x, y, w, h are filled automatically." });
  }

  // --- Three-column cards ---
  {
    const slide = deck.blank({ bg: "primary" });
    const { heading: hd, accentBar: bar, textBlock: tb } = deck.components;
    const area = deck.contentArea();

    hd(slide, { text: "Three-Column Cards", x: area.x, y: area.y - 1.15, w: area.w });
    bar(slide, { x: area.x, y: area.y - 0.35, w: 1.5 });

    const cols = columns(area, 3, 0.3);
    tb(slide, { ...cols[0], title: "Theme", subtitle: "Config + Components + Layouts", body: "The theme handles colors, fonts, and spacing. Agents only provide content." });
    tb(slide, { ...cols[1], title: "Components", subtitle: "Pre-designed elements", body: "Code blocks, callouts, equations, diagrams — each themed and auto-sized." });
    tb(slide, { ...cols[2], title: "Layouts", subtitle: "Slide arrangements", body: "Title, content, two-column, code, quote, image, table, equation, and blank." });
  }

  // --- Vertical stacking with auto-height ---
  {
    const slide = deck.blank({ bg: "primary" });
    const { heading: hd, accentBar: bar, equation: eq, bulletList: bl } = deck.components;
    const area = deck.contentArea();

    hd(slide, { text: "Vertical Stacking", x: area.x, y: area.y - 1.15, w: area.w });
    bar(slide, { x: area.x, y: area.y - 0.35, w: 1.5 });

    const eqRect = await eq(slide, {
      latex: "\\mathcal{L}(\\theta) = -\\mathbb{E}_{q(z|x)}\\left[\\log p_\\theta(x|z)\\right] + D_{KL}\\left(q(z|x) \\| p(z)\\right)",
      x: area.x, y: area.y, w: area.w,
    });

    const rest = below(area, eqRect.h, 0.2);
    bl(slide, {
      items: [
        "L(theta) — the variational loss (ELBO)",
        "q(z|x) — encoder (approximate posterior)",
        "p(x|z) — decoder (generative model)",
        "D_KL — KL divergence regularizer",
      ],
      ...rest,
    });
  }

  // --- 2x2 grid ---
  {
    const slide = deck.blank({ bg: "primary" });
    const { heading: hd, accentBar: bar, calloutBlock: co } = deck.components;
    const area = deck.contentArea();

    hd(slide, { text: "2x2 Grid Layout", x: area.x, y: area.y - 1.15, w: area.w });
    bar(slide, { x: area.x, y: area.y - 0.35, w: 1.5 });

    const [top, bot] = rows(area, 2, 0.3);
    const [tl, tr] = columns(top, 2, 0.4);
    const [bl, br] = columns(bot, 2, 0.4);

    await co(slide, { variant: "card", ...tl, body: "Top-left: rows() splits vertically, columns() splits horizontally." });
    await co(slide, { variant: "info", ...tr, body: "Top-right: combine rows + columns for any grid arrangement." });
    await co(slide, { variant: "warning", ...bl, body: "Bottom-left: each cell is a Rect with { x, y, w, h } — spread into any component." });
    await co(slide, { variant: "accent", ...br, bullets: ["below() for vertical stacking", "columns() for side-by-side", "rows() for row-based grids", "inset() to add padding"] });
  }

  // ── Table layout ──
  deck.table({
    title: "Font Preset Comparison",
    headers: ["Preset", "Headings", "Body", "Code"],
    rows: [
      ["default", "DM Serif Display", "Inter", "JetBrains Mono"],
      ["macosNative", "Iowan Old Style", "Avenir Next", "Menlo"],
      ["googleFonts", "Libre Baskerville", "Space Grotesk", "JetBrains Mono"],
    ],
  });

  // ── twoColumn layout ──
  deck.twoColumn({
    title: "Layouts vs Components",
    leftTitle: "Layouts",
    rightTitle: "Components",
    left: [
      "One function call per slide",
      "Pre-designed arrangements",
      "title, content, code, quote, table",
    ],
    right: [
      "Place on blank() slides",
      "Full position control",
      "bulletList, calloutBlock, diagramBox...",
    ],
  });

  // ── numberedList ──
  {
    const slide = deck.blank({ bg: "primary" });
    const { heading: hd, accentBar: bar, numberedList: nl } = deck.components;
    const area = deck.contentArea();
    hd(slide, { text: "Numbered List", x: area.x, y: area.y - 1.15, w: area.w });
    bar(slide, { x: area.x, y: area.y - 0.35, w: 1.5 });
    nl(slide, {
      items: [
        "Pick a theme — claudeDoc, basicWhite, or elegantBw",
        "Write slides.ts using layouts and components",
        "Build with ./build.sh to generate native PPTX",
        "Verify with render-slide.ts for pixel-perfect output",
      ],
      ...area,
    });
  }

  // ── inset() helper demo ──
  {
    const slide = deck.blank({ bg: "primary" });
    const { heading: hd, accentBar: bar, textBlock: tb } = deck.components;
    const area = deck.contentArea();
    hd(slide, { text: "Inset Helper", x: area.x, y: area.y - 1.15, w: area.w });
    bar(slide, { x: area.x, y: area.y - 0.35, w: 1.5 });
    const padded = inset(area, 0.3);
    tb(slide, {
      ...padded,
      title: "Padded Region",
      body: "inset(rect, 0.3) shrinks all four sides by 0.3 inches. Use CSS-style args: inset(rect, top, right, bottom, left) for asymmetric padding.",
      bullets: [
        "Shrink any Rect uniformly or per-side",
        "Chain with columns(), rows(), below()",
        "Keeps layout math clean and readable",
      ],
    });
  }

  deck.title({
    title: "Thank You",
  });

  return deck;
}
