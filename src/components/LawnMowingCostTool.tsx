"use client";

import { useState } from "react";
import { mowingCost, HANNA_URL, MOW_RETRIEVED } from "@/lib/lawn-mowing-cost";
import { NumField, Grid, Hint, ResultCard, Output, attempt, num, fmt, money } from "./CalcBits";

export default function LawnMowingCostTool() {
  const [area, setArea] = useState("8000");
  const [deck, setDeck] = useState("21");
  const [speed, setSpeed] = useState("3");
  const [eff, setEff] = useState("70");
  const [extra, setExtra] = useState("15");
  const [travel, setTravel] = useState("10");
  const [rate, setRate] = useState("45");
  const [fuel, setFuel] = useState("2");
  const [other, setOther] = useState("1");
  const [markup, setMarkup] = useState("20");
  const [visits, setVisits] = useState("4");

  const result = attempt(() =>
    mowingCost({
      areaSqFt: num(area),
      deckIn: num(deck),
      speedMph: num(speed),
      efficiencyPct: num(eff),
      extraMin: num(extra),
      travelMin: num(travel),
      hourlyRate: num(rate),
      fuelPerVisit: num(fuel),
      otherPerVisit: num(other),
      markupPct: num(markup),
      visitsPerMonth: num(visits),
    }),
  );

  return (
    <div>
      <Grid cols={4}>
        <NumField label="Lawn area (ft²)" value={area} onChange={setArea} hint="Grass only; 1 acre = 43,560 ft²." />
        <NumField label="Mower deck width (in)" value={deck} onChange={setDeck} />
        <NumField label="Mowing speed (mph)" value={speed} onChange={setSpeed} />
        <NumField label="Field efficiency (%)" value={eff} onChange={setEff} hint="Share of time actually cutting, after turns and overlap." />
      </Grid>
      <Grid cols={4}>
        <NumField label="Trim, edge, blow (min)" value={extra} onChange={setExtra} />
        <NumField label="Travel to the job (min)" value={travel} onChange={setTravel} />
        <NumField label="Labour rate ($/hour)" value={rate} onChange={setRate} />
        <NumField label="Fuel per visit ($)" value={fuel} onChange={setFuel} />
      </Grid>
      <Grid cols={3}>
        <NumField label="Other costs per visit ($)" value={other} onChange={setOther} hint="Equipment wear, insurance share, dump fees." />
        <NumField label="Markup (%)" value={markup} onChange={setMarkup} />
        <NumField label="Visits per month" value={visits} onChange={setVisits} />
      </Grid>
      <Hint>Every rate here is yours; the starting numbers are only an example. The result updates as you type.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label="Price per mow"
            headline={money(d.price)}
            sub={`${fmt(d.totalMinutes, 0)} minutes on the job · ${money(d.perMonth)} a month at ${visits} visits · ${money(d.per1000SqFt)} per 1,000 ft²`}
            rows={[
              ["Lawn", `${fmt(d.acres, 3)} acres`],
              ["Mowing rate", `${fmt(d.acresPerHour, 3)} acres per hour`],
              ["Mowing time", `${fmt(d.mowMinutes, 1)} min`],
              ["Total time incl. trimming and travel", `${fmt(d.totalMinutes, 1)} min`],
              ["Labour", money(d.labour)],
              ["Cost before markup", money(d.cost)],
            ]}
            limits="What the local market charges, or how long a particular yard really takes with slopes, gates, obstacles and wet grass. Time your own crew on a few yards and adjust the efficiency until the estimate matches."
            method={
              <p>
                Method: acres per hour = deck width (ft) × speed (mph) × efficiency ÷ 8.25 (43,560 ft² per acre ÷ 5,280 ft per mile). Theoretical capacity
                is &ldquo;swath width times field travel speed&rdquo; and field efficiency is useful work versus the work theoretically possible — Mark Hanna,
                Iowa State University,{" "}
                <a className="underline" href={HANNA_URL}>
                  Farm field equipment: efficiency versus capacity
                </a>
                . Retrieved {MOW_RETRIEVED}.
              </p>
            }
          />
        )}
      />
    </div>
  );
}
