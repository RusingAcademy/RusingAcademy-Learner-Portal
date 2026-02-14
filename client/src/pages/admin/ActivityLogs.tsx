import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity, Clock, Search, ChevronLeft, ChevronRight,
  Filter, User, FileText, Shield, Settings, Trash2,
  PenLine, Plus, Eye, Download, RefreshCw,
} from "lucide-react";

// ============================================================================
// HELPERS
// ============================================================================

const ACTION_ICONS: Record<string, any> = {
  create: Plus,
  edit: PenLine,
  update: PenLine,
  delete: Trash2,
  view: Eye,
  export: Download,
  settings: Settings,
  permission: Shield,
};

const ACTION_COLORS: Record<string, string> = {
  create: "bg-green-500/10 text-green-600",
  edit: "bg-blue-500/10 text-blue-600",
  update: "bg-blue-500/10 text-blue-600",
  delete: "bg-red-500/10 text-red-600",
  view: "bg-gray-500/10 text-gray-600",
  export: "bg-amber-500/10 text-amber-600",
  settings: "bg-purple-500/10 text-purple-600",
  permission: "bg-violet-500/10 text-violet-600",
};

function getActionCategory(action: string): string {
  const lower = action.toLowerCase();
  if (lower.includes("delete") || lower.includes("remove")) return "delete";
  if (lower.includes("create") || lower.includes("add")) return "create";
  if (lower.includes("edit") || lower.includes("update") || lower.includes("change")) return "update";
  if (lower.includes("view") || lower.includes("get") || lower.includes("list")) return "view";
  if (lower.includes("export") || lower.includes("download")) return "export";
  if (lower.includes("setting") || lower.includes("config")) return "settings";
  if (lower.includes("permission") || lower.includes("role") || lower.includes("rbac")) return "permission";
  return "view";
}

const PAGE_SIZE = 20;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ActivityLogs() {
  const [actionFilter, setActionFilter] = useState("");
  const [targetTypeFilter, setTargetTypeFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);

  // Use the new generalized audit log endpoint
  const queryInput = useMemo(() => ({
    action: actionFilter || undefined,
    targetType: targetTypeFilter !== "all" ? targetTypeFilter : undefined,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  }), [actionFilter, targetTypeFilter, page]);

  const { data: auditData, isLoading, refetch } = trpc.adminStability.getAuditLog.useQuery(queryInput, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Fallback to old endpoint if audit log is empty (for backwards compatibility)
  const { data: legacyLogs } = trpc.admin.getRecentActivity.useQuery(undefined, {
    enabled: !isLoading && (!auditData || auditData.total === 0),
  });

  const entries = auditData?.entries ?? [];
  const total = auditData?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Merge legacy logs if no audit data
  const displayEntries = entries.length > 0
    ? entries
    : (legacyLogs ?? []) as any[];

  // Client-side search filter
  const filteredEntries = searchTerm
    ? displayEntries.filter((e: any) => {
        const text = `${e.action || ""} ${e.targetType || ""} ${e.userName || ""} ${e.userEmail || ""} ${JSON.stringify(e.details || {})}`.toLowerCase();
        return text.includes(searchTerm.toLowerCase());
      })
    : displayEntries;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6" /> Activity & Audit Logs
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track all admin actions, system events, and changes with full audit trail
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-1.5" /> Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search actions, users, targets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9"
              />
            </div>
            <Select value={targetTypeFilter} onValueChange={(v) => { setTargetTypeFilter(v); setPage(0); }}>
              <SelectTrigger className="w-[160px] h-9">
                <Filter className="h-3.5 w-3.5 mr-1.5" />
                <SelectValue placeholder="Target type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="course">Courses</SelectItem>
                <SelectItem value="user">Users</SelectItem>
                <SelectItem value="coaching">Coaching</SelectItem>
                <SelectItem value="payment">Payments</SelectItem>
                <SelectItem value="settings">Settings</SelectItem>
                <SelectItem value="content">Content</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Filter by action..."
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
              className="w-[180px] h-9"
            />
            {total > 0 && (
              <Badge variant="outline" className="text-xs">
                {total} total entries
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Log Entries */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="p-12 text-center">
              <Activity className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
              <p className="font-medium text-lg">No activity recorded yet</p>
              <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                Admin actions, system events, and user changes will appear here as they occur.
                All mutations are automatically logged with who, what, when, and change details.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredEntries.map((log: any, idx: number) => {
                const category = getActionCategory(log.action || "");
                const ActionIcon = ACTION_ICONS[category] || FileText;
                const colorClass = ACTION_COLORS[category] || "bg-gray-500/10 text-gray-600";
                const details = typeof log.details === "string" ? JSON.parse(log.details || "{}") : (log.details || {});
                const hasDiff = details.diff || details.before || details.after;

                return (
                  <div key={log.id || idx} className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className={`p-2 rounded-full shrink-0 ${colorClass}`}>
                        <ActionIcon className="h-4 w-4" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium">
                              {log.action || log.description || "Activity"}
                            </p>
                            {log.targetType && (
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <Badge variant="outline" className="text-xs">
                                  {log.targetType}
                                  {log.targetId ? ` #${log.targetId}` : ""}
                                </Badge>
                                {log.userName && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {log.userName}
                                    {log.userEmail && <span className="opacity-60">({log.userEmail})</span>}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                            <Clock className="h-3 w-3" />
                            {log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}
                          </div>
                        </div>

                        {/* Change diff */}
                        {hasDiff && (
                          <div className="mt-2 p-2 bg-muted/30 rounded-md text-xs font-mono">
                            {Object.entries(details.diff || details).map(([key, val]: [string, any]) => {
                              if (key === "performedBy" || key === "role" || key === "diff") return null;
                              if (val && typeof val === "object" && "before" in val && "after" in val) {
                                return (
                                  <div key={key} className="flex items-center gap-2 py-0.5">
                                    <span className="text-muted-foreground">{key}:</span>
                                    <span className="text-red-500 line-through">{String(val.before)}</span>
                                    <span className="text-muted-foreground">→</span>
                                    <span className="text-green-500">{String(val.after)}</span>
                                  </div>
                                );
                              }
                              return null;
                            })}
                          </div>
                        )}

                        {/* IP / User Agent */}
                        {(log.ipAddress || log.userAgent) && (
                          <div className="mt-1 text-[10px] text-muted-foreground/60">
                            {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                            {log.ipAddress && log.userAgent && <span> · </span>}
                            {log.userAgent && <span className="truncate max-w-[300px] inline-block align-bottom">{log.userAgent}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
