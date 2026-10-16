import { ToolError } from "./errors";
import { hedged, type HedgeOptions } from "./hedge";
import { directSphere, type LatLon } from "./geodesy";

/**
 * County and state for a point, from the FCC Area API (2020 Census blocks).
 * https://geo.fcc.gov/api/census/area?lat=<lat>&lon=<lon>&format=json
 *
 * VERIFIED 2026-10-16: `Access-Control-Allow-Origin: *`, keyless, ~1-2 s.
 * Outside the US and over open water it returns `results: []`. Puerto Rico
 * works (county_name is the municipio, e.g. "San Juan Municipio"). Guam, USVI,
 * American Samoa and the Northern Marianas return a block and state but
 * county_name "data unavailable".
 */

export const FCC_AREA_URL = "https://geo.fcc.gov/api/census/area";
export const FCC_DOCS_URL = "https://geo.fcc.gov/api/census/";

export interface CensusArea {
  /** null where the service has no name (it returns "data unavailable" for the Island Areas). */
  countyName: string | null;
  countyFips: string;
  stateName: string;
  stateCode: string;
  stateFips: string;
  blockFips: string;
  censusYear: string;
}

interface FccResponse {
  input?: { censusYear?: string };
  results?: {
    county_name?: string;
    county_fips?: string;
    state_name?: string;
    state_code?: string;
    state_fips?: string;
    block_fips?: string;
  }[];
}

export function parseFcc(j: FccResponse): CensusArea | null {
  const r = j.results?.[0];
  if (!r || !r.county_fips || !r.state_code) return null;
  return {
    countyName: r.county_name && r.county_name !== "data unavailable" ? r.county_name : null,
    countyFips: r.county_fips,
    stateName: r.state_name ?? "",
    stateCode: r.state_code,
    stateFips: r.state_fips ?? r.county_fips.slice(0, 2),
    blockFips: r.block_fips ?? "",
    censusYear: j.input?.censusYear ?? "2020",
  };
}

/** null = the point is not inside any US Census block (outside the US, or open water). */
export async function censusAreaAt(lat: number, lon: number, options: HedgeOptions = {}): Promise<CensusArea | null> {
  let j: FccResponse;
  try {
    j = await hedged<FccResponse>(async (signal) => {
      const res = await fetch(`${FCC_AREA_URL}?lat=${lat}&lon=${lon}&format=json`, { signal });
      if (!res.ok) throw new Error(`FCC HTTP ${res.status}`);
      return (await res.json()) as FccResponse;
    }, options);
  } catch (e) {
    throw new ToolError(
      "unavailable",
      "The FCC Census lookup did not respond. Please try again in a moment.",
      e instanceof Error ? e.message : String(e),
    );
  }
  return parseFcc(j);
}

export interface EdgeCheck {
  /** Distinct areas found on the edge of the accuracy circle, other than the centre's. */
  others: CensusArea[];
  radiusM: number;
}

/**
 * Checks four points (N, E, S, W) on the edge of the device's accuracy circle.
 * If any falls in a different county, the true position may be across the line.
 * Failures on the edge points are ignored — this is a warning, not the answer.
 */
export async function edgeAreas(
  centre: LatLon,
  radiusM: number,
  key: "county" | "state",
  /** The centre's own FIPS code, left out of the result. */
  exclude: string,
): Promise<EdgeCheck> {
  const pts = [0, 90, 180, 270].map((b) => directSphere(centre, b, radiusM));
  const found = await Promise.all(pts.map((p) => censusAreaAt(p.lat, p.lon, { delays: [0] }).catch(() => null)));
  const seen = new Map<string, CensusArea>();
  for (const a of found) {
    if (!a) continue;
    const k = key === "county" ? a.countyFips : a.stateFips;
    if (k !== exclude && !seen.has(k)) seen.set(k, a);
  }
  return { others: [...seen.values()], radiusM };
}
