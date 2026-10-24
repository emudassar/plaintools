"use client";

import { useState } from "react";
import { DataTable, Grid, Hint, ResultCard, TextField, Output, attempt } from "./CalcBits";
import { Ext } from "./GeoBits";
import { FLAMES_URL, flames, lovesCount } from "@/lib/fun-tools";

export default function LoveCalculatorTool() {
  const [a, setA] = useState("Romeo");
  const [b, setB] = useState("Juliet");
  const result = attempt(() => ({ f: flames(a, b), l: lovesCount(a, b) }));

  return (
    <div>
      <Grid cols={2}>
        <TextField label="First name" value={a} onChange={setA} />
        <TextField label="Second name" value={b} onChange={setB} />
      </Grid>
      <Hint>Just for fun: these are the paper games played in school, worked out step by step. They count letters and cannot predict anything.</Hint>
      <Output
        result={result}
        render={({ f, l }) => (
          <ResultCard
            label={`${a} + ${b}`}
            headline={`LOVES score ${l.percent}% · FLAMES: ${f.meaning}`}
            sub="Use a nickname or another spelling and the score changes — another sign it is only a game."
            limits="A game, not a measurement. The score depends only on which letters the names contain, so any pair of names gets a number; nicknames and spelling change it. There are several playground versions of both games; the rules used here are written out below."
            method={
              <p>
                FLAMES as described in <Ext href={FLAMES_URL}>FLAMES (game)</Ext>: shared letters crossed out one for one, the remaining letters counted, then every n-th letter of F-L-A-M-E-S struck out until one is left. LOVES count: the letters
                L, O, V, E and S counted in “name loves name”, then neighbouring numbers added (a two-digit sum is reduced to its digit sum) until two digits remain.
              </p>
            }
          >
            <h3 className="mb-2 font-semibold tracking-wide uppercase">LOVES count, step by step</h3>
            <DataTable head={["L", "O", "V", "E", "S"]} rows={[l.counts]} />
            <DataTable head={["Step", "Numbers"]} rows={l.steps.map((s, i) => [i === 0 ? "Letter counts" : `Add neighbours (${i})`, s.join("  ")])} />
            <h3 className="mb-2 font-semibold tracking-wide uppercase">FLAMES</h3>
            <DataTable
              head={["", ""]}
              rows={[
                [`Letters left in ${a}`, f.leftA || "—"],
                [`Letters left in ${b}`, f.leftB || "—"],
                ["Count", f.remaining],
                ["Last letter standing", f.letter ? `${f.letter} = ${f.meaning}` : f.meaning],
              ]}
            />
          </ResultCard>
        )}
      />
    </div>
  );
}
