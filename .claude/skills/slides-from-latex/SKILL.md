---
name: slides-from-latex
description: "Convert a LaTeX paper (Overleaf project, arXiv source) into a glissando slide deck. Use when the user says '/slides-from-latex', 'convert this paper to slides', 'make slides from this LaTeX', 'arXiv to slides', 'paper to deck', or provides a .tex file to present."
allowed-tools: Read, Write, Bash, Glob
argument-hint: "<path to LaTeX project directory or main .tex file>"
---

Convert a LaTeX paper into a glissando slide deck: $ARGUMENTS

## Workflow

### Phase 0: Discover and Ingest

1. **Locate source files.** If given a directory, glob for `**/*.tex`, `**/*.bib`, `**/*.sty`, `**/*.def`. If given a single `.tex` file, use its parent directory.
2. **Identify the main file** — the `.tex` file containing `\documentclass`. Read it fully.
3. **Read all `\input`/`\include` files** referenced from the main file (macro files, style files, chapter files). Follow nested `\input` chains.
4. **Inventory figures** — find all image files (`*.png`, `*.jpg`, `*.jpeg`, `*.pdf`, `*.eps`) and TikZ `.tex` files referenced via `\includegraphics` or `\input` inside `figure` environments.

### Phase 1: Extract Structure and Macros

5. **Build a document outline:**
   - List all `\section`, `\subsection`, `\paragraph` headings
   - List all theorem-like environments (`theorem`, `lemma`, `proposition`, `corollary`, `definition`, `remark`) with their statements
   - List all `\begin{figure}` environments with their captions and referenced image paths
   - List all display math environments (`equation`, `align`, `gather`, `multline`) with their content
   - Extract the abstract

6. **Collect the macro preamble.** Scan the main `.tex` and all `\input`'d `.def`/`.sty` files for macro definitions. This is critical for equation rendering.

   **Simple macros** — collect directly:
   - `\newcommand{\foo}{bar}` and `\newcommand{\foo}[1]{#1 bar}`
   - `\DeclareMathOperator{\softmax}{softmax}` — convert to `\newcommand{\softmax}{\operatorname{softmax}}`
   - Simple `\def\name{...}` — convert to `\newcommand`

   **Bulk-generated macros** — many papers use TeX primitive loops like `\ddefloop` with `\csname`/`\expandafter` to generate shorthand families. MathJax CANNOT process these primitives. You MUST manually expand them into individual `\newcommand` definitions. Common patterns:

   | Pattern | Generates | Expand to |
   |---|---|---|
   | `\def\ddef#1{...\bm{#1}}` + `\ddefloop ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz\ddefloop` | `\vA`, `\vB`, ..., `\va`, `\vb`, ... | `\newcommand{\vA}{\bm{A}}` per letter |
   | `\def\ddef#1{...\mathbf{#1}}` + `\ddefloop ...` | `\bfA`, `\bfB`, ... | `\newcommand{\bfA}{\mathbf{A}}` per letter |
   | `\def\ddef#1{...\mathbb{#1}}` + `\ddefloop ...` | `\bbA`, `\bbR`, ... | `\newcommand{\bbA}{\mathbb{A}}` per letter |
   | `\def\ddef#1{...\mathscr{#1}}` + `\ddefloop ...` | `\cA`, `\cB`, ... | `\newcommand{\cA}{\mathscr{A}}` per letter |
   | `\def\ddef#1{...\mathcal{#1}}` + `\ddefloop ...` | `\sA`, `\sB`, ... | `\newcommand{\sA}{\mathcal{A}}` per letter |
   | Greek variants `\ddefloop {alpha}{beta}...` | `\bfalpha`, `\bfbeta`, ... | `\newcommand{\bfalpha}{\pmb{\alpha}}` per name |

   **Only expand macros that are actually used** in the paper's equations. Read the equations first, identify which shorthand macros appear (e.g., `\vx`, `\bfA`, `\bbR`), then expand only those. This keeps the preamble small.

   **Strip non-math constructs** from the preamble:
   - Remove `\let...\relax` lines (MathJax ignores `\let`)
   - Remove `\makeatletter` / `\makeatother`
   - Remove `\RequirePackage` / `\usepackage`
   - Remove `\ensuremath{}` wrappers (equations are already in math mode)
   - Remove author comment macros (e.g., `\valentin[1]{\textcolor{red}{...}}`)

7. **Classify the paper:**
   - Count figures vs. display equations in the main body (excluding appendix)
   - **Figure-intensive**: more figures than equations — allocate more `image` slides
   - **Equation-intensive**: more equations than figures — allocate more `equation` slides
   - **Mixed**: balanced approach

### Phase 2: Plan Content

8. **Outline pass.** Delegate to the `slides-outline-planner` agent (subagent_type: `slides-outline-planner`). Pass it:
   - The path to the LaTeX project directory so it can read `.tex` files directly
   - Target slide count: 15–25
   - Paper classification from step 7 (figure-intensive / equation-intensive / mixed)
   - The figure inventory from step 4 (which images exist and their formats)
   The agent returns a numbered outline — one line per slide with type tags, title, and purpose.

8b. **Detail pass.** For each slide, call the `slides-detail-planner` agent (subagent_type: `slides-detail-planner`). Pass it:
    - The full outline from step 8
    - The specific slide number(s) to detail
    - The LaTeX project path (so the agent can read `.tex` files directly)

    **Batching rules:**
    - `[title]`, `[section]` slides: batch up to 5 together
    - `[content]`, `[image]` slides: batch 2-3 together
    - Any slide tagged `[equation]`, `[code]`, or `[diagram]`: detail alone (batch of 1)
    - Mixed-tag slides (e.g., `[content,equation]`): detail alone

    Each call returns detailed content in `## Slide N: Title` markdown format.

8c. **Assemble.** Concatenate all detail outputs in slide order into a single markdown document. Slides will be rich: equations alongside their explanation, theorems with their intuition.

9. **Faithfully implement the plan.** Do not thin, split, or rewrite the planner's content. Cross-reference with your macro collection from step 6. Flag figure preparation needs:
   - PNG/JPG: ready to use
   - PDF/EPS: needs conversion (Phase 3)
   - TikZ/PGFPlots `.tex`: needs compilation or re-creation (Phase 3)
   - Missing files: mark as skip

### Phase 3: Prepare Assets

10. **Convert vector figures to PNG:**
    ```bash
    # macOS (sips) — for PDF
    sips -s format png <input.pdf> --out <output.png>
    # Alternative: pdftoppm (if available)
    pdftoppm -png -r 300 <input.pdf> <output>
    ```
    Save converted PNGs in the deck folder.

11. **Handle TikZ/PGFPlots figures:**
    - First check if `pdflatex` is available:
      ```bash
      which pdflatex
      ```
    - **If available**, compile standalone TikZ to PDF, then convert to PNG:
      ```bash
      # Create standalone wrapper
      cat > /tmp/tikz_standalone.tex << 'TIKZEOF'
      \documentclass[border=10pt]{standalone}
      \usepackage{tikz}
      \usepackage{pgfplots}
      \pgfplotsset{compat=newest}
      % ... add required packages from paper's preamble
      \begin{document}
      \input{<path-to-tikz-file>}
      \end{document}
      TIKZEOF
      cd /tmp && pdflatex tikz_standalone.tex
      sips -s format png tikz_standalone.pdf --out <deck-folder>/figure_name.png
      ```
    - **If NOT available**, read the TikZ source + figure caption, then invoke the `/figure` skill with a detailed description of the plot to generate an equivalent raster image.

12. **Test macro preamble.** Write a minimal test `slides.ts` with one equation from the paper, build it, and check for rendering errors. If MathJax fails:
    - Check for unsupported primitives in the preamble
    - Simplify or remove problematic macros
    - Try expanding macros inline in the equation string
    - Iterate until the test equation renders correctly

### Phase 4: Implement

13. **Create the deck folder:** `examples/<paper-short-name>/`

14. **Copy/move prepared images** into the deck folder.

15. **Write `slides.ts`** by faithfully translating the planner's markdown into code. Preserve content density — do not thin or split slides. Rich slides with mixed content (text + equations + callouts) use `deck.blank()` with components. Key patterns:

    ```ts
    import { Deck } from "../../src/index.js";
    import { claudeDoc } from "../../src/themes/claude-doc/index.js";
    import { resolve, dirname } from "path";
    import { fileURLToPath } from "url";

    const __dirname = dirname(fileURLToPath(import.meta.url));
    const img = (name: string) => resolve(__dirname, name);

    // Macro preamble — prepend to every equation
    const macros = String.raw`
    \newcommand{\vx}{\bm{x}}
    \newcommand{\bbR}{\mathbb{R}}
    \newcommand{\softmax}{\operatorname{softmax}}
    `;

    export default async function build() {
      const deck = new Deck(claudeDoc);

      deck.title({ title: "Paper Title", subtitle: "Author 1, Author 2" });

      // Equation slide — always prepend macros
      await deck.equation({
        title: "Key Result",
        equations: [{
          latex: macros + String.raw`\vx \in \bbR^d`,
          label: "Notation"
        }],
      });

      // Figure slide
      deck.image({
        title: "Experimental Results",
        imagePath: img("figure1.png"),
        caption: "Caption from paper",
      });

      // Theorem — calloutBlock + equation on blank slide
      const thSlide = deck.blank({ bg: "primary" });
      const { heading, calloutBlock, equation } = deck.components;
      heading(thSlide, { text: "Main Theorem", x: 0.8, y: 0.5, w: 11 });
      await calloutBlock(thSlide, {
        variant: "accent",
        x: 0.8, y: 1.3, w: 11, h: 1.5,
        body: "Plain-language theorem statement",
      });
      await equation(thSlide, {
        latex: macros + String.raw`...theorem math...`,
        x: 1.5, y: 3.5, w: 9,
      });

      // Definition — info callout
      const defSlide = deck.blank({ bg: "primary" });
      heading(defSlide, { text: "Definition: Key Concept", x: 0.8, y: 0.5, w: 11 });
      await calloutBlock(defSlide, {
        variant: "info",
        x: 0.8, y: 1.3, w: 11, h: 2,
        body: "Definition text with context",
      });

      deck.title({ title: "Thank You" });
      return deck;
    }
    ```

16. **Build:** `./build.sh examples/<paper-short-name>`

17. **Write `equations.md`** — an equation manifest for manual editing. Equations are rendered as PNG images (not natively editable in Keynote/PowerPoint). This manifest lets the user re-create any equation using Keynote's Insert → Equation editor (which accepts LaTeX).

    Format — one entry per equation, grouped by slide:

    ```markdown
    # Equation Reference

    ## Slide 3: Forward Diffusion
    ```latex
    X_t = \sqrt{\alpha_t}\, X_0 + \sqrt{1 - \alpha_t}\, Z
    ```

    ## Slide 5: ELBO
    ```latex
    \mathcal{L}(\theta) = -\mathbb{E}_{q(z|x)}\left[\log p_\theta(x|z)\right] + D_{KL}\left(q(z|x) \| p(z)\right)
    ```
    ```

    Include **every** equation used in the deck. Use the **clean LaTeX** (without the macro preamble) so it can be pasted directly into Keynote's equation editor. If the equation uses custom macros, expand them inline in a second block:

    ```markdown
    ## Slide 7: Score Matching
    With macros (as used in slides.ts):
    ```latex
    \vx_t = \sqrt{\bar\alpha_t}\,\vx_0 + \sqrt{1-\bar\alpha_t}\,\vepsilon
    ```
    Expanded (paste into Keynote):
    ```latex
    \boldsymbol{x}_t = \sqrt{\bar\alpha_t}\,\boldsymbol{x}_0 + \sqrt{1-\bar\alpha_t}\,\boldsymbol{\epsilon}
    ```
    ```

### Phase 5: Verify

17. **Render and inspect:**
    ```bash
    npx tsx scripts/render-slide.ts examples/<paper-short-name>/output.pptx --all --output /tmp/glissando-render
    ```
    Read each PNG to check every slide.

18. **Check for:**
    - Equation rendering errors (garbled math, missing symbols, blank images)
    - Missing or broken images
    - Text overflow on content slides
    - Theorem/definition text truncation
    - Overall narrative flow and readability

19. **Fix, rebuild, re-verify.** Repeat until clean.

## Equation Tips

- **Include variable definitions**: when the content plan includes a "where" block with variable definitions, render the equation on a `blank()` slide with `equation()` + `bulletList()` components instead of `deck.equation()` layout:
  ```ts
  const slide = deck.blank({ bg: "primary" });
  const { heading, accentBar, equation, bulletList } = deck.components;
  const sp = deck.config.spacing;
  const cw = sp.slideWidth - sp.marginLeft - sp.marginRight;

  heading(slide, { text: "Forward Diffusion", x: sp.marginLeft, y: sp.marginTop, w: cw });
  accentBar(slide, { x: sp.marginLeft, y: sp.marginTop + 0.8, w: 1.5 });
  await equation(slide, {
    latex: macros + String.raw`X_t = \sqrt{\alpha_t}\, X_0 + \sqrt{1 - \alpha_t}\, Z`,
    x: sp.marginLeft, y: sp.marginTop + 1.3, w: cw,
  });
  bulletList(slide, {
    items: [
      "X_t — noisy state at time t",
      "α_t — noise schedule coefficient",
      "X_0 — clean data sample",
      "Z ~ N(0, I) — standard Gaussian noise",
    ],
    x: sp.marginLeft, y: sp.marginTop + 3.0, w: cw,
  });
  ```
  Reserve `deck.equation()` layout for well-known equations that need no explanation (e.g., E = mc²).
- **Always prepend the macro preamble** to every `latex` string
- **Strip non-math commands** from equations: `\label{...}`, `\tag{...}`, `\nonumber`, `\notag`
- **`\compressstyle`**: remove it (display-only formatting hint)
- **`\resizebox{...}{...}{...}`**: extract the inner content (3rd argument)
- **`align` → `aligned`**: MathJax supports `\begin{aligned}...\end{aligned}`, not `\begin{align}`. Convert accordingly
- **`\text{}` inside math**: supported by MathJax
- **Author color commands** (`\textcolor{red}{...}`): strip them entirely
- **Long equations**: split into multiple lines with `aligned`, or use a smaller `w` value
- **Numbered equations**: use the `label` prop, not `\tag{}`

## Figure Tips

- Use `deck.image()` for single figures with title + caption
- For side-by-side figures (subfigures), use `deck.blank()` and place two images manually:
  ```ts
  const slide = deck.blank({ bg: "primary" });
  deck.components.heading(slide, { text: "Results", x: 0.8, y: 0.5, w: 11 });
  slide.addImage({ path: img("fig_left.png"), x: 0.5, y: 1.5, w: 5.8, h: 4, sizing: { type: "contain", w: 5.8, h: 4 } });
  slide.addImage({ path: img("fig_right.png"), x: 6.8, y: 1.5, w: 5.8, h: 4, sizing: { type: "contain", w: 5.8, h: 4 } });
  ```
- For figures with many subfigures: select the most important 1-2 subfigures

## Theorem/Definition Styling

| LaTeX environment | Slide treatment |
|---|---|
| `theorem` | `calloutBlock` variant `accent` + equation component for math |
| `definition` | `calloutBlock` variant `info` |
| `lemma` | `calloutBlock` variant `card` (skip minor lemmas) |
| `corollary` | Bullet point under the parent theorem slide |
| `remark` | `calloutBlock` variant `code` or skip |
| `proof` | 1-2 bullet summary of key idea; never full proof |

## Layout Selection Guide

- **Title/authors** → `title`
- **Section dividers** → `section`
- **Bullet summaries** → `content` (3-5 bullets max)
- **Single key equation** → `equation` layout
- **Multiple related equations** → `equation` layout (up to 3 per slide)
- **Equation + explanation** → `blank` with `heading` + `equation` + `bodyText`
- **Theorem/definition** → `blank` with `calloutBlock` + `equation`
- **Single figure** → `image`
- **Multiple figures** → `blank` with manual image placement
- **Comparison** → `twoColumn`
- **Data table** → `table`
- **Key quote from paper** → `quote`

## Theme Selection

Before choosing a theme, check if its fonts are installed (`fc-list` or `ls ~/Library/Fonts/`). If missing, either run the installer or fall back to a no-install option.

| Theme | Install needed | Fonts to check |
|---|---|---|
| `claudeDoc` | `./scripts/install-fonts.sh` | DM Serif Display, Inter, JetBrains Mono |
| `elegantBw` | `./scripts/install-fonts.sh elegant-bw` | Playfair Display, Space Grotesk, Inter |
| `basicWhite` | **None** | Helvetica Neue, Menlo (macOS built-in) |
| `claudeDoc` + `macosNative` preset | **None** | Iowan Old Style, Avenir Next, Menlo (macOS built-in) |

## Reference

- See `CLAUDE.md` for the full component and layout API
- See `/slides` skill for general slide-building patterns
- See `/figure` skill for generating raster figures when TikZ cannot be compiled
- See `/slides-check` skill for the verification workflow
- **Inline math in text**: Wrap variable names and short expressions in `$...$` for proper rendering in bullet lists, body text, and callout blocks. For example: `"$X_t$ — noisy state at time t"` renders `X` with subscript `t`. Supports subscripts (`$c_i$`), superscripts (`$x^2$`), Greek letters (`$\alpha$`), and combinations (`$\alpha_t$`). Complex expressions (`\frac`, `\sqrt`) should use the standalone `equation()` component instead.
