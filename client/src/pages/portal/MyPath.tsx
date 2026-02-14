/**
 * MyPath Page
 * Path Series™ curriculum view with learning modules
 * Sprint 8: Premium Learning Hub
 */

import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import {
  BookOpen,
  PlayCircle,
  FileText,
  CheckCircle2,
  Lock,
  Clock,
  ChevronRight,
  Trophy,
  Target,
  Zap,
  Star,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import PortalLayout from "@/components/portal/PortalLayout";
import ProgressTracker from "@/components/portal/ProgressTracker";

interface Module {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: "video" | "document" | "exercise" | "quiz";
  status: "completed" | "in-progress" | "available" | "locked";
  progress?: number;
}

interface PathUnit {
  id: string;
  title: string;
  description: string;
  level: "A" | "B" | "C";
  status: "completed" | "in-progress" | "locked";
  modules: Module[];
  estimatedTime: string;
  completedModules: number;
}

const pathUnits: PathUnit[] = [
  {
    id: "unit-1",
    title: "Fondamentaux de la communication",
    description: "Maîtrisez les bases de la communication professionnelle bilingue",
    level: "A",
    status: "completed",
    estimatedTime: "8h",
    completedModules: 5,
    modules: [
      { id: "m1-1", title: "Introduction au bilinguisme professionnel", description: "Comprendre les enjeux", duration: "15 min", type: "video", status: "completed" },
      { id: "m1-2", title: "Vocabulaire de base - Partie 1", description: "Les 500 mots essentiels", duration: "45 min", type: "document", status: "completed" },
      { id: "m1-3", title: "Exercices de compréhension", description: "Testez vos connaissances", duration: "30 min", type: "exercise", status: "completed" },
      { id: "m1-4", title: "Vocabulaire de base - Partie 2", description: "Expressions courantes", duration: "45 min", type: "document", status: "completed" },
      { id: "m1-5", title: "Quiz de validation", description: "Évaluation du module", duration: "20 min", type: "quiz", status: "completed" },
    ],
  },
  {
    id: "unit-2",
    title: "Expression écrite professionnelle",
    description: "Rédigez des communications claires et efficaces",
    level: "B",
    status: "in-progress",
    estimatedTime: "12h",
    completedModules: 3,
    modules: [
      { id: "m2-1", title: "Structure des documents officiels", description: "Notes, mémos, courriels", duration: "25 min", type: "video", status: "completed" },
      { id: "m2-2", title: "Formules de politesse avancées", description: "Ton et registre appropriés", duration: "35 min", type: "document", status: "completed" },
      { id: "m2-3", title: "Exercices de rédaction", description: "Pratique guidée", duration: "60 min", type: "exercise", status: "completed", progress: 100 },
      { id: "m2-4", title: "Rédaction de notes de service", description: "Cas pratiques", duration: "45 min", type: "exercise", status: "in-progress", progress: 60 },
      { id: "m2-5", title: "Révision et correction", description: "Techniques d'auto-révision", duration: "30 min", type: "video", status: "available" },
      { id: "m2-6", title: "Quiz de validation", description: "Évaluation du module", duration: "25 min", type: "quiz", status: "locked" },
    ],
  },
  {
    id: "unit-3",
    title: "Interaction orale complexe",
    description: "Participez efficacement aux réunions et présentations",
    level: "B",
    status: "locked",
    estimatedTime: "10h",
    completedModules: 0,
    modules: [
      { id: "m3-1", title: "Techniques de présentation", description: "Captiver votre audience", duration: "30 min", type: "video", status: "locked" },
      { id: "m3-2", title: "Gestion des réunions bilingues", description: "Facilitation et participation", duration: "40 min", type: "document", status: "locked" },
      { id: "m3-3", title: "Exercices de simulation", description: "Mises en situation", duration: "90 min", type: "exercise", status: "locked" },
      { id: "m3-4", title: "Quiz de validation", description: "Évaluation du module", duration: "25 min", type: "quiz", status: "locked" },
    ],
  },
  {
    id: "unit-4",
    title: "Leadership bilingue",
    description: "Dirigez avec excellence dans les deux langues officielles",
    level: "C",
    status: "locked",
    estimatedTime: "15h",
    completedModules: 0,
    modules: [
      { id: "m4-1", title: "Communication stratégique", description: "Influence et persuasion", duration: "45 min", type: "video", status: "locked" },
      { id: "m4-2", title: "Gestion d'équipes bilingues", description: "Meilleures pratiques", duration: "60 min", type: "document", status: "locked" },
      { id: "m4-3", title: "Études de cas", description: "Situations réelles", duration: "120 min", type: "exercise", status: "locked" },
      { id: "m4-4", title: "Évaluation finale", description: "Certification niveau C", duration: "45 min", type: "quiz", status: "locked" },
    ],
  },
];

const levelColors = {
  A: { bg: "bg-emerald-500", light: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
  B: { bg: "bg-[#C65A1E]", light: "bg-amber-50", text: "text-amber-600", border: "border-[#FFE4D6]" },
  C: { bg: "bg-blue-500", light: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
};

const moduleTypeIcons = {
  video: PlayCircle,
  document: FileText,
  exercise: BookOpen,
  quiz: Target,
};

export default function MyPath() {
  const { user } = useUser();
  const [expandedUnit, setExpandedUnit] = useState<string | null>("unit-2");

  const totalModules = pathUnits.reduce((acc, unit) => acc + unit.modules.length, 0);
  const completedModules = pathUnits.reduce((acc, unit) => acc + unit.completedModules, 0);
  const overallProgress = Math.round((completedModules / totalModules) * 100);

  return (
    <PortalLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              Mon Parcours
              <span className="px-3 py-1 bg-[#E7F2F2] text-[#0F3D3E] text-sm font-medium rounded-full">
                Path Series™
              </span>
            </h1>
            <p className="text-slate-500 mt-1">Votre curriculum personnalisé vers la maîtrise bilingue</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-900">{overallProgress}%</p>
              <p className="text-xs text-slate-500">Progression globale</p>
            </div>
          </div>
        </div>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                {["A", "B", "C"].map((level) => {
                  const colors = levelColors[level as "A" | "B" | "C"];
                  const isCompleted = level === "A";
                  const isActive = level === "B";
                  return (
                    <div key={level} className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white", colors.bg, isActive && "ring-2 ring-offset-2 ring-amber-500")}>
                        {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : level}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">Niveau {level}</p>
                        <p className="text-xs text-slate-500">{isCompleted ? "Complété" : isActive ? "En cours" : "Verrouillé"}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Trophy className="h-4 w-4 text-amber-500" />
                <span>{completedModules}/{totalModules} modules complétés</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {pathUnits.map((unit) => {
            const colors = levelColors[unit.level];
            const isExpanded = expandedUnit === unit.id;
            const isLocked = unit.status === "locked";
            const isCompleted = unit.status === "completed";
            const isActive = unit.status === "in-progress";
            const unitProgress = Math.round((unit.completedModules / unit.modules.length) * 100);
            const ModuleIcon = moduleTypeIcons;

            return (
              <Card key={unit.id} className={cn("border-2 transition-all duration-300", isActive && `${colors.border} ${colors.light}`, isCompleted && "border-emerald-200 bg-emerald-50/50", isLocked && "border-slate-200 bg-white/50 opacity-70")}>
                <button onClick={() => !isLocked && setExpandedUnit(isExpanded ? null : unit.id)} className="w-full text-left" disabled={isLocked}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-4">
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg text-white", colors.bg)}>
                        {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : isLocked ? <Lock className="h-5 w-5" /> : unit.level}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{unit.title}</CardTitle>
                          {isActive && <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", colors.light, colors.text)}>En cours</span>}
                          {isCompleted && <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600">Complété</span>}
                        </div>
                        <p className="text-sm text-slate-500">{unit.description}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-900">{unitProgress}%</p>
                          <p className="text-xs text-slate-500">{unit.completedModules}/{unit.modules.length} modules</p>
                        </div>
                        <ChevronRight className={cn("h-5 w-5 text-slate-400 transition-transform", isExpanded && "rotate-90")} />
                      </div>
                    </div>
                    {!isLocked && (
                      <div className="mt-3 w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full bg-gradient-to-r", isCompleted ? "from-emerald-500 to-emerald-600" : `from-${unit.level === 'A' ? 'emerald' : unit.level === 'B' ? 'amber' : 'blue'}-500 to-${unit.level === 'A' ? 'emerald' : unit.level === 'B' ? 'amber' : 'blue'}-600`)} style={{ width: `${unitProgress}%` }} />
                      </div>
                    )}
                  </CardHeader>
                </button>

                {isExpanded && !isLocked && (
                  <CardContent className="pt-0">
                    <div className="border-t border-slate-200 pt-4 space-y-2">
                      {unit.modules.map((module) => {
                        const Icon = moduleTypeIcons[module.type];
                        const isModuleLocked = module.status === "locked";
                        const isModuleCompleted = module.status === "completed";
                        const isModuleActive = module.status === "in-progress";
                        return (
                          <div key={module.id} className={cn("flex items-center gap-4 p-3 rounded-lg transition-all", isModuleActive && "bg-amber-50 border border-[#FFE4D6]", isModuleCompleted && "bg-white", !isModuleLocked && !isModuleCompleted && !isModuleActive && "hover:bg-white cursor-pointer", isModuleLocked && "opacity-50")}>
                            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", isModuleCompleted ? "bg-emerald-100 text-emerald-600" : isModuleActive ? "bg-amber-100 text-amber-600" : isModuleLocked ? "bg-slate-200 text-slate-400" : "bg-blue-100 text-blue-600")}>
                              {isModuleLocked ? <Lock className="h-4 w-4" /> : <Icon className="h-5 w-5" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className={cn("text-sm font-medium", isModuleLocked ? "text-slate-400" : "text-slate-900")}>{module.title}</p>
                                {isModuleActive && <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-600">{module.progress}%</span>}
                              </div>
                              <p className="text-xs text-slate-500">{module.description}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-slate-500 flex items-center gap-1"><Clock className="h-3 w-3" />{module.duration}</span>
                              {isModuleCompleted && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                              {isModuleActive && <Button size="sm" className="bg-[#C65A1E] hover:bg-amber-600">Continuer</Button>}
                              {!isModuleLocked && !isModuleCompleted && !isModuleActive && <Button size="sm" variant="outline">Commencer</Button>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </PortalLayout>
  );
       }
