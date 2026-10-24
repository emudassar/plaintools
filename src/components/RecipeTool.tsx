"use client";

import { useState } from "react";
import { DataTable, Grid, Hint, NumField, ResultCard, Output, attempt, num, fmt } from "./CalcBits";
import { Btn } from "./ToolBits";
import { scaleRecipe } from "@/lib/kitchen-calc";

const SAMPLE = `2 1/4 cups all-purpose flour
1 tsp baking soda
1/2 tsp salt
1 cup butter, softened
3/4 cup sugar
3/4 cup packed brown sugar
2 large eggs
2 cups chocolate chips`;

export default function RecipeTool() {
  const [text, setText] = useState(SAMPLE);
  const [orig, setOrig] = useState("24");
  const [want, setWant] = useState("36");
  const [copied, setCopied] = useState(false);
  const factor = num(want) / num(orig);
  const result = attempt(() => scaleRecipe(text, factor));

  return (
    <div>
      <label htmlFor="recipe-lines" className="mb-1.5 block font-medium">
        Ingredients, one per line
      </label>
      <textarea id="recipe-lines" rows={9} value={text} onChange={(e) => setText(e.target.value)} className="mb-3 w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5 font-mono text-sm" />
      <Grid cols={3}>
        <NumField label="Recipe makes (servings)" value={orig} onChange={setOrig} />
        <NumField label="You want (servings)" value={want} onChange={setWant} />
        <div className="flex items-end">
          <p className="text-sm text-[var(--color-muted)]">Scale factor: × {Number.isFinite(factor) ? fmt(factor, 3) : "—"}</p>
        </div>
      </Grid>
      <Hint>Lines that start with a number are scaled (1 1/2, ½, 0.5, 2-3). Lines without a number, like “pinch of salt”, are left as written.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label={`Scaled from ${orig} to ${want} servings`}
            headline={`× ${fmt(factor, 3)}`}
            sub={`${d.filter((l) => l.changed).length} of ${d.length} lines scaled`}
            limits="Quantities scale in a straight line, but cooking does not always: baking time, pan size, leavening, salt and spices often need judgement when a recipe is doubled or halved. Eggs and other whole items may need rounding to something you can measure. Volume amounts are rounded to the nearest kitchen fraction (eighths and thirds)."
            method={<p>Method: every leading quantity × (servings wanted ÷ servings in the recipe). Metric amounts are kept as decimals; others are shown as the nearest 1/8 or 1/3. Done in your browser.</p>}
          >
            <DataTable head={["Original", "Scaled"]} rows={d.map((l) => [l.original, l.changed ? <strong key="s">{l.scaled}</strong> : l.scaled])} />
            <div className="mb-5">
              <Btn
                onClick={() => {
                  void navigator.clipboard?.writeText(d.map((l) => l.scaled).join("\n"));
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
              >
                {copied ? "Copied" : "Copy scaled list"}
              </Btn>
            </div>
          </ResultCard>
        )}
      />
    </div>
  );
}
