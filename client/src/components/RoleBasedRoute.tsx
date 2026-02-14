/**
 * Role-Based Route Component
 * Protects routes based on user role from Clerk
 * Sprint 10: L'Écosystème de Gestion
 */

import { ReactNode, useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { Navigate, useLocation } from 'react-router-dom';

type UserRole = 'learner' | 'coach' | 'admin' | 'hr';

const dashboardRoutes: Record<UserRole, string> = {
  learner: '/portal/overview',
  coach: '/coach',
  hr: '/hr',
  admin: '/admin',
};

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#b91c1c] border-t-transparent"></div>
      <p className="mt-4 text-gray-600">Vérification des permissions...</p>
    </div>
  </div>
);

const AccessDenied = ({ userRole, requiredRole }: { userRole: UserRole; requiredRole: UserRole }) => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
      <div className="text-6xl mb-4">🚫</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès Refusé</h1>
      <p className="text-gray-600 mb-6">
        Cette page nécessite un accès de niveau <strong>{requiredRole}</strong>.
        Votre rôle actuel est <strong>{userRole}</strong>.
      </p>
      <a href={dashboardRoutes[userRole]} className="inline-block px-6 py-3 bg-[#b91c1c] text-white rounded-lg hover:bg-[#991b1b] transition-colors font-medium">
        Retour à mon tableau de bord
      </a>
    </div>
  </div>
);

interface RoleBasedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export function RoleBasedRoute({ children, allowedRoles, redirectTo }: RoleBasedRouteProps) {
  const { isLoaded, isSignedIn, user } = useUser();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const userRole = (user?.publicMetadata?.role as UserRole) || 'learner';

  useEffect(() => {
    if (isLoaded) setIsChecking(false);
  }, [isLoaded]);

  if (!isLoaded || isChecking) return <LoadingSpinner />;
  if (!isSignedIn) return <Navigate to="/sign-in" state={{ from: location }} replace />;
  
  const hasAccess = allowedRoles.includes(userRole);
  if (!hasAccess) {
    if (redirectTo) return <Navigate to={redirectTo} replace />;
    return <AccessDenied userRole={userRole} requiredRole={allowedRoles[0]} />;
  }

  return <>{children}</>;
}

export function AdminRoute({ children }: { children: ReactNode }) {
  return <RoleBasedRoute allowedRoles={['admin']}>{children}</RoleBasedRoute>;
}

export function CoachRoute({ children }: { children: ReactNode }) {
  return <RoleBasedRoute allowedRoles={['coach', 'admin']}>{children}</RoleBasedRoute>;
}

export function HRRoute({ children }: { children: ReactNode }) {
  return <RoleBasedRoute allowedRoles={['hr', 'admin']}>{children}</RoleBasedRoute>;
}

export function LearnerRoute({ children }: { children: ReactNode }) {
  return <RoleBasedRoute allowedRoles={['learner', 'coach', 'hr', 'admin']}>{children}</RoleBasedRoute>;
}

export function useUserRole(): { role: UserRole; isLoading: boolean } {
  const { isLoaded, user } = useUser();
  const role = (user?.publicMetadata?.role as UserRole) || 'learner';
  return { role, isLoading: !isLoaded };
}

export function useHasPermission(allowedRoles: UserRole[]): boolean {
  const { role, isLoading } = useUserRole();
  if (isLoading) return false;
  return allowedRoles.includes(role);
}

export function RoleGate({ allowedRoles, children, fallback = null }: { allowedRoles: UserRole[]; children: ReactNode; fallback?: ReactNode }) {
  const hasPermission = useHasPermission(allowedRoles);
  if (!hasPermission) return <>{fallback}</>;
  return <>{children}</>;
}

export default RoleBasedRoute;
