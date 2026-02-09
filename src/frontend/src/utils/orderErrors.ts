/**
 * Normalizes backend errors into user-friendly English messages.
 * Handles common error scenarios: unauthorized, banned, security blocks, rate limiting, duplicate IDs, network errors, and timeouts.
 */
export function normalizeOrderError(error: any): string {
  if (!error) {
    return 'An unknown error occurred. Please try again.';
  }

  const errorMessage = error.message || String(error);

  // Timeout errors
  if (errorMessage.includes('timed out') || errorMessage.includes('timeout')) {
    return 'Request timed out. Please check your connection and try again.';
  }

  // Unauthorized / authentication errors
  if (errorMessage.includes('Unauthorized') || errorMessage.includes('not authenticated')) {
    return 'You must be signed in to place an order. Please sign in and try again.';
  }

  // Banned user errors
  if (errorMessage.includes('banned')) {
    return 'Your account has been banned from placing orders. Please contact support via Snapchat: travis_c1';
  }

  // Security block / rate limiting (including "TREY C SECURITY" style traps)
  if (
    errorMessage.includes('TREY C SECURITY') ||
    errorMessage.includes('Rate limit exceeded') ||
    errorMessage.includes('access denied') ||
    errorMessage.includes('security')
  ) {
    return 'Your request was blocked for security reasons. Please wait a few minutes and try again.';
  }

  // Duplicate order ID
  if (errorMessage.includes('Order ID already exists') || errorMessage.includes('duplicate')) {
    return 'Order ID conflict detected. Please try submitting your order again.';
  }

  // Network errors
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('connection')
  ) {
    return 'Network error. Please check your internet connection and try again.';
  }

  // Actor not available
  if (errorMessage.includes('Actor not available')) {
    return 'Service temporarily unavailable. Please refresh the page and try again.';
  }

  // Validation errors (pass through as-is since they're already user-friendly)
  if (
    errorMessage.includes('required') ||
    errorMessage.includes('invalid') ||
    errorMessage.includes('must be') ||
    errorMessage.includes('cannot be')
  ) {
    return errorMessage;
  }

  // Default fallback
  return errorMessage || 'Failed to create order. Please try again.';
}
