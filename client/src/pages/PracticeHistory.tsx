import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useAppLayout } from "@/contexts/AppLayoutContext";

// Coach images mapping
const coachImages: Record<string, string> = {
  steven: "https://rusingacademy-cdn.b-cdn.net/images/coaches/Steven(2).webp",
  sue_anne: "https://rusingacademy-cdn.b-cdn.net/images/coaches/Steven(2).webp", // Legacy: redirected to Steven
  erika: "https://rusingacademy-cdn.b-cdn.net/images/coaches/Steven(2).webp",   // Legacy: redirected to Steven
  preciosa: "https://rusingacademy-cdn.b-cdn.net/images/coaches/Preciosa2.webp",
};

// Coach names mapping
const coachNames: Record<string, string> = {
  steven: "Coach Steven",
  sue_anne: "Coach Steven",   // Legacy: redirected
  erika: "Coach Steven",     // Legacy: redirected
  preciosa: "Coach Preciosa",
};

// Level colors
const levelColors: Record<string, string> = {
  A: "bg-green-500/20 text-green-400 border-green-500/30",
  B: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  C: "bg-red-500/20 text-red-400 border-red-500/30",
};

// Skill icons
const skillIcons: Record<string, string> = {
  oral_expression: "🗣️",
  written_expression: "✍️",
  oral_comprehension: "👂",
  written_comprehension: "📖",
};

// Skill labels
const skillLabels: Record<string, string> = {
  oral_expression: "Expression orale",
  written_expression: "Expression écrite",
  oral_comprehension: "Compréhension orale",
  written_comprehension: "Compréhension écrite",
};

export default function PracticeHistory() {
  const { isInsideAppLayout } = useAppLayout();
  const { user, loading: authLoading } = useAuth();
  const [coachFilter, setCoachFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");

  // Fetch session history
  const { data: sessions, isLoading } = trpc.sleCompanion.getSessionHistory.useQuery(
    { limit: 50 },
    { enabled: !!user }
  );

  // Filter sessions
  const filteredSessions = sessions?.filter((session) => {
    if (coachFilter !== "all" && session.coach?.id !== coachFilter) return false;
    if (levelFilter !== "all" && session.level !== levelFilter) return false;
    return true;
  });

  // Calculate stats
  const totalSessions = sessions?.length || 0;
  const avgScore = sessions?.length
    ? Math.round(
        sessions.reduce((acc, s) => acc + (s.averageScore || 0), 0) / sessions.length
      )
    : 0;
  const totalMessages = sessions?.reduce((acc, s) => acc + ((s as any).messageCount || 0), 0) || 0;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-10 w-64 mb-6" />
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <Card className="max-w-md bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Connexion requise</CardTitle>
            <CardDescription className="text-gray-400">
              Vous devez être connecté pour voir votre historique de pratique.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button className="w-full bg-gradient-to-r from-cyan-500 to-purple-500">
                Se connecter
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Historique de Pratique
            </h1>
            <p className="text-gray-400">
              Vos sessions de pratique avec le SLE AI Companion
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              ← Retour au tableau de bord
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Sessions totales</p>
                  <p className="text-2xl font-bold text-white">{totalSessions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <span className="text-2xl">⭐</span>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Score moyen</p>
                  <p className="text-2xl font-bold text-white">{avgScore}/100</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <span className="text-2xl">💬</span>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Messages échangés</p>
                  <p className="text-2xl font-bold text-white">{totalMessages}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <Select value={coachFilter} onValueChange={setCoachFilter}>
            <SelectTrigger className="w-48 bg-white/5 border-white/20 text-white">
              <SelectValue placeholder="Tous les coaches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les coaches</SelectItem>
              <SelectItem value="steven">Coach Steven (Français)</SelectItem>
              <SelectItem value="preciosa">Coach Preciosa (English)</SelectItem>
            </SelectContent>
          </Select>

          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-48 bg-white/5 border-white/20 text-white">
              <SelectValue placeholder="Tous les niveaux" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les niveaux</SelectItem>
              <SelectItem value="A">Niveau A</SelectItem>
              <SelectItem value="B">Niveau B</SelectItem>
              <SelectItem value="C">Niveau C</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sessions List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : filteredSessions && filteredSessions.length > 0 ? (
          <div className="space-y-4">
            {filteredSessions.map((session) => (
              <Card
                key={session.id}
                className="bg-white/5 border-white/10 hover:border-cyan-400/30 transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Coach Image */}
                    <img
                      loading="lazy" src={coachImages[session.coach?.id || ""] || coachImages.steven}
                      alt={coachNames[session.coach?.id || ""] || "Coach"}
                      className="w-14 h-14 rounded-full object-cover border-2 border-cyan-400/30"
                    />

                    {/* Session Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold">
                          {coachNames[session.coach?.id || ""] || "Coach"}
                        </h3>
                        <Badge className={levelColors[session.level || "A"] || levelColors.A}>
                          Niveau {session.level}
                        </Badge>
                        <Badge variant="outline" className="border-white/20 text-gray-300">
                          {skillIcons[session.skill]} {skillLabels[session.skill] || session.skill}
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-sm">
                        {session.createdAt
                          ? format(new Date(session.createdAt), "d MMMM yyyy 'à' HH:mm", {
                              locale: fr,
                            })
                          : "Date inconnue"}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-center">
                      <div>
                        <p className="text-gray-400 text-xs">Messages</p>
                        <p className="text-white font-semibold">{(session as any).messageCount || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Score</p>
                        <p className="text-cyan-400 font-semibold">
                          {session.averageScore ? `${session.averageScore}/100` : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Statut</p>
                        <Badge
                          className={
                            session.status === "completed"
                              ? "bg-green-500/20 text-green-400"
                              : session.status === "active"
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-gray-500/20 text-gray-400"
                          }
                        >
                          {session.status === "completed"
                            ? "Terminé"
                            : session.status === "active"
                            ? "En cours"
                            : "Abandonné"}
                        </Badge>
                      </div>
                    </div>

                    {/* View Button */}
                    <Link href={`/practice-history/${session.id}`}>
                      <Button
                        variant="ghost"
                        className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
                      >
                        Voir →
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-500/20 flex items-center justify-center">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Aucune session trouvée</h3>
              <p className="text-gray-400 mb-4">
                {coachFilter !== "all" || levelFilter !== "all"
                  ? "Aucune session ne correspond à vos filtres."
                  : "Commencez à pratiquer avec le SLE AI Companion pour voir votre historique ici."}
              </p>
              <Button
                className="bg-gradient-to-r from-cyan-500 to-purple-500"
                onClick={() => {
                  // Dispatch event to open SLE AI Companion
                  window.dispatchEvent(new CustomEvent("openSLEAICompanion"));
                }}
              >
                Démarrer une session
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
