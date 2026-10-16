import { ToolError } from "./errors";
import { circlePoints, inverse, MEAN_RADIUS_M, METRES_PER, type DistanceUnit, type LatLon } from "./geodesy";

/**
 * A radius drawn on the ground: every point at the same geodesic distance from
 * the centre (Vincenty direct on WGS84, see geodesy.ts), so it stays a true
 * radius even where Web Mercator stretches it into an oval.
 *
 * Enclosed area and circumference use a sphere of the mean radius R:
 *   area = 2 pi R^2 (1 - cos(r / R))   (spherical cap)
 *   circumference = 2 pi R sin(r / R)
 * Both tend to pi r^2 and 2 pi r for small r.
 */

export interface RadiusRing {
  radius: number;
  unit: DistanceUnit;
  metres: number;
  points: LatLon[];
  areaKm2: number;
  areaMi2: number;
  circumferenceM: number;
}

export function ring(centre: LatLon, radius: number, unit: DistanceUnit): RadiusRing {
  if (!Number.isFinite(radius) || radius <= 0) throw new ToolError("bad-input", "Enter a radius above zero.");
  const metres = radius * METRES_PER[unit];
  if (metres > 10_000_000) throw new ToolError("bad-input", "Radii above 10,000 km wrap past the far side of the Earth.");
  const a = metres / MEAN_RADIUS_M;
  const areaM2 = 2 * Math.PI * MEAN_RADIUS_M ** 2 * (1 - Math.cos(a));
  return {
    radius,
    unit,
    metres,
    points: circlePoints(centre, metres, 180),
    areaKm2: areaM2 / 1e6,
    areaMi2: areaM2 / METRES_PER.mi ** 2,
    circumferenceM: 2 * Math.PI * MEAN_RADIUS_M * Math.sin(a),
  };
}

export interface InsideCheck {
  metres: number;
  /** Per ring: is the place within it? */
  inside: boolean[];
}

export function checkInside(centre: LatLon, place: LatLon, rings: RadiusRing[]): InsideCheck {
  const metres = inverse(centre, place).metres;
  return { metres, inside: rings.map((r) => metres <= r.metres) };
}
