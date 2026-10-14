import { ToolError } from "./errors";

/**
 * Snowboard length from rider weight, plus minimum waist width from boot size.
 *
 * Source: Jones Snowboards, "What size snowboard do I need? Complete size guide and
 * charts" (jonessnowboards.com/base-camp/blog/jones-snowboards-sizing-guidelines.html),
 * read 2026-10-14. Tables transcribed from the page HTML exactly:
 *  - Men's & women's chart: rider weight (kg and lbs ranges, overlapping) → recommended
 *    size (cm). First row printed "<75-100 lbs" / "34-45 kg"; last "225+ lbs" / "105+ kg" → "165+".
 *  - Kids & youth chart: same layout, 70–80 cm up. Last row printed "130-45" (an evident
 *    misprint of the upper end) — kept as an open upper end, never guessed.
 *  - Wide board chart: Men's US / Women's US / UK / EU boot size → "Recommended Minimum
 *    Board waist width". At or below Men's US 10 / Women's US 11.5 / UK 9 / EU 44 the page
 *    says a regular width works; above it, a wide board.
 * Rules quoted on the page: "When your weight falls into multiple size ranges, select the
 * middle size." Beginner: "Often prefer slightly shorter (1-2cm)". Freeride and powder:
 * "2–3 cm longer" options; freestyle 2–3 cm shorter or longer.
 */

export const SNOWBOARD_RETRIEVED = "2026-10-14";
export const JONES_URL = "https://www.jonessnowboards.com/base-camp/blog/jones-snowboards-sizing-guidelines.html";

export interface WeightRow {
  kgMin: number;
  kgMax: number | null;
  lbMin: number;
  lbMax: number | null;
  /** Printed lbs label, e.g. "<75-100". */
  lbLabel: string;
  kgLabel: string;
  sizeMin: number;
  /** null = open upper end ("165+", or the kids misprint). */
  sizeMax: number | null;
  sizeLabel: string;
}

const w = (kgMin: number, kgMax: number | null, lbMin: number, lbMax: number | null, lbLabel: string, kgLabel: string, sizeMin: number, sizeMax: number | null, sizeLabel: string): WeightRow => ({
  kgMin, kgMax, lbMin, lbMax, lbLabel, kgLabel, sizeMin, sizeMax, sizeLabel,
});

export const ADULT: readonly WeightRow[] = [
  w(34, 45, 75, 100, "<75-100", "34-45", 137, 143, "137-143"),
  w(43, 50, 95, 110, "95-110", "43-50", 140, 145, "140-145"),
  w(47, 54, 105, 120, "105-120", "47-54", 142, 147, "142-147"),
  w(52, 58, 115, 130, "115-130", "52-58", 144, 149, "144-149"),
  w(56, 63, 125, 140, "125-140", "56-63", 146, 151, "146-151"),
  w(61, 68, 135, 150, "135-150", "61-68", 148, 153, "148-153"),
  w(65, 72, 145, 160, "145-160", "65-72", 150, 155, "150-155"),
  w(70, 77, 155, 170, "155-170", "70-77", 152, 157, "152-157"),
  w(74, 81, 165, 180, "165-180", "74-81", 154, 159, "154-159"),
  w(79, 86, 175, 190, "175-190", "79-86", 156, 161, "156-161"),
  w(83, 91, 185, 200, "185-200", "83-91", 158, 163, "158-163"),
  w(88, 95, 195, 210, "195-210", "88-95", 160, 165, "160-165"),
  w(92, 99, 205, 220, "205-220", "92-99", 162, 167, "162-167"),
  w(97, 104, 215, 230, "215-230", "97-104", 164, 169, "164-169"),
  w(105, null, 225, null, "225+", "105+", 165, null, "165+"),
];

export const KIDS: readonly WeightRow[] = [
  w(10, 20, 20, 45, "20-45", "10-20", 70, 80, "70-80"),
  w(12, 24, 25, 52, "25-52", "12-24", 80, 90, "80-90"),
  w(14, 24, 30, 52, "30-52", "14-24", 85, 95, "85-95"),
  w(15, 24, 33, 52, "33-52", "15-24", 90, 100, "90-100"),
  w(17, 29, 37, 63, "37-63", "17-29", 95, 105, "95-105"),
  w(20, 32, 44, 70, "44-70", "20-32", 100, 109, "100-109"),
  w(23, 35, 50, 77, "50-77", "23-35", 105, 119, "105-119"),
  w(26, 38, 57, 83, "57-83", "26-38", 110, 125, "110-125"),
  w(30, 42, 66, 92, "66-92", "30-42", 115, 129, "115-129"),
  w(35, 47, 77, 103, "77-103", "35-47", 125, 135, "125-135"),
  w(40, 52, 88, 114, "88-114", "40-52", 130, null, "130-45 (as printed)"),
];

export interface WidthRow {
  menUs: number;
  womenUs: number;
  uk: number;
  eu: string;
  euMin: number;
  minWaistCm: number;
  plus: boolean;
}

export const WIDE: readonly WidthRow[] = [
  { menUs: 10, womenUs: 11.5, uk: 9, eu: "44", euMin: 44, minWaistCm: 25.9, plus: false },
  { menUs: 10.5, womenUs: 12, uk: 9.5, eu: "44.5", euMin: 44.5, minWaistCm: 26.1, plus: false },
  { menUs: 11, womenUs: 12.5, uk: 10, eu: "45", euMin: 45, minWaistCm: 26.3, plus: false },
  { menUs: 11.5, womenUs: 13, uk: 10.5, eu: "45.5", euMin: 45.5, minWaistCm: 26.5, plus: false },
  { menUs: 12, womenUs: 13.5, uk: 11, eu: "46, 46.5", euMin: 46, minWaistCm: 26.7, plus: false },
  { menUs: 12.5, womenUs: 14, uk: 11.5, eu: "47", euMin: 47, minWaistCm: 26.9, plus: false },
  { menUs: 13, womenUs: 14.5, uk: 12, eu: "47.5", euMin: 47.5, minWaistCm: 27.1, plus: false },
  { menUs: 13.5, womenUs: 15, uk: 12.5, eu: "48", euMin: 48, minWaistCm: 27.3, plus: false },
  { menUs: 14, womenUs: 15.5, uk: 13, eu: "48.5", euMin: 48.5, minWaistCm: 27.5, plus: false },
  { menUs: 14.5, womenUs: 16, uk: 13.5, eu: "49+", euMin: 49, minWaistCm: 27.8, plus: true },
];

export type BootSystem = "men-us" | "women-us" | "uk" | "eu";
export type Level = "beginner" | "intermediate" | "expert";
export type Style = "all-mountain" | "freeride" | "powder" | "freestyle";

export interface SnowboardInput {
  rider: "adult" | "kid";
  weight: number;
  unit: "lb" | "kg";
  level: Level;
  style: Style;
  boot: number | null;
  bootSystem: BootSystem;
}

export interface WidthAnswer {
  wide: boolean;
  /** Minimum waist width in cm when wide; null when a regular width works. */
  minWaistCm: number | null;
  row: WidthRow | null;
}

export interface SnowboardResult {
  rider: "adult" | "kid";
  weightLb: number;
  weightKg: number;
  rows: WeightRow[];
  /** Span of the matched ranges, cm. Upper null when open-ended. */
  spanMin: number;
  spanMax: number | null;
  /** Jones's "middle size": centre of the matched span. Null when the span is open-ended. */
  middle: number | null;
  levelNote: string;
  styleNote: string;
  width: WidthAnswer | null;
  retrievedAt: string;
}

const KG_PER_LB = 0.45359237;

export function widthFor(boot: number, system: BootSystem): WidthAnswer {
  if (!Number.isFinite(boot) || boot <= 0) throw new ToolError("bad-input", "Enter a boot size above zero, or leave it blank.");
  const key = (r: WidthRow) => (system === "men-us" ? r.menUs : system === "women-us" ? r.womenUs : system === "uk" ? r.uk : r.euMin);
  const threshold = key(WIDE[0]);
  if (boot <= threshold + 1e-9) return { wide: false, minWaistCm: null, row: null };
  // Smallest chart row at or above the boot size (round up between sizes), capped at the "+" row.
  let row = WIDE.find((r) => key(r) >= boot - 1e-9) ?? WIDE[WIDE.length - 1];
  // EU "46, 46.5" shares one row.
  if (system === "eu" && boot > 46 && boot <= 46.5) row = WIDE[4];
  return { wide: true, minWaistCm: row.minWaistCm, row };
}

const LEVEL_NOTES: Record<Level, string> = {
  beginner: "Jones: beginners 'often prefer slightly shorter (1-2cm) or softer-flexing boards'.",
  intermediate: "Jones: intermediate to advanced riders 'benefit from choosing the recommended size'.",
  expert: "Jones: experts 'often choose a slightly longer or stiffer board' (no figure given).",
};
const STYLE_NOTES: Record<Style, string> = {
  "all-mountain": "All-mountain: Jones gives the recommended size.",
  freeride: "Freeride / big mountain: the recommended size, or 2–3 cm longer for stability at speed, float and grip on firm snow.",
  powder: "Powder: the recommended size, or 2–3 cm longer for more float.",
  freestyle: "Freestyle / park: the recommended size, 2–3 cm shorter for spins and quick edge changes, or 2–3 cm longer for landing big features.",
};

export function snowboardSize(input: SnowboardInput): SnowboardResult {
  const v = input.weight;
  if (!Number.isFinite(v) || v <= 0) throw new ToolError("bad-input", "Enter the rider's weight.");
  const lb = input.unit === "lb" ? v : v / KG_PER_LB;
  const kg = input.unit === "kg" ? v : v * KG_PER_LB;
  if (lb > 500) throw new ToolError("bad-input", "That weight is over 500 lb (227 kg). Check the unit.");
  const table = input.rider === "adult" ? ADULT : KIDS;

  // Match in the unit entered: the chart's lbs and kg columns are rounded separately.
  const lo = (r: WeightRow) => (input.unit === "lb" ? r.lbMin : r.kgMin);
  const hi = (r: WeightRow) => (input.unit === "lb" ? r.lbMax : r.kgMax);
  const first = table[0];
  const last = table[table.length - 1];
  if (v < lo(first) - 1e-9) {
    if (input.rider === "adult")
      throw new ToolError("no-data", `Jones's adult chart starts at ${first.lbLabel} lbs (${first.kgLabel} kg). For a lighter rider, use the kids and youth chart.`);
    throw new ToolError("no-data", `Jones's kids chart starts at ${first.lbLabel} lbs (${first.kgLabel} kg), with a ${first.sizeLabel} cm board. It lists nothing lighter.`);
  }
  if (input.rider === "kid" && v > (hi(last) ?? Infinity) + 1e-9)
    throw new ToolError("no-data", `Jones's kids chart ends at ${last.lbLabel} lbs (${last.kgLabel} kg). Switch to the adult chart, which starts at 75 lbs.`);

  const rows = table.filter((r) => v >= lo(r) - 1e-9 && (hi(r) === null || v <= (hi(r) as number) + 1e-9));
  if (rows.length === 0) throw new ToolError("no-data", "That weight falls in a gap in the chart.");
  const spanMin = Math.min(...rows.map((r) => r.sizeMin));
  const open = rows.some((r) => r.sizeMax === null);
  const spanMax = open ? null : Math.max(...rows.map((r) => r.sizeMax as number));
  const middle = spanMax === null ? null : (spanMin + spanMax) / 2;

  let width: WidthAnswer | null = null;
  if (input.boot !== null) width = widthFor(input.boot, input.bootSystem);

  return {
    rider: input.rider,
    weightLb: lb,
    weightKg: kg,
    rows,
    spanMin,
    spanMax,
    middle,
    levelNote: LEVEL_NOTES[input.level],
    styleNote: STYLE_NOTES[input.style],
    width,
    retrievedAt: SNOWBOARD_RETRIEVED,
  };
}
