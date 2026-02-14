/**
 * SLE Scoring Rubric v2
 * 
 * Formal scoring criteria aligned with the Public Service Commission (PSC)
 * Second Language Evaluation (SLE) standards for levels A, B, and C.
 * 
 * v2 FIX: Unified to 7 canonical PSC criteria (matching grading_logic.jsonl):
 *   grammar, vocabulary, fluency, pronunciation, comprehension, interaction, logical_connectors
 * Each criterion scored 0-100. Overall = weighted composite.
 * Pass thresholds: A ≥ 36, B ≥ 55, C ≥ 75
 * 
 * PREVIOUS BUG: v1 used 4 different criteria (0-25 each) in the prompt
 * but the Zod schema expected 7 different criteria with different names.
 * This caused JSON parse failures and score misalignment.
 */

export interface ScoringCriterion {
  name: string;
  /** Canonical key matching grading_logic.jsonl criteria_weights */
  key: string;
  weight: number;
  descriptors: Record<"A" | "B" | "C", {
    excellent: string;  // 80-100
    good: string;       // 60-79
    adequate: string;   // 40-59
    developing: string; // 20-39
    insufficient: string; // 0-19
  }>;
}

export interface LevelRubric {
  level: "A" | "B" | "C";
  passThreshold: number;
  description: string;
}

// ============================================================================
// CANONICAL 7 PSC CRITERIA — must match grading_logic.jsonl criteria_weights
// ============================================================================

export const CANONICAL_CRITERIA_KEYS = [
  "grammar",
  "vocabulary",
  "fluency",
  "pronunciation",
  "comprehension",
  "interaction",
  "logical_connectors",
] as const;

export type CanonicalCriterionKey = typeof CANONICAL_CRITERIA_KEYS[number];

export const PSC_CRITERIA: ScoringCriterion[] = [
  {
    name: "Grammar",
    key: "grammar",
    weight: 0.15,
    descriptors: {
      A: {
        excellent: "Consistently correct basic grammar (subject-verb agreement, basic tenses — présent, passé composé, futur proche). Minor errors do not impede comprehension.",
        good: "Mostly correct basic grammar with occasional errors in tense usage or agreement.",
        adequate: "Frequent errors in basic structures but meaning is generally recoverable.",
        developing: "Significant grammatical errors that sometimes obscure meaning.",
        insufficient: "Grammar errors make the message largely incomprehensible.",
      },
      B: {
        excellent: "Consistent control of intermediate grammar (subjonctif, conditionnel, relative clauses, pronoms compléments). Errors are rare.",
        good: "Good control of most intermediate structures. Occasional errors with complex tenses but self-corrects.",
        adequate: "Adequate control of basic grammar but struggles with intermediate structures.",
        developing: "Limited control beyond basic structures. Frequent errors with intermediate grammar.",
        insufficient: "Cannot produce intermediate structures. Reverts to basic patterns with many errors.",
      },
      C: {
        excellent: "Near-native grammatical control including complex structures (subjonctif passé, concordance des temps, voix passive, discours indirect). Rare, minor errors only.",
        good: "Strong control of advanced grammar. Occasional errors with the most complex structures.",
        adequate: "Good control of intermediate grammar but inconsistent with advanced structures.",
        developing: "Limited control of advanced structures. Frequent errors that impede nuanced expression.",
        insufficient: "Cannot produce advanced grammatical structures.",
      },
    },
  },
  {
    name: "Vocabulary",
    key: "vocabulary",
    weight: 0.15,
    descriptors: {
      A: {
        excellent: "Uses common workplace vocabulary accurately. Appropriate register for simple interactions.",
        good: "Adequate vocabulary for routine tasks. Occasional word choice errors but meaning is clear.",
        adequate: "Limited but functional vocabulary. Relies on basic words and may use English cognates.",
        developing: "Very limited vocabulary. Frequently unable to find the right word.",
        insufficient: "Vocabulary too limited to communicate even basic information.",
      },
      B: {
        excellent: "Uses varied, precise vocabulary appropriate to workplace contexts. Correct register (formal for reports, semi-formal for meetings).",
        good: "Good range of vocabulary with occasional imprecision. Generally appropriate register.",
        adequate: "Adequate vocabulary for familiar topics but limited when discussing less routine subjects.",
        developing: "Limited vocabulary range. Frequent paraphrasing or code-switching.",
        insufficient: "Vocabulary insufficient for intermediate-level communication.",
      },
      C: {
        excellent: "Rich, precise, and nuanced vocabulary. Masterful register control — can shift between formal policy language, diplomatic phrasing, and technical terminology.",
        good: "Wide vocabulary range with occasional imprecision in specialized terms. Good register awareness.",
        adequate: "Adequate vocabulary for most topics but lacks precision for nuanced or specialized discussion.",
        developing: "Limited advanced vocabulary. Cannot consistently maintain appropriate register.",
        insufficient: "Vocabulary insufficient for advanced-level communication.",
      },
    },
  },
  {
    name: "Fluency",
    key: "fluency",
    weight: 0.20,
    descriptors: {
      A: {
        excellent: "Speaks with reasonable ease on familiar topics. Pauses are natural, not caused by language search.",
        good: "Generally fluent on routine topics with occasional hesitations.",
        adequate: "Noticeable hesitations and pauses but can sustain basic communication.",
        developing: "Frequent pauses and hesitations that disrupt communication flow.",
        insufficient: "Cannot sustain even basic communication without constant pausing.",
      },
      B: {
        excellent: "Speaks fluently on a range of topics with natural rhythm. Self-corrects smoothly.",
        good: "Generally fluent with occasional hesitations when discussing complex topics.",
        adequate: "Can communicate on familiar topics but hesitates with less routine subjects.",
        developing: "Frequent hesitations that slow communication. Limited ability to elaborate.",
        insufficient: "Cannot maintain fluent communication beyond simple exchanges.",
      },
      C: {
        excellent: "Near-native fluency. Speaks effortlessly on complex, abstract topics. Natural intonation and rhythm.",
        good: "Fluent on most topics including complex ones. Rare hesitations.",
        adequate: "Generally fluent but occasional hesitations on abstract or sensitive topics.",
        developing: "Fluency breaks down when handling complex or diplomatic situations.",
        insufficient: "Cannot maintain fluent communication at the advanced level.",
      },
    },
  },
  {
    name: "Pronunciation",
    key: "pronunciation",
    weight: 0.10,
    descriptors: {
      A: {
        excellent: "Clear pronunciation of common words. Accent does not impede comprehension.",
        good: "Generally clear pronunciation with occasional errors on less common words.",
        adequate: "Pronunciation errors are frequent but message is usually understandable.",
        developing: "Pronunciation errors sometimes impede comprehension.",
        insufficient: "Pronunciation makes communication very difficult.",
      },
      B: {
        excellent: "Clear, natural pronunciation. Good intonation patterns. Liaison and enchaînement mostly correct.",
        good: "Generally clear pronunciation with occasional errors on complex words.",
        adequate: "Pronunciation is adequate but accent is noticeable. Some liaison errors.",
        developing: "Pronunciation errors are frequent and sometimes impede understanding.",
        insufficient: "Pronunciation significantly impedes communication.",
      },
      C: {
        excellent: "Near-native pronunciation. Natural intonation, liaison, enchaînement. Minimal accent.",
        good: "Clear pronunciation with natural intonation. Rare errors.",
        adequate: "Good pronunciation but occasional errors on complex or specialized terms.",
        developing: "Pronunciation is adequate but lacks the naturalness expected at Level C.",
        insufficient: "Pronunciation does not meet advanced-level expectations.",
      },
    },
  },
  {
    name: "Comprehension",
    key: "comprehension",
    weight: 0.15,
    descriptors: {
      A: {
        excellent: "Understands simple, clearly articulated speech on familiar topics. Can follow basic instructions.",
        good: "Understands most simple speech but may need repetition or rephrasing.",
        adequate: "Understands basic speech but struggles with unfamiliar vocabulary or fast speech.",
        developing: "Limited comprehension. Needs frequent repetition and simplification.",
        insufficient: "Cannot understand basic spoken communication.",
      },
      B: {
        excellent: "Understands extended speech on familiar and some unfamiliar topics. Can follow complex instructions.",
        good: "Understands most speech on familiar topics. Occasional difficulty with complex or rapid speech.",
        adequate: "Understands speech on familiar topics but struggles with complex or abstract content.",
        developing: "Limited comprehension beyond simple, familiar topics.",
        insufficient: "Cannot understand speech at the intermediate level.",
      },
      C: {
        excellent: "Understands virtually all speech including nuanced, implicit, and abstract content. Can detect irony and subtext.",
        good: "Understands complex speech including most nuances and implications.",
        adequate: "Good comprehension but occasionally misses subtle nuances or implications.",
        developing: "Comprehension is adequate but struggles with highly nuanced or implicit content.",
        insufficient: "Cannot reliably understand complex or nuanced speech.",
      },
    },
  },
  {
    name: "Interaction",
    key: "interaction",
    weight: 0.15,
    descriptors: {
      A: {
        excellent: "Can participate in simple exchanges. Responds appropriately to basic questions.",
        good: "Can handle simple interactions with occasional difficulty in turn-taking.",
        adequate: "Can respond to direct questions but struggles to initiate or maintain exchanges.",
        developing: "Very limited ability to interact. Relies heavily on the interlocutor.",
        insufficient: "Cannot participate meaningfully in an exchange.",
      },
      B: {
        excellent: "Engages actively in discussions. Can ask for clarification, elaborate, and respond to follow-ups naturally.",
        good: "Good interaction skills with occasional difficulty in complex exchanges.",
        adequate: "Can participate in discussions but struggles to elaborate or handle unexpected questions.",
        developing: "Limited interaction beyond answering direct questions.",
        insufficient: "Cannot engage in meaningful discussion.",
      },
      C: {
        excellent: "Masterful interaction skills. Can negotiate, persuade, handle disagreements diplomatically, and adapt to interlocutor.",
        good: "Strong interaction skills. Can handle most complex exchanges including some diplomatic situations.",
        adequate: "Good interaction but occasionally struggles with diplomatic or sensitive exchanges.",
        developing: "Interaction skills are adequate but lack the sophistication expected at Level C.",
        insufficient: "Cannot handle complex interactive situations.",
      },
    },
  },
  {
    name: "Logical Connectors",
    key: "logical_connectors",
    weight: 0.10,
    descriptors: {
      A: {
        excellent: "Uses basic connectors (et, mais, parce que, alors) to link ideas logically.",
        good: "Uses some basic connectors. Ideas are generally connected.",
        adequate: "Limited use of connectors. Ideas are present but poorly linked.",
        developing: "Minimal use of connectors. Disjointed ideas.",
        insufficient: "No connectors used. Isolated words or fragments only.",
      },
      B: {
        excellent: "Uses varied connectors (cependant, néanmoins, en revanche, par conséquent) to build coherent arguments.",
        good: "Good variety of connectors. Logical flow with minor gaps.",
        adequate: "Adequate use of connectors but relies on simple ones. Some logical gaps.",
        developing: "Limited connector use. Ideas are present but poorly organized.",
        insufficient: "No clear logical organization.",
      },
      C: {
        excellent: "Uses sophisticated discourse markers (en l'occurrence, force est de constater, il n'en demeure pas moins). Seamless argumentation.",
        good: "Good variety of advanced discourse markers. Clear argumentation.",
        adequate: "Adequate use of connectors but argumentation could be more sophisticated.",
        developing: "Connector use does not meet the sophistication expected at Level C.",
        insufficient: "Logical organization does not meet advanced-level expectations.",
      },
    },
  },
];

// ============================================================================
// LEVEL DEFINITIONS
// ============================================================================

export const SLE_LEVELS: Record<string, LevelRubric> = {
  A: {
    level: "A",
    passThreshold: 36,
    description: "Basic proficiency: Can handle simple, routine tasks and communicate basic information.",
  },
  B: {
    level: "B",
    passThreshold: 55,
    description: "Intermediate proficiency: Can handle moderately complex tasks, explain and discuss work-related topics.",
  },
  C: {
    level: "C",
    passThreshold: 75,
    description: "Advanced proficiency: Can handle complex, sensitive situations; present and defend positions with nuance.",
  },
};

// Keep backward compat alias
export const SLE_RUBRICS = SLE_LEVELS;

// ============================================================================
// SCORING PROMPT BUILDER
// ============================================================================

/**
 * Build the scoring prompt for the LLM evaluator.
 * 
 * v2 FIX: Now uses all 7 canonical PSC criteria (0-100 each)
 * with snake_case keys matching grading_logic.jsonl.
 * 
 * PREVIOUS BUG: v1 used 4 criteria with camelCase names that didn't
 * match the Zod schema in evaluateResponse(), causing JSON parse failures.
 */
export function buildScoringPrompt(level: "A" | "B" | "C", skill: string): string {
  const levelDef = SLE_LEVELS[level];
  
  let prompt = `You are an SLE (Second Language Evaluation) exam evaluator for the Canadian Public Service Commission.
You are evaluating a response at Level ${level} (${levelDef.description}).

SCORING RUBRIC — Level ${level}
Pass threshold: ${levelDef.passThreshold}/100

`;

  for (const criterion of PSC_CRITERIA) {
    const desc = criterion.descriptors[level];
    prompt += `### ${criterion.name} [key: "${criterion.key}"] (0-100, weight: ${criterion.weight})
- Excellent (80-100): ${desc.excellent}
- Good (60-79): ${desc.good}
- Adequate (40-59): ${desc.adequate}
- Developing (20-39): ${desc.developing}
- Insufficient (0-19): ${desc.insufficient}

`;
  }

  prompt += `INSTRUCTIONS:
1. Score each of the 7 criteria independently (0-100) using the descriptors above.
2. Provide specific evidence from the response for each score.
3. Calculate the overall weighted score: ${PSC_CRITERIA.map(c => `${c.key}×${c.weight}`).join(" + ")}.
4. Determine pass/fail based on the threshold (${levelDef.passThreshold}/100).
5. Provide actionable feedback in the learner's language.
6. List specific corrections with the incorrect form and the correct form.
7. Suggest 2-3 concrete improvement strategies.

CRITICAL: You MUST use these EXACT JSON keys for criteriaScores:
{
  "score": <overall weighted score 0-100>,
  "passed": <true/false>,
  "criteriaScores": {
    "grammar": <0-100>,
    "vocabulary": <0-100>,
    "fluency": <0-100>,
    "pronunciation": <0-100>,
    "comprehension": <0-100>,
    "interaction": <0-100>,
    "logical_connectors": <0-100>
  },
  "feedback": "<overall feedback>",
  "corrections": ["<specific correction 1>", "<specific correction 2>"],
  "suggestions": ["<improvement suggestion 1>", "<improvement suggestion 2>"],
  "levelAssessment": "<brief assessment of whether the response meets Level ${level} expectations>"
}`;

  return prompt;
}

/**
 * Get the pass threshold for a given level.
 */
export function getPassThreshold(level: "A" | "B" | "C"): number {
  return SLE_LEVELS[level].passThreshold;
}

/**
 * Determine if a score passes for a given level.
 */
export function isPassing(level: "A" | "B" | "C", score: number): boolean {
  return score >= SLE_LEVELS[level].passThreshold;
}
