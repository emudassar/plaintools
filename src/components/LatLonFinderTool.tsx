"use client";

import { useEffect, useState } from "react";
import LocationPicker, { type PickedLocation } from "./LocationPicker";
import TileMap from "./TileMap";
import { Ext } from "./GeoBits";
import { fmtDms, fmtDmm, toMgrs, toUtm } from "@/lib/coords";
import { reverseGeocode } from "@/lib/geocode";
import type { LatLon } from "@/lib/geodesy";

function CopyRow({ label, value }: { label: string; value: string }) {
  const [done, setDone] = useState(false);
  return (
    <tr>
      <td className="px-3 py-2 font-medium">{label}</td>
      <td className="px-3 py-2 font-mono text-xs sm:text-sm">{value}</td>
      <td className="px-3 py-2 text-right">
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard?.writeText(value);
            setDone(true);
            setTimeout(() => setDone(false), 1200);
          }}
          className="rounded border border-[var(--color-line)] bg-white px-2 py-1 text-xs"
        >
          {done ? "Copied" : "Copy"}
        </button>
      </td>
    </tr>
  );
}

export default function LatLonFinderTool() {
  const [p, setP] = useState<(LatLon & { label?: string; accuracyM?: number | null }) | null>(null);
  const [place, setPlace] = useState<string | null>(null);
  const [fitKey, setFitKey] = useState("");

  useEffect(() => {
    if (!p) return;
    let live = true;
    setPlace(null);
    const t = setTimeout(() => void reverseGeocode(p.lat, p.lon, { delays: [0] }).then((s) => live && setPlace(s)), 400);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [p]);

  function picked(loc: PickedLocation) {
    setP({ lat: loc.lat, lon: loc.lon, label: loc.label, accuracyM: loc.accuracyM });
    setFitKey(`${loc.lat},${loc.lon}`);
  }

  let utm = "", mgrs = "";
  if (p && p.lat > -80 && p.lat < 84) {
    const u = toUtm(p);
    utm = `${u.zone}${u.band} ${Math.round(u.easting)} E ${Math.round(u.northing)} N`;
    mgrs = toMgrs(p);
  }

  return (
    <div>
      <LocationPicker onPick={picked} preferUS={false} deviceLabel="Get my coordinates" searchLabel="Find" placeholder="Address, landmark or place name" label="Or search for a place" />
      <TileMap
        ariaLabel="Map. Click anywhere to get its latitude and longitude."
        markers={p ? [{ lat: p.lat, lon: p.lon }] : []}
        fitKey={fitKey}
        maxFitZoom={15}
        height={380}
        onPick={(q) => setP({ ...q })}
      />
      <p className="mt-1.5 mb-4 text-xs text-[var(--color-muted)]">Click anywhere on the map to drop the pin there. Drag to move around; use + and − to zoom.</p>

      {p ? (
        <div className="rounded-lg border border-[var(--color-line)]">
          <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
            <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">Latitude, longitude</p>
            <p className="mt-1 font-mono text-2xl font-semibold tracking-tight">
              {p.lat.toFixed(6)}, {p.lon.toFixed(6)}
            </p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{place ?? p.label ?? "Looking up the nearest place name…"}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-[var(--color-line)]">
                <CopyRow label="Latitude" value={p.lat.toFixed(6)} />
                <CopyRow label="Longitude" value={p.lon.toFixed(6)} />
                <CopyRow label="Decimal degrees" value={`${p.lat.toFixed(6)}, ${p.lon.toFixed(6)}`} />
                <CopyRow label="Degrees, minutes, seconds" value={`${fmtDms(p.lat, true, 2)} ${fmtDms(p.lon, false, 2)}`} />
                <CopyRow label="Degrees, decimal minutes" value={`${fmtDmm(p.lat, true, 4)} ${fmtDmm(p.lon, false, 4)}`} />
                {utm && <CopyRow label="UTM (WGS84)" value={utm} />}
                {mgrs && <CopyRow label="MGRS (1 m)" value={mgrs} />}
              </tbody>
            </table>
          </div>
          <p className="border-t border-[var(--color-line)] px-4 py-3 text-xs text-[var(--color-muted)]">
            WGS84 coordinates (the GPS datum). Six decimal places is about 0.1 m — finer than any map click or phone fix.
            {p.accuracyM ? ` Your device reported its position to within about ${Math.round(p.accuracyM)} m.` : ""} Place name: OpenStreetMap via{" "}
            <Ext href="https://photon.komoot.io">Photon</Ext>.
          </p>
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-[var(--color-line)] p-5 text-sm text-[var(--color-muted)]">Click the map, search a place or use your location to see coordinates here.</p>
      )}
    </div>
  );
}
