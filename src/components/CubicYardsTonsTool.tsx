"use client";

import { useState } from "react";
import { yardsToTons, tonsToYards, NM_FACTORS, NM_URL, NM_RETRIEVED, NM_SOURCE, type NmMaterial } from "@/lib/bulk-material";
import { NumField, SelectField, Grid, Hint, ResultCard, Output, DataTable, attempt, num, fmt } from "./CalcBits";

type Mat = NmMaterial | "custom";
const opts = [...Object.entries(NM_FACTORS).map(([k, v]) => [k, `${v.label} — ${v.tonsPerYd} t/yd³`] as const), ["custom", "My supplier's figure"] as const] as [Mat, string][];

export default function CubicYardsTonsTool() {
  const [dir, setDir] = useState<"y2t" | "t2y">("y2t");
  const [amount, setAmount] = useState("10");
  const [mat, setMat] = useState<Mat>("gravel-quarter-2");
  const [custom, setCustom] = useState("1.4");
  const factor = mat === "custom" ? num(custom) : NM_FACTORS[mat].tonsPerYd;

  const result = attempt(() => (dir === "y2t" ? yardsToTons(num(amount), factor) : tonsToYards(num(amount), factor)));

  return (
    <div>
      <Grid cols={3}>
        <SelectField label="Convert" value={dir} onChange={setDir} options={[["y2t", "Cubic yards → tons"], ["t2y", "Tons → cubic yards"]]} />
        <NumField label={dir === "y2t" ? "Cubic yards" : "Short tons"} value={amount} onChange={setAmount} />
        <SelectField label="Material" value={mat} onChange={setMat} options={opts} />
      </Grid>
      {mat === "custom" && (
        <Grid cols={3}>
          <NumField label="Tons per cubic yard" value={custom} onChange={setCustom} />
        </Grid>
      )}
      <Hint>Factors are short tons (2,000 lb) per cubic yard. The result updates as you type.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label={dir === "y2t" ? "Weight" : "Volume"}
            headline={dir === "y2t" ? `${fmt(d.tons, 2)} tons` : `${fmt(d.cuYd, 2)} cubic yards`}
            sub={`${fmt(d.cuYd, 2)} yd³ × ${factor} t/yd³ = ${fmt(d.tons, 2)} short tons (${fmt(d.lbs, 0)} lb) · ${fmt(d.cuM, 2)} m³ · ${fmt(d.tonnes, 2)} tonnes`}
            limits="The density of your load. The same material weighs more wet than dry and more when compacted, and suppliers' products vary. A scale ticket or your supplier's own conversion is the figure to trust for billing or truck loads."
            method={
              <p>
                Method: tons = cubic yards × tons per cubic yard (or ÷ for the reverse). Factors as printed in{" "}
                <a className="underline" href={NM_URL}>
                  {NM_SOURCE}
                </a>
                . Retrieved {NM_RETRIEVED}.
              </p>
            }
          >
            <DataTable
              head={["Material (as listed)", "Tons per yd³", dir === "y2t" ? `Tons for ${amount} yd³` : `Yd³ for ${amount} tons`]}
              rows={Object.values(NM_FACTORS).map((v) => [v.label, String(v.tonsPerYd), fmt(dir === "y2t" ? num(amount) * v.tonsPerYd : num(amount) / v.tonsPerYd, 2)])}
            />
          </ResultCard>
        )}
      />
    </div>
  );
}
