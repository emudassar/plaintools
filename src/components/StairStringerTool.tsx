"use client";

import { useState, useId } from "react";
import {
  calculateStairStringer,
  DCA6_URL,
  feetInches,
  MAX_RISER_IN,
  MIN_THROAT_IN,
  MIN_TREAD_IN,
  type StairResult,
} from "@/lib/stair-stringer";
import { isToolError } from "@/lib/errors";

/** Recomputed as inputs change. No loading state. */

const n = (x: number, d = 2) => x.toLocaleString("en-US", { maximumFractionDigits: d });

function Row({ ok, label, detail }: { ok: boolean; label: string; detail: string }) {
  return (
    <tr className="border-t border-[var(--color-line)]">
      <td className="py-1 pr-2">{ok ? "Within" : "Outside"}</td>
      <td className="py-1 pr-2">{label}</td>
      <td className="py-1 text-[var(--color-muted)]">{detail}</td>
    </tr>
  );
}

function ResultCard({ data }: { data: StairResult }) {
  const c = data.checks;
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          {data.risers} risers · {data.treads} treads cut into the stringer
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          Riser {feetInches(data.riserIn)} · total run {feetInches(data.totalRunIn)}
        </p>
        <p className="mt-1 text-[var(--color-muted)]">
          Stringer slope length {feetInches(data.slopeLengthIn)} at {n(data.angleDeg, 1)}°. Each step&rsquo;s diagonal on the board
          is {feetInches(data.stepDiagonalIn)}; throat left after notching {feetInches(data.throatIn)}.
          {data.cutStringers !== null && ` At 18 in maximum spacing: ${data.cutStringers} cut stringers.`}
        </p>
      </div>
      <div className="p-5 text-sm">
        <h3 className="mb-2 font-semibold tracking-wide uppercase">Against AWC DCA 6</h3>
        <table className="mb-5 w-full text-left">
          <tbody>
            <Row ok={c.riser} label={`Riser ≤ ${MAX_RISER_IN} in`} detail={`${n(data.riserIn, 3)} in`} />
            <Row ok={c.tread} label={`Tread ≥ ${MIN_TREAD_IN} in`} detail="as entered" />
            <Row ok={c.throat} label={`Throat ≥ ${MIN_THROAT_IN} in`} detail={`${n(data.throatIn, 2)} in`} />
            <Row
              ok={c.cutSpan}
              label="Cut stringer span ≤ 6 ft 0 in"
              detail={c.cutSpan ? `${feetInches(data.totalRunIn)} horizontal` : c.solidSpan ? "over 6 ft: DCA 6 shows a 4x4 post, a landing, or solid stringers (13 ft 3 in max)" : "over the 13 ft 3 in solid stringer span too"}
            />
            {c.width !== null && <Row ok={c.width} label="Stair width ≥ 36 in" detail="DCA 6 / IRC R311.7" />}
          </tbody>
        </table>
        <ul className="mb-5 list-disc space-y-1 pl-5 text-[var(--color-muted)]">
          {c.landingRequired && <li>Total rise is over 12 ft: DCA 6 requires an intermediate landing.</li>}
          {c.handrail && <li>{data.risers} risers: DCA 6 requires a handrail on stairs with 4 or more risers.</li>}
          {c.guard && <li>Total rise is 30 in or more: DCA 6 requires a stair guard.</li>}
          <li>Riser heights may not differ from one another by more than 3/8 in, and nosings are 3/4 to 1-1/4 in (DCA 6 Fig. 27).</li>
        </ul>
        <h3 className="mb-2 font-semibold tracking-wide uppercase">The arithmetic</h3>
        <p className="mb-5 text-[var(--color-muted)]">
          Risers = total rise ÷ maximum riser, rounded up; riser = rise ÷ risers. Treads = risers − 1 (the deck is the top step). Run =
          treads × tread depth. Slope length = √(rise² + run²). Throat = board width − (riser × tread) ÷ √(riser² + tread²).
        </p>
        <h3 className="mb-2 font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
        <p className="text-[var(--color-muted)]">
          Your local code may differ from DCA 6. Measure total rise from the finished landing surface to the finished deck surface,
          and allow for tread thickness when you cut the bottom of the stringer. The board must be longer than the slope length to
          allow for the end cuts.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>Source: American Wood Council DCA 6 (2015 IRC), Stair Requirements and Figures 27–30. Retrieved {data.retrievedAt}.</p>
          <p className="mt-1">
            <a href={DCA6_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              AWC DCA 6
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function StairStringerTool() {
  const [rise, setRise] = useState("48");
  const [riseUnit, setRiseUnit] = useState<"in" | "ft">("in");
  const [maxR, setMaxR] = useState("7.75");
  const [tread, setTread] = useState("10.25");
  const [board, setBoard] = useState("11.25");
  const [width, setWidth] = useState("36");
  const ids = { r: useId(), u: useId(), m: useId(), t: useId(), b: useId(), w: useId() };
  const num = (x: string) => (x.trim() === "" ? NaN : Number(x));

  let data: StairResult | null = null;
  let error: string | null = null;
  try {
    data = calculateStairStringer({
      totalRiseIn: num(rise) * (riseUnit === "ft" ? 12 : 1),
      maxRiserIn: num(maxR),
      treadIn: num(tread),
      boardWidthIn: num(board),
      stairWidthIn: width.trim() === "" ? null : Number(width),
    });
  } catch (e) {
    error = isToolError(e) ? e.message : "That input could not be used.";
  }
  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";
  const inp = (id: string, v: string, set: (s: string) => void) => (
    <input id={id} type="number" inputMode="decimal" min="0" step="any" value={v} onChange={(e) => set(e.target.value)} className={field} />
  );
  const lbl = (id: string, text: string) => (
    <label htmlFor={id} className="mb-1.5 block font-medium">
      {text}
    </label>
  );

  return (
    <div>
      <div className="mb-2 grid gap-3 sm:grid-cols-2">
        <div>
          {lbl(ids.r, "Total rise (landing to deck surface)")}
          <div className="flex gap-2">
            {inp(ids.r, rise, setRise)}
            <select aria-label="Rise unit" value={riseUnit} onChange={(e) => setRiseUnit(e.target.value as "in" | "ft")} className="rounded-md border border-[var(--color-line)] bg-white px-2">
              <option value="in">in</option>
              <option value="ft">ft</option>
            </select>
          </div>
        </div>
        <div>
          {lbl(ids.m, "Maximum riser height (in)")}
          {inp(ids.m, maxR, setMaxR)}
        </div>
        <div>
          {lbl(ids.t, "Tread depth / run per step (in)")}
          {inp(ids.t, tread, setTread)}
        </div>
        <div>
          {lbl(ids.b, "Stringer board width (in) — 2x12 = 11.25")}
          {inp(ids.b, board, setBoard)}
        </div>
        <div>
          {lbl(ids.w, "Stair width (in), optional")}
          {inp(ids.w, width, setWidth)}
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
