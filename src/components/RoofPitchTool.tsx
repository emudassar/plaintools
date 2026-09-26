"use client";

import { useState, useId } from "react";
import {
  calculatePitch,
  formatNumber,
  unitLabel,
  type PitchResult,
  type LengthUnit,
  type InputMode,
} from "@/lib/roof-pitch";
import { asToolError, type ErrorKind } from "@/lib/errors";

/**
 * Three real states: idle / error / result.
 *
 * There is deliberately NO loading state. The geometry runs in the browser
 * against a table compiled into the page, so a spinner would be theatre.
 *
 * Nothing here recommends a pitch or a material. Every figure is either
 * geometry from the numbers typed in, or a quoted IRC minimum-slope rule.
 */

type State =
  | { phase: "idle" }
  | { phase: "error"; kind: ErrorKind; message: string }
  | { phase: "result"; data: PitchResult };

function Figure({
  label,
  value,
  unit,
  note,
}: {
  label: string;
  value: string;
  unit?: string;
  note?: string;
}) {
  return (
    <div className="rounded-md border border-[var(--color-line)] p-3">
      <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">{label}</p>
      <p className="mt-1 text-lg font-semibold">
        {value}
        {unit && (
          <span className="ml-1 text-sm font-normal text-[var(--color-muted)]">{unit}</span>
        )}
      </p>
      {note && <p className="mt-1 text-xs text-[var(--color-muted)]">{note}</p>}
    </div>
  );
}

function ResultCard({ data }: { data: PitchResult }) {
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">Roof pitch</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {formatNumber(data.slopeIn12, 2)}:12
        </p>
        <p className="mt-1 text-[var(--color-muted)]">
          {formatNumber(data.angleDegrees, 1)}° from horizontal, a {formatNumber(data.slopePercent, 1)}%
          slope. {data.category.label} ({data.category.range}).
        </p>
      </div>

      <div className="p-5">
        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">The numbers</h3>
        <div className="mb-5 grid gap-3 sm:grid-cols-2">
          <Figure
            label="Angle from horizontal"
            value={formatNumber(data.angleDegrees, 2)}
            unit="degrees"
            note="atan(rise ÷ run), converted from radians."
          />
          <Figure
            label="Slope as a percentage"
            value={formatNumber(data.slopePercent, 1)}
            unit="%"
            note="(rise ÷ run) × 100. Not the same scale as degrees — see the FAQ on why."
          />
          {data.rafterLength !== null && (
            <Figure
              label="Rafter length"
              value={formatNumber(data.rafterLength, 3)}
              unit={unitLabel(data.rafterLengthUnit)}
              note="√(rise² + run²) — the Pythagorean theorem, for the run entered."
            />
          )}
          <Figure
            label="Pitch category"
            value={data.category.label}
            note={`Descriptive only, not a code threshold: ${data.category.range}.`}
          />
        </div>

        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          What the IRC allows at this slope
        </h3>
        <p className="mb-3 text-sm text-[var(--color-muted)]">
          2021 International Residential Code, Chapter 9, Section R905 — minimum roof slope by
          covering material. A model code: your local jurisdiction may have amended it, and a
          manufacturer&rsquo;s own instructions can require more than the code floor.
        </p>
        <div className="mb-5 overflow-x-auto rounded-md border border-[var(--color-line)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-accent-soft)] text-left">
              <tr>
                <th className="px-3 py-2 font-medium">Covering</th>
                <th className="px-3 py-2 font-medium">Minimum slope</th>
                <th className="px-3 py-2 font-medium">At your pitch</th>
                <th className="px-3 py-2 font-medium">Section</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-line)]">
              {data.allowedMaterials.map((row) => (
                <tr key={row.material}>
                  <td className="px-3 py-2">{row.material}</td>
                  <td className="px-3 py-2">
                    {row.minSlopeIn12 % 1 === 0 ? row.minSlopeIn12 : row.minSlopeIn12}:12
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={
                        row.allowed
                          ? "font-medium text-[var(--color-accent)]"
                          : "text-[var(--color-muted)]"
                      }
                    >
                      {row.allowed ? "Allowed" : "Not allowed"}
                    </span>
                    {row.note && (
                      <span className="mt-0.5 block text-xs text-[var(--color-muted)]">
                        {row.note}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-[var(--color-muted)]">{row.section}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          What this page cannot tell you
        </h3>
        <p className="text-sm text-[var(--color-muted)]">
          It cannot know your jurisdiction&rsquo;s amendments, wind zone, snow load or the
          specific roofing product&rsquo;s own installation instructions, any of which can require
          a steeper minimum than the code floor shown above. It does not recommend a pitch or a
          material — it reports what the cited code section says at the slope you entered.
        </p>

        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Minimum-slope table: 2021 International Residential Code, Chapter 9. Text retrieved{" "}
            {data.retrievedAt}. The geometry above is standard right-triangle trigonometry, not a
            cited figure.
          </p>
          <p className="mt-1">
            <a
              href="https://codes.iccsafe.org/content/IRC2021P1/chapter-9-roof-assemblies"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-accent)] underline"
            >
              ICC Digital Codes: 2021 IRC, Chapter 9, Roof Assemblies
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function RoofPitchTool() {
  const [mode, setMode] = useState<InputMode>("rise-run");
  const [rise, setRise] = useState("6");
  const [run, setRun] = useState("12");
  const [angle, setAngle] = useState("26.57");
  const [angleRun, setAngleRun] = useState("");
  const [unit, setUnit] = useState<LengthUnit>("in");
  const [state, setState] = useState<State>({ phase: "idle" });

  const riseId = useId();
  const runId = useId();
  const angleId = useId();
  const angleRunId = useId();
  const unitId = useId();

  function run_(e: React.FormEvent) {
    e.preventDefault();
    try {
      const data =
        mode === "rise-run"
          ? calculatePitch({
              mode: "rise-run",
              rise: Number(rise.trim() === "" ? "0" : rise),
              run: Number(run.trim() === "" ? "0" : run),
              unit,
            })
          : calculatePitch({
              mode: "angle",
              angleDegrees: Number(angle.trim() === "" ? "0" : angle),
              run: angleRun.trim() === "" ? null : Number(angleRun),
              unit,
            });
      setState({ phase: "result", data });
    } catch (err) {
      const e2 = asToolError(err);
      setState({ phase: "error", kind: e2.kind, message: e2.message });
    }
  }

  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";

  return (
    <div>
      <form onSubmit={run_} className="mb-6">
        <fieldset className="mb-4">
          <legend className="mb-2 font-medium">What do you know about the roof?</legend>
          <div className="mb-3 flex flex-wrap gap-2">
            {(
              [
                ["rise-run", "Rise and run (a measurement)"],
                ["angle", "The angle in degrees"],
              ] as const
            ).map(([m, label]) => (
              <label
                key={m}
                className={`cursor-pointer rounded-md border px-3 py-2 text-sm ${
                  mode === m
                    ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] font-medium"
                    : "border-[var(--color-line)]"
                }`}
              >
                <input
                  type="radio"
                  name="pitch-mode"
                  value={m}
                  checked={mode === m}
                  onChange={() => setMode(m)}
                  className="sr-only"
                />
                {label}
              </label>
            ))}
          </div>

          {mode === "rise-run" ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label htmlFor={riseId} className="mb-1.5 block text-sm font-medium">
                  Rise
                </label>
                <input
                  id={riseId}
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="0"
                  value={rise}
                  onChange={(e) => setRise(e.target.value)}
                  className={field}
                />
              </div>
              <div>
                <label htmlFor={runId} className="mb-1.5 block text-sm font-medium">
                  Run
                </label>
                <input
                  id={runId}
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="0"
                  value={run}
                  onChange={(e) => setRun(e.target.value)}
                  className={field}
                />
              </div>
              <div>
                <label htmlFor={unitId} className="mb-1.5 block text-sm font-medium">
                  Unit
                </label>
                <select
                  id={unitId}
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as LengthUnit)}
                  className={field}
                >
                  <option value="in">inches</option>
                  <option value="ft">feet</option>
                  <option value="mm">millimetres</option>
                  <option value="m">metres</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label htmlFor={angleId} className="mb-1.5 block text-sm font-medium">
                  Angle, degrees
                </label>
                <input
                  id={angleId}
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="0"
                  max="90"
                  value={angle}
                  onChange={(e) => setAngle(e.target.value)}
                  className={field}
                />
              </div>
              <div>
                <label htmlFor={angleRunId} className="mb-1.5 block text-sm font-medium">
                  Run <span className="font-normal text-[var(--color-muted)]">— optional</span>
                </label>
                <input
                  id={angleRunId}
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="0"
                  value={angleRun}
                  onChange={(e) => setAngleRun(e.target.value)}
                  placeholder="For a rafter length"
                  className={field}
                />
              </div>
              <div>
                <label htmlFor={unitId} className="mb-1.5 block text-sm font-medium">
                  Unit
                </label>
                <select
                  id={unitId}
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as LengthUnit)}
                  className={field}
                >
                  <option value="in">inches</option>
                  <option value="ft">feet</option>
                  <option value="mm">millimetres</option>
                  <option value="m">metres</option>
                </select>
              </div>
            </div>
          )}
          <p className="mt-1.5 text-xs text-[var(--color-muted)]">
            Rise and run must be in the same unit — that mismatch is the easiest way to get an
            answer that is off by a factor of 12. Works for any roof shape: main house, shed,
            lean-to or pergola.
          </p>
        </fieldset>

        <button
          type="submit"
          className="rounded-md bg-[var(--color-accent)] px-5 py-2.5 font-medium text-white"
        >
          Calculate the pitch
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
