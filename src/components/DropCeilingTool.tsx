"use client";

import { useState } from "react";
import { dropCeiling, ARMSTRONG_URL, CEILING_RETRIEVED } from "@/lib/drop-ceiling";
import { feetInches } from "@/lib/rafter-length";
import { NumField, SelectField, Grid, Hint, ResultCard, Output, attempt, num, fmt } from "./CalcBits";

export default function DropCeilingTool() {
  const [a, setA] = useState("14");
  const [b, setB] = useState("12");
  const [panel, setPanel] = useState<"2x4" | "2x2">("2x4");
  const [mainLen, setMainLen] = useState("12");
  const [molding, setMolding] = useState("12");
  const [fixtures, setFixtures] = useState("2");
  const [waste, setWaste] = useState("5");

  const result = attempt(() =>
    dropCeiling({ sideA: num(a), sideB: num(b), panel, mainLenFt: num(mainLen), moldingLenFt: num(molding), fixtures: num(fixtures), wastePct: num(waste) }),
  );

  return (
    <div>
      <Grid cols={3}>
        <NumField label="Room side across the joists (ft)" value={a} onChange={setA} hint="Main beams run this way." />
        <NumField label="Room side along the joists (ft)" value={b} onChange={setB} hint="Main beams are spaced 4 ft apart this way." />
        <SelectField label="Panel size" value={panel} onChange={setPanel} options={[["2x4", "2 ft × 4 ft"], ["2x2", "2 ft × 2 ft"]]} />
      </Grid>
      <Grid cols={4}>
        <NumField label="Main beam length (ft)" value={mainLen} onChange={setMainLen} />
        <NumField label="Wall molding length (ft)" value={molding} onChange={setMolding} />
        <NumField label="Drop-in light fixtures" value={fixtures} onChange={setFixtures} step="1" />
        <NumField label="Extra allowance (%)" value={waste} onChange={setWaste} />
      </Grid>
      <Hint>Check the piece lengths on the packs you buy. The result updates as you type.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label="Ceiling materials"
            headline={`${d.panels} panels · ${d.mainPieces} main beams · ${d.crossTees4} cross tees (4 ft)${d.tees2 ? ` · ${d.tees2} cross tees (2 ft)` : ""}`}
            sub={`${d.moldingPieces} wall molding pieces · about ${d.wires} hanger wires · ${fmt(d.areaSqFt, 1)} ft² ceiling`}
            rows={[
              ["Border panels across the joists", `${feetInches(d.borderA)} at each wall`],
              ["Border panels along the joists", `${feetInches(d.borderB)} at each wall`],
              ["Main beam lines (4 ft apart)", String(d.mainLines)],
              ["Cross tee lines (2 ft apart)", String(d.crossLines)],
              ["Full panels (uncut)", String(d.fullPanels)],
              ["Panels incl. one per border piece", String(d.panels)],
              ["Hanger wires", `${d.wires} (one about every 4 ft on each main beam, plus 4 per light)`],
            ]}
            limits="Your joist layout, obstructions such as ducts and pipes, or anything about fire ratings, lighting loads or local rules. Border cells are counted as one panel each; you can sometimes cut two borders from one panel, so the panel count may be generous."
            method={
              <p>
                Method: Armstrong&rsquo;s border worksheet ((remainder + panel size) ÷ 2), main beams on 4 ft centres across the joists, cross tees 2 ft apart,
                extra 2 ft tees for a 2 × 2 grid, wires every 4 ft and one at each corner of a light. Source: Armstrong,{" "}
                <a className="underline" href={ARMSTRONG_URL}>
                  How to Install Your Suspended Ceiling
                </a>
                . Reproduces its 9′ × 10′6″ sample (borders 2′6″ and 1′3″). Retrieved {CEILING_RETRIEVED}.
              </p>
            }
          />
        )}
      />
    </div>
  );
}
