"use client";

import { useState, useId } from "react";
import { reelCapacity, type DiamUnit, type LengthUnit, type ReelResult } from "@/lib/reel-line-capacity";
import { isToolError } from "@/lib/errors";

/** Recomputed as inputs change. No loading state. */

const n = (x: number, d = 0) => x.toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d });

function ResultCard({ data, unit, backing }: { data: ReelResult; unit: LengthUnit; backing: boolean }) {
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          Estimated capacity for your line{backing ? " on top of the backing" : ""}
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          About {n(data.length)} {unit}
        </p>
        <p className="mt-1 text-[var(--color-muted)]">
          {n(data.lengthYd)} yd · {n(data.lengthM)} m
          {data.backingShare !== null ? ` · backing uses ${n(data.backingShare * 100)}% of the spool` : ""}
        </p>
      </div>
      <div className="p-5 text-sm">
        <p className="mb-5">
          Your line is {data.ratio >= 1 ? "thinner" : "thicker"} than the rated line, so the spool holds {n(data.ratio, 2)} × the rated
          length{backing ? " (before backing)" : ""}.
        </p>
        <h3 className="mb-2 font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
        <p className="text-[var(--color-muted)]">
          The exact number. The calculation treats line as a solid cylinder that packs the same way at any diameter. Braid flattens and
          packs differently from mono, line diameters vary between brands even at the same pound test, and how tightly line is spooled
          changes how much fits. Use the diameter printed on your line&rsquo;s spool, not its pound test.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Method: a spool holds a fixed volume of line; volume of line = π/4 × diameter² × length, so new length = (rated diameter² ×
            rated length − backing diameter² × backing length) ÷ new diameter². Geometry in your browser; no external data.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function ReelLineCapacityTool() {
  const [diamUnit, setDiamUnit] = useState<DiamUnit>("mm");
  const [lengthUnit, setLengthUnit] = useState<LengthUnit>("yd");
  const [ratedDiam, setRatedDiam] = useState("0.30");
  const [ratedLen, setRatedLen] = useState("150");
  const [newDiam, setNewDiam] = useState("0.20");
  const [useBacking, setUseBacking] = useState(false);
  const [bDiam, setBDiam] = useState("0.30");
  const [bLen, setBLen] = useState("50");
  const ids = { du: useId(), lu: useId(), rd: useId(), rl: useId(), nd: useId(), bd: useId(), bl: useId() };

  const num = (v: string) => (v.trim() === "" ? NaN : Number(v));
  let data: ReelResult | null = null;
  let error: string | null = null;
  try {
    data = reelCapacity({
      ratedDiam: num(ratedDiam),
      ratedLength: num(ratedLen),
      newDiam: num(newDiam),
      diamUnit,
      lengthUnit,
      backing: useBacking ? { diam: num(bDiam), length: num(bLen) } : null,
    });
  } catch (e) {
    error = isToolError(e) ? e.message : "That input could not be used.";
  }
  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";

  return (
    <div>
      <div className="mb-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={ids.du} className="mb-1.5 block font-medium">
            Line diameters in
          </label>
          <select id={ids.du} value={diamUnit} onChange={(e) => setDiamUnit(e.target.value as DiamUnit)} className={field}>
            <option value="mm">millimetres</option>
            <option value="in">inches</option>
          </select>
        </div>
        <div>
          <label htmlFor={ids.lu} className="mb-1.5 block font-medium">
            Lengths in
          </label>
          <select id={ids.lu} value={lengthUnit} onChange={(e) => setLengthUnit(e.target.value as LengthUnit)} className={field}>
            <option value="yd">yards</option>
            <option value="m">metres</option>
            <option value="ft">feet</option>
          </select>
        </div>
      </div>
      <div className="mb-3 grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor={ids.rd} className="mb-1.5 block font-medium">
            Reel rating: line diameter
          </label>
          <input id={ids.rd} type="number" inputMode="decimal" min="0" step="any" value={ratedDiam} onChange={(e) => setRatedDiam(e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor={ids.rl} className="mb-1.5 block font-medium">
            Reel rating: length
          </label>
          <input id={ids.rl} type="number" inputMode="decimal" min="0" step="any" value={ratedLen} onChange={(e) => setRatedLen(e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor={ids.nd} className="mb-1.5 block font-medium">
            Your line&rsquo;s diameter
          </label>
          <input id={ids.nd} type="number" inputMode="decimal" min="0" step="any" value={newDiam} onChange={(e) => setNewDiam(e.target.value)} className={field} />
        </div>
      </div>
      <label className="mb-3 flex items-center gap-2 font-medium">
        <input type="checkbox" checked={useBacking} onChange={(e) => setUseBacking(e.target.checked)} />
        I&rsquo;m putting backing on first
      </label>
      {useBacking && (
        <div className="mb-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={ids.bd} className="mb-1.5 block font-medium">
              Backing diameter
            </label>
            <input id={ids.bd} type="number" inputMode="decimal" min="0" step="any" value={bDiam} onChange={(e) => setBDiam(e.target.value)} className={field} />
          </div>
          <div>
            <label htmlFor={ids.bl} className="mb-1.5 block font-medium">
              Backing length
            </label>
            <input id={ids.bl} type="number" inputMode="decimal" min="0" step="any" value={bLen} onChange={(e) => setBLen(e.target.value)} className={field} />
          </div>
        </div>
      )}
      <p className="mb-6 text-xs text-[var(--color-muted)]">
        Reels print capacity as diameter/length (e.g. 0.30/150) or pound test/length; for a pound-test rating, use the diameter of a line of that
        test. The result updates as you type.
      </p>
      <div aria-live="polite">
        {error ? (
          <div className="rounded-lg border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-5">
            <p className="font-medium">That input could not be used</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{error}</p>
          </div>
        ) : (
          data && <ResultCard data={data} unit={lengthUnit} backing={useBacking} />
        )}
      </div>
    </div>
  );
}
