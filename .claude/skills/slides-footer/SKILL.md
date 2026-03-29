---
name: slides-footer
description: "Add slide numbering, footer text, and academic citations to an existing deck. Use when the user says '/slides-footer', 'add slide numbers', 'add references to slides', 'number the slides', or 'add citations'."
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
argument-hint: "<path-to-deck-folder> [options]"
---

Add slide numbering, footer text, and/or academic citations to an existing deck: $ARGUMENTS

## Workflow

1. **Read the existing `slides.ts`** in the target folder. Understand the deck structure — how many slides, which are title/closing slides.

2. **Determine footer configuration** from the user's request:
   - Slide numbering: `slideNumber: true` (default format: `"n / N"`)
   - Static footer text (e.g., "Author — Conference 2025")
   - Citation style: `"author-year"` (default) or `"compact"`
   - Skip list: typically skip first (title) and last (closing) slides

3. **If citations are requested**, gather bibliography entries:
   - If a `.bib` file is provided, parse it for author surnames + year
   - If the user provides references inline, extract them
   - Register each with `deck.bib(key, { authors: [...], year })`

4. **Edit `slides.ts`** to add:
   ```ts
   // After `const deck = new Deck(theme);`
   deck.footer({
     slideNumber: true,
     text: "Author — Conference 2025",
     citationStyle: "author-year",  // or "compact"
     skip: [1, N],  // skip title and closing slides
   });

   // Bibliography entries
   deck.bib("key1", { authors: ["Smith", "Jones"], year: 2023 });

   // After slides that reference works:
   deck.cite("key1", "key2");
   ```

5. **Rebuild**: `./build.sh <folder>`

6. **Verify**: Render to PNG and check that footers appear at the correct positions.

## Citation Styles

| Style | Example | Use for |
|---|---|---|
| `"author-year"` | `[Smith et al., 2023]` | Standard academic (default) |
| `"compact"` | `[SJL+23]` | Dense slides with many references |

## Footer API Reference

```ts
deck.footer(config: FooterConfig): this
deck.bib(key: string, entry: { authors: string[], year: number }): this
deck.cite(...keys: string[]): this  // applies to most recently created slide
```

See `CLAUDE.md` for the full API documentation.
