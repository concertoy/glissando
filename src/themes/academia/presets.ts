/**
 * Font presets for the Academia theme.
 *
 * Usage:
 *   import { academia, applyPreset } from "../../src/themes/academia/index.js";
 *   import { macosNative } from "../../src/themes/academia/presets.js";
 *   const deck = new Deck(applyPreset(academia, macosNative));
 */

import type { FontPreset } from "../../types.js";

// ---------------------------------------------------------------------------
// Default: EB Garamond + Source Sans 3 + JetBrains Mono
// Classic book serif for headings, clean sans for body.
// Free from Google Fonts — auto-downloaded by install script.
// ---------------------------------------------------------------------------

export const defaultPreset: FontPreset = {
  name: "default",
  description: "EB Garamond (headings) + Source Sans 3 (body) — classic academic serif",
  installNote: "Run: ./scripts/install-fonts.sh academia default",

  fonts: {
    heading: "EB Garamond",
    sans:    "Source Sans 3",
    serif:   "EB Garamond",
    mono:    "JetBrains Mono",
  },

  sizes: {
    title:        42,
    subtitle:     22,
    sectionTitle: 36,
    heading:      28,
    body:         18,
    small:        14,
    code:         13,
    caption:      12,
  },
};

// ---------------------------------------------------------------------------
// macOS Native: Palatino + Avenir Next + Menlo
// Palatino is THE quintessential academic serif.
// Pre-installed on macOS — no download required.
// ---------------------------------------------------------------------------

export const macosNative: FontPreset = {
  name: "macos-native",
  description: "Palatino (headings) + Avenir Next (body) — pre-installed on macOS",
  installNote: "No install needed — ships with macOS.",

  fonts: {
    heading: "Palatino",
    sans:    "Avenir Next",
    serif:   "Palatino",
    mono:    "Menlo",
  },

  sizes: {
    title:        42,     // Palatino metrics match EB Garamond well
    subtitle:     22,
    sectionTitle: 36,
    heading:      28,
    body:         18,
    small:        14,
    code:         13,
    caption:      12,
  },
};

// ---------------------------------------------------------------------------
// Google Fonts: Crimson Pro + Lato + Source Code Pro
// More modern academic feel — Crimson Pro is a refined book serif.
// Free from Google Fonts — auto-downloaded by install script.
// ---------------------------------------------------------------------------

export const googleFonts: FontPreset = {
  name: "google-fonts",
  description: "Crimson Pro (headings) + Lato (body) — modern academic serif",
  installNote: "Run: ./scripts/install-fonts.sh academia google-fonts",

  fonts: {
    heading: "Crimson Pro",
    sans:    "Lato",
    serif:   "Crimson Pro",
    mono:    "Source Code Pro",
  },

  sizes: {
    title:        44,     // Crimson Pro runs slightly narrower
    subtitle:     22,
    sectionTitle: 38,
    heading:      28,
    body:         18,
    small:        14,
    code:         13,
    caption:      12,
  },
};
