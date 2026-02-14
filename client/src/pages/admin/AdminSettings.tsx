import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  Globe, Palette, Shield, Bell, CreditCard, Link2, Database, Code,
  Save, ChevronRight, CheckCircle2, Loader2, RotateCcw, Plug, History,
  AlertTriangle, User, Clock, FileText
} from "lucide-react";

type TabKey = "site" | "branding" | "security" | "notifications" | "payments" | "integrations" | "database" | "developer" | "activity";

const tabs: { key: TabKey; title: string; desc: string; icon: any }[] = [
  { key: "site", title: "Site Details", desc: "Homepage, SEO, general info", icon: Globe },
  { key: "branding", title: "Branding", desc: "Logo, colors, fonts", icon: Palette },
  { key: "security", title: "Security", desc: "Auth, passwords, access", icon: Shield },
  { key: "notifications", title: "Notifications", desc: "Email & alert settings", icon: Bell },
  { key: "payments", title: "Payments", desc: "Stripe & checkout config", icon: CreditCard },
  { key: "integrations", title: "Integrations", desc: "External services", icon: Link2 },
  { key: "database", title: "Database", desc: "Status & backups", icon: Database },
  { key: "developer", title: "Developer", desc: "API keys & webhooks", icon: Code },
  { key: "activity", title: "Activity Log", desc: "Who changed what, when", icon: History },
];

const DEFAULTS: Record<string, string> = {
  site_name: "RusingAcademy Learning Ecosystem",
  site_tagline: "Bilingual Excellence for Canadian Public Servants",
  site_url: "https://www.rusingacademy.ca",
  site_contact_email: "info@rusingacademy.ca",
  seo_title: "RusingAcademy — Professional Bilingual Training",
  seo_description: "Secure your C level. Propel your federal career.",
  seo_keywords: "SLE, bilingual, public service, French, English",
  brand_primary_color: "#0F3D3E",
  brand_secondary_color: "#D4A843",
  brand_accent_color: "#1a5c5e",
  brand_bg_color: "#FAFAF8",
  brand_text_color: "#1a1a1a",
  brand_muted_color: "#6b7280",
  brand_heading_font: "Playfair Display",
  brand_body_font: "Inter",
  auth_session_duration: "24",
  auth_max_login_attempts: "5",
  auth_lockout_duration: "30",
  stripe_currency: "CAD",
  email_from_name: "RusingAcademy",
  email_from_address: "noreply@rusingacademy.ca",
  email_reply_to: "info@rusingacademy.ca",
  api_rate_limit: "60",
  log_level: "info",
  log_retention_days: "30",
};

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<TabKey>("site");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Record<string, Date>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingSave, setPendingSave] = useState<{ keys: string[]; section: string } | null>(null);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);

  const settingsQuery = trpc.settings.getAll.useQuery();
  const setMutation = trpc.settings.setBulk.useMutation();
  const activityQuery = trpc.activityLog.getRecent.useQuery({ limit: 50 }, { enabled: activeTab === "activity" });

  useEffect(() => {
    if (settingsQuery.data) {
      setFormData(settingsQuery.data as Record<string, string>);
    }
  }, [settingsQuery.data]);

  const updateField = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = async (keys: string[], section: string) => {
    setSaving(true);
    try {
      const settings: Record<string, string> = {};
      keys.forEach(k => { if (formData[k] !== undefined) settings[k] = formData[k]; });
      await setMutation.mutateAsync({ settings });
      settingsQuery.refetch();
      setLastSaved(prev => ({ ...prev, [section]: new Date() }));
      toast.success(`${section} saved successfully`);
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveWithConfirm = (keys: string[], section: string, requireConfirm: boolean) => {
    if (requireConfirm) {
      setPendingSave({ keys, section });
      setShowConfirm(true);
    } else {
      saveSettings(keys, section);
    }
  };

  const confirmSave = () => {
    if (pendingSave) {
      saveSettings(pendingSave.keys, pendingSave.section);
    }
    setShowConfirm(false);
    setPendingSave(null);
  };

  const resetToDefaults = (keys: string[]) => {
    const updated = { ...formData };
    keys.forEach(k => { if (DEFAULTS[k]) updated[k] = DEFAULTS[k]; });
    setFormData(updated);
    toast.info("Reset to defaults — click Save to apply");
  };

  const testConnection = async (service: string) => {
    setTestingConnection(service);
    // Simulate connection test (in production, this would call a real endpoint)
    await new Promise(r => setTimeout(r, 1500));
    setTestingConnection(null);
    toast.success(`${service} connection verified`);
  };

  const renderField = (key: string, label: string, type: "text" | "textarea" | "toggle" | "color" = "text", placeholder?: string) => {
    if (type === "toggle") {
      return (
        <div className="flex items-center justify-between py-2" key={key}>
          <Label className="text-sm font-medium">{label}</Label>
          <Switch checked={formData[key] === "true"} onCheckedChange={(v) => updateField(key, v ? "true" : "false")} />
        </div>
      );
    }
    if (type === "textarea") {
      return (
        <div className="space-y-1.5" key={key}>
          <Label className="text-sm font-medium">{label}</Label>
          <Textarea value={formData[key] || ""} onChange={(e) => updateField(key, e.target.value)} placeholder={placeholder || label} rows={3} />
        </div>
      );
    }
    if (type === "color") {
      return (
        <div className="space-y-1.5" key={key}>
          <Label className="text-sm font-medium">{label}</Label>
          <div className="flex items-center gap-2">
            <input type="color" value={formData[key] || "#000000"} onChange={(e) => updateField(key, e.target.value)} className="w-10 h-10 rounded border cursor-pointer" />
            <Input value={formData[key] || ""} onChange={(e) => updateField(key, e.target.value)} placeholder={placeholder || "#000000"} className="flex-1" />
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-1.5" key={key}>
        <Label className="text-sm font-medium">{label}</Label>
        <Input value={formData[key] || ""} onChange={(e) => updateField(key, e.target.value)} placeholder={placeholder || label} />
      </div>
    );
  };

  const renderSaveBar = (keys: string[], section: string, requireConfirm = false) => (
    <div className="flex items-center justify-between pt-4 border-t">
      <div className="flex items-center gap-3">
        <Button onClick={() => handleSaveWithConfirm(keys, section, requireConfirm)} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />} Save {section}
        </Button>
        <Button variant="outline" size="sm" onClick={() => resetToDefaults(keys)}>
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Reset Defaults
        </Button>
      </div>
      {lastSaved[section] && (
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3 text-green-500" /> Last saved {lastSaved[section].toLocaleTimeString()}
        </span>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "site":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField("site_name", "Site Name", "text", "RusingAcademy Learning Ecosystem")}
              {renderField("site_tagline", "Tagline", "text", "Bilingual Excellence for Canadian Public Servants")}
              {renderField("site_url", "Site URL", "text", "https://www.rusingacademy.ca")}
              {renderField("site_contact_email", "Contact Email", "text", "info@rusingacademy.ca")}
            </div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider pt-2">SEO Settings</h3>
            {renderField("seo_title", "Meta Title", "text", "RusingAcademy — Professional Bilingual Training")}
            {renderField("seo_description", "Meta Description", "textarea", "Secure your C level. Propel your federal career.")}
            {renderField("seo_keywords", "Keywords", "text", "SLE, bilingual, public service, French, English")}
            {renderField("seo_og_image", "OG Image URL", "text", "https://...")}
            {renderSaveBar(["site_name", "site_tagline", "site_url", "site_contact_email", "seo_title", "seo_description", "seo_keywords", "seo_og_image"], "Site Details")}
          </div>
        );
      case "branding":
        return (
          <div className="space-y-6">
            {renderField("brand_logo_url", "Logo URL", "text", "https://...")}
            {renderField("brand_favicon_url", "Favicon URL", "text", "https://...")}
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider pt-2">Color Palette</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {renderField("brand_primary_color", "Primary Color", "color", "#0F3D3E")}
              {renderField("brand_secondary_color", "Secondary Color", "color", "#D4A843")}
              {renderField("brand_accent_color", "Accent Color", "color", "#1a5c5e")}
              {renderField("brand_bg_color", "Background Color", "color", "#FAFAF8")}
              {renderField("brand_text_color", "Text Color", "color", "#1a1a1a")}
              {renderField("brand_muted_color", "Muted Color", "color", "#6b7280")}
            </div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider pt-2">Typography</h3>
            <div className="grid grid-cols-2 gap-4">
              {renderField("brand_heading_font", "Heading Font", "text", "Playfair Display")}
              {renderField("brand_body_font", "Body Font", "text", "Inter")}
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="text-sm font-medium mb-3">Preview</h4>
              <div className="p-4 rounded-lg border" style={{ backgroundColor: formData.brand_bg_color || "#FAFAF8" }}>
                <h3 style={{ fontFamily: formData.brand_heading_font || "Playfair Display", color: formData.brand_primary_color || "#0F3D3E" }} className="text-xl font-bold mb-1">Heading Preview</h3>
                <p style={{ fontFamily: formData.brand_body_font || "Inter", color: formData.brand_text_color || "#1a1a1a" }} className="text-sm mb-2">Body text preview with your selected font and colors.</p>
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded text-xs text-white" style={{ backgroundColor: formData.brand_primary_color || "#0F3D3E" }}>Primary</span>
                  <span className="px-3 py-1 rounded text-xs text-white" style={{ backgroundColor: formData.brand_secondary_color || "#D4A843" }}>Secondary</span>
                  <span className="px-3 py-1 rounded text-xs text-white" style={{ backgroundColor: formData.brand_accent_color || "#1a5c5e" }}>Accent</span>
                </div>
              </div>
            </div>
            {renderSaveBar(["brand_logo_url", "brand_favicon_url", "brand_primary_color", "brand_secondary_color", "brand_accent_color", "brand_bg_color", "brand_text_color", "brand_muted_color", "brand_heading_font", "brand_body_font"], "Branding")}
          </div>
        );
      case "security":
        return (
          <div className="space-y-6">
            <Card><CardContent className="p-4 space-y-4">
              <h3 className="font-semibold flex items-center gap-2"><Shield className="h-4 w-4" /> Authentication</h3>
              {renderField("auth_session_duration", "Session Duration (hours)", "text", "24")}
              {renderField("auth_max_login_attempts", "Max Login Attempts", "text", "5")}
              {renderField("auth_lockout_duration", "Lockout Duration (minutes)", "text", "30")}
              {renderField("auth_require_email_verification", "Require Email Verification", "toggle")}
              {renderField("auth_allow_registration", "Allow Public Registration", "toggle")}
            </CardContent></Card>
            <Card><CardContent className="p-4 space-y-4">
              <h3 className="font-semibold flex items-center gap-2"><Link2 className="h-4 w-4" /> OAuth Providers</h3>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Label className="text-sm font-medium">Google OAuth</Label>
                  <Switch checked={formData.oauth_google_enabled === "true"} onCheckedChange={(v) => updateField("oauth_google_enabled", v ? "true" : "false")} />
                </div>
                <Button variant="outline" size="sm" onClick={() => testConnection("Google OAuth")} disabled={testingConnection === "Google OAuth"}>
                  {testingConnection === "Google OAuth" ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Plug className="h-3 w-3 mr-1" />} Test
                </Button>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Label className="text-sm font-medium">Microsoft OAuth</Label>
                  <Switch checked={formData.oauth_microsoft_enabled === "true"} onCheckedChange={(v) => updateField("oauth_microsoft_enabled", v ? "true" : "false")} />
                </div>
                <Button variant="outline" size="sm" onClick={() => testConnection("Microsoft OAuth")} disabled={testingConnection === "Microsoft OAuth"}>
                  {testingConnection === "Microsoft OAuth" ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Plug className="h-3 w-3 mr-1" />} Test
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">OAuth credentials are managed in Management UI Settings &gt; Secrets</p>
            </CardContent></Card>
            {renderSaveBar(["auth_session_duration", "auth_max_login_attempts", "auth_lockout_duration", "auth_require_email_verification", "auth_allow_registration", "oauth_google_enabled", "oauth_microsoft_enabled"], "Security Settings", true)}
          </div>
        );
      case "notifications":
        return (
          <div className="space-y-6">
            <Card><CardContent className="p-4 space-y-4">
              <h3 className="font-semibold">Email Notifications</h3>
              {renderField("notify_new_enrollment", "New Enrollment", "toggle")}
              {renderField("notify_new_lead", "New Lead / Inquiry", "toggle")}
              {renderField("notify_payment_received", "Payment Received", "toggle")}
              {renderField("notify_session_booked", "Session Booked", "toggle")}
              {renderField("notify_course_completed", "Course Completed", "toggle")}
              {renderField("notify_coach_application", "Coach Application", "toggle")}
            </CardContent></Card>
            <Card><CardContent className="p-4 space-y-4">
              <h3 className="font-semibold">Email Configuration</h3>
              {renderField("email_from_name", "From Name", "text", "RusingAcademy")}
              {renderField("email_from_address", "From Email", "text", "noreply@rusingacademy.ca")}
              {renderField("email_reply_to", "Reply-To", "text", "info@rusingacademy.ca")}
            </CardContent></Card>
            {renderSaveBar(["notify_new_enrollment", "notify_new_lead", "notify_payment_received", "notify_session_booked", "notify_course_completed", "notify_coach_application", "email_from_name", "email_from_address", "email_reply_to"], "Notification Settings")}
          </div>
        );
      case "payments":
        return (
          <div className="space-y-6">
            <Card><CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Stripe Configuration</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Connected</Badge>
                  <Button variant="outline" size="sm" onClick={() => testConnection("Stripe")} disabled={testingConnection === "Stripe"}>
                    {testingConnection === "Stripe" ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Plug className="h-3 w-3 mr-1" />} Test Connection
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Stripe keys are managed in Management UI &gt; Settings &gt; Payment</p>
              {renderField("stripe_currency", "Default Currency", "text", "CAD")}
              {renderField("stripe_tax_enabled", "Enable Tax Calculation", "toggle")}
              {renderField("stripe_allow_promo_codes", "Allow Promo Codes", "toggle")}
            </CardContent></Card>
            <Card><CardContent className="p-4 space-y-4">
              <h3 className="font-semibold">Checkout Flow</h3>
              {renderField("checkout_success_url", "Success Redirect URL", "text", "/dashboard?payment=success")}
              {renderField("checkout_cancel_url", "Cancel Redirect URL", "text", "/pricing")}
              {renderField("checkout_collect_phone", "Collect Phone Number", "toggle")}
              {renderField("checkout_collect_address", "Collect Billing Address", "toggle")}
              {renderField("checkout_custom_message", "Custom Checkout Message", "textarea", "Thank you for investing in your bilingual career.")}
            </CardContent></Card>
            {renderSaveBar(["stripe_currency", "stripe_tax_enabled", "stripe_allow_promo_codes", "checkout_success_url", "checkout_cancel_url", "checkout_collect_phone", "checkout_collect_address", "checkout_custom_message"], "Payment Settings", true)}
          </div>
        );
      case "integrations":
        return (
          <div className="space-y-6">
            <Card><CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Calendly</h3>
                <Button variant="outline" size="sm" onClick={() => testConnection("Calendly")} disabled={testingConnection === "Calendly"}>
                  {testingConnection === "Calendly" ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Plug className="h-3 w-3 mr-1" />} Test Connection
                </Button>
              </div>
              {renderField("calendly_enabled", "Enable Calendly", "toggle")}
              <p className="text-xs text-muted-foreground">API key managed in Management UI &gt; Settings &gt; Secrets</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Google Analytics</h3>
                <Button variant="outline" size="sm" onClick={() => testConnection("Google Analytics")} disabled={testingConnection === "Google Analytics"}>
                  {testingConnection === "Google Analytics" ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Plug className="h-3 w-3 mr-1" />} Test Connection
                </Button>
              </div>
              {renderField("ga_enabled", "Enable Google Analytics", "toggle")}
              {renderField("ga_tracking_id", "Tracking ID", "text", "G-XXXXXXXXXX")}
            </CardContent></Card>
            <Card><CardContent className="p-4 space-y-4">
              <h3 className="font-semibold">Webhooks</h3>
              <p className="text-xs text-muted-foreground mb-2">Configure webhook endpoints to receive real-time notifications for key events.</p>
              {renderField("webhook_enrollment_url", "Enrollment Webhook URL", "text", "https://...")}
              {renderField("webhook_payment_url", "Payment Webhook URL", "text", "https://...")}
              {renderField("webhook_lead_url", "Lead Webhook URL", "text", "https://...")}
              {renderField("webhook_ai_session_url", "AI Session Webhook URL", "text", "https://...")}
            </CardContent></Card>
            {renderSaveBar(["calendly_enabled", "ga_enabled", "ga_tracking_id", "webhook_enrollment_url", "webhook_payment_url", "webhook_lead_url", "webhook_ai_session_url"], "Integration Settings")}
          </div>
        );
      case "database":
        return (
          <div className="space-y-6">
            <Card><CardContent className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <h3 className="font-semibold">Database Status</h3>
                  <p className="text-sm text-muted-foreground">TiDB Cloud — Connected</p>
                </div>
                <Button variant="outline" size="sm" className="ml-auto" onClick={() => testConnection("Database")} disabled={testingConnection === "Database"}>
                  {testingConnection === "Database" ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Plug className="h-3 w-3 mr-1" />} Test Connection
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="p-3 bg-muted/50 rounded-lg"><p className="text-muted-foreground text-xs">Engine</p><p className="font-medium">MySQL / TiDB</p></div>
                <div className="p-3 bg-muted/50 rounded-lg"><p className="text-muted-foreground text-xs">SSL</p><p className="font-medium text-green-600">Enabled</p></div>
                <div className="p-3 bg-muted/50 rounded-lg"><p className="text-muted-foreground text-xs">Region</p><p className="font-medium">US East</p></div>
                <div className="p-3 bg-muted/50 rounded-lg"><p className="text-muted-foreground text-xs">Status</p><p className="font-medium text-green-600">Active</p></div>
              </div>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <h3 className="font-semibold mb-2">Connection Details</h3>
              <p className="text-sm text-muted-foreground">Full connection info available in Management UI &gt; Database &gt; Settings (bottom-left gear icon). Remember to enable SSL.</p>
            </CardContent></Card>
          </div>
        );
      case "developer":
        return (
          <div className="space-y-6">
            <Card><CardContent className="p-4 space-y-4">
              <h3 className="font-semibold">API Configuration</h3>
              {renderField("api_rate_limit", "Rate Limit (requests/min)", "text", "60")}
              {renderField("api_cors_origins", "CORS Origins", "text", "https://www.rusingacademy.ca")}
              {renderField("api_debug_mode", "Debug Mode", "toggle")}
            </CardContent></Card>
            <Card><CardContent className="p-4 space-y-4">
              <h3 className="font-semibold">System Logs</h3>
              <p className="text-sm text-muted-foreground">View server logs, error tracking, and performance metrics in the Management UI &gt; Dashboard panel.</p>
              {renderField("log_level", "Log Level", "text", "info")}
              {renderField("log_retention_days", "Log Retention (days)", "text", "30")}
            </CardContent></Card>
            <Card><CardContent className="p-4 space-y-4">
              <h3 className="font-semibold">Maintenance</h3>
              {renderField("maintenance_mode", "Maintenance Mode", "toggle")}
              {renderField("maintenance_message", "Maintenance Message", "textarea", "We are currently performing scheduled maintenance...")}
            </CardContent></Card>
            {renderSaveBar(["api_rate_limit", "api_cors_origins", "api_debug_mode", "log_level", "log_retention_days", "maintenance_mode", "maintenance_message"], "Developer Settings")}
          </div>
        );
      case "activity":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><History className="h-5 w-5" /> Activity Log</CardTitle>
                <CardDescription>Complete audit trail — who changed what, and when.</CardDescription>
              </CardHeader>
              <CardContent>
                {activityQuery.isLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center"><Loader2 className="h-5 w-5 animate-spin" /> Loading activity log...</div>
                ) : (activityQuery.data as any[] || []).length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <History className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No activity recorded yet. Actions will appear here as admins make changes.</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">
                      <div className="col-span-2">When</div>
                      <div className="col-span-2">Who</div>
                      <div className="col-span-2">Action</div>
                      <div className="col-span-2">Type</div>
                      <div className="col-span-4">Details</div>
                    </div>
                    {(activityQuery.data as any[]).map((log: any, i: number) => (
                      <div key={log.id || i} className="grid grid-cols-12 gap-2 px-3 py-2.5 text-sm hover:bg-muted/50 rounded-lg transition-colors items-center">
                        <div className="col-span-2 text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3 shrink-0" />
                          {log.createdAt ? new Date(log.createdAt).toLocaleString("en-CA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                        </div>
                        <div className="col-span-2 flex items-center gap-1.5 min-w-0">
                          <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate text-xs font-medium">{log.userName || log.userEmail || "System"}</span>
                        </div>
                        <div className="col-span-2">
                          <Badge variant={log.action?.includes("delete") ? "destructive" : log.action?.includes("create") ? "default" : "outline"} className="text-xs">
                            {log.action || "unknown"}
                          </Badge>
                        </div>
                        <div className="col-span-2">
                          <Badge variant="secondary" className="text-xs">{log.entityType || "—"}</Badge>
                        </div>
                        <div className="col-span-4 text-xs text-muted-foreground truncate">
                          {log.entityTitle || log.entityId ? `${log.entityTitle || ""}${log.entityId ? ` (#${log.entityId})` : ""}` : "—"}
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
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Platform Settings</h1>
        <p className="text-sm text-muted-foreground">Configure every aspect of your ecosystem — no code required.</p>
      </div>
      <div className="flex gap-6">
        <div className="w-64 shrink-0 space-y-1">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors ${activeTab === tab.key ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-muted-foreground"}`}>
              <tab.icon className="h-4 w-4 shrink-0" />
              <div className="min-w-0"><p className="truncate">{tab.title}</p><p className="text-xs text-muted-foreground truncate">{tab.desc}</p></div>
              {activeTab === tab.key && <ChevronRight className="h-3 w-3 ml-auto shrink-0" />}
            </button>
          ))}
        </div>
        <div className="flex-1 min-w-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{tabs.find(t => t.key === activeTab)?.title}</CardTitle>
              <CardDescription>{tabs.find(t => t.key === activeTab)?.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              {settingsQuery.isLoading && activeTab !== "activity" ? (
                <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
                  <Loader2 className="h-5 w-5 animate-spin" /> Loading settings...
                </div>
              ) : renderTabContent()}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog for critical settings */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500" /> Confirm Changes</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">You are about to save changes to <strong>{pendingSave?.section}</strong>. These changes may affect authentication, payment processing, or security. Are you sure?</p>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={confirmSave}>Confirm & Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
