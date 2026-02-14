/**
 * AdminDashboardHome — Admin Control System main dashboard
 * Features: 8 KPI cards, system health, recent activity, quick actions
 */
import AdminControlLayout from "@/components/AdminControlLayout";
import { useLanguage } from "@/contexts/LanguageContext";

const ACCENT = "#dc2626";

const kpis = [
  { icon: "people", labelEn: "Total Users", labelFr: "Utilisateurs totaux", value: "1,247", change: "+12%", up: true },
  { icon: "school", labelEn: "Active Learners", labelFr: "Apprenants actifs", value: "834", change: "+8%", up: true },
  { icon: "person_search", labelEn: "Active Coaches", labelFr: "Coachs actifs", value: "18", change: "+2", up: true },
  { icon: "business", labelEn: "Organizations", labelFr: "Organisations", value: "12", change: "+1", up: true },
  { icon: "menu_book", labelEn: "Published Paths", labelFr: "Parcours publiés", value: "12", change: "0", up: false },
  { icon: "quiz", labelEn: "Total Lessons", labelFr: "Leçons totales", value: "192", change: "+6", up: true },
  { icon: "payments", labelEn: "Monthly Revenue", labelFr: "Revenus mensuels", value: "$14,820", change: "+15%", up: true },
  { icon: "trending_up", labelEn: "Conversion Rate", labelFr: "Taux de conversion", value: "4.2%", change: "+0.3%", up: true },
];

const recentActivity = [
  { icon: "person_add", text: "New user registered: Marie Dupont", textFr: "Nouvel utilisateur : Marie Dupont", time: "2 min ago", timeFr: "Il y a 2 min" },
  { icon: "school", text: "Coach Dr. Fontaine completed 3 sessions", textFr: "Coach Dr. Fontaine a terminé 3 sessions", time: "15 min ago", timeFr: "Il y a 15 min" },
  { icon: "payment", text: "Payment received: $450 (SLE Prep)", textFr: "Paiement reçu : 450 $ (Prépa ELS)", time: "1h ago", timeFr: "Il y a 1h" },
  { icon: "star", text: "New 5-star review from Jean-Pierre L.", textFr: "Nouvel avis 5 étoiles de Jean-Pierre L.", time: "2h ago", timeFr: "Il y a 2h" },
  { icon: "group_add", text: "Org 'Treasury Board' added 5 learners", textFr: "Org 'Conseil du Trésor' a ajouté 5 apprenants", time: "3h ago", timeFr: "Il y a 3h" },
  { icon: "publish", text: "Path 'FSL B2 Advanced' published", textFr: "Parcours 'FSL B2 Avancé' publié", time: "5h ago", timeFr: "Il y a 5h" },
];

const systemHealth = [
  { label: "API Server", status: "operational", uptime: "99.97%" },
  { label: "Database", status: "operational", uptime: "99.99%" },
  { label: "Auth Service", status: "operational", uptime: "100%" },
  { label: "Payment Gateway", status: "operational", uptime: "99.95%" },
  { label: "Email Service", status: "degraded", uptime: "98.2%" },
  { label: "CDN / Storage", status: "operational", uptime: "99.99%" },
];

export default function AdminDashboardHome() {
  const { lang } = useLanguage();

  return (
    <AdminControlLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              {lang === "fr" ? "Centre de commande" : "Command Center"}
            </h1>
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString(lang === "fr" ? "fr-CA" : "en-CA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="material-icons text-lg text-gray-500">download</span>
              {lang === "fr" ? "Exporter" : "Export"}
            </button>
            <button className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-white rounded-lg shadow-sm transition-colors" style={{ backgroundColor: ACCENT }}>
              <span className="material-icons text-lg">notifications</span>
              {lang === "fr" ? "Alertes" : "Alerts"}
              <span className="w-5 h-5 rounded-full bg-white/20 text-[10px] font-bold flex items-center justify-center">3</span>
            </button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {kpis.map(kpi => (
            <div key={kpi.labelEn} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${ACCENT}10` }}>
                  <span className="material-icons text-lg" style={{ color: ACCENT }}>{kpi.icon}</span>
                </div>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${kpi.up ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-500"}`}>
                  {kpi.change}
                </span>
              </div>
              <p className="text-xl font-bold text-gray-900">{kpi.value}</p>
              <p className="text-[10px] text-gray-500">{lang === "fr" ? kpi.labelFr : kpi.labelEn}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="material-icons text-lg" style={{ color: ACCENT }}>history</span>
              {lang === "fr" ? "Activité récente" : "Recent Activity"}
            </h2>
            <div className="space-y-3">
              {recentActivity.map((act, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                    <span className="material-icons text-sm text-gray-500">{act.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">{lang === "fr" ? act.textFr : act.text}</p>
                    <p className="text-[10px] text-gray-400">{lang === "fr" ? act.timeFr : act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="material-icons text-lg" style={{ color: ACCENT }}>monitor_heart</span>
              {lang === "fr" ? "Santé du système" : "System Health"}
            </h2>
            <div className="space-y-3">
              {systemHealth.map(svc => (
                <div key={svc.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${svc.status === "operational" ? "bg-green-500" : "bg-amber-500"}`} />
                    <span className="text-sm text-gray-700">{svc.label}</span>
                  </div>
                  <span className="text-xs text-gray-500">{svc.uptime}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-lg bg-green-50 border border-green-100">
              <p className="text-xs text-green-700 font-medium flex items-center gap-1">
                <span className="material-icons text-sm">check_circle</span>
                {lang === "fr" ? "Tous les systèmes opérationnels" : "All systems operational"}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-3">{lang === "fr" ? "Actions rapides" : "Quick Actions"}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: "person_add", labelEn: "Add User", labelFr: "Ajouter un utilisateur", path: "/admin/control/users" },
              { icon: "add_circle", labelEn: "Create Course", labelFr: "Créer un cours", path: "/admin/control/courses" },
              { icon: "mail", labelEn: "Send Campaign", labelFr: "Envoyer une campagne", path: "/admin/control/marketing" },
              { icon: "bar_chart", labelEn: "View Reports", labelFr: "Voir les rapports", path: "/admin/control/kpis" },
            ].map(action => (
              <a key={action.labelEn} href={action.path}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-[#dc2626]/30 hover:bg-[#dc2626]/5 transition-all cursor-pointer no-underline">
                <span className="material-icons text-2xl" style={{ color: ACCENT }}>{action.icon}</span>
                <span className="text-xs text-gray-700 font-medium text-center">{lang === "fr" ? action.labelFr : action.labelEn}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </AdminControlLayout>
  );
}
