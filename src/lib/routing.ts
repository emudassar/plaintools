/**
 * Road routing over OpenStreetMap data, from the FOSSGIS servers that also power
 * routing on openstreetmap.org.
 *
 *   OSRM:     https://routing.openstreetmap.de/routed-{car,bike,foot}/{route,table,trip}/v1/driving/...
 *   Valhalla: https://valhalla1.openstreetmap.de/isochrone?json=...
 *
 * VERIFIED 2026-10-18 (sent with an Origin header): every endpoint returns
 * Access-Control-Allow-Origin: *. Typical times 0.5–0.7 s; `trip` took 10 s for 3 points.
 * Usage policy (routing.openstreetmap.de/about.html): show attribution and a "fix the map"
 * link, at most one request per second, no heavy use. Tools here only call on a click.
 */
import { ToolError } from "./errors";
import type { LatLon } from "./geodesy";

export const OSRM_BASE = "https://routing.openstreetmap.de";
export const VALHALLA_BASE = "https://valhalla1.openstreetmap.de";
export const FOSSGIS_ABOUT_URL = "https://routing.openstreetmap.de/about.html";
export const OSRM_DOCS_URL = "https://project-osrm.org/docs/v5.24.0/api/";
export const VALHALLA_DOCS_URL = "https://valhalla.github.io/valhalla/api/isochrone/api-reference/";

export type Profile = "car" | "bike" | "foot";
export const PROFILE_LABEL: Record<Profile, string> = { car: "Driving", bike: "Cycling", foot: "Walking" };

let last = 0;
/** Keeps this page to at most one routing request per second, as the usage policy asks. */
async function polite(): Promise<void> {
  const wait = last + 1100 - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  last = Date.now();
}

async function getJson<T>(url: string, timeoutMs = 30000): Promise<T> {
  await polite();
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctl.signal });
    const body = await res.json().catch(() => null);
    if (!res.ok || !body) {
      const msg = (body as { message?: string; error?: string } | null)?.message ?? (body as { error?: string } | null)?.error;
      throw new ToolError(res.status === 400 ? "no-data" : "unavailable", msg ? `The routing service said: ${msg}` : "The routing service did not respond. Try again in a moment.");
    }
    return body as T;
  } catch (e) {
    if (e instanceof ToolError) throw e;
    throw new ToolError("unavailable", "The routing service did not respond. Try again in a moment.", e instanceof Error ? e.message : String(e));
  } finally {
    clearTimeout(t);
  }
}

const coords = (pts: LatLon[]) => pts.map((p) => `${p.lon.toFixed(6)},${p.lat.toFixed(6)}`).join(";");

interface OsrmRoute {
  distance: number;
  duration: number;
  legs: { distance: number; duration: number }[];
  geometry?: { coordinates: [number, number][] };
}

export interface RouteResult {
  metres: number;
  seconds: number;
  legs: { metres: number; seconds: number }[];
  line: LatLon[];
}

function checkCode(j: { code?: string; message?: string }) {
  if (j.code && j.code !== "Ok") {
    const kind = j.code === "NoRoute" || j.code === "NoSegment" || j.code === "NoTrips" ? "no-data" : "unavailable";
    throw new ToolError(
      kind,
      kind === "no-data"
        ? "No road route was found between these points — one may be on an island, in the sea or far from any mapped road."
        : `The routing service said: ${j.message ?? j.code}`,
    );
  }
}

/** Road route through the points in the given order. */
export async function route(points: LatLon[], profile: Profile = "car"): Promise<RouteResult> {
  if (points.length < 2) throw new ToolError("bad-input", "Add at least two points.");
  const j = await getJson<{ code: string; message?: string; routes?: OsrmRoute[] }>(
    `${OSRM_BASE}/routed-${profile}/route/v1/driving/${coords(points)}?overview=full&geometries=geojson`,
  );
  checkCode(j);
  const r = j.routes?.[0];
  if (!r) throw new ToolError("no-data", "No road route was found between these points.");
  return {
    metres: r.distance,
    seconds: r.duration,
    legs: r.legs.map((l) => ({ metres: l.distance, seconds: l.duration })),
    line: (r.geometry?.coordinates ?? []).map(([lon, lat]) => ({ lat, lon })),
  };
}

/** Road distance (m) and time (s) matrices, rows = from, columns = to. Null where no route exists. */
export async function table(points: LatLon[], profile: Profile = "car"): Promise<{ metres: (number | null)[][]; seconds: (number | null)[][] }> {
  const j = await getJson<{ code: string; message?: string; distances?: (number | null)[][]; durations?: (number | null)[][] }>(
    `${OSRM_BASE}/routed-${profile}/table/v1/driving/${coords(points)}?annotations=distance,duration`,
  );
  checkCode(j);
  return { metres: j.distances ?? [], seconds: j.durations ?? [] };
}

/**
 * OSRM's trip service: visits every point once, starting at the first, choosing the order
 * (a heuristic, not guaranteed optimal). `roundTrip` returns to the start.
 * Returns the visiting order as indexes into `points`, plus the route.
 */
export async function trip(points: LatLon[], roundTrip: boolean, profile: Profile = "car"): Promise<RouteResult & { order: number[] }> {
  const q = roundTrip ? "roundtrip=true&source=first" : "roundtrip=false&source=first&destination=last";
  const j = await getJson<{ code: string; message?: string; trips?: OsrmRoute[]; waypoints?: { waypoint_index: number; trips_index: number }[] }>(
    `${OSRM_BASE}/routed-${profile}/trip/v1/driving/${coords(points)}?${q}&overview=full&geometries=geojson`,
    60000,
  );
  checkCode(j);
  const t = j.trips?.[0];
  if (!t || !j.waypoints) throw new ToolError("no-data", "No route through all the points was found.");
  const order = j.waypoints.map((w, i) => ({ i, at: w.waypoint_index })).sort((a, b) => a.at - b.at).map((x) => x.i);
  return {
    order,
    metres: t.distance,
    seconds: t.duration,
    legs: t.legs.map((l) => ({ metres: l.distance, seconds: l.duration })),
    line: (t.geometry?.coordinates ?? []).map(([lon, lat]) => ({ lat, lon })),
  };
}

export type IsoCosting = "auto" | "bicycle" | "pedestrian";
export const COSTING_LABEL: Record<IsoCosting, string> = { auto: "Driving", bicycle: "Cycling", pedestrian: "Walking" };

export interface Isochrone {
  minutes: number;
  /** Outer rings first; each polygon is [outer, ...holes]. */
  polygons: LatLon[][][];
}

/** Areas reachable within each number of minutes (Valhalla isochrone). Largest first. */
export async function isochrones(centre: LatLon, minutes: number[], costing: IsoCosting): Promise<Isochrone[]> {
  const body = {
    locations: [{ lat: centre.lat, lon: centre.lon }],
    costing,
    contours: [...minutes].sort((a, b) => a - b).map((time) => ({ time })),
    polygons: true,
    denoise: 0.5,
    generalize: 50,
  };
  const j = await getJson<{ features?: { properties: { contour: number }; geometry: { type: string; coordinates: number[][][] | number[][][][] } }[]; error?: string }>(
    `${VALHALLA_BASE}/isochrone?json=${encodeURIComponent(JSON.stringify(body))}`,
  );
  if (!j.features?.length) throw new ToolError("no-data", "No reachable area was returned — the starting point may be far from any mapped road.");
  const toLL = (ring: number[][]) => ring.map(([lon, lat]) => ({ lat, lon }));
  return j.features
    .map((f) => ({
      minutes: f.properties.contour,
      polygons:
        f.geometry.type === "MultiPolygon"
          ? (f.geometry.coordinates as number[][][][]).map((poly) => poly.map(toLL))
          : [(f.geometry.coordinates as number[][][]).map(toLL)],
    }))
    .sort((a, b) => b.minutes - a.minutes);
}

export function fmtDuration(seconds: number): string {
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return `${h} h ${m % 60} min`;
}
