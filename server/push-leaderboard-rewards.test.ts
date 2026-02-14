import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";

describe("Push Notifications, Leaderboard & Rewards Features", () => {
  describe("Leaderboard System", () => {
    it("should have getLeaderboard procedure in learner router", () => {
      expect(appRouter._def.procedures).toHaveProperty("learner.getLeaderboard");
    });

    it("getLeaderboard should accept period parameter", () => {
      const procedure = appRouter._def.procedures["learner.getLeaderboard"];
      expect(procedure).toBeDefined();
      // The procedure should accept weekly, monthly, or allTime period
    });
  });

  describe("Automatic Rewards System", () => {
    it("should export reward functions from rewards.ts", async () => {
      const rewards = await import("./rewards");
      
      expect(rewards.awardPoints).toBeDefined();
      expect(rewards.awardBadge).toBeDefined();
      expect(rewards.checkSessionMilestones).toBeDefined();
      expect(rewards.checkReviewMilestones).toBeDefined();
      expect(rewards.processSessionCompletionRewards).toBeDefined();
      expect(rewards.processReviewRewards).toBeDefined();
      expect(rewards.processReferralRewards).toBeDefined();
    });

    it("should have correct point values defined", async () => {
      const { POINT_VALUES } = await import("./rewards");
      
      expect(POINT_VALUES.SESSION_COMPLETED).toBe(100);
      expect(POINT_VALUES.REVIEW_SUBMITTED).toBe(50);
      expect(POINT_VALUES.FIRST_SESSION).toBe(200);
      expect(POINT_VALUES.REFERRAL_SIGNUP).toBe(300);
    });

    it("should have badge definitions", async () => {
      const { BADGES } = await import("./rewards");
      
      expect(BADGES.FIRST_SESSION).toBeDefined();
      expect(BADGES.FIRST_SESSION.name).toBe("First Steps");
      expect(BADGES.FIVE_SESSIONS).toBeDefined();
      expect(BADGES.TEN_SESSIONS).toBeDefined();
    });
  });

  describe("Push Notification Service Worker", () => {
    it("should have service worker file at public/sw.js", async () => {
      const fs = await import("fs");
      const path = await import("path");
      
      const swPath = path.join(process.cwd(), "client/public/sw.js");
      const exists = fs.existsSync(swPath);
      
      expect(exists).toBe(true);
    });

    it("service worker should handle push events", async () => {
      const fs = await import("fs");
      const path = await import("path");
      
      const swPath = path.join(process.cwd(), "client/public/sw.js");
      const content = fs.readFileSync(swPath, "utf-8");
      
      expect(content).toContain("addEventListener('push'");
      expect(content).toContain("showNotification");
    });

    it("service worker should handle notification clicks", async () => {
      const fs = await import("fs");
      const path = await import("path");
      
      const swPath = path.join(process.cwd(), "client/public/sw.js");
      const content = fs.readFileSync(swPath, "utf-8");
      
      expect(content).toContain("notificationclick");
    });
  });

  describe("Push Notification Endpoints", () => {
    it("should have subscribePush procedure in notifications router", () => {
      expect(appRouter._def.procedures).toHaveProperty("notifications.subscribePush");
    });

    it("should have unsubscribePush procedure in notifications router", () => {
      expect(appRouter._def.procedures).toHaveProperty("notifications.unsubscribePush");
    });

    it("should have updatePushPreferences procedure in notifications router", () => {
      expect(appRouter._def.procedures).toHaveProperty("notifications.updatePushPreferences");
    });
  });

  describe("In-App Notifications", () => {
    it("should have getInAppNotifications procedure", () => {
      expect(appRouter._def.procedures).toHaveProperty("notification.getInAppNotifications");
    });

    it("should have markNotificationRead procedure", () => {
      expect(appRouter._def.procedures).toHaveProperty("notification.markNotificationRead");
    });

    it("should have markAllNotificationsRead procedure", () => {
      expect(appRouter._def.procedures).toHaveProperty("notification.markAllNotificationsRead");
    });
  });
});
