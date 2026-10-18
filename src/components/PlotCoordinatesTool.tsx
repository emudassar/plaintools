"use client";

import { useMemo, useState } from "react";
import TileMap from "./TileMap";
import { fmtMiKm } from "./GeoBits";
import { parseLatLon } from "@/lib/coords";
import { inverse, type LatLon } from "@/lib/geodesy";
import { toCsv, toGeoJson, toKml, type GeoCollection } from "@/lib/geo-formats";
import { downloadText } from "@/lib/svg-export";

interface Pt extends LatLon {
  label: string;
  line: number;
}

/**
 * Reads "lat, lon", "lat, lon, label", "label, lat, lon", "label<TAB>lat<TAB>lon" or a
 * whole line of DMS. Returns the point and whatever text is left as the label.
 */
export function parseLine(line: string): { p: LatLon; label: string } | null {
  const whole = parseLatLon(line);
  if (whole) return { p: whole, label: "" };
  const parts = line.split(/\s*[,;\t|]\s*/).filter((s) => s !== "");
  for (let i = 0; i + 1 < parts.length; i++) {
    const p = parseLatLon(`${parts[i]}, ${parts[i + 1]}`);
    if (p) {
      const label = [...parts.slice(0, i), ...parts.slice(i + 2)].join(", ").replace(/^["']|["']$/g, "");
      return { p, label };
    }
  }
  const colon = line.match(/^(.*?):\s*(.+)$/);
  if (colon) {
    const p = parseLatLon(colon[2]);
    if (p) return { p, label: colon[1].trim() };
  }
  return null;
}

const SAMPLE = "Statue of Liberty, 40.689247, -74.044502\nEmpire State Building, 40.748817, -73.985428\nCentral Park, 40°46′56″N 73°57′55″W\n40.7061, -73.9969, Brooklyn Bridge";

export default function PlotCoordinatesTool() {
  const [text, setText] = useState(SAMPLE);
  const [connect, setConnect] = useState(false);
  const [labels, setLabels] = useState(true);
  const [fitKey, setFitKey] = useState("start");

  const { pts, bad } = useMemo(() => {
    const pts: Pt[] = [];
    const bad: number[] = [];
    text.split(/\r?\n/).forEach((raw, i) => {
      const line = raw.trim();
      if (!line || line.startsWith("#")) return;
      const r = parseLine(line);
      if (r) pts.push({ ...r.p, label: r.label, line: i + 1 });
      else bad.push(i + 1);
    });
    return { pts: pts.slice(0, 1000), bad };
  }, [text]);

  const routeM = useMemo(() => pts.slice(1).reduce((s, p, i) => s + inverse(pts[i], p).metres, 0), [pts]);

  const fc: GeoCollection = {
    type: "FeatureCollection",
    features: [
      ...pts.map((p, i) => ({ type: "Feature" as const, geometry: { type: "Point" as const, coordinates: [p.lon, p.lat] as [number, number] }, properties: { name: p.label || `Point ${i + 1}` } })),
      ...(connect && pts.length > 1 ? [{ type: "Feature" as const, geometry: { type: "LineString" as const, coordinates: pts.map((p) => [p.lon, p.lat] as [number, number]) }, properties: { name: "Route" } }] : []),
    ],
  };

  const btn = "rounded-md border border-[var(--color-line)] bg-white px-3 py-2 text-sm font-medium disabled:opacity-50";

  return (
    <div>
      <label htmlFor="plot" className="mb-1.5 block font-medium">
        Coordinates — one point per line, with an optional label
      </label>
      <textarea id="plot" rows={7} value={text} onChange={(e) => setText(e.target.value)} className="w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5 font-mono text-sm" />
      <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        <button type="button" className="rounded-md bg-[var(--color-accent)] px-5 py-2.5 font-medium text-white" onClick={() => setFitKey(String(Date.now()))}>
          Plot {pts.length} point{pts.length === 1 ? "" : "s"}
        </button>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={connect} onChange={(e) => setConnect(e.target.checked)} /> Join in order as a route
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={labels} onChange={(e) => setLabels(e.target.checked)} /> Show labels
        </label>
        <button type="button" className="text-[var(--color-accent)] underline" onClick={() => setText("")}>
          Clear
        </button>
      </div>
      {bad.length > 0 && (
        <p className="mt-2 rounded-md border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-2 text-sm">
          Could not read line{bad.length > 1 ? "s" : ""} {bad.slice(0, 15).join(", ")}
          {bad.length > 15 ? "…" : ""}. Use latitude then longitude, e.g. 40.6892, -74.0445 or 40°41′21″N 74°2′40″W.
        </p>
      )}

      <div className="mt-4">
        <TileMap
          ariaLabel="Map of the plotted coordinates"
          height={440}
          markers={pts.map((p, i) => ({ lat: p.lat, lon: p.lon, label: labels ? p.label || String(i + 1) : undefined }))}
          shapes={connect && pts.length > 1 ? [{ points: pts }] : []}
          fitKey={`${fitKey}-${pts.length}`}
          maxFitZoom={15}
        />
      </div>

      {pts.length > 0 && (
        <div className="mt-4 rounded-lg border border-[var(--color-line)] p-4 text-sm">
          <p>
            <strong className="font-medium">{pts.length}</strong> point{pts.length === 1 ? "" : "s"} plotted
            {pts.length > 1 && (
              <>
                {" "}
                · straight-line distance through them in order: <strong className="font-medium">{fmtMiKm(routeM, 2)}</strong>
              </>
            )}
            {pts.length > 1 && (
              <>
                {" "}
                · bounding box {Math.min(...pts.map((p) => p.lat)).toFixed(4)}° to {Math.max(...pts.map((p) => p.lat)).toFixed(4)}° lat,{" "}
                {Math.min(...pts.map((p) => p.lon)).toFixed(4)}° to {Math.max(...pts.map((p) => p.lon)).toFixed(4)}° lon
              </>
            )}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className={btn} onClick={() => downloadText(toGeoJson(fc), "points.geojson", "application/geo+json")}>
              Download GeoJSON
            </button>
            <button type="button" className={btn} onClick={() => downloadText(toKml(fc, "Plotted points"), "points.kml", "application/vnd.google-earth.kml+xml")}>
              Download KML
            </button>
            <button
              type="button"
              className={btn}
              onClick={() => downloadText(toCsv([["label", "latitude", "longitude"], ...pts.map((p, i) => [p.label || `Point ${i + 1}`, p.lat.toFixed(6), p.lon.toFixed(6)])]), "points.csv", "text/csv")}
            >
              Download CSV
            </button>
          </div>
          <p className="mt-3 text-xs text-[var(--color-muted)]">
            Distances are geodesic (Vincenty, WGS84) between consecutive points, not road distances. Everything is computed in your browser; map tiles © OpenStreetMap contributors.
          </p>
        </div>
      )}
    </div>
  );
}
