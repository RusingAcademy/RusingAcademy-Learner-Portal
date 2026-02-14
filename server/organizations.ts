import { router, protectedProcedure, adminProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import {
  organizations,
  organizationCoachs,
  coachingCredits,
  creditTransactions,
  organizationMembers,
  sessions,
  learnerProfiles,
} from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const organizationsRouter = router({
  // Get organization by ID
  getOrganization: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ input }: any) => {
      const db = await getDb() as any;
      if (!db) throw new Error('Database connection failed');
      const org = await db.query.organizations.findFirst({
        where: eq(organizations.id, input.organizationId),
      });
      return org;
    }),

  // List all organizations (admin only)
  listOrganizations: adminProcedure.query(async () => {
    const db = await getDb() as any;
    if (!db) throw new Error('Database connection failed');
    const orgs = await db.query.organizations.findMany({
      orderBy: (org: any) => org.createdAt,
    });
    return orgs;
  }),

  // Create organization (admin only)
  createOrganization: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        domain: z.string().optional(),
        contactName: z.string().optional(),
        contactEmail: z.string().email().optional(),
        contactPhone: z.string().optional(),
        industry: z.string().optional(),
        employeeCount: z.number().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }: any) => {
      const db = await getDb() as any;
      if (!db) throw new Error('Database connection failed');
      const org = await db.insert(organizations).values({
        ...input,
        adminUserId: ctx.user.id,
        status: "pending",
      });
      return org;
    }),

  // Get organization coachs
  getOrganizationCoachs: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ input }: any) => {
      const db = await getDb() as any;
      if (!db) throw new Error('Database connection failed');
      const coachs = await db.query.organizationCoachs.findMany({
        where: eq(organizationCoachs.organizationId, input.organizationId),
      });
      return coachs;
    }),

  // Add coach to organization (admin only)
  addCoachToOrganization: adminProcedure
    .input(
      z.object({
        organizationId: z.number(),
        coachId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }: any) => {
      const db = await getDb() as any;
      if (!db) throw new Error('Database connection failed');
      const orgCoach = await db.insert(organizationCoachs).values({
        organizationId: input.organizationId,
        coachId: input.coachId,
        assignedBy: ctx.user.id,
        status: "active",
      });
      return orgCoach;
    }),

  // Remove coach from organization (admin only)
  removeCoachFromOrganization: adminProcedure
    .input(
      z.object({
        organizationId: z.number(),
        coachId: z.number(),
      })
    )
    .mutation(async ({ input }: any) => {
      const db = await getDb() as any;
      if (!db) throw new Error('Database connection failed');
      await db
        .update(organizationCoachs)
        .set({ status: "inactive" })
        .where(
          and(
            eq(organizationCoachs.organizationId, input.organizationId),
            eq(organizationCoachs.coachId, input.coachId)
          )
        );
      return { success: true };
    }),

  // Get coaching credits for organization
  getCreditBalance: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ input }: any) => {
      const db = await getDb() as any;
      if (!db) throw new Error('Database connection failed');
      const credits = await db.query.coachingCredits.findFirst({
        where: eq(coachingCredits.organizationId, input.organizationId),
      });
      return credits;
    }),

  // Add coaching credits (admin only)
  addCoachingCredits: adminProcedure
    .input(
      z.object({
        organizationId: z.number(),
        amount: z.number().positive(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }: any) => {
      const db = await getDb() as any;
      if (!db) throw new Error('Database connection failed');
      // Update credit balance
      const existing = await db.query.coachingCredits.findFirst({
        where: eq(coachingCredits.organizationId, input.organizationId),
      });

      if (existing) {
        await db
          .update(coachingCredits)
          .set({
            totalCredits: existing.totalCredits + input.amount,
            availableCredits: existing.availableCredits + input.amount,
          })
          .where(eq(coachingCredits.organizationId, input.organizationId));
      } else {
        await db.insert(coachingCredits).values({
          organizationId: input.organizationId,
          totalCredits: input.amount,
          availableCredits: input.amount,
        });
      }

      // Log transaction
      await db.insert(creditTransactions).values({
        organizationId: input.organizationId,
        type: "purchase",
        amount: input.amount,
        description: input.description || "Credit purchase",
        processedBy: ctx.user.id,
      });

      return { success: true };
    }),

  // Use coaching credits (when session is booked)
  useCoachingCredits: protectedProcedure
    .input(
      z.object({
        organizationId: z.number(),
        amount: z.number().positive(),
        sessionId: z.number().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }: any) => {
      const db = await getDb() as any;
      if (!db) throw new Error('Database connection failed');
      const credits = await db.query.coachingCredits.findFirst({
        where: eq(coachingCredits.organizationId, input.organizationId),
      });

      if (!credits || credits.availableCredits < input.amount) {
        throw new Error("Insufficient coaching credits");
      }

      // Update credit balance
      await db
        .update(coachingCredits)
        .set({
          usedCredits: credits.usedCredits + input.amount,
          availableCredits: credits.availableCredits - input.amount,
        })
        .where(eq(coachingCredits.organizationId, input.organizationId));

      // Log transaction
      await db.insert(creditTransactions).values({
        organizationId: input.organizationId,
        type: "usage",
        amount: input.amount,
        relatedSessionId: input.sessionId,
        description: input.description || "Session booking",
        processedBy: ctx.user.id,
      });

      return { success: true };
    }),

  // Refund coaching credits
  refundCoachingCredits: protectedProcedure
    .input(
      z.object({
        organizationId: z.number(),
        amount: z.number().positive(),
        sessionId: z.number().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }: any) => {
      const db = await getDb() as any;
      if (!db) throw new Error('Database connection failed');
      const credits = await db.query.coachingCredits.findFirst({
        where: eq(coachingCredits.organizationId, input.organizationId),
      });

      if (!credits) {
        throw new Error("Organization has no credit account");
      }

      // Update credit balance
      await db
        .update(coachingCredits)
        .set({
          usedCredits: Math.max(0, credits.usedCredits - input.amount),
          availableCredits: credits.availableCredits + input.amount,
        })
        .where(eq(coachingCredits.organizationId, input.organizationId));

      // Log transaction
      await db.insert(creditTransactions).values({
        organizationId: input.organizationId,
        type: "refund",
        amount: input.amount,
        relatedSessionId: input.sessionId,
        description: input.description || "Session refund",
        processedBy: ctx.user.id,
      });

      return { success: true };
    }),

  // Get credit transaction history
  getCreditTransactionHistory: protectedProcedure
    .input(
      z.object({
        organizationId: z.number(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }: any) => {
      const db = await getDb() as any;
      if (!db) throw new Error('Database connection failed');
      const txInput = input;
      const transactions = await db.query.creditTransactions.findMany({
        where: eq(creditTransactions.organizationId, txInput.organizationId),
        limit: txInput.limit,
        offset: txInput.offset,
      });
      return transactions;
    }),

  // Add organization member
  addOrganizationMember: protectedProcedure
    .input(
      z.object({
        organizationId: z.number(),
        userId: z.number(),
        role: z.enum(["admin", "manager", "member", "learner"]),
      })
    )
    .mutation(async ({ input, ctx }: any) => {
      const db = await getDb() as any;
      if (!db) throw new Error('Database connection failed');
      const orgInput = input;
      const member = await db.insert(organizationMembers).values({
        organizationId: orgInput.organizationId,
        userId: orgInput.userId,
        role: orgInput.role,
        status: "active",
      });
      return member;
    }),

  // Get organization members
  getOrganizationMembers: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ input }: any) => {
      const db = await getDb() as any;
      if (!db) throw new Error('Database connection failed');
      const memberInput = input;
      const members = await db.query.organizationMembers.findMany({
        where: eq(organizationMembers.organizationId, memberInput.organizationId),
      });
      return members;
    }),

  // Remove organization member
  removeOrganizationMember: protectedProcedure
    .input(
      z.object({
        organizationId: z.number(),
        userId: z.number(),
      })
    )
    .mutation(async ({ input }: any) => {
      const db = await getDb() as any;
      if (!db) throw new Error('Database connection failed');
      const removeInput = input;
      await db
        .update(organizationMembers)
        .set({ status: "inactive" })
        .where(
          and(
            eq(organizationMembers.organizationId, removeInput.organizationId),
            eq(organizationMembers.userId, removeInput.userId)
          )
        );
      return { success: true };
    }),
});
