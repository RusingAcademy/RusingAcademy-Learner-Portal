/**
 * Bunny Stream Service
 *
 * Server-side helper for interacting with the Bunny Stream API.
 * Handles video creation, upload (direct + TUS), listing, deletion,
 * and metadata retrieval for the RusingÂcademy video library.
 */

import crypto from "crypto";
import { ENV } from "./_core/env";

const BUNNY_STREAM_BASE = "https://video.bunnycdn.com";

function getHeaders(): Record<string, string> {
  return {
    AccessKey: ENV.bunnyStreamApiKey,
    Accept: "application/json",
  };
}

function getLibraryId(): string {
  return ENV.bunnyStreamLibraryId;
}

function getCdnHostname(): string {
  return ENV.bunnyStreamCdnHostname;
}

// ─── Types ──────────────────────────────────────────────────────────────────

export interface BunnyVideo {
  videoLibraryId: number;
  guid: string;
  title: string;
  dateUploaded: string;
  views: number;
  isPublic: boolean;
  length: number;
  status: number;
  framerate: number;
  width: number;
  height: number;
  outputCodecs: string;
  thumbnailCount: number;
  encodeProgress: number;
  storageSize: number;
  hasMP4Fallback: boolean;
  averageWatchTime: number;
  totalWatchTime: number;
  description: string | null;
  availableResolutions: string | null;
  collectionId: string | null;
  thumbnailFileName: string | null;
  category: string | null;
  captions: Array<{ srclang: string; label: string; version: number }>;
  chapters: Array<{ title: string; start: number; end: number }>;
  moments: Array<{ label: string; timestamp: number }>;
  metaTags: Array<{ property: string; value: string }>;
}

export interface BunnyVideoListResponse {
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  items: BunnyVideo[];
}

export interface TusUploadCredentials {
  videoId: string;
  libraryId: string;
  tusEndpoint: string;
  authorizationSignature: string;
  authorizationExpire: number;
}

// Video status enum for clarity
export const VideoStatus = {
  CREATED: 0,
  UPLOADED: 1,
  PROCESSING: 2,
  TRANSCODING: 3,
  FINISHED: 4,
  ERROR: 5,
  UPLOAD_FAILED: 6,
} as const;

// ─── Core API Methods ───────────────────────────────────────────────────────

/**
 * Create a video placeholder in Bunny Stream.
 * This must be called before uploading the actual video file.
 */
export async function createVideo(
  title: string,
  collectionId?: string
): Promise<BunnyVideo> {
  const libraryId = getLibraryId();
  const body: Record<string, unknown> = { title };
  if (collectionId) body.collectionId = collectionId;

  const res = await fetch(`${BUNNY_STREAM_BASE}/library/${libraryId}/videos`, {
    method: "POST",
    headers: {
      ...getHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Bunny Stream createVideo failed (${res.status}): ${text}`);
  }

  return res.json();
}

/**
 * Upload video file bytes to a previously created video placeholder.
 */
export async function uploadVideo(
  videoId: string,
  fileBuffer: Buffer | Uint8Array
): Promise<{ success: boolean; message: string; statusCode: number }> {
  const libraryId = getLibraryId();

  const res = await fetch(
    `${BUNNY_STREAM_BASE}/library/${libraryId}/videos/${videoId}`,
    {
      method: "PUT",
      headers: {
        ...getHeaders(),
        "Content-Type": "application/octet-stream",
      },
      body: fileBuffer,
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Bunny Stream uploadVideo failed (${res.status}): ${text}`);
  }

  return res.json();
}

/**
 * Generate TUS upload credentials for resumable uploads from the client.
 * The client will use these credentials to upload directly to Bunny Stream
 * using the TUS protocol, which is ideal for large files.
 */
export function generateTusCredentials(videoId: string): TusUploadCredentials {
  const libraryId = getLibraryId();
  const apiKey = ENV.bunnyStreamApiKey;

  // Expiration: 24 hours from now
  const expirationTime = Math.floor(Date.now() / 1000) + 86400;

  // Generate HMAC-SHA256 signature
  const signaturePayload = `${libraryId}${apiKey}${expirationTime}${videoId}`;
  const signature = crypto
    .createHash("sha256")
    .update(signaturePayload)
    .digest("hex");

  return {
    videoId,
    libraryId,
    tusEndpoint: "https://video.bunnycdn.com/tusupload",
    authorizationSignature: signature,
    authorizationExpire: expirationTime,
  };
}

/**
 * Get a single video by its GUID.
 */
export async function getVideo(videoId: string): Promise<BunnyVideo> {
  const libraryId = getLibraryId();

  const res = await fetch(
    `${BUNNY_STREAM_BASE}/library/${libraryId}/videos/${videoId}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Bunny Stream getVideo failed (${res.status}): ${text}`);
  }

  return res.json();
}

/**
 * List videos in the library with pagination and optional search/collection filter.
 */
export async function listVideos(opts?: {
  page?: number;
  itemsPerPage?: number;
  search?: string;
  collection?: string;
  orderBy?: string;
}): Promise<BunnyVideoListResponse> {
  const libraryId = getLibraryId();
  const params = new URLSearchParams();
  params.set("page", String(opts?.page ?? 1));
  params.set("itemsPerPage", String(opts?.itemsPerPage ?? 50));
  if (opts?.search) params.set("search", opts.search);
  if (opts?.collection) params.set("collection", opts.collection);
  if (opts?.orderBy) params.set("orderBy", opts.orderBy);

  const res = await fetch(
    `${BUNNY_STREAM_BASE}/library/${libraryId}/videos?${params.toString()}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Bunny Stream listVideos failed (${res.status}): ${text}`
    );
  }

  return res.json();
}

/**
 * Delete a video from the library.
 */
export async function deleteVideo(
  videoId: string
): Promise<{ success: boolean; message: string; statusCode: number }> {
  const libraryId = getLibraryId();

  const res = await fetch(
    `${BUNNY_STREAM_BASE}/library/${libraryId}/videos/${videoId}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Bunny Stream deleteVideo failed (${res.status}): ${text}`
    );
  }

  return res.json();
}

/**
 * Update video metadata (title, collection, etc.)
 */
export async function updateVideo(
  videoId: string,
  data: { title?: string; collectionId?: string }
): Promise<{ success: boolean; message: string; statusCode: number }> {
  const libraryId = getLibraryId();

  const res = await fetch(
    `${BUNNY_STREAM_BASE}/library/${libraryId}/videos/${videoId}`,
    {
      method: "POST",
      headers: {
        ...getHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Bunny Stream updateVideo failed (${res.status}): ${text}`
    );
  }

  return res.json();
}

/**
 * Fetch a video from a remote URL (Bunny downloads it for you).
 */
export async function fetchVideoFromUrl(
  url: string,
  headers?: Record<string, string>
): Promise<{ success: boolean; message: string; statusCode: number }> {
  const libraryId = getLibraryId();

  const res = await fetch(
    `${BUNNY_STREAM_BASE}/library/${libraryId}/videos/fetch`,
    {
      method: "POST",
      headers: {
        ...getHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url, headers: headers ?? {} }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Bunny Stream fetchVideoFromUrl failed (${res.status}): ${text}`
    );
  }

  return res.json();
}

// ─── URL Helpers ────────────────────────────────────────────────────────────

/**
 * Get the embed URL for a video (iframe player).
 */
export function getEmbedUrl(videoId: string): string {
  const libraryId = getLibraryId();
  return `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}`;
}

/**
 * Get the thumbnail URL for a video.
 */
export function getThumbnailUrl(videoId: string): string {
  const cdn = getCdnHostname();
  return `https://${cdn}/${videoId}/thumbnail.jpg`;
}

/**
 * Get the direct play URL for a specific resolution.
 */
export function getDirectPlayUrl(
  videoId: string,
  resolution: "360p" | "480p" | "720p" | "1080p" = "720p"
): string {
  const cdn = getCdnHostname();
  return `https://${cdn}/${videoId}/play_${resolution}.mp4`;
}

/**
 * Get the HLS playlist URL for adaptive streaming.
 */
export function getHlsUrl(videoId: string): string {
  const cdn = getCdnHostname();
  return `https://${cdn}/${videoId}/playlist.m3u8`;
}

/**
 * Get a human-readable status label from a Bunny video status code.
 */
export function getStatusLabel(status: number): string {
  switch (status) {
    case VideoStatus.CREATED:
      return "Created";
    case VideoStatus.UPLOADED:
      return "Uploaded";
    case VideoStatus.PROCESSING:
      return "Processing";
    case VideoStatus.TRANSCODING:
      return "Transcoding";
    case VideoStatus.FINISHED:
      return "Ready";
    case VideoStatus.ERROR:
      return "Error";
    case VideoStatus.UPLOAD_FAILED:
      return "Upload Failed";
    default:
      return "Unknown";
  }
}
