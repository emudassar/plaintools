"use client";

import { useState } from "react";
import { DataTable, DateField, ErrorBox, Grid, Hint, ResultCard, TextField, attempt, Output } from "./CalcBits";
import { Ext } from "./GeoBits";
import { Tabs } from "./ToolBits";
import { ROMAN_URL, fromRoman, toRoman } from "@/lib/text-tools";
import { isToolError } from "@/lib/errors";

export default function RomanNumeralTool() {
  const [mode, setMode] = useState<"convert" | "date">("convert");
  const [input, setInput] = useState("2026");
  const [date, setDate] = useState("2026-10-24");
  const [sep, setSep] = useState(".");

  const result = attempt(() => {
    const t = input.trim();
    if (/^\d+$/.test(t)) return { kind: "toRoman" as const, value: toRoman(Number(t)), n: Number(t) };
    const n = fromRoman(t);
    return { kind: "fromRoman" as const, value: String(n), n };
  });

  let dateErr: string | null = null;
  let parts: { m: string; d: string; y: string } | null = null;
  try {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
    if (!m) throw new Error();
    parts = { m: toRoman(Number(m[2])), d: toRoman(Number(m[3])), y: toRoman(Number(m[1])) };
  } catch (e) {
    dateErr = isToolError(e) ? e.message : "Pick a date.";
  }

  return (
    <div>
      <Tabs value={mode} onChange={setMode} options={[["convert", "Number ⇄ Roman numeral"], ["date", "Date in Roman numerals"]]} />
      {mode === "convert" ? (
        <>
          <Grid cols={2}>
            <TextField label="Number or Roman numeral" value={input} onChange={setInput} hint="Type 1994 or MCMXCIV — it converts either way." />
          </Grid>
          <Hint>Standard Roman numerals run from 1 (I) to 3,999 (MMMCMXCIX).</Hint>
          <Output
            result={result}
            render={(d) => (
              <ResultCard
                label={d.kind === "toRoman" ? `${d.n} in Roman numerals` : `${input.trim().toUpperCase()} as a number`}
                headline={d.value}
                sub={d.kind === "toRoman" ? undefined : `${input.trim().toUpperCase()} = ${d.n.toLocaleString("en-US")}`}
                method={
                  <p>
                    Standard subtractive notation: I 1, V 5, X 10, L 50, C 100, D 500, M 1,000; IV 4, IX 9, XL 40, XC 90, CD 400, CM 900. A numeral that is not in standard form (such as IIII or IC) is flagged with its standard spelling (
                    <Ext href={ROMAN_URL}>Roman numerals</Ext>).
                  </p>
                }
              >
                <DataTable
                  head={["Part", "Value", "Numeral"]}
                  rows={[1000, 100, 10, 1]
                    .map((p) => Math.floor((d.n % (p * 10)) / p) * p)
                    .filter((v) => v > 0)
                    .map((v) => [v >= 1000 ? "Thousands" : v >= 100 ? "Hundreds" : v >= 10 ? "Tens" : "Ones", v.toLocaleString("en-US"), toRoman(v)])}
                />
              </ResultCard>
            )}
          />
        </>
      ) : (
        <>
          <Grid cols={2}>
            <DateField label="Date" value={date} onChange={setDate} />
            <TextField label="Separator" value={sep} onChange={setSep} hint="A dot, dash, space or bullet." />
          </Grid>
          <div aria-live="polite">
            {dateErr || !parts ? (
              <ErrorBox message={dateErr ?? "Pick a date."} />
            ) : (
              <ResultCard
                label="Date in Roman numerals"
                headline={`${parts.m}${sep}${parts.d}${sep}${parts.y}`}
                sub="Month · day · year (US order)"
                rows={[
                  ["Month · day · year", `${parts.m}${sep}${parts.d}${sep}${parts.y}`],
                  ["Day · month · year", `${parts.d}${sep}${parts.m}${sep}${parts.y}`],
                  ["Year only", parts.y],
                  ["Short year", Number(date.slice(2, 4)) > 0 ? toRoman(Number(date.slice(2, 4))) : "— (00 has no Roman numeral)"],
                ]}
                limits="Check a tattoo or engraving layout against a second source before it becomes permanent; the order (month first or day first) is a choice the numerals cannot show."
                method={<p>Each part of the date converted on its own with standard subtractive notation.</p>}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
