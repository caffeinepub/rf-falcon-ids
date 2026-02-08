/**
 * HTTPS enforcement utility
 * Redirects HTTP traffic to HTTPS while preserving path, search, and hash
 * Skips enforcement on localhost and development environments
 */

const DEV_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0'];

export function enforceHttps(): void {
  // Only run in browser
  if (typeof window === 'undefined') return;

  const { protocol, hostname, href, pathname, search, hash } = window.location;

  // Skip if already on HTTPS
  if (protocol === 'https:') return;

  // Skip on development hosts
  if (DEV_HOSTS.some(host => hostname.includes(host))) return;

  // Skip on .localhost domains (common in local dev)
  if (hostname.endsWith('.localhost')) return;

  // Redirect to HTTPS with same path/search/hash
  const httpsUrl = `https://${hostname}${pathname}${search}${hash}`;
  window.location.replace(httpsUrl);
}
