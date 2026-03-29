/**
 * Font presets for the Claude doc theme.
 *
 * Each preset defines fonts + sizes tuned for that font pairing.
 * Import a preset and spread it into your config to switch typography.
 *
 * Usage in slides.ts:
 *   import { claudeDoc } from "../../src/themes/claude-doc/index.js";
 *   import { macosNative } from "../../src/themes/claude-doc/presets.js";
 *   // Override fonts before building:
 *   claudeDoc.config.fonts = macosNative.fonts;
 *   claudeDoc.config.sizes = macosNative.sizes;
 */

import type { FontPreset } from "../../types.js";

// ---------------------------------------------------------------------------
// Preset 1: macOS Native
// Iowan Old Style (body) + Avenir Next (headings/UI)
// Pre-installed on macOS — no download required.
// ---------------------------------------------------------------------------

export const macosNative: FontPreset = {
  name: "macos-native",
  description: "Iowan Old Style (headings) + Avenir Next (body) — pre-installed on macOS",
  installNote: "No install needed — ships with macOS.",

  fonts: {
    heading: "Iowan Old Style",   // Bold weight — titles, headings
    sans:    "Avenir Next",       // Regular for body, Medium for captions
    serif:   "Iowan Old Style",   // Quotes, table content
    mono:    "Menlo",             // Pre-installed on macOS
  },

  sizes: {
    title:        40,   // Title slide (Iowan Old Style Bold)
    subtitle:     22,   // Subtitle (Avenir Next Regular)
    sectionTitle: 32,   // Section dividers (Iowan Old Style Bold, h1)
    heading:      26,   // Content heading (Iowan Old Style Bold, h2)
    body:         16,   // Avenir Next Regular, line-height 1.6
    small:        14,   // Iowan Old Style — table content
    code:         13,   // Menlo
    caption:      13,   // Avenir Next Medium, captions/labels
  },

  // Light terminal — white bg, grey border, syntax highlighting
  codeStyle: {
    bg:       "FFFFFF",
    text:     "1a1a1a",
    border:   "B1ADA1",
    borderRadius: 0.08,
    keyword:  "8839EF",   // Purple — def, return, import, const, class
    string:   "1E6F5C",   // Teal — "hello", 'world'
    comment:  "9CA3AF",   // Grey — # comment, // comment
    number:   "C2410C",   // Warm orange — 42, 3.14
    function: "2563EB",   // Blue — function names
    operator: "5C6370",   // Dim grey — =, +, :, etc.
    label:    "9CA3AF",   // Language label color
  },
};

// ---------------------------------------------------------------------------
// Preset 2: Google Fonts (cross-platform)
// Libre Baskerville (headings) + Space Grotesk (body/UI)
// Free from Google Fonts — auto-downloaded by install script.
// ---------------------------------------------------------------------------

export const googleFonts: FontPreset = {
  name: "google-fonts",
  description: "Libre Baskerville (headings) + Space Grotesk (body) — free, cross-platform",
  installNote: "Run: ./scripts/install-fonts.sh claude-doc google-fonts",

  fonts: {
    heading: "Libre Baskerville",   // Bold weight — titles, headings
    sans:    "Space Grotesk",       // 400 for body, 500 for captions
    serif:   "Libre Baskerville",   // Quotes, table content
    mono:    "JetBrains Mono",      // Auto-downloaded
  },

  sizes: {
    title:        40,   // Title slide (Libre Baskerville Bold)
    subtitle:     22,   // Subtitle (Space Grotesk 400)
    sectionTitle: 32,   // Section dividers (Libre Baskerville Bold, h1)
    heading:      26,   // Content heading (Libre Baskerville Bold, h2)
    body:         16,   // Space Grotesk 400, line-height 1.6
    small:        14,   // Libre Baskerville Regular — table content
    code:         13,   // JetBrains Mono
    caption:      13,   // Space Grotesk 500, captions/labels
  },
};

// ---------------------------------------------------------------------------
// Default preset: DM Serif Display + Inter
// ---------------------------------------------------------------------------

export const defaultPreset: FontPreset = {
  name: "default",
  description: "DM Serif Display + Inter — free, cross-platform",
  installNote: "Run: ./scripts/install-fonts.sh",

  fonts: {
    heading: "DM Serif Display",
    sans:    "Inter",
    serif:   "DM Serif Display",
    mono:    "JetBrains Mono",
  },

  sizes: {
    title:        40,
    subtitle:     22,
    sectionTitle: 36,
    heading:      28,
    body:         18,
    small:        14,
    code:         13,
    caption:      12,
  },
};
