/**
 * Bunny Storage Helper
 * Replaces Manus S3 for production file storage on Railway
 * 
 * Storage Zone: rusingacademy-uploads
 * CDN URL: https://rusingacademy-cdn.b-cdn.net
 * Region: New York (NY)
 */

// Environment variables are accessed directly via process.env

// Bunny Storage Configuration
const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE || "rusingacademy-uploads";
const BUNNY_STORAGE_API_KEY = process.env.BUNNY_STORAGE_API_KEY || "";
const BUNNY_STORAGE_HOSTNAME = process.env.BUNNY_STORAGE_HOSTNAME || "ny.storage.bunnycdn.com";
const BUNNY_CDN_URL = process.env.BUNNY_CDN_URL || "https://rusingacademy-cdn.b-cdn.net";

interface BunnyUploadResult {
  success: boolean;
  url: string;
  key: string;
  error?: string;
}

interface BunnyDeleteResult {
  success: boolean;
  error?: string;
}

/**
 * Generate a random suffix for file names to prevent enumeration
 */
function generateRandomSuffix(): string {
  return Math.random().toString(36).substring(2, 10);
}

/**
 * Upload a file to Bunny Storage
 * @param key - The file path/key in storage (e.g., "uploads/user-123/avatar.png")
 * @param data - The file data as Buffer, Uint8Array, or string
 * @param contentType - MIME type of the file (e.g., "image/png")
 * @returns Object with success status, CDN URL, and storage key
 */
export async function bunnyStoragePut(
  key: string,
  data: Buffer | Uint8Array | string,
  contentType?: string
): Promise<BunnyUploadResult> {
  if (!BUNNY_STORAGE_API_KEY) {
    console.error("[BunnyStorage] API key not configured");
    return {
      success: false,
      url: "",
      key: "",
      error: "Bunny Storage API key not configured"
    };
  }

  try {
    // Ensure key doesn't start with /
    const cleanKey = key.startsWith("/") ? key.slice(1) : key;
    
    // Build the upload URL
    const uploadUrl = `https://${BUNNY_STORAGE_HOSTNAME}/${BUNNY_STORAGE_ZONE}/${cleanKey}`;
    
    // Convert data to appropriate format
    let body: BodyInit;
    if (typeof data === "string") {
      body = data;
    } else if (data instanceof Uint8Array) {
      body = new Blob([data as unknown as BlobPart]);
    } else {
      body = new Blob([data as unknown as BlobPart]);
    }

    // Upload to Bunny Storage
    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "AccessKey": BUNNY_STORAGE_API_KEY,
        "Content-Type": contentType || "application/octet-stream",
      },
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[BunnyStorage] Upload failed:", response.status, errorText);
      return {
        success: false,
        url: "",
        key: cleanKey,
        error: `Upload failed: ${response.status} ${errorText}`
      };
    }

    // Return the CDN URL for the uploaded file
    const cdnUrl = `${BUNNY_CDN_URL}/${cleanKey}`;
    
    console.log("[BunnyStorage] Upload successful:", cdnUrl);
    
    return {
      success: true,
      url: cdnUrl,
      key: cleanKey,
    };
  } catch (error) {
    console.error("[BunnyStorage] Upload error:", error);
    return {
      success: false,
      url: "",
      key: "",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Get the CDN URL for a file in Bunny Storage
 * @param key - The file path/key in storage
 * @returns The public CDN URL
 */
export function bunnyStorageGet(key: string): string {
  const cleanKey = key.startsWith("/") ? key.slice(1) : key;
  return `${BUNNY_CDN_URL}/${cleanKey}`;
}

/**
 * Delete a file from Bunny Storage
 * @param key - The file path/key to delete
 * @returns Object with success status
 */
export async function bunnyStorageDelete(key: string): Promise<BunnyDeleteResult> {
  if (!BUNNY_STORAGE_API_KEY) {
    console.error("[BunnyStorage] API key not configured");
    return {
      success: false,
      error: "Bunny Storage API key not configured"
    };
  }

  try {
    const cleanKey = key.startsWith("/") ? key.slice(1) : key;
    const deleteUrl = `https://${BUNNY_STORAGE_HOSTNAME}/${BUNNY_STORAGE_ZONE}/${cleanKey}`;

    const response = await fetch(deleteUrl, {
      method: "DELETE",
      headers: {
        "AccessKey": BUNNY_STORAGE_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[BunnyStorage] Delete failed:", response.status, errorText);
      return {
        success: false,
        error: `Delete failed: ${response.status} ${errorText}`
      };
    }

    console.log("[BunnyStorage] Delete successful:", cleanKey);
    return { success: true };
  } catch (error) {
    console.error("[BunnyStorage] Delete error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * List files in a directory in Bunny Storage
 * @param path - The directory path to list
 * @returns Array of file objects
 */
export async function bunnyStorageList(path: string = ""): Promise<any[]> {
  if (!BUNNY_STORAGE_API_KEY) {
    console.error("[BunnyStorage] API key not configured");
    return [];
  }

  try {
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    const listUrl = `https://${BUNNY_STORAGE_HOSTNAME}/${BUNNY_STORAGE_ZONE}/${cleanPath}/`;

    const response = await fetch(listUrl, {
      method: "GET",
      headers: {
        "AccessKey": BUNNY_STORAGE_API_KEY,
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      console.error("[BunnyStorage] List failed:", response.status);
      return [];
    }

    const files = await response.json();
    return files;
  } catch (error) {
    console.error("[BunnyStorage] List error:", error);
    return [];
  }
}

/**
 * Helper to upload a user file with automatic path generation
 * @param userId - The user's ID
 * @param fileName - Original file name
 * @param data - File data
 * @param contentType - MIME type
 * @returns Upload result with CDN URL
 */
export async function uploadUserFile(
  userId: string | number,
  fileName: string,
  data: Buffer | Uint8Array | string,
  contentType?: string
): Promise<BunnyUploadResult> {
  // Generate a unique key with random suffix to prevent enumeration
  const suffix = generateRandomSuffix();
  const extension = fileName.includes(".") ? fileName.split(".").pop() : "";
  const baseName = fileName.includes(".") ? fileName.split(".").slice(0, -1).join(".") : fileName;
  const key = `users/${userId}/${baseName}-${suffix}${extension ? `.${extension}` : ""}`;
  
  return bunnyStoragePut(key, data, contentType);
}

/**
 * Helper to upload a course asset
 * @param courseId - The course ID
 * @param fileName - Original file name
 * @param data - File data
 * @param contentType - MIME type
 * @returns Upload result with CDN URL
 */
export async function uploadCourseAsset(
  courseId: string | number,
  fileName: string,
  data: Buffer | Uint8Array | string,
  contentType?: string
): Promise<BunnyUploadResult> {
  const suffix = generateRandomSuffix();
  const extension = fileName.includes(".") ? fileName.split(".").pop() : "";
  const baseName = fileName.includes(".") ? fileName.split(".").slice(0, -1).join(".") : fileName;
  const key = `courses/${courseId}/${baseName}-${suffix}${extension ? `.${extension}` : ""}`;
  
  return bunnyStoragePut(key, data, contentType);
}
