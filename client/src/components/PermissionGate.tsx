/**
 * PermissionGate Component
 * 
 * Conditionally renders children based on the current user's RBAC permissions.
 * 
 * Usage:
 *   <PermissionGate permission="manage_users">
 *     <UsersTable />
 *   </PermissionGate>
 * 
 *   <PermissionGate permissions={["manage_courses", "manage_content"]} mode="any">
 *     <ContentEditor />
 *   </PermissionGate>
 */
import { type ReactNode } from "react";
import { usePermissions, type Permission } from "@/hooks/usePermissions";
import { Shield } from "lucide-react";

interface PermissionGateProps {
  /** Single permission to check */
  permission?: Permission;
  /** Multiple permissions to check */
  permissions?: Permission[];
  /** "any" = user needs at least one, "all" = user needs every permission */
  mode?: "any" | "all";
  /** Content to render when user has permission */
  children: ReactNode;
  /** Content to render when user lacks permission (optional) */
  fallback?: ReactNode;
  /** If true, show a "no access" message instead of hiding completely */
  showDenied?: boolean;
}

export function PermissionGate({
  permission,
  permissions,
  mode = "any",
  children,
  fallback,
  showDenied = false,
}: PermissionGateProps) {
  const { can, canAny, canAll, loading, isAdmin } = usePermissions();

  // While loading, render nothing (avoids flash of forbidden content)
  if (loading) return null;

  // Determine access
  let hasAccess = false;

  if (permission) {
    hasAccess = can(permission);
  } else if (permissions && permissions.length > 0) {
    hasAccess = mode === "all" ? canAll(permissions) : canAny(permissions);
  } else {
    // No permissions specified = always render (admin-only guard should be elsewhere)
    hasAccess = isAdmin;
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showDenied) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Shield className="h-10 w-10 mb-3 opacity-30" />
        <p className="text-sm font-medium">Access Restricted</p>
        <p className="text-xs mt-1">You don't have permission to view this section.</p>
      </div>
    );
  }

  return null;
}

/**
 * Higher-order component version for wrapping entire pages.
 */
export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  permission: Permission
) {
  return function PermissionWrapped(props: P) {
    return (
      <PermissionGate permission={permission} showDenied>
        <WrappedComponent {...props} />
      </PermissionGate>
    );
  };
}
