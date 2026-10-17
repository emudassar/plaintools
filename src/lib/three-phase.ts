import { ToolError } from "./errors";

/**
 * Three-phase (and single-phase) power from voltage, current and power factor.
 *
 * Tony R. Kuphaldt, "Lessons In Electric Circuits", Vol. II (AC), ch. 10
 * "Three-phase Y and Delta Configurations": in a balanced Y the line voltage
 * equals the phase voltage times the square root of 3 and line current equals
 * phase current; in a delta the line current is √3 × phase current and line
 * voltage equals phase voltage. Either way, total power = 3 × phase power =
 * √3 × V(line) × I(line) × PF. Ch. 11 (power factor): true power = apparent
 * power × power factor.
 *
 *   apparent S (VA) = √3 × V × I        (single phase: V × I)
 *   real P (W)      = S × PF
 *   reactive Q (VAR)= S × sin(acos PF)
 * Balanced loads only.
 */

export const KUPHALDT_YD_URL = "https://www.allaboutcircuits.com/textbook/alternating-current/chpt-10/three-phase-y-delta-configurations/";
export const KUPHALDT_PF_URL = "https://www.allaboutcircuits.com/textbook/alternating-current/chpt-11/calculating-power-factor/";
export const PHASE_RETRIEVED = "2026-10-17";
export const SQRT3 = Math.sqrt(3);

export interface PhaseInput {
  phases: 1 | 3;
  /** Line-to-line volts (3-phase) or volts (1-phase). */
  volts: number;
  pf: number;
  solveFor: "power" | "current";
  amps: number;
  /** Known real power in kW (solveFor = current). */
  kw: number;
  /** Optional motor/device efficiency % for horsepower output. */
  efficiencyPct: number | null;
}

export interface PhaseResult {
  amps: number;
  kva: number;
  kw: number;
  kvar: number;
  hpOut: number | null;
  phaseVoltsY: number | null;
}

export function threePhase(i: PhaseInput): PhaseResult {
  if (!Number.isFinite(i.volts) || i.volts <= 0 || i.volts > 50_000) throw new ToolError("bad-input", "Enter the voltage (for example 208, 240, 480).");
  if (!Number.isFinite(i.pf) || i.pf <= 0 || i.pf > 1) throw new ToolError("bad-input", "Power factor must be between 0 and 1 (1 for purely resistive loads).");
  const k = i.phases === 3 ? SQRT3 : 1;
  let amps: number;
  if (i.solveFor === "power") {
    if (!Number.isFinite(i.amps) || i.amps <= 0 || i.amps > 100_000) throw new ToolError("bad-input", "Enter the line current in amps.");
    amps = i.amps;
  } else {
    if (!Number.isFinite(i.kw) || i.kw <= 0 || i.kw > 1_000_000) throw new ToolError("bad-input", "Enter the real power in kW.");
    amps = (i.kw * 1000) / (k * i.volts * i.pf);
  }
  const kva = (k * i.volts * amps) / 1000;
  const kw = kva * i.pf;
  const kvar = kva * Math.sin(Math.acos(i.pf));
  let hpOut: number | null = null;
  if (i.efficiencyPct !== null) {
    if (!Number.isFinite(i.efficiencyPct) || i.efficiencyPct <= 0 || i.efficiencyPct > 100) throw new ToolError("bad-input", "Efficiency should be between 1 and 100 percent, or blank.");
    // 1 hp = 745.7 W (mechanical horsepower, NIST SP 811).
    hpOut = (kw * 1000 * (i.efficiencyPct / 100)) / 745.6999;
  }
  return { amps, kva, kw, kvar, hpOut, phaseVoltsY: i.phases === 3 ? i.volts / SQRT3 : null };
}
