/**
 * Event Reminder Cron Job
 * 
 * This script sends reminder emails to users registered for events
 * happening in the next 24 hours.
 * 
 * Should be run daily via cron: 0 9 * * * (every day at 9 AM)
 */

import { getDb } from "../db";
import { sendEventReminder } from "../email";
import { and, eq, gte, lte } from "drizzle-orm";

export async function sendEventReminders() {
  console.log("[Event Reminders] Starting reminder job...");
  
  const db = await getDb();
  if (!db) {
    console.error("[Event Reminders] Database not available");
    return { success: false, error: "Database not available" };
  }
  
  const { communityEvents, eventRegistrations, users } = await import("../../drizzle/schema");
  
  // Get events happening in the next 24-48 hours
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const dayAfterTomorrow = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  
  try {
    // Find events starting tomorrow
    const upcomingEvents = await db.select()
      .from(communityEvents)
      .where(and(
        eq(communityEvents.status, "published"),
        gte(communityEvents.startAt, tomorrow),
        lte(communityEvents.startAt, dayAfterTomorrow)
      ));
    
    console.log(`[Event Reminders] Found ${upcomingEvents.length} events starting tomorrow`);
    
    let remindersSent = 0;
    let errors = 0;
    
    for (const event of upcomingEvents) {
      // Get all registered users for this event who haven't received a reminder
      const registrations = await db.select({
        registration: eventRegistrations,
        user: users,
      })
        .from(eventRegistrations)
        .innerJoin(users, eq(eventRegistrations.userId, users.id))
        .where(and(
          eq(eventRegistrations.eventId, event.id),
          eq(eventRegistrations.status, "registered"),
          eq(eventRegistrations.reminderSent, false)
        ));
      
      console.log(`[Event Reminders] Event "${event.title}" has ${registrations.length} registrations to remind`);
      
      for (const { registration, user } of registrations) {
        const userEmail = registration.email || user.email;
        const userName = registration.name || user.name || "Member";
        
        if (!userEmail) {
          console.log(`[Event Reminders] Skipping user ${user.id} - no email`);
          continue;
        }
        
        try {
          await sendEventReminder({
            userName,
            userEmail,
            eventTitle: event.title,
            eventTitleFr: event.titleFr,
            eventDescription: event.description,
            eventDescriptionFr: event.descriptionFr,
            eventDate: event.startAt,
            eventEndDate: event.endAt,
            eventType: event.eventType || "other",
            locationType: event.locationType || "virtual",
            locationDetails: event.locationDetails || undefined,
            meetingUrl: event.meetingUrl || undefined,
            hostName: event.hostName || undefined,
            status: "registered",
          });
          
          // Mark reminder as sent
          await db.update(eventRegistrations)
            .set({ reminderSent: true })
            .where(eq(eventRegistrations.id, registration.id));
          
          remindersSent++;
          console.log(`[Event Reminders] Sent reminder to ${userEmail} for "${event.title}"`);
        } catch (error) {
          errors++;
          console.error(`[Event Reminders] Failed to send reminder to ${userEmail}:`, error);
        }
      }
    }
    
    console.log(`[Event Reminders] Job completed. Sent: ${remindersSent}, Errors: ${errors}`);
    return { success: true, remindersSent, errors };
    
  } catch (error) {
    console.error("[Event Reminders] Job failed:", error);
    return { success: false, error: String(error) };
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  sendEventReminders()
    .then(result => {
      console.log("[Event Reminders] Result:", result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error("[Event Reminders] Fatal error:", error);
      process.exit(1);
    });
}
