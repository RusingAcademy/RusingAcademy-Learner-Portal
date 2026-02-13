/**
 * Leaderboard — RusingÂcademy Learning Portal
 * Full-featured leaderboard with animated entries, rank badges, and visual levels
 */
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { levelTitles } from "@/data/courseData";
import { useState, useMemo } from "react";

const RANK_COLORS = ["#f5a623", "#a0a0a0", "#cd7f32"]; // Gold, Silver, Bronze
const RANK_ICONS = ["emoji_events", "workspace_premium", "military_tech"];

function getRankStyle(rank: number) {
  if (rank <= 3) {
    return {
      bg: `${RANK_COLORS[rank - 1]}15`,
      border: RANK_COLORS[rank - 1],
      icon: RANK_ICONS[rank - 1],
      color: RANK_COLORS[rank - 1],
    };
  }
  return { bg: "transparent", border: "transparent", icon: "", color: "#6b7280" };
}

function LevelBadge({ level }: { level: number }) {
  const title = levelTitles[level] || "Champion";
  const colors: Record<string, string> = {
    Beginner: "#6b7280",
    Explorer: "#3b82f6",
    Learner: "#10b981",
    Achiever: "#f59e0b",
    Scholar: "#8b5cf6",
    Expert: "#ef4444",
    Master: "#ec4899",
    Champion: "#f5a623",
  };
  const color = colors[title] || "#008090";
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
      style={{ background: `${color}15`, color }}
    >
      <span className="material-icons" style={{ fontSize: "12px" }}>star</span>
      Lv.{level} {title}
    </span>
  );
}

function AvatarCircle({ name, rank }: { name: string; rank: number }) {
  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const rankStyle = getRankStyle(rank);
  const size = rank <= 3 ? "w-12 h-12" : "w-10 h-10";
  return (
    <div
      className={`${size} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`}
      style={{
        background:
          rank === 1
            ? "linear-gradient(135deg, #f5a623, #ffd700)"
            : rank === 2
              ? "linear-gradient(135deg, #a0a0a0, #d0d0d0)"
              : rank === 3
                ? "linear-gradient(135deg, #cd7f32, #e8a860)"
                : "linear-gradient(135deg, #008090, #00a0b0)",
        fontSize: rank <= 3 ? "14px" : "12px",
        boxShadow: rank <= 3 ? `0 4px 12px ${rankStyle.color}40` : "none",
      }}
    >
      {initials}
    </div>
  );
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [timeFilter, setTimeFilter] = useState<"all" | "weekly" | "monthly">("all");
  const leaderboardQuery = trpc.gamification.getLeaderboard.useQuery({ limit: 50 });

  const entries = useMemo(() => {
    if (!leaderboardQuery.data) return [];
    return leaderboardQuery.data.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  }, [leaderboardQuery.data]);

  const myRank = useMemo(() => {
    if (!user || !entries.length) return null;
    return entries.find((e) => e.userId === user.id) || null;
  }, [user, entries]);

  return (
    <DashboardLayout>
      <div className="max-w-[900px] space-y-5">
        {/* Header */}
        <div
          className="relative rounded-2xl overflow-hidden p-6 md:p-8"
          style={{
            background: "linear-gradient(135deg, #0c1929 0%, #003040 50%, #004050 100%)",
          }}
        >
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
            style={{
              background: "radial-gradient(circle, #f5a623, transparent)",
              transform: "translate(30%, -30%)",
            }}
          />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-icons text-[#f5a623]" style={{ fontSize: "28px" }}>
                leaderboard
              </span>
              <h1
                className="text-2xl md:text-3xl font-bold text-white"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Leaderboard
              </h1>
            </div>
            <p className="text-white/60 text-sm">
              See how you rank among fellow learners. Earn XP, complete challenges, and climb the ranks!
            </p>

            {/* Time Filter Tabs */}
            <div className="flex gap-2 mt-4">
              {(["all", "weekly", "monthly"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    timeFilter === filter
                      ? "text-[#0c1929]"
                      : "text-white/50 hover:text-white/80"
                  }`}
                  style={
                    timeFilter === filter
                      ? { background: "linear-gradient(135deg, #f5a623, #ffd700)" }
                      : { background: "rgba(255,255,255,0.05)" }
                  }
                >
                  {filter === "all" ? "All Time" : filter === "weekly" ? "This Week" : "This Month"}
                </button>
              ))}
            </div>
          </div>

          {/* My Rank Card */}
          {myRank && (
            <div
              className="relative z-10 mt-5 p-4 rounded-xl flex items-center gap-4"
              style={{ background: "rgba(0,128,144,0.15)", border: "1px solid rgba(0,128,144,0.3)" }}
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-[#f5a623]">#{myRank.rank}</div>
                <div className="text-[10px] text-white/40 uppercase">Your Rank</div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <div className="text-white font-semibold text-sm">{myRank.userName || "You"}</div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[#f5a623] text-xs font-bold">
                    {myRank.totalXp.toLocaleString()} XP
                  </span>
                  <LevelBadge level={myRank.level} />
                </div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="material-icons text-[#e74c3c]" style={{ fontSize: "16px" }}>
                  local_fire_department
                </span>
                <span className="text-white text-sm font-bold">{myRank.currentStreak}d</span>
              </div>
            </div>
          )}
        </div>

        {/* Leaderboard Table */}
        <div className="ra-glass rounded-xl overflow-hidden">
          {leaderboardQuery.isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-[#008090] border-t-transparent rounded-full mx-auto" />
              <p className="text-sm text-gray-400 mt-3">Loading leaderboard...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="p-8 text-center">
              <span className="material-icons text-gray-300" style={{ fontSize: "48px" }}>
                leaderboard
              </span>
              <p className="text-sm text-gray-400 mt-3">
                No learners on the leaderboard yet. Be the first to earn XP!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {/* Top 3 Podium */}
              {entries.length >= 3 && (
                <div className="p-6 pb-4">
                  <div className="flex items-end justify-center gap-4">
                    {/* 2nd Place */}
                    <div className="text-center flex-1 max-w-[140px]">
                      <AvatarCircle name={entries[1].userName || "?"} rank={2} />
                      <p className="text-xs font-semibold text-[#0c1929] mt-2 truncate">
                        {entries[1].userName || "Anonymous"}
                      </p>
                      <p className="text-[10px] text-gray-400">{entries[1].totalXp.toLocaleString()} XP</p>
                      <div
                        className="mt-2 rounded-t-lg flex items-center justify-center"
                        style={{
                          height: "60px",
                          background: "linear-gradient(180deg, #c0c0c0, #a0a0a0)",
                        }}
                      >
                        <span className="text-white font-bold text-lg">2</span>
                      </div>
                    </div>
                    {/* 1st Place */}
                    <div className="text-center flex-1 max-w-[160px]">
                      <div className="relative inline-block">
                        <span
                          className="material-icons absolute -top-3 left-1/2 -translate-x-1/2 text-[#f5a623]"
                          style={{ fontSize: "24px" }}
                        >
                          emoji_events
                        </span>
                        <div className="mt-3">
                          <AvatarCircle name={entries[0].userName || "?"} rank={1} />
                        </div>
                      </div>
                      <p className="text-sm font-bold text-[#0c1929] mt-2 truncate">
                        {entries[0].userName || "Anonymous"}
                      </p>
                      <p className="text-xs text-[#f5a623] font-bold">
                        {entries[0].totalXp.toLocaleString()} XP
                      </p>
                      <div
                        className="mt-2 rounded-t-lg flex items-center justify-center"
                        style={{
                          height: "80px",
                          background: "linear-gradient(180deg, #ffd700, #f5a623)",
                        }}
                      >
                        <span className="text-white font-bold text-xl">1</span>
                      </div>
                    </div>
                    {/* 3rd Place */}
                    <div className="text-center flex-1 max-w-[140px]">
                      <AvatarCircle name={entries[2].userName || "?"} rank={3} />
                      <p className="text-xs font-semibold text-[#0c1929] mt-2 truncate">
                        {entries[2].userName || "Anonymous"}
                      </p>
                      <p className="text-[10px] text-gray-400">{entries[2].totalXp.toLocaleString()} XP</p>
                      <div
                        className="mt-2 rounded-t-lg flex items-center justify-center"
                        style={{
                          height: "45px",
                          background: "linear-gradient(180deg, #e8a860, #cd7f32)",
                        }}
                      >
                        <span className="text-white font-bold text-lg">3</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Full Ranking List */}
              <div className="px-4 py-2">
                <div className="grid grid-cols-[40px_1fr_80px_80px_60px] gap-2 text-[10px] text-gray-400 uppercase tracking-wider font-medium py-2 border-b border-gray-100">
                  <div>Rank</div>
                  <div>Learner</div>
                  <div className="text-right">XP</div>
                  <div className="text-right">Level</div>
                  <div className="text-right">Streak</div>
                </div>
                {entries.map((entry) => {
                  const isMe = user && entry.userId === user.id;
                  const rankStyle = getRankStyle(entry.rank);
                  return (
                    <div
                      key={entry.userId}
                      className={`grid grid-cols-[40px_1fr_80px_80px_60px] gap-2 items-center py-3 transition-all duration-200 hover:bg-[#008090]/5 rounded-lg ${
                        isMe ? "ring-1 ring-[#008090]/30 bg-[#008090]/5" : ""
                      }`}
                      style={{
                        animation: `fadeSlideIn 0.3s ease-out ${entry.rank * 0.05}s both`,
                      }}
                    >
                      {/* Rank */}
                      <div className="flex items-center justify-center">
                        {entry.rank <= 3 ? (
                          <span
                            className="material-icons"
                            style={{ color: rankStyle.color, fontSize: "20px" }}
                          >
                            {rankStyle.icon}
                          </span>
                        ) : (
                          <span className="text-sm font-bold text-gray-400">#{entry.rank}</span>
                        )}
                      </div>
                      {/* Learner */}
                      <div className="flex items-center gap-2 min-w-0">
                        <AvatarCircle name={entry.userName || "?"} rank={entry.rank} />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#0c1929] truncate">
                            {entry.userName || "Anonymous"}
                            {isMe && (
                              <span className="ml-1 text-[10px] text-[#008090] font-normal">(You)</span>
                            )}
                          </p>
                          <LevelBadge level={entry.level} />
                        </div>
                      </div>
                      {/* XP */}
                      <div className="text-right">
                        <span className="text-sm font-bold text-[#f5a623]">
                          {entry.totalXp.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-gray-400 ml-0.5">XP</span>
                      </div>
                      {/* Level */}
                      <div className="text-right text-xs font-semibold text-[#0c1929]">
                        Lv.{entry.level}
                      </div>
                      {/* Streak */}
                      <div className="text-right flex items-center justify-end gap-1">
                        <span
                          className="material-icons text-[#e74c3c]"
                          style={{ fontSize: "14px" }}
                        >
                          local_fire_department
                        </span>
                        <span className="text-xs font-bold text-gray-600">
                          {entry.currentStreak}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </DashboardLayout>
  );
}
