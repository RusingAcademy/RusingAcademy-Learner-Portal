/**
 * CoachDashboardHome — Coach Portal main dashboard
 * KPIs: Active students, sessions this month, revenue, rating
 * Sections: Upcoming sessions, recent student activity, quick actions
 */
import CoachLayout from "@/components/CoachLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

const ACCENT = "#7c3aed";

function KPICard({ icon, value, label, trend, trendUp }: { icon: string; value: string; label: string; trend?: string; trendUp?: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${ACCENT}10` }}>
          <span className="material-icons text-xl" style={{ color: ACCENT }}>{icon}</span>
        </div>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trendUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
            {trendUp ? "↑" : "↓"} {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 mt-3">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function UpcomingSessionCard({ student, time, type, level }: { student: string; time: string; type: string; level: string }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-sm transition-shadow">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#9333ea] flex items-center justify-center text-white font-bold text-sm">
        {student.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{student}</p>
        <p className="text-xs text-gray-500">{type} · {level}</p>
      </div>
      <div className="text-right">
        <p className="text-xs font-semibold text-[#7c3aed]">{time}</p>
        <button className="text-[10px] text-gray-400 hover:text-[#7c3aed] mt-0.5 transition-colors">
          <span className="material-icons text-[14px]">videocam</span>
        </button>
      </div>
    </div>
  );
}

function StudentActivityRow({ name, action, time, score }: { name: string; action: string; time: string; score?: number }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-xs">
        {name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 truncate">{name}</p>
        <p className="text-[11px] text-gray-400">{action}</p>
      </div>
      <div className="text-right">
        {score !== undefined && (
          <span className={`text-xs font-bold ${score >= 80 ? "text-green-600" : score >= 60 ? "text-amber-600" : "text-red-500"}`}>
            {score}%
          </span>
        )}
        <p className="text-[10px] text-gray-400">{time}</p>
      </div>
    </div>
  );
}

export default function CoachDashboardHome() {
  const { lang } = useLanguage();
  const [period] = useState<"week" | "month">("month");

  const now = new Date();
  const dateStr = now.toLocaleDateString(lang === "fr" ? "fr-CA" : "en-CA", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });

  return (
    <CoachLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
            {lang === "fr" ? "Tableau de bord" : "Dashboard"}
          </h1>
          <p className="text-sm text-gray-500 capitalize">{dateStr}</p>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KPICard icon="people" value="24" label={lang === "fr" ? "Étudiants actifs" : "Active Students"} trend="12%" trendUp={true} />
          <KPICard icon="event" value="18" label={lang === "fr" ? "Sessions ce mois" : "Sessions This Month"} trend="8%" trendUp={true} />
          <KPICard icon="attach_money" value="$2,340" label={lang === "fr" ? "Revenus ce mois" : "Revenue This Month"} trend="15%" trendUp={true} />
          <KPICard icon="star" value="4.8" label={lang === "fr" ? "Note moyenne" : "Average Rating"} trend="0.2" trendUp={true} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Sessions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">
                  {lang === "fr" ? "Sessions à venir" : "Upcoming Sessions"}
                </h2>
                <button className="text-xs text-[#7c3aed] font-medium hover:underline">
                  {lang === "fr" ? "Voir tout" : "View All"} →
                </button>
              </div>
              <div className="space-y-3">
                <UpcomingSessionCard student="Marie Dupont" time="10:00 AM" type="FSL Conversation" level="B1" />
                <UpcomingSessionCard student="James Wilson" time="11:30 AM" type="SLE Prep" level="B2" />
                <UpcomingSessionCard student="Sophie Tremblay" time="2:00 PM" type="Grammar Review" level="A2" />
                <UpcomingSessionCard student="David Chen" time="3:30 PM" type="Writing Workshop" level="B1" />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: "add_circle", label: lang === "fr" ? "Nouvelle session" : "New Session", color: "#7c3aed" },
                { icon: "assignment", label: lang === "fr" ? "Donner un devoir" : "Assign Homework", color: "#2563eb" },
                { icon: "rate_review", label: lang === "fr" ? "Écrire un feedback" : "Write Feedback", color: "#059669" },
                { icon: "description", label: lang === "fr" ? "Créer un rapport" : "Create Report", color: "#d97706" },
              ].map((action) => (
                <button key={action.label} className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all group">
                  <span className="material-icons text-2xl transition-transform group-hover:scale-110" style={{ color: action.color }}>
                    {action.icon}
                  </span>
                  <span className="text-xs font-medium text-gray-700 text-center">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Student Activity */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                {lang === "fr" ? "Activité récente" : "Recent Activity"}
              </h2>
              <div>
                <StudentActivityRow name="Marie D." action={lang === "fr" ? "Quiz terminé — Path II" : "Completed quiz — Path II"} time="2h" score={88} />
                <StudentActivityRow name="James W." action={lang === "fr" ? "Soumission d'écriture" : "Writing submission"} time="3h" />
                <StudentActivityRow name="Sophie T." action={lang === "fr" ? "Leçon terminée — Module 5" : "Completed lesson — Module 5"} time="5h" score={72} />
                <StudentActivityRow name="David C." action={lang === "fr" ? "Exercice de prononciation" : "Pronunciation exercise"} time="6h" score={95} />
                <StudentActivityRow name="Luc B." action={lang === "fr" ? "Examen SLE simulé" : "Mock SLE exam"} time="1d" score={67} />
              </div>
            </div>

            {/* Monthly Summary */}
            <div className="bg-gradient-to-br from-[#7c3aed] to-[#6d28d9] rounded-xl p-5 text-white">
              <h3 className="text-sm font-semibold mb-3 opacity-90">
                {lang === "fr" ? "Résumé mensuel" : "Monthly Summary"}
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="opacity-80">{lang === "fr" ? "Heures enseignées" : "Hours Taught"}</span>
                  <span className="font-bold">36h</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="opacity-80">{lang === "fr" ? "Taux de complétion" : "Completion Rate"}</span>
                  <span className="font-bold">94%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="opacity-80">{lang === "fr" ? "Étudiants satisfaits" : "Satisfied Students"}</span>
                  <span className="font-bold">22/24</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="opacity-80">{lang === "fr" ? "Commission gagnée" : "Commission Earned"}</span>
                  <span className="font-bold">$468</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CoachLayout>
  );
}
