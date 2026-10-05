import { ToolError } from "./errors";
import { NASS_2025, NASS_CHANNEL_PRICE_2025, NASS_RETRIEVED, type StateHoney } from "./honey-nass";

/**
 * Honey production estimate for an apiary: colonies x yield per colony, and
 * its value at a price per pound.
 *
 * Defaults come from USDA NASS "Honey", March 13, 2026 (2025 crop) via
 * `honey-nass.ts`: the chosen state's yield per colony and average price per
 * pound (all channels), or the U.S. price by channel. The user may replace
 * either with their own figure. Gallons use the National Honey Board's
 * "approximately 12 pounds" per gallon.
 */

export const LB_PER_GALLON = 12;
const KG_PER_LB = 0.45359237;

export type PriceBasis = "state" | "wholesale" | "retail" | "custom";

export interface ProductionInput {
  stateId: string;
  colonies: number;
  /** Own yield per colony in lb, or null to use the state's 2025 figure. */
  ownYieldLb: number | null;
  priceBasis: PriceBasis;
  /** Only for "custom": dollars per pound. */
  customPrice: number | null;
}

export interface ProductionResult {
  state: StateHoney;
  yieldLb: number;
  yieldFromNass: boolean;
  productionLb: number;
  productionKg: number;
  gallons: number;
  pricePerLb: number;
  priceLabel: string;
  value: number;
  retrievedAt: string;
}

export function calculateHoneyProduction(input: ProductionInput): ProductionResult {
  const state = NASS_2025.find((s) => s.id === input.stateId);
  if (!state) throw new ToolError("bad-input", "Pick a state.");
  if (!Number.isInteger(input.colonies) || input.colonies < 1) throw new ToolError("bad-input", "Number of colonies must be a whole number of 1 or more.");
  if (input.colonies > 1_000_000) throw new ToolError("bad-input", "That is over a million colonies. Check the number.");
  let yieldLb = state.yieldLb;
  if (input.ownYieldLb !== null) {
    if (!Number.isFinite(input.ownYieldLb) || input.ownYieldLb < 0 || input.ownYieldLb > 1000) throw new ToolError("bad-input", "Yield per colony must be between 0 and 1,000 lb.");
    yieldLb = input.ownYieldLb;
  }
  let pricePerLb: number;
  let priceLabel: string;
  switch (input.priceBasis) {
    case "state":
      pricePerLb = state.pricePerLb;
      priceLabel = `${state.name} 2025 average, all channels`;
      break;
    case "wholesale":
      pricePerLb = NASS_CHANNEL_PRICE_2025.wholesale;
      priceLabel = "U.S. 2025 co-op and private (wholesale) price";
      break;
    case "retail":
      pricePerLb = NASS_CHANNEL_PRICE_2025.retail;
      priceLabel = "U.S. 2025 retail price";
      break;
    default:
      if (input.customPrice === null || !Number.isFinite(input.customPrice) || input.customPrice < 0 || input.customPrice > 1000)
        throw new ToolError("bad-input", "Enter your price per pound.");
      pricePerLb = input.customPrice;
      priceLabel = "your price";
  }
  const productionLb = input.colonies * yieldLb;
  return {
    state,
    yieldLb,
    yieldFromNass: input.ownYieldLb === null,
    productionLb,
    productionKg: productionLb * KG_PER_LB,
    gallons: productionLb / LB_PER_GALLON,
    pricePerLb,
    priceLabel,
    value: productionLb * pricePerLb,
    retrievedAt: NASS_RETRIEVED,
  };
}
