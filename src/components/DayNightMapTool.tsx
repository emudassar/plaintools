"use client";

import { useEffect, useMemo, useState } from "react";
import TileMap from "./TileMap";
import LocationPicker, { type PickedLocation } from "./LocationPicker";
import { skyShade } from "./SkyShade";
import { Ext, n } from "./GeoBits";
import { Btn, useMounted } from "./ToolBits";
import { fieldClass } from "./CalcBits";
import { columns, altitudeDeg, TWILIGHT } from "@/lib/terminator";
import { NOAA_DETAILS_URL, subsolarPoint, sunPosition } from "@/lib/sun-position";
import { moonPosition, SCHLYTER_URL } from "@/lib/moon";
import { formatLatLon } from "@/lib/geodesy";

const toLocalInput = (ms: number) => {
  const d = new Date(ms);
  const p = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

function lightAt(alt: number): string {
  if (alt > -0.833) return "Daylight (the sun is up)";
  if (alt > -6) return "Civil twilight";
  if (alt > -12) return "Nautical twilight";
  if (alt > -18) return "Astronomical twilight";
  return "Night";
}

function DayNightMapToolInner() {
  const [live, setLive] = useState(true);
  const [t, setT] = useState(() => Date.now());
  const [showMoon, setShowMoon] = useState(true);
  const [place, setPlace] = useState<PickedLocation | null>(null);

  useEffect(() => {
    if (!live) return;
    setT(Date.now());
    const id = setInterval(() => setT(Date.now()), 60_000);
    return () => clearInterval(id);
  }, [live]);

  const sun = subsolarPoint(t);
  const moon = showMoon ? moonPosition(t) : null;
  const layers = useMemo(() => TWILIGHT.map((tw) => ({ cols: columns(sun.lat, sun.lon, tw.h, true), fill: "#0b1533", opacity: 0.17 })), [sun.lat, sun.lon]);
  const here = place ? { alt: altitudeDeg(place.lat, place.lon, sun.lat, sun.lon), pos: sunPosition(t, place.lat, place.lon) } : null;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="mb-1.5 block font-medium">Date and time (your time zone)</span>
          <input
            type="datetime-local"
            className={fieldClass}
            value={toLocalInput(t)}
            onChange={(e) => {
              const v = new Date(e.target.value).getTime();
              if (Number.isFinite(v)) {
                setLive(false);
                setT(v);
              }
            }}
          />
        </label>
        <Btn onClick={() => { setLive(false); setT((x) => x - 3600_000); }}>− 1 hour</Btn>
        <Btn onClick={() => { setLive(false); setT((x) => x + 3600_000); }}>+ 1 hour</Btn>
        <Btn primary onClick={() => setLive(true)} disabled={live}>
          Now (live)
        </Btn>
        <label className="flex items-center gap-2 pb-2 text-sm">
          <input type="checkbox" checked={showMoon} onChange={(e) => setShowMoon(e.target.checked)} /> Show the moon
        </label>
      </div>
      <input
        type="range"
        min={-720}
        max={720}
        step={10}
        defaultValue={0}
        className="mb-3 w-full"
        aria-label="Move time by up to 12 hours"
        onChange={(e) => {
          setLive(false);
          setT(Date.now() + Number(e.target.value) * 60000);
        }}
      />
      <TileMap
        ariaLabel="World map shaded where it is night and twilight"
        initial={{ lat: 20, lon: sun.lon, zoom: 2 }}
        height={460}
        markers={[
          { lat: sun.lat, lon: sun.lon, color: "#f59e0b", r: 9, label: "Sun overhead" },
          ...(moon ? [{ lat: moon.sublunarLat, lon: moon.sublunarLon, color: "#e5e7eb", r: 8, label: "Moon overhead" }] : []),
          ...(place ? [{ lat: place.lat, lon: place.lon, color: "#1d4ed8", r: 6 }] : []),
        ]}
        overlay={(px) => skyShade(px, layers)}
        onPick={(p) => setPlace({ ...p, label: formatLatLon(p, 3), source: "map" })}
      />
      <p className="mt-1.5 text-xs text-[var(--color-muted)]">
        Darker bands: past sunset, then civil, nautical and astronomical twilight, then full night. Click anywhere to see the light there.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-[var(--color-line)] p-4 text-sm">
          <p className="font-semibold">{new Date(t).toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}</p>
          <p className="mt-1 text-[var(--color-muted)]">{new Date(t).toUTCString().replace("GMT", "UTC")}</p>
          <p className="mt-2">
            Sun overhead at <strong>{formatLatLon(sun, 2)}</strong>
          </p>
          {moon && (
            <p>
              Moon overhead at <strong>{formatLatLon({ lat: moon.sublunarLat, lon: moon.sublunarLon }, 2)}</strong> · {n(moon.illumination * 100, 0)}% lit
            </p>
          )}
        </div>
        <div className="rounded-lg border border-[var(--color-line)] p-4 text-sm">
          <LocationPicker onPick={setPlace} preferUS={false} deviceLabel="Is it day where I am?" searchLabel="Check" label="Day or night at a place" placeholder="City or address" />
          {place && here && (
            <p>
              <strong>{lightAt(here.alt)}</strong> at {place.label} — the sun is {n(Math.abs(here.pos.elevation), 1)}° {here.pos.elevation >= 0 ? "above" : "below"} the horizon.
            </p>
          )}
        </div>
      </div>
      <p className="mt-3 text-xs text-[var(--color-muted)]">
        Sun: NOAA&apos;s solar equations (<Ext href={NOAA_DETAILS_URL}>NOAA Global Monitoring Laboratory</Ext>) give the point where the sun is overhead; each place&apos;s sun altitude follows from
        it. Twilight limits are the standard −6°, −12° and −18°; the day/night line uses −0.833° (sun&apos;s upper edge with refraction). Moon: Schlyter&apos;s method (
        <Ext href={SCHLYTER_URL}>stjarnhimlen.se</Ext>). Shading is drawn in 1° columns and stops at 85° latitude, the edge of the web map. Calculated in your browser.
      </p>
    </div>
  );
}

export default function DayNightMapTool() {
  const mounted = useMounted();
  return mounted ? <DayNightMapToolInner /> : <p className="rounded-lg border border-[var(--color-line)] p-5 text-sm text-[var(--color-muted)]">Working out where it is day and night…</p>;
}
