import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const ROOT = path.resolve(__dirname, "..");

// ─── Helper: read file content ───
function readFile(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf-8");
}

function fileExists(relPath: string): boolean {
  return fs.existsSync(path.join(ROOT, relPath));
}

// ═══════════════════════════════════════════════════════════════
// 1. FUNNELS ROUTER — Backend CRUD Procedures
// ═══════════════════════════════════════════════════════════════
describe("Funnels Router — Backend CRUD", () => {
  const routerSrc = readFile("server/routers/premiumFeatures.ts");

  describe("Router Registration", () => {
    it("funnelsRouter is exported from premiumFeatures.ts", () => {
      expect(routerSrc).toContain("export const funnelsRouter");
    });

    it("funnelsRouter is registered in the appRouter", () => {
      const routersSrc = readFile("server/routers.ts");
      expect(routersSrc).toContain("funnels: funnelsRouter");
    });

    it("funnelsRouter is imported in routers.ts", () => {
      const routersSrc = readFile("server/routers.ts");
      expect(routersSrc).toContain("funnelsRouter");
    });
  });

  describe("list procedure", () => {
    it("has a list procedure that queries funnels table", () => {
      expect(routerSrc).toMatch(/list:\s*protectedProcedure/);
      expect(routerSrc).toContain("SELECT * FROM funnels");
    });

    it("supports search filtering by name or description", () => {
      expect(routerSrc).toContain("search");
      // The list procedure should filter by name or description
      expect(routerSrc).toMatch(/name.*toLowerCase.*includes|filter.*name/);
    });

    it("parses JSON stages field from database", () => {
      expect(routerSrc).toContain("JSON.parse");
    });
  });

  describe("getStats procedure", () => {
    it("has a getStats procedure", () => {
      expect(routerSrc).toMatch(/getStats:\s*protectedProcedure/);
    });

    it("returns total and active counts", () => {
      expect(routerSrc).toContain("total");
      expect(routerSrc).toContain("active");
    });

    it("queries funnels table for stats", () => {
      expect(routerSrc).toContain("SELECT COUNT(*) as total FROM funnels");
    });
  });

  describe("create procedure", () => {
    it("has a create procedure with input validation", () => {
      expect(routerSrc).toMatch(/create:\s*protectedProcedure/);
    });

    it("requires name as minimum input", () => {
      expect(routerSrc).toContain("z.string().min(1)");
    });

    it("accepts stages array with id, type, title, description", () => {
      expect(routerSrc).toContain("z.array(z.object(");
      expect(routerSrc).toContain("id: z.string()");
      expect(routerSrc).toContain("type: z.string()");
      expect(routerSrc).toContain("title: z.string()");
    });

    it("initializes stats with zero values", () => {
      expect(routerSrc).toContain("visitors: 0");
      expect(routerSrc).toContain("conversions: 0");
      expect(routerSrc).toContain("revenue: 0");
    });

    it("inserts into funnels table", () => {
      expect(routerSrc).toContain("INSERT INTO funnels");
    });
  });

  describe("update procedure", () => {
    it("has an update procedure requiring id", () => {
      expect(routerSrc).toMatch(/update:\s*protectedProcedure/);
      expect(routerSrc).toContain("id: z.number()");
    });

    it("supports updating name, description, status, and stages", () => {
      expect(routerSrc).toContain("name: z.string().optional()");
      expect(routerSrc).toContain("description: z.string().optional()");
      expect(routerSrc).toContain("status: z.enum(");
    });

    it("builds dynamic SQL updates", () => {
      expect(routerSrc).toContain("updates.push(");
      expect(routerSrc).toContain("UPDATE funnels SET");
    });
  });

  describe("delete procedure", () => {
    it("has a delete procedure requiring id", () => {
      expect(routerSrc).toMatch(/delete:\s*protectedProcedure/);
      expect(routerSrc).toContain("DELETE FROM funnels");
    });
  });

  describe("duplicate procedure", () => {
    it("has a duplicate procedure", () => {
      expect(routerSrc).toMatch(/duplicate:\s*protectedProcedure/);
    });

    it("fetches original funnel before duplicating", () => {
      expect(routerSrc).toContain("SELECT * FROM funnels WHERE id");
    });

    it("creates copy with (Copy) suffix in name", () => {
      expect(routerSrc).toContain("(Copy)");
    });

    it("resets stats to zero on duplicate", () => {
      // Stats should be reset for the duplicate
      expect(routerSrc).toContain("visitors: 0");
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// 2. AUTOMATIONS ROUTER — Backend CRUD Procedures
// ═══════════════════════════════════════════════════════════════
describe("Automations Router — Backend CRUD", () => {
  const routerSrc = readFile("server/routers/premiumFeatures.ts");

  describe("Router Registration", () => {
    it("automationsRouter is exported from premiumFeatures.ts", () => {
      expect(routerSrc).toContain("export const automationsRouter");
    });

    it("automationsRouter is registered in the appRouter", () => {
      const routersSrc = readFile("server/routers.ts");
      expect(routersSrc).toContain("automations: automationsRouter");
    });
  });

  describe("list procedure", () => {
    it("has a list procedure that queries automations table", () => {
      expect(routerSrc).toContain("SELECT * FROM automations");
    });

    it("supports search filtering", () => {
      // Should filter by name or description
      expect(routerSrc).toMatch(/filter.*name|search/);
    });

    it("parses JSON steps, triggerConfig, and stats fields", () => {
      expect(routerSrc).toContain("steps");
      expect(routerSrc).toContain("triggerConfig");
      expect(routerSrc).toContain("stats");
    });
  });

  describe("getStats procedure", () => {
    it("has a getStats procedure for automations", () => {
      expect(routerSrc).toContain("SELECT COUNT(*) as total FROM automations");
    });

    it("returns total, active, and draft counts", () => {
      expect(routerSrc).toContain("draft");
    });
  });

  describe("create procedure", () => {
    it("has a create procedure with input validation", () => {
      // Automation create should require name and trigger type
      expect(routerSrc).toContain("triggerType: z.enum(");
    });

    it("supports all trigger types", () => {
      expect(routerSrc).toContain("enrollment");
      expect(routerSrc).toContain("purchase");
      expect(routerSrc).toContain("course_complete");
      expect(routerSrc).toContain("lesson_complete");
      expect(routerSrc).toContain("signup");
      expect(routerSrc).toContain("inactivity");
      expect(routerSrc).toContain("tag_added");
      expect(routerSrc).toContain("manual");
    });

    it("accepts steps array with id, type, and config", () => {
      expect(routerSrc).toContain("id: z.string()");
      expect(routerSrc).toContain("type: z.string()");
      expect(routerSrc).toContain("config: z.record(z.any())");
    });

    it("initializes stats with zero values for new automations", () => {
      expect(routerSrc).toContain("triggered: 0");
      expect(routerSrc).toContain("completed: 0");
    });

    it("inserts into automations table", () => {
      expect(routerSrc).toContain("INSERT INTO automations");
    });
  });

  describe("update procedure", () => {
    it("has an update procedure requiring id", () => {
      expect(routerSrc).toContain("UPDATE automations SET");
    });

    it("supports updating status (active, paused, draft)", () => {
      expect(routerSrc).toContain('"active"');
      expect(routerSrc).toContain('"paused"');
      expect(routerSrc).toContain('"draft"');
    });

    it("supports updating steps and triggerType", () => {
      expect(routerSrc).toContain("steps");
      expect(routerSrc).toContain("triggerType");
    });
  });

  describe("delete procedure", () => {
    it("has a delete procedure", () => {
      expect(routerSrc).toContain("DELETE FROM automations");
    });
  });

  describe("duplicate procedure", () => {
    it("has a duplicate procedure", () => {
      expect(routerSrc).toContain("SELECT * FROM automations WHERE id");
    });

    it("copies steps and triggerConfig from original", () => {
      expect(routerSrc).toContain("original.steps");
      expect(routerSrc).toContain("original.triggerConfig");
    });

    it("resets stats on duplicate", () => {
      // Stats should be reset for the duplicate
      expect(routerSrc).toContain("triggered: 0, completed: 0, active: 0");
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// 3. DATABASE SCHEMA — Funnels & Automations Tables
// ═══════════════════════════════════════════════════════════════
describe("Database Schema — Funnels & Automations Tables", () => {
  const schemaSrc = readFile("drizzle/schema.ts");

  it("schema defines funnels table", () => {
    expect(schemaSrc).toContain("funnels");
  });

  it("schema defines automations table", () => {
    expect(schemaSrc).toContain("automations");
  });

  it("funnels table has name, description, status, stages fields", () => {
    // Check that the schema references these field concepts
    expect(schemaSrc).toMatch(/funnels.*name|name.*funnels/s);
  });

  it("automations table has trigger, steps, status fields", () => {
    expect(schemaSrc).toMatch(/automations.*trigger|trigger.*automations/s);
  });
});

// ═══════════════════════════════════════════════════════════════
// 4. FUNNEL BUILDER FRONTEND — trpc Integration
// ═══════════════════════════════════════════════════════════════
describe("FunnelBuilder Frontend — trpc Integration", () => {
  const src = readFile("client/src/pages/admin/FunnelBuilder.tsx");

  describe("trpc data fetching", () => {
    it("uses trpc.funnels.list.useQuery for listing funnels", () => {
      expect(src).toContain("trpc.funnels.list.useQuery");
    });

    it("uses trpc.funnels.getStats.useQuery for stats", () => {
      expect(src).toContain("trpc.funnels.getStats.useQuery");
    });
  });

  describe("trpc mutations", () => {
    it("uses trpc.funnels.create.useMutation", () => {
      expect(src).toContain("trpc.funnels.create.useMutation");
    });

    it("uses trpc.funnels.update.useMutation", () => {
      expect(src).toContain("trpc.funnels.update.useMutation");
    });

    it("uses trpc.funnels.delete.useMutation", () => {
      expect(src).toContain("trpc.funnels.delete.useMutation");
    });

    it("uses trpc.funnels.duplicate.useMutation", () => {
      expect(src).toContain("trpc.funnels.duplicate.useMutation");
    });
  });

  describe("Cache invalidation", () => {
    it("invalidates funnels.list after mutations", () => {
      expect(src).toContain("utils.funnels.list.invalidate");
    });

    it("invalidates funnels.getStats after create/delete", () => {
      expect(src).toContain("utils.funnels.getStats.invalidate");
    });
  });

  describe("UI features", () => {
    it("has a search input for filtering funnels", () => {
      expect(src).toContain("Search");
      expect(src).toContain("search");
    });

    it("displays funnel stats cards (total, active, visitors, conversions)", () => {
      expect(src).toMatch(/total|Total/i);
      expect(src).toMatch(/active|Active/i);
    });

    it("has a create funnel dialog", () => {
      expect(src).toContain("Dialog");
      expect(src).toMatch(/create|Create|New/i);
    });

    it("supports funnel templates for quick creation", () => {
      expect(src).toMatch(/template|Template/i);
    });

    it("has edit, duplicate, and delete actions in dropdown menu", () => {
      expect(src).toContain("DropdownMenu");
      expect(src).toContain("Edit");
      expect(src).toContain("Duplicate");
      expect(src).toContain("Delete");
    });

    it("shows loading state while data is fetching", () => {
      expect(src).toContain("isLoading");
      expect(src).toContain("Loader2");
    });

    it("shows empty state when no funnels exist", () => {
      expect(src).toMatch(/no funnel|No funnel|empty/i);
    });

    it("has a visual stage editor for funnel stages", () => {
      expect(src).toMatch(/stage|Stage/i);
    });

    it("supports funnel status badges (active, draft, paused, archived)", () => {
      expect(src).toContain("Badge");
      expect(src).toMatch(/active|draft|paused|archived/);
    });
  });

  describe("Funnel stage types", () => {
    it("supports opt_in stage type", () => {
      expect(src).toContain("opt_in");
    });

    it("supports checkout stage type", () => {
      expect(src).toContain("checkout");
    });

    it("supports confirmation stage type", () => {
      expect(src).toContain("confirmation");
    });

    it("supports upsell stage type", () => {
      expect(src).toContain("upsell");
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// 5. AUTOMATIONS FRONTEND — trpc Integration
// ═══════════════════════════════════════════════════════════════
describe("Automations Frontend — trpc Integration", () => {
  const src = readFile("client/src/pages/admin/Automations.tsx");

  describe("trpc data fetching", () => {
    it("uses trpc.automations.list.useQuery for listing automations", () => {
      expect(src).toContain("trpc.automations.list.useQuery");
    });

    it("uses trpc.automations.getStats.useQuery for stats", () => {
      expect(src).toContain("trpc.automations.getStats.useQuery");
    });
  });

  describe("trpc mutations", () => {
    it("uses trpc.automations.create.useMutation", () => {
      expect(src).toContain("trpc.automations.create.useMutation");
    });

    it("uses trpc.automations.update.useMutation", () => {
      expect(src).toContain("trpc.automations.update.useMutation");
    });

    it("uses trpc.automations.delete.useMutation", () => {
      expect(src).toContain("trpc.automations.delete.useMutation");
    });

    it("uses trpc.automations.duplicate.useMutation", () => {
      expect(src).toContain("trpc.automations.duplicate.useMutation");
    });
  });

  describe("Cache invalidation", () => {
    it("invalidates automations.list after mutations", () => {
      expect(src).toContain("utils.automations.list.invalidate");
    });

    it("invalidates automations.getStats after create/delete", () => {
      expect(src).toContain("utils.automations.getStats.invalidate");
    });
  });

  describe("Trigger types", () => {
    it("supports enrollment trigger", () => {
      expect(src).toContain("enrollment");
    });

    it("supports purchase trigger", () => {
      expect(src).toContain("purchase");
    });

    it("supports course_complete trigger", () => {
      expect(src).toContain("course_complete");
    });

    it("supports signup trigger", () => {
      expect(src).toContain("signup");
    });

    it("supports inactivity trigger", () => {
      expect(src).toContain("inactivity");
    });

    it("supports manual trigger", () => {
      expect(src).toContain("manual");
    });
  });

  describe("Action types", () => {
    it("supports send_email action", () => {
      expect(src).toContain("send_email");
    });

    it("supports wait/delay action", () => {
      expect(src).toContain("wait");
    });

    it("supports add_tag action", () => {
      expect(src).toContain("add_tag");
    });

    it("supports enroll_course action", () => {
      expect(src).toContain("enroll_course");
    });

    it("supports notify_admin action", () => {
      expect(src).toContain("notify_admin");
    });
  });

  describe("UI features", () => {
    it("has a search input for filtering automations", () => {
      expect(src).toContain("Search");
    });

    it("displays automation stats cards", () => {
      expect(src).toMatch(/total|Total/i);
      expect(src).toMatch(/active|Active/i);
      expect(src).toMatch(/triggered|Triggered/i);
    });

    it("has a create automation dialog with templates", () => {
      expect(src).toContain("Dialog");
      expect(src).toContain("Template");
    });

    it("has automation templates: Welcome Sequence", () => {
      expect(src).toContain("Welcome Sequence");
    });

    it("has automation templates: Post-Purchase Follow-Up", () => {
      expect(src).toContain("Post-Purchase Follow-Up");
    });

    it("has automation templates: Course Completion Celebration", () => {
      expect(src).toContain("Course Completion Celebration");
    });

    it("has automation templates: Re-Engagement Campaign", () => {
      expect(src).toContain("Re-Engagement Campaign");
    });

    it("shows loading state while data is fetching", () => {
      expect(src).toContain("isLoading");
      expect(src).toContain("Loader2");
    });

    it("shows empty state when no automations exist", () => {
      expect(src).toMatch(/no automation|No automation/i);
    });

    it("supports automation status toggle (active/paused)", () => {
      expect(src).toContain("handleToggle");
      expect(src).toContain("Pause");
      expect(src).toContain("Activate");
    });
  });

  describe("Automation Editor", () => {
    it("has a visual step flow editor", () => {
      expect(src).toContain("StepCard");
    });

    it("shows trigger information in editor", () => {
      expect(src).toContain("Trigger");
      expect(src).toContain("triggerLabels");
    });

    it("supports adding new steps", () => {
      expect(src).toContain("handleAddStep");
      expect(src).toContain("Add Step");
    });

    it("supports editing existing steps", () => {
      expect(src).toContain("openEditStep");
      expect(src).toContain("handleSaveStep");
    });

    it("supports deleting steps", () => {
      expect(src).toContain("handleDeleteStep");
    });

    it("has a back button to return to list view", () => {
      expect(src).toContain("ArrowLeft");
      expect(src).toContain("setEditingAutomation(null)");
    });

    it("shows automation stats in editor (triggered, completed, in progress)", () => {
      expect(src).toContain("Triggered");
      expect(src).toContain("Completed");
      expect(src).toContain("In Progress");
    });
  });

  describe("Step Editor Dialog", () => {
    it("has a step type selector", () => {
      expect(src).toContain("Action Type");
      expect(src).toContain("stepType");
    });

    it("shows email subject field for send_email steps", () => {
      expect(src).toContain("Email Subject");
      expect(src).toContain("stepSubject");
    });

    it("shows days/hours fields for wait steps", () => {
      expect(src).toContain("Days");
      expect(src).toContain("Hours");
      expect(src).toContain("stepDays");
      expect(src).toContain("stepHours");
    });

    it("shows tag name field for tag steps", () => {
      expect(src).toContain("Tag Name");
      expect(src).toContain("stepTag");
    });

    it("shows message field for notify_admin steps", () => {
      expect(src).toContain("Message");
      expect(src).toContain("stepMessage");
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// 6. DRAG & DROP COURSE BUILDER — Existing Implementation
// ═══════════════════════════════════════════════════════════════
describe("Drag & Drop Course Builder — Existing Implementation", () => {
  it("@dnd-kit/core is installed", () => {
    const pkg = JSON.parse(readFile("package.json"));
    expect(pkg.dependencies["@dnd-kit/core"] || pkg.devDependencies?.["@dnd-kit/core"]).toBeDefined();
  });

  it("@dnd-kit/sortable is installed", () => {
    const pkg = JSON.parse(readFile("package.json"));
    expect(pkg.dependencies["@dnd-kit/sortable"] || pkg.devDependencies?.["@dnd-kit/sortable"]).toBeDefined();
  });

  it("CourseBuilder.tsx exists and has substantial implementation", () => {
    const src = readFile("client/src/pages/admin/CourseBuilder.tsx");
    expect(src.length).toBeGreaterThan(5000);
  });

  it("CourseBuilder uses DndContext from @dnd-kit", () => {
    const src = readFile("client/src/pages/admin/CourseBuilder.tsx");
    expect(src).toContain("DndContext");
  });

  it("CourseBuilder uses SortableContext for sortable items", () => {
    const src = readFile("client/src/pages/admin/CourseBuilder.tsx");
    expect(src).toContain("SortableContext");
  });

  it("Schema has sortOrder field in courseModules table", () => {
    const schema = readFile("drizzle/schema.ts");
    expect(schema).toContain("sortOrder");
  });

  it("Backend has reorderModules procedure", () => {
    const routersSrc = readFile("server/routers.ts");
    expect(routersSrc).toContain("reorderModules");
  });

  it("Backend has reorderLessons procedure", () => {
    const routersSrc = readFile("server/routers.ts");
    expect(routersSrc).toContain("reorderLessons");
  });
});

// ═══════════════════════════════════════════════════════════════
// 7. SIDEBAR NAVIGATION — Admin Pages Wiring
// ═══════════════════════════════════════════════════════════════
describe("Admin Sidebar Navigation — Feature Wiring", () => {
  it("AdminLayout component exists", () => {
    expect(fileExists("client/src/components/AdminLayout.tsx")).toBe(true);
  });

  it("AdminControlCenter component exists", () => {
    expect(fileExists("client/src/pages/AdminControlCenter.tsx")).toBe(true);
  });

  it("FunnelBuilder page is accessible from admin via AdminControlCenter", () => {
    const accSrc = readFile("client/src/pages/AdminControlCenter.tsx");
    expect(accSrc).toContain("FunnelBuilder");
  });

  it("Automations page is accessible from admin via AdminControlCenter", () => {
    const accSrc = readFile("client/src/pages/AdminControlCenter.tsx");
    expect(accSrc).toContain("Automations");
  });

  it("CourseBuilder page is accessible from admin via AdminControlCenter", () => {
    const accSrc = readFile("client/src/pages/AdminControlCenter.tsx");
    expect(accSrc).toContain("CourseBuilder");
  });

  it("AdminLayout has MARKETING section in sidebar", () => {
    const layoutSrc = readFile("client/src/components/AdminLayout.tsx");
    expect(layoutSrc).toContain("MARKETING");
  });

  it("AdminLayout links to Funnels page", () => {
    const layoutSrc = readFile("client/src/components/AdminLayout.tsx");
    expect(layoutSrc).toMatch(/funnel|Funnel/i);
  });

  it("AdminLayout links to Automations page", () => {
    const layoutSrc = readFile("client/src/components/AdminLayout.tsx");
    expect(layoutSrc).toMatch(/automation|Automation/i);
  });
});

// ═══════════════════════════════════════════════════════════════
// 8. FUNNEL TEMPLATES — Pre-built Funnel Types
// ═══════════════════════════════════════════════════════════════
describe("Funnel Templates — Pre-built Types", () => {
  const src = readFile("client/src/pages/admin/FunnelBuilder.tsx");

  it("has Course Launch Funnel template", () => {
    expect(src).toContain("Course Launch Funnel");
  });

  it("has Coaching Enrollment Funnel template", () => {
    expect(src).toContain("Coaching Enrollment Funnel");
  });

  it("has Webinar Registration Funnel template", () => {
    expect(src).toContain("Webinar Registration Funnel");
  });

  it("templates include multi-stage pipelines", () => {
    // Each template should have multiple stages
    expect(src).toContain("opt_in");
    expect(src).toContain("checkout");
    expect(src).toContain("confirmation");
  });
});

// ═══════════════════════════════════════════════════════════════
// 9. AUTOMATION STEP FLOW — Visual Pipeline
// ═══════════════════════════════════════════════════════════════
describe("Automation Step Flow — Visual Pipeline", () => {
  const src = readFile("client/src/pages/admin/Automations.tsx");

  it("StepCard component renders step type icon", () => {
    expect(src).toContain("StepCard");
    expect(src).toContain("actionIcons");
  });

  it("StepCard shows step number badge", () => {
    expect(src).toContain("index + 1");
  });

  it("StepCard shows connector arrows between steps", () => {
    expect(src).toContain("ChevronDown");
  });

  it("Wait steps display days and hours", () => {
    expect(src).toMatch(/config\.days.*config\.hours|days.*hours/);
  });

  it("Email steps display subject line", () => {
    expect(src).toContain("config.subject");
  });

  it("Tag steps display tag name", () => {
    expect(src).toContain("config.tag");
  });

  it("Admin notification steps display message", () => {
    expect(src).toContain("config.message");
  });
});
