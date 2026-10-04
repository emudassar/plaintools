"use client";

import { useId, useState } from "react";
import { countSmokeAlarms, EDITIONS, type Edition, type SmokeAlarmResult } from "@/lib/smoke-alarms";
import { asToolError, type ErrorKind } from "@/lib/errors";

/**
 * Three real states: idle / error / result. No loading state: a count built
 * from the code's location list, compiled into the page.
 *
 * The result is the model-code minimum for the layout entered. It says nothing
 * about which alarms to buy and does not know local amendments.
 */

type State =
  | { phase: "idle" }
  | { phase: "error"; kind: ErrorKind; message: string }
  | { phase: "result"; data: SmokeAlarmResult };

const READER: Record<Edition, string> = {
  "2024": "https://codes.iccsafe.org/content/IRC2024P1/chapter-3-building-planning",
  "2021": "https://codes.iccsafe.org/content/IRC2021P1/chapter-3-building-planning",
};

function CookingRule({ edition }: { edition: Edition }) {
  if (edition === "2024") {
    return (
      <>
        R310.3.1: not less than 10 feet horizontally from a permanently installed cooking appliance,
        or not less than 6 feet where that is necessary to comply with R310.3.
      </>
    );
  }
  return (
    <>
      R314.3.1: from a permanently installed cooking appliance, ionization alarms not less than 20 feet
      horizontally (10 feet with an alarm-silencing switch), photoelectric alarms and alarms listed
      &ldquo;helps reduce cooking nuisance alarms&rdquo; not less than 6 feet, unless that would prevent a
      required location.
    </>
  );
}

function ResultCard({ data }: { data: SmokeAlarmResult }) {
  const ed = EDITIONS[data.edition];
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          Minimum under {ed.label} Section {ed.section}
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {data.total} smoke {data.total === 1 ? "alarm" : "alarms"}
        </p>
        <p className="mt-1 text-[var(--color-muted)]">
          {data.interconnectionRequired
            ? `Because more than one is required, ${ed.interconnect} requires them to be interconnected so one sounding sets off all of them (listed wireless alarms that all sound together satisfy this).`
            : "Only one is required, so the interconnection rule does not come into play."}
        </p>
      </div>

      <div className="p-5">
        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">Location by location</h3>
        <div className="mb-5 overflow-x-auto rounded-md border border-[var(--color-line)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-accent-soft)] text-left">
              <tr>
                <th className="px-3 py-2 font-medium">{ed.section} item</th>
                <th className="px-3 py-2 font-medium">Where</th>
                <th className="px-3 py-2 font-medium">Alarms</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-line)]">
              {data.lines.map((l) => (
                <tr key={l.item}>
                  <td className="px-3 py-2">{l.item}</td>
                  <td className="px-3 py-2">{l.where}</td>
                  <td className="px-3 py-2">{l.count}</td>
                </tr>
              ))}
              <tr className="font-medium">
                <td className="px-3 py-2" />
                <td className="px-3 py-2">Total</td>
                <td className="px-3 py-2">{data.total}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {data.loftsIgnored && (
          <div className="mb-5 rounded-md border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-4">
            <p className="text-sm">
              The sleeping loft you entered is not counted: the 2021 edition&rsquo;s R314.3 has no loft
              item. The 2024 edition added one (R310.3 item 6). Switch the edition to see that count.
            </p>
          </div>
        )}

        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">How the count was built</h3>
        <ul className="mb-5 list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
          <li>A story that has bedrooms already gets alarms from items 1 and 2, so item 3 adds one only for each story without bedrooms.</li>
          <li>Item 3&rsquo;s split-level exception: an alarm on the upper level covers an adjacent lower level less than one full story below it, if there is no door between them.</li>
          <li>Item 5 requires an alarm in the hallway and in the tall-ceiling room. The hallway alarm is taken to be the one item 2 already puts outside that sleeping area, so only the room adds one.</li>
          <li>Item 4 (keep alarms at least 3 feet from the door of a bathroom with a tub or shower, where possible) is a placement rule and adds no alarms.</li>
        </ul>

        <div className="mb-5 rounded-md border border-[var(--color-line)] p-4">
          <h3 className="mb-1 text-sm font-semibold tracking-wide uppercase">Distance from the kitchen</h3>
          <p className="text-sm text-[var(--color-muted)]">
            <CookingRule edition={data.edition} />
          </p>
        </div>

        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
        <p className="text-sm text-[var(--color-muted)]">
          This is the minimum in the model code for one- and two-family dwellings and townhouses. Your
          state or city may have adopted a different edition or added its own requirements, and the
          IRC applies it to new construction and to alterations that need a permit ({ed.scope}). It does
          not cover apartments or commercial buildings, carbon monoxide alarms (a separate section), or
          which type of alarm to buy.
        </p>

        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Source: International Code Council, {ed.label}, Section {ed.section} (smoke alarm locations),{" "}
            {ed.cooking} and {ed.interconnect}, read in ICC&rsquo;s free Digital Codes reader, retrieved{" "}
            {data.retrievedAt}.
          </p>
          <p className="mt-1">
            <a href={READER[data.edition]} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              ICC: {ed.label} Chapter 3
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-medium">
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5"
      />
      <p className="mt-1.5 text-xs text-[var(--color-muted)]">{hint}</p>
    </div>
  );
}

export default function SmokeAlarmTool() {
  const [edition, setEdition] = useState<Edition>("2024");
  const [bedrooms, setBedrooms] = useState("3");
  const [areas, setAreas] = useState("1");
  const [levels, setLevels] = useState("1");
  const [split, setSplit] = useState("0");
  const [tall, setTall] = useState("0");
  const [lofts, setLofts] = useState("0");
  const [state, setState] = useState<State>({ phase: "idle" });
  const editionId = useId();

  function run(e: React.FormEvent) {
    e.preventDefault();
    try {
      const num = (s: string) => (s.trim() === "" ? NaN : Number(s.trim()));
      const data = countSmokeAlarms({
        edition,
        bedrooms: num(bedrooms),
        sleepingAreas: num(areas),
        levelsWithoutBedrooms: num(levels),
        splitLevelsCovered: num(split),
        tallCeilingRooms: num(tall),
        sleepingLofts: num(lofts),
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
        <div className="mb-4 sm:max-w-xs">
          <label htmlFor={editionId} className="mb-1.5 block font-medium">
            Code edition
          </label>
          <select
            id={editionId}
            value={edition}
            onChange={(e) => setEdition(e.target.value as Edition)}
            className="w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5"
          >
            <option value="2024">2024 IRC (Section R310.3)</option>
            <option value="2021">2021 IRC (Section R314.3)</option>
          </select>
          <p className="mt-1.5 text-xs text-[var(--color-muted)]">States adopt editions at different times. Your building department can say which applies.</p>
        </div>

        <div className="mb-4 grid gap-4 sm:grid-cols-2">
          <NumberField label="Bedrooms" value={bedrooms} onChange={setBedrooms} hint="Every room used as a sleeping room." />
          <NumberField
            label="Separate sleeping areas"
            value={areas}
            onChange={setAreas}
            hint="Groups of bedrooms. Three bedrooms off one hallway are one area; a main-floor master away from the others makes two."
          />
          <NumberField
            label="Levels with no bedrooms"
            value={levels}
            onChange={setLevels}
            hint="Count basements and habitable attics. Do not count crawl spaces or uninhabitable attics."
          />
          <NumberField
            label="Of those, split levels covered from above"
            value={split}
            onChange={setSplit}
            hint="A level less than one full story below the level above it, with no door between them."
          />
          <NumberField
            label="Tall-ceiling rooms open to a bedroom hallway"
            value={tall}
            onChange={setTall}
            hint="Rooms whose ceiling is 24 inches or more higher than the hallway serving the bedrooms."
          />
          <NumberField
            label="Sleeping lofts"
            value={lofts}
            onChange={setLofts}
            hint={
              edition === "2024"
                ? "One alarm goes in the room the loft is open to (R310.3 item 6)."
                : "The 2021 edition has no loft item, so a loft entered here is noted but not counted."
            }
          />
        </div>

        <button type="submit" className="rounded-md bg-[var(--color-accent)] px-5 py-2.5 font-medium text-white">
          Count the smoke alarms
        </button>
        <p className="mt-1.5 text-xs text-[var(--color-muted)]">Runs entirely in your browser. Nothing you enter is sent anywhere or stored.</p>
      </form>

      <div aria-live="polite">
        {state.phase === "error" && (
          <div className="rounded-lg border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-5">
            <p className="font-medium">{state.kind === "no-data" ? "The code's list does not give a count for this" : "That input could not be used"}</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{state.message}</p>
          </div>
        )}
        {state.phase === "result" && <ResultCard data={state.data} />}
      </div>
    </div>
  );
}
