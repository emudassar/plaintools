import { ToolError } from "./errors";

/**
 * OSHA soil classification, 29 CFR 1926 Subpart P Appendix A.
 *
 * Source text retrieved 2026-09-22 from the CFR as published by the U.S.
 * Government Publishing Office:
 * https://www.govinfo.gov/content/pkg/CFR-2024-title29-vol8/xml/CFR-2024-title29-vol8-part1926-subpartP.xml
 *
 * Every clause quoted in CLAUSES below is verbatim from that file. This module
 * makes NO network request — the criteria are compiled in, so there is no
 * service to be down and no third-party service receives anything.
 *
 * This encodes what the published criteria say. It does not classify anyone's
 * excavation: Appendix A (b)(2) requires at least one visual and at least one
 * manual analysis, performed on site by a competent person.
 */

/** Least stable first. The least stable class is the one that governs. */
export type SoilClass = "C" | "B" | "A" | "stable-rock";

export type MaterialId =
  | "stable-rock"
  | "clay"
  | "silty-clay"
  | "sandy-clay"
  | "clay-loam"
  | "silty-clay-loam"
  | "sandy-clay-loam"
  | "caliche"
  | "hardpan"
  | "angular-gravel"
  | "silt"
  | "silt-loam"
  | "sandy-loam"
  | "gravel"
  | "sand"
  | "loamy-sand"
  | "unstable-rock";

/** How a layered system dips relative to the excavation. */
export type LayerDip = "none" | "less-steep" | "4h1v-or-steeper";

type MaterialKind = "stable-rock" | "cohesive" | "cemented" | "granular-b" | "granular-c" | "unstable-rock";

export interface Material {
  id: MaterialId;
  label: string;
  kind: MaterialKind;
  /** Set where Appendix A itself hedges with "in some cases". */
  ambiguityNote: string | null;
}

/**
 * Materials are listed by the names Appendix A itself uses, so the visitor
 * picks what they are looking at rather than pre-judging the class.
 */
export const MATERIALS: readonly Material[] = [
  {
    id: "stable-rock",
    label: "Stable rock",
    kind: "stable-rock",
    ambiguityNote: null,
  },
  { id: "clay", label: "Clay", kind: "cohesive", ambiguityNote: null },
  { id: "silty-clay", label: "Silty clay", kind: "cohesive", ambiguityNote: null },
  { id: "sandy-clay", label: "Sandy clay", kind: "cohesive", ambiguityNote: null },
  { id: "clay-loam", label: "Clay loam", kind: "cohesive", ambiguityNote: null },
  {
    id: "silty-clay-loam",
    label: "Silty clay loam",
    kind: "cohesive",
    ambiguityNote:
      "Appendix A lists silty clay loam under Type A “in some cases” and under the Type B granular list “in some cases”. The regulation does not say which case is which, so it is treated here as a cohesive soil and resolved on unconfined compressive strength.",
  },
  {
    id: "sandy-clay-loam",
    label: "Sandy clay loam",
    kind: "cohesive",
    ambiguityNote:
      "Appendix A lists sandy clay loam under Type A “in some cases” and under the Type B granular list “in some cases”. The regulation does not say which case is which, so it is treated here as a cohesive soil and resolved on unconfined compressive strength.",
  },
  { id: "caliche", label: "Caliche (cemented)", kind: "cemented", ambiguityNote: null },
  { id: "hardpan", label: "Hardpan (cemented)", kind: "cemented", ambiguityNote: null },
  {
    id: "angular-gravel",
    label: "Angular gravel (similar to crushed rock)",
    kind: "granular-b",
    ambiguityNote: null,
  },
  { id: "silt", label: "Silt", kind: "granular-b", ambiguityNote: null },
  { id: "silt-loam", label: "Silt loam", kind: "granular-b", ambiguityNote: null },
  { id: "sandy-loam", label: "Sandy loam", kind: "granular-b", ambiguityNote: null },
  { id: "gravel", label: "Gravel", kind: "granular-c", ambiguityNote: null },
  { id: "sand", label: "Sand", kind: "granular-c", ambiguityNote: null },
  { id: "loamy-sand", label: "Loamy sand", kind: "granular-c", ambiguityNote: null },
  {
    id: "unstable-rock",
    label: "Rock that is not stable",
    kind: "unstable-rock",
    ambiguityNote: null,
  },
];

export function materialById(id: MaterialId): Material | undefined {
  return MATERIALS.find((m) => m.id === id);
}

/** Verbatim clause text, so the result card quotes the regulation rather than paraphrasing it. */
export const CLAUSES = {
  stableRock: {
    code: "Appendix A (b)",
    text: "Stable rock means natural solid mineral matter that can be excavated with vertical sides and remain intact while exposed.",
  },
  aStrength: {
    code: "Appendix A (b), Type A",
    text: "Type A means cohesive soils with an unconfined compressive strength of 1.5 ton per square foot (tsf) (144 kPa) or greater.",
  },
  aCemented: {
    code: "Appendix A (b), Type A",
    text: "Cemented soils such as caliche and hardpan are also considered Type A.",
  },
  aFissured: {
    code: "Appendix A (b), Type A (i)",
    text: "However, no soil is Type A if: (i) The soil is fissured.",
  },
  aVibration: {
    code: "Appendix A (b), Type A (ii)",
    text: "However, no soil is Type A if: (ii) The soil is subject to vibration from heavy traffic, pile driving, or similar effects.",
  },
  aDisturbed: {
    code: "Appendix A (b), Type A (iii)",
    text: "However, no soil is Type A if: (iii) The soil has been previously disturbed.",
  },
  aLayered: {
    code: "Appendix A (b), Type A (iv)",
    text: "However, no soil is Type A if: (iv) The soil is part of a sloped, layered system where the layers dip into the excavation on a slope of four horizontal to one vertical (4H:1V) or greater.",
  },
  aOtherFactors: {
    code: "Appendix A (b), Type A (v)",
    text: "However, no soil is Type A if: (v) The material is subject to other factors that would require it to be classified as a less stable material.",
  },
  bStrength: {
    code: "Appendix A (b), Type B (i)",
    text: "Type B means: (i) Cohesive soil with an unconfined compressive strength greater than 0.5 tsf (48 kPa) but less than 1.5 tsf (144 kPa).",
  },
  bGranular: {
    code: "Appendix A (b), Type B (ii)",
    text: "Type B means: (ii) Granular cohesionless soils including: angular gravel (similar to crushed rock), silt, silt loam, sandy loam and, in some cases, silty clay loam and sandy clay loam.",
  },
  bDisturbed: {
    code: "Appendix A (b), Type B (iii)",
    text: "Type B means: (iii) Previously disturbed soils except those which would otherwise be classified as Type C soil.",
  },
  bFissuredOrVibration: {
    code: "Appendix A (b), Type B (iv)",
    text: "Type B means: (iv) Soil that meets the unconfined compressive strength or cementation requirements for Type A, but is fissured or subject to vibration.",
  },
  bDryRock: {
    code: "Appendix A (b), Type B (v)",
    text: "Type B means: (v) Dry rock that is not stable.",
  },
  cStrength: {
    code: "Appendix A (b), Type C (i)",
    text: "Type C means: (i) Cohesive soil with an unconfined compressive strength of 0.5 tsf (48 kPa) or less.",
  },
  cGranular: {
    code: "Appendix A (b), Type C (ii)",
    text: "Type C means: (ii) Granular soils including gravel, sand, and loamy sand.",
  },
  cSubmerged: {
    code: "Appendix A (b), Type C (iii)",
    text: "Type C means: (iii) Submerged soil or soil from which water is freely seeping.",
  },
  cSubmergedRock: {
    code: "Appendix A (b), Type C (iv)",
    text: "Type C means: (iv) Submerged rock that is not stable.",
  },
  cLayered: {
    code: "Appendix A (b), Type C (v)",
    text: "Type C means: (v) Material in a sloped, layered system where the layers dip into the excavation on a slope of four horizontal to one vertical (4H:1V) or steeper.",
  },
  basis: {
    code: "Appendix A (b)(2)",
    text: "The classification of the deposits shall be made based on the results of at least one visual and at least one manual analysis. Such analyses shall be conducted by a competent person.",
  },
  weakestLayer: {
    code: "Appendix A (b)(1)",
    text: "In a layered system, the system shall be classified in accordance with its weakest layer. However, each layer may be classified individually where a more stable layer lies under a less stable layer.",
  },
  engineerOver20ft: {
    code: "Appendix F",
    text: "Protective systems for use in excavations more than 20 feet in depth must be designed by a registered professional engineer in accordance with § 1926.652 (b) and (c).",
  },
  exceptions: {
    code: "§ 1926.652(a)(1)",
    text: "Each employee in an excavation shall be protected from cave-ins by an adequate protective system designed in accordance with paragraph (b) or (c) of this section except when: (i) Excavations are made entirely in stable rock; or (ii) Excavations are less than 5 feet (1.52m) in depth and examination of the ground by a competent person provides no indication of a potential cave-in.",
  },
} as const;

export interface Clause {
  code: string;
  text: string;
}

export interface EvaluatedCheck {
  label: string;
  applied: boolean;
  clause: Clause | null;
  /** What this check did to the classification, in plain language. */
  effect: string;
}

export interface SlopeSpec {
  /** Horizontal-to-vertical ratio exactly as Appendix B states it. */
  ratio: string;
  /** Derived from the ratio by arithmetic, for readers who think in degrees. */
  degreesFromHorizontal: number;
  /** Appendix B's own wording for the condition this applies to. */
  condition: string;
  clause: Clause;
}

export interface ClassifyInput {
  material: MaterialId | null;
  /** Unconfined compressive strength in tsf. Null when not measured. */
  strengthTsf: number | null;
  fissured: boolean;
  vibration: boolean;
  previouslyDisturbed: boolean;
  /** Submerged, or water freely seeping from the soil. */
  waterSeeping: boolean;
  layerDip: LayerDip;
}

export interface ClassificationResult {
  /** Least stable first. One entry when the criteria resolve to a single class. */
  possible: readonly SoilClass[];
  resolved: boolean;
  /** Clauses that decided, or that bound, the answer. */
  deciding: readonly Clause[];
  /** Every condition considered, applied or not. */
  checks: readonly EvaluatedCheck[];
  /** The one measurement that would resolve an unresolved answer. */
  missing: string | null;
  /** Appendix B slopes for the resolved class. Empty when unresolved or stable rock. */
  slopes: readonly SlopeSpec[];
  material: Material;
  /** Appendix A hedges on this material. */
  ambiguityNote: string | null;
  retrievedAt: string;
}

const SOURCE_RETRIEVED = "2026-09-22";

/** Rank so the least stable class always wins a comparison. */
const RANK: Record<SoilClass, number> = {
  C: 0,
  B: 1,
  A: 2,
  "stable-rock": 3,
};

function leastStable(a: SoilClass, b: SoilClass): SoilClass {
  return RANK[a] <= RANK[b] ? a : b;
}

export function classLabel(c: SoilClass): string {
  return c === "stable-rock" ? "Stable Rock" : `Type ${c}`;
}

/**
 * Appendix B, simple slope, excavations 20 feet or less in depth.
 * Degrees are derived from the stated ratio, not quoted from the regulation.
 */
function slopesFor(c: SoilClass): SlopeSpec[] {
  if (c === "A") {
    return [
      {
        ratio: "3/4:1",
        degreesFromHorizontal: Math.round((Math.atan(1 / 0.75) * 180) / Math.PI),
        condition: "All simple slope excavation 20 feet or less in depth",
        clause: {
          code: "Appendix B, B-1.1",
          text: "All simple slope excavation 20 feet or less in depth shall have a maximum allowable slope of 3/4 :1.",
        },
      },
      {
        ratio: "1/2:1",
        degreesFromHorizontal: Math.round((Math.atan(1 / 0.5) * 180) / Math.PI),
        condition:
          "Short-term exception — open 24 hours or less AND 12 feet or less in depth. Both conditions must hold.",
        clause: {
          code: "Appendix B, B-1.1",
          text: "Exception: Simple slope excavations which are open 24 hours or less (short term) and which are 12 feet or less in depth shall have a maximum allowable slope of 1/2 :1.",
        },
      },
    ];
  }
  if (c === "B") {
    return [
      {
        ratio: "1:1",
        degreesFromHorizontal: 45,
        condition: "All simple slope excavations 20 feet or less in depth",
        clause: {
          code: "Appendix B, B-1.2",
          text: "All simple slope excavations 20 feet or less in depth shall have a maximum allowable slope of 1:1.",
        },
      },
    ];
  }
  if (c === "C") {
    return [
      {
        ratio: "1 1/2:1",
        degreesFromHorizontal: Math.round((Math.atan(1 / 1.5) * 180) / Math.PI),
        condition: "All simple slope excavations 20 feet or less in depth",
        clause: {
          code: "Appendix B, B-1.3",
          text: "All simple slope excavations 20 feet or less in depth shall have a maximum allowable slope of 1 1/2 :1.",
        },
      },
    ];
  }
  return [];
}

/**
 * Applies the Appendix A criteria to the answers given.
 *
 * Type C conditions are absolute. Type A is the only class carrying
 * disqualifiers that demote it. Where a cohesive soil's strength was not
 * measured, the result is deliberately a RANGE rather than a guess.
 */
export function classifySoil(input: ClassifyInput): ClassificationResult {
  if (!input.material) {
    throw new ToolError("bad-input", "Choose the material you are looking at.");
  }
  const material = materialById(input.material);
  if (!material) {
    throw new ToolError("bad-input", "That material is not one of the Appendix A materials.");
  }
  if (input.strengthTsf !== null) {
    if (!Number.isFinite(input.strengthTsf) || input.strengthTsf < 0) {
      throw new ToolError(
        "bad-input",
        "Unconfined compressive strength must be zero or a positive number, in tsf.",
      );
    }
    if (input.strengthTsf > 100) {
      throw new ToolError(
        "bad-input",
        "That strength is far outside the range Appendix A works in. Check whether the figure is in tsf.",
      );
    }
  }

  const checks: EvaluatedCheck[] = [];
  const deciding: Clause[] = [];

  // Stable rock is a material determination, not a soil class, so it short-circuits.
  if (material.kind === "stable-rock") {
    deciding.push(CLAUSES.stableRock);
    checks.push({
      label: "Excavatable with vertical sides and remains intact while exposed",
      applied: true,
      clause: CLAUSES.stableRock,
      effect: "Classified as stable rock.",
    });
    return {
      possible: ["stable-rock"],
      resolved: true,
      deciding,
      checks,
      missing: null,
      slopes: [],
      material,
      ambiguityNote: null,
      retrievedAt: SOURCE_RETRIEVED,
    };
  }

  // 1. Base class from the material, and from strength where the material is cohesive.
  let base: SoilClass | null = null;

  if (material.kind === "cemented") {
    base = "A";
    deciding.push(CLAUSES.aCemented);
  } else if (material.kind === "granular-b") {
    base = "B";
    deciding.push(CLAUSES.bGranular);
  } else if (material.kind === "granular-c") {
    base = "C";
    deciding.push(CLAUSES.cGranular);
  } else if (material.kind === "unstable-rock") {
    // Dry unstable rock is Type B; submerged unstable rock is Type C.
    base = input.waterSeeping ? "C" : "B";
    deciding.push(input.waterSeeping ? CLAUSES.cSubmergedRock : CLAUSES.bDryRock);
  } else if (material.kind === "cohesive") {
    if (input.strengthTsf === null) {
      base = null; // Genuinely unknown — do not guess.
    } else if (input.strengthTsf >= 1.5) {
      base = "A";
      deciding.push(CLAUSES.aStrength);
    } else if (input.strengthTsf > 0.5) {
      base = "B";
      deciding.push(CLAUSES.bStrength);
    } else {
      base = "C";
      deciding.push(CLAUSES.cStrength);
    }
  }

  checks.push({
    label: `Material: ${material.label}`,
    applied: true,
    clause: deciding[0] ?? null,
    effect:
      base === null
        ? "Cohesive soil. The class depends on unconfined compressive strength, which was not entered."
        : `Starts at ${classLabel(base)} before any other condition is applied.`,
  });

  // 2. Conditions that force Type C outright.
  let forcedC = false;

  if (input.waterSeeping && material.kind !== "unstable-rock") {
    forcedC = true;
    deciding.push(CLAUSES.cSubmerged);
  }
  checks.push({
    label: "Submerged, or water freely seeping from the soil",
    applied: input.waterSeeping,
    clause: input.waterSeeping
      ? material.kind === "unstable-rock"
        ? CLAUSES.cSubmergedRock
        : CLAUSES.cSubmerged
      : null,
    effect: input.waterSeeping
      ? "Forces Type C."
      : "Not reported, so no Type C condition from water.",
  });

  if (input.layerDip === "4h1v-or-steeper") {
    forcedC = true;
    deciding.push(CLAUSES.cLayered);
  }
  checks.push({
    label: "Sloped, layered system with layers dipping into the excavation",
    applied: input.layerDip !== "none",
    clause:
      input.layerDip === "4h1v-or-steeper"
        ? CLAUSES.cLayered
        : input.layerDip === "less-steep"
          ? CLAUSES.weakestLayer
          : null,
    effect:
      input.layerDip === "4h1v-or-steeper"
        ? "Layers dip at 4H:1V or steeper, which forces Type C."
        : input.layerDip === "less-steep"
          ? "Layers dip less steeply than 4H:1V. This does not force Type C on its own, but a layered system is classified by its weakest layer."
          : "No layered system reported.",
  });

  // 3. Conditions that demote Type A.
  const demotesA = input.fissured || input.vibration;

  checks.push({
    label: "Fissured",
    applied: input.fissured,
    clause: input.fissured ? CLAUSES.aFissured : null,
    effect: input.fissured
      ? "Cannot be Type A. Soil that would otherwise meet Type A becomes Type B."
      : "Not reported, so Type A is not excluded on this ground.",
  });

  checks.push({
    label: "Subject to vibration from heavy traffic, pile driving or similar",
    applied: input.vibration,
    clause: input.vibration ? CLAUSES.aVibration : null,
    effect: input.vibration
      ? "Cannot be Type A. Soil that would otherwise meet Type A becomes Type B."
      : "Not reported, so Type A is not excluded on this ground.",
  });

  checks.push({
    label: "Previously disturbed",
    applied: input.previouslyDisturbed,
    clause: input.previouslyDisturbed ? CLAUSES.bDisturbed : null,
    effect: input.previouslyDisturbed
      ? "Previously disturbed soil is Type B, except where it would otherwise be Type C, which stays Type C."
      : "Not reported, so Type A is not excluded on this ground.",
  });

  // 4. Resolve.
  const applyConditions = (start: SoilClass): SoilClass => {
    let out = start;
    if (forcedC) out = leastStable(out, "C");
    if (out === "A" && demotesA) {
      out = "B";
      if (!deciding.includes(CLAUSES.bFissuredOrVibration)) {
        deciding.push(CLAUSES.bFissuredOrVibration);
      }
    }
    if (input.previouslyDisturbed) {
      // Type B (iii): previously disturbed, EXCEPT what would otherwise be Type C.
      out = out === "C" ? "C" : leastStable(out, "B");
    }
    return out;
  };

  let possible: SoilClass[];
  let missing: string | null = null;

  if (base !== null) {
    possible = [applyConditions(base)];
  } else if (forcedC) {
    // A Type C condition settles it even without a strength measurement.
    possible = ["C"];
  } else {
    // Cohesive, strength unmeasured: report the range the other answers leave open.
    const candidates: SoilClass[] = demotesA || input.previouslyDisturbed ? ["C", "B"] : ["C", "B", "A"];
    possible = candidates.map(applyConditions).filter((c, i, arr) => arr.indexOf(c) === i);
    possible.sort((x, y) => RANK[x] - RANK[y]);
    missing =
      "Unconfined compressive strength, in tsf. Appendix A says it “can be determined by laboratory testing, or estimated in the field using a pocket penetrometer, by thumb penetration tests, and other methods.”";
    if (input.fissured) deciding.push(CLAUSES.aFissured);
    if (input.vibration) deciding.push(CLAUSES.aVibration);
    if (input.previouslyDisturbed) deciding.push(CLAUSES.aDisturbed);
  }

  const resolved = possible.length === 1;

  return {
    possible,
    resolved,
    deciding,
    checks,
    missing,
    slopes: resolved ? slopesFor(possible[0]) : [],
    material,
    ambiguityNote: material.ambiguityNote,
    retrievedAt: SOURCE_RETRIEVED,
  };
}
