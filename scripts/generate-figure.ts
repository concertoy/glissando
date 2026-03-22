#!/usr/bin/env npx tsx
/**
 * Generate a figure from a natural language prompt using the configured AI provider.
 *
 * Calls the LLM to produce an SVG, then converts to PNG via sharp.
 *
 * Usage: npx tsx scripts/generate-figure.ts "<prompt>" <output-path.png>
 *
 * Example:
 *   npx tsx scripts/generate-figure.ts "A flowchart showing data pipeline" examples/my-deck/pipeline.png
 */

import { writeFileSync } from "fs";
import { resolve } from "path";
import sharp from "sharp";
import { loadConfig } from "../src/config.js";

const prompt = process.argv[2];
const outputPath = process.argv[3];

if (!prompt || !outputPath) {
  console.error('Usage: npx tsx scripts/generate-figure.ts "<prompt>" <output.png>');
  process.exit(1);
}

const config = loadConfig();

/**
 * Call the provider's chat completions API.
 * Supports OpenAI-compatible endpoints (OpenRouter, Poe) and Google Gemini.
 */
async function callLLM(systemPrompt: string, userPrompt: string): Promise<string> {
  if (config.provider === "google") {
    // Gemini REST API
    const url = `${config.url}/models/${config.model}:generateContent?key=${config.apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: systemPrompt + "\n\n" + userPrompt }] },
        ],
      }),
    });
    if (!res.ok) throw new Error(`Gemini API error: ${res.status} ${await res.text()}`);
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  }

  // OpenAI-compatible (OpenRouter, Poe, etc.)
  const url = `${config.url}/chat/completions`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 4096,
    }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

const SYSTEM_PROMPT = `You are a figure generator. Given a description, produce a clean SVG image.

Rules:
- Output ONLY the SVG markup, no explanation, no markdown fences
- Use a viewBox of "0 0 800 600"
- Use clean, simple shapes (rect, circle, text, line, path)
- Use a white or light background
- Use readable font sizes (14-20px)
- Use professional colors (blues, grays, greens — avoid neon)
- For flowcharts: use rounded rects for boxes, arrows between them
- For diagrams: label all elements clearly
- Keep it simple and readable at slide scale`;

async function main() {
  console.log(`Provider: ${config.provider} (${config.model})`);
  console.log(`Generating figure: "${prompt}"`);

  const response = await callLLM(SYSTEM_PROMPT, prompt);

  // Extract SVG from response (in case LLM wraps it in markdown)
  let svg = response;
  const svgMatch = svg.match(/<svg[\s\S]*<\/svg>/);
  if (svgMatch) {
    svg = svgMatch[0];
  } else {
    console.error("Error: LLM did not produce valid SVG.");
    console.error("Response:", response.substring(0, 500));
    process.exit(1);
  }

  // SVG → PNG via sharp
  const absPath = resolve(outputPath);
  const pngBuffer = await sharp(Buffer.from(svg))
    .resize(1600, 1200, { fit: "inside" })
    .png()
    .toBuffer();

  writeFileSync(absPath, pngBuffer);
  console.log(`Saved: ${absPath}`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
