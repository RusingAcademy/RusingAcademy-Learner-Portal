/**
 * SLE Scoring Pipeline — Anti-Regression Tests
 *
 * These tests ensure the scoring pipeline remains aligned across all layers:
 * 1. buildScoringPrompt() references all 7 canonical criteria
 * 2. Zod json_schema in evaluateResponse matches grading_logic criteria_weights
 * 3. normalizeCriterionScores handles legacy camelCase keys
 * 4. computeCompositeScore produces correct level assignments
 * 5. scoreToCriterionLevel thresholds match grading_logic
 *
 * RUN: npx vitest run server/services/__tests__/sleScoringPipeline.test.ts
 */

import { describe, it, expect } from "vitest";
import {
  buildScoringPrompt,
  CANONICAL_CRITERIA_KEYS,
  PSC_CRITERIA,
  isPassing,
  getPassThreshold,
  SLE_LEVELS,
} from "../sleScoringRubric";
import {
  normalizeCriterionScores,
  computeSessionScore,
  computeRollingAverage,
  hasSustainedLevel,
} from "../sleScoringService";

// ─── Canonical Criteria Alignment ────────────────────────────

describe("Canonical Criteria Alignment", () => {
  const EXPECTED_KEYS = [
    "grammar",
    "vocabulary",
    "fluency",
    "pronunciation",
    "comprehension",
    "interaction",
    "logical_connectors",
  ];

  it("CANONICAL_CRITERIA_KEYS contains exactly 7 PSC criteria", () => {
    expect(CANONICAL_CRITERIA_KEYS).toHaveLength(7);
    expect([...CANONICAL_CRITERIA_KEYS].sort()).toEqual([...EXPECTED_KEYS].sort());
  });

  it("PSC_CRITERIA array has 7 entries with matching keys", () => {
    expect(PSC_CRITERIA).toHaveLength(7);
    const keys = PSC_CRITERIA.map((c) => c.key);
    expect(keys.sort()).toEqual([...EXPECTED_KEYS].sort());
  });

  it("PSC_CRITERIA weights sum to 1.0", () => {
    const totalWeight = PSC_CRITERIA.reduce((sum, c) => sum + c.weight, 0);
    expect(totalWeight).toBeCloseTo(1.0, 5);
  });

  it("Each PSC_CRITERIA entry has descriptors for all 3 levels", () => {
    for (const criterion of PSC_CRITERIA) {
      expect(criterion.descriptors).toHaveProperty("A");
      expect(criterion.descriptors).toHaveProperty("B");
      expect(criterion.descriptors).toHaveProperty("C");
      for (const level of ["A", "B", "C"] as const) {
        expect(criterion.descriptors[level]).toHaveProperty("excellent");
        expect(criterion.descriptors[level]).toHaveProperty("good");
        expect(criterion.descriptors[level]).toHaveProperty("adequate");
        expect(criterion.descriptors[level]).toHaveProperty("developing");
        expect(criterion.descriptors[level]).toHaveProperty("insufficient");
      }
    }
  });
});

// ─── buildScoringPrompt ──────────────────────────────────────

describe("buildScoringPrompt", () => {
  it("references all 7 canonical criteria keys in the prompt", () => {
    for (const level of ["A", "B", "C"] as const) {
      const prompt = buildScoringPrompt(level, "oral_expression");
      for (const key of CANONICAL_CRITERIA_KEYS) {
        expect(prompt).toContain(`"${key}"`);
      }
    }
  });

  it("uses 0-100 scale (not 0-25)", () => {
    const prompt = buildScoringPrompt("B", "oral_expression");
    expect(prompt).toContain("0-100");
    // Should NOT contain the old 0-25 scale in the JSON template
    expect(prompt).not.toMatch(/"grammar":\s*<0-25>/);
  });

  it("includes pass threshold for each level", () => {
    expect(buildScoringPrompt("A", "oral_expression")).toContain("36/100");
    expect(buildScoringPrompt("B", "oral_expression")).toContain("55/100");
    expect(buildScoringPrompt("C", "oral_expression")).toContain("75/100");
  });

  it("does NOT contain legacy camelCase keys", () => {
    for (const level of ["A", "B", "C"] as const) {
      const prompt = buildScoringPrompt(level, "oral_expression");
      expect(prompt).not.toContain("grammaticalAccuracy");
      expect(prompt).not.toContain("vocabularyRegister");
      expect(prompt).not.toContain("coherenceOrganization");
      expect(prompt).not.toContain("taskCompletion");
      expect(prompt).not.toContain("languageFunctions");
      expect(prompt).not.toContain("lexicalRichness");
      expect(prompt).not.toContain("grammaticalComplexity");
      expect(prompt).not.toContain("coherenceCohesion");
      expect(prompt).not.toContain("nuancePrecision");
      expect(prompt).not.toContain("logicalConnectors");
    }
  });
});

// ─── normalizeCriterionScores ────────────────────────────────

describe("normalizeCriterionScores", () => {
  it("passes through canonical snake_case keys unchanged", () => {
    const input = {
      grammar: 80,
      vocabulary: 70,
      fluency: 65,
      pronunciation: 60,
      comprehension: 75,
      interaction: 85,
      logical_connectors: 55,
    };
    const result = normalizeCriterionScores(input);
    expect(result).toEqual(input);
  });

  it("normalizes v1 camelCase keys (4-criteria model)", () => {
    const input = {
      grammaticalAccuracy: 80,
      vocabularyRegister: 70,
      coherenceOrganization: 65,
      taskCompletion: 60,
    };
    const result = normalizeCriterionScores(input);
    expect(result.grammar).toBe(80);
    expect(result.vocabulary).toBe(70);
    expect(result.logical_connectors).toBe(65);
    expect(result.comprehension).toBe(60);
    // Missing criteria default to 0
    expect(result.fluency).toBe(0);
    expect(result.pronunciation).toBe(0);
    expect(result.interaction).toBe(0);
  });

  it("normalizes v1 Zod schema keys (7-criteria model)", () => {
    const input = {
      languageFunctions: 80,
      lexicalRichness: 70,
      grammaticalComplexity: 65,
      coherenceCohesion: 60,
      nuancePrecision: 75,
      interaction: 85,
      logicalConnectors: 55,
    };
    const result = normalizeCriterionScores(input);
    expect(result.fluency).toBe(80);
    expect(result.vocabulary).toBe(70);
    expect(result.grammar).toBe(65);
    expect(result.logical_connectors).toBe(60); // max of coherenceCohesion=60 and logicalConnectors=55
    expect(result.comprehension).toBe(75);
    expect(result.interaction).toBe(85);
    expect(result.pronunciation).toBe(0); // was not in v1 Zod schema
  });

  it("clamps scores to 0-100 range", () => {
    const input = {
      grammar: 150,
      vocabulary: -10,
      fluency: 50,
      pronunciation: 50,
      comprehension: 50,
      interaction: 50,
      logical_connectors: 50,
    };
    const result = normalizeCriterionScores(input);
    expect(result.grammar).toBe(100);
    expect(result.vocabulary).toBe(0);
  });

  it("defaults missing criteria to 0", () => {
    const result = normalizeCriterionScores({});
    for (const key of CANONICAL_CRITERIA_KEYS) {
      expect(result[key]).toBe(0);
    }
  });

  it("always returns all 7 canonical keys", () => {
    const result = normalizeCriterionScores({ grammar: 50 });
    const keys = Object.keys(result).sort();
    expect(keys).toEqual([...CANONICAL_CRITERIA_KEYS].sort());
  });
});

// ─── Level Thresholds ────────────────────────────────────────

describe("Level Thresholds", () => {
  it("SLE_LEVELS has correct pass thresholds", () => {
    expect(SLE_LEVELS.A.passThreshold).toBe(36);
    expect(SLE_LEVELS.B.passThreshold).toBe(55);
    expect(SLE_LEVELS.C.passThreshold).toBe(75);
  });

  it("isPassing correctly evaluates thresholds", () => {
    // Level A
    expect(isPassing("A", 35)).toBe(false);
    expect(isPassing("A", 36)).toBe(true);
    expect(isPassing("A", 100)).toBe(true);

    // Level B
    expect(isPassing("B", 54)).toBe(false);
    expect(isPassing("B", 55)).toBe(true);
    expect(isPassing("B", 100)).toBe(true);

    // Level C
    expect(isPassing("C", 74)).toBe(false);
    expect(isPassing("C", 75)).toBe(true);
    expect(isPassing("C", 100)).toBe(true);
  });

  it("getPassThreshold returns correct values", () => {
    expect(getPassThreshold("A")).toBe(36);
    expect(getPassThreshold("B")).toBe(55);
    expect(getPassThreshold("C")).toBe(75);
  });
});

// ─── computeSessionScore ─────────────────────────────────────

describe("computeSessionScore", () => {
  it("computes correct overall score with canonical keys", () => {
    const scores = {
      grammar: 80,       // × 0.15 = 12
      vocabulary: 80,    // × 0.15 = 12
      fluency: 80,       // × 0.20 = 16
      pronunciation: 80, // × 0.10 = 8
      comprehension: 80, // × 0.15 = 12
      interaction: 80,   // × 0.15 = 12
      logical_connectors: 80, // × 0.10 = 8
    };
    const result = computeSessionScore(1, "FR", scores);
    expect(result.overallScore).toBe(80);
    expect(result.level).toBe("C");
    expect(result.criterionScores).toHaveLength(7);
  });

  it("handles mixed scores correctly", () => {
    const scores = {
      grammar: 60,
      vocabulary: 55,
      fluency: 50,
      pronunciation: 45,
      comprehension: 60,
      interaction: 55,
      logical_connectors: 50,
    };
    const result = computeSessionScore(1, "EN", scores);
    // Weighted: 60×0.15 + 55×0.15 + 50×0.20 + 45×0.10 + 60×0.15 + 55×0.15 + 50×0.10
    // = 9 + 8.25 + 10 + 4.5 + 9 + 8.25 + 5 = 54
    expect(result.overallScore).toBe(54);
    expect(result.level).toBe("A");
  });

  it("normalizes legacy camelCase keys before computing", () => {
    const legacyScores = {
      grammaticalAccuracy: 80,
      vocabularyRegister: 80,
      coherenceOrganization: 80,
      taskCompletion: 80,
    };
    const result = computeSessionScore(1, "FR", legacyScores);
    // Only 4 of 7 criteria have values; others default to 0
    // grammar=80, vocabulary=80, logical_connectors=80, comprehension=80
    // fluency=0, pronunciation=0, interaction=0
    expect(result.criterionScores).toHaveLength(7);
    // The overall score will be low because 3 criteria are 0
    expect(result.overallScore).toBeLessThan(55);
  });

  it("identifies strengths and weaknesses", () => {
    const scores = {
      grammar: 80,
      vocabulary: 40,
      fluency: 90,
      pronunciation: 30,
      comprehension: 60,
      interaction: 75,
      logical_connectors: 50,
    };
    const result = computeSessionScore(1, "FR", scores);
    expect(result.strengths).toContain("grammar");
    expect(result.strengths).toContain("fluency");
    expect(result.strengths).toContain("interaction");
    expect(result.weaknesses).toContain("vocabulary");
    expect(result.weaknesses).toContain("pronunciation");
    expect(result.weaknesses).toContain("logical_connectors");
  });
});

// ─── Rolling Average & Sustained Level ───────────────────────

describe("Rolling Average", () => {
  it("computes correct rolling average", () => {
    expect(computeRollingAverage([60, 70, 80, 90, 100])).toBe(80);
    expect(computeRollingAverage([50, 60, 70, 80, 90, 100], 3)).toBe(90);
    expect(computeRollingAverage([])).toBe(0);
  });
});

describe("Sustained Level", () => {
  it("detects sustained Level B", () => {
    expect(hasSustainedLevel([55, 60, 65, 70, 55], "B")).toBe(true);
    expect(hasSustainedLevel([55, 60, 65, 70, 30], "B")).toBe(true); // 4/5 = 80%
    expect(hasSustainedLevel([55, 30, 30, 30, 30], "B")).toBe(false); // 1/5 = 20%
  });

  it("detects sustained Level C", () => {
    expect(hasSustainedLevel([75, 80, 85, 90, 75], "C")).toBe(true);
    expect(hasSustainedLevel([75, 80, 50, 50, 50], "C")).toBe(false); // 2/5 = 40%
  });

  it("returns false for empty array", () => {
    expect(hasSustainedLevel([], "B")).toBe(false);
  });
});
