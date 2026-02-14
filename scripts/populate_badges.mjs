import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// Badge URLs from the premium assets upload
// These were uploaded to S3 earlier - we need to find them
// The pattern is: path_completion badge per course, module badge per module

// First let's check if badge files were uploaded by looking at the upload log
// Badge filenames: path_badge.jpg (per path), module_X_badge.jpg (per module)

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  // Check if there are any badge URLs stored somewhere in the lessons/activities
  // The badges were uploaded to S3 but we need the CDN URLs
  // Let's check the thumbnailUrl patterns to find the CDN base URL
  const [sample] = await conn.query("SELECT thumbnailUrl FROM courses WHERE thumbnailUrl IS NOT NULL LIMIT 1");
  if (sample.length > 0) {
    console.log("CDN URL pattern:", sample[0].thumbnailUrl);
  }
  
  // Check lesson thumbnails for the CDN base
  const [lessonSample] = await conn.query("SELECT thumbnailUrl FROM lessons WHERE thumbnailUrl IS NOT NULL LIMIT 5");
  for (const l of lessonSample) {
    console.log("Lesson thumbnail:", l.thumbnailUrl);
  }
  
  await conn.end();
}
main().catch(console.error);
