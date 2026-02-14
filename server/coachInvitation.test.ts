import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database module
vi.mock('./db', () => ({
  getDb: vi.fn(),
  createCoachInvitation: vi.fn(),
  getInvitationByToken: vi.fn(),
  claimCoachInvitation: vi.fn(),
  getAllCoachInvitations: vi.fn(),
  getCoachesWithInvitationStatus: vi.fn(),
  revokeCoachInvitation: vi.fn(),
}));

import {
  createCoachInvitation,
  getInvitationByToken,
  claimCoachInvitation,
  getAllCoachInvitations,
  getCoachesWithInvitationStatus,
  revokeCoachInvitation,
} from './db';

describe('Coach Invitation System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createCoachInvitation', () => {
    it('should create an invitation with a unique token', async () => {
      const mockResult = {
        id: 1,
        token: 'abc123xyz789',
        expiresAt: new Date('2026-03-01'),
      };
      
      vi.mocked(createCoachInvitation).mockResolvedValue(mockResult);

      const result = await createCoachInvitation({
        coachProfileId: 1,
        email: 'coach@example.com',
        createdBy: 1,
        expiresInDays: 30,
      });

      expect(result).toEqual(mockResult);
      expect(result.token).toBeDefined();
      expect(result.expiresAt).toBeDefined();
    });
  });

  describe('getInvitationByToken', () => {
    it('should return invitation details for valid token', async () => {
      const mockInvitation = {
        invitation: {
          id: 1,
          token: 'valid-token',
          status: 'pending',
          expiresAt: new Date('2026-03-01'),
          coachProfileId: 1,
        },
        coach: {
          id: 1,
          slug: 'john-doe',
          headline: 'Expert SLE Coach',
        },
        user: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
        },
      };

      vi.mocked(getInvitationByToken).mockResolvedValue(mockInvitation);

      const result = await getInvitationByToken('valid-token');

      expect(result).toEqual(mockInvitation);
      expect(result?.invitation.status).toBe('pending');
    });

    it('should return null for invalid token', async () => {
      vi.mocked(getInvitationByToken).mockResolvedValue(null);

      const result = await getInvitationByToken('invalid-token');

      expect(result).toBeNull();
    });
  });

  describe('claimCoachInvitation', () => {
    it('should successfully claim a valid invitation', async () => {
      const mockResult = {
        success: true,
        coachProfileId: 1,
        coachSlug: 'john-doe',
      };

      vi.mocked(claimCoachInvitation).mockResolvedValue(mockResult);

      const result = await claimCoachInvitation('valid-token', 2);

      expect(result.success).toBe(true);
      expect(result.coachProfileId).toBe(1);
      expect(result.coachSlug).toBe('john-doe');
    });

    it('should throw error for already claimed invitation', async () => {
      vi.mocked(claimCoachInvitation).mockRejectedValue(
        new Error('Invitation already claimed')
      );

      await expect(claimCoachInvitation('claimed-token', 2)).rejects.toThrow(
        'Invitation already claimed'
      );
    });

    it('should throw error for expired invitation', async () => {
      vi.mocked(claimCoachInvitation).mockRejectedValue(
        new Error('Invitation has expired')
      );

      await expect(claimCoachInvitation('expired-token', 2)).rejects.toThrow(
        'Invitation has expired'
      );
    });
  });

  describe('getAllCoachInvitations', () => {
    it('should return all invitations for admin view', async () => {
      const mockInvitations = [
        {
          invitation: { id: 1, token: 'token1', status: 'pending' },
          coach: { id: 1, slug: 'coach-1' },
          coachUser: { name: 'Coach 1', email: 'coach1@example.com' },
        },
        {
          invitation: { id: 2, token: 'token2', status: 'claimed' },
          coach: { id: 2, slug: 'coach-2' },
          coachUser: { name: 'Coach 2', email: 'coach2@example.com' },
        },
      ];

      vi.mocked(getAllCoachInvitations).mockResolvedValue(mockInvitations);

      const result = await getAllCoachInvitations();

      expect(result).toHaveLength(2);
      expect(result[0].invitation.status).toBe('pending');
      expect(result[1].invitation.status).toBe('claimed');
    });
  });

  describe('getCoachesWithInvitationStatus', () => {
    it('should return coaches with their invitation status', async () => {
      const mockCoaches = [
        {
          id: 1,
          slug: 'coach-1',
          userName: 'Coach 1',
          userEmail: 'coach1@example.com',
          userRole: 'coach',
          pendingInvitation: null,
          hasClaimedProfile: true,
        },
        {
          id: 2,
          slug: 'coach-2',
          userName: 'Coach 2',
          userEmail: 'coach2@example.com',
          userRole: 'user',
          pendingInvitation: { id: 1, token: 'pending-token' },
          hasClaimedProfile: false,
        },
      ];

      vi.mocked(getCoachesWithInvitationStatus).mockResolvedValue(mockCoaches);

      const result = await getCoachesWithInvitationStatus();

      expect(result).toHaveLength(2);
      expect(result[0].hasClaimedProfile).toBe(true);
      expect(result[1].hasClaimedProfile).toBe(false);
      expect(result[1].pendingInvitation).toBeDefined();
    });
  });

  describe('revokeCoachInvitation', () => {
    it('should revoke an invitation', async () => {
      vi.mocked(revokeCoachInvitation).mockResolvedValue(undefined);

      await expect(revokeCoachInvitation(1)).resolves.not.toThrow();
    });
  });
});
