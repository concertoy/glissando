# Equation Reference

## Slide 4: Diffusion Models — Setup

Noising process:
```latex
X_t \overset{d}{=} \alpha_t X_0 + \sigma_t Z, \quad Z \sim \mathcal{N}(\mathbf{0}, \boldsymbol{I}), \quad X_0 \sim \pi_\star
```

Training loss:
```latex
\min_{\theta}\; \mathcal{L}_N(\bar{\boldsymbol{x}}_\theta, \lambda), \qquad \mathcal{L}_{N,t}(\bar{\boldsymbol{x}}) = \frac{1}{N}\sum_{i=1}^{N} \mathbb{E}_{X_t^i}\!\Big[\big\|\bar{\boldsymbol{x}}(t, X_t^i) - \boldsymbol{x}^i\big\|^2\Big]
```

## Slide 5: The Memorizing Denoiser

Memorizing denoiser:
```latex
\bar{\boldsymbol{x}}_{\mathrm{mem}}(t, \boldsymbol{x}_t) = \sum_{i=1}^{N} \boldsymbol{x}^{i}\; \operatorname{softmax}(\boldsymbol{w}(\cdot))_i
```

Softmax weights:
```latex
w_i(\boldsymbol{x}_t) = -\frac{1}{2\sigma_t^2}\|\alpha_t \boldsymbol{x}^{i} - \boldsymbol{x}_t\|^2, \quad i = 1,\dots,N
```

## Slide 6: Data Assumptions — Gaussian Mixtures

Target distribution:
```latex
\pi_\star = \frac{1}{K} \sum_{k=1}^{K} \mathcal{N}\!\big(\boldsymbol{\mu}_\star^{k},\; \sigma_\star^2 \boldsymbol{I}\big)
```

Isotropic GMM denoiser (Lemma 1):
```latex
\bar{\boldsymbol{x}}_\theta(t,\boldsymbol{x}_t) = \frac{\alpha_t \sigma^2}{\alpha_t^2 \sigma^2 + \sigma_t^2}\,\boldsymbol{x}_t + \frac{\sigma_t^2}{\alpha_t^2 \sigma^2 + \sigma_t^2}\sum_{i=1}^{M}\boldsymbol{\mu}^{i}\,\operatorname{softmax}(\boldsymbol{w}(\boldsymbol{x}_t))_i
```

## Slide 10: The Central Hypothesis

Partially memorizing denoiser:
```latex
\bar{\boldsymbol{x}}_{\mathrm{pmem},M}(t, \boldsymbol{x}_t) = \sum_{i=1}^{M} \boldsymbol{x}^i \, \operatorname{softmax}(\boldsymbol{w}(t, \boldsymbol{x}_t))_i
```

## Slide 11: Theorem 1 — Generalizing Denoiser Loss

```latex
\mathbb{E}_{(\boldsymbol{x}^i)}\!\Big[\mathcal{L}_{N,t}(\bar{\boldsymbol{x}}_\star) - \mathcal{L}_{N,t}(\bar{\boldsymbol{x}}_{\mathrm{mem}})\Big] = \Theta\!\left(\frac{d\,\sigma_\star^2}{\psi_t\,\sigma_\star^2 + 1}\right)
```

## Slide 12: Theorem 2 — Partially Memorizing Denoiser Loss

```latex
\mathbb{E}_{(\boldsymbol{x}^i)}\!\Big[\mathcal{L}_{N,t}(\bar{\boldsymbol{x}}_{\mathrm{pmem},M}) - \mathcal{L}_{N,t}(\bar{\boldsymbol{x}}_{\mathrm{mem}})\Big] = \Theta\!\left(\!\left(1 - \frac{M}{N}\right) d\,\sigma_\star^2\right)
```

## Slide 13: The Crossover Point M*

Training loss difference:
```latex
\mathbb{E}\!\Big[\mathcal{L}_N(\bar{\boldsymbol{x}}_{\mathrm{pmem},M}, \lambda) - \mathcal{L}_N(\bar{\boldsymbol{x}}_\star, \lambda)\Big] \approx \mathbb{E}_t\!\left[\lambda(t)\left\{C\!\left(1-\frac{M}{N}\right)d\sigma_\star^2 - \frac{d\sigma_\star^2}{\psi_t\sigma_\star^2+1}\right\}\right]
```

Crossover point:
```latex
M_\star \approx N\!\left\{1 - \frac{\mathbb{E}_t\!\big[\lambda(t)/(\psi_t\sigma_\star^2+1)\big]}{C\,\mathbb{E}_t\!\big[\lambda(t)\big]}\right\}
```
