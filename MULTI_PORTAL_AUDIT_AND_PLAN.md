# RusingÂcademy Multi-Portal System — Audit & Implementation Plan

**Prepared for:** Steven Barholere, CEO — Rusinga International Consulting Ltd.
**Date:** February 14, 2026
**Author:** Manus AI — Design Engineering Division

---

## 1. Executive Summary

The RusingÂcademy Learning Portal (LRDG) currently operates as a single-portal system serving learners exclusively. This document audits the existing Learner's Portal architecture, analyzes the reusable assets available in the GitHub ecosystem repository, and proposes a structured, incremental plan to build three additional portals — **Coach Portal**, **HR Portal**, and **Admin Control System** — each with its own dedicated sidebar, dashboard, and feature set, all sharing a unified authentication backbone and design language.

The approach follows the established development principles: **surgical, incremental, non-destructive**, with each portal built as an independent workspace that does not alter the validated Learner's Portal.

---

## 2. Current Learner's Portal — Architecture Audit

### 2.1 Application Structure

The Learner's Portal is a full-stack React 19 + Express 4 + tRPC 11 application with TiDB (MySQL-compatible) as the database layer. The frontend uses Tailwind CSS 4 with shadcn/ui components, and the backend follows a schema-first Drizzle ORM workflow.

| Layer | Technology | Key Files |
|-------|-----------|-----------|
| Frontend Framework | React 19 + Wouter (routing) | `client/src/App.tsx` |
| Styling | Tailwind CSS 4 + shadcn/ui | `client/src/index.css` |
| State Management | tRPC React Query hooks | `client/src/lib/trpc.ts` |
| Backend API | tRPC 11 + Express 4 | `server/routers.ts` |
| Database ORM | Drizzle ORM | `drizzle/schema.ts` |
| Authentication | Custom JWT + session cookies | `server/_core/oauth.ts` |
| File Storage | S3 via platform helpers | `server/storage.ts` |

### 2.2 Page Inventory (53 Pages)

The Learner's Portal contains 53 page-level components organized into functional categories:

| Category | Pages | Description |
|----------|-------|-------------|
| **Core Navigation** | Dashboard, Home, Login, NotFound, OnboardingWizard | Entry points and authentication |
| **Program & Content** | ProgramSelect, PathList, PathDetail, LessonViewer, LearningMaterials | Course browsing and consumption |
| **Language Skills** | ReadingLab, ListeningLab, GrammarDrills, DictationExercises, PronunciationLab, WritingPortfolio, Vocabulary, Flashcards | Skill-specific practice modules |
| **Assessment** | QuizPage, MockSLEExam, SLEPractice, Results, DailyReview | Testing and evaluation |
| **Progress & Analytics** | Progress, ProgressAnalytics, Reports, Leaderboard, Achievements, WeeklyChallenges | Tracking and gamification |
| **Social & Collaboration** | CommunityForum, DiscussionBoards, PeerReview, StudyGroups, StudyPlanner | Peer interaction |
| **Utilities** | Calendar, Notes, Bookmarks, Notifications, GlobalSearch, Help, MyProfile, MySettings, AIAssistant | Supporting tools |
| **Admin (Basic)** | AdminDashboard, AdminCoachHub, AdminExecutiveSummary, AdminContentPipeline | Preliminary admin views |
| **Coach (Stub)** | CoachDashboard | Single coach view (placeholder) |

### 2.3 Sidebar Navigation Structure

The current sidebar (`Sidebar.tsx`) organizes navigation into four sections:

| Section | Items | Purpose |
|---------|-------|---------|
| **MAIN** | 12 items | Dashboard, Programs, Materials, Tutoring, Authorizations, Progress, Leaderboard, Challenges, SLE Practice, AI Assistant, Results, Reports, Calendar |
| **LEARNING TOOLS** | 11 items | Notes, Flashcards, Daily Review, Study Planner, Vocabulary, Writing, Pronunciation, Reading, Listening, Grammar, Dictation |
| **MORE** | 10 items | Mock SLE, Analytics, Peer Review, Study Groups, Cultural Immersion, Notifications, Discussions, Bookmarks, Search, Achievements, Help |
| **ADMIN** | 4 items | Admin Panel, Coach Hub, Executive Summary, Content Pipeline |

### 2.4 Database Schema (39 Tables)

The Drizzle schema defines 39 tables in the current Manus project, with the `users` table using a simplified role enum of `["user", "admin"]`.

| Domain | Tables |
|--------|--------|
| **User & Auth** | `users` |
| **Gamification** | `gamificationProfiles`, `userBadges`, `celebrationEvents`, `weeklyChallenges`, `challengeProgress` |
| **Content & Progress** | `lessonProgress`, `quizAttempts`, `pathEnrollments`, `activityLog` |
| **Study Tools** | `studyNotes`, `flashcardDecks`, `flashcards`, `studySessions`, `vocabularyItems`, `dailyStudyGoals` |
| **Social** | `discussionThreads`, `discussionReplies`, `studyGroups`, `studyGroupMembers`, `peerReviews`, `bookmarks` |
| **Skills** | `writingSubmissions`, `readingExercises`, `listeningExercises`, `grammarDrills`, `dictationExercises` |
| **Assessment** | `mockSleExams`, `certificates` |
| **Coaching** | `coachProfiles`, `coachApplications`, `commissionTiers`, `coachPayouts`, `coachAssignments` |
| **Content Pipeline** | `contentItems`, `contentTemplates`, `contentCalendar` |
| **Notifications** | `notifications` |
| **Onboarding** | `onboardingProfiles` |

### 2.5 tRPC Router Architecture

The server exposes a single `appRouter` composed of 20+ sub-routers organized across 7 sprint files:

| Router File | Sub-routers |
|-------------|-------------|
| `routers.ts` (main) | auth, gamification, challenges, celebrations, progress, quiz, activity, notifications, ai, admin |
| `routers-sprint17.ts` | notes, flashcards, studyPlanner, vocabulary |
| `routers-sprint22.ts` | aiVocabulary, dailyGoals, discussions, writing, recommendations |
| `routers-sprint31.ts` | certificates, readingLab, listeningLab, grammarDrills, peerReview |
| `routers-sprint41.ts` | mockSle, coach, studyGroups, bookmarks, dictation, search, onboarding, dailyReview |

---

## 3. GitHub Ecosystem Repository — Reusable Assets Analysis

The `rusingacademy-ecosystem` GitHub repository (104 MB, 122 pages) contains significantly more mature implementations of Coach, HR, and Admin portals that can serve as reference blueprints.

### 3.1 Coach Portal Assets (14 pages, ~8,350 lines)

| Page | Lines | Description |
|------|-------|-------------|
| `CoachDashboard.tsx` | 875 | Full dashboard with student overview, session management, earnings summary |
| `CoachDashboardNew.tsx` | 214 | Redesigned dashboard variant |
| `CoachEarnings.tsx` | 593 | Earnings overview with charts and period filters |
| `CoachEarningsHistory.tsx` | 502 | Historical earnings with export capability |
| `CoachPayments.tsx` | 372 | Payment processing and Stripe integration |
| `CoachGuide.tsx` | 787 | Onboarding guide for new coaches |
| `CoachTerms.tsx` | 435 | Terms of service and agreements |
| `CoachProfile.tsx` | 1,063 | Public-facing coach profile page |
| `CoachProfileEditor.tsx` | 625 | Profile editing with availability management |
| `CoachAvailabilityPage.tsx` | 269 | Calendar-based availability scheduling |
| `BecomeCoach.tsx` / `BecomeCoachNew.tsx` | 1,875 | Multi-step coach application forms |
| `Coaches.tsx` | 626 | Coach directory / listing page |

The repo also includes a dedicated `coachRouter` (embedded in `routers.ts`, ~500 lines) with procedures for profile management, earnings, student metrics, and session scheduling.

### 3.2 HR Portal Assets (1 page, ~1,172 lines)

| Page | Lines | Description |
|------|-------|-------------|
| `HRDashboard.tsx` | 1,172 | Comprehensive HR dashboard with tabs: Overview, Team, Cohorts, Budget, Compliance, Reports |

The repo includes a dedicated `hrRouter` (`server/routers/hr.ts`, 752 lines) with procedures for team management, training budget tracking, cohort analytics, compliance monitoring, and report generation.

### 3.3 Admin Control System Assets (38 section pages, ~15,600 lines)

The repo implements a sophisticated `AdminControlCenter` pattern with an `AdminLayout` component (282 lines) that provides a dedicated admin sidebar. The center uses a section-map architecture where each admin route renders a specific section component:

| Section Category | Pages | Key Features |
|-----------------|-------|--------------|
| **Core Operations** | DashboardOverview, UsersRoles, CoachesManagement, AdminSettings | User management, role assignment, system config |
| **Course Management** | CourseBuilder, AdminEnrollments, AdminCertificates, AdminGamification, WeeklyChallenges | Full course lifecycle management |
| **Commerce** | PricingCheckout, CouponsPage, SalesAnalytics, StripeTesting, OrgBillingDashboard | Pricing, payments, revenue analytics |
| **Marketing** | FunnelBuilder, CRMPage, AdminLeads, EmailPage, EmailTemplateBuilder | Lead management, email campaigns |
| **Content & AI** | ContentIntelligence, AICompanionPanel, AIPredictive, DripContent, MediaLibrary | Content strategy and AI tools |
| **Platform** | PageBuilder, VisualEditor, PreviewMode, Automations, ImportExport | CMS and automation tools |
| **Analytics** | Analytics, LiveKPIDashboard, ActivityLogs, ABTesting | Real-time monitoring and testing |
| **Security** | RBACPermissions, AdminReviews | Role-based access control |
| **Enterprise** | EnterpriseMode, SLEExamMode, OnboardingWorkflow, NotificationsCenter | Enterprise features |

### 3.4 Role-Based Access in the Repo

The GitHub repo uses an expanded role enum: `["owner", "admin", "hr_admin", "coach", "learner", "user"]` with a unified `AppLayout` component that dynamically filters sidebar sections based on the user's role. This is the target architecture for the multi-portal system.

---

## 4. Gap Analysis — Current vs. Target

| Dimension | Current (Manus Project) | Target (Multi-Portal) | Gap |
|-----------|------------------------|----------------------|-----|
| **User Roles** | `user`, `admin` | `owner`, `admin`, `hr_admin`, `coach`, `learner`, `user` | Expand role enum |
| **Portals** | 1 (Learner) | 4 (Learner, Coach, HR, Admin) | Build 3 new portals |
| **Layouts** | 1 Sidebar layout | 4 distinct sidebar layouts | Create 3 new layouts |
| **Coach Features** | 1 stub page | 14 pages + dedicated router | Build full Coach portal |
| **HR Features** | None | 1 comprehensive dashboard + router | Build HR portal from scratch |
| **Admin Features** | 4 basic pages | 38 section pages + AdminLayout | Build Admin Control System |
| **DB Schema** | 39 tables, simple roles | 148+ tables, RBAC | Incremental schema expansion |
| **Authentication** | Basic JWT | Role-based routing + portal switching | Add portal selector |

---

## 5. Implementation Plan — Multi-Portal System

### 5.1 Architecture Vision

The multi-portal system will be built as a **single application with role-based routing**. Each portal will have its own layout shell (sidebar + header), its own route namespace, and its own set of pages. The login page will serve as the central hub with portal selection buttons.

```
┌─────────────────────────────────────────────┐
│              LOGIN / LANDING PAGE            │
│                                              │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│   │ Learner  │ │  Coach   │ │    HR    │   │
│   │ Portal   │ │  Portal  │ │  Portal  │   │
│   └──────────┘ └──────────┘ └──────────┘   │
│                ┌──────────┐                  │
│                │  Admin   │                  │
│                │  Control │                  │
│                └──────────┘                  │
└─────────────────────────────────────────────┘
         │              │            │            │
    /dashboard     /coach/*     /hr/*       /admin/*
    (Learner       (Coach       (HR         (Admin
     Sidebar)       Sidebar)    Sidebar)    Sidebar)
```

### 5.2 Phased Delivery Plan

The implementation follows a strict **incremental, non-destructive** methodology. Each phase is self-contained, testable, and does not modify the existing Learner's Portal.

---

#### Phase 0: Portal Selector Buttons (Immediate — This Sprint)

**Scope:** Add 3 navigation buttons to the login/landing page that link to the Coach, HR, and Admin portals. These buttons will initially navigate to placeholder "Coming Soon" pages.

**Files Modified:**
- `client/src/pages/Login.tsx` — Add portal selector buttons below the login form
- `client/src/App.tsx` — Add placeholder routes for `/coach`, `/hr`, `/admin`

**Estimated Effort:** 1 hour

---

#### Phase 1: Coach Portal (Sprint A — Estimated 3-5 days)

**Objective:** Build a dedicated Coach Portal with its own sidebar, dashboard, and core features for language coaches to manage their students, sessions, earnings, and profile.

| Feature | Pages to Build | Priority |
|---------|---------------|----------|
| Coach Dashboard | CoachDashboard (overview, stats, upcoming sessions) | P0 |
| Coach Sidebar/Layout | CoachLayout with coach-specific navigation | P0 |
| Student Management | Student list, progress tracking, session notes | P0 |
| Session Scheduling | Calendar view, availability management | P1 |
| Earnings & Payments | Earnings overview, history, payout requests | P1 |
| Coach Profile | Profile editor, public profile page | P1 |
| Coach Guide | Onboarding guide, best practices, resources | P2 |
| Coach Terms | Terms of service, agreement management | P2 |

**Database Changes:**
- Expand `users.role` enum to include `"coach"`
- Ensure `coachProfiles`, `coachAssignments`, `coachPayouts` tables are properly populated
- Add `coaching_sessions` table for session scheduling

**Backend (tRPC):**
- Create dedicated `coachPortalRouter` with procedures for dashboard stats, student list, session management, earnings queries, and profile updates
- All procedures gated by `ctx.user.role === "coach"` check

**Route Namespace:** `/coach/*` (e.g., `/coach/dashboard`, `/coach/students`, `/coach/earnings`, `/coach/profile`, `/coach/sessions`, `/coach/guide`)

---

#### Phase 2: HR Portal (Sprint B — Estimated 3-5 days)

**Objective:** Build an HR Portal for organizational administrators to manage their team's language training, track budgets, monitor compliance, and generate reports.

| Feature | Pages to Build | Priority |
|---------|---------------|----------|
| HR Dashboard | Overview with KPIs, team progress, budget status | P0 |
| HR Sidebar/Layout | HRLayout with HR-specific navigation | P0 |
| Team Management | Employee list, training assignments, progress tracking | P0 |
| Cohort Management | Training cohorts, group assignments, batch operations | P1 |
| Budget Tracking | Training budget allocation, spending, forecasting | P1 |
| Compliance & Reporting | SLE compliance tracking, exportable reports, audit trails | P1 |
| Organization Settings | Department structure, manager assignments, access controls | P2 |

**Database Changes:**
- Expand `users.role` enum to include `"hr_admin"`
- Create `organizations`, `org_members`, `org_course_assignments` tables
- Create `training_budgets`, `compliance_records` tables

**Backend (tRPC):**
- Create dedicated `hrPortalRouter` with procedures for team overview, cohort management, budget tracking, compliance queries, and report generation
- All procedures gated by `ctx.user.role === "hr_admin"` check

**Route Namespace:** `/hr/*` (e.g., `/hr/dashboard`, `/hr/team`, `/hr/cohorts`, `/hr/budget`, `/hr/compliance`, `/hr/reports`)

---

#### Phase 3: Admin Control System (Sprint C — Estimated 5-8 days)

**Objective:** Build a comprehensive Admin Control System for platform administrators to manage all aspects of the RusingÂcademy ecosystem — users, content, commerce, analytics, and system configuration.

| Feature | Pages to Build | Priority |
|---------|---------------|----------|
| Admin Dashboard | Executive overview with live KPIs, system health | P0 |
| Admin Sidebar/Layout | AdminLayout with categorized admin navigation | P0 |
| User & Role Management | User list, role assignment, RBAC permissions | P0 |
| Coach Management | Coach applications, approvals, performance tracking | P0 |
| Course Management | Course builder, lesson editor, content pipeline | P1 |
| Commerce | Pricing management, coupons, Stripe integration, revenue analytics | P1 |
| Content & Media | Media library, content intelligence, drip content scheduling | P1 |
| Marketing | CRM, lead management, email campaigns, funnel builder | P2 |
| Analytics | Live KPI dashboard, A/B testing, activity logs | P2 |
| Platform Tools | Page builder, visual editor, automations, import/export | P2 |
| Enterprise | Enterprise mode, SLE exam management, onboarding workflows | P3 |

**Database Changes:**
- Ensure `roles`, `permissions`, `role_permissions`, `user_permissions` tables exist for RBAC
- Create `admin_activity_log`, `admin_notifications` tables
- Leverage existing admin tables from the current schema

**Backend (tRPC):**
- Expand the existing `admin` router with sub-routers for each admin section
- Implement `adminProcedure` middleware that checks `ctx.user.role === "admin" || ctx.user.role === "owner"`
- Create dedicated routers: `adminUsersRouter`, `adminCoursesRouter`, `adminCommerceRouter`, `adminAnalyticsRouter`

**Route Namespace:** `/admin/*` (e.g., `/admin/overview`, `/admin/users`, `/admin/coaches`, `/admin/courses`, `/admin/pricing`, `/admin/analytics`, `/admin/settings`)

---

### 5.3 Cross-Portal Shared Infrastructure

Before building individual portals, the following shared infrastructure must be established:

| Component | Description | Impact |
|-----------|-------------|--------|
| **Role Expansion** | Extend `users.role` enum from `["user", "admin"]` to `["owner", "admin", "hr_admin", "coach", "learner", "user"]` | Schema migration required |
| **Portal Selector** | Login page with portal buttons + role-based auto-redirect after login | Login.tsx modification |
| **Layout System** | Reusable `PortalLayout` base component with configurable sidebar sections | New shared component |
| **Role Guard** | Frontend route guard component that checks user role before rendering portal pages | New shared component |
| **Backend Middleware** | `coachProcedure`, `hrProcedure`, `adminProcedure` tRPC middleware | Server-side role gates |

### 5.4 Design Consistency

All portals will share the RusingÂcademy design language:

| Element | Specification |
|---------|--------------|
| **Primary Color** | `#008090` (teal) |
| **Accent Color** | `#f5a623` (gold) |
| **Typography** | Playfair Display (headings) + system sans-serif (body) |
| **Glassmorphism** | Applied to cards, panels, and CTAs per design mandate |
| **Logo** | RusingÂcademy icon + wordmark in all portal headers |
| **Footer** | "© 2026 RusingÂcademy — Barholex Media Inc." + "Rusinga International Consulting Ltd." |

Each portal will have a **distinct accent color** for visual differentiation while maintaining the overall brand identity:

| Portal | Accent Color | Icon |
|--------|-------------|------|
| Learner | `#008090` (teal) | `school` |
| Coach | `#7c3aed` (violet) | `person` |
| HR | `#2563eb` (blue) | `business` |
| Admin | `#dc2626` (red) | `admin_panel_settings` |

---

## 6. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Schema migration breaks existing data | Medium | High | Test migrations on staging first; use additive-only changes |
| New portals increase bundle size significantly | Medium | Medium | Code-split each portal with lazy loading |
| Role expansion conflicts with existing auth | Low | High | Ensure backward compatibility: existing "user" role maps to "learner" |
| TypeScript LSP crashes with larger codebase | High | Low | Already mitigated with increased memory; runtime unaffected |

---

## 7. Recommended Execution Order

1. **Phase 0 (Now):** Add portal selector buttons to the login page with "Coming Soon" placeholders
2. **Phase 1 (Next):** Build Coach Portal — highest business value, most reference code available
3. **Phase 2 (After Coach):** Build HR Portal — critical for B2B/government department sales
4. **Phase 3 (Final):** Build Admin Control System — most complex, benefits from patterns established in Phases 1-2

Each phase follows the established workflow: **feature branch → incremental build → staging validation → immutability check → checkpoint → user validation**.

---

## 8. Conclusion

The current Learner's Portal provides an excellent foundation for a multi-portal ecosystem. The GitHub repository contains substantial reference implementations that can accelerate development significantly. By following the phased, incremental approach outlined above, we can build three new portals without risking the stability of the existing Learner's Portal. The portal selector buttons (Phase 0) can be implemented immediately to establish the navigation framework.

---

*Document prepared by Manus AI — February 14, 2026*
*RusingÂcademy — Rusinga International Consulting Ltd.*
