/**
 * Email templates for application resubmission workflow
 */

interface ResubmissionEmailData {
  applicantName: string;
  applicantEmail: string;
  rejectionReason: string;
  resubmissionLink: string;
  language: "en" | "fr";
}

interface ResubmissionConfirmationData {
  applicantName: string;
  applicantEmail: string;
  language: "en" | "fr";
}

/**
 * Email template for rejection with resubmission option
 */
export function getRejectionWithResubmissionTemplate(data: ResubmissionEmailData): {
  subject: string;
  html: string;
} {
  const isEn = data.language === "en";

  const subject = isEn
    ? "Your Lingueefy Coach Application - Next Steps"
    : "Votre candidature de coach Lingueefy - Prochaines étapes";

  const html = isEn
    ? `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0ea5a5 0%, #0d9488 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .section { margin-bottom: 24px; }
    .section-title { font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 12px; }
    .reason-box { background: #fee2e2; border-left: 4px solid #dc2626; padding: 16px; border-radius: 4px; margin: 16px 0; }
    .reason-label { font-weight: 600; color: #7f1d1d; }
    .reason-text { color: #991b1b; margin-top: 8px; }
    .cta-button { display: inline-block; background: #0ea5a5; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Application Review Complete</h1>
    </div>
    <div class="content">
      <p>Dear ${data.applicantName},</p>
      
      <div class="section">
        <p>Thank you for applying to become a Lingueefy coach. We appreciate your interest in joining our community of language educators.</p>
      </div>
      
      <div class="section">
        <div class="section-title">Review Feedback</div>
        <div class="reason-box">
          <div class="reason-label">Reason for Review:</div>
          <div class="reason-text">${data.rejectionReason}</div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">What's Next?</div>
        <p>We encourage you to address the feedback above and resubmit your application. Many successful coaches have improved their applications based on our feedback.</p>
        
        <p>You can resubmit your application using the link below:</p>
        <a href="${data.resubmissionLink}" class="cta-button">Resubmit Your Application</a>
      </div>
      
      <div class="section">
        <p>If you have any questions about the feedback or need assistance with your resubmission, please don't hesitate to reach out to our support team.</p>
      </div>
      
      <div class="footer">
        <p>© 2026 Lingueefy. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `
    : `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0ea5a5 0%, #0d9488 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .section { margin-bottom: 24px; }
    .section-title { font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 12px; }
    .reason-box { background: #fee2e2; border-left: 4px solid #dc2626; padding: 16px; border-radius: 4px; margin: 16px 0; }
    .reason-label { font-weight: 600; color: #7f1d1d; }
    .reason-text { color: #991b1b; margin-top: 8px; }
    .cta-button { display: inline-block; background: #0ea5a5; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Examen de la candidature terminé</h1>
    </div>
    <div class="content">
      <p>Cher ${data.applicantName},</p>
      
      <div class="section">
        <p>Merci d'avoir postulé pour devenir coach Lingueefy. Nous apprécions votre intérêt à rejoindre notre communauté d'éducateurs en langues.</p>
      </div>
      
      <div class="section">
        <div class="section-title">Commentaires d'examen</div>
        <div class="reason-box">
          <div class="reason-label">Raison de l'examen :</div>
          <div class="reason-text">${data.rejectionReason}</div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">Prochaines étapes</div>
        <p>Nous vous encourageons à traiter les commentaires ci-dessus et à soumettre à nouveau votre candidature. De nombreux coaches réussis ont amélioré leurs candidatures en fonction de nos commentaires.</p>
        
        <p>Vous pouvez soumettre à nouveau votre candidature en utilisant le lien ci-dessous :</p>
        <a href="${data.resubmissionLink}" class="cta-button">Soumettre à nouveau votre candidature</a>
      </div>
      
      <div class="section">
        <p>Si vous avez des questions sur les commentaires ou si vous avez besoin d'aide pour soumettre à nouveau votre candidature, n'hésitez pas à contacter notre équipe d'assistance.</p>
      </div>
      
      <div class="footer">
        <p>© 2026 Lingueefy. Tous droits réservés.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

  return { subject, html };
}

/**
 * Email template for resubmission confirmation
 */
export function getResubmissionConfirmationTemplate(data: ResubmissionConfirmationData): {
  subject: string;
  html: string;
} {
  const isEn = data.language === "en";

  const subject = isEn
    ? "Your Resubmitted Application Has Been Received"
    : "Votre candidature révisée a été reçue";

  const html = isEn
    ? `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .section { margin-bottom: 24px; }
    .success-box { background: #dcfce7; border-left: 4px solid #16a34a; padding: 16px; border-radius: 4px; }
    .success-text { color: #166534; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Application Resubmitted</h1>
    </div>
    <div class="content">
      <p>Dear ${data.applicantName},</p>
      
      <div class="section">
        <div class="success-box">
          <div class="success-text">✓ Your resubmitted application has been successfully received and is now under review.</div>
        </div>
      </div>
      
      <div class="section">
        <p>Thank you for taking the time to address our feedback and resubmit your application. Our team will review your updated information and get back to you within 5-7 business days.</p>
      </div>
      
      <div class="section">
        <p>You can track the status of your application anytime by logging into your Lingueefy account and visiting your application dashboard.</p>
      </div>
      
      <div class="footer">
        <p>© 2026 Lingueefy. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `
    : `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .section { margin-bottom: 24px; }
    .success-box { background: #dcfce7; border-left: 4px solid #16a34a; padding: 16px; border-radius: 4px; }
    .success-text { color: #166534; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Candidature révisée soumise</h1>
    </div>
    <div class="content">
      <p>Cher ${data.applicantName},</p>
      
      <div class="section">
        <div class="success-box">
          <div class="success-text">✓ Votre candidature révisée a été reçue avec succès et est maintenant en cours d'examen.</div>
        </div>
      </div>
      
      <div class="section">
        <p>Merci d'avoir pris le temps de traiter nos commentaires et de soumettre à nouveau votre candidature. Notre équipe examinera vos informations mises à jour et vous répondra dans 5 à 7 jours ouvrables.</p>
      </div>
      
      <div class="section">
        <p>Vous pouvez suivre l'état de votre candidature à tout moment en vous connectant à votre compte Lingueefy et en visitant votre tableau de bord de candidature.</p>
      </div>
      
      <div class="footer">
        <p>© 2026 Lingueefy. Tous droits réservés.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

  return { subject, html };
}
