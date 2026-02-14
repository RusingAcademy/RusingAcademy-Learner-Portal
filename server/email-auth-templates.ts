/**
 * Email Templates for Authentication System
 * 
 * Templates for email verification, password reset, and welcome emails.
 */

import { sendEmail } from "./email";
import { EMAIL_BRANDING, generateEmailFooter } from "./email-branding";

interface VerificationEmailParams {
  to: string;
  name: string;
  verificationUrl: string;
  language?: "en" | "fr";
}

interface PasswordResetEmailParams {
  to: string;
  name: string;
  resetUrl: string;
  expiresInHours?: number;
  language?: "en" | "fr";
}

interface WelcomeEmailParams {
  to: string;
  name: string;
  role: "learner" | "coach";
  language?: "en" | "fr";
}

/**
 * Send email verification email
 */
export async function sendVerificationEmail(params: VerificationEmailParams): Promise<boolean> {
  const { to, name, verificationUrl, language = "en" } = params;
  
  const labels = language === "fr" ? {
    subject: "Vérifiez votre adresse e-mail - RusingAcademy",
    greeting: `Bonjour ${name},`,
    intro: "Merci de vous être inscrit à RusingAcademy! Veuillez vérifier votre adresse e-mail pour activer votre compte.",
    buttonText: "Vérifier mon e-mail",
    expiry: "Ce lien expire dans 24 heures.",
    ignore: "Si vous n'avez pas créé de compte, vous pouvez ignorer cet e-mail.",
    footer: "Besoin d'aide? Contactez-nous à support@rusingacademy.ca",
  } : {
    subject: "Verify your email address - RusingAcademy",
    greeting: `Hello ${name},`,
    intro: "Thank you for signing up for RusingAcademy! Please verify your email address to activate your account.",
    buttonText: "Verify my email",
    expiry: "This link expires in 24 hours.",
    ignore: "If you didn't create an account, you can safely ignore this email.",
    footer: "Need help? Contact us at support@rusingacademy.ca",
  };

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #0d9488; color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
    .button:hover { background: #0f766e; }
    .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    .legal { text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${EMAIL_BRANDING.logos.banner}" alt="RusingAcademy" style="max-width: 180px; height: auto; margin-bottom: 15px;" />
      <h1 style="margin: 0; font-size: 24px;">✉️ ${language === "fr" ? "Vérification de l'e-mail" : "Email Verification"}</h1>
    </div>
    <div class="content">
      <p>${labels.greeting}</p>
      <p>${labels.intro}</p>
      
      <div style="text-align: center;">
        <a href="${verificationUrl}" class="button">${labels.buttonText}</a>
      </div>
      
      <p style="color: #6b7280; font-size: 14px;">${labels.expiry}</p>
      <p style="color: #6b7280; font-size: 14px;">${labels.ignore}</p>
      
      <div class="footer">
        <p>${labels.footer}</p>
      </div>
      
      <div class="legal">
        <p>© ${new Date().getFullYear()} Rusinga International Consulting Ltd. (RusingAcademy)</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
${labels.greeting}

${labels.intro}

${labels.buttonText}: ${verificationUrl}

${labels.expiry}

${labels.ignore}

${labels.footer}

© ${new Date().getFullYear()} Rusinga International Consulting Ltd. (RusingAcademy)
  `;

  return sendEmail({
    to,
    subject: labels.subject,
    html,
    text,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(params: PasswordResetEmailParams): Promise<boolean> {
  const { to, name, resetUrl, expiresInHours = 1, language = "en" } = params;
  
  const labels = language === "fr" ? {
    subject: "Réinitialisation de votre mot de passe - RusingAcademy",
    greeting: `Bonjour ${name},`,
    intro: "Nous avons reçu une demande de réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe.",
    buttonText: "Réinitialiser mon mot de passe",
    expiry: `Ce lien expire dans ${expiresInHours} heure${expiresInHours > 1 ? "s" : ""}.`,
    ignore: "Si vous n'avez pas demandé de réinitialisation de mot de passe, vous pouvez ignorer cet e-mail. Votre mot de passe restera inchangé.",
    security: "Pour votre sécurité, ne partagez jamais ce lien avec qui que ce soit.",
    footer: "Besoin d'aide? Contactez-nous à support@rusingacademy.ca",
  } : {
    subject: "Reset your password - RusingAcademy",
    greeting: `Hello ${name},`,
    intro: "We received a request to reset your password. Click the button below to create a new password.",
    buttonText: "Reset my password",
    expiry: `This link expires in ${expiresInHours} hour${expiresInHours > 1 ? "s" : ""}.`,
    ignore: "If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.",
    security: "For your security, never share this link with anyone.",
    footer: "Need help? Contact us at support@rusingacademy.ca",
  };

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #0d9488; color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
    .button:hover { background: #0f766e; }
    .warning { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 12px; margin: 20px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    .legal { text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${EMAIL_BRANDING.logos.banner}" alt="RusingAcademy" style="max-width: 180px; height: auto; margin-bottom: 15px;" />
      <h1 style="margin: 0; font-size: 24px;">🔐 ${language === "fr" ? "Réinitialisation du mot de passe" : "Password Reset"}</h1>
    </div>
    <div class="content">
      <p>${labels.greeting}</p>
      <p>${labels.intro}</p>
      
      <div style="text-align: center;">
        <a href="${resetUrl}" class="button">${labels.buttonText}</a>
      </div>
      
      <p style="color: #6b7280; font-size: 14px;">${labels.expiry}</p>
      
      <div class="warning">
        <p style="margin: 0; font-size: 14px;">⚠️ ${labels.security}</p>
      </div>
      
      <p style="color: #6b7280; font-size: 14px;">${labels.ignore}</p>
      
      <div class="footer">
        <p>${labels.footer}</p>
      </div>
      
      <div class="legal">
        <p>© ${new Date().getFullYear()} Rusinga International Consulting Ltd. (RusingAcademy)</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
${labels.greeting}

${labels.intro}

${labels.buttonText}: ${resetUrl}

${labels.expiry}

⚠️ ${labels.security}

${labels.ignore}

${labels.footer}

© ${new Date().getFullYear()} Rusinga International Consulting Ltd. (RusingAcademy)
  `;

  return sendEmail({
    to,
    subject: labels.subject,
    html,
    text,
  });
}

/**
 * Send welcome email after successful registration
 */
export async function sendWelcomeEmail(params: WelcomeEmailParams): Promise<boolean> {
  const { to, name, role, language = "en" } = params;
  
  const isCoach = role === "coach";
  
  const labels = language === "fr" ? {
    subject: isCoach 
      ? "Bienvenue dans l'équipe de coaching RusingAcademy!" 
      : "Bienvenue sur RusingAcademy - Votre parcours bilingue commence!",
    greeting: `Bonjour ${name},`,
    intro: isCoach
      ? "Bienvenue dans l'équipe de coaching RusingAcademy! Nous sommes ravis de vous avoir parmi nous."
      : "Bienvenue sur RusingAcademy! Nous sommes ravis de vous accompagner dans votre parcours vers l'excellence bilingue.",
    nextSteps: "Prochaines étapes:",
    steps: isCoach ? [
      "Complétez votre profil de coach",
      "Configurez votre disponibilité",
      "Connectez votre compte Stripe pour les paiements",
      "Commencez à recevoir des réservations!",
    ] : [
      "Complétez votre profil d'apprenant",
      "Explorez nos coachs certifiés",
      "Réservez votre première session d'essai",
      "Commencez à pratiquer avec SLE AI Companion AI",
    ],
    buttonText: isCoach ? "Configurer mon profil" : "Explorer les coachs",
    buttonUrl: isCoach ? "https://www.rusingacademy.ca/coach/dashboard" : "https://www.rusingacademy.ca/coaches",
    footer: "Besoin d'aide? Contactez-nous à support@rusingacademy.ca",
  } : {
    subject: isCoach 
      ? "Welcome to the RusingAcademy coaching team!" 
      : "Welcome to RusingAcademy - Your bilingual journey begins!",
    greeting: `Hello ${name},`,
    intro: isCoach
      ? "Welcome to the RusingAcademy coaching team! We're thrilled to have you join us."
      : "Welcome to RusingAcademy! We're excited to support you on your journey to bilingual excellence.",
    nextSteps: "Next steps:",
    steps: isCoach ? [
      "Complete your coach profile",
      "Set up your availability",
      "Connect your Stripe account for payments",
      "Start receiving bookings!",
    ] : [
      "Complete your learner profile",
      "Explore our certified coaches",
      "Book your first trial session",
      "Start practicing with SLE AI Companion AI",
    ],
    buttonText: isCoach ? "Set up my profile" : "Explore coaches",
    buttonUrl: isCoach ? "https://www.rusingacademy.ca/coach/dashboard" : "https://www.rusingacademy.ca/coaches",
    footer: "Need help? Contact us at support@rusingacademy.ca",
  };

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
    .steps { background: #f0fdfa; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .step { display: flex; align-items: center; margin: 10px 0; }
    .step-number { background: #0d9488; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; margin-right: 12px; flex-shrink: 0; }
    .button { display: inline-block; background: #0d9488; color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
    .button:hover { background: #0f766e; }
    .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    .legal { text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${EMAIL_BRANDING.logos.banner}" alt="RusingAcademy" style="max-width: 180px; height: auto; margin-bottom: 15px;" />
      <h1 style="margin: 0; font-size: 24px;">🎉 ${language === "fr" ? "Bienvenue!" : "Welcome!"}</h1>
    </div>
    <div class="content">
      <p>${labels.greeting}</p>
      <p>${labels.intro}</p>
      
      <div class="steps">
        <p style="margin: 0 0 15px 0; font-weight: 600;">${labels.nextSteps}</p>
        ${labels.steps.map((step, i) => `
          <div class="step">
            <span class="step-number">${i + 1}</span>
            <span>${step}</span>
          </div>
        `).join("")}
      </div>
      
      <div style="text-align: center;">
        <a href="${labels.buttonUrl}" class="button">${labels.buttonText}</a>
      </div>
      
      <div class="footer">
        <p>${labels.footer}</p>
      </div>
      
      <div class="legal">
        <p>© ${new Date().getFullYear()} Rusinga International Consulting Ltd. (RusingAcademy)</p>
        <p><strong>Lingueefy</strong> - Master Your Second Language for the Public Service</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
${labels.greeting}

${labels.intro}

${labels.nextSteps}
${labels.steps.map((step, i) => `${i + 1}. ${step}`).join("\n")}

${labels.buttonText}: ${labels.buttonUrl}

${labels.footer}

© ${new Date().getFullYear()} Rusinga International Consulting Ltd. (RusingAcademy)
Lingueefy - Master Your Second Language for the Public Service
  `;

  return sendEmail({
    to,
    subject: labels.subject,
    html,
    text,
  });
}

/**
 * Send subscription confirmation email
 */
export async function sendSubscriptionConfirmationEmail(params: {
  to: string;
  name: string;
  planName: string;
  amount: number; // in cents
  interval: "month" | "year";
  nextBillingDate: Date;
  language?: "en" | "fr";
}): Promise<boolean> {
  const { to, name, planName, amount, interval, nextBillingDate, language = "en" } = params;
  
  const formattedAmount = (amount / 100).toFixed(2);
  const formattedDate = nextBillingDate.toLocaleDateString(language === "fr" ? "fr-CA" : "en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  const labels = language === "fr" ? {
    subject: `Confirmation d'abonnement - ${planName}`,
    greeting: `Bonjour ${name},`,
    intro: `Merci de vous être abonné à ${planName}! Votre abonnement est maintenant actif.`,
    details: "Détails de l'abonnement:",
    plan: "Plan",
    price: "Prix",
    billing: "Facturation",
    nextBilling: "Prochaine facturation",
    monthly: "Mensuel",
    annual: "Annuel",
    buttonText: "Gérer mon abonnement",
    footer: "Besoin d'aide? Contactez-nous à support@rusingacademy.ca",
  } : {
    subject: `Subscription Confirmed - ${planName}`,
    greeting: `Hello ${name},`,
    intro: `Thank you for subscribing to ${planName}! Your subscription is now active.`,
    details: "Subscription details:",
    plan: "Plan",
    price: "Price",
    billing: "Billing",
    nextBilling: "Next billing date",
    monthly: "Monthly",
    annual: "Annual",
    buttonText: "Manage my subscription",
    footer: "Need help? Contact us at support@rusingacademy.ca",
  };

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
    .details { background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .detail-row:last-child { border-bottom: none; }
    .label { color: #6b7280; }
    .value { font-weight: 600; }
    .button { display: inline-block; background: #0d9488; color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
    .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    .legal { text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${EMAIL_BRANDING.logos.banner}" alt="RusingAcademy" style="max-width: 180px; height: auto; margin-bottom: 15px;" />
      <h1 style="margin: 0; font-size: 24px;">✓ ${language === "fr" ? "Abonnement confirmé" : "Subscription Confirmed"}</h1>
    </div>
    <div class="content">
      <p>${labels.greeting}</p>
      <p>${labels.intro}</p>
      
      <div class="details">
        <p style="margin: 0 0 15px 0; font-weight: 600;">${labels.details}</p>
        <div class="detail-row">
          <span class="label">${labels.plan}</span>
          <span class="value">${planName}</span>
        </div>
        <div class="detail-row">
          <span class="label">${labels.price}</span>
          <span class="value">$${formattedAmount} CAD</span>
        </div>
        <div class="detail-row">
          <span class="label">${labels.billing}</span>
          <span class="value">${interval === "month" ? labels.monthly : labels.annual}</span>
        </div>
        <div class="detail-row">
          <span class="label">${labels.nextBilling}</span>
          <span class="value">${formattedDate}</span>
        </div>
      </div>
      
      <div style="text-align: center;">
        <a href="https://www.rusingacademy.ca/settings" class="button">${labels.buttonText}</a>
      </div>
      
      <div class="footer">
        <p>${labels.footer}</p>
      </div>
      
      <div class="legal">
        <p>© ${new Date().getFullYear()} Rusinga International Consulting Ltd. (RusingAcademy)</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
${labels.greeting}

${labels.intro}

${labels.details}
- ${labels.plan}: ${planName}
- ${labels.price}: $${formattedAmount} CAD
- ${labels.billing}: ${interval === "month" ? labels.monthly : labels.annual}
- ${labels.nextBilling}: ${formattedDate}

${labels.buttonText}: https://www.rusingacademy.ca/settings

${labels.footer}

© ${new Date().getFullYear()} Rusinga International Consulting Ltd. (RusingAcademy)
  `;

  return sendEmail({
    to,
    subject: labels.subject,
    html,
    text,
  });
}

/**
 * Send subscription cancellation email
 */
export async function sendSubscriptionCancellationEmail(params: {
  to: string;
  name: string;
  planName: string;
  endDate: Date;
  language?: "en" | "fr";
}): Promise<boolean> {
  const { to, name, planName, endDate, language = "en" } = params;
  
  const formattedDate = endDate.toLocaleDateString(language === "fr" ? "fr-CA" : "en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  const labels = language === "fr" ? {
    subject: `Confirmation d'annulation - ${planName}`,
    greeting: `Bonjour ${name},`,
    intro: `Nous avons bien reçu votre demande d'annulation de ${planName}.`,
    accessUntil: `Vous aurez toujours accès à toutes les fonctionnalités jusqu'au ${formattedDate}.`,
    reactivate: "Changé d'avis? Vous pouvez réactiver votre abonnement à tout moment.",
    buttonText: "Réactiver mon abonnement",
    footer: "Besoin d'aide? Contactez-nous à support@rusingacademy.ca",
  } : {
    subject: `Cancellation Confirmed - ${planName}`,
    greeting: `Hello ${name},`,
    intro: `We've received your request to cancel ${planName}.`,
    accessUntil: `You'll still have access to all features until ${formattedDate}.`,
    reactivate: "Changed your mind? You can reactivate your subscription at any time.",
    buttonText: "Reactivate my subscription",
    footer: "Need help? Contact us at support@rusingacademy.ca",
  };

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #6b7280 0%, #9ca3af 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
    .info-box { background: #f0fdfa; border: 1px solid #0d9488; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .button { display: inline-block; background: #0d9488; color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
    .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    .legal { text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${EMAIL_BRANDING.logos.banner}" alt="RusingAcademy" style="max-width: 180px; height: auto; margin-bottom: 15px;" />
      <h1 style="margin: 0; font-size: 24px;">${language === "fr" ? "Annulation confirmée" : "Cancellation Confirmed"}</h1>
    </div>
    <div class="content">
      <p>${labels.greeting}</p>
      <p>${labels.intro}</p>
      
      <div class="info-box">
        <p style="margin: 0;">📅 ${labels.accessUntil}</p>
      </div>
      
      <p>${labels.reactivate}</p>
      
      <div style="text-align: center;">
        <a href="https://www.rusingacademy.ca/settings" class="button">${labels.buttonText}</a>
      </div>
      
      <div class="footer">
        <p>${labels.footer}</p>
      </div>
      
      <div class="legal">
        <p>© ${new Date().getFullYear()} Rusinga International Consulting Ltd. (RusingAcademy)</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
${labels.greeting}

${labels.intro}

${labels.accessUntil}

${labels.reactivate}

${labels.buttonText}: https://www.rusingacademy.ca/settings

${labels.footer}

© ${new Date().getFullYear()} Rusinga International Consulting Ltd. (RusingAcademy)
  `;

  return sendEmail({
    to,
    subject: labels.subject,
    html,
    text,
  });
}
