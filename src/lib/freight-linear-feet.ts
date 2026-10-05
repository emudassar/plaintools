import { ToolError } from "./errors";

/**
 * Linear feet of trailer floor used by palletized freight.
 *
 * Geometry: pallets are placed in rows across the trailer. For each of the two
 * floor orientations ("straight": pallet length runs along the trailer, and
 * "turned": pallet width runs along it), pallets per row = floor(inside width
 * / the pallet side facing across). Floor positions = pallets (or pallets / 2,
 * rounded up, when stacked two high). Rows = ceil(positions / per row);
 * linear inches = rows x the side running along the trailer.
 *
 * Default inside width: Utility Trailer, Dry Van Features & Options — "101"
 * width from wearband to wearband" (101-1/4" lining to lining) for its 53' dry
 * van. Retrieved 2026-10-05 from
 *   https://www.utilitytrailer.com/dry-vans/features-options/
 */

export const LINEAR_RETRIEVED = "2026-10-05";
export const UTILITY_URL = "https://www.utilitytrailer.com/dry-vans/features-options/";
export const DEFAULT_WIDTH_IN = 101;

export interface LinearFeetInput {
  pallets: number;
  lengthIn: number;
  widthIn: number;
  stackable: boolean;
  trailerWidthIn: number;
  trailerLengthFt: number;
}

export interface Layout {
  name: "straight" | "turned";
  alongIn: number;
  acrossIn: number;
  perRow: number;
  rows: number;
  linearIn: number;
  linearFt: number;
  fits: boolean;
}

export interface LinearFeetResult {
  positions: number;
  straight: Layout;
  turned: Layout;
  best: Layout;
  trailerLengthFt: number;
  overLength: boolean;
  retrievedAt: string;
}

function layout(name: Layout["name"], along: number, across: number, positions: number, width: number, maxFt: number): Layout {
  const perRow = Math.floor(width / across + 1e-9);
  if (perRow < 1) return { name, alongIn: along, acrossIn: across, perRow: 0, rows: 0, linearIn: Infinity, linearFt: Infinity, fits: false };
  const rows = Math.ceil(positions / perRow);
  const linearIn = rows * along;
  return { name, alongIn: along, acrossIn: across, perRow, rows, linearIn, linearFt: linearIn / 12, fits: linearIn / 12 <= maxFt + 1e-9 };
}

export function linearFeet(input: LinearFeetInput): LinearFeetResult {
  const { pallets, lengthIn, widthIn, trailerWidthIn, trailerLengthFt } = input;
  if (!Number.isFinite(pallets) || pallets < 1 || !Number.isInteger(pallets)) {
    throw new ToolError("bad-input", "Enter the number of pallets as a whole number, 1 or more.");
  }
  if (pallets > 500) throw new ToolError("bad-input", "That is over 500 pallets. Check the number.");
  for (const [label, v] of [["Pallet length", lengthIn], ["Pallet width", widthIn], ["Trailer inside width", trailerWidthIn], ["Trailer length", trailerLengthFt]] as const) {
    if (!Number.isFinite(v) || v <= 0) throw new ToolError("bad-input", `${label} must be more than zero.`);
  }
  if (lengthIn > 600 || widthIn > 600) throw new ToolError("bad-input", "Pallet sizes are in inches. Check the units.");
  if (trailerWidthIn > 120) throw new ToolError("bad-input", "Trailer inside width is in inches (a 53' dry van is about 101).");

  const positions = input.stackable ? Math.ceil(pallets / 2) : pallets;
  const straight = layout("straight", lengthIn, widthIn, positions, trailerWidthIn, trailerLengthFt);
  const turned = layout("turned", widthIn, lengthIn, positions, trailerWidthIn, trailerLengthFt);
  if (straight.perRow === 0 && turned.perRow === 0) {
    throw new ToolError(
      "no-data",
      `A ${lengthIn} × ${widthIn} in pallet is wider than the ${trailerWidthIn} in inside width either way round, so it cannot sit on the floor of this trailer.`,
    );
  }
  const best = turned.linearIn < straight.linearIn ? turned : straight;
  return {
    positions,
    straight,
    turned,
    best,
    trailerLengthFt,
    overLength: best.linearFt > trailerLengthFt + 1e-9,
    retrievedAt: LINEAR_RETRIEVED,
  };
}
