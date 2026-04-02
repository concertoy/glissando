/**
 * Unit tests for glissando core modules.
 *
 * Run: npx vitest run
 */

import { describe, it, expect } from "vitest";
import { columns, rows, below, inset, contentArea, contentAreaBelow } from "../src/layout.js";
import { parseInlineMath, isComplexMath, mathToTextRuns, expandTextWithMath } from "../src/inline-math.js";
import { Presentation, Slide, shapePresets } from "../src/ooxml/index.js";
import type { Rect, ThemeSpacing } from "../src/types.js";

// ─── Layout helpers ────────────────────────────────────────────────

const SP: ThemeSpacing = {
  slideWidth: 13.333,
  slideHeight: 7.5,
  marginLeft: 0.8,
  marginRight: 0.8,
  marginTop: 0.5,
  marginBottom: 0.5,
};

function approx(val: number, expected: number, tol = 0.001) {
  expect(val).toBeCloseTo(expected, 3);
}

describe("layout helpers", () => {
  describe("contentArea", () => {
    it("returns full usable area inside margins", () => {
      const r = contentArea(SP);
      approx(r.x, 0.8);
      approx(r.y, 0.5);
      approx(r.w, 11.733);
      approx(r.h, 6.5);
    });
  });

  describe("contentAreaBelow", () => {
    it("offsets below heading + accent bar", () => {
      const r = contentAreaBelow(SP);
      approx(r.x, 0.8);
      approx(r.y, 1.65); // 0.5 + 1.15
      approx(r.w, 11.733);
      expect(r.h).toBeLessThan(6.5);
    });
  });

  describe("columns", () => {
    it("splits into equal columns with gap", () => {
      const area: Rect = { x: 1, y: 1, w: 10, h: 5 };
      const cols = columns(area, 2, 0.4);
      expect(cols).toHaveLength(2);
      approx(cols[0].w, 4.8);
      approx(cols[1].w, 4.8);
      approx(cols[0].x, 1);
      approx(cols[1].x, 6.2); // 1 + 4.8 + 0.4
      expect(cols[0].y).toBe(1);
      expect(cols[0].h).toBe(5);
    });

    it("handles 3 columns", () => {
      const area: Rect = { x: 0, y: 0, w: 12, h: 6 };
      const cols = columns(area, 3, 0.3);
      expect(cols).toHaveLength(3);
      // 12 = 3*w + 2*0.3 → w = (12 - 0.6) / 3 = 3.8
      approx(cols[0].w, 3.8);
      approx(cols[2].x, 8.2); // 0 + 2*(3.8+0.3)
    });

    it("single column returns full width", () => {
      const area: Rect = { x: 1, y: 1, w: 8, h: 4 };
      const cols = columns(area, 1);
      expect(cols).toHaveLength(1);
      approx(cols[0].w, 8);
      approx(cols[0].x, 1);
    });
  });

  describe("rows", () => {
    it("splits into equal rows with gap", () => {
      const area: Rect = { x: 1, y: 1, w: 10, h: 6 };
      const r = rows(area, 2, 0.2);
      expect(r).toHaveLength(2);
      approx(r[0].h, 2.9); // (6 - 0.2) / 2
      approx(r[1].y, 4.1); // 1 + 2.9 + 0.2
    });
  });

  describe("below", () => {
    it("returns sub-rect below used height", () => {
      const area: Rect = { x: 1, y: 1, w: 10, h: 6 };
      const r = below(area, 2, 0.3);
      approx(r.x, 1);
      approx(r.y, 3.3); // 1 + 2 + 0.3
      approx(r.w, 10);
      approx(r.h, 3.7); // 6 - 2 - 0.3
    });
  });

  describe("inset", () => {
    it("CSS-style uniform inset", () => {
      const area: Rect = { x: 0, y: 0, w: 10, h: 6 };
      const r = inset(area, 1);
      approx(r.x, 1);
      approx(r.y, 1);
      approx(r.w, 8);
      approx(r.h, 4);
    });

    it("CSS-style 4-value inset", () => {
      const area: Rect = { x: 0, y: 0, w: 10, h: 6 };
      const r = inset(area, 0.5, 1, 0.5, 1);
      approx(r.x, 1);
      approx(r.y, 0.5);
      approx(r.w, 8);
      approx(r.h, 5);
    });

    it("CSS-style 2-value inset (top/bottom, left/right)", () => {
      const area: Rect = { x: 0, y: 0, w: 10, h: 6 };
      const r = inset(area, 0.5, 1);
      approx(r.x, 1);
      approx(r.y, 0.5);
      approx(r.w, 8);
      approx(r.h, 5);
    });
  });
});

// ─── Inline math parsing ───────────────────────────────────────────

describe("inline math", () => {
  describe("parseInlineMath", () => {
    it("parses text without math", () => {
      const segs = parseInlineMath("Hello world");
      expect(segs).toEqual([{ type: "text", value: "Hello world" }]);
    });

    it("parses single inline math", () => {
      const segs = parseInlineMath("Energy $E = mc^2$ is");
      expect(segs).toEqual([
        { type: "text", value: "Energy " },
        { type: "math", value: "E = mc^2" },
        { type: "text", value: " is" },
      ]);
    });

    it("handles multiple math segments", () => {
      const segs = parseInlineMath("$x$ and $y$");
      expect(segs).toHaveLength(3);
      expect(segs[0]).toEqual({ type: "math", value: "x" });
      expect(segs[1]).toEqual({ type: "text", value: " and " });
      expect(segs[2]).toEqual({ type: "math", value: "y" });
    });

    it("handles unclosed dollar sign as text", () => {
      const segs = parseInlineMath("Price is $5");
      expect(segs).toEqual([
        { type: "text", value: "Price is " },
        { type: "text", value: "$5" },
      ]);
    });
  });

  describe("isComplexMath", () => {
    it("returns false for simple expressions", () => {
      expect(isComplexMath("x^2")).toBe(false);
      expect(isComplexMath("c_i")).toBe(false);
      expect(isComplexMath("\\alpha")).toBe(false);
    });

    it("returns true for complex expressions", () => {
      expect(isComplexMath("\\frac{a}{b}")).toBe(true);
      expect(isComplexMath("\\sqrt{x}")).toBe(true);
      expect(isComplexMath("\\sum_{i=1}^{n}")).toBe(true);
    });
  });

  describe("mathToTextRuns", () => {
    const base = { fontSize: 18, fontFace: "Inter", color: "333333" };

    it("converts simple variable", () => {
      const runs = mathToTextRuns("x", base);
      expect(runs).not.toBeNull();
      expect(runs![0].text).toBe("x");
    });

    it("converts subscript", () => {
      const runs = mathToTextRuns("c_i", base);
      expect(runs).not.toBeNull();
      expect(runs!.some((r) => r.options?.subscript === true)).toBe(true);
    });

    it("converts superscript", () => {
      const runs = mathToTextRuns("x^2", base);
      expect(runs).not.toBeNull();
      expect(runs!.some((r) => r.options?.superscript === true)).toBe(true);
    });

    it("converts Greek letters", () => {
      const runs = mathToTextRuns("\\alpha", base);
      expect(runs).not.toBeNull();
      expect(runs![0].text).toBe("\u03B1");
    });

    it("returns null for complex expressions", () => {
      expect(mathToTextRuns("\\frac{a}{b}", base)).toBeNull();
    });
  });
});

// ─── OOXML writer ──────────────────────────────────────────────────

describe("OOXML", () => {
  describe("Presentation", () => {
    it("creates slides with incrementing indices", () => {
      const pres = new Presentation();
      const s1 = pres.addSlide();
      const s2 = pres.addSlide();
      expect(pres._slides).toHaveLength(2);
      expect(s1._slideIndex).toBe(0);
      expect(s2._slideIndex).toBe(1);
    });

    it("sets layout dimensions", () => {
      const pres = new Presentation();
      pres.defineLayout({ name: "CUSTOM", width: 13.333, height: 7.5 });
      expect(pres._width).toBeCloseTo(13.333);
      expect(pres._height).toBeCloseTo(7.5);
    });

    it("sets theme fonts", () => {
      const pres = new Presentation();
      pres.theme = { headFontFace: "Playfair", bodyFontFace: "Inter" };
      expect(pres._headFont).toBe("Playfair");
      expect(pres._bodyFont).toBe("Inter");
    });
  });

  describe("Slide", () => {
    it("sets background color", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.background = { color: "1A1A1A" };
      expect(slide.background.color).toBe("1A1A1A");
    });

    it("adds text elements", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText("Hello", { x: 1, y: 1, w: 5, h: 1 });
      expect(slide._elements).toHaveLength(1);
      expect(slide._elements[0]).toContain("Hello");
    });

    it("adds shapes", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addShape("roundRect", { x: 1, y: 1, w: 3, h: 2, fill: { color: "FF0000" }, rectRadius: 0.1 });
      expect(slide._elements).toHaveLength(1);
      expect(slide._elements[0]).toContain("roundRect");
      expect(slide._elements[0]).toContain("FF0000");
    });

    it("tracks named shapes with IDs", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText("Box", { objectName: "myBox", x: 0, y: 0, w: 1, h: 1 });
      expect(slide._nameToId.has("myBox")).toBe(true);
    });

    it("adds speaker notes", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addNotes("Remember to pause here");
      expect(slide._notes).toBe("Remember to pause here");
    });

    it("supports hyperlinks in text runs", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText([
        { text: "Click ", options: {} },
        { text: "here", options: { href: "https://example.com", color: "0000FF", underline: true } },
      ], { x: 0, y: 0, w: 5, h: 1 });
      const xml = slide._elements[0];
      expect(xml).toContain("hlinkClick");
      expect(slide._hyperlinks).toHaveLength(1);
      expect(slide._hyperlinks[0].url).toBe("https://example.com");

      const rels = slide._toRelsXml(false);
      expect(rels).toContain("hyperlink");
      expect(rels).toContain("https://example.com");
    });

    it("generates valid slide XML", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.background = { color: "FFFFFF" };
      slide.addText("Test", { x: 0, y: 0, w: 5, h: 1 });
      const xml = slide._toXml();
      expect(xml).toContain('<?xml version="1.0"');
      expect(xml).toContain("<p:sld");
      expect(xml).toContain("<p:spTree>");
      expect(xml).toContain("Test");
      expect(xml).toContain("</p:sld>");
    });

    it("generates relationship XML", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      const rels = slide._toRelsXml(false);
      expect(rels).toContain("slideLayout1.xml");
      expect(rels).not.toContain("notesSlide");
    });

    it("includes notes relationship when notes exist", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addNotes("test");
      const rels = slide._toRelsXml(true);
      expect(rels).toContain("notesSlide");
    });

    it("generates transition XML", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.transition = { type: "fade", duration: 500 };
      const xml = slide._toXml();
      expect(xml).toContain("<p:transition");
      expect(xml).toContain("<p:fade/>");
      expect(xml).toContain('spd="fast"');
    });

    it("generates push transition", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.transition = { type: "push", duration: 1500 };
      const xml = slide._toXml();
      expect(xml).toContain("<p:push/>");
      expect(xml).toContain('spd="slow"');
    });
  });

  describe("accessibility", () => {
    it("adds alt text to text shapes", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText("Hello", { x: 0, y: 0, w: 5, h: 1, altText: "Greeting text" });
      expect(slide._elements[0]).toContain('descr="Greeting text"');
    });

    it("adds alt text to images", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      // Use a tiny 1x1 PNG
      const tinyPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
      slide.addImage({ data: tinyPng, x: 0, y: 0, w: 1, h: 1, altText: "A small test image" });
      expect(slide._elements[0]).toContain('descr="A small test image"');
    });

    it("escapes special characters in alt text", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText("Test", { x: 0, y: 0, w: 5, h: 1, altText: 'Formula: a < b & c > d' });
      expect(slide._elements[0]).toContain('descr="Formula: a &lt; b &amp; c &gt; d"');
    });
  });

  describe("gradient fills", () => {
    it("generates linear gradient on shape", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addShape("rect", {
        x: 0, y: 0, w: 5, h: 3,
        gradient: {
          type: "linear",
          angle: 90,
          stops: [
            { position: 0, color: "FF0000" },
            { position: 100, color: "0000FF" },
          ],
        },
      });
      const xml = slide._elements[0];
      expect(xml).toContain("<a:gradFill>");
      expect(xml).toContain("FF0000");
      expect(xml).toContain("0000FF");
      expect(xml).toContain("<a:lin");
    });

    it("generates radial gradient", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addShape("rect", {
        x: 0, y: 0, w: 5, h: 3,
        gradient: {
          type: "radial",
          stops: [
            { position: 0, color: "FFFFFF" },
            { position: 100, color: "000000" },
          ],
        },
      });
      const xml = slide._elements[0];
      expect(xml).toContain("<a:gradFill>");
      expect(xml).toContain('<a:path path="circle">');
    });
  });

  describe("gradient backgrounds", () => {
    it("uses solid fill by default", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.background = { color: "FF0000" };
      const xml = slide._toXml();
      expect(xml).toContain('<a:solidFill><a:srgbClr val="FF0000"/></a:solidFill>');
    });

    it("uses gradient fill when gradient is provided", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.background = {
        color: "000000",
        gradient: {
          type: "linear",
          angle: 45,
          stops: [
            { position: 0, color: "FF0000" },
            { position: 100, color: "0000FF" },
          ],
        },
      };
      const xml = slide._toXml();
      expect(xml).toContain("<a:gradFill>");
      expect(xml).toContain("FF0000");
      expect(xml).toContain("0000FF");
      expect(xml).not.toContain("<a:solidFill>");
    });
  });

  describe("text highlighting", () => {
    it("adds highlight to text run", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText([
        { text: "highlighted", options: { highlight: "FFFF00" } },
      ], { x: 0, y: 0, w: 5, h: 1 });
      const xml = slide._elements[0];
      expect(xml).toContain('<a:highlight><a:srgbClr val="FFFF00"/></a:highlight>');
    });

    it("does not add highlight when not specified", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText("no highlight", { x: 0, y: 0, w: 5, h: 1 });
      const xml = slide._elements[0];
      expect(xml).not.toContain("<a:highlight>");
    });
  });

  describe("strikethrough", () => {
    it("adds strikethrough to text run", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText([
        { text: "deleted", options: { strike: true } },
      ], { x: 0, y: 0, w: 5, h: 1 });
      const xml = slide._elements[0];
      expect(xml).toContain('strike="sngStrike"');
    });
  });

  describe("rotation", () => {
    it("rotates text shapes", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText("rotated", { x: 0, y: 0, w: 5, h: 1, rotate: 45 });
      const xml = slide._elements[0];
      // 45 degrees * 60000 = 2700000
      expect(xml).toContain('rot="2700000"');
    });

    it("rotates shapes", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addShape("rect", { x: 0, y: 0, w: 5, h: 3, rotate: 90 });
      const xml = slide._elements[0];
      expect(xml).toContain('rot="5400000"');
    });
  });

  describe("text columns", () => {
    it("adds numCol attribute for multi-column text", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText("Two columns", { x: 0, y: 0, w: 10, h: 5, columns: 2 });
      const xml = slide._elements[0];
      expect(xml).toContain('numCol="2"');
      expect(xml).toContain("spcCol=");
    });

    it("does not add numCol for single column", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText("One column", { x: 0, y: 0, w: 10, h: 5 });
      const xml = slide._elements[0];
      expect(xml).not.toContain("numCol=");
    });
  });

  describe("text shape opacity", () => {
    it("adds alpha to solid fill", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText("Semi-transparent", {
        x: 0, y: 0, w: 5, h: 1,
        shape: "rect",
        fill: { color: "FF0000" },
        opacity: 0.5,
      });
      const xml = slide._elements[0];
      expect(xml).toContain('<a:alpha val="50000"/>');
    });
  });

  describe("custom bullet character", () => {
    it("uses char field on BulletOpts", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText([
        { text: "item", options: { bullet: { type: "bullet", char: "›" } } },
      ], { x: 0, y: 0, w: 5, h: 1 });
      const xml = slide._elements[0];
      expect(xml).toContain('char="›"');
    });
  });

  describe("text shadow", () => {
    it("adds outerShdw effect to text run", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText([
        { text: "shadowed", options: { textShadow: true } },
      ], { x: 0, y: 0, w: 5, h: 1 });
      const xml = slide._elements[0];
      expect(xml).toContain("<a:outerShdw");
      expect(xml).toContain("<a:effectLst>");
    });

    it("uses custom shadow options", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText([
        { text: "custom", options: { textShadow: { color: "FF0000", blur: 5, offset: 3, angle: 180 } } },
      ], { x: 0, y: 0, w: 5, h: 1 });
      const xml = slide._elements[0];
      expect(xml).toContain("FF0000");
      expect(xml).toContain(`dir="${180 * 60000}"`);
    });
  });

  describe("vertical text", () => {
    it("adds vert attribute to bodyPr", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText("Vertical", { x: 0, y: 0, w: 1, h: 5, vertical: "vert" });
      const xml = slide._elements[0];
      expect(xml).toContain('vert="vert"');
    });

    it("supports vert270 direction", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText("Bottom-up", { x: 0, y: 0, w: 1, h: 5, vertical: "vert270" });
      const xml = slide._elements[0];
      expect(xml).toContain('vert="vert270"');
    });
  });

  describe("image cropping", () => {
    it("adds srcRect for crop percentages", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      const tinyPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
      slide.addImage({ data: tinyPng, x: 0, y: 0, w: 5, h: 3, crop: { top: 10, right: 20, bottom: 5, left: 15 } });
      const xml = slide._elements[0];
      expect(xml).toContain('<a:srcRect t="10000" r="20000" b="5000" l="15000"/>');
    });

    it("rotates images", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      const tinyPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
      slide.addImage({ data: tinyPng, x: 0, y: 0, w: 5, h: 3, rotate: 30 });
      const xml = slide._elements[0];
      expect(xml).toContain(`rot="${30 * 60000}"`);
    });

    it("adds border to images", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      const tinyPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
      slide.addImage({ data: tinyPng, x: 0, y: 0, w: 5, h: 3, line: { color: "FF0000", width: 2 } });
      const xml = slide._elements[0];
      expect(xml).toContain("<a:ln");
      expect(xml).toContain("FF0000");
    });

    it("adds shadow to images", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      const tinyPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
      slide.addImage({ data: tinyPng, x: 0, y: 0, w: 5, h: 3, shadow: { color: "333333", blur: 5 } });
      const xml = slide._elements[0];
      expect(xml).toContain("<a:outerShdw");
      expect(xml).toContain("333333");
    });

    it("does not add srcRect without crop", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      const tinyPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
      slide.addImage({ data: tinyPng, x: 0, y: 0, w: 5, h: 3 });
      const xml = slide._elements[0];
      expect(xml).not.toContain("<a:srcRect");
    });
  });

  describe("text shape flipping", () => {
    it("adds flipH and flipV to text shape xfrm", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText("Flipped", { x: 0, y: 0, w: 5, h: 1, flipH: true, flipV: true });
      const xml = slide._elements[0];
      expect(xml).toContain('flipH="1"');
      expect(xml).toContain('flipV="1"');
    });
  });

  describe("slide background image", () => {
    it("uses blipFill for background image", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      const tinyPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
      slide.background = { color: "000000", image: tinyPng };
      const xml = slide._toXml();
      expect(xml).toContain("<a:blipFill>");
      expect(xml).toContain("r:embed=");
      expect(xml).not.toContain("<a:solidFill>");
    });
  });

  describe("table cell merge", () => {
    it("adds gridSpan for colspan", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addTable([
        [{ text: "Merged", options: { colspan: 2 } }, { text: "", options: { _hMerge: true } as any }],
        [{ text: "A" }, { text: "B" }],
      ], { x: 0, y: 0, w: 8 });
      const xml = slide._elements[0];
      expect(xml).toContain('gridSpan="2"');
      expect(xml).toContain('hMerge="1"');
    });

    it("adds rowSpan for rowspan", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addTable([
        [{ text: "Tall", options: { rowspan: 2 } }, { text: "Right" }],
        [{ text: "", options: { _vMerge: true } as any }, { text: "Right 2" }],
      ], { x: 0, y: 0, w: 8 });
      const xml = slide._elements[0];
      expect(xml).toContain('rowSpan="2"');
      expect(xml).toContain('vMerge="1"');
    });
  });

  describe("table row heights", () => {
    it("supports per-row height array", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addTable([
        [{ text: "Row 1" }],
        [{ text: "Row 2" }],
      ], { x: 0, y: 0, w: 8, rowH: [0.5, 1.0] });
      const xml = slide._elements[0];
      // First row should be 0.5 inches = 457200 EMU
      expect(xml).toContain('h="457200"');
      // Second row should be 1.0 inches = 914400 EMU
      expect(xml).toContain('h="914400"');
    });
  });

  describe("rich text in tables", () => {
    it("supports TextRun[] in table cells", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addTable([
        [{ text: [
          { text: "bold", options: { bold: true } },
          { text: " normal" },
        ] }],
      ], { x: 0, y: 0, w: 8 });
      const xml = slide._elements[0];
      expect(xml).toContain('b="1"');
      expect(xml).toContain("bold");
      expect(xml).toContain("normal");
    });
  });

  describe("dashed lines", () => {
    it("adds dash style to shape lines", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addShape("rect", {
        x: 0, y: 0, w: 5, h: 3,
        line: { color: "000000", width: 2, dashType: "lgDash" },
      });
      const xml = slide._elements[0];
      expect(xml).toContain('<a:prstDash val="lgDash"/>');
    });

    it("adds dash style to text shape lines", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText("Dashed border", {
        x: 0, y: 0, w: 5, h: 1,
        shape: "rect",
        fill: { color: "FFFFFF" },
        line: { color: "FF0000", dashType: "dot" },
      });
      const xml = slide._elements[0];
      expect(xml).toContain('<a:prstDash val="dot"/>');
    });
  });

  describe("arrow shape presets", () => {
    it("renders chevron shape", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addShape("chevron", { x: 0, y: 0, w: 2, h: 1, fill: { color: "FF0000" } });
      const xml = slide._elements[0];
      expect(xml).toContain('prst="chevron"');
    });

    it("renders rightArrow shape", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addShape("rightArrow", { x: 0, y: 0, w: 2, h: 1, fill: { color: "00FF00" } });
      const xml = slide._elements[0];
      expect(xml).toContain('prst="rightArrow"');
    });

    it("renders ellipse shape", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addShape("ellipse", { x: 0, y: 0, w: 2, h: 2, fill: { color: "0000FF" } });
      const xml = slide._elements[0];
      expect(xml).toContain('prst="ellipse"');
    });
  });

  describe("shape adjustments", () => {
    it("passes custom adjust values", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addShape("rightArrow", {
        x: 0, y: 0, w: 3, h: 1,
        fill: { color: "FF0000" },
        adjustments: { adj1: 50000, adj2: 25000 },
      });
      const xml = slide._elements[0];
      expect(xml).toContain('name="adj1" fmla="val 50000"');
      expect(xml).toContain('name="adj2" fmla="val 25000"');
    });
  });

  describe("typed table borders", () => {
    it("renders typed border options", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addTable([
        [{ text: "Cell", options: {
          border: [
            { pt: 2, color: "FF0000" },
            { type: "none" },
            { pt: 1, color: "0000FF" },
            { type: "none" },
          ],
        } }],
      ], { x: 0, y: 0, w: 8 });
      const xml = slide._elements[0];
      expect(xml).toContain("FF0000");
      expect(xml).toContain("0000FF");
      expect(xml).toContain("<a:noFill/>");
    });
  });

  describe("multi-paragraph table cells", () => {
    it("splits rich text on breakLine", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addTable([
        [{ text: [
          { text: "Line 1", options: { breakLine: true } },
          { text: "Line 2" },
        ] }],
      ], { x: 0, y: 0, w: 8 });
      const xml = slide._elements[0];
      const pCount = (xml.match(/<a:p>/g) || []).length;
      expect(pCount).toBe(2);
    });
  });

  describe("pattern fills", () => {
    it("renders pattern fill on shapes", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addShape("rect", {
        x: 0, y: 0, w: 5, h: 3,
        patternFill: { pattern: "ltDnDiag", fgColor: "FF0000", bgColor: "FFFFFF" },
      });
      const xml = slide._elements[0];
      expect(xml).toContain('<a:pattFill prst="ltDnDiag">');
      expect(xml).toContain("FF0000");
      expect(xml).toContain("FFFFFF");
    });
  });

  describe("gradient text runs", () => {
    it("applies gradient fill to text characters", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText([
        { text: "gradient", options: {
          gradient: {
            type: "linear",
            angle: 0,
            stops: [
              { position: 0, color: "FF0000" },
              { position: 100, color: "0000FF" },
            ],
          },
        } },
      ], { x: 0, y: 0, w: 5, h: 1 });
      const xml = slide._elements[0];
      expect(xml).toContain("<a:gradFill>");
      expect(xml).toContain("FF0000");
      // Should not have solidFill
      expect(xml).not.toContain("<a:solidFill>");
    });
  });

  describe("slide duplication", () => {
    it("clones a slide with its elements", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.background = { color: "FF0000" };
      slide.addText("Hello", { x: 0, y: 0, w: 5, h: 1 });
      const clone = pres.duplicateSlide(0);
      expect(pres._slides).toHaveLength(2);
      expect(clone._bg).toBe("FF0000");
      expect(clone._elements).toHaveLength(1);
      expect(clone._elements[0]).toContain("Hello");
      // Modifying clone should not affect original
      clone.addText("World", { x: 0, y: 1, w: 5, h: 1 });
      expect(slide._elements).toHaveLength(1);
      expect(clone._elements).toHaveLength(2);
    });
  });

  describe("shape text", () => {
    it("adds text inside a shape", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addShape("roundRect", {
        x: 0, y: 0, w: 3, h: 2,
        fill: { color: "FF0000" },
        text: "Inside",
        fontSize: 14,
        color: "FFFFFF",
        align: "center",
      });
      const xml = slide._elements[0];
      expect(xml).toContain("<p:txBody>");
      expect(xml).toContain("Inside");
      expect(xml).toContain("FFFFFF");
    });

    it("supports TextRun[] in shape text", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addShape("rect", {
        x: 0, y: 0, w: 3, h: 2,
        fill: { color: "0000FF" },
        text: [
          { text: "Bold", options: { bold: true } },
          { text: " Normal" },
        ],
      });
      const xml = slide._elements[0];
      expect(xml).toContain('b="1"');
      expect(xml).toContain("Bold");
      expect(xml).toContain("Normal");
    });
  });

  describe("line end types", () => {
    it("adds head and tail ends on text shape lines", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText("Arrow line", {
        x: 0, y: 0, w: 5, h: 1,
        shape: "rect",
        fill: { color: "FFFFFF" },
        line: { color: "000000", headEnd: "arrow", tailEnd: "diamond" },
      });
      const xml = slide._elements[0];
      expect(xml).toContain('<a:headEnd type="arrow"/>');
      expect(xml).toContain('<a:tailEnd type="diamond"/>');
    });

    it("adds line ends on image borders", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      const tinyPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
      slide.addImage({ data: tinyPng, x: 0, y: 0, w: 5, h: 3, line: { color: "FF0000", tailEnd: "stealth" } });
      const xml = slide._elements[0];
      expect(xml).toContain('<a:tailEnd type="stealth"/>');
    });
  });

  describe("table cell gradient fills", () => {
    it("applies gradient to table cell", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addTable([
        [{ text: "Gradient cell", options: {
          gradient: {
            type: "linear",
            angle: 90,
            stops: [
              { position: 0, color: "FF0000" },
              { position: 100, color: "0000FF" },
            ],
          },
        } }],
      ], { x: 0, y: 0, w: 8 });
      const xml = slide._elements[0];
      expect(xml).toContain("<a:gradFill>");
      expect(xml).toContain("FF0000");
    });
  });

  describe("presentation metadata", () => {
    it("stores metadata", () => {
      const pres = new Presentation();
      pres.setMetadata({ title: "My Talk", author: "John", subject: "AI", keywords: "slides,ai" });
      expect(pres._metadata.title).toBe("My Talk");
      expect(pres._metadata.author).toBe("John");
      expect(pres._metadata.subject).toBe("AI");
    });
  });

  describe("slide reordering", () => {
    it("moves a slide to a new position", () => {
      const pres = new Presentation();
      const s1 = pres.addSlide();
      s1.addText("Slide 1", { x: 0, y: 0, w: 5, h: 1 });
      const s2 = pres.addSlide();
      s2.addText("Slide 2", { x: 0, y: 0, w: 5, h: 1 });
      const s3 = pres.addSlide();
      s3.addText("Slide 3", { x: 0, y: 0, w: 5, h: 1 });
      pres.moveSlide(2, 0); // move slide 3 to first position
      expect(pres._slides[0]._elements[0]).toContain("Slide 3");
      expect(pres._slides[1]._elements[0]).toContain("Slide 1");
      expect(pres._slides[2]._elements[0]).toContain("Slide 2");
    });
  });

  describe("slide deletion", () => {
    it("removes a slide", () => {
      const pres = new Presentation();
      pres.addSlide().addText("Keep", { x: 0, y: 0, w: 5, h: 1 });
      pres.addSlide().addText("Remove", { x: 0, y: 0, w: 5, h: 1 });
      pres.addSlide().addText("Keep2", { x: 0, y: 0, w: 5, h: 1 });
      pres.removeSlide(1);
      expect(pres._slides).toHaveLength(2);
      expect(pres._slides[0]._elements[0]).toContain("Keep");
      expect(pres._slides[1]._elements[0]).toContain("Keep2");
    });
  });

  describe("rich text notes", () => {
    it("accepts TextRun[] for notes", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addNotes([
        { text: "Bold note", options: { bold: true } },
        { text: " normal", options: { breakLine: true } },
        { text: "Line 2" },
      ]);
      expect(slide._notes).toHaveLength(3);
      expect(Array.isArray(slide._notes)).toBe(true);
    });
  });

  describe("text paragraph splitting", () => {
    it("splits text runs with bullet into separate paragraphs", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText([
        { text: "First", options: { bullet: { type: "bullet" } } },
        { text: "Second", options: { bullet: { type: "bullet" } } },
      ], { x: 0, y: 0, w: 5, h: 3 });
      const xml = slide._elements[0];
      // Should have two <a:p> elements, one per bullet
      const pCount = (xml.match(/<a:p>/g) || []).length;
      expect(pCount).toBe(2);
    });

    it("keeps non-bullet runs in the same paragraph", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText([
        { text: "Hello " },
        { text: "World" },
      ], { x: 0, y: 0, w: 5, h: 1 });
      const xml = slide._elements[0];
      const pCount = (xml.match(/<a:p>/g) || []).length;
      expect(pCount).toBe(1);
    });

    it("splits on breakLine", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText([
        { text: "Line 1", options: { breakLine: true } },
        { text: "Line 2" },
      ], { x: 0, y: 0, w: 5, h: 2 });
      const xml = slide._elements[0];
      const pCount = (xml.match(/<a:p>/g) || []).length;
      expect(pCount).toBe(2);
    });
  });

  describe("XML escaping", () => {
    it("escapes special characters in text", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText("a < b & c > d", { x: 0, y: 0, w: 5, h: 1 });
      const xml = slide._elements[0];
      expect(xml).toContain("a &lt; b &amp; c &gt; d");
      expect(xml).not.toContain("a < b");
    });
  });

  describe("progress bar component", () => {
    it("adds shapes and labels for each step", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      // Simulate what the progressBar component does: ellipses + rects + text
      // 3 steps, current=1 → step 0 completed, step 1 active, step 2 inactive
      const steps = ["Design", "Build", "Ship"];
      const n = steps.length;
      // Dots: 3 ellipses
      for (let i = 0; i < n; i++) {
        slide.addShape("ellipse", { x: i, y: 0, w: 0.24, h: 0.24, fill: { color: "DA7756" } });
      }
      // Lines: 2 connecting rects
      for (let i = 0; i < n - 1; i++) {
        slide.addShape("rect", { x: i + 0.24, y: 0.1, w: 0.52, h: 0.03, fill: { color: "DA7756" } });
      }
      // Labels: 3 text
      for (const step of steps) {
        slide.addText(step, { x: 0, y: 0.3, w: 1, h: 0.25, fontSize: 9 });
      }
      // 3 ellipses + 2 rects + 3 labels = 8 elements
      expect(slide._elements.length).toBe(8);
      expect(slide._elements[0]).toContain("ellipse");
      expect(slide._elements[5]).toContain("Design");
    });
  });

  describe("text caps", () => {
    it("adds cap=all for all caps", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText([{
        text: "uppercase",
        options: { caps: "all" },
      }], { x: 0, y: 0, w: 5, h: 1 });
      const xml = slide._elements[0].toString();
      expect(xml).toContain('cap="all"');
    });

    it("adds cap=small for small caps", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText([{
        text: "Small Caps",
        options: { caps: "small" },
      }], { x: 0, y: 0, w: 5, h: 1 });
      const xml = slide._elements[0].toString();
      expect(xml).toContain('cap="small"');
    });
  });

  describe("shape 3D bevel", () => {
    it("adds sp3d with bevelT to text shape", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText("Beveled", {
        x: 0, y: 0, w: 5, h: 1,
        shape: "rect",
        fill: { color: "FFFFFF" },
        bevel: { type: "circle", width: 10, height: 8 },
      });
      const xml = slide._elements[0].toString();
      expect(xml).toContain("<a:sp3d>");
      expect(xml).toContain('<a:bevelT');
      expect(xml).toContain('prst="circle"');
    });

    it("adds sp3d to shape", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addShape("rect", {
        x: 0, y: 0, w: 3, h: 2,
        fill: { color: "AAAAAA" },
        bevel: { type: "relaxedInset" },
      });
      const xml = slide._elements[0].toString();
      expect(xml).toContain("<a:sp3d>");
      expect(xml).toContain("relaxedInset");
    });
  });

  describe("soft edge effect", () => {
    it("adds softEdge to effectLst", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText("Soft edges", {
        x: 0, y: 0, w: 5, h: 1,
        shape: "rect",
        fill: { color: "FFFFFF" },
        softEdge: 5,
      });
      const xml = slide._elements[0].toString();
      expect(xml).toContain("<a:softEdge");
    });
  });

  describe("reflection effect", () => {
    it("adds reflection to effectLst", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addShape("rect", {
        x: 0, y: 0, w: 3, h: 2,
        fill: { color: "AAAAAA" },
        reflection: { blurRadius: 5, startOpacity: 0.5, distance: 2 },
      });
      const xml = slide._elements[0].toString();
      expect(xml).toContain("<a:reflection");
      expect(xml).toContain("blurRad=");
    });
  });

  describe("text outline", () => {
    it("adds line element to text run properties", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText([{
        text: "Outlined text",
        options: { color: "FF0000", outline: { color: "000000", width: 2 } },
      }], { x: 0, y: 0, w: 5, h: 1 });
      const xml = slide._elements[0].toString();
      expect(xml).toContain("<a:ln");
      expect(xml).toContain("000000");
    });
  });

  describe("shape glow effect", () => {
    it("adds glow to text shape", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText("Glowing text", {
        x: 0, y: 0, w: 5, h: 1,
        shape: "rect",
        fill: { color: "FFFFFF" },
        glow: { color: "00FF00", radius: 10, opacity: 0.5 },
      });
      const xml = slide._elements[0].toString();
      expect(xml).toContain("<a:glow");
      expect(xml).toContain("00FF00");
    });

    it("adds glow to shape", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addShape("rect", {
        x: 0, y: 0, w: 3, h: 2,
        fill: { color: "AAAAAA" },
        glow: { color: "FF0000", radius: 8 },
      });
      const xml = slide._elements[0].toString();
      expect(xml).toContain("<a:glow");
      expect(xml).toContain("FF0000");
    });

    it("combines shadow and glow", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText("Both effects", {
        x: 0, y: 0, w: 5, h: 1,
        shape: "rect",
        fill: { color: "FFFFFF" },
        shadow: { color: "000000" },
        glow: { color: "0000FF" },
      });
      const xml = slide._elements[0].toString();
      expect(xml).toContain("<a:glow");
      expect(xml).toContain("<a:outerShdw");
      // Both should be in the same effectLst
      const effectLstCount = (xml.match(/<a:effectLst>/g) || []).length;
      expect(effectLstCount).toBe(1);
    });
  });

  describe("paragraph indent and margin", () => {
    it("sets first-line indent on paragraph", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText([{
        text: "Indented first line",
        options: { indent: 0.5 },
      }], { x: 0, y: 0, w: 5, h: 1 });
      const xml = slide._elements[0].toString();
      // 0.5" = 457200 EMU
      expect(xml).toContain('indent="457200"');
    });

    it("sets hanging indent (negative)", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText([{
        text: "Hanging indent",
        options: { indent: -0.25, marginLeft: 0.5 },
      }], { x: 0, y: 0, w: 5, h: 1 });
      const xml = slide._elements[0].toString();
      expect(xml).toContain('indent="-228600"');
      expect(xml).toContain('marL="457200"');
    });
  });

  describe("slide hidden", () => {
    it("adds show=0 to hidden slides", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText("Hidden slide", { x: 0, y: 0, w: 5, h: 1 });
      slide.hidden = true;
      const xml = slide._toXml();
      expect(xml).toContain('show="0"');
    });

    it("does not add show attribute for visible slides", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText("Visible", { x: 0, y: 0, w: 5, h: 1 });
      const xml = slide._toXml();
      expect(xml).not.toContain("show=");
    });
  });

  describe("table cell per-side margin", () => {
    it("applies per-side margins to cell", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addTable([
        [{ text: "Padded", options: { margin: [10, 20, 10, 20] } }],
      ], { x: 0, y: 0, w: 8 });
      const xml = slide._elements[0].toString();
      // 10pt = 127000 EMU, 20pt = 254000 EMU
      expect(xml).toContain('marT="127000"');
      expect(xml).toContain('marR="254000"');
    });
  });

  describe("text fit with minFontScale", () => {
    it("adds fontScale attribute to normAutofit", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText("Long text that might need shrinking", {
        x: 0, y: 0, w: 3, h: 0.5,
        fit: { minFontScale: 50 },
      });
      const xml = slide._elements[0].toString();
      expect(xml).toContain('<a:normAutofit fontScale="50000"/>');
    });

    it("uses plain normAutofit for fit: shrink", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText("Shrink text", {
        x: 0, y: 0, w: 3, h: 0.5,
        fit: "shrink",
      });
      const xml = slide._elements[0].toString();
      expect(xml).toContain("<a:normAutofit/>");
    });
  });

  describe("numbered list startAt", () => {
    it("sets startAt attribute on buAutoNum", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText([{
        text: "Item five",
        options: { bullet: { type: "number", startAt: 5 } },
      }], { x: 0, y: 0, w: 5, h: 1 });
      const xml = slide._elements[0].toString();
      expect(xml).toContain('startAt="5"');
      expect(xml).toContain("arabicPeriod");
    });

    it("omits startAt when value is 1", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText([{
        text: "Item one",
        options: { bullet: { type: "number", startAt: 1 } },
      }], { x: 0, y: 0, w: 5, h: 1 });
      const xml = slide._elements[0].toString();
      expect(xml).not.toContain("startAt");
    });
  });

  describe("table cell vertical text", () => {
    it("adds vert attribute to tcPr", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addTable([
        [{ text: "Vertical", options: { vertical: "vert" } }, { text: "Normal" }],
      ], { x: 0, y: 0, w: 8 });
      const xml = slide._elements[0].toString();
      expect(xml).toContain('vert="vert"');
    });
  });

  describe("internal slide hyperlinks", () => {
    it("adds slide link relationship and action", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText([{
        text: "Go to slide 3",
        options: { color: "0000FF", slideLink: 3 },
      }], { x: 0, y: 0, w: 5, h: 1 });
      const xml = slide._elements[0].toString();
      expect(xml).toContain('action="ppaction://hlinksldjump"');
      // Should register a slide link relationship
      expect(slide._slideLinks.length).toBe(1);
      expect(slide._slideLinks[0].slideIndex).toBe(3);
      // Rels XML should have slide target
      const rels = slide._toRelsXml(false);
      expect(rels).toContain("slide3.xml");
    });
  });

  describe("table auto-column widths", () => {
    it("calculates proportional column widths from content", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addTable([
        [{ text: "Short" }, { text: "This is a much longer cell text" }],
      ], { x: 0, y: 0, w: 10, autoColW: true });
      const xml = slide._elements[0].toString();
      // Should have two gridCol elements with different widths
      const cols = xml.match(/<a:gridCol w="(\d+)"\/>/g);
      expect(cols).toHaveLength(2);
      // Second column should be wider than first
      const w1 = parseInt(cols![0].match(/w="(\d+)"/)?.[1] ?? "0");
      const w2 = parseInt(cols![1].match(/w="(\d+)"/)?.[1] ?? "0");
      expect(w2).toBeGreaterThan(w1);
    });
  });

  describe("inline subscript/superscript in text", () => {
    it("expands ^{text} and _{text} in plain text", () => {
      const runs = expandTextWithMath("H_{2}O is water", { fontSize: 14, fontFace: "Arial", color: "000000" });
      expect(runs).not.toBeNull();
      expect(runs!.length).toBe(3); // "H", subscript "2", "O is water"
      expect(runs![1].options?.subscript).toBe(true);
      expect(runs![1].text).toBe("2");
    });

    it("handles superscript", () => {
      const runs = expandTextWithMath("x^{2} + y^{3}", { fontSize: 14, fontFace: "Arial", color: "000000" });
      expect(runs).not.toBeNull();
      // "x", super "2", " + y", super "3"
      expect(runs![1].options?.superscript).toBe(true);
      expect(runs![1].text).toBe("2");
    });

    it("returns null for plain text without sub/sup", () => {
      const runs = expandTextWithMath("Just plain text", { fontSize: 14, fontFace: "Arial", color: "000000" });
      expect(runs).toBeNull();
    });
  });

  describe("text run opacity", () => {
    it("applies alpha to text color", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText([{
        text: "Faded",
        options: { color: "FF0000", opacity: 0.5 },
      }], { x: 0, y: 0, w: 5, h: 1 });
      const xml = slide._elements[0].toString();
      expect(xml).toContain("FF0000");
      expect(xml).toContain('<a:alpha val="50000"/>');
    });
  });

  describe("slide background pattern fill", () => {
    it("applies pattern fill to slide background", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.background = {
        color: "FFFFFF",
        patternFill: { pattern: "ltDnDiag", fgColor: "CCCCCC", bgColor: "FFFFFF" },
      };
      const xml = slide._toXml();
      expect(xml).toContain("<a:pattFill");
      expect(xml).toContain('prst="ltDnDiag"');
      expect(xml).toContain("CCCCCC");
    });
  });

  describe("text transform / WordArt", () => {
    it("adds prstTxWarp to bodyPr", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText("Arched Text", {
        x: 0, y: 0, w: 5, h: 2,
        textTransform: "textArchUp",
      });
      const xml = slide._elements[0].toString();
      expect(xml).toContain('<a:prstTxWarp prst="textArchUp">');
      expect(xml).toContain("<a:avLst/>");
    });
  });

  describe("watermark", () => {
    it("adds semi-transparent rotated text", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addWatermark("CONFIDENTIAL");
      const xml = slide._elements[0].toString();
      expect(xml).toContain("CONFIDENTIAL");
      // Should have rotation
      expect(xml).toContain("rot=");
      // Should have opacity (alpha)
      expect(xml).toContain("<a:alpha");
    });

    it("accepts custom options", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addWatermark("DRAFT", { color: "FF0000", fontSize: 72, opacity: 0.15, rotate: -45 });
      const xml = slide._elements[0].toString();
      expect(xml).toContain("DRAFT");
      expect(xml).toContain("FF0000");
    });
  });

  describe("shape group nesting", () => {
    it("creates a group with child shapes", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      const grp = slide.addGroup({ x: 1, y: 1, w: 4, h: 3 });
      grp.addShape("rect", { x: 1, y: 1, w: 2, h: 1, fill: { color: "FF0000" } });
      grp.addText("Inside group", { x: 1, y: 2, w: 2, h: 0.5 });
      const xml = slide._elements[0].toString();
      expect(xml).toContain("<p:grpSp>");
      expect(xml).toContain("</p:grpSp>");
      expect(xml).toContain("FF0000");
      expect(xml).toContain("Inside group");
    });

    it("supports nested groups", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      const outer = slide.addGroup({ x: 0, y: 0, w: 8, h: 5 });
      const inner = outer.addGroup({ x: 1, y: 1, w: 3, h: 2 });
      inner.addShape("ellipse", { x: 1.5, y: 1.5, w: 1, h: 1, fill: { color: "00FF00" } });
      const xml = slide._elements[0].toString();
      // Outer group contains inner group
      const grpCount = (xml.match(/<p:grpSp>/g) || []).length;
      expect(grpCount).toBe(2); // outer + inner
      expect(xml).toContain("ellipse");
      expect(xml).toContain("00FF00");
    });

    it("supports images inside groups", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      const grp = slide.addGroup({ x: 0, y: 0, w: 5, h: 3 });
      const tinyPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
      grp.addImage({ data: tinyPng, x: 1, y: 1, w: 2, h: 1 });
      const xml = slide._elements[0].toString();
      expect(xml).toContain("<p:pic>");
      // Image should be registered on the slide's _images
      expect(slide._images.length).toBe(1);
    });
  });

  describe("QR code generation", () => {
    it("produces a base64 PNG data URI", async () => {
      const { renderQRCode } = await import("../src/qrcode.js");
      const data = await renderQRCode("https://example.com");
      expect(data).toMatch(/^data:image\/png;base64,/);
      // Should be a substantial PNG (not empty)
      expect(data.length).toBeGreaterThan(200);
    });

    it("accepts custom colors", async () => {
      const { renderQRCode } = await import("../src/qrcode.js");
      const data = await renderQRCode("test", 256, "FF0000", "00FF00");
      expect(data).toMatch(/^data:image\/png;base64,/);
    });
  });

  describe("writeFile", () => {
    it("produces a valid ZIP buffer", async () => {
      const pres = new Presentation();
      pres.defineLayout({ name: "CUSTOM", width: 10, height: 5.625 });
      const slide = pres.addSlide();
      slide.addText("Hello", { x: 1, y: 1, w: 5, h: 1 });

      const { writeFileSync, readFileSync, unlinkSync } = await import("fs");
      const path = "/tmp/test-ooxml-unit.pptx";
      await pres.writeFile({ fileName: path });

      const buf = readFileSync(path);
      // ZIP files start with PK (0x50, 0x4B)
      expect(buf[0]).toBe(0x50);
      expect(buf[1]).toBe(0x4B);

      // Verify it has expected OOXML structure
      const JSZip = (await import("jszip")).default;
      const zip = await JSZip.loadAsync(buf);
      expect(zip.file("[Content_Types].xml")).not.toBeNull();
      expect(zip.file("ppt/presentation.xml")).not.toBeNull();
      expect(zip.file("ppt/slides/slide1.xml")).not.toBeNull();
      expect(zip.file("ppt/theme/theme1.xml")).not.toBeNull();

      unlinkSync(path);
    });
  });

  describe("Inner shadow effect", () => {
    it("emits <a:innerShdw> on text shape", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText([{ text: "Inner" }], {
        x: 1, y: 1, w: 4, h: 1,
        innerShadow: { color: "FF0000", blur: 5, offset: 2, angle: 135, opacity: 0.5 },
      });
      const xml = slide._toXml(1);
      expect(xml).toContain("<a:innerShdw");
      expect(xml).toContain('val="FF0000"');
      expect(xml).toContain("<a:alpha");
    });

    it("emits <a:innerShdw> on shape", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addShape("rect", {
        x: 1, y: 1, w: 3, h: 2,
        fill: { color: "CCCCCC" },
        innerShadow: { color: "333333", blur: 3 },
      });
      const xml = slide._toXml(1);
      expect(xml).toContain("<a:innerShdw");
      expect(xml).toContain('val="333333"');
    });
  });

  describe("Text columns in shapes", () => {
    it("emits numCol on shape text body", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addShape("rect", {
        x: 0, y: 0, w: 8, h: 4,
        text: "Multi-column text",
        columns: 3,
        columnSpacing: 0.5,
      });
      const xml = slide._toXml(1);
      expect(xml).toContain('numCol="3"');
      expect(xml).toContain("spcCol=");
    });

    it("does not emit numCol when columns is 1", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addShape("rect", {
        x: 0, y: 0, w: 8, h: 4,
        text: "Single column",
        columns: 1,
      });
      const xml = slide._toXml(1);
      expect(xml).not.toContain("numCol");
    });

    it("works with TextRun[] text in shapes", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addShape("rect", {
        x: 0, y: 0, w: 8, h: 4,
        text: [{ text: "Col A" }, { text: "Col B" }],
        columns: 2,
      });
      const xml = slide._toXml(1);
      expect(xml).toContain('numCol="2"');
      expect(xml).toContain("Col A");
      expect(xml).toContain("Col B");
    });
  });

  describe("Image tiling", () => {
    it("emits <a:tile> instead of <a:stretch> when tile is set", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addImage({
        data: "data:image/png;base64,iVBORw0KGgo=",
        x: 0, y: 0, w: 5, h: 5,
        tile: { sx: 50, sy: 50, flip: "xy" },
      });
      const xml = slide._toXml(1);
      expect(xml).toContain("<a:tile");
      expect(xml).toContain('flip="xy"');
      expect(xml).not.toContain("<a:stretch>");
    });

    it("defaults to <a:stretch> when no tile is set", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addImage({
        data: "data:image/png;base64,iVBORw0KGgo=",
        x: 0, y: 0, w: 2, h: 2,
      });
      const xml = slide._toXml(1);
      expect(xml).toContain("<a:stretch>");
      expect(xml).not.toContain("<a:tile");
    });
  });

  describe("Freeform / custom geometry shapes", () => {
    it("emits <a:custGeom> with moveTo and lineTo", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addFreeform({
        x: 1, y: 1, w: 3, h: 3,
        path: [
          { type: "moveTo", x: 0, y: 0 },
          { type: "lineTo", x: 3, y: 0 },
          { type: "lineTo", x: 1.5, y: 3 },
          { type: "close" },
        ],
        fill: { color: "FF0000" },
      });
      const xml = slide._toXml(1);
      expect(xml).toContain("<a:custGeom>");
      expect(xml).toContain("<a:moveTo>");
      expect(xml).toContain("<a:lnTo>");
      expect(xml).toContain("<a:close/>");
      expect(xml).toContain('val="FF0000"');
    });

    it("supports cubicBezTo curves", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addFreeform({
        x: 0, y: 0, w: 4, h: 4,
        path: [
          { type: "moveTo", x: 0, y: 2 },
          { type: "cubicBezTo", x: 4, y: 2, cp: [1, 0, 3, 4] },
        ],
      });
      const xml = slide._toXml(1);
      expect(xml).toContain("<a:cubicBezTo>");
    });

    it("supports arcTo segments", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addFreeform({
        x: 0, y: 0, w: 4, h: 4,
        path: [
          { type: "moveTo", x: 0, y: 2 },
          { type: "arcTo", arc: { wR: 1, hR: 1, stAng: 0, swAng: 180 } },
        ],
      });
      const xml = slide._toXml(1);
      expect(xml).toContain("<a:arcTo");
      expect(xml).toContain("wR=");
    });

    it("works inside a group", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      const grp = slide.addGroup({ x: 0, y: 0, w: 5, h: 5 });
      grp.addFreeform({
        x: 0, y: 0, w: 2, h: 2,
        path: [
          { type: "moveTo", x: 0, y: 0 },
          { type: "lineTo", x: 2, y: 2 },
        ],
      });
      const xml = slide._toXml(1);
      expect(xml).toContain("<a:custGeom>");
    });
  });

  describe("3D extrusion", () => {
    it("emits extrusionH on text shape", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText([{ text: "3D" }], {
        x: 1, y: 1, w: 4, h: 1,
        extrusion: { depth: 10, color: "0000FF" },
      });
      const xml = slide._toXml(1);
      expect(xml).toContain("extrusionH=");
      expect(xml).toContain("<a:extrusionClr>");
      expect(xml).toContain('val="0000FF"');
    });

    it("emits extrusionH on shape", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addShape("rect", {
        x: 1, y: 1, w: 3, h: 2,
        fill: { color: "CCCCCC" },
        extrusion: { depth: 8 },
      });
      const xml = slide._toXml(1);
      expect(xml).toContain("extrusionH=");
      expect(xml).toContain("<a:sp3d");
    });

    it("combines bevel and extrusion", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addShape("rect", {
        x: 0, y: 0, w: 3, h: 2,
        fill: { color: "AABBCC" },
        bevel: { type: "circle", width: 8, height: 8 },
        extrusion: { depth: 12, color: "112233" },
      });
      const xml = slide._toXml(1);
      expect(xml).toContain("<a:sp3d");
      expect(xml).toContain("<a:bevelT");
      expect(xml).toContain("extrusionH=");
      expect(xml).toContain("<a:extrusionClr>");
    });
  });

  describe("Shape preset effects", () => {
    it("glossy preset produces gradient + bevel + shadow", () => {
      const preset = shapePresets.glossy("3366CC");
      expect(preset.gradient).toBeDefined();
      expect(preset.gradient!.stops!.length).toBe(3);
      expect(preset.bevel).toBeDefined();
      expect(preset.shadow).toBeDefined();

      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addShape("roundRect", { x: 1, y: 1, w: 3, h: 2, ...preset } as any);
      const xml = slide._toXml(1);
      expect(xml).toContain("<a:gradFill>");
      expect(xml).toContain("<a:bevelT");
      expect(xml).toContain("<a:outerShdw");
    });

    it("matte preset produces solid fill + shadow", () => {
      const preset = shapePresets.matte("FF6600");
      expect(preset.fill!.color).toBe("FF6600");
      expect(preset.shadow).toBeDefined();
    });

    it("card preset has white fill and rounded corners", () => {
      const preset = shapePresets.card();
      expect(preset.fill!.color).toBe("FFFFFF");
      expect(preset.rectRadius).toBeDefined();
    });

    it("embossed preset has bevel + inner shadow", () => {
      const preset = shapePresets.embossed("999999");
      expect(preset.bevel).toBeDefined();
      expect(preset.innerShadow).toBeDefined();

      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addShape("rect", { x: 0, y: 0, w: 2, h: 2, ...preset } as any);
      const xml = slide._toXml(1);
      expect(xml).toContain("<a:bevelT");
      expect(xml).toContain("<a:innerShdw");
    });

    it("floating preset has large shadow", () => {
      const preset = shapePresets.floating("FFFFFF");
      expect(preset.shadow!.blur).toBe(16);
      expect(preset.rectRadius).toBeDefined();
    });
  });

  describe("Shape hyperlinks", () => {
    it("emits <a:hlinkClick> on shape cNvPr", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addShape("rect", {
        x: 1, y: 1, w: 3, h: 2,
        fill: { color: "3366CC" },
        href: "https://example.com",
      });
      const xml = slide._toXml(1);
      expect(xml).toContain("<a:hlinkClick");
      expect(xml).toContain("rIdHlink");
    });

    it("does not emit hlinkClick when no href", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addShape("rect", {
        x: 1, y: 1, w: 3, h: 2,
        fill: { color: "CCCCCC" },
      });
      const xml = slide._toXml(1);
      expect(xml).not.toContain("hlinkClick");
    });
  });

  describe("Table striping", () => {
    it("applies alternating row fills", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addTable(
        [
          [{ text: "Name" }, { text: "Value" }],
          [{ text: "A" }, { text: "1" }],
          [{ text: "B" }, { text: "2" }],
          [{ text: "C" }, { text: "3" }],
        ],
        { x: 0, y: 0, w: 8, stripe: ["F0F0F0", "FFFFFF"] },
      );
      const xml = slide._toXml(1);
      // Row 1 (data row 0, even) should get F0F0F0
      expect(xml).toContain('val="F0F0F0"');
      // Row 2 (data row 1, odd) should get FFFFFF
      expect(xml).toContain('val="FFFFFF"');
    });

    it("does not stripe the header row", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addTable(
        [
          [{ text: "Header", options: { fill: { color: "333333" } } }],
          [{ text: "Data" }],
        ],
        { x: 0, y: 0, w: 8, stripe: ["EEEEEE", "FFFFFF"] },
      );
      const xml = slide._toXml(1);
      // Header keeps its own fill
      expect(xml).toContain('val="333333"');
    });
  });

  describe("Image filters", () => {
    it("emits <a:grayscl> when grayscale is set", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addImage({
        data: "data:image/png;base64,iVBORw0KGgo=",
        x: 0, y: 0, w: 3, h: 3,
        grayscale: 1,
      });
      const xml = slide._toXml(1);
      expect(xml).toContain("<a:grayscl/>");
    });

    it("emits <a:lum> for brightness/contrast", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addImage({
        data: "data:image/png;base64,iVBORw0KGgo=",
        x: 0, y: 0, w: 3, h: 3,
        brightness: 0.2,
        contrast: -0.1,
      });
      const xml = slide._toXml(1);
      expect(xml).toContain("<a:lum");
      expect(xml).toContain('bright="20000"');
      expect(xml).toContain('contrast="-10000"');
    });

    it("has no effects when filters not set", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addImage({
        data: "data:image/png;base64,iVBORw0KGgo=",
        x: 0, y: 0, w: 2, h: 2,
      });
      const xml = slide._toXml(1);
      expect(xml).not.toContain("<a:grayscl");
      expect(xml).not.toContain("<a:lum");
    });
  });

  describe("Presentation-level defaults", () => {
    it("applies default font/size/color to text runs", () => {
      const pres = new Presentation();
      pres.setDefaults({ fontFace: "Georgia", fontSize: 14, color: "FF0000" });
      const slide = pres.addSlide();
      slide.addText([{ text: "Hello" }]);
      const xml = slide._toXml(1);
      expect(xml).toContain('typeface="Georgia"');
      expect(xml).toContain(`sz="${14 * 100}"`);
      expect(xml).toContain('val="FF0000"');
    });

    it("explicit run opts override defaults", () => {
      const pres = new Presentation();
      pres.setDefaults({ fontFace: "Georgia", fontSize: 14, color: "FF0000" });
      const slide = pres.addSlide();
      slide.addText([{ text: "Custom", options: { fontFace: "Arial", fontSize: 20, color: "0000FF" } }]);
      const xml = slide._toXml(1);
      expect(xml).toContain('typeface="Arial"');
      expect(xml).toContain(`sz="${20 * 100}"`);
      expect(xml).toContain('val="0000FF"');
      expect(xml).not.toContain("Georgia");
    });
  });

  describe("Shape click actions", () => {
    it("emits nextSlide action", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addShape("rect", {
        x: 1, y: 1, w: 2, h: 1,
        fill: { color: "3366CC" },
        action: "nextSlide",
      });
      const xml = slide._toXml(1);
      expect(xml).toContain("ppaction://hlinkshowjump?jump=nextslide");
    });

    it("emits endShow action", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addShape("rect", {
        x: 0, y: 0, w: 1, h: 1,
        fill: { color: "FF0000" },
        action: "endShow",
      });
      const xml = slide._toXml(1);
      expect(xml).toContain("ppaction://hlinkshowjump?jump=endshow");
    });

    it("prefers href over action", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addShape("rect", {
        x: 0, y: 0, w: 1, h: 1,
        fill: { color: "00FF00" },
        href: "https://example.com",
        action: "nextSlide",
      });
      const xml = slide._toXml(1);
      expect(xml).toContain("rIdHlink");
      expect(xml).not.toContain("hlinkshowjump");
    });
  });

  describe("Slide comments", () => {
    it("stores comments on slide", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addComment({ text: "Review this section", author: "Alice", x: 2, y: 3 });
      expect(slide._comments.length).toBe(1);
      expect(slide._comments[0].text).toBe("Review this section");
      expect(slide._comments[0].author).toBe("Alice");
    });

    it("adds comment relationship to slide rels", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addComment({ text: "Fix this" });
      const relsXml = slide._toRelsXml(false);
      expect(relsXml).toContain("comments");
      expect(relsXml).toContain("rIdComments");
    });
  });

  describe("Color theme variables", () => {
    it("defines and resolves named colors", () => {
      const pres = new Presentation();
      pres.defineColor("primary", "3366CC");
      pres.defineColor("accent", "FF6600");
      expect(pres.resolveColor("primary")).toBe("3366CC");
      expect(pres.resolveColor("accent")).toBe("FF6600");
    });

    it("returns hex as-is when not a named color", () => {
      const pres = new Presentation();
      expect(pres.resolveColor("AABBCC")).toBe("AABBCC");
    });
  });

  describe("Gradient text on shapes", () => {
    it("supports gradient on TextRun[] in shapes", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addShape("rect", {
        x: 0, y: 0, w: 4, h: 2,
        fill: { color: "FFFFFF" },
        text: [{
          text: "Gradient Text",
          options: {
            gradient: {
              type: "linear",
              angle: 0,
              stops: [
                { position: 0, color: "FF0000" },
                { position: 100, color: "0000FF" },
              ],
            },
          },
        }],
      });
      const xml = slide._toXml(1);
      expect(xml).toContain("<a:gradFill>");
      expect(xml).toContain("Gradient Text");
    });
  });

  describe("Text auto-size (autoFit)", () => {
    it("emits <a:spAutoFit/> for autoFit: true", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText([{ text: "Auto-size" }], { x: 0, y: 0, w: 4, h: 1, autoFit: true });
      const xml = slide._toXml(1);
      expect(xml).toContain("<a:spAutoFit/>");
    });
  });

  describe("Shape tooltip", () => {
    it("emits <a:hlinkHover> with tooltip text", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addShape("rect", {
        x: 1, y: 1, w: 2, h: 1,
        fill: { color: "3366CC" },
        tooltip: "Click me!",
      });
      const xml = slide._toXml(1);
      expect(xml).toContain("<a:hlinkHover");
      expect(xml).toContain('tooltip="Click me!"');
    });
  });

  describe("Image hyperlink", () => {
    it("emits <a:hlinkClick> on image cNvPr", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addImage({
        data: "data:image/png;base64,iVBORw0KGgo=",
        x: 0, y: 0, w: 3, h: 3,
        href: "https://example.com",
      });
      const xml = slide._toXml(1);
      expect(xml).toContain("<a:hlinkClick");
      expect(xml).toContain("rIdHlink");
    });
  });

  describe("Table cell hyperlinks", () => {
    it("emits <a:hlinkClick> in cell rPr for string text", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addTable(
        [[{ text: "Click here", options: { href: "https://example.com" } }]],
        { x: 0, y: 0, w: 5 },
      );
      const xml = slide._toXml(1);
      expect(xml).toContain("<a:hlinkClick");
    });
  });

  describe("Text kerning", () => {
    it("emits kern attribute on rPr", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText([{ text: "Kerned", options: { kerning: 12 } }], { x: 0, y: 0, w: 4, h: 1 });
      const xml = slide._toXml(1);
      expect(xml).toContain(`kern="${12 * 100}"`);
    });
  });

  describe("Shape line join", () => {
    it("emits <a:round/> for round line join", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addShape("rect", {
        x: 0, y: 0, w: 2, h: 2,
        line: { color: "000000", width: 3, lineJoin: "round" },
      });
      const xml = slide._toXml(1);
      expect(xml).toContain("<a:round/>");
    });

    it("emits <a:bevel/> for bevel line join", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addShape("rect", {
        x: 0, y: 0, w: 2, h: 2,
        line: { color: "000000", lineJoin: "bevel" },
      });
      const xml = slide._toXml(1);
      expect(xml).toContain("<a:bevel/>");
    });
  });

  describe("Shape text wrapping", () => {
    it("emits wrap='none' when set", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addShape("rect", {
        x: 0, y: 0, w: 3, h: 2,
        text: "No wrap",
        wrap: "none",
      });
      const xml = slide._toXml(1);
      expect(xml).toContain('wrap="none"');
    });
  });

  describe("Presentation custom properties", () => {
    it("stores custom properties", () => {
      const pres = new Presentation();
      pres.setCustomProperty("Project", "VibeSlides");
      pres.setCustomProperty("Version", 2);
      pres.setCustomProperty("Draft", true);
      expect(pres._customProps.size).toBe(3);
      expect(pres._customProps.get("Project")).toBe("VibeSlides");
      expect(pres._customProps.get("Version")).toBe(2);
      expect(pres._customProps.get("Draft")).toBe(true);
    });
  });

  describe("Text run hyperlink to slide (combined)", () => {
    it("combines href and slideLink with tooltip", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText([{ text: "Link", options: { href: "See slide 3", slideLink: 2 } }], { x: 1, y: 1, w: 4 });
      const xml = slide._toXml(1);
      expect(xml).toContain("ppaction://hlinksldjump");
      expect(xml).toContain("See slide 3");
    });
  });

  describe("Slide advanceAfter (kiosk timing)", () => {
    it("sets advanceAfter on transition", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.advanceAfter = 5000;
      expect(slide._transition).toBeDefined();
      expect(slide._transition!.advanceAfter).toBe(5000);
    });
  });

  describe("Table cell text rotation", () => {
    it("applies rot attribute on bodyPr for plain text cells", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addTable(
        [["Header"], [{ text: "Rotated", options: { textRotation: 90 } }]],
        { x: 1, y: 1, w: 4 },
      );
      const xml = slide._toXml(1);
      expect(xml).toContain('rot="5400000"'); // 90 * 60000
    });

    it("applies rot attribute for rich text cells", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addTable(
        [["Header"], [{ text: [{ text: "Rich" }], options: { textRotation: 45 } }]],
        { x: 1, y: 1, w: 4 },
      );
      const xml = slide._toXml(1);
      expect(xml).toContain('rot="2700000"'); // 45 * 60000
    });
  });

  describe("Image blur effect", () => {
    const tinyPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    it("adds a:blur element to blip", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addImage({ data: tinyPng, x: 1, y: 1, w: 2, h: 2, blur: 5 });
      const xml = slide._toXml(1);
      expect(xml).toContain("<a:blur");
      expect(xml).toContain('rad="63500"'); // 5 * 12700
    });

    it("does not add blur when not specified", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addImage({ data: tinyPng, x: 1, y: 1, w: 2, h: 2 });
      const xml = slide._toXml(1);
      expect(xml).not.toContain("<a:blur");
    });
  });

  describe("Group shape hyperlinks", () => {
    it("adds hlinkClick to group cNvPr", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      const grp = slide.addGroup({ x: 1, y: 1, w: 4, h: 3 });
      grp.href = "https://example.com";
      grp.addText("Inside", { x: 1, y: 1, w: 2, h: 1 });
      const xml = slide._toXml(1);
      expect(xml).toContain("<p:grpSp>");
      expect(xml).toContain("hlinkClick");
      expect(slide._hyperlinks.some(h => h.url === "https://example.com")).toBe(true);
    });
  });

  describe("Slide section markers", () => {
    it("stores sections on presentation", () => {
      const pres = new Presentation();
      pres.addSection("Introduction");
      pres.addSlide();
      pres.addSlide();
      pres.addSection("Body");
      pres.addSlide();
      expect(pres._sections).toHaveLength(2);
      expect(pres._sections[0].name).toBe("Introduction");
      expect(pres._sections[0].firstSlideIndex).toBe(0);
      expect(pres._sections[1].name).toBe("Body");
      expect(pres._sections[1].firstSlideIndex).toBe(2);
    });
  });

  describe("Multi-level numbered lists (numberType)", () => {
    it("uses alphaLcPeriod numbering", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText([{ text: "Item", options: { bullet: { type: "number", numberType: "alphaLcPeriod" } } }], { x: 0, y: 0, w: 5 });
      const xml = slide._toXml(1);
      expect(xml).toContain('type="alphaLcPeriod"');
    });

    it("defaults to arabicPeriod when numberType not specified", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText([{ text: "Item", options: { bullet: { type: "number" } } }], { x: 0, y: 0, w: 5 });
      const xml = slide._toXml(1);
      expect(xml).toContain('type="arabicPeriod"');
    });
  });

  describe("Shape compound lines", () => {
    it("adds cmpd attribute to line", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addShape("rect", { x: 0, y: 0, w: 3, h: 2, line: { color: "000000", width: 3, compound: "dbl" } });
      const xml = slide._toXml(1);
      expect(xml).toContain('cmpd="dbl"');
    });
  });

  describe("Table cell diagonal borders", () => {
    it("renders lnTlToBr for diagonalDown", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addTable(
        [[{ text: "Cell", options: { diagonalDown: { color: "FF0000", pt: 2 } } }]],
        { x: 0, y: 0, w: 5 },
      );
      const xml = slide._toXml(1);
      expect(xml).toContain("<a:lnTlToBr");
      expect(xml).toContain("FF0000");
    });

    it("renders lnBlToTr for diagonalUp", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addTable(
        [[{ text: "Cell", options: { diagonalUp: { color: "0000FF" } } }]],
        { x: 0, y: 0, w: 5 },
      );
      const xml = slide._toXml(1);
      expect(xml).toContain("<a:lnBlToTr");
      expect(xml).toContain("0000FF");
    });
  });

  describe("Image recolor (duotone)", () => {
    const tinyPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    it("adds duotone element to blip", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addImage({ data: tinyPng, x: 0, y: 0, w: 2, h: 2, recolor: ["000000", "FFFFFF"] });
      const xml = slide._toXml(1);
      expect(xml).toContain("<a:duotone>");
      expect(xml).toContain("000000");
      expect(xml).toContain("FFFFFF");
    });
  });

  describe("Presentation-wide slide transitions", () => {
    it("stores default transition", () => {
      const pres = new Presentation();
      pres.setTransition({ type: "fade", duration: 1.5 });
      expect(pres._defaultTransition).toBeDefined();
      expect(pres._defaultTransition!.type).toBe("fade");
    });
  });

  describe("Shape animation presets", () => {
    it("generates timing XML for appear animation on text", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText("Animated", { x: 1, y: 1, w: 4, animation: { type: "appear" } });
      const xml = slide._toXml(1);
      expect(xml).toContain("<p:timing>");
      expect(xml).toContain("style.visibility");
    });

    it("generates animEffect for fade animation on shape", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addShape("rect", { x: 1, y: 1, w: 3, h: 2, animation: { type: "fade", duration: 1000 } });
      const xml = slide._toXml(1);
      expect(xml).toContain("<p:animEffect");
      expect(xml).toContain('filter="fade"');
    });

    it("generates wipe animation with direction", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addShape("rect", { x: 1, y: 1, w: 3, h: 2, animation: { type: "wipe", direction: "fromLeft" } });
      const xml = slide._toXml(1);
      expect(xml).toContain("wipe(from left)");
    });
  });

  describe("Table header row styling", () => {
    it("applies headerStyle to first row cells", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addTable(
        [["Name", "Value"], ["A", "1"]],
        { x: 0, y: 0, w: 6, headerStyle: { bold: true, color: "FFFFFF", fill: { color: "333333" } } },
      );
      const xml = slide._toXml(1);
      // Header row should have fill and white text
      expect(xml).toContain("333333");
      expect(xml).toContain("FFFFFF");
    });
  });

  describe("Shape preset shadows", () => {
    it("subtle shadow has low opacity", () => {
      const shadow = shapePresets.shadows.subtle();
      expect(shadow.opacity).toBeLessThan(0.1);
      expect(shadow.blur).toBeLessThan(5);
    });

    it("dramatic shadow has high opacity and blur", () => {
      const shadow = shapePresets.shadows.dramatic();
      expect(shadow.opacity).toBeGreaterThanOrEqual(0.25);
      expect(shadow.blur).toBeGreaterThanOrEqual(15);
    });

    it("all shadow presets return valid ShadowOpts", () => {
      for (const name of ["subtle", "soft", "medium", "dramatic", "contact"] as const) {
        const s = shapePresets.shadows[name]();
        expect(s.color).toBeDefined();
        expect(s.blur).toBeDefined();
        expect(s.offset).toBeDefined();
      }
    });
  });

  describe("Image animation", () => {
    const tinyPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    it("generates timing XML for image with fade animation", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addImage({ data: tinyPng, x: 1, y: 1, w: 3, h: 2, animation: { type: "fade" } });
      const xml = slide._toXml(1);
      expect(xml).toContain("<p:timing>");
      expect(xml).toContain("<p:animEffect");
    });
  });

  describe("Text box tooltip", () => {
    it("adds hlinkHover to text shape cNvPr", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addText("Hover me", { x: 1, y: 1, w: 4, tooltip: "More info" });
      const xml = slide._toXml(1);
      expect(xml).toContain("hlinkHover");
      expect(xml).toContain("More info");
    });
  });

  describe("Image tooltip", () => {
    const tinyPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    it("adds hlinkHover to image cNvPr", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addImage({ data: tinyPng, x: 1, y: 1, w: 2, h: 2, tooltip: "Image info" });
      const xml = slide._toXml(1);
      expect(xml).toContain("hlinkHover");
      expect(xml).toContain("Image info");
    });
  });

  describe("Freeform animation", () => {
    it("generates timing for animated freeform", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addFreeform({
        x: 0, y: 0, w: 2, h: 2,
        path: [
          { type: "moveTo", x: 0, y: 0 },
          { type: "lineTo", x: 2, y: 0 },
          { type: "lineTo", x: 2, y: 2 },
          { type: "close" },
        ],
        animation: { type: "fade" },
      });
      const xml = slide._toXml(1);
      expect(xml).toContain("<p:timing>");
      expect(xml).toContain("<p:animEffect");
    });
  });

  describe("Shape text auto-fit", () => {
    it("adds spAutoFit to shape bodyPr", () => {
      const pres = new Presentation();
      const slide = pres.addSlide();
      slide.addShape("rect", {
        x: 1, y: 1, w: 3, h: 2,
        fill: { color: "EEEEEE" },
        text: "Auto-fitting text",
        autoFit: true,
      });
      const xml = slide._toXml(1);
      expect(xml).toContain("<a:spAutoFit/>");
    });
  });
});
