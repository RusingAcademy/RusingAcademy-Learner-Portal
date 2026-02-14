/**
 * PortalOverview Page
 * Main dashboard view for the LMS Portal
 * Sprint 8: Premium Learning Hub
 */

import { useUser } from "@clerk/clerk-react";
import { Link } from "wouter";
import {
  Calendar,
  Clock,
  PlayCircle,
  ArrowRight,
  Video,
  FileText,
  BookOpen,
  Zap,
  TrendingUp,
  Award
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PortalLayout from "@/components/portal/PortalLayout";
import ProgressTracker from "@/components/portal/ProgressTracker";

const upcomingSessions = [
  {
    id: 1,
    title: "Session de coaching - Expression orale",
    coach: "Marie-Claire Dubois",
    date: "Aujourd'hui",
    time: "14:00",
    duration: "45 min",
    platform: "Zoom",
    isLive: true,
  },
  {
    id: 2,
    title: "Atelier - Rédaction administrative",
    coach: "Jean-François Martin",
    date: "Demain",
    time: "10:00",
    duration: "60 min",
    platform: "Teams",
    isLive: false,
  },
];

const recentCapsules = [
  {
    id: 1,
    title: "Les temps verbaux en contexte professionnel",
    type: "video",
    duration: "12 min",
    progress: 75,
    module: "Expression écrite",
  },
  {
    id: 2,
    title: "Vocabulaire administratif - Partie 2",
    type: "document",
    pages: 15,
    progress: 30,
    module: "Compréhension écrite",
  },
  {
    id: 3,
    title: "Exercice: Formules de politesse",
    type: "exercise",
    questions: 10,
    progress: 0,
    module: "Expression écrite",
  },
];

const quickStats = [
  { label: "Heures d'apprentissage", value: "24.5h", icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Sessions complétées", value: "12", icon: Video, color: "text-[#0F3D3E]", bg: "bg-[#E7F2F2]" },
  { label: "Documents lus", value: "8", icon: FileText, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Série en cours", value: "5 jours", icon: Zap, color: "text-[#C65A1E]600", bg: "bg-amber-50" },
];

export default function PortalOverview() {
  const { user } = useUser();

  return (
    <PortalLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-[#145A5B] rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-1/2 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
          
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Bienvenue,</p>
                <h1 className="text-2xl font-bold mb-2">
                  {user?.firstName || "Apprenant"} 👋
                </h1>
                <p className="text-blue-100 max-w-md">
                  Continuez votre progression vers le niveau B. Vous avez une session de coaching aujourd'hui!
                </p>
              </div>
              <div className="hidden md:flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-center">
                  <p className="text-3xl font-bold">45%</p>
                  <p className="text-xs text-blue-200">Niveau B</p>
                </div>
                <div className="w-px h-12 bg-white/20" />
                <div className="text-center">
                  <p className="text-3xl font-bold">12</p>
                  <p className="text-xs text-blue-200">Sessions</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              {quickStats.map((stat) => (
                <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-lg font-bold">{stat.value}</p>
                    <p className="text-xs text-blue-200">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ProgressTracker />

            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold text-slate-900">Prochaines Sessions</CardTitle>
                <Link href="/portal/coaching">
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 gap-1">
                    Voir tout
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className={`p-4 rounded-xl border-2 transition-all ${session.isLive ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0F3D3E] to-[#145A5B] flex items-center justify-center text-white font-semibold">
                        {session.coach.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-slate-900 truncate">{session.title}</h4>
                          {session.isLive && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500 text-white text-xs font-medium rounded-full">
                              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                              En direct
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 mb-2">avec {session.coach}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{session.date}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{session.time} ({session.duration})</span>
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600">{session.platform}</span>
                        </div>
                      </div>
                      {session.isLive ? (
                        <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2"><Video className="h-4 w-4" />Rejoindre</Button>
                      ) : (
                        <Button variant="outline" className="gap-2"><Calendar className="h-4 w-4" />Rappel</Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <PlayCircle className="h-5 w-5 text-blue-600" />
                  Continuer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentCapsules.map((capsule) => (
                  <div key={capsule.id} className="p-3 rounded-lg border border-slate-200 hover:border-blue-200 hover:bg-blue-50/50 transition-all cursor-pointer group">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${capsule.type === "video" ? "bg-[#E7F2F2] text-[#0F3D3E]" : capsule.type === "document" ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-600"}`}>
                        {capsule.type === "video" ? <PlayCircle className="h-5 w-5" /> : capsule.type === "document" ? <FileText className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-medium text-slate-900 truncate group-hover:text-blue-600 transition-colors">{capsule.title}</h5>
                        <p className="text-xs text-slate-500 mt-0.5">{capsule.module}</p>
                        {capsule.progress > 0 && (
                          <div className="mt-2">
                            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${capsule.progress}%` }} />
                            </div>
                            <p className="text-xs text-slate-400 mt-1">{capsule.progress}% complété</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-[#FFF8F3] to-[#FFF8F3]">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Award className="h-5 w-5 text-[#C65A1E]600" />
                  Réalisations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D97B3D] to-[#C65A1E] border-2 border-white flex items-center justify-center">
                        <Award className="h-4 w-4 text-white" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">3 badges obtenus</p>
                    <p className="text-xs text-slate-500">Prochain: Maître de la rédaction</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  Cette semaine
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Temps d'étude</span>
                    <span className="text-sm font-semibold text-slate-900">4h 30min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Exercices complétés</span>
                    <span className="text-sm font-semibold text-slate-900">8/10</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Score moyen</span>
                    <span className="text-sm font-semibold text-emerald-600">85%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
                  }
