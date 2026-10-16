"use client";

import { useId, useState } from "react";
import LocationPicker, { type PickedLocation } from "./LocationPicker";
import { ErrorBox, Ext, Headline, Loading, n, Row, Table, Warn } from "./GeoBits";
import { elevationCurve, NOAA_DETAILS_URL, sunDay, sunPosition, zonedParts, zonedToUtc } from "@/lib/sun-position";
import { timeZoneAt, OPEN_METEO_FORECAST_DOCS_URL } from "@/lib/timezone-lookup";
import { compassPoint, formatLatLon } from "@/lib/geodesy";
import { asToolError } from "@/lib/errors";

interface Place {
  lat: number;
  lon: number;
  label: string;
  tz: string;
  tzNote: string | null;
}

type State = { phase: "idle" } | { phase: "loading" } | { phase: "error"; message: string } | { phase: "ready"; place: Place };

const pad = (x: number) => String(x).padStart(2, "0");

function nowIn(tz: string) {
  const p = zonedParts(Date.now(), tz);
  return { date: `${p.y}-${pad(p.m)}-${pad(p.d)}`, time: `${pad(p.hh)}:${pad(p.mm)}` };
}

function fmtTime(ms: number | null, tz: string): string {
  if (ms === null) return "—";
  return new Date(ms).toLocaleTimeString("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit" });
}

function hhmm(min: number): string {
  const h = Math.floor(min / 60);
  const m = Math.round(min - h * 60);
  return m === 60 ? `${h + 1} h 00 min` : `${h} h ${pad(m)} min`;
}

function Chart({ curve, startMs, atMs }: { curve: { ms: number; elevation: number }[]; startMs: number; atMs: number }) {
  const W = 600, H = 200, top = 90, bottom = -30;
  const x = (ms: number) => ((ms - startMs) / 86400000) * W;
  const y = (e: number) => ((top - Math.max(bottom, Math.min(top, e))) / (top - bottom)) * H;
  const d = curve.map((c, i) => `${i ? "L" : "M"}${x(c.ms).toFixed(1)},${y(c.elevation).toFixed(1)}`).join("");
  return (
    <svg viewBox={`0 0 ${W} ${H + 18}`} className="mb-5 w-full" role="img" aria-label="The sun's elevation through the day">
      <rect x={0} y={0} width={W} height={y(0)} fill="#eff6ff" />
      <rect x={0} y={y(0)} width={W} height={H - y(0)} fill="#f1f5f9" />
      {[0, 30, 60, 90].map((e) => (
        <g key={e}>
          <line x1={0} x2={W} y1={y(e)} y2={y(e)} stroke="#cbd5e1" strokeWidth={e === 0 ? 1.5 : 0.75} />
          <text x={4} y={e === 90 ? y(e) + 12 : y(e) - 3} fontSize={11} fill="#64748b">
            {e}°
          </text>
        </g>
      ))}
      {[0, 6, 12, 18, 24].map((h) => (
        <text key={h} x={(h / 24) * W} y={H + 14} fontSize={11} fill="#64748b" textAnchor={h === 0 ? "start" : h === 24 ? "end" : "middle"}>
          {pad(h % 24)}:00
        </text>
      ))}
      <path d={d} fill="none" stroke="#b45309" strokeWidth={2.5} />
      <line x1={x(atMs)} x2={x(atMs)} y1={0} y2={H} stroke="#1d4ed8" strokeDasharray="4 4" />
    </svg>
  );
}

export default function SunPositionTool() {
  const [state, setState] = useState<State>({ phase: "idle" });
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const ids = { d: useId(), t: useId() };

  async function onPick(loc: PickedLocation) {
    setState({ phase: "loading" });
    let tz: string;
    let tzNote: string | null = null;
    try {
      tz = await timeZoneAt(loc.lat, loc.lon);
    } catch (err) {
      if (loc.source !== "device") {
        setState({ phase: "error", message: asToolError(err).message + " Please try again." });
        return;
      }
      tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      tzNote = "The time zone service did not respond, so times use your device's time zone setting.";
    }
    const now = nowIn(tz);
    setDate(now.date);
    setTime(now.time);
    setState({ phase: "ready", place: { lat: loc.lat, lon: loc.lon, label: loc.source === "device" ? "Your location" : loc.label, tz, tzNote } });
  }

  let body = null;
  if (state.phase === "ready") {
    const { place } = state;
    const [Y, M, D] = date.split("-").map(Number);
    const [hh, mm] = time.split(":").map(Number);
    const valid = [Y, M, D, hh, mm].every(Number.isFinite) && Y >= 1901 && Y <= 2099;
    if (!valid) {
      body = <ErrorBox title="Check the date and time" message="Enter a date between 1901 and 2099 (the range NOAA's equations are published for) and a time." />;
    } else {
      const atMs = zonedToUtc(Y, M, D, hh, mm, place.tz);
      const pos = sunPosition(atMs, place.lat, place.lon);
      const day = sunDay(Y, M, D, place.lat, place.lon);
      const startMs = zonedToUtc(Y, M, D, 0, 0, place.tz);
      const curve = elevationCurve(startMs, place.lat, place.lon, 10);
      const up = pos.elevation > 0;
      const shadow = pos.elevation > 0.5 ? 1 / Math.tan((pos.elevation * Math.PI) / 180) : null;
      body = (
        <div className="rounded-lg border border-[var(--color-line)]">
          <Headline
            kicker={`Sun at ${place.label} · ${date} ${time} (${place.tz})`}
            title={`${n(pos.elevation, 1)}° ${up ? "above" : "below"} the horizon`}
            sub={`Azimuth ${n(pos.azimuth, 1)}° (${compassPoint(pos.azimuth)}) from true north`}
          />
          <div className="p-5 text-sm">
            {place.tzNote && <Warn title="Time zone">{place.tzNote}</Warn>}
            {Math.abs(place.lat) > 72 && (
              <Warn title="High latitude">NOAA gives sunrise and sunset to within about 10 minutes beyond 72° latitude, rather than one minute.</Warn>
            )}
            <Chart curve={curve} startMs={startMs} atMs={atMs} />
            <Table>
              <Row k="Sunrise">{day.polar === "midnight-sun" ? "Sun does not set (midnight sun)" : day.polar === "polar-night" ? "Sun does not rise (polar night)" : fmtTime(day.sunrise, place.tz)}</Row>
              <Row k="Solar noon">
                {fmtTime(day.solarNoon, place.tz)} · sun {n(day.noonElevation, 1)}° high
              </Row>
              <Row k="Sunset">{day.polar !== "none" ? "—" : fmtTime(day.sunset, place.tz)}</Row>
              <Row k="Day length">{hhmm(day.dayLengthMin)}</Row>
              <Row k="Elevation (no refraction)">{n(pos.elevationGeometric, 2)}°</Row>
              <Row k="Shadow of a 1 m (or 1 ft) upright object">
                {shadow === null ? "No direct sunlight" : shadow > 50 ? "Longer than 50 times its height" : `${n(shadow, 2)} m (or ft), pointing ${compassPoint(pos.azimuth + 180)}`}
              </Row>
              <Row k="Solar declination">{n(pos.declination, 2)}°</Row>
              <Row k="Equation of time">{n(pos.equationOfTime, 2)} min</Row>
              <Row k="Location">{formatLatLon(place)}</Row>
            </Table>
            <p className="text-[var(--color-muted)]">
              Elevation is the sun&rsquo;s angle above the horizon (negative is below); azimuth is its compass direction measured
              clockwise from true north, not magnetic north. Sunrise and sunset are calculated for a flat, sea-level horizon with NOAA&rsquo;s standard 0.833° allowance; hills,
              buildings and your height change the times you actually see.
            </p>
            <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
              <p>
                Method: NOAA Global Monitoring Laboratory solar calculation equations (from Meeus, Astronomical Algorithms), calculated
                in your browser; 0.833° refraction for sunrise/sunset and NOAA&rsquo;s banded refraction model for elevation. NOAA notes
                its calculator is no longer actively maintained. Time zone: Open-Meteo.
              </p>
              <p className="mt-1 flex flex-wrap gap-x-4">
                <Ext href={NOAA_DETAILS_URL}>NOAA solar calculation details</Ext>
                <Ext href={OPEN_METEO_FORECAST_DOCS_URL}>Open-Meteo</Ext>
              </p>
            </footer>
          </div>
        </div>
      );
    }
  }

  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";
  return (
    <div>
      <LocationPicker onPick={onPick} preferUS={false} deviceLabel="Use my location" searchLabel="Set place" busy={state.phase === "loading"} />
      {state.phase === "ready" && (
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <div>
            <label htmlFor={ids.d} className="mb-1.5 block font-medium">
              Date
            </label>
            <input id={ids.d} type="date" min="1901-01-01" max="2099-12-31" value={date} onChange={(e) => setDate(e.target.value)} className={field} />
          </div>
          <div>
            <label htmlFor={ids.t} className="mb-1.5 block font-medium">
              Local time
            </label>
            <input id={ids.t} type="time" value={time} onChange={(e) => setTime(e.target.value)} className={field} />
          </div>
          <button
            type="button"
            onClick={() => {
              const now = nowIn(state.place.tz);
              setDate(now.date);
              setTime(now.time);
            }}
            className="col-span-2 self-end rounded-md border border-[var(--color-line)] bg-white px-4 py-2.5 font-medium sm:col-span-1"
          >
            Now
          </button>
        </div>
      )}
      <div aria-live="polite">
        {state.phase === "loading" && <Loading note="Looking up the local time zone…" />}
        {state.phase === "error" && <ErrorBox title="Could not set that place" message={state.message} />}
        {body}
      </div>
    </div>
  );
}
