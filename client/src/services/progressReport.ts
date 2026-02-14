import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ProgressReportData {
  learnerName: string;
  department?: string;
  position?: string;
  currentLevel: {
    reading?: string;
    writing?: string;
    oral?: string;
  };
  targetLevel: {
    reading?: string;
    writing?: string;
    oral?: string;
  };
  examDate?: string;
  totalSessions: number;
  totalAiSessions: number;
  currentStreak: number;
  longestStreak: number;
  loyaltyTier: string;
  totalPoints: number;
  sessionsHistory: Array<{
    date: string;
    coachName: string;
    focusArea: string;
    duration: number;
    status: string;
  }>;
  recentReviews: Array<{
    date: string;
    coachName: string;
    rating: number;
    comment?: string;
  }>;
  language: 'en' | 'fr';
}

const translations = {
  en: {
    title: 'SLE Progress Report',
    subtitle: 'Lingueefy - Language Coaching Platform',
    generatedOn: 'Generated on',
    learnerInfo: 'Learner Information',
    name: 'Name',
    department: 'Department',
    position: 'Position',
    currentLevels: 'Current SLE Levels',
    targetLevels: 'Target SLE Levels',
    reading: 'Reading',
    writing: 'Writing',
    oral: 'Oral',
    examDate: 'Target Exam Date',
    progressSummary: 'Progress Summary',
    totalCoachSessions: 'Total Coach Sessions',
    totalAiSessions: 'Total AI Practice Sessions',
    currentStreak: 'Current Learning Streak',
    longestStreak: 'Longest Streak',
    loyaltyTier: 'Loyalty Tier',
    totalPoints: 'Total Points',
    weeks: 'weeks',
    sessionHistory: 'Session History',
    date: 'Date',
    coach: 'Coach',
    focusArea: 'Focus Area',
    duration: 'Duration',
    status: 'Status',
    minutes: 'min',
    recentFeedback: 'Recent Feedback',
    rating: 'Rating',
    comment: 'Comment',
    footer: '© 2026 Rusinga International Consulting Ltd. - Lingueefy',
    confidential: 'This document is confidential and intended for the recipient only.',
    notAssessed: 'Not assessed',
    notSet: 'Not set',
  },
  fr: {
    title: 'Rapport de progression ELS',
    subtitle: 'Lingueefy - Plateforme de coaching linguistique',
    generatedOn: 'Généré le',
    learnerInfo: 'Informations sur l\'apprenant',
    name: 'Nom',
    department: 'Département',
    position: 'Poste',
    currentLevels: 'Niveaux ELS actuels',
    targetLevels: 'Niveaux ELS cibles',
    reading: 'Compréhension écrite',
    writing: 'Expression écrite',
    oral: 'Interaction orale',
    examDate: 'Date d\'examen cible',
    progressSummary: 'Résumé de la progression',
    totalCoachSessions: 'Sessions avec coach',
    totalAiSessions: 'Sessions pratique IA',
    currentStreak: 'Série d\'apprentissage actuelle',
    longestStreak: 'Plus longue série',
    loyaltyTier: 'Niveau de fidélité',
    totalPoints: 'Points totaux',
    weeks: 'semaines',
    sessionHistory: 'Historique des sessions',
    date: 'Date',
    coach: 'Coach',
    focusArea: 'Domaine',
    duration: 'Durée',
    status: 'Statut',
    minutes: 'min',
    recentFeedback: 'Commentaires récents',
    rating: 'Note',
    comment: 'Commentaire',
    footer: '© 2026 Rusinga International Consulting Ltd. - Lingueefy',
    confidential: 'Ce document est confidentiel et destiné uniquement au destinataire.',
    notAssessed: 'Non évalué',
    notSet: 'Non défini',
  },
};

export function generateProgressReportPDF(data: ProgressReportData): void {
  const t = translations[data.language];
  const doc = new jsPDF();
  
  // Colors
  const tealColor = [13, 148, 136]; // Teal-500
  const darkColor = [30, 41, 59]; // Slate-800
  const lightGray = [241, 245, 249]; // Slate-100
  
  let yPos = 20;
  
  // Header with logo placeholder and title
  doc.setFillColor(tealColor[0], tealColor[1], tealColor[2]);
  doc.rect(0, 0, 220, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(t.title, 20, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(t.subtitle, 20, 33);
  
  // Date on right side
  doc.setFontSize(9);
  doc.text(`${t.generatedOn}: ${new Date().toLocaleDateString(data.language === 'fr' ? 'fr-CA' : 'en-CA')}`, 190, 25, { align: 'right' });
  
  yPos = 55;
  
  // Learner Information Section
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(t.learnerInfo, 20, yPos);
  
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const learnerInfo = [
    [t.name, data.learnerName],
    [t.department, data.department || '-'],
    [t.position, data.position || '-'],
    [t.examDate, data.examDate ? new Date(data.examDate).toLocaleDateString(data.language === 'fr' ? 'fr-CA' : 'en-CA') : t.notSet],
  ];
  
  learnerInfo.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 60, yPos);
    yPos += 6;
  });
  
  yPos += 5;
  
  // SLE Levels Section (side by side)
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(t.currentLevels, 20, yPos);
  doc.text(t.targetLevels, 115, yPos);
  
  yPos += 8;
  
  // Level boxes
  const levelWidth = 25;
  const levelHeight = 20;
  const levels = ['reading', 'writing', 'oral'] as const;
  const levelLabels = { reading: t.reading, writing: t.writing, oral: t.oral };
  
  levels.forEach((level, index) => {
    const xCurrent = 20 + (index * (levelWidth + 5));
    const xTarget = 115 + (index * (levelWidth + 5));
    
    // Current level box
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.roundedRect(xCurrent, yPos, levelWidth, levelHeight, 3, 3, 'F');
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(tealColor[0], tealColor[1], tealColor[2]);
    const currentVal = data.currentLevel[level] || 'X';
    doc.text(currentVal, xCurrent + levelWidth/2, yPos + 13, { align: 'center' });
    
    // Target level box
    doc.setFillColor(tealColor[0], tealColor[1], tealColor[2]);
    doc.roundedRect(xTarget, yPos, levelWidth, levelHeight, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    const targetVal = data.targetLevel[level] || 'X';
    doc.text(targetVal, xTarget + levelWidth/2, yPos + 13, { align: 'center' });
  });
  
  yPos += levelHeight + 3;
  
  // Level labels
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  levels.forEach((level, index) => {
    const xCurrent = 20 + (index * (levelWidth + 5));
    const xTarget = 115 + (index * (levelWidth + 5));
    const label = levelLabels[level].substring(0, 10);
    doc.text(label, xCurrent + levelWidth/2, yPos, { align: 'center' });
    doc.text(label, xTarget + levelWidth/2, yPos, { align: 'center' });
  });
  
  yPos += 15;
  
  // Progress Summary Section
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(t.progressSummary, 20, yPos);
  
  yPos += 8;
  
  // Stats grid
  const stats = [
    [t.totalCoachSessions, data.totalSessions.toString()],
    [t.totalAiSessions, data.totalAiSessions.toString()],
    [t.currentStreak, `${data.currentStreak} ${t.weeks}`],
    [t.longestStreak, `${data.longestStreak} ${t.weeks}`],
    [t.loyaltyTier, data.loyaltyTier],
    [t.totalPoints, data.totalPoints.toString()],
  ];
  
  doc.setFontSize(10);
  stats.forEach(([label, value], index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = 20 + (col * 90);
    const y = yPos + (row * 8);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`${label}:`, x, y);
    doc.setFont('helvetica', 'bold');
    doc.text(value, x + 60, y);
  });
  
  yPos += 30;
  
  // Session History Table
  if (data.sessionsHistory.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(t.sessionHistory, 20, yPos);
    
    yPos += 5;
    
    autoTable(doc, {
      startY: yPos,
      head: [[t.date, t.coach, t.focusArea, t.duration, t.status]],
      body: data.sessionsHistory.slice(0, 10).map(session => [
        new Date(session.date).toLocaleDateString(data.language === 'fr' ? 'fr-CA' : 'en-CA'),
        session.coachName,
        session.focusArea,
        `${session.duration} ${t.minutes}`,
        session.status,
      ]),
      theme: 'striped',
      headStyles: {
        fillColor: [tealColor[0], tealColor[1], tealColor[2]],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      margin: { left: 20, right: 20 },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // Recent Feedback Section
  if (data.recentReviews.length > 0 && yPos < 240) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text(t.recentFeedback, 20, yPos);
    
    yPos += 5;
    
    autoTable(doc, {
      startY: yPos,
      head: [[t.date, t.coach, t.rating, t.comment]],
      body: data.recentReviews.slice(0, 5).map(review => [
        new Date(review.date).toLocaleDateString(data.language === 'fr' ? 'fr-CA' : 'en-CA'),
        review.coachName,
        '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating),
        review.comment?.substring(0, 50) || '-',
      ]),
      theme: 'striped',
      headStyles: {
        fillColor: [tealColor[0], tealColor[1], tealColor[2]],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        3: { cellWidth: 60 },
      },
      margin: { left: 20, right: 20 },
    });
  }
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Footer line
    doc.setDrawColor(tealColor[0], tealColor[1], tealColor[2]);
    doc.setLineWidth(0.5);
    doc.line(20, 280, 190, 280);
    
    // Footer text
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text(t.footer, 105, 286, { align: 'center' });
    doc.text(t.confidential, 105, 291, { align: 'center' });
    doc.text(`Page ${i} / ${pageCount}`, 190, 286, { align: 'right' });
  }
  
  // Save the PDF
  const fileName = `Lingueefy_Progress_Report_${data.learnerName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
