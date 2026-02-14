import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Loader2, ShieldAlert } from "lucide-react";

// Import role-specific dashboards
import LearnerDashboardContent from "@/components/dashboard/LearnerDashboard";
import CoachDashboardContent from "@/components/dashboard/CoachDashboard";
import AdminDashboardContent from "@/components/dashboard/AdminDashboard";
import { HRDashboard } from "@/components/dashboard/HRDashboard";

type DashboardView = "admin" | "hr" | "coach" | "learner";

/**
 * Unified Dashboard with role-based routing
 * 
 * Routes:
 * - /dashboard → auto-redirect based on role
 * - /dashboard/admin → Owner/Platform Admin only
 * - /dashboard/hr → HR/Org Admin only
 * - /dashboard/coach → Coach only
 * - /dashboard/learner → Learner only
 * 
 * Access Control:
 * - HR cannot access /dashboard/admin (403)
 * - Learner/Coach cannot access /dashboard/admin or /dashboard/hr (403)
 */
export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, loading } = useAuth();
  
  // Check route params
  const [isAdminRoute] = useRoute("/dashboard/admin");
  const [isHRRoute] = useRoute("/dashboard/hr");
  const [isCoachRoute] = useRoute("/dashboard/coach");
  const [isLearnerRoute] = useRoute("/dashboard/learner");
  
  // Get HR organization if user is HR admin
  const { data: hrOrg, isLoading: hrOrgLoading } = trpc.hr.getMyOrganization.useQuery(
    undefined,
    { enabled: isAuthenticated && !!user }
  );

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation("/login?redirect=/dashboard");
    }
  }, [loading, isAuthenticated, setLocation]);

  // Auto-redirect to correct dashboard based on role
  useEffect(() => {
    if (!loading && isAuthenticated && user && !isAdminRoute && !isHRRoute && !isCoachRoute && !isLearnerRoute) {
      const targetView = getTargetView(user, hrOrg);
      setLocation(`/dashboard/${targetView}`);
    }
  }, [loading, isAuthenticated, user, hrOrg, isAdminRoute, isHRRoute, isCoachRoute, isLearnerRoute, setLocation]);

  // Show loading state
  if (loading || hrOrgLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - will redirect via useEffect
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Determine user's allowed views
  const userRole = user.role || "learner";
  const isOwner = user.isOwner === true;
  const isPlatformAdmin = isOwner || userRole === "owner" || userRole === "admin";
  const isHRAdmin = userRole === "hr_admin" || (hrOrg && hrOrg.role === "admin");
  const isCoach = userRole === "coach";

  // Access control checks
  if (isAdminRoute && !isPlatformAdmin) {
    return <AccessDenied message="You don't have access to the Admin Dashboard. This area is restricted to platform administrators." />;
  }

  if (isHRRoute && !isHRAdmin && !isPlatformAdmin) {
    return <AccessDenied message="You don't have access to the HR Dashboard. This area is restricted to HR administrators." />;
  }

  if (isCoachRoute && !isCoach && !isPlatformAdmin) {
    return <AccessDenied message="You don't have access to the Coach Dashboard. This area is restricted to coaches." />;
  }

  // Render appropriate dashboard
  if (isAdminRoute) {
    return <AdminDashboardContent user={user as any} />;
  }

  if (isHRRoute) {
    const orgId = hrOrg?.organizationId || 1; // Default to 1 for testing
    return <HRDashboard user={user as any} organizationId={orgId} />;
  }

  if (isCoachRoute) {
    return <CoachDashboardContent user={user as any} />;
  }

  if (isLearnerRoute) {
    return <LearnerDashboardContent user={user as any} />;
  }

  // Default: show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    </div>
  );
}

/**
 * Determine which dashboard view the user should see by default
 */
function getTargetView(user: any, hrOrg: any): DashboardView {
  const userRole = user.role || "learner";
  const isOwner = user.isOwner === true;

  // Owner or Platform Admin → Admin Dashboard
  if (isOwner || userRole === "owner" || userRole === "admin") {
    return "admin";
  }

  // HR Admin → HR Dashboard
  if (userRole === "hr_admin" || (hrOrg && hrOrg.role === "admin")) {
    return "hr";
  }

  // Coach → Coach Dashboard
  if (userRole === "coach") {
    return "coach";
  }

  // Default → Learner Dashboard
  return "learner";
}

/**
 * Access Denied component
 */
function AccessDenied({ message }: { message: string }) {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">{message}</p>
        <button
          onClick={() => setLocation("/dashboard")}
          className="px-6 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
        >
          Go to My Dashboard
        </button>
      </div>
    </div>
  );
}
