"use client";

import { useState } from "react";
import { stuccoBags, QK_BASE_URL, QK_FINISH_URL, STUCCO_RETRIEVED } from "@/lib/stucco";
import { NumField, SelectField, Grid, Hint, ResultCard, Output, DataTable, attempt, num, fmt } from "./CalcBits";

type System = "three" | "two" | "custom";

export default function StuccoTool() {
  const [area, setArea] = useState("400");
  const [open, setOpen] = useState("40");
  const [system, setSystem] = useState<System>("three");
  const [t1, setT1] = useState("0.375");
  const [t2, setT2] = useState("0.375");
  const [t3, setT3] = useState("0.125");
  const [waste, setWaste] = useState("10");

  const coats =
    system === "three"
      ? [
          { name: "Scratch coat", thicknessIn: num(t1) },
          { name: "Brown coat", thicknessIn: num(t2) },
          { name: "Finish coat", thicknessIn: num(t3) },
        ]
      : system === "two"
        ? [
            { name: "Base coat", thicknessIn: num(t1) },
            { name: "Finish coat", thicknessIn: num(t3) },
          ]
        : [{ name: "Coat", thicknessIn: num(t1) }];

  const result = attempt(() => stuccoBags({ areaSqFt: num(area), openingsSqFt: num(open), coats, wastePct: num(waste) }));

  return (
    <div>
      <Grid cols={3}>
        <NumField label="Wall area (ft²)" value={area} onChange={setArea} />
        <NumField label="Windows and doors (ft²)" value={open} onChange={setOpen} />
        <NumField label="Waste allowance (%)" value={waste} onChange={setWaste} />
      </Grid>
      <Grid cols={4}>
        <SelectField label="Coats" value={system} onChange={setSystem} options={[["three", "Three coats"], ["two", "Base + finish"], ["custom", "One coat"]]} />
        <NumField label={system === "three" ? "Scratch thickness (in)" : system === "two" ? "Base thickness (in)" : "Thickness (in)"} value={t1} onChange={setT1} />
        {system === "three" && <NumField label="Brown thickness (in)" value={t2} onChange={setT2} />}
        {system !== "custom" && <NumField label="Finish thickness (in)" value={t3} onChange={setT3} />}
      </Grid>
      <Hint>Coat thicknesses come from your plans or local code; 0.375 = 3/8 in, 0.125 = 1/8 in. The result updates as you type.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label="Stucco bags (80 lb)"
            headline={`${d.totalBags} bags of 80 lb`}
            sub={`${fmt(d.netArea, 0)} ft² of wall, ${coats.length} coat${coats.length > 1 ? "s" : ""}, with your ${waste}% allowance`}
            limits="Whether the wall is ready for stucco — lath, weep screed, flashing and curing are part of the system and are governed by ASTM C926/C1063 and local code. Coverage varies with texture, how true the wall is, and how much falls on the ground; Quikrete itself says its coverages are approximate."
            method={
              <p>
                Method: area × thickness = volume; ÷ 0.75 ft³ yield per 80 lb bag, rounded up. Yields and coverage from QUIKRETE data sheets:{" "}
                <a className="underline" href={QK_BASE_URL}>
                  Scratch and Brown Base Coat Stucco (1139)
                </a>{" "}
                and{" "}
                <a className="underline" href={QK_FINISH_URL}>
                  Finish Coat Stucco (1201)
                </a>
                . Retrieved {STUCCO_RETRIEVED}.
              </p>
            }
          >
            <DataTable
              head={["Coat", "Thickness", "Volume", "Bags (by yield)", "Bags from Quikrete's printed coverage"]}
              rows={d.rows.map((r) => [
                r.name,
                `${fmt(r.thicknessIn, 3)} in`,
                `${fmt(r.cuFt, 2)} ft³`,
                String(r.bags),
                r.bagsFromRange ? `${r.bagsFromRange.low}–${r.bagsFromRange.high} (${r.printedRange!.low}–${r.printedRange!.high} ft² per bag)` : "—",
              ])}
            />
          </ResultCard>
        )}
      />
    </div>
  );
}
