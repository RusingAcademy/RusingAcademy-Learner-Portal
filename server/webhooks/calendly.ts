/**
 * Calendly Webhook Handler
 * 
 * Handles webhook events from Calendly to sync bookings with Lingueefy database.
 * Events handled:
 * - invitee.created: New booking made via Calendly
 * - invitee.canceled: Booking cancelled via Calendly
 */

import { Request, Response, Router } from "express";
import { getDb } from "../db";
import { sessions, coachProfiles, users, learnerProfiles } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { sendLearnerConfirmation, sendCoachNotification } from "../email";
import { generateMeetingUrl } from "../video";
import crypto from "crypto";

// Calendly webhook signing key (should be set in environment)
const CALENDLY_WEBHOOK_SECRET = process.env.CALENDLY_WEBHOOK_SECRET || "";

interface CalendlyEvent {
  event: string;
  payload: {
    event_type: {
      uuid: string;
      name: string;
      duration: number;
    };
    event: {
      uuid: string;
      name: string;
      start_time: string;
      end_time: string;
      location?: {
        type: string;
        join_url?: string;
      };
    };
    invitee: {
      uuid: string;
      name: string;
      email: string;
      timezone: string;
      questions_and_answers?: Array<{
        question: string;
        answer: string;
      }>;
    };
    scheduled_event?: {
      uri: string;
    };
  };
}

/**
 * Verify Calendly webhook signature
 */
function verifyCalendlySignature(payload: string, signature: string): boolean {
  if (!CALENDLY_WEBHOOK_SECRET) {
    console.warn("[Calendly Webhook] No webhook secret configured, skipping signature verification");
    return true; // Allow in development without secret
  }

  const expectedSignature = crypto
    .createHmac("sha256", CALENDLY_WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Find coach by Calendly URL
 */
async function findCoachByCalendlyUrl(calendlyEventUri: string): Promise<{
  coachProfile: typeof coachProfiles.$inferSelect;
  coachUser: typeof users.$inferSelect;
} | null> {
  const db = await getDb();
  
  if (!db) {
    return null;
  }
  
  // Extract the Calendly username from the event URI
  const coaches = await db
    .select()
    .from(coachProfiles)
    .where(eq(coachProfiles.calendarType, "calendly"));

  for (const coach of coaches) {
    if (coach.calendlyUrl && calendlyEventUri.includes(coach.calendlyUrl.replace("https://calendly.com/", ""))) {
      const coachUser = await db
        .select()
        .from(users)
        .where(eq(users.id, coach.userId))
        .then(rows => rows[0]);
      
      if (coachUser) {
        return { coachProfile: coach, coachUser };
      }
    }
  }

  return null;
}

/**
 * Find or create learner by email
 */
async function findOrCreateLearner(email: string, name: string): Promise<{
  user: typeof users.$inferSelect;
  learnerProfile: typeof learnerProfiles.$inferSelect | null;
} | null> {
  const db = await getDb();
  
  if (!db) {
    return null;
  }
  
  // Try to find existing user by email
  let user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .then(rows => rows[0]);

  if (!user) {
    // Create a new user for the Calendly booking
    const insertResult = await db
      .insert(users)
      .values({
        email,
        name,
        role: "learner",
        openId: `calendly_${crypto.randomUUID()}`,
      }).$returningId();
    
    const newUserId = insertResult[0]?.id;
    if (!newUserId) {
      return null;
    }
    
    user = await db
      .select()
      .from(users)
      .where(eq(users.id, newUserId))
      .then(rows => rows[0]);
    
    if (!user) {
      return null;
    }
  }

  // Try to find learner profile
  const learnerProfile = await db
    .select()
    .from(learnerProfiles)
    .where(eq(learnerProfiles.userId, user.id))
    .then(rows => rows[0] || null);

  return { user, learnerProfile };
}

/**
 * Handle invitee.created event - new booking made
 */
async function handleInviteeCreated(payload: CalendlyEvent["payload"]) {
  const db = await getDb();
  
  console.log("[Calendly Webhook] Processing invitee.created event");
  console.log("[Calendly Webhook] Invitee:", payload.invitee.name, payload.invitee.email);
  console.log("[Calendly Webhook] Event:", payload.event.name, payload.event.start_time);

  // Find the coach associated with this Calendly event
  const eventUri = payload.scheduled_event?.uri || "";
  const coachData = await findCoachByCalendlyUrl(eventUri);

  if (!coachData) {
    console.error("[Calendly Webhook] Could not find coach for Calendly event:", eventUri);
    return { success: false, error: "Coach not found" };
  }

  const { coachProfile, coachUser } = coachData;

  // Find or create the learner
  const learnerData = await findOrCreateLearner(
    payload.invitee.email,
    payload.invitee.name
  );
  
  if (!learnerData) {
    return { success: false, error: "Could not create learner" };
  }
  
  const { user: learnerUser } = learnerData;

  // Parse session details
  const startTime = new Date(payload.event.start_time);
  const duration = payload.event_type.duration || 60;
  const sessionType = duration <= 30 ? "trial" : "single";
  const price = sessionType === "trial" 
    ? (coachProfile.trialRate || 2500) 
    : (coachProfile.hourlyRate || 5500);

  // Generate meeting link if not provided by Calendly
  const meetingUrl = payload.event.location?.join_url || 
    generateMeetingUrl(0, coachUser.name || "Coach", learnerUser.name || "Learner");

  // Create the session in our database
  if (!db) {
    return { success: false, error: "Database not available" };
  }
  
  const insertResult = await db
    .insert(sessions)
    .values({
      learnerId: learnerUser.id,
      coachId: coachUser.id,
      scheduledAt: startTime,
      duration,
      sessionType: sessionType as "trial" | "single",
      status: "confirmed",
      price,
      meetingUrl,
      learnerNotes: `Booked via Calendly. Event ID: ${payload.event.uuid}`,
      calendlyEventId: payload.event.uuid,
    }).$returningId();
  
  const newSessionId = insertResult[0]?.id;

  console.log("[Calendly Webhook] Created session:", newSessionId);

  // Calculate tax
  const taxAmount = Math.round(price * 0.13);
  const totalAmount = price + taxAmount;

  // Send confirmation emails
  const sessionTime = startTime.toLocaleTimeString("en-CA", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  await sendLearnerConfirmation({
    learnerName: learnerUser.name || payload.invitee.name,
    learnerEmail: learnerUser.email || "",
    coachName: coachUser.name || "Your Coach",
    coachEmail: coachUser.email || "",
    sessionDate: startTime,
    sessionTime,
    sessionType: sessionType as "trial" | "single",
    duration,
    price,
    taxAmount,
    totalAmount,
    meetingUrl,
  });

  await sendCoachNotification({
    learnerName: learnerUser.name || payload.invitee.name,
    learnerEmail: learnerUser.email || "",
    coachName: coachUser.name || "Coach",
    coachEmail: coachUser.email || "",
    sessionDate: startTime,
    sessionTime,
    sessionType: sessionType as "trial" | "single",
    duration,
    price,
    taxAmount,
    totalAmount,
    meetingUrl,
  });

  return { success: true, sessionId: newSessionId };
}

/**
 * Handle invitee.canceled event - booking cancelled
 */
async function handleInviteeCanceled(payload: CalendlyEvent["payload"]) {
  const db = await getDb();
  
  if (!db) {
    return { success: false, error: "Database not available" };
  }
  
  console.log("[Calendly Webhook] Processing invitee.canceled event");
  console.log("[Calendly Webhook] Invitee:", payload.invitee.name, payload.invitee.email);

  // Find the session by Calendly event ID
  const session = await db
    .select()
    .from(sessions)
    .where(eq(sessions.calendlyEventId, payload.event.uuid))
    .then(rows => rows[0]);

  if (!session) {
    console.warn("[Calendly Webhook] Session not found for Calendly event:", payload.event.uuid);
    return { success: false, error: "Session not found" };
  }

  // Update session status to cancelled
  await db
    .update(sessions)
    .set({
      status: "cancelled",
      cancelledBy: "learner",
      cancellationReason: `Cancelled via Calendly at ${new Date().toISOString()}`,
      cancelledAt: new Date(),
    })
    .where(eq(sessions.id, session.id));

  console.log("[Calendly Webhook] Cancelled session:", session.id);

  return { success: true, sessionId: session.id };
}

// Create Express router for Calendly webhooks
const calendlyRouter = Router();

// Main webhook endpoint
calendlyRouter.post("/", async (req: Request, res: Response) => {
  try {
    const rawBody = JSON.stringify(req.body);
    const signature = req.headers["calendly-webhook-signature"] as string || "";

    // Verify signature in production
    if (CALENDLY_WEBHOOK_SECRET && !verifyCalendlySignature(rawBody, signature)) {
      console.error("[Calendly Webhook] Invalid signature");
      return res.status(401).json({ error: "Invalid signature" });
    }

    const event: CalendlyEvent = req.body;
    console.log("[Calendly Webhook] Received event:", event.event);

    let result;
    switch (event.event) {
      case "invitee.created":
        result = await handleInviteeCreated(event.payload);
        break;
      case "invitee.canceled":
        result = await handleInviteeCanceled(event.payload);
        break;
      default:
        console.log("[Calendly Webhook] Unhandled event type:", event.event);
        result = { success: true, message: "Event type not handled" };
    }

    return res.json(result);
  } catch (error) {
    console.error("[Calendly Webhook] Error processing webhook:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default calendlyRouter;
