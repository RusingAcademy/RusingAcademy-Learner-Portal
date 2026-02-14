import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, UserPlus, GraduationCap, Eye, Loader2, User, Mail, DollarSign, Calendar, Globe, Briefcase, ChevronDown, ChevronUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

export default function CoachesManagement() {
  const { data: applications, isLoading, refetch } = trpc.admin.getCoachApplications.useQuery();

  // Confirmation state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: "approve" | "reject";
    applicationId: number;
    name: string;
  } | null>(null);

  // Detail view state
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);

  // Rejection reason state
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectAppId, setRejectAppId] = useState<number | null>(null);
  const [rejectAppName, setRejectAppName] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  // Expanded rows for quick preview
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const approve = trpc.admin.approveCoachApplication.useMutation({
    onSuccess: () => {
      toast.success(`${pendingAction?.name || "Coach"} approved successfully`);
      setConfirmOpen(false);
      setPendingAction(null);
      setShowDetail(false);
      refetch();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const reject = trpc.admin.rejectCoachApplication.useMutation({
    onSuccess: () => {
      toast.success(`Application rejected`);
      setShowRejectDialog(false);
      setRejectAppId(null);
      setRejectAppName("");
      setRejectionReason("");
      setShowDetail(false);
      refetch();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const handleApprove = (applicationId: number, name: string) => {
    setPendingAction({ type: "approve", applicationId, name });
    setConfirmOpen(true);
  };

  const handleReject = (applicationId: number, name: string) => {
    setRejectAppId(applicationId);
    setRejectAppName(name);
    setShowRejectDialog(true);
  };

  const confirmApprove = () => {
    if (!pendingAction) return;
    approve.mutate({ applicationId: pendingAction.applicationId });
  };

  const confirmReject = () => {
    if (!rejectAppId || !rejectionReason.trim()) return;
    reject.mutate({ applicationId: rejectAppId, reason: rejectionReason.trim() });
  };

  const toggleExpand = (id: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allApps = (applications ?? []) as any[];
  const pending = allApps.filter((a: any) => a.status === "submitted" || a.status === "pending");
  const approved = allApps.filter((a: any) => a.status === "approved");
  const rejected = allApps.filter((a: any) => a.status === "rejected");

  const formatRate = (rate: number | null | undefined) => {
    if (!rate) return "N/A";
    return `$${rate}/h`;
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "N/A";
    try {
      return new Date(date).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return "N/A";
    }
  };

  const getAppName = (app: any) => {
    return app.fullName || app.applicantName || `${app.firstName || ""} ${app.lastName || ""}`.trim() || "Applicant";
  };

  const getAppEmail = (app: any) => {
    return app.applicantEmail || app.email || "No email";
  };

  const renderApplicationCard = (app: any, showActions: boolean = false) => {
    const name = getAppName(app);
    const email = getAppEmail(app);
    const isExpanded = expandedRows.has(app.id);

    return (
      <div key={app.id} className="border-b last:border-b-0">
        <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Photo */}
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
              {app.photoUrl || app.profilePhotoUrl ? (
                <img
                  src={app.photoUrl || app.profilePhotoUrl}
                  alt={name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                    (e.target as HTMLImageElement).parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center"><span class="text-lg font-semibold text-slate-400">${name.charAt(0).toUpperCase()}</span></div>`;
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-6 h-6 text-slate-400" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm truncate">{name}</p>
              <p className="text-xs text-muted-foreground truncate">{email}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                {app.hourlyRate && (
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />{formatRate(app.hourlyRate)}
                  </span>
                )}
                {app.teachingLanguage && (
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3" />{app.teachingLanguage}
                  </span>
                )}
                {app.createdAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />{formatDate(app.createdAt)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            <Button variant="ghost" size="sm" onClick={() => toggleExpand(app.id)} title="Quick preview">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setSelectedApp(app); setShowDetail(true); }}>
              <Eye className="h-4 w-4 mr-1" /> View
            </Button>
            {showActions && (
              <>
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApprove(app.id, name)}>
                  <CheckCircle className="h-4 w-4 mr-1" /> Approve
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleReject(app.id, name)}>
                  <XCircle className="h-4 w-4 mr-1" /> Reject
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Expanded Quick Preview */}
        {isExpanded && (
          <div className="px-4 pb-4 pt-0 bg-slate-50/50 dark:bg-slate-800/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {app.bio && (
                <div>
                  <p className="font-medium text-xs text-muted-foreground mb-1">Bio (EN)</p>
                  <p className="text-sm line-clamp-3">{app.bio}</p>
                </div>
              )}
              {(app as any).bioFr && (
                <div>
                  <p className="font-medium text-xs text-muted-foreground mb-1">Bio (FR)</p>
                  <p className="text-sm line-clamp-3">{(app as any).bioFr}</p>
                </div>
              )}
              {app.headline && (
                <div>
                  <p className="font-medium text-xs text-muted-foreground mb-1">Headline (EN)</p>
                  <p className="text-sm">{app.headline}</p>
                </div>
              )}
              {(app as any).headlineFr && (
                <div>
                  <p className="font-medium text-xs text-muted-foreground mb-1">Headline (FR)</p>
                  <p className="text-sm">{(app as any).headlineFr}</p>
                </div>
              )}
              {app.specializations && (
                <div>
                  <p className="font-medium text-xs text-muted-foreground mb-1">Specializations</p>
                  <div className="flex flex-wrap gap-1">
                    {typeof app.specializations === "object"
                      ? Object.entries(app.specializations)
                          .filter(([, v]) => v)
                          .map(([k]) => (
                            <Badge key={k} variant="secondary" className="text-xs">{k.replace(/([A-Z])/g, " $1").trim()}</Badge>
                          ))
                      : <span className="text-xs text-muted-foreground">None specified</span>
                    }
                  </div>
                </div>
              )}
              {app.yearsTeaching != null && (
                <div>
                  <p className="font-medium text-xs text-muted-foreground mb-1">Experience</p>
                  <p className="text-sm">{app.yearsTeaching} years teaching</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Coaching Management</h1>
        <p className="text-sm text-muted-foreground">Review applications, manage coach profiles, and control access.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><Clock className="h-5 w-5 text-amber-500" /><div><p className="text-xl font-bold">{pending.length}</p><p className="text-xs text-muted-foreground">Pending</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><CheckCircle className="h-5 w-5 text-green-500" /><div><p className="text-xl font-bold">{approved.length}</p><p className="text-xs text-muted-foreground">Approved</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><XCircle className="h-5 w-5 text-red-500" /><div><p className="text-xl font-bold">{rejected.length}</p><p className="text-xs text-muted-foreground">Rejected</p></div></CardContent></Card>
      </div>
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card><CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
            ) : pending.length === 0 ? (
              <EmptyState
                icon={UserPlus}
                title="No pending applications"
                description="When coaches apply to join the platform, their applications will appear here for review."
              />
            ) : (
              <div>{pending.map((app: any) => renderApplicationCard(app, true))}</div>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card><CardContent className="p-0">
            {approved.length === 0 ? (
              <EmptyState
                icon={GraduationCap}
                title="No approved coaches"
                description="Approved coaches will appear here. Review pending applications to get started."
              />
            ) : (
              <div>{approved.map((a: any) => renderApplicationCard(a, false))}</div>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="rejected">
          <Card><CardContent className="p-0">
            {rejected.length === 0 ? (
              <EmptyState
                icon={XCircle}
                title="No rejected applications"
                description="Rejected applications will appear here for reference and potential reconsideration."
              />
            ) : (
              <div>{rejected.map((a: any) => renderApplicationCard(a, false))}</div>
            )}
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Review the coach application details below.
            </DialogDescription>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                  {selectedApp.photoUrl || selectedApp.profilePhotoUrl ? (
                    <img
                      src={selectedApp.photoUrl || selectedApp.profilePhotoUrl}
                      alt={getAppName(selectedApp)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-10 h-10 text-slate-400" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{getAppName(selectedApp)}</h3>
                  <p className="text-muted-foreground">{getAppEmail(selectedApp)}</p>
                  {selectedApp.phone && <p className="text-sm text-muted-foreground">{selectedApp.phone}</p>}
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Hourly Rate</p>
                  <p>{formatRate(selectedApp.hourlyRate)}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Trial Rate</p>
                  <p>{formatRate(selectedApp.trialRate)}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Teaching Language</p>
                  <p className="capitalize">{selectedApp.teachingLanguage || "Not specified"}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Years Teaching</p>
                  <p>{selectedApp.yearsTeaching ?? "N/A"}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">City</p>
                  <p>{selectedApp.city || "N/A"}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Applied</p>
                  <p>{formatDate(selectedApp.createdAt)}</p>
                </div>
              </div>

              {/* Headline (EN) */}
              {selectedApp.headline && (
                <div>
                  <p className="font-medium text-muted-foreground text-sm mb-1">Headline (EN)</p>
                  <p className="text-sm bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">{selectedApp.headline}</p>
                </div>
              )}

              {/* Headline (FR) */}
              {(selectedApp as any).headlineFr && (
                <div>
                  <p className="font-medium text-muted-foreground text-sm mb-1">Headline (FR)</p>
                  <p className="text-sm bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">{(selectedApp as any).headlineFr}</p>
                </div>
              )}

              {/* Bio (EN) */}
              {selectedApp.bio && (
                <div>
                  <p className="font-medium text-muted-foreground text-sm mb-1">Bio (EN)</p>
                  <p className="text-sm bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 whitespace-pre-wrap">{selectedApp.bio}</p>
                </div>
              )}

              {/* Bio (FR) */}
              {(selectedApp as any).bioFr && (
                <div>
                  <p className="font-medium text-muted-foreground text-sm mb-1">Bio (FR)</p>
                  <p className="text-sm bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 whitespace-pre-wrap">{(selectedApp as any).bioFr}</p>
                </div>
              )}

              {/* Specializations */}
              {selectedApp.specializations && (
                <div>
                  <p className="font-medium text-muted-foreground text-sm mb-2">Specializations</p>
                  <div className="flex flex-wrap gap-1.5">
                    {typeof selectedApp.specializations === "object"
                      ? Object.entries(selectedApp.specializations)
                          .filter(([, v]) => v)
                          .map(([k]) => (
                            <Badge key={k} variant="secondary">{k.replace(/([A-Z])/g, " $1").trim()}</Badge>
                          ))
                      : <span className="text-sm text-muted-foreground">None specified</span>
                    }
                  </div>
                </div>
              )}

              {/* Video */}
              {selectedApp.introVideoUrl && (
                <div>
                  <p className="font-medium text-muted-foreground text-sm mb-1">Introduction Video</p>
                  <a href={selectedApp.introVideoUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                    {selectedApp.introVideoUrl}
                  </a>
                </div>
              )}

              {/* Status */}
              <div className="flex items-center gap-2">
                <p className="font-medium text-muted-foreground text-sm">Status:</p>
                <Badge variant={
                  selectedApp.status === "approved" ? "default" :
                  selectedApp.status === "rejected" ? "destructive" : "secondary"
                } className="capitalize">
                  {selectedApp.status}
                </Badge>
              </div>

              {/* Rejection reason if rejected */}
              {selectedApp.status === "rejected" && selectedApp.reviewNotes && (
                <div>
                  <p className="font-medium text-muted-foreground text-sm mb-1">Rejection Reason</p>
                  <p className="text-sm bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-red-700 dark:text-red-400">{selectedApp.reviewNotes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetail(false)}>Close</Button>
            {selectedApp && (selectedApp.status === "submitted" || selectedApp.status === "pending") && (
              <>
                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApprove(selectedApp.id, getAppName(selectedApp))}>
                  <CheckCircle className="h-4 w-4 mr-1" /> Approve
                </Button>
                <Button variant="destructive" onClick={() => handleReject(selectedApp.id, getAppName(selectedApp))}>
                  <XCircle className="h-4 w-4 mr-1" /> Reject
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Confirmation Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Approve Coach Application"
        description={`Are you sure you want to approve ${pendingAction?.name || "this applicant"} as a coach? They will gain access to coaching tools, student management, and their profile will be published on the Coaches page.`}
        confirmLabel="Approve"
        variant="default"
        onConfirm={confirmApprove}
        loading={approve.isPending}
      />

      {/* Reject Dialog with Reason */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting {rejectAppName}'s application. They will be notified by email.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection (required)..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
            className="mt-2"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowRejectDialog(false); setRejectionReason(""); }}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={confirmReject}
              disabled={!rejectionReason.trim() || reject.isPending}
            >
              {reject.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
