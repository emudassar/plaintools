"use client";

import { useState } from "react";
import { dilutionRatio, fromMl, VOLUME_UNITS, type VolUnit } from "@/lib/dilution";
import { NumField, SelectField, Grid, Hint, ResultCard, Output, attempt, num, fmt } from "./CalcBits";

const unitOptions = Object.entries(VOLUME_UNITS).map(([k, v]) => [k, v.label] as const) as [VolUnit, string][];

export default function DilutionRatioTool() {
  const [n, setN] = useState("10");
  const [reading, setReading] = useState<"parts" | "total">("parts");
  const [known, setKnown] = useState<"final" | "concentrate">("final");
  const [amount, setAmount] = useState("32");
  const [unit, setUnit] = useState<VolUnit>("floz");
  const [outUnit, setOutUnit] = useState<VolUnit>("floz");

  const result = attempt(() => dilutionRatio({ n: num(n), reading, known, amount: num(amount), unit }));
  const show = (ml: number) => `${fmt(fromMl(ml, outUnit), 2)} ${VOLUME_UNITS[outUnit].label}`;

  return (
    <div>
      <Grid cols={3}>
        <NumField label="Ratio 1 : N — enter N" value={n} onChange={setN} />
        <SelectField
          label="The label means"
          value={reading}
          onChange={setReading}
          options={[
            ["parts", "1 part product + N parts water"],
            ["total", "1 part product in N parts total"],
          ]}
        />
        <SelectField label="You know" value={known} onChange={setKnown} options={[["final", "How much mix you want"], ["concentrate", "How much product you have"]]} />
      </Grid>
      <Grid cols={3}>
        <NumField label="Amount" value={amount} onChange={setAmount} />
        <SelectField label="Unit" value={unit} onChange={setUnit} options={unitOptions} />
        <SelectField label="Show results in" value={outUnit} onChange={setOutUnit} options={unitOptions} />
      </Grid>
      <Hint>Most cleaning and detailing labels mean &ldquo;1 part product + N parts water&rdquo;. If the label says otherwise, switch the reading.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label={`1:${n} mix`}
            headline={`${show(d.concentrateMl)} product + ${show(d.waterMl)} water`}
            sub={`Makes ${show(d.finalMl)} · ${fmt(d.percentConcentrate, 2)}% product by volume · ${fmt(d.ozPerGallon, 2)} fl oz per gallon of mix`}
            rows={[
              ["Total parts", fmt(d.totalParts, 2)],
              ["Product", show(d.concentrateMl)],
              ["Water", show(d.waterMl)],
              ["Finished mix", show(d.finalMl)],
              ["Product in millilitres", `${fmt(d.concentrateMl, 1)} ml`],
            ]}
            limits="Whether the ratio on the label is right for your surface, or whether two products are safe to mix. Follow the product label and its safety data sheet. Volumes are by volume only; the page does not account for density or for products that are dosed by weight."
            method={<p>Method: product = finished amount ÷ total parts, where total parts = 1 + N (or N); water = finished − product. US fluid ounces and gallons per NIST (1 US gal = 128 fl oz = 3.785411784 L). Plain arithmetic in your browser.</p>}
          />
        )}
      />
    </div>
  );
}
