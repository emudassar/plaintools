"use client";

import { useState, useId } from "react";
import { DOL_FS15_URL, splitTips, type SplitMethod, type TipPoolResult } from "@/lib/tip-pool";
import { isToolError } from "@/lib/errors";

/** Recomputed as inputs change. No loading state. */

interface RowState {
  key: number;
  name: string;
  hours: string;
  points: string;
}

const money = (cents: number) =>
  (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
const n = (x: number, d = 2) => x.toLocaleString("en-US", { maximumFractionDigits: d });

function ResultCard({ data }: { data: TipPoolResult }) {
  const basis =
    data.method === "hours" ? "hours worked" : data.method === "points" ? "hours × points" : "an equal share each";
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          {money(data.poolCents)} split by {basis}
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {data.shares.length <= 4
            ? data.shares.map((s) => `${s.name} ${money(s.cents)}`).join(" · ")
            : `${data.shares.length} shares, ${money(Math.min(...data.shares.map((s) => s.cents)))} to ${money(Math.max(...data.shares.map((s) => s.cents)))}`}
        </p>
        {data.method !== "equal" && data.totalHours > 0 && (
          <p className="mt-1 text-[var(--color-muted)]">
            {n(data.totalHours)} hours in total — {money(Math.round(data.poolCents / data.totalHours))} of tips per hour
            worked across the pool.
          </p>
        )}
      </div>
      <div className="p-5 text-sm">
        <div className="mb-5 overflow-x-auto">
          <table className="w-full">
            <thead className="text-left text-[var(--color-muted)]">
              <tr>
                <th className="py-1 pr-3 font-medium">Name</th>
                <th className="py-1 pr-3 font-medium">Hours</th>
                {data.method === "points" && <th className="py-1 pr-3 font-medium">Points</th>}
                <th className="py-1 pr-3 font-medium">Share of pool</th>
                <th className="py-1 pr-3 font-medium">Tips</th>
                <th className="py-1 font-medium">Per hour</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-line)]">
              {data.shares.map((s, i) => (
                <tr key={i}>
                  <td className="py-1.5 pr-3">{s.name}</td>
                  <td className="py-1.5 pr-3">{Number.isFinite(s.hours) ? n(s.hours) : "—"}</td>
                  {data.method === "points" && <td className="py-1.5 pr-3">{n(s.points)}</td>}
                  <td className="py-1.5 pr-3">{n(s.percent, 1)}%</td>
                  <td className="py-1.5 pr-3 font-medium">{money(s.cents)}</td>
                  <td className="py-1.5">{s.perHour === null ? "—" : money(Math.round(s.perHour * 100))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3 className="mb-2 font-semibold tracking-wide uppercase">The arithmetic</h3>
        <p className="mb-5 text-[var(--color-muted)]">
          Each share = pool × (that person&rsquo;s {data.method === "points" ? "hours × points" : data.method === "hours" ? "hours" : "1"} ÷{" "}
          {n(data.totalWeight)}). Shares are worked in whole cents; where a cent can&rsquo;t be split, it goes to the
          person whose exact share was closest to the next cent, so the shares add up to the pool exactly.
        </p>
        <h3 className="mb-2 font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
        <p className="text-[var(--color-muted)]">
          This divides the money; it does not decide who may be in the pool. The U.S. Department of Labor&rsquo;s Fact
          Sheet #15 says an employer may not receive tips from a tip pool and may not allow managers and supervisors to
          receive tips from it, and that where the employer takes a tip credit, a mandatory pool is limited to
          employees in occupations that customarily and regularly receive tips. State laws can add their own rules.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Split: proportional arithmetic in whole cents. Rules context: U.S. DOL Wage and Hour Division, Fact Sheet
            #15, Tipped Employees Under the FLSA. Retrieved {data.retrievedAt}.
          </p>
          <p className="mt-1">
            <a href={DOL_FS15_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              DOL Fact Sheet #15
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

let nextKey = 4;

export default function TipPoolTool() {
  const [pool, setPool] = useState("600");
  const [method, setMethod] = useState<SplitMethod>("hours");
  const [rows, setRows] = useState<RowState[]>([
    { key: 1, name: "Server 1", hours: "8", points: "1" },
    { key: 2, name: "Server 2", hours: "6", points: "1" },
    { key: 3, name: "Busser", hours: "4", points: "0.5" },
  ]);
  const ids = { pool: useId(), method: useId() };
  const num = (x: string) => (x.trim() === "" ? NaN : Number(x));

  let data: TipPoolResult | null = null;
  let error: string | null = null;
  try {
    data = splitTips(
      num(pool),
      rows.map((r) => ({ name: r.name, hours: num(r.hours), points: num(r.points) })),
      method,
    );
  } catch (e) {
    error = isToolError(e) ? e.message : "That input could not be used.";
  }

  const update = (key: number, patch: Partial<RowState>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2";

  return (
    <div>
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={ids.pool} className="mb-1.5 block font-medium">
            Total tips in the pool ($)
          </label>
          <input id={ids.pool} type="number" inputMode="decimal" min="0" step="any" value={pool} onChange={(e) => setPool(e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor={ids.method} className="mb-1.5 block font-medium">
            Split by
          </label>
          <select id={ids.method} value={method} onChange={(e) => setMethod(e.target.value as SplitMethod)} className={field}>
            <option value="hours">Hours worked</option>
            <option value="points">Hours × points (weighted by role)</option>
            <option value="equal">Equal shares</option>
          </select>
        </div>
      </div>

      <div className="mb-2 space-y-2">
        {rows.map((r, i) => (
          <div key={r.key} className="grid grid-cols-[1fr_5rem_5rem_auto] items-end gap-2">
            <div>
              {i === 0 && <span className="mb-1 block text-sm font-medium">Name</span>}
              <input aria-label={`Name ${i + 1}`} value={r.name} onChange={(e) => update(r.key, { name: e.target.value })} className={field} />
            </div>
            <div>
              {i === 0 && <span className="mb-1 block text-sm font-medium">Hours</span>}
              <input
                aria-label={`Hours ${i + 1}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={r.hours}
                disabled={method === "equal"}
                onChange={(e) => update(r.key, { hours: e.target.value })}
                className={`${field} disabled:opacity-50`}
              />
            </div>
            <div>
              {i === 0 && <span className="mb-1 block text-sm font-medium">Points</span>}
              <input
                aria-label={`Points ${i + 1}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={r.points}
                disabled={method !== "points"}
                onChange={(e) => update(r.key, { points: e.target.value })}
                className={`${field} disabled:opacity-50`}
              />
            </div>
            <button
              type="button"
              onClick={() => setRows((rs) => rs.filter((x) => x.key !== r.key))}
              disabled={rows.length === 1}
              aria-label={`Remove ${r.name || `person ${i + 1}`}`}
              className="rounded-md border border-[var(--color-line)] px-3 py-2 text-sm disabled:opacity-40"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setRows((rs) => [...rs, { key: nextKey++, name: `Person ${rs.length + 1}`, hours: "", points: "1" }])}
        className="mb-2 rounded-md border border-[var(--color-line)] px-4 py-2 text-sm font-medium"
      >
        + Add person
      </button>
      <p className="mb-6 text-xs text-[var(--color-muted)]">
        The split updates as you type. Names stay in your browser; nothing is sent anywhere or stored.
      </p>

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
