/**
 * Email Templates for Coach Terms Acceptance
 * 
 * Sends confirmation email when a coach accepts the terms and conditions.
 * Uses official Rusinga International Consulting Ltd. branding.
 */

import { sendEmail } from "./email";
import { EMAIL_BRANDING, generateEmailFooter } from "./email-branding";

interface CoachTermsAcceptanceEmailParams {
  coachName: string;
  coachEmail: string;
  acceptedAt: Date;
  termsVersion: string;
  language?: "en" | "fr";
}

/**
 * Send confirmation email after coach accepts terms and conditions
 */
export async function sendCoachTermsAcceptanceEmail(
  params: CoachTermsAcceptanceEmailParams
): Promise<boolean> {
  const { coachName, coachEmail, acceptedAt, termsVersion, language = "fr" } = params;
  
  const formattedDate = acceptedAt.toLocaleDateString(language === "fr" ? "fr-CA" : "en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const content = language === "fr" ? {
    subject: "Confirmation d'acceptation des Termes et Conditions - RusingÂcademy",
    greeting: `Bonjour ${coachName},`,
    intro: "Nous vous confirmons que vous avez accepté les Termes et Conditions pour les coachs de la plateforme RusingÂcademy.",
    detailsTitle: "Détails de l'acceptation",
    dateLabel: "Date d'acceptation",
    versionLabel: "Version des termes",
    commissionTitle: "Rappel : Structure de Commission",
    commissionText: "Conformément aux termes acceptés, une commission administrative de <strong>30%</strong> sera prélevée sur chaque paiement reçu via la plateforme. Cette commission couvre :",
    commissionItems: [
      "Logistique et infrastructure technologique",
      "Entretien et maintenance de la plateforme",
      "Formations et développement professionnel",
      "Marketing et acquisition de clients",
      "Support client et administration générale",
    ],
    coachShare: "Vous recevrez <strong>70%</strong> de chaque paiement directement sur votre compte Stripe Connect.",
    nextStepsTitle: "Prochaines étapes",
    nextSteps: [
      "Connectez votre compte Stripe pour recevoir vos paiements",
      "Complétez votre profil de coach",
      "Configurez vos disponibilités",
      "Commencez à accepter des réservations !",
    ],
    termsLink: "Vous pouvez consulter les termes complets à tout moment",
    viewTerms: "Voir les Termes et Conditions",
    questions: "Si vous avez des questions, n'hésitez pas à nous contacter.",
    signature: "L'équipe RusingÂcademy",
    legalNote: "Ce courriel confirme votre acceptation des Termes et Conditions. Veuillez conserver ce message pour vos dossiers.",
  } : {
    subject: "Terms and Conditions Acceptance Confirmation - RusingÂcademy",
    greeting: `Hello ${coachName},`,
    intro: "We confirm that you have accepted the Terms and Conditions for coaches on the RusingÂcademy platform.",
    detailsTitle: "Acceptance Details",
    dateLabel: "Acceptance Date",
    versionLabel: "Terms Version",
    commissionTitle: "Reminder: Commission Structure",
    commissionText: "As per the accepted terms, an administrative fee of <strong>30%</strong> will be deducted from each payment received through the platform. This commission covers:",
    commissionItems: [
      "Logistics and technology infrastructure",
      "Platform maintenance and updates",
      "Training and professional development",
      "Marketing and client acquisition",
      "Customer support and general administration",
    ],
    coachShare: "You will receive <strong>70%</strong> of each payment directly to your Stripe Connect account.",
    nextStepsTitle: "Next Steps",
    nextSteps: [
      "Connect your Stripe account to receive payments",
      "Complete your coach profile",
      "Set up your availability",
      "Start accepting bookings!",
    ],
    termsLink: "You can view the complete terms at any time",
    viewTerms: "View Terms and Conditions",
    questions: "If you have any questions, please don't hesitate to contact us.",
    signature: "The RusingÂcademy Team",
    legalNote: "This email confirms your acceptance of the Terms and Conditions. Please keep this message for your records.",
  };

  const html = `
<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.subject}</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      margin: 0; 
      padding: 0; 
      background: #f5f5f5; 
    }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header {
      background: linear-gradient(135deg, ${EMAIL_BRANDING.colors.primary} 0%, ${EMAIL_BRANDING.colors.primaryLight} 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .content { 
      background: white; 
      padding: 30px; 
      border-radius: 0 0 8px 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .details-box {
      background: #f0fdfa;
      border: 1px solid #99f6e4;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .commission-box {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .commission-items {
      margin: 15px 0;
      padding-left: 20px;
    }
    .commission-items li {
      margin: 8px 0;
      color: #666;
    }
    .next-steps {
      background: #f8fafc;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .next-steps ol {
      margin: 10px 0;
      padding-left: 20px;
    }
    .next-steps li {
      margin: 10px 0;
      color: #475569;
    }
    .button { 
      display: inline-block; 
      background: ${EMAIL_BRANDING.colors.primary}; 
      color: white !important; 
      padding: 12px 24px; 
      text-decoration: none; 
      border-radius: 6px; 
      margin: 15px 0;
      font-weight: 500;
    }
    .legal-note {
      background: #f1f5f9;
      border-left: 4px solid ${EMAIL_BRANDING.colors.primary};
      padding: 15px;
      margin: 20px 0;
      font-size: 13px;
      color: #64748b;
    }
    .company-info {
      text-align: center;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
    .company-name {
      font-weight: 600;
      color: #1e293b;
    }
    .trade-name {
      color: #64748b;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header with Logo -->
    <div class="header">
      <img src="${EMAIL_BRANDING.logos.banner}" alt="RusingÂcademy" style="max-width: 200px; height: auto; margin-bottom: 15px;" />
      <h1 style="margin: 0; font-size: 22px;">✅ ${language === "fr" ? "Confirmation d'Acceptation" : "Acceptance Confirmation"}</h1>
      <p style="margin: 10px 0 0; opacity: 0.9; font-size: 14px;">${language === "fr" ? "Termes et Conditions pour les Coachs" : "Coach Terms and Conditions"}</p>
    </div>
    
    <!-- Content -->
    <div class="content">
      <p>${content.greeting}</p>
      <p>${content.intro}</p>
      
      <!-- Acceptance Details -->
      <div class="details-box">
        <h3 style="margin: 0 0 15px; color: ${EMAIL_BRANDING.colors.primary};">📋 ${content.detailsTitle}</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; width: 150px;">${content.dateLabel}:</td>
            <td style="padding: 8px 0; font-weight: 500;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">${content.versionLabel}:</td>
            <td style="padding: 8px 0; font-weight: 500;">${termsVersion}</td>
          </tr>
        </table>
      </div>
      
      <!-- Commission Reminder -->
      <div class="commission-box">
        <h3 style="margin: 0 0 15px; color: #d97706;">💰 ${content.commissionTitle}</h3>
        <p style="margin: 0;">${content.commissionText}</p>
        <ul class="commission-items">
          ${content.commissionItems.map(item => `<li>${item}</li>`).join("")}
        </ul>
        <p style="margin: 15px 0 0; padding: 12px; background: white; border-radius: 6px; border: 1px solid #fde68a;">
          ${content.coachShare}
        </p>
      </div>
      
      <!-- Next Steps -->
      <div class="next-steps">
        <h3 style="margin: 0 0 15px; color: #1e293b;">🚀 ${content.nextStepsTitle}</h3>
        <ol>
          ${content.nextSteps.map(step => `<li>${step}</li>`).join("")}
        </ol>
      </div>
      
      <!-- View Terms Button -->
      <div style="text-align: center; margin: 25px 0;">
        <p style="margin: 0 0 10px; color: #64748b;">${content.termsLink}</p>
        <a href="https://ecosystem.rusingacademy.ca/coach/terms" class="button">${content.viewTerms}</a>
      </div>
      
      <!-- Questions -->
      <p>${content.questions}</p>
      
      <!-- Signature -->
      <p style="margin-top: 25px;">
        ${language === "fr" ? "Cordialement," : "Best regards,"}<br>
        <strong>${content.signature}</strong>
      </p>
      
      <!-- Legal Note -->
      <div class="legal-note">
        <strong>📌 ${language === "fr" ? "Note importante" : "Important Note"}:</strong><br>
        ${content.legalNote}
      </div>
      
      <!-- Company Info -->
      <div class="company-info">
        <p class="company-name">Rusinga International Consulting Ltd.</p>
        <p class="trade-name">${language === "fr" ? "Commercialement connue sous le nom de" : "Commercially known as"} « RusingÂcademy »</p>
      </div>
    </div>
    
    <!-- Footer -->
    ${generateEmailFooter(language)}
  </div>
</body>
</html>
  `;

  try {
    return await sendEmail({
      to: coachEmail,
      subject: content.subject,
      html,
    });
  } catch (error) {
    console.error("[Email] Failed to send coach terms acceptance email:", error);
    return false;
  }
}
