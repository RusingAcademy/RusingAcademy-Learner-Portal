/**
 * Tests for Coach Terms Acceptance Email
 */
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
      icon: "https://example.com/icon.png",
      square: "https://example.com/square.png",
    },
    colors: {
      primary: "#0d9488",
      primaryLight: "#14b8a6",
      secondary: "#f97316",
      dark: "#1a202c",
      light: "#f9fafb",
      white: "#ffffff",
      text: "#333333",
      muted: "#6b7280",
    },
    company: {
      legalName: "Rusinga International Consulting Ltd.",
      tradeName: "RusingÂcademy",
      productName: "Lingueefy",
      tagline: "Master Your Second Language for the Public Service",
      taglineFr: "Maîtrisez votre langue seconde pour la fonction publique",
      supportEmail: "support@rusingacademy.ca",
      website: "https://www.rusingacademy.ca",
    },
    footer: {
      en: "© 2026 Rusinga International Consulting Ltd.",
      fr: "© 2026 Rusinga International Consulting Ltd.",
    },
  },
  generateEmailFooter: vi.fn().mockReturnValue("<footer>Footer</footer>"),
}));

describe("Coach Terms Acceptance Email", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sendCoachTermsAcceptanceEmail", () => {
    it("should send terms acceptance email in French", async () => {
      const { sendCoachTermsAcceptanceEmail } = await import("./email-coach-terms");
      const { sendEmail } = await import("./email");

      const result = await sendCoachTermsAcceptanceEmail({
        coachName: "Marie Dupont",
        coachEmail: "marie@example.com",
        acceptedAt: new Date("2026-01-29T10:00:00Z"),
        termsVersion: "v2026.01.29",
        language: "fr",
      });

      expect(result).toBe(true);
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "marie@example.com",
          subject: expect.stringContaining("Confirmation"),
          html: expect.stringContaining("Marie Dupont"),
        })
      );
    });

    it("should send terms acceptance email in English", async () => {
      const { sendCoachTermsAcceptanceEmail } = await import("./email-coach-terms");
      const { sendEmail } = await import("./email");

      const result = await sendCoachTermsAcceptanceEmail({
        coachName: "John Smith",
        coachEmail: "john@example.com",
        acceptedAt: new Date("2026-01-29T10:00:00Z"),
        termsVersion: "v2026.01.29",
        language: "en",
      });

      expect(result).toBe(true);
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "john@example.com",
          subject: expect.stringContaining("Terms and Conditions"),
          html: expect.stringContaining("John Smith"),
        })
      );
    });

    it("should include 30% commission information in email", async () => {
      const { sendCoachTermsAcceptanceEmail } = await import("./email-coach-terms");
      const { sendEmail } = await import("./email");

      await sendCoachTermsAcceptanceEmail({
        coachName: "Test Coach",
        coachEmail: "test@example.com",
        acceptedAt: new Date(),
        termsVersion: "v2026.01.29",
        language: "fr",
      });

      const call = (sendEmail as any).mock.calls[0][0];
      expect(call.html).toContain("30%");
      expect(call.html).toContain("70%");
    });

    it("should include commission breakdown categories", async () => {
      const { sendCoachTermsAcceptanceEmail } = await import("./email-coach-terms");
      const { sendEmail } = await import("./email");

      await sendCoachTermsAcceptanceEmail({
        coachName: "Test Coach",
        coachEmail: "test@example.com",
        acceptedAt: new Date(),
        termsVersion: "v2026.01.29",
        language: "fr",
      });

      const call = (sendEmail as any).mock.calls[0][0];
      // Check for commission categories in French
      expect(call.html).toContain("Logistique");
      expect(call.html).toContain("Entretien");
      expect(call.html).toContain("Formation");
      expect(call.html).toContain("Marketing");
    });

    it("should include official company name", async () => {
      const { sendCoachTermsAcceptanceEmail } = await import("./email-coach-terms");
      const { sendEmail } = await import("./email");

      await sendCoachTermsAcceptanceEmail({
        coachName: "Test Coach",
        coachEmail: "test@example.com",
        acceptedAt: new Date(),
        termsVersion: "v2026.01.29",
        language: "fr",
      });

      const call = (sendEmail as any).mock.calls[0][0];
      expect(call.html).toContain("Rusinga International Consulting Ltd.");
    });

    it("should include terms version in email", async () => {
      const { sendCoachTermsAcceptanceEmail } = await import("./email-coach-terms");
      const { sendEmail } = await import("./email");

      await sendCoachTermsAcceptanceEmail({
        coachName: "Test Coach",
        coachEmail: "test@example.com",
        acceptedAt: new Date(),
        termsVersion: "v2026.01.29",
        language: "fr",
      });

      const call = (sendEmail as any).mock.calls[0][0];
      expect(call.html).toContain("v2026.01.29");
    });

    it("should default to French language if not specified", async () => {
      const { sendCoachTermsAcceptanceEmail } = await import("./email-coach-terms");
      const { sendEmail } = await import("./email");

      await sendCoachTermsAcceptanceEmail({
        coachName: "Test Coach",
        coachEmail: "test@example.com",
        acceptedAt: new Date(),
        termsVersion: "v2026.01.29",
      });

      const call = (sendEmail as any).mock.calls[0][0];
      // Check for French content
      expect(call.subject).toContain("Confirmation");
      expect(call.html).toContain("Bonjour");
    });

    it("should include next steps in email", async () => {
      const { sendCoachTermsAcceptanceEmail } = await import("./email-coach-terms");
      const { sendEmail } = await import("./email");

      await sendCoachTermsAcceptanceEmail({
        coachName: "Test Coach",
        coachEmail: "test@example.com",
        acceptedAt: new Date(),
        termsVersion: "v2026.01.29",
        language: "fr",
      });

      const call = (sendEmail as any).mock.calls[0][0];
      expect(call.html).toContain("Stripe");
      expect(call.html).toContain("profil");
    });
  });
});
