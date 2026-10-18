"use client";

import { useRef, useState } from "react";
import LocationPicker from "./LocationPicker";
import TileMap from "./TileMap";
import { Ext, n } from "./GeoBits";
import { Btn, Tabs } from "./ToolBits";
import { fieldClass } from "./CalcBits";
import { PALETTE } from "@/lib/projected";
import { perimeter, sphericalArea, SQM, SNYDER_URL } from "@/lib/polygon-area";
import { parseAny, toGeoJson, toGpx, toKml, type GeoCollection, type Geometry } from "@/lib/geo-formats";
import { downloadText } from "@/lib/svg-export";
import type { LatLon } from "@/lib/geodesy";

type Tool = "freehand" | "line" | "shape" | "marker";
interface Drawn {
  kind: Exclude<Tool, "freehand"> | "freehand";
  points: LatLon[];
  color: string;
  width: number;
  label: string;
}

/** Drop points closer than ~2 px apart at the current zoom (freehand strokes). */
function simplify(pts: LatLon[], tol = 0.00002): LatLon[] {
  const out: LatLon[] = [];
  for (const p of pts) {
    const q = out[out.length - 1];
    if (!q || Math.abs(q.lat - p.lat) + Math.abs(q.lon - p.lon) > tol) out.push(p);
  }
  return out;
}

export default function DrawOnMapTool() {
  const [tool, setTool] = useState<Tool>("freehand");
  const [color, setColor] = useState(PALETTE[2]);
  const [width, setWidth] = useState(4);
  const [items, setItems] = useState<Drawn[]>([]);
  const [current, setCurrent] = useState<LatLon[]>([]);
  const [view, setView] = useState({ lat: 40.7128, lon: -74.006, zoom: 12 });
  const [mapKey, setMapKey] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  const stroke = useRef<LatLon[]>([]);

  const finish = () => {
    if (tool === "line" && current.length >= 2) setItems((x) => [...x, { kind: "line", points: current, color, width, label: "" }]);
    if (tool === "shape" && current.length >= 3) setItems((x) => [...x, { kind: "shape", points: current, color, width, label: "" }]);
    setCurrent([]);
  };

  const fc: GeoCollection = {
    type: "FeatureCollection",
    features: items.map((d, i) => {
      const c = d.points.map((p) => [p.lon, p.lat] as [number, number]);
      const geometry: Geometry = d.kind === "marker" ? { type: "Point", coordinates: c[0] } : d.kind === "shape" ? { type: "Polygon", coordinates: [[...c, c[0]]] } : { type: "LineString", coordinates: c };
      return { type: "Feature", properties: { name: d.label || `${d.kind === "marker" ? "Marker" : d.kind === "shape" ? "Shape" : "Line"} ${i + 1}`, stroke: d.color, "stroke-width": d.width }, geometry };
    }),
  };

  async function importFile(f: File | undefined) {
    if (!f) return;
    try {
      const c = parseAny(f.name, await f.text());
      const add: Drawn[] = [];
      for (const ft of c.features) {
        const g = ft.geometry;
        const label = String(ft.properties.name ?? "");
        const ll = (p: number[]) => ({ lat: p[1], lon: p[0] });
        if (g?.type === "Point") add.push({ kind: "marker", points: [ll(g.coordinates)], color, width, label });
        if (g?.type === "LineString") add.push({ kind: "line", points: g.coordinates.map(ll), color, width, label });
        if (g?.type === "Polygon") add.push({ kind: "shape", points: g.coordinates[0].slice(0, -1).map(ll), color, width, label });
      }
      setItems((x) => [...x, ...add]);
      setMsg(`Imported ${add.length} feature${add.length === 1 ? "" : "s"}.`);
      setMapKey((k) => k + 1);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    }
  }

  const measure = (d: Drawn) => {
    if (d.kind === "marker") return `${d.points[0].lat.toFixed(5)}, ${d.points[0].lon.toFixed(5)}`;
    if (d.kind === "shape") return `${n(sphericalArea(d.points) / SQM.acres, 2)} acres · ${n(perimeter(d.points) / 1609.344, 2)} mi around`;
    return `${n(perimeter(d.points, false) / 1609.344, 2)} mi (${n(perimeter(d.points, false) / 1000, 2)} km)`;
  };

  return (
    <div>
      <LocationPicker onPick={(l) => { setView({ lat: l.lat, lon: l.lon, zoom: 15 }); setMapKey((k) => k + 1); }} preferUS={false} deviceLabel="Go to my location" searchLabel="Go" label="Go to a place" placeholder="Address, city or coordinates" />
      <Tabs value={tool} onChange={(t) => { setCurrent([]); setTool(t); }} options={[["freehand", "✎ Freehand"], ["line", "Line (click points)"], ["shape", "Shape (click corners)"], ["marker", "Marker"]]} />
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {PALETTE.slice(0, 10).map((c) => (
          <button key={c} type="button" onClick={() => setColor(c)} aria-label={`Colour ${c}`} aria-pressed={color === c} className="h-6 w-6 rounded border" style={{ background: c, outline: color === c ? "3px solid #111" : undefined, outlineOffset: 1 }} />
        ))}
        <label className="ml-2 flex items-center gap-1 text-sm">
          Width
          <input type="range" min={1} max={12} value={width} onChange={(e) => setWidth(Number(e.target.value))} />
        </label>
      </div>
      <TileMap
        key={mapKey}
        ariaLabel={tool === "freehand" ? "Map. Press and drag to draw." : "Map. Click to add points."}
        initial={view}
        height={480}
        drawing={tool === "freehand"}
        onDraw={(p, phase) => {
          if (phase === "start") stroke.current = [p];
          else stroke.current.push(p);
          if (phase !== "end") {
            setCurrent([...stroke.current]);
            return;
          }
          const pts = simplify(stroke.current);
          stroke.current = [];
          setCurrent([]);
          if (pts.length >= 2) setItems((x) => [...x, { kind: "freehand", points: pts, color, width, label: "" }]);
        }}
        onPick={
          tool === "freehand"
            ? undefined
            : (p) => {
                if (tool === "marker") setItems((x) => [...x, { kind: "marker", points: [p], color, width, label: "" }]);
                else setCurrent((c) => [...c, p]);
              }
        }
        markers={[...items.filter((d) => d.kind === "marker").map((d) => ({ ...d.points[0], color: d.color, r: 7, label: d.label || undefined })), ...current.map((p) => ({ ...p, r: 3, color }))]}
        shapes={[
          ...items.filter((d) => d.kind !== "marker").map((d) => ({ points: d.points, color: d.color, width: d.width, fill: d.kind === "shape", fillOpacity: 0.2 })),
          ...(current.length >= 2 ? [{ points: current, color, width, fill: tool === "shape" && current.length >= 3, dashed: tool !== "freehand" }] : []),
        ]}
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {(tool === "line" || tool === "shape") && (
          <Btn primary onClick={finish} disabled={current.length < (tool === "shape" ? 3 : 2)}>
            Finish {tool === "shape" ? "shape" : "line"}
          </Btn>
        )}
        <Btn onClick={() => (current.length ? setCurrent((c) => c.slice(0, -1)) : setItems((x) => x.slice(0, -1)))} disabled={!items.length && !current.length}>
          Undo
        </Btn>
        <Btn onClick={() => { setItems([]); setCurrent([]); }} disabled={!items.length}>
          Clear all
        </Btn>
        <span className="text-xs text-[var(--color-muted)]">
          {tool === "freehand" ? "Press and drag on the map to draw. Switch to another tab to pan the map." : tool === "marker" ? "Click to place a marker." : "Click to add points, then press Finish."}
        </span>
      </div>

      {items.length > 0 && (
        <>
          <div className="mt-4 max-h-72 overflow-auto rounded-md border border-[var(--color-line)]">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-[var(--color-line)]">
                {items.map((d, i) => (
                  <tr key={i}>
                    <td className="px-2 py-1.5">
                      <span className="inline-block h-4 w-4 rounded" style={{ background: d.color }} />
                    </td>
                    <td className="px-2 py-1.5">
                      <input className={`${fieldClass} py-1`} value={d.label} placeholder={`${d.kind === "marker" ? "Marker" : d.kind === "shape" ? "Shape" : "Line"} ${i + 1}`} onChange={(e) => setItems((x) => x.map((y, j) => (j === i ? { ...y, label: e.target.value } : y)))} aria-label={`Label for item ${i + 1}`} />
                    </td>
                    <td className="px-2 py-1.5 text-xs whitespace-nowrap">{measure(d)}</td>
                    <td className="px-2 py-1.5">
                      <button type="button" className="rounded border border-[var(--color-line)] px-2 py-1 text-xs" onClick={() => setItems((x) => x.filter((_, j) => j !== i))} aria-label={`Delete item ${i + 1}`}>
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Btn onClick={() => downloadText(toGeoJson(fc), "drawing.geojson", "application/geo+json")}>Download GeoJSON</Btn>
            <Btn onClick={() => downloadText(toKml(fc, "Drawing"), "drawing.kml", "application/vnd.google-earth.kml+xml")}>KML</Btn>
            <Btn onClick={() => downloadText(toGpx(fc, "PlainTools"), "drawing.gpx", "application/gpx+xml")}>GPX</Btn>
          </div>
        </>
      )}
      <div className="mt-3 text-sm">
        <label className="cursor-pointer underline">
          Open a GeoJSON, KML or GPX file to keep drawing on it
          <input type="file" accept=".geojson,.json,.kml,.gpx" className="sr-only" onChange={(e) => void importFile(e.target.files?.[0])} />
        </label>
        {msg && <span className="ml-2">{msg}</span>}
      </div>
      <p className="mt-3 text-xs text-[var(--color-muted)]">
        Lengths are geodesics on WGS84; areas on the ellipsoid (<Ext href={SNYDER_URL}>authalic latitude</Ext>). Your drawing stays in your browser until you download it — reloading the page clears it.
        Map tiles: OpenStreetMap.
      </p>
    </div>
  );
}
