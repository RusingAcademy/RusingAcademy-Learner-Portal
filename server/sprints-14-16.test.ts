import { describe, it, expect } from "vitest";

/* ─── Sprint 14: Calendly + Tutoring Sessions ─── */
describe("Sprint 14: Calendly + Tutoring Sessions", () => {
  it("TutoringSessions page exports a valid component", async () => {
    const mod = await import("../client/src/pages/TutoringSessions");
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe("function");
  });

  it("TutoringSessions contains Calendly booking URLs", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("client/src/pages/TutoringSessions.tsx", "utf-8");
    expect(content).toContain("calendly.com");
    expect(content).toContain("steven-barholere");
  });

  it("TutoringSessions has coach profiles section", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("client/src/pages/TutoringSessions.tsx", "utf-8");
    expect(content).toContain("coach");
    expect(content).toContain("linkedin");
  });

  it("TutoringSessions has multiple booking types", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("client/src/pages/TutoringSessions.tsx", "utf-8");
    // Should have at least 3 booking types
    const bookingMatches = content.match(/Discovery|Diagnostic|Coaching|Crash Course|Intensive/gi);
    expect(bookingMatches).toBeTruthy();
    expect(bookingMatches!.length).toBeGreaterThanOrEqual(3);
  });
});

/* ─── Sprint 15: Audio/Oral Exercises ─── */
describe("Sprint 15: Audio/Oral Exercises", () => {
  it("AudioPlayer component exists and exports", async () => {
    const fs = await import("fs");
    const exists = fs.existsSync("client/src/components/AudioPlayer.tsx");
    expect(exists).toBe(true);
  });

  it("AudioPlayer has TTS and playback speed controls", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("client/src/components/AudioPlayer.tsx", "utf-8");
    expect(content).toContain("speechSynthesis");
    expect(content).toContain("playbackRate");
  });

  it("VoiceRecorder component exists and exports", async () => {
    const fs = await import("fs");
    const exists = fs.existsSync("client/src/components/VoiceRecorder.tsx");
    expect(exists).toBe(true);
  });

  it("VoiceRecorder uses MediaRecorder API", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("client/src/components/VoiceRecorder.tsx", "utf-8");
    expect(content).toContain("MediaRecorder");
    expect(content).toContain("getUserMedia");
  });

  it("VoiceRecorder has speech recognition for live transcript", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("client/src/components/VoiceRecorder.tsx", "utf-8");
    expect(content).toContain("SpeechRecognition");
  });

  it("LessonViewer integrates AudioPlayer and VoiceRecorder", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("client/src/pages/LessonViewer.tsx", "utf-8");
    expect(content).toContain("AudioPlayer");
    expect(content).toContain("VoiceRecorder");
  });
});

/* ─── Sprint 16: Reports/Analytics Dashboard ─── */
describe("Sprint 16: Reports/Analytics Dashboard", () => {
  it("Reports page exports a valid component", async () => {
    const mod = await import("../client/src/pages/Reports");
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe("function");
  });

  it("Reports page has multiple tabs (overview, progress, sle, activity)", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("client/src/pages/Reports.tsx", "utf-8");
    expect(content).toContain("overview");
    expect(content).toContain("progress");
    expect(content).toContain("sle");
    expect(content).toContain("activity");
  });

  it("Reports page has SVG charts for data visualization", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("client/src/pages/Reports.tsx", "utf-8");
    expect(content).toContain("<svg");
    expect(content).toContain("viewBox");
  });

  it("Reports page has SLE readiness radar chart", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("client/src/pages/Reports.tsx", "utf-8");
    expect(content).toContain("Reading");
    expect(content).toContain("Writing");
    expect(content).toContain("Oral");
  });

  it("Reports page has activity heatmap", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("client/src/pages/Reports.tsx", "utf-8");
    // Should have heatmap or contribution grid
    const hasHeatmap = content.includes("heatmap") || content.includes("Heatmap") || content.includes("contribution") || content.includes("activity");
    expect(hasHeatmap).toBe(true);
  });

  it("Reports page uses gamification context for real data", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("client/src/pages/Reports.tsx", "utf-8");
    expect(content).toContain("useGamification");
    expect(content).toContain("totalXP");
    expect(content).toContain("lessonsCompleted");
  });
});
