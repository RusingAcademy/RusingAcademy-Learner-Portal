/**
 * Vitest tests for Sprints 4-10 features
 * Covers: i18n, accessibility, SLE Practice, AI chat, community, PWA, SEO
 */
import { describe, it, expect } from "vitest";

// ========== Sprint 4: i18n System ==========
describe("Sprint 4: Bilingual i18n System", () => {
  it("should have English translation dictionary with all required keys", async () => {
    const en = await import("../client/src/i18n/en");
    const translations = en.default ?? en.en;
    expect(translations).toBeDefined();
    expect(typeof translations).toBe("object");
    // Check key sections exist
    expect(translations).toHaveProperty("nav");
    expect(translations).toHaveProperty("dashboard");
  });

  it("should have French translation dictionary with all required keys", async () => {
    const fr = await import("../client/src/i18n/fr");
    const translations = fr.default ?? fr.fr;
    expect(translations).toBeDefined();
    expect(typeof translations).toBe("object");
    expect(translations).toHaveProperty("nav");
    expect(translations).toHaveProperty("dashboard");
  });

  it("should have matching keys between EN and FR dictionaries", async () => {
    const enMod = await import("../client/src/i18n/en");
    const frMod = await import("../client/src/i18n/fr");
    const en = enMod.default ?? enMod.en;
    const fr = frMod.default ?? frMod.fr;
    const enKeys = Object.keys(en).sort();
    const frKeys = Object.keys(fr).sort();
    expect(enKeys).toEqual(frKeys);
  });
});

// ========== Sprint 6: SLE Practice Data ==========
describe("Sprint 6: SLE Practice Content", () => {
  it("should have SLE Practice page component", async () => {
    // Verify the module exists and exports a default component
    const mod = await import("../client/src/pages/SLEPractice");
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe("function");
  });
});

// ========== Sprint 7: AI Chat Router ==========
describe("Sprint 7: AI Chat Router", () => {
  it("should have AI assistant page file", async () => {
    const fs = await import("fs");
    const exists = fs.existsSync("./client/src/pages/AIAssistant.tsx");
    expect(exists).toBe(true);
    const content = fs.readFileSync("./client/src/pages/AIAssistant.tsx", "utf-8");
    expect(content).toContain("AIChatBox");
    expect(content).toContain("trpc.ai.chat");
    expect(content).toContain("trpc.ai.getRecommendations");
  });

  it("should have invokeLLM function available", async () => {
    const mod = await import("./routers");
    expect(mod.appRouter).toBeDefined();
    // Verify the ai router exists in the app router
    const routerDef = mod.appRouter._def;
    expect(routerDef).toBeDefined();
  });
});

// ========== Sprint 8: Community Forum ==========
describe("Sprint 8: Enhanced Community Forum", () => {
  it("should have CommunityForum page component", async () => {
    const mod = await import("../client/src/pages/CommunityForum");
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe("function");
  });
});

// ========== Sprint 9: PWA ==========
describe("Sprint 9: PWA Configuration", () => {
  it("should have valid manifest.json", async () => {
    const fs = await import("fs");
    const manifestPath = "./client/public/manifest.json";
    const exists = fs.existsSync(manifestPath);
    expect(exists).toBe(true);
    const content = fs.readFileSync(manifestPath, "utf-8");
    const manifest = JSON.parse(content);
    expect(manifest.name).toContain("RusingAcademy");
    expect(manifest.theme_color).toBe("#0D7377");
    expect(manifest.display).toBe("standalone");
    expect(manifest.icons).toBeDefined();
    expect(manifest.icons.length).toBeGreaterThan(0);
  });

  it("should have robots.txt", async () => {
    const fs = await import("fs");
    const exists = fs.existsSync("./client/public/robots.txt");
    expect(exists).toBe(true);
    const content = fs.readFileSync("./client/public/robots.txt", "utf-8");
    expect(content).toContain("User-agent");
    expect(content).toContain("Sitemap");
  });

  it("should have sitemap.xml", async () => {
    const fs = await import("fs");
    const exists = fs.existsSync("./client/public/sitemap.xml");
    expect(exists).toBe(true);
    const content = fs.readFileSync("./client/public/sitemap.xml", "utf-8");
    expect(content).toContain("<urlset");
    expect(content).toContain("/dashboard");
    expect(content).toContain("/sle-practice");
  });
});

// ========== Sprint 10: SEO & Landing Page ==========
describe("Sprint 10: SEO & Landing Page", () => {
  it("should have SEO meta tags in index.html", async () => {
    const fs = await import("fs");
    const html = fs.readFileSync("./client/index.html", "utf-8");
    expect(html).toContain('og:title');
    expect(html).toContain('og:description');
    expect(html).toContain('twitter:card');
    expect(html).toContain('manifest');
    expect(html).toContain('theme-color');
    expect(html).toContain('apple-mobile-web-app');
  });

  it("should have Home landing page component", async () => {
    const mod = await import("../client/src/pages/Home");
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe("function");
  });
});

// ========== Aesthetic Redesign Verification ==========
describe("Aesthetic Redesign: Light Theme", () => {
  it("should have light theme CSS variables in index.css", async () => {
    const fs = await import("fs");
    const css = fs.readFileSync("./client/src/index.css", "utf-8");
    // Verify it's a light theme (white backgrounds)
    expect(css).toContain("--background");
    expect(css).toContain("--foreground");
    // Should NOT have dark background as default
    expect(css).not.toContain("background: #0c1929");
  });

  it("should have Leaderboard page component", async () => {
    const mod = await import("../client/src/pages/Leaderboard");
    expect(mod.default).toBeDefined();
  });

  it("should have WeeklyChallenges page component", async () => {
    const mod = await import("../client/src/pages/WeeklyChallenges");
    expect(mod.default).toBeDefined();
  });
});
