/**
 * Progress Analytics Dashboard — Comprehensive learning analytics with visual charts
 * Sprint 37: Progress Analytics Dashboard
 */
import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import Sidebar from "@/components/Sidebar";
import { getLoginUrl } from "@/const";

export default function ProgressAnalytics() {
  const { user, loading: authLoading } = useAuth();
  const { data: gamification } = trpc.gamification.getProfile.useQuery(undefined, { enabled: !!user });
  const { data: readingStats } = trpc.readingLab.stats.useQuery(undefined, { enabled: !!user });
  const { data: listeningStats } = trpc.listeningLab.stats.useQuery(undefined, { enabled: !!user });
  const { data: grammarStats } = trpc.grammarDrills.stats.useQuery(undefined, { enabled: !!user });
  const { data: vocabItems } = trpc.vocabulary.list.useQuery(undefined, { enabled: !!user });
  const { data: flashcardDecks } = trpc.flashcards.listDecks.useQuery(undefined, { enabled: !!user });
  const { data: readingHistory } = trpc.readingLab.history.useQuery(undefined, { enabled: !!user });
  const { data: grammarTopicStats } = trpc.grammarDrills.statsByTopic.useQuery(undefined, { enabled: !!user });

  const [activeTab, setActiveTab] = useState<"overview" | "skills" | "trends">("overview");

  const profile = gamification?.profile;
  const badges = gamification?.badges ?? [];

  // Compute skill scores
  const skills = useMemo(() => {
    const reading = readingStats?.avgScore ?? 0;
    const listening = listeningStats?.avgScore ?? 0;
    const grammar = grammarStats?.avgScore ?? 0;
    const vocabCount = Array.isArray(vocabItems) ? vocabItems.length : 0;
    const vocabMastered = Array.isArray(vocabItems) ? vocabItems.filter((v: any) => v.masteryLevel === "mastered").length : 0;
    const vocabScore = vocabCount > 0 ? Math.round((vocabMastered / vocabCount) * 100) : 0;
    return [
      { name: "Reading", score: reading, icon: "auto_stories", color: "#008090", total: readingStats?.totalExercises ?? 0 },
      { name: "Listening", score: listening, icon: "headphones", color: "#8b5cf6", total: listeningStats?.totalExercises ?? 0 },
      { name: "Grammar", score: grammar, icon: "spellcheck", color: "#f5a623", total: grammarStats?.totalDrills ?? 0 },
      { name: "Vocabulary", score: vocabScore, icon: "translate", color: "#e74c3c", total: vocabCount },
    ];
  }, [readingStats, listeningStats, grammarStats, vocabItems]);

  const overallScore = useMemo(() => {
    const active = skills.filter(s => s.total > 0);
    if (active.length === 0) return 0;
    return Math.round(active.reduce((sum, s) => sum + s.score, 0) / active.length);
  }, [skills]);

  // CEFR level estimation
  const estimatedCEFR = useMemo(() => {
    if (overallScore >= 85) return "C1";
    if (overallScore >= 70) return "B2";
    if (overallScore >= 55) return "B1";
    if (overallScore >= 40) return "A2";
    return "A1";
  }, [overallScore]);

  // Reading trend (last 10 exercises)
  const readingTrend = useMemo(() => {
    if (!readingHistory || readingHistory.length < 2) return null;
    const recent = readingHistory.slice(0, 10).reverse();
    return recent.map((r: any, i: number) => ({ index: i, score: r.score ?? 0, wpm: r.wordsPerMinute ?? 0 }));
  }, [readingHistory]);

  if (authLoading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-[#008090] border-t-transparent rounded-full" /></div>;
  if (!user) { window.location.href = getLoginUrl(); return null; }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <span className="material-icons text-[#008090]">insights</span>
              Progress Analytics
            </h1>
            <p className="text-gray-500 mt-1">Track your learning journey across all skills</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-8 bg-white rounded-xl p-1 border border-gray-100 shadow-sm w-fit">
            {(["overview", "skills", "trends"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${activeTab === tab ? "bg-[#008090] text-white shadow-md" : "text-gray-500 hover:text-gray-700"}`}>
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Overall Score + CEFR */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center col-span-1">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="52" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                      <circle cx="60" cy="60" r="52" fill="none" stroke="#008090" strokeWidth="10"
                        strokeDasharray={`${(overallScore / 100) * 327} 327`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-gray-900">{overallScore}%</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">Overall Proficiency</div>
                  <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#008090]/10 text-[#008090] text-sm font-semibold">
                    Estimated: {estimatedCEFR}
                  </div>
                </div>

                <div className="col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">Skill Breakdown</h3>
                  <div className="space-y-4">
                    {skills.map((skill, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="material-icons text-base" style={{ color: skill.color }}>{skill.icon}</span>
                            <span className="text-sm font-medium text-gray-700">{skill.name}</span>
                          </div>
                          <span className="text-sm font-bold" style={{ color: skill.color }}>{skill.score}%</span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-3 rounded-full transition-all duration-500" style={{ width: `${skill.score}%`, backgroundColor: skill.color }} />
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">{skill.total} exercises completed</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Level", value: profile?.level ?? 1, icon: "military_tech", color: "#f5a623" },
                  { label: "Total XP", value: profile?.totalXp?.toLocaleString() ?? "0", icon: "stars", color: "#008090" },
                  { label: "Streak", value: `${profile?.currentStreak ?? 0}d`, icon: "local_fire_department", color: "#e74c3c" },
                  { label: "Badges", value: badges.length, icon: "emoji_events", color: "#8b5cf6" },
                ].map((s, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
                    <span className="material-icons text-3xl mb-2" style={{ color: s.color }}>{s.icon}</span>
                    <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                    <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Badges Showcase */}
              {badges.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">Earned Badges</h3>
                  <div className="flex flex-wrap gap-3">
                    {badges.map((b: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100">
                        <span className="material-icons text-lg" style={{ color: b.color || "#008090" }}>{b.icon || "emoji_events"}</span>
                        <span className="text-sm font-medium text-gray-700">{b.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "skills" && (
            <div className="space-y-6">
              {/* Detailed Skill Cards */}
              {skills.map((skill, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${skill.color}15` }}>
                      <span className="material-icons" style={{ color: skill.color }}>{skill.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{skill.name}</h3>
                      <div className="text-sm text-gray-500">{skill.total} exercises · Average: {skill.score}%</div>
                    </div>
                    <div className="ml-auto">
                      <div className="text-2xl font-bold" style={{ color: skill.color }}>{skill.score}%</div>
                    </div>
                  </div>

                  {/* Skill-specific details */}
                  {skill.name === "Reading" && readingStats && (
                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{readingStats.avgWpm ?? 0}</div>
                        <div className="text-xs text-gray-500">Avg WPM</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{readingStats.totalExercises ?? 0}</div>
                        <div className="text-xs text-gray-500">Passages Read</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{Math.round((readingStats.totalTime ?? 0) / 60)}m</div>
                        <div className="text-xs text-gray-500">Time Spent</div>
                      </div>
                    </div>
                  )}

                  {skill.name === "Grammar" && grammarTopicStats && grammarTopicStats.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-medium text-gray-600 mb-3">Performance by Topic</h4>
                      <div className="space-y-2">
                        {grammarTopicStats.map((ts: any, j: number) => (
                          <div key={j} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">{ts.topic}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-2 rounded-full bg-[#f5a623]" style={{ width: `${ts.avgScore}%` }} />
                              </div>
                              <span className="text-sm font-bold text-gray-700 w-10 text-right">{ts.avgScore}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {skill.name === "Vocabulary" && Array.isArray(vocabItems) && vocabItems.length > 0 && (
                    <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
                      {["new", "learning", "familiar", "mastered"].map(level => {
                        const count = vocabItems.filter((v: any) => v.masteryLevel === level).length;
                        const colors: Record<string, string> = { new: "#94a3b8", learning: "#f5a623", familiar: "#8b5cf6", mastered: "#22c55e" };
                        return (
                          <div key={level} className="text-center">
                            <div className="text-lg font-bold" style={{ color: colors[level] }}>{count}</div>
                            <div className="text-xs text-gray-500 capitalize">{level}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === "trends" && (
            <div className="space-y-6">
              {/* Reading Score Trend */}
              {readingTrend && readingTrend.length > 1 ? (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">Reading Score Trend</h3>
                  <div className="flex items-end gap-2 h-40">
                    {readingTrend.map((point: any, i: number) => (
                      <div key={i} className="flex-1 flex flex-col items-center justify-end">
                        <div className="text-xs text-gray-500 mb-1">{point.score}%</div>
                        <div className="w-full rounded-t-lg transition-all" style={{
                          height: `${Math.max(point.score, 5)}%`,
                          backgroundColor: point.score >= 80 ? "#22c55e" : point.score >= 60 ? "#f5a623" : "#e74c3c",
                          opacity: 0.8,
                        }} />
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-gray-400 text-center mt-2">Last {readingTrend.length} exercises</div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center text-gray-400">
                  <span className="material-icons text-4xl mb-2 block">show_chart</span>
                  <p>Complete more exercises to see trends.</p>
                  <p className="text-sm mt-1">At least 2 reading exercises needed.</p>
                </div>
              )}

              {/* Study Time Summary */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Study Time by Skill</h3>
                <div className="space-y-3">
                  {[
                    { name: "Reading", time: readingStats?.totalTime ?? 0, color: "#008090" },
                    { name: "Listening", time: listeningStats?.totalTime ?? 0, color: "#8b5cf6" },
                    { name: "Grammar", time: grammarStats?.totalTime ?? 0, color: "#f5a623" },
                  ].map((s, i) => {
                    const minutes = Math.round(s.time / 60);
                    const maxTime = Math.max(readingStats?.totalTime ?? 0, listeningStats?.totalTime ?? 0, grammarStats?.totalTime ?? 0, 1);
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700 w-20">{s.name}</span>
                        <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-6 rounded-full flex items-center px-3 transition-all" style={{
                            width: `${Math.max((s.time / maxTime) * 100, 5)}%`,
                            backgroundColor: s.color,
                          }}>
                            <span className="text-xs text-white font-medium">{minutes}m</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Personalized Recommendations</h3>
                <div className="space-y-3">
                  {skills.filter(s => s.total === 0).map((s, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
                      <span className="material-icons text-blue-500">lightbulb</span>
                      <span className="text-sm text-blue-700">Start practicing <strong>{s.name}</strong> to build a complete skill profile.</span>
                    </div>
                  ))}
                  {skills.filter(s => s.total > 0 && s.score < 60).map((s, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                      <span className="material-icons text-amber-500">trending_up</span>
                      <span className="text-sm text-amber-700">Your <strong>{s.name}</strong> score is {s.score}%. Focus on this area to improve.</span>
                    </div>
                  ))}
                  {skills.filter(s => s.score >= 80 && s.total > 0).map((s, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-100">
                      <span className="material-icons text-green-500">verified</span>
                      <span className="text-sm text-green-700">Excellent <strong>{s.name}</strong> performance at {s.score}%! Keep it up.</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
