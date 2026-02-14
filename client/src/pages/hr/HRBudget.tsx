/**
 * HRBudget — Billing & Budget for Client Portal
 * Connected to real tRPC queries via clientPortal router.
 * Shows the client department's training contract billing and budget.
 */
import HRLayout from "@/components/HRLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";

const ACCENT = "#2563eb";

function formatCurrency(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6 max-w-7xl mx-auto">
      <div className="h-12 bg-gray-100 rounded-xl w-1/3" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-gray-100 rounded-xl" />)}
      </div>
      <div className="h-48 bg-gray-100 rounded-xl" />
    </div>
  );
}

export default function HRBudget() {
  const { lang } = useLanguage();

  const { data: billingStats, isLoading: loadingStats, error } = trpc.clientPortal.getBillingStats.useQuery(undefined, {
    retry: 1,
    staleTime: 60_000,
  });

  const { data: billingRecords, isLoading: loadingRecords } = trpc.clientPortal.getBillingRecords.useQuery(undefined, {
    retry: 1,
    staleTime: 60_000,
  });

  if (error && (error.message.includes("FORBIDDEN") || error.message.includes("hr_manager"))) {
    return (
      <HRLayout>
        <div className="max-w-2xl mx-auto text-center py-16">
          <span className="material-icons text-6xl text-gray-300 mb-4">lock</span>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {lang === "fr" ? "Accès restreint" : "Restricted Access"}
          </h2>
          <p className="text-sm text-gray-500">
            {lang === "fr"
              ? "Contactez votre administrateur RusingÂcademy pour obtenir l'accès."
              : "Contact your RusingÂcademy administrator for access."}
          </p>
        </div>
      </HRLayout>
    );
  }

  if (loadingStats || loadingRecords) return <HRLayout><LoadingSkeleton /></HRLayout>;

  const stats = billingStats ?? { totalInvoiced: 0, totalPaid: 0, totalOverdue: 0, pendingCount: 0 };
  const records = billingRecords ?? [];
  const outstanding = stats.totalInvoiced - stats.totalPaid;

  return (
    <HRLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
            {lang === "fr" ? "Facturation et budget" : "Billing & Budget"}
          </h1>
          <p className="text-sm text-gray-500">
            {lang === "fr" ? "Contrat de formation — Aperçu financier" : "Training Contract — Financial Overview"}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { icon: "receipt_long", label: lang === "fr" ? "Total facturé" : "Total Invoiced", value: formatCurrency(stats.totalInvoiced), color: ACCENT },
            { icon: "payments", label: lang === "fr" ? "Total payé" : "Total Paid", value: formatCurrency(stats.totalPaid), color: "#059669" },
            { icon: "warning", label: lang === "fr" ? "En souffrance" : "Overdue", value: formatCurrency(stats.totalOverdue), color: "#dc2626" },
            { icon: "pending", label: lang === "fr" ? "Factures en attente" : "Pending Invoices", value: String(stats.pendingCount), color: "#d97706" },
          ].map(card => (
            <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${card.color}10` }}>
                <span className="material-icons text-xl" style={{ color: card.color }}>{card.icon}</span>
              </div>
              <p className="text-xs text-gray-500 mb-1">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Payment Progress Bar */}
        {stats.totalInvoiced > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
            <h2 className="text-base font-semibold text-gray-900 mb-3">
              {lang === "fr" ? "Progression des paiements" : "Payment Progress"}
            </h2>
            <div className="h-6 bg-gray-100 rounded-full overflow-hidden flex">
              <div className="h-full bg-[#059669] transition-all" style={{ width: `${(stats.totalPaid / stats.totalInvoiced) * 100}%` }} />
              <div className="h-full bg-[#dc2626] transition-all" style={{ width: `${(stats.totalOverdue / stats.totalInvoiced) * 100}%` }} />
            </div>
            <div className="flex gap-6 mt-2 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-[#059669]" />
                {lang === "fr" ? "Payé" : "Paid"} ({Math.round((stats.totalPaid / stats.totalInvoiced) * 100)}%)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-[#dc2626]" />
                {lang === "fr" ? "En souffrance" : "Overdue"} ({Math.round((stats.totalOverdue / stats.totalInvoiced) * 100)}%)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-gray-200" />
                {lang === "fr" ? "Solde" : "Outstanding"} ({formatCurrency(outstanding)})
              </span>
            </div>
          </div>
        )}

        {/* Billing Records Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              {lang === "fr" ? "Historique de facturation" : "Billing History"}
            </h2>
          </div>
          {records.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-icons text-5xl text-gray-300 mb-3">receipt_long</span>
              <p className="text-sm text-gray-500">
                {lang === "fr" ? "Aucune facture pour le moment." : "No billing records yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium">{lang === "fr" ? "Nº Facture" : "Invoice #"}</th>
                    <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium">{lang === "fr" ? "Description" : "Description"}</th>
                    <th className="text-right py-3 px-4 text-xs text-gray-500 font-medium">{lang === "fr" ? "Montant" : "Amount"}</th>
                    <th className="text-center py-3 px-4 text-xs text-gray-500 font-medium">{lang === "fr" ? "Statut" : "Status"}</th>
                    <th className="text-center py-3 px-4 text-xs text-gray-500 font-medium">{lang === "fr" ? "Échéance" : "Due Date"}</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((rec: any) => {
                    const statusStyles: Record<string, string> = {
                      paid: "bg-green-50 text-green-700 border-green-200",
                      sent: "bg-blue-50 text-blue-700 border-blue-200",
                      overdue: "bg-red-50 text-red-600 border-red-200",
                      draft: "bg-gray-50 text-gray-600 border-gray-200",
                    };
                    const statusLabels: Record<string, { en: string; fr: string }> = {
                      paid: { en: "Paid", fr: "Payé" },
                      sent: { en: "Sent", fr: "Envoyé" },
                      overdue: { en: "Overdue", fr: "En souffrance" },
                      draft: { en: "Draft", fr: "Brouillon" },
                    };
                    return (
                      <tr key={rec.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">{rec.invoiceNumber ?? `INV-${rec.id}`}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{rec.description ?? "—"}</td>
                        <td className="py-3 px-4 text-right text-sm font-medium text-gray-900">{formatCurrency(rec.amount ?? 0)}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusStyles[rec.status] ?? statusStyles.draft}`}>
                            {lang === "fr" ? (statusLabels[rec.status]?.fr ?? rec.status) : (statusLabels[rec.status]?.en ?? rec.status)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-sm text-gray-500">
                          {rec.dueDate ? new Date(rec.dueDate).toLocaleDateString(lang === "fr" ? "fr-CA" : "en-CA") : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </HRLayout>
  );
}
