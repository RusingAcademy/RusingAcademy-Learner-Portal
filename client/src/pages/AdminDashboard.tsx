import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  Users,
  UserCheck,
  UserX,
  DollarSign,
  Ticket,
  TrendingUp,
  Calendar,
  MessageSquare,
  Target,
  Mail,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  Activity,
  FileDown,
  Bell,
  History,
  ChevronRight,
  BookOpen,
  Video,
  CreditCard,
  X,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { RoleSwitcherCompact } from "@/components/RoleSwitcher";
import { toast } from "sonner";
import AdminAnalytics from "@/components/AdminAnalytics";
import AdminCoupons from "@/components/AdminCoupons";
import SequenceAnalyticsDashboard from "@/components/SequenceAnalyticsDashboard";
import MeetingOutcomesDashboard from "@/components/MeetingOutcomesDashboard";
import CRMDashboardWidget from "@/components/CRMDashboardWidget";
import LeadScoringDashboard from "@/components/LeadScoringDashboard";
import DealPipelineKanban from "@/components/DealPipelineKanban";
import EmailTemplatesLibrary from "@/components/EmailTemplatesLibrary";
import CRMActivityReportDashboard from "@/components/CRMActivityReportDashboard";
import PipelineNotificationsBell from "@/components/PipelineNotificationsBell";
import LeadTagsManager from "@/components/LeadTagsManager";
import CRMWebhooksManager from "@/components/CRMWebhooksManager";
import TagAutomationManager from "@/components/TagAutomationManager";
import CRMDataExport from "@/components/CRMDataExport";
import CRMLeadImport from "@/components/CRMLeadImport";
import LeadSegmentsManager from "@/components/LeadSegmentsManager";
import SegmentAlertsManager from "@/components/SegmentAlertsManager";
import SegmentComparisonDashboard from "@/components/SegmentComparisonDashboard";
import LeadMergeManager from "@/components/LeadMergeManager";
import GlobalCRMDashboard from "@/components/GlobalCRMDashboard";
import SalesGoalsManager from "@/components/SalesGoalsManager";
import KPITrendCharts from "@/components/KPITrendCharts";
import EmailSettingsPanel from "@/components/EmailSettingsPanel";
import { StatCard, ChartCard, AlertBadge } from "@/components/dashboard";
import { GraduationCap, Percent, GripVertical, Upload, Loader2, Pencil } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface CoachApplication {
  id: number;
  userId: number;
  name: string;
  email: string;
  bio: string;
  specialties: string[];
  credentials: string;
  yearsExperience: number;
  appliedAt: Date;
  status: "pending" | "approved" | "rejected" | "suspended" | null;
  photoUrl?: string | null;
}

interface DepartmentInquiry {
  id: number;
  name: string;
  email: string;
  department: string;
  teamSize: string;
  message: string;
  createdAt: Date;
  status: "new" | "contacted" | "in_progress" | "converted" | "closed" | null;
}

// Sortable Lesson Item Component
function SortableLessonItem({ lesson, idx, moduleIdx, language, onEdit, onDelete }: {
  lesson: any;
  idx: number;
  moduleIdx: number;
  language: string;
  onEdit: (lesson: any) => void;
  onDelete: (lessonId: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: lesson.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center justify-between p-2 bg-muted/50 rounded group">
      <div className="flex items-center gap-2">
        <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground">
          <GripVertical className="h-3 w-3" />
        </button>
        <span className="text-xs text-muted-foreground">{moduleIdx + 1}.{idx + 1}</span>
        <span className="text-sm">{lesson.title}</span>
        <Badge variant="secondary" className="text-xs">{lesson.contentType}</Badge>
        {lesson.isPreview && <Badge variant="outline" className="text-xs">{language === "fr" ? "Aperçu" : "Preview"}</Badge>}
      </div>
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onEdit(lesson)}>
          <Pencil className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive h-6 w-6 p-0"
          onClick={() => {
            if (confirm(language === "fr" ? "Supprimer cette leçon ?" : "Delete this lesson?")) {
              onDelete(lesson.id);
            }
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

// Sortable Module Item Component
function SortableModuleItem({ module, idx, language, selectedCourseId, createLessonMutation, deleteModuleMutation, deleteLessonMutation, dndSensors, handleLessonDragEnd, onEditLesson }: {
  module: any;
  idx: number;
  language: string;
  selectedCourseId: number;
  createLessonMutation: any;
  deleteModuleMutation: any;
  deleteLessonMutation: any;
  dndSensors: any;
  handleLessonDragEnd: (moduleId: number) => (event: DragEndEvent) => void;
  onEditLesson: (lesson: any) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: module.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground">
            <GripVertical className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium text-muted-foreground">#{idx + 1}</span>
          <h4 className="font-medium">{module.title}</h4>
          <Badge variant="outline">{module.lessons?.length || 0} {language === "fr" ? "leçons" : "lessons"}</Badge>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const title = prompt(language === "fr" ? "Titre de la leçon:" : "Lesson title:");
              if (title) {
                createLessonMutation.mutate({ moduleId: module.id, courseId: selectedCourseId, title });
              }
            }}
          >
            {language === "fr" ? "+ Leçon" : "+ Lesson"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive"
            onClick={() => {
              if (confirm(language === "fr" ? "Supprimer ce module ?" : "Delete this module?")) {
                deleteModuleMutation.mutate({ moduleId: module.id });
              }
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {/* Lessons with DnD */}
      {module.lessons?.length > 0 && (
        <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={handleLessonDragEnd(module.id)}>
          <SortableContext items={module.lessons.map((l: any) => l.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2 ml-4">
              {module.lessons.map((lesson: any, lessonIdx: number) => (
                <SortableLessonItem
                  key={lesson.id}
                  lesson={lesson}
                  idx={lessonIdx}
                  moduleIdx={idx}
                  language={language}
                  onEdit={onEditLesson}
                  onDelete={(lessonId) => deleteLessonMutation.mutate({ lessonId })}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { language } = useLanguage();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "coaches" | "inquiries" | "analytics" | "coupons" | "crm" | "email" | "users" | "courses">("overview");
  const [usersSearchQuery, setUsersSearchQuery] = useState("");
  const [usersRoleFilter, setUsersRoleFilter] = useState<"all" | "admin" | "coach" | "learner" | "hr_admin">("all");
  const [usersPage, setUsersPage] = useState(1);
  const [selectedApplication, setSelectedApplication] = useState<CoachApplication | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<DepartmentInquiry | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [crmSubTab, setCrmSubTab] = useState<"dashboard" | "trends" | "goals" | "analytics" | "outcomes" | "scoring" | "pipeline" | "templates" | "reports" | "tags" | "webhooks" | "automation" | "export" | "import" | "segments" | "alerts" | "compare" | "merge">("dashboard");
  
  // Bulk actions state
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  const [bulkNotificationDialogOpen, setBulkNotificationDialogOpen] = useState(false);
  const [bulkNotificationTitle, setBulkNotificationTitle] = useState("");
  const [bulkNotificationMessage, setBulkNotificationMessage] = useState("");
  const [bulkNewRole, setBulkNewRole] = useState<"admin" | "coach" | "learner" | "hr_admin">("learner");
  
  // User details panel state
  const [userDetailsPanelOpen, setUserDetailsPanelOpen] = useState(false);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<number | null>(null);

  // Course management state
  const [coursesSearchQuery, setCoursesSearchQuery] = useState("");
  const [coursesStatusFilter, setCoursesStatusFilter] = useState<"all" | "draft" | "published" | "archived">("all");
  const [coursesPage, setCoursesPage] = useState(1);
  const [createCourseDialogOpen, setCreateCourseDialogOpen] = useState(false);
  const [courseEditorOpen, setCourseEditorOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseShortDesc, setNewCourseShortDesc] = useState("");
  const [newCourseCategory, setNewCourseCategory] = useState("sle_oral");
  const [newCourseLevel, setNewCourseLevel] = useState("all_levels");
  const [newCoursePrice, setNewCoursePrice] = useState("0");

  // Lesson editor state
  const [lessonEditorOpen, setLessonEditorOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonContentType, setLessonContentType] = useState("text");
  const [lessonContent, setLessonContent] = useState("");
  const [lessonIsPreview, setLessonIsPreview] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // DnD sensors
  const dndSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // tRPC queries
  const pendingCoachesQuery = trpc.admin.getPendingCoaches.useQuery();
  const analyticsQuery = trpc.admin.getAnalytics.useQuery();
  const inquiriesQuery = trpc.admin.getDepartmentInquiries.useQuery();
  const usersQuery = trpc.admin.getAllUsers.useQuery({
    search: usersSearchQuery || undefined,
    roleFilter: usersRoleFilter,
    page: usersPage,
    limit: 20,
  });
  
  // Course queries
  const coursesQuery = trpc.admin.getAllCourses.useQuery({
    status: coursesStatusFilter,
    search: coursesSearchQuery || undefined,
    page: coursesPage,
    limit: 20,
  });
  const courseStatsQuery = trpc.admin.getCourseStats.useQuery();
  const courseForEditQuery = trpc.admin.getCourseForEdit.useQuery(
    { courseId: selectedCourseId! },
    { enabled: !!selectedCourseId }
  );
  
  // tRPC mutations
  const approveCoachMutation = trpc.admin.approveCoach.useMutation({
    onSuccess: () => {
      toast.success(language === "fr" ? "Coach approuvé avec succès" : "Coach approved successfully");
      pendingCoachesQuery.refetch();
      setSelectedApplication(null);
    },
    onError: () => {
      toast.error(language === "fr" ? "Erreur lors de l'approbation" : "Error approving coach");
    },
  });
  
  const rejectCoachMutation = trpc.admin.rejectCoach.useMutation({
    onSuccess: () => {
      toast.success(language === "fr" ? "Candidature rejetée" : "Application rejected");
      pendingCoachesQuery.refetch();
      setSelectedApplication(null);
      setRejectionReason("");
    },
    onError: () => {
      toast.error(language === "fr" ? "Erreur lors du rejet" : "Error rejecting application");
    },
  });

  const updateInquiryStatusMutation = trpc.admin.updateInquiryStatus.useMutation({
    onSuccess: () => {
      toast.success(language === "fr" ? "Statut mis à jour" : "Status updated");
      inquiriesQuery.refetch();
    },
  });

  const updateUserRoleMutation = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => {
      toast.success(language === "fr" ? "Rôle mis à jour" : "Role updated");
      usersQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Bulk actions mutations
  const bulkUpdateRolesMutation = trpc.admin.bulkUpdateUserRoles.useMutation({
    onSuccess: (data) => {
      toast.success(language === "fr" ? `${data.updated} utilisateurs mis à jour` : `${data.updated} users updated`);
      usersQuery.refetch();
      setSelectedUserIds([]);
      setBulkActionDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const bulkSendNotificationMutation = trpc.admin.bulkSendNotification.useMutation({
    onSuccess: (data) => {
      toast.success(language === "fr" ? `Notification envoyée à ${data.sent} utilisateurs` : `Notification sent to ${data.sent} users`);
      setSelectedUserIds([]);
      setBulkNotificationDialogOpen(false);
      setBulkNotificationTitle("");
      setBulkNotificationMessage("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Course mutations
  const createCourseMutation = trpc.admin.createCourse.useMutation({
    onSuccess: (data) => {
      toast.success(language === "fr" ? "Cours créé avec succès" : "Course created successfully");
      coursesQuery.refetch();
      courseStatsQuery.refetch();
      setCreateCourseDialogOpen(false);
      setNewCourseTitle("");
      setNewCourseShortDesc("");
      setNewCourseCategory("sle_oral");
      setNewCourseLevel("all_levels");
      setNewCoursePrice("0");
      // Open editor for the new course
      setSelectedCourseId(data.courseId);
      setCourseEditorOpen(true);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const publishCourseMutation = trpc.admin.publishCourse.useMutation({
    onSuccess: () => {
      toast.success(language === "fr" ? "Statut mis à jour" : "Status updated");
      coursesQuery.refetch();
      courseStatsQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteCourseMutation = trpc.admin.deleteCourse.useMutation({
    onSuccess: () => {
      toast.success(language === "fr" ? "Cours supprimé" : "Course deleted");
      coursesQuery.refetch();
      courseStatsQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const duplicateCourseMutation = trpc.admin.duplicateCourse.useMutation({
    onSuccess: () => {
      toast.success(language === "fr" ? "Cours dupliqué" : "Course duplicated");
      coursesQuery.refetch();
      courseStatsQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const createModuleMutation = trpc.admin.createModule.useMutation({
    onSuccess: () => {
      toast.success(language === "fr" ? "Module créé" : "Module created");
      courseForEditQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteModuleMutation = trpc.admin.deleteModule.useMutation({
    onSuccess: () => {
      toast.success(language === "fr" ? "Module supprimé" : "Module deleted");
      courseForEditQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const createLessonMutation = trpc.admin.createLesson.useMutation({
    onSuccess: () => {
      toast.success(language === "fr" ? "Leçon créée" : "Lesson created");
      courseForEditQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteLessonMutation = trpc.admin.deleteLesson.useMutation({
    onSuccess: () => {
      toast.success(language === "fr" ? "Leçon supprimée" : "Lesson deleted");
      courseForEditQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const reorderModulesMutation = trpc.admin.reorderModules.useMutation({
    onSuccess: () => courseForEditQuery.refetch(),
    onError: (error) => toast.error(error.message),
  });

  const reorderLessonsMutation = trpc.admin.reorderLessons.useMutation({
    onSuccess: () => courseForEditQuery.refetch(),
    onError: (error) => toast.error(error.message),
  });

  const updateLessonMutation = trpc.admin.updateLesson.useMutation({
    onSuccess: () => {
      toast.success(language === "fr" ? "Leçon mise à jour" : "Lesson updated");
      courseForEditQuery.refetch();
      setLessonEditorOpen(false);
      setEditingLesson(null);
    },
    onError: (error) => toast.error(error.message),
  });

  // Lesson editor handlers
  const handleEditLesson = (lesson: any) => {
    setEditingLesson(lesson);
    setLessonTitle(lesson.title || "");
    setLessonContentType(lesson.contentType || "text");
    setLessonContent(lesson.content || "");
    setLessonIsPreview(lesson.isPreview || false);
    setLessonEditorOpen(true);
  };

  const handleSaveLesson = () => {
    if (!editingLesson) return;
    updateLessonMutation.mutate({
      lessonId: editingLesson.id,
      title: lessonTitle,
      // @ts-ignore - TS2322: auto-suppressed during TS cleanup
      contentType: lessonContentType,
      content: lessonContent,
      isPreview: lessonIsPreview,
    });
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingLesson) return;
    setUploadingMedia(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("lessonId", editingLesson.id.toString());
      const res = await fetch("/api/trpc/admin.uploadLessonMedia", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (res.ok) {
        toast.success(language === "fr" ? "Média uploadé" : "Media uploaded");
        courseForEditQuery.refetch();
      } else {
        toast.error(language === "fr" ? "Erreur d'upload" : "Upload failed");
      }
    } catch {
      toast.error(language === "fr" ? "Erreur d'upload" : "Upload failed");
    } finally {
      setUploadingMedia(false);
    }
  };

  // DnD handlers
  const handleModuleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !courseForEditQuery.data?.modules) return;
    const modules = courseForEditQuery.data.modules;
    const oldIndex = modules.findIndex((m: any) => m.id === active.id);
    const newIndex = modules.findIndex((m: any) => m.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const newOrder = arrayMove(modules, oldIndex, newIndex);
    // @ts-ignore - TS2345: auto-suppressed during TS cleanup
    reorderModulesMutation.mutate({
      moduleIds: newOrder.map((m: any) => m.id),
    });
  };

  const handleLessonDragEnd = (moduleId: number) => (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !courseForEditQuery.data?.modules) return;
    const module = courseForEditQuery.data.modules.find((m: any) => m.id === moduleId);
    if (!module?.lessons) return;
    const oldIndex = module.lessons.findIndex((l: any) => l.id === active.id);
    const newIndex = module.lessons.findIndex((l: any) => l.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const newOrder = arrayMove(module.lessons, oldIndex, newIndex);
    // @ts-ignore - TS2345: auto-suppressed during TS cleanup
    reorderLessonsMutation.mutate({
      lessonIds: newOrder.map((l: any) => l.id),
    });
  };

  // User activity history query
  const userActivityQuery = trpc.admin.getUserActivityHistory.useQuery(
    { userId: selectedUserForDetails! },
    { enabled: !!selectedUserForDetails && userDetailsPanelOpen }
  );

  // CSV export handler
  const handleExportCSV = async () => {
    try {
      // @ts-ignore - TS2339
      const result = await trpc.admin.exportUsersCSV.query({
        roleFilter: usersRoleFilter,
      });
      if (result.csv) {
        const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = result.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success(language === "fr" ? `${result.count} utilisateurs exportés` : `${result.count} users exported`);
      }
    } catch (error) {
      toast.error(language === "fr" ? "Erreur lors de l'export" : "Error exporting users");
    }
  };

  // Bulk selection handlers
  const handleSelectAll = () => {
    if (usersQuery.data?.users) {
      const allIds = usersQuery.data.users.map((u: any) => u.id);
      if (selectedUserIds.length === allIds.length) {
        setSelectedUserIds([]);
      } else {
        setSelectedUserIds(allIds);
      }
    }
  };

  const handleSelectUser = (userId: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const labels = {
    en: {
      title: "Admin Dashboard",
      subtitle: "Platform Management",
      overview: "Overview",
      coaches: "Coach Applications",
      inquiries: "Department Inquiries",
      analytics: "Analytics",
      totalUsers: "Total Users",
      activeCoaches: "Active Coaches",
      sessionsThisMonth: "Sessions This Month",
      revenue: "Revenue (MTD)",
      pendingApplications: "Pending Applications",
      newInquiries: "New Inquiries",
      recentActivity: "Recent Activity",
      viewAll: "View All",
      approve: "Approve",
      reject: "Reject",
      viewDetails: "View Details",
      search: "Search...",
      filterByStatus: "Filter by Status",
      all: "All",
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      new: "New",
      contacted: "Contacted",
      closed: "Closed",
      applicationDetails: "Application Details",
      credentials: "Credentials",
      experience: "Years of Experience",
      specialties: "Specialties",
      bio: "Bio",
      rejectionReason: "Rejection Reason (optional)",
      confirmApproval: "Are you sure you want to approve this coach?",
      confirmRejection: "Are you sure you want to reject this application?",
      inquiryDetails: "Inquiry Details",
      department: "Department",
      teamSize: "Team Size",
      message: "Message",
      markAsContacted: "Mark as Contacted",
      markAsClosed: "Mark as Closed",
      exportData: "Export Data",
      refresh: "Refresh",
      noApplications: "No pending applications",
      noInquiries: "No department inquiries",
      accessDenied: "Access Denied",
      adminOnly: "This page is only accessible to administrators.",
      goHome: "Go to Homepage",
    },
    fr: {
      title: "Tableau de bord Admin",
      subtitle: "Gestion de la plateforme",
      overview: "Aperçu",
      coaches: "Candidatures Coach",
      inquiries: "Demandes Départements",
      analytics: "Analytique",
      totalUsers: "Utilisateurs totaux",
      activeCoaches: "Coachs actifs",
      sessionsThisMonth: "Sessions ce mois",
      revenue: "Revenus (MTD)",
      pendingApplications: "Candidatures en attente",
      newInquiries: "Nouvelles demandes",
      recentActivity: "Activité récente",
      viewAll: "Voir tout",
      approve: "Approuver",
      reject: "Rejeter",
      viewDetails: "Voir détails",
      search: "Rechercher...",
      filterByStatus: "Filtrer par statut",
      all: "Tous",
      pending: "En attente",
      approved: "Approuvé",
      rejected: "Rejeté",
      new: "Nouveau",
      contacted: "Contacté",
      closed: "Fermé",
      applicationDetails: "Détails de la candidature",
      credentials: "Qualifications",
      experience: "Années d'expérience",
      specialties: "Spécialités",
      bio: "Biographie",
      rejectionReason: "Raison du rejet (optionnel)",
      confirmApproval: "Êtes-vous sûr de vouloir approuver ce coach?",
      confirmRejection: "Êtes-vous sûr de vouloir rejeter cette candidature?",
      inquiryDetails: "Détails de la demande",
      department: "Département",
      teamSize: "Taille de l'équipe",
      message: "Message",
      markAsContacted: "Marquer comme contacté",
      markAsClosed: "Marquer comme fermé",
      exportData: "Exporter les données",
      refresh: "Actualiser",
      noApplications: "Aucune candidature en attente",
      noInquiries: "Aucune demande de département",
      accessDenied: "Accès refusé",
      adminOnly: "Cette page est réservée aux administrateurs.",
      goHome: "Aller à l'accueil",
    },
  };

  const l = labels[language];

  // Mock data for demo (will be replaced with real data from tRPC)
  const mockApplications: CoachApplication[] = [
    {
      id: 1,
      userId: 101,
      name: "Marie Tremblay",
      email: "marie.tremblay@example.com",
      bio: "Experienced French language instructor with 10 years of teaching experience in government settings.",
      specialties: ["Oral C", "Written B", "Exam Preparation"],
      credentials: "MA in French Linguistics, TESL Certified",
      yearsExperience: 10,
      appliedAt: new Date("2026-01-05"),
      status: "pending",
    },
    {
      id: 2,
      userId: 102,
      name: "Jean-Pierre Dubois",
      email: "jp.dubois@example.com",
      bio: "Former SLE examiner with deep knowledge of the evaluation criteria and common pitfalls.",
      specialties: ["Oral B", "Oral C", "Anxiety Coaching"],
      credentials: "PhD in Applied Linguistics, Former PSC Examiner",
      yearsExperience: 15,
      appliedAt: new Date("2026-01-06"),
      status: "pending",
    },
  ];

  const mockInquiries: DepartmentInquiry[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@tbs-sct.gc.ca",
      department: "Treasury Board Secretariat",
      teamSize: "11-25 employees",
      message: "We have a team of analysts who need to achieve BBB by end of fiscal year. Looking for bulk training options.",
      createdAt: new Date("2026-01-07"),
      status: "new",
    },
    {
      id: 2,
      name: "Michel Gagnon",
      email: "michel.gagnon@ircc.gc.ca",
      department: "Immigration, Refugees and Citizenship Canada",
      teamSize: "26-50 employees",
      message: "Interested in your enterprise solution for our regional office. Need flexible scheduling for shift workers.",
      createdAt: new Date("2026-01-06"),
      status: "contacted",
    },
  ];

  const mockAnalytics = {
    totalUsers: 1247,
    activeCoaches: 12,
    sessionsThisMonth: 342,
    revenue: 28450,
    userGrowth: 12.5,
    sessionGrowth: 8.3,
    revenueGrowth: 15.2,
  };

  // Use real data from queries, fallback to empty arrays/defaults
  const applications = (pendingCoachesQuery.data || []) as unknown as CoachApplication[];
  const inquiries = (inquiriesQuery.data || []) as unknown as DepartmentInquiry[];
  const analytics = analyticsQuery.data || {
    totalUsers: 0,
    activeCoaches: 0,
    pendingCoaches: 0,
    totalLearners: 0,
    sessionsThisMonth: 0,
    revenue: 0,
    platformCommission: 0,
    userGrowth: 0,
    sessionGrowth: 0,
    revenueGrowth: 0,
    monthlyRevenue: [] as { month: string; revenue: number; commission: number }[],
    coachesWithStripe: 0,
    coachesWithoutStripe: 0,
  };

  // Check if user is admin - uses database role field
  const isAdmin = user?.role === "admin" || user?.openId === import.meta.env.VITE_OWNER_OPEN_ID;

  // Show access denied if not admin
  if (!authLoading && (!isAuthenticated || !isAdmin)) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <Shield className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle>{l.accessDenied}</CardTitle>
              <CardDescription>{l.adminOnly}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/">
                <Button className="w-full" size="lg">
                  {l.goHome}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const handleApproveCoach = (application: CoachApplication) => {
    approveCoachMutation.mutate({ coachId: application.id });
  };

  const handleRejectCoach = (application: CoachApplication) => {
    rejectCoachMutation.mutate({ 
      coachId: application.id, 
      reason: rejectionReason || undefined 
    });
  };

  const handleUpdateInquiryStatus = (inquiry: DepartmentInquiry, status: "contacted" | "closed") => {
    updateInquiryStatusMutation.mutate({ inquiryId: inquiry.id, status });
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredInquiries = inquiries.filter((inq) => {
    const matchesSearch = inq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         inq.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || inq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Header />

      <main className="flex-1">
        <div className="px-4 sm:px-6 lg:px-8 xl:px-12 py-8 max-w-[1600px] mx-auto">
          {/* Header with Role Switcher */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{l.title}</h1>
                <p className="text-muted-foreground text-sm">{l.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <RoleSwitcherCompact />
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                {l.exportData}
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => {
                pendingCoachesQuery.refetch();
                inquiriesQuery.refetch();
                analyticsQuery.refetch();
              }}>
                <RefreshCw className="h-4 w-4" />
                {l.refresh}
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6 border-b">
            {[
              { id: "overview", label: l.overview, icon: BarChart3 },
              { id: "coaches", label: l.coaches, icon: UserCheck },
              { id: "inquiries", label: l.inquiries, icon: Building2 },
              { id: "analytics", label: l.analytics, icon: Activity },
              { id: "coupons", label: language === "en" ? "Coupons" : "Coupons", icon: Ticket },
              { id: "crm", label: "CRM", icon: Target },
              { id: "email", label: language === "en" ? "Email Settings" : "Paramètres Email", icon: Mail },
              { id: "users", label: language === "en" ? "Users" : "Utilisateurs", icon: Users },
              { id: "courses", label: language === "en" ? "Courses" : "Cours", icon: BookOpen },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                aria-pressed={activeTab === tab.id}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="h-4 w-4" aria-hidden="true" />
                {tab.label}
                {tab.id === "coaches" && applications.filter((a: CoachApplication) => a.status === "pending").length > 0 && (
                  <Badge variant="destructive" className="ml-1">
                    {applications.filter((a: CoachApplication) => a.status === "pending").length}
                  </Badge>
                )}
                {tab.id === "inquiries" && inquiries.filter((i: DepartmentInquiry) => i.status === "new").length > 0 && (
                  <Badge variant="destructive" className="ml-1">
                    {inquiries.filter((i: DepartmentInquiry) => i.status === "new").length}
                  </Badge>
                )}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Grid - Row 1: Users & Coaches */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title={l.totalUsers}
                  value={analytics.totalUsers.toLocaleString()}
                  icon={Users}
                  iconColor="text-blue-600"
                  iconBgColor="bg-blue-100"
                  trend={analytics.userGrowth}
                  trendLabel={language === "fr" ? "ce mois" : "this month"}
                />
                <StatCard
                  title={l.activeCoaches}
                  value={analytics.activeCoaches}
                  icon={UserCheck}
                  iconColor="text-emerald-600"
                  iconBgColor="bg-emerald-100"
                  subtitle={`${analytics.pendingCoaches || 0} ${language === "fr" ? "en attente" : "pending"}`}
                />
                <StatCard
                  title={language === "fr" ? "Apprenants" : "Learners"}
                  value={analytics.totalLearners || 0}
                  icon={GraduationCap}
                  iconColor="text-purple-600"
                  iconBgColor="bg-purple-100"
                />
                <StatCard
                  title={l.sessionsThisMonth}
                  value={analytics.sessionsThisMonth}
                  icon={Calendar}
                  iconColor="text-[#0F3D3E]"
                  iconBgColor="bg-[#E7F2F2]"
                  trend={analytics.sessionGrowth}
                  trendLabel={language === "fr" ? "vs mois dernier" : "vs last month"}
                />
              </div>

              {/* Stats Grid - Row 2: Revenue & Commission */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title={l.revenue}
                  value={`$${(analytics.revenue / 100).toLocaleString()}`}
                  icon={DollarSign}
                  iconColor="text-amber-600"
                  iconBgColor="bg-amber-100"
                  trend={analytics.revenueGrowth}
                  trendLabel={language === "fr" ? "vs mois dernier" : "vs last month"}
                />
                <StatCard
                  title={language === "fr" ? "Commission Plateforme (30%)" : "Platform Commission (30%)"}
                  value={`$${((analytics.platformCommission || 0) / 100).toLocaleString()}`}
                  icon={Percent}
                  iconColor="text-emerald-600"
                  iconBgColor="bg-emerald-100"
                  subtitle={language === "fr" ? "Ce mois" : "This month"}
                />
                <StatCard
                  title={language === "fr" ? "Stripe Connecté" : "Stripe Connected"}
                  value={analytics.coachesWithStripe || 0}
                  icon={CreditCard}
                  iconColor="text-indigo-600"
                  iconBgColor="bg-indigo-100"
                  subtitle={`${analytics.coachesWithoutStripe || 0} ${language === "fr" ? "non connectés" : "not connected"}`}
                />
                <StatCard
                  title={language === "fr" ? "Candidatures en attente" : "Pending Applications"}
                  value={analytics.pendingCoaches || 0}
                  icon={Clock}
                  iconColor="text-amber-600"
                  iconBgColor="bg-amber-100"
                />
              </div>

              {/* Revenue Chart */}
              {analytics.monthlyRevenue && analytics.monthlyRevenue.length > 0 && (
                <ChartCard
                  title={language === "fr" ? "Évolution des Revenus" : "Revenue Evolution"}
                  description={language === "fr" ? "Revenus et commissions des 6 derniers mois" : "Revenue and commissions over the last 6 months"}
                  data={analytics.monthlyRevenue}
                  showCommission={true}
                />
              )}

              {/* Quick Actions */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Pending Applications */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">{l.pendingApplications}</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("coaches")}>
                      {l.viewAll}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {applications.filter((a: CoachApplication) => a.status === "pending").length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">{l.noApplications}</p>
                    ) : (
                      <div className="space-y-3">
                        {applications.filter((a: CoachApplication) => a.status === "pending").slice(0, 3).map((app: CoachApplication) => (
                          <div key={app.id} className="flex items-center justify-between p-3 rounded-lg border">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={app.photoUrl ?? undefined} />
                                <AvatarFallback>{app.name.split(" ").map((n: string) => n[0]).join("")}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{app.name}</p>
                                <p className="text-sm text-muted-foreground">{app.specialties.slice(0, 2).join(", ")}</p>
                              </div>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => setSelectedApplication(app)}>
                              {l.viewDetails}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* New Inquiries */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">{l.newInquiries}</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("inquiries")}>
                      {l.viewAll}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {inquiries.filter((i: DepartmentInquiry) => i.status === "new").length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">{l.noInquiries}</p>
                    ) : (
                      <div className="space-y-3">
                        {inquiries.filter((i: DepartmentInquiry) => i.status === "new").slice(0, 3).map((inq: DepartmentInquiry) => (
                          <div key={inq.id} className="flex items-center justify-between p-3 rounded-lg border">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{inq.department}</p>
                                <p className="text-sm text-muted-foreground">{inq.teamSize}</p>
                              </div>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => setSelectedInquiry(inq)}>
                              {l.viewDetails}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Admin Tools Quick Links */}
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/admin/reminders">
                  <Card className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50 h-full">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                          <Clock className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{language === "fr" ? "Rappels de Sessions" : "Session Reminders"}</h3>
                          <p className="text-sm text-muted-foreground">{language === "fr" ? "Gérer les rappels automatiques" : "Manage automatic reminders"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                <Link href="/hr">
                  <Card className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50 h-full">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{language === "fr" ? "Dashboard RH" : "HR Dashboard"}</h3>
                          <p className="text-sm text-muted-foreground">{language === "fr" ? "Suivi des apprenants" : "Learner tracking"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                <Link href="/app/badges">
                  <Card className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50 h-full">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                          <Target className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{language === "fr" ? "Catalogue Badges" : "Badge Catalog"}</h3>
                          <p className="text-sm text-muted-foreground">{language === "fr" ? "Voir tous les badges" : "View all badges"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>

              {/* CRM Dashboard Widget */}
              <CRMDashboardWidget onNavigateToCRM={() => setActiveTab("crm")} />
            </div>
          )}

          {/* Coaches Tab */}
          {activeTab === "coaches" && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={l.search}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder={l.filterByStatus} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{l.all}</SelectItem>
                    <SelectItem value="pending">{l.pending}</SelectItem>
                    <SelectItem value="approved">{l.approved}</SelectItem>
                    <SelectItem value="rejected">{l.rejected}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Applications Table */}
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Specialties</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((app: CoachApplication) => (
                      <TableRow key={app.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={app.photoUrl ?? undefined} />
                              <AvatarFallback>{app.name.split(" ").map((n: string) => n[0]).join("")}</AvatarFallback>
                            </Avatar>
                            {app.name}
                          </div>
                        </TableCell>
                        <TableCell>{app.email}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {app.specialties.slice(0, 2).map((s: string) => (
                              <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                            ))}
                            {app.specialties.length > 2 && (
                              <Badge variant="outline" className="text-xs">+{app.specialties.length - 2}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{app.yearsExperience} years</TableCell>
                        <TableCell>{new Date(app.appliedAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={
                            app.status === "approved" ? "default" :
                            app.status === "rejected" ? "destructive" : "secondary"
                          }>
                            {app.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => setSelectedApplication(app)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            {app.status === "pending" && (
                              <>
                                <Button size="sm" variant="ghost" className="text-emerald-600" onClick={() => handleApproveCoach(app)}>
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => {
                                  setSelectedApplication(app);
                                }}>
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}

          {/* Inquiries Tab */}
          {activeTab === "inquiries" && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={l.search}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder={l.filterByStatus} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{l.all}</SelectItem>
                    <SelectItem value="new">{l.new}</SelectItem>
                    <SelectItem value="contacted">{l.contacted}</SelectItem>
                    <SelectItem value="closed">{l.closed}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Inquiries Table */}
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contact</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Team Size</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInquiries.map((inq: DepartmentInquiry) => (
                      <TableRow key={inq.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{inq.name}</p>
                            <p className="text-sm text-muted-foreground">{inq.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{inq.department}</TableCell>
                        <TableCell>{inq.teamSize}</TableCell>
                        <TableCell>{new Date(inq.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={
                            inq.status === "new" ? "destructive" :
                            inq.status === "contacted" ? "default" : "secondary"
                          }>
                            {inq.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => setSelectedInquiry(inq)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => window.open(`mailto:${inq.email}`)}>
                              <Mail className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <AdminAnalytics />
          )}
          
          {/* Coupons Tab */}
          {activeTab === "coupons" && (
            <AdminCoupons />
          )}

          {/* CRM Tab */}
          {activeTab === "crm" && (
            <div className="space-y-6">
              {/* CRM Sub-navigation */}
              <div className="flex gap-2 mb-4 flex-wrap">
                <Button
                  variant={crmSubTab === "dashboard" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCrmSubTab("dashboard")}
                >
                  {language === "fr" ? "Tableau de bord" : "Dashboard"}
                </Button>
                <Button
                  variant={crmSubTab === "trends" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCrmSubTab("trends")}
                >
                  {language === "fr" ? "Tendances" : "Trends"}
                </Button>
                <Button
                  variant={crmSubTab === "goals" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCrmSubTab("goals")}
                >
                  {language === "fr" ? "Objectifs" : "Goals"}
                </Button>
                <Button
                  variant={crmSubTab === "analytics" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCrmSubTab("analytics")}
                >
                  {language === "fr" ? "Analytique des séquences" : "Sequence Analytics"}
                </Button>
                <Button
                  variant={crmSubTab === "outcomes" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCrmSubTab("outcomes")}
                >
                  {language === "fr" ? "Résultats des réunions" : "Meeting Outcomes"}
                </Button>
                <Button
                  variant={crmSubTab === "scoring" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCrmSubTab("scoring")}
                >
                  {language === "fr" ? "Notation des leads" : "Lead Scoring"}
                </Button>
                <Button
                  variant={crmSubTab === "pipeline" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCrmSubTab("pipeline")}
                >
                  {language === "fr" ? "Pipeline" : "Pipeline"}
                </Button>
                <Button
                  variant={crmSubTab === "templates" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCrmSubTab("templates")}
                >
                  {language === "fr" ? "Modèles" : "Templates"}
                </Button>
                <Button
                  variant={crmSubTab === "reports" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCrmSubTab("reports")}
                >
                  {language === "fr" ? "Rapports" : "Reports"}
                </Button>
                <Button
                  variant={crmSubTab === "tags" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCrmSubTab("tags")}
                >
                  {language === "fr" ? "Tags" : "Tags"}
                </Button>
                <Button
                  variant={crmSubTab === "webhooks" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCrmSubTab("webhooks")}
                >
                  {language === "fr" ? "Webhooks" : "Webhooks"}
                </Button>
                <Button
                  variant={crmSubTab === "automation" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCrmSubTab("automation")}
                >
                  {language === "fr" ? "Automatisation" : "Automation"}
                </Button>
                <Button
                  variant={crmSubTab === "export" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCrmSubTab("export")}
                >
                  {language === "fr" ? "Exporter" : "Export"}
                </Button>
                <Button
                  variant={crmSubTab === "import" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCrmSubTab("import")}
                >
                  {language === "fr" ? "Importer" : "Import"}
                </Button>
                <Button
                  variant={crmSubTab === "segments" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCrmSubTab("segments")}
                >
                  {language === "fr" ? "Segments" : "Segments"}
                </Button>
                <Button
                  variant={crmSubTab === "alerts" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCrmSubTab("alerts")}
                >
                  {language === "fr" ? "Alertes" : "Alerts"}
                </Button>
                <Button
                  variant={crmSubTab === "compare" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCrmSubTab("compare")}
                >
                  {language === "fr" ? "Comparer" : "Compare"}
                </Button>
                <Button
                  variant={crmSubTab === "merge" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCrmSubTab("merge")}
                >
                  {language === "fr" ? "Fusionner" : "Merge"}
                </Button>
                <PipelineNotificationsBell />
              </div>

              {crmSubTab === "dashboard" && <GlobalCRMDashboard />}
              {crmSubTab === "trends" && <KPITrendCharts />}
              {crmSubTab === "goals" && <SalesGoalsManager />}
              {crmSubTab === "analytics" && <SequenceAnalyticsDashboard />}
              {crmSubTab === "outcomes" && <MeetingOutcomesDashboard />}
              {crmSubTab === "scoring" && <LeadScoringDashboard />}
              {crmSubTab === "pipeline" && <DealPipelineKanban />}
              {crmSubTab === "templates" && <EmailTemplatesLibrary />}
              {crmSubTab === "reports" && <CRMActivityReportDashboard />}
              {crmSubTab === "tags" && <LeadTagsManager />}
              {crmSubTab === "webhooks" && <CRMWebhooksManager />}
              {crmSubTab === "automation" && <TagAutomationManager />}
              {crmSubTab === "export" && <CRMDataExport />}
              {crmSubTab === "import" && <CRMLeadImport />}
              {crmSubTab === "segments" && <LeadSegmentsManager />}
              {crmSubTab === "alerts" && <SegmentAlertsManager />}
              {crmSubTab === "compare" && <SegmentComparisonDashboard />}
              {crmSubTab === "merge" && <LeadMergeManager />}
            </div>
          )}

          {/* Email Settings Tab */}
          {activeTab === "email" && (
            <EmailSettingsPanel />
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="space-y-6">
              {/* Search and Filter */}
              <div className="flex gap-4 items-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={language === "fr" ? "Rechercher par nom ou email..." : "Search by name or email..."}
                    value={usersSearchQuery}
                    onChange={(e) => {
                      setUsersSearchQuery(e.target.value);
                      setUsersPage(1);
                    }}
                    className="pl-10"
                  />
                </div>
                <Select value={usersRoleFilter} onValueChange={(v) => {
                  setUsersRoleFilter(v as typeof usersRoleFilter);
                  setUsersPage(1);
                }}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder={language === "fr" ? "Filtrer par rôle" : "Filter by role"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{language === "fr" ? "Tous les rôles" : "All Roles"}</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="coach">Coach</SelectItem>
                    <SelectItem value="learner">{language === "fr" ? "Apprenant" : "Learner"}</SelectItem>
                    <SelectItem value="hr_admin">HR Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={() => usersQuery.refetch()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {language === "fr" ? "Actualiser" : "Refresh"}
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportCSV}>
                  <FileDown className="h-4 w-4 mr-2" />
                  {language === "fr" ? "Exporter CSV" : "Export CSV"}
                </Button>
              </div>

              {/* Bulk Actions Bar */}
              {selectedUserIds.length > 0 && (
                <div className="flex items-center gap-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <span className="text-sm font-medium">
                    {selectedUserIds.length} {language === "fr" ? "utilisateur(s) sélectionné(s)" : "user(s) selected"}
                  </span>
                  <div className="flex gap-2 ml-auto">
                    <Button size="sm" variant="outline" onClick={() => setBulkActionDialogOpen(true)}>
                      <Shield className="h-4 w-4 mr-2" />
                      {language === "fr" ? "Changer le rôle" : "Change Role"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setBulkNotificationDialogOpen(true)}>
                      <Bell className="h-4 w-4 mr-2" />
                      {language === "fr" ? "Envoyer notification" : "Send Notification"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setSelectedUserIds([])}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Users Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{usersQuery.data?.total || 0}</p>
                        <p className="text-sm text-muted-foreground">{language === "fr" ? "Total Utilisateurs" : "Total Users"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <Shield className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {usersQuery.data?.users?.filter((u: any) => u.role === "admin").length || 0}
                        </p>
                        <p className="text-sm text-muted-foreground">Admins</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <UserCheck className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {usersQuery.data?.users?.filter((u: any) => u.role === "coach").length || 0}
                        </p>
                        <p className="text-sm text-muted-foreground">Coaches</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <GraduationCap className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {usersQuery.data?.users?.filter((u: any) => u.role === "learner").length || 0}
                        </p>
                        <p className="text-sm text-muted-foreground">{language === "fr" ? "Apprenants" : "Learners"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Users Table */}
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={usersQuery.data?.users?.length > 0 && selectedUserIds.length === usersQuery.data?.users?.length}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>{language === "fr" ? "Utilisateur" : "User"}</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>{language === "fr" ? "Rôle" : "Role"}</TableHead>
                      <TableHead>{language === "fr" ? "Méthode de connexion" : "Login Method"}</TableHead>
                      <TableHead>{language === "fr" ? "Dernière connexion" : "Last Login"}</TableHead>
                      <TableHead>{language === "fr" ? "Inscrit le" : "Registered"}</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersQuery.isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ) : usersQuery.data?.users?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          {language === "fr" ? "Aucun utilisateur trouvé" : "No users found"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      usersQuery.data?.users?.map((u: any) => (
                        <TableRow key={u.id} className={selectedUserIds.includes(u.id) ? "bg-primary/5" : ""}>
                          <TableCell>
                            <Checkbox
                              checked={selectedUserIds.includes(u.id)}
                              onCheckedChange={() => handleSelectUser(u.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={u.avatarUrl || undefined} />
                                <AvatarFallback className="text-xs">
                                  {u.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase() || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{u.name || "Unknown"}</p>
                                <p className="text-xs text-muted-foreground">ID: {u.id}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{u.email}</span>
                              {u.emailVerified && (
                                <CheckCircle className="h-4 w-4 text-green-500" aria-label="Email verified" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              u.role === "admin" ? "destructive" :
                              u.role === "coach" ? "default" :
                              u.role === "hr_admin" ? "secondary" : "outline"
                            }>
                              {u.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm capitalize">{u.loginMethod || "oauth"}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {u.lastSignedIn ? new Date(u.lastSignedIn).toLocaleDateString() : "-"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Select
                                value={u.role}
                                onValueChange={(newRole) => {
                                  if (newRole !== u.role) {
                                    updateUserRoleMutation.mutate({
                                      userId: u.id,
                                      role: newRole as "admin" | "coach" | "learner" | "hr_admin",
                                    });
                                  }
                                }}
                              >
                                <SelectTrigger className="w-28 h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="coach">Coach</SelectItem>
                                  <SelectItem value="learner">{language === "fr" ? "Apprenant" : "Learner"}</SelectItem>
                                  <SelectItem value="hr_admin">HR Admin</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedUserForDetails(u.id);
                                  setUserDetailsPanelOpen(true);
                                }}
                              >
                                <History className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>

              {/* Pagination */}
              {usersQuery.data && usersQuery.data.totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {language === "fr" 
                      ? `Page ${usersQuery.data.page} sur ${usersQuery.data.totalPages} (${usersQuery.data.total} utilisateurs)`
                      : `Page ${usersQuery.data.page} of ${usersQuery.data.totalPages} (${usersQuery.data.total} users)`
                    }
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={usersPage === 1}
                      onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                    >
                      {language === "fr" ? "Précédent" : "Previous"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={usersPage >= usersQuery.data.totalPages}
                      onClick={() => setUsersPage(p => p + 1)}
                    >
                      {language === "fr" ? "Suivant" : "Next"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Courses Tab */}
          {activeTab === "courses" && (
            <div className="space-y-6">
              {/* Course Stats */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{courseStatsQuery.data?.totalCourses || 0}</p>
                        <p className="text-sm text-muted-foreground">{language === "fr" ? "Total Cours" : "Total Courses"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{courseStatsQuery.data?.publishedCourses || 0}</p>
                        <p className="text-sm text-muted-foreground">{language === "fr" ? "Publiés" : "Published"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Clock className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{courseStatsQuery.data?.draftCourses || 0}</p>
                        <p className="text-sm text-muted-foreground">{language === "fr" ? "Brouillons" : "Drafts"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <GraduationCap className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{courseStatsQuery.data?.totalEnrollments || 0}</p>
                        <p className="text-sm text-muted-foreground">{language === "fr" ? "Inscriptions" : "Enrollments"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <DollarSign className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">${(courseStatsQuery.data?.totalRevenue || 0).toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{language === "fr" ? "Revenus" : "Revenue"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Search and Actions */}
              <div className="flex gap-4 items-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={language === "fr" ? "Rechercher un cours..." : "Search courses..."}
                    value={coursesSearchQuery}
                    onChange={(e) => {
                      setCoursesSearchQuery(e.target.value);
                      setCoursesPage(1);
                    }}
                    className="pl-10"
                  />
                </div>
                <Select value={coursesStatusFilter} onValueChange={(v) => {
                  setCoursesStatusFilter(v as typeof coursesStatusFilter);
                  setCoursesPage(1);
                }}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder={language === "fr" ? "Filtrer par statut" : "Filter by status"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{language === "fr" ? "Tous les statuts" : "All Statuses"}</SelectItem>
                    <SelectItem value="published">{language === "fr" ? "Publiés" : "Published"}</SelectItem>
                    <SelectItem value="draft">{language === "fr" ? "Brouillons" : "Drafts"}</SelectItem>
                    <SelectItem value="archived">{language === "fr" ? "Archivés" : "Archived"}</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={() => coursesQuery.refetch()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {language === "fr" ? "Actualiser" : "Refresh"}
                </Button>
                <Button onClick={() => setCreateCourseDialogOpen(true)}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  {language === "fr" ? "Nouveau cours" : "New Course"}
                </Button>
              </div>

              {/* Courses Table */}
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{language === "fr" ? "Cours" : "Course"}</TableHead>
                      <TableHead>{language === "fr" ? "Catégorie" : "Category"}</TableHead>
                      <TableHead>{language === "fr" ? "Niveau" : "Level"}</TableHead>
                      <TableHead>{language === "fr" ? "Prix" : "Price"}</TableHead>
                      <TableHead>{language === "fr" ? "Inscriptions" : "Enrollments"}</TableHead>
                      <TableHead>{language === "fr" ? "Statut" : "Status"}</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coursesQuery.isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ) : coursesQuery.data?.courses?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {language === "fr" ? "Aucun cours trouvé" : "No courses found"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      coursesQuery.data?.courses?.map((course: any) => (
                        <TableRow key={course.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {course.thumbnailUrl ? (
                                <img src={course.thumbnailUrl} alt={course.title} className="w-16 h-10 object-cover rounded" />
                              ) : (
                                <div className="w-16 h-10 bg-muted rounded flex items-center justify-center">
                                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium">{course.title}</p>
                                <p className="text-xs text-muted-foreground">{course.totalModules || 0} modules • {course.totalLessons || 0} lessons</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {course.category?.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()) || "N/A"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {course.level?.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()) || "All"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {course.price === 0 ? (
                              <span className="text-green-600 font-medium">{language === "fr" ? "Gratuit" : "Free"}</span>
                            ) : (
                              <span className="font-medium">${((course.price || 0) / 100).toFixed(2)}</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{course?.totalEnrollments || 0}</span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={course.status === "published" ? "default" : course.status === "draft" ? "secondary" : "outline"}
                              className={course.status === "published" ? "bg-green-100 text-green-800" : ""}
                            >
                              {course.status === "published" ? (language === "fr" ? "Publié" : "Published") :
                               course.status === "draft" ? (language === "fr" ? "Brouillon" : "Draft") :
                               (language === "fr" ? "Archivé" : "Archived")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedCourseId(course.id);
                                  setCourseEditorOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Select
                                value={course.status}
                                onValueChange={(newStatus) => {
                                  publishCourseMutation.mutate({ courseId: course.id, status: newStatus as any });
                                }}
                              >
                                <SelectTrigger className="w-28 h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="draft">{language === "fr" ? "Brouillon" : "Draft"}</SelectItem>
                                  <SelectItem value="published">{language === "fr" ? "Publié" : "Published"}</SelectItem>
                                  <SelectItem value="archived">{language === "fr" ? "Archivé" : "Archived"}</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (confirm(language === "fr" ? "Dupliquer ce cours ?" : "Duplicate this course?")) {
                                    duplicateCourseMutation.mutate({ courseId: course.id });
                                  }
                                }}
                              >
                                <Video className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => {
                                  if (confirm(language === "fr" ? "Supprimer ce cours ? Cette action est irréversible." : "Delete this course? This action cannot be undone.")) {
                                    deleteCourseMutation.mutate({ courseId: course.id });
                                  }
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>

              {/* Pagination */}
              {coursesQuery.data && coursesQuery.data.total > 20 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {language === "fr" 
                      ? `Page ${coursesPage} (${coursesQuery.data.total} cours)`
                      : `Page ${coursesPage} (${coursesQuery.data.total} courses)`
                    }
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={coursesPage === 1}
                      onClick={() => setCoursesPage(p => Math.max(1, p - 1))}
                    >
                      {language === "fr" ? "Précédent" : "Previous"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={coursesPage * 20 >= coursesQuery.data.total}
                      onClick={() => setCoursesPage(p => p + 1)}
                    >
                      {language === "fr" ? "Suivant" : "Next"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Create Course Dialog */}
      <Dialog open={createCourseDialogOpen} onOpenChange={setCreateCourseDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{language === "fr" ? "Créer un nouveau cours" : "Create New Course"}</DialogTitle>
            <DialogDescription>
              {language === "fr" ? "Remplissez les informations de base pour créer votre cours." : "Fill in the basic information to create your course."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{language === "fr" ? "Titre du cours" : "Course Title"} *</label>
              <Input
                value={newCourseTitle}
                onChange={(e) => setNewCourseTitle(e.target.value)}
                placeholder={language === "fr" ? "Ex: Préparation SLE - Expression orale" : "Ex: SLE Preparation - Oral Expression"}
              />
            </div>
            <div>
              <label className="text-sm font-medium">{language === "fr" ? "Description courte" : "Short Description"}</label>
              <Input
                value={newCourseShortDesc}
                onChange={(e) => setNewCourseShortDesc(e.target.value)}
                placeholder={language === "fr" ? "Une brève description du cours" : "A brief description of the course"}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">{language === "fr" ? "Catégorie" : "Category"}</label>
                <Select value={newCourseCategory} onValueChange={setNewCourseCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sle_oral">SLE Oral</SelectItem>
                    <SelectItem value="sle_written">SLE Written</SelectItem>
                    <SelectItem value="sle_reading">SLE Reading</SelectItem>
                    <SelectItem value="sle_complete">SLE Complete</SelectItem>
                    <SelectItem value="business_french">Business French</SelectItem>
                    <SelectItem value="business_english">Business English</SelectItem>
                    <SelectItem value="exam_prep">Exam Prep</SelectItem>
                    <SelectItem value="conversation">Conversation</SelectItem>
                    <SelectItem value="grammar">Grammar</SelectItem>
                    <SelectItem value="vocabulary">Vocabulary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">{language === "fr" ? "Niveau" : "Level"}</label>
                <Select value={newCourseLevel} onValueChange={setNewCourseLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">{language === "fr" ? "Débutant" : "Beginner"}</SelectItem>
                    <SelectItem value="intermediate">{language === "fr" ? "Intermédiaire" : "Intermediate"}</SelectItem>
                    <SelectItem value="advanced">{language === "fr" ? "Avancé" : "Advanced"}</SelectItem>
                    <SelectItem value="all_levels">{language === "fr" ? "Tous niveaux" : "All Levels"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">{language === "fr" ? "Prix (en cents, 0 = gratuit)" : "Price (in cents, 0 = free)"}</label>
              <Input
                type="number"
                value={newCoursePrice}
                onChange={(e) => setNewCoursePrice(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateCourseDialogOpen(false)}>
              {language === "fr" ? "Annuler" : "Cancel"}
            </Button>
            <Button
              onClick={() => {
                if (!newCourseTitle.trim()) {
                  toast.error(language === "fr" ? "Le titre est requis" : "Title is required");
                  return;
                }
                createCourseMutation.mutate({
                  title: newCourseTitle,
                  shortDescription: newCourseShortDesc || undefined,
                  category: newCourseCategory as any,
                  level: newCourseLevel as any,
                  price: parseInt(newCoursePrice) || 0,
                });
              }}
              disabled={createCourseMutation.isPending}
            >
              {createCourseMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <BookOpen className="h-4 w-4 mr-2" />
              )}
              {language === "fr" ? "Créer le cours" : "Create Course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Course Editor Sheet */}
      <Sheet open={courseEditorOpen} onOpenChange={setCourseEditorOpen}>
        <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
          <SheetHeader className="flex flex-row items-center justify-between">
            <div>
              <SheetTitle>{language === "fr" ? "Éditeur de cours" : "Course Editor"}</SheetTitle>
              <SheetDescription>
                {language === "fr" ? "Modifiez les détails, modules et leçons de votre cours." : "Edit your course details, modules, and lessons."}
              </SheetDescription>
            </div>
            {selectedCourseId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.open(`/courses/${courseForEditQuery.data?.slug || selectedCourseId}?preview=student`, '_blank');
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                {language === "fr" ? "Aperçu Étudiant" : "Student Preview"}
              </Button>
            )}
          </SheetHeader>
          {selectedCourseId && courseForEditQuery.data && (
            <div className="space-y-6 mt-6">
              {/* Course Info */}
              <Card>
                <CardHeader>
                  <CardTitle>{language === "fr" ? "Informations du cours" : "Course Information"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">{language === "fr" ? "Titre" : "Title"}</label>
                    <Input defaultValue={courseForEditQuery.data.title} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea defaultValue={courseForEditQuery.data.description || ""} rows={4} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">{language === "fr" ? "Prix" : "Price"}</label>
                      <Input type="number" defaultValue={courseForEditQuery.data.price || 0} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">{language === "fr" ? "Statut" : "Status"}</label>
                      <Select defaultValue={courseForEditQuery.data.status || "draft"}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">{language === "fr" ? "Brouillon" : "Draft"}</SelectItem>
                          <SelectItem value="published">{language === "fr" ? "Publié" : "Published"}</SelectItem>
                          <SelectItem value="archived">{language === "fr" ? "Archivé" : "Archived"}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Modules with DnD */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{language === "fr" ? "Modules" : "Modules"}</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => {
                      const title = prompt(language === "fr" ? "Titre du module:" : "Module title:");
                      if (title) {
                        createModuleMutation.mutate({ courseId: selectedCourseId, title });
                      }
                    }}
                  >
                    {language === "fr" ? "Ajouter un module" : "Add Module"}
                  </Button>
                </CardHeader>
                <CardContent>
                  {courseForEditQuery.data.modules?.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      {language === "fr" ? "Aucun module. Ajoutez-en un pour commencer." : "No modules yet. Add one to get started."}
                    </p>
                  ) : (
                    <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={handleModuleDragEnd}>
                      <SortableContext items={courseForEditQuery.data.modules?.map((m: any) => m.id) || []} strategy={verticalListSortingStrategy}>
                        <div className="space-y-4">
                          {courseForEditQuery.data.modules?.map((module: any, idx: number) => (
                            <SortableModuleItem
                              key={module.id}
                              module={module}
                              idx={idx}
                              language={language}
                              selectedCourseId={selectedCourseId}
                              createLessonMutation={createLessonMutation}
                              deleteModuleMutation={deleteModuleMutation}
                              deleteLessonMutation={deleteLessonMutation}
                              dndSensors={dndSensors}
                              handleLessonDragEnd={handleLessonDragEnd}
                              onEditLesson={handleEditLesson}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Lesson Editor Dialog */}
      <Dialog open={lessonEditorOpen} onOpenChange={setLessonEditorOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{language === "fr" ? "Éditeur de leçon" : "Lesson Editor"}</DialogTitle>
            <DialogDescription>
              {language === "fr" ? "Modifiez le contenu et les paramètres de la leçon." : "Edit lesson content and settings."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{language === "fr" ? "Titre" : "Title"}</Label>
              <Input value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} />
            </div>
            <div>
              <Label>{language === "fr" ? "Type de contenu" : "Content Type"}</Label>
              <Select value={lessonContentType} onValueChange={setLessonContentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{language === "fr" ? "Contenu" : "Content"}</Label>
              <Textarea
                value={lessonContent}
                onChange={(e) => setLessonContent(e.target.value)}
                rows={6}
                placeholder={language === "fr" ? "Contenu de la leçon ou URL du média..." : "Lesson content or media URL..."}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={lessonIsPreview}
                onCheckedChange={(checked) => setLessonIsPreview(checked === true)}
              />
              <Label>{language === "fr" ? "Disponible en aperçu gratuit" : "Available as free preview"}</Label>
            </div>
            <div>
              <Label>{language === "fr" ? "Upload de média" : "Media Upload"}</Label>
              <div className="mt-1">
                <label className="flex items-center gap-2 p-3 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                  {uploadingMedia ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {uploadingMedia
                      ? (language === "fr" ? "Upload en cours..." : "Uploading...")
                      : (language === "fr" ? "Cliquez pour uploader un fichier" : "Click to upload a file")}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="video/*,audio/*,.pdf"
                    onChange={handleMediaUpload}
                    disabled={uploadingMedia}
                  />
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLessonEditorOpen(false)}>
              {language === "fr" ? "Annuler" : "Cancel"}
            </Button>
            <Button onClick={handleSaveLesson} disabled={updateLessonMutation.isPending}>
              {updateLessonMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              {language === "fr" ? "Sauvegarder" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Application Details Dialog */}
      <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{l.applicationDetails}</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedApplication.photoUrl ?? undefined} />
                  <AvatarFallback className="text-lg">
                    {selectedApplication.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedApplication.name}</h3>
                  <p className="text-muted-foreground">{selectedApplication.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{l.credentials}</p>
                  <p className="font-medium">{selectedApplication.credentials}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{l.experience}</p>
                  <p className="font-medium">{selectedApplication.yearsExperience} years</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">{l.specialties}</p>
                <div className="flex flex-wrap gap-2">
                  {selectedApplication.specialties.map((s) => (
                    <Badge key={s} variant="secondary">{s}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">{l.bio}</p>
                <p className="text-sm">{selectedApplication.bio}</p>
              </div>

              {selectedApplication.status === "pending" && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{l.rejectionReason}</p>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Optional reason for rejection..."
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {selectedApplication?.status === "pending" && (
              <>
                <Button variant="outline" onClick={() => handleRejectCoach(selectedApplication)}>
                  <XCircle className="h-4 w-4 mr-2" />
                  {l.reject}
                </Button>
                <Button onClick={() => handleApproveCoach(selectedApplication)}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {l.approve}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Inquiry Details Dialog */}
      <Dialog open={!!selectedInquiry} onOpenChange={() => setSelectedInquiry(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{l.inquiryDetails}</DialogTitle>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Contact Name</p>
                  <p className="font-medium">{selectedInquiry.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedInquiry.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{l.department}</p>
                  <p className="font-medium">{selectedInquiry.department}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{l.teamSize}</p>
                  <p className="font-medium">{selectedInquiry.teamSize}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">{l.message}</p>
                <p className="text-sm bg-muted p-3 rounded-lg">{selectedInquiry.message}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedInquiry?.status === "new" && (
              <Button onClick={() => {
                handleUpdateInquiryStatus(selectedInquiry, "contacted");
                setSelectedInquiry(null);
              }}>
                {l.markAsContacted}
              </Button>
            )}
            {selectedInquiry?.status === "contacted" && (
              <Button variant="outline" onClick={() => {
                handleUpdateInquiryStatus(selectedInquiry, "closed");
                setSelectedInquiry(null);
              }}>
                {l.markAsClosed}
              </Button>
            )}
            <Button variant="outline" onClick={() => window.open(`mailto:${selectedInquiry?.email}`)}>
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Role Change Dialog */}
      <Dialog open={bulkActionDialogOpen} onOpenChange={setBulkActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === "fr" ? "Changer le rôle" : "Change Role"}</DialogTitle>
            <DialogDescription>
              {language === "fr" 
                ? `Changer le rôle de ${selectedUserIds.length} utilisateur(s)`
                : `Change role for ${selectedUserIds.length} user(s)`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={bulkNewRole} onValueChange={(v) => setBulkNewRole(v as typeof bulkNewRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="coach">Coach</SelectItem>
                <SelectItem value="learner">{language === "fr" ? "Apprenant" : "Learner"}</SelectItem>
                <SelectItem value="hr_admin">HR Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkActionDialogOpen(false)}>
              {language === "fr" ? "Annuler" : "Cancel"}
            </Button>
            <Button 
              onClick={() => bulkUpdateRolesMutation.mutate({ userIds: selectedUserIds, role: bulkNewRole })}
              disabled={bulkUpdateRolesMutation.isPending}
            >
              {bulkUpdateRolesMutation.isPending 
                ? (language === "fr" ? "Mise à jour..." : "Updating...") 
                : (language === "fr" ? "Confirmer" : "Confirm")
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Notification Dialog */}
      <Dialog open={bulkNotificationDialogOpen} onOpenChange={setBulkNotificationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === "fr" ? "Envoyer une notification" : "Send Notification"}</DialogTitle>
            <DialogDescription>
              {language === "fr" 
                ? `Envoyer une notification à ${selectedUserIds.length} utilisateur(s)`
                : `Send notification to ${selectedUserIds.length} user(s)`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">{language === "fr" ? "Titre" : "Title"}</label>
              <Input 
                value={bulkNotificationTitle} 
                onChange={(e) => setBulkNotificationTitle(e.target.value)}
                placeholder={language === "fr" ? "Titre de la notification" : "Notification title"}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Message</label>
              <Textarea 
                value={bulkNotificationMessage} 
                onChange={(e) => setBulkNotificationMessage(e.target.value)}
                placeholder={language === "fr" ? "Contenu du message" : "Message content"}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkNotificationDialogOpen(false)}>
              {language === "fr" ? "Annuler" : "Cancel"}
            </Button>
            <Button 
              onClick={() => bulkSendNotificationMutation.mutate({ 
                userIds: selectedUserIds, 
                title: bulkNotificationTitle,
                message: bulkNotificationMessage,
                type: "system"
              })}
              disabled={bulkSendNotificationMutation.isPending || !bulkNotificationTitle || !bulkNotificationMessage}
            >
              {bulkSendNotificationMutation.isPending 
                ? (language === "fr" ? "Envoi..." : "Sending...") 
                : (language === "fr" ? "Envoyer" : "Send")
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Details Sheet */}
      <Sheet open={userDetailsPanelOpen} onOpenChange={setUserDetailsPanelOpen}>
        <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{language === "fr" ? "Détails de l'utilisateur" : "User Details"}</SheetTitle>
            <SheetDescription>
              {language === "fr" ? "Historique d'activité et informations" : "Activity history and information"}
            </SheetDescription>
          </SheetHeader>
          
          {userActivityQuery.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : userActivityQuery.data?.user ? (
            <div className="mt-6 space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={userActivityQuery.data.user.avatarUrl || undefined} />
                  <AvatarFallback className="text-lg">
                    {userActivityQuery.data.user.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{userActivityQuery.data.user.name || "Unknown"}</h3>
                  <p className="text-sm text-muted-foreground">{userActivityQuery.data.user.email}</p>
                  <Badge variant={userActivityQuery.data.user.role === "admin" ? "destructive" : "secondary"} className="mt-1">
                    {userActivityQuery.data.user.role}
                  </Badge>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <Card>
                  <CardContent className="p-3 text-center">
                    {/* @ts-ignore - TS2339: auto-suppressed during TS cleanup */}
                    <p className="text-2xl font-bold">{userActivityQuery.data.stats?.totalEnrollments}</p>
                    <p className="text-xs text-muted-foreground">{language === "fr" ? "Inscriptions" : "Enrollments"}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    {/* @ts-ignore - TS2339: auto-suppressed during TS cleanup */}
                    <p className="text-2xl font-bold">{userActivityQuery.data.stats?.totalSessions}</p>
                    <p className="text-xs text-muted-foreground">Sessions</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    {/* @ts-ignore - TS2339: auto-suppressed during TS cleanup */}
                    <p className="text-2xl font-bold">{userActivityQuery.data.stats?.accountAge}</p>
                    <p className="text-xs text-muted-foreground">{language === "fr" ? "Jours" : "Days"}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Account Info */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{language === "fr" ? "Méthode de connexion" : "Login Method"}</span>
                  <span className="capitalize">{userActivityQuery.data.user.loginMethod || "oauth"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{language === "fr" ? "Email vérifié" : "Email Verified"}</span>
                  <span>{userActivityQuery.data.user.emailVerified ? "✓" : "✗"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{language === "fr" ? "Inscrit le" : "Registered"}</span>
                  <span>{userActivityQuery.data.user.createdAt ? new Date(userActivityQuery.data.user.createdAt).toLocaleDateString() : "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{language === "fr" ? "Dernière connexion" : "Last Login"}</span>
                  <span>{userActivityQuery.data.user.lastSignedIn ? new Date(userActivityQuery.data.user.lastSignedIn).toLocaleDateString() : "-"}</span>
                </div>
              </div>

              {/* Activity Timeline */}
              <div>
                <h4 className="font-semibold mb-3">{language === "fr" ? "Historique d'activité" : "Activity History"}</h4>
                {userActivityQuery.data.activities.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {language === "fr" ? "Aucune activité récente" : "No recent activity"}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {userActivityQuery.data.activities.map((activity: any, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className={`p-2 rounded-full ${
                          activity.type === "enrollment" ? "bg-blue-100 text-blue-600" :
                          activity.type === "session" ? "bg-green-100 text-green-600" :
                          activity.type === "payment" ? "bg-yellow-100 text-yellow-600" :
                          "bg-gray-100 text-gray-600"
                        }`}>
                          {activity.type === "enrollment" && <BookOpen className="h-4 w-4" />}
                          {activity.type === "session" && <Video className="h-4 w-4" />}
                          {activity.type === "payment" && <CreditCard className="h-4 w-4" />}
                          {activity.type === "notification" && <Bell className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {activity.date ? new Date(activity.date).toLocaleString() : "-"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              {language === "fr" ? "Utilisateur non trouvé" : "User not found"}
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Footer />
    </div>
  );
}
