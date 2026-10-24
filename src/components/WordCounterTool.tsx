"use client";

import { useState } from "react";
import { DataTable, Grid, NumField, ResultCard, SelectField, fmt, optNum } from "./CalcBits";
import { Ext } from "./GeoBits";
import { BRYSBAERT_URL, READING_WPM, textStats } from "@/lib/text-tools";

export default function WordCounterTool() {
  const [text, setText] = useState("");
  const [limit, setLimit] = useState("");
  const [limitUnit, setLimitUnit] = useState<"words" | "chars">("words");
  const d = textStats(text);
  const mins = d.readingMinutes;

  return (
    <div>
      <label htmlFor="wc-text" className="mb-1.5 block font-medium">
        Your text
      </label>
      <textarea
        id="wc-text"
        rows={10}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type or paste your text here. Nothing leaves your browser."
        className="mb-4 w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5"
      />
      <Grid cols={2}>
        <NumField label="Your limit (optional)" value={limit} onChange={setLimit} step="1" hint="From the essay prompt, form or platform." />
        <SelectField label="Limit is in" value={limitUnit} onChange={setLimitUnit} options={[["words", "Words"], ["chars", "Characters (with spaces)"]]} />
      </Grid>
      <div aria-live="polite">
        <ResultCard
          label="Count"
          headline={`${d.words.toLocaleString("en-US")} words · ${d.characters.toLocaleString("en-US")} characters`}
          sub={`${d.charactersNoSpaces.toLocaleString("en-US")} without spaces · ${d.sentences} sentences · ${d.paragraphs} paragraphs · about ${mins < 1 ? `${Math.max(0, Math.round(mins * 60))} s` : `${fmt(mins, 1)} min`} to read`}
          rows={[
            ["Words", d.words.toLocaleString("en-US")],
            ["Characters (with spaces)", d.characters.toLocaleString("en-US")],
            ["Characters (no spaces)", d.charactersNoSpaces.toLocaleString("en-US")],
            ["Sentences", d.sentences],
            ["Paragraphs", d.paragraphs],
            ["Lines", d.lines],
            ["Average word length", `${fmt(d.avgWordLength, 1)} characters`],
            ["Reading time", `${fmt(mins, 1)} min at ${READING_WPM} words per minute`],
          ]}
          limits="Word processors count some things differently: hyphenated words, numbers, URLs and words joined by slashes can be one word or several depending on the program. A school, publisher or form may set its own counting rule; follow theirs."
          method={
            <p>
              Words are runs of letters or digits (apostrophes and hyphens inside a word keep it whole). Characters are counted as you see them, so an emoji or accented letter counts once. Reading time uses {READING_WPM} words per minute, the average adult
              silent reading rate for English non-fiction in Brysbaert (2019) (<Ext href={BRYSBAERT_URL}>Journal of Memory and Language</Ext>). Counted in your browser.
            </p>
          }
        >
          {optNum(limit) !== null && (
            <p className="mb-5 font-medium">
              {(() => {
                const n = optNum(limit)!;
                const have = limitUnit === "chars" ? d.characters : d.words;
                const unit = limitUnit === "chars" ? "characters" : "words";
                return have <= n ? `${(n - have).toLocaleString("en-US")} ${unit} left of your ${n.toLocaleString("en-US")} limit.` : `${(have - n).toLocaleString("en-US")} ${unit} over your ${n.toLocaleString("en-US")} limit.`;
              })()}
            </p>
          )}
          {d.topWords.length > 0 && (
            <>
              <h3 className="mb-2 font-semibold tracking-wide uppercase">Most used words</h3>
              <DataTable head={["Word", "Times", "Share of words"]} rows={d.topWords.map(([w, c]) => [w, c, `${fmt((c / d.words) * 100, 1)}%`])} />
            </>
          )}
        </ResultCard>
      </div>
    </div>
  );
}
