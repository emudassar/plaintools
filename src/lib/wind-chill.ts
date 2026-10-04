import { ToolError } from "./errors";

/**
 * NWS wind chill (effective 2001-11-01).
 *
 * Formula, from the NWS Wind Chill Chart (windchillchart3.pdf) and the NWS
 * "Wind Chill Chart" safety page, both retrieved 2026-10-04:
 *   Wind Chill (°F) = 35.74 + 0.6215T − 35.75(V^0.16) + 0.4275T(V^0.16)
 *   T = air temperature (°F), V = wind speed (mph)
 *
 * NWS: "Wind chill temperature is only defined for temperatures at or below
 * 50°F and wind speeds above 3 mph." The printed chart covers 5–60 mph and
 * 40 to −45°F; every one of its 216 cells equals the formula rounded to the
 * nearest whole degree.
 *
 * NWS also says the formula "calculates wind speed at an average height of
 * 5 feet ... based on readings from the national standard height of 33 feet".
 * A rider's riding speed is airflow at the face, not a 33-ft reading; the page
 * says so on the result.
 */

export const WIND_CHILL_RETRIEVED = "2026-10-04";
export const NWS_CHART_PDF = "https://www.weather.gov/media/safety/windchillchart3.pdf";
export const NWS_CHART_PAGE = "https://www.weather.gov/safety/cold-wind-chill-chart";

export const MAX_DEFINED_F = 50;
export const MIN_WIND_MPH = 3;
export const NWS_CHART_MAX_MPH = 60;

const MPH_PER_KMH = 0.621371192237334;

export const fToC = (f: number) => ((f - 32) * 5) / 9;
export const cToF = (c: number) => (c * 9) / 5 + 32;

/** Unrounded NWS wind chill in °F. Caller is responsible for the defined range. */
export function windChillF(tempF: number, mph: number): number {
  const v = Math.pow(mph, 0.16);
  return 35.74 + 0.6215 * tempF - 35.75 * v + 0.4275 * tempF * v;
}

export interface WindChillInput {
  temp: number;
  tempUnit: "F" | "C";
  speed: number;
  speedUnit: "mph" | "kmh";
}

export type WindChillResult =
  | {
      kind: "defined";
      tempF: number;
      mph: number;
      chillF: number;
      chillC: number;
      /** Wind chill minus air temperature, °F. */
      dropF: number;
      beyondChart: boolean;
      retrievedAt: string;
    }
  | {
      kind: "undefined";
      reason: "too-warm" | "too-slow";
      tempF: number;
      mph: number;
      retrievedAt: string;
    };

export function calculateWindChill(input: WindChillInput): WindChillResult {
  if (!Number.isFinite(input.temp))
    throw new ToolError("bad-input", "Air temperature must be a number.");
  if (!Number.isFinite(input.speed))
    throw new ToolError("bad-input", "Riding speed must be a number.");
  if (input.speed < 0)
    throw new ToolError("bad-input", "Riding speed cannot be negative.");

  const tempF = input.tempUnit === "F" ? input.temp : cToF(input.temp);
  const mph = input.speedUnit === "mph" ? input.speed : input.speed * MPH_PER_KMH;

  if (tempF < -80 || tempF > 130)
    throw new ToolError(
      "bad-input",
      "That temperature is outside anything a rider would meet. Check the °F / °C setting.",
    );
  if (mph > 200)
    throw new ToolError(
      "bad-input",
      "That speed is over 200 mph. Check the mph / km/h setting.",
    );

  if (tempF > MAX_DEFINED_F)
    return { kind: "undefined", reason: "too-warm", tempF, mph, retrievedAt: WIND_CHILL_RETRIEVED };
  if (mph <= MIN_WIND_MPH)
    return { kind: "undefined", reason: "too-slow", tempF, mph, retrievedAt: WIND_CHILL_RETRIEVED };

  const chillF = windChillF(tempF, mph);
  return {
    kind: "defined",
    tempF,
    mph,
    chillF,
    chillC: fToC(chillF),
    dropF: chillF - tempF,
    beyondChart: mph > NWS_CHART_MAX_MPH,
    retrievedAt: WIND_CHILL_RETRIEVED,
  };
}

/** Grid for the riding chart: rows are speeds, columns air temperatures (°F). */
export const CHART_SPEEDS_MPH = [10, 20, 30, 40, 50, 60, 70, 80] as const;
export const CHART_TEMPS_F = [50, 45, 40, 35, 30, 25, 20, 15, 10, 5, 0] as const;
