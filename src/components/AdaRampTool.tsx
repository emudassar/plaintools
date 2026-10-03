"use client";

import { useState, useId } from "react";
import {
  calculateRamp,
  feetAndInches,
  formatNumber,
  type RampResult,
  type RiseUnit,
  type SlopeChoice,
} from "@/lib/ada-ramp";
import { asToolError, type ErrorKind } from "@/lib/errors";

/**
 * Three real states: idle / error / result.
 *
 * No loading state — the figures from §303 and §405 are compiled into the
 * page. Nothing here says whether the ADA applies to a given building or
 * recommends a design; it reports what the cited sections give for the rise.
 */

type State =
  | { phase: "idle" }
  | { phase: "error"; kind: ErrorKind; message: string }
  | { phase: "result"; data: RampResult };

const ADA_URL = "https://www.ada.gov/law-and-regs/design-standards/2010-stds/";

function Figure({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-md border border-[var(--color-line)] p-3">
      <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
      {note && <p className="mt-1 text-xs text-[var(--color-muted)]">{note}</p>}
    </div>
  );
}

function Source({ retrievedAt }: { retrievedAt: string }) {
  return (
    <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
      <p>2010 ADA Standards for Accessible Design, §303.2–303.4 and §405.2–405.8. Text read {retrievedAt}.</p>
      <p className="mt-1">
        <a href={ADA_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
          ADA.gov: 2010 ADA Standards for Accessible Design
        </a>
      </p>
    </footer>
  );
}

function ResultCard({ data }: { data: RampResult }) {
  const o = data.outcome;
  const riseLabel = `${formatNumber(data.riseIn, 2)} in rise`;

  if (o.kind !== "ramp") {
    return (
      <div className="rounded-lg border border-[var(--color-line)]">
        <div
          className={`border-b p-5 ${
            o.kind === "no-ramp"
              ? "border-[var(--color-line)] bg-[var(--color-accent-soft)]"
              : "border-[var(--color-warn-line)] bg-[var(--color-warn-soft)]"
          }`}
        >
          <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">{riseLabel}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">
            {o.kind === "no-ramp" ? "Below the height that needs a ramp" : `${data.slope} is not permitted for this rise`}
          </p>
          <p className="mt-1 text-[var(--color-muted)]">
            {o.reason} ({o.section})
          </p>
          {o.kind === "not-permitted" && (
            <p className="mt-2 text-sm text-[var(--color-muted)]">Choose 1:12 to see the length the standard requires.</p>
          )}
        </div>
        <div className="p-5 pt-0">
          <Source retrievedAt={data.retrievedAt} />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          Minimum ramp length at {data.slope}
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">{feetAndInches(data.runLengthIn)} of sloped ramp</p>
        <p className="mt-1 text-[var(--color-muted)]">
          For a {riseLabel}: {data.runs} {data.runs === 1 ? "run" : "runs"}, {data.landings} landings, handrails{" "}
          {data.handrailsRequired ? "required" : "not required"}. Laid out in a straight line with 60-in landings, about{" "}
          {feetAndInches(data.straightLineLengthIn)} end to end.
        </p>
      </div>

      <div className="p-5">
        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">The numbers</h3>
        <div className="mb-5 grid gap-3 sm:grid-cols-2">
          <Figure
            label="Horizontal length of ramp"
            value={`${feetAndInches(data.runLengthIn)} (${formatNumber(data.runLengthIn, 1)} in)`}
            note={`Rise × ${data.slope.split(":")[1]} — a slope of ${formatNumber(data.slopePercent, 2)}% (§405.2). Landings are extra.`}
          />
          <Figure
            label="Ramp runs"
            value={`${data.runs}, each rising ${formatNumber(data.risePerRunIn, 2)} in`}
            note="No single run may rise more than 30 in (§405.6). Shown split evenly."
          />
          <Figure
            label="Landings"
            value={`${data.landings} (${data.intermediateLandings} between runs)`}
            note="Top and bottom of every run, each at least 60 in long; 60 × 60 in where the ramp turns (§405.7)."
          />
          <Figure
            label="Handrails"
            value={data.handrailsRequired ? "Required" : "Not required"}
            note="Required on runs with a rise greater than 6 in (§405.8)."
          />
          <Figure
            label="Clear width"
            value="36 in minimum"
            note="Between handrails where they are provided (§405.5). Landings at least as wide as the ramp (§405.7.2)."
          />
          <Figure label="Cross slope" value="1:48 maximum" note="Side-to-side slope of the ramp surface (§405.3)." />
        </div>

        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
        <p className="text-sm text-[var(--color-muted)]">
          It does not decide whether the ADA Standards apply to your building — they cover public accommodations,
          commercial facilities and state and local government facilities, and private homes usually fall outside them.
          It does not cover curb ramps (§406), edge protection details, handrail design (§505) or local codes, which can
          differ. Landings are counted, not drawn: a ramp that turns needs 60 × 60 in landings and a different footprint.
        </p>

        <Source retrievedAt={data.retrievedAt} />
      </div>
    </div>
  );
}

export default function AdaRampTool() {
  const [rise, setRise] = useState("24");
  const [unit, setUnit] = useState<RiseUnit>("in");
  const [slope, setSlope] = useState<SlopeChoice>("1:12");
  const [state, setState] = useState<State>({ phase: "idle" });
  const riseId = useId();
  const unitId = useId();
  const slopeId = useId();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const data = calculateRamp({ rise: Number(rise.trim() === "" ? "NaN" : rise), unit, slope });
      setState({ phase: "result", data });
    } catch (err) {
      const e2 = asToolError(err);
      setState({ phase: "error", kind: e2.kind, message: e2.message });
    }
  }

  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";

  return (
    <div>
      <form onSubmit={submit} className="mb-6" noValidate>
        <div className="mb-2 grid gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor={riseId} className="mb-1.5 block text-sm font-medium">
              Total rise
            </label>
            <input
              id={riseId}
              type="number"
              inputMode="decimal"
              step="any"
              value={rise}
              onChange={(e) => setRise(e.target.value)}
              className={field}
            />
          </div>
          <div>
            <label htmlFor={unitId} className="mb-1.5 block text-sm font-medium">
              Unit
            </label>
            <select id={unitId} value={unit} onChange={(e) => setUnit(e.target.value as RiseUnit)} className={field}>
              <option value="in">inches</option>
              <option value="cm">centimetres</option>
            </select>
          </div>
          <div>
            <label htmlFor={slopeId} className="mb-1.5 block text-sm font-medium">
              Slope
            </label>
            <select
              id={slopeId}
              value={slope}
              onChange={(e) => setSlope(e.target.value as SlopeChoice)}
              className={field}
            >
              <option value="1:12">1:12 — the standard maximum</option>
              <option value="1:10">1:10 — existing buildings, rise up to 6 in</option>
              <option value="1:8">1:8 — existing buildings, rise up to 3 in</option>
            </select>
          </div>
        </div>
        <p className="mb-4 text-xs text-[var(--color-muted)]">
          Rise is the vertical height from the lower surface to the upper one — for example ground to door threshold.
          Measure it in a straight vertical line, not along the slope.
        </p>

        <button type="submit" className="rounded-md bg-[var(--color-accent)] px-5 py-2.5 font-medium text-white">
          Calculate the ramp
        </button>
        <p className="mt-1.5 text-xs text-[var(--color-muted)]">
          Runs entirely in your browser. Nothing you enter is sent anywhere or stored.
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
