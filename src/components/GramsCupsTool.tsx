"use client";

import { useState } from "react";
import { DataTable, Grid, Hint, NumField, ResultCard, Output, SelectField, attempt, num, fmt } from "./CalcBits";
import { Ext } from "./GeoBits";
import { INGREDIENTS, KA_RETRIEVED, KA_SOURCE, KA_URL, gramsCups, kitchenFraction, type VolUnit } from "@/lib/kitchen-calc";

type From = "g" | "oz" | VolUnit;

export default function GramsCupsTool() {
  const [ing, setIng] = useState("All-Purpose Flour");
  const [amount, setAmount] = useState("250");
  const [from, setFrom] = useState<From>("g");
  const result = attempt(() => gramsCups(ing, num(amount), from));

  return (
    <div>
      <Grid cols={3}>
        <SelectField label="Ingredient" value={ing} onChange={setIng} options={INGREDIENTS.map((i) => [i.name, i.name] as const)} />
        <NumField label="Amount" value={amount} onChange={setAmount} />
        <SelectField
          label="Unit"
          value={from}
          onChange={setFrom}
          options={[
            ["g", "Grams → cups"],
            ["oz", "Ounces (weight) → cups"],
            ["cup", "Cups → grams"],
            ["tbsp", "Tablespoons → grams"],
            ["tsp", "Teaspoons → grams"],
            ["ml", "Millilitres → grams"],
          ]}
        />
      </Grid>
      <Hint>Every ingredient has its own weight per cup: a cup of flour weighs far less than a cup of sugar or honey.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label={`${amount} ${from === "g" ? "g" : from === "oz" ? "oz" : from} of ${ing.toLowerCase()}`}
            headline={from === "g" || from === "oz" ? `${kitchenFraction(d.cups)} cups (${fmt(d.cups, 3)})` : `${fmt(d.grams, d.grams < 10 ? 1 : 0)} grams`}
            sub={`${fmt(d.grams, 1)} g · ${fmt(d.ounces, 2)} oz · ${fmt(d.tbsp, 1)} tbsp · ${fmt(d.tsp, 1)} tsp · ${fmt(d.ml, 0)} mL by volume`}
            rows={[
              ["Weight per US cup", `${fmt(d.gPerCup, 1)} g`],
              ["As listed in the chart", `${d.listed} = ${d.listedGrams} g`],
            ]}
            limits="How you fill the cup changes the weight: spooning flour in and levelling it weighs less than scooping it, and packed brown sugar weighs more than loose. Brands and grinds differ too. For baking that must come out right, a kitchen scale and the recipe's own weights are more reliable than any conversion."
            method={
              <p>
                Weights: <Ext href={KA_URL}>{KA_SOURCE}</Ext>, scaled to one US cup (1 cup = 16 tbsp = 48 tsp = 236.59 mL). Retrieved {KA_RETRIEVED}.
              </p>
            }
          >
            <DataTable
              head={["Cups", "Grams"]}
              rows={[0.25, 1 / 3, 0.5, 2 / 3, 0.75, 1, 2].map((c) => [kitchenFraction(c), fmt(c * d.gPerCup, 0)])}
            />
          </ResultCard>
        )}
      />
    </div>
  );
}
