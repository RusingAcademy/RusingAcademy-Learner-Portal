/**
 * PURGE STAGING STRUCTURES
 * ========================
 * Purpose: Clean shell/incoherent LMS structures on STAGING only.
 * Preserves: Users, sessions, user progress, XP, badges, coach profiles, platform settings.
 * Removes: Courses, modules, lessons, activities, quizzes, enrollments, paths — to rebuild from scratch.
 * 
 * IDEMPOTENT: Safe to run multiple times.
 * STAGING ONLY: Never run on production.
 * 
 * Usage: node scripts/purge-staging-structures.mjs [--dry-run] [--execute]
 *   --dry-run   (default) Show what would be deleted without executing
 *   --execute   Actually perform the purge
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

const DRY_RUN = !process.argv.includes('--execute');

async function main() {
  console.log('=== PURGE STAGING STRUCTURES ===');
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes)' : '⚠️  EXECUTE (destructive!)'}`);
  console.log('');

  const conn = await mysql.createConnection(process.env.DATABASE_URL);

  // Tables to purge (order matters for FK constraints)
  const PURGE_TABLES = [
    // Progress & completion (depends on activities/lessons)
    'activity_progress',
    'lesson_progress',
    'quiz_attempts',
    'practice_logs',
    
    // Enrollments
    'course_enrollments',
    'path_enrollments',
    'course_assignments',
    'org_course_assignments',
    
    // Reviews
    'course_reviews',
    'path_reviews',
    
    // Certificates (will be regenerated)
    'certificates',
    
    // Content analytics
    'content_analytics',
    
    // Quiz questions (will be regenerated)
    'quiz_questions',
    'quizzes',
    
    // SLE exam sessions (linked to lessons)
    'sle_exam_sessions',
    
    // Activities (slots)
    'activities',
    
    // Lessons
    'lessons',
    
    // Modules
    'course_modules',
    
    // Path-Course links
    'path_courses',
    
    // Courses
    'courses',
    
    // Learning Paths
    'learning_paths',
    
    // Drip content
    'drip_content',
    
    // Cohorts
    'cohort_members',
    'cohorts',
  ];

  // Tables to PRESERVE (user data, settings, etc.)
  const PRESERVE_TABLES = [
    'users',
    'user_sessions',
    'sessions',
    'learner_profiles',
    'learner_xp',
    'learner_badges',
    'user_badges',
    'user_xp',
    'user_streaks',
    'user_weekly_challenges',
    'weekly_challenges',
    'coach_profiles',
    'coach_applications',
    'coach_invitations',
    'platform_settings',
    'navigation_menus',
    'navigation_menu_items',
    'permissions',
    'roles',
    'role_permissions',
    'user_permissions',
    'email_templates',
    'email_verification_tokens',
    'password_reset_tokens',
    'notifications',
    'admin_activity_log',
    'admin_activity_logs',
    'admin_notifications',
    'audit_log',
    'badges',
    'onboarding_config',
    'onboarding_progress',
    'ecosystem_leads',
    'cms_pages',
    'cms_page_sections',
    'cms_page_versions',
    'cms_section_revisions',
    'cms_section_templates',
    'cms_style_presets',
    'media_library',
    'organizations',
    'org_members',
    'affiliates',
    'affiliate_referrals',
    'affiliate_earnings',
    'affiliate_payouts',
    'transactions',
    'coaching_plan_purchases',
    'payout_ledger',
    'webhook_events_log',
    'offers',
    'funnels',
    'automations',
    'ab_tests',
    'ai_sessions',
    'ai_pipeline_metrics',
    'analytics_events',
    'hr_audit_log',
    'sle_companion_sessions',
    'sle_companion_messages',
    'sle_practice_questions',
    'sle_practice_attempts',
    'review_schedule',
    '__drizzle_migrations',
  ];

  console.log('--- TABLES TO PURGE ---');
  for (const table of PURGE_TABLES) {
    try {
      const [rows] = await conn.query(`SELECT COUNT(*) as cnt FROM \`${table}\``);
      const count = rows[0].cnt;
      console.log(`  ${DRY_RUN ? '[DRY]' : '[DEL]'} ${table}: ${count} rows`);
      
      if (!DRY_RUN && count > 0) {
        await conn.query('SET FOREIGN_KEY_CHECKS=0');
        await conn.query(`DELETE FROM \`${table}\``);
        await conn.query('SET FOREIGN_KEY_CHECKS=1');
        console.log(`       → DELETED ${count} rows`);
      }
    } catch (err) {
      console.log(`  [SKIP] ${table}: ${err.message.includes('doesn\'t exist') ? 'table not found' : err.message}`);
    }
  }

  console.log('\n--- TABLES PRESERVED (not touched) ---');
  for (const table of PRESERVE_TABLES) {
    try {
      const [rows] = await conn.query(`SELECT COUNT(*) as cnt FROM \`${table}\``);
      console.log(`  [KEEP] ${table}: ${rows[0].cnt} rows`);
    } catch (err) {
      console.log(`  [N/A]  ${table}: not found`);
    }
  }

  if (DRY_RUN) {
    console.log('\n⚠️  DRY RUN complete. No data was modified.');
    console.log('   To execute: node scripts/purge-staging-structures.mjs --execute');
  } else {
    console.log('\n✅ PURGE COMPLETE. Staging is clean and ready for rebuild.');
  }

  await conn.end();
}

main().catch(err => {
  console.error('Purge failed:', err.message);
  process.exit(1);
});
