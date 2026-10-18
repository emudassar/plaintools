"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import TileMap from "./TileMap";
import { ErrorBox, Ext, Headline, Loading, n, n0, Row, Table, fmtMiKm } from "./GeoBits";
import { RoutingCredit } from "./ToolBits";
import { fieldClass } from "./CalcBits";
import { inverse, pathPoints } from "@/lib/geodesy";
import { fmtDuration, route, type RouteResult } from "@/lib/routing";
import { GAZETTEER_URL, loadPlaces, placeLabel, findPlaces, DATA_VINTAGE, type Place } from "@/lib/us-data";
import { asToolError } from "@/lib/errors";

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");

function CityInput({ label, places, value, onChange, chosen, onChoose }: { label: string; places: Place[]; value: string; onChange: (v: string) => void; chosen: Place | null; onChoose: (p: Place) => void }) {
  const [open, setOpen] = useState(false);
  const sugg = useMemo(() => {
    const q = norm(value.split(",")[0]);
    if (q.length < 2 || chosen) return [];
    return places
      .filter((p) => norm(p.name).startsWith(q))
      .sort((a, b) => (b.pop ?? 0) - (a.pop ?? 0))
      .slice(0, 8);
  }, [value, places, chosen]);
  return (
    <div className="relative">
      <label className="mb-1.5 block font-medium">
        {label}
        <input
          className={`${fieldClass} mt-1.5 font-normal`}
          value={value}
          placeholder="City, ST — e.g. Austin, TX"
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          autoComplete="off"
        />
      </label>
      {open && sugg.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-[var(--color-line)] bg-white text-sm shadow">
          {sugg.map((p) => (
            <li key={p.geoid}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left hover:bg-[var(--color-accent-soft)]"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChoose(p);
                  setOpen(false);
                }}
              >
                {placeLabel(p)} <span className="text-[var(--color-muted)]">· {p.pop === null ? "" : `pop. ${n0(p.pop)}`}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function resolve(places: Place[], text: string, chosen: Place | null): { place: Place | null; options: Place[]; error: string | null } {
  if (chosen) return { place: chosen, options: [], error: null };
  const hits = findPlaces(places, text);
  if (!hits.length) return { place: null, options: [], error: `No US city or town called "${text}" in the Census list. Check the spelling, or add the state (e.g. "Springfield, IL").` };
  if (hits.length > 1 && !/,/.test(text)) return { place: null, options: hits.slice(0, 12), error: null };
  return { place: hits[0], options: [], error: null };
}

export default function DistanceCitiesTool() {
  const [places, setPlaces] = useState<Place[] | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [ta, setTa] = useState("Chicago, IL");
  const [tb, setTb] = useState("Denver, CO");
  const [ca, setCa] = useState<Place | null>(null);
  const [cb, setCb] = useState<Place | null>(null);
  const [pair, setPair] = useState<[Place, Place] | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [opts, setOpts] = useState<{ which: "a" | "b"; list: Place[] } | null>(null);
  const [road, setRoad] = useState<{ phase: "loading" } | { phase: "ok"; r: RouteResult } | { phase: "error"; message: string } | null>(null);
  const seq = useRef(0);

  useEffect(() => {
    loadPlaces().then(setPlaces, (e) => setLoadErr(asToolError(e).message));
  }, []);

  async function go(a: Place, b: Place) {
    const id = ++seq.current;
    setPair([a, b]);
    setRoad({ phase: "loading" });
    try {
      const r = await route([a, b], "car");
      if (id === seq.current) setRoad({ phase: "ok", r });
    } catch (e) {
      if (id === seq.current) setRoad({ phase: "error", message: asToolError(e).message });
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!places) return;
    setMsg(null);
    setOpts(null);
    const A = resolve(places, ta, ca), B = resolve(places, tb, cb);
    if (A.error || B.error) return setMsg(A.error ?? B.error);
    if (A.options.length) return setOpts({ which: "a", list: A.options });
    if (B.options.length) return setOpts({ which: "b", list: B.options });
    if (A.place && B.place) void go(A.place, B.place);
  }

  const biggest = useMemo(() => (places ? [...places].sort((x, y) => (y.pop ?? 0) - (x.pop ?? 0)).slice(0, 15) : []), [places]);
  if (loadErr) return <ErrorBox title="The city list did not load" message={loadErr} onRetry={() => location.reload()} />;
  if (!places) return <Loading note="Loading 32,333 US cities and towns from the Census Gazetteer…" />;

  const g = pair ? inverse(pair[0], pair[1]) : null;
  return (
    <div>
      <form onSubmit={submit} className="mb-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <CityInput label="From city" places={places} value={ta} onChange={(v) => { setTa(v); setCa(null); }} chosen={ca} onChoose={(p) => { setCa(p); setTa(placeLabel(p)); }} />
          <CityInput label="To city" places={places} value={tb} onChange={(v) => { setTb(v); setCb(null); }} chosen={cb} onChoose={(p) => { setCb(p); setTb(placeLabel(p)); }} />
        </div>
        <button type="submit" className="mt-3 w-full rounded-md bg-[var(--color-accent)] px-5 py-2.5 font-medium text-white sm:w-auto">
          Get distance
        </button>
        {msg && (
          <p className="mt-3 rounded-md border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-3 text-sm" role="alert">
            {msg}
          </p>
        )}
        {opts && (
          <div className="mt-3 rounded-md border border-[var(--color-line)] p-3 text-sm">
            <p className="mb-2 font-medium">Several places share that name. Which one?</p>
            <div className="flex flex-wrap gap-2">
              {opts.list.map((p) => (
                <button
                  key={p.geoid}
                  type="button"
                  className="rounded border border-[var(--color-line)] bg-white px-2 py-1"
                  onClick={() => {
                    if (opts.which === "a") { setCa(p); setTa(placeLabel(p)); } else { setCb(p); setTb(placeLabel(p)); }
                    setOpts(null);
                  }}
                >
                  {placeLabel(p)}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>

      {pair && g && (
        <div className="mb-4 rounded-lg border border-[var(--color-line)]">
          <Headline
            kicker={`${placeLabel(pair[0])} → ${placeLabel(pair[1])}`}
            title={`${n(g.metres / 1609.344)} miles apart`}
            sub={`${n(g.metres / 1000)} km in a straight line${road?.phase === "ok" ? ` · ${n(road.r.metres / 1609.344)} mi (${fmtDuration(road.r.seconds)}) by road` : ""}`}
          />
          <div className="p-5 text-sm">
            {road?.phase === "loading" && <p className="mb-3 text-[var(--color-muted)]">Finding the driving route…</p>}
            {road?.phase === "error" && <p className="mb-3">Driving distance unavailable: {road.message}</p>}
            <Table>
              <Row k="Straight-line distance">{fmtMiKm(g.metres, 1)}</Row>
              {road?.phase === "ok" && <Row k="Driving distance and time">{fmtMiKm(road.r.metres, 0)} · {fmtDuration(road.r.seconds)} without traffic</Row>}
              {pair.map((p, i) => (
                <Row key={i} k={i === 0 ? "From" : "To"}>
                  {placeLabel(p)} — {p.kind || "place"}, population {p.pop === null ? "not published" : n0(p.pop)}, land area {n(p.landSqMi, 1)} sq mi
                </Row>
              ))}
            </Table>
            <h3 className="mb-2 font-semibold">{placeLabel(pair[0])} to the largest US cities</h3>
            <div className="mb-4 overflow-x-auto rounded-md border border-[var(--color-line)]">
              <table className="w-full text-left">
                <tbody className="divide-y divide-[var(--color-line)]">
                  {biggest
                    .filter((c) => c.geoid !== pair[0].geoid)
                    .slice(0, 10)
                    .map((c) => (
                      <tr key={c.geoid}>
                        <td className="px-3 py-2">{placeLabel(c)}</td>
                        <td className="px-3 py-2">{fmtMiKm(inverse(pair[0], c).metres, 0)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <footer className="border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
              City points: each place&apos;s internal point from the <Ext href={GAZETTEER_URL}>Census Gazetteer</Ext> ({DATA_VINTAGE}). Straight lines: Vincenty on WGS84, from city
              point to city point (not city limits). <RoutingCredit />
            </footer>
          </div>
        </div>
      )}
      <TileMap
        ariaLabel="Map of the two cities"
        markers={pair ? [{ ...pair[0], label: pair[0].name }, { ...pair[1], label: pair[1].name, color: "#c2410c" }] : []}
        shapes={pair ? [...(road?.phase === "ok" ? [{ points: road.r.line, color: "#c2410c", width: 3 }] : []), { points: pathPoints(pair[0], pair[1], 64), dashed: true }] : []}
        fitKey={pair ? `${pair[0].geoid}-${pair[1].geoid}` : ""}
        initial={{ lat: 39, lon: -96, zoom: 3 }}
        maxFitZoom={10}
        height={380}
      />
    </div>
  );
}
