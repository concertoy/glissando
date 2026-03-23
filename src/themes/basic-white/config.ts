/**
 * Basic White — theme configuration.
 *
 * Inspired by Apple Keynote's "Basic White" theme:
 * - Pure white backgrounds, black text
 * - Apple blue accent (#007AFF)
 * - Helvetica Neue / Menlo font stack (macOS system fonts, no install needed)
 * - Light Xcode-style code highlighting
 */

import type { ThemeConfig } from "../../types.js";

export const config: ThemeConfig = {
  name: "basic-white",

  colors: {
    bgPrimary:      "FFFFFF",    // Pure white
    bgDark:         "FFFFFF",    // Title slides — white
    bgAccent:       "FFFFFF",    // Section dividers — white
    bgCard:         "F2F2F7",    // Light gray (iOS system gray 6)

    text:           "000000",    // Pure black
    textSecondary:  "333333",    // Near-black body text
    textMuted:      "8E8E93",    // iOS system gray
    textOnDark:     "000000",    // Black (title slides are white)
    textOnDarkMuted:"8E8E93",    // Gray subtitles

    accent:         "007AFF",    // Apple blue
    accentBlue:     "007AFF",    // Same blue

    codeBg:         "F5F5F7",    // Light gray code background
    codeText:       "1D1D1F",    // Near-black code text
  },

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

  spacing: {
    slideWidth:    13.33,
    slideHeight:   7.5,
    marginLeft:    1.0,
    marginRight:   1.0,
    marginTop:     0.6,
    marginBottom:  0.5,
  },

  codeStyle: {
    bg:       "F5F5F7",
    text:     "1D1D1F",
    border:   "D1D1D6",
    borderRadius: 0.08,
    keyword:  "9B2393",    // Xcode purple
    string:   "0B4F30",    // Xcode dark green
    comment:  "8E8E93",    // System gray
    number:   "1C00CF",    // Xcode blue
    function: "326D74",    // Xcode teal
    operator: "1D1D1F",    // Same as text
    label:    "8E8E93",    // Gray
  },
};
