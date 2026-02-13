import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/learning-materials" component={LearningMaterials} />
      <Route path="/tutoring-sessions" component={TutoringSessions} />
      <Route path="/authorizations" component={Authorizations} />
      <Route path="/progress" component={Progress} />
      <Route path="/results" component={Results} />
      <Route path="/reports" component={Reports} />
      <Route path="/calendar" component={CalendarPage} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/community-forum" component={CommunityForum} />
      <Route path="/help" component={Help} />
      <Route path="/profile" component={MyProfile} />
      <Route path="/settings" component={MySettings} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
