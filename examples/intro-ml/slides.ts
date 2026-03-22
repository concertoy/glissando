import { Deck } from "../../src/index.js";
import { claudeDoc, applyPreset } from "../../src/themes/claude-doc/index.js";
import { macosNative } from "../../src/themes/claude-doc/presets.js";

export default async function build() {
  const deck = new Deck(applyPreset(claudeDoc, macosNative));

  deck.title({ title: "Introduction to Machine Learning", subtitle: "From Data to Decisions" });

  deck.section({ title: "What Is Machine Learning?" });

  deck.content({
    title: "Core Idea",
    bullets: [
      "Algorithms that learn patterns from data",
      "Improve automatically through experience",
      "No explicit programming for every scenario",
    ],
  });

  deck.twoColumn({
    title: "Supervised vs Unsupervised",
    leftTitle: "Supervised",
    left: ["Labeled training data", "Classification & regression", "e.g. spam detection"],
    rightTitle: "Unsupervised",
    right: ["No labels needed", "Clustering & dimensionality reduction", "e.g. customer segmentation"],
  });

  deck.code({
    title: "Train a Model in 5 Lines",
    code: `from sklearn.ensemble import RandomForestClassifier

model = RandomForestClassifier()
model.fit(X_train, y_train)
predictions = model.predict(X_test)
print(f"Accuracy: {model.score(X_test, y_test):.2%}")`,
    language: "python",
  });

  await deck.equation({
    title: "The Math Behind It",
    equations: [
      { latex: "\\hat{y} = \\sigma(\\mathbf{w} \\cdot \\mathbf{x} + b)", label: "Logistic regression" },
      { latex: "L = -\\frac{1}{N}\\sum_{i=1}^{N} y_i \\log(\\hat{y}_i)", label: "Cross-entropy loss" },
    ],
  });

  deck.quote({
    quote: "All models are wrong, but some are useful.",
    attribution: "George Box",
  });

  deck.title({ title: "Thank You" });

  return deck;
}
