"use client";

import { useRef, useState } from "react";
import TileMap from "./TileMap";
import { ErrorBox, Ext, n } from "./GeoBits";
import { Btn, ProfileSelect, RoutingCredit, Tabs } from "./ToolBits";
import { fieldClass } from "./CalcBits";
import { inverse, VINCENTY_URL } from "@/lib/geodesy";
import { PROFILE_LABEL, table, type Profile } from "@/lib/routing";
import { resolvePlaces, splitLines, type ListedPlace, type ListError } from "@/lib/place-list";
import { toCsv } from "@/lib/geo-formats";
import { downloadText } from "@/lib/svg-export";
import { asToolError } from "@/lib/errors";

const MAX = 20;
type View = "mi" | "km" | "min" | "line";

interface Done {
  places: ListedPlace[];
  errors: ListError[];
  metres: (number | null)[][];
  seconds: (number | null)[][];
  profile: Profile;
}

export default function DistanceMatrixTool() {
  const [text, setText] = useState("Boston, MA\nNew York, NY\nPhiladelphia, PA\nBaltimore, MD\nWashington, DC");
  const [profile, setProfile] = useState<Profile>("car");
  const [phase, setPhase] = useState<"idle" | "geocoding" | "routing">("idle");
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState<Done | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>("mi");
  const seq = useRef(0);

  async function run() {
    const lines = splitLines(text, MAX);
    setError(null);
    if (lines.length < 2) return setError("Enter at least two places, one per line.");
    const id = ++seq.current;
    setPhase("geocoding");
    try {
      const { places, errors } = await resolvePlaces(lines, false, setProgress);
      if (places.length < 2) throw new Error(errors[0]?.error ?? "Fewer than two places could be found.");
      setPhase("routing");
      const t = await table(places, profile);
      if (id === seq.current) setDone({ places, errors, metres: t.metres, seconds: t.seconds, profile });
    } catch (e) {
      if (id === seq.current) setError(asToolError(e).message);
    } finally {
      if (id === seq.current) setPhase("idle");
    }
  }

  const cell = (i: number, j: number): string => {
    if (!done) return "";
    if (i === j) return "—";
    if (view === "line") return n(inverse(done.places[i], done.places[j]).metres / 1609.344, 0);
    const v = view === "min" ? done.seconds[i]?.[j] : done.metres[i]?.[j];
    if (v === null || v === undefined) return "no route";
    return view === "mi" ? n(v / 1609.344, 0) : view === "km" ? n(v / 1000, 0) : n(v / 60, 0);
  };
  const unit = { mi: "miles by road", km: "km by road", min: "minutes", line: "straight-line miles" }[view];

  function csv() {
    if (!done) return;
    const head = ["from \\ to", ...done.places.map((p) => p.label)];
    const rows = done.places.map((p, i) => [p.label, ...done.places.map((_, j) => cell(i, j).replace(/,/g, ""))]);
    downloadText(toCsv([[`${unit}`], head, ...rows]), `distance-matrix-${view}.csv`, "text/csv");
  }

  return (
    <div>
      <label htmlFor="dm-places" className="mb-1.5 block font-medium">
        Places, one per line (2–{MAX}) — addresses, cities or coordinates
      </label>
      <textarea id="dm-places" className={`${fieldClass} h-40`} value={text} onChange={(e) => setText(e.target.value)} />
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <div className="w-48">
          <ProfileSelect value={profile} onChange={setProfile} />
        </div>
        <Btn primary onClick={() => void run()} disabled={phase !== "idle"}>
          {phase === "geocoding" ? `Finding places… ${progress}` : phase === "routing" ? "Calculating matrix…" : "Build matrix"}
        </Btn>
      </div>
      {error && (
        <div className="mt-4">
          <ErrorBox title="The matrix could not be built" message={error} />
        </div>
      )}
      {done && (
        <div className="mt-5">
          <Tabs value={view} onChange={setView} options={[["mi", "Miles"], ["km", "Kilometres"], ["min", "Minutes"], ["line", "Straight line (mi)"]]} />
          {done.errors.length > 0 && <p className="mb-3 text-sm">Not found and left out: {done.errors.map((e) => `"${e.input}"`).join(", ")}.</p>}
          <p className="mb-2 text-sm text-[var(--color-muted)]">
            Rows are where you start, columns where you end, in {unit}
            {view === "line" ? "" : ` (${PROFILE_LABEL[done.profile].toLowerCase()})`}. Road values can differ by direction because of one-way streets and turns.
          </p>
          <div className="overflow-x-auto rounded-md border border-[var(--color-line)]">
            <table className="w-full text-right text-sm">
              <thead className="bg-[var(--color-accent-soft)]">
                <tr>
                  <th className="px-2 py-2 text-left font-medium">From \ To</th>
                  {done.places.map((p, j) => (
                    <th key={j} className="px-2 py-2 font-medium" title={p.label}>
                      {j + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-line)]">
                {done.places.map((p, i) => (
                  <tr key={i}>
                    <td className="max-w-[16rem] truncate px-2 py-2 text-left" title={p.label}>
                      {i + 1}. {p.label}
                    </td>
                    {done.places.map((_, j) => (
                      <td key={j} className="px-2 py-2 tabular-nums">
                        {cell(i, j)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3">
            <Btn onClick={csv}>Download this table as CSV</Btn>
          </div>
          <p className="mt-3 text-xs text-[var(--color-muted)]">
            Road values: OSRM table service. <RoutingCredit extra={<> Straight lines: <Ext href={VINCENTY_URL}>Vincenty</Ext> on WGS84.</>} /> Places: OpenStreetMap via Photon.
          </p>
          <div className="mt-4">
            <TileMap ariaLabel="Map of the places in the matrix" markers={done.places.map((p, i) => ({ ...p, label: String(i + 1) }))} fitKey={done.places.map((p) => p.label).join("|")} maxFitZoom={12} height={340} />
          </div>
        </div>
      )}
    </div>
  );
}
