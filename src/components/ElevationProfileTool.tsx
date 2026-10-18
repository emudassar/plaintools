"use client";

import { useRef, useState } from "react";
import TileMap from "./TileMap";
import PlacePairForm from "./PlacePairForm";
import { ErrorBox, Ext, Loading, n, n0 } from "./GeoBits";
import { Btn, ProfileSelect, RoutingCredit, Tabs } from "./ToolBits";
import { copernicusBatch, COPERNICUS_DOI_URL, M_TO_FT, OPEN_METEO_DOCS_URL } from "@/lib/elevation";
import { direct, inverse, type LatLon } from "@/lib/geodesy";
import { route, type Profile } from "@/lib/routing";
import { toCsv } from "@/lib/geo-formats";
import { downloadText } from "@/lib/svg-export";
import { asToolError } from "@/lib/errors";

const SAMPLES = 200;

interface Sample extends LatLon {
  d: number;
  m: number;
}

/** Evenly spaced points along a polyline, following geodesics between vertices. */
function resample(line: LatLon[], count: number): (LatLon & { d: number })[] {
  const seg = line.slice(1).map((p, i) => inverse(line[i], p));
  const total = seg.reduce((s, x) => s + x.metres, 0);
  const out: (LatLon & { d: number })[] = [];
  let i = 0, start = 0;
  for (let k = 0; k < count; k++) {
    const d = (total * k) / (count - 1);
    while (i < seg.length - 1 && start + seg[i].metres < d) start += seg[i++].metres;
    const off = Math.min(seg[i]?.metres ?? 0, d - start);
    const p = seg.length ? direct(line[i], seg[i].initialBearing, off) : line[0];
    out.push({ lat: p.lat, lon: p.lon, d });
  }
  return out;
}

function Chart({ s, unit }: { s: Sample[]; unit: "ft" | "m" }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 720, H = 240, L = 52, B = 28, T = 10, R = 10;
  const f = unit === "ft" ? M_TO_FT : 1;
  const ys = s.map((x) => x.m * f);
  let lo = Math.min(...ys), hi = Math.max(...ys);
  if (hi - lo < 10) { lo -= 5; hi += 5; }
  const pad = (hi - lo) * 0.08;
  lo -= pad; hi += pad;
  const dmax = s[s.length - 1].d;
  const X = (d: number) => L + ((W - L - R) * d) / dmax;
  const Y = (v: number) => T + ((H - T - B) * (hi - v)) / (hi - lo);
  const path = s.map((x, i) => `${i ? "L" : "M"}${X(x.d).toFixed(1)},${Y(ys[i]).toFixed(1)}`).join("");
  const dUnit = unit === "ft" ? 1609.344 : 1000;
  const ticks = 5;
  const h = hover === null ? null : s[hover];
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full touch-none"
      role="img"
      aria-label="Elevation profile chart"
      onPointerMove={(e) => {
        const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
        const d = (((e.clientX - r.left) / r.width) * W - L) / (W - L - R) * dmax;
        let best = 0;
        for (let i = 1; i < s.length; i++) if (Math.abs(s[i].d - d) < Math.abs(s[best].d - d)) best = i;
        setHover(best);
      }}
      onPointerLeave={() => setHover(null)}
    >
      <path d={`${path}L${X(dmax)},${H - B}L${L},${H - B}Z`} fill="#1f5f4b" fillOpacity={0.12} />
      <path d={path} fill="none" stroke="#1f5f4b" strokeWidth={2} />
      {Array.from({ length: ticks + 1 }, (_, i) => lo + ((hi - lo) * i) / ticks).map((v) => (
        <g key={v}>
          <line x1={L} x2={W - R} y1={Y(v)} y2={Y(v)} stroke="#e3e7ec" />
          <text x={L - 6} y={Y(v) + 4} fontSize={11} textAnchor="end" fill="#5a6572">
            {n0(v)}
          </text>
        </g>
      ))}
      {Array.from({ length: ticks + 1 }, (_, i) => (dmax * i) / ticks).map((d) => (
        <text key={d} x={X(d)} y={H - 8} fontSize={11} textAnchor="middle" fill="#5a6572">
          {n(d / dUnit, 1)}
        </text>
      ))}
      <text x={4} y={14} fontSize={11} fill="#5a6572">
        {unit}
      </text>
      {h && (
        <g>
          <line x1={X(h.d)} x2={X(h.d)} y1={T} y2={H - B} stroke="#c2410c" />
          <circle cx={X(h.d)} cy={Y(h.m * f)} r={4} fill="#c2410c" />
          <text x={Math.min(X(h.d) + 6, W - 150)} y={T + 14} fontSize={12} fill="#111">
            {n(h.d / dUnit, 2)} {unit === "ft" ? "mi" : "km"} · {n0(h.m * f)} {unit}
          </text>
        </g>
      )}
    </svg>
  );
}

export default function ElevationProfileTool() {
  const [mode, setMode] = useState<"draw" | "route">("draw");
  const [pts, setPts] = useState<LatLon[]>([]);
  const [profile, setProfile] = useState<Profile>("foot");
  const [unit, setUnit] = useState<"ft" | "m">("ft");
  const [state, setState] = useState<{ phase: "idle" } | { phase: "loading" } | { phase: "error"; message: string } | { phase: "ok"; s: Sample[]; line: LatLon[] }>({ phase: "idle" });
  const [fitKey, setFitKey] = useState("");
  const seq = useRef(0);

  async function profileOf(line: LatLon[]) {
    const id = ++seq.current;
    setState({ phase: "loading" });
    try {
      const rs = resample(line, SAMPLES);
      const [a, b] = await Promise.all([copernicusBatch(rs.slice(0, 100)), copernicusBatch(rs.slice(100))]);
      const els = [...a, ...b];
      if (id === seq.current) setState({ phase: "ok", s: rs.map((p, i) => ({ ...p, m: els[i] })), line });
    } catch (e) {
      if (id === seq.current) setState({ phase: "error", message: asToolError(e).message });
    }
  }

  const s = state.phase === "ok" ? state.s : null;
  let stats: { gain: number; loss: number; min: number; max: number; grade: number } | null = null;
  if (s) {
    let gain = 0, loss = 0, grade = 0;
    for (let i = 1; i < s.length; i++) {
      const dz = s[i].m - s[i - 1].m;
      if (dz > 0) gain += dz;
      else loss -= dz;
      const dd = s[i].d - s[i - 1].d;
      if (dd > 30) grade = Math.max(grade, Math.abs(dz / dd));
    }
    stats = { gain, loss, min: Math.min(...s.map((x) => x.m)), max: Math.max(...s.map((x) => x.m)), grade };
  }
  const len = (m: number) => (unit === "ft" ? `${n0(m * M_TO_FT)} ft` : `${n0(m)} m`);
  const dist = (m: number) => (unit === "ft" ? `${n(m / 1609.344, 2)} mi` : `${n(m / 1000, 2)} km`);
  const line = state.phase === "ok" ? state.line : pts;

  return (
    <div>
      <Tabs value={mode} onChange={(m) => { setMode(m); setState({ phase: "idle" }); }} options={[["draw", "Draw a path on the map"], ["route", "Follow roads or trails between two places"]]} />
      {mode === "route" && (
        <>
          <div className="mb-3 max-w-xs">
            <ProfileSelect value={profile} onChange={setProfile} />
          </div>
          <PlacePairForm
            submitLabel="Get elevation profile"
            onResolve={async (a, b) => {
              setFitKey(`${a.lat},${b.lat}`);
              try {
                const r = await route([a, b], profile);
                setPts([]);
                await profileOf(r.line);
              } catch (e) {
                setState({ phase: "error", message: asToolError(e).message });
              }
            }}
          />
        </>
      )}
      <TileMap
        ariaLabel={mode === "draw" ? "Map. Click to add points along your path." : "Map of the route"}
        markers={mode === "draw" ? pts.map((p) => ({ ...p, r: 4 })) : []}
        shapes={line.length > 1 ? [{ points: line, color: "#c2410c", width: 3 }] : []}
        fitKey={mode === "route" ? fitKey + (state.phase === "ok" ? "ok" : "") : undefined}
        initial={{ lat: 39.7, lon: -105.2, zoom: 9 }}
        height={400}
        onPick={mode === "draw" ? (p) => setPts((x) => [...x, p]) : undefined}
      />
      {mode === "draw" && (
        <div className="mt-2 flex flex-wrap gap-2">
          <Btn primary onClick={() => void profileOf(pts)} disabled={pts.length < 2 || state.phase === "loading"}>
            Get elevation profile
          </Btn>
          <Btn onClick={() => setPts((x) => x.slice(0, -1))} disabled={!pts.length}>
            Undo last point
          </Btn>
          <Btn onClick={() => { setPts([]); setState({ phase: "idle" }); }} disabled={!pts.length}>
            Clear
          </Btn>
          <span className="self-center text-xs text-[var(--color-muted)]">Click the map along your path (at least 2 points), then press the button.</span>
        </div>
      )}
      <div className="mt-4" aria-live="polite">
        {state.phase === "loading" && <Loading note={`Reading ground elevation at ${SAMPLES} points along the path…`} />}
        {state.phase === "error" && <ErrorBox title="No profile" message={state.message} />}
      </div>
      {s && stats && (
        <div className="rounded-lg border border-[var(--color-line)]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
            <div>
              <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">Elevation profile · {dist(s[s.length - 1].d)}</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight">
                ↑ {len(stats.gain)} · ↓ {len(stats.loss)}
              </p>
            </div>
            <Tabs value={unit} onChange={setUnit} options={[["ft", "Feet / miles"], ["m", "Metres / km"]]} />
          </div>
          <div className="p-4">
            <Chart s={s} unit={unit} />
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
              <p>Lowest: <strong>{len(stats.min)}</strong></p>
              <p>Highest: <strong>{len(stats.max)}</strong></p>
              <p>Start → end: <strong>{len(s[s.length - 1].m - s[0].m)}</strong></p>
              <p>Steepest stretch: <strong>{n(stats.grade * 100, 0)}%</strong></p>
            </div>
            <div className="mt-3">
              <Btn onClick={() => downloadText(toCsv([["distance_m", "latitude", "longitude", "elevation_m"], ...s.map((x) => [Math.round(x.d), x.lat.toFixed(6), x.lon.toFixed(6), x.m])]), "elevation-profile.csv", "text/csv")}>Download CSV</Btn>
            </div>
            <p className="mt-3 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
              Ground elevation at {SAMPLES} evenly spaced points from the Copernicus GLO-90 digital elevation model (<Ext href={COPERNICUS_DOI_URL}>ESA</Ext>) via{" "}
              <Ext href={OPEN_METEO_DOCS_URL}>Open-Meteo</Ext>: a 90 m grid of the surface, so bridges, tunnels and steep cliffs are smoothed and climbs shorter than about 100 m can be
              missed. Total climb counts every rise between samples; GPS watches usually report more. Steepest stretch: largest grade between neighbouring samples.
              {mode === "route" && (
                <>
                  {" "}
                  <RoutingCredit />
                </>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
