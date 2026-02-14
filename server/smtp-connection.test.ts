/**
 * SMTP Connection Verification Test
 * 
 * This test verifies that the SMTP credentials are correctly configured
 * and can establish a connection to the mail server.
 */

import { describe, it, expect } from "vitest";
import { verifyEmailConnection, getEmailServiceStatus } from "./email-service";

describe("SMTP Connection Verification", () => {
  it("should have SMTP configured", () => {
    const status = getEmailServiceStatus();
    
    expect(status.configured).toBe(true);
    expect(status.provider).toBeDefined();
    console.log("SMTP Status:", status);
  });

  it("should verify SMTP connection successfully", async () => {
    const result = await verifyEmailConnection();
    
    console.log("SMTP Verification Result:", result);
    
    expect(result.connected).toBe(true);
    expect(result.error).toBeUndefined();
  }, 30000); // 30 second timeout for network operation
});
