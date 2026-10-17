"use client";

import { useEffect, useState } from "react";
import { horseGestation, daysPregnant, formatDate, formatRange, UNL_G1874_URL, HORSE_RETRIEVED, RANGE, AVERAGE, PREMATURE_BEFORE } from "@/lib/horse-gestation";
import { DateField, Grid, Hint, ResultCard, Output, attempt } from "./CalcBits";

export default function HorseGestationTool() {
  const [first, setFirst] = useState("2026-04-15");
  const [last, setLast] = useState("");
  // Today is read on the client only, so the static HTML never disagrees with the browser.
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => {
    const n = new Date();
    setToday(new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate())));
  }, []);

  const result = attempt(() => horseGestation({ firstBred: first, lastBred: last.trim() ? last : null }));

  return (
    <div>
      <Grid cols={2}>
        <DateField label="Breeding (or ovulation) date" value={first} onChange={setFirst} />
        <DateField label="Last breeding date (optional)" value={last} onChange={setLast} />
      </Grid>
      <Hint>If the mare was covered more than once, enter the first and last dates. The result updates as you type.</Hint>
      <Output
        result={result}
        render={(d) => {
          const dp = today ? daysPregnant(d.last, today) : null;
          return (
            <ResultCard
              label="Expected foaling"
              headline={formatRange(d.average)}
              sub={`Average gestation ${AVERAGE.low}–${AVERAGE.high} days · normal range ${formatRange(d.normal)}`}
              rows={[
                [`Average window (${AVERAGE.low}–${AVERAGE.high} days)`, formatRange(d.average)],
                [`Normal range (${RANGE.low}–${RANGE.high} days)`, formatRange(d.normal)],
                [`Premature if born before (${PREMATURE_BEFORE} days)`, formatDate(d.prematureBefore)],
                ["11 months after the last breeding (common breeder rule)", formatDate(d.elevenMonths)],
                ...(dp !== null && dp >= 0 && dp <= 400 ? ([["Days since last breeding (today)", `${dp} days`]] as const) : []),
              ]}
              limits="Whether the mare is pregnant, or when she will actually foal — individual mares vary, and day length, season, foal sex and nutrition all shift it. Only an ultrasound or a veterinary exam confirms pregnancy; watch for foaling signs and talk to your vet as the date nears, especially past 365 days."
              method={
                <p>
                  Method: breeding date + days. Figures from University of Nebraska–Lincoln Extension NebGuide G1874,{" "}
                  <a className="underline" href={UNL_G1874_URL}>
                    The Foaling Mare
                  </a>{" "}
                  (2008): average 335–340 days, range 320–370, premature under 326 days, foaling often estimated at 11 months. Retrieved {HORSE_RETRIEVED}.
                </p>
              }
            />
          );
        }}
      />
    </div>
  );
}
