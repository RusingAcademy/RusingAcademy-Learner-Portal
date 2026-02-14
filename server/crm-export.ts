/**
 * CRM Analytics Export System
 * 
 * Provides CSV and summary report generation for leads
 * with filtering by date range, source, and status
 */

// Types
interface Lead {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  jobTitle?: string | null;
  source: string;
  formType: string;
  leadType: string;
  status: string;
  message?: string | null;
  budget?: string | null;
  timeline?: string | null;
  leadScore: number;
  createdAt: Date;
  updatedAt: Date;
  assignedUserId?: number | null;
  assignedUserName?: string | null;
}

interface ExportFilters {
  startDate?: Date;
  endDate?: Date;
  sources?: string[];
  statuses?: string[];
  leadTypes?: string[];
  minScore?: number;
  maxScore?: number;
}

interface ExportSummary {
  totalLeads: number;
  bySource: Record<string, number>;
  byStatus: Record<string, number>;
  byLeadType: Record<string, number>;
  averageScore: number;
  scoreDistribution: {
    hot: number;
    warm: number;
    cold: number;
  };
  conversionRate: number;
  dateRange: {
    start: string;
    end: string;
  };
}

// Status display names
const STATUS_NAMES: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal_sent: "Proposal Sent",
  negotiating: "Negotiating",
  won: "Won",
  lost: "Lost",
  nurturing: "Nurturing",
};

// Source display names
const SOURCE_NAMES: Record<string, string> = {
  lingueefy: "Lingueefy",
  rusingacademy: "RusingAcademy",
  barholex: "Barholex Media",
  ecosystem_hub: "Ecosystem Hub",
  external: "External",
};

// Lead type display names
const LEAD_TYPE_NAMES: Record<string, string> = {
  individual: "Individual",
  organization: "Organization",
  government: "Government",
  enterprise: "Enterprise",
};

/**
 * Filter leads based on criteria
 */
export function filterLeads(leads: Lead[], filters: ExportFilters): Lead[] {
  return leads.filter(lead => {
    // Date range filter
    if (filters.startDate && new Date(lead.createdAt) < filters.startDate) {
      return false;
    }
    if (filters.endDate && new Date(lead.createdAt) > filters.endDate) {
      return false;
    }
    
    // Source filter
    if (filters.sources && filters.sources.length > 0) {
      if (!filters.sources.includes(lead.source)) {
        return false;
      }
    }
    
    // Status filter
    if (filters.statuses && filters.statuses.length > 0) {
      if (!filters.statuses.includes(lead.status)) {
        return false;
      }
    }
    
    // Lead type filter
    if (filters.leadTypes && filters.leadTypes.length > 0) {
      if (!filters.leadTypes.includes(lead.leadType)) {
        return false;
      }
    }
    
    // Score range filter
    if (filters.minScore !== undefined && lead.leadScore < filters.minScore) {
      return false;
    }
    if (filters.maxScore !== undefined && lead.leadScore > filters.maxScore) {
      return false;
    }
    
    return true;
  });
}

/**
 * Generate CSV content from leads
 */
export function generateLeadsCSV(leads: Lead[]): string {
  // CSV headers
  const headers = [
    "ID",
    "First Name",
    "Last Name",
    "Email",
    "Phone",
    "Company",
    "Job Title",
    "Source",
    "Form Type",
    "Lead Type",
    "Status",
    "Lead Score",
    "Budget",
    "Timeline",
    "Message",
    "Assigned To",
    "Created At",
    "Updated At",
  ];
  
  // Escape CSV field
  const escapeCSV = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined) return "";
    const str = String(value);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  
  // Generate rows
  const rows = leads.map(lead => [
    lead.id,
    escapeCSV(lead.firstName),
    escapeCSV(lead.lastName),
    escapeCSV(lead.email),
    escapeCSV(lead.phone),
    escapeCSV(lead.company),
    escapeCSV(lead.jobTitle),
    escapeCSV(SOURCE_NAMES[lead.source] || lead.source),
    escapeCSV(lead.formType),
    escapeCSV(LEAD_TYPE_NAMES[lead.leadType] || lead.leadType),
    escapeCSV(STATUS_NAMES[lead.status] || lead.status),
    lead.leadScore,
    escapeCSV(lead.budget),
    escapeCSV(lead.timeline),
    escapeCSV(lead.message),
    escapeCSV(lead.assignedUserName),
    new Date(lead.createdAt).toISOString(),
    new Date(lead.updatedAt).toISOString(),
  ].join(","));
  
  return [headers.join(","), ...rows].join("\n");
}

/**
 * Generate summary statistics
 */
export function generateSummary(leads: Lead[], filters: ExportFilters): ExportSummary {
  // Count by source
  const bySource: Record<string, number> = {};
  leads.forEach(lead => {
    bySource[lead.source] = (bySource[lead.source] || 0) + 1;
  });
  
  // Count by status
  const byStatus: Record<string, number> = {};
  leads.forEach(lead => {
    byStatus[lead.status] = (byStatus[lead.status] || 0) + 1;
  });
  
  // Count by lead type
  const byLeadType: Record<string, number> = {};
  leads.forEach(lead => {
    byLeadType[lead.leadType] = (byLeadType[lead.leadType] || 0) + 1;
  });
  
  // Calculate average score
  const totalScore = leads.reduce((sum, lead) => sum + lead.leadScore, 0);
  const averageScore = leads.length > 0 ? Math.round(totalScore / leads.length) : 0;
  
  // Score distribution
  const scoreDistribution = {
    hot: leads.filter(l => l.leadScore >= 70).length,
    warm: leads.filter(l => l.leadScore >= 40 && l.leadScore < 70).length,
    cold: leads.filter(l => l.leadScore < 40).length,
  };
  
  // Conversion rate (won / total)
  const wonCount = byStatus["won"] || 0;
  const conversionRate = leads.length > 0 ? Math.round((wonCount / leads.length) * 100 * 10) / 10 : 0;
  
  // Date range
  const dates = leads.map(l => new Date(l.createdAt).getTime());
  const minDate = dates.length > 0 ? new Date(Math.min(...dates)) : new Date();
  const maxDate = dates.length > 0 ? new Date(Math.max(...dates)) : new Date();
  
  return {
    totalLeads: leads.length,
    bySource,
    byStatus,
    byLeadType,
    averageScore,
    scoreDistribution,
    conversionRate,
    dateRange: {
      start: filters.startDate?.toISOString().split("T")[0] || minDate.toISOString().split("T")[0],
      end: filters.endDate?.toISOString().split("T")[0] || maxDate.toISOString().split("T")[0],
    },
  };
}

/**
 * Generate summary CSV
 */
export function generateSummaryCSV(summary: ExportSummary): string {
  const lines: string[] = [];
  
  lines.push("CRM Analytics Summary Report");
  lines.push(`Date Range,${summary.dateRange.start} to ${summary.dateRange.end}`);
  lines.push("");
  
  lines.push("Overview");
  lines.push(`Total Leads,${summary.totalLeads}`);
  lines.push(`Average Score,${summary.averageScore}`);
  lines.push(`Conversion Rate,${summary.conversionRate}%`);
  lines.push("");
  
  lines.push("Score Distribution");
  lines.push(`Hot (70+),${summary.scoreDistribution.hot}`);
  lines.push(`Warm (40-69),${summary.scoreDistribution.warm}`);
  lines.push(`Cold (<40),${summary.scoreDistribution.cold}`);
  lines.push("");
  
  lines.push("Leads by Source");
  Object.entries(summary.bySource).forEach(([source, count]) => {
    lines.push(`${SOURCE_NAMES[source] || source},${count}`);
  });
  lines.push("");
  
  lines.push("Leads by Status");
  Object.entries(summary.byStatus).forEach(([status, count]) => {
    lines.push(`${STATUS_NAMES[status] || status},${count}`);
  });
  lines.push("");
  
  lines.push("Leads by Type");
  Object.entries(summary.byLeadType).forEach(([type, count]) => {
    lines.push(`${LEAD_TYPE_NAMES[type] || type},${count}`);
  });
  
  return lines.join("\n");
}

/**
 * Generate HTML report for PDF conversion
 */
export function generateHTMLReport(leads: Lead[], summary: ExportSummary): string {
  const sourceRows = Object.entries(summary.bySource)
    .map(([source, count]) => `
      <tr>
        <td>${SOURCE_NAMES[source] || source}</td>
        <td>${count}</td>
        <td>${Math.round((count / summary.totalLeads) * 100)}%</td>
      </tr>
    `).join("");
  
  const statusRows = Object.entries(summary.byStatus)
    .map(([status, count]) => `
      <tr>
        <td>${STATUS_NAMES[status] || status}</td>
        <td>${count}</td>
        <td>${Math.round((count / summary.totalLeads) * 100)}%</td>
      </tr>
    `).join("");
  
  const topLeads = [...leads]
    .sort((a, b) => b.leadScore - a.leadScore)
    .slice(0, 10)
    .map(lead => `
      <tr>
        <td>${lead.firstName} ${lead.lastName}</td>
        <td>${lead.company || "-"}</td>
        <td>${SOURCE_NAMES[lead.source] || lead.source}</td>
        <td><strong>${lead.leadScore}</strong></td>
        <td>${STATUS_NAMES[lead.status] || lead.status}</td>
      </tr>
    `).join("");
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>CRM Analytics Report</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      color: #1e293b;
    }
    h1 {
      color: #009688;
      border-bottom: 3px solid #009688;
      padding-bottom: 10px;
    }
    h2 {
      color: #334155;
      margin-top: 30px;
    }
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin: 20px 0;
    }
    .card {
      background: #f8fafc;
      border-radius: 8px;
      padding: 15px;
      text-align: center;
    }
    .card-value {
      font-size: 28px;
      font-weight: bold;
      color: #009688;
    }
    .card-label {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    th, td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }
    th {
      background: #f1f5f9;
      font-weight: 600;
      color: #475569;
    }
    .score-hot { color: #10b981; }
    .score-warm { color: #f59e0b; }
    .score-cold { color: #ef4444; }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      color: #64748b;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <h1>CRM Analytics Report</h1>
  <p style="color: #64748b;">
    Report Period: ${summary.dateRange.start} to ${summary.dateRange.end}<br>
    Generated: ${new Date().toISOString().split("T")[0]}
  </p>
  
  <div class="summary-cards">
    <div class="card">
      <div class="card-value">${summary.totalLeads}</div>
      <div class="card-label">Total Leads</div>
    </div>
    <div class="card">
      <div class="card-value">${summary.averageScore}</div>
      <div class="card-label">Avg Score</div>
    </div>
    <div class="card">
      <div class="card-value">${summary.conversionRate}%</div>
      <div class="card-label">Conversion</div>
    </div>
    <div class="card">
      <div class="card-value">${summary.scoreDistribution.hot}</div>
      <div class="card-label">Hot Leads</div>
    </div>
  </div>
  
  <h2>Score Distribution</h2>
  <table>
    <tr>
      <th>Category</th>
      <th>Count</th>
      <th>Percentage</th>
    </tr>
    <tr>
      <td><span class="score-hot">● Hot (70+)</span></td>
      <td>${summary.scoreDistribution.hot}</td>
      <td>${Math.round((summary.scoreDistribution.hot / summary.totalLeads) * 100)}%</td>
    </tr>
    <tr>
      <td><span class="score-warm">● Warm (40-69)</span></td>
      <td>${summary.scoreDistribution.warm}</td>
      <td>${Math.round((summary.scoreDistribution.warm / summary.totalLeads) * 100)}%</td>
    </tr>
    <tr>
      <td><span class="score-cold">● Cold (&lt;40)</span></td>
      <td>${summary.scoreDistribution.cold}</td>
      <td>${Math.round((summary.scoreDistribution.cold / summary.totalLeads) * 100)}%</td>
    </tr>
  </table>
  
  <h2>Leads by Source</h2>
  <table>
    <tr>
      <th>Source</th>
      <th>Count</th>
      <th>Percentage</th>
    </tr>
    ${sourceRows}
  </table>
  
  <h2>Leads by Status</h2>
  <table>
    <tr>
      <th>Status</th>
      <th>Count</th>
      <th>Percentage</th>
    </tr>
    ${statusRows}
  </table>
  
  <h2>Top 10 Leads by Score</h2>
  <table>
    <tr>
      <th>Name</th>
      <th>Company</th>
      <th>Source</th>
      <th>Score</th>
      <th>Status</th>
    </tr>
    ${topLeads}
  </table>
  
  <div class="footer">
    <p>© 2026 Rusinga International Consulting Ltd. | Lingueefy CRM</p>
  </div>
</body>
</html>
  `;
}

/**
 * Export leads with all formats
 */
export function exportLeads(
  leads: Lead[],
  filters: ExportFilters,
  format: "csv" | "summary" | "html"
): string {
  const filteredLeads = filterLeads(leads, filters);
  const summary = generateSummary(filteredLeads, filters);
  
  switch (format) {
    case "csv":
      return generateLeadsCSV(filteredLeads);
    case "summary":
      return generateSummaryCSV(summary);
    case "html":
      return generateHTMLReport(filteredLeads, summary);
    default:
      return generateLeadsCSV(filteredLeads);
  }
}
