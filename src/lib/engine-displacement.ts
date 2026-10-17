import { ToolError } from "./errors";

/**
 * Engine displacement: "the measure of the cylinder volume swept by all of
 * the pistons of a piston engine" — Displacement = stroke × π × (bore ÷ 2)² ×
 * number of cylinders (Wikipedia, "Engine displacement", retrieved
 * 2026-10-17). 1 in³ = 16.387064 cm³ exactly (1 in = 2.54 cm); 1 L = 1000 cm³.
 *
 * Reverse: bore needed for a target displacement given stroke and cylinders.
 */

export const DISPLACEMENT_URL = "https://en.wikipedia.org/wiki/Engine_displacement";
export const DISP_RETRIEVED = "2026-10-17";
const CC_PER_CI = 16.387064;

export interface DispInput {
  bore: number;
  stroke: number;
  unit: "in" | "mm";
  cylinders: number;
}

export interface DispResult {
  perCylinderCc: number;
  cc: number;
  liters: number;
  cubicInches: number;
  boreStrokeRatio: number;
}

export function displacement(i: DispInput): DispResult {
  const max = i.unit === "in" ? 20 : 500;
  if (!Number.isFinite(i.bore) || i.bore <= 0 || i.bore > max) throw new ToolError("bad-input", `Enter the bore in ${i.unit === "in" ? "inches" : "millimetres"}.`);
  if (!Number.isFinite(i.stroke) || i.stroke <= 0 || i.stroke > max) throw new ToolError("bad-input", `Enter the stroke in ${i.unit === "in" ? "inches" : "millimetres"}.`);
  if (!Number.isInteger(i.cylinders) || i.cylinders < 1 || i.cylinders > 32) throw new ToolError("bad-input", "Cylinders should be a whole number from 1 to 32.");
  const toCm = i.unit === "in" ? 2.54 : 0.1;
  const perCylinderCc = Math.PI * ((i.bore * toCm) / 2) ** 2 * (i.stroke * toCm);
  const cc = perCylinderCc * i.cylinders;
  return { perCylinderCc, cc, liters: cc / 1000, cubicInches: cc / CC_PER_CI, boreStrokeRatio: i.bore / i.stroke };
}

/** Bore that gives a target displacement (cc) for a stroke and cylinder count. */
export function boreFor(targetCc: number, stroke: number, unit: "in" | "mm", cylinders: number) {
  if (!Number.isFinite(targetCc) || targetCc <= 0) throw new ToolError("bad-input", "Enter the target displacement.");
  if (!Number.isFinite(stroke) || stroke <= 0) throw new ToolError("bad-input", "Enter the stroke.");
  if (!Number.isInteger(cylinders) || cylinders < 1) throw new ToolError("bad-input", "Cylinders should be a whole number.");
  const toCm = unit === "in" ? 2.54 : 0.1;
  const boreCm = 2 * Math.sqrt(targetCc / cylinders / (Math.PI * stroke * toCm));
  return boreCm / toCm;
}
