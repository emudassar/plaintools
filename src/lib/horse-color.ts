import { ToolError } from "./errors";

/**
 * Foal coat colour odds from the parents' coat colour test results.
 *
 * Source: UC Davis Veterinary Genetics Laboratory (VGL) horse test pages, read 2026-10-14:
 *  - Red Factor (Extension, MC1R): E dominant; e and ea recessive. "Horses with e/e, e/ea, or ea/ea
 *    genotype will not produce black pigment in their coat." Red horses include "chestnuts, sorrels,
 *    palominos, and red duns"; black-pigmented include "black, bay, brown, buckskin, and grullo".
 *    "Red factor works epistatically … regardless of the genotype at the agouti gene."
 *  - Agouti (ASIP): autosomal dominant; A restricts black pigment to the points (bay); a/a: "black
 *    pigment is distributed uniformly over the body" (black).
 *  - Cream: incomplete dominance, N/Cr one copy, Cr/Cr two. Single dose: palominos, buckskins, smoky
 *    blacks; double: cremellos, perlinos, smoky cream (captions: bay + one cream = buckskin, bay + two
 *    = perlino, black + one = smoky black).
 *  - Dun: D (dun dilution + primitive markings), nd1 (not dun; markings possible, variable), nd2 (not
 *    dun; markings absent). "The names assigned to the various dun shades vary by breed."
 *  - Gray (presence/absence): autosomal dominant; "progressive depigmentation … almost completely
 *    white by 6-12 years of age, and can act on any base coat color."
 * Each gene is treated as inherited independently (standard Mendelian segregation, 50% per allele).
 * White-pattern genes (tobiano, frame, sabino, leopard …), silver, champagne and pearl are not modelled.
 */

export const HC_RETRIEVED = "2026-10-14";
export const VGL_URLS = {
  extension: "https://vgl.ucdavis.edu/test/red-factor-horse",
  agouti: "https://vgl.ucdavis.edu/test/agouti-horse",
  cream: "https://vgl.ucdavis.edu/test/cream",
  dun: "https://vgl.ucdavis.edu/test/dun-horse",
  gray: "https://vgl.ucdavis.edu/test/gray_presence_absence",
};

export type GeneId = "E" | "A" | "Cr" | "D" | "G";

export const GENES: { id: GeneId; name: string; options: string[] }[] = [
  { id: "E", name: "Extension (red factor)", options: ["E/E", "E/e", "e/e"] },
  { id: "A", name: "Agouti", options: ["A/A", "A/a", "a/a"] },
  { id: "Cr", name: "Cream", options: ["N/N", "N/Cr", "Cr/Cr"] },
  { id: "D", name: "Dun", options: ["nd2/nd2", "nd1/nd2", "nd1/nd1", "D/nd2", "D/nd1", "D/D"] },
  { id: "G", name: "Gray", options: ["N/N", "N/G", "G/G"] },
];

export type Genotype = Record<GeneId, string>;

const alleles = (g: string) => g.split("/");

/** Offspring genotype probabilities for one gene. Keys are sorted so "e/E" and "E/e" merge. */
export function cross(a: string, b: string, order: string[]): Map<string, number> {
  const out = new Map<string, number>();
  for (const x of alleles(a))
    for (const y of alleles(b)) {
      const k = [x, y].sort((p, q) => order.indexOf(p) - order.indexOf(q)).join("/");
      out.set(k, (out.get(k) ?? 0) + 0.25);
    }
  return out;
}

const ORDER: Record<GeneId, string[]> = { E: ["E", "e"], A: ["A", "a"], Cr: ["N", "Cr"], D: ["D", "nd1", "nd2"], G: ["G", "N"] };

/** Coat colour name for one genotype, built only from the VGL terms above. */
export function colourName(g: Genotype): { name: string; base: "chestnut" | "bay" | "black"; gray: boolean; dun: boolean; markings: string } {
  const red = g.E === "e/e";
  const agouti = g.A !== "a/a";
  const base = red ? "chestnut" : agouti ? "bay" : "black";
  const cr = alleles(g.Cr).filter((x) => x === "Cr").length;
  const dun = alleles(g.D).includes("D");
  const gray = alleles(g.G).includes("G");
  const creamNames: Record<string, string[]> = { chestnut: ["chestnut", "palomino", "cremello"], bay: ["bay", "buckskin", "perlino"], black: ["black", "smoky black", "smoky cream"] };
  let name = creamNames[base][cr];
  if (dun) {
    if (cr === 0 && base === "chestnut") name = "red dun";
    else if (cr === 0 && base === "black") name = "grullo";
    else name = `${name} + dun`;
  }
  const markings = dun ? "dun dilution with primitive markings" : alleles(g.D).includes("nd1") ? "not dun; primitive markings possible" : "not dun; no primitive markings";
  if (gray) name = `gray (born ${name}, greys out with age)`;
  return { name, base, gray, dun, markings };
}

export interface ColourOdds {
  name: string;
  p: number;
}

export interface FoalResult {
  colours: ColourOdds[];
  perGene: { id: GeneId; name: string; outcomes: { genotype: string; p: number }[] }[];
  sireColour: string;
  damColour: string;
  retrievedAt: string;
}

export function foalColours(sire: Genotype, dam: Genotype): FoalResult {
  for (const gene of GENES)
    for (const [who, g] of [["sire", sire], ["dam", dam]] as const)
      if (!gene.options.includes(g[gene.id])) throw new ToolError("bad-input", `Pick the ${who}'s ${gene.name} result.`);

  const perGene = GENES.map((gene) => {
    const m = cross(sire[gene.id], dam[gene.id], ORDER[gene.id]);
    return { id: gene.id, name: gene.name, outcomes: [...m.entries()].map(([genotype, p]) => ({ genotype, p })).sort((x, y) => y.p - x.p) };
  });

  // Combine independent genes.
  let combos: { g: Partial<Genotype>; p: number }[] = [{ g: {}, p: 1 }];
  for (const pg of perGene) {
    const next: typeof combos = [];
    for (const c of combos) for (const o of pg.outcomes) next.push({ g: { ...c.g, [pg.id]: o.genotype }, p: c.p * o.p });
    combos = next;
  }
  const byName = new Map<string, number>();
  for (const c of combos) {
    const n = colourName(c.g as Genotype).name;
    byName.set(n, (byName.get(n) ?? 0) + c.p);
  }
  const colours = [...byName.entries()].map(([name, p]) => ({ name, p })).sort((a, b) => b.p - a.p || a.name.localeCompare(b.name));
  return { colours, perGene, sireColour: colourName(sire).name, damColour: colourName(dam).name, retrievedAt: HC_RETRIEVED };
}
