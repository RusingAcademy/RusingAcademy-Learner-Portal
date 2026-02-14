/**
 * AdminCommerce — Commerce management for Admin Control System
 * Features: Revenue overview, subscriptions, transactions, pricing plans
 */
import AdminControlLayout from "@/components/AdminControlLayout";
import { useLanguage } from "@/contexts/LanguageContext";

const ACCENT = "#dc2626";

const transactions = [
  { id: "TXN-001", customer: "Treasury Board", type: "Organization", amount: 4500, plan: "Enterprise", date: "Feb 13", status: "completed" },
  { id: "TXN-002", customer: "Jean-Pierre Lavoie", type: "Individual", amount: 149, plan: "SLE Prep", date: "Feb 12", status: "completed" },
  { id: "TXN-003", customer: "PCO — Privy Council", type: "Organization", amount: 3200, plan: "Team Plan", date: "Feb 11", status: "completed" },
  { id: "TXN-004", customer: "Sarah Mitchell", type: "Individual", amount: 99, plan: "Premium", date: "Feb 10", status: "completed" },
  { id: "TXN-005", customer: "Finance Canada", type: "Organization", amount: 6800, plan: "Enterprise", date: "Feb 9", status: "pending" },
  { id: "TXN-006", customer: "Emily Roberts", type: "Individual", amount: 149, plan: "SLE Prep", date: "Feb 8", status: "refunded" },
];

const plans = [
  { name: "Free", price: "$0", period: "/mo", features: ["2 Paths access", "Basic quizzes", "Progress tracking"], subscribers: 412, color: "#6b7280" },
  { name: "Premium", price: "$99", period: "/mo", features: ["All Paths", "SLE Prep", "AI Companion", "Certificates"], subscribers: 234, color: "#2563eb" },
  { name: "SLE Prep", price: "$149", period: "/mo", features: ["SLE-focused content", "Mock exams", "Coach sessions", "Priority support"], subscribers: 89, color: "#7c3aed" },
  { name: "Enterprise", price: "Custom", period: "", features: ["Unlimited seats", "HR Dashboard", "Compliance reports", "Dedicated coach"], subscribers: 12, color: ACCENT },
];

export default function AdminCommerce() {
  const { lang } = useLanguage();

  return (
    <AdminControlLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
            {lang === "fr" ? "Commerce" : "Commerce"}
          </h1>
          <p className="text-sm text-gray-500">{lang === "fr" ? "Revenus, abonnements et transactions" : "Revenue, subscriptions & transactions"}</p>
        </div>

        {/* Revenue Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { icon: "payments", label: lang === "fr" ? "Revenus (mois)" : "Revenue (month)", value: "$14,820", change: "+15%" },
            { icon: "receipt_long", label: lang === "fr" ? "Transactions" : "Transactions", value: "47", change: "+8" },
            { icon: "card_membership", label: lang === "fr" ? "Abonnés actifs" : "Active Subscribers", value: "747", change: "+23" },
            { icon: "trending_up", label: "MRR", value: "$12,450", change: "+12%" },
          ].map(card => (
            <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${ACCENT}10` }}>
                  <span className="material-icons text-lg" style={{ color: ACCENT }}>{card.icon}</span>
                </div>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-50 text-green-600">{card.change}</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{card.value}</p>
              <p className="text-[10px] text-gray-500">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Pricing Plans */}
        <div className="mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-3">{lang === "fr" ? "Plans tarifaires" : "Pricing Plans"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map(plan => (
              <div key={plan.name} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${plan.color}15` }}>
                  <span className="material-icons text-xl" style={{ color: plan.color }}>workspace_premium</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <p className="text-2xl font-bold mt-1" style={{ color: plan.color }}>
                  {plan.price}<span className="text-sm text-gray-400 font-normal">{plan.period}</span>
                </p>
                <ul className="mt-3 space-y-1.5">
                  {plan.features.map(f => (
                    <li key={f} className="text-xs text-gray-600 flex items-center gap-1.5">
                      <span className="material-icons text-sm" style={{ color: plan.color }}>check</span>{f}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <p className="text-sm font-bold text-gray-900">{plan.subscribers}</p>
                  <p className="text-[10px] text-gray-500">{lang === "fr" ? "abonnés actifs" : "active subscribers"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">{lang === "fr" ? "Transactions récentes" : "Recent Transactions"}</h2>
            <button className="text-xs text-[#dc2626] font-medium hover:underline">{lang === "fr" ? "Voir tout" : "View All"}</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium">ID</th>
                  <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium">{lang === "fr" ? "Client" : "Customer"}</th>
                  <th className="text-center py-3 px-4 text-xs text-gray-500 font-medium">{lang === "fr" ? "Plan" : "Plan"}</th>
                  <th className="text-right py-3 px-4 text-xs text-gray-500 font-medium">{lang === "fr" ? "Montant" : "Amount"}</th>
                  <th className="text-center py-3 px-4 text-xs text-gray-500 font-medium">{lang === "fr" ? "Date" : "Date"}</th>
                  <th className="text-center py-3 px-4 text-xs text-gray-500 font-medium">{lang === "fr" ? "Statut" : "Status"}</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="py-3 px-4 text-xs font-mono text-gray-500">{tx.id}</td>
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-gray-900">{tx.customer}</p>
                      <p className="text-[10px] text-gray-400">{tx.type}</p>
                    </td>
                    <td className="py-3 px-4 text-center text-xs text-gray-600">{tx.plan}</td>
                    <td className="py-3 px-4 text-right text-sm font-semibold text-gray-900">${tx.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center text-xs text-gray-600">{tx.date}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        tx.status === "completed" ? "bg-green-50 text-green-700 border-green-200" :
                        tx.status === "pending" ? "bg-amber-50 text-amber-700 border-amber-200" :
                        "bg-red-50 text-red-600 border-red-200"
                      }`}>{tx.status}</span>
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
