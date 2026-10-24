"use client";

import { useState } from "react";
import { DataTable, Grid, Hint, NumField, ResultCard, Output, attempt, money, num, optNum, fmt } from "./CalcBits";
import { tip } from "@/lib/money-calc";

const QUICK = [10, 15, 18, 20, 22, 25];

export default function TipTool() {
  const [bill, setBill] = useState("64.50");
  const [pct, setPct] = useState("18");
  const [people, setPeople] = useState("1");
  const [pretax, setPretax] = useState("");
  const [round, setRound] = useState(false);
  const result = attempt(() => tip(num(bill), num(pct), num(people), optNum(pretax), round));

  return (
    <div>
      <Grid cols={3}>
        <NumField label="Bill total ($)" value={bill} onChange={setBill} />
        <NumField label="Tip (%)" value={pct} onChange={setPct} />
        <NumField label="People splitting" value={people} onChange={setPeople} step="1" />
      </Grid>
      <div className="mb-3 flex flex-wrap gap-2">
        {QUICK.map((q) => (
          <button key={q} type="button" onClick={() => setPct(String(q))} aria-pressed={pct === String(q)} className="rounded-md border border-[var(--color-line)] bg-white px-3 py-1.5 text-sm">
            {q}%
          </button>
        ))}
      </div>
      <Grid cols={2}>
        <NumField label="Tip on this amount instead (optional)" value={pretax} onChange={setPretax} hint="For example the subtotal before tax." />
        <label className="flex items-center gap-2 pt-6">
          <input type="checkbox" checked={round} onChange={(e) => setRound(e.target.checked)} />
          <span>Round each person&apos;s share up to the next dollar</span>
        </label>
      </Grid>
      <Hint>The result updates as you type.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label={`${fmt(num(pct), 1)}% tip on ${money(optNum(pretax) ?? num(bill))}`}
            headline={`Tip ${money(d.tip)} · total ${money(d.total)}`}
            sub={num(people) > 1 ? `${money(d.perPerson)} each for ${people} people (${money(d.tipPerPerson)} tip each)` : round ? `Rounded up: the tip works out to ${fmt(d.effectivePct, 1)}%` : undefined}
            limits="The percentage is your choice; customs differ by country, by service and by whether service is already included on the bill."
            method={<p>Method: tip = amount × percentage; total = bill + tip; split = total ÷ people, optionally rounded up to whole dollars (the tip absorbs the rounding). Calculated in your browser.</p>}
          >
            <DataTable
              head={["Tip %", "Tip", "Total", ...(num(people) > 1 ? ["Each"] : [])]}
              rows={QUICK.map((q) => {
                const r = tip(num(bill), q, num(people), optNum(pretax), false);
                return [`${q}%`, money(r.tip), money(r.total), ...(num(people) > 1 ? [money(r.perPerson)] : [])];
              })}
            />
          </ResultCard>
        )}
      />
    </div>
  );
}
