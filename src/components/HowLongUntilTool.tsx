"use client";

import { useEffect, useState } from "react";
import { TextField, Grid, Hint, ResultCard, ErrorBox, fmt } from "./CalcBits";
import { useMounted } from "./ToolBits";
import { fmt12, fmt24, parseClock, splitMs } from "@/lib/date-calc";
import { isToolError } from "@/lib/errors";

const QUICK = ["9am", "12pm", "3pm", "5pm", "6pm", "11:59pm", "12am"];

/** Live countdown to the next occurrence of a clock time in the visitor's own time zone. */
export default function HowLongUntilTool() {
  const mounted = useMounted();
  const [time, setTime] = useState("3pm");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  let error: string | null = null;
  let target: Date | null = null;
  let minutes = 0;
  try {
    minutes = parseClock(time);
    const d = new Date(now);
    const t = new Date(d.getFullYear(), d.getMonth(), d.getDate(), Math.floor(minutes / 60), minutes % 60, 0, 0);
    if (t.getTime() <= now) t.setDate(t.getDate() + 1);
    target = t;
  } catch (e) {
    error = isToolError(e) ? e.message : "That time could not be read.";
  }

  const zone = mounted ? Intl.DateTimeFormat().resolvedOptions().timeZone : "";
  const left = target ? splitMs(target.getTime() - now) : null;
  const totalMin = target ? (target.getTime() - now) / 60000 : 0;
  const tomorrow = target ? target.getDate() !== new Date(now).getDate() : false;

  return (
    <div>
      <Grid cols={2}>
        <TextField label="Time to count down to" value={time} onChange={setTime} hint="For example 3pm, 3:30 PM, 15:30 or 1530." />
      </Grid>
      <div className="mb-4 flex flex-wrap gap-2">
        {QUICK.map((q) => (
          <button key={q} type="button" onClick={() => setTime(q)} className="rounded-md border border-[var(--color-line)] bg-white px-3 py-1.5 text-sm">
            {q}
          </button>
        ))}
      </div>
      <Hint>Counts to the next time the clock shows that time on this device. The countdown ticks every second.</Hint>
      <div aria-live="polite">
        {error ? (
          <ErrorBox message={error} />
        ) : !mounted || !target || !left ? (
          <p className="text-sm text-[var(--color-muted)]">Reading your device clock…</p>
        ) : (
          <ResultCard
            label={`Time until ${fmt12(minutes)}${tomorrow ? " tomorrow" : " today"}`}
            headline={`${left.days ? `${left.days} d ` : ""}${left.hours} h ${String(left.minutes).padStart(2, "0")} min ${String(left.seconds).padStart(2, "0")} s`}
            sub={`${fmt(totalMin / 60, 2)} hours · ${fmt(totalMin, 0)} minutes · ${Math.floor((target.getTime() - now) / 1000).toLocaleString("en-US")} seconds`}
            rows={[
              ["Target", `${target.toLocaleString("en-US", { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" })} (${fmt24(minutes)})`],
              ["Now", new Date(now).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit" })],
              ["Time zone", zone || "device setting"],
            ]}
            limits="The countdown uses this device's clock and time zone. If the clock is wrong, so is the countdown. On a daylight-saving change night the count includes the hour the clocks skip or repeat."
            method={<p>Method: next calendar time at or after now in your device&apos;s time zone, minus the current time. Nothing is sent anywhere.</p>}
          />
        )}
      </div>
    </div>
  );
}
