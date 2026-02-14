import { useState } from "react";
import { trpc } from "../lib/trpc";

// Badge icons mapping
const BADGE_ICONS: Record<string, string> = {
  first_lesson: "🎯",
  module_complete: "📚",
  course_complete: "🎓",
  all_courses_complete: "🏆",
  streak_3: "🔥",
  streak_7: "⚡",
  streak_14: "💪",
  streak_30: "🌟",
  streak_100: "👑",
  quiz_ace: "💯",
  perfect_module: "✨",
  quiz_master: "🧠",
  early_bird: "🌅",
  night_owl: "🦉",
  weekend_warrior: "⚔️",
  consistent_learner: "📈",
  xp_100: "💎",
  xp_500: "💎💎",
  xp_1000: "💎💎💎",
  xp_5000: "🌈",
  founding_member: "🏅",
  beta_tester: "🔬",
  community_helper: "🤝",
  top_reviewer: "⭐",
};

// Level colors
const LEVEL_COLORS: Record<number, string> = {
  1: "from-gray-400 to-gray-500",
  2: "from-green-400 to-green-500",
  3: "from-blue-400 to-blue-500",
  4: "from-[#0F3D3E] to-[#145A5B]",
  5: "from-yellow-400 to-[#FFFBEB]0",
  6: "from-[#D97B3D] to-[#C65A1E]",
  7: "from-red-400 to-red-500",
  8: "from-[#C65A1E] to-[#E06B2D]",
  9: "from-indigo-400 to-indigo-500",
  10: "from-[#D97B3D] via-yellow-300 to-[#C65A1E]",
};

interface GamificationDashboardProps {
  compact?: boolean;
}

export function GamificationDashboard({ compact = false }: GamificationDashboardProps) {
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<"weekly" | "monthly" | "allTime">("weekly");
  
  const { data: stats, isLoading: statsLoading } = trpc.gamification.getMyStats.useQuery();
  const { data: allBadges } = trpc.gamification.getMyBadges.useQuery();
  const { data: leaderboard } = trpc.gamification.getLeaderboard.useQuery({ timeRange: leaderboardPeriod, limit: 10 });
  
  if (statsLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-24 bg-gray-200 rounded-xl"></div>
        <div className="h-32 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }
  
  if (!stats) return null;
  
  const levelColor = LEVEL_COLORS[stats.levelInfo.current] || LEVEL_COLORS[1];
  
  if (compact) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Level Badge */}
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${levelColor} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
              {stats.levelInfo.current}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{stats.levelInfo.title}</p>
              <p className="text-sm text-gray-500">{stats.xp.total.toLocaleString()} XP</p>
            </div>
          </div>
          
          {/* Streak */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="font-bold text-orange-500">{stats.streak.current}</p>
              <p className="text-xs text-gray-500">day streak</p>
            </div>
          </div>
        </div>
        
        {/* XP Progress Bar */}
        {stats.levelInfo.nextLevel && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Level {stats.levelInfo.current}</span>
              <span>{stats.levelInfo.xpToNextLevel} XP to Level {stats.levelInfo.nextLevel.level}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${levelColor} transition-all duration-500`}
                style={{ width: `${stats.levelInfo.progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Main Stats Card */}
      <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* Level Badge */}
            <div className={`w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center shadow-lg border-4 border-white/30`}>
              <div className="text-center">
                <p className="text-3xl font-bold">{stats.levelInfo.current}</p>
                <p className="text-xs opacity-80">LEVEL</p>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold">{stats.levelInfo.title}</h2>
              <p className="text-teal-100">{stats.levelInfo.titleFr}</p>
              <p className="text-sm text-teal-200 mt-1">{stats.xp.total.toLocaleString()} Total XP</p>
            </div>
          </div>
          
          {/* Streak */}
          <div className="text-center bg-white/10 rounded-xl p-4 backdrop-blur">
            <div className="text-4xl mb-1">🔥</div>
            <p className="text-3xl font-bold">{stats.streak.current}</p>
            <p className="text-sm text-teal-200">Day Streak</p>
            {stats.streak.longest > stats.streak.current && (
              <p className="text-xs text-teal-300 mt-1">Best: {stats.streak.longest} days</p>
            )}
          </div>
        </div>
        
        {/* XP Progress to Next Level */}
        {stats.levelInfo.nextLevel && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Progress to Level {stats.levelInfo.nextLevel.level}</span>
              <span>{stats.levelInfo.progressPercent}%</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${stats.levelInfo.progressPercent}%` }}
              />
            </div>
            <p className="text-sm text-teal-200 mt-2">
              {stats.levelInfo.xpToNextLevel.toLocaleString()} XP needed to become {stats.levelInfo.nextLevel.title}
            </p>
          </div>
        )}
        
        {/* Weekly/Monthly XP */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{stats.xp.weekly.toLocaleString()}</p>
            <p className="text-sm text-teal-200">This Week</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{stats.xp.monthly.toLocaleString()}</p>
            <p className="text-sm text-teal-200">This Month</p>
          </div>
        </div>
      </div>
      
      {/* Badges Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Badges ({stats.badges.total})
          </h3>
          {stats.badges.total > 5 && (
            <button 
              onClick={() => setShowAllBadges(!showAllBadges)}
              className="text-teal-600 hover:text-teal-700 text-sm font-medium"
            >
              {showAllBadges ? "Show Less" : "View All"}
            </button>
          )}
        </div>
        
        {stats.badges.total === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-4xl mb-2">🏅</p>
            <p>Complete lessons and maintain streaks to earn badges!</p>
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-3">
            {(showAllBadges ? allBadges : stats.badges.recent)?.map((badge) => (
              <div 
                key={badge.id}
                className={`relative group p-3 rounded-xl text-center transition-all hover:scale-105 ${
                  badge.isNew ? "bg-yellow-50 ring-2 ring-yellow-400" : "bg-white"
                }`}
              >
                {badge.isNew && (
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-xs px-1.5 py-0.5 rounded-full font-medium">
                    NEW
                  </span>
                )}
                <div className="text-3xl mb-1">
                  {BADGE_ICONS[badge.badgeType] || "🏅"}
                </div>
                <p className="text-xs font-medium text-gray-700 truncate">{badge.title}</p>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  <p className="font-medium">{badge.title}</p>
                  {badge.description && <p className="text-gray-300">{badge.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Leaderboard */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Leaderboard</h3>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {(["weekly", "monthly", "allTime"] as const).map((period) => (
              <button
                key={period}
                onClick={() => setLeaderboardPeriod(period)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  leaderboardPeriod === period
                    ? "bg-white text-teal-600 shadow-sm font-medium"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {period === "weekly" ? "Week" : period === "monthly" ? "Month" : "All Time"}
              </button>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          {leaderboard?.entries?.map((entry, index) => (
            <div 
              key={entry.userId}
              className={`flex items-center gap-3 p-3 rounded-xl ${
                index < 3 ? "bg-gradient-to-r from-[#FFFBEB] to-[#FFF8F3]" : "bg-white"
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                index === 0 ? "bg-yellow-400 text-yellow-900" :
                index === 1 ? "bg-gray-300 text-gray-700" :
                index === 2 ? "bg-amber-600 text-white" :
                "bg-gray-200 text-gray-600"
              }`}>
                {entry.rank}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{entry.name || "Anonymous"}</p>
                <p className="text-sm text-gray-500">Level {entry.level} • {entry.levelTitle}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-teal-600">{entry.xp?.toLocaleString() || 0} XP</p>
                {entry.streak > 0 && (
                  <p className="text-xs text-orange-500">🔥 {entry.streak} day streak</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GamificationDashboard;
