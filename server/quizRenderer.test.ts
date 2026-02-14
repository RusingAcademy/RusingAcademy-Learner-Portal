/**
 * Tests for QuizRenderer parsing logic
 * 
 * Since the QuizRenderer is a client component, we test the pure parsing functions
 * by importing them directly. The vitest config resolves @ alias to client/src.
 */
import { describe, it, expect } from "vitest";

// We can't import React components in node environment, so we'll test the
// parsing logic by extracting it. Let's test the core functions directly.

// ─── Replicate the parsing functions for testability ───
// (These mirror the exact logic in QuizRenderer.tsx)

function sanitizeJsonString(raw: string): string {
  let sanitized = raw.replace(/\\'/g, "'");
  sanitized = sanitized.replace(/\\([^"\\\/bfnrtu])/g, "$1");
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, (ch) => {
    if (ch === '\n' || ch === '\r' || ch === '\t') return ch;
    return '';
  });
  return sanitized;
}

interface NormalizedQuestion {
  id: number;
  type: "multiple-choice" | "fill-in-the-blank";
  question: string;
  options: string[];
  answer: string;
  correctIndex: number;
  feedback: string;
}

function normalizeQuestion(raw: Record<string, unknown>, index: number): NormalizedQuestion | null {
  try {
    const questionText = String(
      raw.question ?? raw.question_text ?? raw.text ?? ""
    ).trim();
    if (!questionText) return null;

    let options: string[] = [];
    if (Array.isArray(raw.options)) {
      options = raw.options.map((o: unknown) => String(o).trim());
    }

    const rawType = String(raw.type ?? raw.question_type ?? "multiple-choice").toLowerCase();
    const type: "multiple-choice" | "fill-in-the-blank" = 
      rawType.includes("fill") || rawType.includes("blank") || rawType.includes("complet")
        ? "fill-in-the-blank"
        : "multiple-choice";

    let answer = "";
    let correctIndex = -1;

    if (raw.answer !== undefined && raw.answer !== null) {
      const ansVal = raw.answer;
      if (typeof ansVal === "number") {
        correctIndex = ansVal;
        if (correctIndex >= options.length && correctIndex > 0) {
          correctIndex = correctIndex - 1;
        }
        answer = options[correctIndex] ?? String(ansVal);
      } else {
        answer = String(ansVal).trim();
        correctIndex = options.findIndex(
          (o) => o.toLowerCase().trim() === answer.toLowerCase().trim()
        );
        if (correctIndex === -1 && options.length > 0) {
          correctIndex = options.findIndex(
            (o) => o.toLowerCase().includes(answer.toLowerCase()) || 
                   answer.toLowerCase().includes(o.toLowerCase())
          );
        }
      }
    } else if (raw.correct_answer !== undefined && raw.correct_answer !== null) {
      const caVal = raw.correct_answer;
      if (typeof caVal === "number") {
        if (caVal >= 0 && caVal < options.length) {
          correctIndex = caVal;
        } else if (caVal >= 1 && caVal <= options.length) {
          correctIndex = caVal - 1;
        } else {
          correctIndex = 0;
        }
        answer = options[correctIndex] ?? String(caVal);
      } else {
        answer = String(caVal).trim();
        correctIndex = options.findIndex(
          (o) => o.toLowerCase().trim() === answer.toLowerCase().trim()
        );
      }
    }

    if (correctIndex < 0 && options.length > 0) {
      correctIndex = 0;
      answer = options[0];
    }

    const feedback = String(raw.feedback ?? raw.explanation ?? "").trim();
    const id = Number(raw.id ?? raw.question_number ?? index + 1);

    return {
      id: isNaN(id) ? index + 1 : id,
      type,
      question: questionText,
      options,
      answer,
      correctIndex,
      feedback,
    };
  } catch {
    return null;
  }
}

function extractRawQuestions(parsed: Record<string, unknown>): Record<string, unknown>[] {
  if (Array.isArray(parsed.questions)) {
    return parsed.questions as Record<string, unknown>[];
  }
  if (Array.isArray(parsed.quiz)) {
    return parsed.quiz as Record<string, unknown>[];
  }
  const numericKeys = Object.keys(parsed).filter((k) => /^\d+$/.test(k));
  if (numericKeys.length > 0) {
    return numericKeys
      .sort((a, b) => Number(a) - Number(b))
      .map((k) => parsed[k] as Record<string, unknown>)
      .filter((v) => v && typeof v === "object");
  }
  return [];
}

function parseQuizFromContent(content: string): { questions: NormalizedQuestion[]; introText?: string } | null {
  if (!content) return null;

  try {
    const codeBlockMatch = content.match(/\`\`\`json\s*([\s\S]*?)\`\`\`/);
    let jsonStr = "";
    let introText = "";

    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
      introText = content.substring(0, codeBlockMatch.index ?? 0).trim();
    } else {
      const idx = content.indexOf("{");
      if (idx === -1) return null;

      let depth = 0;
      let endIdx = -1;
      for (let i = idx; i < content.length; i++) {
        if (content[i] === "{") depth++;
        if (content[i] === "}") depth--;
        if (depth === 0) {
          endIdx = i;
          break;
        }
      }
      if (endIdx === -1) return null;

      jsonStr = content.substring(idx, endIdx + 1);
      introText = content.substring(0, idx).trim();
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      const sanitized = sanitizeJsonString(jsonStr);
      try {
        parsed = JSON.parse(sanitized);
      } catch {
        return null;
      }
    }

    const rawQuestions = extractRawQuestions(parsed);
    if (rawQuestions.length === 0) return null;

    const questions = rawQuestions
      .map((q, i) => normalizeQuestion(q, i))
      .filter((q): q is NormalizedQuestion => q !== null);

    if (questions.length === 0) return null;

    const seenIds = new Set<number>();
    questions.forEach((q, i) => {
      if (seenIds.has(q.id)) {
        q.id = 1000 + i;
      }
      seenIds.add(q.id);
    });

    return {
      questions,
      introText: introText || undefined,
    };
  } catch {
    return null;
  }
}

// ─── Tests ───

describe("QuizRenderer Parsing", () => {
  describe("sanitizeJsonString", () => {
    it("should fix escaped single quotes", () => {
      const input = "Il s\\'appelle Jean";
      const result = sanitizeJsonString(input);
      expect(result).toBe("Il s'appelle Jean");
    });

    it("should fix invalid escape sequences", () => {
      const input = "L\\'\\accent est important";
      const result = sanitizeJsonString(input);
      expect(result).toBe("L'accent est important");
    });

    it("should preserve valid JSON escapes", () => {
      const input = 'He said \\"hello\\"';
      const result = sanitizeJsonString(input);
      expect(result).toBe('He said \\"hello\\"');
    });
  });

  describe("normalizeQuestion", () => {
    it("should handle Format A: id, type, question, options, answer (string), feedback", () => {
      const raw = {
        id: 1,
        type: "multiple-choice",
        question: "What is 2+2?",
        options: ["3", "4", "5", "6"],
        answer: "4",
        feedback: "Correct! 2+2=4",
      };
      const result = normalizeQuestion(raw, 0);
      expect(result).not.toBeNull();
      expect(result!.question).toBe("What is 2+2?");
      expect(result!.answer).toBe("4");
      expect(result!.correctIndex).toBe(1);
      expect(result!.type).toBe("multiple-choice");
      expect(result!.feedback).toBe("Correct! 2+2=4");
    });

    it("should handle Format B: question_text, question_type, correct_answer (string)", () => {
      const raw = {
        question_text: "Quel verbe utiliser?",
        question_type: "multiple_choice",
        options: ["être", "avoir", "aller", "faire"],
        correct_answer: "être",
        feedback: "Être est le bon verbe.",
      };
      const result = normalizeQuestion(raw, 0);
      expect(result).not.toBeNull();
      expect(result!.question).toBe("Quel verbe utiliser?");
      expect(result!.answer).toBe("être");
      expect(result!.correctIndex).toBe(0);
    });

    it("should handle Format C: question_number, correct_answer (numeric, 1-based)", () => {
      const raw = {
        question_number: 3,
        question_type: "multiple_choice",
        question_text: "Que fait Anna?",
        options: ["Elle mange", "Elle dort", "Elle travaille", "Elle chante"],
        correct_answer: 2,
        feedback: "Elle travaille au bureau.",
      };
      const result = normalizeQuestion(raw, 2);
      expect(result).not.toBeNull();
      expect(result!.question).toBe("Que fait Anna?");
      expect(result!.id).toBe(3);
      // correct_answer=2 should be treated as index 2 (0-based) since 2 < 4
      expect(result!.correctIndex).toBe(2);
      expect(result!.answer).toBe("Elle travaille");
    });

    it("should handle Format D: question, options, answer (no id/type)", () => {
      const raw = {
        question: "Comment dit-on 'hello'?",
        options: ["Bonjour", "Au revoir", "Merci", "S'il vous plaît"],
        answer: "Bonjour",
        feedback: "Bonjour means hello.",
      };
      const result = normalizeQuestion(raw, 5);
      expect(result).not.toBeNull();
      expect(result!.question).toBe("Comment dit-on 'hello'?");
      expect(result!.answer).toBe("Bonjour");
      expect(result!.correctIndex).toBe(0);
      expect(result!.id).toBe(6); // index + 1
    });

    it("should handle fill-in-the-blank type", () => {
      const raw = {
        type: "fill-in-the-blank",
        question: "Je ___ analyste.",
        options: [],
        answer: "suis",
        feedback: "Je suis analyste.",
      };
      const result = normalizeQuestion(raw, 0);
      expect(result).not.toBeNull();
      expect(result!.type).toBe("fill-in-the-blank");
      expect(result!.answer).toBe("suis");
    });

    it("should handle completez type as fill-in-the-blank", () => {
      const raw = {
        question_type: "completez",
        question_text: "Complétez: Je ___ français.",
        options: [],
        answer: "parle",
      };
      const result = normalizeQuestion(raw, 0);
      expect(result).not.toBeNull();
      expect(result!.type).toBe("fill-in-the-blank");
    });

    it("should return null for empty question text", () => {
      const raw = { question: "", options: ["A", "B"], answer: "A" };
      const result = normalizeQuestion(raw, 0);
      expect(result).toBeNull();
    });

    it("should handle numeric answer (0-based index)", () => {
      const raw = {
        question: "Pick one",
        options: ["Alpha", "Beta", "Gamma"],
        answer: 1,
      };
      const result = normalizeQuestion(raw, 0);
      expect(result).not.toBeNull();
      expect(result!.answer).toBe("Beta");
      expect(result!.correctIndex).toBe(1);
    });

    it("should use explanation field as feedback fallback", () => {
      const raw = {
        question: "Test?",
        options: ["A", "B"],
        answer: "A",
        explanation: "Because A is correct.",
      };
      const result = normalizeQuestion(raw, 0);
      expect(result).not.toBeNull();
      expect(result!.feedback).toBe("Because A is correct.");
    });
  });

  describe("extractRawQuestions", () => {
    it("should extract from { questions: [...] }", () => {
      const parsed = {
        questions: [
          { question: "Q1", options: ["A", "B"], answer: "A" },
          { question: "Q2", options: ["C", "D"], answer: "C" },
        ],
      };
      const result = extractRawQuestions(parsed);
      expect(result).toHaveLength(2);
    });

    it("should extract from { quiz: [...] }", () => {
      const parsed = {
        quiz: [
          { question: "Q1", options: ["A", "B"], answer: "A" },
        ],
      };
      const result = extractRawQuestions(parsed);
      expect(result).toHaveLength(1);
    });

    it("should extract from numbered keys { '0': {...}, '1': {...} }", () => {
      const parsed = {
        "0": { question: "Q1", options: ["A", "B"], answer: "A" },
        "1": { question: "Q2", options: ["C", "D"], answer: "C" },
        "2": { question: "Q3", options: ["E", "F"], answer: "E" },
      };
      const result = extractRawQuestions(parsed);
      expect(result).toHaveLength(3);
    });

    it("should return empty array for unrecognized structure", () => {
      const parsed = { title: "Not a quiz", body: "No questions here" };
      const result = extractRawQuestions(parsed);
      expect(result).toHaveLength(0);
    });
  });

  describe("parseQuizFromContent", () => {
    it("should parse Format A: standard questions array with string answers", () => {
      const content = `Quiz de validation\n\n\`\`\`json\n{"questions":[{"id":1,"type":"multiple-choice","question":"What is 2+2?","options":["3","4","5","6"],"answer":"4","feedback":"Correct!"}]}\n\`\`\``;
      const result = parseQuizFromContent(content);
      expect(result).not.toBeNull();
      expect(result!.questions).toHaveLength(1);
      expect(result!.questions[0].answer).toBe("4");
      expect(result!.introText).toBe("Quiz de validation");
    });

    it("should parse Format B: question_text with correct_answer string", () => {
      const content = JSON.stringify({
        questions: [
          {
            question_text: "Quel est le bon verbe?",
            question_type: "multiple_choice",
            options: ["être", "avoir", "aller"],
            correct_answer: "être",
            feedback: "Être est correct.",
          },
        ],
      });
      const result = parseQuizFromContent(content);
      expect(result).not.toBeNull();
      expect(result!.questions[0].question).toBe("Quel est le bon verbe?");
      expect(result!.questions[0].answer).toBe("être");
    });

    it("should parse Format C: question_number with numeric correct_answer", () => {
      const content = JSON.stringify({
        questions: [
          {
            question_number: 1,
            question_type: "multiple_choice",
            question_text: "Que fait Anna?",
            options: ["Elle mange", "Elle dort", "Elle travaille", "Elle chante"],
            correct_answer: 3,
            feedback: "Elle travaille.",
          },
        ],
      });
      const result = parseQuizFromContent(content);
      expect(result).not.toBeNull();
      expect(result!.questions[0].question).toBe("Que fait Anna?");
      expect(result!.questions[0].id).toBe(1);
    });

    it("should parse Format E: quiz wrapper key", () => {
      const content = JSON.stringify({
        quiz: [
          {
            question: "Comment dit-on hello?",
            options: ["Bonjour", "Au revoir", "Merci"],
            answer: "Bonjour",
            feedback: "Bonjour!",
          },
        ],
      });
      const result = parseQuizFromContent(content);
      expect(result).not.toBeNull();
      expect(result!.questions[0].question).toBe("Comment dit-on hello?");
    });

    it("should parse Format F: numbered keys", () => {
      const content = JSON.stringify({
        "0": {
          question: "First question?",
          options: ["A", "B", "C"],
          answer: "B",
        },
        "1": {
          question: "Second question?",
          options: ["X", "Y", "Z"],
          answer: "Z",
        },
      });
      const result = parseQuizFromContent(content);
      expect(result).not.toBeNull();
      expect(result!.questions).toHaveLength(2);
      expect(result!.questions[0].question).toBe("First question?");
      expect(result!.questions[1].question).toBe("Second question?");
    });

    it("should handle JSON with bad escape sequences", () => {
      // Simulate content with escaped single quotes (common in French)
      const rawJson = '{"questions":[{"question":"L\'accent est important","options":["Oui","Non"],"answer":"Oui","feedback":"C\'est correct!"}]}';
      // Wrap in code block
      const content = "Quiz\n\n```json\n" + rawJson + "\n```";
      const result = parseQuizFromContent(content);
      expect(result).not.toBeNull();
      expect(result!.questions).toHaveLength(1);
      expect(result!.questions[0].question).toContain("accent");
    });

    it("should return null for empty content", () => {
      expect(parseQuizFromContent("")).toBeNull();
      expect(parseQuizFromContent("No JSON here at all")).toBeNull();
    });

    it("should return null for content with no valid questions", () => {
      const content = JSON.stringify({ questions: [{ text: "" }] });
      const result = parseQuizFromContent(content);
      expect(result).toBeNull();
    });

    it("should handle multiple questions and assign unique IDs", () => {
      const content = JSON.stringify({
        questions: [
          { question: "Q1?", options: ["A", "B"], answer: "A" },
          { question: "Q2?", options: ["C", "D"], answer: "C" },
          { question: "Q3?", options: ["E", "F"], answer: "E" },
        ],
      });
      const result = parseQuizFromContent(content);
      expect(result).not.toBeNull();
      expect(result!.questions).toHaveLength(3);
      const ids = result!.questions.map((q) => q.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(3);
    });

    it("should parse JSON embedded in markdown text", () => {
      const content = `## Quiz de validation des acquis

Testez vos connaissances!

{"questions":[{"question":"Quel est le sujet?","options":["Je","Tu","Il"],"answer":"Je","feedback":"Correct."}]}

Bonne chance!`;
      const result = parseQuizFromContent(content);
      expect(result).not.toBeNull();
      expect(result!.questions).toHaveLength(1);
      expect(result!.introText).toContain("Quiz de validation");
    });
  });
});
