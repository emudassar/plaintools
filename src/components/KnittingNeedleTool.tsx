"use client";

import { useState, useId } from "react";
import { lookupNeedle, fmtMm, NEEDLES, US_SIZES, CYC_URL, CYC_NOTE, NEEDLE_RETRIEVED, type NeedleResult } from "@/lib/knitting-needle";
import { isToolError } from "@/lib/errors";

/** Recomputed as inputs change. No loading state. */

function Headline({ data }: { data: NeedleResult }) {
  const q = data.query;
  if (q.kind === "us") {
    return (
      <>
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">US size {q.value}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">= {data.matches.map((m) => fmtMm(m.mm)).join(" or ")}</p>
        {data.matches.length > 1 && (
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            The standard lists two millimetre sizes under US {q.value}. Check the mm size printed on the needle or the pattern.
          </p>
        )}
      </>
    );
  }
  if (data.matches.length) {
    const m = data.matches[0];
    return (
      <>
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">{fmtMm(m.mm)}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">{m.us ? `= US size ${m.us}` : "No US size listed"}</p>
        {!m.us && (
          <p className="mt-1 text-sm text-[var(--color-muted)]">The Craft Yarn Council chart lists {fmtMm(m.mm)} with no US number.</p>
        )}
      </>
    );
  }
  const { below, above } = data.nearest!;
  return (
    <>
      <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">{fmtMm(q.value)} is not a listed size</p>
      <p className="mt-1 text-lg font-semibold tracking-tight">
        Nearest listed: {below ? `${fmtMm(below.mm)}${below.us ? ` (US ${below.us})` : ""}` : "—"} and{" "}
        {above ? `${fmtMm(above.mm)}${above.us ? ` (US ${above.us})` : ""}` : "—"}
      </p>
    </>
  );
}

export default function KnittingNeedleTool() {
  const [mode, setMode] = useState<"mm" | "us">("mm");
  const [mm, setMm] = useState("4");
  const [us, setUs] = useState("8");
  const ids = { mode: useId(), mm: useId(), us: useId() };

  let data: NeedleResult | null = null;
  let error: string | null = null;
  try {
    data = lookupNeedle(mode === "mm" ? { kind: "mm", value: mm.trim() === "" ? NaN : Number(mm) } : { kind: "us", value: us });
  } catch (e) {
    error = isToolError(e) ? e.message : "That input could not be used.";
  }
  const hit = new Set(data?.matches.map((m) => m.mm) ?? []);
  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";

  return (
    <div>
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={ids.mode} className="mb-1.5 block font-medium">
            I have a size in
          </label>
          <select id={ids.mode} value={mode} onChange={(e) => setMode(e.target.value as "mm" | "us")} className={field}>
            <option value="mm">Millimetres (mm)</option>
            <option value="us">US needle number</option>
          </select>
        </div>
        {mode === "mm" ? (
          <div>
            <label htmlFor={ids.mm} className="mb-1.5 block font-medium">
              Needle size (mm)
            </label>
            <input id={ids.mm} type="number" inputMode="decimal" min="0" step="any" value={mm} onChange={(e) => setMm(e.target.value)} className={field} />
          </div>
        ) : (
          <div>
            <label htmlFor={ids.us} className="mb-1.5 block font-medium">
              US size
            </label>
            <select id={ids.us} value={us} onChange={(e) => setUs(e.target.value)} className={field}>
              {US_SIZES.map((u) => (
                <option key={u} value={u}>
                  US {u}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div aria-live="polite" className="rounded-lg border border-[var(--color-line)]">
        <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
          {error ? <p className="text-sm">{error}</p> : data && <Headline data={data} />}
        </div>
        <div className="p-5 text-sm">
          <h3 className="mb-2 font-semibold tracking-wide uppercase">Knitting needle size chart</h3>
          <div className="mb-5 overflow-x-auto rounded-md border border-[var(--color-line)]">
            <table className="w-full">
              <thead className="text-left text-[var(--color-muted)]">
                <tr>
                  <th className="px-3 py-1.5 font-medium">Metric (mm)</th>
                  <th className="px-3 py-1.5 font-medium">US size</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-line)]">
                {NEEDLES.map((n) => (
                  <tr key={n.mm} className={hit.has(n.mm) ? "bg-[var(--color-accent-soft)] font-semibold" : undefined}>
                    <td className="px-3 py-1.5">{fmtMm(n.mm)}</td>
                    <td className="px-3 py-1.5">{n.us ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3 className="mb-2 font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
          <p className="text-[var(--color-muted)]">
            UK and old imperial gauge numbers are not part of this standard and are not shown. The chart says which sizes correspond; it does
            not say what needle a pattern or yarn needs. The council&rsquo;s note: &ldquo;{CYC_NOTE}&rdquo;
          </p>
          <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
            <p>Source: Craft Yarn Council, &ldquo;Hooks &amp; Needles&rdquo; standard (knitting needle table). Retrieved {NEEDLE_RETRIEVED}.</p>
            <p className="mt-1">
              <a href={CYC_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
                Craft Yarn Council — hooks and needles
              </a>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
