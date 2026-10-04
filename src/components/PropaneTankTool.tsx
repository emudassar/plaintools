"use client";

import { useState } from "react";
import {
  checkPropaneCylinder,
  formatMonthYear,
  formatMonths,
  MARK_RULES,
  INITIAL_PERIOD_YEARS,
  REGULATION_CURRENT_AS_OF,
  type PropaneResult,
  type RequalMark,
} from "@/lib/propane-tank";
import { asToolError, type ErrorKind } from "@/lib/errors";
import { currentMonth } from "@/lib/month";
import MonthYearFields from "@/components/MonthYearFields";

/**
 * Three real states: idle / error / result. No loading state: this is date
 * arithmetic against rules compiled into the page.
 *
 * The result reports the date the regulation gives for the marks entered. It
 * never says a cylinder is safe or unsafe to use.
 */

type Container = "cylinder" | "asme";

type State =
  | { phase: "idle" }
  | { phase: "asme" }
  | { phase: "error"; kind: ErrorKind; message: string }
  | { phase: "result"; data: PropaneResult };

const ECFR_180_209 =
  "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-I/subchapter-C/part-180/subpart-C/section-180.209";
const ECFR_180_213 =
  "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-I/subchapter-C/part-180/subpart-C/section-180.213";

function Footer({ retrievedAt }: { retrievedAt: string }) {
  return (
    <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
      <p>
        Source: 49 CFR 180.209 (requalification of specification cylinders) and 49 CFR 180.213
        (requalification markings), US Department of Transportation, PHMSA. Text current as of{" "}
        {REGULATION_CURRENT_AS_OF} on eCFR, retrieved {retrievedAt}.
      </p>
      <p className="mt-1 flex flex-wrap gap-x-4">
        <a href={ECFR_180_209} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
          eCFR: §180.209
        </a>
        <a href={ECFR_180_213} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
          eCFR: §180.213
        </a>
      </p>
    </footer>
  );
}

function ResultCard({ data }: { data: PropaneResult }) {
  const headline =
    data.status === "overdue"
      ? `Requalification was due by ${formatMonthYear(data.due)}`
      : `Requalification due by ${formatMonthYear(data.due)}`;
  const sub =
    data.status === "overdue"
      ? `That was ${formatMonths(data.monthsRemaining)} ago.`
      : data.status === "due-this-month"
        ? "That is this month."
        : `${formatMonths(data.monthsRemaining)} from now.`;

  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div
        className={`border-b p-5 ${
          data.status === "ok"
            ? "border-[var(--color-line)] bg-[var(--color-accent-soft)]"
            : "border-[var(--color-warn-line)] bg-[var(--color-warn-soft)]"
        }`}
      >
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          Next requalification under 49 CFR 180.209
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">{headline}</p>
        <p className="mt-1 text-[var(--color-muted)]">{sub}</p>
      </div>

      <div className="p-5">
        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">How this date was worked out</h3>
        <p className="mb-5 text-sm text-[var(--color-muted)]">
          {data.basis === "initial" ? (
            <>
              No requalification mark entered, so the period runs from the original test
              (manufacture) date, <strong className="text-[var(--color-ink)]">{formatMonthYear(data.countedFrom)}</strong>.
              Under {data.section}, a coated DOT 4B, 4BA, 4BW or 4E cylinder used only for
              non-corrosive gas such as propane is first requalified{" "}
              {INITIAL_PERIOD_YEARS} years after that date:{" "}
              {formatMonthYear(data.countedFrom)} + {data.periodYears} years ={" "}
              <strong className="text-[var(--color-ink)]">{formatMonthYear(data.due)}</strong>.
            </>
          ) : (
            <>
              The most recent mark records the {data.method}, dated{" "}
              <strong className="text-[var(--color-ink)]">{formatMonthYear(data.countedFrom)}</strong>. Under{" "}
              {data.section}, the next one is due {data.periodYears} years later:{" "}
              {formatMonthYear(data.countedFrom)} + {data.periodYears} years ={" "}
              <strong className="text-[var(--color-ink)]">{formatMonthYear(data.due)}</strong>.
            </>
          )}
        </p>

        {data.baseDueIfNotQualified && (
          <div className="mb-5 rounded-md border border-[var(--color-line)] p-4">
            <h3 className="mb-1 text-sm font-semibold tracking-wide uppercase">The condition behind the 12 years</h3>
            <p className="text-sm text-[var(--color-muted)]">
              §180.209(e) allows 12 years &ldquo;instead of every 5 years&rdquo; only for a
              cylinder &ldquo;protected externally by a suitable corrosion-resistant coating and used
              exclusively for non-corrosive gas.&rdquo; If that does not describe this cylinder, the
              5-year period in the regulation&rsquo;s Table 1 would put the first requalification at{" "}
              <strong className="text-[var(--color-ink)]">{formatMonthYear(data.baseDueIfNotQualified)}</strong>.
            </p>
          </div>
        )}

        <div className="mb-5 rounded-md border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-4">
          <h3 className="mb-1 text-sm font-semibold tracking-wide uppercase">A date is not the only trigger</h3>
          <p className="text-sm text-[var(--color-muted)]">
            §180.209(c): a DOT 4-series cylinder that &ldquo;shows evidence of a leak, internal or
            external corrosion, denting, bulging or rough usage to the extent that it is likely to be
            weakened appreciably, or that has lost 5 percent or more of its official tare weight must
            be requalified before being refilled,&rdquo; whatever its date.
          </p>
        </div>

        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">How each mark is counted</h3>
        <div className="mb-5 overflow-x-auto rounded-md border border-[var(--color-line)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-accent-soft)] text-left">
              <tr>
                <th className="px-3 py-2 font-medium">Most recent date on the cylinder</th>
                <th className="px-3 py-2 font-medium">Next due</th>
                <th className="px-3 py-2 font-medium">Rule</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-line)]">
              <tr className={data.basis === "initial" ? "bg-[var(--color-accent-soft)]" : ""}>
                <td className="px-3 py-2">Manufacture date only</td>
                <td className="px-3 py-2">+{INITIAL_PERIOD_YEARS} years</td>
                <td className="px-3 py-2">§180.209(e)</td>
              </tr>
              {MARK_RULES.map((r) => (
                <tr key={r.mark} className={data.basis === r.mark ? "bg-[var(--color-accent-soft)]" : ""}>
                  <td className="px-3 py-2">{r.label} ({r.method})</td>
                  <td className="px-3 py-2">+{r.years} years</td>
                  <td className="px-3 py-2">{r.section}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
        <p className="text-sm text-[var(--color-muted)]">
          It reads the dates you enter. It cannot see the cylinder, so it cannot say whether the
          cylinder is in a condition to be filled, and it does not say whether a cylinder is safe.
          Requalification marks can only be applied by a holder of a DOT requalifier identification
          number (RIN), per §180.213.
        </p>

        <Footer retrievedAt={data.retrievedAt} />
      </div>
    </div>
  );
}

export default function PropaneTankTool() {
  const [container, setContainer] = useState<Container>("cylinder");
  const [mMonth, setMMonth] = useState("");
  const [mYear, setMYear] = useState("");
  const [mark, setMark] = useState<RequalMark>("none");
  const [rMonth, setRMonth] = useState("");
  const [rYear, setRYear] = useState("");
  const [state, setState] = useState<State>({ phase: "idle" });

  function run(e: React.FormEvent) {
    e.preventDefault();
    if (container === "asme") {
      setState({ phase: "asme" });
      return;
    }
    try {
      const num = (s: string) => (s.trim() === "" ? NaN : Number(s.trim()));
      const data = checkPropaneCylinder({
        manufactured: { month: num(mMonth), year: num(mYear) },
        lastMark: mark,
        requalified: mark === "none" ? null : { month: num(rMonth), year: num(rYear) },
        today: currentMonth(),
      });
      setState({ phase: "result", data });
    } catch (err) {
      const e2 = asToolError(err);
      setState({ phase: "error", kind: e2.kind, message: e2.message });
    }
  }

  const radio = "flex cursor-pointer items-start gap-2 text-sm";

  return (
    <div>
      <form onSubmit={run} className="mb-6">
        <fieldset className="mb-5">
          <legend className="mb-1.5 font-medium">What kind of propane container is it?</legend>
          <div className="grid gap-2">
            <label className={radio}>
              <input type="radio" name="container" className="mt-1" checked={container === "cylinder"} onChange={() => setContainer("cylinder")} />
              <span>A portable cylinder with &ldquo;DOT&rdquo; stamped on the collar (grill, RV, forklift, 100 lb cylinders)</span>
            </label>
            <label className={radio}>
              <input type="radio" name="container" className="mt-1" checked={container === "asme"} onChange={() => setContainer("asme")} />
              <span>A large tank that stays in place, with an &ldquo;ASME&rdquo; data plate</span>
            </label>
          </div>
        </fieldset>

        {container === "cylinder" && (
          <>
            <MonthYearFields
              label="Manufacture date stamped on the collar"
              month={mMonth}
              year={mYear}
              onMonth={setMMonth}
              onYear={setMYear}
              hint={'Stamped as month and two-digit year, often with an inspector\'s mark between them: "04 ◆ 19" means April 2019. It is the earliest date on the collar.'}
            />

            <fieldset className="mb-4">
              <legend className="mb-1.5 font-medium">Is there a later requalification date?</legend>
              <p className="mb-2 text-xs text-[var(--color-muted)]">
                A requalification date is a month and year with a 4-character RIN set in a square
                between them, sometimes followed by a letter. Use the most recent one.
              </p>
              <div className="grid gap-2">
                <label className={radio}>
                  <input type="radio" name="mark" className="mt-1" checked={mark === "none"} onChange={() => setMark("none")} />
                  <span>No, only the manufacture date</span>
                </label>
                {MARK_RULES.map((r) => (
                  <label key={r.mark} className={radio}>
                    <input type="radio" name="mark" className="mt-1" checked={mark === r.mark} onChange={() => setMark(r.mark)} />
                    <span>Yes: {r.label.charAt(0).toLowerCase() + r.label.slice(1)}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {mark !== "none" && (
              <MonthYearFields
                label="Date of that requalification mark"
                month={rMonth}
                year={rYear}
                onMonth={setRMonth}
                onYear={setRYear}
                hint={'The regulation\'s own example: "9", then "A1" above "32" (the RIN A123 in a square), then "06" means September 2006. A letter after the year, such as E or S, picks the option above.'}
              />
            )}
          </>
        )}

        <button type="submit" className="rounded-md bg-[var(--color-accent)] px-5 py-2.5 font-medium text-white">
          Check the date
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

        {state.phase === "asme" && (
          <div className="rounded-lg border border-[var(--color-line)]">
            <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
              <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">No requalification date from this rule</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight">§180.209 does not cover this tank</p>
            </div>
            <div className="p-5">
              <p className="text-sm text-[var(--color-muted)]">
                49 CFR 180.209 sets requalification periods for DOT <em>specification cylinders</em>,
                the ones with a DOT specification (such as DOT-4BA240) stamped on the collar. A tank
                identified by an ASME data plate rather than a DOT specification is not one of the
                cylinders in that section&rsquo;s Table 1, so this page has no date to give for it. The
                propane company or a licensed inspector in your state is who to ask about that tank.
              </p>
              <Footer retrievedAt="2026-10-04" />
            </div>
          </div>
        )}

        {state.phase === "result" && <ResultCard data={state.data} />}
      </div>
    </div>
  );
}
