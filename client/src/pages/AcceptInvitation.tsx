import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, Clock, AlertTriangle, Eye, EyeOff, ShieldCheck } from "lucide-react";

// ============================================================================
// Types
// ============================================================================

type InviteStatus = "loading" | "valid" | "invalid_token" | "already_accepted" | "revoked" | "expired";

// ============================================================================
// Component
// ============================================================================

export default function AcceptInvitation() {
  const { token } = useParams<{ token: string }>();
  const [, navigate] = useLocation();

  // Form state
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Verify token
  const { data: verification, isLoading: verifying } = trpc.admin.invitations.verifyToken.useQuery(
    { token: token || "" },
    { enabled: !!token, retry: false }
  );

  // Accept mutation
  const acceptInvite = trpc.admin.invitations.accept.useMutation({
    onSuccess: (data) => {
      toast.success(`Welcome to RusingÂcademy, ${data.user.name}!`, {
        description: `You've been set up as ${data.user.role}`,
      });
      // Redirect to dashboard after a brief delay
      setTimeout(() => {
        navigate("/");
      }, 1500);
    },
    onError: (error) => {
      toast.error("Failed to accept invitation", { description: error.message });
    },
  });

  // Determine status
  const status: InviteStatus = verifying
    ? "loading"
    : verification?.valid
      ? "valid"
      : (verification?.reason as InviteStatus) || "invalid_token";

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Full name is required";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !token) return;
    acceptInvite.mutate({ token, name: name.trim(), password });
  };

  // ============================================================================
  // Error States
  // ============================================================================

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="flex flex-col items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Verifying your invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "invalid_token") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <XCircle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-bold mb-2">Invalid Invitation</h2>
            <p className="text-muted-foreground mb-6">
              This invitation link is invalid or has been tampered with. Please contact the administrator who sent you the invitation.
            </p>
            <Button variant="outline" onClick={() => navigate("/")}>
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "already_accepted") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">Already Accepted</h2>
            <p className="text-muted-foreground mb-6">
              This invitation has already been accepted. If you already have an account, please log in.
            </p>
            <Button onClick={() => navigate("/login")}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "revoked") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">Invitation Revoked</h2>
            <p className="text-muted-foreground mb-6">
              This invitation has been revoked by the administrator. Please contact them for a new invitation.
            </p>
            <Button variant="outline" onClick={() => navigate("/")}>
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">Invitation Expired</h2>
            <p className="text-muted-foreground mb-6">
              This invitation has expired. Please ask the administrator to resend a new invitation.
            </p>
            <Button variant="outline" onClick={() => navigate("/")}>
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============================================================================
  // Valid Invitation — Show Registration Form
  // ============================================================================

  const invitation = verification?.invitation;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to RusingÂcademy</CardTitle>
          <CardDescription>
            You've been invited to join as{" "}
            <Badge variant="secondary" className="ml-1">
              {invitation?.role?.replace("_", " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
            </Badge>
          </CardDescription>
          <p className="text-xs text-muted-foreground mt-1">
            Creating account for <strong>{invitation?.email}</strong>
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Jean-Pierre Tremblay"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                }}
                className={errors.name ? "border-destructive" : ""}
                disabled={acceptInvite.isPending}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                  }}
                  className={`pr-10 ${errors.password ? "border-destructive" : ""}`}
                  disabled={acceptInvite.isPending}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                }}
                className={errors.confirmPassword ? "border-destructive" : ""}
                disabled={acceptInvite.isPending}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
              <p className="font-medium">Password requirements:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li className={password.length >= 8 ? "text-green-600" : ""}>
                  At least 8 characters
                </li>
              </ul>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              disabled={acceptInvite.isPending || !name.trim() || !password || !confirmPassword}
            >
              {acceptInvite.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating your account...
                </>
              ) : (
                "Create Account & Join"
              )}
            </Button>

            {/* Already have account */}
            <p className="text-center text-xs text-muted-foreground">
              Already have an account?{" "}
              <a href="/login" className="text-primary hover:underline">
                Log in instead
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
