/**
 * Shared username utilities for consistent normalization and admin checks
 */

const FIXED_ADMIN_USERNAME = 'TravvyC';

/**
 * Normalize username for consistent storage and comparison
 * Preserves exact case as entered by user
 */
export function normalizeUsername(username: string): string {
  return username.trim();
}

/**
 * Check if a username is the fixed admin username
 */
export function isFixedAdminUsername(username: string): boolean {
  return normalizeUsername(username) === FIXED_ADMIN_USERNAME;
}
