"use client";

import { useState } from "react";
import { scfmConvert, STANDARDS, OPENSTAX_GAS_URL, PDB_URL, SCFM_RETRIEVED, type StdKey } from "@/lib/scfm";
import { NumField, SelectField, Grid, Hint, ResultCard, Output, attempt, num, fmt } from "./CalcBits";

export default function ScfmTool() {
  const [dir, setDir] = useState<"s2a" | "a2s">("s2a");
  const [flow, setFlow] = useState("100");
  const [std, setStd] = useState<StdKey>("cagi");
  const [cP, setCP] = useState("14.5");
  const [cF, setCF] = useState("68");
  const [psig, setPsig] = useState("100");
  const [baro, setBaro] = useState("14.696");
  const [tF, setTF] = useState("80");
  const sP = std === "custom" ? num(cP) : STANDARDS[std].psia;
  const sF = std === "custom" ? num(cF) : STANDARDS[std].f;

  const result = attempt(() => scfmConvert({ direction: dir, flow: num(flow), stdPsia: sP, stdF: sF, psig: num(psig), baroPsia: num(baro), actualF: num(tF) }));

  return (
    <div>
      <Grid cols={3}>
        <SelectField label="Convert" value={dir} onChange={setDir} options={[["s2a", "SCFM → actual CFM"], ["a2s", "Actual CFM → SCFM"]]} />
        <NumField label={dir === "s2a" ? "SCFM" : "Actual CFM (ACFM)"} value={flow} onChange={setFlow} />
        <SelectField
          label="Standard conditions"
          value={std}
          onChange={setStd}
          options={[["cagi", STANDARDS.cagi.label], ["sea60", STANDARDS.sea60.label], ["custom", "Custom"]]}
        />
      </Grid>
      {std === "custom" && (
        <Grid cols={2}>
          <NumField label="Standard pressure (psia)" value={cP} onChange={setCP} />
          <NumField label="Standard temperature (°F)" value={cF} onChange={setCF} min="-100" />
        </Grid>
      )}
      <Grid cols={3}>
        <NumField label="Actual pressure (psig, gauge)" value={psig} onChange={setPsig} hint="0 for air at atmospheric pressure." min="-15" />
        <NumField label="Barometric pressure (psia)" value={baro} onChange={setBaro} hint="14.696 at sea level; lower at altitude." />
        <NumField label="Actual temperature (°F)" value={tF} onChange={setTF} min="-100" />
      </Grid>
      <Hint>Use the standard your equipment's rating was given at; compressor and tool makers don't all use the same one. The result updates as you type.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label={dir === "s2a" ? "Actual flow" : "Standard flow"}
            headline={dir === "s2a" ? `${fmt(d.acfm, 2)} ACFM` : `${fmt(d.scfm, 2)} SCFM`}
            sub={`${fmt(d.scfm, 2)} SCFM ⇄ ${fmt(d.acfm, 2)} ACFM at ${fmt(d.actualPsia, 2)} psia and ${tF} °F (standard ${sP} psia, ${sF} °F)`}
            rows={[
              ["Actual absolute pressure", `${fmt(d.actualPsia, 3)} psia = ${psig} psig + ${baro} psia`],
              ["Pressure ratio (standard ÷ actual)", fmt(sP / d.actualPsia, 4)],
              ["Temperature ratio (actual ÷ standard, °R)", fmt((num(tF) + 459.67) / (sF + 459.67), 4)],
              ["ACFM per SCFM", fmt(d.ratio, 4)],
            ]}
            limits="Humidity. Moist air holds water vapour that takes up part of the volume; this dry-air calculation leaves it out, which can matter for blowers and process air on hot, humid days. It also doesn't cover gases other than air, or pressure drop through filters and hoses."
            method={
              <p>
                Method: ACFM = SCFM × (P<sub>std</sub> ÷ P<sub>actual</sub>) × (T<sub>actual</sub> ÷ T<sub>std</sub>), absolute pressure and °R — the combined gas
                law,{" "}
                <a className="underline" href={OPENSTAX_GAS_URL}>
                  OpenStax Chemistry 2e §9.2
                </a>
                . Standard basis 14.7 psia / 68 °F as given in the Roots SCFM vs ACFM guidebook,{" "}
                <a className="underline" href={PDB_URL}>
                  reproduced by PD Blowers
                </a>
                . Retrieved {SCFM_RETRIEVED}.
              </p>
            }
          />
        )}
      />
    </div>
  );
}
