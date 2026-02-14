/**
 * Bunny Storage Integration Test
 * Validates that the Bunny Storage credentials are correctly configured
 */

import { describe, it, expect } from "vitest";

describe("Bunny Storage Integration", () => {
  const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE || "rusingacademy-uploads";
  const BUNNY_STORAGE_API_KEY = process.env.BUNNY_STORAGE_API_KEY || "";
  const BUNNY_STORAGE_HOSTNAME = process.env.BUNNY_STORAGE_HOSTNAME || "ny.storage.bunnycdn.com";
  const BUNNY_CDN_URL = process.env.BUNNY_CDN_URL || "https://rusingacademy-cdn.b-cdn.net";

  it("should have Bunny Storage environment variables configured", () => {
    expect(BUNNY_STORAGE_API_KEY).toBeTruthy();
    expect(BUNNY_STORAGE_API_KEY.length).toBeGreaterThan(10);
    expect(BUNNY_STORAGE_ZONE).toBe("rusingacademy-uploads");
    expect(BUNNY_STORAGE_HOSTNAME).toBe("ny.storage.bunnycdn.com");
    expect(BUNNY_CDN_URL).toBe("https://rusingacademy-cdn.b-cdn.net");
  });

  it("should be able to list files in Bunny Storage (validates API key)", async () => {
    // List the root directory to validate the API key works
    const listUrl = `https://${BUNNY_STORAGE_HOSTNAME}/${BUNNY_STORAGE_ZONE}/`;

    const response = await fetch(listUrl, {
      method: "GET",
      headers: {
        "AccessKey": BUNNY_STORAGE_API_KEY,
        "Accept": "application/json",
      },
    });

    // 200 = success (even if empty), 401 = invalid key, 404 = zone not found
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it("should be able to upload and delete a test file", async () => {
    const testKey = `_test/bunny-test-${Date.now()}.txt`;
    const testContent = "Bunny Storage test file - safe to delete";
    
    // Upload test file
    const uploadUrl = `https://${BUNNY_STORAGE_HOSTNAME}/${BUNNY_STORAGE_ZONE}/${testKey}`;
    
    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "AccessKey": BUNNY_STORAGE_API_KEY,
        "Content-Type": "text/plain",
      },
      body: testContent,
    });

    expect(uploadResponse.status).toBe(201);

    // Verify file is accessible via CDN
    const cdnUrl = `${BUNNY_CDN_URL}/${testKey}`;
    
    // Wait a moment for CDN propagation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const cdnResponse = await fetch(cdnUrl);
    expect(cdnResponse.ok).toBe(true);
    
    const content = await cdnResponse.text();
    expect(content).toBe(testContent);

    // Clean up - delete test file
    const deleteResponse = await fetch(uploadUrl, {
      method: "DELETE",
      headers: {
        "AccessKey": BUNNY_STORAGE_API_KEY,
      },
    });

    expect(deleteResponse.status).toBe(200);
  }, 15000);
});
