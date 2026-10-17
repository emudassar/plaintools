"use client";

import { useState } from "react";
import { balusterSpacing, LIMITS, IRC_CH3_URL, BALUSTER_RETRIEVED } from "@/lib/baluster-spacing";
import { feetInches } from "@/lib/rafter-length";
import { NumField, SelectField, Grid, Hint, ResultCard, Output, attempt, num, optNum, fmt } from "./CalcBits";

type LimitKey = keyof typeof LIMITS | "custom";

export default function BalusterSpacingTool() {
  const [span, setSpan] = useState("70.5");
  const [w, setW] = useState("1.5");
  const [lim, setLim] = useState<LimitKey>("guard");
  const [custom, setCustom] = useState("3.5");
  const [count, setCount] = useState("");
  const [sections, setSections] = useState("1");
  const limitIn = lim === "custom" ? num(custom) : LIMITS[lim].inches;

  const result = attempt(() => balusterSpacing({ spanIn: num(span), widthIn: num(w), limitIn, count: optNum(count), sections: num(sections) }));
  const inch = (x: number) => (x < 12 ? `${fmt(x, 3)} in` : `${fmt(x, 3)} in (${feetInches(x / 12)})`);

  return (
    <div>
      <Grid cols={3}>
        <NumField label="Clear space between posts (in)" value={span} onChange={setSpan} hint="Inside face to inside face." />
        <NumField label="Baluster width (in)" value={w} onChange={setW} hint="At its narrowest point for turned spindles." />
        <SelectField
          label="Opening limit"
          value={lim}
          onChange={setLim}
          options={[["guard", LIMITS.guard.label], ["stair", LIMITS.stair.label], ["custom", "Custom (local code or design)"]]}
        />
      </Grid>
      <Grid cols={3}>
        {lim === "custom" && <NumField label="Maximum opening (in)" value={custom} onChange={setCustom} />}
        <NumField label="Number of balusters (optional)" value={count} onChange={setCount} step="1" hint="Leave blank for the fewest that meet the limit." />
        <NumField label="Identical sections" value={sections} onChange={setSections} step="1" />
      </Grid>
      <Hint>The result updates as you type.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label="Baluster spacing"
            headline={`${d.count} balusters, ${fmt(d.gap, 3)} in gaps`}
            sub={`${fmt(d.onCenter, 3)} in on centre · ${d.meetsLimit ? `under the ${fmt(limitIn, 3)} in limit` : `NOT under the ${fmt(limitIn, 3)} in limit — at least ${d.minCount} needed`} · ${d.totalBalusters} for ${sections} section${num(sections) === 1 ? "" : "s"}`}
            rows={[
              ["Fewest balusters with every gap under the limit", String(d.minCount)],
              ["Equal gap (post to baluster and between)", `${fmt(d.gap, 4)} in`],
              ["On-centre spacing", `${fmt(d.onCenter, 4)} in`],
            ]}
            limits="Whether your guard is required, how tall it must be, or whether the posts and rails are strong enough — those are separate code sections. The sphere test applies at the largest opening, which for turned spindles is where they are slimmest — that is why the width asked for is the narrowest point. Local codes can differ from the IRC; check yours."
            method={
              <p>
                Method: gap = (span − n × width) ÷ (n + 1); fewest n with gap below the limit. Limit:{" "}
                <a className="underline" href={IRC_CH3_URL}>
                  IRC 2021 R312.1.3
                </a>{" "}
                — openings must not &ldquo;allow passage of a sphere 4 inches (102 mm) in diameter&rdquo;; 4-3/8 in on the open side of stairs. Retrieved{" "}
                {BALUSTER_RETRIEVED}.
              </p>
            }
          >
            <p className="mb-2 font-medium">Centre of each baluster, measured from the left post</p>
            <p className="mb-5 font-mono text-xs leading-6">{d.centers.map((c, k) => `${k + 1}: ${inch(c)}`).join("   ")}</p>
          </ResultCard>
        )}
      />
    </div>
  );
}
