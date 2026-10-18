"use client";

import { useEffect, useMemo, useState } from "react";
import TileMap from "./TileMap";
import LocationPicker, { type PickedLocation } from "./LocationPicker";
import { skyShade } from "./SkyShade";
import { useMounted } from "./ToolBits";
import { Ext, n, n0, Row, Table, where } from "./GeoBits";
import { columns } from "@/lib/terminator";
import { HORIZONS_URL, moonAge, moonAltitude, moonPosition, moonRiseSet, nextPhases, phaseName, SCHLYTER_URL, USNO_PHASES_URL } from "@/lib/moon";
import { compassPoint, formatLatLon } from "@/lib/geodesy";
import { timeZoneAt } from "@/lib/timezone-lookup";
import { fmtInZone } from "@/lib/tz";
import { zonedParts, zonedToUtc } from "@/lib/sun-position";

function MoonPositionToolInner() {
  const [t, setT] = useState(() => Date.now());
  const [place, setPlace] = useState<(PickedLocation & { tz: string }) | null>(null);

  useEffect(() => {
    const id = setInterval(() => setT(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  async function pick(l: PickedLocation) {
    let tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    try {
      tz = await timeZoneAt(l.lat, l.lon);
    } catch {
      /* fall back to the device zone; said on the result */
    }
    setPlace({ ...l, tz });
  }

  const m = moonPosition(t);
  const minute = Math.floor(t / 60000);
  const up = useMemo(() => [{ cols: columns(m.sublunarLat, m.sublunarLon, 0, true), fill: "#0b1533", opacity: 0.35 }], [minute]); // eslint-disable-line react-hooks/exhaustive-deps
  const track = useMemo(() => Array.from({ length: 49 }, (_, i) => {
    const p = moonPosition(t + i * 30 * 60000);
    return { lat: p.sublunarLat, lon: p.sublunarLon };
  }), [minute]); // eslint-disable-line react-hooks/exhaustive-deps
  const phases = useMemo(() => nextPhases(t, 4), [Math.floor(minute / 60)]); // eslint-disable-line react-hooks/exhaustive-deps

  let local: { alt: ReturnType<typeof moonAltitude>; rs: ReturnType<typeof moonRiseSet> } | null = null;
  if (place) {
    const p = zonedParts(t, place.tz);
    const start = zonedToUtc(p.y, p.m, p.d, 0, 0, place.tz);
    local = { alt: moonAltitude(t, place.lat, place.lon), rs: moonRiseSet(start, place.lat, place.lon) };
  }
  const zone = place?.tz ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  const fmt = (ms: number) => fmtInZone(ms, zone, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" });

  return (
    <div>
      <LocationPicker onPick={(l) => void pick(l)} preferUS={false} deviceLabel="Where is the moon from here?" label="See the moon from a place (optional)" placeholder="City, address or coordinates" />
      <TileMap
        ariaLabel="World map showing where the moon is overhead and where it is below the horizon"
        initial={{ lat: 15, lon: m.sublunarLon, zoom: 2 }}
        height={440}
        markers={[{ lat: m.sublunarLat, lon: m.sublunarLon, color: "#e5e7eb", r: 10, label: "Moon overhead" }, ...(place ? [{ lat: place.lat, lon: place.lon, color: "#1d4ed8", r: 6 }] : [])]}
        shapes={[{ points: track, dashed: true, color: "#f8fafc", width: 2 }]}
        overlay={(px) => skyShade(px, up)}
        onPick={(p) => void pick({ ...p, label: formatLatLon(p, 3), source: "map" })}
      />
      <p className="mt-1.5 text-xs text-[var(--color-muted)]">Unshaded: the half of the Earth where the moon is above the horizon now. Dashed: where the moon will be overhead over the next 24 hours. Click a place for its view.</p>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-[var(--color-line)]">
          <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-4">
            <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">The moon now</p>
            <p className="mt-1 text-xl font-semibold">
              {phaseName(m.elongation)} · {n(m.illumination * 100, 0)}% lit
            </p>
          </div>
          <div className="p-4 text-sm">
            <Table>
              <Row k="Overhead at">{formatLatLon({ lat: m.sublunarLat, lon: m.sublunarLon }, 2)}</Row>
              <Row k="Age">{n(moonAge(t), 1)} days since new moon</Row>
              <Row k="Distance from Earth">
                {n0(m.distanceKm)} km ({n0(m.distanceKm / 1.609344)} mi), centre to centre
              </Row>
              <Row k="Declination">{n(m.dec, 2)}°</Row>
              {phases.map((p) => (
                <Row key={p.ms} k={p.name}>
                  {fmt(p.ms)}
                </Row>
              ))}
            </Table>
          </div>
        </div>
        {place && local && (
          <div className="rounded-lg border border-[var(--color-line)]">
            <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-4">
              <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">From {where(place, place.source)}</p>
              <p className="mt-1 text-xl font-semibold">
                {local.alt.altitude > 0 ? `${n(local.alt.altitude, 1)}° up, toward the ${compassPoint(local.alt.azimuth)}` : `Below the horizon (${n(local.alt.altitude, 1)}°)`}
              </p>
            </div>
            <div className="p-4 text-sm">
              <Table>
                <Row k="Azimuth">
                  {n(local.alt.azimuth, 1)}° from true north ({compassPoint(local.alt.azimuth)})
                </Row>
                <Row k="Moonrise today">{local.rs.rise ? fmt(local.rs.rise) : local.rs.alwaysUp ? "Up all day" : local.rs.alwaysDown ? "Does not rise" : "No moonrise on this date"}</Row>
                <Row k="Moonset today">{local.rs.set ? fmt(local.rs.set) : local.rs.alwaysUp ? "Up all day" : local.rs.alwaysDown ? "Below the horizon all day" : "No moonset on this date"}</Row>
                <Row k="Time zone">{place.tz}</Row>
              </Table>
              <p className="text-xs text-[var(--color-muted)]">Altitude is for the moon&apos;s centre, without atmospheric refraction; rise and set use the upper edge with standard refraction and the moon&apos;s parallax.</p>
            </div>
          </div>
        )}
      </div>
      <p className="mt-3 text-xs text-[var(--color-muted)]">
        Moon position: Paul Schlyter&apos;s method (<Ext href={SCHLYTER_URL}>How to compute planetary positions</Ext>), with the main lunar perturbation terms; checked against{" "}
        <Ext href={HORIZONS_URL}>JPL Horizons</Ext> (within about a minute of arc) and phase times against the <Ext href={USNO_PHASES_URL}>US Naval Observatory</Ext> (within 10 minutes, October–December 2026). Updated every minute;
        calculated in your browser. Time zone of a place: Open-Meteo.
      </p>
    </div>
  );
}

export default function MoonPositionTool() {
  const mounted = useMounted();
  return mounted ? <MoonPositionToolInner /> : <p className="rounded-lg border border-[var(--color-line)] p-5 text-sm text-[var(--color-muted)]">Working out where the moon is…</p>;
}
