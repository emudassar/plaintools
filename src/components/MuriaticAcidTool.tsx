"use client";

import { useState, useId } from "react";
import {
  calculateMuriatic,
  QUOTES,
  type MuriaticResult,
} from "@/lib/muriatic-acid";
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
  | { phase: "result"; data: MuriaticResult };

const n = (x: number, d = 1) =>
  x.toLocaleString("en-US", { maximumFractionDigits: d });

const PRINTED = [
  { ppm: 10, printed: "26 fl.oz." },
  { ppm: 30, printed: "2.4 qts" },
  { ppm: 50, printed: "1 gal" },
];

function ResultCard({ data }: { data: MuriaticResult }) {
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          {data.action === "add"
            ? "Muriatic acid (31.4%) to add"
            : "No acid needed for alkalinity"}
        </p>
        {data.action === "add" ? (
          <>
            <p className="mt-1 text-2xl font-semibold tracking-tight">
              {formatAmount(data.flOz, "vol")}
            </p>
            <p className="mt-1 text-[var(--color-muted)]">
              ({formatMetric(data.flOz, "vol")}) to lower total alkalinity in{" "}
              {n(data.gallons, 0)} gallons from {n(data.currentTa, 0)} to{" "}
              {n(data.targetTa, 0)} ppm.
            </p>
          </>
        ) : (
          <p className="mt-1 text-[var(--color-muted)]">
            The current total alkalinity ({n(data.currentTa, 0)} ppm) is already
            at or below the target ({n(data.targetTa, 0)} ppm). Raising
            alkalinity uses sodium bicarbonate, not acid.
          </p>
        )}
      </div>

      <div className="p-5">
        {data.action === "add" && (
          <>
            <div
              className={`mb-5 rounded-md border p-4 ${data.additions > 1 ? "border-[var(--color-warn-line)] bg-[var(--color-warn-soft)]" : "border-[var(--color-line)]"}`}
            >
              <h3 className="mb-1 text-sm font-semibold tracking-wide uppercase">
                The per-addition limit
              </h3>
              <p className="text-sm text-[var(--color-muted)]">
                The guide caps a single addition at one quart per 10,000 gallons
                — {formatAmount(data.capFlOz, "vol")} for this pool.{" "}
                {data.additions > 1 ? (
                  <>
                    This total is more than that, so at the guide&rsquo;s limit
                    it would be at least{" "}
                    <strong className="font-medium text-[var(--color-fg)]">
                      {data.additions} separate additions
                    </strong>
                    , each followed by a retest 12 hours later. Each retest may
                    change how much is still needed.
                  </>
                ) : (
                  <>This total fits in one addition.</>
                )}
              </p>
              <p className="mt-2 text-xs text-[var(--color-muted)]">
                &ldquo;{QUOTES.cap}&rdquo;
              </p>
            </div>

            <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
              The arithmetic
            </h3>
            <div className="mb-5 rounded-md border border-[var(--color-line)] p-4 text-sm text-[var(--color-muted)]">
              26 fl oz × ({n(data.gallons, 0)} ÷ 10,000) × ({n(data.ppmDrop, 0)}{" "}
              ÷ 10 ppm) ={" "}
              <strong className="font-medium text-[var(--color-fg)]">
                {n(data.flOz)} fl oz
              </strong>
            </div>
          </>
        )}

        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          The guide&rsquo;s printed figures, 31.4% muriatic acid, 10,000 gallons
        </h3>
        <div className="mb-5 overflow-x-auto rounded-md border border-[var(--color-line)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-accent-soft)] text-left">
              <tr>
                <th className="px-3 py-2 font-medium">Alkalinity drop</th>
                <th className="px-3 py-2 font-medium">Printed amount</th>
                <th className="px-3 py-2 font-medium">Scaled from 26 fl oz</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-line)]">
              {PRINTED.map((r) => (
                <tr key={r.ppm}>
                  <td className="px-3 py-2">{r.ppm} ppm</td>
                  <td className="px-3 py-2">{r.printed}</td>
                  <td className="px-3 py-2">{n(2.6 * r.ppm, 0)} fl oz</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-[var(--color-line)] p-2 text-xs text-[var(--color-muted)]">
            The guide notes its amounts are rounded, which is why 30 and 50 ppm
            differ slightly from straight scaling.
          </p>
        </div>

        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          What this page cannot tell you
        </h3>
        <p className="text-sm text-[var(--color-muted)]">
          This is the dose for lowering <em>total alkalinity</em> with 31.4%
          acid, the strength the source prints. It does not convert to other
          strengths (that needs density data the source does not give — follow
          that product&rsquo;s label), and it does not calculate acid for a pH
          change. The guide says: &ldquo;{QUOTES.demand}&rdquo; Acid is
          hazardous; the guide says to {QUOTES.dilute}
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

export default function MuriaticAcidTool() {
  const [volume, setVolume] = useState("15000");
  const [unit, setUnit] = useState<"gal" | "l">("gal");
  const [current, setCurrent] = useState("140");
  const [target, setTarget] = useState("100");
  const [state, setState] = useState<State>({ phase: "idle" });
  const ids = { vol: useId(), cur: useId(), tgt: useId() };
  const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

  function run(e: React.FormEvent) {
    e.preventDefault();
    try {
      setState({
        phase: "result",
        data: calculateMuriatic({
          volume: num(volume),
          unit,
          currentTa: num(current),
          targetTa: num(target),
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
              Current total alkalinity (ppm)
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
              Target total alkalinity (ppm)
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
          Calculate the acid
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
