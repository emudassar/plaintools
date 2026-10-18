/**
 * Centre of a set of points, three ways (the definitions geomidpoint.com popularised):
 *
 *  - Geographic midpoint ("centre of gravity"): convert each point to a unit vector, take the
 *    weighted mean vector and turn it back into a latitude and longitude. Undefined when the
 *    vectors cancel (e.g. two antipodes).
 *  - Centre of minimum distance (geometric median on the sphere): the point whose summed
 *    weighted great-circle distance to all points is smallest. Found with Weiszfeld's
 *    iteration on unit vectors, projected back to the sphere each step, then polished by a
 *    shrinking-step local search.
 *  - Average latitude/longitude: plain arithmetic means (longitudes unwrapped around the first
 *    point so a set straddling 180° does not average to 0°). Simple, but distorted far from the
 *    equator and across large spreads.
 */
import { haversine, normalizeLon, type LatLon } from "./geodesy";

export const WEISZFELD_URL = "https://en.wikipedia.org/wiki/Geometric_median";

const RAD = Math.PI / 180;

export interface WeightedPoint extends LatLon {
  weight: number;
}

const vec = (p: LatLon): [number, number, number] => [Math.cos(p.lat * RAD) * Math.cos(p.lon * RAD), Math.cos(p.lat * RAD) * Math.sin(p.lon * RAD), Math.sin(p.lat * RAD)];
const unvec = ([x, y, z]: [number, number, number]): LatLon => ({ lat: Math.atan2(z, Math.hypot(x, y)) / RAD, lon: Math.atan2(y, x) / RAD });

export function geographicMidpoint(pts: readonly WeightedPoint[]): LatLon | null {
  let x = 0, y = 0, z = 0, w = 0;
  for (const p of pts) {
    const v = vec(p);
    x += v[0] * p.weight;
    y += v[1] * p.weight;
    z += v[2] * p.weight;
    w += p.weight;
  }
  if (w <= 0 || Math.hypot(x, y, z) / w < 1e-9) return null;
  return unvec([x, y, z]);
}

export function averageLatLon(pts: readonly WeightedPoint[]): LatLon | null {
  const w = pts.reduce((s, p) => s + p.weight, 0);
  if (w <= 0) return null;
  const ref = pts[0].lon;
  let lat = 0, lon = 0;
  for (const p of pts) {
    let d = p.lon - ref;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    lat += p.lat * p.weight;
    lon += (ref + d) * p.weight;
  }
  return { lat: lat / w, lon: normalizeLon(lon / w) };
}

export const totalDistance = (c: LatLon, pts: readonly WeightedPoint[]) => pts.reduce((s, p) => s + p.weight * haversine(c, p).metres, 0);

export function centreOfMinimumDistance(pts: readonly WeightedPoint[]): LatLon | null {
  let c = geographicMidpoint(pts) ?? pts[0];
  if (!c) return null;
  // Weiszfeld on the sphere.
  for (let it = 0; it < 200; it++) {
    let x = 0, y = 0, z = 0;
    let hit = false;
    for (const p of pts) {
      const d = haversine(c, p).metres;
      if (d < 0.01) {
        hit = true;
        continue;
      }
      const v = vec(p);
      x += (v[0] * p.weight) / d;
      y += (v[1] * p.weight) / d;
      z += (v[2] * p.weight) / d;
    }
    if (Math.hypot(x, y, z) < 1e-15) break;
    const next = unvec([x, y, z]);
    if (haversine(c, next).metres < 0.01 && !hit) {
      c = next;
      break;
    }
    c = next;
  }
  // Local polish: try 8 directions at a shrinking step.
  let best = totalDistance(c, pts);
  for (let step = 0.5; step > 1e-7; ) {
    let moved = false;
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4;
      const q = { lat: Math.max(-90, Math.min(90, c.lat + step * Math.cos(a))), lon: normalizeLon(c.lon + (step * Math.sin(a)) / Math.max(0.01, Math.cos(c.lat * RAD))) };
      const t = totalDistance(q, pts);
      if (t < best - 1e-9) {
        best = t;
        c = q;
        moved = true;
      }
    }
    if (!moved) step /= 2;
  }
  return c;
}
