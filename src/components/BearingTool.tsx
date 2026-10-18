"use client";

import { useState } from "react";
import PlacePairForm, { type Place } from "./PlacePairForm";
import TileMap from "./TileMap";
import { Ext, Headline, n, Row, Table, Warn, fmtMiKm } from "./GeoBits";
import { compassPoint, formatLatLon, inverse, normalizeBearing, pathPoints, VINCENTY_URL } from "@/lib/geodesy";
import { decimalYear, magneticField, WMM_URL } from "@/lib/wmm";
import { AVFORM_URL, rhumb } from "@/lib/rhumb";

function Result({ a, b }: { a: Place; b: Place }) {
  const g = inverse(a, b);
  const rh = rhumb(a, b);
  const now = new Date();
  const mag = magneticField(a.lat, a.lon, 0, decimalYear(now));
  const magBearing = normalizeBearing(g.initialBearing - mag.declination);
  const back = normalizeBearing(g.finalBearing + 180);
  const decl = `${n(Math.abs(mag.declination), 2)}° ${mag.declination >= 0 ? "east" : "west"}`;
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <Headline kicker={`${a.label} → ${b.label}`} title={`${n(g.initialBearing, 1)}° ${compassPoint(g.initialBearing)} (true)`} sub={`${n(magBearing, 1)}° magnetic · ${fmtMiKm(g.metres)}`} />
      <div className="p-5 text-sm">
        {mag.blackout && (
          <Warn title="Near a magnetic pole">
            The horizontal magnetic field here is weak (under 6,000 nT), so a compass is unreliable and the magnetic bearing should not be trusted.
          </Warn>
        )}
        {g.method === "sphere" && <Warn title="Nearly opposite points">The ellipsoid formula did not converge for points this close to antipodal, so a sphere was used.</Warn>}
        <Table>
          <Row k="Initial bearing (true north)">
            {n(g.initialBearing, 2)}° — {compassPoint(g.initialBearing)}
          </Row>
          <Row k="Initial bearing (magnetic)">
            {n(magBearing, 2)}° — declination at the start is {decl} today
          </Row>
          <Row k="Bearing on arrival">
            {n(g.finalBearing, 2)}° — {compassPoint(g.finalBearing)}
          </Row>
          <Row k="Back bearing (B to A, starting)">{n(back, 2)}°</Row>
          <Row k="Constant-heading (rhumb line) bearing">
            {n(rh.bearing, 2)}° — {compassPoint(rh.bearing)} · {fmtMiKm(rh.metres)} along that line
          </Row>
          <Row k="Shortest distance">{fmtMiKm(g.metres, 2)}</Row>
          <Row k="Magnetic declination change">{n(Math.abs(mag.declinationPerYear * 60), 1)}′ per year toward the {mag.declinationPerYear >= 0 ? "east" : "west"}</Row>
          <Row k="From">
            {a.label}
            <span className="block text-xs text-[var(--color-muted)]">{formatLatLon(a)}</span>
          </Row>
          <Row k="To">
            {b.label}
            <span className="block text-xs text-[var(--color-muted)]">{formatLatLon(b)}</span>
          </Row>
        </Table>
        <p className="text-[var(--color-muted)]">
          The initial bearing is the direction to set off along the shortest path. On that path the heading keeps changing (except along a meridian or the equator), which is why the
          arrival bearing differs. The rhumb line keeps one compass heading the whole way and is longer. Magnetic bearing = true bearing − declination (east declination positive).
        </p>
        {mag.outsideValidity && <p className="mt-2">Today&apos;s date is outside WMM2025&apos;s 2025–2030 span, so the declination is extrapolated.</p>}
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          True bearings: Vincenty inverse on WGS84 (<Ext href={VINCENTY_URL}>Vincenty 1975</Ext>). Declination: NOAA/BGS <Ext href={WMM_URL}>World Magnetic Model 2025</Ext> at sea
          level on {now.toLocaleDateString("en-US", { dateStyle: "long" })}; local magnetic anomalies can add a degree or more. Rhumb line: spherical formulas from the{" "}
          <Ext href={AVFORM_URL}>Aviation Formulary</Ext>. Calculated in your browser; places from OpenStreetMap via Photon.
        </footer>
      </div>
    </div>
  );
}

export default function BearingTool() {
  const [pair, setPair] = useState<[Place, Place] | null>(null);
  const [clicks, setClicks] = useState<Place[]>([]);
  const [fitKey, setFitKey] = useState("");

  function onMap(p: { lat: number; lon: number }) {
    const pl: Place = { ...p, label: `${p.lat.toFixed(4)}, ${p.lon.toFixed(4)}` };
    const next = clicks.length >= 2 || clicks.length === 0 ? [pl] : [clicks[0], pl];
    setClicks(next);
    setPair(next.length === 2 ? [next[0], next[1]] : null);
  }
  const shown = pair;
  return (
    <div>
      <PlacePairForm
        submitLabel="Get bearing"
        labels={["From (A)", "To (B)"]}
        onResolve={(a, b) => {
          setPair([a, b]);
          setClicks([]);
          setFitKey(`${a.lat},${a.lon},${b.lat},${b.lon}`);
        }}
      />
      <TileMap
        ariaLabel="Map. Click once for point A and again for point B."
        markers={shown ? [{ ...shown[0], label: "A" }, { ...shown[1], label: "B", color: "#c2410c" }] : clicks.map((c) => ({ ...c, label: "A" }))}
        shapes={shown ? [{ points: pathPoints(shown[0], shown[1], 96) }, { points: [shown[0], shown[1]], dashed: true, color: "#c2410c", width: 1.5 }] : []}
        fitKey={fitKey}
        maxFitZoom={12}
        onPick={onMap}
      />
      <p className="mt-1.5 mb-4 text-xs text-[var(--color-muted)]">Or click the map: first click sets A, second sets B. Solid line: shortest path. Dashed: the straight line on this map, which is the constant-heading rhumb line.</p>
      {shown && <Result a={shown[0]} b={shown[1]} />}
    </div>
  );
}
