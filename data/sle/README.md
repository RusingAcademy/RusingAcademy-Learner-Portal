# SLE Training Dataset

This directory contains the training and configuration data for the SLE AI Companion.

## Directory Structure

- `schema/`: JSON Schema definitions for each data collection. These schemas enforce the structure and types of the data.
- `seed/`: The raw data files in JSONL (JSON Lines) format. Each file contains a collection of records.
- `scripts/`: Utility scripts for managing the dataset.
  - `validate.ts`: Validates all `.jsonl` files in `seed/` against their corresponding schemas in `schema/`.
  - `seed.ts`: A placeholder for a script to import the seed data into a production database (e.g., TiDB).

## Data Collections

The dataset is composed of 10 interconnected collections:

| Collection | Records | Description |
|---|---|---|
| `exam_components.jsonl` | 8 | Describes the 4 parts of the Oral Language Assessment (OLA) in FR/EN. |
| `rubrics.jsonl` | 30 | Defines the 5 evaluation criteria (fluency, comprehension, etc.) for levels A, B, C. |
| `grading_logic.jsonl` | 1 | Contains the composite scoring rules, level thresholds, and criteria weights. |
| `scenarios.jsonl` | 60 | Realistic practice scenarios for each of the 4 OLA parts (30 FR, 30 EN). |
| `question_bank.jsonl` | 240 | A bank of questions and follow-ups for each OLA part (120 FR, 120 EN). |
| `listening_assets.jsonl`| 20 | Transcripts for voicemails and conversations for Part II listening practice. |
| `answer_guides.jsonl` | 60 | Provides expected elements, recommended structures, and pitfalls for each scenario. |
| `common_errors.jsonl` | 200 | A database of common grammatical, lexical, and structural errors. |
| `feedback_templates.jsonl`| 80 | Templates for generating dynamic feedback (corrections, encouragement, reports). |
| `citations.jsonl` | 5 | The official sources used to build the pedagogical framework. |

## Runtime Services

Three services in `server/services/` consume this dataset:

1.  **`sleDatasetService.ts`**: A singleton that loads all JSONL files into memory on startup. It provides functions to query the dataset (e.g., `selectScenario`, `getRubrics`).

2.  **`sleScoringService.ts`**: Implements the grading logic. It uses the rubrics and rules from the dataset to compute composite scores, detect errors, and generate feedback.

3.  **`sleSessionOrchestrator.ts`**: Manages the state of a practice session. It uses the dataset service to select scenarios and questions, and the scoring service to evaluate the learner's performance.

## How to Use

### Validation

To validate that all seed data conforms to the schemas, run:

```bash
pnpm sle:data:validate
```

This command uses `ajv` to check every record in every `.jsonl` file.

### Seeding a Database

The `sle:data:seed` script is a placeholder. To implement it, you would typically:
1.  Connect to your database (e.g., using Drizzle ORM).
2.  Read each `.jsonl` file using the `loadJsonl` function.
3.  Iterate through the records and insert them into the corresponding database tables.

Example for `scenarios`:

```typescript
// in scripts/seed.ts
import { db } from "../../server/db";
import { scenariosTable } from "../../server/db/schema";
import { loadJsonl } from "../services/sleDatasetService"; // Adjust path

const scenarios = loadJsonl("scenarios.jsonl");
await db.insert(scenariosTable).values(scenarios);
```

### Extending the Dataset

1.  **Add Data**: Add new records to the appropriate `.jsonl` file in `seed/`, ensuring the `id` is unique.
2.  **Validate**: Run `pnpm sle:data:validate` to check your new data against the schema.
3.  **Re-seed**: Run your database seeding script to import the new data.

The `sleDatasetService` will automatically pick up the new data on the next server restart.
