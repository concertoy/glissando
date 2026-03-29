/**
 * Citation formatter for academic slide footers.
 *
 * Supports two styles:
 *   - "author-year": [Smith et al., 2023]
 *   - "compact":     [SJL+23]
 */

import type { BibEntry } from "./types.js";

export function formatCitations(
  keys: string[],
  bib: Map<string, BibEntry>,
  style: "author-year" | "compact",
): string {
  const parts = keys.map((key) => {
    const entry = bib.get(key);
    if (!entry) return key;
    if (style === "compact") {
      const initials = entry.authors.map((a) => a[0]).join("");
      return `${initials}${String(entry.year).slice(-2)}`;
    }
    // author-year
    const { authors, year } = entry;
    const authorStr =
      authors.length === 1
        ? authors[0]
        : authors.length === 2
          ? `${authors[0]} & ${authors[1]}`
          : `${authors[0]} et al.`;
    return `${authorStr}, ${year}`;
  });
  return `[${parts.join("; ")}]`;
}
