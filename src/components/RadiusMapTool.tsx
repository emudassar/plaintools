"use client";

import { useEffect, useId, useMemo, useState } from "react";
import LocationPicker, { type PickedLocation } from "./LocationPicker";
import TileMap from "./TileMap";
import { Ext, Headline, n, n0 } from "./GeoBits";
import { checkInside, ring, type RadiusRing } from "@/lib/radius-map";
import { direct, formatLatLon, VINCENTY_URL, type LatLon } from "@/lib/geodesy";
import { geocodeAddress, parseCoordinates } from "@/lib/geocode";
import { asToolError, isToolError } from "@/lib/errors";

/**
 * Radius rings around a centre. The view is shareable: centre, radii and unit
 * live in the query string (?lat=..&lon=..&r=10,25&u=mi), read on load.
 */

const COLORS = ["#1d4ed8", "#b45309", "#047857", "#7c3aed"];
type Unit = "mi" | "km";

interface Centre extends LatLon {
  label: string;
}

export default function RadiusMapTool() {
  const [centre, setCentre] = useState<Centre | null>(null);
  const [radii, setRadii] = useState("10");
  const [unit, setUnit] = useState<Unit>("mi");
  const [fitKey, setFitKey] = useState("");
  const [placeQ, setPlaceQ] = useState("");
  const [place, setPlace] = useState<(LatLon & { label: string }) | null>(null);
  const [placeErr, setPlaceErr] = useState<string | null>(null);
  const ids = { r: useId(), u: useId(), p: useId() };

  // Restore a shared view.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const lat = Number(q.get("lat")), lon = Number(q.get("lon"));
    if (q.has("lat") && Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
      setCentre({ lat, lon, label: `${lat.toFixed(5)}, ${lon.toFixed(5)}` });
      if (q.get("r")) setRadii(q.get("r")!.slice(0, 40));
      if (q.get("u") === "km") setUnit("km");
      setFitKey("shared");
    }
  }, []);

  const parsed = useMemo(() => {
    const parts = radii.split(/[,\s]+/).filter(Boolean).slice(0, 4).map(Number);
    if (parts.length === 0) return { rings: [] as RadiusRing[], error: "Enter at least one radius." };
    if (!centre) return { rings: [] as RadiusRing[], error: null };
    try {
      return { rings: parts.map((r) => ring(centre, r, unit)), error: null };
    } catch (e) {
      return { rings: [] as RadiusRing[], error: isToolError(e) ? e.message : "Enter radii as numbers, separated by commas." };
    }
  }, [radii, unit, centre]);

  // Keep the URL shareable.
  useEffect(() => {
    if (!centre || parsed.error) return;
    const q = new URLSearchParams({ lat: centre.lat.toFixed(5), lon: centre.lon.toFixed(5), r: radii.replace(/\s+/g, ""), u: unit });
    window.history.replaceState(null, "", `${window.location.pathname}?${q}`);
  }, [centre, radii, unit, parsed.error]);

  function onPick(loc: PickedLocation) {
    setCentre({ lat: loc.lat, lon: loc.lon, label: loc.source === "device" ? "Your location" : loc.label });
    setFitKey(`${loc.lat},${loc.lon},${Date.now()}`);
  }

  async function checkPlace(e: React.FormEvent) {
    e.preventDefault();
    setPlaceErr(null);
    try {
      const c = parseCoordinates(placeQ);
      const hit = c ? { ...c, label: placeQ } : await geocodeAddress(placeQ, { preferUS: false });
      setPlace({ lat: hit.lat, lon: hit.lon, label: hit.label });
    } catch (err) {
      setPlace(null);
      setPlaceErr(asToolError(err).message);
    }
  }

  const rings = parsed.rings;
  const biggest = rings.length ? rings.reduce((a, b) => (b.metres > a.metres ? b : a)) : null;
  const inside = centre && place && rings.length ? checkInside(centre, place, rings) : null;
  const extent = centre && biggest && biggest.metres < 5_000_000
    ? { n: direct(centre, 0, biggest.metres).lat, s: direct(centre, 180, biggest.metres).lat, e: direct(centre, 90, biggest.metres).lon, w: direct(centre, 270, biggest.metres).lon }
    : null;
  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";

  return (
    <div>
      <div className="mb-3 grid gap-3 sm:grid-cols-[1fr_8rem]">
        <div>
          <label htmlFor={ids.r} className="mb-1.5 block font-medium">
            Radius (up to 4, separated by commas)
          </label>
          <input id={ids.r} type="text" inputMode="decimal" value={radii} onChange={(e) => setRadii(e.target.value)} placeholder="10, 25, 50" className={field} />
        </div>
        <div>
          <label htmlFor={ids.u} className="mb-1.5 block font-medium">
            Unit
          </label>
          <select id={ids.u} value={unit} onChange={(e) => setUnit(e.target.value as Unit)} className={field}>
            <option value="mi">miles</option>
            <option value="km">kilometres</option>
          </select>
        </div>
      </div>
      <LocationPicker onPick={onPick} preferUS={false} deviceLabel="Centre on my location" searchLabel="Set centre" label="Or enter the centre: an address, place or coordinates" />

      {centre && (
        <div aria-live="polite" className="rounded-lg border border-[var(--color-line)]">
          <Headline
            kicker={`Centre · ${centre.label}`}
            title={rings.length ? rings.map((r) => `${n(r.radius, r.radius % 1 ? 1 : 0)} ${unit}`).join(" · ") + " radius" : "Enter a radius"}
            sub={formatLatLon(centre)}
          />
          <div className="p-5 text-sm">
            {parsed.error && <p className="mb-4 rounded-md border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-3">{parsed.error}</p>}
            {rings.length > 0 && (
              <div className="mb-5 overflow-x-auto rounded-md border border-[var(--color-line)]">
                <table className="w-full min-w-[30rem] text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-line)] text-left">
                      <th className="px-3 py-2 font-medium">Radius</th>
                      <th className="px-3 py-2 font-medium">Area inside</th>
                      <th className="px-3 py-2 font-medium">Circumference</th>
                      <th className="px-3 py-2 font-medium">Diameter</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-line)]">
                    {rings.map((r, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2">
                          <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i] }} />
                          {n(r.radius, 2)} {unit} ({unit === "mi" ? `${n(r.metres / 1000, 2)} km` : `${n(r.metres / 1609.344, 2)} mi`})
                        </td>
                        <td className="px-3 py-2">
                          {n0(r.areaMi2)} sq mi · {n0(r.areaKm2)} km²
                        </td>
                        <td className="px-3 py-2">
                          {n(r.circumferenceM / 1609.344, 1)} mi · {n(r.circumferenceM / 1000, 1)} km
                        </td>
                        <td className="px-3 py-2">
                          {n((2 * r.metres) / 1609.344, 1)} mi · {n((2 * r.metres) / 1000, 1)} km
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {extent && (
              <p className="mb-4 text-[var(--color-muted)]">
                The largest circle reaches from {Math.abs(extent.s).toFixed(4)}° {extent.s >= 0 ? "N" : "S"} to {Math.abs(extent.n).toFixed(4)}°{" "}
                {extent.n >= 0 ? "N" : "S"} and from {Math.abs(extent.w).toFixed(4)}° {extent.w >= 0 ? "E" : "W"} to {Math.abs(extent.e).toFixed(4)}°{" "}
                {extent.e >= 0 ? "E" : "W"}.
              </p>
            )}
            <form onSubmit={checkPlace} className="mb-4">
              <label htmlFor={ids.p} className="mb-1.5 block font-medium">
                Is a place inside the radius?
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input id={ids.p} type="text" value={placeQ} onChange={(e) => setPlaceQ(e.target.value)} placeholder="Address, city or lat, lon" className={field} />
                <button type="submit" disabled={!placeQ.trim()} className="shrink-0 rounded-md border border-[var(--color-line)] bg-white px-5 py-2.5 font-medium disabled:opacity-50">
                  Check
                </button>
              </div>
              {placeErr && <p className="mt-2 text-[var(--color-muted)]">{placeErr}</p>}
              {inside && place && (
                <p className="mt-2 rounded-md border border-[var(--color-line)] p-3">
                  <strong>{place.label}</strong> is {n(inside.metres / 1609.344, 2)} mi ({n(inside.metres / 1000, 2)} km) from the centre in a
                  straight line —{" "}
                  {rings.map((r, i) => `${inside.inside[i] ? "inside" : "outside"} the ${n(r.radius, 2)} ${unit} circle`).join(", ")}.
                </p>
              )}
            </form>
            <p className="text-[var(--color-muted)]">
              Each circle is every point the same straight-line distance from the centre, measured on the Earth&rsquo;s surface. Web maps
              stretch shapes away from the equator, so a large circle can look slightly egg-shaped — it is still a true radius. Driving
              distance is longer than the radius almost everywhere.
            </p>
            <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
              <p>
                Method: circle points by Vincenty&rsquo;s direct formula on the WGS84 ellipsoid; area and circumference on a sphere of
                mean radius 6,371.0088 km (spherical cap). Calculated in your browser. Map tiles and place names: OpenStreetMap
                contributors. Share this view by copying the page address.
              </p>
              <p className="mt-1">
                <Ext href={VINCENTY_URL}>Vincenty 1975 (NOAA NGS copy)</Ext>
              </p>
            </footer>
          </div>
        </div>
      )}
      {centre && (
        <div className="mt-4">
          <TileMap
            ariaLabel="Radius map. Click anywhere to move the centre."
            markers={[{ lat: centre.lat, lon: centre.lon }, ...(place ? [{ lat: place.lat, lon: place.lon, label: "Place", color: "#b91c1c" }] : [])]}
            shapes={rings.map((r, i) => ({ points: r.points, fill: true, color: COLORS[i] }))}
            fitKey={`${fitKey}|${biggest?.metres ?? 0}`}
            onPick={(p) => setCentre({ ...p, label: `${p.lat.toFixed(5)}, ${p.lon.toFixed(5)}` })}
            height={420}
          />
          <p className="mt-1.5 text-xs text-[var(--color-muted)]">Click the map to move the centre. Drag to pan; use + and − to zoom.</p>
        </div>
      )}
    </div>
  );
}
