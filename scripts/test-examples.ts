#!/usr/bin/env npx tsx
/**
 * Smoke test — build every example deck and verify output.pptx is produced.
 *
 * Usage: npx tsx scripts/test-examples.ts
 */

import { readdirSync, existsSync, unlinkSync, statSync } from "fs";
import { resolve, join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const examplesDir = resolve(__dirname, "..", "examples");
const dirs = readdirSync(examplesDir).filter((d) =>
  statSync(join(examplesDir, d)).isDirectory() &&
  existsSync(join(examplesDir, d, "slides.ts"))
);

if (dirs.length === 0) {
  console.error("No example decks found in examples/");
  process.exit(1);
}

let passed = 0;
let failed = 0;

for (const dir of dirs) {
  const deckDir = join(examplesDir, dir);
  const outputPath = join(deckDir, "output.pptx");

  // Clean previous output
  if (existsSync(outputPath)) unlinkSync(outputPath);

  process.stdout.write(`  ${dir} ... `);

  try {
    const slidesFile = join(deckDir, "slides.ts");
    const mod = await import(slidesFile);
    const build = mod.default ?? mod.build;
    if (typeof build !== "function") throw new Error("no build function exported");

    const deck = await build();
    await deck.save(outputPath);

    if (!existsSync(outputPath)) throw new Error("output.pptx not created");

    console.log("ok");
    passed++;
  } catch (err: any) {
    console.log(`FAIL: ${err.message}`);
    failed++;
  }
}

console.log(`\n${passed} passed, ${failed} failed, ${dirs.length} total`);
if (failed > 0) process.exit(1);
