import { ToolError } from "./errors";

/**
 * Text tools: word/character counts, case conversion, Unicode "fancy" letters, Roman numerals.
 *
 * Reading time: 238 words per minute, the average silent reading rate for adult English non-fiction
 *   in Brysbaert (2019), "How many words do we read per minute? A review and meta-analysis of
 *   reading rate", Journal of Memory and Language 109, 104047.
 * Characters are counted as user-perceived characters (Intl.Segmenter graphemes), so an emoji or an
 *   accented letter counts once.
 * Title case: first and last word and every word of four or more letters capitalised; shorter
 *   articles, conjunctions and prepositions lower case (the rule set described on the page).
 * Fancy letters: Unicode Mathematical Alphanumeric Symbols block (U+1D400-U+1D7FF) plus the
 *   Letterlike Symbols the block leaves as holes (e.g. script B = U+212C), Enclosed Alphanumerics
 *   (circled), and Halfwidth and Fullwidth Forms.
 * Roman numerals: standard subtractive notation, 1-3,999.
 */

export const BRYSBAERT_URL = "https://doi.org/10.1016/j.jml.2019.104047";
export const UNICODE_MATH_URL = "https://www.unicode.org/charts/PDF/U1D400.pdf";
export const ROMAN_URL = "https://en.wikipedia.org/wiki/Roman_numerals";
export const READING_WPM = 238;

const segmenter = typeof Intl !== "undefined" && "Segmenter" in Intl ? new Intl.Segmenter("en", { granularity: "grapheme" }) : null;
export const graphemes = (s: string) => (segmenter ? [...segmenter.segment(s)].length : [...s].length);

export interface TextStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  readingMinutes: number;
  avgWordLength: number;
  topWords: [string, number][];
}

const STOP = new Set("the a an and or but of to in on at for with by from as is are was were be been it its this that these those i you he she we they me him her us them my your our their not no so if then than there here".split(" "));

export function textStats(text: string): TextStats {
  const words = text.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) ?? [];
  const trimmed = text.trim();
  const sentences = trimmed ? (trimmed.match(/[^.!?…]+(?:[.!?…]+|$)/g) ?? []).filter((s) => /[\p{L}\p{N}]/u.test(s)).length : 0;
  const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter((p) => p.trim()).length : 0;
  const counts = new Map<string, number>();
  for (const w of words) {
    const k = w.toLowerCase();
    if (k.length > 2 && !STOP.has(k)) counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const letters = words.reduce((t, w) => t + graphemes(w), 0);
  return {
    words: words.length,
    characters: graphemes(text),
    charactersNoSpaces: graphemes(text.replace(/\s/g, "")),
    sentences,
    paragraphs,
    lines: text ? text.split(/\r?\n/).length : 0,
    readingMinutes: words.length / READING_WPM,
    avgWordLength: words.length ? letters / words.length : 0,
    topWords: [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 10),
  };
}

export type CaseMode = "upper" | "lower" | "title" | "sentence" | "capitalize" | "alternating" | "inverse" | "camel" | "pascal" | "snake" | "kebab" | "constant";

const MINOR = new Set("a an the and but or nor for so yet as at by in of off on per to up via".split(" "));

export function titleCase(s: string): string {
  return s
    .split("\n")
    .map((line) => {
      const parts = line.split(/(\s+)/);
      const idx = parts.map((p, i) => (/\S/.test(p) ? i : -1)).filter((i) => i >= 0);
      const first = idx[0], last = idx[idx.length - 1];
      return parts
        .map((p, i) => {
          if (!/\S/.test(p)) return p;
          const core = p.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "").toLowerCase();
          const afterColon = i > 0 && /[:.!?]$/.test(parts[i - 2] ?? "");
          if (i !== first && i !== last && !afterColon && MINOR.has(core)) return p.toLowerCase();
          // Keep all-caps acronyms (NASA, USA) as typed.
          if (core.length > 1 && p === p.toUpperCase() && /\p{L}/u.test(p) && p.replace(/[^\p{L}]/gu, "").length <= 5) return p;
          return p.toLowerCase().replace(/(^|[-/])(\p{L})/gu, (_m, a: string, b: string) => a + b.toUpperCase());
        })
        .join("");
    })
    .join("\n");
}

const wordsOf = (s: string) => s.replace(/([a-z])([A-Z])/g, "$1 $2").split(/[^\p{L}\p{N}]+/u).filter(Boolean);

export function convertCase(s: string, mode: CaseMode): string {
  switch (mode) {
    case "upper":
      return s.toUpperCase();
    case "lower":
      return s.toLowerCase();
    case "title":
      return titleCase(s);
    case "sentence":
      return s.toLowerCase().replace(/(^\s*|[.!?]\s+|\n\s*)(\p{L})/gu, (_m, a: string, b: string) => a + b.toUpperCase()).replace(/\bi\b/g, "I");
    case "capitalize":
      return s.toLowerCase().replace(/(^|[^\p{L}\p{N}'’])(\p{L})/gu, (_m, a: string, b: string) => a + b.toUpperCase());
    case "alternating": {
      let n = 0;
      return [...s].map((c) => (/\p{L}/u.test(c) ? (n++ % 2 ? c.toUpperCase() : c.toLowerCase()) : c)).join("");
    }
    case "inverse":
      return [...s].map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())).join("");
    case "camel":
      return wordsOf(s).map((w, i) => (i ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase())).join("");
    case "pascal":
      return wordsOf(s).map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).join("");
    case "snake":
      return wordsOf(s).map((w) => w.toLowerCase()).join("_");
    case "kebab":
      return wordsOf(s).map((w) => w.toLowerCase()).join("-");
    case "constant":
      return wordsOf(s).map((w) => w.toUpperCase()).join("_");
  }
}

/** Mathematical Alphanumeric Symbols: start code points for A, a, 0 and the holes filled from Letterlike Symbols. */
interface MathStyle {
  id: string;
  name: string;
  upper: number;
  lower: number;
  digit?: number;
  holes?: Record<string, number>;
}

export const MATH_STYLES: readonly MathStyle[] = [
  { id: "bold", name: "Bold (serif)", upper: 0x1d400, lower: 0x1d41a, digit: 0x1d7ce },
  { id: "italic", name: "Italic (serif)", upper: 0x1d434, lower: 0x1d44e, holes: { h: 0x210e } },
  { id: "bold-italic", name: "Bold italic (serif)", upper: 0x1d468, lower: 0x1d482 },
  { id: "script", name: "Script / cursive", upper: 0x1d49c, lower: 0x1d4b6, holes: { B: 0x212c, E: 0x2130, F: 0x2131, H: 0x210b, I: 0x2110, L: 0x2112, M: 0x2133, R: 0x211b, e: 0x212f, g: 0x210a, o: 0x2134 } },
  { id: "bold-script", name: "Bold script", upper: 0x1d4d0, lower: 0x1d4ea },
  { id: "fraktur", name: "Fraktur (gothic)", upper: 0x1d504, lower: 0x1d51e, holes: { C: 0x212d, H: 0x210c, I: 0x2111, R: 0x211c, Z: 0x2128 } },
  { id: "bold-fraktur", name: "Bold Fraktur", upper: 0x1d56c, lower: 0x1d586 },
  { id: "double", name: "Double-struck (outline)", upper: 0x1d538, lower: 0x1d552, digit: 0x1d7d8, holes: { C: 0x2102, H: 0x210d, N: 0x2115, P: 0x2119, Q: 0x211a, R: 0x211d, Z: 0x2124 } },
  { id: "sans", name: "Sans-serif", upper: 0x1d5a0, lower: 0x1d5ba, digit: 0x1d7e2 },
  { id: "sans-bold", name: "Sans-serif bold", upper: 0x1d5d4, lower: 0x1d5ee, digit: 0x1d7ec },
  { id: "sans-italic", name: "Sans-serif italic", upper: 0x1d608, lower: 0x1d622 },
  { id: "sans-bold-italic", name: "Sans-serif bold italic", upper: 0x1d63c, lower: 0x1d656 },
  { id: "mono", name: "Monospace", upper: 0x1d670, lower: 0x1d68a, digit: 0x1d7f6 },
];

export function mathStyle(s: string, st: MathStyle): string {
  return [...s]
    .map((c) => {
      if (st.holes?.[c]) return String.fromCodePoint(st.holes[c]);
      const code = c.charCodeAt(0);
      if (c >= "A" && c <= "Z") return String.fromCodePoint(st.upper + code - 65);
      if (c >= "a" && c <= "z") return String.fromCodePoint(st.lower + code - 97);
      if (c >= "0" && c <= "9" && st.digit) return String.fromCodePoint(st.digit + code - 48);
      return c;
    })
    .join("");
}

/** Circled letters/digits (Enclosed Alphanumerics U+2460-U+24FF) and fullwidth forms (U+FF01-U+FF5E). */
export function circled(s: string): string {
  return [...s]
    .map((c) => {
      if (c >= "A" && c <= "Z") return String.fromCodePoint(0x24b6 + c.charCodeAt(0) - 65);
      if (c >= "a" && c <= "z") return String.fromCodePoint(0x24d0 + c.charCodeAt(0) - 97);
      if (c >= "1" && c <= "9") return String.fromCodePoint(0x2460 + c.charCodeAt(0) - 49);
      if (c === "0") return "⓪";
      return c;
    })
    .join("");
}

export function fullwidth(s: string): string {
  return [...s].map((c) => (c >= "!" && c <= "~" ? String.fromCodePoint(c.charCodeAt(0) - 0x21 + 0xff01) : c === " " ? "　" : c)).join("");
}

export function fancyVariants(s: string): { id: string; name: string; text: string }[] {
  return [
    ...MATH_STYLES.map((st) => ({ id: st.id, name: st.name, text: mathStyle(s, st) })),
    { id: "circled", name: "Circled", text: circled(s) },
    { id: "fullwidth", name: "Fullwidth (wide)", text: fullwidth(s) },
  ];
}

const ROMAN: [number, string][] = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];

export function toRoman(n: number): string {
  if (!Number.isInteger(n) || n < 1 || n > 3999) throw new ToolError("bad-input", "Standard Roman numerals cover whole numbers from 1 to 3,999.");
  let out = "";
  for (const [v, s] of ROMAN) while (n >= v) {
    out += s;
    n -= v;
  }
  return out;
}

export function fromRoman(s: string): number {
  const t = s.trim().toUpperCase();
  if (!/^[MDCLXVI]+$/.test(t)) throw new ToolError("bad-input", "Roman numerals use only the letters I, V, X, L, C, D and M.");
  let n = 0;
  for (let i = 0; i < t.length; i++) {
    const v = ROMAN.find(([, r]) => r === t[i])![0];
    const next = i + 1 < t.length ? ROMAN.find(([, r]) => r === t[i + 1])![0] : 0;
    n += v < next ? -v : v;
  }
  if (n < 1 || n > 3999 || toRoman(n) !== t) throw new ToolError("bad-input", `"${t}" is not written in standard form${n >= 1 && n <= 3999 ? ` - ${n} is written ${toRoman(n)}` : ""}.`);
  return n;
}
