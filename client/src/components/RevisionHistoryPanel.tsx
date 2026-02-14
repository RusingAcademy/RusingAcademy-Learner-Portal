/**
 * RevisionHistoryPanel — View per-section change history and restore previous states
 * Can be used as a dialog or embedded panel
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { History, Undo2, User, Clock, Pencil, Plus, Trash2, Copy, ArrowRight, RotateCcw, Loader2, ChevronDown, ChevronUp } from "lucide-react";

interface RevisionHistoryPanelProps {
  open: boolean;
  onClose: () => void;
  sectionId: number | null;
  pageId: number;
  sectionTitle?: string;
  onRestore: () => void;
}

const ACTION_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  create: { label: "Created", color: "bg-green-100 text-green-700", icon: <Plus className="h-3 w-3" /> },
  update: { label: "Updated", color: "bg-blue-100 text-blue-700", icon: <Pencil className="h-3 w-3" /> },
  delete: { label: "Deleted", color: "bg-red-100 text-red-700", icon: <Trash2 className="h-3 w-3" /> },
  restore: { label: "Restored", color: "bg-amber-100 text-amber-700", icon: <RotateCcw className="h-3 w-3" /> },
  copy: { label: "Copied", color: "bg-purple-100 text-purple-700", icon: <Copy className="h-3 w-3" /> },
  move: { label: "Moved", color: "bg-orange-100 text-orange-700", icon: <ArrowRight className="h-3 w-3" /> },
};

function formatTimestamp(ts: string | Date) {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined });
}

export default function RevisionHistoryPanel({ open, onClose, sectionId, pageId, sectionTitle, onRestore }: RevisionHistoryPanelProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const utils = trpc.useUtils();

  // Query revisions — section-level if sectionId provided, page-level otherwise
  const sectionRevisionsQuery = trpc.revisionHistory.listForSection.useQuery(
    { sectionId: sectionId || 0, limit: 50 },
    { enabled: open && !!sectionId }
  );
  const pageRevisionsQuery = trpc.revisionHistory.listForPage.useQuery(
    { pageId, limit: 100 },
    { enabled: open && !sectionId }
  );

  const restoreMut = trpc.revisionHistory.restore.useMutation({
    onSuccess: () => {
      toast.success("Section restored to previous state");
      sectionRevisionsQuery.refetch();
      pageRevisionsQuery.refetch();
      onRestore();
    },
    onError: (err) => toast.error(err.message),
  });

  const revisions = sectionId ? (sectionRevisionsQuery.data || []) : (pageRevisionsQuery.data || []);
  const isLoading = sectionId ? sectionRevisionsQuery.isLoading : pageRevisionsQuery.isLoading;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <History className="h-4 w-4 text-indigo-500" />
            {sectionId ? "Section" : "Page"} Revision History
          </DialogTitle>
          {sectionTitle && (
            <p className="text-xs text-gray-500 mt-1">Section: {sectionTitle}</p>
          )}
        </DialogHeader>

        <ScrollArea className="max-h-[55vh]">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading history...
            </div>
          ) : revisions.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No revisions yet</p>
              <p className="text-xs text-gray-300 mt-1">Changes will appear here when sections are edited</p>
            </div>
          ) : (
            <div className="space-y-1 pr-2">
              {(revisions as any[]).map((rev, idx) => {
                const config = ACTION_CONFIG[rev.action] || ACTION_CONFIG.update;
                const isExpanded = expandedId === rev.id;
                const isFirst = idx === 0;

                return (
                  <div key={rev.id} className={`rounded-lg border transition-all ${isFirst ? "border-indigo-200 bg-indigo-50/30" : "border-gray-100 hover:border-gray-200"}`}>
                    <div
                      className="flex items-start gap-3 p-3 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : rev.id)}
                    >
                      {/* Timeline dot */}
                      <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${config.color}`}>
                        {config.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${config.color} border-0`}>
                            {config.label}
                          </Badge>
                          {rev.fieldChanged && (
                            <span className="text-[10px] text-gray-400 truncate max-w-[150px]">{rev.fieldChanged}</span>
                          )}
                          {(rev as any).sectionTitle && (
                            <span className="text-[10px] text-gray-500 font-medium truncate max-w-[120px]">
                              {(rev as any).sectionTitle}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-400">
                          <span className="flex items-center gap-1">
                            <User className="h-2.5 w-2.5" /> {rev.userName || "System"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" /> {formatTimestamp(rev.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Expand/Restore */}
                      <div className="flex items-center gap-1 shrink-0">
                        {rev.previousData && rev.action !== "create" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[10px] px-2 gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm("Restore this section to its previous state?")) {
                                restoreMut.mutate({ revisionId: rev.id });
                              }
                            }}
                            disabled={restoreMut.isPending}
                          >
                            {restoreMut.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Undo2 className="h-3 w-3" />}
                            Restore
                          </Button>
                        )}
                        {isExpanded ? <ChevronUp className="h-3 w-3 text-gray-400" /> : <ChevronDown className="h-3 w-3 text-gray-400" />}
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="px-3 pb-3 pt-0 border-t border-gray-100 mt-0">
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          {rev.previousData && (
                            <div className="space-y-1">
                              <p className="text-[10px] font-semibold text-red-500 uppercase">Before</p>
                              <div className="bg-red-50 rounded p-2 text-[10px] space-y-0.5 max-h-32 overflow-auto">
                                {Object.entries(rev.previousData).map(([k, v]) => (
                                  <div key={k}>
                                    <span className="text-gray-500">{k}:</span>{" "}
                                    <span className="text-gray-700 break-all">{typeof v === "object" ? JSON.stringify(v) : String(v ?? "—")}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {rev.newData && (
                            <div className="space-y-1">
                              <p className="text-[10px] font-semibold text-green-500 uppercase">After</p>
                              <div className="bg-green-50 rounded p-2 text-[10px] space-y-0.5 max-h-32 overflow-auto">
                                {Object.entries(rev.newData).map(([k, v]) => (
                                  <div key={k}>
                                    <span className="text-gray-500">{k}:</span>{" "}
                                    <span className="text-gray-700 break-all">{typeof v === "object" ? JSON.stringify(v) : String(v ?? "—")}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" size="sm">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
