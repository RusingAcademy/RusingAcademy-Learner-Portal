import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the email module
vi.mock("./email", () => ({
  sendEmail: vi.fn().mockResolvedValue(true),
}));

// Mock email branding
vi.mock("./email-branding", () => ({
  EMAIL_BRANDING: {
    logos: {
      banner: "https://example.com/banner.png",
    },
  },
  generateEmailFooter: vi.fn().mockReturnValue("<footer>Footer</footer>"),
}));

describe("Email Auth Templates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sendVerificationEmail", () => {
    it("should send verification email in English", async () => {
      const { sendVerificationEmail } = await import("./email-auth-templates");
      const { sendEmail } = await import("./email");

      const result = await sendVerificationEmail({
        to: "test@example.com",
        name: "Test User",
        verificationUrl: "https://www.rusingacademy.ca/verify?token=abc123",
        language: "en",
      });

      expect(result).toBe(true);
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "test@example.com",
          subject: expect.stringContaining("Verify your email"),
        })
      );
    });

    it("should send verification email in French", async () => {
      const { sendVerificationEmail } = await import("./email-auth-templates");
      const { sendEmail } = await import("./email");

      const result = await sendVerificationEmail({
        to: "test@example.com",
        name: "Test User",
        verificationUrl: "https://www.rusingacademy.ca/verify?token=abc123",
        language: "fr",
      });

      expect(result).toBe(true);
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "test@example.com",
          subject: expect.stringContaining("Vérifiez"),
        })
      );
    });
  });

  describe("sendPasswordResetEmail", () => {
    it("should send password reset email in English", async () => {
      const { sendPasswordResetEmail } = await import("./email-auth-templates");
      const { sendEmail } = await import("./email");

      const result = await sendPasswordResetEmail({
        to: "test@example.com",
        name: "Test User",
        resetUrl: "https://www.rusingacademy.ca/reset-password?token=abc123",
        language: "en",
      });

      expect(result).toBe(true);
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "test@example.com",
          subject: expect.stringContaining("Reset your password"),
        })
      );
    });

    it("should send password reset email in French", async () => {
      const { sendPasswordResetEmail } = await import("./email-auth-templates");
      const { sendEmail } = await import("./email");

      const result = await sendPasswordResetEmail({
        to: "test@example.com",
        name: "Test User",
        resetUrl: "https://www.rusingacademy.ca/reset-password?token=abc123",
        language: "fr",
      });

      expect(result).toBe(true);
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "test@example.com",
          subject: expect.stringContaining("Réinitialisation"),
        })
      );
    });

    it("should include custom expiry time", async () => {
      const { sendPasswordResetEmail } = await import("./email-auth-templates");
      const { sendEmail } = await import("./email");

      await sendPasswordResetEmail({
        to: "test@example.com",
        name: "Test User",
        resetUrl: "https://www.rusingacademy.ca/reset-password?token=abc123",
        expiresInHours: 2,
        language: "en",
      });

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining("2 hours"),
        })
      );
    });
  });

  describe("sendWelcomeEmail", () => {
    it("should send welcome email for learner in English", async () => {
      const { sendWelcomeEmail } = await import("./email-auth-templates");
      const { sendEmail } = await import("./email");

      const result = await sendWelcomeEmail({
        to: "test@example.com",
        name: "Test User",
        role: "learner",
        language: "en",
      });

      expect(result).toBe(true);
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "test@example.com",
          subject: expect.stringContaining("bilingual journey"),
          html: expect.stringContaining("Explore coaches"),
        })
      );
    });

    it("should send welcome email for coach in English", async () => {
      const { sendWelcomeEmail } = await import("./email-auth-templates");
      const { sendEmail } = await import("./email");

      const result = await sendWelcomeEmail({
        to: "coach@example.com",
        name: "Coach User",
        role: "coach",
        language: "en",
      });

      expect(result).toBe(true);
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "coach@example.com",
          subject: expect.stringContaining("coaching team"),
          html: expect.stringContaining("Set up my profile"),
        })
      );
    });

    it("should send welcome email for learner in French", async () => {
      const { sendWelcomeEmail } = await import("./email-auth-templates");
      const { sendEmail } = await import("./email");

      await sendWelcomeEmail({
        to: "test@example.com",
        name: "Test User",
        role: "learner",
        language: "fr",
      });

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining("Bienvenue"),
          html: expect.stringContaining("Explorer les coachs"),
        })
      );
    });
  });

  describe("sendSubscriptionConfirmationEmail", () => {
    it("should send subscription confirmation email", async () => {
      const { sendSubscriptionConfirmationEmail } = await import("./email-auth-templates");
      const { sendEmail } = await import("./email");

      const result = await sendSubscriptionConfirmationEmail({
        to: "test@example.com",
        name: "Test User",
        planName: "Premium Membership",
        amount: 2999,
        interval: "month",
        nextBillingDate: new Date("2026-02-10"),
        language: "en",
      });

      expect(result).toBe(true);
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "test@example.com",
          subject: expect.stringContaining("Subscription Confirmed"),
          html: expect.stringContaining("$29.99"),
        })
      );
    });

    it("should send subscription confirmation email in French", async () => {
      const { sendSubscriptionConfirmationEmail } = await import("./email-auth-templates");
      const { sendEmail } = await import("./email");

      await sendSubscriptionConfirmationEmail({
        to: "test@example.com",
        name: "Test User",
        planName: "Premium Membership",
        amount: 29900,
        interval: "year",
        nextBillingDate: new Date("2027-01-10"),
        language: "fr",
      });

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining("Confirmation d'abonnement"),
          html: expect.stringContaining("Annuel"),
        })
      );
    });
  });

  describe("sendSubscriptionCancellationEmail", () => {
    it("should send subscription cancellation email", async () => {
      const { sendSubscriptionCancellationEmail } = await import("./email-auth-templates");
      const { sendEmail } = await import("./email");

      const result = await sendSubscriptionCancellationEmail({
        to: "test@example.com",
        name: "Test User",
        planName: "Premium Membership",
        endDate: new Date("2026-02-10"),
        language: "en",
      });

      expect(result).toBe(true);
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "test@example.com",
          subject: expect.stringContaining("Cancellation Confirmed"),
          html: expect.stringContaining("Reactivate"),
        })
      );
    });

    it("should send subscription cancellation email in French", async () => {
      const { sendSubscriptionCancellationEmail } = await import("./email-auth-templates");
      const { sendEmail } = await import("./email");

      await sendSubscriptionCancellationEmail({
        to: "test@example.com",
        name: "Test User",
        planName: "Premium Membership",
        endDate: new Date("2026-02-10"),
        language: "fr",
      });

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining("annulation"),
          html: expect.stringContaining("Réactiver"),
        })
      );
    });
  });
});
