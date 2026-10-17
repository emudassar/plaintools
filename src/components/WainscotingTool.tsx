"use client";

import { useState } from "react";
import { wainscoting, panelLayout } from "@/lib/wainscoting";
import { feetInches } from "@/lib/rafter-length";
import { NumField, TextField, Grid, Hint, ResultCard, Output, attempt, num, fmt } from "./CalcBits";

export default function WainscotingTool() {
  const [walls, setWalls] = useState("12, 14, 12, 14");
  const [open, setOpen] = useState("3");
  const [h, setH] = useState("36");
  const [sw, setSw] = useState("48");
  const [sl, setSl] = useState("96");
  const [stock, setStock] = useState("8");
  const [waste, setWaste] = useState("10");
  const [pw, setPw] = useState("144");
  const [pn, setPn] = useState("4");
  const [ps, setPs] = useState("4");

  const result = attempt(() =>
    wainscoting({ walls: walls.split(/[,\s]+/).filter(Boolean).map(Number), openingsFt: num(open), heightIn: num(h), sheetW: num(sw), sheetL: num(sl), stockFt: num(stock), wastePct: num(waste) }),
  );
  const layout = attempt(() => panelLayout(num(pw), num(pn), num(ps)));
  const inch = (x: number) => `${fmt(x, 3)} in (${feetInches(x / 12).replace(/^0' /, "")})`;

  return (
    <div>
      <Grid cols={3}>
        <TextField label="Wall lengths (ft), separated by commas" value={walls} onChange={setWalls} />
        <NumField label="Doors and openings, total width (ft)" value={open} onChange={setOpen} />
        <NumField label="Wainscot height (in)" value={h} onChange={setH} />
      </Grid>
      <Grid cols={4}>
        <NumField label="Panel sheet width (in)" value={sw} onChange={setSw} />
        <NumField label="Panel sheet length (in)" value={sl} onChange={setSl} />
        <NumField label="Trim stock length (ft)" value={stock} onChange={setStock} />
        <NumField label="Waste allowance (%)" value={waste} onChange={setWaste} />
      </Grid>
      <Hint>Sheets are cut across into strips the wainscot height and installed vertically. The result updates as you type.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label="Wainscoting for the room"
            headline={`${d.sheets} sheets · ${fmt(d.areaSqFt, 1)} ft²`}
            sub={`${fmt(d.run, 1)} ft of wall · ${d.trimPieces} pieces of ${stock} ft for each trim line (cap rail, baseboard)`}
            rows={[
              ["Wall run after openings", `${fmt(d.run, 2)} ft`],
              ["Area covered", `${fmt(d.areaSqFt, 1)} ft²`],
              ["Strips per sheet (sheet length ÷ height)", d.stripsPerSheet ? String(d.stripsPerSheet) : "Height is taller than one sheet — stacked"],
              ["Strip columns along the wall (with allowance)", String(d.columns)],
              ["Sheets", String(d.sheets)],
              ["Each trim line", `${fmt(d.trimFt, 1)} ft → ${d.trimPieces} pieces with allowance`],
            ]}
            limits="How the strips fall at outlets, windows and corners, or how leftover strips can be reused between walls. Real panels have a usable face slightly smaller than the sheet; check the product. Each wall is not laid out separately for sheets, so very short walls can use more."
            method={<p>Method: run = walls − openings; strips per sheet = floor(sheet length ÷ height); sheets = ceil(run × (1 + allowance) ÷ sheet width ÷ strips per sheet). Plain arithmetic in your browser.</p>}
          />
        )}
      />
      <h3 className="mt-8 mb-3 text-lg font-semibold">Raised or picture-frame panel layout for one wall</h3>
      <Grid cols={3}>
        <NumField label="Wall width (in)" value={pw} onChange={setPw} />
        <NumField label="Number of panels" value={pn} onChange={setPn} step="1" />
        <NumField label="Stile width between and at ends (in)" value={ps} onChange={setPs} />
      </Grid>
      <Output
        result={layout}
        render={(d) => (
          <ResultCard
            label="Panel width"
            headline={inch(d.panelW)}
            sub={`${pn} panels with ${ps} in stiles at both ends and between`}
            method={<p>Method: panel width = (wall − (panels + 1) × stile) ÷ panels.</p>}
          >
            <p className="mb-2 font-medium">Left edge of each panel from the left end of the wall</p>
            <p className="mb-5 font-mono text-xs leading-6">{d.starts.map((s, k) => `${k + 1}: ${inch(s)}`).join("   ")}</p>
          </ResultCard>
        )}
      />
    </div>
  );
}
