/**
 * ProgressTracker Component
 * Visual progress tracker for SLE levels A, B, C
 * Sprint 8: Premium Learning Hub
 */

import { CheckCircle2, Circle, Lock, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface LevelProgress {
  level: "A" | "B" | "C";
  name: string;
  description: string;
  status: "completed" | "in-progress" | "locked";
  progress: number;
  modules: {
    name: string;
    completed: boolean;
  }[];
}

interface ProgressTrackerProps {
  levels?: LevelProgress[];
  currentLevel?: "A" | "B" | "C";
  compact?: boolean;
}

const defaultLevels: LevelProgress[] = [
  {
    level: "A",
    name: "Niveau A",
    description: "Compétence de base",
    status: "completed",
    progress: 100,
    modules: [
      { name: "Compréhension orale", completed: true },
      { name: "Expression écrite", completed: true },
      { name: "Interaction orale", completed: true },
    ],
  },
  {
    level: "B",
    name: "Niveau B",
    description: "Compétence intermédiaire",
    status: "in-progress",
    progress: 45,
    modules: [
      { name: "Compréhension orale avancée", completed: true },
      { name: "Expression écrite professionnelle", completed: true },
      { name: "Interaction orale complexe", completed: false },
      { name: "Rédaction administrative", completed: false },
    ],
  },
  {
    level: "C",
    name: "Niveau C",
    description: "Compétence avancée",
    status: "locked",
    progress: 0,
    modules: [
      { name: "Maîtrise linguistique", completed: false },
      { name: "Communication stratégique", completed: false },
      { name: "Leadership bilingue", completed: false },
    ],
  },
];

const levelColors = {
  A: {
    bg: "bg-emerald-500",
    bgLight: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
    gradient: "from-emerald-500 to-emerald-600",
  },
  B: {
    bg: "bg-[#C65A1E]",
    bgLight: "bg-amber-50",
    text: "text-amber-600",
    border: "border-[#FFE4D6]",
    gradient: "from-[#C65A1E] to-[#A84A15]",
  },
  C: {
    bg: "bg-blue-500",
    bgLight: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
    gradient: "from-blue-500 to-blue-600",
  },
};

export default function ProgressTracker({ 
  levels = defaultLevels, 
  currentLevel = "B",
  compact = false 
}: ProgressTrackerProps) {
  if (compact) {
    return <CompactTracker levels={levels} currentLevel={currentLevel} />;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Progression SLE</h3>
          <p className="text-sm text-slate-500">Votre parcours vers la maîtrise bilingue</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#E7F2F2] rounded-full">
          <Trophy className="h-4 w-4 text-[#0F3D3E]" />
          <span className="text-sm font-medium text-[#0F3D3E]">Path Series™</span>
        </div>
      </div>

      <div className="space-y-4">
        {levels.map((level, index) => {
          const colors = levelColors[level.level];
          const isActive = level.status === "in-progress";
          const isCompleted = level.status === "completed";
          const isLocked = level.status === "locked";

          return (
            <div
              key={level.level}
              className={cn(
                "relative rounded-xl border-2 p-4 transition-all duration-300",
                isActive && `${colors.border} ${colors.bgLight}`,
                isCompleted && "border-slate-200 bg-white",
                isLocked && "border-slate-100 bg-white/50 opacity-60"
              )}
            >
              {index < levels.length - 1 && (
                <div className="absolute left-8 top-full w-0.5 h-4 bg-slate-200 z-0" />
              )}

              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-lg",
                    isCompleted && `bg-gradient-to-br ${colors.gradient}`,
                    isActive && `bg-gradient-to-br ${colors.gradient}`,
                    isLocked && "bg-slate-300"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : isLocked ? (
                    <Lock className="h-5 w-5" />
                  ) : (
                    level.level
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-slate-900">{level.name}</h4>
                    {isActive && (
                      <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", colors.bgLight, colors.text)}>
                        En cours
                      </span>
                    )}
                    {isCompleted && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600">
                        Complété
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mb-3">{level.description}</p>

                  {!isLocked && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">
                          {level.modules.filter(m => m.completed).length}/{level.modules.length} modules
                        </span>
                        <span className={cn("font-medium", colors.text)}>{level.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all duration-500 bg-gradient-to-r", colors.gradient)}
                          style={{ width: `${level.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {isActive && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {level.modules.map((module, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "flex items-center gap-2 text-xs p-2 rounded-lg",
                            module.completed ? "bg-white text-slate-700" : "bg-white/50 text-slate-500"
                          )}
                        >
                          {module.completed ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                          ) : (
                            <Circle className="h-3.5 w-3.5 text-slate-300 flex-shrink-0" />
                          )}
                          <span className="truncate">{module.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CompactTracker({ levels, currentLevel }: { levels: LevelProgress[]; currentLevel: string }) {
  return (
    <div className="flex items-center gap-2">
      {levels.map((level, index) => {
        const colors = levelColors[level.level];
        const isActive = level.status === "in-progress";
        const isCompleted = level.status === "completed";

        return (
          <div key={level.level} className="flex items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all",
                isCompleted && `bg-gradient-to-br ${colors.gradient} text-white`,
                isActive && `bg-gradient-to-br ${colors.gradient} text-white ring-2 ring-offset-2`,
                !isCompleted && !isActive && "bg-slate-200 text-slate-400"
              )}
            >
              {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : level.level}
            </div>
            {index < levels.length - 1 && (
              <div className={cn(
                "w-8 h-0.5 mx-1",
                isCompleted ? "bg-emerald-500" : "bg-slate-200"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}
