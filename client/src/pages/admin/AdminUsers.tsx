/**
 * AdminUsers — User & Role Management for Admin Control System
 * Features: User list, role assignment, status management, search/filter
 */
import AdminControlLayout from "@/components/AdminControlLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

const ACCENT = "#dc2626";

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "coach" | "hr" | "learner";
  status: "active" | "suspended" | "pending";
  lastLogin: string;
  joinDate: string;
}

const mockUsers: User[] = [
  { id: 1, name: "Steven Barholere", email: "steven@rusingacademy.ca", role: "admin", status: "active", lastLogin: "Today", joinDate: "Jan 2024" },
  { id: 2, name: "Dr. Claire Fontaine", email: "claire.f@lingueefy.ca", role: "coach", status: "active", lastLogin: "Today", joinDate: "Mar 2024" },
  { id: 3, name: "Prof. Marc Leblanc", email: "marc.l@lingueefy.ca", role: "coach", status: "active", lastLogin: "Yesterday", joinDate: "Apr 2024" },
  { id: 4, name: "Sarah Williams", email: "sarah.w@lingueefy.ca", role: "coach", status: "active", lastLogin: "2 days ago", joinDate: "May 2024" },
  { id: 5, name: "Julie Tremblay", email: "julie.t@tbs.gc.ca", role: "hr", status: "active", lastLogin: "Today", joinDate: "Jun 2024" },
  { id: 6, name: "Jean-Pierre Lavoie", email: "jp.lavoie@pco.gc.ca", role: "learner", status: "active", lastLogin: "Today", joinDate: "Sep 2024" },
  { id: 7, name: "Sarah Mitchell", email: "s.mitchell@fin.gc.ca", role: "learner", status: "active", lastLogin: "Yesterday", joinDate: "Oct 2024" },
  { id: 8, name: "Marc Bouchard", email: "m.bouchard@fin.gc.ca", role: "learner", status: "active", lastLogin: "3 days ago", joinDate: "Nov 2024" },
  { id: 9, name: "Emily Roberts", email: "e.roberts@ssc.gc.ca", role: "learner", status: "pending", lastLogin: "Never", joinDate: "Feb 2026" },
  { id: 10, name: "Pierre Gagné", email: "p.gagne@psc.gc.ca", role: "learner", status: "suspended", lastLogin: "Jan 2026", joinDate: "Dec 2024" },
];

const roleColors: Record<string, string> = {
  admin: "bg-red-50 text-red-700 border-red-200",
  coach: "bg-violet-50 text-violet-700 border-violet-200",
  hr: "bg-blue-50 text-blue-700 border-blue-200",
  learner: "bg-teal-50 text-teal-700 border-teal-200",
};

const statusColors: Record<string, string> = {
  active: "bg-green-50 text-green-700 border-green-200",
  suspended: "bg-red-50 text-red-600 border-red-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function AdminUsers() {
  const { lang } = useLanguage();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = mockUsers.filter(u => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const roleCounts = { admin: 0, coach: 0, hr: 0, learner: 0 };
  mockUsers.forEach(u => roleCounts[u.role]++);

  return (
    <AdminControlLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              {lang === "fr" ? "Utilisateurs & Rôles" : "Users & Roles"}
            </h1>
            <p className="text-sm text-gray-500">{mockUsers.length} {lang === "fr" ? "utilisateurs au total" : "total users"}</p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-lg shadow-sm transition-colors" style={{ backgroundColor: ACCENT }}>
            <span className="material-icons text-lg">person_add</span>
            {lang === "fr" ? "Ajouter un utilisateur" : "Add User"}
          </button>
        </div>

        {/* Role Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {(["admin", "coach", "hr", "learner"] as const).map(role => (
            <button key={role} onClick={() => setRoleFilter(roleFilter === role ? "all" : role)}
              className={`p-4 rounded-xl border text-left transition-all ${roleFilter === role ? "border-[#dc2626] bg-[#dc2626]/5 shadow-sm" : "border-gray-100 bg-white hover:shadow-sm"}`}>
              <p className="text-2xl font-bold text-gray-900">{roleCounts[role]}</p>
              <p className="text-xs text-gray-500 capitalize">{role === "hr" ? "HR Managers" : `${role}s`}</p>
            </button>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder={lang === "fr" ? "Rechercher par nom ou email..." : "Search by name or email..."}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#dc2626]/20 focus:border-[#dc2626] outline-none" />
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#dc2626]/20 focus:border-[#dc2626] outline-none">
            <option value="all">{lang === "fr" ? "Tous les rôles" : "All Roles"}</option>
            <option value="admin">Admin</option>
            <option value="coach">Coach</option>
            <option value="hr">HR</option>
            <option value="learner">{lang === "fr" ? "Apprenant" : "Learner"}</option>
          </select>
        </div>

        {/* User Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium">{lang === "fr" ? "Utilisateur" : "User"}</th>
                  <th className="text-center py-3 px-4 text-xs text-gray-500 font-medium">{lang === "fr" ? "Rôle" : "Role"}</th>
                  <th className="text-center py-3 px-4 text-xs text-gray-500 font-medium">{lang === "fr" ? "Statut" : "Status"}</th>
                  <th className="text-center py-3 px-4 text-xs text-gray-500 font-medium">{lang === "fr" ? "Dernière connexion" : "Last Login"}</th>
                  <th className="text-center py-3 px-4 text-xs text-gray-500 font-medium">{lang === "fr" ? "Inscrit" : "Joined"}</th>
                  <th className="text-center py-3 px-4 text-xs text-gray-500 font-medium">{lang === "fr" ? "Actions" : "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <tr key={user.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: ACCENT }}>
                          {user.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-[10px] text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${roleColors[user.role]}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${statusColors[user.status]}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-xs text-gray-600">{user.lastLogin}</td>
                    <td className="py-3 px-4 text-center text-xs text-gray-600">{user.joinDate}</td>
                    <td className="py-3 px-4 text-center">
                      <button className="text-gray-400 hover:text-gray-600 transition-colors">
                        <span className="material-icons text-lg">more_vert</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminControlLayout>
  );
}
