import { ToolError } from "./errors";

/**
 * Sine bar set-up.
 *
 * Source: Virasak, "Manufacturing Processes 4-5", Unit 3: Sine Bar
 * (open textbook, CC BY), Workforce LibreTexts. Retrieved 2026-10-04 from
 *   https://workforce.libretexts.org/Bookshelves/Manufacturing/Book%3A_Manufacturing_Processes_4-5_(Virasak)/01%3A_Milling_Machines/01.4%3A_Unit_3%3A_Sine_Bar
 *
 *  - "take the SIN of the angle and multiply it by the sine bar length. The
 *     length of the sine bar is the distance between the centers of the sine
 *     bar gauge pins."  ->  H = L sin(theta)
 *  - "sin(theta) = H/L"  ->  theta = asin(H/L)
 *  - Blocks under both rollers: sin(theta) = (H1 - H2) / L
 *  - Worked example: 5.0" bar at 30 deg -> 2.5000".
 *  - Table 1, 5-inch bar (the cross-check): 5 0.4358, 10 0.8682, 15 1.2941,
 *    20 1.7101, 25 2.1131, 30 2.5000, 35 2.8679, 40 3.2139, 45 3.5355,
 *    50 3.8302, 55 4.0958, 60 4.3301.
 */

export const SINE_RETRIEVED = "2026-10-04";
export const SINE_URL =
  "https://workforce.libretexts.org/Bookshelves/Manufacturing/Book%3A_Manufacturing_Processes_4-5_(Virasak)/01%3A_Milling_Machines/01.4%3A_Unit_3%3A_Sine_Bar";

export const TABLE_5IN: readonly { angle: number; height: number }[] = [
  { angle: 5, height: 0.4358 },
  { angle: 10, height: 0.8682 },
  { angle: 15, height: 1.2941 },
  { angle: 20, height: 1.7101 },
  { angle: 25, height: 2.1131 },
  { angle: 30, height: 2.5 },
  { angle: 35, height: 2.8679 },
  { angle: 40, height: 3.2139 },
  { angle: 45, height: 3.5355 },
  { angle: 50, height: 3.8302 },
  { angle: 55, height: 4.0958 },
  { angle: 60, height: 4.3301 },
];

export type LengthUnit = "in" | "mm";

const rad = (deg: number) => (deg * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

export function toDms(d: number): { d: number; m: number; s: number } {
  let totalSec = Math.round(d * 3600);
  const dd = Math.floor(totalSec / 3600);
  totalSec -= dd * 3600;
  const mm = Math.floor(totalSec / 60);
  return { d: dd, m: mm, s: totalSec - mm * 60 };
}

function checkLength(L: number): void {
  if (!Number.isFinite(L)) throw new ToolError("bad-input", "Sine bar length must be a number.");
  if (L <= 0) throw new ToolError("bad-input", "Sine bar length must be more than zero.");
}

export interface HeightResult {
  kind: "height";
  length: number;
  unit: LengthUnit;
  angleDeg: number;
  height: number;
  retrievedAt: string;
}

export interface AngleResult {
  kind: "angle";
  length: number;
  unit: LengthUnit;
  h1: number;
  h2: number;
  angleDeg: number;
  retrievedAt: string;
}

/** Angle in decimal degrees from deg/min/sec parts. */
export function dmsToDeg(d: number, m: number, s: number): number {
  for (const [label, v] of [
    ["Degrees", d],
    ["Minutes", m],
    ["Seconds", s],
  ] as const) {
    if (!Number.isFinite(v)) throw new ToolError("bad-input", `${label} must be a number.`);
    if (v < 0) throw new ToolError("bad-input", `${label} cannot be negative.`);
  }
  if (m >= 60 || s >= 60) throw new ToolError("bad-input", "Minutes and seconds must be less than 60.");
  return d + m / 60 + s / 3600;
}

export function heightForAngle(length: number, unit: LengthUnit, angleDeg: number): HeightResult {
  checkLength(length);
  if (!Number.isFinite(angleDeg)) throw new ToolError("bad-input", "Angle must be a number.");
  if (angleDeg <= 0 || angleDeg >= 90) throw new ToolError("bad-input", "Enter an angle greater than 0° and less than 90°.");
  return { kind: "height", length, unit, angleDeg, height: length * Math.sin(rad(angleDeg)), retrievedAt: SINE_RETRIEVED };
}

export function angleForHeights(length: number, unit: LengthUnit, h1: number, h2: number): AngleResult {
  checkLength(length);
  if (!Number.isFinite(h1) || !Number.isFinite(h2)) throw new ToolError("bad-input", "Block heights must be numbers.");
  if (h1 < 0 || h2 < 0) throw new ToolError("bad-input", "Block heights cannot be negative.");
  const rise = h1 - h2;
  if (rise <= 0) throw new ToolError("bad-input", "The raised end's stack must be taller than the other end's.");
  if (rise >= length) throw new ToolError("bad-input", "The height difference must be less than the sine bar length.");
  return { kind: "angle", length, unit, h1, h2, angleDeg: deg(Math.asin(rise / length)), retrievedAt: SINE_RETRIEVED };
}
