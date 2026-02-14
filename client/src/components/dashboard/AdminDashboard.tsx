import { useState } from "react";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  BookOpen,
  TrendingUp,
  DollarSign,
  Settings,
  ChevronRight,
  Building2,
  GraduationCap,
  Target,
  BarChart3,
  Download,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Activity,
  FileText,
  UserPlus,
  Shield,
} from "lucide-react";

interface User {
  id: number;
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  role?: string;
  isOwner?: boolean;
}

interface AdminDashboardProps {
  user: User;
}

export default function AdminDashboardContent({ user }: AdminDashboardProps) {
  const { language } = useLanguage();
  const isEn = language === "en";
  const [reportTab, setReportTab] = useState("overview");

  // Fetch admin data
  const { data: orgStats, isLoading: statsLoading } = trpc.admin.getOrgStats.useQuery();
  const { data: recentActivity, isLoading: activityLoading } = trpc.admin.getRecentActivity.useQuery();
  const { data: cohorts, isLoading: cohortsLoading } = trpc.admin.getCohorts.useQuery();
  const { data: pendingApprovals, isLoading: approvalsLoading } = trpc.admin.getPendingApprovals.useQuery();

  const firstName = user.name?.split(" ")[0] || "Admin";
  const isOwner = user.isOwner === true || user.role === "owner";

  // Labels
  const labels = {
    greeting: isEn ? `Welcome back, ${firstName}!` : `Bon retour, ${firstName}!`,
    subtitle: isEn ? "Organization Overview" : "Aperçu de l'organisation",
    orgOverview: isEn ? "Organization Overview" : "Aperçu de l'organisation",
    totalLearners: isEn ? "Total Learners" : "Apprenants totaux",
    activeThisWeek: isEn ? "Active This Week" : "Actifs cette semaine",
    completions: isEn ? "Course Completions" : "Cours terminés",
    avgProgress: isEn ? "Avg. Progress" : "Progression moy.",
    cohorts: isEn ? "Cohorts / Teams" : "Cohortes / Équipes",
    viewAll: isEn ? "View All" : "Voir tout",
    exportCsv: isEn ? "Export CSV" : "Exporter CSV",
    assignments: isEn ? "Assignments" : "Affectations",
    assignCourse: isEn ? "Assign Course" : "Affecter un cours",
    reporting: isEn ? "Reporting" : "Rapports",
    overview: isEn ? "Overview" : "Aperçu",
    byTeam: isEn ? "By Team" : "Par équipe",
    byLevel: isEn ? "By Level" : "Par niveau",
    pendingApprovals: isEn ? "Pending Approvals" : "Approbations en attente",
    coachApplications: isEn ? "Coach Applications" : "Candidatures coach",
    recentActivity: isEn ? "Recent Activity" : "Activité récente",
    quickLinks: isEn ? "Quick Links" : "Liens rapides",
    manageUsers: isEn ? "Manage Users" : "Gérer les utilisateurs",
    manageRoles: isEn ? "Manage Roles" : "Gérer les rôles",
    systemSettings: isEn ? "System Settings" : "Paramètres système",
    viewReports: isEn ? "View Reports" : "Voir les rapports",
    noActivity: isEn ? "No recent activity" : "Aucune activité récente",
    noCohorts: isEn ? "No cohorts created yet" : "Aucune cohorte créée",
    createCohort: isEn ? "Create Cohort" : "Créer une cohorte",
    learners: isEn ? "learners" : "apprenants",
    progress: isEn ? "progress" : "progression",
    approve: isEn ? "Approve" : "Approuver",
    reject: isEn ? "Reject" : "Rejeter",
    review: isEn ? "Review" : "Examiner",
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />

      <main id="main-content" className="flex-1" role="main" aria-label={isEn ? "Admin Dashboard" : "Tableau de bord admin"}>
        <div className="container py-8 max-w-7xl mx-auto px-4">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary/20">
                <AvatarImage src={user.avatarUrl || undefined} alt={user.name || "Admin"} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {firstName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{labels.greeting}</h1>
                  {isOwner && (
                    <Badge variant="default" className="bg-[#C65A1E]">
                      <Shield className="h-3 w-3 mr-1" />
                      Owner
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">{labels.subtitle}</p>
              </div>
            </div>
            
            {/* Quick Links */}
            <div className="flex flex-wrap gap-2">
              <Link href="/admin/users">
                <Button variant="outline" size="sm" className="gap-2">
                  <Users className="h-4 w-4" />
                  {labels.manageUsers}
                </Button>
              </Link>
              {isOwner && (
                <Link href="/admin/roles">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Shield className="h-4 w-4" />
                    {labels.manageRoles}
                  </Button>
                </Link>
              )}
              <Link href="/admin/settings">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {statsLoading ? (
              <>
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </>
            ) : (
              <>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{orgStats?.totalLearners || 0}</p>
                        <p className="text-xs text-muted-foreground">{labels.totalLearners}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Activity className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{orgStats?.activeThisWeek || 0}</p>
                        <p className="text-xs text-muted-foreground">{labels.activeThisWeek}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <GraduationCap className="h-6 w-6 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{orgStats?.completions || 0}</p>
                        <p className="text-xs text-muted-foreground">{labels.completions}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-[#E7F2F2] dark:bg-[#E7F2F2]/30 flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-[#0F3D3E]" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{orgStats?.avgProgress || 0}%</p>
                        <p className="text-xs text-muted-foreground">{labels.avgProgress}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content - 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Cohorts / Teams */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    {labels.cohorts}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1">
                      <Download className="h-4 w-4" />
                      {labels.exportCsv}
                    </Button>
                    <Link href="/admin/cohorts">
                      <Button variant="outline" size="sm">
                        {labels.viewAll}
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {cohortsLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ) : cohorts?.length ? (
                    <div className="space-y-3">
                      {cohorts.slice(0, 4).map((cohort: any) => (
                        <div key={cohort.id} className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{cohort.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {cohort.learnersCount} {labels.learners} • {cohort.avgProgress}% {labels.progress}
                            </p>
                          </div>
                          <div className="w-24">
                            <Progress value={cohort.avgProgress} className="h-2" />
                          </div>
                          <Link href={`/admin/cohorts/${cohort.id}`}>
                            <Button variant="ghost" size="sm">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">{labels.noCohorts}</p>
                      <Link href="/admin/cohorts/new">
                        <Button className="gap-2">
                          <UserPlus className="h-4 w-4" />
                          {labels.createCohort}
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Reporting */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    {labels.reporting}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={reportTab} onValueChange={setReportTab}>
                    <TabsList className="mb-4">
                      <TabsTrigger value="overview">{labels.overview}</TabsTrigger>
                      <TabsTrigger value="by-team">{labels.byTeam}</TabsTrigger>
                      <TabsTrigger value="by-level">{labels.byLevel}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg bg-muted/50 text-center">
                          <p className="text-3xl font-bold text-green-600">{orgStats?.levelBBB || 0}</p>
                          <p className="text-sm text-muted-foreground">BBB Level</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50 text-center">
                          <p className="text-3xl font-bold text-blue-600">{orgStats?.levelCBC || 0}</p>
                          <p className="text-sm text-muted-foreground">CBC Level</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50 text-center">
                          <p className="text-3xl font-bold text-[#0F3D3E]">{orgStats?.levelCCC || 0}</p>
                          <p className="text-sm text-muted-foreground">CCC Level</p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="by-team">
                      <div className="text-center py-6 text-muted-foreground">
                        <p>{isEn ? "Team breakdown coming soon" : "Répartition par équipe bientôt disponible"}</p>
                      </div>
                    </TabsContent>

                    <TabsContent value="by-level">
                      <div className="text-center py-6 text-muted-foreground">
                        <p>{isEn ? "Level breakdown coming soon" : "Répartition par niveau bientôt disponible"}</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Assignments */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    {labels.assignments}
                  </CardTitle>
                  <Link href="/admin/assignments/new">
                    <Button size="sm" className="gap-2">
                      <BookOpen className="h-4 w-4" />
                      {labels.assignCourse}
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{isEn ? "Assign courses to cohorts or individuals" : "Affectez des cours aux cohortes ou individus"}</p>
                    <Link href="/admin/assignments">
                      <Button variant="link" className="mt-2">{labels.viewAll}</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - 1 column */}
            <div className="space-y-6">
              
              {/* Pending Approvals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    {labels.pendingApprovals}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {approvalsLoading ? (
                    <Skeleton className="h-20 w-full" />
                  ) : pendingApprovals?.coachApplications?.length ? (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">{labels.coachApplications}</p>
                      {pendingApprovals.coachApplications.slice(0, 3).map((app: any) => (
                        <div key={app.id} className="flex items-center gap-3 p-3 rounded-lg border">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-amber-100 text-amber-600">
                              {app.name?.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{app.name}</p>
                            <p className="text-xs text-muted-foreground">{app.email}</p>
                          </div>
                          <Link href={`/admin/applications/${app.id}`}>
                            <Button variant="outline" size="sm">
                              {labels.review}
                            </Button>
                          </Link>
                        </div>
                      ))}
                      <Link href="/admin/applications">
                        <Button variant="ghost" className="w-full gap-2">
                          {labels.viewAll}
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {isEn ? "No pending approvals" : "Aucune approbation en attente"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    {labels.recentActivity}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activityLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : recentActivity?.length ? (
                    <div className="space-y-3">
                      {recentActivity.slice(0, 5).map((activity: any, index: number) => (
                        <div key={index} className="flex gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            {activity.type === "enrollment" && <BookOpen className="h-4 w-4 text-primary" />}
                            {activity.type === "completion" && <CheckCircle className="h-4 w-4 text-green-600" />}
                            {activity.type === "signup" && <UserPlus className="h-4 w-4 text-blue-600" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{activity.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(activity.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">{labels.noActivity}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    {labels.quickLinks}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/admin/reports">
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <FileText className="h-4 w-4" />
                      {labels.viewReports}
                    </Button>
                  </Link>
                  <Link href="/admin/users">
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <Users className="h-4 w-4" />
                      {labels.manageUsers}
                    </Button>
                  </Link>
                  {isOwner && (
                    <Link href="/admin/settings">
                      <Button variant="ghost" className="w-full justify-start gap-2">
                        <Settings className="h-4 w-4" />
                        {labels.systemSettings}
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
