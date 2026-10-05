"use client";

import { useState, useId } from "react";
import { calculateHipRoof, ftIn, GRIFFITH_URL, type HipRoofResult } from "@/lib/hip-roof";
import { asToolError, type ErrorKind } from "@/lib/errors";

/** idle / error / result. Arithmetic in the browser — no loading state. */

type State =
  | { phase: "idle" }
  | { phase: "error"; kind: ErrorKind; message: string }
  | { phase: "result"; data: HipRoofResult };

const n = (x: number, d = 1) => x.toLocaleString("en-US", { maximumFractionDigits: d });

function Row({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <tr>
      <td className="py-1.5 pr-3 font-medium">{label}</td>
      <td className="py-1.5 pr-3">{value}</td>
      <td className="py-1.5 text-[var(--color-muted)]">{note ?? ""}</td>
    </tr>
  );
}

function ResultCard({ data }: { data: HipRoofResult }) {
  const oh = data.overhangIn > 0;
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          {n(data.lengthFt, 2)} × {n(data.widthFt, 2)} ft hip roof at {n(data.pitch, 2)}/12
          {oh ? ` with ${n(data.overhangIn, 1)} in overhang` : ""}
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {n(data.roofAreaSqft, 0)} sq ft of roof · {n(data.squares, 2)} squares
        </p>
        <p className="mt-1 text-[var(--color-muted)]">
          {n(data.roofAreaSqm, 1)} m². Ridge {data.ridgeFt > 0 ? ftIn(data.ridgeFt) : "none (a pyramid hip)"}, each
          hip rafter {ftIn(oh ? data.hipRafterWithOverhangFt : data.hipRafterFt)}
          {oh ? " including the overhang" : ""}.
          {data.swapped && " Length and width were swapped so the length is the longer side."}
        </p>
      </div>
      <div className="p-5 text-sm">
        <div className="mb-5 overflow-x-auto">
          <table className="w-full">
            <tbody className="divide-y divide-[var(--color-line)]">
              <Row label="Pitch" value={`${n(data.pitch, 2)}/12 = ${n(data.angleDeg, 2)}°`} note={`slope factor ${n(data.slopeFactor, 4)}`} />
              <Row label="Plan area" value={`${n(data.planAreaSqft, 1)} sq ft`} note={oh ? "outside the overhang" : "building footprint"} />
              <Row label="Each hip end (triangle)" value={`${n(data.endAreaSqft, 1)} sq ft`} note="× 2" />
              <Row label="Each side (trapezoid)" value={`${n(data.sideAreaSqft, 1)} sq ft`} note="× 2" />
              <Row label="Ridge length" value={data.ridgeFt > 0 ? ftIn(data.ridgeFt) : "0 — pyramid"} note="length − width" />
              <Row label="Height of roof" value={ftIn(data.roofRiseFt)} note="wall plate to ridge line" />
              <Row label="Common rafter" value={ftIn(data.commonRafterFt)} note={oh ? `${ftIn(data.commonRafterWithOverhangFt)} with overhang` : `run ${ftIn(data.commonRunFt)}`} />
              <Row
                label="Hip rafter"
                value={ftIn(data.hipRafterFt)}
                note={oh ? `${ftIn(data.hipRafterWithOverhangFt)} with overhang` : `${n(data.hipUnitIn, 2)} in per foot of common run`}
              />
              <Row label="Total hip length" value={ftIn(data.hipLengthTotalFt)} note="4 hips; add the ridge for total hip-and-ridge length" />
            </tbody>
          </table>
        </div>
        <h3 className="mb-2 font-semibold tracking-wide uppercase">The arithmetic</h3>
        <div className="mb-5 rounded-md border border-[var(--color-line)] p-4 text-[var(--color-muted)]">
          <p>
            Slope factor = √(12² + {n(data.pitch, 2)}²) ÷ 12 = {n(data.slopeFactor, 4)}. Roof area ={" "}
            {n(data.planAreaSqft, 1)} sq ft plan × {n(data.slopeFactor, 4)} = {n(data.roofAreaSqft, 1)} sq ft.
          </p>
          <p className="mt-2">
            Hip rafter = common run {n(data.commonRunFt + (oh ? data.overhangIn / 12 : 0), 3)} ft × √(2 × 12² +{" "}
            {n(data.pitch, 2)}²) ÷ 12 = {n(oh ? data.hipRafterWithOverhangFt : data.hipRafterFt, 3)} ft — the
            framing square&rsquo;s &ldquo;17 on the tongue&rdquo; (12 × √2 = 16.97 in) per foot of common run.
          </p>
        </div>
        <h3 className="mb-2 font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
        <p className="text-[var(--color-muted)]">
          This is the geometry of a rectangular roof with the same pitch on all four sides. Lengths are
          theoretical line lengths, with nothing taken off for a ridge board and no cut allowances.
          Areas are the roof surface only — they do not include waste, starter, or hip-and-ridge cap
          material, which depend on the product and its installation instructions. It does not size
          rafters or check loads.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Method: right-triangle geometry with pitch per 12 in of run; hip length per foot of common
            run as described in Ira S. Griffith, <em>Carpentry</em>, §23. Retrieved {data.retrievedAt}.
          </p>
          <p className="mt-1">
            <a href={GRIFFITH_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              Griffith — Determining length of hip or valley rafter
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function HipRoofTool() {
  const [unit, setUnit] = useState<"ft" | "m">("ft");
  const [length, setLength] = useState("40");
  const [width, setWidth] = useState("24");
  const [pitch, setPitch] = useState("6");
  const [overhang, setOverhang] = useState("12");
  const [state, setState] = useState<State>({ phase: "idle" });
  const ids = { unit: useId(), l: useId(), w: useId(), p: useId(), o: useId() };
  const num = (x: string) => (x.trim() === "" ? NaN : Number(x));

  function run(e: React.FormEvent) {
    e.preventDefault();
    try {
      setState({
        phase: "result",
        data: calculateHipRoof({
          length: num(length),
          width: num(width),
          unit,
          pitch: num(pitch),
          overhangIn: overhang.trim() === "" ? 0 : Number(overhang),
        }),
      });
    } catch (err) {
      const e2 = asToolError(err);
      setState({ phase: "error", kind: e2.kind, message: e2.message });
    }
  }

  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";

  return (
    <div>
      <form onSubmit={run} className="mb-6">
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={ids.unit} className="mb-1.5 block font-medium">
              Building measured in
            </label>
            <select id={ids.unit} value={unit} onChange={(e) => setUnit(e.target.value as "ft" | "m")} className={field}>
              <option value="ft">Feet</option>
              <option value="m">Metres</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor={ids.l} className="mb-1.5 block font-medium">
                Length ({unit})
              </label>
              <input id={ids.l} type="number" inputMode="decimal" min="0" step="any" value={length} onChange={(e) => setLength(e.target.value)} className={field} />
            </div>
            <div>
              <label htmlFor={ids.w} className="mb-1.5 block font-medium">
                Width ({unit})
              </label>
              <input id={ids.w} type="number" inputMode="decimal" min="0" step="any" value={width} onChange={(e) => setWidth(e.target.value)} className={field} />
            </div>
          </div>
          <div>
            <label htmlFor={ids.p} className="mb-1.5 block font-medium">
              Pitch (inches of rise per 12)
            </label>
            <input id={ids.p} type="number" inputMode="decimal" min="0" step="any" value={pitch} onChange={(e) => setPitch(e.target.value)} className={field} />
          </div>
          <div>
            <label htmlFor={ids.o} className="mb-1.5 block font-medium">
              Eave overhang, inches <span className="font-normal text-[var(--color-muted)]">(horizontal, 0 for none)</span>
            </label>
            <input id={ids.o} type="number" inputMode="decimal" min="0" step="any" value={overhang} onChange={(e) => setOverhang(e.target.value)} className={field} />
          </div>
        </div>
        <button type="submit" className="rounded-md bg-[var(--color-accent)] px-5 py-2.5 font-medium text-white">
          Calculate hip roof
        </button>
        <p className="mt-1.5 text-xs text-[var(--color-muted)]">
          Measure the building at the wall plates. Runs entirely in your browser; nothing is sent anywhere.
        </p>
      </form>

      <div aria-live="polite">
        {state.phase === "error" && (
          <div className="rounded-lg border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-5">
            <p className="font-medium">That input could not be used</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{state.message}</p>
          </div>
        )}
        {state.phase === "result" && <ResultCard data={state.data} />}
      </div>
    </div>
  );
}
