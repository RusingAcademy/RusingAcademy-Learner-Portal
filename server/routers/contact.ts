import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { TRPCError } from "@trpc/server";
import { ecosystemLeads } from "../../drizzle/schema";
import { eq, and, or, like, desc, count } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";
import { sendEmailViaSMTP } from "../email-service";

export const contactRouter = router({
  // Get all leads with pagination and filters (admin only)
  getLeads: publicProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(20),
      status: z.enum(["new", "contacted", "qualified", "converted", "lost"]).optional(),
      source: z.string().optional(),
      search: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      }

      try {
        const { page, pageSize, status, source, search } = input;
        const offset = (page - 1) * pageSize;

        // Build where conditions
        const conditions: any[] = [];
        if (status) {
      // @ts-ignore - overload resolution
          conditions.push(eq(ecosystemLeads.status, status));
        }
        if (source) {
          conditions.push(eq(ecosystemLeads.source, source as any));
        }
        if (search) {
          conditions.push(
            or(
              like(ecosystemLeads.firstName, `%${search}%`),
              like(ecosystemLeads.lastName, `%${search}%`),
              like(ecosystemLeads.email, `%${search}%`),
              like(ecosystemLeads.message, `%${search}%`)
            )
          );
        }

        // Get leads with pagination
        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
        
        const leads = await db
          .select()
          .from(ecosystemLeads)
          .where(whereClause)
          .orderBy(desc(ecosystemLeads.createdAt))
          .limit(pageSize)
          .offset(offset);

        // Get total count
        const countResult = await db
          .select({ count: count() })
          .from(ecosystemLeads)
          .where(whereClause);
        const total = countResult[0]?.count || 0;

        // Get stats
        const statsResult = await db
          .select({
            status: ecosystemLeads.status,
            count: count(),
          })
          .from(ecosystemLeads)
          .groupBy(ecosystemLeads.status);

        const stats = {
          total: 0,
          new: 0,
          contacted: 0,
          qualified: 0,
          converted: 0,
          lost: 0,
        };
        statsResult.forEach((row: any) => {
          stats[row.status as keyof typeof stats] = Number(row.count);
          stats.total += Number(row.count);
        });

        return { leads, total, stats };
      } catch (error) {
        console.error("[Contact] Error fetching leads:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch leads" });
      }
    }),

  // Update lead status (admin only)
  updateLeadStatus: publicProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["new", "contacted", "qualified", "proposal_sent", "negotiating", "won", "lost", "nurturing"]),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      }

      try {
        await db
          .update(ecosystemLeads)
          .set({ 
            status: input.status,
            updatedAt: new Date(),
            lastContactedAt: input.status === "contacted" ? new Date() : undefined,
            convertedAt: input.status === "won" ? new Date() : undefined,
          })
          .where(eq(ecosystemLeads.id, input.id));

        return { success: true };
      } catch (error) {
        console.error("[Contact] Error updating lead status:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update lead status" });
      }
    }),

  // Submit a contact form message
  submit: publicProcedure
    .input(z.object({
      name: z.string().min(2, "Name must be at least 2 characters"),
      email: z.string().email("Invalid email address"),
      phone: z.string().optional(),
      subject: z.string().min(1, "Please select a subject"),
      message: z.string().min(10, "Message must be at least 10 characters"),
      brand: z.enum(["ecosystem", "rusingacademy", "lingueefy", "barholex"]),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ 
          code: "INTERNAL_SERVER_ERROR", 
          message: "Database not available" 
        });
      }

      // Map subject to lead type
      const subjectToLeadType: Record<string, "individual" | "organization" | "government" | "enterprise"> = {
        general: "individual",
        learner: "individual",
        coach: "individual",
        technical: "individual",
        billing: "individual",
        partnership: "organization",
        enterprise: "enterprise",
      };

      // Map brand to source platform
      const brandToSource: Record<string, "rusingacademy" | "lingueefy" | "barholex" | "external"> = {
        ecosystem: "rusingacademy",
        rusingacademy: "rusingacademy",
        lingueefy: "lingueefy",
        barholex: "barholex",
      };

      try {
      // @ts-ignore - overload resolution
        // Insert the contact message as a lead
        const result = await db.insert(ecosystemLeads).values({
          firstName: input.name.split(' ')[0],
          lastName: input.name.split(' ').slice(1).join(' ') || null,
          email: input.email,
          phone: input.phone || null,
          sourcePlatform: brandToSource[input.brand] || "rusingacademy",
          formType: "contact",
          leadType: subjectToLeadType[input.subject] || "individual",
          status: "new",
          message: `[${input.subject.toUpperCase()}] ${input.message}`,
          interests: JSON.stringify([input.brand, input.subject]),
          preferredLanguage: "en", // Could be detected from browser or form
        });

        // Send notification to owner
        const subjectLabels: Record<string, string> = {
          general: "General Inquiry",
          learner: "Learner Support",
          coach: "Become a Coach",
          technical: "Technical Support",
          billing: "Billing & Payments",
          partnership: "Partnership Opportunity",
          enterprise: "Enterprise Solutions",
        };

        const brandLabels: Record<string, string> = {
          ecosystem: "Ecosystem Hub",
          rusingacademy: "RusingÂcademy",
          lingueefy: "Lingueefy",
          barholex: "Barholex Media",
        };

        // Send notification to owner via Manus notification system
        await notifyOwner({
          title: `📬 New Contact: ${subjectLabels[input.subject] || input.subject}`,
          content: `
**New contact form submission received**

**From:** ${input.name}
**Email:** ${input.email}
${input.phone ? `**Phone:** ${input.phone}` : ''}
**Brand:** ${brandLabels[input.brand] || input.brand}
**Subject:** ${subjectLabels[input.subject] || input.subject}

**Message:**
${input.message}

---
*Respond within 24 hours as per our guarantee.*
          `.trim(),
        });

        // Also send email notification to admin
        try {
          await sendEmailViaSMTP({
            to: 'admin@rusingacademy.ca',
            subject: `[Contact Form] ${subjectLabels[input.subject] || input.subject} - ${input.name}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #0d9488 0%, #115e59 100%); padding: 20px; border-radius: 8px 8px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">📬 New Contact Form Submission</h1>
                </div>
                <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #475569; width: 120px;">From:</td>
                      <td style="padding: 8px 0; color: #1e293b;">${input.name}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #475569;">Email:</td>
                      <td style="padding: 8px 0;"><a href="mailto:${input.email}" style="color: #0d9488;">${input.email}</a></td>
                    </tr>
                    ${input.phone ? `<tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #475569;">Phone:</td>
                      <td style="padding: 8px 0;"><a href="tel:${input.phone}" style="color: #0d9488;">${input.phone}</a></td>
                    </tr>` : ''}
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #475569;">Brand:</td>
                      <td style="padding: 8px 0; color: #1e293b;">${brandLabels[input.brand] || input.brand}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #475569;">Subject:</td>
                      <td style="padding: 8px 0; color: #1e293b;">${subjectLabels[input.subject] || input.subject}</td>
                    </tr>
                  </table>
                  <div style="margin-top: 20px; padding: 16px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <h3 style="margin: 0 0 12px 0; color: #475569; font-size: 14px; text-transform: uppercase;">Message</h3>
                    <p style="margin: 0; color: #1e293b; line-height: 1.6; white-space: pre-wrap;">${input.message}</p>
                  </div>
                  <div style="margin-top: 20px; padding: 12px; background: #fef3c7; border-radius: 8px; border: 1px solid #fcd34d;">
                    <p style="margin: 0; color: #92400e; font-size: 14px;">⏰ <strong>Reminder:</strong> Please respond within 24 hours as per our guarantee.</p>
                  </div>
                </div>
                <div style="text-align: center; padding: 16px; color: #94a3b8; font-size: 12px;">
                  <p style="margin: 0;">Rusinga International Consulting Ltd. Learning Ecosystem</p>
                  <p style="margin: 4px 0 0 0;">Ottawa, Ontario, Canada</p>
                </div>
              </div>
            `,
            text: `New Contact Form Submission\n\nFrom: ${input.name}\nEmail: ${input.email}\n${input.phone ? `Phone: ${input.phone}\n` : ''}Brand: ${brandLabels[input.brand] || input.brand}\nSubject: ${subjectLabels[input.subject] || input.subject}\n\nMessage:\n${input.message}\n\n---\nPlease respond within 24 hours as per our guarantee.`,
            replyTo: input.email,
          });
          console.log('[Contact] Email notification sent to admin@rusingacademy.ca');
        } catch (emailError) {
          console.error('[Contact] Failed to send email notification:', emailError);
          // Don't throw - the contact was still saved successfully
        }

        return { 
          success: true, 
          message: "Your message has been sent successfully. We'll get back to you within 24 hours.",
        };
      } catch (error) {
        console.error("[Contact] Error saving contact message:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send message. Please try again.",
        });
      }
    }),
});
