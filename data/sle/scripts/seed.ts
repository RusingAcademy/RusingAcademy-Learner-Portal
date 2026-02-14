#!/usr/bin/env npx tsx
/**
 * SLE Dataset Seed Loader
 * Loads JSONL seed files into memory and exports them as typed collections.
 * Can be imported by the SLE AI Companion runtime.
 *
 * Usage:
 *   - As CLI: npx tsx data/sle/scripts/seed.ts (prints summary)
 *   - As module: import { loadDataset } from './data/sle/scripts/seed'
 */

import fs from "fs";
import path from "path";

const SEED_DIR = path.resolve(__dirname, "..", "seed");

function loadJsonl<T>(name: string): T[] {
  const filePath = path.join(SEED_DIR, `${name}.jsonl`);
  if (!fs.existsSync(filePath)) return [];
  return fs
    .readFileSync(filePath, "utf-8")
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line));
}

export interface SLEDataset {
  exam_components: any[];
  rubrics: any[];
  scenarios: any[];
  question_bank: any[];
  listening_assets: any[];
  answer_guides: any[];
  common_errors: any[];
  feedback_templates: any[];
  grading_logic: any[];
  citations: any[];
}

export function loadDataset(): SLEDataset {
  return {
    exam_components: loadJsonl("exam_components"),
    rubrics: loadJsonl("rubrics"),
    scenarios: loadJsonl("scenarios"),
    question_bank: loadJsonl("question_bank"),
    listening_assets: loadJsonl("listening_assets"),
    answer_guides: loadJsonl("answer_guides"),
    common_errors: loadJsonl("common_errors"),
    feedback_templates: loadJsonl("feedback_templates"),
    grading_logic: loadJsonl("grading_logic"),
    citations: loadJsonl("citations"),
  };
}

// CLI mode
if (require.main === module) {
  const dataset = loadDataset();
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║        SLE Dataset Seed Loader v1.0              ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  for (const [key, records] of Object.entries(dataset)) {
    console.log(`  ${key}: ${records.length} records`);
  }

  const total = Object.values(dataset).reduce((sum, arr) => sum + arr.length, 0);
  console.log(`\n  Total: ${total} records loaded`);
}
