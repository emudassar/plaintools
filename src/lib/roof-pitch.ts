import { ToolError } from "./errors";

/**
 * Roof pitch geometry, plus the IRC's minimum-slope-by-covering table.
 *
 * The geometry is standard right-triangle trigonometry applied to the US
 * construction convention of stating pitch against a 12-inch run — it needs
 * no citation beyond that convention, which the IRC itself uses throughout.
 *
 * The minimum-slope figures ARE a citation: 2021 International Residential
 * Code, Chapter 9 "Roof Assemblies", Section R905, retrieved 2026-09-26 from
 * https://codes.iccsafe.org/content/IRC2021P1/chapter-9-roof-assemblies
 *
 * This module makes NO network request — both the geometry and the code
 * figures are compiled in, so there is no service to be down and no third
 * party receives anything a visitor types.
 *
 * It reports what the geometry works out to and what the cited code section
 * says. It does not tell anyone what pitch to build, does not know local
 * amendments to the model code, and is not a substitute for a building
 * department or a manufacturer's installation instructions.
 */

export type LengthUnit = "in" | "ft" | "mm" | "m";
export type InputMode = "rise-run" | "angle";

const SOURCE_RETRIEVED = "2026-09-26";

/** Converts any supported unit to inches, so the geometry always runs in one unit. */
function toInches(value: number, unit: LengthUnit): number {
  switch (unit) {
    case "in":
      return value;
    case "ft":
      return value * 12;
    case "mm":
      return value / 25.4;
    case "m":
      return (value * 1000) / 25.4;
  }
}

export interface MinimumSlopeRow {
  material: string;
  /** The slope as x-in-12, e.g. 3 for "3:12". */
  minSlopeIn12: number;
  section: string;
  note: string | null;
}

/**
 * Verbatim minimum slopes, IRC 2021 Chapter 9 Section R905, retrieved
 * 2026-09-26. Ordered steepest-requirement first for display.
 */
export const IRC_MINIMUM_SLOPES: readonly MinimumSlopeRow[] = [
  {
    material: "Slate shingles",
    minSlopeIn12: 4,
    section: "R905.6.2",
    note: null,
  },
  {
    material: "Metal roof shingles",
    minSlopeIn12: 3,
    section: "R905.4.2",
    note: null,
  },
  {
    material: "Wood shingles",
    minSlopeIn12: 3,
    section: "R905.7.2",
    note: null,
  },
  {
    material: "Wood shakes",
    minSlopeIn12: 3,
    section: "R905.8.2",
    note: null,
  },
  {
    material: "Metal roof panels — lapped seam, no lap sealant",
    minSlopeIn12: 3,
    section: "R905.10.2(1)",
    note: null,
  },
  {
    material: "Clay and concrete tile",
    minSlopeIn12: 2.5,
    section: "R905.3.2",
    note: "2½:12 up to under 4:12 requires double underlayment (R905.3.3).",
  },
  {
    material: "Asphalt shingles",
    minSlopeIn12: 2,
    section: "R905.2.2",
    note: "2:12 up to under 4:12 requires double underlayment (R905.1.1). Above 21:12, shingles must follow the manufacturer's installation instructions (R905.2.6).",
  },
  {
    material: "Metal roof panels — lapped seam, with lap sealant",
    minSlopeIn12: 0.5,
    section: "R905.10.2(2)",
    note: "Sealant applied per the manufacturer's installation instructions.",
  },
  {
    material: "Mineral-surfaced roll roofing",
    minSlopeIn12: 1,
    section: "R905.5.2",
    note: null,
  },
  {
    material: "Metal roof panels — standing-seam systems",
    minSlopeIn12: 0.25,
    section: "R905.10.2(3)",
    note: null,
  },
  {
    material: "Built-up roofs",
    minSlopeIn12: 0.25,
    section: "R905.9.1",
    note: "1/8:12 minimum for coal-tar built-up roofs specifically.",
  },
] as const;

export interface PitchCategory {
  label: string;
  /** The band as Omni Calculator's published categories state it, used only as an independent description of common usage, not as this page's source for the IRC figures. */
  range: string;
}

/**
 * Descriptive bands only — not code thresholds. Kept separate from the IRC
 * table above so the two are never confused on the page.
 */
function categorize(slopeIn12: number): PitchCategory {
  if (slopeIn12 <= 2) return { label: "Flat / low-slope", range: "0:12 to 2:12" };
  if (slopeIn12 < 4) return { label: "Low pitch", range: "above 2:12, below 4:12" };
  if (slopeIn12 <= 9) return { label: "Conventional pitch", range: "4:12 to 9:12" };
  return { label: "Steep pitch", range: "above 9:12" };
}

export interface RiseRunInput {
  mode: "rise-run";
  rise: number;
  run: number;
  unit: LengthUnit;
}

export interface AngleInput {
  mode: "angle";
  angleDegrees: number;
  /** Optional — lets the tool also report a rafter length for a given run. */
  run: number | null;
  unit: LengthUnit;
}

export type PitchInput = RiseRunInput | AngleInput;

export interface PitchResult {
  slopeIn12: number;
  slopePercent: number;
  angleDegrees: number;
  /** Null when no run was available to compute a physical length from. */
  rafterLength: number | null;
  rafterLengthUnit: LengthUnit;
  category: PitchCategory;
  allowedMaterials: readonly (MinimumSlopeRow & { allowed: boolean })[];
  retrievedAt: string;
}

function requireFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new ToolError("bad-input", `${label} must be a number.`);
  }
}

export function calculatePitch(input: PitchInput): PitchResult {
  let slopeIn12: number;
  let angleDegrees: number;
  let rafterLength: number | null;

  if (input.mode === "rise-run") {
    requireFinite(input.rise, "Rise");
    requireFinite(input.run, "Run");
    if (input.rise < 0 || input.run < 0) {
      throw new ToolError("bad-input", "Rise and run cannot be negative.");
    }
    if (input.run === 0) {
      throw new ToolError(
        "bad-input",
        "Enter a run greater than zero. A horizontal distance of zero has no defined pitch — that describes a vertical wall, not a roof.",
      );
    }

    const riseIn = toInches(input.rise, input.unit);
    const runIn = toInches(input.run, input.unit);

    if (riseIn / runIn > 100) {
      throw new ToolError(
        "bad-input",
        "That rise is far larger than the run — check the two figures and which one went in which box.",
      );
    }

    slopeIn12 = (riseIn / runIn) * 12;
    angleDegrees = (Math.atan(riseIn / runIn) * 180) / Math.PI;
    rafterLength = Math.sqrt(riseIn * riseIn + runIn * runIn) / toInches(1, input.unit);
  } else {
    requireFinite(input.angleDegrees, "Angle");
    if (input.angleDegrees <= 0 || input.angleDegrees >= 90) {
      throw new ToolError(
        "bad-input",
        "Enter an angle greater than 0 and less than 90 degrees. A roof pitch is neither flat-vertical nor a true wall.",
      );
    }
    angleDegrees = input.angleDegrees;
    slopeIn12 = Math.tan((angleDegrees * Math.PI) / 180) * 12;

    if (input.run !== null) {
      requireFinite(input.run, "Run");
      if (input.run <= 0) {
        throw new ToolError("bad-input", "Run must be greater than zero.");
      }
      const runIn = toInches(input.run, input.unit);
      const riseIn = runIn * Math.tan((angleDegrees * Math.PI) / 180);
      rafterLength = Math.sqrt(riseIn * riseIn + runIn * runIn) / toInches(1, input.unit);
    } else {
      rafterLength = null;
    }
  }

  const slopePercent = (slopeIn12 / 12) * 100;

  const allowedMaterials = IRC_MINIMUM_SLOPES.map((row) => ({
    ...row,
    allowed: slopeIn12 >= row.minSlopeIn12,
  }));

  return {
    slopeIn12,
    slopePercent,
    angleDegrees,
    rafterLength,
    rafterLengthUnit: input.unit,
    category: categorize(slopeIn12),
    allowedMaterials,
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

export function unitLabel(unit: LengthUnit): string {
  switch (unit) {
    case "in":
      return "in";
    case "ft":
      return "ft";
    case "mm":
      return "mm";
    case "m":
      return "m";
  }
}
