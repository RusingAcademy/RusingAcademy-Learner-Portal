/**
 * Email templates for admin notifications
 */

interface NewApplicationNotificationData {
  applicantName: string;
  applicantEmail: string;
  teachingLanguage: string;
  yearsTeaching?: number;
  city?: string;
  applicationLink: string;
  language: "en" | "fr";
}

interface BulkActionNotificationData {
  actionType: "approved" | "rejected";
  count: number;
  dashboardLink: string;
  language: "en" | "fr";
}

/**
 * Email template for new application notification
 */
export function getNewApplicationNotificationTemplate(data: NewApplicationNotificationData): {
  subject: string;
  html: string;
} {
  const isEn = data.language === "en";

  const subject = isEn
    ? `New Coach Application: ${data.applicantName}`
    : `Nouvelle candidature de coach : ${data.applicantName}`;

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
    .info-box { background: white; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin: 12px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
    .info-row:last-child { border-bottom: none; }
    .info-label { font-weight: 600; color: #6b7280; }
    .info-value { color: #1f2937; }
    .cta-button { display: inline-block; background: #0ea5a5; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .badge { display: inline-block; background: #dbeafe; color: #0369a1; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Coach Application</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Requires Review</p>
    </div>
    <div class="content">
      <p>A new coach application has been submitted and requires your review.</p>
      
      <div class="section">
        <div class="section-title">Applicant Information</div>
        <div class="info-box">
          <div class="info-row">
            <span class="info-label">Name:</span>
            <span class="info-value">${data.applicantName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Email:</span>
            <span class="info-value">${data.applicantEmail}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Teaching Language:</span>
            <span class="info-value"><span class="badge">${data.teachingLanguage}</span></span>
          </div>
          ${
            data.yearsTeaching
              ? `<div class="info-row">
            <span class="info-label">Experience:</span>
            <span class="info-value">${data.yearsTeaching} years</span>
          </div>`
              : ""
          }
          ${
            data.city
              ? `<div class="info-row">
            <span class="info-label">Location:</span>
            <span class="info-value">${data.city}</span>
          </div>`
              : ""
          }
        </div>
      </div>
      
      <div class="section">
        <p>Review the complete application and provide feedback:</p>
        <a href="${data.applicationLink}" class="cta-button">Review Application</a>
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
    .info-box { background: white; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin: 12px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
    .info-row:last-child { border-bottom: none; }
    .info-label { font-weight: 600; color: #6b7280; }
    .info-value { color: #1f2937; }
    .cta-button { display: inline-block; background: #0ea5a5; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .badge { display: inline-block; background: #dbeafe; color: #0369a1; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Nouvelle candidature de coach</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Nécessite un examen</p>
    </div>
    <div class="content">
      <p>Une nouvelle candidature de coach a été soumise et nécessite votre examen.</p>
      
      <div class="section">
        <div class="section-title">Informations du candidat</div>
        <div class="info-box">
          <div class="info-row">
            <span class="info-label">Nom :</span>
            <span class="info-value">${data.applicantName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">E-mail :</span>
            <span class="info-value">${data.applicantEmail}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Langue d'enseignement :</span>
            <span class="info-value"><span class="badge">${data.teachingLanguage}</span></span>
          </div>
          ${
            data.yearsTeaching
              ? `<div class="info-row">
            <span class="info-label">Expérience :</span>
            <span class="info-value">${data.yearsTeaching} ans</span>
          </div>`
              : ""
          }
          ${
            data.city
              ? `<div class="info-row">
            <span class="info-label">Localisation :</span>
            <span class="info-value">${data.city}</span>
          </div>`
              : ""
          }
        </div>
      </div>
      
      <div class="section">
        <p>Examinez la candidature complète et fournissez des commentaires :</p>
        <a href="${data.applicationLink}" class="cta-button">Examiner la candidature</a>
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
 * Email template for bulk action notification
 */
export function getBulkActionNotificationTemplate(data: BulkActionNotificationData): {
  subject: string;
  html: string;
} {
  const isEn = data.language === "en";
  const isApproved = data.actionType === "approved";

  const subject = isEn
    ? `${data.count} Applications ${isApproved ? "Approved" : "Rejected"}`
    : `${data.count} candidatures ${isApproved ? "approuvées" : "rejetées"}`;

  const statusColor = isApproved ? "#10b981" : "#ef4444";
  const statusBg = isApproved ? "#dcfce7" : "#fee2e2";
  const statusBorder = isApproved ? "#86efac" : "#fca5a5";

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
    .status-box { background: ${statusBg}; border: 2px solid ${statusBorder}; border-radius: 8px; padding: 20px; text-align: center; }
    .status-number { font-size: 36px; font-weight: 700; color: ${statusColor}; }
    .status-text { color: ${statusColor}; font-weight: 600; margin-top: 8px; }
    .cta-button { display: inline-block; background: #0ea5a5; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Bulk Action Completed</h1>
    </div>
    <div class="content">
      <div class="status-box">
        <div class="status-number">${data.count}</div>
        <div class="status-text">Applications ${isApproved ? "Approved" : "Rejected"}</div>
      </div>
      
      <p style="margin-top: 24px;">A bulk action has been completed on the admin dashboard. ${data.count} application${data.count !== 1 ? "s have" : " has"} been ${isApproved ? "approved" : "rejected"}.</p>
      
      <p>View the updated dashboard to see the changes:</p>
      <a href="${data.dashboardLink}" class="cta-button">View Dashboard</a>
      
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
    .status-box { background: ${statusBg}; border: 2px solid ${statusBorder}; border-radius: 8px; padding: 20px; text-align: center; }
    .status-number { font-size: 36px; font-weight: 700; color: ${statusColor}; }
    .status-text { color: ${statusColor}; font-weight: 600; margin-top: 8px; }
    .cta-button { display: inline-block; background: #0ea5a5; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Action en masse terminée</h1>
    </div>
    <div class="content">
      <div class="status-box">
        <div class="status-number">${data.count}</div>
        <div class="status-text">Candidatures ${isApproved ? "approuvées" : "rejetées"}</div>
      </div>
      
      <p style="margin-top: 24px;">Une action en masse a été complétée sur le tableau de bord administrateur. ${data.count} candidature${data.count !== 1 ? "s ont" : " a"} été ${isApproved ? "approuvée" : "rejetée"}${data.count !== 1 ? "s" : ""}.</p>
      
      <p>Consultez le tableau de bord mis à jour pour voir les modifications :</p>
      <a href="${data.dashboardLink}" class="cta-button">Afficher le tableau de bord</a>
      
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
