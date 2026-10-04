import { ToolError } from "./errors";
import {
  addYears,
  dueStatus,
  laterOf,
  monthIndex,
  validateMonthYear,
  type DueStatus,
  type MonthYear,
} from "./month";

/**
 * When a portable fire extinguisher's next hydrostatic test (and, for
 * stored-pressure dry chemical units, its 6-year maintenance) is due, from
 * OSHA 29 CFR 1910.157(e) and (f), Table L-1. Text read from eCFR, current as of
 * 2026-10-01 (last amended 2017-01-01):
 *   https://www.ecfr.gov/current/title-29/part-1910/section-1910.157
 *
 * Rules used, each read from the regulation text:
 * - (f)(2): extinguishers "are hydrostatically tested at the intervals listed
 *   in Table L-1", except when repaired by soldering/welding/brazing/patching,
 *   threads damaged, pitting corrosion, burned in a fire, or calcium chloride
 *   used in a stainless shell.
 * - Table L-1: 5 or 12 years by type (rows below, verbatim names). Soldered
 *   brass soda acid and foam shells: footnote 1, "shall not be hydrostatically
 *   tested and shall be removed from service by January 1, 1982."
 * - (e)(4): "stored pressure dry chemical extinguishers that require a 12-year
 *   hydrostatic test are emptied and subjected to applicable maintenance
 *   procedures every 6 years. Dry chemical extinguishers having non-refillable
 *   disposable containers are exempt from this requirement. When recharging or
 *   hydrostatic testing is performed, the 6-year requirement begins from that date."
 * - (e)(2) monthly visual inspection and (e)(3) annual maintenance check.
 *
 * 1910.157 is an OSHA workplace standard. It says what an employer must do; it
 * is not a home rule, and it is not NFPA 10 (which most fire codes adopt and
 * which is copyrighted, so not quoted here).
 *
 * This module makes NO network request.
 */

export const SOURCE_RETRIEVED = "2026-10-04";
export const REGULATION_CURRENT_AS_OF = "2026-10-01";
export const SIX_YEAR_PERIOD = 6;

export interface ExtinguisherType {
  id: string;
  /** Table L-1 row, verbatim. */
  name: string;
  /** Years between hydrostatic tests; null for the footnote-1 rows (removed from service by 1/1/82). */
  intervalYears: number | null;
  /** True for the row (e)(4)'s 6-year rule applies to. */
  sixYearRule: boolean;
}

/** Table L-1, 29 CFR 1910.157(f)(3), verbatim row names, read 2026-10-04. */
export const TABLE_L1: readonly ExtinguisherType[] = [
  { id: "dry-chem-stored", name: "Dry chemical, stored pressure, with mild steel, brazed brass or aluminum shells", intervalYears: 12, sixYearRule: true },
  { id: "co2", name: "Carbon dioxide", intervalYears: 5, sixYearRule: false },
  { id: "water-stored", name: "Stored pressure water and/or antifreeze", intervalYears: 5, sixYearRule: false },
  { id: "afff", name: "Aqueous Film Forming foam (AFFF)", intervalYears: 5, sixYearRule: false },
  { id: "dry-chem-cartridge", name: "Dry chemical, cartridge or cylinder operated, with mild steel shells", intervalYears: 12, sixYearRule: false },
  { id: "dry-chem-stainless", name: "Dry chemical with stainless steel", intervalYears: 5, sixYearRule: false },
  { id: "halon-1211", name: "Halon 1211", intervalYears: 12, sixYearRule: false },
  { id: "halon-1301", name: "Halon 1301", intervalYears: 12, sixYearRule: false },
  { id: "dry-powder", name: "Dry powder, cartridge or cylinder operated with mild steel shells", intervalYears: 12, sixYearRule: false },
  { id: "water-cartridge", name: "Cartridge operated water and/or antifreeze", intervalYears: 5, sixYearRule: false },
  { id: "wetting-agent", name: "Wetting agent", intervalYears: 5, sixYearRule: false },
  { id: "loaded-stream", name: "Loaded stream", intervalYears: 5, sixYearRule: false },
  { id: "foam-stainless", name: "Foam (stainless steel shell)", intervalYears: 5, sixYearRule: false },
  { id: "soda-acid-stainless", name: "Soda acid (stainless steel shell)", intervalYears: 5, sixYearRule: false },
  { id: "soda-acid-brass", name: "Soda acid (soldered brass shells) (until 1/1/82)", intervalYears: null, sixYearRule: false },
  { id: "foam-brass", name: "Foam (soldered brass shells) (until 1/1/82)", intervalYears: null, sixYearRule: false },
] as const;

export const FOOTNOTE_1 =
  "Extinguishers having shells constructed of copper or brass joined by soft solder or rivets shall not be hydrostatically tested and shall be removed from service by January 1, 1982.";

export interface ExtinguisherInput {
  typeId: string;
  /** True for a dry chemical unit with a non-refillable disposable container. */
  disposable: boolean;
  /** Manufacture date, or the date of the last hydrostatic test if it has had one. */
  lastHydro: MonthYear;
  /** Optional: the last recharge or 6-year maintenance, for the (e)(4) clock. */
  lastRecharge: MonthYear | null;
  today: MonthYear;
}

export interface DueDate {
  due: MonthYear;
  countedFrom: MonthYear;
  status: DueStatus;
  monthsRemaining: number;
}

export type ExtinguisherResult =
  | {
      kind: "dated";
      type: ExtinguisherType;
      hydro: DueDate & { intervalYears: number };
      /** Null unless (e)(4) applies. */
      sixYear: (DueDate & { countedFromRecharge: boolean }) | null;
      retrievedAt: string;
    }
  | { kind: "removed-1982"; type: ExtinguisherType; retrievedAt: string }
  | { kind: "disposable"; type: ExtinguisherType; retrievedAt: string };

function dated(due: MonthYear, countedFrom: MonthYear, today: MonthYear): DueDate {
  return { due, countedFrom, ...dueStatus(due, today) };
}

export function checkExtinguisher(input: ExtinguisherInput): ExtinguisherResult {
  const type = TABLE_L1.find((t) => t.id === input.typeId);
  if (!type) throw new ToolError("bad-input", "Pick the extinguisher type from the list.");

  if (type.intervalYears === null) {
    return { kind: "removed-1982", type, retrievedAt: SOURCE_RETRIEVED };
  }

  const isDryChem = type.id.startsWith("dry-chem");
  if (input.disposable && isDryChem) {
    return { kind: "disposable", type, retrievedAt: SOURCE_RETRIEVED };
  }

  validateMonthYear(input.lastHydro, "manufacture or last hydrostatic test date", input.today);
  if (input.lastRecharge) {
    validateMonthYear(input.lastRecharge, "last recharge or 6-year maintenance date", input.today);
    if (monthIndex(input.lastRecharge) < monthIndex(input.lastHydro)) {
      throw new ToolError(
        "bad-input",
        "The recharge date is earlier than the manufacture or hydrostatic test date. Leave it blank if the most recent service was the hydrostatic test itself.",
      );
    }
  }

  const hydroDue = addYears(input.lastHydro, type.intervalYears);
  const hydro = { ...dated(hydroDue, input.lastHydro, input.today), intervalYears: type.intervalYears };

  let sixYear: (DueDate & { countedFromRecharge: boolean }) | null = null;
  if (type.sixYearRule) {
    // (e)(4): "When recharging or hydrostatic testing is performed, the 6-year
    // requirement begins from that date" -> count from whichever is later.
    const from = input.lastRecharge ? laterOf(input.lastRecharge, input.lastHydro) : input.lastHydro;
    sixYear = {
      ...dated(addYears(from, SIX_YEAR_PERIOD), from, input.today),
      countedFromRecharge: from !== input.lastHydro,
    };
  }

  return { kind: "dated", type, hydro, sixYear, retrievedAt: SOURCE_RETRIEVED };
}
