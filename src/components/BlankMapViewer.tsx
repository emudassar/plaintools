"use client";

import { useEffect, useMemo, useState } from "react";
import { composeVariant, MAP_VARIANTS, type MapOverlay, type MapVariant } from "@/lib/blank-map-variants";
import { PAGE_SIZES } from "@/lib/pdf-image";
import { downloadPdf, downloadPng, downloadText } from "@/lib/svg-export";

/**
 * Shows the four variants of one blank map and saves them as SVG, PNG or PDF.
 * The blank SVG and its overlay are static files; everything else happens in the browser.
 */

const PNG_SIZES = [
  { w: 1200, label: "Web · 1,200 px" },
  { w: 2400, label: "Print · 2,400 px" },
  { w: 4800, label: "Poster · 4,800 px" },
];

interface Props {
  slug: string;
  name: string;
  width: number;
  height: number;
}

export default function BlankMapViewer({ slug, name, width, height }: Props) {
  const [variant, setVariant] = useState<MapVariant>("blank");
  const [src, setSrc] = useState<{ svg: string; overlay: MapOverlay } | null>(null);
  const [failed, setFailed] = useState(false);
  const [pngW, setPngW] = useState(2400);
  const [page, setPage] = useState(PAGE_SIZES[0].id);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    Promise.all([fetch(`/maps/blank/${slug}.svg`).then((r) => r.text()), fetch(`/maps/blank/${slug}.json`).then((r) => r.json())])
      .then(([svg, overlay]) => live && setSrc({ svg, overlay }))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [slug]);

  const svg = useMemo(() => (src ? composeVariant(src.svg, src.overlay, variant) : null), [src, variant]);
  const preview = useMemo(() => (svg ? URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" })) : null), [svg]);
  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  const file = `${slug}-${variant}-map`;
  const note = MAP_VARIANTS.find((v) => v.id === variant)?.note;

  async function run(kind: string, fn: () => Promise<void>) {
    setError(null);
    setBusy(kind);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "The download failed. Try a smaller size.");
    } finally {
      setBusy(null);
    }
  }

  const btn = "rounded-md border border-[var(--color-line)] bg-white px-4 py-2.5 text-sm font-medium disabled:opacity-50";

  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div role="tablist" aria-label="Map version" className="flex flex-wrap gap-1 border-b border-[var(--color-line)] p-2">
        {MAP_VARIANTS.map((v) => (
          <button
            key={v.id}
            role="tab"
            aria-selected={variant === v.id}
            onClick={() => setVariant(v.id)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${variant === v.id ? "bg-[var(--color-accent)] text-white" : "hover:bg-[var(--color-accent-soft)]"}`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="bg-white p-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={preview ?? `/maps/blank/${slug}.svg`}
          alt={`${MAP_VARIANTS.find((v) => v.id === variant)?.label} map of ${name}`}
          width={width}
          height={height}
          className="h-auto w-full"
        />
      </div>
      <p className="border-t border-[var(--color-line)] px-4 py-2 text-xs text-[var(--color-muted)]">{note}</p>
      {failed && <p className="px-4 pb-2 text-sm text-red-700">The map files did not load. Reload the page to try again.</p>}

      <div className="grid gap-4 border-t border-[var(--color-line)] p-4 sm:grid-cols-3">
        <div>
          <p className="mb-1.5 text-sm font-medium">SVG (vector)</p>
          <button type="button" disabled={!svg} className={btn} onClick={() => svg && downloadText(svg, `${file}.svg`, "image/svg+xml")}>
            Download SVG
          </button>
          <p className="mt-1.5 text-xs text-[var(--color-muted)]">Any size, editable in Inkscape, Illustrator or Figma.</p>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor={`png-${slug}`}>
            PNG (image)
          </label>
          <div className="flex gap-2">
            <select id={`png-${slug}`} value={pngW} onChange={(e) => setPngW(Number(e.target.value))} className="min-w-0 flex-1 rounded-md border border-[var(--color-line)] bg-white px-2 py-2 text-sm">
              {PNG_SIZES.map((s) => (
                <option key={s.w} value={s.w}>
                  {s.label}
                </option>
              ))}
            </select>
            <button type="button" disabled={!svg || busy !== null} className={btn} onClick={() => svg && run("png", () => downloadPng(svg, pngW, `${file}-${pngW}px.png`))}>
              {busy === "png" ? "…" : "PNG"}
            </button>
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor={`pdf-${slug}`}>
            PDF (print)
          </label>
          <div className="flex gap-2">
            <select id={`pdf-${slug}`} value={page} onChange={(e) => setPage(e.target.value)} className="min-w-0 flex-1 rounded-md border border-[var(--color-line)] bg-white px-2 py-2 text-sm">
              {PAGE_SIZES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={!svg || busy !== null}
              className={btn}
              onClick={() => svg && run("pdf", () => downloadPdf(svg, PAGE_SIZES.find((p) => p.id === page)!, `${file}-${page}.pdf`))}
            >
              {busy === "pdf" ? "…" : "PDF"}
            </button>
          </div>
        </div>
      </div>
      {error && <p className="px-4 pb-4 text-sm text-red-700">{error}</p>}
      <p className="border-t border-[var(--color-line)] px-4 py-2 text-xs text-[var(--color-muted)]">
        PNG and PDF files are drawn in your browser at the size you pick; nothing is uploaded. No watermark, no sign-up.
      </p>
    </div>
  );
}
