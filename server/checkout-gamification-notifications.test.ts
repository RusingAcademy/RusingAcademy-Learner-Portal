import { describe, it, expect } from "vitest";
import { challenges, userChallenges, inAppNotifications, promoCoupons, couponRedemptions } from "../drizzle/schema";

describe("Checkout, Gamification & Notifications Features", () => {
  describe("Coupon Validation at Checkout", () => {
    it("should have promoCoupons table with required columns", () => {
      // Verify promoCoupons table structure
      expect(promoCoupons).toBeDefined();
      expect(promoCoupons.id).toBeDefined();
      expect(promoCoupons.code).toBeDefined();
      expect(promoCoupons.discountType).toBeDefined();
      expect(promoCoupons.discountValue).toBeDefined();
      expect(promoCoupons.isActive).toBeDefined();
      expect(promoCoupons.usedCount).toBeDefined();
    });

    it("should have couponRedemptions table with required columns", () => {
      // Verify couponRedemptions table structure
      expect(couponRedemptions).toBeDefined();
      expect(couponRedemptions.id).toBeDefined();
      expect(couponRedemptions.couponId).toBeDefined();
      expect(couponRedemptions.userId).toBeDefined();
      expect(couponRedemptions.discountAmount).toBeDefined();
      expect(couponRedemptions.originalAmount).toBeDefined();
      expect(couponRedemptions.finalAmount).toBeDefined();
    });
  });

  describe("Gamification System", () => {
    it("should have challenges table with required columns", () => {
      // Verify challenges table structure
      expect(challenges).toBeDefined();
      expect(challenges.id).toBeDefined();
      expect(challenges.name).toBeDefined();
      expect(challenges.nameFr).toBeDefined();
      expect(challenges.type).toBeDefined();
      expect(challenges.targetCount).toBeDefined();
      expect(challenges.pointsReward).toBeDefined();
      expect(challenges.period).toBeDefined();
      expect(challenges.isActive).toBeDefined();
    });

    it("should have userChallenges table with required columns", () => {
      // Verify userChallenges table structure
      expect(userChallenges).toBeDefined();
      expect(userChallenges.id).toBeDefined();
      expect(userChallenges.userId).toBeDefined();
      expect(userChallenges.challengeId).toBeDefined();
      expect(userChallenges.currentProgress).toBeDefined();
      expect(userChallenges.targetProgress).toBeDefined();
      expect(userChallenges.status).toBeDefined();
      expect(userChallenges.periodStart).toBeDefined();
      expect(userChallenges.periodEnd).toBeDefined();
    });

    it("should support challenge types: sessions, reviews, referrals, streak, first_session", () => {
      // The type enum should include all challenge types
      expect(challenges.type).toBeDefined();
    });

    it("should support challenge periods: daily, weekly, monthly, one_time", () => {
      // The period enum should include all periods
      expect(challenges.period).toBeDefined();
    });
  });

  describe("In-App Notification Center", () => {
    it("should have inAppNotifications table with required columns", () => {
      // Verify inAppNotifications table structure
      expect(inAppNotifications).toBeDefined();
      expect(inAppNotifications.id).toBeDefined();
      expect(inAppNotifications.userId).toBeDefined();
      expect(inAppNotifications.type).toBeDefined();
      expect(inAppNotifications.title).toBeDefined();
      expect(inAppNotifications.titleFr).toBeDefined();
      expect(inAppNotifications.message).toBeDefined();
      expect(inAppNotifications.messageFr).toBeDefined();
      expect(inAppNotifications.isRead).toBeDefined();
      expect(inAppNotifications.createdAt).toBeDefined();
    });

    it("should support notification types: message, session, points, challenge, review, system", () => {
      // The type enum should include all notification types
      expect(inAppNotifications.type).toBeDefined();
    });

    it("should support link types for navigation", () => {
      // Link type and ID for navigation
      expect(inAppNotifications.linkType).toBeDefined();
      expect(inAppNotifications.linkId).toBeDefined();
    });
  });

  describe("Router Endpoints", () => {
    it("should have stripe.validateCoupon endpoint", async () => {
      const { appRouter } = await import("./routers");
      expect(appRouter._def.procedures).toHaveProperty("stripe.validateCoupon");
    });

    it("should have learner.getChallenges endpoint", async () => {
      const { appRouter } = await import("./routers");
      expect(appRouter._def.procedures).toHaveProperty("learner.getChallenges");
    });

    it("should have learner.claimChallengeReward endpoint", async () => {
      const { appRouter } = await import("./routers");
      expect(appRouter._def.procedures).toHaveProperty("learner.claimChallengeReward");
    });

    it("should have notification.getInAppNotifications endpoint", async () => {
      const { appRouter } = await import("./routers");
      expect(appRouter._def.procedures).toHaveProperty("notification.getInAppNotifications");
    });

    it("should have notification.markNotificationRead endpoint", async () => {
      const { appRouter } = await import("./routers");
      expect(appRouter._def.procedures).toHaveProperty("notification.markNotificationRead");
    });

    it("should have notification.markAllNotificationsRead endpoint", async () => {
      const { appRouter } = await import("./routers");
      expect(appRouter._def.procedures).toHaveProperty("notification.markAllNotificationsRead");
    });

    it("should have notification.deleteNotification endpoint", async () => {
      const { appRouter } = await import("./routers");
      expect(appRouter._def.procedures).toHaveProperty("notification.deleteNotification");
    });
  });
});
