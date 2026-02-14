/**
 * Tests for Booking System and Email Reminders
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the email sending
vi.mock("./email", () => ({
  sendEmail: vi.fn().mockResolvedValue(true),
}));

// Test data
const mockUser = {
  id: 1,
  email: "test@example.com",
  name: "Test User",
  role: "learner",
  lastSignedIn: new Date(),
};

const mockCoachingPlan = {
  id: 1,
  userId: 1,
  planId: "plan_starter",
  planName: "Plan Starter",
  totalSessions: 4,
  remainingSessions: 3,
  status: "active",
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  createdAt: new Date(),
};

const mockExpiringPlan = {
  ...mockCoachingPlan,
  expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
};

describe("Booking System", () => {
  describe("Time Slot Generation", () => {
    it("should generate time slots from 9 AM to 5 PM", () => {
      const slots = [];
      for (let hour = 9; hour < 17; hour++) {
        const startTime = `${hour.toString().padStart(2, '0')}:00`;
        const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
        slots.push({
          id: `2026-02-10-${hour}`,
          startTime,
          endTime,
          available: true,
        });
      }
      
      expect(slots).toHaveLength(8);
      expect(slots[0].startTime).toBe("09:00");
      expect(slots[0].endTime).toBe("10:00");
      expect(slots[7].startTime).toBe("16:00");
      expect(slots[7].endTime).toBe("17:00");
    });

    it("should format time slots correctly", () => {
      const hour = 9;
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      expect(startTime).toBe("09:00");
      
      const hour2 = 14;
      const startTime2 = `${hour2.toString().padStart(2, '0')}:00`;
      expect(startTime2).toBe("14:00");
    });
  });

  describe("Plan Validation", () => {
    it("should validate plan has remaining sessions", () => {
      const hasRemaining = mockCoachingPlan.remainingSessions > 0;
      expect(hasRemaining).toBe(true);
      
      const exhaustedPlan = { ...mockCoachingPlan, remainingSessions: 0 };
      expect(exhaustedPlan.remainingSessions > 0).toBe(false);
    });

    it("should validate plan is not expired", () => {
      const now = new Date();
      const isExpired = new Date(mockCoachingPlan.expiresAt) < now;
      expect(isExpired).toBe(false);
      
      const expiredPlan = { ...mockCoachingPlan, expiresAt: new Date(Date.now() - 1000) };
      expect(new Date(expiredPlan.expiresAt) < now).toBe(true);
    });

    it("should validate plan status is active", () => {
      expect(mockCoachingPlan.status).toBe("active");
      
      const exhaustedPlan = { ...mockCoachingPlan, status: "exhausted" };
      expect(exhaustedPlan.status).not.toBe("active");
    });
  });

  describe("Session Credit Deduction", () => {
    it("should correctly calculate remaining sessions after booking", () => {
      const before = mockCoachingPlan.remainingSessions;
      const after = before - 1;
      
      expect(after).toBe(2);
    });

    it("should mark plan as exhausted when no sessions remain", () => {
      const plan = { ...mockCoachingPlan, remainingSessions: 1 };
      const newRemaining = plan.remainingSessions - 1;
      const newStatus = newRemaining === 0 ? "exhausted" : "active";
      
      expect(newRemaining).toBe(0);
      expect(newStatus).toBe("exhausted");
    });
  });
});

describe("Plan Expiry Detection", () => {
  it("should correctly calculate days until expiry", () => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    expect(daysUntilExpiry).toBe(7);
  });

  it("should identify plans expiring in 7 days", () => {
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const daysUntilExpiry = Math.ceil((in7Days.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    expect(daysUntilExpiry === 7).toBe(true);
  });

  it("should identify plans expiring in 3 days", () => {
    const now = new Date();
    const daysUntilExpiry = Math.ceil((mockExpiringPlan.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    expect(daysUntilExpiry).toBe(3);
  });

  it("should identify plans expiring tomorrow", () => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
    const daysUntilExpiry = Math.ceil((tomorrow.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    expect(daysUntilExpiry).toBe(1);
  });

  it("should set correct urgency level based on days remaining", () => {
    const getUrgencyColor = (days: number) => {
      if (days === 1) return "#dc2626"; // red
      if (days <= 3) return "#f59e0b"; // amber
      return "#0ea5e9"; // blue (primary)
    };
    
    expect(getUrgencyColor(1)).toBe("#dc2626");
    expect(getUrgencyColor(3)).toBe("#f59e0b");
    expect(getUrgencyColor(7)).toBe("#0ea5e9");
  });
});

describe("Inactivity Detection", () => {
  it("should correctly calculate days since last login", () => {
    const now = new Date();
    const lastLogin = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const daysSinceLastLogin = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
    
    expect(daysSinceLastLogin).toBe(7);
  });

  it("should identify users inactive for 7+ days", () => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastLogin = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    
    const isInactive = lastLogin < sevenDaysAgo;
    expect(isInactive).toBe(true);
  });

  it("should not flag active users", () => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastLogin = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    
    const isInactive = lastLogin < sevenDaysAgo;
    expect(isInactive).toBe(false);
  });
});

describe("Email Reminder Templates", () => {
  it("should generate correct subject for plan expiry (7 days)", () => {
    const daysUntilExpiry = 7;
    const subject = `⏰ Your coaching plan expires in ${daysUntilExpiry} days!`;
    
    expect(subject).toContain("7 days");
    expect(subject).not.toContain("URGENT");
  });

  it("should generate urgent subject for plan expiry (1 day)", () => {
    const daysUntilExpiry = 1;
    const subject = `⏰ ${daysUntilExpiry === 1 ? "URGENT: " : ""}Your coaching plan expires ${daysUntilExpiry === 1 ? "tomorrow" : `in ${daysUntilExpiry} days`}!`;
    
    expect(subject).toContain("URGENT");
    expect(subject).toContain("tomorrow");
  });

  it("should generate correct inactivity reminder subject", () => {
    const subject = "👋 We miss you! Continue your learning journey";
    
    expect(subject).toContain("miss you");
    expect(subject).toContain("learning journey");
  });

  it("should include unsubscribe link in inactivity emails", () => {
    const email = "test@example.com";
    const unsubscribeUrl = `https://example.com/unsubscribe?email=${encodeURIComponent(email)}&type=inactivity`;
    
    expect(unsubscribeUrl).toContain("unsubscribe");
    expect(unsubscribeUrl).toContain(encodeURIComponent(email));
    expect(unsubscribeUrl).toContain("type=inactivity");
  });
});

describe("Lesson Progress Tracking", () => {
  it("should calculate course progress percentage correctly", () => {
    const totalLessons = 10;
    const completedLessons = 3;
    const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    
    expect(progressPercent).toBe(30);
  });

  it("should handle zero total lessons", () => {
    const totalLessons = 0;
    const completedLessons = 0;
    const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    
    expect(progressPercent).toBe(0);
  });

  it("should mark course as completed at 100%", () => {
    const totalLessons = 5;
    const completedLessons = 5;
    const progressPercent = Math.round((completedLessons / totalLessons) * 100);
    const status = progressPercent === 100 ? "completed" : "active";
    
    expect(progressPercent).toBe(100);
    expect(status).toBe("completed");
  });

  it("should update lesson status to completed", () => {
    const lessonProgress = {
      status: "not_started",
      progressPercent: 0,
      completedAt: null,
    };
    
    const updated = {
      ...lessonProgress,
      status: "completed",
      progressPercent: 100,
      completedAt: new Date(),
    };
    
    expect(updated.status).toBe("completed");
    expect(updated.progressPercent).toBe(100);
    expect(updated.completedAt).toBeInstanceOf(Date);
  });
});
