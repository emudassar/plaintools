"use client";

import { useState } from "react";
import PlacePairForm, { type Place } from "./PlacePairForm";
import TileMap from "./TileMap";
import { Ext, Headline, n, Row, Table, Warn } from "./GeoBits";
import { compassPoint, formatLatLon, haversine, inverse, pathPoints, VINCENTY_URL, type InverseResult, type LatLon } from "@/lib/geodesy";

interface Result {
  a: Place;
  b: Place;
  geo: InverseResult;
  sphere: InverseResult;
}

function compute(a: Place, b: Place): Result {
  return { a, b, geo: inverse(a, b), sphere: haversine(a, b) };
}

function ResultCard({ r }: { r: Result }) {
  const m = r.geo.metres;
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <Headline
        kicker={`${r.a.label} → ${r.b.label}`}
        title={`${n(m / 1609.344)} miles`}
        sub={`${n(m / 1000)} km · ${n(m / 1852)} nautical miles · straight line`}
      />
      <div className="p-5 text-sm">
        {r.geo.method === "sphere" && (
          <Warn title="Nearly opposite sides of the Earth">
            For almost antipodal points the ellipsoid formula does not converge, so this distance uses a sphere of the mean Earth radius
            instead — a slightly less exact model, shown alongside below.
          </Warn>
        )}
        <Table>
          <Row k="Miles (statute)">{n(m / 1609.344, 2)}</Row>
          <Row k="Kilometres">{n(m / 1000, 2)}</Row>
          <Row k="Nautical miles">{n(m / 1852, 2)}</Row>
          <Row k="Initial bearing">
            {n(r.geo.initialBearing, 1)}° ({compassPoint(r.geo.initialBearing)}) from true north
          </Row>
          <Row k="Bearing on arrival">
            {n(r.geo.finalBearing, 1)}° ({compassPoint(r.geo.finalBearing)})
          </Row>
          <Row k="Same distance on a perfect sphere">
            {n(r.sphere.metres / 1609.344, 2)} mi ({n(r.sphere.metres / 1000, 2)} km) — differs by {n(Math.abs(r.sphere.metres - m) / 1000, 2)} km
          </Row>
          <Row k="From">
            {r.a.label}
            <span className="block text-xs text-[var(--color-muted)]">{formatLatLon(r.a)}</span>
          </Row>
          <Row k="To">
            {r.b.label}
            <span className="block text-xs text-[var(--color-muted)]">{formatLatLon(r.b)}</span>
          </Row>
        </Table>
        <p className="text-[var(--color-muted)]">
          &ldquo;As the crow flies&rdquo; is the shortest path over the Earth&rsquo;s surface (a geodesic), ignoring roads, terrain and
          height. On a flat map it often looks curved — that curve is the straight line. The bearing changes along the way except on a
          meridian or the equator, which is why the arrival bearing differs from the starting one.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Method: Vincenty (1975) inverse formula on the WGS84 ellipsoid (a = 6,378,137 m, f = 1/298.257223563); sphere comparison uses
            the mean radius 6,371.0088 km. Calculated in your browser. Place coordinates: OpenStreetMap via Photon.
          </p>
          <p className="mt-1">
            <Ext href={VINCENTY_URL}>Vincenty 1975 (NOAA NGS copy)</Ext>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function CrowFliesTool() {
  const [r, setR] = useState<Result | null>(null);
  const [next, setNext] = useState<"a" | "b">("a");
  const [fitKey, setFitKey] = useState("");

  function onResolve(a: Place, b: Place) {
    setR(compute(a, b));
    setFitKey(`${a.lat},${a.lon},${b.lat},${b.lon}`);
  }
  function pick(p: LatLon) {
    if (!r) return;
    const pl: Place = { ...p, label: `Map point ${p.lat.toFixed(4)}, ${p.lon.toFixed(4)}` };
    setR(next === "a" ? compute(pl, r.b) : compute(r.a, pl));
    setNext(next === "a" ? "b" : "a");
  }

  return (
    <div>
      <PlacePairForm onResolve={onResolve} submitLabel="Measure the distance" />
      <div aria-live="polite">{r && <ResultCard r={r} />}</div>
      {r && (
        <div className="mt-4">
          <TileMap
            ariaLabel="Map of the straight-line route. Clicking moves the start and end points in turn."
            markers={[
              { lat: r.a.lat, lon: r.a.lon, label: "A" },
              { lat: r.b.lat, lon: r.b.lon, label: "B", color: "#b45309" },
            ]}
            shapes={[{ points: pathPoints(r.a, r.b, 96) }]}
            fitKey={fitKey}
            onPick={pick}
          />
          <p className="mt-1.5 text-xs text-[var(--color-muted)]">
            Click the map to move point {next === "a" ? "A" : "B"} (clicks alternate between A and B).
          </p>
        </div>
      )}
    </div>
  );
}
