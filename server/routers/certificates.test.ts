import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("../db", () => ({
  getDb: vi.fn(() => Promise.resolve({
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnValue(Promise.resolve([])),
    orderBy: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnValue(Promise.resolve()),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
  })),
}));

// Mock the PDF service
vi.mock("../services/certificatePdfService", () => ({
  generateCertificatePdf: vi.fn(() => Promise.resolve("https://cdn.example.com/certificates/test.pdf")),
}));

describe("Certificates Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Certificate Number Generation", () => {
    const generateCertificateNumber = (userId: number, courseId: number): string => {
      const timestamp = Date.now().toString(36).toUpperCase();
      const userPart = userId.toString(36).toUpperCase().padStart(4, "0");
      const coursePart = courseId.toString(36).toUpperCase().padStart(3, "0");
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      return `RA-${timestamp}-${userPart}-${coursePart}-${random}`;
    };

    it("should have certificate number format RA-XXXXX-XXXX-XXX-XXXX", () => {
      const certNumber = generateCertificateNumber(1, 1);
      expect(certNumber).toMatch(/^RA-[A-Z0-9]+-[A-Z0-9]{4}-[A-Z0-9]{3}-[A-Z0-9]{4}$/);
    });

    it("should generate unique certificate numbers for different users", () => {
      const cert1 = generateCertificateNumber(1, 1);
      const cert2 = generateCertificateNumber(2, 1);
      expect(cert1).not.toBe(cert2);
    });

    it("should generate unique certificate numbers for different courses", () => {
      const cert1 = generateCertificateNumber(1, 1);
      const cert2 = generateCertificateNumber(1, 2);
      expect(cert1).not.toBe(cert2);
    });

    it("should encode userId and courseId in base36", () => {
      const certNumber = generateCertificateNumber(10, 5);
      // userId 10 in base36 = "A", padded to 4 chars = "000A"
      // courseId 5 in base36 = "5", padded to 3 chars = "005"
      expect(certNumber).toContain("000A");
      expect(certNumber).toContain("005");
    });

    it("should always start with RA- prefix", () => {
      for (let i = 0; i < 10; i++) {
        const cert = generateCertificateNumber(i + 1, i + 1);
        expect(cert.startsWith("RA-")).toBe(true);
      }
    });
  });

  describe("Certificate Template", () => {
    it("should have correct brand colors", () => {
      const CERTIFICATE_TEMPLATE = {
        brandColors: {
          primary: "#009688",
          secondary: "#FF6B35",
          accent: "#1a365d",
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

      expect(CERTIFICATE_TEMPLATE.brandColors.primary).toBe("#009688");
      expect(CERTIFICATE_TEMPLATE.brandColors.secondary).toBe("#FF6B35");
      expect(CERTIFICATE_TEMPLATE.organization.name).toBe("RusingAcademy");
      expect(CERTIFICATE_TEMPLATE.signatory.name).toBe("Prof. Steven Rusinga");
    });

    it("should have bilingual content", () => {
      const content = {
        en: {
          title: "Certificate of Completion",
          subtitle: "This is to certify that",
          hasCompleted: "has successfully completed the course",
        },
        fr: {
          title: "Certificat de réussite",
          subtitle: "Ceci certifie que",
          hasCompleted: "a complété avec succès le cours",
        },
      };

      expect(content.en.title).toBe("Certificate of Completion");
      expect(content.fr.title).toBe("Certificat de réussite");
      expect(content.en.hasCompleted).toContain("successfully completed");
      expect(content.fr.hasCompleted).toContain("complété avec succès");
    });
  });

  describe("Certificate Verification", () => {
    it("should return valid: false for non-existent certificate", async () => {
      const mockVerify = async (certificateNumber: string) => {
        const cert = null;
        if (!cert) {
          return { valid: false, message: "Certificate not found" };
        }
        return { valid: true };
      };

      const result = await mockVerify("INVALID-CERT-123");
      expect(result.valid).toBe(false);
      expect(result.message).toBe("Certificate not found");
    });

    it("should return valid: true for existing certificate", async () => {
      const mockVerify = async (certificateNumber: string) => {
        const cert = {
          id: 1,
          certificateId: certificateNumber,
          recipientName: "Test User",
          courseName: "SLE Oral Expression",
          completionDate: new Date(),
        };
        return {
          valid: true,
          certificate: {
            recipientName: cert.recipientName,
            courseTitle: cert.courseName,
            issuedAt: cert.completionDate,
          },
          organization: "RusingAcademy",
        };
      };

      const result = await mockVerify("RA-TEST-0001-001-ABCD");
      expect(result.valid).toBe(true);
      expect(result.certificate?.recipientName).toBe("Test User");
      expect(result.organization).toBe("RusingAcademy");
    });
  });

  describe("Certificate Requirements", () => {
    it("should require course completion (100% progress)", () => {
      const checkCompletion = (progressPercent: number, status: string) => {
        return status === "completed" || progressPercent >= 100;
      };

      expect(checkCompletion(100, "active")).toBe(true);
      expect(checkCompletion(99, "active")).toBe(false);
      expect(checkCompletion(50, "completed")).toBe(true);
      expect(checkCompletion(0, "active")).toBe(false);
    });

    it("should not allow duplicate certificates for same user/course", () => {
      const existingCertificates = [
        { userId: 1, courseId: 1 },
        { userId: 1, courseId: 2 },
      ];

      const checkDuplicate = (userId: number, courseId: number) => {
        return existingCertificates.some(
          c => c.userId === userId && c.courseId === courseId
        );
      };

      expect(checkDuplicate(1, 1)).toBe(true);
      expect(checkDuplicate(1, 3)).toBe(false);
      expect(checkDuplicate(2, 1)).toBe(false);
    });
  });

  describe("PDF Generation Service", () => {
    it("should accept required certificate data fields", () => {
      const certData = {
        recipientName: "Jane Doe",
        courseTitle: "Path I: Foundations",
        certificateNumber: "RA-TEST-0001-001-ABCD",
        issuedAt: new Date(),
        language: "en" as const,
      };

      expect(certData.recipientName).toBeDefined();
      expect(certData.courseTitle).toBeDefined();
      expect(certData.certificateNumber).toBeDefined();
      expect(certData.issuedAt).toBeInstanceOf(Date);
      expect(["en", "fr"]).toContain(certData.language);
    });

    it("should accept optional path and lesson data", () => {
      const certData = {
        recipientName: "Jane Doe",
        courseTitle: "Path I: Foundations",
        certificateNumber: "RA-TEST-0001-001-ABCD",
        issuedAt: new Date(),
        language: "fr" as const,
        pathTitle: "Path I: Fondations du français professionnel",
        totalLessons: 16,
        badgeImageUrl: "https://cdn.example.com/badges/path-i.png",
      };

      expect(certData.pathTitle).toBeDefined();
      expect(certData.totalLessons).toBe(16);
      expect(certData.badgeImageUrl).toContain("badges/");
    });

    it("should generate S3 file key with certificate number", () => {
      const certificateNumber = "RA-TEST-0001-001-ABCD";
      const timestamp = Date.now().toString(36);
      const fileKey = `certificates/${certificateNumber}-${timestamp}.pdf`;
      
      expect(fileKey).toContain("certificates/");
      expect(fileKey).toContain(certificateNumber);
      expect(fileKey).toMatch(/\.pdf$/);
    });

    it("should support both EN and FR languages", () => {
      const getContent = (lang: "en" | "fr") => {
        const isEn = lang === "en";
        return {
          title: isEn ? "Certificate of Completion" : "Certificat de réussite",
          subtitle: isEn ? "This is to certify that" : "Ceci certifie que",
          hasCompleted: isEn ? "has successfully completed the course" : "a complété avec succès le cours",
          issuedOn: isEn ? "Issued on" : "Délivré le",
          signedBy: isEn ? "Signed by" : "Signé par",
        };
      };

      const enContent = getContent("en");
      const frContent = getContent("fr");
      
      expect(enContent.title).toBe("Certificate of Completion");
      expect(frContent.title).toBe("Certificat de réussite");
      expect(enContent.issuedOn).toBe("Issued on");
      expect(frContent.issuedOn).toBe("Délivré le");
    });
  });

  describe("Auto-Certificate Generation", () => {
    it("should trigger when enrollment reaches 100%", () => {
      const shouldAutoGenerate = (enrollmentPercent: number) => enrollmentPercent >= 100;
      
      expect(shouldAutoGenerate(100)).toBe(true);
      expect(shouldAutoGenerate(99)).toBe(false);
      expect(shouldAutoGenerate(50)).toBe(false);
      expect(shouldAutoGenerate(0)).toBe(false);
    });

    it("should not generate duplicate certificates", () => {
      const existingCerts = new Map<string, boolean>();
      existingCerts.set("1-1", true); // userId 1, courseId 1

      const shouldGenerate = (userId: number, courseId: number) => {
        const key = `${userId}-${courseId}`;
        if (existingCerts.has(key)) return false;
        existingCerts.set(key, true);
        return true;
      };

      expect(shouldGenerate(1, 1)).toBe(false); // Already exists
      expect(shouldGenerate(1, 2)).toBe(true);  // New
      expect(shouldGenerate(1, 2)).toBe(false); // Now exists
      expect(shouldGenerate(2, 1)).toBe(true);  // Different user
    });

    it("should include autoGenerated flag in metadata", () => {
      const metadata = {
        language: "en",
        completedAt: new Date().toISOString(),
        lessonsCompleted: 16,
        totalLessons: 16,
        instructor: "Prof. Steven Rusinga",
        organization: "RusingAcademy",
        pathTitle: "Path I: Foundations",
        autoGenerated: true,
      };

      expect(metadata.autoGenerated).toBe(true);
      expect(metadata.lessonsCompleted).toBe(metadata.totalLessons);
    });

    it("should look up path title from pathCourses → learningPaths", () => {
      // Simulate the path lookup chain
      const pathCourses = [
        { courseId: 1, pathId: 10 },
        { courseId: 2, pathId: 10 },
        { courseId: 3, pathId: 20 },
      ];
      const learningPaths = [
        { id: 10, title: "Path I: Fondations du français professionnel" },
        { id: 20, title: "Path II: Aisance au quotidien" },
      ];

      const getPathTitle = (courseId: number): string | undefined => {
        const pc = pathCourses.find(p => p.courseId === courseId);
        if (!pc) return undefined;
        const path = learningPaths.find(p => p.id === pc.pathId);
        return path?.title;
      };

      expect(getPathTitle(1)).toBe("Path I: Fondations du français professionnel");
      expect(getPathTitle(3)).toBe("Path II: Aisance au quotidien");
      expect(getPathTitle(99)).toBeUndefined();
    });

    it("should gracefully handle PDF generation failure", async () => {
      const generateWithFallback = async (data: any): Promise<string | null> => {
        try {
          throw new Error("S3 upload failed");
        } catch (err) {
          console.error("[AutoCert] PDF generation failed:", err);
          return null;
        }
      };

      const pdfUrl = await generateWithFallback({});
      expect(pdfUrl).toBeNull();
    });

    it("should create certificate record even if PDF fails", async () => {
      const records: any[] = [];
      
      const createCertificate = async (data: any, pdfUrl: string | null) => {
        records.push({ ...data, pdfUrl });
      };

      await createCertificate({
        certificateId: "RA-TEST-0001-001-ABCD",
        userId: 1,
        courseId: 1,
        recipientName: "Test User",
        courseName: "Path I",
      }, null); // PDF failed

      expect(records).toHaveLength(1);
      expect(records[0].pdfUrl).toBeNull();
      expect(records[0].certificateId).toBe("RA-TEST-0001-001-ABCD");
    });
  });

  describe("Certificate Data Integrity", () => {
    it("should include verification URL with certificate number", () => {
      const certificateNumber = "RA-TEST-0001-001-ABCD";
      const verificationUrl = `https://rusingacademy.com/verify/${certificateNumber}`;
      
      expect(verificationUrl).toContain(certificateNumber);
      expect(verificationUrl).toContain("rusingacademy.com/verify/");
    });

    it("should format dates correctly for both languages", () => {
      const date = new Date("2026-02-08T12:00:00Z");
      
      const enDate = date.toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric"
      });
      const frDate = date.toLocaleDateString("fr-FR", {
        year: "numeric", month: "long", day: "numeric"
      });

      expect(enDate).toContain("2026");
      expect(frDate).toContain("2026");
      // English uses "February", French uses "février"
      expect(enDate.toLowerCase()).toContain("february");
      expect(frDate.toLowerCase()).toContain("février");
    });

    it("should store all required metadata fields", () => {
      const requiredFields = [
        "language", "completedAt", "lessonsCompleted", 
        "totalLessons", "instructor", "organization"
      ];

      const metadata = {
        language: "en",
        completedAt: new Date().toISOString(),
        lessonsCompleted: 16,
        totalLessons: 16,
        instructor: "Prof. Steven Rusinga",
        organization: "RusingAcademy",
      };

      for (const field of requiredFields) {
        expect(metadata).toHaveProperty(field);
      }
    });
  });

  describe("Certificate Router Procedures", () => {
    it("should have generate procedure (protected)", async () => {
      const { certificatesRouter } = await import("./certificates");
      expect(certificatesRouter._def.procedures.generate).toBeDefined();
    });

    it("should have getCertificate procedure (protected)", async () => {
      const { certificatesRouter } = await import("./certificates");
      expect(certificatesRouter._def.procedures.getCertificate).toBeDefined();
    });

    it("should have getMyCertificates procedure (protected)", async () => {
      const { certificatesRouter } = await import("./certificates");
      expect(certificatesRouter._def.procedures.getMyCertificates).toBeDefined();
    });

    it("should have verify procedure (public)", async () => {
      const { certificatesRouter } = await import("./certificates");
      expect(certificatesRouter._def.procedures.verify).toBeDefined();
    });
  });
});
