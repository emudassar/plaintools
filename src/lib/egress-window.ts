import { ToolError } from "./errors";

/**
 * Emergency escape and rescue opening (egress window) check against the
 * minimums in the 2021 International Residential Code, Section R310, plus
 * the "grade floor" definition in Chapter 2.
 *
 * Text read 2026-10-03 from ICC's free public Digital Codes reader:
 *   https://codes.iccsafe.org/content/IRC2021P1/chapter-3-building-planning
 *   https://codes.iccsafe.org/content/IRC2021P1/chapter-2-definitions
 *
 * The figures used:
 *   R310.2.1   net clear opening ≥ 5.7 sq ft; ≥ 5 sq ft for a grade-floor opening
 *   R310.2.2   net clear opening height ≥ 24 in, width ≥ 20 in
 *   R310.2.3   bottom of the clear opening ≤ 44 in above the floor
 *   Chapter 2  grade floor = bottom of the clear opening not more than 44 in
 *              above or below the finished ground level adjacent to it
 *   R310.4     an area well is required where the bottom of the clear opening
 *              is below adjacent grade
 *   R310.4.1   area well horizontal area ≥ 9 sq ft, projection and width ≥ 36 in
 *   R310.4.2   area well deeper than 44 in needs a permanently affixed ladder or steps
 *
 * This module makes NO network request — the figures are compiled in.
 *
 * It reports which of the cited minimums the entered measurements meet. It
 * does not know local amendments, does not cover the replacement-window rules
 * in R310.5, and is only as good as the measurement entered: the code measures
 * the NET CLEAR opening in normal operation, not the frame or rough opening.
 */

const SOURCE_RETRIEVED = "2026-10-03";

const MIN_AREA_SQFT = 5.7;
const MIN_AREA_GRADE_FLOOR_SQFT = 5;
const MIN_HEIGHT_IN = 24;
const MIN_WIDTH_IN = 20;
const MAX_SILL_IN = 44;
const GRADE_FLOOR_LIMIT_IN = 44;

const WELL_MIN_AREA_SQFT = 9;
const WELL_MIN_DIMENSION_IN = 36;
const WELL_LADDER_DEPTH_IN = 44;

/** Openings beyond this are almost certainly a unit mix-up (feet typed as inches, or mm). */
const MAX_PLAUSIBLE_IN = 240;

export type SillPosition = "above-grade" | "below-grade";

export interface EgressInput {
  /** Net clear opening width, inches. */
  clearWidth: number;
  /** Net clear opening height, inches. */
  clearHeight: number;
  /** Floor to the bottom of the clear opening, inches. */
  sillHeight: number;
  /** Is the bottom of the clear opening above or below the ground outside? */
  sillPosition: SillPosition;
  /** Vertical distance between the bottom of the opening and the ground outside, inches. */
  gradeDistance: number;
  /** Area well, only used when the sill is below grade. Null = not entered. */
  well: { projection: number; width: number; depth: number } | null;
}

export interface CheckRow {
  label: string;
  section: string;
  measured: string;
  required: string;
  passes: boolean;
  /** Set on rows that state a requirement rather than test a measurement. */
  resultLabel?: string;
}

export interface EgressResult {
  passesAll: boolean;
  isGradeFloor: boolean;
  areaSqFt: number;
  requiredAreaSqFt: number;
  checks: readonly CheckRow[];
  /** Null when the sill is above grade — no area well applies. */
  wellChecks: readonly CheckRow[] | null;
  /** True when the sill is below grade but no well dimensions were entered. */
  wellMissing: boolean;
  retrievedAt: string;
}

function requirePositive(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new ToolError("bad-input", `${label} must be a number.`);
  }
  if (value <= 0) {
    throw new ToolError("bad-input", `${label} must be greater than zero.`);
  }
  if (value > MAX_PLAUSIBLE_IN) {
    throw new ToolError(
      "bad-input",
      `${label} of ${value} inches is larger than any window opening — enter the measurement in inches.`,
    );
  }
}

function requireNonNegative(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new ToolError("bad-input", `${label} must be a number.`);
  }
  if (value < 0) {
    throw new ToolError("bad-input", `${label} cannot be negative.`);
  }
  if (value > MAX_PLAUSIBLE_IN) {
    throw new ToolError("bad-input", `${label} of ${value} inches looks too large — enter it in inches.`);
  }
}

function inches(n: number): string {
  return `${formatNumber(n, 2)} in`;
}

export function checkEgress(input: EgressInput): EgressResult {
  requirePositive(input.clearWidth, "Clear opening width");
  requirePositive(input.clearHeight, "Clear opening height");
  requireNonNegative(input.sillHeight, "Sill height above the floor");
  requireNonNegative(input.gradeDistance, "Distance to the ground outside");

  const areaSqFt = (input.clearWidth * input.clearHeight) / 144;
  const isGradeFloor = input.gradeDistance <= GRADE_FLOOR_LIMIT_IN;
  const requiredAreaSqFt = isGradeFloor ? MIN_AREA_GRADE_FLOOR_SQFT : MIN_AREA_SQFT;

  const checks: CheckRow[] = [
    {
      label: "Net clear opening area",
      section: isGradeFloor ? "R310.2.1, Exception" : "R310.2.1",
      measured: `${formatNumber(areaSqFt, 2)} sq ft`,
      required: `at least ${requiredAreaSqFt} sq ft${isGradeFloor ? " (grade-floor opening)" : ""}`,
      passes: areaSqFt >= requiredAreaSqFt,
    },
    {
      label: "Net clear opening height",
      section: "R310.2.2",
      measured: inches(input.clearHeight),
      required: `at least ${MIN_HEIGHT_IN} in`,
      passes: input.clearHeight >= MIN_HEIGHT_IN,
    },
    {
      label: "Net clear opening width",
      section: "R310.2.2",
      measured: inches(input.clearWidth),
      required: `at least ${MIN_WIDTH_IN} in`,
      passes: input.clearWidth >= MIN_WIDTH_IN,
    },
    {
      label: "Height of the opening above the floor",
      section: "R310.2.3",
      measured: inches(input.sillHeight),
      required: `no more than ${MAX_SILL_IN} in`,
      passes: input.sillHeight <= MAX_SILL_IN,
    },
  ];

  let wellChecks: CheckRow[] | null = null;
  let wellMissing = false;

  if (input.sillPosition === "below-grade" && input.gradeDistance > 0) {
    if (input.well === null) {
      wellMissing = true;
    } else {
      requirePositive(input.well.projection, "Area well projection");
      requirePositive(input.well.width, "Area well width");
      requireNonNegative(input.well.depth, "Area well depth");
      const wellArea = (input.well.projection * input.well.width) / 144;
      wellChecks = [
        {
          label: "Area well horizontal area",
          section: "R310.4.1",
          measured: `${formatNumber(wellArea, 2)} sq ft`,
          required: `at least ${WELL_MIN_AREA_SQFT} sq ft`,
          passes: wellArea >= WELL_MIN_AREA_SQFT,
        },
        {
          label: "Area well projection (out from the wall)",
          section: "R310.4.1",
          measured: inches(input.well.projection),
          required: `at least ${WELL_MIN_DIMENSION_IN} in`,
          passes: input.well.projection >= WELL_MIN_DIMENSION_IN,
        },
        {
          label: "Area well width",
          section: "R310.4.1",
          measured: inches(input.well.width),
          required: `at least ${WELL_MIN_DIMENSION_IN} in`,
          passes: input.well.width >= WELL_MIN_DIMENSION_IN,
        },
        {
          label: "Ladder or steps",
          section: "R310.4.2",
          measured: inches(input.well.depth) + " deep",
          required:
            input.well.depth > WELL_LADDER_DEPTH_IN
              ? `deeper than ${WELL_LADDER_DEPTH_IN} in: a permanently affixed ladder or steps is required`
              : `not required at ${WELL_LADDER_DEPTH_IN} in deep or less`,
          // This row states a requirement rather than measuring one — it cannot fail on numbers alone.
          passes: true,
          resultLabel: input.well.depth > WELL_LADDER_DEPTH_IN ? "Required" : "Not required",
        },
      ];
    }
  }

  const passesAll =
    checks.every((c) => c.passes) && (wellChecks === null || wellChecks.every((c) => c.passes));

  return {
    passesAll,
    isGradeFloor,
    areaSqFt,
    requiredAreaSqFt,
    checks,
    wellChecks,
    wellMissing,
    retrievedAt: SOURCE_RETRIEVED,
  };
}

/** Thousands separators, and no trailing zeros on whole numbers. */
export function formatNumber(n: number, maxDecimals = 2): string {
  return n.toLocaleString("en-US", {
    maximumFractionDigits: maxDecimals,
    minimumFractionDigits: 0,
  });
}
