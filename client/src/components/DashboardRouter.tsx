import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuthContext, ProtectedRoute } from "@/contexts/AuthContext";
import LearnerDashboard from "@/pages/LearnerDashboard";
import CoachDashboard from "@/pages/CoachDashboard";
import HRDashboard from "@/pages/HRDashboard";
import AdminDashboard from "@/pages/AdminDashboard";

// Debug mode
const AUTH_DEBUG = import.meta.env.VITE_AUTH_DEBUG === "true" || import.meta.env.DEV;

/**
 * DashboardContent - The actual dashboard content based on user role
 * 
 * This component is only rendered AFTER authentication is confirmed
 * by the ProtectedRoute wrapper
 */
function DashboardContent() {
  const { user, isLoading } = useAuthContext();
  const [, setLocation] = useLocation();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Don't do anything while loading
    if (isLoading) return;
    
    // Don't redirect if we already did
    if (hasRedirected) return;
    
    // Don't redirect if no user (ProtectedRoute handles this)
    if (!user) return;

    // Role-based redirect
    const role = user.role?.toLowerCase() || "learner";
    const currentPath = window.location.pathname;
    
    // Don't redirect if already on a specific dashboard route
    if (currentPath.startsWith("/dashboard/")) {
      if (AUTH_DEBUG) {
        console.log("[DashboardRouter] Already on specific dashboard:", currentPath);
      }
      return;
    }

    let targetPath = "/dashboard/learner";
    
    if (role === "owner" || role === "admin") {
      targetPath = "/dashboard/admin";
    } else if (role === "hr") {
      targetPath = "/dashboard/hr";
    } else if (role === "coach") {
      targetPath = "/dashboard/coach";
    }

    if (AUTH_DEBUG) {
      console.log("[DashboardRouter] Redirecting to role-based dashboard:", targetPath, "role:", role);
    }

    setHasRedirected(true);
    setLocation(targetPath);
  }, [user, isLoading, hasRedirected, setLocation]);

  // Show loading while determining role
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show redirecting state
  if (hasRedirected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  // Fallback: render based on role directly (shouldn't normally reach here)
  const role = user.role?.toLowerCase() || "learner";
  
  if (AUTH_DEBUG) {
    console.log("[DashboardRouter] Rendering fallback dashboard for role:", role);
  }

  if (role === "owner" || role === "admin") {
    return <AdminDashboard />;
  } else if (role === "hr") {
    return <HRDashboard />;
  } else if (role === "coach") {
    return <CoachDashboard />;
  } else {
    return <LearnerDashboard />;
  }
}

/**
 * DashboardRouter - RBAC-based dashboard routing
 * 
 * Routes users to the appropriate dashboard based on their role:
 * - Owner/Admin → Admin Dashboard
 * - HR → HR Dashboard
 * - Coach → Coach Dashboard
 * - Learner → Learner Dashboard
 * 
 * If not authenticated, redirects to /login via ProtectedRoute
 * 
 * IMPORTANT: This component uses ProtectedRoute which:
 * 1. Shows loading skeleton while auth is being checked
 * 2. Only redirects AFTER auth state is resolved
 * 3. Prevents the "flicker" / redirect loop issue
 */
export default function DashboardRouter() {
  return (
    <ProtectedRoute redirectTo="/login">
      <DashboardContent />
    </ProtectedRoute>
  );
}
