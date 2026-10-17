"use client";

import { useState } from "react";
import { roofTruss, IRC_CH8_URL, TRUSS_RETRIEVED } from "@/lib/roof-truss";
import { feetInches } from "@/lib/rafter-length";
import { NumField, Grid, Hint, ResultCard, Output, attempt, num, optNum, fmt, money } from "./CalcBits";

export default function RoofTrussTool() {
  const [len, setLen] = useState("40");
  const [sp, setSp] = useState("24");
  const [span, setSpan] = useState("24");
  const [pitch, setPitch] = useState("6");
  const [over, setOver] = useState("12");
  const [price, setPrice] = useState("");

  const result = attempt(() => roofTruss({ lengthFt: num(len), spacingIn: num(sp), spanFt: num(span), pitch: num(pitch), overhangIn: num(over), pricePerTruss: optNum(price) }));

  return (
    <div>
      <Grid cols={3}>
        <NumField label="Building length along the ridge (ft)" value={len} onChange={setLen} />
        <NumField label="Truss spacing on centre (in)" value={sp} onChange={setSp} />
        <NumField label="Span (ft)" value={span} onChange={setSpan} />
      </Grid>
      <Grid cols={3}>
        <NumField label="Pitch (rise per 12 in)" value={pitch} onChange={setPitch} />
        <NumField label="Overhang each side, level (in)" value={over} onChange={setOver} />
        <NumField label="Price per truss (optional)" value={price} onChange={setPrice} />
      </Grid>
      <Hint>Counts a truss at each gable end. The result updates as you type.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label="Trusses needed"
            headline={`${d.count} trusses at ${sp} in on centre`}
            sub={`${feetInches(d.topChord)} top chord each side · ${feetInches(d.rise)} rise${d.cost !== null ? ` · about ${money(d.cost)}` : ""}`}
            rows={[
              ["Spaces", d.lastSpace < num(sp) - 1e-6 ? `${d.count - 2} at ${sp} in + one closing space of ${fmt(d.lastSpace, 2)} in` : `${d.count - 1} at ${sp} in`],
              ["Bottom chord (span)", `${fmt(d.bottomChord, 2)} ft`],
              ["Top chord line length per side, incl. overhang", `${feetInches(d.topChord)} (${fmt(d.topChord, 2)} ft)`],
              ["Rise at the ridge", `${feetInches(d.rise)} (${fmt(d.heightAtRidgeIn, 1)} in)`],
              ["Roof angle", `${fmt(d.angleDeg, 2)}°`],
            ]}
            limits="Member sizes, webs, heel height, connector plates or whether a truss can carry your loads. Trusses are engineered products: the IRC requires truss design drawings approved before installation and forbids cutting or altering truss members without approval. Use this for counting and budgeting, and get the design from the truss manufacturer."
            method={
              <p>
                Method: count = whole spaces + 1, plus one if a shorter closing space is left; top chord = (span ÷ 2 + overhang) × √(144 + pitch²) ÷ 12. Code
                checked:{" "}
                <a className="underline" href={IRC_CH8_URL}>
                  IRC 2021 R802.10.1, R802.10.2 and R802.10.4
                </a>
                . Retrieved {TRUSS_RETRIEVED}.
              </p>
            }
          />
        )}
      />
    </div>
  );
}
