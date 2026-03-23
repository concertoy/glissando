/**
 * Basic White theme — Apple Keynote-inspired minimal white.
 *
 * Usage:
 *   import { basicWhite } from "../../src/themes/basic-white/index.js";
 *   const deck = new Deck(basicWhite);
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
