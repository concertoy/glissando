/**
 * PPTX post-processing — font patching, connector injection, code block grouping.
 *
 * Operates on an already-written .pptx file: loads via JSZip → modifies XML
 * entries in memory → writes back. No shell commands or temp directories.
 * Isolated from the Deck API so agents reading index.ts see only the public surface.
 */

import { readFileSync, writeFileSync } from "fs";
import JSZip from "jszip";
import type { ConnectorDef, EmojiDef, FooterDef, ThemeSpacing } from "./types.js";

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

export interface PatchOptions {
  fonts: { heading: string; sans: string };
  spacing?: ThemeSpacing;
  footerFont?: string;
  footerSize?: number;     // pt
  footerColor?: string;    // hex WITHOUT #
  connectorDefs: ConnectorDef[];
  emojiDefs?: EmojiDef[];
  footerDefs?: FooterDef[];
}

/**
 * Post-process a .pptx file in-place:
 *   1. Replace pptxgenjs theme/master fonts with the theme's fonts
 *   2. Inject native OOXML connectors (<p:cxnSp> + bezier arcs)
 *   3. Group code block shapes into <p:grpSp>
 */
export async function patchPptx(pptxPath: string, opts: PatchOptions): Promise<void> {
  const { heading, sans } = opts.fonts;

  const buf = readFileSync(pptxPath);
  const zip = await JSZip.loadAsync(buf);

  // Helper: read a zip entry as UTF-8 string
  async function readEntry(path: string): Promise<string> {
    const entry = zip.file(path);
    if (!entry) throw new Error(`Missing PPTX entry: ${path}`);
    return entry.async("string");
  }

  // --- Patch theme fonts ---
  let themeXml = await readEntry("ppt/theme/theme1.xml");
  themeXml = themeXml.replace(
    /(<a:majorFont>)([\s\S]*?)(<\/a:majorFont>)/,
    `$1<a:latin typeface="${heading}"/><a:ea typeface=""/><a:cs typeface=""/>$3`
  );
  themeXml = themeXml.replace(
    /(<a:minorFont>)([\s\S]*?)(<\/a:minorFont>)/,
    `$1<a:latin typeface="${sans}"/><a:ea typeface=""/><a:cs typeface=""/>$3`
  );
  zip.file("ppt/theme/theme1.xml", themeXml);

  // --- Patch slide master ---
  let masterXml = await readEntry("ppt/slideMasters/slideMaster1.xml");
  masterXml = masterXml.replace(/typeface="Arial"/g, `typeface="${sans}"`);
  zip.file("ppt/slideMasters/slideMaster1.xml", masterXml);

  // --- Inject OOXML connectors ---
  if (opts.connectorDefs.length > 0) {
    await injectConnectors(zip, opts.connectorDefs, sans);
  }

  // --- Group code block shapes (bg + label + rule + code → <p:grpSp>) ---
  await groupCodeBlocks(zip);

  // --- Group callout block shapes (bg + icon → <p:grpSp>) ---
  await groupCalloutBlocks(zip);

  // --- Patch emoji bullets (<a:buChar> → <a:buBlip>) ---
  if (opts.emojiDefs && opts.emojiDefs.length > 0) {
    await patchEmojiBullets(zip, opts.emojiDefs);
  }

  // --- Inject footer text / slide numbers / citations ---
  if (opts.footerDefs && opts.footerDefs.length > 0 && opts.spacing) {
    await injectFooters(zip, opts.footerDefs, {
      spacing: opts.spacing,
      font: opts.footerFont ?? "Inter",
      size: opts.footerSize ?? 12,
      color: opts.footerColor ?? "999999",
    });
  }

  // Write back
  const out = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  writeFileSync(pptxPath, out);
}

// ---------------------------------------------------------------------------
// Connector injection
// ---------------------------------------------------------------------------

/**
 * Inject native <p:cxnSp> connectors into slide XML.
 * Connectors reference shape IDs via objectName lookup,
 * so they move with shapes when dragged in Keynote/PowerPoint.
 */
async function injectConnectors(
  zip: JSZip,
  connectorDefs: ConnectorDef[],
  sansFont: string,
): Promise<void> {
  // Group connectors by slide
  const bySlide = new Map<number, ConnectorDef[]>();
  for (const conn of connectorDefs) {
    const list = bySlide.get(conn.slideIndex) ?? [];
    list.push(conn);
    bySlide.set(conn.slideIndex, list);
  }

  const EMU = 914400; // 1 inch = 914400 EMUs

  for (const [slideIdx, connectors] of bySlide) {
    const slidePath = `ppt/slides/slide${slideIdx}.xml`;
    const entry = zip.file(slidePath);
    if (!entry) continue;
    let xml = await entry.async("string");

    // Build a map of objectName → shape ID
    const nameToId = new Map<string, number>();
    const nameRegex = /<p:cNvPr id="(\d+)" name="([^"]*)"/g;
    let m;
    while ((m = nameRegex.exec(xml)) !== null) {
      nameToId.set(m[2], parseInt(m[1]));
    }

    // Find max existing ID for generating new unique IDs
    let maxId = 0;
    const idRegex = /id="(\d+)"/g;
    while ((m = idRegex.exec(xml)) !== null) {
      maxId = Math.max(maxId, parseInt(m[1]));
    }

    // Generate connector + label XML
    const injectedXmls: string[] = [];

    for (const conn of connectors) {
      maxId++;
      const fromId = nameToId.get(conn.from._shapeName);
      const toId = nameToId.get(conn.to._shapeName);
      if (!fromId || !toId) continue;

      const fromX = conn.from.x * EMU;
      const fromY = conn.from.y * EMU;
      const toX = conn.to.x * EMU;
      const toY = conn.to.y * EMU;

      const x = Math.min(fromX, toX);
      const y = Math.min(fromY, toY);
      const cx = Math.abs(toX - fromX);
      const cy = Math.abs(toY - fromY);

      const flipH = toX < fromX ? ' flipH="1"' : "";
      const flipV = toY < fromY ? ' flipV="1"' : "";

      const headMap: Record<string, string> = {
        arrow: "triangle", stealth: "stealth", triangle: "triangle", none: "none",
      };
      const headType = headMap[conn.head] ?? "triangle";
      const tailType = headMap[conn.tail] ?? "none";

      const lineW = Math.round(conn.width * 12700);

      if (conn.type === "curved") {
        injectedXmls.push(
          buildCurvedArc(conn, fromX, fromY, toX, toY, maxId, lineW, headType, EMU)
        );
      } else {
        injectedXmls.push(
          buildNativeConnector(
            conn, fromId, toId, x, y, cx, cy, flipH, flipV,
            maxId, lineW, headType, tailType,
          )
        );
      }

      // Connector label — text box near the midpoint/outer edge
      if (conn.label) {
        maxId++;
        injectedXmls.push(
          buildConnectorLabel(conn, fromX, fromY, toX, toY, maxId, sansFont, EMU)
        );
      }
    }

    // Inject before </p:spTree>
    if (injectedXmls.length > 0) {
      xml = xml.replace("</p:spTree>", injectedXmls.join("") + "</p:spTree>");
      zip.file(slidePath, xml);
    }
  }
}

// ---------------------------------------------------------------------------
// Connector XML builders
// ---------------------------------------------------------------------------

/** Curved arc via custom bezier geometry (<a:custGeom>). */
function buildCurvedArc(
  conn: ConnectorDef,
  fromX: number, fromY: number, toX: number, toY: number,
  id: number, lineW: number, headType: string, EMU: number,
): string {
  const arcBow = 0.7 * EMU;

  const attachX = Math.max(fromX, toX);
  const arcOffX = Math.round(attachX);
  const arcOffY = Math.round(Math.min(fromY, toY));
  const arcCx = Math.round(arcBow);
  const arcCy = Math.round(Math.abs(toY - fromY));

  const cpBow = Math.round(arcBow);
  const cp1y = Math.round(arcCy * 0.75);
  const cp2y = Math.round(arcCy * 0.25);

  const goingUp = fromY > toY;
  const pathStartY = goingUp ? arcCy : 0;
  const pathEndY = goingUp ? 0 : arcCy;
  const cpA_y = goingUp ? cp1y : cp2y;
  const cpB_y = goingUp ? cp2y : cp1y;

  return (
    `<p:sp>` +
    `<p:nvSpPr>` +
    `<p:cNvPr id="${id}" name="Arc ${id}"/>` +
    `<p:cNvSpPr/>` +
    `<p:nvPr/>` +
    `</p:nvSpPr>` +
    `<p:spPr>` +
    `<a:xfrm>` +
    `<a:off x="${arcOffX}" y="${arcOffY}"/>` +
    `<a:ext cx="${arcCx}" cy="${arcCy}"/>` +
    `</a:xfrm>` +
    `<a:custGeom>` +
    `<a:avLst/>` +
    `<a:gdLst/>` +
    `<a:ahLst/>` +
    `<a:cxnLst/>` +
    `<a:rect l="0" t="0" r="${arcCx}" b="${arcCy}"/>` +
    `<a:pathLst>` +
    `<a:path w="${arcCx}" h="${arcCy}">` +
    `<a:moveTo><a:pt x="0" y="${pathStartY}"/></a:moveTo>` +
    `<a:cubicBezTo>` +
    `<a:pt x="${cpBow}" y="${cpA_y}"/>` +
    `<a:pt x="${cpBow}" y="${cpB_y}"/>` +
    `<a:pt x="0" y="${pathEndY}"/>` +
    `</a:cubicBezTo>` +
    `</a:path>` +
    `</a:pathLst>` +
    `</a:custGeom>` +
    `<a:noFill/>` +
    `<a:ln w="${lineW}">` +
    `<a:solidFill><a:srgbClr val="${conn.color}"/></a:solidFill>` +
    `<a:tailEnd type="${headType}"/>` +
    `</a:ln>` +
    `</p:spPr>` +
    `</p:sp>`
  );
}

/** Straight or elbow native OOXML connector (<p:cxnSp>). */
function buildNativeConnector(
  conn: ConnectorDef,
  fromId: number, toId: number,
  x: number, y: number, cx: number, cy: number,
  flipH: string, flipV: string,
  id: number, lineW: number, headType: string, tailType: string,
): string {
  const presetMap: Record<string, string> = {
    straight: "straightConnector1",
    elbow: "bentConnector3",
  };
  const preset = presetMap[conn.type];
  const avLst = conn.type === "elbow"
    ? '<a:avLst><a:gd name="adj1" fmla="val 50000"/></a:avLst>'
    : '<a:avLst/>';

  return (
    `<p:cxnSp>` +
    `<p:nvCxnSpPr>` +
    `<p:cNvPr id="${id}" name="Connector ${id}"/>` +
    `<p:cNvCxnSpPr>` +
    `<a:cxnSpLocks noChangeShapeType="1"/>` +
    `<a:stCxn id="${fromId}" idx="${conn.from.idx}"/>` +
    `<a:endCxn id="${toId}" idx="${conn.to.idx}"/>` +
    `</p:cNvCxnSpPr>` +
    `<p:nvPr/>` +
    `</p:nvCxnSpPr>` +
    `<p:spPr>` +
    `<a:xfrm${flipH}${flipV}>` +
    `<a:off x="${Math.round(x)}" y="${Math.round(y)}"/>` +
    `<a:ext cx="${Math.round(cx)}" cy="${Math.round(cy)}"/>` +
    `</a:xfrm>` +
    `<a:prstGeom prst="${preset}">${avLst}</a:prstGeom>` +
    `<a:ln w="${lineW}">` +
    `<a:solidFill><a:srgbClr val="${conn.color}"/></a:solidFill>` +
    `<a:headEnd type="${tailType}"/>` +
    `<a:tailEnd type="${headType}"/>` +
    `</a:ln>` +
    `</p:spPr>` +
    `</p:cxnSp>`
  );
}

/** Text box label positioned near a connector. */
function buildConnectorLabel(
  conn: ConnectorDef,
  fromX: number, fromY: number, toX: number, toY: number,
  id: number, sansFont: string, EMU: number,
): string {
  let labelX: number, labelY: number;
  if (conn.type === "curved") {
    labelX = Math.max(fromX, toX) + 0.6 * EMU;
    labelY = (fromY + toY) / 2 - 0.15 * EMU;
  } else {
    labelX = (fromX + toX) / 2;
    labelY = (fromY + toY) / 2 - 0.25 * EMU;
  }
  const labelW = 1.0 * EMU;
  const labelH = 0.35 * EMU;
  const italic = conn.labelItalic !== false ? ' i="1"' : "";

  return (
    `<p:sp>` +
    `<p:nvSpPr>` +
    `<p:cNvPr id="${id}" name="Label ${id}"/>` +
    `<p:cNvSpPr txBox="1"/>` +
    `<p:nvPr/>` +
    `</p:nvSpPr>` +
    `<p:spPr>` +
    `<a:xfrm>` +
    `<a:off x="${Math.round(labelX)}" y="${Math.round(labelY)}"/>` +
    `<a:ext cx="${Math.round(labelW)}" cy="${Math.round(labelH)}"/>` +
    `</a:xfrm>` +
    `<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>` +
    `<a:noFill/>` +
    `</p:spPr>` +
    `<p:txBody>` +
    `<a:bodyPr wrap="square" rtlCol="0"/>` +
    `<a:lstStyle/>` +
    `<a:p>` +
    `<a:r>` +
    `<a:rPr lang="en-US" sz="1400"${italic} dirty="0">` +
    `<a:solidFill><a:srgbClr val="${conn.color}"/></a:solidFill>` +
    `<a:latin typeface="${sansFont}"/>` +
    `</a:rPr>` +
    `<a:t>${conn.label}</a:t>` +
    `</a:r>` +
    `</a:p>` +
    `</p:txBody>` +
    `</p:sp>`
  );
}

// ---------------------------------------------------------------------------
// Code block grouping
// ---------------------------------------------------------------------------

/**
 * Group code block shapes (bg, label, rule, code) into <p:grpSp>.
 * Shapes are tagged with objectName "cb-N-bg/label/rule/code".
 */
async function groupCodeBlocks(zip: JSZip): Promise<void> {
  const slideFiles = Object.keys(zip.files).filter((f) =>
    /^ppt\/slides\/slide\d+\.xml$/.test(f)
  );

  for (const slidePath of slideFiles) {
    let xml = await zip.file(slidePath)!.async("string");

    // Find all code block group IDs
    const groupIds = new Set<string>();
    const namePattern = /name="cb-(\d+)-bg"/g;
    let m: RegExpExecArray | null;
    while ((m = namePattern.exec(xml)) !== null) {
      groupIds.add(m[1]);
    }

    if (groupIds.size === 0) continue;

    for (const gid of groupIds) {
      const parts = ["bg", "label", "rule", "code"];
      const shapes: string[] = [];

      // Extract all 4 shapes
      for (const part of parts) {
        const shapeXml = extractShape(xml, `cb-${gid}-${part}`);
        if (shapeXml) {
          xml = xml.replace(shapeXml, "");
          shapes.push(shapeXml);
        }
      }

      if (shapes.length === 0) continue;

      // Get bounding box from the bg shape (first one)
      const offMatch = shapes[0].match(/<a:off x="(\d+)" y="(\d+)"/);
      const extMatch = shapes[0].match(/<a:ext cx="(\d+)" cy="(\d+)"/);
      if (!offMatch || !extMatch) continue;

      const gx = parseInt(offMatch[1]);
      const gy = parseInt(offMatch[2]);
      const gcx = parseInt(extMatch[1]);
      const gcy = parseInt(extMatch[2]);

      // Next available ID
      let maxId = 0;
      const idRegex = /id="(\d+)"/g;
      let im: RegExpExecArray | null;
      while ((im = idRegex.exec(xml)) !== null) {
        maxId = Math.max(maxId, parseInt(im[1]));
      }
      maxId++;

      // Build group — bg first (back), then rule, then label+code on top
      const grpSpXml =
        `<p:grpSp>` +
        `<p:nvGrpSpPr>` +
        `<p:cNvPr id="${maxId}" name="CodeBlock ${gid}"/>` +
        `<p:cNvGrpSpPr><a:grpSpLocks noChangeAspect="0"/></p:cNvGrpSpPr>` +
        `<p:nvPr/>` +
        `</p:nvGrpSpPr>` +
        `<p:grpSpPr>` +
        `<a:xfrm>` +
        `<a:off x="${gx}" y="${gy}"/>` +
        `<a:ext cx="${gcx}" cy="${gcy}"/>` +
        `<a:chOff x="${gx}" y="${gy}"/>` +
        `<a:chExt cx="${gcx}" cy="${gcy}"/>` +
        `</a:xfrm>` +
        `</p:grpSpPr>` +
        shapes.join("") +
        `</p:grpSp>`;

      xml = xml.replace("</p:spTree>", grpSpXml + "</p:spTree>");
    }

    zip.file(slidePath, xml);
  }
}

/**
 * Extract a complete <p:sp>...</p:sp> element that contains
 * the given objectName (from name="..." attribute).
 */
function extractShape(xml: string, objectName: string): string | null {
  return extractElement(xml, objectName, "p:sp");
}

/**
 * Extract a complete XML element (<p:sp> or <p:pic>) by objectName.
 * Walks backward to find the opening tag, forward for the closing tag.
 */
function extractElement(xml: string, objectName: string, tag: string): string | null {
  const nameStr = `name="${objectName}"`;
  const nameIdx = xml.indexOf(nameStr);
  if (nameIdx === -1) return null;

  const openTag = `<${tag}`;
  const closeTag = `</${tag}>`;

  // Walk backwards to find the opening tag
  let start = nameIdx;
  while (start > 0) {
    if (xml.startsWith(openTag, start)) {
      const afterTag = xml[start + openTag.length];
      if (afterTag === ">" || afterTag === " ") {
        break;
      }
    }
    start--;
  }

  // Walk forward to find the closing tag
  let end = nameIdx;
  while (end < xml.length) {
    if (xml.startsWith(closeTag, end)) {
      end += closeTag.length;
      break;
    }
    end++;
  }

  if (start === 0 && !xml.startsWith(openTag + ">") && !xml.startsWith(openTag + " ")) {
    return null;
  }

  return xml.substring(start, end);
}

// ---------------------------------------------------------------------------
// Callout block grouping
// ---------------------------------------------------------------------------

/**
 * Group callout block shapes (bg + icon) into <p:grpSp>.
 * Shapes are tagged with objectName "co-N-bg" and "co-N-icon".
 */
async function groupCalloutBlocks(zip: JSZip): Promise<void> {
  const slideFiles = Object.keys(zip.files).filter((f) =>
    /^ppt\/slides\/slide\d+\.xml$/.test(f)
  );

  for (const slidePath of slideFiles) {
    let xml = await zip.file(slidePath)!.async("string");

    // Find all callout group IDs
    const groupIds = new Set<string>();
    const namePattern = /name="co-(\d+)-bg"/g;
    let m: RegExpExecArray | null;
    while ((m = namePattern.exec(xml)) !== null) {
      groupIds.add(m[1]);
    }

    if (groupIds.size === 0) continue;

    for (const gid of groupIds) {
      const shapes: string[] = [];

      // Extract bg shape (<p:sp>)
      const bgXml = extractElement(xml, `co-${gid}-bg`, "p:sp");
      if (bgXml) {
        xml = xml.replace(bgXml, "");
        shapes.push(bgXml);
      }

      // Extract icon image (<p:pic>)
      const iconXml = extractElement(xml, `co-${gid}-icon`, "p:pic");
      if (iconXml) {
        xml = xml.replace(iconXml, "");
        shapes.push(iconXml);
      }

      if (shapes.length < 2) {
        // Put back any extracted shape if we couldn't find both
        for (const s of shapes) {
          xml = xml.replace("</p:spTree>", s + "</p:spTree>");
        }
        continue;
      }

      // Get bounding box from the bg shape (first one)
      const offMatch = shapes[0].match(/<a:off x="(\d+)" y="(\d+)"/);
      const extMatch = shapes[0].match(/<a:ext cx="(\d+)" cy="(\d+)"/);
      if (!offMatch || !extMatch) continue;

      const gx = parseInt(offMatch[1]);
      const gy = parseInt(offMatch[2]);
      const gcx = parseInt(extMatch[1]);
      const gcy = parseInt(extMatch[2]);

      // Next available ID
      let maxId = 0;
      const idRegex = /id="(\d+)"/g;
      let im: RegExpExecArray | null;
      while ((im = idRegex.exec(xml)) !== null) {
        maxId = Math.max(maxId, parseInt(im[1]));
      }
      maxId++;

      const grpSpXml =
        `<p:grpSp>` +
        `<p:nvGrpSpPr>` +
        `<p:cNvPr id="${maxId}" name="Callout ${gid}"/>` +
        `<p:cNvGrpSpPr><a:grpSpLocks noChangeAspect="0"/></p:cNvGrpSpPr>` +
        `<p:nvPr/>` +
        `</p:nvGrpSpPr>` +
        `<p:grpSpPr>` +
        `<a:xfrm>` +
        `<a:off x="${gx}" y="${gy}"/>` +
        `<a:ext cx="${gcx}" cy="${gcy}"/>` +
        `<a:chOff x="${gx}" y="${gy}"/>` +
        `<a:chExt cx="${gcx}" cy="${gcy}"/>` +
        `</a:xfrm>` +
        `</p:grpSpPr>` +
        shapes.join("") +
        `</p:grpSp>`;

      xml = xml.replace("</p:spTree>", grpSpXml + "</p:spTree>");
    }

    zip.file(slidePath, xml);
  }
}

// ---------------------------------------------------------------------------
// Emoji bullet patching — replace <a:buChar> with <a:buBlip> for emoji bullets
// ---------------------------------------------------------------------------

/**
 * For each emoji-prefixed bullet, embed the PNG in the PPTX media folder
 * and replace the bullet character with an image bullet (<a:buBlip>).
 */
async function patchEmojiBullets(zip: JSZip, emojiDefs: EmojiDef[]): Promise<void> {
  let mediaCounter = 0;

  const slideFiles = Object.keys(zip.files).filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f));

  for (const slidePath of slideFiles) {
    const entry = zip.file(slidePath);
    if (!entry) continue;
    let xml = await entry.async("string");

    const relsPath = slidePath.replace("ppt/slides/", "ppt/slides/_rels/") + ".rels";
    const relsEntry = zip.file(relsPath);
    let relsXml = relsEntry ? await relsEntry.async("string") : null;

    let modified = false;

    for (const def of emojiDefs) {
      if (!xml.includes(`name="${def.objectName}"`)) continue;

      // Locate the shape by objectName
      const shapeRegex = new RegExp(
        `(<p:sp>\\s*<p:nvSpPr>\\s*<p:cNvPr[^>]*name="${def.objectName}"[\\s\\S]*?</p:sp>)`,
      );
      const shapeMatch = xml.match(shapeRegex);
      if (!shapeMatch) continue;

      let shapeXml = shapeMatch[1];
      const originalShapeXml = shapeXml;

      // Find all <a:p> paragraphs in this shape
      const paragraphs = [...shapeXml.matchAll(/<a:p>[\s\S]*?<\/a:p>/g)];

      for (let bi = 0; bi < def.bulletIndices.length; bi++) {
        const paraIdx = def.bulletIndices[bi];
        if (paraIdx >= paragraphs.length) continue;

        const paraXml = paragraphs[paraIdx][0];

        // Embed PNG as media file
        mediaCounter++;
        const mediaName = `emoji${mediaCounter}.png`;
        const mediaPath = `ppt/media/${mediaName}`;

        const pngData = def.emojiPngs[bi];
        const base64 = pngData.replace(/^image\/png;base64,/, "");
        zip.file(mediaPath, base64, { base64: true });

        // Add relationship
        const rId = `rIdEmoji${mediaCounter}`;
        if (relsXml) {
          relsXml = relsXml.replace(
            "</Relationships>",
            `<Relationship Id="${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/${mediaName}"/></Relationships>`,
          );
        } else {
          relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
            `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
            `<Relationship Id="${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/${mediaName}"/>` +
            `</Relationships>`;
        }

        // Replace <a:buFont .../><a:buChar .../> with <a:buBlip>
        let newParaXml = paraXml;
        newParaXml = newParaXml.replace(/<a:buFont[^/]*\/>/g, "");
        newParaXml = newParaXml.replace(/<a:buChar[^/]*\/>/g, "");
        newParaXml = newParaXml.replace(/<a:buAutoNum[^/]*\/>/g, "");

        const buBlipXml =
          `<a:buSzPct val="100000"/>` +
          `<a:buBlip>` +
          `<a:blip xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:embed="${rId}"/>` +
          `</a:buBlip>`;

        if (newParaXml.includes("</a:pPr>")) {
          newParaXml = newParaXml.replace("</a:pPr>", buBlipXml + "</a:pPr>");
        }

        shapeXml = shapeXml.replace(paraXml, newParaXml);
      }

      if (shapeXml !== originalShapeXml) {
        xml = xml.replace(originalShapeXml, shapeXml);
        modified = true;
      }
    }

    if (modified) {
      zip.file(slidePath, xml);
      if (relsXml) {
        zip.file(relsPath, relsXml);
      }
      // Ensure Content_Types has png registered
      const ctEntry = zip.file("[Content_Types].xml");
      if (ctEntry) {
        let ctXml = await ctEntry.async("string");
        if (!ctXml.includes('Extension="png"')) {
          ctXml = ctXml.replace(
            "</Types>",
            `<Default Extension="png" ContentType="image/png"/></Types>`,
          );
          zip.file("[Content_Types].xml", ctXml);
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Footer / slide number injection
// ---------------------------------------------------------------------------

interface FooterStyle {
  spacing: ThemeSpacing;
  font: string;
  size: number;   // pt
  color: string;  // hex WITHOUT #
}

async function injectFooters(
  zip: JSZip,
  footerDefs: FooterDef[],
  style: FooterStyle,
): Promise<void> {
  const EMU = 914400;
  const sp = style.spacing;
  const szHundredths = style.size * 100; // OOXML uses hundredths of a point

  // Position: y is near the bottom of the slide
  const footerY = Math.round((sp.slideHeight - 0.35) * EMU);
  const footerH = Math.round(0.25 * EMU);

  // Left region: static text + citations
  const leftX = Math.round(sp.marginLeft * EMU);
  const leftW = Math.round((sp.slideWidth - sp.marginLeft - sp.marginRight - 1.5) * EMU);

  // Right region: slide number
  const rightW = Math.round(1.2 * EMU);
  const rightX = Math.round((sp.slideWidth - sp.marginRight) * EMU) - rightW;

  for (const def of footerDefs) {
    const slidePath = `ppt/slides/slide${def.slideIndex + 1}.xml`;
    const entry = zip.file(slidePath);
    if (!entry) continue;
    let xml = await entry.async("string");

    // Find max existing shape ID
    let maxId = 0;
    const idRegex = /id="(\d+)"/g;
    let m;
    while ((m = idRegex.exec(xml)) !== null) {
      maxId = Math.max(maxId, parseInt(m[1]));
    }

    const shapes: string[] = [];

    // Slide number (right-aligned)
    if (def.slideNumber) {
      maxId++;
      shapes.push(footerTextBox(maxId, "SlideNum", rightX, footerY, rightW, footerH, "r", def.slideNumber, style));
    }

    // Static text + citations (left-aligned)
    const leftParts: string[] = [];
    if (def.text) leftParts.push(def.text);
    if (def.citations) leftParts.push(def.citations);
    if (leftParts.length > 0) {
      maxId++;
      const combined = leftParts.join("  ·  ");
      shapes.push(footerTextBox(maxId, "FooterText", leftX, footerY, leftW, footerH, "l", combined, style));
    }

    if (shapes.length > 0) {
      xml = xml.replace("</p:spTree>", shapes.join("") + "</p:spTree>");
      zip.file(slidePath, xml);
    }
  }
}

function footerTextBox(
  id: number,
  name: string,
  x: number, y: number, w: number, h: number,
  align: "l" | "r" | "ctr",
  text: string,
  style: FooterStyle,
): string {
  const szHundredths = style.size * 100;
  return (
    `<p:sp>` +
    `<p:nvSpPr>` +
    `<p:cNvPr id="${id}" name="${name}"/>` +
    `<p:cNvSpPr txBox="1"/><p:nvPr/>` +
    `</p:nvSpPr>` +
    `<p:spPr>` +
    `<a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${w}" cy="${h}"/></a:xfrm>` +
    `<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>` +
    `<a:noFill/>` +
    `</p:spPr>` +
    `<p:txBody>` +
    `<a:bodyPr wrap="square" lIns="0" tIns="0" rIns="0" bIns="0" anchor="b"/>` +
    `<a:lstStyle/>` +
    `<a:p>` +
    `<a:pPr algn="${align}"/>` +
    `<a:r>` +
    `<a:rPr lang="en-US" sz="${szHundredths}" dirty="0">` +
    `<a:solidFill><a:srgbClr val="${style.color}"/></a:solidFill>` +
    `<a:latin typeface="${style.font}"/>` +
    `</a:rPr>` +
    `<a:t>${escapeXml(text)}</a:t>` +
    `</a:r>` +
    `</a:p>` +
    `</p:txBody>` +
    `</p:sp>`
  );
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
