/**
 * Browser-side export of an SVG string to SVG, PNG or PDF files. Nothing leaves the
 * browser: the SVG is drawn onto a canvas and saved through a blob link.
 */
import { jpegToPdf, type PageSize } from "./pdf-image";

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function downloadText(text: string, filename: string, type: string): void {
  downloadBlob(new Blob([text], { type }), filename);
}

/** Natural width/height of an SVG from its viewBox. */
export function svgSize(svg: string): { w: number; h: number } {
  const m = svg.match(/viewBox="[\d.-]+ [\d.-]+ ([\d.]+) ([\d.]+)"/);
  return m ? { w: Number(m[1]), h: Number(m[2]) } : { w: 1200, h: 800 };
}

/** Renders the SVG at `width` px wide onto a white (or transparent) canvas. */
export async function svgToCanvas(svg: string, width: number, transparent = false): Promise<HTMLCanvasElement> {
  const { w, h } = svgSize(svg);
  const height = Math.round((width * h) / w);
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("The map image could not be drawn."));
      i.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("This browser cannot draw images.");
    if (!transparent) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
    }
    ctx.drawImage(img, 0, 0, width, height);
    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
}

const toBlob = (c: HTMLCanvasElement, type: string, q?: number) =>
  new Promise<Blob>((resolve, reject) => c.toBlob((b) => (b ? resolve(b) : reject(new Error("Export failed."))), type, q));

export async function downloadPng(svg: string, width: number, filename: string, transparent = false): Promise<void> {
  downloadBlob(await toBlob(await svgToCanvas(svg, width, transparent), "image/png"), filename);
}

/** A one-page PDF, image rendered at 200 dpi for the chosen page. */
export async function downloadPdf(svg: string, page: PageSize, filename: string): Promise<void> {
  const { w, h } = svgSize(svg);
  const longPt = Math.max(page.w, page.h);
  const width = Math.min(6000, Math.round(((longPt / 72) * 200 * w) / Math.max(w, h)));
  const canvas = await svgToCanvas(svg, width);
  const jpeg = new Uint8Array(await (await toBlob(canvas, "image/jpeg", 0.92)).arrayBuffer());
  const pdf = jpegToPdf(jpeg, canvas.width, canvas.height, page);
  downloadBlob(new Blob([pdf as BlobPart], { type: "application/pdf" }), filename);
}
