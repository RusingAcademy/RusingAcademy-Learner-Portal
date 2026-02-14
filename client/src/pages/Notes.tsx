/**
 * Notes Page — Study notes with rich text, tagging, search, and pinning
 * Sprint 17: Notes & Flashcards
 */
import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import Sidebar from "@/components/Sidebar";
import { getLoginUrl } from "@/const";

const NOTE_COLORS: { id: string; label: string; bg: string; border: string }[] = [
  { id: "default", label: "Default", bg: "bg-white", border: "border-gray-200" },
  { id: "teal", label: "Teal", bg: "bg-teal-50", border: "border-teal-200" },
  { id: "blue", label: "Blue", bg: "bg-blue-50", border: "border-blue-200" },
  { id: "amber", label: "Amber", bg: "bg-amber-50", border: "border-amber-200" },
  { id: "rose", label: "Rose", bg: "bg-rose-50", border: "border-rose-200" },
  { id: "purple", label: "Purple", bg: "bg-purple-50", border: "border-purple-200" },
  { id: "green", label: "Green", bg: "bg-green-50", border: "border-green-200" },
];

function getColorClasses(colorId: string) {
  return NOTE_COLORS.find(c => c.id === colorId) ?? NOTE_COLORS[0];
}

export default function Notes() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [collapsed, setCollapsed] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState<number | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [noteColor, setNoteColor] = useState("default");

  const utils = trpc.useUtils();
  const { data: notes = [], isLoading } = trpc.notes.list.useQuery();
  const createNote = trpc.notes.create.useMutation({
    onSuccess: () => { utils.notes.list.invalidate(); resetForm(); },
  });
  const updateNote = trpc.notes.update.useMutation({
    onSuccess: () => { utils.notes.list.invalidate(); resetForm(); },
  });
  const deleteNote = trpc.notes.delete.useMutation({
    onSuccess: () => utils.notes.list.invalidate(),
  });
  const togglePin = trpc.notes.update.useMutation({
    onSuccess: () => utils.notes.list.invalidate(),
  });

  function resetForm() {
    setTitle(""); setContent(""); setTags([]); setTagInput(""); setNoteColor("default");
    setShowEditor(false); setEditingNote(null);
  }

  function handleAddTag() {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput("");
  }

  function handleRemoveTag(tag: string) {
    setTags(tags.filter(t => t !== tag));
  }

  function handleEdit(note: typeof notes[0]) {
    setEditingNote(note.id);
    setTitle(note.title);
    setContent(note.content);
    setTags((note.tags as string[]) ?? []);
    setNoteColor(note.color);
    setShowEditor(true);
  }

  function handleSave() {
    if (!title.trim() || !content.trim()) return;
    if (editingNote) {
      updateNote.mutate({ noteId: editingNote, title, content, tags, color: noteColor });
    } else {
      createNote.mutate({ title, content, tags, color: noteColor });
    }
  }

  // Collect all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach(n => ((n.tags as string[]) ?? []).forEach(t => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [notes]);

  // Filter notes
  const filteredNotes = useMemo(() => {
    return notes.filter(n => {
      const matchesSearch = !searchQuery ||
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = !selectedTag || ((n.tags as string[]) ?? []).includes(selectedTag);
      return matchesSearch && matchesTag;
    });
  }, [notes, searchQuery, selectedTag]);

  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const unpinnedNotes = filteredNotes.filter(n => !n.isPinned);

  if (authLoading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin w-8 h-8 border-2 border-[#008090] border-t-transparent rounded-full" /></div>;
  if (!user) { window.location.href = getLoginUrl(); return null; }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className="flex-1 lg:ml-[240px] overflow-y-auto">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 p-4 bg-white border-b border-gray-200 sticky top-0 z-30">
          <button onClick={() => setCollapsed(!collapsed)} className="p-2 rounded-lg hover:bg-gray-100">
            <span className="material-icons text-gray-600">menu</span>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Study Notes</h1>
        </div>

        <div className="max-w-6xl mx-auto p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="material-icons text-[#008090]">note_alt</span>
                Study Notes
              </h1>
              <p className="text-sm text-gray-500 mt-1">{notes.length} notes total</p>
            </div>
            <button
              onClick={() => { resetForm(); setShowEditor(true); }}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 transition-all hover:shadow-md"
              style={{ background: "#008090" }}
            >
              <span className="material-icons text-base">add</span>
              New Note
            </button>
          </div>

          {/* Search & Tags */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#008090]/20 focus:border-[#008090]"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${!selectedTag ? "bg-[#008090] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                All
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedTag === tag ? "bg-[#008090] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Editor Modal */}
          {showEditor && (
            <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => resetForm()}>
              <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">
                      {editingNote ? "Edit Note" : "New Note"}
                    </h2>
                    <button onClick={resetForm} className="p-1.5 rounded-lg hover:bg-gray-100">
                      <span className="material-icons text-gray-400">close</span>
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Note title..."
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 font-medium text-base mb-3 focus:outline-none focus:ring-2 focus:ring-[#008090]/20 focus:border-[#008090]"
                  />

                  <textarea
                    placeholder="Write your notes here... (Markdown supported)"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    rows={10}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-[#008090]/20 focus:border-[#008090] resize-none font-mono"
                  />

                  {/* Tags */}
                  <div className="mb-3">
                    <div className="flex gap-2 flex-wrap mb-2">
                      {tags.map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#008090]/10 text-[#008090] text-xs font-medium">
                          #{tag}
                          <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-500">
                            <span className="material-icons text-xs">close</span>
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add tag..."
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(); } }}
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#008090]/20"
                      />
                      <button onClick={handleAddTag} className="px-3 py-2 rounded-lg bg-gray-100 text-gray-600 text-sm hover:bg-gray-200">
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Color picker */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs text-gray-500 font-medium">Color:</span>
                    {NOTE_COLORS.map(c => (
                      <button
                        key={c.id}
                        onClick={() => setNoteColor(c.id)}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${c.bg} ${noteColor === c.id ? "border-[#008090] ring-2 ring-[#008090]/20" : "border-gray-300"}`}
                        title={c.label}
                      />
                    ))}
                  </div>

                  <div className="flex justify-end gap-3">
                    <button onClick={resetForm} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100">
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={!title.trim() || !content.trim() || createNote.isPending || updateNote.isPending}
                      className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all hover:shadow-md"
                      style={{ background: "#008090" }}
                    >
                      {createNote.isPending || updateNote.isPending ? "Saving..." : editingNote ? "Update" : "Save"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="h-48 rounded-2xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-16">
              <span className="material-icons text-6xl text-gray-300 mb-4 block">note_alt</span>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No notes yet</h3>
              <p className="text-sm text-gray-500 mb-4">Create your first study note to get started!</p>
              <button
                onClick={() => { resetForm(); setShowEditor(true); }}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: "#008090" }}
              >
                Create Note
              </button>
            </div>
          ) : (
            <>
              {/* Pinned Notes */}
              {pinnedNotes.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                    <span className="material-icons text-sm">push_pin</span> Pinned
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pinnedNotes.map(note => <NoteCard key={note.id} note={note} onEdit={handleEdit} onDelete={(id) => deleteNote.mutate({ noteId: id })} onTogglePin={(id, pinned) => togglePin.mutate({ noteId: id, isPinned: !pinned })} />)}
                  </div>
                </div>
              )}

              {/* Other Notes */}
              {unpinnedNotes.length > 0 && (
                <div>
                  {pinnedNotes.length > 0 && (
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Other Notes</h3>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {unpinnedNotes.map(note => <NoteCard key={note.id} note={note} onEdit={handleEdit} onDelete={(id) => deleteNote.mutate({ noteId: id })} onTogglePin={(id, pinned) => togglePin.mutate({ noteId: id, isPinned: !pinned })} />)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function NoteCard({ note, onEdit, onDelete, onTogglePin }: {
  note: { id: number; title: string; content: string; tags: unknown; color: string; isPinned: boolean; createdAt: Date; updatedAt: Date };
  onEdit: (note: any) => void;
  onDelete: (id: number) => void;
  onTogglePin: (id: number, isPinned: boolean) => void;
}) {
  const colorClasses = getColorClasses(note.color);
  const noteTags = (note.tags as string[]) ?? [];
  const preview = note.content.length > 150 ? note.content.slice(0, 150) + "..." : note.content;
  const dateStr = new Date(note.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" });

  return (
    <div className={`${colorClasses.bg} border ${colorClasses.border} rounded-2xl p-5 transition-all hover:shadow-md group relative`}>
      {/* Actions */}
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onTogglePin(note.id, note.isPinned)} className="p-1.5 rounded-lg hover:bg-white/80" title={note.isPinned ? "Unpin" : "Pin"}>
          <span className={`material-icons text-sm ${note.isPinned ? "text-[#008090]" : "text-gray-400"}`}>push_pin</span>
        </button>
        <button onClick={() => onEdit(note)} className="p-1.5 rounded-lg hover:bg-white/80" title="Edit">
          <span className="material-icons text-sm text-gray-400">edit</span>
        </button>
        <button onClick={() => { if (confirm("Delete this note?")) onDelete(note.id); }} className="p-1.5 rounded-lg hover:bg-white/80" title="Delete">
          <span className="material-icons text-sm text-red-400">delete</span>
        </button>
      </div>

      {note.isPinned && (
        <span className="material-icons text-xs text-[#008090] absolute top-3 left-4">push_pin</span>
      )}

      <h3 className="text-sm font-bold text-gray-900 mb-2 pr-16 mt-1">{note.title}</h3>
      <p className="text-xs text-gray-600 leading-relaxed mb-3 whitespace-pre-wrap">{preview}</p>

      {/* Tags */}
      {noteTags.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mb-3">
          {noteTags.map(tag => (
            <span key={tag} className="px-2 py-0.5 rounded-full bg-[#008090]/10 text-[#008090] text-[10px] font-medium">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="text-[10px] text-gray-400">{dateStr}</div>
    </div>
  );
}
