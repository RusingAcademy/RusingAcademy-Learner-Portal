/**
 * Discussion Boards — Community peer learning with real threads
 */
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useMemo } from "react";
import { toast } from "sonner";

const CATEGORIES = [
  { id: "all", label: "All Topics", icon: "forum", color: "#008090" },
  { id: "grammar", label: "Grammar", icon: "spellcheck", color: "#3b82f6" },
  { id: "vocabulary", label: "Vocabulary", icon: "translate", color: "#8b5cf6" },
  { id: "sle_prep", label: "SLE Prep", icon: "quiz", color: "#f59e0b" },
  { id: "study_tips", label: "Study Tips", icon: "lightbulb", color: "#10b981" },
  { id: "resources", label: "Resources", icon: "library_books", color: "#ef4444" },
  { id: "general", label: "General", icon: "chat", color: "#6b7280" },
];

export default function DiscussionBoards() {
  const { user } = useAuth();

  const [category, setCategory] = useState("all");
  const [showNewThread, setShowNewThread] = useState(false);
  const [selectedThread, setSelectedThread] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("general");
  const [replyContent, setReplyContent] = useState("");

  const threads = trpc.discussions.getThreads.useQuery({ category: category === "all" ? undefined : category });
  const thread = trpc.discussions.getThread.useQuery({ threadId: selectedThread! }, { enabled: !!selectedThread });
  const replies = trpc.discussions.getReplies.useQuery({ threadId: selectedThread! }, { enabled: !!selectedThread });
  const utils = trpc.useUtils();

  const createThread = trpc.discussions.createThread.useMutation({
    onSuccess: () => {
      utils.discussions.getThreads.invalidate();
      setShowNewThread(false);
      setNewTitle("");
      setNewContent("");
      toast.success("Thread created!");
    },
  });

  const createReply = trpc.discussions.createReply.useMutation({
    onSuccess: () => {
      utils.discussions.getReplies.invalidate();
      utils.discussions.getThread.invalidate();
      setReplyContent("");
      toast.success("Reply posted!");
    },
  });

  const deleteThread = trpc.discussions.deleteThread.useMutation({
    onSuccess: () => {
      utils.discussions.getThreads.invalidate();
      setSelectedThread(null);
      toast.success("Thread deleted");
    },
  });

  const getCategoryInfo = (cat: string) => CATEGORIES.find(c => c.id === cat) || CATEGORIES[6];

  if (selectedThread) {
    const t = thread.data;
    const r = replies.data || [];
    const catInfo = getCategoryInfo(t?.category || "general");
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button onClick={() => setSelectedThread(null)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#008090] mb-4 transition-colors">
            <span className="material-icons text-[18px]">arrow_back</span> Back to Discussions
          </button>
          {thread.isLoading ? (
            <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
          ) : t ? (
            <>
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium text-white" style={{ background: catInfo.color }}>{catInfo.label}</span>
                    <span className="text-[10px] text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                  {user && t.userId === user.id && (
                    <button onClick={() => { if (confirm("Delete this thread?")) deleteThread.mutate({ threadId: t.id }); }} className="text-gray-400 hover:text-red-500">
                      <span className="material-icons text-[18px]">delete</span>
                    </button>
                  )}
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-3">{t.title}</h1>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{t.content}</p>
                <div className="flex items-center gap-4 mt-4 text-[11px] text-gray-400">
                  <span className="flex items-center gap-1"><span className="material-icons text-[14px]">visibility</span>{t.viewCount} views</span>
                  <span className="flex items-center gap-1"><span className="material-icons text-[14px]">chat_bubble</span>{t.replyCount} replies</span>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                {r.map((reply) => (
                  <div key={reply.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full bg-[#008090]/10 flex items-center justify-center">
                        <span className="material-icons text-[#008090] text-[14px]">person</span>
                      </div>
                      <span className="text-[11px] text-gray-500">User #{reply.userId}</span>
                      <span className="text-[10px] text-gray-400">{new Date(reply.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                  </div>
                ))}
                {r.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">No replies yet. Be the first to respond!</div>
                )}
              </div>

              {user && (
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write your reply..."
                    className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#008090]/30 min-h-[80px]"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => createReply.mutate({ threadId: selectedThread, content: replyContent })}
                      disabled={!replyContent.trim() || createReply.isPending}
                      className="px-4 py-2 bg-[#008090] text-white text-sm rounded-lg hover:bg-[#006d7a] disabled:opacity-50 transition-colors"
                    >
                      {createReply.isPending ? "Posting..." : "Post Reply"}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-gray-400">Thread not found</div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Discussion Boards</h1>
            <p className="text-sm text-gray-500 mt-1">Connect with fellow learners and share your journey</p>
          </div>
          {user && (
            <button onClick={() => setShowNewThread(true)} className="flex items-center gap-2 px-4 py-2 bg-[#008090] text-white text-sm rounded-lg hover:bg-[#006d7a] transition-colors shadow-sm">
              <span className="material-icons text-[18px]">add</span> New Thread
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                category === cat.id
                  ? "text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              style={category === cat.id ? { background: cat.color } : {}}
            >
              <span className="material-icons text-[14px]">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* New Thread Modal */}
        {showNewThread && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">New Discussion</h2>
                <button onClick={() => setShowNewThread(false)} className="text-gray-400 hover:text-gray-600">
                  <span className="material-icons">close</span>
                </button>
              </div>
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Thread title..."
                className="w-full border border-gray-200 rounded-lg p-3 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-[#008090]/30"
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full border border-gray-200 rounded-lg p-3 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-[#008090]/30"
              >
                {CATEGORIES.filter(c => c.id !== "all").map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Share your thoughts, questions, or insights..."
                className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#008090]/30 min-h-[120px]"
              />
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setShowNewThread(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
                <button
                  onClick={() => createThread.mutate({ title: newTitle, content: newContent, category: newCategory as any })}
                  disabled={!newTitle.trim() || !newContent.trim() || createThread.isPending}
                  className="px-4 py-2 bg-[#008090] text-white text-sm rounded-lg hover:bg-[#006d7a] disabled:opacity-50 transition-colors"
                >
                  {createThread.isPending ? "Creating..." : "Post Thread"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Thread List */}
        {threads.isLoading ? (
          <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : (threads.data || []).length === 0 ? (
          <div className="text-center py-16">
            <span className="material-icons text-gray-300 text-5xl mb-3">forum</span>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No discussions yet</h3>
            <p className="text-sm text-gray-400">Start the conversation by creating the first thread!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(threads.data || []).map((t) => {
              const catInfo = getCategoryInfo(t.category);
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedThread(t.id)}
                  className="w-full text-left bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-[#008090]/30 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: catInfo.color + "15" }}>
                      <span className="material-icons text-lg" style={{ color: catInfo.color }}>{catInfo.icon}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {t.isPinned && <span className="material-icons text-[#f59e0b] text-[14px]">push_pin</span>}
                        <h3 className="text-sm font-semibold text-gray-900 truncate">{t.title}</h3>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2">{t.content}</p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-medium" style={{ background: catInfo.color + "15", color: catInfo.color }}>{catInfo.label}</span>
                        <span className="flex items-center gap-0.5"><span className="material-icons text-[12px]">chat_bubble</span>{t.replyCount}</span>
                        <span className="flex items-center gap-0.5"><span className="material-icons text-[12px]">visibility</span>{t.viewCount}</span>
                        <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
