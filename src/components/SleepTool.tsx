"use client";

import { useState } from "react";
import { DataTable, Grid, Hint, NumField, ResultCard, Output, SelectField, TextField, attempt, num } from "./CalcBits";
import { Ext } from "./GeoBits";
import { CDC_SLEEP_URL, NINDS_SLEEP_URL, hm, sleepTimes } from "@/lib/time-calc";
import { fmt12 } from "@/lib/date-calc";

export default function SleepTool() {
  const [mode, setMode] = useState<"wake" | "bed">("wake");
  const [time, setTime] = useState("6:30 AM");
  const [fall, setFall] = useState("15");
  const [cycle, setCycle] = useState("90");
  const result = attempt(() => sleepTimes(mode, time, num(fall), num(cycle)));

  return (
    <div>
      <Grid cols={2}>
        <SelectField label="I want to" value={mode} onChange={setMode} options={[["wake", "Wake up at a set time"], ["bed", "Go to bed at a set time"]]} />
        <TextField label={mode === "wake" ? "Wake-up time" : "Bedtime"} value={time} onChange={setTime} hint="6:30 AM, 22:45 or 11pm" />
      </Grid>
      <Grid cols={2}>
        <NumField label="Minutes to fall asleep" value={fall} onChange={setFall} hint="Your own usual time." />
        <NumField label="Cycle length (minutes)" value={cycle} onChange={setCycle} hint="About 90 for most adults." />
      </Grid>
      <Hint>Times land at the end of a whole sleep cycle, after the minutes it takes you to fall asleep.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label={mode === "wake" ? `To wake at ${time}, go to sleep at` : `Going to bed at ${time}, wake at`}
            headline={`${fmt12(d[0].clock)} or ${fmt12(d[1].clock)}`}
            sub={`${d[0].cycles} cycles (${hm(d[0].minutes)}) or ${d[1].cycles} cycles (${hm(d[1].minutes)}) of sleep`}
            limits="Cycle length varies from person to person and through the night, so these times are a rough guide. This page cannot assess sleep problems; persistent trouble sleeping or daytime sleepiness is something to raise with a doctor."
            method={
              <p>
                Method: {mode === "wake" ? "wake time − cycles × cycle length − time to fall asleep" : "bedtime + time to fall asleep + cycles × cycle length"}. NINDS: REM sleep first occurs about 90 minutes after falling asleep (
                <Ext href={NINDS_SLEEP_URL}>Brain Basics: Understanding Sleep</Ext>). CDC lists 7 or more hours for adults 18–60 (<Ext href={CDC_SLEEP_URL}>About Sleep</Ext>). Retrieved 2026-10-24.
              </p>
            }
          >
            <DataTable
              head={[mode === "wake" ? "Go to sleep at" : "Wake up at", "Cycles", "Sleep"]}
              rows={d.map((o) => [fmt12(o.clock), o.cycles, hm(o.minutes) + (o.minutes >= 420 ? " ✓ 7 h or more" : "")])}
            />
          </ResultCard>
        )}
      />
    </div>
  );
}
