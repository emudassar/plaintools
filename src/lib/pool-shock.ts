import { ToolError } from "./errors";
import {
  CHLORINE,
  DOSING_RETRIEVED,
  scaleDose,
  validatePpm,
  validateVolume,
  type DoseFactor,
  type Measure,
} from "./pool-dosing";

/**
 * Pool shock (raise free chlorine) dose.
 *
 * Two methods, both from the Indiana Department of Health document cited in
 * pool-dosing.ts:
 *  1. A listed product: its "1 ppm per 10,000 gallons" amount from the Water
 *     Chemistry Adjustment Guide, scaled by gallons and ppm change.
 *  2. Any other product: the document's "no product label" method — 0.083 lb
 *     (1.328 oz) for solids or 1.3 fl oz for liquids, divided by the available
 *     chlorine fraction on the label, per ppm per 10,000 gallons.
 *
 * Worked example in the source (page 3-4): 200,000 gallons, 1 -> 20 ppm with
 * 67% calcium hypochlorite at 2 oz per ppm = 760 oz = 47.5 lb. That is the
 * cross-check.
 */

export type ProductChoice =
  | { kind: "listed"; id: string }
  | { kind: "custom"; percent: number; form: "solid" | "liquid" };

export interface ShockInput {
  volume: number;
  unit: "gal" | "l";
  currentFc: number;
  targetFc: number;
  product: ProductChoice;
}

export interface ShockResult {
  gallons: number;
  currentFc: number;
  targetFc: number;
  ppmChange: number;
  /** oz (wt) or fl oz (vol). Zero when no increase is needed. */
  amount: number;
  measure: Measure;
  productLabel: string;
  /** Per ppm per 10,000 gallons figure used, and where it came from. */
  perPpmPer10k: number;
  method: "table" | "label-percent";
  printed: string | null;
  action: "add" | "none";
  retrievedAt: string;
}

const SOLID_OZ_PER_PPM_10K = 0.083 * 16;
const LIQUID_FLOZ_PER_PPM_10K = 1.3;

export function findChlorine(id: string): DoseFactor {
  const f = CHLORINE.find((c) => c.id === id);
  if (!f) throw new ToolError("bad-input", "Pick a product from the list.");
  return f;
}

export function calculateShock(input: ShockInput): ShockResult {
  const gallons = validateVolume(input.volume, input.unit);
  validatePpm("Current free chlorine", input.currentFc, 100);
  validatePpm("Target free chlorine", input.targetFc, 100);

  let factor: { label: string; measure: Measure; perPpmPer10k: number; method: "table" | "label-percent"; printed: string | null };

  if (input.product.kind === "listed") {
    const f = findChlorine(input.product.id);
    factor = { label: f.label, measure: f.measure, perPpmPer10k: f.amount / f.perPpm, method: "table", printed: f.printed };
  } else {
    const { percent, form } = input.product;
    if (!Number.isFinite(percent)) throw new ToolError("bad-input", "Available chlorine % must be a number.");
    if (percent <= 0 || percent > 100) {
      throw new ToolError("bad-input", "Available chlorine must be between 0 and 100% — use the figure on the label.");
    }
    const frac = percent / 100;
    factor =
      form === "solid"
        ? { label: `Granular/tablet product, ${percent}% available chlorine`, measure: "wt", perPpmPer10k: SOLID_OZ_PER_PPM_10K / frac, method: "label-percent", printed: null }
        : { label: `Liquid product, ${percent}% available chlorine`, measure: "vol", perPpmPer10k: LIQUID_FLOZ_PER_PPM_10K / frac, method: "label-percent", printed: null };
  }

  const ppmChange = input.targetFc - input.currentFc;
  const amount =
    ppmChange > 0
      ? scaleDose({ id: "x", label: factor.label, measure: factor.measure, amount: factor.perPpmPer10k, perPpm: 1, printed: "" }, gallons, ppmChange)
      : 0;

  return {
    gallons,
    currentFc: input.currentFc,
    targetFc: input.targetFc,
    ppmChange,
    amount,
    measure: factor.measure,
    productLabel: factor.label,
    perPpmPer10k: factor.perPpmPer10k,
    method: factor.method,
    printed: factor.printed,
    action: ppmChange > 0 ? "add" : "none",
    retrievedAt: DOSING_RETRIEVED,
  };
}
