"use client";

import { useId } from "react";
import { MONTH_NAMES } from "@/lib/month";

/**
 * A month select plus a four-digit year box, for sources that date things by
 * month and year only (cylinder stamps, test labels). The year is a text box,
 * not type="number", so the browser never blocks submission before the tool's
 * own validation can explain what is wrong.
 */
export default function MonthYearFields({
  label,
  month,
  year,
  onMonth,
  onYear,
  hint,
}: {
  label: string;
  month: string;
  year: string;
  onMonth: (v: string) => void;
  onYear: (v: string) => void;
  hint: string;
}) {
  const monthId = useId();
  const yearId = useId();
  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";
  return (
    <fieldset className="mb-4">
      <legend className="mb-1.5 font-medium">{label}</legend>
      <div className="grid grid-cols-2 gap-3 sm:max-w-md">
        <div>
          <label htmlFor={monthId} className="mb-1 block text-xs text-[var(--color-muted)]">Month</label>
          <select id={monthId} value={month} onChange={(e) => onMonth(e.target.value)} className={field}>
            <option value="">Pick a month</option>
            {MONTH_NAMES.map((m, i) => (
              <option key={m} value={String(i + 1)}>
                {String(i + 1).padStart(2, "0")}: {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={yearId} className="mb-1 block text-xs text-[var(--color-muted)]">Year (4 digits)</label>
          <input
            id={yearId}
            type="text"
            inputMode="numeric"
            placeholder="e.g. 2019"
            value={year}
            onChange={(e) => onYear(e.target.value)}
            className={field}
          />
        </div>
      </div>
      <p className="mt-1.5 text-xs text-[var(--color-muted)]">{hint}</p>
    </fieldset>
  );
}
