"use client";

import { useState } from "react";
import { Grid, Hint, NumField, ResultCard, Output, SelectField, attempt, money, num, fmt } from "./CalcBits";
import { Ext } from "./GeoBits";
import { OPM_2087_URL, payFrom } from "@/lib/pay-tax";

type Per = "hour" | "week" | "month" | "year";

export default function HourlySalaryTool() {
  const [amount, setAmount] = useState("25");
  const [per, setPer] = useState<Per>("hour");
  const [hours, setHours] = useState("40");
  const [weeks, setWeeks] = useState("52");
  const result = attempt(() => payFrom(num(amount), per, num(hours), num(weeks)));

  return (
    <div>
      <Grid cols={4}>
        <NumField label="Pay ($)" value={amount} onChange={setAmount} />
        <SelectField label="Per" value={per} onChange={setPer} options={[["hour", "Hour"], ["week", "Week"], ["month", "Month"], ["year", "Year (salary)"]]} />
        <NumField label="Hours per week" value={hours} onChange={setHours} />
        <NumField label="Paid weeks per year" value={weeks} onChange={setWeeks} hint="52 = paid all year, including paid vacation." />
      </Grid>
      <Hint>Enter an hourly rate to get the salary, or a salary to get the hourly rate.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label={per === "hour" ? `${money(num(amount))} an hour is` : `${money(num(amount))} a ${per} is`}
            headline={per === "hour" ? `${money(d.annual)} a year` : `${money(d.hourly)} an hour`}
            sub={`${fmt(d.hoursPerYear, 0)} paid hours a year (${hours} h × ${weeks} weeks)`}
            rows={[
              ["Hourly", money(d.hourly)],
              ["Daily (5-day week)", money(d.daily)],
              ["Weekly", money(d.weekly)],
              ["Every two weeks", money(d.biweekly)],
              ["Twice a month", money(d.semimonthly)],
              ["Monthly", money(d.monthly)],
              ["Yearly", money(d.annual)],
            ]}
            limits="Gross pay before tax. Unpaid time off lowers the yearly figure; enter fewer paid weeks for that. Overtime, bonuses and shift premiums are not included."
            method={
              <p>
                Method: hourly × hours per week × paid weeks per year = yearly; ÷ 12 = monthly; ÷ 24 = twice-monthly. For reference, the U.S. federal government divides annual pay by 2,087 hours (
                <Ext href={OPM_2087_URL}>OPM fact sheet</Ext>), which gives {money(d.opmHourly)} an hour for this salary. Retrieved 2026-10-24.
              </p>
            }
          />
        )}
      />
    </div>
  );
}
