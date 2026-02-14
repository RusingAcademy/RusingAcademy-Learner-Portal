/**
 * ProtectedRoute Component
 * Uses Clerk authentication to protect routes
 * Sprint 8: User Dashboard & Protected Routes
 */

import { useUser, RedirectToSignIn } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
    const { isLoaded, isSignedIn, user } = useUser();

    // Show loading state while Clerk is initializing
    if (!isLoaded) {
        return (
            fallback || (
                <div className="min-h-screen flex items-center justify-center bg-white">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        <p className="text-slate-600 font-medium">Loading...</p>
                    </div>
                </div>
            )
        );
    }
  
    // Redirect to sign-in if not authenticated
    if (!isSignedIn) {
        return <RedirectToSignIn />;
    }
  
    // User is authenticated, render children
    return <>{children}</>;
}

/**
 * Higher-order component version for wrapping route components
 */
export function withProtectedRoute<P extends object>(
    WrappedComponent: React.ComponentType<P>
) {
    return function ProtectedComponent(props: P) {
        return (
            <ProtectedRoute>
                <WrappedComponent {...props} />
            </ProtectedRoute>
        );
    };
}
