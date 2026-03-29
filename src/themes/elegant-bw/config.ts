/**
 * Elegant BW — theme configuration.
 *
 * Inspired by worldlabs.ai's monochromatic, Apple-style minimalism:
 * - Pure white backgrounds, black text, no bright accents
 * - Geometric sans-serif typography (Space Grotesk / Inter)
 * - Tight letter-spacing on headings, generous whitespace
 * - Subtle grey palette for hierarchy
 */

import type { ThemeConfig } from "../../types.js";

export const config: ThemeConfig = {
  name: "elegant-bw",

  colors: {
    bgPrimary:      "FFFFFF",    // Pure white
    bgDark:         "000000",    // True black for title slides
    bgAccent:       "F5F5F5",    // Near-white for section dividers
    bgCard:         "F5F5F5",    // Light gray cards

    text:           "000000",    // Pure black
    textSecondary:  "1A1A1A",    // Near-black body text
    textMuted:      "999999",    // Mid-gray captions
    textOnDark:     "FFFFFF",    // White on dark slides
    textOnDarkMuted:"999999",    // Gray subtitle on dark slides

    accent:         "000000",    // Black — monochromatic accent
    accentBlue:     "000000",    // Black — no color accents

    codeBg:         "F5F5F5",    // Light gray code background
    codeText:       "1A1A1A",    // Near-black code text
  },

  fonts: {
    heading: "Playfair Display",  // High-contrast Didone serif
    sans:    "Inter",            // Clean body text
    serif:   "Inter",            // Quotes use sans too
    mono:    "JetBrains Mono",   // Code blocks
  },

  sizes: {
    title:        48,     // Large, impactful titles
    subtitle:     22,
    sectionTitle: 40,
    heading:      30,
    body:         18,
    small:        14,
    code:         13,
    caption:      12,
  },

  spacing: {
    slideWidth:    13.33,
    slideHeight:   7.5,
    marginLeft:    1.2,     // Generous margins
    marginRight:   1.2,
    marginTop:     0.8,
    marginBottom:  0.6,
  },

  emojiSet: {
    style: "openmoji-outline",
    color: "000000",              // Black outlines — monochromatic
  },

  codeStyle: {
    bg:       "F5F5F5",
    text:     "1A1A1A",
    border:   "E5E5E5",
    borderRadius: 0.06,
    keyword:  "000000",     // Black — monochromatic highlighting
    string:   "666666",     // Dark gray
    comment:  "AAAAAA",     // Light gray
    number:   "333333",     // Near-black
    function: "000000",     // Black
    operator: "666666",     // Dark gray
    label:    "999999",     // Mid-gray
  },
};
