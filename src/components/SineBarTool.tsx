"use client";

import { useState, useId } from "react";
import {
  angleForHeights,
  dmsToDeg,
  heightForAngle,
  SINE_URL,
  TABLE_5IN,
  toDms,
  type AngleResult,
  type HeightResult,
  type LengthUnit,
} from "@/lib/sine-bar";
import { asToolError, type ErrorKind } from "@/lib/errors";

/** idle / error / result. Trigonometry in the browser — no loading state. */

type State =
  | { phase: "idle" }
  | { phase: "error"; kind: ErrorKind; message: string }
  | { phase: "result"; data: HeightResult | AngleResult };

const fmtLen = (x: number, u: LengthUnit) =>
  u === "in" ? `${x.toFixed(4)}″` : `${x.toFixed(3)} mm`;
const fmtDms = (d: number) => {
  const p = toDms(d);
  return `${p.d}° ${p.m}′ ${p.s}″`;
};

function ResultCard({ data }: { data: HeightResult | AngleResult }) {
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        {data.kind === "height" ? (
          <>
            <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
              Gauge block stack height
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">
              {fmtLen(data.height, data.unit)}
            </p>
            <p className="mt-1 text-[var(--color-muted)]">
              To set a{" "}
              {fmtLen(data.length, data.unit).replace(/\.0+(?=″| mm)/, "")} sine
              bar to {data.angleDeg.toFixed(4)}° ({fmtDms(data.angleDeg)}).
            </p>
          </>
        ) : (
          <>
            <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
              Angle set
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">
              {data.angleDeg.toFixed(4)}° ({fmtDms(data.angleDeg)})
            </p>
            <p className="mt-1 text-[var(--color-muted)]">
              From stacks of {fmtLen(data.h1, data.unit)} and{" "}
              {fmtLen(data.h2, data.unit)} under a{" "}
              {fmtLen(data.length, data.unit).replace(/\.0+(?=″| mm)/, "")} sine
              bar.
            </p>
          </>
        )}
      </div>
      <div className="p-5">
        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          The arithmetic
        </h3>
        <div className="mb-5 rounded-md border border-[var(--color-line)] p-4 text-sm text-[var(--color-muted)]">
          {data.kind === "height" ? (
            <p>
              H = L × sin(θ) = {data.length} × sin({data.angleDeg.toFixed(4)}°)
              = {data.length} ×{" "}
              {Math.sin((data.angleDeg * Math.PI) / 180).toFixed(6)} ={" "}
              <strong className="font-medium text-[var(--color-fg)]">
                {fmtLen(data.height, data.unit)}
              </strong>
            </p>
          ) : (
            <p>
              θ = asin((H1 − H2) ÷ L) = asin(({data.h1} − {data.h2}) ÷{" "}
              {data.length}) ={" "}
              <strong className="font-medium text-[var(--color-fg)]">
                {data.angleDeg.toFixed(4)}°
              </strong>
            </p>
          )}
          <p className="mt-2">
            L is the distance between the centres of the two rolls, not the
            overall length of the bar.
          </p>
        </div>
        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          What this page cannot tell you
        </h3>
        <p className="text-sm text-[var(--color-muted)]">
          The arithmetic is exact; the set-up is only as accurate as the
          bar&rsquo;s certified roll spacing, the gauge blocks, their wringing,
          and a clean, flat surface plate. Results are rounded to 0.0001″ or
          0.001 mm — finer than most block sets can build — so build the nearest
          stack your set allows.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Formula and 5-inch reference table: Virasak,{" "}
            <em>Manufacturing Processes 4-5</em>, Unit 3: Sine Bar (open
            textbook, CC BY). Retrieved {data.retrievedAt}.
          </p>
          <p className="mt-1">
            <a
              href={SINE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-accent)] underline"
            >
              Manufacturing Processes 4-5 — Sine Bar
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function SineBarTool() {
  const [mode, setMode] = useState<"height" | "angle">("height");
  const [unit, setUnit] = useState<LengthUnit>("in");
  const [length, setLength] = useState("5");
  const [d, setD] = useState("30");
  const [m, setM] = useState("0");
  const [s, setS] = useState("0");
  const [h1, setH1] = useState("1.5");
  const [h2, setH2] = useState("0");
  const [state, setState] = useState<State>({ phase: "idle" });
  const ids = {
    mode: useId(),
    len: useId(),
    d: useId(),
    m: useId(),
    s: useId(),
    h1: useId(),
    h2: useId(),
  };
  const num = (x: string) => (x.trim() === "" ? NaN : Number(x));

  function run(e: React.FormEvent) {
    e.preventDefault();
    try {
      const L = num(length);
      setState({
        phase: "result",
        data:
          mode === "height"
            ? heightForAngle(L, unit, dmsToDeg(num(d), num(m), num(s)))
            : angleForHeights(L, unit, num(h1), num(h2)),
      });
    } catch (err) {
      const e2 = asToolError(err);
      setState({ phase: "error", kind: e2.kind, message: e2.message });
    }
  }

  const field =
    "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";

  return (
    <div>
      <form onSubmit={run} className="mb-6">
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={ids.mode} className="mb-1.5 block font-medium">
              I want to find
            </label>
            <select
              id={ids.mode}
              value={mode}
              onChange={(e) => setMode(e.target.value as "height" | "angle")}
              className={field}
            >
              <option value="height">
                The gauge block height for an angle
              </option>
              <option value="angle">The angle from a block stack</option>
            </select>
          </div>
          <div>
            <label htmlFor={ids.len} className="mb-1.5 block font-medium">
              Sine bar length (roll centres)
            </label>
            <div className="flex gap-2">
              <input
                id={ids.len}
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className={field}
              />
              <select
                aria-label="Length unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value as LengthUnit)}
                className="rounded-md border border-[var(--color-line)] bg-white px-2"
              >
                <option value="in">inches</option>
                <option value="mm">mm</option>
              </select>
            </div>
          </div>
          {mode === "height" ? (
            <div className="grid grid-cols-3 gap-2 sm:col-span-2">
              <div>
                <label htmlFor={ids.d} className="mb-1.5 block font-medium">
                  Degrees
                </label>
                <input
                  id={ids.d}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={d}
                  onChange={(e) => setD(e.target.value)}
                  className={field}
                />
              </div>
              <div>
                <label htmlFor={ids.m} className="mb-1.5 block font-medium">
                  Minutes
                </label>
                <input
                  id={ids.m}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="any"
                  value={m}
                  onChange={(e) => setM(e.target.value)}
                  className={field}
                />
              </div>
              <div>
                <label htmlFor={ids.s} className="mb-1.5 block font-medium">
                  Seconds
                </label>
                <input
                  id={ids.s}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="any"
                  value={s}
                  onChange={(e) => setS(e.target.value)}
                  className={field}
                />
              </div>
            </div>
          ) : (
            <>
              <div>
                <label htmlFor={ids.h1} className="mb-1.5 block font-medium">
                  Stack under the raised roll (H1)
                </label>
                <input
                  id={ids.h1}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={h1}
                  onChange={(e) => setH1(e.target.value)}
                  className={field}
                />
              </div>
              <div>
                <label htmlFor={ids.h2} className="mb-1.5 block font-medium">
                  Stack under the other roll (H2)
                </label>
                <input
                  id={ids.h2}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={h2}
                  onChange={(e) => setH2(e.target.value)}
                  className={field}
                />
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  0 if that roll sits on the surface plate.
                </p>
              </div>
            </>
          )}
        </div>
        <button
          type="submit"
          className="rounded-md bg-[var(--color-accent)] px-5 py-2.5 font-medium text-white"
        >
          Calculate
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

      <details className="mt-6 rounded-lg border border-[var(--color-line)]">
        <summary className="cursor-pointer p-4 font-medium">
          Common angles for a 5-inch sine bar (from the source)
        </summary>
        <table className="m-4 mt-0 w-auto text-sm">
          <tbody className="divide-y divide-[var(--color-line)]">
            {TABLE_5IN.map((r) => (
              <tr key={r.angle}>
                <td className="py-1 pr-6">{r.angle}°</td>
                <td className="py-1">{r.height.toFixed(4)}″</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
