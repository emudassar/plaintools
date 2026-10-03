"use client";

import { useState, useId } from "react";
import {
  checkEgress,
  type CheckRow,
  type EgressResult,
  type SillPosition,
} from "@/lib/egress-window";
import { asToolError, type ErrorKind } from "@/lib/errors";

/**
 * Three real states: idle / error / result.
 *
 * No loading state — the check runs in the browser against figures compiled
 * into the page. Nothing here says whether a room may be used as a bedroom;
 * it reports which cited IRC minimums the entered measurements meet.
 */

type State =
  | { phase: "idle" }
  | { phase: "error"; kind: ErrorKind; message: string }
  | { phase: "result"; data: EgressResult };

const ICC_URL = "https://codes.iccsafe.org/content/IRC2021P1/chapter-3-building-planning";

function CheckTable({ rows }: { rows: readonly CheckRow[] }) {
  return (
    <div className="mb-5 overflow-x-auto rounded-md border border-[var(--color-line)]">
      <table className="w-full text-sm">
        <thead className="bg-[var(--color-accent-soft)] text-left">
          <tr>
            <th className="px-3 py-2 font-medium">Requirement</th>
            <th className="px-3 py-2 font-medium">Yours</th>
            <th className="px-3 py-2 font-medium">IRC minimum</th>
            <th className="px-3 py-2 font-medium">Result</th>
            <th className="px-3 py-2 font-medium">Section</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-line)]">
          {rows.map((row) => (
            <tr key={row.label}>
              <td className="px-3 py-2">{row.label}</td>
              <td className="px-3 py-2">{row.measured}</td>
              <td className="px-3 py-2">{row.required}</td>
              <td className="px-3 py-2">
                <span
                  className={
                    row.passes ? "font-medium text-[var(--color-accent)]" : "font-semibold text-[var(--color-ink)] underline decoration-[var(--color-warn-line)] decoration-2"
                  }
                >
                  {row.resultLabel ?? (row.passes ? "Meets" : "Does not meet")}
                </span>
              </td>
              <td className="px-3 py-2 text-[var(--color-muted)]">{row.section}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ResultCard({ data }: { data: EgressResult }) {
  const failing = [...data.checks, ...(data.wellChecks ?? [])].filter((c) => !c.passes);
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div
        className={`border-b p-5 ${
          data.passesAll
            ? "border-[var(--color-line)] bg-[var(--color-accent-soft)]"
            : "border-[var(--color-warn-line)] bg-[var(--color-warn-soft)]"
        }`}
      >
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">IRC R310 check</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {!data.passesAll
            ? `Does not meet ${failing.length} of the IRC R310 minimums`
            : data.wellMissing
              ? "The opening meets the R310.2 minimums — the area well is not checked yet"
              : "Meets every IRC R310 minimum checked"}
        </p>
        <p className="mt-1 text-[var(--color-muted)]">
          Net clear opening {data.areaSqFt.toLocaleString("en-US", { maximumFractionDigits: 2 })} sq ft
          against a {data.requiredAreaSqFt} sq ft minimum
          {data.isGradeFloor ? " (grade-floor opening)" : ""}.
          {failing.length > 0 && ` Falls short on: ${failing.map((f) => f.label.toLowerCase()).join(", ")}.`}
        </p>
      </div>

      <div className="p-5">
        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">The opening</h3>
        <CheckTable rows={data.checks} />

        {data.wellChecks && (
          <>
            <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">The area well</h3>
            <p className="mb-3 text-sm text-[var(--color-muted)]">
              R310.4 requires an area well because the bottom of the opening is below the ground outside.
            </p>
            <CheckTable rows={data.wellChecks} />
          </>
        )}

        {data.wellMissing && (
          <div className="mb-5 rounded-md border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-4 text-sm">
            <p className="font-medium">An area well applies, but its size was not entered</p>
            <p className="mt-1 text-[var(--color-muted)]">
              The bottom of this opening is below the ground outside, so R310.4 requires an area well: at least
              9 sq ft, with a projection and width of at least 36 in, and a permanently affixed ladder or steps if it
              is deeper than 44 in. Enter the well&rsquo;s inside dimensions to check them.
            </p>
          </div>
        )}

        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
        <p className="text-sm text-[var(--color-muted)]">
          The result is only as good as the measurement. The IRC measures the <em>net clear opening</em> when the
          window is opened normally — not the frame, the glass or the rough opening, all of which are larger. Your
          jurisdiction may have amended the model code, replacement windows have their own rules in R310.5, and
          only the local building official decides whether a room complies.
        </p>

        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            2021 International Residential Code, Sections R310.2.1–R310.2.3 and R310.4.1–R310.4.2, and the Chapter 2
            definition of a grade-floor opening. Text read {data.retrievedAt}.
          </p>
          <p className="mt-1">
            <a href={ICC_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              ICC Digital Codes: 2021 IRC, Chapter 3, Building Planning
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function EgressWindowTool() {
  const [width, setWidth] = useState("24");
  const [height, setHeight] = useState("36");
  const [sill, setSill] = useState("40");
  const [position, setPosition] = useState<SillPosition>("above-grade");
  const [grade, setGrade] = useState("60");
  const [wellProjection, setWellProjection] = useState("");
  const [wellWidth, setWellWidth] = useState("");
  const [wellDepth, setWellDepth] = useState("");
  const [state, setState] = useState<State>({ phase: "idle" });

  const ids = {
    width: useId(),
    height: useId(),
    sill: useId(),
    grade: useId(),
    wp: useId(),
    ww: useId(),
    wd: useId(),
  };

  const num = (s: string) => Number(s.trim() === "" ? "NaN" : s);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const wellEntered =
        position === "below-grade" &&
        (wellProjection.trim() !== "" || wellWidth.trim() !== "" || wellDepth.trim() !== "");
      const data = checkEgress({
        clearWidth: num(width),
        clearHeight: num(height),
        sillHeight: num(sill),
        sillPosition: position,
        gradeDistance: num(grade),
        well: wellEntered
          ? {
              projection: num(wellProjection),
              width: num(wellWidth),
              depth: wellDepth.trim() === "" ? num(grade) : num(wellDepth),
            }
          : null,
      });
      setState({ phase: "result", data });
    } catch (err) {
      const e2 = asToolError(err);
      setState({ phase: "error", kind: e2.kind, message: e2.message });
    }
  }

  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";

  const numberInput = (id: string, value: string, set: (v: string) => void, placeholder?: string) => (
    <input
      id={id}
      type="number"
      inputMode="decimal"
      step="any"
      value={value}
      placeholder={placeholder}
      onChange={(e) => set(e.target.value)}
      className={field}
    />
  );

  return (
    <div>
      <form onSubmit={submit} className="mb-6" noValidate>
        <fieldset className="mb-4">
          <legend className="mb-2 font-medium">The window opening, in inches</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor={ids.width} className="mb-1.5 block text-sm font-medium">
                Clear opening width
              </label>
              {numberInput(ids.width, width, setWidth)}
            </div>
            <div>
              <label htmlFor={ids.height} className="mb-1.5 block text-sm font-medium">
                Clear opening height
              </label>
              {numberInput(ids.height, height, setHeight)}
            </div>
            <div>
              <label htmlFor={ids.sill} className="mb-1.5 block text-sm font-medium">
                Floor to bottom of opening
              </label>
              {numberInput(ids.sill, sill, setSill)}
            </div>
          </div>
          <p className="mt-1.5 text-xs text-[var(--color-muted)]">
            Open the window fully, the normal way, and measure the clear space a person could climb through — inside
            the sash and frame, not the glass or the rough opening.
          </p>
        </fieldset>

        <fieldset className="mb-4">
          <legend className="mb-2 font-medium">Outside, the bottom of the opening is…</legend>
          <div className="mb-3 flex flex-wrap gap-2">
            {(
              [
                ["above-grade", "Above the ground"],
                ["below-grade", "Below the ground (basement)"],
              ] as const
            ).map(([p, label]) => (
              <label
                key={p}
                className={`cursor-pointer rounded-md border px-3 py-2 text-sm ${
                  position === p
                    ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] font-medium"
                    : "border-[var(--color-line)]"
                }`}
              >
                <input
                  type="radio"
                  name="sill-position"
                  value={p}
                  checked={position === p}
                  onChange={() => setPosition(p)}
                  className="sr-only"
                />
                {label}
              </label>
            ))}
          </div>
          <div className="sm:w-1/3">
            <label htmlFor={ids.grade} className="mb-1.5 block text-sm font-medium">
              {position === "above-grade" ? "Height above the ground, in" : "Depth below the ground, in"}
            </label>
            {numberInput(ids.grade, grade, setGrade)}
          </div>
          <p className="mt-1.5 text-xs text-[var(--color-muted)]">
            Within 44 in above or below the ground outside counts as a grade-floor opening, which has a 5 sq ft
            minimum instead of 5.7.
          </p>
        </fieldset>

        {position === "below-grade" && (
          <fieldset className="mb-4">
            <legend className="mb-2 font-medium">
              The area well, inside dimensions in inches{" "}
              <span className="font-normal text-[var(--color-muted)]">— optional</span>
            </legend>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label htmlFor={ids.wp} className="mb-1.5 block text-sm font-medium">
                  Projection out from the wall
                </label>
                {numberInput(ids.wp, wellProjection, setWellProjection)}
              </div>
              <div>
                <label htmlFor={ids.ww} className="mb-1.5 block text-sm font-medium">
                  Width along the wall
                </label>
                {numberInput(ids.ww, wellWidth, setWellWidth)}
              </div>
              <div>
                <label htmlFor={ids.wd} className="mb-1.5 block text-sm font-medium">
                  Depth of the well
                </label>
                {numberInput(ids.wd, wellDepth, setWellDepth, "Defaults to the depth above")}
              </div>
            </div>
          </fieldset>
        )}

        <button type="submit" className="rounded-md bg-[var(--color-accent)] px-5 py-2.5 font-medium text-white">
          Check the window
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
