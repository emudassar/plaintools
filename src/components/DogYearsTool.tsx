"use client";

import { useState } from "react";
import { DataTable, Grid, Hint, NumField, ResultCard, Output, attempt, num, fmt } from "./CalcBits";
import { Ext } from "./GeoBits";
import { DOG_EPIGENETIC_URL, DOG_RULE_URL, FUN_RETRIEVED, dogAge } from "@/lib/fun-tools";

export default function DogYearsTool() {
  const [years, setYears] = useState("5");
  const [months, setMonths] = useState("0");
  const age = num(years) + (months.trim() === "" ? 0 : Number(months)) / 12;
  const result = attempt(() => dogAge(age));

  return (
    <div>
      <Grid cols={2}>
        <NumField label="Dog's age: years" value={years} onChange={setYears} />
        <NumField label="and months" value={months} onChange={setMonths} step="1" />
      </Grid>
      <Hint>The result updates as you type.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label={`A dog of ${fmt(age, 2)} years`}
            headline={`About ${fmt(d.rule, 0)} human years`}
            sub={d.epigenetic !== null ? `${fmt(d.epigenetic, 0)} human years by the 2020 DNA-methylation formula` : "The DNA-methylation formula is not used below 3 months, where it was not fitted."}
            rows={[
              ["General rule (15 / 9 / 5)", `${fmt(d.rule, 1)} years`],
              ["DNA-methylation formula, 16 ln(age) + 31", d.epigenetic !== null ? `${fmt(d.epigenetic, 1)} years` : "—"],
            ]}
            limits="Neither method accounts for breed or size, and large breeds tend to age faster and live shorter lives than small ones. The methylation formula was fitted in Labrador retrievers. A dog's health and life stage are for a veterinarian to judge."
            method={
              <p>
                General rule: first year = 15 human years, second = 9, each later year about 5, as summarised in <Ext href={DOG_RULE_URL}>Aging in dogs</Ext>. Formula: human age = 16 × ln(dog age) + 31, from Wang et al. (2020),{" "}
                <Ext href={DOG_EPIGENETIC_URL}>Cell Systems 11(2)</Ext>. Retrieved {FUN_RETRIEVED}.
              </p>
            }
          >
            <DataTable
              head={["Dog age", "General rule", "Methylation formula"]}
              rows={[1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16].map((y) => {
                const r = dogAge(y);
                return [`${y} yr`, fmt(r.rule, 0), r.epigenetic !== null ? fmt(r.epigenetic, 0) : "—"];
              })}
            />
          </ResultCard>
        )}
      />
    </div>
  );
}
