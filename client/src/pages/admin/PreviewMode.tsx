import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Eye, Users, GraduationCap, Shield, Globe, ChevronRight,
  BookOpen, Star, Clock, BarChart3, User, ArrowLeft,
  Monitor, Tablet, Smartphone, Building2, ExternalLink,
  Maximize2, Minimize2, RefreshCw, AlertCircle, CheckCircle2,
  FileText, DollarSign, MessageSquare
} from "lucide-react";

type ViewMode = "select" | "public" | "learner" | "coach" | "hr" | "admin";
type DeviceMode = "desktop" | "tablet" | "mobile";
type PreviewTab = "data" | "website";

const DEVICE_WIDTHS: Record<DeviceMode, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

export default function PreviewMode() {
  const [viewMode, setViewMode] = useState<ViewMode>("select");
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>();
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [previewTab, setPreviewTab] = useState<PreviewTab>("data");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("/");
  const [iframeKey, setIframeKey] = useState(0);

  const { data: students } = trpc.previewMode.getStudentsList.useQuery();
  const { data: coaches } = trpc.previewMode.getCoachesList.useQuery();
  const { data: previewData, isLoading } = trpc.previewMode.getPreviewData.useQuery(
    {
      viewAs: viewMode === "select" ? "admin" : viewMode === "learner" ? "student" : viewMode === "hr" ? "admin" : viewMode,
      targetUserId: selectedUserId,
    },
    { enabled: viewMode !== "select" }
  );

  const viewModes = [
    {
      id: "public" as const,
      title: "Public Visitor",
      description: "See what an anonymous visitor sees — public courses, coaches, and landing pages. No login required.",
      icon: Globe,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
      gradient: "from-blue-500 to-cyan-500",
      requiresUser: false,
    },
    {
      id: "learner" as const,
      title: "Learner View",
      description: "Experience the platform as a specific learner — enrollments, progress, practice logs, and course content.",
      icon: GraduationCap,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      gradient: "from-emerald-500 to-teal-500",
      requiresUser: true,
    },
    {
      id: "coach" as const,
      title: "Coach View",
      description: "See the coach dashboard — sessions, earnings, students, ratings, and profile management.",
      icon: Users,
      color: "text-violet-600",
      bg: "bg-violet-50",
      border: "border-violet-200",
      gradient: "from-violet-500 to-purple-500",
      requiresUser: true,
    },
    {
      id: "hr" as const,
      title: "HR Admin View",
      description: "View as an HR administrator — team enrollments, department analytics, compliance reports, and billing.",
      icon: Building2,
      color: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-200",
      gradient: "from-orange-500 to-amber-500",
      requiresUser: false,
    },
    {
      id: "admin" as const,
      title: "Admin Overview",
      description: "Full admin view with all stats, controls, system metrics, and operational dashboards.",
      icon: Shield,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
      gradient: "from-amber-500 to-yellow-500",
      requiresUser: false,
    },
  ];

  const previewPages = useMemo(() => {
    const pages = [
      { label: "Home Page", url: "/" },
      { label: "Courses Catalog", url: "/courses" },
      { label: "Coaching", url: "/coaching" },
      { label: "Pricing", url: "/pricing" },
      { label: "About", url: "/about" },
    ];
    if (viewMode === "learner") {
      pages.push(
        { label: "My Dashboard", url: "/learn" },
        { label: "My Courses", url: "/learn/courses" },
        { label: "Practice Logs", url: "/learn/practice" },
      );
    }
    if (viewMode === "coach") {
      pages.push(
        { label: "Coach Dashboard", url: "/coach" },
        { label: "My Sessions", url: "/coach/sessions" },
        { label: "My Students", url: "/coach/students" },
      );
    }
    if (viewMode === "hr") {
      pages.push(
        { label: "HR Dashboard", url: "/hr" },
        { label: "Team Enrollments", url: "/hr/enrollments" },
        { label: "Department Reports", url: "/hr/reports" },
      );
    }
    if (viewMode === "admin") {
      pages.push(
        { label: "Admin Dashboard", url: "/admin" },
        { label: "User Management", url: "/admin/users" },
        { label: "Course Management", url: "/admin/courses" },
      );
    }
    return pages;
  }, [viewMode]);

  // Role selection screen
  if (viewMode === "select") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Preview As</h1>
          <p className="text-gray-500 mt-1">
            View the platform exactly as different users see it. Select a role to impersonate and browse the website through their eyes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {viewModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <Card
                key={mode.id}
                className={`cursor-pointer hover:shadow-lg transition-all border-2 ${mode.border} hover:scale-[1.02] group`}
                onClick={() => {
                  if (mode.requiresUser) return; // User picker handles navigation
                  setViewMode(mode.id);
                  setPreviewTab("data");
                }}
              >
                <CardContent className="pt-5">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${mode.gradient} text-white shadow-md`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-lg">{mode.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{mode.description}</p>

                      {mode.requiresUser && (
                        <div className="mt-3 space-y-1">
                          <p className="text-xs font-medium text-gray-600">Select a user to impersonate:</p>
                          <div className="max-h-36 overflow-y-auto space-y-1 border rounded-lg p-1">
                            {(mode.id === "learner" ? students : coaches)?.map((u: any) => (
                              <button
                                key={u.id}
                                className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-sm flex items-center gap-2 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedUserId(u.id);
                                  setViewMode(mode.id);
                                  setPreviewTab("data");
                                }}
                              >
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br ${mode.gradient}`}>
                                  {(u.name || "?")[0].toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="font-medium block truncate">{u.name}</span>
                                  <span className="text-gray-400 text-xs block truncate">{u.email}</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                              </button>
                            )) || (
                              <p className="text-xs text-gray-400 px-3 py-2">No users found</p>
                            )}
                          </div>
                        </div>
                      )}

                      {!mode.requiresUser && (
                        <Button variant="outline" size="sm" className="mt-3 group-hover:bg-gray-50">
                          <Eye className="w-4 h-4 mr-1" /> Preview
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats */}
        <Card className="border-dashed">
          <CardContent className="py-4">
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{students?.length || 0} learners</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                <span>{coaches?.length || 0} coaches</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span>Preview is read-only — no changes are persisted</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Active preview mode
  const currentMode = viewModes.find((m) => m.id === viewMode);
  const Icon = currentMode?.icon || Eye;

  // Fullscreen preview
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col">
        {/* Fullscreen toolbar */}
        <div className={`px-4 py-2 ${currentMode?.bg} border-b flex items-center justify-between shrink-0`}>
          <div className="flex items-center gap-3">
            <Icon className={`w-5 h-5 ${currentMode?.color}`} />
            <span className="font-semibold text-sm">Previewing as: {currentMode?.title}</span>
            {selectedUserId && previewData && (
              <Badge variant="outline" className="text-xs">
                {(previewData as any).user?.name || (previewData as any).profile?.name || `User #${selectedUserId}`}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Device toggles */}
            <div className="flex items-center gap-1 bg-white/80 rounded-lg p-1">
              <button
                onClick={() => setDeviceMode("desktop")}
                className={`p-1.5 rounded ${deviceMode === "desktop" ? "bg-gray-200" : "hover:bg-gray-100"}`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeviceMode("tablet")}
                className={`p-1.5 rounded ${deviceMode === "tablet" ? "bg-gray-200" : "hover:bg-gray-100"}`}
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeviceMode("mobile")}
                className={`p-1.5 rounded ${deviceMode === "mobile" ? "bg-gray-200" : "hover:bg-gray-100"}`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
            {/* Page selector */}
            <Select value={previewUrl} onValueChange={setPreviewUrl}>
              <SelectTrigger className="w-48 h-8 text-xs bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {previewPages.map((p) => (
                  <SelectItem key={p.url} value={p.url}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" variant="ghost" onClick={() => setIframeKey((k) => k + 1)}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => setIsFullscreen(false)}>
              <Minimize2 className="w-4 h-4 mr-1" /> Exit Fullscreen
            </Button>
          </div>
        </div>
        {/* Iframe */}
        <div className="flex-1 flex items-start justify-center bg-gray-100 overflow-auto p-4">
          <div
            className="bg-white shadow-2xl rounded-lg overflow-hidden transition-all duration-300"
            style={{
              width: DEVICE_WIDTHS[deviceMode],
              maxWidth: "100%",
              height: "calc(100vh - 80px)",
            }}
          >
            <iframe
              key={iframeKey}
              src={previewUrl}
              className="w-full h-full border-0"
              title={`Preview as ${currentMode?.title}`}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Preview Header Bar */}
      <div className={`p-4 rounded-xl ${currentMode?.bg} border-2 ${currentMode?.border}`}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${currentMode?.gradient} text-white`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">
                Previewing as: {currentMode?.title}
                {selectedUserId && previewData && (
                  <span className="font-normal text-gray-600">
                    {" "}— {(previewData as any).user?.name || (previewData as any).profile?.name || ""}
                  </span>
                )}
              </h2>
              <p className="text-sm text-gray-500">Read-only preview of what this user type sees</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => { setViewMode("select"); setSelectedUserId(undefined); }}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </div>
        </div>
      </div>

      {/* Tab switcher: Data View vs Website Preview */}
      <Tabs value={previewTab} onValueChange={(v) => setPreviewTab(v as PreviewTab)}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="data" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Data View
          </TabsTrigger>
          <TabsTrigger value="website" className="flex items-center gap-2">
            <Monitor className="w-4 h-4" /> Website Preview
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Website Preview Tab */}
      {previewTab === "website" && (
        <div className="space-y-4">
          {/* Preview toolbar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              {/* Device toggles */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setDeviceMode("desktop")}
                  className={`p-2 rounded-md transition-colors ${deviceMode === "desktop" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}
                  title="Desktop"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeviceMode("tablet")}
                  className={`p-2 rounded-md transition-colors ${deviceMode === "tablet" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}
                  title="Tablet"
                >
                  <Tablet className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeviceMode("mobile")}
                  className={`p-2 rounded-md transition-colors ${deviceMode === "mobile" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}
                  title="Mobile"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
              {/* Page selector */}
              <Select value={previewUrl} onValueChange={setPreviewUrl}>
                <SelectTrigger className="w-52 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {previewPages.map((p) => (
                    <SelectItem key={p.url} value={p.url}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setIframeKey((k) => k + 1)}>
                <RefreshCw className="w-4 h-4 mr-1" /> Refresh
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsFullscreen(true)}>
                <Maximize2 className="w-4 h-4 mr-1" /> Fullscreen
              </Button>
              <Button size="sm" variant="outline" onClick={() => window.open(previewUrl, "_blank")}>
                <ExternalLink className="w-4 h-4 mr-1" /> Open in Tab
              </Button>
            </div>
          </div>

          {/* Preview iframe */}
          <div className="flex justify-center bg-gray-100 rounded-xl p-4 min-h-[600px]">
            <div
              className="bg-white shadow-xl rounded-lg overflow-hidden transition-all duration-300 border"
              style={{
                width: DEVICE_WIDTHS[deviceMode],
                maxWidth: "100%",
                height: "700px",
              }}
            >
              <iframe
                key={iframeKey}
                src={previewUrl}
                className="w-full h-full border-0"
                title={`Preview as ${currentMode?.title}`}
              />
            </div>
          </div>
        </div>
      )}

      {/* Data View Tab */}
      {previewTab === "data" && (
        <>
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
            </div>
          )}

          {/* Public View */}
          {viewMode === "public" && previewData && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Showing what an anonymous visitor sees — no authentication, public content only</span>
              </div>
              <h3 className="text-lg font-semibold">Public Course Catalog</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {((previewData as any).courses || []).map((c: any) => (
                  <Card key={c.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-5">
                      <Badge variant="outline" className="mb-2">{c.category || "General"}</Badge>
                      <h4 className="font-semibold text-gray-900">{c.title}</h4>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{c.description}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-lg font-bold text-violet-600">
                          {c.price ? `$${(c.price / 100).toFixed(2)}` : "Free"}
                        </span>
                        <span className="text-xs text-gray-400">{c.totalEnrollments || 0} enrolled</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {((previewData as any).courses || []).length === 0 && (
                  <Card className="col-span-full"><CardContent className="py-8 text-center text-gray-400">No published courses yet</CardContent></Card>
                )}
              </div>

              <h3 className="text-lg font-semibold mt-6">Featured Coaches</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {((previewData as any).coaches || []).map((c: any) => (
                  <Card key={c.id}>
                    <CardContent className="pt-5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center">
                        <User className="w-6 h-6 text-violet-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{c.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Star className="w-3 h-3 text-yellow-500" /> {c.averageRating || "N/A"}
                          <span>·</span>
                          <span>{c.totalSessions || 0} sessions</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Learner View */}
          {viewMode === "learner" && previewData && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-emerald-50 p-3 rounded-lg">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <span>Showing the learner experience — courses, progress, and practice logs</span>
              </div>
              {(previewData as any).user && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-emerald-600" />
                      Learner Profile: {(previewData as any).user.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">{(previewData as any).user.email}</p>
                  </CardContent>
                </Card>
              )}
              <h3 className="text-lg font-semibold">Enrolled Courses</h3>
              <div className="space-y-3">
                {((previewData as any).enrollments || []).map((e: any) => (
                  <Card key={e.id}>
                    <CardContent className="py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-violet-600" />
                        <div>
                          <h4 className="font-medium">{e.courseName || `Course #${e.courseId}`}</h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Badge variant={e.status === "completed" ? "default" : "secondary"} className="text-xs">
                              {e.status}
                            </Badge>
                            <Clock className="w-3 h-3" /> Enrolled {new Date(e.enrolledAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-violet-600">{e.progress || 0}%</div>
                        <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
                          <div className="h-full bg-violet-600 rounded-full" style={{ width: `${e.progress || 0}%` }} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {((previewData as any).enrollments || []).length === 0 && (
                  <Card><CardContent className="py-8 text-center text-gray-400">No enrollments yet</CardContent></Card>
                )}
              </div>
            </div>
          )}

          {/* Coach View */}
          {viewMode === "coach" && previewData && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-violet-50 p-3 rounded-lg">
                <Users className="w-4 h-4 text-violet-600" />
                <span>Showing the coach dashboard — sessions, ratings, and student management</span>
              </div>
              {(previewData as any).profile && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-violet-600" />
                      Coach Profile: {(previewData as any).profile.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-violet-600">{(previewData as any).profile.averageRating || "N/A"}</div>
                        <div className="text-xs text-gray-500">Rating</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-emerald-600">{(previewData as any).profile.totalSessions || 0}</div>
                        <div className="text-xs text-gray-500">Sessions</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{(previewData as any).profile.totalStudents || 0}</div>
                        <div className="text-xs text-gray-500">Students</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* HR Admin View */}
          {viewMode === "hr" && previewData && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-orange-50 p-3 rounded-lg">
                <Building2 className="w-4 h-4 text-orange-600" />
                <span>Showing the HR Admin view — team enrollments, department analytics, and compliance</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-5 text-center">
                    <Users className="w-8 h-8 text-orange-600 mx-auto" />
                    <div className="text-3xl font-bold mt-2">{(previewData as any).stats?.users || 0}</div>
                    <div className="text-sm text-gray-500">Team Members</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-5 text-center">
                    <BookOpen className="w-8 h-8 text-violet-600 mx-auto" />
                    <div className="text-3xl font-bold mt-2">{(previewData as any).stats?.courses || 0}</div>
                    <div className="text-sm text-gray-500">Available Courses</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-5 text-center">
                    <GraduationCap className="w-8 h-8 text-emerald-600 mx-auto" />
                    <div className="text-3xl font-bold mt-2">{(previewData as any).stats?.enrollments || 0}</div>
                    <div className="text-sm text-gray-500">Active Enrollments</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-5 text-center">
                    <DollarSign className="w-8 h-8 text-blue-600 mx-auto" />
                    <div className="text-3xl font-bold mt-2">—</div>
                    <div className="text-sm text-gray-500">Training Budget</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-600" />
                    HR Dashboard Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { label: "Team Enrollment Management", desc: "Assign courses to team members and track completion" },
                      { label: "Department Analytics", desc: "View training progress by department and team" },
                      { label: "Compliance Reports", desc: "Generate bilingual compliance reports for audits" },
                      { label: "Budget Tracking", desc: "Monitor training spend and ROI per department" },
                      { label: "Bulk User Import", desc: "Import team members via CSV for quick onboarding" },
                      { label: "Certificate Management", desc: "View and download team certificates and transcripts" },
                    ].map((feature) => (
                      <div key={feature.label} className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-sm">{feature.label}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{feature.desc}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Admin View */}
          {viewMode === "admin" && previewData && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-amber-50 p-3 rounded-lg">
                <Shield className="w-4 h-4 text-amber-600" />
                <span>Full admin overview — all platform metrics and controls</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-5 text-center">
                    <Users className="w-8 h-8 text-blue-600 mx-auto" />
                    <div className="text-3xl font-bold mt-2">{(previewData as any).stats?.users || 0}</div>
                    <div className="text-sm text-gray-500">Total Users</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-5 text-center">
                    <BookOpen className="w-8 h-8 text-violet-600 mx-auto" />
                    <div className="text-3xl font-bold mt-2">{(previewData as any).stats?.courses || 0}</div>
                    <div className="text-sm text-gray-500">Total Courses</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-5 text-center">
                    <BarChart3 className="w-8 h-8 text-emerald-600 mx-auto" />
                    <div className="text-3xl font-bold mt-2">{(previewData as any).stats?.enrollments || 0}</div>
                    <div className="text-sm text-gray-500">Total Enrollments</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
