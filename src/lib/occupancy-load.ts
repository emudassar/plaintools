import { ToolError } from "./errors";

/**
 * Occupant load from floor area — 2021 International Building Code, Section
 * 1004.5 and Table 1004.5 "Maximum Floor Area Allowances per Occupant" (read on
 * codes.iccsafe.org 2026-10-17). §1004.5: "the occupant load shall be not less
 * than that number determined by dividing the floor area under consideration
 * by the occupant load factor assigned to the function of the space". Factor =
 * floor area in square feet per occupant, gross or net as listed.
 * §1004.5.1: an increased load may be approved but not more than one occupant
 * per 7 ft² of occupiable floor space. §1004.8: concentrated business use, not
 * less than one occupant per 50 ft² gross. Fixed seating (§1004.6) and mall
 * buildings (§402.8.2) are by other rules and are excluded here.
 * Fractions are rounded up (a fractional person counts as a person).
 */

export const IBC_CH10_URL = "https://codes.iccsafe.org/content/IBC2021P2/chapter-10-means-of-egress";
export const OCC_RETRIEVED = "2026-10-17";

export interface Factor {
  key: string;
  label: string;
  sqft: number;
  basis: "gross" | "net";
}

/** IBC 2021 Table 1004.5 rows with a numeric factor. */
export const FACTORS: readonly Factor[] = [
  { key: "accessory", label: "Accessory storage areas, mechanical equipment room", sqft: 300, basis: "gross" },
  { key: "agricultural", label: "Agricultural building", sqft: 300, basis: "gross" },
  { key: "hangar", label: "Aircraft hangars", sqft: 500, basis: "gross" },
  { key: "air-baggage-claim", label: "Airport terminal — baggage claim", sqft: 20, basis: "gross" },
  { key: "air-baggage-handling", label: "Airport terminal — baggage handling", sqft: 300, basis: "gross" },
  { key: "air-concourse", label: "Airport terminal — concourse", sqft: 100, basis: "gross" },
  { key: "air-waiting", label: "Airport terminal — waiting areas", sqft: 15, basis: "gross" },
  { key: "gaming", label: "Assembly — gaming floors (keno, slots, etc.)", sqft: 11, basis: "gross" },
  { key: "museum", label: "Assembly — exhibit gallery and museum", sqft: 30, basis: "net" },
  { key: "concentrated", label: "Assembly without fixed seats — concentrated (chairs only, not fixed)", sqft: 7, basis: "net" },
  { key: "standing", label: "Assembly without fixed seats — standing space", sqft: 5, basis: "net" },
  { key: "unconcentrated", label: "Assembly without fixed seats — unconcentrated (tables and chairs)", sqft: 15, basis: "net" },
  { key: "bowling", label: "Bowling centers (plus 5 persons per lane incl. 15 ft of runway)", sqft: 7, basis: "net" },
  { key: "business", label: "Business areas", sqft: 150, basis: "gross" },
  { key: "concentrated-business", label: "Concentrated business use areas (§1004.8)", sqft: 50, basis: "gross" },
  { key: "courtroom", label: "Courtrooms — other than fixed seating areas", sqft: 40, basis: "net" },
  { key: "daycare", label: "Day care", sqft: 35, basis: "net" },
  { key: "dormitory", label: "Dormitories", sqft: 50, basis: "gross" },
  { key: "classroom", label: "Educational — classroom area", sqft: 20, basis: "net" },
  { key: "shop", label: "Educational — shops and other vocational room areas", sqft: 50, basis: "net" },
  { key: "exercise", label: "Exercise rooms", sqft: 50, basis: "gross" },
  { key: "h5", label: "Group H-5 fabrication and manufacturing areas", sqft: 200, basis: "gross" },
  { key: "industrial", label: "Industrial areas", sqft: 100, basis: "gross" },
  { key: "inpatient", label: "Institutional — inpatient treatment areas", sqft: 240, basis: "gross" },
  { key: "outpatient", label: "Institutional — outpatient areas", sqft: 100, basis: "gross" },
  { key: "sleeping", label: "Institutional — sleeping areas", sqft: 120, basis: "gross" },
  { key: "kitchen", label: "Kitchens, commercial", sqft: 200, basis: "gross" },
  { key: "reading", label: "Library — reading rooms", sqft: 50, basis: "net" },
  { key: "stack", label: "Library — stack area", sqft: 100, basis: "gross" },
  { key: "locker", label: "Locker rooms", sqft: 50, basis: "gross" },
  { key: "mercantile", label: "Mercantile", sqft: 60, basis: "gross" },
  { key: "merc-storage", label: "Mercantile — storage, stock, shipping areas", sqft: 300, basis: "gross" },
  { key: "parking", label: "Parking garages", sqft: 200, basis: "gross" },
  { key: "residential", label: "Residential", sqft: 200, basis: "gross" },
  { key: "rink-pool", label: "Skating rinks, swimming pools — rink and pool", sqft: 50, basis: "gross" },
  { key: "rink-decks", label: "Skating rinks, swimming pools — decks", sqft: 15, basis: "gross" },
  { key: "stages", label: "Stages and platforms", sqft: 15, basis: "net" },
  { key: "warehouse", label: "Warehouses", sqft: 500, basis: "gross" },
];

export interface Space {
  factorKey: string;
  areaSqFt: number;
  /** Bowling lanes (only for the bowling row). */
  lanes: number;
}

export interface SpaceResult {
  factor: Factor;
  areaSqFt: number;
  exact: number;
  occupants: number;
  maxIncreased: number;
}

export function occupantLoad(spaces: Space[]) {
  if (!spaces.length) throw new ToolError("bad-input", "Add at least one space.");
  const rows: SpaceResult[] = spaces.map((s) => {
    const factor = FACTORS.find((f) => f.key === s.factorKey);
    if (!factor) throw new ToolError("bad-input", "Pick the function of the space from the table.");
    if (!Number.isFinite(s.areaSqFt) || s.areaSqFt <= 0 || s.areaSqFt > 10_000_000) throw new ToolError("bad-input", "Enter each space's floor area in square feet.");
    let exact = s.areaSqFt / factor.sqft;
    if (factor.key === "bowling") {
      if (!Number.isInteger(s.lanes) || s.lanes < 0) throw new ToolError("bad-input", "Number of lanes should be a whole number.");
      exact += 5 * s.lanes;
    }
    return { factor, areaSqFt: s.areaSqFt, exact, occupants: Math.ceil(exact - 1e-9), maxIncreased: Math.floor(s.areaSqFt / 7 + 1e-9) };
  });
  return { rows, total: rows.reduce((a, r) => a + r.occupants, 0) };
}
