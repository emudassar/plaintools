"use client";

import { useState, useId } from "react";
import { calculateShock, type ShockResult } from "@/lib/pool-shock";
import {
  CHLORINE,
  DOSING_SOURCE_NAME,
  DOSING_SOURCE_URL,
  formatAmount,
  formatMetric,
} from "@/lib/pool-dosing";
import { asToolError, type ErrorKind } from "@/lib/errors";

/** idle / error / result. Pure arithmetic in the browser, so no loading state. */

type State =
  | { phase: "idle" }
  | { phase: "error"; kind: ErrorKind; message: string }
  | { phase: "result"; data: ShockResult };

const n = (x: number, d = 1) =>
  x.toLocaleString("en-US", { maximumFractionDigits: d });

function ResultCard({ data }: { data: ShockResult }) {
  const unit = data.measure === "wt" ? "oz" : "fl oz";
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          {data.action === "add" ? "Amount to add" : "No chlorine to add"}
        </p>
        {data.action === "add" ? (
          <>
            <p className="mt-1 text-2xl font-semibold tracking-tight">
              {formatAmount(data.amount, data.measure)}
            </p>
            <p className="mt-1 text-[var(--color-muted)]">
              of {data.productLabel} ({formatMetric(data.amount, data.measure)})
              to raise {n(data.gallons, 0)} gallons from {n(data.currentFc)} to{" "}
              {n(data.targetFc)} ppm free chlorine.
            </p>
          </>
        ) : (
          <p className="mt-1 text-[var(--color-muted)]">
            The current reading ({n(data.currentFc)} ppm) is already at or above
            the target ({n(data.targetFc)} ppm). Lowering chlorine is a
            different calculation — the source guide lists sodium thiosulfate
            and sodium sulfite as chlorine neutralizers.
          </p>
        )}
      </div>

      <div className="p-5">
        {data.action === "add" && (
          <>
            <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
              The arithmetic
            </h3>
            <div className="mb-5 rounded-md border border-[var(--color-line)] p-4 text-sm text-[var(--color-muted)]">
              <p>
                {data.method === "table" ? (
                  <>
                    The guide lists{" "}
                    <strong className="font-medium text-[var(--color-fg)]">
                      {data.printed}
                    </strong>{" "}
                    of {data.productLabel} to raise 10,000 gallons by 1 ppm.
                  </>
                ) : (
                  <>
                    The guide&rsquo;s no-label method:{" "}
                    {data.measure === "wt" ? "0.083 lb (1.33 oz)" : "1.3 fl oz"}{" "}
                    ÷ available fraction = {n(data.perPpmPer10k, 2)} {unit} per
                    ppm per 10,000 gallons.
                  </>
                )}
              </p>
              <p className="mt-2">
                {n(data.perPpmPer10k, 2)} {unit} × ({n(data.gallons, 0)} ÷
                10,000) × {n(Math.max(data.ppmChange, 0))} ppm ={" "}
                <strong className="font-medium text-[var(--color-fg)]">
                  {n(data.amount, 1)} {unit}
                </strong>
              </p>
            </div>
          </>
        )}

        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          The guide&rsquo;s figures for 10,000 gallons, +1 ppm
        </h3>
        <div className="mb-5 overflow-x-auto rounded-md border border-[var(--color-line)]">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-[var(--color-line)]">
              {CHLORINE.map((c) => (
                <tr
                  key={c.id}
                  className={
                    c.label === data.productLabel
                      ? "bg-[var(--color-accent-soft)]"
                      : ""
                  }
                >
                  <td className="px-3 py-2">{c.label}</td>
                  <td className="px-3 py-2">{c.printed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          What this page cannot tell you
        </h3>
        <p className="text-sm text-[var(--color-muted)]">
          The source itself says chemical amounts are rounded and that the
          manufacturer&rsquo;s label must always be followed — strengths vary
          (the guide notes calcium hypochlorite is sold from 47% to 78%). This
          page does not choose a target level for you, and it does not account
          for chlorine demand from algae or contaminants, which uses up chlorine
          as it is added. Re-test after circulation.
        </p>

        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Source: {DOSING_SOURCE_NAME}. Retrieved {data.retrievedAt}.
          </p>
          <p className="mt-1">
            <a
              href={DOSING_SOURCE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-accent)] underline"
            >
              Indiana Department of Health guide (PDF)
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function PoolShockTool() {
  const [volume, setVolume] = useState("15000");
  const [unit, setUnit] = useState<"gal" | "l">("gal");
  const [current, setCurrent] = useState("1");
  const [target, setTarget] = useState("10");
  const [product, setProduct] = useState("calhypo67");
  const [percent, setPercent] = useState("73");
  const [form, setForm] = useState<"solid" | "liquid">("solid");
  const [state, setState] = useState<State>({ phase: "idle" });

  const ids = {
    vol: useId(),
    cur: useId(),
    tgt: useId(),
    prod: useId(),
    pct: useId(),
    form: useId(),
  };
  const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

  function run(e: React.FormEvent) {
    e.preventDefault();
    try {
      const data = calculateShock({
        volume: num(volume),
        unit,
        currentFc: num(current),
        targetFc: num(target),
        product:
          product === "custom"
            ? { kind: "custom", percent: num(percent), form }
            : { kind: "listed", id: product },
      });
      setState({ phase: "result", data });
    } catch (err) {
      const e2 = asToolError(err);
      setState({ phase: "error", kind: e2.kind, message: e2.message });
    }
  }

  const field =
    "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";

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
                value={unit}
                onChange={(e) => setUnit(e.target.value as "gal" | "l")}
                className="rounded-md border border-[var(--color-line)] bg-white px-2"
              >
                <option value="gal">US gallons</option>
                <option value="l">litres</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor={ids.prod} className="mb-1.5 block font-medium">
              Product
            </label>
            <select
              id={ids.prod}
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              className={field}
            >
              {CHLORINE.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
              <option value="custom">Other — enter % from the label</option>
            </select>
          </div>
          <div>
            <label htmlFor={ids.cur} className="mb-1.5 block font-medium">
              Current free chlorine (ppm)
            </label>
            <input
              id={ids.cur}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className={field}
            />
          </div>
          <div>
            <label htmlFor={ids.tgt} className="mb-1.5 block font-medium">
              Target free chlorine (ppm)
            </label>
            <input
              id={ids.tgt}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className={field}
            />
            <p className="mt-1.5 text-xs text-[var(--color-muted)]">
              Use the level on your product label or from your pool
              professional.
            </p>
          </div>
          {product === "custom" && (
            <>
              <div>
                <label htmlFor={ids.pct} className="mb-1.5 block font-medium">
                  Available chlorine (%)
                </label>
                <input
                  id={ids.pct}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="100"
                  step="any"
                  value={percent}
                  onChange={(e) => setPercent(e.target.value)}
                  className={field}
                />
              </div>
              <div>
                <label htmlFor={ids.form} className="mb-1.5 block font-medium">
                  Product form
                </label>
                <select
                  id={ids.form}
                  value={form}
                  onChange={(e) =>
                    setForm(e.target.value as "solid" | "liquid")
                  }
                  className={field}
                >
                  <option value="solid">Granular / tablet (weighed)</option>
                  <option value="liquid">Liquid (measured by volume)</option>
                </select>
              </div>
            </>
          )}
        </div>

        <button
          type="submit"
          className="rounded-md bg-[var(--color-accent)] px-5 py-2.5 font-medium text-white"
        >
          Calculate the dose
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
