import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import AuthGuard from "./components/AuthGuard";
import { ThemeProvider } from "./contexts/ThemeContext";
import { GamificationProvider } from "./contexts/GamificationContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LearningMaterials from "./pages/LearningMaterials";
import TutoringSessions from "./pages/TutoringSessions";
import Authorizations from "./pages/Authorizations";
import Progress from "./pages/Progress";
import Results from "./pages/Results";
import Reports from "./pages/Reports";
import CalendarPage from "./pages/Calendar";
import Notifications from "./pages/Notifications";
import CommunityForum from "./pages/CommunityForum";
import Help from "./pages/Help";
import MyProfile from "./pages/MyProfile";
import MySettings from "./pages/MySettings";
import ProgramSelect from "./pages/ProgramSelect";
import PathList from "./pages/PathList";
import PathDetail from "./pages/PathDetail";
import LessonViewer from "./pages/LessonViewer";
import QuizPage from "./pages/QuizPage";
import Leaderboard from "./pages/Leaderboard";
import WeeklyChallenges from "./pages/WeeklyChallenges";
import SLEPractice from "./pages/SLEPractice";
import AIAssistant from "./pages/AIAssistant";
import AdminDashboard from "./pages/AdminDashboard";
import Notes from "./pages/Notes";
import Flashcards from "./pages/Flashcards";
import StudyPlanner from "./pages/StudyPlanner";
import Vocabulary from "./pages/Vocabulary";
import DiscussionBoards from "./pages/DiscussionBoards";
import WritingPortfolio from "./pages/WritingPortfolio";
import PronunciationLab from "./pages/PronunciationLab";
import Achievements from "./pages/Achievements";
import ReadingLab from "./pages/ReadingLab";
import ListeningLab from "./pages/ListeningLab";
import GrammarDrills from "./pages/GrammarDrills";
import ProgressAnalytics from "./pages/ProgressAnalytics";
import PeerReview from "./pages/PeerReview";
import MockSLEExam from "./pages/MockSLEExam";
import CoachDashboard from "./pages/CoachDashboard";
import StudyGroups from "./pages/StudyGroups";
import DictationExercises from "./pages/DictationExercises";
import CulturalImmersion from "./pages/CulturalImmersion";
import Bookmarks from "./pages/Bookmarks";
import GlobalSearch from "./pages/GlobalSearch";
import OnboardingWizard from "./pages/OnboardingWizard";
import DailyReview from "./pages/DailyReview";
import AdminCoachHub from "./pages/AdminCoachHub";
import AdminExecutiveSummary from "./pages/AdminExecutiveSummary";
import AdminContentPipeline from "./pages/AdminContentPipeline";
import PortalComingSoon from "./pages/PortalComingSoon";
import CoachDashboardHome from "./pages/coach/CoachDashboardHome";
import CoachStudents from "./pages/coach/CoachStudents";
import CoachSessions from "./pages/coach/CoachSessions";
import CoachRevenue from "./pages/coach/CoachRevenue";
import CoachPerformance from "./pages/coach/CoachPerformance";
import HRDashboardHome from "./pages/hr/HRDashboardHome";
import HRTeam from "./pages/hr/HRTeam";
import HRCohorts from "./pages/hr/HRCohorts";
import HRBudget from "./pages/hr/HRBudget";
import HRCompliance from "./pages/hr/HRCompliance";
import AdminDashboardHome from "./pages/admin/AdminDashboardHome";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminCommerce from "./pages/admin/AdminCommerce";
import AdminMarketing from "./pages/admin/AdminMarketing";
import AdminKPIs from "./pages/admin/AdminKPIs";
import AdminMedia from "./pages/admin/AdminMedia";
import AdminImportExport from "./pages/admin/AdminImportExport";
import AcceptInvitation from "./pages/AcceptInvitation";
import CelebrationOverlay from "./components/CelebrationOverlay";
import FloatingAICompanion from "./components/FloatingAICompanion";
import { LanguageProvider } from "./contexts/LanguageContext";

/**
 * Helper: wraps a component in AuthGuard for protected routes.
 * This ensures the user must be authenticated before accessing the page.
 */
function Protected({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) {
  return <AuthGuard requiredRole={requiredRole}>{children}</AuthGuard>;
}

function Router() {
  return (
    <Switch>
      {/* Public routes — no authentication required */}
      <Route path="/" component={Login} />
      <Route path="/invite/:token" component={AcceptInvitation} />
      <Route path="/404" component={NotFound} />

      {/* Protected Learner Portal routes — require authentication */}
      <Route path="/dashboard">{() => <Protected><Dashboard /></Protected>}</Route>
      <Route path="/programs">{() => <Protected><ProgramSelect /></Protected>}</Route>
      <Route path="/programs/:programId">{() => <Protected><PathList /></Protected>}</Route>
      <Route path="/programs/:programId/:pathId">{() => <Protected><PathDetail /></Protected>}</Route>
      <Route path="/programs/:programId/:pathId/quiz/:quizId">{() => <Protected><QuizPage /></Protected>}</Route>
      <Route path="/programs/:programId/:pathId/:lessonId">{() => <Protected><LessonViewer /></Protected>}</Route>
      <Route path="/learning-materials">{() => <Protected><LearningMaterials /></Protected>}</Route>
      <Route path="/tutoring-sessions">{() => <Protected><TutoringSessions /></Protected>}</Route>
      <Route path="/authorizations">{() => <Protected><Authorizations /></Protected>}</Route>
      <Route path="/progress">{() => <Protected><Progress /></Protected>}</Route>
      <Route path="/results">{() => <Protected><Results /></Protected>}</Route>
      <Route path="/reports">{() => <Protected><Reports /></Protected>}</Route>
      <Route path="/calendar">{() => <Protected><CalendarPage /></Protected>}</Route>
      <Route path="/notifications">{() => <Protected><Notifications /></Protected>}</Route>
      <Route path="/community-forum">{() => <Protected><CommunityForum /></Protected>}</Route>
      <Route path="/leaderboard">{() => <Protected><Leaderboard /></Protected>}</Route>
      <Route path="/challenges">{() => <Protected><WeeklyChallenges /></Protected>}</Route>
      <Route path="/sle-practice">{() => <Protected><SLEPractice /></Protected>}</Route>
      <Route path="/ai-assistant">{() => <Protected><AIAssistant /></Protected>}</Route>
      <Route path="/help">{() => <Protected><Help /></Protected>}</Route>
      <Route path="/profile">{() => <Protected><MyProfile /></Protected>}</Route>
      <Route path="/settings">{() => <Protected><MySettings /></Protected>}</Route>
      <Route path="/notes">{() => <Protected><Notes /></Protected>}</Route>
      <Route path="/flashcards">{() => <Protected><Flashcards /></Protected>}</Route>
      <Route path="/study-planner">{() => <Protected><StudyPlanner /></Protected>}</Route>
      <Route path="/vocabulary">{() => <Protected><Vocabulary /></Protected>}</Route>
      <Route path="/discussions">{() => <Protected><DiscussionBoards /></Protected>}</Route>
      <Route path="/writing-portfolio">{() => <Protected><WritingPortfolio /></Protected>}</Route>
      <Route path="/pronunciation-lab">{() => <Protected><PronunciationLab /></Protected>}</Route>
      <Route path="/achievements">{() => <Protected><Achievements /></Protected>}</Route>
      <Route path="/reading-lab">{() => <Protected><ReadingLab /></Protected>}</Route>
      <Route path="/listening-lab">{() => <Protected><ListeningLab /></Protected>}</Route>
      <Route path="/grammar-drills">{() => <Protected><GrammarDrills /></Protected>}</Route>
      <Route path="/analytics">{() => <Protected><ProgressAnalytics /></Protected>}</Route>
      <Route path="/peer-review">{() => <Protected><PeerReview /></Protected>}</Route>
      <Route path="/mock-sle">{() => <Protected><MockSLEExam /></Protected>}</Route>
      <Route path="/study-groups">{() => <Protected><StudyGroups /></Protected>}</Route>
      <Route path="/dictation">{() => <Protected><DictationExercises /></Protected>}</Route>
      <Route path="/cultural-immersion">{() => <Protected><CulturalImmersion /></Protected>}</Route>
      <Route path="/bookmarks">{() => <Protected><Bookmarks /></Protected>}</Route>
      <Route path="/search">{() => <Protected><GlobalSearch /></Protected>}</Route>
      <Route path="/onboarding">{() => <Protected><OnboardingWizard /></Protected>}</Route>
      <Route path="/daily-review">{() => <Protected><DailyReview /></Protected>}</Route>

      {/* Protected Coach Portal routes */}
      <Route path="/coach">{() => <Protected><CoachDashboard /></Protected>}</Route>
      <Route path="/coach/portal">{() => <Protected><CoachDashboardHome /></Protected>}</Route>
      <Route path="/coach/students">{() => <Protected><CoachStudents /></Protected>}</Route>
      <Route path="/coach/sessions">{() => <Protected><CoachSessions /></Protected>}</Route>
      <Route path="/coach/revenue">{() => <Protected><CoachRevenue /></Protected>}</Route>
      <Route path="/coach/performance">{() => <Protected><CoachPerformance /></Protected>}</Route>

      {/* Protected Client Portal (HR) routes */}
      <Route path="/hr/portal">{() => <Protected><HRDashboardHome /></Protected>}</Route>
      <Route path="/hr/portal/dashboard">{() => <Protected><HRDashboardHome /></Protected>}</Route>
      <Route path="/hr/portal/team">{() => <Protected><HRTeam /></Protected>}</Route>
      <Route path="/hr/portal/cohorts">{() => <Protected><HRCohorts /></Protected>}</Route>
      <Route path="/hr/portal/budget">{() => <Protected><HRBudget /></Protected>}</Route>
      <Route path="/hr/portal/compliance">{() => <Protected><HRCompliance /></Protected>}</Route>
      {/* Legacy HR routes redirect to new portal paths */}
      <Route path="/hr/team">{() => <Protected><HRTeam /></Protected>}</Route>
      <Route path="/hr/cohorts">{() => <Protected><HRCohorts /></Protected>}</Route>
      <Route path="/hr/budget">{() => <Protected><HRBudget /></Protected>}</Route>
      <Route path="/hr/compliance">{() => <Protected><HRCompliance /></Protected>}</Route>

      {/* Protected Admin routes — require admin role */}
      <Route path="/admin">{() => <Protected requiredRole="admin"><AdminDashboard /></Protected>}</Route>
      <Route path="/admin/coaches">{() => <Protected requiredRole="admin"><AdminCoachHub /></Protected>}</Route>
      <Route path="/admin/analytics">{() => <Protected requiredRole="admin"><AdminExecutiveSummary /></Protected>}</Route>
      <Route path="/admin/content-pipeline">{() => <Protected requiredRole="admin"><AdminContentPipeline /></Protected>}</Route>
      <Route path="/admin/control">{() => <Protected requiredRole="admin"><AdminDashboardHome /></Protected>}</Route>
      <Route path="/admin/control/users">{() => <Protected requiredRole="admin"><AdminUsers /></Protected>}</Route>
      <Route path="/admin/control/courses">{() => <Protected requiredRole="admin"><AdminCourses /></Protected>}</Route>
      <Route path="/admin/control/commerce">{() => <Protected requiredRole="admin"><AdminCommerce /></Protected>}</Route>
      <Route path="/admin/control/marketing">{() => <Protected requiredRole="admin"><AdminMarketing /></Protected>}</Route>
      <Route path="/admin/control/kpis">{() => <Protected requiredRole="admin"><AdminKPIs /></Protected>}</Route>
      <Route path="/admin/control/media">{() => <Protected requiredRole="admin"><AdminMedia /></Protected>}</Route>
      <Route path="/admin/control/import-export">{() => <Protected requiredRole="admin"><AdminImportExport /></Protected>}</Route>

      {/* Catch-all */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <LanguageProvider>
        <GamificationProvider>
          <TooltipProvider>
            <Toaster />
            <CelebrationOverlay />
            <FloatingAICompanion />
            <Router />
          </TooltipProvider>
        </GamificationProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
