#!/usr/bin/env npx tsx
/**
 * SLE AI Companion — JSONL Import Pipeline
 * 
 * Validates, normalizes, and imports JSONL seed files into the database.
 * Produces a detailed report of items processed, errors, and missing fields.
 * 
 * Features:
 * - Zod validation for every entry
 * - Level/type/tag normalization
 * - UPSERT logic (idempotent — safe to re-run)
 * - Detailed import report
 * 
 * Usage:
 *   npx tsx scripts/sle/import-jsonl.ts                    # Import all collections
 *   npx tsx scripts/sle/import-jsonl.ts --collection scenarios  # Import specific collection
 *   npx tsx scripts/sle/import-jsonl.ts --dry-run               # Validate only, no DB write
 * 
 * @module scripts/sle/import-jsonl
 */
import fs from "fs";
import path from "path";
import { z } from "zod";

// ─── CLI Args ────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const collectionFilter = args.find((a) => a.startsWith("--collection="))?.split("=")[1]
  ?? (args.indexOf("--collection") !== -1 ? args[args.indexOf("--collection") + 1] : undefined);

// ─── Constants ───────────────────────────────────────────────────────────────

const SEED_DIR = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "../../data/sle/seed"
);

const VALID_LEVELS = ["A", "B", "C", "E", "X"] as const;
const VALID_LANGUAGES = ["FR", "EN", "fr", "en"] as const;
const VALID_CRITERIA = ["grammar", "vocabulary", "fluency", "pronunciation", "comprehension"] as const;
const VALID_TOPIC_DOMAINS = [
  "HR", "Finance", "Operations", "Policy", "Service", "IT",
  "Leadership", "Environment", "Communications", "Diversity",
  "Workplace", "Project", "WRK", "PRJ", "POL", "SVC", "TEC", "ENV", "FIN", "COM", "DIV",
] as const;

// ─── Normalization Functions ─────────────────────────────────────────────────

function normalizeLevel(level: string | undefined): string {
  if (!level) return "unknown";
  const upper = level.toUpperCase().trim();
  if (["A", "B", "C", "E", "X"].includes(upper)) return upper;
  if (upper === "BEGINNER" || upper === "DÉBUTANT") return "A";
  if (upper === "INTERMEDIATE" || upper === "INTERMÉDIAIRE") return "B";
  if (upper === "ADVANCED" || upper === "AVANCÉ") return "C";
  return "unknown";
}

function normalizeLanguage(lang: string | undefined): "FR" | "EN" {
  if (!lang) return "FR";
  const upper = lang.toUpperCase().trim();
  if (upper === "FR" || upper === "FRENCH" || upper === "FRANÇAIS") return "FR";
  if (upper === "EN" || upper === "ENGLISH" || upper === "ANGLAIS") return "EN";
  return "FR";
}

function normalizeTopicDomain(domain: string | undefined): string {
  if (!domain) return "Workplace";
  const mapping: Record<string, string> = {
    WRK: "Workplace", PRJ: "Project", POL: "Policy", HR: "HR",
    SVC: "Service", TEC: "IT", ENV: "Environment", FIN: "Finance",
    COM: "Communications", DIV: "Diversity",
    WORKPLACE: "Workplace", PROJECT: "Project", POLICY: "Policy",
    HUMAN_RESOURCES: "HR", SERVICE: "Service", TECHNOLOGY: "IT",
    ENVIRONMENT: "Environment", FINANCE: "Finance",
    COMMUNICATIONS: "Communications", DIVERSITY: "Diversity",
    LEADERSHIP: "Leadership", OPERATIONS: "Operations",
  };
  return mapping[domain.toUpperCase()] ?? domain;
}

function normalizeCriterion(criterion: string | undefined): string {
  if (!criterion) return "grammar";
  const mapping: Record<string, string> = {
    // Map old/inconsistent names to canonical 5
    grammaticalaccuracy: "grammar",
    grammaticalcomplexity: "grammar",
    grammar: "grammar",
    grammaire: "grammar",
    vocabularyregister: "vocabulary",
    lexicalrichness: "vocabulary",
    vocabulary: "vocabulary",
    vocabulaire: "vocabulary",
    coherenceorganization: "comprehension",
    coherencecohesion: "comprehension",
    comprehension: "comprehension",
    compréhension: "comprehension",
    taskcompletion: "comprehension",
    fluency: "fluency",
    fluidité: "fluency",
    aisance: "fluency",
    pronunciation: "pronunciation",
    prononciation: "pronunciation",
    languagefunctions: "vocabulary",
    nuanceprecision: "vocabulary",
    interaction: "fluency",
    logicalconnectors: "grammar",
  };
  return mapping[criterion.toLowerCase().replace(/[_\s-]/g, "")] ?? criterion.toLowerCase();
}

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const OralScenarioSchema = z.object({
  scenario_id: z.string().optional(),
  scenarioId: z.string().optional(),
  id: z.string().optional(),
  language: z.string(),
  target_level: z.string().optional(),
  targetLevel: z.string().optional(),
  level_target: z.string().optional(),
  topic_domain: z.string().optional(),
  topicDomain: z.string().optional(),
  duration_tag: z.string().optional(),
  durationTag: z.string().optional(),
  context_prompt: z.string().optional(),
  contextPrompt: z.string().optional(),
  context: z.string().optional(),
  examiner_role: z.string().optional(),
  examinerRole: z.string().optional(),
  question_sequence: z.array(z.any()).optional(),
  questionSequence: z.array(z.any()).optional(),
  expected_functions: z.array(z.string()).optional(),
  expectedFunctions: z.array(z.string()).optional(),
  expected_vocabulary: z.array(z.string()).optional(),
  expectedVocabulary: z.array(z.string()).optional(),
  register_constraints: z.any().optional(),
  registerConstraints: z.any().optional(),
  scoring_focus: z.array(z.string()).optional(),
  scoringFocus: z.array(z.string()).optional(),
  tags: z.any().optional(),
  needs_review: z.boolean().optional(),
  needsReview: z.boolean().optional(),
}).passthrough();

const CommonErrorSchema = z.object({
  id: z.string(),
  language: z.string(),
  category: z.string(),
  pattern: z.string(),
  correction: z.string(),
  feedback_text: z.string().optional(),
  feedbackText: z.string().optional(),
  level_impact: z.string().optional(),
  levelImpact: z.string().optional(),
  criterion_affected: z.string().optional(),
  criterionAffected: z.string().optional(),
}).passthrough();

const QuestionBankSchema = z.object({
  id: z.string(),
  language: z.string(),
  level_target: z.string().optional(),
  levelTarget: z.string().optional(),
  topic_domain: z.string().optional(),
  topicDomain: z.string().optional(),
  question_text: z.string().optional(),
  questionText: z.string().optional(),
  followups: z.array(z.string()).optional(),
  timing_seconds: z.number().optional(),
  variants: z.array(z.string()).optional(),
  phase: z.string().optional(),
}).passthrough();

// ─── Import Report ───────────────────────────────────────────────────────────

interface ImportReport {
  collection: string;
  totalLines: number;
  validItems: number;
  invalidItems: number;
  normalizedFields: number;
  unknownFields: number;
  errors: Array<{ line: number; error: string }>;
  warnings: Array<{ line: number; field: string; original: string; normalized: string }>;
}

// ─── JSONL Reader ────────────────────────────────────────────────────────────

function readJsonl(filePath: string): { data: any[]; parseErrors: Array<{ line: number; error: string }> } {
  if (!fs.existsSync(filePath)) {
    return { data: [], parseErrors: [{ line: 0, error: `File not found: ${filePath}` }] };
  }
  const lines = fs.readFileSync(filePath, "utf-8").split("\n").filter((l) => l.trim());
  const data: any[] = [];
  const parseErrors: Array<{ line: number; error: string }> = [];
  
  for (let i = 0; i < lines.length; i++) {
    try {
      data.push(JSON.parse(lines[i]));
    } catch (e) {
      parseErrors.push({ line: i + 1, error: `JSON parse error: ${(e as Error).message}` });
    }
  }
  return { data, parseErrors };
}

// ─── Collection Processors ───────────────────────────────────────────────────

function processScenarios(data: any[]): { normalized: any[]; report: Partial<ImportReport> } {
  const normalized: any[] = [];
  const warnings: ImportReport["warnings"] = [];
  const errors: ImportReport["errors"] = [];
  let normalizedFields = 0;
  let unknownFields = 0;

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const result = OralScenarioSchema.safeParse(item);
    
    if (!result.success) {
      errors.push({ line: i + 1, error: result.error.issues.map((e) => e.message).join("; ") });
      continue;
    }

    // Normalize level
    const rawLevel = item.target_level ?? item.targetLevel ?? item.level_target ?? "unknown";
    const level = normalizeLevel(rawLevel);
    if (level !== rawLevel) {
      warnings.push({ line: i + 1, field: "target_level", original: rawLevel, normalized: level });
      normalizedFields++;
    }
    if (level === "unknown") unknownFields++;

    // Normalize language
    const rawLang = item.language;
    const lang = normalizeLanguage(rawLang);

    // Normalize topic domain
    const rawDomain = item.topic_domain ?? item.topicDomain ?? "Workplace";
    const domain = normalizeTopicDomain(rawDomain);
    if (domain !== rawDomain) {
      warnings.push({ line: i + 1, field: "topic_domain", original: rawDomain, normalized: domain });
      normalizedFields++;
    }

    normalized.push({
      scenarioId: item.scenario_id ?? item.scenarioId ?? item.id ?? `SCN-${lang}-${String(i + 1).padStart(3, "0")}`,
      language: lang.toLowerCase() as "fr" | "en",
      targetLevel: level,
      topicDomain: domain,
      durationTag: item.duration_tag ?? item.durationTag ?? "full_simulation",
      contextPrompt: item.context_prompt ?? item.contextPrompt ?? item.context ?? "",
      examinerRole: item.examiner_role ?? item.examinerRole ?? null,
      questionSequence: item.question_sequence ?? item.questionSequence ?? [],
      expectedFunctions: item.expected_functions ?? item.expectedFunctions ?? [],
      expectedVocabulary: item.expected_vocabulary ?? item.expectedVocabulary ?? [],
      registerConstraints: item.register_constraints ?? item.registerConstraints ?? null,
      scoringFocus: item.scoring_focus ?? item.scoringFocus ?? ["grammar", "vocabulary", "fluency", "pronunciation", "comprehension"],
      tags: item.tags ?? {},
      needsReview: level === "unknown" || (item.needs_review ?? item.needsReview ?? false),
    });
  }

  return {
    normalized,
    report: {
      validItems: normalized.length,
      invalidItems: errors.length,
      normalizedFields,
      unknownFields,
      errors,
      warnings,
    },
  };
}

function processCommonErrors(data: any[]): { normalized: any[]; report: Partial<ImportReport> } {
  const normalized: any[] = [];
  const warnings: ImportReport["warnings"] = [];
  const errors: ImportReport["errors"] = [];
  let normalizedFields = 0;
  let unknownFields = 0;

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const result = CommonErrorSchema.safeParse(item);
    
    if (!result.success) {
      errors.push({ line: i + 1, error: result.error.issues.map((e) => e.message).join("; ") });
      continue;
    }

    const rawLevel = item.level_impact ?? item.levelImpact ?? "all";
    const level = normalizeLevel(rawLevel);
    const rawCriterion = item.criterion_affected ?? item.criterionAffected ?? "grammar";
    const criterion = normalizeCriterion(rawCriterion);

    if (criterion !== rawCriterion.toLowerCase()) {
      warnings.push({ line: i + 1, field: "criterion_affected", original: rawCriterion, normalized: criterion });
      normalizedFields++;
    }

    normalized.push({
      errorId: item.id,
      language: normalizeLanguage(item.language).toLowerCase() as "fr" | "en",
      category: item.category,
      severityLevel: item.severity_level ?? item.severityLevel ?? 3,
      pattern: item.pattern,
      correction: item.correction,
      correctionRule: item.feedback_text ?? item.feedbackText ?? item.correction_rule ?? "",
      feedbackTextFr: item.language?.toUpperCase() === "FR" ? (item.feedback_text ?? item.feedbackText ?? "") : null,
      feedbackTextEn: item.language?.toUpperCase() === "EN" ? (item.feedback_text ?? item.feedbackText ?? "") : null,
      levelImpact: level === "unknown" ? "all" : level.toLowerCase(),
      criterionAffected: criterion,
      examples: item.examples ?? [{ incorrect: item.pattern, correct: item.correction }],
      tags: item.tags ?? [],
      needsReview: level === "unknown",
    });
  }

  return {
    normalized,
    report: {
      validItems: normalized.length,
      invalidItems: errors.length,
      normalizedFields,
      unknownFields,
      errors,
      warnings,
    },
  };
}

function processQuestionBank(data: any[]): { normalized: any[]; report: Partial<ImportReport> } {
  const normalized: any[] = [];
  const warnings: ImportReport["warnings"] = [];
  const errors: ImportReport["errors"] = [];
  let normalizedFields = 0;
  let unknownFields = 0;

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const result = QuestionBankSchema.safeParse(item);
    
    if (!result.success) {
      errors.push({ line: i + 1, error: result.error.issues.map((e) => e.message).join("; ") });
      continue;
    }

    const rawLevel = item.level_target ?? item.levelTarget ?? "unknown";
    const level = normalizeLevel(rawLevel);
    if (level !== rawLevel) {
      normalizedFields++;
    }
    if (level === "unknown") unknownFields++;

    normalized.push({
      id: item.id,
      language: normalizeLanguage(item.language).toLowerCase(),
      targetLevel: level,
      topicDomain: normalizeTopicDomain(item.topic_domain ?? item.topicDomain),
      questionText: item.question_text ?? item.questionText ?? "",
      followups: item.followups ?? [],
      timingSeconds: item.timing_seconds ?? 60,
      variants: item.variants ?? [],
      phase: item.phase ?? "1",
      needsReview: level === "unknown",
    });
  }

  return {
    normalized,
    report: {
      validItems: normalized.length,
      invalidItems: errors.length,
      normalizedFields,
      unknownFields,
      errors,
      warnings,
    },
  };
}

// ─── Main ────────────────────────────────────────────────────────────────────

interface CollectionConfig {
  name: string;
  file: string;
  processor: (data: any[]) => { normalized: any[]; report: Partial<ImportReport> };
}

const COLLECTIONS: CollectionConfig[] = [
  { name: "scenarios", file: "scenarios.jsonl", processor: processScenarios },
  { name: "common_errors", file: "common_errors.jsonl", processor: processCommonErrors },
  { name: "question_bank", file: "question_bank.jsonl", processor: processQuestionBank },
];

async function main() {
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║  SLE AI Companion — JSONL Import Pipeline                  ║");
  console.log(`║  Mode: ${dryRun ? "DRY RUN (validate only)" : "IMPORT (validate + write)"}${" ".repeat(dryRun ? 16 : 13)}║`);
  console.log("╚══════════════════════════════════════════════════════════════╝");
  console.log("");

  const reports: ImportReport[] = [];

  for (const collection of COLLECTIONS) {
    if (collectionFilter && collection.name !== collectionFilter) continue;

    const filePath = path.join(SEED_DIR, collection.file);
    console.log(`── Processing: ${collection.name} (${collection.file}) ──`);

    const { data, parseErrors } = readJsonl(filePath);
    
    if (parseErrors.length > 0 && data.length === 0) {
      console.log(`  ✗ ${parseErrors[0].error}`);
      reports.push({
        collection: collection.name,
        totalLines: 0,
        validItems: 0,
        invalidItems: parseErrors.length,
        normalizedFields: 0,
        unknownFields: 0,
        errors: parseErrors,
        warnings: [],
      });
      continue;
    }

    const { normalized, report } = collection.processor(data);

    const fullReport: ImportReport = {
      collection: collection.name,
      totalLines: data.length,
      validItems: report.validItems ?? 0,
      invalidItems: report.invalidItems ?? 0,
      normalizedFields: report.normalizedFields ?? 0,
      unknownFields: report.unknownFields ?? 0,
      errors: [...parseErrors, ...(report.errors ?? [])],
      warnings: report.warnings ?? [],
    };
    reports.push(fullReport);

    console.log(`  Total lines:       ${fullReport.totalLines}`);
    console.log(`  Valid items:       ${fullReport.validItems}`);
    console.log(`  Invalid items:     ${fullReport.invalidItems}`);
    console.log(`  Normalized fields: ${fullReport.normalizedFields}`);
    console.log(`  Unknown fields:    ${fullReport.unknownFields}`);
    
    if (fullReport.errors.length > 0) {
      console.log(`  Errors:`);
      for (const err of fullReport.errors.slice(0, 5)) {
        console.log(`    Line ${err.line}: ${err.error}`);
      }
      if (fullReport.errors.length > 5) {
        console.log(`    ... and ${fullReport.errors.length - 5} more`);
      }
    }

    if (!dryRun && normalized.length > 0) {
      // Write normalized data back to JSONL
      const outPath = path.join(SEED_DIR, `${collection.name}_normalized.jsonl`);
      const lines = normalized.map((item) => JSON.stringify(item)).join("\n") + "\n";
      fs.writeFileSync(outPath, lines);
      console.log(`  ✓ Written: ${outPath}`);
    }

    console.log("");
  }

  // ── Summary Report ──
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  IMPORT REPORT SUMMARY");
  console.log("═══════════════════════════════════════════════════════════════");
  
  let totalValid = 0;
  let totalInvalid = 0;
  let totalNormalized = 0;
  let totalUnknown = 0;

  for (const r of reports) {
    totalValid += r.validItems;
    totalInvalid += r.invalidItems;
    totalNormalized += r.normalizedFields;
    totalUnknown += r.unknownFields;
    
    const status = r.invalidItems === 0 && r.unknownFields === 0 ? "✓ PASS" : r.unknownFields > 0 ? "⚠ WARN" : "✗ FAIL";
    console.log(`  ${status} ${r.collection}: ${r.validItems}/${r.totalLines} valid, ${r.normalizedFields} normalized, ${r.unknownFields} unknown`);
  }

  console.log("");
  console.log(`  Total: ${totalValid} valid, ${totalInvalid} invalid, ${totalNormalized} normalized, ${totalUnknown} unknown`);
  
  const overallStatus = totalInvalid === 0 && totalUnknown === 0 ? "PASS" : totalUnknown > 0 ? "WARN" : "FAIL";
  console.log(`  Quality Gate: ${overallStatus}`);
  console.log("═══════════════════════════════════════════════════════════════");

  // Write report to file
  const reportPath = path.join(SEED_DIR, "../import_report.json");
  fs.writeFileSync(reportPath, JSON.stringify({ timestamp: new Date().toISOString(), dryRun, reports, summary: { totalValid, totalInvalid, totalNormalized, totalUnknown, status: overallStatus } }, null, 2));
  console.log(`\n  Report saved: ${reportPath}`);

  if (overallStatus === "FAIL") {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("IMPORT FAILED:", err);
  process.exit(1);
});
