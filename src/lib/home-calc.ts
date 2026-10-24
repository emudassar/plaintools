import { ToolError } from "./errors";
import { BAG_YIELDS } from "./concrete-bags";

/**
 * Home and DIY quantities: paint, concrete, mulch, square footage, flooring, fence, moving boxes.
 * Plain geometry plus the published figures named per function:
 *   Paint coverage: Behr Premium Plus Interior (Behr Pro product page) lists 250-400 sq ft per gallon
 *     "depending on the application method and substrate porosity"; the page defaults to 350 and the
 *     figure on the user's own can should replace it.
 *   Concrete: QUIKRETE No. 1101 bag yields (see concrete-bags.ts); 27 ft3 per yd3.
 *   Acre = 43,560 ft2 (NIST Handbook 44, Appendix C); 1 ft = 0.3048 m exactly.
 * Everything else is arithmetic with the user's own numbers.
 */

export const BEHR_URL = "https://www.behr.com/pro/products/interior-products/interior-paints-and-coatings/paints-and-coatings/behr-premium-plus-interior/behr-premium-plus-flat";
export const NIST_HB44_URL = "https://www.nist.gov/pml/owm/nist-handbook-44-current-edition";
export const HOME_RETRIEVED = "2026-10-24";
export const SQFT_PER_M2 = 1 / (0.3048 * 0.3048);
export const SQFT_PER_ACRE = 43_560;

const req = (v: number, label: string, max = Infinity) => {
  if (!Number.isFinite(v) || v <= 0) throw new ToolError("bad-input", `Enter the ${label} as a positive number.`);
  if (v > max) throw new ToolError("bad-input", `The ${label} looks too large - check the unit.`);
};
const opt0 = (v: number, label: string) => {
  if (!Number.isFinite(v) || v < 0) throw new ToolError("bad-input", `Enter the ${label} as 0 or more.`);
};

export interface PaintInput {
  length: number;
  width: number;
  height: number;
  doors: number;
  doorArea: number;
  windows: number;
  windowArea: number;
  coats: number;
  coverage: number;
  includeCeiling: boolean;
  pricePerGallon: number | null;
}

export interface PaintResult {
  wallArea: number;
  openings: number;
  ceilingArea: number;
  paintArea: number;
  gallons: number;
  gallonsToBuy: number;
  quarts: number;
  /** Cheapest whole-gallon + quart combination covering the need. */
  buyGallons: number;
  buyQuarts: number;
  cost: number | null;
}

export function paint(i: PaintInput): PaintResult {
  req(i.length, "room length", 500);
  req(i.width, "room width", 500);
  req(i.height, "wall height", 100);
  opt0(i.doors, "number of doors");
  opt0(i.windows, "number of windows");
  opt0(i.doorArea, "door area");
  opt0(i.windowArea, "window area");
  if (!Number.isInteger(i.coats) || i.coats < 1 || i.coats > 5) throw new ToolError("bad-input", "Coats should be a whole number from 1 to 5.");
  req(i.coverage, "coverage per gallon", 1000);
  const wallArea = 2 * (i.length + i.width) * i.height;
  const openings = i.doors * i.doorArea + i.windows * i.windowArea;
  if (openings >= wallArea) throw new ToolError("bad-input", "Doors and windows add up to more than the walls. Check the sizes.");
  const ceilingArea = i.includeCeiling ? i.length * i.width : 0;
  const paintArea = (wallArea - openings + ceilingArea) * i.coats;
  const gallons = paintArea / i.coverage;
  const quarts = Math.ceil(gallons * 4 - 1e-9);
  const buyGallons = Math.floor(quarts / 4);
  const buyQuarts = quarts % 4;
  let cost: number | null = null;
  if (i.pricePerGallon !== null) {
    opt0(i.pricePerGallon, "price per gallon");
    cost = Math.ceil(gallons - 1e-9) * i.pricePerGallon;
  }
  return { wallArea, openings, ceilingArea, paintArea, gallons, gallonsToBuy: Math.ceil(gallons - 1e-9), quarts, buyGallons, buyQuarts, cost };
}

export type ConcreteShape = "slab" | "footing" | "column" | "steps";

export interface ConcreteInput {
  shape: ConcreteShape;
  /** feet */
  length: number;
  /** feet */
  width: number;
  /** inches: slab thickness, footing depth, column height (ft for column - see `height`) */
  thicknessIn: number;
  /** column diameter, inches */
  diameterIn: number;
  /** column height, feet */
  heightFt: number;
  quantity: number;
  wastePct: number;
  pricePerYd: number | null;
}

export interface ConcreteResult {
  cuFtEach: number;
  cuFt: number;
  cuYd: number;
  cuM: number;
  bags: { lb: number; yieldCuFt: number; bags: number }[];
  weightLb: number;
  cost: number | null;
}

/** Concrete weight used for the "how heavy" line: QUIKRETE 1101 "approximately 140 lb/ft3". */
export function concrete(i: ConcreteInput): ConcreteResult {
  if (!Number.isInteger(i.quantity) || i.quantity < 1 || i.quantity > 1000) throw new ToolError("bad-input", "Quantity should be a whole number from 1 to 1,000.");
  if (!Number.isFinite(i.wastePct) || i.wastePct < 0 || i.wastePct > 50) throw new ToolError("bad-input", "Extra allowance should be between 0 and 50 percent.");
  let each: number;
  if (i.shape === "column") {
    req(i.diameterIn, "diameter", 120);
    req(i.heightFt, "height", 100);
    each = Math.PI * (i.diameterIn / 24) ** 2 * i.heightFt;
  } else {
    req(i.length, "length", 1000);
    req(i.width, "width", 1000);
    req(i.thicknessIn, i.shape === "footing" ? "depth" : "thickness", 120);
    each = i.length * i.width * (i.thicknessIn / 12);
  }
  const cuFt = each * i.quantity * (1 + i.wastePct / 100);
  const cuYd = cuFt / 27;
  let cost: number | null = null;
  if (i.pricePerYd !== null) {
    opt0(i.pricePerYd, "price per cubic yard");
    cost = cuYd * i.pricePerYd;
  }
  return {
    cuFtEach: each,
    cuFt,
    cuYd,
    cuM: cuFt * 0.028316846592,
    bags: BAG_YIELDS.map((b) => ({ lb: b.lb, yieldCuFt: b.cuFt, bags: Math.ceil(cuFt / b.cuFt - 1e-9) })),
    weightLb: cuFt * 140,
    cost,
  };
}

export interface MulchResult {
  areaSqFt: number;
  cuFt: number;
  cuYd: number;
  cuM: number;
  bags: number;
  bagCost: number | null;
  bulkCost: number | null;
  /** Area one cubic yard covers at this depth. */
  sqFtPerYd: number;
}

export function mulch(areaSqFt: number, depthIn: number, bagCuFt: number, pricePerBag: number | null, pricePerYd: number | null): MulchResult {
  req(areaSqFt, "area", 2_000_000);
  req(depthIn, "depth", 24);
  req(bagCuFt, "bag size", 100);
  const cuFt = areaSqFt * (depthIn / 12);
  const cuYd = cuFt / 27;
  const bags = Math.ceil(cuFt / bagCuFt - 1e-9);
  for (const p of [pricePerBag, pricePerYd]) if (p !== null) opt0(p, "price");
  return {
    areaSqFt,
    cuFt,
    cuYd,
    cuM: cuFt * 0.028316846592,
    bags,
    bagCost: pricePerBag === null ? null : bags * pricePerBag,
    bulkCost: pricePerYd === null ? null : cuYd * pricePerYd,
    sqFtPerYd: 27 / (depthIn / 12),
  };
}

export type AreaShape = "rectangle" | "circle" | "triangle" | "trapezoid" | "l-shape";

export interface AreaPart {
  shape: AreaShape;
  /** Dimensions in the chosen length unit: rectangle a x b; circle a = diameter; triangle a = base, b = height;
   *  trapezoid a, b = parallel sides, c = height; l-shape: a x b minus c x d cut-out. */
  a: number;
  b: number;
  c: number;
  d: number;
}

export function partArea(p: AreaPart): number {
  switch (p.shape) {
    case "rectangle":
      req(p.a, "length");
      req(p.b, "width");
      return p.a * p.b;
    case "circle":
      req(p.a, "diameter");
      return Math.PI * (p.a / 2) ** 2;
    case "triangle":
      req(p.a, "base");
      req(p.b, "height");
      return (p.a * p.b) / 2;
    case "trapezoid":
      req(p.a, "first parallel side");
      req(p.b, "second parallel side");
      req(p.c, "height");
      return ((p.a + p.b) / 2) * p.c;
    case "l-shape": {
      req(p.a, "overall length");
      req(p.b, "overall width");
      req(p.c, "cut-out length");
      req(p.d, "cut-out width");
      if (p.c >= p.a || p.d >= p.b) throw new ToolError("bad-input", "The cut-out must be smaller than the overall rectangle.");
      return p.a * p.b - p.c * p.d;
    }
  }
}

export interface SquareFeetResult {
  parts: number[];
  sqFt: number;
  sqM: number;
  sqYd: number;
  acres: number;
  cost: number | null;
}

/** unit: "ft" | "in" | "m" | "yd" | "cm" - dimensions are converted to feet first. */
export function squareFeet(parts: AreaPart[], unit: "ft" | "in" | "yd" | "m" | "cm", pricePerSqFt: number | null): SquareFeetResult {
  if (!parts.length) throw new ToolError("bad-input", "Add at least one area.");
  const k = { ft: 1, in: 1 / 12, yd: 3, m: 1 / 0.3048, cm: 1 / 30.48 }[unit];
  const areas = parts.map((p) => partArea(p) * k * k);
  const sqFt = areas.reduce((a, b) => a + b, 0);
  if (sqFt > 1e9) throw new ToolError("bad-input", "That area is too large - check the unit.");
  let cost: number | null = null;
  if (pricePerSqFt !== null) {
    opt0(pricePerSqFt, "price per square foot");
    cost = sqFt * pricePerSqFt;
  }
  return { parts: areas, sqFt, sqM: sqFt / SQFT_PER_M2, sqYd: sqFt / 9, acres: sqFt / SQFT_PER_ACRE, cost };
}

export interface FlooringResult {
  area: number;
  withWaste: number;
  boxes: number;
  purchased: number;
  planks: number | null;
  cost: number | null;
  leftover: number;
}

export function flooring(area: number, wastePct: number, sqFtPerBox: number, plankLenIn: number | null, plankWidIn: number | null, pricePerSqFt: number | null): FlooringResult {
  req(area, "floor area", 1_000_000);
  if (!Number.isFinite(wastePct) || wastePct < 0 || wastePct > 50) throw new ToolError("bad-input", "Waste allowance should be between 0 and 50 percent.");
  req(sqFtPerBox, "square feet per box", 500);
  const withWaste = area * (1 + wastePct / 100);
  const boxes = Math.ceil(withWaste / sqFtPerBox - 1e-9);
  const purchased = boxes * sqFtPerBox;
  let planks: number | null = null;
  if (plankLenIn !== null && plankWidIn !== null) {
    req(plankLenIn, "plank length", 240);
    req(plankWidIn, "plank width", 48);
    planks = Math.ceil(withWaste / ((plankLenIn * plankWidIn) / 144) - 1e-9);
  }
  let cost: number | null = null;
  if (pricePerSqFt !== null) {
    opt0(pricePerSqFt, "price per square foot");
    cost = purchased * pricePerSqFt;
  }
  return { area, withWaste, boxes, purchased, planks, cost, leftover: purchased - area };
}

export interface FenceInput {
  length: number;
  postSpacing: number;
  gates: number;
  gateWidth: number;
  rails: number;
  /** Picket width and gap, inches. Picket width 0 = no pickets (e.g. chain link / wire). */
  picketWidth: number;
  picketGap: number;
  /** Post hole: diameter and depth, inches; post size (square side), inches. */
  holeDiameter: number;
  holeDepth: number;
  postSide: number;
  bagLb: number;
}

export interface FenceResult {
  fenceLength: number;
  sections: number;
  posts: number;
  rails: number;
  pickets: number;
  concreteCuFtPerPost: number;
  concreteBags: number;
  bagLb: number;
}

export function fence(i: FenceInput): FenceResult {
  req(i.length, "fence length", 50_000);
  req(i.postSpacing, "post spacing", 20);
  opt0(i.gates, "number of gates");
  if (!Number.isInteger(i.gates)) throw new ToolError("bad-input", "Number of gates should be a whole number.");
  if (i.gates > 0) req(i.gateWidth, "gate width", 30);
  if (!Number.isInteger(i.rails) || i.rails < 0 || i.rails > 6) throw new ToolError("bad-input", "Rails per section should be 0 to 6.");
  opt0(i.picketWidth, "picket width");
  opt0(i.picketGap, "picket gap");
  req(i.holeDiameter, "hole diameter", 48);
  req(i.holeDepth, "hole depth", 120);
  req(i.postSide, "post size", 12);
  if (i.postSide >= i.holeDiameter) throw new ToolError("bad-input", "The hole must be wider than the post.");
  const bag = BAG_YIELDS.find((b) => b.lb === i.bagLb);
  if (!bag) throw new ToolError("bad-input", "Pick a bag size.");

  const fenceLength = i.length - i.gates * i.gateWidth;
  if (fenceLength <= 0) throw new ToolError("bad-input", "The gates are wider than the whole fence.");
  // Each run between gates is split into equal sections no longer than the spacing; a gate adds one post.
  const sections = Math.ceil(fenceLength / i.postSpacing - 1e-9);
  const posts = sections + 1 + i.gates;
  const pickets = i.picketWidth > 0 ? Math.ceil((fenceLength * 12) / (i.picketWidth + i.picketGap) - 1e-9) : 0;
  // Concrete fills the hole minus the post, to the hole depth.
  const holeCuFt = Math.PI * (i.holeDiameter / 24) ** 2 * (i.holeDepth / 12);
  const postCuFt = (i.postSide / 12) ** 2 * (i.holeDepth / 12);
  const per = holeCuFt - postCuFt;
  return {
    fenceLength,
    sections,
    posts,
    rails: sections * i.rails,
    pickets,
    concreteCuFtPerPost: per,
    concreteBags: Math.ceil((per * posts) / bag.cuFt - 1e-9),
    bagLb: bag.lb,
  };
}

export interface BoxLine {
  label: string;
  /** Box volume, cubic feet. */
  cuFt: number;
  count: number;
  price: number | null;
}

export interface MovingBoxResult {
  totalBoxes: number;
  totalCuFt: number;
  cost: number | null;
  /** Packing tape: user's feet per box x boxes. */
  tapeFt: number;
  tapeRolls: number;
}

export function movingBoxes(lines: BoxLine[], tapeFtPerBox: number, rollFt: number): MovingBoxResult {
  let totalBoxes = 0, totalCuFt = 0, cost = 0, priced = false;
  for (const l of lines) {
    if (!Number.isInteger(l.count) || l.count < 0 || l.count > 10_000) throw new ToolError("bad-input", `Enter a whole number of ${l.label.toLowerCase()} boxes.`);
    req(l.cuFt, `${l.label.toLowerCase()} box size`, 50);
    totalBoxes += l.count;
    totalCuFt += l.count * l.cuFt;
    if (l.price !== null) {
      opt0(l.price, "box price");
      cost += l.count * l.price;
      priced = true;
    }
  }
  if (totalBoxes === 0) throw new ToolError("bad-input", "Enter how many boxes of at least one size.");
  opt0(tapeFtPerBox, "tape per box");
  req(rollFt, "tape roll length", 10_000);
  const tapeFt = tapeFtPerBox * totalBoxes;
  return { totalBoxes, totalCuFt, cost: priced ? cost : null, tapeFt, tapeRolls: Math.ceil(tapeFt / rollFt - 1e-9) };
}
