/**
 * QR code generator — produces base64 PNG data URIs for embedding in slides.
 *
 * Uses the `qrcode` package to generate SVG, then `sharp` to rasterize to PNG.
 */

import QRCode from "qrcode";
import sharp from "sharp";

/**
 * Generate a QR code as a base64 PNG data URI.
 *
 * @param text - The text/URL to encode
 * @param size - Output size in pixels (default 512)
 * @param color - Foreground color hex WITHOUT # (default "000000")
 * @param bgColor - Background color hex WITHOUT # (default "FFFFFF")
 */
export async function renderQRCode(
  text: string,
  size = 512,
  color = "000000",
  bgColor = "FFFFFF",
): Promise<string> {
  const svg = await QRCode.toString(text, {
    type: "svg",
    color: {
      dark: `#${color}`,
      light: `#${bgColor}`,
    },
    margin: 1,
    width: size,
  });

  const pngBuf = await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toBuffer();

  return `data:image/png;base64,${pngBuf.toString("base64")}`;
}
