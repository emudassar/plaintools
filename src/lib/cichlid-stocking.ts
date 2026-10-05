import { ToolError } from "./errors";

/**
 * Cichlid stocking: total adult length of the planned fish against a published
 * volumetric guideline.
 *
 * Guideline: Practical Fishkeeping, "Frequently asked questions on stocking
 * densities", retrieved 2026-10-05: "Tropicals: 1" per gal./2.5cm per 4.55 l."
 * (UK imperial gallon). The same article says such guidelines "fall over when
 * you start bringing other things into the equation" and that territorial fish
 * such as cichlids fight when territories overlap — so this is a length budget,
 * not a compatibility check.
 *
 * Adult sizes: FishBase species summaries ("Max length"), retrieved
 * 2026-10-05, as printed — some are standard length (SL, no tail), some total
 * length (TL).
 */

export const CICHLID_RETRIEVED = "2026-10-05";
export const PFK_URL = "https://www.practicalfishkeeping.co.uk/features/frequently-asked-questions-on-stocking-densities/";
export const FISHBASE_URL = (sci: string) => `https://www.fishbase.se/summary/${sci.replace(/ /g, "-")}.html`;

/** cm of fish per litre: 2.5 cm per 4.55 L. */
export const CM_PER_LITRE = 2.5 / 4.55;
const L_PER_US_GAL = 3.785411784;

export interface Species {
  id: string;
  common: string;
  scientific: string;
  maxCm: number;
  measure: "SL" | "TL";
  origin: "Malawi" | "Tanganyika" | "Central America" | "South America" | "West Africa";
}

export const SPECIES: readonly Species[] = [
  { id: "electric-yellow", common: "Electric yellow lab", scientific: "Labidochromis caeruleus", maxCm: 8.1, measure: "SL", origin: "Malawi" },
  { id: "kenyi", common: "Kenyi", scientific: "Maylandia lombardoi", maxCm: 8.7, measure: "SL", origin: "Malawi" },
  { id: "red-zebra", common: "Red zebra", scientific: "Maylandia estherae", maxCm: 7.9, measure: "SL", origin: "Malawi" },
  { id: "demasoni", common: "Demasoni", scientific: "Chindongo demasoni", maxCm: 6.3, measure: "SL", origin: "Malawi" },
  { id: "saulosi", common: "Saulosi", scientific: "Pseudotropheus saulosi", maxCm: 8.6, measure: "TL", origin: "Malawi" },
  { id: "auratus", common: "Auratus", scientific: "Melanochromis auratus", maxCm: 11, measure: "TL", origin: "Malawi" },
  { id: "rusty", common: "Rusty cichlid", scientific: "Iodotropheus sprengerae", maxCm: 10.8, measure: "SL", origin: "Malawi" },
  { id: "peacock", common: "Peacock (Aulonocara stuartgranti)", scientific: "Aulonocara stuartgranti", maxCm: 11.8, measure: "TL", origin: "Malawi" },
  { id: "frontosa", common: "Frontosa", scientific: "Cyphotilapia frontosa", maxCm: 33, measure: "TL", origin: "Tanganyika" },
  { id: "calvus", common: "Calvus", scientific: "Altolamprologus calvus", maxCm: 13.5, measure: "TL", origin: "Tanganyika" },
  { id: "brichardi", common: "Brichardi (fairy cichlid)", scientific: "Neolamprologus brichardi", maxCm: 9, measure: "TL", origin: "Tanganyika" },
  { id: "multies", common: "Multies (shell dweller)", scientific: "Neolamprologus multifasciatus", maxCm: 4, measure: "TL", origin: "Tanganyika" },
  { id: "convict", common: "Convict", scientific: "Amatitlania nigrofasciata", maxCm: 10, measure: "SL", origin: "Central America" },
  { id: "firemouth", common: "Firemouth", scientific: "Thorichthys meeki", maxCm: 17, measure: "TL", origin: "Central America" },
  { id: "jack-dempsey", common: "Jack Dempsey", scientific: "Rocio octofasciata", maxCm: 25, measure: "TL", origin: "Central America" },
  { id: "texas", common: "Texas cichlid", scientific: "Herichthys cyanoguttatus", maxCm: 30, measure: "TL", origin: "Central America" },
  { id: "oscar", common: "Oscar", scientific: "Astronotus ocellatus", maxCm: 45.7, measure: "TL", origin: "South America" },
  { id: "green-terror", common: "Green terror", scientific: "Andinoacara rivulatus", maxCm: 20, measure: "TL", origin: "South America" },
  { id: "severum", common: "Severum", scientific: "Heros severus", maxCm: 20, measure: "SL", origin: "South America" },
  { id: "angelfish", common: "Angelfish", scientific: "Pterophyllum scalare", maxCm: 10.5, measure: "TL", origin: "South America" },
  { id: "discus", common: "Discus", scientific: "Symphysodon aequifasciatus", maxCm: 13.7, measure: "SL", origin: "South America" },
  { id: "german-ram", common: "German blue ram", scientific: "Mikrogeophagus ramirezi", maxCm: 4.2, measure: "SL", origin: "South America" },
  { id: "bolivian-ram", common: "Bolivian ram", scientific: "Mikrogeophagus altispinosus", maxCm: 5.6, measure: "SL", origin: "South America" },
  { id: "kribensis", common: "Kribensis", scientific: "Pelvicachromis pulcher", maxCm: 11, measure: "TL", origin: "West Africa" },
];

export interface StockLine {
  /** SPECIES id, or "custom". */
  speciesId: string;
  count: number;
  /** Only for custom: adult length in cm. */
  customCm?: number;
  customName?: string;
}

export interface CichlidInput {
  volume: number;
  volumeUnit: "gal" | "L";
  lines: readonly StockLine[];
}

export interface CichlidResult {
  litres: number;
  budgetCm: number;
  usedCm: number;
  percent: number;
  fish: number;
  lines: { name: string; scientific: string | null; count: number; eachCm: number; totalCm: number; measure: "SL" | "TL" | "custom"; origin: string | null }[];
  origins: string[];
  largestCm: number;
  retrievedAt: string;
}

export function calculateCichlidStocking(input: CichlidInput): CichlidResult {
  if (!Number.isFinite(input.volume) || input.volume <= 0) throw new ToolError("bad-input", "Enter the tank's water volume.");
  const litres = input.volumeUnit === "L" ? input.volume : input.volume * L_PER_US_GAL;
  if (litres > 20000) throw new ToolError("bad-input", "That is over 20,000 litres. Check the unit.");
  if (input.lines.length === 0) throw new ToolError("bad-input", "Add at least one fish.");

  const lines = input.lines.map((l, i) => {
    if (!Number.isInteger(l.count) || l.count < 0 || l.count > 1000) throw new ToolError("bad-input", `Row ${i + 1}: number of fish must be a whole number.`);
    if (l.speciesId === "custom") {
      const cm = l.customCm ?? NaN;
      if (!Number.isFinite(cm) || cm <= 0 || cm > 150) throw new ToolError("bad-input", `Row ${i + 1}: enter the adult length in cm.`);
      return { name: l.customName?.trim() || "Custom fish", scientific: null, count: l.count, eachCm: cm, totalCm: cm * l.count, measure: "custom" as const, origin: null };
    }
    const s = SPECIES.find((x) => x.id === l.speciesId);
    if (!s) throw new ToolError("bad-input", `Row ${i + 1}: pick a species.`);
    return { name: s.common, scientific: s.scientific, count: l.count, eachCm: s.maxCm, totalCm: s.maxCm * l.count, measure: s.measure, origin: s.origin };
  });
  const fish = lines.reduce((s, l) => s + l.count, 0);
  if (fish === 0) throw new ToolError("no-data", "Enter how many of each fish you plan to keep.");
  const budgetCm = litres * CM_PER_LITRE;
  const usedCm = lines.reduce((s, l) => s + l.totalCm, 0);
  return {
    litres,
    budgetCm,
    usedCm,
    percent: (usedCm / budgetCm) * 100,
    fish,
    lines,
    origins: [...new Set(lines.filter((l) => l.count > 0 && l.origin).map((l) => l.origin!))],
    largestCm: Math.max(...lines.filter((l) => l.count > 0).map((l) => l.eachCm)),
    retrievedAt: CICHLID_RETRIEVED,
  };
}
