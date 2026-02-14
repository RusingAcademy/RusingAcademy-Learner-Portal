import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BookOpen, Mic, PenTool, Info } from "lucide-react";

/**
 * SkillGapHeatmap - Visualize SLE skill gaps by competency area
 * Shows comprehension, expression, and interaction skills across levels A, B, C
 */

interface SkillScore {
  level: "A" | "B" | "C";
  comprehension: number; // 0-100
  expression: number; // 0-100
  interaction: number; // 0-100
}

interface SkillGapHeatmapProps {
  skills: SkillScore[];
  targetLevel?: "A" | "B" | "C";
  language?: "en" | "fr";
  className?: string;
  showLegend?: boolean;
}

const labels = {
  en: {
    title: "Skill Gap Analysis",
    subtitle: "Performance by competency area",
    comprehension: "Comprehension",
    expression: "Expression",
    interaction: "Interaction",
    reading: "Reading",
    writing: "Writing",
    oral: "Oral",
    level: "Level",
    score: "Score",
    target: "Target",
    gap: "Gap",
    strength: "Strength",
    needsWork: "Needs Work",
    critical: "Critical",
    legend: "Legend",
    excellent: "Excellent (80-100%)",
    good: "Good (60-79%)",
    developing: "Developing (40-59%)",
    needsImprovement: "Needs Improvement (<40%)",
  },
  fr: {
    title: "Analyse des Lacunes",
    subtitle: "Performance par domaine de compétence",
    comprehension: "Compréhension",
    expression: "Expression",
    interaction: "Interaction",
    reading: "Lecture",
    writing: "Écriture",
    oral: "Oral",
    level: "Niveau",
    score: "Score",
    target: "Cible",
    gap: "Lacune",
    strength: "Force",
    needsWork: "À améliorer",
    critical: "Critique",
    legend: "Légende",
    excellent: "Excellent (80-100%)",
    good: "Bon (60-79%)",
    developing: "En développement (40-59%)",
    needsImprovement: "À améliorer (<40%)",
  },
};

// Get color based on score
const getScoreColor = (score: number): string => {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-emerald-400";
  if (score >= 40) return "bg-amber-400";
  return "bg-red-400";
};

const getScoreTextColor = (score: number): string => {
  if (score >= 80) return "text-emerald-700";
  if (score >= 60) return "text-emerald-600";
  if (score >= 40) return "text-amber-600";
  return "text-red-600";
};

const getScoreBgColor = (score: number): string => {
  if (score >= 80) return "bg-emerald-50 dark:bg-emerald-950/30";
  if (score >= 60) return "bg-emerald-50/50 dark:bg-emerald-950/20";
  if (score >= 40) return "bg-amber-50 dark:bg-amber-950/30";
  return "bg-red-50 dark:bg-red-950/30";
};

const getScoreLabel = (score: number, l: typeof labels.en): string => {
  if (score >= 80) return l.strength;
  if (score >= 60) return l.good;
  if (score >= 40) return l.needsWork;
  return l.critical;
};

export function SkillGapHeatmap({
  skills,
  targetLevel = "B",
  language = "en",
  className = "",
  showLegend = true,
}: SkillGapHeatmapProps) {
  const l = labels[language];
  
  const competencies = [
    { key: "comprehension", label: l.comprehension, icon: BookOpen, description: language === "fr" ? "Lecture et écoute" : "Reading and listening" },
    { key: "expression", label: l.expression, icon: PenTool, description: language === "fr" ? "Écriture et parole" : "Writing and speaking" },
    { key: "interaction", label: l.interaction, icon: Mic, description: language === "fr" ? "Communication orale" : "Oral communication" },
  ] as const;

  const levels = ["A", "B", "C"] as const;

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {l.title}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-sm">
                      {language === "fr" 
                        ? "Cette carte thermique montre vos forces et lacunes dans chaque domaine de compétence SLE."
                        : "This heatmap shows your strengths and gaps in each SLE competency area."}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{l.subtitle}</p>
          </div>
          <Badge variant="outline" className="text-xs">
            {l.target}: {targetLevel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Heatmap Grid */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-sm font-medium text-muted-foreground pb-3 pr-4">
                  {l.level}
                </th>
                {competencies.map((comp) => (
                  <th key={comp.key} className="text-center pb-3 px-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex flex-col items-center gap-1">
                          <comp.icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs font-medium">{comp.label}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">{comp.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {levels.map((level) => {
                const skillData = skills.find((s) => s.level === level);
                const isTarget = level === targetLevel;
                
                return (
                  <tr key={level} className={isTarget ? "bg-primary/5" : ""}>
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${isTarget ? "text-primary" : "text-foreground"}`}>
                          {level}
                        </span>
                        {isTarget && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {l.target}
                          </Badge>
                        )}
                      </div>
                    </td>
                    {competencies.map((comp) => {
                      const score = skillData?.[comp.key] ?? 0;
                      return (
                        <td key={comp.key} className="p-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger className="w-full">
                                <div
                                  className={`
                                    relative h-14 rounded-lg flex items-center justify-center
                                    transition-all duration-200 hover:scale-105 cursor-pointer
                                    ${getScoreBgColor(score)}
                                    ${isTarget ? "ring-2 ring-primary/30" : ""}
                                  `}
                                >
                                  {/* Score bar */}
                                  <div
                                    className={`
                                      absolute bottom-0 left-0 right-0 rounded-b-lg transition-all
                                      ${getScoreColor(score)}
                                    `}
                                    style={{ height: `${score}%`, opacity: 0.3 }}
                                  />
                                  {/* Score text */}
                                  <span className={`relative z-10 text-lg font-bold ${getScoreTextColor(score)}`}>
                                    {score}%
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-sm">
                                  <p className="font-medium">{comp.label} - {l.level} {level}</p>
                                  <p className={getScoreTextColor(score)}>
                                    {score}% - {getScoreLabel(score, l)}
                                  </p>
                                  {score < 60 && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {language === "fr" 
                                        ? "Recommandé: Plus de pratique dans ce domaine"
                                        : "Recommended: More practice in this area"}
                                    </p>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        {showLegend && (
          <div className="mt-6 pt-4 border-t">
            <p className="text-xs font-medium text-muted-foreground mb-2">{l.legend}</p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-emerald-500" />
                <span className="text-xs text-muted-foreground">{l.excellent}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-emerald-400" />
                <span className="text-xs text-muted-foreground">{l.good}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-amber-400" />
                <span className="text-xs text-muted-foreground">{l.developing}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-red-400" />
                <span className="text-xs text-muted-foreground">{l.needsImprovement}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * CompactSkillGapHeatmap - Smaller version for dashboard sidebars
 */
export function CompactSkillGapHeatmap({
  comprehension,
  expression,
  interaction,
  language = "en",
  className = "",
}: {
  comprehension: number;
  expression: number;
  interaction: number;
  language?: "en" | "fr";
  className?: string;
}) {
  const l = labels[language];
  
  const skills = [
    { label: l.comprehension, score: comprehension, icon: BookOpen },
    { label: l.expression, score: expression, icon: PenTool },
    { label: l.interaction, score: interaction, icon: Mic },
  ];

  return (
    <div className={`space-y-2 ${className}`}>
      {skills.map((skill) => (
        <div key={skill.label} className="flex items-center gap-2">
          <skill.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium truncate">{skill.label}</span>
              <span className={`text-xs font-bold ${getScoreTextColor(skill.score)}`}>
                {skill.score}%
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${getScoreColor(skill.score)}`}
                style={{ width: `${skill.score}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SkillGapHeatmap;
