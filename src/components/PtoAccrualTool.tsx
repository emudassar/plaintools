"use client";

import { useState } from "react";
import { ptoAccrual, DOL_URL, PTO_RETRIEVED, type PayFrequency } from "@/lib/pto-accrual";
import { NumField, SelectField, Grid, Hint, ResultCard, Output, DataTable, attempt, num, optNum, fmt } from "./CalcBits";

export default function PtoAccrualTool() {
  const [mode, setMode] = useState<"annual" | "hourly">("annual");
  const [annual, setAnnual] = useState("80");
  const [per, setPer] = useState("30");
  const [hpw, setHpw] = useState("40");
  const [freq, setFreq] = useState<PayFrequency>("biweekly");
  const [start, setStart] = useState("0");
  const [periods, setPeriods] = useState("26");
  const [taken, setTaken] = useState("0");
  const [cap, setCap] = useState("");
  const [day, setDay] = useState("8");

  const result = attempt(() =>
    ptoAccrual({
      mode,
      annualHours: num(annual),
      workedPerHour: num(per),
      hoursPerWeek: num(hpw),
      frequency: freq,
      startBalance: num(start),
      periods: num(periods),
      hoursTaken: num(taken),
      cap: optNum(cap),
      dayLength: num(day),
    }),
  );

  return (
    <div>
      <Grid cols={3}>
        <SelectField label="Policy type" value={mode} onChange={setMode} options={[["annual", "Fixed hours per year"], ["hourly", "1 hour per X hours worked"]]} />
        {mode === "annual" ? (
          <NumField label="PTO hours per year" value={annual} onChange={setAnnual} />
        ) : (
          <NumField label="Hours worked to earn 1 hour" value={per} onChange={setPer} />
        )}
        <NumField label="Hours worked per week" value={hpw} onChange={setHpw} />
      </Grid>
      <Grid cols={3}>
        <SelectField
          label="Pay frequency"
          value={freq}
          onChange={setFreq}
          options={[["weekly", "Weekly (52)"], ["biweekly", "Every two weeks (26)"], ["semimonthly", "Twice a month (24)"], ["monthly", "Monthly (12)"]]}
        />
        <NumField label="Hours in a workday" value={day} onChange={setDay} />
        <NumField label="Accrual cap, hours (optional)" value={cap} onChange={setCap} />
      </Grid>
      <Grid cols={3}>
        <NumField label="Current balance, hours" value={start} onChange={setStart} />
        <NumField label="Pay periods ahead" value={periods} onChange={setPeriods} step="1" />
        <NumField label="Hours you plan to take in that time" value={taken} onChange={setTaken} />
      </Grid>
      <Hint>Enter the figures from your employer&apos;s written policy. The result updates as you type.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label="Accrual per pay period"
            headline={`${fmt(d.perPeriod, 2)} hours per paycheck`}
            sub={`${fmt(d.perYear, 1)} hours a year (${fmt(d.perYearDays, 1)} days) · ${fmt(d.perHourWorked, 4)} hours per hour worked`}
            rows={[
              ["Balance after " + periods + " pay periods", `${fmt(d.endBalance, 2)} hours (${fmt(d.endBalanceDays, 1)} days)`],
              ["Cap reached", d.capHitAt === null ? (cap ? "Not within this period" : "No cap entered") : `Pay period ${d.capHitAt} — accrual stops there until hours are used`],
            ]}
            limits="Your employer's actual rules. Policies differ on whether overtime counts, when new hires start accruing, rollover limits, payout at separation and whether accrual is per period or per hour. Some states and cities require paid sick leave with their own rates and caps; this page does not check those laws."
            method={
              <>
                <p>
                  Method: yearly hours ÷ pay periods, or hours worked ÷ X; balance = start + accrual − hours taken (spread evenly), held at the cap.
                </p>
                <p className="mt-1">
                  Federal rule checked: U.S. Department of Labor,{" "}
                  <a className="underline" href={DOL_URL}>
                    Vacation Leave
                  </a>{" "}
                  — the FLSA &ldquo;does not require payment for time not worked, such as vacations&rdquo;. Retrieved {PTO_RETRIEVED}.
                </p>
              </>
            }
          >
            <details className="mb-5">
              <summary className="cursor-pointer font-medium">Balance by pay period</summary>
              <div className="mt-3">
                <DataTable
                  head={["Pay period", "Balance (hours)", "Note"]}
                  rows={d.schedule.map((s) => [String(s.period), fmt(s.balance, 2), s.capped ? "at cap" : ""])}
                />
              </div>
            </details>
          </ResultCard>
        )}
      />
    </div>
  );
}
