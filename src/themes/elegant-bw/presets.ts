/**
 * Font presets for the Elegant BW theme.
 *
 * Usage:
 *   import { elegantBw, applyPreset } from "../../src/themes/elegant-bw/index.js";
 *   import { macosNative } from "../../src/themes/elegant-bw/presets.js";
 *   const deck = new Deck(applyPreset(elegantBw, macosNative));
 */

import type { FontPreset } from "../../types.js";

// ---------------------------------------------------------------------------
// Default: Playfair Display + Inter + JetBrains Mono
// ---------------------------------------------------------------------------

export const defaultPreset: FontPreset = {
  name: "default",
  description: "Playfair Display + Inter + JetBrains Mono — high-contrast Didone serif headings",
  installNote: "Run: ./scripts/install-fonts.sh elegant-bw",

  fonts: {
    heading: "Playfair Display",
    sans:    "Inter",
    serif:   "Inter",
    mono:    "JetBrains Mono",
  },

  sizes: {
    title:        48,
    subtitle:     22,
    sectionTitle: 40,
    heading:      30,
    body:         18,
    small:        14,
    code:         13,
    caption:      12,
  },
};

// ---------------------------------------------------------------------------
// macOS Native: Didot + Avenir Next + Menlo
// Didot is a high-contrast Didone serif like Playfair Display.
// Avenir Next is a geometric sans like Inter.
// Both ship with macOS — no download required.
// ---------------------------------------------------------------------------

export const macosNative: FontPreset = {
  name: "macos-native",
  description: "Didot (headings) + Avenir Next (body) — pre-installed on macOS",
  installNote: "No install needed — ships with macOS.",

  fonts: {
    heading: "Didot",
    sans:    "Avenir Next",
    serif:   "Avenir Next",
    mono:    "Menlo",
  },

  sizes: {
    title:        46,    // Didot runs slightly narrower than Playfair
    subtitle:     22,
    sectionTitle: 38,
    heading:      28,
    body:         18,
    small:        14,
    code:         13,
    caption:      12,
  },
};

// ---------------------------------------------------------------------------
// All Sans: Space Grotesk headings + Inter body
// Pure geometric sans-serif throughout — no serif contrast.
// Already installed with the default elegant-bw font set.
// ---------------------------------------------------------------------------

export const allSans: FontPreset = {
  name: "all-sans",
  description: "Space Grotesk (headings) + Inter (body) — pure geometric sans",
  installNote: "Run: ./scripts/install-fonts.sh elegant-bw (already included)",

  fonts: {
    heading: "Space Grotesk",
    sans:    "Inter",
    serif:   "Inter",
    mono:    "JetBrains Mono",
  },

  sizes: {
    title:        46,    // Space Grotesk runs wider than Playfair
    subtitle:     22,
    sectionTitle: 38,
    heading:      28,
    body:         18,
    small:        14,
    code:         13,
    caption:      12,
  },
};
