import { Deck } from "../../src/index.js";
import { claudeDoc } from "../../src/themes/claude-doc/index.js";

export default function build() {
  const deck = new Deck(claudeDoc);

  // Slide 1: Title
  deck.title({ title: "On-Device AI", subtitle: "Running Intelligence at the Edge" });

  // Slide 2: Why on-device?
  deck.content({
    title: "Why On-Device AI?",
    bullets: [
      "Zero-latency inference — no round-trip to the cloud",
      "Privacy by default — data never leaves the device",
      "Works offline — no network dependency",
      "Lower cost at scale — no per-request API fees",
    ],
  });

  // Slide 3: Cloud vs On-Device comparison
  deck.twoColumn({
    title: "Cloud vs On-Device",
    leftTitle: "Cloud Inference",
    rightTitle: "On-Device Inference",
    left: [
      "High-capacity models (100B+ params)",
      "Network latency (50–500ms)",
      "Pay per request",
      "Data leaves your control",
    ],
    right: [
      "Compact models (1–7B params)",
      "Sub-10ms inference",
      "One-time deployment cost",
      "Full data sovereignty",
    ],
  });

  // Slide 4: Architecture diagram
  const archSlide = deck.blank({ bg: "primary" });
  const { heading, diagramBox, arrow, container } = deck.components;

  heading(archSlide, { text: "On-Device Inference Pipeline", x: 0.8, y: 0.6, w: 11 });

  // Container for the pipeline
  container(archSlide, { label: "Device Runtime", x: 0.8, y: 1.8, w: 11.7, h: 4.5, fill: "F9F8F5" });

  // Pipeline boxes
  const input = diagramBox(archSlide, { text: "Input\nSensor / Camera", x: 1.2, y: 2.8, w: 2.2, h: 1.2 });
  const preprocess = diagramBox(archSlide, { text: "Preprocessing\nResize / Normalize", x: 4.0, y: 2.8, w: 2.2, h: 1.2 });
  const model = diagramBox(archSlide, { text: "Model\nONNX / Core ML", x: 6.8, y: 2.8, w: 2.2, h: 1.2, fill: "DA7756", textColor: "FFFFFF" });
  const output = diagramBox(archSlide, { text: "Output\nPrediction / Action", x: 9.6, y: 2.8, w: 2.2, h: 1.2 });

  arrow(archSlide, { from: input.right, to: preprocess.left });
  arrow(archSlide, { from: preprocess.right, to: model.left });
  arrow(archSlide, { from: model.right, to: output.left });

  // Slide 5: Model formats
  deck.table({
    title: "Model Formats & Runtimes",
    headers: ["Format", "Runtime", "Platform", "Quantization"],
    rows: [
      ["ONNX", "ONNX Runtime", "Cross-platform", "INT8, INT4"],
      ["Core ML", "Core ML", "Apple (iOS/macOS)", "Float16, INT8"],
      ["TFLite", "TensorFlow Lite", "Android / Edge", "INT8, Dynamic"],
      ["GGUF", "llama.cpp", "Cross-platform", "Q4_K_M, Q5_K_M"],
    ],
  });

  // Slide 6: Section divider
  deck.section({ title: "Code Examples", subtitle: "From export to inference" });

  // Slide 7: Export code
  deck.code({
    title: "Export a Model to ONNX",
    language: "python",
    code: `import torch
from transformers import AutoModelForSequenceClassification

model = AutoModelForSequenceClassification.from_pretrained(
    "distilbert-base-uncased-finetuned-sst-2-english"
)
model.eval()

dummy = torch.zeros(1, 128, dtype=torch.long)
torch.onnx.export(
    model, (dummy, dummy),
    "sentiment.onnx",
    input_names=["input_ids", "attention_mask"],
    dynamic_axes={"input_ids": {0: "batch"}, "attention_mask": {0: "batch"}},
)`,
  });

  // Slide 8: Inference code
  deck.code({
    title: "Run Inference on Device",
    language: "python",
    code: `import onnxruntime as ort
import numpy as np
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")
session = ort.InferenceSession("sentiment.onnx")

text = "On-device AI is incredibly fast!"
tokens = tokenizer(text, return_tensors="np", padding="max_length", max_length=128)

logits = session.run(None, {
    "input_ids": tokens["input_ids"],
    "attention_mask": tokens["attention_mask"],
})[0]

label = ["negative", "positive"][np.argmax(logits)]
print(f"{label}: {text}")  # positive: On-device AI is incredibly fast!`,
  });

  // Slide 9: Performance benchmarks diagram
  const perfSlide = deck.blank({ bg: "primary" });
  heading(perfSlide, { text: "Latency Benchmarks", x: 0.8, y: 0.6, w: 11 });

  // Cloud path
  const client1 = diagramBox(perfSlide, { text: "Client", x: 1.0, y: 2.2, w: 1.8, h: 1.0 });
  const network = diagramBox(perfSlide, { text: "Network\n~80ms", x: 3.4, y: 2.2, w: 1.8, h: 1.0, fill: "EEF1FA", border: "9BADD4" });
  const cloud = diagramBox(perfSlide, { text: "Cloud GPU\n~50ms", x: 5.8, y: 2.2, w: 1.8, h: 1.0, fill: "EEF1FA", border: "9BADD4" });
  const resp1 = diagramBox(perfSlide, { text: "Response\n~150ms total", x: 8.2, y: 2.2, w: 2.2, h: 1.0 });

  arrow(perfSlide, { from: client1.right, to: network.left });
  arrow(perfSlide, { from: network.right, to: cloud.left });
  arrow(perfSlide, { from: cloud.right, to: resp1.left });

  // On-device path
  const client2 = diagramBox(perfSlide, { text: "Client", x: 1.0, y: 4.4, w: 1.8, h: 1.0 });
  const local = diagramBox(perfSlide, { text: "Local Model\n~8ms", x: 3.4, y: 4.4, w: 1.8, h: 1.0, fill: "DA7756", textColor: "FFFFFF" });
  const resp2 = diagramBox(perfSlide, { text: "Response\n~10ms total", x: 5.8, y: 4.4, w: 2.2, h: 1.0 });

  arrow(perfSlide, { from: client2.right, to: local.left });
  arrow(perfSlide, { from: local.right, to: resp2.left });

  // Labels
  deck.components.bodyText(perfSlide, { text: "Cloud inference", x: 1.0, y: 1.7, w: 3, bold: true, color: "9BADD4" });
  deck.components.bodyText(perfSlide, { text: "On-device inference", x: 1.0, y: 3.9, w: 3, bold: true, color: "DA7756" });

  // Slide 10: Closing
  deck.title({ title: "Ship Intelligence,\nNot API Calls" });

  return deck;
}
