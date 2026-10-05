"use client";

import { useState, useId } from "react";
import {
  calculateCoil,
  COIL_PRODUCT_URL,
  COIL_YIELDS_URL,
  FULL_COIL_LB,
  MATERIALS,
  WIDTHS,
  YIELDS,
  type CoilResult,
  type MaterialId,
  type WidthId,
} from "@/lib/gutter-coil";
import { isToolError } from "@/lib/errors";

/** Recomputed as inputs change. No loading state. */

const n = (x: number, d = 1) => x.toLocaleString("en-US", { maximumFractionDigits: d });

function ResultCard({ data, widthLabel, materialLabel }: { data: CoilResult; widthLabel: string; materialLabel: string }) {
  const feetFirst = data.mode === "pounds";
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          {widthLabel} {materialLabel} coil
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {feetFirst ? `${n(data.feet, 1)} feet of coil` : `${n(data.pounds, 1)} lb of coil`}
        </p>
        <p className="mt-1 text-[var(--color-muted)]">
          {feetFirst
            ? `${n(data.pounds, 1)} lb × ${data.ftPerLb} ft per lb.`
            : `${n(data.feet, 1)} ft × ${data.lbPerFt} lb per ft.`}{" "}
          Equal to {n(data.fullCoils, 2)} full coils at Gutter Supply&rsquo;s approximate {FULL_COIL_LB} lb per full coil.
        </p>
      </div>
      <div className="p-5 text-sm">
        <p className="mb-4 text-[var(--color-muted)]">
          The sheet&rsquo;s two factors for this coil: {data.lbPerFt} lb per foot and {data.ftPerLb} feet per pound.
          {data.printedMismatch &&
            ` For this row they do not quite agree (1 ÷ ${data.lbPerFt} = ${(1 / data.lbPerFt).toFixed(2)} ft per lb, not ${data.ftPerLb}); the result uses the factor the sheet prints for the direction you chose.`}
        </p>
        <h3 className="mb-2 font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
        <p className="text-[var(--color-muted)]">
          These are one supplier&rsquo;s published approximate yields. Actual weight per foot varies with the
          maker&rsquo;s exact thickness, paint and alloy, and the weight printed on a coil may include its core.
          The footage is coil length — how much finished gutter it makes after end caps, miters and trim waste
          depends on the job.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Source: Gutter Supply, &ldquo;Coil Yields&rdquo; spec sheet; full-coil weight from its aluminum gutter
            coil product page. Retrieved {data.retrievedAt}.
          </p>
          <p className="mt-1 space-x-3">
            <a href={COIL_YIELDS_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              Coil Yields (PDF)
            </a>
            <a href={COIL_PRODUCT_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              Aluminum gutter coil product page
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function GutterCoilTool() {
  const [width, setWidth] = useState<WidthId>("11.875");
  const [material, setMaterial] = useState<MaterialId>("al027");
  const [mode, setMode] = useState<"feet" | "pounds">("pounds");
  const [value, setValue] = useState(String(FULL_COIL_LB));
  const ids = { w: useId(), m: useId(), mode: useId(), v: useId() };

  let data: CoilResult | null = null;
  let error: string | null = null;
  try {
    data = calculateCoil({ width, material, mode, value: value.trim() === "" ? NaN : Number(value) });
  } catch (e) {
    error = isToolError(e) ? e.message : "That input could not be used.";
  }
  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";

  return (
    <div>
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={ids.w} className="mb-1.5 block font-medium">
            Coil width
          </label>
          <select id={ids.w} value={width} onChange={(e) => setWidth(e.target.value as WidthId)} className={field}>
            {WIDTHS.map((w) => (
              <option key={w.id} value={w.id}>
                {w.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={ids.m} className="mb-1.5 block font-medium">
            Material
          </label>
          <select id={ids.m} value={material} onChange={(e) => setMaterial(e.target.value as MaterialId)} className={field}>
            {MATERIALS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={ids.mode} className="mb-1.5 block font-medium">
            I know the
          </label>
          <select
            id={ids.mode}
            value={mode}
            onChange={(e) => {
              const m = e.target.value as "feet" | "pounds";
              setMode(m);
              setValue(m === "pounds" ? String(FULL_COIL_LB) : "150");
            }}
            className={field}
          >
            <option value="pounds">Coil weight in pounds → feet</option>
            <option value="feet">Feet of gutter → pounds of coil</option>
          </select>
        </div>
        <div>
          <label htmlFor={ids.v} className="mb-1.5 block font-medium">
            {mode === "pounds" ? "Pounds of coil" : "Feet of gutter"}
          </label>
          <input id={ids.v} type="number" inputMode="decimal" min="0" step="any" value={value} onChange={(e) => setValue(e.target.value)} className={field} />
        </div>
      </div>
      <p className="-mt-3 mb-6 text-xs text-[var(--color-muted)]">The answer updates as you type. Nothing is sent anywhere.</p>

      <div aria-live="polite">
        {error ? (
          <div className="rounded-lg border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-5">
            <p className="font-medium">That input could not be used</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{error}</p>
          </div>
        ) : (
          data && (
            <ResultCard
              data={data}
              widthLabel={WIDTHS.find((w) => w.id === width)?.label ?? ""}
              materialLabel={MATERIALS.find((m) => m.id === material)?.label ?? ""}
            />
          )
        )}
      </div>

      <h3 className="mt-6 mb-2 text-sm font-semibold tracking-wide uppercase">Full coil yield chart</h3>
      <div className="overflow-x-auto rounded-md border border-[var(--color-line)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-accent-soft)] text-left">
            <tr>
              <th className="px-3 py-2 font-medium">Material</th>
              {WIDTHS.filter((w) => w.id !== "11.75").map((w) => (
                <th key={w.id} className="px-3 py-2 font-medium">
                  {w.id === "11.875" ? '11-3/4" & 11-7/8"' : w.label}: lb/ft · ft/lb
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-line)]">
            {MATERIALS.map((m) => (
              <tr key={m.id} className={m.id === material ? "bg-[var(--color-accent-soft)] font-medium" : ""}>
                <td className="px-3 py-1.5">{m.label}</td>
                <td className="px-3 py-1.5">
                  {YIELDS["11.875"][m.id][0]} · {YIELDS["11.875"][m.id][1]}
                </td>
                <td className="px-3 py-1.5">
                  {YIELDS["15"][m.id][0]} · {YIELDS["15"][m.id][1]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
