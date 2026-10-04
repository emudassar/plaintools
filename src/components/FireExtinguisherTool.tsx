"use client";

import { useId, useState } from "react";
import {
  checkExtinguisher,
  TABLE_L1,
  FOOTNOTE_1,
  SIX_YEAR_PERIOD,
  REGULATION_CURRENT_AS_OF,
  type DueDate,
  type ExtinguisherResult,
} from "@/lib/fire-extinguisher";
import { currentMonth, formatMonthYear, formatMonths } from "@/lib/month";
import { asToolError, type ErrorKind } from "@/lib/errors";
import MonthYearFields from "@/components/MonthYearFields";

/**
 * Three real states: idle / error / result. No loading state: date arithmetic
 * against Table L-1, compiled into the page.
 *
 * The result reports the dates OSHA's table gives. It never says an
 * extinguisher works, is safe, or should be replaced.
 */

type State =
  | { phase: "idle" }
  | { phase: "error"; kind: ErrorKind; message: string }
  | { phase: "result"; data: ExtinguisherResult };

const ECFR_1910_157 = "https://www.ecfr.gov/current/title-29/part-1910/section-1910.157";

function Footer({ retrievedAt }: { retrievedAt: string }) {
  return (
    <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
      <p>
        Source: OSHA, 29 CFR 1910.157 (Portable fire extinguishers), paragraphs (e) and (f) and Table
        L-1. Text current as of {REGULATION_CURRENT_AS_OF} on eCFR, retrieved {retrievedAt}.
      </p>
      <p className="mt-1">
        <a href={ECFR_1910_157} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
          eCFR: 29 CFR 1910.157
        </a>
      </p>
    </footer>
  );
}

function when(d: DueDate): string {
  if (d.status === "overdue") return `was due by ${formatMonthYear(d.due)}, ${formatMonths(d.monthsRemaining)} ago`;
  if (d.status === "due-this-month") return `is due by ${formatMonthYear(d.due)}, which is this month`;
  return `is due by ${formatMonthYear(d.due)}, ${formatMonths(d.monthsRemaining)} from now`;
}

function Scope() {
  return (
    <>
      <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">What this page cannot tell you</h3>
      <p className="text-sm text-[var(--color-muted)]">
        1910.157 is an OSHA workplace standard: it says what an employer must do. It is not a rule
        for homes, and it is not NFPA 10, the standard most local fire codes adopt, which can set
        its own requirements. This page cannot see the extinguisher, so it cannot say whether it
        works or is charged. It works out the dates the table gives for the type and date entered.
      </p>
    </>
  );
}

function ResultCard({ data }: { data: ExtinguisherResult }) {
  if (data.kind === "removed-1982") {
    return (
      <div className="rounded-lg border border-[var(--color-warn-line)]">
        <div className="border-b border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-5">
          <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">Table L-1, footnote 1</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">No test interval: removal date was January 1, 1982</p>
        </div>
        <div className="p-5">
          <p className="mb-5 text-sm text-[var(--color-muted)]">
            Table L-1 gives no interval for <strong className="text-[var(--color-ink)]">{data.type.name}</strong>. Its
            footnote reads: &ldquo;{FOOTNOTE_1}&rdquo;
          </p>
          <Scope />
          <Footer retrievedAt={data.retrievedAt} />
        </div>
      </div>
    );
  }

  if (data.kind === "disposable") {
    return (
      <div className="rounded-lg border border-[var(--color-line)]">
        <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
          <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">Disposable dry chemical extinguisher</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">OSHA&rsquo;s table gives no date for this one</p>
        </div>
        <div className="p-5">
          <p className="mb-3 text-sm text-[var(--color-muted)]">
            Paragraph (e)(4) states that &ldquo;dry chemical extinguishers having non-refillable disposable
            containers are exempt&rdquo; from the 6-year emptying and maintenance requirement. Nothing in
            1910.157 sets a service life for a non-refillable unit, so this page has no date to give.
          </p>
          <p className="mb-5 text-sm text-[var(--color-muted)]">
            The manufacturer&rsquo;s label or instructions are where a figure for that specific unit
            would come from.
          </p>
          <Scope />
          <Footer retrievedAt={data.retrievedAt} />
        </div>
      </div>
    );
  }

  const { hydro, sixYear } = data;
  const first = sixYear && sixYear.status !== "ok" && hydro.status === "ok" ? sixYear : null;
  const worst = [hydro, sixYear].some((d) => d && d.status !== "ok");

  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div
        className={`border-b p-5 ${
          worst
            ? "border-[var(--color-warn-line)] bg-[var(--color-warn-soft)]"
            : "border-[var(--color-line)] bg-[var(--color-accent-soft)]"
        }`}
      >
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">Next hydrostatic test, Table L-1</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {hydro.status === "overdue" ? "Was due by " : "Due by "}
          {formatMonthYear(hydro.due)}
        </p>
        <p className="mt-1 text-[var(--color-muted)]">
          {hydro.status === "overdue"
            ? `That was ${formatMonths(hydro.monthsRemaining)} ago.`
            : hydro.status === "due-this-month"
              ? "That is this month."
              : `${formatMonths(hydro.monthsRemaining)} from now.`}
          {first && ` The 6-year maintenance ${when(first)}.`}
        </p>
      </div>

      <div className="p-5">
        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">How the dates were worked out</h3>
        <p className="mb-3 text-sm text-[var(--color-muted)]">
          Table L-1 lists <strong className="text-[var(--color-ink)]">{data.type.name}</strong> at a{" "}
          {hydro.intervalYears}-year hydrostatic test interval: {formatMonthYear(hydro.countedFrom)} +{" "}
          {hydro.intervalYears} years = <strong className="text-[var(--color-ink)]">{formatMonthYear(hydro.due)}</strong>.
        </p>
        {sixYear && (
          <p className="mb-5 text-sm text-[var(--color-muted)]">
            Paragraph (e)(4) also applies: stored pressure dry chemical extinguishers that need a 12-year
            hydrostatic test must be emptied and given maintenance every {SIX_YEAR_PERIOD} years, and
            &ldquo;when recharging or hydrostatic testing is performed, the 6-year requirement begins from
            that date.&rdquo; Counted from {sixYear.countedFromRecharge ? "the last recharge" : "the manufacture or test date"},{" "}
            {formatMonthYear(sixYear.countedFrom)}, the 6-year maintenance {when(sixYear)}.
          </p>
        )}
        {!sixYear && <div className="mb-5" />}

        <div className="mb-5 rounded-md border border-[var(--color-line)] p-4">
          <h3 className="mb-1 text-sm font-semibold tracking-wide uppercase">Between those dates</h3>
          <p className="text-sm text-[var(--color-muted)]">
            The same section requires a visual inspection monthly (e)(2) and an annual maintenance
            check (e)(3), with the annual maintenance date recorded.
          </p>
        </div>

        <div className="mb-5 rounded-md border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-4">
          <h3 className="mb-1 text-sm font-semibold tracking-wide uppercase">When the table interval does not apply</h3>
          <p className="text-sm text-[var(--color-muted)]">
            Paragraph (f)(2) excepts a unit that has been repaired by soldering, welding, brazing or
            patching compounds, has damaged threads, has corrosion that has caused pitting, has been
            burned in a fire, or has had calcium chloride agent used in a stainless steel shell.
            Paragraph (f)(4) requires a test whenever an extinguisher shows new evidence of corrosion or
            mechanical injury, outside those conditions. Paragraph (f)(14) requires a shell that fails a
            test, or is not fit for testing, to be removed from service.
          </p>
        </div>

        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">Table L-1</h3>
        <div className="mb-5 overflow-x-auto rounded-md border border-[var(--color-line)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-accent-soft)] text-left">
              <tr>
                <th className="px-3 py-2 font-medium">Type of extinguisher</th>
                <th className="px-3 py-2 font-medium">Test interval (years)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-line)]">
              {TABLE_L1.map((t) => (
                <tr key={t.id} className={t.id === data.type.id ? "bg-[var(--color-accent-soft)]" : ""}>
                  <td className="px-3 py-2">{t.name}</td>
                  <td className="px-3 py-2">{t.intervalYears ?? <span>(1)</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-[var(--color-line)] p-2 text-xs text-[var(--color-muted)]">(1) {FOOTNOTE_1}</p>
        </div>

        <Scope />
        <Footer retrievedAt={data.retrievedAt} />
      </div>
    </div>
  );
}

export default function FireExtinguisherTool() {
  const [typeId, setTypeId] = useState(TABLE_L1[0].id);
  const [disposable, setDisposable] = useState(false);
  const [hMonth, setHMonth] = useState("");
  const [hYear, setHYear] = useState("");
  const [rMonth, setRMonth] = useState("");
  const [rYear, setRYear] = useState("");
  const [state, setState] = useState<State>({ phase: "idle" });
  const typeSelectId = useId();

  const type = TABLE_L1.find((t) => t.id === typeId) ?? TABLE_L1[0];
  const isDryChem = type.id.startsWith("dry-chem");
  const needsDate = type.intervalYears !== null && !(isDryChem && disposable);

  function run(e: React.FormEvent) {
    e.preventDefault();
    try {
      const num = (s: string) => (s.trim() === "" ? NaN : Number(s.trim()));
      const rechargeGiven = type.sixYearRule && (rMonth !== "" || rYear.trim() !== "");
      const data = checkExtinguisher({
        typeId,
        disposable: isDryChem && disposable,
        lastHydro: { month: num(hMonth), year: num(hYear) },
        lastRecharge: rechargeGiven ? { month: num(rMonth), year: num(rYear) } : null,
        today: currentMonth(),
      });
      setState({ phase: "result", data });
    } catch (err) {
      const e2 = asToolError(err);
      setState({ phase: "error", kind: e2.kind, message: e2.message });
    }
  }

  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5";

  return (
    <div>
      <form onSubmit={run} className="mb-6">
        <div className="mb-4">
          <label htmlFor={typeSelectId} className="mb-1.5 block font-medium">
            Type of extinguisher (OSHA Table L-1)
          </label>
          <select id={typeSelectId} value={typeId} onChange={(e) => setTypeId(e.target.value)} className={field}>
            {TABLE_L1.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-[var(--color-muted)]">
            The extinguishing agent, and whether it is stored pressure or cartridge operated, are on the
            extinguisher&rsquo;s label. The rows are OSHA&rsquo;s own wording.
          </p>
        </div>

        {isDryChem && (
          <label className="mb-4 flex cursor-pointer items-start gap-2 text-sm">
            <input type="checkbox" className="mt-1" checked={disposable} onChange={(e) => setDisposable(e.target.checked)} />
            <span>It is a non-refillable (disposable) unit</span>
          </label>
        )}

        {needsDate && (
          <MonthYearFields
            label="Manufacture date, or the date of the last hydrostatic test"
            month={hMonth}
            year={hYear}
            onMonth={setHMonth}
            onYear={setHYear}
            hint="Use the most recent hydrostatic test date if it has had one; otherwise the date of manufacture."
          />
        )}

        {needsDate && type.sixYearRule && (
          <MonthYearFields
            label="Last recharge or 6-year maintenance (optional)"
            month={rMonth}
            year={rYear}
            onMonth={setRMonth}
            onYear={setRYear}
            hint="Under (e)(4) a recharge restarts the 6-year clock. Leave blank if there has been none since the date above."
          />
        )}

        <button type="submit" className="rounded-md bg-[var(--color-accent)] px-5 py-2.5 font-medium text-white">
          Check the dates
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
