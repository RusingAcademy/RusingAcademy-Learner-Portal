import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import { sql } from 'drizzle-orm';
const db = drizzle(process.env.DATABASE_URL);

// Check activities per lesson distribution
const [actPerLesson] = await db.execute(sql.raw('SELECT lessonId, COUNT(*) as cnt FROM activities GROUP BY lessonId'));
const counts = actPerLesson.map(r => r.cnt);
const allSeven = counts.every(c => c === 7);
console.log('Total lessons with activities:', counts.length);
console.log('All lessons have exactly 7 activities:', allSeven);
if (!allSeven) {
  const bad = actPerLesson.filter(r => r.cnt !== 7);
  bad.forEach(r => console.log('  Lesson', r.lessonId, 'has', r.cnt, 'activities'));
}

// Check quiz questions per lesson
const [quizPerLesson] = await db.execute(sql.raw('SELECT lessonId, COUNT(*) as cnt FROM quiz_questions GROUP BY lessonId'));
const qCounts = quizPerLesson.map(r => r.cnt);
const allEight = qCounts.every(c => c === 8);
console.log('Total lessons with quiz questions:', qCounts.length);
console.log('All lessons have exactly 8 quiz questions:', allEight);

// Check slot types
const [slotTypes] = await db.execute(sql.raw('SELECT slotIndex, slotType, COUNT(*) as cnt FROM activities GROUP BY slotIndex, slotType ORDER BY slotIndex'));
console.log('\nSlot distribution:');
slotTypes.forEach(r => console.log('  Slot', r.slotIndex, r.slotType, ':', r.cnt));

// Check bilingual content
const [bilingualCheck] = await db.execute(sql.raw('SELECT COUNT(*) as cnt FROM activities WHERE content IS NOT NULL AND contentFr IS NOT NULL'));
console.log('\nActivities with both EN and FR content:', bilingualCheck[0].cnt, '/ 672');

// Check courses have correct module/lesson counts
const [courseStats] = await db.execute(sql.raw(`
  SELECT c.id, c.title, c.totalModules, c.totalLessons, c.totalActivities,
    (SELECT COUNT(*) FROM course_modules WHERE courseId = c.id) as actualModules,
    (SELECT COUNT(*) FROM lessons WHERE courseId = c.id) as actualLessons,
    (SELECT COUNT(*) FROM activities WHERE courseId = c.id) as actualActivities
  FROM courses c ORDER BY c.id
`));
console.log('\nCourse integrity:');
courseStats.forEach(r => {
  const ok = r.totalModules == r.actualModules && r.totalLessons == r.actualLessons && r.totalActivities == r.actualActivities;
  console.log(`  ${r.title}: ${ok ? 'OK' : 'MISMATCH'} (M:${r.actualModules}/${r.totalModules}, L:${r.actualLessons}/${r.totalLessons}, A:${r.actualActivities}/${r.totalActivities})`);
});

// Check learning paths
const [paths] = await db.execute(sql.raw('SELECT lp.id, lp.title, lp.slug, pc.courseId FROM learning_paths lp LEFT JOIN path_courses pc ON lp.id = pc.pathId ORDER BY lp.id'));
console.log('\nLearning Paths:');
paths.forEach(r => console.log(`  ${r.title} (${r.slug}) -> course ${r.courseId}`));

console.log('\n=== VERIFICATION COMPLETE ===');
process.exit(0);
