"use client";

import { useState, useId } from "react";
import {
  REBAR_TABLE,
  rebarRow,
  calculateWeight,
  formatNumber,
  RETRIEVED_AT,
  type RebarRow,
} from "@/lib/rebar";
import { asToolError, type ErrorKind } from "@/lib/errors";

/**
 * Three real states: idle / error / result.
 *
 * There is deliberately NO loading state. This is a table lookup plus one
 * multiplication against a figure compiled into the page, so a spinner
 * would be theatre.
 *
 * Nothing here specifies grade, tolerance or bend requirements. Every
 * figure is either the cited table's own value or arithmetic on it.
 */

type State =
  | { phase: "idle" }
  | { phase: "error"; kind: ErrorKind; message: string }
  | { phase: "result"; row: RebarRow; totalWeight: number | null; totalWeightUnit: "lb" | "kg" | null };

function ResultCard({
  row,
  totalWeight,
  totalWeightUnit,
}: {
  row: RebarRow;
  totalWeight: number | null;
  totalWeightUnit: "lb" | "kg" | null;
}) {
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          #{row.size} rebar
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {formatNumber(row.diameterIn, 3)} in diameter
        </p>
        <p className="mt-1 text-[var(--color-muted)]">
          {formatNumber(row.diameterMm, 1)} mm — from IDOT Standard 001001-02.
        </p>
      </div>

      <div className="p-5">
        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">The numbers</h3>
        <div className="mb-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-[var(--color-line)] p-3">
            <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
              Cross-sectional area
            </p>
            <p className="mt-1 text-lg font-semibold">
              {formatNumber(row.areaSqIn, 3)}{" "}
              <span className="text-sm font-normal text-[var(--color-muted)]">sq in</span>
            </p>
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              {formatNumber(row.areaSqMm, 0)} sq mm
            </p>
          </div>
          <div className="rounded-md border border-[var(--color-line)] p-3">
            <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
              Weight per foot
            </p>
            <p className="mt-1 text-lg font-semibold">
              {formatNumber(row.weightLbPerFt, 3)}{" "}
              <span className="text-sm font-normal text-[var(--color-muted)]">lb/ft</span>
            </p>
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              {formatNumber(row.weightKgPerM, 3)} kg/m
            </p>
          </div>
        </div>

        {totalWeight !== null && totalWeightUnit && (
          <div className="mb-5 rounded-md border border-[var(--color-accent)] bg-[var(--color-accent-soft)] p-4">
            <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
              Total weight for the length entered
            </p>
            <p className="mt-1 text-xl font-semibold">
              {formatNumber(totalWeight, 2)} {totalWeightUnit}
            </p>
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              Length × the table&rsquo;s weight-per-{totalWeightUnit === "lb" ? "foot" : "metre"}{" "}
              figure — arithmetic on the cited number, not a separately published figure.
            </p>
          </div>
        )}

        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">Full table, #3–#11</h3>
        <div className="mb-5 overflow-x-auto rounded-md border border-[var(--color-line)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-accent-soft)] text-left">
              <tr>
                <th className="px-3 py-2 font-medium">Bar</th>
                <th className="px-3 py-2 font-medium">Dia (in)</th>
                <th className="px-3 py-2 font-medium">Dia (mm)</th>
                <th className="px-3 py-2 font-medium">Area (sq in)</th>
                <th className="px-3 py-2 font-medium">Weight (lb/ft)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-line)]">
              {REBAR_TABLE.map((r) => (
                <tr key={r.size} className={r.size === row.size ? "bg-[var(--color-accent-soft)]" : ""}>
                  <td className="px-3 py-2">#{r.size}</td>
                  <td className="px-3 py-2">{formatNumber(r.diameterIn, 3)}</td>
                  <td className="px-3 py-2">{formatNumber(r.diameterMm, 1)}</td>
                  <td className="px-3 py-2">{formatNumber(r.areaSqIn, 3)}</td>
                  <td className="px-3 py-2">{formatNumber(r.weightLbPerFt, 3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          What this page cannot tell you
        </h3>
        <p className="text-sm text-[var(--color-muted)]">
          This table gives nominal dimensions only. It does not specify grade, yield strength,
          tolerance, bend diameter or anything else a real project's specification and ASTM
          A615/A706 themselves govern. Bars #14 and #18 are not shown because the cited table
          doesn&rsquo;t cover them.
        </p>

        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Source: Illinois Department of Transportation, Standard 001001-02, &ldquo;Areas of
            Reinforcement Bars.&rdquo; Retrieved {RETRIEVED_AT}.
          </p>
          <p className="mt-1">
            <a
              href="https://idot.illinois.gov/content/dam/soi/en/web/idot/documents/doing-business/standards/highway-standards/pdf/226-001001-02_areasofreinfrebars.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-accent)] underline"
            >
              Illinois DOT: Areas of Reinforcement Bars (PDF)
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function RebarChartTool() {
  const [size, setSize] = useState("4");
  const [length, setLength] = useState("");
  const [lengthUnit, setLengthUnit] = useState<"ft" | "m">("ft");
  const [state, setState] = useState<State>({ phase: "idle" });

  const sizeId = useId();
  const lengthId = useId();
  const unitId = useId();

  function run(e: React.FormEvent) {
    e.preventDefault();
    try {
      const barSize = Number(size);
      const row = rebarRow(barSize);
      if (length.trim() === "") {
        setState({ phase: "result", row, totalWeight: null, totalWeightUnit: null });
        return;
      }
      const result = calculateWeight({ size: barSize, length: Number(length), lengthUnit });
      setState({
        phase: "result",
        row: result.row,
        totalWeight: result.totalWeight,
        totalWeightUnit: result.totalWeightUnit,
      });
    } catch (err) {
      const e2 = asToolError(err);
      setState({ phase: "error", kind: e2.kind, message: e2.message });
    }
  }

  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";

  return (
    <div>
      <form onSubmit={run} className="mb-6">
        <div className="mb-4">
          <label htmlFor={sizeId} className="mb-1.5 block font-medium">
            Bar size
          </label>
          <select
            id={sizeId}
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className={`${field} sm:w-40`}
          >
            {REBAR_TABLE.map((r) => (
              <option key={r.size} value={r.size}>
                #{r.size}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={lengthId} className="mb-1.5 block font-medium">
              Length <span className="font-normal text-[var(--color-muted)]">— optional</span>
            </label>
            <input
              id={lengthId}
              type="number"
              inputMode="decimal"
              step="any"
              min="0"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              placeholder="For a total weight"
              className={field}
            />
          </div>
          <div>
            <label htmlFor={unitId} className="mb-1.5 block font-medium">
              Unit
            </label>
            <select
              id={unitId}
              value={lengthUnit}
              onChange={(e) => setLengthUnit(e.target.value as "ft" | "m")}
              className={field}
            >
              <option value="ft">feet</option>
              <option value="m">metres</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="rounded-md bg-[var(--color-accent)] px-5 py-2.5 font-medium text-white"
        >
          Look up the bar size
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

        {state.phase === "result" && (
          <ResultCard
            row={state.row}
            totalWeight={state.totalWeight}
            totalWeightUnit={state.totalWeightUnit}
          />
        )}
      </div>
    </div>
  );
}
