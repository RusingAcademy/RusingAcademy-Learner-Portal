import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
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
import CelebrationOverlay from "./components/CelebrationOverlay";
import FloatingAICompanion from "./components/FloatingAICompanion";
import { LanguageProvider } from "./contexts/LanguageContext";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/programs" component={ProgramSelect} />
      <Route path="/programs/:programId" component={PathList} />
      <Route path="/programs/:programId/:pathId" component={PathDetail} />
      <Route path="/programs/:programId/:pathId/quiz/:quizId" component={QuizPage} />
      <Route path="/programs/:programId/:pathId/:lessonId" component={LessonViewer} />
      <Route path="/learning-materials" component={LearningMaterials} />
      <Route path="/tutoring-sessions" component={TutoringSessions} />
      <Route path="/authorizations" component={Authorizations} />
      <Route path="/progress" component={Progress} />
      <Route path="/results" component={Results} />
      <Route path="/reports" component={Reports} />
      <Route path="/calendar" component={CalendarPage} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/community-forum" component={CommunityForum} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/challenges" component={WeeklyChallenges} />
      <Route path="/sle-practice" component={SLEPractice} />
      <Route path="/ai-assistant" component={AIAssistant} />
      <Route path="/help" component={Help} />
      <Route path="/profile" component={MyProfile} />
      <Route path="/settings" component={MySettings} />
      <Route path="/notes" component={Notes} />
      <Route path="/flashcards" component={Flashcards} />
      <Route path="/study-planner" component={StudyPlanner} />
      <Route path="/vocabulary" component={Vocabulary} />
      <Route path="/discussions" component={DiscussionBoards} />
      <Route path="/writing-portfolio" component={WritingPortfolio} />
      <Route path="/pronunciation-lab" component={PronunciationLab} />
      <Route path="/achievements" component={Achievements} />
      <Route path="/reading-lab" component={ReadingLab} />
      <Route path="/listening-lab" component={ListeningLab} />
      <Route path="/grammar-drills" component={GrammarDrills} />
      <Route path="/analytics" component={ProgressAnalytics} />
      <Route path="/peer-review" component={PeerReview} />
      <Route path="/mock-sle" component={MockSLEExam} />
      <Route path="/coach" component={CoachDashboard} />
      <Route path="/study-groups" component={StudyGroups} />
      <Route path="/dictation" component={DictationExercises} />
      <Route path="/cultural-immersion" component={CulturalImmersion} />
      <Route path="/bookmarks" component={Bookmarks} />
      <Route path="/search" component={GlobalSearch} />
      <Route path="/onboarding" component={OnboardingWizard} />
      <Route path="/daily-review" component={DailyReview} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/coaches" component={AdminCoachHub} />
      <Route path="/admin/analytics" component={AdminExecutiveSummary} />
      <Route path="/admin/content-pipeline" component={AdminContentPipeline} />
      {/* Coach Portal Routes */}
      <Route path="/coach/portal" component={CoachDashboardHome} />
      <Route path="/coach/students" component={CoachStudents} />
      <Route path="/coach/sessions" component={CoachSessions} />
      <Route path="/coach/revenue" component={CoachRevenue} />
      <Route path="/coach/performance" component={CoachPerformance} />
      {/* HR Portal Routes */}
      <Route path="/hr/portal" component={HRDashboardHome} />
      <Route path="/hr/team" component={HRTeam} />
      <Route path="/hr/cohorts" component={HRCohorts} />
      <Route path="/hr/budget" component={HRBudget} />
      <Route path="/hr/compliance" component={HRCompliance} />
      {/* Admin Control System Routes */}
      <Route path="/admin/control" component={AdminDashboardHome} />
      <Route path="/admin/control/users" component={AdminUsers} />
      <Route path="/admin/control/courses" component={AdminCourses} />
      <Route path="/admin/control/commerce" component={AdminCommerce} />
      <Route path="/admin/control/marketing" component={AdminMarketing} />
      <Route path="/admin/control/kpis" component={AdminKPIs} />
      <Route path="/404" component={NotFound} />
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
