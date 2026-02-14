import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  Shield, Users, Lock, Unlock, Save, Plus, Loader2,
  ChevronDown, ChevronRight, Eye, Edit2, Trash2, Settings,
  BookOpen, BarChart3, Brain, Image, Mail, Megaphone, FileText, History
} from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

type PermTab = "matrix" | "roles" | "audit";

const MODULES = [
  { key: "dashboard", label: "Dashboard", icon: BarChart3, description: "View KPIs, quick actions, overview" },
  { key: "courses", label: "Courses", icon: BookOpen, description: "Course builder, lessons, modules" },
  { key: "coaching", label: "Coaching", icon: Users, description: "Coaching plans, sessions, bookings" },
  { key: "students", label: "Students", icon: Users, description: "Student management, profiles, progress" },
  { key: "analytics", label: "Analytics", icon: BarChart3, description: "Sales analytics, reports, exports" },
  { key: "ai_companion", label: "AI Companion", icon: Brain, description: "Lingueefy settings, rules, analytics" },
  { key: "media", label: "Media Library", icon: Image, description: "Upload, organize, manage media" },
  { key: "cms", label: "CMS / Pages", icon: FileText, description: "Page builder, navigation, content" },
  { key: "funnels", label: "Funnels", icon: Megaphone, description: "Sales funnels, automations" },
  { key: "emails", label: "Email Templates", icon: Mail, description: "Email builder, templates, campaigns" },
  { key: "settings", label: "Settings", icon: Settings, description: "Platform config, integrations, logs" },
];

const ACTIONS = [
  { key: "view", label: "View", description: "Can see the module" },
  { key: "create", label: "Create", description: "Can create new items" },
  { key: "edit", label: "Edit", description: "Can modify existing items" },
  { key: "delete", label: "Delete", description: "Can remove items" },
  { key: "publish", label: "Publish", description: "Can publish/unpublish" },
  { key: "export", label: "Export", description: "Can export data" },
];

const ROLES = [
  { key: "admin", label: "Admin", color: "text-red-600", description: "Full access to everything" },
  { key: "coach", label: "Coach", color: "text-blue-600", description: "Access to coaching, students, limited analytics" },
  { key: "editor", label: "Editor", color: "text-violet-600", description: "Content creation and CMS management" },
  { key: "user", label: "User", color: "text-emerald-600", description: "Student / learner access only" },
];

export default function RBACPermissions() {
  const [activeTab, setActiveTab] = useState<PermTab>("matrix");
  const [selectedRole, setSelectedRole] = useState("coach");
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(MODULES.map(m => m.key)));
  const [saving, setSaving] = useState(false);
  const [localPerms, setLocalPerms] = useState<Record<string, boolean>>({});
  const [hasChanges, setHasChanges] = useState(false);

  const permsQuery = trpc.rbac.getPermissions.useQuery({ role: selectedRole });
  const setPermMut = trpc.rbac.bulkSetPermissions.useMutation({
    onSuccess: () => { permsQuery.refetch(); toast.success("Permissions saved"); setHasChanges(false); },
  });

  // Build permission map from DB data
  const permMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    if (permsQuery.data) {
      (permsQuery.data as any[]).forEach((p: any) => {
        map[`${p.module}:${p.action}`] = Boolean(p.allowed);
      });
    }
    // Admin always has full access
    if (selectedRole === "admin") {
      MODULES.forEach(m => ACTIONS.forEach(a => { map[`${m.key}:${a.key}`] = true; }));
    }
    return { ...map, ...localPerms };
  }, [permsQuery.data, localPerms, selectedRole]);

  const togglePerm = (module: string, action: string) => {
    if (selectedRole === "admin") { toast.info("Admin always has full access"); return; }
    const key = `${module}:${action}`;
    setLocalPerms(prev => ({ ...prev, [key]: !permMap[key] }));
    setHasChanges(true);
  };

  const toggleModule = (module: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(module)) next.delete(module); else next.add(module);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    const permissions = Object.entries(permMap).map(([key, allowed]) => {
      const [module, action] = key.split(":");
      return { module, action, allowed };
    });
    await setPermMut.mutateAsync({ role: selectedRole, permissions });
    setLocalPerms({});
    setSaving(false);
  };

  const applyPreset = (preset: "full" | "readonly" | "none") => {
    if (selectedRole === "admin") return;
    const newPerms: Record<string, boolean> = {};
    MODULES.forEach(m => {
      ACTIONS.forEach(a => {
        const key = `${m.key}:${a.key}`;
        if (preset === "full") newPerms[key] = true;
        else if (preset === "readonly") newPerms[key] = a.key === "view";
        else newPerms[key] = false;
      });
    });
    setLocalPerms(newPerms);
    setHasChanges(true);
  };

  // ─── MATRIX TAB ───
  const renderMatrix = () => (
    <div className="space-y-6">
      {/* Role Selector */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">Role:</Label>
          <Select value={selectedRole} onValueChange={(v) => { setSelectedRole(v); setLocalPerms({}); setHasChanges(false); }}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {ROLES.map(r => <SelectItem key={r.key} value={r.key}>{r.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-1 ml-auto">
          <Button variant="outline" size="sm" onClick={() => applyPreset("full")} disabled={selectedRole === "admin"}>Full Access</Button>
          <Button variant="outline" size="sm" onClick={() => applyPreset("readonly")} disabled={selectedRole === "admin"}>Read Only</Button>
          <Button variant="outline" size="sm" onClick={() => applyPreset("none")} disabled={selectedRole === "admin"}>No Access</Button>
        </div>
        {hasChanges && (
          <Button onClick={handleSave} disabled={saving} size="sm">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />} Save Changes
          </Button>
        )}
      </div>

      {selectedRole === "admin" && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-700 dark:text-amber-300">
          Admin role has full access to all modules and actions. This cannot be changed.
        </div>
      )}

      {/* Permission Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Matrix — {ROLES.find(r => r.key === selectedRole)?.label}</CardTitle>
          <CardDescription>{ROLES.find(r => r.key === selectedRole)?.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {permsQuery.isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center"><Loader2 className="h-5 w-5 animate-spin" /> Loading...</div>
          ) : (
            <div className="space-y-1">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <span className="col-span-4">Module</span>
                {ACTIONS.map(a => <span key={a.key} className="col-span-1 text-center">{a.label}</span>)}
                <span className="col-span-2 text-center">Quick</span>
              </div>

              {MODULES.map(mod => {
                const Icon = mod.icon;
                const isExpanded = expandedModules.has(mod.key);
                const modulePerms = ACTIONS.map(a => permMap[`${mod.key}:${a.key}`] || false);
                const allEnabled = modulePerms.every(Boolean);
                const someEnabled = modulePerms.some(Boolean);

                return (
                  <div key={mod.key} className="border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-12 gap-2 px-3 py-3 items-center hover:bg-muted/30 transition-colors">
                      <div className="col-span-4 flex items-center gap-2 cursor-pointer" onClick={() => toggleModule(mod.key)}>
                        {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{mod.label}</span>
                      </div>
                      {ACTIONS.map(a => (
                        <div key={a.key} className="col-span-1 flex justify-center">
                          <Switch
                            checked={permMap[`${mod.key}:${a.key}`] || false}
                            onCheckedChange={() => togglePerm(mod.key, a.key)}
                            disabled={selectedRole === "admin"}
                            className="scale-75"
                          />
                        </div>
                      ))}
                      <div className="col-span-2 flex justify-center gap-1">
                        <Button variant="ghost" size="sm" className="h-6 text-xs px-2" disabled={selectedRole === "admin"}
                          onClick={() => {
                            const newPerms: Record<string, boolean> = {};
                            ACTIONS.forEach(a => { newPerms[`${mod.key}:${a.key}`] = !allEnabled; });
                            setLocalPerms(prev => ({ ...prev, ...newPerms }));
                            setHasChanges(true);
                          }}>
                          {allEnabled ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="px-10 pb-3 text-xs text-muted-foreground">{mod.description}</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // ─── ROLES TAB ───
  const renderRoles = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Role Definitions</CardTitle>
          <CardDescription>Overview of all roles and their intended access levels.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ROLES.map(role => {
              const permCount = MODULES.length * ACTIONS.length;
              const enabledCount = role.key === "admin" ? permCount : MODULES.reduce((sum, m) =>
                sum + ACTIONS.filter(a => permMap[`${m.key}:${a.key}`]).length, 0);
              return (
                <div key={role.key} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Shield className={`h-5 w-5 ${role.color}`} />
                      <div>
                        <h3 className="font-semibold">{role.label}</h3>
                        <p className="text-xs text-muted-foreground">{role.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={role.key === "admin" ? "default" : "outline"} className="text-xs">
                        {role.key === "admin" ? "Full Access" : `${enabledCount}/${permCount} permissions`}
                      </Badge>
                      <Button variant="outline" size="sm" onClick={() => { setSelectedRole(role.key); setActiveTab("matrix"); }}>
                        <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {MODULES.map(m => {
                      const hasAccess = role.key === "admin" || ACTIONS.some(a => permMap[`${m.key}:${a.key}`]);
                      return (
                        <Badge key={m.key} variant={hasAccess ? "secondary" : "outline"} className={`text-xs ${hasAccess ? "" : "opacity-40"}`}>
                          {m.label}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ─── AUDIT TAB ───
  const renderAudit = () => {
    const activityQuery = trpc.activityLog.getRecent.useQuery({ limit: 50 });
    const logs = (activityQuery.data as any[]) || [];
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Permission Change Audit Log</CardTitle>
            <CardDescription>Track who changed what permissions and when.</CardDescription>
          </CardHeader>
          <CardContent>
            {activityQuery.isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center"><Loader2 className="h-5 w-5 animate-spin" /> Loading...</div>
            ) : logs.length === 0 ? (
              <EmptyState
                icon={History}
                title="No permission changes recorded"
                description="When roles or permissions are modified, the changes will be logged here with full audit details including who, what, and when."
              />
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {logs.map((log: any, i: number) => (
                  <div key={log.id || i} className="flex items-start gap-3 p-3 border rounded-lg text-sm">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{log.userName || `User #${log.userId}`}</span>
                        <Badge variant="outline" className="text-xs">{log.action}</Badge>
                        <span className="text-muted-foreground">{log.entityType}</span>
                      </div>
                      {log.details && <p className="text-xs text-muted-foreground mt-0.5 truncate">{log.details}</p>}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const tabItems: { key: PermTab; label: string; icon: any }[] = [
    { key: "matrix", label: "Permission Matrix", icon: Shield },
    { key: "roles", label: "Role Overview", icon: Users },
    { key: "audit", label: "Audit Log", icon: Eye },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1"><Shield className="h-6 w-6 text-violet-600" /><h1 className="text-2xl font-bold">Permissions & Access Control</h1></div>
        <p className="text-sm text-muted-foreground">Granular role-based access control — define exactly what each role can see and do across every module.</p>
      </div>
      <div className="flex gap-1 mb-6 border-b">
        {tabItems.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <tab.icon className="h-4 w-4" /> {tab.label}
          </button>
        ))}
      </div>
      {activeTab === "matrix" && renderMatrix()}
      {activeTab === "roles" && renderRoles()}
      {activeTab === "audit" && renderAudit()}
    </div>
  );
}
