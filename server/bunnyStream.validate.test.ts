import { describe, it, expect } from "vitest";

describe("Bunny Stream API Key Validation", () => {
  it("should have BUNNY_STREAM_API_KEY set", () => {
    const key = process.env.BUNNY_STREAM_API_KEY;
    expect(key).toBeDefined();
    expect(key!.length).toBeGreaterThan(10);
  });

  it("should have BUNNY_STREAM_LIBRARY_ID set", () => {
    const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
    expect(libraryId).toBeDefined();
    expect(libraryId).toBe("585866");
  });

  it("should have BUNNY_STREAM_CDN_HOSTNAME set", () => {
    const hostname = process.env.BUNNY_STREAM_CDN_HOSTNAME;
    expect(hostname).toBeDefined();
    expect(hostname).toContain("b-cdn.net");
  });

  it("should successfully authenticate with Bunny Stream API", async () => {
    const apiKey = process.env.BUNNY_STREAM_API_KEY;
    const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
    
    if (!apiKey || !libraryId) {
      console.warn("Bunny Stream credentials not set, skipping live test");
      return;
    }

    const response = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos?page=1&itemsPerPage=1`,
      {
        headers: {
          AccessKey: apiKey,
          Accept: "application/json",
        },
      }
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("totalItems");
    expect(data.totalItems).toBeGreaterThan(0);
  });
});
