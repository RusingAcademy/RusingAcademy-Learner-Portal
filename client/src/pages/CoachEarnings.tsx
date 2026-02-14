import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  ExternalLink,
  Copy,
  CheckCircle,
  Clock,
  AlertCircle,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Receipt,
  Share2,
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { useAppLayout } from "@/contexts/AppLayoutContext";

export default function CoachEarnings() {
  const { isInsideAppLayout } = useAppLayout();
  const { language } = useLanguage();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [copiedReferral, setCopiedReferral] = useState(false);

  // tRPC queries
  const { data: commissionData, isLoading: commissionLoading } = trpc.commission.myCommission.useQuery();
  const { data: ledgerData, isLoading: ledgerLoading } = trpc.commission.myLedger.useQuery({ limit: 20 });
  const { data: referralLink } = trpc.commission.myReferralLink.useQuery();
  const { data: stripeStatus } = trpc.stripe.accountStatus.useQuery();

  const startOnboarding = trpc.stripe.startOnboarding.useMutation({
    onSuccess: (data) => {
      window.open(data.url, "_blank");
      toast.success(language === "fr" ? "Redirection vers Stripe..." : "Redirecting to Stripe...");
    },
    onError: () => {
      toast.error(language === "fr" ? "Erreur lors de la configuration" : "Error setting up payments");
    },
  });

  const openDashboard = trpc.stripe.dashboardLink.useMutation({
    onSuccess: (data) => {
      window.open(data.url, "_blank");
    },
  });

  const createReferralLink = trpc.commission.createReferralLink.useMutation({
    onSuccess: () => {
      toast.success(language === "fr" ? "Lien de parrainage créé!" : "Referral link created!");
    },
  });

  const labels = {
    en: {
      title: "Earnings & Payouts",
      subtitle: "Track your income and manage payments",
      overview: "Overview",
      transactions: "Transactions",
      payouts: "Payouts",
      referrals: "Referrals",
      totalEarnings: "Total Earnings",
      pendingPayout: "Pending Payout",
      platformFees: "Platform Fees",
      netEarnings: "Net Earnings",
      sessionsCompleted: "Sessions Completed",
      commissionRate: "Your Commission Rate",
      commissionTier: "Commission Tier",
      hoursToNextTier: "hours to next tier",
      verifiedSLE: "Verified SLE Coach",
      standard: "Standard Coach",
      recentTransactions: "Recent Transactions",
      noTransactions: "No transactions yet",
      sessionPayment: "Session Payment",
      platformFee: "Platform Fee",
      refund: "Refund",
      payout: "Payout",
      stripeSetup: "Payment Setup",
      stripeNotConnected: "Connect your Stripe account to receive payments",
      stripeConnected: "Stripe account connected",
      stripeOnboarding: "Complete Stripe onboarding to start receiving payments",
      connectStripe: "Connect Stripe",
      completeSetup: "Complete Setup",
      viewStripeDashboard: "View Stripe Dashboard",
      referralProgram: "Referral Program",
      referralDescription: "Earn more by referring learners. When a learner books through your referral link, you keep more of the session fee.",
      yourReferralLink: "Your Referral Link",
      copyLink: "Copy Link",
      copied: "Copied!",
      createReferralLink: "Create Referral Link",
      referralCommission: "Referral Commission",
      referralClicks: "Link Clicks",
      referralConversions: "Conversions",
      loginRequired: "Please sign in to view your earnings",
      signIn: "Sign In",
      gross: "Gross",
      fee: "Fee",
      net: "Net",
    },
    fr: {
      title: "Revenus et paiements",
      subtitle: "Suivez vos revenus et gérez vos paiements",
      overview: "Aperçu",
      transactions: "Transactions",
      payouts: "Versements",
      referrals: "Parrainages",
      totalEarnings: "Revenus totaux",
      pendingPayout: "Versement en attente",
      platformFees: "Frais de plateforme",
      netEarnings: "Revenus nets",
      sessionsCompleted: "Sessions complétées",
      commissionRate: "Votre taux de commission",
      commissionTier: "Niveau de commission",
      hoursToNextTier: "heures avant le prochain niveau",
      verifiedSLE: "Coach SLE vérifié",
      standard: "Coach standard",
      recentTransactions: "Transactions récentes",
      noTransactions: "Aucune transaction pour le moment",
      sessionPayment: "Paiement de session",
      platformFee: "Frais de plateforme",
      refund: "Remboursement",
      payout: "Versement",
      stripeSetup: "Configuration des paiements",
      stripeNotConnected: "Connectez votre compte Stripe pour recevoir des paiements",
      stripeConnected: "Compte Stripe connecté",
      stripeOnboarding: "Complétez l'intégration Stripe pour commencer à recevoir des paiements",
      connectStripe: "Connecter Stripe",
      completeSetup: "Terminer la configuration",
      viewStripeDashboard: "Voir le tableau de bord Stripe",
      referralProgram: "Programme de parrainage",
      referralDescription: "Gagnez plus en parrainant des apprenants. Lorsqu'un apprenant réserve via votre lien, vous gardez plus de frais de session.",
      yourReferralLink: "Votre lien de parrainage",
      copyLink: "Copier le lien",
      copied: "Copié!",
      createReferralLink: "Créer un lien de parrainage",
      referralCommission: "Commission de parrainage",
      referralClicks: "Clics sur le lien",
      referralConversions: "Conversions",
      loginRequired: "Veuillez vous connecter pour voir vos revenus",
      signIn: "Se connecter",
      gross: "Brut",
      fee: "Frais",
      net: "Net",
    },
  };

  const l = labels[language];

  const copyReferralLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(`https://lingueefy.com/ref/${referralLink.code}`);
      setCopiedReferral(true);
      toast.success(l.copied);
      setTimeout(() => setCopiedReferral(false), 2000);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat(language === "fr" ? "fr-CA" : "en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(cents / 100);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString(language === "fr" ? "fr-CA" : "en-CA", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Show login prompt if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        {!isInsideAppLayout && <Header />}
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardHeader className="text-center">
              <CardTitle>{l.title}</CardTitle>
              <CardDescription>{l.loginRequired}</CardDescription>
            </CardHeader>
            <CardContent>
              <a href={getLoginUrl()} className="block">
                <Button className="w-full" size="lg">
                  {l.signIn}
                </Button>
              </a>
            </CardContent>
          </Card>
        </main>
        {!isInsideAppLayout && <Footer />}
      </div>
    );
  }

  const earnings = commissionData?.earnings || {
    totalGross: 0,
    totalFees: 0,
    totalNet: 0,
    pendingPayout: 0,
    sessionCount: 0,
  };

  const commission = commissionData?.commission;
  const commissionRate = commission?.tier?.commissionBps || 2600;
  const commissionPercent = commissionRate / 100;

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      {!isInsideAppLayout && <Header />}

      <main id="main-content" className="flex-1">
        <div className="container py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold">{l.title}</h1>
            <p className="text-slate-900 dark:text-slate-100">{l.subtitle}</p>
          </div>

          {/* Stripe Setup Banner */}
          {!stripeStatus?.isOnboarded && (
            <Card className="mb-6 border-[#FFE4D6] bg-amber-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-amber-900">{l.stripeSetup}</p>
                      <p className="text-sm text-amber-700">
                        {stripeStatus?.hasAccount ? l.stripeOnboarding : l.stripeNotConnected}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => startOnboarding.mutate()}
                    disabled={startOnboarding.isPending}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    {stripeStatus?.hasAccount ? l.completeSetup : l.connectStripe}
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{formatCurrency(earnings.totalNet)}</p>
                    <p className="text-xs text-slate-900 dark:text-slate-100">{l.netEarnings}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{formatCurrency(earnings.pendingPayout)}</p>
                    <p className="text-xs text-slate-900 dark:text-slate-100">{l.pendingPayout}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#E7F2F2] flex items-center justify-center">
                    <Receipt className="h-5 w-5 text-[#0F3D3E]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{earnings.sessionCount}</p>
                    <p className="text-xs text-slate-900 dark:text-slate-100">{l.sessionsCompleted}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{100 - commissionPercent}%</p>
                    <p className="text-xs text-slate-900 dark:text-slate-100">{l.commissionRate}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Commission Tier Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{l.commissionTier}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={commission?.tier?.tierType === "verified_sle" ? "default" : "secondary"}>
                          {commission?.tier?.tierType === "verified_sle" ? l.verifiedSLE : l.standard}
                        </Badge>
                        <span className="text-sm text-slate-900 dark:text-slate-100">
                          {commission?.tier?.name || "Standard - Tier 1"}
                        </span>
                      </div>
                      <span className="font-bold text-lg text-primary">
                        {commissionPercent}% {language === "fr" ? "commission" : "commission"}
                      </span>
                    </div>

                    {/* Progress to next tier */}
                    {commission?.tier?.tierType === "standard" && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-900 dark:text-slate-100">
                            {earnings.sessionCount} {language === "fr" ? "heures complétées" : "hours completed"}
                          </span>
                          <span className="text-slate-900 dark:text-slate-100">
                            {commission?.tier?.maxHours || 100} {l.hoursToNextTier}
                          </span>
                        </div>
                        <Progress
                          value={Math.min((earnings.sessionCount / (commission?.tier?.maxHours || 100)) * 100, 100)}
                          className="h-2"
                        />
                      </div>
                    )}

                    {/* Commission breakdown explanation */}
                    <div className="bg-muted/50 rounded-lg p-4 mt-4">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-slate-900 dark:text-slate-100 mt-0.5" />
                        <div className="text-sm text-slate-900 dark:text-slate-100">
                          {language === "fr" ? (
                            <>
                              <p className="mb-2">
                                <strong>Sessions d'essai:</strong> 0% de commission (vous gardez 100%)
                              </p>
                              <p>
                                <strong>Sessions payantes:</strong> {commissionPercent}% de commission. Votre taux diminue à mesure que vous complétez plus d'heures.
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="mb-2">
                                <strong>Trial sessions:</strong> 0% commission (you keep 100%)
                              </p>
                              <p>
                                <strong>Paid sessions:</strong> {commissionPercent}% commission. Your rate decreases as you complete more hours.
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Transactions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{l.recentTransactions}</CardTitle>
                </CardHeader>
                <CardContent>
                  {ledgerData && ledgerData.length > 0 ? (
                    <div className="space-y-3">
                      {ledgerData.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                              entry.transactionType === "session_payment"
                                ? "bg-emerald-100"
                                : entry.transactionType === "refund"
                                ? "bg-red-100"
                                : "bg-blue-100"
                            }`}>
                              {entry.transactionType === "session_payment" ? (
                                <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                              ) : entry.transactionType === "refund" ? (
                                <ArrowDownRight className="h-4 w-4 text-red-600" />
                              ) : (
                                <DollarSign className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {entry.transactionType === "session_payment"
                                  ? l.sessionPayment
                                  : entry.transactionType === "refund"
                                  ? l.refund
                                  : l.payout}
                              </p>
                              <p className="text-xs text-slate-900 dark:text-slate-100">
                                {formatDate(entry.createdAt)}
                                {entry.isTrialSession && (
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    Trial
                                  </Badge>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-medium ${
                              entry.transactionType === "refund" ? "text-red-600" : "text-emerald-600"
                            }`}>
                              {entry.transactionType === "refund" ? "-" : "+"}
                              {formatCurrency(entry.netAmount)}
                            </p>
                            {entry.transactionType === "session_payment" && (
                              <p className="text-xs text-slate-900 dark:text-slate-100">
                                {l.gross}: {formatCurrency(entry.grossAmount)} • {l.fee}: {formatCurrency(entry.platformFee)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Receipt className="h-12 w-12 mx-auto text-slate-900 dark:text-slate-100 mb-4" />
                      <p className="text-slate-900 dark:text-slate-100">{l.noTransactions}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stripe Dashboard */}
              {stripeStatus?.isOnboarded && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                      {l.stripeConnected}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => openDashboard.mutate()}
                      disabled={openDashboard.isPending}
                    >
                      {l.viewStripeDashboard}
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Referral Program */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Share2 className="h-5 w-5" />
                    {l.referralProgram}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-900 dark:text-slate-100">{l.referralDescription}</p>

                  {referralLink ? (
                    <>
                      <div>
                        <label className="text-sm font-medium">{l.yourReferralLink}</label>
                        <div className="flex gap-2 mt-1">
                          <input
                            type="text"
                            readOnly
                            value={`lingueefy.com/ref/${referralLink.code}`}
                            className="flex-1 px-3 py-2 text-sm border rounded-md bg-muted"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={copyReferralLink}
                          >
                            {copiedReferral ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <p className="text-2xl font-bold">{referralLink.clickCount || 0}</p>
                          <p className="text-xs text-slate-900 dark:text-slate-100">{l.referralClicks}</p>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <p className="text-2xl font-bold">{referralLink.bookingCount || 0}</p>
                          <p className="text-xs text-slate-900 dark:text-slate-100">{l.referralConversions}</p>
                        </div>
                      </div>

                      <div className="bg-emerald-50 rounded-lg p-3">
                        <p className="text-sm text-emerald-700">
                          <strong>{l.referralCommission}:</strong>{" "}
                          {language === "fr"
                            ? `Seulement ${(referralLink.discountCommissionBps || 500) / 100}% de commission sur les réservations référées`
                            : `Only ${(referralLink.discountCommissionBps || 500) / 100}% commission on referred bookings`}
                        </p>
                      </div>
                    </>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => createReferralLink.mutate()}
                      disabled={createReferralLink.isPending}
                    >
                      {l.createReferralLink}
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Earnings Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{l.overview}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-900 dark:text-slate-100">{l.totalEarnings}</span>
                    <span className="font-medium">{formatCurrency(earnings.totalGross)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-900 dark:text-slate-100">{l.platformFees}</span>
                    <span className="font-medium text-red-600">-{formatCurrency(earnings.totalFees)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{l.netEarnings}</span>
                      <span className="font-bold text-emerald-600">{formatCurrency(earnings.totalNet)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {!isInsideAppLayout && <Footer />}
    </div>
  );
}
