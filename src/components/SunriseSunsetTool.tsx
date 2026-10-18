"use client";

import { useMemo, useRef, useState } from "react";
import LocationPicker, { type PickedLocation } from "./LocationPicker";
import { ErrorBox, Ext, Loading, where } from "./GeoBits";
import { Btn, useMounted } from "./ToolBits";
import { fieldClass } from "./CalcBits";
import { NOAA_CALC_URL, NOAA_DETAILS_URL, sunAltitudeTimes, sunDay, zonedParts } from "@/lib/sun-position";
import { timeZoneAt } from "@/lib/timezone-lookup";
import { fmtInZone } from "@/lib/tz";
import { toCsv } from "@/lib/geo-formats";
import { downloadText } from "@/lib/svg-export";
import { asToolError } from "@/lib/errors";

const hm = (min: number) => `${Math.floor(min / 60)}h ${String(Math.round(min % 60)).padStart(2, "0")}m`;

function SunriseSunsetToolInner() {
  const now = new Date();
  const [loc, setLoc] = useState<(PickedLocation & { tz: string }) | null>(null);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [twilight, setTwilight] = useState<"civil" | "all">("civil");
  const [state, setState] = useState<"idle" | "loading" | { error: string; l: PickedLocation }>("idle");
  const seq = useRef(0);

  async function pick(l: PickedLocation) {
    const id = ++seq.current;
    setState("loading");
    try {
      const tz = await timeZoneAt(l.lat, l.lon);
      if (id !== seq.current) return;
      setLoc({ ...l, tz });
      setState("idle");
    } catch (e) {
      if (id === seq.current) setState({ error: asToolError(e).message, l });
    }
  }

  const rows = useMemo(() => {
    if (!loc) return [];
    const dim = new Date(Date.UTC(year, month, 0)).getUTCDate();
    return Array.from({ length: dim }, (_, i) => {
      const d = i + 1;
      const s = sunDay(year, month, d, loc.lat, loc.lon);
      const civ = sunAltitudeTimes(year, month, d, loc.lat, loc.lon, -6);
      const nau = sunAltitudeTimes(year, month, d, loc.lat, loc.lon, -12);
      const ast = sunAltitudeTimes(year, month, d, loc.lat, loc.lon, -18);
      return { d, s, civ, nau, ast };
    });
  }, [loc, year, month]);

  const t = (ms: number | null) => (ms === null || !loc ? "—" : fmtInZone(ms, loc.tz, { hour: "numeric", minute: "2-digit" }));
  const today = loc ? zonedParts(Date.now(), loc.tz) : null;
  const todayRow = today && today.y === year && today.m === month ? rows[today.d - 1] : rows[0];
  const monthName = new Date(Date.UTC(year, month - 1, 15)).toLocaleString("en-US", { month: "long", timeZone: "UTC" });

  function csv() {
    if (!loc) return;
    const head = ["date", "astronomical_dawn", "nautical_dawn", "civil_dawn", "sunrise", "solar_noon", "sunset", "civil_dusk", "nautical_dusk", "astronomical_dusk", "day_length"];
    const body = rows.map((r) => [`${year}-${String(month).padStart(2, "0")}-${String(r.d).padStart(2, "0")}`, t(r.ast.morning), t(r.nau.morning), t(r.civ.morning), t(r.s.sunrise), t(r.s.solarNoon), t(r.s.sunset), t(r.civ.evening), t(r.nau.evening), t(r.ast.evening), hm(r.s.dayLengthMin)]);
    downloadText(toCsv([[`${loc.label} (${loc.lat.toFixed(4)}, ${loc.lon.toFixed(4)}), times in ${loc.tz}`], head, ...body]), `sunrise-sunset-${year}-${String(month).padStart(2, "0")}.csv`, "text/csv");
  }

  return (
    <div>
      <LocationPicker onPick={(l) => void pick(l)} preferUS={false} deviceLabel="Use my location" busy={state === "loading"} placeholder="City, address or coordinates" />
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1.5 block font-medium">Month</span>
          <select className={fieldClass} value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i + 1}>
                {new Date(Date.UTC(2026, i, 15)).toLocaleString("en-US", { month: "long", timeZone: "UTC" })}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block font-medium">Year</span>
          <input type="number" min={1900} max={2100} className={fieldClass} value={year} onChange={(e) => setYear(Math.max(1900, Math.min(2100, Number(e.target.value) || now.getFullYear())))} />
        </label>
        <label className="block">
          <span className="mb-1.5 block font-medium">Twilight columns</span>
          <select className={fieldClass} value={twilight} onChange={(e) => setTwilight(e.target.value as "civil" | "all")}>
            <option value="civil">Civil dawn and dusk</option>
            <option value="all">Civil, nautical and astronomical</option>
          </select>
        </label>
      </div>
      {state === "loading" && <Loading note="Looking up the place's time zone…" />}
      {typeof state === "object" && <ErrorBox title="The time zone lookup failed" message={state.error} onRetry={() => void pick(state.l)} />}
      {loc && todayRow && (
        <div className="rounded-lg border border-[var(--color-line)]">
          <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
            <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
              {where(loc, loc.source)} · {monthName} {todayRow.d}, {year}
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">
              {todayRow.s.polar === "midnight-sun" ? "Midnight sun — the sun does not set" : todayRow.s.polar === "polar-night" ? "Polar night — the sun does not rise" : `Sunrise ${t(todayRow.s.sunrise)} · Sunset ${t(todayRow.s.sunset)}`}
            </p>
            <p className="mt-1 text-[var(--color-muted)]">
              {hm(todayRow.s.dayLengthMin)} of daylight · solar noon {t(todayRow.s.solarNoon)} · times in {loc.tz}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white">
                <tr className="border-b border-[var(--color-line)]">
                  <th className="px-2 py-2 font-medium">Date</th>
                  {twilight === "all" && <th className="px-2 py-2 font-medium">Astro. dawn</th>}
                  {twilight === "all" && <th className="px-2 py-2 font-medium">Nautical dawn</th>}
                  <th className="px-2 py-2 font-medium">Civil dawn</th>
                  <th className="px-2 py-2 font-medium">Sunrise</th>
                  <th className="px-2 py-2 font-medium">Solar noon</th>
                  <th className="px-2 py-2 font-medium">Sunset</th>
                  <th className="px-2 py-2 font-medium">Civil dusk</th>
                  {twilight === "all" && <th className="px-2 py-2 font-medium">Nautical dusk</th>}
                  {twilight === "all" && <th className="px-2 py-2 font-medium">Astro. dusk</th>}
                  <th className="px-2 py-2 font-medium">Day length</th>
                  <th className="px-2 py-2 font-medium">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-line)]">
                {rows.map((r, i) => {
                  const diff = i ? r.s.dayLengthMin - rows[i - 1].s.dayLengthMin : null;
                  const isToday = today && today.y === year && today.m === month && today.d === r.d;
                  return (
                    <tr key={r.d} className={isToday ? "bg-[var(--color-accent-soft)] font-semibold" : ""}>
                      <td className="px-2 py-1.5">{new Date(Date.UTC(year, month - 1, r.d)).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" })}</td>
                      {twilight === "all" && <td className="px-2 py-1.5">{t(r.ast.morning)}</td>}
                      {twilight === "all" && <td className="px-2 py-1.5">{t(r.nau.morning)}</td>}
                      <td className="px-2 py-1.5">{t(r.civ.morning)}</td>
                      <td className="px-2 py-1.5">{r.s.polar === "none" ? t(r.s.sunrise) : r.s.polar === "midnight-sun" ? "up all day" : "no sunrise"}</td>
                      <td className="px-2 py-1.5">{t(r.s.solarNoon)}</td>
                      <td className="px-2 py-1.5">{r.s.polar === "none" ? t(r.s.sunset) : r.s.polar === "midnight-sun" ? "up all day" : "no sunset"}</td>
                      <td className="px-2 py-1.5">{t(r.civ.evening)}</td>
                      {twilight === "all" && <td className="px-2 py-1.5">{t(r.nau.evening)}</td>}
                      {twilight === "all" && <td className="px-2 py-1.5">{t(r.ast.evening)}</td>}
                      <td className="px-2 py-1.5">{hm(r.s.dayLengthMin)}</td>
                      <td className="px-2 py-1.5 text-[var(--color-muted)]">{diff === null ? "" : `${diff >= 0 ? "+" : "−"}${Math.abs(diff).toFixed(1)} min`}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-4">
            <Btn onClick={csv}>Download the month as CSV</Btn>
            <p className="mt-3 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
              NOAA&apos;s solar position equations (<Ext href={NOAA_DETAILS_URL}>calculation details</Ext>, as used by the <Ext href={NOAA_CALC_URL}>NOAA Solar Calculator</Ext>). Sunrise and sunset:
              the sun&apos;s upper edge on a flat horizon with standard refraction (−0.833°); civil, nautical and astronomical twilight: centre 6°, 12° and 18° below the horizon. NOAA gives the method&apos;s
              accuracy as within a minute between 72° N and 72° S; hills, buildings and unusual refraction shift what you see. Time zone of the place: Open-Meteo; daylight saving from your browser&apos;s tz database.
              A dash means that event does not happen that day.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SunriseSunsetTool() {
  const mounted = useMounted();
  return mounted ? <SunriseSunsetToolInner /> : <p className="rounded-lg border border-[var(--color-line)] p-5 text-sm text-[var(--color-muted)]">Loading…</p>;
}
