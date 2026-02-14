/**
 * Seed Demo Data Script
 * Creates sample coaches, learners, and sessions for demonstration
 * Run with: node scripts/seed-demo-data.mjs
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

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

async function seedDemoData() {
  const connection = await mysql.createConnection(config);
  
  try {
    console.log('🌱 Starting demo data seed...\n');
    
    // ========================================
    // 1. Create Demo Users
    // ========================================
    console.log('👤 Creating demo users...');
    
    const demoUsers = [
      // Coaches
      { openId: 'demo-coach-1', name: 'Marie Dubois', email: 'marie.dubois@demo.com', role: 'coach', preferredLanguage: 'fr' },
      { openId: 'demo-coach-2', name: 'Jean-Pierre Martin', email: 'jp.martin@demo.com', role: 'coach', preferredLanguage: 'fr' },
      { openId: 'demo-coach-3', name: 'Sarah Thompson', email: 'sarah.thompson@demo.com', role: 'coach', preferredLanguage: 'en' },
      // Learners
      { openId: 'demo-learner-1', name: 'Alex Chen', email: 'alex.chen@demo.com', role: 'learner', preferredLanguage: 'en' },
      { openId: 'demo-learner-2', name: 'Emma Wilson', email: 'emma.wilson@demo.com', role: 'learner', preferredLanguage: 'en' },
      { openId: 'demo-learner-3', name: 'François Tremblay', email: 'f.tremblay@demo.com', role: 'learner', preferredLanguage: 'fr' },
      { openId: 'demo-learner-4', name: 'Priya Sharma', email: 'priya.sharma@demo.com', role: 'learner', preferredLanguage: 'en' },
      { openId: 'demo-learner-5', name: 'Michael Brown', email: 'michael.brown@demo.com', role: 'learner', preferredLanguage: 'en' },
    ];
    
    for (const user of demoUsers) {
      await connection.execute(
        `INSERT INTO users (openId, name, email, role, preferredLanguage, createdAt, updatedAt, lastSignedIn)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW(), NOW())
         ON DUPLICATE KEY UPDATE name = VALUES(name), email = VALUES(email)`,
        [user.openId, user.name, user.email, user.role, user.preferredLanguage]
      );
    }
    console.log(`   ✅ Created ${demoUsers.length} demo users\n`);
    
    // Get user IDs
    const [userRows] = await connection.execute(
      `SELECT id, openId, role FROM users WHERE openId LIKE 'demo-%'`
    );
    const userMap = {};
    userRows.forEach(u => { userMap[u.openId] = u.id; });
    
    // ========================================
    // 2. Create Coach Profiles
    // ========================================
    console.log('🎓 Creating coach profiles...');
    
    const coachProfiles = [
      {
        userId: userMap['demo-coach-1'],
        slug: 'marie-dubois',
        headline: 'Expert SLE Oral - 15 ans d\'expérience',
        bio: 'Ancienne examinatrice SLE avec plus de 15 ans d\'expérience dans la préparation aux examens oraux. Spécialisée dans les niveaux B et C.',
        city: 'Ottawa',
        province: 'ON',
        languages: 'french',
        yearsExperience: 15,
        hourlyRate: 7500,
        trialRate: 3500,
        status: 'approved',
        totalSessions: 245,
        totalStudents: 89,
        averageRating: 4.92,
        totalReviews: 67,
        successRate: 94
      },
      {
        userId: userMap['demo-coach-2'],
        slug: 'jean-pierre-martin',
        headline: 'Coach bilingue - Expression écrite et orale',
        bio: 'Professeur de français certifié avec une approche personnalisée. Je vous aide à développer votre confiance et vos compétences linguistiques.',
        city: 'Gatineau',
        province: 'QC',
        languages: 'both',
        yearsExperience: 10,
        hourlyRate: 6500,
        trialRate: 3000,
        status: 'approved',
        totalSessions: 178,
        totalStudents: 56,
        averageRating: 4.85,
        totalReviews: 43,
        successRate: 91
      },
      {
        userId: userMap['demo-coach-3'],
        slug: 'sarah-thompson',
        headline: 'English SLE Specialist - Reading & Writing',
        bio: 'Specialized in helping francophone public servants achieve their English SLE levels. Patient, structured approach with proven results.',
        city: 'Toronto',
        province: 'ON',
        languages: 'english',
        yearsExperience: 8,
        hourlyRate: 7000,
        trialRate: 3500,
        status: 'approved',
        totalSessions: 134,
        totalStudents: 42,
        averageRating: 4.88,
        totalReviews: 38,
        successRate: 89
      }
    ];
    
    for (const profile of coachProfiles) {
      await connection.execute(
        `INSERT INTO coach_profiles (userId, slug, headline, bio, city, province, languages, yearsExperience, hourlyRate, trialRate, status, totalSessions, totalStudents, averageRating, totalReviews, successRate, approvedAt, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())
         ON DUPLICATE KEY UPDATE headline = VALUES(headline)`,
        [profile.userId, profile.slug, profile.headline, profile.bio, profile.city, profile.province, profile.languages, profile.yearsExperience, profile.hourlyRate, profile.trialRate, profile.status, profile.totalSessions, profile.totalStudents, profile.averageRating, profile.totalReviews, profile.successRate]
      );
    }
    console.log(`   ✅ Created ${coachProfiles.length} coach profiles\n`);
    
    // Get coach profile IDs
    const [coachRows] = await connection.execute(
      `SELECT id, slug FROM coach_profiles WHERE slug LIKE '%dubois%' OR slug LIKE '%martin%' OR slug LIKE '%thompson%'`
    );
    const coachMap = {};
    coachRows.forEach(c => { coachMap[c.slug] = c.id; });
    
    // ========================================
    // 3. Create Learner Profiles
    // ========================================
    console.log('📚 Creating learner profiles...');
    
    const learnerProfiles = [
      {
        userId: userMap['demo-learner-1'],
        department: 'Treasury Board Secretariat',
        position: 'Policy Analyst',
        currentLevel: JSON.stringify({ reading: 'B', writing: 'A', oral: 'A' }),
        targetLevel: JSON.stringify({ reading: 'C', writing: 'B', oral: 'B' }),
        primaryFocus: 'oral',
        targetLanguage: 'french',
        totalSessions: 12,
        currentStreak: 3
      },
      {
        userId: userMap['demo-learner-2'],
        department: 'Immigration, Refugees and Citizenship Canada',
        position: 'Program Officer',
        currentLevel: JSON.stringify({ reading: 'B', writing: 'B', oral: 'A' }),
        targetLevel: JSON.stringify({ reading: 'C', writing: 'C', oral: 'B' }),
        primaryFocus: 'written',
        targetLanguage: 'french',
        totalSessions: 8,
        currentStreak: 2
      },
      {
        userId: userMap['demo-learner-3'],
        department: 'Emploi et Développement social Canada',
        position: 'Conseiller principal',
        currentLevel: JSON.stringify({ reading: 'C', writing: 'B', oral: 'B' }),
        targetLevel: JSON.stringify({ reading: 'C', writing: 'C', oral: 'C' }),
        primaryFocus: 'oral',
        targetLanguage: 'english',
        totalSessions: 15,
        currentStreak: 5
      },
      {
        userId: userMap['demo-learner-4'],
        department: 'Health Canada',
        position: 'Senior Advisor',
        currentLevel: JSON.stringify({ reading: 'A', writing: 'A', oral: 'X' }),
        targetLevel: JSON.stringify({ reading: 'B', writing: 'B', oral: 'B' }),
        primaryFocus: 'all',
        targetLanguage: 'french',
        totalSessions: 4,
        currentStreak: 1
      },
      {
        userId: userMap['demo-learner-5'],
        department: 'Public Services and Procurement Canada',
        position: 'Project Manager',
        currentLevel: JSON.stringify({ reading: 'B', writing: 'A', oral: 'B' }),
        targetLevel: JSON.stringify({ reading: 'C', writing: 'B', oral: 'C' }),
        primaryFocus: 'oral',
        targetLanguage: 'french',
        totalSessions: 20,
        currentStreak: 4
      }
    ];
    
    for (const profile of learnerProfiles) {
      await connection.execute(
        `INSERT INTO learner_profiles (userId, department, position, currentLevel, targetLevel, primaryFocus, targetLanguage, totalSessions, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
         ON DUPLICATE KEY UPDATE department = VALUES(department)`,
        [profile.userId, profile.department, profile.position, profile.currentLevel, profile.targetLevel, profile.primaryFocus, profile.targetLanguage, profile.totalSessions]
      );
    }
    console.log(`   ✅ Created ${learnerProfiles.length} learner profiles\n`);
    
    // Get learner profile IDs
    const [learnerRows] = await connection.execute(
      `SELECT lp.id, u.openId FROM learner_profiles lp JOIN users u ON lp.userId = u.id WHERE u.openId LIKE 'demo-learner-%'`
    );
    const learnerMap = {};
    learnerRows.forEach(l => { learnerMap[l.openId] = l.id; });
    
    // ========================================
    // 4. Create Demo Sessions
    // ========================================
    console.log('📅 Creating demo sessions...');
    
    const now = new Date();
    const sessions = [
      // Upcoming sessions
      {
        coachId: coachMap['marie-dubois'],
        learnerId: learnerMap['demo-learner-1'],
        scheduledAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // +2 days
        duration: 60,
        sessionType: 'single',
        focusArea: 'oral_b',
        status: 'confirmed',
        price: 7500
      },
      {
        coachId: coachMap['jean-pierre-martin'],
        learnerId: learnerMap['demo-learner-2'],
        scheduledAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // +3 days
        duration: 60,
        sessionType: 'single',
        focusArea: 'written',
        status: 'confirmed',
        price: 6500
      },
      {
        coachId: coachMap['sarah-thompson'],
        learnerId: learnerMap['demo-learner-3'],
        scheduledAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // +5 days
        duration: 60,
        sessionType: 'trial',
        focusArea: 'oral_c',
        status: 'pending',
        price: 3500
      },
      // Past completed sessions
      {
        coachId: coachMap['marie-dubois'],
        learnerId: learnerMap['demo-learner-4'],
        scheduledAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // -7 days
        duration: 60,
        sessionType: 'trial',
        focusArea: 'general',
        status: 'completed',
        price: 3500
      },
      {
        coachId: coachMap['jean-pierre-martin'],
        learnerId: learnerMap['demo-learner-5'],
        scheduledAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // -3 days
        duration: 60,
        sessionType: 'single',
        focusArea: 'oral_b',
        status: 'completed',
        price: 6500
      }
    ];
    
    for (const session of sessions) {
      await connection.execute(
        `INSERT INTO sessions (coachId, learnerId, scheduledAt, duration, sessionType, focusArea, status, price, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [session.coachId, session.learnerId, session.scheduledAt, session.duration, session.sessionType, session.focusArea, session.status, session.price]
      );
    }
    console.log(`   ✅ Created ${sessions.length} demo sessions\n`);
    
    // ========================================
    // Summary
    // ========================================
    console.log('🎉 Demo data seed completed successfully!\n');
    console.log('Summary:');
    console.log(`   • ${demoUsers.filter(u => u.role === 'coach').length} coaches`);
    console.log(`   • ${demoUsers.filter(u => u.role === 'learner').length} learners`);
    console.log(`   • ${sessions.length} sessions (${sessions.filter(s => s.status === 'confirmed' || s.status === 'pending').length} upcoming, ${sessions.filter(s => s.status === 'completed').length} completed)`);
    
  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

seedDemoData().catch(console.error);
