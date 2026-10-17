import { ToolError } from "./errors";

/**
 * Cooling capacity by room area — ENERGY STAR room air conditioner sizing.
 *
 * energystar.gov/products/room_air_conditioners, "Properly Sized Room Air
 * Conditioners", retrieved 2026-10-17. Chart "Area To Be Cooled (square feet)"
 * -> "Capacity Needed (BTUs per hour)", "calculated based on an 8-foot
 * ceiling". Adjustments as printed:
 *  - "If the room is heavily shaded, reduce capacity by 10 percent."
 *  - "If the room is very sunny, increase capacity by 10 percent."
 *  - "If more than two people regularly occupy the room, add 600 BTUs for each
 *     additional person."
 *  - "If the unit is used in a kitchen, increase capacity by 4,000 BTUs."
 * Order applied here: shade/sun percentage on the chart figure, then the
 * people and kitchen additions (the page does not state an order; this one is
 * noted on the result). 12,000 BTU/h = 1 ton of refrigeration (definition).
 *
 * The chart is ENERGY STAR's guidance for ROOM air conditioners. It is used
 * here per room/zone as a published area-based starting point; it is not a
 * Manual J heat-load calculation.
 */

export const ESTAR_URL = "https://www.energystar.gov/products/room_air_conditioners";
export const ESTAR_RETRIEVED = "2026-10-17";

/** [from ft², up to ft², BTU/h] as printed ("100 up to 150" -> 5,000). */
export const ESTAR_CHART: readonly (readonly [number, number, number])[] = [
  [100, 150, 5000],
  [150, 250, 6000],
  [250, 300, 7000],
  [300, 350, 8000],
  [350, 400, 9000],
  [400, 450, 10000],
  [450, 550, 12000],
  [550, 700, 14000],
  [700, 1000, 18000],
  [1000, 1200, 21000],
  [1200, 1400, 23000],
  [1400, 1500, 24000],
  [1500, 2000, 30000],
  [2000, 2500, 34000],
];

export interface ZoneInput {
  name: string;
  areaSqFt: number;
  sun: "normal" | "shaded" | "sunny";
  people: number;
  kitchen: boolean;
}

export interface ZoneResult {
  name: string;
  areaSqFt: number;
  rowIndex: number;
  chartBtu: number;
  sunAdj: number;
  peopleAdj: number;
  kitchenAdj: number;
  btu: number;
  tons: number;
}

export function zoneBtu(z: ZoneInput): ZoneResult {
  if (!Number.isFinite(z.areaSqFt) || z.areaSqFt <= 0) throw new ToolError("bad-input", `Enter the floor area of ${z.name || "each room"} in square feet.`);
  if (z.areaSqFt < 100) throw new ToolError("no-data", `${z.name || "This room"} is under 100 ft². ENERGY STAR's chart starts at 100 ft² (5,000 BTU/h); it gives no figure below that.`);
  if (z.areaSqFt > 2500) throw new ToolError("no-data", `${z.name || "This room"} is over 2,500 ft², the top of ENERGY STAR's chart. Split it into zones or use a load calculation.`);
  if (!Number.isInteger(z.people) || z.people < 0 || z.people > 50) throw new ToolError("bad-input", "People should be a whole number.");
  // "100 up to 150": a value on a boundary belongs to the lower row.
  const rowIndex = ESTAR_CHART.findIndex(([lo, hi]) => z.areaSqFt >= lo && z.areaSqFt <= hi);
  const chartBtu = ESTAR_CHART[rowIndex][2];
  const sunAdj = z.sun === "shaded" ? -0.1 * chartBtu : z.sun === "sunny" ? 0.1 * chartBtu : 0;
  const peopleAdj = Math.max(0, z.people - 2) * 600;
  const kitchenAdj = z.kitchen ? 4000 : 0;
  const btu = chartBtu + sunAdj + peopleAdj + kitchenAdj;
  return { name: z.name, areaSqFt: z.areaSqFt, rowIndex, chartBtu, sunAdj, peopleAdj, kitchenAdj, btu, tons: btu / 12000 };
}

export function zonesBtu(zones: ZoneInput[]) {
  if (!zones.length) throw new ToolError("bad-input", "Add at least one room.");
  const rows = zones.map(zoneBtu);
  const total = rows.reduce((a, r) => a + r.btu, 0);
  return { rows, total, totalTons: total / 12000 };
}
