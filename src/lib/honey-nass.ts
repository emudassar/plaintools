/**
 * USDA NASS "Honey" (ISSN 1949-1492), released March 13, 2026: "Colonies,
 * Yield, Production, Stocks, Price, and Value – States and United States:
 * 2025" (page 3) and "Honey Price by Color Class – United States" (page 4).
 * Retrieved 2026-10-05 from
 *   https://esmis.nal.usda.gov/sites/default/release-files/795818/hony0326.pdf
 *
 * Values as printed. Colonies in thousands; yield in pounds per colony; price
 * in dollars per pound (all marketing channels). NASS notes colonies producing
 * honey in more than one State are counted in each, so the U.S. yield per
 * colony "may be understated".
 */

export const NASS_HONEY_URL = "https://esmis.nal.usda.gov/sites/default/release-files/795818/hony0326.pdf";
export const NASS_HONEY_RELEASED = "March 13, 2026";
export const NASS_HONEY_YEAR = 2025;
export const NASS_RETRIEVED = "2026-10-05";

export interface StateHoney {
  id: string;
  name: string;
  coloniesThousand: number;
  yieldLb: number;
  productionThousandLb: number;
  pricePerLb: number;
}

export const NASS_2025: readonly StateHoney[] = [
  { id: "CA", name: "California", coloniesThousand: 315, yieldLb: 35, productionThousandLb: 11025, pricePerLb: 2.57 },
  { id: "FL", name: "Florida", coloniesThousand: 113, yieldLb: 32, productionThousandLb: 3616, pricePerLb: 3.94 },
  { id: "GA", name: "Georgia", coloniesThousand: 67, yieldLb: 32, productionThousandLb: 2144, pricePerLb: 3.68 },
  { id: "ID", name: "Idaho", coloniesThousand: 104, yieldLb: 29, productionThousandLb: 3016, pricePerLb: 2.07 },
  { id: "IA", name: "Iowa", coloniesThousand: 34, yieldLb: 62, productionThousandLb: 2108, pricePerLb: 5.43 },
  { id: "LA", name: "Louisiana", coloniesThousand: 62, yieldLb: 53, productionThousandLb: 3286, pricePerLb: 2.47 },
  { id: "MI", name: "Michigan", coloniesThousand: 89, yieldLb: 42, productionThousandLb: 3738, pricePerLb: 3.27 },
  { id: "MN", name: "Minnesota", coloniesThousand: 113, yieldLb: 50, productionThousandLb: 5650, pricePerLb: 2.38 },
  { id: "MS", name: "Mississippi", coloniesThousand: 25, yieldLb: 89, productionThousandLb: 2225, pricePerLb: 2.32 },
  { id: "MT", name: "Montana", coloniesThousand: 123, yieldLb: 85, productionThousandLb: 10455, pricePerLb: 2.18 },
  { id: "NY", name: "New York", coloniesThousand: 52, yieldLb: 56, productionThousandLb: 2912, pricePerLb: 5.14 },
  { id: "NC", name: "North Carolina", coloniesThousand: 16, yieldLb: 42, productionThousandLb: 672, pricePerLb: 7.99 },
  { id: "ND", name: "North Dakota", coloniesThousand: 460, yieldLb: 67, productionThousandLb: 30820, pricePerLb: 1.89 },
  { id: "OH", name: "Ohio", coloniesThousand: 17, yieldLb: 45, productionThousandLb: 765, pricePerLb: 6.45 },
  { id: "OR", name: "Oregon", coloniesThousand: 87, yieldLb: 27, productionThousandLb: 2349, pricePerLb: 2.09 },
  { id: "PA", name: "Pennsylvania", coloniesThousand: 25, yieldLb: 57, productionThousandLb: 1425, pricePerLb: 4.33 },
  { id: "SD", name: "South Dakota", coloniesThousand: 205, yieldLb: 40, productionThousandLb: 8200, pricePerLb: 2.44 },
  { id: "TX", name: "Texas", coloniesThousand: 72, yieldLb: 30, productionThousandLb: 2160, pricePerLb: 3.91 },
  { id: "WA", name: "Washington", coloniesThousand: 66, yieldLb: 31, productionThousandLb: 2046, pricePerLb: 4.36 },
  { id: "WI", name: "Wisconsin", coloniesThousand: 50, yieldLb: 30, productionThousandLb: 1500, pricePerLb: 4.52 },
  { id: "OTHER", name: "Other States (combined)", coloniesThousand: 317, yieldLb: 49, productionThousandLb: 15604, pricePerLb: 3.75 },
  { id: "US", name: "United States", coloniesThousand: 2412, yieldLb: 48.0, productionThousandLb: 115716, pricePerLb: 3.05 },
];

/** U.S. "All honey" price by marketing channel, 2025, dollars per pound (page 4). */
export const NASS_CHANNEL_PRICE_2025 = { wholesale: 2.45, retail: 7.15, all: 3.05 } as const;
