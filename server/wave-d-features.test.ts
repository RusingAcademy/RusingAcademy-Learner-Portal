import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const ROOT = path.resolve(__dirname, "..");

function readFile(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf-8");
}

function fileExists(relPath: string): boolean {
  return fs.existsSync(path.join(ROOT, relPath));
}

// ═══════════════════════════════════════════════════════════════
// 1. BUNDLES & LEARNING PATHS PAGE — Step 11
// ═══════════════════════════════════════════════════════════════
describe("Bundles & Learning Paths Page — Step 11", () => {
  describe("File Existence", () => {
    it("BundlesAndPaths.tsx exists", () => {
      expect(fileExists("client/src/pages/BundlesAndPaths.tsx")).toBe(true);
    });
  });

  describe("Route Registration", () => {
    it("/bundles route is registered in App.tsx", () => {
      const appSrc = readFile("client/src/App.tsx");
      expect(appSrc).toContain('path="/bundles"');
    });

    it("BundlesAndPaths is imported in App.tsx", () => {
      const appSrc = readFile("client/src/App.tsx");
      expect(appSrc).toContain("import BundlesAndPaths");
    });
  });

  describe("Component Content", () => {
    const src = readFile("client/src/pages/BundlesAndPaths.tsx");

    it("uses EcosystemHeaderGold for consistent branding", () => {
      expect(src).toContain("EcosystemHeaderGold");
    });

    it("uses EcosystemFooter for consistent footer", () => {
      expect(src).toContain("EcosystemFooter");
    });

    it("displays bundle pricing information", () => {
      expect(src).toMatch(/price|Price|pricing|Pricing/);
    });

    it("includes path series data", () => {
      expect(src).toMatch(/PATH_SERIES|pathSeries|paths/);
    });

    it("includes Stripe checkout integration", () => {
      expect(src).toMatch(/checkout|Checkout|createCourseCheckout|enroll/i);
    });

    it("supports bilingual content (EN/FR)", () => {
      expect(src).toContain("useLanguage");
    });

    it("includes savings/discount display", () => {
      expect(src).toMatch(/save|Save|savings|discount|économ/i);
    });

    it("includes comparison or feature grid", () => {
      expect(src).toMatch(/grid|Grid|compare|feature/i);
    });

    it("uses framer-motion for animations", () => {
      expect(src).toContain("framer-motion");
    });

    it("includes CTA buttons for enrollment", () => {
      expect(src).toMatch(/Button|button/);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// 2. CONVERSATION PRACTICE MODE — Step 13
// ═══════════════════════════════════════════════════════════════
describe("Conversation Practice Mode — Step 13", () => {
  describe("File Existence", () => {
    it("ConversationPractice.tsx exists", () => {
      expect(fileExists("client/src/pages/ConversationPractice.tsx")).toBe(true);
    });
  });

  describe("Route Registration", () => {
    it("/conversation-practice route is registered in App.tsx", () => {
      const appSrc = readFile("client/src/App.tsx");
      expect(appSrc).toContain('path="/conversation-practice"');
    });

    it("ConversationPractice is imported in App.tsx", () => {
      const appSrc = readFile("client/src/App.tsx");
      expect(appSrc).toContain("import ConversationPractice");
    });
  });

  describe("Component Content", () => {
    const src = readFile("client/src/pages/ConversationPractice.tsx");

    it("integrates with SLE Companion backend (trpc.sleCompanion)", () => {
      expect(src).toContain("trpc.sleCompanion");
    });

    it("supports audio recording via MediaRecorder API", () => {
      expect(src).toContain("MediaRecorder");
    });

    it("supports audio transcription", () => {
      expect(src).toMatch(/transcrib|Transcrib|uploadAndTranscribeAudio/);
    });

    it("has session setup state (coach, level, skill selection)", () => {
      expect(src).toContain("selectedCoach");
      expect(src).toContain("selectedLevel");
      expect(src).toContain("selectedSkill");
    });

    it("supports 2 active AI coaches (STEVEN, PRECIOSA) + 2 legacy redirects", () => {
      // Active coaches
      expect(src).toContain("STEVEN");
      expect(src).toContain("PRECIOSA");
      // Legacy coaches still in enum for DB backward compatibility
      expect(src).toContain("SUE_ANNE");
      expect(src).toContain("ERIKA");
    });

    it("supports 3 session states (setup, active, ended)", () => {
      expect(src).toContain('"setup"');
      expect(src).toContain('"active"');
      expect(src).toContain('"ended"');
    });

    it("displays real-time evaluation scores", () => {
      expect(src).toMatch(/score|Score/);
    });

    it("shows corrections and suggestions from AI", () => {
      expect(src).toContain("corrections");
      expect(src).toContain("suggestions");
    });

    it("includes start session mutation", () => {
      expect(src).toContain("startSession");
    });

    it("includes send message mutation", () => {
      expect(src).toContain("sendMessage");
    });

    it("includes end session mutation", () => {
      expect(src).toContain("endSession");
    });

    it("uses Streamdown for markdown rendering", () => {
      expect(src).toContain("Streamdown");
    });

    it("supports bilingual content (EN/FR)", () => {
      expect(src).toContain("useLanguage");
    });

    it("has microphone recording UI with start/stop", () => {
      expect(src).toContain("isRecording");
      expect(src).toContain("handleStartRecording");
      expect(src).toContain("handleStopRecording");
    });

    it("includes skill focus options (oral, written, comprehension)", () => {
      expect(src).toContain("oral_expression");
      expect(src).toContain("oral_comprehension");
      expect(src).toContain("written_expression");
      expect(src).toContain("written_comprehension");
    });

    it("uses framer-motion for message animations", () => {
      expect(src).toContain("AnimatePresence");
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// 3. WEEKLY CHALLENGES ADMIN — Step 14
// ═══════════════════════════════════════════════════════════════
describe("Weekly Challenges Admin — Step 14", () => {
  describe("File Existence", () => {
    it("WeeklyChallenges.tsx admin page exists", () => {
      expect(fileExists("client/src/pages/admin/WeeklyChallenges.tsx")).toBe(true);
    });
  });

  describe("Admin Registration", () => {
    it("WeeklyChallenges is exported from admin/index.ts", () => {
      const indexSrc = readFile("client/src/pages/admin/index.ts");
      expect(indexSrc).toContain("WeeklyChallenges");
    });

    it("weekly-challenges section is in AdminControlCenter sectionMap", () => {
      const accSrc = readFile("client/src/pages/AdminControlCenter.tsx");
      expect(accSrc).toContain('"weekly-challenges"');
      expect(accSrc).toContain("WeeklyChallenges");
    });

    it("/admin/weekly-challenges route exists in App.tsx", () => {
      const appSrc = readFile("client/src/App.tsx");
      expect(appSrc).toContain('path="/admin/weekly-challenges"');
    });

    it("Weekly Challenges nav item exists in AdminLayout sidebar", () => {
      const layoutSrc = readFile("client/src/components/AdminLayout.tsx");
      expect(layoutSrc).toContain("weekly-challenges");
      expect(layoutSrc).toContain("Weekly Challenges");
    });
  });

  describe("Component Content", () => {
    const src = readFile("client/src/pages/admin/WeeklyChallenges.tsx");

    it("includes challenge creation dialog", () => {
      expect(src).toContain("showCreateDialog");
    });

    it("includes challenge editing dialog", () => {
      expect(src).toContain("showEditDialog");
    });

    it("supports multiple challenge types", () => {
      expect(src).toContain("oral_challenge");
      expect(src).toContain("writing_prompt");
      expect(src).toContain("reading_challenge");
      expect(src).toContain("vocabulary_sprint");
      expect(src).toContain("grammar_gauntlet");
    });

    it("displays challenge statistics (participants, completions)", () => {
      expect(src).toContain("participants");
      expect(src).toContain("completions");
    });

    it("shows completion rate", () => {
      expect(src).toContain("completionRate");
    });

    it("supports XP rewards", () => {
      expect(src).toContain("xpReward");
    });

    it("supports badge rewards", () => {
      expect(src).toContain("badgeReward");
    });

    it("includes bilingual form fields (EN/FR)", () => {
      expect(src).toContain("titleFr");
      expect(src).toContain("descriptionFr");
    });

    it("has search functionality", () => {
      expect(src).toContain("searchQuery");
    });

    it("separates active and past challenges", () => {
      expect(src).toContain("activeChallenges");
      expect(src).toContain("pastChallenges");
    });

    it("includes date range (weekStart, weekEnd)", () => {
      expect(src).toContain("weekStart");
      expect(src).toContain("weekEnd");
    });

    it("uses sonner toast for notifications", () => {
      expect(src).toContain('from "sonner"');
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// 4. CALENDLY BOOKING INTEGRATION — Step 21
// ═══════════════════════════════════════════════════════════════
describe("Calendly Booking Integration — Step 21", () => {
  describe("Backend Service", () => {
    it("CalendlyService file exists", () => {
      expect(fileExists("server/services/calendlyService.ts")).toBe(true);
    });

    it("Calendly webhook handler exists", () => {
      expect(fileExists("server/webhooks/calendly.ts")).toBe(true);
    });

    it("Calendly test file exists", () => {
      expect(fileExists("server/calendly.test.ts")).toBe(true);
    });
  });

  describe("Contact Page Calendly Section", () => {
    const contactSrc = readFile("client/src/pages/Contact.tsx");

    it("Contact page includes Calendly booking section", () => {
      expect(contactSrc).toContain("Calendly Booking Section");
    });

    it("includes Book a Free Consultation heading", () => {
      expect(contactSrc).toContain("Book a Free Consultation");
    });

    it("includes French translation for booking", () => {
      expect(contactSrc).toContain("Réservez une Consultation Gratuite");
    });

    it("links to /booking page", () => {
      expect(contactSrc).toContain('href="/booking"');
    });

    it("includes Calendar icon import", () => {
      expect(contactSrc).toContain("Calendar");
    });

    it("shows 30-minute consultation info", () => {
      expect(contactSrc).toContain("30 Minutes");
    });

    it("shows free and no obligation info", () => {
      expect(contactSrc).toMatch(/Free.*No Obligation|Gratuit.*Sans Engagement/);
    });
  });

  describe("Booking Routes", () => {
    const appSrc = readFile("client/src/App.tsx");

    it("/booking route exists", () => {
      expect(appSrc).toContain('path="/booking"');
    });

    it("/booking/confirmation route exists", () => {
      expect(appSrc).toContain('path="/booking/confirmation"');
    });

    it("/booking/success route exists", () => {
      expect(appSrc).toContain('path="/booking/success"');
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// 5. CURRICULUM MODULE ACCORDION — Step 6
// ═══════════════════════════════════════════════════════════════
describe("Curriculum Module Accordion — Step 6", () => {
  describe("CurriculumPathSeries Enhancement", () => {
    const src = readFile("client/src/pages/CurriculumPathSeries.tsx");

    it("includes CurriculumModulePreview component", () => {
      expect(src).toContain("CurriculumModulePreview");
    });

    it("fetches course data via trpc.courses.getBySlug", () => {
      expect(src).toContain("courses.getBySlug");
    });

    it("displays module accordion with expandable sections", () => {
      expect(src).toMatch(/expandedModule|accordion|Accordion/i);
    });

    it("shows lesson count per module", () => {
      expect(src).toMatch(/lesson|Lesson/);
    });

    it("includes View Full Course link", () => {
      expect(src).toMatch(/View Full Course|Voir le Cours Complet|View Course|CourseDetail/i);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// 6. EXISTING FEATURES VERIFICATION — Steps 7-9, 17-19
// ═══════════════════════════════════════════════════════════════
describe("Existing Features Verification", () => {
  describe("Step 7: Stripe Checkout for Course Enrollment", () => {
    it("createCourseCheckout procedure exists in courses router", () => {
      const routerSrc = readFile("server/routers.ts");
      expect(routerSrc).toContain("createCourseCheckout");
    });

    it("Stripe products file exists", () => {
      expect(fileExists("server/stripe/products.ts")).toBe(true);
    });

    it("CourseSuccess page exists", () => {
      expect(fileExists("client/src/pages/CourseSuccess.tsx")).toBe(true);
    });

    it("Webhook handles checkout.session.completed", () => {
      const webhookSrc = readFile("server/stripe/webhook.ts");
      expect(webhookSrc).toContain("checkout.session.completed");
    });
  });

  describe("Step 8: Quiz System", () => {
    it("submitQuiz procedure exists in courses router", () => {
      const routerSrc = readFile("server/routers/courses.ts");
      expect(routerSrc).toContain("submitQuiz");
    });

    it("quizQuestions table exists in schema", () => {
      const schemaSrc = readFile("drizzle/schema.ts");
      expect(schemaSrc).toContain("quizQuestions");
    });

    it("quizAttempts table exists in schema", () => {
      const schemaSrc = readFile("drizzle/schema.ts");
      expect(schemaSrc).toContain("quizAttempts");
    });
  });

  describe("Step 9: Mark as Complete & Progression", () => {
    it("updateProgress procedure exists in courses router", () => {
      const routerSrc = readFile("server/routers/courses.ts");
      expect(routerSrc).toContain("updateProgress");
    });

    it("LessonViewer page exists", () => {
      expect(fileExists("client/src/pages/LessonViewer.tsx")).toBe(true);
    });
  });

  describe("Step 17: Media Library", () => {
    it("MediaLibrary admin page exists", () => {
      expect(fileExists("client/src/pages/admin/MediaLibrary.tsx")).toBe(true);
    });

    it("media-library section is in AdminControlCenter", () => {
      const accSrc = readFile("client/src/pages/AdminControlCenter.tsx");
      expect(accSrc).toContain('"media-library"');
    });
  });

  describe("Step 18: Email Template Builder", () => {
    it("EmailTemplateBuilder admin page exists", () => {
      expect(fileExists("client/src/pages/admin/EmailTemplateBuilder.tsx")).toBe(true);
    });

    it("email-templates section is in AdminControlCenter", () => {
      const accSrc = readFile("client/src/pages/AdminControlCenter.tsx");
      expect(accSrc).toContain('"email-templates"');
    });
  });

  describe("Step 19: Contact Page with Lead Management", () => {
    it("Contact page exists", () => {
      expect(fileExists("client/src/pages/Contact.tsx")).toBe(true);
    });

    it("Contact router exists with submit procedure", () => {
      const routerSrc = readFile("server/routers.ts");
      expect(routerSrc).toContain("contact");
    });

    it("/contact route exists in App.tsx", () => {
      const appSrc = readFile("client/src/App.tsx");
      expect(appSrc).toContain('path="/contact"');
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// 7. CROSS-CUTTING CONCERNS
// ═══════════════════════════════════════════════════════════════
describe("Cross-Cutting Concerns", () => {
  describe("Bilingual Support", () => {
    it("BundlesAndPaths supports bilingual content", () => {
      const src = readFile("client/src/pages/BundlesAndPaths.tsx");
      expect(src).toContain("useLanguage");
    });

    it("ConversationPractice supports bilingual content", () => {
      const src = readFile("client/src/pages/ConversationPractice.tsx");
      expect(src).toContain("useLanguage");
    });

    it("Contact Calendly section supports bilingual content", () => {
      const src = readFile("client/src/pages/Contact.tsx");
      expect(src).toContain("useLanguage");
    });
  });

  describe("Consistent Branding", () => {
    it("BundlesAndPaths uses brand colors (#0F3D3E, #C65A1E)", () => {
      const src = readFile("client/src/pages/BundlesAndPaths.tsx");
      expect(src).toContain("#0F3D3E");
      expect(src).toContain("#C65A1E");
    });

    it("ConversationPractice uses brand colors", () => {
      const src = readFile("client/src/pages/ConversationPractice.tsx");
      expect(src).toContain("#0F3D3E");
      expect(src).toContain("#C65A1E");
    });

    it("WeeklyChallenges uses brand accent color", () => {
      const src = readFile("client/src/pages/admin/WeeklyChallenges.tsx");
      expect(src).toContain("#C65A1E");
    });
  });

  describe("Toast Notifications (sonner)", () => {
    it("ConversationPractice uses sonner toast", () => {
      const src = readFile("client/src/pages/ConversationPractice.tsx");
      expect(src).toContain('from "sonner"');
    });

    it("WeeklyChallenges uses sonner toast", () => {
      const src = readFile("client/src/pages/admin/WeeklyChallenges.tsx");
      expect(src).toContain('from "sonner"');
    });
  });
});
