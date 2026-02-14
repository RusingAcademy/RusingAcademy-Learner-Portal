import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { 
  certificates, 
  courseEnrollments, 
  courses, 
  users,
  learningPaths,
  pathCourses 
} from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { generateCertificatePdf } from "../services/certificatePdfService";

// Certificate template data
const CERTIFICATE_TEMPLATE = {
  brandColors: {
    primary: "#009688", // Teal - Lingueefy
    secondary: "#FF6B35", // Orange - RusingAcademy CTA
    accent: "#1a365d", // Dark blue for text
    background: "#ffffff",
  },
  organization: {
    name: "RusingAcademy",
    tagline: "Excellence in Bilingual Education",
    taglineFr: "Excellence en éducation bilingue",
    website: "rusingacademy.com",
  },
  signatory: {
    name: "Prof. Steven Rusinga",
    title: "Founder & Lead Instructor",
    titleFr: "Fondateur et instructeur principal",
  },
};

export const certificatesRouter = router({
  // Generate certificate for completed course
  generate: protectedProcedure
    .input(z.object({ 
      courseId: z.number(),
      language: z.enum(["en", "fr"]).default("en"),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Check enrollment and completion
      const [enrollment] = await db.select()
        .from(courseEnrollments)
        .where(and(
          eq(courseEnrollments.userId, ctx.user.id),
          eq(courseEnrollments.courseId, input.courseId)
        ))
        .limit(1);

      if (!enrollment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Enrollment not found",
        });
      }

      if (enrollment.status !== "completed" && (enrollment.progressPercent || 0) < 100) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Course must be completed to generate certificate",
        });
      }

      // Check if certificate already exists
      const [existingCert] = await db.select()
        .from(certificates)
        .where(and(
          eq(certificates.userId, ctx.user.id),
          eq(certificates.courseId, input.courseId)
        ))
        .limit(1);

      if (existingCert) {
        // If PDF wasn't generated yet, generate it now
        if (!existingCert.pdfUrl) {
          try {
            const pdfUrl = await generateCertificatePdf({
              recipientName: existingCert.recipientName,
              courseTitle: existingCert.courseName,
              certificateNumber: existingCert.certificateId,
              issuedAt: existingCert.completionDate,
              language: input.language,
              totalLessons: enrollment.totalLessons || undefined,
            });
            await db.update(certificates)
              .set({ pdfUrl })
              .where(eq(certificates.id, existingCert.id));
            return {
              certificateId: existingCert.id,
              certificateNumber: existingCert.certificateId,
              issuedAt: existingCert.completionDate,
              pdfUrl,
              alreadyExists: true,
            };
          } catch (err) {
            console.error("[Certificate] PDF generation failed for existing cert:", err);
          }
        }
        return {
          certificateId: existingCert.id,
          certificateNumber: existingCert.certificateId,
          issuedAt: existingCert.completionDate,
          pdfUrl: existingCert.pdfUrl,
          alreadyExists: true,
        };
      }

      // Get course details
      const [course] = await db.select()
        .from(courses)
        .where(eq(courses.id, input.courseId))
        .limit(1);

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }

      // Generate unique certificate number
      const certificateNumber = generateCertificateNumber(ctx.user.id, input.courseId);

      // Look up the path this course belongs to (for context on the certificate)
      let pathTitle: string | undefined;
      try {
        const pathCourseRows = await db.select()
          .from(pathCourses)
          .where(eq(pathCourses.courseId, input.courseId))
          .limit(1);
        if (pathCourseRows.length > 0) {
          const [path] = await db.select()
            .from(learningPaths)
            .where(eq(learningPaths.id, pathCourseRows[0].pathId))
            .limit(1);
          if (path) pathTitle = path.title || undefined;
        }
      } catch (err) {
        console.error("[Certificate] Failed to look up path:", err);
      }

      // Generate PDF
      let pdfUrl: string | null = null;
      try {
        pdfUrl = await generateCertificatePdf({
          recipientName: ctx.user.name || "Learner",
          courseTitle: course.title,
          certificateNumber,
          issuedAt: new Date(),
          language: input.language,
          pathTitle,
          totalLessons: enrollment.totalLessons || undefined,
        });
      } catch (err) {
        console.error("[Certificate] PDF generation failed:", err);
      }

      // Create certificate record
      await db.insert(certificates).values({
        certificateId: certificateNumber,
        userId: ctx.user.id,
        courseId: input.courseId,
        enrollmentId: enrollment.id,
        recipientName: ctx.user.name || "Learner",
        courseName: course.title,
        completionDate: new Date(),
        verificationUrl: `https://rusingacademy.com/verify/${certificateNumber}`,
        pdfUrl,
        metadata: {
          language: input.language,
          completedAt: enrollment.completedAt,
          lessonsCompleted: enrollment.lessonsCompleted,
          totalLessons: enrollment.totalLessons,
          instructor: CERTIFICATE_TEMPLATE.signatory.name,
          organization: CERTIFICATE_TEMPLATE.organization.name,
          pathTitle,
        },
      });

      // Fetch the newly created certificate
      const [newCert] = await db.select()
        .from(certificates)
        .where(eq(certificates.certificateId, certificateNumber))
        .limit(1);

      return {
        certificateId: newCert.id,
        certificateNumber: newCert.certificateId,
        issuedAt: newCert.completionDate,
        pdfUrl: newCert.pdfUrl,
        alreadyExists: false,
      };
    }),

  // Get certificate data for rendering
  getCertificate: protectedProcedure
    .input(z.object({ 
      certificateId: z.number().optional(),
      certificateNumber: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      if (!input.certificateId && !input.certificateNumber) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Either certificateId or certificateNumber is required",
        });
      }

      const condition = input.certificateId 
        ? eq(certificates.id, input.certificateId)
        : eq(certificates.certificateId, input.certificateNumber!);

      const [cert] = await db.select()
        .from(certificates)
        .where(condition)
        .limit(1);

      if (!cert) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Certificate not found",
        });
      }

      // Get course details
      const [course] = await db.select()
        .from(courses)
        .where(eq(courses.id, cert.courseId))
        .limit(1);

      // Get user details
      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, cert.userId))
        .limit(1);

      const metadata = cert.metadata as Record<string, any> || {};
      const isEn = metadata.language !== "fr";

      return {
        certificate: {
          id: cert.id,
          certificateNumber: cert.certificateId,
          recipientName: cert.recipientName,
          courseTitle: cert.courseName,
          issuedAt: cert.completionDate,
          verificationUrl: cert.verificationUrl,
          pdfUrl: cert.pdfUrl,
        },
        course: course ? {
          title: course.title,
          description: course.shortDescription,
          category: course.category,
          level: course.level,
          totalLessons: course.totalLessons,
          
        } : null,
        user: user ? {
          name: user.name,
          email: user.email,
        } : null,
        template: CERTIFICATE_TEMPLATE,
        content: {
          title: isEn ? "Certificate of Completion" : "Certificat de réussite",
          subtitle: isEn 
            ? "This is to certify that" 
            : "Ceci certifie que",
          hasCompleted: isEn 
            ? "has successfully completed the course" 
            : "a complété avec succès le cours",
          issuedOn: isEn ? "Issued on" : "Délivré le",
          certificateId: isEn ? "Certificate ID" : "Numéro de certificat",
          verifyAt: isEn ? "Verify at" : "Vérifier sur",
          signedBy: isEn ? "Signed by" : "Signé par",
          instructorTitle: isEn 
            ? CERTIFICATE_TEMPLATE.signatory.title 
            : CERTIFICATE_TEMPLATE.signatory.titleFr,
          organizationTagline: isEn 
            ? CERTIFICATE_TEMPLATE.organization.tagline 
            : CERTIFICATE_TEMPLATE.organization.taglineFr,
        },
      };
    }),

  // Get all certificates for current user
  getMyCertificates: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const certs = await db.select()
        .from(certificates)
        .where(eq(certificates.userId, ctx.user.id))
        .orderBy(desc(certificates.completionDate));

      // Get course details for each certificate
      const certsWithCourses = await Promise.all(
        certs.map(async (cert) => {
          const [course] = await db.select()
            .from(courses)
            .where(eq(courses.id, cert.courseId))
            .limit(1);

          return {
            id: cert.id,
            certificateNumber: cert.certificateId,
            recipientName: cert.recipientName,
            courseName: cert.courseName,
            completionDate: cert.completionDate,
            verificationUrl: cert.verificationUrl,
            pdfUrl: cert.pdfUrl,
            course: course ? {
              title: course.title,
              thumbnailUrl: course.thumbnailUrl,
              category: course.category,
            } : null,
          };
        })
      );

      return certsWithCourses;
    }),

  // Verify certificate (public endpoint for verification)
  verify: publicProcedure
    .input(z.object({ certificateNumber: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [cert] = await db.select()
        .from(certificates)
        .where(eq(certificates.certificateId, input.certificateNumber))
        .limit(1);

      if (!cert) {
        return {
          valid: false,
          message: "Certificate not found",
        };
      }

      // Get course details
      const [course] = await db.select()
        .from(courses)
        .where(eq(courses.id, cert.courseId))
        .limit(1);

      return {
        valid: true,
        certificate: {
          recipientName: cert.recipientName,
          courseTitle: cert.courseName,
          issuedAt: cert.completionDate,
        },
        course: course ? {
          title: course.title,
          category: course.category,
        } : null,
        organization: CERTIFICATE_TEMPLATE.organization.name,
      };
    }),
});

// Helper function to generate unique certificate number
function generateCertificateNumber(userId: number, courseId: number): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const userPart = userId.toString(36).toUpperCase().padStart(4, "0");
  const coursePart = courseId.toString(36).toUpperCase().padStart(3, "0");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  
  return `RA-${timestamp}-${userPart}-${coursePart}-${random}`;
}
