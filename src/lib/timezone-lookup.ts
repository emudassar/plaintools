import { ToolError } from "./errors";
import { hedged } from "./hedge";

/**
 * IANA time zone for a point, from the Open-Meteo Forecast API (`timezone=auto`).
 * VERIFIED 2026-10-16: ACAO *; Tokyo -> "Asia/Tokyo", open Pacific -> "Etc/GMT+9",
 * Antarctica -> "Antarctica/Troll". Only the zone name is used here.
 */

export const OPEN_METEO_FORECAST_DOCS_URL = "https://open-meteo.com/en/docs";

export async function timeZoneAt(lat: number, lon: number): Promise<string> {
  try {
    const j = await hedged<{ timezone?: string }>(async (signal) => {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&timezone=auto&forecast_days=1&daily=sunrise`,
        { signal },
      );
      if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`);
      return res.json();
    });
    if (!j.timezone) throw new Error("no timezone in response");
    // Make sure this browser knows the zone before relying on it.
    new Intl.DateTimeFormat("en-US", { timeZone: j.timezone });
    return j.timezone;
  } catch (e) {
    throw new ToolError("unavailable", "The time zone for this place could not be looked up.", e instanceof Error ? e.message : String(e));
  }
}
