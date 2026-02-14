/**
 * Diagnostic Service - Automated PDF Report Generation & Email Delivery
 * 
 * Generates personalized diagnostic reports for prospective learners
 * and sends them via email automatically.
 * 
 * @module server/services/diagnosticService
 */

import PDFDocument from 'pdfkit';
import nodemailer from 'nodemailer';

// Design tokens for PDF
const PDF_COLORS = {
  primary: '#1E3A5F',
  secondary: '#C9A227',
  text: '#1A1A1A',
  textMuted: '#6B7280',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
};

// SLE Level definitions
const SLE_LEVELS = {
  A: { name: 'Niveau A - Débutant', color: '#10B981', minScore: 0, maxScore: 39 },
  B: { name: 'Niveau B - Intermédiaire', color: '#F59E0B', minScore: 40, maxScore: 69 },
  C: { name: 'Niveau C - Avancé', color: '#8B5CF6', minScore: 70, maxScore: 100 },
};

interface DiagnosticResult {
  firstName: string;
  lastName: string;
  email: string;
  targetLevel: 'A' | 'B' | 'C';
  scores: {
    comprehensionEcrite: number;
    expressionEcrite: number;
    interactionOrale: number;
  };
}

function calculateOverallScore(scores: DiagnosticResult['scores']): { overall: number; level: 'A' | 'B' | 'C' } {
  const overall = Math.round((scores.comprehensionEcrite + scores.expressionEcrite + scores.interactionOrale) / 3);
  let level: 'A' | 'B' | 'C' = 'A';
  if (overall >= 70) level = 'C';
  else if (overall >= 40) level = 'B';
  return { overall, level };
}

export async function generateDiagnosticPDF(result: DiagnosticResult): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'LETTER', margins: { top: 50, bottom: 50, left: 50, right: 50 } });
    const chunks: Buffer[] = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    
    const { overall, level } = calculateOverallScore(result.scores);
    
    // Header
    doc.fillColor(PDF_COLORS.primary).fontSize(24).font('Helvetica-Bold').text('RusingÂcademy', 50, 50);
    doc.fillColor(PDF_COLORS.textMuted).fontSize(10).font('Helvetica').text('Rusinga International Consulting Ltd.', 50, 78);
    
    // Title
    doc.moveDown(2);
    doc.fillColor(PDF_COLORS.primary).fontSize(20).font('Helvetica-Bold').text('Rapport de Diagnostic Linguistique', { align: 'center' });
    doc.fillColor(PDF_COLORS.textMuted).fontSize(12).text(`Généré le ${new Date().toLocaleDateString('fr-CA')}`, { align: 'center' });
    
    // Personal info
    doc.moveDown(2);
    doc.fillColor(PDF_COLORS.primary).fontSize(14).font('Helvetica-Bold').text('Informations du candidat');
    doc.moveDown(0.5);
    doc.fillColor(PDF_COLORS.text).fontSize(11).font('Helvetica')
       .text(`Nom: ${result.firstName} ${result.lastName}`)
       .text(`Courriel: ${result.email}`)
       .text(`Niveau cible: ${SLE_LEVELS[result.targetLevel].name}`);
    
    // Overall score
    doc.moveDown(2);
    doc.fillColor(PDF_COLORS.primary).fontSize(14).font('Helvetica-Bold').text('Résultat Global');
    doc.moveDown(0.5);
    doc.fillColor(SLE_LEVELS[level].color).fontSize(36).font('Helvetica-Bold').text(`${overall}%`);
    doc.fillColor(PDF_COLORS.text).fontSize(14).text(SLE_LEVELS[level].name);
    
    // CTA
    doc.moveDown(4);
    doc.fillColor(PDF_COLORS.primary).fontSize(12).font('Helvetica-Bold').text('Réservez votre consultation gratuite:', { align: 'center' });
    doc.fillColor(PDF_COLORS.secondary).text('app.rusingacademy.ca/consultation', { align: 'center', link: 'https://app.rusingacademy.ca/consultation' });
    
    doc.end();
  });
}

export async function sendDiagnosticEmail(result: DiagnosticResult, pdfBuffer: Buffer): Promise<boolean> {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  
  try {
    await transporter.sendMail({
      from: '"RusingÂcademy" <noreply@rusingacademy.ca>',
      to: result.email,
      subject: 'Votre Rapport de Diagnostic Linguistique - RusingÂcademy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1E3A5F;">Bonjour ${result.firstName},</h1>
          <p>Merci d'avoir complété votre diagnostic linguistique avec RusingÂcademy.</p>
          <p>Votre rapport personnalisé est en pièce jointe.</p>
          <p><strong>Prochaine étape:</strong> Réservez une consultation gratuite avec un de nos coaches Lingueefy.</p>
          <a href="https://app.rusingacademy.ca/consultation" style="background: #C9A227; color: #1E3A5F; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Réserver ma consultation</a>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
          <p style="color: #6B7280; font-size: 12px;">Rusinga International Consulting Ltd.<br>Commercialement connue sous le nom de RusingÂcademy</p>
        </div>
      `,
      attachments: [{ filename: `diagnostic-${result.firstName.toLowerCase()}-${Date.now()}.pdf`, content: pdfBuffer }],
    });
    return true;
  } catch (error) {
    console.error('Error sending diagnostic email:', error);
    return false;
  }
}

export default { generateDiagnosticPDF, sendDiagnosticEmail };
