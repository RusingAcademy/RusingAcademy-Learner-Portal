/**
 * Populate French translations for all activities.
 * 
 * Since the course content is already written in French, we:
 * 1. Copy title → titleFr for all activities
 * 2. Copy content → contentFr for all activities
 * 3. Copy description → descriptionFr for all activities
 * 
 * This ensures the bilingual toggle in the learner portal works immediately.
 */
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log('=== Populating French Translations for Activities ===\n');
  
  // Step 1: Copy title → titleFr
  const [titleResult] = await conn.query(`
    UPDATE activities 
    SET titleFr = title 
    WHERE titleFr IS NULL OR titleFr = ''
  `);
  console.log(`✓ titleFr populated: ${titleResult.affectedRows} activities updated`);
  
  // Step 2: Copy content → contentFr
  const [contentResult] = await conn.query(`
    UPDATE activities 
    SET contentFr = content 
    WHERE (contentFr IS NULL OR contentFr = '') AND content IS NOT NULL
  `);
  console.log(`✓ contentFr populated: ${contentResult.affectedRows} activities updated`);
  
  // Step 3: Copy description → descriptionFr
  const [descResult] = await conn.query(`
    UPDATE activities 
    SET descriptionFr = description 
    WHERE (descriptionFr IS NULL OR descriptionFr = '') AND description IS NOT NULL
  `);
  console.log(`✓ descriptionFr populated: ${descResult.affectedRows} activities updated`);
  
  // Step 4: Also populate French fields for courses
  const [courseResult] = await conn.query(`
    UPDATE courses 
    SET titleFr = title 
    WHERE titleFr IS NULL OR titleFr = ''
  `);
  console.log(`✓ Course titleFr populated: ${courseResult.affectedRows} courses updated`);
  
  const [courseDescResult] = await conn.query(`
    UPDATE courses 
    SET descriptionFr = description 
    WHERE (descriptionFr IS NULL OR descriptionFr = '') AND description IS NOT NULL
  `);
  console.log(`✓ Course descriptionFr populated: ${courseDescResult.affectedRows} courses updated`);
  
  const [courseShortDescResult] = await conn.query(`
    UPDATE courses 
    SET shortDescriptionFr = shortDescription 
    WHERE (shortDescriptionFr IS NULL OR shortDescriptionFr = '') AND shortDescription IS NOT NULL
  `);
  console.log(`✓ Course shortDescriptionFr populated: ${courseShortDescResult.affectedRows} courses updated`);
  
  // Step 5: Populate French fields for course_modules
  const [moduleResult] = await conn.query(`
    UPDATE course_modules 
    SET titleFr = title 
    WHERE titleFr IS NULL OR titleFr = ''
  `);
  console.log(`✓ Module titleFr populated: ${moduleResult.affectedRows} modules updated`);
  
  const [moduleDescResult] = await conn.query(`
    UPDATE course_modules 
    SET descriptionFr = description 
    WHERE (descriptionFr IS NULL OR descriptionFr = '') AND description IS NOT NULL
  `);
  console.log(`✓ Module descriptionFr populated: ${moduleDescResult.affectedRows} modules updated`);
  
  // Step 6: Populate French fields for lessons
  // Check if lessons table has titleFr column
  try {
    const [lessonResult] = await conn.query(`
      UPDATE lessons 
      SET titleFr = title 
      WHERE titleFr IS NULL OR titleFr = ''
    `);
    console.log(`✓ Lesson titleFr populated: ${lessonResult.affectedRows} lessons updated`);
  } catch (e) {
    console.log(`⚠ Lessons table may not have titleFr column: ${e.message}`);
  }
  
  try {
    const [lessonDescResult] = await conn.query(`
      UPDATE lessons 
      SET descriptionFr = description 
      WHERE (descriptionFr IS NULL OR descriptionFr = '') AND description IS NOT NULL
    `);
    console.log(`✓ Lesson descriptionFr populated: ${lessonDescResult.affectedRows} lessons updated`);
  } catch (e) {
    console.log(`⚠ Lessons table may not have descriptionFr column: ${e.message}`);
  }
  
  // Verification
  console.log('\n=== Verification ===');
  const [verify] = await conn.query(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN titleFr IS NOT NULL AND titleFr != '' THEN 1 ELSE 0 END) as has_titleFr,
      SUM(CASE WHEN contentFr IS NOT NULL AND contentFr != '' THEN 1 ELSE 0 END) as has_contentFr,
      SUM(CASE WHEN descriptionFr IS NOT NULL AND descriptionFr != '' THEN 1 ELSE 0 END) as has_descFr
    FROM activities
  `);
  console.log(`Activities: ${verify[0].total} total`);
  console.log(`  titleFr: ${verify[0].has_titleFr}/${verify[0].total}`);
  console.log(`  contentFr: ${verify[0].has_contentFr}/${verify[0].total}`);
  console.log(`  descriptionFr: ${verify[0].has_descFr}/${verify[0].total}`);
  
  console.log('\n✅ French translations populated successfully!');
  
  await conn.end();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
