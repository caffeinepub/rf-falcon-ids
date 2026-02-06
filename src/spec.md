# Specification

## Summary
**Goal:** Build a ROLEPLAY-only ID ordering and management app with Internet Identity login, a live ID preview with watermark, export/print, persistent order storage, and admin order management.

**Planned changes:**
- Add persistent ROLEPLAY-ONLY / NOT REAL IDENTIFICATION disclaimers across all pages and embed a visible watermark into the ID preview and all exported/printed outputs.
- Implement Internet Identity authentication, with a signed-out landing page and gated access to all authenticated routes/actions; show signed-in state and allow sign out.
- Apply a consistent dark futuristic government/military theme (neon cyan/purple accents, subtle scan-line/glow animations) with full responsive layouts.
- Backend (single Motoko actor): persist orders keyed by user principal; enforce per-user access; provide admin-only access to query all orders and update order status.
- Define the order data model to capture all required ID details, roleplay shipping info, image-only photo field, timestamp, and status (Pending/Approved/Shipped, default Pending).
- Build user dashboard: list signed-in user’s orders and provide navigation to create a new order and view order details.
- Build order form with validation, U.S. state dropdown, photo upload with client-side validation and crop-to-ID-photo ratio, and submission to backend.
- Create a live ID card preview that updates as the user types (name, photo, state + seal, DOB, gender, height, eye color, ID number) with scan-line effect and readability.
- Implement state seal support so selecting a state updates the preview’s state name and seal image with a safe fallback if missing.
- Add Export & Print to generate a PNG of only the ID card and a print view of only the card (including photo, seal, and watermark).
- Add an admin-only panel (allowlisted principals) to view all orders and update status; ensure UI stays in sync using React Query caching/invalidation.
- Add English safety/clarity copy on key screens (order form, preview, export/print) to avoid confusion with real identification.
- Add a simple public landing page introducing the ROLEPLAY-only service and linking to sign in and a high-level overview of the ordering process.

**User-visible outcome:** Signed-out users see a themed landing page with clear ROLEPLAY-only disclaimers and a sign-in CTA; signed-in users can place orders with live ID preview (including watermark), upload/crop a photo, export/print the card, and view their order history/details; admins can view all orders and update order statuses.
