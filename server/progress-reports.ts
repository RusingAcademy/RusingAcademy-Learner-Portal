import { sendEmail } from "./email";
import { getDb } from "./db";
import { learnerProfiles, sessions, aiSessions } from "../drizzle/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";

interface LearnerProgressData {
  learnerName: string;
  learnerEmail: string;
  language: "en" | "fr";
  weekStartDate: Date;
  weekEndDate: Date;
  // Sessions
  sessionsCompleted: number;
  totalSessionMinutes: number;
  coachesWorkedWith: string[];
  // AI Practice
  aiSessionsCompleted: number;
  totalAiMinutes: number;
  aiPracticeTypes: string[];
  // Progress
  currentLevels: {
    oral: string | null;
    written: string | null;
    reading: string | null;
  };
  targetLevels: {
    oral: string | null;
    written: string | null;
    reading: string | null;
  };
  // Achievements
  achievements: string[];
  // Gamification (new)
  gamification: {
    weeklyXpEarned: number;
    totalXp: number;
    currentLevel: number;
    levelTitle: string;
    currentStreak: number;
    longestStreak: number;
    currentMultiplier: number;
    nextMilestone: number | null;
    xpToNextMilestone: number | null;
    recommendedNextStep: string | null;
  } | null;
}

export async function generateWeeklyProgressReport(
  learnerId: number,
  weekStartDate: Date,
  weekEndDate: Date
): Promise<LearnerProgressData | null> {
  const db = await getDb();
  if (!db) return null;

  // Get learner info
  const [learnerProfile] = await db
    .select()
    .from(learnerProfiles)
    .where(eq(learnerProfiles.id, learnerId))
    .limit(1);

  if (!learnerProfile) {
    return null;
  }

  // Get user info
  const { users } = await import("../drizzle/schema");
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, learnerProfile.userId))
    .limit(1);

  if (!user) {
    return null;
  }

  // Get completed sessions for the week
  const completedSessions = await db
    .select({
      count: sql<number>`count(*)`,
      totalMinutes: sql<number>`sum(${sessions.duration})`,
    })
    .from(sessions)
    .where(
      and(
        eq(sessions.learnerId, learnerId),
        eq(sessions.status, "completed"),
        gte(sessions.scheduledAt, weekStartDate),
        lte(sessions.scheduledAt, weekEndDate)
      )
    );

  // Get unique coaches worked with
  const coachesResult = await db
    .selectDistinct({ coachName: sql<string>`coach_name` })
    .from(sessions)
    .where(
      and(
        eq(sessions.learnerId, learnerId),
        eq(sessions.status, "completed"),
        gte(sessions.scheduledAt, weekStartDate),
        lte(sessions.scheduledAt, weekEndDate)
      )
    );

  // Get AI sessions for the week
  const aiSessionsResult = await db
    .select({
      count: sql<number>`count(*)`,
      totalMinutes: sql<number>`sum(duration_minutes)`,
    })
    .from(aiSessions)
    .where(
      and(
        eq(aiSessions.learnerId, learnerId),
        gte(aiSessions.createdAt, weekStartDate),
        lte(aiSessions.createdAt, weekEndDate)
      )
    );

  // Get AI practice types
  const aiTypesResult = await db
    .selectDistinct({ type: aiSessions.sessionType })
    .from(aiSessions)
    .where(
      and(
        eq(aiSessions.learnerId, learnerId),
        gte(aiSessions.createdAt, weekStartDate),
        lte(aiSessions.createdAt, weekEndDate)
      )
    );

  // Calculate achievements
  const achievements: string[] = [];
  const sessionsCount = completedSessions[0]?.count || 0;
  const aiCount = aiSessionsResult[0]?.count || 0;
  const totalMinutes = (completedSessions[0]?.totalMinutes || 0) + (aiSessionsResult[0]?.totalMinutes || 0);

  if (sessionsCount >= 3) {
    achievements.push("Completed 3+ coaching sessions this week!");
  }
  if (aiCount >= 5) {
    achievements.push("Practiced 5+ times with SLE AI Companion!");
  }
  if (totalMinutes >= 120) {
    achievements.push("Practiced for 2+ hours this week!");
  }
  if (sessionsCount > 0 && aiCount > 0) {
    achievements.push("Balanced learning: both coaching and AI practice!");
  }

  // Fetch gamification data
  let gamification: LearnerProgressData["gamification"] = null;
  try {
    const xpResult = await db.execute(
      sql`SELECT totalXp, weeklyXp, currentLevel, levelTitle, currentStreak, longestStreak FROM learner_xp WHERE userId = ${learnerProfile.userId}`
    );
    // @ts-expect-error - TS2352: auto-suppressed during TS cleanup
    const xpRows = xpResult[0] as any[];
    if (xpRows.length > 0) {
      const xpData = xpRows[0];
      const milestones = [100, 250, 500, 1000, 2500, 5000, 10000, 25000];
      const nextMilestone = milestones.find(m => m > (xpData.totalXp || 0)) || null;
      const streakMultiplier = xpData.currentStreak >= 30 ? 2.0 : xpData.currentStreak >= 14 ? 1.75 : xpData.currentStreak >= 7 ? 1.5 : xpData.currentStreak >= 3 ? 1.25 : 1.0;

      // Get a recommendation
      const isEn = (user.preferredLanguage || "en") === "en";
      let recommendedNextStep: string | null = null;
      if (sessionsCount === 0 && aiCount === 0) {
        recommendedNextStep = isEn
          ? "Start with a quick AI practice session to maintain your streak!"
          : "Commencez par une session rapide avec l'IA pour maintenir votre série !";
      } else if (sessionsCount === 0) {
        recommendedNextStep = isEn
          ? "Book a coaching session for personalized feedback on your progress."
          : "Réservez une session de coaching pour un retour personnalisé sur vos progrès.";
      } else if (aiCount < 3) {
        recommendedNextStep = isEn
          ? "Practice more with the SLE AI Companion to reinforce what you learned in coaching."
          : "Pratiquez davantage avec le Compagnon IA ELS pour renforcer vos acquis.";
      }

      gamification = {
        weeklyXpEarned: xpData.weeklyXp || 0,
        totalXp: xpData.totalXp || 0,
        currentLevel: xpData.currentLevel || 1,
        levelTitle: xpData.levelTitle || "Beginner",
        currentStreak: xpData.currentStreak || 0,
        longestStreak: xpData.longestStreak || 0,
        currentMultiplier: streakMultiplier,
        nextMilestone,
        xpToNextMilestone: nextMilestone ? nextMilestone - (xpData.totalXp || 0) : null,
        recommendedNextStep,
      };
    }
  } catch (e) {
    console.error("[Progress Reports] Failed to fetch gamification data:", e);
  }

  return {
    learnerName: user.name || "Learner",
    learnerEmail: user.email || "",
    language: (user.preferredLanguage as "en" | "fr") || "en",
    weekStartDate,
    weekEndDate,
    sessionsCompleted: sessionsCount,
    totalSessionMinutes: completedSessions[0]?.totalMinutes || 0,
    coachesWorkedWith: coachesResult.map((c) => c.coachName).filter(Boolean),
    aiSessionsCompleted: aiCount,
    totalAiMinutes: aiSessionsResult[0]?.totalMinutes || 0,
    aiPracticeTypes: aiTypesResult.map((t) => t.type).filter(Boolean),
    currentLevels: {
      oral: (learnerProfile.currentLevel as Record<string, string> | null)?.oral || null,
      written: (learnerProfile.currentLevel as Record<string, string> | null)?.writing || null,
      reading: (learnerProfile.currentLevel as Record<string, string> | null)?.reading || null,
    },
    targetLevels: {
      oral: (learnerProfile.targetLevel as Record<string, string> | null)?.oral || null,
      written: (learnerProfile.targetLevel as Record<string, string> | null)?.writing || null,
      reading: (learnerProfile.targetLevel as Record<string, string> | null)?.reading || null,
    },
    achievements,
    gamification,
  };
}

export async function sendWeeklyProgressEmail(data: LearnerProgressData): Promise<void> {
  const isEnglish = data.language === "en";

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(isEnglish ? "en-CA" : "fr-CA", {
      month: "long",
      day: "numeric",
    });
  };

  const weekRange = `${formatDate(data.weekStartDate)} - ${formatDate(data.weekEndDate)}`;

  const labels = isEnglish
    ? {
        subject: `Your Weekly Progress Report - ${weekRange}`,
        greeting: `Hi ${data.learnerName}`,
        intro: "Here's your weekly progress summary for your SLE preparation journey:",
        coachingSessions: "Coaching Sessions",
        sessionsCompleted: "Sessions completed",
        totalTime: "Total time",
        minutes: "minutes",
        coachesWorkedWith: "Coaches worked with",
        aiPractice: "SLE AI Companion Practice",
        practiceSessionsCompleted: "Practice sessions",
        practiceTypes: "Practice types",
        currentLevels: "Current Levels",
        targetLevels: "Target Levels",
        oral: "Oral",
        written: "Written",
        reading: "Reading",
        achievements: "This Week's Achievements",
        noAchievements: "Keep practicing to unlock achievements!",
        keepGoing: "Keep up the great work!",
        tips: "Tips for Next Week",
        tip1: "Try to practice at least 30 minutes daily",
        tip2: "Book a coaching session to get personalized feedback",
        tip3: "Use SLE AI Companion for conversation practice between sessions",
        cta: "Continue Your Practice",
        footer: "You're receiving this because you're a Lingueefy learner. Unsubscribe from weekly reports in your dashboard settings.",
        gamificationTitle: "Your XP & Progress",
        xpEarned: "XP earned this week",
        totalXp: "Total XP",
        level: "Level",
        streak: "Current streak",
        days: "days",
        multiplier: "XP Multiplier",
        nextMilestone: "Next milestone",
        xpAway: "XP away",
        recommendedAction: "Recommended Next Step",
      }
    : {
        subject: `Votre rapport de progression hebdomadaire - ${weekRange}`,
        greeting: `Bonjour ${data.learnerName}`,
        intro: "Voici votre résumé hebdomadaire pour votre préparation aux ELS :",
        coachingSessions: "Sessions de coaching",
        sessionsCompleted: "Sessions complétées",
        totalTime: "Temps total",
        minutes: "minutes",
        coachesWorkedWith: "Coachs travaillés avec",
        aiPractice: "Pratique avec SLE AI Companion",
        practiceSessionsCompleted: "Sessions de pratique",
        practiceTypes: "Types de pratique",
        currentLevels: "Niveaux actuels",
        targetLevels: "Niveaux cibles",
        oral: "Oral",
        written: "Écrit",
        reading: "Lecture",
        achievements: "Réalisations de la semaine",
        noAchievements: "Continuez à pratiquer pour débloquer des réalisations !",
        keepGoing: "Continuez votre excellent travail !",
        tips: "Conseils pour la semaine prochaine",
        tip1: "Essayez de pratiquer au moins 30 minutes par jour",
        tip2: "Réservez une session de coaching pour obtenir des commentaires personnalisés",
        tip3: "Utilisez SLE AI Companion pour la pratique de conversation entre les sessions",
        cta: "Continuer votre pratique",
        footer: "Vous recevez ceci parce que vous êtes un apprenant Lingueefy. Désabonnez-vous des rapports hebdomadaires dans les paramètres de votre tableau de bord.",
        gamificationTitle: "Votre XP & Progression",
        xpEarned: "XP gagnés cette semaine",
        totalXp: "XP total",
        level: "Niveau",
        streak: "Série actuelle",
        days: "jours",
        multiplier: "Multiplicateur XP",
        nextMilestone: "Prochain jalon",
        xpAway: "XP restants",
        recommendedAction: "Prochaine étape recommandée",
      };

  const achievementsList =
    data.achievements.length > 0
      ? data.achievements.map((a) => `<li style="margin-bottom: 8px;">🏆 ${a}</li>`).join("")
      : `<li style="color: #6b7280;">${labels.noAchievements}</li>`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #059669; margin: 0;">Lingueefy</h1>
    <p style="color: #6b7280; margin: 5px 0;">${labels.subject}</p>
  </div>

  <p style="font-size: 18px;">${labels.greeting},</p>
  <p>${labels.intro}</p>

  <!-- Coaching Sessions -->
  <div style="background: #f0fdf4; border-radius: 12px; padding: 20px; margin: 20px 0;">
    <h2 style="color: #059669; margin-top: 0; font-size: 18px;">📚 ${labels.coachingSessions}</h2>
    <div style="display: grid; gap: 10px;">
      <div style="display: flex; justify-content: space-between;">
        <span>${labels.sessionsCompleted}:</span>
        <strong>${data.sessionsCompleted}</strong>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span>${labels.totalTime}:</span>
        <strong>${data.totalSessionMinutes} ${labels.minutes}</strong>
      </div>
      ${
        data.coachesWorkedWith.length > 0
          ? `<div style="display: flex; justify-content: space-between;">
              <span>${labels.coachesWorkedWith}:</span>
              <strong>${data.coachesWorkedWith.join(", ")}</strong>
            </div>`
          : ""
      }
    </div>
  </div>

  <!-- AI Practice -->
  <div style="background: #eff6ff; border-radius: 12px; padding: 20px; margin: 20px 0;">
    <h2 style="color: #2563eb; margin-top: 0; font-size: 18px;">🤖 ${labels.aiPractice}</h2>
    <div style="display: grid; gap: 10px;">
      <div style="display: flex; justify-content: space-between;">
        <span>${labels.practiceSessionsCompleted}:</span>
        <strong>${data.aiSessionsCompleted}</strong>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span>${labels.totalTime}:</span>
        <strong>${data.totalAiMinutes} ${labels.minutes}</strong>
      </div>
      ${
        data.aiPracticeTypes.length > 0
          ? `<div style="display: flex; justify-content: space-between;">
              <span>${labels.practiceTypes}:</span>
              <strong>${data.aiPracticeTypes.join(", ")}</strong>
            </div>`
          : ""
      }
    </div>
  </div>

  <!-- Levels Progress -->
  <div style="background: #fefce8; border-radius: 12px; padding: 20px; margin: 20px 0;">
    <h2 style="color: #ca8a04; margin-top: 0; font-size: 18px;">📊 ${labels.currentLevels} → ${labels.targetLevels}</h2>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0;">${labels.oral}</td>
        <td style="text-align: center; font-weight: bold;">${data.currentLevels.oral || "-"}</td>
        <td style="text-align: center;">→</td>
        <td style="text-align: center; font-weight: bold; color: #059669;">${data.targetLevels.oral || "-"}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0;">${labels.written}</td>
        <td style="text-align: center; font-weight: bold;">${data.currentLevels.written || "-"}</td>
        <td style="text-align: center;">→</td>
        <td style="text-align: center; font-weight: bold; color: #059669;">${data.targetLevels.written || "-"}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0;">${labels.reading}</td>
        <td style="text-align: center; font-weight: bold;">${data.currentLevels.reading || "-"}</td>
        <td style="text-align: center;">→</td>
        <td style="text-align: center; font-weight: bold; color: #059669;">${data.targetLevels.reading || "-"}</td>
      </tr>
    </table>
  </div>

  <!-- Achievements -->
  <div style="background: #fdf4ff; border-radius: 12px; padding: 20px; margin: 20px 0;">
    <h2 style="color: #a855f7; margin-top: 0; font-size: 18px;">🎉 ${labels.achievements}</h2>
    <ul style="margin: 0; padding-left: 20px;">
      ${achievementsList}
    </ul>
  </div>

  ${data.gamification ? `
  <!-- Gamification / XP Progress -->
  <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 12px; padding: 20px; margin: 20px 0;">
    <h2 style="color: #92400e; margin-top: 0; font-size: 18px;">⭐ ${labels.gamificationTitle}</h2>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
      <div style="background: rgba(255,255,255,0.7); border-radius: 8px; padding: 12px; text-align: center;">
        <p style="margin: 0; font-size: 24px; font-weight: bold; color: #92400e;">+${data.gamification.weeklyXpEarned}</p>
        <p style="margin: 4px 0 0; font-size: 12px; color: #78350f;">${labels.xpEarned}</p>
      </div>
      <div style="background: rgba(255,255,255,0.7); border-radius: 8px; padding: 12px; text-align: center;">
        <p style="margin: 0; font-size: 24px; font-weight: bold; color: #92400e;">${data.gamification.totalXp.toLocaleString()}</p>
        <p style="margin: 4px 0 0; font-size: 12px; color: #78350f;">${labels.totalXp}</p>
      </div>
      <div style="background: rgba(255,255,255,0.7); border-radius: 8px; padding: 12px; text-align: center;">
        <p style="margin: 0; font-size: 18px; font-weight: bold; color: #92400e;">Lv.${data.gamification.currentLevel} ${data.gamification.levelTitle}</p>
        <p style="margin: 4px 0 0; font-size: 12px; color: #78350f;">${labels.level}</p>
      </div>
      <div style="background: rgba(255,255,255,0.7); border-radius: 8px; padding: 12px; text-align: center;">
        <p style="margin: 0; font-size: 18px; font-weight: bold; color: #92400e;">🔥 ${data.gamification.currentStreak} ${labels.days}</p>
        <p style="margin: 4px 0 0; font-size: 12px; color: #78350f;">${labels.streak}</p>
      </div>
    </div>
    ${data.gamification.currentMultiplier > 1 ? `
    <div style="background: rgba(255,255,255,0.7); border-radius: 8px; padding: 12px; margin-top: 12px; text-align: center;">
      <p style="margin: 0; font-size: 16px; font-weight: bold; color: #059669;">⚡ ${data.gamification.currentMultiplier}x ${labels.multiplier}</p>
    </div>` : ''}
    ${data.gamification.nextMilestone ? `
    <div style="background: rgba(255,255,255,0.7); border-radius: 8px; padding: 12px; margin-top: 12px; text-align: center;">
      <p style="margin: 0; font-size: 14px; color: #78350f;">${labels.nextMilestone}: <strong>${data.gamification.nextMilestone.toLocaleString()} XP</strong> (${data.gamification.xpToNextMilestone?.toLocaleString()} ${labels.xpAway})</p>
    </div>` : ''}
    ${data.gamification.recommendedNextStep ? `
    <div style="background: rgba(255,255,255,0.9); border-left: 4px solid #059669; border-radius: 0 8px 8px 0; padding: 12px 16px; margin-top: 12px;">
      <p style="margin: 0; font-size: 13px; font-weight: bold; color: #059669;">💡 ${labels.recommendedAction}</p>
      <p style="margin: 4px 0 0; font-size: 14px; color: #1f2937;">${data.gamification.recommendedNextStep}</p>
    </div>` : ''}
  </div>
  ` : ''}

  <!-- Tips -->
  <div style="background: #f3f4f6; border-radius: 12px; padding: 20px; margin: 20px 0;">
    <h2 style="color: #4b5563; margin-top: 0; font-size: 18px;">💡 ${labels.tips}</h2>
    <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
      <li style="margin-bottom: 8px;">${labels.tip1}</li>
      <li style="margin-bottom: 8px;">${labels.tip2}</li>
      <li>${labels.tip3}</li>
    </ul>
  </div>

  <p style="font-size: 18px; text-align: center; margin: 30px 0;">${labels.keepGoing}</p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="https://www.rusingacademy.ca/dashboard" style="display: inline-block; background: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">
      ${labels.cta}
    </a>
  </div>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

  <p style="font-size: 12px; color: #9ca3af; text-align: center;">
    ${labels.footer}
  </p>
</body>
</html>
`;

  await sendEmail({
    to: data.learnerEmail,
    subject: labels.subject,
    html: htmlContent,
  });
}

/**
 * Send weekly progress reports to all learners who have opted in
 * @param targetDay - The day to send reports for (0=Sunday, 1=Monday). If not provided, sends to all opted-in learners.
 */
export async function sendAllWeeklyProgressReports(targetDay?: number): Promise<{ sent: number; skipped: number; errors: number }> {
  const db = await getDb();
  if (!db) return { sent: 0, skipped: 0, errors: 0 };

  // Get all learners with their preferences
  const learners = await db.select().from(learnerProfiles);

  // Calculate week range (last 7 days)
  const weekEndDate = new Date();
  const weekStartDate = new Date();
  weekStartDate.setDate(weekStartDate.getDate() - 7);

  let sent = 0;
  let skipped = 0;
  let errors = 0;

  for (const learner of learners) {
    // Check if learner has opted out
    if (learner.weeklyReportEnabled === false) {
      skipped++;
      continue;
    }

    // Check if today matches learner's preferred delivery day
    if (targetDay !== undefined && learner.weeklyReportDay !== targetDay) {
      skipped++;
      continue;
    }

    try {
      const progressData = await generateWeeklyProgressReport(
        learner.id,
        weekStartDate,
        weekEndDate
      );

      if (progressData && progressData.learnerEmail) {
        await sendWeeklyProgressEmail(progressData);
        sent++;
        console.log(`[Progress Reports] Sent report to learner ${learner.id}`);
      } else {
        skipped++;
      }
    } catch (error) {
      console.error(`[Progress Reports] Failed to send to learner ${learner.id}:`, error);
      errors++;
    }
  }

  console.log(`[Progress Reports] Summary: sent=${sent}, skipped=${skipped}, errors=${errors}`);
  return { sent, skipped, errors };
}

/**
 * Cron handler for Sunday reports (9am ET)
 */
export async function sendSundayProgressReports(): Promise<{ sent: number; skipped: number; errors: number }> {
  console.log("[Progress Reports] Running Sunday cron job...");
  return sendAllWeeklyProgressReports(0); // 0 = Sunday
}

/**
 * Cron handler for Monday reports (9am ET)
 */
export async function sendMondayProgressReports(): Promise<{ sent: number; skipped: number; errors: number }> {
  console.log("[Progress Reports] Running Monday cron job...");
  return sendAllWeeklyProgressReports(1); // 1 = Monday
}
