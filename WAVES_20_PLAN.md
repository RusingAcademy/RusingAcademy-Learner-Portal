# 20-Wave Beautification Execution Program

**Author:** Manus AI — Design Engineering Division
**Date:** February 16, 2026
**Non-Negotiable Rule:** ZERO REGRESSION — nothing breaks, disappears, or becomes harder to find.
**Methodology:** Each wave follows Deep Research → Detailed Plan → Meticulous Execution → Validation.

---

## Program Overview

The 20 waves are organized into four phases, progressing from foundational infrastructure through portal-specific refinement to final polish. Each wave builds on the previous, and no wave introduces changes that conflict with earlier work.

| Phase | Waves | Theme | Estimated Scope |
|---|---|---|---|
| **Foundation** | 1–5 | Design tokens, shared components, state templates | ~30 files |
| **Learner Portal** | 6–10 | Dashboard, learning pages, gamification, AI companion | ~25 files |
| **Multi-Portal** | 11–15 | Coach, Client (HR), Admin portals | ~20 files |
| **Polish & Trust** | 16–20 | Landing page, Login, animations, accessibility, trust signals | ~15 files |

---

## Wave 1 — Design Token Foundation & index.css Overhaul

### Research Basis

The GC Design System mandates consistent visual language across government-facing interfaces [1]. The 8-point grid system [2] and semantic color tokens [3] are industry standards adopted by Atlassian, Google Material, and the USWDS. Migrating from 619 hardcoded colors to a token-based system is the single highest-impact change for long-term maintainability and visual consistency.

### Execution Plan

| Step | Action | Files Touched | Acceptance Criteria |
|---|---|---|---|
| 1.1 | Define complete OKLCH color palette in `index.css` `@theme` block | `client/src/index.css` | All tokens from DESIGN_SYSTEM_BASELINE §2 present |
| 1.2 | Define typography scale CSS custom properties | `client/src/index.css` | 9 type tokens (display through overline) defined |
| 1.3 | Define shadow tokens as CSS custom properties | `client/src/index.css` | 4 shadow levels (card, elevated, modal, glow) defined |
| 1.4 | Define radius tokens | `client/src/index.css` | 4 radius values (sm, md, lg, full) defined |
| 1.5 | Update Tailwind theme extension to consume new tokens | `client/src/index.css` | Tailwind classes resolve to new token values |
| 1.6 | Verify no visual regression via dev server | All pages | All existing pages render identically |

### QA Checks

- Run `pnpm test` — all 399 tests pass
- Visual comparison of Dashboard, Coach, HR, Admin pages before/after
- Verify `bg-primary`, `text-primary`, `bg-accent` resolve correctly
- Check that no existing hardcoded colors are broken (additive change only)

### Rollback Plan

`webdev_rollback_checkpoint` to pre-Wave-1 checkpoint. This wave is purely additive (new CSS variables), so rollback is clean.

---

## Wave 2 — Shared Component Library: Card, StatCard, EmptyState, ErrorState

### Research Basis

Component-driven development reduces inconsistency by 60-80% according to Storybook's 2024 State of Frontend report. The GC Design System emphasizes reusable patterns for government services [1]. Empty states are critical for first-time user experience in LMS platforms [4].

### Execution Plan

| Step | Action | Files Touched | Acceptance Criteria |
|---|---|---|---|
| 2.1 | Create `RACard` component with standard padding, shadow, radius, hover | `client/src/components/RACard.tsx` | Matches DESIGN_SYSTEM_BASELINE §7.1 |
| 2.2 | Create `StatCard` component for dashboard metrics | `client/src/components/StatCard.tsx` | Icon + value + label pattern, ARIA labels |
| 2.3 | Create `EmptyState` component with icon, title, description, CTA | `client/src/components/EmptyState.tsx` | Bilingual support via `t()` |
| 2.4 | Create `ErrorState` component with retry action | `client/src/components/ErrorState.tsx` | Accepts error object + retry callback |
| 2.5 | Create `LoadingSkeleton` component variants (card, list, stat) | `client/src/components/LoadingSkeleton.tsx` | Pulse animation, matches content layout |
| 2.6 | Create `PageHeader` component (title + breadcrumb + actions) | `client/src/components/PageHeader.tsx` | Bilingual, consistent across portals |
| 2.7 | Write vitest tests for all new components | `server/*.test.ts` | 100% coverage of component logic |

### QA Checks

- All new components render in isolation (no side effects)
- Components accept bilingual props
- ARIA attributes present on interactive elements
- `pnpm test` passes

### Rollback Plan

Delete new component files. No existing files are modified in this wave.

---

## Wave 3 — Learner Portal Sidebar Refinement

### Research Basis

Sidebar navigation is the primary wayfinding mechanism in LMS platforms. Canvas LMS, Moodle, and Blackboard all use persistent sidebars with clear active states, grouped sections, and accessibility landmarks [5]. The GC Design System requires `nav` landmarks with `aria-label` [1].

### Execution Plan

| Step | Action | Files Touched | Acceptance Criteria |
|---|---|---|---|
| 3.1 | Refactor `Sidebar.tsx` to use design tokens (replace all hardcoded colors) | `client/src/components/Sidebar.tsx` | Zero hardcoded hex values |
| 3.2 | Add `nav` landmark with `aria-label="Main navigation"` | `Sidebar.tsx` | Screen reader announces navigation |
| 3.3 | Add skip-to-content link | `Sidebar.tsx` | Focus jumps to `#main-content` |
| 3.4 | Standardize nav item pattern (active/inactive/hover states) | `Sidebar.tsx` | Matches DESIGN_SYSTEM_BASELINE §7.4 |
| 3.5 | Ensure language toggle is visible without scrolling on mobile | `Sidebar.tsx` | One-click language switch on all viewports |
| 3.6 | Add bilingual labels to all sidebar items using `t()` | `Sidebar.tsx` | All items translate on language switch |
| 3.7 | Verify all sidebar links resolve to valid routes | `Sidebar.tsx` + `App.tsx` | Zero 404s from sidebar navigation |

### QA Checks

- Navigate every sidebar link — all routes resolve
- Toggle language — all labels switch
- Keyboard navigation — Tab through all items, Enter activates
- Screen reader test — landmarks announced
- `pnpm test` passes

### Rollback Plan

`webdev_rollback_checkpoint` to pre-Wave-3 checkpoint.

---

## Wave 4 — Learner Dashboard Token Migration & Stat Cards

### Research Basis

The learner dashboard is the most-visited page in any LMS [4]. High-contrast stat cards with clear hierarchy improve comprehension speed by 40% [6]. The 8-point grid ensures visual rhythm.

### Execution Plan

| Step | Action | Files Touched | Acceptance Criteria |
|---|---|---|---|
| 4.1 | Replace all hardcoded colors in `Dashboard.tsx` with design tokens | `Dashboard.tsx` | Zero `#008090`, `#f5a623` references |
| 4.2 | Replace inline stat cards with `StatCard` component | `Dashboard.tsx` | 5 stat cards use shared component |
| 4.3 | Replace program cards with `RACard` component | `Dashboard.tsx` | ESL/FSL cards use shared component |
| 4.4 | Add loading skeletons for all data-dependent sections | `Dashboard.tsx` | Skeleton shows during tRPC fetch |
| 4.5 | Add empty states for Results, Progress, Leaderboard sections | `Dashboard.tsx` | Helpful message when no data |
| 4.6 | Standardize typography to design system scale | `Dashboard.tsx` | Zero arbitrary pixel font sizes |
| 4.7 | Add ARIA labels to stat cards and progress indicators | `Dashboard.tsx` | `aria-label` on all interactive elements |

### QA Checks

- Dashboard renders identically (visual comparison)
- All data loads correctly
- Loading → loaded → empty transitions work
- `pnpm test` passes

### Rollback Plan

`webdev_rollback_checkpoint` to pre-Wave-4 checkpoint.

---

## Wave 5 — i18n Dictionary Expansion & Bilingual Compliance

### Research Basis

The Government of Canada's Standard on Official Languages requires equal service quality in both official languages [7]. The GC Design System mandates bilingual interfaces [1]. French text expansion (15-30%) must be accommodated in all layouts.

### Execution Plan

| Step | Action | Files Touched | Acceptance Criteria |
|---|---|---|---|
| 5.1 | Audit all 39 pages without `useLanguage()` and categorize | Audit document | Complete list with priority |
| 5.2 | Expand `en.ts` and `fr.ts` with missing page-specific keys | `client/src/i18n/en.ts`, `fr.ts` | 200+ new translation keys |
| 5.3 | Integrate `useLanguage()` into top-10 priority pages | 10 page files | All visible text uses `t()` or `lang` ternary |
| 5.4 | Test French layout for truncation issues | All modified pages | No text overflow or clipping |
| 5.5 | Ensure language toggle persists across page navigation | `LanguageContext.tsx` | Language preference survives route changes |

### QA Checks

- Switch to French — all modified pages display French text
- No English text visible on French-mode pages (except proper nouns)
- French text fits within containers (no overflow)
- `pnpm test` passes

### Rollback Plan

`webdev_rollback_checkpoint` to pre-Wave-5 checkpoint.

---

## Wave 6 — Learning Pages Polish (PathList, PathDetail, LessonViewer)

### Research Basis

The learning content pages are the core product. EdTech UX research shows that clear progress indicators, consistent navigation, and distraction-free reading environments increase lesson completion rates by 25-35% [4] [5].

### Execution Plan

| Step | Action | Files Touched | Acceptance Criteria |
|---|---|---|---|
| 6.1 | Migrate `PathList.tsx` to design tokens + RACard | `PathList.tsx` | Consistent card design, token colors |
| 6.2 | Migrate `PathDetail.tsx` to design tokens | `PathDetail.tsx` | Progress bars use token colors |
| 6.3 | Refine `LessonViewer.tsx` reading experience | `LessonViewer.tsx` | Clean typography, focused layout |
| 6.4 | Add breadcrumb navigation (Program → Path → Module → Lesson) | Learning pages | Clear wayfinding at every level |
| 6.5 | Standardize progress indicators across all learning pages | Learning pages | Unified progress component |
| 6.6 | Add bilingual support to learning navigation | Learning pages | Path/module titles in both languages |

### QA Checks

- Navigate full learning flow: PathList → PathDetail → Module → Lesson
- All progress data displays correctly
- Breadcrumbs link to correct routes
- `pnpm test` passes

### Rollback Plan

`webdev_rollback_checkpoint` to pre-Wave-6 checkpoint.

---

## Wave 7 — Gamification UI Refinement (XP, Badges, Leaderboard, Achievements)

### Research Basis

Gamification in LMS increases engagement by 48% when visual feedback is immediate and clear [8]. Badge systems require consistent iconography and celebratory micro-interactions. Leaderboards must balance motivation with psychological safety (anonymization options).

### Execution Plan

| Step | Action | Files Touched | Acceptance Criteria |
|---|---|---|---|
| 7.1 | Migrate `Leaderboard.tsx` to design tokens + bilingual | `Leaderboard.tsx` | Token colors, `t()` strings |
| 7.2 | Migrate `Achievements.tsx` to design tokens + bilingual | `Achievements.tsx` | Badge cards use RACard, bilingual labels |
| 7.3 | Refine XP bar in sidebar (consistent with dashboard) | `Sidebar.tsx` | Same progress component as dashboard |
| 7.4 | Polish `CelebrationOverlay.tsx` animations | `CelebrationOverlay.tsx` | Smooth confetti, accessible (respects prefers-reduced-motion) |
| 7.5 | Add empty states for Achievements and Leaderboard | Both pages | Motivational empty states |
| 7.6 | Standardize badge card design | `Achievements.tsx` | Consistent size, shadow, radius |

### QA Checks

- XP gain triggers celebration
- Leaderboard loads and displays rankings
- Badge grid renders correctly
- `pnpm test` passes

### Rollback Plan

`webdev_rollback_checkpoint` to pre-Wave-7 checkpoint.

---

## Wave 8 — Interactive Learning Tools (Flashcards, Grammar, Dictation, Listening, MockSLE)

### Research Basis

Interactive learning tools require high engagement UX — immediate feedback, clear scoring, and motivational design. The best EdTech platforms (Duolingo, Quizlet) use card-based interfaces with micro-animations for correct/incorrect feedback [4].

### Execution Plan

| Step | Action | Files Touched | Acceptance Criteria |
|---|---|---|---|
| 8.1 | Migrate `Flashcards.tsx` to design tokens | `Flashcards.tsx` | Token colors, consistent card flip animation |
| 8.2 | Migrate `GrammarDrills.tsx` to design tokens + bilingual | `GrammarDrills.tsx` | Token colors, `t()` strings |
| 8.3 | Migrate `DictationExercises.tsx` to design tokens | `DictationExercises.tsx` | Consistent audio player UI |
| 8.4 | Migrate `ListeningLab.tsx` to design tokens | `ListeningLab.tsx` | Token colors, bilingual labels |
| 8.5 | Migrate `MockSLEExam.tsx` to design tokens | `MockSLEExam.tsx` | Professional exam interface |
| 8.6 | Add loading/empty/error states to all tools | All 5 files | Complete state coverage |

### QA Checks

- Each tool loads and functions correctly
- Scoring and feedback work
- Audio playback works
- `pnpm test` passes

### Rollback Plan

`webdev_rollback_checkpoint` to pre-Wave-8 checkpoint.

---

## Wave 9 — Learner Utility Pages (Calendar, Notes, Bookmarks, Notifications, Settings, Profile)

### Research Basis

Utility pages are often neglected but critical for daily engagement. Calendar and notification UX directly impacts return visits [4]. Settings and profile pages must be accessible and bilingual for government compliance.

### Execution Plan

| Step | Action | Files Touched | Acceptance Criteria |
|---|---|---|---|
| 9.1 | Migrate `Calendar.tsx` to design tokens + bilingual | `Calendar.tsx` | Token colors, bilingual month/day names |
| 9.2 | Migrate `Notes.tsx` to design tokens + bilingual | `Notes.tsx` | Consistent editor UI |
| 9.3 | Migrate `Bookmarks.tsx` to design tokens + bilingual | `Bookmarks.tsx` | RACard for bookmarked items |
| 9.4 | Migrate `Notifications.tsx` to design tokens + bilingual | `Notifications.tsx` | Clear read/unread states |
| 9.5 | Migrate `MySettings.tsx` to design tokens + bilingual | `MySettings.tsx` | Accessible form controls |
| 9.6 | Migrate `MyProfile.tsx` to design tokens + bilingual | `MyProfile.tsx` | Professional profile layout |
| 9.7 | Add empty states to all utility pages | All 6 files | Helpful empty states |

### QA Checks

- All utility pages load correctly
- Settings save and persist
- Notifications display correctly
- `pnpm test` passes

### Rollback Plan

`webdev_rollback_checkpoint` to pre-Wave-9 checkpoint.

---

## Wave 10 — AI Companion & Community Pages (AIAssistant, FloatingAICompanion, Forum, Discussion)

### Research Basis

AI-powered learning assistants increase engagement by 35% when the interface is conversational and non-intrusive [9]. Community features require clear threading, moderation indicators, and bilingual support.

### Execution Plan

| Step | Action | Files Touched | Acceptance Criteria |
|---|---|---|---|
| 10.1 | Refine `FloatingAICompanion.tsx` design (token colors, shadow) | `FloatingAICompanion.tsx` | Matches design system |
| 10.2 | Refine `AIAssistant.tsx` full-page chat design | `AIAssistant.tsx` | Token colors, bilingual |
| 10.3 | Migrate `CommunityForum.tsx` to design tokens + bilingual | `CommunityForum.tsx` | Consistent thread cards |
| 10.4 | Migrate `DiscussionBoards.tsx` to design tokens + bilingual | `DiscussionBoards.tsx` | Token colors |
| 10.5 | Migrate `CulturalImmersion.tsx` to design tokens + bilingual | `CulturalImmersion.tsx` | Token colors |
| 10.6 | Add loading/empty/error states | All files | Complete state coverage |

### QA Checks

- AI chat sends and receives messages
- Forum threads display correctly
- Floating companion opens/closes smoothly
- `pnpm test` passes

### Rollback Plan

`webdev_rollback_checkpoint` to pre-Wave-10 checkpoint.

---

## Wave 11 — Coach Portal Beautification

### Research Basis

Coach-facing interfaces must balance data density with clarity. Revenue dashboards, student management, and session scheduling require high-contrast tables and clear action hierarchies [6].

### Execution Plan

| Step | Action | Files Touched | Acceptance Criteria |
|---|---|---|---|
| 11.1 | Refactor `CoachSidebar.tsx` to use design tokens | `CoachSidebar.tsx` | Zero hardcoded colors |
| 11.2 | Migrate `CoachDashboardHome.tsx` to tokens + StatCard | `CoachDashboardHome.tsx` | Shared stat cards |
| 11.3 | Migrate `CoachStudents.tsx` to tokens | `CoachStudents.tsx` | Consistent table design |
| 11.4 | Migrate `CoachSessions.tsx` to tokens | `CoachSessions.tsx` | Token colors, bilingual |
| 11.5 | Migrate `CoachRevenue.tsx` to tokens | `CoachRevenue.tsx` | High-contrast financial data |
| 11.6 | Migrate `CoachPerformance.tsx` to tokens | `CoachPerformance.tsx` | Token colors |
| 11.7 | Add ARIA labels to all coach portal tables | All coach files | Screen reader accessible |

### QA Checks

- All coach portal pages load correctly
- Navigation between pages works
- Data displays correctly
- `pnpm test` passes

### Rollback Plan

`webdev_rollback_checkpoint` to pre-Wave-11 checkpoint.

---

## Wave 12 — Client (HR) Portal Beautification

### Research Basis

Government HR managers expect institutional-grade interfaces. Billing dashboards, compliance tracking, and participant management must project trust and professionalism [1] [7].

### Execution Plan

| Step | Action | Files Touched | Acceptance Criteria |
|---|---|---|---|
| 12.1 | Refactor `HRSidebar.tsx` to use design tokens | `HRSidebar.tsx` | Zero hardcoded colors |
| 12.2 | Migrate `HRDashboardHome.tsx` to tokens + StatCard | `HRDashboardHome.tsx` | Shared stat cards |
| 12.3 | Migrate `HRTeam.tsx` to tokens | `HRTeam.tsx` | Consistent table design |
| 12.4 | Migrate `HRCohorts.tsx` to tokens | `HRCohorts.tsx` | Token colors |
| 12.5 | Migrate `HRBudget.tsx` to tokens | `HRBudget.tsx` | High-contrast financial data |
| 12.6 | Migrate `HRCompliance.tsx` to tokens | `HRCompliance.tsx` | Token colors |
| 12.7 | Migrate `HRReports.tsx` to tokens | `HRReports.tsx` | Token colors |
| 12.8 | Add ARIA labels to all HR portal tables | All HR files | Screen reader accessible |

### QA Checks

- All HR portal pages load correctly
- Budget calculations display correctly
- Compliance status indicators work
- `pnpm test` passes

### Rollback Plan

`webdev_rollback_checkpoint` to pre-Wave-12 checkpoint.

---

## Wave 13 — Admin Control System Beautification

### Research Basis

Admin interfaces require maximum information density with clear hierarchy. The red accent must be used sparingly for destructive actions, not as a general theme color [6].

### Execution Plan

| Step | Action | Files Touched | Acceptance Criteria |
|---|---|---|---|
| 13.1 | Refactor `AdminControlSidebar.tsx` to use design tokens | `AdminControlSidebar.tsx` | Zero hardcoded colors |
| 13.2 | Migrate `AdminDashboardHome.tsx` to tokens | `AdminDashboardHome.tsx` | Shared stat cards |
| 13.3 | Migrate `AdminUsers.tsx` to tokens | `AdminUsers.tsx` | Consistent table design |
| 13.4 | Migrate `AdminCourses.tsx` to tokens | `AdminCourses.tsx` | Token colors |
| 13.5 | Migrate `AdminCommerce.tsx` to tokens | `AdminCommerce.tsx` | Token colors |
| 13.6 | Migrate `AdminMarketing.tsx` to tokens | `AdminMarketing.tsx` | Token colors |
| 13.7 | Migrate `AdminKPIs.tsx` to tokens | `AdminKPIs.tsx` | High-contrast data visualization |
| 13.8 | Migrate legacy `AdminDashboard.tsx` to tokens | `AdminDashboard.tsx` | Token colors |

### QA Checks

- All admin pages load correctly
- User management CRUD works
- KPI charts render
- `pnpm test` passes

### Rollback Plan

`webdev_rollback_checkpoint` to pre-Wave-13 checkpoint.

---

## Wave 14 — Admin Specialized Pages (CoachHub, ContentPipeline, ExecutiveSummary)

### Research Basis

Content management and executive reporting interfaces require clear status indicators, progress tracking, and data-dense layouts that remain scannable [6].

### Execution Plan

| Step | Action | Files Touched | Acceptance Criteria |
|---|---|---|---|
| 14.1 | Migrate `AdminCoachHub.tsx` to tokens + bilingual | `AdminCoachHub.tsx` | Token colors, bilingual labels |
| 14.2 | Migrate `AdminContentPipeline.tsx` to tokens + bilingual | `AdminContentPipeline.tsx` | Token colors |
| 14.3 | Migrate `AdminExecutiveSummary.tsx` to tokens + bilingual | `AdminExecutiveSummary.tsx` | Token colors |
| 14.4 | Add loading/empty/error states to all admin specialized pages | All 3 files | Complete state coverage |
| 14.5 | Standardize status badges across admin pages | All admin files | Consistent badge design |

### QA Checks

- All specialized admin pages load
- Status indicators display correctly
- `pnpm test` passes

### Rollback Plan

`webdev_rollback_checkpoint` to pre-Wave-14 checkpoint.

---

## Wave 15 — Cross-Portal Consistency Audit & Alignment

### Research Basis

Cross-portal consistency is critical for users who access multiple portals (e.g., a coach who is also a learner). The GC Design System emphasizes consistent patterns across related services [1].

### Execution Plan

| Step | Action | Files Touched | Acceptance Criteria |
|---|---|---|---|
| 15.1 | Audit all 4 sidebars for consistent patterns | 4 sidebar files | Same spacing, typography, icon system |
| 15.2 | Audit all 4 dashboard pages for consistent stat card usage | 4 dashboard files | Same StatCard component |
| 15.3 | Ensure footer with "© Rusinga International Consulting Ltd." on all portals | Layout files | Institutional footer present |
| 15.4 | Ensure social links component is consistent across portals | `SocialLinks.tsx` | Same design everywhere |
| 15.5 | Verify all portal accent colors are correctly applied | All portal files | No color bleed between portals |

### QA Checks

- Navigate between all 4 portals — consistent experience
- Footer visible on all authenticated pages
- Social links consistent
- `pnpm test` passes

### Rollback Plan

`webdev_rollback_checkpoint` to pre-Wave-15 checkpoint.

---

## Wave 16 — Landing Page (Home.tsx) Conversion Optimization

### Research Basis

Landing page conversion for EdTech SaaS follows a proven narrative structure: Hero → Social Proof → Features → Testimonials → CTA [10]. Trust signals must appear before the first CTA. Government audiences require institutional credibility indicators.

### Execution Plan

| Step | Action | Files Touched | Acceptance Criteria |
|---|---|---|---|
| 16.1 | Restructure Home.tsx visual hierarchy (clear narrative flow) | `Home.tsx` | Hero → Brands → Features → Testimonials → Team → FAQ → CTA |
| 16.2 | Migrate all hardcoded colors to design tokens | `Home.tsx` | Zero hardcoded hex values |
| 16.3 | Add trust badges (WCAG AA, bilingual certified, Canadian data) | `Home.tsx` | Visible before first CTA |
| 16.4 | Refine testimonial cards with consistent design | `Home.tsx` | RACard component |
| 16.5 | Add Framer Motion entrance animations | `Home.tsx` | Staggered fade-in-up |
| 16.6 | Ensure comprehensive footer with legal links | `Home.tsx` | Privacy, Terms, Accessibility links |
| 16.7 | Add bilingual support to all landing page sections | `Home.tsx` | Full French version |

### QA Checks

- Landing page loads quickly (< 3s LCP)
- All CTAs link to correct destinations
- Footer links work
- French version displays correctly
- `pnpm test` passes

### Rollback Plan

`webdev_rollback_checkpoint` to pre-Wave-16 checkpoint.

---

## Wave 17 — Login Page Final Polish

### Research Basis

The login page is the first impression for every user. It must project institutional trust, display clear authentication options, and load instantly. Government users expect professional, non-flashy interfaces [7].

### Execution Plan

| Step | Action | Files Touched | Acceptance Criteria |
|---|---|---|---|
| 17.1 | Migrate Login.tsx to design tokens | `Login.tsx` | Zero hardcoded colors |
| 17.2 | Ensure single-viewport layout at 1366×768 and 1440×900 | `Login.tsx` | No scrolling required |
| 17.3 | Add trust indicators (security badge, data residency note) | `Login.tsx` | Visible near auth form |
| 17.4 | Ensure bilingual support (EN/FR toggle) | `Login.tsx` | Full French version |
| 17.5 | Add Framer Motion entrance animation | `Login.tsx` | Subtle fade-in |
| 17.6 | Verify all auth flows work (OAuth, email) | `Login.tsx` | Login redirects correctly |

### QA Checks

- Login page renders at target viewports
- OAuth flow completes successfully
- Language toggle works
- `pnpm test` passes

### Rollback Plan

`webdev_rollback_checkpoint` to pre-Wave-17 checkpoint.

---

## Wave 18 — Page Transition Animations & Micro-Interactions

### Research Basis

Micro-interactions increase perceived quality by 30% and reduce perceived wait times [9]. Page transitions provide spatial orientation. The animation budget (max 3 concurrent) prevents performance degradation.

### Execution Plan

| Step | Action | Files Touched | Acceptance Criteria |
|---|---|---|---|
| 18.1 | Create `PageTransition` wrapper component with Framer Motion | `client/src/components/PageTransition.tsx` | Fade-in-up on mount |
| 18.2 | Wrap all page routes in `PageTransition` | `App.tsx` | Smooth transitions between pages |
| 18.3 | Add card hover effects (shadow + translateY) to all RACard instances | `RACard.tsx` | Consistent hover feedback |
| 18.4 | Add button press feedback (scale) | Button component | Tactile press response |
| 18.5 | Add progress bar fill animations | Progress components | Smooth fill on data load |
| 18.6 | Respect `prefers-reduced-motion` media query | All animation files | Animations disabled for users who prefer |

### QA Checks

- Page transitions are smooth (no jank)
- Hover effects work on all cards
- `prefers-reduced-motion` disables animations
- `pnpm test` passes

### Rollback Plan

`webdev_rollback_checkpoint` to pre-Wave-18 checkpoint.

---

## Wave 19 — Accessibility Hardening (WCAG 2.2 AA Compliance)

### Research Basis

The Accessible Canada Act (ACA) and WCAG 2.2 AA are the compliance targets for Canadian public service platforms [2] [8]. This wave addresses the remaining accessibility gaps identified in the audit: ARIA coverage, focus management, landmark roles, and contrast.

### Execution Plan

| Step | Action | Files Touched | Acceptance Criteria |
|---|---|---|---|
| 19.1 | Add ARIA labels to all interactive elements (200+ additions) | All page files | Every button, link, input has accessible name |
| 19.2 | Add landmark roles to all page regions | Layout files | `nav`, `main`, `complementary`, `contentinfo` |
| 19.3 | Ensure visible focus indicators on all interactive elements | `index.css` | Focus ring visible on Tab navigation |
| 19.4 | Fix all contrast violations (text on background) | Various files | All text meets 4.5:1 (normal) or 3:1 (large) |
| 19.5 | Add `alt` text to all images | Various files | Descriptive alt text on all `img` tags |
| 19.6 | Ensure all forms have associated labels | Form pages | `label` + `htmlFor` on all inputs |
| 19.7 | Test with keyboard-only navigation | All pages | Every feature reachable via keyboard |

### QA Checks

- Lighthouse accessibility score ≥ 95
- axe-core reports zero critical violations
- Keyboard navigation reaches all interactive elements
- Screen reader announces all content correctly
- `pnpm test` passes

### Rollback Plan

`webdev_rollback_checkpoint` to pre-Wave-19 checkpoint.

---

## Wave 20 — Final Polish, Performance Audit & Trust Signals

### Research Basis

The final wave addresses the "last 5%" that separates good from world-class: consistent favicon, meta tags, loading performance, trust badges, and the institutional footer mandate [1] [7] [10].

### Execution Plan

| Step | Action | Files Touched | Acceptance Criteria |
|---|---|---|---|
| 20.1 | Verify favicon renders correctly across all pages | `index.html` | Favicon visible in all browser tabs |
| 20.2 | Add trust badges to authenticated portal footer | Layout files | WCAG AA, bilingual, Canadian data badges |
| 20.3 | Ensure "© 2026 Rusinga International Consulting Ltd." in all footers | Layout files | Institutional footer on every page |
| 20.4 | Optimize image loading (lazy load below-fold images) | Various files | `loading="lazy"` on non-critical images |
| 20.5 | Add `prefers-color-scheme` media query preparation | `index.css` | Dark mode tokens defined (not activated) |
| 20.6 | Final cross-browser test (Chrome, Firefox, Safari, Edge) | All pages | No rendering issues |
| 20.7 | Final bilingual audit — switch to French, verify every page | All pages | 100% French coverage |
| 20.8 | Generate final Lighthouse report | All pages | Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95 |

### QA Checks

- Full regression test — all 399+ tests pass
- All routes resolve (zero 404s)
- All features functional
- Lighthouse scores meet targets
- French version complete

### Rollback Plan

`webdev_rollback_checkpoint` to pre-Wave-20 checkpoint.

---

## Execution Timeline

| Wave | Estimated Effort | Dependencies | Priority |
|---|---|---|---|
| Wave 1 | Foundation | None | **Critical** |
| Wave 2 | Foundation | Wave 1 | **Critical** |
| Wave 3 | Foundation | Wave 1 | **Critical** |
| Wave 4 | Learner Portal | Waves 1–2 | **High** |
| Wave 5 | Foundation | Wave 1 | **High** |
| Wave 6 | Learner Portal | Waves 1–2 | **High** |
| Wave 7 | Learner Portal | Waves 1–2 | **Medium-High** |
| Wave 8 | Learner Portal | Waves 1–2 | **Medium-High** |
| Wave 9 | Learner Portal | Waves 1–2 | **Medium** |
| Wave 10 | Learner Portal | Waves 1–2 | **Medium** |
| Wave 11 | Multi-Portal | Waves 1–3 | **High** |
| Wave 12 | Multi-Portal | Waves 1–3 | **High** |
| Wave 13 | Multi-Portal | Waves 1–3 | **High** |
| Wave 14 | Multi-Portal | Waves 1–3 | **Medium** |
| Wave 15 | Multi-Portal | Waves 11–14 | **Medium** |
| Wave 16 | Polish | Waves 1–2 | **High** |
| Wave 17 | Polish | Waves 1–2 | **Medium** |
| Wave 18 | Polish | Waves 1–15 | **Medium** |
| Wave 19 | Polish | Waves 1–18 | **Critical** |
| Wave 20 | Polish | Waves 1–19 | **Critical** |

---

## References

[1] GC Design System — Canada.ca. https://design-system.canada.ca/
[2] WCAG 2.2 — W3C. https://www.w3.org/TR/WCAG22/
[3] USWDS Design Tokens. https://designsystem.digital.gov/design-tokens/
[4] LMS UI/UX Design — Riseapps. https://riseapps.co/lms-ui-ux-design/
[5] EdTech UI/UX Principles — WeSoftYou. https://wesoftyou.com/elearning/top-7-edtech-ui-ux-design-principles-you-cannot-ignore/
[6] High Contrast Dashboard Design — Design Preference (Internal). DESIGN_SYSTEM_BASELINE.md §2.4
[7] Government of Canada Digital Standards. https://www.canada.ca/en/government/system/digital-government/government-canada-digital-standards.html
[8] Accessible Canada Act — Level Access. https://www.levelaccess.com/blog/canadian-accessibility-laws/
[9] SaaS UX Design — Userflow. https://www.userflow.com/blog/saas-ux-design-the-ultimate-guide-to-creating-exceptional-user-experiences
[10] Conversion UX Patterns — Design Sphere. https://medium.com/@design.sphere/top-conversion-patterns-we-use-to-improve-signups-for-clients-c8eb0024c7e3
