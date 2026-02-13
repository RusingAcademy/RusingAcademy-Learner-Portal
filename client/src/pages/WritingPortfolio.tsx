/**
 * Writing Portfolio — Submit writing exercises and get AI feedback
 */
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { toast } from "sonner";

const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1"] as const;
const WRITING_PROMPTS = [
  { level: "A1", fr: "Décrivez votre routine quotidienne au bureau.", en: "Describe your daily office routine." },
  { level: "A2", fr: "Écrivez un courriel à un collègue pour organiser une réunion.", en: "Write an email to a colleague to organize a meeting." },
  { level: "B1", fr: "Rédigez un rapport sur les avantages du bilinguisme dans la fonction publique.", en: "Write a report on the benefits of bilingualism in the public service." },
  { level: "B2", fr: "Analysez les défis de la mise en œuvre des politiques linguistiques au Canada.", en: "Analyze the challenges of implementing language policies in Canada." },
  { level: "C1", fr: "Rédigez une note de service proposant des améliorations au programme de formation linguistique.", en: "Draft a briefing note proposing improvements to the language training program." },
];

type FeedbackData = {
  score: number;
  grammar: { score: number; feedback: string };
  vocabulary: { score: number; feedback: string };
  coherence: { score: number; feedback: string };
  suggestions: string[];
  highlights: string[];
  overallFeedback: string;
};

export default function WritingPortfolio() {
  const { user } = useAuth();
  const [view, setView] = useState<"list" | "editor" | "detail">("list");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState<"en" | "fr">("fr");
  const [cefrLevel, setCefrLevel] = useState<string>("B1");
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<number | null>(null);

  const submissions = trpc.writing.list.useQuery();
  const submission = trpc.writing.get.useQuery({ id: selectedSubmission! }, { enabled: !!selectedSubmission });
  const utils = trpc.useUtils();

  const createMutation = trpc.writing.create.useMutation({
    onSuccess: () => {
      utils.writing.list.invalidate();
      resetEditor();
      toast.success("Submission saved!");
    },
  });

  const updateMutation = trpc.writing.update.useMutation({
    onSuccess: () => {
      utils.writing.list.invalidate();
      utils.writing.get.invalidate();
      toast.success("Submission updated!");
    },
  });

  const deleteMutation = trpc.writing.delete.useMutation({
    onSuccess: () => {
      utils.writing.list.invalidate();
      setView("list");
      toast.success("Submission deleted");
    },
  });

  const feedbackMutation = trpc.writing.getAIFeedback.useMutation({
    onSuccess: (data) => {
      setFeedback(data as FeedbackData);
      utils.writing.list.invalidate();
      utils.writing.get.invalidate();
      toast.success("AI feedback received!");
    },
  });

  const resetEditor = () => {
    setView("list");
    setEditingId(null);
    setTitle("");
    setContent("");
    setFeedback(null);
  };

  const handleSave = () => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, title, content });
    } else {
      createMutation.mutate({ title, content, language, cefrLevel: cefrLevel as any });
    }
  };

  const handleSubmitForFeedback = (submissionId: number, text: string) => {
    feedbackMutation.mutate({ submissionId, content: text, language, cefrLevel });
  };

  const openDetail = (id: number) => {
    setSelectedSubmission(id);
    setView("detail");
  };

  const openEditor = (prompt?: typeof WRITING_PROMPTS[0]) => {
    setTitle(prompt ? (language === "fr" ? prompt.fr : prompt.en) : "");
    setContent("");
    setCefrLevel(prompt?.level || "B1");
    setEditingId(null);
    setFeedback(null);
    setView("editor");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-600";
      case "submitted": return "bg-blue-100 text-blue-700";
      case "reviewed": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const ScoreBar = ({ label, score, color }: { label: string; score: number; color: string }) => (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold" style={{ color }}>{score}/100</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  );

  /* ─── DETAIL VIEW ─── */
  if (view === "detail" && selectedSubmission) {
    const s = submission.data;
    const fb = s?.aiFeedback ? JSON.parse(s.aiFeedback) as FeedbackData : null;
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button onClick={resetEditor} className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#008090] mb-4 transition-colors">
            <span className="material-icons text-[18px]">arrow_back</span> Back to Portfolio
          </button>
          {submission.isLoading ? (
            <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
          ) : s ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold text-gray-900">{s.title}</h1>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(s.status)}`}>{s.status}</span>
                      <button onClick={() => { if (confirm("Delete?")) deleteMutation.mutate({ id: s.id }); }} className="text-gray-400 hover:text-red-500">
                        <span className="material-icons text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-4 text-[11px] text-gray-400">
                    {s.cefrLevel && <span className="px-2 py-0.5 bg-[#008090]/10 text-[#008090] rounded-full font-medium">{s.cefrLevel}</span>}
                    <span>{s.wordCount} words</span>
                    <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">{s.content}</div>
                </div>
                {!fb && s.status !== "reviewed" && (
                  <button
                    onClick={() => handleSubmitForFeedback(s.id, s.content)}
                    disabled={feedbackMutation.isPending}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#008090] to-[#006d7a] text-white text-sm rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-sm"
                  >
                    <span className="material-icons text-[18px]">auto_awesome</span>
                    {feedbackMutation.isPending ? "Analyzing your writing..." : "Get AI Feedback"}
                  </button>
                )}
              </div>
              {fb && (
                <div className="space-y-4">
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold text-[#008090]">{fb.score}</div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-wider">Overall Score</div>
                    </div>
                    <ScoreBar label="Grammar" score={fb.grammar.score} color="#3b82f6" />
                    <ScoreBar label="Vocabulary" score={fb.vocabulary.score} color="#8b5cf6" />
                    <ScoreBar label="Coherence" score={fb.coherence.score} color="#10b981" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Feedback</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{fb.overallFeedback}</p>
                  </div>
                  {fb.highlights.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-1">
                        <span className="material-icons text-[16px]">thumb_up</span> Strengths
                      </h3>
                      <ul className="space-y-1">{fb.highlights.map((h, i) => <li key={i} className="text-xs text-green-700">• {h}</li>)}</ul>
                    </div>
                  )}
                  {fb.suggestions.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-1">
                        <span className="material-icons text-[16px]">lightbulb</span> Suggestions
                      </h3>
                      <ul className="space-y-1">{fb.suggestions.map((s, i) => <li key={i} className="text-xs text-amber-700">• {s}</li>)}</ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </DashboardLayout>
    );
  }

  /* ─── EDITOR VIEW ─── */
  if (view === "editor") {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto px-4 py-6">
          <button onClick={resetEditor} className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#008090] mb-4 transition-colors">
            <span className="material-icons text-[18px]">arrow_back</span> Back to Portfolio
          </button>
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{editingId ? "Edit Submission" : "New Writing Exercise"}</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <select value={language} onChange={(e) => setLanguage(e.target.value as any)} className="border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#008090]/30">
                <option value="fr">French</option>
                <option value="en">English</option>
              </select>
              <select value={cefrLevel} onChange={(e) => setCefrLevel(e.target.value)} className="border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#008090]/30">
                {CEFR_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title of your writing..."
              className="w-full border border-gray-200 rounded-lg p-3 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-[#008090]/30"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing here..."
              className="w-full border border-gray-200 rounded-lg p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#008090]/30 min-h-[300px] leading-relaxed"
            />
            <div className="flex items-center justify-between mt-4">
              <span className="text-[11px] text-gray-400">{content.trim().split(/\s+/).filter(Boolean).length} words</span>
              <div className="flex gap-2">
                <button onClick={resetEditor} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
                <button
                  onClick={handleSave}
                  disabled={!title.trim() || !content.trim() || createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 bg-[#008090] text-white text-sm rounded-lg hover:bg-[#006d7a] disabled:opacity-50 transition-colors"
                >
                  {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Draft"}
                </button>
              </div>
            </div>
          </div>

          {feedback && (
            <div className="mt-4 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="material-icons text-[#008090]">auto_awesome</span> AI Feedback
              </h3>
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-[#008090]">{feedback.score}</div>
                <div className="text-xs text-gray-400">Overall Score</div>
              </div>
              <p className="text-sm text-gray-700 mb-4">{feedback.overallFeedback}</p>
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  /* ─── LIST VIEW ─── */
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Writing Portfolio</h1>
            <p className="text-sm text-gray-500 mt-1">Practice writing and get AI-powered feedback</p>
          </div>
          <button onClick={() => openEditor()} className="flex items-center gap-2 px-4 py-2 bg-[#008090] text-white text-sm rounded-lg hover:bg-[#006d7a] transition-colors shadow-sm">
            <span className="material-icons text-[18px]">edit_note</span> New Writing
          </button>
        </div>

        {/* Writing Prompts */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Writing Prompts by Level</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {WRITING_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => openEditor(prompt)}
                className="text-left bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-[#008090]/30 transition-all"
              >
                <span className="px-2 py-0.5 bg-[#008090]/10 text-[#008090] rounded-full text-[10px] font-semibold">{prompt.level}</span>
                <p className="text-xs text-gray-700 mt-2 line-clamp-2">{language === "fr" ? prompt.fr : prompt.en}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Submissions List */}
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Your Submissions</h2>
        {submissions.isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : (submissions.data || []).length === 0 ? (
          <div className="text-center py-12">
            <span className="material-icons text-gray-300 text-5xl mb-3">edit_note</span>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No submissions yet</h3>
            <p className="text-sm text-gray-400">Start with a writing prompt above or create a free-form exercise</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(submissions.data || []).map((s) => (
              <button
                key={s.id}
                onClick={() => openDetail(s.id)}
                className="w-full text-left bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-[#008090]/30 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{s.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(s.status)}`}>{s.status}</span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1">{s.content.slice(0, 120)}...</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                      {s.cefrLevel && <span className="px-1.5 py-0.5 bg-[#008090]/10 text-[#008090] rounded-full font-medium">{s.cefrLevel}</span>}
                      <span>{s.wordCount} words</span>
                      <span>{new Date(s.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {s.aiScore !== null && (
                    <div className="text-center ml-4">
                      <div className="text-xl font-bold text-[#008090]">{s.aiScore}</div>
                      <div className="text-[9px] text-gray-400">Score</div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
