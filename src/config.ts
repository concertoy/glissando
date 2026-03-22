/**
 * Glissando config loader.
 *
 * Reads provider settings from ~/.glissando/config.json
 * and API keys from ~/.glissando/.env (or shell environment).
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const CONFIG_DIR = join(homedir(), ".glissando");
const CONFIG_PATH = join(CONFIG_DIR, "config.json");
const ENV_PATH = join(CONFIG_DIR, ".env");

export interface ProviderConfig {
  provider: string;
  url: string;
  model: string;
  apiKey: string;
}

/**
 * Load the active provider config.
 * Reads ~/.glissando/config.json for provider/model/url,
 * resolves the API key from ~/.glissando/.env or shell env.
 * Throws if not configured (run `npm run init` first).
 */
export function loadConfig(): ProviderConfig {
  if (!existsSync(CONFIG_PATH)) {
    throw new Error(
      "Glissando not configured. Run `npm run init` to set up your AI provider."
    );
  }

  const raw = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
  const { provider, url, model, apiKeyVar } = raw;

  // Resolve API key: check ~/.glissando/.env first, then shell env
  let apiKey = "";
  if (apiKeyVar) {
    // Try .env file
    if (existsSync(ENV_PATH)) {
      const envContent = readFileSync(ENV_PATH, "utf-8");
      const match = envContent.match(new RegExp(`^${apiKeyVar}=(.+)$`, "m"));
      if (match) apiKey = match[1].trim();
    }
    // Fall back to shell environment
    if (!apiKey) apiKey = process.env[apiKeyVar] ?? "";
  }

  if (!apiKey) {
    throw new Error(
      `API key not found. Set ${apiKeyVar} in ~/.glissando/.env or your shell environment.`
    );
  }

  return { provider, url, model, apiKey };
}

export { CONFIG_DIR, CONFIG_PATH, ENV_PATH };
