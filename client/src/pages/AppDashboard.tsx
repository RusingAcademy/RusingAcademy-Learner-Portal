/**
 * AppDashboard — Unified Section Controller
 *
 * Works exactly like AdminControlCenter: receives a `section` prop,
 * looks it up in a registry, and renders the matching component
 * inside the shared AppLayout shell.
 *
 * Existing page components are reused without modification.
 */
import { lazy, Suspense } from "react";
import AppLayout from "@/components/AppLayout";

// ── Skeleton loader ──────────────────────────────────────────────────
function SectionSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-48 bg-muted rounded" />
      <div className="h-4 w-96 bg-muted rounded" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-muted rounded-lg" />
        ))}
      </div>
      <div className="h-64 bg-muted rounded-lg" />
    </div>
  );
}

// ── Lazy imports — existing pages, NOT modified ──────────────────────
// PERSONAL sections
const LearnerDashboard = lazy(() => import("./LearnerDashboard"));
const LearnerCourses = lazy(() => import("./LearnerCourses"));
const LearnerProgress = lazy(() => import("./LearnerProgress"));
const MySessions = lazy(() => import("./MySessions"));
const LearnerPayments = lazy(() => import("./LearnerPayments"));
const LearnerFavorites = lazy(() => import("./LearnerFavorites"));
const LearnerSettings = lazy(() => import("./LearnerSettings"));
const MyCertificates = lazy(() => import("./MyCertificates"));

// PRACTICE sections
const AICoach = lazy(() => import("./AICoach"));
const ConversationPractice = lazy(() => import("./ConversationPractice"));
const PracticeHistory = lazy(() => import("./PracticeHistory"));
const SLEPractice = lazy(() => import("./SLEPractice"));
const SLEExamSimulation = lazy(() => import("./SLEExamSimulation"));
const SLEProgressDashboard = lazy(() => import("./SLEProgressDashboard"));
const BadgesCatalog = lazy(() => import("./BadgesCatalog"));
const LearnerLoyalty = lazy(() => import("./LearnerLoyalty"));

// COACHING sections (coach+)
const CoachDashboard = lazy(() => import("./CoachDashboard"));
const CoachProfileEditor = lazy(() => import("./CoachProfileEditor"));
const CoachAvailabilityPage = lazy(() => import("./CoachAvailabilityPage"));
const CoachEarnings = lazy(() => import("./CoachEarnings"));
const VideoSession = lazy(() => import("./VideoSession"));
const CoachGuide = lazy(() => import("./CoachGuide"));

// ORGANIZATION sections (hr_admin+)
const HRDashboard = lazy(() => import("./HRDashboard"));

// ── Section registry ─────────────────────────────────────────────────
// Maps section IDs (from route) to existing page components.
// The AppLayout sidebar nav items point to /app/:sectionId.
const sectionMap: Record<string, React.LazyExoticComponent<any>> = {
  // PERSONAL
  overview: LearnerDashboard,
  "my-courses": LearnerCourses,
  "my-progress": LearnerProgress,
  "my-sessions": MySessions,
  "my-payments": LearnerPayments,
  favorites: LearnerFavorites,
  settings: LearnerSettings,
  certificates: MyCertificates,
  notifications: LearnerDashboard, // placeholder until dedicated page

  // PRACTICE
  "ai-practice": AICoach,
  conversation: ConversationPractice,
  "practice-history": PracticeHistory,
  simulation: SLEPractice,
  "sle-exam": SLEExamSimulation,
  "sle-progress": SLEProgressDashboard,
  badges: BadgesCatalog,
  loyalty: LearnerLoyalty,

  // COACHING
  "my-students": CoachDashboard,
  availability: CoachAvailabilityPage,
  "coach-profile": CoachProfileEditor,
  earnings: CoachEarnings,
  "video-sessions": VideoSession,
  "coach-guide": CoachGuide,

  // ORGANIZATION
  team: HRDashboard,
  cohorts: HRDashboard,
  budget: HRDashboard,
  compliance: HRDashboard,
};

// ── Component ────────────────────────────────────────────────────────
interface Props {
  section?: string;
}

export default function AppDashboard({ section = "overview" }: Props) {
  const Content = sectionMap[section] || LearnerDashboard;

  return (
    <AppLayout>
      <Suspense fallback={<SectionSkeleton />}>
        <Content />
      </Suspense>
    </AppLayout>
  );
}
