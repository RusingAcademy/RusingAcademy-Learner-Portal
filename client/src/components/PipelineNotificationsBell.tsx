import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  AlertTriangle,
  ArrowRight,
  Clock,
  DollarSign,
  CheckCircle,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface Notification {
  id: number;
  leadId: number;
  notificationType: "stale_lead" | "stage_change" | "high_value" | "follow_up_due";
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export default function PipelineNotificationsBell() {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);

  const notificationsQuery = trpc.crm.getPipelineNotifications.useQuery({
    unreadOnly: false,
    limit: 20,
  });

  const markReadMutation = trpc.crm.markNotificationRead.useMutation({
    onSuccess: () => {
      notificationsQuery.refetch();
    },
  });

  const markAllReadMutation = trpc.crm.markAllNotificationsRead.useMutation({
    onSuccess: () => {
      toast.success(language === "fr" ? "Toutes les notifications marquées comme lues" : "All notifications marked as read");
      notificationsQuery.refetch();
    },
  });

  const notifications = (notificationsQuery.data?.notifications || []) as Notification[];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const labels = {
    en: {
      title: "Pipeline Notifications",
      noNotifications: "No notifications",
      markAllRead: "Mark all as read",
      stale_lead: "Stale Lead",
      stage_change: "Stage Change",
      high_value: "High Value",
      follow_up_due: "Follow-up Due",
    },
    fr: {
      title: "Notifications du pipeline",
      noNotifications: "Aucune notification",
      markAllRead: "Tout marquer comme lu",
      stale_lead: "Lead inactif",
      stage_change: "Changement d'étape",
      high_value: "Haute valeur",
      follow_up_due: "Suivi requis",
    },
  };

  const l = labels[language];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "stale_lead":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "stage_change":
        return <ArrowRight className="h-4 w-4 text-blue-500" />;
      case "high_value":
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case "follow_up_due":
        return <Clock className="h-4 w-4 text-[#0F3D3E]" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationLabel = (type: string) => {
    return l[type as keyof typeof l] || type;
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return language === "fr" ? "maintenant" : "now";
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h4 className="font-semibold text-sm">{l.title}</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={() => markAllReadMutation.mutate()}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              {l.markAllRead}
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              {l.noNotifications}
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 hover:bg-white dark:hover:bg-slate-900 cursor-pointer ${
                    !notification.isRead ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                  }`}
                  onClick={() => {
                    if (!notification.isRead) {
                      markReadMutation.mutate({ id: notification.id });
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.notificationType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {getNotificationLabel(notification.notificationType)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
