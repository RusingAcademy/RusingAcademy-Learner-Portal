/**
 * Follow-up Sequences System
 * 
 * Automated email drip campaigns for lead nurturing
 */

import { getDb } from "./db";
import { 
  followUpSequences, 
  sequenceSteps, 
  leadSequenceEnrollments,
  sequenceEmailLogs,
  ecosystemLeads 
} from "../drizzle/schema";
import { eq, and, lte, isNull, desc, asc } from "drizzle-orm";
import { sendEmail } from "./email";
import { addEmailTracking } from "./email-tracking";

// Types
interface SequenceTemplate {
  name: string;
  description: string;
  triggerType: string;
  steps: {
    delayDays: number;
    delayHours: number;
    subjectEn: string;
    subjectFr: string;
    bodyEn: string;
    bodyFr: string;
  }[];
}

// Pre-built sequence templates
export const sequenceTemplates: Record<string, SequenceTemplate> = {
  welcome: {
    name: "Welcome Sequence",
    description: "Introduce new leads to Rusinga International ecosystem",
    triggerType: "new_lead",
    steps: [
      {
        delayDays: 0,
        delayHours: 1,
        subjectEn: "Welcome to Rusinga International! 🎉",
        subjectFr: "Bienvenue chez Rusinga International! 🎉",
        bodyEn: `
          <h2>Welcome, {{firstName}}!</h2>
          <p>Thank you for your interest in our services. We're excited to help you achieve your goals.</p>
          <p>Our ecosystem includes:</p>
          <ul>
            <li><strong>Lingueefy</strong> - Master French or English for the Canadian Public Service</li>
            <li><strong>RusingAcademy</strong> - Corporate language training programs</li>
            <li><strong>Barholex Media</strong> - Creative digital solutions</li>
          </ul>
          <p>A member of our team will reach out shortly to discuss your needs.</p>
        `,
        bodyFr: `
          <h2>Bienvenue, {{firstName}}!</h2>
          <p>Merci de votre intérêt pour nos services. Nous sommes ravis de vous aider à atteindre vos objectifs.</p>
          <p>Notre écosystème comprend:</p>
          <ul>
            <li><strong>Lingueefy</strong> - Maîtrisez le français ou l'anglais pour la fonction publique canadienne</li>
            <li><strong>RusingAcademy</strong> - Programmes de formation linguistique en entreprise</li>
            <li><strong>Barholex Media</strong> - Solutions numériques créatives</li>
          </ul>
          <p>Un membre de notre équipe vous contactera sous peu pour discuter de vos besoins.</p>
        `,
      },
      {
        delayDays: 3,
        delayHours: 0,
        subjectEn: "How can we help you succeed?",
        subjectFr: "Comment pouvons-nous vous aider à réussir?",
        bodyEn: `
          <h2>Hi {{firstName}},</h2>
          <p>We wanted to follow up and learn more about your goals.</p>
          <p>Whether you're preparing for SLE exams, need corporate training, or require creative services, we have solutions tailored to your needs.</p>
          <p><strong>Ready to take the next step?</strong></p>
          <p><a href="{{ecosystemUrl}}" style="background: #009688; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Explore Our Services</a></p>
        `,
        bodyFr: `
          <h2>Bonjour {{firstName}},</h2>
          <p>Nous voulions faire un suivi et en apprendre davantage sur vos objectifs.</p>
          <p>Que vous prépariez les examens ELS, ayez besoin de formation en entreprise ou de services créatifs, nous avons des solutions adaptées à vos besoins.</p>
          <p><strong>Prêt à passer à l'étape suivante?</strong></p>
          <p><a href="{{ecosystemUrl}}" style="background: #009688; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Découvrir nos services</a></p>
        `,
      },
      {
        delayDays: 7,
        delayHours: 0,
        subjectEn: "Special offer for you, {{firstName}}",
        subjectFr: "Offre spéciale pour vous, {{firstName}}",
        bodyEn: `
          <h2>{{firstName}}, we have something special for you!</h2>
          <p>As a thank you for your interest, we'd like to offer you a <strong>free consultation</strong> to discuss your needs and how we can help.</p>
          <p>During this 30-minute call, we'll:</p>
          <ul>
            <li>Understand your specific goals</li>
            <li>Recommend the best solution for your situation</li>
            <li>Answer any questions you have</li>
          </ul>
          <p><a href="{{bookingUrl}}" style="background: #009688; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Book Your Free Consultation</a></p>
        `,
        bodyFr: `
          <h2>{{firstName}}, nous avons quelque chose de spécial pour vous!</h2>
          <p>Pour vous remercier de votre intérêt, nous aimerions vous offrir une <strong>consultation gratuite</strong> pour discuter de vos besoins.</p>
          <p>Lors de cet appel de 30 minutes, nous allons:</p>
          <ul>
            <li>Comprendre vos objectifs spécifiques</li>
            <li>Recommander la meilleure solution pour votre situation</li>
            <li>Répondre à toutes vos questions</li>
          </ul>
          <p><a href="{{bookingUrl}}" style="background: #009688; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Réserver votre consultation gratuite</a></p>
        `,
      },
    ],
  },
  nurture: {
    name: "Nurture Sequence",
    description: "Keep warm leads engaged over time",
    triggerType: "manual",
    steps: [
      {
        delayDays: 0,
        delayHours: 0,
        subjectEn: "Helpful resources for your language journey",
        subjectFr: "Ressources utiles pour votre parcours linguistique",
        bodyEn: `
          <h2>Hi {{firstName}},</h2>
          <p>We thought you might find these resources helpful:</p>
          <ul>
            <li>📚 Free SLE preparation guide</li>
            <li>🎯 Tips for improving oral communication</li>
            <li>📝 Common mistakes to avoid in written exams</li>
          </ul>
          <p>Let us know if you have any questions!</p>
        `,
        bodyFr: `
          <h2>Bonjour {{firstName}},</h2>
          <p>Nous avons pensé que ces ressources pourraient vous être utiles:</p>
          <ul>
            <li>📚 Guide gratuit de préparation ELS</li>
            <li>🎯 Conseils pour améliorer la communication orale</li>
            <li>📝 Erreurs courantes à éviter dans les examens écrits</li>
          </ul>
          <p>N'hésitez pas à nous contacter si vous avez des questions!</p>
        `,
      },
      {
        delayDays: 14,
        delayHours: 0,
        subjectEn: "Success story: How Marie achieved her CBC",
        subjectFr: "Histoire de réussite: Comment Marie a obtenu son CBC",
        bodyEn: `
          <h2>{{firstName}}, meet Marie!</h2>
          <p>Marie was in a similar situation to yours. She needed to achieve CBC level for a promotion but was struggling with oral communication.</p>
          <p>After working with one of our expert coaches for just 3 months, she not only passed her SLE but exceeded her target!</p>
          <blockquote>"The personalized approach made all the difference. I finally felt confident speaking French in professional settings."</blockquote>
          <p><strong>Ready to write your own success story?</strong></p>
        `,
        bodyFr: `
          <h2>{{firstName}}, rencontrez Marie!</h2>
          <p>Marie était dans une situation similaire à la vôtre. Elle devait atteindre le niveau CBC pour une promotion mais avait des difficultés avec la communication orale.</p>
          <p>Après avoir travaillé avec l'un de nos coachs experts pendant seulement 3 mois, elle a non seulement réussi son ELS mais a dépassé son objectif!</p>
          <blockquote>"L'approche personnalisée a fait toute la différence. Je me sens enfin confiante pour parler français dans des contextes professionnels."</blockquote>
          <p><strong>Prêt à écrire votre propre histoire de réussite?</strong></p>
        `,
      },
    ],
  },
  reengage: {
    name: "Re-engagement Sequence",
    description: "Win back cold leads",
    triggerType: "manual",
    steps: [
      {
        delayDays: 0,
        delayHours: 0,
        subjectEn: "We miss you, {{firstName}}!",
        subjectFr: "Vous nous manquez, {{firstName}}!",
        bodyEn: `
          <h2>Hi {{firstName}},</h2>
          <p>It's been a while since we last connected. We wanted to check in and see if your language learning goals have changed.</p>
          <p>A lot has happened since then:</p>
          <ul>
            <li>✨ New AI-powered practice tools</li>
            <li>👥 Expanded coach network</li>
            <li>💰 New flexible pricing options</li>
          </ul>
          <p>Would you like to reconnect?</p>
        `,
        bodyFr: `
          <h2>Bonjour {{firstName}},</h2>
          <p>Cela fait un moment que nous n'avons pas échangé. Nous voulions prendre de vos nouvelles et voir si vos objectifs d'apprentissage ont changé.</p>
          <p>Beaucoup de choses se sont passées depuis:</p>
          <ul>
            <li>✨ Nouveaux outils de pratique alimentés par l'IA</li>
            <li>👥 Réseau de coachs élargi</li>
            <li>💰 Nouvelles options de tarification flexibles</li>
          </ul>
          <p>Souhaitez-vous reprendre contact?</p>
        `,
      },
      {
        delayDays: 7,
        delayHours: 0,
        subjectEn: "Last chance: Special offer expires soon",
        subjectFr: "Dernière chance: Offre spéciale expire bientôt",
        bodyEn: `
          <h2>{{firstName}}, don't miss out!</h2>
          <p>We'd love to have you back. As a special offer, we're providing:</p>
          <p style="font-size: 24px; text-align: center; color: #009688;"><strong>20% OFF</strong> your first session</p>
          <p>This offer expires in 48 hours. Ready to get started?</p>
        `,
        bodyFr: `
          <h2>{{firstName}}, ne manquez pas cette opportunité!</h2>
          <p>Nous serions ravis de vous revoir. En tant qu'offre spéciale, nous offrons:</p>
          <p style="font-size: 24px; text-align: center; color: #009688;"><strong>20% DE RÉDUCTION</strong> sur votre première session</p>
          <p>Cette offre expire dans 48 heures. Prêt à commencer?</p>
        `,
      },
    ],
  },
};

/**
 * Create a new sequence from template
 */
export async function createSequenceFromTemplate(
  templateKey: keyof typeof sequenceTemplates
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  
  const template = sequenceTemplates[templateKey];
  if (!template) throw new Error(`Template ${templateKey} not found`);
  
  // Create sequence
  const [sequence] = await db.insert(followUpSequences).values({
    name: template.name,
    description: template.description,
    triggerType: template.triggerType,
    isActive: true,
  });
  
  const sequenceId = sequence.insertId;
  
  // Create steps
  for (let i = 0; i < template.steps.length; i++) {
    const step = template.steps[i];
    await db.insert(sequenceSteps).values({
      sequenceId,
      stepOrder: i + 1,
      delayDays: step.delayDays,
      delayHours: step.delayHours,
      emailSubjectEn: step.subjectEn,
      emailSubjectFr: step.subjectFr,
      emailBodyEn: step.bodyEn,
      emailBodyFr: step.bodyFr,
    });
  }
  
  return sequenceId;
}

/**
 * Enroll a lead in a sequence
 */
export async function enrollLeadInSequence(
  leadId: number,
  sequenceId: number
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  
  // Get first step
  const steps = await db
    .select()
    .from(sequenceSteps)
    .where(eq(sequenceSteps.sequenceId, sequenceId))
    .orderBy(asc(sequenceSteps.stepOrder))
    .limit(1);
  
  if (steps.length === 0) {
    throw new Error("Sequence has no steps");
  }
  
  const firstStep = steps[0];
  
  // Calculate next email time
  const nextEmailAt = new Date();
  nextEmailAt.setDate(nextEmailAt.getDate() + firstStep.delayDays);
  nextEmailAt.setHours(nextEmailAt.getHours() + firstStep.delayHours);
  
  // Create enrollment
  const [enrollment] = await db.insert(leadSequenceEnrollments).values({
    leadId,
    sequenceId,
    currentStepId: firstStep.id,
    status: "active",
    nextEmailAt,
  });
  
  return enrollment.insertId;
}

/**
 * Process pending sequence emails
 */
export async function processSequenceEmails(): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  
  const now = new Date();
  let emailsSent = 0;
  
  // Get active enrollments with pending emails
  const pendingEnrollments = await db
    .select({
      enrollment: leadSequenceEnrollments,
      lead: ecosystemLeads,
      step: sequenceSteps,
    })
    .from(leadSequenceEnrollments)
    .innerJoin(ecosystemLeads, eq(leadSequenceEnrollments.leadId, ecosystemLeads.id))
    .innerJoin(sequenceSteps, eq(leadSequenceEnrollments.currentStepId, sequenceSteps.id))
    .where(
      and(
        eq(leadSequenceEnrollments.status, "active"),
        lte(leadSequenceEnrollments.nextEmailAt, now)
      )
    );
  
  for (const { enrollment, lead, step } of pendingEnrollments) {
    try {
      // Determine language
      const language = lead.preferredLanguage || "en";
      
      // Replace variables in email
      const subject = replaceVariables(
        language === "fr" ? step.emailSubjectFr : step.emailSubjectEn,
        lead
      );
      const body = replaceVariables(
        language === "fr" ? step.emailBodyFr : step.emailBodyEn,
        lead
      );
      
      // Log email first to get the log ID for tracking
      const insertResult = await db.insert(sequenceEmailLogs).values({
        enrollmentId: enrollment.id,
        stepId: step.id,
      }).$returningId();
      const emailLogId = insertResult[0]?.id;
      
      // Add tracking to email HTML with unsubscribe link
      const baseUrl = process.env.VITE_APP_URL || "https://www.rusingacademy.ca";
      const wrappedBody = wrapEmailTemplate(body);
      const trackedHtml = emailLogId 
        ? addEmailTracking(wrappedBody, emailLogId, baseUrl, {
            leadId: lead.id,
            leadEmail: lead.email,
            language: language as "en" | "fr",
          })
        : wrappedBody;
      
      // Send email with tracking
      await sendEmail({
        to: lead.email,
        subject,
        html: trackedHtml,
      });
      
      // Update log with sent timestamp
      if (emailLogId) {
        await db.update(sequenceEmailLogs)
          .set({ sentAt: new Date() })
          .where(eq(sequenceEmailLogs.id, emailLogId));
      }
      
      // Get next step
      const nextSteps = await db
        .select()
        .from(sequenceSteps)
        .where(
          and(
            eq(sequenceSteps.sequenceId, enrollment.sequenceId),
            eq(sequenceSteps.stepOrder, step.stepOrder + 1)
          )
        )
        .limit(1);
      
      if (nextSteps.length > 0) {
        // Move to next step
        const nextStep = nextSteps[0];
        const nextEmailAt = new Date();
        nextEmailAt.setDate(nextEmailAt.getDate() + nextStep.delayDays);
        nextEmailAt.setHours(nextEmailAt.getHours() + nextStep.delayHours);
        
        await db
          .update(leadSequenceEnrollments)
          .set({
            currentStepId: nextStep.id,
            nextEmailAt,
          })
          .where(eq(leadSequenceEnrollments.id, enrollment.id));
      } else {
        // Sequence complete
        await db
          .update(leadSequenceEnrollments)
          .set({
            status: "completed",
            completedAt: now,
            nextEmailAt: null,
          })
          .where(eq(leadSequenceEnrollments.id, enrollment.id));
      }
      
      emailsSent++;
    } catch (error) {
      console.error(`Failed to send sequence email for enrollment ${enrollment.id}:`, error);
    }
  }
  
  return emailsSent;
}

/**
 * Replace template variables
 */
function replaceVariables(
  template: string,
  lead: typeof ecosystemLeads.$inferSelect
): string {
  return template
    .replace(/\{\{firstName\}\}/g, lead.firstName || "there")
    .replace(/\{\{lastName\}\}/g, lead.lastName || "")
    .replace(/\{\{company\}\}/g, lead.company || "")
    .replace(/\{\{email\}\}/g, lead.email)
    .replace(/\{\{ecosystemUrl\}\}/g, "https://www.rusingacademy.ca/ecosystem")
    .replace(/\{\{bookingUrl\}\}/g, "https://www.rusingacademy.ca/contact");
}

/**
 * Wrap email content in template
 */
function wrapEmailTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
  ${content}
  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
  <p style="font-size: 12px; color: #64748b; text-align: center;">
    © 2026 Rusinga International Consulting Ltd.<br>
    <a href="{{unsubscribeUrl}}" style="color: #64748b;">Unsubscribe</a>
  </p>
</body>
</html>
  `;
}

/**
 * Get sequence analytics
 */
export async function getSequenceAnalytics(sequenceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  
  const enrollments = await db
    .select()
    .from(leadSequenceEnrollments)
    .where(eq(leadSequenceEnrollments.sequenceId, sequenceId));
  
  const emailLogs = await db
    .select()
    .from(sequenceEmailLogs)
    .innerJoin(leadSequenceEnrollments, eq(sequenceEmailLogs.enrollmentId, leadSequenceEnrollments.id))
    .where(eq(leadSequenceEnrollments.sequenceId, sequenceId));
  
  const totalEnrollments = enrollments.length;
  const activeEnrollments = enrollments.filter((e: typeof leadSequenceEnrollments.$inferSelect) => e.status === "active").length;
  const completedEnrollments = enrollments.filter((e: typeof leadSequenceEnrollments.$inferSelect) => e.status === "completed").length;
  const totalEmailsSent = emailLogs.length;
  const totalOpened = emailLogs.filter((l: { sequence_email_logs: typeof sequenceEmailLogs.$inferSelect }) => l.sequence_email_logs.opened).length;
  const totalClicked = emailLogs.filter((l: { sequence_email_logs: typeof sequenceEmailLogs.$inferSelect }) => l.sequence_email_logs.clicked).length;
  
  return {
    totalEnrollments,
    activeEnrollments,
    completedEnrollments,
    completionRate: totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0,
    totalEmailsSent,
    openRate: totalEmailsSent > 0 ? Math.round((totalOpened / totalEmailsSent) * 100) : 0,
    clickRate: totalEmailsSent > 0 ? Math.round((totalClicked / totalEmailsSent) * 100) : 0,
  };
}
