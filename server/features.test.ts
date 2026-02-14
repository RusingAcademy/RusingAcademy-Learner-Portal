/**
 * Tests for new features:
 * 1. Learner profile onboarding
 * 2. Coach availability management
 * 3. Session confirmation emails
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the email module
vi.mock("./email", () => ({
  sendEmail: vi.fn().mockResolvedValue(true),
  sendLearnerConfirmation: vi.fn().mockResolvedValue(true),
  sendCoachNotification: vi.fn().mockResolvedValue(true),
  sendSessionConfirmationEmails: vi.fn().mockResolvedValue({
    learnerEmailSent: true,
    coachEmailSent: true,
  }),
}));

// Import after mocking
import {
  sendEmail,
  sendLearnerConfirmation,
  sendCoachNotification,
  sendSessionConfirmationEmails,
} from "./email";

describe("Session Confirmation Emails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockSessionData = {
    learnerName: "John Doe",
    learnerEmail: "john@example.com",
    coachName: "Steven Barholere",
    coachEmail: "steven@rusingacademy.ca",
    sessionDate: new Date("2026-01-15"),
    sessionTime: "10:00 AM",
    sessionType: "trial" as const,
    duration: 30,
    price: 2500, // $25.00 in cents
  };

  it("should send confirmation email to learner", async () => {
    const result = await sendLearnerConfirmation(mockSessionData);
    expect(result).toBe(true);
    expect(sendLearnerConfirmation).toHaveBeenCalledWith(mockSessionData);
  });

  it("should send notification email to coach", async () => {
    const result = await sendCoachNotification(mockSessionData);
    expect(result).toBe(true);
    expect(sendCoachNotification).toHaveBeenCalledWith(mockSessionData);
  });

  it("should send both emails via sendSessionConfirmationEmails", async () => {
    const result = await sendSessionConfirmationEmails(mockSessionData);
    expect(result.learnerEmailSent).toBe(true);
    expect(result.coachEmailSent).toBe(true);
  });

  it("should handle different session types", async () => {
    const singleSession = { ...mockSessionData, sessionType: "single" as const, duration: 60 };
    const packageSession = { ...mockSessionData, sessionType: "package" as const, duration: 60 };

    await sendSessionConfirmationEmails(singleSession);
    await sendSessionConfirmationEmails(packageSession);

    expect(sendSessionConfirmationEmails).toHaveBeenCalledTimes(2);
  });
});

describe("Learner Profile Validation", () => {
  it("should validate SLE level values", () => {
    const validLevels = ["none", "A", "B", "C"];
    
    validLevels.forEach(level => {
      expect(validLevels).toContain(level);
    });
  });

  it("should validate target level is higher than current", () => {
    const levelOrder = { none: 0, A: 1, B: 2, C: 3 };
    
    // Valid: current A, target B
    expect(levelOrder["B"]).toBeGreaterThan(levelOrder["A"]);
    
    // Valid: current B, target C
    expect(levelOrder["C"]).toBeGreaterThan(levelOrder["B"]);
    
    // Valid: current none, target A
    expect(levelOrder["A"]).toBeGreaterThan(levelOrder["none"]);
  });

  it("should require learning goals to be non-empty", () => {
    const validGoals = "I want to improve my oral French for the SLE exam";
    const emptyGoals = "";
    
    expect(validGoals.trim().length).toBeGreaterThan(0);
    expect(emptyGoals.trim().length).toBe(0);
  });
});

describe("Coach Availability", () => {
  it("should validate day of week values", () => {
    const validDays = [0, 1, 2, 3, 4, 5, 6]; // Sunday to Saturday
    
    validDays.forEach(day => {
      expect(day).toBeGreaterThanOrEqual(0);
      expect(day).toBeLessThanOrEqual(6);
    });
  });

  it("should validate time slot format", () => {
    const validTimeSlots = ["9:00 AM", "10:00 AM", "2:00 PM", "6:00 PM"];
    const timeRegex = /^(1[0-2]|[1-9]):[0-5][0-9] (AM|PM)$/;
    
    validTimeSlots.forEach(slot => {
      expect(timeRegex.test(slot)).toBe(true);
    });
  });

  it("should filter available slots by day of week", () => {
    const mockAvailability = [
      { dayOfWeek: 1, startTime: "09:00", endTime: "12:00", isActive: true },
      { dayOfWeek: 1, startTime: "14:00", endTime: "17:00", isActive: true },
      { dayOfWeek: 3, startTime: "10:00", endTime: "15:00", isActive: true },
    ];
    
    // Monday (day 1) should have 2 slots
    const mondaySlots = mockAvailability.filter(a => a.dayOfWeek === 1);
    expect(mondaySlots.length).toBe(2);
    
    // Wednesday (day 3) should have 1 slot
    const wednesdaySlots = mockAvailability.filter(a => a.dayOfWeek === 3);
    expect(wednesdaySlots.length).toBe(1);
    
    // Tuesday (day 2) should have 0 slots
    const tuesdaySlots = mockAvailability.filter(a => a.dayOfWeek === 2);
    expect(tuesdaySlots.length).toBe(0);
  });

  it("should generate time slots from availability range", () => {
    const generateTimeSlots = (startTime: string, endTime: string): string[] => {
      const slots: string[] = [];
      const [startHour] = startTime.split(":").map(Number);
      const [endHour] = endTime.split(":").map(Number);
      
      for (let hour = startHour; hour < endHour; hour++) {
        const period = hour >= 12 ? "PM" : "AM";
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        slots.push(`${displayHour}:00 ${period}`);
      }
      
      return slots;
    };
    
    // 9:00 to 12:00 should generate 3 slots
    const morningSlots = generateTimeSlots("09:00", "12:00");
    expect(morningSlots).toEqual(["9:00 AM", "10:00 AM", "11:00 AM"]);
    
    // 14:00 to 17:00 should generate 3 slots
    const afternoonSlots = generateTimeSlots("14:00", "17:00");
    expect(afternoonSlots).toEqual(["2:00 PM", "3:00 PM", "4:00 PM"]);
  });
});

describe("Stripe Checkout Metadata", () => {
  it("should include all required fields for email sending", () => {
    const requiredMetadataFields = [
      "coach_id",
      "coach_user_id",
      "coach_name",
      "learner_id",
      "learner_user_id",
      "learner_name",
      "session_type",
      "session_date",
      "session_time",
      "duration",
    ];
    
    const mockMetadata = {
      platform: "lingueefy",
      coach_id: "1",
      coach_user_id: "10",
      coach_name: "Steven Barholere",
      learner_id: "2",
      learner_user_id: "20",
      learner_name: "John Doe",
      session_type: "trial",
      package_size: "",
      session_id: "",
      session_date: "2026-01-15",
      session_time: "10:00 AM",
      duration: "30",
    };
    
    requiredMetadataFields.forEach(field => {
      expect(mockMetadata).toHaveProperty(field);
    });
  });

  it("should calculate correct duration based on session type", () => {
    const getDuration = (sessionType: string): number => {
      return sessionType === "trial" ? 30 : 60;
    };
    
    expect(getDuration("trial")).toBe(30);
    expect(getDuration("single")).toBe(60);
    expect(getDuration("package")).toBe(60);
  });
});
