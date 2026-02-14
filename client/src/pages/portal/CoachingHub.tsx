/**
 * CoachingHub Page
 * Lingueefy coaching sessions with Zoom/Teams integration
 * Sprint 8: Premium Learning Hub
 */

import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import {
  Video,
  Calendar,
  Clock,
  User,
  Star,
  MessageSquare,
  ChevronRight,
  Play,
  FileText,
  Download,
  ExternalLink,
  CheckCircle2,
  CalendarPlus,
  Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import PortalLayout from "@/components/portal/PortalLayout";

interface Coach {
  id: string;
  name: string;
  title: string;
  avatar: string | null;
  specialties: string[];
  rating: number;
  sessionsCompleted: number;
}

interface Session {
  id: string;
  title: string;
  description: string;
  coach: Coach;
  date: string;
  time: string;
  duration: string;
  platform: "zoom" | "teams";
  meetingUrl: string;
  status: "upcoming" | "live" | "completed" | "cancelled";
  notes?: string;
  recording?: string;
  materials?: { name: string; url: string }[];
}

const myCoach: Coach = {
  id: "coach-1",
  name: "Marie-Claire Dubois",
  title: "Coach linguistique senior",
  avatar: null,
  specialties: ["Expression orale", "Rédaction administrative", "Préparation SLE"],
  rating: 4.9,
  sessionsCompleted: 156,
};

const upcomingSessions: Session[] = [
  {
    id: "s1",
    title: "Session de coaching - Expression orale",
    description: "Pratique de la conversation professionnelle et feedback personnalisé",
    coach: myCoach,
    date: "Aujourd'hui",
    time: "14:00",
    duration: "45 min",
    platform: "zoom",
    meetingUrl: "https://zoom.us/j/123456789",
    status: "live",
  },
  {
    id: "s2",
    title: "Atelier - Rédaction administrative",
    description: "Techniques de rédaction de notes de service et mémos officiels",
    coach: myCoach,
    date: "23 janvier 2026",
    time: "10:00",
    duration: "60 min",
    platform: "teams",
    meetingUrl: "https://teams.microsoft.com/l/meetup-join/...",
    status: "upcoming",
  },
];

const pastSessions: Session[] = [
  {
    id: "ps1",
    title: "Introduction au coaching linguistique",
    description: "Évaluation initiale et définition des objectifs",
    coach: myCoach,
    date: "15 janvier 2026",
    time: "10:00",
    duration: "60 min",
    platform: "zoom",
    meetingUrl: "",
    status: "completed",
    notes: "Excellent départ! Points forts identifiés: compréhension écrite.",
    recording: "https://zoom.us/rec/...",
    materials: [{ name: "Plan de développement.pdf", url: "#" }],
  },
];

export default function CoachingHub() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  const completedSessions = pastSessions.filter(s => s.status === "completed").length;

  return (
    <PortalLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              Coaching
              <span className="px-3 py-1 bg-[#E7F2F2] text-[#0F3D3E] text-sm font-medium rounded-full">Lingueefy</span>
            </h1>
            <p className="text-slate-500 mt-1">Vos sessions de coaching personnalisé avec nos experts linguistiques</p>
          </div>
          <Button className="bg-[#E7F2F2] hover:bg-[#E7F2F2] gap-2">
            <CalendarPlus className="h-4 w-4" />
            Réserver une session
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-slate-200">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#E7F2F2] flex items-center justify-center">
                  <Video className="h-5 w-5 text-[#0F3D3E]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{completedSessions}</p>
                  <p className="text-xs text-slate-500">Sessions complétées</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{upcomingSessions.length}</p>
                  <p className="text-xs text-slate-500">Sessions à venir</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">4.5h</p>
                  <p className="text-xs text-slate-500">Heures de coaching</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Star className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">4.9</p>
                  <p className="text-xs text-slate-500">Satisfaction moyenne</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {upcomingSessions.some(s => s.status === "live") && (
              <Card className="border-2 border-emerald-300 bg-emerald-50">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center animate-pulse">
                        <Video className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900">Session en cours</h3>
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500 text-white text-xs font-medium rounded-full">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                            En direct
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">{upcomingSessions.find(s => s.status === "live")?.title}</p>
                      </div>
                    </div>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                      <Video className="h-4 w-4" />
                      Rejoindre maintenant
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex items-center gap-2 border-b border-slate-200">
              <button onClick={() => setActiveTab("upcoming")} className={cn("px-4 py-2 text-sm font-medium border-b-2 transition-colors", activeTab === "upcoming" ? "border-[#0F3D3E] text-[#0F3D3E]" : "border-transparent text-slate-500 hover:text-slate-700")}>
                À venir ({upcomingSessions.length})
              </button>
              <button onClick={() => setActiveTab("past")} className={cn("px-4 py-2 text-sm font-medium border-b-2 transition-colors", activeTab === "past" ? "border-[#0F3D3E] text-[#0F3D3E]" : "border-transparent text-slate-500 hover:text-slate-700")}>
                Historique ({pastSessions.length})
              </button>
            </div>

            <div className="space-y-4">
              {(activeTab === "upcoming" ? upcomingSessions : pastSessions).map((session) => (
                <Card key={session.id} className={cn("border-2 transition-all", session.status === "live" && "border-emerald-200 bg-emerald-50/50", session.status === "completed" && "border-slate-200 bg-white/50")}>
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", session.platform === "zoom" ? "bg-blue-100" : "bg-[#E7F2F2]")}>
                        <Video className={cn("h-6 w-6", session.platform === "zoom" ? "text-blue-600" : "text-[#0F3D3E]")} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-slate-900">{session.title}</h4>
                          {session.status === "live" && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500 text-white text-xs font-medium rounded-full">
                              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                              En direct
                            </span>
                          )}
                          {session.status === "completed" && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-200 text-slate-600 text-xs font-medium rounded-full">
                              <CheckCircle2 className="h-3 w-3" />
                              Terminée
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 mb-2">{session.description}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{session.date}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{session.time} ({session.duration})</span>
                          <span className={cn("px-2 py-0.5 rounded text-xs font-medium", session.platform === "zoom" ? "bg-blue-100 text-blue-700" : "bg-[#E7F2F2] text-[#0F3D3E]")}>{session.platform === "zoom" ? "Zoom" : "Teams"}</span>
                        </div>
                        {session.notes && <div className="mt-3 p-3 bg-slate-100 rounded-lg"><p className="text-sm text-slate-600"><strong>Notes:</strong> {session.notes}</p></div>}
                        {session.materials && session.materials.length > 0 && (
                          <div className="mt-3 flex items-center gap-2">
                            {session.materials.map((m, i) => (
                              <Button key={i} variant="outline" size="sm" className="gap-1"><FileText className="h-3 w-3" />{m.name}</Button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        {session.status === "live" && <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2"><Video className="h-4 w-4" />Rejoindre</Button>}
                        {session.status === "upcoming" && <Button variant="outline" className="gap-2"><Calendar className="h-4 w-4" />Rappel</Button>}
                        {session.recording && <Button variant="outline" size="sm" className="gap-1"><Play className="h-3 w-3" />Revoir</Button>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-slate-900">Mon Coach</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#0F3D3E] to-[#145A5B] flex items-center justify-center text-white text-2xl font-bold mb-3">
                    {myCoach.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <h3 className="font-semibold text-slate-900">{myCoach.name}</h3>
                  <p className="text-sm text-slate-500 mb-3">{myCoach.title}</p>
                  <div className="flex items-center justify-center gap-1 mb-4">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-medium text-slate-900">{myCoach.rating}</span>
                    <span className="text-sm text-slate-500">({myCoach.sessionsCompleted} sessions)</span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {myCoach.specialties.map((s, i) => (
                      <span key={i} className="px-2 py-1 bg-[#E7F2F2] text-[#0F3D3E] text-xs rounded-full">{s}</span>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full gap-2"><MessageSquare className="h-4 w-4" />Envoyer un message</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-[#0F3D3E]-50 to-blue-50">
              <CardContent className="pt-4">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#E7F2F2] flex items-center justify-center mb-3">
                    <CalendarPlus className="h-6 w-6 text-[#0F3D3E]" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">Besoin d'aide?</h3>
                  <p className="text-sm text-slate-500 mb-4">Réservez une session supplémentaire avec votre coach</p>
                  <Button className="w-full bg-[#E7F2F2] hover:bg-[#E7F2F2]">Réserver maintenant</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
