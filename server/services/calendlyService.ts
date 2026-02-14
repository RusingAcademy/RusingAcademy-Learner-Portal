/**
 * Calendly API Service
 * Handles integration with Calendly for coach scheduling
 */

const CALENDLY_API_BASE = "https://api.calendly.com";

// Types for Calendly API responses
export interface CalendlyAvailableTime {
  status: "available" | "unavailable";
  invitees_remaining: number;
  start_time: string;
  scheduling_url: string;
}

export interface CalendlyEventType {
  uri: string;
  name: string;
  active: boolean;
  slug: string;
  scheduling_url: string;
  duration: number;
  kind: string;
  pooling_type: string | null;
  type: string;
  color: string;
  created_at: string;
  updated_at: string;
  internal_note: string | null;
  description_plain: string | null;
  description_html: string | null;
  profile: {
    type: string;
    name: string;
    owner: string;
  };
  secret: boolean;
  booking_method: string;
  custom_questions: any[];
}

export interface CalendlyUser {
  uri: string;
  name: string;
  slug: string;
  email: string;
  scheduling_url: string;
  timezone: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  current_organization: string;
}

export interface CalendlyEvent {
  uri: string;
  name: string;
  status: "active" | "canceled";
  start_time: string;
  end_time: string;
  event_type: string;
  location: {
    type: string;
    location?: string;
    join_url?: string;
  };
  invitees_counter: {
    total: number;
    active: number;
    limit: number;
  };
  created_at: string;
  updated_at: string;
  event_memberships: Array<{
    user: string;
  }>;
  event_guests: any[];
  meeting_notes_plain: string | null;
  meeting_notes_html: string | null;
}

export class CalendlyService {
  private apiKey: string;
  private userUri: string | null = null;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(CALENDLY_API_BASE + endpoint, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`[Calendly] API error on ${endpoint}:`, error);
      throw new Error(`Calendly API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Initialize the service by fetching current user info
   */
  async initialize(): Promise<CalendlyUser> {
    const response = await this.request<{ resource: CalendlyUser }>("/users/me");
    this.userUri = response.resource.uri;
    return response.resource;
  }

  /**
   * Get available times for an event type
   * @param eventTypeUri - The Calendly event type URI
   * @param startTime - Start of the date range (ISO 8601)
   * @param endTime - End of the date range (ISO 8601, max 7 days from start)
   */
  async getAvailableTimes(
    eventTypeUri: string,
    startTime: string,
    endTime: string
  ): Promise<CalendlyAvailableTime[]> {
    const params = new URLSearchParams({
      event_type: eventTypeUri,
      start_time: startTime,
      end_time: endTime,
    });

    const response = await this.request<{ collection: CalendlyAvailableTime[] }>(
      `/event_type_available_times?${params}`
    );

    return response.collection || [];
  }

  /**
   * Get event types for the current user
   */
  async getEventTypes(): Promise<CalendlyEventType[]> {
    if (!this.userUri) {
      await this.initialize();
    }

    const params = new URLSearchParams({
      user: this.userUri || "",
      active: "true",
    });

    const response = await this.request<{ collection: CalendlyEventType[] }>(
      `/event_types?${params}`
    );

    return response.collection || [];
  }

  /**
   * Get scheduled events for the current user
   * @param minStartTime - Minimum start time filter (ISO 8601)
   * @param maxStartTime - Maximum start time filter (ISO 8601)
   */
  async getScheduledEvents(
    minStartTime?: string,
    maxStartTime?: string
  ): Promise<CalendlyEvent[]> {
    if (!this.userUri) {
      await this.initialize();
    }

    const params = new URLSearchParams({
      user: this.userUri || "",
      status: "active",
    });

    if (minStartTime) {
      params.set("min_start_time", minStartTime);
    }
    if (maxStartTime) {
      params.set("max_start_time", maxStartTime);
    }

    const response = await this.request<{ collection: CalendlyEvent[] }>(
      `/scheduled_events?${params}`
    );

    return response.collection || [];
  }

  /**
   * Get the scheduling URL for the current user
   */
  async getSchedulingUrl(): Promise<string> {
    const user = await this.initialize();
    return user.scheduling_url;
  }

  /**
   * Get user URI
   */
  getUserUri(): string | null {
    return this.userUri;
  }
}

/**
 * Get a Calendly service instance
 * Requires CALENDLY_API_KEY environment variable
 */
export function getCalendlyService(): CalendlyService {
  const apiKey = process.env.CALENDLY_API_KEY;
  if (!apiKey) {
    throw new Error("CALENDLY_API_KEY environment variable is not set");
  }
  return new CalendlyService(apiKey);
}

/**
 * Format available times for display
 * Groups times by date for easier UI rendering
 */
export function formatAvailableTimesForDisplay(
  times: CalendlyAvailableTime[]
): Map<string, CalendlyAvailableTime[]> {
  const grouped = new Map<string, CalendlyAvailableTime[]>();

  for (const time of times) {
    const date = new Date(time.start_time).toISOString().split("T")[0];
    if (!grouped.has(date)) {
      grouped.set(date, []);
    }
    grouped.get(date)!.push(time);
  }

  return grouped;
}

/**
 * Parse Calendly webhook payload
 */
export function parseWebhookPayload(payload: any): {
  event: string;
  createdAt: string;
  scheduledEvent?: CalendlyEvent;
  invitee?: {
    uri: string;
    email: string;
    name: string;
    status: string;
    timezone: string;
    created_at: string;
    updated_at: string;
    canceled: boolean;
    cancellation?: {
      canceled_by: string;
      reason: string;
    };
  };
} {
  return {
    event: payload.event,
    createdAt: payload.created_at,
    scheduledEvent: payload.payload?.scheduled_event,
    invitee: payload.payload?.invitee,
  };
}

/**
 * Check if a coach has Calendly integration configured
 */
export function hasCalendlyIntegration(coach: {
  calendlyEventTypeUri?: string | null;
}): boolean {
  return !!coach.calendlyEventTypeUri;
}

export default CalendlyService;
