"use client";

import { useState, useId } from "react";
import { analyzeAngle, OPENSTAX_URL, parseAngle, radiansText, type AngleResult, type AngleUnit } from "@/lib/angle-drawer";
import { isToolError } from "@/lib/errors";

/** Recomputed as inputs change. No loading state. */

const n = (x: number, d = 4) => x.toLocaleString("en-US", { maximumFractionDigits: d });
const deg = (x: number) => `${n(x, 4)}°`;

/** Point on a circle of radius r at angle a (degrees), in SVG coordinates (y down). */
const pt = (r: number, a: number) => [r * Math.cos((a * Math.PI) / 180), -r * Math.sin((a * Math.PI) / 180)] as const;

function AngleSvg({ data }: { data: AngleResult }) {
  const L = 100;
  const [tx, ty] = pt(L, data.normalized);
  // Rotation arc: a spiral that grows 6 units per full turn so multiple turns stay readable.
  const steps = Math.max(12, Math.ceil(Math.abs(data.degrees) / 4));
  const arc: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = (data.degrees * i) / steps;
    const r = 26 + (6 * Math.abs(a)) / 360;
    const [x, y] = pt(r, a);
    arc.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  const endR = 26 + (6 * Math.abs(data.degrees)) / 360;
  const [ex, ey] = pt(endR, data.degrees);
  const tangent = data.degrees >= 0 ? data.degrees + 90 : data.degrees - 90;
  const [ux, uy] = pt(1, tangent);
  const [nx, ny] = pt(1, data.degrees);
  const head = `${ex.toFixed(2)},${ey.toFixed(2)} ${(ex - 7 * ux + 3.5 * nx).toFixed(2)},${(ey - 7 * uy + 3.5 * ny).toFixed(2)} ${(ex - 7 * ux - 3.5 * nx).toFixed(2)},${(ey - 7 * uy - 3.5 * ny).toFixed(2)}`;

  // Reference angle arc, between terminal side and the nearer horizontal axis.
  let ref: string | null = null;
  if (data.referenceDegrees !== null && data.quadrant) {
    const base = data.quadrant === "I" || data.quadrant === "IV" ? (data.quadrant === "I" ? 0 : 360) : 180;
    const [ax, ay] = pt(60, base);
    const [bx, by] = pt(60, data.normalized);
    const sweep = data.quadrant === "I" || data.quadrant === "III" ? 0 : 1;
    ref = `M${ax.toFixed(2)},${ay.toFixed(2)} A60,60 0 0 ${sweep} ${bx.toFixed(2)},${by.toFixed(2)}`;
  }

  return (
    <svg viewBox="-120 -120 240 240" className="mx-auto block w-full max-w-sm" role="img" aria-label={`Angle of ${deg(data.degrees)} drawn in standard position`}>
      <line x1={-115} y1={0} x2={115} y2={0} stroke="currentColor" strokeOpacity={0.35} strokeWidth={0.8} />
      <line x1={0} y1={-115} x2={0} y2={115} stroke="currentColor" strokeOpacity={0.35} strokeWidth={0.8} />
      <text x={110} y={-4} fontSize={8} textAnchor="end" fill="currentColor" fillOpacity={0.6}>x</text>
      <text x={4} y={-108} fontSize={8} fill="currentColor" fillOpacity={0.6}>y</text>
      {["I", "II", "III", "IV"].map((q, i) => {
        const [qx, qy] = pt(85, 45 + 90 * i);
        return (
          <text key={q} x={qx} y={qy} fontSize={9} textAnchor="middle" fill="currentColor" fillOpacity={data.quadrant === q ? 0.9 : 0.3}>
            {q}
          </text>
        );
      })}
      {ref && <path d={ref} fill="none" stroke="var(--color-warn-line)" strokeWidth={1.5} strokeDasharray="3 2" />}
      <line x1={0} y1={0} x2={L} y2={0} stroke="currentColor" strokeWidth={2} />
      <line x1={0} y1={0} x2={tx} y2={ty} stroke="var(--color-accent)" strokeWidth={2.5} />
      {data.degrees !== 0 && (
        <>
          <polyline points={arc.join(" ")} fill="none" stroke="var(--color-accent)" strokeWidth={1.2} />
          <polygon points={head} fill="var(--color-accent)" />
        </>
      )}
      <circle cx={0} cy={0} r={2} fill="currentColor" />
    </svg>
  );
}

function ResultCard({ data }: { data: AngleResult }) {
  const where = data.quadrant ? `Quadrant ${data.quadrant}` : `On the ${data.axis} (quadrantal)`;
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)]">
          {deg(data.degrees)} = {data.radiansText} rad · {data.direction === "none" ? "no rotation" : data.direction}
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">{where}</p>
        <p className="mt-1 text-[var(--color-muted)]">
          {data.referenceDegrees !== null
            ? `Reference angle ${deg(data.referenceDegrees)} (${radiansText(data.referenceDegrees)} rad).`
            : "A quadrantal angle has no reference angle."}{" "}
          {Math.abs(data.fullTurns) > 0 &&
            `It makes ${Math.abs(data.fullTurns)} full turn${Math.abs(data.fullTurns) > 1 ? "s" : ""} before ending at ${deg(data.normalized)}.`}
        </p>
      </div>
      <div className="p-5 text-sm">
        <AngleSvg data={data} />
        <p className="mt-2 mb-5 text-center text-xs text-[var(--color-muted)]">
          Black: initial side on the positive x-axis. Blue: terminal side and the rotation. Dashed: reference angle.
        </p>
        <table className="mb-5 w-full text-left">
          <tbody>
            {[
              ["Coterminal angle in 0°–360°", deg(data.coterminal.positive === 360 ? 0 : data.normalized)],
              ["Positive coterminal", `${deg(data.coterminal.positive)} (${radiansText(data.coterminal.positive)})`],
              ["Negative coterminal", `${deg(data.coterminal.negative)} (${radiansText(data.coterminal.negative)})`],
              ["More coterminal angles", `${deg(data.degrees + 360)}, ${deg(data.degrees - 360)} — add or subtract 360°`],
              ["sin θ", n(data.sin, 6)],
              ["cos θ", n(data.cos, 6)],
              ["tan θ", data.tan === null ? "undefined" : n(data.tan, 6)],
            ].map(([k, v]) => (
              <tr key={k} className="border-t border-[var(--color-line)]">
                <td className="py-1 pr-3 text-[var(--color-muted)]">{k}</td>
                <td className="py-1">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>Definitions: OpenStax, Precalculus 2e, §5.1 Angles (CC BY-NC-SA 4.0). Retrieved {data.retrievedAt}.</p>
          <p className="mt-1">
            <a href={OPENSTAX_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              OpenStax Precalculus 2e, 5.1 Angles
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function AngleDrawerTool() {
  const [text, setText] = useState("135");
  const [unit, setUnit] = useState<AngleUnit>("deg");
  const ids = { t: useId(), u: useId() };

  let data: AngleResult | null = null;
  let error: string | null = null;
  try {
    data = analyzeAngle(parseAngle(text, unit));
  } catch (e) {
    error = isToolError(e) ? e.message : "That input could not be used.";
  }
  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";

  return (
    <div>
      <div className="mb-2 grid gap-3 sm:grid-cols-[2fr_1fr]">
        <div>
          <label htmlFor={ids.t} className="mb-1.5 block font-medium">
            Angle
          </label>
          <input id={ids.t} type="text" inputMode="text" value={text} onChange={(e) => setText(e.target.value)} className={field} placeholder="e.g. 135, -45, 3π/4" />
        </div>
        <div>
          <label htmlFor={ids.u} className="mb-1.5 block font-medium">
            Unit
          </label>
          <select id={ids.u} value={unit} onChange={(e) => setUnit(e.target.value as AngleUnit)} className={field}>
            <option value="deg">degrees</option>
            <option value="rad">radians</option>
          </select>
        </div>
      </div>
      <p className="mb-6 text-xs text-[var(--color-muted)]">Type π or &ldquo;pi&rdquo; for radians, e.g. 5pi/6. The drawing updates as you type.</p>
      <div aria-live="polite">
        {error ? (
          <div className="rounded-lg border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-5">
            <p className="font-medium">That input could not be used</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{error}</p>
          </div>
        ) : (
          data && <ResultCard data={data} />
        )}
      </div>
    </div>
  );
}
