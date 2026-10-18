"use client";

import { useEffect, useMemo, useState } from "react";
import LocationPicker, { type PickedLocation } from "./LocationPicker";
import TileMap from "./TileMap";
import { ErrorBox, Ext, Loading, n, n0, where } from "./GeoBits";
import { Btn } from "./ToolBits";
import { fieldClass } from "./CalcBits";
import CopyRow from "./CopyRow";
import { circlePoints } from "@/lib/geodesy";
import { ACS_SF_URL, DATA_VINTAGE, GAZETTEER_URL, loadPlaces, loadTracts, loadZctas, placeLabel, withinRadius, zipIndex, ZCTA_URL, type Place, type Tract, type Zcta } from "@/lib/us-data";
import { toCsv } from "@/lib/geo-formats";
import { downloadText } from "@/lib/svg-export";
import { asToolError } from "@/lib/errors";

export type RadiusMode = "zip" | "city" | "pop";
type Unit = "mi" | "km";
const M = { mi: 1609.344, km: 1000 };
const COLORS = ["#1d4ed8", "#c2410c", "#7c3aed", "#15803d"];

interface Data {
  zctas?: Zcta[];
  places?: Place[];
  tracts?: Tract[];
}

const money = (x: number | null) => (x === null ? "—" : `$${n0(x)}`);

export default function RadiusListTool({ mode }: { mode: RadiusMode }) {
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [centre, setCentre] = useState<PickedLocation | null>(null);
  const [radius, setRadius] = useState(mode === "pop" ? "1, 3, 5" : "10");
  const [unit, setUnit] = useState<Unit>("mi");
  const [minPop, setMinPop] = useState("0");
  const [incOnly, setIncOnly] = useState(false);
  const [zipIn, setZipIn] = useState("");
  const [zipMsg, setZipMsg] = useState<string | null>(null);

  useEffect(() => {
    const need = mode === "pop" ? Promise.all([loadTracts()]).then(([tracts]) => ({ tracts })) : mode === "city" ? loadPlaces().then((places) => ({ places })) : loadZctas().then((zctas) => ({ zctas }));
    // ZIP lookups for the centre are offered in every mode.
    Promise.all([need, mode === "zip" ? Promise.resolve(null) : loadZctas().catch(() => null)]).then(
      ([d, z]) => setData({ ...d, ...(z ? { zctas: z } : {}) }),
      (e) => setErr(asToolError(e).message),
    );
  }, [mode]);

  const radii = radius
    .split(/[,\s]+/)
    .map(Number)
    .filter((x) => Number.isFinite(x) && x > 0)
    .slice(0, mode === "pop" ? 4 : 1);
  const maxR = mode === "pop" ? 100 : 250;
  const okR = radii.length > 0 && radii.every((r) => r * M[unit] <= maxR * 1609.344);
  const outer = okR ? Math.max(...radii) * M[unit] : 0;

  const result = useMemo(() => {
    if (!data || !centre || !okR) return null;
    if (mode === "zip") return { zips: withinRadius(data.zctas ?? [], centre, outer) };
    if (mode === "city") {
      const mp = Number(minPop) || 0;
      return { cities: withinRadius(data.places ?? [], centre, outer).filter((p) => (p.pop ?? 0) >= mp && (!incOnly || (p.kind !== "CDP" && p.kind !== ""))) };
    }
    const hits = withinRadius(data.tracts ?? [], centre, outer);
    return {
      rings: [...radii].sort((a, b) => a - b).map((r) => {
        const m = r * M[unit];
        const ts = hits.filter((t) => t.metres <= m);
        const pop = ts.reduce((s, t) => s + t.pop, 0);
        // Spherical cap area of the circle.
        const R = 6_371_008.8;
        const cap = 2 * Math.PI * R * R * (1 - Math.cos(m / R));
        return { r, m, pop, tracts: ts.length, capM2: cap };
      }),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, centre, radius, unit, minPop, incOnly, mode]);

  function fromZip() {
    setZipMsg(null);
    const z = data?.zctas ? zipIndex(data.zctas).get(zipIn.trim().slice(0, 5)) : null;
    if (!z) return setZipMsg("That ZIP code has no ZIP Code Tabulation Area (PO-box-only or not in use).");
    setCentre({ lat: z.lat, lon: z.lon, label: `ZIP ${z.zip}`, source: "search" });
  }

  if (err) return <ErrorBox title="The data file did not load" message={err} onRetry={() => location.reload()} />;
  if (!data) return <Loading note={`Loading Census ${mode === "zip" ? "ZIP code areas" : mode === "city" ? "places" : "tracts"}…`} />;

  const ringShapes = okR && centre ? [...radii].sort((a, b) => b - a).map((r, i) => ({ points: circlePoints(centre, r * M[unit], 120), fill: true, color: COLORS[(radii.length - 1 - i) % COLORS.length], fillOpacity: 0.08 })) : [];
  const csv = () => {
    if (!result || !centre) return;
    if (result.zips) downloadText(toCsv([["zip", `distance_${unit}`, "population", "median_household_income", "latitude", "longitude"], ...result.zips.map((z) => [z.zip, (z.metres / M[unit]).toFixed(2), z.pop ?? "", z.income ?? "", z.lat, z.lon])]), "zip-codes-in-radius.csv", "text/csv");
    if (result.cities) downloadText(toCsv([["place", "state", "type", `distance_${unit}`, "population", "latitude", "longitude"], ...result.cities.map((c) => [c.name, c.state, c.kind, (c.metres / M[unit]).toFixed(2), c.pop ?? "", c.lat, c.lon])]), "cities-in-radius.csv", "text/csv");
  };

  return (
    <div>
      <div className="mb-3 grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1.5 block font-medium">{mode === "pop" ? "Radii (up to 4)" : "Radius"}</span>
          <input className={fieldClass} value={radius} onChange={(e) => setRadius(e.target.value)} inputMode="decimal" />
        </label>
        <label className="block">
          <span className="mb-1.5 block font-medium">Unit</span>
          <select className={fieldClass} value={unit} onChange={(e) => setUnit(e.target.value as Unit)}>
            <option value="mi">Miles</option>
            <option value="km">Kilometres</option>
          </select>
        </label>
        <div>
          <span className="mb-1.5 block font-medium">Or centre on a ZIP code</span>
          <div className="flex gap-2">
            <input className={fieldClass} value={zipIn} onChange={(e) => setZipIn(e.target.value)} inputMode="numeric" placeholder="e.g. 60614" />
            <Btn onClick={fromZip}>Go</Btn>
          </div>
        </div>
      </div>
      {!okR && <p className="mb-3 text-sm">Enter {mode === "pop" ? "one to four radii" : "a radius"} up to {maxR} miles.</p>}
      {zipMsg && <p className="mb-3 text-sm">{zipMsg}</p>}
      {mode === "city" && (
        <div className="mb-3 flex flex-wrap items-end gap-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Minimum population</span>
            <input className={`${fieldClass} w-40`} value={minPop} onChange={(e) => setMinPop(e.target.value)} inputMode="numeric" />
          </label>
          <label className="flex items-center gap-2 pb-3 text-sm">
            <input type="checkbox" checked={incOnly} onChange={(e) => setIncOnly(e.target.checked)} />
            Incorporated cities and towns only (leave out Census Designated Places)
          </label>
        </div>
      )}
      <LocationPicker onPick={setCentre} deviceLabel="Use my location" label="Centre: address, place or coordinates" placeholder="Address, city or 40.7484, -73.9857" />

      {centre && result && (
        <div className="mb-4 rounded-lg border border-[var(--color-line)]">
          <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
            <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">Within {radii.map((r) => `${n(r, r % 1 ? 1 : 0)} ${unit}`).join(" / ")} of {where(centre, centre.source)}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">
              {result.zips && `${n0(result.zips.length)} ZIP codes`}
              {result.cities && `${n0(result.cities.length)} cities and towns`}
              {result.rings && `${n0(result.rings[result.rings.length - 1].pop)} people`}
            </p>
            {result.zips && <p className="mt-1 text-sm text-[var(--color-muted)]">{n0(result.zips.reduce((s, z) => s + (z.pop ?? 0), 0))} people live in these ZIP areas in total</p>}
          </div>
          <div className="p-4 text-sm">
            {result.zips && result.zips.length > 0 && (
              <table className="mb-3 w-full text-sm">
                <tbody>
                  <CopyRow label="ZIP list" value={result.zips.map((z) => z.zip).join(", ")} />
                </tbody>
              </table>
            )}
            {result.rings && (
              <div className="mb-3 overflow-x-auto rounded-md border border-[var(--color-line)]">
                <table className="w-full text-left">
                  <thead className="bg-[var(--color-accent-soft)]">
                    <tr>
                      <th className="px-3 py-2 font-medium">Radius</th>
                      <th className="px-3 py-2 font-medium">Population</th>
                      <th className="px-3 py-2 font-medium">Circle area</th>
                      <th className="px-3 py-2 font-medium">People per sq mi</th>
                      <th className="px-3 py-2 font-medium">Tracts counted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-line)]">
                    {result.rings.map((r) => (
                      <tr key={r.r}>
                        <td className="px-3 py-2">
                          {n(r.r, r.r % 1 ? 1 : 0)} {unit}
                        </td>
                        <td className="px-3 py-2 font-semibold">{n0(r.pop)}</td>
                        <td className="px-3 py-2">{n(r.capM2 / 2_589_988.11, 1)} sq mi</td>
                        <td className="px-3 py-2">{n0(r.pop / (r.capM2 / 2_589_988.11))}</td>
                        <td className="px-3 py-2">{r.tracts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {(result.zips || result.cities) && (
              <>
                <div className="mb-2">
                  <Btn onClick={csv}>Download CSV</Btn>
                </div>
                <div className="max-h-96 overflow-auto rounded-md border border-[var(--color-line)]">
                  <table className="w-full text-left">
                    <thead className="sticky top-0 bg-white">
                      <tr className="border-b border-[var(--color-line)]">
                        <th className="px-3 py-2 font-medium">{result.zips ? "ZIP" : "Place"}</th>
                        <th className="px-3 py-2 font-medium">Distance</th>
                        <th className="px-3 py-2 font-medium">Population</th>
                        <th className="px-3 py-2 font-medium">{result.zips ? "Median household income" : "Type"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-line)]">
                      {(result.zips ?? []).slice(0, 1000).map((z) => (
                        <tr key={z.zip}>
                          <td className="px-3 py-1.5 font-mono">{z.zip}</td>
                          <td className="px-3 py-1.5">{n(z.metres / M[unit], 1)} {unit}</td>
                          <td className="px-3 py-1.5">{z.pop === null ? "—" : n0(z.pop)}</td>
                          <td className="px-3 py-1.5">{money(z.income)}</td>
                        </tr>
                      ))}
                      {(result.cities ?? []).slice(0, 1000).map((c) => (
                        <tr key={c.geoid}>
                          <td className="px-3 py-1.5">{placeLabel(c)}</td>
                          <td className="px-3 py-1.5">{n(c.metres / M[unit], 1)} {unit}</td>
                          <td className="px-3 py-1.5">{c.pop === null ? "—" : n0(c.pop)}</td>
                          <td className="px-3 py-1.5">{c.kind || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
            <p className="mt-3 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
              {mode === "zip" && (
                <>
                  A ZIP is listed when its ZIP Code Tabulation Area&apos;s internal point is inside the circle (<Ext href={ZCTA_URL}>about ZCTAs</Ext>); a large rural ZIP can overlap the circle
                  without being listed. Points and land area: <Ext href={GAZETTEER_URL}>Census 2024 Gazetteer</Ext>; population and income: <Ext href={ACS_SF_URL}>ACS</Ext> ({DATA_VINTAGE}).
                </>
              )}
              {mode === "city" && (
                <>
                  A place is listed when its Census internal point is inside the circle — every incorporated place and Census Designated Place in the{" "}
                  <Ext href={GAZETTEER_URL}>Census 2024 Gazetteer</Ext>, with <Ext href={ACS_SF_URL}>ACS</Ext> population ({DATA_VINTAGE}).
                </>
              )}
              {mode === "pop" && (
                <>
                  Population: the sum of Census tracts whose internal point lies inside each circle (<Ext href={GAZETTEER_URL}>2024 Gazetteer</Ext> points; <Ext href={ACS_SF_URL}>ACS</Ext> 2019–2023 5-year population). Tracts hold about 1,200–8,000 people, so for small radii the edge tracts make this rough; treat it as an estimate. Circle area: spherical cap.
                </>
              )}{" "}
              Distances: straight lines on WGS84. Calculated in your browser.
            </p>
          </div>
        </div>
      )}
      <TileMap
        ariaLabel="Map of the radius and what lies inside it. Click to move the centre."
        markers={[
          ...(centre ? [{ lat: centre.lat, lon: centre.lon, color: "#111" }] : []),
          ...(result?.zips ?? []).slice(0, 400).map((z) => ({ lat: z.lat, lon: z.lon, r: 3.5 })),
          ...(result?.cities ?? []).slice(0, 400).map((c) => ({ lat: c.lat, lon: c.lon, r: 3.5, label: result!.cities!.length <= 30 ? c.name : undefined })),
        ]}
        shapes={ringShapes}
        fitKey={centre ? `${centre.lat},${centre.lon},${radius},${unit}` : ""}
        initial={{ lat: 39, lon: -96, zoom: 3 }}
        maxFitZoom={13}
        height={420}
        onPick={(p) => setCentre({ ...p, label: `Map point ${p.lat.toFixed(4)}, ${p.lon.toFixed(4)}`, source: "map" })}
      />
      <p className="mt-1.5 text-xs text-[var(--color-muted)]">Click the map to move the centre.</p>
    </div>
  );
}
