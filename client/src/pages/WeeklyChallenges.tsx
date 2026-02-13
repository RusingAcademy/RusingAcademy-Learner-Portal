/**
 * Weekly Challenges — RusingÂcademy Learning Portal
 * Gamified challenge cards with progress bars, rewards, and countdown timers
 */
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useMemo } from "react";

const CHALLENGE_ICONS: Record<string, string> = {
  complete_lessons: "school",
  earn_xp: "auto_awesome",
  perfect_quizzes: "emoji_events",
  maintain_streak: "local_fire_department",
  complete_slots: "check_circle",
  study_time: "timer",
};

const CHALLENGE_COLORS: Record<string, string> = {
  complete_lessons: "#008090",
  earn_xp: "#f5a623",
  perfect_quizzes: "#8b5cf6",
  maintain_streak: "#e74c3c",
  complete_slots: "#10b981",
  study_time: "#3b82f6",
};

function getDaysRemaining(endDate: string): number {
  const end = new Date(endDate + "T23:59:59");
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function ChallengeCard({
  challenge,
}: {
  challenge: {
    id: number;
    title: string;
    titleFr: string;
    description: string;
    descriptionFr: string;
    challengeType: string;
    targetValue: number;
    xpReward: number;
    weekEndDate: string;
    currentValue: number;
    isCompleted: boolean;
  };
}) {
  const icon = CHALLENGE_ICONS[challenge.challengeType] || "flag";
  const color = CHALLENGE_COLORS[challenge.challengeType] || "#008090";
  const progress = Math.min(100, (challenge.currentValue / challenge.targetValue) * 100);
  const daysLeft = getDaysRemaining(challenge.weekEndDate);

  return (
    <div
      className={`ra-glass rounded-xl p-5 transition-all duration-300 hover:shadow-lg ${
        challenge.isCompleted ? "ring-2" : ""
      }`}
      style={{
        borderLeft: `4px solid ${color}`,
        ...(challenge.isCompleted ? { ringColor: `${color}40` } : {}),
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${color}15` }}
          >
            <span className="material-icons" style={{ color, fontSize: "22px" }}>
              {challenge.isCompleted ? "check_circle" : icon}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0c1929]">{challenge.title}</h3>
            <p className="text-[11px] text-gray-400 italic">{challenge.titleFr}</p>
          </div>
        </div>
        {/* Reward Badge */}
        <div
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold"
          style={{ background: `${color}15`, color }}
        >
          <span className="material-icons" style={{ fontSize: "12px" }}>
            auto_awesome
          </span>
          +{challenge.xpReward} XP
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-3 leading-relaxed">{challenge.description}</p>

      {/* Progress Bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-[10px] mb-1">
          <span className="text-gray-400">
            {challenge.currentValue} / {challenge.targetValue}
          </span>
          <span className="font-bold" style={{ color: challenge.isCompleted ? "#10b981" : color }}>
            {challenge.isCompleted ? "Completed!" : `${Math.round(progress)}%`}
          </span>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden bg-gray-100">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${progress}%`,
              background: challenge.isCompleted
                ? "linear-gradient(90deg, #10b981, #34d399)"
                : `linear-gradient(90deg, ${color}, ${color}cc)`,
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3">
        {challenge.isCompleted ? (
          <div className="flex items-center gap-1 text-[10px] text-[#10b981] font-semibold">
            <span className="material-icons" style={{ fontSize: "14px" }}>
              verified
            </span>
            Challenge Complete
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[10px] text-gray-400">
            <span className="material-icons" style={{ fontSize: "14px" }}>
              schedule
            </span>
            {daysLeft} day{daysLeft !== 1 ? "s" : ""} remaining
          </div>
        )}
      </div>
    </div>
  );
}

export default function WeeklyChallenges() {
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState<"active" | "completed">("active");
  const challengesQuery = trpc.challenges.getActive.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const activeChallenges = useMemo(() => {
    if (!challengesQuery.data) return [];
    return challengesQuery.data.filter((c) => !c.isCompleted);
  }, [challengesQuery.data]);

  const completedChallenges = useMemo(() => {
    if (!challengesQuery.data) return [];
    return challengesQuery.data.filter((c) => c.isCompleted);
  }, [challengesQuery.data]);

  const totalXpEarned = completedChallenges.reduce((sum, c) => sum + c.xpReward, 0);
  const displayChallenges = tab === "active" ? activeChallenges : completedChallenges;

  return (
    <DashboardLayout>
      <div className="max-w-[900px] space-y-5">
        {/* Header */}
        <div
          className="relative rounded-2xl overflow-hidden p-6 md:p-8"
          style={{
            background: "linear-gradient(135deg, #0c1929 0%, #1a0a2e 50%, #2d1b4e 100%)",
          }}
        >
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
            style={{
              background: "radial-gradient(circle, #8b5cf6, transparent)",
              transform: "translate(30%, -30%)",
            }}
          />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-icons text-[#f5a623]" style={{ fontSize: "28px" }}>
                flag
              </span>
              <h1
                className="text-2xl md:text-3xl font-bold text-white"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Weekly Challenges
              </h1>
            </div>
            <p className="text-white/60 text-sm">
              Complete challenges to earn bonus XP and exclusive badges. New challenges every week!
            </p>

            {/* Stats Row */}
            <div className="flex items-center gap-6 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#f5a623]">{activeChallenges.length}</div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider">Active</div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <div className="text-2xl font-bold text-[#10b981]">{completedChallenges.length}</div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider">Completed</div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{totalXpEarned.toLocaleString()}</div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider">XP Earned</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2">
          <button
            onClick={() => setTab("active")}
            className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
              tab === "active"
                ? "text-white shadow-md"
                : "text-gray-500 hover:text-[#008090] bg-white/50"
            }`}
            style={
              tab === "active"
                ? { background: "linear-gradient(135deg, #008090, #00a0b0)" }
                : {}
            }
          >
            <span className="material-icons align-middle mr-1" style={{ fontSize: "14px" }}>
              flag
            </span>
            Active ({activeChallenges.length})
          </button>
          <button
            onClick={() => setTab("completed")}
            className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
              tab === "completed"
                ? "text-white shadow-md"
                : "text-gray-500 hover:text-[#10b981] bg-white/50"
            }`}
            style={
              tab === "completed"
                ? { background: "linear-gradient(135deg, #10b981, #34d399)" }
                : {}
            }
          >
            <span className="material-icons align-middle mr-1" style={{ fontSize: "14px" }}>
              check_circle
            </span>
            Completed ({completedChallenges.length})
          </button>
        </div>

        {/* Challenge Cards */}
        {challengesQuery.isLoading ? (
          <div className="ra-glass rounded-xl p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-[#008090] border-t-transparent rounded-full mx-auto" />
            <p className="text-sm text-gray-400 mt-3">Loading challenges...</p>
          </div>
        ) : displayChallenges.length === 0 ? (
          <div className="ra-glass rounded-xl p-8 text-center">
            <span className="material-icons text-gray-300" style={{ fontSize: "48px" }}>
              {tab === "active" ? "flag" : "emoji_events"}
            </span>
            <p className="text-sm text-gray-400 mt-3">
              {tab === "active"
                ? "No active challenges right now. Check back soon!"
                : "No completed challenges yet. Start working on active challenges!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayChallenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        )}

        {/* How It Works */}
        <div className="ra-glass rounded-xl p-5">
          <h2 className="text-sm font-bold text-[#0c1929] mb-3 flex items-center gap-2">
            <span className="material-icons text-[#008090]" style={{ fontSize: "18px" }}>
              help_outline
            </span>
            How Weekly Challenges Work
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: "flag",
                title: "New Challenges Weekly",
                desc: "Fresh challenges appear every Monday. Complete them before the week ends!",
              },
              {
                icon: "auto_awesome",
                title: "Earn Bonus XP",
                desc: "Each challenge rewards bonus XP on top of your regular learning XP.",
              },
              {
                icon: "emoji_events",
                title: "Unlock Badges",
                desc: "Some challenges unlock exclusive badges that showcase your dedication.",
              },
            ].map((item) => (
              <div key={item.title} className="text-center p-3">
                <span className="material-icons text-[#008090]" style={{ fontSize: "28px" }}>
                  {item.icon}
                </span>
                <h3 className="text-xs font-bold text-[#0c1929] mt-2">{item.title}</h3>
                <p className="text-[11px] text-gray-400 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
