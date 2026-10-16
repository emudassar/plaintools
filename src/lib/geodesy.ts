/**
 * Distances, bearings and points on the WGS84 ellipsoid.
 *
 * Vincenty, T. (1975) "Direct and inverse solutions of geodesics on the
 * ellipsoid with application of nested equations", Survey Review XXIII(176).
 * Copy hosted by NOAA NGS: https://www.ngs.noaa.gov/PUBS_LIB/inverse.pdf
 * Iteration and constants follow the paper; WGS84 a = 6378137 m,
 * f = 1/298.257223563.
 *
 * Vincenty's inverse can fail to converge for nearly antipodal points. Then the
 * result falls back to a sphere (mean radius 6,371,008.8 m) and says so in
 * `method`, rather than returning a wrong ellipsoidal number.
 */

export const WGS84_A = 6378137;
export const WGS84_F = 1 / 298.257223563;
export const WGS84_B = WGS84_A * (1 - WGS84_F);
/** IUGG mean Earth radius R1, metres. */
export const MEAN_RADIUS_M = 6371008.8;

export const VINCENTY_URL = "https://www.ngs.noaa.gov/PUBS_LIB/inverse.pdf";

const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;

export interface LatLon {
  lat: number;
  lon: number;
}

export function normalizeLon(lon: number): number {
  const x = ((((lon + 180) % 360) + 360) % 360) - 180;
  return x === -180 && lon > 0 ? 180 : x;
}

export function normalizeBearing(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

export interface InverseResult {
  metres: number;
  /** Initial bearing from the first point, degrees clockwise from true north. */
  initialBearing: number;
  /** Bearing on arrival at the second point. */
  finalBearing: number;
  method: "ellipsoid" | "sphere";
}

/** Great-circle distance and bearings on a sphere of the mean radius. */
export function haversine(a: LatLon, b: LatLon): InverseResult {
  const φ1 = toRad(a.lat);
  const φ2 = toRad(b.lat);
  const Δφ = φ2 - φ1;
  const Δλ = toRad(normalizeLon(b.lon - a.lon));
  const h = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1 - h)));
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const y2 = Math.sin(-Δλ) * Math.cos(φ1);
  const x2 = Math.cos(φ2) * Math.sin(φ1) - Math.sin(φ2) * Math.cos(φ1) * Math.cos(-Δλ);
  return {
    metres: MEAN_RADIUS_M * c,
    initialBearing: normalizeBearing(toDeg(Math.atan2(y, x))),
    finalBearing: normalizeBearing(toDeg(Math.atan2(y2, x2)) + 180),
    method: "sphere",
  };
}

/** Vincenty inverse. Falls back to `haversine` if the iteration does not converge. */
export function inverse(a: LatLon, b: LatLon): InverseResult {
  const f = WGS84_F;
  const L = toRad(normalizeLon(b.lon - a.lon));
  const U1 = Math.atan((1 - f) * Math.tan(toRad(a.lat)));
  const U2 = Math.atan((1 - f) * Math.tan(toRad(b.lat)));
  const sinU1 = Math.sin(U1), cosU1 = Math.cos(U1);
  const sinU2 = Math.sin(U2), cosU2 = Math.cos(U2);

  let λ = L;
  let sinσ = 0, cosσ = 1, σ = 0, cos2α = 1, cos2σm = 0, sinλ = 0, cosλ = 1;
  let converged = false;
  for (let i = 0; i < 200; i++) {
    sinλ = Math.sin(λ);
    cosλ = Math.cos(λ);
    sinσ = Math.sqrt((cosU2 * sinλ) ** 2 + (cosU1 * sinU2 - sinU1 * cosU2 * cosλ) ** 2);
    if (sinσ === 0) {
      // Coincident points.
      return { metres: 0, initialBearing: 0, finalBearing: 0, method: "ellipsoid" };
    }
    cosσ = sinU1 * sinU2 + cosU1 * cosU2 * cosλ;
    σ = Math.atan2(sinσ, cosσ);
    const sinα = (cosU1 * cosU2 * sinλ) / sinσ;
    cos2α = 1 - sinα * sinα;
    cos2σm = cos2α !== 0 ? cosσ - (2 * sinU1 * sinU2) / cos2α : 0; // equatorial line
    const C = (f / 16) * cos2α * (4 + f * (4 - 3 * cos2α));
    const λPrev = λ;
    λ = L + (1 - C) * f * sinα * (σ + C * sinσ * (cos2σm + C * cosσ * (-1 + 2 * cos2σm * cos2σm)));
    if (Math.abs(λ - λPrev) < 1e-12) {
      converged = true;
      break;
    }
    if (Math.abs(λ) > Math.PI * 1.5) break;
  }
  if (!converged) return haversine(a, b);

  const u2 = (cos2α * (WGS84_A ** 2 - WGS84_B ** 2)) / WGS84_B ** 2;
  const A = 1 + (u2 / 16384) * (4096 + u2 * (-768 + u2 * (320 - 175 * u2)));
  const B = (u2 / 1024) * (256 + u2 * (-128 + u2 * (74 - 47 * u2)));
  const Δσ =
    B * sinσ *
    (cos2σm + (B / 4) * (cosσ * (-1 + 2 * cos2σm ** 2) -
      (B / 6) * cos2σm * (-3 + 4 * sinσ ** 2) * (-3 + 4 * cos2σm ** 2)));
  const s = WGS84_B * A * (σ - Δσ);
  const α1 = Math.atan2(cosU2 * sinλ, cosU1 * sinU2 - sinU1 * cosU2 * cosλ);
  const α2 = Math.atan2(cosU1 * sinλ, -sinU1 * cosU2 + cosU1 * sinU2 * cosλ);
  return {
    metres: s,
    initialBearing: normalizeBearing(toDeg(α1)),
    finalBearing: normalizeBearing(toDeg(α2)),
    method: "ellipsoid",
  };
}

/** Vincenty direct: the point `metres` from `a` along initial bearing `bearingDeg`. */
export function direct(a: LatLon, bearingDeg: number, metres: number): LatLon & { finalBearing: number } {
  const f = WGS84_F;
  const α1 = toRad(bearingDeg);
  const sinα1 = Math.sin(α1), cosα1 = Math.cos(α1);
  const tanU1 = (1 - f) * Math.tan(toRad(a.lat));
  const cosU1 = 1 / Math.sqrt(1 + tanU1 * tanU1);
  const sinU1 = tanU1 * cosU1;
  const σ1 = Math.atan2(tanU1, cosα1);
  const sinα = cosU1 * sinα1;
  const cos2α = 1 - sinα * sinα;
  const u2 = (cos2α * (WGS84_A ** 2 - WGS84_B ** 2)) / WGS84_B ** 2;
  const A = 1 + (u2 / 16384) * (4096 + u2 * (-768 + u2 * (320 - 175 * u2)));
  const B = (u2 / 1024) * (256 + u2 * (-128 + u2 * (74 - 47 * u2)));

  let σ = metres / (WGS84_B * A);
  let cos2σm = 0, sinσ = 0, cosσ = 1;
  for (let i = 0; i < 200; i++) {
    cos2σm = Math.cos(2 * σ1 + σ);
    sinσ = Math.sin(σ);
    cosσ = Math.cos(σ);
    const Δσ =
      B * sinσ *
      (cos2σm + (B / 4) * (cosσ * (-1 + 2 * cos2σm ** 2) -
        (B / 6) * cos2σm * (-3 + 4 * sinσ ** 2) * (-3 + 4 * cos2σm ** 2)));
    const σPrev = σ;
    σ = metres / (WGS84_B * A) + Δσ;
    if (Math.abs(σ - σPrev) < 1e-12) break;
  }
  sinσ = Math.sin(σ);
  cosσ = Math.cos(σ);
  cos2σm = Math.cos(2 * σ1 + σ);
  const x = sinU1 * sinσ - cosU1 * cosσ * cosα1;
  const φ2 = Math.atan2(sinU1 * cosσ + cosU1 * sinσ * cosα1, (1 - f) * Math.sqrt(sinα * sinα + x * x));
  const λ = Math.atan2(sinσ * sinα1, cosU1 * cosσ - sinU1 * sinσ * cosα1);
  const C = (f / 16) * cos2α * (4 + f * (4 - 3 * cos2α));
  const L = λ - (1 - C) * f * sinα * (σ + C * sinσ * (cos2σm + C * cosσ * (-1 + 2 * cos2σm * cos2σm)));
  return {
    lat: toDeg(φ2),
    lon: normalizeLon(a.lon + toDeg(L)),
    finalBearing: normalizeBearing(toDeg(Math.atan2(sinα, -x))),
  };
}

/** Destination on a sphere of the mean radius (used where a sphere is the stated model). */
export function directSphere(a: LatLon, bearingDeg: number, metres: number): LatLon {
  const δ = metres / MEAN_RADIUS_M;
  const θ = toRad(bearingDeg);
  const φ1 = toRad(a.lat);
  const φ2 = Math.asin(Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ));
  const λ2 =
    toRad(a.lon) +
    Math.atan2(Math.sin(θ) * Math.sin(δ) * Math.cos(φ1), Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2));
  return { lat: toDeg(φ2), lon: normalizeLon(toDeg(λ2)) };
}

/**
 * The point a given fraction of the way along the shortest path from a to b.
 * Ellipsoidal (Vincenty inverse then direct) when the inverse converges.
 */
export function pointAlong(a: LatLon, b: LatLon, fraction: number): LatLon & { method: InverseResult["method"] } {
  const inv = inverse(a, b);
  if (inv.method === "ellipsoid") {
    const p = direct(a, inv.initialBearing, inv.metres * fraction);
    return { lat: p.lat, lon: p.lon, method: "ellipsoid" };
  }
  const p = directSphere(a, inv.initialBearing, inv.metres * fraction);
  return { ...p, method: "sphere" };
}

/** Points along the path, for drawing. */
export function pathPoints(a: LatLon, b: LatLon, steps = 64): LatLon[] {
  const inv = inverse(a, b);
  const out: LatLon[] = [];
  for (let i = 0; i <= steps; i++) {
    const s = (inv.metres * i) / steps;
    out.push(inv.method === "ellipsoid" ? direct(a, inv.initialBearing, s) : directSphere(a, inv.initialBearing, s));
  }
  return out;
}

/** Ring of points at a fixed geodesic distance from a centre, for drawing a radius. */
export function circlePoints(c: LatLon, metres: number, steps = 120): LatLon[] {
  const out: LatLon[] = [];
  for (let i = 0; i <= steps; i++) out.push(direct(c, (360 * i) / steps, metres));
  return out;
}

export const METRES_PER = { km: 1000, mi: 1609.344, nmi: 1852, m: 1, ft: 0.3048 } as const;
export type DistanceUnit = keyof typeof METRES_PER;

export const COMPASS_16 = [
  "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
  "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
] as const;

export function compassPoint(bearing: number): string {
  return COMPASS_16[Math.round(normalizeBearing(bearing) / 22.5) % 16];
}

/** "40.74844° N, 73.98566° W" */
export function formatLatLon(p: LatLon, digits = 5): string {
  const lat = `${Math.abs(p.lat).toFixed(digits)}° ${p.lat >= 0 ? "N" : "S"}`;
  const lon = `${Math.abs(p.lon).toFixed(digits)}° ${p.lon >= 0 ? "E" : "W"}`;
  return `${lat}, ${lon}`;
}

/** Degrees, minutes, seconds: 40° 44′ 54.4″ N */
export function toDms(deg: number, isLat: boolean): string {
  const hemi = isLat ? (deg >= 0 ? "N" : "S") : deg >= 0 ? "E" : "W";
  let a = Math.abs(deg);
  let d = Math.floor(a);
  let m = Math.floor((a - d) * 60);
  let s = Math.round(((a - d) * 60 - m) * 60 * 10) / 10;
  if (s >= 60) { s = 0; m += 1; }
  if (m >= 60) { m = 0; d += 1; }
  a = d;
  return `${a}° ${m}′ ${s.toFixed(1)}″ ${hemi}`;
}
