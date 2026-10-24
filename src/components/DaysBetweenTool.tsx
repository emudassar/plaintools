"use client";

import { useEffect, useState } from "react";
import { DateField, Grid, Hint, ResultCard, Output, attempt } from "./CalcBits";
import { daysBetween, fmtUtcDate } from "@/lib/date-calc";

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function DaysBetweenTool() {
  const [start, setStart] = useState("2026-01-01");
  const [end, setEnd] = useState("2026-12-31");
  const [incl, setIncl] = useState(false);

  // Default the start to today once mounted, so the static HTML never disagrees with the visitor's date.
  useEffect(() => setStart(today()), []);

  const result = attempt(() => daysBetween(start, end, incl));
  const s = (n: number, w: string) => `${n.toLocaleString("en-US")} ${w}${n === 1 ? "" : "s"}`;

  return (
    <div>
      <Grid cols={2}>
        <DateField label="Start date" value={start} onChange={setStart} />
        <DateField label="End date" value={end} onChange={setEnd} />
      </Grid>
      <label className="mb-2 flex items-center gap-2">
        <input type="checkbox" checked={incl} onChange={(e) => setIncl(e.target.checked)} />
        <span>Include the end date (count both the first and the last day)</span>
      </label>
      <Hint>The result updates as you change the dates. Dates before 1900 or after 2200 are not accepted.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label={`Days from ${fmtUtcDate(d.start, false)} to ${fmtUtcDate(d.end, false)}${incl ? ", end date included" : ""}`}
            headline={s(d.days, "day")}
            sub={`${s(d.weeks, "week")} and ${s(d.remDays, "day")} · ${d.ymd.years ? s(d.ymd.years, "year") + ", " : ""}${s(d.ymd.months, "month")} and ${s(d.ymd.days, "day")}`}
            rows={[
              ["Weekdays (Mon–Fri)", s(d.weekdays, "day")],
              ["Weekend days", s(d.weekendDays, "day")],
              ["Hours", d.hours.toLocaleString("en-US")],
              ["Start", fmtUtcDate(d.start)],
              ["End", fmtUtcDate(d.end)],
              ...(d.swapped ? ([["Note", "The end date was before the start date, so the two were swapped."]] as const) : []),
            ]}
            limits="Weekday counts do not remove public holidays, which differ by country, state and employer. Business-day deadlines set by a law or contract follow that rule's own counting method, which this page does not know."
            method={<p>Method: whole calendar days in the Gregorian calendar, leap years included; years-months-days counts whole months first (Jan 31 + 1 month = Feb 28), then the days left. Calculated in your browser.</p>}
          />
        )}
      />
    </div>
  );
}
