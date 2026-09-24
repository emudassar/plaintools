"use client";

import { useState, useId } from "react";
import {
  classifySoil,
  classLabel,
  MATERIALS,
  CLAUSES,
  type ClassificationResult,
  type MaterialId,
  type LayerDip,
} from "@/lib/osha-soil";
import { asToolError, type ErrorKind } from "@/lib/errors";

/**
 * Three real states: idle / error / result.
 *
 * There is deliberately NO loading state. The criteria are compiled in and the
 * classification is decided in the browser, so a spinner would be theatre.
 *
 * Nothing here gives advice or tells anyone an excavation is safe. Every line
 * either quotes 29 CFR 1926 Subpart P or says which clause was not met.
 */

type State =
  | { phase: "idle" }
  | { phase: "error"; kind: ErrorKind; message: string }
  | { phase: "result"; data: ClassificationResult };

const MATERIAL_GROUPS: { label: string; ids: MaterialId[] }[] = [
  { label: "Rock", ids: ["stable-rock", "unstable-rock"] },
  {
    label: "Cohesive soils (clay-like)",
    ids: ["clay", "silty-clay", "sandy-clay", "clay-loam", "silty-clay-loam", "sandy-clay-loam"],
  },
  { label: "Cemented soils", ids: ["caliche", "hardpan"] },
  {
    label: "Granular soils",
    ids: ["angular-gravel", "silt", "silt-loam", "sandy-loam", "gravel", "sand", "loamy-sand"],
  },
];

function Quote({ code, text }: { code: string; text: string }) {
  return (
    <blockquote className="border-l-2 border-[var(--color-accent)] pl-3">
      <p className="text-sm text-[var(--color-muted)]">{text}</p>
      <cite className="mt-0.5 block text-xs not-italic text-[var(--color-muted)]">
        29 CFR 1926 Subpart P, {code}
      </cite>
    </blockquote>
  );
}

function ResultCard({ data }: { data: ClassificationResult }) {
  // `possible` is ordered least stable first because the least stable class
  // governs. Reading order is the other way round, so flip it for display and
  // name the governing class explicitly rather than relying on the order.
  const governing = data.possible[0];
  const headline = (data.resolved ? data.possible : [...data.possible].reverse())
    .map(classLabel)
    .join(" or ");

  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          {data.material.label}
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">{headline}</p>
        <p className="mt-1 text-[var(--color-muted)]">
          {data.resolved ? (
            "This is the class OSHA's published criteria place these properties in."
          ) : (
            <>
              The answers given narrow it to these classes but do not settle it. Of the
              classes still open, the least stable is{" "}
              <strong className="font-semibold">{classLabel(governing)}</strong>.
            </>
          )}
        </p>
      </div>

      <div className="p-5">
        {!data.resolved && data.missing && (
          <div className="mb-5 rounded-md border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-4">
            <h3 className="font-medium">What would settle it</h3>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{data.missing}</p>
          </div>
        )}

        {data.ambiguityNote && (
          <div className="mb-5 rounded-md border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-4">
            <h3 className="font-medium">The regulation hedges on this material</h3>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{data.ambiguityNote}</p>
          </div>
        )}

        <h3 className="mb-1 text-sm font-semibold tracking-wide uppercase">
          The clauses that decided this
        </h3>
        <p className="mb-3 text-sm text-[var(--color-muted)]">
          Quoted in the order they were applied, so a clause that set the starting class
          appears above the one that changed it.
        </p>
        <div className="mb-5 space-y-3">
          {data.deciding.map((c) => (
            <Quote key={c.code + c.text.slice(0, 20)} code={c.code} text={c.text} />
          ))}
        </div>

        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          Every condition checked
        </h3>
        <ul className="mb-5 space-y-2 text-sm">
          {data.checks.map((check) => (
            <li
              key={check.label}
              className="flex gap-3 border-t border-[var(--color-line)] py-2"
            >
              <span
                aria-hidden="true"
                className={
                  check.applied
                    ? "mt-0.5 shrink-0 font-semibold text-[var(--color-accent)]"
                    : "mt-0.5 shrink-0 text-[var(--color-muted)]"
                }
              >
                {check.applied ? "●" : "○"}
              </span>
              <span>
                <span className="font-medium">{check.label}</span>
                <span className="sr-only">
                  {check.applied ? " — applies" : " — does not apply"}
                </span>
                <span className="block text-[var(--color-muted)]">{check.effect}</span>
              </span>
            </li>
          ))}
        </ul>

        {data.slopes.length > 0 && (
          <>
            <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
              Maximum allowable slope for {classLabel(data.possible[0])}
            </h3>
            <div className="mb-5 space-y-3">
              {data.slopes.map((s) => (
                <div
                  key={s.ratio}
                  className="rounded-md border border-[var(--color-line)] p-3"
                >
                  <p className="font-medium">
                    {s.ratio}{" "}
                    <span className="font-normal text-[var(--color-muted)]">
                      (horizontal:vertical) &middot; about {s.degreesFromHorizontal}&deg; from
                      horizontal
                    </span>
                  </p>
                  <p className="mt-0.5 text-sm text-[var(--color-muted)]">{s.condition}</p>
                  <p className="mt-1.5 text-xs text-[var(--color-muted)]">
                    {s.clause.text} — 29 CFR 1926 Subpart P, {s.clause.code}
                  </p>
                </div>
              ))}
              <p className="text-xs text-[var(--color-muted)]">
                The ratios are quoted from Appendix B. The angles are arithmetic from those
                ratios, shown for readers who think in degrees; the regulation states the
                ratio, not the angle.
              </p>
            </div>
          </>
        )}

        {data.possible.includes("stable-rock") && (
          <div className="mb-5 rounded-md border border-[var(--color-line)] p-3">
            <Quote code={CLAUSES.exceptions.code} text={CLAUSES.exceptions.text} />
          </div>
        )}

        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          What this page cannot tell you
        </h3>
        <div className="space-y-3">
          <Quote code={CLAUSES.basis.code} text={CLAUSES.basis.text} />
          <Quote code={CLAUSES.aOtherFactors.code} text={CLAUSES.aOtherFactors.text} />
          <Quote code={CLAUSES.engineerOver20ft.code} text={CLAUSES.engineerOver20ft.text} />
        </div>

        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Source: 29 CFR 1926 Subpart P, Appendices A and B, as published in the Code of
            Federal Regulations by the U.S. Government Publishing Office. Criteria text
            retrieved {data.retrievedAt}. This page applies those criteria to the answers
            entered above; it is not a classification of any excavation.
          </p>
          <p className="mt-1">
            <a
              href="https://www.ecfr.gov/current/title-29/subtitle-B/chapter-XVII/part-1926/subpart-P"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-accent)] underline"
            >
              Read Subpart P in full on eCFR
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function OshaSoilTool() {
  const [material, setMaterial] = useState<MaterialId | "">("");
  const [strength, setStrength] = useState("");
  const [fissured, setFissured] = useState(false);
  const [vibration, setVibration] = useState(false);
  const [previouslyDisturbed, setPreviouslyDisturbed] = useState(false);
  const [waterSeeping, setWaterSeeping] = useState(false);
  const [layerDip, setLayerDip] = useState<LayerDip>("none");
  const [state, setState] = useState<State>({ phase: "idle" });

  const materialId = useId();
  const strengthId = useId();
  const dipId = useId();

  const selected = material ? MATERIALS.find((m) => m.id === material) : undefined;
  const isCohesive = selected?.kind === "cohesive";
  const isRock = selected?.kind === "stable-rock";

  function run(e: React.FormEvent) {
    e.preventDefault();
    try {
      const trimmed = strength.trim();
      const data = classifySoil({
        material: material === "" ? null : material,
        strengthTsf: trimmed === "" ? null : Number(trimmed),
        fissured,
        vibration,
        previouslyDisturbed,
        waterSeeping,
        layerDip,
      });
      setState({ phase: "result", data });
    } catch (err) {
      const e2 = asToolError(err);
      setState({ phase: "error", kind: e2.kind, message: e2.message });
    }
  }

  return (
    <div>
      <form onSubmit={run} className="mb-6">
        <div className="mb-4">
          <label htmlFor={materialId} className="mb-1.5 block font-medium">
            What is the material?
          </label>
          <select
            id={materialId}
            value={material}
            onChange={(e) => setMaterial(e.target.value as MaterialId | "")}
            className="w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5"
          >
            <option value="">Choose the material…</option>
            {MATERIAL_GROUPS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.ids.map((id) => {
                  const m = MATERIALS.find((x) => x.id === id);
                  return m ? (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ) : null;
                })}
              </optgroup>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-[var(--color-muted)]">
            These are the material names Appendix A itself uses.
          </p>
        </div>

        {isCohesive && (
          <div className="mb-4">
            <label htmlFor={strengthId} className="mb-1.5 block font-medium">
              Unconfined compressive strength, in tsf{" "}
              <span className="font-normal text-[var(--color-muted)]">
                — leave blank if not measured
              </span>
            </label>
            <input
              id={strengthId}
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              value={strength}
              onChange={(e) => setStrength(e.target.value)}
              placeholder="e.g. 1.5"
              className="w-full rounded-md border border-[var(--color-line)] px-3 py-2.5 sm:w-48"
            />
            <p className="mt-1.5 text-xs text-[var(--color-muted)]">
              This is what separates Type A, B and C for a cohesive soil. Blank is a valid
              answer — the result will show the range it leaves open rather than guessing.
            </p>
          </div>
        )}

        {!isRock && (
          <fieldset className="mb-4">
            <legend className="mb-2 font-medium">
              Which of these apply to the material?
            </legend>
            <div className="space-y-2">
              {[
                {
                  checked: fissured,
                  set: setFissured,
                  label: "Fissured",
                  hint: "Breaks along definite planes of fracture with little resistance, or shows open cracks such as tension cracks in an exposed surface.",
                },
                {
                  checked: vibration,
                  set: setVibration,
                  label: "Subject to vibration",
                  hint: "From heavy traffic, pile driving, or similar effects.",
                },
                {
                  checked: previouslyDisturbed,
                  set: setPreviouslyDisturbed,
                  label: "Previously disturbed",
                  hint: "The ground has been excavated, backfilled or otherwise worked before.",
                },
                {
                  checked: waterSeeping,
                  set: setWaterSeeping,
                  label: "Submerged, or water freely seeping",
                  hint: "Underwater, or water is seeping freely from the soil.",
                },
              ].map((row) => (
                <label
                  key={row.label}
                  className="flex cursor-pointer gap-3 rounded-md border border-[var(--color-line)] p-3"
                >
                  <input
                    type="checkbox"
                    checked={row.checked}
                    onChange={(e) => row.set(e.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0"
                  />
                  <span>
                    <span className="font-medium">{row.label}</span>
                    <span className="block text-sm text-[var(--color-muted)]">{row.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {!isRock && (
          <div className="mb-4">
            <label htmlFor={dipId} className="mb-1.5 block font-medium">
              Is it a sloped, layered system dipping into the excavation?
            </label>
            <select
              id={dipId}
              value={layerDip}
              onChange={(e) => setLayerDip(e.target.value as LayerDip)}
              className="w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5"
            >
              <option value="none">No layered system</option>
              <option value="less-steep">Yes — layers dip less steeply than 4H:1V</option>
              <option value="4h1v-or-steeper">Yes — layers dip at 4H:1V or steeper</option>
            </select>
          </div>
        )}

        <button
          type="submit"
          disabled={material === ""}
          className="rounded-md bg-[var(--color-accent)] px-5 py-2.5 font-medium text-white disabled:opacity-50"
        >
          Classify with OSHA's criteria
        </button>
        <p className="mt-1.5 text-xs text-[var(--color-muted)]">
          Runs entirely in your browser. Nothing you enter is sent anywhere or stored.
        </p>
      </form>

      <div aria-live="polite">
        {state.phase === "error" && (
          <div className="rounded-lg border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-5">
            <p className="font-medium">That input could not be read</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{state.message}</p>
          </div>
        )}

        {state.phase === "result" && <ResultCard data={state.data} />}
      </div>
    </div>
  );
}
