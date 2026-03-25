<p align="center">
  <img src="assets/badge.png" alt="glissando" width="500">
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
/slides-dev a dark theme inspired by Dracula, with purple accents and monospace headings
/slides-inv reverse-engineer this pptx back into slides.ts
/visual-feedback check the slides for layout issues
/figure generate an architecture diagram for slide 4
```

## Themes

| Theme | Style | Install |
|---|---|---|
| `claudeDoc` | Warm cream, terracotta accent, serif headings | `./scripts/install-fonts.sh` |
| `basicWhite` | Pure white, Apple blue accent, Helvetica Neue | No install needed |
| `elegantBw` | Monochromatic black/white, Space Grotesk + Inter | `./scripts/install-fonts.sh elegant-bw` |

See `CLAUDE.md` for the full API reference — layouts, components, callout variants, connectors, emojis, and font presets.

## License

MIT License &copy; 2026 [Tianzhe Chu](https://tianzhechu.com)
