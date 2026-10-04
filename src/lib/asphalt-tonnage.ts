import { ToolError } from "./errors";

/**
 * Hot-mix asphalt tonnage from area and compacted thickness.
 *
 * Source: Danny Gierhart, P.E. and Jason Wielinski, P.E., "Five handy rules of
 * thumb for successful asphalt pavement construction", Asphalt magazine
 * (Asphalt Institute), 11 September 2023. Retrieved 2026-10-04 from
 *   https://www.asphaltmagazine.com/5rulespavementconstruction/
 *
 *  - "The typical application spread rate for asphalt mixtures is 110 lbs. per
 *     square yard per inch of thickness."
 *  - Equation 1: Area (sq yd) x Lift thickness (in) x Spread rate
 *    (lb / sq yd / in) x 1/2,000 lb = Required HMA (tons).
 *  - Worked example: 2 mi x 24 ft = 28,160 sq yd; at 2.5 in -> 3,872 tons.
 *    (The article's second line, 1.5 in, prints 2,322.2 tons; the same
 *    equation gives 2,323.2 — an arithmetic slip in the article.)
 *  - Local variations quoted: Illinois DOT 112, Tennessee DOT 106
 *    (lb / sq yd / in).
 */

export const ASPHALT_RETRIEVED = "2026-10-04";
export const ASPHALT_URL =
  "https://www.asphaltmagazine.com/5rulespavementconstruction/";

export const SPREAD_PRESETS = [
  { id: "ai", label: "110 lb/sq yd/in — typical rule of thumb", value: 110 },
  { id: "idot", label: "112 — Illinois DOT", value: 112 },
  {
    id: "tdot",
    label: "106 — Tennessee DOT (most dense-graded mixes)",
    value: 106,
  },
] as const;

export type AreaMode = "ft" | "m" | "sqft" | "sqyd" | "sqm";
export type ThickUnit = "in" | "mm";

const SQFT_PER_SQYD = 9;
const SQFT_PER_SQM = 10.763910416709722;
const MM_PER_IN = 25.4;
const KG_PER_LB = 0.45359237;

export interface AsphaltInput {
  areaMode: AreaMode;
  /** Length and width (ft or m) for "ft"/"m"; area for the others. */
  a: number;
  b: number;
  thickness: number;
  thickUnit: ThickUnit;
  spreadRate: number;
}

export interface AsphaltResult {
  sqyd: number;
  sqft: number;
  inches: number;
  spreadRate: number;
  pounds: number;
  shortTons: number;
  metricTonnes: number;
  sqftPerTon: number;
  retrievedAt: string;
}

function pos(label: string, v: number) {
  if (!Number.isFinite(v))
    throw new ToolError("bad-input", `${label} must be a number.`);
  if (v <= 0)
    throw new ToolError("bad-input", `${label} must be more than zero.`);
}

export function calculateAsphalt(input: AsphaltInput): AsphaltResult {
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
    case "sqyd":
      pos("Area", input.a);
      sqft = input.a * SQFT_PER_SQYD;
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

  pos("Thickness", input.thickness);
  const inches =
    input.thickUnit === "in" ? input.thickness : input.thickness / MM_PER_IN;
  if (inches > 24)
    throw new ToolError(
      "bad-input",
      "That thickness is over 24 inches. Check the units (inches or mm).",
    );

  pos("Spread rate", input.spreadRate);
  if (input.spreadRate < 50 || input.spreadRate > 200) {
    throw new ToolError(
      "bad-input",
      "The spread rates in the source run from 106 to 112 lb per square yard per inch. Check the figure.",
    );
  }

  const sqyd = sqft / SQFT_PER_SQYD;
  const pounds = sqyd * inches * input.spreadRate;
  const shortTons = pounds / 2000;
  return {
    sqyd,
    sqft,
    inches,
    spreadRate: input.spreadRate,
    pounds,
    shortTons,
    metricTonnes: (pounds * KG_PER_LB) / 1000,
    sqftPerTon: sqft / shortTons,
    retrievedAt: ASPHALT_RETRIEVED,
  };
}
