/**
 * Example: Elegant BW Demo
 *
 * Demonstrates the elegantBw theme with rich mixed-content slides,
 * layout helpers, diagrams, and component-level positioning.
 *
 * Build:  ./build.sh examples/elegant-bw-demo
 */

import { Deck, columns, below } from "../../src/index.js";
import { elegantBw } from "../../src/themes/elegant-bw/index.js";

export default async function build() {
  const deck = new Deck(elegantBw);

  // Footer: slide numbers + static text + academic citations
  deck.footer({
    slideNumber: true,
    text: "Spatial Intelligence — 2026",
    citationStyle: "author-year",
    skip: [1, 10],  // skip title and closing slides
  });

  // Bibliography
  deck.bib("mildenhall2020", { authors: ["Mildenhall", "Srinivasan", "Tancik", "Barron", "Ramamoorthi", "Ng"], year: 2020 });
  deck.bib("kerbl2023", { authors: ["Kerbl", "Kopanas", "Leimkühler", "Drettakis"], year: 2023 });
  deck.bib("li2024", { authors: ["Li", "Müller", "Evans", "Taylor", "Unberath"], year: 2024 });

  const {
    heading, accentBar, bodyText, bulletList, calloutBlock,
    codeBlock, equation, diagramBox, container, quoteBox,
  } = deck.components;
  const sp = deck.config.spacing;
  const cw = sp.slideWidth - sp.marginLeft - sp.marginRight;

  // ── 1. Title ──
  deck.title({ title: "Spatial Intelligence", subtitle: "Building AI that understands the 3D world" });

  // ── 2. Section ──
  deck.section({ title: "The Problem", subtitle: "AI sees pixels, not space" });

  // ── 3. Content with emoji bullets ──
  deck.content({
    title: "Why 3D Matters",
    bullets: [
      ":eye: Current vision models flatten the world to 2D",
      ":target: No understanding of depth, scale, or physics",
      ":gear: Robots and AR need spatial reasoning",
      ":globe: 3D is the native language of the physical world",
    ],
  });

  // ── 4. Two-column comparison ──
  deck.twoColumn({
    title: "2D Vision vs Spatial AI",
    leftTitle: "Traditional CV",
    rightTitle: "Spatial Intelligence",
    left: [
      "Pixel classification",
      "Flat bounding boxes",
      "No depth awareness",
      "Scene as texture",
    ],
    right: [
      "Volumetric understanding",
      "3D object graphs",
      "Full depth + occlusion",
      "Scene as geometry",
    ],
  });

  // ── 5. Diagram — Spatial AI Pipeline ──
  {
    const slide = deck.blank({ bg: "primary" });
    heading(slide, { text: "Spatial AI Pipeline", x: sp.marginLeft, y: sp.marginTop, w: cw });
    accentBar(slide, { x: sp.marginLeft, y: sp.marginTop + 0.8, w: 1.5 });

    const cx = sp.marginLeft + 0.3;
    const cy = sp.marginTop + 1.8;
    const bw = 2.8;
    const bh = 1.0;
    const gap = 1.2;

    const cont = container(slide, {
      label: "Spatial-v2 Pipeline",
      x: cx - 0.2, y: cy - 0.3, w: bw * 3 + gap * 2 + 0.4, h: bh + 1.6,
    });

    const boxA = diagramBox(slide, { text: "Multi-View\nImages", x: cx, y: cy + 0.3, w: bw, h: bh });
    const boxB = diagramBox(slide, { text: "Scene\nEncoder", x: cx + bw + gap, y: cy + 0.3, w: bw, h: bh });
    const boxC = diagramBox(slide, { text: "3D Scene\nGraph", x: cx + (bw + gap) * 2, y: cy + 0.3, w: bw, h: bh });

    deck.connector({ from: boxA.right, to: boxB.left, type: "straight" });
    deck.connector({ from: boxB.right, to: boxC.left, type: "straight" });

    bulletList(slide, {
      items: [
        "Input: calibrated multi-view captures from any camera rig",
        "Encoder: transforms pixels into volumetric 3D Gaussians",
        "Output: queryable scene graph with spatial relationships",
      ],
      x: sp.marginLeft, y: cy + bh + 1.8, w: cw,
    });
  }

  deck.cite("li2024"); // Spatial AI pipeline references

  // ── 6. Code ──
  deck.code({
    title: "Scene Encoding",
    language: "python",
    code: `import torch
from spatial_ai import SceneEncoder, GaussianSplat

# Encode a scene from multi-view images
encoder = SceneEncoder.from_pretrained("spatial-v2")
views = load_views("scene_captures/*.jpg")

scene = encoder.encode(views)
print(f"Scene: {scene.n_gaussians} gaussians")

# Query spatial relationships
chair = scene.find("chair")
table = scene.find("table")
dist = scene.distance(chair, table)
print(f"Distance: {dist:.2f}m")`,
  });

  // ── 7. Equation + variable definitions ──
  {
    const slide = deck.blank({ bg: "primary" });
    heading(slide, { text: "3D Gaussian Splatting", x: sp.marginLeft, y: sp.marginTop, w: cw });
    accentBar(slide, { x: sp.marginLeft, y: sp.marginTop + 0.8, w: 1.5 });

    const area = deck.contentArea();
    const eqRect = await equation(slide, {
      latex: String.raw`G(\mathbf{x}) = \exp\!\left(-\tfrac{1}{2}(\mathbf{x}-\boldsymbol{\mu})^\top \boldsymbol{\Sigma}^{-1} (\mathbf{x}-\boldsymbol{\mu})\right)`,
      x: area.x, y: area.y, w: area.w,
      label: "Gaussian kernel",
    });

    const mid = below(area, eqRect.h, 0.2);
    const eq2Rect = await equation(slide, {
      latex: String.raw`C(\mathbf{r}) = \sum_{i} c_i \alpha_i \prod_{j<i}(1-\alpha_j)`,
      x: mid.x, y: mid.y, w: mid.w,
      label: "Volume rendering",
    });

    const rest = below(mid, eq2Rect.h, 0.2);
    bulletList(slide, {
      items: [
        "x — 3D query point; \u03BC, \u03A3 — Gaussian mean and covariance",
        "c_i — per-Gaussian color; \u03B1_i — opacity from kernel evaluation",
        "Differentiable end-to-end: optimize from posed images alone",
      ],
      ...rest,
    });
  }

  deck.cite("kerbl2023", "mildenhall2020"); // Gaussian splatting + NeRF

  // ── 8. Table ──
  deck.table({
    title: "Model Benchmarks",
    headers: ["Model", "Depth MAE", "Novel View PSNR", "3D IoU"],
    rows: [
      ["Baseline CNN", "0.42m", "22.1 dB", "0.31"],
      ["NeRF-based", "0.28m", "28.4 dB", "0.52"],
      ["Gaussian Splat", "0.15m", "31.7 dB", "0.68"],
      ["Spatial-v2", "0.08m", "34.2 dB", "0.81"],
    ],
  });

  // ── 9. Callout + quote ──
  {
    const slide = deck.blank({ bg: "primary" });
    heading(slide, { text: "Key Insight", x: sp.marginLeft, y: sp.marginTop, w: cw });
    accentBar(slide, { x: sp.marginLeft, y: sp.marginTop + 0.8, w: 1.5 });

    const area = deck.contentArea();
    const calloutRect = await calloutBlock(slide, {
      variant: "info",
      x: area.x, y: area.y, w: area.w, h: 1.2,
      body: "Spatial-v2 closes 73% of the gap between traditional NeRF and ground truth on novel view synthesis, while running 40x faster at inference time.",
    });

    const rest = below(area, calloutRect.h, 0.4);
    quoteBox(slide, {
      quote: "The next frontier of AI is not just seeing the world, but understanding its geometry.",
      attribution: "Fei-Fei Li",
      x: rest.x, y: rest.y, w: rest.w, h: 2.5,
    });
  }

  // ── 10. Closing ──
  deck.title({ title: "The Future\nis Spatial" });

  return deck;
}
