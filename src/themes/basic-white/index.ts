/**
 * Basic White theme — Apple Keynote-inspired minimal white.
 *
 * Usage:
 *   import { basicWhite } from "../../src/themes/basic-white/index.js";
 *   const deck = new Deck(basicWhite);
 *
 * Usage with preset:
 *   import { basicWhite, applyPreset } from "../../src/themes/basic-white/index.js";
 *   import { serifClean } from "../../src/themes/basic-white/presets.js";
 *   const deck = new Deck(applyPreset(basicWhite, serifClean));
 */

import type { Theme } from "../../types.js";
import { config } from "./config.js";
import { createComponents } from "./components.js";
import { layouts } from "./layouts.js";

export const basicWhite: Theme = {
  config,
  createComponents,
  layouts,
};

export { applyPreset } from "../../index.js";
export { defaultPreset, serifClean, googleFonts } from "./presets.js";
