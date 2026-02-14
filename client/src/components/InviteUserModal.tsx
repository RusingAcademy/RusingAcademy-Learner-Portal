import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Mail, UserPlus, Loader2, CheckCircle2, AlertCircle, RotateCcw, XCircle, Clock } from "lucide-react";

// ============================================================================
// Types
// ============================================================================

interface InviteUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TabView = "create" | "history";

// ============================================================================
// Role descriptions for the dropdown
// ============================================================================

const ROLE_OPTIONS = [
  { value: "learner", label: "Learner", description: "Can access courses and learning content" },
  { value: "coach", label: "Coach", description: "Can manage sessions and learner progress" },
  { value: "hr_admin", label: "HR Admin", description: "Can manage team enrollments and reports" },
  { value: "admin", label: "Admin", description: "Full platform access and management" },
  { value: "user", label: "User", description: "Basic platform access" },
] as const;

// ============================================================================
// Status badge colors
// ============================================================================

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType; label: string }> = {
    pending: { variant: "outline", icon: Clock, label: "Pending" },
    accepted: { variant: "default", icon: CheckCircle2, label: "Accepted" },
    revoked: { variant: "destructive", icon: XCircle, label: "Revoked" },
    expired: { variant: "secondary", icon: AlertCircle, label: "Expired" },
  };
  const c = config[status] || config.pending;
  const Icon = c.icon;
  return (
    <Badge variant={c.variant} className="gap-1 text-xs">
      <Icon className="h-3 w-3" />
      {c.label}
    </Badge>
  );
}

// ============================================================================
// Component
// ============================================================================

export function InviteUserModal({ open, onOpenChange }: InviteUserModalProps) {
  const [tab, setTab] = useState<TabView>("create");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("learner");
  const [emailError, setEmailError] = useState("");

  // tRPC mutations and queries
  const createInvite = trpc.admin.invitations.create.useMutation({
    onSuccess: (data) => {
      toast.success(`Invitation sent to ${data.email}`, {
        description: `Role: ${data.role} — Expires in 7 days`,
      });
      setEmail("");
      setRole("learner");
      setEmailError("");
      invitationsList.refetch();
    },
    onError: (error) => {
      toast.error("Failed to send invitation", { description: error.message });
    },
  });

  const invitationsList = trpc.admin.invitations.list.useQuery(
    { status: "all" },
    { enabled: open && tab === "history" }
  );

  const resendInvite = trpc.admin.invitations.resend.useMutation({
    onSuccess: (data) => {
      toast.success(`Invitation resent to ${data.email}`);
      invitationsList.refetch();
    },
    onError: (error) => {
      toast.error("Failed to resend", { description: error.message });
    },
  });

  const revokeInvite = trpc.admin.invitations.revoke.useMutation({
    onSuccess: (data) => {
      toast.success(`Invitation revoked for ${data.email}`);
      invitationsList.refetch();
    },
    onError: (error) => {
      toast.error("Failed to revoke", { description: error.message });
    },
  });

  // Validation
  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError("Email is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleSubmit = () => {
    if (!validateEmail(email)) return;
    createInvite.mutate({ email: email.trim(), role: role as any });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !createInvite.isPending) {
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Invite User
          </DialogTitle>
          <DialogDescription>
            Send an invitation email to add a new user to the platform.
          </DialogDescription>
        </DialogHeader>

        {/* Tab Switcher */}
        <div className="flex border-b">
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === "create"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setTab("create")}
          >
            New Invitation
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === "history"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setTab("history")}
          >
            History
          </button>
        </div>

        {tab === "create" ? (
          <div className="space-y-4 py-2">
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="colleague@example.ca"
                  className={`pl-9 ${emailError ? "border-destructive" : ""}`}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) validateEmail(e.target.value);
                  }}
                  onKeyDown={handleKeyDown}
                  disabled={createInvite.isPending}
                />
              </div>
              {emailError && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {emailError}
                </p>
              )}
            </div>

            {/* Role Select */}
            <div className="space-y-2">
              <Label htmlFor="invite-role">Role</Label>
              <Select value={role} onValueChange={setRole} disabled={createInvite.isPending}>
                <SelectTrigger id="invite-role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{opt.label}</span>
                        <span className="text-xs text-muted-foreground">{opt.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Info Box */}
            <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
              <p>The invited user will receive an email with a link to create their account.</p>
              <p>The invitation expires in <strong>7 days</strong>. You can resend or revoke it from the History tab.</p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={createInvite.isPending}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={createInvite.isPending || !email.trim()}>
                {createInvite.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Invitation
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="py-2 max-h-80 overflow-y-auto">
            {invitationsList.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !invitationsList.data?.length ? (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No invitations sent yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {invitationsList.data.map((inv: any) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{inv.email}</p>
                        <StatusBadge status={inv.status} />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">{inv.role}</Badge>
                        <span>·</span>
                        <span>by {inv.inviterName}</span>
                        <span>·</span>
                        <span>{new Date(inv.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {(inv.status === "pending" || inv.status === "expired") && (
                      <div className="flex gap-1 ml-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Resend"
                          onClick={() => resendInvite.mutate({ invitationId: inv.id })}
                          disabled={resendInvite.isPending}
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </Button>
                        {inv.status === "pending" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            title="Revoke"
                            onClick={() => revokeInvite.mutate({ invitationId: inv.id })}
                            disabled={revokeInvite.isPending}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
