import { ToolError } from "./errors";

/**
 * Door handing.
 *
 * Sources (Allegion), retrieved 2026-10-04:
 *  - Steelcraft Technical Data Manual, Section 1 General Information,
 *    "Handing procedures":
 *      "To determine the hand of a door, view the door from the outside (the
 *       side that hinges are on is the hand of the door).
 *       - If the door swings away from the viewer, the hand is regular hand,
 *         i.e., right or left hand.
 *       - If the door swings to the viewer, the door is reverse swing, i.e.,
 *         right hand reverse swing or left hand reverse swing."
 *    https://us.allegion.com/content/dam/allegion-us-2/web-files/steelcraft/technical-documents/Tech_Data_Manual_Section__1__General_Information_110552.pdf
 *  - Schlage P509-664, "Handing instruction for lever lock installation":
 *      "The 'Hand' is determined by the direction of door swing when viewed
 *       from the outside, or corridor side of the door."
 *      "When properly installed, the end of the lever should point toward the
 *       hinge side of the door."
 *    https://us.allegion.com/content/dam/allegion-us-2/web-files/schlage/installation-documents/Schlage_Lever_Locks_Door_Handing_Guide_108266.pdf
 *
 * Someone standing on the inside sees the hinges on the opposite side and the
 * swing in the opposite direction, so both are flipped before applying the rule.
 */

export const HANDING_RETRIEVED = "2026-10-04";
export const STEELCRAFT_URL =
  "https://us.allegion.com/content/dam/allegion-us-2/web-files/steelcraft/technical-documents/Tech_Data_Manual_Section__1__General_Information_110552.pdf";
export const SCHLAGE_URL =
  "https://us.allegion.com/content/dam/allegion-us-2/web-files/schlage/installation-documents/Schlage_Lever_Locks_Door_Handing_Guide_108266.pdf";

export type Side = "outside" | "inside";
export type LeftRight = "left" | "right";
export type Swing = "away" | "toward";
export type Hand = "LH" | "RH" | "LHR" | "RHR";

export const HAND_NAMES: Record<Hand, string> = {
  LH: "Left hand",
  RH: "Right hand",
  LHR: "Left hand reverse",
  RHR: "Right hand reverse",
};

/** From the outside: hinge side and swing direction for each hand. */
export const HAND_DEFINITION: Record<Hand, { hinges: LeftRight; swing: Swing }> = {
  LH: { hinges: "left", swing: "away" },
  RH: { hinges: "right", swing: "away" },
  LHR: { hinges: "left", swing: "toward" },
  RHR: { hinges: "right", swing: "toward" },
};

export interface HandingInput {
  standing: Side;
  hinges: LeftRight;
  swing: Swing;
}

export interface HandingResult {
  hand: Hand;
  name: string;
  /** What someone on the outside sees. */
  outsideHinges: LeftRight;
  outsideSwing: Swing;
  flipped: boolean;
  retrievedAt: string;
}

const other = <T extends string>(v: T, a: T, b: T): T => (v === a ? b : a);

export function determineHand(input: HandingInput): HandingResult {
  const sides: Side[] = ["outside", "inside"];
  if (!sides.includes(input.standing)) throw new ToolError("bad-input", "Say which side of the door you are standing on.");
  if (input.hinges !== "left" && input.hinges !== "right") throw new ToolError("bad-input", "Say which side the hinges are on.");
  if (input.swing !== "away" && input.swing !== "toward") throw new ToolError("bad-input", "Say which way the door swings.");

  const flipped = input.standing === "inside";
  const outsideHinges = flipped ? other(input.hinges, "left", "right") : input.hinges;
  const outsideSwing = flipped ? other(input.swing, "away", "toward") : input.swing;
  const hand: Hand =
    outsideHinges === "left" ? (outsideSwing === "away" ? "LH" : "LHR") : outsideSwing === "away" ? "RH" : "RHR";
  return { hand, name: HAND_NAMES[hand], outsideHinges, outsideSwing, flipped, retrievedAt: HANDING_RETRIEVED };
}
