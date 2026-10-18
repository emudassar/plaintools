"use client";

import { useRef, useState } from "react";
import TileMap, { type MapShape } from "./TileMap";
import { ErrorBox, Ext, n, n0 } from "./GeoBits";
import { Btn } from "./ToolBits";
import { fieldClass } from "./CalcBits";
import { zctaOutlines, TIGERWEB_INFO_URL } from "@/lib/tigerweb";
import { classOf, PALETTE, quantileBreaks, SEQ7 } from "@/lib/projected";
import { ZCTA_URL } from "@/lib/us-data";
import { toGeoJson, toKml, type GeoCollection } from "@/lib/geo-formats";
import { downloadText } from "@/lib/svg-export";
import { asToolError } from "@/lib/errors";
import type { LatLon } from "@/lib/geodesy";

const MAX = 300;

interface Row {
  zip: string;
  value: string;
}
interface Done {
  rows: Row[];
  outlines: Map<string, LatLon[][][]>;
  numeric: boolean;
  cats: string[];
  breaks: number[];
}

function parse(text: string): Row[] {
  const out: Row[] = [];
  const seen = new Set<string>();
  for (const line of text.split(/\r?\n/)) {
    const m = line.trim().match(/^(\d{5})(?:-\d{4})?\s*[,;\t ]?\s*(.*)$/);
    if (m && !seen.has(m[1])) {
      seen.add(m[1]);
      out.push({ zip: m[1], value: m[2].trim() });
    } else if (!m) {
      // A line of several ZIPs with no values.
      for (const z of line.match(/\b\d{5}\b/g) ?? [])
        if (!seen.has(z)) {
          seen.add(z);
          out.push({ zip: z, value: "" });
        }
    }
  }
  return out.slice(0, MAX);
}

export default function ZipMapMakerTool() {
  const [text, setText] = useState("60601, Downtown\n60602, Downtown\n60603, Downtown\n60604, Downtown\n60605, South Loop\n60607, West Loop\n60610, Near North\n60611, Near North\n60614, Lincoln Park\n60616, South Loop");
  const [done, setDone] = useState<Done | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [opacity, setOpacity] = useState(0.45);
  const seq = useRef(0);

  async function run() {
    const rows = parse(text);
    setErr(null);
    if (!rows.length) return setErr("Enter at least one 5-digit ZIP code.");
    const id = ++seq.current;
    setBusy(0);
    try {
      const outlines = await zctaOutlines(rows.map((r) => r.zip), (k) => id === seq.current && setBusy(k));
      if (id !== seq.current) return;
      const vals = rows.map((r) => r.value).filter(Boolean);
      const numeric = vals.length > 0 && vals.every((v) => Number.isFinite(Number(v.replace(/[$,%]/g, ""))));
      const cats = numeric ? [] : [...new Set(rows.map((r) => r.value || "Selected"))];
      const breaks = numeric ? quantileBreaks(vals.map((v) => Number(v.replace(/[$,%]/g, ""))), 7) : [];
      setDone({ rows, outlines, numeric, cats, breaks });
    } catch (e) {
      if (id === seq.current) setErr(asToolError(e).message);
    } finally {
      if (id === seq.current) setBusy(null);
    }
  }

  const colorOf = (r: Row) => {
    if (!done) return PALETTE[0];
    if (done.numeric) {
      const k = classOf(Number(r.value.replace(/[$,%]/g, "")), done.breaks);
      return k < 0 ? "#9ca3af" : SEQ7[k];
    }
    return PALETTE[done.cats.indexOf(r.value || "Selected") % 12];
  };
  const shapes: MapShape[] = done
    ? done.rows.flatMap((r) => {
        const polys = done.outlines.get(r.zip);
        if (!polys) return [];
        // All rings in one even-odd path: outer parts fill, holes stay empty.
        const rings = polys.flat();
        return [{ points: rings[0], more: rings.slice(1), fill: true, color: colorOf(r), fillOpacity: opacity, width: 1.2 }];
      })
    : [];
  const missing = done ? done.rows.filter((r) => !done.outlines.has(r.zip)).map((r) => r.zip) : [];
  const fc: GeoCollection | null = done
    ? {
        type: "FeatureCollection",
        features: done.rows.flatMap((r) => {
          const polys = done.outlines.get(r.zip);
          if (!polys) return [];
          return [{ type: "Feature" as const, properties: { name: r.zip, value: r.value, fill: colorOf(r) }, geometry: { type: "MultiPolygon" as const, coordinates: polys.map((poly) => poly.map((ring) => ring.map((p) => [p.lon, p.lat] as [number, number]))) } }];
        }),
      }
    : null;

  return (
    <div>
      <label htmlFor="zipmap" className="mb-1.5 block font-medium">
        ZIP codes, one per line — optionally followed by a group name or a number
      </label>
      <textarea id="zipmap" className={`${fieldClass} h-40 font-mono text-sm`} value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} />
      <p className="mt-1 text-xs text-[var(--color-muted)]">Group names colour ZIPs by group (sales territories, delivery zones). Numbers shade them light to dark. Up to {MAX} ZIP codes.</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Btn primary onClick={() => void run()} disabled={busy !== null}>
          {busy !== null ? `Fetching outlines… ${busy}` : "Make the map"}
        </Btn>
        <label className="flex items-center gap-2 text-sm">
          Fill
          <input type="range" min={0.1} max={0.9} step={0.05} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} />
        </label>
      </div>
      {err && (
        <div className="mt-3">
          <ErrorBox title="The map could not be made" message={err} />
        </div>
      )}
      <div className="mt-4">
        <TileMap ariaLabel="Map of the ZIP code areas" shapes={shapes} fitKey={done ? `${done.rows.length}-${done.outlines.size}-${text.length}` : ""} initial={{ lat: 39, lon: -96, zoom: 3 }} maxFitZoom={13} height={500} />
      </div>
      {done && (
        <>
          <div className="mt-2 flex flex-wrap gap-3 text-sm">
            {done.numeric
              ? SEQ7.map((c, i) => (
                  <span key={c} className="flex items-center gap-1">
                    <span className="inline-block h-3 w-4" style={{ background: c }} />
                    {i === 0 ? `< ${n(done.breaks[0], 1)}` : i === 6 ? `≥ ${n(done.breaks[5], 1)}` : `${n(done.breaks[i - 1], 1)}–${n(done.breaks[i], 1)}`}
                  </span>
                ))
              : done.cats.map((c, i) => (
                  <span key={c} className="flex items-center gap-1">
                    <span className="inline-block h-3 w-4" style={{ background: PALETTE[i % 12] }} />
                    {c} ({done.rows.filter((r) => (r.value || "Selected") === c).length})
                  </span>
                ))}
          </div>
          <p className="mt-2 text-sm">
            {n0(done.outlines.size)} of {done.rows.length} ZIP codes drawn.
            {missing.length > 0 && ` No outline for ${missing.join(", ")} — PO-box-only, single-business or unused ZIPs have no ZIP Code Tabulation Area.`}
          </p>
          {fc && fc.features.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              <Btn onClick={() => downloadText(toGeoJson(fc), "zip-code-map.geojson", "application/geo+json")}>Download GeoJSON</Btn>
              <Btn onClick={() => downloadText(toKml(fc, "ZIP code map"), "zip-code-map.kml", "application/vnd.google-earth.kml+xml")}>KML</Btn>
            </div>
          )}
        </>
      )}
      <p className="mt-3 text-xs text-[var(--color-muted)]">
        Outlines: 2020 Census ZIP Code Tabulation Areas from the Census Bureau&apos;s <Ext href={TIGERWEB_INFO_URL}>TIGERweb</Ext> service, simplified to about 50 m. ZCTAs approximate ZIP delivery
        areas (<Ext href={ZCTA_URL}>how they differ</Ext>). Your list is sent to TIGERweb only as ZIP numbers; group names and values stay in your browser.
      </p>
    </div>
  );
}
