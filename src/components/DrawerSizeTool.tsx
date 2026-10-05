"use client";

import { useState, useId } from "react";
import { ACCURIDE_URL, BLUM_SIDE_DEDUCTIONS, BLUM_URL, calculateDrawerSize, toFraction, type DrawerResult, type Slide } from "@/lib/drawer-size";
import { isToolError } from "@/lib/errors";

/** Recomputed as inputs change. No loading state. */

const both = (mm: number) => `${toFraction(mm)} (${mm.toLocaleString("en-US", { maximumFractionDigits: 1 })} mm)`;

function ResultCard({ data, slide }: { data: DrawerResult; slide: Slide }) {
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">Drawer box</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">{both(data.outsideWidthMm)} wide outside</p>
        <p className="mt-1 text-[var(--color-muted)]">
          {data.insideWidthMm !== null && `Inside width ${both(data.insideWidthMm)}. `}
          {data.heightMm !== null ? `${slide === "blum-563h" ? "Maximum height" : "Height"} ${both(data.heightMm)}. ` : ""}
          {data.lengthMm !== null && `Length ${both(data.lengthMm)}${data.slideLengthLabel ? ` for a ${data.slideLengthLabel}` : ""}.`}
        </p>
      </div>
      <div className="p-5 text-sm">
        {data.depthTooShallow && (
          <p className="mb-3 rounded-md border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-3">
            The inside depth is shorter than the shortest {slide === "blum-563h" ? "runner's minimum cabinet depth in Blum's table (328 mm for a 12 in runner)" : "3832EC slide (14 in)"}.
          </p>
        )}
        {data.widthExceedsSlide && (
          <p className="mb-3 rounded-md border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-3">
            Accuride notes the drawer width should not exceed the slide length; this drawer is wider than its slide.
          </p>
        )}
        {data.belowMinHeight && (
          <p className="mb-3 rounded-md border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-3">
            Accuride lists a minimum drawer height of 1-7/8 in for the 3832EC.
          </p>
        )}
        <h3 className="mb-2 font-semibold tracking-wide uppercase">The rule used</h3>
        <p className="mb-5 text-[var(--color-muted)]">{data.rule}</p>
        <h3 className="mb-2 font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
        <p className="text-[var(--color-muted)]">
          Every slide model has its own clearances; these are for the two models named, from their makers&rsquo; sheets.
          Measure the opening at several points — a cabinet out of square changes the answer. Check your slide&rsquo;s own
          instructions before cutting.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>Sources: Blum TANDEM 563H specification sheet; Accuride 3832EC quick reference. Retrieved {data.retrievedAt}.</p>
          <p className="mt-1">
            <a href={BLUM_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              Blum 563H (PDF)
            </a>{" "}
            ·{" "}
            <a href={ACCURIDE_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              Accuride 3832EC (PDF)
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function DrawerSizeTool() {
  const [slide, setSlide] = useState<Slide>("blum-563h");
  const [unit, setUnit] = useState<"in" | "mm">("in");
  const [w, setW] = useState("21");
  const [h, setH] = useState("6");
  const [d, setD] = useState("22.5");
  const [blumSide, setBlumSide] = useState("16");
  const [clear, setClear] = useState("");
  const [vert, setVert] = useState("");
  const [side, setSide] = useState("");
  const ids = { s: useId(), u: useId(), w: useId(), h: useId(), d: useId(), b: useId(), c: useId(), v: useId(), t: useId() };
  const num = (x: string) => (x.trim() === "" ? NaN : Number(x));
  const opt = (x: string) => (x.trim() === "" ? null : Number(x));

  let data: DrawerResult | null = null;
  let error: string | null = null;
  try {
    data = calculateDrawerSize({
      slide,
      unit,
      openingWidth: num(w),
      openingHeight: num(h),
      insideDepth: opt(d),
      blumSideMm: Number(blumSide),
      customWidthClearance: opt(clear),
      verticalClearance: opt(vert),
      sideThickness: opt(side),
    });
  } catch (e) {
    error = isToolError(e) ? e.message : "That input could not be used.";
  }
  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";
  const inp = (id: string, v: string, set: (s: string) => void) => (
    <input id={id} type="number" inputMode="decimal" min="0" step="any" value={v} onChange={(e) => set(e.target.value)} className={field} />
  );
  const lbl = (id: string, text: string, optional = false) => (
    <label htmlFor={id} className="mb-1.5 block font-medium">
      {text} {optional && <span className="font-normal text-[var(--color-muted)]">(optional)</span>}
    </label>
  );

  return (
    <div>
      <div className="mb-2 grid gap-3 sm:grid-cols-2">
        <div>
          {lbl(ids.s, "Drawer slide")}
          <select id={ids.s} value={slide} onChange={(e) => setSlide(e.target.value as Slide)} className={field}>
            <option value="blum-563h">Blum TANDEM 563H (undermount)</option>
            <option value="accuride-3832ec">Accuride 3832EC (side mount)</option>
            <option value="custom">Other slide — enter its clearance</option>
          </select>
        </div>
        <div>
          {lbl(ids.u, "Units")}
          <select id={ids.u} value={unit} onChange={(e) => setUnit(e.target.value as "in" | "mm")} className={field}>
            <option value="in">inches (decimal)</option>
            <option value="mm">millimetres</option>
          </select>
        </div>
        <div>
          {lbl(ids.w, "Opening width")}
          {inp(ids.w, w, setW)}
        </div>
        <div>
          {lbl(ids.h, "Opening height")}
          {inp(ids.h, h, setH)}
        </div>
        <div>
          {lbl(ids.d, "Inside cabinet depth", true)}
          {inp(ids.d, d, setD)}
        </div>
        {slide === "blum-563h" ? (
          <div>
            {lbl(ids.b, "Drawer side thickness")}
            <select id={ids.b} value={blumSide} onChange={(e) => setBlumSide(e.target.value)} className={field}>
              {BLUM_SIDE_DEDUCTIONS.map((s) => (
                <option key={s.sideMm} value={s.sideMm}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <>
            {slide === "custom" && (
              <div>
                {lbl(ids.c, `Total width clearance, both sides (${unit})`)}
                {inp(ids.c, clear, setClear)}
              </div>
            )}
            <div>
              {lbl(ids.t, `Drawer side thickness (${unit})`, true)}
              {inp(ids.t, side, setSide)}
            </div>
            <div>
              {lbl(ids.v, `Top + bottom clearance (${unit})`, true)}
              {inp(ids.v, vert, setVert)}
            </div>
          </>
        )}
      </div>
      <p className="mb-6 text-xs text-[var(--color-muted)]">The answer updates as you type; nothing is sent anywhere.</p>
      <div aria-live="polite">
        {error ? (
          <div className="rounded-lg border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-5">
            <p className="font-medium">That input could not be used</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{error}</p>
          </div>
        ) : (
          data && <ResultCard data={data} slide={slide} />
        )}
      </div>
    </div>
  );
}
