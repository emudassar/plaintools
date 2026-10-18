"use client";

import { useMemo, useState } from "react";
import TileMap from "./TileMap";
import ProfileChart from "./ProfileChart";
import { Ext, n, n0 } from "./GeoBits";
import { Btn } from "./ToolBits";
import { drawables, featureName, measure } from "@/lib/geo-draw";
import { GPX_SPEC_URL, KML_SPEC_URL, lineStats, parseAny, RFC7946_URL, toCsv, toGeoJson, toGpx, toKml, type GeoCollection, type Pos } from "@/lib/geo-formats";
import { downloadText } from "@/lib/svg-export";
import { inverse } from "@/lib/geodesy";
import { M_TO_FT } from "@/lib/elevation";
import { SQM } from "@/lib/polygon-area";

export type ViewerFormat = "kml" | "geojson" | "gpx";

const SAMPLES: Record<ViewerFormat, string> = {
  geojson: `{"type":"FeatureCollection","features":[
{"type":"Feature","properties":{"name":"Sample point"},"geometry":{"type":"Point","coordinates":[-0.1276,51.5072]}},
{"type":"Feature","properties":{"name":"Sample line"},"geometry":{"type":"LineString","coordinates":[[-0.1419,51.5014],[-0.1246,51.5007],[-0.0754,51.5055]]}},
{"type":"Feature","properties":{"name":"Sample area"},"geometry":{"type":"Polygon","coordinates":[[[-0.1878,51.5068],[-0.1530,51.5068],[-0.1530,51.5125],[-0.1878,51.5125],[-0.1878,51.5068]]]}}]}`,
  kml: `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>Sample</name>
<Placemark><name>Sample point</name><Point><coordinates>-122.4194,37.7749</coordinates></Point></Placemark>
<Placemark><name>Sample line</name><LineString><coordinates>-122.4786,37.8199 -122.4194,37.7749 -122.3892,37.7765</coordinates></LineString></Placemark>
<Placemark><name>Sample area</name><Polygon><outerBoundaryIs><LinearRing><coordinates>-122.511,37.771 -122.454,37.771 -122.454,37.766 -122.511,37.766 -122.511,37.771</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark>
</Document></kml>`,
  gpx: `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="sample" xmlns="http://www.topografix.com/GPX/1/1">
<wpt lat="39.7392" lon="-105.2711"><name>Sample start</name></wpt>
<trk><name>Sample track (made-up times and heights)</name><trkseg>
<trkpt lat="39.7392" lon="-105.2711"><ele>1830</ele><time>2026-06-01T08:00:00Z</time></trkpt>
<trkpt lat="39.7425" lon="-105.2790"><ele>1905</ele><time>2026-06-01T08:12:00Z</time></trkpt>
<trkpt lat="39.7468" lon="-105.2852"><ele>1990</ele><time>2026-06-01T08:27:00Z</time></trkpt>
<trkpt lat="39.7511" lon="-105.2899"><ele>2061</ele><time>2026-06-01T08:41:00Z</time></trkpt>
<trkpt lat="39.7550" lon="-105.2960"><ele>2120</ele><time>2026-06-01T08:55:00Z</time></trkpt>
<trkpt lat="39.7590" lon="-105.3015"><ele>2088</ele><time>2026-06-01T09:04:00Z</time></trkpt>
</trkseg></trk></gpx>`,
};

const LABEL: Record<ViewerFormat, string> = { kml: "KML", geojson: "GeoJSON", gpx: "GPX" };
const COLORS = ["#1d4ed8", "#c2410c", "#15803d", "#7c3aed", "#b91c1c", "#0e7490"];

function fmtDur(s: number) {
  const h = Math.floor(s / 3600), m = Math.round((s % 3600) / 60);
  return h ? `${h} h ${m} min` : `${m} min`;
}

export default function GeoFileViewerTool({ format }: { format: ViewerFormat }) {
  const [fc, setFc] = useState<GeoCollection | null>(null);
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [sel, setSel] = useState<number | null>(null);
  const [drag, setDrag] = useState(false);
  const [unit, setUnit] = useState<"ft" | "m">("ft");

  function load(fileName: string, text: string) {
    setErr(null);
    setSel(null);
    try {
      const c = parseAny(fileName, text);
      if (!c.features.length) throw new Error("The file has no features with coordinates.");
      setFc(c);
      setName(fileName);
    } catch (e) {
      setFc(null);
      setErr(e instanceof Error ? e.message : String(e));
    }
  }
  async function openFile(f: File | undefined) {
    if (!f) return;
    if (f.size > 50 * 1024 * 1024) return setErr("That file is over 50 MB — too large to open in a browser tab.");
    load(f.name, await f.text());
  }

  const draw = useMemo(() => (fc ? drawables(fc) : null), [fc]);
  const tracks = useMemo(() => {
    if (!fc) return null;
    const lines: Pos[][] = [];
    let times: (string | null)[] = [];
    for (const f of fc.features) {
      const g = f.geometry;
      if (g?.type === "LineString") lines.push(g.coordinates);
      if (g?.type === "MultiLineString") lines.push(...g.coordinates);
      if (f.times) times = times.concat(f.times);
    }
    if (!lines.length) return null;
    const st = lineStats(lines, times);
    // Distance/elevation series for the chart, from lines that carry heights.
    const prof: { d: number; m: number }[] = [];
    let d = 0;
    for (const l of lines)
      l.forEach((p, i) => {
        if (i > 0) d += inverse({ lat: l[i - 1][1], lon: l[i - 1][0] }, { lat: p[1], lon: p[0] }).metres;
        if (p.length > 2) prof.push({ d, m: p[2]! });
      });
    const step = Math.max(1, Math.ceil(prof.length / 1500));
    return { st, prof: prof.filter((_, i) => i % step === 0) };
  }, [fc]);

  const base = name.replace(/\.[^.]+$/, "") || "export";
  const counts = fc ? fc.features.reduce<Record<string, number>>((m, f) => ((m[f.geometry?.type ?? "None"] = (m[f.geometry?.type ?? "None"] ?? 0) + 1), m), {}) : {};

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          void openFile(e.dataTransfer.files[0]);
        }}
        className={`rounded-lg border-2 border-dashed p-6 text-center ${drag ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]" : "border-[var(--color-line)]"}`}
      >
        <p className="font-medium">Drop a {LABEL[format]} file here</p>
        <p className="mt-1 text-sm text-[var(--color-muted)]">or</p>
        <label className="mt-2 inline-block cursor-pointer rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white">
          Choose a file
          <input type="file" className="sr-only" accept={format === "geojson" ? ".geojson,.json" : `.${format}`} onChange={(e) => void openFile(e.target.files?.[0])} />
        </label>
        <p className="mt-3 text-xs text-[var(--color-muted)]">
          The file is read in your browser and never uploaded. {format !== "geojson" ? "GeoJSON, KML and GPX all open here." : "KML and GPX files open here too."}{" "}
          <button type="button" className="underline" onClick={() => load(`sample.${format}`, SAMPLES[format])}>
            Try a sample
          </button>
        </p>
      </div>
      {err && (
        <p className="mt-3 rounded-md border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-3 text-sm" role="alert">
          {err}
        </p>
      )}

      {fc && draw && (
        <div className="mt-4">
          <div className="mb-3 rounded-lg border border-[var(--color-line)] bg-[var(--color-accent-soft)] p-4">
            <p className="font-semibold">{name}</p>
            <p className="text-sm text-[var(--color-muted)]">
              {fc.features.length} feature{fc.features.length === 1 ? "" : "s"}: {Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(", ")}
              {fc.skipped ? ` · ${fc.skipped} with invalid coordinates skipped` : ""}
            </p>
          </div>
          <TileMap
            ariaLabel={`Map of the features in ${name}`}
            markers={draw.points.slice(0, 2000).map((p) => ({ lat: p.lat, lon: p.lon, r: sel === p.feature ? 8 : 5, color: sel === p.feature ? "#c2410c" : COLORS[p.feature % COLORS.length] }))}
            shapes={draw.shapes.map((s) => ({ points: s.points, more: s.more, fill: s.fill, color: sel === s.feature ? "#c2410c" : COLORS[s.feature % COLORS.length], width: sel === s.feature ? 4 : 2.5, fillOpacity: 0.15 }))}
            fitKey={name + fc.features.length}
            maxFitZoom={15}
            height={460}
          />
          {tracks && (
            <div className="mt-4 rounded-lg border border-[var(--color-line)] p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold">Track and route statistics</h3>
                <select className="rounded-md border border-[var(--color-line)] bg-white px-2 py-1 text-sm" value={unit} onChange={(e) => setUnit(e.target.value as "ft" | "m")} aria-label="Units">
                  <option value="ft">Miles and feet</option>
                  <option value="m">Kilometres and metres</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                <p>
                  Distance: <strong>{unit === "ft" ? `${n(tracks.st.metres / 1609.344, 2)} mi` : `${n(tracks.st.metres / 1000, 2)} km`}</strong>
                </p>
                <p>Points: <strong>{n0(tracks.st.points)}</strong></p>
                {tracks.st.gainM !== null && (
                  <>
                    <p>Climb: <strong>{unit === "ft" ? `${n0(tracks.st.gainM * M_TO_FT)} ft` : `${n0(tracks.st.gainM)} m`}</strong></p>
                    <p>Descent: <strong>{unit === "ft" ? `${n0((tracks.st.lossM ?? 0) * M_TO_FT)} ft` : `${n0(tracks.st.lossM ?? 0)} m`}</strong></p>
                    <p>Highest: <strong>{unit === "ft" ? `${n0((tracks.st.maxEle ?? 0) * M_TO_FT)} ft` : `${n0(tracks.st.maxEle ?? 0)} m`}</strong></p>
                    <p>Lowest: <strong>{unit === "ft" ? `${n0((tracks.st.minEle ?? 0) * M_TO_FT)} ft` : `${n0(tracks.st.minEle ?? 0)} m`}</strong></p>
                  </>
                )}
                {tracks.st.seconds !== null && tracks.st.seconds > 0 && (
                  <>
                    <p>Time: <strong>{fmtDur(tracks.st.seconds)}</strong></p>
                    <p>Average speed: <strong>{unit === "ft" ? `${n(tracks.st.metres / 1609.344 / (tracks.st.seconds / 3600), 1)} mph` : `${n(tracks.st.metres / 1000 / (tracks.st.seconds / 3600), 1)} km/h`}</strong></p>
                  </>
                )}
              </div>
              {tracks.prof.length > 2 && (
                <div className="mt-3">
                  <ProfileChart s={tracks.prof} unit={unit} />
                </div>
              )}
              <p className="mt-2 text-xs text-[var(--color-muted)]">
                Distance: Vincenty geodesics between consecutive points on WGS84. Climb and descent add every rise and drop in the file&apos;s recorded heights, so GPS noise inflates them a
                little. Time: first to last timestamp, stops included.
              </p>
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="self-center text-sm font-medium">Convert and download:</span>
            <Btn onClick={() => downloadText(toGeoJson(fc), `${base}.geojson`, "application/geo+json")}>GeoJSON</Btn>
            <Btn onClick={() => downloadText(toKml(fc, base), `${base}.kml`, "application/vnd.google-earth.kml+xml")}>KML</Btn>
            <Btn onClick={() => downloadText(toGpx(fc, "PlainTools"), `${base}.gpx`, "application/gpx+xml")}>GPX</Btn>
            <Btn
              onClick={() =>
                downloadText(
                  toCsv([["name", "latitude", "longitude"], ...draw.points.map((p) => [featureName(fc.features[p.feature], p.feature), p.lat.toFixed(6), p.lon.toFixed(6)])]),
                  `${base}-points.csv`,
                  "text/csv",
                )
              }
              disabled={!draw.points.length}
            >
              CSV (points)
            </Btn>
          </div>
          <div className="mt-4 max-h-[28rem] overflow-auto rounded-md border border-[var(--color-line)]">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-[var(--color-line)]">
                  <th className="px-3 py-2 font-medium">Feature</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Size</th>
                  <th className="px-3 py-2 font-medium">Properties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-line)]">
                {fc.features.slice(0, 1000).map((f, i) => {
                  const m = measure(f);
                  const props = Object.entries(f.properties).filter(([k]) => !["name", "Name", "NAME"].includes(k));
                  return (
                    <tr key={i} className={sel === i ? "bg-[var(--color-accent-soft)]" : ""} onClick={() => setSel(i === sel ? null : i)} style={{ cursor: "pointer" }}>
                      <td className="px-3 py-1.5 font-medium">{featureName(f, i)}</td>
                      <td className="px-3 py-1.5">{f.geometry?.type ?? "—"}</td>
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        {m.lengthM !== undefined ? `${n(m.lengthM / 1609.344, 2)} mi` : m.areaM2 !== undefined ? `${n(m.areaM2 / SQM.acres, 1)} acres` : ""}
                      </td>
                      <td className="px-3 py-1.5 text-xs text-[var(--color-muted)]">
                        {props.slice(0, 6).map(([k, v]) => `${k}: ${String(v ?? "")}`.slice(0, 80)).join(" · ")}
                        {props.length > 6 ? ` · +${props.length - 6} more` : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {fc.features.length > 1000 && <p className="mt-1 text-xs text-[var(--color-muted)]">Listing the first 1,000 features; all of them are on the map and in the downloads.</p>}
          <p className="mt-3 text-xs text-[var(--color-muted)]">
            Read according to the <Ext href={RFC7946_URL}>GeoJSON (RFC 7946)</Ext>, <Ext href={KML_SPEC_URL}>OGC KML</Ext> and <Ext href={GPX_SPEC_URL}>GPX 1.1</Ext> specifications. KML styles,
            images, network links and 3D models are not drawn; GPX has no polygons, so areas become tracks when converted to GPX. Lengths on WGS84; areas on the ellipsoid. Map tiles:
            OpenStreetMap.
          </p>
        </div>
      )}
    </div>
  );
}
