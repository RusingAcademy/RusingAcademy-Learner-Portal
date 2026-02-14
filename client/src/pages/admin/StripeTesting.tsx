import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  CreditCard, CheckCircle, XCircle, Clock, RefreshCw,
  AlertTriangle, Zap, Copy, ExternalLink, Shield,
  ArrowRight, Bell, BarChart3, Users, Webhook,
  TestTube, Rocket, ChevronRight, Activity,
} from "lucide-react";

// ============================================================================
// STATUS BADGE
// ============================================================================
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    processed: { variant: "default", label: "Processed" },
    received: { variant: "secondary", label: "Received" },
    failed: { variant: "destructive", label: "Failed" },
  };
  const s = map[status] ?? { variant: "outline", label: status };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

// ============================================================================
// E2E FLOW STEP
// ============================================================================
function FlowStep({ icon: Icon, label, sublabel, status, isLast }: {
  icon: any; label: string; sublabel: string; status: "active" | "pending" | "success"; isLast?: boolean;
}) {
  const colors = {
    active: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    pending: "bg-muted text-muted-foreground border-muted",
    success: "bg-green-500/10 text-green-500 border-green-500/30",
  };
  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center gap-3 p-3 rounded-lg border ${colors[status]} min-w-[160px]`}>
        <Icon className="h-5 w-5 shrink-0" />
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-[10px] opacity-70">{sublabel}</p>
        </div>
      </div>
      {!isLast && <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function StripeTesting() {
  const [activeTab, setActiveTab] = useState("overview");
  const { data: stats, isLoading: statsLoading } = trpc.stripeTesting.getWebhookStats.useQuery();
  const { data: events, isLoading: eventsLoading, refetch: refetchEvents } = trpc.stripeTesting.getWebhookEvents.useQuery({});
  const { data: instructions } = trpc.stripeTesting.getTestInstructions.useQuery();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  // Determine if we're in test mode (no live keys configured)
  const isTestMode = true; // In production, check if STRIPE_SECRET_KEY starts with sk_live_

  // Compute e2e flow status based on webhook events
  const flowStatus = useMemo(() => {
    const evts = (events as any[]) ?? [];
    const hasPayment = evts.some((e: any) => e.eventType?.includes("payment_intent") || e.eventType?.includes("checkout"));
    const hasWebhook = evts.length > 0;
    const hasAnalytics = evts.some((e: any) => e.status === "processed");
    return { hasPayment, hasWebhook, hasAnalytics };
  }, [events]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header with Test Mode Indicator */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <CreditCard className="h-6 w-6" /> Stripe Testing & Webhooks
            </h1>
            {isTestMode ? (
              <Badge variant="outline" className="border-amber-500/50 text-amber-500 gap-1">
                <TestTube className="h-3 w-3" /> Test Mode
              </Badge>
            ) : (
              <Badge variant="default" className="bg-green-600 gap-1">
                <Rocket className="h-3 w-3" /> Live Mode
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Test payments, monitor webhooks, and verify your Stripe integration end-to-end
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { refetchEvents(); toast.success("Refreshed"); }}>
          <RefreshCw className="h-4 w-4 mr-1.5" /> Refresh
        </Button>
      </div>

      {/* Test Mode Banner */}
      {isTestMode && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <TestTube className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm">You are in Test Mode</p>
                <p className="text-xs text-muted-foreground mt-1">
                  All transactions are simulated and free. No real money is charged.
                  To switch to live mode, complete Stripe KYC verification and add your live keys in
                  <strong> Settings → Payment</strong>.
                </p>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => toast.info("Navigate to Settings → Payment to configure live keys")}>
                    <Rocket className="h-3 w-3 mr-1" /> Switch to Live
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => window.open("https://dashboard.stripe.com/test/developers", "_blank")}>
                    <ExternalLink className="h-3 w-3 mr-1" /> Stripe Dashboard
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10"><Zap className="h-5 w-5 text-blue-500" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Total Events</p>
                <p className="text-xl font-bold">{statsLoading ? "..." : stats?.total ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10"><CheckCircle className="h-5 w-5 text-green-500" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Processed</p>
                <p className="text-xl font-bold">{statsLoading ? "..." : stats?.processed ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10"><XCircle className="h-5 w-5 text-red-500" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Failed</p>
                <p className="text-xl font-bold">{statsLoading ? "..." : stats?.failed ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10"><Clock className="h-5 w-5 text-amber-500" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Success Rate</p>
                <p className="text-xl font-bold">
                  {statsLoading ? "..." : stats && stats.total > 0 ? `${Math.round((stats.processed / stats.total) * 100)}%` : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Test Cards</TabsTrigger>
          <TabsTrigger value="e2e">E2E Flow</TabsTrigger>
          <TabsTrigger value="events">Webhook Events</TabsTrigger>
          <TabsTrigger value="guide">Integration Guide</TabsTrigger>
        </TabsList>

        {/* ================================================================ */}
        {/* TEST CARDS TAB */}
        {/* ================================================================ */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><CreditCard className="h-5 w-5" /> Test Payment Cards</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Successful Payment</p>
                    <p className="text-sm text-muted-foreground font-mono">{instructions?.testCard ?? "4242 4242 4242 4242"}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard("4242424242424242")}>
                    <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Declined Payment</p>
                    <p className="text-sm text-muted-foreground font-mono">4000 0000 0000 0002</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard("4000000000000002")}>
                    <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">3D Secure Authentication</p>
                    <p className="text-sm text-muted-foreground font-mono">4000 0000 0000 3220</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard("4000000000003220")}>
                    <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="bg-muted/30 rounded p-3">
                  <p className="text-muted-foreground">Expiry</p>
                  <p className="font-medium">{instructions?.expiry ?? "Any future date"}</p>
                </div>
                <div className="bg-muted/30 rounded p-3">
                  <p className="text-muted-foreground">CVC</p>
                  <p className="font-medium">{instructions?.cvc ?? "Any 3 digits"}</p>
                </div>
                <div className="bg-muted/30 rounded p-3">
                  <p className="text-muted-foreground">ZIP</p>
                  <p className="font-medium">{instructions?.zip ?? "Any 5 digits"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Test Actions */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Quick Test Actions</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button variant="outline" className="justify-start h-auto p-4" onClick={() => toast.info("Navigate to a course page and click 'Enroll' to test a real checkout flow")}>
                  <div className="text-left">
                    <p className="font-medium">Test Course Purchase</p>
                    <p className="text-xs text-muted-foreground">Go to a course page → Click Enroll → Use test card</p>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto p-4" onClick={() => toast.info("Navigate to coaching plans and select a plan to test subscription checkout")}>
                  <div className="text-left">
                    <p className="font-medium">Test Subscription</p>
                    <p className="text-xs text-muted-foreground">Go to coaching plans → Select plan → Use test card</p>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto p-4" onClick={() => window.open("https://dashboard.stripe.com/test/webhooks", "_blank")}>
                  <div className="text-left flex items-center gap-2">
                    <p className="font-medium">Stripe Dashboard</p>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-xs text-muted-foreground">View webhook events and logs in Stripe</p>
                </Button>
                <Button variant="outline" className="justify-start h-auto p-4" onClick={() => toast.info("Check Settings → Payment to configure live keys after KYC verification")}>
                  <div className="text-left">
                    <p className="font-medium">Go Live Checklist</p>
                    <p className="text-xs text-muted-foreground">Claim sandbox → KYC → Add live keys in Settings</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Important Notes */}
          <Card className="border-amber-500/30">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-sm">Important Notes</p>
                  {instructions?.notes?.map((note, i) => (
                    <p key={i} className="text-xs text-muted-foreground">• {note}</p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================ */}
        {/* E2E FLOW TAB */}
        {/* ================================================================ */}
        <TabsContent value="e2e" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5" /> End-to-End Payment Flow
              </CardTitle>
              <CardDescription>
                Visualize the complete payment pipeline: Payment → Webhook → Analytics → Notification → Funnel Update
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Flow Visualization */}
              <div className="overflow-x-auto pb-2">
                <div className="flex items-center gap-0 min-w-[900px]">
                  <FlowStep
                    icon={CreditCard}
                    label="Payment"
                    sublabel="Stripe Checkout"
                    status={flowStatus.hasPayment ? "success" : "pending"}
                  />
                  <FlowStep
                    icon={Webhook}
                    label="Webhook"
                    sublabel="Event Received"
                    status={flowStatus.hasWebhook ? "success" : "pending"}
                  />
                  <FlowStep
                    icon={BarChart3}
                    label="Analytics"
                    sublabel="Event Tracked"
                    status={flowStatus.hasAnalytics ? "success" : "pending"}
                  />
                  <FlowStep
                    icon={Bell}
                    label="Notification"
                    sublabel="Admin Alerted"
                    status={flowStatus.hasAnalytics ? "success" : "pending"}
                  />
                  <FlowStep
                    icon={Users}
                    label="Funnel Update"
                    sublabel="Enrollment Active"
                    status={flowStatus.hasAnalytics ? "success" : "pending"}
                    isLast
                  />
                </div>
              </div>

              <Separator />

              {/* Flow Steps Detail */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">How It Works</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      step: 1,
                      title: "Customer Initiates Payment",
                      desc: "User clicks 'Enroll' or selects a coaching plan. A Stripe Checkout Session is created with user metadata (ID, email, name) and the user is redirected to Stripe's hosted checkout page.",
                      icon: CreditCard,
                    },
                    {
                      step: 2,
                      title: "Webhook Receives Event",
                      desc: "Stripe sends a webhook event (checkout.session.completed, payment_intent.succeeded) to /api/stripe/webhook. The signature is verified and the event is logged with idempotency protection.",
                      icon: Webhook,
                    },
                    {
                      step: 3,
                      title: "Analytics Event Created",
                      desc: "The webhook handler creates an analytics_event with type 'payment_succeeded' or 'checkout_completed', including amount, product, and user metadata for revenue tracking.",
                      icon: BarChart3,
                    },
                    {
                      step: 4,
                      title: "Admin Notification Sent",
                      desc: "An in-app notification is sent to the admin with payment details. The notification includes the amount, user name, and product purchased.",
                      icon: Bell,
                    },
                    {
                      step: 5,
                      title: "Enrollment & Funnel Updated",
                      desc: "The user is auto-enrolled in the purchased course or coaching plan. The conversion funnel (visitor → signup → enrollment → payment) is updated in real-time.",
                      icon: Users,
                    },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold shrink-0">
                        {item.step}
                      </div>
                      <div>
                        <p className="text-sm font-medium flex items-center gap-1.5">
                          <item.icon className="h-3.5 w-3.5" /> {item.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Test the Flow */}
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
                  <TestTube className="h-4 w-4 text-blue-500" /> Test the Complete Flow
                </h3>
                <ol className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="font-bold text-foreground">1.</span>
                    Navigate to any course page and click "Enroll Now"
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-foreground">2.</span>
                    Use test card <span className="font-mono bg-muted px-1 rounded">4242 4242 4242 4242</span> with any future expiry and CVC
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-foreground">3.</span>
                    After payment, return here and click "Refresh" to see the webhook event appear
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-foreground">4.</span>
                    Check the Live KPI Dashboard to verify the revenue counter updated
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-foreground">5.</span>
                    Verify the notification bell shows a new payment notification
                  </li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Live Mode Switch Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Rocket className="h-5 w-5" /> Switching to Live Mode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { step: "Claim your Stripe Sandbox", desc: "Go to Settings → Payment and claim your test environment", done: true },
                  { step: "Complete Stripe KYC Verification", desc: "Provide business details, bank account, and identity verification in Stripe Dashboard", done: false },
                  { step: "Get Live API Keys", desc: "After KYC approval, copy your live publishable and secret keys from Stripe Dashboard → Developers → API Keys", done: false },
                  { step: "Add Live Keys in Settings", desc: "Go to Settings → Payment and replace test keys with live keys", done: false },
                  { step: "Test with 99% Discount Code", desc: "Use the provided 99% discount promo code for initial live testing (minimum $0.50 USD)", done: false },
                  { step: "Remove Discount & Go Live", desc: "Once verified, remove the test discount and start accepting real payments", done: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
                    {item.done ? (
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 shrink-0 mt-0.5 flex items-center justify-center text-[10px] text-muted-foreground font-bold">
                        {i + 1}
                      </div>
                    )}
                    <div>
                      <p className={`text-sm font-medium ${item.done ? "text-green-600" : ""}`}>{item.step}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================ */}
        {/* WEBHOOK EVENTS TAB */}
        {/* ================================================================ */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Webhook Events Log</CardTitle>
                <Badge variant="outline">{(events as any[])?.length ?? 0} events</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {eventsLoading ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Loading events...</p>
              ) : !events || (events as any[]).length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="font-medium">No webhook events yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Make a test payment to see events appear here</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {(events as any[]).map((event: any) => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <StatusBadge status={event.status} />
                        <div>
                          <p className="text-sm font-medium">{event.eventType}</p>
                          <p className="text-xs text-muted-foreground font-mono">{event.eventId?.slice(0, 30)}...</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {event.createdAt ? new Date(event.createdAt).toLocaleString() : ""}
                        </p>
                        {event.errorMessage && (
                          <p className="text-xs text-red-500 max-w-[200px] truncate">{event.errorMessage}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Events by Type */}
          {stats?.recentByType && (stats.recentByType as any[]).length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Last 24h by Type</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(stats.recentByType as any[]).map((item: any, i: number) => (
                    <div key={i} className="bg-muted/30 rounded p-3">
                      <p className="text-xs text-muted-foreground truncate">{item.eventType}</p>
                      <p className="text-lg font-bold">{item.count}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ================================================================ */}
        {/* INTEGRATION GUIDE TAB */}
        {/* ================================================================ */}
        <TabsContent value="guide" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Integration Checklist</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: "Webhook endpoint configured at /api/stripe/webhook", done: true },
                  { label: "Signature verification with STRIPE_WEBHOOK_SECRET", done: true },
                  { label: "Test event detection (evt_test_) with verification response", done: true },
                  { label: "checkout.session.completed → Analytics + Enrollment", done: true },
                  { label: "payment_intent.succeeded → Revenue tracking", done: true },
                  { label: "invoice.paid → Subscription renewal tracking", done: true },
                  { label: "customer.subscription.deleted → Churn tracking", done: true },
                  { label: "Admin notifications on payment events", done: true },
                  { label: "Idempotency protection (deduplicate by eventId)", done: true },
                  { label: "E2E flow: Payment → Webhook → Analytics → Notification → Funnel", done: true },
                  { label: "Claim Stripe sandbox (Settings → Payment)", done: false },
                  { label: "Complete Stripe KYC for live payments", done: false },
                  { label: "Add live keys in Settings → Payment", done: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    {item.done ? (
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                    )}
                    <span className={`text-sm ${item.done ? "" : "text-muted-foreground"}`}>{item.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
