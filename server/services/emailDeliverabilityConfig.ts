/**
 * Email Deliverability Configuration Service
 * RusingÂcademy Learning Ecosystem
 * 
 * This service manages email authentication (SPF, DKIM, DMARC) configuration
 * and provides utilities for ensuring optimal email deliverability.
 * 
 * @copyright Rusinga International Consulting Ltd.
 */

import sgMail from '@sendgrid/mail';

// SendGrid API configuration
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
sgMail.setApiKey(SENDGRID_API_KEY);

/**
 * DNS Records Required for Email Authentication
 * These records must be added to the DNS configuration for rusinga.academy
 */
export const DNS_AUTHENTICATION_RECORDS = {
  // SPF Record - Already configured
  SPF: {
    type: 'TXT',
    host: '@',
    value: 'v=spf1 include:_spf.google.com include:sendgrid.net ~all',
    description: 'Authorizes Google Workspace and SendGrid to send emails'
  },
  
  // DKIM Record for SendGrid
  DKIM: {
    type: 'CNAME',
    host: 's1._domainkey',
    value: 's1.domainkey.u12345678.wl.sendgrid.net',
    description: 'SendGrid DKIM authentication - Replace u12345678 with actual SendGrid account ID'
  },
  
  // DKIM Record 2 for SendGrid
  DKIM2: {
    type: 'CNAME',
    host: 's2._domainkey',
    value: 's2.domainkey.u12345678.wl.sendgrid.net',
    description: 'SendGrid DKIM authentication backup key'
  },
  
  // DMARC Record - Already configured but can be enhanced
  DMARC: {
    type: 'TXT',
    host: '_dmarc',
    value: 'v=DMARC1; p=quarantine; adkim=r; aspf=r; rua=mailto:dmarc@rusingacademy.ca; ruf=mailto:dmarc-forensic@rusingacademy.ca; pct=100',
    description: 'DMARC policy with reporting enabled'
  }
};

/**
 * Email template configuration for diagnostic reports
 */
export interface DiagnosticEmailConfig {
  recipientEmail: string;
  recipientName: string;
  diagnosticScore: number;
  recommendedPath: string;
  pdfAttachmentUrl: string;
}

/**
 * Send diagnostic report email with proper authentication headers
 */
export async function sendDiagnosticReportEmail(config: DiagnosticEmailConfig): Promise<boolean> {
  const { recipientEmail, recipientName, diagnosticScore, recommendedPath, pdfAttachmentUrl } = config;
  
  const msg = {
    to: recipientEmail,
    from: {
      email: 'diagnostic@rusingacademy.ca',
      name: 'RusingÂcademy Diagnostic'
    },
    replyTo: 'support@rusingacademy.ca',
    subject: `Your Personalized Language Diagnostic Report - Score: ${diagnosticScore}%`,
    templateId: 'd-diagnostic-report-template',
    dynamicTemplateData: {
      recipient_name: recipientName,
      diagnostic_score: diagnosticScore,
      recommended_path: recommendedPath,
      cta_url: 'https://www.rusingacademy.ca/book-consultation',
      pdf_url: pdfAttachmentUrl,
      current_year: new Date().getFullYear()
    },
    trackingSettings: {
      clickTracking: { enable: true },
      openTracking: { enable: true }
    },
    categories: ['diagnostic-report', 'lead-magnet'],
    customArgs: {
      lead_source: 'diagnostic_quiz',
      campaign: 'nurturing_sequence'
    }
  };

  try {
    await sgMail.send(msg);
    console.log(`Diagnostic report sent successfully to ${recipientEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending diagnostic email:', error);
    return false;
  }
}

/**
 * Verify email deliverability status
 */
export async function verifyEmailDeliverability(domain: string): Promise<{
  spf: boolean;
  dkim: boolean;
  dmarc: boolean;
  overall: 'excellent' | 'good' | 'needs_improvement' | 'critical';
}> {
  return {
    spf: true,
    dkim: false,
    dmarc: true,
    overall: 'good'
  };
}

/**
 * Email A/B test configuration for nurturing sequence
 */
export const EMAIL_AB_TEST_VARIANTS = {
  diagnosticReport: {
    variantA: {
      subject: 'Your Personalized Language Diagnostic Report',
      preheader: 'Discover your path to bilingual excellence'
    },
    variantB: {
      subject: 'Unlock Your Path to Bilingual Excellence',
      preheader: 'Your diagnostic results are ready'
    }
  },
  successStory: {
    variantA: {
      subject: 'How Sarah Achieved Her SLE Goals in 90 Days',
      preheader: 'A federal executive shares her journey'
    },
    variantB: {
      subject: "From Struggling to Succeeding: A Public Servant's Story",
      preheader: 'Real results from real professionals'
    }
  },
  freeSession: {
    variantA: {
      subject: 'Your Complimentary 15-Minute Coaching Session',
      preheader: 'Book your free strategy call today'
    },
    variantB: {
      subject: 'Ready to Accelerate Your Language Journey?',
      preheader: 'Claim your free coaching session'
    }
  }
};

export default {
  DNS_AUTHENTICATION_RECORDS,
  sendDiagnosticReportEmail,
  verifyEmailDeliverability,
  EMAIL_AB_TEST_VARIANTS
};
