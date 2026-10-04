"use client";

import { useState, useId } from "react";
import {
  calculateRunTime,
  formatHours,
  MAHC_URL,
  MAHC_VENUES,
  type RunTimeResult,
} from "@/lib/pool-pump-run-time";
import { asToolError, type ErrorKind } from "@/lib/errors";

/** idle / error / result. Arithmetic in the browser — no loading state. */

type State =
  | { phase: "idle" }
  | { phase: "error"; kind: ErrorKind; message: string }
  | { phase: "result"; data: RunTimeResult };

const n = (x: number, d = 1) =>
  x.toLocaleString("en-US", { maximumFractionDigits: d });

function ResultCard({ data }: { data: RunTimeResult }) {
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          Daily run time
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {formatHours(data.hoursPerDay)} a day
        </p>
        <p className="mt-1 text-[var(--color-muted)]">
          One turnover of {n(data.gallons, 0)} gallons at {n(data.gpm)} gpm
          takes {formatHours(data.hoursPerTurnover)}; ×{" "}
          {n(data.turnoversPerDay, 2)}{" "}
          {data.turnoversPerDay === 1 ? "turnover" : "turnovers"} per day.
        </p>
      </div>

      <div className="p-5">
        {data.exceedsDay && (
          <div className="mb-5 rounded-md border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-4 text-sm">
            <strong className="font-medium">That is more than 24 hours.</strong>{" "}
            At {n(data.gpm)} gpm this pump cannot move the water{" "}
            {n(data.turnoversPerDay, 2)} times in a day; the most it can do
            running non-stop is {n(24 / data.hoursPerTurnover, 2)} turnovers.
          </div>
        )}

        {data.venue && (
          <div
            className={`mb-5 rounded-md border p-4 text-sm ${data.meetsVenue ? "border-[var(--color-line)]" : "border-[var(--color-warn-line)] bg-[var(--color-warn-soft)]"}`}
          >
            <h3 className="mb-1 text-sm font-semibold tracking-wide uppercase">
              MAHC Table 4.7.1.10 — {data.venue.label}
            </h3>
            <p className="text-[var(--color-muted)]">
              Maximum turnover:{" "}
              <strong className="font-medium text-[var(--color-fg)]">
                {formatHours(data.venue.maxHours)}
              </strong>
              . This flow gives {formatHours(data.hoursPerTurnover)}, which{" "}
              <strong className="font-medium text-[var(--color-fg)]">
                {data.meetsVenue ? "is within" : "is longer than"}
              </strong>{" "}
              the table&rsquo;s maximum. The flow needed to meet it is{" "}
              {n(data.requiredGpm ?? 0)} gpm (
              {n((data.requiredGpm ?? 0) * 3.785411784)} L/min).
            </p>
          </div>
        )}

        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          The arithmetic
        </h3>
        <div className="mb-5 rounded-md border border-[var(--color-line)] p-4 text-sm text-[var(--color-muted)]">
          <p>
            Turnover time = volume ÷ flow rate through the filter ={" "}
            {n(data.gallons, 0)} gal ÷ ({n(data.gpm)} gpm × 60) ={" "}
            <strong className="font-medium text-[var(--color-fg)]">
              {n(data.hoursPerTurnover, 2)} hours
            </strong>
          </p>
          <p className="mt-2">
            Daily run time = {n(data.hoursPerTurnover, 2)} ×{" "}
            {n(data.turnoversPerDay, 2)} = {n(data.hoursPerDay, 2)} hours.
          </p>
        </div>

        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          What this page cannot tell you
        </h3>
        <p className="text-sm text-[var(--color-muted)]">
          The answer depends on the flow rate actually reaching the filter. A
          pump's flow depends on the resistance of the pipes and filter (the
          MAHC sizes pumps against total dynamic head and requires public pools
          to have a flow meter accurate to ±5%), so a meter reading is more
          reliable than an assumed pump rating. The MAHC is a model code for
          public aquatic venues; your state or county decides whether it
          applies, and it sets no figure for private residential pools. This
          page does not choose how many turnovers a day your pool needs.
        </p>

        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Turnover definition and maximum times: CDC Model Aquatic Health
            Code, 2023 (4th edition), 4.7.1.10 and Table 4.7.1.10. Retrieved{" "}
            {data.retrievedAt}.
          </p>
          <p className="mt-1">
            <a
              href={MAHC_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-accent)] underline"
            >
              CDC: 2023 Model Aquatic Health Code (PDF)
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function PoolPumpRunTimeTool() {
  const [volume, setVolume] = useState("20000");
  const [volumeUnit, setVolumeUnit] = useState<"gal" | "l">("gal");
  const [flow, setFlow] = useState("50");
  const [flowUnit, setFlowUnit] = useState<"gpm" | "lpm">("gpm");
  const [turnovers, setTurnovers] = useState("1");
  const [venue, setVenue] = useState("");
  const [state, setState] = useState<State>({ phase: "idle" });
  const ids = { vol: useId(), flow: useId(), turn: useId(), venue: useId() };
  const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

  function run(e: React.FormEvent) {
    e.preventDefault();
    try {
      setState({
        phase: "result",
        data: calculateRunTime({
          volume: num(volume),
          volumeUnit,
          flow: num(flow),
          flowUnit,
          turnoversPerDay: num(turnovers),
          venueId: venue || null,
        }),
      });
    } catch (err) {
      const e2 = asToolError(err);
      setState({ phase: "error", kind: e2.kind, message: e2.message });
    }
  }

  const field =
    "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";
  const unitSel = "rounded-md border border-[var(--color-line)] bg-white px-2";

  return (
    <div>
      <form onSubmit={run} className="mb-6">
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
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
                value={volumeUnit}
                onChange={(e) => setVolumeUnit(e.target.value as "gal" | "l")}
                className={unitSel}
              >
                <option value="gal">gallons</option>
                <option value="l">litres</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor={ids.flow} className="mb-1.5 block font-medium">
              Flow rate through the filter
            </label>
            <div className="flex gap-2">
              <input
                id={ids.flow}
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={flow}
                onChange={(e) => setFlow(e.target.value)}
                className={field}
              />
              <select
                aria-label="Flow unit"
                value={flowUnit}
                onChange={(e) => setFlowUnit(e.target.value as "gpm" | "lpm")}
                className={unitSel}
              >
                <option value="gpm">gpm</option>
                <option value="lpm">L/min</option>
              </select>
            </div>
            <p className="mt-1.5 text-xs text-[var(--color-muted)]">
              From a flow meter if you have one — real flow depends on the
              plumbing and filter.
            </p>
          </div>
          <div>
            <label htmlFor={ids.turn} className="mb-1.5 block font-medium">
              Turnovers per day
            </label>
            <input
              id={ids.turn}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={turnovers}
              onChange={(e) => setTurnovers(e.target.value)}
              className={field}
            />
          </div>
          <div>
            <label htmlFor={ids.venue} className="mb-1.5 block font-medium">
              Compare with MAHC (public pools)
            </label>
            <select
              id={ids.venue}
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className={field}
            >
              <option value="">No comparison — private pool</option>
              {MAHC_VENUES.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="submit"
          className="rounded-md bg-[var(--color-accent)] px-5 py-2.5 font-medium text-white"
        >
          Calculate run time
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
