import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Award,
  CheckCircle2,
  Star,
  Users,
  Clock,
  Zap,
  Shield,
  Crown,
  Sparkles,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CoachBadge {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedAt?: Date;
}

interface CoachBadgesProps {
  badges?: CoachBadge[];
  isElsVerified?: boolean;
  totalSessions?: number;
  averageRating?: number;
  variant?: "compact" | "full";
  className?: string;
}

const badgeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  verified: Shield,
  top_rated: Star,
  experienced: Users,
  fast_responder: Zap,
  veteran: Crown,
  rising_star: Sparkles,
  certified: GraduationCap,
  default: Award,
};

const badgeColors: Record<string, string> = {
  gold: "bg-amber-100 text-amber-900 border-amber-400 dark:bg-amber-900/50 dark:text-amber-100 dark:border-amber-500/60 font-medium",
  silver: "bg-slate-100 text-slate-800 border-slate-400 dark:bg-slate-800/50 dark:text-slate-100 dark:border-slate-400/60 font-medium",
  bronze: "bg-orange-100 text-orange-900 border-orange-400 dark:bg-orange-900/50 dark:text-orange-100 dark:border-orange-500/60 font-medium",
  blue: "bg-blue-100 text-blue-900 border-blue-400 dark:bg-blue-900/50 dark:text-blue-100 dark:border-blue-500/60 font-medium",
  green: "bg-emerald-100 text-emerald-900 border-emerald-400 dark:bg-emerald-900/50 dark:text-emerald-100 dark:border-emerald-500/60 font-medium",
  purple: "bg-teal-100 text-teal-900 border-teal-400 dark:bg-teal-900/50 dark:text-teal-100 dark:border-teal-500/60 font-medium",
};

export function CoachBadges({
  badges = [],
  isElsVerified = false,
  totalSessions = 0,
  averageRating = 0,
  variant = "compact",
  className,
}: CoachBadgesProps) {
  const { language } = useLanguage();
  const isEn = language === "en";
  
  // Generate automatic badges based on stats
  const autoBadges: CoachBadge[] = [];
  
  // ELS Verified badge
  if (isElsVerified) {
    autoBadges.push({
      id: "els_verified",
      type: "verified",
      name: isEn ? "ELS Verified" : "ELS Vérifié",
      description: isEn 
        ? "Verified by the ELS certification program" 
        : "Vérifié par le programme de certification ELS",
      icon: "verified",
      color: "blue",
    });
  }
  
  // Top Rated badge (4.8+ rating with 10+ reviews)
  if (averageRating >= 4.8 && totalSessions >= 10) {
    autoBadges.push({
      id: "top_rated",
      type: "top_rated",
      name: isEn ? "Top Rated" : "Mieux noté",
      description: isEn 
        ? "Consistently receives excellent reviews" 
        : "Reçoit constamment d'excellentes évaluations",
      icon: "top_rated",
      color: "gold",
    });
  }
  
  // Experienced badge (50+ sessions)
  if (totalSessions >= 50) {
    autoBadges.push({
      id: "experienced",
      type: "experienced",
      name: isEn ? "Experienced" : "Expérimenté",
      description: isEn 
        ? "Has completed 50+ coaching sessions" 
        : "A complété plus de 50 séances de coaching",
      icon: "experienced",
      color: "purple",
    });
  }
  
  // Veteran badge (100+ sessions)
  if (totalSessions >= 100) {
    autoBadges.push({
      id: "veteran",
      type: "veteran",
      name: isEn ? "Veteran Coach" : "Coach Vétéran",
      description: isEn 
        ? "Has completed 100+ coaching sessions" 
        : "A complété plus de 100 séances de coaching",
      icon: "veteran",
      color: "gold",
    });
  }
  
  // Rising Star badge (new coach with good rating)
  if (totalSessions >= 5 && totalSessions < 20 && averageRating >= 4.5) {
    autoBadges.push({
      id: "rising_star",
      type: "rising_star",
      name: isEn ? "Rising Star" : "Étoile montante",
      description: isEn 
        ? "New coach with excellent early reviews" 
        : "Nouveau coach avec d'excellentes premières évaluations",
      icon: "rising_star",
      color: "green",
    });
  }
  
  // Combine auto badges with custom badges
  const allBadges = [...autoBadges, ...badges];
  
  if (allBadges.length === 0) {
    return null;
  }
  
  if (variant === "compact") {
    return (
      <div className={cn("flex flex-wrap gap-1", className)}>
        {allBadges.slice(0, 3).map((badge) => {
          const Icon = badgeIcons[badge.icon] || badgeIcons.default;
          const colorClass = badgeColors[badge.color] || badgeColors.blue;
          
          return (
            <Tooltip key={badge.id}>
              <TooltipTrigger asChild>
                <Badge 
                  variant="outline" 
                  className={cn("text-xs gap-1 cursor-help", colorClass)}
                >
                  <Icon className="h-3 w-3" />
                  {badge.name}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{badge.description}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
        {allBadges.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{allBadges.length - 3}
          </Badge>
        )}
      </div>
    );
  }
  
  // Full variant - shows all badges with more detail
  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="font-medium text-sm flex items-center gap-2">
        <Award className="h-4 w-4" />
        {isEn ? "Badges & Achievements" : "Badges et réalisations"}
      </h4>
      <div className="flex flex-wrap gap-2">
        {allBadges.map((badge) => {
          const Icon = badgeIcons[badge.icon] || badgeIcons.default;
          const colorClass = badgeColors[badge.color] || badgeColors.blue;
          
          return (
            <Tooltip key={badge.id}>
              <TooltipTrigger asChild>
                <div 
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg border cursor-help transition-all hover:scale-105",
                    colorClass
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <div>
                    <p className="font-medium text-sm">{badge.name}</p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="max-w-xs">{badge.description}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
