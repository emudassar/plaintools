"use client";

import { useState } from "react";
import { DataTable, Grid, Hint, ResultCard, Output, TextField, attempt } from "./CalcBits";
import { toMilitary } from "@/lib/time-calc";
import { fmt12 } from "@/lib/date-calc";

const CHART = Array.from({ length: 24 }, (_, h) => [fmt12(h * 60), `${String(h).padStart(2, "0")}00`, `${String(h).padStart(2, "0")}:00`]);

export default function MilitaryTimeTool() {
  const [input, setInput] = useState("3:45 PM");
  const result = attempt(() => toMilitary(input));
  return (
    <div>
      <Grid cols={2}>
        <TextField label="Time (12-hour or military)" value={input} onChange={setInput} hint="Type 3:45 PM, 3:45p, 1545 or 15:45 — it converts both ways." />
      </Grid>
      <Hint>Four digits with no colon (like 0730) are read as military time.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label="Converted time"
            headline={`${d.military} hours = ${d.twelve}`}
            sub={`Said aloud: “${d.spoken}”`}
            rows={[
              ["Military (no colon)", d.military],
              ["24-hour with colon", d.withColon],
              ["12-hour", d.twelve],
              ["Minutes after midnight", d.minutes.toLocaleString("en-US")],
            ]}
            limits="Spoken forms vary between services and countries; “hundred hours” and “zero” versus “oh” are both heard. Time-zone letters (such as Z for UTC, “Zulu”) are not added."
            method={<p>Method: the 24-hour clock written as four digits, 0000 (midnight) to 2359; 12 AM = 0000, 12 PM = 1200, 1 PM = 1300. Converted in your browser.</p>}
          >
            <h3 className="mb-2 font-semibold tracking-wide uppercase">Military time chart</h3>
            <DataTable head={["12-hour", "Military", "24-hour"]} rows={CHART} highlight={Math.floor(d.minutes / 60)} />
          </ResultCard>
        )}
      />
    </div>
  );
}
