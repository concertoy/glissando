/**
 * Example: Academia Theme Demo
 *
 * Demonstrates the academia theme — Beamer-inspired header bands,
 * navy + gold palette, classic serif typography.
 *
 * Build:  ./build.sh examples/academia-demo
 */

import { Deck, below } from "../../src/index.js";
import { academia } from "../../src/themes/academia/index.js";

export default async function build() {
  const deck = new Deck(academia);

  const sp = deck.config.spacing;
  const cw = sp.slideWidth - sp.marginLeft - sp.marginRight;
  const c = deck.config.colors;
  const f = deck.config.fonts;
  const s = deck.config.sizes;

  // Footer: slide numbers + conference line + citations
  deck.footer({
    slideNumber: true,
    slideNumberFormat: "n / N",
    text: "Momo et al. — ICML 2026",
    citationStyle: "author-year",
    skip: [1, 9],
  });

  // Bibliography
  deck.bib("vaswani2017", { authors: ["Vaswani", "Shazeer", "Parmar", "Uszkoreit", "Jones", "Gomez", "Kaiser", "Polosukhin"], year: 2017 });
  deck.bib("brown2020", { authors: ["Brown", "Mann", "Ryder", "Subbiah", "Kaplan"], year: 2020 });
  deck.bib("wei2022", { authors: ["Wei", "Wang", "Schuurmans", "Bosma", "Chi", "Le", "Zhou"], year: 2022 });
  deck.bib("touvron2023", { authors: ["Touvron", "Lavril", "Izacard", "Martinet", "Lachaux"], year: 2023 });

  const { bulletList, equation, diagramBox, container } = deck.components;

  // ── 1. Title — split design: white bg, navy band, gold rule ──
  deck.title({
    title: "Adaptive Sparse Attention\nfor Long-Context Reasoning",
    subtitle: "Momo, Mimi, Mama — University of Example",
  });

  // ── 2. Section — navy bg, centered with gold underline ──
  deck.section({ title: "Motivation", subtitle: "The long-context bottleneck" });

  // ── 3. Content — header band + bullets with build ──
  deck.content({
    title: "The Challenge",
    subtitle: "Standard attention scales quadratically with sequence length",
    bullets: [
      "Transformer self-attention: $O(n^2)$ time and memory",
      "Long documents (>32k tokens) exceed GPU memory budgets",
      "Existing sparse methods sacrifice quality for efficiency",
      "No principled way to learn which tokens to attend to",
    ],
    build: true,
  });

  deck.cite("vaswani2017");

  // ── 4. Two-column — header band + gold vertical divider ──
  deck.twoColumn({
    title: "Prior Approaches",
    leftTitle: "Fixed Sparse Patterns",
    rightTitle: "Our Approach",
    left: [
      "Sliding window (local only)",
      "Strided attention (periodic gaps)",
      "Block-sparse (fixed blocks)",
      "Pattern chosen at design time",
    ],
    right: [
      "Learned routing per layer",
      "Content-aware token selection",
      "Adaptive budget allocation",
      "Pattern emerges from training",
    ],
  });

  deck.cite("brown2020", "touvron2023");

  // ── 5. Diagram on blank — custom header band + boxes ──
  {
    const slide = deck.blank({ bg: "primary" });

    // Manually draw the header band for custom slides
    slide.addShape("rect", { x: 0, y: 0, w: sp.slideWidth, h: 1.0, fill: { color: c.bgDark } });
    slide.addText("Method Overview", {
      x: sp.marginLeft, y: 0.1, w: cw, h: 0.8,
      fontSize: s.heading, fontFace: f.heading, color: c.textOnDark, bold: true, valign: "middle",
    });
    slide.addShape("rect", { x: 0, y: 1.0, w: sp.slideWidth, h: 0.04, fill: { color: c.accentBlue } });

    const cx = sp.marginLeft + 0.4;
    const cy = 1.6;
    const bw = 2.4;
    const bh = 1.0;
    const gap = 0.8;

    container(slide, {
      label: "Adaptive Sparse Attention Layer",
      x: cx - 0.2, y: cy, w: bw * 4 + gap * 3 + 0.4, h: bh + 1.4,
    });

    const boxA = diagramBox(slide, { text: "Input\nTokens", x: cx, y: cy + 0.5, w: bw, h: bh });
    const boxB = diagramBox(slide, { text: "Router\nNetwork", x: cx + bw + gap, y: cy + 0.5, w: bw, h: bh });
    const boxC = diagramBox(slide, { text: "Sparse\nAttention", x: cx + (bw + gap) * 2, y: cy + 0.5, w: bw, h: bh });
    const boxD = diagramBox(slide, { text: "Output\nTokens", x: cx + (bw + gap) * 3, y: cy + 0.5, w: bw, h: bh });

    deck.connector({ from: boxA.right, to: boxB.left, type: "straight" });
    deck.connector({ from: boxB.right, to: boxC.left, type: "straight", label: "top-k" });
    deck.connector({ from: boxC.right, to: boxD.left, type: "straight" });

    bulletList(slide, {
      items: [
        "Router predicts attention scores in $O(n \\log n)$ via locality-sensitive hashing",
        "Top-k selection produces sparse pattern per query (k << n)",
        "Attention computed only on selected pairs: $O(nk)$ total cost",
      ],
      x: sp.marginLeft, y: cy + bh + 2.0, w: cw,
    });
  }

  // ── 6. Equation — header band + LaTeX ──
  {
    const slide = deck.blank({ bg: "primary" });
    slide.addShape("rect", { x: 0, y: 0, w: sp.slideWidth, h: 1.0, fill: { color: c.bgDark } });
    slide.addText("Formal Definition", {
      x: sp.marginLeft, y: 0.1, w: cw, h: 0.8,
      fontSize: s.heading, fontFace: f.heading, color: c.textOnDark, bold: true, valign: "middle",
    });
    slide.addShape("rect", { x: 0, y: 1.0, w: sp.slideWidth, h: 0.04, fill: { color: c.accentBlue } });

    const startY = 1.5;
    const eqW = cw * 0.6;
    const eqX = sp.marginLeft + (cw - eqW) / 2;

    const eq1 = await equation(slide, {
      latex: String.raw`\text{Attn}(Q, K, V) = \text{softmax}\!\left(\frac{Q K^\top}{\sqrt{d_k}} \odot M_\theta\right) V`,
      x: eqX, y: startY, w: eqW,
      label: "Masked attention with learned sparsity",
    });

    const eq2Y = startY + eq1.h + 0.15;
    const eq2 = await equation(slide, {
      latex: String.raw`M_\theta(i,j) = \mathbb{1}\!\left[ r_\theta(q_i, k_j) \geq \tau \right]`,
      x: eqX, y: eq2Y, w: eqW,
      label: "Binary routing mask",
    });

    bulletList(slide, {
      items: [
        "$M_\\theta$ — learned binary mask from router network $r_\\theta$",
        "$\\tau$ — adaptive threshold (annealed during training)",
        "Straight-through estimator for gradient flow",
      ],
      x: sp.marginLeft, y: eq2Y + eq2.h + 0.15, w: cw,
    });
  }

  // ── 7. Code — header band + code block ──
  deck.code({
    title: "Implementation",
    language: "python",
    code: `class AdaptiveSparseAttention(nn.Module):
    def __init__(self, d_model, n_heads, k=256):
        super().__init__()
        self.router = LSHRouter(d_model, n_buckets=32)
        self.attn = nn.MultiheadAttention(d_model, n_heads)
        self.k = k  # tokens per query

    def forward(self, x):
        # Route: predict top-k keys per query
        scores = self.router(x)           # (B, N, N)
        mask = scores.topk(self.k, dim=-1)

        # Attend: sparse masked attention
        return self.attn(x, x, x, attn_mask=mask)`,
  });

  // ── 8. Table — header band + results with best values highlighted ──
  {
    const slide = deck.blank({ bg: "primary" });
    slide.addShape("rect", { x: 0, y: 0, w: sp.slideWidth, h: 1.0, fill: { color: c.bgDark } });
    slide.addText("Main Results \u2014 Long-Range Arena", {
      x: sp.marginLeft, y: 0.1, w: cw, h: 0.8,
      fontSize: s.heading, fontFace: f.heading, color: c.textOnDark, bold: true, valign: "middle",
    });
    slide.addShape("rect", { x: 0, y: 1.0, w: sp.slideWidth, h: 0.04, fill: { color: c.accentBlue } });

    // Cell style helpers
    const hdrCell = (text: string) => ({
      text, options: {
        fontSize: s.small, fontFace: f.sans, color: c.textOnDark, bold: true,
        fill: { color: c.bgDark }, align: "center" as const,
        border: [
          { type: "none" as const }, { type: "none" as const },
          { pt: 1.5, color: c.accentBlue }, { type: "none" as const },
        ],
      },
    });
    const cell = (text: string) => ({
      text, options: {
        fontSize: s.small, fontFace: f.sans, color: c.textSecondary,
        align: "center" as const,
        border: [
          { type: "none" as const }, { type: "none" as const },
          { pt: 0.5, color: "E0E0E0" }, { type: "none" as const },
        ],
      },
    });
    const nameCell = (text: string) => ({
      text, options: {
        fontSize: s.small, fontFace: f.sans, color: c.text,
        bold: true, align: "left" as const,
        border: [
          { type: "none" as const }, { type: "none" as const },
          { pt: 0.5, color: "E0E0E0" }, { type: "none" as const },
        ],
      },
    });
    // Best value cell — gold bold
    const bestCell = (text: string) => ({
      text, options: {
        fontSize: s.small, fontFace: f.sans, color: c.accentBlue,
        bold: true, align: "center" as const,
        border: [
          { type: "none" as const }, { type: "none" as const },
          { pt: 0.5, color: "E0E0E0" }, { type: "none" as const },
        ],
      },
    });
    // "Ours" row name — gold bold
    const oursNameCell = (text: string) => ({
      text, options: {
        fontSize: s.small, fontFace: f.sans, color: c.accentBlue,
        bold: true, align: "left" as const,
        fill: { color: "F8F5EC" },
        border: [
          { type: "none" as const }, { type: "none" as const },
          { pt: 1.5, color: c.accent }, { type: "none" as const },
        ],
      },
    });
    const oursBestCell = (text: string) => ({
      text, options: {
        fontSize: s.small, fontFace: f.sans, color: c.accentBlue,
        bold: true, align: "center" as const,
        fill: { color: "F8F5EC" },
        border: [
          { type: "none" as const }, { type: "none" as const },
          { pt: 1.5, color: c.accent }, { type: "none" as const },
        ],
      },
    });

    const tableRows = [
      [hdrCell("Model"), hdrCell("ListOps"), hdrCell("Text"), hdrCell("Retrieval"), hdrCell("Avg"), hdrCell("Speed")],
      [nameCell("Full Attention"), cell("38.4"), cell("65.2"), cell("81.1"), cell("61.6"), cell("1.0x")],
      [nameCell("Linformer"),      cell("37.0"), cell("53.9"), cell("79.4"), cell("56.8"), cell("4.2x")],
      [nameCell("Performer"),      cell("18.0"), cell("65.4"), cell("53.8"), cell("45.7"), cell("3.8x")],
      [nameCell("BigBird"),        cell("36.1"), cell("64.0"), cell("59.3"), cell("53.1"), cell("3.1x")],
      [oursNameCell("Ours"),       oursBestCell("39.2"), oursBestCell("66.1"), oursBestCell("82.3"), oursBestCell("62.5"), oursBestCell("5.7x")],
    ];

    slide.addTable(tableRows as any, {
      x: sp.marginLeft, y: 1.5, w: cw,
      rowH: 0.45,
      colW: [2.5, ...Array(5).fill((cw - 2.5) / 5)],
      margin: [4, 8, 4, 8],
    });
  }

  deck.cite("wei2022");

  // ── 9. Closing ──
  deck.title({
    title: "Thank You",
    subtitle: "momo@example.edu  \u2022  github.com/example/sparse-attn",
  });

  return deck;
}
