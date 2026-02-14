import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { formatDistanceToNow } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { 
  Bell, 
  MessageSquare, 
  Calendar, 
  Gift, 
  Trophy, 
  Star,
  Settings,
  Check,
  CheckCheck,
  Trash2,
} from "lucide-react";
import { Link } from "wouter";

const notificationIcons: Record<string, React.ReactNode> = {
  message: <MessageSquare className="h-4 w-4 text-blue-500" />,
  session: <Calendar className="h-4 w-4 text-emerald-500" />,
  points: <Gift className="h-4 w-4 text-amber-500" />,
  challenge: <Trophy className="h-4 w-4 text-[#0F3D3E]" />,
  review: <Star className="h-4 w-4 text-yellow-500" />,
  system: <Settings className="h-4 w-4 text-gray-500" />,
};

interface Notification {
  id: number;
  type: string;
  title: string;
  titleFr: string | null;
  message: string;
  messageFr: string | null;
  linkType: string | null;
  linkId: number | null;
  isRead: boolean;
  createdAt: Date;
}

export function NotificationCenter() {
  const { language } = useLanguage();
  const isEn = language === "en";
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: notifications, refetch } = trpc.notification.getInAppNotifications.useQuery();
  const markReadMutation = trpc.notification.markNotificationRead.useMutation();
  const markAllReadMutation = trpc.notification.markAllNotificationsRead.useMutation();
  const deleteMutation = trpc.notification.deleteNotification.useMutation();
  
  const unreadCount = (notifications as any)?.filter((n: Notification) => !n.isRead).length || 0;
  
  const handleMarkRead = async (id: number) => {
    await markReadMutation.mutateAsync({ notificationId: id });
    refetch();
  };
  
  const handleMarkAllRead = async () => {
    await markAllReadMutation.mutateAsync();
    refetch();
  };
  
  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync({ notificationId: id });
    refetch();
  };
  
  const getNotificationLink = (notification: Notification): string | null => {
    if (!notification.linkType || !notification.linkId) return null;
    
    switch (notification.linkType) {
      case "session":
        return `/session/${notification.linkId}`;
      case "message":
        return `/messages`;
      case "coach":
        return `/coach/${notification.linkId}`;
      case "challenge":
        return `/dashboard/learner`;
      default:
        return null;
    }
  };
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
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
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold">
            {isEn ? "Notifications" : "Notifications"}
          </h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs"
              onClick={handleMarkAllRead}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              {isEn ? "Mark all read" : "Tout marquer lu"}
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[400px]">
          {!notifications || notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bell className="h-10 w-10 mb-3 opacity-50" />
              <p className="text-sm">
                {isEn ? "No notifications yet" : "Aucune notification"}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {(notifications as any).map((notification: Notification) => {
                const link = getNotificationLink(notification);
                const content = (
                  <div
                    className={`px-4 py-3 hover:bg-muted/50 transition-colors ${
                      !notification.isRead ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {notificationIcons[notification.type] || <Bell className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm ${!notification.isRead ? "font-medium" : ""}`}>
                            {isEn ? notification.title : (notification.titleFr || notification.title)}
                          </p>
                          {!notification.isRead && (
                            <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {isEn ? notification.message : (notification.messageFr || notification.message)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: isEn ? enUS : fr,
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-2 ml-7">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleMarkRead(notification.id);
                          }}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          {isEn ? "Mark read" : "Marquer lu"}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete(notification.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
                
                if (link) {
                  return (
                    <Link 
                      key={notification.id} 
                      to={link}
                      onClick={() => {
                        if (!notification.isRead) handleMarkRead(notification.id);
                        setIsOpen(false);
                      }}
                    >
                      {content}
                    </Link>
                  );
                }
                
                return <div key={notification.id}>{content}</div>;
              })}
            </div>
          )}
        </ScrollArea>
        
        <div className="border-t px-4 py-2">
          <Link to="/settings/notifications" onClick={() => setIsOpen(false)}>
            <Button variant="ghost" size="sm" className="w-full text-xs">
              <Settings className="h-3 w-3 mr-1" />
              {isEn ? "Notification Settings" : "Paramètres de notification"}
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default NotificationCenter;
