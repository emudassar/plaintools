import { ToolError } from "./errors";

/**
 * Water softener sizing, from the method published by Penn State Extension.
 *
 * Source text retrieved 2026-09-22 from:
 *   https://extension.psu.edu/water-softening
 *   https://www.ndsu.edu/agriculture/extension/publications/water-softening-ion-exchange
 *
 * Penn State states the calculation as a worked example:
 *
 *   20,000 = Sample capacity (number of grains per regeneration)
 *   75 gallons = average person usage per day
 *   10 gpg = raw water hardness
 *   4 people = household size
 *   75 gallons (10 gpg) x 4 = 3,000 grains per day used
 *   20,000/3,000 = about 6-7 day regeneration
 *
 * That example is the cross-check: these inputs must produce 3,000 and 6.67.
 *
 * This module makes NO network request — the figures are compiled in, so there
 * is no service to be down and no third party receives anything.
 *
 * It reports what the published method works out. It does not recommend a unit,
 * does not say whether a softener is needed, and cannot know anyone's hardness:
 * that comes from a water test.
 */

export type HardnessUnit = "gpg" | "mgl";

/** Verbatim source sentences, so the result card quotes rather than paraphrases. */
export const QUOTES = {
  gpgConversion: {
    source: "Penn State Extension, Water Softening",
    text: "A gpg is used exclusively as a hardness unit and equals approximately 17 mg/l or ppm.",
  },
  method: {
    source: "Penn State Extension, Water Softening",
    text: "75 gallons (10 gpg) x 4 = 3,000 grains per day used … 20,000/3,000 = about 6-7 day regeneration",
  },
  scaling: {
    source: "Penn State Extension, Water Softening",
    text: "levels below 7.0 gpg will probably not cause major scaling and soap film",
  },
  sodium: {
    source: "Penn State Extension, Water Softening",
    text: "The exchange of hardness minerals for sodium adds 7.5 milligrams per quart for each gpg of hardness removed.",
  },
  regenWater: {
    source: "Penn State Extension, Water Softening",
    text: "Estimates indicate that about 50 gallons of water are used for each regeneration cycle.",
  },
  oxidisedIron: {
    source: "Penn State Extension, Water Softening",
    text: "Although colorless, reduced iron will be removed by the unit, red-oxidized iron (iron that has been exposed to air or chlorine) will clog the resin.",
  },
  ironLimit: {
    source: "NDSU Extension, Water Softening (Ion Exchange)",
    text: "Some softeners will also remove up to 10 ppm of iron and manganese. Water supplies with high levels of iron and manganese (greater than 10 ppm) may need a dedicated iron removal system.",
  },
  ironInhibits: {
    source: "NDSU Extension, Water Softening (Ion Exchange)",
    text: "The presence of excess iron or hydrogen sulfide can inhibit the effectiveness of a water softening unit. Installation of the iron removal equipment may be required.",
  },
  septic: {
    source: "NDSU Extension, Water Softening (Ion Exchange)",
    text: "Water used in recharging a water softener may overload or reduce the effectiveness of small septic or sewer systems.",
  },
} as const;

export interface Quote {
  source: string;
  text: string;
}

/** Penn State Extension, Table 1. Water Hardness Classification. */
export interface HardnessClass {
  label: string;
  /** The band as Table 1 states it, in both units. */
  range: string;
}

const SOURCE_RETRIEVED = "2026-09-22";

/** Penn State's own figure, used in their worked example. Editable on the page. */
export const DEFAULT_GALLONS_PER_PERSON_PER_DAY = 75;

/** Penn State: a gpg "equals approximately 17 mg/l or ppm". */
export const MGL_PER_GPG = 17;

/** Penn State: "adds 7.5 milligrams per quart for each gpg of hardness removed". */
const SODIUM_MG_PER_QUART_PER_GPG = 7.5;

/** Penn State: "about 50 gallons of water are used for each regeneration cycle". */
const GALLONS_PER_REGENERATION = 50;

/** NDSU's threshold. The sentence does not say whether it is each or combined — see below. */
const IRON_MANGANESE_PPM_LIMIT = 10;

/**
 * Table 1 is stated in both units and the two columns do not convert exactly
 * into each other (1.0 gpg is given as 17 ppm, 3.5 as 60, 7.0 as 120, 10.5 as
 * 180). The gpg column is authoritative here because the calculation is in gpg.
 */
function classifyHardness(gpg: number): HardnessClass {
  if (gpg < 1.0) return { label: "Soft", range: "less than 1.0 gpg / less than 17 ppm" };
  if (gpg <= 3.5) return { label: "Slightly hard", range: "1.0 to 3.5 gpg / 17 to 60 ppm" };
  if (gpg <= 7.0) return { label: "Moderately hard", range: "3.5 to 7.0 gpg / 60 to 120 ppm" };
  if (gpg <= 10.5) return { label: "Hard", range: "7.0 to 10.5 gpg / 120 to 180 ppm" };
  return { label: "Very hard", range: "greater than 10.5 gpg / greater than 180 ppm" };
}

export interface SizingInput {
  /** The number the visitor typed, in whichever unit they chose. */
  hardness: number;
  hardnessUnit: HardnessUnit;
  /** People in the household. Ignored when `gallonsPerDay` is given. */
  people: number | null;
  /** Penn State's 75 unless the visitor changed it. Ignored when `gallonsPerDay` is given. */
  gallonsPerPersonPerDay: number | null;
  /** A metered figure, used instead of people × per-person when present. */
  gallonsPerDay: number | null;
  /** Days the visitor wants between regenerations. Their choice; no source sets a target. */
  daysBetweenRegenerations: number;
  /** Grains per regeneration from a unit's label. Null when not being checked. */
  ratedCapacityGrains: number | null;
  /** Iron in ppm from a water test. Null when not tested or not entered. */
  ironPpm: number | null;
  /** Manganese in ppm from a water test. Null when not tested or not entered. */
  manganesePpm: number | null;
}

export interface RegenerationForCapacity {
  capacityGrains: number;
  /** Null when hardness is zero — there is no interval to state. */
  days: number | null;
  /** True where a regeneration would be needed more than once a day. */
  moreThanDaily: boolean;
}

/** A named condition the sources speak to, and the sentence that speaks to it. */
export interface SourceNote {
  id: "soft-water" | "below-scaling-threshold" | "iron-manganese" | "oxidised-iron" | "septic";
  heading: string;
  /** Plain statement of what triggered it. Never a recommendation. */
  body: string;
  quotes: readonly Quote[];
  /** Where the source wording itself is ambiguous, say so rather than resolving it. */
  ambiguity: string | null;
}

export interface SizingResult {
  hardnessGpg: number;
  hardnessMgl: number;
  /** True when the visitor typed mg/L and it was converted. */
  converted: boolean;
  hardnessClass: HardnessClass;

  gallonsPerDay: number;
  /** How the daily water figure was arrived at, for the working shown on the card. */
  demandBasis: string;

  grainsPerDay: number;
  daysBetweenRegenerations: number;
  /** grainsPerDay × days. Null when hardness is zero. */
  requiredCapacityGrains: number | null;

  /** Present only when a rated capacity was entered. */
  ratedCapacity: RegenerationForCapacity | null;

  /** Penn State's sodium figure applied to this hardness. */
  sodiumMgPerQuart: number;
  /** 50 gallons per cycle, at the interval above. Null when there is no interval. */
  regenerationWaterGallonsPerYear: number | null;

  notes: readonly SourceNote[];
  retrievedAt: string;
}

function requireFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new ToolError("bad-input", `${label} must be a number.`);
  }
}

/**
 * Applies Penn State's published calculation to the numbers entered.
 *
 * Unit confusion is the dead zone that matters most here: a hardness figure in
 * mg/L typed into the gpg box is silently about 17 times too big, and the
 * result looks plausible. A gpg value above 100 is therefore rejected with a
 * message naming mg/L, because 100 gpg is roughly 1,700 mg/L — far outside the
 * range Penn State's own table covers.
 */
export function sizeSoftener(input: SizingInput): SizingResult {
  requireFinite(input.hardness, "Hardness");
  if (input.hardness < 0) {
    throw new ToolError("bad-input", "Hardness cannot be negative.");
  }
  if (input.hardnessUnit === "gpg" && input.hardness > 100) {
    throw new ToolError(
      "bad-input",
      "That is above 100 grains per gallon, which is about 1,700 mg/L. Check whether the figure is in mg/L (ppm) rather than gpg — switch the unit if so.",
    );
  }
  if (input.hardnessUnit === "mgl" && input.hardness > 1700) {
    throw new ToolError(
      "bad-input",
      "That is above 1,700 mg/L, far outside the range these publications cover. Check the figure and its unit.",
    );
  }

  const hardnessGpg =
    input.hardnessUnit === "gpg" ? input.hardness : input.hardness / MGL_PER_GPG;
  const hardnessMgl =
    input.hardnessUnit === "mgl" ? input.hardness : input.hardness * MGL_PER_GPG;

  // Daily demand: a metered figure wins; otherwise people × per-person.
  let gallonsPerDay: number;
  let demandBasis: string;

  if (input.gallonsPerDay !== null) {
    requireFinite(input.gallonsPerDay, "Gallons per day");
    if (input.gallonsPerDay <= 0) {
      throw new ToolError("bad-input", "Gallons per day must be greater than zero.");
    }
    if (input.gallonsPerDay > 100_000) {
      throw new ToolError(
        "bad-input",
        "That daily water use is far outside household range. Check the figure.",
      );
    }
    gallonsPerDay = input.gallonsPerDay;
    demandBasis = `${formatNumber(gallonsPerDay)} gallons per day, as entered`;
  } else {
    const people = input.people;
    const perPerson = input.gallonsPerPersonPerDay ?? DEFAULT_GALLONS_PER_PERSON_PER_DAY;
    if (people === null) {
      throw new ToolError(
        "bad-input",
        "Enter the number of people in the household, or a measured daily water use.",
      );
    }
    requireFinite(people, "Household size");
    requireFinite(perPerson, "Gallons per person per day");
    if (people <= 0) {
      throw new ToolError("bad-input", "Household size must be at least one person.");
    }
    if (people > 100) {
      throw new ToolError(
        "bad-input",
        "That household size is outside what this method was published for.",
      );
    }
    if (perPerson <= 0) {
      throw new ToolError(
        "bad-input",
        "Gallons per person per day must be greater than zero.",
      );
    }
    if (perPerson > 1000) {
      throw new ToolError(
        "bad-input",
        "That per-person figure is far outside household range. Check it.",
      );
    }
    gallonsPerDay = perPerson * people;
    demandBasis = `${formatNumber(perPerson)} gallons per person per day × ${formatNumber(people)} ${
      people === 1 ? "person" : "people"
    }`;
  }

  requireFinite(input.daysBetweenRegenerations, "Days between regenerations");
  if (input.daysBetweenRegenerations <= 0) {
    throw new ToolError("bad-input", "Days between regenerations must be at least one.");
  }
  if (input.daysBetweenRegenerations > 365) {
    throw new ToolError(
      "bad-input",
      "Days between regenerations must be 365 or fewer.",
    );
  }

  // Penn State: gallons per person per day × hardness in gpg × people.
  const grainsPerDay = gallonsPerDay * hardnessGpg;

  const requiredCapacityGrains =
    grainsPerDay > 0 ? grainsPerDay * input.daysBetweenRegenerations : null;

  let ratedCapacity: RegenerationForCapacity | null = null;
  if (input.ratedCapacityGrains !== null) {
    requireFinite(input.ratedCapacityGrains, "Rated capacity");
    if (input.ratedCapacityGrains <= 0) {
      throw new ToolError("bad-input", "Rated capacity must be greater than zero grains.");
    }
    if (input.ratedCapacityGrains > 10_000_000) {
      throw new ToolError(
        "bad-input",
        "That rated capacity is far outside the range of a household unit. Check the figure.",
      );
    }
    const days = grainsPerDay > 0 ? input.ratedCapacityGrains / grainsPerDay : null;
    ratedCapacity = {
      capacityGrains: input.ratedCapacityGrains,
      days,
      moreThanDaily: days !== null && days < 1,
    };
  }

  const sodiumMgPerQuart = hardnessGpg * SODIUM_MG_PER_QUART_PER_GPG;

  // Derived from Penn State's 50-gallons-per-cycle figure at the interval above.
  const regenerationWaterGallonsPerYear =
    grainsPerDay > 0
      ? (365 / input.daysBetweenRegenerations) * GALLONS_PER_REGENERATION
      : null;

  const notes: SourceNote[] = [];

  if (hardnessGpg === 0) {
    notes.push({
      id: "soft-water",
      heading: "No hardness was entered, so there is no regeneration interval",
      body: "With hardness at zero the method removes nothing per day, and dividing a rated capacity by zero gives no interval. The classification and conversion below still apply.",
      quotes: [QUOTES.gpgConversion],
      ambiguity: null,
    });
  } else if (hardnessGpg < 1.0) {
    notes.push({
      id: "soft-water",
      heading: "Penn State's table classifies this as Soft",
      body: "Table 1 puts anything below 1.0 gpg in the Soft band. The arithmetic above still runs, and it is reported as arithmetic — this page does not say whether a softener is worth installing.",
      quotes: [QUOTES.scaling],
      ambiguity: null,
    });
  } else if (hardnessGpg < 7.0) {
    notes.push({
      id: "below-scaling-threshold",
      heading: "This is below the level Penn State names for major scaling",
      body: "The figure entered is under 7.0 gpg. Penn State states what that generally means for scaling and soap film; the sentence is quoted here in full rather than summarised.",
      quotes: [QUOTES.scaling],
      ambiguity: null,
    });
  }

  const ironTotal = (input.ironPpm ?? 0) + (input.manganesePpm ?? 0);
  const ironEntered = input.ironPpm !== null || input.manganesePpm !== null;

  if (input.ironPpm !== null) {
    requireFinite(input.ironPpm, "Iron");
    if (input.ironPpm < 0) throw new ToolError("bad-input", "Iron cannot be negative.");
  }
  if (input.manganesePpm !== null) {
    requireFinite(input.manganesePpm, "Manganese");
    if (input.manganesePpm < 0) {
      throw new ToolError("bad-input", "Manganese cannot be negative.");
    }
  }

  if (ironEntered) {
    const over = ironTotal > IRON_MANGANESE_PPM_LIMIT;
    notes.push({
      id: "iron-manganese",
      heading: over
        ? "Iron and manganese total more than the 10 ppm NDSU names"
        : "Iron and manganese are at or below the 10 ppm NDSU names",
      body: over
        ? `The figures entered total ${formatNumber(ironTotal, 2)} ppm. NDSU's sentence on that threshold is quoted below.`
        : `The figures entered total ${formatNumber(ironTotal, 2)} ppm. NDSU's sentence on that threshold is quoted below so you can see where the line sits.`,
      quotes: over ? [QUOTES.ironLimit, QUOTES.ironInhibits] : [QUOTES.ironLimit],
      ambiguity:
        "NDSU's sentence says “up to 10 ppm of iron and manganese” without stating whether the limit applies to each separately or to the two combined. This page adds them, which is the stricter reading, and shows the sentence so you can judge it.",
    });

    if ((input.ironPpm ?? 0) > 0) {
      notes.push({
        id: "oxidised-iron",
        heading: "Iron is present, and its form matters as well as its amount",
        body: "Penn State distinguishes dissolved iron from iron that has already oxidised. A water test reports the amount; whether it has oxidised depends on exposure to air or chlorine before the softener.",
        quotes: [QUOTES.oxidisedIron],
        ambiguity: null,
      });
    }
  }

  notes.push({
    id: "septic",
    heading: "Where the regeneration water goes",
    body: `At this interval the regeneration cycles alone account for about ${
      regenerationWaterGallonsPerYear === null
        ? "no"
        : formatNumber(Math.round(regenerationWaterGallonsPerYear))
    } gallons a year, using Penn State's 50-gallons-per-cycle figure.`,
    quotes: [QUOTES.regenWater, QUOTES.septic],
    ambiguity: null,
  });

  return {
    hardnessGpg,
    hardnessMgl,
    converted: input.hardnessUnit === "mgl",
    hardnessClass: classifyHardness(hardnessGpg),
    gallonsPerDay,
    demandBasis,
    grainsPerDay,
    daysBetweenRegenerations: input.daysBetweenRegenerations,
    requiredCapacityGrains,
    ratedCapacity,
    sodiumMgPerQuart,
    regenerationWaterGallonsPerYear,
    notes,
    retrievedAt: SOURCE_RETRIEVED,
  };
}

/** Thousands separators, and no trailing zeros on whole numbers. */
export function formatNumber(n: number, maxDecimals = 1): string {
  return n.toLocaleString("en-US", {
    maximumFractionDigits: maxDecimals,
    minimumFractionDigits: 0,
  });
}
