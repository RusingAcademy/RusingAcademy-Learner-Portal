import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  PenTool,
  Mic,
  Target,
  Clock,
  Trophy,
  ChevronRight,
  ArrowLeft,
  Gamepad2,
  GraduationCap,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import { SLESimulationMode } from "@/components/SLESimulationMode";

type ExamType = "reading" | "writing" | "oral";
type ExamLevel = "A" | "B" | "C";

// Sample questions for each exam type and level
const sampleQuestions = {
  reading: {
    A: [
      {
        id: "r-a-1",
        type: "reading" as ExamType,
        level: "A" as ExamLevel,
        question: "Read the following passage:\n\n'The meeting will be held in Room 204 at 2:00 PM. Please bring your identification badge.'\n\nWhere will the meeting take place?",
        options: ["Room 204", "Room 402", "The cafeteria", "The lobby"],
        correctAnswer: "Room 204",
        timeLimit: 60,
      },
      {
        id: "r-a-2",
        type: "reading" as ExamType,
        level: "A" as ExamLevel,
        question: "Read the following notice:\n\n'The office will be closed on Monday, January 15th for the holiday. Regular hours resume on Tuesday.'\n\nWhen will the office reopen?",
        options: ["Monday", "Tuesday", "Wednesday", "Friday"],
        correctAnswer: "Tuesday",
        timeLimit: 60,
      },
      {
        id: "r-a-3",
        type: "reading" as ExamType,
        level: "A" as ExamLevel,
        question: "Read the email:\n\n'Dear Team, Please submit your weekly reports by Friday at 5 PM. Late submissions will not be accepted.'\n\nWhat is the deadline for the reports?",
        options: ["Thursday at 5 PM", "Friday at 5 PM", "Monday at 5 PM", "Friday at noon"],
        correctAnswer: "Friday at 5 PM",
        timeLimit: 60,
      },
    ],
    B: [
      {
        id: "r-b-1",
        type: "reading" as ExamType,
        level: "B" as ExamLevel,
        question: "Read the policy excerpt:\n\n'Employees are entitled to 15 days of annual leave after completing their first year of service. Unused leave may be carried over to the following year, up to a maximum of 5 days.'\n\nHow many days of unused leave can be carried over?",
        options: ["15 days", "10 days", "5 days", "None"],
        correctAnswer: "5 days",
        timeLimit: 90,
      },
      {
        id: "r-b-2",
        type: "reading" as ExamType,
        level: "B" as ExamLevel,
        question: "Read the memo:\n\n'Following the recent restructuring, the Communications Division will now report directly to the Deputy Minister. This change aims to improve coordination between policy development and public communications.'\n\nWhat is the main purpose of the restructuring?",
        options: ["To reduce staff", "To improve coordination", "To save money", "To create new positions"],
        correctAnswer: "To improve coordination",
        timeLimit: 90,
      },
      {
        id: "r-b-3",
        type: "reading" as ExamType,
        level: "B" as ExamLevel,
        question: "Read the directive:\n\n'All travel requests must be submitted at least 10 business days in advance. Requests submitted with less notice may be denied unless accompanied by a written justification from the director.'\n\nWhat is required for late travel requests?",
        options: ["A phone call", "Written justification from the director", "Approval from HR", "No additional requirements"],
        correctAnswer: "Written justification from the director",
        timeLimit: 90,
      },
    ],
    C: [
      {
        id: "r-c-1",
        type: "reading" as ExamType,
        level: "C" as ExamLevel,
        question: "Read the policy analysis:\n\n'The implementation of the new procurement framework has yielded mixed results. While processing times have decreased by 23%, stakeholder satisfaction surveys indicate concerns about the complexity of the new documentation requirements. Furthermore, the anticipated cost savings have not materialized due to increased training needs.'\n\nWhat is the main finding of this analysis?",
        options: [
          "The framework is a complete success",
          "The framework has both positive and negative outcomes",
          "The framework should be abandoned",
          "Training costs were reduced"
        ],
        correctAnswer: "The framework has both positive and negative outcomes",
        timeLimit: 120,
      },
      {
        id: "r-c-2",
        type: "reading" as ExamType,
        level: "C" as ExamLevel,
        question: "Read the strategic document:\n\n'The department's five-year plan emphasizes digital transformation as a key priority. However, the plan acknowledges that legacy systems integration poses significant challenges. The phased approach recommended by the IT steering committee balances innovation with operational continuity, though it may extend the timeline beyond initial projections.'\n\nWhat is the main trade-off described in this passage?",
        options: [
          "Cost vs. quality",
          "Speed of implementation vs. operational stability",
          "Staff training vs. system upgrades",
          "Budget allocation vs. project scope"
        ],
        correctAnswer: "Speed of implementation vs. operational stability",
        timeLimit: 120,
      },
    ],
  },
  writing: {
    A: [
      {
        id: "w-a-1",
        type: "writing" as ExamType,
        level: "A" as ExamLevel,
        question: "Write a short email (3-4 sentences) to your supervisor requesting a day off next Friday for a medical appointment.",
        timeLimit: 180,
      },
      {
        id: "w-a-2",
        type: "writing" as ExamType,
        level: "A" as ExamLevel,
        question: "Complete the following sentence with appropriate words:\n\n'The meeting has been _______ from Monday to Wednesday because the director is _______ on a business trip.'",
        options: ["moved / away", "canceled / here", "started / back", "finished / leaving"],
        correctAnswer: "moved / away",
        timeLimit: 60,
      },
    ],
    B: [
      {
        id: "w-b-1",
        type: "writing" as ExamType,
        level: "B" as ExamLevel,
        question: "Write a brief memo (5-7 sentences) informing your team about a change in the weekly meeting schedule. Include the new time, location, and reason for the change.",
        timeLimit: 300,
      },
      {
        id: "w-b-2",
        type: "writing" as ExamType,
        level: "B" as ExamLevel,
        question: "Choose the most appropriate formal phrase to complete this sentence:\n\n'_______ the delay in processing your request, we have expedited the review.'",
        options: ["Due to", "Because", "Since", "As"],
        correctAnswer: "Due to",
        timeLimit: 60,
      },
    ],
    C: [
      {
        id: "w-c-1",
        type: "writing" as ExamType,
        level: "C" as ExamLevel,
        question: "Write a briefing note (150-200 words) summarizing the key considerations for implementing a new telework policy in your department. Address benefits, challenges, and recommendations.",
        timeLimit: 600,
      },
    ],
  },
  oral: {
    A: [
      {
        id: "o-a-1",
        type: "oral" as ExamType,
        level: "A" as ExamLevel,
        question: "Listen to the question and select the most appropriate response:\n\n[Audio: 'What time does the meeting start?']\n\nSelect your answer:",
        options: ["It starts at 10 AM", "Yes, I will attend", "The meeting is important", "I like meetings"],
        correctAnswer: "It starts at 10 AM",
        timeLimit: 30,
      },
      {
        id: "o-a-2",
        type: "oral" as ExamType,
        level: "A" as ExamLevel,
        question: "Listen and respond:\n\n[Audio: 'Can you help me find the conference room?']\n\nSelect the best response:",
        options: ["Yes, it's on the second floor", "The conference was good", "I don't like conferences", "Maybe tomorrow"],
        correctAnswer: "Yes, it's on the second floor",
        timeLimit: 30,
      },
    ],
    B: [
      {
        id: "o-b-1",
        type: "oral" as ExamType,
        level: "B" as ExamLevel,
        question: "You receive a phone call from a colleague asking about the status of a project. Prepare a brief response (30-45 seconds) explaining that the project is on track but there have been some minor delays due to resource constraints.",
        timeLimit: 120,
      },
    ],
    C: [
      {
        id: "o-c-1",
        type: "oral" as ExamType,
        level: "C" as ExamLevel,
        question: "Your director asks you to explain the pros and cons of a proposed policy change during a team meeting. Prepare a structured response (60-90 seconds) presenting both perspectives and your recommendation.",
        timeLimit: 180,
      },
    ],
  },
};

export default function Practice() {
  const { language } = useLanguage();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [selectedType, setSelectedType] = useState<ExamType | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<ExamLevel | null>(null);
  const [isSimulationActive, setIsSimulationActive] = useState(false);

  const labels = {
    en: {
      title: "SLE Practice Simulation",
      subtitle: "Prepare for your Second Language Evaluation exam",
      backToDashboard: "Back to Dashboard",
      selectExamType: "Select Exam Type",
      selectLevel: "Select Level",
      startSimulation: "Start Simulation",
      reading: "Reading Comprehension",
      readingDesc: "Test your ability to understand written French/English texts",
      writing: "Written Expression",
      writingDesc: "Practice writing professional documents and communications",
      oral: "Oral Interaction",
      oralDesc: "Improve your speaking and listening skills",
      levelA: "Level A",
      levelADesc: "Basic proficiency - Simple workplace communications",
      levelB: "Level B",
      levelBDesc: "Intermediate proficiency - Standard workplace tasks",
      levelC: "Level C",
      levelCDesc: "Advanced proficiency - Complex professional situations",
      questions: "questions",
      minutes: "minutes",
      passingScore: "Passing Score",
      tips: "Tips for Success",
      tip1: "Read each question carefully before answering",
      tip2: "Manage your time wisely - don't spend too long on one question",
      tip3: "For writing tasks, plan your response before you start",
      tip4: "For oral tasks, speak clearly and at a natural pace",
      loginRequired: "Login Required",
      loginMessage: "Sign in to access practice simulations",
      signIn: "Sign In",
      recentResults: "Recent Practice Results",
      noResults: "No practice results yet. Start a simulation to track your progress!",
    },
    fr: {
      title: "Simulation de Pratique ELS",
      subtitle: "Préparez-vous pour votre Évaluation de langue seconde",
      backToDashboard: "Retour au Tableau de Bord",
      selectExamType: "Sélectionnez le Type d'Examen",
      selectLevel: "Sélectionnez le Niveau",
      startSimulation: "Commencer la Simulation",
      reading: "Compréhension de l'Écrit",
      readingDesc: "Testez votre capacité à comprendre des textes écrits",
      writing: "Expression Écrite",
      writingDesc: "Pratiquez la rédaction de documents professionnels",
      oral: "Interaction Orale",
      oralDesc: "Améliorez vos compétences en expression et compréhension orales",
      levelA: "Niveau A",
      levelADesc: "Compétence de base - Communications simples au travail",
      levelB: "Niveau B",
      levelBDesc: "Compétence intermédiaire - Tâches courantes au travail",
      levelC: "Niveau C",
      levelCDesc: "Compétence avancée - Situations professionnelles complexes",
      questions: "questions",
      minutes: "minutes",
      passingScore: "Note de Passage",
      tips: "Conseils pour Réussir",
      tip1: "Lisez chaque question attentivement avant de répondre",
      tip2: "Gérez votre temps - ne passez pas trop de temps sur une question",
      tip3: "Pour les tâches écrites, planifiez votre réponse avant de commencer",
      tip4: "Pour les tâches orales, parlez clairement et à un rythme naturel",
      loginRequired: "Connexion Requise",
      loginMessage: "Connectez-vous pour accéder aux simulations de pratique",
      signIn: "Se Connecter",
      recentResults: "Résultats Récents",
      noResults: "Aucun résultat de pratique. Commencez une simulation pour suivre vos progrès!",
    },
  };

  const l = labels[language];

  const examTypes = [
    { type: "reading" as ExamType, icon: BookOpen, label: l.reading, desc: l.readingDesc, color: "blue" },
    { type: "writing" as ExamType, icon: PenTool, label: l.writing, desc: l.writingDesc, color: "purple" },
    { type: "oral" as ExamType, icon: Mic, label: l.oral, desc: l.oralDesc, color: "emerald" },
  ];

  const levels = [
    { level: "A" as ExamLevel, label: l.levelA, desc: l.levelADesc, passingScore: 50 },
    { level: "B" as ExamLevel, label: l.levelB, desc: l.levelBDesc, passingScore: 60 },
    { level: "C" as ExamLevel, label: l.levelC, desc: l.levelCDesc, passingScore: 70 },
  ];

  const getQuestions = () => {
    if (!selectedType || !selectedLevel) return [];
    return sampleQuestions[selectedType][selectedLevel] || [];
  };

  const handleSimulationComplete = (results: any) => {
    console.log("Simulation completed:", results);
    setIsSimulationActive(false);
    // TODO: Save results to backend
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-rose-200 dark:border-rose-800" />
              <div className="absolute inset-0 rounded-full border-4 border-rose-500 border-t-transparent animate-spin" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              {language === "fr" ? "Chargement..." : "Loading..."}
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center mx-auto mb-6">
                <Gamepad2 className="h-8 w-8 text-rose-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {l.loginRequired}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {l.loginMessage}
              </p>
              <Button asChild className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700">
                <a href={getLoginUrl()}>
                  {l.signIn}
                </a>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Active simulation
  if (isSimulationActive && selectedType && selectedLevel) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Header />
        <main className="flex-1 px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => setIsSimulationActive(false)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {language === "fr" ? "Quitter la Simulation" : "Exit Simulation"}
            </Button>
            <SLESimulationMode
              examType={selectedType}
              examLevel={selectedLevel}
              questions={getQuestions()}
              onComplete={handleSimulationComplete}
              language={language}
            />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Selection screen
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Header />
      <main className="flex-1 px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/dashboard">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {l.backToDashboard}
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                <Gamepad2 className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{l.title}</h1>
                <p className="text-slate-600 dark:text-slate-400">{l.subtitle}</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Selection Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Exam Type Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-rose-600" />
                    {l.selectExamType}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {examTypes.map((exam) => {
                      const Icon = exam.icon;
                      const isSelected = selectedType === exam.type;
                      const colorClasses = {
                        blue: "border-blue-500 bg-blue-50 dark:bg-blue-900/20",
                        purple: "border-purple-500 bg-purple-50 dark:bg-purple-900/20",
                        emerald: "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20",
                      };
                      const iconColors = {
                        blue: "text-blue-600",
                        purple: "text-purple-600",
                        emerald: "text-emerald-600",
                      };

                      return (
                        <button
                          key={exam.type}
                          onClick={() => setSelectedType(exam.type)}
                          className={`p-6 rounded-xl border-2 transition-all text-left ${
                            isSelected
                              ? colorClasses[exam.color]
                              : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                          }`}
                        >
                          <Icon className={`h-8 w-8 mb-3 ${isSelected ? iconColors[exam.color] : "text-slate-400"}`} />
                          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{exam.label}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{exam.desc}</p>
                          {isSelected && (
                            <CheckCircle className={`h-5 w-5 mt-3 ${iconColors[exam.color]}`} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Level Selection */}
              <Card className={!selectedType ? "opacity-50 pointer-events-none" : ""}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-rose-600" />
                    {l.selectLevel}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {levels.map((lvl) => {
                      const isSelected = selectedLevel === lvl.level;
                      const questions = selectedType ? sampleQuestions[selectedType][lvl.level]?.length || 0 : 0;

                      return (
                        <button
                          key={lvl.level}
                          onClick={() => setSelectedLevel(lvl.level)}
                          className={`p-6 rounded-xl border-2 transition-all text-left ${
                            isSelected
                              ? "border-rose-500 bg-rose-50 dark:bg-rose-900/20"
                              : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <Badge variant={isSelected ? "default" : "secondary"} className={isSelected ? "bg-rose-600" : ""}>
                              {lvl.label}
                            </Badge>
                            <span className="text-sm text-slate-500">{lvl.passingScore}% {l.passingScore}</span>
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{lvl.desc}</p>
                          {selectedType && (
                            <p className="text-xs text-slate-400">
                              {questions} {l.questions}
                            </p>
                          )}
                          {isSelected && (
                            <CheckCircle className="h-5 w-5 mt-3 text-rose-600" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Start Button */}
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
                disabled={!selectedType || !selectedLevel}
                onClick={() => setIsSimulationActive(true)}
              >
                <Gamepad2 className="h-5 w-5 mr-2" />
                {l.startSimulation}
                <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Tips Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    {l.tips}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {[l.tip1, l.tip2, l.tip3, l.tip4].map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Recent Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    {l.recentResults}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                    {l.noResults}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
