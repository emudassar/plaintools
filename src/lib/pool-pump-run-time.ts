import { ToolError } from "./errors";

/**
 * Pool pump run time / turnover.
 *
 * Definition (CDC Model Aquatic Health Code, 2023 4th ed., 4.7.1.10.2):
 *   "The TURNOVER TIME shall be calculated based on the total volume of water
 *    divided by the total design recirculation flow rate through the
 *    filtration process."
 * So hours per turnover = gallons / (gpm x 60).
 *
 * Maximum turnover times for public aquatic venues: MAHC Table 4.7.1.10,
 * retrieved 2026-10-04 from
 *   https://www.cdc.gov/model-aquatic-health-code/media/pdfs/2023-MAHC-508.pdf
 * The MAHC is a model code for PUBLIC aquatic venues; it is adopted (or not)
 * state by state, and it does not set a residential figure. The page says so.
 */

export const MAHC_RETRIEVED = "2026-10-04";
export const MAHC_URL = "https://www.cdc.gov/model-aquatic-health-code/media/pdfs/2023-MAHC-508.pdf";
export const LITRES_PER_GALLON = 3.785411784;

export interface VenueType {
  id: string;
  label: string;
  maxHours: number;
}

/** MAHC Table 4.7.1.10, as printed. */
export const MAHC_VENUES: readonly VenueType[] = [
  { id: "other", label: "All other pools", maxHours: 6 },
  { id: "activity", label: "Activity pool", maxHours: 2 },
  { id: "diving", label: "Diving pool", maxHours: 8 },
  { id: "iwp", label: "Interactive water play", maxHours: 0.5 },
  { id: "lazy", label: "Lazy river", maxHours: 2 },
  { id: "plunge", label: "Plunge pool", maxHours: 1 },
  { id: "runout", label: "Runout slide", maxHours: 1 },
  { id: "wading", label: "Wading pool", maxHours: 1 },
  { id: "wave", label: "Wave pool", maxHours: 2 },
  { id: "spa-hot", label: "Spa / therapy / exercise pool, 93–104°F", maxHours: 0.5 },
  { id: "spa-450", label: "Spa / therapy / exercise pool, 72–93°F, 450 gal/person or less", maxHours: 1 },
  { id: "spa-over450", label: "Spa / therapy / exercise pool, 72–93°F, more than 450 gal/person", maxHours: 2 },
  { id: "spa-over2500", label: "Spa / therapy / exercise pool, 72–93°F, more than 2,500 gal/person", maxHours: 4 },
];

export interface RunTimeInput {
  volume: number;
  volumeUnit: "gal" | "l";
  flow: number;
  flowUnit: "gpm" | "lpm";
  turnoversPerDay: number;
  /** Optional MAHC venue to compare against; null for a private pool. */
  venueId: string | null;
}

export interface RunTimeResult {
  gallons: number;
  gpm: number;
  hoursPerTurnover: number;
  turnoversPerDay: number;
  hoursPerDay: number;
  /** True when the requested daily run time is more than 24 hours. */
  exceedsDay: boolean;
  venue: VenueType | null;
  /** Flow needed to meet the venue's maximum turnover, gpm. */
  requiredGpm: number | null;
  meetsVenue: boolean | null;
  retrievedAt: string;
}

export function calculateRunTime(input: RunTimeInput): RunTimeResult {
  const { volume, flow, turnoversPerDay } = input;
  if (!Number.isFinite(volume)) throw new ToolError("bad-input", "Pool volume must be a number.");
  if (!Number.isFinite(flow)) throw new ToolError("bad-input", "Flow rate must be a number.");
  if (!Number.isFinite(turnoversPerDay)) throw new ToolError("bad-input", "Turnovers per day must be a number.");
  if (volume <= 0) throw new ToolError("bad-input", "Enter the pool volume — it must be more than zero.");
  if (flow <= 0) throw new ToolError("bad-input", "Enter the flow rate through the filter — it must be more than zero.");
  if (turnoversPerDay <= 0) throw new ToolError("bad-input", "Turnovers per day must be more than zero.");
  if (turnoversPerDay > 100) throw new ToolError("bad-input", "That many turnovers per day is outside any pool's range. Check the figure.");

  const gallons = input.volumeUnit === "gal" ? volume : volume / LITRES_PER_GALLON;
  const gpm = input.flowUnit === "gpm" ? flow : flow / LITRES_PER_GALLON;
  if (gallons > 5_000_000) throw new ToolError("bad-input", "That volume is larger than any pool. Check the units.");
  if (gpm > 50_000) throw new ToolError("bad-input", "That flow rate is far beyond pool pump range. Check the units.");

  const hoursPerTurnover = gallons / (gpm * 60);
  const hoursPerDay = hoursPerTurnover * turnoversPerDay;

  let venue: VenueType | null = null;
  if (input.venueId) {
    venue = MAHC_VENUES.find((v) => v.id === input.venueId) ?? null;
    if (!venue) throw new ToolError("bad-input", "Pick a venue type from the list.");
  }

  return {
    gallons,
    gpm,
    hoursPerTurnover,
    turnoversPerDay,
    hoursPerDay,
    exceedsDay: hoursPerDay > 24,
    venue,
    requiredGpm: venue ? gallons / (venue.maxHours * 60) : null,
    meetsVenue: venue ? hoursPerTurnover <= venue.maxHours + 1e-9 : null,
    retrievedAt: MAHC_RETRIEVED,
  };
}

/** "6 h 15 min" style. */
export function formatHours(h: number): string {
  const totalMin = Math.round(h * 60);
  const hh = Math.floor(totalMin / 60);
  const mm = totalMin % 60;
  if (hh === 0) return `${mm} min`;
  if (mm === 0) return `${hh} h`;
  return `${hh} h ${mm} min`;
}
