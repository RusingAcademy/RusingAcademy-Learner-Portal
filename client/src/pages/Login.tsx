import { useState, useRef } from "react";
import { Link, useSearch } from "wouter";
import { trpc } from "../lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { GuestRoute, useAuthContext } from "@/contexts/AuthContext";

// Debug mode
const AUTH_DEBUG = import.meta.env.VITE_AUTH_DEBUG === "true" || import.meta.env.DEV;

// Google Icon Component
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

// Microsoft Icon Component
function MicrosoftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
      <path fill="#f35325" d="M1 1h10v10H1z" />
      <path fill="#81bc06" d="M12 1h10v10H12z" />
      <path fill="#05a6f0" d="M1 12h10v10H1z" />
      <path fill="#ffba08" d="M12 12h10v10H12z" />
    </svg>
  );
}

/**
 * LoginContent - The actual login form
 * 
 * This component is only rendered for guests (not authenticated users)
 * The GuestRoute wrapper handles redirecting authenticated users to dashboard
 * 
 * Authentication flow:
 * 1. User submits email/password OR clicks "Sign in with Google"
 * 2. Server validates credentials and sets HTTP-only session cookie
 * 3. Client receives success response and redirects to dashboard
 * 4. No localStorage is used - session is managed via HTTP-only cookie
 */
function LoginContent() {
  const searchString = useSearch();
  const { refresh } = useAuthContext();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Get redirect URL from query params
  const searchParams = new URLSearchParams(searchString);
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  
  // Check for OAuth errors in URL
  const oauthError = searchParams.get("error");

  const loginMutation = trpc.customAuth.login.useMutation({
    onMutate: () => {
      if (AUTH_DEBUG) console.log("[Login] Mutation starting...");
    },
    onSuccess: (data) => {
      if (AUTH_DEBUG) console.log("[Login] Success:", data.user?.email);
      
      if (data.success) {
        setLoginSuccess(true);
        setError(null);
        
        // The server has set the HTTP-only cookie
        // Refresh auth context to pick up the new session
        refresh();
        
        // Hard redirect after a short delay to ensure cookie is set
        setTimeout(() => {
          if (AUTH_DEBUG) console.log("[Login] Redirecting to:", redirectTo);
          window.location.href = redirectTo;
        }, 500);
      } else {
        setError("Login failed. Please try again.");
        setIsSubmitting(false);
      }
    },
    onError: (err) => {
      if (AUTH_DEBUG) console.error("[Login] Error:", err.message);
      setError(err.message);
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setError(null);
    setLoginSuccess(false);
    setIsSubmitting(true);
    
    if (!formData.email || !formData.password) {
      setError("Please enter both email and password");
      setIsSubmitting(false);
      return;
    }
    
    loginMutation.mutate({
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGoogleSignIn = () => {
    // Redirect to Google OAuth endpoint
    window.location.href = "/api/auth/google";
  };

  const handleMicrosoftSignIn = () => {
    // Redirect to Microsoft OAuth endpoint
    window.location.href = "/api/auth/microsoft";
  };

  const isPending = loginMutation.isPending || isSubmitting;

  // Map OAuth errors to user-friendly messages
  const getOAuthErrorMessage = (error: string): string => {
    const errorMessages: Record<string, string> = {
      oauth_not_configured: "Sign-In is not configured. Please contact support.",
      invalid_state: "Security validation failed. Please try again.",
      no_code: "Authentication was cancelled. Please try again.",
      token_exchange_failed: "Failed to authenticate. Please try again.",
      userinfo_failed: "Failed to get your account information. Please try again.",
      oauth_failed: "Sign-In failed. Please try again or use email/password.",
      access_denied: "Access was denied. Please try again.",
    };
    return errorMessages[error] || "An error occurred during sign-in. Please try again.";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-md bg-slate-800/50 border-slate-700">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <img
              loading="lazy" src="https://rusingacademy-cdn.b-cdn.net/images/logos/rusingacademy-official.png"
              alt="RusingAcademy"
              className="h-16 w-auto"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-slate-400">
            Sign in to your RusingAcademy account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* OAuth Error Alert */}
          {oauthError && (
            <Alert variant="destructive" className="mb-4 bg-red-900/50 border-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{getOAuthErrorMessage(oauthError)}</AlertDescription>
            </Alert>
          )}

          {/* OAuth Sign-In Buttons */}
          <div className="space-y-3 mb-4">
            <Button
              type="button"
              variant="outline"
              className="w-full bg-white hover:bg-gray-100 text-gray-900 border-gray-300"
              onClick={handleGoogleSignIn}
              disabled={isPending || loginSuccess}
            >
              <GoogleIcon className="mr-2 h-5 w-5" />
              Continue with Google
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="w-full bg-[#2F2F2F] hover:bg-[#3F3F3F] text-white border-slate-600"
              onClick={handleMicrosoftSignIn}
              disabled={isPending || loginSuccess}
            >
              <MicrosoftIcon className="mr-2 h-5 w-5" />
              Continue with Microsoft
            </Button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-600" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-800/50 px-2 text-slate-400">
                Or continue with email
              </span>
            </div>
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="bg-red-900/50 border-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {loginSuccess && (
              <Alert className="bg-green-900/50 border-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-400">
                  Login successful! Redirecting...
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isPending || loginSuccess}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-200">
                  Password
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-teal-400 hover:text-teal-300"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isPending || loginSuccess}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-800 rounded"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white"
              disabled={isPending || loginSuccess}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : loginSuccess ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Success!
                </>
              ) : (
                "Sign In with Email"
              )}
            </Button>
          </form>

          {/* Debug panel - only in development */}
          {AUTH_DEBUG && (
            <div className="mt-4 p-3 bg-slate-900/80 border border-slate-700 rounded-lg text-xs font-mono">
              <div className="text-teal-400 font-bold mb-2">🔧 Auth Debug</div>
              <div className="text-slate-300">
                <div>Redirect to: {redirectTo}</div>
                <div>Login success: {loginSuccess ? "yes" : "no"}</div>
                <div>Is pending: {isPending ? "yes" : "no"}</div>
                <div>Auth method: HTTP-only cookie</div>
                <div>OAuth error: {oauthError || "none"}</div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-slate-400">
            Don't have an account?{" "}
            <Link to="/signup" className="text-teal-400 hover:text-teal-300">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

/**
 * Login - Login page wrapped with GuestRoute
 * 
 * GuestRoute ensures:
 * 1. Shows loading while auth is being checked
 * 2. Redirects to dashboard if already authenticated
 * 3. Only shows login form for guests
 * 
 * This prevents the "flicker" issue where authenticated users
 * briefly see the login page before being redirected
 */
export default function Login() {
  return (
    <GuestRoute redirectTo="/dashboard">
      <LoginContent />
    </GuestRoute>
  );
}
