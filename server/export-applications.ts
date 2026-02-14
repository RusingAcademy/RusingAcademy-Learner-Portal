/**
 * Export coach applications to CSV format
 */

interface ApplicationExportData {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  city?: string;
  teachingLanguage: string;
  yearsTeaching?: number;
  status: string;
  createdAt: Date;
  reviewedAt?: Date;
  reviewNotes?: string;
  headline?: string;
  bio?: string;
  certifications?: string;
  hourlyRate?: number;
  trialRate?: number;
}

/**
 * Escape CSV field values
 */
function escapeCSVField(field: any): string {
  if (field === null || field === undefined) {
    return "";
  }
  const str = String(field);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Format date for CSV
 */
function formatDateForCSV(date: Date | undefined): string {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
}

/**
 * Generate CSV content from applications
 */
export function generateApplicationsCSV(applications: ApplicationExportData[]): string {
  const headers = [
    "ID",
    "Full Name",
    "Email",
    "Phone",
    "City",
    "Teaching Language",
    "Years Teaching",
    "Status",
    "Applied Date",
    "Reviewed Date",
    "Review Notes",
    "Headline",
    "Bio",
    "Certifications",
    "Hourly Rate (CAD)",
    "Trial Rate (CAD)",
  ];

  const rows = applications.map((app) => [
    escapeCSVField(app.id),
    escapeCSVField(app.fullName),
    escapeCSVField(app.email),
    escapeCSVField(app.phone),
    escapeCSVField(app.city),
    escapeCSVField(app.teachingLanguage),
    escapeCSVField(app.yearsTeaching || ""),
    escapeCSVField(app.status),
    escapeCSVField(formatDateForCSV(app.createdAt)),
    escapeCSVField(formatDateForCSV(app.reviewedAt)),
    escapeCSVField(app.reviewNotes),
    escapeCSVField(app.headline),
    escapeCSVField(app.bio),
    escapeCSVField(app.certifications),
    escapeCSVField(app.hourlyRate ? (app.hourlyRate / 100).toFixed(2) : ""),
    escapeCSVField(app.trialRate ? (app.trialRate / 100).toFixed(2) : ""),
  ]);

  const csvContent = [
    headers.map(escapeCSVField).join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  return csvContent;
}

/**
 * Generate filename for export
 */
export function generateExportFilename(
  status?: string,
  startDate?: Date,
  endDate?: Date
): string {
  const timestamp = new Date().toISOString().split("T")[0];
  let filename = `coach-applications-${timestamp}`;

  if (status && status !== "all") {
    filename += `-${status}`;
  }

  if (startDate && endDate) {
    const start = startDate.toISOString().split("T")[0];
    const end = endDate.toISOString().split("T")[0];
    filename += `-${start}-to-${end}`;
  }

  return `${filename}.csv`;
}

/**
 * Create a downloadable blob from CSV content
 */
export function createCSVBlob(csvContent: string): Blob {
  return new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
}

/**
 * Trigger download of CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = createCSVBlob(csvContent);
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
