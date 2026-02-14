import { useState } from "react";
import { useAuth } from "../_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  CreditCard,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Calendar,
  ArrowRight,
  Shield,
  Zap,
  RefreshCw,
} from "lucide-react";

export default function CoachPayments() {
  const { user } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);

  // Get Stripe account status - this will return hasAccount: false if no account
  const { data: stripeStatus } = trpc.stripe.accountStatus.useQuery();

  // Get commission tiers for display
  const { data: commissionTiers } = trpc.commission.tiers.useQuery();
  
  // Placeholder earnings data
  const earnings = {
    totalEarned: 0,
    thisMonth: 0,
    pending: 0,
    totalSessions: 0,
  };
  
  const hasStripeAccount = stripeStatus?.hasAccount;

  // Mutations
  const createAccount = trpc.stripe.startOnboarding.useMutation({
    onSuccess: (data: { url: string; accountId: string }) => {
      window.location.href = data.url;
    },
    onError: () => {
      setIsConnecting(false);
    },
  });

  const getOnboardingLink = trpc.stripe.startOnboarding.useMutation({
    onSuccess: (data: { url: string; accountId: string }) => {
      window.location.href = data.url;
    },
  });

  const getDashboardLink = trpc.stripe.dashboardLink.useMutation({
    onSuccess: (data: { url: string }) => {
      window.open(data.url, "_blank");
    },
  });

  const handleConnectStripe = () => {
    setIsConnecting(true);
    createAccount.mutate();
  };

  const handleContinueOnboarding = () => {
    getOnboardingLink.mutate();
  };

  const handleOpenDashboard = () => {
    getDashboardLink.mutate();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Please Sign In
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You need to be signed in as a coach to access this page.
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  const isOnboarded = stripeStatus?.isOnboarded && ('chargesEnabled' in (stripeStatus || {}) ? (stripeStatus as { chargesEnabled?: boolean }).chargesEnabled : false);
  const needsAction = 'requiresAction' in (stripeStatus || {}) ? (stripeStatus as { requiresAction?: boolean }).requiresAction : false;
  const hasAccount = stripeStatus?.hasAccount;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Payments & Payouts
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your Stripe Connect account and view your earnings
          </p>
        </div>

        {/* Stripe Connect Status Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-[#145A5B] rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Stripe Connect
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive payments directly to your bank account
                </p>
              </div>
            </div>
            
            {/* Status Badge */}
            {hasAccount ? (
              isOnboarded ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                  <CheckCircle className="w-4 h-4" />
                  Connected
                </span>
              ) : needsAction ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">
                  <AlertCircle className="w-4 h-4" />
                  Action Required
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                  <Clock className="w-4 h-4" />
                  Pending
                </span>
              )
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                Not Connected
              </span>
            )}
          </div>

          {/* Connection Status Details */}
          {!hasAccount ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-indigo-50 to-[#FFFFFF] dark:from-indigo-900/20 dark:to-[#145A5B]/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Why Connect with Stripe?
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center shadow-sm">
                      <Zap className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Fast Payouts</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Receive payments within 2-3 business days
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center shadow-sm">
                      <Shield className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Secure</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Bank-level security and fraud protection
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center shadow-sm">
                      <TrendingUp className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Track Earnings</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Full dashboard with detailed analytics
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleConnectStripe}
                disabled={isConnecting}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-[#145A5B] text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-[#145A5B] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    Connect with Stripe
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          ) : isOnboarded ? (
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Charges Enabled</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    You can accept payments from students
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Payouts Enabled</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Earnings are transferred to your bank
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Fully Verified</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Your identity has been verified
                  </p>
                </div>
              </div>

              <button
                onClick={handleOpenDashboard}
                className="w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-5 h-5" />
                Open Stripe Dashboard
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                      Complete Your Setup
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      Your Stripe account needs additional information before you can receive payments.
                      This typically takes 5-10 minutes.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleContinueOnboarding}
                className="w-full py-3 bg-yellow-500 text-white rounded-xl font-medium hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2"
              >
                Continue Setup
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Earnings Summary */}
        {earnings && (
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Total Earned</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                ${((earnings.totalEarned || 0) / 100).toFixed(2)}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">This Month</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                ${((earnings.thisMonth || 0) / 100).toFixed(2)}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#E7F2F2] dark:bg-[#E7F2F2]/30 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#0F3D3E] dark:text-[#0F3D3E]" />
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Pending</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                ${((earnings.pending || 0) / 100).toFixed(2)}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Sessions</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {earnings.totalSessions || 0}
              </div>
            </div>
          </div>
        )}

        {/* Commission Info */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Commission Structure
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Standard Rate</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">Platform fee on each session</p>
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">15%</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Verified SLE Coach</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">With official SLE certification</p>
              </div>
              <span className="text-lg font-semibold text-green-600 dark:text-green-400">10%</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <span className="font-medium text-gray-900 dark:text-white">High Volume (50+ hrs/month)</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">For active coaches</p>
              </div>
              <span className="text-lg font-semibold text-green-600 dark:text-green-400">12%</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
