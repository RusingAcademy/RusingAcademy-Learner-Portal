/**
 * generate-missing-quizzes.mjs — Idempotent Quiz Question Generator
 * 
 * Generates 8 quiz questions for lessons that have 0 or fewer than 6 questions.
 * Uses the LLM to generate contextually relevant questions based on lesson content.
 * 
 * IDEMPOTENT: Checks existing question count before inserting. Safe to re-run.
 */
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const TARGET_QUESTIONS = 8; // Target 8 questions per lesson (within 6-10 range)
const MIN_QUESTIONS = 6;    // Minimum acceptable

// LLM invocation helper
async function invokeLLM(messages) {
  const apiUrl = process.env.BUILT_IN_FORGE_API_URL;
  const apiKey = process.env.BUILT_IN_FORGE_API_KEY;
  
  const response = await fetch(`${apiUrl}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      messages,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "quiz_questions",
          strict: true,
          schema: {
            type: "object",
            properties: {
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    questionText: { type: "string", description: "Question in French" },
                    questionTextFr: { type: "string", description: "Same question (French is primary)" },
                    questionType: { type: "string", enum: ["multiple_choice", "true_false"] },
                    options: {
                      type: "array",
                      items: { type: "string" },
                      description: "4 options for multiple_choice, 2 for true_false"
                    },
                    correctAnswer: { type: "string", description: "The correct answer text" },
                    explanation: { type: "string", description: "Brief explanation in French" },
                    explanationFr: { type: "string", description: "Same explanation (French)" },
                    difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
                  },
                  required: ["questionText", "questionTextFr", "questionType", "options", "correctAnswer", "explanation", "explanationFr", "difficulty"],
                  additionalProperties: false,
                },
              },
            },
            required: ["questions"],
            additionalProperties: false,
          },
        },
      },
    }),
  });
  
  if (!response.ok) {
    throw new Error(`LLM API error: ${response.status} ${await response.text()}`);
  }
  
  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log("🔍 Scanning for lessons needing quiz questions...");
  
  // Find all lessons with fewer than MIN_QUESTIONS quiz questions
  const [lessonsNeedingQuiz] = await conn.execute(`
    SELECT a.lessonId, a.courseId, a.moduleId, l.title as lessonTitle, l.titleFr as lessonTitleFr,
      cm.title as moduleTitle, c.title as courseTitle,
      (SELECT COUNT(*) FROM quiz_questions qq WHERE qq.lessonId = a.lessonId) as existingCount
    FROM activities a
    JOIN lessons l ON l.id = a.lessonId
    JOIN course_modules cm ON cm.id = l.moduleId
    JOIN courses c ON c.id = a.courseId
    WHERE a.slotType = 'quiz_slot'
    AND (SELECT COUNT(*) FROM quiz_questions qq WHERE qq.lessonId = a.lessonId) < ${MIN_QUESTIONS}
    ORDER BY a.courseId, a.lessonId
  `);
  
  console.log(`📋 Found ${lessonsNeedingQuiz.length} lessons needing quiz questions`);
  
  if (lessonsNeedingQuiz.length === 0) {
    console.log("✅ All lessons have sufficient quiz questions. Nothing to do.");
    await conn.end();
    return;
  }
  
  let generated = 0;
  let failed = 0;
  
  for (const lesson of lessonsNeedingQuiz) {
    const needed = TARGET_QUESTIONS - lesson.existingCount;
    if (needed <= 0) continue;
    
    console.log(`\n📝 Lesson ${lesson.lessonId}: "${lesson.lessonTitle}" (has ${lesson.existingCount}, needs ${needed} more)`);
    
    // Get lesson content for context
    const [activities] = await conn.execute(`
      SELECT slotType, title, content, contentFr
      FROM activities 
      WHERE lessonId = ? AND slotType IN ('introduction', 'grammar_point', 'written_practice')
      ORDER BY slotIndex
    `, [lesson.lessonId]);
    
    const contentContext = activities.map(a => {
      const text = (a.contentFr || a.content || "").substring(0, 1500);
      return `[${a.slotType}] ${text}`;
    }).join("\n\n");
    
    try {
      const result = await invokeLLM([
        {
          role: "system",
          content: `Tu es un expert en création de quiz pour un programme de formation en français langue seconde (FSL) destiné aux fonctionnaires canadiens. 
          
Génère exactement ${needed} questions de quiz basées sur le contenu de la leçon fournie.

Règles:
- Les questions doivent être en FRANÇAIS
- Mix de types: principalement multiple_choice (4 options), quelques true_false
- Mix de difficultés: 2 easy, ${needed > 4 ? Math.ceil(needed/2) : 2} medium, ${needed > 6 ? 2 : 1} hard
- Les questions doivent tester la compréhension du contenu grammatical et du vocabulaire de la leçon
- Chaque question vaut 10 points
- Les explications doivent être brèves et pédagogiques
- Assure-toi que les options de réponse sont plausibles mais qu'une seule est correcte
- Le correctAnswer doit correspondre EXACTEMENT à l'une des options`
        },
        {
          role: "user",
          content: `Cours: ${lesson.courseTitle}
Module: ${lesson.moduleTitle}
Leçon: ${lesson.lessonTitle} / ${lesson.lessonTitleFr || lesson.lessonTitle}

Contenu de la leçon:
${contentContext}

Génère ${needed} questions de quiz pertinentes.`
        }
      ]);
      
      if (!result.questions || result.questions.length === 0) {
        console.log(`  ⚠️ No questions generated`);
        failed++;
        continue;
      }
      
      // Get the current max orderIndex for this lesson
      const [maxOrder] = await conn.execute(
        "SELECT COALESCE(MAX(orderIndex), -1) as maxIdx FROM quiz_questions WHERE lessonId = ?",
        [lesson.lessonId]
      );
      let orderIdx = (maxOrder[0]?.maxIdx || 0) + 1;
      
      // Insert questions
      for (const q of result.questions) {
        // Validate correctAnswer is in options
        if (q.questionType === "multiple_choice" && !q.options.includes(q.correctAnswer)) {
          console.log(`  ⚠️ Skipping question: correctAnswer not in options`);
          continue;
        }
        
        await conn.execute(`
          INSERT INTO quiz_questions (lessonId, moduleId, courseId, questionText, questionTextFr, questionType, options, correctAnswer, explanation, explanationFr, points, difficulty, orderIndex, isActive)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 10, ?, ?, 1)
        `, [
          lesson.lessonId,
          lesson.moduleId,
          lesson.courseId,
          q.questionText,
          q.questionTextFr || q.questionText,
          q.questionType,
          JSON.stringify(q.options),
          q.correctAnswer,
          q.explanation,
          q.explanationFr || q.explanation,
          q.difficulty,
          orderIdx++,
        ]);
      }
      
      console.log(`  ✅ Inserted ${result.questions.length} questions (order ${orderIdx - result.questions.length} → ${orderIdx - 1})`);
      generated += result.questions.length;
      
    } catch (err) {
      console.error(`  ❌ Error generating for lesson ${lesson.lessonId}:`, err.message);
      failed++;
    }
    
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log(`\n${"=".repeat(60)}`);
  console.log(`📊 SUMMARY`);
  console.log(`  Generated: ${generated} questions`);
  console.log(`  Failed lessons: ${failed}`);
  
  // Verify final counts
  const [finalCheck] = await conn.execute(`
    SELECT 
      COUNT(*) as totalLessons,
      SUM(CASE WHEN qCount >= ${MIN_QUESTIONS} THEN 1 ELSE 0 END) as passing,
      SUM(CASE WHEN qCount = 0 THEN 1 ELSE 0 END) as missing,
      SUM(CASE WHEN qCount > 0 AND qCount < ${MIN_QUESTIONS} THEN 1 ELSE 0 END) as low
    FROM (
      SELECT a.lessonId, (SELECT COUNT(*) FROM quiz_questions qq WHERE qq.lessonId = a.lessonId) as qCount
      FROM activities a WHERE a.slotType = 'quiz_slot'
    ) t
  `);
  console.log(`\n📋 FINAL STATUS:`);
  console.log(`  Total quiz lessons: ${finalCheck[0].totalLessons}`);
  console.log(`  Passing (≥${MIN_QUESTIONS}): ${finalCheck[0].passing}`);
  console.log(`  Missing (0): ${finalCheck[0].missing}`);
  console.log(`  Low (<${MIN_QUESTIONS}): ${finalCheck[0].low}`);
  
  await conn.end();
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
