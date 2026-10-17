"use client";

import { useState } from "react";
import { timeLapse } from "@/lib/time-lapse";
import { NumField, SelectField, Grid, Hint, ResultCard, Output, attempt, num, optNum, fmt } from "./CalcBits";

const hms = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s - h * 3600 - m * 60;
  return [h ? `${h} h` : "", m ? `${m} min` : "", sec ? `${fmt(sec, 1)} s` : ""].filter(Boolean).join(" ") || "0 s";
};

export default function TimeLapseTool() {
  const [mode, setMode] = useState<"interval" | "target">("interval");
  const [h, setH] = useState("2");
  const [m, setM] = useState("0");
  const [interval, setIntervalSec] = useState("5");
  const [target, setTarget] = useState("30");
  const [fps, setFps] = useState("24");
  const [mb, setMb] = useState("");
  const duration = num(h) * 3600 + num(m) * 60;

  const result = attempt(() => timeLapse({ mode, durationSec: duration, intervalSec: num(interval), targetClipSec: num(target), fps: num(fps), mbPerFrame: optNum(mb) }));

  return (
    <div>
      <Grid cols={3}>
        <SelectField label="I know" value={mode} onChange={setMode} options={[["interval", "The interval → clip length"], ["target", "The clip length I want → interval"]]} />
        <NumField label="Shooting time: hours" value={h} onChange={setH} />
        <NumField label="+ minutes" value={m} onChange={setM} />
      </Grid>
      <Grid cols={3}>
        {mode === "interval" ? <NumField label="Interval between shots (s)" value={interval} onChange={setIntervalSec} /> : <NumField label="Clip length wanted (s)" value={target} onChange={setTarget} />}
        <NumField label="Playback frame rate (fps)" value={fps} onChange={setFps} />
        <NumField label="File size per photo, MB (optional)" value={mb} onChange={setMb} />
      </Grid>
      <Hint>The result updates as you type.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label={mode === "interval" ? "Finished clip" : "Interval to set"}
            headline={mode === "interval" ? hms(d.clipSec) : `${fmt(d.intervalSec, 2)} seconds between shots`}
            sub={`${d.frames.toLocaleString("en-US")} photos · ${fmt(d.speedUp, 0)}× faster than real time${d.storageGb !== null ? ` · about ${fmt(d.storageGb, 1)} GB` : ""}`}
            rows={[
              ["Shooting time", hms(duration)],
              ["Interval", `${fmt(d.intervalSec, 2)} s`],
              ["Photos (frames)", d.frames.toLocaleString("en-US")],
              ["Clip length", `${hms(d.clipSec)} at ${fps} fps`],
              ["Speed-up", `${fmt(d.speedUp, 1)}× (interval × fps)`],
            ]}
            limits="Whether your battery, memory card or shutter will last the shoot, or what interval suits the subject. Exposure time must be shorter than the interval, and some cameras need extra time to write each file."
            method={<p>Method: photos = shooting time ÷ interval (whole photos); clip = photos ÷ fps; speed-up = interval × fps; storage = photos × MB per photo. Plain arithmetic in your browser.</p>}
          />
        )}
      />
    </div>
  );
}
