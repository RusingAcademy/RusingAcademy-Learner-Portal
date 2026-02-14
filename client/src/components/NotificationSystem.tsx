// NotificationSystem - In-app notifications for coaching alerts - Sprint 9
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { X, Bell, Calendar, BookOpen, CheckCircle, AlertCircle } from 'lucide-react';

interface Notification { id: string; type: 'coaching' | 'resource' | 'progress' | 'system'; title: string; message: string; timestamp: Date; read: boolean; actionUrl?: string; }

interface NotificationContextType { notifications: Notification[]; unreadCount: number; addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void; markAsRead: (id: string) => void; markAllAsRead: () => void; clearNotification: (id: string) => void; }

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = { ...n, id: crypto.randomUUID(), timestamp: new Date(), read: false };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllAsRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const clearNotification = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

  return <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearNotification }}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
}

const iconMap = { coaching: Calendar, resource: BookOpen, progress: CheckCircle, system: AlertCircle };

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, clearNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 text-slate-600 hover:text-slate-900 transition-colors">
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{unreadCount}</span>}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-slate-200"><h3 className="font-semibold text-slate-900">Notifications</h3></div>
          {notifications.length === 0 ? <p className="p-4 text-slate-500 text-center">No notifications</p> : notifications.slice(0, 10).map(n => {
            const Icon = iconMap[n.type];
            return (
              <div key={n.id} className={`p-4 border-b border-slate-100 hover:bg-white cursor-pointer ${!n.read ? 'bg-blue-50' : ''}`} onClick={() => markAsRead(n.id)}>
                <div className="flex items-start gap-3">
                  <Icon className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1"><p className="font-medium text-slate-900 text-sm">{n.title}</p><p className="text-slate-600 text-xs mt-1">{n.message}</p></div>
                  <button onClick={(e) => { e.stopPropagation(); clearNotification(n.id); }} className="text-slate-400 hover:text-slate-600 p-2 -m-2 min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Dismiss notification"><X className="w-4 h-4" aria-hidden="true" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
