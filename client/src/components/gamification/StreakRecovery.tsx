import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Flame,
  Snowflake,
  Shield,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Gift,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakRecoveryProps {
  currentStreak: number;
  longestStreak: number;
  streakFreezes: number;
  maxFreezes: number;
  lastActivityDate?: Date;
  isStreakAtRisk?: boolean;
  language?: "en" | "fr";
  onUseFreeze?: () => void;
  onPurchaseFreeze?: () => void;
  className?: string;
}

export function StreakRecovery({
  currentStreak,
  longestStreak,
  streakFreezes,
  maxFreezes,
  lastActivityDate,
  isStreakAtRisk = false,
  language = "en",
  onUseFreeze,
  className,
}: StreakRecoveryProps) {
  const [showFreezeDialog, setShowFreezeDialog] = useState(false);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [freezeUsed, setFreezeUsed] = useState(false);

  const labels = {
    en: {
      title: "Streak Protection",
      subtitle: "Keep your learning momentum going",
      currentStreak: "Current Streak",
      longestStreak: "Longest Streak",
      days: "days",
      streakFreezes: "Streak Freezes",
      available: "available",
      useFreeze: "Use Freeze",
      buyFreeze: "Get More Freezes",
      atRisk: "Streak at Risk!",
      atRiskDesc: "Complete a lesson today to maintain your streak",
      freezeActive: "Freeze Active",
      freezeActiveDesc: "Your streak is protected for today",
      howItWorks: "How It Works",
      freezeExplain: "A streak freeze protects your streak for one day if you miss your daily practice. Use them wisely!",
      confirmUse: "Use Streak Freeze?",
      confirmUseDesc: "This will protect your streak for today. You have {count} freeze(s) remaining.",
      confirm: "Confirm",
      cancel: "Cancel",
      purchaseTitle: "Get More Freezes",
      purchaseDesc: "Earn streak freezes by completing weekly challenges or reaching milestones.",
      earnMethods: "Ways to Earn",
      weeklyChallenge: "Complete Weekly Challenge",
      milestone: "Reach 30-day streak",
      purchase: "Purchase with XP",
      xpCost: "500 XP",
      close: "Close",
      lastActive: "Last active",
      today: "today",
      yesterday: "yesterday",
      daysAgo: "days ago",
    },
    fr: {
      title: "Protection de Série",
      subtitle: "Maintenez votre élan d'apprentissage",
      currentStreak: "Série Actuelle",
      longestStreak: "Plus Longue Série",
      days: "jours",
      streakFreezes: "Gels de Série",
      available: "disponibles",
      useFreeze: "Utiliser un Gel",
      buyFreeze: "Obtenir Plus de Gels",
      atRisk: "Série en Danger !",
      atRiskDesc: "Complétez une leçon aujourd'hui pour maintenir votre série",
      freezeActive: "Gel Actif",
      freezeActiveDesc: "Votre série est protégée pour aujourd'hui",
      howItWorks: "Comment ça marche",
      freezeExplain: "Un gel de série protège votre série pendant un jour si vous manquez votre pratique quotidienne. Utilisez-les judicieusement !",
      confirmUse: "Utiliser un Gel de Série ?",
      confirmUseDesc: "Ceci protégera votre série pour aujourd'hui. Il vous reste {count} gel(s).",
      confirm: "Confirmer",
      cancel: "Annuler",
      purchaseTitle: "Obtenir Plus de Gels",
      purchaseDesc: "Gagnez des gels de série en complétant des défis hebdomadaires ou en atteignant des jalons.",
      earnMethods: "Façons de Gagner",
      weeklyChallenge: "Compléter un Défi Hebdomadaire",
      milestone: "Atteindre 30 jours de série",
      purchase: "Acheter avec des XP",
      xpCost: "500 XP",
      close: "Fermer",
      lastActive: "Dernière activité",
      today: "aujourd'hui",
      yesterday: "hier",
      daysAgo: "jours",
    },
  };

  const l = labels[language];

  const getDaysSinceActivity = () => {
    if (!lastActivityDate) return 0;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastActivityDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysSinceActivity = getDaysSinceActivity();
  const lastActiveText = daysSinceActivity === 0 
    ? l.today 
    : daysSinceActivity === 1 
      ? l.yesterday 
      : `${daysSinceActivity} ${l.daysAgo}`;

  const handleUseFreeze = () => {
    setFreezeUsed(true);
    setShowFreezeDialog(false);
    onUseFreeze?.();
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              {l.title}
            </CardTitle>
            <CardDescription className="text-xs mt-1">{l.subtitle}</CardDescription>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              "gap-1",
              streakFreezes > 0 
                ? "border-blue-300 text-blue-600 bg-blue-50 dark:bg-blue-950/30" 
                : "border-slate-300 text-slate-500"
            )}
          >
            <Snowflake className="h-3 w-3" />
            {streakFreezes}/{maxFreezes}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <AnimatePresence>
          {isStreakAtRisk && !freezeUsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-amber-700 dark:text-amber-300 text-sm">{l.atRisk}</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">{l.atRiskDesc}</p>
                </div>
              </div>
            </motion.div>
          )}

          {freezeUsed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800"
            >
              <div className="flex items-start gap-3">
                <motion.div 
                  className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Snowflake className="h-4 w-4 text-white" />
                </motion.div>
                <div className="flex-1">
                  <p className="font-semibold text-blue-700 dark:text-blue-300 text-sm">{l.freezeActive}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">{l.freezeActiveDesc}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Streak stats - responsive grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="p-3 rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border border-orange-200/50 dark:border-orange-800/50">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-xs text-slate-600 dark:text-slate-400">{l.currentStreak}</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">
              {currentStreak}
              <span className="text-sm font-normal text-slate-500 ml-1">{l.days}</span>
            </p>
          </div>

          <div className="p-3 rounded-lg bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border border-purple-200/50 dark:border-purple-800/50">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span className="text-xs text-slate-600 dark:text-slate-400">{l.longestStreak}</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {longestStreak}
              <span className="text-sm font-normal text-slate-500 ml-1">{l.days}</span>
            </p>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{l.streakFreezes}</span>
            <span className="text-xs text-slate-500">{streakFreezes} {l.available}</span>
          </div>
          
          <div className="flex gap-1 mb-3">
            {Array.from({ length: maxFreezes }).map((_, i) => (
              <motion.div
                key={i}
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                  i < streakFreezes
                    ? "bg-blue-500 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-400"
                )}
                initial={false}
                animate={i < streakFreezes ? { scale: [1, 1.1, 1] } : {}}
                transition={{ delay: i * 0.1 }}
              >
                <Snowflake className="h-4 w-4" />
              </motion.div>
            ))}
          </div>

          <div className="flex gap-2">
            <Dialog open={showFreezeDialog} onOpenChange={setShowFreezeDialog}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline"
                  disabled={streakFreezes === 0 || freezeUsed}
                  className="flex-1"
                >
                  <Snowflake className="h-4 w-4 mr-1" />
                  {l.useFreeze}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Snowflake className="h-5 w-5 text-blue-500" />
                    {l.confirmUse}
                  </DialogTitle>
                  <DialogDescription>
                    {l.confirmUseDesc.replace("{count}", streakFreezes.toString())}
                  </DialogDescription>
                </DialogHeader>
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>{l.howItWorks}:</strong> {l.freezeExplain}
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowFreezeDialog(false)}>{l.cancel}</Button>
                  <Button onClick={handleUseFreeze} className="bg-blue-500 hover:bg-blue-600">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    {l.confirm}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost" className="flex-1">
                  <Gift className="h-4 w-4 mr-1" />
                  {l.buyFreeze}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-amber-500" />
                    {l.purchaseTitle}
                  </DialogTitle>
                  <DialogDescription>{l.purchaseDesc}</DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{l.earnMethods}:</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      <span className="text-sm">{l.weeklyChallenge}</span>
                      <Badge className="ml-auto bg-emerald-500">+1</Badge>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                      <Flame className="h-5 w-5 text-purple-500" />
                      <span className="text-sm">{l.milestone}</span>
                      <Badge className="ml-auto bg-purple-500">+2</Badge>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                      <Zap className="h-5 w-5 text-amber-500" />
                      <span className="text-sm">{l.purchase}</span>
                      <Badge variant="outline" className="ml-auto border-amber-300 text-amber-600">{l.xpCost}</Badge>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowPurchaseDialog(false)}>{l.close}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {lastActivityDate && (
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {l.lastActive}
            </span>
            <span className="font-medium">{lastActiveText}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default StreakRecovery;
