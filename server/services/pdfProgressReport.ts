/**
 * PDF Progress Report Generator
 * Generates downloadable PDF progress reports for learners and managers.
 * Uses HTML template rendered server-side, then converted to PDF via Puppeteer-free approach.
 * 
 * For production: generates HTML that can be printed to PDF via browser's print dialog.
 * The server returns structured HTML that the frontend renders and triggers print.
 */
import { getDb } from "../db";
import { sql } from "drizzle-orm";

export interface ProgressReportData {
  learner: {
    name: string;
    email: string;
    currentLevel: string;
    joinDate: string;
  };
  gamification: {
    totalXp: number;
    level: number;
    currentStreak: number;
    longestStreak: number;
    badgesEarned: number;
    totalBadges: number;
  };
  sleProgress: {
    sessionsCompleted: number;
    averageScore: number;
    targetLevel: string;
    skillBreakdown: { skill: string; score: number; sessions: number }[];
  };
  coachingSessions: {
    total: number;
    completed: number;
    averageRating: number;
    hoursLogged: number;
  };
  courseProgress: {
    enrolled: number;
    completed: number;
    inProgress: number;
    completionRate: number;
  };
  recentActivity: {
    date: string;
    type: string;
    description: string;
    xpEarned: number;
  }[];
  generatedAt: string;
  periodStart: string;
  periodEnd: string;
}

/**
 * Gather all progress data for a learner
 */
export async function gatherProgressData(
  userId: number,
  periodDays: number = 30
): Promise<ProgressReportData | null> {
  const db = await getDb();
  if (!db) return null;

  // Get user info
  const [userRows] = await db.execute(sql`
    SELECT u.name, u.email, u.createdAt,
           lp.currentLevel
    FROM users u
    LEFT JOIN learner_profiles lp ON lp.userId = u.id
    WHERE u.id = ${userId}
  `);
  const user = (userRows as unknown as any[])?.[0];
  if (!user) return null;

  // Get gamification data
  const [xpRows] = await db.execute(sql`
    SELECT totalXp, level, currentStreak, longestStreak, lastActivityDate
    FROM learner_xp WHERE userId = ${userId}
  `);
  const xpData = (xpRows as unknown as any[])?.[0] || {};

  // Get badges count
  const [badgeRows] = await db.execute(sql`
    SELECT COUNT(*) as earned FROM learner_badges WHERE userId = ${userId}
  `);
  const badgesEarned = Number((badgeRows as unknown as any[])?.[0]?.earned) || 0;

  const [totalBadgeRows] = await db.execute(sql`
    SELECT COUNT(DISTINCT badgeType) as total FROM learner_badges
  `);
  const totalBadges = Math.max(Number((totalBadgeRows as unknown as any[])?.[0]?.total) || 20, 20);

  // Get SLE companion sessions
  const [sleRows] = await db.execute(sql`
    SELECT 
      COUNT(*) as sessionsCompleted,
      COALESCE(AVG(averageScore), 0) as avgScore,
      targetLevel,
      skillType
    FROM sle_companion_sessions
    WHERE userId = ${userId}
      AND createdAt >= DATE_SUB(NOW(), INTERVAL ${periodDays} DAY)
    GROUP BY targetLevel, skillType
  `);
  const sleData = sleRows as unknown as any[];
  const totalSleSessions = sleData.reduce((sum, r) => sum + Number(r.sessionsCompleted), 0);
  const avgSleScore = sleData.length > 0
    ? sleData.reduce((sum, r) => sum + Number(r.avgScore) * Number(r.sessionsCompleted), 0) / totalSleSessions
    : 0;

  const skillBreakdown = sleData.map((r) => ({
    skill: r.skillType || "general",
    score: Math.round(Number(r.avgScore)),
    sessions: Number(r.sessionsCompleted),
  }));

  // Get coaching sessions
  const [sessionRows] = await db.execute(sql`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
      AVG(CASE WHEN sr.rating IS NOT NULL THEN sr.rating END) as avgRating
    FROM sessions s
    LEFT JOIN session_reviews sr ON sr.sessionId = s.id
    WHERE s.learnerId = (SELECT id FROM learner_profiles WHERE userId = ${userId})
      AND s.scheduledAt >= DATE_SUB(NOW(), INTERVAL ${periodDays} DAY)
  `);
  const sessionData = (sessionRows as unknown as any[])?.[0] || {};

  // Get course progress
  const [courseRows] = await db.execute(sql`
    SELECT 
      COUNT(*) as enrolled,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as inProgress
    FROM course_enrollments
    WHERE userId = ${userId}
  `);
  const courseData = (courseRows as unknown as any[])?.[0] || {};

  // Get recent XP activity
  const [activityRows] = await db.execute(sql`
    SELECT 
      createdAt as date,
      transactionType as type,
      description,
      xpAmount as xpEarned
    FROM xp_transactions
    WHERE userId = ${userId}
      AND createdAt >= DATE_SUB(NOW(), INTERVAL ${periodDays} DAY)
    ORDER BY createdAt DESC
    LIMIT 20
  `);

  const periodEnd = new Date();
  const periodStart = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

  return {
    learner: {
      name: user.name || "Learner",
      email: user.email || "",
      currentLevel: user.currentLevel || "—",
      joinDate: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
    },
    gamification: {
      totalXp: Number(xpData.totalXp) || 0,
      level: Number(xpData.level) || 1,
      currentStreak: Number(xpData.currentStreak) || 0,
      longestStreak: Number(xpData.longestStreak) || 0,
      badgesEarned,
      totalBadges,
    },
    sleProgress: {
      sessionsCompleted: totalSleSessions,
      averageScore: Math.round(avgSleScore),
      targetLevel: sleData[0]?.targetLevel || "B",
      skillBreakdown,
    },
    coachingSessions: {
      total: Number(sessionData.total) || 0,
      completed: Number(sessionData.completed) || 0,
      averageRating: sessionData.avgRating ? Number(Number(sessionData.avgRating).toFixed(1)) : 0,
      hoursLogged: Number(sessionData.completed) || 0, // 1 hour per session approximation
    },
    courseProgress: {
      enrolled: Number(courseData.enrolled) || 0,
      completed: Number(courseData.completed) || 0,
      inProgress: Number(courseData.inProgress) || 0,
      completionRate: Number(courseData.enrolled) > 0
        ? Math.round((Number(courseData.completed) / Number(courseData.enrolled)) * 100)
        : 0,
    },
    recentActivity: (activityRows as unknown as any[]).map((a) => ({
      date: a.date ? new Date(a.date).toISOString() : new Date().toISOString(),
      type: a.type || "unknown",
      description: a.description || "",
      xpEarned: Number(a.xpEarned) || 0,
    })),
    generatedAt: new Date().toISOString(),
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
  };
}

/**
 * Generate printable HTML report
 */
export function generateReportHTML(data: ProgressReportData, language: "fr" | "en" = "en"): string {
  const l = language === "fr" ? {
    title: "Rapport de progression",
    subtitle: "Rapport personnalisé",
    period: "Période",
    to: "au",
    generated: "Généré le",
    overview: "Vue d'ensemble",
    xpTotal: "XP Total",
    level: "Niveau",
    streak: "Streak actuel",
    longestStreak: "Plus long streak",
    badges: "Badges obtenus",
    slePerformance: "Performance SLE",
    sessions: "Sessions",
    avgScore: "Score moyen",
    targetLevel: "Niveau cible",
    skillBreakdown: "Répartition par compétence",
    coaching: "Sessions de coaching",
    completed: "Complétées",
    rating: "Note moyenne",
    hoursLogged: "Heures enregistrées",
    courses: "Cours",
    enrolled: "Inscrits",
    completionRate: "Taux de complétion",
    inProgress: "En cours",
    recentActivity: "Activité récente",
    date: "Date",
    activity: "Activité",
    xpEarned: "XP gagné",
    noActivity: "Aucune activité récente",
    footer: "Ce rapport a été généré automatiquement par RusingÂcademy.",
  } : {
    title: "Progress Report",
    subtitle: "Personalized Report",
    period: "Period",
    to: "to",
    generated: "Generated on",
    overview: "Overview",
    xpTotal: "Total XP",
    level: "Level",
    streak: "Current Streak",
    longestStreak: "Longest Streak",
    badges: "Badges Earned",
    slePerformance: "SLE Performance",
    sessions: "Sessions",
    avgScore: "Average Score",
    targetLevel: "Target Level",
    skillBreakdown: "Skill Breakdown",
    coaching: "Coaching Sessions",
    completed: "Completed",
    rating: "Average Rating",
    hoursLogged: "Hours Logged",
    courses: "Courses",
    enrolled: "Enrolled",
    completionRate: "Completion Rate",
    inProgress: "In Progress",
    recentActivity: "Recent Activity",
    date: "Date",
    activity: "Activity",
    xpEarned: "XP Earned",
    noActivity: "No recent activity",
    footer: "This report was automatically generated by RusingÂcademy.",
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(language === "fr" ? "fr-CA" : "en-CA", {
      year: "numeric", month: "long", day: "numeric",
    });
  };

  const scoreColor = (score: number) => {
    if (score >= 70) return "#16a34a";
    if (score >= 55) return "#ca8a04";
    if (score >= 40) return "#ea580c";
    return "#dc2626";
  };

  return `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <title>${l.title} - ${data.learner.name}</title>
  <style>
    @media print { body { margin: 0; } .no-print { display: none; } }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1a1a2e; line-height: 1.6; background: #fff; }
    .container { max-width: 800px; margin: 0 auto; padding: 40px 32px; }
    .header { text-align: center; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 3px solid #2563eb; }
    .header h1 { font-size: 28px; color: #1e3a5f; margin-bottom: 4px; }
    .header .subtitle { font-size: 16px; color: #64748b; }
    .header .period { font-size: 14px; color: #94a3b8; margin-top: 8px; }
    .learner-info { display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 16px 24px; border-radius: 8px; margin-bottom: 24px; }
    .learner-info .name { font-size: 20px; font-weight: 600; color: #1e3a5f; }
    .learner-info .meta { font-size: 13px; color: #64748b; }
    .section { margin-bottom: 28px; }
    .section-title { font-size: 18px; font-weight: 600; color: #1e3a5f; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; }
    .stat-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; text-align: center; }
    .stat-card .value { font-size: 28px; font-weight: 700; color: #2563eb; }
    .stat-card .label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    .skill-bar { display: flex; align-items: center; gap: 12px; padding: 8px 0; }
    .skill-bar .name { width: 100px; font-size: 13px; font-weight: 500; }
    .skill-bar .bar { flex: 1; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
    .skill-bar .fill { height: 100%; border-radius: 4px; transition: width 0.3s; }
    .skill-bar .score { width: 50px; text-align: right; font-size: 13px; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { background: #f1f5f9; padding: 10px 12px; text-align: left; font-weight: 600; color: #475569; border-bottom: 2px solid #e2e8f0; }
    td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; }
    tr:hover { background: #f8fafc; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
    .badge-xp { background: #fef3c7; color: #92400e; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }
    .print-btn { display: block; margin: 0 auto 24px; padding: 10px 32px; background: #2563eb; color: white; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; }
    .print-btn:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <div class="container">
    <button class="print-btn no-print" onclick="window.print()">${language === "fr" ? "Imprimer / Télécharger PDF" : "Print / Download PDF"}</button>
    
    <div class="header">
      <h1>${l.title}</h1>
      <div class="subtitle">${data.learner.name} — ${l.subtitle}</div>
      <div class="period">${l.period}: ${formatDate(data.periodStart)} ${l.to} ${formatDate(data.periodEnd)}</div>
    </div>

    <div class="learner-info">
      <div>
        <div class="name">${data.learner.name}</div>
        <div class="meta">${data.learner.email} • ${l.level} ${data.learner.currentLevel}</div>
      </div>
      <div style="text-align: right;">
        <div class="meta">${l.generated}</div>
        <div class="meta" style="font-weight: 600;">${formatDate(data.generatedAt)}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">${l.overview}</div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="value">${data.gamification.totalXp.toLocaleString()}</div>
          <div class="label">${l.xpTotal}</div>
        </div>
        <div class="stat-card">
          <div class="value">${data.gamification.level}</div>
          <div class="label">${l.level}</div>
        </div>
        <div class="stat-card">
          <div class="value">${data.gamification.currentStreak}d</div>
          <div class="label">${l.streak}</div>
        </div>
        <div class="stat-card">
          <div class="value">${data.gamification.longestStreak}d</div>
          <div class="label">${l.longestStreak}</div>
        </div>
        <div class="stat-card">
          <div class="value">${data.gamification.badgesEarned}/${data.gamification.totalBadges}</div>
          <div class="label">${l.badges}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">${l.slePerformance}</div>
      <div class="stats-grid" style="margin-bottom: 16px;">
        <div class="stat-card">
          <div class="value">${data.sleProgress.sessionsCompleted}</div>
          <div class="label">${l.sessions}</div>
        </div>
        <div class="stat-card">
          <div class="value" style="color: ${scoreColor(data.sleProgress.averageScore)}">${data.sleProgress.averageScore}/100</div>
          <div class="label">${l.avgScore}</div>
        </div>
        <div class="stat-card">
          <div class="value">${data.sleProgress.targetLevel}</div>
          <div class="label">${l.targetLevel}</div>
        </div>
      </div>
      ${data.sleProgress.skillBreakdown.length > 0 ? `
      <div style="margin-top: 12px;">
        <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #475569;">${l.skillBreakdown}</div>
        ${data.sleProgress.skillBreakdown.map(s => `
        <div class="skill-bar">
          <div class="name">${s.skill}</div>
          <div class="bar"><div class="fill" style="width: ${s.score}%; background: ${scoreColor(s.score)};"></div></div>
          <div class="score" style="color: ${scoreColor(s.score)}">${s.score}%</div>
        </div>`).join("")}
      </div>` : ""}
    </div>

    <div class="section">
      <div class="section-title">${l.coaching}</div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="value">${data.coachingSessions.total}</div>
          <div class="label">${l.sessions}</div>
        </div>
        <div class="stat-card">
          <div class="value">${data.coachingSessions.completed}</div>
          <div class="label">${l.completed}</div>
        </div>
        <div class="stat-card">
          <div class="value">${data.coachingSessions.averageRating > 0 ? `${data.coachingSessions.averageRating}★` : "—"}</div>
          <div class="label">${l.rating}</div>
        </div>
        <div class="stat-card">
          <div class="value">${data.coachingSessions.hoursLogged}h</div>
          <div class="label">${l.hoursLogged}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">${l.courses}</div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="value">${data.courseProgress.enrolled}</div>
          <div class="label">${l.enrolled}</div>
        </div>
        <div class="stat-card">
          <div class="value">${data.courseProgress.completed}</div>
          <div class="label">${l.completed}</div>
        </div>
        <div class="stat-card">
          <div class="value">${data.courseProgress.inProgress}</div>
          <div class="label">${l.inProgress}</div>
        </div>
        <div class="stat-card">
          <div class="value">${data.courseProgress.completionRate}%</div>
          <div class="label">${l.completionRate}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">${l.recentActivity}</div>
      ${data.recentActivity.length > 0 ? `
      <table>
        <thead>
          <tr>
            <th>${l.date}</th>
            <th>${l.activity}</th>
            <th style="text-align: right;">${l.xpEarned}</th>
          </tr>
        </thead>
        <tbody>
          ${data.recentActivity.slice(0, 15).map(a => `
          <tr>
            <td>${formatDate(a.date)}</td>
            <td>${a.description || a.type}</td>
            <td style="text-align: right;"><span class="badge badge-xp">+${a.xpEarned} XP</span></td>
          </tr>`).join("")}
        </tbody>
      </table>` : `<p style="text-align: center; color: #94a3b8; padding: 24px;">${l.noActivity}</p>`}
    </div>

    <div class="footer">
      <p>${l.footer}</p>
      <p style="margin-top: 4px;">RusingÂcademy • Lingueefy • Barholex Media</p>
    </div>
  </div>
</body>
</html>`;
}
