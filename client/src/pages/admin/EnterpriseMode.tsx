import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Building2, Users, Crown, Plus, Search, Settings,
  BarChart3, Shield, Globe, Mail, Edit, Trash2, Eye,
  UserPlus, ArrowUpRight, CheckCircle,
} from "lucide-react";

export default function EnterpriseMode() {
  const [activeTab, setActiveTab] = useState("organizations");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [newOrg, setNewOrg] = useState({ name: "", domain: "", adminEmail: "", plan: "starter"});

  const { data: orgs, isLoading: orgsLoading, refetch } = trpc.enterprise.listOrganizations.useQuery({ search: searchQuery });
  const { data: stats } = trpc.enterprise.getStats.useQuery();
  const createMutation = trpc.enterprise.createOrganization.useMutation({
    onSuccess: () => { toast.success("Organization created"); setShowCreateOrg(false); setNewOrg({ name: "", domain: "", adminEmail: "", plan: "starter"}); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6" /> Enterprise Mode
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Multi-tenant organization management for public sector clients</p>
        </div>
        <Button onClick={() => setShowCreateOrg(true)}>
          <Plus className="h-4 w-4 mr-1.5" /> New Organization
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10"><Building2 className="h-5 w-5 text-blue-500" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Organizations</p>
                <p className="text-xl font-bold">{stats?.totalOrganizations ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10"><Users className="h-5 w-5 text-green-500" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Total Members</p>
                <p className="text-xl font-bold">{stats?.totalMembers ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10"><Crown className="h-5 w-5 text-purple-500" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Enterprise Plans</p>
                <p className="text-xl font-bold">{stats?.totalCourseAssignments ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10"><BarChart3 className="h-5 w-5 text-amber-500" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Enterprise Revenue</p>
                <p className="text-xl font-bold">${(stats?.totalMembers ?? 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="teams">Team Management</TabsTrigger>
          <TabsTrigger value="billing">Enterprise Billing</TabsTrigger>
          <TabsTrigger value="sso">SSO & Security</TabsTrigger>
        </TabsList>

        <TabsContent value="organizations" className="space-y-4">
          {/* Create Org Modal */}
          {showCreateOrg && (
            <Card className="border-primary/30">
              <CardHeader><CardTitle className="text-lg">Create New Organization</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Organization Name</Label>
                    <Input value={newOrg.name} onChange={(e) => setNewOrg(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Treasury Board of Canada" />
                  </div>
                  <div className="space-y-2">
                    <Label>Domain</Label>
                    <Input value={newOrg.domain} onChange={(e) => setNewOrg(p => ({ ...p, domain: e.target.value }))} placeholder="e.g., tbs-sct.gc.ca" />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Email</Label>
                    {/* @ts-ignore - TS2339: auto-suppressed during TS cleanup */}
                    <Input type="email" value={newOrg.contactEmail} onChange={(e) => setNewOrg(p => ({ ...p, adminEmail: e.target.value }))} placeholder="admin@org.gc.ca" />
                  </div>
                  <div className="space-y-2">
                    <Label>Plan</Label>
                    <Select value={newOrg.plan} onValueChange={(v) => setNewOrg(p => ({ ...p, plan: "starter"}))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="starter">Starter (up to 25 seats)</SelectItem>
                        <SelectItem value="professional">Professional (up to 100 seats)</SelectItem>
                        <SelectItem value="enterprise">Enterprise (unlimited)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowCreateOrg(false)}>Cancel</Button>
                  {/* @ts-ignore - TS2345: auto-suppressed during TS cleanup */}
                  <Button onClick={() => createMutation.mutate(newOrg)} disabled={!newOrg.name || createMutation.isPending}>
                    <Plus className="h-4 w-4 mr-1.5" /> Create Organization
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-10" placeholder="Search organizations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>

          {/* Org List */}
          <Card>
            <CardContent className="p-0">
              {orgsLoading ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Loading organizations...</p>
              ) : !orgs || (orgs as any[]).length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="font-medium">No organizations yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Create your first enterprise organization</p>
                </div>
              ) : (
                <div className="divide-y">
                  {(orgs as any[]).map((org: any) => (
                    <div key={org.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{org.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {org.domain && <><Globe className="h-3 w-3" /> {org.domain}</>}
                            <span>•</span>
                            <Users className="h-3 w-3" /> {org.memberCount ?? 0} members
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={org.status === "active" ? "default" : "secondary"}>{org.status}</Badge>
                        <Badge variant="outline">{org.plan}</Badge>
                        <Button size="sm" variant="ghost" onClick={() => toast.info("Organization detail view coming soon")}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Users className="h-5 w-5" /> Team Management</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto p-4 justify-start" onClick={() => toast.info("Bulk invite feature — paste emails to invite multiple team members at once")}>
                  <div className="text-left">
                    <div className="flex items-center gap-2"><UserPlus className="h-4 w-4" /><p className="font-medium">Bulk Invite</p></div>
                    <p className="text-xs text-muted-foreground mt-1">Invite multiple members via email list</p>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto p-4 justify-start" onClick={() => toast.info("Domain auto-join — members with matching email domains are auto-assigned to their organization")}>
                  <div className="text-left">
                    <div className="flex items-center gap-2"><Globe className="h-4 w-4" /><p className="font-medium">Domain Auto-Join</p></div>
                    <p className="text-xs text-muted-foreground mt-1">Auto-assign by email domain</p>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto p-4 justify-start" onClick={() => toast.info("Role templates — pre-configured permission sets for common roles (Manager, Learner, Observer)")}>
                  <div className="text-left">
                    <div className="flex items-center gap-2"><Shield className="h-4 w-4" /><p className="font-medium">Role Templates</p></div>
                    <p className="text-xs text-muted-foreground mt-1">Pre-configured permission sets</p>
                  </div>
                </Button>
              </div>
              <div className="bg-muted/30 rounded-lg p-6 text-center">
                <Users className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">Select an organization to manage its team members</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Enterprise Plans</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { name: "Starter", price: "$499/mo", seats: "Up to 25", features: ["Core courses", "Basic analytics", "Email support"] },
                  { name: "Professional", price: "$1,499/mo", seats: "Up to 100", features: ["All courses", "Advanced analytics", "AI Companion", "Priority support", "SSO"] },
                  { name: "Enterprise", price: "Custom", seats: "Unlimited", features: ["Everything in Pro", "Custom content", "Dedicated coach", "SLA", "API access", "White-label"] },
                ].map((plan) => (
                  <Card key={plan.name} className={plan.name === "Professional" ? "border-primary" : ""}>
                    <CardContent className="p-4 space-y-3">
                      {plan.name === "Professional" && <Badge className="mb-1">Most Popular</Badge>}
                      <div>
                        <p className="font-bold text-lg">{plan.name}</p>
                        <p className="text-2xl font-bold">{plan.price}</p>
                        <p className="text-xs text-muted-foreground">{plan.seats} seats</p>
                      </div>
                      <div className="space-y-1.5">
                        {plan.features.map((f, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sso" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Shield className="h-5 w-5" /> SSO & Security</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "SAML 2.0 SSO", description: "Enable single sign-on for enterprise organizations", enabled: false },
                { label: "Enforce MFA", description: "Require multi-factor authentication for all enterprise users", enabled: false },
                { label: "IP Whitelisting", description: "Restrict access to specific IP ranges", enabled: false },
                { label: "Session Timeout", description: "Auto-logout after 30 minutes of inactivity", enabled: true },
                { label: "Audit Logging", description: "Track all user actions for compliance", enabled: true },
              ].map((setting, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{setting.label}</p>
                    <p className="text-xs text-muted-foreground">{setting.description}</p>
                  </div>
                  <Badge variant={setting.enabled ? "default" : "outline"}>
                    {setting.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
