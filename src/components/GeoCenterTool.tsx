"use client";

import { useMemo, useState } from "react";
import TileMap from "./TileMap";
import CopyRow from "./CopyRow";
import { Ext, fmtMiKm } from "./GeoBits";
import { fieldClass } from "./CalcBits";
import { parseLatLon } from "@/lib/coords";
import { averageLatLon, centreOfMinimumDistance, geographicMidpoint, totalDistance, WEISZFELD_URL, type WeightedPoint } from "@/lib/geo-center";
import centers from "@/data/geo-centers.json";

const NE10_URL = "https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/";
const CB_URL = "https://www.census.gov/geographies/mapping-files/time-series/geo/cartographic-boundary.html";

interface Region {
  id: string;
  name: string;
  lat: number;
  lon: number;
  parts: number;
  mainLat?: number;
  mainLon?: number;
  mainShare?: number;
  type?: string;
}

/** A line: "lat, lon" or "lat, lon, weight", or "label; lat, lon[, weight]". */
function parseLine(line: string): (WeightedPoint & { label: string }) | null {
  let label = "";
  let rest = line;
  const semi = line.indexOf(";");
  if (semi > 0) {
    label = line.slice(0, semi).trim();
    rest = line.slice(semi + 1);
  }
  const parts = rest.split(",").map((s) => s.trim()).filter(Boolean);
  let weight = 1;
  if (parts.length === 3 && Number.isFinite(Number(parts[2]))) {
    weight = Number(parts[2]);
    parts.pop();
  }
  const p = parseLatLon(parts.join(", "));
  if (!p || !(weight >= 0)) return null;
  return { ...p, weight, label };
}

function PointsMode() {
  const [text, setText] = useState("New York; 40.7128, -74.0060\nChicago; 41.8781, -87.6298\nLos Angeles; 34.0522, -118.2437\nHouston; 29.7604, -95.3698");
  const [fitKey, setFitKey] = useState("start");
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const pts = lines.map(parseLine);
  const good = pts.filter((p): p is NonNullable<typeof p> => p !== null);
  const bad = pts.length - good.length;
  const res = useMemo(() => {
    if (good.length < 2) return null;
    return { mid: geographicMidpoint(good), cmd: centreOfMinimumDistance(good), avg: averageLatLon(good) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  function addClick(p: { lat: number; lon: number }) {
    setText((t) => `${t.trim()}\n${p.lat.toFixed(5)}, ${p.lon.toFixed(5)}`.trim());
  }
  const markers = [
    ...good.map((p) => ({ ...p, r: 5, color: "#64748b", label: p.label || undefined })),
    ...(res?.mid ? [{ ...res.mid, color: "#1d4ed8", label: "Midpoint" }] : []),
    ...(res?.cmd ? [{ ...res.cmd, color: "#c2410c", label: "Min. distance" }] : []),
  ];
  return (
    <div>
      <label htmlFor="gc-pts" className="mb-1.5 block font-medium">
        Points, one per line — <span className="font-normal text-[var(--color-muted)]">lat, lon · or label; lat, lon · add “, weight” to count a point more (e.g. people living there)</span>
      </label>
      <textarea id="gc-pts" className={`${fieldClass} h-36 font-mono text-sm`} value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} />
      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
        <button type="button" className="rounded-md border border-[var(--color-line)] bg-white px-3 py-1.5" onClick={() => setFitKey(String(Date.now()))}>
          Fit map to points
        </button>
        <button type="button" className="rounded-md border border-[var(--color-line)] bg-white px-3 py-1.5" onClick={() => setText("")}>
          Clear
        </button>
        <span className="text-[var(--color-muted)]">
          {good.length} point{good.length === 1 ? "" : "s"}
          {bad ? ` · ${bad} line${bad === 1 ? "" : "s"} not read` : ""}
        </span>
      </div>
      <div className="mt-4">
        <TileMap ariaLabel="Map. Click to add a point." markers={markers} fitKey={fitKey} maxFitZoom={10} height={380} onPick={addClick} />
        <p className="mt-1.5 text-xs text-[var(--color-muted)]">Click the map to add a point to the list.</p>
      </div>
      {good.length < 2 && <p className="mt-4 text-sm text-[var(--color-muted)]">Enter at least two points.</p>}
      {res && (
        <div className="mt-4 rounded-lg border border-[var(--color-line)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-[var(--color-line)]">
                {res.mid ? <CopyRow label="Geographic midpoint (centre of gravity)" value={`${res.mid.lat.toFixed(6)}, ${res.mid.lon.toFixed(6)}`} /> : <tr><td className="px-3 py-2" colSpan={3}>The points balance out exactly (e.g. two opposite points), so there is no single midpoint.</td></tr>}
                {res.cmd && <CopyRow label="Centre of minimum distance" value={`${res.cmd.lat.toFixed(6)}, ${res.cmd.lon.toFixed(6)}`} />}
                {res.avg && <CopyRow label="Average latitude / longitude" value={`${res.avg.lat.toFixed(6)}, ${res.avg.lon.toFixed(6)}`} />}
              </tbody>
            </table>
          </div>
          <div className="p-4 text-sm">
            {res.cmd && (
              <p>
                Total {good.some((p) => p.weight !== 1) ? "weighted " : ""}straight-line distance from the centre of minimum distance to every point: <strong>{fmtMiKm(totalDistance(res.cmd, good), 0)}</strong>
                {res.mid ? <> (from the midpoint: {fmtMiKm(totalDistance(res.mid, good), 0)})</> : null}.
              </p>
            )}
            <p className="mt-2 text-[var(--color-muted)]">
              The <strong>midpoint</strong> balances the points like weights on a globe. The <strong>centre of minimum distance</strong> is where the total travel to all points is
              shortest — the fairest meeting place by straight-line distance, and less pulled by one far-away point. The plain <strong>average</strong> of latitudes and longitudes is
              shown because people ask for it, but it is distorted away from the equator.
            </p>
            <p className="mt-3 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
              Midpoint: mean of unit vectors. Minimum distance: Weiszfeld&apos;s iteration for the <Ext href={WEISZFELD_URL}>geometric median</Ext> on a sphere of mean radius 6,371 km,
              then refined by local search. Calculated in your browser.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function RegionMode() {
  const [kind, setKind] = useState<"countries" | "states">("states");
  const list = (kind === "states" ? centers.states : centers.countries) as Region[];
  const [id, setId] = useState("KS");
  const r = list.find((x) => x.id === id) ?? list[0];
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block font-medium">Kind of place</span>
          <select
            className={fieldClass}
            value={kind}
            onChange={(e) => {
              const k = e.target.value as typeof kind;
              setKind(k);
              setId(k === "states" ? "KS" : "USA");
            }}
          >
            <option value="states">US state (and DC, Puerto Rico)</option>
            <option value="countries">Country or territory</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block font-medium">{kind === "states" ? "State" : "Country"}</span>
          <select className={fieldClass} value={r.id} onChange={(e) => setId(e.target.value)}>
            {list.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-4 rounded-lg border border-[var(--color-line)]">
        <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
          <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">Geographic centre of {r.name}</p>
          <p className="mt-1 font-mono text-2xl font-semibold tracking-tight">
            {r.lat.toFixed(4)}, {r.lon.toFixed(4)}
          </p>
          {r.mainLat !== undefined && r.mainLon !== undefined && (
            <p className="mt-1 text-sm">
              Centre of the largest piece of land only ({Math.round((r.mainShare ?? 0) * 100)}% of the area): {r.mainLat.toFixed(4)}, {r.mainLon.toFixed(4)}
            </p>
          )}
        </div>
        <div className="p-4">
          <TileMap
            ariaLabel={`Map of the geographic centre of ${r.name}`}
            markers={[{ lat: r.lat, lon: r.lon, label: "All land" }, ...(r.mainLat !== undefined && r.mainLon !== undefined ? [{ lat: r.mainLat, lon: r.mainLon, color: "#c2410c", label: "Largest part" }] : [])]}
            fitKey={`${kind}${r.id}`}
            maxFitZoom={6}
            height={340}
          />
          <p className="mt-3 text-sm text-[var(--color-muted)]">
            {r.parts > 1 ? `${r.name} is made of ${r.parts} separate pieces of land in this data; the first point weights all of them by area, so far-off islands pull it. ` : ""}
            This is the area-weighted centre (the centroid on the globe) of the {kind === "states" ? "state's" : "country's"} land outline. Official &ldquo;geographic centre&rdquo; markers can differ by
            many kilometres because agencies used other methods (the classic one balances a flat cut-out of the shape on a pin).
          </p>
          <p className="mt-3 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
            Computed for this site from{" "}
            {kind === "states" ? <Ext href={CB_URL}>Census Bureau 2024 cartographic boundaries (1:500,000)</Ext> : <Ext href={NE10_URL}>Natural Earth 1:10m Admin 0 countries</Ext>}: each shape
            cut into 3,000 strips of latitude and integrated exactly on a sphere, then the mean surface vector turned back into latitude and longitude. Country boundaries follow Natural
            Earth&apos;s de facto lines.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function GeoCenterTool() {
  const [mode, setMode] = useState<"points" | "region">("points");
  const tab = (m: typeof mode, label: string) => (
    <button type="button" onClick={() => setMode(m)} aria-pressed={mode === m} className={`rounded-md border px-4 py-2 text-sm font-medium ${mode === m ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]" : "border-[var(--color-line)] bg-white"}`}>
      {label}
    </button>
  );
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {tab("points", "Centre of my points")}
        {tab("region", "Centre of a state or country")}
      </div>
      {mode === "points" ? <PointsMode /> : <RegionMode />}
    </div>
  );
}
