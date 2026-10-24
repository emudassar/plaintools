"use client";

import { useState } from "react";
import { ErrorBox, Grid, Hint, NumField, ResultCard, SelectField, num } from "./CalcBits";
import { Btn } from "./ToolBits";
import { makeTeams, parseList } from "@/lib/fun-tools";
import { isToolError } from "@/lib/errors";

export default function TeamGeneratorTool() {
  const [text, setText] = useState("Ava\nBen\nChloe\nDaniel\nElla\nFinn\nGrace\nHenry\nIsla\nJack");
  const [mode, setMode] = useState<"count" | "size">("count");
  const [value, setValue] = useState("2");
  const [teams, setTeams] = useState<string[][] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const names = parseList(text);

  function go() {
    try {
      setTeams(makeTeams(names, mode, num(value)));
      setError(null);
    } catch (e) {
      setTeams(null);
      setError(isToolError(e) ? e.message : "Those inputs could not be used.");
    }
  }
  const asText = teams ? teams.map((t, i) => `Team ${i + 1}: ${t.join(", ")}`).join("\n") : "";

  return (
    <div>
      <label htmlFor="team-names" className="mb-1.5 block font-medium">
        Names, one per line or separated by commas ({names.length})
      </label>
      <textarea id="team-names" rows={8} value={text} onChange={(e) => setText(e.target.value)} className="mb-3 w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5" />
      <Grid cols={3}>
        <SelectField label="Split by" value={mode} onChange={setMode} options={[["count", "Number of teams"], ["size", "People per team"]]} />
        <NumField label={mode === "count" ? "Number of teams" : "People per team"} value={value} onChange={setValue} step="1" />
        <div className="flex items-end">
          <Btn onClick={go} primary>
            {teams ? "Shuffle again" : "Make teams"}
          </Btn>
        </div>
      </Grid>
      <Hint>When the names do not divide evenly, team sizes differ by at most one.</Hint>
      <div aria-live="polite">
        {error && <ErrorBox message={error} />}
        {teams && (
          <ResultCard
            label={`${names.length} people in ${teams.length} teams`}
            headline={`Sizes: ${teams.map((t) => t.length).join(" / ")}`}
            method={<p>Method: the list is shuffled with a Fisher–Yates shuffle driven by your browser&apos;s cryptographic random numbers (Web Crypto), then dealt out one name per team in turn. Nothing is stored or sent.</p>}
          >
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              {teams.map((t, i) => (
                <div key={i} className="rounded-md border border-[var(--color-line)] p-3">
                  <p className="mb-1 font-semibold">Team {i + 1}</p>
                  <ol className="list-decimal pl-5">
                    {t.map((n, j) => (
                      <li key={j}>{n}</li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
            <Btn
              onClick={() => {
                void navigator.clipboard?.writeText(asText);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? "Copied" : "Copy teams"}
            </Btn>
          </ResultCard>
        )}
      </div>
    </div>
  );
}
