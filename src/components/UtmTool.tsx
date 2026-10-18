"use client";

import { useMemo, useState } from "react";
import CopyRow from "./CopyRow";
import TileMap from "./TileMap";
import { Ext } from "./GeoBits";
import { fieldClass } from "./CalcBits";
import { fmtDms, fromUtm, KARNEY_URL, parseLatLon, toMgrs, toUtm } from "@/lib/coords";
import { parseUtmText } from "@/lib/coord-detect";
import { toCsv } from "@/lib/geo-formats";
import { downloadText } from "@/lib/svg-export";
import type { LatLon } from "@/lib/geodesy";

const NGA_URL = "https://earth-info.nga.mil/index.php?dir=coordsys&action=coordsys";

function convert(zone: string, hemi: "N" | "S", e: string, n: string): { p: LatLon | null; error: string | null; warn: string | null } {
  const z = Number(zone), E = Number(e), N = Number(n);
  if (!zone.trim() || !e.trim() || !n.trim()) return { p: null, error: null, warn: null };
  if (!Number.isInteger(z) || z < 1 || z > 60) return { p: null, error: "The zone is a whole number from 1 to 60.", warn: null };
  if (!Number.isFinite(E) || !Number.isFinite(N)) return { p: null, error: "Easting and northing must be numbers in metres.", warn: null };
  if (N < 0 || N > 10_000_000) return { p: null, error: "Northing runs from 0 to 10,000,000 m. In the southern hemisphere it counts down from 10,000,000 at the equator.", warn: null };
  if (E < 100_000 || E > 900_000) return { p: null, error: "Easting is normally between about 160,000 and 834,000 m (500,000 m is the zone's central meridian). Check the digits.", warn: null };
  const p = fromUtm(z, hemi, E, N);
  const warn = E < 160_000 || E > 840_000 ? "This easting is outside the usual width of a 6° zone, so the point lies in a neighbouring zone. The conversion is still exact, but the point would normally be given in that zone." : null;
  return { p, error: null, warn };
}

function UtmToLatLon() {
  const [zone, setZone] = useState("18");
  const [hemi, setHemi] = useState<"N" | "S">("N");
  const [e, setE] = useState("585631");
  const [n, setN] = useState("4511327");
  const r = useMemo(() => convert(zone, hemi, e, n), [zone, hemi, e, n]);
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-4">
        <label className="block">
          <span className="mb-1.5 block font-medium">Zone (1–60)</span>
          <input className={fieldClass} inputMode="numeric" value={zone} onChange={(x) => setZone(x.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1.5 block font-medium">Hemisphere</span>
          <select className={fieldClass} value={hemi} onChange={(x) => setHemi(x.target.value as "N" | "S")}>
            <option value="N">North</option>
            <option value="S">South</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block font-medium">Easting (m)</span>
          <input className={fieldClass} inputMode="decimal" value={e} onChange={(x) => setE(x.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1.5 block font-medium">Northing (m)</span>
          <input className={fieldClass} inputMode="decimal" value={n} onChange={(x) => setN(x.target.value)} />
        </label>
      </div>
      <p className="mt-1.5 text-xs text-[var(--color-muted)]">A zone letter such as 18T is a latitude band: C–M are south of the equator, N–X north.</p>
      {r.error && (
        <p className="mt-4 rounded-md border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-3 text-sm" role="alert">
          {r.error}
        </p>
      )}
      {r.p && <LatLonResult p={r.p} warn={r.warn} key={`${r.p.lat},${r.p.lon}`} />}
    </div>
  );
}

function LatLonResult({ p, warn }: { p: LatLon; warn: string | null }) {
  const dd = `${p.lat.toFixed(6)}, ${p.lon.toFixed(6)}`;
  return (
    <div className="mt-5 rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">Latitude, longitude (WGS84)</p>
        <p className="mt-1 font-mono text-2xl font-semibold tracking-tight">{dd}</p>
      </div>
      {warn && <p className="border-b border-[var(--color-line)] bg-[var(--color-warn-soft)] px-4 py-3 text-sm">{warn}</p>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-[var(--color-line)]">
            <CopyRow label="Latitude" value={p.lat.toFixed(6)} />
            <CopyRow label="Longitude" value={p.lon.toFixed(6)} />
            <CopyRow label="Degrees, minutes, seconds" value={`${fmtDms(p.lat, true, 2)}, ${fmtDms(p.lon, false, 2)}`} />
            {p.lat > -80 && p.lat < 84 && <CopyRow label="MGRS (1 m)" value={toMgrs(p)} />}
          </tbody>
        </table>
      </div>
      <div className="p-4">
        <TileMap ariaLabel="Map showing the converted point" markers={[{ lat: p.lat, lon: p.lon }]} fitKey={dd} maxFitZoom={14} height={300} />
      </div>
      <Method />
    </div>
  );
}

function Method() {
  return (
    <p className="border-t border-[var(--color-line)] px-4 py-3 text-xs text-[var(--color-muted)]">
      WGS84 ellipsoid, scale factor 0.9996, false easting 500,000 m, false northing 10,000,000 m in the south. Transverse Mercator by Krüger&apos;s series to fourth order in n as
      given by <Ext href={KARNEY_URL}>Karney (2011)</Ext> — accurate to well under a millimetre inside a zone. Grid definitions: <Ext href={NGA_URL}>NGA coordinate systems</Ext>.
      Calculated in your browser. Coordinates on another datum (NAD27, ED50) differ by up to a few hundred metres and are not converted here.
    </p>
  );
}

function LatLonToUtm() {
  const [text, setText] = useState("40.748440, -73.985664");
  const p = useMemo(() => parseLatLon(text), [text]);
  let out: ReturnType<typeof toUtm> | null = null, err: string | null = null;
  if (p) {
    try {
      out = toUtm(p);
    } catch (x) {
      err = x instanceof Error ? x.message : String(x);
    }
  }
  return (
    <div>
      <label htmlFor="ll-in" className="mb-1.5 block font-medium">
        Latitude, longitude (decimal or degrees-minutes-seconds)
      </label>
      <input id="ll-in" className={fieldClass} value={text} onChange={(x) => setText(x.target.value)} spellCheck={false} />
      {text.trim() && !p && <p className="mt-3 text-sm">Could not read that as latitude and longitude.</p>}
      {err && <p className="mt-3 text-sm">{err}</p>}
      {p && out && (
        <div className="mt-5 rounded-lg border border-[var(--color-line)]">
          <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
            <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">UTM</p>
            <p className="mt-1 font-mono text-2xl font-semibold tracking-tight">
              {out.zone}
              {out.band} {out.easting.toFixed(0)}mE {out.northing.toFixed(0)}mN
            </p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">Zone {out.zone}, {out.hemisphere === "N" ? "northern" : "southern"} hemisphere, latitude band {out.band}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-[var(--color-line)]">
                <CopyRow label="Easting (m)" value={out.easting.toFixed(2)} />
                <CopyRow label="Northing (m)" value={out.northing.toFixed(2)} />
                <CopyRow label="MGRS (1 m)" value={toMgrs(p)} />
                <tr>
                  <td className="px-3 py-2 font-medium">Point scale factor</td>
                  <td className="px-3 py-2" colSpan={2}>{out.scale.toFixed(6)}</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-medium">Grid convergence</td>
                  <td className="px-3 py-2" colSpan={2}>{out.convergence.toFixed(4)}° (grid north is {Math.abs(out.convergence).toFixed(2)}° {out.convergence >= 0 ? "east" : "west"} of true north here)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <Method />
        </div>
      )}
    </div>
  );
}

function Batch() {
  const [text, setText] = useState("18T 585631 4511327\n33T 500000 4649776\n56H 334786 6252080");
  const rows = useMemo(
    () =>
      text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .slice(0, 1000)
        .map((line) => ({ line, p: parseUtmText(line) })),
    [text],
  );
  return (
    <div>
      <label htmlFor="utm-batch" className="mb-1.5 block font-medium">
        One UTM coordinate per line: zone + band letter, easting, northing
      </label>
      <textarea id="utm-batch" className={`${fieldClass} h-36 font-mono text-sm`} value={text} onChange={(x) => setText(x.target.value)} spellCheck={false} />
      <button
        type="button"
        className="mt-3 rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white"
        onClick={() => downloadText(toCsv([["utm", "latitude", "longitude"], ...rows.map((r) => [r.line, r.p ? r.p.lat.toFixed(6) : "", r.p ? r.p.lon.toFixed(6) : ""])]), "utm-to-lat-long.csv", "text/csv")}
      >
        Download CSV
      </button>
      <div className="mt-4 overflow-x-auto rounded-md border border-[var(--color-line)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--color-accent-soft)]">
            <tr>
              <th className="px-3 py-2 font-medium">UTM</th>
              <th className="px-3 py-2 font-medium">Latitude</th>
              <th className="px-3 py-2 font-medium">Longitude</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-line)]">
            {rows.slice(0, 200).map((r, i) => (
              <tr key={i}>
                <td className="px-3 py-2 font-mono text-xs">{r.line}</td>
                {r.p ? (
                  <>
                    <td className="px-3 py-2 font-mono text-xs">{r.p.lat.toFixed(6)}</td>
                    <td className="px-3 py-2 font-mono text-xs">{r.p.lon.toFixed(6)}</td>
                  </>
                ) : (
                  <td className="px-3 py-2" colSpan={2}>
                    Not read — write it as zone and band letter, then easting and northing (e.g. 33T 500000 4649776)
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-[var(--color-muted)]">In a list the band letter decides the hemisphere (N–X north, C–M south). WGS84; calculated in your browser.</p>
    </div>
  );
}

export default function UtmTool() {
  const [mode, setMode] = useState<"utm" | "batch" | "ll">("utm");
  const tab = (m: typeof mode, label: string) => (
    <button type="button" onClick={() => setMode(m)} aria-pressed={mode === m} className={`rounded-md border px-4 py-2 text-sm font-medium ${mode === m ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]" : "border-[var(--color-line)] bg-white"}`}>
      {label}
    </button>
  );
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {tab("utm", "UTM → lat/long")}
        {tab("batch", "A list of UTM")}
        {tab("ll", "Lat/long → UTM")}
      </div>
      {mode === "utm" ? <UtmToLatLon /> : mode === "batch" ? <Batch /> : <LatLonToUtm />}
    </div>
  );
}
