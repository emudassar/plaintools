"use client";

import { useState } from "react";
import { calculateLumberCost, HB130_URL, NOMINAL_SIZES, type LumberResult, type PriceBasis } from "@/lib/lumber-cost";
import { isToolError } from "@/lib/errors";

/** Recomputed as inputs change. No loading state. */

const n = (x: number, d = 2) => x.toLocaleString("en-US", { maximumFractionDigits: d });
const usd = (x: number) => x.toLocaleString("en-US", { style: "currency", currency: "USD" });

interface Row {
  qty: string;
  size: string;
  t: string;
  w: string;
  len: string;
  price: string;
  basis: PriceBasis;
}

const BASES: { id: PriceBasis; label: string }[] = [
  { id: "piece", label: "per piece" },
  { id: "linear-ft", label: "per linear ft" },
  { id: "board-ft", label: "per board ft" },
  { id: "mbf", label: "per MBF (1,000 bf)" },
];

const newRow = (): Row => ({ qty: "10", size: "2x4", t: "2", w: "4", len: "8", price: "4.50", basis: "piece" });

function ResultCard({ data }: { data: LumberResult }) {
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          {data.pieces} pieces · {n(data.boardFeet)} board feet · {n(data.linearFeet)} linear ft
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">{usd(data.total)} total</p>
        <p className="mt-1 text-[var(--color-muted)]">
          Lumber {usd(data.subtotal)}
          {data.waste > 0 && ` + waste ${usd(data.waste)}`}
          {data.tax > 0 && ` + tax ${usd(data.tax)}`}. Works out to {usd(data.costPerBoardFoot)} per board foot before waste and tax.
        </p>
      </div>
      <div className="p-5 text-sm">
        <h3 className="mb-2 font-semibold tracking-wide uppercase">By line</h3>
        <table className="mb-5 w-full text-left">
          <thead className="text-[var(--color-muted)]">
            <tr>
              <th className="py-1 font-medium">Line</th>
              <th className="py-1 font-medium">Board ft each</th>
              <th className="py-1 font-medium">Board ft</th>
              <th className="py-1 font-medium">Cost</th>
            </tr>
          </thead>
          <tbody>
            {data.lines.map((l, i) => (
              <tr key={i} className="border-t border-[var(--color-line)]">
                <td className="py-1">
                  {i + 1} ({l.qty} pcs)
                </td>
                <td className="py-1">{n(l.boardFeetEach, 3)}</td>
                <td className="py-1">{n(l.boardFeet)}</td>
                <td className="py-1">{usd(l.cost)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3 className="mb-2 font-semibold tracking-wide uppercase">The arithmetic</h3>
        <p className="mb-5 text-[var(--color-muted)]">
          Board feet = thickness (in) × width (in) × length (ft) ÷ 12, because a board foot is 144 cubic inches. Price per
          MBF is divided by 1,000 and multiplied by board feet. Waste is added to the lumber cost, then tax to both.
        </p>
        <h3 className="mb-2 font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
        <p className="text-[var(--color-muted)]">
          Prices are whatever you enter — this page has no price data. Board feet follow the thickness and width you
          entered; yards usually describe lumber by nominal size, which is larger than the dressed size you take home.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Source: NIST Handbook 130 (2026), Method of Sale §2.12.1.1 (board foot) and Table 1 (softwood sizes). Retrieved{" "}
            {data.retrievedAt}.
          </p>
          <p className="mt-1">
            <a href={HB130_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              NIST Handbook 130
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function LumberCostTool() {
  const [rows, setRows] = useState<Row[]>([newRow(), { ...newRow(), qty: "4", size: "2x6", w: "6", len: "12", price: "1.10", basis: "linear-ft" }]);
  const [waste, setWaste] = useState("10");
  const [tax, setTax] = useState("");

  const num = (x: string) => (x.trim() === "" ? NaN : Number(x));
  const opt0 = (x: string) => (x.trim() === "" ? 0 : Number(x));
  const update = (i: number, patch: Partial<Row>) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  let data: LumberResult | null = null;
  let error: string | null = null;
  try {
    data = calculateLumberCost({
      lines: rows.map((r) => ({ qty: num(r.qty), thicknessIn: num(r.t), widthIn: num(r.w), lengthFt: num(r.len), price: num(r.price), basis: r.basis })),
      wastePct: opt0(waste),
      taxPct: opt0(tax),
    });
  } catch (e) {
    error = isToolError(e) ? e.message : "That input could not be used.";
  }

  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-2 py-2";
  const numIn = (v: string, set: (s: string) => void, label: string) => (
    <input aria-label={label} type="number" inputMode="decimal" min="0" step="any" value={v} onChange={(e) => set(e.target.value)} className={field} />
  );

  return (
    <div>
      <div className="mb-3 space-y-3">
        {rows.map((r, i) => (
          <fieldset key={i} className="rounded-md border border-[var(--color-line)] p-3">
            <legend className="px-1 text-sm font-medium">Line {i + 1}</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
              <label className="text-xs text-[var(--color-muted)]">
                Pieces
                {numIn(r.qty, (s) => update(i, { qty: s }), `Line ${i + 1} pieces`)}
              </label>
              <label className="text-xs text-[var(--color-muted)] sm:col-span-2">
                Size (nominal)
                <select
                  aria-label={`Line ${i + 1} size`}
                  value={r.size}
                  onChange={(e) => {
                    const s = NOMINAL_SIZES.find((x) => x.id === e.target.value);
                    update(i, s ? { size: s.id, t: String(s.t), w: String(s.w) } : { size: "custom" });
                  }}
                  className={field}
                >
                  {NOMINAL_SIZES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.t}×{s.w} (dry {s.dryLabel} in)
                    </option>
                  ))}
                  <option value="custom">Custom thickness × width</option>
                </select>
              </label>
              <label className="text-xs text-[var(--color-muted)]">
                Thick (in)
                {numIn(r.t, (s) => update(i, { t: s, size: "custom" }), `Line ${i + 1} thickness`)}
              </label>
              <label className="text-xs text-[var(--color-muted)]">
                Wide (in)
                {numIn(r.w, (s) => update(i, { w: s, size: "custom" }), `Line ${i + 1} width`)}
              </label>
              <label className="text-xs text-[var(--color-muted)]">
                Length (ft)
                {numIn(r.len, (s) => update(i, { len: s }), `Line ${i + 1} length`)}
              </label>
              <label className="text-xs text-[var(--color-muted)] sm:col-span-2">
                Price ($)
                {numIn(r.price, (s) => update(i, { price: s }), `Line ${i + 1} price`)}
              </label>
              <label className="text-xs text-[var(--color-muted)] sm:col-span-2">
                Priced
                <select aria-label={`Line ${i + 1} price basis`} value={r.basis} onChange={(e) => update(i, { basis: e.target.value as PriceBasis })} className={field}>
                  {BASES.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex items-end sm:col-span-2">
                {rows.length > 1 && (
                  <button type="button" onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))} className="text-sm text-[var(--color-accent)] underline">
                    Remove line
                  </button>
                )}
              </div>
            </div>
          </fieldset>
        ))}
        <button
          type="button"
          onClick={() => setRows((rs) => [...rs, newRow()])}
          className="rounded-md border border-[var(--color-line)] px-3 py-2 text-sm font-medium"
        >
          + Add line
        </button>
        <div className="grid grid-cols-2 gap-3 sm:max-w-md">
          <label className="text-sm font-medium">
            Waste allowance (%)
            {numIn(waste, setWaste, "Waste allowance percent")}
          </label>
          <label className="text-sm font-medium">
            Sales tax (%) <span className="font-normal text-[var(--color-muted)]">optional</span>
            {numIn(tax, setTax, "Sales tax percent")}
          </label>
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
