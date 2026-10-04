"use client";

import { useState, useId } from "react";
import {
  calculateStabilizer,
  PRINTED,
  QUOTES,
  type StabilizerResult,
} from "@/lib/pool-stabilizer";
import {
  DOSING_SOURCE_NAME,
  DOSING_SOURCE_URL,
  formatAmount,
  formatMetric,
} from "@/lib/pool-dosing";
import { asToolError, type ErrorKind } from "@/lib/errors";

/** idle / error / result. Arithmetic in the browser — no loading state. */

type State =
  | { phase: "idle" }
  | { phase: "error"; kind: ErrorKind; message: string }
  | { phase: "result"; data: StabilizerResult };

const n = (x: number, d = 1) =>
  x.toLocaleString("en-US", { maximumFractionDigits: d });

function ResultCard({ data }: { data: StabilizerResult }) {
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          {data.action === "add"
            ? "Cyanuric acid to add"
            : data.action === "ok"
              ? "No change needed"
              : "Stabilizer too high"}
        </p>
        {data.action === "add" && (
          <>
            <p className="mt-1 text-2xl font-semibold tracking-tight">
              {formatAmount(data.oz, "wt")}
            </p>
            <p className="mt-1 text-[var(--color-muted)]">
              ({formatMetric(data.oz, "wt")}) of cyanuric acid to raise{" "}
              {n(data.gallons, 0)} gallons from {n(data.currentCya, 0)} to{" "}
              {n(data.targetCya, 0)} ppm.
            </p>
          </>
        )}
        {data.action === "ok" && (
          <p className="mt-1 text-[var(--color-muted)]">
            The reading already equals the target.
          </p>
        )}
        {data.action === "drain" && (
          <>
            <p className="mt-1 text-2xl font-semibold tracking-tight">
              Replace about {n((data.drainFraction ?? 0) * 100, 0)}% of the
              water
            </p>
            <p className="mt-1 text-[var(--color-muted)]">
              About {n(data.drainGallons ?? 0, 0)} gallons, refilled with fresh
              water, brings {n(data.currentCya, 0)} ppm down to{" "}
              {n(data.targetCya, 0)} ppm. Nothing can be added to lower
              stabilizer.
            </p>
          </>
        )}
      </div>

      <div className="p-5">
        {data.action !== "ok" && (
          <>
            <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
              The arithmetic
            </h3>
            <div className="mb-5 rounded-md border border-[var(--color-line)] p-4 text-sm text-[var(--color-muted)]">
              {data.action === "drain" ? (
                <p>
                  Fraction to replace = 1 − target ÷ current = 1 −{" "}
                  {n(data.targetCya, 0)} ÷ {n(data.currentCya, 0)} ={" "}
                  {n((data.drainFraction ?? 0) * 100, 1)}%. This assumes the
                  refill water contains no stabilizer and the pool is mixed
                  before re-testing. The guide adds: &ldquo;{QUOTES.lowering}
                  &rdquo; — so a retest may read higher than the arithmetic
                  suggests.
                </p>
              ) : (
                <p>
                  13 oz × ({n(data.gallons, 0)} ÷ 10,000) × (
                  {n(Math.max(data.targetCya - data.currentCya, 0), 0)} ÷ 10
                  ppm) ={" "}
                  <strong className="font-medium text-[var(--color-fg)]">
                    {n(data.oz)} oz
                  </strong>
                </p>
              )}
            </div>
          </>
        )}

        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          The guide&rsquo;s printed figures, 10,000 gallons
        </h3>
        <div className="mb-5 overflow-x-auto rounded-md border border-[var(--color-line)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-accent-soft)] text-left">
              <tr>
                <th className="px-3 py-2 font-medium">Increase</th>
                <th className="px-3 py-2 font-medium">Printed</th>
                <th className="px-3 py-2 font-medium">Scaled from 13 oz</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-line)]">
              {PRINTED.map((r) => (
                <tr key={r.ppm}>
                  <td className="px-3 py-2">{r.ppm} ppm</td>
                  <td className="px-3 py-2">{r.printed}</td>
                  <td className="px-3 py-2">
                    {formatAmount(1.3 * r.ppm, "wt")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          What this page cannot tell you
        </h3>
        <p className="text-sm text-[var(--color-muted)]">
          The amounts assume granular cyanuric acid as in the source table, and
          an accurate test reading. The guide notes its amounts are rounded and
          that the product label must always be followed. It lists stabilizer as
          an outdoor-pool adjustment: &ldquo;
          {QUOTES.sequence}&rdquo; This page does not choose a target level.
        </p>

        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Source: {DOSING_SOURCE_NAME}. Retrieved {data.retrievedAt}.
          </p>
          <p className="mt-1">
            <a
              href={DOSING_SOURCE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-accent)] underline"
            >
              Indiana Department of Health guide (PDF)
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function PoolStabilizerTool() {
  const [volume, setVolume] = useState("15000");
  const [unit, setUnit] = useState<"gal" | "l">("gal");
  const [current, setCurrent] = useState("0");
  const [target, setTarget] = useState("40");
  const [state, setState] = useState<State>({ phase: "idle" });
  const ids = { vol: useId(), cur: useId(), tgt: useId() };
  const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

  function run(e: React.FormEvent) {
    e.preventDefault();
    try {
      setState({
        phase: "result",
        data: calculateStabilizer({
          volume: num(volume),
          unit,
          currentCya: num(current),
          targetCya: num(target),
        }),
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
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor={ids.vol} className="mb-1.5 block font-medium">
              Pool volume
            </label>
            <div className="flex gap-2">
              <input
                id={ids.vol}
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                className={field}
              />
              <select
                aria-label="Volume unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value as "gal" | "l")}
                className="rounded-md border border-[var(--color-line)] bg-white px-2"
              >
                <option value="gal">gal</option>
                <option value="l">L</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor={ids.cur} className="mb-1.5 block font-medium">
              Current stabilizer / CYA (ppm)
            </label>
            <input
              id={ids.cur}
              type="number"
              inputMode="numeric"
              min="0"
              step="any"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className={field}
            />
          </div>
          <div>
            <label htmlFor={ids.tgt} className="mb-1.5 block font-medium">
              Target stabilizer / CYA (ppm)
            </label>
            <input
              id={ids.tgt}
              type="number"
              inputMode="numeric"
              min="0"
              step="any"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className={field}
            />
          </div>
        </div>
        <button
          type="submit"
          className="rounded-md bg-[var(--color-accent)] px-5 py-2.5 font-medium text-white"
        >
          Calculate the stabilizer
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
