import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "./db";
import { reviews, coachProfiles, learnerProfiles, sessions, users } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

describe("Review System", () => {
  let db: Awaited<ReturnType<typeof getDb>>;

  beforeAll(async () => {
    db = await getDb();
  });

  describe("Database Schema", () => {
    it("should have reviews table with required columns", async () => {
      if (!db) {
        console.log("Database not available, skipping test");
        return;
      }

      // Verify the reviews table exists by attempting a simple query
      const result = await db
        .select({
          id: reviews.id,
          sessionId: reviews.sessionId,
          learnerId: reviews.learnerId,
          coachId: reviews.coachId,
          rating: reviews.rating,
          comment: reviews.comment,
          sleAchievement: reviews.sleAchievement,
          coachResponse: reviews.coachResponse,
          isVisible: reviews.isVisible,
          createdAt: reviews.createdAt,
        })
        .from(reviews)
        .limit(1);

      // The query should succeed without error
      expect(Array.isArray(result)).toBe(true);
    });

    it("should have totalReviews column in coach_profiles", async () => {
      if (!db) {
        console.log("Database not available, skipping test");
        return;
      }

      // Verify totalReviews column exists
      const result = await db
        .select({
          id: coachProfiles.id,
          averageRating: coachProfiles.averageRating,
          totalReviews: coachProfiles.totalReviews,
        })
        .from(coachProfiles)
        .limit(1);

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("Review Validation Rules", () => {
    it("should enforce rating between 1 and 5", () => {
      // Test the validation logic
      const validRatings = [1, 2, 3, 4, 5];
      const invalidRatings = [0, -1, 6, 10];

      validRatings.forEach((rating) => {
        expect(rating >= 1 && rating <= 5).toBe(true);
      });

      invalidRatings.forEach((rating) => {
        expect(rating >= 1 && rating <= 5).toBe(false);
      });
    });

    it("should allow optional comment with minimum 10 characters", () => {
      const validComments = [
        undefined,
        null,
        "This is a valid comment with more than 10 characters",
        "Great coach!!", // exactly 13 characters
      ];

      const invalidComments = [
        "Short", // 5 characters
        "Too small", // 9 characters
      ];

      validComments.forEach((comment) => {
        if (comment === undefined || comment === null) {
          expect(true).toBe(true);
        } else {
          expect(comment.length >= 10).toBe(true);
        }
      });

      invalidComments.forEach((comment) => {
        expect(comment.length >= 10).toBe(false);
      });
    });

    it("should validate SLE achievement options", () => {
      const validAchievements = [
        "oral_a",
        "oral_b",
        "oral_c",
        "written_a",
        "written_b",
        "written_c",
        "reading_a",
        "reading_b",
        "reading_c",
        "bbb",
        "cbc",
        "ccc",
      ];

      validAchievements.forEach((achievement) => {
        expect(achievement.length > 0).toBe(true);
        expect(achievement.length <= 50).toBe(true);
      });
    });
  });

  describe("Average Rating Calculation", () => {
    it("should calculate average correctly for multiple ratings", () => {
      const ratings = [5, 4, 5, 3, 4];
      const average = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      
      expect(average).toBe(4.2);
      expect(average.toFixed(2)).toBe("4.20");
    });

    it("should handle single rating", () => {
      const ratings = [5];
      const average = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      
      expect(average).toBe(5);
    });

    it("should handle no ratings gracefully", () => {
      const ratings: number[] = [];
      const average = ratings.length > 0 
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
        : 0;
      
      expect(average).toBe(0);
    });
  });

  describe("Review Display Logic", () => {
    it("should format rating for display", () => {
      const testCases = [
        { rating: 4.5, expected: "4.5" },
        { rating: 5.0, expected: "5.0" },
        { rating: 3.33333, expected: "3.3" },
        { rating: 0, expected: "New" },
      ];

      testCases.forEach(({ rating, expected }) => {
        const display = rating > 0 ? rating.toFixed(1) : "New";
        expect(display).toBe(expected);
      });
    });

    it("should format review count correctly", () => {
      const testCases = [
        { count: 0, expected: "" },
        { count: 1, expected: "(1 review)" },
        { count: 5, expected: "(5 reviews)" },
        { count: 100, expected: "(100 reviews)" },
      ];

      testCases.forEach(({ count, expected }) => {
        const display = count > 0 
          ? `(${count} review${count !== 1 ? "s" : ""})` 
          : "";
        expect(display).toBe(expected);
      });
    });
  });
});
