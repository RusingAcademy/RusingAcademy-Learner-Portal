/**
 * Fix Path III — Insert missing lessons for Module 10 (all 4) and Module 11 (lessons 11.1-11.3)
 * Module 10 (ID: 150007) has 0 lessons, Module 11 (ID: 150008) has only lesson 11.4
 */

import 'dotenv/config';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

const CONTENT_DIR = '/home/ubuntu/course_content';
const COURSE_ID = 120003;

const SLOT_TYPES = ['introduction', 'video_scenario', 'grammar_point', 'written_practice', 'oral_practice', 'quiz_slot', 'coaching_tip'];
const SLOT_ACTIVITY_TYPES = ['text', 'video', 'text', 'assignment', 'speaking_exercise', 'quiz', 'text'];
const SLOT_LABELS_EN = ['Introduction', 'Video Scenario', 'Grammar Point', 'Written Practice', 'Oral Practice', 'Quiz', 'Coaching Tip'];
const SLOT_LABELS_FR = ['Introduction', 'Scénario Vidéo', 'Point de Grammaire', 'Pratique Écrite', 'Pratique Orale', 'Quiz', 'Conseil du Coach'];

function parseSlots(fileContent) {
  let content = fileContent.replace(/'''/g, '');
  const lines = content.split('\n');
  if (lines[0] && lines[0].includes('## SLOT 1') && lines[0].length > 500) {
    const beforeSlot1 = lines[0].substring(0, lines[0].indexOf('## SLOT 1'));
    lines[0] = beforeSlot1;
    lines.splice(1, 0, '## SLOT 1 : Introduction');
    content = lines.join('\n');
  }
  
  const slotRegex = /^(?:#{2,3})\s*\**\s*SLOT\s+(\d+)\s*[—–:\s-]\s*(.*?)\**\s*$/gm;
  const slotPositions = [];
  let match;
  while ((match = slotRegex.exec(content)) !== null) {
    slotPositions.push({
      slotNum: parseInt(match[1]),
      startIndex: match.index,
      headerEnd: match.index + match[0].length
    });
  }
  
  if (slotPositions.length === 0) {
    const inlineSlotRegex = /## SLOT (\d+)\s*[:\s]/g;
    while ((match = inlineSlotRegex.exec(content)) !== null) {
      slotPositions.push({
        slotNum: parseInt(match[1]),
        startIndex: match.index,
        headerEnd: match.index + match[0].length
      });
    }
  }
  
  const slots = [];
  for (let i = 0; i < slotPositions.length; i++) {
    const startPos = slotPositions[i].headerEnd;
    const endPos = i + 1 < slotPositions.length ? slotPositions[i + 1].startIndex : content.length;
    let slotContent = content.substring(startPos, endPos).trim();
    const annexeIdx = slotContent.indexOf('## ANNEXES');
    if (annexeIdx > -1) slotContent = slotContent.substring(0, annexeIdx).trim();
    slots.push({ slotNum: slotPositions[i].slotNum, content: slotContent });
  }
  return slots;
}

function extractQuizJson(slotContent) {
  const jsonMatch = slotContent.match(/```json\s*([\s\S]*?)```/);
  if (!jsonMatch) {
    const rawJsonMatch = slotContent.match(/\{\s*"questions"\s*:\s*\[[\s\S]*?\]\s*\}/);
    if (rawJsonMatch) {
      try { return JSON.parse(rawJsonMatch[0]); } catch (e) { return null; }
    }
    return null;
  }
  try { return JSON.parse(jsonMatch[1].trim()); } catch (e) {
    let fixed = jsonMatch[1].trim().replace(/,\s*([}\]])/g, '$1');
    try { return JSON.parse(fixed); } catch (e2) { return null; }
  }
}

const MISSING_LESSONS = [
  // Module 10 - all 4 lessons
  { moduleId: 150007, file: 'Module_10_Communication_Ecrite/Lecon_10.1_Rediger_Compte_Rendu.md', num: '10.1', titleEn: 'Writing Meeting Minutes', titleFr: 'Rédiger un Compte Rendu', lessonNumber: 1, sortOrder: 4 },
  { moduleId: 150007, file: 'Module_10_Communication_Ecrite/Lecon_10.2_Demander_Revision.md', num: '10.2', titleEn: 'Requesting a Revision', titleFr: 'Demander une Révision', lessonNumber: 2, sortOrder: 5 },
  { moduleId: 150007, file: 'Module_10_Communication_Ecrite/Lecon_10.3_Ecrire_Rapport_Simple.md', num: '10.3', titleEn: 'Writing a Simple Report', titleFr: 'Écrire un Rapport Simple', lessonNumber: 3, sortOrder: 6 },
  { moduleId: 150007, file: 'Module_10_Communication_Ecrite/Lecon_10.4_Biographie_Professionnelle.md', num: '10.4', titleEn: 'Professional Biography', titleFr: 'Biographie Professionnelle', lessonNumber: 4, sortOrder: 7 },
  // Module 11 - lessons 11.1-11.3
  { moduleId: 150008, file: 'Module_11_Presentations_Simples/Lecon_11.1_Donnees_Chiffrees.md', num: '11.1', titleEn: 'Numerical Data', titleFr: 'Données Chiffrées', lessonNumber: 1, sortOrder: 8 },
  { moduleId: 150008, file: 'Module_11_Presentations_Simples/Lecon_11.2_Processus_Etapes.md', num: '11.2', titleEn: 'Processes & Steps', titleFr: 'Processus et Étapes', lessonNumber: 2, sortOrder: 9 },
  { moduleId: 150008, file: 'Module_11_Presentations_Simples/Lecon_11.3_Questions_Auditoire.md', num: '11.3', titleEn: 'Audience Questions', titleFr: "Questions de l'Auditoire", lessonNumber: 3, sortOrder: 10 },
];

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  for (const lessonDef of MISSING_LESSONS) {
    const filePath = path.join(CONTENT_DIR, 'Path_III_COMPLET', lessonDef.file);
    let fileContent;
    try {
      fileContent = fs.readFileSync(filePath, 'utf-8');
    } catch (e) {
      console.error(`❌ File not found: ${filePath}`);
      continue;
    }
    
    const slots = parseSlots(fileContent);
    const lessonTitleEn = `Lesson ${lessonDef.num}: ${lessonDef.titleEn}`;
    const lessonTitleFr = `Leçon ${lessonDef.num} : ${lessonDef.titleFr}`;
    
    const [lessonResult] = await conn.query(`INSERT INTO lessons
      (moduleId, courseId, title, titleFr, sortOrder, lessonNumber, totalSlots, totalActivities, status)
      VALUES (?, ?, ?, ?, ?, ?, 7, 7, 'draft')`, [
      lessonDef.moduleId, COURSE_ID, lessonTitleEn, lessonTitleFr,
      lessonDef.sortOrder, lessonDef.lessonNumber
    ]);
    const lessonId = lessonResult.insertId;
    console.log(`✅ Lesson ${lessonDef.num}: ${lessonDef.titleEn} (ID: ${lessonId}, ${slots.length} slots)`);
    
    for (let si = 0; si < 7; si++) {
      const slotNum = si + 1;
      const parsedSlot = slots.find(s => s.slotNum === slotNum);
      const slotContent = parsedSlot ? parsedSlot.content : null;
      
      const actTitleEn = `Lesson ${lessonDef.num}: ${lessonDef.titleEn} — ${SLOT_LABELS_EN[si]}`;
      const actTitleFr = `Leçon ${lessonDef.num} : ${lessonDef.titleFr} — ${SLOT_LABELS_FR[si]}`;
      
      let quizJson = null;
      if (slotNum === 6 && slotContent) {
        quizJson = extractQuizJson(slotContent);
      }
      
      await conn.query(`INSERT INTO activities
        (lessonId, moduleId, courseId, title, titleFr,
         content, contentFr, slotIndex, slotNumber, slotType,
         activityType, isRequired, sortOrder, status, isMandatory,
         contentJson, contentJsonFr, estimatedMinutes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 'draft', 1, ?, ?, ?)`, [
        lessonId, lessonDef.moduleId, COURSE_ID, actTitleEn, actTitleFr,
        slotContent, slotContent, slotNum, slotNum, SLOT_TYPES[si],
        SLOT_ACTIVITY_TYPES[si], si,
        quizJson ? JSON.stringify(quizJson) : null,
        quizJson ? JSON.stringify(quizJson) : null,
        [2, 7, 12, 10, 8, 7, 3][si]
      ]);
      
      if (slotNum === 6 && quizJson && quizJson.questions) {
        const [quizResult] = await conn.query(`INSERT INTO quizzes
          (lessonId, courseId, title, description, passingScore, timeLimit, attemptsAllowed, shuffleQuestions, showCorrectAnswers, totalQuestions)
          VALUES (?, ?, ?, ?, 70, 600, 3, 1, 1, ?)`, [
          lessonId, COURSE_ID, `Quiz — Lesson ${lessonDef.num}`, `Quiz for ${lessonDef.titleEn}`, quizJson.questions.length
        ]);
        const quizId = quizResult.insertId;
        
        for (let qi = 0; qi < quizJson.questions.length; qi++) {
          const q = quizJson.questions[qi];
          const questionText = q.question || q.question_text || q.questionText;
          const qType = q.type || q.question_type || q.questionType || 'multiple-choice';
          const options = q.options ? JSON.stringify(q.options) : null;
          const answer = q.answer !== undefined ? String(q.answer) : (q.correct_answer !== undefined ? String(q.correct_answer) : null);
          const feedback = q.feedback || q.explanation || null;
          
          if (!questionText) continue;
          const normalizedType = (qType.includes('fill') || qType.includes('blank')) ? 'fill_blank' : 'multiple_choice';
          
          await conn.query(`INSERT INTO quiz_questions
            (lessonId, moduleId, courseId, quizId, questionText, questionTextFr, questionType,
             options, correctAnswer, explanation, explanationFr, points, difficulty, orderIndex, isActive)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 10, 'medium', ?, 1)`, [
            lessonId, lessonDef.moduleId, COURSE_ID, quizId,
            questionText, questionText, normalizedType, options, answer, feedback, feedback, qi
          ]);
        }
        console.log(`  📝 Quiz created with ${quizJson.questions.length} questions`);
      }
    }
  }
  
  // Also update the lesson 11.4 sortOrder to be after 11.3
  await conn.query('UPDATE lessons SET sortOrder = 11, lessonNumber = 4 WHERE id = 150021');
  
  console.log('\n✅ Path III fix complete!');
  
  // Verify
  const [mods] = await conn.query('SELECT id, title FROM course_modules WHERE courseId = ? ORDER BY sortOrder', [COURSE_ID]);
  for (const m of mods) {
    const [lessons] = await conn.query('SELECT id, title FROM lessons WHERE moduleId = ? ORDER BY sortOrder', [m.id]);
    console.log(`  ${m.title}: ${lessons.length} lessons`);
  }
  
  await conn.end();
}

main().catch(console.error);
