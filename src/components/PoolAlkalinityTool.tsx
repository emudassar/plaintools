"use client";

import Link from "next/link";
import { useState, useId } from "react";
import {
  calculateAlkalinity,
  QUOTES,
  type AlkalinityResult,
} from "@/lib/pool-alkalinity";
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
  | { phase: "result"; data: AlkalinityResult };

const n = (x: number, d = 1) =>
  x.toLocaleString("en-US", { maximumFractionDigits: d });

function ResultCard({ data }: { data: AlkalinityResult }) {
  const main = data.products[0];
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          {data.direction === "raise"
            ? "To raise alkalinity"
            : data.direction === "lower"
              ? "To lower alkalinity"
              : "No change needed"}
        </p>
        {main ? (
          <>
            <p className="mt-1 text-2xl font-semibold tracking-tight">
              {formatAmount(main.amount, main.measure)} of{" "}
              {main.label.toLowerCase()}
            </p>
            <p className="mt-1 text-[var(--color-muted)]">
              ({formatMetric(main.amount, main.measure)}) to move{" "}
              {n(data.gallons, 0)} gallons from {n(data.currentTa, 0)} to{" "}
              {n(data.targetTa, 0)} ppm total alkalinity, a {data.direction === "raise" ? "rise" : "drop"} of {n(data.ppmChange, 0)} ppm.
            </p>
          </>
        ) : (
          <p className="mt-1 text-[var(--color-muted)]">
            The current reading already equals the target.
          </p>
        )}
      </div>

      {data.direction !== "none" && (
        <div className="p-5">
          {data.metalsWarning && (
            <div className="mb-4 rounded-md border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-4 text-sm">
              <strong className="font-medium">
                Your reading is at or below 50 ppm.
              </strong>{" "}
              The guide says: &ldquo;{QUOTES.metals}&rdquo;
            </div>
          )}
          {data.overRaiseCap && (
            <div className="mb-4 rounded-md border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-4 text-sm">
              <strong className="font-medium">
                This is more than a 50 ppm rise.
              </strong>{" "}
              The guide says: &ldquo;{QUOTES.raiseCap}&rdquo; At that pace this
              change is at least {Math.ceil(data.ppmChange / 50)} separate
              additions, retesting between them.
            </div>
          )}
          {data.direction === "lower" && (
            <div className="mb-4 rounded-md border border-[var(--color-line)] p-4 text-sm text-[var(--color-muted)]">
              The guide also says: &ldquo;{QUOTES.acidCap}&rdquo; The{" "}
              <Link
                href="/tools/muriatic-acid-pool-calculator/"
                className="text-[var(--color-accent)] underline"
              >
                muriatic acid pool calculator
              </Link>{" "}
              works out how many additions that limit means for your pool.
            </div>
          )}

          <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
            Amount by product
          </h3>
          <div className="mb-5 overflow-x-auto rounded-md border border-[var(--color-line)]">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-accent-soft)] text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">Product</th>
                  <th className="px-3 py-2 font-medium">For your pool</th>
                  <th className="px-3 py-2 font-medium">
                    Guide, 10,000 gal: 10 / 30 / 50 ppm
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-line)]">
                {data.products.map((p) => (
                  <tr key={p.id}>
                    <td className="px-3 py-2">{p.label}</td>
                    <td className="px-3 py-2">
                      {formatAmount(p.amount, p.measure)}
                      <span className="text-[var(--color-muted)]">
                        {" "}
                        · {formatMetric(p.amount, p.measure)}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-[var(--color-muted)]">
                      {p.printed.join(" / ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.direction === "raise" && (
            <p className="mb-5 text-sm text-[var(--color-muted)]">
              Choosing between them, the guide says: &ldquo;{QUOTES.pairing}
              &rdquo;
            </p>
          )}

          <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
            What this page cannot tell you
          </h3>
          <p className="text-sm text-[var(--color-muted)]">
            Amounts are the guide&rsquo;s per-10,000-gallon figures scaled to
            your volume and change; the guide notes they are rounded and that
            the product label must always be followed. The page does not choose
            a target, and it does not calculate pH, which the guide says is set
            using an acid or base demand test.
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
      )}
    </div>
  );
}

export default function PoolAlkalinityTool() {
  const [volume, setVolume] = useState("15000");
  const [unit, setUnit] = useState<"gal" | "l">("gal");
  const [current, setCurrent] = useState("70");
  const [target, setTarget] = useState("100");
  const [state, setState] = useState<State>({ phase: "idle" });
  const ids = { vol: useId(), cur: useId(), tgt: useId() };
  const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

  function run(e: React.FormEvent) {
    e.preventDefault();
    try {
      setState({
        phase: "result",
        data: calculateAlkalinity({
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
          Calculate the dose
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
