/**
 * Antipodes and "dig straight down" exits.
 *
 * Antipode: the point diametrically opposite through the Earth's centre — latitude negated,
 * longitude shifted 180°. On the WGS84 ellipsoid (symmetric about its centre) this is exact.
 *
 * Straight down: a plumb line follows the ellipsoid normal (the local vertical), which does
 * NOT pass through the centre except at the equator and the poles. The exit point is where
 * that normal line leaves the ellipsoid on the far side, found in Earth-centred (ECEF)
 * coordinates and converted back to geodetic latitude with Bowring's method (NGA TR8350.2
 * gives the ECEF formulas; WGS84 a and f as defined there).
 *
 * Layers on the way down use the boundary radii of the Preliminary Reference Earth Model
 * (Dziewonski & Anderson 1981): crust to 24.4 km depth, mantle to the core at 3480 km radius,
 * inner core 1221.5 km radius, Earth radius 6371 km.
 */
import { normalizeLon, WGS84_A, WGS84_F, type LatLon } from "./geodesy";

export const PREM_DOI_URL = "https://doi.org/10.1016/0031-9201(81)90046-7";

const RAD = Math.PI / 180;
const E2 = WGS84_F * (2 - WGS84_F);
const B = WGS84_A * (1 - WGS84_F);

export function antipode(p: LatLon): LatLon {
  return { lat: -p.lat, lon: normalizeLon(p.lon + 180) };
}

type V3 = [number, number, number];

export function toEcef(lat: number, lon: number, h = 0): V3 {
  const φ = lat * RAD, λ = lon * RAD;
  const N = WGS84_A / Math.sqrt(1 - E2 * Math.sin(φ) ** 2);
  return [(N + h) * Math.cos(φ) * Math.cos(λ), (N + h) * Math.cos(φ) * Math.sin(λ), (N * (1 - E2) + h) * Math.sin(φ)];
}

/** Geodetic latitude/longitude from ECEF (Bowring 1976, one step is sub-millimetre at the surface). */
export function fromEcef([x, y, z]: V3): LatLon {
  const p = Math.hypot(x, y);
  const ep2 = (WGS84_A ** 2 - B ** 2) / B ** 2;
  const θ = Math.atan2(z * WGS84_A, p * B);
  const φ = Math.atan2(z + ep2 * B * Math.sin(θ) ** 3, p - E2 * WGS84_A * Math.cos(θ) ** 3);
  return { lat: φ / RAD, lon: Math.atan2(y, x) / RAD };
}

export interface DigResult {
  exit: LatLon;
  /** Straight-line length of the tunnel, metres. */
  chordM: number;
  /** Closest the tunnel passes to the Earth's centre, metres. */
  missesCentreByM: number;
  /** Surface distance between the plumb-line exit and the true antipode, metres (approx., chord). */
  exitToAntipodeM: number;
  /** Deepest point below the surface (half the chord through the centre region), metres. */
  maxDepthM: number;
}

/** Follow the local vertical (ellipsoid normal) down from a surface point to where it comes out. */
export function digStraightDown(p: LatLon): DigResult {
  const P = toEcef(p.lat, p.lon);
  const φ = p.lat * RAD, λ = p.lon * RAD;
  const n: V3 = [Math.cos(φ) * Math.cos(λ), Math.cos(φ) * Math.sin(λ), Math.sin(φ)];
  // Points P - t n on x²/a² + y²/a² + z²/b² = 1. P is on the surface, so one root is t = 0.
  const a2 = WGS84_A ** 2, b2 = B ** 2;
  const qa = (n[0] ** 2 + n[1] ** 2) / a2 + n[2] ** 2 / b2;
  const qb = (P[0] * n[0] + P[1] * n[1]) / a2 + (P[2] * n[2]) / b2;
  const t = (2 * qb) / qa;
  const Q: V3 = [P[0] - t * n[0], P[1] - t * n[1], P[2] - t * n[2]];
  const exit = fromEcef(Q);
  // Distance from the centre to the line through P along n: |P × n|.
  const cx = P[1] * n[2] - P[2] * n[1], cy = P[2] * n[0] - P[0] * n[2], cz = P[0] * n[1] - P[1] * n[0];
  const anti = toEcef(-p.lat, p.lon + 180);
  return {
    exit: { lat: exit.lat, lon: normalizeLon(exit.lon) },
    chordM: t,
    missesCentreByM: Math.hypot(cx, cy, cz),
    exitToAntipodeM: Math.hypot(Q[0] - anti[0], Q[1] - anti[1], Q[2] - anti[2]),
    maxDepthM: Math.hypot(...P) - Math.hypot(cx, cy, cz),
  };
}

/** PREM layer boundaries as radii from the centre, km. */
export const PREM_LAYERS = [
  { name: "Crust", topKm: 6371, bottomKm: 6346.6 },
  { name: "Mantle", topKm: 6346.6, bottomKm: 3480 },
  { name: "Outer core (liquid)", topKm: 3480, bottomKm: 1221.5 },
  { name: "Inner core (solid)", topKm: 1221.5, bottomKm: 0 },
] as const;

/**
 * Length of tunnel spent in each layer, for a straight tunnel of half-length L (km) that passes
 * `missKm` from the centre, on a sphere of radius 6371 km.
 */
export function layerLengths(missKm: number): { name: string; km: number }[] {
  const half = (r: number) => (r > missKm ? Math.sqrt(r * r - missKm * missKm) : 0);
  return PREM_LAYERS.map((l) => ({ name: l.name, km: 2 * (half(l.topKm) - half(l.bottomKm)) })).filter((l) => l.km > 0.05);
}

/**
 * Time to fall through a frictionless tunnel through the centre of a uniform-density Earth:
 * half a period of simple harmonic motion, π·√(R³/GM). GM = 3.986004418e14 m³/s² (WGS84).
 */
export const GM = 3.986004418e14;
export function uniformFallSeconds(radiusM = 6_371_000): number {
  return Math.PI * Math.sqrt(radiusM ** 3 / GM);
}
