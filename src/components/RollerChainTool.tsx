"use client";

import { useState, useId } from "react";
import { identifyChain, CHAINS, MM_PER_IN, TSUBAKI_URL, CHAIN_RETRIEVED, type ChainResult } from "@/lib/roller-chain";
import { isToolError } from "@/lib/errors";

/** Recomputed as inputs change. No loading state. */

const mm = (x: number, d = 2) => x.toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d });
const inch = (x: number) => (x / MM_PER_IN).toLocaleString("en-US", { maximumFractionDigits: 3, minimumFractionDigits: 3 });

function Headline({ data }: { data: ChainResult }) {
  if (!data.best) {
    return (
      <>
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          Measured pitch {mm(data.measuredPitchMm)} mm ({inch(data.measuredPitchMm)} in)
        </p>
        <p className="mt-1 text-lg font-semibold">
          That pitch is not within 5% of any ANSI chain from 25 to 240. It may be a metric (ISO / BS) chain, or the measurement needs
          repeating over more links.
        </p>
      </>
    );
  }
  const c = data.best.chain;
  return (
    <>
      <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
        Measured pitch {mm(data.measuredPitchMm)} mm ({inch(data.measuredPitchMm)} in)
      </p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">
        {data.ambiguous ? `ANSI ${data.candidates.map((x) => x.chain.no).join(" or ")}` : `ANSI #${c.no} chain`} — {c.pitchIn} in pitch
      </p>
      {data.ambiguous && (
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Both share a 1/2 in pitch. Measure the inner width between the inner plates: 40 is {mm(7.95)} mm (5/16 in), 41 is {mm(6.38)} mm
          (1/4 in).
        </p>
      )}
    </>
  );
}

export default function RollerChainTool() {
  const [unit, setUnit] = useState<"in" | "mm">("in");
  const [span, setSpan] = useState("5");
  const [pitches, setPitches] = useState("10");
  const [roller, setRoller] = useState("");
  const [width, setWidth] = useState("");
  const ids = { u: useId(), s: useId(), p: useId(), r: useId(), w: useId() };

  const num = (v: string) => (v.trim() === "" ? NaN : Number(v));
  let data: ChainResult | null = null;
  let error: string | null = null;
  try {
    data = identifyChain({
      unit,
      span: num(span),
      pitches: num(pitches),
      roller: roller.trim() === "" ? null : Number(roller),
      innerWidth: width.trim() === "" ? null : Number(width),
    });
  } catch (e) {
    error = isToolError(e) ? e.message : "That input could not be used.";
  }
  const hit = new Set(data?.candidates.map((c) => c.chain.no) ?? []);
  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";

  return (
    <div>
      <div className="mb-3 grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor={ids.u} className="mb-1.5 block font-medium">
            Measuring in
          </label>
          <select id={ids.u} value={unit} onChange={(e) => setUnit(e.target.value as "in" | "mm")} className={field}>
            <option value="in">inches</option>
            <option value="mm">millimetres</option>
          </select>
        </div>
        <div>
          <label htmlFor={ids.s} className="mb-1.5 block font-medium">
            Length between pin centres
          </label>
          <input id={ids.s} type="number" inputMode="decimal" min="0" step="any" value={span} onChange={(e) => setSpan(e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor={ids.p} className="mb-1.5 block font-medium">
            …over this many pitches
          </label>
          <input id={ids.p} type="number" inputMode="numeric" min="1" step="1" value={pitches} onChange={(e) => setPitches(e.target.value)} className={field} />
        </div>
      </div>
      <div className="mb-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={ids.r} className="mb-1.5 block font-medium">
            Roller diameter (optional)
          </label>
          <input id={ids.r} type="number" inputMode="decimal" min="0" step="any" value={roller} onChange={(e) => setRoller(e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor={ids.w} className="mb-1.5 block font-medium">
            Width between inner plates (optional)
          </label>
          <input id={ids.w} type="number" inputMode="decimal" min="0" step="any" value={width} onChange={(e) => setWidth(e.target.value)} className={field} />
        </div>
      </div>
      <p className="mb-6 text-xs text-[var(--color-muted)]">
        Measuring across 10 pitches (11 pins) averages out error: 5 in over 10 pitches is a 1/2 in pitch. The result updates as you type.
      </p>

      <div aria-live="polite" className="rounded-lg border border-[var(--color-line)]">
        <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
          {error ? <p className="text-sm">{error}</p> : data && <Headline data={data} />}
        </div>
        <div className="p-5 text-sm">
          <h3 className="mb-2 font-semibold tracking-wide uppercase">Roller chain size chart (single strand)</h3>
          <div className="mb-5 overflow-x-auto rounded-md border border-[var(--color-line)]">
            <table className="w-full whitespace-nowrap">
              <thead className="text-left text-[var(--color-muted)]">
                <tr>
                  <th className="px-2 py-1.5 font-medium">ANSI</th>
                  <th className="px-2 py-1.5 font-medium">Pitch</th>
                  <th className="px-2 py-1.5 font-medium">Roller Ø</th>
                  <th className="px-2 py-1.5 font-medium">Inner width</th>
                  <th className="px-2 py-1.5 font-medium">Pin Ø</th>
                  <th className="px-2 py-1.5 font-medium">Plate thick.</th>
                  <th className="px-2 py-1.5 font-medium">Min. tensile (ISO 606)</th>
                  <th className="px-2 py-1.5 font-medium">Mass</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-line)]">
                {CHAINS.map((c) => (
                  <tr key={c.no} className={hit.has(c.no) ? "bg-[var(--color-accent-soft)] font-semibold" : undefined}>
                    <td className="px-2 py-1.5">#{c.no}</td>
                    <td className="px-2 py-1.5">
                      {c.pitchIn}″ · {mm(c.pitchMm, 3)} mm
                    </td>
                    <td className="px-2 py-1.5">
                      {mm(c.rollerMm)} mm · {inch(c.rollerMm)}″
                    </td>
                    <td className="px-2 py-1.5">
                      {mm(c.innerWidthMm)} mm · {inch(c.innerWidthMm)}″
                    </td>
                    <td className="px-2 py-1.5">{mm(c.pinMm)} mm</td>
                    <td className="px-2 py-1.5">{mm(c.plateThickMm)} mm</td>
                    <td className="px-2 py-1.5">{c.isoKn !== null ? `${mm(c.isoKn, 1)} kN` : "—"}</td>
                    <td className="px-2 py-1.5">{mm(c.massKgM)} kg/m</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3 className="mb-2 font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
          <p className="text-[var(--color-muted)]">
            What load the chain can safely carry. Minimum tensile strength is a breaking figure, not a working load; working loads depend on
            speed, sprockets, lubrication and service factors in the maker&rsquo;s selection guide. Worn chain measures longer than new. Metric
            (ISO/BS) and motorcycle chains are not covered.
          </p>
          <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
            <p>
              Source: Tsubaki Europe, ANSI G8 standard roller chain — single-strand dimension and strength tables (mm; inch values
              converted at 25.4 mm/in). Retrieved {CHAIN_RETRIEVED}.
            </p>
            <p className="mt-1">
              <a href={TSUBAKI_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
                Tsubaki — ANSI G8 roller chain
              </a>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
