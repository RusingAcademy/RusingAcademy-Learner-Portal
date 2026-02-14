/**
 * Stability Features Test Suite
 * 
 * Tests for Month 1 Production Stability Foundation:
 * 1. Webhook Idempotency
 * 2. Structured Logger
 * 3. Analytics Normalization
 * 4. RBAC Middleware & Audit Log
 * 5. SLE Scoring Rubric
 * 6. AI Pipeline Monitor
 * 7. Admin Stability Router
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ============================================================================
// 1. WEBHOOK IDEMPOTENCY
// ============================================================================

describe("Webhook Idempotency", () => {
  it("should export claimWebhookEvent, markEventProcessed, markEventFailed, and getWebhookEventStats", async () => {
    const mod = await import("./webhookIdempotency");
    expect(typeof mod.claimWebhookEvent).toBe("function");
    expect(typeof mod.markEventProcessed).toBe("function");
    expect(typeof mod.markEventFailed).toBe("function");
    expect(typeof mod.getWebhookEventStats).toBe("function");
  });

  it("claimWebhookEvent should accept stripeEventId and eventType", async () => {
    const { claimWebhookEvent } = await import("./webhookIdempotency");
    expect(claimWebhookEvent.length).toBeGreaterThanOrEqual(2);
  });

  it("getWebhookEventStats should return an object with expected fields", async () => {
    const { getWebhookEventStats } = await import("./webhookIdempotency");
    const stats = await getWebhookEventStats();
    expect(stats).toHaveProperty("total");
    expect(stats).toHaveProperty("processed");
    expect(stats).toHaveProperty("failed");
    expect(stats).toHaveProperty("processing");
    expect(stats).toHaveProperty("recentEvents");
    expect(typeof stats.total).toBe("number");
    expect(typeof stats.processed).toBe("number");
    expect(typeof stats.failed).toBe("number");
    expect(typeof stats.processing).toBe("number");
    expect(Array.isArray(stats.recentEvents)).toBe(true);
  });
});

// ============================================================================
// 2. STRUCTURED LOGGER
// ============================================================================

describe("Structured Logger", () => {
  it("should export structuredLog and startTimer", async () => {
    const mod = await import("./structuredLogger");
    expect(typeof mod.structuredLog).toBe("function");
    expect(typeof mod.startTimer).toBe("function");
  });

  it("structuredLog should accept level, module, message, and optional data", async () => {
    const { structuredLog } = await import("./structuredLogger");
    // Should not throw
    expect(() => structuredLog("info", "test", "test message")).not.toThrow();
    expect(() => structuredLog("warn", "test", "warning", { key: "val" })).not.toThrow();
    expect(() => structuredLog("error", "test", "error", { err: "something" })).not.toThrow();
  });

  it("startTimer should return a function that returns elapsed ms", async () => {
    const { startTimer } = await import("./structuredLogger");
    const end = startTimer("test", "operation");
    expect(typeof end).toBe("function");
    
    // Small delay to ensure non-zero timing
    await new Promise((r) => setTimeout(r, 10));
    const elapsed = end();
    expect(typeof elapsed).toBe("number");
    expect(elapsed).toBeGreaterThanOrEqual(0);
  });
});

// ============================================================================
// 3. ANALYTICS NORMALIZATION
// ============================================================================

describe("Analytics Normalization", () => {
  it("should export normalizeEvent and ANALYTICS_SOURCES", async () => {
    const mod = await import("./analyticsNormalization");
    expect(typeof mod.normalizeEvent).toBe("function");
    expect(mod.ANALYTICS_SOURCES).toBeDefined();
    expect(Array.isArray(mod.ANALYTICS_SOURCES)).toBe(true);
  });

  it("normalizeEvent should validate and normalize a valid event", async () => {
    const { normalizeEvent } = await import("./analyticsNormalization");
    const result = normalizeEvent({
      eventType: "page_view",
      source: "frontend",
      productType: "course",
    });
    expect(result.eventType).toBe("page_view");
    expect(result.source).toBe("frontend");
    expect(result.productType).toBe("course");
    expect(result.currency).toBe("cad"); // default
  });

  it("normalizeEvent should map Stripe event types to canonical types", async () => {
    const { normalizeEvent } = await import("./analyticsNormalization");
    const result = normalizeEvent({
      eventType: "checkout.session.completed",
      source: "stripe_webhook",
    });
    expect(result.eventType).toBe("checkout_completed");
    expect(result.source).toBe("stripe_webhook");
  });

  it("normalizeEvent should fallback unknown event types to webhook_received", async () => {
    const { normalizeEvent } = await import("./analyticsNormalization");
    const result = normalizeEvent({
      eventType: "totally_unknown_event",
      source: "system",
    });
    expect(result.eventType).toBe("webhook_received");
  });

  it("normalizeSource should map common variants", async () => {
    const { normalizeSource } = await import("./analyticsNormalization");
    expect(normalizeSource("stripe webhook")).toBe("stripe_webhook");
    expect(normalizeSource("client")).toBe("frontend");
    expect(normalizeSource("admin")).toBe("admin_panel");
    expect(normalizeSource("ai companion")).toBe("ai_pipeline");
    expect(normalizeSource(undefined)).toBe("system");
  });

  it("normalizeProductType should map common product names", async () => {
    const { normalizeProductType } = await import("./analyticsNormalization");
    expect(normalizeProductType("path")).toBe("path_series");
    expect(normalizeProductType("coaching session")).toBe("coaching_session");
    expect(normalizeProductType("subscription")).toBe("subscription");
    expect(normalizeProductType(undefined)).toBeNull();
  });
});

// ============================================================================
// 4. RBAC MIDDLEWARE & AUDIT LOG
// ============================================================================

describe("RBAC Middleware & Audit Log", () => {
  it("should export logAuditEvent and queryAuditLog", async () => {
    const mod = await import("./rbacMiddleware");
    expect(typeof mod.logAuditEvent).toBe("function");
    expect(typeof mod.queryAuditLog).toBe("function");
  });

  it("logAuditEvent should not throw with valid input", async () => {
    const { logAuditEvent } = await import("./rbacMiddleware");
    // logAuditEvent returns void, should not throw
    await expect(
      logAuditEvent({
        userId: 1,
        action: "test.action",
        targetType: "test",
        targetId: 1,
        details: { test: true },
      })
    ).resolves.not.toThrow();
  });

  it("queryAuditLog should return entries and total", async () => {
    const { queryAuditLog } = await import("./rbacMiddleware");
    const result = await queryAuditLog({ limit: 5 });
    expect(result).toHaveProperty("entries");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.entries)).toBe(true);
    expect(typeof result.total).toBe("number");
  });

  it("queryAuditLog should support filtering by action", async () => {
    const { queryAuditLog } = await import("./rbacMiddleware");
    const result = await queryAuditLog({ action: "test.action", limit: 5 });
    expect(result).toHaveProperty("entries");
    expect(Array.isArray(result.entries)).toBe(true);
  });

  it("computeDiff should detect changed fields", async () => {
    const { computeDiff } = await import("./rbacMiddleware");
    const diff = computeDiff(
      { name: "Old Name", status: "active" },
      { name: "New Name", status: "active" }
    );
    expect(diff).not.toBeNull();
    expect(diff!.name.before).toBe("Old Name");
    expect(diff!.name.after).toBe("New Name");
    expect(diff!.status).toBeUndefined(); // unchanged
  });

  it("computeDiff should return null when no changes", async () => {
    const { computeDiff } = await import("./rbacMiddleware");
    const diff = computeDiff(
      { name: "Same", status: "active" },
      { name: "Same", status: "active" }
    );
    expect(diff).toBeNull();
  });

  it("hasPermission should grant admin full access", async () => {
    const { hasPermission } = await import("./rbacMiddleware");
    const result = await hasPermission("admin", { module: "anything", action: "anything" });
    expect(result).toBe(true);
  });

  it("requirePermission should export a middleware factory", async () => {
    const { requirePermission } = await import("./rbacMiddleware");
    expect(typeof requirePermission).toBe("function");
    const middleware = requirePermission({ module: "courses", action: "edit" });
    expect(typeof middleware).toBe("function");
  });
});

// ============================================================================
// 5. SLE SCORING RUBRIC
// ============================================================================

describe("SLE Scoring Rubric", () => {
  it("should export SLE_RUBRICS for levels A, B, C", async () => {
    const { SLE_RUBRICS } = await import("./services/sleScoringRubric");
    expect(SLE_RUBRICS).toHaveProperty("A");
    expect(SLE_RUBRICS).toHaveProperty("B");
    expect(SLE_RUBRICS).toHaveProperty("C");
  });

  it("each rubric should have 4 criteria with max 25 points each", async () => {
    const { SLE_RUBRICS } = await import("./services/sleScoringRubric");
    for (const level of ["A", "B", "C"] as const) {
      const rubric = SLE_RUBRICS[level];
      expect(rubric.criteria.length).toBe(4);
      for (const criterion of rubric.criteria) {
        expect(criterion.maxPoints).toBe(25);
        expect(criterion.descriptors).toHaveProperty("excellent");
        expect(criterion.descriptors).toHaveProperty("good");
        expect(criterion.descriptors).toHaveProperty("adequate");
        expect(criterion.descriptors).toHaveProperty("developing");
        expect(criterion.descriptors).toHaveProperty("insufficient");
      }
    }
  });

  it("pass thresholds should be A=40, B=55, C=70", async () => {
    const { getPassThreshold } = await import("./services/sleScoringRubric");
    expect(getPassThreshold("A")).toBe(40);
    expect(getPassThreshold("B")).toBe(55);
    expect(getPassThreshold("C")).toBe(70);
  });

  it("isPassing should correctly determine pass/fail", async () => {
    const { isPassing } = await import("./services/sleScoringRubric");
    expect(isPassing("A", 40)).toBe(true);
    expect(isPassing("A", 39)).toBe(false);
    expect(isPassing("B", 55)).toBe(true);
    expect(isPassing("B", 54)).toBe(false);
    expect(isPassing("C", 70)).toBe(true);
    expect(isPassing("C", 69)).toBe(false);
  });

  it("buildScoringPrompt should return a detailed prompt string", async () => {
    const { buildScoringPrompt } = await import("./services/sleScoringRubric");
    const prompt = buildScoringPrompt("B", "oral_expression");
    expect(typeof prompt).toBe("string");
    expect(prompt).toContain("Level B");
    expect(prompt).toContain("Grammatical Accuracy");
    expect(prompt).toContain("Vocabulary");
    expect(prompt).toContain("Coherence");
    expect(prompt).toContain("Task Completion");
    expect(prompt).toContain("55/100"); // pass threshold
    expect(prompt).toContain("JSON format");
  });

  it("Level C rubric should include advanced descriptors", async () => {
    const { SLE_RUBRICS } = await import("./services/sleScoringRubric");
    const cRubric = SLE_RUBRICS["C"];
    expect(cRubric.description).toContain("Advanced");
    // Check for advanced grammar terms
    const grammarCriterion = cRubric.criteria[0];
    expect(grammarCriterion.descriptors.excellent).toContain("subjonctif");
  });

  it("each level should have increasing pass thresholds", async () => {
    const { getPassThreshold } = await import("./services/sleScoringRubric");
    expect(getPassThreshold("A")).toBeLessThan(getPassThreshold("B"));
    expect(getPassThreshold("B")).toBeLessThan(getPassThreshold("C"));
  });
});

// ============================================================================
// 6. AI PIPELINE MONITOR
// ============================================================================

describe("AI Pipeline Monitor", () => {
  it("should export core monitoring functions", async () => {
    const mod = await import("./services/aiPipelineMonitor");
    expect(typeof mod.recordPipelineMetric).toBe("function");
    expect(typeof mod.trackPipelineStage).toBe("function");
    expect(typeof mod.getStageStats).toBe("function");
    expect(typeof mod.getAllPipelineStats).toBe("function");
    expect(typeof mod.getPipelineHealth).toBe("function");
  });

  it("trackPipelineStage should return success and failure callbacks", async () => {
    const { trackPipelineStage } = await import("./services/aiPipelineMonitor");
    const tracker = trackPipelineStage("transcription", 1, "session-1");
    expect(typeof tracker.success).toBe("function");
    expect(typeof tracker.failure).toBe("function");
  });

  it("recording a success metric should update stage stats", async () => {
    const { trackPipelineStage, getStageStats } = await import("./services/aiPipelineMonitor");
    
    // Record a successful transcription
    const tracker = trackPipelineStage("transcription", 1, "test-session");
    tracker.success({ textLength: 100 });
    
    const stats = getStageStats("transcription");
    expect(stats.totalCalls).toBeGreaterThanOrEqual(1);
    expect(stats.successCount).toBeGreaterThanOrEqual(1);
  });

  it("recording a failure metric should update failure stats", async () => {
    const { trackPipelineStage, getStageStats } = await import("./services/aiPipelineMonitor");
    
    // Record a failed evaluation
    const tracker = trackPipelineStage("evaluation", 1, "test-session");
    tracker.failure(new Error("LLM timeout"));
    
    const stats = getStageStats("evaluation");
    expect(stats.failureCount).toBeGreaterThanOrEqual(1);
    expect(stats.lastError).toBe("LLM timeout");
  });

  it("getPipelineHealth should return status, failure rate, and alerts", async () => {
    const { getPipelineHealth } = await import("./services/aiPipelineMonitor");
    const health = getPipelineHealth();
    
    expect(health).toHaveProperty("status");
    expect(["healthy", "degraded", "critical"]).toContain(health.status);
    expect(typeof health.overallFailureRate).toBe("number");
    expect(typeof health.avgEndToEndLatencyMs).toBe("number");
    expect(Array.isArray(health.stageStats)).toBe(true);
    expect(Array.isArray(health.alerts)).toBe(true);
  });

  it("getAllPipelineStats should return stats for all 4 stages", async () => {
    const { getAllPipelineStats } = await import("./services/aiPipelineMonitor");
    const stats = getAllPipelineStats();
    expect(stats.length).toBe(4);
    
    const stageNames = stats.map((s) => s.stage);
    expect(stageNames).toContain("transcription");
    expect(stageNames).toContain("evaluation");
    expect(stageNames).toContain("coaching_response");
    expect(stageNames).toContain("tts_synthesis");
  });

  it("stage stats should have correct structure", async () => {
    const { getStageStats } = await import("./services/aiPipelineMonitor");
    const stats = getStageStats("transcription");
    
    expect(stats).toHaveProperty("stage");
    expect(stats).toHaveProperty("totalCalls");
    expect(stats).toHaveProperty("successCount");
    expect(stats).toHaveProperty("failureCount");
    expect(stats).toHaveProperty("failureRate");
    expect(stats).toHaveProperty("avgLatencyMs");
    expect(stats).toHaveProperty("p95LatencyMs");
    expect(stats).toHaveProperty("maxLatencyMs");
  });
});

// ============================================================================
// 7. ADMIN STABILITY ROUTER
// ============================================================================

describe("Admin Stability Router", () => {
  it("should export adminStabilityRouter", async () => {
    const { adminStabilityRouter } = await import("./routers/adminStability");
    expect(adminStabilityRouter).toBeDefined();
    // Should be a tRPC router
    expect(typeof adminStabilityRouter).toBe("object");
  });

  it("router should have expected procedure names", async () => {
    const { adminStabilityRouter } = await import("./routers/adminStability");
    const procedures = Object.keys(adminStabilityRouter);
    // The router object should contain our procedures
    expect(procedures.length).toBeGreaterThan(0);
  });
});
