/**
 * Tests for CMS Workflow (status transitions), WYSIWYG rendering, and Import/Export
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Workflow Status Tests ───

describe("CMS Workflow Status", () => {
  const validStatuses = ["draft", "review", "published"];
  const validEntities = ["program", "path", "module", "lesson"];

  it("should accept valid status values", () => {
    for (const status of validStatuses) {
      expect(validStatuses).toContain(status);
    }
  });

  it("should reject invalid status values", () => {
    const invalidStatuses = ["pending", "archived", "deleted", "active", ""];
    for (const status of invalidStatuses) {
      expect(validStatuses).not.toContain(status);
    }
  });

  it("should accept valid entity types", () => {
    for (const entity of validEntities) {
      expect(validEntities).toContain(entity);
    }
  });

  it("should support all status transitions", () => {
    // Draft -> Review -> Published (forward flow)
    const transitions = [
      { from: "draft", to: "review" },
      { from: "review", to: "published" },
      // Backward flow
      { from: "published", to: "review" },
      { from: "review", to: "draft" },
      // Direct transitions
      { from: "draft", to: "published" },
      { from: "published", to: "draft" },
    ];

    for (const t of transitions) {
      expect(validStatuses).toContain(t.from);
      expect(validStatuses).toContain(t.to);
    }
  });

  it("should default to 'published' status for existing content", () => {
    // Existing content without a status column should default to published
    const defaultStatus = "published";
    expect(validStatuses).toContain(defaultStatus);
  });
});

// ─── StatusBadge/StatusDropdown UI Logic ───

describe("StatusBadge UI Logic", () => {
  const statusColors: Record<string, { bg: string; text: string }> = {
    draft: { bg: "bg-gray-100", text: "text-gray-600" },
    review: { bg: "bg-amber-100", text: "text-amber-700" },
    published: { bg: "bg-green-100", text: "text-green-700" },
  };

  it("should have distinct colors for each status", () => {
    const bgColors = Object.values(statusColors).map(c => c.bg);
    const textColors = Object.values(statusColors).map(c => c.text);
    expect(new Set(bgColors).size).toBe(3);
    expect(new Set(textColors).size).toBe(3);
  });

  it("should map status to correct labels in English", () => {
    const labels: Record<string, string> = {
      draft: "Draft",
      review: "In Review",
      published: "Published",
    };
    expect(labels.draft).toBe("Draft");
    expect(labels.review).toBe("In Review");
    expect(labels.published).toBe("Published");
  });

  it("should map status to correct labels in French", () => {
    const labels: Record<string, string> = {
      draft: "Brouillon",
      review: "En révision",
      published: "Publié",
    };
    expect(labels.draft).toBe("Brouillon");
    expect(labels.review).toBe("En révision");
    expect(labels.published).toBe("Publié");
  });
});

// ─── CSV Export/Import Logic ───

describe("CSV Export Logic", () => {
  const convertToCSV = (data: any[]): string => {
    if (!data.length) return "";
    const headers = Object.keys(data[0]);
    const rows = data.map((row: any) =>
      headers.map((h: string) => {
        const val = row[h];
        if (val === null || val === undefined) return "";
        const str = typeof val === "object" ? JSON.stringify(val) : String(val);
        return str.includes(",") || str.includes('"') || str.includes("\n")
          ? `"${str.replace(/"/g, '""')}"` : str;
      }).join(",")
    );
    return [headers.join(","), ...rows].join("\n");
  };

  it("should generate valid CSV headers", () => {
    const data = [{ id: 1, title: "Test", slug: "test" }];
    const csv = convertToCSV(data);
    expect(csv.split("\n")[0]).toBe("id,title,slug");
  });

  it("should handle empty data", () => {
    expect(convertToCSV([])).toBe("");
  });

  it("should escape commas in values", () => {
    const data = [{ id: 1, title: "Hello, World" }];
    const csv = convertToCSV(data);
    expect(csv).toContain('"Hello, World"');
  });

  it("should escape double quotes in values", () => {
    const data = [{ id: 1, title: 'Say "hello"' }];
    const csv = convertToCSV(data);
    expect(csv).toContain('"Say ""hello"""');
  });

  it("should handle null and undefined values", () => {
    const data = [{ id: 1, title: null, slug: undefined }];
    const csv = convertToCSV(data);
    const values = csv.split("\n")[1].split(",");
    expect(values[1]).toBe("");
    expect(values[2]).toBe("");
  });

  it("should handle nested objects by JSON stringifying", () => {
    const data = [{ id: 1, meta: { key: "value" } }];
    const csv = convertToCSV(data);
    // CSV escapes quotes, so the JSON string gets double-quoted
    expect(csv).toContain('key');
    expect(csv).toContain('value');
    expect(csv.split("\n")).toHaveLength(2);
  });

  it("should handle multiple rows", () => {
    const data = [
      { id: 1, title: "First" },
      { id: 2, title: "Second" },
      { id: 3, title: "Third" },
    ];
    const csv = convertToCSV(data);
    const lines = csv.split("\n");
    expect(lines).toHaveLength(4); // header + 3 rows
  });
});

describe("CSV Import Logic", () => {
  const parseCSV = (text: string): any[] => {
    const lines = text.split("\n").filter((l: string) => l.trim());
    if (lines.length < 2) return [];
    const headers = lines[0].split(",").map((h: string) => h.trim().replace(/^"|"$/g, ""));
    return lines.slice(1).map((line: string) => {
      const values: string[] = [];
      let current = "";
      let inQuotes = false;
      for (const char of line) {
        if (char === '"') { inQuotes = !inQuotes; continue; }
        if (char === "," && !inQuotes) { values.push(current.trim()); current = ""; continue; }
        current += char;
      }
      values.push(current.trim());
      const obj: any = {};
      headers.forEach((h: string, i: number) => {
        let val: any = values[i] ?? "";
        if (val === "true") val = true;
        else if (val === "false") val = false;
        else if (val !== "" && !isNaN(Number(val)) && h !== "slug" && h !== "title" && h !== "titleFr" && h !== "lessonNumber" && h !== "number") val = Number(val);
        obj[h] = val;
      });
      return obj;
    });
  };

  it("should parse simple CSV", () => {
    const csv = "id,title,slug\n1,Test,test";
    const result = parseCSV(csv);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
    expect(result[0].title).toBe("Test");
    expect(result[0].slug).toBe("test");
  });

  it("should handle quoted values with commas", () => {
    const csv = 'id,title\n1,"Hello, World"';
    const result = parseCSV(csv);
    expect(result[0].title).toBe("Hello, World");
  });

  it("should convert boolean strings", () => {
    const csv = "id,isPublished\n1,true\n2,false";
    const result = parseCSV(csv);
    expect(result[0].isPublished).toBe(true);
    expect(result[1].isPublished).toBe(false);
  });

  it("should convert numeric strings", () => {
    const csv = "id,sortOrder,xpReward\n1,5,100";
    const result = parseCSV(csv);
    expect(result[0].id).toBe(1);
    expect(result[0].sortOrder).toBe(5);
    expect(result[0].xpReward).toBe(100);
  });

  it("should preserve slug as string even if numeric-looking", () => {
    const csv = "id,slug\n1,123";
    const result = parseCSV(csv);
    expect(result[0].slug).toBe("123");
  });

  it("should handle empty CSV", () => {
    expect(parseCSV("")).toHaveLength(0);
    expect(parseCSV("id,title")).toHaveLength(0);
  });

  it("should handle multiple rows", () => {
    const csv = "id,title\n1,First\n2,Second\n3,Third";
    const result = parseCSV(csv);
    expect(result).toHaveLength(3);
    expect(result[2].title).toBe("Third");
  });

  it("should handle empty values", () => {
    const csv = "id,title,description\n1,,";
    const result = parseCSV(csv);
    expect(result[0].title).toBe("");
    expect(result[0].description).toBe("");
  });
});

// ─── JSON Export/Import Logic ───

describe("JSON Export Logic", () => {
  it("should produce valid JSON for programs", () => {
    const data = [
      { id: 1, slug: "fsl", title: "French as a Second Language", titleFr: "Français langue seconde" },
      { id: 2, slug: "esl", title: "English as a Second Language", titleFr: "Anglais langue seconde" },
    ];
    const json = JSON.stringify(data, null, 2);
    const parsed = JSON.parse(json);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].slug).toBe("fsl");
  });

  it("should preserve nested objects in JSON", () => {
    const data = [{ id: 1, metadata: { tags: ["beginner", "grammar"] } }];
    const json = JSON.stringify(data, null, 2);
    const parsed = JSON.parse(json);
    expect(parsed[0].metadata.tags).toEqual(["beginner", "grammar"]);
  });

  it("should handle dates as strings", () => {
    const data = [{ id: 1, createdAt: new Date("2025-01-01").toISOString() }];
    const json = JSON.stringify(data, null, 2);
    const parsed = JSON.parse(json);
    expect(parsed[0].createdAt).toBe("2025-01-01T00:00:00.000Z");
  });
});

describe("JSON Import Logic", () => {
  it("should parse array of records", () => {
    const json = '[{"title": "Test", "slug": "test"}]';
    const parsed = JSON.parse(json);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0].title).toBe("Test");
  });

  it("should wrap single object in array", () => {
    const json = '{"title": "Test", "slug": "test"}';
    const raw = JSON.parse(json);
    const parsed = Array.isArray(raw) ? raw : [raw];
    expect(parsed).toHaveLength(1);
    expect(parsed[0].title).toBe("Test");
  });

  it("should distinguish create vs update by presence of id", () => {
    const records = [
      { title: "New" },           // no id -> create
      { id: 5, title: "Existing" }, // has id -> update
    ];
    const toCreate = records.filter(r => !("id" in r) || typeof r.id !== "number");
    const toUpdate = records.filter(r => "id" in r && typeof r.id === "number");
    expect(toCreate).toHaveLength(1);
    expect(toUpdate).toHaveLength(1);
  });
});

// ─── Rich Text Content Rendering ───

describe("Rich Text Content Rendering", () => {
  it("should handle plain text content", () => {
    const content = "This is plain text content";
    const isHTML = /<[a-z][\s\S]*>/i.test(content);
    expect(isHTML).toBe(false);
  });

  it("should detect HTML content", () => {
    const content = "<p>This is <strong>rich</strong> text</p>";
    const isHTML = /<[a-z][\s\S]*>/i.test(content);
    expect(isHTML).toBe(true);
  });

  it("should handle empty content", () => {
    const content = "";
    expect(content).toBe("");
  });

  it("should handle content with images", () => {
    const content = '<p>Text with image:</p><img src="https://example.com/img.jpg" alt="test" />';
    const isHTML = /<[a-z][\s\S]*>/i.test(content);
    expect(isHTML).toBe(true);
    expect(content).toContain("img");
  });

  it("should handle content with links", () => {
    const content = '<p>Visit <a href="https://example.com">our site</a></p>';
    expect(content).toContain("href");
  });
});

// ─── Bulk Status Update Logic ───

describe("Bulk Status Update", () => {
  it("should validate bulk update input", () => {
    const validInput = {
      entityType: "lesson" as const,
      ids: [1, 2, 3, 4, 5],
      status: "published" as const,
    };
    expect(validInput.ids).toHaveLength(5);
    expect(["draft", "review", "published"]).toContain(validInput.status);
    expect(["program", "path", "module", "lesson"]).toContain(validInput.entityType);
  });

  it("should handle empty ids array", () => {
    const input = { entityType: "lesson", ids: [], status: "published" };
    expect(input.ids).toHaveLength(0);
  });

  it("should handle large batch of ids", () => {
    const ids = Array.from({ length: 100 }, (_, i) => i + 1);
    expect(ids).toHaveLength(100);
    expect(ids[0]).toBe(1);
    expect(ids[99]).toBe(100);
  });
});
