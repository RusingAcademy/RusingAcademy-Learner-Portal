/**
 * Voice Routes Registration
 * Registers voice API routes with the Express application
 */

import { Express } from "express";
import voiceRouter from "./voice";

/**
 * Register voice routes with the Express application
 * @param app - Express application instance
 */
export function registerVoiceRoutes(app: Express): void {
  // Register voice API routes at /api/voice
  app.use("/api/voice", voiceRouter);
  
  console.log("[Voice] Voice routes registered at /api/voice");
  console.log("[Voice] Available endpoints:");
  console.log("[Voice]   GET  /api/voice/coaches - List available coaches");
  console.log("[Voice]   POST /api/voice/tts - Text-to-Speech");
  console.log("[Voice]   POST /api/voice/stt - Speech-to-Text");
  console.log("[Voice]   POST /api/voice/conversation - Full conversation");
}
