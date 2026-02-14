/**
 * Month 2 Sprint 3: Push Notifications, Coach Metrics & PDF Export Tests
 * 
 * Covers:
 * 1. Push Notification Service (server-side triggers)
 * 2. Push Notification Router (subscribe/unsubscribe/preferences)
 * 3. Coach Learner Metrics Router (cohort, at-risk, XP timeline, SLE)
 * 4. PDF Progress Report Service (data gathering, HTML generation)
 * 5. Progress Report Router (endpoints)
 * 6. XP Engine v2 (calculateXpMultiplier, milestones, enhanced XP)
 * 7. Frontend Component Existence
 * 8. Service Worker Push Handling
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fs from "fs";
import * as path from "path";

// ============================================================================
// 1. PUSH NOTIFICATION SERVICE
// ============================================================================
describe("Push Notification Service", () => {
  it("should export all trigger functions", async () => {
    const service = await import("./services/pushNotificationService");
    expect(typeof service.sendPushToUser).toBe("function");
    expect(typeof service.notifyBadgeEarned).toBe("function");
    expect(typeof service.notifyStreakAtRisk).toBe("function");
    expect(typeof service.notifyUpcomingSession).toBe("function");
    expect(typeof service.notifyMilestoneReached).toBe("function");
    expect(typeof service.notifyWeeklyDigest).toBe("function");
    expect(typeof service.notifyCoachNewBooking).toBe("function");
    expect(typeof service.notifyNewMessage).toBe("function");
  });

  it("should export cron check functions", async () => {
    const service = await import("./services/pushNotificationService");
    expect(typeof service.checkStreaksAtRisk).toBe("function");
    expect(typeof service.checkUpcomingSessions).toBe("function");
  });

  it("should export getVapidPublicKey", async () => {
    const service = await import("./services/pushNotificationService");
    expect(typeof service.getVapidPublicKey).toBe("function");
    const key = service.getVapidPublicKey();
    expect(typeof key).toBe("string");
    expect(key.length).toBeGreaterThan(0);
  });

  it("should define PushCategory type with correct categories", async () => {
    // Verify the categories are used in the service
    const content = fs.readFileSync("./server/services/pushNotificationService.ts", "utf-8");
    expect(content).toContain('"bookings"');
    expect(content).toContain('"messages"');
    expect(content).toContain('"reminders"');
    expect(content).toContain('"marketing"');
  });

  it("should handle expired subscriptions by deactivating them", async () => {
    const content = fs.readFileSync("./server/services/pushNotificationService.ts", "utf-8");
    expect(content).toContain("statusCode === 404");
    expect(content).toContain("statusCode === 410");
    expect(content).toContain("isActive = 0");
  });

  it("should set TTL of 24 hours for push notifications", async () => {
    const content = fs.readFileSync("./server/services/pushNotificationService.ts", "utf-8");
    expect(content).toContain("TTL: 86400");
  });

  it("notifyBadgeEarned should use reminders category", async () => {
    const content = fs.readFileSync("./server/services/pushNotificationService.ts", "utf-8");
    // Find the notifyBadgeEarned function and verify it uses reminders category
    const badgeSection = content.substring(
      content.indexOf("notifyBadgeEarned"),
      content.indexOf("notifyStreakAtRisk")
    );
    expect(badgeSection).toContain('category: "reminders"');
  });

  it("notifyUpcomingSession should use bookings category", async () => {
    const content = fs.readFileSync("./server/services/pushNotificationService.ts", "utf-8");
    const sessionSection = content.substring(
      content.indexOf("notifyUpcomingSession"),
      content.indexOf("notifyMilestoneReached")
    );
    expect(sessionSection).toContain('category: "bookings"');
  });

  it("notifyNewMessage should use messages category", async () => {
    const content = fs.readFileSync("./server/services/pushNotificationService.ts", "utf-8");
    const messageSection = content.substring(
      content.indexOf("notifyNewMessage"),
      content.indexOf("checkStreaksAtRisk")
    );
    expect(messageSection).toContain('category: "messages"');
  });
});

// ============================================================================
// 2. PUSH NOTIFICATION ROUTER (tRPC endpoints)
// ============================================================================
describe("Push Notification Router", () => {
  it("should have subscribePush procedure", async () => {
    const { appRouter } = await import("./routers");
    expect(appRouter._def.procedures).toHaveProperty("notifications.subscribePush");
  });

  it("should have unsubscribePush procedure", async () => {
    const { appRouter } = await import("./routers");
    expect(appRouter._def.procedures).toHaveProperty("notifications.unsubscribePush");
  });

  it("should have updatePushPreferences procedure", async () => {
    const { appRouter } = await import("./routers");
    expect(appRouter._def.procedures).toHaveProperty("notifications.updatePushPreferences");
  });

  it("subscribePush should accept endpoint, p256dh, auth fields", async () => {
    const content = fs.readFileSync("./server/routers.ts", "utf-8");
    const subSection = content.substring(
      content.indexOf("subscribePush:"),
      content.indexOf("unsubscribePush:")
    );
    expect(subSection).toContain("endpoint: z.string()");
    expect(subSection).toContain("p256dh: z.string()");
    expect(subSection).toContain("auth: z.string()");
  });

  it("subscribePush should accept preference toggles", async () => {
    const content = fs.readFileSync("./server/routers.ts", "utf-8");
    const subSection = content.substring(
      content.indexOf("subscribePush:"),
      content.indexOf("unsubscribePush:")
    );
    expect(subSection).toContain("enableBookings:");
    expect(subSection).toContain("enableMessages:");
    expect(subSection).toContain("enableReminders:");
    expect(subSection).toContain("enableMarketing:");
  });
});

// ============================================================================
// 3. COACH LEARNER METRICS ROUTER
// ============================================================================
describe("Coach Learner Metrics Router", () => {
  it("should be registered in the main appRouter", async () => {
    const { appRouter } = await import("./routers");
    expect(appRouter._def.procedures).toHaveProperty("coachMetrics.getLearnersWithMetrics");
    expect(appRouter._def.procedures).toHaveProperty("coachMetrics.getCohortSummary");
    expect(appRouter._def.procedures).toHaveProperty("coachMetrics.getAtRiskLearners");
  });

  it("should have getLearnerXpTimeline procedure", async () => {
    const { appRouter } = await import("./routers");
    expect(appRouter._def.procedures).toHaveProperty("coachMetrics.getLearnerXpTimeline");
  });

  it("should have getLearnerSleProgress procedure", async () => {
    const { appRouter } = await import("./routers");
    expect(appRouter._def.procedures).toHaveProperty("coachMetrics.getLearnerSleProgress");
  });

  it("should export coachLearnerMetricsRouter from file", async () => {
    const mod = await import("./routers/coachLearnerMetrics");
    expect(mod.coachLearnerMetricsRouter).toBeDefined();
    expect(mod.coachLearnerMetricsRouter._def).toBeDefined();
  });

  it("getLearnersWithMetrics should include XP, streak, and session data", async () => {
    const content = fs.readFileSync("./server/routers/coachLearnerMetrics.ts", "utf-8");
    expect(content).toContain("totalXp");
    expect(content).toContain("currentStreak");
    expect(content).toContain("totalSessions");
    expect(content).toContain("completedSessions");
    expect(content).toContain("avgSessionRating");
  });

  it("getLearnersWithMetrics should detect at-risk learners", async () => {
    const content = fs.readFileSync("./server/routers/coachLearnerMetrics.ts", "utf-8");
    expect(content).toContain("isAtRisk");
    expect(content).toContain("7 * 24 * 60 * 60 * 1000");
  });

  it("getAtRiskLearners should classify risk levels", async () => {
    const content = fs.readFileSync("./server/routers/coachLearnerMetrics.ts", "utf-8");
    expect(content).toContain('"high"');
    expect(content).toContain('"medium"');
    expect(content).toContain('"low"');
    expect(content).toContain("daysSinceActivity");
  });

  it("getCohortSummary should return aggregate stats", async () => {
    const content = fs.readFileSync("./server/routers/coachLearnerMetrics.ts", "utf-8");
    expect(content).toContain("totalLearners");
    expect(content).toContain("activeLearners");
    expect(content).toContain("atRiskLearners");
    expect(content).toContain("avgXp");
    expect(content).toContain("avgStreak");
    expect(content).toContain("totalSessionsCompleted");
    expect(content).toContain("avgCompletionRate");
  });

  it("should verify coach access before returning data", async () => {
    const content = fs.readFileSync("./server/routers/coachLearnerMetrics.ts", "utf-8");
    expect(content).toContain("getCoachProfileId");
    expect(content).toContain("FORBIDDEN");
    expect(content).toContain("Coach profile not found");
  });
});

// ============================================================================
// 4. PDF PROGRESS REPORT SERVICE
// ============================================================================
describe("PDF Progress Report Service", () => {
  it("should export gatherProgressData and generateReportHTML", async () => {
    const mod = await import("./services/pdfProgressReport");
    expect(typeof mod.gatherProgressData).toBe("function");
    expect(typeof mod.generateReportHTML).toBe("function");
  });

  it("generateReportHTML should produce valid HTML for English", async () => {
    const { generateReportHTML, ProgressReportData } = await import("./services/pdfProgressReport");
    const mockData = createMockReportData();
    const html = generateReportHTML(mockData, "en");
    
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain('<html lang="en">');
    expect(html).toContain("Progress Report");
    expect(html).toContain(mockData.learner.name);
    expect(html).toContain("Total XP");
    expect(html).toContain("SLE Performance");
    expect(html).toContain("Coaching Sessions");
    expect(html).toContain("Courses");
    expect(html).toContain("Recent Activity");
  });

  it("generateReportHTML should produce valid HTML for French", async () => {
    const { generateReportHTML } = await import("./services/pdfProgressReport");
    const mockData = createMockReportData();
    const html = generateReportHTML(mockData, "fr");
    
    expect(html).toContain('<html lang="fr">');
    expect(html).toContain("Rapport de progression");
    expect(html).toContain("XP Total");
    expect(html).toContain("Performance SLE");
    expect(html).toContain("Sessions de coaching");
    expect(html).toContain("Activité récente");
  });

  it("generateReportHTML should include print button", async () => {
    const { generateReportHTML } = await import("./services/pdfProgressReport");
    const mockData = createMockReportData();
    const html = generateReportHTML(mockData, "en");
    
    expect(html).toContain("window.print()");
    expect(html).toContain("no-print");
    expect(html).toContain("Print / Download PDF");
  });

  it("generateReportHTML should include print media query", async () => {
    const { generateReportHTML } = await import("./services/pdfProgressReport");
    const mockData = createMockReportData();
    const html = generateReportHTML(mockData, "en");
    
    expect(html).toContain("@media print");
  });

  it("generateReportHTML should color-code scores correctly", async () => {
    const { generateReportHTML } = await import("./services/pdfProgressReport");
    const mockData = createMockReportData();
    mockData.sleProgress.averageScore = 75;
    const html = generateReportHTML(mockData, "en");
    
    // Score >= 70 should use green color
    expect(html).toContain("#16a34a");
  });

  it("generateReportHTML should handle empty activity gracefully", async () => {
    const { generateReportHTML } = await import("./services/pdfProgressReport");
    const mockData = createMockReportData();
    mockData.recentActivity = [];
    const html = generateReportHTML(mockData, "en");
    
    expect(html).toContain("No recent activity");
  });

  it("should include RusingÂcademy branding in footer", async () => {
    const { generateReportHTML } = await import("./services/pdfProgressReport");
    const mockData = createMockReportData();
    const html = generateReportHTML(mockData, "en");
    
    expect(html).toContain("RusingÂcademy");
    expect(html).toContain("Lingueefy");
    expect(html).toContain("Barholex Media");
  });

  it("should include skill breakdown bars when data exists", async () => {
    const { generateReportHTML } = await import("./services/pdfProgressReport");
    const mockData = createMockReportData();
    mockData.sleProgress.skillBreakdown = [
      { skill: "oral", score: 72, sessions: 5 },
      { skill: "written", score: 58, sessions: 3 },
    ];
    const html = generateReportHTML(mockData, "en");
    
    expect(html).toContain("oral");
    expect(html).toContain("72%");
    expect(html).toContain("written");
    expect(html).toContain("58%");
  });
});

// ============================================================================
// 5. PROGRESS REPORT ROUTER
// ============================================================================
describe("Progress Report Router", () => {
  it("should be registered in the main appRouter", async () => {
    const { appRouter } = await import("./routers");
    expect(appRouter._def.procedures).toHaveProperty("progressReport.generateMyReport");
    expect(appRouter._def.procedures).toHaveProperty("progressReport.generateLearnerReport");
    expect(appRouter._def.procedures).toHaveProperty("progressReport.getMyProgressData");
  });

  it("should export progressReportRouter from file", async () => {
    const mod = await import("./routers/progressReport");
    expect(mod.progressReportRouter).toBeDefined();
  });

  it("generateMyReport should accept periodDays and language", async () => {
    const content = fs.readFileSync("./server/routers/progressReport.ts", "utf-8");
    expect(content).toContain("periodDays: z.number()");
    expect(content).toContain('language: z.enum(["fr", "en"])');
  });

  it("generateLearnerReport should accept learnerId for coach/admin", async () => {
    const content = fs.readFileSync("./server/routers/progressReport.ts", "utf-8");
    expect(content).toContain("learnerId: z.number()");
  });
});

// ============================================================================
// 6. XP ENGINE V2 (Pure Function Tests)
// ============================================================================
describe("XP Engine v2 — Pure Functions", () => {
  it("should export calculateXpMultiplier", async () => {
    const { calculateXpMultiplier } = await import("./services/xpEngine");
    expect(typeof calculateXpMultiplier).toBe("function");
  });

  it("calculateXpMultiplier should return 1.0 for no streak, level 1", async () => {
    const { calculateXpMultiplier } = await import("./services/xpEngine");
    const result = calculateXpMultiplier(0, 1);
    expect(result.totalMultiplier).toBe(1.0);
    expect(result.streakMultiplier).toBe(1.0);
    expect(result.levelMultiplier).toBe(1.0);
    expect(result.streakLabel).toBe("No Bonus");
  });

  it("calculateXpMultiplier should give 1.25x for 3-day streak", async () => {
    const { calculateXpMultiplier } = await import("./services/xpEngine");
    const result = calculateXpMultiplier(3, 1);
    expect(result.streakMultiplier).toBe(1.25);
    expect(result.streakLabel).toBe("Warming Up");
  });

  it("calculateXpMultiplier should give 1.5x for 7-day streak", async () => {
    const { calculateXpMultiplier } = await import("./services/xpEngine");
    const result = calculateXpMultiplier(7, 1);
    expect(result.streakMultiplier).toBe(1.5);
    expect(result.streakLabel).toBe("Hot Streak");
  });

  it("calculateXpMultiplier should give 2.0x for 21-day streak", async () => {
    const { calculateXpMultiplier } = await import("./services/xpEngine");
    const result = calculateXpMultiplier(21, 1);
    expect(result.streakMultiplier).toBe(2.0);
    expect(result.streakLabel).toBe("Master Streak");
  });

  it("calculateXpMultiplier should give 2.5x for 30+ day streak", async () => {
    const { calculateXpMultiplier } = await import("./services/xpEngine");
    const result = calculateXpMultiplier(30, 1);
    expect(result.streakMultiplier).toBe(2.5);
    expect(result.streakLabel).toBe("Legendary Streak");
  });

  it("calculateXpMultiplier should apply level multiplier for level 5+", async () => {
    const { calculateXpMultiplier } = await import("./services/xpEngine");
    const result = calculateXpMultiplier(0, 5);
    expect(result.levelMultiplier).toBe(1.2);
  });

  it("calculateXpMultiplier should apply level multiplier for level 8+", async () => {
    const { calculateXpMultiplier } = await import("./services/xpEngine");
    const result = calculateXpMultiplier(0, 8);
    expect(result.levelMultiplier).toBe(1.3);
  });

  it("calculateXpMultiplier should combine streak and level multipliers", async () => {
    const { calculateXpMultiplier } = await import("./services/xpEngine");
    const result = calculateXpMultiplier(7, 5); // 1.5 * 1.2 = 1.8
    expect(result.totalMultiplier).toBe(1.8);
  });

  it("calculateEnhancedXp should correctly compute bonus XP", async () => {
    const { calculateEnhancedXp } = await import("./services/xpEngine");
    const result = calculateEnhancedXp(100, 7, 5); // 100 * 1.8 = 180
    expect(result.baseXp).toBe(100);
    expect(result.totalXp).toBe(180);
    expect(result.bonusXp).toBe(80);
  });

  it("calculateEnhancedXp should return 0 bonus for no multiplier", async () => {
    const { calculateEnhancedXp } = await import("./services/xpEngine");
    const result = calculateEnhancedXp(50, 0, 1);
    expect(result.baseXp).toBe(50);
    expect(result.totalXp).toBe(50);
    expect(result.bonusXp).toBe(0);
  });

  it("MILESTONES should have 10 tiers in ascending order", async () => {
    const { MILESTONES } = await import("./services/xpEngine");
    expect(MILESTONES.length).toBe(10);
    for (let i = 1; i < MILESTONES.length; i++) {
      expect(MILESTONES[i].xpThreshold).toBeGreaterThan(MILESTONES[i - 1].xpThreshold);
    }
  });

  it("MILESTONES should have bilingual titles", async () => {
    const { MILESTONES } = await import("./services/xpEngine");
    for (const m of MILESTONES) {
      expect(m.title).toBeTruthy();
      expect(m.titleFr).toBeTruthy();
      expect(m.icon).toBeTruthy();
      expect(m.xpBonus).toBeGreaterThan(0);
    }
  });

  it("checkNewMilestones should detect newly reached milestones", async () => {
    const { checkNewMilestones } = await import("./services/xpEngine");
    const newMilestones = checkNewMilestones(50, 150);
    expect(newMilestones.length).toBe(1);
    expect(newMilestones[0].xpThreshold).toBe(100);
  });

  it("checkNewMilestones should skip already-reached milestones", async () => {
    const { checkNewMilestones } = await import("./services/xpEngine");
    const newMilestones = checkNewMilestones(50, 300, [1]); // milestone id 1 already reached
    expect(newMilestones.find(m => m.id === 1)).toBeUndefined();
  });

  it("getNextMilestone should return the next unachieved milestone", async () => {
    const { getNextMilestone } = await import("./services/xpEngine");
    const next = getNextMilestone(150);
    expect(next).not.toBeNull();
    expect(next!.xpThreshold).toBe(250);
  });

  it("getNextMilestone should return null when all milestones reached", async () => {
    const { getNextMilestone } = await import("./services/xpEngine");
    const next = getNextMilestone(20000);
    expect(next).toBeNull();
  });

  it("getMilestoneProgress should return correct progress percentage", async () => {
    const { getMilestoneProgress } = await import("./services/xpEngine");
    const progress = getMilestoneProgress(175); // Between 100 and 250
    expect(progress.current).not.toBeNull();
    expect(progress.current!.xpThreshold).toBe(100);
    expect(progress.next).not.toBeNull();
    expect(progress.next!.xpThreshold).toBe(250);
    expect(progress.progressPercent).toBe(50); // (175-100)/(250-100) = 50%
    expect(progress.xpRemaining).toBe(75);
  });

  it("getMilestoneProgress should return 100% when all milestones reached", async () => {
    const { getMilestoneProgress } = await import("./services/xpEngine");
    const progress = getMilestoneProgress(20000);
    expect(progress.progressPercent).toBe(100);
    expect(progress.xpRemaining).toBe(0);
    expect(progress.next).toBeNull();
  });
});

// ============================================================================
// 7. FRONTEND COMPONENT EXISTENCE
// ============================================================================
describe("Frontend Components — Month 2 Sprint 3", () => {
  it("should have LearnerMetricsPanel component", () => {
    expect(fs.existsSync("./client/src/components/LearnerMetricsPanel.tsx")).toBe(true);
  });

  it("should have CoachAnalytics component", () => {
    expect(fs.existsSync("./client/src/components/CoachAnalytics.tsx")).toBe(true);
  });

  it("should have StudentProgressWidget component", () => {
    expect(fs.existsSync("./client/src/components/StudentProgressWidget.tsx")).toBe(true);
  });

  it("should have ProgressReport page", () => {
    expect(fs.existsSync("./client/src/pages/ProgressReport.tsx")).toBe(true);
  });

  it("should have usePushNotifications hook", () => {
    expect(fs.existsSync("./client/src/hooks/usePushNotifications.ts")).toBe(true);
  });

  it("LearnerMetricsPanel should use coachMetrics tRPC queries", () => {
    const content = fs.readFileSync("./client/src/components/LearnerMetricsPanel.tsx", "utf-8");
    expect(content).toContain("trpc.coachMetrics.getCohortSummary");
    expect(content).toContain("trpc.coachMetrics.getLearnersWithMetrics");
    expect(content).toContain("trpc.coachMetrics.getAtRiskLearners");
  });

  it("LearnerMetricsPanel should be bilingual (FR/EN)", () => {
    const content = fs.readFileSync("./client/src/components/LearnerMetricsPanel.tsx", "utf-8");
    expect(content).toContain('"fr"');
    expect(content).toContain('"en"');
    expect(content).toContain("Performance des apprenants");
    expect(content).toContain("Learner Performance");
  });

  it("CoachDashboard should import LearnerMetricsPanel", () => {
    const content = fs.readFileSync("./client/src/pages/CoachDashboard.tsx", "utf-8");
    expect(content).toContain("LearnerMetricsPanel");
  });

  it("ProgressReport should use progressReport.generateMyReport mutation", () => {
    const content = fs.readFileSync("./client/src/pages/ProgressReport.tsx", "utf-8");
    expect(content).toContain("trpc.progressReport.generateMyReport.useMutation");
  });

  it("ProgressReport should support language selection (FR/EN)", () => {
    const content = fs.readFileSync("./client/src/pages/ProgressReport.tsx", "utf-8");
    expect(content).toContain('setLanguage(v as');
    expect(content).toContain('"fr" | "en"');
  });

  it("ProgressReport should support period selection", () => {
    const content = fs.readFileSync("./client/src/pages/ProgressReport.tsx", "utf-8");
    expect(content).toContain("periodDays");
    expect(content).toContain('"30"');
    expect(content).toContain('"90"');
    expect(content).toContain('"180"');
    expect(content).toContain('"365"');
  });

  it("ProgressReport should render report in iframe with print support", () => {
    const content = fs.readFileSync("./client/src/pages/ProgressReport.tsx", "utf-8");
    expect(content).toContain("iframe");
    expect(content).toContain("srcDoc");
    expect(content).toContain("contentWindow.print()");
  });

  it("usePushNotifications hook should export subscribe/unsubscribe/showNotification", () => {
    const content = fs.readFileSync("./client/src/hooks/usePushNotifications.ts", "utf-8");
    expect(content).toContain("subscribe");
    expect(content).toContain("unsubscribe");
    expect(content).toContain("showNotification");
    expect(content).toContain("requestPermission");
  });

  it("ProgressReport route should be registered in App.tsx", () => {
    const content = fs.readFileSync("./client/src/App.tsx", "utf-8");
    expect(content).toContain('/progress/report"');
    expect(content).toContain("ProgressReport");
  });
});

// ============================================================================
// 8. SERVICE WORKER PUSH HANDLING
// ============================================================================
describe("Service Worker — Push Notification Handling", () => {
  it("should have service worker file at client/public/sw.js", () => {
    expect(fs.existsSync("./client/public/sw.js")).toBe(true);
  });

  it("should handle push events with showNotification", () => {
    const content = fs.readFileSync("./client/public/sw.js", "utf-8");
    expect(content).toContain("addEventListener('push'");
    expect(content).toContain("showNotification");
    expect(content).toContain("event.data.json()");
  });

  it("should handle notification click with URL navigation", () => {
    const content = fs.readFileSync("./client/public/sw.js", "utf-8");
    expect(content).toContain("notificationclick");
    expect(content).toContain("notification.data");
    expect(content).toContain("openWindow");
  });

  it("should support offline caching strategies", () => {
    const content = fs.readFileSync("./client/public/sw.js", "utf-8");
    expect(content).toContain("cacheFirst");
    expect(content).toContain("networkFirst");
    expect(content).toContain("staleWhileRevalidate");
  });

  it("should support background sync for offline progress", () => {
    const content = fs.readFileSync("./client/public/sw.js", "utf-8");
    expect(content).toContain("sync");
    expect(content).toContain("sync-progress");
  });

  it("should support course material caching", () => {
    const content = fs.readFileSync("./client/public/sw.js", "utf-8");
    expect(content).toContain("CACHE_COURSE");
    expect(content).toContain("cacheCourseMaterials");
  });
});

// ============================================================================
// 9. INTEGRATION: ROUTER WIRING
// ============================================================================
describe("Router Wiring — Month 2 Sprint 3", () => {
  it("should have coachMetrics router wired in appRouter", async () => {
    const content = fs.readFileSync("./server/routers.ts", "utf-8");
    expect(content).toContain("coachMetrics: coachLearnerMetricsRouter");
    expect(content).toContain('import { coachLearnerMetricsRouter }');
  });

  it("should have progressReport router wired in appRouter", async () => {
    const content = fs.readFileSync("./server/routers.ts", "utf-8");
    expect(content).toContain("progressReport: progressReportRouter");
    expect(content).toContain('import { progressReportRouter }');
  });

  it("should have learnerProgression router wired in appRouter", async () => {
    const content = fs.readFileSync("./server/routers.ts", "utf-8");
    expect(content).toContain("learnerProgression: learnerProgressionRouter");
    expect(content).toContain('import { learnerProgressionRouter }');
  });

  it("should have notifications router with push endpoints", async () => {
    const content = fs.readFileSync("./server/routers.ts", "utf-8");
    expect(content).toContain("subscribePush:");
    expect(content).toContain("unsubscribePush:");
    expect(content).toContain("updatePushPreferences:");
  });
});

// ============================================================================
// HELPER: Mock Progress Report Data
// ============================================================================
function createMockReportData() {
  return {
    learner: {
      name: "Test Learner",
      email: "test@rusingacademy.ca",
      currentLevel: "B",
      joinDate: "2025-06-01T00:00:00.000Z",
    },
    gamification: {
      totalXp: 2500,
      level: 5,
      currentStreak: 12,
      longestStreak: 21,
      badgesEarned: 8,
      totalBadges: 20,
    },
    sleProgress: {
      sessionsCompleted: 15,
      averageScore: 65,
      targetLevel: "B",
      skillBreakdown: [
        { skill: "oral", score: 70, sessions: 8 },
        { skill: "written", score: 60, sessions: 7 },
      ],
    },
    coachingSessions: {
      total: 10,
      completed: 8,
      averageRating: 4.5,
      hoursLogged: 8,
    },
    courseProgress: {
      enrolled: 3,
      completed: 1,
      inProgress: 2,
      completionRate: 33,
    },
    recentActivity: [
      {
        date: "2026-02-05T10:00:00.000Z",
        type: "lesson_complete",
        description: "Completed Lesson 3: Oral Practice",
        xpEarned: 25,
      },
      {
        date: "2026-02-04T14:00:00.000Z",
        type: "quiz_pass",
        description: "Passed Grammar Quiz",
        xpEarned: 50,
      },
    ],
    generatedAt: new Date().toISOString(),
    periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    periodEnd: new Date().toISOString(),
  };
}
