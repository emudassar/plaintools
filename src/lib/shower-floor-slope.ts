import { ToolError } from "./errors";

/**
 * Shower floor slope — 2021 International Residential Code, Section P2709.1
 * (and the shower-liner pitch in 2021 IPC Section 421.5.2). Read on
 * codes.iccsafe.org (free public view) on 2026-10-04:
 *   https://codes.iccsafe.org/content/IRC2021P2/chapter-27-plumbing-fixtures
 *   https://codes.iccsafe.org/content/IPC2021P2/chapter-4-fixtures-faucets-and-fixture-fittings
 *
 * IRC P2709.1 (verbatim): "Where a shower receptor has a finished curb
 * threshold, it shall be not less than 1 inch (25.4 mm) below the sides and
 * back of the receptor. The curb shall be not less than 2 inches (51 mm) and
 * not more than 9 inches (229 mm) deep when measured from the top of the curb
 * to the top of the drain. The finished floor shall slope uniformly toward the
 * drain not less than 1/4 unit vertical in 12 units horizontal (2-percent
 * slope) nor more than 1/2 unit vertical per 12 units horizontal (4-percent
 * slope)..."
 *
 * IPC 421.5.2 (verbatim, liner): "Liners shall be pitched one-fourth unit
 * vertical in 12 units horizontal (2-percent slope) and shall be sloped toward
 * the fixture drains..."
 */

export const SLOPE_RETRIEVED = "2026-10-04";
export const IRC_CH27_URL =
  "https://codes.iccsafe.org/content/IRC2021P2/chapter-27-plumbing-fixtures";
export const IPC_CH4_URL =
  "https://codes.iccsafe.org/content/IPC2021P2/chapter-4-fixtures-faucets-and-fixture-fittings";

export const MIN_IN_PER_FT = 0.25;
export const MAX_IN_PER_FT = 0.5;
export const CURB_MIN_IN = 2;
export const CURB_MAX_IN = 9;

export const QUOTES = {
  slope:
    "The finished floor shall slope uniformly toward the drain not less than 1/4 unit vertical in 12 units horizontal (2-percent slope) nor more than 1/2 unit vertical per 12 units horizontal (4-percent slope)",
  curb: "The curb shall be not less than 2 inches (51 mm) and not more than 9 inches (229 mm) deep when measured from the top of the curb to the top of the drain.",
  liner:
    "Liners shall be pitched one-fourth unit vertical in 12 units horizontal (2-percent slope) and shall be sloped toward the fixture drains",
} as const;

export type LenUnit = "in" | "ft" | "mm" | "cm";

export function toInches(v: number, u: LenUnit): number {
  switch (u) {
    case "in":
      return v;
    case "ft":
      return v * 12;
    case "mm":
      return v / 25.4;
    case "cm":
      return v / 2.54;
  }
}

/**
 * To 1/16 inch, as "1 5/16″". `up`/`down` round toward the inside of a range
 * so a displayed minimum is never below the true minimum and a displayed
 * maximum never above the true maximum.
 */
export function toFraction(
  inches: number,
  mode: "nearest" | "up" | "down" = "nearest",
): string {
  const raw = inches * 16;
  const sixteenths =
    mode === "up"
      ? Math.ceil(raw - 1e-9)
      : mode === "down"
        ? Math.floor(raw + 1e-9)
        : Math.round(raw);
  const whole = Math.floor(sixteenths / 16);
  let rem = sixteenths - whole * 16;
  let den = 16;
  while (rem > 0 && rem % 2 === 0) {
    rem /= 2;
    den /= 2;
  }
  if (rem === 0) return `${whole}″`;
  return whole > 0 ? `${whole} ${rem}/${den}″` : `${rem}/${den}″`;
}

export interface SlopeInput {
  /** Horizontal run from the drain to the farthest edge of the floor. */
  run: number;
  runUnit: LenUnit;
  /** Optional planned height of the floor at that edge above the drain. */
  plannedRise: number | null;
  riseUnit: LenUnit;
  /** Optional curb depth: top of curb to top of drain. */
  curbDepth: number | null;
  curbUnit: LenUnit;
}

export interface SlopeResult {
  runIn: number;
  minRiseIn: number;
  maxRiseIn: number;
  planned: {
    riseIn: number;
    inPerFt: number;
    percent: number;
    verdict: "below" | "within" | "above";
  } | null;
  curb: { depthIn: number; verdict: "below" | "within" | "above" } | null;
  retrievedAt: string;
}

function posNum(label: string, v: number) {
  if (!Number.isFinite(v))
    throw new ToolError("bad-input", `${label} must be a number.`);
  if (v <= 0)
    throw new ToolError("bad-input", `${label} must be more than zero.`);
}

export function calculateShowerSlope(input: SlopeInput): SlopeResult {
  posNum("Distance from the drain", input.run);
  const runIn = toInches(input.run, input.runUnit);
  if (runIn > 240)
    throw new ToolError(
      "bad-input",
      "That is over 20 feet from the drain. Check the units.",
    );

  let planned: SlopeResult["planned"] = null;
  if (input.plannedRise !== null) {
    posNum("Planned height at the edge", input.plannedRise);
    const riseIn = toInches(input.plannedRise, input.riseUnit);
    const inPerFt = (riseIn / runIn) * 12;
    const eps = 1e-9;
    planned = {
      riseIn,
      inPerFt,
      percent: (riseIn / runIn) * 100,
      verdict:
        inPerFt < MIN_IN_PER_FT - eps
          ? "below"
          : inPerFt > MAX_IN_PER_FT + eps
            ? "above"
            : "within",
    };
  }

  let curb: SlopeResult["curb"] = null;
  if (input.curbDepth !== null) {
    posNum("Curb depth", input.curbDepth);
    const depthIn = toInches(input.curbDepth, input.curbUnit);
    curb = {
      depthIn,
      verdict:
        depthIn < CURB_MIN_IN
          ? "below"
          : depthIn > CURB_MAX_IN
            ? "above"
            : "within",
    };
  }

  return {
    runIn,
    minRiseIn: (runIn / 12) * MIN_IN_PER_FT,
    maxRiseIn: (runIn / 12) * MAX_IN_PER_FT,
    planned,
    curb,
    retrievedAt: SLOPE_RETRIEVED,
  };
}
