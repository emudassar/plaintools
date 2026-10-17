"use client";

import { useState } from "react";
import { blockFill, SPACINGS, WIDTHS, CORES_PER_BAG, TEK42_URL, BLOCK_RETRIEVED, type Spacing, type Width } from "@/lib/block-fill";
import { NumField, SelectField, Grid, Hint, ResultCard, Output, attempt, num, fmt } from "./CalcBits";

const widthOpts = WIDTHS.map((w) => [String(w), `${w} in block`] as const) as [string, string][];
const spacingOpts = SPACINGS.map((s) => [String(s), s === 8 ? "Every cell (solid grout, 8 in)" : `Cells ${s} in on centre`] as const) as [string, string][];

export default function BlockFillTool() {
  const [len, setLen] = useState("40");
  const [h, setH] = useState("8");
  const [open, setOpen] = useState("0");
  const [w, setW] = useState("8");
  const [s, setS] = useState("8");

  const result = attempt(() => blockFill({ lengthFt: num(len), heightFt: num(h), openingsSqFt: num(open), width: Number(w) as Width, spacing: Number(s) as Spacing }));
  const cores = CORES_PER_BAG[Number(w) as Width];

  return (
    <div>
      <Grid cols={3}>
        <NumField label="Wall length (ft)" value={len} onChange={setLen} />
        <NumField label="Wall height (ft)" value={h} onChange={setH} />
        <NumField label="Openings (ft²)" value={open} onChange={setOpen} />
      </Grid>
      <Grid cols={2}>
        <SelectField label="Block width" value={w} onChange={setW} options={widthOpts} />
        <SelectField label="Which cells are grouted" value={s} onChange={setS} options={spacingOpts} />
      </Grid>
      <Hint>Hollow single-wythe walls of two-core block. The result updates as you type.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label="Grout to fill the cores"
            headline={`${fmt(d.cuFt, 1)} ft³ · ${fmt(d.cuYd, 2)} cubic yards`}
            sub={`${d.bags80} bags of 80 lb preblended grout (or ${d.bags3000} × 3,000 lb) · about ${d.blocks} blocks (8 × 16) in ${fmt(d.wallSqFt, 0)} ft² of wall`}
            rows={[
              ["Grout per 100 ft² (TEK 04-02A Table 3, incl. 3% waste)", `${d.ft3Per100} ft³`],
              ["Wall area", `${fmt(d.wallSqFt, 1)} ft²`],
              ["80 lb preblended bags (≈0.66 ft³ each)", String(d.bags80)],
              ...(cores ? ([["Cores one 80 lb bag fills (Table 4)", `${cores.bag80} cores of ${w} in block`]] as const) : []),
              ["Blocks at 119 per 100 ft² (incl. 5% waste)", String(d.blocks)],
            ]}
            limits="Which cells must be grouted or reinforced — that's set by the wall's design and your building code. Absorbent block, pumping versus bucketing, and bond beams change grout use; TEK 04-02A notes horizontal bond-beam grouting is extra and that 4 in units aren't covered."
            method={
              <p>
                Method: wall area ÷ 100 × the Table 3 figure for the block width and grout spacing; bags ÷ 0.66 ft³. Source: Concrete Masonry &amp;
                Hardscapes Association,{" "}
                <a className="underline" href={TEK42_URL}>
                  TEK 04-02A Estimating Concrete Masonry Materials
                </a>
                . Retrieved {BLOCK_RETRIEVED}.
              </p>
            }
          />
        )}
      />
    </div>
  );
}
