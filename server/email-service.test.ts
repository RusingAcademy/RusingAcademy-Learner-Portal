/**
 * Email Service Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock nodemailer before importing the module
vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: vi.fn().mockResolvedValue({ messageId: "test-123" }),
      verify: vi.fn().mockResolvedValue(true),
    })),
  },
}));

describe("Email Service", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("getEmailServiceStatus", () => {
    it("should return not configured when SMTP env vars are missing", async () => {
      delete process.env.SMTP_HOST;
      delete process.env.SMTP_USER;
      delete process.env.SMTP_PASS;
      
      const { getEmailServiceStatus } = await import("./email-service");
      const status = getEmailServiceStatus();
      
      expect(status.configured).toBe(false);
      expect(status.provider).toBeUndefined();
    });

    it("should return configured when SMTP env vars are set", async () => {
      process.env.SMTP_HOST = "smtp.sendgrid.net";
      process.env.SMTP_USER = "apikey";
      process.env.SMTP_PASS = "test-key";
      process.env.SMTP_FROM = "test@example.com";
      process.env.SMTP_FROM_NAME = "Test";
      
      const { getEmailServiceStatus } = await import("./email-service");
      const status = getEmailServiceStatus();
      
      expect(status.configured).toBe(true);
      expect(status.provider).toBe("SendGrid");
      expect(status.from).toBe("Test <test@example.com>");
    });

    it("should detect Mailgun provider", async () => {
      process.env.SMTP_HOST = "smtp.mailgun.org";
      process.env.SMTP_USER = "user";
      process.env.SMTP_PASS = "pass";
      
      const { getEmailServiceStatus } = await import("./email-service");
      const status = getEmailServiceStatus();
      
      expect(status.provider).toBe("Mailgun");
    });

    it("should detect Amazon SES provider", async () => {
      process.env.SMTP_HOST = "email-smtp.us-east-1.amazonaws.com";
      process.env.SMTP_USER = "user";
      process.env.SMTP_PASS = "pass";
      
      const { getEmailServiceStatus } = await import("./email-service");
      const status = getEmailServiceStatus();
      
      expect(status.provider).toBe("Amazon SES");
    });
  });

  describe("sendEmailViaSMTP", () => {
    it("should log to console when SMTP is not configured", async () => {
      delete process.env.SMTP_HOST;
      delete process.env.SMTP_USER;
      delete process.env.SMTP_PASS;
      
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      
      const { sendEmailViaSMTP } = await import("./email-service");
      const result = await sendEmailViaSMTP({
        to: "test@example.com",
        subject: "Test Subject",
        html: "<p>Test content</p>",
      });
      
      expect(result.success).toBe(true);
      expect(result.messageId).toMatch(/^dev-/);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it("should send email when SMTP is configured", async () => {
      process.env.SMTP_HOST = "smtp.test.com";
      process.env.SMTP_USER = "user";
      process.env.SMTP_PASS = "pass";
      process.env.SMTP_FROM = "sender@test.com";
      process.env.SMTP_FROM_NAME = "Sender";
      
      const { sendEmailViaSMTP } = await import("./email-service");
      const result = await sendEmailViaSMTP({
        to: "test@example.com",
        subject: "Test Subject",
        html: "<p>Test content</p>",
        text: "Test content",
      });
      
      expect(result.success).toBe(true);
      expect(result.messageId).toBe("test-123");
    });
  });

  describe("verifyEmailConnection", () => {
    it("should return error when SMTP is not configured", async () => {
      delete process.env.SMTP_HOST;
      delete process.env.SMTP_USER;
      delete process.env.SMTP_PASS;
      
      const { verifyEmailConnection } = await import("./email-service");
      const result = await verifyEmailConnection();
      
      expect(result.connected).toBe(false);
      expect(result.error).toContain("SMTP not configured");
    });

    it("should verify connection when SMTP is configured", async () => {
      process.env.SMTP_HOST = "smtp.test.com";
      process.env.SMTP_USER = "user";
      process.env.SMTP_PASS = "pass";
      
      const { verifyEmailConnection } = await import("./email-service");
      const result = await verifyEmailConnection();
      
      expect(result.connected).toBe(true);
    });
  });
});
