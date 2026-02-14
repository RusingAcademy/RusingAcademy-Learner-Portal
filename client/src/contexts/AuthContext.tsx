import { createContext, useContext, ReactNode, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

// Auth context type
interface AuthContextType {
  user: {
    id: number;
    name: string | null;
    email: string | null;
    role: string;
    avatar?: string | null;
    openId?: string;
  } | null;
  loading: boolean;
  isLoading?: boolean; // Alias for loading
  error: Error | null;
  isAuthenticated: boolean;
  refresh: () => void;
  logout: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  
  return (
    <AuthContext.Provider value={auth as unknown as AuthContextType}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // If not in provider, use the hook directly
    return useAuth() as unknown as AuthContextType;
  }
  return context;
}

// GuestRoute - Only renders children if user is NOT authenticated
// Redirects to dashboard if user is already logged in
interface GuestRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export function GuestRoute({ children, redirectTo = "/dashboard" }: GuestRouteProps) {
  const { user, loading, isAuthenticated } = useAuthContext();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Wait for loading to complete
    if (loading) return;
    
    // If user is authenticated, redirect to dashboard
    if (isAuthenticated && user) {
      // Use window.location for hard redirect to ensure cookies are sent
      window.location.href = redirectTo;
    }
  }, [loading, isAuthenticated, user, redirectTo, setLocation]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
      </div>
    );
  }

  // If authenticated, don't render children (redirect will happen)
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  // User is not authenticated, render the guest content
  return <>{children}</>;
}

// ProtectedRoute - Only renders children if user IS authenticated
// Redirects to login if user is not logged in
interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ children, redirectTo = "/login" }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuthContext();

  useEffect(() => {
    // Wait for loading to complete
    if (loading) return;
    
    // If user is not authenticated, redirect to login
    if (!isAuthenticated || !user) {
      window.location.href = redirectTo;
    }
  }, [loading, isAuthenticated, user, redirectTo]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
      </div>
    );
  }

  // If not authenticated, don't render children (redirect will happen)
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
}

export default AuthContext;
