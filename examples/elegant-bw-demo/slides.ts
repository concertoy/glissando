import { Deck } from "../../src/index.js";
import { elegantBw } from "../../src/themes/elegant-bw/index.js";

export default async function build() {
  const deck = new Deck(elegantBw);

  deck.title({ title: "Spatial Intelligence", subtitle: "Building AI that understands the 3D world" });

  deck.section({ title: "The Problem", subtitle: "AI sees pixels, not space" });

  deck.content({
    title: "Why 3D Matters",
    bullets: [
      "Current vision models flatten the world to 2D",
      "No understanding of depth, scale, or physics",
      "Robots and AR need spatial reasoning",
      "3D is the native language of the physical world",
    ],
  });

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

  deck.code({
    title: "3D Scene Representation",
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

  await deck.equation({
    title: "3D Gaussian Splatting",
    equations: [
      { latex: "G(x) = e^{-\\frac{1}{2}(x-\\mu)^T \\Sigma^{-1} (x-\\mu)}", label: "Gaussian kernel" },
      { latex: "C(r) = \\sum_{i} c_i \\alpha_i \\prod_{j<i}(1-\\alpha_j)", label: "Volume rendering" },
    ],
  });

  deck.title({ title: "The Future\nis Spatial" });

  return deck;
}
