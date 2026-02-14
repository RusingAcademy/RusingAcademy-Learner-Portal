/**
 * Weekly Challenges — RusingÂcademy Learning Portal
 * Design: Clean white light theme, accessible, LRDG-inspired
 */
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useMemo } from "react";

const CHALLENGE_ICONS: Record<string, string> = {
  complete_lessons: "school", earn_xp: "auto_awesome", perfect_quizzes: "emoji_events",
  maintain_streak: "local_fire_department", complete_slots: "check_circle", study_time: "timer",
};

const CHALLENGE_COLORS: Record<string, string> = {
  complete_lessons: "#008090", earn_xp: "#f5a623", perfect_quizzes: "#8b5cf6",
  maintain_streak: "#e74c3c", complete_slots: "#10b981", study_time: "#3b82f6",
};

function getDaysRemaining(endDate: string): number {
  const end = new Date(endDate + "T23:59:59");
  const now = new Date();
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

function ChallengeCard({ challenge }: { challenge: {
  id: number; title: string; titleFr: string; description: string; descriptionFr: string;
  challengeType: string; targetValue: number; xpReward: number; weekEndDate: string;
  currentValue: number; isCompleted: boolean;
}}) {
  const icon = CHALLENGE_ICONS[challenge.challengeType] || "flag";
  const color = CHALLENGE_COLORS[challenge.challengeType] || "#008090";
  const progress = Math.min(100, (challenge.currentValue / challenge.targetValue) * 100);
  const daysLeft = getDaysRemaining(challenge.weekEndDate);

  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-5 transition-all duration-300 hover:shadow-md ${challenge.isCompleted ? "ring-1 ring-[#10b981]/30" : ""}`}
      style={{ borderLeft: `4px solid ${color}` }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}10` }}>
            <span className="material-icons" style={{ color, fontSize: "22px" }}>{challenge.isCompleted ? "check_circle" : icon}</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">{challenge.title}</h3>
            <p className="text-[11px] text-gray-400 italic">{challenge.titleFr}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold" style={{ background: `${color}10`, color }}>
          <span className="material-icons" style={{ fontSize: "12px" }}>auto_awesome</span>
          +{challenge.xpReward} XP
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-3 leading-relaxed">{challenge.description}</p>

      <div className="mb-2">
        <div className="flex items-center justify-between text-[10px] mb-1">
          <span className="text-gray-400">{challenge.currentValue} / {challenge.targetValue}</span>
          <span className="font-bold" style={{ color: challenge.isCompleted ? "#10b981" : color }}>
            {challenge.isCompleted ? "Completed!" : `${Math.round(progress)}%`}
          </span>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden bg-gray-100">
          <div className="h-full rounded-full transition-all duration-700 ease-out" style={{
            width: `${progress}%`,
            background: challenge.isCompleted ? "linear-gradient(90deg, #10b981, #34d399)" : `linear-gradient(90deg, ${color}, ${color}cc)`,
          }} />
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        {challenge.isCompleted ? (
          <div className="flex items-center gap-1 text-[10px] text-[#10b981] font-semibold">
            <span className="material-icons" style={{ fontSize: "14px" }}>verified</span>
            Challenge Complete
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[10px] text-gray-400">
            <span className="material-icons" style={{ fontSize: "14px" }}>schedule</span>
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
  const challengesQuery = trpc.challenges.getActive.useQuery(undefined, { enabled: isAuthenticated });

  const activeChallenges = useMemo(() => challengesQuery.data?.filter((c) => !c.isCompleted) ?? [], [challengesQuery.data]);
  const completedChallenges = useMemo(() => challengesQuery.data?.filter((c) => c.isCompleted) ?? [], [challengesQuery.data]);
  const totalXpEarned = completedChallenges.reduce((sum, c) => sum + c.xpReward, 0);
  const displayChallenges = tab === "active" ? activeChallenges : completedChallenges;

  return (
    <DashboardLayout>
      <div className="max-w-[900px] space-y-5">
        {/* Header — Light theme */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-icons text-[#8b5cf6]" style={{ fontSize: "28px" }}>flag</span>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Weekly Challenges
            </h1>
          </div>
          <p className="text-gray-500 text-sm">
            Complete challenges to earn bonus XP and exclusive badges. New challenges every week!
          </p>

          {/* Stats Row */}
          <div className="flex items-center gap-6 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#008090]">{activeChallenges.length}</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider">Active</div>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center">
              <div className="text-2xl font-bold text-[#10b981]">{completedChallenges.length}</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider">Completed</div>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center">
              <div className="text-2xl font-bold text-[#f5a623]">{totalXpEarned.toLocaleString()}</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider">XP Earned</div>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2">
          <button onClick={() => setTab("active")}
            className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
              tab === "active" ? "bg-[#008090] text-white border-[#008090]" : "bg-white text-gray-500 border-gray-200 hover:border-[#008090] hover:text-[#008090]"
            }`}>
            <span className="material-icons align-middle mr-1" style={{ fontSize: "14px" }}>flag</span>
            Active ({activeChallenges.length})
          </button>
          <button onClick={() => setTab("completed")}
            className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
              tab === "completed" ? "bg-[#10b981] text-white border-[#10b981]" : "bg-white text-gray-500 border-gray-200 hover:border-[#10b981] hover:text-[#10b981]"
            }`}>
            <span className="material-icons align-middle mr-1" style={{ fontSize: "14px" }}>check_circle</span>
            Completed ({completedChallenges.length})
          </button>
        </div>

        {/* Challenge Cards */}
        {challengesQuery.isLoading ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
            <div className="animate-spin w-8 h-8 border-2 border-[#008090] border-t-transparent rounded-full mx-auto" />
            <p className="text-sm text-gray-400 mt-3">Loading challenges...</p>
          </div>
        ) : displayChallenges.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
            <span className="material-icons text-gray-300" style={{ fontSize: "48px" }}>{tab === "active" ? "flag" : "emoji_events"}</span>
            <p className="text-sm text-gray-400 mt-3">
              {tab === "active" ? "No active challenges right now. Check back soon!" : "No completed challenges yet. Start working on active challenges!"}
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
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="material-icons text-[#008090]" style={{ fontSize: "18px" }}>help_outline</span>
            How Weekly Challenges Work
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: "flag", title: "New Challenges Weekly", desc: "Fresh challenges appear every Monday. Complete them before the week ends!" },
              { icon: "auto_awesome", title: "Earn Bonus XP", desc: "Each challenge rewards bonus XP on top of your regular learning XP." },
              { icon: "emoji_events", title: "Unlock Badges", desc: "Some challenges unlock exclusive badges that showcase your dedication." },
            ].map((item) => (
              <div key={item.title} className="text-center p-3">
                <span className="material-icons text-[#008090]" style={{ fontSize: "28px" }}>{item.icon}</span>
                <h3 className="text-xs font-bold text-gray-900 mt-2">{item.title}</h3>
                <p className="text-[11px] text-gray-400 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
