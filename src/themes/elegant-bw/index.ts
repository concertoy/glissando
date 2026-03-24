/**
 * Elegant BW theme — monochromatic minimalism inspired by worldlabs.ai.
 *
 * Usage:
 *   import { elegantBw } from "../../src/themes/elegant-bw/index.js";
 *   const deck = new Deck(elegantBw);
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
