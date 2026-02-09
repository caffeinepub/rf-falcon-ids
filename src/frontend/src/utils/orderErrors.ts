/**
 * Normalizes backend errors into user-friendly English messages
 */
export function normalizeOrderError(error: any): string {
  if (!error) {
    return 'An unexpected error occurred. Please try again.';
  }

  const errorMessage = error.message || String(error);

  // Banned user errors
  if (
    errorMessage.includes('banned') ||
    errorMessage.includes('Your account has been banned')
  ) {
    return 'Your account has been banned from placing orders. Please contact support.';
  }

  // Unauthorized/authentication errors
  if (
    errorMessage.includes('Unauthorized') ||
    errorMessage.includes('not authenticated') ||
    errorMessage.includes('must be logged in')
  ) {
    return 'You must be logged in to perform this action.';
  }

  // Security/rate limiting errors
  if (
    errorMessage.includes('TREY C SECURITY') ||
    errorMessage.includes('Rate limit') ||
    errorMessage.includes('access denied')
  ) {
    return 'Too many requests. Please wait a moment and try again.';
  }

  // Duplicate ID errors
  if (
    errorMessage.includes('already exists') ||
    errorMessage.includes('duplicate')
  ) {
    return 'Order ID conflict detected. Retrying with a new ID...';
  }

  // Invalid promo code errors
  if (
    errorMessage.includes('invalid promo') ||
    errorMessage.includes('promo code')
  ) {
    return 'The promo code you entered is invalid or has expired.';
  }

  // Network/timeout errors
  if (
    errorMessage.includes('timeout') ||
    errorMessage.includes('timed out') ||
    errorMessage.includes('network') ||
    errorMessage.includes('fetch')
  ) {
    return 'Network error. Please check your connection and try again.';
  }

  // Actor not available
  if (errorMessage.includes('Actor not available')) {
    return 'Service is initializing. Please wait a moment and try again.';
  }

  // Order not found
  if (errorMessage.includes('not found')) {
    return 'The requested order could not be found.';
  }

  // Permission errors
  if (errorMessage.includes('permission') || errorMessage.includes('access')) {
    return 'You do not have permission to perform this action.';
  }

  // Default: return a cleaned version of the error or generic message
  if (errorMessage.length > 0 && errorMessage.length < 200) {
    return errorMessage;
  }

  return 'An error occurred while processing your request. Please try again.';
}
