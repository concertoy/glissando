/**
 * Inline math renderer — converts $...$ delimited LaTeX in text strings
 * to pptxgenjs rich text arrays with subscript/superscript formatting
 * and Unicode Greek letters.
 *
 * Three tiers of expression handling:
 *   - Simple:   c_i, x^2, \alpha, \beta_k → text runs with sub/superscript
 *   - Moderate: X_{t-1}^2, \hat{x}, \bar{\alpha} → text runs + combining chars
 *   - Complex:  \frac{a}{b}, \sqrt{x} → warning, rendered as-is
 */

import type { TextRun } from "./ooxml/index.js";

// ---------------------------------------------------------------------------
// Greek letter map — LaTeX command → Unicode character
// ---------------------------------------------------------------------------

const GREEK_MAP: Record<string, string> = {
  // Lowercase
  "\\alpha": "\u03B1", "\\beta": "\u03B2", "\\gamma": "\u03B3",
  "\\delta": "\u03B4", "\\epsilon": "\u03B5", "\\varepsilon": "\u03B5",
  "\\zeta": "\u03B6", "\\eta": "\u03B7", "\\theta": "\u03B8",
  "\\vartheta": "\u03D1", "\\iota": "\u03B9", "\\kappa": "\u03BA",
  "\\lambda": "\u03BB", "\\mu": "\u03BC", "\\nu": "\u03BD",
  "\\xi": "\u03BE", "\\pi": "\u03C0", "\\rho": "\u03C1",
  "\\sigma": "\u03C3", "\\varsigma": "\u03C2", "\\tau": "\u03C4",
  "\\upsilon": "\u03C5", "\\phi": "\u03C6", "\\varphi": "\u03D5",
  "\\chi": "\u03C7", "\\psi": "\u03C8", "\\omega": "\u03C9",
  // Uppercase
  "\\Gamma": "\u0393", "\\Delta": "\u0394", "\\Theta": "\u0398",
  "\\Lambda": "\u039B", "\\Xi": "\u039E", "\\Pi": "\u03A0",
  "\\Sigma": "\u03A3", "\\Upsilon": "\u03A5", "\\Phi": "\u03A6",
  "\\Psi": "\u03A8", "\\Omega": "\u03A9",
  // Common symbols
  "\\infty": "\u221E", "\\nabla": "\u2207", "\\partial": "\u2202",
  "\\ell": "\u2113", "\\hbar": "\u210F",
};

// Diacritic commands → Unicode combining characters
const DIACRITIC_MAP: Record<string, string> = {
  "\\hat": "\u0302",
  "\\bar": "\u0304",
  "\\tilde": "\u0303",
  "\\dot": "\u0307",
  "\\ddot": "\u0308",
  "\\vec": "\u20D7",
};

// Commands that require full equation rendering (too complex for text runs)
const COMPLEX_COMMANDS = new Set([
  "\\frac", "\\dfrac", "\\tfrac",
  "\\sqrt", "\\root",
  "\\sum", "\\prod", "\\int", "\\oint", "\\iint", "\\iiint",
  "\\mathbb", "\\mathcal", "\\mathscr", "\\mathfrak",
  "\\left", "\\right", "\\bigl", "\\bigr",
  "\\begin", "\\end",
  "\\binom", "\\tbinom", "\\dbinom",
  "\\over", "\\atop",
  "\\underset", "\\overset", "\\underbrace", "\\overbrace",
  "\\matrix", "\\pmatrix", "\\bmatrix",
]);

// Simple formatting commands that we strip (content is used as-is)
const STRIP_COMMANDS = new Set([
  "\\bm", "\\boldsymbol", "\\mathbf", "\\textbf",
  "\\mathrm", "\\textrm", "\\text",
  "\\mathit", "\\textit",
  "\\operatorname",
]);

// ---------------------------------------------------------------------------
// Segment types
// ---------------------------------------------------------------------------

export interface TextSegment {
  type: "text";
  value: string;
}

export interface MathSegment {
  type: "math";
  value: string;
}

export type Segment = TextSegment | MathSegment;

// ---------------------------------------------------------------------------
// Parser: split text on $...$ boundaries
// ---------------------------------------------------------------------------

export function parseInlineMath(text: string): Segment[] {
  const segments: Segment[] = [];
  let i = 0;
  while (i < text.length) {
    const dollarIdx = text.indexOf("$", i);
    if (dollarIdx === -1) {
      // No more $, rest is plain text
      if (i < text.length) segments.push({ type: "text", value: text.slice(i) });
      break;
    }
    // Text before the $
    if (dollarIdx > i) {
      segments.push({ type: "text", value: text.slice(i, dollarIdx) });
    }
    // Find closing $
    const closeIdx = text.indexOf("$", dollarIdx + 1);
    if (closeIdx === -1) {
      // No closing $, treat rest as text
      segments.push({ type: "text", value: text.slice(dollarIdx) });
      break;
    }
    const mathContent = text.slice(dollarIdx + 1, closeIdx);
    if (mathContent.length > 0) {
      segments.push({ type: "math", value: mathContent });
    }
    i = closeIdx + 1;
  }
  return segments;
}

// ---------------------------------------------------------------------------
// Complexity classifier
// ---------------------------------------------------------------------------

export function isComplexMath(latex: string): boolean {
  for (const cmd of COMPLEX_COMMANDS) {
    if (latex.includes(cmd)) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Math expression → text runs
// ---------------------------------------------------------------------------

interface BaseTextOpts {
  fontSize: number;
  fontFace: string;
  color: string;
}

/**
 * Extract the argument of a LaTeX operator at position `pos` in `str`.
 * If str[pos] is '{', returns the content up to the matching '}'.
 * Otherwise returns the single character at pos.
 * Returns [argument, nextIndex].
 */
function extractArg(str: string, pos: number): [string, number] {
  if (pos >= str.length) return ["", pos];
  if (str[pos] === "{") {
    let depth = 1;
    let j = pos + 1;
    while (j < str.length && depth > 0) {
      if (str[j] === "{") depth++;
      else if (str[j] === "}") depth--;
      j++;
    }
    return [str.slice(pos + 1, j - 1), j];
  }
  return [str[pos], pos + 1];
}

/**
 * Convert a simple/moderate LaTeX expression to pptxgenjs text runs.
 * Returns null if the expression is too complex.
 */
export function mathToTextRuns(
  latex: string,
  base: BaseTextOpts,
): TextRun[] | null {
  if (isComplexMath(latex)) return null;

  const runs: TextRun[] = [];
  const subFontSize = Math.round(base.fontSize * 0.7);

  // Pre-process: replace Greek commands and diacritics
  let processed = latex;

  // Replace formatting commands: \bm{x} → x, \mathbf{X} → X, etc.
  for (const cmd of STRIP_COMMANDS) {
    // Match \cmd{...} and replace with just the contents
    const re = new RegExp(cmd.replace(/\\/g, "\\\\") + "\\{([^}]*)\\}", "g");
    processed = processed.replace(re, "$1");
  }

  // Replace diacritics: \hat{x} → x̂, \bar{x} → x̄
  for (const [cmd, combining] of Object.entries(DIACRITIC_MAP)) {
    const re = new RegExp(cmd.replace(/\\/g, "\\\\") + "\\{([^}]*)\\}", "g");
    processed = processed.replace(re, (_, inner) => inner + combining);
  }

  // Replace Greek: \alpha → α
  for (const [cmd, unicode] of Object.entries(GREEK_MAP)) {
    // Use word boundary after command: \alpha but not \alphaX
    const re = new RegExp(cmd.replace(/\\/g, "\\\\") + "(?![a-zA-Z])", "g");
    processed = processed.replace(re, unicode);
  }

  // Strip remaining simple commands: \, (thin space) → space, ~ → space
  processed = processed.replace(/\\,/g, " ");
  processed = processed.replace(/~/g, " ");
  processed = processed.replace(/\\;/g, " ");
  processed = processed.replace(/\\!/g, "");
  processed = processed.replace(/\\quad/g, "  ");

  // Check for remaining unknown backslash commands
  if (isComplexMath(processed)) return null;

  // Now parse _ and ^ operators
  let i = 0;
  let currentText = "";

  function flushText() {
    if (currentText) {
      runs.push({
        text: currentText,
        options: { fontSize: base.fontSize, fontFace: base.fontFace, color: base.color },
      });
      currentText = "";
    }
  }

  while (i < processed.length) {
    const ch = processed[i];

    if (ch === "_") {
      flushText();
      const [arg, next] = extractArg(processed, i + 1);
      runs.push({
        text: arg,
        options: {
          fontSize: subFontSize,
          fontFace: base.fontFace,
          color: base.color,
          subscript: true,
        },
      });
      i = next;
    } else if (ch === "^") {
      flushText();
      const [arg, next] = extractArg(processed, i + 1);
      runs.push({
        text: arg,
        options: {
          fontSize: subFontSize,
          fontFace: base.fontFace,
          color: base.color,
          superscript: true,
        },
      });
      i = next;
    } else if (ch === "{" || ch === "}") {
      // Skip stray braces (from pre-processing)
      i++;
    } else if (ch === "\\") {
      // Unknown remaining backslash command — render literally
      // Find the end of the command name
      let j = i + 1;
      while (j < processed.length && /[a-zA-Z]/.test(processed[j])) j++;
      currentText += processed.slice(i + 1, j);
      i = j;
    } else {
      currentText += ch;
      i++;
    }
  }
  flushText();

  return runs.length > 0 ? runs : null;
}

// ---------------------------------------------------------------------------
// Main entry point: expand text with inline math
// ---------------------------------------------------------------------------

/**
 * Expand a text string containing $...$ inline math into pptxgenjs TextProps[].
 * Returns null if the text contains no inline math (caller should use plain string).
 */
/**
 * Check if text has inline subscript/superscript outside of math delimiters.
 * Matches ^{...} and _{...} patterns.
 */
function hasInlineSubSup(text: string): boolean {
  return /[\^_]\{[^}]+\}/.test(text);
}

/**
 * Expand plain-text ^{super} and _{sub} into text runs.
 * Does NOT handle $...$ math — just bare ^{} and _{} outside of math.
 */
function expandSubSup(text: string, base: BaseTextOpts): TextRun[] | null {
  if (!hasInlineSubSup(text)) return null;

  const runs: TextRun[] = [];
  const subFontSize = Math.round(base.fontSize * 0.7);
  let i = 0;
  let current = "";

  function flush() {
    if (current) {
      runs.push({ text: current, options: { fontSize: base.fontSize, fontFace: base.fontFace, color: base.color } });
      current = "";
    }
  }

  while (i < text.length) {
    if ((text[i] === "^" || text[i] === "_") && text[i + 1] === "{") {
      flush();
      const isSup = text[i] === "^";
      const [arg, next] = extractArg(text, i + 1);
      runs.push({
        text: arg,
        options: {
          fontSize: subFontSize,
          fontFace: base.fontFace,
          color: base.color,
          ...(isSup ? { superscript: true } : { subscript: true }),
        },
      });
      i = next;
    } else {
      current += text[i];
      i++;
    }
  }
  flush();

  return runs.length > 0 ? runs : null;
}

export function expandTextWithMath(
  text: string,
  base: BaseTextOpts,
): TextRun[] | null {
  // Check for $...$ math first
  if (!text.includes("$")) {
    // Check for bare ^{} and _{} subscript/superscript
    return expandSubSup(text, base);
  }

  const segments = parseInlineMath(text);

  // If parsing produced only text segments, no math was found
  if (segments.every((s) => s.type === "text")) return null;

  const runs: TextRun[] = [];

  for (const seg of segments) {
    if (seg.type === "text") {
      if (seg.value) {
        runs.push({
          text: seg.value,
          options: { fontSize: base.fontSize, fontFace: base.fontFace, color: base.color },
        });
      }
    } else {
      // Math segment
      const mathRuns = mathToTextRuns(seg.value, base);
      if (mathRuns) {
        runs.push(...mathRuns);
      } else {
        // Complex math: warn and render as italic plaintext (stripped of backslashes)
        const fallback = seg.value.replace(/\\/g, "");
        console.warn(
          `[inline-math] Complex expression "$${seg.value}$" cannot be rendered as text. ` +
          `Use the equation() component for this expression.`,
        );
        runs.push({
          text: fallback,
          options: {
            fontSize: base.fontSize,
            fontFace: base.fontFace,
            color: base.color,
            italic: true,
          },
        });
      }
    }
  }

  return runs.length > 0 ? runs : null;
}
