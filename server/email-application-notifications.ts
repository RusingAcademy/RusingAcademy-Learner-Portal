import { sendEmail } from "./email";
import { EMAIL_BRANDING, generateEmailFooter } from "./email-branding";

interface ApplicationStatusEmailParams {
  applicantName: string;
  applicantEmail: string;
  status: "submitted" | "under_review" | "approved" | "rejected";
  reviewNotes?: string;
  rejectionReason?: string;
  language: "en" | "fr";
}

/**
 * Send application status notification email
 */
export async function sendApplicationStatusEmail(
  params: ApplicationStatusEmailParams
): Promise<boolean> {
  const isEn = params.language === "en";

  const templates = {
    en: {
      submitted: {
        subject: "Application Received - Lingueefy Coach Program",
        title: "Your Application Has Been Received",
        message:
          "Thank you for applying to become a coach at Lingueefy! We have received your application and will review it shortly.",
        nextSteps:
          "Our team will review your qualifications and experience. You will receive an email update within 5-7 business days.",
      },
      under_review: {
        subject: "Application Under Review - Lingueefy Coach Program",
        title: "Your Application is Under Review",
        message:
          "Your application is currently being reviewed by our team. We appreciate your patience as we evaluate your qualifications.",
        nextSteps:
          "We will notify you of the outcome within 3-5 business days. If we need any additional information, we will contact you directly.",
      },
      approved: {
        subject: "Congratulations! Your Application Has Been Approved",
        title: "Welcome to Lingueefy!",
        message:
          "Congratulations! We are pleased to inform you that your application has been approved. You are now a certified coach on the Lingueefy platform.",
        nextSteps:
          "Your coach profile is now live. You can start accepting learners and scheduling sessions. Log in to your dashboard to complete your profile and set your availability.",
      },
      rejected: {
        subject: "Application Status Update - Lingueefy Coach Program",
        title: "Application Status Update",
        message:
          "Thank you for your interest in joining Lingueefy. Unfortunately, we are unable to move forward with your application at this time.",
        nextSteps:
          "We encourage you to reapply in the future. If you have questions about this decision, please contact our team.",
      },
    },
    fr: {
      submitted: {
        subject: "Candidature reçue - Programme de coach Lingueefy",
        title: "Votre candidature a été reçue",
        message:
          "Merci d'avoir postulé pour devenir coach chez Lingueefy! Nous avons reçu votre candidature et l'examinerons bientôt.",
        nextSteps:
          "Notre équipe examinera vos qualifications et votre expérience. Vous recevrez une mise à jour par e-mail dans 5 à 7 jours ouvrables.",
      },
      under_review: {
        subject: "Candidature en cours d'examen - Programme de coach Lingueefy",
        title: "Votre candidature est en cours d'examen",
        message:
          "Votre candidature est actuellement examinée par notre équipe. Nous apprécions votre patience pendant que nous évaluons vos qualifications.",
        nextSteps:
          "Nous vous notifierons du résultat dans 3 à 5 jours ouvrables. Si nous avons besoin d'informations supplémentaires, nous vous contacterons directement.",
      },
      approved: {
        subject: "Félicitations! Votre candidature a été approuvée",
        title: "Bienvenue chez Lingueefy!",
        message:
          "Félicitations! Nous sommes heureux de vous informer que votre candidature a été approuvée. Vous êtes maintenant un coach certifié sur la plateforme Lingueefy.",
        nextSteps:
          "Votre profil de coach est maintenant en direct. Vous pouvez commencer à accepter des apprenants et à planifier des sessions. Connectez-vous à votre tableau de bord pour compléter votre profil et définir votre disponibilité.",
      },
      rejected: {
        subject: "Mise à jour du statut de la candidature - Programme de coach Lingueefy",
        title: "Mise à jour du statut de la candidature",
        message:
          "Merci de votre intérêt pour rejoindre Lingueefy. Malheureusement, nous ne pouvons pas poursuivre votre candidature pour le moment.",
        nextSteps:
          "Nous vous encourageons à postuler à nouveau à l'avenir. Si vous avez des questions concernant cette décision, veuillez contacter notre équipe.",
      },
    },
  };

  const lang = isEn ? templates.en : templates.fr;
  const template = lang[params.status];

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
    .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .greeting { font-size: 16px; margin-bottom: 20px; }
    .message { font-size: 16px; line-height: 1.8; margin-bottom: 20px; color: #555; }
    .status-badge { display: inline-block; padding: 8px 16px; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .status-submitted { background: #dbeafe; color: #1e40af; }
    .status-under_review { background: #fef3c7; color: #92400e; }
    .status-approved { background: #dcfce7; color: #166534; }
    .status-rejected { background: #fee2e2; color: #991b1b; }
    .next-steps { background: #f9fafb; padding: 20px; border-left: 4px solid #0d9488; margin: 20px 0; border-radius: 4px; }
    .next-steps h3 { margin: 0 0 10px 0; color: #0d9488; font-size: 14px; text-transform: uppercase; }
    .next-steps p { margin: 0; font-size: 14px; color: #666; }
    .notes { background: #f3f4f6; padding: 15px; border-radius: 4px; margin: 20px 0; font-size: 14px; color: #555; }
    .notes-label { font-weight: 600; color: #374151; margin-bottom: 8px; }
    .cta-button { display: inline-block; padding: 12px 24px; background: #0d9488; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: 600; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${template.title}</h1>
    </div>
    <div class="content">
      <p class="greeting">${isEn ? "Hello" : "Bonjour"} ${params.applicantName},</p>
      
      <p class="message">${template.message}</p>
      
      <div class="status-badge status-${params.status}">
        ${
          params.status === "submitted"
            ? isEn
              ? "Application Submitted"
              : "Candidature soumise"
            : params.status === "under_review"
              ? isEn
                ? "Under Review"
                : "En cours d'examen"
              : params.status === "approved"
                ? isEn
                  ? "Approved"
                  : "Approuvée"
                : isEn
                  ? "Not Approved"
                  : "Non approuvée"
        }
      </div>
      
      ${
        params.reviewNotes && params.status === "approved"
          ? `
      <div class="notes">
        <div class="notes-label">${isEn ? "Reviewer Notes:" : "Notes de l'examinateur:"}</div>
        <p>${params.reviewNotes}</p>
      </div>
      `
          : ""
      }
      
      ${
        params.rejectionReason && params.status === "rejected"
          ? `
      <div class="notes">
        <div class="notes-label">${isEn ? "Feedback:" : "Commentaires:"}</div>
        <p>${params.rejectionReason}</p>
      </div>
      `
          : ""
      }
      
      <div class="next-steps">
        <h3>${isEn ? "Next Steps" : "Prochaines étapes"}</h3>
        <p>${template.nextSteps}</p>
      </div>
      
      ${
        params.status === "approved"
          ? `
      <a href="https://www.rusingacademy.ca/coach/dashboard" class="cta-button">
        ${isEn ? "Go to Dashboard" : "Aller au tableau de bord"}
      </a>
      `
          : ""
      }
    </div>
    <div class="footer">
      ${generateEmailFooter(isEn ? "en" : "fr")}
    </div>
  </div>
</body>
</html>
  `;

  const text = `
${template.title}

${isEn ? "Hello" : "Bonjour"} ${params.applicantName},

${template.message}

${isEn ? "Status:" : "Statut:"} ${
    params.status === "submitted"
      ? isEn
        ? "Application Submitted"
        : "Candidature soumise"
      : params.status === "under_review"
        ? isEn
          ? "Under Review"
          : "En cours d'examen"
        : params.status === "approved"
          ? isEn
            ? "Approved"
            : "Approuvée"
          : isEn
            ? "Not Approved"
            : "Non approuvée"
  }

${template.nextSteps}
  `;

  return sendEmail({
    to: params.applicantEmail,
    subject: template.subject,
    html,
    text,
  });
}

/**
 * Send application status update notification to admin
 */
export async function sendAdminApplicationNotification(params: {
  applicantName: string;
  applicantEmail: string;
  status: "submitted" | "under_review" | "approved" | "rejected";
  adminEmail: string;
  reviewNotes?: string;
}): Promise<boolean> {
  const statusLabels = {
    submitted: "Application Submitted",
    under_review: "Application Moved to Under Review",
    approved: "Application Approved",
    rejected: "Application Rejected",
  };

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 600; }
    .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .info-row { display: flex; margin-bottom: 15px; }
    .info-label { font-weight: 600; width: 120px; color: #555; }
    .info-value { flex: 1; color: #333; }
    .notes { background: #f3f4f6; padding: 15px; border-radius: 4px; margin: 20px 0; }
    .notes-label { font-weight: 600; color: #374151; margin-bottom: 8px; }
    .cta-button { display: inline-block; padding: 12px 24px; background: #0d9488; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${statusLabels[params.status]}</h1>
    </div>
    <div class="content">
      <p>A coach application has been updated:</p>
      
      <div class="info-row">
        <div class="info-label">Name:</div>
        <div class="info-value">${params.applicantName}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Email:</div>
        <div class="info-value">${params.applicantEmail}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Status:</div>
        <div class="info-value">${statusLabels[params.status]}</div>
      </div>
      
      ${
        params.reviewNotes
          ? `
      <div class="notes">
        <div class="notes-label">Notes:</div>
        <p>${params.reviewNotes}</p>
      </div>
      `
          : ""
      }
      
      <a href="https://www.rusingacademy.ca/admin/coach-applications" class="cta-button">
        View in Dashboard
      </a>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: params.adminEmail,
    subject: `[Admin] ${statusLabels[params.status]} - ${params.applicantName}`,
    html,
  });
}
