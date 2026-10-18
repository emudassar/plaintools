/**
 * Rhumb line (loxodrome): the path of constant compass heading, a straight line on a Mercator
 * chart. Spherical formulas from Ed Williams' Aviation Formulary ("Rhumb line navigation"),
 * on a sphere of the mean Earth radius. Accurate to a fraction of a percent; the true
 * shortest route (great circle / geodesic) is computed elsewhere.
 */
import { MEAN_RADIUS_M, normalizeBearing, type LatLon } from "./geodesy";

export const AVFORM_URL = "https://edwilliams.org/avform147.htm";

const RAD = Math.PI / 180;

export function rhumb(a: LatLon, b: LatLon): { bearing: number; metres: number } {
  const φ1 = a.lat * RAD, φ2 = b.lat * RAD;
  let Δλ = (b.lon - a.lon) * RAD;
  if (Math.abs(Δλ) > Math.PI) Δλ = Δλ > 0 ? -(2 * Math.PI - Δλ) : 2 * Math.PI + Δλ;
  const Δψ = Math.log(Math.tan(Math.PI / 4 + φ2 / 2) / Math.tan(Math.PI / 4 + φ1 / 2));
  const Δφ = φ2 - φ1;
  const q = Math.abs(Δψ) > 1e-12 ? Δφ / Δψ : Math.cos(φ1);
  const θ = Math.atan2(Δλ, Δψ);
  return { bearing: normalizeBearing(θ / RAD), metres: Math.sqrt(Δφ * Δφ + q * q * Δλ * Δλ) * MEAN_RADIUS_M };
}
