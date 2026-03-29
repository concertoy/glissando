/**
 * Font presets for the Basic White theme.
 *
 * Usage:
 *   import { basicWhite, applyPreset } from "../../src/themes/basic-white/index.js";
 *   import { serifClean } from "../../src/themes/basic-white/presets.js";
 *   const deck = new Deck(applyPreset(basicWhite, serifClean));
 */

import type { FontPreset } from "../../types.js";

// ---------------------------------------------------------------------------
// Default: Helvetica Neue + Menlo (macOS system fonts)
// ---------------------------------------------------------------------------

export const defaultPreset: FontPreset = {
  name: "default",
  description: "Helvetica Neue + Menlo — pre-installed on macOS",
  installNote: "No install needed — ships with macOS.",

  fonts: {
    heading: "Helvetica Neue",
    sans:    "Helvetica Neue",
    serif:   "Helvetica Neue",
    mono:    "Menlo",
  },

  sizes: {
    title:        44,
    subtitle:     24,
    sectionTitle: 36,
    heading:      28,
    body:         18,
    small:        14,
    code:         13,
    caption:      12,
  },
};

// ---------------------------------------------------------------------------
// Serif Clean: Georgia headings + Helvetica Neue body
// Adds serif contrast while keeping the Apple-clean feel.
// Georgia is pre-installed on macOS, Windows, and most Linux distributions.
// ---------------------------------------------------------------------------

export const serifClean: FontPreset = {
  name: "serif-clean",
  description: "Georgia (headings) + Helvetica Neue (body) — no install needed",
  installNote: "No install needed — Georgia ships with macOS/Windows/Linux.",

  fonts: {
    heading: "Georgia",
    sans:    "Helvetica Neue",
    serif:   "Georgia",
    mono:    "Menlo",
  },

  sizes: {
    title:        42,    // Slightly smaller — Georgia runs wider than Helvetica
    subtitle:     22,
    sectionTitle: 34,
    heading:      26,
    body:         18,
    small:        14,
    code:         13,
    caption:      12,
  },
};

// ---------------------------------------------------------------------------
// Google Fonts: Lato + Source Code Pro (cross-platform)
// Free from Google Fonts — auto-downloaded by install script.
// ---------------------------------------------------------------------------

export const googleFonts: FontPreset = {
  name: "google-fonts",
  description: "Lato (headings/body) + Source Code Pro (code) — free, cross-platform",
  installNote: "Run: ./scripts/install-fonts.sh basic-white google-fonts",

  fonts: {
    heading: "Lato",
    sans:    "Lato",
    serif:   "Lato",
    mono:    "Source Code Pro",
  },

  sizes: {
    title:        44,
    subtitle:     24,
    sectionTitle: 36,
    heading:      28,
    body:         18,
    small:        14,
    code:         13,
    caption:      12,
  },
};
