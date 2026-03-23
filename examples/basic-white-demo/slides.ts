import { Deck } from "../../src/index.js";
import { basicWhite } from "../../src/themes/basic-white/index.js";

export default function build() {
  const deck = new Deck(basicWhite);

  deck.title({ title: "Quarterly Review", subtitle: "Q1 2026 — Engineering" });

  deck.section({ title: "Highlights", subtitle: "What we shipped this quarter" });

  deck.content({
    title: "Key Accomplishments",
    bullets: [
      "Launched v2.0 with redesigned API surface",
      "Reduced p99 latency from 450ms to 120ms",
      "Onboarded 3 new enterprise customers",
      "Migrated CI/CD pipeline to GitHub Actions",
    ],
  });

  deck.twoColumn({
    title: "Before & After",
    leftTitle: "Q4 2025",
    rightTitle: "Q1 2026",
    left: [
      "Manual deployments",
      "45-minute build times",
      "3 critical incidents",
    ],
    right: [
      "Automated CI/CD",
      "8-minute build times",
      "Zero critical incidents",
    ],
  });

  deck.code({
    title: "New Config API",
    language: "typescript",
    code: `import { createClient } from "@acme/sdk";

const client = createClient({
  apiKey: process.env.ACME_KEY,
  region: "us-west-2",
  retries: 3,
});

const result = await client.query("SELECT * FROM users");
console.log(result.rows);`,
  });

  deck.table({
    title: "Team Velocity",
    headers: ["Sprint", "Points", "Completed", "Carry-over"],
    rows: [
      ["Sprint 1", "34", "31", "3"],
      ["Sprint 2", "38", "38", "0"],
      ["Sprint 3", "42", "40", "2"],
      ["Sprint 4", "36", "36", "0"],
    ],
  });

  return deck;
}
