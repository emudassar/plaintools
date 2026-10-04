"use client";

import { useState, useId } from "react";
import {
  BY_DAM_AGE,
  calculateGestation,
  formatRange,
  GESTATION_URL,
  STUDY,
  TRADITIONAL_DAYS,
  type GestationResult,
} from "@/lib/cow-gestation";
import { asToolError, type ErrorKind } from "@/lib/errors";

/** idle / error / result. Date arithmetic in the browser — no loading state. */

type State =
  | { phase: "idle" }
  | { phase: "error"; kind: ErrorKind; message: string }
  | { phase: "result"; data: GestationResult };

function Row({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <tr>
      <td className="px-3 py-2 align-top font-medium">{label}</td>
      <td className="px-3 py-2 align-top">
        {value}
        <span className="block text-xs text-[var(--color-muted)]">{note}</span>
      </td>
    </tr>
  );
}

function ResultCard({ data }: { data: GestationResult }) {
  const season = data.bredUntil !== null;
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          {season ? "Expected calving season" : "Expected calving date"}
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {formatRange(data.traditional)}
        </p>
        <p className="mt-1 text-[var(--color-muted)]">
          At the {TRADITIONAL_DAYS}-day gestation traditional beef references
          use. The Angus study below puts the average about{" "}
          {Math.round(TRADITIONAL_DAYS - data.studyMeanDays)} days earlier:{" "}
          {formatRange(data.studyMean)}.
        </p>
      </div>

      <div className="p-5">
        <div className="mb-5 overflow-x-auto rounded-md border border-[var(--color-line)]">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-[var(--color-line)]">
              <Row
                label={`${TRADITIONAL_DAYS} days`}
                value={formatRange(data.traditional)}
                note="The figure traditional beef-cattle references cite."
              />
              <Row
                label={`${data.studyMeanDays} days`}
                value={formatRange(data.studyMean)}
                note={`Angus AI study, ${data.studyMeanSource}.`}
              />
              <Row
                label={`${STUDY.oneSdLow}–${STUDY.oneSdHigh} days`}
                value={formatRange(data.likelyWindow)}
                note="Where about two-thirds of the study's gestations fell (mean ± 1 standard deviation)."
              />
              <Row
                label={`${STUDY.min}–${STUDY.max} days`}
                value={formatRange(data.observedRange)}
                note={`Shortest and longest gestation recorded among ${STUDY.n.toLocaleString("en-US")} matings.`}
              />
            </tbody>
          </table>
        </div>

        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          What this page cannot tell you
        </h3>
        <p className="text-sm text-[var(--color-muted)]">
          The study figures come from American Angus cattle conceived by
          artificial insemination, 2000–2020. Other breeds, crossbreds and
          natural service can differ, and the source attributes most of the
          variation to the calf&rsquo;s own genetics. Dates are rounded to the
          nearest day. A pregnancy check by a veterinarian confirms whether, and
          roughly when, a cow conceived; this page only counts days from the
          date you enter.
        </p>

        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Source: Sandy Johnson, extension beef specialist, Kansas State
            University, &ldquo;When Is She Due? Understanding Gestation Length
            in Modern Beef Cattle&rdquo;, K-State Beef Tips, 1 July 2026 (citing
            Gilleland, 2022, NC State University). Retrieved {data.retrievedAt}.
          </p>
          <p className="mt-1">
            <a
              href={GESTATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-accent)] underline"
            >
              K-State Beef Tips article
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function CowGestationTool() {
  const [bredOn, setBredOn] = useState("");
  const [season, setSeason] = useState(false);
  const [bredUntil, setBredUntil] = useState("");
  const [damAge, setDamAge] = useState("");
  const [state, setState] = useState<State>({ phase: "idle" });
  const ids = { on: useId(), until: useId(), age: useId() };

  function run(e: React.FormEvent) {
    e.preventDefault();
    try {
      setState({
        phase: "result",
        data: calculateGestation({
          bredOn,
          bredUntil: season ? bredUntil : null,
          damAge: damAge === "" ? null : Number(damAge),
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
              {season ? "Bull turned in" : "Breeding or AI date"}
            </label>
            <input
              id={ids.on}
              type="date"
              value={bredOn}
              onChange={(e) => setBredOn(e.target.value)}
              className={field}
            />
          </div>
          <div>
            <label htmlFor={ids.age} className="mb-1.5 block font-medium">
              Age of the cow (optional)
            </label>
            <select
              id={ids.age}
              value={damAge}
              onChange={(e) => setDamAge(e.target.value)}
              className={field}
            >
              <option value="">Unknown / whole herd</option>
              {Object.keys(BY_DAM_AGE).map((k) => (
                <option key={k} value={k}>
                  {k === "8" ? "8 years or older" : `${k} years`}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={season}
                onChange={(e) => setSeason(e.target.checked)}
              />
              Bull exposure over a period (gives a calving season instead of one
              date)
            </label>
          </div>
          {season && (
            <div>
              <label htmlFor={ids.until} className="mb-1.5 block font-medium">
                Bull pulled
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
        </div>
        <button
          type="submit"
          className="rounded-md bg-[var(--color-accent)] px-5 py-2.5 font-medium text-white"
        >
          Calculate calving date
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
