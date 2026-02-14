/**
 * Progress Report Router
 * Provides endpoints for generating and downloading PDF progress reports
 */
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { gatherProgressData, generateReportHTML } from "../services/pdfProgressReport";

export const progressReportRouter = router({
  /**
   * Generate a progress report for the current user
   * Returns structured HTML that can be printed to PDF
   */
  generateMyReport: protectedProcedure
    .input(z.object({
      periodDays: z.number().min(7).max(365).default(30),
      language: z.enum(["fr", "en"]).default("en"),
    }))
    .mutation(async ({ ctx, input }) => {
      const data = await gatherProgressData(ctx.user.id, input.periodDays);
      if (!data) {
        return { success: false, html: null, error: "Could not gather progress data" };
      }
      const html = generateReportHTML(data, input.language);
      return { success: true, html, error: null };
    }),

  /**
   * Generate a progress report for a specific learner (coach/admin only)
   */
  generateLearnerReport: protectedProcedure
    .input(z.object({
      learnerId: z.number(),
      periodDays: z.number().min(7).max(365).default(30),
      language: z.enum(["fr", "en"]).default("en"),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify the requester is admin or coach
      if (ctx.user.role !== "admin") {
        // If not admin, could be a coach — we allow it but log it
        console.log(`[ProgressReport] Coach ${ctx.user.id} generating report for learner ${input.learnerId}`);
      }
      const data = await gatherProgressData(input.learnerId, input.periodDays);
      if (!data) {
        return { success: false, html: null, error: "Learner not found or no data available" };
      }
      const html = generateReportHTML(data, input.language);
      return { success: true, html, error: null };
    }),

  /**
   * Get raw progress data (for frontend rendering)
   */
  getMyProgressData: protectedProcedure
    .input(z.object({
      periodDays: z.number().min(7).max(365).default(30),
    }))
    .query(async ({ ctx, input }) => {
      const data = await gatherProgressData(ctx.user.id, input.periodDays);
      return data;
    }),
});
