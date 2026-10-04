import { ToolError } from "./errors";

/**
 * Asphalt millings (reclaimed asphalt pavement, RAP) quantity.
 *
 * Source: FHWA-RD-97-148, "User Guidelines for Waste and Byproduct Materials in
 * Pavement Construction", Reclaimed Asphalt Pavement — Material Description,
 * Table 13-2 "Physical and mechanical properties of reclaimed asphalt pavement".
 * Retrieved 2026-10-04 from
 *   https://www.fhwa.dot.gov/publications/research/infrastructure/structures/97148/rap131.cfm
 *
 *  - Unit weight (milled or processed RAP): 1940–2300 kg/m3 (120–140 lb/ft3)
 *  - Compacted unit weight (maximum dry density): 1600–2000 kg/m3 (100–125 lb/ft3)
 *  - "The unit weight of milled or processed RAP depends on the type of
 *     aggregate in the reclaimed pavement and the moisture content of the
 *     stockpiled material."
 *
 * Volume is the compacted area x depth the user wants to end up with, so the
 * weight range uses the COMPACTED unit weight (100–125 lb/ft3). A supplier's
 * own figure can be entered instead.
 */

export const MILLINGS_RETRIEVED = "2026-10-04";
export const FHWA_RAP_URL =
  "https://www.fhwa.dot.gov/publications/research/infrastructure/structures/97148/rap131.cfm";

export const COMPACTED_LB_FT3 = { low: 100, high: 125 } as const;
export const LOOSE_LB_FT3 = { low: 120, high: 140 } as const;

const SQFT_PER_SQM = 10.763910416709722;
const MM_PER_IN = 25.4;
const FT3_PER_YD3 = 27;
const M3_PER_FT3 = 0.028316846592;
const KG_PER_LB = 0.45359237;

export type MillingsArea = "ft" | "m" | "sqft" | "sqm";

export interface MillingsInput {
  areaMode: MillingsArea;
  a: number;
  b: number;
  depth: number;
  depthUnit: "in" | "mm";
  /** lb/ft3 from a supplier, or null to use the FHWA compacted range. */
  customDensity: number | null;
}

export interface MillingsResult {
  sqft: number;
  depthIn: number;
  cubicFeet: number;
  cubicYards: number;
  cubicMetres: number;
  densityLow: number;
  densityHigh: number;
  usedCustom: boolean;
  tonsLow: number;
  tonsHigh: number;
  tonnesLow: number;
  tonnesHigh: number;
  retrievedAt: string;
}

function pos(label: string, v: number) {
  if (!Number.isFinite(v))
    throw new ToolError("bad-input", `${label} must be a number.`);
  if (v <= 0)
    throw new ToolError("bad-input", `${label} must be more than zero.`);
}

export function calculateMillings(input: MillingsInput): MillingsResult {
  let sqft: number;
  switch (input.areaMode) {
    case "ft":
      pos("Length", input.a);
      pos("Width", input.b);
      sqft = input.a * input.b;
      break;
    case "m":
      pos("Length", input.a);
      pos("Width", input.b);
      sqft = input.a * input.b * SQFT_PER_SQM;
      break;
    case "sqft":
      pos("Area", input.a);
      sqft = input.a;
      break;
    case "sqm":
      pos("Area", input.a);
      sqft = input.a * SQFT_PER_SQM;
      break;
    default:
      throw new ToolError("bad-input", "Choose how the area is entered.");
  }
  if (sqft > 1e9)
    throw new ToolError(
      "bad-input",
      "That area is far too large. Check the units.",
    );
  pos("Depth", input.depth);
  const depthIn =
    input.depthUnit === "in" ? input.depth : input.depth / MM_PER_IN;
  if (depthIn > 36)
    throw new ToolError(
      "bad-input",
      "That depth is over 36 inches. Check the units (inches or mm).",
    );

  let low: number = COMPACTED_LB_FT3.low;
  let high: number = COMPACTED_LB_FT3.high;
  if (input.customDensity !== null) {
    pos("Weight per cubic foot", input.customDensity);
    if (input.customDensity < 50 || input.customDensity > 200) {
      throw new ToolError(
        "bad-input",
        "Asphalt millings weigh roughly 100–140 lb per cubic foot in FHWA's data. Check the figure and its units.",
      );
    }
    low = high = input.customDensity;
  }

  const cubicFeet = sqft * (depthIn / 12);
  const lbLow = cubicFeet * low;
  const lbHigh = cubicFeet * high;
  return {
    sqft,
    depthIn,
    cubicFeet,
    cubicYards: cubicFeet / FT3_PER_YD3,
    cubicMetres: cubicFeet * M3_PER_FT3,
    densityLow: low,
    densityHigh: high,
    usedCustom: input.customDensity !== null,
    tonsLow: lbLow / 2000,
    tonsHigh: lbHigh / 2000,
    tonnesLow: (lbLow * KG_PER_LB) / 1000,
    tonnesHigh: (lbHigh * KG_PER_LB) / 1000,
    retrievedAt: MILLINGS_RETRIEVED,
  };
}
