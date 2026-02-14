import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Users, Target, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentProgress {
  id: number;
  name: string;
  avatarUrl?: string;
  currentLevel: string;
  targetLevel: string;
  progressPercent: number;
  trend: "up" | "down" | "stable";
  lastSession?: Date;
  sessionsCompleted: number;
}

interface StudentProgressWidgetProps {
  students: StudentProgress[];
  language?: "en" | "fr";
  className?: string;
  onViewStudent?: (studentId: number) => void;
}

export function StudentProgressWidget({ 
  students, 
  language = "en", 
  className,
  onViewStudent 
}: StudentProgressWidgetProps) {
  const labels = {
    en: {
      title: "Student Progress",
      subtitle: "Track your students' SLE journey",
      avgProgress: "Average Progress",
      totalStudents: "Active Students",
      onTrack: "On Track",
      level: "Level",
      target: "Target",
      sessions: "sessions",
      noStudents: "No students assigned yet",
    },
    fr: {
      title: "Progression des Étudiants",
      subtitle: "Suivez le parcours SLE de vos étudiants",
      avgProgress: "Progression Moyenne",
      totalStudents: "Étudiants Actifs",
      onTrack: "En Bonne Voie",
      level: "Niveau",
      target: "Objectif",
      sessions: "sessions",
      noStudents: "Aucun étudiant assigné",
    },
  };

  const l = labels[language];

  const avgProgress = students.length > 0 
    ? Math.round(students.reduce((sum, s) => sum + s.progressPercent, 0) / students.length)
    : 0;
  
  const onTrackCount = students.filter(s => s.trend === "up" || s.trend === "stable").length;

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-emerald-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-slate-400" />;
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 border-b border-blue-200/50 dark:border-blue-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20 dark:bg-blue-500/30">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg text-slate-900 dark:text-white">{l.title}</CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">{l.subtitle}</p>
            </div>
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-slate-800/50">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{avgProgress}%</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">{l.avgProgress}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-slate-800/50">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{students.length}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">{l.totalStudents}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-slate-800/50">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{onTrackCount}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">{l.onTrack}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
        {students.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>{l.noStudents}</p>
          </div>
        ) : (
          students.map((student) => (
            <div
              key={student.id}
              onClick={() => onViewStudent?.(student.id)}
              className={cn(
                "p-4 rounded-xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700",
                "hover:border-blue-300 dark:hover:border-blue-700 transition-all",
                onViewStudent && "cursor-pointer"
              )}
            >
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-sm">
                    {getInitials(student.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-900 dark:text-white truncate">
                      {student.name}
                    </h4>
                    {getTrendIcon(student.trend)}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {student.sessionsCompleted} {l.sessions}
                  </p>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <Badge variant="outline" className="text-xs">
                      {l.level} {student.currentLevel}
                    </Badge>
                    <span className="text-slate-400">→</span>
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 text-xs">
                      <Target className="h-3 w-3 mr-1" />
                      {student.targetLevel}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Progress 
                  value={student.progressPercent} 
                  className="flex-1 h-2 [&>div]:bg-blue-500"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 w-12 text-right">
                  {student.progressPercent}%
                </span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export default StudentProgressWidget;
