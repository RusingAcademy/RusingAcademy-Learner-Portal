#!/usr/bin/env python3
"""
SLE AI Companion — Dataset Generator (GPT-5)

Generates pedagogical dataset items via OpenAI API:
- Oral scenarios (FR + EN, levels A/B/C)
- Error taxonomy items (faux-amis, grammar, register, pronunciation)
- Model answers (B/C, FR/EN)

Usage:
  python3 scripts/sle/generate-dataset.py --type scenarios --lang FR --level B --count 20
  python3 scripts/sle/generate-dataset.py --type errors --count 50
  python3 scripts/sle/generate-dataset.py --type model_answers --lang FR --level C --count 30
"""
import json
import os
import sys
import uuid
import argparse
import time
from pathlib import Path
from openai import OpenAI

client = OpenAI()
MODEL = "gpt-5"

SEED_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "sle" / "seed"

TOPIC_DOMAINS = ["HR", "Finance", "Operations", "Policy", "Service", "IT", "Leadership", "Environment", "Communications", "Diversity"]

SCENARIO_SYSTEM_PROMPT = """You are an expert in Canadian federal public service Second Language Evaluation (SLE) oral exam preparation. You create realistic, pedagogically sound oral practice scenarios.

RULES:
1. Each scenario must be a valid JSON object matching the exact schema below.
2. target_level determines complexity:
   - A: Concrete, routine. Simple SVO syntax. Present tense. Basic workplace topics.
   - B: Narration, facts. Passé composé vs imparfait. Relative clauses. Conditional simple. Concrete non-routine.
   - C: Abstraction, nuance. Subjonctif, conditionnel passé. Diplomatic register. Friction (disagreements, ambiguity). Leadership competencies.
3. B→C transition zone (~40% of B/C items): scenarios that push B-level candidates toward C-level demands.
4. question_sequence must have 3-5 questions with probing follow-ups.
5. expected_functions must use SLE-aligned functions: describe, narrate, explain, justify, hypothesize, negotiate, reframe, persuade, concede, compare.
6. scoring_focus uses exactly these 5 criteria: grammar, vocabulary, fluency, pronunciation, comprehension.
7. register_constraints for C-level MUST include {"pronoun": "vous", "tone": "diplomatic"}.
8. Language must match the requested language (FR or EN).
9. All content must be relevant to Canadian federal public service context.
10. NO field should be empty or "unknown". If uncertain, provide best candidate and set needs_review: true.

OUTPUT: Return a JSON array of scenario objects. Each object:
{
  "scenario_id": "SCN-{LANG}-{NNN}",
  "language": "fr" or "en",
  "target_level": "A", "B", or "C",
  "topic_domain": one of [HR, Finance, Operations, Policy, Service, IT, Leadership, Environment, Communications, Diversity],
  "duration_tag": "quick_drill" or "full_simulation",
  "context_prompt": "Detailed context setting the scene...",
  "examiner_role": "Role description for the AI examiner...",
  "question_sequence": [
    {"q": "Main question", "probing": ["Follow-up 1", "Follow-up 2"], "conditions": {"if_hesitant": "Simplified version"}}
  ],
  "expected_functions": ["narrate", "justify", ...],
  "expected_vocabulary": ["term1", "term2", ...],
  "register_constraints": {"pronoun": "vous/tu", "tone": "formal/semi-formal/diplomatic"},
  "scoring_focus": ["grammar", "vocabulary", "fluency", "pronunciation", "comprehension"],
  "tags": {"grammatical": ["conditionnel", ...], "functional": ["gestion_du_changement", ...]},
  "needs_review": false
}"""

ERROR_SYSTEM_PROMPT = """You are an expert linguist specializing in common errors made by English-speaking Canadian public servants learning French (and vice versa for EN errors). You create detailed error taxonomy entries for an AI coaching system.

RULES:
1. Each error must be a valid JSON object.
2. Categories: anglicism, syntax, conjugation, register, pronunciation, false_friend, agreement, preposition, article, vocabulary
3. severity_level: 1 (minor) to 5 (critical communication breakdown)
4. Include realistic examples from federal workplace context.
5. correction_rule must be actionable and clear.
6. criterion_affected uses exactly: grammar, vocabulary, fluency, pronunciation, comprehension.
7. Level A errors: basic conjugation, gender agreement, basic false friends.
8. Level B errors: passé composé/imparfait confusion, relative pronouns, conditional.
9. Level C errors: subjunctive triggers, register violations, nuance/concession errors.

OUTPUT: Return a JSON array of error objects:
{
  "id": "ERR-{LANG}-{NNN}",
  "language": "fr" or "en",
  "category": "anglicism|syntax|conjugation|register|pronunciation|false_friend|agreement|preposition|article|vocabulary",
  "severity_level": 1-5,
  "pattern": "The incorrect pattern (e.g., 'Je suis excité')",
  "correction": "The correct form (e.g., 'Je suis enthousiaste')",
  "correction_rule": "Explanation of why and how to correct...",
  "feedback_text": "Coaching feedback in target language...",
  "level_impact": "A", "B", or "C",
  "criterion_affected": "grammar|vocabulary|fluency|pronunciation|comprehension",
  "examples": [{"incorrect": "...", "correct": "...", "context": "..."}],
  "tags": ["false_friend", "workplace", ...],
  "needs_review": false
}"""

MODEL_ANSWER_SYSTEM_PROMPT = """You are an expert SLE oral exam coach. You create model answers that demonstrate the expected quality for each proficiency level. These serve as reference answers for the AI scoring system.

RULES:
1. Model answers must demonstrate the TARGET LEVEL's expected competencies.
2. Level B answers: clear narration, appropriate past tenses, concrete explanations, some discourse markers.
3. Level C answers: nuanced argumentation, subjunctive/conditional, diplomatic register, complex connectors, ability to handle friction.
4. Include register variants: formal (for C) and semi-formal (for B).
5. Each answer must reference a realistic scenario from Canadian federal public service.
6. Scoring criteria alignment: show how the answer would score on grammar, vocabulary, fluency, pronunciation (noted), comprehension.

OUTPUT: Return a JSON array of model answer objects:
{
  "id": "MA-{LANG}-{LEVEL}-{NNN}",
  "scenario_id": "SCN-{LANG}-{NNN}",
  "language": "fr" or "en",
  "target_level": "B" or "C",
  "topic_domain": "HR|Finance|Operations|Policy|Service|IT|Leadership",
  "question": "The question being answered...",
  "model_answer_formal": "Full model answer in formal register...",
  "model_answer_semiformal": "Full model answer in semi-formal register...",
  "key_structures": ["passé composé", "conditionnel", ...],
  "key_vocabulary": ["term1", "term2", ...],
  "discourse_markers_used": ["cependant", "en revanche", ...],
  "scoring_notes": {
    "grammar": "Note on grammar quality demonstrated...",
    "vocabulary": "Note on vocabulary range...",
    "fluency": "Note on expected fluency...",
    "pronunciation": "Key pronunciation points...",
    "comprehension": "How comprehension is demonstrated..."
  },
  "needs_review": false
}"""


def generate_batch(item_type: str, lang: str, level: str, count: int, start_idx: int) -> list:
    """Generate a batch of items via GPT-5."""
    
    if item_type == "scenarios":
        system_prompt = SCENARIO_SYSTEM_PROMPT
        user_prompt = f"""Generate exactly {count} oral practice scenarios in {lang} for level {level}.

Requirements:
- Language: {"French" if lang == "FR" else "English"}
- Target level: {level}
- Mix of topic domains: {', '.join(TOPIC_DOMAINS)}
- {"60% full_simulation, 40% quick_drill" if level != "A" else "50% full_simulation, 50% quick_drill"}
- Scenario IDs: SCN-{lang}-{str(start_idx).zfill(3)} through SCN-{lang}-{str(start_idx + count - 1).zfill(3)}
{"- B→C transition: include hypothetical elements, mild friction, some formal register expectations" if level == "B" else ""}
{"- Must include: diplomatic friction, disagreement handling, policy negotiation, leadership competencies" if level == "C" else ""}

Return ONLY a valid JSON array. No markdown, no explanation."""

    elif item_type == "errors":
        system_prompt = ERROR_SYSTEM_PROMPT
        level_desc = {
            "A": "basic errors (conjugation, gender, basic false friends, simple prepositions)",
            "B": "intermediate errors (PC/imparfait, relative pronouns, conditional, register shifts)",
            "C": "advanced errors (subjunctive triggers, register violations, nuance, concession structures)"
        }
        user_prompt = f"""Generate exactly {count} error taxonomy entries for {lang} learners at level {level}.

Focus on: {level_desc.get(level, level_desc["B"])}
Error IDs: ERR-{lang}-{str(start_idx).zfill(3)} through ERR-{lang}-{str(start_idx + count - 1).zfill(3)}
Mix categories: anglicism, syntax, conjugation, register, pronunciation, false_friend, agreement, preposition, article, vocabulary

Return ONLY a valid JSON array. No markdown, no explanation."""

    elif item_type == "model_answers":
        system_prompt = MODEL_ANSWER_SYSTEM_PROMPT
        user_prompt = f"""Generate exactly {count} model answers in {lang} for level {level}.

Requirements:
- Language: {"French" if lang == "FR" else "English"}
- Target level: {level}
- Answer IDs: MA-{lang}-{level}-{str(start_idx).zfill(3)} through MA-{lang}-{level}-{str(start_idx + count - 1).zfill(3)}
- Mix of topic domains
- Include both formal and semi-formal register variants
{"- Demonstrate: clear narration, appropriate tenses, concrete explanations" if level == "B" else ""}
{"- Demonstrate: nuanced argumentation, subjunctive, diplomatic register, complex connectors" if level == "C" else ""}

Return ONLY a valid JSON array. No markdown, no explanation."""
    else:
        raise ValueError(f"Unknown type: {item_type}")

    for attempt in range(3):
        try:
            response = client.responses.create(
                model=MODEL,
                input=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.8,
            )
            
            text = response.output_text.strip()
            # Strip markdown code fences if present
            if text.startswith("```"):
                text = text.split("\n", 1)[1]
                if text.endswith("```"):
                    text = text.rsplit("```", 1)[0]
                text = text.strip()
            
            items = json.loads(text)
            if isinstance(items, list):
                return items
            elif isinstance(items, dict) and any(isinstance(v, list) for v in items.values()):
                # Sometimes GPT wraps in an object
                for v in items.values():
                    if isinstance(v, list):
                        return v
            return [items]
        except json.JSONDecodeError as e:
            print(f"  ⚠ JSON parse error (attempt {attempt+1}/3): {e}", file=sys.stderr)
            if attempt < 2:
                time.sleep(2)
        except Exception as e:
            print(f"  ⚠ API error (attempt {attempt+1}/3): {e}", file=sys.stderr)
            if attempt < 2:
                time.sleep(5)
    
    print(f"  ✗ Failed after 3 attempts", file=sys.stderr)
    return []


def main():
    parser = argparse.ArgumentParser(description="SLE Dataset Generator")
    parser.add_argument("--type", required=True, choices=["scenarios", "errors", "model_answers", "all"])
    parser.add_argument("--lang", default="FR", choices=["FR", "EN"])
    parser.add_argument("--level", default="B", choices=["A", "B", "C"])
    parser.add_argument("--count", type=int, default=20)
    parser.add_argument("--batch-size", type=int, default=10)
    parser.add_argument("--start-idx", type=int, default=1)
    args = parser.parse_args()

    print(f"╔══════════════════════════════════════════════════════════════╗")
    print(f"║  SLE Dataset Generator — {args.type.upper():30s}  ║")
    print(f"║  Lang: {args.lang}  Level: {args.level}  Count: {args.count:4d}  Batch: {args.batch_size:3d}       ║")
    print(f"╚══════════════════════════════════════════════════════════════╝")

    all_items = []
    remaining = args.count
    idx = args.start_idx

    while remaining > 0:
        batch_count = min(args.batch_size, remaining)
        print(f"  Generating batch: {batch_count} items (idx {idx}-{idx+batch_count-1})...")
        
        items = generate_batch(args.type, args.lang, args.level, batch_count, idx)
        all_items.extend(items)
        
        print(f"  ✓ Got {len(items)} items (total: {len(all_items)})")
        remaining -= batch_count
        idx += batch_count
        
        if remaining > 0:
            time.sleep(1)  # Rate limit courtesy

    # Write to JSONL
    suffix = f"_{args.lang.lower()}_{args.level.lower()}" if args.type != "errors" else f"_{args.lang.lower()}"
    out_file = SEED_DIR / f"{args.type}_generated{suffix}.jsonl"
    
    with open(out_file, "w") as f:
        for item in all_items:
            f.write(json.dumps(item, ensure_ascii=False) + "\n")
    
    print(f"\n  ✓ Written {len(all_items)} items to {out_file}")
    print(f"  Quality Gate: {'PASS' if len(all_items) >= args.count * 0.8 else 'WARN'}")


if __name__ == "__main__":
    main()
