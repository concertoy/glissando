/**
 * On the Edge of Memorization in Diffusion Models
 * Buchanan, Pai, Ma, De Bortoli — NeurIPS 2025
 *
 * Build:  ./build.sh examples/diffusion-memorization
 */

import { Deck, columns, below } from "../../src/index.js";
import { claudeDoc } from "../../src/themes/claude-doc/index.js";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const img = (name: string) => resolve(__dirname, name);

// MathJax macro preamble — prepend to every equation
const M = String.raw`
\newcommand{\vx}{\boldsymbol{x}}
\newcommand{\vmu}{\boldsymbol{\mu}}
\newcommand{\vSig}{\boldsymbol{\Sigma}}
\newcommand{\vI}{\boldsymbol{I}}
\newcommand{\vw}{\boldsymbol{w}}
\newcommand{\sL}{\mathcal{L}}
\newcommand{\sN}{\mathcal{N}}
\newcommand{\softmax}{\operatorname{softmax}}
\newcommand{\Zero}{\mathbf{0}}
`;
const tex = (s: string) => M + s;

export default async function build() {
  const deck = new Deck(claudeDoc);

  // Footer with slide numbers and citations
  deck.footer({
    slideNumber: true,
    text: "Buchanan et al. — NeurIPS 2025",
    citationStyle: "author-year",
    skip: [1, 19],
  });

  // Bibliography
  deck.bib("yoon2023", { authors: ["Yoon", "Lee", "Lim", "Shin"], year: 2023 });
  deck.bib("carlini2023", { authors: ["Carlini", "Hayes", "Nasr", "Jagielski", "Sehwag", "Tramèr", "Balle", "Ippolito", "Wallace"], year: 2023 });
  deck.bib("zhang2023", { authors: ["Zhang", "Chen", "Wang", "Dalva", "Ye", "Jia"], year: 2023 });
  deck.bib("weed2019", { authors: ["Weed", "Bach"], year: 2019 });

  const {
    heading, accentBar, bodyText, bulletList, calloutBlock,
    codeBlock, equation, diagramBox, arrow, container,
  } = deck.components;
  const sp = deck.config.spacing;
  const cw = sp.slideWidth - sp.marginLeft - sp.marginRight;
  const ml = sp.marginLeft;
  const mt = sp.marginTop;

  // ═══════════════════════════════════════════════════════════
  // Slide 1 — Title
  // ═══════════════════════════════════════════════════════════
  deck.title({
    title: "On the Edge of Memorization\nin Diffusion Models",
    subtitle: "Sam Buchanan*, Druv Pai* — TTIC / UC Berkeley  |  Yi Ma — UC Berkeley, HKU  |  Valentin De Bortoli — Google DeepMind",
  });

  // ═══════════════════════════════════════════════════════════
  // Slide 2 — The Core Question
  // ═══════════════════════════════════════════════════════════
  deck.content({
    title: "The Core Question",
    bullets: [
      "Diffusion models sometimes reproduce training data verbatim — memorization raises privacy and copyright concerns",
      "In other cases they generate novel samples not in the training set — genuine generalization or \"creativity\"",
      "The training loss itself promotes memorization: a sufficiently powerful model always reproduces training data exactly",
      "Can we quantitatively predict, based on $M$, $N$, $d$, $K$, whether a model memorizes or generalizes?",
    ],
    notes: "Key tension: the training objective rewards memorization, yet practical models often generalize. Why?",
  });

  // ═══════════════════════════════════════════════════════════
  // Slide 3 — Section: The Laboratory
  // ═══════════════════════════════════════════════════════════
  deck.section({
    title: "Part I",
    subtitle: "The Memorization Laboratory",
  });

  // ═══════════════════════════════════════════════════════════
  // Slide 4 — Diffusion Model Recap
  // ═══════════════════════════════════════════════════════════
  {
    const slide = deck.blank({ bg: "primary" });
    heading(slide, { text: "Diffusion Models: Setup", x: ml, y: mt, w: cw });
    accentBar(slide, { x: ml, y: mt + 0.8, w: 1.5 });

    bulletList(slide, {
      items: [
        "Forward process corrupts data with Gaussian noise; reverse process learns to denoise",
        "Tweedie\u2019s identity links the score to a denoiser: the posterior mean of the clean data given the noisy observation",
      ],
      x: ml, y: mt + 1.2, w: cw,
    });

    // Noising process
    const eq1 = await equation(slide, {
      latex: tex(String.raw`X_t \overset{d}{=} \alpha_t X_0 + \sigma_t Z, \quad Z \sim \sN(\Zero, \vI), \quad X_0 \sim \pi_\star`),
      label: "Noising process",
      x: ml + 0.5, y: mt + 2.4, w: cw - 1,
    });

    // Training loss
    const eq2 = await equation(slide, {
      latex: tex(String.raw`\min_{\theta}\; \sL_N(\bar{\vx}_\theta, \lambda), \qquad \sL_{N,t}(\bar{\vx}) = \frac{1}{N}\sum_{i=1}^{N} \mathbb{E}_{X_t^i}\!\Big[\big\|\bar{\vx}(t, X_t^i) - \vx^i\big\|^2\Big]`),
      label: "Denoising training loss",
      x: ml + 0.5, y: mt + 3.6, w: cw - 1,
    });

    bulletList(slide, {
      items: [
        "$\\alpha_t, \\sigma_t$ — signal and noise coefficients ($\\alpha_0 = 1, \\sigma_0 = 0$)",
        "$\\bar{\\boldsymbol{x}}_\\theta$ — parametric denoiser, $\\lambda(t)$ — time-weighting",
        "$X_t^i = \\alpha_t \\boldsymbol{x}^i + \\sigma_t Z$ — noised version of training point $\\boldsymbol{x}^i$",
      ],
      x: ml, y: mt + 4.8, w: cw,
    });
  }

  // ═══════════════════════════════════════════════════════════
  // Slide 5 — The Memorizing Denoiser
  // ═══════════════════════════════════════════════════════════
  {
    const slide = deck.blank({ bg: "primary" });
    heading(slide, { text: "The Memorizing Denoiser", x: ml, y: mt, w: cw });
    accentBar(slide, { x: ml, y: mt + 0.8, w: 1.5 });

    bodyText(slide, {
      text: "The non-parametric minimizer of the training loss always memorizes — the optimal denoiser is a softmax-weighted average of training points:",
      x: ml, y: mt + 1.2, w: cw,
    });

    await equation(slide, {
      latex: tex(String.raw`\bar{\vx}_{\mathrm{mem}}(t, \vx_t) = \sum_{i=1}^{N} \vx^{i}\; \softmax(\vw(\cdot))_i`),
      label: "Memorizing denoiser",
      x: ml + 1, y: mt + 2.2, w: cw - 2,
    });

    await equation(slide, {
      latex: tex(String.raw`w_i(\vx_t) = -\frac{1}{2\sigma_t^2}\|\alpha_t \vx^{i} - \vx_t\|^2, \quad i = 1,\dots,N`),
      label: "Softmax weights",
      x: ml + 1, y: mt + 3.3, w: cw - 2,
    });

    bulletList(slide, {
      items: [
        "As $\\sigma_t \\to 0$ (low noise), softmax sharpens — output collapses to nearest training point",
        "A sufficiently expressive model will always reproduce training data exactly",
        "The puzzle: why do real models generalize at all?",
      ],
      x: ml, y: mt + 4.4, w: cw,
    });
  }

  // ═══════════════════════════════════════════════════════════
  // Slide 6 — Gaussian Mixture Framework
  // ═══════════════════════════════════════════════════════════
  {
    const slide = deck.blank({ bg: "primary" });
    heading(slide, { text: "Data Assumptions: Gaussian Mixtures", x: ml, y: mt, w: cw });
    accentBar(slide, { x: ml, y: mt + 0.8, w: 1.5 });

    await equation(slide, {
      latex: tex(String.raw`\pi_\star = \frac{1}{K} \sum_{k=1}^{K} \sN\!\big(\vmu_\star^{k},\; \sigma_\star^2 \vI\big)`),
      label: "Target distribution",
      x: ml + 1, y: mt + 1.3, w: cw - 2,
    });

    bodyText(slide, {
      text: "Lemma 1: the MMSE denoiser for any M-component isotropic GMM has a closed-form softmax-weighted structure:",
      x: ml, y: mt + 2.3, w: cw,
    });

    await equation(slide, {
      latex: tex(String.raw`\bar{\vx}_\theta(t,\vx_t) = \frac{\alpha_t \sigma^2}{\alpha_t^2 \sigma^2 + \sigma_t^2}\,\vx_t + \frac{\sigma_t^2}{\alpha_t^2 \sigma^2 + \sigma_t^2}\sum_{i=1}^{M}\vmu^{i}\,\softmax(\vw(\vx_t))_i`),
      x: ml + 0.3, y: mt + 3.1, w: cw - 0.6,
    });

    bulletList(slide, {
      items: [
        "$M = K$ with true parameters → generalizing denoiser $\\bar{\\boldsymbol{x}}_\\star$",
        "$M = N$ with point masses at training data → memorizing denoiser $\\bar{\\boldsymbol{x}}_{\\mathrm{mem}}$",
        "Varying $M$ from $K$ to $N$ smoothly interpolates between generalization and memorization",
      ],
      x: ml, y: mt + 4.3, w: cw,
    });
  }

  // ═══════════════════════════════════════════════════════════
  // Slide 7 — Three Denoisers (Diagram)
  // ═══════════════════════════════════════════════════════════
  {
    const slide = deck.blank({ bg: "primary" });
    heading(slide, { text: "Three Denoisers", x: ml, y: mt, w: cw });
    accentBar(slide, { x: ml, y: mt + 0.8, w: 1.5 });

    const bx = ml + 0.3;
    const by = mt + 1.6;
    const bw = 3.2;
    const bh = 2.2;
    const gap = 0.65;

    const boxGen = diagramBox(slide, {
      text: "Generalizing\nDenoiser  x\u0305\u22C6\n\nM = K parameters\nMatches true \u03C0\u22C6",
      x: bx, y: by, w: bw, h: bh,
    });

    const boxPmem = diagramBox(slide, {
      text: "Partially Memorizing\nDenoiser  x\u0305pmem,M\n\nK \u2264 M \u2264 N params\nMemorizes M of N",
      x: bx + bw + gap, y: by, w: bw, h: bh,
    });

    const boxMem = diagramBox(slide, {
      text: "Memorizing\nDenoiser  x\u0305mem\n\nM = N parameters\nReproduces all data",
      x: bx + 2 * (bw + gap), y: by, w: bw, h: bh,
    });

    arrow(slide, {
      from: boxGen.right,
      to: boxPmem.left,
    });

    arrow(slide, {
      from: boxPmem.right,
      to: boxMem.left,
    });

    // Label above the arrows
    bodyText(slide, {
      text: "Increasing capacity M  \u2192",
      x: bx + bw + 0.2, y: by - 0.5, w: bw + 2 * gap,
    });

    await calloutBlock(slide, {
      variant: "accent",
      x: ml, y: by + bh + 0.5, w: cw, h: 1.3,
      body: "Core hypothesis: a trained denoiser memorizes iff the partially memorizing surrogate has lower training loss than the generalizing surrogate",
    });
  }

  // ═══════════════════════════════════════════════════════════
  // Slide 8 — Definition of Memorization
  // ═══════════════════════════════════════════════════════════
  {
    const slide = deck.blank({ bg: "primary" });
    heading(slide, { text: "Defining Memorization", x: ml, y: mt, w: cw });
    accentBar(slide, { x: ml, y: mt + 0.8, w: 1.5 });

    await calloutBlock(slide, {
      variant: "info",
      x: ml, y: mt + 1.3, w: cw, h: 1.5,
      body: "Definition: A generated sample x\u0302 is memorized if \u2016x\u0302 \u2212 x\u207D\u00B9\u207E\u2016\u00B2 \u2264 c \u2016x\u0302 \u2212 x\u207D\u00B2\u207E\u2016\u00B2, where x\u207D\u02B3\u207E is the k-th nearest neighbor in the training set (c = 1/9 in experiments)",
    });
    deck.cite("yoon2023");

    bulletList(slide, {
      items: [
        "A model is memorizing on average if its memorization ratio exceeds 50%",
        "Phase transition starts at ratio \u2265 10%, ends at ratio \u2265 90%",
      ],
      x: ml, y: mt + 3.1, w: cw,
    });

    await calloutBlock(slide, {
      variant: "card",
      x: ml, y: mt + 4.1, w: cw, h: 2.0,
      body: "Why N = poly(d) is the right regime:\n\u2022  N = exp(d log d): W\u2082 \u2192 0 \u2014 memorization and generalization are indistinguishable\n\u2022  N = poly(d): W\u2082 \u2265 \u03A9(1) \u2014 meaningful distinction persists in all dimensions",
    });
    deck.cite("weed2019");
  }

  // ═══════════════════════════════════════════════════════════
  // Slide 9 — Section: Theoretical Results
  // ═══════════════════════════════════════════════════════════
  deck.section({
    title: "Part II",
    subtitle: "Training Loss Asymptotics and the Crossover Point",
  });

  // ═══════════════════════════════════════════════════════════
  // Slide 10 — The Central Hypothesis
  // ═══════════════════════════════════════════════════════════
  {
    const slide = deck.blank({ bg: "primary" });
    heading(slide, { text: "The Central Hypothesis", x: ml, y: mt, w: cw });
    accentBar(slide, { x: ml, y: mt + 0.8, w: 1.5 });

    bodyText(slide, {
      text: "Direct optimization analysis is intractable (non-convex, many spurious critical points). Instead, compare surrogate losses:",
      x: ml, y: mt + 1.2, w: cw,
    });

    await equation(slide, {
      latex: tex(String.raw`\bar{\vx}_{\mathrm{pmem},M}(t, \vx_t) = \sum_{i=1}^{M} \vx^i \, \softmax(\vw(t, \vx_t))_i`),
      label: "Partially memorizing denoiser (memorizes M of N samples)",
      x: ml + 1, y: mt + 2.1, w: cw - 2,
    });

    await calloutBlock(slide, {
      variant: "accent",
      x: ml, y: mt + 3.4, w: cw, h: 1.4,
      body: "Hypothesis: There exists a loss weighting \u03BB such that a trained denoiser with M parameters memorizes if and only if \uD835\uDCDB\u2099(\u0078\u0305pmem,M, \u03BB) \u2264 \uD835\uDCDB\u2099(\u0078\u0305\u22C6, \u03BB)",
    });

    bulletList(slide, {
      items: [
        "Reduces a complex optimization question to a single inequality between closed-form losses",
        "The crossover point where the inequality flips predicts the memorization phase transition",
      ],
      x: ml, y: mt + 5.1, w: cw,
    });
  }

  // ═══════════════════════════════════════════════════════════
  // Slide 11 — Theorem 1
  // ═══════════════════════════════════════════════════════════
  {
    const slide = deck.blank({ bg: "primary" });
    heading(slide, { text: "Theorem 1: Generalizing Denoiser Loss", x: ml, y: mt, w: cw });
    accentBar(slide, { x: ml, y: mt + 0.8, w: 1.5 });

    await calloutBlock(slide, {
      variant: "accent",
      x: ml, y: mt + 1.2, w: cw, h: 0.8,
      body: "Under N = poly(d), well-separated clusters, \u03C3\u22C6\u00B2 = \u0398(1):",
    });

    await equation(slide, {
      latex: tex(String.raw`\mathbb{E}_{(\vx^i)}\!\Big[\sL_{N,t}(\bar{\vx}_\star) - \sL_{N,t}(\bar{\vx}_{\mathrm{mem}})\Big] = \Theta\!\left(\frac{d\,\sigma_\star^2}{\psi_t\,\sigma_\star^2 + 1}\right)`),
      x: ml + 0.5, y: mt + 2.3, w: cw - 1,
    });

    bulletList(slide, {
      items: [
        "$\\psi_t = \\alpha_t^2 / \\sigma_t^2$ — signal-to-noise ratio at diffusion time $t$",
        "High SNR (low noise): excess loss is small — generalizer nearly matches the memorizer",
        "Low SNR (heavy noise): excess loss saturates at $\\Theta(d\\sigma_\\star^2)$",
        "Holds uniformly on $t \\in [0, \\kappa(d)]$ where $\\kappa(d) \\to 1$ as $d \\to \\infty$",
      ],
      x: ml, y: mt + 3.6, w: cw,
    });
  }

  // ═══════════════════════════════════════════════════════════
  // Slide 12 — Theorem 2
  // ═══════════════════════════════════════════════════════════
  {
    const slide = deck.blank({ bg: "primary" });
    heading(slide, { text: "Theorem 2: Partially Memorizing Denoiser Loss", x: ml, y: mt, w: cw });
    accentBar(slide, { x: ml, y: mt + 0.8, w: 1.5 });

    await calloutBlock(slide, {
      variant: "accent",
      x: ml, y: mt + 1.2, w: cw, h: 0.8,
      body: "Under the same assumptions as Theorem 1:",
    });

    await equation(slide, {
      latex: tex(String.raw`\mathbb{E}_{(\vx^i)}\!\Big[\sL_{N,t}(\bar{\vx}_{\mathrm{pmem},M}) - \sL_{N,t}(\bar{\vx}_{\mathrm{mem}})\Big] = \Theta\!\left(\!\left(1 - \frac{M}{N}\right) d\,\sigma_\star^2\right)`),
      x: ml + 0.5, y: mt + 2.3, w: cw - 1,
    });

    bulletList(slide, {
      items: [
        "Linear in $(1 - M/N)$: each additional memorized sample reduces the gap by a fixed amount",
        "Independent of SNR $\\psi_t$ — the penalty is constant across all noise levels",
        "Leading-order coefficient lies in $[1, 2]$",
      ],
      x: ml, y: mt + 3.5, w: cw,
    });

    await calloutBlock(slide, {
      variant: "info",
      x: ml, y: mt + 5.2, w: cw, h: 1.5,
      body: "Key contrast: Theorem 1 excess loss depends on SNR \u03C8\u209C, while Theorem 2 does not. This asymmetry creates the crossover point \u2014 at some M*, memorization becomes favored.",
    });
  }

  // ═══════════════════════════════════════════════════════════
  // Slide 13 — The Crossover Point M*
  // ═══════════════════════════════════════════════════════════
  {
    const slide = deck.blank({ bg: "primary" });
    heading(slide, { text: "The Crossover Point M*", x: ml, y: mt, w: cw });
    accentBar(slide, { x: ml, y: mt + 0.8, w: 1.5 });

    bodyText(slide, {
      text: "Comparing the two theorems, the integrated training loss difference is:",
      x: ml, y: mt + 1.2, w: cw,
    });

    await equation(slide, {
      latex: tex(String.raw`\mathbb{E}\!\Big[\sL_N(\bar{\vx}_{\mathrm{pmem},M}, \lambda) - \sL_N(\bar{\vx}_\star, \lambda)\Big] \approx \mathbb{E}_t\!\left[\lambda(t)\left\{C\!\left(1-\frac{M}{N}\right)d\sigma_\star^2 - \frac{d\sigma_\star^2}{\psi_t\sigma_\star^2+1}\right\}\right]`),
      x: ml + 0.2, y: mt + 1.9, w: cw - 0.4,
    });

    bodyText(slide, {
      text: "Setting to zero and solving for M*:",
      x: ml, y: mt + 3.1, w: cw,
    });

    await equation(slide, {
      latex: tex(String.raw`M_\star \approx N\!\left\{1 - \frac{\mathbb{E}_t\!\big[\lambda(t)/(\psi_t\sigma_\star^2+1)\big]}{C\,\mathbb{E}_t\!\big[\lambda(t)\big]}\right\}`),
      x: ml + 1.5, y: mt + 3.7, w: cw - 3,
    });

    await calloutBlock(slide, {
      variant: "accent",
      x: ml, y: mt + 4.9, w: cw, h: 1.5,
      body: "M* is linear in N — the brace is constant w.r.t. N.\nExperimentally: M* \u2248 (4/5)N across all tested configurations.\nDouble the data, double the capacity threshold for memorization.",
    });
  }

  // ═══════════════════════════════════════════════════════════
  // Slide 14 — Section: Experiments
  // ═══════════════════════════════════════════════════════════
  deck.section({
    title: "Part III",
    subtitle: "Experimental Validation",
  });

  // ═══════════════════════════════════════════════════════════
  // Slide 15 — Phase Transition in GMMs
  // ═══════════════════════════════════════════════════════════
  {
    deck.image({
      title: "Phase Transition in Isotropic GMMs",
      imagePath: img("memorization_ratio.png"),
      caption: "Memorization ratio vs. model capacity M — a sharp phase transition from generalization to memorization",
    });
    deck.cite("zhang2023");
  }

  // ═══════════════════════════════════════════════════════════
  // Slide 16 — Predicting the Transition
  // ═══════════════════════════════════════════════════════════
  {
    const slide = deck.blank({ bg: "primary" });
    heading(slide, { text: "Predicting the Transition with Theory", x: ml, y: mt, w: cw });
    accentBar(slide, { x: ml, y: mt + 0.8, w: 1.5 });

    const [left, right] = columns(
      { x: ml, y: mt + 1.3, w: cw, h: 5.5 }, 2, 0.5,
    );

    slide.addImage({
      path: img("loss_weighting.png"),
      x: left.x, y: left.y, w: left.w, h: 4.5,
      sizing: { type: "contain", w: left.w, h: 4.5 },
    });

    bodyText(slide, {
      text: "Optimal loss weighting recovered via regression — train and test error \u2264 2 \u00D7 10\u207B\u2074",
      x: left.x, y: left.y + 4.6, w: left.w,
    });

    bulletList(slide, {
      items: [
        "Theoretical loss approximations from Theorems 1\u20132 predict the phase transition location",
        "The recovered crossover is always a linear function of $N$",
        "Across all tested $(N, d, K)$ configurations:",
      ],
      x: right.x, y: right.y, w: right.w,
    });

    await calloutBlock(slide, {
      variant: "accent",
      x: right.x, y: right.y + 2.2, w: right.w, h: 1.4,
      body: "M_pt \u2248 (4/5) N\nDouble the data, double the capacity threshold for memorization",
    });

    slide.addImage({
      path: img("train_loss_approx.png"),
      x: right.x, y: right.y + 3.8, w: right.w, h: 1.7,
      sizing: { type: "contain", w: right.w, h: 1.7 },
    });
  }

  // ═══════════════════════════════════════════════════════════
  // Slide 17 — FashionMNIST Extension
  // ═══════════════════════════════════════════════════════════
  {
    const slide = deck.blank({ bg: "primary" });
    heading(slide, { text: "Extension to Natural Images", x: ml, y: mt, w: cw });
    accentBar(slide, { x: ml, y: mt + 0.8, w: 1.5 });

    const [left, right] = columns(
      { x: ml, y: mt + 1.3, w: cw, h: 5.5 }, 2, 0.4,
    );

    slide.addImage({
      path: img("colored_fashionmnist.png"),
      x: left.x, y: left.y, w: left.w, h: 3.5,
      sizing: { type: "contain", w: left.w, h: 3.5 },
    });

    bodyText(slide, {
      text: "Low-rank GMM image model: colored FashionMNIST templates as mixture of rank-deficient Gaussians",
      x: left.x, y: left.y + 3.7, w: left.w,
    });

    slide.addImage({
      path: img("fashionmnist_memorization_ratio.png"),
      x: right.x, y: right.y, w: right.w, h: 3.5,
      sizing: { type: "contain", w: right.w, h: 3.5 },
    });

    bulletList(slide, {
      items: [
        "Same qualitative phase transition as the isotropic case",
        "Framework extends naturally to structured, image-like data",
        "Phase transition is robust \u2014 not an artifact of isotropic assumptions",
      ],
      x: right.x, y: right.y + 3.7, w: right.w,
    });
  }

  // ═══════════════════════════════════════════════════════════
  // Slide 18 — Contributions & Future Work
  // ═══════════════════════════════════════════════════════════
  deck.content({
    title: "Contributions and Future Directions",
    subtitle: "Summary",
    bullets: [
      ":checkmark: Memorization laboratory — GMM framework that disentangles model capacity, dataset size, and data geometry",
      ":checkmark: Tight loss approximations — Theorems 1\u20132 characterize excess training loss of generalizing and partially memorizing denoisers",
      ":checkmark: Predictive model — crossover point $M^\\star \\approx (4/5)N$ validated with error $\\leq 2 \\times 10^{-4}$",
      ":lightbulb: Future: extend to intrinsic dimensionality, partial data replication, geometry-driven memorization theory",
    ],
    notes: "The long-term vision: reduce statistical questions about sampling to geometric questions about the data itself.",
  });

  // ═══════════════════════════════════════════════════════════
  // Slide 19 — Thank You
  // ═══════════════════════════════════════════════════════════
  deck.title({
    title: "Thank You",
    subtitle: "Code: github.com/DruvPai/diffusion_mem_gen",
  });

  return deck;
}
