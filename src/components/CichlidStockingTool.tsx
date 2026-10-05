"use client";

import { useState, useId } from "react";
import { calculateCichlidStocking, FISHBASE_URL, PFK_URL, SPECIES, type CichlidResult } from "@/lib/cichlid-stocking";
import { isToolError } from "@/lib/errors";

/** Recomputed as inputs change. No loading state. */

const n = (x: number, d = 1) => x.toLocaleString("en-US", { maximumFractionDigits: d });

interface Row {
  speciesId: string;
  count: string;
  customCm: string;
  customName: string;
}

function ResultCard({ data }: { data: CichlidResult }) {
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          {data.fish} fish · {n(data.usedCm)} cm of adult fish in {n(data.litres, 0)} litres
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">{n(data.percent, 0)}% of the guideline</p>
        <p className="mt-1 text-[var(--color-muted)]">
          Practical Fishkeeping&rsquo;s tropical guideline of 2.5 cm of fish per 4.55 litres allows {n(data.budgetCm)} cm in this tank
          {data.percent > 100 ? `; this list is ${n(data.usedCm - data.budgetCm)} cm over it.` : `; this list leaves ${n(data.budgetCm - data.usedCm)} cm.`}
        </p>
      </div>
      <div className="p-5 text-sm">
        {(
          <div className="mb-4 rounded-md border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-3 text-[var(--color-muted)]">
            {data.origins.length > 1 && <p>The list mixes cichlids from {data.origins.join(", ")}. </p>}
            <p>
              A length guideline does not account for territory or aggression; Practical Fishkeeping notes that territorial fish such as
              cichlids fight when territories overlap. The largest fish listed reaches {n(data.largestCm)} cm.
            </p>
          </div>
        )}
        <table className="mb-5 w-full text-left">
          <thead className="text-[var(--color-muted)]">
            <tr>
              <th className="py-1 font-medium">Fish</th>
              <th className="py-1 font-medium">Adult size</th>
              <th className="py-1 font-medium">Count</th>
              <th className="py-1 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.lines.map((l, i) => (
              <tr key={i} className="border-t border-[var(--color-line)]">
                <td className="py-1 pr-2">
                  {l.scientific ? (
                    <a href={FISHBASE_URL(l.scientific)} target="_blank" rel="noopener noreferrer" className="underline">
                      {l.name}
                    </a>
                  ) : (
                    l.name
                  )}
                </td>
                <td className="py-1">
                  {n(l.eachCm)} cm {l.measure !== "custom" && l.measure}
                </td>
                <td className="py-1">{l.count}</td>
                <td className="py-1">{n(l.totalCm)} cm</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3 className="mb-2 font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
        <p className="text-[var(--color-muted)]">
          Whether these fish will live together. Cichlid stocking depends on temperament, territory, sex ratio, rockwork and
          filtration, none of which a length budget measures. FishBase lengths are maximums recorded for the species, given as standard
          length (SL, without tail) or total length (TL); aquarium fish are often smaller.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>Guideline: Practical Fishkeeping, stocking density FAQ. Adult sizes: FishBase species summaries. Retrieved {data.retrievedAt}.</p>
          <p className="mt-1">
            <a href={PFK_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              Practical Fishkeeping
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function CichlidStockingTool() {
  const [vol, setVol] = useState("55");
  const [vUnit, setVUnit] = useState<"gal" | "L">("gal");
  const [rows, setRows] = useState<Row[]>([
    { speciesId: "electric-yellow", count: "6", customCm: "", customName: "" },
    { speciesId: "demasoni", count: "6", customCm: "", customName: "" },
  ]);
  const ids = { v: useId(), u: useId() };
  const update = (i: number, p: Partial<Row>) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...p } : r)));

  let data: CichlidResult | null = null;
  let error: string | null = null;
  try {
    data = calculateCichlidStocking({
      volume: vol.trim() === "" ? NaN : Number(vol),
      volumeUnit: vUnit,
      lines: rows.map((r) => ({
        speciesId: r.speciesId,
        count: r.count.trim() === "" ? 0 : Number(r.count),
        customCm: r.customCm.trim() === "" ? undefined : Number(r.customCm),
        customName: r.customName,
      })),
    });
  } catch (e) {
    error = isToolError(e) ? e.message : "That input could not be used.";
  }
  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";
  const origins = [...new Set(SPECIES.map((s) => s.origin))];

  return (
    <div>
      <div className="mb-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={ids.v} className="mb-1.5 block font-medium">
            Tank water volume
          </label>
          <input id={ids.v} type="number" inputMode="decimal" min="0" step="any" value={vol} onChange={(e) => setVol(e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor={ids.u} className="mb-1.5 block font-medium">
            Unit
          </label>
          <select id={ids.u} value={vUnit} onChange={(e) => setVUnit(e.target.value as "gal" | "L")} className={field}>
            <option value="gal">US gallons</option>
            <option value="L">litres</option>
          </select>
        </div>
      </div>
      <div className="mb-3 space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-[1fr_5rem] gap-2 sm:grid-cols-[1fr_6rem_auto]">
            <select aria-label={`Fish ${i + 1} species`} value={r.speciesId} onChange={(e) => update(i, { speciesId: e.target.value })} className={field}>
              {origins.map((o) => (
                <optgroup key={o} label={o}>
                  {SPECIES.filter((s) => s.origin === o).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.common} — {s.maxCm} cm {s.measure}
                    </option>
                  ))}
                </optgroup>
              ))}
              <option value="custom">Other fish (enter its adult length)</option>
            </select>
            <input
              aria-label={`Fish ${i + 1} count`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={r.count}
              onChange={(e) => update(i, { count: e.target.value })}
              className={field}
            />
            {rows.length > 1 && (
              <button type="button" onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))} className="text-sm text-[var(--color-accent)] underline">
                Remove
              </button>
            )}
            {r.speciesId === "custom" && (
              <div className="col-span-full grid grid-cols-2 gap-2">
                <input aria-label={`Fish ${i + 1} name`} type="text" placeholder="Name" value={r.customName} onChange={(e) => update(i, { customName: e.target.value })} className={field} />
                <input
                  aria-label={`Fish ${i + 1} adult length in cm`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  placeholder="Adult length, cm"
                  value={r.customCm}
                  onChange={(e) => update(i, { customCm: e.target.value })}
                  className={field}
                />
              </div>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => setRows((rs) => [...rs, { speciesId: "kenyi", count: "1", customCm: "", customName: "" }])}
          className="rounded-md border border-[var(--color-line)] px-3 py-2 text-sm font-medium"
        >
          + Add fish
        </button>
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
