/**
 * Unit tests for glissando core modules.
 *
 * Run: npx vitest run
 */

import { describe, it, expect } from "vitest";
import { columns, rows, below, inset, contentArea, contentAreaBelow } from "../src/layout.js";
import { parseInlineMath, isComplexMath, mathToTextRuns } from "../src/inline-math.js";
import { Presentation, Slide } from "../src/ooxml/index.js";
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
});
