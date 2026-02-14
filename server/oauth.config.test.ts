/**
 * OAuth Configuration Test
 * Validates that OAuth environment variables are properly configured
 */

import { describe, it, expect } from 'vitest';

describe('OAuth Configuration', () => {
  describe('Google OAuth', () => {
    it('should have GOOGLE_CLIENT_ID configured', () => {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      expect(clientId).toBeDefined();
      expect(clientId).not.toBe('');
      expect(clientId).toMatch(/^[0-9]+-[a-z0-9]+\.apps\.googleusercontent\.com$/);
    });

    it('should have GOOGLE_CLIENT_SECRET configured', () => {
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      expect(clientSecret).toBeDefined();
      expect(clientSecret).not.toBe('');
      expect(clientSecret).toMatch(/^GOCSPX-/);
    });
  });

  describe('Microsoft OAuth', () => {
    it('should have MICROSOFT_CLIENT_ID configured', () => {
      const clientId = process.env.MICROSOFT_CLIENT_ID;
      expect(clientId).toBeDefined();
      expect(clientId).not.toBe('');
      // Microsoft Client IDs are UUIDs
      expect(clientId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('should have MICROSOFT_CLIENT_SECRET configured', () => {
      const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
      expect(clientSecret).toBeDefined();
      expect(clientSecret).not.toBe('');
      // Microsoft secrets typically start with specific patterns
      expect(clientSecret!.length).toBeGreaterThan(10);
    });
  });
});
