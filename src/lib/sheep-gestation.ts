import { ToolError } from "./errors";
import { addDays, parseDate, type DateRange } from "./calendar-days";

export { formatDate, formatRange } from "./calendar-days";

/**
 * Sheep gestation / lambing date.
 *
 * Sources, retrieved 2026-10-04:
 *  - Merck Veterinary Manual, John F. Mee (Teagasc), "Overview of Prolonged
 *    Gestation in Cattle and Sheep", last updated Sept 2024:
 *      "In sheep, although the normal gestation length is 144–150 days, the
 *       exact gestation length is seldom known unless ewes were served in hand
 *       or by artificial insemination."
 *      "Crayon color is changed at 14- to 17-day intervals, and after later
 *       pregnancy confirmation (via transabdominal ultrasonography), a lambing
 *       date within a 14- to 17-day period is calculated."
 *    https://www.merckvetmanual.com/reproductive-system/prolonged-gestation-in-cattle-and-sheep/overview-of-prolonged-gestation-in-cattle-and-sheep
 *  - Merck Veterinary Manual table "Approximate Gestation Periods": Sheep 150 (days).
 *    https://www.merckvetmanual.com/multimedia/table/approximate-gestation-periods
 *
 * 147 days is shown only as the midpoint of the 144–150-day normal range —
 * arithmetic, labelled as such, not a claimed population average.
 */

export const SHEEP_RETRIEVED = "2026-10-04";
export const MERCK_PROLONGED_URL =
  "https://www.merckvetmanual.com/reproductive-system/prolonged-gestation-in-cattle-and-sheep/overview-of-prolonged-gestation-in-cattle-and-sheep";
export const MERCK_TABLE_URL =
  "https://www.merckvetmanual.com/multimedia/table/approximate-gestation-periods";

export const NORMAL = { low: 144, high: 150 } as const;
export const MIDPOINT = (NORMAL.low + NORMAL.high) / 2;
export const TABLE_DAYS = 150;

export const QUOTES = {
  normal:
    "In sheep, although the normal gestation length is 144–150 days, the exact gestation length is seldom known unless ewes were served in hand or by artificial insemination.",
  crayon:
    "Crayon color is changed at 14- to 17-day intervals, and after later pregnancy confirmation (via transabdominal ultrasonography), a lambing date within a 14- to 17-day period is calculated.",
} as const;

export interface SheepInput {
  /** YYYY-MM-DD: hand-mating/AI date, or ram turned in / crayon colour put on. */
  bredOn: string;
  /** YYYY-MM-DD or null: ram removed / crayon colour changed. */
  bredUntil: string | null;
}

export interface SheepResult {
  bredOn: Date;
  bredUntil: Date | null;
  exposureDays: number | null;
  normalWindow: DateRange;
  midpoint: DateRange;
  tableFigure: DateRange;
  retrievedAt: string;
}

export function calculateSheepGestation(input: SheepInput): SheepResult {
  const bredOn = parseDate(input.bredOn, "breeding date");
  const bredUntil =
    input.bredUntil !== null ? parseDate(input.bredUntil, "ram-out or crayon-change date") : null;
  if (bredUntil && bredUntil < bredOn)
    throw new ToolError("bad-input", "The end date is before the start date.");
  const exposureDays = bredUntil
    ? Math.round((bredUntil.getTime() - bredOn.getTime()) / 86_400_000)
    : null;
  if (exposureDays !== null && exposureDays > 365) {
    throw new ToolError(
      "bad-input",
      "A breeding period longer than a year is outside what this calculator handles.",
    );
  }
  const end = bredUntil ?? bredOn;
  return {
    bredOn,
    bredUntil,
    exposureDays,
    normalWindow: {
      from: addDays(bredOn, NORMAL.low),
      to: addDays(end, NORMAL.high),
    },
    midpoint: { from: addDays(bredOn, MIDPOINT), to: addDays(end, MIDPOINT) },
    tableFigure: {
      from: addDays(bredOn, TABLE_DAYS),
      to: addDays(end, TABLE_DAYS),
    },
    retrievedAt: SHEEP_RETRIEVED,
  };
}
