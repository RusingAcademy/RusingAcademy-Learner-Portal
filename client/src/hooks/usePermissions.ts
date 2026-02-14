/**
 * usePermissions Hook
 * 
 * Provides granular RBAC on the frontend by fetching the current user's
 * permissions from the RBAC system and exposing helper functions.
 * 
 * Usage:
 *   const { can, canAny, canAll, isAdmin, permissions, loading } = usePermissions();
 *   if (can("manage_users")) { ... }
 *   if (canAny(["manage_courses", "manage_content"])) { ... }
 */
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useMemo } from "react";

// Well-known permissions in the system
export type Permission =
  | "manage_users"
  | "manage_roles"
  | "manage_courses"
  | "manage_content"
  | "manage_cms"
  | "manage_coaches"
  | "manage_payments"
  | "manage_analytics"
  | "manage_settings"
  | "manage_notifications"
  | "manage_crm"
  | "manage_ai"
  | "manage_enterprise"
  | "manage_sle_exam"
  | "view_audit_log"
  | "view_dashboard"
  | "view_reports"
  | string; // Allow custom permissions

export function usePermissions() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // Fetch user permissions from RBAC system
  const { data: permissionsData, isLoading: permsLoading } = trpc.adminStability.getUserPermissions.useQuery(
    undefined,
    {
      enabled: isAuthenticated && user?.role === "admin",
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    }
  );

  const loading = authLoading || permsLoading;
  const isAdmin = user?.role === "admin";

  // Build a Set of permission names for O(1) lookup
  const permissionSet = useMemo(() => {
    if (!permissionsData || !Array.isArray(permissionsData)) return new Set<string>();
    return new Set(permissionsData.map((p: any) => p.permission || p.name || p));
  }, [permissionsData]);

  /**
   * Check if user has a specific permission.
   * Admin with role="admin" always has access (superadmin fallback).
   */
  const can = (permission: Permission): boolean => {
    if (!isAuthenticated) return false;
    // Superadmin fallback: if no RBAC permissions are configured yet,
    // admin role gets full access
    if (isAdmin && permissionSet.size === 0) return true;
    if (isAdmin && permissionSet.has("*")) return true;
    return permissionSet.has(permission);
  };

  /**
   * Check if user has ANY of the given permissions.
   */
  const canAny = (permissions: Permission[]): boolean => {
    return permissions.some((p) => can(p));
  };

  /**
   * Check if user has ALL of the given permissions.
   */
  const canAll = (permissions: Permission[]): boolean => {
    return permissions.every((p) => can(p));
  };

  return {
    can,
    canAny,
    canAll,
    isAdmin,
    permissions: Array.from(permissionSet),
    loading,
    isAuthenticated,
    user,
  };
}
