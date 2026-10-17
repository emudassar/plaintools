"use client";

import { useId, type ReactNode } from "react";
import { isToolError } from "@/lib/errors";

/**
 * Shared building blocks for the plain calculator tools: labelled inputs, the
 * error box and the result card. Same markup and tokens as the hand-built tools
 * (BaseboardTool etc.), so every calculator reads the same way.
 */

export const fieldClass = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";

/** "" -> NaN so the lib's validation catches an empty box. */
export const num = (v: string) => (v.trim() === "" ? NaN : Number(v));
/** "" -> null for optional inputs. */
export const optNum = (v: string) => (v.trim() === "" ? null : Number(v));

export const fmt = (x: number, d = 1) =>
  x.toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: 0 });
export const fmtFixed = (x: number, d = 1) =>
  x.toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d });
export const money = (x: number) => x.toLocaleString("en-US", { style: "currency", currency: "USD" });

export function NumField({
  label,
  value,
  onChange,
  step = "any",
  min = "0",
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  step?: string;
  min?: string;
  hint?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-medium">
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={min}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={fieldClass}
      />
      {hint && <p className="mt-1 text-xs text-[var(--color-muted)]">{hint}</p>}
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-medium">
        {label}
      </label>
      <input id={id} type="text" value={value} onChange={(e) => onChange(e.target.value)} className={fieldClass} />
      {hint && <p className="mt-1 text-xs text-[var(--color-muted)]">{hint}</p>}
    </div>
  );
}

export function DateField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-medium">
        {label}
      </label>
      <input id={id} type="date" value={value} onChange={(e) => onChange(e.target.value)} className={fieldClass} />
    </div>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: readonly (readonly [T, string])[];
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-medium">
        {label}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value as T)} className={fieldClass}>
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Grid({ cols = 3, children }: { cols?: 2 | 3 | 4; children: ReactNode }) {
  const c = cols === 2 ? "sm:grid-cols-2" : cols === 4 ? "sm:grid-cols-4" : "sm:grid-cols-3";
  return <div className={`mb-3 grid gap-3 ${c}`}>{children}</div>;
}

export function Hint({ children }: { children: ReactNode }) {
  return <p className="mb-6 text-xs text-[var(--color-muted)]">{children}</p>;
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-5">
      <p className="font-medium">That input could not be used</p>
      <p className="mt-1 text-sm text-[var(--color-muted)]">{message}</p>
    </div>
  );
}

export type Row = readonly [ReactNode, ReactNode];

export function RowsTable({ rows, head }: { rows: readonly Row[]; head?: readonly [string, string] }) {
  return (
    <div className="mb-5 overflow-x-auto rounded-md border border-[var(--color-line)]">
      <table className="w-full">
        {head && (
          <thead className="bg-[var(--color-accent-soft)] text-left">
            <tr>
              <th className="px-3 py-2 font-medium">{head[0]}</th>
              <th className="px-3 py-2 font-medium">{head[1]}</th>
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-[var(--color-line)]">
          {rows.map((r, i) => (
            <tr key={i}>
              <td className="px-3 py-2 font-medium">{r[0]}</td>
              <td className="px-3 py-2">{r[1]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DataTable({ head, rows, highlight }: { head: readonly string[]; rows: readonly (readonly ReactNode[])[]; highlight?: number }) {
  return (
    <div className="mb-5 overflow-x-auto rounded-md border border-[var(--color-line)]">
      <table className="w-full text-left">
        <thead className="bg-[var(--color-accent-soft)]">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-3 py-2 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-line)]">
          {rows.map((r, i) => (
            <tr key={i} className={i === highlight ? "bg-[var(--color-accent-soft)] font-semibold" : undefined}>
              {r.map((c, j) => (
                <td key={j} className="px-3 py-2">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Headline first, detail below, limits, then method + source on the card itself. */
export function ResultCard({
  label,
  headline,
  sub,
  rows,
  children,
  limits,
  method,
}: {
  label: string;
  headline: ReactNode;
  sub?: ReactNode;
  rows?: readonly Row[];
  children?: ReactNode;
  limits?: ReactNode;
  method: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">{label}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">{headline}</p>
        {sub && <p className="mt-1 text-[var(--color-muted)]">{sub}</p>}
      </div>
      <div className="p-5 text-sm">
        {rows && rows.length > 0 && <RowsTable rows={rows} />}
        {children}
        {limits && (
          <>
            <h3 className="mb-2 font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
            <p className="text-[var(--color-muted)]">{limits}</p>
          </>
        )}
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">{method}</footer>
      </div>
    </div>
  );
}

/** Run a lib call; return either its result or a visitor-safe error message. */
export function attempt<T>(fn: () => T): { data: T | null; error: string | null } {
  try {
    return { data: fn(), error: null };
  } catch (e) {
    return { data: null, error: isToolError(e) ? e.message : "That input could not be used." };
  }
}

export function Output<T>({ result, render }: { result: { data: T | null; error: string | null }; render: (d: T) => ReactNode }) {
  return <div aria-live="polite">{result.error ? <ErrorBox message={result.error} /> : result.data !== null && render(result.data)}</div>;
}
