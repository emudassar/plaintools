"use client";

import { useState } from "react";
import { windowTint, MADICO_URL, TINT_RETRIEVED } from "@/lib/window-tint";
import { NumField, TextField, Grid, Hint, ResultCard, Output, DataTable, attempt, num, optNum, fmt } from "./CalcBits";

export default function WindowTintTool() {
  const [glass, setGlass] = useState("75");
  const [films, setFilms] = useState("35");
  const [limit, setLimit] = useState("");

  const filmList = films.split(/[,\s]+/).filter(Boolean).map(Number);
  const result = attempt(() => windowTint({ glassVlt: num(glass), films: filmList, limit: optNum(limit) }));

  return (
    <div>
      <Grid cols={3}>
        <NumField label="Glass VLT on its own (%)" value={glass} onChange={setGlass} hint="Factory glass without film. Factory glass is often slightly tinted; a tint meter gives the real figure." />
        <TextField label="Film VLT (%) — several layers separated by commas" value={films} onChange={setFilms} hint="E.g. 35, or 50, 70 for film over existing film." />
        <NumField label="Your state's minimum (%), optional" value={limit} onChange={setLimit} />
      </Grid>
      <Hint>VLT = visible light transmission, the share of light that gets through. The result updates as you type.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label="Net VLT (glass + film)"
            headline={`${fmt(d.netVlt, 1)}% of light gets through`}
            sub={`${fmt(d.blockedPct, 1)}% blocked${d.meetsLimit === null ? "" : d.meetsLimit ? ` · at or above your ${limit}% limit` : ` · BELOW your ${limit}% limit`}`}
            rows={[
              ["Calculation", `${glass}% × ${filmList.map((f) => f + "%").join(" × ")} = ${fmt(d.netVlt, 2)}%`],
              ...(d.darkestFilmForLimit !== null ? ([["Darkest single film that keeps this glass at the limit", `${fmt(d.darkestFilmForLimit, 1)}% VLT or lighter`]] as const) : []),
              ...(limit && d.darkestFilmForLimit === null ? ([["Note", "The glass alone is already below that limit."]] as const) : []),
            ]}
            limits="What your state's law says, or what a meter will read. States differ on limits for each window, whether they count film alone or film plus glass, reflectivity rules and the tolerance they allow; check your state's vehicle code. Multiplying ignores light that bounces between layers, so a meter can read a point or two differently."
            method={
              <p>
                Method: net VLT = glass VLT × film VLT (each as a fraction), layer by layer. Most states judge the combined figure: &ldquo;The majority of
                states measure the VLT in terms of the combined light transmittance of both the film and the glass itself&rdquo; — Madico,{" "}
                <a className="underline" href={MADICO_URL}>
                  Car window tinting laws: what you need to know
                </a>{" "}
                (2019). Retrieved {TINT_RETRIEVED}.
              </p>
            }
          >
            <DataTable
              head={["Film", "Net VLT on this glass"]}
              rows={[5, 15, 20, 35, 50, 70, 80].map((f) => [`${f}%`, `${fmt((num(glass) * f) / 100, 1)}%`])}
            />
          </ResultCard>
        )}
      />
    </div>
  );
}
