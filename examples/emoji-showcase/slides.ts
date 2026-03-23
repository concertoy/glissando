import { Deck } from "../../src/index.js";
import { claudeDoc } from "../../src/themes/claude-doc/index.js";

export default async function build() {
  const deck = new Deck(claudeDoc);

  // Title slide
  deck.title({ title: "Emoji Showcase", subtitle: "Themed SVG emojis in VibeSlides" });

  // Emoji-prefixed bullet list (uses native OOXML <a:buBlip>)
  deck.content({
    title: "Features with Emoji Bullets",
    bullets: [
      ":rocket: Fast builds with zero configuration",
      ":shield: Enterprise-grade security built in",
      ":sparkles: Beautiful defaults out of the box",
      ":gear: Fully customizable themes",
      ":zap: Lightning-fast performance",
      "Regular bullet without emoji",
    ],
  });

  // Mixed content — two columns with emoji bullets
  deck.twoColumn({
    title: "Platform Comparison",
    leftTitle: "Strengths",
    rightTitle: "Areas to Improve",
    left: [
      ":trophy: Award-winning design",
      ":globe: Global availability",
      ":lock: Strong encryption",
    ],
    right: [
      ":clock: Faster load times needed",
      ":bug: Known edge cases in search",
      ":hammer: Tooling improvements planned",
    ],
  });

  // Custom slide with standalone emoji component
  const slide = deck.blank();
  const { heading, bodyText, emoji } = deck.components;
  heading(slide, { text: "Standalone Emoji Placement", x: 0.8, y: 0.5, w: 11 });
  bodyText(slide, { text: ":lightbulb: Emojis can appear inline with body text too", x: 0.8, y: 1.5, w: 8 });

  // Standalone emojis at explicit positions
  if (emoji) {
    await emoji(slide, { name: "rocket", x: 1, y: 3, w: 0.8, h: 0.8 });
    await emoji(slide, { name: "fire", x: 2.5, y: 3, w: 0.8, h: 0.8 });
    await emoji(slide, { name: "star", x: 4, y: 3, w: 0.8, h: 0.8 });
    await emoji(slide, { name: "heart", x: 5.5, y: 3, w: 0.8, h: 0.8 });
    await emoji(slide, { name: "trophy", x: 7, y: 3, w: 0.8, h: 0.8 });
    await emoji(slide, { name: "brain", x: 8.5, y: 3, w: 0.8, h: 0.8 });
  }

  // Closing slide
  deck.title({ title: "Thank You", subtitle: ":party:" });

  return deck;
}
