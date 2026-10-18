"use client";

import { useEffect, useMemo, useState } from "react";
import TileMap, { type MapShape } from "./TileMap";
import { ErrorBox, Ext, Loading, n, n0 } from "./GeoBits";
import { fieldClass } from "./CalcBits";
import { loadWorld, NATURAL_EARTH_URL, type WorldCountry } from "@/lib/point-info";
import { sphericalArea, SQM } from "@/lib/polygon-area";
import { normalizeLon, type LatLon } from "@/lib/geodesy";
import { asToolError } from "@/lib/errors";
import centers from "@/data/geo-centers.json";

const RAD = Math.PI / 180;
type V = [number, number, number];
const vec = (p: LatLon): V => [Math.cos(p.lat * RAD) * Math.cos(p.lon * RAD), Math.cos(p.lat * RAD) * Math.sin(p.lon * RAD), Math.sin(p.lat * RAD)];
const unvec = ([x, y, z]: V): LatLon => ({ lat: Math.atan2(z, Math.hypot(x, y)) / RAD, lon: Math.atan2(y, x) / RAD });
const cross = (a: V, b: V): V => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** Rigid rotation of the sphere carrying `from` to `to` (Rodrigues' formula): shape and area are unchanged. */
function rotator(from: LatLon, to: LatLon): (p: LatLon) => LatLon {
  const a = vec(from), b = vec(to);
  let k = cross(a, b);
  const s = Math.hypot(...k), c = dot(a, b);
  if (s < 1e-12) return c > 0 ? (p) => p : (p) => ({ lat: -p.lat, lon: normalizeLon(p.lon + 180) });
  k = [k[0] / s, k[1] / s, k[2] / s];
  return (p) => {
    const v = vec(p);
    const kv = cross(k, v), kd = dot(k, v);
    return unvec([v[0] * c + kv[0] * s + k[0] * kd * (1 - c), v[1] * c + kv[1] * s + k[1] * kd * (1 - c), v[2] * c + kv[2] * s + k[2] * kd * (1 - c)]);
  };
}

const centreOf = (id: string): LatLon | null => {
  const c = (centers.countries as { id: string; lat: number; lon: number; mainLat?: number; mainLon?: number }[]).find((x) => x.id === id);
  return c ? { lat: c.mainLat ?? c.lat, lon: c.mainLon ?? c.lon } : null;
};
const areaOf = (c: WorldCountry) => c.polygons.reduce((s, poly) => s + sphericalArea(poly[0]) - poly.slice(1).reduce((h, r) => h + sphericalArea(r), 0), 0);

export default function CountrySizeTool() {
  const [world, setWorld] = useState<WorldCountry[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [aId, setAId] = useState("GRL");
  const [bId, setBId] = useState("AUS");
  const [target, setTarget] = useState<LatLon | null>(null);
  const [fitKey, setFitKey] = useState("start");

  useEffect(() => {
    loadWorld().then(setWorld, (e) => setErr(asToolError(e).message));
  }, []);
  const sorted = useMemo(() => (world ? [...world].filter((c) => centreOf(c.id)).sort((x, y) => x.name.localeCompare(y.name)) : []), [world]);
  if (err) return <ErrorBox title="The world outline did not load" message={err} onRetry={() => location.reload()} />;
  if (!world) return <Loading note="Loading country outlines…" />;

  const A = world.find((c) => c.id === aId), B = world.find((c) => c.id === bId);
  if (!A || !B) return null;
  const from = centreOf(A.id)!;
  const to = target ?? centreOf(B.id)!;
  const rot = rotator(from, to);
  const moved = A.polygons.map((poly) => poly.map((ring) => ring.map(rot)));
  const ring = (polys: LatLon[][][], color: string, op: number, dashed = false): MapShape[] => polys.map((poly) => ({ points: poly[0], more: poly.slice(1), fill: true, color, fillOpacity: op, width: 2, dashed }));
  const aArea = areaOf(A), bArea = areaOf(B);
  const ratio = aArea / bArea;

  const pick = (label: string, v: string, set: (s: string) => void) => (
    <label className="block">
      <span className="mb-1.5 block font-medium">{label}</span>
      <select
        className={fieldClass}
        value={v}
        onChange={(e) => {
          set(e.target.value);
          setTarget(null);
          setFitKey(String(Date.now()));
        }}
      >
        {sorted.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div>
      <div className="mb-3 grid gap-3 sm:grid-cols-2">
        {pick("Move this country…", aId, setAId)}
        {pick("…on top of this one", bId, setBId)}
      </div>
      <div className="mb-4 rounded-lg border border-[var(--color-line)]">
        <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
          <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
            {A.name} compared with {B.name}
          </p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">
            {ratio >= 1 ? `${A.name} is about ${n(ratio, ratio < 10 ? 2 : 1)}× the size of ${B.name}` : `${A.name} is about ${n(ratio * 100, 0)}% the size of ${B.name}`}
          </p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {A.name} ≈ {n0(aArea / SQM.sqkm)} km² ({n0(aArea / SQM.sqmi)} sq mi) · {B.name} ≈ {n0(bArea / SQM.sqkm)} km² ({n0(bArea / SQM.sqmi)} sq mi) — measured from the outlines shown
          </p>
        </div>
        <div className="p-4">
          <TileMap
            ariaLabel={`World map with ${A.name} moved over ${B.name}. Click to move it elsewhere.`}
            shapes={[...ring(A.polygons, "#1d4ed8", 0.1, true), ...ring(B.polygons, "#15803d", 0.15), ...ring(moved, "#c2410c", 0.35)]}
            fitKey={`${fitKey}${target ? `${target.lat},${target.lon}` : ""}`}
            fitTo={[...B.polygons.map((p) => p[0]), ...moved.map((p) => p[0])].sort((x, y) => y.length - x.length).slice(0, 2).flat()}
            maxFitZoom={5}
            height={480}
            onPick={(p) => setTarget(p)}
          />
          <p className="mt-2 flex flex-wrap gap-4 text-xs">
            <span><span className="mr-1 inline-block h-3 w-3 rounded-sm bg-[#c2410c]" />{A.name}, moved (true size)</span>
            <span><span className="mr-1 inline-block h-3 w-3 rounded-sm bg-[#15803d]" />{B.name}</span>
            <span><span className="mr-1 inline-block h-3 w-3 rounded-sm border border-dashed border-[#1d4ed8]" />{A.name} where it really is</span>
          </p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Click anywhere on the map to drop {A.name} there instead and watch its size change as it moves north or south. The web map uses the Mercator projection, which enlarges
            shapes away from the equator (by 1 / cos² of the latitude in area): Greenland looks as big as Africa, but is about a fourteenth of its size.
          </p>
          <p className="mt-3 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
            Outlines: <Ext href={NATURAL_EARTH_URL}>Natural Earth 1:110m countries</Ext> (public domain), so small islands are missing and areas are approximate. The country is moved by rotating the
            globe so its centre lands on the target — a rigid move that keeps its real shape and area; only the map&apos;s projection changes how it looks. Areas: ellipsoidal, from those outlines.
          </p>
        </div>
      </div>
    </div>
  );
}
