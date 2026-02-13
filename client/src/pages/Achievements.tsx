/**
 * Achievement Showcase — Badges, milestones, certificates, and shareable stats
 */
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";

const ALL_BADGES = [
  { id: "first_lesson", name: "First Steps", description: "Complete your first lesson", icon: "school", color: "#008090", xp: 50 },
  { id: "five_lessons", name: "Dedicated Learner", description: "Complete 5 lessons", icon: "auto_stories", color: "#f5a623", xp: 100 },
  { id: "ten_lessons", name: "Knowledge Seeker", description: "Complete 10 lessons", icon: "psychology", color: "#e74c3c", xp: 200 },
  { id: "twenty_five_lessons", name: "Scholar", description: "Complete 25 lessons", icon: "workspace_premium", color: "#9b59b6", xp: 500 },
  { id: "first_quiz", name: "Quiz Taker", description: "Complete your first quiz", icon: "quiz", color: "#3498db", xp: 50 },
  { id: "perfect_quiz", name: "Perfectionist", description: "Score 100% on a quiz", icon: "emoji_events", color: "#f5a623", xp: 150 },
  { id: "five_perfect", name: "Quiz Master", description: "Score 100% on 5 quizzes", icon: "military_tech", color: "#e74c3c", xp: 300 },
  { id: "streak_3", name: "On Fire", description: "3-day learning streak", icon: "local_fire_department", color: "#e67e22", xp: 75 },
  { id: "streak_7", name: "Week Warrior", description: "7-day learning streak", icon: "whatshot", color: "#e74c3c", xp: 200 },
  { id: "streak_30", name: "Monthly Champion", description: "30-day learning streak", icon: "diamond", color: "#f5a623", xp: 1000 },
  { id: "path_complete", name: "Path Pioneer", description: "Complete an entire Path", icon: "flag", color: "#27ae60", xp: 500 },
  { id: "first_enrollment", name: "Adventurer", description: "Enroll in your first Path", icon: "explore", color: "#008090", xp: 25 },
  { id: "challenge_champion", name: "Challenge Champion", description: "Complete a weekly challenge", icon: "emoji_events", color: "#f59e0b", xp: 250 },
  { id: "five_challenges", name: "Challenge Master", description: "Complete 5 weekly challenges", icon: "military_tech", color: "#8b5cf6", xp: 500 },
];

const MILESTONES = [
  { xp: 100, title: "Getting Started", icon: "rocket_launch" },
  { xp: 500, title: "Rising Star", icon: "star" },
  { xp: 1000, title: "Committed Learner", icon: "school" },
  { xp: 2500, title: "Language Enthusiast", icon: "favorite" },
  { xp: 5000, title: "Bilingual Achiever", icon: "workspace_premium" },
  { xp: 10000, title: "Language Master", icon: "diamond" },
  { xp: 25000, title: "Elite Scholar", icon: "military_tech" },
];

export default function Achievements() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"badges" | "milestones" | "stats">("badges");

  const profile = trpc.gamification.getProfile.useQuery();
  const streak = trpc.dailyGoals.getStreak.useQuery();

  const profileData = (profile.data as any)?.profile || profile.data;
  const badgesData = (profile.data as any)?.badges || [];
  const earnedBadgeIds = new Set((badgesData as any[]).map((b: any) => b.badgeId));
  const totalXp = profileData?.totalXp || 0;
  const currentLevel = profileData?.level || 1;

  const currentMilestone = MILESTONES.filter(m => totalXp >= m.xp).pop();
  const nextMilestone = MILESTONES.find(m => totalXp < m.xp);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header with Stats */}
        <div className="bg-gradient-to-br from-[#008090] to-[#005a66] rounded-2xl p-6 text-white mb-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Achievement Showcase</h1>
              <p className="text-white/70 text-sm mt-1">Your learning journey milestones</p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
              <span className="material-icons text-3xl">emoji_events</span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold">{totalXp.toLocaleString()}</div>
              <div className="text-[10px] text-white/60 uppercase tracking-wider">Total XP</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold">{currentLevel}</div>
              <div className="text-[10px] text-white/60 uppercase tracking-wider">Level</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold">{earnedBadgeIds.size}</div>
              <div className="text-[10px] text-white/60 uppercase tracking-wider">Badges</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold">{streak.data?.currentStreak || 0}</div>
              <div className="text-[10px] text-white/60 uppercase tracking-wider">Day Streak</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
          {[
            { id: "badges" as const, label: "Badges", icon: "military_tech" },
            { id: "milestones" as const, label: "Milestones", icon: "flag" },
            { id: "stats" as const, label: "Statistics", icon: "analytics" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === t.id ? "bg-white text-[#008090] shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="material-icons text-[16px]">{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* Badges Tab */}
        {tab === "badges" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {ALL_BADGES.map((badge) => {
              const earned = earnedBadgeIds.has(badge.id);
              const earnedBadge = (badgesData as any[]).find((b: any) => b.badgeId === badge.id);
              return (
                <div
                  key={badge.id}
                  className={`relative bg-white border rounded-xl p-4 text-center transition-all ${
                    earned
                      ? "border-gray-200 shadow-sm hover:shadow-md"
                      : "border-dashed border-gray-300 opacity-50"
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center ${
                      earned ? "" : "bg-gray-100"
                    }`}
                    style={earned ? { background: badge.color + "15" } : {}}
                  >
                    <span
                      className="material-icons text-2xl"
                      style={{ color: earned ? badge.color : "#d1d5db" }}
                    >
                      {badge.icon}
                    </span>
                  </div>
                  <h3 className={`text-xs font-semibold mb-1 ${earned ? "text-gray-900" : "text-gray-400"}`}>{badge.name}</h3>
                  <p className="text-[10px] text-gray-400 leading-tight">{badge.description}</p>
                  <div className="mt-2 text-[10px] font-semibold" style={{ color: earned ? badge.color : "#d1d5db" }}>+{badge.xp} XP</div>
                  {earned && earnedBadge && (
                    <div className="absolute top-2 right-2">
                      <span className="material-icons text-green-500 text-[14px]">verified</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Milestones Tab */}
        {tab === "milestones" && (
          <div className="space-y-3">
            {MILESTONES.map((milestone, i) => {
              const reached = totalXp >= milestone.xp;
              const progress = reached ? 100 : Math.min(100, (totalXp / milestone.xp) * 100);
              return (
                <div
                  key={i}
                  className={`bg-white border rounded-xl p-4 flex items-center gap-4 transition-all ${
                    reached ? "border-gray-200 shadow-sm" : "border-dashed border-gray-300"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      reached ? "bg-[#008090]/10" : "bg-gray-100"
                    }`}
                  >
                    <span className={`material-icons text-xl ${reached ? "text-[#008090]" : "text-gray-300"}`}>{milestone.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`text-sm font-semibold ${reached ? "text-gray-900" : "text-gray-400"}`}>{milestone.title}</h3>
                      <span className={`text-xs font-medium ${reached ? "text-[#008090]" : "text-gray-400"}`}>{milestone.xp.toLocaleString()} XP</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${progress}%`, background: reached ? "#008090" : "#d1d5db" }}
                      />
                    </div>
                    {!reached && (
                      <p className="text-[10px] text-gray-400 mt-1">{(milestone.xp - totalXp).toLocaleString()} XP remaining</p>
                    )}
                  </div>
                  {reached && <span className="material-icons text-green-500">check_circle</span>}
                </div>
              );
            })}
          </div>
        )}

        {/* Stats Tab */}
        {tab === "stats" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1">
                <span className="material-icons text-[#008090] text-[16px]">school</span> Learning Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Lessons Completed</span><span className="font-semibold">{profileData?.lessonsCompleted || 0}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Quizzes Completed</span><span className="font-semibold">{profileData?.quizzesCompleted || 0}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Perfect Quizzes</span><span className="font-semibold">{profileData?.perfectQuizzes || 0}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Study Time</span><span className="font-semibold">{Math.round((profileData?.totalStudyTimeMinutes || 0) / 60)}h {(profileData?.totalStudyTimeMinutes || 0) % 60}m</span></div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1">
                <span className="material-icons text-[#f59e0b] text-[16px]">local_fire_department</span> Streak Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Current Streak</span><span className="font-semibold">{streak.data?.currentStreak || 0} days</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Longest Streak</span><span className="font-semibold">{profileData?.longestStreak || 0} days</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">XP Multiplier</span><span className="font-semibold text-[#008090]">{streak.data?.multiplier || 100}%</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Current Milestone</span><span className="font-semibold">{currentMilestone?.title || "None yet"}</span></div>
              </div>
            </div>
            <div className="sm:col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1">
                <span className="material-icons text-[#8b5cf6] text-[16px]">trending_up</span> Progress Overview
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-[#008090]">{earnedBadgeIds.size}/{ALL_BADGES.length}</div>
                  <div className="text-[10px] text-gray-400 mt-1">Badges Earned</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-[#f59e0b]">{MILESTONES.filter(m => totalXp >= m.xp).length}/{MILESTONES.length}</div>
                  <div className="text-[10px] text-gray-400 mt-1">Milestones Reached</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-[#8b5cf6]">{nextMilestone ? `${Math.round((totalXp / nextMilestone.xp) * 100)}%` : "100%"}</div>
                  <div className="text-[10px] text-gray-400 mt-1">Next Milestone</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
