import { ToolError } from "./errors";

/**
 * Aquarium volume by tank shape.
 *
 * Units: 1 US gallon = 231 in^3 = 3.785411784 L (NIST Handbook 44,
 * Appendix C). Water weight: "8.34 pounds per gallon" (USGS Water Science
 * School, "A Million Gallons of Water — How much is it?"), retrieved
 * 2026-10-05. 1 L of fresh water is taken as 1 kg for the metric weight.
 *
 * Shapes (inside dimensions, area x height):
 *  - rectangle: L x W
 *  - cylinder: pi d^2 / 4
 *  - hexagon (regular, measured flat to flat F): side s = F / sqrt(3),
 *    area = (3 sqrt(3) / 2) s^2
 *  - bow front: L x D (depth at the ends) + the circular segment of chord L
 *    and bow b: R = (L^2/4 + b^2) / 2b; segment = R^2 acos((R-b)/R) -
 *    (R-b) sqrt(2Rb - b^2)
 *  - corner (quarter circle of radius r = side length): pi r^2 / 4
 *  - pentagon corner (two back sides a, two short front sides cut at 45°):
 *    a^2 - c^2 / 2, where c is the length cut off each back side
 *
 * Water height = tank height − gap below the rim − substrate depth.
 */

export const AQUARIUM_RETRIEVED = "2026-10-05";
export const USGS_URL = "https://www.usgs.gov/water-science-school/science/a-million-gallons-water-how-much-it";
export const NIST_HB44_URL = "https://www.nist.gov/pml/owm/publications/nist-handbooks/handbook-44";

const IN3_PER_GAL = 231;
const L_PER_GAL = 3.785411784;
const LB_PER_GAL = 8.34;

export type TankShape = "rectangle" | "cylinder" | "hexagon" | "bowfront" | "corner" | "pentagon";

export interface AquariumInput {
  shape: TankShape;
  unit: "in" | "cm";
  /** rectangle/bowfront: length; cylinder: diameter; hexagon: flat-to-flat; corner/pentagon: back side. */
  a: number;
  /** rectangle/bowfront: depth (front to back at the ends); pentagon: corner cut. Ignored otherwise. */
  b: number;
  /** bowfront: how far the front bows out beyond the ends. */
  bow: number;
  height: number;
  /** Gap between water and rim, same unit. */
  gap: number;
  /** Substrate depth, same unit. */
  substrate: number;
}

export interface AquariumResult {
  footprintSqIn: number;
  waterHeightIn: number;
  fullGallons: number;
  fullLitres: number;
  waterGallons: number;
  waterLitres: number;
  waterWeightLb: number;
  waterWeightKg: number;
  retrievedAt: string;
}

function pos(label: string, v: number, max: number) {
  if (!Number.isFinite(v) || v <= 0) throw new ToolError("bad-input", `${label} must be more than zero.`);
  if (v > max) throw new ToolError("bad-input", `${label} looks too large. Check the units.`);
}

export function segmentArea(chord: number, bow: number): number {
  const R = (chord * chord) / 4 / (2 * bow) + bow / 2;
  return R * R * Math.acos((R - bow) / R) - (R - bow) * Math.sqrt(2 * R * bow - bow * bow);
}

export function calculateAquariumVolume(input: AquariumInput): AquariumResult {
  const k = input.unit === "cm" ? 1 / 2.54 : 1;
  const max = input.unit === "cm" ? 2000 : 800;
  pos(input.shape === "cylinder" ? "Diameter" : input.shape === "hexagon" ? "Width across flats" : input.shape === "corner" || input.shape === "pentagon" ? "Side length" : "Length", input.a, max);
  pos("Height", input.height, max);
  const a = input.a * k;
  let area: number;
  switch (input.shape) {
    case "rectangle":
      pos("Depth", input.b, max);
      area = a * input.b * k;
      break;
    case "cylinder":
      area = (Math.PI * a * a) / 4;
      break;
    case "hexagon": {
      const s = a / Math.sqrt(3);
      area = ((3 * Math.sqrt(3)) / 2) * s * s;
      break;
    }
    case "bowfront": {
      pos("Depth at the ends", input.b, max);
      pos("Bow", input.bow, max);
      const bow = input.bow * k;
      if (bow > a / 2) throw new ToolError("bad-input", "The bow can't be more than half the length — that would be past a half circle.");
      area = a * input.b * k + segmentArea(a, bow);
      break;
    }
    case "corner":
      area = (Math.PI * a * a) / 4;
      break;
    case "pentagon": {
      pos("Corner cut", input.b, max);
      const c = input.b * k;
      if (c >= a) throw new ToolError("bad-input", "The corner cut must be shorter than the back side.");
      area = a * a - (c * c) / 2;
      break;
    }
    default:
      throw new ToolError("bad-input", "Pick a tank shape.");
  }
  for (const [label, v] of [["Gap below the rim", input.gap], ["Substrate depth", input.substrate]] as const)
    if (!Number.isFinite(v) || v < 0) throw new ToolError("bad-input", `${label} must be zero or more.`);
  const h = input.height * k;
  const water = h - (input.gap + input.substrate) * k;
  if (water <= 0) throw new ToolError("no-data", "The gap and substrate take up the whole height — there is no water left to measure.");

  const fullGallons = (area * h) / IN3_PER_GAL;
  const waterGallons = (area * water) / IN3_PER_GAL;
  return {
    footprintSqIn: area,
    waterHeightIn: water,
    fullGallons,
    fullLitres: fullGallons * L_PER_GAL,
    waterGallons,
    waterLitres: waterGallons * L_PER_GAL,
    waterWeightLb: waterGallons * LB_PER_GAL,
    waterWeightKg: waterGallons * L_PER_GAL,
    retrievedAt: AQUARIUM_RETRIEVED,
  };
}
