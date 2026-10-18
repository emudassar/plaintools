import { ToolError } from "./errors";
import { hedged, type HedgeOptions } from "./hedge";

/**
 * Ground elevation for a point, from two independent public models.
 *
 * 1. USGS Elevation Point Query Service (3D Elevation Program, 3DEP).
 *    https://epqs.nationalmap.gov/v1/json?x=<lon>&y=<lat>&units=Meters&wkid=4326
 *    VERIFIED 2026-10-16: `Access-Control-Allow-Origin: *`. Covers the US and
 *    parts of Canada and Mexico. `value` is sometimes a number, sometimes a
 *    numeric string. Over open ocean it returns PLAIN TEXT with HTTP 200
 *    ("Invalid or missing input parameters." or "Call failed. ...") — never
 *    call res.json() blind. `resolution` is metres (1) or arc-degrees.
 *    Response times measured 1.2-5.8 s, so it is hedged.
 *
 * 2. Open-Meteo Elevation API, Copernicus DEM GLO-90 (90 m), worldwide.
 *    https://api.open-meteo.com/v1/elevation?latitude=<lat>&longitude=<lon>
 *    VERIFIED 2026-10-16: ACAO *. Ocean returns 0. A 90 m cell is an average,
 *    so peaks read low (Everest summit point: 8,724 m vs 8,849 m surveyed).
 */

export const EPQS_URL = "https://epqs.nationalmap.gov/v1/json";
export const EPQS_INFO_URL = "https://apps.nationalmap.gov/epqs/";
export const OPEN_METEO_ELEV_URL = "https://api.open-meteo.com/v1/elevation";
export const OPEN_METEO_DOCS_URL = "https://open-meteo.com/en/docs/elevation-api";
export const COPERNICUS_DOI_URL = "https://doi.org/10.5270/ESA-c5d3d65";

export const M_TO_FT = 1 / 0.3048;

export interface ElevationReading {
  metres: number;
  source: "usgs" | "copernicus";
  /** Approximate grid spacing in metres. */
  resolutionM: number | null;
}

export interface ElevationResult {
  lat: number;
  lon: number;
  usgs: ElevationReading | null;
  /** true when USGS did not answer at all (network, CORS on its error replies, or timeout) — not the same as no data. */
  usgsFailed: boolean;
  copernicus: ElevationReading | null;
  copernicusFailed: boolean;
  /** The figure shown as the headline: USGS where it has data, else Copernicus. */
  best: ElevationReading | null;
  /** Copernicus reads exactly 0 and USGS has nothing: almost always open water. */
  likelyWater: boolean;
  retrievedAt: string;
}

/** Parses an EPQS body. Returns null for its plain-text 'no data' replies. */
export function parseEpqs(body: string): ElevationReading | null {
  const t = body.trim();
  if (!t.startsWith("{")) return null;
  let j: { value?: number | string; resolution?: number };
  try {
    j = JSON.parse(t);
  } catch {
    return null;
  }
  const v = typeof j.value === "string" ? parseFloat(j.value) : j.value;
  if (typeof v !== "number" || !Number.isFinite(v) || v < -1000 || v > 9000) return null;
  let res: number | null = null;
  if (typeof j.resolution === "number" && j.resolution > 0) {
    // < 0.01 means arc-degrees (e.g. 0.0000926 = 1/3 arc-second); convert to metres north-south.
    res = j.resolution < 0.01 ? j.resolution * 111320 : j.resolution;
  }
  return { metres: v, source: "usgs", resolutionM: res };
}

async function getText(url: string, options: HedgeOptions): Promise<string> {
  return hedged(async (signal) => {
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.text();
  }, options);
}

export async function lookupElevation(lat: number, lon: number, options: HedgeOptions = {}): Promise<ElevationResult> {
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    throw new ToolError("bad-input", "Those coordinates are outside the valid range.");
  }
  // USGS gets its own 15 s cap: over the sea it can take that long just to say "no data".
  const usgsP = getText(`${EPQS_URL}?x=${lon}&y=${lat}&units=Meters&wkid=4326&includeDate=false`, { ...options, deadlineMs: 15_000 })
    .then((b) => parseEpqs(b))
    .catch(() => undefined);
  const copP = getText(`${OPEN_METEO_ELEV_URL}?latitude=${lat}&longitude=${lon}`, options)
    .then((b) => {
      const j = JSON.parse(b) as { elevation?: number[] };
      const v = j.elevation?.[0];
      return typeof v === "number" && Number.isFinite(v) ? ({ metres: v, source: "copernicus", resolutionM: 90 } as ElevationReading) : null;
    })
    .catch(() => undefined);

  const [usgs, cop] = await Promise.all([usgsP, copP]);
  if (usgs === undefined && cop === undefined) {
    throw new ToolError("unavailable", "Neither elevation service responded. Please try again in a moment.");
  }
  const u = usgs ?? null;
  const c = cop ?? null;
  return {
    lat,
    lon,
    usgs: u,
    usgsFailed: usgs === undefined,
    copernicus: c,
    copernicusFailed: cop === undefined,
    best: u ?? c,
    // Over the sea EPQS often answers with an error page that has no CORS header, so in a
    // browser a failure there looks like a network error; Copernicus 0 m is the real signal.
    likelyWater: u === null && c !== null && c.metres === 0,
    retrievedAt: new Date().toISOString(),
  };
}

/**
 * Copernicus GLO-90 ground elevation for up to 100 points in one Open-Meteo request
 * (comma-separated latitude and longitude lists, as the API documents).
 * Open water reads 0. Returns metres, in the same order as the points.
 */
export async function copernicusBatch(points: { lat: number; lon: number }[], options: HedgeOptions = {}): Promise<number[]> {
  if (points.length === 0) return [];
  if (points.length > 100) throw new ToolError("bad-input", "Up to 100 points per request.");
  const lat = points.map((p) => p.lat.toFixed(5)).join(",");
  const lon = points.map((p) => p.lon.toFixed(5)).join(",");
  let body: string;
  try {
    body = await getText(`${OPEN_METEO_ELEV_URL}?latitude=${lat}&longitude=${lon}`, options);
  } catch (e) {
    throw new ToolError("unavailable", "The elevation service did not respond. Please try again in a moment.", e instanceof Error ? e.message : String(e));
  }
  const j = JSON.parse(body) as { elevation?: number[]; reason?: string };
  if (!j.elevation || j.elevation.length !== points.length) throw new ToolError("unavailable", j.reason ?? "The elevation service returned an unexpected answer.");
  return j.elevation;
}
