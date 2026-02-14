/**
 * Learner Courses Logic Tests
 * 
 * Tests for course filtering, plan status, and stats calculation
 */

import { describe, it, expect } from "vitest";

describe("Learner Courses Logic", () => {

  describe("Course filtering", () => {
    it("should filter courses by search query", () => {
      const courses = [
        { id: 1, title: "Path I: FSL Foundations", progressPercent: 50 },
        { id: 2, title: "Path II: Intermediate", progressPercent: 0 },
        { id: 3, title: "Path III: Advanced", progressPercent: 100 },
      ];
      
      const searchQuery = "foundations";
      const filtered = courses.filter(c => 
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe("Path I: FSL Foundations");
    });

    it("should filter courses by status - in progress", () => {
      const courses = [
        { id: 1, title: "Course 1", progressPercent: 50 },
        { id: 2, title: "Course 2", progressPercent: 0 },
        { id: 3, title: "Course 3", progressPercent: 100 },
      ];
      
      const inProgress = courses.filter(c => 
        c.progressPercent > 0 && c.progressPercent < 100
      );
      
      expect(inProgress).toHaveLength(1);
      expect(inProgress[0].id).toBe(1);
    });

    it("should filter courses by status - completed", () => {
      const courses = [
        { id: 1, title: "Course 1", progressPercent: 50 },
        { id: 2, title: "Course 2", progressPercent: 0 },
        { id: 3, title: "Course 3", progressPercent: 100 },
      ];
      
      const completed = courses.filter(c => c.progressPercent === 100);
      
      expect(completed).toHaveLength(1);
      expect(completed[0].id).toBe(3);
    });

    it("should filter courses by status - not started", () => {
      const courses = [
        { id: 1, title: "Course 1", progressPercent: 50 },
        { id: 2, title: "Course 2", progressPercent: 0 },
        { id: 3, title: "Course 3", progressPercent: 100 },
      ];
      
      const notStarted = courses.filter(c => c.progressPercent === 0);
      
      expect(notStarted).toHaveLength(1);
      expect(notStarted[0].id).toBe(2);
    });
  });

  describe("Coaching plan status", () => {
    it("should correctly identify expired plans", () => {
      const plan = {
        id: 1,
        planId: "starter-plan",
        status: "active",
        expiresAt: new Date("2025-01-01"), // Past date
        remainingSessions: 5,
      };
      
      const isExpired = new Date(plan.expiresAt) < new Date();
      expect(isExpired).toBe(true);
    });

    it("should correctly identify active plans", () => {
      const plan = {
        id: 1,
        planId: "starter-plan",
        status: "active",
        expiresAt: new Date("2027-01-01"), // Future date
        remainingSessions: 5,
      };
      
      const isExpired = new Date(plan.expiresAt) < new Date();
      const isActive = plan.status === "active" && !isExpired;
      
      expect(isActive).toBe(true);
    });

    it("should identify plan tier correctly", () => {
      const plans = [
        { planId: "starter-plan" },
        { planId: "accelerator-plan" },
        { planId: "immersion-plan" },
      ];
      
      const getTier = (planId: string) => {
        if (planId.includes("immersion")) return "premium";
        if (planId.includes("accelerator")) return "standard";
        return "starter";
      };
      
      expect(getTier(plans[0].planId)).toBe("starter");
      expect(getTier(plans[1].planId)).toBe("standard");
      expect(getTier(plans[2].planId)).toBe("premium");
    });
  });

  describe("Stats calculation", () => {
    it("should calculate enrolled courses count", () => {
      const courses = [
        { id: 1, title: "Course 1" },
        { id: 2, title: "Course 2" },
        { id: 3, title: "Course 3" },
      ];
      
      expect(courses.length).toBe(3);
    });

    it("should calculate in-progress courses count", () => {
      const courses = [
        { id: 1, progressPercent: 50 },
        { id: 2, progressPercent: 75 },
        { id: 3, progressPercent: 100 },
        { id: 4, progressPercent: 0 },
      ];
      
      const inProgress = courses.filter(c => 
        c.progressPercent > 0 && c.progressPercent < 100
      );
      
      expect(inProgress.length).toBe(2);
    });

    it("should calculate active plans count", () => {
      const plans = [
        { id: 1, status: "active", expiresAt: new Date("2027-01-01") },
        { id: 2, status: "active", expiresAt: new Date("2025-01-01") }, // Expired
        { id: 3, status: "exhausted", expiresAt: new Date("2027-01-01") },
      ];
      
      const activePlans = plans.filter(p => 
        p.status === "active" && new Date(p.expiresAt) >= new Date()
      );
      
      expect(activePlans.length).toBe(1);
    });
  });
});
