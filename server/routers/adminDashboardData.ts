import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { TRPCError } from "@trpc/server";
import { 
  courseEnrollments, 
  pathEnrollments, 
  courses, 
  users, 
  learnerBadges, 
  learnerXp,
  learningPaths 
} from "../../drizzle/schema";
import { eq, desc, sql, count } from "drizzle-orm";

export const adminDashboardDataRouter = router({
  // Get all enrollments for admin view
  getEnrollments: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return { enrollments: [], stats: { total: 0, active: 0, completed: 0, paused: 0 } };

      try {
        // Get course enrollments with user and course info
        const courseEnrollmentRows = await db.select({
          id: courseEnrollments.id,
          userId: courseEnrollments.userId,
          userName: users.name,
          userEmail: users.email,
          courseId: courseEnrollments.courseId,
          courseName: courses.title,
          status: courseEnrollments.status,
          progressPercent: courseEnrollments.progressPercent,
          enrolledAt: courseEnrollments.enrolledAt,
          completedAt: courseEnrollments.completedAt,
        })
        .from(courseEnrollments)
        .leftJoin(users, eq(courseEnrollments.userId, users.id))
        .leftJoin(courses, eq(courseEnrollments.courseId, courses.id))
        .orderBy(desc(courseEnrollments.enrolledAt))
        .limit(500);

        // Get path enrollments with user and path info
        const pathEnrollmentRows = await db.select({
          id: pathEnrollments.id,
          userId: pathEnrollments.userId,
          userName: users.name,
          userEmail: users.email,
          pathId: pathEnrollments.pathId,
          courseName: learningPaths.titleEn,
          status: pathEnrollments.status,
          progressPercent: pathEnrollments.progressPercentage,
          enrolledAt: pathEnrollments.enrolledAt,
          completedAt: pathEnrollments.completedAt,
        })
        .from(pathEnrollments)
        .leftJoin(users, eq(pathEnrollments.userId, users.id))
        .leftJoin(learningPaths, eq(pathEnrollments.pathId, learningPaths.id))
        .orderBy(desc(pathEnrollments.enrolledAt))
        .limit(500);

        // Merge and sort
        const allEnrollments = [
          ...courseEnrollmentRows.map(e => ({ ...e, type: "course" as const })),
          ...pathEnrollmentRows.map(e => ({ ...e, type: "path" as const })),
        ].sort((a, b) => {
          const dateA = a.enrolledAt ? new Date(a.enrolledAt).getTime() : 0;
          const dateB = b.enrolledAt ? new Date(b.enrolledAt).getTime() : 0;
          return dateB - dateA;
        });

        // Calculate stats
        const stats = {
          total: allEnrollments.length,
          active: allEnrollments.filter(e => e.status === "active").length,
          completed: allEnrollments.filter(e => e.status === "completed").length,
          paused: allEnrollments.filter(e => e.status === "paused").length,
        };

        return { enrollments: allEnrollments, stats };
      } catch (error) {
        console.error("[Admin Enrollments] Error:", error);
        return { enrollments: [], stats: { total: 0, active: 0, completed: 0, paused: 0 } };
      }
    }),

  // Get gamification stats for admin view
  getGamificationStats: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return {
        totalBadgesEarned: 0,
        totalXpAwarded: 0,
        activeLearners: 0,
        avgLevel: 0,
        topBadges: [],
        recentAwards: [],
        leaderboard: [],
      };

      try {
        // Total badges earned
        const [badgeCount] = await db.select({ count: count() }).from(learnerBadges);
        const totalBadgesEarned = badgeCount?.count ?? 0;

        // Total XP awarded
        const [xpSum] = await db.select({ 
          total: sql<number>`COALESCE(SUM(${learnerXp.totalXp}), 0)` 
        }).from(learnerXp);
        const totalXpAwarded = Number(xpSum?.total ?? 0);

        // Active learners (have XP)
        const [activeCount] = await db.select({ count: count() }).from(learnerXp);
        const activeLearners = activeCount?.count ?? 0;

        // Average level
        const [avgLevelResult] = await db.select({ 
          avg: sql<number>`COALESCE(AVG(${learnerXp.currentLevel}), 1)` 
        }).from(learnerXp);
        const avgLevel = Math.round(Number(avgLevelResult?.avg ?? 1));

        // Top badges (most earned)
        const topBadges = await db.select({
          type: learnerBadges.badgeType,
          count: count(),
        })
        .from(learnerBadges)
        .groupBy(learnerBadges.badgeType)
        .orderBy(desc(count()))
        .limit(9);

        const topBadgesFormatted = topBadges.map(b => ({
          type: b.type,
          name: String(b.type).replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
          count: b.count,
          tier: "bronze",
        }));

        // Recent badge awards
        const recentAwards = await db.select({
          id: learnerBadges.id,
          badgeType: learnerBadges.badgeType,
          userId: learnerBadges.userId,
          userName: users.name,
          earnedAt: learnerBadges.earnedAt,
        })
        .from(learnerBadges)
        .leftJoin(users, eq(learnerBadges.userId, users.id))
        .orderBy(desc(learnerBadges.earnedAt))
        .limit(20);

        const recentAwardsFormatted = recentAwards.map(a => ({
          id: a.id,
          badgeName: String(a.badgeType).replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
          userName: a.userName || "Unknown",
          earnedAt: a.earnedAt,
          tier: "bronze",
        }));

        // XP Leaderboard
        const leaderboard = await db.select({
          userId: learnerXp.userId,
          name: users.name,
          email: users.email,
          totalXp: learnerXp.totalXp,
          level: learnerXp.currentLevel,
        })
        .from(learnerXp)
        .leftJoin(users, eq(learnerXp.userId, users.id))
        .orderBy(desc(learnerXp.totalXp))
        .limit(20);

        // Count badges per user for leaderboard
        const leaderboardWithBadges = await Promise.all(
          leaderboard.map(async (l) => {
            const [bc] = await db.select({ count: count() })
              .from(learnerBadges)
              .where(eq(learnerBadges.userId, l.userId));
            return {
              ...l,
              totalXp: Number(l.totalXp ?? 0),
              level: Number(l.level ?? 1),
              levelTitle: "",
              badgeCount: bc?.count ?? 0,
            };
          })
        );

        return {
          totalBadgesEarned,
          totalXpAwarded,
          activeLearners,
          avgLevel,
          topBadges: topBadgesFormatted,
          recentAwards: recentAwardsFormatted,
          leaderboard: leaderboardWithBadges,
        };
      } catch (error) {
        console.error("[Admin Gamification] Error:", error);
        return {
          totalBadgesEarned: 0,
          totalXpAwarded: 0,
          activeLearners: 0,
          avgLevel: 0,
          topBadges: [],
          recentAwards: [],
          leaderboard: [],
        };
      }
    }),
});
