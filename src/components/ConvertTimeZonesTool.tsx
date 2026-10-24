"use client";

import { useEffect, useState } from "react";
import { Ext } from "./GeoBits";
import { Btn, useMounted } from "./ToolBits";
import { DateField, ErrorBox, Grid, Hint, ResultCard, TextField, fieldClass } from "./CalcBits";
import { geocodeAddress } from "@/lib/geocode";
import { timeZoneAt, OPEN_METEO_FORECAST_DOCS_URL } from "@/lib/timezone-lookup";
import { abbreviation, fmtOffset, IANA_TZ_URL, isValidZone, offsetMinutes } from "@/lib/tz";
import { zonedParts, zonedToUtc } from "@/lib/sun-position";
import { parseClock, fmt12 } from "@/lib/date-calc";
import { asToolError, isToolError } from "@/lib/errors";

interface Place {
  label: string;
  tz: string;
}

const PRESETS: Place[] = [
  { label: "New York", tz: "America/New_York" },
  { label: "Chicago", tz: "America/Chicago" },
  { label: "Denver", tz: "America/Denver" },
  { label: "Los Angeles", tz: "America/Los_Angeles" },
  { label: "London", tz: "Europe/London" },
  { label: "Paris", tz: "Europe/Paris" },
  { label: "Dubai", tz: "Asia/Dubai" },
  { label: "Karachi", tz: "Asia/Karachi" },
  { label: "New Delhi", tz: "Asia/Kolkata" },
  { label: "Manila", tz: "Asia/Manila" },
  { label: "Tokyo", tz: "Asia/Tokyo" },
  { label: "Sydney", tz: "Australia/Sydney" },
  { label: "UTC / GMT", tz: "UTC" },
];

function PlacePicker({ title, place, onChange }: { title: string; place: Place; onChange: (p: Place) => void }) {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  async function find() {
    const text = q.trim();
    if (!text) return;
    setMsg(null);
    if (isValidZone(text) && text.includes("/")) {
      onChange({ label: text.split("/").pop()!.replace(/_/g, " "), tz: text });
      return;
    }
    setBusy(true);
    try {
      const g = await geocodeAddress(text, { preferUS: false });
      onChange({ label: g.label.split(",").slice(0, 2).join(","), tz: await timeZoneAt(g.lat, g.lon) });
      setQ("");
    } catch (e) {
      setMsg(asToolError(e).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="rounded-md border border-[var(--color-line)] p-3">
      <p className="mb-2 font-medium">
        {title}: <span className="font-semibold">{place.label}</span> <span className="text-xs text-[var(--color-muted)]">({place.tz})</span>
      </p>
      <select className={fieldClass + " mb-2"} value="" onChange={(e) => e.target.value && onChange(PRESETS[Number(e.target.value)])} aria-label={`${title} quick pick`}>
        <option value="">Quick pick a city…</option>
        {PRESETS.map((p, i) => (
          <option key={p.tz} value={i}>
            {p.label}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <input className={fieldClass} placeholder="Or type any city or town" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && find()} aria-label={`${title} city search`} />
        <Btn onClick={find} disabled={busy}>
          {busy ? "Finding…" : "Find"}
        </Btn>
      </div>
      {msg && <p className="mt-2 text-sm text-[var(--color-muted)]">{msg}</p>}
    </div>
  );
}

function Inner() {
  const [from, setFrom] = useState<Place>(PRESETS[0]);
  const [to, setTo] = useState<Place>(PRESETS[4]);
  const [date, setDate] = useState("2026-10-24");
  const [time, setTime] = useState("9:00 AM");

  useEffect(() => {
    const p = zonedParts(Date.now(), PRESETS[0].tz);
    setDate(`${p.y}-${String(p.m).padStart(2, "0")}-${String(p.d).padStart(2, "0")}`);
  }, []);

  let error: string | null = null;
  let ms = 0;
  try {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
    if (!m) throw new Error("date");
    const min = parseClock(time);
    ms = zonedToUtc(+m[1], +m[2], +m[3], Math.floor(min / 60), min % 60, from.tz);
  } catch (e) {
    error = isToolError(e) ? e.message : "Enter a date and a time such as 9:00 AM or 21:00.";
  }

  const diff = error ? 0 : offsetMinutes(to.tz, ms) - offsetMinutes(from.tz, ms);
  const fp = zonedParts(ms, from.tz), tp = zonedParts(ms, to.tz);
  const dayShift = Date.UTC(tp.y, tp.m - 1, tp.d) - Date.UTC(fp.y, fp.m - 1, fp.d);
  const fmtFull = (tz: string) => new Date(ms).toLocaleString("en-US", { timeZone: tz, weekday: "long", month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
  const h = Math.floor(Math.abs(diff) / 60), mm = Math.abs(diff) % 60;

  return (
    <div>
      <Grid cols={2}>
        <PlacePicker title="From" place={from} onChange={setFrom} />
        <PlacePicker title="To" place={to} onChange={setTo} />
      </Grid>
      <Grid cols={3}>
        <DateField label={`Date in ${from.label}`} value={date} onChange={setDate} />
        <TextField label={`Time in ${from.label}`} value={time} onChange={setTime} hint="9:00 AM, 21:00 or 2130" />
        <div className="flex items-end">
          <Btn
            onClick={() => {
              setFrom(to);
              setTo(from);
            }}
          >
            ⇄ Swap cities
          </Btn>
        </div>
      </Grid>
      <Hint>Daylight saving is applied for the date you pick, in both places.</Hint>
      <div aria-live="polite">
        {error ? (
          <ErrorBox message={error} />
        ) : (
          <ResultCard
            label={`${fmt12(parseClock(time))} in ${from.label} is`}
            headline={`${new Date(ms).toLocaleTimeString("en-US", { timeZone: to.tz, hour: "numeric", minute: "2-digit" })} in ${to.label}${dayShift > 0 ? " (next day)" : dayShift < 0 ? " (previous day)" : ""}`}
            sub={diff === 0 ? "Both places show the same time on this date." : `${to.label} is ${h ? `${h} h` : ""}${h && mm ? " " : ""}${mm ? `${mm} min` : ""} ${diff > 0 ? "ahead of" : "behind"} ${from.label} on this date.`}
            rows={[
              [from.label, `${fmtFull(from.tz)} · ${abbreviation(from.tz, ms)} (${fmtOffset(offsetMinutes(from.tz, ms))})`],
              [to.label, `${fmtFull(to.tz)} · ${abbreviation(to.tz, ms)} (${fmtOffset(offsetMinutes(to.tz, ms))})`],
            ]}
            limits="A time that does not exist on a clock-change night (when clocks spring forward) is moved to the first valid time. The rules are those of the IANA database built into your browser; a country that changes its time-zone law at short notice may be ahead of your browser's copy."
            method={
              <p>
                Time-zone rules: <Ext href={IANA_TZ_URL}>IANA tz database</Ext> in your browser. Typed city names are found with Photon (OpenStreetMap) and their time zone with{" "}
                <Ext href={OPEN_METEO_FORECAST_DOCS_URL}>Open-Meteo</Ext>; the quick-pick cities need no lookup.
              </p>
            }
          />
        )}
      </div>
    </div>
  );
}

export default function ConvertTimeZonesTool() {
  return useMounted() ? <Inner /> : <p className="text-sm text-[var(--color-muted)]">Loading the time-zone converter…</p>;
}
