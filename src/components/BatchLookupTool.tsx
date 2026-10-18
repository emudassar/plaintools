"use client";

import { useRef, useState } from "react";
import TileMap from "./TileMap";
import { Ext } from "./GeoBits";
import { geocodeAddress, reverseGeocodeDetail } from "@/lib/geocode";
import { censusAreaAt, FCC_DOCS_URL } from "@/lib/fcc-area";
import { parseLatLon } from "@/lib/coords";
import { toCsv } from "@/lib/geo-formats";
import { downloadText } from "@/lib/svg-export";
import { asToolError } from "@/lib/errors";
import { inverse, type LatLon } from "@/lib/geodesy";

/**
 * One input box that takes a single line or a list, looks each line up in turn
 * (gently: one request at a time), shows a table and a map, and exports CSV.
 *
 * Modes: reverse lookups from coordinates (city / country / state) and forward
 * geocoding from addresses.
 */

export type BatchMode = "city" | "country" | "state" | "geocode";

const MAX_LINES = 200;
const FAR_M = 25_000;

interface Row {
  input: string;
  point: LatLon | null;
  cells: string[];
  status: "ok" | "none" | "bad" | "error";
  note?: string;
}

const COLUMNS: Record<BatchMode, string[]> = {
  city: ["City / town", "County / district", "State / region", "Country"],
  country: ["Country", "ISO code"],
  state: ["State", "Code", "County", "County FIPS", "State FIPS"],
  geocode: ["Latitude", "Longitude", "Matched place"],
};

const PLACEHOLDER: Record<BatchMode, string> = {
  city: "30.2672, -97.7431\n48.8584, 2.2945\n35°39′31″N 139°42′1″E",
  country: "51.5007, -0.1246\n-33.8568, 151.2153\n0, -30",
  state: "39.7392, -104.9903\n41.8781, -87.6298\n38.9072, -77.0369",
  geocode: "1600 Pennsylvania Ave NW, Washington, DC\nEiffel Tower, Paris\nSydney Opera House",
};

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function lookup(mode: BatchMode, line: string): Promise<Row> {
  if (mode === "geocode") {
    try {
      const g = await geocodeAddress(line, { preferUS: false, delays: [0, 6000] });
      return { input: line, point: { lat: g.lat, lon: g.lon }, cells: [g.lat.toFixed(6), g.lon.toFixed(6), g.label], status: "ok" };
    } catch (e) {
      const err = asToolError(e);
      return { input: line, point: null, cells: ["", "", ""], status: err.kind === "unavailable" ? "error" : "none", note: err.message };
    }
  }
  const p = parseLatLon(line);
  if (!p) return { input: line, point: null, cells: COLUMNS[mode].map(() => ""), status: "bad", note: "Could not read coordinates" };
  try {
    if (mode === "state") {
      const a = await censusAreaAt(p.lat, p.lon, { delays: [0, 6000] });
      if (!a) return { input: line, point: p, cells: ["", "", "", "", ""], status: "none", note: "Not in a US state or territory (or open water)" };
      return { input: line, point: p, cells: [a.stateName, a.stateCode, a.countyName ?? "(name not published)", a.countyFips, a.stateFips], status: "ok" };
    }
    const d = await reverseGeocodeDetail(p.lat, p.lon, { delays: [0, 6000] });
    const far = d && d.featureLat !== null && d.featureLon !== null ? inverse(p, { lat: d.featureLat, lon: d.featureLon }).metres > FAR_M : true;
    if (!d || far) return { input: line, point: p, cells: COLUMNS[mode].map(() => ""), status: "none", note: "No country or place within 25 km — probably at sea" };
    if (mode === "country") return { input: line, point: p, cells: [d.country ?? "", d.countryCode ?? ""], status: d.country ? "ok" : "none" };
    return { input: line, point: p, cells: [d.city ?? "", d.county ?? "", d.state ?? "", d.country ?? ""], status: d.city || d.state ? "ok" : "none" };
  } catch (e) {
    return { input: line, point: p, cells: COLUMNS[mode].map(() => ""), status: "error", note: asToolError(e).message };
  }
}

export default function BatchLookupTool({ mode }: { mode: BatchMode }) {
  const [text, setText] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  const stop = useRef(false);
  const [fitKey, setFitKey] = useState("");

  async function run() {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    setMsg(null);
    if (!lines.length) {
      setMsg(mode === "geocode" ? "Type at least one address." : "Type at least one pair of coordinates.");
      return;
    }
    if (lines.length > MAX_LINES) setMsg(`Only the first ${MAX_LINES} lines are looked up; split longer lists into batches.`);
    const todo = lines.slice(0, MAX_LINES);
    stop.current = false;
    setBusy(true);
    setRows([]);
    const out: Row[] = [];
    for (let i = 0; i < todo.length; i++) {
      if (stop.current) break;
      out.push(await lookup(mode, todo[i]));
      setRows([...out]);
      setProgress(i + 1);
      if (i < todo.length - 1) await pause(mode === "state" ? 150 : 350);
    }
    setFitKey(String(Date.now()));
    setBusy(false);
  }

  function exportCsv() {
    const head = [mode === "geocode" ? "input" : "input", ...COLUMNS[mode].map((c) => c.toLowerCase().replace(/[^a-z0-9]+/g, "_")), "status", "note"];
    const body = rows.map((r) => [r.input, ...r.cells, r.status, r.note ?? ""]);
    if (mode !== "geocode") {
      head.splice(1, 0, "latitude", "longitude");
      body.forEach((b, i) => b.splice(1, 0, rows[i].point?.lat.toFixed(6) ?? "", rows[i].point?.lon.toFixed(6) ?? ""));
    }
    downloadText(toCsv([head, ...body]), `${mode === "geocode" ? "address-coordinates" : `coordinates-to-${mode}`}.csv`, "text/csv");
  }

  const ok = rows.filter((r) => r.status === "ok").length;
  const markers = rows.filter((r) => r.point).map((r, i) => ({ ...r.point!, label: rows.length <= 25 ? String(i + 1) : undefined, color: r.status === "ok" ? undefined : "#b45309" }));

  return (
    <div>
      <label htmlFor={`batch-${mode}`} className="mb-1.5 block font-medium">
        {mode === "geocode" ? "Addresses or place names — one per line" : "Coordinates — one pair per line, any common format"}
      </label>
      <textarea
        id={`batch-${mode}`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder={PLACEHOLDER[mode]}
        className="w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5 font-mono text-sm"
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button type="button" onClick={run} disabled={busy} className="rounded-md bg-[var(--color-accent)] px-5 py-2.5 font-medium text-white disabled:opacity-50">
          {busy ? `Looking up ${progress}…` : "Look up"}
        </button>
        {busy && (
          <button type="button" onClick={() => (stop.current = true)} className="rounded-md border border-[var(--color-line)] bg-white px-4 py-2.5 text-sm font-medium">
            Stop
          </button>
        )}
        {!busy && rows.length > 0 && (
          <button type="button" onClick={exportCsv} className="rounded-md border border-[var(--color-line)] bg-white px-4 py-2.5 text-sm font-medium">
            Download CSV
          </button>
        )}
        <span className="text-xs text-[var(--color-muted)]">Up to {MAX_LINES} lines, looked up one at a time.</span>
      </div>
      {msg && <p className="mt-2 text-sm text-[var(--color-muted)]">{msg}</p>}

      {rows.length > 0 && (
        <div className="mt-5 rounded-lg border border-[var(--color-line)]">
          <p className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] px-4 py-3 font-medium">
            {ok} of {rows.length} found{busy ? " so far" : ""}
          </p>
          <div className="max-h-[28rem] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white text-left">
                <tr className="border-b border-[var(--color-line)]">
                  <th className="px-3 py-2 font-medium">#</th>
                  <th className="px-3 py-2 font-medium">Input</th>
                  {COLUMNS[mode].map((c) => (
                    <th key={c} className="px-3 py-2 font-medium">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-line)]">
                {rows.map((r, i) => (
                  <tr key={i} className={r.status === "ok" ? "" : "bg-[var(--color-warn-soft)]"}>
                    <td className="px-3 py-1.5 text-[var(--color-muted)]">{i + 1}</td>
                    <td className="px-3 py-1.5 font-mono text-xs">{r.input}</td>
                    {r.status === "ok" ? (
                      r.cells.map((c, j) => (
                        <td key={j} className="px-3 py-1.5">
                          {c || "—"}
                        </td>
                      ))
                    ) : (
                      <td colSpan={COLUMNS[mode].length} className="px-3 py-1.5 text-[var(--color-muted)]">
                        {r.note ?? "Nothing found"}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <footer className="border-t border-[var(--color-line)] px-4 py-3 text-xs text-[var(--color-muted)]">
            {mode === "state" ? (
              <>
                Source: FCC Area API, 2020 Census blocks, queried {new Date().toLocaleDateString("en-US", { dateStyle: "long" })}. <Ext href={FCC_DOCS_URL}>FCC Area API</Ext>
              </>
            ) : (
              <>
                Source: OpenStreetMap contributors (ODbL) via the Photon {mode === "geocode" ? "geocoder" : "reverse geocoder"}, queried{" "}
                {new Date().toLocaleDateString("en-US", { dateStyle: "long" })}. <Ext href="https://photon.komoot.io">Photon</Ext>
              </>
            )}
          </footer>
        </div>
      )}
      {markers.length > 0 && (
        <div className="mt-4">
          <TileMap ariaLabel="Map of the looked-up points" markers={markers} fitKey={fitKey || String(markers.length)} maxFitZoom={12} />
        </div>
      )}
    </div>
  );
}
