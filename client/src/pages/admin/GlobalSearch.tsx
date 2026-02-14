import { useState, useEffect, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import {
  Search, X, Users, BookOpen, FileText, Mail, Bell,
  ArrowRight, Zap, Target, Settings, BarChart3, Download,
  UserPlus, Command
} from "lucide-react";

const entityIcons: Record<string, any> = {
  user: Users,
  course: BookOpen,
  page: FileText,
  email_template: Mail,
  notification: Bell,
};

const entityColors: Record<string, string> = {
  user: "text-blue-600 bg-blue-50",
  course: "text-violet-600 bg-violet-50",
  page: "text-amber-600 bg-amber-50",
  email_template: "text-rose-600 bg-rose-50",
  notification: "text-gray-600 bg-gray-50",
};

const entityLinks: Record<string, string> = {
  user: "/admin/users",
  course: "/admin/courses",
  page: "/admin/pages",
  email_template: "/admin/email-templates",
  notification: "/admin/notifications",
};

const actionIcons: Record<string, any> = {
  "create-course": BookOpen,
  "create-page": FileText,
  "invite-coach": UserPlus,
  "create-funnel": Target,
  "create-automation": Zap,
  "create-email": Mail,
  "view-analytics": BarChart3,
  "export-data": Download,
  "manage-settings": Settings,
  "view-notifications": Bell,
};

export default function GlobalSearchBar() {
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: results } = trpc.globalSearch.search.useQuery(
    { query: debouncedQuery, limit: 15 },
    { enabled: debouncedQuery.length >= 1 }
  );
  const { data: quickActions } = trpc.globalSearch.quickActions.useQuery();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleNavigate = useCallback((link: string) => {
    setOpen(false);
    setQuery("");
    navigate(link);
  }, [navigate]);

  const showResults = query.length >= 1 && results;
  const showQuickActions = query.length === 0 && quickActions;

  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors w-full max-w-sm"
      >
        <Search className="w-4 h-4" />
        <span className="flex-1 text-left">Search everything...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs font-mono bg-white rounded border text-gray-400">
          <Command className="w-3 h-3" />K
        </kbd>
      </button>

      {/* Search Modal Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center pt-[15vh]">
          <div
            ref={containerRef}
            className="w-full max-w-xl bg-white rounded-xl shadow-2xl border overflow-hidden"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search users, courses, pages, templates..."
                className="flex-1 text-sm outline-none bg-transparent"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              {query && (
                <button onClick={() => setQuery("")} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
              <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 rounded border text-gray-400">ESC</kbd>
            </div>

            {/* Results */}
            <div className="max-h-[400px] overflow-y-auto">
              {showQuickActions && (
                <div className="p-2">
                  <p className="px-2 py-1 text-xs font-medium text-gray-400 uppercase tracking-wider">Quick Actions</p>
                  {quickActions.map((action: any) => {
                    const Icon = actionIcons[action.id] || Zap;
                    return (
                      <button
                        key={action.id}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-violet-50 transition-colors text-left"
                        onClick={() => handleNavigate(action.link)}
                      >
                        <div className="p-1.5 rounded-lg bg-violet-50">
                          <Icon className="w-4 h-4 text-violet-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{action.label}</span>
                        <ArrowRight className="w-3 h-3 text-gray-300 ml-auto" />
                      </button>
                    );
                  })}
                </div>
              )}

              {showResults && (
                <div className="p-2">
                  {(results as any[]).length === 0 ? (
                    <div className="py-8 text-center">
                      <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No results for "{query}"</p>
                      <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
                    </div>
                  ) : (
                    <>
                      <p className="px-2 py-1 text-xs font-medium text-gray-400 uppercase tracking-wider">
                        {(results as any[]).length} result{(results as any[]).length !== 1 ? "s" : ""}
                      </p>
                      {(results as any[]).map((r: any, idx: number) => {
                        const Icon = entityIcons[r.entityType] || Search;
                        const colors = entityColors[r.entityType] || "text-gray-600 bg-gray-50";
                        const link = entityLinks[r.entityType] || "/admin";
                        return (
                          <button
                            key={`${r.entityType}-${r.id}-${idx}`}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                            onClick={() => handleNavigate(link)}
                          >
                            <div className={`p-1.5 rounded-lg ${colors.split(" ")[1]}`}>
                              <Icon className={`w-4 h-4 ${colors.split(" ")[0]}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-700 truncate">{r.name}</p>
                              <p className="text-xs text-gray-400 truncate">{r.email}</p>
                            </div>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 capitalize">
                              {r.entityType?.replace("_", " ")}
                            </span>
                          </button>
                        );
                      })}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-white rounded border text-[10px]">↑↓</kbd> Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-white rounded border text-[10px]">↵</kbd> Open
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-white rounded border text-[10px]">ESC</kbd> Close
                </span>
              </div>
              <span className="text-xs text-gray-400">Powered by EcosystemHub</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
