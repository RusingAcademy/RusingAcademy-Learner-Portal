/**
 * Accept Invitation Page
 * 
 * When an HR manager receives an invitation link, they land here.
 * The page validates the token, shows the organization details,
 * and allows the user to accept and join the organization.
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useRoute } from "wouter";
import { useState } from "react";
import { Building2, CheckCircle2, XCircle, Loader2, ShieldCheck, ArrowRight } from "lucide-react";

export default function AcceptInvitation() {
  const [, params] = useRoute("/invite/:token");
  const token = params?.token ?? "";
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [accepted, setAccepted] = useState(false);

  const { data: validation, isLoading: validating, error: validationError } = trpc.clientPortal.validateInvitation.useQuery(
    { token },
    { enabled: !!token && isAuthenticated, retry: false }
  );

  const acceptMutation = trpc.clientPortal.acceptInvitation.useMutation({
    onSuccess: () => setAccepted(true),
  });

  // Loading auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-white">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying your session...</p>
        </div>
      </div>
    );
  }

  // Not authenticated — redirect to login with return path
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-white p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <ShieldCheck className="w-16 h-16 text-teal-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h1>
          <p className="text-gray-600 mb-6">
            You need to sign in to accept this invitation. After signing in, you'll be redirected back here.
          </p>
          <a
            href={getLoginUrl(`/invite/${token}`)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
          >
            Sign In to Continue <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  // Validating token
  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-white">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Validating invitation...</p>
        </div>
      </div>
    );
  }

  // Accepted successfully
  if (accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-white p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Aboard!</h1>
          <p className="text-gray-600 mb-2">
            You've successfully joined <strong>{validation?.organizationName}</strong>.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            You now have access to the Client Portal where you can manage training programs, track participant progress, and view compliance reports.
          </p>
          <a
            href="/hr"
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
          >
            Go to Client Portal <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  // Invalid or expired token
  if (!validation?.valid || validationError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-white p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h1>
          <p className="text-gray-600 mb-6">
            {validation?.reason || "This invitation link is invalid or has expired. Please contact your organization administrator for a new invitation."}
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  // Valid invitation — show accept form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-white p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-teal-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">You're Invited!</h1>
          <p className="text-gray-500 text-sm">RusingÂcademy Client Portal</p>
        </div>

        <div className="bg-teal-50 rounded-xl p-5 mb-6 space-y-3">
          <div>
            <p className="text-xs text-teal-600 font-medium uppercase tracking-wider">Organization</p>
            <p className="text-lg font-semibold text-gray-900">{validation.organizationName}</p>
            {validation.organizationNameFr && (
              <p className="text-sm text-gray-500">{validation.organizationNameFr}</p>
            )}
          </div>
          <div className="flex gap-6">
            <div>
              <p className="text-xs text-teal-600 font-medium uppercase tracking-wider">Role</p>
              <p className="text-sm font-medium text-gray-900 capitalize">
                {(validation.role ?? "training_manager").replace(/_/g, " ")}
              </p>
            </div>
            {validation.invitedName && (
              <div>
                <p className="text-xs text-teal-600 font-medium uppercase tracking-wider">Invited As</p>
                <p className="text-sm font-medium text-gray-900">{validation.invitedName}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-600">
            <strong>Signed in as:</strong> {user?.name || user?.email || "User"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            By accepting, your account will be linked to this organization as a {(validation.role ?? "training_manager").replace(/_/g, " ")}.
          </p>
        </div>

        <div className="flex gap-3">
          <a
            href="/"
            className="flex-1 py-3 px-4 text-center border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Decline
          </a>
          <button
            onClick={() => acceptMutation.mutate({ token })}
            disabled={acceptMutation.isPending}
            className="flex-1 py-3 px-4 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {acceptMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Accepting...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Accept Invitation
              </>
            )}
          </button>
        </div>

        {acceptMutation.error && (
          <p className="text-red-500 text-sm text-center mt-4">
            {acceptMutation.error.message}
          </p>
        )}
      </div>
    </div>
  );
}
