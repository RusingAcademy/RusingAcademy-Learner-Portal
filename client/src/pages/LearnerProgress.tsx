import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import {
  TrendingUp,
  Target,
  Calendar,
  Clock,
  Award,
  Bot,
  Users,
  BookOpen,
  CheckCircle2,
  ArrowUp,
  Loader2,
  Trophy,
  Flame,
  Star,
  Download,
  FileText,
} from "lucide-react";
import { generateProgressReportPDF } from "@/services/progressReport";
import { Link } from "wouter";
import { useAppLayout } from "@/contexts/AppLayoutContext";

export default function LearnerProgress() {
  const { isInsideAppLayout } = useAppLayout();
  const { language } = useLanguage();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const isEn = language === "en";
  const [activeTab, setActiveTab] = useState("overview");
  
  // Fetch learner profile
  const { data: profile, isLoading: profileLoading } = trpc.learner.myProfile.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  
  // Fetch sessions
  const { data: upcomingSessions = [] } = trpc.learner.upcomingSessions.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  
  const { data: pastSessions = [] } = trpc.learner.pastSessions.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  
  const content = {
    en: {
      title: "My Progress",
      subtitle: "Track your SLE learning journey",
      overview: "Overview",
      sle: "SLE Levels",
      sessions: "Sessions",
      achievements: "Achievements",
      currentLevel: "Current Level",
      targetLevel: "Target Level",
      oral: "Oral",
      written: "Written",
      reading: "Reading",
      progress: "Progress",
      totalSessions: "Total Sessions",
      aiSessions: "AI Sessions",
      hoursLearned: "Hours Learned",
      daysUntilExam: "Days Until Exam",
      noExamDate: "No exam date set",
      setExamDate: "Set Exam Date",
      recentActivity: "Recent Activity",
      noActivity: "No recent activity",
      startLearning: "Start Learning",
      sessionsWith: "Sessions with coaches",
      aiPractice: "AI practice sessions",
      streak: "Day Streak",
      keepGoing: "Keep going!",
      milestones: "Milestones",
      firstSession: "First Session",
      firstSessionDesc: "Completed your first coaching session",
      tenSessions: "10 Sessions",
      tenSessionsDesc: "Completed 10 coaching sessions",
      levelUp: "Level Up",
      levelUpDesc: "Improved your SLE level",
      aiExplorer: "AI Explorer",
      aiExplorerDesc: "Completed 5 AI practice sessions",
      loginRequired: "Please sign in to view your progress",
      signIn: "Sign In",
    },
    fr: {
      title: "Mes progrès",
      subtitle: "Suivez votre parcours d'apprentissage ELS",
      overview: "Aperçu",
      sle: "Niveaux ELS",
      sessions: "Séances",
      achievements: "Réalisations",
      currentLevel: "Niveau actuel",
      targetLevel: "Niveau cible",
      oral: "Oral",
      written: "Écrit",
      reading: "Lecture",
      progress: "Progrès",
      totalSessions: "Séances totales",
      aiSessions: "Séances IA",
      hoursLearned: "Heures apprises",
      daysUntilExam: "Jours avant l'examen",
      noExamDate: "Aucune date d'examen définie",
      setExamDate: "Définir la date d'examen",
      recentActivity: "Activité récente",
      noActivity: "Aucune activité récente",
      startLearning: "Commencer à apprendre",
      sessionsWith: "Séances avec des coachs",
      aiPractice: "Séances de pratique IA",
      streak: "Jours consécutifs",
      keepGoing: "Continuez!",
      milestones: "Jalons",
      firstSession: "Première séance",
      firstSessionDesc: "Complété votre première séance de coaching",
      tenSessions: "10 séances",
      tenSessionsDesc: "Complété 10 séances de coaching",
      levelUp: "Niveau supérieur",
      levelUpDesc: "Amélioré votre niveau ELS",
      aiExplorer: "Explorateur IA",
      aiExplorerDesc: "Complété 5 séances de pratique IA",
      loginRequired: "Veuillez vous connecter pour voir vos progrès",
      signIn: "Se connecter",
    },
  };
  
  const t = isEn ? content.en : content.fr;
  
  // Calculate stats
  const totalCoachSessions = profile?.totalSessions || 0;
  const totalAiSessions = profile?.totalAiSessions || 0;
  const totalHours = Math.round((totalCoachSessions * 60 + totalAiSessions * 20) / 60);
  
  const currentLevel = profile?.currentLevel as any || {};
  const targetLevel = profile?.targetLevel as any || {};
  
  // Calculate days until exam
  let daysUntilExam = null;
  if (profile?.examDate) {
    const examDate = new Date(profile.examDate);
    const today = new Date();
    const diffTime = examDate.getTime() - today.getTime();
    daysUntilExam = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  // Calculate level progress (X=0, A=33, B=66, C=100)
  const levelToProgress = (level: string) => {
    switch (level) {
      case "X": return 0;
      case "A": return 33;
      case "B": return 66;
      case "C": return 100;
      default: return 0;
    }
  };
  
  // Achievements
  const achievements = [
    {
      id: "first_session",
      title: t.firstSession,
      description: t.firstSessionDesc,
      icon: CheckCircle2,
      unlocked: totalCoachSessions >= 1,
    },
    {
      id: "ten_sessions",
      title: t.tenSessions,
      description: t.tenSessionsDesc,
      icon: Trophy,
      unlocked: totalCoachSessions >= 10,
    },
    {
      id: "ai_explorer",
      title: t.aiExplorer,
      description: t.aiExplorerDesc,
      icon: Bot,
      unlocked: totalAiSessions >= 5,
    },
    {
      id: "level_up",
      title: t.levelUp,
      description: t.levelUpDesc,
      icon: ArrowUp,
      unlocked: false, // Would need historical data to determine
    },
  ];
  
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        {!isInsideAppLayout && <Header />}
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardHeader className="text-center">
              <CardTitle>{t.title}</CardTitle>
              <CardDescription>{t.loginRequired}</CardDescription>
            </CardHeader>
            <CardContent>
              <a href={getLoginUrl()} className="block">
                <Button className="w-full" size="lg">
                  {t.signIn}
                </Button>
              </a>
            </CardContent>
          </Card>
        </main>
        {!isInsideAppLayout && <Footer />}
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      {!isInsideAppLayout && <Header />}
      
      <main className="flex-1 py-8">
        <div className="container max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-primary" />
                {t.title}
              </h1>
              <p className="text-muted-foreground">{t.subtitle}</p>
            </div>
            <Button
              onClick={() => {
                generateProgressReportPDF({
                  learnerName: user?.name || 'Learner',
                  department: profile?.department || undefined,
                  position: profile?.position || undefined,
                  currentLevel: currentLevel || {},
                  targetLevel: targetLevel || {},
                  examDate: profile?.examDate ? new Date(profile.examDate).toISOString() : undefined,
                  totalSessions: totalCoachSessions,
                  totalAiSessions: totalAiSessions,
                  currentStreak: profile?.currentStreak || 0,
                  longestStreak: profile?.longestStreak || 0,
                  loyaltyTier: 'Bronze',
                  totalPoints: 0,
                  sessionsHistory: pastSessions.map((s: any) => ({
                    date: s.scheduledAt,
                    coachName: s.coachName || 'Coach',
                    focusArea: s.focusArea || 'General',
                    duration: s.duration || 60,
                    status: s.status || 'completed',
                  })),
                  recentReviews: [],
                  language: language as 'en' | 'fr',
                });
              }}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {isEn ? 'Download PDF Report' : 'Télécharger le rapport PDF'}
            </Button>
          </div>
          
          {profileLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{totalCoachSessions}</p>
                        <p className="text-xs text-muted-foreground">{t.totalSessions}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{totalAiSessions}</p>
                        <p className="text-xs text-muted-foreground">{t.aiSessions}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{totalHours}</p>
                        <p className="text-xs text-muted-foreground">{t.hoursLearned}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[#C65A1E]/10 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        {daysUntilExam !== null ? (
                          <>
                            <p className="text-2xl font-bold">{daysUntilExam}</p>
                            <p className="text-xs text-muted-foreground">{t.daysUntilExam}</p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm font-medium">{t.noExamDate}</p>
                            <Link href="/app/settings">
                              <span className="text-xs text-primary hover:underline cursor-pointer">
                                {t.setExamDate}
                              </span>
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* SLE Progress Cards */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {/* Oral */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center justify-between">
                      {t.oral}
                      <Badge variant="outline" className="text-lg">
                        {currentLevel.oral || "X"} → {targetLevel.oral || "C"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Progress 
                      value={levelToProgress(currentLevel.oral)} 
                      className="h-3 mb-2" 
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>X</span>
                      <span>A</span>
                      <span>B</span>
                      <span>C</span>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Written */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center justify-between">
                      {t.written}
                      <Badge variant="outline" className="text-lg">
                        {currentLevel.writing || "X"} → {targetLevel.writing || "C"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Progress 
                      value={levelToProgress(currentLevel.writing)} 
                      className="h-3 mb-2" 
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>X</span>
                      <span>A</span>
                      <span>B</span>
                      <span>C</span>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Reading */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center justify-between">
                      {t.reading}
                      <Badge variant="outline" className="text-lg">
                        {currentLevel.reading || "X"} → {targetLevel.reading || "C"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Progress 
                      value={levelToProgress(currentLevel.reading)} 
                      className="h-3 mb-2" 
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>X</span>
                      <span>A</span>
                      <span>B</span>
                      <span>C</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-500" />
                    {t.milestones}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {achievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className={`p-4 rounded-lg border text-center transition-all ${
                          achievement.unlocked
                            ? "bg-primary/5 border-primary"
                            : "bg-muted/50 opacity-50"
                        }`}
                      >
                        <div className={`h-12 w-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
                          achievement.unlocked ? "bg-primary/10" : "bg-muted"
                        }`}>
                          <achievement.icon className={`h-6 w-6 ${
                            achievement.unlocked ? "text-primary" : "text-muted-foreground"
                          }`} />
                        </div>
                        <p className="font-semibold text-sm">{achievement.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {achievement.description}
                        </p>
                        {achievement.unlocked && (
                          <Badge className="mt-2" variant="secondary">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {isEn ? "Unlocked" : "Débloqué"}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
      
      {!isInsideAppLayout && <Footer />}
    </div>
  );
}
