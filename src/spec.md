# Specification

## Summary
**Goal:** Replace Internet Identity-based authentication with a native username/password sign-up and sign-in experience, and ensure admin access works under the same system.

**Planned changes:**
- Add username/password account creation (sign up) and sign in UI flows with no email collection or verification.
- Implement backend authentication endpoints for signUp/signIn (and signOut/getSession as needed) that issue and validate session tokens, storing passwords only as salted/hashed representations.
- Replace principal-based authorization with session-token authorization for all user-protected and admin-protected backend operations.
- Update order ownership to associate orders with the authenticated username-based identity; ensure user dashboards and order detail access only show/allow the current user’s orders unless the session is admin.
- Add an admin role flag/concept to accounts and update frontend admin gating and navigation to rely on admin status derived from the session token.
- Update routing and UI copy so the app no longer prompts for Internet Identity anywhere (including AuthGate and landing page “How It Works”), while keeping existing disclaimers/watermark behavior intact.
- Add a conditional upgrade-safe migration (only if needed by current stored layout) so existing stable data upgrades without trapping and legacy orders remain readable via admin listing.

**User-visible outcome:** Users can create an account with a username/password and sign in without Internet Identity or email steps; signed-in users only see their own orders, while admin users can sign in and access the Admin Panel to view/update all orders.
