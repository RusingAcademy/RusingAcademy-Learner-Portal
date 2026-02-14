/**
 * CRM Activity Report Cron Job
 * 
 * Generates and sends weekly CRM activity reports
 * 
 * Endpoint: POST /api/cron/crm-activity-report
 * Schedule: Weekly on Monday at 9:00 AM
 */

import { generateActivityReport, getWeeklyPeriod, saveActivityReport, sendWeeklyCrmReport } from "../crm-activity-report";

export interface CrmActivityReportCronResult {
  success: boolean;
  reportId: number | null;
  emailSent: boolean;
  data: {
    newLeads: number;
    convertedLeads: number;
    lostLeads: number;
    totalDealValue: number;
    emailsSent: number;
    meetingsCompleted: number;
  } | null;
  duration: number;
  timestamp: string;
}

/**
 * Execute CRM activity report cron job
 */
export async function runCrmActivityReportCron(recipientEmail?: string): Promise<CrmActivityReportCronResult> {
  const startTime = Date.now();
  
  console.log("[CRM Report] Starting weekly report generation...");
  
  try {
    const period = getWeeklyPeriod();
    const data = await generateActivityReport(period);
    
    // Save report to database
    const reportId = await saveActivityReport(period, data);
    
    // Send email if recipient provided
    let emailSent = false;
    if (recipientEmail) {
      emailSent = await sendWeeklyCrmReport(recipientEmail);
    }
    
    const duration = Date.now() - startTime;
    
    console.log(`[CRM Report] Completed in ${duration}ms: ${data.newLeads} new leads, ${data.convertedLeads} converted`);
    
    return {
      success: true,
      reportId,
      emailSent,
      data: {
        newLeads: data.newLeads,
        convertedLeads: data.convertedLeads,
        lostLeads: data.lostLeads,
        totalDealValue: data.totalDealValue,
        emailsSent: data.emailsSent,
        meetingsCompleted: data.meetingsCompleted,
      },
      duration,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error("[CRM Report] Failed:", error);
    
    return {
      success: false,
      reportId: null,
      emailSent: false,
      data: null,
      duration,
      timestamp: new Date().toISOString(),
    };
  }
}
