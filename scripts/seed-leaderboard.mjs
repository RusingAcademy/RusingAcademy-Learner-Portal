/**
 * Seed script to populate test users with XP, streaks, and badges for leaderboard testing
 * Run with: node scripts/seed-leaderboard.mjs
 */

import 'dotenv/config';
import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL not found in environment');
  process.exit(1);
}

// Parse DATABASE_URL
const url = new URL(DATABASE_URL);
const config = {
  host: url.hostname,
  port: parseInt(url.port) || 3306,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  ssl: { rejectUnauthorized: true }
};

// Test user data with varied XP levels
const testUsers = [
  { name: 'Marie Tremblay', email: 'marie.tremblay@test.gc.ca', xp: 4850, level: 8, streak: 45, longestStreak: 52 },
  { name: 'Jean-Pierre Dubois', email: 'jp.dubois@test.gc.ca', xp: 3920, level: 7, streak: 28, longestStreak: 35 },
  { name: 'Sarah Chen', email: 'sarah.chen@test.gc.ca', xp: 3450, level: 6, streak: 21, longestStreak: 21 },
  { name: 'Mohammed Al-Hassan', email: 'm.alhassan@test.gc.ca', xp: 2980, level: 5, streak: 14, longestStreak: 30 },
  { name: 'Emily Watson', email: 'e.watson@test.gc.ca', xp: 2650, level: 5, streak: 12, longestStreak: 18 },
  { name: 'François Leclerc', email: 'f.leclerc@test.gc.ca', xp: 2340, level: 4, streak: 9, longestStreak: 15 },
  { name: 'Priya Sharma', email: 'p.sharma@test.gc.ca', xp: 1980, level: 4, streak: 7, longestStreak: 12 },
  { name: 'David Kim', email: 'd.kim@test.gc.ca', xp: 1650, level: 3, streak: 5, longestStreak: 8 },
  { name: 'Isabelle Martin', email: 'i.martin@test.gc.ca', xp: 1320, level: 3, streak: 3, longestStreak: 7 },
  { name: 'Robert Thompson', email: 'r.thompson@test.gc.ca', xp: 980, level: 2, streak: 2, longestStreak: 5 },
  { name: 'Amélie Gagnon', email: 'a.gagnon@test.gc.ca', xp: 720, level: 2, streak: 1, longestStreak: 4 },
  { name: 'Michael Brown', email: 'm.brown@test.gc.ca', xp: 450, level: 1, streak: 0, longestStreak: 2 },
];

// Level titles based on XP
function getLevelTitle(level) {
  const titles = {
    1: 'Beginner',
    2: 'Novice',
    3: 'Apprentice',
    4: 'Intermediate',
    5: 'Advanced',
    6: 'Expert',
    7: 'Master',
    8: 'Champion',
    9: 'Legend',
    10: 'Grandmaster'
  };
  return titles[level] || 'Beginner';
}

// Badge types to award based on achievements
function getBadgesForUser(user) {
  const badges = [];
  
  // First lesson badge for everyone
  badges.push('first_lesson');
  
  // Streak badges
  if (user.longestStreak >= 3) badges.push('streak_3');
  if (user.longestStreak >= 7) badges.push('streak_7');
  if (user.longestStreak >= 14) badges.push('streak_14');
  if (user.longestStreak >= 30) badges.push('streak_30');
  
  // XP-based badges
  if (user.xp >= 500) badges.push('xp_500');
  if (user.xp >= 1000) badges.push('xp_1000');
  if (user.xp >= 2500) badges.push('xp_2500');
  if (user.xp >= 5000) badges.push('xp_5000');
  
  // Level badges
  if (user.level >= 5) badges.push('level_5');
  if (user.level >= 10) badges.push('level_10');
  
  // Random quiz badges for higher XP users
  if (user.xp >= 2000 && Math.random() > 0.5) badges.push('quiz_master');
  if (user.xp >= 1500 && Math.random() > 0.6) badges.push('perfect_score');
  
  return badges;
}

async function seedLeaderboard() {
  const connection = await mysql.createConnection(config);
  
  console.log('🌱 Starting leaderboard seed...\n');
  
  try {
    for (const userData of testUsers) {
      // Generate unique openId for test user
      const openId = `test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      
      // Insert user
      const [userResult] = await connection.execute(
        `INSERT INTO users (openId, name, email, role, avatarUrl, createdAt, updatedAt, lastSignedIn)
         VALUES (?, ?, ?, 'learner', ?, NOW(), NOW(), NOW())
         ON DUPLICATE KEY UPDATE name = VALUES(name)`,
        [openId, userData.name, userData.email, `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userData.name)}`]
      );
      
      const userId = userResult.insertId;
      
      if (userId) {
        // Calculate weekly and monthly XP (random portions of total)
        const weeklyXp = Math.floor(userData.xp * (0.1 + Math.random() * 0.15));
        const monthlyXp = Math.floor(userData.xp * (0.3 + Math.random() * 0.25));
        
        // Insert learner XP record
        await connection.execute(
          `INSERT INTO learner_xp (userId, totalXp, weeklyXp, monthlyXp, currentLevel, levelTitle, currentStreak, longestStreak, lastActivityDate, streakFreezeCount, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY), 2, NOW(), NOW())
           ON DUPLICATE KEY UPDATE totalXp = VALUES(totalXp), weeklyXp = VALUES(weeklyXp), monthlyXp = VALUES(monthlyXp)`,
          [userId, userData.xp, weeklyXp, monthlyXp, userData.level, getLevelTitle(userData.level), userData.streak, userData.longestStreak, userData.streak > 0 ? 0 : Math.floor(Math.random() * 7)]
        );
        
        // Insert badges for user
        const badges = getBadgesForUser(userData);
        for (const badgeType of badges) {
          try {
            await connection.execute(
              `INSERT INTO learner_badges (userId, badgeType, earnedAt, createdAt, updatedAt)
               VALUES (?, ?, DATE_SUB(NOW(), INTERVAL ? DAY), NOW(), NOW())
               ON DUPLICATE KEY UPDATE earnedAt = VALUES(earnedAt)`,
              [userId, badgeType, Math.floor(Math.random() * 60)]
            );
          } catch (e) {
            // Badge type might not exist, skip
          }
        }
        
        console.log(`✅ Created: ${userData.name} (Level ${userData.level}, ${userData.xp} XP, ${userData.streak} day streak, ${badges.length} badges)`);
      }
    }
    
    console.log('\n🎉 Leaderboard seed completed successfully!');
    console.log(`📊 Created ${testUsers.length} test users with XP and badges`);
    
  } catch (error) {
    console.error('❌ Error seeding leaderboard:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

seedLeaderboard().catch(console.error);
