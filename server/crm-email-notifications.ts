import { sendEmail } from "./email";

// Types
interface LeadInfo {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  source: string;
  formType: string;
  leadType: string;
  message?: string;
  budget?: string;
  timeline?: string;
  leadScore: number;
}

interface AdminInfo {
  name: string;
  email: string;
}

// Source display names
const sourceNames: Record<string, { en: string; fr: string }> = {
  lingueefy: { en: "Lingueefy", fr: "Lingueefy" },
  rusingacademy: { en: "RusingAcademy", fr: "RusingAcademy" },
  barholex: { en: "Barholex Media", fr: "Barholex Media" },
  ecosystem_hub: { en: "Ecosystem Hub", fr: "Hub Écosystème" },
  external: { en: "External", fr: "Externe" },
};

// Lead type display names
const leadTypeNames: Record<string, { en: string; fr: string }> = {
  individual: { en: "Individual", fr: "Individuel" },
  organization: { en: "Organization", fr: "Organisation" },
  government: { en: "Government", fr: "Gouvernement" },
  enterprise: { en: "Enterprise", fr: "Entreprise" },
};

// Status display names
const statusNames: Record<string, { en: string; fr: string }> = {
  new: { en: "New", fr: "Nouveau" },
  contacted: { en: "Contacted", fr: "Contacté" },
  qualified: { en: "Qualified", fr: "Qualifié" },
  proposal_sent: { en: "Proposal Sent", fr: "Proposition envoyée" },
  negotiating: { en: "Negotiating", fr: "En négociation" },
  won: { en: "Won", fr: "Gagné" },
  lost: { en: "Lost", fr: "Perdu" },
  nurturing: { en: "Nurturing", fr: "En nurturing" },
};

// Score color based on value
function getScoreColor(score: number): string {
  if (score >= 70) return "#10B981"; // green
  if (score >= 40) return "#F59E0B"; // yellow
  return "#EF4444"; // red
}

// Score label
function getScoreLabel(score: number, lang: "en" | "fr"): string {
  if (score >= 70) return lang === "en" ? "Hot Lead" : "Prospect chaud";
  if (score >= 40) return lang === "en" ? "Warm Lead" : "Prospect tiède";
  return lang === "en" ? "Cold Lead" : "Prospect froid";
}

/**
 * Send notification when a new lead is created
 */
export async function sendNewLeadNotification(
  lead: LeadInfo,
  recipients: AdminInfo[],
  lang: "en" | "fr" = "en"
) {
  const sourceName = sourceNames[lead.source]?.[lang] || lead.source;
  const leadTypeName = leadTypeNames[lead.leadType]?.[lang] || lead.leadType;
  const scoreColor = getScoreColor(lead.leadScore);
  const scoreLabel = getScoreLabel(lead.leadScore, lang);

  const subject = lang === "en"
    ? `🔔 New Lead from ${sourceName}: ${lead.firstName} ${lead.lastName}`
    : `🔔 Nouveau prospect de ${sourceName}: ${lead.firstName} ${lead.lastName}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #009688 0%, #00796B 100%); border-radius: 16px 16px 0 0; padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">
        ${lang === "en" ? "New Lead Alert" : "Alerte nouveau prospect"}
      </h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">
        ${lang === "en" ? "A new lead has been captured" : "Un nouveau prospect a été capturé"}
      </p>
    </div>

    <!-- Content -->
    <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <!-- Lead Score Badge -->
      <div style="text-align: center; margin-bottom: 25px;">
        <div style="display: inline-block; background: ${scoreColor}20; border: 2px solid ${scoreColor}; border-radius: 50px; padding: 10px 25px;">
          <span style="color: ${scoreColor}; font-weight: bold; font-size: 18px;">
            ${lang === "en" ? "Score" : "Score"}: ${lead.leadScore}/100
          </span>
          <span style="color: ${scoreColor}; font-size: 14px; margin-left: 10px;">
            (${scoreLabel})
          </span>
        </div>
      </div>

      <!-- Lead Info Card -->
      <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <h2 style="margin: 0 0 15px 0; color: #1e293b; font-size: 20px;">
          ${lead.firstName} ${lead.lastName}
        </h2>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; width: 120px;">Email:</td>
            <td style="padding: 8px 0; color: #1e293b;">
              <a href="mailto:${lead.email}" style="color: #009688;">${lead.email}</a>
            </td>
          </tr>
          ${lead.phone ? `
          <tr>
            <td style="padding: 8px 0; color: #64748b;">${lang === "en" ? "Phone" : "Téléphone"}:</td>
            <td style="padding: 8px 0; color: #1e293b;">${lead.phone}</td>
          </tr>
          ` : ""}
          ${lead.company ? `
          <tr>
            <td style="padding: 8px 0; color: #64748b;">${lang === "en" ? "Company" : "Entreprise"}:</td>
            <td style="padding: 8px 0; color: #1e293b;">${lead.company}</td>
          </tr>
          ` : ""}
          ${lead.jobTitle ? `
          <tr>
            <td style="padding: 8px 0; color: #64748b;">${lang === "en" ? "Title" : "Titre"}:</td>
            <td style="padding: 8px 0; color: #1e293b;">${lead.jobTitle}</td>
          </tr>
          ` : ""}
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Source:</td>
            <td style="padding: 8px 0;">
              <span style="background: #009688; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px;">
                ${sourceName}
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Type:</td>
            <td style="padding: 8px 0;">
              <span style="background: #6366f1; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px;">
                ${leadTypeName}
              </span>
            </td>
          </tr>
          ${lead.budget ? `
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Budget:</td>
            <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${lead.budget}</td>
          </tr>
          ` : ""}
          ${lead.timeline ? `
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Timeline:</td>
            <td style="padding: 8px 0; color: #1e293b;">${lead.timeline}</td>
          </tr>
          ` : ""}
        </table>
      </div>

      ${lead.message ? `
      <!-- Message -->
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 0 8px 8px 0; margin-bottom: 20px;">
        <p style="margin: 0 0 5px 0; color: #92400e; font-weight: 600; font-size: 14px;">
          ${lang === "en" ? "Message from lead:" : "Message du prospect:"}
        </p>
        <p style="margin: 0; color: #78350f; font-style: italic;">
          "${lead.message}"
        </p>
      </div>
      ` : ""}

      <!-- CTA Button -->
      <div style="text-align: center; margin-top: 25px;">
        <a href="${process.env.VITE_APP_URL || "https://www.rusingacademy.ca"}/admin/crm/${lead.id}" 
           style="display: inline-block; background: linear-gradient(135deg, #009688 0%, #00796B 100%); color: white; padding: 14px 35px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
          ${lang === "en" ? "View Lead Details" : "Voir les détails"}
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 20px; color: #64748b; font-size: 12px;">
      <p style="margin: 0;">
        ${lang === "en" 
          ? "This is an automated notification from Lingueefy CRM" 
          : "Ceci est une notification automatique du CRM Lingueefy"}
      </p>
      <p style="margin: 5px 0 0 0;">
        © 2026 Rusinga International Consulting Ltd.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  // Send to all recipients
  for (const recipient of recipients) {
    await sendEmail({
      to: recipient.email,
      subject,
      html,
    });
  }
}

/**
 * Send notification when lead status changes
 */
export async function sendLeadStatusChangeNotification(
  lead: LeadInfo,
  previousStatus: string,
  newStatus: string,
  changedBy: AdminInfo,
  recipients: AdminInfo[],
  lang: "en" | "fr" = "en"
) {
  const prevStatusName = statusNames[previousStatus]?.[lang] || previousStatus;
  const newStatusName = statusNames[newStatus]?.[lang] || newStatus;

  const subject = lang === "en"
    ? `📊 Lead Status Updated: ${lead.firstName} ${lead.lastName} → ${newStatusName}`
    : `📊 Statut du prospect mis à jour: ${lead.firstName} ${lead.lastName} → ${newStatusName}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); border-radius: 16px 16px 0 0; padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">
        ${lang === "en" ? "Lead Status Updated" : "Statut du prospect mis à jour"}
      </h1>
    </div>

    <!-- Content -->
    <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <!-- Status Change Visual -->
      <div style="text-align: center; margin-bottom: 25px;">
        <span style="background: #f1f5f9; color: #64748b; padding: 8px 16px; border-radius: 20px; text-decoration: line-through;">
          ${prevStatusName}
        </span>
        <span style="margin: 0 15px; color: #64748b;">→</span>
        <span style="background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-weight: 600;">
          ${newStatusName}
        </span>
      </div>

      <!-- Lead Info -->
      <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <h2 style="margin: 0 0 10px 0; color: #1e293b; font-size: 18px;">
          ${lead.firstName} ${lead.lastName}
        </h2>
        <p style="margin: 0; color: #64748b;">
          ${lead.email}${lead.company ? ` • ${lead.company}` : ""}
        </p>
      </div>

      <!-- Changed By -->
      <p style="text-align: center; color: #64748b; font-size: 14px;">
        ${lang === "en" ? "Changed by" : "Modifié par"}: <strong>${changedBy.name}</strong>
      </p>

      <!-- CTA -->
      <div style="text-align: center; margin-top: 25px;">
        <a href="${process.env.VITE_APP_URL || "https://www.rusingacademy.ca"}/admin/crm/${lead.id}" 
           style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 14px 35px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          ${lang === "en" ? "View Lead" : "Voir le prospect"}
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 20px; color: #64748b; font-size: 12px;">
      <p style="margin: 0;">© 2026 Rusinga International Consulting Ltd.</p>
    </div>
  </div>
</body>
</html>
  `;

  for (const recipient of recipients) {
    if (recipient.email !== changedBy.email) {
      await sendEmail({
        to: recipient.email,
        subject,
        html,
      });
    }
  }
}

/**
 * Send notification when lead is assigned
 */
export async function sendLeadAssignmentNotification(
  lead: LeadInfo,
  assignedTo: AdminInfo,
  assignedBy: AdminInfo,
  lang: "en" | "fr" = "en"
) {
  const sourceName = sourceNames[lead.source]?.[lang] || lead.source;
  const scoreColor = getScoreColor(lead.leadScore);

  const subject = lang === "en"
    ? `👤 Lead Assigned to You: ${lead.firstName} ${lead.lastName}`
    : `👤 Prospect assigné: ${lead.firstName} ${lead.lastName}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 16px 16px 0 0; padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">
        ${lang === "en" ? "New Lead Assignment" : "Nouvelle assignation de prospect"}
      </h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">
        ${lang === "en" 
          ? `${assignedBy.name} has assigned you a new lead` 
          : `${assignedBy.name} vous a assigné un nouveau prospect`}
      </p>
    </div>

    <!-- Content -->
    <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <!-- Lead Score -->
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="background: ${scoreColor}20; color: ${scoreColor}; padding: 8px 20px; border-radius: 20px; font-weight: 600;">
          Score: ${lead.leadScore}/100
        </span>
      </div>

      <!-- Lead Card -->
      <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <h2 style="margin: 0 0 15px 0; color: #1e293b; font-size: 20px;">
          ${lead.firstName} ${lead.lastName}
        </h2>
        
        <p style="margin: 0 0 10px 0;">
          <strong>Email:</strong> <a href="mailto:${lead.email}" style="color: #009688;">${lead.email}</a>
        </p>
        ${lead.phone ? `<p style="margin: 0 0 10px 0;"><strong>${lang === "en" ? "Phone" : "Téléphone"}:</strong> ${lead.phone}</p>` : ""}
        ${lead.company ? `<p style="margin: 0 0 10px 0;"><strong>${lang === "en" ? "Company" : "Entreprise"}:</strong> ${lead.company}</p>` : ""}
        <p style="margin: 0;">
          <strong>Source:</strong> 
          <span style="background: #009688; color: white; padding: 2px 10px; border-radius: 10px; font-size: 12px;">${sourceName}</span>
        </p>
      </div>

      ${lead.message ? `
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 0 8px 8px 0; margin-bottom: 20px;">
        <p style="margin: 0 0 5px 0; color: #92400e; font-weight: 600; font-size: 14px;">
          ${lang === "en" ? "Their message:" : "Leur message:"}
        </p>
        <p style="margin: 0; color: #78350f; font-style: italic;">"${lead.message}"</p>
      </div>
      ` : ""}

      <!-- CTA -->
      <div style="text-align: center; margin-top: 25px;">
        <a href="${process.env.VITE_APP_URL || "https://www.rusingacademy.ca"}/admin/crm/${lead.id}" 
           style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 14px 35px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          ${lang === "en" ? "Start Working on Lead" : "Commencer à travailler"}
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 20px; color: #64748b; font-size: 12px;">
      <p style="margin: 0;">© 2026 Rusinga International Consulting Ltd.</p>
    </div>
  </div>
</body>
</html>
  `;

  await sendEmail({
    to: assignedTo.email,
    subject,
    html,
  });
}

/**
 * Send daily digest of new leads
 */
export async function sendDailyLeadDigest(
  leads: LeadInfo[],
  recipients: AdminInfo[],
  lang: "en" | "fr" = "en"
) {
  if (leads.length === 0) return;

  const subject = lang === "en"
    ? `📈 Daily Lead Digest: ${leads.length} new lead${leads.length > 1 ? "s" : ""}`
    : `📈 Résumé quotidien: ${leads.length} nouveau${leads.length > 1 ? "x" : ""} prospect${leads.length > 1 ? "s" : ""}`;

  const leadsHtml = leads.map(lead => {
    const sourceName = sourceNames[lead.source]?.[lang] || lead.source;
    const scoreColor = getScoreColor(lead.leadScore);
    
    return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
          <strong>${lead.firstName} ${lead.lastName}</strong><br>
          <span style="color: #64748b; font-size: 13px;">${lead.email}</span>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
          <span style="background: #009688; color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px;">
            ${sourceName}
          </span>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">
          <span style="color: ${scoreColor}; font-weight: 600;">${lead.leadScore}</span>
        </td>
      </tr>
    `;
  }).join("");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #009688 0%, #00796B 100%); border-radius: 16px 16px 0 0; padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">
        ${lang === "en" ? "Daily Lead Digest" : "Résumé quotidien des prospects"}
      </h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 36px; font-weight: bold;">
        ${leads.length}
      </p>
      <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0 0;">
        ${lang === "en" ? "new leads today" : "nouveaux prospects aujourd'hui"}
      </p>
    </div>

    <!-- Content -->
    <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f8fafc;">
            <th style="padding: 12px; text-align: left; color: #64748b; font-size: 12px; text-transform: uppercase;">
              ${lang === "en" ? "Lead" : "Prospect"}
            </th>
            <th style="padding: 12px; text-align: left; color: #64748b; font-size: 12px; text-transform: uppercase;">
              Source
            </th>
            <th style="padding: 12px; text-align: center; color: #64748b; font-size: 12px; text-transform: uppercase;">
              Score
            </th>
          </tr>
        </thead>
        <tbody>
          ${leadsHtml}
        </tbody>
      </table>

      <!-- CTA -->
      <div style="text-align: center; margin-top: 25px;">
        <a href="${process.env.VITE_APP_URL || "https://www.rusingacademy.ca"}/admin/crm" 
           style="display: inline-block; background: linear-gradient(135deg, #009688 0%, #00796B 100%); color: white; padding: 14px 35px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          ${lang === "en" ? "View All Leads" : "Voir tous les prospects"}
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 20px; color: #64748b; font-size: 12px;">
      <p style="margin: 0;">© 2026 Rusinga International Consulting Ltd.</p>
    </div>
  </div>
</body>
</html>
  `;

  for (const recipient of recipients) {
    await sendEmail({
      to: recipient.email,
      subject,
      html,
    });
  }
}
