/**
 * Export Service - Generate PDF and Excel reports for HR Dashboard
 * Supports learner progress reports and compliance reports
 */

// Database access is done through getDb() from db.ts
import { getDb } from "./db";

// Types for export data
interface LearnerExportData {
  name: string;
  email: string;
  department: string;
  currentLevel: string;
  targetLevel: string;
  progress: number;
  sessionsCompleted: number;
  status: string;
}

interface ComplianceExportData {
  department: string;
  compliant: number;
  nonCompliant: number;
  pending: number;
  complianceRate: number;
}

// Generate CSV content
export function generateCSV(
  data: LearnerExportData[],
  language: "en" | "fr" = "en"
): string {
  const headers = language === "fr"
    ? ["Nom", "Courriel", "Département", "Niveau actuel", "Niveau cible", "Progression", "Sessions complétées", "Statut"]
    : ["Name", "Email", "Department", "Current Level", "Target Level", "Progress", "Sessions Completed", "Status"];

  const rows = data.map((row) => [
    row.name,
    row.email,
    row.department,
    row.currentLevel,
    row.targetLevel,
    `${row.progress}%`,
    row.sessionsCompleted.toString(),
    row.status,
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

// Generate HTML for PDF export
export function generateProgressReportHTML(
  data: LearnerExportData[],
  options: {
    language?: "en" | "fr";
    title?: string;
    department?: string;
    dateRange?: { start: string; end: string };
  } = {}
): string {
  const { language = "en", title, department, dateRange } = options;
  
  const labels = {
    en: {
      title: title || "Learner Progress Report",
      company: "Rusinga International Consulting Ltd.",
      generatedOn: "Generated on",
      department: "Department",
      dateRange: "Date Range",
      name: "Name",
      email: "Email",
      currentLevel: "Current Level",
      targetLevel: "Target Level",
      progress: "Progress",
      sessions: "Sessions",
      status: "Status",
      onTrack: "On Track",
      needsAttention: "Needs Attention",
      atRisk: "At Risk",
      summary: "Summary",
      totalLearners: "Total Learners",
      avgProgress: "Average Progress",
      completionRate: "Completion Rate",
    },
    fr: {
      title: title || "Rapport de Progression des Apprenants",
      company: "Rusinga International Consulting Ltd.",
      generatedOn: "Généré le",
      department: "Département",
      dateRange: "Période",
      name: "Nom",
      email: "Courriel",
      currentLevel: "Niveau actuel",
      targetLevel: "Niveau cible",
      progress: "Progression",
      sessions: "Sessions",
      status: "Statut",
      onTrack: "En bonne voie",
      needsAttention: "Attention requise",
      atRisk: "À risque",
      summary: "Résumé",
      totalLearners: "Total apprenants",
      avgProgress: "Progression moyenne",
      completionRate: "Taux de complétion",
    },
  };

  const l = labels[language];
  const avgProgress = data.length > 0 
    ? Math.round(data.reduce((sum, d) => sum + d.progress, 0) / data.length) 
    : 0;
  const onTrackCount = data.filter((d) => d.status === "on-track").length;

  return `
<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <title>${l.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Times New Roman', Times, serif; 
      line-height: 1.5; 
      color: #1a1a1a;
      padding: 40px;
    }
    .header { 
      border-bottom: 3px solid #0F3D3E; 
      padding-bottom: 20px; 
      margin-bottom: 30px; 
    }
    .company { 
      font-size: 12px; 
      color: #666; 
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    h1 { 
      font-size: 24px; 
      color: #0F3D3E; 
      margin: 10px 0; 
    }
    .meta { 
      font-size: 12px; 
      color: #666; 
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }
    .summary-card {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
    }
    .summary-value {
      font-size: 32px;
      font-weight: bold;
      color: #0F3D3E;
    }
    .summary-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
    }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin-top: 20px;
      font-size: 11px;
    }
    th { 
      background: #0F3D3E; 
      color: white; 
      padding: 12px 8px;
      text-align: left;
      font-weight: 600;
    }
    td { 
      border-bottom: 1px solid #e9ecef; 
      padding: 10px 8px;
      vertical-align: middle;
    }
    tr:nth-child(even) { background: #f8f9fa; }
    .progress-bar {
      width: 100%;
      height: 8px;
      background: #e9ecef;
      border-radius: 4px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: #0F3D3E;
      border-radius: 4px;
    }
    .status-on-track { color: #059669; font-weight: 600; }
    .status-needs-attention { color: #d97706; font-weight: 600; }
    .status-at-risk { color: #dc2626; font-weight: 600; }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e9ecef;
      font-size: 10px;
      color: #666;
      text-align: center;
    }
    @media print {
      body { padding: 20px; }
      .summary-grid { page-break-inside: avoid; }
      table { page-break-inside: auto; }
      tr { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <p class="company">${l.company}</p>
    <h1>${l.title}</h1>
    <p class="meta">
      ${l.generatedOn}: ${new Date().toLocaleDateString(language === "fr" ? "fr-CA" : "en-CA", { 
        year: "numeric", month: "long", day: "numeric" 
      })}
      ${department ? ` | ${l.department}: ${department}` : ""}
      ${dateRange ? ` | ${l.dateRange}: ${dateRange.start} - ${dateRange.end}` : ""}
    </p>
  </div>

  <div class="summary-grid">
    <div class="summary-card">
      <div class="summary-value">${data.length}</div>
      <div class="summary-label">${l.totalLearners}</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${avgProgress}%</div>
      <div class="summary-label">${l.avgProgress}</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${Math.round((onTrackCount / data.length) * 100) || 0}%</div>
      <div class="summary-label">${l.completionRate}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>${l.name}</th>
        <th>${l.email}</th>
        <th>${l.currentLevel}</th>
        <th>${l.targetLevel}</th>
        <th style="width: 120px;">${l.progress}</th>
        <th>${l.sessions}</th>
        <th>${l.status}</th>
      </tr>
    </thead>
    <tbody>
      ${data.map((row) => `
        <tr>
          <td><strong>${row.name}</strong></td>
          <td>${row.email}</td>
          <td>${row.currentLevel}</td>
          <td>${row.targetLevel}</td>
          <td>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${row.progress}%;"></div>
              </div>
              <span>${row.progress}%</span>
            </div>
          </td>
          <td>${row.sessionsCompleted}</td>
          <td class="status-${row.status.replace(" ", "-")}">${
            row.status === "on-track" ? l.onTrack :
            row.status === "needs-attention" ? l.needsAttention : l.atRisk
          }</td>
        </tr>
      `).join("")}
    </tbody>
  </table>

  <div class="footer">
    <p>${l.company} - ${language === "fr" ? "Rapport confidentiel" : "Confidential Report"}</p>
  </div>
</body>
</html>
`;
}

// Generate compliance report HTML
export function generateComplianceReportHTML(
  data: ComplianceExportData[],
  options: {
    language?: "en" | "fr";
    organizationTarget?: number;
  } = {}
): string {
  const { language = "en", organizationTarget = 85 } = options;
  
  const labels = {
    en: {
      title: "SLE Compliance Report",
      company: "Rusinga International Consulting Ltd.",
      generatedOn: "Generated on",
      department: "Department",
      compliant: "Compliant",
      nonCompliant: "Non-Compliant",
      pending: "Pending",
      rate: "Compliance Rate",
      target: "Organization Target",
      summary: "Organization Summary",
      totalCompliant: "Total Compliant",
      overallRate: "Overall Rate",
    },
    fr: {
      title: "Rapport de Conformité SLE",
      company: "Rusinga International Consulting Ltd.",
      generatedOn: "Généré le",
      department: "Département",
      compliant: "Conforme",
      nonCompliant: "Non conforme",
      pending: "En attente",
      rate: "Taux de conformité",
      target: "Objectif organisationnel",
      summary: "Résumé organisationnel",
      totalCompliant: "Total conforme",
      overallRate: "Taux global",
    },
  };

  const l = labels[language];
  const totalCompliant = data.reduce((sum, d) => sum + d.compliant, 0);
  const totalNonCompliant = data.reduce((sum, d) => sum + d.nonCompliant, 0);
  const totalPending = data.reduce((sum, d) => sum + d.pending, 0);
  const total = totalCompliant + totalNonCompliant + totalPending;
  const overallRate = total > 0 ? Math.round((totalCompliant / total) * 100) : 0;

  return `
<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <title>${l.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Times New Roman', Times, serif; 
      line-height: 1.5; 
      color: #1a1a1a;
      padding: 40px;
    }
    .header { 
      border-bottom: 3px solid #0F3D3E; 
      padding-bottom: 20px; 
      margin-bottom: 30px; 
    }
    .company { 
      font-size: 12px; 
      color: #666; 
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    h1 { 
      font-size: 24px; 
      color: #0F3D3E; 
      margin: 10px 0; 
    }
    .meta { 
      font-size: 12px; 
      color: #666; 
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }
    .summary-card {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
    }
    .summary-value {
      font-size: 32px;
      font-weight: bold;
      color: #0F3D3E;
    }
    .summary-value.success { color: #059669; }
    .summary-value.warning { color: #d97706; }
    .summary-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
    }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin-top: 20px;
    }
    th { 
      background: #0F3D3E; 
      color: white; 
      padding: 12px 8px;
      text-align: left;
      font-weight: 600;
    }
    td { 
      border-bottom: 1px solid #e9ecef; 
      padding: 10px 8px;
    }
    tr:nth-child(even) { background: #f8f9fa; }
    .rate-cell {
      font-weight: bold;
    }
    .rate-success { color: #059669; }
    .rate-warning { color: #d97706; }
    .rate-danger { color: #dc2626; }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e9ecef;
      font-size: 10px;
      color: #666;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <p class="company">${l.company}</p>
    <h1>${l.title}</h1>
    <p class="meta">
      ${l.generatedOn}: ${new Date().toLocaleDateString(language === "fr" ? "fr-CA" : "en-CA", { 
        year: "numeric", month: "long", day: "numeric" 
      })}
      | ${l.target}: ${organizationTarget}%
    </p>
  </div>

  <div class="summary-grid">
    <div class="summary-card">
      <div class="summary-value">${totalCompliant}</div>
      <div class="summary-label">${l.totalCompliant}</div>
    </div>
    <div class="summary-card">
      <div class="summary-value ${overallRate >= organizationTarget ? 'success' : 'warning'}">${overallRate}%</div>
      <div class="summary-label">${l.overallRate}</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${organizationTarget}%</div>
      <div class="summary-label">${l.target}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>${l.department}</th>
        <th>${l.compliant}</th>
        <th>${l.nonCompliant}</th>
        <th>${l.pending}</th>
        <th>${l.rate}</th>
      </tr>
    </thead>
    <tbody>
      ${data.map((row) => {
        const rateClass = row.complianceRate >= organizationTarget ? 'rate-success' : 
                          row.complianceRate >= 60 ? 'rate-warning' : 'rate-danger';
        return `
          <tr>
            <td><strong>${row.department}</strong></td>
            <td>${row.compliant}</td>
            <td>${row.nonCompliant}</td>
            <td>${row.pending}</td>
            <td class="rate-cell ${rateClass}">${row.complianceRate}%</td>
          </tr>
        `;
      }).join("")}
    </tbody>
  </table>

  <div class="footer">
    <p>${l.company} - ${language === "fr" ? "Rapport confidentiel" : "Confidential Report"}</p>
  </div>
</body>
</html>
`;
}

// Generate Excel-compatible XML (can be opened in Excel)
export function generateExcelXML(
  data: LearnerExportData[],
  language: "en" | "fr" = "en"
): string {
  const headers = language === "fr"
    ? ["Nom", "Courriel", "Département", "Niveau actuel", "Niveau cible", "Progression", "Sessions complétées", "Statut"]
    : ["Name", "Email", "Department", "Current Level", "Target Level", "Progress", "Sessions Completed", "Status"];

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="Header">
      <Font ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#0F3D3E" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="OnTrack">
      <Font ss:Color="#059669" ss:Bold="1"/>
    </Style>
    <Style ss:ID="NeedsAttention">
      <Font ss:Color="#D97706" ss:Bold="1"/>
    </Style>
    <Style ss:ID="AtRisk">
      <Font ss:Color="#DC2626" ss:Bold="1"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="Progress Report">
    <Table>
      <Row>
        ${headers.map((h) => `<Cell ss:StyleID="Header"><Data ss:Type="String">${h}</Data></Cell>`).join("")}
      </Row>
      ${data.map((row) => `
        <Row>
          <Cell><Data ss:Type="String">${row.name}</Data></Cell>
          <Cell><Data ss:Type="String">${row.email}</Data></Cell>
          <Cell><Data ss:Type="String">${row.department}</Data></Cell>
          <Cell><Data ss:Type="String">${row.currentLevel}</Data></Cell>
          <Cell><Data ss:Type="String">${row.targetLevel}</Data></Cell>
          <Cell><Data ss:Type="Number">${row.progress}</Data></Cell>
          <Cell><Data ss:Type="Number">${row.sessionsCompleted}</Data></Cell>
          <Cell ss:StyleID="${row.status === 'on-track' ? 'OnTrack' : row.status === 'needs-attention' ? 'NeedsAttention' : 'AtRisk'}">
            <Data ss:Type="String">${row.status}</Data>
          </Cell>
        </Row>
      `).join("")}
    </Table>
  </Worksheet>
</Workbook>`;
}
