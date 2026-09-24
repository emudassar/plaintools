"use client";

import { useState, useId } from "react";
import {
  sizeSoftener,
  formatNumber,
  DEFAULT_GALLONS_PER_PERSON_PER_DAY,
  QUOTES,
  type SizingResult,
  type HardnessUnit,
  type Quote as SourceQuote,
} from "@/lib/water-softener";
import { asToolError, type ErrorKind } from "@/lib/errors";

/**
 * Three real states: idle / error / result.
 *
 * There is deliberately NO loading state. The arithmetic runs in the browser
 * against figures compiled into the page, so a spinner would be theatre.
 *
 * Nothing here recommends a unit or says whether a softener is needed. Every
 * figure is either arithmetic from the published method or a quoted sentence.
 */

type State =
  | { phase: "idle" }
  | { phase: "error"; kind: ErrorKind; message: string }
  | { phase: "result"; data: SizingResult };

type DemandMode = "people" | "metered";

function Quote({ quote }: { quote: SourceQuote }) {
  return (
    <blockquote className="border-l-2 border-[var(--color-accent)] pl-3">
      <p className="text-sm text-[var(--color-muted)]">{quote.text}</p>
      <cite className="mt-0.5 block text-xs not-italic text-[var(--color-muted)]">
        {quote.source}
      </cite>
    </blockquote>
  );
}

function Figure({
  label,
  value,
  unit,
  note,
}: {
  label: string;
  value: string;
  unit?: string;
  note?: string;
}) {
  return (
    <div className="rounded-md border border-[var(--color-line)] p-3">
      <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">{label}</p>
      <p className="mt-1 text-lg font-semibold">
        {value}
        {unit && (
          <span className="ml-1 text-sm font-normal text-[var(--color-muted)]">{unit}</span>
        )}
      </p>
      {note && <p className="mt-1 text-xs text-[var(--color-muted)]">{note}</p>}
    </div>
  );
}

function ResultCard({ data }: { data: SizingResult }) {
  const rated = data.ratedCapacity;

  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          Hardness removed per day
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {formatNumber(data.grainsPerDay)} grains per day
        </p>
        <p className="mt-1 text-[var(--color-muted)]">
          {data.demandBasis} × {formatNumber(data.hardnessGpg, 2)} gpg. This is the quantity
          Penn State&rsquo;s worked example calls &ldquo;grains per day used&rdquo;.
        </p>
      </div>

      <div className="p-5">
        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">The numbers</h3>
        <div className="mb-5 grid gap-3 sm:grid-cols-2">
          <Figure
            label={`Capacity for ${formatNumber(data.daysBetweenRegenerations)} days`}
            value={
              data.requiredCapacityGrains === null
                ? "No figure"
                : formatNumber(Math.round(data.requiredCapacityGrains))
            }
            unit={data.requiredCapacityGrains === null ? undefined : "grains"}
            note={
              data.requiredCapacityGrains === null
                ? "Hardness is zero, so no capacity is implied."
                : `${formatNumber(data.grainsPerDay)} grains per day × ${formatNumber(
                    data.daysBetweenRegenerations,
                  )} days. The interval is the one you chose — no source sets a target.`
            }
          />

          {rated && (
            <Figure
              label="Your unit would regenerate every"
              value={
                rated.days === null
                  ? "No figure"
                  : rated.moreThanDaily
                    ? `${formatNumber(24 / rated.days, 1)} times a day`
                    : formatNumber(rated.days, 2)
              }
              unit={rated.days === null || rated.moreThanDaily ? undefined : "days"}
              note={
                rated.days === null
                  ? "Hardness is zero, so a rated capacity gives no interval."
                  : `${formatNumber(rated.capacityGrains)} grains ÷ ${formatNumber(
                      data.grainsPerDay,
                    )} grains per day${
                      rated.moreThanDaily
                        ? ". That is less than one full day per cycle."
                        : "."
                    }`
              }
            />
          )}

          <Figure
            label="Hardness classification"
            value={data.hardnessClass.label}
            note={`Penn State Extension Table 1: ${data.hardnessClass.range}.`}
          />

          <Figure
            label="Hardness in both units"
            value={`${formatNumber(data.hardnessGpg, 2)} gpg`}
            note={`${formatNumber(data.hardnessMgl, 1)} mg/L (ppm)${
              data.converted ? ", converted from the mg/L figure you entered" : ""
            }. Penn State: a gpg “equals approximately 17 mg/l or ppm”.`}
          />

          <Figure
            label="Sodium added by softening"
            value={formatNumber(data.sodiumMgPerQuart, 1)}
            unit="mg per quart"
            note={`${formatNumber(data.hardnessGpg, 2)} gpg × 7.5 mg per quart per gpg removed, the figure Penn State gives.`}
          />

          {data.regenerationWaterGallonsPerYear !== null && (
            <Figure
              label="Regeneration water per year"
              value={formatNumber(Math.round(data.regenerationWaterGallonsPerYear))}
              unit="gallons"
              note={`${formatNumber(
                Math.round(365 / data.daysBetweenRegenerations),
              )} cycles a year × 50 gallons per cycle, Penn State's figure. Arithmetic from their number, not a figure they publish.`}
            />
          )}
        </div>

        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          The method this used
        </h3>
        <div className="mb-5">
          <Quote quote={QUOTES.method} />
        </div>

        {data.notes.length > 0 && (
          <>
            <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
              What the sources say about these inputs
            </h3>
            <div className="mb-5 space-y-4">
              {data.notes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-md border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-4"
                >
                  <h4 className="font-medium">{note.heading}</h4>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">{note.body}</p>
                  <div className="mt-3 space-y-3">
                    {note.quotes.map((q) => (
                      <Quote key={q.text.slice(0, 30)} quote={q} />
                    ))}
                  </div>
                  {note.ambiguity && (
                    <p className="mt-3 text-xs text-[var(--color-muted)]">
                      <strong className="font-medium">The source is ambiguous here.</strong>{" "}
                      {note.ambiguity}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          What this page cannot tell you
        </h3>
        <p className="text-sm text-[var(--color-muted)]">
          It cannot know your water. Hardness, iron and manganese come from a test of the
          water at your tap or well, and everything above is arithmetic on the numbers you
          typed. It does not say whether you need a softener, does not recommend or compare
          equipment, and cannot account for anything a water test does not report — bacteria,
          tannins, hydrogen sulfide or the pressure and flow rate your plumbing runs at. A
          rated capacity on a product label is the manufacturer&rsquo;s figure, measured under
          their test conditions.
        </p>

        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Sources: Penn State Extension, &ldquo;Water Softening&rdquo;, and North Dakota
            State University Extension, &ldquo;Water Softening (Ion Exchange)&rdquo;. Text
            retrieved {data.retrievedAt}. This page applies their published method to the
            numbers entered above.
          </p>
          <p className="mt-1 flex flex-wrap gap-x-4">
            <a
              href="https://extension.psu.edu/water-softening"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-accent)] underline"
            >
              Penn State Extension: Water Softening
            </a>
            <a
              href="https://www.ndsu.edu/agriculture/extension/publications/water-softening-ion-exchange"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-accent)] underline"
            >
              NDSU Extension: Water Softening (Ion Exchange)
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function WaterSoftenerTool() {
  const [hardness, setHardness] = useState("");
  const [hardnessUnit, setHardnessUnit] = useState<HardnessUnit>("gpg");
  const [demandMode, setDemandMode] = useState<DemandMode>("people");
  const [people, setPeople] = useState("4");
  const [perPerson, setPerPerson] = useState(String(DEFAULT_GALLONS_PER_PERSON_PER_DAY));
  const [gallonsPerDay, setGallonsPerDay] = useState("");
  const [days, setDays] = useState("7");
  const [ratedCapacity, setRatedCapacity] = useState("");
  const [iron, setIron] = useState("");
  const [manganese, setManganese] = useState("");
  const [state, setState] = useState<State>({ phase: "idle" });

  const hardnessId = useId();
  const unitId = useId();
  const peopleId = useId();
  const perPersonId = useId();
  const gpdId = useId();
  const daysId = useId();
  const capacityId = useId();
  const ironId = useId();
  const manganeseId = useId();

  const numOrNull = (s: string): number | null => {
    const t = s.trim();
    return t === "" ? null : Number(t);
  };

  function run(e: React.FormEvent) {
    e.preventDefault();
    try {
      const h = hardness.trim();
      if (h === "") {
        setState({
          phase: "error",
          kind: "bad-input",
          message:
            "Enter your water hardness. It is on a water test report, usually as grains per gallon or as mg/L (ppm) of calcium carbonate.",
        });
        return;
      }
      const data = sizeSoftener({
        hardness: Number(h),
        hardnessUnit,
        people: demandMode === "people" ? numOrNull(people) : null,
        gallonsPerPersonPerDay: demandMode === "people" ? numOrNull(perPerson) : null,
        gallonsPerDay: demandMode === "metered" ? numOrNull(gallonsPerDay) : null,
        daysBetweenRegenerations: Number(days.trim() === "" ? "7" : days),
        ratedCapacityGrains: numOrNull(ratedCapacity),
        ironPpm: numOrNull(iron),
        manganesePpm: numOrNull(manganese),
      });
      setState({ phase: "result", data });
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
        <div className="mb-4">
          <label htmlFor={hardnessId} className="mb-1.5 block font-medium">
            How hard is your water?
          </label>
          <div className="flex gap-2">
            <input
              id={hardnessId}
              type="number"
              inputMode="decimal"
              step="any"
              min="0"
              value={hardness}
              onChange={(e) => setHardness(e.target.value)}
              placeholder="e.g. 10"
              className={`${field} sm:w-40`}
            />
            <label htmlFor={unitId} className="sr-only">
              Hardness unit
            </label>
            <select
              id={unitId}
              value={hardnessUnit}
              onChange={(e) => setHardnessUnit(e.target.value as HardnessUnit)}
              className={`${field} sm:w-56`}
            >
              <option value="gpg">grains per gallon (gpg)</option>
              <option value="mgl">mg/L or ppm</option>
            </select>
          </div>
          <p className="mt-1.5 text-xs text-[var(--color-muted)]">
            From a water test report. Getting the unit wrong is the easiest mistake to make
            here — one grain per gallon is about 17 mg/L, so the two figures differ by about
            17 times.
          </p>
        </div>

        <fieldset className="mb-4">
          <legend className="mb-2 font-medium">How much water does the house use?</legend>
          <div className="mb-3 flex flex-wrap gap-2">
            {(
              [
                ["people", "Work it out from household size"],
                ["metered", "I know the daily figure"],
              ] as const
            ).map(([mode, label]) => (
              <label
                key={mode}
                className={`cursor-pointer rounded-md border px-3 py-2 text-sm ${
                  demandMode === mode
                    ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] font-medium"
                    : "border-[var(--color-line)]"
                }`}
              >
                <input
                  type="radio"
                  name="demand-mode"
                  value={mode}
                  checked={demandMode === mode}
                  onChange={() => setDemandMode(mode)}
                  className="sr-only"
                />
                {label}
              </label>
            ))}
          </div>

          {demandMode === "people" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor={peopleId} className="mb-1.5 block text-sm font-medium">
                  People in the household
                </label>
                <input
                  id={peopleId}
                  type="number"
                  inputMode="numeric"
                  step="1"
                  min="1"
                  value={people}
                  onChange={(e) => setPeople(e.target.value)}
                  className={field}
                />
              </div>
              <div>
                <label htmlFor={perPersonId} className="mb-1.5 block text-sm font-medium">
                  Gallons per person per day
                </label>
                <input
                  id={perPersonId}
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="1"
                  value={perPerson}
                  onChange={(e) => setPerPerson(e.target.value)}
                  className={field}
                />
                <p className="mt-1.5 text-xs text-[var(--color-muted)]">
                  75 is the figure Penn State uses in their own worked example. Change it if
                  you have a better one.
                </p>
              </div>
            </div>
          ) : (
            <div className="sm:w-1/2">
              <label htmlFor={gpdId} className="mb-1.5 block text-sm font-medium">
                Gallons per day
              </label>
              <input
                id={gpdId}
                type="number"
                inputMode="decimal"
                step="any"
                min="1"
                value={gallonsPerDay}
                onChange={(e) => setGallonsPerDay(e.target.value)}
                placeholder="e.g. 300"
                className={field}
              />
              <p className="mt-1.5 text-xs text-[var(--color-muted)]">
                From a meter reading over a known period, divided by the days.
              </p>
            </div>
          )}
        </fieldset>

        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={daysId} className="mb-1.5 block font-medium">
              Days you want between regenerations
            </label>
            <input
              id={daysId}
              type="number"
              inputMode="numeric"
              step="1"
              min="1"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className={field}
            />
            <p className="mt-1.5 text-xs text-[var(--color-muted)]">
              Your choice, not a recommendation. Neither source sets a target interval; this
              just decides what capacity the arithmetic asks for.
            </p>
          </div>
          <div>
            <label htmlFor={capacityId} className="mb-1.5 block font-medium">
              Rated capacity of a unit{" "}
              <span className="font-normal text-[var(--color-muted)]">— optional</span>
            </label>
            <input
              id={capacityId}
              type="number"
              inputMode="numeric"
              step="any"
              min="1"
              value={ratedCapacity}
              onChange={(e) => setRatedCapacity(e.target.value)}
              placeholder="e.g. 20000"
              className={field}
            />
            <p className="mt-1.5 text-xs text-[var(--color-muted)]">
              Grains per regeneration, from the unit&rsquo;s own label or spec sheet. Fill
              this in to see how often that unit would regenerate on your water.
            </p>
          </div>
        </div>

        <fieldset className="mb-4">
          <legend className="mb-2 font-medium">
            Iron and manganese{" "}
            <span className="font-normal text-[var(--color-muted)]">
              — optional, from the same water test
            </span>
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor={ironId} className="mb-1.5 block text-sm font-medium">
                Iron, ppm
              </label>
              <input
                id={ironId}
                type="number"
                inputMode="decimal"
                step="any"
                min="0"
                value={iron}
                onChange={(e) => setIron(e.target.value)}
                placeholder="e.g. 1.5"
                className={field}
              />
            </div>
            <div>
              <label htmlFor={manganeseId} className="mb-1.5 block text-sm font-medium">
                Manganese, ppm
              </label>
              <input
                id={manganeseId}
                type="number"
                inputMode="decimal"
                step="any"
                min="0"
                value={manganese}
                onChange={(e) => setManganese(e.target.value)}
                placeholder="e.g. 0.3"
                className={field}
              />
            </div>
          </div>
          <p className="mt-1.5 text-xs text-[var(--color-muted)]">
            These do not change the hardness arithmetic. Entering them shows you what NDSU
            Extension says about the level you have.
          </p>
        </fieldset>

        <button
          type="submit"
          className="rounded-md bg-[var(--color-accent)] px-5 py-2.5 font-medium text-white"
        >
          Work out the size
        </button>
        <p className="mt-1.5 text-xs text-[var(--color-muted)]">
          Runs entirely in your browser. Nothing you enter is sent anywhere or stored.
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
    </div>
  );
}
