import { eq, desc, and, sql, like, or, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  coachProfiles, 
  learnerProfiles,
  reviews,
  sessions,
  conversations,
  messages,
  aiSessions,
  InsertCoachProfile,
  InsertLearnerProfile,
  commissionTiers,
  coachCommissions,
  referralLinks,
  referralTracking,
  payoutLedger,
  coachPayouts,
  platformSettings,
  InsertCommissionTier,
  InsertCoachCommission,
  InsertReferralLink,
  InsertPayoutLedger,
  InsertCoachPayout,
  coachAvailability,
  InsertCoachAvailability,
  InsertReview,
  notifications,
  InsertNotification,
  coachInvitations,
  InsertCoachInvitation,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================================================
// USER QUERIES
// ============================================================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// COACH QUERIES
// ============================================================================

export interface CoachFilters {
  language?: "french" | "english" | "both";
  specializations?: string[];
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

export async function getApprovedCoaches(filters: CoachFilters = {}) {
  console.log('[DB] getApprovedCoaches called with filters:', JSON.stringify(filters));
  
  try {
    const db = await getDb();
    if (!db) {
      console.log('[DB] ERROR: Database connection is null!');
      return [];
    }
    console.log('[DB] Database connection established');

    // SOLUTION: Query ALL approved coaches first, then filter in JavaScript
    // This bypasses any Drizzle boolean comparison issues
    const query = db
      .select({
        coach: coachProfiles,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(coachProfiles)
      .innerJoin(users, eq(coachProfiles.userId, users.id))
      .where(eq(coachProfiles.status, "approved"))
      .orderBy(desc(coachProfiles.averageRating))
      .limit(100); // Get more to filter

    console.log('[DB] Executing query...');
    const allApproved = await query;
    console.log('[DB] Query returned', allApproved.length, 'approved coaches');
    
    // Filter by profileComplete in JavaScript (bypasses Drizzle boolean issues)
    let results = allApproved.filter(r => {
      const pc = r.coach.profileComplete;
      // Handle both boolean true and number 1
      return pc === true || (pc as any) === 1 || (pc as any) === '1';
    });
    console.log('[DB] After profileComplete filter:', results.length, 'coaches');

    // Apply additional filters
    if (filters.language && filters.language !== "both") {
      results = results.filter(r => 
        r.coach.languages === filters.language || r.coach.languages === "both"
      );
    }

    if (filters.minPrice) {
      results = results.filter(r => 
        (r.coach.hourlyRate || 0) >= filters.minPrice!
      );
    }

    if (filters.maxPrice) {
      results = results.filter(r => 
        (r.coach.hourlyRate || 0) <= filters.maxPrice!
      );
    }

    // Apply pagination
    const offset = filters.offset || 0;
    const limit = filters.limit || 20;
    const paginatedResults = results.slice(offset, offset + limit);
    
    console.log('[DB] Final result count:', paginatedResults.length);
    return paginatedResults;
  } catch (error) {
    console.error('[DB] ERROR in getApprovedCoaches:', error);
    return [];
  }
}

export async function getCoachBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select({
      coach: coachProfiles,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(coachProfiles)
    .innerJoin(users, eq(coachProfiles.userId, users.id))
    .where(eq(coachProfiles.slug, slug))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getCoachByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(coachProfiles)
    .where(eq(coachProfiles.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createCoachProfile(data: InsertCoachProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(coachProfiles).values(data);
  return result;
}

export async function updateCoachProfile(id: number, data: Partial<InsertCoachProfile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(coachProfiles).set(data).where(eq(coachProfiles.id, id));
  
  // Recalculate profile completeness after update
  await recalculateProfileComplete(id);
}

/**
 * Calculate if a coach profile is complete based on checklist items
 */
export async function recalculateProfileComplete(coachId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const [coach] = await db
    .select()
    .from(coachProfiles)
    .where(eq(coachProfiles.id, coachId))
    .limit(1);

  if (!coach) return false;

  // Check all required fields for profile completeness
  const hasBio = !!coach.bio && coach.bio.length >= 50;
  const hasHeadline = !!coach.headline && coach.headline.length >= 10;
  const hasPhoto = !!coach.photoUrl;
  const hasVideo = !!coach.videoUrl;
  const hasPricing = (coach.hourlyRate ?? 0) > 0;
  const hasSpecializations = !!coach.specializations && Object.keys(coach.specializations as object).length > 0;
  const hasStripe = coach.stripeOnboarded === true;
  
  // Check availability
  const availability = await db
    .select()
    .from(coachAvailability)
    .where(eq(coachAvailability.coachId, coachId))
    .limit(1);
  const hasAvailability = availability.length > 0;

  // Profile is complete if all required items are checked
  const isComplete = hasBio && hasHeadline && hasPhoto && hasPricing && hasSpecializations && hasAvailability && hasStripe;

  // Update the profileComplete field
  await db
    .update(coachProfiles)
    .set({ profileComplete: isComplete })
    .where(eq(coachProfiles.id, coachId));

  return isComplete;
}

/**
 * Get profile completion status for a coach
 */
export async function getProfileCompletionStatus(coachId: number) {
  const db = await getDb();
  if (!db) return null;

  const [coach] = await db
    .select()
    .from(coachProfiles)
    .where(eq(coachProfiles.id, coachId))
    .limit(1);

  if (!coach) return null;

  // Check availability
  const availability = await db
    .select()
    .from(coachAvailability)
    .where(eq(coachAvailability.coachId, coachId))
    .limit(1);

  return {
    hasBio: !!coach.bio && coach.bio.length >= 50,
    hasHeadline: !!coach.headline && coach.headline.length >= 10,
    hasPhoto: !!coach.photoUrl,
    hasVideo: !!coach.videoUrl,
    hasPricing: (coach.hourlyRate ?? 0) > 0,
    hasSpecializations: !!coach.specializations && Object.keys(coach.specializations as object).length > 0,
    hasAvailability: availability.length > 0,
    hasStripe: coach.stripeOnboarded === true,
    isComplete: coach.profileComplete ?? false,
  };
}

export async function getCoachReviews(coachId: number, limit = 10) {
  const db = await getDb();
  if (!db) return [];

  try {
    const results = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        sleAchievement: reviews.sleAchievement,
        coachResponse: reviews.coachResponse,
        createdAt: reviews.createdAt,
        learnerName: users.name,
      })
      .from(reviews)
      .innerJoin(learnerProfiles, eq(reviews.learnerId, learnerProfiles.id))
      .innerJoin(users, eq(learnerProfiles.userId, users.id))
      .where(and(eq(reviews.coachId, coachId), eq(reviews.isVisible, true)))
      .orderBy(desc(reviews.createdAt))
      .limit(limit);
    
    return results;
  } catch (error) {
    // Table may not exist yet - return empty array
    console.warn("[DB] getCoachReviews error (table may not exist):", error);
    return [];
  }
}

// Create a new review
export async function createReview(data: InsertReview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(reviews).values(data);
  
  // Update coach's average rating
  await updateCoachAverageRating(data.coachId);
  
  return result;
}

// Check if learner can review a coach (must have completed session)
export async function canLearnerReviewCoach(learnerId: number, coachId: number) {
  const db = await getDb();
  if (!db) return { canReview: false, reason: "Database not available" };

  // Check if learner has a completed session with this coach
  const completedSessions = await db
    .select({ id: sessions.id })
    .from(sessions)
    .where(and(
      eq(sessions.learnerId, learnerId),
      eq(sessions.coachId, coachId),
      eq(sessions.status, "completed")
    ))
    .limit(1);

  if (completedSessions.length === 0) {
    return { canReview: false, reason: "You must complete a session with this coach before leaving a review" };
  }

  // Check if learner already reviewed this coach
  const existingReview = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(and(
      eq(reviews.learnerId, learnerId),
      eq(reviews.coachId, coachId)
    ))
    .limit(1);

  if (existingReview.length > 0) {
    return { canReview: false, reason: "You have already reviewed this coach", existingReviewId: existingReview[0].id };
  }

  // Get the most recent completed session for the review
  const recentSession = await db
    .select({ id: sessions.id })
    .from(sessions)
    .where(and(
      eq(sessions.learnerId, learnerId),
      eq(sessions.coachId, coachId),
      eq(sessions.status, "completed")
    ))
    .orderBy(desc(sessions.scheduledAt))
    .limit(1);

  return { canReview: true, sessionId: recentSession[0]?.id };
}

// Update coach's average rating after a new review
export async function updateCoachAverageRating(coachId: number) {
  const db = await getDb();
  if (!db) return;

  try {
    const [stats] = await db
      .select({
        avgRating: sql<number>`AVG(${reviews.rating})`,
        totalReviews: sql<number>`COUNT(*)`,
      })
      .from(reviews)
      .where(and(eq(reviews.coachId, coachId), eq(reviews.isVisible, true)));

    if (stats) {
      await db
        .update(coachProfiles)
        .set({
          averageRating: stats.avgRating ? stats.avgRating.toFixed(2) : "0.00",
          totalReviews: stats.totalReviews || 0,
        })
        .where(eq(coachProfiles.id, coachId));
    }
  } catch (error) {
    // Table may not exist yet - skip silently
    console.warn("[DB] updateCoachAverageRating error (table may not exist):", error);
  }
}

// Get learner's review for a specific coach
export async function getLearnerReviewForCoach(learnerId: number, coachId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(reviews)
    .where(and(
      eq(reviews.learnerId, learnerId),
      eq(reviews.coachId, coachId)
    ))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

// Update an existing review
export async function updateReview(reviewId: number, data: { rating?: number; comment?: string; sleAchievement?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get the review to find the coachId
  const [existingReview] = await db
    .select({ coachId: reviews.coachId })
    .from(reviews)
    .where(eq(reviews.id, reviewId));

  await db.update(reviews).set(data).where(eq(reviews.id, reviewId));

  // Update coach's average rating
  if (existingReview) {
    await updateCoachAverageRating(existingReview.coachId);
  }
}

export async function getCoachStats(coachId: number) {
  const db = await getDb();
  if (!db) return null;

  const [reviewStats] = await db
    .select({
      totalReviews: sql<number>`COUNT(*)`,
      avgRating: sql<number>`AVG(${reviews.rating})`,
    })
    .from(reviews)
    .where(eq(reviews.coachId, coachId));

  const [sessionStats] = await db
    .select({
      totalSessions: sql<number>`COUNT(*)`,
      completedSessions: sql<number>`SUM(CASE WHEN ${sessions.status} = 'completed' THEN 1 ELSE 0 END)`,
    })
    .from(sessions)
    .where(eq(sessions.coachId, coachId));

  return {
    totalReviews: reviewStats?.totalReviews || 0,
    avgRating: reviewStats?.avgRating || 0,
    totalSessions: sessionStats?.totalSessions || 0,
    completedSessions: sessionStats?.completedSessions || 0,
  };
}

// ============================================================================
// LEARNER QUERIES
// ============================================================================

export async function getLearnerByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(learnerProfiles)
    .where(eq(learnerProfiles.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createLearnerProfile(data: InsertLearnerProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(learnerProfiles).values(data);
  return result;
}

export async function updateLearnerProfile(id: number, data: Partial<InsertLearnerProfile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(learnerProfiles).set(data).where(eq(learnerProfiles.id, id));
}

// ============================================================================
// SESSION QUERIES
// ============================================================================

export async function getUpcomingSessions(userId: number, role: "coach" | "learner", limit = 10) {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();

  if (role === "coach") {
    const coach = await getCoachByUserId(userId);
    if (!coach) return [];

    return await db
      .select({
        session: sessions,
        learner: {
          id: users.id,
          name: users.name,
        },
      })
      .from(sessions)
      .innerJoin(learnerProfiles, eq(sessions.learnerId, learnerProfiles.id))
      .innerJoin(users, eq(learnerProfiles.userId, users.id))
      .where(
        and(
          eq(sessions.coachId, coach.id),
          gte(sessions.scheduledAt, now),
          eq(sessions.status, "confirmed")
        )
      )
      .orderBy(sessions.scheduledAt)
      .limit(limit);
  } else {
    const learner = await getLearnerByUserId(userId);
    if (!learner) return [];

    return await db
      .select({
        session: sessions,
        coach: {
          id: users.id,
          name: users.name,
        },
      })
      .from(sessions)
      .innerJoin(coachProfiles, eq(sessions.coachId, coachProfiles.id))
      .innerJoin(users, eq(coachProfiles.userId, users.id))
      .where(
        and(
          eq(sessions.learnerId, learner.id),
          gte(sessions.scheduledAt, now),
          eq(sessions.status, "confirmed")
        )
      )
      .orderBy(sessions.scheduledAt)
      .limit(limit);
  }
}

// Get latest session for a learner (for booking confirmation)
export async function getLatestSessionForLearner(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const learner = await getLearnerByUserId(userId);
  if (!learner) return null;

  const result = await db
    .select({
      session: sessions,
      coach: {
        id: coachProfiles.id,
        name: users.name,
        photoUrl: coachProfiles.photoUrl,
      },
    })
    .from(sessions)
    .innerJoin(coachProfiles, eq(sessions.coachId, coachProfiles.id))
    .innerJoin(users, eq(coachProfiles.userId, users.id))
    .where(eq(sessions.learnerId, learner.id))
    .orderBy(desc(sessions.createdAt))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

// ============================================================================
// AI SESSION QUERIES
// ============================================================================

export async function createAiSession(data: {
  learnerId: number;
  sessionType: "practice" | "placement" | "simulation";
  language: "french" | "english";
  targetLevel?: "a" | "b" | "c";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(aiSessions).values({
    ...data,
    status: "in_progress",
  });

  return result;
}

export async function updateAiSession(id: number, data: {
  status?: "in_progress" | "completed" | "abandoned";
  endedAt?: Date;
  duration?: number;
  transcript?: string;
  feedback?: string;
  placementResult?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(aiSessions).set(data).where(eq(aiSessions.id, id));
}

export async function getLearnerAiSessions(learnerId: number, limit = 10) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(aiSessions)
    .where(eq(aiSessions.learnerId, learnerId))
    .orderBy(desc(aiSessions.createdAt))
    .limit(limit);
}


// ============================================================================
// COMMISSION & PAYOUT QUERIES
// ============================================================================

// Commission Tiers
export async function getCommissionTiers() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(commissionTiers)
    .where(eq(commissionTiers.isActive, true))
    .orderBy(commissionTiers.priority);
}

export async function getCommissionTierById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(commissionTiers)
    .where(eq(commissionTiers.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createCommissionTier(data: InsertCommissionTier) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(commissionTiers).values(data);
}

export async function updateCommissionTier(id: number, data: Partial<InsertCommissionTier>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(commissionTiers).set(data).where(eq(commissionTiers.id, id));
}

// Coach Commission Assignments
export async function getCoachCommission(coachId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select({
      commission: coachCommissions,
      tier: commissionTiers,
    })
    .from(coachCommissions)
    .innerJoin(commissionTiers, eq(coachCommissions.tierId, commissionTiers.id))
    .where(eq(coachCommissions.coachId, coachId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createCoachCommission(data: InsertCoachCommission) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(coachCommissions).values(data);
}

export async function updateCoachCommission(coachId: number, data: Partial<InsertCoachCommission>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(coachCommissions).set(data).where(eq(coachCommissions.coachId, coachId));
}

// Calculate commission rate for a coach based on tier and hours
export async function calculateCommissionRate(coachId: number, isTrialSession: boolean): Promise<{
  commissionBps: number;
  tierId: number | null;
  referralLinkId: number | null;
}> {
  // Trial sessions = 0% commission
  if (isTrialSession) {
    return { commissionBps: 0, tierId: null, referralLinkId: null };
  }

  const db = await getDb();
  if (!db) {
    // Default to 26% if database unavailable
    return { commissionBps: 2600, tierId: null, referralLinkId: null };
  }

  // Get coach's commission assignment
  const coachComm = await getCoachCommission(coachId);
  
  if (coachComm) {
    // Use override if set, otherwise use tier rate
    const rate = coachComm.commission.overrideCommissionBps ?? coachComm.tier.commissionBps;
    return {
      commissionBps: rate,
      tierId: coachComm.tier.id,
      referralLinkId: null,
    };
  }

  // No assignment - use default standard tier (highest commission)
  const tiers = await getCommissionTiers();
  const standardTier = tiers.find(t => t.tierType === "standard" && t.minHours === 0);
  
  return {
    commissionBps: standardTier?.commissionBps ?? 2600,
    tierId: standardTier?.id ?? null,
    referralLinkId: null,
  };
}

// Check if learner was referred and get discount
export async function getReferralDiscount(learnerId: number, coachId: number): Promise<{
  hasReferral: boolean;
  discountBps: number;
  referralLinkId: number | null;
}> {
  const db = await getDb();
  if (!db) return { hasReferral: false, discountBps: 0, referralLinkId: null };

  // Check if learner has active referral from this coach
  const result = await db
    .select({
      tracking: referralTracking,
      link: referralLinks,
    })
    .from(referralTracking)
    .innerJoin(referralLinks, eq(referralTracking.referralLinkId, referralLinks.id))
    .where(
      and(
        eq(referralTracking.learnerId, learnerId),
        eq(referralLinks.coachId, coachId),
        eq(referralLinks.isActive, true)
      )
    )
    .limit(1);

  if (result.length === 0) {
    return { hasReferral: false, discountBps: 0, referralLinkId: null };
  }

  return {
    hasReferral: true,
    discountBps: result[0].link.discountCommissionBps ?? 500,
    referralLinkId: result[0].link.id,
  };
}

// Referral Links
export async function getCoachReferralLink(coachId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(referralLinks)
    .where(and(eq(referralLinks.coachId, coachId), eq(referralLinks.isActive, true)))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createReferralLink(data: InsertReferralLink) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(referralLinks).values(data);
}

export async function getReferralLinkByCode(code: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(referralLinks)
    .where(and(eq(referralLinks.code, code), eq(referralLinks.isActive, true)))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function incrementReferralClick(linkId: number) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(referralLinks)
    .set({ clickCount: sql`${referralLinks.clickCount} + 1` })
    .where(eq(referralLinks.id, linkId));
}

// Payout Ledger
export async function createPayoutLedgerEntry(data: InsertPayoutLedger) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(payoutLedger).values(data);
}

export async function getCoachPayoutLedger(coachId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(payoutLedger)
    .where(eq(payoutLedger.coachId, coachId))
    .orderBy(desc(payoutLedger.createdAt))
    .limit(limit);
}

export async function getCoachEarningsSummary(coachId: number): Promise<{
  totalGross: number;
  totalFees: number;
  totalNet: number;
  pendingPayout: number;
  sessionCount: number;
}> {
  const db = await getDb();
  if (!db) {
    return { totalGross: 0, totalFees: 0, totalNet: 0, pendingPayout: 0, sessionCount: 0 };
  }

  const [stats] = await db
    .select({
      totalGross: sql<number>`COALESCE(SUM(CASE WHEN ${payoutLedger.transactionType} = 'session_payment' THEN ${payoutLedger.grossAmount} ELSE 0 END), 0)`,
      totalFees: sql<number>`COALESCE(SUM(CASE WHEN ${payoutLedger.transactionType} = 'platform_fee' THEN ${payoutLedger.platformFee} ELSE 0 END), 0)`,
      totalNet: sql<number>`COALESCE(SUM(CASE WHEN ${payoutLedger.transactionType} = 'coach_payout' THEN ${payoutLedger.netAmount} ELSE 0 END), 0)`,
      pendingPayout: sql<number>`COALESCE(SUM(CASE WHEN ${payoutLedger.status} = 'pending' THEN ${payoutLedger.netAmount} ELSE 0 END), 0)`,
      sessionCount: sql<number>`COUNT(DISTINCT ${payoutLedger.sessionId})`,
    })
    .from(payoutLedger)
    .where(eq(payoutLedger.coachId, coachId));

  return {
    totalGross: stats?.totalGross ?? 0,
    totalFees: stats?.totalFees ?? 0,
    totalNet: stats?.totalNet ?? 0,
    pendingPayout: stats?.pendingPayout ?? 0,
    sessionCount: stats?.sessionCount ?? 0,
  };
}

// Coach Payouts (aggregated)
export async function getCoachPayoutHistory(coachId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(coachPayouts)
    .where(eq(coachPayouts.coachId, coachId))
    .orderBy(desc(coachPayouts.periodEnd))
    .limit(limit);
}

export async function createCoachPayout(data: InsertCoachPayout) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(coachPayouts).values(data);
}

// Platform Settings
export async function getPlatformSetting(key: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(platformSettings)
    .where(eq(platformSettings.key, key))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function upsertPlatformSetting(key: string, value: unknown, description?: string, updatedBy?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .insert(platformSettings)
    .values({ key, value, description, updatedBy })
    .onDuplicateKeyUpdate({
      set: { value, description, updatedBy },
    });
}

// Seed default commission tiers
export async function seedDefaultCommissionTiers() {
  const db = await getDb();
  if (!db) return;

  const existingTiers = await getCommissionTiers();
  if (existingTiers.length > 0) return; // Already seeded

  // Verified SLE Coach tier (15%)
  await createCommissionTier({
    name: "Verified SLE Coach",
    tierType: "verified_sle",
    commissionBps: 1500,
    minHours: 0,
    maxHours: null,
    priority: 1,
    isActive: true,
  });

  // Standard tiers (26% → 15% based on volume)
  const standardTiers = [
    { name: "Standard - Tier 1 (0-10 hours)", minHours: 0, maxHours: 10, commissionBps: 2600, priority: 10 },
    { name: "Standard - Tier 2 (10-30 hours)", minHours: 10, maxHours: 30, commissionBps: 2200, priority: 11 },
    { name: "Standard - Tier 3 (30-60 hours)", minHours: 30, maxHours: 60, commissionBps: 1900, priority: 12 },
    { name: "Standard - Tier 4 (60-100 hours)", minHours: 60, maxHours: 100, commissionBps: 1700, priority: 13 },
    { name: "Standard - Tier 5 (100+ hours)", minHours: 100, maxHours: null, commissionBps: 1500, priority: 14 },
  ];

  for (const tier of standardTiers) {
    await createCommissionTier({
      ...tier,
      tierType: "standard",
      isActive: true,
    });
  }

  // Referral tier (5% default)
  await createCommissionTier({
    name: "Referral Discount",
    tierType: "referral",
    commissionBps: 500,
    minHours: 0,
    maxHours: null,
    priority: 100,
    isActive: true,
  });
}


// ============================================================================
// COACH AVAILABILITY QUERIES
// ============================================================================

export async function getCoachAvailability(coachId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(coachAvailability)
    .where(and(eq(coachAvailability.coachId, coachId), eq(coachAvailability.isActive, true)))
    .orderBy(coachAvailability.dayOfWeek, coachAvailability.startTime);
}

export async function setCoachAvailability(coachId: number, slots: Omit<InsertCoachAvailability, "coachId">[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Delete existing availability for this coach
  await db.delete(coachAvailability).where(eq(coachAvailability.coachId, coachId));

  // Insert new availability slots
  if (slots.length > 0) {
    const values = slots.map((slot) => ({
      ...slot,
      coachId,
    }));
    await db.insert(coachAvailability).values(values);
  }
}

export async function addCoachAvailabilitySlot(data: InsertCoachAvailability) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(coachAvailability).values(data);
}

export async function removeCoachAvailabilitySlot(slotId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(coachAvailability).where(eq(coachAvailability.id, slotId));
}

export async function getAvailableTimeSlotsForDate(coachId: number, date: Date) {
  const db = await getDb();
  if (!db) return [];

  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

  // Get coach's availability for this day of week
  const availability = await db
    .select()
    .from(coachAvailability)
    .where(
      and(
        eq(coachAvailability.coachId, coachId),
        eq(coachAvailability.dayOfWeek, dayOfWeek),
        eq(coachAvailability.isActive, true)
      )
    );

  if (availability.length === 0) return [];

  // Get existing bookings for this date
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const existingBookings = await db
    .select({ scheduledAt: sessions.scheduledAt, duration: sessions.duration })
    .from(sessions)
    .where(
      and(
        eq(sessions.coachId, coachId),
        gte(sessions.scheduledAt, startOfDay),
        lte(sessions.scheduledAt, endOfDay),
        or(
          eq(sessions.status, "pending"),
          eq(sessions.status, "confirmed")
        )
      )
    );

  // Generate available time slots based on availability windows
  const slots: string[] = [];
  for (const window of availability) {
    const [startHour, startMin] = window.startTime.split(":").map(Number);
    const [endHour, endMin] = window.endTime.split(":").map(Number);

    // Generate hourly slots within the window
    for (let hour = startHour; hour < endHour; hour++) {
      const slotTime = `${hour.toString().padStart(2, "0")}:${startMin.toString().padStart(2, "0")}`;
      
      // Check if this slot conflicts with existing bookings
      const slotDate = new Date(date);
      slotDate.setHours(hour, startMin, 0, 0);
      
      const hasConflict = existingBookings.some((booking) => {
        const bookingStart = new Date(booking.scheduledAt);
        const bookingEnd = new Date(bookingStart.getTime() + (booking.duration || 60) * 60 * 1000);
        const slotEnd = new Date(slotDate.getTime() + 60 * 60 * 1000); // 1 hour slot
        
        return slotDate < bookingEnd && slotEnd > bookingStart;
      });

      if (!hasConflict) {
        // Format as "9:00 AM" or "2:00 PM"
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const ampm = hour >= 12 ? "PM" : "AM";
        slots.push(`${displayHour}:${startMin.toString().padStart(2, "0")} ${ampm}`);
      }
    }
  }

  return slots;
}


// ============================================================================
// NOTIFICATION QUERIES
// ============================================================================

export async function getUserNotifications(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function getUnreadNotificationCount(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const [result] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));

  return result?.count ?? 0;
}

export async function createNotification(data: Omit<InsertNotification, "id" | "createdAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(notifications).values(data);
}

export async function markNotificationAsRead(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(notifications)
    .set({ read: true, readAt: new Date() })
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
}

export async function markAllNotificationsAsRead(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(notifications)
    .set({ read: true, readAt: new Date() })
    .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
}

export async function deleteNotification(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(notifications)
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
}


// ============================================================================
// MESSAGING QUERIES
// ============================================================================

export async function getConversations(userId: number) {
  const db = await getDb();
  if (!db) return [];

  // Get all conversations where user is a participant
  const convs = await db
    .select()
    .from(conversations)
    .where(
      or(
        eq(conversations.participant1Id, userId),
        eq(conversations.participant2Id, userId)
      )
    )
    .orderBy(desc(conversations.lastMessageAt));

  // Enrich with participant info and unread count
  const enrichedConvs = await Promise.all(
    convs.map(async (conv) => {
      const participantId = conv.participant1Id === userId 
        ? conv.participant2Id 
        : conv.participant1Id;
      
      // Get participant info
      const [participant] = await db
        .select()
        .from(users)
        .where(eq(users.id, participantId))
        .limit(1);

      // Get coach profile for photo
      const [coachProfile] = await db
        .select()
        .from(coachProfiles)
        .where(eq(coachProfiles.userId, participantId))
        .limit(1);

      // Count unread messages
      const [unreadResult] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(messages)
        .where(
          and(
            eq(messages.conversationId, conv.id),
            eq(messages.recipientId, userId),
            eq(messages.read, false)
          )
        );

      // Get last message
      const [lastMsg] = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conv.id))
        .orderBy(desc(messages.createdAt))
        .limit(1);

      return {
        id: conv.id,
        participantId,
        participantName: participant?.name || "Unknown",
        participantAvatar: coachProfile?.photoUrl || null,
        participantRole: coachProfile ? "coach" as const : "learner" as const,
        lastMessage: lastMsg?.content || "",
        lastMessageAt: conv.lastMessageAt || conv.createdAt,
        unreadCount: unreadResult?.count ?? 0,
      };
    })
  );

  return enrichedConvs;
}

export async function getMessages(conversationId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];

  // Verify user is participant
  const [conv] = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.id, conversationId),
        or(
          eq(conversations.participant1Id, userId),
          eq(conversations.participant2Id, userId)
        )
      )
    )
    .limit(1);

  if (!conv) return [];

  return await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt);
}

export async function sendMessage(conversationId: number, senderId: number, content: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get conversation to find recipient
  const [conv] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);

  if (!conv) throw new Error("Conversation not found");

  const recipientId = conv.participant1Id === senderId 
    ? conv.participant2Id 
    : conv.participant1Id;

  // Insert message
  const result = await db
    .insert(messages)
    .values({
      conversationId,
      senderId,
      recipientId,
      content,
    });

  // Get the inserted message
  const insertId = (result as unknown as { insertId: number }).insertId;
  const [msg] = await db
    .select()
    .from(messages)
    .where(eq(messages.id, insertId))
    .limit(1);

  // Update conversation last message time
  await db
    .update(conversations)
    .set({ lastMessageAt: new Date() })
    .where(eq(conversations.id, conversationId));

  return msg;
}

export async function markMessagesAsRead(conversationId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(messages)
    .set({ read: true, readAt: new Date() })
    .where(
      and(
        eq(messages.conversationId, conversationId),
        eq(messages.recipientId, userId),
        eq(messages.read, false)
      )
    );
}

export async function startConversation(userId: number, participantId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if conversation already exists
  const [existingConv] = await db
    .select()
    .from(conversations)
    .where(
      or(
        and(
          eq(conversations.participant1Id, userId),
          eq(conversations.participant2Id, participantId)
        ),
        and(
          eq(conversations.participant1Id, participantId),
          eq(conversations.participant2Id, userId)
        )
      )
    )
    .limit(1);

  if (existingConv) {
    return existingConv;
  }

  // Create new conversation
  const result = await db
    .insert(conversations)
    .values({
      participant1Id: userId,
      participant2Id: participantId,
    });

  // Get the inserted conversation
  const insertId = (result as unknown as { insertId: number }).insertId;
  const [newConv] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, insertId))
    .limit(1);

  return newConv;
}


// ============================================================================
// COACH INVITATION QUERIES
// ============================================================================

/**
 * Generate a secure random token for coach invitations
 */
function generateInvitationToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 48; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Create a new coach invitation
 */
export async function createCoachInvitation(data: {
  coachProfileId: number;
  email: string;
  createdBy: number;
  expiresInDays?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const token = generateInvitationToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (data.expiresInDays || 30)); // Default 30 days

  const result = await db.insert(coachInvitations).values({
    coachProfileId: data.coachProfileId,
    email: data.email,
    token,
    expiresAt,
    createdBy: data.createdBy,
    status: 'pending',
  });

  const insertId = (result as unknown as { insertId: number }).insertId;
  
  return {
    id: insertId,
    token,
    expiresAt,
  };
}

/**
 * Get invitation by token
 */
export async function getInvitationByToken(token: string) {
  const db = await getDb();
  if (!db) return null;

  const [invitation] = await db
    .select({
      invitation: coachInvitations,
      coach: coachProfiles,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(coachInvitations)
    .innerJoin(coachProfiles, eq(coachInvitations.coachProfileId, coachProfiles.id))
    .innerJoin(users, eq(coachProfiles.userId, users.id))
    .where(eq(coachInvitations.token, token))
    .limit(1);

  return invitation || null;
}

/**
 * Claim an invitation - link the coach profile to the claiming user
 */
export async function claimCoachInvitation(token: string, claimingUserId: number, termsAccepted: boolean = false) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get the invitation
  const invitation = await getInvitationByToken(token);
  if (!invitation) {
    throw new Error("Invitation not found");
  }

  // Check if already claimed
  if (invitation.invitation.status === 'claimed') {
    throw new Error("Invitation already claimed");
  }

  // Check if expired
  if (new Date() > invitation.invitation.expiresAt) {
    throw new Error("Invitation has expired");
  }

  // Update the coach profile to link to the claiming user and record terms acceptance
  const updateData: any = { userId: claimingUserId };
  if (termsAccepted) {
    updateData.termsAcceptedAt = new Date();
    updateData.termsVersion = '2026-01-29'; // Current terms version
  }
  
  await db
    .update(coachProfiles)
    .set(updateData)
    .where(eq(coachProfiles.id, invitation.invitation.coachProfileId));

  // Update the user's role to coach
  await db
    .update(users)
    .set({ role: 'coach' })
    .where(eq(users.id, claimingUserId));

  // Mark invitation as claimed
  await db
    .update(coachInvitations)
    .set({
      status: 'claimed',
      claimedAt: new Date(),
      claimedByUserId: claimingUserId,
    })
    .where(eq(coachInvitations.token, token));

  return {
    success: true,
    coachProfileId: invitation.invitation.coachProfileId,
    coachSlug: invitation.coach.slug,
  };
}

/**
 * Get all invitations for admin view
 */
export async function getAllCoachInvitations() {
  const db = await getDb();
  if (!db) return [];

  const invitations = await db
    .select({
      invitation: coachInvitations,
      coach: {
        id: coachProfiles.id,
        slug: coachProfiles.slug,
        headline: coachProfiles.headline,
      },
      coachUser: {
        name: users.name,
        email: users.email,
      },
    })
    .from(coachInvitations)
    .innerJoin(coachProfiles, eq(coachInvitations.coachProfileId, coachProfiles.id))
    .innerJoin(users, eq(coachProfiles.userId, users.id))
    .orderBy(desc(coachInvitations.createdAt));

  return invitations;
}

/**
 * Get pending invitations for a specific coach profile
 */
export async function getPendingInvitationForCoach(coachProfileId: number) {
  const db = await getDb();
  if (!db) return null;

  const [invitation] = await db
    .select()
    .from(coachInvitations)
    .where(
      and(
        eq(coachInvitations.coachProfileId, coachProfileId),
        eq(coachInvitations.status, 'pending')
      )
    )
    .orderBy(desc(coachInvitations.createdAt))
    .limit(1);

  return invitation || null;
}

/**
 * Revoke an invitation
 */
export async function revokeCoachInvitation(invitationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(coachInvitations)
    .set({ status: 'revoked' })
    .where(eq(coachInvitations.id, invitationId));
}

/**
 * Get all coaches with their invitation status (for admin)
 */
export async function getCoachesWithInvitationStatus() {
  const db = await getDb();
  if (!db) return [];

  // Get all coach profiles with user info
  const coaches = await db
    .select({
      coach: coachProfiles,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      },
    })
    .from(coachProfiles)
    .innerJoin(users, eq(coachProfiles.userId, users.id))
    .orderBy(coachProfiles.id);

  // Get all pending invitations
  const pendingInvitations = await db
    .select()
    .from(coachInvitations)
    .where(eq(coachInvitations.status, 'pending'));

  // Map invitations to coaches
  const invitationMap = new Map(
    pendingInvitations.map(inv => [inv.coachProfileId, inv])
  );

  return coaches.map(({ coach, user }) => ({
    ...coach,
    userName: user.name,
    userEmail: user.email,
    userRole: user.role,
    pendingInvitation: invitationMap.get(coach.id) || null,
    hasClaimedProfile: user.role === 'coach', // If user has coach role, they've claimed it
  }));
}
