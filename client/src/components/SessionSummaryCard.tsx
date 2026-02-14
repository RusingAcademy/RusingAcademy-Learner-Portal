import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Target, 
  Clock, 
  MessageSquare, 
  TrendingUp, 
  Star,
  Download,
  Share2,
  CheckCircle,
  AlertCircle,
  Lightbulb
} from "lucide-react";
import { toast } from "sonner";

interface SessionSummary {
  sessionId: number;
  coachName: string;
  coachAvatar?: string;
  level: "A" | "B" | "C";
  skill: "oral_expression" | "written_expression" | "oral_comprehension" | "written_comprehension";
  duration: number; // in seconds
  messageCount: number;
  averageScore: number;
  performanceLevel: "excellent" | "good" | "needs_improvement";
  strengths: string[];
  areasToImprove: string[];
  recommendations: string[];
  completedAt: Date;
}

interface SessionSummaryCardProps {
  summary: SessionSummary;
  onClose?: () => void;
  onStartNewSession?: () => void;
}

const skillLabels: Record<string, { en: string; fr: string }> = {
  oral_expression: { en: "Oral Expression", fr: "Expression orale" },
  written_expression: { en: "Written Expression", fr: "Expression écrite" },
  oral_comprehension: { en: "Oral Comprehension", fr: "Compréhension orale" },
  written_comprehension: { en: "Written Comprehension", fr: "Compréhension écrite" },
};

const levelColors: Record<string, string> = {
  A: "bg-green-500",
  B: "bg-amber-500",
  C: "bg-red-500",
};

const performanceConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  excellent: { 
    color: "text-green-500", 
    icon: <Trophy className="w-6 h-6" />, 
    label: "Excellent!" 
  },
  good: { 
    color: "text-amber-500", 
    icon: <Star className="w-6 h-6" />, 
    label: "Bon travail!" 
  },
  needs_improvement: { 
    color: "text-orange-500", 
    icon: <Target className="w-6 h-6" />, 
    label: "Continuez à pratiquer" 
  },
};

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

export default function SessionSummaryCard({ 
  summary, 
  onClose, 
  onStartNewSession 
}: SessionSummaryCardProps) {
  const [isSharing, setIsSharing] = useState(false);
  
  const performance = performanceConfig[summary.performanceLevel];
  const skillLabel = skillLabels[summary.skill]?.fr || summary.skill;
  
  const handleShare = async () => {
    setIsSharing(true);
    try {
      const shareText = `J'ai terminé une session de pratique SLE avec ${summary.coachName}!\n\nNiveau: ${summary.level}\nCompétence: ${skillLabel}\nScore moyen: ${summary.averageScore}%\n\n#RusingAcademy #SLE #Bilinguisme`;
      
      if (navigator.share) {
        await navigator.share({
          title: "Ma session SLE - RusingÂcademy",
          text: shareText,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast.success("Résumé copié dans le presse-papiers!");
      }
    } catch (error) {
      console.error("Share error:", error);
    } finally {
      setIsSharing(false);
    }
  };
  
  const handleDownload = () => {
    const summaryText = `
RÉSUMÉ DE SESSION SLE - RusingÂcademy
======================================

Coach: ${summary.coachName}
Niveau: ${summary.level}
Compétence: ${skillLabel}
Date: ${summary.completedAt.toLocaleDateString("fr-CA")}
Durée: ${formatDuration(summary.duration)}

STATISTIQUES
------------
Messages échangés: ${summary.messageCount}
Score moyen: ${summary.averageScore}%
Performance: ${performance.label}

POINTS FORTS
------------
${summary.strengths.map(s => `• ${s}`).join("\n")}

POINTS À AMÉLIORER
------------------
${summary.areasToImprove.map(a => `• ${a}`).join("\n")}

RECOMMANDATIONS
---------------
${summary.recommendations.map(r => `• ${r}`).join("\n")}

======================================
Généré par RusingÂcademy Learning Ecosystem
    `.trim();
    
    const blob = new Blob([summaryText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `session-sle-${summary.sessionId}-${summary.completedAt.toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Résumé téléchargé!");
  };

  return (
    <Card className="w-full max-w-lg mx-auto bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 text-white shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <span className={performance.color}>{performance.icon}</span>
            Session terminée!
          </CardTitle>
          <Badge className={`${levelColors[summary.level]} text-white`}>
            Niveau {summary.level}
          </Badge>
        </div>
        <p className="text-slate-400 text-sm mt-1">
          {skillLabel} avec {summary.coachName}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Performance Score */}
        <div className="text-center py-4 bg-slate-800/50 rounded-lg">
          <div className={`text-5xl font-bold ${performance.color}`}>
            {summary.averageScore}%
          </div>
          <p className="text-slate-400 mt-1">{performance.label}</p>
          <Progress 
            value={summary.averageScore} 
            className="mt-3 h-2 bg-slate-700"
          />
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-slate-800/50 rounded-lg">
            <Clock className="w-5 h-5 mx-auto text-blue-400 mb-1" />
            <div className="text-lg font-semibold">{formatDuration(summary.duration)}</div>
            <div className="text-xs text-slate-400">Durée</div>
          </div>
          <div className="text-center p-3 bg-slate-800/50 rounded-lg">
            <MessageSquare className="w-5 h-5 mx-auto text-green-400 mb-1" />
            <div className="text-lg font-semibold">{summary.messageCount}</div>
            <div className="text-xs text-slate-400">Messages</div>
          </div>
          <div className="text-center p-3 bg-slate-800/50 rounded-lg">
            <TrendingUp className="w-5 h-5 mx-auto text-amber-400 mb-1" />
            <div className="text-lg font-semibold">{summary.averageScore}%</div>
            <div className="text-xs text-slate-400">Score</div>
          </div>
        </div>
        
        {/* Strengths */}
        {summary.strengths.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-green-400">
              <CheckCircle className="w-4 h-4" />
              Points forts
            </h4>
            <ul className="space-y-1">
              {summary.strengths.map((strength, i) => (
                <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Areas to Improve */}
        {summary.areasToImprove.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-amber-400">
              <AlertCircle className="w-4 h-4" />
              Points à améliorer
            </h4>
            <ul className="space-y-1">
              {summary.areasToImprove.map((area, i) => (
                <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                  <span className="text-amber-400 mt-1">•</span>
                  {area}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Recommendations */}
        {summary.recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-blue-400">
              <Lightbulb className="w-4 h-4" />
              Recommandations
            </h4>
            <ul className="space-y-1">
              {summary.recommendations.map((rec, i) => (
                <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 border-slate-600 hover:bg-slate-700"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 mr-2" />
            Télécharger
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 border-slate-600 hover:bg-slate-700"
            onClick={handleShare}
            disabled={isSharing}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Partager
          </Button>
        </div>
        
        {/* New Session Button */}
        <div className="flex gap-2">
          {onClose && (
            <Button 
              variant="ghost" 
              className="flex-1 text-slate-400 hover:text-white"
              onClick={onClose}
            >
              Fermer
            </Button>
          )}
          {onStartNewSession && (
            <Button 
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-semibold"
              onClick={onStartNewSession}
            >
              Nouvelle session
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Export type for use in other components
export type { SessionSummary, SessionSummaryCardProps };
