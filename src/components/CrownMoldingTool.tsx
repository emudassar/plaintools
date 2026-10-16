"use client";

import { useState, useId } from "react";
import { crownAngles, polygonAngle, CHART_WALLS, CHART_SPRINGS, WIKI_URL, CROWN_RETRIEVED, type CrownAngles } from "@/lib/crown-molding";
import { isToolError } from "@/lib/errors";

/** Recomputed as inputs change. No loading state. */

const d = (x: number) => `${x.toLocaleString("en-US", { maximumFractionDigits: 1, minimumFractionDigits: 1 })}°`;
const wallLabel = (w: number) => `${w.toLocaleString("en-US", { maximumFractionDigits: 2 })}°`;

export default function CrownMoldingTool() {
  const [wall, setWall] = useState("90");
  const [spring, setSpring] = useState("38");
  const [sides, setSides] = useState("");
  const ids = { w: useId(), s: useId(), n: useId() };

  const wallNum = sides.trim() !== "" && Number(sides) >= 3 ? polygonAngle(Number(sides)) : wall.trim() === "" ? NaN : Number(wall);
  const springNum = spring.trim() === "" ? NaN : Number(spring);

  let data: CrownAngles | null = null;
  let error: string | null = null;
  try {
    data = crownAngles(wallNum, springNum);
  } catch (e) {
    error = isToolError(e) ? e.message : "That input could not be used.";
  }
  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";
  const springs = Number.isFinite(springNum) && !CHART_SPRINGS.includes(springNum) && springNum > 0 && springNum < 90 ? [...CHART_SPRINGS, springNum] : CHART_SPRINGS;

  return (
    <div>
      <div className="mb-3 grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor={ids.w} className="mb-1.5 block font-medium">
            Corner (wall) angle, degrees
          </label>
          <input id={ids.w} type="number" inputMode="decimal" min="30" max="180" step="any" value={wall} onChange={(e) => { setWall(e.target.value); setSides(""); }} className={field} />
        </div>
        <div>
          <label htmlFor={ids.s} className="mb-1.5 block font-medium">
            Spring angle of the molding
          </label>
          <select id={ids.s} value={CHART_SPRINGS.includes(Number(spring)) ? spring : "custom"} onChange={(e) => setSpring(e.target.value === "custom" ? "40" : e.target.value)} className={field}>
            <option value="38">38° (52/38 crown)</option>
            <option value="45">45° (45/45 crown)</option>
            <option value="custom">Other — type below</option>
          </select>
          {!CHART_SPRINGS.includes(Number(spring)) && (
            <input aria-label="Custom spring angle" type="number" inputMode="decimal" min="1" max="89" step="any" value={spring} onChange={(e) => setSpring(e.target.value)} className={`${field} mt-2`} />
          )}
        </div>
        <div>
          <label htmlFor={ids.n} className="mb-1.5 block font-medium">
            Or: sides of a regular shape
          </label>
          <input id={ids.n} type="number" inputMode="numeric" min="3" step="1" placeholder="e.g. 8 for an octagon" value={sides} onChange={(e) => setSides(e.target.value)} className={field} />
        </div>
      </div>
      <p className="mb-6 text-xs text-[var(--color-muted)]">
        The corner angle is the angle between the two walls: 90° for a square corner, 135° for a 45° bay. Inside and outside corners use the
        same numbers. The result updates as you type.
      </p>

      <div aria-live="polite" className="rounded-lg border border-[var(--color-line)]">
        <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
          {error ? (
            <p className="text-sm">{error}</p>
          ) : (
            data && (
              <>
                <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
                  {wallLabel(wallNum)} corner · {d(springNum)} spring angle · molding cut lying flat
                </p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">
                  Miter {d(data.miter)} · Bevel {d(data.bevel)}
                </p>
              </>
            )
          )}
        </div>
        <div className="p-5 text-sm">
          <h3 className="mb-2 font-semibold tracking-wide uppercase">Crown molding angle chart (miter / bevel)</h3>
          <div className="mb-5 overflow-x-auto rounded-md border border-[var(--color-line)]">
            <table className="w-full whitespace-nowrap">
              <thead className="text-left text-[var(--color-muted)]">
                <tr>
                  <th className="px-3 py-1.5 font-medium">Corner angle</th>
                  {springs.map((s) => (
                    <th key={s} className="px-3 py-1.5 font-medium">
                      {d(s)} spring
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-line)]">
                {CHART_WALLS.map((w) => (
                  <tr key={w} className={Math.abs(w - wallNum) < 0.01 ? "bg-[var(--color-accent-soft)] font-semibold" : undefined}>
                    <td className="px-3 py-1.5">{wallLabel(w)}</td>
                    {springs.map((s) => {
                      const a = crownAngles(w, s);
                      return (
                        <td key={s} className="px-3 py-1.5">
                          {d(a.miter)} / {d(a.bevel)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3 className="mb-2 font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
          <p className="text-[var(--color-muted)]">
            Which way to tilt and swing the saw — that depends on whether it is an inside or outside corner, which piece you are cutting, and
            your saw&rsquo;s scales. The angles are exact geometry; real corners are rarely exactly the angle you enter and a molding&rsquo;s
            actual spring angle can differ from its label, so a test cut on scrap shows the fit. Cutting the molding nested upside down at
            the spring angle uses a single miter instead and is not covered here.
          </p>
          <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
            <p>
              Formulas: miter = arctan(sin spring ÷ tan(corner ÷ 2)); bevel = arcsin(cos spring × cos(corner ÷ 2)), as given in the
              Wikipedia article &ldquo;Crown molding&rdquo;. Check: 38° spring at 90° gives 31.6° / 33.9°. Retrieved {CROWN_RETRIEVED}.
            </p>
            <p className="mt-1">
              <a href={WIKI_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
                Wikipedia — Crown molding
              </a>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
