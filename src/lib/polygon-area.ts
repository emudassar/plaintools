/**
 * Area and perimeter of a polygon drawn on the Earth.
 *
 * Area: the polygon-area sum of Chamberlain & Duquette, "Some Algorithms for Polygons on a
 * Sphere" (NASA JPL, 2007): A = R²/2 · Σ (λ_{i+1} − λ_{i−1}) sin φ_i, applied on the WGS84
 * authalic sphere (radius 6,371,007.2 m) with each geodetic latitude converted to authalic
 * latitude ξ (Snyder, Map Projections — A Working Manual, USGS PP 1395, eqs. 3-11 and 3-12).
 * That mapping is equal-area, so the result is the ellipsoidal area: exact for edges along
 * meridians and parallels, and within a tiny fraction for short straight edges.
 *
 * Perimeter: Vincenty geodesic lengths of the edges on WGS84.
 */
import { inverse, type LatLon } from "./geodesy";

export const CHAMBERLAIN_URL = "https://trs.jpl.nasa.gov/handle/2014/41271";
export const AUTHALIC_RADIUS_M = 6_371_007.2;

export const SNYDER_URL = "https://pubs.usgs.gov/publication/pp1395";

const RAD = Math.PI / 180;
const F = 1 / 298.257223563;
const E2 = F * (2 - F);
const E = Math.sqrt(E2);
/** Snyder eq. 3-12: q(φ). */
const q = (φ: number) => {
  const s = Math.sin(φ);
  return (1 - E2) * (s / (1 - E2 * s * s) - (1 / (2 * E)) * Math.log((1 - E * s) / (1 + E * s)));
};
const QP = q(Math.PI / 2);
/** sin of the authalic latitude (Snyder eq. 3-11). */
export const sinAuthalic = (latDeg: number) => q(latDeg * RAD) / QP;

export function sphericalArea(ring: readonly LatLon[]): number {
  const n = ring.length;
  if (n < 3) return 0;
  let s = 0;
  for (let i = 0; i < n; i++) {
    const prev = ring[(i - 1 + n) % n], next = ring[(i + 1) % n];
    let d = next.lon - prev.lon;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    s += d * RAD * sinAuthalic(ring[i].lat);
  }
  return Math.abs((s * AUTHALIC_RADIUS_M * AUTHALIC_RADIUS_M) / 2);
}

export function perimeter(ring: readonly LatLon[], closed = true): number {
  let m = 0;
  for (let i = 1; i < ring.length; i++) m += inverse(ring[i - 1], ring[i]).metres;
  if (closed && ring.length > 2) m += inverse(ring[ring.length - 1], ring[0]).metres;
  return m;
}

/** True when two non-adjacent edges cross (the shape is a "bow tie" and its area is ambiguous). */
export function selfIntersects(ring: readonly LatLon[]): boolean {
  const n = ring.length;
  if (n < 4) return false;
  const seg = (i: number) => [ring[i], ring[(i + 1) % n]] as const;
  const cross = (a: LatLon, b: LatLon, c: LatLon) => (b.lon - a.lon) * (c.lat - a.lat) - (b.lat - a.lat) * (c.lon - a.lon);
  for (let i = 0; i < n; i++)
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue;
      const [p1, p2] = seg(i), [q1, q2] = seg(j);
      if (cross(p1, p2, q1) * cross(p1, p2, q2) < 0 && cross(q1, q2, p1) * cross(q1, q2, p2) < 0) return true;
    }
  return false;
}

/** Ray-casting point-in-polygon in lon/lat (fine for shapes much smaller than a hemisphere). */
export function pointInRings(p: LatLon, rings: readonly (readonly LatLon[])[]): boolean {
  let inside = false;
  for (const ring of rings)
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const a = ring[i], b = ring[j];
      if (a.lat > p.lat !== b.lat > p.lat && p.lon < ((b.lon - a.lon) * (p.lat - a.lat)) / (b.lat - a.lat) + a.lon) inside = !inside;
    }
  return inside;
}

export const SQM = { acres: 4046.8564224, hectares: 10_000, sqkm: 1e6, sqmi: 2_589_988.110336, sqft: 0.09290304 } as const;
