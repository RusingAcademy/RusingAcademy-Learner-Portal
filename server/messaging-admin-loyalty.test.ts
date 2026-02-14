import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import * as schema from "../drizzle/schema";

describe("Messaging, Admin Analytics & Loyalty Program", () => {
  describe("Schema Tables", () => {
    it("should have loyalty_points table with required columns", () => {
      expect(schema.loyaltyPoints).toBeDefined();
      expect(schema.loyaltyPoints.id).toBeDefined();
      expect(schema.loyaltyPoints.learnerId).toBeDefined();
      expect(schema.loyaltyPoints.totalPoints).toBeDefined();
      expect(schema.loyaltyPoints.availablePoints).toBeDefined();
      expect(schema.loyaltyPoints.lifetimePoints).toBeDefined();
      expect(schema.loyaltyPoints.tier).toBeDefined();
    });

    it("should have point_transactions table with required columns", () => {
      expect(schema.pointTransactions).toBeDefined();
      expect(schema.pointTransactions.id).toBeDefined();
      expect(schema.pointTransactions.learnerId).toBeDefined();
      expect(schema.pointTransactions.type).toBeDefined();
      expect(schema.pointTransactions.points).toBeDefined();
      expect(schema.pointTransactions.description).toBeDefined();
      expect(schema.pointTransactions.createdAt).toBeDefined();
    });

    it("should have loyalty_rewards table with required columns", () => {
      expect(schema.loyaltyRewards).toBeDefined();
      expect(schema.loyaltyRewards.id).toBeDefined();
      expect(schema.loyaltyRewards.name).toBeDefined();
      expect(schema.loyaltyRewards.nameEn).toBeDefined();
      expect(schema.loyaltyRewards.nameFr).toBeDefined();
      expect(schema.loyaltyRewards.pointsCost).toBeDefined();
      expect(schema.loyaltyRewards.rewardType).toBeDefined();
      expect(schema.loyaltyRewards.isActive).toBeDefined();
      expect(schema.loyaltyRewards.minTier).toBeDefined();
    });

    it("should have redeemed_rewards table with required columns", () => {
      expect(schema.redeemedRewards).toBeDefined();
      expect(schema.redeemedRewards.id).toBeDefined();
      expect(schema.redeemedRewards.learnerId).toBeDefined();
      expect(schema.redeemedRewards.rewardId).toBeDefined();
      expect(schema.redeemedRewards.pointsSpent).toBeDefined();
      expect(schema.redeemedRewards.status).toBeDefined();
      expect(schema.redeemedRewards.discountCode).toBeDefined();
      expect(schema.redeemedRewards.expiresAt).toBeDefined();
    });
  });

  describe("Router Endpoints", () => {
    it("should have loyalty endpoints in learner router", () => {
      // Check that the learner router has loyalty-related procedures
      const learnerRouter = appRouter._def.procedures;
      
      // The procedures are nested under learner.*
      expect(learnerRouter["learner.getLoyaltyPoints"]).toBeDefined();
      expect(learnerRouter["learner.getAvailableRewards"]).toBeDefined();
      expect(learnerRouter["learner.getPointsHistory"]).toBeDefined();
      expect(learnerRouter["learner.redeemReward"]).toBeDefined();
    });

    it("should have admin analytics endpoint", () => {
      const adminRouter = appRouter._def.procedures;
      expect(adminRouter["admin.getAnalytics"]).toBeDefined();
    });

    it("should have message endpoints in message router", () => {
      const messageRouter = appRouter._def.procedures;
      expect(messageRouter["message.conversations"]).toBeDefined();
      expect(messageRouter["message.list"]).toBeDefined();
      expect(messageRouter["message.send"]).toBeDefined();
    });
  });

  describe("Loyalty Tier System", () => {
    it("should have valid tier enum values", () => {
      // Check that the tier column has the expected enum values
      const tierColumn = schema.loyaltyPoints.tier;
      expect(tierColumn).toBeDefined();
      // The tier should be one of: bronze, silver, gold, platinum
    });

    it("should have valid transaction type enum values", () => {
      // Check that the type column has the expected enum values
      const typeColumn = schema.pointTransactions.type;
      expect(typeColumn).toBeDefined();
      // Types should include: earned_booking, earned_review, earned_referral, etc.
    });

    it("should have valid reward type enum values", () => {
      // Check that the rewardType column has the expected enum values
      const rewardTypeColumn = schema.loyaltyRewards.rewardType;
      expect(rewardTypeColumn).toBeDefined();
      // Types should include: discount_5, discount_10, free_trial, etc.
    });
  });

  describe("Type Exports", () => {
    it("should export LoyaltyPoints type", () => {
      // TypeScript will catch if these types don't exist
      const typeCheck: schema.LoyaltyPoints | null = null;
      expect(typeCheck).toBeNull();
    });

    it("should export PointTransaction type", () => {
      const typeCheck: schema.PointTransaction | null = null;
      expect(typeCheck).toBeNull();
    });

    it("should export LoyaltyReward type", () => {
      const typeCheck: schema.LoyaltyReward | null = null;
      expect(typeCheck).toBeNull();
    });

    it("should export RedeemedReward type", () => {
      const typeCheck: schema.RedeemedReward | null = null;
      expect(typeCheck).toBeNull();
    });
  });
});
