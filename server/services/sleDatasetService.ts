/**
 * SLE Dataset Service
 * Loads and provides access to the SLE training dataset (data/sle/seed/*.jsonl)
 * Singleton pattern — loads once, serves from memory.
 *
 * Updated 2025-2026: The SLE oral exam is now a single continuous progressive
 * interview with 3 phases (not 4 separate parts). Listening assets removed.
 *
 * v2.1: Added knowledge_base.jsonl for generalist coach context injection.
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";

// ─── Types ───────────────────────────────────────────────────

export type ExamPhase = "1" | "2" | "3";

export interface ExamComponent {
  id: string;
  phase: string;
  language: string;
  name: string;
  level_target: string;
  duration_min: number;
  duration_max: number;
  objectives: string[];
  description: string;
  format_note?: string;
  key_structures?: string[];
}

export interface Rubric {
  id: string;
  criterion: string;
  level: string;
  language: string;
  descriptor: string;
  weight: number;
  indicators: string[];
}

export interface GradingLogic {
  id: string;
  rolling_window_sessions: number;
  sustained_threshold: number;
  level_thresholds: Record<string, { min_score: number; max_score: number }>;
  criteria_weights: Record<string, number>;
  composite_rules: string[];
}

export interface Scenario {
  id: string;
  language: string;
  phase: string;
  mode: string;
  level_target: string;
  topic_domain: string;
  context: string;
  instructions: string;
  prompt_text: string;
  followups: string[];
  expected_elements: string[];
  rubric_ids: string[];
  common_error_ids: string[];
  feedback_template_ids: string[];
}

export interface Question {
  id: string;
  language: string;
  phase: string;
  level_target: string;
  topic_domain: string;
  question_text: string;
  followups: string[];
  timing_seconds: number;
  variants: string[];
}

export interface CommonError {
  id: string;
  language: string;
  category: string;
  pattern: string;
  correction: string;
  feedback_text: string;
  level_impact: string;
  criterion_affected: string;
}

export interface FeedbackTemplate {
  id: string;
  language: string;
  type: string;
  criterion: string;
  level_context: string;
  template_text: string;
  variables: string[];
}

export interface AnswerGuide {
  id: string;
  scenario_id: string;
  language: string;
  expected_elements: string[];
  recommended_structures: string[];
  common_pitfalls: string[];
  model_answer_outline: string;
}

export interface Citation {
  id: string;
  title: string;
  url: string;
  accessed_date: string;
  notes: string;
}

export interface KnowledgeEntry {
  id: string;
  category: string;
  language: string;
  topic: string;
  content: string;
  level: string;
  tags: string[];
}

// ─── Dataset Store ───────────────────────────────────────────

interface DatasetStore {
  examComponents: ExamComponent[];
  rubrics: Rubric[];
  gradingLogic: GradingLogic[];
  scenarios: Scenario[];
  questionBank: Question[];
  commonErrors: CommonError[];
  feedbackTemplates: FeedbackTemplate[];
  answerGuides: AnswerGuide[];
  citations: Citation[];
  knowledgeBase: KnowledgeEntry[];
}

let _store: DatasetStore | null = null;

function loadJsonl<T>(filename: string): T[] {
  const seedDir = join(process.cwd(), "data", "sle", "seed");
  const filepath = join(seedDir, filename);

  if (!existsSync(filepath)) {
    console.warn(`[SLE Dataset] File not found: ${filepath}`);
    return [];
  }

  const content = readFileSync(filepath, "utf-8");
  const lines = content.trim().split("\n").filter(Boolean);
  return lines.map((line) => JSON.parse(line) as T);
}

function loadDataset(): DatasetStore {
  if (_store) return _store;

  console.log("[SLE Dataset] Loading seed data...");
  const start = Date.now();

  _store = {
    examComponents: loadJsonl<ExamComponent>("exam_components.jsonl"),
    rubrics: loadJsonl<Rubric>("rubrics.jsonl"),
    gradingLogic: loadJsonl<GradingLogic>("grading_logic.jsonl"),
    scenarios: loadJsonl<Scenario>("scenarios.jsonl"),
    questionBank: loadJsonl<Question>("question_bank.jsonl"),
    commonErrors: loadJsonl<CommonError>("common_errors.jsonl"),
    feedbackTemplates: loadJsonl<FeedbackTemplate>("feedback_templates.jsonl"),
    answerGuides: loadJsonl<AnswerGuide>("answer_guides.jsonl"),
    citations: loadJsonl<Citation>("citations.jsonl"),
    knowledgeBase: loadJsonl<KnowledgeEntry>("knowledge_base.jsonl"),
  };

  const total = Object.values(_store).reduce((sum, arr) => sum + arr.length, 0);
  console.log(`[SLE Dataset] Loaded ${total} records (incl. ${_store.knowledgeBase.length} KB entries) in ${Date.now() - start}ms`);

  return _store;
}

// ─── Public API ──────────────────────────────────────────────

export function getDataset(): DatasetStore {
  return loadDataset();
}

/**
 * Select a random scenario for the given language and exam phase.
 * Optionally exclude previously used scenario IDs.
 */
export function selectScenario(
  language: "FR" | "EN",
  phase: ExamPhase,
  excludeIds: string[] = []
): Scenario | null {
  const ds = loadDataset();
  const candidates = ds.scenarios.filter(
    (s) =>
      s.language === language &&
      s.phase === phase &&
      !excludeIds.includes(s.id)
  );
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/**
 * Select random questions for the given language and exam phase.
 * Returns `count` questions, avoiding duplicates.
 */
export function selectQuestions(
  language: "FR" | "EN",
  phase: ExamPhase,
  count: number = 5,
  excludeIds: string[] = []
): Question[] {
  const ds = loadDataset();
  const candidates = ds.questionBank.filter(
    (q) =>
      q.language === language &&
      q.phase === phase &&
      !excludeIds.includes(q.id)
  );
  // Shuffle and take first `count`
  const shuffled = [...candidates].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Get the answer guide for a specific scenario.
 */
export function getAnswerGuide(scenarioId: string): AnswerGuide | null {
  const ds = loadDataset();
  return ds.answerGuides.find((ag) => ag.scenario_id === scenarioId) ?? null;
}

/**
 * Get rubrics for a specific language and level.
 */
export function getRubrics(
  language: "FR" | "EN",
  level: "A" | "B" | "C"
): Rubric[] {
  const ds = loadDataset();
  return ds.rubrics.filter(
    (r) => r.language === language && r.level === level
  );
}

/**
 * Get common errors matching the given criteria.
 */
export function getCommonErrors(
  language: "FR" | "EN",
  category?: string,
  levelImpact?: string
): CommonError[] {
  const ds = loadDataset();
  return ds.commonErrors.filter(
    (e) =>
      e.language === language &&
      (!category || e.category === category) &&
      (!levelImpact || e.level_impact === levelImpact)
  );
}

/**
 * Get feedback templates matching the given criteria.
 */
export function getFeedbackTemplates(
  language: "FR" | "EN",
  type?: string,
  criterion?: string
): FeedbackTemplate[] {
  const ds = loadDataset();
  return ds.feedbackTemplates.filter(
    (t) =>
      t.language === language &&
      (!type || t.type === type) &&
      (!criterion || t.criterion === criterion || t.criterion === "general")
  );
}

/**
 * Compute a composite score from individual criterion scores.
 */
export function computeCompositeScore(
  criterionScores: Record<string, number>
): { overallScore: number; level: string } {
  const ds = loadDataset();
  const logic = ds.gradingLogic[0];
  if (!logic) return { overallScore: 0, level: "X" };

  let weightedSum = 0;
  let totalWeight = 0;

  for (const [criterion, weight] of Object.entries(logic.criteria_weights)) {
    const score = criterionScores[criterion] ?? 0;
    weightedSum += score * weight;
    totalWeight += weight;
  }

  const overallScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

  let level = "X";
  for (const [lvl, thresholds] of Object.entries(logic.level_thresholds)) {
    if (overallScore >= thresholds.min_score && overallScore <= thresholds.max_score) {
      level = lvl;
      break;
    }
  }

  // If score exceeds C max, it's still C (or E for exemption)
  if (overallScore > (logic.level_thresholds["C"]?.max_score ?? 100)) {
    level = "C";
  }

  return { overallScore, level };
}

/**
 * Get exam component info for a specific phase and language.
 */
export function getExamComponent(
  language: "FR" | "EN",
  phase: ExamPhase
): ExamComponent | null {
  const ds = loadDataset();
  return ds.examComponents.find(
    (ec) => ec.language === language && ec.phase === phase
  ) ?? null;
}

/**
 * Get knowledge base entries matching the given criteria.
 * Supports filtering by language, category, level, and tags.
 */
export function getKnowledgeEntries(
  language: "FR" | "EN",
  opts?: {
    category?: string;
    level?: string;
    tags?: string[];
    limit?: number;
  }
): KnowledgeEntry[] {
  const ds = loadDataset();
  let entries = ds.knowledgeBase.filter(
    (kb) => kb.language === language || kb.language === "ALL"
  );

  if (opts?.category) {
    entries = entries.filter((kb) => kb.category === opts.category);
  }
  if (opts?.level) {
    entries = entries.filter(
      (kb) => kb.level === opts.level || kb.level === "ALL"
    );
  }
  if (opts?.tags && opts.tags.length > 0) {
    entries = entries.filter((kb) =>
      opts.tags!.some((tag) => kb.tags.includes(tag))
    );
  }
  if (opts?.limit) {
    entries = entries.slice(0, opts.limit);
  }
  return entries;
}

/**
 * Search knowledge base by keyword (simple text match in topic + content).
 */
export function searchKnowledge(
  query: string,
  language: "FR" | "EN",
  limit: number = 5
): KnowledgeEntry[] {
  const ds = loadDataset();
  const q = query.toLowerCase();
  const entries = ds.knowledgeBase.filter(
    (kb) =>
      (kb.language === language || kb.language === "ALL") &&
      (kb.topic.toLowerCase().includes(q) ||
        kb.content.toLowerCase().includes(q) ||
        kb.tags.some((t) => t.toLowerCase().includes(q)))
  );
  return entries.slice(0, limit);
}

/**
 * Build a context injection string for the AI coach system prompt.
 * This provides the AI with relevant rubrics, common errors, and exam structure
 * for the current session context.
 *
 * The SLE oral exam (2025-2026) is a single continuous progressive interview
 * with 3 phases: (1) Warm-up/Factual, (2) Narrative/Explanatory, (3) Opinion/Hypothetical.
 */
export function buildCoachContext(
  language: "FR" | "EN",
  targetLevel: "A" | "B" | "C",
  phase: ExamPhase
): string {
  const rubrics = getRubrics(language, targetLevel);
  const errors = getCommonErrors(language, undefined, targetLevel).slice(0, 10);
  const examComp = getExamComponent(language, phase);

  const sections: string[] = [];

  if (examComp) {
    sections.push(
      `## Current Interview Phase: ${examComp.name} (Phase ${phase})`,
      `Target Level: ${examComp.level_target}`,
      `Duration: ${examComp.duration_min}-${examComp.duration_max} minutes`,
      `Description: ${examComp.description}`,
      `Objectives: ${examComp.objectives.join("; ")}`,
      ""
    );
    if (examComp.key_structures) {
      sections.push(
        `Key Structures to Elicit: ${examComp.key_structures.join("; ")}`,
        ""
      );
    }
    if (examComp.format_note) {
      sections.push(`Note: ${examComp.format_note}`, "");
    }
  }

  if (rubrics.length > 0) {
    sections.push(`## Evaluation Rubrics for Level ${targetLevel}:`);
    for (const r of rubrics) {
      sections.push(
        `### ${r.criterion} (weight: ${r.weight})`,
        `${r.descriptor}`,
        `Indicators: ${r.indicators.join("; ")}`,
        ""
      );
    }
  }

  if (errors.length > 0) {
    sections.push(`## Common Errors to Watch For (Level ${targetLevel}):`);
    for (const e of errors) {
      sections.push(`- ${e.pattern} → ${e.correction} (${e.category})`);
    }
    sections.push("");
  }

  return sections.join("\n");
}

/**
 * Build a GENERALIST knowledge context for the AI coach.
 * This includes exam structure, methods (STAR/OPIC), strategies,
 * vocabulary, connectors, grammar tips, and model answers.
 * Used to make the coach a true expert who can answer ANY question
 * about second language learning and SLE preparation.
 *
 * Optimized for token budget: selects the most relevant entries
 * based on the current session context.
 */
export function buildGeneralistContext(
  language: "FR" | "EN",
  targetLevel: "A" | "B" | "C",
  maxChars: number = 3000
): string {
  const sections: string[] = [];
  let charCount = 0;

  // Priority 1: Exam structure (always include)
  const examEntries = getKnowledgeEntries(language, {
    category: "exam_structure",
    limit: 1,
  });
  for (const e of examEntries) {
    const line = `[${e.topic}] ${e.content}`;
    if (charCount + line.length > maxChars) break;
    sections.push(line);
    charCount += line.length;
  }

  // Priority 2: Evaluation criteria
  const criteriaEntries = getKnowledgeEntries(language, {
    category: "evaluation_criteria",
    limit: 1,
  });
  for (const e of criteriaEntries) {
    const line = `[${e.topic}] ${e.content}`;
    if (charCount + line.length > maxChars) break;
    sections.push(line);
    charCount += line.length;
  }

  // Priority 3: Level description for target level
  const levelEntries = getKnowledgeEntries(language, {
    category: "level_description",
    level: targetLevel,
    limit: 1,
  });
  for (const e of levelEntries) {
    const line = `[${e.topic}] ${e.content}`;
    if (charCount + line.length > maxChars) break;
    sections.push(line);
    charCount += line.length;
  }

  // Priority 4: Methodology (STAR for B, OPIC for C, both for general)
  const methodEntries = getKnowledgeEntries(language, {
    category: "methodology",
    limit: 2,
  });
  for (const e of methodEntries) {
    const line = `[${e.topic}] ${e.content}`;
    if (charCount + line.length > maxChars) break;
    sections.push(line);
    charCount += line.length;
  }

  // Priority 5: Strategies for the relevant level
  const strategyEntries = getKnowledgeEntries(language, {
    category: "strategy",
    level: targetLevel,
    limit: 2,
  });
  for (const e of strategyEntries) {
    const line = `[${e.topic}] ${e.content}`;
    if (charCount + line.length > maxChars) break;
    sections.push(line);
    charCount += line.length;
  }

  // Priority 6: Grammar tips relevant to level
  const grammarEntries = getKnowledgeEntries(language, {
    category: "grammar",
    level: targetLevel,
    limit: 2,
  });
  for (const e of grammarEntries) {
    const line = `[${e.topic}] ${e.content}`;
    if (charCount + line.length > maxChars) break;
    sections.push(line);
    charCount += line.length;
  }

  // Priority 7: Connectors
  const connectorEntries = getKnowledgeEntries(language, {
    tags: ["connectors"],
    limit: 1,
  });
  for (const e of connectorEntries) {
    const line = `[${e.topic}] ${e.content}`;
    if (charCount + line.length > maxChars) break;
    sections.push(line);
    charCount += line.length;
  }

  // Priority 8: Model phrases
  const phraseEntries = getKnowledgeEntries(language, {
    category: "model_phrases",
    limit: 1,
  });
  for (const e of phraseEntries) {
    const line = `[${e.topic}] ${e.content}`;
    if (charCount + line.length > maxChars) break;
    sections.push(line);
    charCount += line.length;
  }

  // Priority 9: Common errors (anglicisms etc.)
  const errorEntries = getKnowledgeEntries(language, {
    category: "common_errors",
    limit: 1,
  });
  for (const e of errorEntries) {
    const line = `[${e.topic}] ${e.content}`;
    if (charCount + line.length > maxChars) break;
    sections.push(line);
    charCount += line.length;
  }

  // Priority 10: Model answers
  const modelEntries = getKnowledgeEntries(language, {
    category: "model_answers",
    level: targetLevel,
    limit: 1,
  });
  for (const e of modelEntries) {
    const line = `[${e.topic}] ${e.content}`;
    if (charCount + line.length > maxChars) break;
    sections.push(line);
    charCount += line.length;
  }

  // Priority 11: Learning tips
  const tipEntries = getKnowledgeEntries(language, {
    category: "learning_tips",
    limit: 1,
  });
  for (const e of tipEntries) {
    const line = `[${e.topic}] ${e.content}`;
    if (charCount + line.length > maxChars) break;
    sections.push(line);
    charCount += line.length;
  }

  // Priority 12: Vocabulary
  const vocabEntries = getKnowledgeEntries(language, {
    category: "vocabulary",
    limit: 2,
  });
  for (const e of vocabEntries) {
    const line = `[${e.topic}] ${e.content}`;
    if (charCount + line.length > maxChars) break;
    sections.push(line);
    charCount += line.length;
  }

  // Priority 13: Confidence/motivation
  const confEntries = getKnowledgeEntries(language, {
    category: "motivation",
    limit: 1,
  });
  for (const e of confEntries) {
    const line = `[${e.topic}] ${e.content}`;
    if (charCount + line.length > maxChars) break;
    sections.push(line);
    charCount += line.length;
  }

  return sections.join("\n\n");
}
