# TODO

## CLI Setup Wizard (`npx glissando init`)

Interactive CLI that configures AI provider credentials on first use.

### User experience

```
npx glissando init

Welcome to Glissando!

Select AI provider:
  1. Google (Gemini)
  2. OpenRouter
  3. Poe
> 1

Google API key: sk-...
Model [gemini-2.5-flash]:

Config saved to ~/.glissando/config.json
API key saved to ~/.glissando/.env
```

### File layout

Both files in `~/.glissando/` (user home, never in repo):

**`~/.glissando/config.json`** — no secrets, safe to read:
```json
{
  "provider": "google",
  "model": "gemini-2.5-flash",
  "url": "https://generativelanguage.googleapis.com/v1beta"
}
```

**`~/.glissando/.env`** — secrets only:
```
NANO_BANANA_API_KEY=sk-...
```

### Implementation

- `scripts/init.ts` — interactive prompts using Node built-in `readline` (no deps)
- Add to `package.json`:
  ```json
  {
    "bin": { "glissando": "./bin/cli.ts" },
    "scripts": { "init": "npx tsx scripts/init.ts" }
  }
  ```
- Library loads config from `~/.glissando/` at runtime
- Skill reads provider/model/url from config, resolves API key from `.env`

### Provider presets

| Provider | Default URL | Default Model |
|---|---|---|
| Google | `https://generativelanguage.googleapis.com/v1beta` | `gemini-2.5-flash` |
| OpenRouter | `https://openrouter.ai/api/v1` | `anthropic/claude-sonnet-4` |
| Poe | `https://api.poe.com/v1` | `Claude-3.5-Sonnet` |
