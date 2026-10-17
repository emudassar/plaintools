"use client";

import { useState } from "react";
import { DASH_TABLE, byThreadOd, HAMLET_URL, AN_RETRIEVED } from "@/lib/an-fitting";
import { NumField, SelectField, Grid, Hint, ResultCard, Output, DataTable, attempt, num, fmt } from "./CalcBits";

export default function AnFittingTool() {
  const [od, setOd] = useState("0.56");
  const [unit, setUnit] = useState<"in" | "mm">("in");

  const result = attempt(() => byThreadOd(num(od), unit));
  const best = result.data?.best.row.dash;

  return (
    <div>
      <p className="mb-3 font-medium">Identify a fitting by measuring its male thread</p>
      <Grid cols={2}>
        <NumField label="Measured outside diameter of the male thread" value={od} onChange={setOd} hint="Use calipers across the thread crests." />
        <SelectField label="Unit" value={unit} onChange={setUnit} options={[["in", "inches"], ["mm", "millimetres"]]} />
      </Grid>
      <Hint>Then confirm with a thread pitch gauge: the threads per inch must match too.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label="Closest 37° flare size"
            headline={`-${d.best.row.dash} (${d.best.row.thread})`}
            sub={`Measured ${fmt(d.inches, 4)} in vs ${fmt(d.best.row.threadMajor, 4)} in nominal · next closest -${d.next.row.dash} (${d.next.row.thread})`}
            rows={[
              ["Tube O.D.", `${d.best.row.tubeOd} in`],
              ["Threads per inch", String(d.best.row.tpi)],
              ["Nominal pipe size", `${d.best.row.pipe} in`],
            ]}
            limits="Whether a fitting is AN (military), JIC or another 37° flare part, or whether it's a 45° SAE flare, which looks similar. Pressure ratings shown are one maker's figures for its 316 stainless fittings and depend on material, tube and assembly. A worn thread measures small; check the pitch as well as the diameter."
            method={
              <p>
                Dash number = tube O.D. in sixteenths of an inch. Table: Ham-Let,{" "}
                <a className="underline" href={HAMLET_URL}>
                  SAE37 Flare 3-Piece Tube Assembly catalog
                </a>{" "}
                (SAE J514), Table 2, as printed. Retrieved {AN_RETRIEVED}.
              </p>
            }
          />
        )}
      />
      <h3 className="mt-8 mb-3 text-lg font-semibold">37° flare (SAE J514) dash size chart</h3>
      <DataTable
        head={["Dash", "Tube O.D. (in)", "Thread", "Pipe size (in)", "psi union/bulkhead", "psi with pipe thread"]}
        rows={DASH_TABLE.map((r) => [`-${r.dash}`, r.tubeOd, r.thread, r.pipe, r.psiUnion.toLocaleString("en-US"), r.psiPipe.toLocaleString("en-US")])}
        highlight={best !== undefined ? DASH_TABLE.findIndex((r) => r.dash === best) : undefined}
      />
      <p className="text-xs text-[var(--color-muted)]">
        Pressure columns are Ham-Let&rsquo;s ratings for its stainless fittings; the catalog says they &ldquo;should not be construed as guaranteed minimum&rdquo;.
      </p>
    </div>
  );
}
