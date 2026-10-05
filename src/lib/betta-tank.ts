import { ToolError } from "./errors";
import { calculateAquariumVolume, type TankShape } from "./aquarium-volume";

/**
 * Betta tank size: a tank's water volume compared with published figures.
 *
 * Sources, retrieved 2026-10-05:
 *  - RSPCA Australia Knowledgebase, "How should I care for my Siamese fighting
 *    fish?" (updated 1 May 2024): "Tanks ... ideally should be 20 litres or
 *    more in volume to allow your fish to display normal activity, with 10
 *    litres being the absolute minimum." Also: two males "should never be
 *    placed in the same tank"; water "between 24 to 26°C".
 *  - Clark-Shen N., Tariel-Adam J., Gajanur A., Brown C. (2024) "Life beyond a
 *    jar: Effects of tank size and furnishings on the behaviour and welfare of
 *    Siamese fighting fish (Betta splendens)", Animal Welfare: recommends "a
 *    minimum tank size of 5.6 L" for display and sale, and "tanks larger than
 *    5.6 L" at home. (Their 5.6 L tank measured 22 x 15 x 17 cm.)
 *
 * The page compares; it does not recommend a size.
 */

export const BETTA_RETRIEVED = "2026-10-05";
export const RSPCA_URL = "https://kb.rspca.org.au/categories/companion-animals/fish/how-should-i-care-for-my-siamese-fighting-fish";
export const STUDY_URL = "https://pmc.ncbi.nlm.nih.gov/articles/PMC11704571";

const L_PER_GAL = 3.785411784;

export interface Benchmark {
  id: string;
  label: string;
  litres: number;
  source: "rspca" | "study";
}

export const BENCHMARKS: readonly Benchmark[] = [
  { id: "study-retail", label: "Study's minimum for shop display (5.6 L)", litres: 5.6, source: "study" },
  { id: "rspca-min", label: "RSPCA absolute minimum (10 L)", litres: 10, source: "rspca" },
  { id: "rspca-ideal", label: "RSPCA ideal: 20 L or more", litres: 20, source: "rspca" },
];

export type BettaInput =
  | { mode: "volume"; volume: number; volumeUnit: "gal" | "L" }
  | { mode: "dimensions"; shape: TankShape; unit: "in" | "cm"; a: number; b: number; height: number; gap: number; substrate: number };

export interface BettaResult {
  litres: number;
  gallons: number;
  fromDimensions: boolean;
  comparisons: { benchmark: Benchmark; meets: boolean; differenceLitres: number }[];
  retrievedAt: string;
}

export function calculateBettaTank(input: BettaInput): BettaResult {
  let litres: number;
  if (input.mode === "volume") {
    if (!Number.isFinite(input.volume) || input.volume <= 0) throw new ToolError("bad-input", "Enter the tank volume.");
    litres = input.volumeUnit === "L" ? input.volume : input.volume * L_PER_GAL;
    if (litres > 4000) throw new ToolError("bad-input", "That is over 4,000 litres. Check the unit.");
  } else {
    const r = calculateAquariumVolume({ shape: input.shape, unit: input.unit, a: input.a, b: input.b, bow: 0, height: input.height, gap: input.gap, substrate: input.substrate });
    litres = r.waterLitres;
  }
  return {
    litres,
    gallons: litres / L_PER_GAL,
    fromDimensions: input.mode === "dimensions",
    comparisons: BENCHMARKS.map((b) => ({ benchmark: b, meets: litres >= b.litres - 1e-9, differenceLitres: litres - b.litres })),
    retrievedAt: BETTA_RETRIEVED,
  };
}
