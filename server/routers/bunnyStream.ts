/**
 * Bunny Stream Router
 *
 * tRPC procedures for managing Bunny Stream videos:
 * - List videos from the library (with search/pagination)
 * - Get single video details
 * - Create video placeholder + generate TUS upload credentials
 * - Delete video
 * - Get embed/thumbnail/play URLs
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  createVideo,
  getVideo,
  listVideos,
  deleteVideo,
  updateVideo,
  getEmbedUrl,
  getThumbnailUrl,
  getDirectPlayUrl,
  getHlsUrl,
  getStatusLabel,
  generateTusCredentials,
  type BunnyVideo,
} from "../bunnyStream";

export const bunnyStreamRouter = router({
  /**
   * List videos from the Bunny Stream library.
   * Supports pagination and search.
   */
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        itemsPerPage: z.number().int().min(1).max(100).default(50),
        search: z.string().optional(),
        collection: z.string().optional(),
        orderBy: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const result = await listVideos(input);
      return {
        ...result,
        items: result.items.map(enrichVideo),
      };
    }),

  /**
   * Get a single video by its GUID with enriched URLs.
   */
  get: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .query(async ({ input }) => {
      const video = await getVideo(input.videoId);
      return enrichVideo(video);
    }),

  /**
   * Create a new video placeholder in Bunny Stream.
   * Returns the video object + TUS upload credentials for client-side upload.
   */
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        collectionId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const video = await createVideo(input.title, input.collectionId);
      const tusCredentials = generateTusCredentials(video.guid);

      return {
        video: enrichVideo(video),
        tusCredentials,
      };
    }),

  /**
   * Delete a video from Bunny Stream.
   * Admin-only operation.
   */
  delete: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can delete videos",
        });
      }
      return deleteVideo(input.videoId);
    }),

  /**
   * Update video metadata (title, collection).
   */
  update: protectedProcedure
    .input(
      z.object({
        videoId: z.string(),
        title: z.string().optional(),
        collectionId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { videoId, ...data } = input;
      return updateVideo(videoId, data);
    }),

  /**
   * Get TUS upload credentials for resumable upload.
   * Called after create to get fresh credentials if needed.
   */
  getTusCredentials: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .mutation(({ input }) => {
      return generateTusCredentials(input.videoId);
    }),

  /**
   * Get video URLs (embed, thumbnail, direct play, HLS).
   */
  getUrls: protectedProcedure
    .input(
      z.object({
        videoId: z.string(),
        resolution: z
          .enum(["360p", "480p", "720p", "1080p"])
          .optional()
          .default("720p"),
      })
    )
    .query(({ input }) => {
      return {
        embedUrl: getEmbedUrl(input.videoId),
        thumbnailUrl: getThumbnailUrl(input.videoId),
        directPlayUrl: getDirectPlayUrl(input.videoId, input.resolution),
        hlsUrl: getHlsUrl(input.videoId),
      };
    }),
});

/**
 * Enrich a Bunny video object with computed URLs and status label.
 */
function enrichVideo(video: BunnyVideo) {
  return {
    ...video,
    embedUrl: getEmbedUrl(video.guid),
    thumbnailUrl: getThumbnailUrl(video.guid),
    directPlayUrl: getDirectPlayUrl(video.guid),
    hlsUrl: getHlsUrl(video.guid),
    statusLabel: getStatusLabel(video.status),
  };
}
