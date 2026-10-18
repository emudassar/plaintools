/**
 * A one-page PDF holding one JPEG image, written by hand (no library).
 *
 * Structure per ISO 32000-1 (PDF 1.7): catalog -> pages -> page -> content stream
 * that paints an image XObject. A JPEG goes in unchanged with /Filter /DCTDecode
 * (section 7.4.8), so the browser's canvas.toBlob("image/jpeg") output is used as is.
 */

export interface PageSize {
  id: string;
  label: string;
  /** Portrait width and height in points (1/72 in). */
  w: number;
  h: number;
}

export const PAGE_SIZES: PageSize[] = [
  { id: "letter", label: "US Letter · 8.5 × 11 in", w: 612, h: 792 },
  { id: "a4", label: "A4 · 210 × 297 mm", w: 595.28, h: 841.89 },
  { id: "tabloid", label: "Tabloid · 11 × 17 in", w: 792, h: 1224 },
  { id: "a3", label: "A3 · 297 × 420 mm", w: 841.89, h: 1190.55 },
  { id: "a2", label: "A2 poster · 420 × 594 mm", w: 1190.55, h: 1683.78 },
];

const enc = new TextEncoder();

/**
 * Builds the PDF. The page turns landscape when the image is wider than tall, and the
 * image is scaled to fit inside a half-inch margin, centred.
 */
export function jpegToPdf(jpeg: Uint8Array, imgW: number, imgH: number, size: PageSize, margin = 36): Uint8Array {
  const landscape = imgW > imgH;
  const pw = landscape ? size.h : size.w;
  const ph = landscape ? size.w : size.h;
  const scale = Math.min((pw - 2 * margin) / imgW, (ph - 2 * margin) / imgH);
  const dw = imgW * scale;
  const dh = imgH * scale;
  const x = (pw - dw) / 2;
  const y = (ph - dh) / 2;
  const content = `q ${dw.toFixed(2)} 0 0 ${dh.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm /Im0 Do Q`;

  const parts: Uint8Array[] = [];
  const offsets: number[] = [];
  let length = 0;
  const push = (b: Uint8Array) => {
    parts.push(b);
    length += b.length;
  };
  const obj = (n: number, body: (string | Uint8Array)[]) => {
    offsets[n] = length;
    push(enc.encode(`${n} 0 obj\n`));
    body.forEach((b) => push(typeof b === "string" ? enc.encode(b) : b));
    push(enc.encode("\nendobj\n"));
  };

  push(enc.encode("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n"));
  obj(1, ["<< /Type /Catalog /Pages 2 0 R >>"]);
  obj(2, ["<< /Type /Pages /Kids [3 0 R] /Count 1 >>"]);
  obj(3, [`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pw.toFixed(2)} ${ph.toFixed(2)}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`]);
  obj(4, [
    `<< /Type /XObject /Subtype /Image /Width ${imgW} /Height ${imgH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`,
    jpeg,
    "\nendstream",
  ]);
  obj(5, [`<< /Length ${content.length} >>\nstream\n${content}\nendstream`]);

  const xref = length;
  let table = `xref\n0 6\n0000000000 65535 f \n`;
  for (let i = 1; i <= 5; i++) table += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  push(enc.encode(`${table}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`));

  const out = new Uint8Array(length);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}
