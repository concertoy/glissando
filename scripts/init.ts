#!/usr/bin/env npx tsx
/**
 * Glissando setup wizard.
 *
 * Configures AI provider credentials for figure generation.
 * Saves config to ~/.glissando/config.json and API key to ~/.glissando/.env.
 *
 * Usage: npm run init
 */

import * as readline from "readline";
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "fs";
import { CONFIG_DIR, CONFIG_PATH, ENV_PATH } from "../src/config.js";

const PROVIDERS: Record<string, { url: string; model: string; keyVar: string; keyPrompt: string }> = {
  google: {
    url: "https://generativelanguage.googleapis.com/v1beta",
    model: "gemini-2.5-flash",
    keyVar: "GOOGLE_API_KEY",
    keyPrompt: "Google API key",
  },
  openrouter: {
    url: "https://openrouter.ai/api/v1",
    model: "anthropic/claude-sonnet-4",
    keyVar: "OPENROUTER_API_KEY",
    keyPrompt: "OpenRouter API key",
  },
  poe: {
    url: "https://api.poe.com/v1",
    model: "Claude-3.5-Sonnet",
    keyVar: "POE_API_KEY",
    keyPrompt: "Poe API key",
  },
};

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  console.log("\n  Welcome to Glissando!\n");
  console.log("  Select AI provider:\n");

  const names = Object.keys(PROVIDERS);
  for (let i = 0; i < names.length; i++) {
    console.log(`    ${i + 1}. ${names[i]}`);
  }

  const choice = await ask("\n  Provider [1]: ");
  const idx = Math.max(0, Math.min(names.length - 1, parseInt(choice || "1") - 1));
  const providerName = names[idx];
  const preset = PROVIDERS[providerName];

  const model = await ask(`  Model [${preset.model}]: `) || preset.model;
  const url = await ask(`  API URL [${preset.url}]: `) || preset.url;
  const apiKey = await ask(`  ${preset.keyPrompt}: `);

  if (!apiKey) {
    console.log("\n  Error: API key is required.\n");
    rl.close();
    process.exit(1);
  }

  // Write config
  mkdirSync(CONFIG_DIR, { recursive: true });

  const config = {
    provider: providerName,
    url,
    model,
    apiKeyVar: preset.keyVar,
  };
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + "\n");

  // Write or update .env (append if exists, don't duplicate)
  let envContent = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, "utf-8") : "";
  const keyLine = `${preset.keyVar}=${apiKey}`;
  const keyRegex = new RegExp(`^${preset.keyVar}=.*$`, "m");
  if (keyRegex.test(envContent)) {
    envContent = envContent.replace(keyRegex, keyLine);
  } else {
    envContent += (envContent && !envContent.endsWith("\n") ? "\n" : "") + keyLine + "\n";
  }
  writeFileSync(ENV_PATH, envContent);

  console.log(`\n  Config saved to ${CONFIG_PATH}`);
  console.log(`  API key saved to ${ENV_PATH}\n`);

  rl.close();
}

main();
