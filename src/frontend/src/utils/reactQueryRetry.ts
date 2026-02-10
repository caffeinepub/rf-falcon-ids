/**
 * Centralized retry classification and backoff strategy for React Query.
 * Distinguishes between retriable transient failures and non-retriable errors.
 */

export interface RetryConfig {
  shouldRetry: boolean;
  maxRetries: number;
  delayMs: (attemptIndex: number) => number;
}

/**
 * Classify an error to determine if it should be retried
 */
export function isRetriableError(error: unknown): boolean {
  if (!error) return false;

  const errorMessage = error instanceof Error ? error.message : String(error);

  // Non-retriable errors (fail fast)
  const nonRetriablePatterns = [
    'Unauthorized',
    'permission',
    'BANNED',
    'banned',
    'not found',
    'does not exist',
    'invalid',
    'Configuration Error',
    'not configured',
  ];

  for (const pattern of nonRetriablePatterns) {
    if (errorMessage.includes(pattern)) {
      return false;
    }
  }

  // Retriable errors (transient failures)
  const retriablePatterns = [
    'timed out',
    'timeout',
    'network',
    'fetch',
    'connection',
    'Actor not available',
    'Rate limit exceeded',
    'throttled',
  ];

  for (const pattern of retriablePatterns) {
    if (errorMessage.includes(pattern)) {
      return true;
    }
  }

  // Default: retry for unknown errors (could be transient)
  return true;
}

/**
 * Get retry configuration based on error type
 */
export function getRetryConfig(error: unknown): RetryConfig {
  const shouldRetry = isRetriableError(error);

  return {
    shouldRetry,
    maxRetries: shouldRetry ? 3 : 0,
    delayMs: (attemptIndex: number) => {
      // Exponential backoff: 1s, 2s, 4s (capped at 5s)
      return Math.min(1000 * 2 ** attemptIndex, 5000);
    },
  };
}

/**
 * React Query retry function that uses error classification
 */
export function retryFunction(failureCount: number, error: unknown): boolean {
  const config = getRetryConfig(error);
  return config.shouldRetry && failureCount < config.maxRetries;
}

/**
 * React Query retry delay function with exponential backoff
 */
export function retryDelay(attemptIndex: number, error: unknown): number {
  const config = getRetryConfig(error);
  return config.delayMs(attemptIndex);
}
