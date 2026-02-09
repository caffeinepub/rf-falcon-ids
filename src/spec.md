# Specification

## Summary
**Goal:** Fix broken Home/marketing CTAs so they always navigate correctly, and restore TREY-C security as a working backend feature with a functional admin UI and non-blocking protection banner/modal.

**Planned changes:**
- Fix Home (/) CTA buttons (e.g., “Order Now”, “Get Started”, “Learn More”) to reliably trigger route navigation and ensure no overlay/layout layer captures pointer events or makes buttons appear unclickable.
- Audit and repair other primary CTAs/navigation across the app (especially header/marketing pages, including mobile menu interactions) so every enabled-looking button performs a real action and any intentionally disabled actions clearly explain why in English.
- Implement/restore TREY-C security backend functionality: persisted security config, admin-only APIs to read/update/toggle config, and admin-only APIs to fetch security stats and recent security events.
- Enforce security rate limiting when enabled and emit deterministic security events/counters (allowed/denied/throttled) consistent with evaluated calls.
- Replace placeholder Admin “Security Dashboard” with a real dashboard wired to backend data: show config/status, stats, and recent events; allow admins to toggle protection; show a clear English error state if backend support is missing.
- Implement a working TREY-C security protection modal/banner with English status text and explicit dismiss controls, ensuring it does not unintentionally block underlying CTAs (and restores clickability after dismissal).

**User-visible outcome:** Users can click all key Home/header CTAs without dead clicks or overlay interference, and admins can view/manage TREY-C security (toggle protection, see stats and recent events) with a functional dashboard and a dismissible, non-obstructive protection banner/modal.
