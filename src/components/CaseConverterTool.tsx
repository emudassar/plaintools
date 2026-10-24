"use client";

import { useState } from "react";
import { ResultCard } from "./CalcBits";
import { Btn, Tabs } from "./ToolBits";
import { convertCase, type CaseMode } from "@/lib/text-tools";

const MODES: readonly (readonly [CaseMode, string])[] = [
  ["upper", "UPPERCASE"],
  ["lower", "lowercase"],
  ["title", "Title Case"],
  ["sentence", "Sentence case"],
  ["capitalize", "Capitalize Each Word"],
  ["alternating", "aLtErNaTiNg"],
  ["inverse", "iNVERSE"],
  ["camel", "camelCase"],
  ["pascal", "PascalCase"],
  ["snake", "snake_case"],
  ["kebab", "kebab-case"],
  ["constant", "CONSTANT_CASE"],
];

const RULES: Record<CaseMode, string> = {
  upper: "Every letter capitalised.",
  lower: "Every letter in lower case.",
  title: "First and last word and every word of four or more letters capitalised; shorter articles, conjunctions and prepositions (a, an, the, and, but, or, for, of, on, to, in, at, by, as…) lower case unless they start the title or follow a colon. All-capital short words such as NASA are kept.",
  sentence: "Everything lower case, then the first letter of each sentence and the word “I” capitalised. Proper nouns are not detected — capitalise names yourself.",
  capitalize: "The first letter of every word capitalised, the rest lower case.",
  alternating: "Letters alternate lower and upper case; spaces and punctuation are skipped.",
  inverse: "Every letter's case is flipped.",
  camel: "Words joined, first word lower case, later words capitalised. Punctuation removed.",
  pascal: "Words joined, every word capitalised. Punctuation removed.",
  snake: "Words in lower case joined with underscores.",
  kebab: "Words in lower case joined with hyphens.",
  constant: "Words in upper case joined with underscores.",
};

export default function CaseConverterTool() {
  const [text, setText] = useState("the quick brown fox jumps over the lazy dog");
  const [mode, setMode] = useState<CaseMode>("title");
  const [copied, setCopied] = useState(false);
  const out = convertCase(text, mode);

  return (
    <div>
      <label htmlFor="case-in" className="mb-1.5 block font-medium">
        Your text
      </label>
      <textarea id="case-in" rows={6} value={text} onChange={(e) => setText(e.target.value)} className="mb-4 w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5" />
      <Tabs value={mode} onChange={setMode} options={MODES} />
      <div aria-live="polite">
        <ResultCard
          label={MODES.find(([m]) => m === mode)![1]}
          headline={<span className="block text-lg font-normal break-words whitespace-pre-wrap">{out || "—"}</span>}
          method={<p>Rule: {RULES[mode]} Converted in your browser; nothing is sent anywhere.</p>}
        >
          <Btn
            onClick={() => {
              void navigator.clipboard?.writeText(out);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            primary
          >
            {copied ? "Copied" : "Copy result"}
          </Btn>
        </ResultCard>
      </div>
    </div>
  );
}
