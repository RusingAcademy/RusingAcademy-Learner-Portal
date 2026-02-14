import { Toaster } from "@/components/ui/sonner";
import { HelmetProvider } from "react-helmet-async";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import CMSPage from "@/pages/CMSPage";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import SLEAICompanionMobileButton from "./components/SLEAICompanionMobileButton";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { GamificationProvider } from "./contexts/GamificationContext";
import Home from "./pages/Home";
import Coaches from "./pages/Coaches";
import CoachProfile from "./pages/CoachProfile";
import AICoach from "./pages/AICoach";
import LearnerDashboard from "./pages/LearnerDashboard";
import ProgressReport from "./pages/ProgressReport";
import CoachDashboard from "./pages/CoachDashboard";
import HRDashboard from "./pages/HRDashboard";
import DashboardRouter from "./components/DashboardRouter";
import BecomeCoach from "./pages/BecomeCoachNew";
import HowItWorks from "./pages/HowItWorks";
import Curriculum from "./pages/Curriculum";
import CurriculumPathSeries from "./pages/CurriculumPathSeries";
import CoachEarnings from "./pages/CoachEarnings";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import AdminCommission from "./pages/AdminCommission";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCoachApplications from "./pages/AdminCoachApplications";
import FAQ from "./pages/FAQ";
import Blog from "./pages/Blog";
import Careers from "./pages/Careers";
import CookiePolicy from "./pages/CookiePolicy";
import Accessibility from "./pages/Accessibility";
import ForDepartments from "./pages/ForDepartments";
import ForBusiness from "./pages/ForBusiness";
import CoachEarningsHistory from "./pages/CoachEarningsHistory";
import CoachPayments from "./pages/CoachPayments";
import Messages from "./pages/Messages";
import VideoSession from "./pages/VideoSession";
import BookingSuccess from "./pages/BookingSuccess";
import BookingCancelled from "./pages/BookingCancelled";
import CoachGuide from "./pages/CoachGuide";
import MySessions from "./pages/MySessions";
import LearnerSettings from "./pages/LearnerSettings";
import LearnerProgress from "./pages/LearnerProgress";
import LearnerPayments from "./pages/LearnerPayments";
import LearnerFavorites from "./pages/LearnerFavorites";
import LearnerLoyalty from "./pages/LearnerLoyalty";
import BadgesCatalog from "./pages/BadgesCatalog";
import Leaderboard from "./pages/Leaderboard";
import UserProfile from "./pages/UserProfile";
import LearnerReferrals from "./pages/LearnerReferrals";
import LearnerCourses from "./pages/LearnerCourses";
import BookSession from "./pages/BookSession";
import Organizations from "./pages/Organizations";
import Community from "./pages/Community";
import Courses from "./pages/Courses";
import CoursesPage from "./pages/CoursesPage";
import CourseDetail from "./pages/CourseDetail";
import Paths from "./pages/Paths";
import PathDetail from "./pages/PathDetail";
import PathEnrollmentSuccess from "./pages/PathEnrollmentSuccess";
import CourseSuccess from "./pages/CourseSuccess";
import LessonViewer from "./pages/LessonViewer";
import LearnCourse from "./pages/LearnCourse";
import LearnPortal from "./pages/LearnPortal";
import LearnLessonPage from "./pages/LearnLessonPage";
import MyLearning from "./pages/MyLearning";
import MyDownloads from "./pages/MyDownloads";
import CertificateViewer from "./pages/CertificateViewer";
import VerifyCertificate from "./pages/VerifyCertificate";

// Ecosystem Pages - RusingAcademy
import RusingAcademyHome from "./pages/rusingacademy/RusingAcademyHome";
import RusingAcademyPrograms from "./pages/rusingacademy/Programs";
import RusingAcademyContact from "./pages/rusingacademy/Contact";
import RusingAcademyForBusiness from "./pages/rusingacademy/ForBusiness";
import RusingAcademyForGovernment from "./pages/rusingacademy/ForGovernment";

// Ecosystem Pages - Barholex Media
import BarholexHome from "./pages/barholex/BarholexHome";
import BarholexServices from "./pages/barholex/Services";
import BarholexPortfolio from "./pages/barholex/Portfolio";
import BarholexContact from "./pages/barholex/Contact";
import EcosystemHub from "./pages/EcosystemHub";
import EcosystemLayout from "./components/EcosystemLayout";
import EcosystemLanding from "./pages/EcosystemLanding";
import Hub from "./pages/Hub";
import RusingAcademyLanding from "./pages/RusingAcademyLanding";
import BarholexMediaLanding from "./pages/BarholexMediaLanding";
import LingueefyLanding from "./pages/LingueefyLanding";
import HomeRedirect from "./pages/HomeRedirect";
import Unsubscribe from "./pages/Unsubscribe";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import SLEDiagnostic from "./pages/SLEDiagnostic";
import BookingForm from "./pages/BookingForm";
import BookingConfirmation from "./pages/BookingConfirmation";
import CoachingPlanSuccess from "./pages/CoachingPlanSuccess";
import Cookies from "./pages/Cookies";

// Auth Pages
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import SetPassword from "./pages/SetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import SignIn from "./pages/SignIn";
// @ts-ignore - TS1149: auto-suppressed during TS cleanup
import SignUp from "./pages/SignUp";
import CoachInviteClaim from "./pages/CoachInviteClaim";
import AcceptInvitation from "./pages/AcceptInvitation";
import CoachTerms from "./pages/CoachTerms";
import AdminReminders from "./pages/AdminReminders";
import AdminLeads from "./pages/AdminLeads";
import AdminContentManagement from "./pages/AdminContentManagement";
import AdminControlCenter from "./pages/AdminControlCenter";
import AppDashboard from "./pages/AppDashboard";
import AffiliateDashboard from "./pages/AffiliateDashboard";
import BundlesAndPaths from "./pages/BundlesAndPaths";
import ConversationPractice from "./pages/ConversationPractice";
import Practice from "./pages/Practice";
import SLEPractice from "./pages/SLEPractice";
import SLEExamSimulation from "./pages/SLEExamSimulation";
import SLEProgressDashboard from "./pages/SLEProgressDashboard";
import DictationPractice from "./pages/DictationPractice";
import PracticeHistory from "./pages/PracticeHistory";
import { usePageTracking } from "./hooks/useAnalytics";
import NotificationPermission from "./components/NotificationPermission";
import OfflineIndicator from "./components/OfflineIndicator";
import PWAInstallBanner from "./components/PWAInstallBanner";

function Router() {
  // Track page views on route changes
  usePageTracking();

  return (
    <Switch>
      {/* Auth Pages */}
      <Route path="/sign-in" component={SignIn} />
      <Route path="/sign-up" component={SignUp} />
      <Route path="/signup" component={Signup} />
      <Route path="/login" component={Login} />
      <Route path="/set-password" component={SetPassword} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/verify-email" component={VerifyEmail} />
      
      {/* Public Pages */}
      <Route path="/" component={Hub} />
      <Route path="/ecosystem" component={Hub} />
      <Route path="/ecosystem-old" component={EcosystemLanding} />
      <Route path="/lingueefy" component={Home} />
      <Route path="/lingueefy/success" component={CoachingPlanSuccess} />
      <Route path="/home" component={HomeRedirect} />
      <Route path="/coaches" component={Coaches} />
      <Route path="/coaches/:slug" component={CoachProfile} />
      <Route path="/coach-invite/:token" component={CoachInviteClaim} />
      <Route path="/invite/:token" component={AcceptInvitation} />
      <Route path="/messages" component={Messages} />
      <Route path="/session/:sessionId" component={VideoSession} />
      <Route path="/become-a-coach" component={BecomeCoach} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/curriculum" component={CurriculumPathSeries} />
      <Route path="/curriculum-old" component={Curriculum} />
      <Route path="/courses" component={CoursesPage} />
      <Route path="/courses-old" component={Courses} />
      <Route path="/courses/success" component={CourseSuccess} />
      <Route path="/courses/:slug" component={CourseDetail} />
      <Route path="/courses/:slug/lessons/:lessonId" component={LessonViewer} />
      <Route path="/learn/:slug" component={LearnPortal} />
      <Route path="/learn/:slug/lessons/:lessonId" component={LearnLessonPage} />
      <Route path="/paths" component={Paths} />
      <Route path="/paths/:slug" component={PathDetail} />
      <Route path="/paths/:slug/success" component={PathEnrollmentSuccess} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      
      {/* Unsubscribe */}
      <Route path="/unsubscribe/:token" component={Unsubscribe} />
      
      {/* Legal Pages */}
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/cookies" component={Cookies} />
      <Route path="/accessibility" component={Accessibility} />
      
      {/* Resource Pages */}
      <Route path="/faq" component={FAQ} />
      <Route path="/blog" component={Blog} />
      <Route path="/careers" component={Careers} />
      <Route path="/for-departments" component={ForDepartments} />
      <Route path="/for-business" component={ForBusiness} />
      <Route path="/organizations" component={Organizations} />
      <Route path="/community" component={Community} />
      
      {/* SLE Diagnostic Page */}
      <Route path="/sle-diagnostic" component={SLEDiagnostic} />
      
      {/* AI Coach - Prof Steven */}
      <Route path="/prof-steven-ai" component={AICoach} />
      <Route path="/ai-coach" component={AICoach} />
      <Route path="/sle-ai-companion" component={AICoach} />
      
      {/* Booking Pages */}
      <Route path="/booking" component={BookingForm} />
      <Route path="/booking/confirmation" component={BookingConfirmation} />
      <Route path="/booking/success" component={BookingSuccess} />
      <Route path="/booking/cancelled" component={BookingCancelled} />
      
      {/* Dashboard Router - RBAC-based routing */}
      <Route path="/dashboard" component={DashboardRouter} />

      {/* ── Unified Dashboard (/app) ── role-based sidebar, modular sections */}
      <Route path="/app">{() => <AppDashboard section="overview" />}</Route>
      <Route path="/app/overview">{() => <AppDashboard section="overview" />}</Route>
      <Route path="/app/my-courses">{() => <AppDashboard section="my-courses" />}</Route>
      <Route path="/app/my-progress">{() => <AppDashboard section="my-progress" />}</Route>
      <Route path="/app/my-sessions">{() => <AppDashboard section="my-sessions" />}</Route>
      <Route path="/app/my-payments">{() => <AppDashboard section="my-payments" />}</Route>
      <Route path="/app/favorites">{() => <AppDashboard section="favorites" />}</Route>
      <Route path="/app/certificates">{() => <AppDashboard section="certificates" />}</Route>
      <Route path="/app/settings">{() => <AppDashboard section="settings" />}</Route>
      <Route path="/app/notifications">{() => <AppDashboard section="notifications" />}</Route>
      <Route path="/app/ai-practice">{() => <AppDashboard section="ai-practice" />}</Route>
      <Route path="/app/conversation">{() => <AppDashboard section="conversation" />}</Route>
      <Route path="/app/practice-history">{() => <AppDashboard section="practice-history" />}</Route>
      <Route path="/app/simulation">{() => <AppDashboard section="simulation" />}</Route>
      <Route path="/app/sle-exam">{() => <AppDashboard section="sle-exam" />}</Route>
      <Route path="/app/sle-progress">{() => <AppDashboard section="sle-progress" />}</Route>
      <Route path="/app/badges">{() => <AppDashboard section="badges" />}</Route>
      <Route path="/app/loyalty">{() => <AppDashboard section="loyalty" />}</Route>
      <Route path="/app/my-students">{() => <AppDashboard section="my-students" />}</Route>
      <Route path="/app/availability">{() => <AppDashboard section="availability" />}</Route>
      <Route path="/app/coach-profile">{() => <AppDashboard section="coach-profile" />}</Route>
      <Route path="/app/earnings">{() => <AppDashboard section="earnings" />}</Route>
      <Route path="/app/video-sessions">{() => <AppDashboard section="video-sessions" />}</Route>
      <Route path="/app/coach-guide">{() => <AppDashboard section="coach-guide" />}</Route>
      <Route path="/app/team">{() => <AppDashboard section="team" />}</Route>
      <Route path="/app/cohorts">{() => <AppDashboard section="cohorts" />}</Route>
      <Route path="/app/budget">{() => <AppDashboard section="budget" />}</Route>
      <Route path="/app/compliance">{() => <AppDashboard section="compliance" />}</Route>
      
      {/* Learner Dashboard */}
      <Route path="/dashboard/learner" component={LearnerDashboard} />
      <Route path="/learner" component={LearnerDashboard} />
      <Route path="/learner/courses" component={LearnerCourses} />
      <Route path="/learner/book-session" component={BookSession} />
      <Route path="/my-learning" component={MyLearning} />
      <Route path="/certificates/:certificateNumber" component={CertificateViewer} />
      <Route path="/verify" component={VerifyCertificate} />
      <Route path="/verify/:certificateNumber" component={VerifyCertificate} />

      <Route path="/my-sessions" component={MySessions} />
      <Route path="/settings" component={LearnerSettings} />
      <Route path="/progress" component={LearnerProgress} />
      <Route path="/progress/report" component={ProgressReport} />
      <Route path="/payments" component={LearnerPayments} />
      <Route path="/favorites" component={LearnerFavorites} />
      <Route path="/rewards" component={LearnerLoyalty} />
      <Route path="/badges" component={BadgesCatalog} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/profile/:userId" component={UserProfile} />
      <Route path="/referrals" component={LearnerReferrals} />
      <Route path="/affiliate" component={AffiliateDashboard} />
      <Route path="/bundles" component={BundlesAndPaths} />
      <Route path="/conversation-practice" component={ConversationPractice} />
      <Route path="/practice" component={Practice} />
      <Route path="/sle-practice" component={SLEPractice} />
      <Route path="/sle-exam-simulation" component={SLEExamSimulation} />
      <Route path="/sle-progress" component={SLEProgressDashboard} />
      <Route path="/dictation-practice" component={DictationPractice} />
      <Route path="/practice-history" component={PracticeHistory} />
      <Route path="/practice-history/:sessionId" component={PracticeHistory} />
      <Route path="/downloads" component={MyDownloads} />
      
      {/* Coach Dashboard */}
      <Route path="/dashboard/coach" component={CoachDashboard} />
      <Route path="/coach" component={CoachDashboard} />
      <Route path="/coach/dashboard" component={CoachDashboard} />
      <Route path="/coach/earnings" component={CoachEarnings} />
      <Route path="/coach/earnings/history" component={CoachEarningsHistory} />
      <Route path="/coach/payments" component={CoachPayments} />
      <Route path="/coach/guide" component={CoachGuide} />
      <Route path="/coach/terms" component={CoachTerms} />
      <Route path="/coach/:slug" component={CoachProfile} />
      
      {/* HR Dashboard */}
      <Route path="/dashboard/hr" component={HRDashboard} />
      <Route path="/dashboard/hr/overview" component={HRDashboard} />
      <Route path="/hr" component={HRDashboard} />
      <Route path="/hr/dashboard" component={HRDashboard} />
      
      {/* Admin Control Center - Kajabi-style sidebar layout */}
      <Route path="/admin">{() => <AdminControlCenter section="overview" />}</Route>
      <Route path="/admin/overview">{() => <AdminControlCenter section="overview" />}</Route>
      <Route path="/admin/users">{() => <AdminControlCenter section="users" />}</Route>
      <Route path="/admin/coaches">{() => <AdminControlCenter section="coaches" />}</Route>
      <Route path="/admin/coaching">{() => <AdminControlCenter section="coaches" />}</Route>
      <Route path="/admin/courses">{() => <AdminControlCenter section="courses" />}</Route>
      <Route path="/admin/pricing">{() => <AdminControlCenter section="pricing" />}</Route>
      <Route path="/admin/coupons">{() => <AdminControlCenter section="coupons" />}</Route>
      <Route path="/admin/crm">{() => <AdminControlCenter section="crm" />}</Route>
      <Route path="/admin/email">{() => <AdminControlCenter section="email" />}</Route>
      <Route path="/admin/analytics">{() => <AdminControlCenter section="analytics" />}</Route>
      <Route path="/admin/activity">{() => <AdminControlCenter section="activity" />}</Route>
      <Route path="/admin/preview">{() => <AdminControlCenter section="preview" />}</Route>
      <Route path="/admin/settings">{() => <AdminControlCenter section="settings" />}</Route>
      <Route path="/admin/funnels">{() => <AdminControlCenter section="funnels" />}</Route>
      <Route path="/admin/automations">{() => <AdminControlCenter section="automations" />}</Route>
      <Route path="/admin/pages">{() => <AdminControlCenter section="pages" />}</Route>
      <Route path="/admin/ai-companion">{() => <AdminControlCenter section="ai-companion" />}</Route>
      <Route path="/admin/sales-analytics">{() => <AdminControlCenter section="sales-analytics" />}</Route>
      <Route path="/admin/media-library">{() => <AdminControlCenter section="media-library" />}</Route>
      <Route path="/admin/permissions">{() => <AdminControlCenter section="permissions" />}</Route>
      <Route path="/admin/email-templates">{() => <AdminControlCenter section="email-templates" />}</Route>
      <Route path="/admin/notifications">{() => <AdminControlCenter section="notifications" />}</Route>
      <Route path="/admin/import-export">{() => <AdminControlCenter section="import-export" />}</Route>
      <Route path="/admin/preview-mode">{() => <AdminControlCenter section="preview-mode" />}</Route>
      <Route path="/admin/ai-predictive">{() => <AdminControlCenter section="ai-predictive" />}</Route>
      <Route path="/admin/stripe-testing">{() => <AdminControlCenter section="stripe-testing" />}</Route>
      <Route path="/admin/live-kpi">{() => <AdminControlCenter section="live-kpi" />}</Route>
      <Route path="/admin/onboarding">{() => <AdminControlCenter section="onboarding" />}</Route>
      <Route path="/admin/enterprise">{() => <AdminControlCenter section="enterprise" />}</Route>
      <Route path="/admin/sle-exam">{() => <AdminControlCenter section="sle-exam" />}</Route>
      <Route path="/admin/content-intelligence">{() => <AdminControlCenter section="content-intelligence" />}</Route>
      <Route path="/admin/drip-content">{() => <AdminControlCenter section="drip-content" />}</Route>
      <Route path="/admin/ab-testing">{() => <AdminControlCenter section="ab-testing" />}</Route>
      <Route path="/admin/org-billing">{() => <AdminControlCenter section="org-billing" />}</Route>
      <Route path="/admin/weekly-challenges">{() => <AdminControlCenter section="weekly-challenges" />}</Route>
      <Route path="/admin/enrollments">{() => <AdminControlCenter section="enrollments" />}</Route>
      <Route path="/admin/reviews">{() => <AdminControlCenter section="reviews" />}</Route>
      <Route path="/admin/certificates">{() => <AdminControlCenter section="certificates" />}</Route>
      <Route path="/admin/gamification">{() => <AdminControlCenter section="gamification" />}</Route>
      {/* Legacy admin routes */}
      <Route path="/dashboard/admin">{() => <AdminControlCenter section="overview" />}</Route>
      <Route path="/admin/applications" component={AdminCoachApplications} />
      <Route path="/admin/dashboard">{() => <AdminControlCenter section="overview" />}</Route>
      <Route path="/admin/commission" component={AdminCommission} />
      <Route path="/admin/reminders" component={AdminReminders} />
      <Route path="/admin/content" component={AdminContentManagement} />
      <Route path="/admin/leads" component={AdminLeads} />
      <Route path="/dashboard/admin/leads" component={AdminLeads} />
      
      {/* Ecosystem - RusingAcademy */}
      <Route path="/rusingacademy" component={RusingAcademyLanding} />
      <Route path="/rusingacademy/old" component={RusingAcademyHome} />
      <Route path="/rusingacademy/programs" component={RusingAcademyPrograms} />
      <Route path="/rusingacademy/contact" component={RusingAcademyContact} />
      <Route path="/rusingacademy/for-business" component={RusingAcademyForBusiness} />
      <Route path="/rusingacademy/for-government" component={RusingAcademyForGovernment} />
      
      {/* Ecosystem - Barholex Media */}
      <Route path="/barholex-media" component={BarholexMediaLanding} />
      <Route path="/barholex" component={BarholexMediaLanding} />
      <Route path="/barholex/old" component={BarholexHome} />
      <Route path="/barholex/services" component={BarholexServices} />
      <Route path="/barholex/portfolio" component={BarholexPortfolio} />
      <Route path="/barholex/contact" component={BarholexContact} />
      
      {/* Ecosystem Hub */}
      <Route path="/ecosystem" component={EcosystemHub} />
      
      {/* CMS Dynamic Pages */}
      <Route path="/p/:slug" component={CMSPage} />

      {/* Error Pages */}
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <ThemeProvider defaultTheme="light" switchable={true}>
          <LanguageProvider>
            <TooltipProvider>
              <NotificationProvider>
                <GamificationProvider>
                  <Toaster />
                  {/* Skip link for keyboard navigation accessibility */}
                  <a href="#main-content" className="skip-link">
                    Skip to main content
                  </a>
                  <EcosystemLayout>
                    <Router />
                  </EcosystemLayout>
                  <SLEAICompanionMobileButton />
                  <NotificationPermission />
                  <OfflineIndicator />
                  <PWAInstallBanner />
                </GamificationProvider>
              </NotificationProvider>
            </TooltipProvider>
          </LanguageProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
// Deploy trigger Mon Jan 12 11:15:25 EST 2026
// Deploy trigger Mon Jan 12 13:31:51 EST 2026
