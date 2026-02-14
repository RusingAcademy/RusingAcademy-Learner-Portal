/**
 * SLE Session State Persistence Service
 *
 * Replaces in-memory Maps with database-backed state persistence.
 * Session state (orchestrator, difficulty, mode) is stored as JSON columns
 * in the sle_companion_sessions table and loaded on demand.
 *
 * This eliminates state loss on Railway restarts/scaling events.
 *
 * @module server/services/sleSessionStateService
 */

import { getDb } from "../db";
import { sleCompanionSessions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import type { SessionState } from "./sleSessionOrchestrator";
import type { DifficultyState } from "./sleAdaptiveRouter";
import type { SessionMode as AdaptiveSessionMode } from "./sleAdaptiveRouter";

// ─── In-Memory Cache (write-through) ──────────────────────────
// We keep a short-lived cache to avoid DB reads on every turn.
// State is always written to DB immediately (write-through).

const orchestratorCache = new Map<number, SessionState>();
const difficultyCache = new Map<number, DifficultyState>();
const modeCache = new Map<number, AdaptiveSessionMode>();

// ─── Public API ───────────────────────────────────────────────

/**
 * Save all session state to the database (write-through).
 * Called after every state mutation (startSession, sendMessage, endSession).
 */
export async function persistSessionState(
  sessionId: number,
  orchestratorState: SessionState | null,
  difficultyState: DifficultyState | null,
  mode: AdaptiveSessionMode | null
): Promise<void> {
  // Update cache
  if (orchestratorState) orchestratorCache.set(sessionId, orchestratorState);
  if (difficultyState) difficultyCache.set(sessionId, difficultyState);
  if (mode) modeCache.set(sessionId, mode);

  // Write to DB
  const db = await getDb();
  if (!db) return;

  try {
    await db
      .update(sleCompanionSessions)
      .set({
        orchestratorState: orchestratorState ? JSON.parse(JSON.stringify(orchestratorState)) : undefined,
        difficultyState: difficultyState ? JSON.parse(JSON.stringify(difficultyState)) : undefined,
        sessionMode: mode ?? undefined,
      })
      .where(eq(sleCompanionSessions.id, sessionId));
  } catch (err) {
    console.error(`[SLE State] Failed to persist state for session ${sessionId}:`, err);
    // Non-fatal: the in-memory cache still holds the state for this request
  }
}

/**
 * Load session state from cache or database.
 * Returns null for each field if not found.
 */
export async function loadSessionState(sessionId: number): Promise<{
  orchestratorState: SessionState | null;
  difficultyState: DifficultyState | null;
  mode: AdaptiveSessionMode | null;
}> {
  // Check cache first
  const cachedOrch = orchestratorCache.get(sessionId);
  const cachedDiff = difficultyCache.get(sessionId);
  const cachedMode = modeCache.get(sessionId);

  if (cachedOrch && cachedDiff && cachedMode) {
    return {
      orchestratorState: cachedOrch,
      difficultyState: cachedDiff,
      mode: cachedMode,
    };
  }

  // Load from DB
  const db = await getDb();
  if (!db) {
    return {
      orchestratorState: cachedOrch ?? null,
      difficultyState: cachedDiff ?? null,
      mode: cachedMode ?? null,
    };
  }

  try {
    const [session] = await db
      .select({
        orchestratorState: sleCompanionSessions.orchestratorState,
        difficultyState: sleCompanionSessions.difficultyState,
        sessionMode: sleCompanionSessions.sessionMode,
      })
      .from(sleCompanionSessions)
      .where(eq(sleCompanionSessions.id, sessionId))
      .limit(1);

    if (!session) {
      return { orchestratorState: null, difficultyState: null, mode: null };
    }

    const orch = (session.orchestratorState as SessionState) ?? null;
    const diff = (session.difficultyState as DifficultyState) ?? null;
    const mode = (session.sessionMode as AdaptiveSessionMode) ?? null;

    // Populate cache
    if (orch) orchestratorCache.set(sessionId, orch);
    if (diff) difficultyCache.set(sessionId, diff);
    if (mode) modeCache.set(sessionId, mode);

    return { orchestratorState: orch, difficultyState: diff, mode };
  } catch (err) {
    console.error(`[SLE State] Failed to load state for session ${sessionId}:`, err);
    return {
      orchestratorState: cachedOrch ?? null,
      difficultyState: cachedDiff ?? null,
      mode: cachedMode ?? null,
    };
  }
}

/**
 * Clear session state from cache and database.
 * Called when a session ends.
 */
export async function clearSessionState(sessionId: number): Promise<void> {
  orchestratorCache.delete(sessionId);
  difficultyCache.delete(sessionId);
  modeCache.delete(sessionId);

  const db = await getDb();
  if (!db) return;

  try {
    await db
      .update(sleCompanionSessions)
      .set({
        orchestratorState: null,
        difficultyState: null,
        sessionMode: null,
      })
      .where(eq(sleCompanionSessions.id, sessionId));
  } catch (err) {
    console.error(`[SLE State] Failed to clear state for session ${sessionId}:`, err);
  }
}
