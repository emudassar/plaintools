import { ToolError } from "./errors";

/**
 * Random pickers and just-for-fun tools.
 *
 * Randomness: Web Crypto getRandomValues with rejection sampling (no modulo bias).
 * Dog age: two published methods side by side -
 *   (1) the general rule summarised on Wikipedia "Aging in dogs": first year = 15 human years, second = 9,
 *       each later year about 5;
 *   (2) Wang et al. (2020), Cell Systems 11(2):176-185, DNA-methylation clock in Labrador retrievers:
 *       human age = 16 ln(dog age) + 31.
 * Love calculator: two paper games, stated as games. FLAMES as described on Wikipedia "FLAMES (game)"
 *   (cross out shared letters occurrence by occurrence, count n, then eliminate every n-th letter of
 *   F-L-A-M-E-S until one is left). The "loves" letter count: count L, O, V, E, S in "<name> loves
 *   <name>", then add neighbouring numbers (a two-digit sum is reduced to its digit sum) until two
 *   digits remain. Neither predicts anything; the result depends only on the letters.
 * Zodiac: sun-sign dates, elements and modalities from Wikipedia "Astrological sign"; the relationship
 *   between two signs is the astrological aspect their positions make (Wikipedia "Astrological
 *   aspect"): same sign = conjunction, 2 apart = sextile, 3 = square, 4 = trine, 6 = opposition.
 *   This reports what astrological tradition says; astrology has no scientific support.
 */

export const DOG_RULE_URL = "https://en.wikipedia.org/wiki/Aging_in_dogs";
export const DOG_EPIGENETIC_URL = "https://doi.org/10.1016/j.cels.2020.06.006";
export const FLAMES_URL = "https://en.wikipedia.org/wiki/FLAMES_(game)";
export const SIGNS_URL = "https://en.wikipedia.org/wiki/Astrological_sign";
export const ASPECT_URL = "https://en.wikipedia.org/wiki/Astrological_aspect";
export const FUN_RETRIEVED = "2026-10-24";

/** Uniform integer in [0, n) from Web Crypto. */
export function randInt(n: number): number {
  if (!Number.isInteger(n) || n < 1) throw new ToolError("bad-input", "Nothing to pick from.");
  const limit = Math.floor(0x100000000 / n) * n;
  const buf = new Uint32Array(1);
  for (;;) {
    crypto.getRandomValues(buf);
    if (buf[0] < limit) return buf[0] % n;
  }
}

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const parseList = (text: string) =>
  text
    .split(/\r?\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);

export function makeTeams(names: string[], mode: "count" | "size", value: number): string[][] {
  if (names.length < 2) throw new ToolError("bad-input", "Enter at least two names, one per line or separated by commas.");
  if (names.length > 2000) throw new ToolError("bad-input", "That is more than 2,000 names.");
  if (!Number.isInteger(value) || value < 1) throw new ToolError("bad-input", mode === "count" ? "Number of teams should be a whole number." : "Team size should be a whole number.");
  const teams = mode === "count" ? value : Math.ceil(names.length / value);
  if (teams < 2) throw new ToolError("bad-input", "That makes only one team. Ask for more teams or a smaller team size.");
  if (teams > names.length) throw new ToolError("bad-input", "There are more teams than people.");
  const out: string[][] = Array.from({ length: teams }, () => []);
  shuffle(names).forEach((n, i) => out[i % teams].push(n));
  return out;
}

const ADJ = "agile amber arctic bold brave breezy bright brisk calm candid cheerful clever cobalt cosmic crisp curious daring dusky eager electric emerald fearless fierce frosty gentle golden graceful hidden humble icy indigo jolly keen lively lucky lunar mellow mighty misty modest nimble noble quiet quick rapid rustic scarlet shiny silent silver sly snowy solar sonic spry stellar stormy sunny swift tidy tranquil urban velvet vivid wandering wild wise witty zesty".split(" ");
const NOUN = "badger bear beacon bison blaze breeze canyon cedar comet coral cricket dagger dolphin dragon eagle ember falcon fern fox galaxy gecko glacier harbor hawk heron island jaguar koala lantern leopard lynx maple meadow meteor moose nebula ocean orbit otter owl panda panther pebble phoenix pine pixel planet puffin quartz raven reef river rocket sage shadow sparrow spark summit tiger thunder tulip voyager walrus willow wolf yeti zephyr".split(" ");

export interface UsernameOptions {
  style: "adj-noun" | "noun-noun" | "word-number" | "name-based";
  base: string;
  separator: "" | "_" | "." | "-";
  capitalize: boolean;
  addNumber: boolean;
  maxLength: number;
  count: number;
}

const cap = (w: string) => w[0].toUpperCase() + w.slice(1);

export function usernames(o: UsernameOptions): string[] {
  if (!Number.isInteger(o.maxLength) || o.maxLength < 4 || o.maxLength > 50) throw new ToolError("bad-input", "Maximum length should be 4 to 50 characters.");
  if (!Number.isInteger(o.count) || o.count < 1 || o.count > 100) throw new ToolError("bad-input", "Ask for 1 to 100 usernames.");
  const base = o.base.normalize("NFKD").replace(/[^A-Za-z0-9]/g, "").toLowerCase();
  if (o.style === "name-based" && !base) throw new ToolError("bad-input", "Type a name or word to build the usernames from.");
  const pick = (a: string[]) => a[randInt(a.length)];
  const out = new Set<string>();
  let guard = 0;
  while (out.size < o.count && guard++ < o.count * 200) {
    let parts: string[];
    switch (o.style) {
      case "adj-noun":
        parts = [pick(ADJ), pick(NOUN)];
        break;
      case "noun-noun":
        parts = [pick(NOUN), pick(NOUN)];
        break;
      case "word-number":
        parts = [pick(randInt(2) ? ADJ : NOUN)];
        break;
      case "name-based":
        parts = randInt(2) ? [pick(ADJ), base] : [base, pick(NOUN)];
        break;
    }
    if (o.capitalize) parts = parts.map(cap);
    let u = parts.join(o.separator);
    if (o.addNumber || o.style === "word-number") u += String(randInt(o.style === "word-number" ? 9000 : 900) + (o.style === "word-number" ? 1000 : 100));
    if (u.length <= o.maxLength) out.add(u);
  }
  if (!out.size) throw new ToolError("bad-input", "Nothing fits that maximum length. Allow more characters or turn off the number.");
  return [...out];
}

export interface DogAgeResult {
  rule: number;
  epigenetic: number | null;
}

export function dogAge(years: number): DogAgeResult {
  if (!Number.isFinite(years) || years <= 0) throw new ToolError("bad-input", "Enter the dog's age in years (use decimals for months, e.g. 0.5).");
  if (years > 30) throw new ToolError("bad-input", "The oldest verified dog lived to 29. Check the age.");
  const rule = years <= 1 ? 15 * years : years <= 2 ? 15 + 9 * (years - 1) : 24 + 5 * (years - 2);
  // ln() falls below zero for very young puppies, where the clock was not fitted.
  const epigenetic = years >= 0.25 ? 16 * Math.log(years) + 31 : null;
  return { rule, epigenetic };
}

export const FLAMES_MEANING: Record<string, string> = { F: "Friends", L: "Lovers", A: "Affection", M: "Marriage", E: "Enemies", S: "Siblings" };

const letters = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z]/g, "");

export function flames(a: string, b: string): { remaining: number; letter: string; meaning: string; leftA: string; leftB: string } {
  const x = [...letters(a)], y = [...letters(b)];
  if (!x.length || !y.length) throw new ToolError("bad-input", "Enter both names using letters.");
  // Cross out matched occurrences one for one.
  const yLeft = [...y];
  const xLeft: string[] = [];
  for (const c of x) {
    const j = yLeft.indexOf(c);
    if (j >= 0) yLeft.splice(j, 1);
    else xLeft.push(c);
  }
  const n = xLeft.length + yLeft.length;
  if (n === 0) return { remaining: 0, letter: "", meaning: "No letters left - the names cancel out completely, which the game does not score.", leftA: "", leftB: "" };
  const ring = "FLAMES".split("");
  let idx = 0;
  while (ring.length > 1) {
    idx = (idx + n - 1) % ring.length;
    ring.splice(idx, 1);
    if (idx === ring.length) idx = 0;
  }
  return { remaining: n, letter: ring[0], meaning: FLAMES_MEANING[ring[0]], leftA: xLeft.join(""), leftB: yLeft.join("") };
}

const digitSum = (n: number) => String(n).split("").reduce((t, d) => t + Number(d), 0);

export function lovesCount(a: string, b: string): { counts: number[]; steps: number[][]; percent: number } {
  const A = letters(a), B = letters(b);
  if (!A || !B) throw new ToolError("bad-input", "Enter both names using letters.");
  const phrase = `${A}loves${B}`;
  const counts = [..."loves"].map((c) => [...phrase].filter((p) => p === c).length);
  const steps = [counts];
  let row = counts;
  while (row.length > 2) {
    row = row.slice(1).map((v, i) => {
      const s = row[i] + v;
      return s >= 10 ? digitSum(s) : s;
    });
    steps.push(row);
  }
  return { counts, steps, percent: Number(row.join("")) };
}

export const SIGNS = [
  { id: "aries", name: "Aries", start: [3, 21], element: "Fire", modality: "Cardinal" },
  { id: "taurus", name: "Taurus", start: [4, 21], element: "Earth", modality: "Fixed" },
  { id: "gemini", name: "Gemini", start: [5, 22], element: "Air", modality: "Mutable" },
  { id: "cancer", name: "Cancer", start: [6, 22], element: "Water", modality: "Cardinal" },
  { id: "leo", name: "Leo", start: [7, 24], element: "Fire", modality: "Fixed" },
  { id: "virgo", name: "Virgo", start: [8, 24], element: "Earth", modality: "Mutable" },
  { id: "libra", name: "Libra", start: [9, 24], element: "Air", modality: "Cardinal" },
  { id: "scorpio", name: "Scorpio", start: [10, 24], element: "Water", modality: "Fixed" },
  { id: "sagittarius", name: "Sagittarius", start: [11, 23], element: "Fire", modality: "Mutable" },
  { id: "capricorn", name: "Capricorn", start: [12, 22], element: "Earth", modality: "Cardinal" },
  { id: "aquarius", name: "Aquarius", start: [1, 21], element: "Air", modality: "Fixed" },
  { id: "pisces", name: "Pisces", start: [2, 20], element: "Water", modality: "Mutable" },
] as const;

export type SignId = (typeof SIGNS)[number]["id"];

export function signFromDate(month: number, day: number): SignId {
  const key = month * 100 + day;
  // Walk backwards from Pisces (2/20) through the year.
  const sorted = [...SIGNS].sort((a, b) => a.start[0] * 100 + a.start[1] - (b.start[0] * 100 + b.start[1]));
  let found = sorted[sorted.length - 1];
  for (const s of sorted) if (key >= s.start[0] * 100 + s.start[1]) found = s;
  return found.id;
}

export const ASPECTS: Record<number, { name: string; angle: number; tradition: string }> = {
  0: { name: "Conjunction (same sign)", angle: 0, tradition: "The same sign: astrologers treat a conjunction as the most powerful aspect - the two blend and intensify each other." },
  1: { name: "Semisextile", angle: 30, tradition: "Neighbouring signs: a minor aspect between signs that share neither element nor modality." },
  2: { name: "Sextile", angle: 60, tradition: "Traditionally like a trine but less intense: compatibility and harmony that eases communication and offers opportunity." },
  3: { name: "Square", angle: 90, tradition: "Signs of the same modality: a square is read as strong, usable tension - a turning point that asks for a decision." },
  4: { name: "Trine", angle: 120, tradition: "Signs of the same element: traditionally the most beneficial aspect - harmony, ease and what comes naturally." },
  5: { name: "Quincunx (inconjunct)", angle: 150, tradition: "A minor aspect between signs with nothing in common; astrologers read it as areas that do not usually communicate coming together." },
  6: { name: "Opposition", angle: 180, tradition: "Opposite signs: fundamentally relational but not blending; astrologers describe it as prone to tension and exaggeration." },
};

export function zodiacPair(a: SignId, b: SignId) {
  const ia = SIGNS.findIndex((s) => s.id === a), ib = SIGNS.findIndex((s) => s.id === b);
  if (ia < 0 || ib < 0) throw new ToolError("bad-input", "Pick two signs.");
  const d = Math.abs(ia - ib);
  const steps = Math.min(d, 12 - d);
  return { a: SIGNS[ia], b: SIGNS[ib], steps, aspect: ASPECTS[steps], sameElement: SIGNS[ia].element === SIGNS[ib].element, sameModality: SIGNS[ia].modality === SIGNS[ib].modality };
}
