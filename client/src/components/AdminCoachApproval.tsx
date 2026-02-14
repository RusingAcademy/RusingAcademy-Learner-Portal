/**
 * Admin Coach Approval Component
 * Interface for administrators to review and approve/reject coach applications
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Clock, Eye, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const tokens = {
  primary: "#1E3A5F",
  secondary: "#C9A227",
  success: "#16A34A",
  error: "#DC2626",
};

interface CoachApplication {
  id: string;
  userId: string;
  status: "pending_review" | "approved" | "rejected";
  createdAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  specializations: string[];
  hourlyRate: number;
  profilePhotoUrl: string;
  stripeConnected: boolean;
  rejectionReason?: string;
}

function StatusBadge({ status }: { status: CoachApplication["status"] }) {
  const config = {
    pending_review: { label: "En attente", icon: Clock, className: "bg-yellow-100 text-yellow-800" },
    approved: { label: "Approuvé", icon: CheckCircle, className: "bg-green-100 text-green-800" },
    rejected: { label: "Refusé", icon: XCircle, className: "bg-red-100 text-red-800" },
  };
  const { label, icon: Icon, className } = config[status];
  return (
    <Badge variant="outline" className={`${className} flex items-center gap-1`}>
      <Icon className="w-3 h-3" />{label}
    </Badge>
  );
}

export default function AdminCoachApproval() {
  const [selectedApp, setSelectedApp] = useState<CoachApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["/api/admin/coach-applications"],
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/coach-applications/${id}/approve`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to approve");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coach-applications"] });
      setSelectedApp(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await fetch(`/api/admin/coach-applications/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error("Failed to reject");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coach-applications"] });
      setSelectedApp(null);
      setShowRejectDialog(false);
      setRejectionReason("");
    },
  });

  // @ts-ignore - TS2339: auto-suppressed during TS cleanup
  const pendingApps = applications.filter((a: CoachApplication) => a.status === "pending_review");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: tokens.primary }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: tokens.primary }}>Approbation des Coaches</h2>
          <p className="text-gray-600">{pendingApps.length} candidature(s) en attente</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Candidatures</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Coach</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Tarif</TableHead>
                <TableHead>Stripe</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* @ts-ignore - TS2339: auto-suppressed during TS cleanup */}
              {applications.map((app: CoachApplication) => (
                <TableRow key={app.id}>
                  <TableCell className="flex items-center gap-3">
                    <img loading="lazy" src={app.profilePhotoUrl || "/placeholder.png"} alt={`${app.firstName} ${app.lastName} profile photo`} className="w-10 h-10 rounded-full" />
                    <span className="font-medium">{app.firstName} {app.lastName}</span>
                  </TableCell>
                  <TableCell>{app.email}</TableCell>
                  <TableCell>{app.hourlyRate}$/h</TableCell>
                  <TableCell>
                    {app.stripeConnected ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </TableCell>
                  <TableCell><StatusBadge status={app.status} /></TableCell>
                  <TableCell>{format(new Date(app.createdAt), "d MMM yyyy", { locale: fr })}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setSelectedApp(app)}>
                        <Eye className="w-4 h-4 mr-1" />Voir
                      </Button>
                      {app.status === "pending_review" && (
                        <>
                          <Button size="sm" onClick={() => approveMutation.mutate(app.id)} disabled={approveMutation.isPending} style={{ backgroundColor: tokens.success }}>
                            <CheckCircle className="w-4 h-4 mr-1" />Approuver
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => { setSelectedApp(app); setShowRejectDialog(true); }}>
                            <XCircle className="w-4 h-4 mr-1" />Refuser
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refuser la candidature</DialogTitle>
          </DialogHeader>
          <Textarea placeholder="Raison du refus..." value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows={4} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Annuler</Button>
            <Button variant="destructive" onClick={() => selectedApp && rejectMutation.mutate({ id: selectedApp.id, reason: rejectionReason })} disabled={!rejectionReason.trim() || rejectMutation.isPending}>
              {rejectMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Confirmer le refus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
