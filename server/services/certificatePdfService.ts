import PDFDocument from "pdfkit";
import { storagePut } from "../storage";

interface CertificateData {
  recipientName: string;
  courseTitle: string;
  certificateNumber: string;
  issuedAt: Date;
  language: "en" | "fr";
  badgeImageUrl?: string;
  pathTitle?: string;
  totalLessons?: number;
}

/**
 * Generate a professional PDF certificate and upload to S3.
 * Returns the CDN URL of the generated PDF.
 */
export async function generateCertificatePdf(data: CertificateData): Promise<string> {
  const isEn = data.language === "en";

  // Create landscape A4 PDF
  const doc = new PDFDocument({
    size: "A4",
    layout: "landscape",
    margins: { top: 40, bottom: 40, left: 40, right: 40 },
    info: {
      Title: isEn ? "Certificate of Completion" : "Certificat de réussite",
      Author: "RusingAcademy",
      Subject: data.courseTitle,
    },
  });

  // Collect PDF buffer
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  const pdfReady = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  const pageW = doc.page.width;
  const pageH = doc.page.height;

  // ── Background ──
  doc.rect(0, 0, pageW, pageH).fill("#FAFAFA");

  // ── Outer decorative border (teal) ──
  doc.lineWidth(4)
    .strokeColor("#009688")
    .roundedRect(20, 20, pageW - 40, pageH - 40, 8)
    .stroke();

  // ── Inner decorative border (lighter teal) ──
  doc.lineWidth(2)
    .strokeColor("#4DB6AC")
    .roundedRect(30, 30, pageW - 60, pageH - 60, 6)
    .stroke();

  // ── Corner accents (orange) ──
  const cornerSize = 40;
  const cornerInset = 24;
  const corners = [
    { x: cornerInset, y: cornerInset, dx: 1, dy: 1 },
    { x: pageW - cornerInset, y: cornerInset, dx: -1, dy: 1 },
    { x: cornerInset, y: pageH - cornerInset, dx: 1, dy: -1 },
    { x: pageW - cornerInset, y: pageH - cornerInset, dx: -1, dy: -1 },
  ];
  doc.lineWidth(4).strokeColor("#FF6B35");
  for (const c of corners) {
    doc.moveTo(c.x, c.y)
      .lineTo(c.x + cornerSize * c.dx, c.y)
      .stroke();
    doc.moveTo(c.x, c.y)
      .lineTo(c.x, c.y + cornerSize * c.dy)
      .stroke();
  }

  // ── Decorative top line ──
  const centerX = pageW / 2;
  doc.lineWidth(1).strokeColor("#E0E0E0");
  doc.moveTo(centerX - 120, 75).lineTo(centerX + 120, 75).stroke();

  // ── Brand Header ──
  doc.fontSize(28)
    .fillColor("#009688")
    .font("Helvetica-Bold")
    .text("RusingAcademy", 0, 85, { align: "center", width: pageW });

  doc.fontSize(10)
    .fillColor("#888888")
    .font("Helvetica")
    .text(
      isEn ? "Excellence in Bilingual Education" : "Excellence en éducation bilingue",
      0, 118, { align: "center", width: pageW }
    );

  // ── Title ──
  doc.fontSize(36)
    .fillColor("#1a365d")
    .font("Helvetica-Bold")
    .text(
      isEn ? "Certificate of Completion" : "Certificat de réussite",
      0, 150, { align: "center", width: pageW }
    );

  // ── Decorative divider ──
  doc.lineWidth(2).strokeColor("#FF6B35");
  doc.moveTo(centerX - 80, 195).lineTo(centerX + 80, 195).stroke();

  // ── Subtitle ──
  doc.fontSize(14)
    .fillColor("#666666")
    .font("Helvetica")
    .text(
      isEn ? "This is to certify that" : "Ceci certifie que",
      0, 215, { align: "center", width: pageW }
    );

  // ── Recipient Name ──
  doc.fontSize(32)
    .fillColor("#009688")
    .font("Helvetica-Bold")
    .text(data.recipientName, 0, 240, { align: "center", width: pageW });

  // ── Completion text ──
  doc.fontSize(14)
    .fillColor("#666666")
    .font("Helvetica")
    .text(
      isEn ? "has successfully completed the course" : "a complété avec succès le cours",
      0, 285, { align: "center", width: pageW }
    );

  // ── Course Title ──
  doc.fontSize(22)
    .fillColor("#1a365d")
    .font("Helvetica-Bold")
    .text(data.courseTitle, 60, 310, {
      align: "center",
      width: pageW - 120,
    });

  // ── Path info if available ──
  let yPos = 350;
  if (data.pathTitle) {
    doc.fontSize(12)
      .fillColor("#888888")
      .font("Helvetica-Oblique")
      .text(
        isEn
          ? `Part of the ${data.pathTitle} learning path`
          : `Fait partie du parcours ${data.pathTitle}`,
        0, yPos, { align: "center", width: pageW }
      );
    yPos += 20;
  }

  if (data.totalLessons) {
    doc.fontSize(11)
      .fillColor("#999999")
      .font("Helvetica")
      .text(
        isEn
          ? `${data.totalLessons} lessons completed`
          : `${data.totalLessons} leçons complétées`,
        0, yPos, { align: "center", width: pageW }
      );
    yPos += 25;
  }

  // ── Date and Signature Row ──
  const signatureY = pageH - 130;

  // Date (left side)
  doc.fontSize(10)
    .fillColor("#999999")
    .font("Helvetica")
    .text(isEn ? "Issued on" : "Délivré le", 80, signatureY);

  const formattedDate = new Date(data.issuedAt).toLocaleDateString(
    isEn ? "en-US" : "fr-FR",
    { year: "numeric", month: "long", day: "numeric" }
  );
  doc.fontSize(14)
    .fillColor("#333333")
    .font("Helvetica-Bold")
    .text(formattedDate, 80, signatureY + 15);

  // Signature (right side)
  doc.lineWidth(1).strokeColor("#999999");
  doc.moveTo(pageW - 280, signatureY + 25)
    .lineTo(pageW - 80, signatureY + 25)
    .stroke();

  doc.fontSize(18)
    .fillColor("#333333")
    .font("Helvetica-Oblique")
    .text("Prof. Steven Rusinga", pageW - 280, signatureY + 5, {
      width: 200,
      align: "center",
    });

  doc.fontSize(10)
    .fillColor("#999999")
    .font("Helvetica")
    .text(isEn ? "Signed by" : "Signé par", pageW - 280, signatureY + 30, {
      width: 200,
      align: "center",
    });

  doc.fontSize(9)
    .fillColor("#AAAAAA")
    .text(
      isEn ? "Founder & Lead Instructor" : "Fondateur et instructeur principal",
      pageW - 280, signatureY + 43,
      { width: 200, align: "center" }
    );

  // ── Certificate ID and Verification ──
  doc.fontSize(8)
    .fillColor("#BBBBBB")
    .font("Helvetica")
    .text(
      `${isEn ? "Certificate ID" : "Numéro de certificat"}: ${data.certificateNumber}`,
      0, pageH - 55, { align: "center", width: pageW }
    );

  doc.fontSize(8)
    .fillColor("#BBBBBB")
    .text(
      `${isEn ? "Verify at" : "Vérifier sur"}: rusingacademy.com/verify/${data.certificateNumber}`,
      0, pageH - 43, { align: "center", width: pageW }
    );

  // Finalize
  doc.end();
  const pdfBuffer = await pdfReady;

  // Upload to S3
  const timestamp = Date.now().toString(36);
  const fileKey = `certificates/${data.certificateNumber}-${timestamp}.pdf`;
  const { url } = await storagePut(fileKey, pdfBuffer, "application/pdf");

  return url;
}
