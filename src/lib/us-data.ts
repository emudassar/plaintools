/**
 * Loaders for the US Census lookup files in public/data/, built by scripts/build-geo-data.mjs
 * from the Census Bureau's 2024 Gazetteer files and the American Community Survey
 * 2019–2023 5-year estimates (table-based summary file, tables B01003, B19013, B25077).
 *
 * Every row is a point (the Census "internal point" of the area), so distances are
 * point-to-point, not edge-to-edge. Each file is fetched once per page and cached.
 */
import { ToolError } from "./errors";
import { inverse, type LatLon } from "./geodesy";

export const GAZETTEER_URL = "https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html";
export const ACS_SF_URL = "https://www.census.gov/programs-surveys/acs/data/summary-file.html";
export const ZCTA_URL = "https://www.census.gov/programs-surveys/geography/guidance/geo-areas/zctas.html";
export const ACS_ERRORS_URL = "https://www.census.gov/programs-surveys/acs/methodology/sample-size-and-data-quality.html";
export const DATA_VINTAGE = "Census 2024 Gazetteer; ACS 2019–2023 5-year estimates";

export interface Zcta extends LatLon {
  zip: string;
  pop: number | null;
  income: number | null;
  homeValue: number | null;
  landSqMi: number;
}
export interface Place extends LatLon {
  name: string;
  state: string;
  pop: number | null;
  landSqMi: number;
  geoid: string;
  /** Census legal/statistical description: "city", "town", "CDP", ... ("" when none). */
  kind: string;
}
export interface Tract extends LatLon {
  pop: number;
  landKm2: number;
}
export interface County extends LatLon {
  fips: string;
  name: string;
  state: string;
  pop: number | null;
  income: number | null;
  homeValue: number | null;
  landSqMi: number;
}

const cache = new Map<string, Promise<unknown>>();

async function load<T>(file: string, map: (r: never[]) => T): Promise<T[]> {
  if (!cache.has(file)) {
    cache.set(
      file,
      fetch(`/data/${file}`)
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then((j: { rows: never[][] }) => j.rows.map(map)),
    );
  }
  try {
    return (await cache.get(file)) as T[];
  } catch (e) {
    cache.delete(file);
    throw new ToolError("unavailable", "The data file did not load. Check your connection and try again.", e instanceof Error ? e.message : String(e));
  }
}

export const loadZctas = () =>
  load<Zcta>("zcta.json", (r: never[]) => {
    const [zip, lat, lon, pop, income, homeValue, landSqMi] = r as unknown as [string, number, number, number | null, number | null, number | null, number];
    return { zip, lat, lon, pop, income, homeValue, landSqMi };
  });

export const loadPlaces = () =>
  load<Place>("places.json", (r: never[]) => {
    const [name, state, lat, lon, pop, landSqMi, geoid, kind] = r as unknown as [string, string, number, number, number | null, number, string, string];
    return { name, state, lat, lon, pop, landSqMi, geoid, kind };
  });

export const loadTracts = () =>
  load<Tract>("tracts.json", (r: never[]) => {
    const [lat, lon, pop, landKm2] = r as unknown as [number, number, number, number];
    return { lat, lon, pop, landKm2 };
  });

export const loadCounties = () =>
  load<County>("counties.json", (r: never[]) => {
    const [fips, name, state, lat, lon, pop, income, homeValue, landSqMi] = r as unknown as [string, string, string, number, number, number | null, number | null, number | null, number];
    return { fips, name, state, lat, lon, pop, income, homeValue, landSqMi };
  });

/** Rows within `metres` of the centre, nearest first, with their distance. A cheap degree box filters first. */
export function withinRadius<T extends LatLon>(rows: readonly T[], centre: LatLon, metres: number): (T & { metres: number })[] {
  const dLat = metres / 110_574 + 0.01;
  const cos = Math.max(0.01, Math.cos((centre.lat * Math.PI) / 180));
  const dLon = metres / (111_320 * cos) + 0.01;
  const out: (T & { metres: number })[] = [];
  for (const r of rows) {
    if (Math.abs(r.lat - centre.lat) > dLat) continue;
    let dl = Math.abs(r.lon - centre.lon);
    if (dl > 180) dl = 360 - dl;
    if (dl > dLon) continue;
    const m = inverse(centre, r).metres;
    if (m <= metres) out.push({ ...r, metres: m });
  }
  return out.sort((a, b) => a.metres - b.metres);
}

/** The n nearest rows (cheap: grows a box until it holds enough). */
export function nearest<T extends LatLon>(rows: readonly T[], centre: LatLon, n = 1): (T & { metres: number })[] {
  for (const km of [10, 40, 150, 600, 3000, 21000]) {
    const hits = withinRadius(rows, centre, km * 1000);
    if (hits.length >= n) return hits.slice(0, n);
  }
  return [];
}

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");

export const US_STATES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware",
  DC: "District of Columbia", FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota",
  MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon",
  PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah",
  VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming", PR: "Puerto Rico",
};

/**
 * "Austin, TX", "austin texas", "St. Louis, MO" -> matching Census places, largest first.
 * Without a state, every state's match is returned (Springfield).
 */
export function findPlaces(places: readonly Place[], query: string): Place[] {
  const raw = query.trim();
  if (!raw) return [];
  let state: string | null = null;
  let name = raw;
  const m = raw.match(/^(.*?)[,\s]+([A-Za-z .]+)$/);
  if (m) {
    const tail = m[2].trim();
    const code = tail.length === 2 ? tail.toUpperCase() : Object.keys(US_STATES).find((k) => norm(US_STATES[k]) === norm(tail));
    if (code && US_STATES[code]) {
      state = code;
      name = m[1];
    }
  }
  const n = norm(name).replace(/^saint/, "st").replace(/^mount/, "mt").replace(/^fort/, "ft");
  const key = (p: Place) => norm(p.name).replace(/^saint/, "st").replace(/^mount/, "mt").replace(/^fort/, "ft");
  const hits = places.filter((p) => (!state || p.state === state) && key(p) === n);
  return hits.sort((a, b) => (b.pop ?? 0) - (a.pop ?? 0));
}

export const placeLabel = (p: Place) => `${p.name}, ${p.state}`;

export function zipIndex(rows: readonly Zcta[]): Map<string, Zcta> {
  return new Map(rows.map((z) => [z.zip, z]));
}

/** Pulls 5-digit ZIPs out of free text ("10001, 90210 60614-1234"). */
export function parseZips(text: string): string[] {
  return [...text.matchAll(/\b(\d{5})(?:-\d{4})?\b/g)].map((m) => m[1]);
}
