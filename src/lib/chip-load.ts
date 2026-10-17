import { ToolError } from "./errors";

/**
 * Milling chip load (feed per tooth), feed rate and spindle speed.
 *
 * Haas Automation, "Mill — Speeds and Feeds Formulas — Inch" reference,
 * retrieved 2026-10-17:
 *   IPM = Feed per Tooth × Number of Teeth × RPM
 *   IPM = Feed per Rev × RPM
 *   RPM = SFM × 3.82 ÷ Ø  (3.82 ≈ 12 ÷ π)
 * Rearranged: chip load = IPM ÷ (RPM × flutes). Metric: mm/min and mm.
 * Surface speed from RPM: SFM = RPM × π × D ÷ 12.
 */

export const HAAS_URL = "https://www.haascnc.com/content/dam/haascnc/en/service/reference/programming-workbooks/mill---speeds-and-feeds-formulas---inch.pdf";
export const CHIP_RETRIEVED = "2026-10-17";

export interface ChipInput {
  solveFor: "chipload" | "feed";
  rpm: number;
  flutes: number;
  /** Feed rate, in/min or mm/min (solveFor = chipload). */
  feed: number;
  /** Chip load, in or mm per tooth (solveFor = feed). */
  chipLoad: number;
  /** Tool diameter for surface speed (optional), in or mm. */
  diameter: number | null;
  unit: "in" | "mm";
}

export interface ChipResult {
  chipLoad: number;
  feed: number;
  feedPerRev: number;
  surfaceSpeed: number | null;
}

export function chipLoad(i: ChipInput): ChipResult {
  if (!Number.isFinite(i.rpm) || i.rpm <= 0 || i.rpm > 200_000) throw new ToolError("bad-input", "Enter the spindle speed in RPM.");
  if (!Number.isInteger(i.flutes) || i.flutes < 1 || i.flutes > 40) throw new ToolError("bad-input", "Number of flutes should be a whole number (for example 2, 3 or 4).");
  let chip: number;
  let feed: number;
  if (i.solveFor === "chipload") {
    if (!Number.isFinite(i.feed) || i.feed <= 0) throw new ToolError("bad-input", `Enter the feed rate in ${i.unit === "in" ? "inches" : "mm"} per minute.`);
    feed = i.feed;
    chip = feed / (i.rpm * i.flutes);
  } else {
    if (!Number.isFinite(i.chipLoad) || i.chipLoad <= 0) throw new ToolError("bad-input", "Enter the chip load per tooth.");
    chip = i.chipLoad;
    feed = chip * i.flutes * i.rpm;
  }
  let surfaceSpeed: number | null = null;
  if (i.diameter !== null) {
    if (!Number.isFinite(i.diameter) || i.diameter <= 0) throw new ToolError("bad-input", "Enter the tool diameter, or leave it blank.");
    // SFM (ft/min) for inch; m/min for mm.
    surfaceSpeed = i.unit === "in" ? (i.rpm * Math.PI * i.diameter) / 12 : (i.rpm * Math.PI * i.diameter) / 1000;
  }
  return { chipLoad: chip, feed, feedPerRev: feed / i.rpm, surfaceSpeed };
}

/** RPM from surface speed: inch SFM × 3.82 ÷ D (Haas); metric m/min × 1000 ÷ (π D). */
export function rpmFromSurface(speed: number, diameter: number, unit: "in" | "mm") {
  if (!Number.isFinite(speed) || speed <= 0 || !Number.isFinite(diameter) || diameter <= 0) throw new ToolError("bad-input", "Enter the surface speed and tool diameter.");
  return unit === "in" ? (speed * 12) / (Math.PI * diameter) : (speed * 1000) / (Math.PI * diameter);
}
