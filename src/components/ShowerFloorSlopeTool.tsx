"use client";

import { useState, useId } from "react";
import {
  calculateShowerSlope,
  IRC_CH27_URL,
  QUOTES,
  toFraction,
  type LenUnit,
  type SlopeResult,
} from "@/lib/shower-floor-slope";
import { asToolError, type ErrorKind } from "@/lib/errors";

/** idle / error / result. Arithmetic in the browser — no loading state. */

type State =
  | { phase: "idle" }
  | { phase: "error"; kind: ErrorKind; message: string }
  | { phase: "result"; data: SlopeResult };

const mm = (inches: number) => `${(inches * 25.4).toFixed(1)} mm`;
const n = (x: number, d = 2) =>
  x.toLocaleString("en-US", { maximumFractionDigits: d });

function Verdict({
  v,
  label,
}: {
  v: "below" | "within" | "above";
  label: string;
}) {
  const ok = v === "within";
  return (
    <div
      className={`mb-4 rounded-md border p-4 text-sm ${ok ? "border-[var(--color-line)]" : "border-[var(--color-warn-line)] bg-[var(--color-warn-soft)]"}`}
    >
      {label}
    </div>
  );
}

function ResultCard({ data }: { data: SlopeResult }) {
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          Height of the floor at the edge, above the drain
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {toFraction(data.minRiseIn, "up")} to{" "}
          {toFraction(data.maxRiseIn, "down")}
        </p>
        <p className="mt-1 text-[var(--color-muted)]">
          {n(data.minRiseIn, 3)}–{n(data.maxRiseIn, 3)} in ({mm(data.minRiseIn)}
          –{mm(data.maxRiseIn)}) over {n(data.runIn, 2)} in from the drain — the
          IRC&rsquo;s ¼ in to ½ in per foot range.
        </p>
      </div>
      <div className="p-5">
        {data.planned && (
          <Verdict
            v={data.planned.verdict}
            label={`Your planned ${toFraction(data.planned.riseIn)} rise is ${n(data.planned.inPerFt, 3)} in per foot (${n(data.planned.percent, 2)}%) — ${
              data.planned.verdict === "within"
                ? "within the IRC P2709.1 range."
                : data.planned.verdict === "below"
                  ? "less than the IRC minimum of ¼ in per foot."
                  : "more than the IRC maximum of ½ in per foot."
            }`}
          />
        )}
        {data.curb && (
          <Verdict
            v={data.curb.verdict}
            label={`Curb depth ${toFraction(data.curb.depthIn)} (top of curb to top of drain) is ${
              data.curb.verdict === "within"
                ? "within"
                : data.curb.verdict === "below"
                  ? "less than"
                  : "more than"
            } the IRC's 2–9 inch range.`}
          />
        )}

        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          The arithmetic
        </h3>
        <div className="mb-5 rounded-md border border-[var(--color-line)] p-4 text-sm text-[var(--color-muted)]">
          <p>
            Minimum: {n(data.runIn, 2)} in ÷ 12 × ¼ in = {n(data.minRiseIn, 3)}{" "}
            in. Maximum: {n(data.runIn, 2)} in ÷ 12 × ½ in ={" "}
            {n(data.maxRiseIn, 3)} in. The fractions at the top are rounded
            inward to a 1/16 inch — the minimum up, the maximum down — so both
            stay inside the range.
          </p>
          <p className="mt-2">
            ¼ in per foot is 2.08% exactly; the code text labels it
            &ldquo;2-percent slope&rdquo;. Measure the run to the farthest point
            of the floor from the drain.
          </p>
        </div>

        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          What this page cannot tell you
        </h3>
        <p className="text-sm text-[var(--color-muted)]">
          These are the 2021 IRC figures. Your jurisdiction may have adopted a
          different edition, the Uniform Plumbing Code, or local amendments, and
          an inspector&rsquo;s reading governs. Prefabricated receptors and
          membrane systems also carry their manufacturer&rsquo;s requirements,
          and the liner beneath a mortar bed has its own pitch (the IPC quotes ¼
          in in 12 for liners).
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Source: 2021 International Residential Code, Section P2709.1 —
            &ldquo;{QUOTES.slope}&rdquo;. Read on the ICC public code viewer{" "}
            {data.retrievedAt}.
          </p>
          <p className="mt-1">
            <a
              href={IRC_CH27_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-accent)] underline"
            >
              ICC: 2021 IRC Chapter 27, Plumbing Fixtures
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function ShowerFloorSlopeTool() {
  const [run, setRun] = useState("30");
  const [runUnit, setRunUnit] = useState<LenUnit>("in");
  const [rise, setRise] = useState("");
  const [riseUnit, setRiseUnit] = useState<LenUnit>("in");
  const [curb, setCurb] = useState("");
  const [curbUnit, setCurbUnit] = useState<LenUnit>("in");
  const [state, setState] = useState<State>({ phase: "idle" });
  const ids = { run: useId(), rise: useId(), curb: useId() };
  const num = (x: string) => (x.trim() === "" ? NaN : Number(x));
  const opt = (x: string) => (x.trim() === "" ? null : num(x));

  function run_(e: React.FormEvent) {
    e.preventDefault();
    try {
      setState({
        phase: "result",
        data: calculateShowerSlope({
          run: num(run),
          runUnit,
          plannedRise: opt(rise),
          riseUnit,
          curbDepth: opt(curb),
          curbUnit,
        }),
      });
    } catch (err) {
      const e2 = asToolError(err);
      setState({ phase: "error", kind: e2.kind, message: e2.message });
    }
  }

  const field =
    "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";
  const unitSel = (v: LenUnit, set: (u: LenUnit) => void, label: string) => (
    <select
      aria-label={label}
      value={v}
      onChange={(e) => set(e.target.value as LenUnit)}
      className="rounded-md border border-[var(--color-line)] bg-white px-2"
    >
      <option value="in">in</option>
      <option value="ft">ft</option>
      <option value="mm">mm</option>
      <option value="cm">cm</option>
    </select>
  );

  return (
    <div>
      <form onSubmit={run_} className="mb-6">
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor={ids.run} className="mb-1.5 block font-medium">
              Distance from drain to farthest edge
            </label>
            <div className="flex gap-2">
              <input
                id={ids.run}
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={run}
                onChange={(e) => setRun(e.target.value)}
                className={field}
              />
              {unitSel(runUnit, setRunUnit, "Distance unit")}
            </div>
          </div>
          <div>
            <label htmlFor={ids.rise} className="mb-1.5 block font-medium">
              Planned height at that edge (optional)
            </label>
            <div className="flex gap-2">
              <input
                id={ids.rise}
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={rise}
                onChange={(e) => setRise(e.target.value)}
                className={field}
              />
              {unitSel(riseUnit, setRiseUnit, "Height unit")}
            </div>
          </div>
          <div>
            <label htmlFor={ids.curb} className="mb-1.5 block font-medium">
              Curb depth to drain (optional)
            </label>
            <div className="flex gap-2">
              <input
                id={ids.curb}
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={curb}
                onChange={(e) => setCurb(e.target.value)}
                className={field}
              />
              {unitSel(curbUnit, setCurbUnit, "Curb unit")}
            </div>
          </div>
        </div>
        <button
          type="submit"
          className="rounded-md bg-[var(--color-accent)] px-5 py-2.5 font-medium text-white"
        >
          Calculate the slope
        </button>
        <p className="mt-1.5 text-xs text-[var(--color-muted)]">
          Runs entirely in your browser. Nothing you enter is sent anywhere or
          stored.
        </p>
      </form>

      <div aria-live="polite">
        {state.phase === "error" && (
          <div className="rounded-lg border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-5">
            <p className="font-medium">That input could not be used</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              {state.message}
            </p>
          </div>
        )}
        {state.phase === "result" && <ResultCard data={state.data} />}
      </div>
    </div>
  );
}
