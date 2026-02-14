/**
 * CelebrationOverlay — RusingÂcademy Learning Portal
 * Animated celebrations: confetti, level-up fanfare, badge unlock, streak milestones
 * Uses canvas-confetti for particle effects + CSS animations for modals
 */
import { useEffect, useState, useCallback, useRef } from "react";
import confetti from "canvas-confetti";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { levelTitles } from "@/data/courseData";

/* ── Types ── */
interface CelebrationEvent {
  id: number;
  eventType: string;
  metadata: Record<string, unknown> | null;
  seen: boolean;
  createdAt: Date | string;
}

/* ── Confetti Presets ── */
function fireConfetti(type: "standard" | "gold" | "stars" | "fireworks" = "standard") {
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

  switch (type) {
    case "gold":
      confetti({ ...defaults, particleCount: 100, colors: ["#f5a623", "#ffd700", "#ffec8b", "#daa520"], origin: { x: 0.5, y: 0.4 } });
      setTimeout(() => confetti({ ...defaults, particleCount: 50, colors: ["#f5a623", "#ffd700"], origin: { x: 0.3, y: 0.5 } }), 200);
      setTimeout(() => confetti({ ...defaults, particleCount: 50, colors: ["#ffd700", "#ffec8b"], origin: { x: 0.7, y: 0.5 } }), 400);
      break;
    case "stars":
      confetti({ ...defaults, particleCount: 80, shapes: ["star"], colors: ["#008090", "#f5a623", "#8b5cf6", "#e74c3c"], origin: { x: 0.5, y: 0.3 } });
      break;
    case "fireworks":
      const end = Date.now() + 1500;
      const interval = setInterval(() => {
        if (Date.now() > end) return clearInterval(interval);
        confetti({
          particleCount: 30,
          startVelocity: 25,
          spread: 120,
          origin: { x: Math.random(), y: Math.random() * 0.4 },
          colors: ["#f5a623", "#008090", "#e74c3c", "#8b5cf6", "#10b981"],
          zIndex: 10000,
        });
      }, 150);
      break;
    default:
      confetti({ ...defaults, particleCount: 80, colors: ["#008090", "#f5a623", "#e74c3c", "#8b5cf6"], origin: { x: 0.5, y: 0.5 } });
  }
}

/* ── Celebration Modal ── */
function CelebrationModal({
  event,
  onDismiss,
}: {
  event: CelebrationEvent;
  onDismiss: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => setVisible(true));
    // Fire confetti based on event type
    const confettiType =
      event.eventType === "level_up" ? "gold" :
      event.eventType === "badge_earned" ? "stars" :
      event.eventType === "challenge_completed" ? "fireworks" :
      event.eventType === "perfect_quiz" ? "gold" :
      "standard";
    fireConfetti(confettiType);
    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => handleDismiss(), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 300);
  };

  const meta = event.metadata || {};
  const config = getCelebrationConfig(event.eventType, meta);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-300 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={handleDismiss}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Card */}
      <div
        className={`relative z-10 max-w-sm w-full mx-4 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ${
          visible ? "scale-100 translate-y-0" : "scale-90 translate-y-8"
        }`}
        style={{ background: "linear-gradient(135deg, #0c1929, #003040)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Effect */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full opacity-30"
          style={{ background: `radial-gradient(circle, ${config.color}, transparent)`, transform: "translate(-50%, -40%)" }}
        />

        <div className="relative p-8 text-center">
          {/* Icon */}
          <div
            className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4"
            style={{
              background: `${config.color}20`,
              boxShadow: `0 0 40px ${config.color}30`,
              animation: "celebrationPulse 1.5s ease-in-out infinite",
            }}
          >
            <span className="material-icons" style={{ color: config.color, fontSize: "40px" }}>
              {config.icon}
            </span>
          </div>

          {/* Title */}
          <h2
            className="text-xl font-bold text-white mb-2"
            style={{ fontFamily: "'Playfair Display', serif", animation: "celebrationSlideUp 0.5s ease-out 0.2s both" }}
          >
            {config.title}
          </h2>

          {/* Subtitle */}
          <p
            className="text-sm text-white/70 mb-4"
            style={{ animation: "celebrationSlideUp 0.5s ease-out 0.4s both" }}
          >
            {config.subtitle}
          </p>

          {/* XP Reward (if applicable) */}
          {config.xpReward && (
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
              style={{
                background: "rgba(245,166,35,0.15)",
                animation: "celebrationSlideUp 0.5s ease-out 0.6s both",
              }}
            >
              <span className="material-icons text-[#f5a623]" style={{ fontSize: "18px" }}>
                auto_awesome
              </span>
              <span className="text-[#f5a623] font-bold text-sm">+{config.xpReward} XP</span>
            </div>
          )}

          {/* Dismiss Button */}
          <button
            onClick={handleDismiss}
            className="mt-2 px-6 py-2 rounded-xl text-sm font-semibold text-[#0c1929] transition-all hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #f5a623, #ffd700)",
              animation: "celebrationSlideUp 0.5s ease-out 0.8s both",
            }}
          >
            Awesome!
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Config Helper ── */
function getCelebrationConfig(eventType: string, meta: Record<string, unknown>) {
  switch (eventType) {
    case "level_up":
      const newLevel = (meta.newLevel as number) || 2;
      const levelName = levelTitles[newLevel] || "Champion";
      return {
        icon: "trending_up",
        title: `Level Up! → Lv.${newLevel}`,
        subtitle: `You've reached ${levelName}! Keep up the amazing work.`,
        color: "#f5a623",
        xpReward: null,
      };
    case "badge_earned":
      return {
        icon: (meta.badgeIcon as string) || "emoji_events",
        title: `Badge Unlocked!`,
        subtitle: `You earned "${(meta.badgeName as string) || "Achievement"}"`,
        color: (meta.badgeColor as string) || "#8b5cf6",
        xpReward: null,
      };
    case "challenge_completed":
      return {
        icon: "flag",
        title: "Challenge Complete!",
        subtitle: (meta.title as string) || "You completed a weekly challenge!",
        color: "#10b981",
        xpReward: (meta.xpReward as number) || 200,
      };
    case "streak_milestone":
      const days = (meta.days as number) || 7;
      return {
        icon: "local_fire_department",
        title: `${days}-Day Streak!`,
        subtitle: `You've been learning for ${days} days straight. Incredible!`,
        color: "#e74c3c",
        xpReward: null,
      };
    case "path_completed":
      return {
        icon: "flag",
        title: "Path Complete!",
        subtitle: "You've finished an entire learning path. Outstanding!",
        color: "#27ae60",
        xpReward: 500,
      };
    case "perfect_quiz":
      return {
        icon: "emoji_events",
        title: "Perfect Score!",
        subtitle: "100% on your quiz! You're mastering this material.",
        color: "#f5a623",
        xpReward: 100,
      };
    case "first_lesson":
      return {
        icon: "school",
        title: "First Lesson Complete!",
        subtitle: "Your bilingual journey has officially begun. Welcome!",
        color: "#008090",
        xpReward: 50,
      };
    default:
      return {
        icon: "celebration",
        title: "Congratulations!",
        subtitle: "You've achieved something great!",
        color: "#008090",
        xpReward: null,
      };
  }
}

/* ── Main Overlay Component ── */
export default function CelebrationOverlay() {
  const { isAuthenticated } = useAuth();
  const [queue, setQueue] = useState<CelebrationEvent[]>([]);
  const [currentEvent, setCurrentEvent] = useState<CelebrationEvent | null>(null);
  const processingRef = useRef(false);

  const unseenQuery = trpc.celebrations.getUnseen.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 10000, // Poll every 10 seconds
    refetchOnWindowFocus: true,
  });

  const markSeenMutation = trpc.celebrations.markSeen.useMutation();
  const utils = trpc.useUtils();

  // Queue new celebrations
  useEffect(() => {
    if (!unseenQuery.data || unseenQuery.data.length === 0) return;
    const newEvents = unseenQuery.data.filter(
      (e) => !queue.some((q) => q.id === e.id) && (!currentEvent || currentEvent.id !== e.id)
    );
    if (newEvents.length > 0) {
      setQueue((prev) => [...prev, ...newEvents]);
    }
  }, [unseenQuery.data]);

  // Process queue
  useEffect(() => {
    if (currentEvent || queue.length === 0 || processingRef.current) return;
    processingRef.current = true;
    const next = queue[0];
    setCurrentEvent(next);
    setQueue((prev) => prev.slice(1));
    processingRef.current = false;
  }, [queue, currentEvent]);

  const handleDismiss = useCallback(() => {
    if (currentEvent) {
      markSeenMutation.mutate(
        { celebrationId: currentEvent.id },
        { onSuccess: () => utils.celebrations.getUnseen.invalidate() }
      );
    }
    setCurrentEvent(null);
  }, [currentEvent, markSeenMutation, utils]);

  if (!currentEvent) return null;

  return <CelebrationModal event={currentEvent} onDismiss={handleDismiss} />;
}

/* ── Inline fire function for manual triggers ── */
export { fireConfetti };
