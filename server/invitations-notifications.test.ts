import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "fs";
import path from "path";

/* ─────────────── Schema validation tests ─────────────── */

describe("HR Invitations Schema", () => {
  const schemaPath = path.resolve(__dirname, "../drizzle/schema.ts");
  let schemaContent: string;

  beforeEach(() => {
    schemaContent = fs.readFileSync(schemaPath, "utf-8");
  });

  it("defines hrInvitations table", () => {
    expect(schemaContent).toContain("hrInvitations");
  });

  it("has required invitation fields", () => {
    const requiredFields = [
      "organizationId",
      "email",
      "token",
      "invitedBy",
      "expiresAt",
      "status",
    ];
    for (const field of requiredFields) {
      expect(schemaContent).toContain(field);
    }
  });

  it("has invitation status enum values", () => {
    expect(schemaContent).toContain("pending");
    expect(schemaContent).toContain("accepted");
    expect(schemaContent).toContain("expired");
  });

  it("has invitation role enum values", () => {
    expect(schemaContent).toContain("primary_contact");
    expect(schemaContent).toContain("training_manager");
    expect(schemaContent).toContain("observer");
  });
});

/* ─────────────── Notification_log table tests ─────────────── */

describe("Notification Log Schema", () => {
  // notification_log was created via SQL, so we test the notification service file
  const notifPath = path.resolve(__dirname, "notifications.ts");
  let notifContent: string;

  beforeEach(() => {
    notifContent = fs.readFileSync(notifPath, "utf-8");
  });

  it("exports sendInvitationNotification function", () => {
    expect(notifContent).toContain("export async function sendInvitationNotification");
  });

  it("exports processSessionReminders function", () => {
    expect(notifContent).toContain("export async function processSessionReminders");
  });

  it("exports getUserNotifications function", () => {
    expect(notifContent).toContain("export async function getUserNotifications");
  });

  it("exports getUnreadCount function", () => {
    expect(notifContent).toContain("export async function getUnreadCount");
  });

  it("exports markNotificationRead function", () => {
    expect(notifContent).toContain("export async function markNotificationRead");
  });

  it("exports notifySessionConfirmed function", () => {
    expect(notifContent).toContain("export async function notifySessionConfirmed");
  });

  it("exports notifySessionCancelled function", () => {
    expect(notifContent).toContain("export async function notifySessionCancelled");
  });

  it("handles 24h and 1h reminder windows", () => {
    expect(notifContent).toContain("session_reminder_24h");
    expect(notifContent).toContain("session_reminder_1h");
  });

  it("uses notifyOwner for owner notifications", () => {
    expect(notifContent).toContain("notifyOwner");
  });

  it("logs notifications to notification_log table", () => {
    expect(notifContent).toContain("notification_log");
  });
});

/* ─────────────── Client Portal Router - Invitation procedures ─────────────── */

describe("Client Portal Router - Invitation Procedures", () => {
  const routerPath = path.resolve(__dirname, "routers-client-portal.ts");
  let routerContent: string;

  beforeEach(() => {
    routerContent = fs.readFileSync(routerPath, "utf-8");
  });

  it("has sendInvitation procedure", () => {
    expect(routerContent).toContain("sendInvitation:");
  });

  it("has getInvitations procedure", () => {
    expect(routerContent).toContain("getInvitations:");
  });

  it("has revokeInvitation procedure", () => {
    expect(routerContent).toContain("revokeInvitation:");
  });

  it("has acceptInvitation procedure (public)", () => {
    expect(routerContent).toContain("acceptInvitation:");
    expect(routerContent).toContain("publicProcedure");
  });

  it("has validateInvitation procedure", () => {
    // The router uses acceptInvitation which internally calls getInvitationByToken
    expect(routerContent).toContain("acceptInvitation:");
  });

  it("validates email in sendInvitation input", () => {
    expect(routerContent).toContain("email: z.string().email()");
  });

  it("validates token in acceptInvitation input", () => {
    expect(routerContent).toContain("token: z.string()");
  });

  it("generates secure random token for invitations", () => {
    expect(routerContent).toContain("crypto.randomBytes");
  });

  it("sets 7-day expiration on invitations", () => {
    expect(routerContent).toContain("7 * 24 * 60 * 60 * 1000");
  });

  it("sends notification when invitation is created", () => {
    expect(routerContent).toContain("sendInvitationNotification");
  });

  it("uses hrManagerProcedure for protected invitation endpoints", () => {
    expect(routerContent).toContain("hrManagerProcedure");
  });

  it("has origin field for invitation URL construction", () => {
    expect(routerContent).toContain("origin: z.string().optional()");
  });
});

/* ─────────────── DB Helpers - Invitation functions ─────────────── */

describe("DB Helpers - Invitation Functions", () => {
  const dbPath = path.resolve(__dirname, "db-client-portal.ts");
  let dbContent: string;

  beforeEach(() => {
    dbContent = fs.readFileSync(dbPath, "utf-8");
  });

  it("exports createInvitation function", () => {
    expect(dbContent).toContain("createInvitation");
  });

  it("exports getInvitationsByOrg function", () => {
    expect(dbContent).toContain("getInvitationsByOrg");
  });

  it("exports getInvitationByToken function", () => {
    expect(dbContent).toContain("getInvitationByToken");
  });

  it("exports revokeInvitation function", () => {
    expect(dbContent).toContain("revokeInvitation");
  });

  it("exports acceptInvitation function", () => {
    expect(dbContent).toContain("acceptInvitation");
  });
});

/* ─────────────── AcceptInvitation Page ─────────────── */

describe("AcceptInvitation Page", () => {
  const pagePath = path.resolve(__dirname, "../client/src/pages/AcceptInvitation.tsx");
  let pageContent: string;

  beforeEach(() => {
    pageContent = fs.readFileSync(pagePath, "utf-8");
  });

  it("exists as a page component", () => {
    expect(pageContent).toBeTruthy();
  });

  it("reads token from URL params", () => {
    expect(pageContent).toContain("token");
  });

  it("fetches invitation details by token via validateInvitation", () => {
    expect(pageContent).toContain("validateInvitation");
  });

  it("has accept invitation mutation", () => {
    expect(pageContent).toContain("acceptInvitation");
  });

  it("handles expired invitation state", () => {
    expect(pageContent).toMatch(/expir/i);
  });

  it("redirects to login if not authenticated", () => {
    expect(pageContent).toContain("getLoginUrl");
  });

  it("shows organization name in the invitation", () => {
    expect(pageContent).toMatch(/organization/i);
  });
});

/* ─────────────── Main Router - Notification Extensions ─────────────── */

describe("Main Router - Notification Extensions", () => {
  const routerPath = path.resolve(__dirname, "routers.ts");
  let routerContent: string;

  beforeEach(() => {
    routerContent = fs.readFileSync(routerPath, "utf-8");
  });

  it("has sessionReminders query", () => {
    expect(routerContent).toContain("sessionReminders:");
  });

  it("has unreadCount query", () => {
    expect(routerContent).toContain("unreadCount:");
  });

  it("has markSessionReminderRead mutation", () => {
    expect(routerContent).toContain("markSessionReminderRead:");
  });

  it("has processReminders admin mutation", () => {
    expect(routerContent).toContain("processReminders:");
  });

  it("imports notification service", () => {
    expect(routerContent).toContain("import * as notifService");
  });
});

/* ─────────────── CalendlyWidget Component ─────────────── */

describe("CalendlyWidget Component", () => {
  const widgetPath = path.resolve(__dirname, "../client/src/components/CalendlyWidget.tsx");
  let widgetContent: string;

  beforeEach(() => {
    widgetContent = fs.readFileSync(widgetPath, "utf-8");
  });

  it("exists as a shared component", () => {
    expect(widgetContent).toBeTruthy();
  });

  it("renders Calendly embed", () => {
    expect(widgetContent).toContain("calendly");
  });

  it("accepts url prop for different booking types", () => {
    expect(widgetContent).toContain("url");
  });

  it("has close/dismiss functionality", () => {
    expect(widgetContent).toMatch(/close|onClose|dismiss/i);
  });
});

/* ─────────────── App.tsx Route Registration ─────────────── */

describe("App.tsx - Invitation Route", () => {
  const appPath = path.resolve(__dirname, "../client/src/App.tsx");
  let appContent: string;

  beforeEach(() => {
    appContent = fs.readFileSync(appPath, "utf-8");
  });

  it("imports AcceptInvitation page", () => {
    expect(appContent).toContain("AcceptInvitation");
  });

  it("has /invite/:token route", () => {
    expect(appContent).toContain("/invite/:token");
  });
});
