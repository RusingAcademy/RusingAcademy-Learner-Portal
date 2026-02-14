/**
 * Update thumbnail URLs in the database from uploaded S3 files
 */
import 'dotenv/config';
import mysql from 'mysql2/promise';
import fs from 'fs';

const mapping = {};
const lines = fs.readFileSync('/home/ubuntu/upload_mapping.txt', 'utf-8').trim().split('\n');
for (const line of lines) {
  const [filename, url] = line.split('|');
  mapping[filename] = url;
}

console.log(`Loaded ${Object.keys(mapping).length} URL mappings`);

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  let updated = 0;
  
  // ============================================================================
  // 1. Course thumbnails (Path covers)
  // ============================================================================
  const courseThumbMap = {
    90007: mapping['Path_I_Thumbnail.png'],       // Path I
    120004: mapping['Path_IV_Thumbnail.png'],      // Path IV
    120005: mapping['Path_V_Thumbnail.png'],       // Path V
    120006: mapping['Path_VI_Thumbnail.png'],      // Path VI
  };
  
  for (const [courseId, url] of Object.entries(courseThumbMap)) {
    if (url) {
      await conn.query('UPDATE courses SET thumbnailUrl = ? WHERE id = ?', [url, courseId]);
      console.log(`✅ Course ${courseId} thumbnail updated`);
      updated++;
    }
  }
  
  // Also update learning paths thumbnails
  const lpThumbMap = {
    60007: mapping['Path_I_Thumbnail.png'],
  };
  for (const [lpId, url] of Object.entries(lpThumbMap)) {
    if (url) {
      await conn.query('UPDATE learning_paths SET thumbnailUrl = ? WHERE id = ?', [url, lpId]);
      console.log(`✅ Learning path ${lpId} thumbnail updated`);
      updated++;
    }
  }
  
  // ============================================================================
  // 2. Module thumbnails (Path I modules 1-4)
  // ============================================================================
  const moduleThumbMap = {
    120025: mapping['Module_1_Thumbnail.png'],
    120026: mapping['Module_2_Thumbnail.png'],
    120027: mapping['Module_3_Thumbnail.png'],
    120028: mapping['Module_4_Thumbnail.png'],
  };
  
  for (const [moduleId, url] of Object.entries(moduleThumbMap)) {
    if (url) {
      await conn.query('UPDATE course_modules SET thumbnailUrl = ? WHERE id = ?', [url, moduleId]);
      console.log(`✅ Module ${moduleId} thumbnail updated`);
      updated++;
    }
  }
  
  // ============================================================================
  // 3. Path I lesson thumbnails (lesson_X_Y.png -> lesson X.Y)
  // ============================================================================
  const pathILessonMap = {
    120097: mapping['Path_I_lesson_1_1.png'],
    120098: mapping['Path_I_lesson_1_2.png'],
    120099: mapping['Path_I_lesson_1_3.png'],
    120100: mapping['Path_I_lesson_1_4.png'],
    120101: mapping['Path_I_lesson_2_1.png'],
    120102: mapping['Path_I_lesson_2_2.png'],
    120103: mapping['Path_I_lesson_2_3.png'],
    120104: mapping['Path_I_lesson_2_4.png'],
    120105: mapping['Path_I_lesson_3_1.png'],
    120106: mapping['Path_I_lesson_3_2.png'],
    120107: mapping['Path_I_lesson_3_3.png'],
    120108: mapping['Path_I_lesson_3_4.png'],
    120109: mapping['Path_I_lesson_4_1.png'],
    120110: mapping['Path_I_lesson_4_2.png'],
    120111: mapping['Path_I_lesson_4_3.png'],
    120112: mapping['Path_I_lesson_4_4.png'],
  };
  
  for (const [lessonId, url] of Object.entries(pathILessonMap)) {
    if (url) {
      await conn.query('UPDATE lessons SET thumbnailUrl = ? WHERE id = ?', [url, lessonId]);
      updated++;
    }
  }
  console.log(`✅ Path I: 16 lesson thumbnails updated`);
  
  // ============================================================================
  // 4. Path IV-VI lesson thumbnails (Lecon_X.Y_Thumbnail.png)
  // ============================================================================
  // Get all lessons for Paths IV-VI and match by lesson number
  for (const courseId of [120004, 120005, 120006]) {
    const [lessons] = await conn.query(
      'SELECT l.id, l.title, cm.moduleNumber FROM lessons l JOIN course_modules cm ON l.moduleId = cm.id WHERE l.courseId = ? ORDER BY l.sortOrder',
      [courseId]
    );
    
    for (const lesson of lessons) {
      // Extract lesson number from title (e.g., "Lesson 13.1: ..." -> "13.1")
      const numMatch = lesson.title.match(/Lesson (\d+\.\d+)/);
      if (!numMatch) continue;
      
      const lessonNum = numMatch[1];
      const thumbKey = `Lecon_${lessonNum}_Thumbnail.png`;
      const url = mapping[thumbKey];
      
      if (url) {
        await conn.query('UPDATE lessons SET thumbnailUrl = ? WHERE id = ?', [url, lesson.id]);
        updated++;
      }
    }
    console.log(`✅ Course ${courseId}: lesson thumbnails updated`);
  }
  
  // ============================================================================
  // 5. Badge images for Path I
  // ============================================================================
  // Store badge URLs in the course pathCompletionBadgeUrl
  if (mapping['Path_I_realistic_badge_final.png']) {
    await conn.query('UPDATE courses SET pathCompletionBadgeUrl = ? WHERE id = 90007', [mapping['Path_I_realistic_badge_final.png']]);
    console.log('✅ Path I completion badge updated');
    updated++;
  }
  
  console.log(`\n✅ Total updates: ${updated}`);
  await conn.end();
}

main().catch(console.error);
