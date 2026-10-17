import { ToolError } from "./errors";

/**
 * Fuel use from appliance ratings.
 *
 * Heat content, U.S. Energy Information Administration, "British thermal
 * units (Btu)" (Energy Explained), retrieved 2026-10-17:
 *   propane 1 gallon = 91,452 Btu; heating oil 1 gallon = 138,500 Btu;
 *   natural gas 1 cubic foot = 1,036 Btu; electricity 1 kWh = 3,412 Btu.
 *
 * Gallons = Btu input per hour × hours ÷ Btu per gallon. An appliance's
 * nameplate rating is its INPUT (fuel burned), so no efficiency is applied to
 * nameplate figures. When the user starts from a heat load (Btu delivered),
 * fuel = load ÷ (efficiency × Btu per gallon).
 */

export const EIA_BTU_URL = "https://www.eia.gov/energyexplained/units-and-calculators/british-thermal-units.php";
export const FUEL_RETRIEVED = "2026-10-17";
export const BTU_PER_GAL = { propane: 91_452, oil: 138_500 } as const;

export interface Appliance {
  name: string;
  /** Nameplate input, Btu per hour. */
  btuPerHour: number;
  /** Hours run per day. */
  hoursPerDay: number;
}

export interface UsageResult {
  rows: { name: string; btuPerDay: number; galPerDay: number }[];
  btuPerDay: number;
  galPerDay: number;
  galPerMonth: number;
  daysOfFuel: number | null;
  costPerDay: number | null;
  costPerMonth: number | null;
}

export function applianceUsage(list: Appliance[], btuPerGal: number, usableGallons: number | null, pricePerGal: number | null): UsageResult {
  if (!list.length) throw new ToolError("bad-input", "Add at least one appliance.");
  const rows = list.map((a) => {
    if (!Number.isFinite(a.btuPerHour) || a.btuPerHour < 0 || a.btuPerHour > 10_000_000) throw new ToolError("bad-input", `Enter the Btu per hour rating for ${a.name || "each appliance"}.`);
    if (!Number.isFinite(a.hoursPerDay) || a.hoursPerDay < 0 || a.hoursPerDay > 24) throw new ToolError("bad-input", "Hours per day should be between 0 and 24.");
    const btuPerDay = a.btuPerHour * a.hoursPerDay;
    return { name: a.name, btuPerDay, galPerDay: btuPerDay / btuPerGal };
  });
  return finish(rows, btuPerGal, usableGallons, pricePerGal);
}

function finish(rows: UsageResult["rows"], btuPerGal: number, usableGallons: number | null, pricePerGal: number | null): UsageResult {
  if (usableGallons !== null && (!Number.isFinite(usableGallons) || usableGallons <= 0)) throw new ToolError("bad-input", "Enter the gallons in the tank, or leave it blank.");
  if (pricePerGal !== null && (!Number.isFinite(pricePerGal) || pricePerGal < 0)) throw new ToolError("bad-input", "Enter the price per gallon, or leave it blank.");
  const btuPerDay = rows.reduce((s, r) => s + r.btuPerDay, 0);
  const galPerDay = btuPerDay / btuPerGal;
  if (galPerDay <= 0) throw new ToolError("bad-input", "Nothing is burning: enter hours of use.");
  return {
    rows,
    btuPerDay,
    galPerDay,
    galPerMonth: galPerDay * 30,
    daysOfFuel: usableGallons === null ? null : usableGallons / galPerDay,
    costPerDay: pricePerGal === null ? null : galPerDay * pricePerGal,
    costPerMonth: pricePerGal === null ? null : galPerDay * 30 * pricePerGal,
  };
}

/** Oil burner: nozzle firing rate in gallons per hour × burner hours. */
export function oilByNozzle(gph: number, burnerHoursPerDay: number, usableGallons: number | null, pricePerGal: number | null): UsageResult {
  if (!Number.isFinite(gph) || gph <= 0 || gph > 50) throw new ToolError("bad-input", "Enter the nozzle firing rate in gallons per hour (for example 0.85).");
  if (!Number.isFinite(burnerHoursPerDay) || burnerHoursPerDay < 0 || burnerHoursPerDay > 24) throw new ToolError("bad-input", "Burner hours per day should be between 0 and 24.");
  const galPerDay = gph * burnerHoursPerDay;
  return finish([{ name: "Burner", btuPerDay: galPerDay * BTU_PER_GAL.oil, galPerDay }], BTU_PER_GAL.oil, usableGallons, pricePerGal);
}

/** From a delivered heat load (Btu/day) and the appliance's efficiency. */
export function byHeatLoad(btuDelivered: number, efficiencyPct: number, btuPerGal: number, usableGallons: number | null, pricePerGal: number | null): UsageResult {
  if (!Number.isFinite(btuDelivered) || btuDelivered <= 0) throw new ToolError("bad-input", "Enter the heat needed per day in Btu.");
  if (!Number.isFinite(efficiencyPct) || efficiencyPct <= 0 || efficiencyPct > 100) throw new ToolError("bad-input", "Efficiency should be between 1 and 100 percent.");
  const input = btuDelivered / (efficiencyPct / 100);
  return finish([{ name: "Heat load", btuPerDay: input, galPerDay: input / btuPerGal }], btuPerGal, usableGallons, pricePerGal);
}
