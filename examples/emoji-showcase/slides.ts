import { Deck } from "../../src/index.js";
import { claudeDoc } from "../../src/themes/claude-doc/index.js";

export default async function build() {
  const deck = new Deck(claudeDoc);

  // Title slide
  deck.title({ title: "Emoji Showcase", subtitle: "Monochrome themed emojis" });

  // Emoji-prefixed bullet list (native OOXML <a:buBlip>)
  deck.content({
    title: "Features",
    bullets: [
      ":rocket: Fast builds with zero configuration",
      ":shield: Enterprise-grade security built in",
      ":sparkles: Beautiful defaults out of the box",
      ":gear: Fully customizable themes",
      ":star: Production-ready components",
      "Regular bullet without emoji",
    ],
  });

  // Two columns with emoji bullets
  deck.twoColumn({
    title: "Platform Overview",
    leftTitle: "Capabilities",
    rightTitle: "Resources",
    left: [
      ":globe: Global availability",
      ":lock: End-to-end encryption",
      ":chart-up: Built-in analytics",
    ],
    right: [
      ":book: Comprehensive docs",
      ":key: API key management",
      ":palette: Theme customization",
    ],
  });

  // Custom slide with standalone emoji placement
  const slide = deck.blank();
  const { heading, bodyText, emoji } = deck.components;
  heading(slide, { text: "Standalone Placement", x: 0.8, y: 0.5, w: 11 });
  bodyText(slide, { text: ":lightbulb: Emojis match the theme's terracotta palette", x: 0.8, y: 1.5, w: 8 });

  if (emoji) {
    await emoji(slide, { name: "rocket", x: 1, y: 3, w: 0.8, h: 0.8 });
    await emoji(slide, { name: "star", x: 2.5, y: 3, w: 0.8, h: 0.8 });
    await emoji(slide, { name: "diamond", x: 4, y: 3, w: 0.8, h: 0.8 });
    await emoji(slide, { name: "shield", x: 5.5, y: 3, w: 0.8, h: 0.8 });
    await emoji(slide, { name: "lightbulb", x: 7, y: 3, w: 0.8, h: 0.8 });
    await emoji(slide, { name: "globe", x: 8.5, y: 3, w: 0.8, h: 0.8 });
  }

  // Closing slide
  deck.title({ title: "Thank You" });

  return deck;
}
