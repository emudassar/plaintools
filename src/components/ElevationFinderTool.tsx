"use client";

import { useState } from "react";
import TileMap from "./TileMap";
import { Ext } from "./GeoBits";
import { geocodeAddress } from "@/lib/geocode";
import { parseLatLon } from "@/lib/coords";
import { copernicusBatch, COPERNICUS_DOI_URL, M_TO_FT, OPEN_METEO_DOCS_URL } from "@/lib/elevation";
import { toCsv } from "@/lib/geo-formats";
import { downloadText } from "@/lib/svg-export";
import { asToolError } from "@/lib/errors";
import type { LatLon } from "@/lib/geodesy";

interface Pt extends LatLon {
  name: string;
  m: number | null;
}

const MAX = 50;
const ft = (m: number) => Math.round(m * M_TO_FT).toLocaleString("en-US");
const mm = (m: number) => Math.round(m).toLocaleString("en-US");

export default function ElevationFinderTool() {
  const [pts, setPts] = useState<Pt[]>([]);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [retrieved, setRetrieved] = useState<string | null>(null);
  const [fitKey, setFitKey] = useState("");

  async function fill(list: Pt[]) {
    const todo = list.filter((p) => p.m === null);
    if (!todo.length) return setPts(list);
    setBusy(true);
    setErr(null);
    try {
      const vals = await copernicusBatch(todo);
      const map = new Map(todo.map((p, i) => [p, vals[i]]));
      setPts(list.map((p) => (map.has(p) ? { ...p, m: map.get(p)! } : p)));
      setRetrieved(new Date().toLocaleDateString("en-US", { dateStyle: "long" }));
    } catch (e) {
      setErr(asToolError(e).message);
      setPts(list);
    } finally {
      setBusy(false);
    }
  }

  function add(p: LatLon, name?: string, refit = false) {
    if (pts.length >= MAX) return setErr(`Up to ${MAX} points. Remove some to add more.`);
    const next = [...pts, { ...p, name: name ?? `Point ${pts.length + 1}`, m: null }];
    if (refit) setFitKey(String(Date.now()));
    void fill(next);
  }

  async function search(e: React.FormEvent) {
    e.preventDefault();
    const lines = query.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return;
    setErr(null);
    const added: Pt[] = [];
    for (const l of lines.slice(0, MAX - pts.length)) {
      const c = parseLatLon(l);
      if (c) added.push({ ...c, name: l, m: null });
      else {
        try {
          const g = await geocodeAddress(l, { preferUS: false });
          added.push({ lat: g.lat, lon: g.lon, name: g.label, m: null });
        } catch (x) {
          setErr(`"${l}": ${asToolError(x).message}`);
        }
      }
    }
    setQuery("");
    setFitKey(String(Date.now()));
    void fill([...pts, ...added]);
  }

  const known = pts.filter((p) => p.m !== null) as (Pt & { m: number })[];
  const hi = known.length ? known.reduce((a, b) => (b.m > a.m ? b : a)) : null;
  const lo = known.length ? known.reduce((a, b) => (b.m < a.m ? b : a)) : null;
  const first = known[0] ?? null;

  return (
    <div>
      <form onSubmit={search}>
        <label htmlFor="ef" className="mb-1.5 block font-medium">
          Add places or coordinates — one per line — or click the map
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <textarea id="ef" rows={2} value={query} onChange={(e) => setQuery(e.target.value)} placeholder={"Denver, CO\n27.9881, 86.9250"} className="w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2 text-sm" />
          <button type="submit" disabled={busy} className="shrink-0 rounded-md bg-[var(--color-accent)] px-5 py-2.5 font-medium text-white disabled:opacity-50">
            Add
          </button>
        </div>
      </form>
      {err && <p className="mt-2 text-sm text-red-700">{err}</p>}

      <div className="mt-4">
        <TileMap
          ariaLabel="Map. Click to add a point and read its elevation."
          height={400}
          markers={pts.map((p, i) => ({ lat: p.lat, lon: p.lon, label: String(i + 1), color: p === hi ? "#b91c1c" : p === lo ? "#0369a1" : undefined }))}
          fitKey={fitKey}
          maxFitZoom={13}
          onPick={(p) => add(p)}
        />
        <p className="mt-1.5 text-xs text-[var(--color-muted)]">Click the map to add a point. Red = highest, blue = lowest.</p>
      </div>

      {pts.length > 0 && (
        <div className="mt-4 rounded-lg border border-[var(--color-line)]">
          {hi && lo && (
            <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
              <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">{known.length === 1 ? "Ground elevation" : "Highest point"}</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight">
                {ft(hi.m)} ft · {mm(hi.m)} m <span className="text-base font-normal text-[var(--color-muted)]">— {hi.name}</span>
              </p>
              {known.length > 1 && (
                <p className="mt-1 text-[var(--color-muted)]">
                  Lowest {ft(lo.m)} ft ({mm(lo.m)} m) at {lo.name}; difference {ft(hi.m - lo.m)} ft · {mm(hi.m - lo.m)} m
                </p>
              )}
            </div>
          )}
          <div className="max-h-[26rem] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white text-left">
                <tr className="border-b border-[var(--color-line)]">
                  <th className="px-3 py-2 font-medium">#</th>
                  <th className="px-3 py-2 font-medium">Point</th>
                  <th className="px-3 py-2 text-right font-medium">Feet</th>
                  <th className="px-3 py-2 text-right font-medium">Metres</th>
                  <th className="px-3 py-2 text-right font-medium">vs #1</th>
                  <th />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-line)]">
                {pts.map((p, i) => (
                  <tr key={`${p.lat},${p.lon},${i}`}>
                    <td className="px-3 py-1.5">{i + 1}</td>
                    <td className="px-3 py-1.5">
                      <span className="block">{p.name}</span>
                      <span className="font-mono text-xs text-[var(--color-muted)]">
                        {p.lat.toFixed(5)}, {p.lon.toFixed(5)}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{p.m === null ? (busy ? "…" : "—") : ft(p.m)}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{p.m === null ? (busy ? "…" : "—") : mm(p.m)}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{p.m !== null && first && i > 0 ? `${p.m - first.m >= 0 ? "+" : "−"}${ft(Math.abs(p.m - first.m))} ft` : ""}</td>
                    <td className="px-3 py-1.5 text-right">
                      <button type="button" aria-label={`Remove point ${i + 1}`} className="text-xs text-[var(--color-muted)] underline" onClick={() => setPts(pts.filter((_, j) => j !== i))}>
                        remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-2 border-t border-[var(--color-line)] p-3">
            <button
              type="button"
              className="rounded-md border border-[var(--color-line)] bg-white px-3 py-2 text-sm font-medium"
              onClick={() => downloadText(toCsv([["point", "latitude", "longitude", "elevation_m", "elevation_ft"], ...pts.map((p) => [p.name, p.lat.toFixed(6), p.lon.toFixed(6), p.m ?? "", p.m === null ? "" : Math.round(p.m * M_TO_FT)])]), "elevations.csv", "text/csv")}
            >
              Download CSV
            </button>
            <button type="button" className="rounded-md border border-[var(--color-line)] bg-white px-3 py-2 text-sm font-medium" onClick={() => setPts([])}>
              Clear all
            </button>
          </div>
          <p className="border-t border-[var(--color-line)] px-4 py-3 text-xs text-[var(--color-muted)]">
            Source: Copernicus DEM GLO-90 (© DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018, provided under COPERNICUS by the European Union and ESA),
            via the Open-Meteo elevation API{retrieved ? `, retrieved ${retrieved}` : ""}. 90 m grid cells; open water reads 0.{" "}
            <Ext href={OPEN_METEO_DOCS_URL}>Open-Meteo</Ext> · <Ext href={COPERNICUS_DOI_URL}>Copernicus DEM</Ext>
          </p>
        </div>
      )}
    </div>
  );
}
