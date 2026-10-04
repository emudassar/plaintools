import { ToolError } from "./errors";

/**
 * Gas pool heater sizing — U.S. Department of Energy, Energy Saver,
 * "Gas Pool Heaters", section "Sizing a Gas Pool Heater".
 *
 * The live page (https://www.energy.gov/energysaver/gas-pool-heaters) returned
 * HTTP 404 on 2026-10-04; the text was read from the Internet Archive snapshot
 * of 2025-01-10:
 *   https://web.archive.org/web/20250110215051/https://www.energy.gov/energysaver/gas-pool-heaters
 *
 * Verbatim:
 *   "Use the following formula to determine the Btu/hour output requirement of
 *    the heater: Pool Area x Temperature Rise x 12
 *    This formula is based on 1 to 1-1/4 F temperature rise per hour and a
 *    3-1/2 mile per hour average wind at the pool surface. For a 1-1/2 F rise
 *    multiply by 1.5. For a 2 F rise multiply by 2.0."
 * Temperature rise = desired pool temperature - average temperature of the
 * coldest month of pool use. "Outputs range from 75,000 Btu to 450,000 Btu."
 *
 * Pool area geometry: rectangle L x W; circle pi r^2; oval treated as an
 * ellipse pi/4 x L x W. Free-form pools: enter the area directly.
 */

export const HEATER_RETRIEVED = "2026-10-04";
export const HEATER_ARCHIVE_URL =
  "https://web.archive.org/web/20250110215051/https://www.energy.gov/energysaver/gas-pool-heaters";
export const HEATER_LIVE_URL = "https://www.energy.gov/energysaver/gas-pool-heaters";

export const QUOTES = {
  formula: "Pool Area x Temperature Rise x 12",
  basis:
    "This formula is based on 1 to 1-1/4°F temperature rise per hour and a 3-1/2 mile per hour average wind at the pool surface. For a 1-1/2°F rise multiply by 1.5. For a 2°F rise multiply by 2.0.",
  professional:
    "You should have a trained pool professional perform a proper sizing analysis for your specific pool to determine pool heater size.",
  factors:
    "pools located in areas with higher average wind speeds at the pool surface, lower humidity, and cool nights will require a larger heater.",
  range: "Outputs range from 75,000 Btu to 450,000 Btu.",
} as const;

export type Shape = "rect" | "round" | "oval" | "area";
export type RiseRate = "base" | "1.5" | "2";

export const RISE_MULTIPLIER: Record<RiseRate, number> = { base: 1, "1.5": 1.5, "2": 2 };
export const RISE_LABEL: Record<RiseRate, string> = {
  base: "1 to 1¼°F per hour (the formula's basis)",
  "1.5": "1½°F per hour (× 1.5)",
  "2": "2°F per hour (× 2.0)",
};

export interface HeaterInput {
  shape: Shape;
  /** Feet. Length, or diameter for round. */
  a: number;
  /** Feet. Width (rect/oval). */
  b: number;
  /** Square feet when shape = "area". */
  area: number;
  desiredF: number;
  coldestMonthF: number;
  rate: RiseRate;
}

export interface HeaterResult {
  areaSqFt: number;
  areaMethod: string;
  riseF: number;
  multiplier: number;
  btuPerHour: number;
  belowRange: boolean;
  aboveRange: boolean;
  retrievedAt: string;
}

function positive(label: string, v: number): void {
  if (!Number.isFinite(v)) throw new ToolError("bad-input", `${label} must be a number.`);
  if (v <= 0) throw new ToolError("bad-input", `${label} must be more than zero.`);
}

export function poolArea(shape: Shape, a: number, b: number, area: number): { sqft: number; method: string } {
  switch (shape) {
    case "rect":
      positive("Length", a);
      positive("Width", b);
      return { sqft: a * b, method: `${a} ft × ${b} ft` };
    case "round":
      positive("Diameter", a);
      return { sqft: Math.PI * (a / 2) ** 2, method: `π × (${a} ft ÷ 2)²` };
    case "oval":
      positive("Length", a);
      positive("Width", b);
      return { sqft: (Math.PI / 4) * a * b, method: `π ÷ 4 × ${a} ft × ${b} ft (ellipse)` };
    case "area":
      positive("Surface area", area);
      return { sqft: area, method: "entered directly" };
  }
}

export function sizeHeater(input: HeaterInput): HeaterResult {
  const { sqft, method } = poolArea(input.shape, input.a, input.b, input.area);
  if (sqft > 100_000) throw new ToolError("bad-input", "That surface area is larger than any pool. Check the units (feet, not inches).");
  for (const [label, v] of [
    ["Desired pool temperature", input.desiredF],
    ["Coldest-month average temperature", input.coldestMonthF],
  ] as const) {
    if (!Number.isFinite(v)) throw new ToolError("bad-input", `${label} must be a number.`);
    if (v < -60 || v > 120) throw new ToolError("bad-input", `${label} must be in °F, between -60 and 120.`);
  }
  const riseF = input.desiredF - input.coldestMonthF;
  if (riseF <= 0) {
    throw new ToolError(
      "no-data",
      "The desired temperature is not above the coldest-month average, so the formula gives no heating requirement. Check that both are in °F.",
    );
  }
  const multiplier = RISE_MULTIPLIER[input.rate];
  const btuPerHour = sqft * riseF * 12 * multiplier;
  return {
    areaSqFt: sqft,
    areaMethod: method,
    riseF,
    multiplier,
    btuPerHour,
    belowRange: btuPerHour < 75_000,
    aboveRange: btuPerHour > 450_000,
    retrievedAt: HEATER_RETRIEVED,
  };
}
