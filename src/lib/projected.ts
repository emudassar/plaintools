/**
 * Pre-projected outline maps built by scripts/build-geo-data.mjs (mapshaper, simplified):
 *   us-states.json   — 50 states + DC from Census cb_2024 1:5m, Albers USA (Alaska and Hawaii inset), 1000 px wide
 *   us-counties.json — 3,144 counties from Census cb_2024 1:500k, same projection, plus a state-lines path
 *   world.json       — 242 Natural Earth 1:50m countries, Robinson projection, with continent
 *   tz-world.json / tz-us.json — time zone areas (timezone-boundary-builder)
 * Each region is an SVG path string in a w × h pixel box.
 */
import { ToolError } from "./errors";

export interface Region {
  id: string;
  name: string;
  /** State USPS code (counties) or continent (countries). */
  group?: string;
  d: string;
}
export interface ProjectedMap {
  w: number;
  h: number;
  regions: Region[];
  /** Extra line work drawn on top (state lines on the county map). */
  lines?: string;
}

const cache = new Map<string, Promise<ProjectedMap>>();

function load(file: string, map: (j: Record<string, unknown>) => ProjectedMap): Promise<ProjectedMap> {
  if (!cache.has(file)) {
    cache.set(
      file,
      fetch(`/data/geo/${file}`)
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then(map)
        .catch((e) => {
          cache.delete(file);
          throw new ToolError("unavailable", "The map outline did not load. Check your connection and try again.", e instanceof Error ? e.message : String(e));
        }),
    );
  }
  return cache.get(file)!;
}

type Row = string[];
export const loadUsStates = () => load("us-states.json", (j) => ({ w: j.w as number, h: j.h as number, regions: (j.states as Row[]).map(([id, name, d]) => ({ id, name, d })) }));
export const loadUsCounties = () =>
  load("us-counties.json", (j) => ({ w: j.w as number, h: j.h as number, lines: j.stateLines as string, regions: (j.counties as Row[]).map(([id, name, group, d]) => ({ id, name, group, d })) }));
export const loadWorldMap = () => load("world.json", (j) => ({ w: j.w as number, h: j.h as number, regions: (j.countries as Row[]).map(([id, name, group, d]) => ({ id, name, group, d })) }));
export const loadTzWorld = () => load("tz-world.json", (j) => ({ w: j.w as number, h: j.h as number, regions: (j.zones as Row[]).map(([id, d]) => ({ id, name: id, d })) }));
export const loadTzUs = () => load("tz-us.json", (j) => ({ w: j.w as number, h: j.h as number, regions: (j.zones as Row[]).map(([id, d]) => ({ id, name: id, d })) }));

export const CENSUS_CB_URL = "https://www.census.gov/geographies/mapping-files/time-series/geo/cartographic-boundary.html";
export const NE_ADMIN0_URL = "https://www.naturalearthdata.com/downloads/50m-cultural-vectors/50m-admin-0-countries-2/";
export const TBB_URL = "https://github.com/evansiroky/timezone-boundary-builder";

/** Quantile class breaks (k classes) for a choropleth, ignoring nulls. */
export function quantileBreaks(values: number[], k: number): number[] {
  const v = values.filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
  if (!v.length) return [];
  const out: number[] = [];
  for (let i = 1; i < k; i++) out.push(v[Math.min(v.length - 1, Math.floor((i * v.length) / k))]);
  return out;
}

/** Sequential palette, light to dark (ColorBrewer YlGnBu 7, by Cynthia Brewer, Apache-2.0). */
export const SEQ7 = ["#ffffcc", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#0c2c84"];
/** Qualitative palette for user colouring (ColorBrewer Set3/Paired-derived). */
export const PALETTE = ["#1f78b4", "#33a02c", "#e31a1c", "#ff7f00", "#6a3d9a", "#b15928", "#a6cee3", "#b2df8a", "#fb9a99", "#fdbf6f", "#cab2d6", "#ffff99", "#000000", "#ffffff"];

export function classOf(x: number | null | undefined, breaks: number[]): number {
  if (x === null || x === undefined || !Number.isFinite(x)) return -1;
  let i = 0;
  while (i < breaks.length && x >= breaks[i]) i++;
  return i;
}
