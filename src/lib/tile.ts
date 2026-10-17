import { ToolError } from "./errors";

/**
 * Tile count for a floor or wall.
 *
 * Plain arithmetic, no external figures:
 *   area per tile laid  = (tile length + joint) × (tile width + joint)
 *   tiles (net)         = area ÷ area per tile laid
 *   tiles to buy        = ceil(net × (1 + waste % ÷ 100))
 *   boxes               = ceil(tiles to buy ÷ tiles per box)
 * The grout joint is included because each tile occupies its own face plus one
 * joint in each direction. The waste allowance is the user's own figure.
 */

export type TileUnits = "imperial" | "metric";

export interface TileInput {
  units: TileUnits;
  /** Areas to cover: ft² (imperial) or m² (metric). */
  areas: number[];
  /** Tile face size: inches (imperial) or mm (metric). */
  tileL: number;
  tileW: number;
  /** Grout joint: inches (imperial) or mm (metric). */
  joint: number;
  wastePct: number;
  tilesPerBox: number | null;
  /** Price per box (if tilesPerBox given) else per tile. */
  price: number | null;
}

export interface TileResult {
  area: number;
  /** Area each tile occupies including one joint, in the area unit. */
  areaPerTile: number;
  netTiles: number;
  tiles: number;
  boxes: number | null;
  cost: number | null;
  groutShare: number;
}

export function tileCount(input: TileInput): TileResult {
  const { units } = input;
  if (!input.areas.length || input.areas.some((a) => !Number.isFinite(a) || a <= 0))
    throw new ToolError("bad-input", "Enter every area as a positive number.");
  const area = input.areas.reduce((a, b) => a + b, 0);
  if (area > (units === "imperial" ? 100_000 : 10_000)) throw new ToolError("bad-input", "That area is too large for one estimate. Check the unit.");
  const maxTile = units === "imperial" ? 120 : 3000;
  for (const [v, name] of [[input.tileL, "tile length"], [input.tileW, "tile width"]] as const)
    if (!Number.isFinite(v) || v <= 0 || v > maxTile) throw new ToolError("bad-input", `Enter the ${name} in ${units === "imperial" ? "inches" : "millimetres"}.`);
  const maxJoint = units === "imperial" ? 1 : 25;
  if (!Number.isFinite(input.joint) || input.joint < 0 || input.joint > maxJoint)
    throw new ToolError("bad-input", `Grout joint should be between 0 and ${maxJoint} ${units === "imperial" ? "inch" : "mm"}.`);
  if (!Number.isFinite(input.wastePct) || input.wastePct < 0 || input.wastePct > 100) throw new ToolError("bad-input", "Waste allowance should be between 0 and 100 percent.");
  if (input.tilesPerBox !== null && (!Number.isInteger(input.tilesPerBox) || input.tilesPerBox <= 0 || input.tilesPerBox > 10_000))
    throw new ToolError("bad-input", "Tiles per box should be a whole number, or leave it blank.");
  if (input.price !== null && (!Number.isFinite(input.price) || input.price < 0)) throw new ToolError("bad-input", "Enter the price as a positive number, or leave it blank.");

  // Square inches per ft², or mm² per m².
  const perAreaUnit = units === "imperial" ? 144 : 1_000_000;
  const laid = (input.tileL + input.joint) * (input.tileW + input.joint);
  const areaPerTile = laid / perAreaUnit;
  const netTiles = area / areaPerTile;
  const tiles = Math.ceil(netTiles * (1 + input.wastePct / 100) - 1e-9);
  const boxes = input.tilesPerBox ? Math.ceil(tiles / input.tilesPerBox - 1e-9) : null;
  const cost = input.price === null ? null : boxes !== null ? boxes * input.price : tiles * input.price;
  const groutShare = 1 - (input.tileL * input.tileW) / laid;
  return { area, areaPerTile, netTiles, tiles, boxes, cost, groutShare };
}
