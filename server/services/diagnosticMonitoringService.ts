/**
 * Diagnostic Quiz Monitoring Service
 * RusingÂcademy Learning Ecosystem
 * 
 * Real-time monitoring for the Diagnostic Quiz funnel to detect
 * PDF generation failures and track conversion metrics.
 * 
 * @copyright Rusinga International Consulting Ltd.
 */

// Database imports commented out - tables not yet created
// import { getDb } from '../db';
// import { diagnosticResults, users, leads } from '../../drizzle/schema';
// import { eq, and, gte, count, sql } from 'drizzle-orm';

// Types
export interface DiagnosticEvent {
  eventType: 'quiz_started' | 'quiz_completed' | 'pdf_generated' | 'pdf_sent' | 'pdf_failed';
  userId?: string;
  sessionId: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface FunnelMetrics {
  period: string;
  pageVisits: number;
  quizStarted: number;
  quizCompleted: number;
  pdfGenerated: number;
  pdfSent: number;
  pdfFailed: number;
  conversionRate: number;
  completionRate: number;
  deliverySuccessRate: number;
}

export interface AlertConfig {
  type: 'pdf_failure' | 'low_completion' | 'delivery_issue';
  threshold: number;
  windowMinutes: number;
  notifyEmail: string[];
  notifySlack?: string;
}

// Default alert configurations
const DEFAULT_ALERTS: AlertConfig[] = [
  {
    type: 'pdf_failure',
    threshold: 1,
    windowMinutes: 15,
    notifyEmail: ['admin@rusingacademy.ca', 'tech@rusingacademy.ca']
  },
  {
    type: 'low_completion',
    threshold: 40,
    windowMinutes: 60,
    notifyEmail: ['admin@rusingacademy.ca']
  },
  {
    type: 'delivery_issue',
    threshold: 95,
    windowMinutes: 60,
    notifyEmail: ['admin@rusingacademy.ca', 'tech@rusingacademy.ca']
  }
];

const eventStore: DiagnosticEvent[] = [];
const MAX_EVENTS = 10000;

export function logDiagnosticEvent(event: DiagnosticEvent): void {
  eventStore.push(event);
  if (eventStore.length > MAX_EVENTS) {
    eventStore.splice(0, eventStore.length - MAX_EVENTS);
  }
  checkAlerts(event);
}

async function checkAlerts(event: DiagnosticEvent): Promise<void> {
  for (const alert of DEFAULT_ALERTS) {
    const windowStart = new Date(Date.now() - alert.windowMinutes * 60 * 1000);
    if (alert.type === 'pdf_failure' && event.eventType === 'pdf_failed') {
      const recentFailures = eventStore.filter(
        e => e.eventType === 'pdf_failed' && e.timestamp >= windowStart
      ).length;
      if (recentFailures >= alert.threshold) {
        await sendAlert(alert, { message: 'PDF generation failure detected', failureCount: recentFailures });
      }
    }
  }
}

async function sendAlert(config: AlertConfig, data: Record<string, unknown>): Promise<void> {
  console.error(`[ALERT] ${config.type}:`, data);
}

export function calculateRealtimeMetrics(windowMinutes: number = 60): FunnelMetrics {
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);
  const recentEvents = eventStore.filter(e => e.timestamp >= windowStart);
  const quizStarted = recentEvents.filter(e => e.eventType === 'quiz_started').length;
  const quizCompleted = recentEvents.filter(e => e.eventType === 'quiz_completed').length;
  const pdfGenerated = recentEvents.filter(e => e.eventType === 'pdf_generated').length;
  const pdfSent = recentEvents.filter(e => e.eventType === 'pdf_sent').length;
  const pdfFailed = recentEvents.filter(e => e.eventType === 'pdf_failed').length;
  
  return {
    period: `Last ${windowMinutes} minutes`,
    pageVisits: 0,
    quizStarted,
    quizCompleted,
    pdfGenerated,
    pdfSent,
    pdfFailed,
    conversionRate: quizStarted > 0 ? (quizCompleted / quizStarted) * 100 : 0,
    completionRate: quizStarted > 0 ? (quizCompleted / quizStarted) * 100 : 0,
    deliverySuccessRate: pdfGenerated > 0 ? (pdfSent / pdfGenerated) * 100 : 100
  };
}

export function getHealthStatus(): { status: 'healthy' | 'degraded' | 'critical'; metrics: FunnelMetrics; alerts: string[] } {
  const metrics = calculateRealtimeMetrics(15);
  const alerts: string[] = [];
  let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
  
  if (metrics.pdfFailed > 0) {
    alerts.push(`${metrics.pdfFailed} PDF generation failures in last 15 minutes`);
    status = 'degraded';
  }
  if (metrics.pdfFailed > 5) status = 'critical';
  
  return { status, metrics, alerts };
}

export default { logDiagnosticEvent, calculateRealtimeMetrics, getHealthStatus };
