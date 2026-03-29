#!/usr/bin/env npx tsx
/**
 * Universal build runner — imports slides.ts from the given path,
 * calls build(), and saves to output.pptx.
 *
 * Usage: npx tsx scripts/runner.ts <path-to-deck-folder> [--output <file>]
 */

import { resolve, join } from "path";

const deckPath = process.argv[2];
if (!deckPath) {
  console.error("Usage: npx tsx scripts/runner.ts <path-to-deck-folder> [--output <file>]");
  process.exit(1);
}

// Optional --output override
const outputFlag = process.argv.indexOf("--output");
const outputOverride = outputFlag !== -1 ? process.argv[outputFlag + 1] : undefined;

const absPath = resolve(deckPath);
const slidesFile = join(absPath, "slides.ts");

const mod = await import(slidesFile);
const build = mod.default ?? mod.build;

if (typeof build !== "function") {
  console.error("Error: slides.ts must export a default function or named 'build' function");
  process.exit(1);
}

const deck = await build();
const outputPath = outputOverride ? resolve(outputOverride) : join(absPath, "output.pptx");
await deck.save(outputPath);
console.log(`Built: ${outputPath}`);
