/**
 * HRBudget — Billing & Budget for Client Portal
 * Shows the client department's training contract budget, spending, and invoicing.
 * Features: Contract budget allocation, spending breakdown, forecasting
 */
import HRLayout from "@/components/HRLayout";
import { useLanguage } from "@/contexts/LanguageContext";

const ACCENT = "#2563eb";

interface BudgetLine {
  id: number;
  category: string;
  allocated: number;
  spent: number;
  committed: number;
  remaining: number;
}

const budgetLines: BudgetLine[] = [
  { id: 1, category: "Coaching Sessions (FSL)", allocated: 20000, spent: 12400, committed: 3200, remaining: 4400 },
  { id: 2, category: "Coaching Sessions (ESL)", allocated: 10000, spent: 6000, committed: 1800, remaining: 2200 },
  { id: 3, category: "SLE Prep Programs", allocated: 8000, spent: 4800, committed: 1200, remaining: 2000 },
  { id: 4, category: "Platform Licenses", allocated: 6000, spent: 5400, committed: 600, remaining: 0 },
  { id: 5, category: "Learning Materials", allocated: 4000, spent: 3600, committed: 0, remaining: 400 },
  { id: 6, category: "Assessment & Testing", allocated: 2000, spent: 2000, committed: 0, remaining: 0 },
];

function formatCurrency(n: number) { return `$${n.toLocaleString()}`; }

export default function HRBudget() {
  const { lang } = useLanguage();
  const totalAllocated = budgetLines.reduce((s, b) => s + b.allocated, 0);
  const totalSpent = budgetLines.reduce((s, b) => s + b.spent, 0);
  const totalCommitted = budgetLines.reduce((s, b) => s + b.committed, 0);
  const totalRemaining = budgetLines.reduce((s, b) => s + b.remaining, 0);

  return (
    <HRLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
            {lang === "fr" ? "Facturation et budget" : "Billing & Budget"}
          </h1>
          <p className="text-sm text-gray-500">{lang === "fr" ? "Contrat de formation — Exercice financier 2025-2026" : "Training Contract — Fiscal Year 2025-2026"}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { icon: "account_balance", label: lang === "fr" ? "Budget total" : "Total Budget", value: formatCurrency(totalAllocated), color: ACCENT },
            { icon: "payments", label: lang === "fr" ? "Dépensé" : "Spent", value: formatCurrency(totalSpent), color: "#dc2626" },
            { icon: "schedule", label: lang === "fr" ? "Engagé" : "Committed", value: formatCurrency(totalCommitted), color: "#d97706" },
            { icon: "savings", label: lang === "fr" ? "Disponible" : "Available", value: formatCurrency(totalRemaining), color: "#059669" },
          ].map(card => (
            <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${card.color}10` }}>
                <span className="material-icons text-xl" style={{ color: card.color }}>{card.icon}</span>
              </div>
              <p className="text-xs text-gray-500 mb-1">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-[10px] text-gray-400 mt-1">{Math.round((card.label.includes("Dépensé") || card.label.includes("Spent") ? totalSpent / totalAllocated : totalRemaining / totalAllocated) * 100)}% {lang === "fr" ? "du total" : "of total"}</p>
            </div>
          ))}
        </div>

        {/* Budget Utilization Bar */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-3">{lang === "fr" ? "Utilisation du budget" : "Budget Utilization"}</h2>
          <div className="h-6 bg-gray-100 rounded-full overflow-hidden flex">
            <div className="h-full bg-[#dc2626] transition-all" style={{ width: `${(totalSpent / totalAllocated) * 100}%` }} title={`Spent: ${formatCurrency(totalSpent)}`} />
            <div className="h-full bg-[#d97706] transition-all" style={{ width: `${(totalCommitted / totalAllocated) * 100}%` }} title={`Committed: ${formatCurrency(totalCommitted)}`} />
            <div className="h-full bg-[#059669] transition-all" style={{ width: `${(totalRemaining / totalAllocated) * 100}%` }} title={`Available: ${formatCurrency(totalRemaining)}`} />
          </div>
          <div className="flex gap-6 mt-2 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#dc2626]" />{lang === "fr" ? "Dépensé" : "Spent"} ({Math.round((totalSpent / totalAllocated) * 100)}%)</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#d97706]" />{lang === "fr" ? "Engagé" : "Committed"} ({Math.round((totalCommitted / totalAllocated) * 100)}%)</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#059669]" />{lang === "fr" ? "Disponible" : "Available"} ({Math.round((totalRemaining / totalAllocated) * 100)}%)</span>
          </div>
        </div>

        {/* Budget Detail Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium">{lang === "fr" ? "Catégorie" : "Category"}</th>
                  <th className="text-right py-3 px-4 text-xs text-gray-500 font-medium">{lang === "fr" ? "Alloué" : "Allocated"}</th>
                  <th className="text-right py-3 px-4 text-xs text-gray-500 font-medium">{lang === "fr" ? "Dépensé" : "Spent"}</th>
                  <th className="text-right py-3 px-4 text-xs text-gray-500 font-medium">{lang === "fr" ? "Engagé" : "Committed"}</th>
                  <th className="text-right py-3 px-4 text-xs text-gray-500 font-medium">{lang === "fr" ? "Restant" : "Remaining"}</th>
                  <th className="text-center py-3 px-4 text-xs text-gray-500 font-medium">{lang === "fr" ? "Utilisation" : "Utilization"}</th>
                </tr>
              </thead>
              <tbody>
                {budgetLines.map(line => {
                  const utilPct = Math.round(((line.spent + line.committed) / line.allocated) * 100);
                  return (
                    <tr key={line.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{line.category}</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-700">{formatCurrency(line.allocated)}</td>
                      <td className="py-3 px-4 text-right text-sm text-red-600 font-medium">{formatCurrency(line.spent)}</td>
                      <td className="py-3 px-4 text-right text-sm text-amber-600">{formatCurrency(line.committed)}</td>
                      <td className="py-3 px-4 text-right text-sm text-green-600 font-medium">{formatCurrency(line.remaining)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${utilPct}%`, backgroundColor: utilPct >= 90 ? "#dc2626" : utilPct >= 70 ? "#d97706" : ACCENT }} />
                          </div>
                          <span className="text-xs text-gray-600 w-8">{utilPct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t border-gray-200 font-semibold">
                  <td className="py-3 px-4 text-sm text-gray-900">{lang === "fr" ? "Total" : "Total"}</td>
                  <td className="py-3 px-4 text-right text-sm text-gray-900">{formatCurrency(totalAllocated)}</td>
                  <td className="py-3 px-4 text-right text-sm text-red-600">{formatCurrency(totalSpent)}</td>
                  <td className="py-3 px-4 text-right text-sm text-amber-600">{formatCurrency(totalCommitted)}</td>
                  <td className="py-3 px-4 text-right text-sm text-green-600">{formatCurrency(totalRemaining)}</td>
                  <td className="py-3 px-4 text-center text-sm text-gray-900">{Math.round(((totalSpent + totalCommitted) / totalAllocated) * 100)}%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </HRLayout>
  );
}
