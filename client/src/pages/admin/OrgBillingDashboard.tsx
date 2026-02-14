import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Building2, Users, CreditCard, Receipt, TrendingUp, ArrowRight } from "lucide-react";

export default function OrgBillingDashboard() {

  const [selectedOrgId] = useState(1);
  const [newSeats, setNewSeats] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("professional");
  const [billingCycle, setBillingCycle] = useState("monthly");

  const billingQuery = trpc.orgBilling.getBillingOverview.useQuery({ orgId: selectedOrgId });
  const invoicesQuery = trpc.orgBilling.getInvoices.useQuery({ orgId: selectedOrgId });
  const pricingQuery = trpc.orgBilling.getPricingTiers.useQuery();
  const updateSeatsMutation = trpc.orgBilling.updateSeats.useMutation({
    onSuccess: (data: any) => {
      toast.success(`Updated to ${data.seats} seats.`);
      billingQuery.refetch();
      invoicesQuery.refetch();
    },
  });
  const checkoutMutation = trpc.orgBilling.createOrgCheckout.useMutation({
    onSuccess: (data: any) => {
      if (data.url) window.location.href = data.url;
      else toast.error(data.error || "Checkout failed");
    },
  });

  const billing = billingQuery.data as any;
  const invoices = (invoicesQuery.data || []) as any[];
  const tiers = (pricingQuery.data || []) as any[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Organization Billing</h2>
          <p className="text-muted-foreground">Manage seat-based billing, invoices, and plan upgrades for your organization.</p>
        </div>
        {billing && <Badge variant="outline" className="gap-1"><Building2 className="h-3 w-3" /> {billing.orgName}</Badge>}
      </div>

      {/* Billing Overview */}
      {billing && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="pt-6">
            <CreditCard className="h-8 w-8 mb-2 text-blue-500" />
            <div className="text-2xl font-bold capitalize">{billing.plan}</div>
            <p className="text-sm text-muted-foreground">Current Plan</p>
          </CardContent></Card>
          <Card><CardContent className="pt-6">
            <Users className="h-8 w-8 mb-2 text-green-500" />
            <div className="text-2xl font-bold">{billing.seats}</div>
            <p className="text-sm text-muted-foreground">Active Seats</p>
          </CardContent></Card>
          <Card><CardContent className="pt-6">
            <Receipt className="h-8 w-8 mb-2 text-amber-500" />
            <div className="text-2xl font-bold">${billing.monthlyTotal?.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground">Monthly Total (CAD)</p>
          </CardContent></Card>
          <Card><CardContent className="pt-6">
            <TrendingUp className="h-8 w-8 mb-2 text-purple-500" />
            <div className="text-2xl font-bold">${billing.annualTotal?.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground">Annual (15% off)</p>
          </CardContent></Card>
        </div>
      )}

      {/* Seat Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Manage Seats</CardTitle>
          <CardDescription>Adjust the number of seats for your organization. Changes take effect on the next billing cycle.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input
              type="number"
              placeholder="New seat count"
              value={newSeats}
              onChange={(e) => setNewSeats(e.target.value)}
              className="w-40"
              min={1}
              max={1000}
            />
            <Button
              onClick={() => updateSeatsMutation.mutate({ orgId: selectedOrgId, seats: Number(newSeats) })}
              disabled={updateSeatsMutation.isPending || !newSeats || Number(newSeats) < 1}
            >
              {updateSeatsMutation.isPending ? "Updating..." : "Update Seats"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Tiers */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Plans</CardTitle>
          <CardDescription>Choose the right plan for your organization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tiers.map((tier: any) => (
              <div key={tier.plan} className={`p-6 rounded-lg border-2 transition-colors ${selectedPlan === tier.plan ? "border-primary bg-primary/5" : "border-border"}`}>
                <h3 className="text-lg font-bold capitalize mb-1">{tier.plan}</h3>
                <div className="text-3xl font-bold mb-1">${tier.seatPrice}<span className="text-sm font-normal text-muted-foreground">/seat/mo</span></div>
                <ul className="space-y-1 mb-4">
                  {tier.features?.map((f: string) => (
                    <li key={f} className="text-sm text-muted-foreground flex items-center gap-1">
                      <ArrowRight className="h-3 w-3 text-green-500" /> {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={selectedPlan === tier.plan ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setSelectedPlan(tier.plan)}
                >
                  {selectedPlan === tier.plan ? "Selected" : "Select"}
                </Button>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-6 pt-4 border-t">
            <Select value={billingCycle} onValueChange={setBillingCycle}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="annual">Annual (15% off)</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => checkoutMutation.mutate({
                orgId: selectedOrgId,
                plan: selectedPlan as any,
                seats: billing?.seats || 10,
                billingCycle: billingCycle as any,
              })}
              disabled={checkoutMutation.isPending}
            >
              {checkoutMutation.isPending ? "Processing..." : "Proceed to Checkout"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Receipt className="h-5 w-5" /> Invoice History</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No invoices yet.</div>
          ) : (
            <div className="space-y-2">
              {invoices.map((inv: any) => (
                <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{inv.id}</p>
                      <p className="text-xs text-muted-foreground">{inv.period} — {inv.seats} seats × ${inv.seatPrice}/seat</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">${inv.amount?.toFixed(2)} {inv.currency}</span>
                    <Badge variant={inv.status === "paid" ? "default" : "secondary"}>{inv.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
