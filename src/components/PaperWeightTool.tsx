"use client";

import { useState } from "react";
import { lbToGsm, gsmToLb, equivalents, GRADES, area, SYLVAMO_URL, PAPER_RETRIEVED, type Grade } from "@/lib/paper-weight";
import { NumField, SelectField, Grid, Hint, ResultCard, Output, DataTable, attempt, num, fmt } from "./CalcBits";

const gradeOpts = (Object.keys(GRADES) as Grade[]).map((g) => [g, `${GRADES[g].label} (${GRADES[g].w} × ${GRADES[g].h} in)`] as const) as [Grade, string][];

export default function PaperWeightTool() {
  const [dir, setDir] = useState<"lb" | "gsm">("lb");
  const [value, setValue] = useState("80");
  const [grade, setGrade] = useState<Grade>("text");

  const result = attempt(() => {
    const gsm = dir === "lb" ? lbToGsm(num(value), grade) : num(value);
    const lb = dir === "lb" ? num(value) : gsmToLb(num(value), grade);
    if (dir === "gsm") lbToGsm(lb, grade);
    return { gsm, lb, eq: equivalents(gsm) };
  });

  return (
    <div>
      <Grid cols={3}>
        <SelectField label="Convert" value={dir} onChange={setDir} options={[["lb", "Pounds (basis weight) → gsm"], ["gsm", "gsm → pounds"]]} />
        <NumField label={dir === "lb" ? "Basis weight (lb)" : "Weight (g/m²)"} value={value} onChange={setValue} />
        <SelectField label="Paper grade" value={grade} onChange={setGrade} options={gradeOpts} />
      </Grid>
      <Hint>A &ldquo;pound&rdquo; weight only means something with its grade: 80 lb text and 80 lb cover are very different papers. The result updates as you type.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label={dir === "lb" ? "Grams per square metre" : `${GRADES[grade].label} basis weight`}
            headline={dir === "lb" ? `${fmt(d.gsm, 1)} gsm` : `${fmt(d.lb, 1)} lb ${GRADES[grade].label.toLowerCase()}`}
            sub={`${fmt(d.lb, 1)} lb ${GRADES[grade].label.toLowerCase()} = ${fmt(d.gsm, 1)} g/m² (basic size ${GRADES[grade].w} × ${GRADES[grade].h} in = ${fmt(area(grade), 2)} in²)`}
            limits="Thickness (caliper) or stiffness — two papers of the same gsm can feel very different. Mills round their published weights, and catalogues often list rounded equivalents."
            method={
              <p>
                Method: gsm = basis weight × 1406.5 ÷ basic-size area (in²), and back. Formula and basic sizes from Sylvamo&rsquo;s{" "}
                <a className="underline" href={SYLVAMO_URL}>
                  basis weight calculator
                </a>{" "}
                (reproduces its 28 lb bond = 105.3 gsm example). Retrieved {PAPER_RETRIEVED}.
              </p>
            }
          >
            <DataTable head={["Same paper expressed as", "Basis weight"]} rows={d.eq.map((e) => [e.label, `${fmt(e.lb, 1)} lb`])} highlight={d.eq.findIndex((e) => e.grade === grade)} />
          </ResultCard>
        )}
      />
    </div>
  );
}
