/**
 * PPTX ZIP assembler — packages Presentation into a valid .pptx file.
 *
 * A .pptx is a ZIP archive following the Office Open XML (OOXML) standard.
 * This module generates all required boilerplate XML and assembles the final ZIP.
 */

import JSZip from "jszip";
import { randomUUID } from "crypto";
import type { Presentation, TextRun } from "./index.js";

// ─── EMU helpers (duplicated to avoid circular import) ─────────────

const EMU = 914400;
function emu(inches: number): number { return Math.round(inches * EMU); }

// ─── Public entry point ────────────────────────────────────────────

export async function assemblePptx(pres: Presentation): Promise<Buffer> {
  const zip = new JSZip();
  const slides = pres._slides;
  const hasAnyNotes = slides.some((s) => s._notes != null);

  // Collect all media files across all slides
  const mediaFiles: Array<{ fileName: string; data: Buffer; contentType: string }> = [];
  for (const slide of slides) {
    for (const img of slide._images) {
      mediaFiles.push({ fileName: img.fileName, data: img.data, contentType: img.contentType });
    }
  }

  // ── [Content_Types].xml ──────────────────────────────────────────
  const hasCustomProps = pres._customProps.size > 0;
  zip.file("[Content_Types].xml", contentTypesXml(slides, mediaFiles, hasAnyNotes, hasCustomProps));

  // ── _rels/.rels ──────────────────────────────────────────────────
  zip.file("_rels/.rels", rootRelsXml(hasCustomProps));

  // ── docProps ─────────────────────────────────────────────────────
  zip.file("docProps/core.xml", coreXml(pres._metadata));
  zip.file("docProps/app.xml", appXml(slides.length));
  if (pres._customProps.size > 0) {
    zip.file("docProps/custom.xml", customPropsXml(pres._customProps));
  }

  // ── ppt/presentation.xml ─────────────────────────────────────────
  zip.file("ppt/presentation.xml", presentationXml(pres));
  zip.file("ppt/_rels/presentation.xml.rels", presentationRelsXml(slides, hasAnyNotes));

  // ── ppt/theme/theme1.xml ─────────────────────────────────────────
  zip.file("ppt/theme/theme1.xml", themeXml(pres._headFont, pres._bodyFont));

  // ── ppt/slideMasters ─────────────────────────────────────────────
  zip.file("ppt/slideMasters/slideMaster1.xml", slideMasterXml());
  zip.file("ppt/slideMasters/_rels/slideMaster1.xml.rels", slideMasterRelsXml());

  // ── ppt/slideLayouts ─────────────────────────────────────────────
  zip.file("ppt/slideLayouts/slideLayout1.xml", slideLayoutXml());
  zip.file("ppt/slideLayouts/_rels/slideLayout1.xml.rels", slideLayoutRelsXml());

  // ── ppt/notesMasters (only if any slide has notes) ───────────────
  if (hasAnyNotes) {
    zip.file("ppt/notesMasters/notesMaster1.xml", notesMasterXml());
    zip.file("ppt/notesMasters/_rels/notesMaster1.xml.rels", notesMasterRelsXml());
  }

  // ── Slides ───────────────────────────────────────────────────────
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const n = i + 1;
    const hasNotes = slide._notes != null;

    zip.file(`ppt/slides/slide${n}.xml`, slide._toXml());
    zip.file(`ppt/slides/_rels/slide${n}.xml.rels`, slide._toRelsXml(hasNotes));

    // Media files for this slide
    for (const img of slide._images) {
      zip.file(`ppt/media/${img.fileName}`, img.data);
    }

    // Notes slide
    if (hasNotes) {
      zip.file(`ppt/notesSlides/notesSlide${n}.xml`, notesSlideXml(slide._notes!, n));
      zip.file(`ppt/notesSlides/_rels/notesSlide${n}.xml.rels`, notesSlideRelsXml(n));
    }

    // Comments
    if (slide._comments.length > 0) {
      zip.file(`ppt/comments/comment${n}.xml`, commentXml(slide._comments));
    }
  }

  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }) as Promise<Buffer>;
}

// ═══════════════════════════════════════════════════════════════════
// BOILERPLATE XML TEMPLATES
// ═══════════════════════════════════════════════════════════════════

function xmlDecl(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`;
}

// ─── [Content_Types].xml ───────────────────────────────────────────

function contentTypesXml(
  slides: Presentation["_slides"],
  mediaFiles: Array<{ contentType: string }>,
  hasAnyNotes: boolean,
  hasCustomProps = false,
): string {
  const overrides: string[] = [
    `<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>`,
    `<Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>`,
    `<Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>`,
    `<Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>`,
    `<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>`,
    `<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>`,
  ];

  for (let i = 0; i < slides.length; i++) {
    overrides.push(
      `<Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`,
    );
  }

  if (hasAnyNotes) {
    overrides.push(
      `<Override PartName="/ppt/notesMasters/notesMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.notesMaster+xml"/>`,
    );
    for (let i = 0; i < slides.length; i++) {
      if (slides[i]._notes != null) {
        overrides.push(
          `<Override PartName="/ppt/notesSlides/notesSlide${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.notesSlide+xml"/>`,
        );
      }
    }
  }

  // Comments
  for (let i = 0; i < slides.length; i++) {
    if (slides[i]._comments.length > 0) {
      overrides.push(
        `<Override PartName="/ppt/comments/comment${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.comments+xml"/>`,
      );
    }
  }

  if (hasCustomProps) {
    overrides.push(
      `<Override PartName="/docProps/custom.xml" ContentType="application/vnd.openxmlformats-officedocument.custom-properties+xml"/>`,
    );
  }

  // Collect unique media content types
  const mediaTypes = new Set<string>();
  for (const m of mediaFiles) mediaTypes.add(m.contentType);

  const defaults: string[] = [
    `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>`,
    `<Default Extension="xml" ContentType="application/xml"/>`,
  ];
  if (mediaTypes.has("image/png")) defaults.push(`<Default Extension="png" ContentType="image/png"/>`);
  if (mediaTypes.has("image/jpeg")) defaults.push(`<Default Extension="jpg" ContentType="image/jpeg"/>`);

  return (
    xmlDecl() +
    `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
    defaults.join("") +
    overrides.join("") +
    `</Types>`
  );
}

// ─── _rels/.rels ───────────────────────────────────────────────────

function rootRelsXml(hasCustomProps = false): string {
  return (
    xmlDecl() +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>` +
    `<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>` +
    `<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>` +
    (hasCustomProps ? `<Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/custom-properties" Target="docProps/custom.xml"/>` : "") +
    `</Relationships>`
  );
}

// ─── docProps ──────────────────────────────────────────────────────

function coreXml(meta: { title?: string; author?: string; subject?: string; keywords?: string }): string {
  const now = new Date().toISOString();
  return (
    xmlDecl() +
    `<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"` +
    ` xmlns:dc="http://purl.org/dc/elements/1.1/"` +
    ` xmlns:dcterms="http://purl.org/dc/terms/"` +
    ` xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">` +
    `<dc:title>${escXml(meta.title ?? "Presentation")}</dc:title>` +
    `<dc:creator>${escXml(meta.author ?? "VibeSlides")}</dc:creator>` +
    (meta.subject ? `<dc:subject>${escXml(meta.subject)}</dc:subject>` : "") +
    (meta.keywords ? `<cp:keywords>${escXml(meta.keywords)}</cp:keywords>` : "") +
    `<dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created>` +
    `<dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified>` +
    `</cp:coreProperties>`
  );
}

function appXml(slideCount: number): string {
  return (
    xmlDecl() +
    `<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">` +
    `<Application>VibeSlides</Application>` +
    `<Slides>${slideCount}</Slides>` +
    `<ScaleCrop>false</ScaleCrop>` +
    `<LinksUpToDate>false</LinksUpToDate>` +
    `<SharedDoc>false</SharedDoc>` +
    `<HyperlinksChanged>false</HyperlinksChanged>` +
    `</Properties>`
  );
}

// ─── ppt/presentation.xml ──────────────────────────────────────────

function presentationXml(pres: Presentation): string {
  const cx = emu(pres._width);
  const cy = emu(pres._height);

  const slideIds = pres._slides.map((_, i) => {
    const id = 256 + i;
    return `<p:sldId id="${id}" r:id="rIdSlide${i + 1}"/>`;
  }).join("");

  return (
    xmlDecl() +
    `<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"` +
    ` xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"` +
    ` xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"` +
    ` saveSubsetFonts="1">` +
    `<p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rIdMaster"/></p:sldMasterIdLst>` +
    `<p:sldIdLst>${slideIds}</p:sldIdLst>` +
    `<p:sldSz cx="${cx}" cy="${cy}"/>` +
    `<p:notesSz cx="${cy}" cy="${cx}"/>` +
    (pres._sections.length > 0
      ? `<p:extLst><p:ext uri="{521415D9-36F7-43E2-AB2F-B90AF26B5E84}">` +
        `<p14:sectionLst xmlns:p14="http://schemas.microsoft.com/office/powerpoint/2010/main">` +
        pres._sections.map((sec, si) => {
          const nextStart = si + 1 < pres._sections.length ? pres._sections[si + 1].firstSlideIndex : pres._slides.length;
          const sldIds = [];
          for (let j = sec.firstSlideIndex; j < nextStart; j++) {
            sldIds.push(`<p14:sldId id="${256 + j}"/>`);
          }
          return `<p14:section name="${escXml(sec.name)}" id="{${randomUUID()}}"><p14:sldIdLst>${sldIds.join("")}</p14:sldIdLst></p14:section>`;
        }).join("") +
        `</p14:sectionLst></p:ext></p:extLst>`
      : "") +
    `</p:presentation>`
  );
}

function presentationRelsXml(
  slides: Presentation["_slides"],
  hasAnyNotes: boolean,
): string {
  const rels: string[] = [
    `<Relationship Id="rIdMaster" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>`,
    `<Relationship Id="rIdTheme" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/>`,
  ];

  for (let i = 0; i < slides.length; i++) {
    rels.push(
      `<Relationship Id="rIdSlide${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i + 1}.xml"/>`,
    );
  }

  if (hasAnyNotes) {
    rels.push(
      `<Relationship Id="rIdNotesMaster" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesMaster" Target="notesMasters/notesMaster1.xml"/>`,
    );
  }

  return (
    xmlDecl() +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    rels.join("") +
    `</Relationships>`
  );
}

// ─── ppt/theme/theme1.xml ──────────────────────────────────────────

function escXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function themeXml(headFont: string, bodyFont: string): string {
  return (
    xmlDecl() +
    `<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="VibeSlides">` +
    `<a:themeElements>` +
    // Color scheme (neutral defaults — actual colors are set per-shape)
    `<a:clrScheme name="Custom">` +
    `<a:dk1><a:srgbClr val="000000"/></a:dk1>` +
    `<a:lt1><a:srgbClr val="FFFFFF"/></a:lt1>` +
    `<a:dk2><a:srgbClr val="333333"/></a:dk2>` +
    `<a:lt2><a:srgbClr val="F5F5F5"/></a:lt2>` +
    `<a:accent1><a:srgbClr val="DA7756"/></a:accent1>` +
    `<a:accent2><a:srgbClr val="4A90D9"/></a:accent2>` +
    `<a:accent3><a:srgbClr val="6B8E23"/></a:accent3>` +
    `<a:accent4><a:srgbClr val="8B5CF6"/></a:accent4>` +
    `<a:accent5><a:srgbClr val="E5A853"/></a:accent5>` +
    `<a:accent6><a:srgbClr val="2DD4BF"/></a:accent6>` +
    `<a:hlink><a:srgbClr val="4A90D9"/></a:hlink>` +
    `<a:folHlink><a:srgbClr val="8B5CF6"/></a:folHlink>` +
    `</a:clrScheme>` +
    // Font scheme — uses the theme's heading/body fonts
    `<a:fontScheme name="Custom">` +
    `<a:majorFont>` +
    `<a:latin typeface="${escXml(headFont)}"/>` +
    `<a:ea typeface=""/>` +
    `<a:cs typeface=""/>` +
    `</a:majorFont>` +
    `<a:minorFont>` +
    `<a:latin typeface="${escXml(bodyFont)}"/>` +
    `<a:ea typeface=""/>` +
    `<a:cs typeface=""/>` +
    `</a:minorFont>` +
    `</a:fontScheme>` +
    // Format scheme (minimal)
    `<a:fmtScheme name="Custom">` +
    `<a:fillStyleLst>` +
    `<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>` +
    `<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>` +
    `<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>` +
    `</a:fillStyleLst>` +
    `<a:lnStyleLst>` +
    `<a:ln w="9525"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln>` +
    `<a:ln w="9525"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln>` +
    `<a:ln w="9525"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln>` +
    `</a:lnStyleLst>` +
    `<a:effectStyleLst>` +
    `<a:effectStyle><a:effectLst/></a:effectStyle>` +
    `<a:effectStyle><a:effectLst/></a:effectStyle>` +
    `<a:effectStyle><a:effectLst/></a:effectStyle>` +
    `</a:effectStyleLst>` +
    `<a:bgFillStyleLst>` +
    `<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>` +
    `<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>` +
    `<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>` +
    `</a:bgFillStyleLst>` +
    `</a:fmtScheme>` +
    `</a:themeElements>` +
    `<a:objectDefaults/>` +
    `<a:extraClrSchemeLst/>` +
    `</a:theme>`
  );
}

// ─── ppt/slideMasters ──────────────────────────────────────────────

function slideMasterXml(): string {
  return (
    xmlDecl() +
    `<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"` +
    ` xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"` +
    ` xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">` +
    `<p:cSld>` +
    `<p:bg><p:bgPr><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:effectLst/></p:bgPr></p:bg>` +
    `<p:spTree>` +
    `<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>` +
    `<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>` +
    `</p:spTree>` +
    `</p:cSld>` +
    `<p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>` +
    `<p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rIdLayout"/></p:sldLayoutIdLst>` +
    `</p:sldMaster>`
  );
}

function slideMasterRelsXml(): string {
  return (
    xmlDecl() +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rIdLayout" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>` +
    `<Relationship Id="rIdTheme" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>` +
    `</Relationships>`
  );
}

// ─── ppt/slideLayouts ──────────────────────────────────────────────

function slideLayoutXml(): string {
  return (
    xmlDecl() +
    `<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"` +
    ` xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"` +
    ` xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank">` +
    `<p:cSld name="Blank">` +
    `<p:spTree>` +
    `<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>` +
    `<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>` +
    `</p:spTree>` +
    `</p:cSld>` +
    `<p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>` +
    `</p:sldLayout>`
  );
}

function slideLayoutRelsXml(): string {
  return (
    xmlDecl() +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rIdMaster" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>` +
    `</Relationships>`
  );
}

// ─── ppt/notesMasters ──────────────────────────────────────────────

function notesMasterXml(): string {
  return (
    xmlDecl() +
    `<p:notesMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"` +
    ` xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"` +
    ` xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">` +
    `<p:cSld>` +
    `<p:spTree>` +
    `<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>` +
    `<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>` +
    `</p:spTree>` +
    `</p:cSld>` +
    `<p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>` +
    `</p:notesMaster>`
  );
}

function notesMasterRelsXml(): string {
  return (
    xmlDecl() +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rIdTheme" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>` +
    `</Relationships>`
  );
}

// ─── ppt/notesSlides ───────────────────────────────────────────────

function notesSlideXml(notes: string | TextRun[], slideNum: number): string {
  let notesBodyXml: string;
  if (typeof notes === "string") {
    notesBodyXml = `<a:p><a:r><a:rPr lang="en-US" dirty="0"/><a:t>${escXml(notes)}</a:t></a:r></a:p>`;
  } else {
    // Rich text notes: split on breakLine into paragraphs
    const paragraphs: TextRun[][] = [[]];
    for (const run of notes) {
      paragraphs[paragraphs.length - 1].push(run);
      if (run.options?.breakLine) paragraphs.push([]);
    }
    if (paragraphs[paragraphs.length - 1].length === 0) paragraphs.pop();
    notesBodyXml = paragraphs.map((para) => {
      const runsXml = para.map((run) => {
        const attrs = ['lang="en-US"', 'dirty="0"'];
        const ro = run.options ?? {};
        if (ro.bold) attrs.push('b="1"');
        if (ro.italic) attrs.push('i="1"');
        if (ro.underline) attrs.push('u="sng"');
        if (ro.fontSize) attrs.push(`sz="${Math.round(ro.fontSize * 100)}"`);
        return `<a:r><a:rPr ${attrs.join(" ")}/><a:t>${escXml(run.text)}</a:t></a:r>`;
      }).join("");
      return `<a:p>${runsXml}</a:p>`;
    }).join("");
  }

  return (
    xmlDecl() +
    `<p:notes xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"` +
    ` xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"` +
    ` xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">` +
    `<p:cSld>` +
    `<p:spTree>` +
    `<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>` +
    `<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>` +
    // Slide image placeholder
    `<p:sp>` +
    `<p:nvSpPr><p:cNvPr id="2" name="Slide Image"/><p:cNvSpPr><a:spLocks noGrp="1" noRot="1" noChangeAspect="1"/></p:cNvSpPr>` +
    `<p:nvPr><p:ph type="sldImg"/></p:nvPr></p:nvSpPr>` +
    `<p:spPr/>` +
    `</p:sp>` +
    // Notes text box
    `<p:sp>` +
    `<p:nvSpPr><p:cNvPr id="3" name="Notes"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr>` +
    `<p:nvPr><p:ph type="body" idx="1"/></p:nvPr></p:nvSpPr>` +
    `<p:spPr/>` +
    `<p:txBody>` +
    `<a:bodyPr/>` +
    `<a:lstStyle/>` +
    notesBodyXml +
    `</p:txBody>` +
    `</p:sp>` +
    `</p:spTree>` +
    `</p:cSld>` +
    `<p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>` +
    `</p:notes>`
  );
}

// ─── Comments XML ─────────────────────────────────────────────────

function commentXml(comments: Array<{ text: string; author: string; x?: number; y?: number }>): string {
  const now = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const cmXmls = comments.map((c, i) => {
    const posX = emu(c.x ?? 0);
    const posY = emu(c.y ?? 0);
    return (
      `<p:cm authorId="0" dt="${now}" idx="${i + 1}">` +
      `<p:pos x="${posX}" y="${posY}"/>` +
      `<p:text>${escXml(c.text)}</p:text>` +
      `</p:cm>`
    );
  }).join("");

  return (
    xmlDecl() +
    `<p:cmLst xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">` +
    cmXmls +
    `</p:cmLst>`
  );
}

function notesSlideRelsXml(slideNum: number): string {
  return (
    xmlDecl() +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rIdSlide" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="../slides/slide${slideNum}.xml"/>` +
    `<Relationship Id="rIdNotesMaster" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesMaster" Target="../notesMasters/notesMaster1.xml"/>` +
    `</Relationships>`
  );
}

// ─── Custom Properties ────────────────────────────────────────────

function customPropsXml(props: Map<string, string | number | boolean>): string {
  let pid = 2; // custom properties start at pid=2
  const entries: string[] = [];
  for (const [name, value] of props) {
    let valXml: string;
    if (typeof value === "boolean") {
      valXml = `<vt:bool>${value}</vt:bool>`;
    } else if (typeof value === "number") {
      valXml = Number.isInteger(value) ? `<vt:i4>${value}</vt:i4>` : `<vt:r8>${value}</vt:r8>`;
    } else {
      valXml = `<vt:lpwstr>${escXml(String(value))}</vt:lpwstr>`;
    }
    entries.push(
      `<property fmtid="{D5CDD505-2E9C-101B-9397-08002B2CF9AE}" pid="${pid}" name="${escXml(name)}">${valXml}</property>`,
    );
    pid++;
  }
  return (
    xmlDecl() +
    `<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/custom-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">` +
    entries.join("") +
    `</Properties>`
  );
}
