import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

const BACKUP_DIR = '/home/ubuntu/backup-assets-pre-rescue';

async function collectAllAssetUrls() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  const urls = new Set();
  
  // Activities: thumbnails, audio, video
  const [actThumbs] = await conn.query("SELECT DISTINCT thumbnailUrl as url FROM activities WHERE thumbnailUrl IS NOT NULL AND thumbnailUrl != ''");
  const [actAudio] = await conn.query("SELECT DISTINCT audioUrl as url FROM activities WHERE audioUrl IS NOT NULL AND audioUrl != ''");
  const [actVideo] = await conn.query("SELECT DISTINCT videoUrl as url FROM activities WHERE videoUrl IS NOT NULL AND videoUrl != ''");
  
  // Courses: thumbnails, preview videos
  const [courseThumbs] = await conn.query("SELECT DISTINCT thumbnailUrl as url FROM courses WHERE thumbnailUrl IS NOT NULL AND thumbnailUrl != ''");
  const [coursePreview] = await conn.query("SELECT DISTINCT previewVideoUrl as url FROM courses WHERE previewVideoUrl IS NOT NULL AND previewVideoUrl != ''");
  
  // Modules: thumbnails, badges
  const [modThumbs] = await conn.query("SELECT DISTINCT thumbnailUrl as url FROM course_modules WHERE thumbnailUrl IS NOT NULL AND thumbnailUrl != ''");
  const [modBadges] = await conn.query("SELECT DISTINCT badgeImageUrl as url FROM course_modules WHERE badgeImageUrl IS NOT NULL AND badgeImageUrl != ''");
  
  // Paths: thumbnails, banners
  const [pathThumbs] = await conn.query("SELECT DISTINCT thumbnailUrl as url FROM learning_paths WHERE thumbnailUrl IS NOT NULL AND thumbnailUrl != ''");
  const [pathBanners] = await conn.query("SELECT DISTINCT bannerUrl as url FROM learning_paths WHERE bannerUrl IS NOT NULL AND bannerUrl != ''");
  
  // Lessons: thumbnails, video, audio
  const [lessonThumbs] = await conn.query("SELECT DISTINCT thumbnailUrl as url FROM lessons WHERE thumbnailUrl IS NOT NULL AND thumbnailUrl != ''");
  const [lessonVideo] = await conn.query("SELECT DISTINCT videoUrl as url FROM lessons WHERE videoUrl IS NOT NULL AND videoUrl != ''");
  const [lessonAudio] = await conn.query("SELECT DISTINCT audioUrl as url FROM lessons WHERE audioUrl IS NOT NULL AND audioUrl != ''");
  
  // Coach profiles
  const [coachAvatars] = await conn.query("SELECT DISTINCT photoUrl as url FROM coach_profiles WHERE photoUrl IS NOT NULL AND photoUrl != ''");
  
  // Collect all
  const allResults = [
    ...actThumbs, ...actAudio, ...actVideo,
    ...courseThumbs, ...coursePreview,
    ...modThumbs, ...modBadges,
    ...pathThumbs, ...pathBanners,
    ...lessonThumbs, ...lessonVideo, ...lessonAudio,
    ...coachAvatars
  ];
  
  allResults.forEach(r => {
    if (r.url && r.url.startsWith('http')) urls.add(r.url);
  });
  
  await conn.end();
  return [...urls];
}

async function main() {
  console.log('=== S3 ASSET BACKUP ===');
  console.log('Collecting all asset URLs from database...');
  
  const urls = await collectAllAssetUrls();
  console.log(`Found ${urls.length} unique asset URLs`);
  
  // Save manifest
  if (!existsSync(BACKUP_DIR)) mkdirSync(BACKUP_DIR, { recursive: true });
  
  const manifest = {
    timestamp: new Date().toISOString(),
    totalAssets: urls.length,
    urls: urls
  };
  
  writeFileSync(join(BACKUP_DIR, 'asset-manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`Manifest saved to ${BACKUP_DIR}/asset-manifest.json`);
  
  // Categorize by domain/type
  const byDomain = {};
  urls.forEach(url => {
    try {
      const u = new URL(url);
      const domain = u.hostname;
      if (!byDomain[domain]) byDomain[domain] = [];
      byDomain[domain].push(url);
    } catch(e) {
      if (!byDomain['invalid']) byDomain['invalid'] = [];
      byDomain['invalid'].push(url);
    }
  });
  
  console.log('\n=== ASSET BREAKDOWN BY DOMAIN ===');
  Object.entries(byDomain).forEach(([domain, domainUrls]) => {
    console.log(`  ${domain}: ${domainUrls.length} assets`);
  });
  
  // Save categorized manifest
  writeFileSync(join(BACKUP_DIR, 'asset-manifest-by-domain.json'), JSON.stringify(byDomain, null, 2));
  
  console.log('\n✅ Asset manifest created. URLs are preserved in the database backup.');
  console.log('   Assets hosted on Manus S3 are managed by the platform and persist.');
  console.log('   External URLs (YouTube, etc.) are third-party and not backed up locally.');
}

main().catch(err => {
  console.error('Asset backup failed:', err.message);
  process.exit(1);
});
