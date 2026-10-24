import { ToolError } from "./errors";

/**
 * Grades and percentages.
 *
 * GPA: credit-weighted mean of grade points. Default 4.0 scale A=4.0, A-=3.7, B+=3.3, B=3.0, B-=2.7,
 *   C+=2.3, C=2.0, C-=1.7, D+=1.3, D=1.0, D-=0.7, F=0 (the common US letter scale; letter list per
 *   Wikipedia "Academic grading in the United States"). Schools differ (A+ = 4.0 or 4.3, no D-), so
 *   A+ is a setting. Cumulative GPA folds in previous credits x previous GPA.
 * Final grade: needed = (target - current x (1 - w)) / w, w = final exam weight.
 * Percentage change: (new - old) / |old| x 100.
 */

export const GRADING_URL = "https://en.wikipedia.org/wiki/Academic_grading_in_the_United_States";

export const LETTERS = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"] as const;
export type Letter = (typeof LETTERS)[number];
const POINTS: Record<Letter, number> = { "A+": 4.0, A: 4.0, "A-": 3.7, "B+": 3.3, B: 3.0, "B-": 2.7, "C+": 2.3, C: 2.0, "C-": 1.7, "D+": 1.3, D: 1.0, "D-": 0.7, F: 0 };

export const gradePoints = (l: Letter, aPlus43: boolean) => (l === "A+" && aPlus43 ? 4.3 : POINTS[l]);

export interface Course {
  grade: Letter | "";
  credits: number;
  /** Extra points for honors/AP style weighting (0, 0.5 or 1). */
  boost: number;
}

export interface GpaResult {
  semesterGpa: number;
  semesterCredits: number;
  qualityPoints: number;
  weighted: boolean;
  cumulativeGpa: number | null;
  cumulativeCredits: number | null;
}

export function gpa(courses: Course[], aPlus43: boolean, prevGpa: number | null, prevCredits: number | null): GpaResult {
  const used = courses.filter((c) => c.grade !== "");
  if (!used.length) throw new ToolError("bad-input", "Pick a grade for at least one course.");
  let credits = 0, qp = 0;
  for (const c of used) {
    if (!Number.isFinite(c.credits) || c.credits <= 0 || c.credits > 30) throw new ToolError("bad-input", "Every graded course needs credits between 0 and 30.");
    credits += c.credits;
    qp += (gradePoints(c.grade as Letter, aPlus43) + c.boost) * c.credits;
  }
  const semesterGpa = qp / credits;
  let cumulativeGpa: number | null = null, cumulativeCredits: number | null = null;
  if (prevGpa !== null || prevCredits !== null) {
    if (prevGpa === null || prevCredits === null) throw new ToolError("bad-input", "For a cumulative GPA enter both your previous GPA and previous credits.");
    if (!Number.isFinite(prevGpa) || prevGpa < 0 || prevGpa > 5) throw new ToolError("bad-input", "Previous GPA should be between 0 and 5.");
    if (!Number.isFinite(prevCredits) || prevCredits < 0 || prevCredits > 1000) throw new ToolError("bad-input", "Previous credits should be between 0 and 1,000.");
    cumulativeCredits = credits + prevCredits;
    cumulativeGpa = (qp + prevGpa * prevCredits) / cumulativeCredits;
  }
  return { semesterGpa, semesterCredits: credits, qualityPoints: qp, weighted: used.some((c) => c.boost > 0), cumulativeGpa, cumulativeCredits };
}

export interface FinalGradeResult {
  needed: number;
  /** Grade you end with for a range of final scores. */
  table: { finalScore: number; overall: number }[];
}

export function finalGrade(current: number, target: number, weightPct: number): FinalGradeResult {
  if (!Number.isFinite(current) || current < 0 || current > 150) throw new ToolError("bad-input", "Enter your current grade as a percentage (0-150).");
  if (!Number.isFinite(target) || target < 0 || target > 150) throw new ToolError("bad-input", "Enter the grade you want as a percentage.");
  if (!Number.isFinite(weightPct) || weightPct <= 0 || weightPct > 100) throw new ToolError("bad-input", "The final's weight should be more than 0 and at most 100 percent.");
  const w = weightPct / 100;
  const needed = (target - current * (1 - w)) / w;
  const table = [50, 60, 70, 80, 90, 100].map((s) => ({ finalScore: s, overall: current * (1 - w) + s * w }));
  return { needed, table };
}

export interface PercentChangeResult {
  change: number;
  pct: number;
  direction: "increase" | "decrease" | "no change";
  ratio: number;
}

export function percentChange(oldV: number, newV: number): PercentChangeResult {
  if (!Number.isFinite(oldV) || !Number.isFinite(newV)) throw new ToolError("bad-input", "Enter both values as numbers.");
  if (oldV === 0) throw new ToolError("bad-input", "A percentage change from 0 is undefined - there is no starting amount to compare with.");
  const change = newV - oldV;
  return { change, pct: (change / Math.abs(oldV)) * 100, direction: change > 0 ? "increase" : change < 0 ? "decrease" : "no change", ratio: newV / oldV };
}

export function applyPercent(value: number, pct: number, dir: "increase" | "decrease"): number {
  if (!Number.isFinite(value) || !Number.isFinite(pct)) throw new ToolError("bad-input", "Enter both values as numbers.");
  if (pct < 0) throw new ToolError("bad-input", "Enter the percentage as a positive number and choose increase or decrease.");
  return dir === "increase" ? value * (1 + pct / 100) : value * (1 - pct / 100);
}

/** Original value before a given % change: new / (1 +/- p). */
export function reversePercent(newV: number, pct: number, dir: "increase" | "decrease"): number {
  if (!Number.isFinite(newV) || !Number.isFinite(pct) || pct < 0) throw new ToolError("bad-input", "Enter both values as numbers.");
  const f = dir === "increase" ? 1 + pct / 100 : 1 - pct / 100;
  if (f <= 0) throw new ToolError("bad-input", "A decrease of 100% or more leaves nothing to work back from.");
  return newV / f;
}
