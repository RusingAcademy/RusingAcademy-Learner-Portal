import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

// Types
interface Lead {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  source: "lingueefy" | "rusingacademy" | "barholex" | "ecosystem_hub" | "external";
  formType: string;
  leadType: "individual" | "organization" | "government" | "enterprise";
  status: "new" | "contacted" | "qualified" | "proposal_sent" | "negotiating" | "won" | "lost" | "nurturing";
  message?: string;
  interests?: string[];
  budget?: string;
  timeline?: string;
  leadScore: number;
  createdAt: string;
  assignedUser?: { id: number; name: string; email: string } | null;
}

interface CRMAnalytics {
  totalLeads: number;
  convertedLeads: number;
  conversionRate: string;
  leadsBySource: { source: string; count: number }[];
  leadsByStatus: { status: string; count: number }[];
  crossSellOpportunities: number;
  convertedCrossSell: number;
}

// Mock data for demonstration
const mockAnalytics: CRMAnalytics = {
  totalLeads: 156,
  convertedLeads: 23,
  conversionRate: "14.7",
  leadsBySource: [
    { source: "lingueefy", count: 78 },
    { source: "rusingacademy", count: 45 },
    { source: "barholex", count: 28 },
    { source: "ecosystem_hub", count: 5 },
  ],
  leadsByStatus: [
    { status: "new", count: 42 },
    { status: "contacted", count: 35 },
    { status: "qualified", count: 28 },
    { status: "proposal_sent", count: 18 },
    { status: "negotiating", count: 10 },
    { status: "won", count: 23 },
  ],
  crossSellOpportunities: 34,
  convertedCrossSell: 8,
};

const mockLeads: Lead[] = [
  {
    id: 1,
    firstName: "Marie",
    lastName: "Dubois",
    email: "marie.dubois@canada.ca",
    phone: "+1 613-555-0123",
    company: "Treasury Board of Canada",
    jobTitle: "HR Director",
    source: "rusingacademy",
    formType: "proposal",
    leadType: "government",
    status: "qualified",
    message: "Looking for FSL training for 50+ employees",
    interests: ["team training", "SLE preparation", "bilingual certification"],
    budget: "$50,000-$100,000",
    timeline: "Q2 2026",
    leadScore: 85,
    createdAt: "2026-01-08T10:30:00Z",
    assignedUser: { id: 1, name: "Admin", email: "admin@lingueefy.com" },
  },
  {
    id: 2,
    firstName: "Jean-Pierre",
    lastName: "Martin",
    email: "jp.martin@example.com",
    source: "lingueefy",
    formType: "coaching",
    leadType: "individual",
    status: "new",
    message: "Need help preparing for Oral C exam",
    interests: ["oral coaching", "SLE C level"],
    leadScore: 65,
    createdAt: "2026-01-09T14:15:00Z",
    assignedUser: null,
  },
  {
    id: 3,
    firstName: "Sarah",
    lastName: "Thompson",
    email: "sarah@techstartup.io",
    company: "TechStartup Inc.",
    jobTitle: "CEO",
    source: "barholex",
    formType: "project",
    leadType: "enterprise",
    status: "proposal_sent",
    message: "Need promotional video and website redesign",
    interests: ["video production", "web design", "branding"],
    budget: "$15,000-$25,000",
    timeline: "March 2026",
    leadScore: 78,
    createdAt: "2026-01-07T09:00:00Z",
    assignedUser: { id: 1, name: "Admin", email: "admin@lingueefy.com" },
  },
];

const translations = {
  en: {
    title: "CRM Dashboard",
    subtitle: "Unified lead management across the Rusinga ecosystem",
    analytics: "Analytics Overview",
    totalLeads: "Total Leads",
    converted: "Converted",
    conversionRate: "Conversion Rate",
    crossSell: "Cross-Sell Opportunities",
    leadsBySource: "Leads by Source",
    leadsByStatus: "Leads by Status",
    recentLeads: "Recent Leads",
    viewAll: "View All",
    filters: "Filters",
    allSources: "All Sources",
    allStatuses: "All Statuses",
    allTypes: "All Types",
    search: "Search leads...",
    name: "Name",
    email: "Email",
    company: "Company",
    source: "Source",
    status: "Status",
    score: "Score",
    date: "Date",
    actions: "Actions",
    view: "View",
    edit: "Edit",
    assign: "Assign",
    noLeads: "No leads found",
    individual: "Individual",
    organization: "Organization",
    government: "Government",
    enterprise: "Enterprise",
    new: "New",
    contacted: "Contacted",
    qualified: "Qualified",
    proposal_sent: "Proposal Sent",
    negotiating: "Negotiating",
    won: "Won",
    lost: "Lost",
    nurturing: "Nurturing",
  },
  fr: {
    title: "Tableau de bord CRM",
    subtitle: "Gestion unifiée des prospects à travers l'écosystème Rusinga",
    analytics: "Aperçu analytique",
    totalLeads: "Total des prospects",
    converted: "Convertis",
    conversionRate: "Taux de conversion",
    crossSell: "Opportunités de vente croisée",
    leadsBySource: "Prospects par source",
    leadsByStatus: "Prospects par statut",
    recentLeads: "Prospects récents",
    viewAll: "Voir tout",
    filters: "Filtres",
    allSources: "Toutes les sources",
    allStatuses: "Tous les statuts",
    allTypes: "Tous les types",
    search: "Rechercher des prospects...",
    name: "Nom",
    email: "Courriel",
    company: "Entreprise",
    source: "Source",
    status: "Statut",
    score: "Score",
    date: "Date",
    actions: "Actions",
    view: "Voir",
    edit: "Modifier",
    assign: "Assigner",
    noLeads: "Aucun prospect trouvé",
    individual: "Individuel",
    organization: "Organisation",
    government: "Gouvernement",
    enterprise: "Entreprise",
    new: "Nouveau",
    contacted: "Contacté",
    qualified: "Qualifié",
    proposal_sent: "Proposition envoyée",
    negotiating: "En négociation",
    won: "Gagné",
    lost: "Perdu",
    nurturing: "En nurturing",
  },
};

const sourceColors: Record<string, string> = {
  lingueefy: "bg-teal-500",
  rusingacademy: "bg-[#C65A1E]",
  barholex: "bg-[#C65A1E]",
  ecosystem_hub: "bg-[#E7F2F2]",
  external: "bg-white0",
};

const statusColors: Record<string, string> = {
  new: "bg-blue-500",
  contacted: "bg-cyan-500",
  qualified: "bg-green-500",
  proposal_sent: "bg-yellow-500",
  negotiating: "bg-[#C65A1E]",
  won: "bg-emerald-500",
  lost: "bg-red-500",
  nurturing: "bg-[#E7F2F2]",
};

export default function CRMDashboard() {
  const { language } = useLanguage();
  const t = translations[language];
  
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Filter leads
  const filteredLeads = mockLeads.filter(lead => {
    if (selectedSource !== "all" && lead.source !== selectedSource) return false;
    if (selectedStatus !== "all" && lead.status !== selectedStatus) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        lead.firstName.toLowerCase().includes(query) ||
        lead.lastName.toLowerCase().includes(query) ||
        lead.email.toLowerCase().includes(query) ||
        (lead.company?.toLowerCase().includes(query) ?? false)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
          {t.title}
        </h1>
        <p className="text-slate-400 mt-2">{t.subtitle}</p>
      </motion.div>

      {/* Analytics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {/* Total Leads */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-sm">{t.totalLeads}</span>
            <span className="text-2xl">📊</span>
          </div>
          <div className="text-3xl font-bold">{mockAnalytics.totalLeads}</div>
          <div className="text-green-400 text-sm mt-2">+12% this month</div>
        </div>

        {/* Converted */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-sm">{t.converted}</span>
            <span className="text-2xl">✅</span>
          </div>
          <div className="text-3xl font-bold text-emerald-400">{mockAnalytics.convertedLeads}</div>
          <div className="text-green-400 text-sm mt-2">+5 this week</div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-sm">{t.conversionRate}</span>
            <span className="text-2xl">📈</span>
          </div>
          <div className="text-3xl font-bold text-cyan-400">{mockAnalytics.conversionRate}%</div>
          <div className="text-green-400 text-sm mt-2">+2.3% vs last month</div>
        </div>

        {/* Cross-Sell */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-sm">{t.crossSell}</span>
            <span className="text-2xl">🔗</span>
          </div>
          <div className="text-3xl font-bold text-amber-400">{mockAnalytics.crossSellOpportunities}</div>
          <div className="text-slate-400 text-sm mt-2">{mockAnalytics.convertedCrossSell} converted</div>
        </div>
      </motion.div>

      {/* Charts Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
      >
        {/* Leads by Source */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold mb-4">{t.leadsBySource}</h3>
          <div className="space-y-4">
            {mockAnalytics.leadsBySource.map((item) => (
              <div key={item.source} className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${sourceColors[item.source]}`} />
                <span className="flex-1 capitalize">{item.source.replace("_", " ")}</span>
                <span className="font-semibold">{item.count}</span>
                <div className="w-24 bg-white/10 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${sourceColors[item.source]}`}
                    style={{ width: `${(item.count / mockAnalytics.totalLeads) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leads by Status */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold mb-4">{t.leadsByStatus}</h3>
          <div className="space-y-4">
            {mockAnalytics.leadsByStatus.map((item) => (
              <div key={item.status} className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${statusColors[item.status]}`} />
                <span className="flex-1 capitalize">{t[item.status as keyof typeof t] || item.status}</span>
                <span className="font-semibold">{item.count}</span>
                <div className="w-24 bg-white/10 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${statusColors[item.status]}`}
                    style={{ width: `${(item.count / mockAnalytics.totalLeads) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Leads Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden"
      >
        {/* Filters */}
        <div className="p-6 border-b border-white/10">
          <div className="flex flex-wrap items-center gap-4">
            <h3 className="text-lg font-semibold">{t.recentLeads}</h3>
            <div className="flex-1" />
            
            {/* Search */}
            <input
              type="text"
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 bg-white/10 rounded-lg border border-white/10 focus:border-teal-500 focus:outline-none text-sm w-64"
            />
            
            {/* Source Filter */}
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="px-4 py-2 bg-white/10 rounded-lg border border-white/10 focus:border-teal-500 focus:outline-none text-sm"
            >
              <option value="all">{t.allSources}</option>
              <option value="lingueefy">Lingueefy</option>
              <option value="rusingacademy">RusingAcademy</option>
              <option value="barholex">Barholex Media</option>
              <option value="ecosystem_hub">Ecosystem Hub</option>
            </select>
            
            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 bg-white/10 rounded-lg border border-white/10 focus:border-teal-500 focus:outline-none text-sm"
            >
              <option value="all">{t.allStatuses}</option>
              <option value="new">{t.new}</option>
              <option value="contacted">{t.contacted}</option>
              <option value="qualified">{t.qualified}</option>
              <option value="proposal_sent">{t.proposal_sent}</option>
              <option value="negotiating">{t.negotiating}</option>
              <option value="won">{t.won}</option>
              <option value="lost">{t.lost}</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">{t.name}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">{t.email}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">{t.company}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">{t.source}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">{t.status}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">{t.score}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLeads.map((lead) => (
                <motion.tr
                  key={lead.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => setSelectedLead(lead)}
                >
                  <td className="px-6 py-4">
                    <div className="font-medium">{lead.firstName} {lead.lastName}</div>
                    <div className="text-sm text-slate-400">{lead.jobTitle || t[lead.leadType as keyof typeof t]}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{lead.email}</td>
                  <td className="px-6 py-4 text-slate-300">{lead.company || "-"}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${sourceColors[lead.source]} text-white`}>
                      {lead.source.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[lead.status]} text-white`}>
                      {t[lead.status as keyof typeof t]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-white/10 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${lead.leadScore >= 70 ? 'bg-green-500' : lead.leadScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${lead.leadScore}%` }}
                        />
                      </div>
                      <span className="text-sm">{lead.leadScore}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1 bg-teal-500/20 text-teal-400 rounded-lg text-sm hover:bg-teal-500/30 transition-colors">
                        {t.view}
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          
          {filteredLeads.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              {t.noLeads}
            </div>
          )}
        </div>
      </motion.div>

      {/* Lead Detail Modal */}
      <AnimatePresence>
        {selectedLead && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedLead(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedLead.firstName} {selectedLead.lastName}</h2>
                  <p className="text-slate-400">{selectedLead.email}</p>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-sm text-slate-400 mb-1">{t.source}</div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${sourceColors[selectedLead.source]} text-white`}>
                    {selectedLead.source.replace("_", " ")}
                  </span>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-sm text-slate-400 mb-1">{t.status}</div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[selectedLead.status]} text-white`}>
                    {t[selectedLead.status as keyof typeof t]}
                  </span>
                </div>
                {selectedLead.company && (
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="text-sm text-slate-400 mb-1">{t.company}</div>
                    <div>{selectedLead.company}</div>
                  </div>
                )}
                {selectedLead.phone && (
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="text-sm text-slate-400 mb-1">Phone</div>
                    <div>{selectedLead.phone}</div>
                  </div>
                )}
                {selectedLead.budget && (
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="text-sm text-slate-400 mb-1">Budget</div>
                    <div>{selectedLead.budget}</div>
                  </div>
                )}
                {selectedLead.timeline && (
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="text-sm text-slate-400 mb-1">Timeline</div>
                    <div>{selectedLead.timeline}</div>
                  </div>
                )}
              </div>

              {selectedLead.message && (
                <div className="bg-white/5 rounded-lg p-4 mb-6">
                  <div className="text-sm text-slate-400 mb-2">Message</div>
                  <p>{selectedLead.message}</p>
                </div>
              )}

              {selectedLead.interests && selectedLead.interests.length > 0 && (
                <div className="mb-6">
                  <div className="text-sm text-slate-400 mb-2">Interests</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedLead.interests.map((interest, i) => (
                      <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-sm">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors">
                  {t.edit}
                </button>
                <button className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
                  {t.assign}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
