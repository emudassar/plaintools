import { ToolError } from "./errors";

/**
 * Playground loose-fill surfacing quantity.
 *
 * Source: U.S. Consumer Product Safety Commission, Public Playground Safety
 * Handbook (Pub. 325; cover letter dated December 29, 2015). Retrieved
 * 2026-10-05 from https://www.cpsc.gov/s3fs-public/325.pdf
 *
 *  - Table 2 "Minimum compressed loose-fill surfacing depths":
 *      6* in shredded/recycled rubber -> protects to 10 ft fall height
 *      9 in sand -> 4 ft;  9 in pea gravel -> 5 ft;
 *      9 in wood mulch (non-CCA) -> 7 ft;  9 in wood chips -> 10 ft
 *    * rubber "does not compress in the same manner as other loose-fill
 *      materials"; the depths "assume the materials have been compressed due
 *      to use and weathering".
 *  - §2.4.2.2 tip 1: loose-fill "will compress at least 25% over time ... if
 *    the playground will require 9 inches of wood chips, then the initial fill
 *    level should be 12 inches". So initial = compressed / 0.75 (rubber: none).
 *  - tip 7: "Never use less than 9 inches of loose-fill material except for
 *    shredded/recycled rubber (6 inches recommended)."
 *  - §5.3.10: where not specified elsewhere, "The use zone should extend a
 *    minimum of 6 feet in all directions from the perimeter of the equipment."
 *    (Swings and slides have their own, longer use zones.)
 */

export const MULCH_RETRIEVED = "2026-10-05";
export const CPSC_URL = "https://www.cpsc.gov/s3fs-public/325.pdf";

export interface Material {
  id: string;
  label: string;
  compressedIn: number;
  protectsToFt: number;
  compresses: boolean;
}

export const MATERIALS: readonly Material[] = [
  { id: "wood-chips", label: "Wood chips", compressedIn: 9, protectsToFt: 10, compresses: true },
  { id: "wood-mulch", label: "Wood mulch (non-CCA)", compressedIn: 9, protectsToFt: 7, compresses: true },
  { id: "rubber", label: "Shredded/recycled rubber", compressedIn: 6, protectsToFt: 10, compresses: false },
  { id: "pea-gravel", label: "Pea gravel", compressedIn: 9, protectsToFt: 5, compresses: true },
  { id: "sand", label: "Sand", compressedIn: 9, protectsToFt: 4, compresses: true },
];

export const USE_ZONE_FT = 6;
export const COMPRESSION = 0.25;

export interface MulchInput {
  lengthFt: number;
  widthFt: number;
  /** Add the general 6 ft use zone on every side of an equipment footprint. */
  addUseZone: boolean;
  material: string;
  /** Highest fall height in feet, or null to skip the check. */
  fallHeightFt: number | null;
  /** Bag size in cubic feet, or null. */
  bagCuFt: number | null;
}

export interface MulchResult {
  material: Material;
  areaLengthFt: number;
  areaWidthFt: number;
  areaSqft: number;
  compressedIn: number;
  initialIn: number;
  cubicFeet: number;
  cubicYards: number;
  cubicMetres: number;
  bags: number | null;
  fall: { heightFt: number; covered: boolean; anyMaterialCovers: boolean } | null;
  retrievedAt: string;
}

function pos(label: string, v: number) {
  if (!Number.isFinite(v)) throw new ToolError("bad-input", `${label} must be a number.`);
  if (v <= 0) throw new ToolError("bad-input", `${label} must be more than zero.`);
}

export function calculateMulch(input: MulchInput): MulchResult {
  pos("Length", input.lengthFt);
  pos("Width", input.widthFt);
  if (input.lengthFt > 2000 || input.widthFt > 2000) throw new ToolError("bad-input", "That area is over 2,000 ft long. Check the units.");
  const material = MATERIALS.find((m) => m.id === input.material);
  if (!material) throw new ToolError("bad-input", "Pick a surfacing material from the list.");

  let fall: MulchResult["fall"] = null;
  if (input.fallHeightFt !== null) {
    pos("Fall height", input.fallHeightFt);
    if (input.fallHeightFt > 50) throw new ToolError("bad-input", "That fall height is over 50 ft. Check it is in feet.");
    fall = {
      heightFt: input.fallHeightFt,
      covered: input.fallHeightFt <= material.protectsToFt,
      anyMaterialCovers: MATERIALS.some((m) => input.fallHeightFt! <= m.protectsToFt),
    };
  }
  if (input.bagCuFt !== null) pos("Bag size", input.bagCuFt);

  const extra = input.addUseZone ? 2 * USE_ZONE_FT : 0;
  const L = input.lengthFt + extra;
  const W = input.widthFt + extra;
  const areaSqft = L * W;
  const initialIn = material.compresses ? material.compressedIn / (1 - COMPRESSION) : material.compressedIn;
  const cubicFeet = areaSqft * (initialIn / 12);

  return {
    material,
    areaLengthFt: L,
    areaWidthFt: W,
    areaSqft,
    compressedIn: material.compressedIn,
    initialIn,
    cubicFeet,
    cubicYards: cubicFeet / 27,
    cubicMetres: cubicFeet * 0.028316846592,
    bags: input.bagCuFt === null ? null : Math.ceil(cubicFeet / input.bagCuFt - 1e-9),
    fall,
    retrievedAt: MULCH_RETRIEVED,
  };
}
