#!/usr/bin/env node
/**
 * Generate EN/FR lesson descriptions for 80 lessons (Paths II-VI)
 * Uses the built-in LLM via the invokeLLM helper pattern
 */
import fs from 'fs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const lessons = JSON.parse(fs.readFileSync('/home/ubuntu/lessons_needing_descriptions.json', 'utf8'));

// CEFR level mapping for context
const CEFR_MAP = {
  120002: 'A2 (Elementary)',
  120003: 'B1 (Intermediate)',
  120004: 'B2 (Upper Intermediate)',
  120005: 'C1 (Advanced)',
  120006: 'B2-C1 (SLE Exam Preparation)'
};

const COURSE_CONTEXT = {
  120002: 'This course focuses on everyday communication skills for Canadian public servants at the A2 level. Topics include basic workplace emails, phone calls, meetings, and social interactions in French.',
  120003: 'This course develops operational French skills at the B1 level for Canadian public servants. Topics include professional writing, oral presentations, team collaboration, and workplace procedures in French.',
  120004: 'This course builds professional mastery at the B2 level for Canadian public servants. Topics include advanced writing, negotiations, complex presentations, policy analysis, and leadership communication in French.',
  120005: 'This course develops executive-level French at the C1 level for Canadian public servants. Topics include strategic communication, high-level briefings, media relations, parliamentary language, and nuanced argumentation in French.',
  120006: 'This course prepares candidates for the SLE (Second Language Evaluation) exam at B2-C1 levels. Topics include reading comprehension strategies, written expression techniques, oral interaction practice, and exam-specific preparation.'
};

// Use the Forge API directly (same as invokeLLM under the hood)
const FORGE_URL = process.env.BUILT_IN_FORGE_API_URL;
const FORGE_KEY = process.env.BUILT_IN_FORGE_API_KEY;

async function generateDescriptions(batch) {
  const lessonList = batch.map(l => 
    `- ID:${l.id} | EN: "${l.title}" | FR: "${l.titleFr}" | Module: "${l.moduleTitle}"`
  ).join('\n');
  
  const courseId = batch[0].courseId;
  const cefrLevel = CEFR_MAP[courseId];
  const courseContext = COURSE_CONTEXT[courseId];
  
  const prompt = `You are a bilingual education content specialist for RusingAcademy, a premium language training program for Canadian public servants.

Generate descriptions for these lessons. Each description should be 2-3 sentences (50-80 words), focusing on learning objectives and competencies developed.

COURSE CONTEXT:
- Course: ${batch[0].courseTitle}
- CEFR Level: ${cefrLevel}
- ${courseContext}

LESSONS TO DESCRIBE:
${lessonList}

REQUIREMENTS:
1. English descriptions: Professional, clear, action-oriented. Start with "In this lesson, learners will..." or "This lesson focuses on..."
2. French descriptions: Authentic French (NOT literal translation). Start with "Dans cette leçon, les apprenants..." or "Cette leçon porte sur..."
3. Each description should mention specific skills or competencies
4. Adapt vocabulary complexity to the CEFR level
5. Reference Canadian public service context where relevant

Return a JSON array with objects: { "id": number, "descriptionEn": string, "descriptionFr": string }
Return ONLY the JSON array, no markdown fences.`;

  const response = await fetch(`${FORGE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${FORGE_KEY}`
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: 'You are a bilingual education content specialist. Return only valid JSON.' },
        { role: 'user', content: prompt }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'lesson_descriptions',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              descriptions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    descriptionEn: { type: 'string' },
                    descriptionFr: { type: 'string' }
                  },
                  required: ['id', 'descriptionEn', 'descriptionFr'],
                  additionalProperties: false
                }
              }
            },
            required: ['descriptions'],
            additionalProperties: false
          }
        }
      }
    })
  });
  
  const data = await response.json();
  const content = data.choices[0].message.content;
  const parsed = JSON.parse(content);
  return parsed.descriptions;
}

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  // Group lessons by course (16 per course, process 8 at a time)
  const courseGroups = {};
  for (const l of lessons) {
    if (!courseGroups[l.courseId]) courseGroups[l.courseId] = [];
    courseGroups[l.courseId].push(l);
  }
  
  let totalUpdated = 0;
  let errors = [];
  
  for (const [courseId, courseLessons] of Object.entries(courseGroups)) {
    console.log(`\n=== Processing Course ${courseId}: ${courseLessons[0].courseTitle} ===`);
    
    // Process in batches of 8 (2 batches per course)
    for (let i = 0; i < courseLessons.length; i += 8) {
      const batch = courseLessons.slice(i, i + 8);
      console.log(`  Batch ${i/8 + 1}: ${batch.length} lessons (IDs: ${batch.map(l=>l.id).join(',')})`);
      
      try {
        const descriptions = await generateDescriptions(batch);
        
        for (const desc of descriptions) {
          if (!desc.descriptionEn || !desc.descriptionFr) {
            console.log(`    WARN: Empty description for ID ${desc.id}`);
            errors.push({ id: desc.id, error: 'Empty description' });
            continue;
          }
          
          await conn.query(
            'UPDATE lessons SET description = ?, descriptionFr = ? WHERE id = ?',
            [desc.descriptionEn, desc.descriptionFr, desc.id]
          );
          totalUpdated++;
          console.log(`    ✓ Updated ID ${desc.id}: ${desc.descriptionEn.substring(0, 60)}...`);
        }
      } catch (err) {
        console.log(`    ERROR: ${err.message}`);
        errors.push({ batch: batch.map(l=>l.id), error: err.message });
      }
      
      // Small delay between batches
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`Total updated: ${totalUpdated}/80`);
  console.log(`Errors: ${errors.length}`);
  if (errors.length > 0) console.log(JSON.stringify(errors, null, 2));
  
  await conn.end();
}

main().catch(console.error);
