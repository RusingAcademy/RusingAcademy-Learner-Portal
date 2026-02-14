import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";

describe("Loyalty, Coupons & Referrals Features", () => {
  describe("Database Schema", () => {
    it("should have promoCoupons table with required columns", async () => {
      const { promoCoupons } = await import("../drizzle/schema");
      expect(promoCoupons).toBeDefined();
      
      // Check required columns exist
      const columns = Object.keys(promoCoupons);
      expect(columns).toContain("id");
      expect(columns).toContain("code");
      expect(columns).toContain("discountType");
      expect(columns).toContain("discountValue");
      expect(columns).toContain("isActive");
    });

    it("should have couponRedemptions table with required columns", async () => {
      const { couponRedemptions } = await import("../drizzle/schema");
      expect(couponRedemptions).toBeDefined();
      
      const columns = Object.keys(couponRedemptions);
      expect(columns).toContain("id");
      expect(columns).toContain("couponId");
      expect(columns).toContain("userId");
    });

    it("should have referralInvitations table with required columns", async () => {
      const { referralInvitations } = await import("../drizzle/schema");
      expect(referralInvitations).toBeDefined();
      
      const columns = Object.keys(referralInvitations);
      expect(columns).toContain("id");
      expect(columns).toContain("referrerId");
      expect(columns).toContain("inviteeEmail");
      expect(columns).toContain("status");
    });
  });

  describe("Admin Router - Coupon Endpoints", () => {
    it("should have getCoupons procedure in admin router", () => {
      expect(appRouter._def.procedures).toHaveProperty("admin.getCoupons");
    });

    it("should have createCoupon procedure in admin router", () => {
      expect(appRouter._def.procedures).toHaveProperty("admin.createCoupon");
    });

    it("should have updateCoupon procedure in admin router", () => {
      expect(appRouter._def.procedures).toHaveProperty("admin.updateCoupon");
    });

    it("should have deleteCoupon procedure in admin router", () => {
      expect(appRouter._def.procedures).toHaveProperty("admin.deleteCoupon");
    });

    it("should have toggleCoupon procedure in admin router", () => {
      expect(appRouter._def.procedures).toHaveProperty("admin.toggleCoupon");
    });
  });

  describe("Learner Router - Referral Endpoints", () => {
    it("should have getReferralStats procedure in learner router", () => {
      expect(appRouter._def.procedures).toHaveProperty("learner.getReferralStats");
    });

    it("should have getReferralInvitations procedure in learner router", () => {
      expect(appRouter._def.procedures).toHaveProperty("learner.getReferralInvitations");
    });

    it("should have sendReferralInvite procedure in learner router", () => {
      expect(appRouter._def.procedures).toHaveProperty("learner.sendReferralInvite");
    });
  });

  describe("Email Templates", () => {
    it("should have sendPointsEarnedNotification function", async () => {
      const { sendPointsEarnedNotification } = await import("./email");
      expect(sendPointsEarnedNotification).toBeDefined();
      expect(typeof sendPointsEarnedNotification).toBe("function");
    });

    it("should have sendTierUpgradeNotification function", async () => {
      const { sendTierUpgradeNotification } = await import("./email");
      expect(sendTierUpgradeNotification).toBeDefined();
      expect(typeof sendTierUpgradeNotification).toBe("function");
    });

    it("should have sendReferralInviteEmail function", async () => {
      const { sendReferralInviteEmail } = await import("./email");
      expect(sendReferralInviteEmail).toBeDefined();
      expect(typeof sendReferralInviteEmail).toBe("function");
    });
  });
});
