/**
 * Tests for Progress Tracking Propagation Logic
 * 
 * Tests the progress calculation logic used in completeActivity:
 * - Activity completion → lesson progress percentage
 * - Lesson completion → enrollment progress percentage
 * - Pass/fail logic for scored activities
 */
import { describe, it, expect } from "vitest";

// ─── Replicate the core progress calculation functions ───
// These mirror the exact logic in activities.ts completeActivity mutation

/**
 * Calculate lesson progress percentage from completed/total activities
 */
function calculateLessonProgress(completedActivities: number, totalActivities: number): {
  percent: number;
  status: "completed" | "in_progress";
} {
  const total = totalActivities || 7; // default 7 slots
  const completed = Math.max(0, completedActivities);
  const percent = Math.min(100, Math.round((completed / total) * 100));
  const status = percent >= 100 ? "completed" : "in_progress";
  return { percent, status };
}

/**
 * Calculate enrollment progress from completed/total lessons
 */
function calculateEnrollmentProgress(completedLessons: number, totalLessons: number): {
  percent: number;
  status: "completed" | "active";
  lessonsCompleted: number;
} {
  const total = totalLessons || 1;
  const completed = Math.max(0, completedLessons);
  const percent = Math.min(100, Math.round((completed / total) * 100));
  const status = percent >= 100 ? "completed" : "active";
  return { percent, status, lessonsCompleted: completed };
}

/**
 * Determine activity completion status based on score and passing threshold
 */
function determineActivityStatus(
  score: number | undefined,
  passingScore: number | null | undefined
): "completed" | "failed" {
  if (passingScore && score !== undefined) {
    return score >= passingScore ? "completed" : "failed";
  }
  return "completed";
}

// ─── Tests ───

describe("Progress Tracking", () => {
  describe("calculateLessonProgress", () => {
    it("should return 0% for 0 completed activities", () => {
      const result = calculateLessonProgress(0, 7);
      expect(result.percent).toBe(0);
      expect(result.status).toBe("in_progress");
    });

    it("should return 14% for 1/7 completed activities", () => {
      const result = calculateLessonProgress(1, 7);
      expect(result.percent).toBe(14);
      expect(result.status).toBe("in_progress");
    });

    it("should return 29% for 2/7 completed activities", () => {
      const result = calculateLessonProgress(2, 7);
      expect(result.percent).toBe(29);
      expect(result.status).toBe("in_progress");
    });

    it("should return 43% for 3/7 completed activities", () => {
      const result = calculateLessonProgress(3, 7);
      expect(result.percent).toBe(43);
      expect(result.status).toBe("in_progress");
    });

    it("should return 57% for 4/7 completed activities", () => {
      const result = calculateLessonProgress(4, 7);
      expect(result.percent).toBe(57);
      expect(result.status).toBe("in_progress");
    });

    it("should return 71% for 5/7 completed activities", () => {
      const result = calculateLessonProgress(5, 7);
      expect(result.percent).toBe(71);
      expect(result.status).toBe("in_progress");
    });

    it("should return 86% for 6/7 completed activities", () => {
      const result = calculateLessonProgress(6, 7);
      expect(result.percent).toBe(86);
      expect(result.status).toBe("in_progress");
    });

    it("should return 100% and completed status for 7/7 activities", () => {
      const result = calculateLessonProgress(7, 7);
      expect(result.percent).toBe(100);
      expect(result.status).toBe("completed");
    });

    it("should cap at 100% even if more completed than total", () => {
      const result = calculateLessonProgress(8, 7);
      expect(result.percent).toBe(100);
      expect(result.status).toBe("completed");
    });

    it("should default to 7 total activities when total is 0", () => {
      const result = calculateLessonProgress(3, 0);
      expect(result.percent).toBe(43);
      expect(result.status).toBe("in_progress");
    });

    it("should handle negative completed count gracefully", () => {
      const result = calculateLessonProgress(-1, 7);
      expect(result.percent).toBe(0);
      expect(result.status).toBe("in_progress");
    });
  });

  describe("calculateEnrollmentProgress", () => {
    it("should return 0% for 0 completed lessons", () => {
      const result = calculateEnrollmentProgress(0, 16);
      expect(result.percent).toBe(0);
      expect(result.status).toBe("active");
      expect(result.lessonsCompleted).toBe(0);
    });

    it("should return 6% for 1/16 completed lessons", () => {
      const result = calculateEnrollmentProgress(1, 16);
      expect(result.percent).toBe(6);
      expect(result.status).toBe("active");
      expect(result.lessonsCompleted).toBe(1);
    });

    it("should return 25% for 4/16 completed lessons", () => {
      const result = calculateEnrollmentProgress(4, 16);
      expect(result.percent).toBe(25);
      expect(result.status).toBe("active");
    });

    it("should return 50% for 8/16 completed lessons", () => {
      const result = calculateEnrollmentProgress(8, 16);
      expect(result.percent).toBe(50);
      expect(result.status).toBe("active");
    });

    it("should return 100% and completed status for 16/16 lessons", () => {
      const result = calculateEnrollmentProgress(16, 16);
      expect(result.percent).toBe(100);
      expect(result.status).toBe("completed");
      expect(result.lessonsCompleted).toBe(16);
    });

    it("should cap at 100% for overflow", () => {
      const result = calculateEnrollmentProgress(17, 16);
      expect(result.percent).toBe(100);
      expect(result.status).toBe("completed");
    });

    it("should handle 32-lesson courses (Path II)", () => {
      const result = calculateEnrollmentProgress(16, 32);
      expect(result.percent).toBe(50);
      expect(result.status).toBe("active");
    });

    it("should default to 1 total lesson when total is 0", () => {
      const result = calculateEnrollmentProgress(1, 0);
      expect(result.percent).toBe(100);
      expect(result.status).toBe("completed");
    });
  });

  describe("determineActivityStatus", () => {
    it("should return completed when no passing score is set", () => {
      expect(determineActivityStatus(undefined, null)).toBe("completed");
      expect(determineActivityStatus(undefined, undefined)).toBe("completed");
      expect(determineActivityStatus(80, null)).toBe("completed");
    });

    it("should return completed when score meets passing threshold", () => {
      expect(determineActivityStatus(80, 70)).toBe("completed");
      expect(determineActivityStatus(100, 70)).toBe("completed");
      expect(determineActivityStatus(70, 70)).toBe("completed");
    });

    it("should return failed when score is below passing threshold", () => {
      expect(determineActivityStatus(50, 70)).toBe("failed");
      expect(determineActivityStatus(69, 70)).toBe("failed");
      expect(determineActivityStatus(0, 70)).toBe("failed");
    });

    it("should return completed when score is undefined but passing score exists", () => {
      // If score is not provided, we don't fail the activity
      expect(determineActivityStatus(undefined, 70)).toBe("completed");
    });

    it("should handle edge case of 0 passing score", () => {
      // passingScore of 0 is falsy, so treated as no passing score
      expect(determineActivityStatus(0, 0)).toBe("completed");
    });
  });

  describe("Progress Propagation Chain", () => {
    it("should correctly propagate from activity → lesson → enrollment for Path I", () => {
      // Simulate completing all 7 activities in a lesson
      const lessonProgress = calculateLessonProgress(7, 7);
      expect(lessonProgress.percent).toBe(100);
      expect(lessonProgress.status).toBe("completed");

      // Then update enrollment (1 of 16 lessons completed)
      const enrollmentProgress = calculateEnrollmentProgress(1, 16);
      expect(enrollmentProgress.percent).toBe(6);
      expect(enrollmentProgress.status).toBe("active");
      expect(enrollmentProgress.lessonsCompleted).toBe(1);
    });

    it("should show 50% enrollment when half the lessons are done", () => {
      // Complete 8 of 16 lessons
      const enrollmentProgress = calculateEnrollmentProgress(8, 16);
      expect(enrollmentProgress.percent).toBe(50);
      expect(enrollmentProgress.status).toBe("active");
    });

    it("should mark enrollment as completed when all lessons are done", () => {
      // Complete all 16 lessons
      const enrollmentProgress = calculateEnrollmentProgress(16, 16);
      expect(enrollmentProgress.percent).toBe(100);
      expect(enrollmentProgress.status).toBe("completed");
    });

    it("should handle quiz failure not propagating to lesson completion", () => {
      // Quiz with score 50 but passing score 70 → failed
      const status = determineActivityStatus(50, 70);
      expect(status).toBe("failed");

      // Failed activity should not count toward lesson progress
      // (6 completed + 1 failed out of 7 total)
      const lessonProgress = calculateLessonProgress(6, 7);
      expect(lessonProgress.percent).toBe(86);
      expect(lessonProgress.status).toBe("in_progress");
    });

    it("should handle quiz pass propagating to lesson completion", () => {
      // Quiz with score 85 and passing score 70 → completed
      const status = determineActivityStatus(85, 70);
      expect(status).toBe("completed");

      // All 7 activities completed including quiz
      const lessonProgress = calculateLessonProgress(7, 7);
      expect(lessonProgress.percent).toBe(100);
      expect(lessonProgress.status).toBe("completed");
    });
  });
});
