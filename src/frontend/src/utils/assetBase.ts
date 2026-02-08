/**
 * Asset base URL utility for CDN support
 * 
 * By default, assets are served from the IC canister (relative paths).
 * Set VITE_ASSET_BASE_URL environment variable to use a CDN.
 * 
 * Example:
 *   export VITE_ASSET_BASE_URL=https://cdn.example.com
 */

const ASSET_BASE_URL = import.meta.env.VITE_ASSET_BASE_URL || '';

/**
 * Get the full URL for a static asset
 * @param path - Relative path to asset (e.g., '/assets/generated/image.webp')
 * @returns Full URL to asset (CDN or IC-relative)
 */
export function getAssetUrl(path: string): string {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // If CDN base is configured, prepend it
  if (ASSET_BASE_URL) {
    // Remove trailing slash from base URL
    const base = ASSET_BASE_URL.replace(/\/$/, '');
    return `${base}${normalizedPath}`;
  }
  
  // Default: IC-relative path
  return normalizedPath;
}
