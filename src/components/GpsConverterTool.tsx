"use client";

import { useMemo, useState } from "react";
import CopyRow from "./CopyRow";
import TileMap from "./TileMap";
import { Ext } from "./GeoBits";
import { allFormats, detectCoordinate, type Detected } from "@/lib/coord-detect";
import { GEOHASH_URL, KARNEY_URL, MGRS_DOC_URL, OLC_SPEC_URL } from "@/lib/coords";
import { toCsv } from "@/lib/geo-formats";
import { downloadText } from "@/lib/svg-export";
import { fieldClass } from "./CalcBits";

const EXAMPLES = ["40.748440, -73.985664", "40°44'54.4\"N 73°59'08.4\"W", "N40 44.906 W73 59.140", "18T 585631 4511327", "18T WL 85631 11326", "87G8P2X7+9P", "dr5ru6j2c5"];

function Single() {
  const [text, setText] = useState(EXAMPLES[0]);
  const d = useMemo(() => detectCoordinate(text), [text]);
  const f = d ? allFormats(d) : null;
  return (
    <div>
      <label htmlFor="gps-in" className="mb-1.5 block font-medium">
        Coordinate in any format
      </label>
      <input id="gps-in" className={fieldClass} value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. 40.7484, -73.9857 or 18T 585631 4511327" spellCheck={false} />
      <p className="mt-1.5 text-xs text-[var(--color-muted)]">
        Try:{" "}
        {EXAMPLES.map((x, i) => (
          <button key={x} type="button" onClick={() => setText(x)} className="mr-2 underline">
            {["DD", "DMS", "DMM", "UTM", "MGRS", "Plus Code", "Geohash"][i]}
          </button>
        ))}
      </p>
      {text.trim() && !d && (
        <p className="mt-4 rounded-md border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-3 text-sm" role="alert">
          This could not be read as a coordinate. Check the order (latitude first), the hemisphere letters, and that minutes and seconds are below 60.
        </p>
      )}
      {d && f && <Result d={d} f={f} />}
    </div>
  );
}

function Result({ d, f }: { d: Detected; f: ReturnType<typeof allFormats> }) {
  return (
    <div className="mt-5 rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">Read as {d.format}</p>
        <p className="mt-1 font-mono text-2xl font-semibold tracking-tight">{f.dd}</p>
        {d.precisionM !== undefined && <p className="mt-1 text-sm text-[var(--color-muted)]">This code stands for a cell; the centre is shown, within about ±{d.precisionM < 10 ? d.precisionM.toFixed(1) : Math.round(d.precisionM).toLocaleString("en-US")} m.</p>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-[var(--color-line)]">
            <CopyRow label="Decimal degrees" value={f.dd} />
            <CopyRow label="Degrees, minutes, seconds" value={f.dms} />
            <CopyRow label="Degrees, decimal minutes" value={f.dmm} />
            {f.utm ? <CopyRow label="UTM (WGS84)" value={f.utm} /> : <tr><td className="px-3 py-2 font-medium">UTM / MGRS</td><td className="px-3 py-2" colSpan={2}>Not defined beyond 84° N or 80° S (the polar UPS grid is used there).</td></tr>}
            {f.mgrs && <CopyRow label="MGRS (1 m)" value={f.mgrs} />}
            <CopyRow label="Plus Code (Open Location Code)" value={f.plus} />
            <CopyRow label="Geohash (10 characters)" value={f.geohash} />
          </tbody>
        </table>
      </div>
      <div className="p-4">
        <TileMap ariaLabel="Map showing the converted point" markers={[{ lat: d.lat, lon: d.lon }]} fitKey={f.dd} maxFitZoom={14} height={300} />
      </div>
      <p className="border-t border-[var(--color-line)] px-4 py-3 text-xs text-[var(--color-muted)]">
        All formats on the WGS84 datum (GPS). UTM by Krüger&apos;s series as given by <Ext href={KARNEY_URL}>Karney (2011)</Ext>; MGRS lettering per{" "}
        <Ext href={MGRS_DOC_URL}>GeographicLib&apos;s MGRS notes</Ext>; Plus Codes per the <Ext href={OLC_SPEC_URL}>Open Location Code specification</Ext>; geohash per{" "}
        <Ext href={GEOHASH_URL}>Niemeyer&apos;s scheme</Ext>. Calculated in your browser.
      </p>
    </div>
  );
}

function Batch() {
  const [text, setText] = useState("40.748440, -73.985664\n18T 585631 4511327\n51°30'26\"N 0°7'39\"W\n35.6586, 139.7454");
  const rows = useMemo(
    () =>
      text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .slice(0, 1000)
        .map((line) => {
          const d = detectCoordinate(line);
          return { line, d, f: d ? allFormats(d) : null };
        }),
    [text],
  );
  const bad = rows.filter((r) => !r.d).length;
  function csv() {
    const head = ["input", "format", "latitude", "longitude", "dms", "dmm", "utm", "mgrs", "plus_code", "geohash"];
    const body = rows.map((r) => (r.d && r.f ? [r.line, r.d.format, r.d.lat.toFixed(6), r.d.lon.toFixed(6), r.f.dms, r.f.dmm, r.f.utm ?? "", r.f.mgrs ?? "", r.f.plus, r.f.geohash] : [r.line, "unreadable", "", "", "", "", "", "", "", ""]));
    downloadText(toCsv([head, ...body]), "converted-coordinates.csv", "text/csv");
  }
  return (
    <div>
      <label htmlFor="gps-batch" className="mb-1.5 block font-medium">
        One coordinate per line (up to 1,000, formats can be mixed)
      </label>
      <textarea id="gps-batch" className={`${fieldClass} h-40 font-mono text-sm`} value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" onClick={csv} disabled={!rows.length} className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
          Download CSV (all formats)
        </button>
        <span className="text-sm text-[var(--color-muted)]">
          {rows.length} line{rows.length === 1 ? "" : "s"}
          {bad ? ` · ${bad} could not be read` : ""}
        </span>
      </div>
      <div className="mt-4 overflow-x-auto rounded-md border border-[var(--color-line)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--color-accent-soft)]">
            <tr>
              {["Input", "Read as", "Decimal degrees", "UTM", "MGRS"].map((h) => (
                <th key={h} className="px-3 py-2 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-line)]">
            {rows.slice(0, 200).map((r, i) => (
              <tr key={i}>
                <td className="px-3 py-2 font-mono text-xs">{r.line}</td>
                <td className="px-3 py-2">{r.d ? r.d.format : <span className="font-medium text-[#9a3412]">Unreadable</span>}</td>
                <td className="px-3 py-2 font-mono text-xs">{r.f?.dd ?? ""}</td>
                <td className="px-3 py-2 font-mono text-xs">{r.f?.utm ?? ""}</td>
                <td className="px-3 py-2 font-mono text-xs">{r.f?.mgrs ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > 200 && <p className="mt-1 text-xs text-[var(--color-muted)]">Showing the first 200 rows; the CSV has all {rows.length}.</p>}
    </div>
  );
}

export default function GpsConverterTool() {
  const [mode, setMode] = useState<"one" | "many">("one");
  const tab = (m: typeof mode, label: string) => (
    <button type="button" onClick={() => setMode(m)} aria-pressed={mode === m} className={`rounded-md border px-4 py-2 text-sm font-medium ${mode === m ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]" : "border-[var(--color-line)] bg-white"}`}>
      {label}
    </button>
  );
  return (
    <div>
      <div className="mb-4 flex gap-2">
        {tab("one", "One coordinate")}
        {tab("many", "A list")}
      </div>
      {mode === "one" ? <Single /> : <Batch />}
    </div>
  );
}
