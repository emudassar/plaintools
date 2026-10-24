import { ToolError } from "./errors";
import { hedgedFetchJson } from "./hedge";

/**
 * Gold and silver spot price per gram in a chosen currency.
 *
 * Spot: gold-api.com real-time endpoint (US dollars per troy ounce; free, CORS enabled, no key).
 * Exchange rates: ExchangeRate-API open access endpoint (updates once a day; attribution required,
 * shown on the result card).
 * Units: 1 troy ounce = 31.1034768 g (NIST Handbook 44, Appendix C); 1 tola = 11.6638038 g
 * (180 grains, the British-India tola - Wikipedia "Tola (unit)" - at 0.06479891 g per grain, NIST
 * Handbook 44 Appendix C); 1 kg = 1000 g.
 * Karat purity = karat / 24 (14k = 58.3%); sterling silver 92.5%, coin silver 90%.
 * This is the metal-content value at spot, not a retail, jewellery or buy-back price.
 */

export const GOLD_API_URL = "https://gold-api.com/";
export const FX_URL = "https://www.exchangerate-api.com";
export const FX_DOCS_URL = "https://www.exchangerate-api.com/docs/free";
export const NIST_HB44_URL = "https://www.nist.gov/pml/owm/nist-handbook-44-current-edition";
export const TOLA_URL = "https://en.wikipedia.org/wiki/Tola_(unit)";
export const TROY_OZ_G = 31.1034768;
export const TOLA_G = 11.6638038;

export type Metal = "XAU" | "XAG";

export const PURITIES: Record<Metal, readonly (readonly [string, number])[]> = {
  XAU: [["24k (99.9%)", 24 / 24], ["22k (91.7%)", 22 / 24], ["21k (87.5%)", 21 / 24], ["18k (75.0%)", 18 / 24], ["14k (58.3%)", 14 / 24], ["10k (41.7%)", 10 / 24], ["9k (37.5%)", 9 / 24]],
  XAG: [["Fine silver (99.9%)", 1], ["Sterling silver (92.5%)", 0.925], ["Coin silver (90%)", 0.9], ["800 silver (80%)", 0.8]],
};

/** Currency with the cities people search for it by. */
export const CURRENCIES: readonly (readonly [string, string])[] = [
  ["USD", "US dollar - New York, Los Angeles, Chicago, Houston"],
  ["PKR", "Pakistani rupee - Karachi, Lahore, Islamabad"],
  ["INR", "Indian rupee - Mumbai, Delhi, Chennai, Hyderabad, Kolkata"],
  ["AED", "UAE dirham - Dubai, Abu Dhabi, Sharjah"],
  ["SAR", "Saudi riyal - Riyadh, Jeddah, Mecca"],
  ["QAR", "Qatari riyal - Doha"],
  ["KWD", "Kuwaiti dinar - Kuwait City"],
  ["OMR", "Omani rial - Muscat"],
  ["BHD", "Bahraini dinar - Manama"],
  ["GBP", "Pound sterling - London, Birmingham, Manchester"],
  ["EUR", "Euro - Paris, Berlin, Madrid, Rome, Dublin"],
  ["CAD", "Canadian dollar - Toronto, Vancouver, Montreal"],
  ["AUD", "Australian dollar - Sydney, Melbourne"],
  ["BDT", "Bangladeshi taka - Dhaka"],
  ["NPR", "Nepalese rupee - Kathmandu"],
  ["LKR", "Sri Lankan rupee - Colombo"],
  ["MYR", "Malaysian ringgit - Kuala Lumpur"],
  ["SGD", "Singapore dollar - Singapore"],
  ["PHP", "Philippine peso - Manila"],
  ["TRY", "Turkish lira - Istanbul"],
  ["EGP", "Egyptian pound - Cairo"],
  ["NGN", "Nigerian naira - Lagos"],
  ["ZAR", "South African rand - Johannesburg"],
  ["KES", "Kenyan shilling - Nairobi"],
  ["CNY", "Chinese yuan - Shanghai, Beijing"],
  ["HKD", "Hong Kong dollar - Hong Kong"],
  ["JPY", "Japanese yen - Tokyo"],
  ["MXN", "Mexican peso - Mexico City"],
];

export interface Spot {
  usdPerOz: number;
  updatedAt: string;
}

export interface Fx {
  rate: number;
  updatedUtc: string;
}

export async function fetchSpot(metal: Metal): Promise<Spot> {
  const j = await hedgedFetchJson<{ price?: number; updatedAt?: string }>(`https://api.gold-api.com/price/${metal}`, {}, { delays: [0, 3000], deadlineMs: 15000 });
  if (typeof j.price !== "number" || !(j.price > 0)) throw new ToolError("unavailable", "The price service returned no price. Try again in a minute.");
  return { usdPerOz: j.price, updatedAt: j.updatedAt ?? "" };
}

export async function fetchFx(code: string): Promise<Fx> {
  if (code === "USD") return { rate: 1, updatedUtc: "" };
  const j = await hedgedFetchJson<{ result?: string; rates?: Record<string, number>; time_last_update_utc?: string }>("https://open.er-api.com/v6/latest/USD", {}, { delays: [0, 3000], deadlineMs: 15000 });
  const rate = j.rates?.[code];
  if (j.result !== "success" || typeof rate !== "number") throw new ToolError("unavailable", "The exchange-rate service did not return that currency. Try again later or pick US dollars.");
  return { rate, updatedUtc: j.time_last_update_utc ?? "" };
}

export interface MetalValue {
  perGram: number;
  perTola: number;
  perOunce: number;
  perKg: number;
  /** Value of the user's own weight, in the chosen unit. */
  forWeight: number | null;
}

export function metalValue(usdPerOz: number, fxRate: number, purity: number, weight: number | null, unit: "g" | "tola" | "oz" | "kg"): MetalValue {
  if (!(usdPerOz > 0) || !(fxRate > 0)) throw new ToolError("unavailable", "Price data is missing.");
  if (!(purity > 0 && purity <= 1)) throw new ToolError("bad-input", "Pick a purity.");
  const perGram = (usdPerOz / TROY_OZ_G) * fxRate * purity;
  let forWeight: number | null = null;
  if (weight !== null) {
    if (!Number.isFinite(weight) || weight <= 0) throw new ToolError("bad-input", "Enter the weight as a positive number, or leave it blank.");
    const g = unit === "g" ? weight : unit === "tola" ? weight * TOLA_G : unit === "oz" ? weight * TROY_OZ_G : weight * 1000;
    forWeight = g * perGram;
  }
  return { perGram, perTola: perGram * TOLA_G, perOunce: perGram * TROY_OZ_G, perKg: perGram * 1000, forWeight };
}
