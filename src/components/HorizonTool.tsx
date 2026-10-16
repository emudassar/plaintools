"use client";

import { useId, useState } from "react";
import { Ext, Headline, n, Row, Table } from "./GeoBits";
import { horizon, WIKI_HORIZON_URL, YOUNG_URL, type HorizonResult } from "@/lib/horizon";
import { isToolError } from "@/lib/errors";

/** Pure calculation: recomputed as the inputs change, no loading state. */

type HUnit = "ft" | "m";
type DUnit = "mi" | "km" | "nmi";
const H_M: Record<HUnit, number> = { ft: 0.3048, m: 1 };
const D_M: Record<DUnit, number> = { mi: 1609.344, km: 1000, nmi: 1852 };

function ResultCard({ r, hu, du }: { r: HorizonResult; hu: HUnit; du: DUnit }) {
  const d = (m: number) => `${n(m / D_M[du], 2)} ${du === "nmi" ? "nmi" : du}`;
  const h = (m: number) => `${n(m / H_M[hu], 1)} ${hu}`;
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <Headline
        kicker={`Horizon from an eye height of ${h(r.observerM)}`}
        title={d(r.refractedM)}
        sub={`with normal refraction · ${d(r.geometricM)} geometric (no atmosphere)`}
      />
      <div className="p-5 text-sm">
        <Table>
          <Row k="With standard refraction">
            {n(r.refractedM / 1609.344, 2)} mi · {n(r.refractedM / 1000, 2)} km · {n(r.refractedM / 1852, 2)} nmi
          </Row>
          <Row k="Geometric (no refraction)">
            {n(r.geometricM / 1609.344, 2)} mi · {n(r.geometricM / 1000, 2)} km · {n(r.geometricM / 1852, 2)} nmi
          </Row>
          {r.target && (
            <Row k={`Farthest you can see the top of a ${h(r.target.heightM)} object`}>
              {d(r.target.maxSeenRefractedM)} with refraction · {d(r.target.maxSeenGeometricM)} geometric
            </Row>
          )}
          {r.hidden && (
            <Row k={`Hidden below the horizon at ${d(r.hidden.distanceM)}`}>
              {r.hidden.refractedM === 0 && r.hidden.geometricM === 0 ? (
                "Nothing: that distance is inside your horizon"
              ) : (
                <>
                  {h(r.hidden.refractedM)} with refraction · {h(r.hidden.geometricM)} geometric
                </>
              )}
            </Row>
          )}
        </Table>
        <p className="text-[var(--color-muted)]">
          Refraction bends light slightly around the curve, so you normally see a little farther than the geometry alone allows. How
          much varies with the weather: over cold water in spring the bending can be far stronger, and over hot ground it can reverse
          (mirages). The refraction figure uses standard conditions; treat both numbers as the range of the usual case, not a limit.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Method: d = √(2Rh + h²) on a sphere of radius R = 6,371 km; standard refraction by an effective radius R′ = 7R/6 (A. T.
            Young), which gives about 3.86 km × √h (h in metres). Hidden height: the part of a distant object below your line of sight
            past the horizon, same model. Calculated in your browser.
          </p>
          <p className="mt-1 flex flex-wrap gap-x-4">
            <Ext href={WIKI_HORIZON_URL}>Horizon: distance formula</Ext>
            <Ext href={YOUNG_URL}>A. T. Young, Distance to the Horizon (SDSU)</Ext>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function HorizonTool() {
  const [height, setHeight] = useState("5.7");
  const [hu, setHu] = useState<HUnit>("ft");
  const [target, setTarget] = useState("");
  const [dist, setDist] = useState("");
  const [du, setDu] = useState<DUnit>("mi");
  const ids = { h: useId(), hu: useId(), t: useId(), d: useId(), du: useId() };

  const num = (v: string) => (v.trim() === "" ? null : Number(v));
  let r: HorizonResult | null = null;
  let error: string | null = null;
  try {
    const hv = num(height);
    if (hv === null) throw new Error("Enter your eye height.");
    const tv = num(target);
    const dv = num(dist);
    r = horizon({ observerM: hv * H_M[hu], targetM: tv === null ? null : tv * H_M[hu], distanceM: dv === null ? null : dv * D_M[du] });
  } catch (e) {
    error = isToolError(e) || e instanceof Error ? (e as Error).message : "That input could not be used.";
  }
  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";

  return (
    <div>
      <div className="mb-3 grid gap-3 sm:grid-cols-[1fr_8rem]">
        <div>
          <label htmlFor={ids.h} className="mb-1.5 block font-medium">
            Your eye height above the water or flat ground
          </label>
          <input id={ids.h} type="number" inputMode="decimal" min="0" step="any" value={height} onChange={(e) => setHeight(e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor={ids.hu} className="mb-1.5 block font-medium">
            Heights in
          </label>
          <select id={ids.hu} value={hu} onChange={(e) => setHu(e.target.value as HUnit)} className={field}>
            <option value="ft">feet</option>
            <option value="m">metres</option>
          </select>
        </div>
      </div>
      <div className="mb-3 grid gap-3 sm:grid-cols-[1fr_1fr_8rem]">
        <div>
          <label htmlFor={ids.t} className="mb-1.5 block font-medium">
            Height of a distant object (optional)
          </label>
          <input id={ids.t} type="number" inputMode="decimal" min="0" step="any" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="e.g. a lighthouse" className={field} />
        </div>
        <div>
          <label htmlFor={ids.d} className="mb-1.5 block font-medium">
            Distance to it (optional)
          </label>
          <input id={ids.d} type="number" inputMode="decimal" min="0" step="any" value={dist} onChange={(e) => setDist(e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor={ids.du} className="mb-1.5 block font-medium">
            Distances in
          </label>
          <select id={ids.du} value={du} onChange={(e) => setDu(e.target.value as DUnit)} className={field}>
            <option value="mi">miles</option>
            <option value="km">km</option>
            <option value="nmi">nautical miles</option>
          </select>
        </div>
      </div>
      <p className="mb-6 text-xs text-[var(--color-muted)]">Measure from the water or ground surface to your eyes, including the deck, cliff or floor you stand on. The result updates as you type.</p>
      <div aria-live="polite">
        {error ? (
          <div className="rounded-lg border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-5">
            <p className="font-medium">That input could not be used</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{error}</p>
          </div>
        ) : (
          r && <ResultCard r={r} hu={hu} du={du} />
        )}
      </div>
    </div>
  );
}
