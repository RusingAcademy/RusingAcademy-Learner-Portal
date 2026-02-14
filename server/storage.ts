// Storage helpers with automatic backend selection
// Uses Bunny Storage in production (Railway) and Manus S3 in development

import { ENV } from './_core/env';
import { bunnyStoragePut, bunnyStorageGet } from './bunnyStorage';

// Check if Bunny Storage is configured (production)
const useBunnyStorage = (): boolean => {
  return !!process.env.BUNNY_STORAGE_API_KEY && process.env.BUNNY_STORAGE_API_KEY.length > 10;
};

type StorageConfig = { baseUrl: string; apiKey: string };

function getStorageConfig(): StorageConfig {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;

  if (!baseUrl || !apiKey) {
    console.error('[Storage] Missing credentials - baseUrl:', !!baseUrl, 'apiKey:', !!apiKey);
    console.error('[Storage] This is expected in development. Bunny Storage will be used in production.');
    throw new Error(
      "Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY. In production, configure Bunny Storage instead."
    );
  }

  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}

function buildUploadUrl(baseUrl: string, relKey: string): URL {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}

async function buildDownloadUrl(
  baseUrl: string,
  relKey: string,
  apiKey: string
): Promise<string> {
  const downloadApiUrl = new URL(
    "v1/storage/downloadUrl",
    ensureTrailingSlash(baseUrl)
  );
  downloadApiUrl.searchParams.set("path", normalizeKey(relKey));
  const response = await fetch(downloadApiUrl, {
    method: "GET",
    headers: buildAuthHeaders(apiKey),
  });
  return (await response.json()).url;
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function toFormData(
  data: Buffer | Uint8Array | string,
  contentType: string,
  fileName: string
): FormData {
  const blob =
    typeof data === "string"
      ? new Blob([data], { type: contentType })
      : new Blob([data as any], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}

function buildAuthHeaders(apiKey: string): HeadersInit {
  return { Authorization: `Bearer ${apiKey}` };
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  // Use Bunny Storage in production (Railway)
  if (useBunnyStorage()) {
    console.log('[Storage] Using Bunny Storage for upload:', relKey);
    const result = await bunnyStoragePut(relKey, data, contentType);
    if (!result.success) {
      throw new Error(`Bunny Storage upload failed: ${result.error}`);
    }
    return { key: result.key, url: result.url };
  }
  
  // Fallback to Manus S3 in development
  console.log('[Storage] Using Manus S3 for upload:', relKey);
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  const uploadUrl = buildUploadUrl(baseUrl, key);
  const formData = toFormData(data, contentType, key.split("/").pop() ?? key);
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: buildAuthHeaders(apiKey),
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `Storage upload failed (${response.status} ${response.statusText}): ${message}`
    );
  }
  const url = (await response.json()).url;
  return { key, url };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string; }> {
  // Use Bunny Storage in production (Railway)
  if (useBunnyStorage()) {
    console.log('[Storage] Using Bunny CDN for get:', relKey);
    const key = normalizeKey(relKey);
    return {
      key,
      url: bunnyStorageGet(relKey),
    };
  }
  
  // Fallback to Manus S3 in development
  console.log('[Storage] Using Manus S3 for get:', relKey);
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  return {
    key,
    url: await buildDownloadUrl(baseUrl, key, apiKey),
  };
}
