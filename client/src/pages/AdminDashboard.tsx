/**
 * RusingÂcademy Admin Dashboard
 * Role-based admin panel with analytics, user management, challenge CRUD, and announcements.
 * Only accessible to users with role === "admin".
 */
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

type Tab = "overview" | "users" | "challenges" | "announcements";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  if (!user || user.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <span className="material-icons text-red-400" style={{ fontSize: "32px" }}>lock</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-sm text-gray-500">You need admin privileges to access this page.</p>
        </div>
      </DashboardLayout>
    );
  }

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "overview", label: "Analytics", icon: "analytics" },
    { key: "users", label: "Users", icon: "people" },
    { key: "challenges", label: "Challenges", icon: "flag" },
    { key: "announcements", label: "Announcements", icon: "campaign" },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-[1200px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Admin Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage users, content, and monitor platform analytics</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#008090]/10 text-[#008090] text-xs font-semibold">
            <span className="material-icons" style={{ fontSize: "14px" }}>admin_panel_settings</span>
            Admin
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-white text-[#008090] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="material-icons" style={{ fontSize: "16px" }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "users" && <UsersTab />}
        {activeTab === "challenges" && <ChallengesTab />}
        {activeTab === "announcements" && <AnnouncementsTab />}
      </div>
    </DashboardLayout>
  );
}

/* ─────────────── OVERVIEW TAB ─────────────── */
function OverviewTab() {
  const { data: overview, isLoading } = trpc.admin.overview.useQuery();
  const { data: recentSignups } = trpc.admin.recentSignups.useQuery({ limit: 5 });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 animate-pulse">
            <div className="h-3 bg-gray-100 rounded w-1/2 mb-3" />
            <div className="h-8 bg-gray-100 rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    { label: "Total Users", value: overview?.totalUsers ?? 0, icon: "people", color: "#008090" },
    { label: "Active (7d)", value: overview?.activeUsersLast7Days ?? 0, icon: "person_pin", color: "#27ae60" },
    { label: "New Signups (7d)", value: overview?.recentSignups ?? 0, icon: "person_add", color: "#3498db" },
    { label: "Lessons Done", value: overview?.totalLessonsCompleted ?? 0, icon: "school", color: "#f5a623" },
    { label: "Quiz Attempts", value: overview?.totalQuizAttempts ?? 0, icon: "quiz", color: "#e74c3c" },
    { label: "Avg Quiz Score", value: `${overview?.averageQuizScore ?? 0}%`, icon: "grade", color: "#9b59b6" },
    { label: "Perfect Quizzes", value: overview?.perfectQuizCount ?? 0, icon: "emoji_events", color: "#f59e0b" },
    { label: "Enrollments", value: overview?.totalEnrollments ?? 0, icon: "how_to_reg", color: "#008090" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}12` }}>
                <span className="material-icons" style={{ fontSize: "18px", color: stat.color }}>{stat.icon}</span>
              </div>
              <span className="text-xs text-gray-500 font-medium">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Signups */}
      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="material-icons text-[#008090]" style={{ fontSize: "18px" }}>person_add</span>
          Recent Signups
        </h3>
        {recentSignups && recentSignups.length > 0 ? (
          <div className="space-y-3">
            {recentSignups.map((u) => (
              <div key={u.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#008090]/10 flex items-center justify-center text-[#008090] font-bold text-xs">
                    {(u.name ?? "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{u.name ?? "Unknown"}</p>
                    <p className="text-[10px] text-gray-400">{u.email ?? "No email"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    u.role === "admin" ? "bg-purple-50 text-purple-600" : "bg-gray-100 text-gray-500"
                  }`}>{u.role}</span>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-CA") : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No recent signups</p>
        )}
      </div>
    </div>
  );
}

/* ─────────────── USERS TAB ─────────────── */
function UsersTab() {
  const { data: allUsers, isLoading } = trpc.admin.users.useQuery({ limit: 200 });
  const updateRole = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => {
      toast.success("User role updated");
      utils.admin.users.invalidate();
    },
    onError: () => toast.error("Failed to update role"),
  });
  const utils = trpc.useUtils();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");

  const filtered = (allUsers ?? []).filter((u) => {
    const matchSearch = !search || (u.name ?? "").toLowerCase().includes(search.toLowerCase()) || (u.email ?? "").toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-[320px]">
          <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" style={{ fontSize: "18px" }}>search</span>
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008090]/20 focus:border-[#008090]/40 bg-white"
          />
        </div>
        <div className="flex gap-1">
          {(["all", "admin", "user"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                roleFilter === r ? "bg-[#008090] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-[#008090]/30"
              }`}
            >
              {r === "all" ? "All" : r.charAt(0).toUpperCase() + r.slice(1)}s
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-400 ml-auto">{filtered.length} users</span>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-gray-400">Loading users...</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">User</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Email</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Role</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Last Active</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#008090]/10 flex items-center justify-center text-[#008090] font-bold text-xs">
                        {(u.name ?? "?").charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{u.name ?? "Unknown"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{u.email ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      u.role === "admin" ? "bg-purple-50 text-purple-600" : "bg-gray-100 text-gray-500"
                    }`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {u.lastSignedIn ? new Date(u.lastSignedIn).toLocaleDateString("en-CA") : "Never"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        const newRole = u.role === "admin" ? "user" : "admin";
                        if (confirm(`Change ${u.name ?? "this user"}'s role to ${newRole}?`)) {
                          updateRole.mutate({ userId: u.id, role: newRole });
                        }
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-lg border border-gray-200 text-gray-600 hover:border-[#008090]/30 hover:text-[#008090] transition-all"
                    >
                      {u.role === "admin" ? "Demote" : "Promote"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ─────────────── CHALLENGES TAB ─────────────── */
function ChallengesTab() {
  const { data: challenges, isLoading } = trpc.admin.challenges.useQuery();
  const createChallenge = trpc.admin.createChallenge.useMutation({
    onSuccess: () => {
      toast.success("Challenge created!");
      utils.admin.challenges.invalidate();
      setShowForm(false);
    },
    onError: () => toast.error("Failed to create challenge"),
  });
  const updateChallenge = trpc.admin.updateChallenge.useMutation({
    onSuccess: () => {
      toast.success("Challenge updated");
      utils.admin.challenges.invalidate();
    },
  });
  const utils = trpc.useUtils();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "", titleFr: "", description: "", descriptionFr: "",
    challengeType: "complete_lessons" as "complete_lessons" | "earn_xp" | "perfect_quizzes" | "maintain_streak" | "complete_slots" | "study_time",
    targetValue: 5, xpReward: 200,
    weekStartDate: new Date().toISOString().split("T")[0],
    weekEndDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{(challenges ?? []).length} challenges</span>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#008090] text-white text-sm font-medium hover:bg-[#006d7a] transition-colors"
        >
          <span className="material-icons" style={{ fontSize: "16px" }}>{showForm ? "close" : "add"}</span>
          {showForm ? "Cancel" : "New Challenge"}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Create Weekly Challenge</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] text-gray-500 font-medium block mb-1">Title (EN)</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#008090]/20" placeholder="Complete 5 Lessons" />
            </div>
            <div>
              <label className="text-[11px] text-gray-500 font-medium block mb-1">Title (FR)</label>
              <input value={form.titleFr} onChange={(e) => setForm({ ...form, titleFr: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#008090]/20" placeholder="Compléter 5 leçons" />
            </div>
            <div>
              <label className="text-[11px] text-gray-500 font-medium block mb-1">Description (EN)</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#008090]/20" />
            </div>
            <div>
              <label className="text-[11px] text-gray-500 font-medium block mb-1">Description (FR)</label>
              <input value={form.descriptionFr} onChange={(e) => setForm({ ...form, descriptionFr: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#008090]/20" />
            </div>
            <div>
              <label className="text-[11px] text-gray-500 font-medium block mb-1">Type</label>
              <select value={form.challengeType} onChange={(e) => setForm({ ...form, challengeType: e.target.value as typeof form.challengeType })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#008090]/20 bg-white">
                <option value="complete_lessons">Complete Lessons</option>
                <option value="earn_xp">Earn XP</option>
                <option value="perfect_quizzes">Perfect Quizzes</option>
                <option value="maintain_streak">Maintain Streak</option>
                <option value="complete_slots">Complete Slots</option>
                <option value="study_time">Study Time</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-gray-500 font-medium block mb-1">Target</label>
                <input type="number" value={form.targetValue} onChange={(e) => setForm({ ...form, targetValue: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#008090]/20" />
              </div>
              <div>
                <label className="text-[11px] text-gray-500 font-medium block mb-1">XP Reward</label>
                <input type="number" value={form.xpReward} onChange={(e) => setForm({ ...form, xpReward: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#008090]/20" />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-gray-500 font-medium block mb-1">Start Date</label>
              <input type="date" value={form.weekStartDate} onChange={(e) => setForm({ ...form, weekStartDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#008090]/20" />
            </div>
            <div>
              <label className="text-[11px] text-gray-500 font-medium block mb-1">End Date</label>
              <input type="date" value={form.weekEndDate} onChange={(e) => setForm({ ...form, weekEndDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#008090]/20" />
            </div>
          </div>
          <button
            onClick={() => createChallenge.mutate(form)}
            disabled={!form.title || !form.titleFr || createChallenge.isPending}
            className="px-6 py-2.5 rounded-xl bg-[#008090] text-white text-sm font-medium hover:bg-[#006d7a] disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors"
          >
            {createChallenge.isPending ? "Creating..." : "Create Challenge"}
          </button>
        </div>
      )}

      {/* Challenges List */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="text-center py-8 text-sm text-gray-400">Loading challenges...</div>
        ) : (challenges ?? []).length === 0 ? (
          <div className="text-center py-12">
            <span className="material-icons text-gray-300 mb-2" style={{ fontSize: "40px" }}>flag</span>
            <p className="text-sm text-gray-500">No challenges yet. Create your first one!</p>
          </div>
        ) : (
          (challenges ?? []).map((c) => (
            <div key={c.id} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.isActive ? "bg-[#008090]/10" : "bg-gray-100"}`}>
                  <span className="material-icons" style={{ fontSize: "20px", color: c.isActive ? "#008090" : "#9ca3af" }}>flag</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{c.title}</p>
                  <p className="text-[10px] text-gray-400">{c.challengeType} · Target: {c.targetValue} · {c.xpReward} XP · {c.weekStartDate} → {c.weekEndDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${c.isActive ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                  {c.isActive ? "Active" : "Inactive"}
                </span>
                <button
                  onClick={() => updateChallenge.mutate({ challengeId: c.id, isActive: !c.isActive })}
                  className="text-[11px] px-2.5 py-1 rounded-lg border border-gray-200 text-gray-600 hover:border-[#008090]/30 hover:text-[#008090] transition-all"
                >
                  {c.isActive ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ─────────────── ANNOUNCEMENTS TAB ─────────────── */
function AnnouncementsTab() {
  const sendAnnouncement = trpc.admin.sendAnnouncement.useMutation({
    onSuccess: (result) => {
      toast.success(`Announcement sent to ${result?.sent ?? 0} users`);
      setTitle("");
      setMessage("");
    },
    onError: () => toast.error("Failed to send announcement"),
  });
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  return (
    <div className="max-w-[600px] space-y-6">
      <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <span className="material-icons text-[#008090]" style={{ fontSize: "18px" }}>campaign</span>
          Broadcast Announcement
        </h3>
        <p className="text-xs text-gray-500">Send a notification to all registered users.</p>

        <div>
          <label className="text-[11px] text-gray-500 font-medium block mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="New feature available!"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#008090]/20 focus:border-[#008090]/40"
          />
        </div>
        <div>
          <label className="text-[11px] text-gray-500 font-medium block mb-1">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="We've just launched weekly challenges! Check them out in the Challenges section."
            rows={4}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#008090]/20 focus:border-[#008090]/40 resize-none"
          />
        </div>
        <button
          onClick={() => {
            if (!title.trim() || !message.trim()) return toast.error("Title and message are required");
            if (confirm("Send this announcement to ALL users?")) {
              sendAnnouncement.mutate({ title, message });
            }
          }}
          disabled={sendAnnouncement.isPending}
          className="px-6 py-2.5 rounded-xl bg-[#008090] text-white text-sm font-medium hover:bg-[#006d7a] disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <span className="material-icons" style={{ fontSize: "16px" }}>send</span>
          {sendAnnouncement.isPending ? "Sending..." : "Send to All Users"}
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <span className="material-icons text-amber-500 mt-0.5" style={{ fontSize: "16px" }}>info</span>
          <div>
            <p className="text-xs font-medium text-amber-800">Broadcast Tips</p>
            <ul className="text-[11px] text-amber-700 mt-1 space-y-1 list-disc list-inside">
              <li>Announcements are sent as system notifications to all users</li>
              <li>Users will see them in their Notifications page</li>
              <li>Keep messages concise and actionable</li>
              <li>Use for important updates, new features, or scheduled maintenance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
