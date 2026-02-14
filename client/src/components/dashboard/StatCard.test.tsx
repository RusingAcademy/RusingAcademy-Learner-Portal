import { describe, it, expect } from "vitest";

describe("StatCard Component", () => {
  it("should export StatCard component", async () => {
    const { StatCard } = await import("./StatCard");
    expect(StatCard).toBeDefined();
    expect(typeof StatCard).toBe("function");
  });
});

describe("ChartCard Component", () => {
  it("should export ChartCard component", async () => {
    const { ChartCard } = await import("./ChartCard");
    expect(ChartCard).toBeDefined();
    expect(typeof ChartCard).toBe("function");
  });
});

describe("AlertBadge Component", () => {
  it("should export AlertBadge component", async () => {
    const { AlertBadge } = await import("./AlertBadge");
    expect(AlertBadge).toBeDefined();
    expect(typeof AlertBadge).toBe("function");
  });
});

describe("ProgressRing Component", () => {
  it("should export ProgressRing component", async () => {
    const { ProgressRing } = await import("./ProgressRing");
    expect(ProgressRing).toBeDefined();
    expect(typeof ProgressRing).toBe("function");
  });
});

describe("Dashboard Components Index", () => {
  it("should export all dashboard components from index", async () => {
    const dashboardComponents = await import("./index");
    expect(dashboardComponents.StatCard).toBeDefined();
    expect(dashboardComponents.ChartCard).toBeDefined();
    expect(dashboardComponents.AlertBadge).toBeDefined();
    expect(dashboardComponents.ProgressRing).toBeDefined();
  });
});
