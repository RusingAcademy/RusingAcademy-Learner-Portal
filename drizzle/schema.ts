import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, json, boolean, uniqueIndex } from "drizzle-orm/mysql-core";

// ============================================================================
// USERS TABLE (Core - Extended from template)
// ============================================================================
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  passwordHash: varchar("passwordHash", { length: 255 }), // For email/password auth
  emailVerified: boolean("emailVerified").default(false),
  emailVerifiedAt: timestamp("emailVerifiedAt"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  googleId: varchar("googleId", { length: 255 }), // Google OAuth ID
  microsoftId: varchar("microsoftId", { length: 255 }), // Microsoft OAuth ID
  role: mysqlEnum("role", ["owner", "admin", "hr_admin", "coach", "learner", "user"]).default("user").notNull(),
  roleId: int("roleId"), // Reference to roles table for RBAC
  isOwner: boolean("isOwner").default(false), // Flag for super-admin
  avatarUrl: text("avatarUrl"),
  preferredLanguage: mysqlEnum("preferredLanguage", ["en", "fr"]).default("en"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================================
// COACH PROFILES
// ============================================================================
export const coachProfiles = mysqlTable("coach_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  
  // Basic Info
  headline: varchar("headline", { length: 200 }),
  headlineFr: varchar("headlineFr", { length: 200 }),
  bio: text("bio"),
  bioFr: text("bioFr"),
  videoUrl: text("videoUrl"),
  photoUrl: text("photoUrl"),
  
  // Location
  city: varchar("city", { length: 100 }),
  province: varchar("province", { length: 50 }),
  
  // Teaching Details
  languages: mysqlEnum("languages", ["french", "english", "both"]).default("both"),
  // JSON: { oral_a: bool, oral_b: bool, oral_c: bool, written_a: bool, written_b: bool, written_c: bool, reading: bool, anxiety_coaching: bool }
  specializations: json("specializations"),
  yearsExperience: int("yearsExperience"),
  credentials: text("credentials"),
  
  // Pricing (in CAD cents)
  hourlyRate: int("hourlyRate"), // e.g., 5500 = $55.00
  trialRate: int("trialRate"), // e.g., 2500 = $25.00
  
  // Stats
  totalSessions: int("totalSessions").default(0),
  totalStudents: int("totalStudents").default(0),
  averageRating: decimal("averageRating", { precision: 3, scale: 2 }),
  totalReviews: int("totalReviews").default(0),
  successRate: int("successRate"), // percentage of students who passed SLE
  responseTimeHours: int("responseTimeHours").default(24),
  
  // Status
  status: mysqlEnum("status", ["pending", "approved", "suspended", "rejected"]).default("pending"),
  approvedAt: timestamp("approvedAt"),
  approvedBy: int("approvedBy"),
  rejectionReason: text("rejectionReason"),
  
  // Stripe Connect (future)
  stripeAccountId: varchar("stripeAccountId", { length: 100 }),
  stripeOnboarded: boolean("stripeOnboarded").default(false),
  
  // Terms & Conditions acceptance
  termsAcceptedAt: timestamp("termsAcceptedAt"),
  termsVersion: varchar("termsVersion", { length: 20 }), // e.g., "2026-01-29"
  
  // Profile Completeness
  profileComplete: boolean("profileComplete").default(false),
  
  // Calendar Integration
  calendarType: mysqlEnum("calendarType", ["internal", "calendly"]).default("internal"),
  calendlyUrl: varchar("calendlyUrl", { length: 500 }),
  calendlyEventTypeUri: varchar("calendlyEventTypeUri", { length: 500 }), // Calendly API event type URI for availability lookup
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CoachProfile = typeof coachProfiles.$inferSelect;
export type InsertCoachProfile = typeof coachProfiles.$inferInsert;

// ============================================================================
// LEARNER PROFILES
// ============================================================================
export const learnerProfiles = mysqlTable("learner_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  
  // Federal Context
  department: varchar("department", { length: 200 }),
  position: varchar("position", { length: 200 }),
  
  // Current SLE Levels: { reading: 'A'|'B'|'C'|'X', writing: 'A'|'B'|'C'|'X', oral: 'A'|'B'|'C'|'X' }
  currentLevel: json("currentLevel"),
  // Target SLE Levels: same structure
  targetLevel: json("targetLevel"),
  
  // Goals
  examDate: timestamp("examDate"),
  learningGoals: text("learningGoals"),
  primaryFocus: mysqlEnum("primaryFocus", ["oral", "written", "reading", "all"]).default("oral"),
  targetLanguage: mysqlEnum("targetLanguage", ["french", "english"]).default("french"),
  
  // Stats
  totalSessions: int("totalSessions").default(0),
  totalAiSessions: int("totalAiSessions").default(0),
  
  // Weekly Report Preferences
  weeklyReportEnabled: boolean("weeklyReportEnabled").default(true),
  weeklyReportDay: int("weeklyReportDay").default(0), // 0=Sunday, 1=Monday
  
  // Streak Tracking
  currentStreak: int("currentStreak").default(0), // Current consecutive weeks with sessions
  longestStreak: int("longestStreak").default(0), // All-time longest streak
  lastSessionWeek: varchar("lastSessionWeek", { length: 10 }), // ISO week format: "2026-W02"
  streakFreezeUsed: boolean("streakFreezeUsed").default(false), // One-time grace period
  
  // SLE Certification Tracking
  certificationDate: timestamp("certificationDate"), // Date of last SLE certification
  certificationExpiry: timestamp("certificationExpiry"), // 5 years from certification date
  certifiedLevel: json("certifiedLevel"), // { reading: 'B', writing: 'B', oral: 'C' }
  
  // Learning Velocity Tracking
  weeklyStudyHours: decimal("weeklyStudyHours", { precision: 4, scale: 1 }).default("0"), // Average hours per week
  lessonsCompleted: int("lessonsCompleted").default(0),
  quizzesPassed: int("quizzesPassed").default(0),
  lastAssessmentScore: int("lastAssessmentScore"), // 0-100
  lastAssessmentDate: timestamp("lastAssessmentDate"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LearnerProfile = typeof learnerProfiles.$inferSelect;
export type InsertLearnerProfile = typeof learnerProfiles.$inferInsert;

// ============================================================================
// COACH AVAILABILITY
// ============================================================================
export const coachAvailability = mysqlTable("coach_availability", {
  id: int("id").autoincrement().primaryKey(),
  coachId: int("coachId").notNull().references(() => coachProfiles.id),
  
  dayOfWeek: int("dayOfWeek").notNull(), // 0 = Sunday, 6 = Saturday
  startTime: varchar("startTime", { length: 5 }).notNull(), // "09:00"
  endTime: varchar("endTime", { length: 5 }).notNull(), // "17:00"
  timezone: varchar("timezone", { length: 50 }).default("America/Toronto"),
  
  isActive: boolean("isActive").default(true),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CoachAvailability = typeof coachAvailability.$inferSelect;
export type InsertCoachAvailability = typeof coachAvailability.$inferInsert;

// ============================================================================
// SESSIONS (Bookings)
// ============================================================================
export const sessions = mysqlTable("sessions", {
  id: int("id").autoincrement().primaryKey(),
  
  coachId: int("coachId").notNull().references(() => coachProfiles.id),
  learnerId: int("learnerId").notNull().references(() => learnerProfiles.id),
  packageId: int("packageId").references(() => packages.id),
  
  // Scheduling
  scheduledAt: timestamp("scheduledAt").notNull(),
  duration: int("duration").notNull().default(60), // minutes
  timezone: varchar("timezone", { length: 50 }).default("America/Toronto"),
  
  // Session Details
  sessionType: mysqlEnum("sessionType", ["trial", "single", "package"]).default("single"),
  focusArea: mysqlEnum("focusArea", ["oral_a", "oral_b", "oral_c", "written", "reading", "general"]).default("general"),
  learnerNotes: text("learnerNotes"), // Pre-session notes from learner
  
  // Status
  status: mysqlEnum("status", ["pending", "confirmed", "in_progress", "completed", "cancelled", "no_show"]).default("pending"),
  cancelledBy: mysqlEnum("cancelledBy", ["learner", "coach", "admin"]),
  cancellationReason: text("cancellationReason"),
  
  // Pricing (in CAD cents)
  price: int("price").notNull(),
  
  // Video
  meetingUrl: text("meetingUrl"),
  
  // Post-session
  coachNotes: text("coachNotes"),
  completedAt: timestamp("completedAt"),
  cancelledAt: timestamp("cancelledAt"),
  
  // Stripe
  stripePaymentId: varchar("stripePaymentId", { length: 100 }),
  
  // Calendly integration
  calendlyEventId: varchar("calendlyEventId", { length: 100 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

// ============================================================================
// PACKAGES (Session Bundles)
// ============================================================================
export const packages = mysqlTable("packages", {
  id: int("id").autoincrement().primaryKey(),
  
  learnerId: int("learnerId").notNull().references(() => learnerProfiles.id),
  coachId: int("coachId").notNull().references(() => coachProfiles.id),
  
  sessionsTotal: int("sessionsTotal").notNull(), // 5 or 10
  sessionsUsed: int("sessionsUsed").default(0),
  
  // Pricing (in CAD cents)
  priceTotal: int("priceTotal").notNull(),
  pricePerSession: int("pricePerSession").notNull(),
  
  status: mysqlEnum("status", ["active", "completed", "expired", "refunded"]).default("active"),
  expiresAt: timestamp("expiresAt"),
  
  // Payment (future)
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 100 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Package = typeof packages.$inferSelect;
export type InsertPackage = typeof packages.$inferInsert;

// ============================================================================
// REVIEWS
// ============================================================================
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  
  sessionId: int("sessionId").notNull().references(() => sessions.id),
  learnerId: int("learnerId").notNull().references(() => learnerProfiles.id),
  coachId: int("coachId").notNull().references(() => coachProfiles.id),
  
  rating: int("rating").notNull(), // 1-5
  comment: text("comment"),
  
  // SLE Achievement (optional - if learner passed after working with coach)
  sleAchievement: varchar("sleAchievement", { length: 50 }), // e.g., "Oral C", "CBC"
  
  // Coach response
  coachResponse: text("coachResponse"),
  coachRespondedAt: timestamp("coachRespondedAt"),
  
  // Moderation
  isVisible: boolean("isVisible").default(true),
  flaggedAt: timestamp("flaggedAt"),
  flagReason: text("flagReason"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

// ============================================================================
// MESSAGES
// ============================================================================
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  
  participant1Id: int("participant1Id").notNull().references(() => users.id),
  participant2Id: int("participant2Id").notNull().references(() => users.id),
  
  lastMessageAt: timestamp("lastMessageAt"),
  lastMessagePreview: varchar("lastMessagePreview", { length: 200 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  
  conversationId: int("conversationId").notNull().references(() => conversations.id),
  senderId: int("senderId").notNull().references(() => users.id),
  recipientId: int("recipientId").notNull().references(() => users.id),
  
  content: text("content").notNull(),
  
  read: boolean("read").default(false),
  readAt: timestamp("readAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// ============================================================================
// AI SESSIONS (Prof Steven AI)
// ============================================================================
export const aiSessions = mysqlTable("ai_sessions", {
  id: int("id").autoincrement().primaryKey(),
  
  learnerId: int("learnerId").notNull().references(() => learnerProfiles.id),
  
  sessionType: mysqlEnum("sessionType", ["practice", "placement", "simulation"]).notNull(),
  language: mysqlEnum("language", ["french", "english"]).notNull(),
  targetLevel: mysqlEnum("targetLevel", ["a", "b", "c"]),
  
  // Session content
  transcript: json("transcript"), // Array of { role: 'user'|'ai', content: string, timestamp: number }
  
  // Results
  score: int("score"), // 0-100
  assessedLevel: mysqlEnum("assessedLevel", ["a", "b", "c"]), // For placement tests
  feedback: json("feedback"), // { strengths: [], improvements: [], recommendations: [] }
  
  // Timing
  duration: int("duration"), // seconds
  status: mysqlEnum("status", ["in_progress", "completed", "abandoned"]).default("in_progress"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type AiSession = typeof aiSessions.$inferSelect;
export type InsertAiSession = typeof aiSessions.$inferInsert;

// ============================================================================
// FAVORITES (Learner's saved coaches)
// ============================================================================
export const favorites = mysqlTable("favorites", {
  id: int("id").autoincrement().primaryKey(),
  
  learnerId: int("learnerId").notNull().references(() => learnerProfiles.id),
  coachId: int("coachId").notNull().references(() => coachProfiles.id),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;

// ============================================================================
// COACH APPLICATIONS (For tracking application details)
// ============================================================================
export const coachApplications = mysqlTable("coach_applications", {
  id: int("id").autoincrement().primaryKey(),
  
  userId: int("userId").notNull().references(() => users.id),
  coachProfileId: int("coachProfileId").references(() => coachProfiles.id),
  
  // Personal Information
  firstName: varchar("firstName", { length: 100 }),
  lastName: varchar("lastName", { length: 100 }),
  fullName: varchar("fullName", { length: 200 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }),
  timezone: varchar("timezone", { length: 100 }),
  
  // Canadian Residency Status (required for SLE coaching eligibility)
  residencyStatus: mysqlEnum("residencyStatus", ["canadian_citizen", "permanent_resident", "work_visa", "other"]),
  residencyStatusOther: varchar("residencyStatusOther", { length: 200 }), // Details if "other" is selected
  
  // Professional Background
  education: varchar("education", { length: 200 }),
  certifications: text("certifications"),
  yearsTeaching: int("yearsTeaching"),
  sleExperience: text("sleExperience"),
  credentials: text("credentials"),
  certificateUrls: json("certificateUrls"), // Array of S3 URLs
  
  // Language Qualifications
  nativeLanguage: varchar("nativeLanguage", { length: 50 }),
  teachingLanguage: varchar("teachingLanguage", { length: 50 }),
  hasSleExperience: boolean("hasSleExperience").default(false),
  
  // Specializations (JSON)
  specializations: json("specializations"),
  
  // Pricing & Availability
  hourlyRate: int("hourlyRate"), // in dollars
  trialRate: int("trialRate"), // in dollars
  weeklyHours: int("weeklyHours"),
  
  // Profile Content
  headline: varchar("headline", { length: 200 }),
  bio: text("bio"),
  teachingPhilosophy: text("teachingPhilosophy"),
  
  // Media
  photoUrl: text("photoUrl"),
  introVideoUrl: text("introVideoUrl"),
  
  // Motivation
  whyLingueefy: text("whyLingueefy"),
  
  // Legal Consents
  termsAccepted: boolean("termsAccepted").default(false),
  privacyAccepted: boolean("privacyAccepted").default(false),
  backgroundCheckConsent: boolean("backgroundCheckConsent").default(false),
  codeOfConductAccepted: boolean("codeOfConductAccepted").default(false),
  commissionAccepted: boolean("commissionAccepted").default(false),
  digitalSignature: varchar("digitalSignature", { length: 200 }),
  
  // Status
  status: mysqlEnum("status", ["submitted", "under_review", "approved", "rejected"]).default("submitted"),
  reviewedBy: int("reviewedBy").references(() => users.id),
  reviewedAt: timestamp("reviewedAt"),
  reviewNotes: text("reviewNotes"),
  
  // Resubmission Tracking
  previousRejectionReason: text("previousRejectionReason"),
  resubmissionCount: int("resubmissionCount").default(0),
  lastResubmittedAt: timestamp("lastResubmittedAt"),
  isResubmission: boolean("isResubmission").default(false),
  parentApplicationId: int("parentApplicationId"), // References another coach_applications.id for resubmissions
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CoachApplication = typeof coachApplications.$inferSelect;
export type InsertCoachApplication = typeof coachApplications.$inferInsert;


// ============================================================================
// COMMISSION TIERS (Admin-configurable commission rules)
// ============================================================================
export const commissionTiers = mysqlTable("commission_tiers", {
  id: int("id").autoincrement().primaryKey(),
  
  // Tier identification
  name: varchar("name", { length: 100 }).notNull(), // e.g., "Verified SLE Coach", "Standard Tier 1"
  tierType: mysqlEnum("tierType", ["verified_sle", "standard", "referral"]).notNull(),
  
  // Commission percentage (stored as basis points: 1500 = 15%)
  commissionBps: int("commissionBps").notNull(),
  
  // Volume thresholds (for standard tiered commissions)
  minHours: int("minHours").default(0), // Minimum hours taught to qualify
  maxHours: int("maxHours"), // Maximum hours (null = unlimited)
  
  // Priority for rule matching (lower = higher priority)
  priority: int("priority").default(100),
  
  // Status
  isActive: boolean("isActive").default(true),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CommissionTier = typeof commissionTiers.$inferSelect;
export type InsertCommissionTier = typeof commissionTiers.$inferInsert;

// ============================================================================
// COACH COMMISSION ASSIGNMENTS (Which tier each coach is on)
// ============================================================================
export const coachCommissions = mysqlTable("coach_commissions", {
  id: int("id").autoincrement().primaryKey(),
  
  coachId: int("coachId").notNull().references(() => coachProfiles.id),
  tierId: int("tierId").notNull().references(() => commissionTiers.id),
  
  // Override commission (if different from tier default)
  overrideCommissionBps: int("overrideCommissionBps"),
  overrideReason: text("overrideReason"),
  
  // Verified SLE status
  isVerifiedSle: boolean("isVerifiedSle").default(false),
  verifiedAt: timestamp("verifiedAt"),
  verifiedBy: int("verifiedBy").references(() => users.id),
  
  // Cumulative hours taught (for tier progression)
  totalHoursTaught: decimal("totalHoursTaught", { precision: 10, scale: 2 }).default("0"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CoachCommission = typeof coachCommissions.$inferSelect;
export type InsertCoachCommission = typeof coachCommissions.$inferInsert;

// ============================================================================
// REFERRAL LINKS (Coach referral system)
// ============================================================================
export const referralLinks = mysqlTable("referral_links", {
  id: int("id").autoincrement().primaryKey(),
  
  coachId: int("coachId").notNull().references(() => coachProfiles.id),
  
  // Unique referral code
  code: varchar("code", { length: 20 }).notNull().unique(),
  
  // Referral commission discount (basis points: 500 = 5% commission instead of normal)
  discountCommissionBps: int("discountCommissionBps").default(500),
  
  // Stats
  clickCount: int("clickCount").default(0),
  signupCount: int("signupCount").default(0),
  bookingCount: int("bookingCount").default(0),
  
  // Status
  isActive: boolean("isActive").default(true),
  expiresAt: timestamp("expiresAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ReferralLink = typeof referralLinks.$inferSelect;
export type InsertReferralLink = typeof referralLinks.$inferInsert;

// ============================================================================
// REFERRAL TRACKING (Which learners came from which referral)
// ============================================================================
export const referralTracking = mysqlTable("referral_tracking", {
  id: int("id").autoincrement().primaryKey(),
  
  referralLinkId: int("referralLinkId").notNull().references(() => referralLinks.id),
  learnerId: int("learnerId").notNull().references(() => learnerProfiles.id),
  
  // Attribution window
  attributedAt: timestamp("attributedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"), // When referral attribution expires
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ReferralTracking = typeof referralTracking.$inferSelect;
export type InsertReferralTracking = typeof referralTracking.$inferInsert;

// ============================================================================
// PAYOUT LEDGER (Complete transaction history)
// ============================================================================
export const payoutLedger = mysqlTable("payout_ledger", {
  id: int("id").autoincrement().primaryKey(),
  
  // Transaction reference
  sessionId: int("sessionId").references(() => sessions.id),
  packageId: int("packageId").references(() => packages.id),
  coachId: int("coachId").notNull().references(() => coachProfiles.id),
  learnerId: int("learnerId").notNull().references(() => learnerProfiles.id),
  
  // Transaction type
  transactionType: mysqlEnum("transactionType", [
    "session_payment",    // Learner paid for session
    "platform_fee",       // Platform commission deducted
    "coach_payout",       // Coach receives payment
    "refund",             // Refund to learner
    "refund_reversal",    // Platform fee returned on refund
    "chargeback",         // Disputed payment
    "chargeback_reversal" // Chargeback resolved
  ]).notNull(),
  
  // Amounts (in CAD cents)
  grossAmount: int("grossAmount").notNull(),        // Total learner payment
  platformFee: int("platformFee").notNull(),        // Platform commission
  netAmount: int("netAmount").notNull(),            // Coach receives
  
  // Commission details
  commissionBps: int("commissionBps").notNull(),    // Commission rate applied
  commissionTierId: int("commissionTierId").references(() => commissionTiers.id),
  referralLinkId: int("referralLinkId").references(() => referralLinks.id),
  isTrialSession: boolean("isTrialSession").default(false),
  
  // Stripe references
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 100 }),
  stripeTransferId: varchar("stripeTransferId", { length: 100 }),
  stripeRefundId: varchar("stripeRefundId", { length: 100 }),
  
  // Status
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed", "reversed"]).default("pending"),
  processedAt: timestamp("processedAt"),
  failureReason: text("failureReason"),
  
  // Notes
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PayoutLedger = typeof payoutLedger.$inferSelect;
export type InsertPayoutLedger = typeof payoutLedger.$inferInsert;

// ============================================================================
// COACH PAYOUTS (Aggregated payout records)
// ============================================================================
export const coachPayouts = mysqlTable("coach_payouts", {
  id: int("id").autoincrement().primaryKey(),
  
  coachId: int("coachId").notNull().references(() => coachProfiles.id),
  
  // Payout period
  periodStart: timestamp("periodStart").notNull(),
  periodEnd: timestamp("periodEnd").notNull(),
  
  // Amounts (in CAD cents)
  grossEarnings: int("grossEarnings").notNull(),
  totalPlatformFees: int("totalPlatformFees").notNull(),
  netPayout: int("netPayout").notNull(),
  
  // Session counts
  sessionCount: int("sessionCount").notNull(),
  trialSessionCount: int("trialSessionCount").default(0),
  
  // Stripe
  stripePayoutId: varchar("stripePayoutId", { length: 100 }),
  
  // Status
  status: mysqlEnum("status", ["pending", "processing", "paid", "failed"]).default("pending"),
  paidAt: timestamp("paidAt"),
  failureReason: text("failureReason"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CoachPayout = typeof coachPayouts.$inferSelect;
export type InsertCoachPayout = typeof coachPayouts.$inferInsert;

// ============================================================================
// PLATFORM SETTINGS (Admin-configurable settings)
// ============================================================================
export const platformSettings = mysqlTable("platform_settings", {
  id: int("id").autoincrement().primaryKey(),
  
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: json("value").notNull(),
  description: text("description"),
  
  // Audit
  updatedBy: int("updatedBy").references(() => users.id),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PlatformSetting = typeof platformSettings.$inferSelect;
export type InsertPlatformSetting = typeof platformSettings.$inferInsert;


// ============================================================================
// DEPARTMENT INQUIRIES (B2B Contact Form Submissions)
// ============================================================================
export const departmentInquiries = mysqlTable("department_inquiries", {
  id: int("id").autoincrement().primaryKey(),
  
  // Contact Info
  name: varchar("name", { length: 200 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  
  // Department Info
  department: varchar("department", { length: 200 }).notNull(),
  teamSize: varchar("teamSize", { length: 50 }).notNull(), // e.g., "5-10 employees", "11-25 employees"
  
  // Inquiry Details
  message: text("message").notNull(),
  preferredPackage: varchar("preferredPackage", { length: 50 }), // e.g., "team-5", "team-10", "team-25", "custom"
  
  // Status
  status: mysqlEnum("status", ["new", "contacted", "in_progress", "converted", "closed"]).default("new"),
  assignedTo: int("assignedTo").references(() => users.id),
  
  // Follow-up
  notes: text("notes"),
  followUpDate: timestamp("followUpDate"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DepartmentInquiry = typeof departmentInquiries.$inferSelect;
export type InsertDepartmentInquiry = typeof departmentInquiries.$inferInsert;


// ============================================================================
// NOTIFICATIONS (In-app notifications for users)
// ============================================================================
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  
  // Target user
  userId: int("userId").notNull().references(() => users.id),
  
  // Notification type
  type: mysqlEnum("type", [
    "message",           // New message received
    "session_reminder",  // Upcoming session reminder
    "booking",           // New booking or booking update
    "review",            // New review received
    "system"             // System notification
  ]).notNull(),
  
  // Content
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message").notNull(),
  link: varchar("link", { length: 500 }),
  
  // Metadata (JSON for type-specific data)
  metadata: json("metadata"),
  
  // Status
  read: boolean("read").default(false),
  readAt: timestamp("readAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;


// ============================================================================
// COACH DOCUMENTS (Verification documents for credentials)
// ============================================================================
export const coachDocuments = mysqlTable("coach_documents", {
  id: int("id").autoincrement().primaryKey(),
  
  // Owner
  coachId: int("coachId").notNull().references(() => coachProfiles.id),
  applicationId: int("applicationId").references(() => coachApplications.id),
  
  // Document type
  documentType: mysqlEnum("documentType", [
    "id_proof",           // Government ID (passport, driver's license)
    "degree",             // University degree/diploma
    "teaching_cert",      // Teaching certification (TEFL, CELTA, etc.)
    "sle_results",        // Official SLE test results
    "language_cert",      // Language proficiency certificate
    "background_check",   // Criminal background check
    "other"               // Other supporting documents
  ]).notNull(),
  
  // Document details
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  
  // File storage
  fileUrl: text("fileUrl").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileSize: int("fileSize"), // in bytes
  mimeType: varchar("mimeType", { length: 100 }),
  
  // Validity
  issueDate: timestamp("issueDate"),
  expiryDate: timestamp("expiryDate"),
  issuingAuthority: varchar("issuingAuthority", { length: 200 }),
  documentNumber: varchar("documentNumber", { length: 100 }),
  
  // Verification status
  status: mysqlEnum("status", ["pending", "verified", "rejected", "expired"]).default("pending"),
  verifiedBy: int("verifiedBy").references(() => users.id),
  verifiedAt: timestamp("verifiedAt"),
  rejectionReason: text("rejectionReason"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CoachDocument = typeof coachDocuments.$inferSelect;
export type InsertCoachDocument = typeof coachDocuments.$inferInsert;

// ============================================================================
// STRIPE CONNECT ACCOUNTS (Coach payment accounts)
// ============================================================================
export const stripeConnectAccounts = mysqlTable("stripe_connect_accounts", {
  id: int("id").autoincrement().primaryKey(),
  
  coachId: int("coachId").notNull().references(() => coachProfiles.id).unique(),
  
  // Stripe account info
  stripeAccountId: varchar("stripeAccountId", { length: 100 }).notNull().unique(),
  accountType: mysqlEnum("accountType", ["express", "standard", "custom"]).default("express"),
  
  // Onboarding status
  onboardingComplete: boolean("onboardingComplete").default(false),
  chargesEnabled: boolean("chargesEnabled").default(false),
  payoutsEnabled: boolean("payoutsEnabled").default(false),
  detailsSubmitted: boolean("detailsSubmitted").default(false),
  
  // Account details (from Stripe)
  businessType: varchar("businessType", { length: 50 }),
  country: varchar("country", { length: 2 }),
  defaultCurrency: varchar("defaultCurrency", { length: 3 }),
  
  // Payout schedule
  payoutSchedule: mysqlEnum("payoutSchedule", ["daily", "weekly", "monthly"]).default("weekly"),
  payoutDay: int("payoutDay"), // 0-6 for weekly (0=Sunday), 1-28 for monthly
  
  // Verification
  requirementsCurrentlyDue: json("requirementsCurrentlyDue"),
  requirementsPastDue: json("requirementsPastDue"),
  requirementsEventuallyDue: json("requirementsEventuallyDue"),
  
  // Metadata
  lastWebhookAt: timestamp("lastWebhookAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StripeConnectAccount = typeof stripeConnectAccounts.$inferSelect;
export type InsertStripeConnectAccount = typeof stripeConnectAccounts.$inferInsert;


// ============================================================================
// COACH GALLERY PHOTOS (Multiple photos for coach profiles)
// ============================================================================
export const coachGalleryPhotos = mysqlTable("coach_gallery_photos", {
  id: int("id").autoincrement().primaryKey(),
  
  // Owner
  coachId: int("coachId").notNull().references(() => coachProfiles.id),
  
  // Photo details
  photoUrl: text("photoUrl").notNull(),
  thumbnailUrl: text("thumbnailUrl"),
  caption: varchar("caption", { length: 200 }),
  altText: varchar("altText", { length: 200 }),
  
  // Photo type/category
  photoType: mysqlEnum("photoType", [
    "profile",        // Main profile photo
    "workspace",      // Office/workspace photo
    "certificate",    // Certificates/diplomas
    "session",        // Teaching session photo
    "event",          // Event/conference photo
    "other"           // Other photos
  ]).default("other"),
  
  // Ordering
  sortOrder: int("sortOrder").default(0),
  
  // Status
  isActive: boolean("isActive").default(true),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CoachGalleryPhoto = typeof coachGalleryPhotos.$inferSelect;
export type InsertCoachGalleryPhoto = typeof coachGalleryPhotos.$inferInsert;

// ============================================================================
// PUSH SUBSCRIPTIONS (Browser push notification subscriptions)
// ============================================================================
export const pushSubscriptions = mysqlTable("push_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  
  // User
  userId: int("userId").notNull().references(() => users.id),
  
  // Push subscription data (from browser)
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),  // Public key
  auth: text("auth").notNull(),       // Auth secret
  
  // Device info
  userAgent: text("userAgent"),
  deviceName: varchar("deviceName", { length: 100 }),
  
  // Notification preferences
  enableBookings: boolean("enableBookings").default(true),
  enableMessages: boolean("enableMessages").default(true),
  enableReminders: boolean("enableReminders").default(true),
  enableMarketing: boolean("enableMarketing").default(false),
  
  // Status
  isActive: boolean("isActive").default(true),
  lastUsedAt: timestamp("lastUsedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = typeof pushSubscriptions.$inferInsert;

// ============================================================================
// SESSION NOTES (Coach notes for sessions)
// ============================================================================
export const sessionNotes = mysqlTable("session_notes", {
  id: int("id").autoincrement().primaryKey(),
  
  // Session reference
  sessionId: int("sessionId").notNull().references(() => sessions.id),
  coachId: int("coachId").notNull().references(() => coachProfiles.id),
  
  // Notes content
  notes: text("notes").notNull(),
  
  // Progress tracking
  topicsCovered: json("topicsCovered"),  // Array of topics
  areasForImprovement: json("areasForImprovement"),  // Array of areas
  homework: text("homework"),
  
  // SLE-specific feedback
  oralLevel: mysqlEnum("oralLevel", ["X", "A", "B", "C"]),
  writtenLevel: mysqlEnum("writtenLevel", ["X", "A", "B", "C"]),
  readingLevel: mysqlEnum("readingLevel", ["X", "A", "B", "C"]),
  
  // Visibility
  sharedWithLearner: boolean("sharedWithLearner").default(false),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SessionNote = typeof sessionNotes.$inferSelect;
export type InsertSessionNote = typeof sessionNotes.$inferInsert;


// ============================================================================
// COACH BADGES (Achievements and certifications)
// ============================================================================
export const coachBadges = mysqlTable("coach_badges", {
  id: int("id").autoincrement().primaryKey(),
  
  // Coach reference
  coachId: int("coachId").notNull().references(() => coachProfiles.id),
  
  // Badge type
  badgeType: mysqlEnum("badgeType", [
    "els_verified",      // Verified ELS coach
    "top_rated",         // 4.8+ average rating
    "rising_star",       // New coach with great reviews
    "sessions_50",       // 50 sessions completed
    "sessions_100",      // 100 sessions completed
    "sessions_500",      // 500 sessions completed
    "perfect_attendance", // No cancellations in 3 months
    "quick_responder",   // Responds within 2 hours
    "student_favorite",  // Most favorited coach
    "exam_success",      // High student pass rate
  ]).notNull(),
  
  // Badge details
  awardedAt: timestamp("awardedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"), // Some badges may expire
  isActive: boolean("isActive").default(true),
  
  // Metadata
  metadata: json("metadata"), // Additional data like "passRate: 95%"
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CoachBadge = typeof coachBadges.$inferSelect;
export type InsertCoachBadge = typeof coachBadges.$inferInsert;

// ============================================================================
// LEARNER FAVORITES (Saved coaches)
// ============================================================================
export const learnerFavorites = mysqlTable("learner_favorites", {
  id: int("id").autoincrement().primaryKey(),
  
  // References
  learnerId: int("learnerId").notNull().references(() => learnerProfiles.id),
  coachId: int("coachId").notNull().references(() => coachProfiles.id),
  
  // Metadata
  note: text("note"), // Personal note about why they favorited
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LearnerFavorite = typeof learnerFavorites.$inferSelect;
export type InsertLearnerFavorite = typeof learnerFavorites.$inferInsert;


// ============================================================================
// LOYALTY PROGRAM
// ============================================================================
export const loyaltyPoints = mysqlTable("loyalty_points", {
  id: int("id").autoincrement().primaryKey(),
  
  // Learner reference
  learnerId: int("learnerId").notNull().references(() => learnerProfiles.id),
  
  // Points balance
  totalPoints: int("totalPoints").default(0).notNull(),
  availablePoints: int("availablePoints").default(0).notNull(),
  lifetimePoints: int("lifetimePoints").default(0).notNull(),
  
  // Tier based on lifetime points
  tier: mysqlEnum("tier", ["bronze", "silver", "gold", "platinum"]).default("bronze").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LoyaltyPoints = typeof loyaltyPoints.$inferSelect;
export type InsertLoyaltyPoints = typeof loyaltyPoints.$inferInsert;

export const pointTransactions = mysqlTable("point_transactions", {
  id: int("id").autoincrement().primaryKey(),
  
  // Learner reference
  learnerId: int("learnerId").notNull().references(() => learnerProfiles.id),
  
  // Transaction details
  type: mysqlEnum("type", [
    "earned_booking",      // Points earned from booking a session
    "earned_review",       // Points earned from leaving a review
    "earned_referral",     // Points earned from referring a friend
    "earned_streak",       // Points earned from booking streak
    "earned_milestone",    // Points earned from reaching a milestone
    "redeemed_discount",   // Points redeemed for discount
    "redeemed_session",    // Points redeemed for free session
    "expired",             // Points expired
    "adjustment",          // Manual adjustment by admin
  ]).notNull(),
  
  points: int("points").notNull(), // Positive for earned, negative for redeemed/expired
  description: text("description"),
  
  // Reference to related entity (session, review, etc.)
  referenceType: varchar("referenceType", { length: 50 }),
  referenceId: int("referenceId"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PointTransaction = typeof pointTransactions.$inferSelect;
export type InsertPointTransaction = typeof pointTransactions.$inferInsert;

export const loyaltyRewards = mysqlTable("loyalty_rewards", {
  id: int("id").autoincrement().primaryKey(),
  
  // Reward details
  name: varchar("name", { length: 100 }).notNull(),
  nameEn: varchar("nameEn", { length: 100 }).notNull(),
  nameFr: varchar("nameFr", { length: 100 }).notNull(),
  description: text("description"),
  descriptionEn: text("descriptionEn"),
  descriptionFr: text("descriptionFr"),
  
  // Cost and type
  pointsCost: int("pointsCost").notNull(),
  rewardType: mysqlEnum("rewardType", [
    "discount_5",          // 5% discount on next session
    "discount_10",         // 10% discount on next session
    "discount_15",         // 15% discount on next session
    "discount_20",         // 20% discount on next session
    "free_trial",          // Free trial session
    "free_session",        // Free full session
    "priority_booking",    // Priority booking for 1 month
    "exclusive_coach",     // Access to exclusive coaches
  ]).notNull(),
  
  // Availability
  isActive: boolean("isActive").default(true),
  minTier: mysqlEnum("minTier", ["bronze", "silver", "gold", "platinum"]).default("bronze"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LoyaltyReward = typeof loyaltyRewards.$inferSelect;
export type InsertLoyaltyReward = typeof loyaltyRewards.$inferInsert;

export const redeemedRewards = mysqlTable("redeemed_rewards", {
  id: int("id").autoincrement().primaryKey(),
  
  // References
  learnerId: int("learnerId").notNull().references(() => learnerProfiles.id),
  rewardId: int("rewardId").notNull().references(() => loyaltyRewards.id),
  
  // Redemption details
  pointsSpent: int("pointsSpent").notNull(),
  status: mysqlEnum("status", ["active", "used", "expired"]).default("active").notNull(),
  
  // For discount rewards, store the discount code
  discountCode: varchar("discountCode", { length: 50 }),
  
  // Expiry
  expiresAt: timestamp("expiresAt"),
  usedAt: timestamp("usedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RedeemedReward = typeof redeemedRewards.$inferSelect;
export type InsertRedeemedReward = typeof redeemedRewards.$inferInsert;


// ============================================================================
// PROMO COUPONS
// ============================================================================
export const promoCoupons = mysqlTable("promo_coupons", {
  id: int("id").autoincrement().primaryKey(),
  
  // Coupon details
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  descriptionFr: text("descriptionFr"),
  
  // Discount type and value
  discountType: mysqlEnum("discountType", ["percentage", "fixed_amount", "free_trial"]).notNull(),
  discountValue: int("discountValue").notNull(), // percentage (0-100) or amount in cents
  
  // Usage limits
  maxUses: int("maxUses"), // null = unlimited
  usedCount: int("usedCount").default(0).notNull(),
  maxUsesPerUser: int("maxUsesPerUser").default(1).notNull(),
  
  // Validity
  minPurchaseAmount: int("minPurchaseAmount"), // in cents, null = no minimum
  validFrom: timestamp("validFrom").defaultNow().notNull(),
  validUntil: timestamp("validUntil"),
  
  // Restrictions
  applicableTo: mysqlEnum("applicableTo", ["all", "trial", "single", "package"]).default("all").notNull(),
  newUsersOnly: boolean("newUsersOnly").default(false).notNull(),
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  
  // Metadata
  createdBy: int("createdBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PromoCoupon = typeof promoCoupons.$inferSelect;
export type InsertPromoCoupon = typeof promoCoupons.$inferInsert;

// ============================================================================
// COUPON REDEMPTIONS
// ============================================================================
export const couponRedemptions = mysqlTable("coupon_redemptions", {
  id: int("id").autoincrement().primaryKey(),
  
  couponId: int("couponId").notNull().references(() => promoCoupons.id),
  userId: int("userId").notNull().references(() => users.id),
  sessionId: int("sessionId").references(() => sessions.id),
  
  // Discount applied
  discountAmount: int("discountAmount").notNull(), // in cents
  originalAmount: int("originalAmount").notNull(), // in cents
  finalAmount: int("finalAmount").notNull(), // in cents
  
  redeemedAt: timestamp("redeemedAt").defaultNow().notNull(),
});

export type CouponRedemption = typeof couponRedemptions.$inferSelect;
export type InsertCouponRedemption = typeof couponRedemptions.$inferInsert;

// ============================================================================
// REFERRAL INVITATIONS (Enhanced tracking)
// ============================================================================
export const referralInvitations = mysqlTable("referral_invitations", {
  id: int("id").autoincrement().primaryKey(),
  
  // Referrer info
  referrerId: int("referrerId").notNull().references(() => users.id),
  referralCode: varchar("referralCode", { length: 50 }).notNull(),
  
  // Invitation details
  inviteeEmail: varchar("inviteeEmail", { length: 320 }),
  inviteMethod: mysqlEnum("inviteMethod", ["email", "link", "social"]).default("link").notNull(),
  
  // Status tracking
  status: mysqlEnum("status", ["pending", "clicked", "registered", "converted", "expired"]).default("pending").notNull(),
  
  // Conversion tracking
  inviteeId: int("inviteeId").references(() => users.id), // Set when invitee registers
  convertedSessionId: int("convertedSessionId").references(() => sessions.id), // Set when first booking made
  
  // Rewards
  referrerRewardPoints: int("referrerRewardPoints").default(0),
  referrerRewardPaid: boolean("referrerRewardPaid").default(false),
  inviteeRewardPoints: int("inviteeRewardPoints").default(0),
  inviteeRewardPaid: boolean("inviteeRewardPaid").default(false),
  
  // Timestamps
  clickedAt: timestamp("clickedAt"),
  registeredAt: timestamp("registeredAt"),
  convertedAt: timestamp("convertedAt"),
  expiresAt: timestamp("expiresAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ReferralInvitation = typeof referralInvitations.$inferSelect;
export type InsertReferralInvitation = typeof referralInvitations.$inferInsert;


// ============================================================================
// GAMIFICATION - CHALLENGES
// ============================================================================
export const challenges = mysqlTable("challenges", {
  id: int("id").autoincrement().primaryKey(),
  
  // Challenge details
  name: varchar("name", { length: 100 }).notNull(),
  nameFr: varchar("nameFr", { length: 100 }),
  description: text("description"),
  descriptionFr: text("descriptionFr"),
  
  // Challenge type and requirements
  type: mysqlEnum("type", ["sessions", "reviews", "referrals", "streak", "first_session"]).notNull(),
  targetCount: int("targetCount").notNull(), // e.g., 3 sessions, 2 reviews
  pointsReward: int("pointsReward").notNull(),
  
  // Challenge period
  period: mysqlEnum("period", ["daily", "weekly", "monthly", "one_time"]).notNull(),
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = typeof challenges.$inferInsert;

// ============================================================================
// USER CHALLENGE PROGRESS
// ============================================================================
export const userChallenges = mysqlTable("user_challenges", {
  id: int("id").autoincrement().primaryKey(),
  
  userId: int("userId").notNull().references(() => users.id),
  challengeId: int("challengeId").notNull().references(() => challenges.id),
  
  // Progress tracking
  currentProgress: int("currentProgress").default(0).notNull(),
  targetProgress: int("targetProgress").notNull(),
  
  // Status
  status: mysqlEnum("status", ["active", "completed", "expired"]).default("active").notNull(),
  
  // Period tracking
  periodStart: timestamp("periodStart").notNull(),
  periodEnd: timestamp("periodEnd").notNull(),
  
  // Completion
  completedAt: timestamp("completedAt"),
  pointsAwarded: int("pointsAwarded"),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserChallenge = typeof userChallenges.$inferSelect;
export type InsertUserChallenge = typeof userChallenges.$inferInsert;

// ============================================================================
// IN-APP NOTIFICATIONS
// ============================================================================
export const inAppNotifications = mysqlTable("in_app_notifications", {
  id: int("id").autoincrement().primaryKey(),
  
  userId: int("userId").notNull().references(() => users.id),
  
  // Notification content
  type: mysqlEnum("type", ["message", "session", "points", "challenge", "review", "system"]).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  titleFr: varchar("titleFr", { length: 200 }),
  message: text("message").notNull(),
  messageFr: text("messageFr"),
  
  // Link to related entity
  linkType: mysqlEnum("linkType", ["session", "message", "coach", "learner", "challenge", "none"]),
  linkId: int("linkId"),
  
  // Status
  isRead: boolean("isRead").default(false).notNull(),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InAppNotification = typeof inAppNotifications.$inferSelect;
export type InsertInAppNotification = typeof inAppNotifications.$inferInsert;


// ============================================================================
// ORGANIZATIONS (Lingueefy for Organizations Mode)
// ============================================================================
export const organizations = mysqlTable("organizations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  logo: text("logoUrl"),
  domain: varchar("domain", { length: 255 }),
  
  // Contact Info
  contactName: varchar("contactName", { length: 255 }),
  contactEmail: varchar("contactEmail", { length: 320 }),
  contactPhone: varchar("contactPhone", { length: 20 }),
  
  // Organization Details
  industry: varchar("industry", { length: 100 }),
  employeeCount: int("employeeCount"),
  description: text("description"),
  
  // Admin User (creator)
  adminUserId: int("adminUserId").notNull().references(() => users.id),
  
  // Status
  status: mysqlEnum("status", ["active", "inactive", "pending", "suspended"]).default("pending"),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;

// ============================================================================
// ORGANIZATION COACHES (Associate coachs to organizations)
// ============================================================================
export const organizationCoachs = mysqlTable("organization_coachs", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  coachId: int("coachId").notNull().references(() => coachProfiles.id, { onDelete: "cascade" }),
  
  // Assignment Details
  assignedAt: timestamp("assignedAt").defaultNow().notNull(),
  assignedBy: int("assignedBy").references(() => users.id),
  
  // Status
  status: mysqlEnum("status", ["active", "inactive", "archived"]).default("active"),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OrganizationCoach = typeof organizationCoachs.$inferSelect;
export type InsertOrganizationCoach = typeof organizationCoachs.$inferInsert;

// ============================================================================
// COACHING CREDITS (Track credit balance per organization)
// ============================================================================
export const coachingCredits = mysqlTable("coaching_credits", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull().unique().references(() => organizations.id, { onDelete: "cascade" }),
  
  // Credit Balance (in number of sessions)
  totalCredits: int("totalCredits").default(0).notNull(),
  usedCredits: int("usedCredits").default(0).notNull(),
  availableCredits: int("availableCredits").default(0).notNull(),
  
  // Pricing
  creditValue: int("creditValue").default(5500).notNull(), // Default: $55 per session (in cents)
  
  // Expiration
  expiresAt: timestamp("expiresAt"),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CoachingCredit = typeof coachingCredits.$inferSelect;
export type InsertCoachingCredit = typeof coachingCredits.$inferInsert;

// ============================================================================
// CREDIT TRANSACTIONS (Log credit usage)
// ============================================================================
export const creditTransactions = mysqlTable("credit_transactions", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  
  // Transaction Details
  type: mysqlEnum("type", ["purchase", "usage", "refund", "adjustment", "expiration"]).notNull(),
  amount: int("amount").notNull(), // Number of credits
  description: text("description"),
  
  // Related Entity
  relatedSessionId: int("relatedSessionId").references(() => sessions.id),
  relatedLearner: int("relatedLearner").references(() => learnerProfiles.id),
  
  // Processed By
  processedBy: int("processedBy").references(() => users.id),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type InsertCreditTransaction = typeof creditTransactions.$inferInsert;

// ============================================================================
// ORGANIZATION MEMBERS (Track users belonging to organizations)
// ============================================================================
export const organizationMembers = mysqlTable("organization_members", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Role in Organization
  role: mysqlEnum("role", ["admin", "manager", "member", "learner"]).default("learner"),
  
  // Status
  status: mysqlEnum("status", ["active", "inactive", "invited", "archived"]).default("active"),
  
  // Metadata
  invitedAt: timestamp("invitedAt"),
  joinedAt: timestamp("joinedAt").defaultNow(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OrganizationMember = typeof organizationMembers.$inferSelect;
export type InsertOrganizationMember = typeof organizationMembers.$inferInsert;


// ============================================================================
// APPLICATION COMMENTS (Threaded comments on coach applications)
// ============================================================================
export const applicationComments = mysqlTable("application_comments", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: int("applicationId").notNull().references(() => coachApplications.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id),
  
  // Comment Content
  content: text("content").notNull(),
  
  // Threading
  parentCommentId: int("parentCommentId"), // References another application_comments.id for threading
  
  // Metadata
  isInternal: boolean("isInternal").default(false), // Only visible to admins
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ApplicationComment = typeof applicationComments.$inferSelect;
export type InsertApplicationComment = typeof applicationComments.$inferInsert;

// ============================================================================
// APPLICATION REMINDERS (Track SLA and reminder status)
// ============================================================================
export const applicationReminders = mysqlTable("application_reminders", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: int("applicationId").notNull().references(() => coachApplications.id, { onDelete: "cascade" }),
  
  // SLA Configuration
  slaHours: int("slaHours").default(168), // Default 7 days (168 hours)
  submittedAt: timestamp("submittedAt").notNull(),
  dueAt: timestamp("dueAt").notNull(),
  
  // Reminder Status
  reminderSentAt: timestamp("reminderSentAt"),
  reminderCount: int("reminderCount").default(0),
  lastReminderAt: timestamp("lastReminderAt"),
  
  // SLA Status
  isOverdue: boolean("isOverdue").default(false),
  completedAt: timestamp("completedAt"),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ApplicationReminder = typeof applicationReminders.$inferSelect;
export type InsertApplicationReminder = typeof applicationReminders.$inferInsert;

// ============================================================================
// ADMIN PERFORMANCE METRICS (Track review speed and patterns)
// ============================================================================
export const adminPerformanceMetrics = mysqlTable("admin_performance_metrics", {
  id: int("id").autoincrement().primaryKey(),
  adminId: int("adminId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Review Statistics
  totalReviewed: int("totalReviewed").default(0),
  totalApproved: int("totalApproved").default(0),
  totalRejected: int("totalRejected").default(0),
  
  // Performance Metrics
  averageReviewTimeHours: decimal("averageReviewTimeHours", { precision: 8, scale: 2 }).default("0"),
  approvalRate: int("approvalRate").default(0), // Percentage 0-100
  rejectionRate: int("rejectionRate").default(0), // Percentage 0-100
  
  // Time Period
  periodStart: timestamp("periodStart").notNull(),
  periodEnd: timestamp("periodEnd").notNull(),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AdminPerformanceMetrics = typeof adminPerformanceMetrics.$inferSelect;
export type InsertAdminPerformanceMetrics = typeof adminPerformanceMetrics.$inferInsert;


// ============================================================================
// COMMENT TEMPLATES (Reusable feedback templates for bulk operations)
// ============================================================================
export const commentTemplates = mysqlTable("comment_templates", {
  id: int("id").autoincrement().primaryKey(),
  createdBy: int("createdBy").notNull().references(() => users.id),
  
  // Template Content
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  content: text("content").notNull(),
  
  // Variables support: {{applicantName}}, {{applicationId}}, {{yearsTeaching}}, etc.
  category: mysqlEnum("category", ["feedback", "approval", "rejection", "clarification"]).default("feedback"),
  
  // Visibility
  isPublic: boolean("isPublic").default(false), // Shared with other admins
  isArchived: boolean("isArchived").default(false),
  
  // Usage tracking
  usageCount: int("usageCount").default(0),
  lastUsedAt: timestamp("lastUsedAt"),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CommentTemplate = typeof commentTemplates.$inferSelect;
export type InsertCommentTemplate = typeof commentTemplates.$inferInsert;

// ============================================================================
// COMMENT MENTIONS (Track @mentions in comments)
// ============================================================================
export const commentMentions = mysqlTable("comment_mentions", {
  id: int("id").autoincrement().primaryKey(),
  commentId: int("commentId").notNull().references(() => applicationComments.id, { onDelete: "cascade" }),
  mentionedUserId: int("mentionedUserId").notNull().references(() => users.id),
  
  // Notification status
  notificationSent: boolean("notificationSent").default(false),
  notificationSentAt: timestamp("notificationSentAt"),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CommentMention = typeof commentMentions.$inferSelect;
export type InsertCommentMention = typeof commentMentions.$inferInsert;

// ============================================================================
// ADMIN BADGES & ACHIEVEMENTS (Gamification system)
// ============================================================================
export const adminBadges = mysqlTable("admin_badges", {
  id: int("id").autoincrement().primaryKey(),
  
  // Badge Definition
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }), // Emoji or icon name
  color: varchar("color", { length: 7 }).default("#0ea5a5"), // Hex color
  
  // Achievement Criteria
  criteria: mysqlEnum("criteria", [
    "speed_demon", // Fastest average review time
    "fair_judge", // Most balanced approval/rejection ratio
    "volume_champion", // Most applications reviewed
    "consistency_master", // Maintained high performance for 3+ months
    "quality_expert", // Highest approval rate
    "efficiency_leader", // Completed most applications in shortest time
    "team_player", // Most helpful comments/feedback
    "milestone_100", // Reviewed 100 applications
    "milestone_500", // Reviewed 500 applications
    "milestone_1000", // Reviewed 1000 applications
  ]).notNull(),
  
  // Badge Thresholds
  threshold: int("threshold"), // Numeric threshold for criteria
  thresholdUnit: varchar("thresholdUnit", { length: 50 }), // e.g., "hours", "applications", "percentage"
  
  // Visibility
  isActive: boolean("isActive").default(true),
  tier: mysqlEnum("tier", ["bronze", "silver", "gold", "platinum"]).default("bronze"),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AdminBadge = typeof adminBadges.$inferSelect;
export type InsertAdminBadge = typeof adminBadges.$inferInsert;

// ============================================================================
// ADMIN ACHIEVEMENTS (Track earned badges per admin)
// ============================================================================
export const adminAchievements = mysqlTable("admin_achievements", {
  id: int("id").autoincrement().primaryKey(),
  adminId: int("adminId").notNull().references(() => users.id, { onDelete: "cascade" }),
  badgeId: int("badgeId").notNull().references(() => adminBadges.id),
  
  // Achievement Details
  achievedAt: timestamp("achievedAt").defaultNow().notNull(),
  value: int("value"), // Actual value achieved (e.g., 2.5 hours average)
  
  // Notification
  notificationSent: boolean("notificationSent").default(false),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdminAchievement = typeof adminAchievements.$inferSelect;
export type InsertAdminAchievement = typeof adminAchievements.$inferInsert;

// ============================================================================
// ACHIEVEMENT MILESTONES (Track progress toward achievements)
// ============================================================================
export const achievementMilestones = mysqlTable("achievement_milestones", {
  id: int("id").autoincrement().primaryKey(),
  adminId: int("adminId").notNull().references(() => users.id, { onDelete: "cascade" }),
  badgeId: int("badgeId").notNull().references(() => adminBadges.id),
  
  // Progress Tracking
  currentValue: decimal("currentValue", { precision: 10, scale: 2 }).default("0"),
  targetValue: int("targetValue").notNull(),
  progressPercentage: int("progressPercentage").default(0),
  
  // Status
  isCompleted: boolean("isCompleted").default(false),
  completedAt: timestamp("completedAt"),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AchievementMilestone = typeof achievementMilestones.$inferSelect;
export type InsertAchievementMilestone = typeof achievementMilestones.$inferInsert;


// ============================================================================
// LEADERBOARD ARCHIVES (Historical leaderboard snapshots)
// ============================================================================
export const leaderboardArchives = mysqlTable("leaderboard_archives", {
  id: int("id").autoincrement().primaryKey(),
  
  // Season Information
  season: varchar("season", { length: 50 }).notNull(), // e.g., "2026-01", "Q1-2026"
  seasonType: mysqlEnum("seasonType", ["monthly", "quarterly", "yearly"]).default("monthly"),
  
  // Period
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  
  // Snapshot Data (JSON of top 10 admins)
  leaderboardSnapshot: json("leaderboardSnapshot").notNull(),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  isActive: boolean("isActive").default(false),
});

export type LeaderboardArchive = typeof leaderboardArchives.$inferSelect;
export type InsertLeaderboardArchive = typeof leaderboardArchives.$inferInsert;

// ============================================================================
// ADMIN TEAMS (Department/team organization)
// ============================================================================
export const adminTeams = mysqlTable("admin_teams", {
  id: int("id").autoincrement().primaryKey(),
  
  // Team Information
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  department: varchar("department", { length: 100 }),
  
  // Team Lead
  teamLeadId: int("teamLeadId").references(() => users.id),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AdminTeam = typeof adminTeams.$inferSelect;
export type InsertAdminTeam = typeof adminTeams.$inferInsert;

// ============================================================================
// ADMIN TEAM MEMBERSHIP (Link admins to teams)
// ============================================================================
export const adminTeamMembers = mysqlTable("admin_team_members", {
  id: int("id").autoincrement().primaryKey(),
  teamId: int("teamId").notNull().references(() => adminTeams.id, { onDelete: "cascade" }),
  adminId: int("adminId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Role within team
  role: mysqlEnum("role", ["member", "lead", "coordinator"]).default("member"),
  
  // Metadata
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

export type AdminTeamMember = typeof adminTeamMembers.$inferSelect;
export type InsertAdminTeamMember = typeof adminTeamMembers.$inferInsert;

// ============================================================================
// TEAM PERFORMANCE METRICS (Aggregated team statistics)
// ============================================================================
export const teamPerformanceMetrics = mysqlTable("team_performance_metrics", {
  id: int("id").autoincrement().primaryKey(),
  teamId: int("teamId").notNull().references(() => adminTeams.id, { onDelete: "cascade" }),
  
  // Period
  periodStart: timestamp("periodStart").notNull(),
  periodEnd: timestamp("periodEnd").notNull(),
  
  // Aggregated Metrics
  totalApplicationsReviewed: int("totalApplicationsReviewed").default(0),
  totalApproved: int("totalApproved").default(0),
  totalRejected: int("totalRejected").default(0),
  
  // Performance Indicators
  averageReviewTimeHours: decimal("averageReviewTimeHours", { precision: 8, scale: 2 }).default("0"),
  teamApprovalRate: int("teamApprovalRate").default(0), // Percentage
  teamRejectionRate: int("teamRejectionRate").default(0), // Percentage
  
  // Team Size
  activeMembers: int("activeMembers").default(0),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TeamPerformanceMetric = typeof teamPerformanceMetrics.$inferSelect;
export type InsertTeamPerformanceMetric = typeof teamPerformanceMetrics.$inferInsert;

// ============================================================================
// CUSTOM BADGE CRITERIA (Configurable achievement criteria)
// ============================================================================
export const customBadgeCriteria = mysqlTable("custom_badge_criteria", {
  id: int("id").autoincrement().primaryKey(),
  
  // Badge Reference
  badgeId: int("badgeId").notNull().references(() => adminBadges.id, { onDelete: "cascade" }),
  
  // Criteria Configuration
  criteriaType: mysqlEnum("criteriaType", [
    "average_review_time",
    "approval_rate",
    "rejection_rate",
    "total_reviewed",
    "consistency_score",
    "quality_score",
    "custom_formula",
  ]).notNull(),
  
  // Threshold Values
  minValue: decimal("minValue", { precision: 10, scale: 2 }),
  maxValue: decimal("maxValue", { precision: 10, scale: 2 }),
  targetValue: decimal("targetValue", { precision: 10, scale: 2 }),
  
  // Custom Formula (for complex criteria)
  customFormula: text("customFormula"), // e.g., "(approvalRate * 0.5) + (speed * 0.3) + (consistency * 0.2)"
  
  // Metadata
  isActive: boolean("isActive").default(true),
  createdBy: int("createdBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CustomBadgeCriteria = typeof customBadgeCriteria.$inferSelect;
export type InsertCustomBadgeCriteria = typeof customBadgeCriteria.$inferInsert;

// ============================================================================
// BADGE CRITERIA TEMPLATES (Pre-configured criteria sets)
// ============================================================================
export const badgeCriteriaTemplates = mysqlTable("badge_criteria_templates", {
  id: int("id").autoincrement().primaryKey(),
  
  // Template Information
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  
  // Template Type
  templateType: mysqlEnum("templateType", [
    "performance_focused",
    "consistency_focused",
    "quality_focused",
    "balanced",
    "custom",
  ]).default("balanced"),
  
  // Configuration JSON
  criteriaConfig: json("criteriaConfig").notNull(),
  
  // Metadata
  isPublic: boolean("isPublic").default(false),
  createdBy: int("createdBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BadgeCriteriaTemplate = typeof badgeCriteriaTemplates.$inferSelect;
export type InsertBadgeCriteriaTemplate = typeof badgeCriteriaTemplates.$inferInsert;


// ============================================================================
// UNIFIED CRM SYSTEM
// ============================================================================

// ECOSYSTEM LEADS (Unified contact database)
// ============================================================================
export const ecosystemLeads = mysqlTable("ecosystem_leads", {
  id: int("id").autoincrement().primaryKey(),
  
  // Contact Information
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  company: varchar("company", { length: 255 }),
  jobTitle: varchar("jobTitle", { length: 100 }),
  
  // Lead Classification
  source: mysqlEnum("source", [
    "lingueefy",
    "rusingacademy",
    "barholex",
    "ecosystem_hub",
    "external",
  ]).notNull(),
  formType: varchar("formType", { length: 50 }).notNull(), // contact, proposal, project, inquiry
  leadType: mysqlEnum("leadType", [
    "individual",
    "organization",
    "government",
    "enterprise",
  ]).default("individual"),
  status: mysqlEnum("leadStatus", [
    "new",
    "contacted",
    "qualified",
    "proposal_sent",
    "negotiating",
    "won",
    "lost",
    "nurturing",
  ]).default("new"),
  
  // Lead Details
  message: text("message"),
  interests: json("interests"), // Array of platform/service interests
  budget: varchar("budget", { length: 50 }),
  timeline: varchar("timeline", { length: 50 }),
  preferredLanguage: mysqlEnum("leadPreferredLanguage", ["en", "fr"]).default("en"),
  
  // Assignment
  assignedTo: int("assignedTo").references(() => users.id),
  
  // Scoring
  leadScore: int("leadScore").default(0),
  qualificationNotes: text("qualificationNotes"),
  
  // Cross-sell Tracking
  crossSellOpportunities: json("crossSellOpportunities"), // Array of platform opportunities
  
  // Linked User (if they sign up)
  linkedUserId: int("linkedUserId").references(() => users.id),
  
  // Email Preferences
  emailOptOut: boolean("emailOptOut").default(false),
  emailOptOutDate: timestamp("emailOptOutDate"),
  emailOptOutReason: varchar("emailOptOutReason", { length: 255 }),
  
  // Metadata
  utmSource: varchar("utmSource", { length: 100 }),
  utmMedium: varchar("utmMedium", { length: 100 }),
  utmCampaign: varchar("utmCampaign", { length: 100 }),
  referrer: varchar("referrer", { length: 500 }),
  ipAddress: varchar("ipAddress", { length: 50 }),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastContactedAt: timestamp("lastContactedAt"),
  convertedAt: timestamp("convertedAt"),
});
export type EcosystemLead = typeof ecosystemLeads.$inferSelect;
export type InsertEcosystemLead = typeof ecosystemLeads.$inferInsert;

// ECOSYSTEM LEAD ACTIVITIES (Activity tracking)
// ============================================================================
export const ecosystemLeadActivities = mysqlTable("ecosystem_lead_activities", {
  id: int("id").autoincrement().primaryKey(),
  
  // Lead Reference
  leadId: int("leadId").references(() => ecosystemLeads.id).notNull(),
  
  // Activity Details
  activityType: mysqlEnum("activityType", [
    "created",
    "status_changed",
    "assigned",
    "contacted",
    "note_added",
    "email_sent",
    "call_made",
    "meeting_scheduled",
    "proposal_sent",
    "converted",
    "cross_sell_identified",
  ]).notNull(),
  
  // Activity Content
  description: text("description"),
  previousValue: varchar("previousValue", { length: 255 }),
  newValue: varchar("newValue", { length: 255 }),
  metadata: json("metadata"),
  
  // Actor
  performedBy: int("performedBy").references(() => users.id),
  
  // Timestamp
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type EcosystemLeadActivity = typeof ecosystemLeadActivities.$inferSelect;
export type InsertEcosystemLeadActivity = typeof ecosystemLeadActivities.$inferInsert;

// ECOSYSTEM LEAD NOTES (Internal notes)
// ============================================================================
export const ecosystemLeadNotes = mysqlTable("ecosystem_lead_notes", {
  id: int("id").autoincrement().primaryKey(),
  
  // Lead Reference
  leadId: int("leadId").references(() => ecosystemLeads.id).notNull(),
  
  // Note Content
  content: text("content").notNull(),
  isPinned: boolean("isPinned").default(false),
  
  // Author
  authorId: int("authorId").references(() => users.id).notNull(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type EcosystemLeadNote = typeof ecosystemLeadNotes.$inferSelect;
export type InsertEcosystemLeadNote = typeof ecosystemLeadNotes.$inferInsert;

// ECOSYSTEM CROSS-SELL OPPORTUNITIES
// ============================================================================
export const ecosystemCrossSellOpportunities = mysqlTable("ecosystem_cross_sell_opportunities", {
  id: int("id").autoincrement().primaryKey(),
  
  // Lead Reference
  leadId: int("leadId").references(() => ecosystemLeads.id).notNull(),
  
  // Opportunity Details
  sourcePlatform: mysqlEnum("sourcePlatform", [
    "lingueefy",
    "rusingacademy",
    "barholex",
    "ecosystem_hub",
    "external",
  ]).notNull(),
  targetPlatform: mysqlEnum("targetPlatform", [
    "lingueefy",
    "rusingacademy",
    "barholex",
    "ecosystem_hub",
    "external",
  ]).notNull(),
  opportunityType: varchar("opportunityType", { length: 100 }).notNull(),
  description: text("description"),
  estimatedValue: decimal("estimatedValue", { precision: 10, scale: 2 }),
  
  // Status
  status: mysqlEnum("crossSellStatus", [
    "identified",
    "pitched",
    "interested",
    "converted",
    "declined",
  ]).default("identified"),
  
  // Timestamps
  identifiedAt: timestamp("identifiedAt").defaultNow().notNull(),
  convertedAt: timestamp("convertedAt"),
});
export type EcosystemCrossSellOpportunity = typeof ecosystemCrossSellOpportunities.$inferSelect;
export type InsertEcosystemCrossSellOpportunity = typeof ecosystemCrossSellOpportunities.$inferInsert;


// ============================================================================
// FOLLOW-UP SEQUENCES
// ============================================================================
export const followUpSequences = mysqlTable("follow_up_sequences", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  triggerType: varchar("triggerType", { length: 50 }).notNull().default("manual"),
  targetScoreMin: int("targetScoreMin"),
  targetScoreMax: int("targetScoreMax"),
  targetStatuses: json("targetStatuses").$type<string[]>(),
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FollowUpSequence = typeof followUpSequences.$inferSelect;
export type InsertFollowUpSequence = typeof followUpSequences.$inferInsert;

export const sequenceSteps = mysqlTable("sequence_steps", {
  id: int("id").autoincrement().primaryKey(),
  sequenceId: int("sequenceId").notNull().references(() => followUpSequences.id),
  stepOrder: int("stepOrder").notNull(),
  delayDays: int("delayDays").notNull().default(0),
  delayHours: int("delayHours").notNull().default(0),
  emailSubjectEn: varchar("emailSubjectEn", { length: 255 }).notNull(),
  emailSubjectFr: varchar("emailSubjectFr", { length: 255 }).notNull(),
  emailBodyEn: text("emailBodyEn").notNull(),
  emailBodyFr: text("emailBodyFr").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SequenceStep = typeof sequenceSteps.$inferSelect;
export type InsertSequenceStep = typeof sequenceSteps.$inferInsert;

export const leadSequenceEnrollments = mysqlTable("lead_sequence_enrollments", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId").notNull().references(() => ecosystemLeads.id),
  sequenceId: int("sequenceId").notNull().references(() => followUpSequences.id),
  currentStepId: int("currentStepId").references(() => sequenceSteps.id),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  enrolledAt: timestamp("enrolledAt").defaultNow().notNull(),
  nextEmailAt: timestamp("nextEmailAt"),
  completedAt: timestamp("completedAt"),
});

export type LeadSequenceEnrollment = typeof leadSequenceEnrollments.$inferSelect;
export type InsertLeadSequenceEnrollment = typeof leadSequenceEnrollments.$inferInsert;

export const sequenceEmailLogs = mysqlTable("sequence_email_logs", {
  id: int("id").autoincrement().primaryKey(),
  enrollmentId: int("enrollmentId").notNull().references(() => leadSequenceEnrollments.id),
  stepId: int("stepId").notNull().references(() => sequenceSteps.id),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  opened: boolean("opened").notNull().default(false),
  openedAt: timestamp("openedAt"),
  clicked: boolean("clicked").notNull().default(false),
  clickedAt: timestamp("clickedAt"),
});

export type SequenceEmailLog = typeof sequenceEmailLogs.$inferSelect;
export type InsertSequenceEmailLog = typeof sequenceEmailLogs.$inferInsert;

// ============================================================================
// CRM MEETINGS
// ============================================================================
export const crmMeetings = mysqlTable("crm_meetings", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId").notNull().references(() => ecosystemLeads.id),
  organizerId: int("organizerId").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  meetingDate: timestamp("meetingDate").notNull(),
  durationMinutes: int("durationMinutes").notNull().default(30),
  meetingType: varchar("meetingType", { length: 50 }).notNull().default("video"),
  meetingLink: varchar("meetingLink", { length: 500 }),
  status: varchar("meetingStatus", { length: 50 }).notNull().default("scheduled"),
  notes: text("notes"),
  outcome: text("outcome"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CrmMeeting = typeof crmMeetings.$inferSelect;
export type InsertCrmMeeting = typeof crmMeetings.$inferInsert;


// ============================================================================
// CRM EMAIL TEMPLATES
// ============================================================================
export const crmEmailTemplates = mysqlTable("crm_email_templates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  body: text("body").notNull(),
  category: mysqlEnum("category", ["welcome", "follow_up", "proposal", "nurture", "conversion", "custom"]).notNull().default("custom"),
  language: mysqlEnum("language", ["en", "fr", "both"]).notNull().default("en"),
  variables: json("variables").$type<string[]>(),
  isDefault: boolean("isDefault").notNull().default(false),
  createdBy: int("createdBy").references(() => users.id),
  usageCount: int("usageCount").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type CrmEmailTemplate = typeof crmEmailTemplates.$inferSelect;
export type InsertCrmEmailTemplate = typeof crmEmailTemplates.$inferInsert;

// ============================================================================
// CRM PIPELINE NOTIFICATIONS
// ============================================================================
export const crmPipelineNotifications = mysqlTable("crm_pipeline_notifications", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId").notNull().references(() => ecosystemLeads.id),
  notificationType: mysqlEnum("notificationType", ["stale_lead", "stage_change", "high_value", "follow_up_due"]).notNull(),
  message: text("message").notNull(),
  isRead: boolean("isRead").notNull().default(false),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type CrmPipelineNotification = typeof crmPipelineNotifications.$inferSelect;
export type InsertCrmPipelineNotification = typeof crmPipelineNotifications.$inferInsert;

// ============================================================================
// CRM ACTIVITY REPORTS
// ============================================================================
export const crmActivityReports = mysqlTable("crm_activity_reports", {
  id: int("id").autoincrement().primaryKey(),
  reportType: mysqlEnum("reportType", ["weekly", "monthly", "quarterly"]).notNull(),
  periodStart: timestamp("periodStart").notNull(),
  periodEnd: timestamp("periodEnd").notNull(),
  data: json("data").$type<{
    newLeads: number;
    convertedLeads: number;
    lostLeads: number;
    totalDealValue: number;
    avgDealSize: number;
    emailsSent: number;
    emailsOpened: number;
    emailsClicked: number;
    meetingsScheduled: number;
    meetingsCompleted: number;
    pipelineMovements: { from: string; to: string; count: number }[];
  }>(),
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
});
export type CrmActivityReport = typeof crmActivityReports.$inferSelect;
export type InsertCrmActivityReport = typeof crmActivityReports.$inferInsert;


// Lead Tags table
export const crmLeadTags = mysqlTable("crm_lead_tags", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  color: varchar("color", { length: 20 }).notNull().default("#6366f1"), // Hex color
  description: varchar("description", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// Lead-Tag relationship table (many-to-many)
export const crmLeadTagAssignments = mysqlTable("crm_lead_tag_assignments", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId").notNull().references(() => ecosystemLeads.id),
  tagId: int("tagId").notNull().references(() => crmLeadTags.id),
  assignedAt: timestamp("assignedAt").defaultNow().notNull(),
});

export type CrmLeadTag = typeof crmLeadTags.$inferSelect;
export type InsertCrmLeadTag = typeof crmLeadTags.$inferInsert;
export type CrmLeadTagAssignment = typeof crmLeadTagAssignments.$inferSelect;
export type InsertCrmLeadTagAssignment = typeof crmLeadTagAssignments.$inferInsert;


// Tag Automation Rules table
export const crmTagAutomationRules = mysqlTable("crm_tag_automation_rules", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: varchar("description", { length: 255 }),
  tagId: int("tagId").notNull().references(() => crmLeadTags.id),
  conditionType: varchar("conditionType", { length: 50 }).notNull(), // budget_above, budget_below, score_above, score_below, source_equals, lead_type_equals
  conditionValue: varchar("conditionValue", { length: 100 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  priority: int("priority").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type CrmTagAutomationRule = typeof crmTagAutomationRules.$inferSelect;
export type InsertCrmTagAutomationRule = typeof crmTagAutomationRules.$inferInsert;


// ============================================================================
// CRM LEAD SEGMENTS
// ============================================================================
export const crmLeadSegments = mysqlTable("crm_lead_segments", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: varchar("description", { length: 255 }),
  // JSON array of filter conditions: [{ field: "status", operator: "equals", value: "qualified" }, ...]
  filters: json("filters").$type<Array<{
    field: string;
    operator: "equals" | "not_equals" | "greater_than" | "less_than" | "contains" | "in";
    value: string | number | string[];
  }>>().notNull(),
  // Logical operator to combine filters: "and" or "or"
  filterLogic: mysqlEnum("filterLogic", ["and", "or"]).default("and").notNull(),
  color: varchar("color", { length: 7 }).default("#3b82f6"),
  isActive: boolean("isActive").default(true).notNull(),
  createdBy: int("createdBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type CrmLeadSegment = typeof crmLeadSegments.$inferSelect;
export type InsertCrmLeadSegment = typeof crmLeadSegments.$inferInsert;

// ============================================================================
// CRM LEAD MODIFICATION HISTORY
// ============================================================================
export const crmLeadHistory = mysqlTable("crm_lead_history", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId").notNull().references(() => ecosystemLeads.id),
  userId: int("userId").references(() => users.id),
  action: mysqlEnum("action", [
    "created",
    "updated",
    "status_changed",
    "score_changed",
    "assigned",
    "tag_added",
    "tag_removed",
    "note_added",
    "email_sent",
    "meeting_scheduled",
    "imported",
    "merged",
    "deleted",
  ]).notNull(),
  fieldName: varchar("fieldName", { length: 100 }),
  oldValue: text("oldValue"),
  newValue: text("newValue"),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type CrmLeadHistory = typeof crmLeadHistory.$inferSelect;
export type InsertCrmLeadHistory = typeof crmLeadHistory.$inferInsert;


// ============================================================================
// CRM SEGMENT ALERTS
// ============================================================================
export const crmSegmentAlerts = mysqlTable("crm_segment_alerts", {
  id: int("id").autoincrement().primaryKey(),
  segmentId: int("segmentId").notNull().references(() => crmLeadSegments.id),
  alertType: mysqlEnum("alertType", ["lead_entered", "lead_exited", "threshold_reached"]).notNull(),
  // For threshold alerts: minimum number of leads to trigger
  thresholdValue: int("thresholdValue"),
  // Notification settings
  notifyEmail: boolean("notifyEmail").default(true),
  notifyWebhook: boolean("notifyWebhook").default(false),
  webhookUrl: varchar("webhookUrl", { length: 500 }),
  // Recipients (comma-separated emails or "owner" for owner only)
  recipients: varchar("recipients", { length: 500 }).default("owner"),
  isActive: boolean("isActive").default(true).notNull(),
  lastTriggeredAt: timestamp("lastTriggeredAt"),
  triggerCount: int("triggerCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type CrmSegmentAlert = typeof crmSegmentAlerts.$inferSelect;
export type InsertCrmSegmentAlert = typeof crmSegmentAlerts.$inferInsert;

// ============================================================================
// CRM SEGMENT ALERT LOGS
// ============================================================================
export const crmSegmentAlertLogs = mysqlTable("crm_segment_alert_logs", {
  id: int("id").autoincrement().primaryKey(),
  alertId: int("alertId").notNull().references(() => crmSegmentAlerts.id),
  segmentId: int("segmentId").notNull().references(() => crmLeadSegments.id),
  leadId: int("leadId").references(() => ecosystemLeads.id),
  eventType: mysqlEnum("eventType", ["entered", "exited", "threshold"]).notNull(),
  message: text("message"),
  notificationSent: boolean("notificationSent").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type CrmSegmentAlertLog = typeof crmSegmentAlertLogs.$inferSelect;
export type InsertCrmSegmentAlertLog = typeof crmSegmentAlertLogs.$inferInsert;

// ============================================================================
// CRM SALES GOALS
// ============================================================================
export const crmSalesGoals = mysqlTable("crm_sales_goals", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  goalType: mysqlEnum("goalType", ["revenue", "deals", "leads", "meetings", "conversions"]).notNull(),
  targetValue: int("targetValue").notNull(),
  currentValue: int("currentValue").default(0).notNull(),
  period: mysqlEnum("period", ["weekly", "monthly", "quarterly", "yearly"]).notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  assignedTo: int("assignedTo").references(() => users.id), // null = team goal
  status: mysqlEnum("status", ["active", "completed", "missed", "cancelled"]).default("active").notNull(),
  createdBy: int("createdBy").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type CrmSalesGoal = typeof crmSalesGoals.$inferSelect;
export type InsertCrmSalesGoal = typeof crmSalesGoals.$inferInsert;

// ============================================================================
// CRM SALES GOAL MILESTONES
// ============================================================================
export const crmSalesGoalMilestones = mysqlTable("crm_sales_goal_milestones", {
  id: int("id").autoincrement().primaryKey(),
  goalId: int("goalId").notNull().references(() => crmSalesGoals.id),
  milestoneValue: int("milestoneValue").notNull(), // e.g., 25%, 50%, 75%, 100%
  reachedAt: timestamp("reachedAt"),
  notificationSent: boolean("notificationSent").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type CrmSalesGoalMilestone = typeof crmSalesGoalMilestones.$inferSelect;
export type InsertCrmSalesGoalMilestone = typeof crmSalesGoalMilestones.$inferInsert;

// ============================================================================
// CRM TEAM GOAL ASSIGNMENTS
// ============================================================================
export const crmTeamGoalAssignments = mysqlTable("crm_team_goal_assignments", {
  id: int("id").autoincrement().primaryKey(),
  goalId: int("goalId").notNull().references(() => crmSalesGoals.id),
  userId: int("userId").notNull().references(() => users.id),
  individualTarget: int("individualTarget").notNull(), // Individual contribution target
  currentProgress: int("currentProgress").default(0).notNull(),
  rank: int("rank"), // Leaderboard position
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type CrmTeamGoalAssignment = typeof crmTeamGoalAssignments.$inferSelect;
export type InsertCrmTeamGoalAssignment = typeof crmTeamGoalAssignments.$inferInsert;


// ============================================================================
// NEWSLETTER SUBSCRIPTIONS
// ============================================================================
export const newsletterSubscriptions = mysqlTable("newsletter_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  firstName: varchar("firstName", { length: 100 }),
  lastName: varchar("lastName", { length: 100 }),
  brand: mysqlEnum("brand", ["ecosystem", "rusingacademy", "lingueefy", "barholex"]).notNull(),
  interests: json("interests").$type<string[]>(), // e.g., ["sle-training", "executive-coaching", "media-production"]
  language: mysqlEnum("language", ["en", "fr"]).default("en").notNull(),
  status: mysqlEnum("status", ["active", "unsubscribed", "bounced"]).default("active").notNull(),
  source: varchar("source", { length: 100 }), // e.g., "landing_page", "contact_form", "import"
  confirmedAt: timestamp("confirmedAt"),
  unsubscribedAt: timestamp("unsubscribedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type NewsletterSubscription = typeof newsletterSubscriptions.$inferSelect;
export type InsertNewsletterSubscription = typeof newsletterSubscriptions.$inferInsert;


// ============================================================================
// FORUM CATEGORIES
// ============================================================================
export const forumCategories = mysqlTable("forum_categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  nameFr: varchar("nameFr", { length: 100 }).notNull(),
  description: text("description"),
  descriptionFr: text("descriptionFr"),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  icon: varchar("icon", { length: 50 }), // Emoji or icon name
  color: varchar("color", { length: 20 }), // Hex color for styling
  sortOrder: int("sortOrder").default(0),
  isActive: boolean("isActive").default(true),
  threadCount: int("threadCount").default(0),
  postCount: int("postCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ForumCategory = typeof forumCategories.$inferSelect;
export type InsertForumCategory = typeof forumCategories.$inferInsert;

// ============================================================================
// FORUM THREADS
// ============================================================================
export const forumThreads = mysqlTable("forum_threads", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("categoryId").notNull().references(() => forumCategories.id),
  authorId: int("authorId").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 300 }).notNull(),
  content: text("content").notNull(),
  isPinned: boolean("isPinned").default(false),
  isLocked: boolean("isLocked").default(false),
  viewCount: int("viewCount").default(0),
  replyCount: int("replyCount").default(0),
  lastReplyAt: timestamp("lastReplyAt"),
  lastReplyById: int("lastReplyById").references(() => users.id),
  status: mysqlEnum("status", ["active", "hidden", "deleted"]).default("active"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ForumThread = typeof forumThreads.$inferSelect;
export type InsertForumThread = typeof forumThreads.$inferInsert;

// ============================================================================
// FORUM POSTS (Replies)
// ============================================================================
export const forumPosts = mysqlTable("forum_posts", {
  id: int("id").autoincrement().primaryKey(),
  threadId: int("threadId").notNull().references(() => forumThreads.id),
  authorId: int("authorId").notNull().references(() => users.id),
  content: text("content").notNull(),
  isEdited: boolean("isEdited").default(false),
  editedAt: timestamp("editedAt"),
  likeCount: int("likeCount").default(0),
  status: mysqlEnum("status", ["active", "hidden", "deleted"]).default("active"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ForumPost = typeof forumPosts.$inferSelect;
export type InsertForumPost = typeof forumPosts.$inferInsert;

// ============================================================================
// FORUM POST LIKES
// ============================================================================
export const forumPostLikes = mysqlTable("forum_post_likes", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull().references(() => forumPosts.id),
  userId: int("userId").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ForumPostLike = typeof forumPostLikes.$inferSelect;
export type InsertForumPostLike = typeof forumPostLikes.$inferInsert;

// ============================================================================
// COMMUNITY EVENTS
// ============================================================================
export const communityEvents = mysqlTable("community_events", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  titleFr: varchar("titleFr", { length: 255 }).notNull(),
  description: text("description").notNull(),
  descriptionFr: text("descriptionFr").notNull(),
  slug: varchar("slug", { length: 300 }).notNull().unique(),
  eventType: mysqlEnum("eventType", ["workshop", "networking", "practice", "info_session", "webinar", "other"]).default("workshop"),
  
  // Scheduling
  startAt: timestamp("startAt").notNull(),
  endAt: timestamp("endAt").notNull(),
  timezone: varchar("timezone", { length: 50 }).default("America/Toronto"),
  
  // Location
  locationType: mysqlEnum("locationType", ["virtual", "in_person", "hybrid"]).default("virtual"),
  locationDetails: varchar("locationDetails", { length: 255 }), // Address or "Virtual"
  meetingUrl: text("meetingUrl"), // Zoom/Teams link for virtual events
  
  // Capacity
  maxCapacity: int("maxCapacity"),
  currentRegistrations: int("currentRegistrations").default(0),
  waitlistEnabled: boolean("waitlistEnabled").default(false),
  
  // Pricing (in CAD cents, 0 = free)
  price: int("price").default(0),
  
  // Host
  hostId: int("hostId").references(() => users.id),
  hostName: varchar("hostName", { length: 100 }),
  
  // Status
  status: mysqlEnum("status", ["draft", "published", "cancelled", "completed"]).default("draft"),
  
  // Image
  imageUrl: text("imageUrl"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type CommunityEvent = typeof communityEvents.$inferSelect;
export type InsertCommunityEvent = typeof communityEvents.$inferInsert;

// ============================================================================
// EVENT REGISTRATIONS
// ============================================================================
export const eventRegistrations = mysqlTable("event_registrations", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull().references(() => communityEvents.id),
  userId: int("userId").notNull().references(() => users.id),
  
  // Registration Details
  status: mysqlEnum("status", ["registered", "waitlisted", "cancelled", "attended", "no_show"]).default("registered"),
  registeredAt: timestamp("registeredAt").defaultNow().notNull(),
  cancelledAt: timestamp("cancelledAt"),
  attendedAt: timestamp("attendedAt"),
  
  // Contact info (for non-logged-in users or additional info)
  email: varchar("email", { length: 320 }),
  name: varchar("name", { length: 100 }),
  
  // Payment (if paid event)
  stripePaymentId: varchar("stripePaymentId", { length: 100 }),
  amountPaid: int("amountPaid").default(0),
  
  // Reminder sent
  reminderSent: boolean("reminderSent").default(false),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type InsertEventRegistration = typeof eventRegistrations.$inferInsert;


// ============================================================================
// ONLINE COURSES SYSTEM (Kajabi Pro Parity)
// ============================================================================

// ============================================================================
// COURSES (Main course container)
// ============================================================================
export const courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),
  
  // Basic Info (Bilingual)
  title: varchar("title", { length: 200 }).notNull(),
  titleFr: varchar("titleFr", { length: 200 }),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  description: text("description"),
  descriptionFr: text("descriptionFr"),
  shortDescription: varchar("shortDescription", { length: 500 }),
  shortDescriptionFr: varchar("shortDescriptionFr", { length: 500 }),
  
  // Gamification
  pathCompletionBadgeUrl: text("pathCompletionBadgeUrl"),
  
  // Media
  thumbnailUrl: text("thumbnailUrl"),
  previewVideoUrl: text("previewVideoUrl"),
  
  // Categorization
  category: mysqlEnum("category", [
    "sle_oral",
    "sle_written", 
    "sle_reading",
    "sle_complete",
    "business_french",
    "business_english",
    "exam_prep",
    "conversation",
    "grammar",
    "vocabulary"
  ]).default("sle_oral"),
  level: mysqlEnum("level", ["beginner", "intermediate", "advanced", "all_levels"]).default("all_levels"),
  targetLanguage: mysqlEnum("targetLanguage", ["french", "english", "both"]).default("french"),
  
  // Pricing (in CAD cents)
  price: int("price").default(0), // 0 = free
  originalPrice: int("originalPrice"), // For showing discounts
  currency: varchar("currency", { length: 3 }).default("CAD"),
  
  // Access
  accessType: mysqlEnum("accessType", ["one_time", "subscription", "free"]).default("one_time"),
  accessDurationDays: int("accessDurationDays"), // null = lifetime access
  
  // Content Stats
  totalModules: int("totalModules").default(0),
  totalLessons: int("totalLessons").default(0),
  totalDurationMinutes: int("totalDurationMinutes").default(0),
  
  // Enrollment Stats
  totalEnrollments: int("totalEnrollments").default(0),
  averageRating: decimal("averageRating", { precision: 3, scale: 2 }),
  totalReviews: int("totalReviews").default(0),
  
  // Instructor
  instructorId: int("instructorId").references(() => users.id),
  instructorName: varchar("instructorName", { length: 100 }),
  
  // Status
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft"),
  publishedAt: timestamp("publishedAt"),
  
  // SEO
  metaTitle: varchar("metaTitle", { length: 60 }),
  metaDescription: varchar("metaDescription", { length: 160 }),
  
  // Features
  hasCertificate: boolean("hasCertificate").default(true),
  hasQuizzes: boolean("hasQuizzes").default(true),
  hasDownloads: boolean("hasDownloads").default(true),
  
  // Drip Content Settings
  dripEnabled: boolean("dripEnabled").default(false),
  dripInterval: int("dripInterval").default(7), // Number of units between drips
  dripUnit: mysqlEnum("dripUnit", ["days", "weeks", "months"]).default("days"),
  
  // Total Activities count
  totalActivities: int("totalActivities").default(0),
  
  // Mission Rescue: Path-level fields
  heroImageUrl: text("heroImageUrl"),
  pathNumber: int("pathNumber"), // 1-6 for Path I-VI
  estimatedHours: int("estimatedHours").default(30),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;;

// ============================================================================
// COURSE MODULES (Sections/Chapters within a course)
// ============================================================================
export const courseModules = mysqlTable("course_modules", {
  id: int("id").autoincrement().primaryKey(),
  
  courseId: int("courseId").notNull().references(() => courses.id),
  
  // Basic Info (Bilingual)
  title: varchar("title", { length: 200 }).notNull(),
  titleFr: varchar("titleFr", { length: 200 }),
  description: text("description"),
  descriptionFr: text("descriptionFr"),
  
  // Gamification
  badgeImageUrl: text("badgeImageUrl"),
  
  // Ordering
  sortOrder: int("sortOrder").default(0),
  moduleNumber: int("moduleNumber"), // 1-4 within course
  
  // Content Stats
  totalLessons: int("totalLessons").default(0),
  totalDurationMinutes: int("totalDurationMinutes").default(0),
  
  // Access Control
  isPreview: boolean("isPreview").default(false), // Can be viewed without purchase
  
  // Media
  thumbnailUrl: text("thumbnailUrl"),
  
  // Drip / Unlock
  availableAt: timestamp("availableAt"),
  unlockMode: mysqlEnum("unlockMode", ["immediate", "drip", "prerequisite", "manual"]).default("immediate"),
  prerequisiteModuleId: int("prerequisiteModuleId"),
  
  // Status
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("published"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type CourseModule = typeof courseModules.$inferSelect;
export type InsertCourseModule = typeof courseModules.$inferInsert;;

// ============================================================================
// LESSONS (Individual content pieces within modules)
// ============================================================================
export const lessons = mysqlTable("lessons", {
  id: int("id").autoincrement().primaryKey(),
  
  moduleId: int("moduleId").notNull().references(() => courseModules.id),
  courseId: int("courseId").notNull().references(() => courses.id),
  
  // Basic Info (Bilingual)
  title: varchar("title", { length: 200 }).notNull(),
  titleFr: varchar("titleFr", { length: 200 }),
  description: text("description"),
  descriptionFr: text("descriptionFr"),
  
  // Content Type
  contentType: mysqlEnum("contentType", [
    "video",
    "text",
    "audio",
    "pdf",
    "quiz",
    "assignment",
    "download",
    "live_session"
  ]).default("video"),
  
  // Video Content
  videoUrl: text("videoUrl"),
  videoProvider: mysqlEnum("videoProvider", ["youtube", "vimeo", "wistia", "bunny", "self_hosted"]),
  videoDurationSeconds: int("videoDurationSeconds"),
  videoThumbnailUrl: text("videoThumbnailUrl"),
  
  // Text Content
  textContent: text("textContent"), // Rich text / Markdown
  
  // Audio Content
  audioUrl: text("audioUrl"),
  audioDurationSeconds: int("audioDurationSeconds"),
  
  // Downloadable Resources
  downloadUrl: text("downloadUrl"),
  downloadFileName: varchar("downloadFileName", { length: 200 }),
  
  // Ordering
  sortOrder: int("sortOrder").default(0),
  
  // Duration (for progress tracking)
  estimatedMinutes: int("estimatedMinutes").default(10),
  
   // Access Control
  isPreview: boolean("isPreview").default(false),
  isMandatory: boolean("isMandatory").default(true), // Required for completion
  
  // Media
  thumbnailUrl: text("thumbnailUrl"),
  
  // Rich text content (TipTap)
  contentJson: json("contentJson"), // TipTap JSON document for editing
  
  // Status
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("published"),
  
  // Drip / Unlock
  availableAt: timestamp("availableAt"),
  unlockMode: mysqlEnum("unlockMode", ["immediate", "drip", "prerequisite", "manual"]).default("immediate"),
  prerequisiteLessonId: int("prerequisiteLessonId"),
  
  // Activity count
  totalActivities: int("totalActivities").default(0),
  
  // Mission Rescue: Lesson-level tracking
  lessonNumber: int("lessonNumber"), // 1-4 within module
  totalSlots: int("totalSlots").default(7),
  slotsCompleted: int("slotsCompleted").default(0),
  qualityGateStatus: mysqlEnum("qualityGateStatus", ["pending", "pass", "fail"]).default("pending"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = typeof lessons.$inferInsert;

// ============================================================================
// QUIZZES (Assessment within lessons or standalone)
// ============================================================================
export const quizzes = mysqlTable("quizzes", {
  id: int("id").autoincrement().primaryKey(),
  
  lessonId: int("lessonId").references(() => lessons.id),
  courseId: int("courseId").notNull().references(() => courses.id),
  
  // Basic Info
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  
  // Quiz Settings
  passingScore: int("passingScore").default(70), // Percentage
  timeLimit: int("timeLimit"), // Minutes, null = unlimited
  attemptsAllowed: int("attemptsAllowed").default(3), // null = unlimited
  shuffleQuestions: boolean("shuffleQuestions").default(true),
  showCorrectAnswers: boolean("showCorrectAnswers").default(true),
  
  // Question Stats
  totalQuestions: int("totalQuestions").default(0),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = typeof quizzes.$inferInsert;

// ============================================================================
// QUIZ QUESTIONS
// ============================================================================
export const quizQuestions = mysqlTable("quiz_questions", {
  id: int("id").autoincrement().primaryKey(),
  
  // References
  lessonId: int("lessonId").notNull(),
  moduleId: int("moduleId"),
  courseId: int("courseId"),
  
  // Question Content
  questionText: text("questionText").notNull(),
  questionTextFr: text("questionTextFr"),
  questionType: mysqlEnum("questionType", [
    "multiple_choice",
    "true_false",
    "fill_blank",
    "matching",
    "short_answer",
    "audio_response"
  ]).default("multiple_choice"),
  
  // Answer Options (JSON array for multiple choice)
  options: json("options"),
  
  // Correct Answer
  correctAnswer: text("correctAnswer"),
  
  // Explanation
  explanation: text("explanation"),
  explanationFr: text("explanationFr"),
  
  // Points and difficulty
  points: int("points").default(10),
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard"]).default("medium"),
  
  // Ordering and status
  orderIndex: int("orderIndex").default(0),
  isActive: boolean("isActive").default(true),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type InsertQuizQuestion = typeof quizQuestions.$inferInsert;

// ============================================================================
// COURSE ENROLLMENTS
// ============================================================================
export const courseEnrollments = mysqlTable("course_enrollments", {
  id: int("id").autoincrement().primaryKey(),
  
  userId: int("userId").notNull().references(() => users.id),
  courseId: int("courseId").notNull().references(() => courses.id),
  
  // Enrollment Details
  enrolledAt: timestamp("enrolledAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"), // null = lifetime access
  
  // Progress
  progressPercent: int("progressPercent").default(0),
  lessonsCompleted: int("lessonsCompleted").default(0),
  totalLessons: int("totalLessons").default(0),
  lastAccessedAt: timestamp("lastAccessedAt"),
  completedAt: timestamp("completedAt"),
  
  // Certificate
  certificateId: varchar("certificateId", { length: 50 }),
  certificateIssuedAt: timestamp("certificateIssuedAt"),
  
  // Payment
  stripePaymentId: varchar("stripePaymentId", { length: 100 }),
  amountPaid: int("amountPaid").default(0),
  
  // Status
  status: mysqlEnum("status", ["active", "completed", "expired", "refunded"]).default("active"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CourseEnrollment = typeof courseEnrollments.$inferSelect;
export type InsertCourseEnrollment = typeof courseEnrollments.$inferInsert;

// ============================================================================
// LESSON PROGRESS (Track individual lesson completion)
// ============================================================================
export const lessonProgress = mysqlTable("lesson_progress", {
  id: int("id").autoincrement().primaryKey(),
  
  lessonId: int("lessonId").notNull().references(() => lessons.id),
  userId: int("userId").notNull().references(() => users.id),
  courseId: int("courseId").references(() => courses.id),
  moduleId: int("moduleId").references(() => courseModules.id),
  
  // Progress
  status: mysqlEnum("status", ["not_started", "in_progress", "completed"]).default("not_started"),
  progressPercent: int("progressPercent").default(0),
  
  // Time tracking
  timeSpentSeconds: int("timeSpentSeconds").default(0),
  
  // Timestamps
  completedAt: timestamp("completedAt"),
  lastAccessedAt: timestamp("lastAccessedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ([
  uniqueIndex("lesson_progress_user_lesson_idx").on(table.userId, table.lessonId),
]));
export type LessonProgress = typeof lessonProgress.$inferSelect;;
export type InsertLessonProgress = typeof lessonProgress.$inferInsert;

// ============================================================================
// QUIZ ATTEMPTS
// ============================================================================
export const quizAttempts = mysqlTable("quiz_attempts", {
  id: int("id").autoincrement().primaryKey(),
  
  userId: int("userId").notNull().references(() => users.id),
  quizId: int("quizId").notNull().references(() => quizzes.id),
  enrollmentId: int("enrollmentId").references(() => courseEnrollments.id),
  
  // Attempt Details
  attemptNumber: int("attemptNumber").default(1),
  score: int("score").default(0), // Percentage
  pointsEarned: int("pointsEarned").default(0),
  totalPoints: int("totalPoints").default(0),
  passed: boolean("passed").default(false),
  
  // Timing
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  timeSpentSeconds: int("timeSpentSeconds"),
  
  // Answers (JSON: { questionId: number, answer: string, isCorrect: boolean }[])
  answers: json("answers"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type InsertQuizAttempt = typeof quizAttempts.$inferInsert;

// ============================================================================
// COURSE REVIEWS
// ============================================================================
export const courseReviews = mysqlTable("course_reviews", {
  id: int("id").autoincrement().primaryKey(),
  
  userId: int("userId").notNull().references(() => users.id),
  courseId: int("courseId").notNull().references(() => courses.id),
  enrollmentId: int("enrollmentId").references(() => courseEnrollments.id),
  
  // Review Content
  rating: int("rating").notNull(), // 1-5
  title: varchar("title", { length: 200 }),
  comment: text("comment"),
  
  // Helpful votes
  helpfulVotes: int("helpfulVotes").default(0),
  
  // Moderation
  isVisible: boolean("isVisible").default(true),
  isVerifiedPurchase: boolean("isVerifiedPurchase").default(true),
  
  // Instructor Response
  instructorResponse: text("instructorResponse"),
  instructorRespondedAt: timestamp("instructorRespondedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CourseReview = typeof courseReviews.$inferSelect;
export type InsertCourseReview = typeof courseReviews.$inferInsert;

// ============================================================================
// CERTIFICATES
// ============================================================================
export const certificates = mysqlTable("certificates", {
  id: int("id").autoincrement().primaryKey(),
  
  // Unique certificate ID for verification
  certificateId: varchar("certificateId", { length: 50 }).notNull().unique(),
  
  userId: int("userId").notNull().references(() => users.id),
  courseId: int("courseId").notNull().references(() => courses.id),
  enrollmentId: int("enrollmentId").notNull().references(() => courseEnrollments.id),
  
  // Certificate Details
  recipientName: varchar("recipientName", { length: 200 }).notNull(),
  courseName: varchar("courseName", { length: 200 }).notNull(),
  completionDate: timestamp("completionDate").notNull(),
  
  // Verification
  verificationUrl: text("verificationUrl"),
  
  // PDF Storage
  pdfUrl: text("pdfUrl"),
  
  // Metadata
  metadata: json("metadata"), // Additional data like final score, hours completed
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = typeof certificates.$inferInsert;

// ============================================================================
// COURSE BUNDLES (Multiple courses sold together)
// ============================================================================
export const courseBundles = mysqlTable("course_bundles", {
  id: int("id").autoincrement().primaryKey(),
  
  // Basic Info
  title: varchar("title", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  description: text("description"),
  
  // Media
  thumbnailUrl: text("thumbnailUrl"),
  
  // Pricing
  price: int("price").notNull(), // Bundle price in cents
  originalPrice: int("originalPrice"), // Sum of individual course prices
  savingsPercent: int("savingsPercent"), // Calculated discount
  
  // Status
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CourseBundle = typeof courseBundles.$inferSelect;
export type InsertCourseBundle = typeof courseBundles.$inferInsert;

// ============================================================================
// BUNDLE COURSES (Junction table)
// ============================================================================
export const bundleCourses = mysqlTable("bundle_courses", {
  id: int("id").autoincrement().primaryKey(),
  
  bundleId: int("bundleId").notNull().references(() => courseBundles.id),
  courseId: int("courseId").notNull().references(() => courses.id),
  
  sortOrder: int("sortOrder").default(0),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BundleCourse = typeof bundleCourses.$inferSelect;
export type InsertBundleCourse = typeof bundleCourses.$inferInsert;


// ============================================================================
// PASSWORD RESET TOKENS (For custom email/password auth)
// ============================================================================
export const passwordResetTokens = mysqlTable("password_reset_tokens", {
  id: int("id").autoincrement().primaryKey(),
  
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Token (hashed)
  tokenHash: varchar("tokenHash", { length: 255 }).notNull(),
  
  // Expiration
  expiresAt: timestamp("expiresAt").notNull(),
  
  // Usage tracking
  usedAt: timestamp("usedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;

// ============================================================================
// EMAIL VERIFICATION TOKENS
// ============================================================================
export const emailVerificationTokens = mysqlTable("email_verification_tokens", {
  id: int("id").autoincrement().primaryKey(),
  
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Token (hashed)
  tokenHash: varchar("tokenHash", { length: 255 }).notNull(),
  
  // Expiration
  expiresAt: timestamp("expiresAt").notNull(),
  
  // Usage tracking
  usedAt: timestamp("usedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailVerificationToken = typeof emailVerificationTokens.$inferSelect;
export type InsertEmailVerificationToken = typeof emailVerificationTokens.$inferInsert;

// ============================================================================
// USER SESSIONS (For custom auth - httpOnly cookies)
// ============================================================================
export const userSessions = mysqlTable("user_sessions", {
  id: int("id").autoincrement().primaryKey(),
  
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Session token (hashed)
  tokenHash: varchar("tokenHash", { length: 255 }).notNull().unique(),
  
  // Device/browser info
  userAgent: text("userAgent"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  
  // Expiration
  expiresAt: timestamp("expiresAt").notNull(),
  
  // Last activity
  lastActivityAt: timestamp("lastActivityAt").defaultNow().notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = typeof userSessions.$inferInsert;

// ============================================================================
// SUBSCRIPTIONS (Stripe recurring billing)
// ============================================================================
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Stripe IDs
  stripeCustomerId: varchar("stripeCustomerId", { length: 100 }).notNull(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 100 }).notNull().unique(),
  stripePriceId: varchar("stripePriceId", { length: 100 }).notNull(),
  
  // Plan details
  planType: mysqlEnum("planType", ["monthly", "annual"]).notNull(),
  planName: varchar("planName", { length: 100 }).notNull(), // e.g., "Premium Membership", "Prof Steven AI Premium"
  
  // Status
  status: mysqlEnum("status", [
    "active",
    "past_due",
    "canceled",
    "unpaid",
    "trialing",
    "paused"
  ]).default("active").notNull(),
  
  // Billing period
  currentPeriodStart: timestamp("currentPeriodStart").notNull(),
  currentPeriodEnd: timestamp("currentPeriodEnd").notNull(),
  
  // Cancellation
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").default(false),
  canceledAt: timestamp("canceledAt"),
  
  // Trial
  trialStart: timestamp("trialStart"),
  trialEnd: timestamp("trialEnd"),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

// ============================================================================
// SUBSCRIPTION PLANS (Available plans)
// ============================================================================
export const subscriptionPlans = mysqlTable("subscription_plans", {
  id: int("id").autoincrement().primaryKey(),
  
  // Plan identification
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  
  // Stripe Price IDs
  stripePriceIdMonthly: varchar("stripePriceIdMonthly", { length: 100 }),
  stripePriceIdAnnual: varchar("stripePriceIdAnnual", { length: 100 }),
  
  // Pricing (in cents)
  priceMonthly: int("priceMonthly").notNull(),
  priceAnnual: int("priceAnnual").notNull(),
  
  // Features (JSON array of feature strings)
  features: json("features"),
  
  // Limits
  maxCoachingSessions: int("maxCoachingSessions"), // null = unlimited
  maxAiConversations: int("maxAiConversations"), // null = unlimited
  maxCourseAccess: int("maxCourseAccess"), // null = unlimited
  
  // Display
  isPopular: boolean("isPopular").default(false),
  sortOrder: int("sortOrder").default(0),
  
  // Status
  isActive: boolean("isActive").default(true),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;

// ============================================================================
// EMAIL LOGS (Track sent emails)
// ============================================================================
export const emailLogs = mysqlTable("email_logs", {
  id: int("id").autoincrement().primaryKey(),
  
  // Recipient
  userId: int("userId").references(() => users.id),
  toEmail: varchar("toEmail", { length: 320 }).notNull(),
  
  // Email details
  type: mysqlEnum("type", [
    "booking_confirmation",
    "reminder_24h",
    "reminder_1h",
    "password_reset",
    "email_verification",
    "welcome",
    "subscription_created",
    "subscription_canceled",
    "payment_failed",
    "session_completed"
  ]).notNull(),
  
  subject: varchar("subject", { length: 500 }).notNull(),
  
  // Related entity
  relatedType: mysqlEnum("relatedType", ["session", "subscription", "user"]),
  relatedId: int("relatedId"),
  
  // Status
  status: mysqlEnum("status", ["sent", "failed", "bounced"]).default("sent"),
  errorMessage: text("errorMessage"),
  
  // Provider tracking
  providerMessageId: varchar("providerMessageId", { length: 255 }),
  
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailLog = typeof emailLogs.$inferSelect;
export type InsertEmailLog = typeof emailLogs.$inferInsert;


// ============================================================================
// LEARNER GAMIFICATION - XP & LEVELS
// ============================================================================
export const learnerXp = mysqlTable("learner_xp", {
  id: int("id").autoincrement().primaryKey(),
  
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  
  // XP Totals
  totalXp: int("totalXp").default(0).notNull(),
  weeklyXp: int("weeklyXp").default(0).notNull(),
  monthlyXp: int("monthlyXp").default(0).notNull(),
  
  // Level System
  currentLevel: int("currentLevel").default(1).notNull(),
  levelTitle: varchar("levelTitle", { length: 50 }).default("Beginner").notNull(),
  
  // Streaks
  currentStreak: int("currentStreak").default(0).notNull(),
  longestStreak: int("longestStreak").default(0).notNull(),
  lastActivityDate: timestamp("lastActivityDate"),
  streakFreezeAvailable: boolean("streakFreezeAvailable").default(true),
  streakFreezeCount: int("streakFreezeCount").default(2).notNull(), // Number of freezes available (max 3)
  
  // Milestones reached (JSON array of milestone IDs)
  milestonesReached: json("milestonesReached").$type<number[]>(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LearnerXp = typeof learnerXp.$inferSelect;
export type InsertLearnerXp = typeof learnerXp.$inferInsert;

// ============================================================================
// XP TRANSACTIONS (Track all XP earned/spent)
// ============================================================================
export const xpTransactions = mysqlTable("xp_transactions", {
  id: int("id").autoincrement().primaryKey(),
  
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // XP Details
  amount: int("amount").notNull(), // Positive for earned, negative for spent
  reason: mysqlEnum("reason", [
    "lesson_complete",
    "quiz_pass",
    "quiz_perfect",
    "module_complete",
    "course_complete",
    "streak_bonus",
    "daily_login",
    "first_lesson",
    "challenge_complete",
    "review_submitted",
    "note_created",
    "exercise_complete",
    "speaking_practice",
    "writing_submitted",
    "milestone_bonus",
    "level_up_bonus",
    "referral_bonus",
  ]).notNull(),
  
  description: varchar("description", { length: 255 }),
  
  // Reference to related entity
  referenceType: varchar("referenceType", { length: 50 }), // lesson, quiz, course, etc.
  referenceId: int("referenceId"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type XpTransaction = typeof xpTransactions.$inferSelect;
export type InsertXpTransaction = typeof xpTransactions.$inferInsert;

// ============================================================================
// LEARNER BADGES (Achievements earned by learners)
// ============================================================================
export const learnerBadges = mysqlTable("learner_badges", {
  id: int("id").autoincrement().primaryKey(),
  
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Badge Type
  badgeType: mysqlEnum("badgeType", [
    // Course Progress
    "first_lesson",
    "module_complete",
    "course_complete",
    "all_courses_complete",
    
    // Streaks
    "streak_3",
    "streak_7",
    "streak_14",
    "streak_30",
    "streak_100",
    
    // Quiz Performance
    "quiz_ace",
    "perfect_module",
    "quiz_master",
    
    // Engagement
    "early_bird",
    "night_owl",
    "weekend_warrior",
    "consistent_learner",
    
    // Milestones
    "xp_100",
    "xp_500",
    "xp_1000",
    "xp_5000",
    
    // Special
    "founding_member",
    "beta_tester",
    "community_helper",
    "top_reviewer",
    
    // Path Completion
    "path_a1_complete",
    "path_a2_complete",
    "path_b1_complete",
    "path_b2_complete",
    "path_c1_complete",
    "path_exam_complete",
    "all_paths_complete",
    "speed_learner",
  ]).notNull(),
  
  // Badge Details
  title: varchar("title", { length: 100 }).notNull(),
  titleFr: varchar("titleFr", { length: 100 }),
  description: varchar("description", { length: 255 }),
  descriptionFr: varchar("descriptionFr", { length: 255 }),
  iconUrl: varchar("iconUrl", { length: 500 }),
  
  // Context
  courseId: int("courseId").references(() => courses.id),
  moduleId: int("moduleId").references(() => courseModules.id),
  
  // Metadata
  metadata: json("metadata"), // Additional data like { streak: 7, score: 100 }
  
  awardedAt: timestamp("awardedAt").defaultNow().notNull(),
  isNew: boolean("isNew").default(true), // For "new badge" notification
});

export type LearnerBadge = typeof learnerBadges.$inferSelect;
export type InsertLearnerBadge = typeof learnerBadges.$inferInsert;

// ============================================================================
// COURSE COMMENTS (Comments on lessons/modules)
// ============================================================================
export const courseComments = mysqlTable("course_comments", {
  id: int("id").autoincrement().primaryKey(),
  
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Target (lesson or module)
  lessonId: int("lessonId").references(() => lessons.id),
  moduleId: int("moduleId").references(() => courseModules.id),
  courseId: int("courseId").notNull().references(() => courses.id),
  
  // Comment content
  content: text("content").notNull(),
  
  // Threading
  parentId: int("parentId"), // For replies
  
  // Moderation
  isApproved: boolean("isApproved").default(true),
  isHidden: boolean("isHidden").default(false),
  
  // Stats
  likesCount: int("likesCount").default(0),
  repliesCount: int("repliesCount").default(0),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CourseComment = typeof courseComments.$inferSelect;
export type InsertCourseComment = typeof courseComments.$inferInsert;

// ============================================================================
// COMMENT LIKES
// ============================================================================
export const commentLikes = mysqlTable("comment_likes", {
  id: int("id").autoincrement().primaryKey(),
  
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  commentId: int("commentId").notNull().references(() => courseComments.id, { onDelete: "cascade" }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CommentLike = typeof commentLikes.$inferSelect;
export type InsertCommentLike = typeof commentLikes.$inferInsert;

// ============================================================================
// LEARNER NOTES (Personal notes/highlights on lessons)
// ============================================================================
export const learnerNotes = mysqlTable("learner_notes", {
  id: int("id").autoincrement().primaryKey(),
  
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  lessonId: int("lessonId").notNull().references(() => lessons.id),
  courseId: int("courseId").notNull().references(() => courses.id),
  
  // Note content
  content: text("content").notNull(),
  
  // Highlight (optional - for text highlighting)
  highlightText: text("highlightText"),
  highlightPosition: json("highlightPosition"), // { start: number, end: number }
  
  // Tags for organization
  tags: json("tags").$type<string[]>(),
  
  // Pinned for quick access
  isPinned: boolean("isPinned").default(false),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LearnerNote = typeof learnerNotes.$inferSelect;
export type InsertLearnerNote = typeof learnerNotes.$inferInsert;

// ============================================================================
// CONFIDENCE CHECKS (Micro-surveys after lessons)
// ============================================================================
export const confidenceChecks = mysqlTable("confidence_checks", {
  id: int("id").autoincrement().primaryKey(),
  
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  lessonId: int("lessonId").notNull().references(() => lessons.id),
  courseId: int("courseId").notNull().references(() => courses.id),
  
  // Confidence rating (1-5)
  confidenceLevel: int("confidenceLevel").notNull(),
  
  // Optional feedback
  feedback: text("feedback"),
  
  // What they want to review
  needsReview: json("needsReview").$type<string[]>(), // ["vocabulary", "grammar", "pronunciation"]
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ConfidenceCheck = typeof confidenceChecks.$inferSelect;
export type InsertConfidenceCheck = typeof confidenceChecks.$inferInsert;

// ============================================================================
// PRACTICE LOGS (Track practice time and activities)
// ============================================================================
export const practiceLogs = mysqlTable("practice_logs", {
  id: int("id").autoincrement().primaryKey(),
  
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Practice type
  practiceType: mysqlEnum("practiceType", [
    "oral_practice",
    "writing_practice",
    "reading_practice",
    "listening_practice",
    "vocabulary_drill",
    "grammar_exercise",
    "speaking_prompt",
    "role_play",
  ]).notNull(),
  
  // Duration in seconds
  durationSeconds: int("durationSeconds").notNull(),
  
  // Related content
  lessonId: int("lessonId").references(() => lessons.id),
  courseId: int("courseId").references(() => courses.id),
  
  // Self-rating (1-5)
  selfRating: int("selfRating"),
  
  // Notes
  notes: text("notes"),
  
  // XP earned
  xpEarned: int("xpEarned").default(0),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PracticeLog = typeof practiceLogs.$inferSelect;
export type InsertPracticeLog = typeof practiceLogs.$inferInsert;

// ============================================================================
// WEEKLY CHALLENGES (Challenge mode)
// ============================================================================
export const weeklyChallenges = mysqlTable("weekly_challenges", {
  id: int("id").autoincrement().primaryKey(),
  
  // Challenge details
  title: varchar("title", { length: 200 }).notNull(),
  titleFr: varchar("titleFr", { length: 200 }),
  description: text("description").notNull(),
  descriptionFr: text("descriptionFr"),
  
  // Challenge type
  challengeType: mysqlEnum("challengeType", [
    "oral_challenge",
    "writing_prompt",
    "reading_challenge",
    "vocabulary_sprint",
    "grammar_gauntlet",
    "conversation_practice",
  ]).notNull(),
  
  // Requirements
  targetCount: int("targetCount").notNull(), // e.g., 5 lessons, 10 minutes
  targetUnit: varchar("targetUnit", { length: 50 }).notNull(), // lessons, minutes, exercises
  
  // Rewards
  xpReward: int("xpReward").notNull(),
  badgeReward: varchar("badgeReward", { length: 50 }), // Badge type to award
  
  // Period
  weekStart: timestamp("weekStart").notNull(),
  weekEnd: timestamp("weekEnd").notNull(),
  
  // Status
  isActive: boolean("isActive").default(true),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WeeklyChallenge = typeof weeklyChallenges.$inferSelect;
export type InsertWeeklyChallenge = typeof weeklyChallenges.$inferInsert;

// ============================================================================
// USER CHALLENGE PARTICIPATION
// ============================================================================
export const userWeeklyChallenges = mysqlTable("user_weekly_challenges", {
  id: int("id").autoincrement().primaryKey(),
  
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  challengeId: int("challengeId").notNull().references(() => weeklyChallenges.id),
  
  // Progress
  currentProgress: int("currentProgress").default(0).notNull(),
  
  // Status
  status: mysqlEnum("status", ["active", "completed", "expired"]).default("active").notNull(),
  
  // Completion
  completedAt: timestamp("completedAt"),
  xpAwarded: int("xpAwarded"),
  badgeAwarded: boolean("badgeAwarded").default(false),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserWeeklyChallenge = typeof userWeeklyChallenges.$inferSelect;
export type InsertUserWeeklyChallenge = typeof userWeeklyChallenges.$inferInsert;

// ============================================================================
// LIVE ROOMS (Live sessions embedded in courses)
// ============================================================================
export const liveRooms = mysqlTable("live_rooms", {
  id: int("id").autoincrement().primaryKey(),
  
  // Room details
  title: varchar("title", { length: 200 }).notNull(),
  titleFr: varchar("titleFr", { length: 200 }),
  description: text("description"),
  descriptionFr: text("descriptionFr"),
  
  // Associated course/module (optional)
  courseId: int("courseId").references(() => courses.id),
  moduleId: int("moduleId").references(() => courseModules.id),
  
  // Host
  hostId: int("hostId").notNull().references(() => users.id),
  
  // Scheduling
  scheduledAt: timestamp("scheduledAt").notNull(),
  durationMinutes: int("durationMinutes").default(60),
  
  // Meeting details
  meetingUrl: varchar("meetingUrl", { length: 500 }),
  meetingProvider: mysqlEnum("meetingProvider", ["zoom", "google_meet", "teams", "internal"]).default("zoom"),
  recordingUrl: varchar("recordingUrl", { length: 500 }),
  
  // Capacity
  maxParticipants: int("maxParticipants").default(50),
  currentParticipants: int("currentParticipants").default(0),
  
  // Status
  status: mysqlEnum("status", ["scheduled", "live", "completed", "cancelled"]).default("scheduled"),
  
  // XP for attendance
  attendanceXp: int("attendanceXp").default(50),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LiveRoom = typeof liveRooms.$inferSelect;
export type InsertLiveRoom = typeof liveRooms.$inferInsert;

// ============================================================================
// LIVE ROOM REGISTRATIONS
// ============================================================================
export const liveRoomRegistrations = mysqlTable("live_room_registrations", {
  id: int("id").autoincrement().primaryKey(),
  
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  roomId: int("roomId").notNull().references(() => liveRooms.id),
  
  // Attendance
  attended: boolean("attended").default(false),
  joinedAt: timestamp("joinedAt"),
  leftAt: timestamp("leftAt"),
  
  // XP awarded
  xpAwarded: int("xpAwarded"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LiveRoomRegistration = typeof liveRoomRegistrations.$inferSelect;
export type InsertLiveRoomRegistration = typeof liveRoomRegistrations.$inferInsert;

// ============================================================================
// DOWNLOADABLE RESOURCES (PDFs, templates, etc.)
// ============================================================================
export const downloadableResources = mysqlTable("downloadable_resources", {
  id: int("id").autoincrement().primaryKey(),
  
  // Resource details
  title: varchar("title", { length: 200 }).notNull(),
  titleFr: varchar("titleFr", { length: 200 }),
  description: text("description"),
  descriptionFr: text("descriptionFr"),
  
  // File details
  fileUrl: varchar("fileUrl", { length: 500 }).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileType: varchar("fileType", { length: 50 }).notNull(), // pdf, docx, xlsx, etc.
  fileSizeBytes: int("fileSizeBytes"),
  
  // Associated content
  lessonId: int("lessonId").references(() => lessons.id),
  moduleId: int("moduleId").references(() => courseModules.id),
  courseId: int("courseId").references(() => courses.id),
  
  // Access control
  requiresEnrollment: boolean("requiresEnrollment").default(true),
  
  // Stats
  downloadCount: int("downloadCount").default(0),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DownloadableResource = typeof downloadableResources.$inferSelect;
export type InsertDownloadableResource = typeof downloadableResources.$inferInsert;

// ============================================================================
// RESOURCE DOWNLOADS (Track downloads)
// ============================================================================
export const resourceDownloads = mysqlTable("resource_downloads", {
  id: int("id").autoincrement().primaryKey(),
  
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  resourceId: int("resourceId").notNull().references(() => downloadableResources.id),
  
  downloadedAt: timestamp("downloadedAt").defaultNow().notNull(),
});

export type ResourceDownload = typeof resourceDownloads.$inferSelect;
export type InsertResourceDownload = typeof resourceDownloads.$inferInsert;

// ============================================================================
// DRIP CONTENT SCHEDULES (Release content over time)
// ============================================================================
export const dripSchedules = mysqlTable("drip_schedules", {
  id: int("id").autoincrement().primaryKey(),
  
  courseId: int("courseId").notNull().references(() => courses.id),
  
  // Target content
  moduleId: int("moduleId").references(() => courseModules.id),
  lessonId: int("lessonId").references(() => lessons.id),
  
  // Drip timing
  dripType: mysqlEnum("dripType", [
    "days_after_enrollment", // X days after user enrolls
    "fixed_date", // Specific date
    "after_completion", // After completing previous module/lesson
  ]).notNull(),
  
  // For days_after_enrollment
  daysAfterEnrollment: int("daysAfterEnrollment"),
  
  // For fixed_date
  releaseDate: timestamp("releaseDate"),
  
  // For after_completion
  prerequisiteModuleId: int("prerequisiteModuleId").references(() => courseModules.id),
  prerequisiteLessonId: int("prerequisiteLessonId").references(() => lessons.id),
  
  // Email notification when content unlocks
  sendNotification: boolean("sendNotification").default(true),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DripSchedule = typeof dripSchedules.$inferSelect;
export type InsertDripSchedule = typeof dripSchedules.$inferInsert;

// ============================================================================
// USER CONTENT ACCESS (Track what content is unlocked for each user)
// ============================================================================
export const userContentAccess = mysqlTable("user_content_access", {
  id: int("id").autoincrement().primaryKey(),
  
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  enrollmentId: int("enrollmentId").notNull().references(() => courseEnrollments.id),
  
  // Content reference
  moduleId: int("moduleId").references(() => courseModules.id),
  lessonId: int("lessonId").references(() => lessons.id),
  
  // Access details
  unlockedAt: timestamp("unlockedAt").defaultNow().notNull(),
  unlockedBy: mysqlEnum("unlockedBy", ["enrollment", "drip", "admin", "purchase"]).default("enrollment"),
  
  // Notification sent
  notificationSent: boolean("notificationSent").default(false),
});

export type UserContentAccess = typeof userContentAccess.$inferSelect;
export type InsertUserContentAccess = typeof userContentAccess.$inferInsert;

// ============================================================================
// INTERACTIVE EXERCISES (Inline exercises in lessons)
// ============================================================================
export const interactiveExercises = mysqlTable("interactive_exercises", {
  id: int("id").autoincrement().primaryKey(),
  
  lessonId: int("lessonId").notNull().references(() => lessons.id),
  courseId: int("courseId").notNull().references(() => courses.id),
  
  // Exercise details
  title: varchar("title", { length: 200 }).notNull(),
  titleFr: varchar("titleFr", { length: 200 }),
  instructions: text("instructions").notNull(),
  instructionsFr: text("instructionsFr"),
  
  // Exercise type
  exerciseType: mysqlEnum("exerciseType", [
    "drag_drop",
    "fill_blanks",
    "multiple_choice",
    "matching",
    "ordering",
    "speaking_prompt",
    "writing_prompt",
    "role_play",
    "scenario_choice",
    "audio_response",
  ]).notNull(),
  
  // Exercise content (JSON structure depends on type)
  content: json("content").notNull(),
  
  // Correct answer(s)
  correctAnswer: json("correctAnswer"),
  
  // Model answer (shown after attempt)
  modelAnswer: text("modelAnswer"),
  modelAnswerFr: text("modelAnswerFr"),
  
  // Scoring
  maxPoints: int("maxPoints").default(10),
  xpReward: int("xpReward").default(5),
  
  // Timing (for speaking prompts)
  timeLimitSeconds: int("timeLimitSeconds"),
  
  // Self-rating rubric (for speaking/writing)
  rubric: json("rubric").$type<{
    criteria: string;
    criteriaFr?: string;
    levels: { score: number; description: string; descriptionFr?: string }[];
  }[]>(),
  
  // Ordering
  orderIndex: int("orderIndex").default(0),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InteractiveExercise = typeof interactiveExercises.$inferSelect;
export type InsertInteractiveExercise = typeof interactiveExercises.$inferInsert;

// ============================================================================
// EXERCISE ATTEMPTS (Track user attempts at exercises)
// ============================================================================
export const exerciseAttempts = mysqlTable("exercise_attempts", {
  id: int("id").autoincrement().primaryKey(),
  
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  exerciseId: int("exerciseId").notNull().references(() => interactiveExercises.id),
  
  // User's answer
  userAnswer: json("userAnswer"),
  
  // For audio/speaking responses
  audioUrl: varchar("audioUrl", { length: 500 }),
  
  // Scoring
  score: int("score"),
  maxScore: int("maxScore"),
  isCorrect: boolean("isCorrect"),
  
  // Self-rating (for speaking/writing)
  selfRating: int("selfRating"),
  
  // XP earned
  xpEarned: int("xpEarned").default(0),
  
  // Time taken (seconds)
  timeTakenSeconds: int("timeTakenSeconds"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ExerciseAttempt = typeof exerciseAttempts.$inferSelect;
export type InsertExerciseAttempt = typeof exerciseAttempts.$inferInsert;

// ============================================================================
// COACH NUDGES (Humanized "you're on track" messages)
// ============================================================================
export const coachNudges = mysqlTable("coach_nudges", {
  id: int("id").autoincrement().primaryKey(),
  
  // Nudge content
  message: text("message").notNull(),
  messageFr: text("messageFr"),
  
  // Trigger conditions
  triggerType: mysqlEnum("triggerType", [
    "lesson_complete",
    "module_complete",
    "streak_milestone",
    "comeback",
    "slow_progress",
    "quiz_fail",
    "quiz_pass",
    "first_login",
    "weekly_summary",
    "encouragement",
  ]).notNull(),
  
  // Conditions (JSON)
  conditions: json("conditions"), // e.g., { streakDays: 7 }, { daysInactive: 3 }
  
  // Coach persona
  coachName: varchar("coachName", { length: 100 }).default("Prof. Steven"),
  coachAvatarUrl: varchar("coachAvatarUrl", { length: 500 }),
  
  // Active status
  isActive: boolean("isActive").default(true),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CoachNudge = typeof coachNudges.$inferSelect;
export type InsertCoachNudge = typeof coachNudges.$inferInsert;

// ============================================================================
// USER NUDGE HISTORY (Track which nudges were shown to users)
// ============================================================================
export const userNudgeHistory = mysqlTable("user_nudge_history", {
  id: int("id").autoincrement().primaryKey(),
  
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  nudgeId: int("nudgeId").notNull().references(() => coachNudges.id),
  
  // When shown
  shownAt: timestamp("shownAt").defaultNow().notNull(),
  
  // User interaction
  dismissed: boolean("dismissed").default(false),
  clickedAction: boolean("clickedAction").default(false),
});

export type UserNudgeHistory = typeof userNudgeHistory.$inferSelect;
export type InsertUserNudgeHistory = typeof userNudgeHistory.$inferInsert;


// ============================================================================
// COHORTS (Teams/Groups within Organizations for HR Dashboard)
// ============================================================================
export const cohorts = mysqlTable("cohorts", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  
  // Basic Info
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Department/Team Info
  department: varchar("department", { length: 200 }),
  manager: varchar("manager", { length: 255 }),
  managerEmail: varchar("managerEmail", { length: 320 }),
  
  // Target Levels
  targetLevel: json("targetLevel"), // { reading: 'B', writing: 'B', oral: 'C' }
  targetDate: timestamp("targetDate"),
  
  // Status
  status: mysqlEnum("status", ["active", "inactive", "completed", "archived"]).default("active"),
  
  // Stats (cached for performance)
  memberCount: int("memberCount").default(0),
  avgProgress: int("avgProgress").default(0), // percentage
  completionRate: int("completionRate").default(0), // percentage
  
  // Metadata
  createdBy: int("createdBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Cohort = typeof cohorts.$inferSelect;
export type InsertCohort = typeof cohorts.$inferInsert;

// ============================================================================
// COHORT MEMBERS (Link users to cohorts)
// ============================================================================
export const cohortMembers = mysqlTable("cohort_members", {
  id: int("id").autoincrement().primaryKey(),
  cohortId: int("cohortId").notNull().references(() => cohorts.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Member Info
  role: mysqlEnum("role", ["member", "lead"]).default("member"),
  
  // Progress
  currentProgress: int("currentProgress").default(0), // percentage
  lastActiveAt: timestamp("lastActiveAt"),
  
  // Status
  status: mysqlEnum("status", ["active", "inactive", "completed"]).default("active"),
  
  // Metadata
  addedBy: int("addedBy").references(() => users.id),
  addedAt: timestamp("addedAt").defaultNow().notNull(),
});

export type CohortMember = typeof cohortMembers.$inferSelect;
export type InsertCohortMember = typeof cohortMembers.$inferInsert;

// ============================================================================
// COURSE ASSIGNMENTS (Assign courses/paths to cohorts or individuals)
// ============================================================================
export const courseAssignments = mysqlTable("course_assignments", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  
  // Assignment Target (either cohort or individual user)
  cohortId: int("cohortId").references(() => cohorts.id, { onDelete: "cascade" }),
  userId: int("userId").references(() => users.id, { onDelete: "cascade" }),
  
  // Course/Path
  courseId: int("courseId").references(() => courses.id, { onDelete: "cascade" }),
  pathId: int("pathId"), // For learning paths (future)
  
  // Assignment Details
  assignmentType: mysqlEnum("assignmentType", ["required", "optional", "recommended"]).default("required"),
  priority: int("priority").default(0),
  
  // Timeline
  startDate: timestamp("startDate"),
  dueDate: timestamp("dueDate"),
  
  // Target Level
  targetLevel: mysqlEnum("targetLevel", ["BBB", "CBC", "CCC"]),
  
  // Status
  status: mysqlEnum("status", ["active", "completed", "cancelled", "expired"]).default("active"),
  
  // Metadata
  assignedBy: int("assignedBy").references(() => users.id),
  assignedAt: timestamp("assignedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  
  // Notes
  notes: text("notes"),
});

export type CourseAssignment = typeof courseAssignments.$inferSelect;
export type InsertCourseAssignment = typeof courseAssignments.$inferInsert;

// ============================================================================
// HR AUDIT LOG (Track HR admin actions for compliance)
// ============================================================================
export const hrAuditLog = mysqlTable("hr_audit_log", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  
  // Actor
  userId: int("userId").notNull().references(() => users.id),
  
  // Action Details
  action: mysqlEnum("action", [
    "cohort_created",
    "cohort_updated",
    "cohort_deleted",
    "member_added",
    "member_removed",
    "course_assigned",
    "course_unassigned",
    "report_exported",
    "learner_invited",
    "settings_changed",
  ]).notNull(),
  
  // Target Entity
  targetType: varchar("targetType", { length: 50 }), // 'cohort', 'user', 'assignment'
  targetId: int("targetId"),
  
  // Details
  details: json("details"), // Additional context
  
  // Metadata
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HrAuditLog = typeof hrAuditLog.$inferSelect;
export type InsertHrAuditLog = typeof hrAuditLog.$inferInsert;


// ============================================================================
// COACH INVITATIONS (For coaches to claim their pre-created profiles)
// ============================================================================
export const coachInvitations = mysqlTable("coach_invitations", {
  id: int("id").autoincrement().primaryKey(),
  coachProfileId: int("coachProfileId").notNull().references(() => coachProfiles.id, { onDelete: "cascade" }),
  
  // Invitation Token (unique, secure)
  token: varchar("token", { length: 64 }).notNull().unique(),
  
  // Coach Email (for verification)
  email: varchar("email", { length: 320 }).notNull(),
  
  // Status
  status: mysqlEnum("status", ["pending", "claimed", "expired", "revoked"]).default("pending"),
  
  // Expiration
  expiresAt: timestamp("expiresAt").notNull(),
  
  // Claimed Info
  claimedAt: timestamp("claimedAt"),
  claimedByUserId: int("claimedByUserId").references(() => users.id),
  
  // Metadata
  createdBy: int("createdBy").references(() => users.id), // Admin who created the invitation
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CoachInvitation = typeof coachInvitations.$inferSelect;
export type InsertCoachInvitation = typeof coachInvitations.$inferInsert;


// ============================================================================
// SLE PRACTICE QUESTIONS (For simulation mode and practice)
// ============================================================================
export const slePracticeQuestions = mysqlTable("sle_practice_questions", {
  id: int("id").autoincrement().primaryKey(),
  
  // Question Type and Level
  examType: mysqlEnum("examType", ["reading", "writing", "oral"]).notNull(),
  level: mysqlEnum("level", ["A", "B", "C"]).notNull(),
  language: mysqlEnum("language", ["french", "english"]).default("french"),
  
  // Question Content
  questionText: text("questionText").notNull(),
  questionTextFr: text("questionTextFr"), // French version if primary is English
  
  // For Reading: passage to read
  passageText: text("passageText"),
  passageTextFr: text("passageTextFr"),
  
  // For Writing: prompt/scenario
  writingPrompt: text("writingPrompt"),
  writingPromptFr: text("writingPromptFr"),
  
  // For Oral: audio prompt URL or scenario description
  oralPrompt: text("oralPrompt"),
  oralPromptFr: text("oralPromptFr"),
  audioUrl: text("audioUrl"),
  
  // Answer Options (for multiple choice reading questions)
  options: json("options"), // [{ id: 'a', text: '...', textFr: '...' }, ...]
  correctAnswer: varchar("correctAnswer", { length: 10 }), // 'a', 'b', 'c', 'd' for MC
  
  // For Writing/Oral: sample answer and rubric
  sampleAnswer: text("sampleAnswer"),
  sampleAnswerFr: text("sampleAnswerFr"),
  rubric: json("rubric"), // Scoring criteria
  
  // Metadata
  difficulty: int("difficulty").default(1), // 1-5 scale within level
  timeLimit: int("timeLimit").default(60), // seconds
  points: int("points").default(1),
  tags: json("tags"), // ['grammar', 'vocabulary', 'comprehension', etc.]
  
  // Status
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SlePracticeQuestion = typeof slePracticeQuestions.$inferSelect;
export type InsertSlePracticeQuestion = typeof slePracticeQuestions.$inferInsert;

// ============================================================================
// SLE PRACTICE ATTEMPTS (Track user attempts for analytics)
// ============================================================================
export const slePracticeAttempts = mysqlTable("sle_practice_attempts", {
  id: int("id").autoincrement().primaryKey(),
  
  // User and Question
  userId: int("userId").notNull().references(() => users.id),
  questionId: int("questionId").notNull().references(() => slePracticeQuestions.id),
  
  // Session Context
  sessionType: mysqlEnum("sessionType", ["practice", "simulation", "assessment"]).default("practice"),
  
  // Answer
  userAnswer: text("userAnswer"),
  isCorrect: boolean("isCorrect"),
  score: int("score"), // 0-100 for writing/oral
  
  // Timing
  timeSpent: int("timeSpent"), // seconds
  
  // AI Feedback (for writing/oral)
  aiFeedback: text("aiFeedback"),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SlePracticeAttempt = typeof slePracticeAttempts.$inferSelect;
export type InsertSlePracticeAttempt = typeof slePracticeAttempts.$inferInsert;


// ============================================================================
// LEARNING PATHS (Path Series™ - Structured Learning Journeys)
// ============================================================================
export const learningPaths = mysqlTable("learning_paths", {
  id: int("id").autoincrement().primaryKey(),
  
  // Basic Info
  title: varchar("title", { length: 255 }).notNull(),
  titleFr: varchar("titleFr", { length: 255 }),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  subtitle: varchar("subtitle", { length: 500 }),
  subtitleFr: varchar("subtitleFr", { length: 500 }),
  description: text("description"),
  descriptionFr: text("descriptionFr"),
  
  // Level & Categorization (matches actual DB columns)
  level: mysqlEnum("level", ["A1", "A2", "B1", "B2", "C1", "exam_prep"]).notNull(),
  cefrLevel: varchar("cefrLevel", { length: 20 }),
  pflLevel: varchar("pflLevel", { length: 50 }),
  
  // Pricing (in CAD cents as decimal)
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("originalPrice", { precision: 10, scale: 2 }),
  discountPercentage: int("discountPercentage"),
  
  // Duration & Structure
  durationWeeks: int("durationWeeks"),
  structuredHours: int("structuredHours"),
  practiceHoursMin: int("practiceHoursMin"),
  practiceHoursMax: int("practiceHoursMax"),
  totalModules: int("totalModules"),
  totalLessons: int("totalLessons"),
  
  // Content (JSON columns)
  objectives: json("objectives"),
  outcomes: json("outcomes"),
  whoIsThisFor: json("whoIsThisFor"),
  whatYouWillLearn: json("whatYouWillLearn"),
  modules: json("modules"),
  
  // Media
  thumbnailUrl: text("thumbnailUrl"),
  bannerUrl: text("bannerUrl"),
  
  // Status & Display
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft"),
  isFeatured: boolean("isFeatured").default(false),
  displayOrder: int("displayOrder").default(0),
  
  // Stats
  enrollmentCount: int("enrollmentCount").default(0),
  completionRate: int("completionRate").default(0),
  averageRating: decimal("averageRating", { precision: 3, scale: 2 }),
  reviewCount: int("reviewCount").default(0),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type LearningPath = typeof learningPaths.$inferSelect;
export type InsertLearningPath = typeof learningPaths.$inferInsert;

// ============================================================================
// PATH COURSES (Courses included in a Learning Path)
// ============================================================================
export const pathCourses = mysqlTable("path_courses", {
  id: int("id").autoincrement().primaryKey(),
  
  pathId: int("pathId").notNull().references(() => learningPaths.id),
  courseId: int("courseId").notNull().references(() => courses.id),
  
  // Ordering within the path
  orderIndex: int("orderIndex").default(0),
  
  // Optional: Course can be marked as required or optional
  isRequired: boolean("isRequired").default(true),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PathCourse = typeof pathCourses.$inferSelect;
export type InsertPathCourse = typeof pathCourses.$inferInsert;

// ============================================================================
// PATH ENROLLMENTS (User enrollments in Learning Paths)
// ============================================================================
export const pathEnrollments = mysqlTable("path_enrollments", {
  id: int("id").autoincrement().primaryKey(),
  
  userId: int("userId").notNull().references(() => users.id),
  pathId: int("pathId").notNull().references(() => learningPaths.id),
  
  // Status
  status: mysqlEnum("status", ["active", "completed", "paused", "cancelled"]).default("active"),
  
  // Progress tracking
  progressPercentage: decimal("progressPercentage", { precision: 5, scale: 2 }).default("0"),
  currentModuleIndex: int("currentModuleIndex").default(0),
  currentLessonIndex: int("currentLessonIndex").default(0),
  completedCourses: json("completedCourses"),
  
  // Payment
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "refunded"]).default("pending"),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  amountPaid: decimal("amountPaid", { precision: 10, scale: 2 }),
  
  // Timestamps
  enrolledAt: timestamp("enrolledAt").defaultNow().notNull(),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PathEnrollment = typeof pathEnrollments.$inferSelect;
export type InsertPathEnrollment = typeof pathEnrollments.$inferInsert;

// ============================================================================
// PATH REVIEWS (User reviews for Learning Paths)
// ============================================================================
export const pathReviews = mysqlTable("path_reviews", {
  id: int("id").autoincrement().primaryKey(),
  
  pathId: int("pathId").notNull().references(() => learningPaths.id),
  userId: int("userId").notNull().references(() => users.id),
  enrollmentId: int("enrollmentId").references(() => pathEnrollments.id),
  
  // Review content
  rating: int("rating").notNull(), // 1-5
  title: varchar("title", { length: 200 }),
  content: text("content"),
  
  // Helpful votes
  helpfulCount: int("helpfulCount").default(0),
  
  // Status
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending"),
  approvedAt: timestamp("approvedAt"),
  approvedBy: int("approvedBy").references(() => users.id),
  
  // Metadata
  isVerifiedPurchase: boolean("isVerifiedPurchase").default(false),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PathReview = typeof pathReviews.$inferSelect;
export type InsertPathReview = typeof pathReviews.$inferInsert;

// ============================================================================
// SLE AI COMPANION SESSIONS
// ============================================================================
export const sleCompanionSessions = mysqlTable("sle_companion_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id), // nullable for anonymous/guest sessions
  coachKey: mysqlEnum("coachKey", ["STEVEN", "SUE_ANNE", "ERIKA", "PRECIOSA"]).notNull(),
  level: mysqlEnum("level", ["A", "B", "C"]).notNull(),
  skill: mysqlEnum("skill", ["oral_expression", "oral_comprehension", "written_expression", "written_comprehension"]).notNull(),
  topic: varchar("topic", { length: 255 }),
  status: mysqlEnum("status", ["active", "completed", "abandoned"]).default("active").notNull(),
  totalMessages: int("totalMessages").default(0),
  totalDurationSeconds: int("totalDurationSeconds").default(0),
  averageScore: int("averageScore"),
  feedback: text("feedback"),
  // Persisted runtime state (replaces in-memory Maps)
  orchestratorState: json("orchestratorState"),
  difficultyState: json("difficultyState"),
  sessionMode: varchar("sessionMode", { length: 30 }).default("training"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type SleCompanionSession = typeof sleCompanionSessions.$inferSelect;
export type InsertSleCompanionSession = typeof sleCompanionSessions.$inferInsert;

// ============================================================================
// SLE AI COMPANION MESSAGES
// ============================================================================
export const sleCompanionMessages = mysqlTable("sle_companion_messages", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull().references(() => sleCompanionSessions.id),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  audioUrl: text("audioUrl"),
  transcriptionDuration: int("transcriptionDuration"),
  score: int("score"),
  corrections: json("corrections"),
  suggestions: json("suggestions"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SleCompanionMessage = typeof sleCompanionMessages.$inferSelect;
export type InsertSleCompanionMessage = typeof sleCompanionMessages.$inferInsert;


// ============================================================================
// AFFILIATE PARTNERS (Sprint 42)
// ============================================================================
export const affiliatePartners = mysqlTable("affiliate_partners", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  
  // Partner Info
  name: varchar("name", { length: 200 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  referralCode: varchar("referralCode", { length: 20 }).notNull().unique(),
  
  // Tier & Commission
  tier: mysqlEnum("tier", ["bronze", "silver", "gold", "platinum"]).default("bronze"),
  commissionRate: decimal("commissionRate", { precision: 4, scale: 2 }).default("0.10"), // 10% default
  
  // Stats
  totalReferrals: int("totalReferrals").default(0),
  totalEarnings: int("totalEarnings").default(0), // in cents
  pendingEarnings: int("pendingEarnings").default(0),
  paidEarnings: int("paidEarnings").default(0),
  
  // Payment Info
  paymentMethod: mysqlEnum("paymentMethod", ["bank_transfer", "paypal", "stripe"]).default("bank_transfer"),
  paymentDetails: json("paymentDetails"), // encrypted bank/paypal details
  
  // Status
  status: mysqlEnum("status", ["pending", "active", "suspended", "terminated"]).default("pending"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AffiliatePartner = typeof affiliatePartners.$inferSelect;
export type InsertAffiliatePartner = typeof affiliatePartners.$inferInsert;

// ============================================================================
// AFFILIATE REFERRALS
// ============================================================================
export const affiliateReferrals = mysqlTable("affiliate_referrals", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliateId").notNull().references(() => affiliatePartners.id),
  referredUserId: int("referredUserId").notNull().references(() => users.id),
  
  // Tracking
  source: varchar("source", { length: 100 }), // e.g., "blog", "youtube", "direct"
  landingPage: varchar("landingPage", { length: 500 }),
  
  // Conversion
  status: mysqlEnum("status", ["pending", "converted", "expired", "refunded"]).default("pending"),
  orderAmount: int("orderAmount"), // in cents
  commissionAmount: int("commissionAmount"), // in cents
  productType: varchar("productType", { length: 100 }), // e.g., "course", "coaching", "subscription"
  
  convertedAt: timestamp("convertedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AffiliateReferral = typeof affiliateReferrals.$inferSelect;
export type InsertAffiliateReferral = typeof affiliateReferrals.$inferInsert;

// ============================================================================
// AFFILIATE PAYOUTS
// ============================================================================
export const affiliatePayouts = mysqlTable("affiliate_payouts", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliateId").notNull().references(() => affiliatePartners.id),
  
  amount: int("amount").notNull(), // in cents
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending"),
  paymentMethod: mysqlEnum("paymentMethod", ["bank_transfer", "paypal", "stripe"]).default("bank_transfer"),
  
  // Payment details
  transactionId: varchar("transactionId", { length: 100 }),
  notes: text("notes"),
  
  processedAt: timestamp("processedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AffiliatePayout = typeof affiliatePayouts.$inferSelect;
export type InsertAffiliatePayout = typeof affiliatePayouts.$inferInsert;


// ============================================================================
// COACHING PLAN PURCHASES (Track purchased coaching plans - Plans Maison)
// ============================================================================
export const coachingPlanPurchases = mysqlTable("coaching_plan_purchases", {
  id: int("id").autoincrement().primaryKey(),
  
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Plan Details
  planId: varchar("planId", { length: 100 }).notNull(), // e.g., "starter-plan", "accelerator-plan", "immersion-plan"
  planName: varchar("planName", { length: 200 }).notNull(),
  
  // Sessions
  totalSessions: int("totalSessions").notNull(), // Total hours purchased
  remainingSessions: int("remainingSessions").notNull(), // Hours remaining
  
  // Validity
  validityDays: int("validityDays").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  
  // Payment
  amountPaid: varchar("amountPaid", { length: 50 }).notNull(), // Amount in dollars (string for precision)
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 100 }),
  
  // Status
  status: mysqlEnum("status", ["active", "expired", "exhausted", "refunded"]).default("active"),
  
  // Timestamps
  purchasedAt: timestamp("purchasedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CoachingPlanPurchase = typeof coachingPlanPurchases.$inferSelect;
export type InsertCoachingPlanPurchase = typeof coachingPlanPurchases.$inferInsert;

// ============================================================================
// ONBOARDING CONFIG (Admin-configurable onboarding workflow steps)
// ============================================================================
export const onboardingConfig = mysqlTable("onboarding_config", {
  id: int("id").autoincrement().primaryKey(),
  stepKey: varchar("stepKey", { length: 100 }).notNull().unique(),
  stepTitle: varchar("stepTitle", { length: 255 }).notNull(),
  stepDescription: text("stepDescription"),
  actionType: mysqlEnum("actionType", ["email", "notification", "course_assign", "checklist", "redirect"]).notNull(),
  actionConfig: json("actionConfig").$type<Record<string, any>>().default({}),
  isEnabled: boolean("isEnabled").default(true),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type OnboardingConfig = typeof onboardingConfig.$inferSelect;
export type InsertOnboardingConfig = typeof onboardingConfig.$inferInsert;

// ============================================================================
// ONBOARDING PROGRESS (Track per-user onboarding completion)
// ============================================================================
export const onboardingProgress = mysqlTable("onboarding_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  stepKey: varchar("stepKey", { length: 100 }).notNull(),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type OnboardingProgress = typeof onboardingProgress.$inferSelect;
export type InsertOnboardingProgress = typeof onboardingProgress.$inferInsert;

// ============================================================================
// FUNNELS (Marketing conversion pipelines)
// ============================================================================
export const funnels = mysqlTable("funnels", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["draft", "active", "paused", "archived"]).default("draft").notNull(),
  stages: json("stages").$type<Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    config: Record<string, any>;
  }>>().default([]),
  stats: json("stats").$type<{ visitors: number; conversions: number; revenue: number }>().default({ visitors: 0, conversions: 0, revenue: 0 }),
  createdBy: int("createdBy").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Funnel = typeof funnels.$inferSelect;
export type InsertFunnel = typeof funnels.$inferInsert;

// ============================================================================
// AUTOMATIONS (Trigger-based marketing sequences)
// ============================================================================
export const automations = mysqlTable("automations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  triggerType: mysqlEnum("triggerType", [
    "enrollment", "purchase", "course_complete", "lesson_complete",
    "signup", "inactivity", "tag_added", "manual"
  ]).notNull(),
  triggerConfig: json("triggerConfig").$type<Record<string, any>>().default({}),
  status: mysqlEnum("status", ["active", "paused", "draft"]).default("draft").notNull(),
  steps: json("steps").$type<Array<{
    id: string;
    type: string;
    config: Record<string, any>;
  }>>().default([]),
  stats: json("stats").$type<{ triggered: number; completed: number; active: number }>().default({ triggered: 0, completed: 0, active: 0 }),
  createdBy: int("createdBy").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Automation = typeof automations.$inferSelect;
export type InsertAutomation = typeof automations.$inferInsert;

// ============================================================================
// ACTIVITIES (Content items within lessons: exercises, downloads, embeds, etc.)
// ============================================================================
export const activities = mysqlTable("activities", {
  id: int("id").autoincrement().primaryKey(),
  
  // Parent references
  lessonId: int("lessonId").notNull().references(() => lessons.id, { onDelete: "cascade" }),
  moduleId: int("moduleId").notNull().references(() => courseModules.id),
  courseId: int("courseId").notNull().references(() => courses.id),
  
  // 7-Slot System
  slotIndex: int("slotIndex"), // 1-7 mandatory slots, 8+ for extra activities
  slotNumber: int("slotNumber"), // Canonical slot number (1-7 required, 8+ extras)
  isRequired: boolean("isRequired").default(true), // true for slots 1-7
  slotType: mysqlEnum("slotType", [
    "introduction",
    "video_scenario",
    "grammar_point",
    "written_practice",
    "oral_practice",
    "quiz_slot",
    "coaching_tip",
    "extra"
  ]),
  
  // Basic Info (Bilingual)
  title: varchar("title", { length: 200 }).notNull(),
  titleFr: varchar("titleFr", { length: 200 }),
  description: text("description"),
  descriptionFr: text("descriptionFr"),
  
  // Activity Type
  activityType: mysqlEnum("activityType", [
    "video",
    "text",
    "audio",
    "quiz",
    "assignment",
    "download",
    "live_session",
    "embed",
    "speaking_exercise",
    "fill_blank",
    "matching",
    "discussion"
  ]).default("text").notNull(),
  
  // Content (Bilingual)
  content: text("content"), // Rich text (HTML from TipTap)
  contentFr: text("contentFr"), // French version of rich text
  contentJson: json("contentJson"), // TipTap JSON document for editing
  contentJsonFr: json("contentJsonFr"), // French TipTap JSON document
  videoUrl: text("videoUrl"),
  videoProvider: mysqlEnum("videoProvider", ["youtube", "vimeo", "bunny", "self_hosted"]),
  audioUrl: text("audioUrl"),
  downloadUrl: text("downloadUrl"),
  downloadFileName: varchar("downloadFileName", { length: 200 }),
  embedCode: text("embedCode"),
  
  // Media
  thumbnailUrl: text("thumbnailUrl"),
  
  // Duration & Scoring
  estimatedMinutes: int("estimatedMinutes").default(5),
  points: int("points").default(0),
  passingScore: int("passingScore"), // For quiz/assignment activities
  
  // Ordering
  sortOrder: int("sortOrder").default(0),
  
  // Status & Access
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft"),
  isPreview: boolean("isPreview").default(false),
  isMandatory: boolean("isMandatory").default(true),
  
  // Drip / Unlock
  availableAt: timestamp("availableAt"),
  unlockMode: mysqlEnum("unlockMode", ["immediate", "drip", "prerequisite", "manual"]).default("immediate"),
  prerequisiteActivityId: int("prerequisiteActivityId"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = typeof activities.$inferInsert;

// ============================================================================
// ACTIVITY PROGRESS (Track individual activity completion per user)
// ============================================================================
export const activityProgress = mysqlTable("activity_progress", {
  id: int("id").autoincrement().primaryKey(),
  
  activityId: int("activityId").notNull().references(() => activities.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id),
  lessonId: int("lessonId").notNull().references(() => lessons.id),
  courseId: int("courseId").references(() => courses.id),
  
  // Progress
  status: mysqlEnum("status", ["not_started", "in_progress", "completed", "failed"]).default("not_started"),
  score: int("score"), // For scored activities (quiz, assignment)
  attempts: int("attempts").default(0),
  
  // Time tracking
  timeSpentSeconds: int("timeSpentSeconds").default(0),
  
  // Response data (JSON: answers, submission, etc.)
  responseData: json("responseData"),
  
  // Timestamps
  completedAt: timestamp("completedAt"),
  lastAccessedAt: timestamp("lastAccessedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ([
  uniqueIndex("activity_progress_user_activity_idx").on(table.userId, table.activityId),
]));
export type ActivityProgress = typeof activityProgress.$inferSelect;
export type InsertActivityProgress = typeof activityProgress.$inferInsert;

// ============================================================================
// ADMIN INVITATIONS
// ============================================================================
export const adminInvitations = mysqlTable("admin_invitations", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  role: mysqlEnum("role", ["admin", "hr_admin", "coach", "learner", "user"]).default("learner").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  invitedBy: int("invitedBy").notNull().references(() => users.id),
  status: mysqlEnum("status", ["pending", "accepted", "revoked", "expired"]).default("pending").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  acceptedAt: timestamp("acceptedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AdminInvitation = typeof adminInvitations.$inferSelect;
export type InsertAdminInvitation = typeof adminInvitations.$inferInsert;

// ============================================================================
// SLE AI COMPANION — PRODUCTION TABLES (PR1)
// Re-exported from dedicated module for Drizzle migration compatibility
// ============================================================================
export {
  sleProficiencyStandards,
  sleEvaluationRubrics,
  sleErrorTaxonomy,
  sleOralScenarios,
  sleModelAnswers,
  sleUserSessions,
  sleInteractionLogs,
  sleUserProfiles,
  sleSkillTrend,
  sleKnowledgeCollections,
} from "./sle-schema";
