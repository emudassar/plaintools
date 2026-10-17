import { ToolError } from "./errors";

/**
 * Bicycle gearing — Sheldon Brown, "Gain Ratios" (sheldonbrown.com/gain.html),
 * retrieved 2026-10-17:
 *  - gear inches: the drive wheel diameter multiplied by the sprocket ratio
 *  - development (metres): "wheel diameter in meters x front sprocket x pi /
 *    rear sprocket" — the distance moved per pedal revolution
 *  - gain ratio: "divide the wheel radius by the crank length", then multiply
 *    by the sprocket ratio
 * Speed at a cadence = development × rpm (unit conversion only).
 */

export const SHELDON_GAIN_URL = "https://www.sheldonbrown.com/gain.html";
export const GEAR_RETRIEVED = "2026-10-17";

export interface GearInput {
  chainring: number;
  cog: number;
  /** Wheel diameter with tyre, inches. */
  wheelIn: number;
  /** Crank length, mm. */
  crankMm: number;
  cadence: number;
}

export interface GearResult {
  ratio: number;
  gearInches: number;
  developmentM: number;
  rolloutIn: number;
  gainRatio: number;
  mph: number;
  kmh: number;
}

export function bikeGear(i: GearInput): GearResult {
  if (!Number.isInteger(i.chainring) || i.chainring < 10 || i.chainring > 80) throw new ToolError("bad-input", "Front sprocket teeth should be a whole number (for example 25 or 44).");
  if (!Number.isInteger(i.cog) || i.cog < 6 || i.cog > 60) throw new ToolError("bad-input", "Rear cog teeth should be a whole number (for example 9 or 16).");
  if (!Number.isFinite(i.wheelIn) || i.wheelIn < 8 || i.wheelIn > 40) throw new ToolError("bad-input", "Enter the wheel diameter with the tyre, in inches (about 20 for a 20 in BMX).");
  if (!Number.isFinite(i.crankMm) || i.crankMm < 80 || i.crankMm > 200) throw new ToolError("bad-input", "Enter the crank length in millimetres (for example 175).");
  if (!Number.isFinite(i.cadence) || i.cadence < 0 || i.cadence > 250) throw new ToolError("bad-input", "Cadence should be between 0 and 250 rpm.");
  const ratio = i.chainring / i.cog;
  const gearInches = i.wheelIn * ratio;
  const rolloutIn = gearInches * Math.PI;
  const developmentM = (i.wheelIn * 0.0254 * i.chainring * Math.PI) / i.cog;
  const radiusMm = (i.wheelIn * 25.4) / 2;
  const gainRatio = (radiusMm / i.crankMm) * ratio;
  const mph = (rolloutIn * i.cadence * 60) / 63_360;
  return { ratio, gearInches, developmentM, rolloutIn, gainRatio, mph, kmh: developmentM * i.cadence * 0.06 };
}

/** Gear inches table for a set of chainrings × cogs. */
export function gearTable(rings: number[], cogs: number[], wheelIn: number) {
  return rings.map((r) => cogs.map((c) => (wheelIn * r) / c));
}
