import { ToolError } from "./errors";

/**
 * Draw an angle in standard position, with quadrant, reference angle and
 * coterminal angles.
 *
 * Source: OpenStax, Precalculus 2e, §5.1 "Angles" (CC BY-NC-SA 4.0), retrieved
 * 2026-10-05 from https://openstax.org/books/precalculus-2e/pages/5-1-angles
 *  - Standard position: vertex at the origin, initial side along the positive
 *    x-axis; counterclockwise = positive, clockwise = negative.
 *  - Quadrantal angles: terminal side on an axis (0, 90, 180, 270, 360 deg).
 *  - Coterminal angles share a terminal side: add or subtract 360 deg (2 pi).
 *  - Reference angle: "the smallest, positive, acute angle ... formed by the
 *    terminal side of the angle t and the horizontal axis" — so a quadrantal
 *    angle has none.
 *  - theta / 180 = theta_R / pi.
 */

export const ANGLE_RETRIEVED = "2026-10-05";
export const OPENSTAX_URL = "https://openstax.org/books/precalculus-2e/pages/5-1-angles";

export type AngleUnit = "deg" | "rad";

export interface AngleResult {
  degrees: number;
  /** Equivalent angle in [0, 360). */
  normalized: number;
  /** Whole turns before the final partial turn (sign follows the angle). */
  fullTurns: number;
  direction: "counterclockwise" | "clockwise" | "none";
  quadrant: "I" | "II" | "III" | "IV" | null;
  axis: "positive x-axis" | "positive y-axis" | "negative x-axis" | "negative y-axis" | null;
  referenceDegrees: number | null;
  radiansText: string;
  radians: number;
  coterminal: { positive: number; negative: number };
  sin: number;
  cos: number;
  tan: number | null;
  retrievedAt: string;
}

const EPS = 1e-9;

/** Parses "135", "-45.5", "3pi/4", "3π/4", "-pi", "pi/6", "2.1". */
export function parseAngle(text: string, unit: AngleUnit): number {
  const s = text.trim().toLowerCase().replace(/\s+/g, "").replace(/π/g, "pi");
  if (s === "") throw new ToolError("bad-input", "Enter an angle.");
  if (s.includes("pi")) {
    const m = s.match(/^([+-]?\d*\.?\d*)\*?pi(?:\/(\d+\.?\d*))?$/);
    if (!m) throw new ToolError("bad-input", "Write a multiple of π like 3π/4, -π/6 or 2pi.");
    const coef = m[1] === "" || m[1] === "+" ? 1 : m[1] === "-" ? -1 : Number(m[1]);
    const den = m[2] ? Number(m[2]) : 1;
    if (!Number.isFinite(coef) || !Number.isFinite(den) || den === 0) throw new ToolError("bad-input", "That multiple of π could not be read.");
    return (coef / den) * 180;
  }
  const v = Number(s);
  if (!Number.isFinite(v)) throw new ToolError("bad-input", "Enter a number, or a multiple of π in radians.");
  return unit === "deg" ? v : (v * 180) / Math.PI;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/** Radians as an exact multiple of π when the degrees are a whole or half number. */
export function radiansText(deg: number): string {
  const doubled = Math.round(deg * 2);
  if (Math.abs(deg * 2 - doubled) < 1e-7) {
    let num = doubled;
    let den = 360;
    const g = gcd(Math.abs(num), den) || 1;
    num /= g;
    den /= g;
    if (num === 0) return "0";
    if (den <= 360) {
      const sign = num < 0 ? "−" : "";
      const a = Math.abs(num);
      const top = a === 1 ? "π" : `${a}π`;
      return den === 1 ? `${sign}${top}` : `${sign}${top}/${den}`;
    }
  }
  return ((deg * Math.PI) / 180).toFixed(4);
}

const clean = (x: number) => (Math.abs(x) < 1e-12 ? 0 : x);

export function analyzeAngle(degrees: number): AngleResult {
  if (!Number.isFinite(degrees)) throw new ToolError("bad-input", "Enter a finite angle.");
  if (Math.abs(degrees) > 360 * 100) throw new ToolError("bad-input", "That is more than 100 full turns. Enter a smaller angle.");
  let normalized = ((degrees % 360) + 360) % 360;
  if (Math.abs(normalized - 360) < EPS) normalized = 0;
  const fullTurns = Math.trunc(degrees / 360 + (degrees >= 0 ? EPS : -EPS)) ;

  let quadrant: AngleResult["quadrant"] = null;
  let axis: AngleResult["axis"] = null;
  const onAxis = (t: number) => Math.abs(normalized - t) < EPS;
  if (onAxis(0)) axis = "positive x-axis";
  else if (onAxis(90)) axis = "positive y-axis";
  else if (onAxis(180)) axis = "negative x-axis";
  else if (onAxis(270)) axis = "negative y-axis";
  else quadrant = normalized < 90 ? "I" : normalized < 180 ? "II" : normalized < 270 ? "III" : "IV";

  const referenceDegrees =
    quadrant === "I" ? normalized : quadrant === "II" ? 180 - normalized : quadrant === "III" ? normalized - 180 : quadrant === "IV" ? 360 - normalized : null;

  const r = (degrees * Math.PI) / 180;
  const sin = clean(Math.sin(r));
  const cos = clean(Math.cos(r));
  return {
    degrees,
    normalized,
    fullTurns,
    direction: degrees > 0 ? "counterclockwise" : degrees < 0 ? "clockwise" : "none",
    quadrant,
    axis,
    referenceDegrees,
    radiansText: radiansText(degrees),
    radians: r,
    coterminal: { positive: normalized === 0 ? 360 : normalized, negative: normalized - 360 },
    sin,
    cos,
    tan: axis === "positive y-axis" || axis === "negative y-axis" ? null : clean(Math.tan(r)),
    retrievedAt: ANGLE_RETRIEVED,
  };
}
