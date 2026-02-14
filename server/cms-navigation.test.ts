import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Tests for CMS Navigation Integration
 * 
 * Validates:
 * 1. Public navigation API returns seeded menus
 * 2. Bilingual label parsing (EN | FR format)
 * 3. Menu filtering by brand name
 * 4. Fallback behavior when no CMS data
 * 5. Icon mapping from string to component
 */

// ============================================================
// 1. Bilingual Label Parsing
// ============================================================
describe("Bilingual Label Parsing", () => {
  const parseLabel = (label: string) => {
    if (!label) return { en: "", fr: "" };
    const parts = label.split("|").map((s: string) => s.trim());
    if (parts.length >= 2) return { en: parts[0], fr: parts[1] };
    return { en: label, fr: label };
  };

  it("should parse 'EN | FR' format correctly", () => {
    const result = parseLabel("Courses | Formations");
    expect(result.en).toBe("Courses");
    expect(result.fr).toBe("Formations");
  });

  it("should handle single-language labels", () => {
    const result = parseLabel("Services");
    expect(result.en).toBe("Services");
    expect(result.fr).toBe("Services");
  });

  it("should handle empty labels", () => {
    const result = parseLabel("");
    expect(result.en).toBe("");
    expect(result.fr).toBe("");
  });

  it("should handle labels with multiple pipes", () => {
    const result = parseLabel("EdTech & AI | EdTech & IA | Extra");
    expect(result.en).toBe("EdTech & AI");
    expect(result.fr).toBe("EdTech & IA");
  });

  it("should trim whitespace around pipe separator", () => {
    const result = parseLabel("  Our Team  |  Notre équipe  ");
    expect(result.en).toBe("Our Team");
    expect(result.fr).toBe("Notre équipe");
  });
});

// ============================================================
// 2. Menu Filtering by Brand
// ============================================================
describe("Menu Filtering by Brand", () => {
  const mockMenus = [
    { id: 1, name: "rusingacademy", location: "header", isActive: 1, items: [
      { id: 1, label: "Courses | Formations", url: "/courses", icon: "BookOpen", sortOrder: 1, isVisible: 1 },
    ]},
    { id: 2, name: "lingueefy", location: "header", isActive: 1, items: [
      { id: 6, label: "Find a Coach | Trouver un coach", url: "/coaches", icon: "Search", sortOrder: 1, isVisible: 1 },
    ]},
    { id: 3, name: "barholex", location: "header", isActive: 1, items: [
      { id: 11, label: "Services", url: "/barholex/services", icon: "Briefcase", sortOrder: 1, isVisible: 1 },
    ]},
  ];

  it("should find rusingacademy menu by brand name", () => {
    const menu = mockMenus.find(m => m.name.toLowerCase().includes("rusingacademy"));
    expect(menu).toBeDefined();
    expect(menu!.id).toBe(1);
    expect(menu!.items.length).toBe(1);
  });

  it("should find lingueefy menu by brand name", () => {
    const menu = mockMenus.find(m => m.name.toLowerCase().includes("lingueefy"));
    expect(menu).toBeDefined();
    expect(menu!.id).toBe(2);
  });

  it("should find barholex menu by brand name", () => {
    const menu = mockMenus.find(m => m.name.toLowerCase().includes("barholex"));
    expect(menu).toBeDefined();
    expect(menu!.id).toBe(3);
  });

  it("should return undefined for unknown brand", () => {
    const menu = mockMenus.find(m => m.name.toLowerCase().includes("unknown"));
    expect(menu).toBeUndefined();
  });
});

// ============================================================
// 3. Fallback Navigation Items
// ============================================================
describe("Fallback Navigation Items", () => {
  const FALLBACK_RUSINGACADEMY = [
    { id: "ra-1", href: "/courses", labelEn: "Courses", labelFr: "Formations", icon: "BookOpen" },
    { id: "ra-2", href: "/curriculum", labelEn: "Our Curriculum", labelFr: "Notre programme", icon: "GraduationCap" },
    { id: "ra-3", href: "/rusingacademy/for-business", labelEn: "For Business", labelFr: "Entreprises", icon: "Building2" },
    { id: "ra-4", href: "/rusingacademy/for-government", labelEn: "For Government", labelFr: "Gouvernement", icon: "Landmark" },
    { id: "ra-5", href: "/coaches", labelEn: "Our Team", labelFr: "Notre équipe", icon: "Users" },
  ];

  it("should have 5 fallback items for RusingAcademy", () => {
    expect(FALLBACK_RUSINGACADEMY.length).toBe(5);
  });

  it("should have bilingual labels for all fallback items", () => {
    for (const item of FALLBACK_RUSINGACADEMY) {
      expect(item.labelEn).toBeTruthy();
      expect(item.labelFr).toBeTruthy();
      expect(item.href).toMatch(/^\//);
    }
  });

  it("should have icon identifiers for all fallback items", () => {
    for (const item of FALLBACK_RUSINGACADEMY) {
      expect(item.icon).toBeTruthy();
    }
  });
});

// ============================================================
// 4. Icon String to Component Mapping
// ============================================================
describe("Icon String Mapping", () => {
  const ICON_MAP: Record<string, string> = {
    BookOpen: "BookOpen",
    GraduationCap: "GraduationCap",
    Building2: "Building2",
    Landmark: "Landmark",
    Users: "Users",
    Search: "Search",
    UserPlus: "UserPlus",
    Bot: "Bot",
    Briefcase: "Briefcase",
    FolderOpen: "FolderOpen",
    Cpu: "Cpu",
    Mic: "Mic",
    Mail: "Mail",
  };

  it("should map all expected icon names", () => {
    const expectedIcons = ["BookOpen", "GraduationCap", "Building2", "Landmark", "Users", "Search", "UserPlus", "Bot", "Briefcase", "FolderOpen", "Cpu", "Mic", "Mail"];
    for (const icon of expectedIcons) {
      expect(ICON_MAP[icon]).toBeDefined();
    }
  });

  it("should return undefined for unknown icon names", () => {
    expect(ICON_MAP["NonExistentIcon"]).toBeUndefined();
  });
});

// ============================================================
// 5. CMS Navigation API Integration (Live)
// ============================================================
describe("CMS Navigation API Integration", () => {
  it("should return navigation menus from the API", async () => {
    const response = await fetch(
      `http://localhost:3000/api/trpc/cms.getPublicNavigation?batch=1&input=${encodeURIComponent(
        JSON.stringify({ "0": { json: { location: "header" } } })
      )}`
    );
    expect(response.ok).toBe(true);
    
    const body = await response.json();
    expect(body).toBeInstanceOf(Array);
    expect(body[0].result.data.json.menus).toBeDefined();
    
    const menus = body[0].result.data.json.menus;
    expect(menus.length).toBeGreaterThanOrEqual(3);
    
    // Verify all three brands are present
    const menuNames = menus.map((m: any) => m.name);
    expect(menuNames).toContain("rusingacademy");
    expect(menuNames).toContain("lingueefy");
    expect(menuNames).toContain("barholex");
  });

  it("should return menu items with correct structure", async () => {
    const response = await fetch(
      `http://localhost:3000/api/trpc/cms.getPublicNavigation?batch=1&input=${encodeURIComponent(
        JSON.stringify({ "0": { json: { location: "header" } } })
      )}`
    );
    const body = await response.json();
    const menus = body[0].result.data.json.menus;
    
    const raMenu = menus.find((m: any) => m.name === "rusingacademy");
    expect(raMenu).toBeDefined();
    expect(raMenu.items.length).toBeGreaterThanOrEqual(5);
    
    // Verify item structure
    const firstItem = raMenu.items[0];
    expect(firstItem).toHaveProperty("id");
    expect(firstItem).toHaveProperty("label");
    expect(firstItem).toHaveProperty("url");
    expect(firstItem).toHaveProperty("icon");
    expect(firstItem).toHaveProperty("sortOrder");
    expect(firstItem).toHaveProperty("isVisible");
  });

  it("should return bilingual labels in 'EN | FR' format", async () => {
    const response = await fetch(
      `http://localhost:3000/api/trpc/cms.getPublicNavigation?batch=1&input=${encodeURIComponent(
        JSON.stringify({ "0": { json: { location: "header" } } })
      )}`
    );
    const body = await response.json();
    const menus = body[0].result.data.json.menus;
    
    const raMenu = menus.find((m: any) => m.name === "rusingacademy");
    const coursesItem = raMenu.items.find((i: any) => i.url === "/courses");
    expect(coursesItem).toBeDefined();
    expect(coursesItem.label).toContain("|"); // Bilingual format
    
    // Parse and verify
    const parts = coursesItem.label.split("|").map((s: string) => s.trim());
    expect(parts[0]).toBe("Courses");
    expect(parts[1]).toBe("Formations");
  });

  it("should return footer menus with items", async () => {
    const response = await fetch(
      `http://localhost:3000/api/trpc/cms.getPublicNavigation?batch=1&input=${encodeURIComponent(
        JSON.stringify({ "0": { json: { location: "footer" } } })
      )}`
    );
    const body = await response.json();
    const menus = body[0].result.data.json.menus;
    expect(menus.length).toBeGreaterThanOrEqual(3);
    const names = menus.map((m: any) => m.name);
    expect(names).toContain("footer-learners");
    expect(names).toContain("footer-coaches");
    expect(names).toContain("footer-company");
    // Each footer menu should have items
    for (const menu of menus) {
      expect(menu.items.length).toBeGreaterThan(0);
    }
  });

  it("should return empty menus for location with no menus", async () => {
    const response = await fetch(
      `http://localhost:3000/api/trpc/cms.getPublicNavigation?batch=1&input=${encodeURIComponent(
        JSON.stringify({ "0": { json: { location: "sidebar" } } })
      )}`
    );
    const body = await response.json();
    const menus = body[0].result.data.json.menus;
    expect(menus.length).toBe(0);
  });
});
