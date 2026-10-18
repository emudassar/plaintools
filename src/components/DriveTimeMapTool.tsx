"use client";

import { useRef, useState } from "react";
import LocationPicker, { type PickedLocation } from "./LocationPicker";
import TileMap, { type MapShape } from "./TileMap";
import { ErrorBox, Ext, Loading, n, n0, where } from "./GeoBits";
import { fieldClass } from "./CalcBits";
import { COSTING_LABEL, FOSSGIS_ABOUT_URL, isochrones, VALHALLA_DOCS_URL, type IsoCosting, type Isochrone } from "@/lib/routing";
import { pointInRings, sphericalArea, SQM } from "@/lib/polygon-area";
import { ACS_SF_URL, GAZETTEER_URL, loadTracts, withinRadius, DATA_VINTAGE } from "@/lib/us-data";
import { asToolError } from "@/lib/errors";
import { inverse, type LatLon } from "@/lib/geodesy";

const COLORS = ["#1d4ed8", "#7c3aed", "#c2410c", "#15803d"];

interface Zone extends Isochrone {
  areaM2: number;
  people: number | null;
}

/** Population from Census tract points that fall inside the zone (US only). */
async function peopleIn(centre: LatLon, iso: Isochrone): Promise<number | null> {
  const pts = iso.polygons.flatMap((p) => p[0]);
  const far = Math.max(...pts.map((p) => inverse(centre, p).metres));
  const tracts = withinRadius(await loadTracts(), centre, far + 1000);
  if (!tracts.length) return null;
  let sum = 0;
  for (const t of tracts) if (iso.polygons.some((poly) => pointInRings(t, poly))) sum += t.pop;
  return sum;
}

const isUS = (p: LatLon) => (p.lat > 18 && p.lat < 72 && p.lon > -180 && p.lon < -64) || (p.lat > 17.8 && p.lat < 18.6 && p.lon > -67.4 && p.lon < -65.2);

export default function DriveTimeMapTool() {
  const [costing, setCosting] = useState<IsoCosting>("auto");
  const [mins, setMins] = useState("10, 20, 30");
  const [state, setState] = useState<{ phase: "idle" } | { phase: "loading"; loc: PickedLocation } | { phase: "error"; loc: PickedLocation; message: string } | { phase: "ok"; loc: PickedLocation; zones: Zone[]; costing: IsoCosting }>({ phase: "idle" });
  const seq = useRef(0);

  const parsed = mins
    .split(/[,\s]+/)
    .map(Number)
    .filter((x) => Number.isFinite(x) && x > 0);
  const valid = parsed.length > 0 && parsed.length <= 4 && parsed.every((x) => x <= 60 && Number.isInteger(x));

  async function run(loc: PickedLocation) {
    if (!valid) return;
    const id = ++seq.current;
    setState({ phase: "loading", loc });
    try {
      const iso = await isochrones(loc, [...new Set(parsed)], costing);
      const zones: Zone[] = [];
      for (const z of iso) {
        const areaM2 = z.polygons.reduce((s, poly) => s + sphericalArea(poly[0]) - poly.slice(1).reduce((h, ring) => h + sphericalArea(ring), 0), 0);
        let people: number | null = null;
        if (isUS(loc)) people = await peopleIn(loc, z).catch(() => null);
        zones.push({ ...z, areaM2, people });
      }
      if (id === seq.current) setState({ phase: "ok", loc, zones, costing });
    } catch (e) {
      if (id === seq.current) setState({ phase: "error", loc, message: asToolError(e).message });
    }
  }

  const loc = state.phase === "idle" ? null : state.loc;
  const shapes: MapShape[] =
    state.phase === "ok"
      ? state.zones.flatMap((z, i) => z.polygons.map((poly) => ({ points: poly[0], more: poly.slice(1), fill: true, color: COLORS[(state.zones.length - 1 - i) % COLORS.length], fillOpacity: 0.15, width: 2 })))
      : [];
  return (
    <div>
      <div className="mb-3 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block font-medium">Travel by</span>
          <select className={fieldClass} value={costing} onChange={(e) => setCosting(e.target.value as IsoCosting)}>
            {(Object.keys(COSTING_LABEL) as IsoCosting[]).map((c) => (
              <option key={c} value={c}>
                {COSTING_LABEL[c]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block font-medium">Minutes (up to 4 values, max 60)</span>
          <input className={fieldClass} value={mins} onChange={(e) => setMins(e.target.value)} />
          {!valid && <span className="mt-1 block text-xs">Enter 1–4 whole numbers of minutes, each 60 or less.</span>}
        </label>
      </div>
      <LocationPicker onPick={(l) => void run(l)} preferUS={false} deviceLabel="Start from my location" busy={state.phase === "loading"} label="Starting point" placeholder="Address, place or coordinates" />
      <div aria-live="polite">
        {state.phase === "loading" && <Loading note="Calculating how far you can get… this can take a few seconds." />}
        {state.phase === "error" && <ErrorBox title="No travel-time map" message={state.message} onRetry={() => void run(state.loc)} />}
      </div>
      {state.phase === "ok" && (
        <div className="mb-4 rounded-lg border border-[var(--color-line)]">
          <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
            <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
              {COSTING_LABEL[state.costing]} time from {where(state.loc, state.loc.source)}
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">
              {n(state.zones[0].areaM2 / SQM.sqmi, 0)} sq mi reachable in {state.zones[0].minutes} min
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-line)]">
                  <th className="px-3 py-2 font-medium">Within</th>
                  <th className="px-3 py-2 font-medium">Area</th>
                  {state.zones.some((z) => z.people !== null) && <th className="px-3 py-2 font-medium">People living there (approx.)</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-line)]">
                {[...state.zones].reverse().map((z, i) => (
                  <tr key={z.minutes}>
                    <td className="px-3 py-2">
                      <span className="mr-2 inline-block h-3 w-3 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
                      {z.minutes} minutes
                    </td>
                    <td className="px-3 py-2">
                      {n(z.areaM2 / SQM.sqmi, 1)} sq mi ({n(z.areaM2 / SQM.sqkm, 1)} km²)
                    </td>
                    {state.zones.some((x) => x.people !== null) && <td className="px-3 py-2">{z.people === null ? "—" : n0(z.people)}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="border-t border-[var(--color-line)] px-4 py-3 text-xs text-[var(--color-muted)]">
            Reachable areas: Valhalla isochrones on the FOSSGIS server (<Ext href={FOSSGIS_ABOUT_URL}>routing.openstreetmap.de</Ext>, <Ext href={VALHALLA_DOCS_URL}>API</Ext>) over
            OpenStreetMap roads and paths, at typical speeds with no traffic, smoothed by the service. Areas: measured on the WGS84 ellipsoid.
            {state.zones.some((z) => z.people !== null) && (
              <>
                {" "}
                People: sum of Census tracts whose internal point falls inside each zone (<Ext href={GAZETTEER_URL}>Gazetteer</Ext>, <Ext href={ACS_SF_URL}>ACS</Ext> ({DATA_VINTAGE})) — an
                estimate, since tracts on the edge count wholly in or out.
              </>
            )}
          </p>
        </div>
      )}
      <TileMap
        ariaLabel="Map of the areas reachable within each travel time. Click to start from another point."
        markers={loc ? [{ ...loc, color: "#111" }] : []}
        shapes={shapes}
        fitKey={state.phase === "ok" ? `${state.loc.lat},${state.loc.lon},${state.zones.map((z) => z.minutes).join()}` : loc ? `${loc.lat},${loc.lon}` : ""}
        initial={{ lat: 39, lon: -96, zoom: 3 }}
        maxFitZoom={12}
        height={440}
        onPick={(p) => void run({ ...p, label: `Map point ${p.lat.toFixed(4)}, ${p.lon.toFixed(4)}`, source: "map" })}
      />
      <p className="mt-1.5 text-xs text-[var(--color-muted)]">Click the map to start from that point instead.</p>
    </div>
  );
}
