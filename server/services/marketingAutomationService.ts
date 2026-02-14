/**
 * Marketing Automation Service
 * 
 * Handles automated email sequences for lead nurturing
 * using SendGrid for email delivery.
 * 
 * Sequence:
 * - Email 1 (Immediate): Diagnostic report delivery
 * - Email 2 (+24h): Success story testimonial
 * - Email 3 (+48h): Free coaching session invitation
 * 
 * @module marketingAutomationService
 */

import sgMail from '@sendgrid/mail';

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

// Types
interface LeadData {
  firstName: string;
  lastName: string;
  email: string;
  targetLevel: 'A' | 'B' | 'C';
  scores: {
    comprehensionEcrite: number;
    expressionEcrite: number;
    interactionOrale: number;
  };
  leadSource: string;
  capturedAt: string;
}

interface EmailSequenceJob {
  leadId: string;
  email: string;
  firstName: string;
  sequenceStep: number;
  scheduledAt: Date;
  status: 'pending' | 'sent' | 'failed';
}

// Email sequence delays (in milliseconds)
const SEQUENCE_DELAYS = {
  STEP_1: 0, // Immediate
  STEP_2: 24 * 60 * 60 * 1000, // 24 hours
  STEP_3: 48 * 60 * 60 * 1000, // 48 hours
};

/**
 * Start the email nurturing sequence for a new lead
 */
export async function startNurturingSequence(
  lead: LeadData,
  pdfUrl: string,
  calendarUrl: string = 'https://rusingacademy.com/book-session'
): Promise<void> {
  // Email 1: Immediate - Diagnostic Report
  await sendDiagnosticReportEmail(lead, pdfUrl);
  
  // Schedule Email 2: +24h - Success Story
  setTimeout(async () => {
    await sendSuccessStoryEmail(lead);
  }, SEQUENCE_DELAYS.STEP_2);
  
  // Schedule Email 3: +48h - Free Coaching Invitation
  setTimeout(async () => {
    await sendFreeCoachingInvitationEmail(lead, calendarUrl);
  }, SEQUENCE_DELAYS.STEP_3);
  
  console.log(`[Marketing Automation] Nurturing sequence started for ${lead.email}`);
}

/**
 * Send diagnostic report email (Email 1)
 */
async function sendDiagnosticReportEmail(lead: LeadData, pdfUrl: string): Promise<void> {
  const msg = {
    to: lead.email,
    from: {
      email: 'noreply@rusingacademy.com',
      name: 'RusingÂcademy',
    },
    subject: `${lead.firstName}, votre rapport de diagnostic linguistique est prêt`,
    html: generateDiagnosticReportHtml(lead, pdfUrl),
  };

  try {
    await sgMail.send(msg);
    console.log(`[Email 1] Diagnostic report sent to ${lead.email}`);
  } catch (error) {
    console.error(`[Email 1] Failed to send to ${lead.email}:`, error);
    throw error;
  }
}

/**
 * Send success story email (Email 2)
 */
async function sendSuccessStoryEmail(lead: LeadData): Promise<void> {
  const msg = {
    to: lead.email,
    from: {
      email: 'noreply@rusingacademy.com',
      name: 'RusingÂcademy',
    },
    subject: `${lead.firstName}, découvrez comment Marie a obtenu son niveau C en 10 semaines`,
    html: generateSuccessStoryHtml(lead),
  };

  try {
    await sgMail.send(msg);
    console.log(`[Email 2] Success story sent to ${lead.email}`);
  } catch (error) {
    console.error(`[Email 2] Failed to send to ${lead.email}:`, error);
  }
}

/**
 * Send free coaching invitation email (Email 3)
 */
async function sendFreeCoachingInvitationEmail(
  lead: LeadData,
  calendarUrl: string
): Promise<void> {
  const msg = {
    to: lead.email,
    from: {
      email: 'noreply@rusingacademy.com',
      name: 'RusingÂcademy',
    },
    subject: `${lead.firstName}, votre session de coaching gratuite vous attend`,
    html: generateFreeCoachingHtml(lead, calendarUrl),
  };

  try {
    await sgMail.send(msg);
    console.log(`[Email 3] Free coaching invitation sent to ${lead.email}`);
  } catch (error) {
    console.error(`[Email 3] Failed to send to ${lead.email}:`, error);
  }
}

// HTML Template Generators
function generateDiagnosticReportHtml(lead: LeadData, pdfUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1A1A1A; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1E3A5F 0%, #2D4A6F 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #FFFFFF; padding: 30px; border: 1px solid #E5E7EB; }
        .score-box { background: #F8F9FA; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .cta-button { display: inline-block; background: #C9A227; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; }
        .footer { background: #F8F9FA; padding: 20px; text-align: center; font-size: 12px; color: #6B7280; border-radius: 0 0 8px 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 24px;">RusingÂcademy</h1>
          <p style="margin: 10px 0 0; opacity: 0.9;">Votre Diagnostic Linguistique</p>
        </div>
        <div class="content">
          <p>Bonjour ${lead.firstName},</p>
          <p>Merci d'avoir complété notre diagnostic linguistique gratuit.</p>
          <div class="score-box">
            <h3 style="margin-top: 0; color: #1E3A5F;">Vos Scores</h3>
            <p>Compréhension écrite: <strong>${lead.scores.comprehensionEcrite}%</strong></p>
            <p>Expression écrite: <strong>${lead.scores.expressionEcrite}%</strong></p>
            <p>Interaction orale: <strong>${lead.scores.interactionOrale}%</strong></p>
          </div>
          <p><strong>Objectif déclaré :</strong> Niveau ${lead.targetLevel}</p>
          <center>
            <a href="${pdfUrl}" class="cta-button">Télécharger Mon Rapport PDF</a>
          </center>
          <p>À bientôt,<br><strong>L'équipe RusingÂcademy</strong></p>
        </div>
        <div class="footer">
          <p>© 2026 Rusinga International Consulting Ltd.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateSuccessStoryHtml(lead: LeadData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1A1A1A; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1E3A5F 0%, #2D4A6F 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #FFFFFF; padding: 30px; border: 1px solid #E5E7EB; }
        .testimonial { background: #F8F9FA; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #C9A227; }
        .cta-button { display: inline-block; background: #C9A227; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; }
        .footer { background: #F8F9FA; padding: 20px; text-align: center; font-size: 12px; color: #6B7280; border-radius: 0 0 8px 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 24px;">RusingÂcademy</h1>
          <p style="margin: 10px 0 0; opacity: 0.9;">Histoires de Réussite</p>
        </div>
        <div class="content">
          <p>Bonjour ${lead.firstName},</p>
          <p>Hier, vous avez découvert votre niveau actuel. Aujourd'hui, je voulais vous partager l'histoire de Marie.</p>
          <div class="testimonial">
            <p style="font-style: italic; margin-top: 0;">"J'avais échoué deux fois à l'ELS niveau C. Après 10 semaines avec RusingÂcademy, j'ai obtenu C-C-C."</p>
            <p style="margin-bottom: 0;"><strong>— Marie L.</strong><br>
            <span style="color: #6B7280;">Directrice, Ministère des Finances</span></p>
          </div>
          <p>Vous aussi, vous pouvez atteindre votre objectif de niveau ${lead.targetLevel}.</p>
          <center>
            <a href="https://rusingacademy.com/programs" class="cta-button">Découvrir Nos Programmes</a>
          </center>
          <p>À demain,<br><strong>L'équipe RusingÂcademy</strong></p>
        </div>
        <div class="footer">
          <p>© 2026 Rusinga International Consulting Ltd.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateFreeCoachingHtml(lead: LeadData, calendarUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1A1A1A; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1E3A5F 0%, #2D4A6F 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #FFFFFF; padding: 30px; border: 1px solid #E5E7EB; }
        .offer-box { background: linear-gradient(135deg, #C9A227 0%, #D4AF37 100%); color: white; padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .cta-button { display: inline-block; background: #C9A227; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; }
        .footer { background: #F8F9FA; padding: 20px; text-align: center; font-size: 12px; color: #6B7280; border-radius: 0 0 8px 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 24px;">RusingÂcademy</h1>
          <p style="margin: 10px 0 0; opacity: 0.9;">Invitation Exclusive</p>
        </div>
        <div class="content">
          <p>Bonjour ${lead.firstName},</p>
          <p>C'est à votre tour de réussir.</p>
          <div class="offer-box">
            <h2 style="margin-top: 0;">🎁 Session de Coaching Gratuite</h2>
            <p style="font-size: 18px; margin-bottom: 0;">15 minutes avec un coach certifié</p>
            <p style="opacity: 0.9; margin-top: 5px;">Valeur : 75$ — Offert gratuitement</p>
          </div>
          <center>
            <a href="${calendarUrl}" class="cta-button">Réserver Ma Session Gratuite →</a>
          </center>
          <p style="text-align: center; color: #6B7280; font-size: 14px;">Places limitées — Offre valable 7 jours</p>
          <p>À très bientôt,<br><strong>L'équipe RusingÂcademy</strong></p>
        </div>
        <div class="footer">
          <p>© 2026 Rusinga International Consulting Ltd.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export default {
  startNurturingSequence,
  sendDiagnosticReportEmail,
  sendSuccessStoryEmail,
  sendFreeCoachingInvitationEmail,
};
