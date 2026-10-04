"use client";

import { useState, useId } from "react";
import {
  CAPSULE_RETRIEVED,
  CAPSULE_SIZES,
  CONI_SNAP_URL,
  PRINTED_DENSITIES,
  capacityMg,
  findCapsule,
  findSmallestSize,
  type CapsuleSize,
  type SizeFinderResult,
} from "@/lib/capsule-size";
import { asToolError } from "@/lib/errors";

/**
 * Pick a size → its specification card (live, like a chart lookup).
 * Optional finder → smallest size whose theoretical fill holds a dose.
 * Arithmetic in the browser, so no loading state.
 */

type Finder =
  | { phase: "idle" }
  | { phase: "error"; message: string }
  | { phase: "result"; data: SizeFinderResult };

const n = (x: number, d = 0) =>
  x.toLocaleString("en-US", { maximumFractionDigits: d });
const sizeName = (s: CapsuleSize) =>
  `Size ${s.label}${s.europeOnly ? " (Europe-only variant)" : ""}`;

function SourceFooter() {
  return (
    <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
      <p>
        Source: Capsugel, Coni-Snap&reg; Hard Gelatin Capsules brochure (BAS
        255), p. 16 &ldquo;Properties and specifications&rdquo;. Retrieved{" "}
        {CAPSULE_RETRIEVED}.
      </p>
      <p className="mt-1">
        <a
          href={CONI_SNAP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--color-accent)] underline"
        >
          Coni-Snap brochure (PDF, distributor copy)
        </a>
      </p>
    </footer>
  );
}

function SizeCard({ s }: { s: CapsuleSize }) {
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          {sizeName(s)} capsule
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {s.volumeMl.toFixed(2)} ml · holds about {n(s.volumeMl * 1000)} mg at
          1.0 g/ml
        </p>
        <p className="mt-1 text-[var(--color-muted)]">
          {s.closedLengthMm} mm ({s.closedLengthIn}&Prime;) long closed,{" "}
          {s.capDiameterMm} mm across the cap. Empty weight {s.weightMg} ±
          {s.weightTolMg} mg.
        </p>
      </div>
      <div className="p-5">
        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          Fill capacity by powder density
        </h3>
        <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PRINTED_DENSITIES.map((d) => (
            <div
              key={d}
              className="rounded-md border border-[var(--color-line)] p-3 text-center"
            >
              <p className="text-xs text-[var(--color-muted)]">
                {d.toFixed(1)} g/ml
              </p>
              <p className="text-lg font-semibold">{n(capacityMg(s, d))} mg</p>
            </div>
          ))}
        </div>
        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          Dimensions
        </h3>
        <table className="mb-5 w-full text-sm">
          <tbody className="divide-y divide-[var(--color-line)]">
            <tr>
              <td className="py-1.5 text-[var(--color-muted)]">Overall closed length</td>
              <td className="py-1.5 text-right">
                {s.closedLengthMm} ± {s.closedTolMm} mm · {s.closedLengthIn}&Prime;
              </td>
            </tr>
            <tr>
              <td className="py-1.5 text-[var(--color-muted)]">Body length</td>
              <td className="py-1.5 text-right">
                {s.bodyLengthMm.toFixed(2)} mm · {s.bodyLengthIn.toFixed(3)}&Prime;
              </td>
            </tr>
            <tr>
              <td className="py-1.5 text-[var(--color-muted)]">Cap length</td>
              <td className="py-1.5 text-right">
                {s.capLengthMm.toFixed(2)} mm · {s.capLengthIn.toFixed(3)}&Prime;
              </td>
            </tr>
            <tr>
              <td className="py-1.5 text-[var(--color-muted)]">Body diameter</td>
              <td className="py-1.5 text-right">
                {s.bodyDiameterMm.toFixed(2)} mm · {s.bodyDiameterIn.toFixed(3)}&Prime;
              </td>
            </tr>
            <tr>
              <td className="py-1.5 text-[var(--color-muted)]">Cap diameter</td>
              <td className="py-1.5 text-right">
                {s.capDiameterMm.toFixed(2)} mm · {s.capDiameterIn.toFixed(3)}&Prime;
              </td>
            </tr>
          </tbody>
        </table>
        {s.note && (
          <p className="mb-5 rounded-md border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-3 text-sm">
            {s.note}
          </p>
        )}
        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          What this page cannot tell you
        </h3>
        <p className="text-sm text-[var(--color-muted)]">
          Fill capacity is the capsule volume × the powder&rsquo;s density. It
          is a theoretical figure: how much actually goes in depends on how
          the powder flows and how firmly it is packed, so weigh filled
          capsules to know your real fill. These are one maker&rsquo;s gelatin
          capsule specifications; other makers&rsquo; and vegetarian (HPMC)
          capsules of the same size number can differ slightly. The page says
          nothing about what dose is right or safe for anyone.
        </p>
        <SourceFooter />
      </div>
    </div>
  );
}

function FinderResult({ data }: { data: SizeFinderResult }) {
  if (!data.smallest) {
    return (
      <div className="rounded-lg border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-5">
        <p className="font-medium">
          No single capsule in the chart holds {n(data.doseMg)} mg at{" "}
          {data.density} g/ml
        </p>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          The largest size, 000, holds about{" "}
          {n(data.density * 1370)} mg of this powder (1.37 ml × {data.density}{" "}
          g/ml). Split evenly, {n(data.doseMg)} mg would take{" "}
          <strong className="text-[var(--color-fg)]">
            {data.capsules000Needed} size 000 capsules
          </strong>{" "}
          of about {n(data.doseMg / (data.capsules000Needed ?? 1))} mg each.
        </p>
      </div>
    );
  }
  const s = data.smallest;
  return (
    <div className="rounded-lg border border-[var(--color-line)] p-5">
      <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
        Smallest size that holds {n(data.doseMg)} mg at {data.density} g/ml
      </p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">
        Size {s.label} — up to {n(data.smallestCapacityMg ?? 0)} mg
      </p>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        {s.volumeMl.toFixed(2)} ml × {data.density} g/ml ×
        1,000 = {n(data.smallestCapacityMg ?? 0)} mg, so the fill would use
        about {n((data.doseMg / (data.smallestCapacityMg ?? 1)) * 100)}% of the
        capsule. Sizes that also hold it:{" "}
        {data.fitting
          .slice(1)
          .map((f) => f.label)
          .join(", ") || "none larger in the chart"}
        .
      </p>
    </div>
  );
}

export default function CapsuleSizeTool() {
  const [sizeId, setSizeId] = useState("0");
  const [dose, setDose] = useState("500");
  const [density, setDensity] = useState("0.8");
  const [finder, setFinder] = useState<Finder>({ phase: "idle" });
  const ids = { size: useId(), dose: useId(), den: useId() };
  const s = findCapsule(sizeId);
  const num = (x: string) => (x.trim() === "" ? NaN : Number(x));

  function run(e: React.FormEvent) {
    e.preventDefault();
    try {
      setFinder({
        phase: "result",
        data: findSmallestSize(num(dose), num(density)),
      });
    } catch (err) {
      setFinder({ phase: "error", message: asToolError(err).message });
    }
  }

  const field =
    "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";

  return (
    <div>
      <div className="mb-6">
        <label htmlFor={ids.size} className="mb-1.5 block font-medium">
          Capsule size
        </label>
        <select
          id={ids.size}
          value={sizeId}
          onChange={(e) => setSizeId(e.target.value)}
          className={`${field} sm:w-72`}
        >
          {CAPSULE_SIZES.map((c) => (
            <option key={c.id} value={c.id}>
              {sizeName(c)} — {c.volumeMl.toFixed(2)} ml
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-xs text-[var(--color-muted)]">
          The answer updates as you choose. Nothing is sent anywhere.
        </p>
      </div>

      <div aria-live="polite">
        <SizeCard s={s} />
      </div>

      <form
        onSubmit={run}
        className="mt-8 rounded-lg border border-[var(--color-line)] p-5"
      >
        <h3 className="mb-3 font-semibold">
          Which size holds my fill?
        </h3>
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={ids.dose} className="mb-1.5 block font-medium">
              Fill per capsule (mg)
            </label>
            <input
              id={ids.dose}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              className={field}
            />
          </div>
          <div>
            <label htmlFor={ids.den} className="mb-1.5 block font-medium">
              Powder density (g/ml)
            </label>
            <input
              id={ids.den}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={density}
              onChange={(e) => setDensity(e.target.value)}
              className={field}
            />
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              Not sure? The brochure prints 0.6, 0.8, 1.0 and 1.2 g/ml. Weigh
              a level 10 ml of your powder: grams ÷ 10 = g/ml.
            </p>
          </div>
        </div>
        <button
          type="submit"
          className="rounded-md bg-[var(--color-accent)] px-5 py-2.5 font-medium text-white"
        >
          Find the size
        </button>
        <div aria-live="polite" className="mt-4">
          {finder.phase === "error" && (
            <div className="rounded-lg border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-5">
              <p className="font-medium">That input could not be used</p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                {finder.message}
              </p>
            </div>
          )}
          {finder.phase === "result" && <FinderResult data={finder.data} />}
        </div>
      </form>

      <h3 className="mt-8 mb-2 text-sm font-semibold tracking-wide uppercase">
        Full capsule size chart
      </h3>
      <div className="overflow-x-auto rounded-md border border-[var(--color-line)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-accent-soft)] text-left">
            <tr>
              <th className="px-3 py-2 font-medium">Size</th>
              <th className="px-3 py-2 font-medium">Volume (ml)</th>
              <th className="px-3 py-2 font-medium">mg at 0.6</th>
              <th className="px-3 py-2 font-medium">mg at 0.8</th>
              <th className="px-3 py-2 font-medium">mg at 1.0</th>
              <th className="px-3 py-2 font-medium">mg at 1.2</th>
              <th className="px-3 py-2 font-medium">Closed length (mm)</th>
              <th className="px-3 py-2 font-medium">Cap dia. (mm)</th>
              <th className="px-3 py-2 font-medium">Empty wt (mg)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-line)]">
            {CAPSULE_SIZES.map((c) => (
              <tr
                key={c.id}
                className={
                  c.id === sizeId ? "bg-[var(--color-accent-soft)] font-medium" : ""
                }
              >
                <td className="px-3 py-1.5">
                  {c.label}
                  {c.europeOnly ? "*" : ""}
                </td>
                <td className="px-3 py-1.5">{c.volumeMl.toFixed(2)}</td>
                {PRINTED_DENSITIES.map((d) => (
                  <td key={d} className="px-3 py-1.5">
                    {n(capacityMg(c, d))}
                  </td>
                ))}
                <td className="px-3 py-1.5">{c.closedLengthMm}</td>
                <td className="px-3 py-1.5">{c.capDiameterMm}</td>
                <td className="px-3 py-1.5">{c.weightMg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-[var(--color-muted)]">
        * Marked &ldquo;Europe only&rdquo; in the brochure. Capacity columns
        are the brochure&rsquo;s own (volume × density); powder density in
        g/ml.
      </p>
    </div>
  );
}
