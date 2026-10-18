"use client";

import { useRef, useState } from "react";
import TileMap from "./TileMap";
import { ErrorBox, Headline, n, fmtMiKm } from "./GeoBits";
import { Btn, ProfileSelect, RoutingCredit } from "./ToolBits";
import { fieldClass } from "./CalcBits";
import { inverse } from "@/lib/geodesy";
import { fmtDuration, PROFILE_LABEL, route, trip, type Profile, type RouteResult } from "@/lib/routing";
import { resolvePlaces, splitLines, type ListedPlace, type ListError } from "@/lib/place-list";
import { toCsv } from "@/lib/geo-formats";
import { downloadText } from "@/lib/svg-export";
import { asToolError } from "@/lib/errors";

const MAX = 25;

interface Done {
  stops: ListedPlace[];
  r: RouteResult;
  optimised: boolean;
  round: boolean;
  profile: Profile;
  errors: ListError[];
  straightM: number;
}

export default function MultiStopTool() {
  const [text, setText] = useState("Chicago, IL\nMilwaukee, WI\nMadison, WI\nRockford, IL");
  const [profile, setProfile] = useState<Profile>("car");
  const [order, setOrder] = useState<"as" | "best">("as");
  const [round, setRound] = useState(false);
  const [phase, setPhase] = useState<"idle" | "geocoding" | "routing">("idle");
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState<Done | null>(null);
  const [error, setError] = useState<string | null>(null);
  const seq = useRef(0);

  async function run() {
    const lines = splitLines(text, MAX);
    setError(null);
    if (lines.length < 2) return setError("Enter at least two stops, one per line.");
    const id = ++seq.current;
    setPhase("geocoding");
    setProgress(0);
    try {
      const { places, errors } = await resolvePlaces(lines, false, setProgress);
      if (id !== seq.current) return;
      if (places.length < 2) throw new Error(errors[0]?.error ?? "Fewer than two stops could be found.");
      setPhase("routing");
      let stops = places, r: RouteResult;
      if (order === "best" && places.length > 2) {
        const t = await trip(places, round, profile);
        stops = t.order.map((i) => places[i]);
        r = t;
      } else {
        r = await route(round ? [...places, places[0]] : places, profile);
      }
      if (id !== seq.current) return;
      const seqPts = round ? [...stops, stops[0]] : stops;
      const straightM = seqPts.slice(1).reduce((s, p, i) => s + inverse(seqPts[i], p).metres, 0);
      setDone({ stops, r, optimised: order === "best" && places.length > 2, round, profile, errors, straightM });
    } catch (e) {
      if (id === seq.current) setError(asToolError(e).message);
    } finally {
      if (id === seq.current) setPhase("idle");
    }
  }

  const legRows = done
    ? done.r.legs.map((l, i) => {
        const from = done.stops[i], to = done.stops[(i + 1) % done.stops.length];
        return { from, to, l };
      })
    : [];
  return (
    <div>
      <label htmlFor="ms-stops" className="mb-1.5 block font-medium">
        Stops, one per line (up to {MAX}) — addresses, places or coordinates
      </label>
      <textarea id="ms-stops" className={`${fieldClass} h-40`} value={text} onChange={(e) => setText(e.target.value)} />
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <ProfileSelect value={profile} onChange={setProfile} />
        <label className="block">
          <span className="mb-1.5 block font-medium">Order of stops</span>
          <select className={fieldClass} value={order} onChange={(e) => setOrder(e.target.value as "as" | "best")}>
            <option value="as">As I listed them</option>
            <option value="best">{round ? "Shortest order (start at the first stop)" : "Shortest order (keep the first and last stops)"}</option>
          </select>
        </label>
        <label className="flex items-end gap-2 pb-3 text-sm">
          <input type="checkbox" checked={round} onChange={(e) => setRound(e.target.checked)} />
          Return to the first stop (round trip)
        </label>
      </div>
      <div className="mt-3">
        <Btn primary onClick={() => void run()} disabled={phase !== "idle"}>
          {phase === "geocoding" ? `Finding stops… ${progress}` : phase === "routing" ? "Routing…" : "Calculate route"}
        </Btn>
      </div>
      {error && (
        <div className="mt-4">
          <ErrorBox title="The route could not be calculated" message={error} />
        </div>
      )}
      {done && (
        <div className="mt-5 rounded-lg border border-[var(--color-line)]">
          <Headline
            kicker={`${done.stops.length} stops · ${PROFILE_LABEL[done.profile].toLowerCase()}${done.round ? " · round trip" : ""}${done.optimised ? " · reordered for the shortest drive" : ""}`}
            title={`${n(done.r.metres / 1609.344)} mi · ${fmtDuration(done.r.seconds)}`}
            sub={`${n(done.r.metres / 1000)} km total · ${n(done.straightM / 1609.344)} mi if every leg were a straight line`}
          />
          <div className="p-5 text-sm">
            {done.errors.length > 0 && (
              <p className="mb-3 rounded-md border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-3">
                Skipped {done.errors.length} line{done.errors.length === 1 ? "" : "s"} that could not be found: {done.errors.map((e) => `"${e.input}"`).join(", ")}.
              </p>
            )}
            <div className="mb-3 overflow-x-auto rounded-md border border-[var(--color-line)]">
              <table className="w-full text-left">
                <thead className="bg-[var(--color-accent-soft)]">
                  <tr>
                    <th className="px-3 py-2 font-medium">Leg</th>
                    <th className="px-3 py-2 font-medium">From → to</th>
                    <th className="px-3 py-2 font-medium">Distance</th>
                    <th className="px-3 py-2 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-line)]">
                  {legRows.map(({ from, to, l }, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2">{i + 1}</td>
                      <td className="px-3 py-2">
                        {from.label} → {to.label}
                      </td>
                      <td className="px-3 py-2">{fmtMiKm(l.metres, 1)}</td>
                      <td className="px-3 py-2">{fmtDuration(l.seconds)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Btn
              onClick={() =>
                downloadText(
                  toCsv([["leg", "from", "to", "miles", "km", "minutes"], ...legRows.map(({ from, to, l }, i) => [i + 1, from.label, to.label, (l.metres / 1609.344).toFixed(2), (l.metres / 1000).toFixed(2), Math.round(l.seconds / 60)])]),
                  "route-legs.csv",
                  "text/csv",
                )
              }
            >
              Download legs as CSV
            </Btn>
            <p className="mt-3 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
              {done.optimised ? "Shortest order: OSRM's trip service (a fast heuristic for the travelling-salesman problem — usually the best order, not guaranteed). " : ""}
              <RoutingCredit /> Stops: OpenStreetMap via Photon — check the matched names above.
            </p>
          </div>
        </div>
      )}
      <div className="mt-4">
        <TileMap
          ariaLabel="Map of the stops and the route"
          markers={done ? done.stops.map((s, i) => ({ ...s, label: String(i + 1), color: i === 0 ? "#15803d" : "#1d4ed8" })) : []}
          shapes={done ? [{ points: done.r.line, color: "#c2410c", width: 3.5 }] : []}
          fitKey={done ? `${done.r.metres}` : ""}
          initial={{ lat: 39, lon: -96, zoom: 3 }}
          maxFitZoom={13}
          height={420}
        />
      </div>
    </div>
  );
}
