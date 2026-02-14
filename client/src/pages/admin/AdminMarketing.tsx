/**
 * AdminMarketing — Marketing CRM for Admin Control System
 * Features: Campaign management, lead tracking, email analytics, segments
 */
import AdminControlLayout from "@/components/AdminControlLayout";
import { useLanguage } from "@/contexts/LanguageContext";

const ACCENT = "#dc2626";

interface Campaign {
  id: number;
  name: string;
  type: "email" | "promo" | "webinar" | "social";
  status: "active" | "scheduled" | "completed" | "draft";
  sent: number;
  opened: number;
  clicked: number;
  converted: number;
  date: string;
}

const campaigns: Campaign[] = [
  { id: 1, name: "SLE Prep Spring Launch", type: "email", status: "active", sent: 1240, opened: 680, clicked: 234, converted: 45, date: "Feb 10" },
  { id: 2, name: "Valentine's 20% Off", type: "promo", status: "active", sent: 890, opened: 520, clicked: 178, converted: 32, date: "Feb 12" },
  { id: 3, name: "Free Webinar: SLE Tips", type: "webinar", status: "scheduled", sent: 0, opened: 0, clicked: 0, converted: 0, date: "Feb 20" },
  { id: 4, name: "New Path Announcement", type: "email", status: "completed", sent: 1100, opened: 720, clicked: 312, converted: 67, date: "Jan 28" },
  { id: 5, name: "Year-End Summary", type: "email", status: "completed", sent: 980, opened: 610, clicked: 198, converted: 28, date: "Dec 31" },
  { id: 6, name: "LinkedIn Awareness", type: "social", status: "draft", sent: 0, opened: 0, clicked: 0, converted: 0, date: "—" },
];

const segments = [
  { name: lang => lang === "fr" ? "Fonctionnaires fédéraux" : "Federal Public Servants", count: 523, growth: "+12%" },
  { name: lang => lang === "fr" ? "Apprenants FSL" : "FSL Learners", count: 412, growth: "+8%" },
  { name: lang => lang === "fr" ? "Candidats SLE" : "SLE Candidates", count: 189, growth: "+22%" },
  { name: lang => lang === "fr" ? "Gestionnaires RH" : "HR Managers", count: 45, growth: "+5%" },
  { name: lang => lang === "fr" ? "Organisations" : "Organizations", count: 12, growth: "+1" },
];

const typeIcons: Record<string, string> = { email: "email", promo: "local_offer", webinar: "videocam", social: "share" };
const statusStyles: Record<string, string> = {
  active: "bg-green-50 text-green-700 border-green-200",
  scheduled: "bg-blue-50 text-blue-600 border-blue-200",
  completed: "bg-gray-50 text-gray-600 border-gray-200",
  draft: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function AdminMarketing() {
  const { lang } = useLanguage();

  const totalSent = campaigns.reduce((s, c) => s + c.sent, 0);
  const totalOpened = campaigns.reduce((s, c) => s + c.opened, 0);
  const totalClicked = campaigns.reduce((s, c) => s + c.clicked, 0);
  const totalConverted = campaigns.reduce((s, c) => s + c.converted, 0);

  return (
    <AdminControlLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Marketing CRM
            </h1>
            <p className="text-sm text-gray-500">{lang === "fr" ? "Campagnes, segments et analyses" : "Campaigns, segments & analytics"}</p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-lg shadow-sm transition-colors" style={{ backgroundColor: ACCENT }}>
            <span className="material-icons text-lg">add</span>
            {lang === "fr" ? "Nouvelle campagne" : "New Campaign"}
          </button>
        </div>

        {/* Funnel Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { icon: "send", label: lang === "fr" ? "Envoyés" : "Sent", value: totalSent.toLocaleString() },
            { icon: "drafts", label: lang === "fr" ? "Ouverts" : "Opened", value: `${totalOpened.toLocaleString()} (${totalSent ? Math.round((totalOpened / totalSent) * 100) : 0}%)` },
            { icon: "ads_click", label: lang === "fr" ? "Cliqués" : "Clicked", value: `${totalClicked.toLocaleString()} (${totalOpened ? Math.round((totalClicked / totalOpened) * 100) : 0}%)` },
            { icon: "how_to_reg", label: lang === "fr" ? "Convertis" : "Converted", value: `${totalConverted} (${totalClicked ? Math.round((totalConverted / totalClicked) * 100) : 0}%)` },
          ].map(m => (
            <div key={m.label} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: `${ACCENT}10` }}>
                <span className="material-icons text-lg" style={{ color: ACCENT }}>{m.icon}</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{m.value}</p>
              <p className="text-[10px] text-gray-500">{m.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Campaigns */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">{lang === "fr" ? "Campagnes" : "Campaigns"}</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {campaigns.map(c => (
                <div key={c.id} className="p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                        <span className="material-icons text-sm text-gray-500">{typeIcons[c.type]}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{c.name}</p>
                        <p className="text-[10px] text-gray-400">{c.type.toUpperCase()} · {c.date}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusStyles[c.status]}`}>
                      {c.status}
                    </span>
                  </div>
                  {c.sent > 0 && (
                    <div className="flex gap-4 text-[10px] text-gray-500 ml-10">
                      <span>{lang === "fr" ? "Envoyés" : "Sent"}: <strong className="text-gray-700">{c.sent}</strong></span>
                      <span>{lang === "fr" ? "Ouverts" : "Opened"}: <strong className="text-gray-700">{Math.round((c.opened / c.sent) * 100)}%</strong></span>
                      <span>{lang === "fr" ? "Cliqués" : "Clicked"}: <strong className="text-gray-700">{Math.round((c.clicked / c.sent) * 100)}%</strong></span>
                      <span>{lang === "fr" ? "Convertis" : "Converted"}: <strong className="text-green-600">{c.converted}</strong></span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Segments */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="material-icons text-lg" style={{ color: ACCENT }}>group_work</span>
              {lang === "fr" ? "Segments" : "Segments"}
            </h2>
            <div className="space-y-3">
              {segments.map((seg, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm text-gray-700">{seg.name(lang)}</p>
                    <p className="text-[10px] text-gray-400">{seg.count} {lang === "fr" ? "contacts" : "contacts"}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">{seg.growth}</span>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full py-2 text-xs font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              {lang === "fr" ? "Gérer les segments" : "Manage Segments"}
            </button>
          </div>
        </div>
      </div>
    </AdminControlLayout>
  );
}
