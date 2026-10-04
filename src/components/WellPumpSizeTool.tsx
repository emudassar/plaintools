"use client";

import { useState, useId } from "react";
import {
  QUOTES,
  sizeWellPump,
  TABLE_1,
  WSC_URL,
  type WellPumpResult,
} from "@/lib/well-pump-size";
import { asToolError, type ErrorKind } from "@/lib/errors";

/** idle / error / result. Arithmetic in the browser — no loading state. */

type State =
  | { phase: "idle" }
  | { phase: "error"; kind: ErrorKind; message: string }
  | { phase: "result"; data: WellPumpResult };

const n = (x: number, d = 1) =>
  x.toLocaleString("en-US", { maximumFractionDigits: d });

function ResultCard({ data }: { data: WellPumpResult }) {
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          Pump capacity by the two published methods
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {data.table
            ? `${data.table.minGpm} gpm (peak-demand table)`
            : "Outside the peak-demand table"}{" "}
          · {data.fixtureCount} gpm (fixture count)
        </p>
        <p className="mt-1 text-[var(--color-muted)]">
          For {n(data.bathrooms)}{" "}
          {data.bathrooms === 1 ? "bathroom" : "bathrooms"} and{" "}
          {data.fixtureCount} fixtures. The source says the two methods
          &ldquo;give similar results&rdquo;.
        </p>
      </div>

      <div className="p-5">
        {data.wellYieldGpm !== null &&
          (data.tableExceedsYield || data.fixturesExceedYield) && (
            <div className="mb-5 rounded-md border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-4 text-sm">
              <strong className="font-medium">
                {data.tableExceedsYield && data.fixturesExceedYield
                  ? "Both figures are"
                  : "A figure is"}{" "}
                more than the well&rsquo;s {n(data.wellYieldGpm)} gpm yield.
              </strong>{" "}
              The source: &ldquo;{QUOTES.neverExceed}&rdquo; and &ldquo;
              {QUOTES.lowYield}&rdquo; Over a 7-minute peak the well supplies
              about {n(data.wellSevenMinuteGallons ?? 0, 0)} gallons
              {data.table
                ? `, against the table's ${data.table.peakGallons}-gallon peak demand for this home`
                : ""}
              .
            </div>
          )}
        {data.wellYieldGpm !== null &&
          !data.tableExceedsYield &&
          !data.fixturesExceedYield && (
            <div className="mb-5 rounded-md border border-[var(--color-line)] p-4 text-sm text-[var(--color-muted)]">
              Both figures are within the well&rsquo;s {n(data.wellYieldGpm)}{" "}
              gpm yield. The source&rsquo;s rule: &ldquo;{QUOTES.neverExceed}
              &rdquo;
            </div>
          )}

        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          Method 1 — fixture count
        </h3>
        <div className="mb-5 overflow-x-auto rounded-md border border-[var(--color-line)]">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-[var(--color-line)]">
              {data.fixtureBreakdown.map((b) => (
                <tr key={b.label}>
                  <td className="px-3 py-1.5">{b.label}</td>
                  <td className="px-3 py-1.5 text-right">{b.count}</td>
                </tr>
              ))}
              <tr className="bg-[var(--color-accent-soft)] font-medium">
                <td className="px-3 py-1.5">Fixtures = gallons per minute</td>
                <td className="px-3 py-1.5 text-right">{data.fixtureCount}</td>
              </tr>
            </tbody>
          </table>
          <p className="border-t border-[var(--color-line)] p-2 text-xs text-[var(--color-muted)]">
            Full baths are counted as three outlets, as in the source&rsquo;s
            example. Half baths are counted as two (sink and toilet) — this
            page&rsquo;s assumption.
          </p>
        </div>

        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          Method 2 — seven-minute peak demand (Table 1)
        </h3>
        <div className="mb-5 overflow-x-auto rounded-md border border-[var(--color-line)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-accent-soft)] text-left">
              <tr>
                <th className="px-3 py-2 font-medium">Bathrooms</th>
                <th className="px-3 py-2 font-medium">7-minute peak demand</th>
                <th className="px-3 py-2 font-medium">Minimum pump</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-line)]">
              {TABLE_1.map((c) => (
                <tr
                  key={c.label}
                  className={
                    data.table?.label === c.label
                      ? "bg-[var(--color-accent-soft)] font-medium"
                      : ""
                  }
                >
                  <td className="px-3 py-1.5">{c.label}</td>
                  <td className="px-3 py-1.5">{c.peakGallons} gal</td>
                  <td className="px-3 py-1.5">
                    {c.minGpm} gpm ({c.minGpm * 60} gph)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data.table && (
            <p className="border-t border-[var(--color-line)] p-2 text-xs text-[var(--color-muted)]">
              The table stops at 4 bathrooms, so only the fixture-count method
              applies to this home.
            </p>
          )}
        </div>

        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          What this page cannot tell you
        </h3>
        <p className="text-sm text-[var(--color-muted)]">
          This is the flow side only. Choosing a pump also needs the pressure it
          must deliver — depth to water, lift to the highest fixture, pipe
          friction — which the source leaves to a well professional. It notes:
          &ldquo;{QUOTES.pressure}&rdquo; The table&rsquo;s values are averages
          and, in the source&rsquo;s words, &ldquo;do not include higher or
          lower extremes.&rdquo;
        </p>

        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Source: Water Systems Council, wellcare information sheet
            &ldquo;Sizing a Well Pump&rdquo;. Retrieved {data.retrievedAt}.
          </p>
          <p className="mt-1">
            <a
              href={WSC_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-accent)] underline"
            >
              Water Systems Council: Sizing a Well Pump (PDF)
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function WellPumpSizeTool() {
  const [v, setV] = useState({
    fullBaths: "2",
    halfBaths: "0",
    kitchenSink: "1",
    dishwasher: "1",
    washer: "1",
    laundryTub: "1",
    hoseBibs: "2",
    other: "0",
    yield: "",
  });
  const [state, setState] = useState<State>({ phase: "idle" });
  const baseId = useId();
  const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

  const fields: { key: keyof typeof v; label: string }[] = [
    { key: "fullBaths", label: "Full bathrooms" },
    { key: "halfBaths", label: "Half bathrooms" },
    { key: "kitchenSink", label: "Kitchen sinks" },
    { key: "dishwasher", label: "Dishwashers" },
    { key: "washer", label: "Washing machines" },
    { key: "laundryTub", label: "Laundry tubs" },
    { key: "hoseBibs", label: "Outside hose outlets" },
    { key: "other", label: "Other fixtures (irrigation, pool, hot tub)" },
  ];

  function run(e: React.FormEvent) {
    e.preventDefault();
    try {
      setState({
        phase: "result",
        data: sizeWellPump({
          fullBaths: num(v.fullBaths),
          halfBaths: num(v.halfBaths),
          kitchenSink: num(v.kitchenSink),
          dishwasher: num(v.dishwasher),
          washer: num(v.washer),
          laundryTub: num(v.laundryTub),
          hoseBibs: num(v.hoseBibs),
          other: num(v.other),
          wellYieldGpm: v.yield.trim() === "" ? null : num(v.yield),
        }),
      });
    } catch (err) {
      const e2 = asToolError(err);
      setState({ phase: "error", kind: e2.kind, message: e2.message });
    }
  }

  const field =
    "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2";

  return (
    <div>
      <form onSubmit={run} className="mb-6">
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label
                htmlFor={`${baseId}-${f.key}`}
                className="mb-1 block text-sm font-medium"
              >
                {f.label}
              </label>
              <input
                id={`${baseId}-${f.key}`}
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={v[f.key]}
                onChange={(e) => setV({ ...v, [f.key]: e.target.value })}
                className={field}
              />
            </div>
          ))}
          <div className="col-span-2">
            <label
              htmlFor={`${baseId}-yield`}
              className="mb-1 block text-sm font-medium"
            >
              Well yield, gpm (optional)
            </label>
            <input
              id={`${baseId}-yield`}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={v.yield}
              onChange={(e) => setV({ ...v, yield: e.target.value })}
              className={field}
            />
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              From the well log or a yield test, if you have one.
            </p>
          </div>
        </div>
        <button
          type="submit"
          className="rounded-md bg-[var(--color-accent)] px-5 py-2.5 font-medium text-white"
        >
          Calculate pump size
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
