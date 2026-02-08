# Specification

## Summary
**Goal:** Harden the application’s security posture by enforcing HTTPS, adding security headers, improving backend protections (rate limiting, input validation, CSRF), and providing friendly error handling pages.

**Planned changes:**
- Add a client-side HTTPS redirect for all routes when loaded over `http:` (preserving path, query, and hash), excluding local development and avoiding redirect loops.
- Configure standard security headers for the frontend asset canister via `frontend/public/.ic-assets.json5`, including HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, and an explicit restrictive CSP compatible with app needs (React load, Internet Identity, fonts/icons).
- Audit backend update methods in `backend/main.mo` and enforce `checkRateLimit(...)` on all state-changing/privileged entrypoints; ensure consistent denial behavior and security event/stat recording when throttled.
- Implement frontend + backend input validation/sanitization (trimming, max lengths, allowed characters where sensible, and structured validation for fields like DOB/ZIP/state/gender/height/IDs) with clear user-facing messages and backend rejection of invalid payloads.
- Add a CSRF token flow: backend issues caller-scoped tokens and requires them on mutating calls from the UI, denying requests with missing/invalid tokens.
- Create friendly TanStack Router not-found (404) and generic error (500) pages that fit the existing layout and provide a recovery navigation option.

**User-visible outcome:** Users are automatically redirected to HTTPS in production, benefit from improved security protections (headers, throttling, validation, CSRF), and see helpful 404/500 pages instead of blank or broken screens.
