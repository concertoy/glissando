/**
 * Academia theme — navy + gold, scholarly elegance.
 *
 * Usage:
 *   import { academia } from "../../src/themes/academia/index.js";
 *   const deck = new Deck(academia);
 *
 * Usage with preset:
 *   import { academia, applyPreset } from "../../src/themes/academia/index.js";
 *   import { macosNative } from "../../src/themes/academia/presets.js";
 *   const deck = new Deck(applyPreset(academia, macosNative));
 */

import type { Theme } from "../../types.js";
import { config } from "./config.js";
import { createComponents } from "./components.js";
import { layouts } from "./layouts.js";

export const academia: Theme = {
  config,
  createComponents,
  layouts,
};

export { applyPreset } from "../../index.js";
export { defaultPreset, macosNative, googleFonts } from "./presets.js";
