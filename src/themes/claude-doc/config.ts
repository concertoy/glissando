/**
 * Claude Documentation Style — theme configuration.
 *
 * Based on https://platform.claude.com/docs visual design:
 * - Warm off-whites, near-black text
 * - Terracotta accent (#DA7756)
 * - DM Serif Display / Inter / JetBrains Mono font stack (free defaults)
 * - Tiempos Headline / Styrene A available as premium upgrades
 */

import type { ThemeConfig } from "../../types.js";

export const config: ThemeConfig = {
  name: "claude-doc",

  colors: {
    bgPrimary:      "F4F3EE",    // Cream "Pampas" — page background
    bgDark:         "F4F3EE",    // Cream — title/closing slides (matches content bg)
    bgAccent:       "F4F3EE",    // Cream — section dividers
    bgCard:         "FFFFFF",    // White — cards, chat bubbles

    text:           "0D0D0D",    // Black — headings, primary text
    textSecondary:  "3B3B39",    // Dark grey — body text
    textMuted:      "B1ADA1",    // Cloudy — captions, borders
    textOnDark:     "0D0D0D",    // Black — text on title slides
    textOnDarkMuted:"3B3B39",    // Dark grey — subtitle on title slides

    accent:         "DA7756",    // Terra cotta — primary accent, CTAs
    accentBlue:     "2D74C9",    // Blue — links, highlights

    codeBg:         "282C34",    // One Dark bg
    codeText:       "ABB2BF",    // One Dark text
  },

  // Free defaults (auto-installed). To use the premium Anthropic fonts,
  // place them in src/themes/claude-doc/fonts/ and change these values to:
  //   heading: "Tiempos Headline"
  //   sans:    "Styrene A"
  //   serif:   "Tiempos Text"
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

  spacing: {
    slideWidth:    13.33,
    slideHeight:   7.5,
    marginLeft:    0.8,
    marginRight:   0.8,
    marginTop:     0.6,
    marginBottom:  0.5,
  },

  emojiSet: {
    style: "openmoji-outline",
    color: "DA7756",  // terracotta accent — monochrome emojis match the theme palette
    size: 128,
  },

  // One Dark code style (default)
  codeStyle: {
    bg:       "282C34",
    text:     "ABB2BF",
    keyword:  "C678DD",   // Purple
    string:   "98C379",   // Green
    comment:  "5C6370",   // Grey
    number:   "D19A66",   // Orange
    function: "61AEEE",   // Blue
    operator: "56B6C2",   // Cyan
    label:    "5C6370",   // Grey
  },
};
