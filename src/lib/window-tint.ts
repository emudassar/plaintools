import { ToolError } from "./errors";

/**
 * Net visible light transmission (VLT) of tinted glass.
 *
 * Light passing through two layers keeps the fraction each layer transmits,
 * so net VLT ≈ glass VLT × film VLT (each as a fraction). This ignores light
 * bouncing between the layers, so a meter can read slightly differently.
 * Madico (film manufacturer), "Car window tinting laws: what you need to
 * know" (Nov 6, 2019): "The majority of states measure the VLT in terms of the
 * combined light transmittance of both the film and the glass itself."
 *
 * Reverse: the lightest film that keeps net VLT at or above a limit is
 * film ≥ limit ÷ glass.
 */

export const MADICO_URL = "https://madico.com/blog/automotive/car-window-tinting-laws-what-you-need-to-know/";
export const TINT_RETRIEVED = "2026-10-17";

const pct = (v: number, n: string) => {
  if (!Number.isFinite(v) || v <= 0 || v > 100) throw new ToolError("bad-input", `${n} should be a percentage between 0 and 100.`);
  return v / 100;
};

export interface TintInput {
  glassVlt: number;
  /** One or more film layers (e.g. existing film + new film). */
  films: number[];
  /** Legal minimum net VLT to compare with, % (optional). */
  limit: number | null;
}

export interface TintResult {
  netVlt: number;
  blockedPct: number;
  meetsLimit: boolean | null;
  /** Darkest single film (lowest VLT %) that keeps the glass at or above the limit. */
  darkestFilmForLimit: number | null;
}

export function windowTint(i: TintInput): TintResult {
  const g = pct(i.glassVlt, "Glass VLT");
  if (!i.films.length) throw new ToolError("bad-input", "Enter at least one film VLT.");
  let net = g;
  for (const f of i.films) net *= pct(f, "Film VLT");
  let limit: number | null = null;
  if (i.limit !== null) limit = pct(i.limit, "The legal limit");
  return {
    netVlt: net * 100,
    blockedPct: (1 - net) * 100,
    meetsLimit: limit === null ? null : net + 1e-12 >= limit,
    darkestFilmForLimit: limit === null ? null : limit > g ? null : (limit / g) * 100,
  };
}
