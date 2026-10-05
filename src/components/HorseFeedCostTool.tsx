"use client";

import { useState, useId } from "react";
import { calculateFeedCost, forageGuideline, MERCK_URL, type FeedCostResult } from "@/lib/horse-feed-cost";
import { isToolError } from "@/lib/errors";

/** Recomputed as inputs change. No loading state. */

const n = (x: number, d = 1) => x.toLocaleString("en-US", { maximumFractionDigits: d });
const usd = (x: number) => x.toLocaleString("en-US", { style: "currency", currency: "USD" });

function ResultCard({ data, horses }: { data: FeedCostResult; horses: number }) {
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">Feed cost per horse</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {usd(data.perHorseMonth)} a month · {usd(data.perHorseYear)} a year
        </p>
        <p className="mt-1 text-[var(--color-muted)]">
          {usd(data.perHorseDay)} a day: hay {usd(data.hayPerDay)}, concentrate {usd(data.concPerDay)}, other {usd(data.otherPerDay)}.
          {horses > 1 && ` For ${horses} horses: ${usd(data.totalMonth)} a month, ${usd(data.totalYear)} a year.`}
        </p>
      </div>
      <div className="p-5 text-sm">
        <p className="mb-5 text-[var(--color-muted)]">
          That uses about {n(data.balesPerMonth)} bales of hay a month
          {data.bagsPerMonth !== null ? ` and ${n(data.bagsPerMonth)} bags of concentrate` : ""}
          {horses > 1 ? " for all the horses" : ""}.
        </p>
        <h3 className="mb-2 font-semibold tracking-wide uppercase">The arithmetic</h3>
        <p className="mb-5 text-[var(--color-muted)]">
          Hay per day × (bale price ÷ bale weight) + concentrate per day × (bag price ÷ bag weight) + other monthly costs ÷ 30.44. A
          month is 365.25 ÷ 12 days.
        </p>
        <h3 className="mb-2 font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
        <p className="text-[var(--color-muted)]">
          It has no feed prices — they are yours. It leaves out board, pasture rent, farrier, vet and bedding unless you add them under
          other costs, and wasted hay adds to the real amount used.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>Forage guideline: Merck Veterinary Manual (Feb 2026). Retrieved {data.retrievedAt}.</p>
          <p className="mt-1">
            <a href={MERCK_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              Merck Veterinary Manual — Nutritional Requirements of Horses
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function HorseFeedCostTool() {
  const [horses, setHorses] = useState("1");
  const [hay, setHay] = useState("20");
  const [bale, setBale] = useState("12");
  const [baleLb, setBaleLb] = useState("50");
  const [conc, setConc] = useState("4");
  const [bag, setBag] = useState("28");
  const [bagLb, setBagLb] = useState("50");
  const [other, setOther] = useState("30");
  const [w, setW] = useState("1100");
  const [dm, setDm] = useState("");
  const ids = { h: useId(), y: useId(), b: useId(), bl: useId(), c: useId(), g: useId(), gl: useId(), o: useId(), w: useId(), d: useId() };
  const z = (x: string) => (x.trim() === "" ? 0 : Number(x));
  const o = (x: string) => (x.trim() === "" ? null : Number(x));

  let data: FeedCostResult | null = null;
  let error: string | null = null;
  try {
    data = calculateFeedCost({
      horses: horses.trim() === "" ? NaN : Number(horses),
      hayLbPerDay: z(hay),
      balePrice: z(bale),
      baleLb: z(baleLb),
      concLbPerDay: z(conc),
      bagPrice: o(bag),
      bagLb: o(bagLb),
      otherPerMonth: z(other),
    });
  } catch (e) {
    error = isToolError(e) ? e.message : "That input could not be used.";
  }
  let guide: ReturnType<typeof forageGuideline> | null = null;
  let guideErr: string | null = null;
  try {
    if (w.trim() !== "") guide = forageGuideline(Number(w), "lb", o(dm));
  } catch (e) {
    guideErr = isToolError(e) ? e.message : null;
  }

  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";
  const inp = (id: string, v: string, set: (s: string) => void, step = "any") => (
    <input id={id} type="number" inputMode="decimal" min="0" step={step} value={v} onChange={(e) => set(e.target.value)} className={field} />
  );
  const lbl = (id: string, text: string) => (
    <label htmlFor={id} className="mb-1.5 block font-medium">
      {text}
    </label>
  );

  return (
    <div>
      <div className="mb-3 grid gap-3 sm:grid-cols-2">
        <div>
          {lbl(ids.h, "Number of horses")}
          {inp(ids.h, horses, setHorses, "1")}
        </div>
        <div>
          {lbl(ids.o, "Other costs per horse per month ($)")}
          {inp(ids.o, other, setOther)}
        </div>
        <div>
          {lbl(ids.y, "Hay per horse per day (lb)")}
          {inp(ids.y, hay, setHay)}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            {lbl(ids.b, "Bale price ($)")}
            {inp(ids.b, bale, setBale)}
          </div>
          <div>
            {lbl(ids.bl, "Bale weight (lb)")}
            {inp(ids.bl, baleLb, setBaleLb)}
          </div>
        </div>
        <div>
          {lbl(ids.c, "Grain / concentrate per horse per day (lb)")}
          {inp(ids.c, conc, setConc)}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            {lbl(ids.g, "Bag price ($)")}
            {inp(ids.g, bag, setBag)}
          </div>
          <div>
            {lbl(ids.gl, "Bag weight (lb)")}
            {inp(ids.gl, bagLb, setBagLb)}
          </div>
        </div>
      </div>
      <details className="mb-3 rounded-md border border-[var(--color-line)] p-3 text-sm">
        <summary className="cursor-pointer font-medium">Not sure how much hay? Merck&rsquo;s forage guideline</summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            {lbl(ids.w, "Horse weight (lb)")}
            {inp(ids.w, w, setW)}
          </div>
          <div>
            {lbl(ids.d, "Hay dry matter % from a hay test (optional)")}
            {inp(ids.d, dm, setDm)}
          </div>
        </div>
        <p className="mt-2 text-[var(--color-muted)]">
          {guideErr
            ? guideErr
            : guide &&
              `At least 1.5–2% of body weight in forage dry matter: ${n(guide.dmLow)}–${n(guide.dmHigh)} lb of dry matter a day${
                guide.asFed ? `, or ${n(guide.asFed.low)}–${n(guide.asFed.high)} lb of this hay as fed` : "; add your hay's dry matter % to convert to pounds as fed"
              }.`}
        </p>
      </details>
      <p className="mb-6 text-xs text-[var(--color-muted)]">The answer updates as you type; nothing is sent anywhere.</p>
      <div aria-live="polite">
        {error ? (
          <div className="rounded-lg border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-5">
            <p className="font-medium">That input could not be used</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{error}</p>
          </div>
        ) : (
          data && <ResultCard data={data} horses={Number(horses)} />
        )}
      </div>
    </div>
  );
}
