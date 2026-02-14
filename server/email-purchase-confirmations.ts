/**
 * Email Templates for Purchase Confirmations
 * 
 * Sends branded confirmation emails after successful course and coaching plan purchases.
 */

import { sendEmail } from "./email";
import { EMAIL_BRANDING, generateEmailHeader, generateEmailFooter } from "./email-branding";

// ============================================================================
// COURSE PURCHASE CONFIRMATION
// ============================================================================

interface CoursePurchaseEmailData {
  userEmail: string;
  userName: string;
  courseTitle: string;
  courseSlug: string;
  amountPaid: number; // in cents
  language?: "en" | "fr";
}

export async function sendCoursePurchaseConfirmationEmail(data: CoursePurchaseEmailData): Promise<boolean> {
  const { userEmail, userName, courseTitle, courseSlug, amountPaid, language = "en" } = data;
  
  const isEnglish = language === "en";
  const formattedAmount = (amountPaid / 100).toFixed(2);
  const dashboardUrl = `${EMAIL_BRANDING.company.website}/learner/courses`;
  const courseUrl = `${EMAIL_BRANDING.company.website}/curriculum/${courseSlug}`;
  
  const subject = isEnglish 
    ? `🎉 Welcome to ${courseTitle} - Your Learning Journey Begins!`
    : `🎉 Bienvenue à ${courseTitle} - Votre parcours d'apprentissage commence!`;
  
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
      isEnglish ? "Purchase Confirmed!" : "Achat confirmé!",
      isEnglish ? "Your course is ready to access" : "Votre cours est prêt à être consulté"
    )}
    
    <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <p style="font-size: 16px; color: ${EMAIL_BRANDING.colors.text}; margin: 0 0 20px;">
        ${isEnglish 
          ? `Hi ${userName || "there"},` 
          : `Bonjour ${userName || ""},`}
      </p>
      
      <p style="font-size: 16px; color: ${EMAIL_BRANDING.colors.text}; margin: 0 0 20px;">
        ${isEnglish 
          ? `Thank you for your purchase! You now have full access to <strong>${courseTitle}</strong>.`
          : `Merci pour votre achat! Vous avez maintenant accès complet à <strong>${courseTitle}</strong>.`}
      </p>
      
      <!-- Order Summary -->
      <div style="background: ${EMAIL_BRANDING.colors.light}; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="margin: 0 0 15px; color: ${EMAIL_BRANDING.colors.dark}; font-size: 16px;">
          ${isEnglish ? "📋 Order Summary" : "📋 Résumé de la commande"}
        </h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: ${EMAIL_BRANDING.colors.muted};">
              ${isEnglish ? "Course" : "Cours"}
            </td>
            <td style="padding: 8px 0; text-align: right; color: ${EMAIL_BRANDING.colors.text}; font-weight: 600;">
              ${courseTitle}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: ${EMAIL_BRANDING.colors.muted};">
              ${isEnglish ? "Access" : "Accès"}
            </td>
            <td style="padding: 8px 0; text-align: right; color: ${EMAIL_BRANDING.colors.primary}; font-weight: 600;">
              ${isEnglish ? "Lifetime" : "À vie"}
            </td>
          </tr>
          <tr style="border-top: 1px solid #e5e7eb;">
            <td style="padding: 12px 0 0; color: ${EMAIL_BRANDING.colors.dark}; font-weight: 600;">
              ${isEnglish ? "Total Paid" : "Total payé"}
            </td>
            <td style="padding: 12px 0 0; text-align: right; color: ${EMAIL_BRANDING.colors.primary}; font-weight: 700; font-size: 18px;">
              $${formattedAmount} CAD
            </td>
          </tr>
        </table>
      </div>
      
      <!-- What's Included -->
      <div style="margin: 25px 0;">
        <h3 style="margin: 0 0 15px; color: ${EMAIL_BRANDING.colors.dark}; font-size: 16px;">
          ${isEnglish ? "✨ What's Included" : "✨ Ce qui est inclus"}
        </h3>
        <ul style="margin: 0; padding: 0 0 0 20px; color: ${EMAIL_BRANDING.colors.text};">
          <li style="margin-bottom: 8px;">${isEnglish ? "Full course access with all modules and lessons" : "Accès complet au cours avec tous les modules et leçons"}</li>
          <li style="margin-bottom: 8px;">${isEnglish ? "Downloadable resources and practice materials" : "Ressources téléchargeables et matériel de pratique"}</li>
          <li style="margin-bottom: 8px;">${isEnglish ? "Progress tracking and completion certificate" : "Suivi des progrès et certificat d'achèvement"}</li>
          <li style="margin-bottom: 8px;">${isEnglish ? "Access to course community and support" : "Accès à la communauté du cours et au support"}</li>
        </ul>
      </div>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, ${EMAIL_BRANDING.colors.secondary} 0%, #ea580c 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          ${isEnglish ? "Start Learning Now →" : "Commencer à apprendre →"}
        </a>
      </div>
      
      <!-- Next Steps -->
      <div style="background: linear-gradient(135deg, ${EMAIL_BRANDING.colors.primary}10 0%, ${EMAIL_BRANDING.colors.primaryLight}10 100%); border-left: 4px solid ${EMAIL_BRANDING.colors.primary}; padding: 15px 20px; border-radius: 0 8px 8px 0; margin: 25px 0;">
        <h4 style="margin: 0 0 10px; color: ${EMAIL_BRANDING.colors.primary};">
          ${isEnglish ? "🚀 Next Steps" : "🚀 Prochaines étapes"}
        </h4>
        <ol style="margin: 0; padding: 0 0 0 20px; color: ${EMAIL_BRANDING.colors.text}; font-size: 14px;">
          <li style="margin-bottom: 6px;">${isEnglish ? "Log in to your learner dashboard" : "Connectez-vous à votre tableau de bord apprenant"}</li>
          <li style="margin-bottom: 6px;">${isEnglish ? "Navigate to 'My Courses'" : "Naviguez vers 'Mes cours'"}</li>
          <li style="margin-bottom: 6px;">${isEnglish ? "Start with Module 1 and track your progress" : "Commencez par le Module 1 et suivez votre progression"}</li>
        </ol>
      </div>
      
      <!-- Support -->
      <p style="font-size: 14px; color: ${EMAIL_BRANDING.colors.muted}; margin: 20px 0 0;">
        ${isEnglish 
          ? `Need help getting started? Our support team is here for you at <a href="mailto:${EMAIL_BRANDING.company.supportEmail}" style="color: ${EMAIL_BRANDING.colors.primary};">${EMAIL_BRANDING.company.supportEmail}</a>`
          : `Besoin d'aide pour commencer? Notre équipe de support est là pour vous à <a href="mailto:${EMAIL_BRANDING.company.supportEmail}" style="color: ${EMAIL_BRANDING.colors.primary};">${EMAIL_BRANDING.company.supportEmail}</a>`}
      </p>
    </div>
    
    ${generateEmailFooter(language)}
  </div>
</body>
</html>
  `;
  
  const text = isEnglish
    ? `Welcome to ${courseTitle}!\n\nThank you for your purchase. You now have full access to the course.\n\nOrder Summary:\n- Course: ${courseTitle}\n- Access: Lifetime\n- Total Paid: $${formattedAmount} CAD\n\nStart learning now: ${dashboardUrl}\n\nQuestions? Contact us at ${EMAIL_BRANDING.company.supportEmail}`
    : `Bienvenue à ${courseTitle}!\n\nMerci pour votre achat. Vous avez maintenant accès complet au cours.\n\nRésumé de la commande:\n- Cours: ${courseTitle}\n- Accès: À vie\n- Total payé: $${formattedAmount} CAD\n\nCommencez à apprendre: ${dashboardUrl}\n\nQuestions? Contactez-nous à ${EMAIL_BRANDING.company.supportEmail}`;
  
  return sendEmail({
    to: userEmail,
    subject,
    html,
    text,
  });
}


// ============================================================================
// COACHING PLAN PURCHASE CONFIRMATION
// ============================================================================

interface CoachingPlanPurchaseEmailData {
  userEmail: string;
  userName: string;
  planName: string;
  planId: string;
  totalSessions: number;
  validityDays: number;
  expiresAt: Date;
  amountPaid: number; // in cents
  language?: "en" | "fr";
}

export async function sendCoachingPlanPurchaseConfirmationEmail(data: CoachingPlanPurchaseEmailData): Promise<boolean> {
  const { 
    userEmail, 
    userName, 
    planName, 
    planId,
    totalSessions, 
    validityDays, 
    expiresAt, 
    amountPaid, 
    language = "en" 
  } = data;
  
  const isEnglish = language === "en";
  const formattedAmount = (amountPaid / 100).toFixed(2);
  const formattedExpiry = expiresAt.toLocaleDateString(isEnglish ? "en-CA" : "fr-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const coachesUrl = `${EMAIL_BRANDING.company.website}/coaches`;
  const dashboardUrl = `${EMAIL_BRANDING.company.website}/learner`;
  
  // Determine plan tier for styling
  const planTier = planId.includes("immersion") ? "premium" : planId.includes("accelerator") ? "standard" : "starter";
  const tierColor = planTier === "premium" ? "#f59e0b" : planTier === "standard" ? EMAIL_BRANDING.colors.primary : "#6366f1";
  
  const subject = isEnglish 
    ? `🎯 Your ${planName} Coaching Plan is Active!`
    : `🎯 Votre plan de coaching ${planName} est actif!`;
  
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
      isEnglish ? "Coaching Plan Activated!" : "Plan de coaching activé!",
      isEnglish ? "Your personalized coaching journey begins" : "Votre parcours de coaching personnalisé commence"
    )}
    
    <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <p style="font-size: 16px; color: ${EMAIL_BRANDING.colors.text}; margin: 0 0 20px;">
        ${isEnglish 
          ? `Hi ${userName || "there"},` 
          : `Bonjour ${userName || ""},`}
      </p>
      
      <p style="font-size: 16px; color: ${EMAIL_BRANDING.colors.text}; margin: 0 0 20px;">
        ${isEnglish 
          ? `Congratulations! Your <strong style="color: ${tierColor};">${planName}</strong> coaching plan is now active. You're one step closer to achieving your language goals!`
          : `Félicitations! Votre plan de coaching <strong style="color: ${tierColor};">${planName}</strong> est maintenant actif. Vous êtes un pas plus près d'atteindre vos objectifs linguistiques!`}
      </p>
      
      <!-- Plan Details Card -->
      <div style="background: linear-gradient(135deg, ${tierColor}10 0%, ${tierColor}05 100%); border: 2px solid ${tierColor}; border-radius: 12px; padding: 25px; margin: 20px 0;">
        <div style="display: flex; align-items: center; margin-bottom: 15px;">
          <span style="font-size: 32px; margin-right: 12px;">🎯</span>
          <div>
            <h3 style="margin: 0; color: ${tierColor}; font-size: 20px;">${planName}</h3>
            <p style="margin: 5px 0 0; color: ${EMAIL_BRANDING.colors.muted}; font-size: 14px;">
              ${isEnglish ? "Coaching Plan" : "Plan de coaching"}
            </p>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px;">
          <div style="background: white; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 28px; font-weight: 700; color: ${tierColor};">${totalSessions}</div>
            <div style="font-size: 12px; color: ${EMAIL_BRANDING.colors.muted}; text-transform: uppercase;">
              ${isEnglish ? "Sessions" : "Séances"}
            </div>
          </div>
          <div style="background: white; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 28px; font-weight: 700; color: ${EMAIL_BRANDING.colors.primary};">${validityDays}</div>
            <div style="font-size: 12px; color: ${EMAIL_BRANDING.colors.muted}; text-transform: uppercase;">
              ${isEnglish ? "Days Valid" : "Jours de validité"}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Important Dates -->
      <div style="background: ${EMAIL_BRANDING.colors.light}; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="margin: 0 0 15px; color: ${EMAIL_BRANDING.colors.dark}; font-size: 16px;">
          ${isEnglish ? "📅 Important Dates" : "📅 Dates importantes"}
        </h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: ${EMAIL_BRANDING.colors.muted};">
              ${isEnglish ? "Plan Activated" : "Plan activé"}
            </td>
            <td style="padding: 8px 0; text-align: right; color: ${EMAIL_BRANDING.colors.text}; font-weight: 600;">
              ${new Date().toLocaleDateString(isEnglish ? "en-CA" : "fr-CA", { year: "numeric", month: "long", day: "numeric" })}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: ${EMAIL_BRANDING.colors.muted};">
              ${isEnglish ? "Valid Until" : "Valide jusqu'au"}
            </td>
            <td style="padding: 8px 0; text-align: right; color: ${EMAIL_BRANDING.colors.secondary}; font-weight: 600;">
              ${formattedExpiry}
            </td>
          </tr>
          <tr style="border-top: 1px solid #e5e7eb;">
            <td style="padding: 12px 0 0; color: ${EMAIL_BRANDING.colors.dark}; font-weight: 600;">
              ${isEnglish ? "Amount Paid" : "Montant payé"}
            </td>
            <td style="padding: 12px 0 0; text-align: right; color: ${EMAIL_BRANDING.colors.primary}; font-weight: 700; font-size: 18px;">
              $${formattedAmount} CAD
            </td>
          </tr>
        </table>
      </div>
      
      <!-- CTA Buttons -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${coachesUrl}" style="display: inline-block; background: linear-gradient(135deg, ${EMAIL_BRANDING.colors.secondary} 0%, #ea580c 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-bottom: 10px;">
          ${isEnglish ? "Browse Coaches & Book →" : "Parcourir les coachs et réserver →"}
        </a>
        <br>
        <a href="${dashboardUrl}" style="display: inline-block; color: ${EMAIL_BRANDING.colors.primary}; text-decoration: none; padding: 10px 20px; font-weight: 500; font-size: 14px;">
          ${isEnglish ? "Go to Dashboard" : "Aller au tableau de bord"}
        </a>
      </div>
      
      <!-- How It Works -->
      <div style="background: linear-gradient(135deg, ${EMAIL_BRANDING.colors.primary}10 0%, ${EMAIL_BRANDING.colors.primaryLight}10 100%); border-left: 4px solid ${EMAIL_BRANDING.colors.primary}; padding: 15px 20px; border-radius: 0 8px 8px 0; margin: 25px 0;">
        <h4 style="margin: 0 0 10px; color: ${EMAIL_BRANDING.colors.primary};">
          ${isEnglish ? "🚀 How to Use Your Sessions" : "🚀 Comment utiliser vos séances"}
        </h4>
        <ol style="margin: 0; padding: 0 0 0 20px; color: ${EMAIL_BRANDING.colors.text}; font-size: 14px;">
          <li style="margin-bottom: 6px;">${isEnglish ? "Browse our certified coaches" : "Parcourez nos coachs certifiés"}</li>
          <li style="margin-bottom: 6px;">${isEnglish ? "Select a coach that matches your goals" : "Sélectionnez un coach qui correspond à vos objectifs"}</li>
          <li style="margin-bottom: 6px;">${isEnglish ? "Book a session using your plan credits" : "Réservez une séance en utilisant vos crédits de plan"}</li>
          <li style="margin-bottom: 6px;">${isEnglish ? "Track your progress in your dashboard" : "Suivez votre progression dans votre tableau de bord"}</li>
        </ol>
      </div>
      
      <!-- Support -->
      <p style="font-size: 14px; color: ${EMAIL_BRANDING.colors.muted}; margin: 20px 0 0;">
        ${isEnglish 
          ? `Questions about your plan? Contact us at <a href="mailto:${EMAIL_BRANDING.company.supportEmail}" style="color: ${EMAIL_BRANDING.colors.primary};">${EMAIL_BRANDING.company.supportEmail}</a>`
          : `Questions sur votre plan? Contactez-nous à <a href="mailto:${EMAIL_BRANDING.company.supportEmail}" style="color: ${EMAIL_BRANDING.colors.primary};">${EMAIL_BRANDING.company.supportEmail}</a>`}
      </p>
    </div>
    
    ${generateEmailFooter(language)}
  </div>
</body>
</html>
  `;
  
  const text = isEnglish
    ? `Your ${planName} Coaching Plan is Active!\n\nCongratulations! Your coaching plan is now active.\n\nPlan Details:\n- Plan: ${planName}\n- Sessions: ${totalSessions}\n- Valid for: ${validityDays} days\n- Expires: ${formattedExpiry}\n- Amount Paid: $${formattedAmount} CAD\n\nBrowse coaches and book: ${coachesUrl}\n\nQuestions? Contact us at ${EMAIL_BRANDING.company.supportEmail}`
    : `Votre plan de coaching ${planName} est actif!\n\nFélicitations! Votre plan de coaching est maintenant actif.\n\nDétails du plan:\n- Plan: ${planName}\n- Séances: ${totalSessions}\n- Valide pour: ${validityDays} jours\n- Expire le: ${formattedExpiry}\n- Montant payé: $${formattedAmount} CAD\n\nParcourir les coachs et réserver: ${coachesUrl}\n\nQuestions? Contactez-nous à ${EMAIL_BRANDING.company.supportEmail}`;
  
  return sendEmail({
    to: userEmail,
    subject,
    html,
    text,
  });
}



// ============================================================================
// COACHING SESSION CONFIRMATION
// ============================================================================

interface CoachingSessionConfirmationEmailData {
  userEmail: string;
  userName: string;
  coachName: string;
  sessionDate: string;
  sessionTime: string;
  duration: number;
  remainingSessions: number;
  language?: "en" | "fr";
}

export async function sendCoachingSessionConfirmationEmail(data: CoachingSessionConfirmationEmailData): Promise<boolean> {
  const { 
    userEmail, 
    userName, 
    coachName,
    sessionDate,
    sessionTime,
    duration,
    remainingSessions,
    language = "en" 
  } = data;
  
  const isEnglish = language === "en";
  const dashboardUrl = `${EMAIL_BRANDING.company.website}/learner/courses`;
  
  const subject = isEnglish 
    ? `✅ Coaching Session Confirmed - ${sessionDate}`
    : `✅ Séance de coaching confirmée - ${sessionDate}`;
  
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
      isEnglish ? "Session Confirmed!" : "Séance confirmée!",
      isEnglish ? "Your coaching session is booked" : "Votre séance de coaching est réservée"
    )}
    
    <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <p style="font-size: 16px; color: ${EMAIL_BRANDING.colors.text}; margin: 0 0 20px;">
        ${isEnglish 
          ? `Hi ${userName || "there"},` 
          : `Bonjour ${userName || ""},`}
      </p>
      
      <p style="font-size: 16px; color: ${EMAIL_BRANDING.colors.text}; margin: 0 0 20px;">
        ${isEnglish 
          ? `Your coaching session has been successfully booked!`
          : `Votre séance de coaching a été réservée avec succès!`}
      </p>
      
      <!-- Session Details Card -->
      <div style="background: linear-gradient(135deg, ${EMAIL_BRANDING.colors.primary}10 0%, ${EMAIL_BRANDING.colors.primaryLight}10 100%); border: 2px solid ${EMAIL_BRANDING.colors.primary}; border-radius: 12px; padding: 25px; margin: 20px 0;">
        <h3 style="margin: 0 0 20px; color: ${EMAIL_BRANDING.colors.primary}; font-size: 18px;">
          📅 ${isEnglish ? "Session Details" : "Détails de la séance"}
        </h3>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; color: ${EMAIL_BRANDING.colors.muted}; width: 40%;">
              ${isEnglish ? "Coach" : "Coach"}
            </td>
            <td style="padding: 10px 0; color: ${EMAIL_BRANDING.colors.text}; font-weight: 600;">
              ${coachName}
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: ${EMAIL_BRANDING.colors.muted};">
              ${isEnglish ? "Date" : "Date"}
            </td>
            <td style="padding: 10px 0; color: ${EMAIL_BRANDING.colors.text}; font-weight: 600;">
              ${sessionDate}
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: ${EMAIL_BRANDING.colors.muted};">
              ${isEnglish ? "Time" : "Heure"}
            </td>
            <td style="padding: 10px 0; color: ${EMAIL_BRANDING.colors.text}; font-weight: 600;">
              ${sessionTime}
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: ${EMAIL_BRANDING.colors.muted};">
              ${isEnglish ? "Duration" : "Durée"}
            </td>
            <td style="padding: 10px 0; color: ${EMAIL_BRANDING.colors.text}; font-weight: 600;">
              ${duration} ${isEnglish ? "minutes" : "minutes"}
            </td>
          </tr>
        </table>
      </div>
      
      <!-- Remaining Sessions -->
      <div style="background: ${EMAIL_BRANDING.colors.light}; border-radius: 8px; padding: 15px 20px; margin: 20px 0; text-align: center;">
        <p style="margin: 0; color: ${EMAIL_BRANDING.colors.muted}; font-size: 14px;">
          ${isEnglish ? "Remaining sessions in your plan" : "Séances restantes dans votre plan"}
        </p>
        <p style="margin: 5px 0 0; color: ${EMAIL_BRANDING.colors.primary}; font-size: 24px; font-weight: 700;">
          ${remainingSessions}
        </p>
      </div>
      
      <!-- Preparation Tips -->
      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%); border-left: 4px solid #f59e0b; padding: 15px 20px; border-radius: 0 8px 8px 0; margin: 25px 0;">
        <h4 style="margin: 0 0 10px; color: #92400e;">
          ${isEnglish ? "💡 Prepare for Your Session" : "💡 Préparez votre séance"}
        </h4>
        <ul style="margin: 0; padding: 0 0 0 20px; color: #78350f; font-size: 14px;">
          <li style="margin-bottom: 6px;">${isEnglish ? "Test your microphone and camera beforehand" : "Testez votre microphone et caméra à l'avance"}</li>
          <li style="margin-bottom: 6px;">${isEnglish ? "Find a quiet space for the session" : "Trouvez un endroit calme pour la séance"}</li>
          <li style="margin-bottom: 6px;">${isEnglish ? "Prepare any questions or topics you'd like to discuss" : "Préparez les questions ou sujets que vous souhaitez aborder"}</li>
        </ul>
      </div>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, ${EMAIL_BRANDING.colors.primary} 0%, ${EMAIL_BRANDING.colors.primaryLight} 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          ${isEnglish ? "View My Sessions →" : "Voir mes séances →"}
        </a>
      </div>
      
      <!-- Support -->
      <p style="font-size: 14px; color: ${EMAIL_BRANDING.colors.muted}; margin: 20px 0 0;">
        ${isEnglish 
          ? `Need to reschedule? Contact us at <a href="mailto:${EMAIL_BRANDING.company.supportEmail}" style="color: ${EMAIL_BRANDING.colors.primary};">${EMAIL_BRANDING.company.supportEmail}</a>`
          : `Besoin de reprogrammer? Contactez-nous à <a href="mailto:${EMAIL_BRANDING.company.supportEmail}" style="color: ${EMAIL_BRANDING.colors.primary};">${EMAIL_BRANDING.company.supportEmail}</a>`}
      </p>
    </div>
    
    ${generateEmailFooter(language)}
  </div>
</body>
</html>
  `;
  
  const text = isEnglish
    ? `Coaching Session Confirmed!\n\nYour session has been booked.\n\nSession Details:\n- Coach: ${coachName}\n- Date: ${sessionDate}\n- Time: ${sessionTime}\n- Duration: ${duration} minutes\n\nRemaining sessions: ${remainingSessions}\n\nView your sessions: ${dashboardUrl}\n\nQuestions? Contact us at ${EMAIL_BRANDING.company.supportEmail}`
    : `Séance de coaching confirmée!\n\nVotre séance a été réservée.\n\nDétails de la séance:\n- Coach: ${coachName}\n- Date: ${sessionDate}\n- Heure: ${sessionTime}\n- Durée: ${duration} minutes\n\nSéances restantes: ${remainingSessions}\n\nVoir vos séances: ${dashboardUrl}\n\nQuestions? Contactez-nous à ${EMAIL_BRANDING.company.supportEmail}`;
  
  return sendEmail({
    to: userEmail,
    subject,
    html,
    text,
  });
}
