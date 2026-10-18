"use client";

import { useMemo, useRef, useState } from "react";
import TileMap from "./TileMap";
import { Ext } from "./GeoBits";
import { Btn } from "./ToolBits";
import { fieldClass } from "./CalcBits";
import { guessLatLonColumns, parseCsv, RFC4180_URL, toGeoJson, toKml, type GeoCollection } from "@/lib/geo-formats";
import { parseAngle } from "@/lib/coords";
import { geocodeAddress } from "@/lib/geocode";
import { PALETTE } from "@/lib/projected";
import { downloadText } from "@/lib/svg-export";
import type { LatLon } from "@/lib/geodesy";

const SAMPLE = `name,city,latitude,longitude,type
Golden Gate Bridge,San Francisco,37.8199,-122.4783,Bridge
Brooklyn Bridge,New York,40.7061,-73.9969,Bridge
Space Needle,Seattle,47.6205,-122.3493,Tower
Willis Tower,Chicago,41.8789,-87.6359,Tower
Gateway Arch,St. Louis,38.6247,-90.1848,Monument
Washington Monument,Washington,38.8895,-77.0353,Monument`;

const MAX_GEOCODE = 200;
const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function CsvToMapTool() {
  const [text, setText] = useState("");
  const [latCol, setLatCol] = useState(-1);
  const [lonCol, setLonCol] = useState(-1);
  const [addrCol, setAddrCol] = useState(-1);
  const [labelCol, setLabelCol] = useState(-1);
  const [colorCol, setColorCol] = useState(-1);
  const [geo, setGeo] = useState<Record<number, LatLon | null>>({});
  const [busy, setBusy] = useState(0);
  const [fitKey, setFitKey] = useState("");
  const stop = useRef(false);

  const table = useMemo(() => {
    const rows = text.trim() ? parseCsv(text.trim()) : [];
    return rows.length ? { header: rows[0], rows: rows.slice(1).filter((r) => r.some((c) => c.trim())) } : null;
  }, [text]);

  function setData(t: string) {
    setText(t);
    setGeo({});
    const rows = t.trim() ? parseCsv(t.trim()) : [];
    const h = rows[0] ?? [];
    const g = guessLatLonColumns(h);
    setLatCol(g?.lat ?? -1);
    setLonCol(g?.lon ?? -1);
    const lower = h.map((x) => x.toLowerCase());
    setAddrCol(g ? -1 : lower.findIndex((x) => /address|location|place|city/.test(x)));
    setLabelCol(lower.findIndex((x) => /^(name|title|label)$/.test(x)));
    setColorCol(-1);
    setFitKey(String(Date.now()));
  }

  const points = useMemo(() => {
    if (!table) return [];
    return table.rows.map((r, i) => {
      if (latCol >= 0 && lonCol >= 0) {
        const lat = parseAngle(r[latCol] ?? "", true), lon = parseAngle(r[lonCol] ?? "", false);
        return lat !== null && lon !== null ? { lat, lon } : null;
      }
      return geo[i] ?? null;
    });
  }, [table, latCol, lonCol, geo]);

  const cats = useMemo(() => (table && colorCol >= 0 ? [...new Set(table.rows.map((r) => r[colorCol] ?? ""))].slice(0, 12) : []), [table, colorCol]);
  const colorOf = (r: string[]) => (colorCol >= 0 ? PALETTE[Math.max(0, cats.indexOf(r[colorCol] ?? "")) % 12] : PALETTE[0]);

  async function geocodeAll() {
    if (!table || addrCol < 0) return;
    stop.current = false;
    const out: Record<number, LatLon | null> = {};
    const n = Math.min(MAX_GEOCODE, table.rows.length);
    for (let i = 0; i < n; i++) {
      if (stop.current) break;
      setBusy(i + 1);
      try {
        const g = await geocodeAddress(table.rows[i][addrCol] ?? "", { preferUS: false, delays: [0, 6000] });
        out[i] = { lat: g.lat, lon: g.lon };
      } catch {
        out[i] = null;
      }
      setGeo({ ...out });
      await pause(300);
    }
    setBusy(0);
    setFitKey(String(Date.now()));
  }

  const located = points.filter(Boolean).length;
  const fc: GeoCollection | null = table
    ? {
        type: "FeatureCollection",
        features: table.rows.flatMap((r, i) => {
          const p = points[i];
          if (!p) return [];
          const properties: Record<string, string> = Object.fromEntries(table.header.map((h, j) => [h || `col${j + 1}`, r[j] ?? ""]));
          if (labelCol >= 0) properties.name = r[labelCol] ?? "";
          return [{ type: "Feature" as const, properties, geometry: { type: "Point" as const, coordinates: [p.lon, p.lat] as [number, number] } }];
        }),
      }
    : null;
  const colSelect = (label: string, v: number, set: (x: number) => void, none = "—") =>
    table && (
      <label className="block text-sm">
        <span className="mb-1 block font-medium">{label}</span>
        <select className={fieldClass} value={v} onChange={(e) => set(Number(e.target.value))}>
          <option value={-1}>{none}</option>
          {table.header.map((h, i) => (
            <option key={i} value={i}>
              {h || `Column ${i + 1}`}
            </option>
          ))}
        </select>
      </label>
    );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="cursor-pointer rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white">
          Open a CSV file
          <input type="file" accept=".csv,.tsv,.txt" className="sr-only" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setData(await f.text()); }} />
        </label>
        <Btn onClick={() => setData(SAMPLE)}>Use a sample</Btn>
        <span className="text-xs text-[var(--color-muted)]">Or paste below. The first row must be column names. Read in your browser; nothing is uploaded.</span>
      </div>
      <textarea className={`${fieldClass} mt-3 h-36 font-mono text-xs`} value={text} onChange={(e) => setData(e.target.value)} placeholder="name,latitude,longitude&#10;Office,40.7484,-73.9857" spellCheck={false} />

      {table && (
        <>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {colSelect("Latitude column", latCol, setLatCol)}
            {colSelect("Longitude column", lonCol, setLonCol)}
            {colSelect("Or an address column", addrCol, setAddrCol)}
            {colSelect("Label column", labelCol, setLabelCol)}
            {colSelect("Colour by column", colorCol, setColorCol, "One colour")}
          </div>
          {(latCol < 0 || lonCol < 0) && addrCol >= 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Btn primary onClick={() => void geocodeAll()} disabled={busy > 0}>
                {busy ? `Finding addresses… ${busy}/${Math.min(MAX_GEOCODE, table.rows.length)}` : `Find ${Math.min(MAX_GEOCODE, table.rows.length)} addresses on the map`}
              </Btn>
              {busy > 0 && <Btn onClick={() => (stop.current = true)}>Stop</Btn>}
              <span className="text-xs text-[var(--color-muted)]">Looked up one at a time with Photon (OpenStreetMap); up to {MAX_GEOCODE} rows.</span>
            </div>
          )}
          <p className="mt-3 text-sm">
            {table.rows.length} rows · <strong>{located}</strong> on the map
            {table.rows.length - located > 0 && (latCol >= 0 || Object.keys(geo).length) ? ` · ${table.rows.length - located} without usable coordinates` : ""}
          </p>
        </>
      )}
      <div className="mt-3">
        <TileMap
          ariaLabel="Map of the rows in your CSV"
          markers={table ? table.rows.flatMap((r, i) => (points[i] ? [{ ...points[i]!, r: 6, color: colorOf(r), label: labelCol >= 0 && table.rows.length <= 50 ? r[labelCol] : undefined }] : [])) : []}
          fitKey={fitKey + located}
          maxFitZoom={14}
          height={460}
        />
      </div>
      {cats.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-3 text-sm">
          {cats.map((c, i) => (
            <span key={c} className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-full" style={{ background: PALETTE[i % 12] }} />
              {c || "(blank)"}
            </span>
          ))}
        </div>
      )}
      {fc && fc.features.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Btn onClick={() => downloadText(toGeoJson(fc), "csv-points.geojson", "application/geo+json")}>Download GeoJSON</Btn>
          <Btn onClick={() => downloadText(toKml(fc, "CSV points"), "csv-points.kml", "application/vnd.google-earth.kml+xml")}>Download KML (Google Earth)</Btn>
        </div>
      )}
      <p className="mt-3 text-xs text-[var(--color-muted)]">
        CSV read per <Ext href={RFC4180_URL}>RFC 4180</Ext>; commas, semicolons or tabs are detected from the first line. Coordinates can be decimal degrees or degrees-minutes-seconds and must be
        WGS84 (GPS). Addresses: OpenStreetMap via <Ext href="https://photon.komoot.io">Photon</Ext>. Map tiles: OpenStreetMap.
      </p>
    </div>
  );
}
