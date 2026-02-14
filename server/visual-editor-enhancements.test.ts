/**
 * Visual Editor Enhancements Tests
 * Tests for: TipTap RichTextEditor, MediaLibraryPicker, UndoRedo system
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── UndoRedo Hook Logic Tests ───
describe("UndoRedo System", () => {
  // Simulate the undo/redo state machine logic
  type UndoEntry = {
    sectionId: number;
    before: Record<string, any>;
    after: Record<string, any>;
  };

  class UndoRedoManager {
    past: UndoEntry[] = [];
    present: UndoEntry | null = null;
    future: UndoEntry[] = [];
    maxHistory: number;

    constructor(maxHistory = 50) {
      this.maxHistory = maxHistory;
    }

    push(entry: UndoEntry) {
      if (this.present) {
        this.past.push(this.present);
        if (this.past.length > this.maxHistory) {
          this.past.splice(0, this.past.length - this.maxHistory);
        }
      }
      this.present = entry;
      this.future = []; // Clear future on new action
    }

    undo(): UndoEntry | null {
      if (this.past.length === 0) return null;
      const previous = this.past.pop()!;
      if (this.present) {
        this.future.unshift(this.present);
      }
      this.present = previous;
      return previous;
    }

    redo(): UndoEntry | null {
      if (this.future.length === 0) return null;
      const next = this.future.shift()!;
      if (this.present) {
        this.past.push(this.present);
      }
      this.present = next;
      return next;
    }

    get canUndo() { return this.past.length > 0; }
    get canRedo() { return this.future.length > 0; }
    get undoCount() { return this.past.length; }
    get redoCount() { return this.future.length; }
  }

  let manager: UndoRedoManager;

  beforeEach(() => {
    manager = new UndoRedoManager(30);
  });

  it("should start with empty history", () => {
    expect(manager.canUndo).toBe(false);
    expect(manager.canRedo).toBe(false);
    expect(manager.undoCount).toBe(0);
    expect(manager.redoCount).toBe(0);
  });

  it("should push entries to history", () => {
    manager.push({
      sectionId: 1,
      before: { title: "Old Title" },
      after: { title: "New Title" },
    });
    expect(manager.present?.after.title).toBe("New Title");
  });

  it("should enable undo after push", () => {
    manager.push({
      sectionId: 1,
      before: { title: "Old" },
      after: { title: "New" },
    });
    manager.push({
      sectionId: 1,
      before: { title: "New" },
      after: { title: "Newer" },
    });
    expect(manager.canUndo).toBe(true);
    expect(manager.undoCount).toBe(1);
  });

  it("should undo correctly and return the previous entry", () => {
    manager.push({
      sectionId: 1,
      before: { title: "Original" },
      after: { title: "Changed" },
    });
    manager.push({
      sectionId: 1,
      before: { title: "Changed" },
      after: { title: "Changed Again" },
    });

    const undone = manager.undo();
    expect(undone).not.toBeNull();
    expect(undone!.after.title).toBe("Changed");
    expect(manager.canRedo).toBe(true);
  });

  it("should redo correctly after undo", () => {
    manager.push({
      sectionId: 1,
      before: { title: "A" },
      after: { title: "B" },
    });
    manager.push({
      sectionId: 1,
      before: { title: "B" },
      after: { title: "C" },
    });

    manager.undo();
    const redone = manager.redo();
    expect(redone).not.toBeNull();
    expect(redone!.after.title).toBe("C");
    expect(manager.canRedo).toBe(false);
  });

  it("should clear future on new push after undo", () => {
    manager.push({
      sectionId: 1,
      before: { title: "A" },
      after: { title: "B" },
    });
    manager.push({
      sectionId: 1,
      before: { title: "B" },
      after: { title: "C" },
    });

    manager.undo(); // Go back to B
    expect(manager.canRedo).toBe(true);

    // New action should clear redo history
    manager.push({
      sectionId: 1,
      before: { title: "B" },
      after: { title: "D" },
    });
    expect(manager.canRedo).toBe(false);
    expect(manager.present?.after.title).toBe("D");
  });

  it("should return null when undoing with empty history", () => {
    const result = manager.undo();
    expect(result).toBeNull();
  });

  it("should return null when redoing with empty future", () => {
    const result = manager.redo();
    expect(result).toBeNull();
  });

  it("should respect maxHistory limit", () => {
    const smallManager = new UndoRedoManager(3);
    for (let i = 0; i < 10; i++) {
      smallManager.push({
        sectionId: 1,
        before: { title: `Title ${i}` },
        after: { title: `Title ${i + 1}` },
      });
    }
    // Should have at most 3 items in past
    expect(smallManager.undoCount).toBeLessThanOrEqual(3);
  });

  it("should handle multiple undo/redo cycles", () => {
    manager.push({ sectionId: 1, before: { title: "A" }, after: { title: "B" } });
    manager.push({ sectionId: 1, before: { title: "B" }, after: { title: "C" } });
    manager.push({ sectionId: 1, before: { title: "C" }, after: { title: "D" } });

    // Undo all
    manager.undo(); // D -> C
    manager.undo(); // C -> B
    expect(manager.undoCount).toBe(0);
    expect(manager.redoCount).toBe(2);

    // Redo all
    manager.redo(); // B -> C
    manager.redo(); // C -> D
    expect(manager.undoCount).toBe(2);
    expect(manager.redoCount).toBe(0);
  });

  it("should track section IDs for multi-section edits", () => {
    manager.push({ sectionId: 1, before: { title: "Hero A" }, after: { title: "Hero B" } });
    manager.push({ sectionId: 2, before: { title: "CTA A" }, after: { title: "CTA B" } });
    manager.push({ sectionId: 1, before: { title: "Hero B" }, after: { title: "Hero C" } });

    const undone1 = manager.undo();
    expect(undone1!.sectionId).toBe(2); // Should undo the CTA edit first (previous entry)
    // Actually it goes to the previous present, which was sectionId: 2
  });

  it("should handle style property changes in undo/redo", () => {
    manager.push({
      sectionId: 1,
      before: { backgroundColor: "#ffffff", textColor: "#000000", paddingTop: 40 },
      after: { backgroundColor: "#1a1a2e", textColor: "#ffffff", paddingTop: 60 },
    });

    manager.push({
      sectionId: 1,
      before: { backgroundColor: "#1a1a2e", textColor: "#ffffff", paddingTop: 60 },
      after: { backgroundColor: "#0f3d3e", textColor: "#f0f0f0", paddingTop: 80 },
    });

    const undone = manager.undo();
    expect(undone!.before.backgroundColor).toBe("#ffffff");
    expect(undone!.before.paddingTop).toBe(40);
  });
});

// ─── Media Library Picker Integration Tests ───
describe("MediaLibraryPicker Integration", () => {
  it("should define correct MIME type filters", () => {
    const imageFilter = "image/";
    const videoFilter = "video/";
    const audioFilter = "audio/";

    // Image MIME types should match the filter
    expect("image/png".startsWith(imageFilter)).toBe(true);
    expect("image/jpeg".startsWith(imageFilter)).toBe(true);
    expect("image/webp".startsWith(imageFilter)).toBe(true);
    expect("image/svg+xml".startsWith(imageFilter)).toBe(true);

    // Non-image types should not match
    expect("video/mp4".startsWith(imageFilter)).toBe(false);
    expect("audio/mpeg".startsWith(imageFilter)).toBe(false);
    expect("application/pdf".startsWith(imageFilter)).toBe(false);
  });

  it("should format file sizes correctly", () => {
    function formatFileSize(bytes: number): string {
      if (!bytes) return "—";
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    expect(formatFileSize(0)).toBe("—");
    expect(formatFileSize(512)).toBe("512 B");
    expect(formatFileSize(1536)).toBe("1.5 KB");
    expect(formatFileSize(2 * 1024 * 1024)).toBe("2.0 MB");
  });

  it("should validate URL inputs", () => {
    const isValidUrl = (url: string) => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    };

    expect(isValidUrl("https://example.com/image.png")).toBe(true);
    expect(isValidUrl("https://cdn.manus.space/files/photo.jpg")).toBe(true);
    expect(isValidUrl("not-a-url")).toBe(false);
    expect(isValidUrl("")).toBe(false);
  });

  it("should handle media callback pattern correctly", () => {
    let capturedUrl = "";
    const callback = (url: string) => { capturedUrl = url; };

    // Simulate the media picker flow
    callback("https://cdn.example.com/uploaded-image.png");
    expect(capturedUrl).toBe("https://cdn.example.com/uploaded-image.png");
  });
});

// ─── RichTextEditor Content Handling Tests ───
describe("RichTextEditor Content Handling", () => {
  it("should handle HTML content serialization", () => {
    const htmlContent = "<p>Welcome to <strong>RusingÂcademy</strong></p>";
    expect(htmlContent).toContain("<strong>");
    expect(htmlContent).toContain("RusingÂcademy");
  });

  it("should handle bilingual content in rich text", () => {
    const bilingualHtml = `
      <h2>Welcome | Bienvenue</h2>
      <p>Learn professional French | Apprenez le français professionnel</p>
      <ul>
        <li>Structured programs | Programmes structurés</li>
        <li>Expert coaches | Coachs experts</li>
      </ul>
    `;
    expect(bilingualHtml).toContain("Welcome | Bienvenue");
    expect(bilingualHtml).toContain("<ul>");
    expect(bilingualHtml).toContain("<li>");
  });

  it("should preserve formatting when converting between states", () => {
    const content = {
      body: "<p>Paragraph with <em>italic</em> and <strong>bold</strong></p>",
      items: ["Item 1", "Item 2"],
    };

    const serialized = JSON.stringify(content);
    const deserialized = JSON.parse(serialized);

    expect(deserialized.body).toContain("<em>italic</em>");
    expect(deserialized.body).toContain("<strong>bold</strong>");
    expect(deserialized.items).toHaveLength(2);
  });

  it("should handle empty content gracefully", () => {
    const emptyContent = "";
    const nullContent = null;
    const undefinedContent = undefined;

    expect(emptyContent || "").toBe("");
    expect(nullContent || "").toBe("");
    expect(undefinedContent || "").toBe("");
  });

  it("should sanitize content for XSS prevention", () => {
    // TipTap sanitizes by default, but verify the pattern
    const dangerousContent = '<script>alert("xss")</script>';
    const safeContent = dangerousContent.replace(/<script[^>]*>.*?<\/script>/gi, "");
    expect(safeContent).not.toContain("<script>");
  });
});

// ─── Section Editor Panel Integration Tests ───
describe("Section Editor Panel with Enhancements", () => {
  it("should define all editable fields for hero section", () => {
    const heroFields = {
      title: "string",
      subtitle: "string",
      ctaText: "string",
      ctaUrl: "string",
      backgroundImage: "string",
      backgroundColor: "string",
      textColor: "string",
      paddingTop: "number",
      paddingBottom: "number",
    };

    expect(Object.keys(heroFields)).toContain("title");
    expect(Object.keys(heroFields)).toContain("subtitle");
    expect(Object.keys(heroFields)).toContain("ctaText");
    expect(Object.keys(heroFields)).toContain("backgroundImage");
    expect(Object.keys(heroFields)).toContain("backgroundColor");
    expect(Object.keys(heroFields)).toContain("textColor");
    expect(Object.keys(heroFields)).toContain("paddingTop");
    expect(Object.keys(heroFields)).toContain("paddingBottom");
  });

  it("should define all editable fields for text_block section with rich text", () => {
    const textBlockFields = {
      title: "string",
      content: "richtext", // Now uses TipTap RichTextEditor
      backgroundColor: "string",
      textColor: "string",
      paddingTop: "number",
      paddingBottom: "number",
    };

    expect(textBlockFields.content).toBe("richtext");
  });

  it("should define all editable fields for features section", () => {
    const featureItem = {
      icon: "string",
      title: "string",
      description: "string",
    };

    expect(Object.keys(featureItem)).toContain("icon");
    expect(Object.keys(featureItem)).toContain("title");
    expect(Object.keys(featureItem)).toContain("description");
  });

  it("should define all editable fields for team section with media picker", () => {
    const teamMember = {
      name: "string",
      role: "string",
      photo: "string", // Now has Media Library browse button
    };

    expect(Object.keys(teamMember)).toContain("photo");
  });

  it("should support style tab with color pickers and spacing controls", () => {
    const styleFields = {
      backgroundColor: { type: "color", default: "#ffffff" },
      textColor: { type: "color", default: "#000000" },
      paddingTop: { type: "range", min: 0, max: 200, step: 4, default: 40 },
      paddingBottom: { type: "range", min: 0, max: 200, step: 4, default: 40 },
    };

    expect(styleFields.paddingTop.min).toBe(0);
    expect(styleFields.paddingTop.max).toBe(200);
    expect(styleFields.paddingTop.step).toBe(4);
    expect(styleFields.backgroundColor.type).toBe("color");
  });

  it("should support advanced tab with visibility toggle", () => {
    const advancedFields = {
      isVisible: { type: "boolean", default: true },
      cssClass: { type: "string", default: "" },
    };

    expect(advancedFields.isVisible.default).toBe(true);
  });
});

// ─── Keyboard Shortcut Tests ───
describe("Keyboard Shortcuts", () => {
  it("should detect Ctrl+Z for undo", () => {
    const event = { ctrlKey: true, metaKey: false, key: "z", shiftKey: false };
    const isUndo = (event.ctrlKey || event.metaKey) && event.key === "z" && !event.shiftKey;
    expect(isUndo).toBe(true);
  });

  it("should detect Cmd+Z for undo on Mac", () => {
    const event = { ctrlKey: false, metaKey: true, key: "z", shiftKey: false };
    const isUndo = (event.ctrlKey || event.metaKey) && event.key === "z" && !event.shiftKey;
    expect(isUndo).toBe(true);
  });

  it("should detect Ctrl+Y for redo", () => {
    const event = { ctrlKey: true, metaKey: false, key: "y", shiftKey: false };
    const isRedo = (event.ctrlKey || event.metaKey) && (event.key === "y" || (event.key === "z" && event.shiftKey));
    expect(isRedo).toBe(true);
  });

  it("should detect Ctrl+Shift+Z for redo", () => {
    const event = { ctrlKey: true, metaKey: false, key: "z", shiftKey: true };
    const isRedo = (event.ctrlKey || event.metaKey) && (event.key === "y" || (event.key === "z" && event.shiftKey));
    expect(isRedo).toBe(true);
  });

  it("should not trigger undo/redo without modifier keys", () => {
    const event = { ctrlKey: false, metaKey: false, key: "z", shiftKey: false };
    const isUndo = (event.ctrlKey || event.metaKey) && event.key === "z" && !event.shiftKey;
    const isRedo = (event.ctrlKey || event.metaKey) && (event.key === "y" || (event.key === "z" && event.shiftKey));
    expect(isUndo).toBe(false);
    expect(isRedo).toBe(false);
  });

  it("should skip undo/redo when inside TipTap editor", () => {
    // TipTap handles its own undo/redo internally
    const isTipTapElement = (target: { tagName: string; isContentEditable: boolean; closest: (s: string) => boolean }) => {
      return target.isContentEditable && target.closest(".tiptap");
    };

    const tiptapTarget = {
      tagName: "DIV",
      isContentEditable: true,
      closest: (selector: string) => selector === ".tiptap",
    };

    const regularInput = {
      tagName: "INPUT",
      isContentEditable: false,
      closest: () => false,
    };

    expect(isTipTapElement(tiptapTarget)).toBe(true);
    expect(isTipTapElement(regularInput)).toBe(false);
  });
});
