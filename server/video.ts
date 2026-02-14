/**
 * Video Meeting Service
 * 
 * Generates unique meeting links for coaching sessions.
 * Currently uses Jitsi Meet (free, no API key required) as the video provider.
 * Can be extended to support Zoom, Google Meet, or other providers.
 */

import { randomBytes } from "crypto";

// Video provider configuration
export type VideoProvider = "jitsi" | "zoom" | "google_meet" | "custom";

interface MeetingConfig {
  provider: VideoProvider;
  roomPrefix: string;
  baseUrl: string;
}

// Default to Jitsi Meet (free, no API key required)
const DEFAULT_CONFIG: MeetingConfig = {
  provider: "jitsi",
  roomPrefix: "lingueefy",
  baseUrl: "https://meet.jit.si",
};

/**
 * Generate a unique meeting room ID
 */
function generateRoomId(): string {
  // Generate a random 8-character alphanumeric string
  const bytes = randomBytes(6);
  return bytes.toString("base64url").slice(0, 8);
}

/**
 * Generate a meeting URL for a session
 */
export function generateMeetingUrl(
  sessionId: number,
  coachName: string,
  learnerName: string,
  config: Partial<MeetingConfig> = {}
): string {
  const { provider, roomPrefix, baseUrl } = { ...DEFAULT_CONFIG, ...config };

  // Create a unique room name combining prefix, session ID, and random string
  const roomId = generateRoomId();
  const sanitizedCoachName = coachName.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10);
  const roomName = `${roomPrefix}-${sanitizedCoachName}-${sessionId}-${roomId}`;

  switch (provider) {
    case "jitsi":
      return `${baseUrl}/${roomName}`;
    
    case "zoom":
      // For Zoom, you would need to integrate with Zoom API
      // This is a placeholder - actual implementation requires Zoom OAuth
      return `https://zoom.us/j/${roomName}`;
    
    case "google_meet":
      // For Google Meet, you would need to integrate with Google Calendar API
      // This is a placeholder - actual implementation requires Google OAuth
      return `https://meet.google.com/${roomName}`;
    
    case "custom":
      return `${baseUrl}/${roomName}`;
    
    default:
      return `${baseUrl}/${roomName}`;
  }
}

/**
 * Generate meeting details including URL and join instructions
 */
export interface MeetingDetails {
  url: string;
  provider: VideoProvider;
  roomName: string;
  joinInstructions: {
    en: string;
    fr: string;
  };
}

export function generateMeetingDetails(
  sessionId: number,
  coachName: string,
  learnerName: string,
  config: Partial<MeetingConfig> = {}
): MeetingDetails {
  const { provider, roomPrefix, baseUrl } = { ...DEFAULT_CONFIG, ...config };
  
  const roomId = generateRoomId();
  const sanitizedCoachName = coachName.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10);
  const roomName = `${roomPrefix}-${sanitizedCoachName}-${sessionId}-${roomId}`;
  
  let url: string;
  let joinInstructions: { en: string; fr: string };

  switch (provider) {
    case "jitsi":
      url = `${baseUrl}/${roomName}`;
      joinInstructions = {
        en: `Click the meeting link to join your session. No account or download required. For best experience, use Chrome or Firefox. Allow camera and microphone access when prompted.`,
        fr: `Cliquez sur le lien de la réunion pour rejoindre votre session. Aucun compte ni téléchargement requis. Pour une meilleure expérience, utilisez Chrome ou Firefox. Autorisez l'accès à la caméra et au microphone lorsque demandé.`,
      };
      break;
    
    case "zoom":
      url = `https://zoom.us/j/${roomName}`;
      joinInstructions = {
        en: `Click the meeting link to join via Zoom. You may need to download the Zoom app if you haven't already.`,
        fr: `Cliquez sur le lien de la réunion pour rejoindre via Zoom. Vous devrez peut-être télécharger l'application Zoom si ce n'est pas déjà fait.`,
      };
      break;
    
    case "google_meet":
      url = `https://meet.google.com/${roomName}`;
      joinInstructions = {
        en: `Click the meeting link to join via Google Meet. You'll need a Google account to join.`,
        fr: `Cliquez sur le lien de la réunion pour rejoindre via Google Meet. Vous aurez besoin d'un compte Google pour participer.`,
      };
      break;
    
    default:
      url = `${baseUrl}/${roomName}`;
      joinInstructions = {
        en: `Click the meeting link to join your session.`,
        fr: `Cliquez sur le lien de la réunion pour rejoindre votre session.`,
      };
  }

  return {
    url,
    provider,
    roomName,
    joinInstructions,
  };
}

/**
 * Validate a meeting URL
 */
export function isValidMeetingUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const validHosts = [
      "meet.jit.si",
      "zoom.us",
      "meet.google.com",
      "teams.microsoft.com",
    ];
    return validHosts.some(host => parsed.hostname.includes(host));
  } catch {
    return false;
  }
}

/**
 * Extract provider from meeting URL
 */
export function getProviderFromUrl(url: string): VideoProvider | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("jit.si")) return "jitsi";
    if (parsed.hostname.includes("zoom.us")) return "zoom";
    if (parsed.hostname.includes("meet.google.com")) return "google_meet";
    return "custom";
  } catch {
    return null;
  }
}
