import { ToolError } from "./errors";
import { hedged, type HedgeOptions } from "./hedge";
import type { LatLon } from "./geodesy";

/**
 * ZIP Code Tabulation Area (ZCTA) containing a point, with its outline, from the Census
 * Bureau's TIGERweb map service, layer "2020 Census ZIP Code Tabulation Areas" in the ACS 2025
 * group (PUMA_TAD_TAZ_UGA_ZCTA/MapServer/4).
 *
 * VERIFIED 2026-10-18: CORS echoes the request Origin; Empire State Building -> 10001;
 * open sea (40N 70W) -> features: []. 1.3 s typical, one 4.6 s sample — hedged.
 * A malformed query hung past 40 s, so inputs are validated before the call.
 */

export const TIGERWEB_ZCTA_URL = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/PUMA_TAD_TAZ_UGA_ZCTA/MapServer/4";
export const TIGERWEB_INFO_URL = "https://tigerweb.geo.census.gov/tigerwebmain/TIGERweb_main.html";

export interface ZctaHit {
  zcta: string;
  /** Outline rings (outer and holes), lat/lon, simplified to about 50 m. */
  rings: LatLon[][];
}

export async function zctaAt(lat: number, lon: number, options: HedgeOptions = {}): Promise<ZctaHit | null> {
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    throw new ToolError("bad-input", "Those coordinates are outside the valid range.");
  }
  const url =
    `${TIGERWEB_ZCTA_URL}/query?geometry=${lon.toFixed(6)},${lat.toFixed(6)}&geometryType=esriGeometryPoint&inSR=4326` +
    `&spatialRel=esriSpatialRelIntersects&outFields=ZCTA5&returnGeometry=true&outSR=4326&geometryPrecision=5&maxAllowableOffset=0.0005&f=geojson`;
  let j: { features?: { properties?: { ZCTA5?: string }; geometry?: { type: string; coordinates: number[][][] | number[][][][] } }[]; error?: unknown };
  try {
    j = await hedged(async (signal) => {
      const res = await fetch(url, { signal });
      if (!res.ok) throw new Error(`TIGERweb HTTP ${res.status}`);
      return res.json();
    }, { deadlineMs: 25_000, ...options });
  } catch (e) {
    throw new ToolError("unavailable", "The Census TIGERweb service did not respond. Please try again in a moment.", e instanceof Error ? e.message : String(e));
  }
  if (j.error) throw new ToolError("unavailable", "The Census TIGERweb service returned an error.");
  const f = j.features?.[0];
  const z = f?.properties?.ZCTA5;
  if (!f || !z || !/^\d{5}$/.test(z)) return null;
  const g = f.geometry;
  const polys = !g ? [] : g.type === "MultiPolygon" ? (g.coordinates as number[][][][]) : [g.coordinates as number[][][]];
  return { zcta: z, rings: polys.flat().map((r) => r.map(([x, y]) => ({ lat: y, lon: x }))) };
}

/**
 * Census places containing a point, from TIGERweb Places_CouSub_ConCity_SubMCD (current BAS 2026
 * group): layer 4 Incorporated Places, 5 Census Designated Places, 1 County Subdivisions.
 * VERIFIED 2026-10-18: Empire State Building -> "New York city" (incorporated); 40.5N 74.5W ->
 * no incorporated place, "Somerset CDP".
 */
export const TIGERWEB_PLACES_URL = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Places_CouSub_ConCity_SubMCD/MapServer";

export interface CensusPlaceHit {
  name: string;
  /** Full legal/statistical name, e.g. "Austin city", "Somerset CDP", "Franklin township". */
  full: string;
  geoid: string;
}
export interface CensusPlaces {
  incorporated: CensusPlaceHit | null;
  cdp: CensusPlaceHit | null;
  subdivision: CensusPlaceHit | null;
}

async function layerHit(layer: number, lat: number, lon: number): Promise<CensusPlaceHit | null> {
  const url =
    `${TIGERWEB_PLACES_URL}/${layer}/query?geometry=${lon.toFixed(6)},${lat.toFixed(6)}&geometryType=esriGeometryPoint&inSR=4326` +
    `&spatialRel=esriSpatialRelIntersects&outFields=NAME,BASENAME,GEOID&returnGeometry=false&f=json`;
  const j = await hedged<{ features?: { attributes: { NAME: string; BASENAME: string; GEOID: string } }[] }>(async (signal) => {
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`TIGERweb HTTP ${res.status}`);
    return res.json();
  }, { deadlineMs: 25_000 });
  const a = j.features?.[0]?.attributes;
  return a ? { name: a.BASENAME, full: a.NAME, geoid: a.GEOID } : null;
}

/** null when TIGERweb did not answer at all. */
export async function censusPlacesAt(lat: number, lon: number): Promise<CensusPlaces | null> {
  try {
    const [incorporated, cdp, subdivision] = await Promise.all([layerHit(4, lat, lon), layerHit(5, lat, lon), layerHit(1, lat, lon)]);
    return { incorporated, cdp, subdivision };
  } catch {
    return null;
  }
}
