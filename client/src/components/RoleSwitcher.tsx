import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  User,
  GraduationCap,
  Shield,
  Building2,
  ChevronDown,
  CheckCircle,
} from "lucide-react";
import { Link, useLocation } from "wouter";

interface RoleOption {
  id: string;
  labelEn: string;
  labelFr: string;
  icon: React.ReactNode;
  href: string;
  roles: string[]; // Which user roles can access this dashboard
  color: string;
}

const roleOptions: RoleOption[] = [
  {
    id: "learner",
    labelEn: "Learner Dashboard",
    labelFr: "Tableau de bord apprenant",
    icon: <GraduationCap className="h-4 w-4" />,
    href: "/dashboard/learner",
    roles: ["learner", "coach", "hr", "admin", "owner"],
    color: "bg-blue-100 text-blue-700",
  },
  {
    id: "coach",
    labelEn: "Coach Dashboard",
    labelFr: "Tableau de bord coach",
    icon: <User className="h-4 w-4" />,
    href: "/dashboard/coach",
    roles: ["coach", "admin", "owner"],
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "hr",
    labelEn: "HR Dashboard",
    labelFr: "Tableau de bord RH",
    icon: <Building2 className="h-4 w-4" />,
    href: "/dashboard/hr",
    roles: ["hr", "admin", "owner"],
    color: "bg-[#E7F2F2] text-[#0F3D3E]",
  },
  {
    id: "admin",
    labelEn: "Admin Dashboard",
    labelFr: "Tableau de bord admin",
    icon: <Shield className="h-4 w-4" />,
    href: "/dashboard/admin",
    roles: ["admin", "owner"],
    color: "bg-amber-100 text-amber-700",
  },
];

export function RoleSwitcher() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  // Filter available dashboards based on user role
  const userRole = user?.role || "learner";
  const availableRoles = roleOptions.filter((option) =>
    option.roles.includes(userRole)
  );

  // Determine current dashboard
  const currentDashboard = roleOptions.find((option) =>
    location.startsWith(option.href)
  ) || roleOptions[0];

  // Don't render if user only has access to one dashboard
  if (availableRoles.length <= 1) {
    return null;
  }

  const labels = {
    en: {
      switchView: "Switch View",
      currentView: "Current View",
    },
    fr: {
      switchView: "Changer de vue",
      currentView: "Vue actuelle",
    },
  };

  const l = labels[language];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 h-9 px-3 rounded-lg border-slate-200 bg-white/50 backdrop-blur-sm hover:bg-white/80"
        >
          <div className={`p-1 rounded ${currentDashboard.color}`}>
            {currentDashboard.icon}
          </div>
          <span className="hidden sm:inline text-sm font-medium">
            {language === "fr" ? currentDashboard.labelFr : currentDashboard.labelEn}
          </span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 p-2">
        <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1">
          {l.switchView}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableRoles.map((option) => {
          const isActive = location.startsWith(option.href);
          return (
            <DropdownMenuItem
              key={option.id}
              asChild
              className={`cursor-pointer rounded-lg px-2 py-2.5 ${
                isActive ? "bg-slate-100" : ""
              }`}
            >
              <Link href={option.href} onClick={() => setOpen(false)}>
                <div className="flex items-center gap-3 w-full">
                  <div className={`p-1.5 rounded-lg ${option.color}`}>
                    {option.icon}
                  </div>
                  <span className="flex-1 font-medium text-sm">
                    {language === "fr" ? option.labelFr : option.labelEn}
                  </span>
                  {isActive && (
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  )}
                </div>
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Compact version for dashboard headers
export function RoleSwitcherCompact() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [location] = useLocation();

  const userRole = user?.role || "learner";
  const availableRoles = roleOptions.filter((option) =>
    option.roles.includes(userRole)
  );

  // Don't render if user only has access to one dashboard
  if (availableRoles.length <= 1) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50">
      {availableRoles.map((option) => {
        const isActive = location.startsWith(option.href);
        return (
          <Link key={option.id} href={option.href}>
            <Button
              variant={isActive ? "default" : "ghost"}
              size="sm"
              className={`gap-1.5 h-8 px-3 rounded-md ${
                isActive ? "" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {option.icon}
              <span className="hidden sm:inline text-xs font-medium">
                {language === "fr"
                  ? option.labelFr.replace(" Dashboard", "").replace(" Tableau de bord", "")
                  : option.labelEn.replace(" Dashboard", "")}
              </span>
            </Button>
          </Link>
        );
      })}
    </div>
  );
}
