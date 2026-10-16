"use client";

import { useId, useState } from "react";
import TileMap from "./TileMap";
import { ErrorBox, Ext, Headline, Loading } from "./GeoBits";
import { MATHWORLD_URL, randomPoints, seaLevelFlags, type RandomArea } from "@/lib/random-location";
import { geocodeAddress, parseCoordinates, reverseGeocode } from "@/lib/geocode";
import { formatLatLon, METRES_PER, type LatLon } from "@/lib/geodesy";
import { asToolError } from "@/lib/errors";
import { OPEN_METEO_DOCS_URL } from "@/lib/elevation";

type Mode = "world" | "box" | "radius";

interface Result {
  points: (LatLon & { name?: string | null })[];
  skipped: number;
  shortfall: number;
  area: RandomArea;
  filtered: boolean;
}

type State = { phase: "idle" } | { phase: "loading"; note: string } | { phase: "error"; message: string } | { phase: "result"; data: Result };

const NAME_LIMIT = 5;
const ROUNDS = 6;

export default function RandomLocationTool() {
  const [mode, setMode] = useState<Mode>("world");
  const [count, setCount] = useState("1");
  const [avoidSea, setAvoidSea] = useState(true);
  const [box, setBox] = useState({ south: "24.5", north: "49.4", west: "-124.8", east: "-66.9" });
  const [centre, setCentre] = useState("");
  const [radius, setRadius] = useState("25");
  const [unit, setUnit] = useState<"mi" | "km">("mi");
  const [state, setState] = useState<State>({ phase: "idle" });
  const [fitKey, setFitKey] = useState("");
  const ids = { c: useId(), r: useId(), u: useId(), n: useId(), s: useId(), no: useId(), w: useId(), e: useId(), sea: useId() };

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const want = Number(count);
      let area: RandomArea;
      if (mode === "world") area = { kind: "world" };
      else if (mode === "box") area = { kind: "box", south: Number(box.south), north: Number(box.north), west: Number(box.west), east: Number(box.east) };
      else {
        if (!centre.trim()) throw new Error("Enter a centre place or coordinates for the radius.");
        setState({ phase: "loading", note: "Finding the centre…" });
        const c = parseCoordinates(centre) ?? (await geocodeAddress(centre, { preferUS: false }));
        area = { kind: "radius", centre: { lat: c.lat, lon: c.lon }, radiusM: Number(radius) * METRES_PER[unit] };
      }
      // Validates count and area before any network call.
      let points = randomPoints(area, want);
      let skipped = 0;
      if (avoidSea) {
        setState({ phase: "loading", note: "Checking the points against elevation data to skip open sea…" });
        const kept: LatLon[] = [];
        for (let round = 0; round < ROUNDS && kept.length < want; round++) {
          const batch = round === 0 ? points : randomPoints(area, Math.min(100, Math.max(10, (want - kept.length) * 3)));
          const sea = await seaLevelFlags(batch);
          batch.forEach((p, i) => {
            if (sea[i]) skipped++;
            else if (kept.length < want) kept.push(p);
          });
        }
        points = kept;
      }
      setState({ phase: "loading", note: "Naming the nearest places…" });
      const named = await Promise.all(
        points.map(async (p, i) => ({ ...p, name: i < NAME_LIMIT ? await reverseGeocode(p.lat, p.lon) : undefined })),
      );
      setState({ phase: "result", data: { points: named, skipped, shortfall: want - points.length, area, filtered: avoidSea } });
      setFitKey(`${Date.now()}`);
    } catch (err) {
      setState({ phase: "error", message: err instanceof Error && !("kind" in err) ? err.message : asToolError(err).message });
    }
  }

  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";
  const data = state.phase === "result" ? state.data : null;
  const csv = data ? "latitude,longitude\n" + data.points.map((p) => `${p.lat.toFixed(6)},${p.lon.toFixed(6)}`).join("\n") : "";

  return (
    <div>
      <form onSubmit={generate} className="mb-5">
        <fieldset className="mb-3">
          <legend className="mb-1.5 font-medium">Where</legend>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["world", "Anywhere on Earth"],
                ["box", "Inside a lat/lon box"],
                ["radius", "Within a radius of a place"],
              ] as const
            ).map(([v, l]) => (
              <label key={v} className={`cursor-pointer rounded-md border px-3 py-2 text-sm ${mode === v ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]" : "border-[var(--color-line)]"}`}>
                <input type="radio" name="mode" value={v} checked={mode === v} onChange={() => setMode(v)} className="mr-1.5" />
                {l}
              </label>
            ))}
          </div>
        </fieldset>
        {mode === "box" && (
          <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(
              [
                ["south", "South latitude", ids.s],
                ["north", "North latitude", ids.no],
                ["west", "West longitude", ids.w],
                ["east", "East longitude", ids.e],
              ] as const
            ).map(([k, l, id]) => (
              <div key={k}>
                <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
                  {l}
                </label>
                <input id={id} type="number" step="any" value={box[k]} onChange={(e) => setBox({ ...box, [k]: e.target.value })} className={field} />
              </div>
            ))}
            <p className="col-span-2 text-xs text-[var(--color-muted)] sm:col-span-4">
              Default box: the contiguous United States (approximate). If west is greater than east, the box crosses the 180° line.
            </p>
          </div>
        )}
        {mode === "radius" && (
          <div className="mb-3 grid gap-3 sm:grid-cols-[1fr_8rem_7rem]">
            <div>
              <label htmlFor={ids.c} className="mb-1.5 block font-medium">
                Centre
              </label>
              <input id={ids.c} type="text" value={centre} onChange={(e) => setCentre(e.target.value)} placeholder="City, address or lat, lon" className={field} />
            </div>
            <div>
              <label htmlFor={ids.r} className="mb-1.5 block font-medium">
                Radius
              </label>
              <input id={ids.r} type="number" min="0" step="any" value={radius} onChange={(e) => setRadius(e.target.value)} className={field} />
            </div>
            <div>
              <label htmlFor={ids.u} className="mb-1.5 block font-medium">
                Unit
              </label>
              <select id={ids.u} value={unit} onChange={(e) => setUnit(e.target.value as "mi" | "km")} className={field}>
                <option value="mi">miles</option>
                <option value="km">km</option>
              </select>
            </div>
          </div>
        )}
        <div className="mb-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={ids.n} className="mb-1.5 block font-medium">
              How many points (1-100)
            </label>
            <input id={ids.n} type="number" min="1" max="100" step="1" value={count} onChange={(e) => setCount(e.target.value)} className={field} />
          </div>
          <label htmlFor={ids.sea} className="flex items-center gap-2 self-end pb-2.5 text-sm">
            <input id={ids.sea} type="checkbox" checked={avoidSea} onChange={(e) => setAvoidSea(e.target.checked)} />
            Skip open sea (uses elevation data)
          </label>
        </div>
        <button type="submit" disabled={state.phase === "loading"} className="w-full rounded-md bg-[var(--color-accent)] px-5 py-2.5 font-medium text-white disabled:opacity-50 sm:w-auto">
          {state.phase === "loading" ? "Generating…" : data ? "Generate again" : "Generate random location"}
        </button>
      </form>

      <div aria-live="polite">
        {state.phase === "loading" && <Loading note={state.note} />}
        {state.phase === "error" && <ErrorBox title="Could not generate points" message={state.message} />}
        {data && (
          <div className="rounded-lg border border-[var(--color-line)]">
            <Headline
              kicker={data.points.length === 1 ? "Random location" : `${data.points.length} random locations`}
              title={data.points[0] ? formatLatLon(data.points[0]) : "No point found"}
              sub={data.points[0]?.name ?? (data.points[0] ? "No named place nearby in OpenStreetMap" : undefined)}
            />
            <div className="p-5 text-sm">
              {data.shortfall > 0 && (
                <p className="mb-4 rounded-md border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-3">
                  Only {data.points.length} of the points requested landed off open sea after {ROUNDS} tries; this area is mostly water.
                </p>
              )}
              <ol className="mb-4 space-y-1">
                {data.points.map((p, i) => (
                  <li key={i} className="flex flex-wrap items-baseline justify-between gap-x-3 border-t border-[var(--color-line)] py-1.5">
                    <span className="font-mono text-xs sm:text-sm">
                      {p.lat.toFixed(6)}, {p.lon.toFixed(6)}
                    </span>
                    <span className="text-[var(--color-muted)]">
                      {p.name ?? (i < NAME_LIMIT ? "no named place nearby" : "")}{" "}
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${p.lat.toFixed(6)}&mlon=${p.lon.toFixed(6)}#map=10/${p.lat.toFixed(4)}/${p.lon.toFixed(4)}`}
                        target="_blank"
                        rel="noopener"
                        className="text-[var(--color-accent)] underline"
                      >
                        map
                      </a>
                    </span>
                  </li>
                ))}
              </ol>
              {data.points.length > 1 && (
                <details className="mb-4">
                  <summary className="cursor-pointer font-medium">Copy as CSV</summary>
                  <textarea readOnly value={csv} rows={Math.min(10, data.points.length + 1)} className="mt-2 w-full rounded-md border border-[var(--color-line)] p-2 font-mono text-xs" />
                </details>
              )}
              <p className="text-[var(--color-muted)]">
                Every square kilometre of the chosen area is equally likely. Picking latitude and longitude as plain random numbers would
                not do that — points would crowd near the poles — so latitude is chosen so that its sine, not the angle itself, is uniformly random.
                {data.filtered && ` ${data.skipped} candidate point${data.skipped === 1 ? " was" : "s were"} skipped because the Copernicus elevation model records 0 m there (open sea). That filter is approximate: some coasts and lakes also read 0 m, and inland water above sea level is not skipped.`}
              </p>
              <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
                <p>
                  Method: uniform sphere point picking (Wolfram MathWorld), randomness from your browser&rsquo;s Web Crypto API.
                  {data.filtered && " Sea filter: Copernicus DEM GLO-90 via Open-Meteo."} Nearest names: OpenStreetMap via Photon.
                </p>
                <p className="mt-1 flex flex-wrap gap-x-4">
                  <Ext href={MATHWORLD_URL}>MathWorld: Sphere Point Picking</Ext>
                  {data.filtered && <Ext href={OPEN_METEO_DOCS_URL}>Open-Meteo Elevation API</Ext>}
                </p>
              </footer>
            </div>
          </div>
        )}
      </div>
      {data && data.points.length > 0 && (
        <div className="mt-4">
          <TileMap
            ariaLabel="Map of the random points."
            markers={data.points.map((p, i) => ({ lat: p.lat, lon: p.lon, label: data.points.length > 1 && data.points.length <= 20 ? String(i + 1) : undefined }))}
            fitKey={fitKey}
            maxFitZoom={9}
          />
        </div>
      )}
    </div>
  );
}
