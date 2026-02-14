/**
 * Peer Review System — Review and provide feedback on writing submissions
 * Sprint 38: Peer Review System
 */
import { useState, useCallback } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import Sidebar from "@/components/Sidebar";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

export default function PeerReview() {
  const { user, loading: authLoading } = useAuth();
  const utils = trpc.useUtils();
  const { data: pendingReviews, isLoading: loadingPending } = trpc.peerReview.pending.useQuery(undefined, { enabled: !!user });
  const { data: completedReviews } = trpc.peerReview.completed.useQuery(undefined, { enabled: !!user });

  const completeReview = trpc.peerReview.complete.useMutation({
    onSuccess: () => {
      utils.peerReview.pending.invalidate();
      utils.peerReview.completed.invalidate();
      toast.success("Review submitted successfully!");
      setActiveReview(null);
    },
  });

  const [activeTab, setActiveTab] = useState<"pending" | "completed" | "guide">("guide");
  const [activeReview, setActiveReview] = useState<any>(null);
  const [grammarScore, setGrammarScore] = useState(70);
  const [vocabularyScore, setVocabularyScore] = useState(70);
  const [coherenceScore, setCoherenceScore] = useState(70);
  const [feedback, setFeedback] = useState("");
  const [strengths, setStrengths] = useState("");
  const [improvements, setImprovements] = useState("");

  const overallScore = Math.round((grammarScore + vocabularyScore + coherenceScore) / 3);

  const handleSubmitReview = useCallback(() => {
    if (!activeReview || !feedback.trim()) {
      toast.error("Please provide feedback before submitting.");
      return;
    }
    completeReview.mutate({
      reviewId: activeReview.id,
      grammarScore,
      vocabularyScore,
      coherenceScore,
      overallScore,
      feedback: feedback.trim(),
      strengths: strengths.trim() || undefined,
      improvements: improvements.trim() || undefined,
    });
  }, [activeReview, grammarScore, vocabularyScore, coherenceScore, overallScore, feedback, strengths, improvements, completeReview]);

  const ScoreSlider = ({ label, value, onChange, color }: { label: string; value: number; onChange: (v: number) => void; color: string }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold" style={{ color }}>{value}%</span>
      </div>
      <input type="range" min={0} max={100} value={value} onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{ accentColor: color }} />
    </div>
  );

  if (authLoading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-[#008090] border-t-transparent rounded-full" /></div>;
  if (!user) { window.location.href = getLoginUrl(); return null; }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <span className="material-icons text-[#008090]">rate_review</span>
              Peer Review
            </h1>
            <p className="text-gray-500 mt-1">Help fellow learners improve their writing</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
              <span className="material-icons text-2xl mb-1 text-amber-500">pending</span>
              <div className="text-xl font-bold text-gray-900">{pendingReviews?.length ?? 0}</div>
              <div className="text-xs text-gray-500">Pending</div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
              <span className="material-icons text-2xl mb-1 text-green-500">check_circle</span>
              <div className="text-xl font-bold text-gray-900">{completedReviews?.length ?? 0}</div>
              <div className="text-xs text-gray-500">Completed</div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
              <span className="material-icons text-2xl mb-1 text-[#008090]">stars</span>
              <div className="text-xl font-bold text-gray-900">{(completedReviews?.length ?? 0) * 25}</div>
              <div className="text-xs text-gray-500">XP Earned</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 border border-gray-100 shadow-sm w-fit">
            {(["guide", "pending", "completed"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${activeTab === tab ? "bg-[#008090] text-white shadow-md" : "text-gray-500 hover:text-gray-700"}`}>
                {tab === "pending" ? `Pending (${pendingReviews?.length ?? 0})` : tab}
              </button>
            ))}
          </div>

          {activeTab === "guide" && (
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="material-icons text-[#008090]">school</span>
                Peer Review Guide
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">How Peer Review Works</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Peer review is a collaborative learning tool where you provide constructive feedback on fellow learners' writing submissions. 
                    This process helps both the writer improve their skills and you develop critical analysis abilities in French.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { icon: "edit_note", title: "Grammar (33%)", desc: "Evaluate verb conjugations, agreement, syntax, and punctuation accuracy." },
                    { icon: "translate", title: "Vocabulary (33%)", desc: "Assess word choice, variety, register appropriateness, and idiomatic usage." },
                    { icon: "format_align_left", title: "Coherence (33%)", desc: "Judge logical flow, paragraph structure, transitions, and overall clarity." },
                  ].map((item, i) => (
                    <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <span className="material-icons text-[#008090] text-2xl mb-2 block">{item.icon}</span>
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">{item.title}</h4>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="p-4 rounded-xl bg-[#008090]/5 border border-[#008090]/10">
                  <h4 className="font-semibold text-[#008090] text-sm mb-1">Tips for Effective Reviews</h4>
                  <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                    <li>Be specific — cite exact sentences or phrases when giving feedback</li>
                    <li>Be constructive — suggest improvements, don't just point out errors</li>
                    <li>Be encouraging — highlight what the writer did well</li>
                    <li>Be honest — accurate feedback helps learners grow faster</li>
                  </ul>
                </div>
                <p className="text-sm text-gray-500">You earn <strong>25 XP</strong> for each completed review. Start by checking the Pending tab!</p>
              </div>
            </div>
          )}

          {activeTab === "pending" && (
            <div>
              {activeReview ? (
                /* Review Form */
                <div className="space-y-6">
                  <button onClick={() => setActiveReview(null)} className="text-sm text-[#008090] hover:underline flex items-center gap-1">
                    <span className="material-icons text-base">arrow_back</span> Back to list
                  </button>

                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-2">Submission to Review</h3>
                    <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-700 leading-relaxed font-serif whitespace-pre-wrap">
                      {activeReview.content || "No content available for this submission."}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-4">Your Evaluation</h3>
                    <div className="space-y-5">
                      <ScoreSlider label="Grammar" value={grammarScore} onChange={setGrammarScore} color="#008090" />
                      <ScoreSlider label="Vocabulary" value={vocabularyScore} onChange={setVocabularyScore} color="#8b5cf6" />
                      <ScoreSlider label="Coherence" value={coherenceScore} onChange={setCoherenceScore} color="#f5a623" />
                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">Overall Score</span>
                        <span className="text-lg font-bold" style={{ color: overallScore >= 80 ? "#22c55e" : overallScore >= 60 ? "#f5a623" : "#e74c3c" }}>{overallScore}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Detailed Feedback *</label>
                      <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={4}
                        placeholder="Provide specific, constructive feedback on the writing..."
                        className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#008090]/30 resize-none" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Strengths</label>
                      <textarea value={strengths} onChange={e => setStrengths(e.target.value)} rows={2}
                        placeholder="What did the writer do well?"
                        className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#008090]/30 resize-none" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Areas for Improvement</label>
                      <textarea value={improvements} onChange={e => setImprovements(e.target.value)} rows={2}
                        placeholder="What could be improved?"
                        className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#008090]/30 resize-none" />
                    </div>
                    <div className="flex justify-end">
                      <button onClick={handleSubmitReview}
                        disabled={!feedback.trim() || completeReview.isPending}
                        className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-[#008090] text-white hover:bg-[#006a75] disabled:opacity-40 transition-colors flex items-center gap-2">
                        {completeReview.isPending ? (
                          <><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Submitting...</>
                        ) : (
                          <><span className="material-icons text-base">send</span> Submit Review</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {loadingPending ? (
                    <div className="text-center py-16"><div className="animate-spin w-8 h-8 border-4 border-[#008090] border-t-transparent rounded-full mx-auto" /></div>
                  ) : !pendingReviews?.length ? (
                    <div className="text-center py-16 text-gray-400">
                      <span className="material-icons text-5xl mb-3 block">inbox</span>
                      <p className="text-lg font-medium">No pending reviews</p>
                      <p className="text-sm mt-1">Check back later for new submissions to review.</p>
                    </div>
                  ) : pendingReviews.map((review: any) => (
                    <div key={review.id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => { setActiveReview(review); setGrammarScore(70); setVocabularyScore(70); setCoherenceScore(70); setFeedback(""); setStrengths(""); setImprovements(""); }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900">Submission #{review.submissionId}</div>
                          <div className="text-sm text-gray-500 mt-1">Assigned for review</div>
                        </div>
                        <span className="material-icons text-[#008090]">arrow_forward</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "completed" && (
            <div className="space-y-3">
              {!completedReviews?.length ? (
                <div className="text-center py-16 text-gray-400">
                  <span className="material-icons text-5xl mb-3 block">check_circle</span>
                  <p className="text-lg font-medium">No completed reviews yet</p>
                  <p className="text-sm mt-1">Complete a peer review to see it here.</p>
                </div>
              ) : completedReviews.map((review: any) => (
                <div key={review.id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold text-gray-900">Submission #{review.submissionId}</div>
                    <div className="text-lg font-bold" style={{ color: (review.overallScore ?? 0) >= 80 ? "#22c55e" : (review.overallScore ?? 0) >= 60 ? "#f5a623" : "#e74c3c" }}>
                      {review.overallScore}%
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {[
                      { label: "Grammar", value: review.grammarScore, color: "#008090" },
                      { label: "Vocabulary", value: review.vocabularyScore, color: "#8b5cf6" },
                      { label: "Coherence", value: review.coherenceScore, color: "#f5a623" },
                    ].map((s, i) => (
                      <div key={i} className="text-center">
                        <div className="text-sm font-bold" style={{ color: s.color }}>{s.value}%</div>
                        <div className="text-xs text-gray-400">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  {review.feedback && <p className="text-sm text-gray-600 line-clamp-2">{review.feedback}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
