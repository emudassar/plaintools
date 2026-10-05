import { ToolError } from "./errors";

/**
 * Table top epoxy quantity.
 *
 * Volume = coated area x coat thickness x number of coats. 1 US gallon =
 * 231 in^3 (NIST Handbook 44, Appendix C).
 *
 * Cross-check and pour limits: TotalBoat TableTop Epoxy product page and
 * "How To Epoxy a Table Top" guide, retrieved 2026-10-05:
 *  - "At 1/8" thick – 12.8 square feet" per 1-gallon kit. 231 / (144 x 0.125)
 *    = 12.83 sq ft, so the arithmetic below reproduces the maker's figure.
 *  - "Each flood coat should be no thicker than 1/4 inch" (guide); product page
 *    "Up to 1/4"" for surface coatings.
 *  - Mix ratio "1A:1B ... by volume" — other products differ, so the ratio is
 *    an input.
 */

export const EPOXY_RETRIEVED = "2026-10-05";
export const TOTALBOAT_URL = "https://www.totalboat.com/products/table-top-epoxy-crystal-clear-resin";
export const TOTALBOAT_GUIDE_URL = "https://www.totalboat.com/pages/how-to-epoxy-table-top-guide";
export const NIST_HB44_URL = "https://www.nist.gov/pml/owm/publications/nist-handbooks/handbook-44";

export const IN3_PER_GALLON = 231;
const ML_PER_IN3 = 16.387064;
export const MAX_COAT_IN = 0.25;

export type Shape = "rectangle" | "round";
export type Unit = "in" | "ft" | "cm";

export interface EpoxyInput {
  shape: Shape;
  /** Length, or diameter for a round top. */
  length: number;
  width: number;
  unit: Unit;
  coats: number;
  /** Thickness of each coat, inches. */
  coatThicknessIn: number;
  /** Coat the edges too: edge height (thickness of the top) in the same unit, or null. */
  edgeHeight: number | null;
  /** Extra percent for loss in cups and drips, 0–100. */
  extraPct: number;
  /** Resin : hardener by volume, e.g. 1 and 1. */
  ratioA: number;
  ratioB: number;
}

export interface EpoxyResult {
  topAreaSqIn: number;
  edgeAreaSqIn: number;
  areaSqFt: number;
  volumeIn3: number;
  gallons: number;
  quarts: number;
  fluidOunces: number;
  millilitres: number;
  partA: number;
  partB: number;
  coatTooThick: boolean;
  retrievedAt: string;
}

const TO_IN: Record<Unit, number> = { in: 1, ft: 12, cm: 1 / 2.54 };

function pos(label: string, v: number, max: number) {
  if (!Number.isFinite(v)) throw new ToolError("bad-input", `${label} must be a number.`);
  if (v <= 0) throw new ToolError("bad-input", `${label} must be more than zero.`);
  if (v > max) throw new ToolError("bad-input", `${label} looks too large. Check the units.`);
}

export function calculateTableTopEpoxy(input: EpoxyInput): EpoxyResult {
  const k = TO_IN[input.unit];
  const L = input.length * k;
  pos(input.shape === "round" ? "Diameter" : "Length", input.length, 100000);
  if (L > 1200) throw new ToolError("bad-input", "That top is over 100 ft. Check the units.");
  let W = L;
  if (input.shape === "rectangle") {
    pos("Width", input.width, 100000);
    W = input.width * k;
    if (W > 1200) throw new ToolError("bad-input", "That top is over 100 ft wide. Check the units.");
  }
  if (!Number.isInteger(input.coats) || input.coats < 1 || input.coats > 20) throw new ToolError("bad-input", "Number of coats must be a whole number from 1 to 20.");
  pos("Coat thickness", input.coatThicknessIn, 2);
  if (!Number.isFinite(input.extraPct) || input.extraPct < 0 || input.extraPct > 100) throw new ToolError("bad-input", "Extra allowance must be between 0 and 100%.");
  pos("Resin part of the ratio", input.ratioA, 100);
  pos("Hardener part of the ratio", input.ratioB, 100);

  const topArea = input.shape === "round" ? (Math.PI * L * L) / 4 : L * W;
  let edgeArea = 0;
  if (input.edgeHeight !== null) {
    pos("Edge height", input.edgeHeight, 10000);
    const h = input.edgeHeight * k;
    if (h > 48) throw new ToolError("bad-input", "Edge height is over 4 ft. Check the units.");
    edgeArea = (input.shape === "round" ? Math.PI * L : 2 * (L + W)) * h;
  }
  const volume = (topArea + edgeArea) * input.coatThicknessIn * input.coats * (1 + input.extraPct / 100);
  const gallons = volume / IN3_PER_GALLON;
  const total = input.ratioA + input.ratioB;
  return {
    topAreaSqIn: topArea,
    edgeAreaSqIn: edgeArea,
    areaSqFt: (topArea + edgeArea) / 144,
    volumeIn3: volume,
    gallons,
    quarts: gallons * 4,
    fluidOunces: gallons * 128,
    millilitres: volume * ML_PER_IN3,
    partA: (gallons * input.ratioA) / total,
    partB: (gallons * input.ratioB) / total,
    coatTooThick: input.coatThicknessIn > MAX_COAT_IN,
    retrievedAt: EPOXY_RETRIEVED,
  };
}
