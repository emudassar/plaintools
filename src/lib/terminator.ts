/**
 * Day/night (and moon-up) regions for a map, as columns of latitude intervals.
 *
 * For a body overhead at (decl, subLon) — the subsolar or sublunar point — its geocentric
 * altitude at (φ, λ) is asin(sin φ sin δ + cos φ cos δ cos(λ − subLon)). Each 1°-wide column of
 * longitude is sampled every 0.25° of latitude and the runs where the altitude is below (or
 * above) a threshold are returned, with their ends interpolated. Columns map to rectangles on a
 * Mercator map, so the regions draw correctly even when they contain a pole.
 */
const RAD = Math.PI / 180;
export const MERC_LIMIT = 85.05;

export function altitudeDeg(lat: number, lon: number, decl: number, subLon: number): number {
  return Math.asin(Math.sin(lat * RAD) * Math.sin(decl * RAD) + Math.cos(lat * RAD) * Math.cos(decl * RAD) * Math.cos((lon - subLon) * RAD)) / RAD;
}

export interface Column {
  lon0: number;
  lon1: number;
  runs: [number, number][];
}

/** Columns where altitude < h (below = true) or > h (below = false). */
export function columns(decl: number, subLon: number, h: number, below = true, step = 1): Column[] {
  const out: Column[] = [];
  const dLat = 0.25;
  for (let lon0 = -180; lon0 < 180; lon0 += step) {
    const lon = lon0 + step / 2;
    const runs: [number, number][] = [];
    let start: number | null = null;
    let prevLat = -MERC_LIMIT, prevV = altitudeDeg(prevLat, lon, decl, subLon) - h;
    const inside = (v: number) => (below ? v < 0 : v > 0);
    if (inside(prevV)) start = prevLat;
    for (let lat = -MERC_LIMIT + dLat; lat <= MERC_LIMIT + 1e-9; lat += dLat) {
      const la = Math.min(lat, MERC_LIMIT);
      const v = altitudeDeg(la, lon, decl, subLon) - h;
      if (inside(v) !== inside(prevV)) {
        const edge = prevLat + ((la - prevLat) * prevV) / (prevV - v);
        if (inside(v)) start = edge;
        else if (start !== null) {
          runs.push([start, edge]);
          start = null;
        }
      }
      prevLat = la;
      prevV = v;
    }
    if (start !== null) runs.push([start, MERC_LIMIT]);
    out.push({ lon0, lon1: lon0 + step, runs });
  }
  return out;
}

/** Twilight thresholds, degrees of solar altitude. */
export const TWILIGHT = [
  { h: -0.833, name: "Night side of sunrise/sunset" },
  { h: -6, name: "Civil twilight ends" },
  { h: -12, name: "Nautical twilight ends" },
  { h: -18, name: "Astronomical night" },
] as const;
