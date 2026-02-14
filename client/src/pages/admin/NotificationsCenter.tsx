import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Bell, BellOff, Check, CheckCheck, Trash2, Search,
  Filter, RefreshCw, AlertTriangle, Info, DollarSign,
  UserPlus, ShoppingCart, Star, Send, X
} from "lucide-react";

type NotifType = "info" | "warning" | "payment" | "enrollment" | "review" | "system";

const typeConfig: Record<NotifType, { icon: any; color: string; bg: string }> = {
  info: { icon: Info, color: "text-blue-600", bg: "bg-blue-50" },
  warning: { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
  payment: { icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
  enrollment: { icon: UserPlus, color: "text-violet-600", bg: "bg-violet-50" },
  review: { icon: Star, color: "text-yellow-600", bg: "bg-yellow-50" },
  system: { icon: Bell, color: "text-gray-600", bg: "bg-gray-50" },
};

export default function NotificationsCenter() {
  
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [composeTitle, setComposeTitle] = useState("");
  const [composeMessage, setComposeMessage] = useState("");
  const [composeType, setComposeType] = useState("info");
  const [composeTarget, setComposeTarget] = useState("admin");

  const { data: notifications, refetch } = trpc.adminNotifications.getAll.useQuery(
    { unreadOnly: showUnreadOnly, limit: 100 }
  );
  const { data: unreadCount } = trpc.adminNotifications.getUnreadCount.useQuery();

  const markRead = trpc.adminNotifications.markRead.useMutation({
    onSuccess: () => { refetch(); toast.success("Marked as read"); },
  });
  const markAllRead = trpc.adminNotifications.markAllRead.useMutation({
    onSuccess: () => { refetch(); toast.success("All marked as read"); },
  });
  const deleteNotif = trpc.adminNotifications.delete.useMutation({
    onSuccess: () => { refetch(); toast.success("Notification deleted"); },
  });
  const createNotif = trpc.adminNotifications.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowCompose(false);
      setComposeTitle("");
      setComposeMessage("");
      toast.success("Notification sent");
    },
  });

  const filtered = useMemo(() => {
    if (!notifications) return [];
    return (notifications as any[]).filter((n: any) => {
      if (filterType !== "all" && n.type !== filterType) return false;
      if (search && !n.title?.toLowerCase().includes(search.toLowerCase()) && !n.message?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [notifications, filterType, search]);

  const formatDate = (d: any) => {
    if (!d) return "";
    const date = new Date(d);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications Center</h1>
          <p className="text-gray-500 mt-1">
            {unreadCount ? `${unreadCount} unread` : "All caught up"} — Manage alerts for payments, enrollments, reviews, and system events
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => markAllRead.mutate()} disabled={!unreadCount}>
            <CheckCheck className="w-4 h-4 mr-1" /> Mark All Read
          </Button>
          <Button size="sm" onClick={() => setShowCompose(true)}>
            <Send className="w-4 h-4 mr-1" /> Send Notification
          </Button>
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <Card className="border-2 border-violet-200 bg-violet-50/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Send Notification</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowCompose(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Type</label>
                <select
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                  value={composeType}
                  onChange={(e) => setComposeType(e.target.value)}
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="system">System</option>
                  <option value="payment">Payment</option>
                  <option value="enrollment">Enrollment</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Target</label>
                <select
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                  value={composeTarget}
                  onChange={(e) => setComposeTarget(e.target.value)}
                >
                  <option value="admin">Admins Only</option>
                  <option value="coach">Coaches Only</option>
                  <option value="all">Everyone</option>
                </select>
              </div>
            </div>
            <Input
              placeholder="Notification title..."
              value={composeTitle}
              onChange={(e) => setComposeTitle(e.target.value)}
            />
            <textarea
              className="w-full px-3 py-2 border rounded-lg text-sm min-h-[80px]"
              placeholder="Notification message..."
              value={composeMessage}
              onChange={(e) => setComposeMessage(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowCompose(false)}>Cancel</Button>
              <Button
                size="sm"
                disabled={!composeTitle || !composeMessage}
                onClick={() => createNotif.mutate({
                  title: composeTitle,
                  message: composeMessage,
                  type: composeType,
                  targetRole: composeTarget,
                })}
              >
                <Send className="w-4 h-4 mr-1" /> Send
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            className="pl-9"
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1">
          {["all", "info", "warning", "payment", "enrollment", "review", "system"].map((t) => (
            <Button
              key={t}
              variant={filterType === t ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType(t)}
              className="capitalize"
            >
              {t}
            </Button>
          ))}
        </div>
        <Button
          variant={showUnreadOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setShowUnreadOnly(!showUnreadOnly)}
        >
          <BellOff className="w-4 h-4 mr-1" /> Unread Only
        </Button>
      </div>

      {/* Notification List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No notifications</p>
              <p className="text-gray-400 text-sm mt-1">You're all caught up!</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((n: any) => {
            const cfg = typeConfig[(n.type as NotifType) || "info"] || typeConfig.info;
            const Icon = cfg.icon;
            return (
              <Card
                key={n.id}
                className={`transition-all hover:shadow-md ${!n.isRead ? "border-l-4 border-l-violet-500 bg-violet-50/20" : ""}`}
              >
                <CardContent className="py-3 px-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${cfg.bg} mt-0.5`}>
                      <Icon className={`w-4 h-4 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-medium text-sm ${!n.isRead ? "text-gray-900" : "text-gray-600"}`}>
                          {n.title}
                        </h4>
                        {!n.isRead && <Badge variant="secondary" className="text-xs bg-violet-100 text-violet-700">New</Badge>}
                        <Badge variant="outline" className="text-xs capitalize">{n.type || "info"}</Badge>
                        {n.targetRole && n.targetRole !== "admin" && (
                          <Badge variant="outline" className="text-xs">{n.targetRole}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                      <span className="text-xs text-gray-400 mt-1 block">{formatDate(n.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {!n.isRead && (
                        <Button variant="ghost" size="sm" onClick={() => markRead.mutate({ id: n.id })} title="Mark as read">
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => deleteNotif.mutate({ id: n.id })} title="Delete" className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
