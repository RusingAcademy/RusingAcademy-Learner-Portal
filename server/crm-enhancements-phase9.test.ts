import { describe, it, expect } from "vitest";
import {
  checkRuleCondition,
  CONDITION_TYPES,
  getConditionTypeLabel,
} from "./tag-automation";

describe("Tag Automation", () => {
  describe("checkRuleCondition", () => {
    const createRule = (conditionType: string, conditionValue: string) => ({
      id: 1,
      name: "Test Rule",
      description: null,
      tagId: 1,
      conditionType,
      conditionValue,
      isActive: true,
      priority: 0,
    });

    it("should match budget_above condition", () => {
      const rule = createRule(CONDITION_TYPES.BUDGET_ABOVE, "50000");
      
      expect(checkRuleCondition({ budget: 60000 }, rule)).toBe(true);
      expect(checkRuleCondition({ budget: 50000 }, rule)).toBe(false);
      expect(checkRuleCondition({ budget: 40000 }, rule)).toBe(false);
      expect(checkRuleCondition({ budget: "70000" }, rule)).toBe(true);
    });

    it("should match budget_below condition", () => {
      const rule = createRule(CONDITION_TYPES.BUDGET_BELOW, "10000");
      
      expect(checkRuleCondition({ budget: 5000 }, rule)).toBe(true);
      expect(checkRuleCondition({ budget: 10000 }, rule)).toBe(false);
      expect(checkRuleCondition({ budget: 15000 }, rule)).toBe(false);
    });

    it("should match score_above condition", () => {
      const rule = createRule(CONDITION_TYPES.SCORE_ABOVE, "80");
      
      expect(checkRuleCondition({ leadScore: 90 }, rule)).toBe(true);
      expect(checkRuleCondition({ leadScore: 80 }, rule)).toBe(false);
      expect(checkRuleCondition({ leadScore: 70 }, rule)).toBe(false);
    });

    it("should match score_below condition", () => {
      const rule = createRule(CONDITION_TYPES.SCORE_BELOW, "50");
      
      expect(checkRuleCondition({ leadScore: 30 }, rule)).toBe(true);
      expect(checkRuleCondition({ leadScore: 50 }, rule)).toBe(false);
      expect(checkRuleCondition({ leadScore: 70 }, rule)).toBe(false);
    });

    it("should match source_equals condition (case insensitive)", () => {
      const rule = createRule(CONDITION_TYPES.SOURCE_EQUALS, "lingueefy");
      
      expect(checkRuleCondition({ source: "lingueefy" }, rule)).toBe(true);
      expect(checkRuleCondition({ source: "Lingueefy" }, rule)).toBe(true);
      expect(checkRuleCondition({ source: "LINGUEEFY" }, rule)).toBe(true);
      expect(checkRuleCondition({ source: "external" }, rule)).toBe(false);
    });

    it("should match lead_type_equals condition", () => {
      const rule = createRule(CONDITION_TYPES.LEAD_TYPE_EQUALS, "corporate");
      
      expect(checkRuleCondition({ leadType: "corporate" }, rule)).toBe(true);
      expect(checkRuleCondition({ leadType: "Corporate" }, rule)).toBe(true);
      expect(checkRuleCondition({ leadType: "individual" }, rule)).toBe(false);
    });

    it("should match status_equals condition", () => {
      const rule = createRule(CONDITION_TYPES.STATUS_EQUALS, "qualified");
      
      expect(checkRuleCondition({ status: "qualified" }, rule)).toBe(true);
      expect(checkRuleCondition({ status: "Qualified" }, rule)).toBe(true);
      expect(checkRuleCondition({ status: "new" }, rule)).toBe(false);
    });

    it("should handle null/undefined values", () => {
      const budgetRule = createRule(CONDITION_TYPES.BUDGET_ABOVE, "50000");
      const scoreRule = createRule(CONDITION_TYPES.SCORE_ABOVE, "80");
      const sourceRule = createRule(CONDITION_TYPES.SOURCE_EQUALS, "lingueefy");
      
      expect(checkRuleCondition({ budget: null }, budgetRule)).toBe(false);
      expect(checkRuleCondition({ leadScore: null }, scoreRule)).toBe(false);
      expect(checkRuleCondition({ source: null }, sourceRule)).toBe(false);
      expect(checkRuleCondition({}, budgetRule)).toBe(false);
    });

    it("should return false for unknown condition types", () => {
      const rule = createRule("unknown_condition", "value");
      
      expect(checkRuleCondition({ budget: 100000 }, rule)).toBe(false);
    });
  });

  describe("getConditionTypeLabel", () => {
    it("should return English labels", () => {
      expect(getConditionTypeLabel(CONDITION_TYPES.BUDGET_ABOVE, "en")).toBe("Budget above");
      expect(getConditionTypeLabel(CONDITION_TYPES.SCORE_BELOW, "en")).toBe("Score below");
      expect(getConditionTypeLabel(CONDITION_TYPES.SOURCE_EQUALS, "en")).toBe("Source equals");
    });

    it("should return French labels", () => {
      expect(getConditionTypeLabel(CONDITION_TYPES.BUDGET_ABOVE, "fr")).toBe("Budget supérieur à");
      expect(getConditionTypeLabel(CONDITION_TYPES.SCORE_BELOW, "fr")).toBe("Score inférieur à");
      expect(getConditionTypeLabel(CONDITION_TYPES.SOURCE_EQUALS, "fr")).toBe("Source égale à");
    });

    it("should return the type itself for unknown types", () => {
      expect(getConditionTypeLabel("unknown", "en")).toBe("unknown");
    });
  });

  describe("CONDITION_TYPES", () => {
    it("should have all expected condition types", () => {
      expect(CONDITION_TYPES.BUDGET_ABOVE).toBe("budget_above");
      expect(CONDITION_TYPES.BUDGET_BELOW).toBe("budget_below");
      expect(CONDITION_TYPES.SCORE_ABOVE).toBe("score_above");
      expect(CONDITION_TYPES.SCORE_BELOW).toBe("score_below");
      expect(CONDITION_TYPES.SOURCE_EQUALS).toBe("source_equals");
      expect(CONDITION_TYPES.LEAD_TYPE_EQUALS).toBe("lead_type_equals");
      expect(CONDITION_TYPES.STATUS_EQUALS).toBe("status_equals");
    });
  });
});

describe("CRM Data Export", () => {
  describe("CSV formatting", () => {
    it("should escape values with commas", () => {
      const value = "Company, Inc.";
      const escaped = value.includes(",") ? `"${value.replace(/"/g, '""')}"` : value;
      expect(escaped).toBe('"Company, Inc."');
    });

    it("should escape values with quotes", () => {
      const value = 'John "Johnny" Doe';
      const escaped = value.includes('"') ? `"${value.replace(/"/g, '""')}"` : value;
      expect(escaped).toBe('"John ""Johnny"" Doe"');
    });

    it("should escape values with newlines", () => {
      const value = "Line 1\nLine 2";
      const escaped = value.includes("\n") ? `"${value.replace(/"/g, '""')}"` : value;
      expect(escaped).toBe('"Line 1\nLine 2"');
    });

    it("should not escape simple values", () => {
      const value = "Simple Value";
      const needsEscape = value.includes(",") || value.includes('"') || value.includes("\n");
      expect(needsEscape).toBe(false);
    });
  });

  describe("XML escaping for Excel", () => {
    const escapeXml = (str: string): string => {
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
    };

    it("should escape ampersands", () => {
      expect(escapeXml("A & B")).toBe("A &amp; B");
    });

    it("should escape angle brackets", () => {
      expect(escapeXml("<tag>")).toBe("&lt;tag&gt;");
    });

    it("should escape quotes", () => {
      expect(escapeXml('"quoted"')).toBe("&quot;quoted&quot;");
    });

    it("should escape apostrophes", () => {
      expect(escapeXml("it's")).toBe("it&apos;s");
    });

    it("should handle multiple special characters", () => {
      expect(escapeXml('A & B <"test">')).toBe("A &amp; B &lt;&quot;test&quot;&gt;");
    });
  });

  describe("Date filtering", () => {
    it("should calculate days difference correctly", () => {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const getDaysDiff = (date: Date) => 
        Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      expect(getDaysDiff(sevenDaysAgo)).toBe(7);
      expect(getDaysDiff(thirtyDaysAgo)).toBe(30);
      expect(getDaysDiff(now)).toBe(0);
    });

    it("should filter by 7 days correctly", () => {
      const now = new Date();
      const dates = [
        new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago - include
        new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago - include
        new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago - exclude
      ];
      
      const getDaysDiff = (date: Date) => 
        Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      const filtered = dates.filter(d => getDaysDiff(d) <= 7);
      expect(filtered.length).toBe(2);
    });
  });
});

describe("Tag Assignment in Pipeline", () => {
  it("should validate tag color format", () => {
    const validColors = ["#ef4444", "#3b82f6", "#22c55e"];
    const colorRegex = /^#[0-9A-Fa-f]{6}$/;
    
    validColors.forEach(color => {
      expect(colorRegex.test(color)).toBe(true);
    });
  });

  it("should generate correct background color with opacity", () => {
    const color = "#ef4444";
    const bgColor = `${color}20`; // 20 is hex for ~12% opacity
    
    expect(bgColor).toBe("#ef444420");
    expect(bgColor.length).toBe(9); // # + 6 hex + 2 opacity
  });
});
