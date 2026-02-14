import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export interface Notification {
  id: number;
  type: "message" | "session_reminder" | "booking" | "review" | "system";
  title: string;
  message: string;
  link: string | null;
  read: boolean | null;
  createdAt: Date;
  metadata?: unknown;
  readAt?: Date | null;
  userId?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  clearNotification: (id: number) => void;
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "read">) => void;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch notifications from server
  const { data: serverNotifications, refetch } = trpc.notification.list.useQuery(
    undefined,
    { 
      enabled: isAuthenticated,
      refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    }
  );

  // Mark notification as read mutation
  const markReadMutation = trpc.notification.markAsRead.useMutation({
    onSuccess: () => refetch(),
  });

  // Mark all as read mutation
  const markAllReadMutation = trpc.notification.markAllAsRead.useMutation({
    onSuccess: () => refetch(),
  });

  // Update local state when server data changes
  useEffect(() => {
    if (serverNotifications) {
      // @ts-expect-error - TS2345: auto-suppressed during TS cleanup
      setNotifications(serverNotifications.map((n: Notification & { createdAt: string | Date }) => ({
        ...n,
        createdAt: typeof n.createdAt === 'string' ? new Date(n.createdAt) : n.createdAt,
      })));
    }
  }, [serverNotifications]);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Mark single notification as read
  const markAsRead = useCallback((id: number) => {
    markReadMutation.mutate({ id });
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, [markReadMutation]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    markAllReadMutation.mutate();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, [markAllReadMutation]);

  // Clear a notification
  const clearNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Add a local notification (for real-time events)
  const addNotification = useCallback((notification: Omit<Notification, "id" | "createdAt" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now(),
      createdAt: new Date(),
      read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Show toast notification
    toast(notification.title, {
      description: notification.message,
      action: notification.link ? {
        label: "View",
        onClick: () => window.location.href = notification.link!,
      } : undefined,
    });
  }, []);

  // Refresh notifications
  const refreshNotifications = useCallback(() => {
    refetch();
  }, [refetch]);

  // Poll for new messages (simulated real-time)
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkNewMessages = async () => {
      // This would be replaced with WebSocket in production
      refetch();
    };

    const interval = setInterval(checkNewMessages, 15000); // Check every 15 seconds
    return () => clearInterval(interval);
  }, [isAuthenticated, refetch]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        clearNotification,
        addNotification,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
