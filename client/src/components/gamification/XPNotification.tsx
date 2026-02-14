import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, TrendingUp, Star } from "lucide-react";

interface XPNotificationProps {
  amount: number;
  reason?: string;
  isVisible: boolean;
  onComplete?: () => void;
  position?: "top-right" | "top-center" | "bottom-right";
}

// Floating XP text animation
const FloatingXP = ({ amount }: { amount: number }) => (
  <motion.div
    className="absolute -top-8 left-1/2 -translate-x-1/2 pointer-events-none"
    initial={{ opacity: 1, y: 0, scale: 1 }}
    animate={{ opacity: 0, y: -40, scale: 1.5 }}
    transition={{ duration: 1.5, ease: "easeOut" }}
  >
    <span className="text-2xl font-bold text-amber-400 drop-shadow-lg">
      +{amount} XP
    </span>
  </motion.div>
);

// Sparkle burst effect
const SparkleBurst = () => (
  <div className="absolute inset-0 pointer-events-none">
    {[...Array(12)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute top-1/2 left-1/2 w-1 h-1 bg-yellow-300 rounded-full"
        initial={{ scale: 0, x: 0, y: 0 }}
        animate={{
          scale: [0, 1, 0],
          x: Math.cos((i * Math.PI) / 6) * 30,
          y: Math.sin((i * Math.PI) / 6) * 30,
        }}
        transition={{
          duration: 0.6,
          delay: i * 0.02,
        }}
      />
    ))}
  </div>
);

export function XPNotification({
  amount,
  reason,
  isVisible,
  onComplete,
  position = "top-right",
}: XPNotificationProps) {
  const [showFloating, setShowFloating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowFloating(true);
      const timer = setTimeout(() => {
        setShowFloating(false);
        onComplete?.();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-center": "top-4 left-1/2 -translate-x-1/2",
    "bottom-right": "bottom-4 right-4",
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed ${positionClasses[position]} z-50`}
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="relative">
            {/* Floating XP text */}
            {showFloating && <FloatingXP amount={amount} />}

            {/* Main notification card */}
            <motion.div
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500/90 to-orange-500/90 backdrop-blur-sm shadow-lg shadow-amber-500/30 border border-amber-400/30"
              animate={{
                boxShadow: [
                  "0 0 20px rgba(245, 158, 11, 0.3)",
                  "0 0 40px rgba(245, 158, 11, 0.5)",
                  "0 0 20px rgba(245, 158, 11, 0.3)",
                ],
              }}
              transition={{ duration: 1, repeat: 2 }}
            >
              {/* Sparkle burst */}
              <SparkleBurst />

              {/* Icon */}
              <motion.div
                className="relative w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Zap className="h-5 w-5 text-white" />
              </motion.div>

              {/* Content */}
              <div className="flex flex-col">
                <motion.span
                  className="text-lg font-bold text-white"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  +{amount} XP
                </motion.span>
                {reason && (
                  <motion.span
                    className="text-xs text-white/80"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {reason}
                  </motion.span>
                )}
              </div>

              {/* Trending icon */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                <TrendingUp className="h-5 w-5 text-white/80" />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Level up celebration modal
interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
  language?: "en" | "fr";
}

export function LevelUpCelebration({
  isOpen,
  onClose,
  newLevel,
  language = "en",
}: LevelUpModalProps) {
  const labels = {
    en: {
      title: "Level Up!",
      subtitle: "You've reached a new level",
      level: "Level",
      continue: "Continue",
      rewards: "New rewards unlocked!",
    },
    fr: {
      title: "Niveau Supérieur!",
      subtitle: "Vous avez atteint un nouveau niveau",
      level: "Niveau",
      continue: "Continuer",
      rewards: "Nouvelles récompenses débloquées!",
    },
  };

  const l = labels[language];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Confetti background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(100)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-3 h-3 rounded-sm ${
                  ["bg-yellow-400", "bg-pink-400", "bg-blue-400", "bg-green-400", "bg-purple-400"][i % 5]
                }`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: -20,
                }}
                initial={{ y: -20, rotate: 0 }}
                animate={{
                  y: window.innerHeight + 50,
                  rotate: Math.random() * 720,
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  delay: Math.random() * 1,
                  ease: "linear",
                }}
              />
            ))}
          </div>

          {/* Modal content */}
          <motion.div
            className="relative bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl p-8 max-w-sm w-full mx-4 border border-slate-700 shadow-2xl"
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.5, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Stars decoration */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex gap-2">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2 + i * 0.1, type: "spring" }}
                >
                  <Star
                    className={`h-8 w-8 ${i === 1 ? "text-yellow-400 fill-yellow-400" : "text-yellow-500/50 fill-yellow-500/50"}`}
                  />
                </motion.div>
              ))}
            </div>

            {/* Title */}
            <motion.h2
              className="text-3xl font-bold text-center text-white mt-4 mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {l.title}
            </motion.h2>

            <motion.p
              className="text-slate-400 text-center mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {l.subtitle}
            </motion.p>

            {/* Level display */}
            <motion.div
              className="flex justify-center mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            >
              <div className="relative">
                <motion.div
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/50"
                  animate={{
                    boxShadow: [
                      "0 0 30px rgba(245, 158, 11, 0.5)",
                      "0 0 60px rgba(245, 158, 11, 0.8)",
                      "0 0 30px rgba(245, 158, 11, 0.5)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="text-4xl font-black text-white">{newLevel}</span>
                </motion.div>
                <motion.div
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-800 rounded-full border border-slate-600"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <span className="text-xs font-medium text-slate-300">{l.level}</span>
                </motion.div>
              </div>
            </motion.div>

            {/* Rewards text */}
            <motion.p
              className="text-center text-emerald-400 text-sm mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              ✨ {l.rewards}
            </motion.p>

            {/* Continue button */}
            <motion.button
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:from-amber-600 hover:to-orange-600 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              onClick={onClose}
            >
              {l.continue}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default XPNotification;
