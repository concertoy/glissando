<p align="center">
  <img src="assets/light.png" alt="glissando" width="500">
</p>

<p align="center">
  <strong>Slide decks as code, built for AI agents.</strong><br>
  Write TypeScript, get native editable PPTX.
</p>

<p align="center">
  <a href="https://github.com/concertoy/glissando/releases"><img src="https://img.shields.io/github/v/release/concertoy/glissando?include_prereleases&style=for-the-badge" alt="GitHub release"></a>
  <a href="https://discord.gg/7nBpZ7HHME"><img src="https://img.shields.io/badge/Discord-Join-5865F2?logo=discord&logoColor=white&style=for-the-badge" alt="Discord"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="MIT License"></a>
</p>

---

```bash
claude
/slides a 10-slide pitch deck about on-device AI, with diagrams and code examples
/slides-from-latex path/to/arxiv-paper/
/slides-dev a dark theme inspired by Dracula, with purple accents and monospace headings
/slides-inv reverse-engineer this pptx back into slides.ts
/visual-feedback check the slides for layout issues
/figure generate an architecture diagram for slide 4
```

## Skills

| Skill | Description |
|---|---|
| `/slides` | Create a slide deck from a natural language description. Delegates content planning to an Opus-powered sub-agent, then builds themed PPTX. |
| `/slides-from-latex` | Convert a LaTeX paper (Overleaf project, arXiv source) into a slide deck. Handles macros, TikZ figures, theorems, and display math. |
| `/slides-dev` | Design a new visual theme from a description (colors, fonts, spacing). |
| `/slides-inv` | Reverse-engineer an existing PPTX back into `slides.ts` source code. |
| `/visual-feedback` | Render slides to PNG and diagnose layout, styling, or content issues. |
| `/figure` | Generate a raster figure via AI image generation — fallback for visuals that built-in diagram components can't express. |

### Planning Agents

Both `/slides` and `/slides-from-latex` use a two-pass merge-and-conquer protocol with two Opus sub-agents:

1. **Outline pass** (`slides-content-planner`) — reads source material and produces a numbered outline with type tags (e.g., `[content,equation]`), preserving narrative arc
2. **Detail pass** (`slide-detail-planner`) — called per-slide with the full outline for context, reads source material directly, produces rich mixed-content plans for each slide

Both agents read source material directly (repos, `.tex` files, READMEs) in isolated context — they never see existing example decks. The skill assembles all detail outputs and the implementer faithfully translates the assembled plan into themed TypeScript.

## Themes

| Theme | Style | Install |
|---|---|---|
| `claudeDoc` | Warm cream, terracotta accent, serif headings | `./scripts/install-fonts.sh` |
| `basicWhite` | Pure white, Apple blue accent, Helvetica Neue | No install needed |
| `elegantBw` | Monochromatic black/white, Space Grotesk + Inter | `./scripts/install-fonts.sh elegant-bw` |

See `CLAUDE.md` for the full API reference — layouts, components, callout variants, connectors, emojis, and font presets.

## License

MIT License &copy; 2026 [Tianzhe Chu](https://tianzhechu.com)
