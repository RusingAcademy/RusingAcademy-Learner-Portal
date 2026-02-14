import { useState } from "react";
import { Link, useSearch } from "wouter";
import { trpc } from "../lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Loader2, CheckCircle, AlertCircle, Home } from "lucide-react";
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
 * SignupContent - The actual signup form
 * 
 * Authentication flow:
 * 1. User submits name/email/password OR clicks "Sign up with Google"
 * 2. Server creates account and sets HTTP-only session cookie
 * 3. Client receives success response and redirects to dashboard
 * 4. No localStorage is used - session is managed via HTTP-only cookie
 */
function SignupContent() {
  const searchString = useSearch();
  const { refresh } = useAuthContext();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Check for OAuth errors in URL
  const searchParams = new URLSearchParams(searchString);
  const oauthError = searchParams.get("error");

  const signupMutation = trpc.customAuth.signup.useMutation({
    onSuccess: (data) => {
      if (AUTH_DEBUG) console.log("[Signup] Success:", data.user?.email);
      
      if (data.success) {
        setSuccess(true);
        
        // The server has set the HTTP-only cookie
        // Refresh auth context to pick up the new session
        refresh();
        
        // Hard redirect after showing success message
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
      }
    },
    onError: (err) => {
      if (AUTH_DEBUG) console.error("[Signup] Error:", err.message);
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password length
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    signupMutation.mutate({
      name: formData.name,
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      role: "learner",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleGoogleSignUp = () => {
    // Redirect to Google OAuth endpoint (same as login - creates account if new)
    window.location.href = "/api/auth/google";
  };

  const handleMicrosoftSignUp = () => {
    // Redirect to Microsoft OAuth endpoint (same as login - creates account if new)
    window.location.href = "/api/auth/microsoft";
  };

  // Map OAuth errors to user-friendly messages
  const getOAuthErrorMessage = (error: string): string => {
    const errorMessages: Record<string, string> = {
      oauth_not_configured: "Sign-Up is not configured. Please contact support.",
      invalid_state: "Security validation failed. Please try again.",
      no_code: "Authentication was cancelled. Please try again.",
      token_exchange_failed: "Failed to authenticate. Please try again.",
      userinfo_failed: "Failed to get your account information. Please try again.",
      oauth_failed: "Sign-Up failed. Please try again or use email/password.",
      access_denied: "Access was denied. Please try again.",
    };
    return errorMessages[error] || "An error occurred during sign-up. Please try again.";
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <Card className="w-full max-w-md bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold text-white">Account Created!</h2>
              <p className="text-slate-300">
                Please check your email to verify your account.
              </p>
              <p className="text-sm text-slate-400">
                Redirecting to dashboard...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 relative">
      {/* Home Button */}
      <Link href="/">
        <button className="absolute top-4 left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/20">
          <Home className="h-5 w-5 text-white" />
        </button>
      </Link>
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
            Create Your Account
          </CardTitle>
          <CardDescription className="text-slate-400">
            Join RusingAcademy and start your bilingual journey
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

          {/* OAuth Sign-Up Buttons */}
          <div className="space-y-3 mb-4">
            <Button
              type="button"
              variant="outline"
              className="w-full bg-white hover:bg-gray-100 text-gray-900 border-gray-300"
              onClick={handleGoogleSignUp}
              disabled={signupMutation.isPending}
            >
              <GoogleIcon className="mr-2 h-5 w-5" />
              Continue with Google
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="w-full bg-[#2F2F2F] hover:bg-[#3F3F3F] text-white border-slate-600"
              onClick={handleMicrosoftSignUp}
              disabled={signupMutation.isPending}
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
                Or sign up with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="bg-red-900/50 border-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-200">
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={signupMutation.isPending}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>

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
                disabled={signupMutation.isPending}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password (min 8 characters)"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  disabled={signupMutation.isPending}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 pr-10"
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-200">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={signupMutation.isPending}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white"
              disabled={signupMutation.isPending}
            >
              {signupMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account with Email"
              )}
            </Button>
          </form>

          {/* Debug panel - only in development */}
          {AUTH_DEBUG && (
            <div className="mt-4 p-3 bg-slate-900/80 border border-slate-700 rounded-lg text-xs font-mono">
              <div className="text-teal-400 font-bold mb-2">🔧 Auth Debug</div>
              <div className="text-slate-300">
                <div>Is pending: {signupMutation.isPending ? "yes" : "no"}</div>
                <div>Auth method: HTTP-only cookie</div>
                <div>OAuth error: {oauthError || "none"}</div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="text-teal-400 hover:text-teal-300 font-medium">
              Sign in
            </Link>
          </div>
          <div className="text-center text-xs text-slate-500">
            By creating an account, you agree to our{" "}
            <Link to="/terms" className="text-teal-400 hover:text-teal-300">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-teal-400 hover:text-teal-300">
              Privacy Policy
            </Link>
          </div>
          <div className="text-center text-xs text-slate-600 pt-4 border-t border-slate-700">
            Powered by Rusinga International Consulting Ltd. ( RusingAcademy )
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

/**
 * Signup - Signup page wrapped with GuestRoute
 */
export default function Signup() {
  return (
    <GuestRoute redirectTo="/dashboard">
      <SignupContent />
    </GuestRoute>
  );
}
