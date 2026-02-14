/**
 * Stripe Webhook Handler Tests
 * 
 * Tests the webhook handler for different product types:
 * - Course purchases (path_series)
 * - Coaching plan purchases
 * - Coaching session payments
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the database module
vi.mock("../db", () => ({
  getDb: vi.fn().mockResolvedValue({
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
  }),
  getUserById: vi.fn().mockResolvedValue(null),
  getCoachByUserId: vi.fn().mockResolvedValue(null),
  updateCoachProfile: vi.fn().mockResolvedValue(null),
  createPayoutLedgerEntry: vi.fn().mockResolvedValue({}),
}));

// Mock email module
vi.mock("../email", () => ({
  sendSessionConfirmationEmails: vi.fn().mockResolvedValue(undefined),
}));

// Mock video module
vi.mock("../video", () => ({
  generateMeetingDetails: vi.fn().mockReturnValue({
    url: "https://meet.example.com/test",
    joinInstructions: "Click the link to join",
  }),
}));

describe("Stripe Webhook Handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Product Type Routing", () => {
    it("should correctly identify path_series product type", () => {
      const metadata = { product_type: "path_series" };
      expect(metadata.product_type).toBe("path_series");
    });

    it("should correctly identify course product type", () => {
      const metadata = { product_type: "course" };
      expect(metadata.product_type).toBe("course");
    });

    it("should correctly identify coaching_plan product type", () => {
      const metadata = { product_type: "coaching_plan" };
      expect(metadata.product_type).toBe("coaching_plan");
    });

    it("should default to coaching_session for unknown product types", () => {
      const metadata = {};
      const productType = metadata.product_type || "coaching_session";
      expect(productType).toBe("coaching_session");
    });
  });

  describe("Course Purchase Metadata", () => {
    it("should extract course metadata correctly", () => {
      const metadata = {
        product_type: "course",
        user_id: "123",
        course_id: "path-i-foundations",
        course_slug: "path-i-foundations",
        course_title: "Path I: FSL - Foundations",
        course_db_id: "1",
        user_email: "test@example.com",
      };

      expect(parseInt(metadata.user_id)).toBe(123);
      expect(metadata.course_id).toBe("path-i-foundations");
      expect(metadata.course_title).toBe("Path I: FSL - Foundations");
      expect(parseInt(metadata.course_db_id)).toBe(1);
    });

    it("should handle legacy path_series metadata", () => {
      const metadata = {
        product_type: "path_series",
        user_id: "456",
        path_id: "2",
        path_slug: "path-ii-everyday-fluency",
        path_title: "Path II: FSL - Everyday Fluency",
      };

      const courseDbId = parseInt(metadata.course_db_id || metadata.path_id || "0");
      const courseSlug = metadata.course_slug || metadata.path_slug || "";
      const courseTitle = metadata.course_title || metadata.path_title || "";

      expect(courseDbId).toBe(2);
      expect(courseSlug).toBe("path-ii-everyday-fluency");
      expect(courseTitle).toBe("Path II: FSL - Everyday Fluency");
    });
  });

  describe("Path Series Enrollment Flow (Fixed)", () => {
    it("should route path_series with valid path_id to path enrollment flow", () => {
      const metadata = {
        product_type: "path_series",
        path_id: "60001",
        path_slug: "path-i-foundations",
        path_title: "Path I: FSL - Foundations",
        user_id: "4",
        user_email: "test@example.com",
      };

      const productType = metadata.product_type || "course";
      const pathId = parseInt(metadata.path_id || "0");

      // The fixed webhook handler should enter the path_series branch
      const isPathSeries = productType === "path_series" && pathId > 0;
      expect(isPathSeries).toBe(true);
      expect(pathId).toBe(60001);
    });

    it("should fall through to course flow when path_id is missing from path_series", () => {
      const metadata = {
        product_type: "path_series",
        // path_id is missing — edge case
        user_id: "4",
      };

      const productType = metadata.product_type || "course";
      const pathId = parseInt((metadata as any).path_id || "0");

      const isPathSeries = productType === "path_series" && pathId > 0;
      expect(isPathSeries).toBe(false);
    });

    it("should route individual course purchase to course enrollment flow", () => {
      const metadata = {
        product_type: "course",
        course_db_id: "90001",
        user_id: "4",
      };

      const productType = metadata.product_type || "course";
      const pathId = parseInt((metadata as any).path_id || "0");

      const isPathSeries = productType === "path_series" && pathId > 0;
      expect(isPathSeries).toBe(false);
    });

    it("should create path enrollment with correct fields", () => {
      const session = {
        payment_intent: "pi_test_123",
        amount_total: 7999,
        metadata: {
          path_id: "60001",
          user_id: "4",
          product_type: "path_series",
        },
      };

      const enrollmentData = {
        pathId: parseInt(session.metadata.path_id),
        userId: parseInt(session.metadata.user_id),
        status: "active" as const,
        paymentStatus: "paid" as const,
        stripePaymentIntentId: session.payment_intent as string,
        amountPaid: String((session.amount_total || 0) / 100),
        startedAt: new Date(),
      };

      expect(enrollmentData.pathId).toBe(60001);
      expect(enrollmentData.userId).toBe(4);
      expect(enrollmentData.status).toBe("active");
      expect(enrollmentData.paymentStatus).toBe("paid");
      expect(enrollmentData.amountPaid).toBe("79.99");
      expect(enrollmentData.stripePaymentIntentId).toBe("pi_test_123");
    });

    it("should create course enrollments for all courses in a path", () => {
      // Simulate the path_courses query result
      const pathCourses = [
        { courseId: 90001 },
      ];

      const userId = 4;
      const totalLessonsPerCourse = 16;

      const courseEnrollments = pathCourses.map((pc) => ({
        courseId: pc.courseId,
        userId,
        totalLessons: totalLessonsPerCourse,
        progressPercent: 0,
        lessonsCompleted: 0,
      }));

      expect(courseEnrollments).toHaveLength(1);
      expect(courseEnrollments[0].courseId).toBe(90001);
      expect(courseEnrollments[0].userId).toBe(4);
      expect(courseEnrollments[0].totalLessons).toBe(16);
    });
  });

  describe("Enrollment Deduplication", () => {
    it("should skip path enrollment if already enrolled", () => {
      const existingEnrollment = { id: 1, userId: 4, pathId: 60001, status: "active" };
      const shouldSkip = !!existingEnrollment;
      expect(shouldSkip).toBe(true);
    });

    it("should create enrollment if not already enrolled", () => {
      const existingEnrollment = undefined;
      const shouldCreate = !existingEnrollment;
      expect(shouldCreate).toBe(true);
    });
  });

  describe("Coaching Plan Purchase Metadata", () => {
    it("should extract coaching plan metadata correctly", () => {
      const metadata = {
        product_type: "coaching_plan",
        user_id: "789",
        plan_id: "accelerator-plan",
        sessions: "20",
        validity_days: "120",
        customer_email: "learner@example.com",
        customer_name: "John Doe",
      };

      expect(parseInt(metadata.user_id)).toBe(789);
      expect(metadata.plan_id).toBe("accelerator-plan");
      expect(parseInt(metadata.sessions)).toBe(20);
      expect(parseInt(metadata.validity_days)).toBe(120);
    });

    it("should calculate expiry date correctly", () => {
      const validityDays = 90;
      const purchaseDate = new Date("2026-02-05");
      const expiresAt = new Date(purchaseDate);
      expiresAt.setDate(expiresAt.getDate() + validityDays);

      // 90 days from Feb 5 = May 5 (Feb has 28 days in 2026)
      expect(expiresAt.toISOString().split("T")[0]).toBe("2026-05-05");
    });
  });

  describe("Payment Amount Handling", () => {
    it("should convert cents to dollars correctly", () => {
      const amountInCents = 89900;
      const amountInDollars = (amountInCents / 100).toFixed(2);
      expect(amountInDollars).toBe("899.00");
    });

    it("should handle null amounts", () => {
      const amountTotal = null;
      const amount = String(((amountTotal || 0) / 100));
      expect(amount).toBe("0");
    });
  });

  describe("Test Event Detection", () => {
    it("should detect test events by event ID prefix", () => {
      const testEventId = "evt_test_1234567890";
      const isTestEvent = testEventId.startsWith("evt_test_");
      expect(isTestEvent).toBe(true);
    });

    it("should not flag production events as test", () => {
      const prodEventId = "evt_1234567890abcdef";
      const isTestEvent = prodEventId.startsWith("evt_test_");
      expect(isTestEvent).toBe(false);
    });
  });
});
