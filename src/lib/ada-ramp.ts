import { ToolError } from "./errors";

/**
 * Ramp length, runs, landings and handrails under the 2010 ADA Standards for
 * Accessible Design (U.S. Department of Justice), Sections 303 and 405.
 *
 * Text read 2026-10-03 from:
 *   https://www.ada.gov/law-and-regs/design-standards/2010-stds/
 *
 * The rules used:
 *   303.2-303.4  ≤ 1/4 in may be vertical; 1/4-1/2 in beveled no steeper than 1:2;
 *                more than 1/2 in must be ramped (405 or 406)
 *   405.2        running slope not steeper than 1:12; Table 405.2 allows 1:10
 *                (max rise 6 in) and 1:8 (max rise 3 in) in EXISTING facilities
 *                where space limits require it; steeper than 1:8 prohibited
 *   405.5        clear width 36 in minimum
 *   405.6        rise for any ramp run 30 in maximum
 *   405.7        landings at the top and bottom of each run; 60 in long minimum;
 *                60 x 60 in where the ramp changes direction
 *   405.8        runs with a rise greater than 6 in need handrails
 *
 * This module makes NO network request. It reports what the standard's
 * figures give for the rise entered. The ADA Standards apply to public
 * accommodations, commercial facilities and state and local government
 * facilities; this page says so rather than deciding whether they apply.
 */

const SOURCE_RETRIEVED = "2026-10-03";

export type SlopeChoice = "1:12" | "1:10" | "1:8";
export type RiseUnit = "in" | "cm";

const MAX_RUN_RISE_IN = 30;
const HANDRAIL_TRIGGER_IN = 6;
const LANDING_LENGTH_IN = 60;
const MIN_CLEAR_WIDTH_IN = 36;

/** Table 405.2 — maximum total rise allowed at each steeper-than-1:12 slope, existing facilities only. */
const EXISTING_MAX_RISE_IN: Record<Exclude<SlopeChoice, "1:12">, number> = {
  "1:10": 6,
  "1:8": 3,
};

const RATIO: Record<SlopeChoice, number> = { "1:12": 12, "1:10": 10, "1:8": 8 };

/** Anything taller than this is a multi-storey change in level, not a ramp question. */
const MAX_PLAUSIBLE_RISE_IN = 600;

export interface RampInput {
  rise: number;
  unit: RiseUnit;
  slope: SlopeChoice;
}

export type RampOutcome =
  | { kind: "no-ramp"; reason: string; section: string }
  | { kind: "not-permitted"; reason: string; section: string }
  | { kind: "ramp" };

export interface RampResult {
  riseIn: number;
  slope: SlopeChoice;
  outcome: RampOutcome;
  /** Total horizontal length of sloped ramp, inches. Zero when no ramp applies. */
  runLengthIn: number;
  runs: number;
  /** Rise of each run, inches — runs are split evenly. */
  risePerRunIn: number;
  /** Landings: top, bottom and one between each pair of runs. */
  landings: number;
  intermediateLandings: number;
  /** Ramp runs plus the 60-in minimum length of each landing, for a straight ramp. */
  straightLineLengthIn: number;
  handrailsRequired: boolean;
  slopePercent: number;
  minClearWidthIn: number;
  landingLengthIn: number;
  retrievedAt: string;
}

export function toInches(value: number, unit: RiseUnit): number {
  return unit === "in" ? value : value / 2.54;
}

export function calculateRamp(input: RampInput): RampResult {
  if (!Number.isFinite(input.rise)) {
    throw new ToolError("bad-input", "Enter the rise as a number.");
  }
  if (input.rise <= 0) {
    throw new ToolError(
      "bad-input",
      "Enter a rise greater than zero — the vertical height from the lower surface to the upper one.",
    );
  }
  const riseIn = toInches(input.rise, input.unit);
  if (riseIn > MAX_PLAUSIBLE_RISE_IN) {
    throw new ToolError(
      "bad-input",
      "That rise is more than 50 feet. Check the unit — the rise is entered in inches or centimetres, not feet.",
    );
  }

  const base = {
    riseIn,
    slope: input.slope,
    runLengthIn: 0,
    runs: 0,
    risePerRunIn: 0,
    landings: 0,
    intermediateLandings: 0,
    straightLineLengthIn: 0,
    handrailsRequired: false,
    slopePercent: (1 / RATIO[input.slope]) * 100,
    minClearWidthIn: MIN_CLEAR_WIDTH_IN,
    landingLengthIn: LANDING_LENGTH_IN,
    retrievedAt: SOURCE_RETRIEVED,
  };

  if (riseIn <= 0.25) {
    return {
      ...base,
      outcome: {
        kind: "no-ramp",
        reason: "A change in level of 1/4 inch or less is permitted to be vertical.",
        section: "§303.2",
      },
    };
  }
  if (riseIn <= 0.5) {
    return {
      ...base,
      outcome: {
        kind: "no-ramp",
        reason:
          "A change in level between 1/4 inch and 1/2 inch is permitted as a bevel no steeper than 1:2, rather than a ramp.",
        section: "§303.3",
      },
    };
  }

  if (input.slope !== "1:12") {
    const limit = EXISTING_MAX_RISE_IN[input.slope];
    if (riseIn > limit) {
      return {
        ...base,
        outcome: {
          kind: "not-permitted",
          reason: `Table 405.2 allows a ${input.slope} slope only for a total rise of ${limit} inches or less, and only in existing sites, buildings and facilities where space limitations make it necessary. This rise is ${trim(riseIn)} inches.`,
          section: "§405.2, Table 405.2",
        },
      };
    }
  }

  const runs = Math.ceil(riseIn / MAX_RUN_RISE_IN);
  const risePerRunIn = riseIn / runs;
  const runLengthIn = riseIn * RATIO[input.slope];
  const landings = runs + 1;
  const intermediateLandings = runs - 1;

  return {
    ...base,
    outcome: { kind: "ramp" },
    runLengthIn,
    runs,
    risePerRunIn,
    landings,
    intermediateLandings,
    straightLineLengthIn: runLengthIn + landings * LANDING_LENGTH_IN,
    handrailsRequired: risePerRunIn > HANDRAIL_TRIGGER_IN,
  };
}

function trim(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

/** "24 ft 6 in" from inches, rounded to the nearest half inch. */
export function feetAndInches(totalIn: number): string {
  const rounded = Math.round(totalIn * 2) / 2;
  const ft = Math.floor(rounded / 12);
  const inch = rounded - ft * 12;
  if (ft === 0) return `${trim(inch)} in`;
  if (inch === 0) return `${ft} ft`;
  return `${ft} ft ${trim(inch)} in`;
}

export function formatNumber(n: number, maxDecimals = 2): string {
  return n.toLocaleString("en-US", {
    maximumFractionDigits: maxDecimals,
    minimumFractionDigits: 0,
  });
}
