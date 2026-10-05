"use client";

import { useState, useId } from "react";
import { calculateLogVolume, BRIGGS_APP3_URL, BRIGGS_CH2_URL, type LogResult, type RuleValue } from "@/lib/log-volume";
import { isToolError } from "@/lib/errors";

/** Recomputed as inputs change. No loading state. */

const n = (x: number, d = 1) => x.toLocaleString("en-US", { maximumFractionDigits: d });

function basisNote(v: RuleValue) {
  return v.basis === "table" ? "published table value" : `formula (${n(v.formulaValue, 1)} per log, outside the 6–30 in × 6–16 ft table)`;
}

function ResultCard({ data }: { data: LogResult }) {
  const each = data.count > 1 ? ` for ${data.count} logs` : "";
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">Board feet{each}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {n(data.international.boardFeet, 0)} BF International ¼″ · {n(data.doyle.boardFeet, 0)} BF Doyle
        </p>
        <p className="mt-1 text-[var(--color-muted)]">
          Cubic volume {n(data.cubicFeet, 2)} ft³ ({n(data.cubicMetres, 3)} m³)
          {data.cubicMethod === "smalian" ? " by Smalian’s formula." : " as a cylinder at the small-end diameter — add the large end for Smalian’s formula."}
        </p>
      </div>
      <div className="p-5 text-sm">
        <table className="mb-5 w-full text-left">
          <thead className="text-[var(--color-muted)]">
            <tr>
              <th className="py-1 font-medium">Rule</th>
              <th className="py-1 font-medium">Board feet</th>
              <th className="py-1 font-medium">From</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-[var(--color-line)]">
              <td className="py-1">International ¼-inch</td>
              <td className="py-1">{n(data.international.boardFeet, 0)}</td>
              <td className="py-1">{basisNote(data.international)}</td>
            </tr>
            <tr className="border-t border-[var(--color-line)]">
              <td className="py-1">Doyle</td>
              <td className="py-1">{n(data.doyle.boardFeet, 0)}</td>
              <td className="py-1">{basisNote(data.doyle)}</td>
            </tr>
          </tbody>
        </table>
        {data.doyleSmallLogNote && (
          <p className="mb-4 text-[var(--color-muted)]">
            Small log: Briggs notes the Doyle rule&rsquo;s 4-inch slab allowance under-scales small logs heavily, and that some
            buyers instead assume one board foot per foot of length at 7 inches or less.
          </p>
        )}
        <h3 className="mb-2 font-semibold tracking-wide uppercase">The arithmetic</h3>
        <p className="mb-5 text-[var(--color-muted)]">
          Doyle: ((d − 4) ÷ 4)² × L. International ¼″: 0.905 × (0.22d² − 0.71d) for each 4-ft section, with d growing ½ inch
          per section. Cubic: 0.005454 × d² × L for a cylinder, or 0.005454 × (d² + D²) × L ÷ 2 (Smalian).
        </p>
        <h3 className="mb-2 font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
        <p className="text-[var(--color-muted)]">
          Log rules estimate the lumber a sawmill might get, and the two rules disagree — most of all on small logs. Your
          sale uses whichever rule the buyer scales by, minus deductions for defects. This is gross scale only.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>Source: Briggs (1994), Forest Products Measurements and Conversion Factors, Ch. 2 and Appendix 3. Retrieved {data.retrievedAt}.</p>
          <p className="mt-1">
            <a href={BRIGGS_CH2_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              Chapter 2 (PDF)
            </a>{" "}
            ·{" "}
            <a href={BRIGGS_APP3_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              Appendix 3 tables (PDF)
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function LogVolumeTool() {
  const [small, setSmall] = useState("12");
  const [large, setLarge] = useState("");
  const [length, setLength] = useState("16");
  const [count, setCount] = useState("1");
  const ids = { s: useId(), l: useId(), len: useId(), c: useId() };
  const num = (x: string) => (x.trim() === "" ? NaN : Number(x));

  let data: LogResult | null = null;
  let error: string | null = null;
  try {
    data = calculateLogVolume({
      smallDiameterIn: num(small),
      largeDiameterIn: large.trim() === "" ? null : Number(large),
      lengthFt: num(length),
      count: num(count),
    });
  } catch (e) {
    error = isToolError(e) ? e.message : "That input could not be used.";
  }
  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";
  const inp = (id: string, v: string, set: (s: string) => void, step = "any") => (
    <input id={id} type="number" inputMode="decimal" min="0" step={step} value={v} onChange={(e) => set(e.target.value)} className={field} />
  );

  return (
    <div>
      <div className="mb-2 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={ids.s} className="mb-1.5 block font-medium">
            Small-end diameter, inside bark (in)
          </label>
          {inp(ids.s, small, setSmall)}
        </div>
        <div>
          <label htmlFor={ids.len} className="mb-1.5 block font-medium">
            Log length (ft)
          </label>
          {inp(ids.len, length, setLength)}
        </div>
        <div>
          <label htmlFor={ids.l} className="mb-1.5 block font-medium">
            Large-end diameter (in) <span className="font-normal text-[var(--color-muted)]">(optional, for cubic)</span>
          </label>
          {inp(ids.l, large, setLarge)}
        </div>
        <div>
          <label htmlFor={ids.c} className="mb-1.5 block font-medium">
            Number of identical logs
          </label>
          {inp(ids.c, count, setCount, "1")}
        </div>
      </div>
      <p className="mb-6 text-xs text-[var(--color-muted)]">The answer updates as you type; nothing is sent anywhere.</p>
      <div aria-live="polite">
        {error ? (
          <div className="rounded-lg border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-5">
            <p className="font-medium">That input could not be used</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{error}</p>
          </div>
        ) : (
          data && <ResultCard data={data} />
        )}
      </div>
    </div>
  );
}
