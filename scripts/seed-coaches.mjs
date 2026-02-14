/**
 * Seed script for coaches data
 * Run with: node scripts/seed-coaches.mjs
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const coaches = [
  {
    name: "Victor Amisi",
    email: "victor.amisi@lingueefy.com",
    slug: "victor-amisi",
    headline: "BBB/CBC Preparation | Oral Exam Simulation",
    bio: "Expert en préparation aux examens SLE avec plus de 10 ans d'expérience dans la fonction publique fédérale. Spécialisé dans les simulations d'examens oraux et la préparation aux niveaux B et C. Mon approche personnalisée aide les fonctionnaires à atteindre leurs objectifs linguistiques avec confiance.",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    languages: "both",
    specializations: { oral_a: false, oral_b: true, oral_c: true, written_a: false, written_b: true, written_c: false, reading: false, anxiety_coaching: false },
    hourlyRate: 6000,
    trialRate: 3000,
    totalSessions: 310,
    totalStudents: 85,
    averageRating: 4.8,
    totalReviews: 127,
    successRate: 94,
    responseTimeHours: 24,
    yearsExperience: 10,
  },
  {
    name: "Preciosa Baganha",
    email: "preciosa.baganha@lingueefy.com",
    slug: "preciosa-baganha",
    headline: "Written Expression Expert | Grammar & Syntax Specialist",
    bio: "Professeure certifiée avec une maîtrise en linguistique française. Je me spécialise dans l'expression écrite et aide les apprenants à maîtriser la grammaire, la syntaxe et le style professionnel requis pour les examens SLE écrits. Mon approche structurée garantit des résultats mesurables.",
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
    languages: "french",
    specializations: { oral_a: false, oral_b: false, oral_c: false, written_a: true, written_b: true, written_c: true, reading: true, anxiety_coaching: false },
    hourlyRate: 5800,
    trialRate: 2900,
    totalSessions: 245,
    totalStudents: 62,
    averageRating: 4.7,
    totalReviews: 89,
    successRate: 92,
    responseTimeHours: 12,
    yearsExperience: 8,
  },
  {
    name: "Steven Barholere",
    email: "steven.barholere@lingueefy.com",
    slug: "steven-barholere",
    headline: "Founder & Lead Coach | SLE Strategy Expert",
    bio: "Fondateur de RusingÂcademy et expert en stratégies d'apprentissage des langues. Avec plus de 15 ans d'expérience dans l'enseignement du français et de l'anglais aux fonctionnaires fédéraux, j'ai développé des méthodes éprouvées pour réussir les examens SLE à tous les niveaux.",
    photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    languages: "both",
    specializations: { oral_a: true, oral_b: true, oral_c: true, written_a: true, written_b: true, written_c: true, reading: true, anxiety_coaching: true },
    hourlyRate: 7500,
    trialRate: 3500,
    totalSessions: 520,
    totalStudents: 150,
    averageRating: 4.9,
    totalReviews: 203,
    successRate: 97,
    responseTimeHours: 6,
    yearsExperience: 15,
  },
  {
    name: "Sue-Anne Richer",
    email: "sue-anne.richer@lingueefy.com",
    slug: "sue-anne-richer",
    headline: "Oral Communication Specialist | Confidence Builder",
    bio: "Coach certifiée en communication orale avec une passion pour aider les apprenants à surmonter leur anxiété linguistique. Mon approche bienveillante et mes techniques de relaxation aident mes étudiants à performer avec confiance lors de leurs examens oraux SLE.",
    photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face",
    languages: "french",
    specializations: { oral_a: true, oral_b: true, oral_c: true, written_a: false, written_b: false, written_c: false, reading: false, anxiety_coaching: true },
    hourlyRate: 5500,
    trialRate: 2750,
    totalSessions: 180,
    totalStudents: 48,
    averageRating: 4.9,
    totalReviews: 76,
    successRate: 95,
    responseTimeHours: 18,
    yearsExperience: 7,
  },
  {
    name: "Erika Seguin",
    email: "erika.seguin@lingueefy.com",
    slug: "erika-seguin",
    headline: "Reading Comprehension Expert | Test Strategies",
    bio: "Spécialiste en compréhension de lecture avec une expertise particulière dans les stratégies de test. J'aide mes étudiants à développer des techniques efficaces pour analyser et comprendre rapidement les textes complexes requis pour les examens SLE de lecture.",
    photoUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    languages: "both",
    specializations: { oral_a: false, oral_b: false, oral_c: false, written_a: false, written_b: true, written_c: false, reading: true, anxiety_coaching: false },
    hourlyRate: 5200,
    trialRate: 2600,
    totalSessions: 156,
    totalStudents: 42,
    averageRating: 4.6,
    totalReviews: 58,
    successRate: 91,
    responseTimeHours: 24,
    yearsExperience: 5,
  },
  {
    name: "Marie-Claire Dubois",
    email: "marie-claire.dubois@lingueefy.com",
    slug: "marie-claire-dubois",
    headline: "French Immersion Specialist | Cultural Integration",
    bio: "Native francophone avec une expertise en immersion linguistique. Je combine l'apprentissage de la langue avec la compréhension culturelle pour offrir une expérience d'apprentissage complète. Idéal pour les anglophones souhaitant maîtriser le français professionnel.",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
    languages: "french",
    specializations: { oral_a: true, oral_b: true, oral_c: false, written_a: true, written_b: true, written_c: false, reading: true, anxiety_coaching: false },
    hourlyRate: 5000,
    trialRate: 2500,
    totalSessions: 198,
    totalStudents: 55,
    averageRating: 4.7,
    totalReviews: 71,
    successRate: 89,
    responseTimeHours: 12,
    yearsExperience: 6,
  },
  {
    name: "David Thompson",
    email: "david.thompson@lingueefy.com",
    slug: "david-thompson",
    headline: "English Language Coach | Business Communication",
    bio: "Coach anglophone spécialisé dans la communication professionnelle en anglais. J'aide les francophones à perfectionner leur anglais écrit et oral pour les examens SLE et les communications professionnelles quotidiennes dans la fonction publique.",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
    languages: "english",
    specializations: { oral_a: true, oral_b: true, oral_c: true, written_a: true, written_b: true, written_c: true, reading: true, anxiety_coaching: false },
    hourlyRate: 5500,
    trialRate: 2750,
    totalSessions: 142,
    totalStudents: 38,
    averageRating: 4.8,
    totalReviews: 52,
    successRate: 93,
    responseTimeHours: 24,
    yearsExperience: 9,
  },
];

async function seedCoaches() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log('🌱 Starting coaches seed...\n');
  
  try {
    for (const coach of coaches) {
      // Generate a unique openId for each coach user
      const openId = `seed_coach_${coach.slug}_${Date.now()}`;
      
      // 1. Insert user (note: avatarUrl is not in the users table, it's in coach_profiles as photoUrl)
      console.log(`Creating user: ${coach.name}...`);
      const [userResult] = await connection.execute(
        `INSERT INTO users (openId, name, email, role, createdAt, updatedAt, lastSignedIn)
         VALUES (?, ?, ?, 'coach', NOW(), NOW(), NOW())`,
        [openId, coach.name, coach.email]
      );
      
      const userId = userResult.insertId;
      console.log(`  ✓ User created with ID: ${userId}`);
      
      // 2. Insert coach profile
      console.log(`Creating coach profile: ${coach.slug}...`);
      await connection.execute(
        `INSERT INTO coach_profiles (
          userId, slug, headline, bio, photoUrl, languages, specializations,
          hourlyRate, trialRate, totalSessions, totalStudents, averageRating,
          totalReviews, successRate, responseTimeHours, yearsExperience,
          status, profileComplete, approvedAt, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', true, NOW(), NOW(), NOW())`,
        [
          userId,
          coach.slug,
          coach.headline,
          coach.bio,
          coach.photoUrl,
          coach.languages,
          JSON.stringify(coach.specializations),
          coach.hourlyRate,
          coach.trialRate,
          coach.totalSessions,
          coach.totalStudents,
          coach.averageRating,
          coach.totalReviews,
          coach.successRate,
          coach.responseTimeHours,
          coach.yearsExperience,
        ]
      );
      console.log(`  ✓ Coach profile created: ${coach.slug}\n`);
    }
    
    console.log('✅ All coaches seeded successfully!');
    console.log(`Total coaches added: ${coaches.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding coaches:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

seedCoaches().catch(console.error);
