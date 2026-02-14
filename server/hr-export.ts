/**
 * HR Export Service
 * Generates CSV and PDF reports for HR dashboard
 */

import { getDb } from "./db";
import { learnerProfiles, users, sessions, coachProfiles, courseEnrollments, courses } from "../drizzle/schema";
import { eq, and, gte, lte, desc, sql, inArray } from "drizzle-orm";

export interface ExportFilters {
  departmentId?: number;
  cohortId?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface LearnerProgressData {
  learnerId: number;
  learnerName: string;
  email: string;
  department: string;
  currentSleLevel: string;
  targetSleLevel: string;
  totalSessions: number;
  completedSessions: number;
  averageRating: number;
  totalHours: number;
  enrolledCourses: number;
  completedCourses: number;
  lastSessionDate: string | null;
}

/**
 * Get learner progress data for export
 */
export async function getLearnerProgressData(filters: ExportFilters): Promise<LearnerProgressData[]> {
  const db = await getDb();
  if (!db) return [];

  // Build base query
  let query = db
    .select({
      learnerId: learnerProfiles.id,
      learnerName: users.name,
      email: users.email,
      currentSleLevel: learnerProfiles.currentLevel,
      targetSleLevel: learnerProfiles.targetLevel,
      userId: learnerProfiles.userId,
    })
    .from(learnerProfiles)
    .leftJoin(users, eq(learnerProfiles.userId, users.id));

  const learners = await query;

  // Get session stats for each learner
  const progressData: LearnerProgressData[] = [];

  for (const learner of learners) {
    // Get sessions
    const sessionStats = await db
      .select({
        total: sql<number>`COUNT(*)`,
        completed: sql<number>`SUM(CASE WHEN ${sessions.status} = 'completed' THEN 1 ELSE 0 END)`,
        avgRating: sql<number>`AVG(5)`, // Rating from reviews table, simplified
        totalMinutes: sql<number>`SUM(${sessions.duration})`,
        lastSession: sql<string>`MAX(${sessions.scheduledAt})`,
      })
      .from(sessions)
      .where(eq(sessions.learnerId, learner.learnerId));

    // Get course enrollments
    const courseStats = await db
      .select({
        total: sql<number>`COUNT(*)`,
        completed: sql<number>`SUM(CASE WHEN ${courseEnrollments.status} = 'completed' THEN 1 ELSE 0 END)`,
      })
      .from(courseEnrollments)
      .where(eq(courseEnrollments.userId, learner.userId!));

    // Department not available in current schema
    const deptMember: { departmentName: string }[] = [];

    progressData.push({
      learnerId: learner.learnerId,
      learnerName: learner.learnerName || "Unknown",
      email: learner.email || "",
      department: deptMember[0]?.departmentName || "N/A",
      currentSleLevel: String(learner.currentSleLevel || "N/A"),
      targetSleLevel: String(learner.targetSleLevel || "N/A"),
      totalSessions: Number(sessionStats[0]?.total) || 0,
      completedSessions: Number(sessionStats[0]?.completed) || 0,
      averageRating: Number(sessionStats[0]?.avgRating) || 0,
      totalHours: Math.round((Number(sessionStats[0]?.totalMinutes) || 0) / 60 * 10) / 10,
      enrolledCourses: Number(courseStats[0]?.total) || 0,
      completedCourses: Number(courseStats[0]?.completed) || 0,
      lastSessionDate: sessionStats[0]?.lastSession || null,
    });
  }

  return progressData;
}

/**
 * Generate CSV content from learner progress data
 */
export function generateCSV(data: LearnerProgressData[], language: "en" | "fr" = "en"): string {
  const headers = language === "fr"
    ? [
        "ID Apprenant",
        "Nom",
        "Email",
        "Département",
        "Niveau SLE Actuel",
        "Niveau SLE Cible",
        "Sessions Totales",
        "Sessions Complétées",
        "Note Moyenne",
        "Heures Totales",
        "Cours Inscrits",
        "Cours Complétés",
        "Dernière Session",
      ]
    : [
        "Learner ID",
        "Name",
        "Email",
        "Department",
        "Current SLE Level",
        "Target SLE Level",
        "Total Sessions",
        "Completed Sessions",
        "Average Rating",
        "Total Hours",
        "Enrolled Courses",
        "Completed Courses",
        "Last Session",
      ];

  const rows = data.map((row) => [
    row.learnerId,
    `"${row.learnerName}"`,
    row.email,
    `"${row.department}"`,
    row.currentSleLevel,
    row.targetSleLevel,
    row.totalSessions,
    row.completedSessions,
    row.averageRating.toFixed(1),
    row.totalHours,
    row.enrolledCourses,
    row.completedCourses,
    row.lastSessionDate || "N/A",
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

/**
 * Generate HTML content for PDF export
 */
export function generatePDFHTML(
  data: LearnerProgressData[],
  language: "en" | "fr" = "en",
  reportTitle?: string
): string {
  const isEn = language === "en";
  const title = reportTitle || (isEn ? "Learner Progress Report" : "Rapport de Progression des Apprenants");
  const generatedDate = new Date().toLocaleDateString(isEn ? "en-CA" : "fr-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Calculate summary stats
  const totalLearners = data.length;
  const avgSessions = data.reduce((sum, d) => sum + d.completedSessions, 0) / totalLearners || 0;
  const avgRating = data.reduce((sum, d) => sum + d.averageRating, 0) / totalLearners || 0;
  const totalHours = data.reduce((sum, d) => sum + d.totalHours, 0);

  return `
<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Helvetica Neue', Arial, sans-serif; 
      font-size: 10pt;
      color: #333;
      line-height: 1.4;
    }
    .header {
      background: linear-gradient(135deg, #0F3D3E 0%, #1a5a5c 100%);
      color: white;
      padding: 30px 40px;
      margin-bottom: 30px;
    }
    .header h1 { font-size: 24pt; margin-bottom: 5px; }
    .header p { opacity: 0.9; font-size: 11pt; }
    .container { padding: 0 40px 40px; }
    .summary {
      display: flex;
      gap: 20px;
      margin-bottom: 30px;
    }
    .summary-card {
      flex: 1;
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
    }
    .summary-card .value {
      font-size: 28pt;
      font-weight: bold;
      color: #0F3D3E;
    }
    .summary-card .label {
      font-size: 9pt;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9pt;
    }
    th {
      background: #0F3D3E;
      color: white;
      padding: 12px 8px;
      text-align: left;
      font-weight: 600;
    }
    td {
      padding: 10px 8px;
      border-bottom: 1px solid #eee;
    }
    tr:nth-child(even) { background: #f9f9f9; }
    tr:hover { background: #f0f7f7; }
    .rating {
      color: #f59e0b;
      font-weight: bold;
    }
    .level-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 8pt;
      font-weight: bold;
    }
    .level-a { background: #dcfce7; color: #166534; }
    .level-b { background: #fef3c7; color: #92400e; }
    .level-c { background: #dbeafe; color: #1e40af; }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      text-align: center;
      font-size: 8pt;
      color: #999;
    }
    @media print {
      .header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      th { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
    <p>${isEn ? "Generated on" : "Généré le"} ${generatedDate} | Rusinga International Consulting Ltd.</p>
  </div>
  
  <div class="container">
    <div class="summary">
      <div class="summary-card">
        <div class="value">${totalLearners}</div>
        <div class="label">${isEn ? "Total Learners" : "Apprenants Totaux"}</div>
      </div>
      <div class="summary-card">
        <div class="value">${avgSessions.toFixed(1)}</div>
        <div class="label">${isEn ? "Avg. Sessions" : "Sessions Moy."}</div>
      </div>
      <div class="summary-card">
        <div class="value">${avgRating.toFixed(1)}</div>
        <div class="label">${isEn ? "Avg. Rating" : "Note Moy."}</div>
      </div>
      <div class="summary-card">
        <div class="value">${totalHours.toFixed(0)}</div>
        <div class="label">${isEn ? "Total Hours" : "Heures Totales"}</div>
      </div>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>${isEn ? "Name" : "Nom"}</th>
          <th>${isEn ? "Department" : "Département"}</th>
          <th>${isEn ? "Current" : "Actuel"}</th>
          <th>${isEn ? "Target" : "Cible"}</th>
          <th>${isEn ? "Sessions" : "Sessions"}</th>
          <th>${isEn ? "Rating" : "Note"}</th>
          <th>${isEn ? "Hours" : "Heures"}</th>
          <th>${isEn ? "Courses" : "Cours"}</th>
        </tr>
      </thead>
      <tbody>
        ${data
          .map(
            (row) => `
          <tr>
            <td><strong>${row.learnerName}</strong><br><span style="color:#666;font-size:8pt">${row.email}</span></td>
            <td>${row.department}</td>
            <td><span class="level-badge level-${row.currentSleLevel.charAt(0).toLowerCase()}">${row.currentSleLevel}</span></td>
            <td><span class="level-badge level-${row.targetSleLevel.charAt(0).toLowerCase()}">${row.targetSleLevel}</span></td>
            <td>${row.completedSessions}/${row.totalSessions}</td>
            <td class="rating">${row.averageRating > 0 ? "★ " + row.averageRating.toFixed(1) : "-"}</td>
            <td>${row.totalHours}h</td>
            <td>${row.completedCourses}/${row.enrolledCourses}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} Rusinga International Consulting Ltd. | ${isEn ? "Commercially known as" : "Commercialement connu sous"} RusingÂcademy</p>
      <p>${isEn ? "This report is confidential and intended for internal use only." : "Ce rapport est confidentiel et destiné à un usage interne uniquement."}</p>
    </div>
  </div>
</body>
</html>
  `;
}

export default {
  getLearnerProgressData,
  generateCSV,
  generatePDFHTML,
};
