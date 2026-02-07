# Specification

## Summary
**Goal:** Improve admin reliability and stability, add a distinct hacker-themed admin UI, and expand admin order management (including order deletion and a correct reset).

**Planned changes:**
- Harden frontend admin detection and gating to eliminate flicker/late rendering, show a clear loading state, and ensure correct redirects (/ → /admin for confirmed admins) and Access Denied behavior for non-admins.
- Add/standardize a reliable backend admin-check query used by the frontend, while keeping server-side authorization for all admin-only methods.
- Implement an admin-only order deletion workflow (backend delete by orderId + frontend delete action with confirmation and immediate list refresh).
- Replace “Reset All Data” with an admin-only backend reset that actually clears persisted order data, keeping the existing confirmation/pending UI aligned with real behavior.
- Apply a distinct hacker/cyber theme for admin routes and admin-only components, separate from the public site theme.
- Add admin panel operational features: search, filter by status, sort by creation time, quick per-order status actions, and basic order summary stats.
- Perform a focused bugfix/stability pass across admin/order management (loading/error handling, cache invalidation, empty/unauthorized states).

**User-visible outcome:** Admins see the admin UI immediately and consistently after login, get a hacker-themed admin area with better controls (search/filter/sort/quick actions/stats), and can delete canceled orders or fully reset stored orders with confirmations and reliable UI updates; non-admins remain blocked from admin data and actions.
