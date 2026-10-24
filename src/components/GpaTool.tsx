"use client";

import { useState } from "react";
import { DataTable, Grid, Hint, NumField, ResultCard, Output, attempt, optNum, fmt, fieldClass } from "./CalcBits";
import { Ext } from "./GeoBits";
import { Btn } from "./ToolBits";
import { GRADING_URL, LETTERS, gpa, gradePoints, type Course, type Letter } from "@/lib/study-calc";

interface Row {
  name: string;
  grade: Letter | "";
  credits: string;
  boost: string;
}

const START: Row[] = [
  { name: "Course 1", grade: "A", credits: "3", boost: "0" },
  { name: "Course 2", grade: "B+", credits: "4", boost: "0" },
  { name: "Course 3", grade: "A-", credits: "3", boost: "0" },
  { name: "Course 4", grade: "", credits: "3", boost: "0" },
];

export default function GpaTool() {
  const [rows, setRows] = useState<Row[]>(START);
  const [aPlus, setAPlus] = useState(false);
  const [prevGpa, setPrevGpa] = useState("");
  const [prevCr, setPrevCr] = useState("");
  const upd = (i: number, k: keyof Row, v: string) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, [k]: v } : r)));

  const courses: Course[] = rows.map((r) => ({ grade: r.grade, credits: r.credits.trim() === "" ? NaN : Number(r.credits), boost: Number(r.boost) }));
  const result = attempt(() => gpa(courses, aPlus, optNum(prevGpa), optNum(prevCr)));

  return (
    <div>
      <div className="mb-3 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              <th className="py-1 pr-2 font-medium">Course</th>
              <th className="py-1 pr-2 font-medium">Grade</th>
              <th className="py-1 pr-2 font-medium">Credits</th>
              <th className="py-1 pr-2 font-medium">Weighting</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="py-1 pr-2">
                  <input className={fieldClass} value={r.name} onChange={(e) => upd(i, "name", e.target.value)} aria-label={`Course ${i + 1} name`} />
                </td>
                <td className="py-1 pr-2">
                  <select className={fieldClass} value={r.grade} onChange={(e) => upd(i, "grade", e.target.value)} aria-label={`Course ${i + 1} grade`}>
                    <option value="">—</option>
                    {LETTERS.map((l) => (
                      <option key={l} value={l}>
                        {l} ({gradePoints(l, aPlus).toFixed(1)})
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-1 pr-2">
                  <input className={fieldClass} type="number" min="0" step="any" value={r.credits} onChange={(e) => upd(i, "credits", e.target.value)} aria-label={`Course ${i + 1} credits`} />
                </td>
                <td className="py-1 pr-2">
                  <select className={fieldClass} value={r.boost} onChange={(e) => upd(i, "boost", e.target.value)} aria-label={`Course ${i + 1} weighting`}>
                    <option value="0">Regular</option>
                    <option value="0.5">Honors (+0.5)</option>
                    <option value="1">AP / IB (+1.0)</option>
                  </select>
                </td>
                <td className="py-1">{rows.length > 1 && <Btn onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}>×</Btn>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mb-3">
        <Btn onClick={() => setRows((rs) => [...rs, { name: `Course ${rs.length + 1}`, grade: "", credits: "3", boost: "0" }])}>+ Add course</Btn>
      </div>
      <Grid cols={3}>
        <NumField label="Previous cumulative GPA (optional)" value={prevGpa} onChange={setPrevGpa} />
        <NumField label="Previous credits (optional)" value={prevCr} onChange={setPrevCr} />
        <label className="flex items-center gap-2 pt-6 text-sm">
          <input type="checkbox" checked={aPlus} onChange={(e) => setAPlus(e.target.checked)} />
          <span>My school counts A+ as 4.3</span>
        </label>
      </Grid>
      <Hint>Courses without a grade are left out. Pass/fail and withdrawn courses usually do not count toward GPA.</Hint>
      <Output
        result={result}
        render={(d) => (
          <ResultCard
            label={`${d.weighted ? "Weighted" : "Unweighted"} GPA, ${fmt(d.semesterCredits, 1)} credits`}
            headline={`${d.semesterGpa.toFixed(2)} GPA this term`}
            sub={d.cumulativeGpa !== null ? `Cumulative GPA ${d.cumulativeGpa.toFixed(2)} over ${fmt(d.cumulativeCredits!, 1)} credits` : `${fmt(d.qualityPoints, 2)} quality points`}
            limits="Your school's registrar decides the official GPA: point values (A+ as 4.0 or 4.3, whether D− exists), how repeated courses count, how honors and AP courses are weighted, and how transfer credits are handled all vary. Check your student handbook."
            method={
              <p>
                Method: Σ (grade points + weighting) × credits ÷ Σ credits. Default scale A = 4.0, A− = 3.7, B+ = 3.3, B = 3.0 … D− = 0.7, F = 0; letter grades as listed in{" "}
                <Ext href={GRADING_URL}>Academic grading in the United States</Ext>. Cumulative = (this term&apos;s quality points + previous GPA × previous credits) ÷ all credits.
              </p>
            }
          >
            <DataTable
              head={["Course", "Grade", "Credits", "Quality points"]}
              rows={rows.filter((r) => r.grade).map((r) => [r.name, r.grade, r.credits, fmt((gradePoints(r.grade as Letter, aPlus) + Number(r.boost)) * Number(r.credits), 2)])}
            />
          </ResultCard>
        )}
      />
    </div>
  );
}
