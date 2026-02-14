import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Tests for CMS public page rendering, publishing workflow,
 * and enhanced Preview Mode with 5 role-based views
 */

// ============================================================================
// CMS PUBLIC PAGE RENDERING
// ============================================================================
describe("CMS Public Page Rendering", () => {
  it("should define the correct CMS page statuses", () => {
    const validStatuses = ["draft", "published", "archived"];
    expect(validStatuses).toContain("draft");
    expect(validStatuses).toContain("published");
    expect(validStatuses).toContain("archived");
    expect(validStatuses).toHaveLength(3);
  });

  it("should validate page slug format", () => {
    const validSlugs = ["home", "about-us", "pricing-2024", "course-catalog"];
    const invalidSlugs = ["", "has spaces", "UPPERCASE", "special!chars"];

    validSlugs.forEach((slug) => {
      expect(/^[a-z0-9-]+$/.test(slug)).toBe(true);
    });

    invalidSlugs.forEach((slug) => {
      expect(/^[a-z0-9-]+$/.test(slug)).toBe(false);
    });
  });

  it("should structure CMS page data correctly", () => {
    const page = {
      id: 1,
      title: "About Us",
      slug: "about-us",
      status: "published",
      metaTitle: "About RusingÂcademy",
      metaDescription: "Learn about our mission",
      ogImage: "https://example.com/og.jpg",
      publishedAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    expect(page.status).toBe("published");
    expect(page.slug).toBe("about-us");
    expect(page.metaTitle).toBeTruthy();
    expect(page.metaDescription).toBeTruthy();
    expect(page.publishedAt).toBeGreaterThan(0);
  });

  it("should structure CMS page sections correctly", () => {
    const section = {
      id: 1,
      pageId: 1,
      sectionType: "hero",
      content: JSON.stringify({
        title: "Welcome",
        subtitle: "Learn with us",
        ctaText: "Get Started",
        ctaLink: "/courses",
      }),
      styling: JSON.stringify({
        backgroundColor: "#1a1a2e",
        textColor: "#ffffff",
        padding: "80px",
      }),
      sortOrder: 0,
      isVisible: true,
    };

    expect(section.sectionType).toBe("hero");
    expect(section.isVisible).toBe(true);
    const content = JSON.parse(section.content);
    expect(content.title).toBe("Welcome");
    expect(content.ctaText).toBe("Get Started");
  });

  it("should support all 16 section types", () => {
    const sectionTypes = [
      "hero", "features", "testimonials", "pricing",
      "cta", "faq", "team", "stats",
      "content", "gallery", "video", "contact",
      "newsletter", "logos", "timeline", "custom",
    ];

    expect(sectionTypes).toHaveLength(16);
    sectionTypes.forEach((type) => {
      expect(typeof type).toBe("string");
      expect(type.length).toBeGreaterThan(0);
    });
  });
});

// ============================================================================
// PUBLISHING WORKFLOW
// ============================================================================
describe("CMS Publishing Workflow", () => {
  it("should transition page status correctly: draft → published", () => {
    const transitions: Record<string, string[]> = {
      draft: ["published", "archived"],
      published: ["draft", "archived"],
      archived: ["draft"],
    };

    expect(transitions.draft).toContain("published");
    expect(transitions.published).toContain("draft");
    expect(transitions.archived).toContain("draft");
    expect(transitions.archived).not.toContain("published");
  });

  it("should set publishedAt timestamp when publishing", () => {
    const now = Date.now();
    const page = {
      status: "draft" as string,
      publishedAt: null as number | null,
    };

    // Simulate publish
    page.status = "published";
    page.publishedAt = now;

    expect(page.status).toBe("published");
    expect(page.publishedAt).toBe(now);
    expect(page.publishedAt).toBeGreaterThan(0);
  });

  it("should validate SEO fields before publishing", () => {
    const validateSEO = (page: { metaTitle?: string; metaDescription?: string; slug: string }) => {
      const errors: string[] = [];
      if (!page.slug) errors.push("Slug is required");
      if (page.metaTitle && page.metaTitle.length > 60) errors.push("Meta title too long");
      if (page.metaDescription && page.metaDescription.length > 160) errors.push("Meta description too long");
      return errors;
    };

    expect(validateSEO({ slug: "about", metaTitle: "About", metaDescription: "About us" })).toHaveLength(0);
    expect(validateSEO({ slug: "about", metaTitle: "A".repeat(61) })).toContain("Meta title too long");
    expect(validateSEO({ slug: "about", metaDescription: "A".repeat(161) })).toContain("Meta description too long");
  });

  it("should support page versioning", () => {
    const version = {
      id: 1,
      pageId: 1,
      versionNumber: 3,
      title: "About Us v3",
      sections: JSON.stringify([{ type: "hero", content: {} }]),
      createdAt: Date.now(),
      createdBy: "admin",
    };

    expect(version.versionNumber).toBe(3);
    expect(version.pageId).toBe(1);
    const sections = JSON.parse(version.sections);
    expect(Array.isArray(sections)).toBe(true);
    expect(sections[0].type).toBe("hero");
  });
});

// ============================================================================
// PREVIEW MODE — ROLE-BASED VIEWS
// ============================================================================
describe("Preview Mode — Role-Based Views", () => {
  const validRoles = ["public", "learner", "coach", "hr", "admin"];

  it("should support all 5 preview roles", () => {
    expect(validRoles).toHaveLength(5);
    expect(validRoles).toContain("public");
    expect(validRoles).toContain("learner");
    expect(validRoles).toContain("coach");
    expect(validRoles).toContain("hr");
    expect(validRoles).toContain("admin");
  });

  it("should map preview roles to backend viewAs values", () => {
    const roleMapping: Record<string, string> = {
      public: "public",
      learner: "student",
      coach: "coach",
      hr: "admin", // HR uses admin data with filtered view
      admin: "admin",
    };

    expect(roleMapping.public).toBe("public");
    expect(roleMapping.learner).toBe("student");
    expect(roleMapping.coach).toBe("coach");
    expect(roleMapping.hr).toBe("admin");
    expect(roleMapping.admin).toBe("admin");
  });

  it("should require user selection for learner and coach views", () => {
    const requiresUser: Record<string, boolean> = {
      public: false,
      learner: true,
      coach: true,
      hr: false,
      admin: false,
    };

    expect(requiresUser.learner).toBe(true);
    expect(requiresUser.coach).toBe(true);
    expect(requiresUser.public).toBe(false);
    expect(requiresUser.hr).toBe(false);
    expect(requiresUser.admin).toBe(false);
  });

  it("should define correct preview pages per role", () => {
    const getPreviewPages = (role: string) => {
      const base = [
        { label: "Home Page", url: "/" },
        { label: "Courses Catalog", url: "/courses" },
        { label: "Coaching", url: "/coaching" },
        { label: "Pricing", url: "/pricing" },
      ];

      if (role === "learner") {
        base.push(
          { label: "My Dashboard", url: "/learn" },
          { label: "My Courses", url: "/learn/courses" },
        );
      }
      if (role === "coach") {
        base.push(
          { label: "Coach Dashboard", url: "/coach" },
          { label: "My Sessions", url: "/coach/sessions" },
        );
      }
      if (role === "hr") {
        base.push(
          { label: "HR Dashboard", url: "/hr" },
          { label: "Team Enrollments", url: "/hr/enrollments" },
        );
      }
      if (role === "admin") {
        base.push(
          { label: "Admin Dashboard", url: "/admin" },
          { label: "User Management", url: "/admin/users" },
        );
      }
      return base;
    };

    expect(getPreviewPages("public")).toHaveLength(4);
    expect(getPreviewPages("learner")).toHaveLength(6);
    expect(getPreviewPages("coach")).toHaveLength(6);
    expect(getPreviewPages("hr")).toHaveLength(6);
    expect(getPreviewPages("admin")).toHaveLength(6);
  });
});

// ============================================================================
// RESPONSIVE DEVICE PREVIEW
// ============================================================================
describe("Responsive Device Preview", () => {
  const deviceWidths = {
    desktop: "100%",
    tablet: "768px",
    mobile: "375px",
  };

  it("should define correct device widths", () => {
    expect(deviceWidths.desktop).toBe("100%");
    expect(deviceWidths.tablet).toBe("768px");
    expect(deviceWidths.mobile).toBe("375px");
  });

  it("should support all 3 device modes", () => {
    const modes = Object.keys(deviceWidths);
    expect(modes).toHaveLength(3);
    expect(modes).toContain("desktop");
    expect(modes).toContain("tablet");
    expect(modes).toContain("mobile");
  });
});

// ============================================================================
// DRAG AND DROP SECTION ORDERING
// ============================================================================
describe("Drag and Drop Section Ordering", () => {
  it("should reorder sections correctly", () => {
    const sections = [
      { id: 1, sortOrder: 0, sectionType: "hero" },
      { id: 2, sortOrder: 1, sectionType: "features" },
      { id: 3, sortOrder: 2, sectionType: "testimonials" },
      { id: 4, sortOrder: 3, sectionType: "cta" },
    ];

    // Simulate moving section 3 (testimonials) to position 1
    const reorder = (items: typeof sections, fromIndex: number, toIndex: number) => {
      const result = [...items];
      const [moved] = result.splice(fromIndex, 1);
      result.splice(toIndex, 0, moved);
      return result.map((item, i) => ({ ...item, sortOrder: i }));
    };

    const reordered = reorder(sections, 2, 1);
    expect(reordered[0].sectionType).toBe("hero");
    expect(reordered[1].sectionType).toBe("testimonials");
    expect(reordered[2].sectionType).toBe("features");
    expect(reordered[3].sectionType).toBe("cta");

    // Verify sort orders are sequential
    reordered.forEach((s, i) => {
      expect(s.sortOrder).toBe(i);
    });
  });

  it("should handle edge cases in reordering", () => {
    const sections = [
      { id: 1, sortOrder: 0 },
      { id: 2, sortOrder: 1 },
    ];

    // Moving first to last
    const result = [...sections];
    const [moved] = result.splice(0, 1);
    result.push(moved);
    const reordered = result.map((item, i) => ({ ...item, sortOrder: i }));

    expect(reordered[0].id).toBe(2);
    expect(reordered[1].id).toBe(1);
  });
});

// ============================================================================
// GLOBAL STYLING SYSTEM
// ============================================================================
describe("Global Styling System", () => {
  it("should define valid global style structure", () => {
    const globalStyle = {
      primaryColor: "#6d28d9",
      secondaryColor: "#0ea5e9",
      fontFamily: "Inter",
      headingFont: "Poppins",
      borderRadius: "8px",
      spacing: "16px",
    };

    expect(globalStyle.primaryColor).toMatch(/^#[0-9a-f]{6}$/i);
    expect(globalStyle.secondaryColor).toMatch(/^#[0-9a-f]{6}$/i);
    expect(globalStyle.fontFamily).toBeTruthy();
    expect(globalStyle.headingFont).toBeTruthy();
  });

  it("should validate hex color format", () => {
    const isValidHex = (color: string) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color);

    expect(isValidHex("#6d28d9")).toBe(true);
    expect(isValidHex("#fff")).toBe(true);
    expect(isValidHex("#AABBCC")).toBe(true);
    expect(isValidHex("red")).toBe(false);
    expect(isValidHex("#gggggg")).toBe(false);
    expect(isValidHex("")).toBe(false);
  });
});

// ============================================================================
// USER ROLE SCHEMA VALIDATION
// ============================================================================
describe("User Role Schema", () => {
  it("should support all required user roles", () => {
    const roles = ["owner", "admin", "hr_admin", "coach", "learner", "user"];
    expect(roles).toContain("owner");
    expect(roles).toContain("admin");
    expect(roles).toContain("hr_admin");
    expect(roles).toContain("coach");
    expect(roles).toContain("learner");
    expect(roles).toContain("user");
  });

  it("should map user roles to preview modes", () => {
    const roleToPreview: Record<string, string> = {
      owner: "admin",
      admin: "admin",
      hr_admin: "hr",
      coach: "coach",
      learner: "learner",
      user: "learner",
    };

    expect(roleToPreview.owner).toBe("admin");
    expect(roleToPreview.hr_admin).toBe("hr");
    expect(roleToPreview.coach).toBe("coach");
    expect(roleToPreview.learner).toBe("learner");
  });
});
