"use client";

import { useEffect, useState } from "react";
import TileMap, { type MapShape } from "./TileMap";
import LocationPicker, { type PickedLocation } from "./LocationPicker";
import { Ext, n, n0, where, fmtMiKm } from "./GeoBits";
import { fmtDms } from "@/lib/coords";
import { timeZoneAt } from "@/lib/timezone-lookup";
import { fmtInZone, fmtOffset, offsetMinutes } from "@/lib/tz";
import lines from "@/data/earth-lines.json";
import type { LatLon } from "@/lib/geodesy";

export type LineId = "equator" | "tropic-of-cancer" | "tropic-of-capricorn" | "arctic-circle" | "antarctic-circle" | "prime-meridian" | "international-date-line";

const NAMES: Record<LineId, string> = {
  equator: "Equator",
  "tropic-of-cancer": "Tropic of Cancer",
  "tropic-of-capricorn": "Tropic of Capricorn",
  "arctic-circle": "Arctic Circle",
  "antarctic-circle": "Antarctic Circle",
  "prime-meridian": "Prime Meridian",
  "international-date-line": "International Date Line",
};
const NE10_URL = "https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/";
const NE_LINES_URL = "https://www.naturalearthdata.com/downloads/10m-physical-vectors/10m-geographic-lines/";
const IAU_URL = "https://doi.org/10.1051/0004-6361:20031539";
const MALYS_URL = "https://doi.org/10.1007/s00190-015-0844-y";

/** Metres per degree of latitude near a given latitude (WGS84 meridian radius). */
const mPerDegLat = (lat: number) => {
  const a = 6378137, e2 = 0.00669437999014, s = Math.sin((lat * Math.PI) / 180);
  return ((Math.PI / 180) * a * (1 - e2)) / (1 - e2 * s * s) ** 1.5;
};

interface Crossing {
  id: string;
  name: string;
  type: string;
  from: number;
  to: number;
  segments: number;
  km: number;
}

function TimeAt({ p }: { p: PickedLocation }) {
  const [tz, setTz] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let live = true;
    timeZoneAt(p.lat, p.lon).then(
      (z) => live && setTz(z),
      () => live && setFailed(true),
    );
    return () => {
      live = false;
    };
  }, [p.lat, p.lon]);
  if (failed) return <>Its time zone could not be looked up.</>;
  if (!tz) return <>Looking up its local date…</>;
  const now = Date.now();
  return (
    <>
      Local date and time there: <strong>{fmtInZone(now, tz, { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" })}</strong> ({tz}, {fmtOffset(offsetMinutes(tz, now))}).
    </>
  );
}

export default function EarthLineTool({ line }: { line: LineId }) {
  const [place, setPlace] = useState<PickedLocation | null>(null);
  const [focus, setFocus] = useState<Crossing | null>(null);
  const isIdl = line === "international-date-line";
  const data = isIdl ? null : (lines.lines as Record<string, { axis: "lat" | "lon"; value: number; countries: Crossing[] }>)[line];
  const value = data?.value ?? 180;
  const axis = data?.axis ?? "lon";

  const lineShapes: MapShape[] = isIdl
    ? (lines.dateLine as number[][][]).map((seg) => ({ points: seg.map(([lon, lat]) => ({ lat, lon: lon > 180 ? 180 : lon })), color: "#b91c1c", width: 3 }))
    : axis === "lat"
      ? [{ points: Array.from({ length: 361 }, (_, i) => ({ lat: value, lon: -180 + i })), color: "#b91c1c", width: 3 }]
      : [{ points: Array.from({ length: 171 }, (_, i) => ({ lat: -85 + i, lon: value })), color: "#b91c1c", width: 3 }];
  const focusShape: MapShape[] = focus
    ? [{ points: axis === "lat" ? [{ lat: value, lon: focus.from }, { lat: value, lon: focus.to }] : [{ lat: focus.from, lon: value }, { lat: focus.to, lon: value }], color: "#f59e0b", width: 7 }]
    : [];

  const off = place && !isIdl ? (axis === "lat" ? place.lat - value : ((place.lon - value + 540) % 360) - 180) : null;
  const offM = off === null || !place ? null : axis === "lat" ? Math.abs(off) * mPerDegLat((place.lat + value) / 2) : Math.abs(off) * mPerDegLat(0) * Math.cos((place.lat * Math.PI) / 180);
  const dir = off === null ? "" : axis === "lat" ? (off >= 0 ? "north" : "south") : off >= 0 ? "east" : "west";
  const total = data ? data.countries.reduce((s, c) => s + c.km, 0) : 0;
  const land = data ? data.countries.length : 0;

  const initial: { lat: number; lon: number; zoom: number } = isIdl ? { lat: 0, lon: 180, zoom: 2 } : axis === "lat" ? { lat: Math.max(-70, Math.min(70, value)), lon: 0, zoom: 1 } : { lat: 20, lon: 0, zoom: 2 };

  return (
    <div>
      <div className="mb-4 rounded-lg border border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">{NAMES[line]}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {isIdl
            ? "About 180° longitude, bent around island nations"
            : axis === "lat"
              ? `${n(Math.abs(value), 4)}° ${value === 0 ? "" : value > 0 ? "N" : "S"} (${fmtDms(value, true, 1)})`
              : "0° longitude (the Greenwich meridian)"}
        </p>
        {!isIdl && (
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {land} {land === 1 ? "country or territory" : "countries and territories"} on land · about {n0(total)} km ({n0(total / 1.609344)} mi) of the line runs over land
            {line !== "equator" && line !== "prime-meridian" && ` · position for ${lines.obliquityEpoch.slice(0, 4)}; it moves about 15 m a year`}
          </p>
        )}
      </div>

      <TileMap
        ariaLabel={`Map of the ${NAMES[line]}`}
        shapes={[...lineShapes, ...focusShape]}
        markers={place ? [{ lat: place.lat, lon: place.lon, color: "#1d4ed8" }] : []}
        initial={initial}
        fitKey={focus ? `${focus.id}` : place ? `${place.lat},${place.lon}` : undefined}
        maxFitZoom={6}
        height={440}
        onPick={(p) => setPlace({ ...p, label: `${p.lat.toFixed(3)}, ${p.lon.toFixed(3)}`, source: "map" })}
      />
      <p className="mt-1.5 text-xs text-[var(--color-muted)]">Click the map or search below to see how far a place is from the line.</p>

      <div className="mt-4">
        <LocationPicker onPick={setPlace} preferUS={false} deviceLabel="How far am I from it?" searchLabel="Check" label={`Distance from the ${NAMES[line]}`} placeholder="City, address or coordinates" />
        {place && (
          <p className="rounded-md border border-[var(--color-line)] p-3 text-sm">
            {isIdl ? (
              <>
                {where(place, place.source)}. <TimeAt key={`${place.lat},${place.lon}`} p={place} /> The date a place keeps is set by its time zone, which is why the line zigzags.
              </>
            ) : offM !== null && offM < 1 ? (
              <>{where(place, place.source)} is on the line.</>
            ) : (
              <>
                {where(place, place.source)} is <strong>{fmtMiKm(offM ?? 0, 0)}</strong> {dir} of the {NAMES[line]}
                {axis === "lon" ? ` (${n(Math.abs(off ?? 0), 2)}° of longitude, measured along its parallel)` : ` (${n(Math.abs(off ?? 0), 2)}° of latitude)`}.
              </>
            )}
          </p>
        )}
      </div>

      {data && (
        <div className="mt-4 overflow-x-auto rounded-lg border border-[var(--color-line)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--color-accent-soft)]">
              <tr>
                <th className="px-3 py-2 font-medium">#</th>
                <th className="px-3 py-2 font-medium">Country or territory</th>
                <th className="px-3 py-2 font-medium">{axis === "lat" ? "From – to (longitude)" : "From – to (latitude)"}</th>
                <th className="px-3 py-2 font-medium">Line over land</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-line)]">
              {data.countries.map((c, i) => (
                <tr key={c.id} className={focus?.id === c.id ? "bg-[var(--color-warn-soft)]" : ""}>
                  <td className="px-3 py-2 text-[var(--color-muted)]">{i + 1}</td>
                  <td className="px-3 py-2">
                    <button type="button" className="text-left underline" onClick={() => setFocus(c)}>
                      {c.name}
                    </button>
                    {!["Sovereign country", "Country"].includes(c.type) && <span className="ml-1 text-xs text-[var(--color-muted)]">(status in Natural Earth: {c.type.toLowerCase()})</span>}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {axis === "lat"
                      ? `${n(Math.abs(c.from), 2)}° ${c.from < 0 ? "W" : "E"} – ${n(Math.abs(c.to), 2)}° ${c.to < 0 ? "W" : "E"}`
                      : `${n(Math.abs(c.from), 2)}° ${c.from < 0 ? "S" : "N"} – ${n(Math.abs(c.to), 2)}° ${c.to < 0 ? "S" : "N"}`}
                    {c.segments > 1 && <span className="block text-xs text-[var(--color-muted)]">in {c.segments} separate stretches</span>}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {n0(c.km)} km ({n0(c.km / 1.609344)} mi)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-xs text-[var(--color-muted)]">
        {isIdl ? (
          <>
            Line: Natural Earth 1:10m geographic lines (<Ext href={NE_LINES_URL}>naturalearthdata.com</Ext>). The date line has no international treaty; it follows the time zones that countries choose. Local
            dates: each place&apos;s time zone (Open-Meteo) and your browser&apos;s IANA tz database.
          </>
        ) : (
          <>
            Crossings computed for this site from <Ext href={NE10_URL}>Natural Earth 1:10m countries</Ext>: the line is intersected with every country outline and the land stretches are measured on the
            WGS84 ellipsoid. Small islands and lakes can add or remove short stretches; country status follows Natural Earth.
            {line !== "equator" && line !== "prime-meridian" && (
              <>
                {" "}
                The tropics and polar circles sit at the Earth&apos;s axial tilt (and 90° minus it): the IAU 2006 mean obliquity for {lines.obliquityEpoch}, {n(lines.obliquityDeg, 4)}° (
                <Ext href={IAU_URL}>Capitaine et al. 2003</Ext>), which shrinks by about 0.47″ a year, moving these lines about 15 m a year (the polar circles toward the poles, the tropics toward the
                equator).
              </>
            )}
            {line === "prime-meridian" && (
              <>
                {" "}
                The IERS Reference Meridian used by GPS runs about 102 m east of the historic Airy transit circle at Greenwich (<Ext href={MALYS_URL}>Malys et al. 2015</Ext>).
              </>
            )}
          </>
        )}
      </p>
    </div>
  );
}
