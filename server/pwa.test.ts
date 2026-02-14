import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const PUBLIC_DIR = path.resolve(__dirname, "../client/public");
const INDEX_HTML = path.resolve(__dirname, "../client/index.html");

describe("PWA Configuration", () => {
  describe("manifest.json", () => {
    const manifestPath = path.join(PUBLIC_DIR, "manifest.json");
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

    it("should exist and be valid JSON", () => {
      expect(fs.existsSync(manifestPath)).toBe(true);
      expect(manifest).toBeDefined();
    });

    it("should have correct name and short_name", () => {
      expect(manifest.name).toContain("RusingAcademy");
      expect(manifest.short_name).toBe("RusingAcademy");
    });

    it("should have standalone display mode", () => {
      expect(manifest.display).toBe("standalone");
    });

    it("should have start_url set to /", () => {
      expect(manifest.start_url).toBe("/");
    });

    it("should have scope set to /", () => {
      expect(manifest.scope).toBe("/");
    });

    it("should have correct theme_color matching central repo (#0D7377)", () => {
      expect(manifest.theme_color).toBe("#0D7377");
    });

    it("should have white background_color", () => {
      expect(manifest.background_color).toBe("#FFFFFF");
    });

    it("should have education and productivity categories", () => {
      expect(manifest.categories).toContain("education");
      expect(manifest.categories).toContain("productivity");
    });

    it("should have lang set to en", () => {
      expect(manifest.lang).toBe("en");
    });

    it("should have at least 4 icons (192 any, 512 any, 192 maskable, 512 maskable)", () => {
      expect(manifest.icons.length).toBeGreaterThanOrEqual(4);
    });

    it("should have 192x192 icon with purpose any", () => {
      const icon = manifest.icons.find(
        (i: any) => i.sizes === "192x192" && i.purpose === "any"
      );
      expect(icon).toBeDefined();
      expect(icon.type).toBe("image/png");
    });

    it("should have 512x512 icon with purpose any", () => {
      const icon = manifest.icons.find(
        (i: any) => i.sizes === "512x512" && i.purpose === "any"
      );
      expect(icon).toBeDefined();
      expect(icon.type).toBe("image/png");
    });

    it("should have 192x192 maskable icon", () => {
      const icon = manifest.icons.find(
        (i: any) => i.sizes === "192x192" && i.purpose === "maskable"
      );
      expect(icon).toBeDefined();
    });

    it("should have 512x512 maskable icon", () => {
      const icon = manifest.icons.find(
        (i: any) => i.sizes === "512x512" && i.purpose === "maskable"
      );
      expect(icon).toBeDefined();
    });

    it("should not combine any and maskable in same purpose field", () => {
      for (const icon of manifest.icons) {
        expect(icon.purpose).not.toContain("any maskable");
      }
    });

    it("should have prefer_related_applications set to false", () => {
      expect(manifest.prefer_related_applications).toBe(false);
    });
  });

  describe("PWA Icon Files", () => {
    const requiredIcons = [
      "icons/icon-192x192.png",
      "icons/icon-512x512.png",
      "icons/icon-maskable-192x192.png",
      "icons/icon-maskable-512x512.png",
      "icons/apple-touch-icon.png",
      "icons/favicon-32x32.png",
      "icons/favicon-16x16.png",
    ];

    for (const icon of requiredIcons) {
      it(`should have ${icon} file`, () => {
        const iconPath = path.join(PUBLIC_DIR, icon);
        expect(fs.existsSync(iconPath)).toBe(true);
        const stats = fs.statSync(iconPath);
        expect(stats.size).toBeGreaterThan(0);
      });
    }

    it("should have favicon.ico in public root", () => {
      const faviconPath = path.join(PUBLIC_DIR, "favicon.ico");
      expect(fs.existsSync(faviconPath)).toBe(true);
    });
  });

  describe("Service Worker (sw.js)", () => {
    const swPath = path.join(PUBLIC_DIR, "sw.js");
    const swContent = fs.readFileSync(swPath, "utf-8");

    it("should exist", () => {
      expect(fs.existsSync(swPath)).toBe(true);
    });

    it("should define CACHE_NAME", () => {
      expect(swContent).toContain("CACHE_NAME");
      expect(swContent).toContain("rusingacademy-v1");
    });

    it("should have install event listener", () => {
      expect(swContent).toContain("addEventListener('install'");
    });

    it("should have activate event listener", () => {
      expect(swContent).toContain("addEventListener('activate'");
    });

    it("should have fetch event listener", () => {
      expect(swContent).toContain("addEventListener('fetch'");
    });

    it("should precache essential assets", () => {
      expect(swContent).toContain("PRECACHE_ASSETS");
      expect(swContent).toContain("/offline.html");
      expect(swContent).toContain("/manifest.json");
    });

    it("should use network-first for API routes (safe caching)", () => {
      expect(swContent).toContain("api");
      expect(swContent).toContain("trpc");
    });

    it("should NEVER cache auth/admin routes", () => {
      expect(swContent).toContain("NEVER_CACHE_PATTERNS");
      expect(swContent).toContain("/oauth");
      expect(swContent).toContain("admin");
    });

    it("should never cache coach and HR portal routes", () => {
      expect(swContent).toContain("coach");
      expect(swContent).toContain("hr");
    });

    it("should have offline fallback for navigation requests", () => {
      expect(swContent).toContain("OFFLINE_URL");
      expect(swContent).toContain("request.mode === 'navigate'");
    });

    it("should support SKIP_WAITING message", () => {
      expect(swContent).toContain("SKIP_WAITING");
      expect(swContent).toContain("self.skipWaiting()");
    });

    it("should support push notifications", () => {
      expect(swContent).toContain("addEventListener('push'");
      expect(swContent).toContain("showNotification");
    });

    it("should support course caching for offline access", () => {
      expect(swContent).toContain("CACHE_COURSE");
      expect(swContent).toContain("cacheCourseMaterials");
    });
  });

  describe("Offline Page (offline.html)", () => {
    const offlinePath = path.join(PUBLIC_DIR, "offline.html");
    const offlineContent = fs.readFileSync(offlinePath, "utf-8");

    it("should exist", () => {
      expect(fs.existsSync(offlinePath)).toBe(true);
    });

    it("should be bilingual (English and French)", () => {
      expect(offlineContent).toContain("You're Offline");
      expect(offlineContent).toContain("Vous êtes hors ligne");
    });

    it("should have a retry button", () => {
      expect(offlineContent).toContain("Try Again");
      expect(offlineContent).toContain("Réessayer");
    });

    it("should have language toggle", () => {
      expect(offlineContent).toContain("lang-toggle");
    });

    it("should auto-detect French language", () => {
      expect(offlineContent).toContain("navigator.language");
      expect(offlineContent).toContain("startsWith('fr')");
    });

    it("should auto-reload when connection is restored", () => {
      expect(offlineContent).toContain("addEventListener('online'");
      expect(offlineContent).toContain("window.location.reload()");
    });
  });

  describe("index.html PWA Meta Tags", () => {
    const htmlContent = fs.readFileSync(INDEX_HTML, "utf-8");

    it("should link to manifest.json", () => {
      expect(htmlContent).toContain('rel="manifest" href="/manifest.json"');
    });

    it("should have theme-color meta tag matching #0D7377", () => {
      expect(htmlContent).toContain('name="theme-color" content="#0D7377"');
    });

    it("should have apple-mobile-web-app-capable", () => {
      expect(htmlContent).toContain('name="apple-mobile-web-app-capable" content="yes"');
    });

    it("should have apple-mobile-web-app-status-bar-style", () => {
      expect(htmlContent).toContain('name="apple-mobile-web-app-status-bar-style" content="black-translucent"');
    });

    it("should have apple-mobile-web-app-title", () => {
      expect(htmlContent).toContain('name="apple-mobile-web-app-title"');
    });

    it("should have mobile-web-app-capable", () => {
      expect(htmlContent).toContain('name="mobile-web-app-capable" content="yes"');
    });

    it("should have application-name", () => {
      expect(htmlContent).toContain('name="application-name"');
    });

    it("should have msapplication-TileColor matching #0D7377", () => {
      expect(htmlContent).toContain('name="msapplication-TileColor" content="#0D7377"');
    });

    it("should have apple-touch-icon link", () => {
      expect(htmlContent).toContain('rel="apple-touch-icon"');
    });

    it("should have favicon.ico link", () => {
      expect(htmlContent).toContain('href="/favicon.ico"');
    });

    it("should register service worker", () => {
      expect(htmlContent).toContain("serviceWorker");
      expect(htmlContent).toContain("register('/sw.js')");
    });

    it("should have Open Graph tags", () => {
      expect(htmlContent).toContain('property="og:title"');
      expect(htmlContent).toContain('property="og:description"');
      expect(htmlContent).toContain('property="og:type"');
    });

    it("should have Twitter Card tags", () => {
      expect(htmlContent).toContain('name="twitter:card"');
      expect(htmlContent).toContain('name="twitter:title"');
    });
  });
});
