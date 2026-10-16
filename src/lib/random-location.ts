import { ToolError } from "./errors";
import { directSphere, MEAN_RADIUS_M, normalizeLon, type LatLon } from "./geodesy";

/**
 * Uniformly random points on the Earth's surface (sphere model).
 *
 * Wolfram MathWorld, "Sphere Point Picking": choosing longitude uniformly and
 * latitude uniformly is WRONG — points bunch at the poles. Correct: polar angle
 * phi = acos(2v - 1), i.e. latitude = asin(2v - 1), with v uniform on [0, 1).
 * https://mathworld.wolfram.com/SpherePointPicking.html
 *
 * The same area argument (area between latitudes is proportional to the
 * difference of their sines) gives:
 *  - a lat/lon box: lat = asin(sin(s) + v * (sin(n) - sin(s)));
 *  - a circle of radius r around a centre (spherical cap): the angular distance
 *    c satisfies cos(c) = 1 - v * (1 - cos(r / R)), bearing uniform.
 *
 * Randomness: crypto.getRandomValues (the Web Crypto API), not Math.random.
 */

export const MATHWORLD_URL = "https://mathworld.wolfram.com/SpherePointPicking.html";

export type RandomArea =
  | { kind: "world" }
  | { kind: "box"; south: number; north: number; west: number; east: number }
  | { kind: "radius"; centre: LatLon; radiusM: number };

/** Uniform [0, 1) from 53 random bits. Injected so tests can be deterministic. */
export type Uniform = () => number;

export const cryptoUniform: Uniform = () => {
  const a = new Uint32Array(2);
  crypto.getRandomValues(a);
  return (a[0] * 2 ** 21 + (a[1] >>> 11)) / 2 ** 53;
};

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

export function validateArea(area: RandomArea): void {
  if (area.kind === "box") {
    const { south, north, west, east } = area;
    if (![south, north, west, east].every(Number.isFinite)) throw new ToolError("bad-input", "Enter all four box edges.");
    if (south < -90 || north > 90 || south >= north) {
      throw new ToolError("bad-input", "South must be below north, both between -90 and 90.");
    }
    if (west < -180 || west > 180 || east < -180 || east > 180 || west === east) {
      throw new ToolError("bad-input", "West and east must be different longitudes between -180 and 180.");
    }
  }
  if (area.kind === "radius") {
    if (!Number.isFinite(area.radiusM) || area.radiusM <= 0) throw new ToolError("bad-input", "Enter a radius above zero.");
    if (area.radiusM > Math.PI * MEAN_RADIUS_M) throw new ToolError("bad-input", "That radius is larger than half the Earth's circumference.");
  }
}

export function randomPoint(area: RandomArea, u: Uniform = cryptoUniform): LatLon {
  if (area.kind === "world") {
    return { lat: deg(Math.asin(2 * u() - 1)), lon: 360 * u() - 180 };
  }
  if (area.kind === "box") {
    const s = Math.sin(rad(area.south));
    const n = Math.sin(rad(area.north));
    // A box whose west edge is east of its east edge crosses the antimeridian.
    const span = area.east > area.west ? area.east - area.west : area.east + 360 - area.west;
    return { lat: deg(Math.asin(s + u() * (n - s))), lon: normalizeLon(area.west + u() * span) };
  }
  const maxAng = area.radiusM / MEAN_RADIUS_M;
  const c = Math.acos(1 - u() * (1 - Math.cos(maxAng)));
  return directSphere(area.centre, 360 * u(), c * MEAN_RADIUS_M);
}

export function randomPoints(area: RandomArea, count: number, u: Uniform = cryptoUniform): LatLon[] {
  validateArea(area);
  if (!Number.isInteger(count) || count < 1 || count > 100) throw new ToolError("bad-input", "Choose between 1 and 100 points.");
  return Array.from({ length: count }, () => randomPoint(area, u));
}

/**
 * Open-Meteo elevation for up to 100 points in one request, used only to skip
 * points the Copernicus DEM records at exactly 0 m (open sea). That is a filter,
 * not a land mask: a few coastal and lake points are also 0.
 */
export async function seaLevelFlags(points: LatLon[]): Promise<boolean[]> {
  const lat = points.map((p) => p.lat.toFixed(5)).join(",");
  const lon = points.map((p) => p.lon.toFixed(5)).join(",");
  const res = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lon}`);
  if (!res.ok) throw new ToolError("unavailable", "The elevation service did not respond, so water could not be filtered out.");
  const j = (await res.json()) as { elevation?: number[] };
  return points.map((_, i) => j.elevation?.[i] === 0);
}
