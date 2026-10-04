"use client";

import { useState, useId } from "react";
import {
  calculateTreeLights,
  CPSC_MAX_INCANDESCENT_SETS,
  CPSC_URL,
  GOVEE_URL,
  LOOKS,
  MAHONEYS_URL,
  type Look,
  type TreeLightsResult,
} from "@/lib/christmas-tree-lights";
import { asToolError, type ErrorKind } from "@/lib/errors";

/** idle / error / result. Arithmetic in the browser — no loading state. */

type State =
  | { phase: "idle" }
  | { phase: "error"; kind: ErrorKind; message: string }
  | { phase: "result"; data: TreeLightsResult };

const n = (x: number, d = 0) =>
  x.toLocaleString("en-US", { maximumFractionDigits: d });

function ResultCard({ data }: { data: TreeLightsResult }) {
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          Lights for a {n(data.heightFt, 1)} ft tree at {n(data.perFoot)} per
          foot
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {n(data.lights)} lights · {data.sets} set{data.sets === 1 ? "" : "s"}
        </p>
        <p className="mt-1 text-[var(--color-muted)]">
          {data.sets} sets give you {n(data.lightsBought)} lights
          {data.totalLengthFt !== null
            ? ` and ${n(data.totalLengthFt, 1)} ft of lit string`
            : ""}
          .
        </p>
      </div>
      <div className="p-5">
        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          The arithmetic
        </h3>
        <div className="mb-5 rounded-md border border-[var(--color-line)] p-4 text-sm text-[var(--color-muted)]">
          <p>
            {n(data.heightFt, 2)} ft × {n(data.perFoot)} lights per foot ={" "}
            {n(data.lights)} lights (rounded up)
          </p>
          <p className="mt-2">
            {n(data.lights)} ÷ {n(data.lightsBought / data.sets)} per set ={" "}
            <strong className="font-medium text-[var(--color-fg)]">
              {data.sets} sets
            </strong>{" "}
            (rounded up)
          </p>
        </div>
        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          Connecting the sets
        </h3>
        <p className="mb-5 text-sm text-[var(--color-muted)]">
          {data.incandescentRuns !== null ? (
            <>
              The U.S. Consumer Product Safety Commission says: &ldquo;Never
              string together more than three sets of incandescent
              lights.&rdquo; {data.sets} incandescent sets therefore make at
              least{" "}
              <strong className="text-[var(--color-fg)]">
                {data.incandescentRuns} separate run
                {data.incandescentRuns === 1 ? "" : "s"}
              </strong>{" "}
              of no more than {CPSC_MAX_INCANDESCENT_SETS} sets each. The
              set&rsquo;s own label may allow fewer.
            </>
          ) : (
            <>
              LED sets print their own limit on the label or tag (&ldquo;connect
              no more than … sets end to end&rdquo;). That number, not this
              page, decides how many of your {data.sets} sets can be joined.
            </>
          )}
        </p>
        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          What this page cannot tell you
        </h3>
        <p className="text-sm text-[var(--color-muted)]">
          Lights per foot of height is a decorating rule of thumb, not a
          standard. A wide or very full tree takes more lights than a slim
          one of the same height, and bulb spacing on the wire changes how
          dense they look. Treat the count as a starting point for buying, not
          an exact need.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Sources: lights-per-foot rule of thumb as published by Mahoney&rsquo;s
            Garden Center (75 / 100 / 125 per foot) and Govee (100 per foot);
            connection limit from the U.S. CPSC Holiday Safety page. Retrieved{" "}
            {data.retrievedAt}.
          </p>
          <p className="mt-1 flex flex-wrap gap-x-3">
            <a href={MAHONEYS_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              Mahoney&rsquo;s: decorating by the numbers
            </a>
            <a href={GOVEE_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              Govee: lights for a 7-foot tree
            </a>
            <a href={CPSC_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              CPSC: holiday safety
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function ChristmasTreeLightsTool() {
  const [height, setHeight] = useState("7");
  const [heightUnit, setHeightUnit] = useState<"ft" | "m">("ft");
  const [look, setLook] = useState<Look | "custom">("classic");
  const [custom, setCustom] = useState("100");
  const [perSet, setPerSet] = useState("100");
  const [setLength, setSetLength] = useState("");
  const [bulbType, setBulbType] = useState<"incandescent" | "led">("led");
  const [state, setState] = useState<State>({ phase: "idle" });
  const ids = { h: useId(), look: useId(), custom: useId(), set: useId(), len: useId(), bulb: useId() };
  const num = (x: string) => (x.trim() === "" ? NaN : Number(x));

  function run(e: React.FormEvent) {
    e.preventDefault();
    try {
      setState({
        phase: "result",
        data: calculateTreeLights({
          height: num(height),
          heightUnit,
          perFoot: look === "custom" ? num(custom) : LOOKS[look].perFoot,
          lightsPerSet: num(perSet),
          setLengthFt: setLength.trim() === "" ? null : num(setLength),
          bulbType,
        }),
      });
    } catch (err) {
      const e2 = asToolError(err);
      setState({ phase: "error", kind: e2.kind, message: e2.message });
    }
  }

  const field =
    "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";

  return (
    <div>
      <form onSubmit={run} className="mb-6">
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={ids.h} className="mb-1.5 block font-medium">
              Tree height
            </label>
            <div className="flex gap-2">
              <input id={ids.h} type="number" inputMode="decimal" min="0" step="any" value={height} onChange={(e) => setHeight(e.target.value)} className={field} />
              <select aria-label="Height unit" value={heightUnit} onChange={(e) => setHeightUnit(e.target.value as "ft" | "m")} className="rounded-md border border-[var(--color-line)] bg-white px-2">
                <option value="ft">feet</option>
                <option value="m">metres</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor={ids.look} className="mb-1.5 block font-medium">
              Look
            </label>
            <select id={ids.look} value={look} onChange={(e) => setLook(e.target.value as Look | "custom")} className={field}>
              {(Object.keys(LOOKS) as Look[]).map((k) => (
                <option key={k} value={k}>
                  {LOOKS[k].label} — {LOOKS[k].perFoot} lights per foot
                </option>
              ))}
              <option value="custom">My own lights per foot</option>
            </select>
          </div>
          {look === "custom" && (
            <div>
              <label htmlFor={ids.custom} className="mb-1.5 block font-medium">
                Lights per foot of height
              </label>
              <input id={ids.custom} type="number" inputMode="decimal" min="0" step="any" value={custom} onChange={(e) => setCustom(e.target.value)} className={field} />
            </div>
          )}
          <div>
            <label htmlFor={ids.set} className="mb-1.5 block font-medium">
              Lights per set (on the box)
            </label>
            <input id={ids.set} type="number" inputMode="numeric" min="1" step="1" value={perSet} onChange={(e) => setPerSet(e.target.value)} className={field} />
          </div>
          <div>
            <label htmlFor={ids.len} className="mb-1.5 block font-medium">
              Lit length of one set, ft (optional)
            </label>
            <input id={ids.len} type="number" inputMode="decimal" min="0" step="any" value={setLength} placeholder="e.g. from the box" onChange={(e) => setSetLength(e.target.value)} className={field} />
          </div>
          <div>
            <label htmlFor={ids.bulb} className="mb-1.5 block font-medium">
              Bulb type
            </label>
            <select id={ids.bulb} value={bulbType} onChange={(e) => setBulbType(e.target.value as "incandescent" | "led")} className={field}>
              <option value="led">LED</option>
              <option value="incandescent">Incandescent</option>
            </select>
          </div>
        </div>
        <button type="submit" className="rounded-md bg-[var(--color-accent)] px-5 py-2.5 font-medium text-white">
          Calculate lights
        </button>
        <p className="mt-1.5 text-xs text-[var(--color-muted)]">
          Runs entirely in your browser. Nothing you enter is sent anywhere or
          stored.
        </p>
      </form>

      <div aria-live="polite">
        {state.phase === "error" && (
          <div className="rounded-lg border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-5">
            <p className="font-medium">That input could not be used</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{state.message}</p>
          </div>
        )}
        {state.phase === "result" && <ResultCard data={state.data} />}
      </div>

      <h3 className="mt-8 mb-2 text-sm font-semibold tracking-wide uppercase">
        Lights by tree height
      </h3>
      <div className="overflow-x-auto rounded-md border border-[var(--color-line)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-accent-soft)] text-left">
            <tr>
              <th className="px-3 py-2 font-medium">Tree height</th>
              {(Object.keys(LOOKS) as Look[]).map((k) => (
                <th key={k} className="px-3 py-2 font-medium">
                  {LOOKS[k].label} ({LOOKS[k].perFoot}/ft)
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-line)]">
            {[4, 5, 6, 6.5, 7, 7.5, 8, 9, 10, 12].map((h) => (
              <tr key={h}>
                <td className="px-3 py-1.5 font-medium">{h} ft</td>
                {(Object.keys(LOOKS) as Look[]).map((k) => (
                  <td key={k} className="px-3 py-1.5">
                    {n(Math.ceil(h * LOOKS[k].perFoot))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
