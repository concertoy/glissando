/**
 * Academia — theme configuration.
 *
 * Classic academic presentation style:
 * - Deep navy (#1B365D) + gold (#C7A951) accent palette
 * - Ivory backgrounds, structured layouts
 * - EB Garamond serif headings, Source Sans 3 body
 * - Designed for conference talks, thesis defenses, journal clubs
 */

import type { ThemeConfig } from "../../types.js";

export const config: ThemeConfig = {
  name: "academia",

  colors: {
    bgPrimary:      "FAFAF8",    // Ivory — content slides
    bgDark:         "1B2A4A",    // Deep navy — title & section slides
    bgAccent:       "E8ECF2",    // Light navy tint — table headers, callout backgrounds
    bgCard:         "FFFFFF",    // White — cards, panels

    text:           "1A1A2E",    // Very dark navy-black — headings, primary text
    textSecondary:  "2D3748",    // Dark slate — body text
    textMuted:      "7B8794",    // Slate gray — captions, borders
    textOnDark:     "FFFFFF",    // White — text on navy slides
    textOnDarkMuted:"B8C5D6",    // Light slate — subtitle on navy slides

    accent:         "1B365D",    // Navy — bullets, accent bars, structural elements
    accentBlue:     "C7A951",    // Gold — secondary accent, highlights

    codeBg:         "F5F6F8",    // Light cool gray
    codeText:       "1A1A2E",    // Dark navy-black
  },

  fonts: {
    heading: "EB Garamond",      // Classic academic serif
    sans:    "Source Sans 3",    // Clean readable body text
    serif:   "EB Garamond",      // Quotes, emphasis
    mono:    "JetBrains Mono",   // Code blocks
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

  spacing: {
    slideWidth:    13.33,
    slideHeight:   7.5,
    marginLeft:    0.9,
    marginRight:   0.9,
    marginTop:     0.6,
    marginBottom:  0.5,
  },

  emojiSet: {
    style: "openmoji-outline",
    color: "1B365D",              // Navy outlines — match theme palette
  },

  codeStyle: {
    bg:       "F5F6F8",
    text:     "1A1A2E",
    border:   "D1D5DB",
    borderRadius: 0.06,
    keyword:  "7C3AED",     // Purple — keywords
    string:   "047857",     // Forest green — strings
    comment:  "9CA3AF",     // Gray — comments
    number:   "B45309",     // Amber — numbers
    function: "1B365D",     // Navy — function names
    operator: "4B5563",     // Dark gray — operators
    label:    "9CA3AF",     // Gray — language label
  },
};
