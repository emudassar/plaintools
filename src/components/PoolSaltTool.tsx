"use client";

import { useState, useId } from "react";
import {
  calculatePoolSalt,
  fmt,
  HAYWARD_ZERO_ROW,
  QUOTES,
  type PoolSaltResult,
  type VolumeUnit,
} from "@/lib/pool-salt";
import { asToolError, type ErrorKind } from "@/lib/errors";

/**
 * Three real states: idle / error / result. No loading state — it is arithmetic
 * in the browser, so a spinner would be theatre.
 */

type State =
  | { phase: "idle" }
  | { phase: "error"; kind: ErrorKind; message: string }
  | { phase: "result"; data: PoolSaltResult };

function Headline({ data }: { data: PoolSaltResult }) {
  if (data.action === "add") {
    return (
      <>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {fmt(data.pounds)} lb of salt ({fmt(data.kilograms)} kg)
        </p>
        <p className="mt-1 text-[var(--color-muted)]">
          About {data.bags} × {fmt(data.bagLb)} lb {data.bags === 1 ? "bag" : "bags"} to raise{" "}
          {fmt(data.gallons)} gallons from {fmt(data.currentPpm)} to {fmt(data.targetPpm)} ppm.
        </p>
      </>
    );
  }
  if (data.action === "ok") {
    return (
      <>
        <p className="mt-1 text-2xl font-semibold tracking-tight">No salt to add</p>
        <p className="mt-1 text-[var(--color-muted)]">
          The reading already equals the {fmt(data.targetPpm)} ppm target.
        </p>
      </>
    );
  }
  return (
    <>
      <p className="mt-1 text-2xl font-semibold tracking-tight">
        Salt is above target — none to add
      </p>
      <p className="mt-1 text-[var(--color-muted)]">
        Replacing about {fmt((data.drainFraction ?? 0) * 100)}% of the water (
        {fmt(data.drainGallons ?? 0)} gallons) with fresh water brings {fmt(data.currentPpm)} ppm
        down to {fmt(data.targetPpm)} ppm.
      </p>
    </>
  );
}

function ResultCard({ data }: { data: PoolSaltResult }) {
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          {data.action === "drain" ? "Salt level too high" : "Salt to add"}
        </p>
        <Headline data={data} />
      </div>

      <div className="p-5">
        {data.targetOutsideHaywardRange && (
          <div className="mb-5 rounded-md border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-4">
            <p className="text-sm">
              <strong className="font-medium">Your target is outside Hayward&rsquo;s stated range.</strong>{" "}
              Hayward&rsquo;s manual reads: &ldquo;{QUOTES.ideal.text}&rdquo; Other generator
              makers publish their own ranges — your unit&rsquo;s manual is the number that
              applies to it.
            </p>
          </div>
        )}

        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">The arithmetic</h3>
        <div className="mb-5 rounded-md border border-[var(--color-line)] p-4 text-sm text-[var(--color-muted)]">
          {data.action === "drain" ? (
            <p>
              Fraction to replace = 1 − target ÷ current = 1 − {fmt(data.targetPpm)} ÷{" "}
              {fmt(data.currentPpm)} = {fmt((data.drainFraction ?? 0) * 100, 1)}%. This assumes the
              refill water contains no salt and the pool is mixed before re-testing.
            </p>
          ) : (
            <p>
              Pounds = gallons × (target − current ppm) × 8.34 ÷ 1,000,000 ={" "}
              {fmt(data.gallons)} × {fmt(data.targetPpm - data.currentPpm)} × 8.34 ÷ 1,000,000 ={" "}
              <strong className="font-medium text-[var(--color-fg)]">{fmt(data.pounds, 1)} lb</strong>
              . 8.34 lb is the weight of one US gallon of water; ppm is parts per million by
              weight.
            </p>
          )}
          <p className="mt-2">
            Volume used: {fmt(data.gallons)} US gallons ({fmt(data.litres)} litres).
          </p>
        </div>

        {data.action === "drain" && (
          <p className="mb-5 text-sm text-[var(--color-muted)]">
            Hayward&rsquo;s manual: &ldquo;{QUOTES.lowering.text}&rdquo;
          </p>
        )}

        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          Cross-check: Hayward&rsquo;s printed table, starting from 0 ppm to 3,200 ppm
        </h3>
        <div className="mb-5 overflow-x-auto rounded-md border border-[var(--color-line)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-accent-soft)] text-left">
              <tr>
                <th className="px-3 py-2 font-medium">Pool gallons</th>
                <th className="px-3 py-2 font-medium">Hayward table (lb)</th>
                <th className="px-3 py-2 font-medium">This formula (lb)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-line)]">
              {HAYWARD_ZERO_ROW.map((r) => (
                <tr key={r.gallons}>
                  <td className="px-3 py-2">{fmt(r.gallons)}</td>
                  <td className="px-3 py-2">{fmt(r.pounds)}</td>
                  <td className="px-3 py-2">{fmt((r.gallons * 3200 * 8.34) / 1_000_000, 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          What this page cannot tell you
        </h3>
        <p className="text-sm text-[var(--color-muted)]">
          The answer is only as good as the volume and the reading you enter. Test strips and
          generator displays can disagree by several hundred ppm, and the manual itself advises a
          professional salt test before adding large quantities. This page does not know your
          generator model or its required range, and does not cover chlorine, pH or stabilizer.
        </p>

        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Method: mass of water × change in ppm. Cross-checked against Hayward AquaRite
            Operation and Installation Manual, &ldquo;Pounds and (Kg) of salt needed for 3200
            ppm&rdquo; table. Retrieved {data.retrievedAt}.
          </p>
          <p className="mt-1">
            <a
              href="https://hayward.com/media/wysiwyg/pdf/aqua_rite_product_manual.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-accent)] underline"
            >
              Hayward AquaRite manual (PDF)
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function PoolSaltTool() {
  const [volume, setVolume] = useState("15000");
  const [unit, setUnit] = useState<VolumeUnit>("gal");
  const [current, setCurrent] = useState("2400");
  const [target, setTarget] = useState("3200");
  const [bag, setBag] = useState("40");
  const [state, setState] = useState<State>({ phase: "idle" });

  const volId = useId();
  const unitId = useId();
  const curId = useId();
  const tgtId = useId();
  const bagId = useId();

  const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

  function run(e: React.FormEvent) {
    e.preventDefault();
    try {
      const data = calculatePoolSalt({
        volume: num(volume),
        unit,
        currentPpm: num(current),
        targetPpm: num(target),
        bagLb: num(bag),
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
      <form onSubmit={run} className="mb-6">
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={volId} className="mb-1.5 block font-medium">
              Pool volume
            </label>
            <div className="flex gap-2">
              <input
                id={volId}
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                className={field}
              />
              <select
                id={unitId}
                aria-label="Volume unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value as VolumeUnit)}
                className="rounded-md border border-[var(--color-line)] bg-white px-2"
              >
                <option value="gal">US gallons</option>
                <option value="l">litres</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor={curId} className="mb-1.5 block font-medium">
              Current salt reading (ppm)
            </label>
            <input
              id={curId}
              type="number"
              inputMode="numeric"
              min="0"
              step="any"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className={field}
            />
            <p className="mt-1.5 text-xs text-[var(--color-muted)]">
              Enter 0 for a freshly filled pool.
            </p>
          </div>
          <div>
            <label htmlFor={tgtId} className="mb-1.5 block font-medium">
              Target salt level (ppm)
            </label>
            <input
              id={tgtId}
              type="number"
              inputMode="numeric"
              min="0"
              step="any"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className={field}
            />
            <p className="mt-1.5 text-xs text-[var(--color-muted)]">
              Use the figure in your generator&rsquo;s manual. Hayward states 3,200 ppm as optimal.
            </p>
          </div>
          <div>
            <label htmlFor={bagId} className="mb-1.5 block font-medium">
              Bag size (lb)
            </label>
            <input
              id={bagId}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={bag}
              onChange={(e) => setBag(e.target.value)}
              className={field}
            />
          </div>
        </div>

        <button
          type="submit"
          className="rounded-md bg-[var(--color-accent)] px-5 py-2.5 font-medium text-white"
        >
          Calculate the salt
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
