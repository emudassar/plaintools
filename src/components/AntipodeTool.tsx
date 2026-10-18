"use client";

import { useEffect, useState } from "react";
import LocationPicker, { type PickedLocation } from "./LocationPicker";
import TileMap, { type MapShape } from "./TileMap";
import CopyRow from "./CopyRow";
import { Ext, fmtMiKm, Loading, where } from "./GeoBits";
import { antipode, toEcef } from "@/lib/antipode";
import { fmtDms } from "@/lib/coords";
import { loadWorld, NATURAL_EARTH_URL, pointInfo, type PointInfo } from "@/lib/point-info";
import { OPEN_METEO_DOCS_URL } from "@/lib/elevation";
import type { LatLon } from "@/lib/geodesy";

/** Half the WGS84 meridian circumference — the surface distance to any antipode along a meridian. */
const HALF_MERIDIAN_M = 20_003_931;

function Describe({ info, label }: { info: PointInfo | null; label: string }) {
  if (!info) return <p className="text-sm text-[var(--color-muted)]">Checking what is at the {label}…</p>;
  const near = info.place && info.placeM !== null ? (info.placeM < 25_000 ? info.place : `Open area — the nearest named place is ${info.place}, ${fmtMiKm(info.placeM, 0)} away`) : null;
  return (
    <p className="text-sm">
      <strong>{info.water === null ? "Unknown surface" : info.water ? "Water" : `Land, ${Math.round(info.elevationM ?? 0).toLocaleString("en-US")} m above sea level`}</strong>
      {near ? ` · ${near}` : ""}
    </p>
  );
}

export default function AntipodeTool() {
  const [loc, setLoc] = useState<(LatLon & { label: string; source: string }) | null>(null);
  const [info, setInfo] = useState<{ here: PointInfo | null; there: PointInfo | null }>({ here: null, there: null });
  const [overlay, setOverlay] = useState(false);
  const [land, setLand] = useState<MapShape[] | null>(null);
  const [fitKey, setFitKey] = useState("");

  useEffect(() => {
    if (!loc) return;
    let live = true;
    setInfo({ here: null, there: null });
    const a = antipode(loc);
    void pointInfo(loc).then((here) => live && setInfo((s) => ({ ...s, here })));
    void pointInfo(a).then((there) => live && setInfo((s) => ({ ...s, there })));
    return () => {
      live = false;
    };
  }, [loc]);

  useEffect(() => {
    if (!overlay || land) return;
    void loadWorld().then((w) =>
      setLand(
        w.flatMap((c) =>
          c.polygons.map((poly) => {
            const flip = (ring: LatLon[]) => ring.map((p) => antipode(p));
            return { points: flip(poly[0]), more: poly.slice(1).map(flip), fill: true, color: "#c2410c", fillOpacity: 0.35, width: 1 };
          }),
        ),
      ),
    );
  }, [overlay, land]);

  const pick = (l: PickedLocation) => {
    setLoc({ lat: l.lat, lon: l.lon, label: l.label, source: l.source });
    setFitKey(`${l.lat},${l.lon}`);
  };
  const a = loc ? antipode(loc) : null;

  return (
    <div>
      <LocationPicker onPick={pick} preferUS={false} deviceLabel="Find my antipode" placeholder="Any address, city or coordinates" />
      <label className="mb-3 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={overlay} onChange={(e) => setOverlay(e.target.checked)} />
        Show the antipodes of all land (orange) — where land lies opposite land
      </label>
      {a && loc ? (
        <div className="mb-4 rounded-lg border border-[var(--color-line)]">
          <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
            <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">Antipode of {where(loc, loc.source)}</p>
            <p className="mt-1 font-mono text-2xl font-semibold tracking-tight">
              {a.lat.toFixed(6)}, {a.lon.toFixed(6)}
            </p>
            <div className="mt-2">
              <Describe info={info.there} label="antipode" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-[var(--color-line)]">
                <CopyRow label="Antipode (decimal)" value={`${a.lat.toFixed(6)}, ${a.lon.toFixed(6)}`} />
                <CopyRow label="Antipode (DMS)" value={`${fmtDms(a.lat, true, 1)}, ${fmtDms(a.lon, false, 1)}`} />
                <tr>
                  <td className="px-3 py-2 font-medium">Your point</td>
                  <td className="px-3 py-2" colSpan={2}>
                    {loc.lat.toFixed(6)}, {loc.lon.toFixed(6)}
                    <Describe info={info.here} label="starting point" />
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-medium">Distance between them</td>
                  <td className="px-3 py-2" colSpan={2}>
                    {fmtMiKm(HALF_MERIDIAN_M, 0)} over the surface (half the Earth&apos;s circumference through the poles) · {fmtMiKm(2 * Math.hypot(...toEcef(loc.lat, loc.lon)), 0)} in a straight line through the centre
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="border-t border-[var(--color-line)] px-4 py-3 text-xs text-[var(--color-muted)]">
            Antipode: latitude reversed, longitude moved 180° — exact on the WGS84 ellipsoid, which is symmetric about its centre. Land or water: Copernicus GLO-90 elevation via{" "}
            <Ext href={OPEN_METEO_DOCS_URL}>Open-Meteo</Ext> (0 m reads as open water). Place names: OpenStreetMap via <Ext href="https://photon.komoot.io">Photon</Ext>. Land overlay:{" "}
            <Ext href={NATURAL_EARTH_URL}>Natural Earth 1:110m</Ext>, so small islands are missing from it.
          </p>
        </div>
      ) : (
        <p className="mb-4 rounded-lg border border-dashed border-[var(--color-line)] p-5 text-sm text-[var(--color-muted)]">Search a place, use your location or click the map to see the point on the opposite side of the Earth.</p>
      )}
      {!land && overlay && <Loading note="Loading the world outline…" />}
      <TileMap
        ariaLabel="World map. Click anywhere to find the antipode of that point."
        markers={a && loc ? [{ ...loc, label: "Start", color: "#1d4ed8" }, { ...a, label: "Antipode", color: "#c2410c" }] : []}
        shapes={overlay && land ? land : []}
        fitKey={fitKey}
        initial={{ lat: 20, lon: 0, zoom: 1 }}
        maxFitZoom={2}
        height={420}
        onPick={(p) => setLoc({ ...p, label: `Map point ${p.lat.toFixed(4)}, ${p.lon.toFixed(4)}`, source: "map" })}
      />
      <p className="mt-1.5 text-xs text-[var(--color-muted)]">Click anywhere on the map to set the starting point there. Most of the world&apos;s land lies opposite ocean.</p>
    </div>
  );
}
