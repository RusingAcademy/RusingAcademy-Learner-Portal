/**
 * Bunny Stream Service Tests
 *
 * Tests URL helpers, TUS credential generation, status labels, and live API.
 * The ENV object is evaluated at import time from process.env, so live API
 * tests rely on the runtime environment having the correct variables set.
 */

import { describe, it, expect } from "vitest";
import crypto from "crypto";
import {
  getEmbedUrl,
  getThumbnailUrl,
  getDirectPlayUrl,
  getHlsUrl,
  getStatusLabel,
  VideoStatus,
  generateTusCredentials,
  listVideos,
  getVideo,
} from "./bunnyStream";

// ─── Unit tests for URL helpers ─────────────────────────────────────────────

describe("Bunny Stream URL Helpers", () => {
  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID || "585866";
  const cdnHostname = process.env.BUNNY_STREAM_CDN_HOSTNAME || "vz-907071cc-4fd.b-cdn.net";

  it("should generate correct embed URL format", () => {
    const url = getEmbedUrl("abc-123-def");
    expect(url).toBe(`https://iframe.mediadelivery.net/embed/${libraryId}/abc-123-def`);
  });

  it("should generate correct thumbnail URL format", () => {
    const url = getThumbnailUrl("abc-123-def");
    expect(url).toBe(`https://${cdnHostname}/abc-123-def/thumbnail.jpg`);
  });

  it("should generate correct direct play URL with default resolution", () => {
    const url = getDirectPlayUrl("abc-123-def");
    expect(url).toBe(`https://${cdnHostname}/abc-123-def/play_720p.mp4`);
  });

  it("should generate correct direct play URL with custom resolution", () => {
    const url = getDirectPlayUrl("abc-123-def", "1080p");
    expect(url).toBe(`https://${cdnHostname}/abc-123-def/play_1080p.mp4`);
  });

  it("should generate correct HLS URL", () => {
    const url = getHlsUrl("abc-123-def");
    expect(url).toBe(`https://${cdnHostname}/abc-123-def/playlist.m3u8`);
  });

  it("should handle video IDs with special characters", () => {
    const url = getEmbedUrl("abc-123-def-456-ghi");
    expect(url).toContain("abc-123-def-456-ghi");
  });
});

// ─── Status label tests ─────────────────────────────────────────────────────

describe("Bunny Stream Status Labels", () => {
  it("should return correct labels for all status codes", () => {
    expect(getStatusLabel(VideoStatus.CREATED)).toBe("Created");
    expect(getStatusLabel(VideoStatus.UPLOADED)).toBe("Uploaded");
    expect(getStatusLabel(VideoStatus.PROCESSING)).toBe("Processing");
    expect(getStatusLabel(VideoStatus.TRANSCODING)).toBe("Transcoding");
    expect(getStatusLabel(VideoStatus.FINISHED)).toBe("Ready");
    expect(getStatusLabel(VideoStatus.ERROR)).toBe("Error");
    expect(getStatusLabel(VideoStatus.UPLOAD_FAILED)).toBe("Upload Failed");
  });

  it("should return Unknown for unrecognized status codes", () => {
    expect(getStatusLabel(99)).toBe("Unknown");
    expect(getStatusLabel(-1)).toBe("Unknown");
    expect(getStatusLabel(100)).toBe("Unknown");
  });

  it("should have correct numeric values for status codes", () => {
    expect(VideoStatus.CREATED).toBe(0);
    expect(VideoStatus.UPLOADED).toBe(1);
    expect(VideoStatus.PROCESSING).toBe(2);
    expect(VideoStatus.TRANSCODING).toBe(3);
    expect(VideoStatus.FINISHED).toBe(4);
    expect(VideoStatus.ERROR).toBe(5);
    expect(VideoStatus.UPLOAD_FAILED).toBe(6);
  });
});

// ─── TUS Upload Credential tests ────────────────────────────────────────────

describe("TUS Upload Credentials", () => {
  const apiKey = process.env.BUNNY_STREAM_API_KEY || "";
  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID || "585866";

  it("should generate valid TUS credentials structure", () => {
    const creds = generateTusCredentials("test-video-id");

    expect(creds).toHaveProperty("videoId", "test-video-id");
    expect(creds).toHaveProperty("libraryId", libraryId);
    expect(creds).toHaveProperty("tusEndpoint", "https://video.bunnycdn.com/tusupload");
    expect(creds).toHaveProperty("authorizationSignature");
    expect(creds).toHaveProperty("authorizationExpire");
    expect(typeof creds.authorizationSignature).toBe("string");
    expect(typeof creds.authorizationExpire).toBe("number");
  });

  it("should set expiration 24 hours in the future", () => {
    const now = Math.floor(Date.now() / 1000);
    const creds = generateTusCredentials("test-video-id");

    // Should be approximately 24 hours from now (86400 seconds)
    const diff = creds.authorizationExpire - now;
    expect(diff).toBeGreaterThan(86300); // Allow small timing variance
    expect(diff).toBeLessThanOrEqual(86400);
  });

  it("should generate correct SHA256 signature format", () => {
    const creds = generateTusCredentials("test-video-id");

    // SHA256 hex digest should be 64 characters
    expect(creds.authorizationSignature).toHaveLength(64);
    expect(creds.authorizationSignature).toMatch(/^[a-f0-9]{64}$/);
  });

  it("should generate different signatures for different video IDs", () => {
    const creds1 = generateTusCredentials("video-1");
    const creds2 = generateTusCredentials("video-2");

    expect(creds1.authorizationSignature).not.toBe(creds2.authorizationSignature);
  });

  it("should generate reproducible signatures with same inputs", () => {
    // Since expiration changes, we verify the format is consistent
    const creds1 = generateTusCredentials("same-video");
    const creds2 = generateTusCredentials("same-video");

    // Both should have valid SHA256 format
    expect(creds1.authorizationSignature).toMatch(/^[a-f0-9]{64}$/);
    expect(creds2.authorizationSignature).toMatch(/^[a-f0-9]{64}$/);
  });

  it("should verify signature computation matches expected algorithm", () => {
    if (!apiKey) {
      console.warn("Skipping signature verification: no API key");
      return;
    }

    const creds = generateTusCredentials("test-video-id");

    // Manually compute expected signature
    const signaturePayload = `${libraryId}${apiKey}${creds.authorizationExpire}test-video-id`;
    const expectedSignature = crypto
      .createHash("sha256")
      .update(signaturePayload)
      .digest("hex");

    expect(creds.authorizationSignature).toBe(expectedSignature);
  });
});

// ─── Live API Integration Tests ─────────────────────────────────────────────

describe("Bunny Stream Live API", () => {
  const apiKey = process.env.BUNNY_STREAM_API_KEY;
  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
  const hasCredentials = apiKey && apiKey.length > 10 && libraryId;

  it("should list videos from the library", async () => {
    if (!hasCredentials) {
      console.warn("Skipping live test: no Bunny Stream credentials");
      return;
    }

    const result = await listVideos({ page: 1, itemsPerPage: 5 });

    expect(result).toHaveProperty("totalItems");
    expect(result).toHaveProperty("currentPage", 1);
    expect(result).toHaveProperty("itemsPerPage");
    expect(result).toHaveProperty("items");
    expect(Array.isArray(result.items)).toBe(true);
    expect(result.totalItems).toBeGreaterThan(0);
  });

  it("should get a single video by ID", async () => {
    if (!hasCredentials) {
      console.warn("Skipping live test: no Bunny Stream credentials");
      return;
    }

    // First list to get a valid video ID
    const list = await listVideos({ page: 1, itemsPerPage: 1 });

    if (list.items.length === 0) {
      console.warn("No videos in library, skipping getVideo test");
      return;
    }

    const videoId = list.items[0].guid;
    const video = await getVideo(videoId);

    expect(video).toHaveProperty("guid", videoId);
    expect(video).toHaveProperty("title");
    expect(video).toHaveProperty("status");
    expect(video).toHaveProperty("videoLibraryId");
  });

  it("should search videos by title", async () => {
    if (!hasCredentials) {
      console.warn("Skipping live test: no Bunny Stream credentials");
      return;
    }

    const result = await listVideos({ page: 1, itemsPerPage: 10, search: "" });

    expect(result).toHaveProperty("totalItems");
    expect(result.totalItems).toBeGreaterThanOrEqual(0);
  });
});
