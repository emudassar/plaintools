import { ToolError } from "./errors";

/**
 * Christmas tree lights.
 *
 * There is no standard for how many lights a tree "needs"; what exists is a
 * widely repeated rule of thumb, which this page reports as such:
 *  - Mahoney's Garden Center, "Christmas Tree Decorating by the Numbers":
 *    "A good rule of thumb is about 100 lights per foot of tree height ...
 *     Prefer something cozier? Drop down to 75 per foot. Going for a dazzling
 *     showstopper? Bump it up to 125 per foot."
 *  - Govee, "How Many Feet of Lights Do You Need for a 7-Foot Christmas Tree?":
 *    "A common guideline is to use about 100 lights per foot of tree height."
 * Both retrieved 2026-10-04.
 *
 * Connection limit: U.S. CPSC Holiday Safety page, retrieved 2026-10-04:
 *   "Never string together more than three sets of incandescent lights".
 * LED sets carry their own maximum on the label, so the page points there.
 */

export const LIGHTS_RETRIEVED = "2026-10-04";
export const MAHONEYS_URL =
  "https://mahoneysgarden.com/christmas-tree-decorating-by-the-numbers/";
export const GOVEE_URL =
  "https://us.govee.com/blogs/product-review-blog/how-many-feet-of-lights-do-you-need-for-a-7-foot-christmas-tree";
export const CPSC_URL =
  "https://www.cpsc.gov/Safety-Education/Safety-Education-Centers/Holiday-Safety";

export const LOOKS = {
  cozy: { label: "Cozy", perFoot: 75 },
  classic: { label: "Classic", perFoot: 100 },
  showstopper: { label: "Showstopper", perFoot: 125 },
} as const;
export type Look = keyof typeof LOOKS;

export const CPSC_MAX_INCANDESCENT_SETS = 3;
const FT_PER_M = 3.28083989501312;

export interface TreeLightsInput {
  height: number;
  heightUnit: "ft" | "m";
  /** Lights per foot of height: a preset look's figure or the user's own. */
  perFoot: number;
  lightsPerSet: number;
  /** Optional, feet of lit wire per set; null when unknown. */
  setLengthFt: number | null;
  bulbType: "incandescent" | "led";
}

export interface TreeLightsResult {
  heightFt: number;
  perFoot: number;
  lights: number;
  sets: number;
  lightsBought: number;
  totalLengthFt: number | null;
  bulbType: "incandescent" | "led";
  /** Incandescent only: separate runs needed to keep each run at ≤ 3 sets. */
  incandescentRuns: number | null;
  retrievedAt: string;
}

function pos(label: string, v: number) {
  if (!Number.isFinite(v))
    throw new ToolError("bad-input", `${label} must be a number.`);
  if (v <= 0)
    throw new ToolError("bad-input", `${label} must be more than zero.`);
}

export function calculateTreeLights(input: TreeLightsInput): TreeLightsResult {
  pos("Tree height", input.height);
  const heightFt = input.heightUnit === "ft" ? input.height : input.height * FT_PER_M;
  if (heightFt > 100)
    throw new ToolError(
      "bad-input",
      "That tree is over 100 feet tall. Check the feet / metres setting.",
    );
  pos("Lights per foot", input.perFoot);
  if (input.perFoot > 1000)
    throw new ToolError("bad-input", "Lights per foot looks too high. The usual range is 75–125.");
  pos("Lights per set", input.lightsPerSet);
  if (!Number.isInteger(input.lightsPerSet))
    throw new ToolError("bad-input", "Lights per set must be a whole number.");
  if (input.setLengthFt !== null) pos("Length of one set", input.setLengthFt);

  const lights = Math.ceil(heightFt * input.perFoot - 1e-9);
  const sets = Math.ceil(lights / input.lightsPerSet - 1e-9);
  return {
    heightFt,
    perFoot: input.perFoot,
    lights,
    sets,
    lightsBought: sets * input.lightsPerSet,
    totalLengthFt: input.setLengthFt === null ? null : sets * input.setLengthFt,
    bulbType: input.bulbType,
    incandescentRuns:
      input.bulbType === "incandescent"
        ? Math.ceil(sets / CPSC_MAX_INCANDESCENT_SETS)
        : null,
    retrievedAt: LIGHTS_RETRIEVED,
  };
}
