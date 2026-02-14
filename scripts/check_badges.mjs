import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  const [courses] = await conn.query('SELECT id, title, pathCompletionBadgeUrl FROM courses ORDER BY id');
  for (const c of courses) {
    console.log(`Course ${c.id}: ${c.title.substring(0, 40)} | badge: ${c.pathCompletionBadgeUrl ? 'YES' : 'NO'}`);
  }
  
  const [modules] = await conn.query('SELECT id, courseId, title, badgeImageUrl FROM course_modules ORDER BY courseId, sortOrder');
  for (const m of modules) {
    console.log(`  Module ${m.id} (course ${m.courseId}): ${m.title.substring(0, 30)} | badge: ${m.badgeImageUrl ? 'YES' : 'NO'}`);
  }
  
  await conn.end();
}
main().catch(console.error);
