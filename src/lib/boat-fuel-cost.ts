import { ToolError } from "./errors";

/**
 * Boat fuel cost for a trip.
 *
 * Fuel = burn rate (per engine) x engines x hours; hours come from the user or
 * from distance / speed. Cost = fuel x price.
 *
 * North Carolina Sea Grant, Coastwatch, "On the Water: Save Fuel, Money:
 * Running Your Boat by the Numbers" (E-Ching Lee, 2014-04-07), retrieved
 * 2026-10-05:
 *  - Planing hulls with two- or four-stroke gasoline engines: "At full
 *    throttle and averaged across makes and models, those engines burn about
 *    one gallon of fuel per hour for every 10 horsepower".
 *  - Example: 250-hp four-stroke outboard, 25 gph at full throttle; 12.5 gph at
 *    77.5% of rated output.
 *  - Miles per gallon: "divide boat speed in knots by gph"; 17 knots at
 *    12.5 gph is about 1.4 nmpg.
 *  - Reserve: "A third to get there, a third to get back and a third as a
 *    safety margin."
 * No figure for diesel is given there, so the horsepower estimate is gasoline
 * only. 1 US gallon = 3.785411784 L (NIST HB 44).
 */

export const FUEL_RETRIEVED = "2026-10-05";
export const SEAGRANT_URL = "https://ncseagrant.ncsu.edu/coastwatch/on-the-water-save-fuel-money-running-your-boat-by-the-numbers/";
export const L_PER_GAL = 3.785411784;
/** Gallons per hour per horsepower at full throttle, gasoline planing boats (NC Sea Grant). */
export const WOT_GPH_PER_HP = 0.1;

export type BurnSource = "known" | "hp";
export type TripMode = "hours" | "distance";
export type FuelUnit = "gal" | "L";
export type DistUnit = "nm" | "mi" | "km";

export interface BoatFuelInput {
  burnSource: BurnSource;
  /** Known burn per engine, in fuelUnit per hour. */
  burnRate: number;
  /** Horsepower per engine, for the full-throttle estimate. */
  horsepower: number;
  engines: number;
  tripMode: TripMode;
  hours: number;
  distance: number;
  /** Speed in distance units per hour (knots for nm). */
  speed: number;
  distUnit: DistUnit;
  fuelUnit: FuelUnit;
  /** Price per fuelUnit. */
  price: number;
  /** Fuel tank capacity in fuelUnit, or null. */
  tank: number | null;
}

export interface BoatFuelResult {
  hours: number;
  /** Total burn, all engines, in fuelUnit per hour. */
  burnPerHour: number;
  fuel: number;
  fuelGal: number;
  fuelL: number;
  cost: number;
  costPerHour: number;
  /** Distance per fuel unit and cost per distance unit; null in hours mode. */
  distPerFuel: number | null;
  costPerDist: number | null;
  /** Fuel aboard by the rule of thirds when this trip is the out-and-back two thirds. */
  thirdsFuel: number;
  tankShort: boolean | null;
  estimated: boolean;
  retrievedAt: string;
}

function num(label: string, v: number, max: number, allowZero = false) {
  if (!Number.isFinite(v)) throw new ToolError("bad-input", `${label} must be a number.`);
  if (v < 0 || (!allowZero && v === 0)) throw new ToolError("bad-input", `${label} must be more than zero.`);
  if (v > max) throw new ToolError("bad-input", `${label} looks too large. Check the units.`);
}

export function calculateBoatFuelCost(i: BoatFuelInput): BoatFuelResult {
  if (!Number.isInteger(i.engines) || i.engines < 1 || i.engines > 6)
    throw new ToolError("bad-input", "Number of engines must be a whole number from 1 to 6.");
  let perEngine: number;
  if (i.burnSource === "known") {
    num("Fuel burn", i.burnRate, i.fuelUnit === "gal" ? 200 : 760);
    perEngine = i.burnRate;
  } else {
    num("Horsepower", i.horsepower, 2000);
    const gph = i.horsepower * WOT_GPH_PER_HP;
    perEngine = i.fuelUnit === "gal" ? gph : gph * L_PER_GAL;
  }
  let hours: number;
  if (i.tripMode === "hours") {
    num("Hours", i.hours, 1000);
    hours = i.hours;
  } else {
    num("Distance", i.distance, 20000);
    num("Speed", i.speed, 150);
    hours = i.distance / i.speed;
  }
  num("Fuel price", i.price, 100, true);

  const burnPerHour = perEngine * i.engines;
  const fuel = burnPerHour * hours;
  const fuelGal = i.fuelUnit === "gal" ? fuel : fuel / L_PER_GAL;
  const cost = fuel * i.price;
  const thirdsFuel = (fuel * 3) / 2;
  let tankShort: boolean | null = null;
  if (i.tank !== null) {
    num("Tank capacity", i.tank, i.fuelUnit === "gal" ? 5000 : 19000);
    tankShort = thirdsFuel > i.tank;
  }
  const dist = i.tripMode === "distance" ? i.distance : null;
  return {
    hours,
    burnPerHour,
    fuel,
    fuelGal,
    fuelL: fuelGal * L_PER_GAL,
    cost,
    costPerHour: burnPerHour * i.price,
    distPerFuel: dist === null ? null : dist / fuel,
    costPerDist: dist === null ? null : cost / dist,
    thirdsFuel,
    tankShort,
    estimated: i.burnSource === "hp",
    retrievedAt: FUEL_RETRIEVED,
  };
}
