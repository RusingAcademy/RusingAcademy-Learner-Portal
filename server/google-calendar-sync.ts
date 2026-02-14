/**
 * Google Calendar Sync Integration
 * 
 * Syncs CRM meetings with Google Calendar using MCP server
 * Provides availability checking and double-booking prevention
 */

import { getDb } from "./db";
import { crmMeetings, ecosystemLeads, users } from "../drizzle/schema";
import { eq, and, gte, lte, ne } from "drizzle-orm";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Types
interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  attendees?: string[];
}

interface CalendarAvailability {
  available: boolean;
  conflicts: Array<{
    id: string;
    summary: string;
    start: string;
    end: string;
  }>;
}

interface SyncResult {
  success: boolean;
  eventId?: string;
  error?: string;
}

/**
 * Execute MCP command for Google Calendar
 */
async function executeMCPCommand(toolName: string, input: Record<string, any>): Promise<any> {
  try {
    const inputJson = JSON.stringify(input).replace(/'/g, "'\\''");
    const command = `manus-mcp-cli tool call ${toolName} --server google-calendar --input '${inputJson}'`;
    
    const { stdout, stderr } = await execAsync(command, { timeout: 30000 });
    
    if (stderr && !stderr.includes("Tool call result")) {
      console.error("MCP stderr:", stderr);
    }
    
    // Parse the JSON response from stdout
    const jsonMatch = stdout.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return { success: true, raw: stdout };
  } catch (error: any) {
    console.error("MCP command error:", error.message);
    throw new Error(`Google Calendar API error: ${error.message}`);
  }
}

/**
 * Check availability for a specific time slot
 */
export async function checkAvailability(
  startTime: Date,
  endTime: Date,
  calendarId: string = "primary"
): Promise<CalendarAvailability> {
  try {
    // Search for events in the time range
    const result = await executeMCPCommand("google_calendar_search_events", {
      calendar_id: calendarId,
      time_min: startTime.toISOString(),
      time_max: endTime.toISOString(),
      max_results: 50,
    });
    
    const events = result.events || [];
    const conflicts = events.map((event: any) => ({
      id: event.id,
      summary: event.summary || "Busy",
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
    }));
    
    return {
      available: conflicts.length === 0,
      conflicts,
    };
  } catch (error: any) {
    console.error("Error checking availability:", error.message);
    // Return available if we can't check (fail open)
    return { available: true, conflicts: [] };
  }
}

/**
 * Get available time slots for a given date
 */
export async function getAvailableSlots(
  date: Date,
  durationMinutes: number = 30,
  workingHoursStart: number = 9,
  workingHoursEnd: number = 17,
  calendarId: string = "primary"
): Promise<Array<{ start: Date; end: Date }>> {
  const slots: Array<{ start: Date; end: Date }> = [];
  
  // Set up the day boundaries
  const dayStart = new Date(date);
  dayStart.setHours(workingHoursStart, 0, 0, 0);
  
  const dayEnd = new Date(date);
  dayEnd.setHours(workingHoursEnd, 0, 0, 0);
  
  try {
    // Get all events for the day
    const result = await executeMCPCommand("google_calendar_search_events", {
      calendar_id: calendarId,
      time_min: dayStart.toISOString(),
      time_max: dayEnd.toISOString(),
      max_results: 50,
    });
    
    const events = (result.events || []).map((event: any) => ({
      start: new Date(event.start?.dateTime || event.start?.date),
      end: new Date(event.end?.dateTime || event.end?.date),
    })).sort((a: any, b: any) => a.start.getTime() - b.start.getTime());
    
    // Find gaps between events
    let currentTime = dayStart;
    
    for (const event of events) {
      // If there's a gap before this event
      const gapEnd = event.start;
      while (currentTime.getTime() + durationMinutes * 60000 <= gapEnd.getTime()) {
        const slotEnd = new Date(currentTime.getTime() + durationMinutes * 60000);
        slots.push({ start: new Date(currentTime), end: slotEnd });
        currentTime = slotEnd;
      }
      // Move past this event
      if (event.end > currentTime) {
        currentTime = new Date(event.end);
      }
    }
    
    // Check remaining time after last event
    while (currentTime.getTime() + durationMinutes * 60000 <= dayEnd.getTime()) {
      const slotEnd = new Date(currentTime.getTime() + durationMinutes * 60000);
      slots.push({ start: new Date(currentTime), end: slotEnd });
      currentTime = slotEnd;
    }
    
    return slots;
  } catch (error: any) {
    console.error("Error getting available slots:", error.message);
    // Return all slots if we can't check calendar
    let currentTime = dayStart;
    while (currentTime.getTime() + durationMinutes * 60000 <= dayEnd.getTime()) {
      const slotEnd = new Date(currentTime.getTime() + durationMinutes * 60000);
      slots.push({ start: new Date(currentTime), end: slotEnd });
      currentTime = slotEnd;
    }
    return slots;
  }
}

/**
 * Create a Google Calendar event for a CRM meeting
 */
export async function syncMeetingToCalendar(
  meetingId: number,
  calendarId: string = "primary"
): Promise<SyncResult> {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  
  // Get meeting details
  const [meetingData] = await db
    .select({
      meeting: crmMeetings,
      lead: ecosystemLeads,
      organizer: users,
    })
    .from(crmMeetings)
    .innerJoin(ecosystemLeads, eq(crmMeetings.leadId, ecosystemLeads.id))
    .innerJoin(users, eq(crmMeetings.organizerId, users.id))
    .where(eq(crmMeetings.id, meetingId))
    .limit(1);
  
  if (!meetingData) {
    return { success: false, error: "Meeting not found" };
  }
  
  const { meeting, lead, organizer } = meetingData;
  const meetingDate = new Date(meeting.meetingDate);
  const endDate = new Date(meetingDate.getTime() + meeting.durationMinutes * 60000);
  
  // Check for conflicts
  const availability = await checkAvailability(meetingDate, endDate, calendarId);
  if (!availability.available) {
    return {
      success: false,
      error: `Time slot conflicts with: ${availability.conflicts.map(c => c.summary).join(", ")}`,
    };
  }
  
  // Prepare event data
  const eventDescription = [
    `Lead: ${lead.firstName} ${lead.lastName}`,
    `Email: ${lead.email}`,
    lead.phone ? `Phone: ${lead.phone}` : null,
    lead.company ? `Company: ${lead.company}` : null,
    meeting.description ? `\nNotes: ${meeting.description}` : null,
    `\nSource: ${lead.source}`,
    `Lead Score: ${lead.leadScore || 0}`,
  ].filter(Boolean).join("\n");
  
  const event: GoogleCalendarEvent = {
    summary: meeting.title,
    description: eventDescription,
    start_time: meetingDate.toISOString(),
    end_time: endDate.toISOString(),
    location: meeting.meetingType === "video" ? meeting.meetingLink || undefined : undefined,
    attendees: [lead.email],
  };
  
  try {
    const result = await executeMCPCommand("google_calendar_create_events", {
      events: [event],
    });
    
    const eventId = result.events?.[0]?.id || result.id;
    
    // Store the Google Calendar event ID in the meeting record
    if (eventId) {
      await db
        .update(crmMeetings)
        .set({ meetingLink: meeting.meetingLink || `gcal:${eventId}` })
        .where(eq(crmMeetings.id, meetingId));
    }
    
    return { success: true, eventId };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Update a Google Calendar event when meeting is rescheduled
 */
export async function updateCalendarEvent(
  eventId: string,
  updates: Partial<GoogleCalendarEvent>,
  calendarId: string = "primary"
): Promise<SyncResult> {
  try {
    const result = await executeMCPCommand("google_calendar_update_events", {
      calendar_id: calendarId,
      event_id: eventId,
      ...updates,
    });
    
    return { success: true, eventId };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Delete a Google Calendar event when meeting is cancelled
 */
export async function deleteCalendarEvent(
  eventId: string,
  calendarId: string = "primary"
): Promise<SyncResult> {
  try {
    await executeMCPCommand("google_calendar_delete_events", {
      calendar_id: calendarId,
      event_id: eventId,
    });
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get upcoming meetings from Google Calendar
 */
export async function getUpcomingCalendarEvents(
  days: number = 7,
  calendarId: string = "primary"
): Promise<GoogleCalendarEvent[]> {
  const now = new Date();
  const endDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  
  try {
    const result = await executeMCPCommand("google_calendar_search_events", {
      calendar_id: calendarId,
      time_min: now.toISOString(),
      time_max: endDate.toISOString(),
      max_results: 100,
    });
    
    return (result.events || []).map((event: any) => ({
      id: event.id,
      summary: event.summary,
      description: event.description,
      start_time: event.start?.dateTime || event.start?.date,
      end_time: event.end?.dateTime || event.end?.date,
      location: event.location,
      attendees: event.attendees?.map((a: any) => a.email),
    }));
  } catch (error: any) {
    console.error("Error getting upcoming events:", error.message);
    return [];
  }
}

/**
 * Sync all pending CRM meetings to Google Calendar
 */
export async function syncAllMeetingsToCalendar(
  organizerId: number,
  calendarId: string = "primary"
): Promise<{ synced: number; failed: number; errors: string[] }> {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  
  const now = new Date();
  
  // Get all upcoming scheduled meetings for this organizer
  const meetings = await db
    .select()
    .from(crmMeetings)
    .where(
      and(
        eq(crmMeetings.organizerId, organizerId),
        eq(crmMeetings.status, "scheduled"),
        gte(crmMeetings.meetingDate, now)
      )
    );
  
  let synced = 0;
  let failed = 0;
  const errors: string[] = [];
  
  for (const meeting of meetings) {
    const result = await syncMeetingToCalendar(meeting.id, calendarId);
    if (result.success) {
      synced++;
    } else {
      failed++;
      errors.push(`Meeting ${meeting.id}: ${result.error}`);
    }
  }
  
  return { synced, failed, errors };
}
