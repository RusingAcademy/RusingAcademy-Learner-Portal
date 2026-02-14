/**
 * AppLayout — Unified Dashboard Shell
 *
 * Single layout for all roles (learner, coach, hr_admin, admin).
 * Sidebar sections are filtered dynamically based on user role.
 * Reuses the same design tokens and patterns as AdminLayout.
 *
 * Architecture:
 *   - PERSONAL sections → visible to ALL roles
 *   - PRACTICE sections → visible to ALL roles
 *   - COACHING sections → visible to coach, hr_admin, admin
 *   - ORGANIZATION sections → visible to hr_admin, admin
 *   - ADMIN sections → visible to admin only (links to /admin/*)
 */
import { useState, useMemo } from "react";
import { AppLayoutProvider } from "@/contexts/AppLayoutContext";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  TrendingUp,
  Calendar,
  CreditCard,
  Heart,
  Settings,
  Bot,
  MessageSquare,
  Award,
  Gamepad2,
  Mic,
  Users,
  Clock,
  UserCircle,
  DollarSign,
  BookMarked,
  Video,
  Building2,
  UsersRound,
  PieChart,
  FileBarChart,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Globe,
  Bell,
  Search,
  Menu,
  X,
  BarChart3,
  ClipboardCheck,
  type LucideIcon,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────
type UserRole = "learner" | "user" | "coach" | "hr_admin" | "admin" | "owner";

interface NavItem {
  id: string;
  label: string;
  labelFr: string;
  icon: LucideIcon;
  path: string;
  badge?: number;
}

interface NavSection {
  title: string;
  titleFr: string;
  minRole: UserRole;
  items: NavItem[];
}

// ─── Role hierarchy ──────────────────────────────────────────────────
const ROLE_LEVEL: Record<UserRole, number> = {
  user: 0,
  learner: 0,
  coach: 1,
  hr_admin: 2,
  admin: 3,
  owner: 4,
};

function hasMinRole(userRole: UserRole, minRole: UserRole): boolean {
  return (ROLE_LEVEL[userRole] ?? 0) >= (ROLE_LEVEL[minRole] ?? 0);
}

// ─── Navigation registry ─────────────────────────────────────────────
const navSections: NavSection[] = [
  // ── PERSONAL (all roles) ──
  {
    title: "",
    titleFr: "",
    minRole: "learner",
    items: [
      {
        id: "overview",
        label: "Dashboard",
        labelFr: "Tableau de bord",
        icon: LayoutDashboard,
        path: "/app",
      },
    ],
  },
  {
    title: "MY LEARNING",
    titleFr: "MON APPRENTISSAGE",
    minRole: "learner",
    items: [
      {
        id: "my-courses",
        label: "My Courses",
        labelFr: "Mes cours",
        icon: BookOpen,
        path: "/app/my-courses",
      },
      {
        id: "my-progress",
        label: "Progress",
        labelFr: "Progression",
        icon: TrendingUp,
        path: "/app/my-progress",
      },
      {
        id: "my-sessions",
        label: "My Sessions",
        labelFr: "Mes sessions",
        icon: Calendar,
        path: "/app/my-sessions",
      },
      {
        id: "my-payments",
        label: "Payments",
        labelFr: "Paiements",
        icon: CreditCard,
        path: "/app/my-payments",
      },
      {
        id: "favorites",
        label: "Favorites",
        labelFr: "Favoris",
        icon: Heart,
        path: "/app/favorites",
      },
      {
        id: "certificates",
        label: "Certificates",
        labelFr: "Certificats",
        icon: Award,
        path: "/app/certificates",
      },
    ],
  },
  {
    title: "PRACTICE",
    titleFr: "PRATIQUE",
    minRole: "learner",
    items: [
      {
        id: "ai-practice",
        label: "AI Practice",
        labelFr: "Pratique IA",
        icon: Bot,
        path: "/app/ai-practice",
      },
      {
        id: "conversation",
        label: "Conversation",
        labelFr: "Conversation",
        icon: Mic,
        path: "/app/conversation",
      },
      {
        id: "practice-history",
        label: "Practice History",
        labelFr: "Historique",
        icon: MessageSquare,
        path: "/app/practice-history",
      },
      {
        id: "simulation",
        label: "SLE Simulation",
        labelFr: "Simulation ELS",
        icon: Gamepad2,
        path: "/app/simulation",
      },
      {
        id: "sle-exam",
        label: "Mock Exam",
        labelFr: "Examen simulé",
        icon: ClipboardCheck,
        path: "/app/sle-exam",
      },
      {
        id: "sle-progress",
        label: "SLE Progress",
        labelFr: "Progression ÉLS",
        icon: BarChart3,
        path: "/app/sle-progress",
      },
      {
        id: "badges",
        label: "Badges & Rewards",
        labelFr: "Badges et récompenses",
        icon: Award,
        path: "/app/badges",
      },
    ],
  },
  // ── COACHING (coach+) ──
  {
    title: "COACHING",
    titleFr: "COACHING",
    minRole: "coach",
    items: [
      {
        id: "my-students",
        label: "My Students",
        labelFr: "Mes étudiants",
        icon: Users,
        path: "/app/my-students",
      },
      {
        id: "availability",
        label: "Availability",
        labelFr: "Disponibilités",
        icon: Clock,
        path: "/app/availability",
      },
      {
        id: "coach-profile",
        label: "Coach Profile",
        labelFr: "Profil coach",
        icon: UserCircle,
        path: "/app/coach-profile",
      },
      {
        id: "earnings",
        label: "Earnings",
        labelFr: "Revenus",
        icon: DollarSign,
        path: "/app/earnings",
      },
      {
        id: "video-sessions",
        label: "Video Sessions",
        labelFr: "Sessions vidéo",
        icon: Video,
        path: "/app/video-sessions",
      },
      {
        id: "coach-guide",
        label: "Coach Guide",
        labelFr: "Guide du coach",
        icon: BookMarked,
        path: "/app/coach-guide",
      },
    ],
  },
  // ── ORGANIZATION (hr_admin+) ──
  {
    title: "ORGANIZATION",
    titleFr: "ORGANISATION",
    minRole: "hr_admin",
    items: [
      {
        id: "team",
        label: "Team Overview",
        labelFr: "Vue d'équipe",
        icon: UsersRound,
        path: "/app/team",
      },
      {
        id: "cohorts",
        label: "Cohorts",
        labelFr: "Cohortes",
        icon: Building2,
        path: "/app/cohorts",
      },
      {
        id: "budget",
        label: "Budget",
        labelFr: "Budget",
        icon: PieChart,
        path: "/app/budget",
      },
      {
        id: "compliance",
        label: "Compliance Reports",
        labelFr: "Rapports de conformité",
        icon: FileBarChart,
        path: "/app/compliance",
      },
    ],
  },
  // ── ADMIN (admin only — links to /admin/*) ──
  {
    title: "ADMINISTRATION",
    titleFr: "ADMINISTRATION",
    minRole: "admin",
    items: [
      {
        id: "admin-panel",
        label: "Admin Control Center",
        labelFr: "Centre de contrôle admin",
        icon: ShieldCheck,
        path: "/admin",
      },
    ],
  },
];

const bottomItems: NavItem[] = [
  {
    id: "settings",
    label: "Settings",
    labelFr: "Paramètres",
    icon: Settings,
    path: "/app/settings",
  },
];

// ─── Component ───────────────────────────────────────────────────────
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location, navigate] = useLocation();
  const { user } = useAuth();

  const userRole: UserRole = (user?.role as UserRole) || "learner";

  // Detect language from localStorage or default to "en"
  const language =
    typeof window !== "undefined"
      ? localStorage.getItem("ecosystem-language") || "en"
      : "en";
  const isFr = language === "fr";

  // Filter sections by role
  const filteredSections = useMemo(
    () =>
      navSections.filter(
        (section) =>
          hasMinRole(userRole, section.minRole) && section.items.length > 0
      ),
    [userRole]
  );

  const isActive = (path: string) => {
    if (path === "/app") return location === "/app" || location === "/app/";
    return location.startsWith(path);
  };

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const roleLabel: Record<UserRole, string> = {
    user: "Learner",
    learner: "Learner",
    coach: "Coach",
    hr_admin: "HR Admin",
    admin: "Administrator",
    owner: "Owner",
  };

  const roleLabelFr: Record<UserRole, string> = {
    user: "Apprenant",
    learner: "Apprenant",
    coach: "Coach",
    hr_admin: "Admin RH",
    admin: "Administrateur",
    owner: "Propriétaire",
  };

  // ── Sidebar content (shared between desktop & mobile) ──
  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-sidebar-border">
        {!collapsed ? (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[var(--brand-foundation)] flex items-center justify-center text-white font-bold text-sm shrink-0">
              RA
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">
                RusingÂcademy
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {isFr
                  ? roleLabelFr[userRole] || "Apprenant"
                  : roleLabel[userRole] || "Learner"}
              </p>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-[var(--brand-foundation)] flex items-center justify-center text-white font-bold text-sm mx-auto">
            RA
          </div>
        )}
      </div>

      {/* Nav Sections */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {filteredSections.map((section, idx) => (
          <div key={idx}>
            {section.title && !collapsed && (
              <p className="px-2.5 pt-4 pb-1.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                {isFr ? section.titleFr : section.title}
              </p>
            )}
            {section.title && collapsed && <Separator className="my-1" />}
            {section.items.map((item) => (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <Link href={item.path}>
                    <button
                      className={cn(
                        "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors",
                        isActive(item.path)
                          ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        collapsed && "justify-center px-0"
                      )}
                      onClick={() => setMobileOpen(false)}
                    >
                      <item.icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          collapsed && "h-5 w-5"
                        )}
                      />
                      {!collapsed && (
                        <span className="truncate">
                          {isFr ? item.labelFr : item.label}
                        </span>
                      )}
                      {!collapsed &&
                        item.badge !== undefined &&
                        item.badge > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                            {item.badge}
                          </span>
                        )}
                    </button>
                  </Link>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right">
                    {isFr ? item.labelFr : item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-sidebar-border px-2 py-2">
        {bottomItems.map((item) => (
          <Tooltip key={item.id}>
            <TooltipTrigger asChild>
              <Link href={item.path}>
                <button
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors",
                    isActive(item.path)
                      ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    collapsed && "justify-center px-0"
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      collapsed && "h-5 w-5"
                    )}
                  />
                  {!collapsed && (
                    <span className="truncate">
                      {isFr ? item.labelFr : item.label}
                    </span>
                  )}
                </button>
              </Link>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">
                {isFr ? item.labelFr : item.label}
              </TooltipContent>
            )}
          </Tooltip>
        ))}
        <Separator className="my-2" />
        {/* User info + controls */}
        <div
          className={cn(
            "flex items-center gap-2 px-2 py-1.5",
            collapsed && "justify-center"
          )}
        >
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-[var(--brand-foundation)] text-white text-xs font-semibold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">
                {user?.name || (isFr ? "Utilisateur" : "User")}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {user?.email || ""}
              </p>
            </div>
          )}
        </div>
        <div
          className={cn(
            "flex items-center gap-1 mt-1",
            collapsed ? "flex-col" : ""
          )}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-xs text-muted-foreground flex-1"
                onClick={() => navigate("/")}
              >
                <Globe className="h-3.5 w-3.5" />
                {!collapsed && (isFr ? "Voir le site" : "View Site")}
              </Button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">
                {isFr ? "Voir le site" : "View Site"}
              </TooltipContent>
            )}
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hidden md:flex"
                onClick={() => setCollapsed(!collapsed)}
              >
                {collapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {collapsed
                ? isFr
                  ? "Agrandir"
                  : "Expand sidebar"
                : isFr
                  ? "Réduire"
                  : "Collapse sidebar"}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </>
  );

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Mobile sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-sidebar-border bg-sidebar w-64 transition-transform duration-200 md:hidden",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <SidebarContent />
        </aside>

        {/* Desktop sidebar */}
        <aside
          className={cn(
            "hidden md:flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200 ease-in-out shrink-0",
            collapsed ? "w-16" : "w-64"
          )}
        >
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-background">
          {/* Top Bar */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 md:px-6 py-3 flex items-center justify-between">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-8 w-8"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>

            {/* Search placeholder */}
            <div className="hidden md:flex items-center gap-2 text-muted-foreground text-sm">
              <Search className="h-4 w-4" />
              <span className="text-xs">
                {isFr ? "Rechercher..." : "Search..."}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="relative"
                onClick={() => navigate("/app/notifications")}
              >
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Page content */}
          <div className="p-4 md:p-6">
            <AppLayoutProvider>{children}</AppLayoutProvider>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
