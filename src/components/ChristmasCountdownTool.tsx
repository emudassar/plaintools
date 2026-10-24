"use client";

import { useEffect, useState } from "react";
import { DataTable, ResultCard } from "./CalcBits";
import { Ext } from "./GeoBits";
import { useMounted } from "./ToolBits";
import { EASTER_URL, HOLIDAYS, OPM_HOLIDAYS_URL, fmtUtcDate, nextOccurrence, splitMs, utcDate } from "@/lib/date-calc";

/** Countdown to December 25 in the visitor's own time zone, plus the next date of every other listed holiday. */
export default function ChristmasCountdownTool() {
  const mounted = useMounted();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!mounted) return <p className="text-sm text-[var(--color-muted)]">Reading your device clock…</p>;

  const d = new Date(now);
  const today = utcDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
  const xmas = nextOccurrence(HOLIDAYS[0], today);
  const target = new Date(xmas.date.getUTCFullYear(), 11, 25).getTime();
  const left = splitMs(target - now);
  const isToday = xmas.days === 0;
  const sleeps = xmas.days;
  const rows = HOLIDAYS.map((h) => ({ h, ...nextOccurrence(h, today) })).sort((a, b) => a.days - b.days);

  return (
    <div>
      <div aria-live="polite">
        <ResultCard
          label={`Christmas Day ${xmas.date.getUTCFullYear()}`}
          headline={isToday ? "It's Christmas Day today" : `${xmas.days} day${xmas.days === 1 ? "" : "s"} until Christmas`}
          sub={
            isToday
              ? "The countdown restarts tomorrow for next year."
              : `${left.days} d ${left.hours} h ${String(left.minutes).padStart(2, "0")} min ${String(left.seconds).padStart(2, "0")} s to midnight on December 25 · ${sleeps} sleep${sleeps === 1 ? "" : "s"} · ${Math.floor(xmas.days / 7)} weeks and ${xmas.days % 7} days`
          }
          rows={[
            ["Christmas falls on", fmtUtcDate(xmas.date)],
            ["Today", fmtUtcDate(today)],
            ["Christmas Eve", `${Math.max(0, xmas.days - 1)} days away`],
          ]}
          method={
            <p>
              Days are whole calendar days from today&apos;s date on this device to December 25; the clock counts to midnight in your time zone. Holiday rules: federal holidays per 5 U.S.C. 6103 as listed by{" "}
              <Ext href={OPM_HOLIDAYS_URL}>OPM</Ext>; Easter by the Gregorian computus (<Ext href={EASTER_URL}>Date of Easter</Ext>). Retrieved 2026-10-24.
            </p>
          }
        >
          <h3 className="mb-2 font-semibold tracking-wide uppercase">Days until other holidays</h3>
          <DataTable
            head={["Holiday", "Next date", "Days away", "Rule"]}
            rows={rows.map((r) => [r.h.name + (r.h.kind === "federal" ? " *" : ""), fmtUtcDate(r.date), r.days === 0 ? "Today" : r.days.toLocaleString("en-US"), r.h.rule])}
          />
          <p className="mb-5 text-xs text-[var(--color-muted)]">* Federal legal public holiday. When one falls on a weekend, federal employees get the nearest weekday off (OPM); the table shows the actual date.</p>
        </ResultCard>
      </div>
    </div>
  );
}
