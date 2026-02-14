import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import AdminSectionShell from "@/components/AdminSectionShell";
import AdminStatsGrid from "@/components/AdminStatsGrid";
import AdminEmptyState from "@/components/AdminEmptyState";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function AdminCoachHub() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("applications");
  const [appFilter, setAppFilter] = useState<string | undefined>(undefined);
  const [coachFilter, setCoachFilter] = useState<string | undefined>(undefined);
  const [suspendDialog, setSuspendDialog] = useState<{ open: boolean; coachId: number | null }>({ open: false, coachId: null });
  const [suspendReason, setSuspendReason] = useState("");
  const [tierDialog, setTierDialog] = useState(false);
  const [newTier, setNewTier] = useState({ name: "", description: "", commissionRate: 10, minStudents: 0, maxStudents: 100 });

  const apps = trpc.admin.coachApplications.useQuery({ status: appFilter });
  const coaches = trpc.admin.coachProfiles.useQuery({ status: coachFilter });
  const lifecycleStats = trpc.admin.coachLifecycleStats.useQuery();
  const tiers = trpc.admin.commissionTiers.useQuery();
  const payouts = trpc.admin.coachPayouts.useQuery({});
  const commAnalytics = trpc.admin.commissionAnalytics.useQuery();
  const utils = trpc.useUtils();

  const updateApp = trpc.admin.updateApplicationStatus.useMutation({
    onSuccess: () => { utils.admin.coachApplications.invalidate(); utils.admin.coachLifecycleStats.invalidate(); toast.success("Application updated"); },
  });
  const suspend = trpc.admin.suspendCoach.useMutation({
    onSuccess: () => { utils.admin.coachProfiles.invalidate(); utils.admin.coachLifecycleStats.invalidate(); setSuspendDialog({ open: false, coachId: null }); setSuspendReason(""); toast.success("Coach suspended"); },
  });
  const reactivate = trpc.admin.reactivateCoach.useMutation({
    onSuccess: () => { utils.admin.coachProfiles.invalidate(); utils.admin.coachLifecycleStats.invalidate(); toast.success("Coach reactivated"); },
  });
  const createTier = trpc.admin.createCommissionTier.useMutation({
    onSuccess: () => { utils.admin.commissionTiers.invalidate(); setTierDialog(false); toast.success("Tier created"); },
  });

  if (user?.role !== "admin") return <div className="p-8 text-center text-muted-foreground">Access denied</div>;

  const lStats = lifecycleStats.data;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <AdminSectionShell title="Coach Hub" description="Manage coach applications, lifecycle, and commissions">
        {/* Lifecycle Pipeline */}
        {lStats && (
          <AdminStatsGrid stats={[
            { label: "Pending Applications", value: lStats.pending, color: "text-yellow-600" },
            { label: "Active Coaches", value: lStats.active, color: "text-green-600" },
            { label: "Suspended", value: lStats.suspended, color: "text-red-600" },
            { label: "Total Applications", value: lStats.total },
          ]} columns={4} />
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="coaches">Active Coaches</TabsTrigger>
            <TabsTrigger value="commission">Commission</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
          </TabsList>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-4">
            <div className="flex gap-2 mb-4">
              {["all", "pending", "approved", "rejected"].map(f => (
                <Button key={f} variant={appFilter === (f === "all" ? undefined : f) ? "default" : "outline"} size="sm"
                  onClick={() => setAppFilter(f === "all" ? undefined : f)}
                  className={appFilter === (f === "all" ? undefined : f) ? "bg-[#008090]" : ""}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Button>
              ))}
            </div>
            {apps.data?.length === 0 ? (
              <AdminEmptyState title="No Applications" description="No coach applications match the current filter." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apps.data?.map((app: any) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{app.fullName}</TableCell>
                      <TableCell>{app.specialization ?? "—"}</TableCell>
                      <TableCell>{app.yearsExperience ?? "—"} yrs</TableCell>
                      <TableCell><StatusBadge variant={app.status} /></TableCell>
                      <TableCell>{new Date(app.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="space-x-2">
                        {app.status === "pending" && (
                          <>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => updateApp.mutate({ id: app.id, status: "approved" })}>Approve</Button>
                            <Button size="sm" variant="destructive" onClick={() => updateApp.mutate({ id: app.id, status: "rejected" })}>Reject</Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          {/* Active Coaches Tab */}
          <TabsContent value="coaches" className="space-y-4">
            <div className="flex gap-2 mb-4">
              {["all", "active", "suspended"].map(f => (
                <Button key={f} variant={coachFilter === (f === "all" ? undefined : f) ? "default" : "outline"} size="sm"
                  onClick={() => setCoachFilter(f === "all" ? undefined : f)}
                  className={coachFilter === (f === "all" ? undefined : f) ? "bg-[#008090]" : ""}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Button>
              ))}
            </div>
            {coaches.data?.length === 0 ? (
              <AdminEmptyState title="No Coaches" description="No coaches match the current filter." />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {coaches.data?.map((coach: any) => (
                  <Card key={coach.id} className="border border-gray-100">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{coach.displayName ?? `Coach #${coach.id}`}</CardTitle>
                        <StatusBadge variant={coach.status} />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Specialization</span><span>{coach.specialization ?? "General"}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Rating</span><span>{coach.averageRating ? `${Number(coach.averageRating).toFixed(1)}/5` : "N/A"}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Students</span><span>{coach.totalStudents ?? 0}</span></div>
                      <div className="pt-2 flex gap-2">
                        {coach.status === "active" && (
                          <Button size="sm" variant="destructive" className="flex-1" onClick={() => setSuspendDialog({ open: true, coachId: coach.id })}>Suspend</Button>
                        )}
                        {coach.status === "suspended" && (
                          <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => reactivate.mutate({ coachId: coach.id })}>Reactivate</Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Commission Tab */}
          <TabsContent value="commission" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Commission Tiers</h3>
              <Button size="sm" className="bg-[#008090] hover:bg-[#006070]" onClick={() => setTierDialog(true)}>Add Tier</Button>
            </div>
            {commAnalytics.data && (
              <AdminStatsGrid stats={[
                { label: "Total Paid", value: `$${Number(commAnalytics.data.totalPaid ?? 0).toLocaleString()}` },
                { label: "Active Tiers", value: commAnalytics.data.activeTiers ?? 0 },
                { label: "Pending Payout", value: `$${Number(commAnalytics.data.pendingPayout ?? 0).toLocaleString()}` },
              ]} columns={3} />
            )}
            {tiers.data?.length === 0 ? (
              <AdminEmptyState title="No Commission Tiers" description="Create your first commission tier to start tracking coach earnings." action={{ label: "Create Tier", onClick: () => setTierDialog(true) }} />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tier Name</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Min Students</TableHead>
                    <TableHead>Max Students</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tiers.data?.map((tier: any) => (
                    <TableRow key={tier.id}>
                      <TableCell className="font-medium">{tier.name}</TableCell>
                      <TableCell>{tier.commissionRate}%</TableCell>
                      <TableCell>{tier.minStudents ?? "—"}</TableCell>
                      <TableCell>{tier.maxStudents ?? "—"}</TableCell>
                      <TableCell><StatusBadge variant={tier.isActive ? "active" : "inactive"} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          {/* Payouts Tab */}
          <TabsContent value="payouts" className="space-y-4">
            {payouts.data?.length === 0 ? (
              <AdminEmptyState title="No Payouts" description="No coach payouts have been recorded yet." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Coach</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Paid At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.data?.map((p: any) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">Coach #{p.coachId}</TableCell>
                      <TableCell>${Number(p.amount ?? 0).toFixed(2)}</TableCell>
                      <TableCell>{p.periodStart ? new Date(p.periodStart).toLocaleDateString() : "—"} – {p.periodEnd ? new Date(p.periodEnd).toLocaleDateString() : "—"}</TableCell>
                      <TableCell><StatusBadge variant={p.status} /></TableCell>
                      <TableCell>{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>

        {/* Suspend Dialog */}
        <Dialog open={suspendDialog.open} onOpenChange={(o) => { if (!o) { setSuspendDialog({ open: false, coachId: null }); setSuspendReason(""); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Suspend Coach</DialogTitle>
              <DialogDescription>Please provide a reason for suspending this coach.</DialogDescription>
            </DialogHeader>
            <Textarea placeholder="Reason for suspension..." value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setSuspendDialog({ open: false, coachId: null })}>Cancel</Button>
              <Button variant="destructive" disabled={!suspendReason.trim()} onClick={() => { if (suspendDialog.coachId) suspend.mutate({ coachId: suspendDialog.coachId, reason: suspendReason }); }}>Confirm Suspend</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Tier Dialog */}
        <Dialog open={tierDialog} onOpenChange={setTierDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Commission Tier</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Tier Name" value={newTier.name} onChange={(e) => setNewTier(p => ({ ...p, name: e.target.value }))} />
              <Input placeholder="Description" value={newTier.description} onChange={(e) => setNewTier(p => ({ ...p, description: e.target.value }))} />
              <div className="grid grid-cols-3 gap-2">
                <Input type="number" placeholder="Rate %" value={newTier.commissionRate} onChange={(e) => setNewTier(p => ({ ...p, commissionRate: Number(e.target.value) }))} />
                <Input type="number" placeholder="Min Students" value={newTier.minStudents} onChange={(e) => setNewTier(p => ({ ...p, minStudents: Number(e.target.value) }))} />
                <Input type="number" placeholder="Max Students" value={newTier.maxStudents} onChange={(e) => setNewTier(p => ({ ...p, maxStudents: Number(e.target.value) }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTierDialog(false)}>Cancel</Button>
              <Button className="bg-[#008090]" disabled={!newTier.name.trim()} onClick={() => createTier.mutate(newTier)}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminSectionShell>
    </div>
  );
}
