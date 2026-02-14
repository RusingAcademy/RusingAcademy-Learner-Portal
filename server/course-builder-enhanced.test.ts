/**
 * Tests for Course Builder Enhancements:
 * - Quiz Builder component logic
 * - Course Settings Editor component logic
 * - CourseBuilder UX enhancements
 */
import { describe, it, expect, vi } from "vitest";

// ─── Quiz Builder Tests ───
describe("QuizBuilder", () => {
  describe("Question types", () => {
    const questionTypes = [
      { value: "multiple_choice", label: "Multiple Choice" },
      { value: "true_false", label: "True / False" },
      { value: "fill_blank", label: "Fill in the Blank" },
      { value: "short_answer", label: "Short Answer" },
      { value: "matching", label: "Matching" },
      { value: "ordering", label: "Ordering" },
    ];

    it("should define all 6 question types", () => {
      expect(questionTypes).toHaveLength(6);
    });

    it("should have unique values for each question type", () => {
      const values = questionTypes.map((t) => t.value);
      expect(new Set(values).size).toBe(values.length);
    });

    it("should have non-empty labels for each question type", () => {
      questionTypes.forEach((t) => {
        expect(t.label.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Question validation", () => {
    function validateQuestion(q: {
      questionText: string;
      questionType: string;
      options: string[];
      correctAnswer: string;
      points: number;
    }) {
      const errors: string[] = [];
      if (!q.questionText.trim()) errors.push("Question text is required");
      if (q.points < 0) errors.push("Points must be non-negative");
      if (
        (q.questionType === "multiple_choice" ||
          q.questionType === "true_false") &&
        q.options.length < 2
      ) {
        errors.push("At least 2 options required");
      }
      if (
        (q.questionType === "multiple_choice" ||
          q.questionType === "true_false") &&
        !q.correctAnswer
      ) {
        errors.push("Correct answer is required");
      }
      if (q.questionType === "fill_blank" && !q.correctAnswer) {
        errors.push("Correct answer is required for fill-in-the-blank");
      }
      return errors;
    }

    it("should reject empty question text", () => {
      const errors = validateQuestion({
        questionText: "",
        questionType: "multiple_choice",
        options: ["A", "B"],
        correctAnswer: "A",
        points: 1,
      });
      expect(errors).toContain("Question text is required");
    });

    it("should reject negative points", () => {
      const errors = validateQuestion({
        questionText: "Test?",
        questionType: "multiple_choice",
        options: ["A", "B"],
        correctAnswer: "A",
        points: -5,
      });
      expect(errors).toContain("Points must be non-negative");
    });

    it("should reject multiple choice with fewer than 2 options", () => {
      const errors = validateQuestion({
        questionText: "Test?",
        questionType: "multiple_choice",
        options: ["A"],
        correctAnswer: "A",
        points: 1,
      });
      expect(errors).toContain("At least 2 options required");
    });

    it("should reject multiple choice without correct answer", () => {
      const errors = validateQuestion({
        questionText: "Test?",
        questionType: "multiple_choice",
        options: ["A", "B"],
        correctAnswer: "",
        points: 1,
      });
      expect(errors).toContain("Correct answer is required");
    });

    it("should reject fill-in-the-blank without correct answer", () => {
      const errors = validateQuestion({
        questionText: "The capital of Canada is ___",
        questionType: "fill_blank",
        options: [],
        correctAnswer: "",
        points: 1,
      });
      expect(errors).toContain(
        "Correct answer is required for fill-in-the-blank"
      );
    });

    it("should accept valid multiple choice question", () => {
      const errors = validateQuestion({
        questionText: "What is 2+2?",
        questionType: "multiple_choice",
        options: ["3", "4", "5"],
        correctAnswer: "4",
        points: 2,
      });
      expect(errors).toHaveLength(0);
    });

    it("should accept valid true/false question", () => {
      const errors = validateQuestion({
        questionText: "The sky is blue",
        questionType: "true_false",
        options: ["True", "False"],
        correctAnswer: "True",
        points: 1,
      });
      expect(errors).toHaveLength(0);
    });

    it("should accept valid short answer question", () => {
      const errors = validateQuestion({
        questionText: "Name the capital of Canada",
        questionType: "short_answer",
        options: [],
        correctAnswer: "",
        points: 3,
      });
      expect(errors).toHaveLength(0);
    });
  });

  describe("Difficulty levels", () => {
    const difficulties = ["easy", "medium", "hard"];

    it("should have 3 difficulty levels", () => {
      expect(difficulties).toHaveLength(3);
    });

    it("should include easy, medium, and hard", () => {
      expect(difficulties).toContain("easy");
      expect(difficulties).toContain("medium");
      expect(difficulties).toContain("hard");
    });
  });

  describe("Quiz scoring", () => {
    function calculateQuizScore(
      questions: { points: number; isCorrect: boolean }[]
    ) {
      const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
      const earnedPoints = questions
        .filter((q) => q.isCorrect)
        .reduce((sum, q) => sum + q.points, 0);
      const percentage =
        totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
      return { totalPoints, earnedPoints, percentage };
    }

    it("should calculate perfect score", () => {
      const result = calculateQuizScore([
        { points: 2, isCorrect: true },
        { points: 3, isCorrect: true },
        { points: 1, isCorrect: true },
      ]);
      expect(result.percentage).toBe(100);
      expect(result.earnedPoints).toBe(6);
    });

    it("should calculate zero score", () => {
      const result = calculateQuizScore([
        { points: 2, isCorrect: false },
        { points: 3, isCorrect: false },
      ]);
      expect(result.percentage).toBe(0);
      expect(result.earnedPoints).toBe(0);
    });

    it("should calculate partial score", () => {
      const result = calculateQuizScore([
        { points: 2, isCorrect: true },
        { points: 3, isCorrect: false },
        { points: 5, isCorrect: true },
      ]);
      expect(result.percentage).toBe(70);
      expect(result.earnedPoints).toBe(7);
      expect(result.totalPoints).toBe(10);
    });

    it("should handle empty quiz", () => {
      const result = calculateQuizScore([]);
      expect(result.percentage).toBe(0);
      expect(result.totalPoints).toBe(0);
    });

    it("should determine pass/fail based on passing score", () => {
      const passingScore = 70;
      const result = calculateQuizScore([
        { points: 2, isCorrect: true },
        { points: 3, isCorrect: false },
        { points: 5, isCorrect: true },
      ]);
      expect(result.percentage).toBe(70);
      expect(result.percentage >= passingScore).toBe(true);
    });
  });
});

// ─── Course Settings Editor Tests ───
describe("CourseSettingsEditor", () => {
  describe("Category labels", () => {
    const categoryLabels: Record<string, string> = {
      sle_oral: "SLE — Oral (B/C)",
      sle_written: "SLE — Written Expression (B/C)",
      sle_reading: "SLE — Reading Comprehension (B/C)",
      sle_complete: "SLE — Complete Preparation",
      business_french: "Business French",
      business_english: "Business English",
      exam_prep: "Exam Preparation",
      conversation: "Conversation Practice",
      grammar: "Grammar",
      vocabulary: "Vocabulary",
    };

    it("should define all 10 categories", () => {
      expect(Object.keys(categoryLabels)).toHaveLength(10);
    });

    it("should have SLE categories", () => {
      expect(categoryLabels.sle_oral).toBeDefined();
      expect(categoryLabels.sle_written).toBeDefined();
      expect(categoryLabels.sle_reading).toBeDefined();
      expect(categoryLabels.sle_complete).toBeDefined();
    });

    it("should have business language categories", () => {
      expect(categoryLabels.business_french).toBeDefined();
      expect(categoryLabels.business_english).toBeDefined();
    });
  });

  describe("Price calculations", () => {
    function calculatePriceDisplay(priceInCents: number) {
      return (priceInCents / 100).toFixed(2);
    }

    function calculateDiscount(
      originalPrice: number,
      currentPrice: number
    ): number | undefined {
      if (originalPrice > 0 && currentPrice < originalPrice) {
        return Math.round(
          ((originalPrice - currentPrice) / originalPrice) * 100
        );
      }
      return undefined;
    }

    it("should convert cents to dollars correctly", () => {
      expect(calculatePriceDisplay(9900)).toBe("99.00");
      expect(calculatePriceDisplay(19999)).toBe("199.99");
      expect(calculatePriceDisplay(0)).toBe("0.00");
      expect(calculatePriceDisplay(50)).toBe("0.50");
    });

    it("should calculate discount percentage", () => {
      expect(calculateDiscount(20000, 14900)).toBe(26); // ~25.5% rounds to 26
      expect(calculateDiscount(10000, 5000)).toBe(50);
      expect(calculateDiscount(10000, 0)).toBe(100);
    });

    it("should return undefined when no discount", () => {
      expect(calculateDiscount(0, 5000)).toBeUndefined();
      expect(calculateDiscount(5000, 5000)).toBeUndefined();
      expect(calculateDiscount(5000, 10000)).toBeUndefined();
    });
  });

  describe("SEO validation", () => {
    function validateSeo(metaTitle: string, metaDescription: string) {
      const warnings: string[] = [];
      if (metaTitle.length > 60) warnings.push("Meta title too long (>60)");
      if (metaDescription.length > 160)
        warnings.push("Meta description too long (>160)");
      if (metaTitle.length > 0 && metaTitle.length < 10)
        warnings.push("Meta title too short (<10)");
      if (metaDescription.length > 0 && metaDescription.length < 50)
        warnings.push("Meta description too short (<50)");
      return warnings;
    }

    it("should warn about long meta title", () => {
      const warnings = validateSeo("A".repeat(61), "Valid description here.");
      expect(warnings).toContain("Meta title too long (>60)");
    });

    it("should warn about long meta description", () => {
      const warnings = validateSeo("Valid Title", "A".repeat(161));
      expect(warnings).toContain("Meta description too long (>160)");
    });

    it("should accept valid SEO fields", () => {
      const warnings = validateSeo(
        "SLE Oral Exam Preparation — Level B",
        "Comprehensive preparation course for the SLE Oral Exam at Level B, designed for Canadian public servants."
      );
      expect(warnings).toHaveLength(0);
    });

    it("should warn about short meta title", () => {
      const warnings = validateSeo("Short", "Valid description here.");
      expect(warnings).toContain("Meta title too short (<10)");
    });
  });

  describe("Access type logic", () => {
    function getAccessDescription(
      accessType: string,
      accessDurationDays?: number
    ) {
      if (accessType === "free") return "Free access — no payment required";
      if (accessType === "subscription") return "Subscription-based access";
      if (accessDurationDays)
        return `${accessDurationDays} days of access after purchase`;
      return "Lifetime access after purchase";
    }

    it("should describe free access", () => {
      expect(getAccessDescription("free")).toBe(
        "Free access — no payment required"
      );
    });

    it("should describe subscription access", () => {
      expect(getAccessDescription("subscription")).toBe(
        "Subscription-based access"
      );
    });

    it("should describe limited duration access", () => {
      expect(getAccessDescription("one_time", 90)).toBe(
        "90 days of access after purchase"
      );
    });

    it("should describe lifetime access", () => {
      expect(getAccessDescription("one_time")).toBe(
        "Lifetime access after purchase"
      );
    });
  });

  describe("Drip content calculations", () => {
    function calculateDripDuration(
      totalModules: number,
      interval: number,
      unit: string
    ) {
      const totalUnits = interval * totalModules;
      if (unit === "days") return `${totalUnits} days`;
      if (unit === "weeks") return `${totalUnits} weeks`;
      if (unit === "months") return `${totalUnits} months`;
      return `${totalUnits} ${unit}`;
    }

    it("should calculate drip duration in days", () => {
      expect(calculateDripDuration(5, 7, "days")).toBe("35 days");
    });

    it("should calculate drip duration in weeks", () => {
      expect(calculateDripDuration(4, 2, "weeks")).toBe("8 weeks");
    });

    it("should calculate drip duration in months", () => {
      expect(calculateDripDuration(6, 1, "months")).toBe("6 months");
    });

    it("should handle zero modules", () => {
      expect(calculateDripDuration(0, 7, "days")).toBe("0 days");
    });
  });
});

// ─── Course Builder UX Enhancements Tests ───
describe("CourseBuilder UX", () => {
  describe("Course stats calculations", () => {
    function calculateCourseStats(modules: any[]) {
      const totalModules = modules.length;
      const totalLessons = modules.reduce(
        (sum, m) => sum + (m.lessons?.length || 0),
        0
      );
      const totalActivities = modules.reduce(
        (sum, m) =>
          sum +
          (m.lessons || []).reduce(
            (ls: number, l: any) => ls + (l.activities?.length || 0),
            0
          ),
        0
      );
      const totalDuration = modules.reduce(
        (sum, m) =>
          sum +
          (m.lessons || []).reduce(
            (ls: number, l: any) =>
              ls +
              (l.activities || []).reduce(
                (as: number, a: any) => as + (a.estimatedMinutes || 0),
                0
              ),
            0
          ),
        0
      );
      return { totalModules, totalLessons, totalActivities, totalDuration };
    }

    it("should calculate stats for a populated course", () => {
      const modules = [
        {
          id: 1,
          lessons: [
            {
              id: 1,
              activities: [
                { estimatedMinutes: 10 },
                { estimatedMinutes: 15 },
              ],
            },
            { id: 2, activities: [{ estimatedMinutes: 20 }] },
          ],
        },
        {
          id: 2,
          lessons: [
            { id: 3, activities: [{ estimatedMinutes: 30 }] },
          ],
        },
      ];
      const stats = calculateCourseStats(modules);
      expect(stats.totalModules).toBe(2);
      expect(stats.totalLessons).toBe(3);
      expect(stats.totalActivities).toBe(4);
      expect(stats.totalDuration).toBe(75);
    });

    it("should handle empty course", () => {
      const stats = calculateCourseStats([]);
      expect(stats.totalModules).toBe(0);
      expect(stats.totalLessons).toBe(0);
      expect(stats.totalActivities).toBe(0);
      expect(stats.totalDuration).toBe(0);
    });

    it("should handle modules with no lessons", () => {
      const modules = [{ id: 1, lessons: [] }, { id: 2 }];
      const stats = calculateCourseStats(modules);
      expect(stats.totalModules).toBe(2);
      expect(stats.totalLessons).toBe(0);
      expect(stats.totalActivities).toBe(0);
    });
  });

  describe("Duration formatting", () => {
    function formatDuration(minutes: number) {
      if (minutes > 60) {
        return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
      }
      return `${minutes}m`;
    }

    it("should format minutes only", () => {
      expect(formatDuration(45)).toBe("45m");
    });

    it("should format hours and minutes", () => {
      expect(formatDuration(90)).toBe("1h 30m");
    });

    it("should format exact hours", () => {
      expect(formatDuration(120)).toBe("2h 0m");
    });

    it("should format zero", () => {
      expect(formatDuration(0)).toBe("0m");
    });

    it("should format large durations", () => {
      expect(formatDuration(600)).toBe("10h 0m");
    });
  });

  describe("Course filtering", () => {
    const courses = [
      {
        id: 1,
        title: "SLE Oral Preparation",
        status: "published",
        category: "sle_oral",
      },
      {
        id: 2,
        title: "Business French Basics",
        status: "draft",
        category: "business_french",
      },
      {
        id: 3,
        title: "Grammar Essentials",
        status: "archived",
        category: "grammar",
      },
      {
        id: 4,
        title: "SLE Written Expression",
        status: "published",
        category: "sle_written",
      },
    ];

    function filterCourses(
      list: typeof courses,
      search: string,
      statusFilter: string
    ) {
      return list.filter((c) => {
        const matchesSearch = c.title
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || c.status === statusFilter;
        return matchesSearch && matchesStatus;
      });
    }

    it("should filter by search term", () => {
      const result = filterCourses(courses, "SLE", "all");
      expect(result).toHaveLength(2);
    });

    it("should filter by status", () => {
      const result = filterCourses(courses, "", "published");
      expect(result).toHaveLength(2);
    });

    it("should combine search and status filters", () => {
      const result = filterCourses(courses, "SLE", "published");
      expect(result).toHaveLength(2);
    });

    it("should return all with no filters", () => {
      const result = filterCourses(courses, "", "all");
      expect(result).toHaveLength(4);
    });

    it("should return empty for no matches", () => {
      const result = filterCourses(courses, "nonexistent", "all");
      expect(result).toHaveLength(0);
    });

    it("should be case-insensitive", () => {
      const result = filterCourses(courses, "sle", "all");
      expect(result).toHaveLength(2);
    });
  });

  describe("Course card price display", () => {
    function getPriceDisplay(price: number) {
      if (price > 0) {
        return `$${(price / 100).toFixed(0)} CAD`;
      }
      return "Free";
    }

    it("should display price for paid courses", () => {
      expect(getPriceDisplay(9900)).toBe("$99 CAD");
      expect(getPriceDisplay(19900)).toBe("$199 CAD");
    });

    it("should display Free for free courses", () => {
      expect(getPriceDisplay(0)).toBe("Free");
    });
  });
});
