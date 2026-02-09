# Specification

## Summary
**Goal:** Ensure Landing page CTAs route signed-in users to the Dashboard instead of the Sign In page.

**Planned changes:**
- Update `frontend/src/pages/LandingPage.tsx` so the "Get Started" CTA navigates authenticated users to `/dashboard`, otherwise to `/signin`.
- Update `frontend/src/pages/LandingPage.tsx` so the "Order Now" CTA navigates authenticated users to `/dashboard`, otherwise to `/signin`.
- Keep navigation using the existing `@tanstack/react-router` approach and avoid changes to immutable auth hook files.

**User-visible outcome:** Signed-in users who click "Get Started" or "Order Now" from the Landing page are taken directly to the Dashboard; signed-out users are taken to Sign In.
