# Specification

## Summary
**Goal:** Redesign the public homepage ("/") into a clean, futuristic, user-friendly landing page while keeping existing navigation and Internet Identity authentication behavior intact.

**Planned changes:**
- Update the unauthenticated homepage ("/") layout to a modern landing-page structure with clear hierarchy (hero, supporting sections) and an obvious primary call-to-action.
- Expand the existing LandingPage beyond the current hero + 4-step grid by adding a benefits/features section and a prominent next-step CTA section that routes to "/signin" using existing navigation patterns.
- Apply a consistent clean/futuristic visual theme aligned with the current dark-mode default and Tailwind tokens (cohesive typography, spacing, subtle futuristic accents) while preserving accessibility.
- Add and reference a new static generated hero background image asset from the frontend public assets (no backend serving) and use it as a subtle backdrop in the hero section.

**User-visible outcome:** Unauthenticated visitors see a responsive, English-language futuristic landing page with clear sections and a prominent button that takes them to sign in (and/or sign up) via Internet Identity, while authenticated users continue to be redirected to their dashboard/admin view as before.
