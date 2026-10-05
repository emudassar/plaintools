import { ToolError } from "./errors";

/**
 * Aquarium gravel / sand quantity.
 *
 * Source: CaribSea, Inc. FAQ, "How many pounds do I need?". Retrieved
 * 2026-10-05 from https://caribsea.com/faq/
 *
 *   "The general rule is 1 to 2 pounds per gallon, but if you want to be more
 *    precise ... In inches: Length x Width x Bed Depth Desired. Then divide by
 *    1,728. Then multiply by the approximate substrate density"
 *
 * Densities as printed (lb per cubic foot): Super Naturals 100, Eco-Planted 80,
 * Aragalive and Ocean Direct 100, Crushed Coral 75, Special Grade Reef Sand 85,
 * Aragamax 100, Fiji Pink and Special Grade Reef Sand (dry) 90, African Cichlid
 * Sands 100, African Cichlid Gravels 75. Special Grade Reef Sand appears twice
 * (85, and 90 dry) — both are kept, labelled as printed.
 */

export const GRAVEL_RETRIEVED = "2026-10-05";
export const CARIBSEA_FAQ_URL = "https://caribsea.com/faq/";

export interface Substrate {
  id: string;
  label: string;
  lbPerFt3: number;
}

export const SUBSTRATES: readonly Substrate[] = [
  { id: "super-naturals", label: "Super Naturals", lbPerFt3: 100 },
  { id: "african-cichlid-gravels", label: "African Cichlid Gravels", lbPerFt3: 75 },
  { id: "african-cichlid-sands", label: "African Cichlid Sands", lbPerFt3: 100 },
  { id: "crushed-coral", label: "Crushed Coral", lbPerFt3: 75 },
  { id: "eco-planted", label: "Eco-Planted", lbPerFt3: 80 },
  { id: "aragalive", label: "Aragalive and Ocean Direct", lbPerFt3: 100 },
  { id: "aragamax", label: "Aragamax", lbPerFt3: 100 },
  { id: "special-grade", label: "Special Grade Reef Sand", lbPerFt3: 85 },
  { id: "fiji-pink-dry", label: "Fiji Pink and Special Grade Reef Sand (dry)", lbPerFt3: 90 },
];

const CM_PER_IN = 2.54;
const KG_PER_LB = 0.45359237;
const L_PER_FT3 = 28.316846592;

export interface GravelInput {
  length: number;
  width: number;
  depth: number;
  unit: "in" | "cm";
  /** A SUBSTRATES id, or "custom". */
  substrate: string;
  /** lb/ft3, used only when substrate is "custom". */
  customDensity: number | null;
  /** Pounds per bag, or null for no bag count. */
  bagLb: number | null;
  /** Tank volume in US gallons, or null to skip the rule-of-thumb check. */
  gallons: number | null;
}

export interface GravelResult {
  lengthIn: number;
  widthIn: number;
  depthIn: number;
  cubicInches: number;
  cubicFeet: number;
  litres: number;
  density: number;
  substrateLabel: string;
  pounds: number;
  kilograms: number;
  bags: number | null;
  bagLb: number | null;
  ruleLow: number | null;
  ruleHigh: number | null;
  retrievedAt: string;
}

function pos(label: string, v: number) {
  if (!Number.isFinite(v)) throw new ToolError("bad-input", `${label} must be a number.`);
  if (v <= 0) throw new ToolError("bad-input", `${label} must be more than zero.`);
}

export function calculateGravel(input: GravelInput): GravelResult {
  pos("Length", input.length);
  pos("Width", input.width);
  pos("Bed depth", input.depth);
  const k = input.unit === "cm" ? 1 / CM_PER_IN : 1;
  const lengthIn = input.length * k;
  const widthIn = input.width * k;
  const depthIn = input.depth * k;
  if (lengthIn > 400 || widthIn > 400) {
    throw new ToolError("bad-input", "That tank is over 400 inches (10 m) long or wide. Check the units.");
  }
  if (depthIn > 24) {
    throw new ToolError("bad-input", "That bed depth is over 24 inches (61 cm). Check the units.");
  }

  let density: number;
  let substrateLabel: string;
  if (input.substrate === "custom") {
    if (input.customDensity === null) throw new ToolError("bad-input", "Enter the weight per cubic foot.");
    pos("Weight per cubic foot", input.customDensity);
    if (input.customDensity < 20 || input.customDensity > 200) {
      throw new ToolError(
        "bad-input",
        "Aquarium substrates in CaribSea's list weigh 75–100 lb per cubic foot. Check the figure and its units.",
      );
    }
    density = input.customDensity;
    substrateLabel = "your figure";
  } else {
    const s = SUBSTRATES.find((x) => x.id === input.substrate);
    if (!s) throw new ToolError("bad-input", "Pick a substrate from the list.");
    density = s.lbPerFt3;
    substrateLabel = s.label;
  }

  if (input.bagLb !== null) pos("Bag weight", input.bagLb);
  let ruleLow: number | null = null;
  let ruleHigh: number | null = null;
  if (input.gallons !== null) {
    pos("Tank volume", input.gallons);
    ruleLow = input.gallons;
    ruleHigh = input.gallons * 2;
  }

  const cubicInches = lengthIn * widthIn * depthIn;
  const cubicFeet = cubicInches / 1728;
  const pounds = cubicFeet * density;
  const bags = input.bagLb === null ? null : Math.ceil(pounds / input.bagLb - 1e-9);

  return {
    lengthIn,
    widthIn,
    depthIn,
    cubicInches,
    cubicFeet,
    litres: cubicFeet * L_PER_FT3,
    density,
    substrateLabel,
    pounds,
    kilograms: pounds * KG_PER_LB,
    bags,
    bagLb: input.bagLb,
    ruleLow,
    ruleHigh,
    retrievedAt: GRAVEL_RETRIEVED,
  };
}
