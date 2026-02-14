import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Users, DollarSign, TrendingUp, Copy, Gift, Award, ArrowRight } from "lucide-react";

export default function AffiliateDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [payoutAmount, setPayoutAmount] = useState("");

  const dashboardQuery = trpc.affiliate.getDashboard.useQuery(undefined, { enabled: isAuthenticated });
  const referralsQuery = trpc.affiliate.getReferrals.useQuery(undefined, { enabled: isAuthenticated });
  const payoutMutation = trpc.affiliate.requestPayout.useMutation({
    onSuccess: (data: any) => {
      toast.success(data.message);
      setPayoutAmount("");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="container py-16 text-center">
        <Gift className="h-16 w-16 mx-auto mb-4 text-amber-500" />
        <h1 className="text-3xl font-bold mb-4">RusingAcademy Affiliate Program</h1>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Earn commissions by referring professionals to our bilingual training programs.
        </p>
        <Button onClick={() => window.location.href = getLoginUrl()}>
          Sign In to Join <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    );
  }

  const dashboard = dashboardQuery.data as any;
  const referrals = (referralsQuery.data || []) as any[];

  return (
    <div className="container py-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Affiliate Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name}. Track your referrals and earnings.</p>
      </div>

      <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">Your Referral Link</p>
              <div className="flex gap-2">
                <Input readOnly value={dashboard?.referralLink || "Loading..."} className="bg-white dark:bg-background" />
                <Button variant="outline" onClick={() => {
                  navigator.clipboard.writeText(dashboard?.referralLink || "");
                  toast.success("Referral link copied to clipboard.");
                }}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6">
          <Users className="h-8 w-8 mb-2 text-blue-500" />
          <div className="text-2xl font-bold">{dashboard?.stats?.totalReferrals || 0}</div>
          <p className="text-sm text-muted-foreground">Total Referrals</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <TrendingUp className="h-8 w-8 mb-2 text-green-500" />
          <div className="text-2xl font-bold">{dashboard?.stats?.conversions || 0}</div>
          <p className="text-sm text-muted-foreground">Conversions</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <DollarSign className="h-8 w-8 mb-2 text-amber-500" />
          <div className="text-2xl font-bold">${dashboard?.earnings?.total?.toFixed(2) || "0.00"}</div>
          <p className="text-sm text-muted-foreground">Total Earnings</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <Gift className="h-8 w-8 mb-2 text-purple-500" />
          <div className="text-2xl font-bold">${dashboard?.earnings?.pending?.toFixed(2) || "0.00"}</div>
          <p className="text-sm text-muted-foreground">Pending Payout</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Award className="h-5 w-5 text-amber-500" /> Commission Tiers</CardTitle>
          <CardDescription>Earn more as you refer more professionals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {dashboard?.tiers?.map((tier: any) => (
              <div key={tier.name} className="p-4 rounded-lg border text-center">
                <Badge variant="outline" className="mb-2">{tier.name}</Badge>
                <div className="text-2xl font-bold text-amber-600">{tier.commission}%</div>
                <p className="text-xs text-muted-foreground">{tier.minReferrals}+ referrals</p>
                <p className="text-xs text-muted-foreground">Bonus: {tier.bonus}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Request Payout</CardTitle>
          <CardDescription>Minimum payout: $50 CAD. Processing: 5-7 business days.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input type="number" placeholder="Amount (CAD)" value={payoutAmount} onChange={(e) => setPayoutAmount(e.target.value)} className="w-48" />
            <Button onClick={() => payoutMutation.mutate({ amount: Number(payoutAmount) })} disabled={payoutMutation.isPending || Number(payoutAmount) < 50}>
              {payoutMutation.isPending ? "Requesting..." : "Request Payout"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Referral History</CardTitle></CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No referrals yet. Share your link to start earning!</div>
          ) : (
            <div className="space-y-2">
              {referrals.map((ref: any, idx: number) => (
                <div key={ref.id || idx} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium text-sm">{ref.referredName || ref.referredEmail || "Pending"}</p>
                    <p className="text-xs text-muted-foreground">{new Date(ref.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Badge variant={ref.status === "converted" ? "default" : "secondary"}>{ref.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
