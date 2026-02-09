/**
 * Wraps a promise with a timeout that rejects if the promise doesn't settle within the specified duration.
 * @param promise The promise to wrap
 * @param timeoutMs Timeout duration in milliseconds (default: 30 seconds)
 * @param timeoutMessage Custom error message for timeout
 * @returns A promise that rejects with a timeout error if the original promise doesn't settle in time
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 30000,
  timeoutMessage: string = 'Request timed out. Please try again.'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
    ),
  ]);
}
