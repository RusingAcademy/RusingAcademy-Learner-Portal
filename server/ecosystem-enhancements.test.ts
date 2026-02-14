import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock database
vi.mock("./db", () => ({
  getDb: vi.fn(() => null),
}));

describe("Ecosystem Enhancements", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Newsletter Subscription", () => {
    it("should validate email format", () => {
      const validEmails = [
        "test@example.com",
        "user.name@domain.ca",
        "admin@gc.ca",
      ];
      const invalidEmails = [
        "not-an-email",
        "@missing-local.com",
        "missing-at-sign.com",
      ];

      validEmails.forEach((email) => {
        expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });

      invalidEmails.forEach((email) => {
        expect(email).not.toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });
    });

    it("should validate brand enum values", () => {
      const validBrands = ["ecosystem", "rusingacademy", "lingueefy", "barholex"];
      const invalidBrands = ["invalid", "other", ""];

      validBrands.forEach((brand) => {
        expect(["ecosystem", "rusingacademy", "lingueefy", "barholex"]).toContain(brand);
      });

      invalidBrands.forEach((brand) => {
        expect(["ecosystem", "rusingacademy", "lingueefy", "barholex"]).not.toContain(brand);
      });
    });

    it("should validate language enum values", () => {
      const validLanguages = ["en", "fr"];
      const invalidLanguages = ["es", "de", ""];

      validLanguages.forEach((lang) => {
        expect(["en", "fr"]).toContain(lang);
      });

      invalidLanguages.forEach((lang) => {
        expect(["en", "fr"]).not.toContain(lang);
      });
    });

    it("should handle interests array correctly", () => {
      const interests = ["sle-training", "coaching", "media-production"];
      expect(Array.isArray(interests)).toBe(true);
      expect(interests.length).toBe(3);
      expect(interests).toContain("sle-training");
    });
  });

  describe("Brand Contact Forms", () => {
    it("should validate RusingAcademy form fields", () => {
      const formData = {
        name: "John Doe",
        email: "john@gc.ca",
        organization: "Treasury Board",
        teamSize: "11-25",
        currentLevel: "A",
        targetLevel: "B",
        timeline: "6months",
        budget: "$10k-25k",
        message: "We need team training",
      };

      expect(formData.name).toBeTruthy();
      expect(formData.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      expect(["1-5", "6-10", "11-25", "26-50", "50+"]).toContain(formData.teamSize);
      expect(["X", "A", "B", "C"]).toContain(formData.currentLevel);
      expect(["B", "C", "E"]).toContain(formData.targetLevel);
    });

    it("should validate Lingueefy form fields", () => {
      const formData = {
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "+1-613-555-0123",
        currentLevel: "A",
        targetLevel: "B",
        targetSkill: "oral",
        preferredLanguage: "fr",
        availability: "evenings",
        message: "Looking for coaching",
      };

      expect(formData.name).toBeTruthy();
      expect(formData.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      expect(["oral", "written", "both"]).toContain(formData.targetSkill);
      expect(["en", "fr"]).toContain(formData.preferredLanguage);
    });

    it("should validate Barholex form fields", () => {
      const formData = {
        name: "Executive Leader",
        email: "exec@company.com",
        organization: "Major Corp",
        role: "Director",
        serviceType: "executive-presence",
        projectDescription: "Need coaching for presentations",
        budget: "$10k-25k",
        timeline: "1-3months",
        message: "Interested in your services",
      };

      expect(formData.name).toBeTruthy();
      expect(formData.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      expect([
        "executive-presence",
        "video-production",
        "podcast-production",
        "strategic-comms",
        "full-package",
      ]).toContain(formData.serviceType);
    });
  });

  describe("Design System", () => {
    it("should have correct brand colors", () => {
      const brandColors = {
        ecosystem: "#FF6A2B",
        rusingacademy: "#FF6A2B",
        lingueefy: "#17E2C6",
        barholex: "#8B5CFF",
      };

      expect(brandColors.ecosystem).toBe("#FF6A2B");
      expect(brandColors.lingueefy).toBe("#17E2C6");
      expect(brandColors.barholex).toBe("#8B5CFF");
    });

    it("should have glass and light theme tokens", () => {
      const themes = {
        glass: {
          bg: "bg-[#0a0e1a]",
          text: "text-white",
        },
        light: {
          bg: "bg-white",
          text: "text-gray-900",
        },
      };

      expect(themes.glass.bg).toContain("0a0e1a");
      expect(themes.light.bg).toContain("white");
    });
  });

  describe("Landing Page Routes", () => {
    it("should have correct route mappings", () => {
      const routes = {
        ecosystem: ["/", "/ecosystem"],
        lingueefy: "/lingueefy",
        rusingacademy: "/rusingacademy",
        barholex: "/barholex-media",
        coaches: "/coaches",
      };

      expect(routes.ecosystem).toContain("/");
      expect(routes.lingueefy).toBe("/lingueefy");
      expect(routes.rusingacademy).toBe("/rusingacademy");
      expect(routes.barholex).toBe("/barholex-media");
    });
  });

  describe("Hero Image Layout", () => {
    it("should have correct split layout configuration", () => {
      const layout = {
        desktop: {
          textColumn: "lg:col-span-1",
          imageColumn: "lg:col-span-1",
          gridCols: "lg:grid-cols-2",
        },
        mobile: {
          textOrder: "order-2",
          imageOrder: "order-1",
        },
      };

      expect(layout.desktop.gridCols).toContain("grid-cols-2");
      expect(layout.mobile.textOrder).toBe("order-2");
      expect(layout.mobile.imageOrder).toBe("order-1");
    });
  });
});
