"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import TileMap from "./TileMap";
import { ErrorBox, Ext, Headline, Loading, n, n0, Row, Table, fmtMiKm } from "./GeoBits";
import { RoutingCredit, Tabs, Btn } from "./ToolBits";
import { fieldClass } from "./CalcBits";
import { inverse, pathPoints } from "@/lib/geodesy";
import { fmtDuration, route, type RouteResult } from "@/lib/routing";
import { DATA_VINTAGE, GAZETTEER_URL, loadZctas, parseZips, zipIndex, ZCTA_URL, type Zcta } from "@/lib/us-data";
import { toCsv } from "@/lib/geo-formats";
import { downloadText } from "@/lib/svg-export";
import { asToolError } from "@/lib/errors";

const money = (x: number | null) => (x === null ? "—" : `$${n0(x)}`);

function Method() {
  return (
    <>
      ZIP points: the internal point of each ZIP Code Tabulation Area from the <Ext href={GAZETTEER_URL}>Census Gazetteer</Ext>; population and income: ACS 5-year ({DATA_VINTAGE}).
      ZCTAs are the Census Bureau&apos;s areas built from ZIP codes (<Ext href={ZCTA_URL}>how they differ</Ext>); PO-box-only and single-business ZIPs have none. Straight lines: Vincenty on
      WGS84.
    </>
  );
}

function Pair({ idx }: { idx: Map<string, Zcta> }) {
  const [a, setA] = useState("10001");
  const [b, setB] = useState("90210");
  const [pair, setPair] = useState<[Zcta, Zcta] | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [road, setRoad] = useState<{ phase: "loading" } | { phase: "ok"; r: RouteResult } | { phase: "error"; message: string } | null>(null);
  const seq = useRef(0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const [za, zb] = [parseZips(a)[0], parseZips(b)[0]];
    if (!za || !zb) return setMsg("Enter two 5-digit ZIP codes.");
    const A = idx.get(za), B = idx.get(zb);
    if (!A || !B) return setMsg(`${!A ? za : zb} has no ZIP Code Tabulation Area — it may be a PO-box-only or single-business ZIP, or not in use.`);
    const id = ++seq.current;
    setPair([A, B]);
    setRoad({ phase: "loading" });
    try {
      const r = await route([A, B], "car");
      if (id === seq.current) setRoad({ phase: "ok", r });
    } catch (err) {
      if (id === seq.current) setRoad({ phase: "error", message: asToolError(err).message });
    }
  }
  const g = pair ? inverse(pair[0], pair[1]) : null;
  return (
    <div>
      <form onSubmit={submit} className="mb-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block font-medium">
            From ZIP
            <input className={`${fieldClass} mt-1.5 font-normal`} inputMode="numeric" value={a} onChange={(e) => setA(e.target.value)} />
          </label>
          <label className="block font-medium">
            To ZIP
            <input className={`${fieldClass} mt-1.5 font-normal`} inputMode="numeric" value={b} onChange={(e) => setB(e.target.value)} />
          </label>
        </div>
        <button type="submit" className="mt-3 w-full rounded-md bg-[var(--color-accent)] px-5 py-2.5 font-medium text-white sm:w-auto">
          Get distance
        </button>
        {msg && <p className="mt-3 rounded-md border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-3 text-sm" role="alert">{msg}</p>}
      </form>
      {pair && g && (
        <div className="mb-4 rounded-lg border border-[var(--color-line)]">
          <Headline kicker={`ZIP ${pair[0].zip} → ZIP ${pair[1].zip}`} title={`${n(g.metres / 1609.344)} miles`} sub={`${n(g.metres / 1000)} km straight line${road?.phase === "ok" ? ` · ${n(road.r.metres / 1609.344)} mi (${fmtDuration(road.r.seconds)}) driving` : ""}`} />
          <div className="p-5 text-sm">
            {road?.phase === "loading" && <p className="mb-3 text-[var(--color-muted)]">Finding the driving route…</p>}
            {road?.phase === "error" && <p className="mb-3">Driving distance unavailable: {road.message}</p>}
            <Table>
              <Row k="Straight-line distance">{fmtMiKm(g.metres, 2)}</Row>
              {road?.phase === "ok" && <Row k="Driving">{fmtMiKm(road.r.metres, 1)} · {fmtDuration(road.r.seconds)} without traffic</Row>}
              {pair.map((z) => (
                <Row key={z.zip} k={`ZIP ${z.zip}`}>
                  Population {z.pop === null ? "—" : n0(z.pop)} · median household income {money(z.income)} · land {n(z.landSqMi, 1)} sq mi
                </Row>
              ))}
            </Table>
            <footer className="border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
              <Method /> <RoutingCredit />
            </footer>
          </div>
        </div>
      )}
      <TileMap
        ariaLabel="Map of the two ZIP code points"
        markers={pair ? [{ ...pair[0], label: pair[0].zip }, { ...pair[1], label: pair[1].zip, color: "#c2410c" }] : []}
        shapes={pair ? [...(road?.phase === "ok" ? [{ points: road.r.line, color: "#c2410c", width: 3 }] : []), { points: pathPoints(pair[0], pair[1], 64), dashed: true }] : []}
        fitKey={pair ? `${pair[0].zip}${pair[1].zip}` : ""}
        initial={{ lat: 39, lon: -96, zoom: 3 }}
        maxFitZoom={11}
      />
    </div>
  );
}

function Many({ idx }: { idx: Map<string, Zcta> }) {
  const [from, setFrom] = useState("60614");
  const [list, setList] = useState("60601\n46204\n53202\n48226\n55401");
  const origin = idx.get(parseZips(from)[0] ?? "");
  const rows = useMemo(() => {
    if (!origin) return [];
    return parseZips(list)
      .slice(0, 5000)
      .map((zip) => {
        const z = idx.get(zip);
        return { zip, z, m: z ? inverse(origin, z).metres : null };
      });
  }, [origin, list, idx]);
  const sorted = [...rows].sort((x, y) => (x.m ?? Infinity) - (y.m ?? Infinity));
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block font-medium">
          From ZIP
          <input className={`${fieldClass} mt-1.5 font-normal`} inputMode="numeric" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label className="block font-medium sm:col-span-2">
          To these ZIPs (paste up to 5,000, any separator)
          <textarea className={`${fieldClass} mt-1.5 h-28 font-mono text-sm font-normal`} value={list} onChange={(e) => setList(e.target.value)} />
        </label>
      </div>
      {!origin && <p className="mt-3 text-sm">Enter a 5-digit origin ZIP that has a ZCTA.</p>}
      {origin && (
        <>
          <div className="my-3">
            <Btn primary onClick={() => downloadText(toCsv([["from_zip", "to_zip", "miles", "km"], ...sorted.map((r) => [origin.zip, r.zip, r.m === null ? "" : (r.m / 1609.344).toFixed(2), r.m === null ? "" : (r.m / 1000).toFixed(2)])]), `distances-from-${origin.zip}.csv`, "text/csv")}>
              Download CSV
            </Btn>
          </div>
          <div className="overflow-x-auto rounded-md border border-[var(--color-line)]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--color-accent-soft)]">
                <tr>
                  <th className="px-3 py-2 font-medium">ZIP</th>
                  <th className="px-3 py-2 font-medium">Miles</th>
                  <th className="px-3 py-2 font-medium">Km</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-line)]">
                {sorted.slice(0, 300).map((r, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 font-mono">{r.zip}</td>
                    {r.m === null ? <td className="px-3 py-2" colSpan={2}>No ZCTA for this ZIP</td> : <><td className="px-3 py-2">{n(r.m / 1609.344, 1)}</td><td className="px-3 py-2">{n(r.m / 1000, 1)}</td></>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <TileMap
            ariaLabel="Map of the origin ZIP and the listed ZIPs"
            markers={[{ ...origin, label: origin.zip, color: "#c2410c" }, ...sorted.filter((r) => r.z).slice(0, 300).map((r) => ({ ...(r.z as Zcta), r: 4 }))]}
            fitKey={`${origin.zip}${rows.length}`}
            maxFitZoom={11}
            height={340}
          />
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            <Method /> Calculated in your browser.
          </p>
        </>
      )}
    </div>
  );
}

export default function DistanceZipTool() {
  const [idx, setIdx] = useState<Map<string, Zcta> | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [mode, setMode] = useState<"pair" | "many">("pair");
  useEffect(() => {
    loadZctas().then((z) => setIdx(zipIndex(z)), (e) => setErr(asToolError(e).message));
  }, []);
  if (err) return <ErrorBox title="The ZIP code list did not load" message={err} onRetry={() => location.reload()} />;
  if (!idx) return <Loading note="Loading 33,791 ZIP code areas from the Census Gazetteer…" />;
  return (
    <div>
      <Tabs value={mode} onChange={setMode} options={[["pair", "Two ZIP codes"], ["many", "One ZIP to many"]]} />
      {mode === "pair" ? <Pair idx={idx} /> : <Many idx={idx} />}
    </div>
  );
}
