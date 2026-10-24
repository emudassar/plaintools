"use client";

import { useState } from "react";
import { DataTable, Grid, Hint, NumField, ResultCard, Output, attempt, fieldClass, fmt, money, num, optNum } from "./CalcBits";
import { Ext } from "./GeoBits";
import { DOL_OT_URL, hm, hoursWorked, type Shift } from "@/lib/time-calc";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const START: Shift[] = DAYS.map((_, i) => (i < 5 ? { start: "9:00 AM", end: "5:30 PM", breakMin: 30 } : { start: "", end: "", breakMin: 0 }));

export default function HoursWorkedTool() {
  const [shifts, setShifts] = useState<Shift[]>(START);
  const [threshold, setThreshold] = useState("40");
  const [rate, setRate] = useState("");
  const [mult, setMult] = useState("1.5");

  const set = (i: number, k: keyof Shift, v: string) => setShifts((s) => s.map((x, j) => (j === i ? { ...x, [k]: k === "breakMin" ? (v.trim() === "" ? 0 : Number(v)) : v } : x)));
  const result = attempt(() => hoursWorked(shifts, num(threshold), optNum(rate), num(mult)));

  return (
    <div>
      <div className="mb-3 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              <th className="py-1 pr-2 font-medium">Day</th>
              <th className="py-1 pr-2 font-medium">Start</th>
              <th className="py-1 pr-2 font-medium">End</th>
              <th className="py-1 font-medium">Unpaid break (min)</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map((s, i) => (
              <tr key={DAYS[i]}>
                <td className="py-1 pr-2">{DAYS[i]}</td>
                <td className="py-1 pr-2">
                  <input className={fieldClass} value={s.start} onChange={(e) => set(i, "start", e.target.value)} placeholder="9:00 AM" aria-label={`${DAYS[i]} start`} />
                </td>
                <td className="py-1 pr-2">
                  <input className={fieldClass} value={s.end} onChange={(e) => set(i, "end", e.target.value)} placeholder="5:00 PM" aria-label={`${DAYS[i]} end`} />
                </td>
                <td className="py-1">
                  <input className={fieldClass} type="number" min="0" value={s.breakMin || ""} onChange={(e) => set(i, "breakMin", e.target.value)} aria-label={`${DAYS[i]} break minutes`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Grid cols={3}>
        <NumField label="Hourly rate, $ (optional)" value={rate} onChange={setRate} />
        <NumField label="Overtime after (hours / week)" value={threshold} onChange={setThreshold} />
        <NumField label="Overtime multiplier" value={mult} onChange={setMult} />
      </Grid>
      <Hint>Leave a day blank if you did not work it. An end time earlier than the start counts as an overnight shift.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label="Hours worked this week"
            headline={`${hm(d.totalMinutes)} (${fmt(d.totalMinutes / 60, 2)} hours)`}
            sub={`${fmt(d.regularHours, 2)} regular + ${fmt(d.overtimeHours, 2)} overtime hours${d.pay ? ` · gross pay ${money(d.pay.total)}` : ""}`}
            limits="Gross pay before tax and deductions. Some states (California among them) also require daily overtime or double time, and some jobs are exempt from overtime; the page applies only the weekly threshold and multiplier you set. Rounding rules for clock punches are your employer's."
            method={
              <p>
                Method: end − start (plus 24 h when the shift crosses midnight) − unpaid break, summed; hours over the weekly threshold are overtime at the multiplier. The federal FLSA standard is over 40 hours in a workweek at not less than 1.5× the regular rate (
                <Ext href={DOL_OT_URL}>U.S. DOL Fact Sheet #23</Ext>). Retrieved 2026-10-24.
              </p>
            }
          >
            <DataTable
              head={["Day", "Hours", "Decimal"]}
              rows={d.shifts.flatMap((s, i) => (s ? [[DAYS[i] + (s.overnight ? " (overnight)" : ""), hm(s.minutes), fmt(s.minutes / 60, 2)]] : []))}
            />
            {d.pay && (
              <DataTable
                head={["Pay", "Amount"]}
                rows={[
                  ["Regular", money(d.pay.regular)],
                  ["Overtime", money(d.pay.overtime)],
                  ["Total gross", money(d.pay.total)],
                ]}
              />
            )}
          </ResultCard>
        )}
      />
    </div>
  );
}
