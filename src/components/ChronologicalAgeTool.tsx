"use client";

import { useEffect, useState } from "react";
import { DateField, Grid, Hint, ResultCard, Output, attempt } from "./CalcBits";
import { chronologicalAge, fmtUtcDate } from "@/lib/date-calc";

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default function ChronologicalAgeTool() {
  const [birth, setBirth] = useState("2015-06-15");
  const [on, setOn] = useState("2026-10-24");
  useEffect(() => setOn(iso(new Date())), []);

  const result = attempt(() => chronologicalAge(birth, on));
  const pl = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;

  return (
    <div>
      <Grid cols={2}>
        <DateField label="Date of birth" value={birth} onChange={setBirth} />
        <DateField label="Age on (test date or today)" value={on} onChange={setOn} />
      </Grid>
      <Hint>The second date starts at today; change it to a test or assessment date to get age on that day.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label={`Chronological age on ${fmtUtcDate(d.on, false)}`}
            headline={`${pl(d.ymd.years, "year")}, ${pl(d.ymd.months, "month")}, ${pl(d.ymd.days, "day")}`}
            sub={`Written ${d.ymd.years};${d.ymd.months};${d.ymd.days} (years;months;days) · ${d.decimalYears} years`}
            rows={[
              ["Total months", d.totalMonths.toLocaleString("en-US") + ` and ${pl(d.ymd.days, "day")}`],
              ["Total weeks", d.totalWeeks.toLocaleString("en-US") + ` and ${pl(d.totalDays % 7, "day")}`],
              ["Total days", d.totalDays.toLocaleString("en-US")],
              ["Born on a", d.birthWeekday],
              ["Next birthday", `${fmtUtcDate(d.nextBirthday)} — ${pl(d.daysToNextBirthday, "day")} away`],
            ]}
            limits="Some test manuals give their own rule for borrowing days and months (for example, counting every month as 30 days) and for rounding the days. When scoring a standardised test, follow the manual's rule if it differs. A birthday on 29 February falls on 28 February in common years here."
            method={<p>Method: the most whole months from the birth date that do not pass the second date (a month added to the 31st lands on the last day of a shorter month), shown as years and months, then the days left. Gregorian calendar, calculated in your browser.</p>}
          />
        )}
      />
    </div>
  );
}
