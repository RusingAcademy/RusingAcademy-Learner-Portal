import { describe, it, expect } from "vitest";

describe("CRON_SECRET Environment Variable", () => {
  it("should have CRON_SECRET environment variable set", () => {
    const cronSecret = process.env.CRON_SECRET;
    expect(cronSecret).toBeDefined();
    expect(cronSecret).not.toBe("");
    expect(typeof cronSecret).toBe("string");
    // Should be at least 32 characters for security
    expect(cronSecret!.length).toBeGreaterThanOrEqual(32);
  });

  it("should have cron endpoint file with proper authorization check", async () => {
    const fs = await import("fs");
    const path = await import("path");
    
    const indexPath = path.join(__dirname, "_core/index.ts");
    const content = fs.readFileSync(indexPath, "utf-8");
    
    // Verify the endpoint checks for CRON_SECRET
    expect(content).toContain("CRON_SECRET");
    expect(content).toContain("Bearer");
    expect(content).toContain("/api/cron/weekly-reports");
  });
});
