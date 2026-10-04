import { ToolError } from "./errors";

/**
 * Minimum smoke alarm count for a one- or two-family dwelling, from the
 * International Residential Code's smoke alarm location list:
 *   2024 IRC Section R310.3 (the section was renumbered from R314 in 2024)
 *   2021 IRC Section R314.3
 * Both read 2026-10-04 in ICC's free Digital Codes reader:
 *   https://codes.iccsafe.org/content/IRC2024P1/chapter-3-building-planning
 *   https://codes.iccsafe.org/content/IRC2021P1/chapter-3-building-planning
 *
 * Items 1–5 are the same in both editions (2024 changes "dwelling" to
 * "dwelling unit" in item 3). 2024 adds item 6, the sleeping loft. The
 * cooking-appliance distances (R310.3.1 / R314.3.1) differ and are reported
 * per edition. ICC holds copyright in the code text, so the page cites section
 * numbers and states the requirement briefly rather than reproducing it.
 *
 * How the count is built, item by item:
 *   1 "In each sleeping room"                       -> one per bedroom
 *   2 "Outside each separate sleeping area in the immediate vicinity of the bedrooms"
 *                                                    -> one per sleeping area
 *   3 "On each additional story ... including basements and habitable attics"
 *      A story with bedrooms already has items 1–2, so each story WITHOUT
 *      bedrooms adds one, minus split levels the item's exception covers.
 *   5 tall-ceiling room open to a bedroom hallway   -> one in the room; the
 *      hallway alarm is taken to be the item-2 alarm for that sleeping area
 *   6 (2024 only) sleeping loft                     -> one in the room it opens to
 * Item 4 (3 ft from a bathroom door) is a placement rule and adds nothing.
 *
 * This module makes NO network request. It reports the model-code minimum.
 * It does not know a jurisdiction's adopted edition or local amendments.
 */

export const SOURCE_RETRIEVED = "2026-10-04";

export type Edition = "2024" | "2021";

export const EDITIONS: Record<Edition, { label: string; section: string; cooking: string; interconnect: string; scope: string }> = {
  "2024": {
    label: "2024 IRC",
    section: "R310.3",
    cooking: "R310.3.1",
    interconnect: "R310.4",
    scope: "R310.2",
  },
  "2021": {
    label: "2021 IRC",
    section: "R314.3",
    cooking: "R314.3.1",
    interconnect: "R314.4",
    scope: "R314.2",
  },
};

export interface SmokeAlarmInput {
  edition: Edition;
  /** Sleeping rooms (bedrooms). */
  bedrooms: number;
  /** Separate sleeping areas (groups of bedrooms). 1..bedrooms. */
  sleepingAreas: number;
  /** Stories with no bedrooms, counting basements and habitable attics, not crawl spaces or uninhabitable attics. */
  levelsWithoutBedrooms: number;
  /** Of those, split levels less than a full story below an adjacent upper level, with no door between. */
  splitLevelsCovered: number;
  /** Rooms open to a bedroom hallway whose ceiling is 24 in or more above the hallway's. */
  tallCeilingRooms: number;
  /** Sleeping lofts (2024 item 6). Ignored for 2021. */
  sleepingLofts: number;
}

export interface CountLine {
  item: number;
  where: string;
  count: number;
}

export interface SmokeAlarmResult {
  edition: Edition;
  total: number;
  lines: CountLine[];
  interconnectionRequired: boolean;
  /** True when lofts were entered under 2021, which has no loft item. */
  loftsIgnored: boolean;
  retrievedAt: string;
}

const MAX = 50;

function wholeNumber(n: number, what: string, min: number): void {
  if (!Number.isFinite(n)) throw new ToolError("bad-input", `Enter a number for ${what}.`);
  if (!Number.isInteger(n)) throw new ToolError("bad-input", `Enter a whole number for ${what}.`);
  if (n < min) throw new ToolError("bad-input", `${what[0].toUpperCase()}${what.slice(1)} cannot be less than ${min}.`);
  if (n > MAX) {
    throw new ToolError("bad-input", `${what[0].toUpperCase()}${what.slice(1)} is far outside a one- or two-family dwelling. Check the figure.`);
  }
}

export function countSmokeAlarms(input: SmokeAlarmInput): SmokeAlarmResult {
  if (input.edition !== "2024" && input.edition !== "2021") {
    throw new ToolError("bad-input", "Pick the code edition.");
  }
  wholeNumber(input.bedrooms, "the number of bedrooms", 0);
  if (input.bedrooms === 0) {
    throw new ToolError(
      "no-data",
      "The IRC's location list is built around sleeping rooms: an alarm in each one and outside each sleeping area, then one on each additional story. With no bedrooms entered, the list does not say where the first alarm goes, although the code still requires smoke alarms in every dwelling unit (R310.2.1 in 2024, R314.2.1 in 2021). For a studio, ask the local code official how they treat the sleeping space.",
    );
  }
  wholeNumber(input.sleepingAreas, "the number of separate sleeping areas", 1);
  if (input.sleepingAreas > input.bedrooms) {
    throw new ToolError(
      "bad-input",
      "There cannot be more separate sleeping areas than bedrooms. A sleeping area is a group of one or more bedrooms, such as bedrooms off one hallway.",
    );
  }
  wholeNumber(input.levelsWithoutBedrooms, "the number of levels without bedrooms", 0);
  wholeNumber(input.splitLevelsCovered, "the number of split levels", 0);
  if (input.splitLevelsCovered > input.levelsWithoutBedrooms) {
    throw new ToolError(
      "bad-input",
      "The split levels are counted among the levels without bedrooms, so there cannot be more of them.",
    );
  }
  wholeNumber(input.tallCeilingRooms, "the number of tall-ceiling rooms", 0);
  wholeNumber(input.sleepingLofts, "the number of sleeping lofts", 0);

  const is2024 = input.edition === "2024";
  const lines: CountLine[] = [
    { item: 1, where: "In each sleeping room", count: input.bedrooms },
    { item: 2, where: "Outside each separate sleeping area, near the bedrooms", count: input.sleepingAreas },
    {
      item: 3,
      where: "On each additional story without bedrooms (basements and habitable attics included)",
      count: input.levelsWithoutBedrooms - input.splitLevelsCovered,
    },
    { item: 5, where: "In each tall-ceiling room open to a bedroom hallway", count: input.tallCeilingRooms },
  ];
  if (is2024) {
    lines.push({ item: 6, where: "In the room each sleeping loft is open to, near the loft", count: input.sleepingLofts });
  }

  const total = lines.reduce((sum, l) => sum + l.count, 0);

  return {
    edition: input.edition,
    total,
    lines,
    interconnectionRequired: total > 1,
    loftsIgnored: !is2024 && input.sleepingLofts > 0,
    retrievedAt: SOURCE_RETRIEVED,
  };
}
