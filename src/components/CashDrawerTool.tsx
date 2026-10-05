"use client";

import { useState, useId } from "react";
import { calculateCashDrawer, DENOMINATIONS, USMINT_ROLLS_URL, type CashResult } from "@/lib/cash-drawer";
import { isToolError } from "@/lib/errors";

/** Recomputed as inputs change. No loading state. */

const usd = (cents: number) => (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

function ResultCard({ data }: { data: CashResult }) {
  const os = data.overShortCents;
  const pulled = data.lines.filter((l) => l.count > 0);
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">Counted in the drawer</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">{usd(data.totalCents)}</p>
        <p className="mt-1 text-[var(--color-muted)]">
          {data.belowFloat
            ? `That is ${usd(data.floatCents - data.totalCents)} less than the ${usd(data.floatCents)} starting float, so there is nothing to deposit.`
            : `Deposit ${usd(data.depositCents)} and leave the ${usd(data.floatCents)} float.`}
          {os !== null && (os === 0 ? " The drawer balances exactly." : os > 0 ? ` The drawer is over by ${usd(os)}.` : ` The drawer is short by ${usd(-os)}.`)}
        </p>
      </div>
      <div className="p-5 text-sm">
        {data.unmatchedCents > 0 && (
          <div className="mb-4 rounded-md border border-[var(--color-warn-line)] bg-[var(--color-warn-soft)] p-3">
            <p className="font-medium">The drawer&rsquo;s mix cannot make the deposit exactly</p>
            <p className="mt-1 text-[var(--color-muted)]">
              The pull below comes to {usd(data.depositCents - data.unmatchedCents)}, {usd(data.unmatchedCents)} short of the
              deposit, so the drawer would keep {usd(data.floatCents + data.unmatchedCents)}. Making change from the safe would fix it.
            </p>
          </div>
        )}
        {!data.belowFloat && (
          <>
            <h3 className="mb-2 font-semibold tracking-wide uppercase">What to pull for the deposit</h3>
            <table className="mb-5 w-full text-left">
              <thead className="text-[var(--color-muted)]">
                <tr>
                  <th className="py-1 font-medium">Denomination</th>
                  <th className="py-1 font-medium">Counted</th>
                  <th className="py-1 font-medium">Pull</th>
                  <th className="py-1 font-medium">Leave</th>
                </tr>
              </thead>
              <tbody>
                {pulled.map((l) => (
                  <tr key={l.denomination.id} className="border-t border-[var(--color-line)]">
                    <td className="py-1">{l.denomination.label}</td>
                    <td className="py-1">
                      {l.count} ({usd(l.cents)})
                    </td>
                    <td className="py-1">{l.pull}</td>
                    <td className="py-1">{l.leave}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        <h3 className="mb-2 font-semibold tracking-wide uppercase">The arithmetic</h3>
        <p className="mb-5 text-[var(--color-muted)]">
          Total = each count × its value. Deposit = total − starting float.
          {os !== null && " Over/short = total − (float + expected cash from the register report)."} The pull takes larger
          notes first and then finds an exact mix for the rest when one exists.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>Coin roll contents: U.S. Mint (40 quarters, 50 dimes, 40 nickels, 50 pennies per roll). Retrieved {data.retrievedAt}.</p>
          <p className="mt-1">
            <a href={USMINT_ROLLS_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] underline">
              U.S. Mint — Coin Count &rsquo;n&rsquo; Roll
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function CashDrawerTool() {
  const [counts, setCounts] = useState<Record<string, string>>({ "20": "4", "10": "3", "5": "6", "1": "22", "roll-q": "1", c25: "13", c10: "9", c5: "6", c1: "17" });
  const [float, setFloat] = useState("150");
  const [expected, setExpected] = useState("");
  const ids = { f: useId(), e: useId() };

  let data: CashResult | null = null;
  let error: string | null = null;
  try {
    const parsed: Record<string, number> = {};
    for (const d of DENOMINATIONS) {
      const v = counts[d.id] ?? "";
      parsed[d.id] = v.trim() === "" ? 0 : Number(v);
    }
    data = calculateCashDrawer({ counts: parsed, float: float.trim() === "" ? 0 : Number(float), expected: expected.trim() === "" ? null : Number(expected) });
  } catch (e) {
    error = isToolError(e) ? e.message : "That input could not be used.";
  }
  const field = "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2";
  const groups: { title: string; kind: string }[] = [
    { title: "Notes", kind: "note" },
    { title: "Rolled coin", kind: "roll" },
    { title: "Loose coin", kind: "coin" },
  ];

  return (
    <div>
      <div className="mb-3 grid gap-4 sm:grid-cols-3">
        {groups.map((g) => (
          <fieldset key={g.kind}>
            <legend className="mb-2 font-medium">{g.title}</legend>
            <div className="space-y-2">
              {DENOMINATIONS.filter((d) => d.kind === g.kind).map((d) => (
                <label key={d.id} className="grid grid-cols-[1fr_6rem] items-center gap-2 text-sm">
                  <span>{d.label}</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1"
                    value={counts[d.id] ?? ""}
                    onChange={(e) => setCounts((c) => ({ ...c, [d.id]: e.target.value }))}
                    className={field}
                  />
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      <div className="mb-2 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={ids.f} className="mb-1.5 block font-medium">
            Starting float to leave ($)
          </label>
          <input id={ids.f} type="number" inputMode="decimal" min="0" step="any" value={float} onChange={(e) => setFloat(e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor={ids.e} className="mb-1.5 block font-medium">
            Expected cash sales from register ($) <span className="font-normal text-[var(--color-muted)]">(optional)</span>
          </label>
          <input id={ids.e} type="number" inputMode="decimal" min="0" step="any" value={expected} onChange={(e) => setExpected(e.target.value)} className={field} />
        </div>
      </div>
      <p className="mb-6 text-xs text-[var(--color-muted)]">The answer updates as you type; nothing is sent anywhere.</p>
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
