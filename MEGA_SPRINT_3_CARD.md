# Méga-Sprint 3 — Advanced Gamification

## Objective
Build the advanced gamification system that differentiates RusingÂcademy from LRDG: leaderboard with real-time rankings, weekly challenges with XP/badge rewards, and animated celebrations (confetti, level-up, streak milestones, badge unlock).

## Deliverables
1. **Leaderboard Page** — Rankings by weekly/monthly/all-time, animated entries, user avatars, rank badges
2. **Weekly Challenges** — Auto-generated challenges (complete X lessons, earn Y XP, maintain Z streak), progress bars, reward system
3. **Celebration System** — Confetti on quiz pass, level-up modal with fanfare, streak milestone toast, badge unlock animation
4. **Dashboard Integration** — Gamification hero with rank, active challenges, streak fire animation
5. **Sidebar Enhancement** — Challenge progress indicator, streak fire icon

## Technical Scope
- 3 new DB tables: weekly_challenges, challenge_progress, leaderboard_cache
- 2 new tRPC routers: leaderboard, challenges
- 1 new component: CelebrationOverlay (framer-motion)
- 1 new page: Leaderboard
- Updates to: Dashboard, Sidebar, LessonViewer, QuizPage, GamificationContext

## Definition of Done
- Leaderboard shows ranked users with animated transitions
- Weekly challenges auto-generate and track progress
- Celebrations trigger on: quiz pass (confetti), level-up (modal+confetti), streak milestone (toast), badge unlock (animation)
- All new routes have vitest coverage
- 0 TypeScript errors
- Browser E2E Quality Gate PASS

## Risks & Mitigations
- **Performance**: Leaderboard queries on large datasets → Use cached/materialized views
- **Animation jank**: Heavy confetti on low-end devices → Use requestAnimationFrame, limit particle count
- **Challenge fairness**: New users vs veterans → Challenges scale by user level
