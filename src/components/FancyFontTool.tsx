"use client";

import { useState } from "react";
import { ResultCard } from "./CalcBits";
import { Ext } from "./GeoBits";
import { UNICODE_MATH_URL, fancyVariants } from "@/lib/text-tools";

function Row({ name, text }: { name: string; text: string }) {
  const [done, setDone] = useState(false);
  return (
    <tr>
      <td className="px-3 py-2 align-top text-xs text-[var(--color-muted)]">{name}</td>
      <td className="px-3 py-2 text-lg break-all">{text}</td>
      <td className="px-3 py-2 text-right align-top">
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard?.writeText(text);
            setDone(true);
            setTimeout(() => setDone(false), 1200);
          }}
          className="rounded border border-[var(--color-line)] bg-white px-2 py-1 text-xs"
        >
          {done ? "Copied" : "Copy"}
        </button>
      </td>
    </tr>
  );
}

export default function FancyFontTool() {
  const [text, setText] = useState("Hello World 2026");
  const variants = fancyVariants(text);

  return (
    <div>
      <label htmlFor="fancy-in" className="mb-1.5 block font-medium">
        Your text
      </label>
      <input id="fancy-in" value={text} onChange={(e) => setText(e.target.value)} className="mb-4 w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5" />
      <div aria-live="polite">
        <ResultCard
          label={`${variants.length} styles — tap Copy and paste anywhere`}
          headline={variants[3].text || "—"}
          limits="These are Unicode symbols, not a font, so they paste into most apps. Screen readers may read them letter by letter or skip them, search engines and some platforms may not match them as normal words, and a few fonts on older devices show empty boxes. Only A–Z, a–z and some digits have styled versions; other characters are left as typed."
          method={
            <p>
              Each letter is swapped for the matching character in the Unicode Mathematical Alphanumeric Symbols block (<Ext href={UNICODE_MATH_URL}>Unicode chart U+1D400</Ext>), with the Letterlike Symbols the block leaves out (such as script ℬ and
              double-struck ℂ), Enclosed Alphanumerics for circled letters and Fullwidth Forms for wide text. Converted in your browser.
            </p>
          }
        >
          <div className="mb-5 overflow-x-auto rounded-md border border-[var(--color-line)]">
            <table className="w-full">
              <tbody className="divide-y divide-[var(--color-line)]">
                {variants.map((v) => (
                  <Row key={v.id} name={v.name} text={v.text} />
                ))}
              </tbody>
            </table>
          </div>
        </ResultCard>
      </div>
    </div>
  );
}
