/**
 * Email Reminder Templates
 * 
 * Automated email reminders for:
 * - Coaching plan expiry (7 days, 3 days, 1 day before)
 * - User inactivity (7+ days without login)
 */

import { sendEmail } from "./email";
import { EMAIL_BRANDING, generateEmailHeader, generateEmailFooter } from "./email-branding";

// ============================================================================
// PLAN EXPIRY REMINDER
// ============================================================================

interface PlanExpiryReminderData {
  userEmail: string;
  userName: string;
  planName: string;
  remainingSessions: number;
  expiresAt: Date;
  daysUntilExpiry: number;
  language?: "en" | "fr";
}

export async function sendPlanExpiryReminderEmail(data: PlanExpiryReminderData): Promise<boolean> {
  const { 
    userEmail, 
    userName, 
    planName,
    remainingSessions,
    expiresAt,
    daysUntilExpiry,
    language = "en" 
  } = data;
  
  const isEnglish = language === "en";
  const formattedExpiry = expiresAt.toLocaleDateString(isEnglish ? "en-CA" : "fr-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const bookingUrl = `${EMAIL_BRANDING.company.website}/learner/book-session`;
  const coachesUrl = `${EMAIL_BRANDING.company.website}/coaches`;
  
  // Urgency level based on days remaining
  const isUrgent = daysUntilExpiry <= 3;
  const urgencyColor = daysUntilExpiry === 1 ? "#dc2626" : daysUntilExpiry <= 3 ? "#f59e0b" : EMAIL_BRANDING.colors.primary;
  
  const subject = isEnglish 
    ? `⏰ ${daysUntilExpiry === 1 ? "URGENT: " : ""}Your coaching plan expires ${daysUntilExpiry === 1 ? "tomorrow" : `in ${daysUntilExpiry} days`}!`
    : `⏰ ${daysUntilExpiry === 1 ? "URGENT: " : ""}Votre plan de coaching expire ${daysUntilExpiry === 1 ? "demain" : `dans ${daysUntilExpiry} jours`}!`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: ${EMAIL_BRANDING.colors.light};">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    ${generateEmailHeader(
      isEnglish ? "Plan Expiring Soon!" : "Plan expirant bientôt!",
      isEnglish ? "Don't lose your coaching sessions" : "Ne perdez pas vos séances de coaching"
    )}
    
    <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <p style="font-size: 16px; color: ${EMAIL_BRANDING.colors.text}; margin: 0 0 20px;">
        ${isEnglish 
          ? `Hi ${userName || "there"},` 
          : `Bonjour ${userName || ""},`}
      </p>
      
      <!-- Urgency Alert -->
      <div style="background: ${urgencyColor}10; border: 2px solid ${urgencyColor}; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
        <p style="font-size: 48px; margin: 0;">⏰</p>
        <h2 style="margin: 10px 0; color: ${urgencyColor}; font-size: 24px;">
          ${isEnglish 
            ? `${daysUntilExpiry} day${daysUntilExpiry > 1 ? "s" : ""} left!`
            : `${daysUntilExpiry} jour${daysUntilExpiry > 1 ? "s" : ""} restant${daysUntilExpiry > 1 ? "s" : ""}!`}
        </h2>
        <p style="margin: 0; color: ${EMAIL_BRANDING.colors.text};">
          ${isEnglish 
            ? `Your <strong>${planName}</strong> expires on ${formattedExpiry}`
            : `Votre <strong>${planName}</strong> expire le ${formattedExpiry}`}
        </p>
      </div>
      
      <!-- Sessions Remaining -->
      ${remainingSessions > 0 ? `
      <div style="background: ${EMAIL_BRANDING.colors.light}; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
        <p style="margin: 0 0 5px; color: ${EMAIL_BRANDING.colors.muted}; font-size: 14px;">
          ${isEnglish ? "You still have" : "Il vous reste encore"}
        </p>
        <p style="margin: 0; color: ${urgencyColor}; font-size: 36px; font-weight: 700;">
          ${remainingSessions}
        </p>
        <p style="margin: 5px 0 0; color: ${EMAIL_BRANDING.colors.text}; font-size: 16px;">
          ${isEnglish 
            ? `unused session${remainingSessions > 1 ? "s" : ""}`
            : `séance${remainingSessions > 1 ? "s" : ""} non utilisée${remainingSessions > 1 ? "s" : ""}`}
        </p>
      </div>
      ` : ""}
      
      <p style="font-size: 16px; color: ${EMAIL_BRANDING.colors.text}; margin: 20px 0;">
        ${isEnglish 
          ? `Don't let your coaching sessions go to waste! Book now to make the most of your investment in your language learning journey.`
          : `Ne laissez pas vos séances de coaching se perdre! Réservez maintenant pour tirer le meilleur parti de votre investissement dans votre parcours d'apprentissage linguistique.`}
      </p>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${bookingUrl}" style="display: inline-block; background: linear-gradient(135deg, ${urgencyColor} 0%, ${urgencyColor}dd 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 18px;">
          ${isEnglish ? "Book a Session Now →" : "Réserver une séance →"}
        </a>
      </div>
      
      <!-- Browse Coaches -->
      <p style="font-size: 14px; color: ${EMAIL_BRANDING.colors.muted}; text-align: center; margin: 20px 0;">
        ${isEnglish 
          ? `Need help choosing a coach? <a href="${coachesUrl}" style="color: ${EMAIL_BRANDING.colors.primary};">Browse our coaches</a>`
          : `Besoin d'aide pour choisir un coach? <a href="${coachesUrl}" style="color: ${EMAIL_BRANDING.colors.primary};">Parcourir nos coachs</a>`}
      </p>
      
      <!-- Support -->
      <p style="font-size: 14px; color: ${EMAIL_BRANDING.colors.muted}; margin: 20px 0 0;">
        ${isEnglish 
          ? `Questions? Contact us at <a href="mailto:${EMAIL_BRANDING.company.supportEmail}" style="color: ${EMAIL_BRANDING.colors.primary};">${EMAIL_BRANDING.company.supportEmail}</a>`
          : `Questions? Contactez-nous à <a href="mailto:${EMAIL_BRANDING.company.supportEmail}" style="color: ${EMAIL_BRANDING.colors.primary};">${EMAIL_BRANDING.company.supportEmail}</a>`}
      </p>
    </div>
    
    ${generateEmailFooter(language)}
  </div>
</body>
</html>
  `;
  
  const text = isEnglish
    ? `Your coaching plan expires ${daysUntilExpiry === 1 ? "tomorrow" : `in ${daysUntilExpiry} days`}!\n\nHi ${userName || "there"},\n\nYour ${planName} expires on ${formattedExpiry}.\n\n${remainingSessions > 0 ? `You still have ${remainingSessions} unused session${remainingSessions > 1 ? "s" : ""}.\n\n` : ""}Don't let your coaching sessions go to waste! Book now.\n\nBook a session: ${bookingUrl}\n\nQuestions? Contact us at ${EMAIL_BRANDING.company.supportEmail}`
    : `Votre plan de coaching expire ${daysUntilExpiry === 1 ? "demain" : `dans ${daysUntilExpiry} jours`}!\n\nBonjour ${userName || ""},\n\nVotre ${planName} expire le ${formattedExpiry}.\n\n${remainingSessions > 0 ? `Il vous reste encore ${remainingSessions} séance${remainingSessions > 1 ? "s" : ""} non utilisée${remainingSessions > 1 ? "s" : ""}.\n\n` : ""}Ne laissez pas vos séances de coaching se perdre! Réservez maintenant.\n\nRéserver une séance: ${bookingUrl}\n\nQuestions? Contactez-nous à ${EMAIL_BRANDING.company.supportEmail}`;
  
  return sendEmail({
    to: userEmail,
    subject,
    html,
    text,
  });
}


// ============================================================================
// INACTIVITY REMINDER
// ============================================================================

interface InactivityReminderData {
  userEmail: string;
  userName: string;
  daysSinceLastLogin: number;
  hasActiveEnrollments: boolean;
  hasActivePlan: boolean;
  language?: "en" | "fr";
}

export async function sendInactivityReminderEmail(data: InactivityReminderData): Promise<boolean> {
  const { 
    userEmail, 
    userName, 
    daysSinceLastLogin,
    hasActiveEnrollments,
    hasActivePlan,
    language = "en" 
  } = data;
  
  const isEnglish = language === "en";
  const dashboardUrl = `${EMAIL_BRANDING.company.website}/learner`;
  const coursesUrl = `${EMAIL_BRANDING.company.website}/learner/courses`;
  const unsubscribeUrl = `${EMAIL_BRANDING.company.website}/unsubscribe?email=${encodeURIComponent(userEmail)}&type=inactivity`;
  
  const subject = isEnglish 
    ? `👋 We miss you! Continue your learning journey`
    : `👋 Vous nous manquez! Continuez votre parcours d'apprentissage`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: ${EMAIL_BRANDING.colors.light};">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    ${generateEmailHeader(
      isEnglish ? "We Miss You!" : "Vous nous manquez!",
      isEnglish ? "Your learning journey awaits" : "Votre parcours d'apprentissage vous attend"
    )}
    
    <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <p style="font-size: 16px; color: ${EMAIL_BRANDING.colors.text}; margin: 0 0 20px;">
        ${isEnglish 
          ? `Hi ${userName || "there"},` 
          : `Bonjour ${userName || ""},`}
      </p>
      
      <p style="font-size: 16px; color: ${EMAIL_BRANDING.colors.text}; margin: 0 0 20px;">
        ${isEnglish 
          ? `It's been ${daysSinceLastLogin} days since we last saw you. We hope everything is going well!`
          : `Cela fait ${daysSinceLastLogin} jours que nous ne vous avons pas vu. Nous espérons que tout va bien!`}
      </p>
      
      <!-- Motivational Message -->
      <div style="background: linear-gradient(135deg, ${EMAIL_BRANDING.colors.primary}10 0%, ${EMAIL_BRANDING.colors.primaryLight}10 100%); border-radius: 12px; padding: 25px; margin: 20px 0; text-align: center;">
        <p style="font-size: 48px; margin: 0;">🌟</p>
        <h3 style="margin: 10px 0; color: ${EMAIL_BRANDING.colors.primary}; font-size: 20px;">
          ${isEnglish 
            ? "Every day is a chance to improve!"
            : "Chaque jour est une chance de s'améliorer!"}
        </h3>
        <p style="margin: 0; color: ${EMAIL_BRANDING.colors.text}; font-size: 14px;">
          ${isEnglish 
            ? "Even 15 minutes of practice can make a difference in your language skills."
            : "Même 15 minutes de pratique peuvent faire une différence dans vos compétences linguistiques."}
        </p>
      </div>
      
      ${hasActiveEnrollments || hasActivePlan ? `
      <!-- What's Waiting -->
      <div style="background: ${EMAIL_BRANDING.colors.light}; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h4 style="margin: 0 0 15px; color: ${EMAIL_BRANDING.colors.dark};">
          ${isEnglish ? "📚 What's waiting for you:" : "📚 Ce qui vous attend:"}
        </h4>
        <ul style="margin: 0; padding: 0 0 0 20px; color: ${EMAIL_BRANDING.colors.text};">
          ${hasActiveEnrollments ? `<li style="margin-bottom: 8px;">${isEnglish ? "Your enrolled courses with progress saved" : "Vos cours inscrits avec progression sauvegardée"}</li>` : ""}
          ${hasActivePlan ? `<li style="margin-bottom: 8px;">${isEnglish ? "Coaching sessions ready to be booked" : "Séances de coaching prêtes à être réservées"}</li>` : ""}
          <li style="margin-bottom: 8px;">${isEnglish ? "New content and resources" : "Nouveau contenu et ressources"}</li>
          <li style="margin-bottom: 8px;">${isEnglish ? "Your personalized learning path" : "Votre parcours d'apprentissage personnalisé"}</li>
        </ul>
      </div>
      ` : ""}
      
      <!-- Quick Tips -->
      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%); border-left: 4px solid #f59e0b; padding: 15px 20px; border-radius: 0 8px 8px 0; margin: 25px 0;">
        <h4 style="margin: 0 0 10px; color: #92400e;">
          ${isEnglish ? "💡 Quick Tips to Get Back on Track" : "💡 Conseils rapides pour reprendre le rythme"}
        </h4>
        <ul style="margin: 0; padding: 0 0 0 20px; color: #78350f; font-size: 14px;">
          <li style="margin-bottom: 6px;">${isEnglish ? "Set a daily reminder for 15 minutes of practice" : "Définissez un rappel quotidien pour 15 minutes de pratique"}</li>
          <li style="margin-bottom: 6px;">${isEnglish ? "Start with a quick review of your last lesson" : "Commencez par une révision rapide de votre dernière leçon"}</li>
          <li style="margin-bottom: 6px;">${isEnglish ? "Book a coaching session for accountability" : "Réservez une séance de coaching pour la responsabilisation"}</li>
        </ul>
      </div>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, ${EMAIL_BRANDING.colors.primary} 0%, ${EMAIL_BRANDING.colors.primaryLight} 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          ${isEnglish ? "Continue Learning →" : "Continuer à apprendre →"}
        </a>
      </div>
      
      <!-- Support -->
      <p style="font-size: 14px; color: ${EMAIL_BRANDING.colors.muted}; margin: 20px 0 0;">
        ${isEnglish 
          ? `Need help getting started again? We're here for you at <a href="mailto:${EMAIL_BRANDING.company.supportEmail}" style="color: ${EMAIL_BRANDING.colors.primary};">${EMAIL_BRANDING.company.supportEmail}</a>`
          : `Besoin d'aide pour recommencer? Nous sommes là pour vous à <a href="mailto:${EMAIL_BRANDING.company.supportEmail}" style="color: ${EMAIL_BRANDING.colors.primary};">${EMAIL_BRANDING.company.supportEmail}</a>`}
      </p>
    </div>
    
    ${generateEmailFooter(language)}
    
    <!-- Unsubscribe -->
    <p style="text-align: center; font-size: 12px; color: ${EMAIL_BRANDING.colors.muted}; margin-top: 20px;">
      ${isEnglish 
        ? `Don't want to receive these reminders? <a href="${unsubscribeUrl}" style="color: ${EMAIL_BRANDING.colors.muted};">Unsubscribe</a>`
        : `Vous ne voulez plus recevoir ces rappels? <a href="${unsubscribeUrl}" style="color: ${EMAIL_BRANDING.colors.muted};">Se désabonner</a>`}
    </p>
  </div>
</body>
</html>
  `;
  
  const text = isEnglish
    ? `We miss you!\n\nHi ${userName || "there"},\n\nIt's been ${daysSinceLastLogin} days since we last saw you.\n\nEvery day is a chance to improve! Even 15 minutes of practice can make a difference.\n\nContinue learning: ${dashboardUrl}\n\nQuestions? Contact us at ${EMAIL_BRANDING.company.supportEmail}\n\nUnsubscribe: ${unsubscribeUrl}`
    : `Vous nous manquez!\n\nBonjour ${userName || ""},\n\nCela fait ${daysSinceLastLogin} jours que nous ne vous avons pas vu.\n\nChaque jour est une chance de s'améliorer! Même 15 minutes de pratique peuvent faire une différence.\n\nContinuer à apprendre: ${dashboardUrl}\n\nQuestions? Contactez-nous à ${EMAIL_BRANDING.company.supportEmail}\n\nSe désabonner: ${unsubscribeUrl}`;
  
  return sendEmail({
    to: userEmail,
    subject,
    html,
    text,
  });
}


// ============================================================================
// SCHEDULED JOB FUNCTIONS
// ============================================================================

import { getDb } from "./db";
import { eq, and, lte, gte, sql, lt } from "drizzle-orm";

/**
 * Check for expiring coaching plans and send reminder emails
 * Should be run daily via cron job
 */
export async function checkExpiringPlans(): Promise<{ sent: number; errors: number }> {
  const db = await getDb();
  if (!db) return { sent: 0, errors: 0 };
  
  const { coachingPlanPurchases, users } = await import("../drizzle/schema");
  
  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const in1Day = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
  
  let sent = 0;
  let errors = 0;
  
  // Get plans expiring in 7, 3, or 1 day
  const expiringPlans = await db.select({
    plan: coachingPlanPurchases,
    user: users,
  })
    .from(coachingPlanPurchases)
    .innerJoin(users, eq(coachingPlanPurchases.userId, users.id))
    .where(and(
      eq(coachingPlanPurchases.status, "active"),
      lte(coachingPlanPurchases.expiresAt, in7Days),
      gte(coachingPlanPurchases.expiresAt, now)
    ));
  
  for (const { plan, user } of expiringPlans) {
    const daysUntilExpiry = Math.ceil((new Date(plan.expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    // Only send on specific days (7, 3, 1)
    if (daysUntilExpiry !== 7 && daysUntilExpiry !== 3 && daysUntilExpiry !== 1) continue;
    
    try {
      await sendPlanExpiryReminderEmail({
        userEmail: user.email || "",
        userName: user.name || "",
        planName: plan.planName,
        remainingSessions: plan.remainingSessions,
        expiresAt: new Date(plan.expiresAt),
        daysUntilExpiry,
        language: "en", // Could be stored in user preferences
      });
      sent++;
    } catch (e) {
      console.error(`Failed to send expiry reminder to ${user.email}:`, e);
      errors++;
    }
  }
  
  console.log(`[Plan Expiry Reminders] Sent: ${sent}, Errors: ${errors}`);
  return { sent, errors };
}

/**
 * Check for inactive users and send reminder emails
 * Should be run daily via cron job
 */
export async function checkInactiveUsers(): Promise<{ sent: number; errors: number }> {
  const db = await getDb();
  if (!db) return { sent: 0, errors: 0 };
  
  const { users, courseEnrollments, coachingPlanPurchases } = await import("../drizzle/schema");
  
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  let sent = 0;
  let errors = 0;
  
  // Get users who haven't logged in for 7+ days
  const inactiveUsers = await db.select()
    .from(users)
    .where(and(
      lt(users.lastSignedIn, sevenDaysAgo),
      eq(users.role, "learner")
    ))
    .limit(100); // Process in batches
  
  for (const user of inactiveUsers) {
    const daysSinceLastLogin = Math.floor((now.getTime() - new Date(user.lastSignedIn || now).getTime()) / (1000 * 60 * 60 * 24));
    
    // Only send on day 7 (to avoid spamming)
    if (daysSinceLastLogin !== 7) continue;
    
    // Check if user has active enrollments or plans
    const [enrollmentCount] = await db.select({ count: sql<number>`COUNT(*)` })
      .from(courseEnrollments)
      .where(and(
        eq(courseEnrollments.userId, user.id),
        eq(courseEnrollments.status, "active")
      ));
    
    const [planCount] = await db.select({ count: sql<number>`COUNT(*)` })
      .from(coachingPlanPurchases)
      .where(and(
        eq(coachingPlanPurchases.userId, user.id),
        eq(coachingPlanPurchases.status, "active")
      ));
    
    try {
      await sendInactivityReminderEmail({
        userEmail: user.email || "",
        userName: user.name || "",
        daysSinceLastLogin,
        hasActiveEnrollments: (enrollmentCount?.count || 0) > 0,
        hasActivePlan: (planCount?.count || 0) > 0,
        language: "en",
      });
      sent++;
    } catch (e) {
      console.error(`Failed to send inactivity reminder to ${user.email}:`, e);
      errors++;
    }
  }
  
  console.log(`[Inactivity Reminders] Sent: ${sent}, Errors: ${errors}`);
  return { sent, errors };
}
