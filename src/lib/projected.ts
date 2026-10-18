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
  /** Offset of the crop inside the original drawing (cropped maps). */
  ox?: number;
  oy?: number;
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

/** Bounding box [x0, y0, x1, y1] of a path made of "M x y", relative "l dx dy" and "z". */
export function pathBBox(d: string): [number, number, number, number] {
  let x = 0, y = 0, x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const re = /([Mlz])([^Mlz]*)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(d))) {
    if (m[1] === "z") continue;
    const nums = (m[2].match(/-?\d*\.?\d+/g) ?? []).map(Number);
    if (m[1] === "M") [x, y] = nums;
    else {
      x += nums[0];
      y += nums[1];
    }
    x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
  }
  return [x0, y0, x1, y1];
}

/** Bounding boxes of each separate ring ("M ... z") of a path. */
function subpathBoxes(d: string): [number, number, number, number][] {
  return d
    .split(/(?=M)/)
    .filter((p) => p.trim())
    .map(pathBBox);
}

/**
 * A sub-map of some regions, cropped to their extent. Each region counts only its largest ring (its
 * mainland), so overseas territories (French Guiana for France) do not stretch the crop. Regions
 * listed in `skip` are drawn but left out of the extent, and `padRight` widens the crop eastward
 * (Europe skips Russia, then shows its western part). `eastOnly` keeps only mainlands in the
 * eastern half of the drawing (Oceania, so Pacific islands past the date line do not span the map).
 */
export function cropMap(map: ProjectedMap, keep: (r: Region) => boolean, opts: { skip?: string[]; padRight?: number; eastOnly?: boolean; margin?: number } = {}): ProjectedMap {
  const margin = opts.margin ?? 10;
  const regions = map.regions.filter((r) => keep(r) && r.d.includes("M"));
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const r of regions) {
    if (opts.skip?.includes(r.id)) continue;
    const b = subpathBoxes(r.d).reduce((m, q) => ((q[2] - q[0]) * (q[3] - q[1]) > (m[2] - m[0]) * (m[3] - m[1]) ? q : m));
    if (opts.eastOnly && (b[0] + b[2]) / 2 < map.w / 2) continue;
    x0 = Math.min(x0, b[0]); y0 = Math.min(y0, b[1]); x1 = Math.max(x1, b[2]); y1 = Math.max(y1, b[3]);
  }
  x1 += (x1 - x0) * (opts.padRight ?? 0);
  return { regions, w: Math.round(x1 - x0 + 2 * margin), h: Math.round(y1 - y0 + 2 * margin), ox: x0 - margin, oy: y0 - margin };
}

/**
 * Project lon/lat polygons (one state's counties) to a w-px-wide SVG with an equirectangular
 * projection scaled by cos(middle latitude) — close to true shape for an area the size of a state.
 * Longitudes are unwrapped around the median so Alaska's Aleutians do not split.
 */
export function projectLonLat(features: { id: string; name: string; polys: { lat: number; lon: number }[][][] }[], width = 1000): ProjectedMap {
  const all = features.flatMap((f) => f.polys.flat(2));
  const lons = all.map((p) => p.lon).sort((a, b) => a - b);
  const mid = lons[Math.floor(lons.length / 2)];
  const un = (lon: number) => (lon - mid > 180 ? lon - 360 : lon - mid < -180 ? lon + 360 : lon);
  const lats = all.map((p) => p.lat);
  const latMin = Math.min(...lats), latMax = Math.max(...lats);
  const k0 = Math.cos((((latMin + latMax) / 2) * Math.PI) / 180);
  const xs = all.map((p) => un(p.lon) * k0);
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const s = width / (xMax - xMin);
  const X = (lon: number) => Math.round((un(lon) * k0 - xMin) * s * 10) / 10;
  const Y = (lat: number) => Math.round((latMax - lat) * s * 10) / 10;
  const regions = features.map((f) => ({
    id: f.id,
    name: f.name,
    d: f.polys.map((poly) => poly.map((ring) => ring.map((p, i) => `${i ? "L" : "M"}${X(p.lon)} ${Y(p.lat)}`).join("") + "Z").join("")).join(""),
  }));
  return { w: width, h: Math.round((latMax - latMin) * s), regions };
}
