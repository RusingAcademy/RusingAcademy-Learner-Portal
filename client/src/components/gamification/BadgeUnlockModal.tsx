import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AnimatedBadge } from "./AnimatedBadge";
import { Sparkles, Share2, X } from "lucide-react";

interface BadgeUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  badge: {
    code: string;
    name: string;
    nameFr?: string;
    description?: string;
    descriptionFr?: string;
    points: number;
    rarity?: "common" | "uncommon" | "rare" | "epic" | "legendary";
  } | null;
  language?: "en" | "fr";
  onShare?: () => void;
}

// Confetti rain effect
const ConfettiRain = () => {
  const colors = [
    "bg-yellow-400",
    "bg-pink-400",
    "bg-blue-400",
    "bg-green-400",
    "bg-purple-400",
    "bg-orange-400",
    "bg-red-400",
    "bg-cyan-400",
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-2 h-2 ${colors[i % colors.length]} rounded-sm`}
          style={{
            left: `${Math.random() * 100}%`,
            top: -20,
          }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{
            y: 500,
            rotate: Math.random() * 720 - 360,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 0.5,
            ease: "easeIn",
          }}
        />
      ))}
    </div>
  );
};

// Glowing background effect
const GlowingBackground = ({ rarity }: { rarity: string }) => {
  const glowColors: Record<string, string> = {
    common: "from-slate-500/20",
    uncommon: "from-emerald-500/30",
    rare: "from-blue-500/30",
    epic: "from-purple-500/40",
    legendary: "from-amber-500/50",
  };

  return (
    <motion.div
      className={`absolute inset-0 bg-gradient-radial ${glowColors[rarity] || glowColors.common} to-transparent`}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.5, 0.8, 0.5],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
};

export function BadgeUnlockModal({
  isOpen,
  onClose,
  badge,
  language = "en",
  onShare,
}: BadgeUnlockModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen && badge) {
      setShowConfetti(true);
      // Play sound effect if enabled
      // playUnlockSound();
    }
  }, [isOpen, badge]);

  if (!badge) return null;

  const displayName = language === "fr" && badge.nameFr ? badge.nameFr : badge.name;
  const displayDesc = language === "fr" && badge.descriptionFr ? badge.descriptionFr : badge.description;

  const labels = {
    en: {
      title: "Badge Unlocked!",
      subtitle: "Congratulations! You've earned a new badge",
      points: "XP Earned",
      share: "Share Achievement",
      continue: "Continue",
      rarity: {
        common: "Common",
        uncommon: "Uncommon",
        rare: "Rare",
        epic: "Epic",
        legendary: "Legendary",
      },
    },
    fr: {
      title: "Badge Débloqué!",
      subtitle: "Félicitations! Vous avez gagné un nouveau badge",
      points: "XP Gagnés",
      share: "Partager",
      continue: "Continuer",
      rarity: {
        common: "Commun",
        uncommon: "Peu commun",
        rare: "Rare",
        epic: "Épique",
        legendary: "Légendaire",
      },
    },
  };

  const l = labels[language];
  const rarityLabel = l.rarity[badge.rarity || "common"];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 border-slate-700">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
        >
          <X className="h-4 w-4 text-slate-400" />
        </button>

        {/* Confetti effect */}
        <AnimatePresence>
          {showConfetti && <ConfettiRain />}
        </AnimatePresence>

        {/* Glowing background */}
        <GlowingBackground rarity={badge.rarity || "common"} />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center p-8 pt-12">
          {/* Title with sparkles */}
          <motion.div
            className="flex items-center gap-2 mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="h-5 w-5 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">{l.title}</h2>
            <Sparkles className="h-5 w-5 text-yellow-400" />
          </motion.div>

          <motion.p
            className="text-slate-400 text-sm mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {l.subtitle}
          </motion.p>

          {/* Badge display */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.4,
            }}
          >
            <AnimatedBadge
              code={badge.code}
              name={displayName}
              description={displayDesc}
              points={badge.points}
              rarity={badge.rarity}
              isUnlocked={true}
              isNew={true}
              size="lg"
              showAnimation={true}
            />
          </motion.div>

          {/* Rarity badge */}
          <motion.div
            className="mt-4 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <span className="text-xs font-medium text-slate-300">{rarityLabel}</span>
          </motion.div>

          {/* Badge name and description */}
          <motion.div
            className="text-center mt-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h3 className="text-xl font-bold text-white mb-2">{displayName}</h3>
            {displayDesc && (
              <p className="text-slate-400 text-sm max-w-xs">{displayDesc}</p>
            )}
          </motion.div>

          {/* XP earned */}
          <motion.div
            className="mt-6 flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
          >
            <span className="text-amber-400 font-medium">{l.points}:</span>
            <span className="text-2xl font-bold text-amber-300">+{badge.points} XP</span>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            className="flex gap-3 mt-8 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            {onShare && (
              <Button
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
                onClick={onShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                {l.share}
              </Button>
            )}
            <Button
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              onClick={onClose}
            >
              {l.continue}
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default BadgeUnlockModal;
