import { ToolError } from "./errors";

/**
 * Firewood volume in cords.
 *
 * Source: NIST Handbook 130, Method of Sale of Commodities, section 2.4
 * (Fireplace and Stove Wood), as reproduced on the Connecticut Department of
 * Consumer Protection page "Firewood and Stove Wood Regulations" ("Taken from
 * NIST Handbook 130 - 2016"), read 2026-10-16:
 *   2.4.1.2 Cord: "The amount of wood that is contained in a space of 128 cubic
 *   feet when the wood is ranked and well stowed."
 *   2.4.3: sold "using the term 'cord' and fractional parts of a cord or the
 *   cubic meter".
 *   2.4.4: terms such as face cord, rack, pile and truckload "shall not be used
 *   when advertising, offering for sale, or selling wood for use as fuel."
 *
 * A "face cord" here means what sellers usually mean by it: a stack 4 ft high
 * and 8 ft long, one piece-length deep. It is not a legal unit; its volume is
 * 32 ft² × depth, so its share of a cord is depth ÷ 4 ft.
 *
 * 1 ft = 0.3048 m exactly, so 1 ft³ = 0.028316846592 m³.
 */

export const FIREWOOD_RETRIEVED = "2026-10-16";
export const CT_URL = "https://portal.ct.gov/dcp/food-and-standards-division/food--standards/firewood-and-stove-wood-regulations";
export const NIST_HB130_URL = "https://www.nist.gov/pml/owm/owm-products-and-services/publications-and-documentary-standards/handbooks";

export const CORD_FT3 = 128;
export const FT3_TO_M3 = 0.3048 ** 3;

export type Unit = "ft" | "in" | "m";
const TO_FT: Record<Unit, number> = { ft: 1, in: 1 / 12, m: 1 / 0.3048 };

export interface FirewoodInput {
  length: number;
  height: number;
  depth: number;
  unit: Unit;
  /** Number of identical stacks. */
  stacks: number;
  price: number | null;
  priceUnit: "cord" | "face" | "total";
}

export interface FirewoodResult {
  ft3: number;
  m3: number;
  cords: number;
  /** Stack face area ÷ 32 ft²: how many 4 × 8 ft faces the pile has at its own depth. */
  faceCords: number;
  depthFt: number;
  faceCordShareOfCord: number;
  pricePerCord: number | null;
  totalPrice: number | null;
  retrievedAt: string;
}

const pos = (v: number, what: string) => {
  if (!Number.isFinite(v) || v <= 0) throw new ToolError("bad-input", `Enter the ${what} of the stack.`);
};

export function firewood(input: FirewoodInput): FirewoodResult {
  pos(input.length, "length");
  pos(input.height, "height");
  pos(input.depth, "depth (piece length)");
  if (!Number.isInteger(input.stacks) || input.stacks < 1 || input.stacks > 100)
    throw new ToolError("bad-input", "Number of stacks should be a whole number from 1 to 100.");
  const k = TO_FT[input.unit];
  const [l, h, d] = [input.length * k, input.height * k, input.depth * k];
  if (l > 1000 || h > 30 || d > 30) throw new ToolError("bad-input", "Those dimensions are larger than a woodpile — check the unit.");
  const ft3 = l * h * d * input.stacks;
  const cords = ft3 / CORD_FT3;
  const faceCords = (l * h * input.stacks) / 32;
  const faceShare = d / 4;

  let pricePerCord: number | null = null;
  let totalPrice: number | null = null;
  if (input.price !== null) {
    if (!Number.isFinite(input.price) || input.price < 0) throw new ToolError("bad-input", "Enter the price as a positive number, or leave it blank.");
    if (input.priceUnit === "cord") {
      pricePerCord = input.price;
      totalPrice = input.price * cords;
    } else if (input.priceUnit === "face") {
      pricePerCord = input.price / faceShare;
      totalPrice = input.price * faceCords;
    } else {
      totalPrice = input.price;
      pricePerCord = input.price / cords;
    }
  }
  return {
    ft3,
    m3: ft3 * FT3_TO_M3,
    cords,
    faceCords,
    depthFt: d,
    faceCordShareOfCord: faceShare,
    pricePerCord,
    totalPrice,
    retrievedAt: FIREWOOD_RETRIEVED,
  };
}
