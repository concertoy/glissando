/**
 * Themed emoji renderer — SVG → PNG via sharp.
 *
 * Follows the same pattern as icons.ts: resolve by name, render with sharp,
 * cache as base64 data URIs for pptxgenjs addImage.
 *
 * Each theme declares an EmojiSet (style + optional custom overrides).
 * Two built-in styles: OpenMoji and Twemoji (~47 curated presentation emojis each).
 */

import sharp from "sharp";
import { EMOJI_ALIASES } from "./emoji-data/aliases.js";
import type { EmojiSet, EmojiStyle } from "./types.js";

// Lazy-loaded emoji data (avoids importing large SVG data until needed)
let openmojiData: Record<string, string> | null = null;
let twemojiData: Record<string, string> | null = null;

async function getEmojiData(style: EmojiStyle): Promise<Record<string, string>> {
  if (style === "openmoji") {
    if (!openmojiData) {
      const mod = await import("./emoji-data/openmoji.js");
      openmojiData = mod.OPENMOJI_SVGS;
    }
    return openmojiData!;
  } else {
    if (!twemojiData) {
      const mod = await import("./emoji-data/twemoji.js");
      twemojiData = mod.TWEMOJI_SVGS;
    }
    return twemojiData!;
  }
}

// Cache rendered PNGs so we don't re-render the same emoji+style+size combo
const cache = new Map<string, string>();

/**
 * Resolve an emoji name to its canonical form.
 */
function resolveAlias(name: string): string {
  return EMOJI_ALIASES[name] ?? name;
}

/**
 * Render an emoji to a base64 PNG data URI.
 *
 * @param name  Emoji name (e.g. "rocket", "fire") or alias (e.g. "flame")
 * @param emojiSet  Theme's emoji configuration
 * @param size  Override render size in pixels
 * @returns base64 data URI string for pptxgenjs addImage
 */
export async function renderEmoji(
  name: string,
  emojiSet?: EmojiSet,
  size?: number,
): Promise<string> {
  const style = emojiSet?.style ?? "openmoji";
  const resolvedSize = size ?? emojiSet?.size ?? 128;
  const resolvedName = resolveAlias(name);

  const cacheKey = `${style}-${resolvedName}-${resolvedSize}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;

  // Check custom overrides first
  let svg: string | undefined = emojiSet?.custom?.[resolvedName];

  if (!svg) {
    const data = await getEmojiData(style);
    svg = data[resolvedName];
  }

  if (!svg) {
    const data = await getEmojiData(style);
    throw new Error(
      `Unknown emoji: "${name}"${name !== resolvedName ? ` (resolved to "${resolvedName}")` : ""}. ` +
      `Available: ${Object.keys(data).join(", ")}`
    );
  }

  const pngBuffer = await sharp(Buffer.from(svg))
    .resize(resolvedSize, resolvedSize)
    .png()
    .toBuffer();
  const dataUri = `image/png;base64,${pngBuffer.toString("base64")}`;

  cache.set(cacheKey, dataUri);
  return dataUri;
}

/**
 * Parse text for :emoji: tokens, returning segments.
 *
 * Example: ":rocket: Launch the :star: product"
 * Returns: [
 *   { type: "emoji", value: "rocket" },
 *   { type: "text", value: " Launch the " },
 *   { type: "emoji", value: "star" },
 *   { type: "text", value: " product" },
 * ]
 */
export function parseEmojiTokens(text: string): Array<{ type: "text" | "emoji"; value: string }> {
  const segments: Array<{ type: "text" | "emoji"; value: string }> = [];
  const regex = /:([a-zA-Z0-9_-]+):/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Text before this match
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    segments.push({ type: "emoji", value: match[1] });
    lastIndex = regex.lastIndex;
  }

  // Remaining text after last match
  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }

  // If no emoji tokens found, return the original text as a single segment
  if (segments.length === 0) {
    segments.push({ type: "text", value: text });
  }

  return segments;
}

/**
 * Check if a text string has a leading :emoji: token.
 * Returns the emoji name and remaining text, or null if no leading emoji.
 */
export function extractLeadingEmoji(text: string): { emoji: string; rest: string } | null {
  const match = text.match(/^:([a-zA-Z0-9_-]+):\s*/);
  if (!match) return null;
  return {
    emoji: match[1],
    rest: text.slice(match[0].length),
  };
}

/** List all available emoji names for a given style. */
export async function listEmojis(style: EmojiStyle = "openmoji"): Promise<string[]> {
  const data = await getEmojiData(style);
  return Object.keys(data);
}
