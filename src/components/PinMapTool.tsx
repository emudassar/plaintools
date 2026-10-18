"use client";

import { useEffect, useState } from "react";
import LocationPicker from "./LocationPicker";
import TileMap from "./TileMap";
import CopyRow from "./CopyRow";
import { Btn } from "./ToolBits";
import { fieldClass } from "./CalcBits";
import { PALETTE } from "@/lib/projected";
import { toCsv, toGeoJson, toKml, type GeoCollection } from "@/lib/geo-formats";
import { downloadText } from "@/lib/svg-export";

interface Pin {
  lat: number;
  lon: number;
  label: string;
  color: string;
}

/** Pins live in the URL fragment (#pins=...), which browsers never send to the server. */
function encodePins(pins: Pin[]): string {
  return pins.map((p) => [p.lat.toFixed(5), p.lon.toFixed(5), encodeURIComponent(p.label), p.color.replace("#", "")].join(",")).join(";");
}
function decodePins(s: string): Pin[] {
  return s
    .split(";")
    .map((x) => x.split(","))
    .filter((a) => a.length >= 4)
    .map(([lat, lon, label, color]) => ({ lat: Number(lat), lon: Number(lon), label: decodeURIComponent(label), color: /^[0-9a-f]{6}$/i.test(color) ? `#${color}` : PALETTE[0] }))
    .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon) && Math.abs(p.lat) <= 90 && Math.abs(p.lon) <= 180)
    .slice(0, 300);
}

export default function PinMapTool() {
  const [pins, setPins] = useState<Pin[]>([]);
  const [color, setColor] = useState(PALETTE[2]);
  const [fitKey, setFitKey] = useState("");
  const [showLabels, setShowLabels] = useState(true);
  const [link, setLink] = useState("");

  useEffect(() => {
    const m = location.hash.match(/pins=([^&]*)/);
    if (m) {
      const p = decodePins(m[1]);
      if (p.length) {
        setPins(p);
        setFitKey("hash");
      }
    }
  }, []);

  const add = (p: { lat: number; lon: number }, label: string) => setPins((xs) => [...xs, { lat: p.lat, lon: p.lon, label, color }]);
  const fc: GeoCollection = {
    type: "FeatureCollection",
    features: pins.map((p) => ({ type: "Feature", properties: { name: p.label, color: p.color }, geometry: { type: "Point", coordinates: [p.lon, p.lat] } })),
  };

  return (
    <div>
      <LocationPicker
        onPick={(l) => {
          add(l, l.source === "device" ? "My location" : l.source === "coordinates" ? l.label : l.label.split(",")[0]);
          setFitKey(String(Date.now()));
        }}
        preferUS={false}
        deviceLabel="Pin my location"
        searchLabel="Add pin"
        label="Add a pin by address or place — or click the map"
        placeholder="Address, place or coordinates"
      />
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium">New pin colour:</span>
        {PALETTE.slice(0, 10).map((c) => (
          <button key={c} type="button" onClick={() => setColor(c)} aria-label={`Colour ${c}`} aria-pressed={color === c} className="h-6 w-6 rounded-full border" style={{ background: c, outline: color === c ? "3px solid #111" : undefined, outlineOffset: 1 }} />
        ))}
        <label className="ml-2 flex items-center gap-1 text-sm">
          <input type="checkbox" checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} /> Labels
        </label>
      </div>
      <TileMap
        ariaLabel="Map. Click to drop a pin."
        markers={pins.map((p) => ({ lat: p.lat, lon: p.lon, color: p.color, r: 8, label: showLabels && p.label ? p.label : undefined }))}
        fitKey={fitKey}
        maxFitZoom={14}
        height={460}
        onPick={(p) => add(p, `Pin ${pins.length + 1}`)}
      />
      <p className="mt-1.5 text-xs text-[var(--color-muted)]">Click the map to drop a pin. Edit labels and colours below.</p>

      {pins.length > 0 && (
        <>
          <div className="mt-3 max-h-80 overflow-auto rounded-md border border-[var(--color-line)]">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-[var(--color-line)]">
                {pins.map((p, i) => (
                  <tr key={i}>
                    <td className="px-2 py-1.5">
                      <input type="color" value={p.color} onChange={(e) => setPins((xs) => xs.map((x, j) => (j === i ? { ...x, color: e.target.value } : x)))} aria-label={`Colour of pin ${i + 1}`} className="h-7 w-8" />
                    </td>
                    <td className="px-2 py-1.5">
                      <input className={`${fieldClass} py-1.5`} value={p.label} onChange={(e) => setPins((xs) => xs.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} aria-label={`Label of pin ${i + 1}`} />
                    </td>
                    <td className="px-2 py-1.5 font-mono text-xs whitespace-nowrap">
                      {p.lat.toFixed(5)}, {p.lon.toFixed(5)}
                    </td>
                    <td className="px-2 py-1.5">
                      <button type="button" className="rounded border border-[var(--color-line)] px-2 py-1 text-xs" onClick={() => setPins((xs) => xs.filter((_, j) => j !== i))} aria-label={`Remove pin ${i + 1}`}>
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Btn
              primary
              onClick={() => {
                const url = `${location.origin}${location.pathname}#pins=${encodePins(pins)}`;
                history.replaceState(null, "", url);
                setLink(url);
              }}
            >
              Make a share link
            </Btn>
            <Btn onClick={() => downloadText(toKml(fc, "Pin map"), "pin-map.kml", "application/vnd.google-earth.kml+xml")}>KML (Google Earth / My Maps)</Btn>
            <Btn onClick={() => downloadText(toGeoJson(fc), "pin-map.geojson", "application/geo+json")}>GeoJSON</Btn>
            <Btn onClick={() => downloadText(toCsv([["label", "latitude", "longitude", "color"], ...pins.map((p) => [p.label, p.lat.toFixed(6), p.lon.toFixed(6), p.color])]), "pin-map.csv", "text/csv")}>CSV</Btn>
            <Btn onClick={() => { setPins([]); setLink(""); history.replaceState(null, "", location.pathname); }}>Clear all</Btn>
          </div>
          {link && (
            <table className="mt-3 w-full rounded-md border border-[var(--color-line)] text-sm">
              <tbody>
                <CopyRow label="Share link" value={link} />
              </tbody>
            </table>
          )}
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            The share link carries the pins after the # in the address. That part is never sent to any server, so this site stores nothing — anyone with the link sees the same pins. Up to 300 pins.
          </p>
        </>
      )}
    </div>
  );
}
