import { ToolError } from "./errors";

/**
 * Go-kart / mini-bike gear ratio and theoretical top speed.
 *
 * Formula chain as published by CSG Network's "Go Kart Speed Calculator"
 * (csgnetwork.com/kartpotentialspeedcalc.html), read 2026-10-14:
 *   C = π × D (tyre circumference); GR = axle teeth / clutch teeth; WRPM = RPM / GR;
 *   FPM = (C / 12) × WRPM; MPH = FPM × 60 / 5280.
 * Its default (6 in tyre, 3600 RPM, 60/12 teeth, GR 5) gives "just under 13 miles per hour"
 * — this module gives 12.85. Jackshaft: the two stage ratios multiply (axle/jackshaft-output ×
 * jackshaft-input/clutch). 1 mile = 5280 ft = 63,360 in; 1 in = 2.54 cm (exact, NIST).
 */

export const GEAR_RETRIEVED = "2026-10-14";
export const CSG_URL = "http://www.csgnetwork.com/kartpotentialspeedcalc.html";

export interface GearInput {
  clutch: number;
  axle: number;
  /** Jackshaft sprockets, or null for direct drive. jsIn is driven by the clutch; jsOut drives the axle. */
  jackshaft: { jsIn: number; jsOut: number } | null;
  tireDiameter: number;
  tireUnit: "in" | "cm";
  rpm: number;
}

export interface GearResult {
  ratio: number;
  stages: { label: string; ratio: number }[];
  circumferenceIn: number;
  wheelRpm: number;
  mph: number;
  kmh: number;
  /** Speed chart for direct drive at this RPM and tyre: clutch teeth × axle teeth. */
  chart: { clutch: number; cells: { axle: number; ratio: number; mph: number }[] }[];
  chartAxles: number[];
  retrievedAt: string;
}

const whole = (v: number, what: string, min: number, max: number) => {
  if (!Number.isFinite(v) || !Number.isInteger(v) || v < min || v > max) throw new ToolError("bad-input", `${what} should be a whole number of teeth between ${min} and ${max}.`);
};

export const mphFor = (rpm: number, ratio: number, circumferenceIn: number) => ((rpm / ratio) * circumferenceIn * 60) / 63360;

export function gearRatio(input: GearInput): GearResult {
  whole(input.clutch, "Clutch (engine) sprocket", 5, 40);
  whole(input.axle, "Axle sprocket", 10, 120);
  if (input.jackshaft) {
    whole(input.jackshaft.jsIn, "Jackshaft input sprocket", 5, 120);
    whole(input.jackshaft.jsOut, "Jackshaft output sprocket", 5, 60);
  }
  if (!Number.isFinite(input.tireDiameter) || input.tireDiameter <= 0) throw new ToolError("bad-input", "Enter the drive tyre's diameter.");
  const dIn = input.tireUnit === "in" ? input.tireDiameter : input.tireDiameter / 2.54;
  if (dIn < 3 || dIn > 40) throw new ToolError("bad-input", "Tyre diameter should be between 3 and 40 inches (about 8–100 cm). Check the unit.");
  if (!Number.isFinite(input.rpm) || input.rpm < 500 || input.rpm > 20000) throw new ToolError("bad-input", "Engine RPM should be between 500 and 20,000.");

  const stages = input.jackshaft
    ? [
        { label: `Clutch ${input.clutch}T → jackshaft ${input.jackshaft.jsIn}T`, ratio: input.jackshaft.jsIn / input.clutch },
        { label: `Jackshaft ${input.jackshaft.jsOut}T → axle ${input.axle}T`, ratio: input.axle / input.jackshaft.jsOut },
      ]
    : [{ label: `Clutch ${input.clutch}T → axle ${input.axle}T`, ratio: input.axle / input.clutch }];
  const ratio = stages.reduce((t, s) => t * s.ratio, 1);
  const circumferenceIn = Math.PI * dIn;
  const mph = mphFor(input.rpm, ratio, circumferenceIn);

  const chartAxles = [50, 55, 60, 65, 70, 72, 75, 80];
  const chart = [10, 11, 12, 13, 14].map((c) => ({
    clutch: c,
    cells: chartAxles.map((a) => ({ axle: a, ratio: a / c, mph: mphFor(input.rpm, a / c, circumferenceIn) })),
  }));

  return { ratio, stages, circumferenceIn, wheelRpm: input.rpm / ratio, mph, kmh: mph * 1.609344, chart, chartAxles, retrievedAt: GEAR_RETRIEVED };
}
