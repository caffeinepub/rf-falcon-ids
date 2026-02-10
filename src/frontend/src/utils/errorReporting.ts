/**
 * Centralized error reporting utility that preserves original error context
 * while providing user-friendly messages for display.
 */

export interface ErrorContext {
  operation: string;
  inputs?: Record<string, unknown>;
  timestamp: number;
}

export interface ErrorReport {
  userMessage: string;
  originalError: unknown;
  context: ErrorContext;
}

/**
 * Extract a user-friendly message from an error
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (!error) return 'An unknown error occurred';

  if (error instanceof Error) {
    // Check for specific error patterns
    if (error.message.includes('Unauthorized')) {
      return 'You do not have permission to perform this action';
    }
    if (error.message.includes('timed out')) {
      return 'The request timed out. Please check your connection and try again';
    }
    if (error.message.includes('Actor not available')) {
      return 'Backend connection is not available. Please try again';
    }
    if (error.message.includes('BANNED')) {
      return 'Your account has been restricted from performing this action';
    }
    if (error.message.includes('Rate limit exceeded')) {
      return 'Too many requests. Please wait a moment and try again';
    }

    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
}

/**
 * Log structured error diagnostics to console while preserving all context
 */
export function logErrorWithContext(
  operation: string,
  error: unknown,
  inputs?: Record<string, unknown>
): void {
  const context: ErrorContext = {
    operation,
    inputs,
    timestamp: Date.now(),
  };

  console.error(`[Error] ${operation}:`, {
    context,
    error,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    cause: error instanceof Error ? (error as any).cause : undefined,
  });
}

/**
 * Create an error report with user-friendly message and preserved context
 */
export function createErrorReport(
  operation: string,
  error: unknown,
  inputs?: Record<string, unknown>
): ErrorReport {
  logErrorWithContext(operation, error, inputs);

  return {
    userMessage: getUserFriendlyMessage(error),
    originalError: error,
    context: {
      operation,
      inputs,
      timestamp: Date.now(),
    },
  };
}

/**
 * Wrap an error with context while preserving the original error as cause
 */
export function wrapErrorWithContext(
  operation: string,
  error: unknown,
  inputs?: Record<string, unknown>
): Error {
  logErrorWithContext(operation, error, inputs);

  const userMessage = getUserFriendlyMessage(error);
  const wrappedError = new Error(userMessage);

  // Attach original error as cause if supported
  if (error instanceof Error) {
    (wrappedError as any).cause = error;
  }

  return wrappedError;
}
