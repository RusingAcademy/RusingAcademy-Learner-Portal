# Méga-Sprint 1 — Backend & Persistance

## A) Sprint Card

### Objectif Business
Permettre à tout apprenant de se connecter, progresser dans les cours ESL/FSL, accumuler des XP/badges/streaks, fermer le navigateur, revenir et retrouver l'intégralité de sa progression. C'est la fondation de toute monétisation future (Sprint 10) et de la gamification avancée (Sprint 3).

### Objectif Technique
- Upgrader le projet vers `web-db-user` (backend Express + base de données TiDB/MySQL)
- Implémenter l'authentification via Manus OAuth
- Créer le schéma de base de données complet (users, progress, quiz_results, gamification)
- Construire les API REST pour CRUD de toutes les données de progression
- Connecter le frontend aux APIs backend (remplacer le state React éphémère par de la persistance réelle)

### Dépendances
| Dépendance | Statut | Risque |
|---|---|---|
| `webdev_add_feature("web-db-user")` | À exécuter | Faible — outil natif |
| Schéma DB compatible TiDB (MySQL) | À créer | Moyen — contraintes TiDB |
| Manus OAuth pour auth | Disponible | Faible |
| Frontend existant (GamificationContext) | En place | Moyen — refactoring nécessaire |

### Risques & Mitigation
| Risque | Impact | Mitigation |
|---|---|---|
| TiDB ne supporte pas certaines features MySQL | Moyen | Utiliser des types simples, éviter les triggers |
| Migration du state React vers API | Élevé | Garder le fallback localStorage pendant la transition |
| Performance avec 30k+ lignes de lessonContent.ts | Moyen | Le contenu reste statique côté client, seule la progression va en DB |

### Definition of Done (DoD)
- [ ] Base de données créée avec tables : users, user_progress, quiz_results, user_gamification, user_badges
- [ ] Authentification fonctionnelle (login/logout/session)
- [ ] API endpoints : GET/POST progression, GET/POST quiz results, GET/PUT gamification stats
- [ ] Frontend connecté aux APIs — progression persistée en DB
- [ ] Un apprenant peut : se connecter → compléter une leçon → fermer le navigateur → revenir → progression conservée
- [ ] 0 erreurs TypeScript, 0 erreurs console
- [ ] Tests E2E : scénario complet de persistance vérifié

### Estimation
- **Effort relatif** : 8/10 (le plus gros sprint technique)
- **Sous-tâches ordonnées** :
  1. `webdev_add_feature("web-db-user")` — upgrade projet
  2. Lire le README/diffs générés pour comprendre la stack backend
  3. Créer le schéma DB (migrations SQL)
  4. Implémenter les routes API backend (Express + tRPC si dispo)
  5. Refactorer GamificationContext pour utiliser les APIs
  6. Refactorer LessonViewer/QuizPage pour persister les résultats
  7. Tester E2E le flux complet
  8. Quality Gate PASS

---

## B) Plan d'Exécution Détaillé

### Sous-tâche 1 : Upgrade vers web-db-user
- Exécuter `webdev_add_feature("web-db-user")`
- Lire le README et les diffs pour comprendre la nouvelle structure
- Identifier les fichiers serveur, les routes, et la configuration DB

### Sous-tâche 2 : Schéma de Base de Données
```sql
-- Table: users (gérée par Manus OAuth, on ajoute des champs custom)
CREATE TABLE user_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  oauth_id VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255),
  email VARCHAR(255),
  preferred_language ENUM('en', 'fr') DEFAULT 'en',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table: progression des leçons
CREATE TABLE lesson_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  program_id VARCHAR(50) NOT NULL,  -- 'esl' ou 'fsl'
  path_id VARCHAR(50) NOT NULL,
  lesson_id VARCHAR(20) NOT NULL,
  slot_completed JSON,  -- {"hook":true,"video":true,...}
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP NULL,
  xp_earned INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_lesson (user_id, lesson_id)
);

-- Table: résultats de quiz
CREATE TABLE quiz_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  lesson_id VARCHAR(20) NOT NULL,
  quiz_type ENUM('formative', 'summative', 'exam') DEFAULT 'formative',
  score INT NOT NULL,
  total_questions INT NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  answers JSON,  -- détail des réponses
  time_spent_seconds INT DEFAULT 0,
  attempt_number INT DEFAULT 1,
  passed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: gamification
CREATE TABLE user_gamification (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  total_xp INT DEFAULT 0,
  level INT DEFAULT 1,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_activity_date DATE NULL,
  coins INT DEFAULT 0,
  lessons_completed INT DEFAULT 0,
  quizzes_passed INT DEFAULT 0,
  total_time_minutes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table: badges obtenus
CREATE TABLE user_badges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  badge_id VARCHAR(50) NOT NULL,
  badge_name VARCHAR(255) NOT NULL,
  badge_icon VARCHAR(500),
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_badge (user_id, badge_id)
);
```

### Sous-tâche 3 : API Routes
- `GET /api/progress/:userId` — récupérer toute la progression
- `POST /api/progress` — sauvegarder la progression d'une leçon
- `GET /api/quiz-results/:userId` — récupérer les résultats de quiz
- `POST /api/quiz-results` — sauvegarder un résultat de quiz
- `GET /api/gamification/:userId` — récupérer les stats de gamification
- `PUT /api/gamification/:userId` — mettre à jour XP/streak/level
- `GET /api/badges/:userId` — récupérer les badges
- `POST /api/badges` — attribuer un badge

### Sous-tâche 4 : Refactoring Frontend
- Modifier `GamificationContext.tsx` pour charger/sauvegarder via API
- Modifier `LessonViewer.tsx` pour persister la complétion des slots
- Modifier `QuizPage.tsx` pour sauvegarder les résultats en DB
- Ajouter un hook `useAuth()` pour gérer l'authentification
- Ajouter un hook `useProgress()` pour gérer la progression

---
