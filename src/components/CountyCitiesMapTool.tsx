"use client";

import { useEffect, useMemo, useState } from "react";
import TileMap, { type MapShape } from "./TileMap";
import { ErrorBox, Ext, Loading, n0 } from "./GeoBits";
import { fieldClass } from "./CalcBits";
import { pointInRings } from "@/lib/polygon-area";
import { ACS_SF_URL, DATA_VINTAGE, GAZETTEER_URL, loadCounties, loadPlaces, placeLabel, US_STATES, type County, type Place } from "@/lib/us-data";
import { CENSUS_CB_URL } from "@/lib/projected";
import { asToolError } from "@/lib/errors";
import type { LatLon } from "@/lib/geodesy";

const FIPS: Record<string, string> = {
  AL: "01", AK: "02", AZ: "04", AR: "05", CA: "06", CO: "08", CT: "09", DE: "10", DC: "11", FL: "12", GA: "13", HI: "15", ID: "16", IL: "17", IN: "18", IA: "19", KS: "20", KY: "21",
  LA: "22", ME: "23", MD: "24", MA: "25", MI: "26", MN: "27", MS: "28", MO: "29", MT: "30", NE: "31", NV: "32", NH: "33", NJ: "34", NM: "35", NY: "36", NC: "37", ND: "38", OH: "39",
  OK: "40", OR: "41", PA: "42", RI: "44", SC: "45", SD: "46", TN: "47", TX: "48", UT: "49", VT: "50", VA: "51", WA: "53", WV: "54", WI: "55", WY: "56", PR: "72",
};

interface CountyShape {
  id: string;
  name: string;
  polys: LatLon[][][];
  bbox: [number, number, number, number];
  label: LatLon;
}

async function loadState(st: string): Promise<CountyShape[]> {
  const r = await fetch(`/data/geo/counties/${FIPS[st]}.json`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const j = (await r.json()) as { counties: { id: string; name: string; geometry: { type: string; coordinates: number[][][] | number[][][][] } }[] };
  return j.counties.map((c) => {
    const raw = (c.geometry.type === "Polygon" ? [c.geometry.coordinates] : c.geometry.coordinates) as number[][][][];
    const polys = raw.map((poly) => poly.map((ring) => ring.map(([lon, lat]) => ({ lat, lon }))));
    const all = polys.flat(2);
    const bbox: [number, number, number, number] = [Math.min(...all.map((p) => p.lon)), Math.min(...all.map((p) => p.lat)), Math.max(...all.map((p) => p.lon)), Math.max(...all.map((p) => p.lat))];
    // Label at the vertex-average of the largest ring, moved to the bbox centre when that falls outside.
    const big = polys.reduce((a, b) => (b[0].length > a[0].length ? b : a))[0];
    let label = { lat: big.reduce((s, p) => s + p.lat, 0) / big.length, lon: big.reduce((s, p) => s + p.lon, 0) / big.length };
    if (!polys.some((p) => pointInRings(label, p))) label = { lat: (bbox[1] + bbox[3]) / 2, lon: (bbox[0] + bbox[2]) / 2 };
    return { id: c.id, name: c.name, polys, bbox, label };
  });
}

function countyOf(p: LatLon, shapes: CountyShape[]): CountyShape | null {
  return shapes.find((c) => p.lon >= c.bbox[0] && p.lon <= c.bbox[2] && p.lat >= c.bbox[1] && p.lat <= c.bbox[3] && c.polys.some((poly) => pointInRings(p, poly))) ?? null;
}

export default function CountyCitiesMapTool() {
  const [st, setSt] = useState("OH");
  const [shapes, setShapes] = useState<CountyShape[] | null>(null);
  const [places, setPlaces] = useState<Place[] | null>(null);
  const [stats, setStats] = useState<Map<string, County> | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [minPop, setMinPop] = useState("25000");
  const [labels, setLabels] = useState(true);
  const [sel, setSel] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([loadPlaces(), loadCounties()]).then(
      ([p, c]) => {
        setPlaces(p);
        setStats(new Map(c.map((x) => [x.fips, x])));
      },
      (e) => setErr(asToolError(e).message),
    );
  }, []);
  useEffect(() => {
    setShapes(null);
    setSel(null);
    loadState(st).then(setShapes, (e) => setErr(asToolError(e).message));
  }, [st]);

  const inState = useMemo(() => {
    if (!places || !shapes) return null;
    const list = places.filter((p) => p.state === st);
    const byCounty = new Map<string, Place[]>();
    for (const p of list) {
      const c = countyOf(p, shapes);
      if (!c) continue;
      if (!byCounty.has(c.id)) byCounty.set(c.id, []);
      byCounty.get(c.id)!.push(p);
    }
    for (const v of byCounty.values()) v.sort((a, b) => (b.pop ?? 0) - (a.pop ?? 0));
    return { list, byCounty };
  }, [places, shapes, st]);

  if (err) return <ErrorBox title="The map data did not load" message={err} onRetry={() => location.reload()} />;
  const mp = Number(minPop) || 0;
  const shown = inState ? inState.list.filter((p) => (p.pop ?? 0) >= mp) : [];
  const mapShapes: MapShape[] = shapes
    ? shapes.flatMap((c) => c.polys.map((poly) => ({ points: poly[0], more: poly.slice(1), fill: true, color: c.id === sel ? "#c2410c" : "#334155", fillOpacity: c.id === sel ? 0.25 : 0.04, width: c.id === sel ? 2.5 : 1 })))
    : [];
  const selShape = shapes?.find((c) => c.id === sel);
  const selStats = sel ? stats?.get(sel) : null;
  const selCities = sel ? (inState?.byCounty.get(sel) ?? []) : [];

  return (
    <div>
      <div className="mb-3 grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1.5 block font-medium">State</span>
          <select className={fieldClass} value={st} onChange={(e) => setSt(e.target.value)}>
            {Object.keys(FIPS)
              .sort((a, b) => US_STATES[a].localeCompare(US_STATES[b]))
              .map((s) => (
                <option key={s} value={s}>
                  {US_STATES[s]}
                </option>
              ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block font-medium">Show cities with at least</span>
          <select className={fieldClass} value={minPop} onChange={(e) => setMinPop(e.target.value)}>
            {["0", "1000", "5000", "10000", "25000", "50000", "100000"].map((v) => (
              <option key={v} value={v}>
                {v === "0" ? "Every place" : `${n0(Number(v))} people`}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-end gap-2 pb-3 text-sm">
          <input type="checkbox" checked={labels} onChange={(e) => setLabels(e.target.checked)} />
          Show county names
        </label>
      </div>
      {!shapes || !inState ? (
        <Loading note="Loading county outlines and Census places…" />
      ) : (
        <>
          <TileMap
            ariaLabel={`Map of ${US_STATES[st]} counties with cities. Click a county for its cities.`}
            shapes={mapShapes}
            markers={shown.slice(0, 600).map((p) => ({ lat: p.lat, lon: p.lon, r: (p.pop ?? 0) >= 100000 ? 5 : 3.5, color: "#1d4ed8", label: shown.length <= 60 ? p.name : undefined }))}
            fitKey={st}
            maxFitZoom={9}
            height={520}
            onPick={(p) => setSel(countyOf(p, shapes)?.id ?? null)}
            overlay={(px) =>
              labels ? (
                <g>
                  {shapes.map((c) => {
                    const [x, y] = px(c.label);
                    return (
                      <text key={c.id} x={x} y={y} fontSize={10} textAnchor="middle" fill="#334155" stroke="white" strokeWidth={2.5} paintOrder="stroke">
                        {c.name.replace(/ (County|Parish|Borough|Census Area|Municipality|City and Borough|Planning Region)$/, "")}
                      </text>
                    );
                  })}
                </g>
              ) : null
            }
          />
          <p className="mt-1.5 text-xs text-[var(--color-muted)]">
            {shapes.length} {st === "LA" ? "parishes" : "counties"} · {shown.length} places shown. Click a county to list its cities and towns.
          </p>
          {selShape && (
            <div className="mt-4 rounded-lg border border-[var(--color-line)]">
              <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-4">
                <p className="text-xl font-semibold">
                  {selShape.name}, {US_STATES[st]}
                </p>
                <p className="text-sm text-[var(--color-muted)]">
                  Population {selStats?.pop === null || !selStats ? "—" : n0(selStats.pop)} · {selCities.length} Census place{selCities.length === 1 ? "" : "s"} with their centre inside
                </p>
              </div>
              <div className="max-h-80 overflow-auto">
                <table className="w-full text-left text-sm">
                  <tbody className="divide-y divide-[var(--color-line)]">
                    {selCities.map((p) => (
                      <tr key={p.geoid}>
                        <td className="px-3 py-1.5">{placeLabel(p)}</td>
                        <td className="px-3 py-1.5">{p.kind}</td>
                        <td className="px-3 py-1.5">{p.pop === null ? "—" : n0(p.pop)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <details className="mt-4 rounded-lg border border-[var(--color-line)] p-3 text-sm">
            <summary className="cursor-pointer font-medium">Every county in {US_STATES[st]} with its largest city</summary>
            <table className="mt-2 w-full text-left">
              <tbody className="divide-y divide-[var(--color-line)]">
                {[...shapes]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((c) => {
                    const top = inState.byCounty.get(c.id)?.[0];
                    return (
                      <tr key={c.id}>
                        <td className="px-2 py-1">
                          <button type="button" className="underline" onClick={() => setSel(c.id)}>
                            {c.name}
                          </button>
                        </td>
                        <td className="px-2 py-1">{top ? `${top.name} (${top.pop === null ? "—" : n0(top.pop)})` : "—"}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </details>
        </>
      )}
      <p className="mt-3 text-xs text-[var(--color-muted)]">
        County outlines: <Ext href={CENSUS_CB_URL}>Census Bureau 2024 cartographic boundaries</Ext> (1:500,000, simplified). Cities and towns: every incorporated place and Census
        Designated Place in the <Ext href={GAZETTEER_URL}>2024 Gazetteer</Ext>, shown at its internal point and assigned to the county that point falls in (a city spanning several counties is
        listed once). Populations: <Ext href={ACS_SF_URL}>ACS</Ext> ({DATA_VINTAGE}). Map tiles: OpenStreetMap.
      </p>
    </div>
  );
}
