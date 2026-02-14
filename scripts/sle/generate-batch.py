#!/usr/bin/env python3
"""
SLE AI Companion — Single Batch Generator
Called by the parallel orchestrator. Generates one batch and writes to stdout as JSONL.

Usage: python3 generate-batch.py <type> <lang> <level> <count> <start_idx> <output_file>
"""
import json
import os
import sys
import time
from openai import OpenAI

client = OpenAI(base_url='https://api.openai.com/v1')
MODEL = "gpt-4.1-mini"

TOPIC_DOMAINS = ["HR", "Finance", "Operations", "Policy", "Service", "IT", "Leadership", "Environment", "Communications", "Diversity"]

def get_prompts(item_type, lang, level, count, start_idx):
    if item_type == "scenarios":
        system_prompt = """You are an expert in Canadian federal public service Second Language Evaluation (SLE) oral exam preparation. You create realistic, pedagogically sound oral practice scenarios.

RULES:
1. Each scenario must be a valid JSON object matching the exact schema below.
2. target_level determines complexity:
   - A: Concrete, routine. Simple SVO syntax. Present tense. Basic workplace topics.
   - B: Narration, facts. Passé composé vs imparfait. Relative clauses. Conditional simple. Concrete non-routine.
   - C: Abstraction, nuance. Subjonctif, conditionnel passé. Diplomatic register. Friction (disagreements, ambiguity). Leadership competencies.
3. B→C transition zone: scenarios that push B-level candidates toward C-level demands.
4. question_sequence must have 3-5 questions with probing follow-ups.
5. expected_functions must use SLE-aligned functions: describe, narrate, explain, justify, hypothesize, negotiate, reframe, persuade, concede, compare.
6. scoring_focus uses exactly these 5 criteria: grammar, vocabulary, fluency, pronunciation, comprehension.
7. register_constraints for C-level MUST include {"pronoun": "vous", "tone": "diplomatic"}.
8. Language must match the requested language (FR or EN).
9. All content must be relevant to Canadian federal public service context.
10. NO field should be empty or "unknown". If uncertain, provide best candidate and set needs_review: true.

OUTPUT: Return ONLY a valid JSON array of scenario objects (no markdown fences). Each object:
{
  "scenario_id": "SCN-{LANG}-{NNN}",
  "language": "fr" or "en",
  "target_level": "A", "B", or "C",
  "topic_domain": one of [HR, Finance, Operations, Policy, Service, IT, Leadership, Environment, Communications, Diversity],
  "duration_tag": "quick_drill" or "full_simulation",
  "context_prompt": "Detailed context...",
  "examiner_role": "Role description...",
  "question_sequence": [{"q": "...", "probing": ["..."], "conditions": {"if_hesitant": "..."}}],
  "expected_functions": ["narrate", "justify", ...],
  "expected_vocabulary": ["term1", ...],
  "register_constraints": {"pronoun": "vous/tu", "tone": "formal/semi-formal/diplomatic"},
  "scoring_focus": ["grammar", "vocabulary", "fluency", "pronunciation", "comprehension"],
  "tags": {"grammatical": [...], "functional": [...]},
  "needs_review": false
}"""
        level_extra = ""
        if level == "B":
            level_extra = "- B→C transition: include hypothetical elements, mild friction, some formal register expectations"
        elif level == "C":
            level_extra = "- Must include: diplomatic friction, disagreement handling, policy negotiation, leadership competencies"
        
        user_prompt = f"""Generate exactly {count} oral practice scenarios in {"French" if lang == "FR" else "English"} for level {level}.
Scenario IDs: SCN-{lang}-{str(start_idx).zfill(3)} through SCN-{lang}-{str(start_idx + count - 1).zfill(3)}
Mix topic domains evenly. {"60% full_simulation, 40% quick_drill" if level != "A" else "50/50 split"}.
{level_extra}
Return ONLY a valid JSON array."""

    elif item_type == "errors":
        system_prompt = """You are an expert linguist specializing in common errors made by English-speaking Canadian public servants learning French (and vice versa). You create detailed error taxonomy entries.

RULES:
1. Categories: anglicism, syntax, conjugation, register, pronunciation, false_friend, agreement, preposition, article, vocabulary
2. severity_level: 1 (minor) to 5 (critical)
3. Include realistic examples from federal workplace context.
4. criterion_affected: grammar, vocabulary, fluency, pronunciation, comprehension.
5. Level A: basic conjugation, gender, basic false friends.
6. Level B: PC/imparfait confusion, relative pronouns, conditional.
7. Level C: subjunctive triggers, register violations, nuance errors.

OUTPUT: Return ONLY a valid JSON array. Each object:
{
  "id": "ERR-{LANG}-{NNN}",
  "language": "fr" or "en",
  "category": "anglicism|syntax|conjugation|register|pronunciation|false_friend|agreement|preposition|article|vocabulary",
  "severity_level": 1-5,
  "pattern": "The incorrect pattern",
  "correction": "The correct form",
  "correction_rule": "Explanation...",
  "feedback_text": "Coaching feedback in target language...",
  "level_impact": "A|B|C",
  "criterion_affected": "grammar|vocabulary|fluency|pronunciation|comprehension",
  "examples": [{"incorrect": "...", "correct": "...", "context": "..."}],
  "tags": ["false_friend", ...],
  "needs_review": false
}"""
        level_desc = {"A": "basic errors", "B": "intermediate errors", "C": "advanced errors"}
        user_prompt = f"""Generate exactly {count} error taxonomy entries for {"French" if lang == "FR" else "English"} learners at level {level}.
Focus: {level_desc.get(level, "intermediate errors")}
IDs: ERR-{lang}-{str(start_idx).zfill(3)} through ERR-{lang}-{str(start_idx + count - 1).zfill(3)}
Mix all categories evenly.
Return ONLY a valid JSON array."""

    elif item_type == "model_answers":
        system_prompt = """You are an expert SLE oral exam coach. You create model answers demonstrating expected quality for each proficiency level.

RULES:
1. Level B: clear narration, appropriate past tenses, concrete explanations, discourse markers.
2. Level C: nuanced argumentation, subjunctive/conditional, diplomatic register, complex connectors, friction handling.
3. Include formal and semi-formal register variants.
4. Reference realistic Canadian federal public service scenarios.

OUTPUT: Return ONLY a valid JSON array. Each object:
{
  "id": "MA-{LANG}-{LEVEL}-{NNN}",
  "scenario_id": "SCN-{LANG}-{NNN}",
  "language": "fr" or "en",
  "target_level": "B" or "C",
  "topic_domain": "HR|Finance|Operations|Policy|Service|IT|Leadership",
  "question": "The question being answered...",
  "model_answer_formal": "Full model answer in formal register...",
  "model_answer_semiformal": "Full model answer in semi-formal register...",
  "key_structures": ["passé composé", ...],
  "key_vocabulary": ["term1", ...],
  "discourse_markers_used": ["cependant", ...],
  "scoring_notes": {"grammar": "...", "vocabulary": "...", "fluency": "...", "pronunciation": "...", "comprehension": "..."},
  "needs_review": false
}"""
        user_prompt = f"""Generate exactly {count} model answers in {"French" if lang == "FR" else "English"} for level {level}.
IDs: MA-{lang}-{level}-{str(start_idx).zfill(3)} through MA-{lang}-{level}-{str(start_idx + count - 1).zfill(3)}
Mix topic domains.
{"Demonstrate: clear narration, appropriate tenses, concrete explanations" if level == "B" else "Demonstrate: nuanced argumentation, subjunctive, diplomatic register, complex connectors"}
Return ONLY a valid JSON array."""
    else:
        raise ValueError(f"Unknown type: {item_type}")
    
    return system_prompt, user_prompt


def main():
    if len(sys.argv) != 7:
        print("Usage: python3 generate-batch.py <type> <lang> <level> <count> <start_idx> <output_file>", file=sys.stderr)
        sys.exit(1)
    
    item_type, lang, level, count, start_idx, output_file = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4]), int(sys.argv[5]), sys.argv[6]
    
    system_prompt, user_prompt = get_prompts(item_type, lang, level, count, start_idx)
    
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
            if text.startswith("```"):
                text = text.split("\n", 1)[1]
                if text.endswith("```"):
                    text = text.rsplit("```", 1)[0]
                text = text.strip()
            
            items = json.loads(text)
            if isinstance(items, dict):
                for v in items.values():
                    if isinstance(v, list):
                        items = v
                        break
            if not isinstance(items, list):
                items = [items]
            
            with open(output_file, "w") as f:
                for item in items:
                    f.write(json.dumps(item, ensure_ascii=False) + "\n")
            
            print(f"✓ {item_type}/{lang}/{level}: {len(items)} items → {output_file}")
            return
            
        except json.JSONDecodeError as e:
            print(f"⚠ JSON error (attempt {attempt+1}): {e}", file=sys.stderr)
            if attempt < 2:
                time.sleep(3)
        except Exception as e:
            print(f"⚠ API error (attempt {attempt+1}): {e}", file=sys.stderr)
            if attempt < 2:
                time.sleep(5)
    
    print(f"✗ FAILED: {item_type}/{lang}/{level}", file=sys.stderr)
    # Write empty file so pipeline doesn't break
    with open(output_file, "w") as f:
        pass


if __name__ == "__main__":
    main()
