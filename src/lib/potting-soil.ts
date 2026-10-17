import { ToolError } from "./errors";

/**
 * Potting soil for containers.
 *
 * Volumes: round pot with sloped sides = frustum π·h/3·(R² + R·r + r²);
 * cylinder; rectangular planter or raised bed = L·W·H. Fill height = pot
 * height − headspace. Units (NIST Handbook 44, Appendix C): US dry quart =
 * 67.200625 in³; 1 ft³ = 1,728 in³; litre = 61.0237 in³. Bagged potting mix is
 * labelled in dry quarts or cubic feet.
 */

export const POT_RETRIEVED = "2026-10-17";
export const IN3_PER_DRY_QT = 67.200625;
export const IN3_PER_L = 61.0237440947;

export type PotShape = "round" | "square" | "rect";

export interface Pot {
  shape: PotShape;
  /** round: top & bottom diameter; square: top side & bottom side; rect: length & width. Inches. */
  a: number;
  b: number;
  heightIn: number;
  count: number;
}

export interface PotInput {
  pots: Pot[];
  headspaceIn: number;
  /** Bag size: value + unit. */
  bagSize: number;
  bagUnit: "qt" | "cuft" | "l";
}

export interface PotResult {
  perPotIn3: number[];
  totalIn3: number;
  dryQuarts: number;
  cuFt: number;
  liters: number;
  bags: number;
}

function frustum(h: number, r1: number, r2: number) {
  return (Math.PI * h * (r1 * r1 + r1 * r2 + r2 * r2)) / 3;
}

export function pottingSoil(i: PotInput): PotResult {
  if (!i.pots.length) throw new ToolError("bad-input", "Add at least one container.");
  if (!Number.isFinite(i.headspaceIn) || i.headspaceIn < 0) throw new ToolError("bad-input", "Headspace should be zero or more inches.");
  const perPotIn3 = i.pots.map((p) => {
    if (!Number.isFinite(p.a) || p.a <= 0 || p.a > 240 || !Number.isFinite(p.heightIn) || p.heightIn <= 0 || p.heightIn > 120)
      throw new ToolError("bad-input", "Enter each container's size and height in inches.");
    if (!Number.isInteger(p.count) || p.count < 1 || p.count > 10_000) throw new ToolError("bad-input", "Number of containers should be a whole number.");
    const h = p.heightIn - i.headspaceIn;
    if (h <= 0) throw new ToolError("bad-input", "The headspace is as deep as the container.");
    let v: number;
    if (p.shape === "rect") {
      if (!Number.isFinite(p.b) || p.b <= 0) throw new ToolError("bad-input", "Enter the planter width in inches.");
      v = p.a * p.b * h;
    } else {
      const bottom = Number.isFinite(p.b) && p.b > 0 ? p.b : p.a;
      if (bottom > p.a + 1e-9) throw new ToolError("bad-input", "The bottom is wider than the top. Enter the top size first.");
      // Fill stops below the rim: size at fill height by linear taper.
      const top = bottom + (p.a - bottom) * (h / p.heightIn);
      v = p.shape === "round" ? frustum(h, top / 2, bottom / 2) : (h / 3) * (top * top + top * bottom + bottom * bottom);
    }
    return v * p.count;
  });
  const totalIn3 = perPotIn3.reduce((a, b) => a + b, 0);
  if (!Number.isFinite(i.bagSize) || i.bagSize <= 0) throw new ToolError("bad-input", "Enter the bag size from the label.");
  const bagIn3 = i.bagUnit === "qt" ? i.bagSize * IN3_PER_DRY_QT : i.bagUnit === "cuft" ? i.bagSize * 1728 : i.bagSize * IN3_PER_L;
  return {
    perPotIn3,
    totalIn3,
    dryQuarts: totalIn3 / IN3_PER_DRY_QT,
    cuFt: totalIn3 / 1728,
    liters: totalIn3 / IN3_PER_L,
    bags: Math.ceil(totalIn3 / bagIn3 - 1e-9),
  };
}
