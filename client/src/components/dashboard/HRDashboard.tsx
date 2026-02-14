import { useState } from "react";
import { trpc } from "../../lib/trpc";
import { 
  Users, 
  LayoutDashboard, 
  UserPlus, 
  FolderKanban, 
  ClipboardList, 
  BarChart3, 
  FileSpreadsheet, 
  TrendingUp, 
  Settings, 
  CheckSquare,
  Download,
  Plus,
  Search,
  Filter,
  MoreVertical,
  AlertCircle,
  ChevronRight,
  Building2,
  GraduationCap,
  Clock,
  Target,
  Award,
  Mail,
  Calendar
} from "lucide-react";

type HRSection = 
  | "get-started" 
  | "dashboard" 
  | "learners" 
  | "cohorts" 
  | "assignments" 
  | "reports" 
  | "assessments" 
  | "analytics" 
  | "settings";

interface HRDashboardProps {
  user: {
    id: number;
    name: string | null;
    email: string | null;
    role: string;
    avatarUrl?: string | null;
  };
  organizationId: number;
}

export function HRDashboard({ user, organizationId }: HRDashboardProps) {
  const [activeSection, setActiveSection] = useState<HRSection>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch organization data
  const { data: orgData } = trpc.hr.getOrganization.useQuery({ organizationId });
  const { data: stats } = trpc.hr.getDashboardStats.useQuery({ organizationId });
  const { data: cohorts } = trpc.hr.getCohorts.useQuery({ organizationId });
  const { data: learners } = trpc.hr.getLearners.useQuery({ organizationId });
  const { data: assignments } = trpc.hr.getAssignments.useQuery({ organizationId });
  const { data: onboardingChecklist } = trpc.hr.getOnboardingChecklist.useQuery({ organizationId });

  const menuItems = [
    { id: "get-started" as const, label: "Get Started", icon: CheckSquare, badge: onboardingChecklist?.incomplete },
    { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
    { id: "learners" as const, label: "Learners", icon: Users, count: stats?.totalLearners },
    { id: "cohorts" as const, label: "Cohorts / Teams", icon: FolderKanban, count: cohorts?.length },
    { id: "assignments" as const, label: "Assignments", icon: ClipboardList },
    { id: "reports" as const, label: "Progress & Reports", icon: BarChart3 },
    { id: "assessments" as const, label: "Assessments", icon: FileSpreadsheet },
    { id: "analytics" as const, label: "Analytics", icon: TrendingUp },
    { id: "settings" as const, label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Org Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-teal-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-gray-900 truncate">
                {orgData?.name || "Organization"}
              </h2>
              <p className="text-xs text-gray-500">HR Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeSection === item.id
                  ? "bg-teal-50 text-teal-700"
                  : "text-gray-600 hover:bg-white hover:text-gray-900"
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.count !== undefined && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                  {item.count}
                </span>
              )}
              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-orange-100 text-orange-600">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-sm font-medium">
              {user.name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">
              {menuItems.find(m => m.id === activeSection)?.label}
            </h1>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6">
          {activeSection === "get-started" && (
            <GetStartedSection organizationId={organizationId} checklist={onboardingChecklist} />
          )}
          {activeSection === "dashboard" && (
            <DashboardSection stats={stats} cohorts={cohorts} />
          )}
          {activeSection === "learners" && (
            <LearnersSection organizationId={organizationId} learners={learners} searchQuery={searchQuery} />
          )}
          {activeSection === "cohorts" && (
            <CohortsSection organizationId={organizationId} cohorts={cohorts} />
          )}
          {activeSection === "assignments" && (
            <AssignmentsSection organizationId={organizationId} assignments={assignments} cohorts={cohorts} />
          )}
          {activeSection === "reports" && (
            <ReportsSection organizationId={organizationId} />
          )}
          {activeSection === "assessments" && (
            <AssessmentsSection organizationId={organizationId} />
          )}
          {activeSection === "analytics" && (
            <AnalyticsSection organizationId={organizationId} />
          )}
          {activeSection === "settings" && (
            <SettingsSection organizationId={organizationId} orgData={orgData} />
          )}
        </div>
      </main>
    </div>
  );
}

// ============================================================================
// GET STARTED SECTION
// ============================================================================
function GetStartedSection({ organizationId, checklist }: { organizationId: number; checklist: any }) {
  const steps = [
    { id: "invite", label: "Invite your first learners", description: "Add team members to start their learning journey", completed: checklist?.learnersInvited },
    { id: "cohort", label: "Create a cohort", description: "Organize learners into teams or departments", completed: checklist?.cohortCreated },
    { id: "assign", label: "Assign a learning path", description: "Set up courses for your team", completed: checklist?.pathAssigned },
    { id: "export", label: "Export your first report", description: "Download progress data for your records", completed: checklist?.reportExported },
  ];

  return (
    <div className="max-w-3xl">
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-6 text-white mb-8">
        <h2 className="text-2xl font-bold mb-2">Welcome to your HR Dashboard!</h2>
        <p className="text-teal-100">Complete these steps to get your organization set up for success.</p>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`bg-white rounded-xl border p-5 flex items-center gap-4 ${
              step.completed ? "border-green-200 bg-green-50/50" : "border-gray-200"
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              step.completed ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
            }`}>
              {step.completed ? (
                <CheckSquare className="w-5 h-5" />
              ) : (
                <span className="font-semibold">{index + 1}</span>
              )}
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold ${step.completed ? "text-green-700" : "text-gray-900"}`}>
                {step.label}
              </h3>
              <p className="text-sm text-gray-500">{step.description}</p>
            </div>
            {!step.completed && (
              <button className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors">
                Start
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// DASHBOARD SECTION
// ============================================================================
function DashboardSection({ stats, cohorts }: { stats: any; cohorts: any }) {
  const kpiCards = [
    { label: "Total Learners", value: stats?.totalLearners || 0, icon: Users, color: "blue" },
    { label: "Active This Week", value: stats?.activeThisWeek || 0, icon: Clock, color: "green" },
    { label: "Avg. Progress", value: `${stats?.avgProgress || 0}%`, icon: Target, color: "purple" },
    { label: "Completions", value: stats?.completions || 0, icon: Award, color: "orange" },
  ];

  const alerts = stats?.alerts || [];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{kpi.label}</span>
              <kpi.icon className={`w-5 h-5 text-${kpi.color}-500`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-orange-800">Attention Required</h3>
          </div>
          <ul className="space-y-2">
            {alerts.map((alert: any, i: number) => (
              <li key={i} className="flex items-center gap-2 text-sm text-orange-700">
                <ChevronRight className="w-4 h-4" />
                {alert.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Quick Stats by Cohort */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Cohort Overview</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {cohorts?.slice(0, 5).map((cohort: any) => (
            <div key={cohort.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{cohort.name}</p>
                <p className="text-sm text-gray-500">{cohort.memberCount} members</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{cohort.avgProgress}%</p>
                  <p className="text-xs text-gray-500">avg progress</p>
                </div>
                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-teal-500 rounded-full" 
                    style={{ width: `${cohort.avgProgress}%` }}
                  />
                </div>
              </div>
            </div>
          )) || (
            <div className="p-8 text-center text-gray-500">
              No cohorts yet. Create your first cohort to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// LEARNERS SECTION
// ============================================================================
function LearnersSection({ organizationId, learners, searchQuery }: { organizationId: number; learners: any; searchQuery: string }) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [filterCohort, setFilterCohort] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  const filteredLearners = learners?.filter((l: any) => {
    if (searchQuery && !l.name?.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !l.email?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterCohort && l.cohortId !== parseInt(filterCohort)) return false;
    if (filterStatus && l.status !== filterStatus) return false;
    return true;
  }) || [];

  return (
    <div className="space-y-4">
      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <select 
            value={filterCohort}
            onChange={(e) => setFilterCohort(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">All Cohorts</option>
          </select>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <button 
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
        >
          <UserPlus className="w-4 h-4" />
          Invite Learner
        </button>
      </div>

      {/* Learners Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-white border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Learner</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Cohort</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Level</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Progress</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Last Active</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredLearners.map((learner: any) => (
              <tr key={learner.id} className="hover:bg-white">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 text-sm font-medium">
                      {learner.name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{learner.name}</p>
                      <p className="text-sm text-gray-500">{learner.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{learner.cohortName || "-"}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-700">
                    {learner.currentLevel || "N/A"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-teal-500 rounded-full" 
                        style={{ width: `${learner.progress || 0}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{learner.progress || 0}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {learner.lastActiveAt ? new Date(learner.lastActiveAt).toLocaleDateString() : "Never"}
                </td>
                <td className="px-4 py-3">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredLearners.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No learners found. Invite your first learner to get started.
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteLearnerModal 
          organizationId={organizationId} 
          onClose={() => setShowInviteModal(false)} 
        />
      )}
    </div>
  );
}

// ============================================================================
// COHORTS SECTION
// ============================================================================
function CohortsSection({ organizationId, cohorts }: { organizationId: number; cohorts: any }) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-gray-500">Organize learners into teams, departments, or training groups.</p>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
        >
          <Plus className="w-4 h-4" />
          Create Cohort
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cohorts?.map((cohort: any) => (
          <div key={cohort.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">{cohort.name}</h3>
                <p className="text-sm text-gray-500">{cohort.department || "No department"}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded ${
                cohort.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
              }`}>
                {cohort.status}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Members</span>
                <span className="font-medium">{cohort.memberCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Avg Progress</span>
                <span className="font-medium">{cohort.avgProgress}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Target</span>
                <span className="font-medium">{cohort.targetLevel || "Not set"}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
              <button className="flex-1 px-3 py-2 text-sm text-teal-600 hover:bg-teal-50 rounded-lg">
                View Members
              </button>
              <button className="flex-1 px-3 py-2 text-sm text-gray-600 hover:bg-white rounded-lg">
                Edit
              </button>
            </div>
          </div>
        )) || (
          <div className="col-span-full p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
            No cohorts yet. Create your first cohort to organize learners.
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateCohortModal 
          organizationId={organizationId} 
          onClose={() => setShowCreateModal(false)} 
        />
      )}
    </div>
  );
}

// ============================================================================
// ASSIGNMENTS SECTION
// ============================================================================
function AssignmentsSection({ organizationId, assignments, cohorts }: { organizationId: number; assignments: any; cohorts: any }) {
  const [showAssignModal, setShowAssignModal] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-gray-500">Assign courses and learning paths to cohorts or individuals.</p>
        <button 
          onClick={() => setShowAssignModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
        >
          <Plus className="w-4 h-4" />
          Create Assignment
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-white border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Course/Path</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Assigned To</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Due Date</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {assignments?.map((assignment: any) => (
              <tr key={assignment.id} className="hover:bg-white">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#E7F2F2] flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-[#0F3D3E]" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{assignment.courseName}</p>
                      <p className="text-sm text-gray-500">{assignment.targetLevel || "No target"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {assignment.cohortName || assignment.userName || "-"}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    assignment.assignmentType === "required" 
                      ? "bg-red-100 text-red-700" 
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {assignment.assignmentType}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : "No deadline"}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    assignment.status === "completed" ? "bg-green-100 text-green-700" :
                    assignment.status === "active" ? "bg-blue-100 text-blue-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {assignment.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!assignments || assignments.length === 0) && (
          <div className="p-8 text-center text-gray-500">
            No assignments yet. Create your first assignment to get started.
          </div>
        )}
      </div>

      {showAssignModal && (
        <CreateAssignmentModal 
          organizationId={organizationId}
          cohorts={cohorts}
          onClose={() => setShowAssignModal(false)} 
        />
      )}
    </div>
  );
}

// ============================================================================
// REPORTS SECTION
// ============================================================================
function ReportsSection({ organizationId }: { organizationId: number }) {
  const { data: reportData } = trpc.hr.getProgressReport.useQuery({ organizationId });
  const exportMutation = trpc.hr.exportReport.useMutation();

  const handleExport = async (format: "csv" | "xlsx") => {
    try {
      const result = await exportMutation.mutateAsync({ organizationId, format });
      // Trigger download
      const link = document.createElement("a");
      link.href = result.downloadUrl;
      link.download = `report-${new Date().toISOString().split("T")[0]}.${format}`;
      link.click();
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Progress & Reports</h2>
          <p className="text-gray-500">Track learner progress and export data for compliance.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => handleExport("csv")}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-white"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button 
            onClick={() => handleExport("xlsx")}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="">All Cohorts</option>
          </select>
          <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="">All Levels</option>
            <option value="BBB">BBB</option>
            <option value="CBC">CBC</option>
            <option value="CCC">CCC</option>
          </select>
          <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="30">Last 30 days</option>
            <option value="60">Last 60 days</option>
            <option value="90">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      {/* Progress by Cohort */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Progress by Cohort</h3>
        </div>
        <div className="p-4">
          {reportData?.cohortProgress?.map((cohort: any) => (
            <div key={cohort.id} className="mb-4 last:mb-0">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{cohort.name}</span>
                <span className="text-sm text-gray-500">{cohort.completionRate}% complete</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-teal-500 rounded-full transition-all" 
                  style={{ width: `${cohort.completionRate}%` }}
                />
              </div>
            </div>
          )) || (
            <p className="text-gray-500 text-center py-4">No data available</p>
          )}
        </div>
      </div>

      {/* Completion Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Completion Details</h3>
        </div>
        <table className="w-full">
          <thead className="bg-white border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Learner</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Course</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Progress</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Completed At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reportData?.completions?.map((completion: any, i: number) => (
              <tr key={i} className="hover:bg-white">
                <td className="px-4 py-3 font-medium text-gray-900">{completion.learnerName}</td>
                <td className="px-4 py-3 text-gray-600">{completion.courseName}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    completion.progress === 100 ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    {completion.progress}%
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {completion.completedAt ? new Date(completion.completedAt).toLocaleDateString() : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// ASSESSMENTS SECTION
// ============================================================================
function AssessmentsSection({ organizationId }: { organizationId: number }) {
  const { data: assessments } = trpc.hr.getAssessments.useQuery({ organizationId });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Assessments</h2>
        <p className="text-gray-500">View quiz and evaluation scores by cohort.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-white border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Assessment</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Cohort</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Avg Score</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Pass Rate</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Attempts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {assessments?.map((assessment: any) => (
              <tr key={assessment.id} className="hover:bg-white">
                <td className="px-4 py-3 font-medium text-gray-900">{assessment.name}</td>
                <td className="px-4 py-3 text-gray-600">{assessment.cohortName}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    assessment.avgScore >= 70 ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                  }`}>
                    {assessment.avgScore}%
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{assessment.passRate}%</td>
                <td className="px-4 py-3 text-gray-600">{assessment.attempts}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!assessments || assessments.length === 0) && (
          <div className="p-8 text-center text-gray-500">
            No assessment data available yet.
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// ANALYTICS SECTION
// ============================================================================
function AnalyticsSection({ organizationId }: { organizationId: number }) {
  const { data: analytics } = trpc.hr.getAnalytics.useQuery({ organizationId });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Analytics</h2>
        <p className="text-gray-500">Trends and insights for your organization.</p>
      </div>

      {/* Trend Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm text-gray-500 mb-2">Active Learners (This Week)</h3>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-gray-900">{analytics?.activeThisWeek || 0}</span>
            {analytics?.activeChange && (
              <span className={`text-sm ${analytics.activeChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                {analytics.activeChange >= 0 ? "+" : ""}{analytics.activeChange}%
              </span>
            )}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm text-gray-500 mb-2">Completions (This Month)</h3>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-gray-900">{analytics?.completionsThisMonth || 0}</span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm text-gray-500 mb-2">Avg. Time to Complete</h3>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-gray-900">{analytics?.avgTimeToComplete || "-"}</span>
            <span className="text-sm text-gray-500">days</span>
          </div>
        </div>
      </div>

      {/* Top Modules */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Top Modules</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {analytics?.topModules?.map((module: any, i: number) => (
            <div key={i} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-sm font-medium">
                  {i + 1}
                </span>
                <span className="font-medium text-gray-900">{module.name}</span>
              </div>
              <span className="text-gray-500">{module.completions} completions</span>
            </div>
          )) || (
            <div className="p-8 text-center text-gray-500">No data available</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SETTINGS SECTION
// ============================================================================
function SettingsSection({ organizationId, orgData }: { organizationId: number; orgData: any }) {
  const [orgName, setOrgName] = useState(orgData?.name || "");
  const [emailDomain, setEmailDomain] = useState(orgData?.domain || "");

  const updateMutation = trpc.hr.updateOrganization.useMutation();

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        organizationId,
        name: orgName,
        domain: emailDomain,
      });
    } catch (error) {
      console.error("Failed to save:", error);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Organization Settings</h2>
        <p className="text-gray-500">Manage your organization's basic settings.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organization Name
          </label>
          <input
            type="text"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Allowed Email Domain (optional)
          </label>
          <input
            type="text"
            value={emailDomain}
            onChange={(e) => setEmailDomain(e.target.value)}
            placeholder="e.g., company.com"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            Only users with this email domain can be invited.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50"
        >
          {updateMutation.isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
        <p className="text-gray-500 text-sm">
          For technical settings, billing, or platform configuration, please contact your platform administrator.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// MODALS
// ============================================================================
function InviteLearnerModal({ organizationId, onClose }: { organizationId: number; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const inviteMutation = trpc.hr.inviteLearner.useMutation();

  const handleInvite = async () => {
    try {
      await inviteMutation.mutateAsync({ organizationId, email, name });
      onClose();
    } catch (error) {
      console.error("Failed to invite:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Invite Learner</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg">
            Cancel
          </button>
          <button 
            onClick={handleInvite}
            disabled={inviteMutation.isPending}
            className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg"
          >
            {inviteMutation.isPending ? "Sending..." : "Send Invite"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateCohortModal({ organizationId, onClose }: { organizationId: number; onClose: () => void }) {
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [targetLevel, setTargetLevel] = useState("");
  const createMutation = trpc.hr.createCohort.useMutation();

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync({ organizationId, name, department, targetLevel });
      onClose();
    } catch (error) {
      console.error("Failed to create:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Cohort</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cohort Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department (optional)</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Level</label>
            <select
              value={targetLevel}
              onChange={(e) => setTargetLevel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg"
            >
              <option value="">Select target</option>
              <option value="BBB">BBB</option>
              <option value="CBC">CBC</option>
              <option value="CCC">CCC</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg">
            Cancel
          </button>
          <button 
            onClick={handleCreate}
            disabled={createMutation.isPending}
            className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg"
          >
            {createMutation.isPending ? "Creating..." : "Create Cohort"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateAssignmentModal({ organizationId, cohorts, onClose }: { organizationId: number; cohorts: any; onClose: () => void }) {
  const [cohortId, setCohortId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [assignmentType, setAssignmentType] = useState("required");
  const [dueDate, setDueDate] = useState("");
  
  const { data: courses } = trpc.courses.list.useQuery();
  const createMutation = trpc.hr.createAssignment.useMutation();

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync({ 
        organizationId, 
        cohortId: parseInt(cohortId), 
        courseId: parseInt(courseId),
        assignmentType: assignmentType as "required" | "optional" | "recommended",
        dueDate: dueDate ? new Date(dueDate) : undefined,
      });
      onClose();
    } catch (error) {
      console.error("Failed to create:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Assignment</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign To (Cohort)</label>
            <select
              value={cohortId}
              onChange={(e) => setCohortId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg"
            >
              <option value="">Select cohort</option>
              {cohorts?.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg"
            >
              <option value="">Select course</option>
              {courses?.map((c: any) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={assignmentType}
              onChange={(e) => setAssignmentType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg"
            >
              <option value="required">Required</option>
              <option value="optional">Optional</option>
              <option value="recommended">Recommended</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date (optional)</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg">
            Cancel
          </button>
          <button 
            onClick={handleCreate}
            disabled={createMutation.isPending}
            className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg"
          >
            {createMutation.isPending ? "Creating..." : "Create Assignment"}
          </button>
        </div>
      </div>
    </div>
  );
}
