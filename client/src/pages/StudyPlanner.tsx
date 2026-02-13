/**
 * Study Planner — Calendar-based study session scheduling
 * Sprint 19: Study Planner & Calendar
 */
import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import Sidebar from "@/components/Sidebar";
import { getLoginUrl } from "@/const";

const SESSION_TYPES = [
  { id: "lesson", label: "Lesson", icon: "menu_book", color: "#008090" },
  { id: "quiz", label: "Quiz", icon: "quiz", color: "#8b5cf6" },
  { id: "sle_practice", label: "SLE Practice", icon: "verified", color: "#f59e0b" },
  { id: "flashcard_review", label: "Flashcard Review", icon: "style", color: "#3b82f6" },
  { id: "tutoring", label: "Tutoring", icon: "groups", color: "#22c55e" },
  { id: "custom", label: "Custom", icon: "event", color: "#6b7280" },
] as const;

function getSessionType(id: string) {
  return SESSION_TYPES.find(s => s.id === id) ?? SESSION_TYPES[5];
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function StudyPlanner() {
  const { user, loading: authLoading } = useAuth();
  const [collapsed, setCollapsed] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Calendar state
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formType, setFormType] = useState<string>("custom");
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formDuration, setFormDuration] = useState(30);
  const [editingId, setEditingId] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const { data: sessions = [], isLoading } = trpc.studyPlanner.list.useQuery();
  const { data: upcoming = [] } = trpc.studyPlanner.upcoming.useQuery();
  const createSession = trpc.studyPlanner.create.useMutation({
    onSuccess: () => { utils.studyPlanner.list.invalidate(); utils.studyPlanner.upcoming.invalidate(); resetForm(); },
  });
  const updateSession = trpc.studyPlanner.update.useMutation({
    onSuccess: () => { utils.studyPlanner.list.invalidate(); utils.studyPlanner.upcoming.invalidate(); resetForm(); },
  });
  const deleteSession = trpc.studyPlanner.delete.useMutation({
    onSuccess: () => { utils.studyPlanner.list.invalidate(); utils.studyPlanner.upcoming.invalidate(); },
  });
  const toggleComplete = trpc.studyPlanner.update.useMutation({
    onSuccess: () => { utils.studyPlanner.list.invalidate(); utils.studyPlanner.upcoming.invalidate(); },
  });

  function resetForm() {
    setFormTitle(""); setFormDesc(""); setFormType("custom"); setFormDate(""); setFormTime(""); setFormDuration(30);
    setShowForm(false); setEditingId(null);
  }

  function openNewSession(date?: string) {
    resetForm();
    if (date) setFormDate(date);
    setShowForm(true);
  }

  function handleSave() {
    if (!formTitle.trim() || !formDate) return;
    if (editingId) {
      updateSession.mutate({
        sessionId: editingId, title: formTitle, description: formDesc || undefined,
        scheduledDate: formDate, scheduledTime: formTime || undefined, durationMinutes: formDuration,
      });
    } else {
      createSession.mutate({
        title: formTitle, description: formDesc || undefined,
        sessionType: formType as any, scheduledDate: formDate,
        scheduledTime: formTime || undefined, durationMinutes: formDuration,
      });
    }
  }

  function handleEdit(session: typeof sessions[0]) {
    setEditingId(session.id);
    setFormTitle(session.title);
    setFormDesc(session.description ?? "");
    setFormType(session.sessionType);
    setFormDate(session.scheduledDate);
    setFormTime(session.scheduledTime ?? "");
    setFormDuration(session.durationMinutes);
    setShowForm(true);
  }

  // Build calendar data
  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);
  const todayStr = today.toISOString().slice(0, 10);

  // Map sessions to dates
  const sessionsByDate = useMemo(() => {
    const map: Record<string, typeof sessions> = {};
    sessions.forEach(s => {
      if (!map[s.scheduledDate]) map[s.scheduledDate] = [];
      map[s.scheduledDate].push(s);
    });
    return map;
  }, [sessions]);

  // Sessions for selected date
  const selectedDateSessions = selectedDate ? (sessionsByDate[selectedDate] ?? []) : [];

  function prevMonth() {
    if (calMonth === 0) { setCalYear(calYear - 1); setCalMonth(11); }
    else setCalMonth(calMonth - 1);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalYear(calYear + 1); setCalMonth(0); }
    else setCalMonth(calMonth + 1);
  }

  if (authLoading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin w-8 h-8 border-2 border-[#008090] border-t-transparent rounded-full" /></div>;
  if (!user) { window.location.href = getLoginUrl(); return null; }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className="flex-1 lg:ml-[240px] overflow-y-auto">
        <div className="lg:hidden flex items-center gap-3 p-4 bg-white border-b border-gray-200 sticky top-0 z-30">
          <button onClick={() => setCollapsed(!collapsed)} className="p-2 rounded-lg hover:bg-gray-100">
            <span className="material-icons text-gray-600">menu</span>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Study Planner</h1>
        </div>

        <div className="max-w-6xl mx-auto p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="material-icons text-[#008090]">event_note</span>
                Study Planner
              </h1>
              <p className="text-sm text-gray-500 mt-1">{sessions.length} sessions planned · {upcoming.length} upcoming</p>
            </div>
            <button onClick={() => openNewSession()} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 hover:shadow-md" style={{ background: "#008090" }}>
              <span className="material-icons text-base">add</span>
              New Session
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {/* Calendar header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100">
                    <span className="material-icons text-gray-500">chevron_left</span>
                  </button>
                  <h2 className="text-base font-bold text-gray-900">{MONTHS[calMonth]} {calYear}</h2>
                  <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100">
                    <span className="material-icons text-gray-500">chevron_right</span>
                  </button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 border-b border-gray-50">
                  {DAYS.map(d => (
                    <div key={d} className="py-2 text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{d}</div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7">
                  {/* Empty cells before first day */}
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-20 border-b border-r border-gray-50 bg-gray-50/50" />
                  ))}

                  {/* Day cells */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const isToday = dateStr === todayStr;
                    const isSelected = dateStr === selectedDate;
                    const daySessions = sessionsByDate[dateStr] ?? [];
                    const hasCompleted = daySessions.some(s => s.isCompleted);
                    const hasPending = daySessions.some(s => !s.isCompleted);

                    return (
                      <div
                        key={day}
                        className={`h-20 border-b border-r border-gray-50 p-1.5 cursor-pointer transition-all hover:bg-[#008090]/5 ${isSelected ? "bg-[#008090]/10 ring-1 ring-[#008090]/30" : ""}`}
                        onClick={() => setSelectedDate(dateStr)}
                        onDoubleClick={() => openNewSession(dateStr)}
                      >
                        <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? "bg-[#008090] text-white" : "text-gray-700"}`}>
                          {day}
                        </div>
                        {daySessions.length > 0 && (
                          <div className="flex gap-0.5 flex-wrap">
                            {daySessions.slice(0, 3).map(s => {
                              const st = getSessionType(s.sessionType);
                              return (
                                <div key={s.id} className={`w-1.5 h-1.5 rounded-full ${s.isCompleted ? "opacity-40" : ""}`} style={{ background: st.color }} title={s.title} />
                              );
                            })}
                            {daySessions.length > 3 && (
                              <span className="text-[8px] text-gray-400">+{daySessions.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right panel: Selected date or upcoming */}
            <div className="space-y-4">
              {/* Selected date sessions */}
              {selectedDate && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-900">
                      {new Date(selectedDate + "T12:00:00").toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
                    </h3>
                    <button onClick={() => openNewSession(selectedDate)} className="p-1.5 rounded-lg hover:bg-gray-100" title="Add session">
                      <span className="material-icons text-[#008090] text-lg">add</span>
                    </button>
                  </div>
                  {selectedDateSessions.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">No sessions planned</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedDateSessions.map(session => {
                        const st = getSessionType(session.sessionType);
                        return (
                          <div key={session.id} className={`p-3 rounded-xl border border-gray-100 ${session.isCompleted ? "opacity-60" : ""} group hover:shadow-sm transition-all`}>
                            <div className="flex items-start gap-3">
                              <button
                                onClick={() => toggleComplete.mutate({ sessionId: session.id, isCompleted: !session.isCompleted })}
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${session.isCompleted ? "border-green-500 bg-green-500" : "border-gray-300 hover:border-[#008090]"}`}
                              >
                                {session.isCompleted && <span className="material-icons text-white text-xs">check</span>}
                              </button>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="material-icons text-xs" style={{ color: st.color }}>{st.icon}</span>
                                  <span className={`text-xs font-semibold ${session.isCompleted ? "line-through text-gray-400" : "text-gray-900"}`}>{session.title}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                  {session.scheduledTime && <span>{session.scheduledTime}</span>}
                                  <span>{session.durationMinutes}min</span>
                                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-medium" style={{ background: st.color + "15", color: st.color }}>{st.label}</span>
                                </div>
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(session)} className="p-1 rounded hover:bg-gray-100">
                                  <span className="material-icons text-xs text-gray-400">edit</span>
                                </button>
                                <button onClick={() => { if (confirm("Delete?")) deleteSession.mutate({ sessionId: session.id }); }} className="p-1 rounded hover:bg-gray-100">
                                  <span className="material-icons text-xs text-red-400">delete</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Upcoming sessions */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="material-icons text-[#008090] text-base">upcoming</span>
                  Upcoming (7 days)
                </h3>
                {upcoming.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">No upcoming sessions</p>
                ) : (
                  <div className="space-y-2">
                    {upcoming.map(session => {
                      const st = getSessionType(session.sessionType);
                      const dateLabel = new Date(session.scheduledDate + "T12:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
                      return (
                        <div key={session.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-all">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: st.color + "15" }}>
                            <span className="material-icons text-sm" style={{ color: st.color }}>{st.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 truncate">{session.title}</p>
                            <p className="text-[10px] text-gray-400">{dateLabel} {session.scheduledTime ? `at ${session.scheduledTime}` : ""}</p>
                          </div>
                          <span className="text-[10px] text-gray-400">{session.durationMinutes}m</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Quick stats */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-3">This Month</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 rounded-xl bg-gray-50">
                    <div className="text-xl font-bold text-gray-900">{sessions.filter(s => s.scheduledDate.startsWith(`${calYear}-${String(calMonth + 1).padStart(2, "0")}`)).length}</div>
                    <div className="text-[10px] text-gray-500">Planned</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-green-50">
                    <div className="text-xl font-bold text-green-600">{sessions.filter(s => s.scheduledDate.startsWith(`${calYear}-${String(calMonth + 1).padStart(2, "0")}`) && s.isCompleted).length}</div>
                    <div className="text-[10px] text-gray-500">Completed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Session Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={resetForm}>
              <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-lg font-bold text-gray-900 mb-4">{editingId ? "Edit Session" : "New Study Session"}</h2>

                <input type="text" placeholder="Session title..." value={formTitle} onChange={e => setFormTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-[#008090]/20 focus:border-[#008090]" />

                <textarea placeholder="Description (optional)..." value={formDesc} onChange={e => setFormDesc(e.target.value)} rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-[#008090]/20 resize-none" />

                {/* Type selector */}
                <div className="mb-3">
                  <label className="text-xs font-medium text-gray-500 mb-2 block">Session Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {SESSION_TYPES.map(st => (
                      <button key={st.id} onClick={() => setFormType(st.id)}
                        className={`p-2 rounded-xl border text-center transition-all ${formType === st.id ? "border-[#008090] bg-[#008090]/5" : "border-gray-200 hover:border-gray-300"}`}>
                        <span className="material-icons text-base block mb-0.5" style={{ color: st.color }}>{st.icon}</span>
                        <span className="text-[10px] text-gray-600 font-medium">{st.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Date</label>
                    <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#008090]/20" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Time (optional)</label>
                    <input type="time" value={formTime} onChange={e => setFormTime(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#008090]/20" />
                  </div>
                </div>

                {/* Duration */}
                <div className="mb-4">
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Duration: {formDuration} minutes</label>
                  <input type="range" min={5} max={180} step={5} value={formDuration} onChange={e => setFormDuration(Number(e.target.value))}
                    className="w-full accent-[#008090]" />
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>5 min</span><span>3 hours</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button onClick={resetForm} className="px-4 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
                  <button onClick={handleSave}
                    disabled={!formTitle.trim() || !formDate || createSession.isPending || updateSession.isPending}
                    className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50" style={{ background: "#008090" }}>
                    {createSession.isPending || updateSession.isPending ? "Saving..." : editingId ? "Update" : "Create"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
