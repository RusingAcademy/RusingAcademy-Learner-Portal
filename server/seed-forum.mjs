// Seed script for forum categories and community events
import { createPool } from 'mysql2/promise';
import 'dotenv/config';

const pool = createPool({
  uri: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function seed() {
  const connection = await pool.getConnection();
  
  try {
    console.log('Seeding forum categories...');
    
    // Insert forum categories
    await connection.execute(`
      INSERT INTO forum_categories (name, nameFr, description, descriptionFr, slug, icon, color, sortOrder, threadCount, postCount, isActive)
      VALUES 
        ('General Discussion', 'Discussion générale', 'Share experiences, ask questions, and connect with the community', 'Partagez vos expériences, posez des questions et connectez-vous avec la communauté', 'general', '💬', '#17E2C6', 1, 234, 1892, true),
        ('SLE Exam Preparation', 'Préparation aux examens ELS', 'Tips, resources, and support for SLE exam success', 'Conseils, ressources et soutien pour réussir les examens ELS', 'sle-prep', '🏆', '#1E9B8A', 2, 156, 1245, true),
        ('Practice Partners', 'Partenaires de pratique', 'Find conversation partners and study buddies', 'Trouvez des partenaires de conversation et des camarades d\\'étude', 'practice', '🎤', '#D4A853', 3, 89, 567, true),
        ('Success Stories', 'Histoires de réussite', 'Celebrate achievements and inspire others', 'Célébrez les réussites et inspirez les autres', 'success', '⭐', '#FF6B6B', 4, 78, 423, true)
      ON DUPLICATE KEY UPDATE name=VALUES(name)
    `);
    
    console.log('Forum categories seeded!');
    
    console.log('Seeding community events...');
    
    // Insert community events
    await connection.execute(`
      INSERT INTO community_events (title, titleFr, description, descriptionFr, slug, eventType, startAt, endAt, timezone, locationType, locationDetails, maxCapacity, currentRegistrations, waitlistEnabled, price, hostName, status)
      VALUES 
        ('SLE Oral Exam Prep Workshop', 'Atelier de préparation à l\\'examen oral ELS', 'Master the oral component of your SLE exam with expert tips and live practice sessions.', 'Maîtrisez la composante orale de votre examen ELS avec des conseils d\\'experts et des sessions de pratique en direct.', 'sle-oral-workshop-jan-2026', 'workshop', '2026-01-24 15:00:00', '2026-01-24 17:00:00', 'America/Toronto', 'virtual', 'Virtual', 25, 17, true, 0, 'Prof. Marie Dubois', 'published'),
        ('Bilingual Networking Mixer', 'Soirée de réseautage bilingue', 'Connect with fellow public servants on their bilingual journey. Light refreshments provided.', 'Connectez-vous avec d\\'autres fonctionnaires dans leur parcours bilingue. Rafraîchissements légers offerts.', 'networking-mixer-feb-2026', 'networking', '2026-02-04 22:30:00', '2026-02-05 00:30:00', 'America/Toronto', 'in_person', 'In-Person (Ottawa)', 50, 28, false, 0, 'RusingÂcademy Team', 'published'),
        ('French Conversation Circle', 'Cercle de conversation française', 'Weekly informal conversation practice for intermediate French learners. All topics welcome!', 'Pratique de conversation informelle hebdomadaire pour les apprenants de français intermédiaire. Tous les sujets sont les bienvenus!', 'conversation-circle-jan-2026', 'practice', '2026-01-17 17:00:00', '2026-01-17 18:00:00', 'America/Toronto', 'virtual', 'Virtual', 15, 12, true, 0, 'Coach Sophie Martin', 'published'),
        ('Path Series™ Info Session', 'Session d\\'information Path Series™', 'Learn about our accelerated learning programs and how they can help you achieve your SLE goals.', 'Découvrez nos programmes d\\'apprentissage accéléré et comment ils peuvent vous aider à atteindre vos objectifs ELS.', 'path-series-info-feb-2026', 'info_session', '2026-02-11 19:00:00', '2026-02-11 20:00:00', 'America/Toronto', 'virtual', 'Virtual', 100, 33, false, 0, 'Dr. Steven Rusing', 'published')
      ON DUPLICATE KEY UPDATE title=VALUES(title)
    `);
    
    console.log('Community events seeded!');
    console.log('Seed completed successfully!');
    
  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    connection.release();
    await pool.end();
  }
}

seed();
