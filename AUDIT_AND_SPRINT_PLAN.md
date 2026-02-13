# Audit Complet & Plan des 10 Méga-Sprints
## RusingÂcademy Learning Portal

**Auteur :** Manus AI — Ingénieur Didactique Senior  
**Date :** 13 février 2026  
**Commanditaire :** Steven Barholere, CEO & Chief Learning Officer — RusingAcademy  
**Objet :** Audit technique, pédagogique et fonctionnel du portail RusingÂcademy Learning Portal, suivi d'un plan stratégique de 10 méga-sprints pour compléter le projet.

---

## PARTIE I — AUDIT COMPLET DU PORTAIL

### 1. Résumé Exécutif

Le portail RusingÂcademy Learning Portal, dans son état actuel, constitue une base fonctionnelle solide qui reproduit fidèlement la structure du portail LRDG tout en y intégrant le branding premium RusingÂcademy (teal #008090, or #f5a623, glassmorphism) et un système de gamification embryonnaire. Le portail comprend **21 pages fonctionnelles**, **96 leçons structurées** en 7 slots interactifs, **75 quiz formatifs** avec questions réelles, et un système de gamification basé sur les XP, niveaux, streaks et badges.

Cependant, l'audit révèle des lacunes significatives qui doivent être comblées pour transformer ce prototype en un produit de qualité professionnelle prêt pour le marché B2B/B2G. Les lacunes les plus critiques concernent la **persistance des données** (aucune base de données), l'**absence de contenu ESL distinct** (miroir du FSL), le **système de gamification incomplet** (état en mémoire uniquement), l'**absence totale d'accessibilité WCAG 2.1**, et le **manque de bilinguisme fonctionnel** (interface uniquement en anglais avec du contenu en français).

### 2. Inventaire Technique

| Catégorie | Détail |
|---|---|
| **Framework** | React 19 + Vite 7 + Tailwind CSS 4 |
| **Composants UI** | shadcn/ui + Radix UI + Recharts |
| **Routing** | Wouter (client-side) |
| **État** | React Context (GamificationContext) |
| **Données** | Fichiers TypeScript statiques (courseData.ts, lessonContent.ts) |
| **Backend** | Aucun (web-static uniquement) |
| **Base de données** | Aucune |
| **Authentification** | Aucune (page de login simulée) |
| **Pages** | 21 composants de page |
| **Lignes de code** | ~12 000 lignes (pages + composants + données) |
| **Fichier de données** | lessonContent.ts — 11 000+ lignes, 653 blocs de contenu |

### 3. Audit par Domaine

#### 3.1 Architecture et Structure des Fichiers

**Forces :**
Le projet suit une architecture React standard bien organisée avec une séparation claire entre pages, composants, contextes et données. Le DashboardLayout fournit un shell cohérent avec sidebar persistante et footer. Le routing est logique et hiérarchique (`/programs/:programId/:pathId/:lessonId`).

**Faiblesses :**
Le fichier `lessonContent.ts` (11 000+ lignes) est un monolithe qui ralentit le HMR et augmente le bundle size. Il n'y a aucune séparation entre la logique métier et la présentation. Le fichier `courseData.ts` contient des données hardcodées qui devraient provenir d'une API ou d'une base de données. L'absence de lazy loading pour les pages impacte le temps de chargement initial.

#### 3.2 Contenu Pédagogique

| Métrique | FSL | ESL |
|---|---|---|
| **Paths** | 6 (A1→C1+) | 6 (A1→C1+) |
| **Modules** | 24 | 24 |
| **Leçons** | 96 | 96 |
| **Slots avec contenu réel** | 595 / 672 (88.5%) | 0 / 672 (0%) |
| **Quiz avec questions réelles** | 75 / 96 (78.1%) | 0 / 96 (0%) |
| **Questions de quiz** | 578 | 0 |

**Constat critique :** Le programme ESL est actuellement un **miroir structurel du FSL** sans contenu distinct. Les 96 leçons ESL partagent les mêmes IDs que le FSL et utilisent le même `getLessonContent()` qui ne retourne que le contenu FSL. Cela signifie que le programme ESL affiche du contenu en français, ce qui est incohérent et non fonctionnel.

#### 3.3 Système de Gamification

**Implémenté :**
- Système de XP (25-50 XP par leçon, 50 XP par quiz réussi)
- Niveaux (1-50) avec titres (Débutant → Maître Absolu)
- Streaks quotidiens
- Badges (4 types définis)
- Objectif hebdomadaire (5 leçons/semaine)
- Barre de progression XP vers le niveau suivant

**Non implémenté :**
- Aucune **persistance** — tout l'état est perdu au rechargement de la page
- Pas de **tableaux de classement** (leaderboard)
- Pas de **parcours d'apprentissage visuels** (carte à explorer)
- Pas de **célébrations de progrès** (animations de récompense)
- Pas de **système de notifications intelligentes** basé sur l'inactivité
- Pas de **défis quotidiens/hebdomadaires**
- Pas de **système de monnaie virtuelle** pour débloquer du contenu premium
- Seulement 4 badges définis sur les dizaines possibles

#### 3.4 Accessibilité (WCAG 2.1)

**Score actuel : CRITIQUE — 0 attributs aria-* sur l'ensemble des 21 pages.**

| Critère WCAG | Statut |
|---|---|
| Navigation au clavier | Non testé / Non implémenté |
| Attributs ARIA | Absents (0 sur 21 pages) |
| Textes alternatifs (alt) | 1 image sans alt détectée |
| Contrastes de couleurs | Non vérifié systématiquement |
| Structure sémantique | Partielle (div-heavy) |
| Focus visible | Non implémenté |
| Skip navigation | Absent |
| Lecteur d'écran | Non testé |

Ceci est un **écart critique** par rapport à la conformité WCAG 2.1 que LRDG implémente et que le marché gouvernemental exige.

#### 3.5 Bilinguisme et Internationalisation

**État actuel :** L'interface du portail est entièrement en **anglais** (navigation, labels, boutons, messages) tandis que le contenu pédagogique FSL est en **français**. Il n'existe aucun système d'internationalisation (i18n). Les labels de la sidebar, les titres de pages, les messages de gamification, et les textes d'interface sont tous hardcodés en anglais.

Pour un portail destiné au marché canadien bilingue, l'absence de basculement FR/EN est une lacune majeure.

#### 3.6 Persistance et Gestion d'État

**État actuel :** Zéro persistance. Le `GamificationContext` utilise `useState` en mémoire. Aucune donnée n'est sauvegardée dans `localStorage`, `sessionStorage`, ou une base de données. Conséquences :

- La progression de l'apprenant est perdue à chaque rechargement
- Les XP, niveaux, streaks et badges sont réinitialisés
- Les quiz complétés ne sont pas mémorisés
- Les leçons marquées comme terminées sont oubliées
- Les notes personnelles du dashboard ne sont pas sauvegardées

#### 3.7 Pages Héritées du Clone LRDG

Les 11 pages héritées du clone LRDG (TutoringSessions, Authorizations, Progress, Results, Reports, Calendar, Notifications, CommunityForum, Help, MyProfile, MySettings) ont été rebrandées visuellement mais restent **statiques avec des données fictives hardcodées**. Elles ne sont connectées à aucun système backend et ne reflètent pas la progression réelle de l'apprenant.

#### 3.8 Design et Branding

**Forces :**
- Palette teal/or/glassmorphism cohérente et premium
- Logo RusingÂcademy intégré dans la sidebar et le login
- Typographie Playfair Display + Inter bien appliquée
- Sidebar sombre avec accents dorés élégante

**Faiblesses :**
- Certaines pages secondaires utilisent encore des couleurs hardcodées au lieu des variables CSS
- Le glassmorphism n'est pas uniformément appliqué (certaines pages utilisent des cartes opaques)
- Pas de mode sombre/clair toggle
- Les images de couverture des Paths sont des CDN uploads mais pas des visuels premium générés
- Le footer mentionne "Rusinga International Consulting Ltd." mais le lien vers le site principal est absent

---

## PARTIE II — PLAN DES 10 MÉGA-SPRINTS

Chaque méga-sprint est conçu pour être exécuté en une session de travail intensive. Ils sont ordonnés par priorité stratégique et dépendances techniques.

---

### MÉGA-SPRINT 1 : Fondations Backend et Persistance
**Priorité : CRITIQUE | Durée estimée : 1 session intensive**

**Objectif :** Transformer le projet de web-static en full-stack avec base de données, authentification, et persistance de l'état utilisateur.

| Tâche | Détail |
|---|---|
| 1.1 | Upgrade vers `web-db-user` via `webdev_add_feature` |
| 1.2 | Concevoir le schéma de base de données (users, progress, xp_events, badges, quiz_results, lesson_completions, streaks) |
| 1.3 | Implémenter les migrations et le seed initial |
| 1.4 | Créer les endpoints API tRPC pour CRUD de progression |
| 1.5 | Connecter le `GamificationContext` aux API (remplacer useState par des queries tRPC) |
| 1.6 | Implémenter l'authentification Manus OAuth |
| 1.7 | Remplacer les données hardcodées du profil par les données utilisateur réelles |
| 1.8 | Persister les notes du dashboard dans la base de données |

**Livrable :** Un portail full-stack où la progression, les XP, les badges et les quiz sont persistés entre les sessions.

---

### MÉGA-SPRINT 2 : Contenu ESL Distinct et Extraction Complète
**Priorité : CRITIQUE | Durée estimée : 1 session intensive**

**Objectif :** Extraire et intégrer le contenu ESL réel (anglais) à partir des fichiers `ESL_Path_COMPLET.zip`, et compléter les slots manquants du FSL.

| Tâche | Détail |
|---|---|
| 2.1 | Extraire les 96 leçons ESL des fichiers ZIP originaux avec le script d'extraction amélioré |
| 2.2 | Créer `eslLessonContent` distinct dans `lessonContent.ts` (ou mieux : migrer vers la base de données) |
| 2.3 | Modifier `getLessonContent()` pour accepter le `programId` et retourner le contenu approprié (FSL ou ESL) |
| 2.4 | Compléter les 77 slots FSL manquants (11.5% sans contenu substantiel) |
| 2.5 | Vérifier et corriger les 21 quiz manquants (21.9% sans questions réelles) |
| 2.6 | Migrer le contenu des leçons du fichier monolithique vers la base de données pour réduire le bundle size |
| 2.7 | Implémenter le lazy loading du contenu des leçons (charger à la demande via API) |

**Livrable :** Deux programmes distincts (ESL et FSL) avec 100% du contenu réel, chargé dynamiquement.

---

### MÉGA-SPRINT 3 : Gamification Avancée — Le Différenciateur
**Priorité : HAUTE | Durée estimée : 1 session intensive**

**Objectif :** Construire un système de gamification complet qui dépasse significativement ce que LRDG offre, conformément à la Recommandation 1 du rapport d'audit.

| Tâche | Détail |
|---|---|
| 3.1 | **Système de badges étendu** — 30+ badges avec catégories (Complétion, Performance, Régularité, Social, Spécial) et visuels premium |
| 3.2 | **Tableau de classement** (leaderboard) anonymisé et volontaire avec classement hebdomadaire/mensuel/global |
| 3.3 | **Parcours d'apprentissage visuel** — Carte interactive type "skill tree" montrant la progression à travers les Paths |
| 3.4 | **Célébrations de progrès** — Animations confetti/fireworks pour les accomplissements majeurs (module complété, badge débloqué, niveau atteint) |
| 3.5 | **Défis quotidiens et hebdomadaires** — "Complétez 3 quiz aujourd'hui pour +100 XP bonus" |
| 3.6 | **Système de monnaie virtuelle** (Coins) — Gagner des coins pour débloquer des contenus premium, des thèmes, ou des fonctionnalités |
| 3.7 | **Streaks améliorés** — Gel de streak (1 jour de grâce), multiplicateurs de XP pour les longues séries |
| 3.8 | **Notifications de gamification** — "Vous êtes à 2 leçons de débloquer le badge Expert !" |

**Livrable :** Un système de gamification complet, persisté en base de données, avec des mécaniques d'engagement qui surpassent LRDG.

---

### MÉGA-SPRINT 4 : Bilinguisme Complet (FR/EN) et Internationalisation
**Priorité : HAUTE | Durée estimée : 1 session intensive**

**Objectif :** Implémenter un système i18n complet permettant le basculement FR/EN sur toute l'interface, conformément aux exigences du marché canadien bilingue.

| Tâche | Détail |
|---|---|
| 4.1 | Installer et configurer un système i18n (react-i18next ou solution custom) |
| 4.2 | Extraire tous les textes hardcodés de l'interface dans des fichiers de traduction (fr.json, en.json) |
| 4.3 | Traduire la sidebar, le dashboard, les pages de navigation, les messages de gamification |
| 4.4 | Ajouter un sélecteur de langue dans le header/sidebar |
| 4.5 | Persister la préférence de langue de l'utilisateur |
| 4.6 | Adapter les dates, nombres et formats selon la locale |
| 4.7 | Tester l'intégralité de l'interface dans les deux langues |

**Livrable :** Un portail entièrement bilingue FR/EN avec basculement instantané.

---

### MÉGA-SPRINT 5 : Accessibilité WCAG 2.1 et Conformité Gouvernementale
**Priorité : HAUTE | Durée estimée : 1 session intensive**

**Objectif :** Atteindre la conformité WCAG 2.1 AA sur l'ensemble du portail, un prérequis pour le marché gouvernemental canadien.

| Tâche | Détail |
|---|---|
| 5.1 | Ajouter les attributs ARIA sur toutes les 21 pages (roles, labels, descriptions) |
| 5.2 | Implémenter la navigation au clavier complète (focus management, tab order) |
| 5.3 | Ajouter un lien "Skip to main content" |
| 5.4 | Vérifier et corriger les contrastes de couleurs (ratio 4.5:1 minimum) |
| 5.5 | Ajouter les textes alternatifs manquants sur toutes les images |
| 5.6 | Remplacer les `<div>` non sémantiques par des éléments HTML5 (`<nav>`, `<main>`, `<section>`, `<article>`) |
| 5.7 | Implémenter les focus rings visibles et les états hover/active cohérents |
| 5.8 | Tester avec un lecteur d'écran (NVDA/VoiceOver) |
| 5.9 | Générer un rapport de conformité WCAG 2.1 |

**Livrable :** Un portail conforme WCAG 2.1 AA avec rapport de conformité documenté.

---

### MÉGA-SPRINT 6 : Quiz Interactifs Avancés et Évaluations Sommatives
**Priorité : HAUTE | Durée estimée : 1 session intensive**

**Objectif :** Enrichir le système d'évaluation avec des quiz avancés, des examens de fin de module, et des simulations d'ÉLS.

| Tâche | Détail |
|---|---|
| 6.1 | **Quiz formatifs améliorés** — Timer optionnel, indices, explication détaillée après chaque question, score avec feedback personnalisé |
| 6.2 | **Quiz sommatifs de fin de module** — 20 questions couvrant les 4 leçons du module, note minimale de passage (60%), certificat de réussite |
| 6.3 | **Examen final de Path** — Évaluation complète de 40 questions couvrant les 4 modules, avec rapport détaillé des forces/faiblesses |
| 6.4 | **Types de questions enrichis** — Drag-and-drop, matching, ordering, audio comprehension, fill-in-the-blank avec suggestions |
| 6.5 | **Banque de questions** — Randomisation des questions pour éviter la mémorisation |
| 6.6 | **Historique des résultats** — Connecter la page Results avec les vrais scores de quiz |
| 6.7 | **Simulations d'ÉLS** — Mode examen chronométré simulant les conditions réelles de l'Évaluation de Langue Seconde |

**Livrable :** Un système d'évaluation complet avec quiz formatifs, sommatifs, examens de Path, et simulations d'ÉLS.

---

### MÉGA-SPRINT 7 : Intelligence Artificielle et Personnalisation
**Priorité : MOYENNE-HAUTE | Durée estimée : 1 session intensive**

**Objectif :** Intégrer des fonctionnalités d'IA pour la personnalisation de l'apprentissage, conformément aux Recommandations 4 et 5 du rapport d'audit.

| Tâche | Détail |
|---|---|
| 7.1 | **Chatbot pédagogique IA** — Assistant conversationnel intégré pour répondre aux questions de grammaire, vocabulaire et prononciation |
| 7.2 | **Moteur de recommandation adaptatif** — Analyser les erreurs récurrentes et proposer des activités de remédiation ciblées |
| 7.3 | **Feedback IA sur les exercices écrits** — Analyse automatique des réponses écrites avec suggestions de correction |
| 7.4 | **Parcours adaptatif** — Adapter la difficulté des exercices en fonction des performances de l'utilisateur |
| 7.5 | **Prédiction de décrochage** — Identifier les apprenants à risque basé sur leurs patterns d'interaction |
| 7.6 | **Résumés de progression IA** — Générer des résumés personnalisés de la progression avec conseils |

**Livrable :** Un portail avec assistant IA intégré, recommandations adaptatives et feedback intelligent.

---

### MÉGA-SPRINT 8 : Fonctionnalités Sociales et Institutionnelles
**Priorité : MOYENNE | Durée estimée : 1 session intensive**

**Objectif :** Construire les fonctionnalités sociales et les outils institutionnels pour les clients B2B/B2G.

| Tâche | Détail |
|---|---|
| 8.1 | **Forum communautaire fonctionnel** — Remplacer la page statique par un vrai forum avec posts, réponses, likes, catégories |
| 8.2 | **Système de tutorat** — Booking de sessions avec intégration Calendly API, gestion des disponibilités des coachs |
| 8.3 | **Notifications intelligentes** — Système push basé sur l'inactivité, les accomplissements, et les rappels personnalisés |
| 8.4 | **Tableau de bord institutionnel** — Vue administrateur pour les clients organisationnels (suivi d'équipe, ROI, rapports agrégés) |
| 8.5 | **Système de rapports dynamiques** — Connecter la page Reports avec les données réelles (progression, temps passé, scores) |
| 8.6 | **Calendrier interactif** — Synchronisation avec les sessions de tutorat, les deadlines de quiz, et les événements |
| 8.7 | **Gestion des autorisations** — Système de rôles (apprenant, tuteur, admin, gestionnaire institutionnel) |

**Livrable :** Un portail avec fonctionnalités sociales actives et outils de gestion institutionnelle.

---

### MÉGA-SPRINT 9 : Performance, Responsive et Polish
**Priorité : MOYENNE | Durée estimée : 1 session intensive**

**Objectif :** Optimiser les performances, perfectionner le responsive design, et polir l'expérience utilisateur.

| Tâche | Détail |
|---|---|
| 9.1 | **Code splitting et lazy loading** — Implémenter React.lazy() pour toutes les pages et le contenu des leçons |
| 9.2 | **Optimisation du bundle** — Diviser lessonContent.ts en chunks par Path, tree-shaking des dépendances inutilisées |
| 9.3 | **Responsive design complet** — Tester et corriger toutes les pages sur mobile (320px), tablette (768px), desktop (1280px+) |
| 9.4 | **Sidebar mobile** — Drawer/overlay pour la navigation mobile avec gestes swipe |
| 9.5 | **Animations et micro-interactions** — Transitions de page fluides, animations d'entrée des cartes, hover effects cohérents |
| 9.6 | **États vides optimisés** — Transformer tous les "No data" en CTAs engageants (Recommandation 3 du rapport) |
| 9.7 | **Loading states et skeletons** — Ajouter des états de chargement pour toutes les requêtes API |
| 9.8 | **Error boundaries** — Implémenter des error boundaries granulaires avec messages utilisateur-friendly |
| 9.9 | **PWA** — Manifest, service worker, mode hors-ligne pour les leçons déjà consultées |

**Livrable :** Un portail performant, responsive, et poli avec une expérience utilisateur premium.

---

### MÉGA-SPRINT 10 : Crash Courses, Monétisation et Lancement
**Priorité : STRATÉGIQUE | Durée estimée : 1 session intensive**

**Objectif :** Ajouter les fonctionnalités de monétisation, les Crash Courses, et préparer le portail pour le lancement commercial.

| Tâche | Détail |
|---|---|
| 10.1 | **Crash Courses** — Formats intensifs de 2-4 semaines pour les fonctionnaires avec échéances serrées (Recommandation du rapport) |
| 10.2 | **Intégration Stripe** — Plans d'abonnement (Individuel, Équipe, Institutionnel), paiement sécurisé |
| 10.3 | **Système de licences** — Gestion des accès par organisation (nombre de sièges, durée, niveaux accessibles) |
| 10.4 | **Page de tarification** — Plans comparatifs avec CTA clairs |
| 10.5 | **Onboarding flow** — Parcours de première connexion avec test de niveau, choix de programme, objectifs personnels |
| 10.6 | **SEO et meta tags** — Optimisation pour le référencement bilingue |
| 10.7 | **Analytics avancés** — Intégration Umami pour le suivi des conversions, parcours utilisateur, et engagement |
| 10.8 | **Documentation API** — Pour les intégrations institutionnelles |
| 10.9 | **Tests automatisés** — Suite de tests unitaires et d'intégration pour les fonctionnalités critiques |
| 10.10 | **Préparation au déploiement** — Configuration de production, variables d'environnement, domaine personnalisé |

**Livrable :** Un portail prêt pour le lancement commercial avec monétisation, Crash Courses, et infrastructure de production.

---

## PARTIE III — MATRICE DE PRIORISATION

| Sprint | Priorité | Dépendances | Impact Business | Effort |
|---|---|---|---|---|
| **1. Backend & Persistance** | CRITIQUE | Aucune | Fondation de tout le reste | Élevé |
| **2. Contenu ESL & Extraction** | CRITIQUE | Sprint 1 (optionnel) | Produit complet pour 2 marchés | Moyen |
| **3. Gamification Avancée** | HAUTE | Sprint 1 | Différenciateur vs LRDG | Élevé |
| **4. Bilinguisme FR/EN** | HAUTE | Aucune | Marché canadien obligatoire | Moyen |
| **5. Accessibilité WCAG 2.1** | HAUTE | Aucune | Conformité gouvernementale | Moyen |
| **6. Quiz & Évaluations** | HAUTE | Sprint 1, 2 | Valeur pédagogique | Élevé |
| **7. Intelligence Artificielle** | MOYENNE-HAUTE | Sprint 1 | Innovation & différenciation | Élevé |
| **8. Social & Institutionnel** | MOYENNE | Sprint 1 | Marché B2B/B2G | Élevé |
| **9. Performance & Polish** | MOYENNE | Sprints 1-6 | Qualité produit | Moyen |
| **10. Monétisation & Lancement** | STRATÉGIQUE | Sprints 1-9 | Revenus | Élevé |

---

## PARTIE IV — RECOMMANDATIONS STRATÉGIQUES

### Alignement avec le Rapport d'Audit LRDG

Le plan des 10 méga-sprints intègre systématiquement les 5 recommandations de votre rapport d'audit de la plateforme LRDG :

| Recommandation du Rapport | Sprint(s) Correspondant(s) |
|---|---|
| **R1 : Gamification** (points, badges, leaderboards) | Sprint 3 |
| **R2 : Notifications intelligentes** | Sprint 8 |
| **R3 : États vides → CTAs** | Sprint 9 |
| **R4 : Moteur de recommandation IA** | Sprint 7 |
| **R5 : Analyse vocale par IA** | Sprint 7 |

### Avantages Concurrentiels vs LRDG

Le portail RusingÂcademy, une fois les 10 sprints complétés, surpassera LRDG sur les axes suivants :

1. **Gamification complète** — LRDG n'a aucun système de gamification ; RusingÂcademy aura XP, badges, leaderboards, défis, et parcours visuels.
2. **IA intégrée** — Chatbot pédagogique, recommandations adaptatives, et feedback intelligent.
3. **Design premium** — Glassmorphism, micro-animations, et branding cohérent vs l'interface fonctionnelle mais austère de LRDG.
4. **Deux programmes** — ESL et FSL dans un seul portail vs un seul programme chez LRDG.
5. **Crash Courses** — Formats intensifs pour les fonctionnaires pressés, un besoin non couvert par LRDG.

### Ordre d'Exécution Recommandé

Pour maximiser la valeur livrée rapidement, l'ordre recommandé est :

**Phase 1 — Fondations (Sprints 1-2) :** Backend, persistance, contenu ESL complet. Sans ces fondations, rien d'autre ne peut fonctionner de manière pérenne.

**Phase 2 — Différenciation (Sprints 3-5) :** Gamification avancée, bilinguisme, accessibilité. Ces trois sprints créent les différenciateurs clés par rapport à LRDG.

**Phase 3 — Enrichissement (Sprints 6-8) :** Quiz avancés, IA, fonctionnalités sociales. Ces sprints ajoutent la profondeur pédagogique et institutionnelle.

**Phase 4 — Lancement (Sprints 9-10) :** Performance, polish, monétisation. La couche finale pour un produit commercial prêt au marché.

---

*Ce document constitue la feuille de route stratégique pour transformer le prototype actuel du RusingÂcademy Learning Portal en un produit de qualité professionnelle, prêt à concurrencer et surpasser LRDG sur le marché de la formation linguistique gouvernementale canadienne.*
