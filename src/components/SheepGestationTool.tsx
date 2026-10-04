"use client";

import { useState, useId } from "react";
import {
  calculateSheepGestation,
  formatRange,
  MERCK_PROLONGED_URL,
  MERCK_TABLE_URL,
  MIDPOINT,
  NORMAL,
  QUOTES,
  TABLE_DAYS,
  type SheepResult,
} from "@/lib/sheep-gestation";
import { asToolError, type ErrorKind } from "@/lib/errors";

/** idle / error / result. Date arithmetic in the browser — no loading state. */

type State =
  | { phase: "idle" }
  | { phase: "error"; kind: ErrorKind; message: string }
  | { phase: "result"; data: SheepResult };

function ResultCard({ data }: { data: SheepResult }) {
  const season = data.bredUntil !== null;
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          Expected lambing window
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {formatRange(data.normalWindow)}
        </p>
        <p className="mt-1 text-[var(--color-muted)]">
          The Merck Veterinary Manual&rsquo;s normal gestation of {NORMAL.low}–
          {NORMAL.high} days, counted from{" "}
          {season
            ? `the ${data.exposureDays}-day breeding period you entered`
            : "the breeding date you entered"}
          .
        </p>
      </div>
      <div className="p-5">
        <div className="mb-5 overflow-x-auto rounded-md border border-[var(--color-line)]">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-[var(--color-line)]">
              <tr>
                <td className="px-3 py-2 align-top font-medium">
                  {NORMAL.low}–{NORMAL.high} days
                </td>
                <td className="px-3 py-2">
                  {formatRange(data.normalWindow)}
                  <span className="block text-xs text-[var(--color-muted)]">
                    Normal gestation length, Merck Veterinary Manual.
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 align-top font-medium">
                  {MIDPOINT} days
                </td>
                <td className="px-3 py-2">
                  {formatRange(data.midpoint)}
                  <span className="block text-xs text-[var(--color-muted)]">
                    Midpoint of that range — arithmetic, not a measured average.
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 align-top font-medium">
                  {TABLE_DAYS} days
                </td>
                <td className="px-3 py-2">
                  {formatRange(data.tableFigure)}
                  <span className="block text-xs text-[var(--color-muted)]">
                    The single figure in Merck&rsquo;s &ldquo;Approximate
                    Gestation Periods&rdquo; table.
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          What this page cannot tell you
        </h3>
        <p className="text-sm text-[var(--color-muted)]">
          The manual notes: &ldquo;{QUOTES.normal}&rdquo; With a ram running
          with ewes, the date of conception within the exposure period is
          unknown, which is why a period gives a wider window. For marking
          harnesses it describes: &ldquo;{QUOTES.crayon}&rdquo; — enter each
          crayon colour&rsquo;s on and off dates as a period to get that
          group&rsquo;s window. Breed and litter size are not modelled, and this
          page does not confirm pregnancy.
        </p>

        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Sources: Merck Veterinary Manual — J. F. Mee, &ldquo;Overview of
            Prolonged Gestation in Cattle and Sheep&rdquo; (updated Sept 2024),
            and the &ldquo;Approximate Gestation Periods&rdquo; table. Retrieved{" "}
            {data.retrievedAt}.
          </p>
          <p className="mt-1 flex flex-wrap gap-x-4">
            <a
              href={MERCK_PROLONGED_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-accent)] underline"
            >
              Merck: prolonged gestation in cattle and sheep
            </a>
            <a
              href={MERCK_TABLE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-accent)] underline"
            >
              Merck: approximate gestation periods
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function SheepGestationTool() {
  const [bredOn, setBredOn] = useState("");
  const [period, setPeriod] = useState(false);
  const [bredUntil, setBredUntil] = useState("");
  const [state, setState] = useState<State>({ phase: "idle" });
  const ids = { on: useId(), until: useId() };

  function run(e: React.FormEvent) {
    e.preventDefault();
    try {
      setState({
        phase: "result",
        data: calculateSheepGestation({
          bredOn,
          bredUntil: period ? bredUntil : null,
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
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={ids.on} className="mb-1.5 block font-medium">
              {period ? "Ram in / crayon colour on" : "Breeding or AI date"}
            </label>
            <input
              id={ids.on}
              type="date"
              value={bredOn}
              onChange={(e) => setBredOn(e.target.value)}
              className={field}
            />
          </div>
          {period && (
            <div>
              <label htmlFor={ids.until} className="mb-1.5 block font-medium">
                Ram out / crayon colour changed
              </label>
              <input
                id={ids.until}
                type="date"
                value={bredUntil}
                onChange={(e) => setBredUntil(e.target.value)}
                className={field}
              />
            </div>
          )}
          <div className="sm:col-span-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={period}
                onChange={(e) => setPeriod(e.target.checked)}
              />
              Ram ran with the ewes over a period, or I&rsquo;m working from a
              crayon colour
            </label>
          </div>
        </div>
        <button
          type="submit"
          className="rounded-md bg-[var(--color-accent)] px-5 py-2.5 font-medium text-white"
        >
          Calculate lambing date
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
