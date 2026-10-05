import { ToolError } from "./errors";

/**
 * Stair stringer layout for deck-style stairs.
 *
 * Source: American Wood Council, DCA 6 — Prescriptive Residential Wood Deck
 * Construction Guide (2015 IRC edition), pp. 20–21 "Stair Requirements",
 * Figures 27–30, retrieved 2026-10-05:
 *  - Fig. 27: "7-3/4" maximum riser; height shall not deviate from one another
 *    by more than 3/8""; "10" minimum tread width"; "3/4" - 1-1/4" nosing".
 *  - "All stringers shall be a minimum of 2x12." Fig. 28: cut stringer
 *    "max. span = 6'-0"" (horizontal), "5" min." throat; solid stringer
 *    "max. span = 13'-3"".
 *  - "If the total vertical height of a stairway exceeds 12'-0", then an
 *    intermediate landing shall be required."
 *  - "Stairs shall be a minimum of 36" in width"; "If only cut stringers are
 *    used, a minimum of three are required"; spacing "maximum ... 18" on
 *    center" (Fig. 29 "18" max").
 *  - "All stairs with 4 or more risers shall have a handrail"; Fig. 30 "stair
 *    guard is required for stairs with a total rise of 30" or more".
 *  - Commentary: "Cut stringers were analyzed with 5.1" depth which is based
 *    on 7.75:10 rise to run ratio" — the throat formula below gives 5.12 in for
 *    a 2x12 (11-1/4 in) at 7.75/10, matching it.
 *
 * Geometry: risers = ceil(total rise / max riser); each riser = rise / count;
 * treads = risers - 1 (the deck is the top step); total run = treads x tread.
 * Throat = board width - r t / sqrt(r^2 + t^2).
 */

export const STAIR_RETRIEVED = "2026-10-05";
export const DCA6_URL = "https://web-media.awc.org/wp-content/uploads/2022/02/17210514/AWC-DCA62015-DeckGuide-1804.pdf";

export const MAX_RISER_IN = 7.75;
export const MIN_TREAD_IN = 10;
export const MIN_THROAT_IN = 5;
export const CUT_SPAN_MAX_IN = 72;
export const SOLID_SPAN_MAX_IN = 159;
export const LANDING_RISE_IN = 144;
export const MIN_WIDTH_IN = 36;
export const MAX_SPACING_IN = 18;

export interface StairInput {
  /** Total rise, inches, from landing surface to deck surface. */
  totalRiseIn: number;
  /** Largest riser to allow, inches (≤ 7.75 to stay inside DCA 6). */
  maxRiserIn: number;
  /** Tread depth (run per step), inches. */
  treadIn: number;
  /** Actual width of the stringer board, inches (2x12 = 11.25). */
  boardWidthIn: number;
  /** Stair width, inches, or null. */
  stairWidthIn: number | null;
}

export interface StairResult {
  risers: number;
  riserIn: number;
  treads: number;
  totalRunIn: number;
  slopeLengthIn: number;
  stepDiagonalIn: number;
  angleDeg: number;
  throatIn: number;
  cutStringers: number | null;
  checks: {
    riser: boolean;
    tread: boolean;
    throat: boolean;
    cutSpan: boolean;
    solidSpan: boolean;
    landingRequired: boolean;
    handrail: boolean;
    guard: boolean;
    width: boolean | null;
  };
  retrievedAt: string;
}

function pos(label: string, v: number, max: number) {
  if (!Number.isFinite(v) || v <= 0) throw new ToolError("bad-input", `${label} must be more than zero.`);
  if (v > max) throw new ToolError("bad-input", `${label} looks too large. Check it is in inches.`);
}

export function calculateStairStringer(input: StairInput): StairResult {
  pos("Total rise", input.totalRiseIn, 600);
  pos("Maximum riser", input.maxRiserIn, 12);
  pos("Tread depth", input.treadIn, 30);
  pos("Stringer board width", input.boardWidthIn, 24);
  if (input.maxRiserIn < 4) throw new ToolError("bad-input", "A maximum riser under 4 inches is not a stair. Check the value.");
  if (input.stairWidthIn !== null) pos("Stair width", input.stairWidthIn, 240);

  const risers = Math.ceil(input.totalRiseIn / input.maxRiserIn - 1e-9);
  const riserIn = input.totalRiseIn / risers;
  if (risers < 2) throw new ToolError("no-data", "That rise is a single step — there is no stringer to lay out.");
  const treads = risers - 1;
  const totalRunIn = treads * input.treadIn;
  const r = riserIn;
  const t = input.treadIn;
  const stepDiagonalIn = Math.hypot(r, t);
  const throatIn = input.boardWidthIn - (r * t) / stepDiagonalIn;

  let cutStringers: number | null = null;
  if (input.stairWidthIn !== null) cutStringers = Math.max(3, Math.ceil(input.stairWidthIn / MAX_SPACING_IN) + 1);

  return {
    risers,
    riserIn,
    treads,
    totalRunIn,
    slopeLengthIn: Math.hypot(input.totalRiseIn, totalRunIn),
    stepDiagonalIn,
    angleDeg: (Math.atan2(r, t) * 180) / Math.PI,
    throatIn,
    cutStringers,
    checks: {
      riser: riserIn <= MAX_RISER_IN + 1e-9,
      tread: input.treadIn >= MIN_TREAD_IN - 1e-9,
      throat: throatIn >= MIN_THROAT_IN - 1e-9,
      cutSpan: totalRunIn <= CUT_SPAN_MAX_IN + 1e-9,
      solidSpan: totalRunIn <= SOLID_SPAN_MAX_IN + 1e-9,
      landingRequired: input.totalRiseIn > LANDING_RISE_IN + 1e-9,
      handrail: risers >= 4,
      guard: input.totalRiseIn >= 30 - 1e-9,
      width: input.stairWidthIn === null ? null : input.stairWidthIn >= MIN_WIDTH_IN - 1e-9,
    },
    retrievedAt: STAIR_RETRIEVED,
  };
}

/** Inches to feet-inches with sixteenths, e.g. 6' 3-5/16". */
export function feetInches(inches: number): string {
  let sixteenths = Math.round(inches * 16);
  const ft = Math.floor(sixteenths / 192);
  sixteenths -= ft * 192;
  const whole = Math.floor(sixteenths / 16);
  let n = sixteenths % 16;
  let d = 16;
  while (n > 0 && n % 2 === 0) {
    n /= 2;
    d /= 2;
  }
  const showWhole = whole > 0 || !n || ft > 0;
  const frac = n ? `${showWhole ? "-" : ""}${n}/${d}` : "";
  const inPart = `${showWhole ? whole : ""}${frac}"`;
  return ft > 0 ? `${ft}' ${inPart}` : inPart;
}
