/**
 * PortalLayout Component
 * Main layout wrapper for the LMS Portal
 * Sprint 8: Premium Learning Hub
 */

import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useUser, UserButton } from "@clerk/clerk-react";
import { 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  FolderOpen,
  ChevronRight,
  BookOpen,
  Target,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PortalLayoutProps {
  children: ReactNode;
}

const navigation = [
  { 
    name: "Vue d'ensemble", 
    href: "/portal/overview", 
    icon: LayoutDashboard,
    description: "Votre progression et activités"
  },
  { 
    name: "Mon Parcours", 
    href: "/portal/my-path", 
    icon: GraduationCap,
    description: "Path Series™ et curriculum"
  },
  { 
    name: "Coaching", 
    href: "/portal/coaching", 
    icon: Users,
    description: "Sessions Lingueefy"
  },
  { 
    name: "Ressources", 
    href: "/portal/resources", 
    icon: FolderOpen,
    description: "Documents et enregistrements"
  },
];

export default function PortalLayout({ children }: PortalLayoutProps) {
  const { user } = useUser();
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900 text-white flex flex-col z-20">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Link href="/portal/overview" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-[#145A5B] flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-lg">RusingÂcademy</span>
          </Link>
        </div>

        {/* User Info */}
        <div className="px-4 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-[#145A5B] flex items-center justify-center text-white font-semibold">
              {user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.fullName || "Apprenant"}
              </p>
              <p className="text-xs text-slate-400 truncate">
                Niveau B en cours
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location === item.href || location.startsWith(item.href + "/");
            return (
              <Link key={item.name} href={item.href}>
                <a
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-slate-400")} />
                  <div className="flex-1">
                    <span>{item.name}</span>
                    {!isActive && (
                      <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                    )}
                  </div>
                  {isActive && <ChevronRight className="h-4 w-4" />}
                </a>
              </Link>
            );
          })}
        </nav>

        {/* Progress Summary */}
        <div className="px-4 py-4 border-t border-slate-800">
          <div className="p-3 rounded-lg bg-slate-800/50">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-blue-400" />
              <span className="text-xs font-medium text-slate-300">Progression Globale</span>
            </div>
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-[#145A5B] rounded-full transition-all duration-500"
                style={{ width: "45%" }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">45% vers le niveau B</p>
          </div>
        </div>

        {/* Lingueefy Branding */}
        <div className="px-4 py-3 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Propulsé par</span>
            <span className="font-semibold text-[#0F3D3E]">Lingueefy</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-10 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-slate-900">
              Portail d'Apprentissage
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9",
                }
              }}
            />
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
