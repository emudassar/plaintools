"use client";

import { useState } from "react";
import { ErrorBox, Grid, Hint, NumField, ResultCard, SelectField, TextField, num } from "./CalcBits";
import { Btn } from "./ToolBits";
import { usernames, type UsernameOptions } from "@/lib/fun-tools";
import { isToolError } from "@/lib/errors";

function Name({ u }: { u: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard?.writeText(u);
        setDone(true);
        setTimeout(() => setDone(false), 1000);
      }}
      className="rounded-md border border-[var(--color-line)] bg-white px-3 py-2 text-left font-mono text-sm"
      title="Copy"
    >
      {done ? "Copied ✓" : u}
    </button>
  );
}

export default function UsernameTool() {
  const [style, setStyle] = useState<UsernameOptions["style"]>("adj-noun");
  const [base, setBase] = useState("");
  const [sep, setSep] = useState<UsernameOptions["separator"]>("_");
  const [cap, setCap] = useState(false);
  const [numb, setNumb] = useState(true);
  const [max, setMax] = useState("20");
  const [list, setList] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function go() {
    try {
      setList(usernames({ style, base, separator: sep, capitalize: cap, addNumber: numb, maxLength: num(max), count: 24 }));
      setError(null);
    } catch (e) {
      setList(null);
      setError(isToolError(e) ? e.message : "Those options could not be used.");
    }
  }

  return (
    <div>
      <Grid cols={3}>
        <SelectField
          label="Style"
          value={style}
          onChange={setStyle}
          options={[
            ["adj-noun", "Adjective + noun (swift_otter)"],
            ["noun-noun", "Noun + noun (comet_fox)"],
            ["word-number", "Word + number (falcon4821)"],
            ["name-based", "Built on my name or word"],
          ]}
        />
        {style === "name-based" ? <TextField label="Your name or word" value={base} onChange={setBase} /> : <div />}
        <SelectField label="Separator" value={sep} onChange={setSep} options={[["_", "Underscore _"], [".", "Dot ."], ["-", "Hyphen -"], ["", "None"]]} />
      </Grid>
      <Grid cols={3}>
        <NumField label="Maximum length" value={max} onChange={setMax} step="1" hint="Use the limit of the site you are signing up to." />
        <label className="flex items-center gap-2 pt-6">
          <input type="checkbox" checked={cap} onChange={(e) => setCap(e.target.checked)} />
          <span>Capitalise words</span>
        </label>
        <label className="flex items-center gap-2 pt-6">
          <input type="checkbox" checked={numb} onChange={(e) => setNumb(e.target.checked)} />
          <span>Add a number</span>
        </label>
      </Grid>
      <div className="mb-3">
        <Btn onClick={go} primary>
          {list ? "Generate more" : "Generate usernames"}
        </Btn>
      </div>
      <Hint>Tap a username to copy it. Whether it is free on a given site, and which characters that site allows, can only be checked on the site itself.</Hint>
      <div aria-live="polite">
        {error && <ErrorBox message={error} />}
        {list && (
          <ResultCard
            label={`${list.length} usernames`}
            headline={list[0]}
            limits="The page cannot check availability, trademarks or whether a name means something unwanted in another language. Avoid putting your full name, birth year or location in a public username if privacy matters to you."
            method={<p>Words are drawn from this page&apos;s own lists of everyday adjectives and nouns using your browser&apos;s cryptographic random numbers (Web Crypto). Nothing is stored or sent.</p>}
          >
            <div className="mb-4 grid gap-2 sm:grid-cols-3">
              {list.map((u) => (
                <Name key={u} u={u} />
              ))}
            </div>
          </ResultCard>
        )}
      </div>
    </div>
  );
}
