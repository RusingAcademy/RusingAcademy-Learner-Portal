/**
 * AuthGuard — Protects routes that require authentication.
 * Wraps any page component and redirects to login if the user is not authenticated.
 * Shows a loading skeleton while checking auth state.
 */
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";

interface AuthGuardProps {
  children: React.ReactNode;
  /** Optional: require a specific role (e.g., "admin") */
  requiredRole?: string;
}

export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, loading, isAuthenticated } = useAuth({ redirectOnUnauthenticated: true });
  const { lang } = useLanguage();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fb]">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-[#0D7377] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500">
            {lang === "fr" ? "Vérification de l'authentification..." : "Verifying authentication..."}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // The useAuth hook will handle the redirect, this is just a fallback
    return null;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fb]">
        <div className="text-center max-w-md p-8">
          <span className="material-icons text-5xl text-red-400 mb-4">block</span>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            {lang === "fr" ? "Accès refusé" : "Access Denied"}
          </h1>
          <p className="text-sm text-gray-500">
            {lang === "fr"
              ? "Vous n'avez pas les permissions requises pour accéder à cette section."
              : "You do not have the required permissions to access this section."}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
