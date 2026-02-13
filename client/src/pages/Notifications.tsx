/**
 * RusingÂcademy Learning Portal - Notifications Center
 * Live notifications from tRPC with mark-as-read, filtering, and unread badges.
 */
import DashboardLayout from "@/components/DashboardLayout";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

type FilterType = "all" | "achievement" | "system" | "info";

export default function Notifications() {
  const [filter, setFilter] = useState<FilterType>("all");
  const { data: notifications, isLoading } = trpc.notifications.list.useQuery({ limit: 100 });
  const markRead = trpc.notifications.markRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
    },
  });
  const utils = trpc.useUtils();

  const filteredNotifications = (notifications ?? []).filter((n) => {
    if (filter === "all") return true;
    return n.type === filter;
  });

  const unreadCount = (notifications ?? []).filter((n) => !n.isRead).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "achievement": return "emoji_events";
      case "system": return "settings";
      case "info": return "info";
      default: return "notifications";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "achievement": return "#f5a623";
      case "system": return "#008090";
      case "info": return "#3b82f6";
      default: return "#6b7280";
    }
  };

  const formatDate = (dateStr: string | Date | null) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return d.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <DashboardLayout>
      <div className="max-w-[900px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-gray-400 hover:text-[#008090] transition-colors">
              <span className="material-icons text-[20px]">navigate_before</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#008090] text-white text-xs font-bold">
                {unreadCount} new
              </span>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {([
            { key: "all", label: "All", icon: "inbox" },
            { key: "achievement", label: "Achievements", icon: "emoji_events" },
            { key: "system", label: "System", icon: "settings" },
            { key: "info", label: "Info", icon: "info" },
          ] as { key: FilterType; label: string; icon: string }[]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                filter === tab.key
                  ? "bg-[#008090] text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-[#008090]/30"
              }`}
            >
              <span className="material-icons" style={{ fontSize: "14px" }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <span className="material-icons text-gray-300" style={{ fontSize: "32px" }}>notifications_none</span>
            </div>
            <p className="text-sm font-medium text-gray-500">No notifications yet</p>
            <p className="text-xs text-gray-400 mt-1">Complete lessons and quizzes to earn achievements!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotifications.map((n) => (
              <div
                key={n.id}
                className={`bg-white border rounded-xl p-4 transition-all hover:shadow-sm cursor-pointer ${
                  n.isRead ? "border-gray-100" : "border-[#008090]/20 bg-[#008090]/[0.02]"
                }`}
                onClick={() => {
                  if (!n.isRead) markRead.mutate({ notificationId: n.id });
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${getTypeColor(n.type ?? "info")}12` }}
                  >
                    <span className="material-icons" style={{ fontSize: "20px", color: getTypeColor(n.type ?? "info") }}>
                      {getTypeIcon(n.type ?? "info")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`text-sm leading-snug ${n.isRead ? "text-gray-700" : "text-gray-900 font-semibold"}`}>
                        {n.title}
                      </h3>
                      <span className="text-[10px] text-gray-400 flex-shrink-0 mt-0.5">
                        {formatDate(n.createdAt)}
                      </span>
                    </div>
                    {n.message && (
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{n.message}</p>
                    )}
                  </div>
                  {!n.isRead && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#008090] flex-shrink-0 mt-1.5" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
