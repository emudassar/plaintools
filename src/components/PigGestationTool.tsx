"use client";

import { useState, useId } from "react";
import {
  calculatePigGestation,
  formatDate,
  formatRange,
  MERCK_TABLE_URL,
  PIH_QUOTE,
  PIH_URL,
  RANGE,
  TABLE_DAYS,
  type PigResult,
} from "@/lib/pig-gestation";
import { asToolError } from "@/lib/errors";

/** idle / error / result. Date arithmetic in the browser — no loading state. */

type State =
  | { phase: "idle" }
  | { phase: "error"; message: string }
  | { phase: "result"; data: PigResult };

function ResultCard({ data }: { data: PigResult }) {
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">Expected farrowing date ({TABLE_DAYS} days)</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">{formatDate(data.farrowing)}</p>
        <p className="mt-1 text-[var(--color-muted)]">
          {RANGE.low}–{RANGE.high}-day window: {formatRange(data.window)}
        </p>
      </div>
      <div className="p-5">
        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">Gestation chart</h3>
        <div className="mb-5 overflow-x-auto rounded-md border border-[var(--color-line)]">
          <table className="w-full text-sm">
            <thead className="text-left text-[var(--color-muted)]">
              <tr>
                <th className="px-3 py-2 font-medium">Day</th>
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Point</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-line)]">
              {data.chart.map((c) => (
                <tr key={c.day} className={c.day === TABLE_DAYS ? "font-semibold" : undefined}>
                  <td className="px-3 py-2">{c.day}</td>
                  <td className="px-3 py-2">{formatDate(c.date)}</td>
                  <td className="px-3 py-2">{c.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
        <p className="text-sm text-[var(--color-muted)]">
          The Pork Industry Handbook puts it this way: &ldquo;{PIH_QUOTE}&rdquo; Individual sows and gilts can fall outside that range. This
          page counts days from the date you enter; it does not confirm pregnancy or adjust for parity, breed or litter size. With several
          inseminations, enter the date you want to count from — the page cannot know which service was successful.
        </p>

        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Sources: Merck Veterinary Manual &ldquo;Approximate Gestation Periods&rdquo; table (pig: {TABLE_DAYS} days); Pork Industry
            Handbook &ldquo;Calculating Swine Schedules&rdquo;, MSU Extension Bulletin E-2139 (May 1988, archive copy) for the{" "}
            {RANGE.low}–{RANGE.high}-day range. Retrieved {data.retrievedAt}.
          </p>
          <p className="mt-1 flex flex-wrap gap-x-4">
            <a href={MERCK_TABLE_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              Merck: approximate gestation periods
            </a>
            <a href={PIH_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              Pork Industry Handbook: calculating swine schedules (PDF)
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function PigGestationTool() {
  const [bredOn, setBredOn] = useState("");
  const [state, setState] = useState<State>({ phase: "idle" });
  const id = useId();

  function run(e: React.FormEvent) {
    e.preventDefault();
    try {
      setState({ phase: "result", data: calculatePigGestation({ bredOn }) });
    } catch (err) {
      setState({ phase: "error", message: asToolError(err).message });
    }
  }

  return (
    <div>
      <form onSubmit={run} className="mb-6">
        <div className="mb-4 max-w-sm">
          <label htmlFor={id} className="mb-1.5 block font-medium">
            Breeding or insemination date
          </label>
          <input
            id={id}
            type="date"
            value={bredOn}
            onChange={(e) => setBredOn(e.target.value)}
            className="w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5"
          />
        </div>
        <button type="submit" className="rounded-md bg-[var(--color-accent)] px-5 py-2.5 font-medium text-white">
          Calculate farrowing date
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
