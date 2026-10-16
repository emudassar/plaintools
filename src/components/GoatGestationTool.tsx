"use client";

import { useState, useId } from "react";
import {
  calculateGoatGestation,
  formatDate,
  formatRange,
  AVERAGE,
  MERCK_GOAT_URL,
  MERCK_TABLE_URL,
  NORMAL,
  QUOTE,
  type GoatResult,
} from "@/lib/goat-gestation";
import { asToolError } from "@/lib/errors";

/** idle / error / result. Date arithmetic in the browser — no loading state. */

type State =
  | { phase: "idle" }
  | { phase: "error"; message: string }
  | { phase: "result"; data: GoatResult };

function ResultCard({ data }: { data: GoatResult }) {
  const season = data.bredUntil !== null;
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">Expected kidding window</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">{formatRange(data.normalWindow)}</p>
        <p className="mt-1 text-[var(--color-muted)]">
          The Merck Veterinary Manual&rsquo;s {NORMAL.low}–{NORMAL.high}-day goat gestation, counted from{" "}
          {season ? `the ${data.exposureDays}-day breeding period you entered` : "the breeding date you entered"}.
        </p>
      </div>
      <div className="p-5">
        <div className="mb-5 overflow-x-auto rounded-md border border-[var(--color-line)]">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-[var(--color-line)]">
              <tr>
                <td className="px-3 py-2 align-top font-medium">{AVERAGE} days</td>
                <td className="px-3 py-2">
                  {formatRange(data.average)}
                  <span className="block text-xs text-[var(--color-muted)]">
                    Average gestation in the manual, and the goat figure in its gestation table.
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 align-top font-medium">
                  {NORMAL.low}–{NORMAL.high} days
                </td>
                <td className="px-3 py-2">
                  {formatRange(data.normalWindow)}
                  <span className="block text-xs text-[var(--color-muted)]">Gestation range given by the manual.</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          Gestation chart{season ? " (from the first breeding date)" : ""}
        </h3>
        <div className="mb-5 overflow-x-auto rounded-md border border-[var(--color-line)]">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-[var(--color-line)]">
              {data.milestones.map((m) => (
                <tr key={m.day}>
                  <td className="px-3 py-2 font-medium">{m.label}</td>
                  <td className="px-3 py-2">{formatDate(m.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
        <p className="text-sm text-[var(--color-muted)]">
          The manual says: &ldquo;{QUOTE}&rdquo; This page does not adjust for any of those factors, does not confirm that a doe is pregnant,
          and cannot say when a doe running with a buck actually conceived — which is why a breeding period gives a wider window.
        </p>

        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Sources: Merck Veterinary Manual — J. L. Stewart, &ldquo;Pregnancy in Goats&rdquo; (full review June 2026), and the
            &ldquo;Approximate Gestation Periods&rdquo; table. Retrieved {data.retrievedAt}.
          </p>
          <p className="mt-1 flex flex-wrap gap-x-4">
            <a href={MERCK_GOAT_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              Merck: pregnancy in goats
            </a>
            <a href={MERCK_TABLE_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              Merck: approximate gestation periods
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function GoatGestationTool() {
  const [bredOn, setBredOn] = useState("");
  const [period, setPeriod] = useState(false);
  const [bredUntil, setBredUntil] = useState("");
  const [state, setState] = useState<State>({ phase: "idle" });
  const ids = { on: useId(), until: useId() };

  function run(e: React.FormEvent) {
    e.preventDefault();
    try {
      setState({ phase: "result", data: calculateGoatGestation({ bredOn, bredUntil: period ? bredUntil : null }) });
    } catch (err) {
      setState({ phase: "error", message: asToolError(err).message });
    }
  }

  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";

  return (
    <div>
      <form onSubmit={run} className="mb-6">
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={ids.on} className="mb-1.5 block font-medium">
              {period ? "Buck put in with the does" : "Breeding or AI date"}
            </label>
            <input id={ids.on} type="date" value={bredOn} onChange={(e) => setBredOn(e.target.value)} className={field} />
          </div>
          {period && (
            <div>
              <label htmlFor={ids.until} className="mb-1.5 block font-medium">
                Buck taken out
              </label>
              <input id={ids.until} type="date" value={bredUntil} onChange={(e) => setBredUntil(e.target.value)} className={field} />
            </div>
          )}
          <div className="sm:col-span-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" checked={period} onChange={(e) => setPeriod(e.target.checked)} />
              The buck ran with the does over a period of days
            </label>
          </div>
        </div>
        <button type="submit" className="rounded-md bg-[var(--color-accent)] px-5 py-2.5 font-medium text-white">
          Calculate kidding date
        </button>
        <p className="mt-1.5 text-xs text-[var(--color-muted)]">Runs entirely in your browser. Nothing you enter is sent anywhere or stored.</p>
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
