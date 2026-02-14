#!/usr/bin/env npx tsx
/**
 * SLE Dataset Validator
 * Validates all JSONL seed files against their JSON schemas.
 * Also checks referential integrity (no orphan IDs, no missing references).
 *
 * Usage: npx tsx data/sle/scripts/validate.ts
 */

import fs from "fs";
import path from "path";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ROOT = path.resolve(__dirname, "..");
const SCHEMA_DIR = path.join(ROOT, "schema");
const SEED_DIR = path.join(ROOT, "seed");

// ─── Helpers ────────────────────────────────────────────────────
function loadSchema(name: string): object {
  const filePath = path.join(SCHEMA_DIR, `${name}.schema.json`);
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function loadJsonl(name: string): any[] {
  const filePath = path.join(SEED_DIR, `${name}.jsonl`);
  if (!fs.existsSync(filePath)) return [];
  return fs
    .readFileSync(filePath, "utf-8")
    .split("\n")
    .filter((line) => line.trim())
    .map((line, idx) => {
      try {
        return JSON.parse(line);
      } catch (e) {
        throw new Error(`Invalid JSON on line ${idx + 1} of ${name}.jsonl: ${(e as Error).message}`);
      }
    });
}

// ─── Collections ────────────────────────────────────────────────
const COLLECTIONS = [
  "exam_components",
  "rubrics",
  "scenarios",
  "question_bank",
  "listening_assets",
  "answer_guides",
  "common_errors",
  "feedback_templates",
  "grading_logic",
  "citations",
] as const;

// ─── Main ───────────────────────────────────────────────────────
async function main() {
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);

  let totalErrors = 0;
  let totalRecords = 0;
  const allIds: Record<string, Set<string>> = {};

  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║        SLE Dataset Validator v1.0                ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  // Phase 1: Schema validation
  console.log("── Phase 1: Schema Validation ──\n");
  for (const collection of COLLECTIONS) {
    const schema = loadSchema(collection);
    const validate = ajv.compile(schema);
    const records = loadJsonl(collection);
    allIds[collection] = new Set();

    let errors = 0;
    for (const [idx, record] of records.entries()) {
      if (record.id) allIds[collection].add(record.id);
      if (!validate(record)) {
        errors++;
        console.error(`  ✗ ${collection}.jsonl line ${idx + 1} (${record.id || "no id"}):`);
        for (const err of validate.errors || []) {
          console.error(`    → ${err.instancePath || "root"}: ${err.message}`);
        }
      }
    }

    totalRecords += records.length;
    totalErrors += errors;
    const status = errors === 0 ? "✓" : "✗";
    console.log(`  ${status} ${collection}: ${records.length} records, ${errors} errors`);
  }

  // Phase 2: Volume checks
  console.log("\n── Phase 2: Volume Checks ──\n");
  const volumeReqs: Record<string, { min: number; label: string }> = {
    scenarios: { min: 60, label: "Scenarios (30 FR + 30 EN)" },
    question_bank: { min: 240, label: "Questions (120 FR + 120 EN)" },
    common_errors: { min: 200, label: "Common Errors (100 FR + 100 EN)" },
    feedback_templates: { min: 80, label: "Feedback Templates (40 FR + 40 EN)" },
    listening_assets: { min: 20, label: "Listening Assets (10 FR + 10 EN)" },
    rubrics: { min: 30, label: "Rubrics (5 criteria × 3 levels × 2 langs)" },
    exam_components: { min: 8, label: "Exam Components (4 parts × 2 langs)" },
  };

  for (const [col, req] of Object.entries(volumeReqs)) {
    const count = allIds[col]?.size || 0;
    const status = count >= req.min ? "✓" : "✗";
    if (count < req.min) totalErrors++;
    console.log(`  ${status} ${req.label}: ${count}/${req.min}`);
  }

  // Phase 3: Language balance
  console.log("\n── Phase 3: Language Balance ──\n");
  for (const col of ["scenarios", "question_bank", "common_errors", "feedback_templates"] as const) {
    const records = loadJsonl(col);
    const fr = records.filter((r) => r.language === "FR").length;
    const en = records.filter((r) => r.language === "EN").length;
    const balanced = Math.abs(fr - en) <= Math.ceil(records.length * 0.1);
    const status = balanced ? "✓" : "⚠";
    console.log(`  ${status} ${col}: FR=${fr}, EN=${en}`);
  }

  // Phase 4: Referential integrity
  console.log("\n── Phase 4: Referential Integrity ──\n");
  const scenarios = loadJsonl("scenarios");
  let refErrors = 0;

  for (const scn of scenarios) {
    // Check rubric_ids reference valid rubrics
    for (const rid of scn.rubric_ids || []) {
      if (!allIds.rubrics.has(rid)) {
        console.error(`  ✗ Scenario ${scn.id}: rubric_id "${rid}" not found`);
        refErrors++;
      }
    }
    // Check common_error_ids
    for (const eid of scn.common_error_ids || []) {
      if (!allIds.common_errors.has(eid)) {
        console.error(`  ✗ Scenario ${scn.id}: common_error_id "${eid}" not found`);
        refErrors++;
      }
    }
    // Check feedback_template_ids
    for (const fid of scn.feedback_template_ids || []) {
      if (!allIds.feedback_templates.has(fid)) {
        console.error(`  ✗ Scenario ${scn.id}: feedback_template_id "${fid}" not found`);
        refErrors++;
      }
    }
    // Check answer_guide_id
    if (scn.answer_guide_id && !allIds.answer_guides.has(scn.answer_guide_id)) {
      console.error(`  ✗ Scenario ${scn.id}: answer_guide_id "${scn.answer_guide_id}" not found`);
      refErrors++;
    }
  }

  // Check answer_guides reference valid scenarios
  const answerGuides = loadJsonl("answer_guides");
  for (const ag of answerGuides) {
    if (!allIds.scenarios.has(ag.scenario_id)) {
      console.error(`  ✗ AnswerGuide ${ag.id}: scenario_id "${ag.scenario_id}" not found`);
      refErrors++;
    }
  }

  totalErrors += refErrors;
  console.log(`  ${refErrors === 0 ? "✓" : "✗"} Referential integrity: ${refErrors} broken references`);

  // Phase 5: Duplicate ID check
  console.log("\n── Phase 5: Duplicate ID Check ──\n");
  let dupErrors = 0;
  for (const collection of COLLECTIONS) {
    const records = loadJsonl(collection);
    const ids = records.map((r) => r.id).filter(Boolean);
    const dupes = ids.filter((id, idx) => ids.indexOf(id) !== idx);
    if (dupes.length > 0) {
      console.error(`  ✗ ${collection}: duplicate IDs: ${[...new Set(dupes)].join(", ")}`);
      dupErrors += dupes.length;
    }
  }
  totalErrors += dupErrors;
  console.log(`  ${dupErrors === 0 ? "✓" : "✗"} Duplicate check: ${dupErrors} duplicates found`);

  // Summary
  console.log("\n══════════════════════════════════════════════════");
  console.log(`Total records: ${totalRecords}`);
  console.log(`Total errors:  ${totalErrors}`);
  console.log(`Status:        ${totalErrors === 0 ? "✅ PASS" : "❌ FAIL"}`);
  console.log("══════════════════════════════════════════════════\n");

  process.exit(totalErrors === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
