/**
 * Layout helpers — pure geometry functions for arranging components on slides.
 *
 * All functions take and return `Rect` objects ({ x, y, w, h } in inches),
 * which spread directly into component props.
 */

import type { Rect, ThemeSpacing } from "./types.js";

/** Full usable area inside slide margins. */
export function contentArea(sp: ThemeSpacing): Rect {
  return {
    x: sp.marginLeft,
    y: sp.marginTop,
    w: sp.slideWidth - sp.marginLeft - sp.marginRight,
    h: sp.slideHeight - sp.marginTop - sp.marginBottom,
  };
}

/**
 * Content area below a standard heading + accent bar.
 * Matches the layout convention: heading (0.7") + accent bar + gap = 1.15" below marginTop.
 */
export function contentAreaBelow(sp: ThemeSpacing): Rect {
  const headingOffset = 1.15; // heading + accent bar + breathing room
  const y = sp.marginTop + headingOffset;
  return {
    x: sp.marginLeft,
    y,
    w: sp.slideWidth - sp.marginLeft - sp.marginRight,
    h: sp.slideHeight - y - sp.marginBottom,
  };
}

/** Split a rect into N equal columns with optional gap between them. */
export function columns(area: Rect, n: number, gap = 0.4): Rect[] {
  const colW = (area.w - gap * (n - 1)) / n;
  return Array.from({ length: n }, (_, i) => ({
    x: area.x + i * (colW + gap),
    y: area.y,
    w: colW,
    h: area.h,
  }));
}

/** Split a rect into N equal rows with optional gap between them. */
export function rows(area: Rect, n: number, gap = 0.3): Rect[] {
  const rowH = (area.h - gap * (n - 1)) / n;
  return Array.from({ length: n }, (_, i) => ({
    x: area.x,
    y: area.y + i * (rowH + gap),
    w: area.w,
    h: rowH,
  }));
}

/** Return the sub-rect below a used height (for vertical stacking). */
export function below(area: Rect, usedH: number, gap = 0.3): Rect {
  return {
    x: area.x,
    y: area.y + usedH + gap,
    w: area.w,
    h: area.h - usedH - gap,
  };
}

/** Inset a rect by the given amounts (CSS-style: top, right, bottom, left). */
export function inset(area: Rect, top: number, right?: number, bottom?: number, left?: number): Rect {
  const r = right ?? top;
  const b = bottom ?? top;
  const l = left ?? r;
  return {
    x: area.x + l,
    y: area.y + top,
    w: area.w - l - r,
    h: area.h - top - b,
  };
}
