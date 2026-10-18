"use client";

import { useState } from "react";
import LocationPicker from "./LocationPicker";
import TileMap from "./TileMap";
import { Ext, n } from "./GeoBits";
import { Btn } from "./ToolBits";
import { CHAMBERLAIN_URL, perimeter, selfIntersects, SNYDER_URL, sphericalArea, SQM } from "@/lib/polygon-area";
import { toGeoJson, toKml, type GeoCollection } from "@/lib/geo-formats";
import { downloadText } from "@/lib/svg-export";
import type { LatLon } from "@/lib/geodesy";

export default function MapAreaTool() {
  const [pts, setPts] = useState<LatLon[]>([]);
  const [view, setView] = useState<{ lat: number; lon: number; zoom: number } | undefined>(undefined);

  const area = pts.length >= 3 ? sphericalArea(pts) : 0;
  const per = pts.length >= 2 ? perimeter(pts, pts.length >= 3) : 0;
  const crossing = selfIntersects(pts);
  const fc: GeoCollection = { type: "FeatureCollection", features: pts.length >= 3 ? [{ type: "Feature", properties: { name: "Measured area", area_m2: Math.round(area) }, geometry: { type: "Polygon", coordinates: [[...pts, pts[0]].map((p) => [p.lon, p.lat] as [number, number])] } }] : [] };

  const rows: [string, string][] = [
    ["Acres", n(area / SQM.acres, 3)],
    ["Square feet", n(area / SQM.sqft, 0)],
    ["Square metres", n(area, 0)],
    ["Hectares", n(area / SQM.hectares, 4)],
    ["Square kilometres", n(area / SQM.sqkm, 4)],
    ["Square miles", n(area / SQM.sqmi, 5)],
  ];

  return (
    <div>
      <LocationPicker
        onPick={(l) => {
          setView({ lat: l.lat, lon: l.lon, zoom: 17 });
        }}
        preferUS={false}
        deviceLabel="Go to my location"
        searchLabel="Go"
        label="Go to an address or place, then click around the area"
        placeholder="Address, field, park or coordinates"
      />
      <TileMap
        key={view ? `${view.lat},${view.lon}` : "start"}
        ariaLabel="Map. Click to add corners of the area you want to measure."
        markers={pts.map((p, i) => ({ ...p, r: 5, color: i === 0 ? "#15803d" : "#1d4ed8" }))}
        shapes={pts.length >= 2 ? [{ points: pts, fill: pts.length >= 3, color: crossing ? "#b91c1c" : "#1d4ed8", fillOpacity: 0.2 }] : []}
        initial={view ?? { lat: 39, lon: -96, zoom: 4 }}
        height={460}
        onPick={(p) => setPts((x) => [...x, p])}
      />
      <div className="mt-2 flex flex-wrap gap-2">
        <Btn onClick={() => setPts((x) => x.slice(0, -1))} disabled={!pts.length}>
          Undo last corner
        </Btn>
        <Btn onClick={() => setPts([])} disabled={!pts.length}>
          Clear
        </Btn>
        <Btn onClick={() => downloadText(toGeoJson(fc), "area.geojson", "application/geo+json")} disabled={pts.length < 3}>
          GeoJSON
        </Btn>
        <Btn onClick={() => downloadText(toKml(fc, "Measured area"), "area.kml", "application/vnd.google-earth.kml+xml")} disabled={pts.length < 3}>
          KML
        </Btn>
      </div>
      <p className="mt-1.5 mb-4 text-xs text-[var(--color-muted)]">Click each corner of the area in turn; the shape closes itself. Zoom in with + for accuracy. Drag to move the map.</p>

      {pts.length < 3 ? (
        <p className="rounded-lg border border-dashed border-[var(--color-line)] p-5 text-sm text-[var(--color-muted)]">
          {pts.length === 0 ? "Click at least three corners on the map." : `${pts.length} corner${pts.length === 1 ? "" : "s"} so far — ${pts.length === 2 ? `the edge is ${n(per / 0.3048, 0)} ft (${n(per, 1)} m) long. ` : ""}add ${3 - pts.length} more.`}
        </p>
      ) : (
        <div className="rounded-lg border border-[var(--color-line)]">
          <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
            <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">Area of the shape ({pts.length} corners)</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">
              {area >= SQM.sqmi * 10 ? `${n(area / SQM.sqmi, 2)} sq mi` : `${n(area / SQM.acres, 2)} acres`}
            </p>
            <p className="mt-1 text-[var(--color-muted)]">
              {n(area / SQM.hectares, 3)} hectares · perimeter {n(per / 1609.344, 3)} mi ({n(per / 1000, 3)} km, {n(per / 0.3048, 0)} ft)
            </p>
          </div>
          {crossing && <p className="border-b border-[var(--color-line)] bg-[var(--color-warn-soft)] px-4 py-3 text-sm">The edges cross each other, so the shape is ambiguous and the area is not meaningful. Undo the last corners and click around the edge in order.</p>}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-[var(--color-line)]">
                {rows.map(([k, v]) => (
                  <tr key={k}>
                    <td className="px-3 py-2 font-medium">{k}</td>
                    <td className="px-3 py-2 tabular-nums">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="border-t border-[var(--color-line)] px-4 py-3 text-xs text-[var(--color-muted)]">
            Area on the WGS84 ellipsoid: the polygon-area sum of <Ext href={CHAMBERLAIN_URL}>Chamberlain &amp; Duquette (2007)</Ext> on the authalic sphere with authalic latitudes (
            <Ext href={SNYDER_URL}>Snyder 1987</Ext>), so the map&apos;s projection does not distort it. Perimeter: Vincenty geodesics. Horizontal area only — slopes are not added. Your
            clicks are only as accurate as the map at the zoom you clicked; for legal acreage use a survey. Calculated in your browser.
          </p>
        </div>
      )}
    </div>
  );
}
