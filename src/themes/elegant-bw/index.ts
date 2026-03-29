/**
 * Elegant BW theme — monochromatic minimalism inspired by worldlabs.ai.
 *
 * Usage:
 *   import { elegantBw } from "../../src/themes/elegant-bw/index.js";
 *   const deck = new Deck(elegantBw);
 *
 * Usage with preset:
 *   import { elegantBw, applyPreset } from "../../src/themes/elegant-bw/index.js";
 *   import { macosNative } from "../../src/themes/elegant-bw/presets.js";
 *   const deck = new Deck(applyPreset(elegantBw, macosNative));
 */

import type { Theme } from "../../types.js";
import { config } from "./config.js";
import { createComponents } from "./components.js";
import { layouts } from "./layouts.js";

export const elegantBw: Theme = {
  config,
  createComponents,
  layouts,
};

export { applyPreset } from "../../index.js";
export { defaultPreset, macosNative, allSans } from "./presets.js";
