import { describe, it, expect } from "vitest";

const CALENDLY_API_BASE = "https://api.calendly.com";

describe("Calendly API Integration", () => {
  it("should validate CALENDLY_API_KEY by fetching current user", async () => {
    const apiKey = process.env.CALENDLY_API_KEY;
    
    // Skip test if no API key is configured
    if (!apiKey) {
      console.log("CALENDLY_API_KEY not configured, skipping test");
      return;
    }

    const response = await fetch(`${CALENDLY_API_BASE}/users/me`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    expect(response.ok).toBe(true);
    
    const data = await response.json();
    expect(data.resource).toBeDefined();
    expect(data.resource.uri).toBeDefined();
    expect(data.resource.email).toBeDefined();
    
    console.log("Calendly user verified:", data.resource.email);
  });
});
