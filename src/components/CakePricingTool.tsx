"use client";

import { useState } from "react";
import { cakePrice } from "@/lib/cake-pricing";
import { NumField, SelectField, TextField, Grid, Hint, ResultCard, Output, DataTable, attempt, num, optNum, fmt, money } from "./CalcBits";

const START = [
  { name: "Flour", packagePrice: "4.50", packageSize: "2268", used: "360" },
  { name: "Sugar", packagePrice: "3.80", packageSize: "1814", used: "400" },
  { name: "Butter", packagePrice: "5.00", packageSize: "454", used: "340" },
  { name: "Eggs", packagePrice: "4.20", packageSize: "12", used: "4" },
];

export default function CakePricingTool() {
  const [rows, setRows] = useState(START);
  const [pack, setPack] = useState("3");
  const [hours, setHours] = useState("3");
  const [rate, setRate] = useState("20");
  const [over, setOver] = useState("4");
  const [mode, setMode] = useState<"markup" | "margin">("markup");
  const [pct, setPct] = useState("30");
  const [serv, setServ] = useState("16");
  const set = (i: number, k: keyof (typeof START)[number], v: string) => setRows((r) => r.map((x, j) => (j === i ? { ...x, [k]: v } : x)));

  const result = attempt(() =>
    cakePrice({
      ingredients: rows.map((r) => ({ name: r.name, packagePrice: num(r.packagePrice), packageSize: num(r.packageSize), used: num(r.used) })),
      packaging: num(pack),
      labourHours: num(hours),
      hourlyRate: num(rate),
      overhead: num(over),
      mode,
      pct: num(pct),
      servings: optNum(serv),
    }),
  );

  return (
    <div>
      <p className="mb-2 font-medium">Ingredients — price paid, package size and amount used (same unit for size and amount: g, oz, eggs…)</p>
      {rows.map((r, i) => (
        <Grid cols={4} key={i}>
          <TextField label={`Ingredient ${i + 1}`} value={r.name} onChange={(v) => set(i, "name", v)} />
          <NumField label="Package price ($)" value={r.packagePrice} onChange={(v) => set(i, "packagePrice", v)} />
          <NumField label="Package size" value={r.packageSize} onChange={(v) => set(i, "packageSize", v)} />
          <NumField label="Amount used" value={r.used} onChange={(v) => set(i, "used", v)} />
        </Grid>
      ))}
      <div className="mb-4 flex gap-2">
        <button type="button" className="rounded-md border border-[var(--color-line)] px-3 py-1.5 text-sm" onClick={() => setRows((r) => [...r, { name: "", packagePrice: "0", packageSize: "1", used: "0" }])}>
          Add an ingredient
        </button>
        {rows.length > 0 && (
          <button type="button" className="rounded-md border border-[var(--color-line)] px-3 py-1.5 text-sm" onClick={() => setRows((r) => r.slice(0, -1))}>
            Remove last
          </button>
        )}
      </div>
      <Grid cols={4}>
        <NumField label="Box, board, packaging ($)" value={pack} onChange={setPack} />
        <NumField label="Your hours" value={hours} onChange={setHours} />
        <NumField label="Hourly rate ($)" value={rate} onChange={setRate} />
        <NumField label="Overhead per cake ($)" value={over} onChange={setOver} hint="Power, gas, a share of fees." />
      </Grid>
      <Grid cols={3}>
        <SelectField label="Profit as" value={mode} onChange={setMode} options={[["markup", "Markup on cost (%)"], ["margin", "Margin of the price (%)"]]} />
        <NumField label={mode === "markup" ? "Markup (%)" : "Margin (%)"} value={pct} onChange={setPct} />
        <NumField label="Servings (optional)" value={serv} onChange={setServ} step="1" />
      </Grid>
      <Hint>The starting numbers are only an example — replace them with your own receipts and recipe. The result updates as you type.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label="Cake price"
            headline={money(d.price)}
            sub={`Cost ${money(d.totalCost)} · profit ${money(d.profit)} (${fmt(d.marginPct, 1)}% margin, ${fmt(d.markupPct, 1)}% markup)${d.perServing !== null ? ` · ${money(d.perServing)} per serving` : ""}`}
            rows={[
              ["Ingredients", money(d.ingredientCost)],
              ["Packaging", money(num(pack))],
              ["Labour", money(d.labourCost)],
              ["Overhead", money(num(over))],
              ["Total cost", money(d.totalCost)],
            ]}
            limits="What customers in your area will pay, or what local rules apply to selling food from home. The price is only as good as the costs you enter — weigh what the recipe really uses, and count your time honestly."
            method={<p>Method: ingredient cost = package price ÷ package size × amount used; price = cost × (1 + markup) or cost ÷ (1 − margin). Plain arithmetic in your browser.</p>}
          >
            <DataTable head={["Ingredient", "Cost in this cake"]} rows={d.lines.map((l) => [l.name || "—", money(l.cost)])} />
          </ResultCard>
        )}
      />
    </div>
  );
}
