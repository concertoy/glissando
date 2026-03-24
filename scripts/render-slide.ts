#!/usr/bin/env npx tsx
/**
 * Render PPTX slides to PNG images.
 *
 * Uses Keynote AppleScript (macOS, best quality) with qlmanage fallback.
 *
 * Usage:
 *   npx tsx scripts/render-slide.ts <pptx> [--page N] [--all] [--output <dir>]
 *
 * Examples:
 *   npx tsx scripts/render-slide.ts examples/my-deck/output.pptx --all
 *   npx tsx scripts/render-slide.ts examples/my-deck/output.pptx --page 3
 */

import { execSync } from "child_process";
import { resolve, basename } from "path";
import { mkdirSync, existsSync, readdirSync, renameSync, rmSync } from "fs";

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const pptxArg = args.find((a) => !a.startsWith("--"));

if (!pptxArg) {
  console.error("Usage: npx tsx scripts/render-slide.ts <pptx> [--page N] [--all] [--output <dir>]");
  process.exit(1);
}

const pptxPath = resolve(pptxArg);
if (!existsSync(pptxPath)) {
  console.error(`File not found: ${pptxPath}`);
  process.exit(1);
}

const pageIdx = args.indexOf("--page");
const page = pageIdx !== -1 ? parseInt(args[pageIdx + 1]) : undefined;
const all = args.includes("--all");
const outIdx = args.indexOf("--output");
const outputDir = resolve(outIdx !== -1 ? args[outIdx + 1] : "/tmp/glissando-render");

// Clean and create output directory
if (existsSync(outputDir)) rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

// ---------------------------------------------------------------------------
// Conversion strategies
// ---------------------------------------------------------------------------

function hasKeynote(): boolean {
  try {
    execSync('osascript -e \'tell application "Keynote" to get version\'', { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

function renderViaKeynote(): string[] {
  console.log("Rendering via Keynote...");

  // Keynote export requires a folder, creates slide.001.png, slide.002.png, etc.
  const exportDir = resolve(outputDir, "keynote-export");
  mkdirSync(exportDir, { recursive: true });

  const script = `
tell application "Keynote"
  open POSIX file "${pptxPath}"
  delay 2
  set theDoc to front document
  export theDoc as slide images to POSIX file "${exportDir}" with properties {image format:PNG, skipped slides:false}
  close theDoc saving no
end tell
  `.trim();

  try {
    execSync(`osascript -e '${script.replace(/'/g, "'\\''")}'`, {
      stdio: "pipe",
      timeout: 60000,
    });
  } catch (err: any) {
    console.error("Keynote export failed:", err.message);
    return [];
  }

  // Collect and rename output files
  const files = readdirSync(exportDir)
    .filter((f) => f.endsWith(".png") || f.endsWith(".jpeg") || f.endsWith(".jpg"))
    .sort();

  const results: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const dest = resolve(outputDir, `slide.${String(i + 1).padStart(3, "0")}.png`);
    renameSync(resolve(exportDir, files[i]), dest);
    results.push(dest);
  }

  rmSync(exportDir, { recursive: true, force: true });
  return results;
}

function renderViaQlmanage(): string[] {
  console.log("Rendering via qlmanage (slide 1 only)...");

  try {
    execSync(`qlmanage -t -s 1920 -o "${outputDir}" "${pptxPath}" 2>/dev/null`, {
      stdio: "pipe",
      timeout: 15000,
    });
  } catch (err: any) {
    console.error("qlmanage failed:", err.message);
    return [];
  }

  // qlmanage creates <filename>.png
  const files = readdirSync(outputDir).filter((f) => f.endsWith(".png"));
  if (files.length === 0) return [];

  const dest = resolve(outputDir, "slide.001.png");
  renameSync(resolve(outputDir, files[0]), dest);
  console.log("Note: qlmanage only renders slide 1. Install Keynote for full per-slide rendering.");
  return [dest];
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

let slides: string[] = [];

if (hasKeynote()) {
  slides = renderViaKeynote();
} else {
  slides = renderViaQlmanage();
}

if (slides.length === 0) {
  console.error("Failed to render any slides.");
  console.error("Ensure Keynote is installed, or try: brew install --cask libreoffice");
  process.exit(1);
}

// Filter to requested page(s)
if (page !== undefined && !all) {
  const target = slides[page - 1];
  if (!target) {
    console.error(`Slide ${page} not found (deck has ${slides.length} slides).`);
    process.exit(1);
  }
  console.log(`Slide ${page}: ${target}`);
} else {
  console.log(`Rendered ${slides.length} slide(s) to ${outputDir}/`);
  for (const s of slides) {
    console.log(`  ${basename(s)}`);
  }
}
