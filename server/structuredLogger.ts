/**
 * Structured Logger
 * 
 * Centralized logging with structured JSON output for production observability.
 * Replaces scattered console.log calls with consistent, parseable log entries.
 * 
 * Each log entry includes:
 * - ISO timestamp
 * - Log level (info, warn, error, debug)
 * - Context (module/subsystem name)
 * - Message
 * - Optional metadata (key-value pairs)
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  metadata?: Record<string, any>;
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Minimum log level (configurable via env)
const MIN_LOG_LEVEL: LogLevel = (process.env.LOG_LEVEL as LogLevel) || "info";

/**
 * Core structured logging function.
 * Outputs JSON-formatted log entries to stdout/stderr.
 */
export function structuredLog(
  level: LogLevel,
  context: string,
  message: string,
  metadata?: Record<string, any>
): void {
  if (LOG_LEVEL_PRIORITY[level] < LOG_LEVEL_PRIORITY[MIN_LOG_LEVEL]) {
    return;
  }

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    context,
    message,
    ...(metadata && Object.keys(metadata).length > 0 ? { metadata } : {}),
  };

  const output = JSON.stringify(entry);

  if (level === "error") {
    console.error(output);
  } else if (level === "warn") {
    console.warn(output);
  } else {
    console.log(output);
  }
}

/**
 * Create a scoped logger for a specific module/context.
 * Reduces boilerplate when logging from the same subsystem.
 */
export function createLogger(context: string) {
  return {
    debug: (message: string, metadata?: Record<string, any>) =>
      structuredLog("debug", context, message, metadata),
    info: (message: string, metadata?: Record<string, any>) =>
      structuredLog("info", context, message, metadata),
    warn: (message: string, metadata?: Record<string, any>) =>
      structuredLog("warn", context, message, metadata),
    error: (message: string, metadata?: Record<string, any>) =>
      structuredLog("error", context, message, metadata),
  };
}

/**
 * Log an error with full stack trace extraction.
 */
export function logError(
  context: string,
  message: string,
  error: unknown,
  additionalMeta?: Record<string, any>
): void {
  const errObj = error instanceof Error ? error : new Error(String(error));
  structuredLog("error", context, message, {
    error: errObj.message,
    stack: errObj.stack?.split("\n").slice(0, 5).join("\n"),
    ...additionalMeta,
  });
}

/**
 * Performance timing helper.
 * Returns a function that, when called, logs the elapsed time.
 */
export function startTimer(context: string, operation: string) {
  const start = Date.now();
  return (metadata?: Record<string, any>) => {
    const durationMs = Date.now() - start;
    structuredLog("info", context, `${operation} completed`, {
      durationMs,
      ...metadata,
    });
    return durationMs;
  };
}
